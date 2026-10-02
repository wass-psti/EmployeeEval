# Repository Contract v1

The React UI must not call Supabase directly. A future provider should implement the same async methods used by the local reference provider:

- `health()`
- `listEmployees()`
- `createEmployee(input, actorId)`
- `updateEmployee(id, patch, actorId)`
- `deleteEmployee(id, actorId)`
- `listEvaluations()`
- `saveEvaluation(input, actorId)`
- `reviewEvaluation(id, status, actorId, reviewComment)`
- `listActivity()`
- `getSettings()`
- `saveSettings(patch, actorId)`
- `exportBackup()`
- `importBackup(backup, actorId)`

`health()` must report at minimum:

```json
{
  "available": true,
  "writable": true,
  "provider": "supabase",
  "contractVersion": 1,
  "schemaVersion": 1
}
```

The LocalRepository is the behavioral reference, not the production storage implementation.
