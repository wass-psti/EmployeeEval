import { currentPeriod, REPOSITORY_CONTRACT_VERSION, SCHEMA_VERSION } from '../domain/constants.js';
import { calculateOverallScore } from '../domain/scoring.js';
import { validateEmployee, validateEvaluation } from '../domain/validation.js';
import { assertPermission, canEvaluateEmployee, canManageEmployees, canManageSettings, canReviewEvaluations, resolveActor } from '../domain/permissions.js';
import { assertEvaluationWindow, assertReviewTransition, canEvaluatorEditStatus } from '../domain/workflow.js';

const KEYS = {
  employees: 'aps.employee-evaluation.employees.v2',
  evaluations: 'aps.employee-evaluation.evaluations.v2',
  settings: 'aps.employee-evaluation.settings.v2',
  activity: 'aps.employee-evaluation.activity.v2',
  migration: 'aps.employee-evaluation.migration.v2',
};

const LEGACY_KEYS = {
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
  revision: 1,
  schemaVersion: SCHEMA_VERSION,
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
const exists = (key) => localStorage.getItem(key) !== null;
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function migrateEmployee(row) {
  return { ...row, revision: Number(row.revision) || 1, schemaVersion: SCHEMA_VERSION };
}

function migrateEvaluation(row) {
  return { ...row, revision: Number(row.revision) || 1, schemaVersion: SCHEMA_VERSION };
}

function migrateSettings(row = {}) {
  return { ...defaultSettings(), ...row, revision: Number(row.revision) || 1, schemaVersion: SCHEMA_VERSION };
}

function ensureMigrated() {
  if (exists(KEYS.migration)) return read(KEYS.migration, { migrated: false });
  const hasCurrent = [KEYS.employees, KEYS.evaluations, KEYS.settings, KEYS.activity].some(exists);
  if (hasCurrent) {
    const result = { migrated: false, source: 'v2', completedAt: now() };
    write(KEYS.migration, result);
    return result;
  }
  const hasLegacy = Object.values(LEGACY_KEYS).some(exists);
  if (!hasLegacy) {
    const result = { migrated: false, source: 'clean', completedAt: now() };
    write(KEYS.migration, result);
    return result;
  }

  const employees = read(LEGACY_KEYS.employees, []).map(migrateEmployee);
  const evaluations = read(LEGACY_KEYS.evaluations, []).map(migrateEvaluation);
  const settings = migrateSettings(read(LEGACY_KEYS.settings, {}));
  const activityRows = read(LEGACY_KEYS.activity, []).map((row) => ({ ...row, metadata: row.metadata || {}, schemaVersion: SCHEMA_VERSION }));
  write(KEYS.employees, employees);
  write(KEYS.evaluations, evaluations);
  write(KEYS.settings, settings);
  write(KEYS.activity, activityRows);
  const result = { migrated: true, source: 'v1', completedAt: now(), employees: employees.length, evaluations: evaluations.length };
  write(KEYS.migration, result);
  return result;
}

function getEmployees() {
  ensureMigrated();
  return read(KEYS.employees, []);
}

function getEvaluations() {
  ensureMigrated();
  return read(KEYS.evaluations, []);
}

function getSettings() {
  ensureMigrated();
  return migrateSettings(read(KEYS.settings, {}));
}

function actorFor(actorId, employees = getEmployees()) {
  const actor = resolveActor(actorId, employees);
  if (!actor) throw Object.assign(new Error('Current user no longer exists in employee master data.'), { code: 'ACTOR_NOT_FOUND' });
  if (actor.active === false) throw Object.assign(new Error('Inactive users cannot perform this action.'), { code: 'FORBIDDEN' });
  return actor;
}

function assertRevision(expected, actual, entityName = 'record') {
  if (Number(expected) !== Number(actual)) {
    throw Object.assign(new Error(`This ${entityName} was changed by another session. Refresh and reopen it before saving.`), {
      code: 'CONFLICT', expectedRevision: expected, actualRevision: actual,
    });
  }
}

async function activity(action, entityType, entityId, summary, actorId = 'local-system', metadata = {}) {
  ensureMigrated();
  const rows = read(KEYS.activity, []);
  rows.unshift({ id: uid('act'), action, entityType, entityId, summary, actorId, metadata, createdAt: now(), schemaVersion: SCHEMA_VERSION });
  write(KEYS.activity, rows.slice(0, 3000));
}

export const localRepository = {
  async health() {
    const migration = ensureMigrated();
    return {
      available: true,
      writable: true,
      provider: 'local',
      contractVersion: REPOSITORY_CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      migration,
    };
  },

  async listEmployees() { return getEmployees(); },

  async createEmployee(input, actorId) {
    const employees = getEmployees();
    const actor = actorFor(actorId, employees);
    assertPermission(canManageEmployees(actor), 'Only administrators can create employee master data.');
    const employee = {
      ...input,
      id: uid('emp'),
      active: input.active !== false,
      revision: 1,
      createdAt: now(),
      updatedAt: now(),
      schemaVersion: SCHEMA_VERSION,
    };
    const check = validateEmployee(employee, employees);
    if (!check.isValid) throw Object.assign(new Error('Employee validation failed.'), { code: 'VALIDATION_ERROR', details: check.errors });
    employees.push(employee);
    write(KEYS.employees, employees);
    await activity('CREATE', 'employee', employee.id, `Created employee ${employee.name}`, actorId, { employeeCode: employee.employeeCode, role: employee.role, revision: employee.revision });
    return employee;
  },

  async updateEmployee(id, patch, actorId) {
    const employees = getEmployees();
    const actor = actorFor(actorId, employees);
    assertPermission(canManageEmployees(actor), 'Only administrators can update employee master data.');
    const index = employees.findIndex((row) => row.id === id);
    if (index < 0) throw Object.assign(new Error('Employee not found.'), { code: 'NOT_FOUND' });
    const current = employees[index];
    assertRevision(patch.revision, current.revision, 'employee record');
    const updated = { ...current, ...patch, id, revision: current.revision + 1, updatedAt: now(), schemaVersion: SCHEMA_VERSION };
    const check = validateEmployee(updated, employees);
    if (!check.isValid) throw Object.assign(new Error('Employee validation failed.'), { code: 'VALIDATION_ERROR', details: check.errors });
    employees[index] = updated;
    write(KEYS.employees, employees);
    await activity('UPDATE', 'employee', id, `Updated employee ${updated.name}`, actorId, { revision: updated.revision, active: updated.active !== false, role: updated.role });
    return updated;
  },

  async deleteEmployee(id, actorId) {
    const employees = getEmployees();
    const evaluations = getEvaluations();
    const actor = actorFor(actorId, employees);
    assertPermission(canManageEmployees(actor), 'Only administrators can delete employee master data.');
    if (id === actor.id) throw Object.assign(new Error('You cannot delete your own active session record.'), { code: 'IN_USE' });
    const target = employees.find((row) => row.id === id);
    if (!target) throw Object.assign(new Error('Employee not found.'), { code: 'NOT_FOUND' });
    if (evaluations.some((row) => row.employeeId === id || row.evaluatorId === id)) {
      throw Object.assign(new Error('This employee is referenced by evaluation history. Deactivate the employee instead of deleting the record.'), { code: 'IN_USE' });
    }
    if (employees.some((row) => row.supervisorId === id)) {
      throw Object.assign(new Error('This employee is assigned as a supervisor. Reassign direct reports before deletion.'), { code: 'IN_USE' });
    }
    write(KEYS.employees, employees.filter((row) => row.id !== id));
    await activity('DELETE', 'employee', id, `Deleted employee ${target.name}`, actorId, { employeeCode: target.employeeCode });
  },

  async listEvaluations() { return getEvaluations(); },

  async saveEvaluation(input, actorId) {
    const employees = getEmployees();
    const evaluations = getEvaluations();
    const settings = getSettings();
    const actor = actorFor(actorId, employees);
    const target = employees.find((row) => row.id === input.employeeId);
    if (!target) throw Object.assign(new Error('Employee being evaluated no longer exists.'), { code: 'NOT_FOUND' });
    assertPermission(canEvaluateEmployee(actor, target), 'You are not authorized to evaluate this employee.');
    if (input.evaluatorId !== actor.id) throw Object.assign(new Error('The evaluator must match the current user.'), { code: 'FORBIDDEN' });
    if (!['Draft', 'Submitted'].includes(input.status)) throw Object.assign(new Error('Evaluators can only save a Draft or submit an evaluation.'), { code: 'INVALID_TRANSITION' });

    const isDraft = input.status === 'Draft';
    const check = validateEvaluation(input, { allowDraft: isDraft });
    if (!check.isValid) throw Object.assign(new Error('Evaluation validation failed.'), { code: 'VALIDATION_ERROR', details: check.errors });
    const score = calculateOverallScore(input.ratings);

    if (input.id) {
      const index = evaluations.findIndex((row) => row.id === input.id);
      if (index < 0) throw Object.assign(new Error('Evaluation not found.'), { code: 'NOT_FOUND' });
      const current = evaluations[index];
      assertRevision(input.revision, current.revision, 'evaluation');
      if (current.evaluatorId !== actor.id) throw Object.assign(new Error('Only the original evaluator can continue this evaluation.'), { code: 'FORBIDDEN' });
      if (current.employeeId !== input.employeeId || current.period !== input.period) throw Object.assign(new Error('Employee and period cannot be changed after an evaluation is created.'), { code: 'IMMUTABLE_FIELDS' });
      if (!canEvaluatorEditStatus(current.status)) throw Object.assign(new Error('Submitted, reviewed, and finalized evaluations cannot be edited by the evaluator.'), { code: 'IMMUTABLE_EVALUATION' });
      assertEvaluationWindow(settings.evaluationWindow, { isNew: false, currentStatus: current.status });
      const updated = {
        ...current,
        ...input,
        employeeId: current.employeeId,
        evaluatorId: current.evaluatorId,
        period: current.period,
        overallScore: score,
        revision: current.revision + 1,
        submittedAt: input.status === 'Submitted' ? (current.submittedAt || now()) : null,
        returnedAt: current.returnedAt || null,
        updatedAt: now(),
        schemaVersion: SCHEMA_VERSION,
      };
      evaluations[index] = updated;
      write(KEYS.evaluations, evaluations);
      await activity(input.status === 'Submitted' ? 'SUBMIT' : 'UPDATE', 'evaluation', updated.id, `${updated.status} evaluation saved for ${target.name}`, actorId, { fromStatus: current.status, toStatus: updated.status, period: updated.period, score, revision: updated.revision });
      return updated;
    }

    assertEvaluationWindow(settings.evaluationWindow, { isNew: true, currentStatus: null });
    const duplicate = evaluations.find((row) => row.employeeId === input.employeeId && row.period === input.period);
    if (duplicate) throw Object.assign(new Error('An evaluation for this employee and period already exists.'), { code: 'DUPLICATE' });
    const evaluation = {
      ...input,
      id: uid('eval'),
      overallScore: score,
      revision: 1,
      createdAt: now(),
      updatedAt: now(),
      submittedAt: input.status === 'Submitted' ? now() : null,
      reviewedAt: null,
      finalizedAt: null,
      returnedAt: null,
      schemaVersion: SCHEMA_VERSION,
    };
    evaluations.push(evaluation);
    write(KEYS.evaluations, evaluations);
    await activity(input.status === 'Submitted' ? 'SUBMIT' : 'CREATE', 'evaluation', evaluation.id, `${evaluation.status} evaluation created for ${target.name}`, actorId, { period: evaluation.period, score, revision: evaluation.revision });
    return evaluation;
  },

  async reviewEvaluation(id, status, actorId, reviewComment = '', expectedRevision = null) {
    const employees = getEmployees();
    const evaluations = getEvaluations();
    const actor = actorFor(actorId, employees);
    assertPermission(canReviewEvaluations(actor), 'Only administrators can perform management review.');
    const index = evaluations.findIndex((row) => row.id === id);
    if (index < 0) throw Object.assign(new Error('Evaluation not found.'), { code: 'NOT_FOUND' });
    const row = evaluations[index];
    if (expectedRevision !== null && expectedRevision !== undefined) assertRevision(expectedRevision, row.revision, 'evaluation');
    assertReviewTransition(row.status, status);
    if (status === 'Returned' && reviewComment.trim().length < 5) {
      throw Object.assign(new Error('Provide a short reason before returning an evaluation.'), { code: 'VALIDATION_ERROR', details: { reviewComment: 'Return reason must be at least 5 characters.' } });
    }
    const stamp = now();
    const updated = {
      ...row,
      status,
      reviewComment,
      revision: row.revision + 1,
      updatedAt: stamp,
      schemaVersion: SCHEMA_VERSION,
      reviewedBy: status === 'Reviewed' ? actorId : row.reviewedBy || null,
      reviewedAt: status === 'Reviewed' ? stamp : row.reviewedAt || null,
      finalizedBy: status === 'Finalized' ? actorId : row.finalizedBy || null,
      finalizedAt: status === 'Finalized' ? stamp : row.finalizedAt || null,
      returnedBy: status === 'Returned' ? actorId : row.returnedBy || null,
      returnedAt: status === 'Returned' ? stamp : row.returnedAt || null,
    };
    evaluations[index] = updated;
    write(KEYS.evaluations, evaluations);
    await activity('REVIEW', 'evaluation', id, `Evaluation moved ${row.status} → ${status}`, actorId, { fromStatus: row.status, toStatus: status, period: row.period, revision: updated.revision });
    return updated;
  },

  async listActivity() {
    ensureMigrated();
    return read(KEYS.activity, []);
  },

  async getSettings() { return getSettings(); },

  async saveSettings(patch, actorId) {
    const employees = getEmployees();
    const actor = actorFor(actorId, employees);
    assertPermission(canManageSettings(actor), 'Only administrators can change evaluation settings.');
    const current = getSettings();
    const settings = { ...current, ...patch, revision: current.revision + 1, schemaVersion: SCHEMA_VERSION };
    if (!settings.activePeriod?.trim()) throw Object.assign(new Error('Active period is required.'), { code: 'VALIDATION_ERROR' });
    if (!['Open', 'Grace Period', 'Closed'].includes(settings.evaluationWindow)) throw Object.assign(new Error('Invalid evaluation window.'), { code: 'VALIDATION_ERROR' });
    if (settings.gracePeriodDays < 0) throw Object.assign(new Error('Grace period cannot be negative.'), { code: 'VALIDATION_ERROR' });
    write(KEYS.settings, settings);
    await activity('SETTINGS', 'settings', 'global', 'Evaluation settings updated', actorId, { evaluationWindow: settings.evaluationWindow, activePeriod: settings.activePeriod, revision: settings.revision });
    return settings;
  },

  async exportBackup(actorId = 'local-system') {
    const employees = getEmployees();
    const actor = actorFor(actorId, employees);
    assertPermission(canManageSettings(actor), 'Only administrators can export a complete backup.');
    return {
      format: 'employee-evaluation-backup',
      formatVersion: 2,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: now(),
      employees,
      evaluations: getEvaluations(),
      settings: getSettings(),
      activity: await this.listActivity(),
    };
  },

  async importBackup(backup, actorId) {
    const currentEmployees = getEmployees();
    const actor = actorFor(actorId, currentEmployees);
    assertPermission(canManageSettings(actor), 'Only administrators can import a backup.');
    if (backup?.format !== 'employee-evaluation-backup' || ![1, 2].includes(Number(backup?.formatVersion))) throw Object.assign(new Error('Unsupported backup file.'), { code: 'UNSUPPORTED_BACKUP' });
    if (!Array.isArray(backup.employees) || !Array.isArray(backup.evaluations)) throw Object.assign(new Error('Backup is missing required datasets.'), { code: 'INVALID_BACKUP' });
    if (Number(backup.schemaVersion || 1) > SCHEMA_VERSION) throw Object.assign(new Error('This backup was created by a newer Employee Evaluation schema.'), { code: 'UNSUPPORTED_SCHEMA' });

    const employees = backup.employees.map(migrateEmployee);
    const evaluations = backup.evaluations.map(migrateEvaluation);
    const settings = migrateSettings(backup.settings || {});
    const activityRows = (backup.activity || []).map((row) => ({ ...row, metadata: row.metadata || {}, schemaVersion: SCHEMA_VERSION }));

    for (const employee of employees) {
      const check = validateEmployee(employee, employees);
      if (!check.isValid) throw Object.assign(new Error(`Backup employee ${employee.name || employee.id} is invalid.`), { code: 'INVALID_BACKUP', details: check.errors });
    }
    for (const evaluation of evaluations) {
      const check = validateEvaluation(evaluation, { allowDraft: ['Draft', 'Returned'].includes(evaluation.status) });
      if (!check.isValid) throw Object.assign(new Error(`Backup evaluation ${evaluation.id || ''} is invalid.`), { code: 'INVALID_BACKUP', details: check.errors });
    }

    write(KEYS.employees, employees);
    write(KEYS.evaluations, evaluations);
    write(KEYS.settings, settings);
    write(KEYS.activity, activityRows);
    write(KEYS.migration, { migrated: Number(backup.schemaVersion || 1) < SCHEMA_VERSION, source: `backup-v${backup.formatVersion}`, completedAt: now() });
    await activity('IMPORT', 'backup', 'global', 'Backup imported', actorId, { formatVersion: backup.formatVersion, employees: employees.length, evaluations: evaluations.length });
    return true;
  },
};
