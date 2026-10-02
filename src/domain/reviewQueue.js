export const REVIEW_SORTS = ['oldest', 'newest', 'lowest-score', 'highest-score', 'employee'];

export function waitingDays(row, now = Date.now()) {
  const raw = row?.submittedAt || row?.updatedAt || row?.createdAt;
  const started = new Date(raw || now).getTime();
  if (!Number.isFinite(started)) return 0;
  return Math.max(0, Math.floor((now - started) / 86400000));
}

export function buildReviewQueue({ evaluations = [], employees = [], search = '', status = '', department = '', aging = '', sort = 'oldest', now = Date.now() } = {}) {
  const employeeById = new Map(employees.map((row) => [row.id, row]));
  const normalizedSearch = String(search || '').trim().toLowerCase();
  const rows = evaluations.filter((row) => ['Submitted', 'Reviewed'].includes(row.status)).filter((row) => {
    const employee = employeeById.get(row.employeeId);
    const evaluator = employeeById.get(row.evaluatorId);
    const wait = waitingDays(row, now);
    const haystack = `${employee?.name || ''} ${employee?.employeeCode || ''} ${employee?.department || ''} ${evaluator?.name || ''} ${row.period || ''} ${row.recommendation || ''}`.toLowerCase();
    if (status && row.status !== status) return false;
    if (department && employee?.department !== department) return false;
    if (aging === '3' && wait < 3) return false;
    if (aging === '7' && wait < 7) return false;
    if (normalizedSearch && !haystack.includes(normalizedSearch)) return false;
    return true;
  });

  const score = (row) => Number(row.overallScore) || 0;
  const employeeName = (row) => employeeById.get(row.employeeId)?.name || '';
  const submitted = (row) => new Date(row.submittedAt || row.updatedAt || row.createdAt || 0).getTime() || 0;
  const comparators = {
    oldest: (a, b) => submitted(a) - submitted(b),
    newest: (a, b) => submitted(b) - submitted(a),
    'lowest-score': (a, b) => score(a) - score(b) || submitted(a) - submitted(b),
    'highest-score': (a, b) => score(b) - score(a) || submitted(a) - submitted(b),
    employee: (a, b) => employeeName(a).localeCompare(employeeName(b)) || submitted(a) - submitted(b),
  };
  return rows.sort(comparators[sort] || comparators.oldest);
}

export function summarizeReviewQueue(rows = [], now = Date.now()) {
  const waits = rows.map((row) => waitingDays(row, now));
  return {
    total: rows.length,
    threePlus: waits.filter((value) => value >= 3).length,
    sevenPlus: waits.filter((value) => value >= 7).length,
    averageWait: waits.length ? waits.reduce((sum, value) => sum + value, 0) / waits.length : 0,
  };
}
