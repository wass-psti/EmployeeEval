import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import { DEFAULT_DEPARTMENTS, ROLE_LABELS } from '../domain/constants.js';

const blank = { employeeCode: '', name: '', email: '', jobTitle: '', department: '', supervisorId: '', role: 'employee', active: true };

export default function EmployeeForm({ open, employee, employees, onClose, onSave }) {
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) { setForm(employee ? { ...employee } : blank); setErrors({}); } }, [open, employee]);
  const supervisors = useMemo(() => employees.filter((row) => row.id !== employee?.id && ['admin', 'supervisor'].includes(row.role) && row.active !== false), [employees, employee]);
  const field = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = async () => {
    setSaving(true); setErrors({});
    try { await onSave(form); onClose(); } catch (err) { setErrors(err.details || { general: err.message }); } finally { setSaving(false); }
  };
  return <Modal open={open} onClose={onClose} title={employee ? 'Edit Employee' : 'Add Employee'} subtitle="Employee master data for evaluation assignment" footer={<><button className="btn secondary" onClick={onClose}>Cancel</button><button className="btn primary" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save Employee'}</button></>}>
    {errors.general && <div className="alert error">{errors.general}</div>}
    <div className="form-grid two">
      <label>Employee Code<input value={form.employeeCode || ''} onChange={(e) => field('employeeCode', e.target.value)} />{errors.employeeCode && <small className="error-text">{errors.employeeCode}</small>}</label>
      <label>Full Name<input value={form.name || ''} onChange={(e) => field('name', e.target.value)} />{errors.name && <small className="error-text">{errors.name}</small>}</label>
      <label>Email<input type="email" value={form.email || ''} onChange={(e) => field('email', e.target.value)} />{errors.email && <small className="error-text">{errors.email}</small>}</label>
      <label>Job Title<input value={form.jobTitle || ''} onChange={(e) => field('jobTitle', e.target.value)} /></label>
      <label>Department<select value={form.department || ''} onChange={(e) => field('department', e.target.value)}><option value="">Select department</option>{DEFAULT_DEPARTMENTS.map((dept) => <option key={dept}>{dept}</option>)}</select></label>
      <label>Role<select value={form.role} onChange={(e) => field('role', e.target.value)}>{Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{errors.role && <small className="error-text">{errors.role}</small>}</label>
      <label>Supervisor<select value={form.supervisorId || ''} onChange={(e) => field('supervisorId', e.target.value)}><option value="">None</option>{supervisors.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select>{errors.supervisorId && <small className="error-text">{errors.supervisorId}</small>}</label>
      <label className="checkbox-label"><input type="checkbox" checked={form.active !== false} onChange={(e) => field('active', e.target.checked)} /> Active employee</label>
    </div>
  </Modal>;
}
