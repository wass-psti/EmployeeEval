# Migration Reconciliation — Employee Evaluation v1.1.0

Use the reconciliation export to verify that the local reference dataset and the Supabase-backed dataset contain equivalent aggregate information after migration.

## Recommended sequence

1. On the local provider, resolve all integrity issues.
2. Export a full JSON backup.
3. Export a diagnostic report.
4. Export a reconciliation baseline.
5. Migrate employee/evaluation/settings/activity data into Supabase.
6. Configure the Supabase repository behind Repository Contract v1.
7. Refresh the provider and confirm the acceptance gate passes.
8. Use **Compare Reconciliation** and select the pre-migration baseline.
9. Investigate every mismatch before production rollout.

## Reconciled values

The report compares:

- total employees;
- active employees;
- total evaluations;
- activity-event count;
- integrity-issue count;
- reportable average score;
- finalized average score;
- evaluation counts by status;
- evaluation counts by period;
- recommendation counts;
- employee counts by department.

Score comparisons use a 0.01 tolerance to avoid harmless floating-point representation differences.
