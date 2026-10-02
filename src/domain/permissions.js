import { ROLES } from './constants.js';

export function resolveActor(actorId, employees = []) {
  if (actorId === 'local-system') {
    return { id: 'local-system', name: 'Local Setup Administrator', role: ROLES.ADMIN, active: true, localSystem: true };
  }
  return employees.find((row) => row.id === actorId) || null;
}

export function canManageEmployees(actor) {
  return actor?.role === ROLES.ADMIN;
}

export function canManageSettings(actor) {
  return actor?.role === ROLES.ADMIN;
}

export function canReviewEvaluations(actor) {
  return actor?.role === ROLES.ADMIN;
}

export function canEvaluateEmployee(actor, employee) {
  if (!actor || !employee || employee.active === false || actor.active === false) return false;
  if (actor.id === employee.id) return false;
  if (actor.role === ROLES.ADMIN) return true;
  return actor.role === ROLES.SUPERVISOR && employee.supervisorId === actor.id;
}

export function canViewEmployeeEvaluation(actor, evaluation) {
  if (!actor || !evaluation) return false;
  if (actor.role === ROLES.ADMIN) return true;
  if (evaluation.evaluatorId === actor.id) return true;
  if (evaluation.employeeId === actor.id) return evaluation.status === 'Finalized';
  return false;
}

export function assertPermission(condition, message = 'You do not have permission to perform this action.') {
  if (!condition) {
    throw Object.assign(new Error(message), { code: 'FORBIDDEN' });
  }
}
