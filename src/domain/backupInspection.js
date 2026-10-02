import { BACKUP_FORMAT_VERSION, SCHEMA_VERSION } from './constants.js';
import { inspectIntegrity } from './integrity.js';
import { validateEmployee, validateEvaluation } from './validation.js';

export function inspectBackup(backup) {
  const errors = [];
  const warnings = [];
  if (!backup || typeof backup !== 'object') {
    return { ok: false, blocked: true, errors: ['Backup file is not a valid JSON object.'], warnings, counts: emptyCounts() };
  }
  if (backup.format !== 'employee-evaluation-backup') errors.push('The file is not an Employee Evaluation backup.');
  const formatVersion = Number(backup.formatVersion || 1);
  const schemaVersion = Number(backup.schemaVersion || 1);
  if (![1, BACKUP_FORMAT_VERSION].includes(formatVersion)) errors.push(`Backup format v${formatVersion} is not supported.`);
  if (schemaVersion > SCHEMA_VERSION) errors.push(`Backup schema v${schemaVersion} is newer than supported schema v${SCHEMA_VERSION}.`);
  if (!Array.isArray(backup.employees)) errors.push('Employee dataset is missing.');
  if (!Array.isArray(backup.evaluations)) errors.push('Evaluation dataset is missing.');
  if (errors.length) return { ok: false, blocked: true, errors, warnings, formatVersion, schemaVersion, counts: emptyCounts() };

  const employees = backup.employees || [];
  const evaluations = backup.evaluations || [];
  const settings = backup.settings || {};
  const activity = Array.isArray(backup.activity) ? backup.activity : [];

  for (const employee of employees) {
    const result = validateEmployee(employee, employees);
    if (!result.isValid) errors.push(`Employee ${employee.name || employee.id || 'record'} is invalid: ${Object.values(result.errors).join(' ')}`);
  }
  for (const evaluation of evaluations) {
    const result = validateEvaluation(evaluation, { allowDraft: ['Draft', 'Returned'].includes(evaluation.status) });
    if (!result.isValid) errors.push(`Evaluation ${evaluation.id || 'record'} is invalid: ${Object.values(result.errors).join(' ')}`);
  }

  const integrity = inspectIntegrity({ employees, evaluations, settings });
  for (const issue of integrity.issues) errors.push(issue.message);

  if (formatVersion < BACKUP_FORMAT_VERSION) warnings.push(`Backup format v${formatVersion} will be migrated to v${BACKUP_FORMAT_VERSION} during import.`);
  if (schemaVersion < SCHEMA_VERSION) warnings.push(`Backup schema v${schemaVersion} will be migrated to schema v${SCHEMA_VERSION}.`);
  if (!Array.isArray(backup.activity)) warnings.push('Activity history is not present; current activity history will be replaced with an empty set.');

  const statusCounts = evaluations.reduce((acc, row) => {
    acc[row.status || 'Unknown'] = (acc[row.status || 'Unknown'] || 0) + 1;
    return acc;
  }, {});

  return {
    ok: errors.length === 0,
    blocked: errors.length > 0,
    errors,
    warnings,
    formatVersion,
    schemaVersion,
    counts: {
      employees: employees.length,
      activeEmployees: employees.filter((row) => row.active !== false).length,
      evaluations: evaluations.length,
      activity: activity.length,
      ...statusCounts,
    },
    integrity,
  };
}

function emptyCounts() {
  return { employees: 0, activeEmployees: 0, evaluations: 0, activity: 0 };
}
