# Employee Evaluation v1.1.0 — Final QA Checklist

Use this checklist before handing the standalone release to the IT partner or enabling a production provider.

## Build and automated validation

- [ ] `npm install` completes without dependency errors.
- [ ] `npm test` passes.
- [ ] `npm run test:handoff` passes.
- [ ] `npm run build` produces a clean Vite production bundle.
- [ ] `npm run check:release` passes end to end.
- [ ] Browser console has no uncaught errors during the smoke test.

## Responsive UI

Test at minimum at 1366×768, 1280×720, 1024×768, 768×1024, and a phone-sized viewport.

- [ ] Navigation remains reachable without fullscreen mode.
- [ ] Evaluation and employee forms keep header/footer actions accessible.
- [ ] Management Review switches to mobile cards on narrow displays.
- [ ] Review modal remains usable in short-height browser windows.
- [ ] No input, table, modal, or action button is clipped horizontally.
- [ ] Sidebar overlay closes correctly on touch/mobile layouts.

## Management review productivity

- [ ] Search works for employee name/code, department, evaluator, period, and recommendation.
- [ ] Status, department, aging, and sorting controls combine correctly.
- [ ] 3-day and 7-day queue aging counts are correct.
- [ ] Previous/Next review navigation respects the current filtered queue.
- [ ] Mark Reviewed, Finalize, and Return preserve workflow rules.
- [ ] A required reason is still enforced when returning an evaluation.
- [ ] Audit history remains visible and accurate after transitions.

## Provider resilience

- [ ] A healthy local provider enables mutations.
- [ ] An incompatible/read-only provider activates protected mode.
- [ ] A refresh failure after successful loading keeps the last known data visible.
- [ ] Writes remain disabled while refresh/provider recovery is unresolved.
- [ ] Retry Provider restores writable mode after the provider becomes healthy.
- [ ] Initial provider failure still shows the dedicated load-recovery screen.

## Accessibility and recovery

- [ ] Skip-to-content appears when keyboard focused.
- [ ] Modal focus remains trapped inside the active dialog.
- [ ] Escape closes dialogs when the current operation allows closure.
- [ ] Focus returns to the initiating control after a modal closes.
- [ ] Unexpected render failure shows the controlled Error Boundary recovery view.
- [ ] Employee and Evaluation forms warn before discarding unsaved changes.
- [ ] Refreshing/closing the browser with unsaved form changes triggers the browser unload warning.
- [ ] Destructive employee deletion uses the application confirmation dialog; no native browser confirm prompt appears.

## Handoff regression

- [ ] Repository Contract remains v1.
- [ ] Employee/Evaluation Schema remains v2.
- [ ] Backup Format remains v2.
- [ ] Reconciliation Format remains v1.
- [ ] Diagnostic Format remains v1.
- [ ] Management Report Format remains v1.
- [ ] Handoff Manifest Format remains v1.
- [ ] No Monday SDK/BoardSDK/runtime dependency has been reintroduced.
- [ ] Backup inspection, diagnostics, reconciliation, reports, audit export, and Handoff Manifest export still work.

## v1.1.0 Watchdog branding checks

- [ ] Watchdog Automation logo renders cleanly in the top bar and sidebar footer.
- [ ] Browser favicon uses the supplied branded icon.
- [ ] Dashboard hero remains readable at 1366×768, 1280×720, tablet, and mobile widths.
- [ ] Segmented cycle progress accurately reflects finalized, in-progress, and not-started employees.
- [ ] Competency-summary score rings remain readable and do not clip on narrow screens.
- [ ] Management Review workflow strip collapses cleanly on tablet/mobile widths.
- [ ] Branded colors preserve readable contrast for buttons, status badges, tables, and forms.
