import { currentPeriod, REPOSITORY_CONTRACT_VERSION, SCHEMA_VERSION } from '../domain/constants.js';
import { calculateOverallScore } from '../domain/scoring.js';
import { validateEmployee, validateEvaluation } from '../domain/validation.js';

const KEYS = {
  employees: 'aps.employee-evaluation.employees.v1',
  evaluations: 'aps.employee-evaluation.evaluations.v1',
  settings: 'aps.employee-evaluation.settings.v1',
  activity: 'aps.employee-evaluation.activity.v1',
};

const defaultSettings = () => ({
  activePeriod: currentPeriod(),
  evaluationWindow: 'Closed',
  windowOpenDate: null,
  windowCloseDate: null,
  gracePeriodDays: 3,
});

const now = () => new Date().toISOString();
const uid = (prefix) => `${prefix}_${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

async function activity(action, entityType, entityId, summary, actorId = 'local-system') {
  const rows = read(KEYS.activity, []);
  rows.unshift({ id: uid('act'), action, entityType, entityId, summary, actorId, createdAt: now() });
  write(KEYS.activity, rows.slice(0, 2000));
}

export const localRepository = {
  async health() {
    return { available: true, writable: true, provider: 'local', contractVersion: REPOSITORY_CONTRACT_VERSION, schemaVersion: SCHEMA_VERSION };
  },
  async listEmployees() { return read(KEYS.employees, []); },
  async createEmployee(input, actorId) {
    const employees = read(KEYS.employees, []);
    const employee = { ...input, id: uid('emp'), active: input.active !== false, createdAt: now(), updatedAt: now(), schemaVersion: SCHEMA_VERSION };
    const check = validateEmployee(employee, employees);
    if (!check.isValid) throw Object.assign(new Error('Employee validation failed.'), { code: 'VALIDATION_ERROR', details: check.errors });
    employees.push(employee); write(KEYS.employees, employees);
    await activity('CREATE', 'employee', employee.id, `Created employee ${employee.name}`, actorId);
    return employee;
  },
  async updateEmployee(id, patch, actorId) {
    const employees = read(KEYS.employees, []);
    const index = employees.findIndex((row) => row.id === id);
    if (index < 0) throw Object.assign(new Error('Employee not found.'), { code: 'NOT_FOUND' });
    const updated = { ...employees[index], ...patch, id, updatedAt: now() };
    const check = validateEmployee(updated, employees);
    if (!check.isValid) throw Object.assign(new Error('Employee validation failed.'), { code: 'VALIDATION_ERROR', details: check.errors });
    employees[index] = updated; write(KEYS.employees, employees);
    await activity('UPDATE', 'employee', id, `Updated employee ${updated.name}`, actorId);
    return updated;
  },
  async deleteEmployee(id, actorId) {
    const employees = read(KEYS.employees, []);
    const target = employees.find((row) => row.id === id);
    write(KEYS.employees, employees.filter((row) => row.id !== id));
    await activity('DELETE', 'employee', id, `Deleted employee ${target?.name || id}`, actorId);
  },
  async listEvaluations() { return read(KEYS.evaluations, []); },
  async saveEvaluation(input, actorId) {
    const evaluations = read(KEYS.evaluations, []);
    const isDraft = input.status === 'Draft';
    const check = validateEvaluation(input, { allowDraft: isDraft });
    if (!check.isValid) throw Object.assign(new Error('Evaluation validation failed.'), { code: 'VALIDATION_ERROR', details: check.errors });
    const score = calculateOverallScore(input.ratings);
    if (input.id) {
      const index = evaluations.findIndex((row) => row.id === input.id);
      if (index < 0) throw Object.assign(new Error('Evaluation not found.'), { code: 'NOT_FOUND' });
      const updated = { ...evaluations[index], ...input, overallScore: score, revision: (evaluations[index].revision || 0) + 1, updatedAt: now() };
      evaluations[index] = updated; write(KEYS.evaluations, evaluations);
      await activity('UPDATE', 'evaluation', updated.id, `${updated.status} evaluation updated`, actorId);
      return updated;
    }
    const duplicate = evaluations.find((row) => row.employeeId === input.employeeId && row.period === input.period && row.evaluatorId === input.evaluatorId && !['Returned'].includes(row.status));
    if (duplicate) throw Object.assign(new Error('An evaluation for this employee, evaluator and period already exists.'), { code: 'DUPLICATE' });
    const evaluation = { ...input, id: uid('eval'), overallScore: score, revision: 1, createdAt: now(), updatedAt: now(), submittedAt: input.status === 'Submitted' ? now() : null, schemaVersion: SCHEMA_VERSION };
    evaluations.push(evaluation); write(KEYS.evaluations, evaluations);
    await activity('CREATE', 'evaluation', evaluation.id, `${evaluation.status} evaluation created`, actorId);
    return evaluation;
  },
  async reviewEvaluation(id, status, actorId, reviewComment = '') {
    const allowed = ['Reviewed', 'Finalized', 'Returned'];
    if (!allowed.includes(status)) throw new Error('Invalid review status.');
    const evaluations = read(KEYS.evaluations, []);
    const index = evaluations.findIndex((row) => row.id === id);
    if (index < 0) throw Object.assign(new Error('Evaluation not found.'), { code: 'NOT_FOUND' });
    const row = evaluations[index];
    const updated = { ...row, status, reviewComment, reviewedBy: actorId, reviewedAt: now(), finalizedAt: status === 'Finalized' ? now() : row.finalizedAt || null, revision: (row.revision || 0) + 1, updatedAt: now() };
    evaluations[index] = updated; write(KEYS.evaluations, evaluations);
    await activity('REVIEW', 'evaluation', id, `Evaluation marked ${status}`, actorId);
    return updated;
  },
  async listActivity() { return read(KEYS.activity, []); },
  async getSettings() { return { ...defaultSettings(), ...read(KEYS.settings, {}) }; },
  async saveSettings(patch, actorId) {
    const settings = { ...defaultSettings(), ...read(KEYS.settings, {}), ...patch };
    write(KEYS.settings, settings);
    await activity('SETTINGS', 'settings', 'global', 'Evaluation settings updated', actorId);
    return settings;
  },
  async exportBackup() {
    return {
      format: 'employee-evaluation-backup', formatVersion: 1, schemaVersion: SCHEMA_VERSION, exportedAt: now(),
      employees: read(KEYS.employees, []), evaluations: read(KEYS.evaluations, []), settings: await this.getSettings(), activity: read(KEYS.activity, []),
    };
  },
  async importBackup(backup, actorId) {
    if (backup?.format !== 'employee-evaluation-backup' || backup?.formatVersion !== 1) throw new Error('Unsupported backup file.');
    if (!Array.isArray(backup.employees) || !Array.isArray(backup.evaluations)) throw new Error('Backup is missing required datasets.');
    write(KEYS.employees, backup.employees); write(KEYS.evaluations, backup.evaluations); write(KEYS.settings, backup.settings || defaultSettings()); write(KEYS.activity, backup.activity || []);
    await activity('IMPORT', 'backup', 'global', 'Backup imported', actorId);
    return true;
  },
};
