import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getRepository } from '../services/repositoryProvider.js';

const StoreContext = createContext(null);

export function AppStoreProvider({ children }) {
  const repository = useMemo(() => getRepository(), []);
  const [employees, setEmployees] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [activity, setActivity] = useState([]);
  const [settings, setSettings] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('aps.employee-evaluation.current-user') || 'local-system');

  const refresh = useCallback(async () => {
    try {
      setError('');
      const [nextHealth, nextEmployees, nextEvaluations, nextSettings, nextActivity] = await Promise.all([
        repository.health(), repository.listEmployees(), repository.listEvaluations(), repository.getSettings(), repository.listActivity(),
      ]);
      setHealth(nextHealth); setEmployees(nextEmployees); setEvaluations(nextEvaluations); setSettings(nextSettings); setActivity(nextActivity);
    } catch (err) {
      setError(err.message || 'Unable to load Employee Evaluation data.');
    } finally {
      setLoading(false);
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

  const mutate = useCallback(async (operation) => {
    const result = await operation(repository, currentUser.id);
    await refresh();
    return result;
  }, [repository, currentUser.id, refresh]);

  const value = { repository, employees, evaluations, activity, settings, health, loading, error, refresh, currentUser, currentUserId, setCurrentUser, mutate };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used within AppStoreProvider');
  return value;
}
