# Employee Evaluation v1.0.0 — Release Notes

## Classification

**Stable Standalone Handoff Release**

v1.0.0 is the frozen standalone baseline for Supabase integration and Watchdog Workspace deployment. It promotes the v0.5.0 handoff candidate without changing evaluation formulas, workflow transitions, Repository Contract v1, or Schema v2.

## Functional baseline

- Employee master-data management with activation/deactivation and supervisor relationships
- Administrator, Supervisor, and Employee application views
- 15 weighted evaluation criteria with the established 1–5 rating model
- Draft, Submitted, Reviewed, Finalized, and Returned lifecycle
- Evaluation-window states: Open, Grace Period, and Closed
- Management Review queue with search, filters, aging indicators, sorting, and queue navigation
- Employee self-view restricted to finalized evaluations
- Management reporting, audit/activity log, CSV/JSON exports
- Backup inspection/restore, diagnostics, reconciliation, and handoff-manifest export
- Protected read-only behavior for unavailable or incompatible providers
- Optimistic concurrency through record revisions
- Responsive desktop/tablet/mobile UI with viewport-safe forms and dialogs

## Frozen integration contracts

- Application: v1.0.0
- Repository Contract: v1
- Employee/Evaluation Schema: v2
- Backup Format: v2
- Reconciliation Format: v1
- Diagnostic Format: v1
- Management Report Format: v1
- Handoff Manifest Format: v1

Any future breaking change to these interfaces should be versioned explicitly rather than silently modifying the v1.0.0 handoff contract.

## Production integration ownership

The standalone application owns business/scoring rules, workflow behavior, validation, reporting, audit UI, reconciliation logic, and the repository contract. The IT partner owns the Supabase repository implementation, PostgreSQL deployment and constraints, Auth/identity integration, Row Level Security, production migration, observability/deployment, and Watchdog Workspace integration.
