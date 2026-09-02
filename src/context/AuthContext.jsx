

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
   Backend Module Codes

   These MUST match the module_code values returned by:
   GET /api/access/me
───────────────────────────────────────────────────────────── */

const MODULE_CODES = {
  BALANCE_SHEET: "BALANCE_SHEET",
  DASHBOARD: "DASHBOARD",
  FINANCIAL_POSITION: "FINANCIAL_POSITION",
  FIXED_ASSETS: "FIXED_ASSETS",
  INVENTORY: "INVENTORY",
  MASTER_DATA: "MASTER_DATA",
  PAYABLES: "PAYABLES",
  PROFIT_LOSS: "PROFIT_LOSS",
  RECEIVABLES: "RECEIVABLES",
  SALES_REVENUE: "SALES_REVENUE",
  USER_MANAGEMENT: "USER_MANAGEMENT",
  WORKING_CAPITAL: "WORKING_CAPITAL",
};


/* ─────────────────────────────────────────────────────────────
   Frontend Route → Backend Module Mapping

   Keep this mapping centralized.
   Pages/components should NOT contain permission logic.
───────────────────────────────────────────────────────────── */

const ROUTE_MODULE_MAP = {
  "/finsight-dashboard": MODULE_CODES.DASHBOARD,
  "/exec-dashboard": MODULE_CODES.DASHBOARD,
  "/dashboard": MODULE_CODES.DASHBOARD,

  "/pl": MODULE_CODES.PROFIT_LOSS,

  "/balance-sheet": MODULE_CODES.BALANCE_SHEET,

  "/revenue": MODULE_CODES.SALES_REVENUE,

  "/fixed-assets": MODULE_CODES.FIXED_ASSETS,

  "/ar": MODULE_CODES.RECEIVABLES,
  "/receivables": MODULE_CODES.RECEIVABLES,

  "/ap": MODULE_CODES.PAYABLES,
  "/payables": MODULE_CODES.PAYABLES,

  "/inventory": MODULE_CODES.INVENTORY,

  "/working-capital": MODULE_CODES.WORKING_CAPITAL,
  "/workingcapital-report": MODULE_CODES.WORKING_CAPITAL,
  "/cash-collection": MODULE_CODES.WORKING_CAPITAL,

  "/country-performance": MODULE_CODES.SALES_REVENUE,
  "/salesman": MODULE_CODES.SALES_REVENUE,

  "/division": MODULE_CODES.FINANCIAL_POSITION,
  "/bu-pack": MODULE_CODES.FINANCIAL_POSITION,

  "/excel-consolidator": MODULE_CODES.MASTER_DATA,

  "/admin": MODULE_CODES.USER_MANAGEMENT,
  "/admin/dashboard": MODULE_CODES.USER_MANAGEMENT,
  "/admin/users": MODULE_CODES.USER_MANAGEMENT,
  "/admin/roles": MODULE_CODES.USER_MANAGEMENT,
  "/admin/useraccess": MODULE_CODES.USER_MANAGEMENT,

  "/admin/master-data": MODULE_CODES.MASTER_DATA,
};


/* ─────────────────────────────────────────────────────────────
   Page Key → Backend Module Mapping

   Allows canAccess() to accept either:
     canAccess("/dashboard")
     canAccess("dashboard")
     canAccess("DASHBOARD")
───────────────────────────────────────────────────────────── */

