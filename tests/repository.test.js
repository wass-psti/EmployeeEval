import test from 'node:test';
import assert from 'node:assert/strict';
import { EVALUATION_CRITERIA, SCHEMA_VERSION } from '../src/domain/constants.js';

class MemoryStorage {
  constructor(){ this.map = new Map(); }
  getItem(k){ return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k,v){ this.map.set(k,String(v)); }
  removeItem(k){ this.map.delete(k); }
  clear(){ this.map.clear(); }
}
globalThis.localStorage = new MemoryStorage();
const { localRepository } = await import('../src/services/localRepository.js');

const fullRatings = (value = 4) => Object.fromEntries(EVALUATION_CRITERIA.map((c) => [c.id, value]));
const completeEvaluation = (employeeId, evaluatorId, overrides = {}) => ({
  employeeId, evaluatorId, period: 'Q4 2026', ratings: fullRatings(4),
  comments: 'Consistently delivers strong and dependable work.',
  strengths: 'Reliable technical execution.',
  improvements: 'Continue improving documentation.',
  recommendation: 'Retain', status: 'Submitted', ...overrides,
});

async function createTeam() {
  const supervisor = await localRepository.createEmployee({ employeeCode:'S001', name:'Test Supervisor', email:'supervisor@example.com', role:'supervisor', active:true }, 'local-system');
  const employee = await localRepository.createEmployee({ employeeCode:'E001', name:'Test Employee', email:'employee@example.com', role:'employee', supervisorId: supervisor.id, active:true }, 'local-system');
  return { supervisor, employee };
}

async function openWindow() {
  await localRepository.saveSettings({ evaluationWindow:'Open', activePeriod:'Q4 2026' }, 'local-system');
}

test('fresh repository starts clean on schema v2', async () => {
  localStorage.clear();
  const health = await localRepository.health();
  assert.equal(health.schemaVersion, SCHEMA_VERSION);
  assert.deepEqual(await localRepository.listEmployees(), []);
  assert.deepEqual(await localRepository.listEvaluations(), []);
});

test('admin manages employee data and revisions prevent stale writes', async () => {
  localStorage.clear();
  const employee = await localRepository.createEmployee({ employeeCode:'E001', name:'Test Employee', email:'test@example.com', role:'employee', active:true }, 'local-system');
  assert.equal(employee.revision, 1);
  const updated = await localRepository.updateEmployee(employee.id, { ...employee, jobTitle:'Engineer' }, 'local-system');
  assert.equal(updated.revision, 2);
  await assert.rejects(() => localRepository.updateEmployee(employee.id, { ...employee, jobTitle:'Old Edit' }, 'local-system'), (err) => err.code === 'CONFLICT');
});

test('non-admin cannot manage employee master data', async () => {
  localStorage.clear();
  const { supervisor } = await createTeam();
  await assert.rejects(() => localRepository.createEmployee({ employeeCode:'E002', name:'Blocked', email:'blocked@example.com', role:'employee', active:true }, supervisor.id), (err) => err.code === 'FORBIDDEN');
});

test('employee deletion is blocked when evaluation history references the employee', async () => {
  localStorage.clear();
  const { supervisor, employee } = await createTeam();
  await openWindow();
  await localRepository.saveEvaluation(completeEvaluation(employee.id, supervisor.id, { status:'Draft', ratings:{ c1:3 }, comments:'', strengths:'', improvements:'', recommendation:'' }), supervisor.id);
  await assert.rejects(() => localRepository.deleteEmployee(employee.id, 'local-system'), (err) => err.code === 'IN_USE');
});

test('closed window blocks evaluator mutations and open window allows new drafts', async () => {
  localStorage.clear();
  const { supervisor, employee } = await createTeam();
  const draftInput = completeEvaluation(employee.id, supervisor.id, { status:'Draft', ratings:{ c1:3 }, comments:'', strengths:'', improvements:'', recommendation:'' });
  await assert.rejects(() => localRepository.saveEvaluation(draftInput, supervisor.id), (err) => err.code === 'WINDOW_CLOSED');
  await openWindow();
  const draft = await localRepository.saveEvaluation(draftInput, supervisor.id);
  assert.equal(draft.status, 'Draft');
  assert.equal(draft.revision, 1);
});

test('supervisor can evaluate direct reports but not unrelated employees', async () => {
  localStorage.clear();
  const { supervisor, employee } = await createTeam();
  const other = await localRepository.createEmployee({ employeeCode:'E002', name:'Other Employee', email:'other@example.com', role:'employee', active:true }, 'local-system');
  await openWindow();
  const draft = completeEvaluation(employee.id, supervisor.id, { status:'Draft', ratings:{ c1:3 }, comments:'', strengths:'', improvements:'', recommendation:'' });
  assert.equal((await localRepository.saveEvaluation(draft, supervisor.id)).employeeId, employee.id);
  const blocked = completeEvaluation(other.id, supervisor.id, { period:'Q1 2027', status:'Draft', ratings:{ c1:3 }, comments:'', strengths:'', improvements:'', recommendation:'' });
  await assert.rejects(() => localRepository.saveEvaluation(blocked, supervisor.id), (err) => err.code === 'FORBIDDEN');
});

