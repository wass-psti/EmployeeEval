# Integration Acceptance — Employee Evaluation v0.5.0

Before enabling a production Supabase provider, the Data & Integration page should report all of the following as passing:

- Provider available
- Provider writable
- Repository Contract v1
- Employee/Evaluation Schema v2
- Dataset integrity healthy

The application-level handoff gate intentionally blocks writes when the configured provider reports an incompatible contract or schema.

## Functional acceptance

Verify the production provider supports:

1. Employee master-data CRUD with duplicate code/email prevention.
2. Supervisor-only direct-report evaluation eligibility.
3. Open / Grace Period / Closed evaluation-window behavior.
4. Draft / Returned → Submitted evaluator workflow.
5. Submitted → Reviewed / Returned management workflow.
6. Reviewed → Finalized / Returned management workflow.
7. Finalized-only employee self-view.
8. Optimistic concurrency conflicts using record revisions.
9. One evaluation per employee and period.
10. Historical references preserved for inactive employees.
11. Audit events for create/update/submit/review/finalize/return/settings actions.

## Security acceptance

Production authorization must be enforced in Supabase/RLS or a trusted server boundary. Browser-selected role/session data is not authoritative.

## Handoff artifact acceptance

- Export Diagnostics and confirm the report contains counts/versions but no raw employee/evaluation records.
- Export the Handoff Manifest and confirm Repository Contract v1 / Schema v2 / format versions match this release.
- Export a reconciliation baseline immediately before production migration and compare it after the Supabase provider is enabled.
