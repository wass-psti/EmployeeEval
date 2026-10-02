import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import { ratingLabel } from '../domain/scoring.js';

export default function ReviewsPage() {
  const store = useStore();
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const rows = store.evaluations.filter((row) => ['Submitted','Reviewed'].includes(row.status));
  const employee = selected && store.employees.find((row) => row.id === selected.employeeId);
  const evaluator = selected && store.employees.find((row) => row.id === selected.evaluatorId);
  useEffect(() => { setComment(selected?.reviewComment || ''); setError(''); }, [selected]);
  const review = async (status) => {
    setSaving(true); setError('');
    try {
      await store.mutate((repo, actor) => repo.reviewEvaluation(selected.id, status, actor, comment, selected.revision));
      setSelected(null); setComment('');
    } catch (err) {
      setError(err?.details?.reviewComment || err.message || 'Unable to update review status.');
    } finally { setSaving(false); }
  };
  return <div className="page-stack"><div className="page-heading"><div><h1>Management Review</h1><p>Review submitted evaluations before finalization</p></div></div>{rows.length === 0 ? <EmptyState icon={ShieldCheck} title="No evaluations awaiting review" description="Submitted evaluations will appear here for management review." /> : <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Period</th><th>Score</th><th>Recommendation</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => { const emp = store.employees.find((e) => e.id === row.employeeId); return <tr key={row.id}><td><strong>{emp?.name || 'Unknown employee'}</strong><small>{emp?.department || ''}</small></td><td>{row.period}</td><td>{row.overallScore?.toFixed(2)}<small>{ratingLabel(row.overallScore)}</small></td><td>{row.recommendation}</td><td><i className={`status-chip status-${row.status.toLowerCase()}`}>{row.status}</i></td><td><button className="btn secondary compact" onClick={() => setSelected(row)}>Review</button></td></tr>; })}</tbody></table></div>}
    <Modal open={!!selected} onClose={() => !saving && setSelected(null)} title={`Review ${employee?.name || ''}`} subtitle={`${selected?.period || ''} · Evaluated by ${evaluator?.name || (selected?.evaluatorId === 'local-system' ? 'Local Setup Administrator' : 'Unknown evaluator')}`} wide footer={<><button className="btn secondary" disabled={saving} onClick={() => setSelected(null)}>Cancel</button><button className="btn danger" disabled={saving} onClick={() => review('Returned')}>Return</button>{selected?.status === 'Submitted' && <button className="btn primary" disabled={saving} onClick={() => review('Reviewed')}>{saving ? 'Saving…' : 'Mark Reviewed'}</button>}{selected?.status === 'Reviewed' && <button className="btn primary" disabled={saving} onClick={() => review('Finalized')}>{saving ? 'Saving…' : 'Finalize'}</button>}</>}>
      {selected && <div className="review-layout"><div className="score-hero"><strong>{selected.overallScore.toFixed(2)}</strong><span>{ratingLabel(selected.overallScore)}</span><small>{selected.recommendation}</small><small>Revision {selected.revision}</small></div><div className="review-copy">{error && <div className="alert error">{error}</div>}<h3>Overall Comments</h3><p>{selected.comments}</p><h3>Strengths</h3><p>{selected.strengths}</p><h3>Areas for Improvement</h3><p>{selected.improvements}</p><label>Management Review Comment<textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={selected.status === 'Submitted' ? 'Optional review note; required when returning…' : 'Final management note…'} /></label><small className="muted">Workflow: Submitted → Reviewed → Finalized. Returning an evaluation requires a reason and sends it back to the original evaluator.</small></div></div>}
    </Modal>
  </div>;
}
