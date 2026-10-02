import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCategoryAverage, calculateOverallScore, ratedCount, ratingLabel } from '../src/domain/scoring.js';
import { EVALUATION_CRITERIA } from '../src/domain/constants.js';

test('all rating 5 scores 5.00', () => {
  const ratings = Object.fromEntries(EVALUATION_CRITERIA.map((c) => [c.id, 5]));
  assert.equal(calculateOverallScore(ratings), 5);
  assert.equal(ratedCount(ratings), 15);
  assert.equal(ratingLabel(5), 'Outstanding');
});

test('all rating 3 scores 3.00', () => {
  const ratings = Object.fromEntries(EVALUATION_CRITERIA.map((c) => [c.id, 3]));
  assert.equal(calculateOverallScore(ratings), 3);
  assert.equal(ratingLabel(3), 'Meets Expectations');
});

test('category average considers category ratings only', () => {
  const ratings = { c1: 4, c2: 2, c3: 4, c4: 2, c5: 5 };
  assert.equal(calculateCategoryAverage(ratings, 'Work Performance'), 3);
});
