# Changelog

## v0.1.0 — Standalone Foundation

- Migrated the application identity to **Employee Evaluation**.
- Removed Monday.com SDK, BoardSDK, Monday Storage, board item, board status, and Monday user dependencies.
- Introduced an asynchronous Repository Contract v1 with a LocalStorage reference provider.
- Removed hardcoded employee names and email-to-role mappings from runtime application logic.
- Added clean employee master data with department, role, supervisor, active state, employee code, and contact fields.
- Added local session switching for standalone role testing before authentication integration.
- Preserved the original 15 weighted evaluation criteria and rating model.
- Added Draft, Submitted, Reviewed, Finalized, and Returned evaluation states.
- Added management review, employee self-view, reports, activity history, backup/import, and CSV report export.
- Added responsive evaluation forms and mobile layouts.
- Starts with zero employee and evaluation records.
