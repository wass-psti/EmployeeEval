# Employee Evaluation — Standalone v0.3.0

Standalone migration of the internal **Employee Evaluation** application previously hosted inside Monday.com. The project is intended for Watchdog Workspace and is being prepared for a future Supabase provider implemented by the IT partner.

## v0.3.0 focus — Reporting, Audit & Integration Readiness

v0.3.0 keeps the evaluation/scoring model stable while strengthening management reporting, review/audit usability, backup safety, provider diagnostics, and migration verification.

### Included

- Zero Monday SDK / BoardSDK / Monday Storage dependencies
- Clean first-run state with no employee/evaluation sample records
- Repository Contract v1 and Schema v2 retained
- Repository-level Administrator / Supervisor / Employee authorization
- Formal evaluation workflow and optimistic concurrency protection
- Management report filters by period, department, status, and employee/recommendation search
- Department performance breakdown, recommendation mix, workflow status mix, and category averages
- CSV filtered-view export and JSON management-summary export
- Management Review search/status filters, oldest-first review queue, waiting-age indicator, and per-evaluation audit history
- Activity Log filters by action, entity, actor, and search term
- Paginated Activity Log and filtered CSV audit export
- Safe backup inspection before destructive import
- Backup validation for structure, row validation, references, duplicates, settings, and schema compatibility
- Non-destructive LocalStorage read/write provider health probe
- Provider compatibility checks for availability, writability, Repository Contract v1, and Schema v2
- Application-level protected write mode when the provider is incompatible
- Supabase handoff acceptance gate
- Diagnostic JSON export without raw employee/evaluation records
- Reconciliation baseline export and post-migration comparison
- Expanded Supabase migration and acceptance documentation

## Architecture

```text
React UI
   ↓
AppStore / domain rules
   ↓
Repository Contract v1
   ↓
LocalRepository (reference provider)
```

Future production path:

```text
React UI
   ↓
AppStore / domain rules
   ↓
Repository Contract v1
   ↓
SupabaseRepository (IT partner)
   ↓
PostgreSQL / Auth / RLS
```

## Local setup

```bash
npm install
npm test
npm run test:handoff
npm run build
npm run dev
```

## Local setup session

Authentication is not yet connected, so the standalone build retains a **Local Setup Administrator** and role/session selector for development testing. This is scaffolding only. Production identity and authorization must come from Supabase Auth / Watchdog Workspace and database RLS.

## Current integration versions

```text
Application:             v0.3.0
Repository Contract:     v1
Employee/Eval Schema:    v2
Backup Format:           v2
Reconciliation Format:   v1
Diagnostic Format:       v1
Management Report:       v1
```

Start with `docs/SUPABASE_HANDOFF.md`, `docs/INTEGRATION_ACCEPTANCE.md`, `docs/MIGRATION_RECONCILIATION.md`, and the non-deployed `docs/SUPABASE_SCHEMA_REFERENCE.sql` before implementing the production provider.
