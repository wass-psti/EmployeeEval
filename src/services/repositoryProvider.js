import { localRepository } from './localRepository.js';
import { assertRepository } from './repositoryContract.js';

export function getRepository() {
  const provider = (import.meta.env.VITE_EVALUATION_PROVIDER || 'local').toLowerCase();
  if (provider !== 'local') {
    throw new Error(`Provider "${provider}" is not implemented in the standalone baseline. Supabase integration is reserved for the IT partner.`);
  }
  return assertRepository(localRepository);
}
