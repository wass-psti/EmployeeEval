# Employee Evaluation v0.4.0 — Final QA Checklist

Use this checklist before promoting the standalone build to the final Supabase handoff candidate.

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

## Handoff regression

- [ ] Repository Contract remains v1.
- [ ] Employee/Evaluation Schema remains v2.
- [ ] Backup Format remains v2.
- [ ] Reconciliation Format remains v1.
- [ ] Diagnostic Format remains v1.
- [ ] No Monday SDK/BoardSDK/runtime dependency has been reintroduced.
- [ ] Backup inspection, diagnostics, reconciliation, reports, and audit export still work.
