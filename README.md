# Employee Evaluation — Standalone v0.4.0

Standalone migration of the internal **Employee Evaluation** application previously hosted inside Monday.com. The project is intended for Watchdog Workspace and is being prepared for a future Supabase provider implemented by the IT partner.

## v0.4.0 focus — Responsive UX, Review Productivity & Release Hardening

v0.4.0 keeps the scoring model and integration contracts stable while improving management-review throughput, browser-size adaptability, provider-failure recovery, accessibility, and final QA tooling.

### Included

- Zero Monday SDK / BoardSDK / Monday Storage dependencies
- Clean first-run state with no employee/evaluation sample records
- Repository Contract v1 and Schema v2 retained
- Repository-level Administrator / Supervisor / Employee authorization
- Formal evaluation workflow and optimistic concurrency protection
- Management Review filters for status, department, aging, search, and sort order
- Queue workload indicators for total items, 3+ day aging, 7+ day aging, and average waiting time
- Previous/Next navigation inside the filtered management-review queue
- Responsive review cards on smaller displays
- Sticky/viewport-safe modal structure and stronger keyboard focus behavior
- Skip-to-content accessibility control and modal focus trapping
- React Error Boundary with controlled reload recovery
- Provider refresh recovery that keeps last successfully loaded data visible while disabling writes
- Last-refresh visibility and manual provider refresh from the top bar
- Mobile navigation scrim and short-browser-height layout refinements
- Safe backup inspection, provider diagnostics, handoff acceptance, and migration reconciliation from v0.3.0
- `npm run check:release` consolidated release-validation command
- Final QA checklist and release-manifest contract validation

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

Final candidate validation:

```bash
npm run check:release
```

## Local setup session

Authentication is not yet connected, so the standalone build retains a **Local Setup Administrator** and role/session selector for development testing. This is scaffolding only. Production identity and authorization must come from Supabase Auth / Watchdog Workspace and database RLS.

## Current integration versions

```text
Application:             v0.4.0
Repository Contract:     v1
Employee/Eval Schema:    v2
Backup Format:           v2
Reconciliation Format:   v1
Diagnostic Format:       v1
Management Report:       v1
```

Before final promotion, complete `docs/FINAL_QA_CHECKLIST.md`. For Supabase implementation, start with `docs/SUPABASE_HANDOFF.md`, `docs/INTEGRATION_ACCEPTANCE.md`, `docs/MIGRATION_RECONCILIATION.md`, and the non-deployed `docs/SUPABASE_SCHEMA_REFERENCE.sql`.
