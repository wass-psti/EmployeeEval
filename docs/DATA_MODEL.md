# Employee Evaluation Data Model — v0.1.0

## Employee

- `id`: string
- `employeeCode`: string, unique
- `name`: string
- `email`: string, unique
- `jobTitle`: string
- `department`: string
- `supervisorId`: nullable Employee ID
- `role`: `admin | supervisor | employee`
- `active`: boolean
- `createdAt`, `updatedAt`: ISO timestamps
- `schemaVersion`: integer

## Evaluation

- `id`: string
- `employeeId`: Employee ID
- `evaluatorId`: Employee ID or local setup actor
- `period`: string (for example `Q4 2026`)
- `ratings`: object keyed by criteria ID (`c1`…`c15`), values 1–5
- `comments`: string
- `strengths`: string
- `improvements`: string
- `recommendation`: string
- `overallScore`: weighted 1–5 score
- `status`: `Draft | Submitted | Reviewed | Finalized | Returned`
- `reviewComment`: optional string
- `reviewedBy`, `reviewedAt`, `finalizedAt`: review metadata
- `revision`: integer
- `createdAt`, `updatedAt`, `submittedAt`: ISO timestamps
- `schemaVersion`: integer

## Settings

- `activePeriod`
- `evaluationWindow`: `Open | Closed | Grace Period`
- `windowOpenDate`
- `windowCloseDate`
- `gracePeriodDays`

## Activity

Append-oriented audit events for employee, evaluation, review, settings, and import operations.
