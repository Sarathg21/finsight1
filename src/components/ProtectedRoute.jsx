import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudit } from '../context/AuditContext';
import { useEffect } from 'react';
import { ShieldOff } from 'lucide-react';

export default function ProtectedRoute({
  pageKey,
  element,
  adminOnly = false,
}) {
  const { user, canAccess, loading } = useAuth();
  const { log } = useAudit();
  const location = useLocation();

  /*
   * IMPORTANT:
   * Admin routes require the authoritative backend role_code.
   */
  const isAdmin =
    String(user?.role_code || '').toUpperCase() === 'ADMIN';

  const allowed = adminOnly
    ? isAdmin
    : canAccess(pageKey);

  useEffect(() => {
    if (user && !loading) {
      if (allowed) {
        log('report_access', {
          page: pageKey,
          path: location.pathname,
        });
      } else {
        log('access_denied', {
          page: pageKey,
          path: location.pathname,
        });
      }
    }
  }, [
    user,
    loading,
    allowed,
    pageKey,
    location.pathname,
    log,
  ]);

  /*
   * Wait until /api/access/me has completed.
   */
  if (loading) {
    return null;
  }

  /*
   * No authenticated user.
   */
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  /*
   * Admin route but user is not ADMIN.
   */
  if (adminOnly && !isAdmin) {
    return (
      <div
        className="animate-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 16,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <ShieldOff
            size={32}
            style={{
              color: 'var(--clr-danger, #ef4444)',
            }}
          />
        </div>

        <div>
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--clr-text)',
              marginBottom: 8,
            }}
          >
            Admin Access Restricted
          </h2>

          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--clr-text-muted)',
              maxWidth: 360,
              margin: '0 auto 20px',
            }}
          >
            This area is available only to users with the
            ADMIN role.
          </p>

          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  /*
   * Normal page-level RBAC.
   */
  if (!adminOnly && !allowed) {
    return (
      <div
        className="animate-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 16,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <ShieldOff
            size={32}
            style={{
              color: 'var(--clr-danger, #ef4444)',
            }}
          />
        </div>

        <div>
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--clr-text)',
              marginBottom: 8,
            }}
          >
            Access Restricted
          </h2>

          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--clr-text-muted)',
              maxWidth: 360,
              margin: '0 auto 20px',
            }}
          >
            Your role does not have permission to view this
            page. Contact your administrator to request access.
          </p>

          <Navigate
            to={user?.defaultPage || '/dashboard'}
            replace
          />
        </div>
      </div>
    );
  }

  return element;
}