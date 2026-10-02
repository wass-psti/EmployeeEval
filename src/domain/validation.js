import { EVALUATION_CRITERIA } from './constants.js';
import { ratedCount } from './scoring.js';

export function validateEmployee(employee, employees = []) {
  const errors = {};
  if (!employee.name?.trim()) errors.name = 'Employee name is required.';
  if (!employee.employeeCode?.trim()) errors.employeeCode = 'Employee code is required.';
  if (!employee.email?.trim()) errors.email = 'Email is required.';
  const code = employee.employeeCode?.trim().toLowerCase();
  if (code && employees.some((row) => row.id !== employee.id && row.employeeCode?.trim().toLowerCase() === code)) {
    errors.employeeCode = 'Employee code already exists.';
  }
  const email = employee.email?.trim().toLowerCase();
  if (email && employees.some((row) => row.id !== employee.id && row.email?.trim().toLowerCase() === email)) {
    errors.email = 'Email already exists.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateEvaluation(evaluation, { allowDraft = false } = {}) {
  const errors = {};
  const count = ratedCount(evaluation.ratings);
  if (!allowDraft && count < EVALUATION_CRITERIA.length) errors.ratings = `${EVALUATION_CRITERIA.length - count} criteria ratings missing.`;
  if (!allowDraft && (evaluation.comments || '').trim().length < 20) errors.comments = 'Provide at least 20 characters.';
  if (!allowDraft && (evaluation.strengths || '').trim().length < 10) errors.strengths = 'Provide at least 10 characters.';
  if (!allowDraft && (evaluation.improvements || '').trim().length < 10) errors.improvements = 'Provide at least 10 characters.';
  if (!allowDraft && !evaluation.recommendation) errors.recommendation = 'Select a recommendation.';
  return { isValid: Object.keys(errors).length === 0, errors, ratedCount: count };
}
