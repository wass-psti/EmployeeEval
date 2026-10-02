import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Save, Send, Star } from 'lucide-react';
import Modal from './Modal.jsx';
import { CRITERIA_CATEGORIES, EVALUATION_CRITERIA, RECOMMENDATIONS, currentPeriod } from '../domain/constants.js';
import { calculateCategoryAverage, calculateOverallScore, ratedCount, ratingLabel } from '../domain/scoring.js';

const blank = (employeeId, evaluatorId, period) => ({ employeeId, evaluatorId, period, ratings: {}, comments: '', strengths: '', improvements: '', recommendation: '', status: 'Draft' });

export default function EvaluationForm({ open, employee, evaluator, existing, settings, onClose, onSave }) {
  const [form, setForm] = useState(blank(employee?.id, evaluator?.id, settings?.activePeriod || currentPeriod()));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!open || !employee) return;
    setForm(existing ? { ...existing, ratings: { ...existing.ratings } } : blank(employee.id, evaluator.id, settings?.activePeriod || currentPeriod()));
    setErrors({});
  }, [open, employee, evaluator, existing, settings]);
  const score = useMemo(() => calculateOverallScore(form.ratings), [form.ratings]);
  const count = useMemo(() => ratedCount(form.ratings), [form.ratings]);
  if (!employee) return null;
  const submit = async (status) => {
    setSaving(true); setErrors({});
    try { await onSave({ ...form, status }); onClose(); } catch (err) { setErrors(err.details || { general: err.message }); } finally { setSaving(false); }
  };
  const footer = <><div className="footer-spacer" /><button className="btn secondary" onClick={onClose}>Cancel</button><button className="btn secondary" onClick={() => submit('Draft')} disabled={saving}><Save size={16} /> Save Draft</button><button className="btn primary" onClick={() => submit('Submitted')} disabled={saving}><Send size={16} /> Submit</button></>;
  return <Modal open={open} onClose={onClose} wide title={`Evaluate ${employee.name}`} subtitle={`${employee.jobTitle || 'Employee'} · ${settings?.activePeriod || currentPeriod()}`} footer={footer}>
    {errors.general && <div className="alert error">{errors.general}</div>}
    {errors.ratings && <div className="alert warning"><AlertTriangle size={16} /> {errors.ratings}</div>}
    <div className="score-summary"><div><span>Criteria Rated</span><strong>{count}/{EVALUATION_CRITERIA.length}</strong></div><div><span>Overall Score</span><strong>{score ? score.toFixed(2) : '—'}</strong></div><div><span>Rating</span><strong>{score ? ratingLabel(score) : 'Awaiting ratings'}</strong></div></div>
    <div className="criteria-stack">
      {CRITERIA_CATEGORIES.map((category) => {
        const criteria = EVALUATION_CRITERIA.filter((row) => row.category === category.name);
        const average = calculateCategoryAverage(form.ratings, category.name);
        return <section className="criteria-card" key={category.name}><div className="criteria-heading"><div><h3>{category.name}</h3><p>{category.weight}% of overall evaluation</p></div><strong>{average ? average.toFixed(2) : '—'}</strong></div>
          {criteria.map((criterion) => <div className="criterion-row" key={criterion.id}><div className="criterion-copy"><strong>{criterion.name}</strong><span>{criterion.description}</span></div><div className="rating-buttons" aria-label={`${criterion.name} rating`}>{[1,2,3,4,5].map((value) => <button key={value} className={Number(form.ratings[criterion.id]) === value ? 'selected' : ''} onClick={() => setForm((prev) => ({ ...prev, ratings: { ...prev.ratings, [criterion.id]: value } }))}><Star size={14} />{value}</button>)}</div></div>)}
        </section>;
      })}
    </div>
    <div className="form-stack">
      <label>Overall Comments<textarea value={form.comments} onChange={(e) => setForm((prev) => ({ ...prev, comments: e.target.value }))} placeholder="Overall assessment of performance…" />{errors.comments && <small className="error-text">{errors.comments}</small>}</label>
      <label>Key Strengths<textarea value={form.strengths} onChange={(e) => setForm((prev) => ({ ...prev, strengths: e.target.value }))} placeholder="Notable strengths and achievements…" />{errors.strengths && <small className="error-text">{errors.strengths}</small>}</label>
      <label>Areas for Improvement<textarea value={form.improvements} onChange={(e) => setForm((prev) => ({ ...prev, improvements: e.target.value }))} placeholder="Development opportunities…" />{errors.improvements && <small className="error-text">{errors.improvements}</small>}</label>
      <div><label>Recommendation</label><div className="recommendation-grid">{RECOMMENDATIONS.map((rec) => <button key={rec} className={`recommendation ${form.recommendation === rec ? 'selected' : ''}`} onClick={() => setForm((prev) => ({ ...prev, recommendation: rec }))}>{form.recommendation === rec && <Check size={15} />}{rec}</button>)}</div>{errors.recommendation && <small className="error-text">{errors.recommendation}</small>}</div>
    </div>
  </Modal>;
}
