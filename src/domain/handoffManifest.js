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
import { REQUIRED_METHODS } from '../services/repositoryContract.js';
import { buildHandoffAcceptance } from './diagnostics.js';
import { validateReleaseManifest } from './releaseManifest.js';

export function buildHandoffManifest({ health = {}, integrity = { ok:false, issues:[] }, counts = {} } = {}) {
  const acceptance = buildHandoffAcceptance({ health, integrity });
  const releaseValidation = validateReleaseManifest();
  return {
    format: 'employee-evaluation-handoff-manifest',
    formatVersion: HANDOFF_MANIFEST_FORMAT_VERSION,
    generatedAt: new Date().toISOString(),
    application: {
      name: 'Employee Evaluation',
      version: APP_VERSION,
      repositoryContractVersion: REPOSITORY_CONTRACT_VERSION,
      schemaVersion: SCHEMA_VERSION,
      backupFormatVersion: BACKUP_FORMAT_VERSION,
      reconciliationFormatVersion: RECONCILIATION_FORMAT_VERSION,
      diagnosticFormatVersion: DIAGNOSTIC_FORMAT_VERSION,
      managementReportFormatVersion: MANAGEMENT_REPORT_FORMAT_VERSION,
      handoffManifestFormatVersion: HANDOFF_MANIFEST_FORMAT_VERSION,
    },
    provider: {
      name: health.provider || 'unknown',
      available: health.available === true,
      writable: health.writable === true,
      contractVersion: health.contractVersion ?? null,
      schemaVersion: health.schemaVersion ?? null,
    },
    repositoryContract: {
      requiredMethods: [...REQUIRED_METHODS],
    },
    dataset: {
      employees: Number(counts.employees) || 0,
      evaluations: Number(counts.evaluations) || 0,
      activity: Number(counts.activity) || 0,
      integrityIssues: integrity.issues?.length || 0,
    },
    acceptance,
    releaseValidation,
    responsibilities: {
      standaloneApplication: [
        'Evaluation scoring and workflow rules',
        'Responsive UI and management-review workflow',
        'Repository Contract v1',
        'Validation, audit, reporting, backup and reconciliation tooling',
      ],
      itPartner: [
        'Supabase repository implementation',
        'Supabase Auth and Watchdog Workspace identity integration',
        'PostgreSQL schema deployment and constraints',
        'Row Level Security policies',
        'Production data migration and reconciliation',
        'Watchdog Workspace integration',
      ],
    },
  };
}
