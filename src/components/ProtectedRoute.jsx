


import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAudit } from "../context/AuditContext";

export default function ProtectedRoute({
  pageKey,
  element,
  adminOnly = false,
  requiredAdminModule = null,
  requiredViewModule = null,
}) {
  const { user, canAccess, canAdmin, loading } = useAuth();
  const { log } = useAudit();
  const location = useLocation();

  /*
   * Admin permissions and ordinary module-view permissions
   * are deliberately checked separately.
   *
   * requiredAdminModule:
   *   Requires can_admin === true for the specified module.
   *
   * requiredViewModule:
   *   Uses the page's centralized canAccess() permission.
   *   The module code is retained as an explicit route declaration.
   *
   * Existing adminOnly behavior remains unchanged.
   */
  const adminModule =
    requiredAdminModule || (adminOnly ? "USER_MANAGEMENT" : null);

  const normalizedViewModule = String(requiredViewModule || "")
    .trim()
    .toUpperCase();

  const pageModuleMap = {
    "MASTER_DATA": "master-data",
  };

  const viewPageKey = normalizedViewModule
    ? pageModuleMap[normalizedViewModule]
    : pageKey;

  /*
   * Fail closed:
   * - Admin routes require the actual admin permission.
   * - View-only routes require the actual module view permission.
   * - No permission is inferred from role names or export rights.
   */
  const allowed = adminModule
    ? canAdmin?.(adminModule) === true
    : canAccess?.(viewPageKey) === true;

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
    if (typeof log === "function") {
      log({
        action: "ACCESS_DENIED",
        page: pageKey || location.pathname,
        module: adminModule || normalizedViewModule || null,
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
