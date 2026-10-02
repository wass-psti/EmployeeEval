import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHandoffManifest } from '../src/domain/handoffManifest.js';
import { REPOSITORY_CONTRACT_VERSION, SCHEMA_VERSION } from '../src/domain/constants.js';

const health = {
  provider: 'local',
  available: true,
  writable: true,
  contractVersion: REPOSITORY_CONTRACT_VERSION,
  schemaVersion: SCHEMA_VERSION,
};

const integrity = { ok: true, issues: [] };

test('handoff manifest reports frozen versions and a ready provider', () => {
  const manifest = buildHandoffManifest({
    health,
    integrity,
    counts: { employees: 7, evaluations: 12, activity: 23 },
  });
  assert.equal(manifest.format, 'employee-evaluation-handoff-manifest');
  assert.equal(manifest.formatVersion, 1);
  assert.equal(manifest.application.version, '0.5.0');
  assert.equal(manifest.application.repositoryContractVersion, 1);
  assert.equal(manifest.application.schemaVersion, 2);
  assert.equal(manifest.acceptance.ready, true);
  assert.equal(manifest.releaseValidation.valid, true);
  assert.equal(manifest.dataset.employees, 7);
  assert.ok(manifest.repositoryContract.requiredMethods.includes('health'));
  assert.ok(manifest.repositoryContract.requiredMethods.includes('saveEvaluation'));
});

test('handoff manifest contains counts but no raw employee or evaluation datasets', () => {
  const manifest = buildHandoffManifest({ health, integrity, counts: { employees: 1, evaluations: 2, activity: 3 } });
  assert.equal('employees' in manifest, false);
  assert.equal('evaluations' in manifest, false);
  assert.equal(manifest.dataset.evaluations, 2);
});

test('handoff manifest reflects failed provider readiness', () => {
  const manifest = buildHandoffManifest({
    health: { ...health, writable: false },
    integrity,
    counts: {},
  });
  assert.equal(manifest.acceptance.ready, false);
});
