import React from 'react';
import { UserRoundCheck } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CRITERIA_CATEGORIES } from '../domain/constants.js';
import { calculateCategoryAverage, ratingLabel } from '../domain/scoring.js';

export default function MyEvaluationPage(){
  const store=useStore();
  if(store.currentUser.id==='local-system')return <div className="page-stack"><div className="page-heading"><div><h1>My Evaluation</h1><p>Employee self-view</p></div></div><EmptyState icon={UserRoundCheck} title="Select an employee session" description="The local setup administrator is not an employee record. Select an employee from the Local session menu to test the employee self-view." /></div>;
  const rows=store.evaluations.filter(r=>r.employeeId===store.currentUser.id&&r.status==='Finalized').sort((a,b)=>new Date(b.finalizedAt||b.updatedAt)-new Date(a.finalizedAt||a.updatedAt));
  const latest=rows[0];
  if(!latest)return <div className="page-stack"><div className="page-heading"><div><h1>My Evaluation</h1><p>{store.currentUser.name}</p></div></div><EmptyState icon={UserRoundCheck} title="No finalized evaluation yet" description="Only evaluations finalized by management are released to the employee self-view." /></div>;
  return <div className="page-stack"><div className="page-heading"><div><h1>My Evaluation</h1><p>{latest.period} · Finalized</p></div></div><section className="evaluation-hero"><div className="score-hero"><strong>{latest.overallScore.toFixed(2)}</strong><span>{ratingLabel(latest.overallScore)}</span><small>{latest.recommendation}</small></div><div className="category-cards">{CRITERIA_CATEGORIES.map(c=><div key={c.name}><span>{c.name}</span><strong>{calculateCategoryAverage(latest.ratings,c.name).toFixed(2)}</strong><small>{c.weight}% weight</small></div>)}</div></section><div className="two-panel-grid"><section className="panel"><h2>Performance Feedback</h2><h3>Overall Comments</h3><p>{latest.comments}</p><h3>Key Strengths</h3><p>{latest.strengths}</p><h3>Areas for Improvement</h3><p>{latest.improvements}</p></section><section className="panel"><h2>Management Review</h2><p>{latest.reviewComment||'No additional management comment.'}</p><dl className="details-list"><div><dt>Status</dt><dd>Finalized</dd></div><div><dt>Period</dt><dd>{latest.period}</dd></div><div><dt>Recommendation</dt><dd>{latest.recommendation}</dd></div><div><dt>Finalized</dt><dd>{latest.finalizedAt ? new Date(latest.finalizedAt).toLocaleString() : '—'}</dd></div></dl></section></div></div>;
}
