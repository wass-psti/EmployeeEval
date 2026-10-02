import React, { useMemo, useState } from 'react';
import { Pencil, Search, Trash2, Users } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function EmployeesPage() {
  const { employees, evaluations, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const rows = useMemo(() => employees.filter((row) => `${row.name} ${row.employeeCode} ${row.department} ${row.jobTitle}`.toLowerCase().includes(search.toLowerCase())), [employees, search]);
  return <div className="page-stack"><div className="page-heading"><div><h1>Employees</h1><p>Employee directory and evaluation status overview</p></div></div><div className="toolbar"><div className="search-box"><Search size={16} /><input placeholder="Search employees…" value={search} onChange={(e) => setSearch(e.target.value)} /></div><span className="record-count">{rows.length} employees</span></div>
    {rows.length === 0 ? <EmptyState icon={Users} title="No employees found" description={employees.length ? 'Adjust your search.' : 'Employee master data is empty. Administrators can add employees in Settings.'} /> : <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Code</th><th>Department</th><th>Role</th><th>Supervisor</th><th>Latest Evaluation</th></tr></thead><tbody>{rows.map((row) => { const latest = evaluations.filter((ev) => ev.employeeId === row.id).sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt))[0]; const supervisor = employees.find((emp) => emp.id === row.supervisorId); return <tr key={row.id}><td><strong>{row.name}</strong><small>{row.jobTitle || '—'}</small></td><td>{row.employeeCode}</td><td>{row.department || '—'}</td><td><span className="role-badge">{row.role}</span></td><td>{supervisor?.name || '—'}</td><td>{latest ? <><i className={`status-chip status-${latest.status.toLowerCase()}`}>{latest.status}</i><small>{latest.period} · {latest.overallScore ? latest.overallScore.toFixed(2) : 'No score'}</small></> : <span className="muted">Not evaluated</span>}</td></tr>; })}</tbody></table></div>}
  </div>;
}
