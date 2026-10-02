import test from 'node:test';
import assert from 'node:assert/strict';
import { canEvaluateEmployee, canManageEmployees, canReviewEvaluations, canViewEmployeeEvaluation, resolveActor } from '../src/domain/permissions.js';

test('local setup session resolves as administrator', () => {
  const actor = resolveActor('local-system', []);
  assert.equal(actor.role, 'admin');
  assert.equal(canManageEmployees(actor), true);
  assert.equal(canReviewEvaluations(actor), true);
});

test('supervisor can evaluate direct report but not self or unrelated employee', () => {
  const supervisor = { id:'sup', role:'supervisor', active:true };
  assert.equal(canEvaluateEmployee(supervisor, { id:'emp', supervisorId:'sup', active:true }), true);
  assert.equal(canEvaluateEmployee(supervisor, { id:'sup', supervisorId:'other', active:true }), false);
  assert.equal(canEvaluateEmployee(supervisor, { id:'emp2', supervisorId:'other', active:true }), false);
});

test('employee self-view permission is limited to finalized evaluations', () => {
  const employee = { id:'emp', role:'employee', active:true };
  assert.equal(canViewEmployeeEvaluation(employee, { employeeId:'emp', evaluatorId:'sup', status:'Reviewed' }), false);
  assert.equal(canViewEmployeeEvaluation(employee, { employeeId:'emp', evaluatorId:'sup', status:'Finalized' }), true);
});
