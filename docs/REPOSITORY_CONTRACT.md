# Repository Contract v1

The React UI must not call Supabase directly. A future provider must implement the same async methods used by the local reference provider:

- `health()`
- `listEmployees()`
- `createEmployee(input, actorId)`
- `updateEmployee(id, patch, actorId)`
- `deleteEmployee(id, actorId)`
- `listEvaluations()`
- `saveEvaluation(input, actorId)`
- `reviewEvaluation(id, status, actorId, reviewComment, expectedRevision?)`
- `listActivity()`
- `getSettings()`
- `saveSettings(patch, actorId)`
- `exportBackup(actorId?)`
- `importBackup(backup, actorId)`

`health()` must report at minimum:

```json
{
  "available": true,
  "writable": true,
  "provider": "supabase",
  "contractVersion": 1,
  "schemaVersion": 2
}
```

## Behavioral expectations

The provider is responsible for enforcing, not merely displaying:

- role authorization;
- direct-report evaluation eligibility;
- one evaluation per employee/period;
- evaluation-window restrictions;
- valid state transitions;
- optimistic concurrency / revision conflicts;
- protected historical references;
- audit-event persistence.

Recommended error codes used by the current application include:

- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `DUPLICATE`
- `CONFLICT`
- `IN_USE`
- `WINDOW_CLOSED`
- `WINDOW_RESTRICTED`
- `IMMUTABLE_EVALUATION`
- `INVALID_TRANSITION`

The LocalRepository is the behavioral reference; Supabase/RLS should provide the production enforcement boundary.
