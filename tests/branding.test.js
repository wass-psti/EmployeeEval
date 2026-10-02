import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

test('Watchdog brand assets are packaged for the standalone UI', () => {
  assert.equal(existsSync(resolve(root, 'public/brand/watchdog-evaluation-logo.png')), true);
  assert.equal(existsSync(resolve(root, 'public/favicon.ico')), true);
});

test('application shell references the packaged Watchdog brand identity', () => {
  const app = readFileSync(resolve(root, 'src/App.jsx'), 'utf8');
  assert.match(app, /watchdog-evaluation-logo\.png/);
  assert.match(app, /Watchdog Automation/);
});

test('v1.1.0 branding does not change frozen integration contract versions', async () => {
  const { RELEASE_MANIFEST } = await import('../src/domain/releaseManifest.js');
  assert.equal(RELEASE_MANIFEST.applicationVersion, '1.1.0');
  assert.equal(RELEASE_MANIFEST.repositoryContractVersion, 1);
  assert.equal(RELEASE_MANIFEST.schemaVersion, 2);
  assert.equal(RELEASE_MANIFEST.backupFormatVersion, 2);
});
