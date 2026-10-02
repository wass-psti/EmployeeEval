import React, { useMemo, useState } from 'react';
import { BarChart3, Download, Search } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { buildManagementReport } from '../domain/reporting.js';

export default function ReportsPage() {
  const store = useStore();
  const periods = useMemo(() => [...new Set(store.evaluations.map((row) => row.period).filter(Boolean))].sort().reverse(), [store.evaluations]);
  const departments = useMemo(() => [...new Set(store.employees.map((row) => row.department).filter(Boolean))].sort(), [store.employees]);
  const [period, setPeriod] = useState(store.settings.activePeriod);
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const report = useMemo(() => buildManagementReport({
    evaluations: store.evaluations,
    employees: store.employees,
    filters: { period, department, status, search },
  }), [store.evaluations, store.employees, period, department, status, search]);

  const exportCsv = () => {
    const esc=(v)=>`"${String(v??'').replaceAll('"','""')}"`;
    const header=['Employee','Employee Code','Department','Period','Status','Score','Recommendation','Comments'];
    const lines=[header,...report.rows.map(r=>{const employee=store.employees.find(e=>e.id===r.employeeId);return [employee?.name||'',employee?.employeeCode||'',employee?.department||'',r.period,r.status,r.overallScore,r.recommendation,r.comments];})].map(row=>row.map(esc).join(','));
    downloadBlob(lines.join('\n'),'text/csv',`employee-evaluation-report-${period || 'all'}.csv`);
  };
  const exportSummary = () => {
    const payload = {
      format: 'employee-evaluation-management-report',
      formatVersion: 1,
      generatedAt: new Date().toISOString(),
      filters: { period, department, status, search },
      summary: {
        evaluations: report.rows.length,
        averageScore: report.averageScore,
        rating: report.rating,
        distribution: report.distribution,
        recommendations: report.recommendations,
        statuses: report.statusCounts,
        categories: report.categories,
        departments: report.departments,
      },
    };
    downloadBlob(JSON.stringify(payload,null,2),'application/json',`employee-evaluation-management-summary-${Date.now()}.json`);
  };

  return <div className="page-stack">
    <div className="page-heading"><div><h1>Reports</h1><p>Management performance analysis across evaluation periods and departments</p></div><div className="button-row"><button className="btn secondary" disabled={!report.rows.length} onClick={exportCsv}><Download size={16}/> Export View</button><button className="btn secondary" onClick={exportSummary}><Download size={16}/> Export Summary</button></div></div>
    <section className="panel report-filter-panel"><div className="report-filters"><label>Period<select value={period} onChange={e=>setPeriod(e.target.value)}><option value="">All periods</option>{periods.map(value=><option key={value} value={value}>{value}</option>)}</select></label><label>Department<select value={department} onChange={e=>setDepartment(e.target.value)}><option value="">All departments</option>{departments.map(value=><option key={value} value={value}>{value}</option>)}</select></label><label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All reportable statuses</option><option>Submitted</option><option>Reviewed</option><option>Finalized</option></select></label><label>Employee / Recommendation<div className="inline-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employee…"/></div></label></div></section>
    {!report.rows.length ? <EmptyState icon={BarChart3} title="No evaluations match this report" description="Adjust the period, department, status, or search filters to include submitted, reviewed, or finalized evaluations." /> : <>
      <div className="stat-grid"><Stat label="Evaluations" value={report.rows.length}/><Stat label="Average Score" value={report.averageScore.toFixed(2)}/><Stat label="Rating" value={report.rating}/><Stat label="Finalized" value={report.statusCounts.Finalized||0}/></div>
      <div className="two-panel-grid"><section className="panel"><h2>Score Distribution</h2><BarList rows={Object.entries(report.distribution)} total={report.rows.length}/></section><section className="panel"><h2>Category Averages</h2><div className="bar-list">{report.categories.map(cat=><div key={cat.name}><span>{cat.name}</span><div className="bar-track"><div style={{width:`${(cat.average/5)*100}%`}}/></div><strong>{cat.average?cat.average.toFixed(2):'—'}</strong></div>)}</div></section></div>
      <div className="two-panel-grid"><section className="panel"><h2>Recommendation Mix</h2><BarList rows={Object.entries(report.recommendations)} total={report.rows.length}/></section><section className="panel"><h2>Workflow Status</h2><BarList rows={Object.entries(report.statusCounts)} total={report.rows.length}/></section></div>
      <section className="panel"><div className="section-heading"><div><h2>Department Breakdown</h2><p>Management view of participation, finalization, and average performance.</p></div></div><div className="table-wrap"><table className="compact-table"><thead><tr><th>Department</th><th>Evaluations</th><th>Finalized</th><th>Average Score</th></tr></thead><tbody>{report.departments.map(row=><tr key={row.department}><td><strong>{row.department}</strong></td><td>{row.evaluations}</td><td>{row.finalized}</td><td>{row.averageScore.toFixed(2)}</td></tr>)}</tbody></table></div></section>
    </>}
  </div>;
}

function Stat({label,value}){return <div className="stat-card report"><div><span>{label}</span><strong>{value}</strong></div></div>}
function BarList({rows,total}){return <div className="bar-list">{rows.length?rows.map(([label,count])=><div key={label}><span>{label}</span><div className="bar-track"><div style={{width:`${Math.max(6,(count/Math.max(1,total))*100)}%`}}/></div><strong>{count}</strong></div>):<p className="muted">No values</p>}</div>}
function downloadBlob(content,type,name){const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)}
