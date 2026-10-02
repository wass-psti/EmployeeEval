# Employee Evaluation v1.1.0 — Watchdog Branded UI Overhaul

v1.1.0 is a presentation and usability release built on the stable v1.0.0 standalone handoff baseline. It does not change the Repository Contract, employee/evaluation schema, backup format, reconciliation format, diagnostic format, management-report format, or handoff-manifest format.

## Visual identity

- Added the supplied Watchdog Automation evaluation logo to the application header, sidebar footer, loading state, and error state.
- Added a Watchdog-branded favicon and browser theme color.
- Introduced a teal/red/dark-slate visual system derived from the supplied branding while preserving accessible contrast.
- Refined cards, forms, tables, buttons, navigation, focus states, modal surfaces, and empty states for a more cohesive workspace appearance.

## Dashboard

- Added a branded performance-workspace hero section.
- Added a segmented review-cycle progress display for finalized, in-progress, and not-started employees.
- Improved KPI cards with visual category accents.
- Improved quick-action hierarchy and cycle readability.

## Management Review

- Added a four-stage workflow strip showing Evaluation → Management Review → Finalization → Share Results.
- Retained queue aging, filtering, responsive cards, and previous/next navigation from v1.0.0.

## Reports

- Added a competency-summary section with circular category score indicators and star-based visual meters.
- Preserved all report calculations and exports; the new visuals are presentation-only.

## Integration safety

The following remain frozen:

- Repository Contract: v1
- Employee/Evaluation Schema: v2
- Backup Format: v2
- Reconciliation Format: v1
- Diagnostic Format: v1
- Management Report Format: v1
- Handoff Manifest Format: v1

No Supabase queries or Monday runtime dependencies were introduced.
