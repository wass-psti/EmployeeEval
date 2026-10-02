import { calculateCategoryAverage, ratingLabel } from './scoring.js';
import { CRITERIA_CATEGORIES } from './constants.js';

export function buildManagementReport({ evaluations = [], employees = [], filters = {} } = {}) {
  const employeeMap = new Map(employees.map((row) => [row.id, row]));
  const rows = evaluations.filter((row) => {
    if (!['Submitted', 'Reviewed', 'Finalized'].includes(row.status)) return false;
    const employee = employeeMap.get(row.employeeId);
    if (filters.period && row.period !== filters.period) return false;
    if (filters.department && employee?.department !== filters.department) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.search) {
      const haystack = `${employee?.name || ''} ${employee?.employeeCode || ''} ${row.recommendation || ''}`.toLowerCase();
      if (!haystack.includes(filters.search.toLowerCase())) return false;
    }
    return true;
  });

  const averageScore = average(rows.map((row) => row.overallScore));
  const distribution = groupCounts(rows, (row) => ratingLabel(row.overallScore));
  const recommendations = groupCounts(rows, (row) => row.recommendation || 'Unspecified');
  const statusCounts = groupCounts(rows, (row) => row.status || 'Unknown');
  const categories = CRITERIA_CATEGORIES.map((category) => ({
    ...category,
    average: average(rows.map((row) => calculateCategoryAverage(row.ratings, category.name)).filter(Boolean)),
  }));

  const departmentMap = new Map();
  for (const row of rows) {
    const employee = employeeMap.get(row.employeeId);
    const department = employee?.department || 'Unassigned';
    const group = departmentMap.get(department) || [];
    group.push(row);
    departmentMap.set(department, group);
  }
  const departments = [...departmentMap.entries()].map(([department, values]) => ({
    department,
    evaluations: values.length,
    finalized: values.filter((row) => row.status === 'Finalized').length,
    averageScore: average(values.map((row) => row.overallScore)),
  })).sort((a, b) => a.department.localeCompare(b.department));

  return { rows, averageScore, rating: rows.length ? ratingLabel(averageScore) : '—', distribution, recommendations, statusCounts, categories, departments };
}

function average(values) {
  const numeric = values.map(Number).filter(Number.isFinite);
  return numeric.length ? Math.round((numeric.reduce((a, b) => a + b, 0) / numeric.length) * 100) / 100 : 0;
}

function groupCounts(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}
