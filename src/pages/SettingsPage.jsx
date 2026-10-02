import React, { useMemo, useRef, useState } from 'react';
import { CheckCircle2, Database, Download, FileSearch, Plus, RefreshCw, ShieldCheck, Trash2, Upload, Users, XCircle } from 'lucide-react';
import { useStore } from '../context/AppStore.jsx';
import EmployeeForm from '../components/EmployeeForm.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import { REPOSITORY_CONTRACT_VERSION, SCHEMA_VERSION } from '../domain/constants.js';
import { inspectIntegrity } from '../domain/integrity.js';
import { inspectBackup } from '../domain/backupInspection.js';
import { buildDiagnosticReport, buildHandoffAcceptance } from '../domain/diagnostics.js';
import { buildReconciliationReport, compareReconciliation } from '../domain/reconciliation.js';
import { buildHandoffManifest } from '../domain/handoffManifest.js';

export default function SettingsPage(){
  const store=useStore();
  const[editing,setEditing]=useState(null);
  const[formOpen,setFormOpen]=useState(false);
  const[message,setMessage]=useState(null);
  const[backupCandidate,setBackupCandidate]=useState(null);
  const[backupInspection,setBackupInspection]=useState(null);
  const[reconciliationResult,setReconciliationResult]=useState(null);
  const[pendingDelete,setPendingDelete]=useState(null);
  const importRef=useRef(null);
  const compareRef=useRef(null);
  const integrity=useMemo(()=>inspectIntegrity({employees:store.employees,evaluations:store.evaluations,settings:store.settings||{}}),[store.employees,store.evaluations,store.settings]);
  const handoff=useMemo(()=>buildHandoffAcceptance({health:store.health||{},integrity}),[store.health,integrity]);
  const reconciliation=useMemo(()=>buildReconciliationReport({employees:store.employees,evaluations:store.evaluations,settings:store.settings||{},activity:store.activity}),[store.employees,store.evaluations,store.settings,store.activity]);
  const run=async(action,success)=>{setMessage(null);try{await action();if(success)setMessage({type:'success',text:success});}catch(err){setMessage({type:'error',text:err.message||'Operation failed.'});}};
  const saveEmployee=(form)=>store.mutate((repo,actor)=>form.id?repo.updateEmployee(form.id,form,actor):repo.createEmployee(form,actor));
  const removeEmployee=(row)=>setPendingDelete(row);
  const confirmDeleteEmployee=async()=>{
    const row=pendingDelete;
    if(!row)return;
    setPendingDelete(null);
    await run(()=>store.mutate((repo,actor)=>repo.deleteEmployee(row.id,actor)),'Employee deleted.');
  };
  const saveSettings=(patch)=>run(()=>store.mutate((repo,actor)=>repo.saveSettings(patch,actor)),'Evaluation settings updated.');
  const exportBackup=()=>run(async()=>{const data=await store.repository.exportBackup(store.currentUser.id);downloadJson(data,`employee-evaluation-backup-v2-${Date.now()}.json`);},'Backup exported.');
  const exportDiagnostics=()=>{const report=buildDiagnosticReport({health:store.health||{},integrity,employees:store.employees,evaluations:store.evaluations,activity:store.activity,settings:store.settings||{}});downloadJson(report,`employee-evaluation-diagnostics-${Date.now()}.json`);setMessage({type:'success',text:'Diagnostic report exported without raw employee or evaluation content.'});};
  const exportReconciliation=()=>{downloadJson(reconciliation,`employee-evaluation-reconciliation-${Date.now()}.json`);setMessage({type:'success',text:'Reconciliation baseline exported.'});};
  const exportHandoffManifest=()=>{
    const manifest=buildHandoffManifest({
      health:store.health||{},
      integrity,
      counts:{employees:store.employees.length,evaluations:store.evaluations.length,activity:store.activity.length},
    });
    downloadJson(manifest,`employee-evaluation-handoff-manifest-${Date.now()}.json`);
    setMessage({type:'success',text:'Handoff manifest exported. It contains versions, provider readiness, dataset counts, and integration responsibilities without raw employee or evaluation content.'});
  };

  const inspectImport=async(file)=>{
    setMessage(null);
    try{
      const data=JSON.parse(await file.text());
      setBackupCandidate(data);
      setBackupInspection(inspectBackup(data));
    }catch(err){
      setBackupCandidate(null);setBackupInspection(null);setMessage({type:'error',text:err.message||'Unable to inspect backup file.'});
    }finally{if(importRef.current)importRef.current.value='';}
  };
  const confirmImport=async()=>{
    if(!backupCandidate||backupInspection?.blocked)return;
    await run(async()=>{await store.mutate((repo,actor)=>repo.importBackup(backupCandidate,actor));setBackupCandidate(null);setBackupInspection(null);},'Backup imported and migrated to the current schema.');
  };
  const compareBaseline=async(file)=>{
    try{
      const baseline=JSON.parse(await file.text());
      setReconciliationResult(compareReconciliation(baseline,reconciliation));
      setMessage(null);
    }catch(err){setReconciliationResult(null);setMessage({type:'error',text:err.message||'Unable to compare reconciliation report.'});}
    finally{if(compareRef.current)compareRef.current.value='';}
  };

  return <div className="page-stack"><div className="page-heading"><div><h1>Settings</h1><p>Evaluation cycle, employee master data, and integration readiness</p></div></div>
  {message&&<div className={`alert ${message.type==='error'?'error':'success'}`}>{message.text}</div>}

  <section className="panel"><div className="section-heading"><div><h2>Evaluation Window</h2><p>Open allows new evaluations; Grace Period allows only existing Draft/Returned records; Closed makes evaluator records read-only.</p></div><span className={`window-badge ${store.settings.evaluationWindow.toLowerCase().replace(' ','-')}`}>{store.settings.evaluationWindow}</span></div><div className="settings-grid"><label>Active Period<input value={store.settings.activePeriod} disabled={!store.canMutate} onChange={e=>saveSettings({activePeriod:e.target.value})}/></label><label>Open Date<input type="date" disabled={!store.canMutate} value={store.settings.windowOpenDate?.slice?.(0,10)||''} onChange={e=>saveSettings({windowOpenDate:e.target.value?new Date(`${e.target.value}T00:00:00`).toISOString():null})}/></label><label>Close Date<input type="date" disabled={!store.canMutate} value={store.settings.windowCloseDate?.slice?.(0,10)||''} onChange={e=>saveSettings({windowCloseDate:e.target.value?new Date(`${e.target.value}T23:59:59`).toISOString():null})}/></label><label>Grace Period Days<input type="number" min="0" disabled={!store.canMutate} value={store.settings.gracePeriodDays} onChange={e=>saveSettings({gracePeriodDays:Number(e.target.value)||0})}/></label></div><div className="button-row"><button className="btn primary" disabled={!store.canMutate} onClick={()=>saveSettings({evaluationWindow:'Open'})}>Open Window</button><button className="btn secondary" disabled={!store.canMutate} onClick={()=>saveSettings({evaluationWindow:'Grace Period'})}>Grace Period</button><button className="btn danger" disabled={!store.canMutate} onClick={()=>saveSettings({evaluationWindow:'Closed'})}>Close Window</button></div></section>

  <section className="panel"><div className="section-heading"><div><h2>Employee Master Data</h2><p>Standalone reference data replacing the Monday employee board.</p></div><button className="btn primary" disabled={!store.canMutate} onClick={()=>{setEditing(null);setFormOpen(true)}}><Plus size={16}/> Add Employee</button></div>{!store.employees.length?<EmptyState icon={Users} title="No employees configured" description="Add employees to begin evaluating performance."/>:<div className="table-wrap"><table><thead><tr><th>Employee</th><th>Code</th><th>Department</th><th>Role</th><th>Active</th><th>Revision</th><th/></tr></thead><tbody>{store.employees.map(row=><tr key={row.id}><td><strong>{row.name}</strong><small>{row.email}</small></td><td>{row.employeeCode}</td><td>{row.department||'—'}</td><td>{row.role}</td><td>{row.active!==false?'Yes':'No'}</td><td>r{row.revision||1}</td><td><div className="row-actions"><button className="icon-button" disabled={!store.canMutate} onClick={()=>{setEditing(row);setFormOpen(true)}} aria-label="Edit">✎</button><button className="icon-button danger-text" disabled={!store.canMutate} onClick={()=>removeEmployee(row)} aria-label="Delete"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>}</section>

  <section className="panel"><div className="section-heading"><div><h2>Provider Diagnostics</h2><p>Compatibility and integrity checks for the current repository provider.</p></div><Database size={20}/></div><div className="diagnostic-grid"><Diagnostic label="Provider" value={store.health?.provider||'—'}/><Diagnostic label="Available" value={store.health?.available?'Yes':'No'}/><Diagnostic label="Writable" value={store.health?.writable?'Yes':'No'}/><Diagnostic label="Repository Contract" value={`v${store.health?.contractVersion??'—'} / expected v${REPOSITORY_CONTRACT_VERSION}`}/><Diagnostic label="Schema" value={`v${store.health?.schemaVersion??'—'} / expected v${SCHEMA_VERSION}`}/><Diagnostic label="Integrity" value={integrity.ok?'Healthy':`${integrity.issues.length} issue(s)`}/><Diagnostic label="Migration" value={store.health?.migration?.migrated?`Migrated from ${store.health.migration.source}`:'Current schema'}/><Diagnostic label="Write Probe" value={store.health?.probeError?'Failed':'Passed'}/></div>{store.health?.probeError&&<div className="alert error">Provider write probe: {store.health.probeError}</div>}{!integrity.ok&&<div className="alert warning">{integrity.issues.slice(0,4).map(issue=>issue.message).join(' · ')}{integrity.issues.length>4?' · …':''}</div>}<div className="button-row"><button className="btn secondary" onClick={store.refresh}><RefreshCw size={16}/> Refresh Provider</button><button className="btn secondary" onClick={exportDiagnostics}><Download size={16}/> Export Diagnostics</button><button className="btn secondary" onClick={exportHandoffManifest}><ShieldCheck size={16}/> Export Handoff Manifest</button></div></section>

  <section className="panel"><div className="section-heading"><div><h2>Supabase Handoff Acceptance</h2><p>All checks should pass before switching the standalone application to a production repository.</p></div>{handoff.ready?<CheckCircle2 size={22} className="success-icon"/>:<XCircle size={22} className="danger-text"/>}</div><div className="acceptance-list">{handoff.checks.map(row=><div key={row.id} className={row.pass?'pass':'fail'}>{row.pass?<CheckCircle2 size={16}/>:<XCircle size={16}/>}<span>{row.label}</span><strong>{row.actual}</strong></div>)}</div><div className={`alert ${handoff.ready?'success':'warning'}`}>{handoff.ready?'Current provider and datasets pass the standalone handoff gate.':'Do not enable production writes until every acceptance check passes.'}</div></section>

  <section className="panel"><div className="section-heading"><div><h2>Backup & Migration Verification</h2><p>Inspect backups before replacement and reconcile record counts after Supabase migration.</p></div><FileSearch size={20}/></div><div className="button-row"><button className="btn secondary" onClick={exportBackup}><Download size={16}/> Export Backup</button><label className={`btn secondary file-button ${!store.canMutate?'disabled-control':''}`}><Upload size={16}/> Inspect Backup<input ref={importRef} disabled={!store.canMutate} type="file" accept="application/json" onChange={e=>e.target.files?.[0]&&inspectImport(e.target.files[0])}/></label><button className="btn secondary" onClick={exportReconciliation}><Download size={16}/> Export Reconciliation</button><label className="btn secondary file-button"><FileSearch size={16}/> Compare Reconciliation<input ref={compareRef} type="file" accept="application/json" onChange={e=>e.target.files?.[0]&&compareBaseline(e.target.files[0])}/></label></div>{reconciliationResult&&<div className={`reconciliation-result ${reconciliationResult.match?'match':'mismatch'}`}><strong>{reconciliationResult.match?'Reconciliation matched':'Reconciliation differences detected'}</strong><span>{reconciliationResult.match?'Current provider matches the selected baseline.':`${reconciliationResult.mismatches.length} mismatch(es) found.`}</span>{!reconciliationResult.match&&<div className="mismatch-list">{reconciliationResult.mismatches.slice(0,8).map(row=><div key={row.path}><code>{row.path}</code><span>Baseline: {String(row.baseline)}</span><span>Current: {String(row.current)}</span></div>)}</div>}</div>}</section>

  <EmployeeForm open={formOpen} employee={editing} employees={store.employees} onClose={()=>setFormOpen(false)} onSave={saveEmployee}/>
  <Modal open={!!pendingDelete} onClose={()=>setPendingDelete(null)} title="Delete Employee Record?" subtitle="Use deactivation instead when historical evaluation records must be preserved." footer={<><button className="btn secondary" onClick={()=>setPendingDelete(null)}>Cancel</button><button className="btn danger" onClick={confirmDeleteEmployee}>Delete Employee</button></>}>
    {pendingDelete&&<div className="alert warning"><strong>{pendingDelete.name}</strong> will be permanently removed only if the record is not referenced by evaluations and is not assigned as a supervisor. This action cannot be undone.</div>}
  </Modal>
  <Modal open={!!backupCandidate} onClose={()=>{setBackupCandidate(null);setBackupInspection(null)}} title="Inspect Backup Before Import" subtitle="No current data has been replaced yet." footer={<><button className="btn secondary" onClick={()=>{setBackupCandidate(null);setBackupInspection(null)}}>Cancel</button><button className="btn primary" disabled={backupInspection?.blocked||!store.canMutate} onClick={confirmImport}>Replace Current Data</button></>}>
    {backupInspection&&<div className="backup-preview"><div className="diagnostic-grid"><Diagnostic label="Format" value={`v${backupInspection.formatVersion??'—'}`}/><Diagnostic label="Schema" value={`v${backupInspection.schemaVersion??'—'}`}/><Diagnostic label="Employees" value={backupInspection.counts.employees}/><Diagnostic label="Evaluations" value={backupInspection.counts.evaluations}/><Diagnostic label="Activity Events" value={backupInspection.counts.activity}/><Diagnostic label="Validation" value={backupInspection.blocked?'Blocked':'Ready'}/></div>{backupInspection.warnings.map((warning,index)=><div className="alert warning" key={`w-${index}`}>{warning}</div>)}{backupInspection.errors.slice(0,8).map((error,index)=><div className="alert error" key={`e-${index}`}>{error}</div>)}{!backupInspection.blocked&&<div className="alert success">Backup passed structural, record, and dataset-integrity validation. Import will replace the current local datasets.</div>}</div>}
  </Modal>
  </div>;
}

function Diagnostic({label,value}){return <div><span>{label}</span><strong>{value}</strong></div>}
function downloadJson(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)}
