import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Search } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';
import EvaluationForm from '../components/EvaluationForm.jsx';
import { canContinueEvaluation, canStartNewEvaluation } from '../domain/workflow.js';

export default function EvaluatePage() {
  const store = useStore();
  const [search, setSearch] = useState('');
  const [target, setTarget] = useState(null);
  const active = useMemo(() => store.employees.filter((row) => row.active !== false && row.id !== store.currentUser.id), [store.employees, store.currentUser.id]);
  const eligible = useMemo(() => store.currentUser.role === 'admin' ? active : active.filter((row) => row.supervisorId === store.currentUser.id), [active, store.currentUser]);
  const rows = eligible.filter((row) => `${row.name} ${row.department} ${row.jobTitle}`.toLowerCase().includes(search.toLowerCase()));
  const findExisting = (employeeId) => store.evaluations.find((ev) => ev.employeeId === employeeId && ev.evaluatorId === store.currentUser.id && ev.period === store.settings.activePeriod && ['Draft','Returned'].includes(ev.status));
  const save = (evaluation) => store.mutate((repo, actor) => repo.saveEvaluation(evaluation, actor));
  return <div className="page-stack"><div className="page-heading"><div><h1>Evaluate Employees</h1><p>{store.currentUser.role === 'admin' ? 'All active employees' : 'Your direct reports'} · {store.settings.activePeriod}</p></div><span className={`window-badge ${store.settings.evaluationWindow.toLowerCase().replace(' ', '-')}`}>{store.settings.evaluationWindow}</span></div>
    {store.settings.evaluationWindow === 'Closed' && <div className="alert warning">The evaluation window is closed. Existing evaluations are read-only until an administrator reopens the cycle.</div>}
    {store.settings.evaluationWindow === 'Grace Period' && <div className="alert warning">Grace Period is active. Existing Draft or Returned evaluations may be completed, but new evaluations cannot be started.</div>}
    <div className="toolbar"><div className="search-box"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team members…" /></div><span className="record-count">{rows.length} available</span></div>
    {rows.length === 0 ? <EmptyState icon={ClipboardCheck} title="No employees available to evaluate" description={store.employees.length ? 'No active employees match your role assignment or search.' : 'Add employee master data in Settings first.'} /> : <div className="card-grid">{rows.map((row) => {
      const current = store.evaluations.filter((ev) => ev.employeeId === row.id && ev.period === store.settings.activePeriod).sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt))[0];
      const owned = current?.evaluatorId === store.currentUser.id;
      const canContinue = owned && canContinueEvaluation(store.settings.evaluationWindow, current.status);
      const canStart = !current && canStartNewEvaluation(store.settings.evaluationWindow);
      const enabled = Boolean(canContinue || canStart);
      const label = owned && ['Draft','Returned'].includes(current?.status) ? 'Continue' : current ? 'Assigned' : 'Evaluate';
      return <article className="employee-card" key={row.id}><div className="avatar large">{row.name.split(' ').map((p)=>p[0]).join('').slice(0,2).toUpperCase()}</div><div className="employee-card-copy"><h3>{row.name}</h3><p>{row.jobTitle || 'Employee'}</p><span>{row.department || 'No department'}</span></div><div className="employee-card-footer">{current ? <i className={`status-chip status-${current.status.toLowerCase()}`}>{current.status}</i> : <span className="muted">Not started</span>}<button className="btn primary compact" disabled={!enabled} onClick={() => setTarget(row)}>{label}</button></div></article>;
    })}</div>}
    <EvaluationForm open={!!target} employee={target} evaluator={store.currentUser} existing={target ? findExisting(target.id) : null} settings={store.settings} onClose={() => setTarget(null)} onSave={save} />
  </div>;
}
