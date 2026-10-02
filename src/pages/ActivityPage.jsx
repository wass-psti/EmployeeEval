import React, { useMemo, useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function ActivityPage(){
  const {activity,employees}=useStore();
  const[search,setSearch]=useState('');
  const rows=useMemo(()=>activity.filter(r=>`${r.action} ${r.entityType} ${r.summary} ${r.metadata?.fromStatus||''} ${r.metadata?.toStatus||''}`.toLowerCase().includes(search.toLowerCase())),[activity,search]);
  const actorName=(id)=>id==='local-system'?'Local Setup Administrator':employees.find(e=>e.id===id)?.name||id;
  return <div className="page-stack"><div className="page-heading"><div><h1>Activity Log</h1><p>Audit trail for employee, evaluation, review, and configuration changes</p></div></div><div className="toolbar"><div className="search-box"><Search size={16}/><input placeholder="Search activity…" value={search} onChange={e=>setSearch(e.target.value)}/></div><span className="record-count">{rows.length} events</span></div>{!rows.length?<EmptyState icon={Activity} title="No activity recorded" description="Employee, evaluation, review, and settings changes will appear here."/>:<div className="timeline">{rows.map(row=><article key={row.id}><div className="timeline-dot"/><div><div className="timeline-head"><strong>{row.summary}</strong><span>{new Date(row.createdAt).toLocaleString()}</span></div><p>{row.action} · {row.entityType} · {actorName(row.actorId)}{row.metadata?.revision?` · revision ${row.metadata.revision}`:''}</p>{row.metadata?.fromStatus&&<p className="timeline-detail">{row.metadata.fromStatus} → {row.metadata.toStatus}</p>}</div></article>)}</div>}</div>;
}
