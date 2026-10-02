import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import { ratingLabel } from '../domain/scoring.js';

export default function ReviewsPage() {
  const store = useStore();
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const rows = store.evaluations.filter((row) => ['Submitted','Reviewed'].includes(row.status));
  const employee = selected && store.employees.find((row) => row.id === selected.employeeId);
  const evaluator = selected && store.employees.find((row) => row.id === selected.evaluatorId);
  const review = async (status) => { await store.mutate((repo, actor) => repo.reviewEvaluation(selected.id, status, actor, comment)); setSelected(null); setComment(''); };
  return <div className="page-stack"><div className="page-heading"><div><h1>Management Review</h1><p>Review submitted evaluations before finalization</p></div></div>{rows.length === 0 ? <EmptyState icon={ShieldCheck} title="No evaluations awaiting review" description="Submitted evaluations will appear here for management review." /> : <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Period</th><th>Score</th><th>Recommendation</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => { const emp = store.employees.find((e) => e.id === row.employeeId); return <tr key={row.id}><td><strong>{emp?.name || 'Unknown employee'}</strong><small>{emp?.department || ''}</small></td><td>{row.period}</td><td>{row.overallScore?.toFixed(2)}<small>{ratingLabel(row.overallScore)}</small></td><td>{row.recommendation}</td><td><i className={`status-chip status-${row.status.toLowerCase()}`}>{row.status}</i></td><td><button className="btn secondary compact" onClick={() => setSelected(row)}>Review</button></td></tr>; })}</tbody></table></div>}
    <Modal open={!!selected} onClose={() => setSelected(null)} title={`Review ${employee?.name || ''}`} subtitle={`${selected?.period || ''} · Evaluated by ${evaluator?.name || 'Local administrator'}`} wide footer={<><button className="btn secondary" onClick={() => setSelected(null)}>Cancel</button><button className="btn danger" onClick={() => review('Returned')}>Return</button><button className="btn secondary" onClick={() => review('Reviewed')}>Mark Reviewed</button><button className="btn primary" onClick={() => review('Finalized')}>Finalize</button></>}>
      {selected && <div className="review-layout"><div className="score-hero"><strong>{selected.overallScore.toFixed(2)}</strong><span>{ratingLabel(selected.overallScore)}</span><small>{selected.recommendation}</small></div><div className="review-copy"><h3>Overall Comments</h3><p>{selected.comments}</p><h3>Strengths</h3><p>{selected.strengths}</p><h3>Areas for Improvement</h3><p>{selected.improvements}</p><label>Management Review Comment<textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional review note…" /></label></div></div>}
    </Modal>
  </div>;
}
