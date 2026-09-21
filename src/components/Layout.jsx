import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const auth = useAuth();
  const location = useLocation();
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
            LOADING FINSIGHT...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const toggle = () => setSidebarOpen(o => !o);
  const collapsed = !sidebarOpen;

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Mobile backdrop - only visible on small screens when sidebar open */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        mobileOpen={sidebarOpen}
      />

      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden transition-all duration-300 ease-in-out relative">
        <Topbar />

        <main className={`${isAdminRoute ? 'min-w-0 p-5 bg-gray-50 overflow-y-auto overflow-x-hidden' : 'page-content overflow-y-auto overflow-x-hidden'} flex-1 relative`}>
          {isAdminRoute ? (
            <div className="flex min-h-full w-full flex-col">
              <Outlet />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
