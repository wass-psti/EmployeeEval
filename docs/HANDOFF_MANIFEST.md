# Employee Evaluation v1.1.0 — Handoff Manifest

## Frozen application contracts

| Contract | Version |
| --- | ---: |
| Application | 1.1.0 |
| Repository Contract | 1 |
| Employee/Evaluation Schema | 2 |
| Backup Format | 2 |
| Reconciliation Format | 1 |
| Diagnostic Format | 1 |
| Management Report Format | 1 |
| Handoff Manifest Format | 1 |

## Standalone application owns

- evaluation criteria, weights, and score calculation
- Administrator / Supervisor / Employee workflow behavior
- Draft / Submitted / Reviewed / Finalized / Returned lifecycle
- optimistic concurrency expectations
- validation and integrity rules
- management review, reports, audit/activity UI
- backup inspection and reconciliation logic
- responsive UI and protected read-only behavior
- Repository Contract v1

## IT partner owns

- Supabase repository implementation
- PostgreSQL deployment and database constraints
- Supabase Auth / Watchdog Workspace identity integration
- Row Level Security policies
- production migration
- post-migration reconciliation
- production observability/deployment
- Watchdog Workspace registration/integration

## Acceptance rule

Do not enable production writes until provider availability, writability, Repository Contract v1, Schema v2, and dataset integrity all pass the application's handoff acceptance gate.

The Settings page can export a machine-readable Handoff Manifest JSON containing these versions, required repository methods, readiness results, and dataset counts without raw employee/evaluation records.
