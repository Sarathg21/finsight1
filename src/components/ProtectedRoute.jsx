
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAudit } from "../context/AuditContext";

export default function ProtectedRoute({
  pageKey,
  element,
  adminOnly = false,
  requiredAdminModule = null,
}) {
  const { user, canAccess, canAdmin, loading } = useAuth();
  const { log } = useAudit();
  const location = useLocation();

  /*
   * Explicit module authorization takes priority.
   * Keep adminOnly compatible with existing routes.
   */
  const adminModule =
    requiredAdminModule || (adminOnly ? "USER_MANAGEMENT" : null);

  /*
   * Fail closed: permission must be exactly true.
   * Admin modules use centralized canAdmin(moduleCode).
   * Report routes use the existing canAccess(pageKey).
   */
  const allowed = adminModule
    ? canAdmin?.(adminModule) === true
    : canAccess?.(pageKey) === true;

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        Checking access…
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!allowed) {
    /*
     * Keep access-denied events in the existing audit system.
     * The guard itself does not grant or modify permissions.
     */
    if (typeof log === "function") {
      log({
        action: "ACCESS_DENIED",
        page: pageKey || location.pathname,
        module: adminModule || null,
        path: location.pathname,
      });
    }

    return (
      <div
        role="alert"
        style={{
          maxWidth: 640,
          margin: "48px auto",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h2>Access Restricted</h2>
        <p>
          You do not have permission to access this page.
          Contact your administrator if you believe this is incorrect.
        </p>

        <button
          type="button"
          onClick={() =>
            window.history.length > 1
              ? window.history.back()
              : window.location.assign("/")
          }
          style={{
            marginTop: 12,
            padding: "10px 18px",
            border: 0,
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return element;
}
