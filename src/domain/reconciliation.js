import { RECONCILIATION_FORMAT_VERSION, SCHEMA_VERSION } from './constants.js';
import { inspectIntegrity } from './integrity.js';

const round = (value) => Math.round((Number(value) || 0) * 100) / 100;

export function buildReconciliationReport({ employees = [], evaluations = [], settings = {}, activity = [] } = {}) {
  const statusCounts = groupCounts(evaluations, (row) => row.status || 'Unknown');
  const periodCounts = groupCounts(evaluations, (row) => row.period || 'Unknown');
  const recommendationCounts = groupCounts(evaluations, (row) => row.recommendation || 'Unspecified');
  const departmentCounts = groupCounts(employees, (row) => row.department || 'Unassigned');
  const reportable = evaluations.filter((row) => ['Submitted', 'Reviewed', 'Finalized'].includes(row.status));
  const finalized = evaluations.filter((row) => row.status === 'Finalized');
  const integrity = inspectIntegrity({ employees, evaluations, settings });

  return {
    format: 'employee-evaluation-reconciliation',
    formatVersion: RECONCILIATION_FORMAT_VERSION,
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    activePeriod: settings.activePeriod || '',
    counts: {
      employees: employees.length,
      activeEmployees: employees.filter((row) => row.active !== false).length,
      evaluations: evaluations.length,
      activity: activity.length,
      integrityIssues: integrity.issues.length,
    },
    metrics: {
      reportableAverageScore: average(reportable.map((row) => row.overallScore)),
      finalizedAverageScore: average(finalized.map((row) => row.overallScore)),
    },
    byStatus: statusCounts,
    byPeriod: periodCounts,
    byRecommendation: recommendationCounts,
    byDepartment: departmentCounts,
  };
}

export function compareReconciliation(baseline, current) {
  if (baseline?.format !== 'employee-evaluation-reconciliation') throw new Error('The selected file is not an Employee Evaluation reconciliation report.');
  if (Number(baseline.formatVersion) !== RECONCILIATION_FORMAT_VERSION) throw new Error(`Reconciliation format v${baseline.formatVersion} is not supported.`);
  const mismatches = [];
  compareObject('counts', baseline.counts || {}, current.counts || {}, mismatches);
  compareObject('metrics', baseline.metrics || {}, current.metrics || {}, mismatches, 0.01);
  compareObject('byStatus', baseline.byStatus || {}, current.byStatus || {}, mismatches);
  compareObject('byPeriod', baseline.byPeriod || {}, current.byPeriod || {}, mismatches);
  compareObject('byRecommendation', baseline.byRecommendation || {}, current.byRecommendation || {}, mismatches);
  compareObject('byDepartment', baseline.byDepartment || {}, current.byDepartment || {}, mismatches);
  return { match: mismatches.length === 0, mismatches };
}

function groupCounts(rows, keyFn) {
  return Object.fromEntries([...rows.reduce((map, row) => {
    const key = keyFn(row);
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map())].sort(([a], [b]) => a.localeCompare(b)));
}

function average(values) {
  const numeric = values.map(Number).filter(Number.isFinite);
  return numeric.length ? round(numeric.reduce((sum, value) => sum + value, 0) / numeric.length) : 0;
}

function compareObject(prefix, left, right, mismatches, tolerance = 0) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of [...keys].sort()) {
    const a = left[key] ?? 0;
    const b = right[key] ?? 0;
    const same = typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) <= tolerance : a === b;
    if (!same) mismatches.push({ path: `${prefix}.${key}`, baseline: a, current: b });
  }
}
