import React, { useMemo, useState } from 'react';
import { Activity, Download, Search } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function ActivityPage(){
  const {activity,employees}=useStore();
  const[search,setSearch]=useState('');
  const[action,setAction]=useState('');
  const[entityType,setEntityType]=useState('');
  const[actor,setActor]=useState('');
  const[page,setPage]=useState(1);
  const pageSize=25;
  const actorName=(id)=>id==='local-system'?'Local Setup Administrator':employees.find(e=>e.id===id)?.name||id;
  const actions=useMemo(()=>[...new Set(activity.map(r=>r.action).filter(Boolean))].sort(),[activity]);
  const entities=useMemo(()=>[...new Set(activity.map(r=>r.entityType).filter(Boolean))].sort(),[activity]);
  const actors=useMemo(()=>[...new Set(activity.map(r=>r.actorId).filter(Boolean))], [activity]);
  const rows=useMemo(()=>activity.filter(r=>{
    const haystack=`${r.action} ${r.entityType} ${r.summary} ${r.metadata?.fromStatus||''} ${r.metadata?.toStatus||''} ${actorName(r.actorId)}`.toLowerCase();
    return (!search||haystack.includes(search.toLowerCase()))&&(!action||r.action===action)&&(!entityType||r.entityType===entityType)&&(!actor||r.actorId===actor);
  }),[activity,search,action,entityType,actor,employees]);
  const pageCount=Math.max(1,Math.ceil(rows.length/pageSize));
  const safePage=Math.min(page,pageCount);
  const visible=rows.slice((safePage-1)*pageSize,safePage*pageSize);
  const resetPage=(setter)=>(value)=>{setter(value);setPage(1)};
  const exportCsv=()=>{
    const esc=(v)=>`"${String(v??'').replaceAll('"','""')}"`;
    const lines=[['Timestamp','Action','Entity','Summary','Actor','From Status','To Status','Revision'],...rows.map(r=>[r.createdAt,r.action,r.entityType,r.summary,actorName(r.actorId),r.metadata?.fromStatus||'',r.metadata?.toStatus||'',r.metadata?.revision||''])].map(row=>row.map(esc).join(','));
    const blob=new Blob([lines.join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`employee-evaluation-activity-${Date.now()}.csv`;a.click();URL.revokeObjectURL(a.href);
  };
  return <div className="page-stack"><div className="page-heading"><div><h1>Activity Log</h1><p>Audit trail for employee, evaluation, review, and configuration changes</p></div><button className="btn secondary" disabled={!rows.length} onClick={exportCsv}><Download size={16}/> Export View</button></div>
  <section className="panel audit-toolbar"><div className="search-box"><Search size={16}/><input placeholder="Search activity…" value={search} onChange={e=>resetPage(setSearch)(e.target.value)}/></div><select value={action} onChange={e=>resetPage(setAction)(e.target.value)}><option value="">All actions</option>{actions.map(value=><option key={value}>{value}</option>)}</select><select value={entityType} onChange={e=>resetPage(setEntityType)(e.target.value)}><option value="">All entities</option>{entities.map(value=><option key={value}>{value}</option>)}</select><select value={actor} onChange={e=>resetPage(setActor)(e.target.value)}><option value="">All actors</option>{actors.map(value=><option key={value} value={value}>{actorName(value)}</option>)}</select><span className="record-count">{rows.length} events</span></section>
  {!rows.length?<EmptyState icon={Activity} title="No activity matches the current filters" description="Employee, evaluation, review, and settings changes will appear here."/>:<><div className="timeline">{visible.map(row=><article key={row.id}><div className="timeline-dot"/><div><div className="timeline-head"><strong>{row.summary}</strong><span>{new Date(row.createdAt).toLocaleString()}</span></div><p>{row.action} · {row.entityType} · {actorName(row.actorId)}{row.metadata?.revision?` · revision ${row.metadata.revision}`:''}</p>{row.metadata?.fromStatus&&<p className="timeline-detail">{row.metadata.fromStatus} → {row.metadata.toStatus}</p>}</div></article>)}</div><div className="pagination"><span>Showing {(safePage-1)*pageSize+1}–{Math.min(safePage*pageSize,rows.length)} of {rows.length}</span><div className="button-row"><button className="btn secondary compact" disabled={safePage<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Previous</button><span>Page {safePage} of {pageCount}</span><button className="btn secondary compact" disabled={safePage>=pageCount} onClick={()=>setPage(p=>Math.min(pageCount,p+1))}>Next</button></div></div></>}</div>;
}
