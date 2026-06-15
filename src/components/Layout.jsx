import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const auth = useAuth();
  const { user, loading } = auth || { user: null, loading: true };
  // Sidebar is expanded by default on desktop; collapsed = drawer is CLOSED
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '36px', height: '36px',
            border: '3px solid var(--clr-primary-dim)',
            borderTopColor: 'var(--clr-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 14px',
          }} />
          <div style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
            LOADING FINSIGHT…
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const collapsed = !sidebarOpen;

  return (
    <div className="app-shell">
      {/* Mobile backdrop — only visible on small screens when sidebar open */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar collapsed={collapsed} onToggle={() => setSidebarOpen(o => !o)} />

      <div className="main-area">
        <Topbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
