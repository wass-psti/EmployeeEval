# Employee Evaluation — Standalone v0.1.0

Standalone migration of the internal Employee Evaluation application previously hosted inside Monday.com.

## Purpose

This project preserves the employee-performance evaluation workflow while removing Monday-specific runtime dependencies. It is designed to be integrated into Watchdog Workspace. Supabase integration is intentionally **not** implemented in this repository baseline; that integration is reserved for the IT partner.

## v0.1.0 scope

- Clean React + Vite standalone application
- Zero Monday SDK / BoardSDK / Monday Storage dependencies
- Clean first-run state with no employee or evaluation sample records
- LocalStorage reference repository for development/testing
- Async repository boundary designed for a future Supabase provider
- Employee master data and supervisor assignment
- Roles: Administrator, Supervisor, Employee
- Evaluation-window controls and active-period configuration
- 15 weighted performance criteria across 4 categories
- 1–5 rating scale and weighted overall scoring
- Draft and Submitted evaluation workflow
- Management Review: Reviewed, Finalized, Returned
- Dashboard, employee directory, evaluation workspace, reports, employee self-view, activity log, and settings
- JSON backup/import and CSV report export
- Responsive desktop, laptop, tablet, and mobile layouts
- Viewport-constrained evaluation forms with persistent header/footer actions

## Architecture

```text
React UI
   ↓
AppStore / domain rules
   ↓
Repository Contract v1
   ↓
LocalRepository (v0.1.0)
```

Future:

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

Because authentication is not yet connected, the standalone baseline includes a **Local Setup Administrator** session. After employee records are created, the header session selector can simulate Administrator, Supervisor, and Employee views. This is development scaffolding only and should be replaced by Supabase Auth / Watchdog Workspace identity during integration.

## Data policy

The repository includes no named employee sample records from the original Monday application. Employee and evaluation datasets start empty.

See `docs/SUPABASE_HANDOFF.md` before implementing the production provider.
