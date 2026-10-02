import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReviewQueue, summarizeReviewQueue, waitingDays } from '../src/domain/reviewQueue.js';

const NOW = Date.parse('2026-10-02T00:00:00Z');
const employees = [
  { id:'e1', employeeCode:'E001', name:'Ana Cruz', department:'Engineering' },
  { id:'e2', employeeCode:'E002', name:'Ben Go', department:'Sales' },
  { id:'s1', employeeCode:'S001', name:'Supervisor One', department:'Engineering' },
];
const evaluations = [
  { id:'a', employeeId:'e1', evaluatorId:'s1', period:'Q3 2026', status:'Submitted', recommendation:'Retain', overallScore:4.2, submittedAt:'2026-09-24T00:00:00Z' },
  { id:'b', employeeId:'e2', evaluatorId:'s1', period:'Q3 2026', status:'Reviewed', recommendation:'Develop', overallScore:3.1, submittedAt:'2026-09-30T00:00:00Z' },
  { id:'c', employeeId:'e1', evaluatorId:'s1', period:'Q2 2026', status:'Finalized', recommendation:'Retain', overallScore:4.4, submittedAt:'2026-08-01T00:00:00Z' },
];

test('waitingDays returns whole non-negative days', () => {
  assert.equal(waitingDays(evaluations[0], NOW), 8);
  assert.equal(waitingDays({ submittedAt:'2026-10-03T00:00:00Z' }, NOW), 0);
});

test('review queue includes only Submitted and Reviewed evaluations', () => {
  const rows = buildReviewQueue({ evaluations, employees, now:NOW });
  assert.deepEqual(rows.map((row)=>row.id), ['a','b']);
});

test('review queue filters by department and aging threshold', () => {
  const rows = buildReviewQueue({ evaluations, employees, department:'Engineering', aging:'7', now:NOW });
  assert.deepEqual(rows.map((row)=>row.id), ['a']);
});

test('review queue search includes employee code and evaluator', () => {
  assert.equal(buildReviewQueue({ evaluations, employees, search:'E002', now:NOW }).length, 1);
  assert.equal(buildReviewQueue({ evaluations, employees, search:'supervisor one', now:NOW }).length, 2);
});

test('review queue can sort by score', () => {
  assert.deepEqual(buildReviewQueue({ evaluations, employees, sort:'lowest-score', now:NOW }).map((row)=>row.id), ['b','a']);
  assert.deepEqual(buildReviewQueue({ evaluations, employees, sort:'highest-score', now:NOW }).map((row)=>row.id), ['a','b']);
});

test('review queue summary exposes aging workload', () => {
  const rows = buildReviewQueue({ evaluations, employees, now:NOW });
  const summary = summarizeReviewQueue(rows, NOW);
  assert.equal(summary.total, 2);
  assert.equal(summary.threePlus, 1);
  assert.equal(summary.sevenPlus, 1);
  assert.equal(summary.averageWait, 5);
});
