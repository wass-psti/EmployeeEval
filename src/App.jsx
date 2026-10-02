import React, { useMemo, useState } from 'react';
import { Activity, BarChart3, ClipboardCheck, LayoutDashboard, Menu, Settings, ShieldCheck, UserRoundCheck, Users } from 'lucide-react';
import { AppStoreProvider, useStore } from './context/AppStore.jsx';
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

  if (store.loading) return <div className="screen-center"><div className="spinner" /><p>Loading Employee Evaluation…</p></div>;
  if (store.error) return <div className="screen-center"><div className="error-panel"><h2>Unable to load Employee Evaluation</h2><p>{store.error}</p><button className="btn primary" onClick={store.refresh}>Retry</button></div></div>;

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

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-block">
        <button className="mobile-menu" onClick={() => setMobileNav((value) => !value)} aria-label="Toggle navigation"><Menu size={20} /></button>
        <div className="brand-mark"><UserRoundCheck size={21} /></div>
        <div><strong>Employee Evaluation</strong><span>Performance Management</span></div>
      </div>
      <div className="topbar-actions">
        <div className="provider-pill"><span className="status-dot online" />{store.health?.provider || 'local'} provider</div>
        <label className="session-switcher"><span>Local session</span><select value={store.currentUserId} onChange={(e) => { store.setCurrentUser(e.target.value); setView(e.target.value === 'local-system' ? 'dashboard' : (store.employees.find((row) => row.id === e.target.value)?.role === 'employee' ? 'my' : 'dashboard')); }}>
          <option value="local-system">Local Setup Administrator</option>
          {store.employees.filter((row) => row.active !== false).map((row) => <option key={row.id} value={row.id}>{row.name} · {ROLE_LABELS[row.role]}</option>)}
        </select></label>
      </div>
    </header>
    <div className="app-body">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="sidebar-user"><div className="avatar">{store.currentUser.name.split(' ').map((part) => part[0]).join('').slice(0,2).toUpperCase()}</div><div><strong>{store.currentUser.name}</strong><span>{ROLE_LABELS[store.currentUser.role] || store.currentUser.role}</span></div></div>
        <nav>{available.map((item) => { const Icon = item.icon; return <button key={item.id} className={validView === item.id ? 'active' : ''} onClick={() => { setView(item.id); setMobileNav(false); }}><Icon size={17} />{item.label}</button>; })}</nav>
        <div className="sidebar-footer">Standalone v{APP_VERSION}<br />Supabase integration pending</div>
      </aside>
      <main className="main-content">{page}</main>
    </div>
  </div>;
}

export default function App() {
  return <AppStoreProvider><Shell /></AppStoreProvider>;
}
