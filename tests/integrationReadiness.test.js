import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectBackup } from '../src/domain/backupInspection.js';
import { buildDiagnosticReport, buildHandoffAcceptance, evaluateProviderCompatibility } from '../src/domain/diagnostics.js';
import { buildReconciliationReport, compareReconciliation } from '../src/domain/reconciliation.js';
import { REPOSITORY_CONTRACT_VERSION, SCHEMA_VERSION } from '../src/domain/constants.js';

const settings = { activePeriod: 'Q4 2026', evaluationWindow: 'Closed', gracePeriodDays: 3 };
const healthy = { available: true, writable: true, provider: 'local', contractVersion: REPOSITORY_CONTRACT_VERSION, schemaVersion: SCHEMA_VERSION };
const integrity = { ok: true, issues: [] };

test('backup inspection accepts a clean current-format backup', () => {
  const result = inspectBackup({ format:'employee-evaluation-backup', formatVersion:2, schemaVersion:2, employees:[], evaluations:[], settings, activity:[] });
  assert.equal(result.ok, true);
  assert.equal(result.blocked, false);
  assert.equal(result.counts.employees, 0);
});

test('backup inspection blocks future schema versions', () => {
  const result = inspectBackup({ format:'employee-evaluation-backup', formatVersion:2, schemaVersion:99, employees:[], evaluations:[], settings, activity:[] });
  assert.equal(result.blocked, true);
  assert.match(result.errors.join(' '), /newer than supported/i);
});

test('backup inspection catches cross-record integrity problems', () => {
  const employees = [
    { id:'a', employeeCode:'E1', name:'One', email:'same@example.com', role:'employee', active:true },
    { id:'b', employeeCode:'E2', name:'Two', email:'same@example.com', role:'employee', active:true },
  ];
  const result = inspectBackup({ format:'employee-evaluation-backup', formatVersion:2, schemaVersion:2, employees, evaluations:[], settings, activity:[] });
  assert.equal(result.blocked, true);
  assert.match(result.errors.join(' '), /appears 2 times/i);
});

test('provider compatibility requires availability, writability, contract and schema', () => {
  assert.equal(evaluateProviderCompatibility(healthy).compatible, true);
  assert.equal(evaluateProviderCompatibility({ ...healthy, schemaVersion: SCHEMA_VERSION + 1 }).compatible, false);
  assert.equal(evaluateProviderCompatibility({ ...healthy, writable:false }).compatible, false);
});

test('handoff acceptance includes dataset integrity', () => {
  assert.equal(buildHandoffAcceptance({ health:healthy, integrity }).ready, true);
  assert.equal(buildHandoffAcceptance({ health:healthy, integrity:{ ok:false, issues:[{message:'bad'}] } }).ready, false);
});

test('diagnostic report excludes raw employee/evaluation datasets', () => {
  const report = buildDiagnosticReport({ health:healthy, integrity, employees:[{id:'secret',active:true}], evaluations:[{status:'Finalized'}], activity:[{}], settings });
  assert.equal(report.counts.employees, 1);
  assert.equal('employees' in report, false);
  assert.equal('evaluations' in report, false);
  assert.equal(report.handoff.ready, true);
});

test('reconciliation reports compare exact summaries and detect mismatches', () => {
  const base = buildReconciliationReport({ employees:[{id:'e1',active:true,department:'Engineering'}], evaluations:[{status:'Finalized',period:'Q4 2026',recommendation:'Retain',overallScore:4}], settings, activity:[] });
  const same = buildReconciliationReport({ employees:[{id:'e1',active:true,department:'Engineering'}], evaluations:[{status:'Finalized',period:'Q4 2026',recommendation:'Retain',overallScore:4}], settings, activity:[] });
  assert.equal(compareReconciliation(base, same).match, true);
  const changed = buildReconciliationReport({ employees:[{id:'e1',active:true,department:'Engineering'}], evaluations:[], settings, activity:[] });
  const comparison = compareReconciliation(base, changed);
  assert.equal(comparison.match, false);
  assert.ok(comparison.mismatches.some((row) => row.path === 'counts.evaluations'));
});
