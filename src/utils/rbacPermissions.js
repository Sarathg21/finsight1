/**
 * FinSight Centralized RBAC Permission Engine
 * Core Frontend RBAC Integration (Technical Specification Version 1.0, 14 October 2026)
 *
 * Authoritative Source: Backend GET /api/access/me module_permissions array.
 *
 * Rules:
 * 1. Exact module_code match required.
 * 2. Strict boolean true required for permission flags (no truthy coercion).
 * 3. canExport and canUpload strictly require canView === true.
 * 4. canAdmin requires can_admin === true on an active row.
 * 5. Fails closed (false) for null, undefined, inactive, malformed, or unmapped data.
 * 6. Never grants access based on role names, allowedPages, exportRights, or client-side overrides.
 */

// ── Canonical Route-to-Module Registry ──────────────────────────────
// Specification Section 4: Approved 10 primary report routes
export const CANONICAL_ROUTE_REGISTRY = Object.freeze({
  '/exec-dashboard': 'EXECUTIVE_DASHBOARD',
  '/pl': 'PROFIT_LOSS',
  '/balance-sheet': 'BALANCE_SHEET',
  '/operating-expenses': 'OPERATING_EXPENSES',
  '/revenue': 'SALES_REVENUE',
  '/receivables': 'RECEIVABLES',
  '/payables': 'PAYABLES',
  '/inventory': 'INVENTORY',
  '/WorkingCapital': 'WORKING_CAPITAL',
  '/financial-position': 'FINANCIAL_POSITION',
});

// Normalized lookup map for URL variations (trailing slashes, case normalization)
const NORMALIZED_ROUTE_MAP = Object.freeze(
  Object.entries(CANONICAL_ROUTE_REGISTRY).reduce((acc, [route, moduleCode]) => {
    const norm = normalizeRoutePath(route);
    acc[norm] = moduleCode;
    return acc;
  }, {})
);

/**
 * Normalizes route path:
 * - Trims whitespace
 * - Strips trailing slashes (except root "/")
 * - Lowers case for URL-tolerant routing
 */
export function normalizeRoutePath(path) {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (trimmed === '' || trimmed === '/') return trimmed;
  const noTrailing = trimmed.replace(/\/+$/, '');
  return noTrailing.toLowerCase();
}

/**
 * Resolves a route path or pageKey to its canonical moduleCode.
 * Returns null for unmapped, legacy, or unknown routes (fails closed).
 * Note: /admin, /profile, /dashboard, /fixed-assets, /excel-consolidator
 * are unconfirmed and deliberately return null.
 */
export function resolveModuleCodeForRoute(routeOrKey) {
  if (!routeOrKey || typeof routeOrKey !== 'string') return null;

  // 1. Direct match in canonical registry (preserves case-sensitive '/WorkingCapital')
  if (CANONICAL_ROUTE_REGISTRY[routeOrKey]) {
    return CANONICAL_ROUTE_REGISTRY[routeOrKey];
  }

  // 2. Normalized path with leading slash
  let path = routeOrKey.trim();
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const norm = normalizeRoutePath(path);
  if (NORMALIZED_ROUTE_MAP[norm]) {
    return NORMALIZED_ROUTE_MAP[norm];
  }

  return null;
}

/**
 * Duplicate row & Active-row Policy:
 * Filters permissions for the given moduleCode.
 * Any row with active === false, or lacking required object structure, is rejected.
 * Fails closed if input is not an array or moduleCode is invalid.
 */
function getActiveRowsForModule(permissions, moduleCode) {
  if (!Array.isArray(permissions) || !moduleCode || typeof moduleCode !== 'string') {
    return [];
  }
  const targetCode = moduleCode.trim();
  if (!targetCode) return [];

  return permissions.filter((row) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    if (row.module_code !== targetCode) return false;
    // Row must be active (active field absent defaults to true; explicit false rejects)
    if (row.active === false) return false;
    return true;
  });
}

/**
 * canView(permissions, moduleCode)
 * Authoritative check if module can be viewed.
 * Returns true if and only if at least one active row has can_view === true.
 */
