import React, { useMemo, useState } from 'react';
import { Activity, BarChart3, ClipboardCheck, LayoutDashboard, Menu, RefreshCw, Settings, ShieldCheck, UserRoundCheck, Users, X } from 'lucide-react';
import { AppStoreProvider, useStore } from './context/AppStore.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import EvaluatePage from './pages/EvaluatePage.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import MyEvaluationPage from './pages/MyEvaluationPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ActivityPage from './pages/ActivityPage.jsx';
import { APP_VERSION, ROLE_LABELS } from './domain/constants.js';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'supervisor'] },
  { id: 'employees', label: 'Employees', icon: Users, roles: ['admin', 'supervisor'] },
  { id: 'evaluate', label: 'Evaluate', icon: ClipboardCheck, roles: ['admin', 'supervisor'] },
  { id: 'reviews', label: 'Management Review', icon: ShieldCheck, roles: ['admin'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'supervisor'] },
  { id: 'my', label: 'My Evaluation', icon: UserRoundCheck, roles: ['admin', 'supervisor', 'employee'] },
  { id: 'activity', label: 'Activity', icon: Activity, roles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

function Shell() {
  const store = useStore();
  const [view, setView] = useState(store.currentUser.role === 'employee' ? 'my' : 'dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const available = useMemo(() => NAV.filter((item) => item.roles.includes(store.currentUser.role)), [store.currentUser.role]);
  const validView = available.some((item) => item.id === view) ? view : available[0]?.id || 'my';

  if (store.loading) return <div className="screen-center"><div><div className="spinner" /><p>Loading Employee Evaluation…</p></div></div>;
  if (store.error) return <div className="screen-center"><div className="error-panel"><h2>Unable to load Employee Evaluation</h2><p>{store.error}</p><button className="btn primary" onClick={store.refresh}><RefreshCw size={16}/> Retry</button></div></div>;

  const page = {
    dashboard: <DashboardPage onNavigate={setView} />,
    employees: <EmployeesPage />,
    evaluate: <EvaluatePage />,
    reviews: <ReviewsPage />,
    reports: <ReportsPage />,
    my: <MyEvaluationPage />,
    settings: <SettingsPage />,
    activity: <ActivityPage />,
  }[validView];

  const refreshed = store.lastRefreshAt ? new Date(store.lastRefreshAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not refreshed';

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="topbar">
      <div className="brand-block">
        <button className="mobile-menu" onClick={() => setMobileNav((value) => !value)} aria-label="Toggle navigation">{mobileNav?<X size={20}/>:<Menu size={20} />}</button>
        <div className="brand-mark"><UserRoundCheck size={21} /></div>
        <div><strong>Employee Evaluation</strong><span>Performance Management</span></div>
      </div>
      <div className="topbar-actions">
        <div className="provider-status-group">
          <div className="provider-pill" title={store.providerError || `Last refreshed ${refreshed}`}><span className={`status-dot ${store.canMutate ? 'online' : 'offline'}`} />{store.health?.provider || 'local'} provider{store.canMutate ? '' : ' · protected'}</div>
          <button className="topbar-refresh" disabled={store.refreshing} onClick={store.refresh} title={`Last refreshed ${refreshed}`} aria-label="Refresh data"><RefreshCw size={15} className={store.refreshing?'spin-icon':''}/></button>
        </div>
        <label className="session-switcher"><span>Local session</span><select value={store.currentUserId} onChange={(e) => { store.setCurrentUser(e.target.value); setView(e.target.value === 'local-system' ? 'dashboard' : (store.employees.find((row) => row.id === e.target.value)?.role === 'employee' ? 'my' : 'dashboard')); }}>
          <option value="local-system">Local Setup Administrator</option>
          {store.employees.filter((row) => row.active !== false).map((row) => <option key={row.id} value={row.id}>{row.name} · {ROLE_LABELS[row.role]}</option>)}
        </select></label>
      </div>
    </header>
    {store.providerError && <div className="provider-error-banner"><strong>Provider refresh failed</strong><span>Showing the last successfully loaded data. Writes are disabled until the provider is reachable again. {store.providerError}</span><button className="btn secondary compact" disabled={store.refreshing} onClick={store.refresh}>{store.refreshing?'Retrying…':'Retry'}</button></div>}
    {!store.providerError && !store.canMutate && <div className="protected-banner"><strong>Protected read-only mode</strong><span>The configured provider is unavailable, read-only, or incompatible with Repository Contract v1 / Schema v2. Data-changing actions are blocked.</span><button className="btn secondary compact" disabled={store.refreshing} onClick={store.refresh}>Retry Provider</button></div>}
    <div className="app-body">
      {mobileNav && <button className="nav-scrim" aria-label="Close navigation" onClick={()=>setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="sidebar-user"><div className="avatar">{store.currentUser.name.split(' ').map((part) => part[0]).join('').slice(0,2).toUpperCase()}</div><div><strong>{store.currentUser.name}</strong><span>{ROLE_LABELS[store.currentUser.role] || store.currentUser.role}</span></div></div>
        <nav>{available.map((item) => { const Icon = item.icon; return <button key={item.id} className={validView === item.id ? 'active' : ''} onClick={() => { setView(item.id); setMobileNav(false); }}><Icon size={17} />{item.label}</button>; })}</nav>
        <div className="sidebar-footer">Standalone v{APP_VERSION}<br />Supabase integration pending</div>
      </aside>
      <main id="main-content" tabIndex={-1} className="main-content">{page}</main>
    </div>
  </div>;
}

export default function App() {
  return <ErrorBoundary><AppStoreProvider><Shell /></AppStoreProvider></ErrorBoundary>;
}
