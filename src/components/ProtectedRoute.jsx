import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudit } from '../context/AuditContext';
import { useEffect } from 'react';
import { ShieldOff, ArrowLeft, User, LogOut } from 'lucide-react';

export default function ProtectedRoute({
  pageKey,
  element,
  adminOnly = false,
}) {
  const {
    user,
    canAccess,
    canAdmin,
    canView,
    resolveLanding,
    logout,
    loading,
  } = useAuth();

  const { log } = useAudit();
  const location = useLocation();

  /*
   * -----------------------------------------------------------
   * Centralized RBAC authorization
   * - /profile: Allowed for any authenticated user session
   * - Admin routes: USER_MANAGEMENT view or admin permission
   * - Report routes: canonical route registry check via canAccess(pageKey)
   * -----------------------------------------------------------
   */
  let allowed = false;
  if (pageKey === 'profile') {
    allowed = Boolean(user);
  } else if (adminOnly || pageKey === 'admin') {
    allowed = Boolean(canAdmin?.('USER_MANAGEMENT') || canView?.('USER_MANAGEMENT'));
  } else {
    allowed = Boolean(canAccess?.(pageKey));
  }

  /* -----------------------------------------------------------
     Audit access decision
  ----------------------------------------------------------- */
  useEffect(() => {
    if (user && !loading) {
      if (allowed) {
        log?.('report_access', {
          page: pageKey,
          path: location.pathname,
        });
      } else {
        log?.('access_denied', {
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

  /* -----------------------------------------------------------
     Wait until /api/access/me has completed
  ----------------------------------------------------------- */
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '40vh',
          color: 'var(--clr-text-muted)',
          fontSize: '0.9rem',
        }}
      >
        Loading access permissions...
      </div>
    );
  }

  /* -----------------------------------------------------------
     No authenticated user
  ----------------------------------------------------------- */
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  /* -----------------------------------------------------------
     Access Denied (Fail Closed - Safe Access Restricted View)
     Do not automatically redirect to hardcoded routes.
  ----------------------------------------------------------- */
  if (!allowed) {
    const landingRoute = resolveLanding?.();
    const isAdmin = adminOnly || pageKey === 'admin';

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
          padding: '24px',
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
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--clr-text, #0f172a)',
              marginBottom: 8,
            }}
          >
            {isAdmin ? 'Admin Access Restricted' : 'Access Restricted'}
          </h2>

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--clr-text-muted, #64748b)',
              maxWidth: 440,
              margin: '0 auto 24px',
              lineHeight: 1.5,
            }}
          >
            {isAdmin
              ? 'Your account does not have administrative permissions for this area. Contact your administrator if you require access.'
              : 'Your account does not have permission to view this report module. Please select an authorized module or review your profile.'}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {landingRoute && (
              <Link
                to={landingRoute}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'var(--clr-primary, #6366f1)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={16} />
                Go to Authorized Report
              </Link>
            )}
            <Link
              to="/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#f1f5f9',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #cbd5e1',
              }}
            >
              <User size={16} />
              My Profile
            </Link>
            <button
              onClick={logout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#fee2e2',
                color: '#ef4444',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid #fca5a5',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -----------------------------------------------------------
     Authorized
  ----------------------------------------------------------- */
  return element;
}

