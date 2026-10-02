# IT Partner Start Here — Employee Evaluation v1.0.0

This repository is the stable standalone Employee Evaluation handoff release. The frontend, domain rules, evaluation workflow, scoring, reporting, audit UI, validation, backup, and reconciliation logic are already implemented. The production persistence/authentication layer is intentionally not implemented here.

## Integration boundary

Implement Supabase behind the existing Repository Contract v1. Do not place Supabase queries directly inside React pages/components.

```text
React UI
  ↓
AppStore / domain rules
  ↓
Repository Contract v1
  ↓
SupabaseRepository
  ↓
PostgreSQL / Auth / RLS
```

## Read these files in order

1. `docs/HANDOFF_MANIFEST.md`
2. `docs/REPOSITORY_CONTRACT.md`
3. `docs/DATA_MODEL.md`
4. `docs/PERMISSIONS_AND_WORKFLOW.md`
5. `docs/SUPABASE_HANDOFF.md`
6. `docs/SUPABASE_SCHEMA_REFERENCE.sql`
7. `docs/MIGRATION_RECONCILIATION.md`
8. `docs/INTEGRATION_ACCEPTANCE.md`

## Frozen integration versions

- Application: v1.0.0
- Repository Contract: v1
- Employee/Evaluation Schema: v2
- Backup Format: v2
- Reconciliation Format: v1
- Diagnostic Format: v1
- Management Report Format: v1
- Handoff Manifest Format: v1

## IT-partner responsibilities

- Implement the Supabase repository adapter against Repository Contract v1.
- Connect production identity through Supabase Auth / Watchdog Workspace.
- Deploy PostgreSQL schema/constraints and Row Level Security.
- Enforce authorization server-side; frontend role checks are not security boundaries.
- Migrate production data and run reconciliation against the exported local baseline.
- Complete integration acceptance and browser smoke testing before production deployment.

## Do not rewrite unless a contract change is explicitly approved

- evaluation criteria and weights
- scoring calculations
- lifecycle transitions
- repository authorization expectations
- optimistic-concurrency semantics
- reporting/diagnostic formats
- reconciliation behavior
