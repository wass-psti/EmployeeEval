# Permissions & Evaluation Workflow — v0.2.0

## Roles

### Administrator

- Manage employee master data.
- Configure evaluation cycle/window.
- Evaluate an active employee when no evaluation already exists for that employee/period.
- Review submitted evaluations.
- Finalize reviewed evaluations.
- Return submitted/reviewed evaluations for rework.
- Export/import full application backups.

### Supervisor

- Evaluate active direct reports only.
- Save Draft evaluations.
- Submit completed evaluations.
- Continue a Returned evaluation.
- Cannot perform management review/finalization.

### Employee

- Cannot mutate employee/evaluation/settings data.
- May view only their own **Finalized** evaluation in the Employee self-view.

## Evaluation window

| Window | New evaluation | Continue Draft/Returned | Submit |
| --- | --- | --- | --- |
| Open | Yes | Yes | Yes |
| Grace Period | No | Yes | Yes |
| Closed | No | No | No |

## Evaluation state machine

```text
Draft ───────→ Submitted ───────→ Reviewed ───────→ Finalized
  ▲                │                  │
  │                └────→ Returned ←─┘
  │                         │
  └─────────────────────────┘
```

- Evaluators can edit only `Draft` and `Returned` records.
- A return action requires a management reason.
- `Submitted`, `Reviewed`, and `Finalized` records are immutable to evaluators.
- `Finalized` is the employee-visible release state.

## Concurrency

Employee and evaluation records have an integer `revision`. Updates must match the latest revision. A stale update returns `CONFLICT` instead of overwriting newer changes.
