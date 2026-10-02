import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getRepository } from '../services/repositoryProvider.js';
import { evaluateProviderCompatibility } from '../domain/diagnostics.js';

const StoreContext = createContext(null);

export function AppStoreProvider({ children }) {
  const repository = useMemo(() => getRepository(), []);
  const [employees, setEmployees] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [activity, setActivity] = useState([]);
  const [settings, setSettings] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [providerError, setProviderError] = useState('');
  const [lastRefreshAt, setLastRefreshAt] = useState(null);
  const loadedRef = useRef(false);
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('aps.employee-evaluation.current-user') || 'local-system');

  const refresh = useCallback(async () => {
    const isInitialLoad = !loadedRef.current;
    if (isInitialLoad) setLoading(true);
    else setRefreshing(true);
    try {
      const [nextHealth, nextEmployees, nextEvaluations, nextSettings, nextActivity] = await Promise.all([
        repository.health(), repository.listEmployees(), repository.listEvaluations(), repository.getSettings(), repository.listActivity(),
      ]);
      setHealth(nextHealth);
      setEmployees(nextEmployees);
      setEvaluations(nextEvaluations);
      setSettings(nextSettings);
      setActivity(nextActivity);
      setError('');
      setProviderError('');
      setLastRefreshAt(new Date().toISOString());
      loadedRef.current = true;
    } catch (err) {
      const message = err?.message || 'Unable to load Employee Evaluation data.';
      if (loadedRef.current) {
        setProviderError(message);
        setHealth((previous) => ({
          ...(previous || {}),
          available: false,
          writable: false,
          lastError: message,
        }));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [repository]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (currentUserId === 'local-system' || !employees.length) return;
    const selected = employees.find((row) => row.id === currentUserId && row.active !== false);
    if (!selected) {
      setCurrentUserId('local-system');
      localStorage.setItem('aps.employee-evaluation.current-user', 'local-system');
    }
  }, [employees, currentUserId]);

  const setCurrentUser = useCallback((id) => {
    setCurrentUserId(id);
    localStorage.setItem('aps.employee-evaluation.current-user', id);
  }, []);

  const currentUser = useMemo(() => {
    if (currentUserId === 'local-system') return { id: 'local-system', name: 'Local Setup Administrator', role: 'admin', jobTitle: 'Standalone setup session' };
    return employees.find((row) => row.id === currentUserId) || { id: 'local-system', name: 'Local Setup Administrator', role: 'admin', jobTitle: 'Standalone setup session' };
  }, [currentUserId, employees]);

  const compatibility = useMemo(() => evaluateProviderCompatibility(health || {}), [health]);
  const canMutate = compatibility.compatible && !providerError;

  const mutate = useCallback(async (operation) => {
    if (!canMutate) {
      const failed = compatibility.checks.filter((row) => !row.pass).map((row) => row.label).join(', ');
      throw Object.assign(new Error(`Writes are protected until the configured data provider passes compatibility checks${failed ? `: ${failed}` : ''}.`), { code: 'PROVIDER_PROTECTED' });
    }
    const result = await operation(repository, currentUser.id);
    await refresh();
    return result;
  }, [repository, currentUser.id, refresh, canMutate, compatibility]);

  const value = {
    repository, employees, evaluations, activity, settings, health, compatibility, canMutate,
    loading, refreshing, error, providerError, lastRefreshAt, refresh,
    currentUser, currentUserId, setCurrentUser, mutate,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used within AppStoreProvider');
  return value;
}
