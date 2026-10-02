import test from 'node:test';
import assert from 'node:assert/strict';
import { buildManagementReport } from '../src/domain/reporting.js';
import { EVALUATION_CRITERIA } from '../src/domain/constants.js';

const ratings = (value) => Object.fromEntries(EVALUATION_CRITERIA.map((row) => [row.id, value]));
const employees = [
  { id:'e1', name:'Alpha', employeeCode:'A1', department:'Engineering' },
  { id:'e2', name:'Beta', employeeCode:'B1', department:'Finance' },
];
const evaluations = [
  { employeeId:'e1', period:'Q4 2026', status:'Finalized', overallScore:4, recommendation:'Retain', ratings:ratings(4) },
  { employeeId:'e2', period:'Q4 2026', status:'Submitted', overallScore:3, recommendation:'Develop', ratings:ratings(3) },
  { employeeId:'e1', period:'Q3 2026', status:'Draft', overallScore:5, recommendation:'Promote', ratings:ratings(5) },
];

test('management report excludes non-reportable draft records', () => {
  const report = buildManagementReport({ evaluations, employees, filters:{} });
  assert.equal(report.rows.length, 2);
  assert.equal(report.averageScore, 3.5);
  assert.equal(report.departments.length, 2);
});

test('management report filters by period, department, status, and search', () => {
  const report = buildManagementReport({ evaluations, employees, filters:{ period:'Q4 2026', department:'Engineering', status:'Finalized', search:'Alpha' } });
  assert.equal(report.rows.length, 1);
  assert.equal(report.rows[0].employeeId, 'e1');
  assert.equal(report.statusCounts.Finalized, 1);
});
