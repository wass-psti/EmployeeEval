import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectIntegrity } from '../src/domain/integrity.js';

test('integrity check accepts a clean empty workspace with valid settings', () => {
  const result = inspectIntegrity({ employees:[], evaluations:[], settings:{ activePeriod:'Q4 2026', evaluationWindow:'Closed' } });
  assert.equal(result.ok, true);
});

test('integrity check detects duplicate employee codes and duplicate employee-period evaluations', () => {
  const employees = [
    { id:'a', employeeCode:'E1', email:'a@example.com', name:'A', role:'supervisor', active:true },
    { id:'b', employeeCode:'e1', email:'b@example.com', name:'B', role:'employee', supervisorId:'a', active:true },
  ];
  const evaluations = [
    { id:'x', employeeId:'b', evaluatorId:'a', period:'Q4 2026', status:'Draft' },
    { id:'y', employeeId:'b', evaluatorId:'local-system', period:'Q4 2026', status:'Submitted' },
  ];
  const result = inspectIntegrity({ employees, evaluations, settings:{ activePeriod:'Q4 2026', evaluationWindow:'Open' } });
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.type === 'duplicate-code'));
  assert.ok(result.issues.some((issue) => issue.type === 'duplicate-evaluation'));
});
