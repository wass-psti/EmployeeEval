import React, { useMemo } from 'react';
import { CalendarClock, ClipboardCheck, Star, Users } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ratingLabel } from '../domain/scoring.js';

export default function DashboardPage({ onNavigate }) {
  const { employees, evaluations, settings } = useStore();
  const active = employees.filter((row) => row.active !== false);
  const periodEvals = evaluations.filter((row) => row.period === settings.activePeriod);
  const submitted = periodEvals.filter((row) => ['Submitted', 'Reviewed', 'Finalized'].includes(row.status));
  const scored = submitted.filter((row) => row.overallScore > 0);
  const average = scored.length ? scored.reduce((sum, row) => sum + row.overallScore, 0) / scored.length : 0;
  const completion = active.length ? Math.round((submitted.length / active.length) * 100) : 0;
  const statusCounts = useMemo(() => periodEvals.reduce((acc, row) => { acc[row.status] = (acc[row.status] || 0) + 1; return acc; }, {}), [periodEvals]);

  return <div className="page-stack">
    <div className="page-heading"><div><h1>Evaluation Dashboard</h1><p>{settings.activePeriod} performance cycle</p></div><span className={`window-badge ${settings.evaluationWindow.toLowerCase().replace(' ', '-')}`}>{settings.evaluationWindow}</span></div>
    <div className="stat-grid">
      <Stat icon={Users} label="Active Employees" value={active.length} sub="Employee master data" />
      <Stat icon={ClipboardCheck} label="Evaluations Completed" value={`${submitted.length}/${active.length}`} sub={`${completion}% completion`} />
      <Stat icon={Star} label="Organization Average" value={average ? average.toFixed(2) : '—'} sub={average ? ratingLabel(average) : 'Awaiting submitted evaluations'} />
      <Stat icon={CalendarClock} label="Evaluation Window" value={settings.evaluationWindow} sub={settings.windowCloseDate ? `Closes ${new Date(settings.windowCloseDate).toLocaleDateString()}` : 'No close date configured'} />
    </div>
    {active.length === 0 ? <EmptyState icon={Users} title="Start with employee master data" description="This standalone build starts clean. Add employees in Settings before beginning evaluations." action={<button className="btn primary" onClick={() => onNavigate('settings')}>Open Settings</button>} /> : <>
      <section className="panel"><div className="section-heading"><div><h2>Cycle Progress</h2><p>Submitted, reviewed, or finalized evaluations for the active period.</p></div><strong>{completion}%</strong></div><div className="progress-track"><div style={{ width: `${completion}%` }} /></div></section>
      <div className="two-panel-grid"><section className="panel"><h2>Evaluation Status</h2><div className="status-list">{['Draft','Submitted','Reviewed','Finalized','Returned'].map((status) => <div key={status}><span><i className={`status-chip status-${status.toLowerCase()}`}>{status}</i></span><strong>{statusCounts[status] || 0}</strong></div>)}</div></section><section className="panel"><h2>Quick Actions</h2><div className="quick-actions"><button className="btn primary" onClick={() => onNavigate('evaluate')}>Start Evaluation</button><button className="btn secondary" onClick={() => onNavigate('reports')}>View Reports</button><button className="btn secondary" onClick={() => onNavigate('employees')}>Employee Directory</button></div></section></div>
    </>}
  </div>;
}

function Stat({ icon: Icon, label, value, sub }) { return <div className="stat-card"><div className="stat-icon"><Icon size={20} /></div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>; }
