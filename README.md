# Employee Evaluation — Standalone v1.1.0

Watchdog Automation branded standalone release of the internal **Employee Evaluation** application previously hosted inside Monday.com. v1.1.0 builds on the stable v1.0.0 handoff baseline with a presentation and usability overhaul while keeping all Supabase-facing integration contracts frozen.

## v1.1.0 status — Watchdog Branded UI Overhaul

This release adds the supplied Watchdog Automation visual identity to the application and improves the dashboard, management-review workflow, reporting visuals, forms, tables, navigation, loading states, and responsive presentation. It does **not** change the evaluation formulas, permissions, workflow transitions, Repository Contract, schema, or migration formats.

### Included

- Watchdog Automation logo, favicon, browser theme, and branded application shell
- Teal/red/dark-slate visual system derived from the supplied brand artwork
- Branded performance dashboard with segmented evaluation-cycle progress
- Competency-summary report cards with circular score indicators and star meters
- Management Review workflow strip showing Evaluation → Review → Finalization → Share Results
- Refined cards, forms, modals, tables, buttons, empty states, focus states, and mobile layouts
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
Application:             v1.1.0
Repository Contract:     v1
Employee/Eval Schema:    v2
Backup Format:           v2
Reconciliation Format:   v1
Diagnostic Format:       v1
Management Report:       v1
Handoff Manifest:        v1
```

Start the integration handoff with `docs/IT_PARTNER_START_HERE.md`. v1.0.0 remains the historical stable handoff baseline; v1.1.0 is a compatible branded UI release with the same integration boundary.
