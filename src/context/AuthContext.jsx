import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import {
  loginWithBackend as _apiLogin,
  logoutFromBackend,
  getCurrentUser,
} from "../services/authApi";

const AuthContext = createContext(null);


/* ─────────────────────────────────────────────────────────────
   Audit helper
───────────────────────────────────────────────────────────── */

function _auditWrite(
  action,
  payload = {},
  currentUser = null
) {
  const STORAGE_KEY = "finsight_audit_log";
  const MAX = 500;

  const entry = {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,

    timestamp: new Date().toISOString(),

    action,

    userId:
      currentUser?.user_profile_id ||
      currentUser?.id ||
      null,

    userName:
      currentUser?.employee_name ||
      currentUser?.name ||
      null,

    userRole:
      currentUser?.role_code ||
      currentUser?.role ||
      null,

    ...payload,
  };

  let log = [];

  try {
    log = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
  } catch {
    log = [];
  }

  log.push(entry);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(log.slice(-MAX))
  );
}


/* ─────────────────────────────────────────────────────────────
   Auth Provider
───────────────────────────────────────────────────────────── */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  /* ───────────────────────────────────────────────────────────
     Restore existing JWT session
  ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (currentUser?.active === false) {
          localStorage.removeItem("token");
          setUser(null);
          return;
        }

        setUser({
          ...currentUser,

          role_code:
            currentUser.role_code || null,

          role:
            currentUser.role_code || null,

          name:
            currentUser.employee_name ||
            currentUser.full_name ||
            currentUser.name ||
            currentUser.email,

          email:
            currentUser.official_email ||
            currentUser.email,
        });
      } catch (error) {
        console.warn(
          "[AuthContext] Failed to restore authentication session.",
          error
        );

        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);


  /* ───────────────────────────────────────────────────────────
     Login
  ─────────────────────────────────────────────────────────── */

  async function loginWithBackend(email, password) {
    const result = await _apiLogin(
      email,
      password
    );

    const accessUser = result?.user;

    if (!accessUser) {
      throw new Error(
        "Unable to load authenticated user profile."
      );
    }

    if (accessUser.active === false) {
      localStorage.removeItem("token");

      throw {
        status: 403,
        message: "User account is inactive.",
        isAuthError: true,
      };
    }

    const sessionUser = {
      ...accessUser,

      // Backend-authoritative role
      role_code:
        accessUser.role_code || null,

      role:
        accessUser.role_code || null,

      name:
        accessUser.employee_name ||
        accessUser.full_name ||
        accessUser.name ||
        email,

      email:
        accessUser.official_email ||
        accessUser.email ||
        email,
    };

    setUser(sessionUser);

    _auditWrite(
      "login",
      {},
      sessionUser
    );

    return sessionUser;
  }


  /* ───────────────────────────────────────────────────────────
     Logout
  ─────────────────────────────────────────────────────────── */

  function logout() {
    _auditWrite(
      "logout",
      {},
      user
    );

    setUser(null);

    logoutFromBackend();
  }


  /* ───────────────────────────────────────────────────────────
     Role helper
  ─────────────────────────────────────────────────────────── */

  function hasRole(roleCode) {
    if (!user) {
      return false;
    }

    return (
      String(user.role_code || "")
        .toUpperCase() ===
      String(roleCode || "")
        .toUpperCase()
    );
  }


  /* ───────────────────────────────────────────────────────────
     Page access
  ─────────────────────────────────────────────────────────── */

  function canAccess(page) {
    if (!user || !page) {
      return false;
    }

    /*
     * ADMIN has full application access.
     *
     * Backend role_code is authoritative.
     */
    if (hasRole("ADMIN")) {
      return true;
    }

    /*
     * Non-admin users:
     * use backend-provided access_scopes only.
     */
    const scopes = Array.isArray(
      user.access_scopes
    )
      ? user.access_scopes
      : [];

    return scopes.some((scope) => {
      if (typeof scope === "string") {
        return (
          scope === page ||
          scope === "*"
        );
      }

      if (
        scope &&
        typeof scope === "object"
      ) {
        return (
          scope.page === page ||
          scope.module === page ||
          scope.code === page ||
          scope.name === page ||
          scope.page === "*" ||
          scope.module === "*"
        );
      }

      return false;
    });
  }


  /* ───────────────────────────────────────────────────────────
     Export permission
  ─────────────────────────────────────────────────────────── */

  function hasExportRight(type) {
    if (!user) {
      return false;
    }

    if (hasRole("ADMIN")) {
      return true;
    }

    const scopes = Array.isArray(
      user.access_scopes
    )
      ? user.access_scopes
      : [];

    return scopes.some((scope) => {
      if (typeof scope === "string") {
        return (
          scope === "export" ||
          scope === `export:${type}` ||
          scope === "export:*"
        );
      }

      if (
        scope &&
        typeof scope === "object"
      ) {
        return (
          scope.permission === "export" ||
          scope.permission ===
            `export:${type}` ||
          scope.action === "export"
        );
      }

      return false;
    });
  }


  /* ───────────────────────────────────────────────────────────
     Access scopes
  ─────────────────────────────────────────────────────────── */

  function getAccessScopes() {
    if (!user) {
      return [];
    }

    return Array.isArray(
      user.access_scopes
    )
      ? user.access_scopes
      : [];
  }


  function getScopedEntities() {
    return getAccessScopes();
  }


  function getScopedCountries() {
    const scopes = getAccessScopes();

    return scopes
      .filter(
        (scope) =>
          scope &&
          typeof scope === "object" &&
          (
            scope.country ||
            scope.country_code ||
            scope.countryCode
          )
      )
      .map(
        (scope) =>
          scope.country ||
          scope.country_code ||
          scope.countryCode
      );
  }


  function getScopedSalesperson() {
    const scopes = getAccessScopes();

    const salespersonScope =
      scopes.find(
        (scope) =>
          scope &&
          typeof scope === "object" &&
          (
            scope.salesman ||
            scope.salesperson ||
            scope.salesman_name ||
            scope.salesperson_name
          )
      );

    if (!salespersonScope) {
      return null;
    }

    return (
      salespersonScope.salesman ||
      salespersonScope.salesperson ||
      salespersonScope.salesman_name ||
      salespersonScope.salesperson_name ||
      null
    );
  }


  /* ───────────────────────────────────────────────────────────
     Sensitive access
  ─────────────────────────────────────────────────────────── */

  function hasSensitiveAccess(page) {
    return canAccess(page);
  }


  /* ───────────────────────────────────────────────────────────
     Audit
  ─────────────────────────────────────────────────────────── */

  function auditLog(
    action,
    payload = {}
  ) {
    _auditWrite(
      action,
      payload,
      user
    );
  }


  /* ───────────────────────────────────────────────────────────
     Context
  ─────────────────────────────────────────────────────────── */

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        loginWithBackend,
        logout,

        hasRole,
        canAccess,
        hasExportRight,

        getAccessScopes,
        getScopedEntities,
        getScopedCountries,
        getScopedSalesperson,

        hasSensitiveAccess,

        auditLog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}