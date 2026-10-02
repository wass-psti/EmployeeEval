import {
  APP_VERSION,
  BACKUP_FORMAT_VERSION,
  DIAGNOSTIC_FORMAT_VERSION,
  HANDOFF_MANIFEST_FORMAT_VERSION,
  MANAGEMENT_REPORT_FORMAT_VERSION,
  RECONCILIATION_FORMAT_VERSION,
  REPOSITORY_CONTRACT_VERSION,
  SCHEMA_VERSION,
} from './constants.js';

export const RELEASE_MANIFEST = Object.freeze({
  applicationVersion: APP_VERSION,
  repositoryContractVersion: REPOSITORY_CONTRACT_VERSION,
  schemaVersion: SCHEMA_VERSION,
  backupFormatVersion: BACKUP_FORMAT_VERSION,
  reconciliationFormatVersion: RECONCILIATION_FORMAT_VERSION,
  diagnosticFormatVersion: DIAGNOSTIC_FORMAT_VERSION,
  managementReportFormatVersion: MANAGEMENT_REPORT_FORMAT_VERSION,
  handoffManifestFormatVersion: HANDOFF_MANIFEST_FORMAT_VERSION,
});

export function validateReleaseManifest(manifest = RELEASE_MANIFEST) {
  const problems = [];
  if (!/^1\.1\.0$/.test(String(manifest.applicationVersion))) problems.push('Application version must be 1.1.0 for this release.');
  if (Number(manifest.repositoryContractVersion) !== 1) problems.push('Repository Contract must remain v1.');
  if (Number(manifest.schemaVersion) !== 2) problems.push('Employee/Evaluation schema must remain v2.');
  if (Number(manifest.backupFormatVersion) !== 2) problems.push('Backup format must remain v2.');
  if (Number(manifest.reconciliationFormatVersion) !== 1) problems.push('Reconciliation format must remain v1.');
  if (Number(manifest.diagnosticFormatVersion) !== 1) problems.push('Diagnostic format must remain v1.');
  if (Number(manifest.managementReportFormatVersion) !== 1) problems.push('Management Report format must remain v1.');
  if (Number(manifest.handoffManifestFormatVersion) !== 1) problems.push('Handoff Manifest format must remain v1.');
  return { valid: problems.length === 0, problems };
}
