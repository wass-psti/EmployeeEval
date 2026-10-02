import React, { useMemo } from 'react';
import { CalendarClock, ClipboardCheck, Sparkles, Star, Users } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ratingLabel } from '../domain/scoring.js';

export default function DashboardPage({ onNavigate }) {
  const { employees, evaluations, settings } = useStore();
  const active = employees.filter((row) => row.active !== false);
  const periodEvals = evaluations.filter((row) => row.period === settings.activePeriod);
  const submitted = periodEvals.filter((row) => ['Submitted', 'Reviewed', 'Finalized'].includes(row.status));
  const completedEmployeeIds = new Set(submitted.map((row) => row.employeeId));
  const finalizedEmployeeIds = new Set(periodEvals.filter((row) => row.status === 'Finalized').map((row) => row.employeeId));
  const startedEmployeeIds = new Set(periodEvals.map((row) => row.employeeId));
  const scored = submitted.filter((row) => row.overallScore > 0);
  const average = scored.length ? scored.reduce((sum, row) => sum + row.overallScore, 0) / scored.length : 0;
  const completion = active.length ? Math.round((completedEmployeeIds.size / active.length) * 100) : 0;
  const finalizedPct = active.length ? Math.round((finalizedEmployeeIds.size / active.length) * 100) : 0;
  const receivingCount = Math.max(0, startedEmployeeIds.size - finalizedEmployeeIds.size);
  const receivingPct = active.length ? Math.round((receivingCount / active.length) * 100) : 0;
  const notStartedCount = Math.max(0, active.length - startedEmployeeIds.size);
  const notStartedPct = Math.max(0, 100 - finalizedPct - receivingPct);
  const statusCounts = useMemo(() => periodEvals.reduce((acc, row) => { acc[row.status] = (acc[row.status] || 0) + 1; return acc; }, {}), [periodEvals]);

  return <div className="page-stack">
    <section className="brand-hero">
      <div className="brand-hero-copy">
        <span className="eyebrow"><Sparkles size={14}/> Watchdog Automation</span>
        <h1>Employee Evaluation</h1>
        <p>Performance review workspace for {settings.activePeriod}. Track progress, review results, and keep every evaluation stage visible.</p>
        <div className="hero-actions"><button className="btn primary" onClick={() => onNavigate('evaluate')}>Start Evaluation</button><button className="btn hero-secondary" onClick={() => onNavigate('reports')}>Open Reports</button></div>
      </div>
      <div className="brand-hero-art" aria-hidden="true"><img src="/brand/watchdog-evaluation-logo.png" alt=""/></div>
      <span className={`window-badge hero-window ${settings.evaluationWindow.toLowerCase().replace(' ', '-')}`}>{settings.evaluationWindow}</span>
    </section>

    <div className="stat-grid">
      <Stat icon={Users} label="Active Employees" value={active.length} sub="Employee master data" tone="teal" />
      <Stat icon={ClipboardCheck} label="Evaluations Completed" value={`${completedEmployeeIds.size}/${active.length}`} sub={`${completion}% completion`} tone="blue" />
      <Stat icon={Star} label="Organization Average" value={average ? average.toFixed(2) : '—'} sub={average ? ratingLabel(average) : 'Awaiting submitted evaluations'} tone="gold" />
      <Stat icon={CalendarClock} label="Evaluation Window" value={settings.evaluationWindow} sub={settings.windowCloseDate ? `Closes ${new Date(settings.windowCloseDate).toLocaleDateString()}` : 'No close date configured'} tone="red" />
    </div>

    {active.length === 0 ? <EmptyState icon={Users} title="Start with employee master data" description="This standalone build starts clean. Add employees in Settings before beginning evaluations." action={<button className="btn primary" onClick={() => onNavigate('settings')}>Open Settings</button>} /> : <>
      <section className="panel cycle-progress-panel">
        <div className="section-heading"><div><h2>Review cycle progress</h2><p>At-a-glance status across all active employees in the current evaluation period.</p></div><strong className="progress-total">{completion}% evaluated</strong></div>
        <div className="segmented-progress" aria-label={`${finalizedPct}% finalized, ${receivingPct}% in progress, ${notStartedPct}% not started`}>
          <span className="segment completed" style={{width:`${finalizedPct}%`}}/>
          <span className="segment receiving" style={{width:`${receivingPct}%`}}/>
          <span className="segment not-started" style={{width:`${notStartedPct}%`}}/>
        </div>
        <div className="progress-legend">
          <Legend tone="completed" label="Finalized" count={finalizedEmployeeIds.size} pct={finalizedPct}/>
          <Legend tone="receiving" label="Still receiving / review" count={receivingCount} pct={receivingPct}/>
          <Legend tone="not-started" label="Not started" count={notStartedCount} pct={notStartedPct}/>
        </div>
      </section>

      <div className="two-panel-grid">
        <section className="panel"><div className="section-heading"><div><h2>Evaluation status</h2><p>Current workflow distribution for {settings.activePeriod}.</p></div></div><div className="status-list">{['Draft','Submitted','Reviewed','Finalized','Returned'].map((status) => <div key={status}><span><i className={`status-chip status-${status.toLowerCase()}`}>{status}</i></span><strong>{statusCounts[status] || 0}</strong></div>)}</div></section>
        <section className="panel quick-action-panel"><div className="section-heading"><div><h2>Quick actions</h2><p>Continue the most common performance-management tasks.</p></div></div><div className="quick-actions branded-actions"><button className="btn primary" onClick={() => onNavigate('evaluate')}>Start Evaluation</button><button className="btn secondary" onClick={() => onNavigate('reports')}>View Reports</button><button className="btn secondary" onClick={() => onNavigate('employees')}>Employee Directory</button></div></section>
      </div>
    </>}
  </div>;
}

function Stat({ icon: Icon, label, value, sub, tone }) { return <div className={`stat-card branded-stat ${tone||''}`}><div className="stat-icon"><Icon size={20} /></div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>; }
function Legend({tone,label,count,pct}) { return <div className="legend-item"><span className={`legend-dot ${tone}`}/><div><strong>{label}</strong><span>{count} employee{count===1?'':'s'}</span></div><b>{pct}%</b></div>; }
