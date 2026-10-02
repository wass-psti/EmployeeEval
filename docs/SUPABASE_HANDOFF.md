# Supabase Integration Handoff — Employee Evaluation

## Integration boundary

Supabase should be implemented behind `src/services/repositoryProvider.js` and the Repository Contract. Avoid placing Supabase queries inside pages or React form components.

## IT partner responsibilities

- Supabase project configuration
- PostgreSQL schema and migrations
- Supabase Auth / Watchdog Workspace identity integration
- Row Level Security policies
- Production role mapping
- Production employee master data source
- Concurrency/database constraints
- Audit retention policy
- Deployment configuration
- Watchdog Workspace launcher integration

## Suggested tables

- `employees`
- `evaluations`
- `evaluation_settings`
- `evaluation_activity`

Normalize ratings into JSONB initially or into an `evaluation_ratings` child table if reporting requirements justify it.

## Identity migration

The Local Setup Administrator and local session selector are development scaffolding only. Production roles must come from authenticated identity/authorization data, not from client-selected state and not from hardcoded email lists.

## Security expectations

At minimum, RLS should enforce:

- Employees can read only their released evaluation(s).
- Supervisors can evaluate authorized direct reports.
- Supervisors cannot finalize management reviews unless explicitly granted.
- Administrators/management can configure evaluation cycles and review/finalize submissions.
- Client-side role checks are UX controls only; database policies must enforce authorization.

## Clean-slate behavior

v0.1.0 contains no seeded employee/evaluation records. The production database should likewise be populated intentionally through approved master-data migration or administration workflows.