test('only one evaluation assignment exists per employee and period', async () => {
  localStorage.clear();
  const { supervisor, employee } = await createTeam();
  await openWindow();
  const draft = completeEvaluation(employee.id, supervisor.id, { status:'Draft', ratings:{ c1:3 }, comments:'', strengths:'', improvements:'', recommendation:'' });
  await localRepository.saveEvaluation(draft, supervisor.id);
  await assert.rejects(() => localRepository.saveEvaluation({ ...draft, evaluatorId:'local-system' }, 'local-system'), (err) => err.code === 'DUPLICATE');
});

test('submitted evaluation validates required content', async () => {
  localStorage.clear();
  const { supervisor, employee } = await createTeam();
  await openWindow();
  const draft = await localRepository.saveEvaluation(completeEvaluation(employee.id, supervisor.id, { status:'Draft', ratings:{c1:3}, comments:'', strengths:'', improvements:'', recommendation:'' }), supervisor.id);
  await assert.rejects(() => localRepository.saveEvaluation({ ...draft, status:'Submitted' }, supervisor.id), (err) => err.code === 'VALIDATION_ERROR');
});

test('evaluation revision detects stale evaluator writes', async () => {
  localStorage.clear();
  const { supervisor, employee } = await createTeam();
  await openWindow();
  const draft = await localRepository.saveEvaluation(completeEvaluation(employee.id, supervisor.id, { status:'Draft', ratings:{c1:3}, comments:'', strengths:'', improvements:'', recommendation:'' }), supervisor.id);
  const updated = await localRepository.saveEvaluation({ ...draft, ratings:{ c1:4 }, status:'Draft' }, supervisor.id);
  assert.equal(updated.revision, 2);
  await assert.rejects(() => localRepository.saveEvaluation({ ...draft, ratings:{ c1:2 }, status:'Draft' }, supervisor.id), (err) => err.code === 'CONFLICT');
});

test('review workflow requires Submitted → Reviewed → Finalized', async () => {
  localStorage.clear();
  const { supervisor, employee } = await createTeam();
  await openWindow();
  const submitted = await localRepository.saveEvaluation(completeEvaluation(employee.id, supervisor.id), supervisor.id);
  await assert.rejects(() => localRepository.reviewEvaluation(submitted.id, 'Finalized', 'local-system', '', submitted.revision), (err) => err.code === 'INVALID_TRANSITION');
  const reviewed = await localRepository.reviewEvaluation(submitted.id, 'Reviewed', 'local-system', 'Management reviewed.', submitted.revision);
  assert.equal(reviewed.status, 'Reviewed');
  const finalized = await localRepository.reviewEvaluation(reviewed.id, 'Finalized', 'local-system', 'Approved for release.', reviewed.revision);
  assert.equal(finalized.status, 'Finalized');
  assert.ok(finalized.finalizedAt);
});

test('returning an evaluation requires a reason and permits evaluator rework during grace period', async () => {
  localStorage.clear();
  const { supervisor, employee } = await createTeam();
  await openWindow();
  const submitted = await localRepository.saveEvaluation(completeEvaluation(employee.id, supervisor.id), supervisor.id);
  await assert.rejects(() => localRepository.reviewEvaluation(submitted.id, 'Returned', 'local-system', '', submitted.revision), (err) => err.code === 'VALIDATION_ERROR');
  const returned = await localRepository.reviewEvaluation(submitted.id, 'Returned', 'local-system', 'Please add more specific examples.', submitted.revision);
  await localRepository.saveSettings({ evaluationWindow:'Grace Period' }, 'local-system');
  const resubmitted = await localRepository.saveEvaluation({ ...returned, comments:'Updated comments with more specific performance examples.', status:'Submitted' }, supervisor.id);
  assert.equal(resubmitted.status, 'Submitted');
});

test('non-admin cannot perform management review', async () => {
  localStorage.clear();
  const { supervisor, employee } = await createTeam();
  await openWindow();
  const submitted = await localRepository.saveEvaluation(completeEvaluation(employee.id, supervisor.id), supervisor.id);
  await assert.rejects(() => localRepository.reviewEvaluation(submitted.id, 'Reviewed', supervisor.id, 'Looks good.', submitted.revision), (err) => err.code === 'FORBIDDEN');
});

test('backup v2 round trip preserves current schema', async () => {
  localStorage.clear();
  const backup = await localRepository.exportBackup('local-system');
  assert.equal(backup.formatVersion, 2);
  assert.equal(backup.schemaVersion, 2);
  assert.deepEqual(backup.employees, []);
  assert.deepEqual(backup.evaluations, []);
});

test('legacy v1 local storage automatically migrates to schema v2', async () => {
  localStorage.clear();
  localStorage.setItem('aps.employee-evaluation.employees.v1', JSON.stringify([{ id:'emp_old', employeeCode:'OLD1', name:'Legacy Employee', email:'legacy@example.com', role:'employee', active:true }]));
  localStorage.setItem('aps.employee-evaluation.evaluations.v1', JSON.stringify([]));
  const health = await localRepository.health();
  const employee = (await localRepository.listEmployees())[0];
  assert.equal(health.migration.migrated, true);
  assert.equal(employee.schemaVersion, 2);
  assert.equal(employee.revision, 1);
});
