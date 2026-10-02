# Supabase Integration Handoff — Employee Evaluation v0.2.0

## Integration boundary

Supabase must be implemented behind `src/services/repositoryProvider.js` and Repository Contract v1. Do not place Supabase queries directly inside pages, forms, scoring modules, or review UI.

## Frozen expectations for this stage

```text
Repository Contract: v1
Schema:              v2
Backup Format:       v2
```

## IT partner responsibilities

- Supabase project configuration
- PostgreSQL schema/migrations
- Supabase Auth / Watchdog Workspace identity integration
- Row Level Security policies
- Production role mapping
- Employee master-data migration/source
- Database constraints for employee-code/email uniqueness
- Unique constraint on `(employee_id, period)`
- Concurrency enforcement using `revision` or equivalent optimistic locking
- Evaluation state-transition enforcement
- Audit persistence/retention policy
- Production migration/reconciliation
- Watchdog Workspace launcher integration

## Suggested tables

- `employees`
- `evaluations`
- `evaluation_settings`
- `evaluation_activity`

Ratings may remain JSONB initially. A normalized child table can be introduced later if analytical requirements justify it.

## Identity migration

`Local Setup Administrator` and the session selector are development scaffolding only. Production roles and actor IDs must come from authenticated identity/authorization data.

## RLS / authorization expectations

At minimum, database/security policies should enforce:

- Employees cannot mutate evaluations and can read only their own finalized evaluation(s).
- Supervisors may create/update evaluations only for assigned direct reports.
- Supervisors may edit only Draft/Returned evaluations they own.
- Administrators/management can configure cycles and perform review transitions.
- Evaluator and employee IDs cannot be forged by the browser client.
- Finalized records cannot be silently edited by normal evaluator operations.
- Historical employee references remain valid even after an employee is inactive.

## Workflow constraints

Production logic should mirror `docs/PERMISSIONS_AND_WORKFLOW.md` and the LocalRepository reference behavior.

## Concurrency

When updating employee/evaluation rows, compare the supplied revision with the current database revision. On mismatch, return a conflict response and require the UI to reload the latest record.

## Backup/migration

v0.2.0 exports backup format v2 and can import v1/v2 backups. The production migration should map all records to schema v2 and preserve revision/lifecycle metadata where available.
