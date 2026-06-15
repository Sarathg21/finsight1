import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudit } from '../context/AuditContext';
import { useEffect } from 'react';
import { ShieldOff } from 'lucide-react';

/**
 * ProtectedRoute – wraps a page element and enforces RBAC access.
 * 
 * Props:
 *   pageKey  – string key stored in user.allowedPages (e.g. 'admin', 'pl')
 *   element  – the JSX element to render if allowed
 */
export default function ProtectedRoute({ pageKey, element }) {
  const { user, canAccess, loading } = useAuth();
  const { log } = useAudit();
  const location = useLocation();

  const allowed = canAccess(pageKey);

  useEffect(() => {
    if (user) {
      if (allowed) {
        log('report_access', { page: pageKey, path: location.pathname });
      } else {
        log('access_denied', { page: pageKey, path: location.pathname });
      }
    }
  }, [pageKey, location.pathname]); // eslint-disable-line

  // Wait for session restore from localStorage before deciding to redirect.
  // Without this guard, a page refresh briefly sees user=null and wrongly
  // navigates to /login, breaking both refresh and browser-back.
  if (loading) return null;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!allowed) {
    return (
      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(239,68,68,0.2)',
        }}>
          <ShieldOff size={32} style={{ color: 'var(--clr-danger, #ef4444)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--clr-text)', marginBottom: 8 }}>
            Access Restricted
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', maxWidth: 360, margin: '0 auto 20px' }}>
            Your role (<strong>{user?.roleLabel}</strong>) does not have permission to view this page.
            Contact your administrator to request access.
          </p>
          <Navigate to={user?.defaultPage || '/dashboard'} replace />
        </div>
      </div>
    );
  }

  return element;
}