export function canView(permissions, moduleCode) {
  const activeRows = getActiveRowsForModule(permissions, moduleCode);
  if (activeRows.length === 0) return false;
  return activeRows.some((row) => row.can_view === true);
}

/**
 * canExport(permissions, moduleCode)
 * Authoritative check if module data can be exported.
 * Strict prerequisite: canView(permissions, moduleCode) MUST be true.
 * Returns true if canView is true AND at least one active row has can_export === true.
 */
export function canExport(permissions, moduleCode) {
  if (!canView(permissions, moduleCode)) {
    return false;
  }
  const activeRows = getActiveRowsForModule(permissions, moduleCode);
  return activeRows.some((row) => row.can_export === true);
}

/**
 * canUpload(permissions, moduleCode)
 * Authoritative check if module data can be uploaded/imported.
 * Strict prerequisite: canView(permissions, moduleCode) MUST be true.
 * Returns true if canView is true AND at least one active row has can_upload === true.
 */
export function canUpload(permissions, moduleCode) {
  if (!canView(permissions, moduleCode)) {
    return false;
  }
  const activeRows = getActiveRowsForModule(permissions, moduleCode);
  return activeRows.some((row) => row.can_upload === true);
}

/**
 * canAdmin(permissions, moduleCode)
 * Authoritative check if user has admin privileges for the module.
 * Returns true if at least one active row has can_admin === true.
 */
export function canAdmin(permissions, moduleCode) {
  const activeRows = getActiveRowsForModule(permissions, moduleCode);
  if (activeRows.length === 0) return false;
  return activeRows.some((row) => row.can_admin === true);
}

/**
 * canAccess(permissions, routeOrKey)
 * Checks route authorization using canonical route registry.
 * Fails closed for unknown/unmapped routes or if user lacks can_view.
 */
export function canAccess(permissions, routeOrKey) {
  const moduleCode = resolveModuleCodeForRoute(routeOrKey);
  if (!moduleCode) {
    return false;
  }
  return canView(permissions, moduleCode);
}

// ── Canonical Landing Priority List ─────────────────────────────────
// Specification Section 5: Landing priority order (never grants access)
export const LANDING_PRIORITY_ROUTES = Object.freeze([
  { route: '/exec-dashboard', moduleCode: 'EXECUTIVE_DASHBOARD' },
  { route: '/pl', moduleCode: 'PROFIT_LOSS' },
  { route: '/revenue', moduleCode: 'SALES_REVENUE' },
  { route: '/financial-position', moduleCode: 'FINANCIAL_POSITION' },
  { route: '/balance-sheet', moduleCode: 'BALANCE_SHEET' },
  { route: '/receivables', moduleCode: 'RECEIVABLES' },
  { route: '/payables', moduleCode: 'PAYABLES' },
  { route: '/inventory', moduleCode: 'INVENTORY' },
  { route: '/WorkingCapital', moduleCode: 'WORKING_CAPITAL' },
  { route: '/operating-expenses', moduleCode: 'OPERATING_EXPENSES' },
]);

/**
 * Resolves the user's landing page based on approved priority order.
 * Returns null if the user has no permitted report modules (fails closed).
 */
export function resolveLandingRoute(permissions) {
  if (!Array.isArray(permissions)) return null;
  for (const item of LANDING_PRIORITY_ROUTES) {
    if (canView(permissions, item.moduleCode)) {
      return item.route;
    }
  }
  return null;
}

/**
 * Computes the full authorization state summary.
 * Used by AuthContext and diagnostics.
 */
export function computeAuthorizationState({ user, loading, error = null }) {
  const permissions = Array.isArray(user?.module_permissions) ? user.module_permissions : [];
  const scopes = Array.isArray(user?.access_scopes) ? user.access_scopes : [];

  const permittedModules = Object.values(CANONICAL_ROUTE_REGISTRY).filter((modCode, idx, arr) => {
    return arr.indexOf(modCode) === idx && canView(permissions, modCode);
  });

  return {
    isLoading: Boolean(loading),
    isAuthenticated: Boolean(user && user.user_profile_id && (user.token || user.access_token)),
    isAuthorized: permittedModules.length > 0,
    permittedModules,
    activeScopes: scopes,
    user: user || null,
    error: error || null,
  };
}

