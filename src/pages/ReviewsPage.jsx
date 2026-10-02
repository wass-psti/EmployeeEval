import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Search, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import { ratingLabel } from '../domain/scoring.js';
import { buildReviewQueue, summarizeReviewQueue, waitingDays } from '../domain/reviewQueue.js';

export default function ReviewsPage() {
  const store = useStore();
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [agingFilter, setAgingFilter] = useState('');
  const [sort, setSort] = useState('oldest');

  const departments = useMemo(() => [...new Set(store.employees.map((row) => row.department).filter(Boolean))].sort(), [store.employees]);
  const rows = useMemo(() => buildReviewQueue({
    evaluations: store.evaluations,
    employees: store.employees,
    search,
    status: statusFilter,
    department: departmentFilter,
    aging: agingFilter,
    sort,
  }), [store.evaluations, store.employees, search, statusFilter, departmentFilter, agingFilter, sort]);
  const summary = useMemo(() => summarizeReviewQueue(rows), [rows]);
  const employee = selected && store.employees.find((row) => row.id === selected.employeeId);
  const evaluator = selected && store.employees.find((row) => row.id === selected.evaluatorId);
  const audit = useMemo(() => selected ? store.activity.filter((row) => row.entityType === 'evaluation' && row.entityId === selected.id).slice(0, 8) : [], [store.activity, selected]);
  const selectedIndex = selected ? rows.findIndex((row) => row.id === selected.id) : -1;

  useEffect(() => { setComment(selected?.reviewComment || ''); setError(''); }, [selected]);

  const moveSelection = (offset) => {
    if (!rows.length || selectedIndex < 0) return;
    const next = rows[selectedIndex + offset];
    if (next) setSelected(next);
  };

  const review = async (status) => {
    setSaving(true); setError('');
    const currentIndex = rows.findIndex((row) => row.id === selected?.id);
    const nextCandidate = rows[currentIndex + 1] || rows[currentIndex - 1] || null;
    try {
      await store.mutate((repo, actor) => repo.reviewEvaluation(selected.id, status, actor, comment, selected.revision));
      setSelected(nextCandidate?.id === selected.id ? null : nextCandidate);
      setComment('');
    } catch (err) {
      setError(err?.details?.reviewComment || err.message || 'Unable to update review status.');
    } finally { setSaving(false); }
  };

  const resetFilters = () => { setSearch(''); setStatusFilter(''); setDepartmentFilter(''); setAgingFilter(''); setSort('oldest'); };

  return <div className="page-stack">
    <div className="page-heading"><div><h1>Management Review</h1><p>Review submitted evaluations before finalization</p></div><div className="review-counts"><span>{store.evaluations.filter(r=>r.status==='Submitted').length} submitted</span><span>{store.evaluations.filter(r=>r.status==='Reviewed').length} reviewed</span></div></div>

    <div className="review-summary-grid">
      <Summary label="Matching queue" value={summary.total}/>
      <Summary label="Waiting 3+ days" value={summary.threePlus}/>
      <Summary label="Waiting 7+ days" value={summary.sevenPlus} tone={summary.sevenPlus ? 'danger' : ''}/>
      <Summary label="Average wait" value={`${summary.averageWait.toFixed(1)}d`}/>
    </div>

    <section className="panel review-toolbar">
      <div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employee, code, department, evaluator…"/></div>
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Filter review status"><option value="">Submitted + Reviewed</option><option>Submitted</option><option>Reviewed</option></select>
      <select value={departmentFilter} onChange={e=>setDepartmentFilter(e.target.value)} aria-label="Filter department"><option value="">All departments</option>{departments.map((value)=><option key={value}>{value}</option>)}</select>
      <select value={agingFilter} onChange={e=>setAgingFilter(e.target.value)} aria-label="Filter waiting age"><option value="">Any waiting age</option><option value="3">3+ days</option><option value="7">7+ days</option></select>
      <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort review queue"><option value="oldest">Oldest first</option><option value="newest">Newest first</option><option value="lowest-score">Lowest score first</option><option value="highest-score">Highest score first</option><option value="employee">Employee A–Z</option></select>
      <button className="btn secondary compact" onClick={resetFilters}>Reset</button>
    </section>

    {rows.length === 0 ? <EmptyState icon={ShieldCheck} title="No evaluations awaiting review" description="Submitted or reviewed evaluations matching the current filters will appear here." /> : <>
      <div className="table-wrap desktop-review-table"><table><thead><tr><th>Employee</th><th>Evaluator</th><th>Period</th><th>Score</th><th>Recommendation</th><th>Status</th><th>Waiting</th><th /></tr></thead><tbody>{rows.map((row) => { const emp = store.employees.find((e) => e.id === row.employeeId); const ev = store.employees.find((e) => e.id === row.evaluatorId); const days=waitingDays(row); return <tr key={row.id} className={days>=7?'aging-critical':days>=3?'aging-warning':''}><td><strong>{emp?.name || 'Unknown employee'}</strong><small>{emp?.department || ''}</small></td><td>{ev?.name || (row.evaluatorId==='local-system'?'Local Setup Administrator':'Unknown evaluator')}</td><td>{row.period}</td><td>{row.overallScore?.toFixed(2)}<small>{ratingLabel(row.overallScore)}</small></td><td>{row.recommendation}</td><td><i className={`status-chip status-${row.status.toLowerCase()}`}>{row.status}</i></td><td><span className={`aging-chip ${days>=7?'critical':days>=3?'warning':''}`}>{waitingLabel(row)}</span></td><td><button className="btn secondary compact" onClick={() => setSelected(row)}>Review</button></td></tr>; })}</tbody></table></div>
      <div className="mobile-review-list">{rows.map((row)=>{const emp=store.employees.find(e=>e.id===row.employeeId);const ev=store.employees.find(e=>e.id===row.evaluatorId);const days=waitingDays(row);return <article key={row.id} className="review-mobile-card"><div className="review-card-head"><div><strong>{emp?.name||'Unknown employee'}</strong><span>{emp?.department||'No department'} · {row.period}</span></div><i className={`status-chip status-${row.status.toLowerCase()}`}>{row.status}</i></div><div className="review-card-grid"><span>Score<strong>{row.overallScore?.toFixed(2)}</strong></span><span>Recommendation<strong>{row.recommendation}</strong></span><span>Evaluator<strong>{ev?.name||(row.evaluatorId==='local-system'?'Local Setup Administrator':'Unknown')}</strong></span><span>Waiting<strong className={days>=7?'text-danger':days>=3?'text-warning':''}>{waitingLabel(row)}</strong></span></div><button className="btn secondary" onClick={()=>setSelected(row)}>Open Review</button></article>})}</div>
    </>}

    <Modal open={!!selected} onClose={() => !saving && setSelected(null)} title={`Review ${employee?.name || ''}`} subtitle={`${selected?.period || ''} · Evaluated by ${evaluator?.name || (selected?.evaluatorId === 'local-system' ? 'Local Setup Administrator' : 'Unknown evaluator')}`} wide footer={<><div className="footer-spacer"><span className="queue-position">{selectedIndex >= 0 ? `${selectedIndex + 1} of ${rows.length} in current queue` : 'Filtered queue changed'}</span></div><button className="btn secondary" disabled={saving} onClick={() => setSelected(null)}>Cancel</button><button className="btn danger" disabled={saving||!store.canMutate} onClick={() => review('Returned')}>Return</button>{selected?.status === 'Submitted' && <button className="btn primary" disabled={saving||!store.canMutate} onClick={() => review('Reviewed')}>{saving ? 'Saving…' : 'Mark Reviewed'}</button>}{selected?.status === 'Reviewed' && <button className="btn primary" disabled={saving||!store.canMutate} onClick={() => review('Finalized')}>{saving ? 'Saving…' : 'Finalize'}</button>}</>}>
      {selected && <div className="review-modal-stack">
        <div className="review-queue-nav"><button className="btn secondary compact" disabled={selectedIndex<=0||saving} onClick={()=>moveSelection(-1)}><ArrowLeft size={14}/> Previous</button><span>{selectedIndex >= 0 ? `Queue item ${selectedIndex + 1} of ${rows.length}` : 'Queue item'}</span><button className="btn secondary compact" disabled={selectedIndex<0||selectedIndex>=rows.length-1||saving} onClick={()=>moveSelection(1)}>Next <ArrowRight size={14}/></button></div>
        <div className="review-layout"><div><div className="score-hero"><strong>{selected.overallScore.toFixed(2)}</strong><span>{ratingLabel(selected.overallScore)}</span><small>{selected.recommendation}</small><small>Revision {selected.revision}</small><small className={waitingDays(selected)>=7?'text-danger':waitingDays(selected)>=3?'text-warning':''}>Waiting {waitingLabel(selected)}</small></div>{audit.length>0&&<div className="mini-audit"><h3>Evaluation History</h3>{audit.map(row=><div key={row.id}><strong>{row.action}</strong><span>{row.summary}</span><small>{new Date(row.createdAt).toLocaleString()}</small></div>)}</div>}</div><div className="review-copy">{error && <div className="alert error">{error}</div>}<h3>Overall Comments</h3><p>{selected.comments}</p><h3>Strengths</h3><p>{selected.strengths}</p><h3>Areas for Improvement</h3><p>{selected.improvements}</p><label>Management Review Comment<textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={selected.status === 'Submitted' ? 'Optional review note; required when returning…' : 'Final management note…'} /></label><small className="muted">Workflow: Submitted → Reviewed → Finalized. Returning an evaluation requires a reason and sends it back to the original evaluator.</small></div></div>
      </div>}
    </Modal>
  </div>;
}

function Summary({label,value,tone=''}){return <div className={`review-summary ${tone}`}><span>{label}</span><strong>{value}</strong></div>}
function waitingLabel(row){const days=waitingDays(row);return days===0?'Today':`${days}d`;}
