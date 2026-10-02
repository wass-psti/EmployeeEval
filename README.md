# Employee Evaluation — Standalone v0.2.0

Standalone migration of the internal **Employee Evaluation** application previously hosted inside Monday.com. The project is intended for Watchdog Workspace and is being prepared for a future Supabase provider implemented by the IT partner.

## v0.2.0 focus — Permission, Workflow & Data Integrity Hardening

The first standalone baseline is now reinforced with repository-level authorization, strict evaluation state transitions, optimistic concurrency, schema migration, and stronger auditability. Client-side role visibility is still used for UX, but the LocalRepository now also rejects unauthorized mutations so it can serve as a clearer behavioral reference for Supabase/RLS.

### Included

- Zero Monday SDK / BoardSDK / Monday Storage dependencies
- Clean first-run state with no employee/evaluation sample records
- Repository Contract v1 with LocalStorage reference provider
- **Schema v2** with revision tracking
- Administrator / Supervisor / Employee roles
- Repository-level permission enforcement for employee, evaluation, review, settings, and backup mutations
- Supervisor evaluation limited to assigned direct reports
- One evaluation assignment per employee and evaluation period
- Evaluation-window rules:
  - **Open** — new and existing Draft/Returned evaluations may be worked on
  - **Grace Period** — only existing Draft/Returned evaluations may continue
  - **Closed** — evaluator mutations are blocked
- Evaluation workflow enforcement:
  - `Draft / Returned → Submitted`
  - `Submitted → Reviewed / Returned`
  - `Reviewed → Finalized / Returned`
  - Finalized records are immutable in the evaluator workflow
- Finalized-only employee self-view
- Optimistic concurrency for employee and evaluation records
- Protected employee deletion when evaluation history or supervisor relationships exist
- Improved employee/reference validation
- Enhanced activity metadata and review transition logging
- Dataset-integrity diagnostics in Settings
- Automatic v0.1 LocalStorage → schema v2 migration
- Backup format v2 with v1 import compatibility
- Unsaved-change warning in the evaluation form
- Responsive desktop/laptop/tablet/mobile layouts retained

## Architecture

```text
React UI
   ↓
AppStore / domain rules
   ↓
Repository Contract v1
   ↓
LocalRepository + permission/workflow rules
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
npm run build
npm run dev
```

## Local setup session

Authentication is not yet connected, so the standalone build retains a **Local Setup Administrator** and a role/session selector for development testing. This is scaffolding only. Production identity and authorization must come from Supabase Auth / Watchdog Workspace and database RLS.

## Current integration versions

```text
Application:           v0.2.0
Repository Contract:   v1
Employee/Eval Schema:  v2
Backup Format:         v2
```

See `docs/PERMISSIONS_AND_WORKFLOW.md` and `docs/SUPABASE_HANDOFF.md` before implementing the production provider.
