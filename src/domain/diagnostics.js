import { APP_VERSION, DIAGNOSTIC_FORMAT_VERSION, REPOSITORY_CONTRACT_VERSION, SCHEMA_VERSION } from './constants.js';

export function evaluateProviderCompatibility(health = {}) {
  const checks = [
    { id: 'available', label: 'Provider available', pass: health.available === true, actual: health.available === true ? 'Yes' : 'No' },
    { id: 'writable', label: 'Provider writable', pass: health.writable === true, actual: health.writable === true ? 'Yes' : 'No' },
    { id: 'contract', label: `Repository Contract v${REPOSITORY_CONTRACT_VERSION}`, pass: Number(health.contractVersion) === REPOSITORY_CONTRACT_VERSION, actual: `v${health.contractVersion ?? '—'}` },
    { id: 'schema', label: `Schema v${SCHEMA_VERSION}`, pass: Number(health.schemaVersion) === SCHEMA_VERSION, actual: `v${health.schemaVersion ?? '—'}` },
  ];
  return { compatible: checks.every((row) => row.pass), checks };
}

export function buildHandoffAcceptance({ health = {}, integrity = { ok: false, issues: [] } } = {}) {
  const provider = evaluateProviderCompatibility(health);
  const checks = [...provider.checks, {
    id: 'integrity', label: 'Dataset integrity', pass: integrity.ok === true, actual: integrity.ok ? 'Healthy' : `${integrity.issues?.length || 0} issue(s)`,
  }];
  return { ready: checks.every((row) => row.pass), checks };
}

export function buildDiagnosticReport({ health = {}, integrity = {}, employees = [], evaluations = [], activity = [], settings = {} } = {}) {
  const acceptance = buildHandoffAcceptance({ health, integrity });
  const statusCounts = evaluations.reduce((acc, row) => {
    acc[row.status || 'Unknown'] = (acc[row.status || 'Unknown'] || 0) + 1;
    return acc;
  }, {});
  return {
    format: 'employee-evaluation-diagnostic',
    formatVersion: DIAGNOSTIC_FORMAT_VERSION,
    generatedAt: new Date().toISOString(),
    applicationVersion: APP_VERSION,
    provider: {
      name: health.provider || 'unknown',
      available: health.available === true,
      writable: health.writable === true,
      contractVersion: health.contractVersion ?? null,
      schemaVersion: health.schemaVersion ?? null,
      migration: health.migration || null,
    },
    settings: {
      activePeriod: settings.activePeriod || '',
      evaluationWindow: settings.evaluationWindow || '',
    },
    counts: {
      employees: employees.length,
      activeEmployees: employees.filter((row) => row.active !== false).length,
      evaluations: evaluations.length,
      activity: activity.length,
      statuses: statusCounts,
      integrityIssues: integrity.issues?.length || 0,
    },
    handoff: acceptance,
  };
}
