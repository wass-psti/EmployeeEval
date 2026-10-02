import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CRITERIA_CATEGORIES } from '../domain/constants.js';
import { calculateCategoryAverage, ratingLabel } from '../domain/scoring.js';

export default function ReportsPage() {
  const store = useStore();
  const rows = store.evaluations.filter((row) => row.period === store.settings.activePeriod && ['Submitted','Reviewed','Finalized'].includes(row.status));
  const average = rows.length ? rows.reduce((s,r)=>s+r.overallScore,0)/rows.length : 0;
  const distribution = useMemo(() => rows.reduce((acc,row)=>{const label=ratingLabel(row.overallScore);acc[label]=(acc[label]||0)+1;return acc;},{}),[rows]);
  const categories = CRITERIA_CATEGORIES.map((category) => { const values = rows.map((row)=>calculateCategoryAverage(row.ratings, category.name)).filter(Boolean); return { ...category, average: values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0 }; });
  if (!rows.length) return <div className="page-stack"><div className="page-heading"><div><h1>Reports</h1><p>{store.settings.activePeriod}</p></div></div><EmptyState icon={BarChart3} title="No reportable evaluations yet" description="Submitted, reviewed, and finalized evaluations will appear in reports." /></div>;
  return <div className="page-stack"><div className="page-heading"><div><h1>Reports</h1><p>{store.settings.activePeriod} performance summary</p></div><button className="btn secondary" onClick={() => exportCsv(rows, store.employees)}>Export CSV</button></div><div className="stat-grid"><Stat label="Evaluations" value={rows.length}/><Stat label="Average Score" value={average.toFixed(2)}/><Stat label="Rating" value={ratingLabel(average)}/><Stat label="Finalized" value={rows.filter((r)=>r.status==='Finalized').length}/></div><div className="two-panel-grid"><section className="panel"><h2>Score Distribution</h2><div className="bar-list">{Object.entries(distribution).map(([label,count])=><div key={label}><span>{label}</span><div className="bar-track"><div style={{width:`${Math.max(8,(count/rows.length)*100)}%`}}/></div><strong>{count}</strong></div>)}</div></section><section className="panel"><h2>Category Averages</h2><div className="bar-list">{categories.map((cat)=><div key={cat.name}><span>{cat.name}</span><div className="bar-track"><div style={{width:`${(cat.average/5)*100}%`}}/></div><strong>{cat.average?cat.average.toFixed(2):'—'}</strong></div>)}</div></section></div></div>;
}
function Stat({label,value}){return <div className="stat-card report"><div><span>{label}</span><strong>{value}</strong></div></div>}
function exportCsv(rows, employees){const esc=(v)=>`"${String(v??'').replaceAll('"','""')}"`;const header=['Employee','Period','Status','Score','Recommendation','Comments'];const lines=[header,...rows.map(r=>[employees.find(e=>e.id===r.employeeId)?.name||'',r.period,r.status,r.overallScore,r.recommendation,r.comments])].map(row=>row.map(esc).join(','));const blob=new Blob([lines.join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='employee-evaluation-report.csv';a.click();URL.revokeObjectURL(a.href);}
