import test from 'node:test';
import assert from 'node:assert/strict';
import { assertReviewTransition, canContinueEvaluation, canStartNewEvaluation } from '../src/domain/workflow.js';

test('open window permits new evaluations while grace period does not', () => {
  assert.equal(canStartNewEvaluation('Open'), true);
  assert.equal(canStartNewEvaluation('Grace Period'), false);
  assert.equal(canStartNewEvaluation('Closed'), false);
});

test('grace period permits only existing draft or returned evaluator records', () => {
  assert.equal(canContinueEvaluation('Grace Period', 'Draft'), true);
  assert.equal(canContinueEvaluation('Grace Period', 'Returned'), true);
  assert.equal(canContinueEvaluation('Grace Period', 'Submitted'), false);
  assert.equal(canContinueEvaluation('Closed', 'Draft'), false);
});

test('management workflow rejects invalid transitions', () => {
  assert.doesNotThrow(() => assertReviewTransition('Submitted', 'Reviewed'));
  assert.doesNotThrow(() => assertReviewTransition('Reviewed', 'Finalized'));
  assert.throws(() => assertReviewTransition('Submitted', 'Finalized'), (err) => err.code === 'INVALID_TRANSITION');
});
