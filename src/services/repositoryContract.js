import { REPOSITORY_CONTRACT_VERSION, SCHEMA_VERSION } from '../domain/constants.js';

export const REQUIRED_METHODS = [
  'health', 'listEmployees', 'createEmployee', 'updateEmployee', 'deleteEmployee',
  'listEvaluations', 'saveEvaluation', 'reviewEvaluation', 'listActivity',
  'getSettings', 'saveSettings', 'exportBackup', 'importBackup'
];

export function assertRepository(repository) {
  for (const method of REQUIRED_METHODS) {
    if (typeof repository?.[method] !== 'function') throw new Error(`Repository method missing: ${method}`);
  }
  return repository;
}

export const EXPECTED_REPOSITORY_CONTRACT = REPOSITORY_CONTRACT_VERSION;
export const EXPECTED_SCHEMA_VERSION = SCHEMA_VERSION;
