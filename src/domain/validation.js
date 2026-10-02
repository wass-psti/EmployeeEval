import { EVALUATION_CRITERIA, EVALUATION_STATUSES, ROLES } from './constants.js';
import { ratedCount } from './scoring.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmployee(employee, employees = []) {
  const errors = {};
  if (!employee.name?.trim()) errors.name = 'Employee name is required.';
  if (!employee.employeeCode?.trim()) errors.employeeCode = 'Employee code is required.';
  if (!employee.email?.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_RE.test(employee.email.trim())) errors.email = 'Enter a valid email address.';
  if (!Object.values(ROLES).includes(employee.role)) errors.role = 'Select a valid employee role.';
  if (employee.supervisorId === employee.id) errors.supervisorId = 'An employee cannot supervise themselves.';

  const code = employee.employeeCode?.trim().toLowerCase();
  if (code && employees.some((row) => row.id !== employee.id && row.employeeCode?.trim().toLowerCase() === code)) {
    errors.employeeCode = 'Employee code already exists.';
  }
  const email = employee.email?.trim().toLowerCase();
  if (email && employees.some((row) => row.id !== employee.id && row.email?.trim().toLowerCase() === email)) {
    errors.email = 'Email already exists.';
  }
  if (employee.supervisorId) {
    const supervisor = employees.find((row) => row.id === employee.supervisorId);
    if (!supervisor) errors.supervisorId = 'Selected supervisor no longer exists.';
    else if (!['admin', 'supervisor'].includes(supervisor.role)) errors.supervisorId = 'Selected employee is not eligible to supervise.';
    else if (supervisor.active === false) errors.supervisorId = 'Selected supervisor is inactive.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateEvaluation(evaluation, { allowDraft = false } = {}) {
  const errors = {};
  const count = ratedCount(evaluation.ratings);
  if (!evaluation.employeeId) errors.employeeId = 'Employee is required.';
  if (!evaluation.evaluatorId) errors.evaluatorId = 'Evaluator is required.';
  if (!evaluation.period?.trim()) errors.period = 'Evaluation period is required.';
  if (!EVALUATION_STATUSES.includes(evaluation.status)) errors.status = 'Invalid evaluation status.';
  if (!allowDraft && count < EVALUATION_CRITERIA.length) errors.ratings = `${EVALUATION_CRITERIA.length - count} criteria ratings missing.`;
  if (!allowDraft && (evaluation.comments || '').trim().length < 20) errors.comments = 'Provide at least 20 characters.';
  if (!allowDraft && (evaluation.strengths || '').trim().length < 10) errors.strengths = 'Provide at least 10 characters.';
  if (!allowDraft && (evaluation.improvements || '').trim().length < 10) errors.improvements = 'Provide at least 10 characters.';
  if (!allowDraft && !evaluation.recommendation) errors.recommendation = 'Select a recommendation.';
  return { isValid: Object.keys(errors).length === 0, errors, ratedCount: count };
}
