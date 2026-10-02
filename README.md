# Employee Evaluation — Standalone v0.5.0

Standalone migration of the internal **Employee Evaluation** application previously hosted inside Monday.com. This project is intended for Watchdog Workspace and is prepared as the final standalone handoff candidate before the IT partner implements Supabase.

## v0.5.0 focus — Final QA & Supabase Handoff Candidate

v0.5.0 freezes the scoring model and integration contracts while tightening release safety, unsaved-work protection, destructive-action UX, and IT-partner handoff documentation. No new evaluation-scoring rules were introduced in this release.

### Included

- Zero Monday SDK / BoardSDK / Monday Storage dependencies
- Clean first-run state with no employee/evaluation sample records
- Repository Contract v1 and Employee/Evaluation Schema v2
- Repository-level Administrator / Supervisor / Employee authorization
- Draft → Submitted → Reviewed → Finalized / Returned workflow rules
- Optimistic concurrency protection for employee and evaluation records
- Management reporting, review queues, audit history, CSV/JSON exports
- Safe backup inspection and schema-aware restore
- Provider diagnostics and protected read-only mode
- Migration reconciliation for post-Supabase verification
- Responsive desktop/tablet/mobile layouts
- Viewport-safe modals and short-browser-height handling
- Application confirmation dialogs instead of native browser `confirm()` prompts
- Unsaved-change protection for both evaluation and employee forms, including browser/tab unload warnings
- Exportable handoff manifest containing frozen versions, repository-method requirements, readiness checks, and ownership boundaries without raw employee/evaluation content
- React Error Boundary and provider refresh recovery
- `npm run check:release` consolidated release-validation command
- Final QA and IT-partner handoff documentation

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
Application:             v0.5.0
Repository Contract:     v1
Employee/Eval Schema:    v2
Backup Format:           v2
Reconciliation Format:   v1
Diagnostic Format:       v1
Management Report:       v1
Handoff Manifest:        v1
```

For final validation, complete `docs/FINAL_QA_CHECKLIST.md`. For Supabase implementation, begin with `docs/IT_PARTNER_START_HERE.md`, then review `docs/HANDOFF_MANIFEST.md`, `docs/REPOSITORY_CONTRACT.md`, `docs/SUPABASE_HANDOFF.md`, `docs/INTEGRATION_ACCEPTANCE.md`, `docs/MIGRATION_RECONCILIATION.md`, and `docs/SUPABASE_SCHEMA_REFERENCE.sql`.
