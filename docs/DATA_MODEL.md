# Employee Evaluation Data Model — Schema v2

## Employee

- `id`: string
- `employeeCode`: string, unique case-insensitively
- `name`: string
- `email`: string, unique case-insensitively
- `jobTitle`: string
- `department`: string
- `supervisorId`: nullable Employee ID; must reference an active Administrator/Supervisor
- `role`: `admin | supervisor | employee`
- `active`: boolean
- `revision`: integer, incremented on update
- `createdAt`, `updatedAt`: ISO timestamps
- `schemaVersion`: `2`

Employees referenced by evaluation history should normally be **deactivated**, not deleted.

## Evaluation

- `id`: string
- `employeeId`: Employee ID
- `evaluatorId`: Employee ID or local setup actor during standalone development
- `period`: string, e.g. `Q4 2026`
- `ratings`: object keyed by criteria ID (`c1`…`c15`), values 1–5
- `comments`: string
- `strengths`: string
- `improvements`: string
- `recommendation`: string
- `overallScore`: weighted 1–5 score
- `status`: `Draft | Submitted | Reviewed | Finalized | Returned`
- `reviewComment`: optional management review text / return reason
- `revision`: integer, incremented on every mutation
- `submittedAt`, `reviewedAt`, `finalizedAt`, `returnedAt`: lifecycle timestamps
- `reviewedBy`, `finalizedBy`, `returnedBy`: actor IDs where applicable
- `createdAt`, `updatedAt`: ISO timestamps
- `schemaVersion`: `2`

### Uniqueness

Only one evaluation assignment should exist for a given:

```text
(employeeId, period)
```

The production database should enforce this with a unique constraint.

## Settings

- `activePeriod`
- `evaluationWindow`: `Open | Closed | Grace Period`
- `windowOpenDate`
- `windowCloseDate`
- `gracePeriodDays`
- `revision`
- `schemaVersion`: `2`

## Activity

Append-oriented audit events contain:

- `id`
- `action`
- `entityType`
- `entityId`
- `summary`
- `actorId`
- `metadata` (status transitions, revision, period, score, etc.)
- `createdAt`
- `schemaVersion`
