# Employee Evaluation — Standalone v1.0.0

Stable standalone handoff release of the internal **Employee Evaluation** application previously hosted inside Monday.com. This codebase is the frozen frontend/domain baseline intended for Watchdog Workspace while the production Supabase persistence, authentication, Row Level Security, and deployment integration are implemented by the IT partner.

## v1.0.0 status — Stable Standalone Handoff Release

v1.0.0 promotes the validated v0.5.0 handoff candidate without changing the scoring model, evaluation workflow, repository contract, or database-facing schema. The purpose of this release is to freeze a known integration target and provide complete handoff documentation.

### Included

- Zero Monday SDK / BoardSDK / Monday Storage dependencies
- Clean first-run state with no employee/evaluation sample records
- Repository Contract v1 and Employee/Evaluation Schema v2
- Repository-level Administrator / Supervisor / Employee authorization expectations
- Draft → Submitted → Reviewed → Finalized / Returned workflow rules
- Optimistic concurrency protection for employee and evaluation records
- Management reporting, review queues, audit history, CSV/JSON exports
- Safe backup inspection and schema-aware restore
- Provider diagnostics and protected read-only mode
- Migration reconciliation for post-Supabase verification
- Responsive desktop/tablet/mobile layouts and viewport-safe dialogs
- Application confirmation dialogs and unsaved-change protection
- Privacy-safe diagnostic and handoff-manifest exports
- React Error Boundary and provider refresh recovery
- `npm run check:release` consolidated release-validation command
- Final QA, migration, integration, and IT-partner documentation

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

Production integration path:

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

The Supabase adapter belongs behind the repository boundary. Do not put direct Supabase queries inside evaluation forms, reports, management review, scoring logic, or other React feature components.

## Local validation

```bash
npm install
npm run check:release
npm run dev
```

`check:release` runs the complete automated test suite, focused handoff tests, and the Vite production build.

## Local setup session

Authentication is intentionally not connected in this standalone release. The **Local Setup Administrator** and session selector remain development/reference scaffolding. Production identity and authorization must come from Supabase Auth / Watchdog Workspace and be enforced by Row Level Security or another trusted server boundary.

## Frozen integration versions

```text
Application:             v1.0.0
Repository Contract:     v1
Employee/Eval Schema:    v2
Backup Format:           v2
Reconciliation Format:   v1
Diagnostic Format:       v1
Management Report:       v1
Handoff Manifest:        v1
```

Start the integration handoff with `docs/IT_PARTNER_START_HERE.md`. Before production deployment, complete `docs/FINAL_QA_CHECKLIST.md` and `docs/INTEGRATION_ACCEPTANCE.md`.