const PAGE_MODULE_MAP = {
  dashboard: MODULE_CODES.DASHBOARD,
  "finsight-dashboard": MODULE_CODES.DASHBOARD,
  "exec-dashboard": MODULE_CODES.DASHBOARD,

  pl: MODULE_CODES.PROFIT_LOSS,

  "balance-sheet": MODULE_CODES.BALANCE_SHEET,

  revenue: MODULE_CODES.SALES_REVENUE,

  "fixed-assets": MODULE_CODES.FIXED_ASSETS,

  ar: MODULE_CODES.RECEIVABLES,
  receivables: MODULE_CODES.RECEIVABLES,

  ap: MODULE_CODES.PAYABLES,
  payables: MODULE_CODES.PAYABLES,

  inventory: MODULE_CODES.INVENTORY,

  "working-capital": MODULE_CODES.WORKING_CAPITAL,
  workingcapital: MODULE_CODES.WORKING_CAPITAL,
  "workingcapital-report": MODULE_CODES.WORKING_CAPITAL,
  "cash-collection": MODULE_CODES.WORKING_CAPITAL,

  "country-performance": MODULE_CODES.SALES_REVENUE,
  salesman: MODULE_CODES.SALES_REVENUE,

  division: MODULE_CODES.FINANCIAL_POSITION,
  "bu-pack": MODULE_CODES.FINANCIAL_POSITION,

  "excel-consolidator": MODULE_CODES.MASTER_DATA,

  admin: MODULE_CODES.USER_MANAGEMENT,
  users: MODULE_CODES.USER_MANAGEMENT,
  roles: MODULE_CODES.USER_MANAGEMENT,
  useraccess: MODULE_CODES.USER_MANAGEMENT,

  "master-data": MODULE_CODES.MASTER_DATA,
};


/* ─────────────────────────────────────────────────────────────
   Normalize module code
───────────────────────────────────────────────────────────── */

function normalizeModuleCode(value) {
  if (!value) {
    return null;
  }

  return String(value)
    .trim()
    .toUpperCase();
}


/* ─────────────────────────────────────────────────────────────
   Resolve frontend page/module → backend module_code
───────────────────────────────────────────────────────────── */

function resolveModuleCode(pageOrModule) {
  if (!pageOrModule) {
    return null;
  }

  const value = String(pageOrModule).trim();

  if (!value) {
    return null;
  }

  const normalized = normalizeModuleCode(value);

  /*
   * Already a backend module code
   */
  if (
    Object.values(MODULE_CODES).includes(
      normalized
    )
  ) {
    return normalized;
  }

  /*
   * Exact route
   */
  if (
    ROUTE_MODULE_MAP[value]
  ) {
    return ROUTE_MODULE_MAP[value];
  }

  /*
   * Route without trailing slash
   */
  const cleanRoute =
    value.length > 1
      ? value.replace(/\/+$/, "")
      : value;

  if (
    ROUTE_MODULE_MAP[cleanRoute]
  ) {
    return ROUTE_MODULE_MAP[cleanRoute];
  }

  /*
   * Page key
   */
  const pageKey =
    value
      .replace(/^\/+/, "")
      .replace(/\/+$/, "")
      .toLowerCase();

  if (
    PAGE_MODULE_MAP[pageKey]
  ) {
    return PAGE_MODULE_MAP[pageKey];
  }

  return null;
}


/* ─────────────────────────────────────────────────────────────
   Audit helper
───────────────────────────────────────────────────────────── */

function _auditWrite(
  action,
  payload = {},
  currentUser = null
) {
  const STORAGE_KEY =
    "finsight_audit_log";

  const MAX = 500;

  const entry = {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,

    timestamp:
      new Date().toISOString(),

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
      localStorage.getItem(
        STORAGE_KEY
      ) || "[]"
    );
  } catch {
    log = [];
  }

  log.push(entry);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      log.slice(-MAX)
    )
  );
}


/* ─────────────────────────────────────────────────────────────
   Normalize backend user

   IMPORTANT:
   /api/access/me is authoritative.

   module_permissions and access_scopes are preserved
   exactly from the backend response.
───────────────────────────────────────────────────────────── */

