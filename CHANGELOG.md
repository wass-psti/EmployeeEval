# Changelog

## v0.3.0 — Reporting, Audit & Integration Readiness

- Added management-report filters for period, department, status, and employee/recommendation search.
- Added department performance breakdown, recommendation mix, workflow-status mix, and richer report exports.
- Added JSON management-summary export alongside filtered CSV reporting.
- Improved Management Review with search/status filters, oldest-first queue ordering, waiting-age visibility, and per-evaluation audit history.
- Expanded Activity Log with action/entity/actor filters, pagination, and filtered CSV export.
- Added safe backup inspection before replacement, including structural, schema, row-level, duplicate, reference, and dataset-integrity checks.
- Strengthened repository backup import to reject cross-record integrity failures.
- Added a non-destructive LocalStorage read/write health probe.
- Added provider compatibility checks and application-level protected write mode when a provider is unavailable, read-only, or incompatible.
- Added a Supabase handoff acceptance gate.
- Added diagnostic JSON export containing provider/integrity summaries without raw employee or evaluation data.
- Added migration reconciliation baseline export and deterministic comparison for post-Supabase verification.
- Kept Repository Contract v1 and Schema v2 unchanged to avoid integration contract churn.
- Added dedicated handoff/integration automated tests and expanded management-report validation.

## v0.2.0 — Permission, Workflow & Data Integrity Hardening

- Upgraded the Employee Evaluation domain schema from v1 to **v2**.
- Added per-record revision tracking and optimistic concurrency protection for employee and evaluation edits.
- Added repository-level authorization so client UI role checks are no longer the only mutation guard.
- Restricted employee master-data/settings/backup management to administrators.
- Restricted supervisor evaluation to active direct reports and blocked self-evaluation.
- Enforced one evaluation assignment per employee and period.
- Added evaluation-window rules for Open, Grace Period, and Closed states.
- Enforced management review transitions: Submitted → Reviewed/Returned and Reviewed → Finalized/Returned.
- Required a reason when returning an evaluation for rework.
- Made submitted/reviewed/finalized evaluations immutable to evaluators unless returned.
- Limited Employee self-view to **Finalized** evaluations.
- Protected deletion of employees referenced by evaluation history or supervisor assignments.
- Strengthened employee validation for email format, supervisor validity, roles, duplicates, and self-supervision.
- Added dataset-integrity diagnostics for missing references, duplicates, invalid roles/statuses, and settings.
- Added richer activity metadata including status transitions and revision numbers.
- Added automatic migration from v0.1 LocalStorage keys to schema v2.
- Upgraded JSON backup format to v2 while retaining v1 import compatibility.
- Added unsaved-change warning to the evaluation form.
- Expanded automated validation from 7 to **25 passing tests**.

## v0.1.0 — Standalone Foundation

- Migrated the application identity to **Employee Evaluation**.
- Removed Monday.com SDK, BoardSDK, Monday Storage, board item, board status, and Monday user dependencies.
- Introduced an asynchronous Repository Contract v1 with a LocalStorage reference provider.
- Removed hardcoded employee names and email-to-role mappings from runtime application logic.
- Added clean employee master data with department, role, supervisor, active state, employee code, and contact fields.
- Added local session switching for standalone role testing before authentication integration.
- Preserved the original 15 weighted evaluation criteria and rating model.
- Added Draft, Submitted, Reviewed, Finalized, and Returned evaluation states.
- Added management review, employee self-view, reports, activity history, backup/import, and CSV report export.
- Added responsive evaluation forms and mobile layouts.
- Starts with zero employee and evaluation records.
