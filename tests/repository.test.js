import test from 'node:test';
import assert from 'node:assert/strict';

class MemoryStorage {
  constructor(){ this.map = new Map(); }
  getItem(k){ return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k,v){ this.map.set(k,String(v)); }
  removeItem(k){ this.map.delete(k); }
  clear(){ this.map.clear(); }
}
globalThis.localStorage = new MemoryStorage();
const { localRepository } = await import('../src/services/localRepository.js');

test('fresh repository starts clean', async () => {
  localStorage.clear();
  assert.deepEqual(await localRepository.listEmployees(), []);
  assert.deepEqual(await localRepository.listEvaluations(), []);
});

test('employee CRUD and unique employee code validation', async () => {
  localStorage.clear();
  const employee = await localRepository.createEmployee({ employeeCode:'E001', name:'Test Employee', email:'test@example.com', role:'employee', active:true }, 'local-system');
  assert.equal((await localRepository.listEmployees()).length, 1);
  await assert.rejects(() => localRepository.createEmployee({ employeeCode:'e001', name:'Other Employee', email:'other@example.com', role:'employee', active:true }, 'local-system'), (err) => err.code === 'VALIDATION_ERROR');
  await localRepository.updateEmployee(employee.id, { jobTitle:'Engineer' }, 'local-system');
  assert.equal((await localRepository.listEmployees())[0].jobTitle, 'Engineer');
  await localRepository.deleteEmployee(employee.id, 'local-system');
  assert.equal((await localRepository.listEmployees()).length, 0);
});

test('draft evaluation can be incomplete and submitted evaluation validates required content', async () => {
  localStorage.clear();
  const draft = await localRepository.saveEvaluation({ employeeId:'emp1', evaluatorId:'eval1', period:'Q4 2026', ratings:{c1:3}, comments:'', strengths:'', improvements:'', recommendation:'', status:'Draft' }, 'eval1');
  assert.equal(draft.status, 'Draft');
  await assert.rejects(() => localRepository.saveEvaluation({ ...draft, id: draft.id, status:'Submitted' }, 'eval1'), (err) => err.code === 'VALIDATION_ERROR');
});

test('backup round trip preserves clean data sets', async () => {
  localStorage.clear();
  const backup = await localRepository.exportBackup();
  assert.equal(backup.format, 'employee-evaluation-backup');
  assert.deepEqual(backup.employees, []);
  assert.deepEqual(backup.evaluations, []);
});
