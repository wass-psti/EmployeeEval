import { EVALUATION_CRITERIA, RATING_LABELS } from './constants.js';

export function calculateOverallScore(ratings = {}) {
  let weighted = 0;
  let weight = 0;
  for (const criterion of EVALUATION_CRITERIA) {
    const rating = Number(ratings[criterion.id]);
    if (rating >= 1 && rating <= 5) {
      weighted += rating * criterion.weight;
      weight += criterion.weight;
    }
  }
  return weight ? Math.round((weighted / weight) * 100) / 100 : 0;
}

export function calculateCategoryAverage(ratings = {}, category) {
  const criteria = EVALUATION_CRITERIA.filter((item) => item.category === category);
  const values = criteria.map((item) => Number(ratings[item.id])).filter((value) => value >= 1 && value <= 5);
  if (!values.length) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

export function ratingLabel(score) {
  if (score >= 4.5) return RATING_LABELS[5];
  if (score >= 3.5) return RATING_LABELS[4];
  if (score >= 2.5) return RATING_LABELS[3];
  if (score >= 1.5) return RATING_LABELS[2];
  return RATING_LABELS[1];
}

export function ratedCount(ratings = {}) {
  return Object.values(ratings).filter((value) => Number(value) >= 1 && Number(value) <= 5).length;
}
