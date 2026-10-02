import test from 'node:test';
import assert from 'node:assert/strict';
import { RELEASE_MANIFEST, validateReleaseManifest } from '../src/domain/releaseManifest.js';

test('v0.5.0 release manifest preserves frozen integration contracts', () => {
  const result = validateReleaseManifest(RELEASE_MANIFEST);
  assert.equal(result.valid, true);
  assert.deepEqual(result.problems, []);
  assert.equal(RELEASE_MANIFEST.managementReportFormatVersion, 1);
  assert.equal(RELEASE_MANIFEST.handoffManifestFormatVersion, 1);
});

test('release manifest rejects accidental schema, contract, or format drift', () => {
  assert.equal(validateReleaseManifest({ ...RELEASE_MANIFEST, schemaVersion: 3 }).valid, false);
  assert.equal(validateReleaseManifest({ ...RELEASE_MANIFEST, repositoryContractVersion: 2 }).valid, false);
  assert.equal(validateReleaseManifest({ ...RELEASE_MANIFEST, managementReportFormatVersion: 2 }).valid, false);
  assert.equal(validateReleaseManifest({ ...RELEASE_MANIFEST, handoffManifestFormatVersion: 2 }).valid, false);
});
