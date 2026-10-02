import { EVALUATION_STATUSES, ROLES } from './constants.js';

export function inspectIntegrity({ employees = [], evaluations = [], settings = {} } = {}) {
  const issues = [];
  const employeeIds = new Set(employees.map((row) => row.id));
  const employeeCodes = new Map();
  const emails = new Map();

  for (const employee of employees) {
    const code = employee.employeeCode?.trim().toLowerCase();
    const email = employee.email?.trim().toLowerCase();
    if (code) employeeCodes.set(code, (employeeCodes.get(code) || 0) + 1);
    if (email) emails.set(email, (emails.get(email) || 0) + 1);
    if (!Object.values(ROLES).includes(employee.role)) issues.push({ type: 'employee-role', id: employee.id, message: `Employee ${employee.name || employee.id} has an invalid role.` });
    if (employee.supervisorId && !employeeIds.has(employee.supervisorId)) issues.push({ type: 'supervisor-reference', id: employee.id, message: `Employee ${employee.name || employee.id} references a missing supervisor.` });
    if (employee.supervisorId === employee.id) issues.push({ type: 'self-supervisor', id: employee.id, message: `Employee ${employee.name || employee.id} cannot supervise themselves.` });
  }

  for (const [code, count] of employeeCodes) if (count > 1) issues.push({ type: 'duplicate-code', value: code, message: `Employee code ${code} appears ${count} times.` });
  for (const [email, count] of emails) if (count > 1) issues.push({ type: 'duplicate-email', value: email, message: `Email ${email} appears ${count} times.` });

  const evaluationKeys = new Map();
  for (const evaluation of evaluations) {
    if (!employeeIds.has(evaluation.employeeId)) issues.push({ type: 'evaluation-employee-reference', id: evaluation.id, message: `Evaluation ${evaluation.id} references a missing employee.` });
    if (evaluation.evaluatorId !== 'local-system' && !employeeIds.has(evaluation.evaluatorId)) issues.push({ type: 'evaluation-evaluator-reference', id: evaluation.id, message: `Evaluation ${evaluation.id} references a missing evaluator.` });
    if (!EVALUATION_STATUSES.includes(evaluation.status)) issues.push({ type: 'evaluation-status', id: evaluation.id, message: `Evaluation ${evaluation.id} has an invalid status.` });
    const key = `${evaluation.employeeId}::${evaluation.period}`.toLowerCase();
    evaluationKeys.set(key, (evaluationKeys.get(key) || 0) + 1);
  }
  for (const [key, count] of evaluationKeys) if (count > 1) issues.push({ type: 'duplicate-evaluation', value: key, message: `Evaluation assignment ${key} appears ${count} times.` });

  if (!settings.activePeriod?.trim()) issues.push({ type: 'settings-period', message: 'Active evaluation period is empty.' });
  if (!['Open', 'Grace Period', 'Closed'].includes(settings.evaluationWindow)) issues.push({ type: 'settings-window', message: 'Evaluation window has an invalid value.' });

  return {
    ok: issues.length === 0,
    issues,
    counts: {
      employees: employees.length,
      evaluations: evaluations.length,
      integrityIssues: issues.length,
    },
  };
}
