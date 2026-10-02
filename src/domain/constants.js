export const APP_VERSION = '0.1.0';
export const REPOSITORY_CONTRACT_VERSION = 1;
export const SCHEMA_VERSION = 1;

export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  EMPLOYEE: 'employee',
};

export const ROLE_LABELS = {
  admin: 'Administrator',
  supervisor: 'Supervisor',
  employee: 'Employee',
};

export const EVALUATION_STATUSES = ['Draft', 'Submitted', 'Reviewed', 'Finalized', 'Returned'];
export const RECOMMENDATIONS = ['Promote', 'Retain', 'Develop', 'Monitor', 'Action Required'];

export const DEFAULT_DEPARTMENTS = [
  'Engineering',
  'Finance and Accounting',
  'HR / Admin',
  'Information Technology',
  'Materials and Logistics',
  'Sales and Marketing',
];

export const EVALUATION_CRITERIA = [
  { id: 'c1', name: 'Quality of Work', category: 'Work Performance', weight: 10, description: 'Accuracy, thoroughness, and attention to detail' },
  { id: 'c2', name: 'Productivity', category: 'Work Performance', weight: 10, description: 'Volume of work accomplished within expected timeframes' },
  { id: 'c3', name: 'Job Knowledge', category: 'Work Performance', weight: 10, description: 'Understanding of job requirements and procedures' },
  { id: 'c4', name: 'Reliability', category: 'Work Performance', weight: 10, description: 'Consistency in delivering assignments on time' },
  { id: 'c5', name: 'Attendance & Punctuality', category: 'Professional Conduct', weight: 5, description: 'Adherence to work schedule' },
  { id: 'c6', name: 'Compliance', category: 'Professional Conduct', weight: 5, description: 'Following company policies and procedures' },
  { id: 'c7', name: 'Professionalism', category: 'Professional Conduct', weight: 5, description: 'Appropriate conduct and demeanor' },
  { id: 'c8', name: 'Ethics & Integrity', category: 'Professional Conduct', weight: 5, description: 'Honesty and ethical behavior' },
  { id: 'c9', name: 'Adaptability', category: 'Professional Conduct', weight: 5, description: 'Ability to adjust to changes and new situations' },
  { id: 'c10', name: 'Communication', category: 'Interpersonal Skills', weight: 5, description: 'Clear and effective verbal/written communication' },
  { id: 'c11', name: 'Teamwork', category: 'Interpersonal Skills', weight: 5, description: 'Collaboration and contribution to team goals' },
  { id: 'c12', name: 'Customer/Stakeholder Relations', category: 'Interpersonal Skills', weight: 5, description: 'Professional interactions with internal/external parties' },
  { id: 'c13', name: 'Conflict Resolution', category: 'Interpersonal Skills', weight: 5, description: 'Handling disagreements constructively' },
  { id: 'c14', name: 'Initiative', category: 'Growth & Initiative', weight: 8, description: 'Self-motivation and proactive behavior' },
  { id: 'c15', name: 'Learning & Development', category: 'Growth & Initiative', weight: 7, description: 'Pursuit of professional growth' },
];

export const CRITERIA_CATEGORIES = [
  { name: 'Work Performance', weight: 40 },
  { name: 'Professional Conduct', weight: 25 },
  { name: 'Interpersonal Skills', weight: 20 },
  { name: 'Growth & Initiative', weight: 15 },
];

export const RATING_LABELS = {
  5: 'Outstanding',
  4: 'Exceeds Expectations',
  3: 'Meets Expectations',
  2: 'Needs Improvement',
  1: 'Unsatisfactory',
};

export function currentPeriod() {
  const now = new Date();
  return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
}