function normalizeUser(currentUser) {
  if (!currentUser) {
    return null;
  }

  return {
    ...currentUser,

    /*
     * Authoritative role
     */
    role_code:
      currentUser.role_code ||
      null,

    /*
     * Backward-compatible role alias
     */
    role:
      currentUser.role_code ||
      null,

    /*
     * Always expose arrays so consumers
     * don't have to perform null checks.
     */
    module_permissions:
      Array.isArray(
        currentUser.module_permissions
      )
        ? currentUser.module_permissions
        : [],

    access_scopes:
      Array.isArray(
        currentUser.access_scopes
      )
        ? currentUser.access_scopes
        : [],

    name:
      currentUser.employee_name ||
      currentUser.full_name ||
      currentUser.name ||
      currentUser.official_email ||
      currentUser.email ||
      "",

    email:
      currentUser.official_email ||
      currentUser.email ||
      "",
  };
}


/* ─────────────────────────────────────────────────────────────
   Auth Provider
───────────────────────────────────────────────────────────── */

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  /* ───────────────────────────────────────────────────────────
     Handle HTTP 401 from any API request

     If any authenticated API returns 401:
     - remove JWT
     - clear authenticated user
     - return application to unauthenticated state
  ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    function handleUnauthorized() {
      localStorage.removeItem(
        "token"
      );

      setUser(null);
      setLoading(false);
    }

    window.addEventListener(
      "auth:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "auth:unauthorized",
        handleUnauthorized
      );
    };
  }, []);


  /* ───────────────────────────────────────────────────────────
     Validate existing JWT

     IMPORTANT:
     Token existence alone does NOT mean authenticated.

     Always call GET /api/access/me.
  ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        const currentUser =
          await getCurrentUser();

        if (!mounted) {
          return;
        }

        if (
          currentUser?.active === false
        ) {
          localStorage.removeItem(
            "token"
          );

          setUser(null);

          return;
        }

        const authoritativeUser =
          normalizeUser(
            currentUser
          );

        if (
          !authoritativeUser?.role_code
        ) {
          localStorage.removeItem(
            "token"
          );

          setUser(null);

          throw new Error(
            "Authenticated user has no authoritative role_code."
          );
        }

        setUser(
          authoritativeUser
        );

      } catch (error) {
        if (!mounted) {
          return;
        }

        if (
          import.meta.env.DEV
        ) {
          console.warn(
            "[AuthContext] Authentication restore failed:",
            error?.message ||
            error
          );
        }

        localStorage.removeItem(
          "token"
        );

        setUser(null);

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);


  /* ───────────────────────────────────────────────────────────
     Login
  ─────────────────────────────────────────────────────────── */

  async function loginWithBackend(
    email,
    password
  ) {
    /*
     * Step 1:
     * Authenticate credentials and receive JWT.
     */
    const loginResult =
      await _apiLogin(
        email,
        password
      );

    /*
     * Step 2:
     * Extract JWT.
     */
    const accessToken =
      loginResult?.access_token;

    if (!accessToken) {
      throw {
        status: 500,
        message:
          "Authentication succeeded, but no access token was returned.",
        isAuthError: false,
      };
    }

    /*
     * Step 3:
     * GET /api/access/me.
     *
     * This is authoritative for:
     * - profile
     * - role
     * - module_permissions
     * - access_scopes
     */
    const currentUser =
      await getCurrentUser();

    console.log("AUTH /api/access/me RESPONSE:", currentUser);
    console.log("AUTH ACCESS SCOPES:", currentUser?.access_scopes);

    if (!currentUser) {
      localStorage.removeItem(
        "token"
      );

      throw {
        status: 500,
        message:
          "Unable to load authenticated user profile.",
        isAuthError: false,
      };
    }

    if (
      currentUser.active === false
    ) {
      localStorage.removeItem(
        "token"
      );

      throw {
        status: 403,
        message:
          "User account is inactive.",
        isAuthError: true,
      };
    }

    const sessionUser =
      normalizeUser(
        currentUser
      );



    console.log("NORMALIZED USER:", sessionUser);
    console.log("NORMALIZED ACCESS SCOPES:", sessionUser?.access_scopes);

    if (
      !sessionUser?.role_code
    ) {
      localStorage.removeItem(
        "token"
      );

      throw {
        status: 500,
        message:
          "Authenticated user has no role_code.",
        isAuthError: false,
      };
    }

    /*
     * Step 4:
     * Store the COMPLETE authoritative
     * /api/access/me response.
     */
    setUser(sessionUser);

    _auditWrite(
      "login",
      {},
      sessionUser
    );

    /*
     * Step 5:
     * Return:
     * - JWT
     * - complete authoritative user
     *
     * LoginPage needs access_token
     * for Payables authentication.
     */
    return {
      ...sessionUser,
      access_token:
        accessToken,
    };
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

    // /*
    //  * Notify Payables before clearing session.
    //  */
    // if (
    //   window.payablesWindow &&
    //   !window.payablesWindow.closed
    // ) {
    //   window.payablesWindow.postMessage(
    //     {
    //       type:
    //         "FINSIGHT_LOGOUT",
    //     },
    //     import.meta.env
    //       .VITE_PAYABLES_ORIGIN ||
    //     "http://localhost:5174"
    //   );
    // }

    /*
     * Clear FinSight authentication.
     */
    setUser(null);

    localStorage.removeItem(
      "token"
    );

    /*
     * Backend logout.
     */
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
      String(
        user.role_code || ""
      ).toUpperCase() ===
      String(
        roleCode || ""
      ).toUpperCase()
    );
  }


  /* ───────────────────────────────────────────────────────────
     Module permissions
  ─────────────────────────────────────────────────────────── */

  function getModulePermissions() {
    if (!user) {
      return [];
    }

    return Array.isArray(
      user.module_permissions
    )
      ? user.module_permissions
      : [];
  }


  /*
   * Find permission record for a backend module.
   */
  function getModulePermission(
    moduleCode
  ) {
    const normalizedCode =
      normalizeModuleCode(
        moduleCode
      );

    if (!normalizedCode) {
      return null;
    }

    return (
      getModulePermissions().find(
        (permission) =>
          normalizeModuleCode(
            permission?.module_code
          ) === normalizedCode
      ) || null
    );
  }


  /*
   * Generic permission check.
   *
   * Supported actions:
   * VIEW
   * EXPORT
   * UPLOAD
   * ADMIN
   */
  function hasPermission(
    moduleCode,
    action = "VIEW"
  ) {
    if (!user) {
      return false;
    }

    const normalizedModule =
      normalizeModuleCode(
        moduleCode
      );

    const normalizedAction =
      String(action || "VIEW")
        .trim()
        .toUpperCase();

    if (!normalizedModule) {
      return false;
    }

    const permission =
      getModulePermission(
        normalizedModule
      );

    if (!permission) {
      return false;
    }

    /*
     * Prefer explicit backend boolean.
     */
    const actionFieldMap = {
      VIEW: "can_view",
      EXPORT: "can_export",
      UPLOAD: "can_upload",
      ADMIN: "can_admin",
    };

    const actionField =
      actionFieldMap[
      normalizedAction
      ];

    if (
      actionField &&
      permission[actionField] === true
    ) {
      return true;
    }

    /*
     * Also support backend actions[].
     *
     * Example:
     * actions: [
     *   "VIEW",
     *   "EXPORT",
     *   "UPLOAD",
     *   "ADMIN"
     * ]
     */
    if (
      Array.isArray(
        permission.actions
      )
    ) {
      return permission.actions.some(
        (item) =>
          String(item || "")
            .trim()
            .toUpperCase() ===
          normalizedAction
      );
    }

    return false;
  }


  /*
   * Convenience helpers.
   */
  function canView(moduleCode) {
    return hasPermission(
      moduleCode,
      "VIEW"
    );
  }

  function canExport(moduleCode) {
    return hasPermission(
      moduleCode,
      "EXPORT"
    );
  }

  function canUpload(moduleCode) {
    return hasPermission(
      moduleCode,
      "UPLOAD"
    );
  }

  function canAdmin(moduleCode) {
    return hasPermission(
      moduleCode,
      "ADMIN"
    );
  }


  /* ───────────────────────────────────────────────────────────
     Page access

     IMPORTANT:
     Page access is controlled ONLY by
     module_permissions.can_view / actions.

     access_scopes are NOT used here.
  ─────────────────────────────────────────────────────────── */

  function canAccess(page) {
    if (!user || !page) {
      return false;
    }

    const moduleCode =
      resolveModuleCode(page);

    if (!moduleCode) {
      if (
        import.meta.env.DEV
      ) {
        console.warn(
          `[AuthContext] No module mapping found for page: ${page}`
        );
      }

      return false;
    }

    return canView(
      moduleCode
    );
  }


  /* ───────────────────────────────────────────────────────────
     Export permission

     Backward-compatible helper.

     Examples:
       hasExportRight("PROFIT_LOSS")
       hasExportRight("revenue")
       hasExportRight("/revenue")
  ─────────────────────────────────────────────────────────── */

  function hasExportRight(
    type
  ) {
    if (!user || !type) {
      return false;
    }

    const moduleCode =
      resolveModuleCode(type) ||
      normalizeModuleCode(type);

    if (!moduleCode) {
      return false;
    }

    return canExport(
      moduleCode
    );
  }


  /* ───────────────────────────────────────────────────────────
     Access scopes

     IMPORTANT:
     These are DATA scopes only.

     They do NOT determine page/module access.
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


  /*
   * Existing helper preserved for compatibility.
   *
   * Returns the complete scope rows.
   */
  function getScopedEntities() {
    return getAccessScopes();
  }


  /* ───────────────────────────────────────────────────────────
     Legal Group scopes
  ─────────────────────────────────────────────────────────── */

  function getScopedLegalGroups() {
    const values =
      getAccessScopes()
        .filter(
          (scope) =>
            scope &&
            typeof scope === "object" &&
            scope.legal_group_code
        )
        .map(
          (scope) =>
            scope.legal_group_code
        );

    return [
      ...new Set(values),
    ];
  }


  /* ───────────────────────────────────────────────────────────
     Legal Entity scopes
  ─────────────────────────────────────────────────────────── */

  function getScopedLegalEntities() {
    const values =
      getAccessScopes()
        .filter(
          (scope) =>
            scope &&
            typeof scope === "object" &&
            scope.legal_entity_name
        )
        .map(
          (scope) =>
            scope.legal_entity_name
        );

    return [
      ...new Set(values),
    ];
  }


  /* ───────────────────────────────────────────────────────────
     Parent Division scopes
  ─────────────────────────────────────────────────────────── */

  function getScopedParentDivisions() {
    const values =
      getAccessScopes()
        .filter(
          (scope) =>
            scope &&
            typeof scope === "object" &&
            scope.parent_division_name
        )
        .map(
          (scope) =>
            scope.parent_division_name
        );

    return [
      ...new Set(values),
    ];
  }


  /* ───────────────────────────────────────────────────────────
     Subdivision scopes
  ─────────────────────────────────────────────────────────── */

  function getScopedSubdivisions() {
    const values =
      getAccessScopes()
        .filter(
          (scope) =>
            scope &&
            typeof scope === "object" &&
            scope.subdivision_name
        )
        .map(
          (scope) =>
            scope.subdivision_name
        );

    return [
      ...new Set(values),
    ];
  }


  /* ───────────────────────────────────────────────────────────
     Analysis scopes
  ─────────────────────────────────────────────────────────── */

  function getScopedAnalyses() {
    const values =
      getAccessScopes()
        .filter(
          (scope) =>
            scope &&
            typeof scope === "object" &&
            scope.analysis_name
        )
        .map(
          (scope) =>
            scope.analysis_name
        );

    return [
      ...new Set(values),
    ];
  }


  /* ───────────────────────────────────────────────────────────
     Country scopes

     Kept for backward compatibility.

     The current backend scope schema does not define
     country fields, but this safely supports them if
     they are added later.
  ─────────────────────────────────────────────────────────── */

  function getScopedCountries() {
    const values =
      getAccessScopes()
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

    return [
      ...new Set(values),
    ];
  }


  /* ───────────────────────────────────────────────────────────
     Salesperson scopes

     Current backend scope schema does not define
     salesperson fields.

     Kept for backward compatibility.
  ─────────────────────────────────────────────────────────── */

  function getScopedSalesperson() {
    const scopes =
      getAccessScopes();

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
     Scope matching helpers

     These helpers allow components to check whether
     a particular row belongs to the user's backend scope.
  ─────────────────────────────────────────────────────────── */

  function hasLegalGroupAccess(
    legalGroupCode
  ) {
    if (!legalGroupCode) {
      return false;
    }

    return getScopedLegalGroups().some(
      (value) =>
        String(value)
          .toUpperCase() ===
        String(
          legalGroupCode
        ).toUpperCase()
    );
  }


  function hasLegalEntityAccess(
    legalEntityName
  ) {
    if (!legalEntityName) {
      return false;
    }

    return getScopedLegalEntities().some(
      (value) =>
        String(value)
          .toUpperCase() ===
        String(
          legalEntityName
        ).toUpperCase()
    );
  }


  function hasParentDivisionAccess(
    parentDivisionName
  ) {
    if (!parentDivisionName) {
      return false;
    }

    return getScopedParentDivisions().some(
      (value) =>
        String(value)
          .toUpperCase() ===
        String(
          parentDivisionName
        ).toUpperCase()
    );
  }


  function hasSubdivisionAccess(
    subdivisionName
  ) {
    if (!subdivisionName) {
      return false;
    }

    return getScopedSubdivisions().some(
      (value) =>
        String(value)
          .toUpperCase() ===
        String(
          subdivisionName
        ).toUpperCase()
    );
  }


  function hasAnalysisAccess(
    analysisName
  ) {
    if (!analysisName) {
      return false;
    }

    return getScopedAnalyses().some(
      (value) =>
        String(value)
          .toUpperCase() ===
        String(
          analysisName
        ).toUpperCase()
    );
  }


  /* ───────────────────────────────────────────────────────────
     Sensitive access

     Backward-compatible helper.

     Sensitive/page access is still determined by
     module_permissions, not access_scopes.
  ─────────────────────────────────────────────────────────── */

  function hasSensitiveAccess(
    page
  ) {
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
     Provider
  ─────────────────────────────────────────────────────────── */

  return (
    <AuthContext.Provider
      value={{
        /*
         * Authentication
         */
        user,
        loading,

        loginWithBackend,
        logout,

        /*
         * Role
         */
        hasRole,

        /*
         * Module permissions
         */
        getModulePermissions,
        getModulePermission,
        hasPermission,

        canView,
        canExport,
        canUpload,
        canAdmin,

        /*
         * Page access
         */
        canAccess,
        hasExportRight,

        /*
         * Backend access scopes
         */
        getAccessScopes,
        getScopedEntities,

        getScopedLegalGroups,
        getScopedLegalEntities,
        getScopedParentDivisions,
        getScopedSubdivisions,
        getScopedAnalyses,

        getScopedCountries,
        getScopedSalesperson,

        /*
         * Scope checks
         */
        hasLegalGroupAccess,
        hasLegalEntityAccess,
        hasParentDivisionAccess,
        hasSubdivisionAccess,
        hasAnalysisAccess,

        /*
         * Backward-compatible helper
         */
        hasSensitiveAccess,

        /*
         * Audit
         */
        auditLog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


/* ─────────────────────────────────────────────────────────────
   useAuth
───────────────────────────────────────────────────────────── */

export function useAuth() {
  return useContext(
    AuthContext
  );
}