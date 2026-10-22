/**
 * executiveDashboardApi.js
 * ──────────────────────────────────────────────────────────────────────────
 * All API calls for the Executive Dashboard.
 * Base: /api/executive-dashboard
 *
 * Rules (per backend handoff):
 *  - All financial calculations come from backend. Do NOT recalculate.
 *  - null from API  → display "-"
 *  - 0.00 from API  → display "0.00"   (never convert null to 0)
 *  - Hierarchy filters passed as IDs to backend; no local filtering.
 *  - Hierarchy: Legal Group → Legal Entity → Parent Division → Sub-Division
 *  - All endpoints receive the same filter set consistently.
 */

import api from './axios';

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */

function getAuthHeaders() {
    const token =
        localStorage.getItem('finsight_token') ||
        localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Build query params — omit undefined / null / empty-string values.
 * Arrays serialised as repeated keys: ?legal_entity_id=1&legal_entity_id=2
 */
function buildParams(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
            value.forEach(v => {
                if (v !== undefined && v !== null && v !== '') params.append(key, v);
            });
        } else {
            params.append(key, value);
        }
    });
    return params;
}

/* ─────────────────────────────────────────────────────────────────────────────
   IN-FLIGHT REQUEST DEDUPLICATION & USER-ISOLATED QUERY CACHE
───────────────────────────────────────────────────────────────────────────── */
const inFlightRequests = new Map();
const queryCache = new Map();
const DEFAULT_CACHE_TTL_MS = 30_000; // 30-second query cache TTL

/**
 * Extract authenticated user context and role to guarantee strict cache isolation.
 * Prevents requests from different user accounts or RBAC scopes from sharing cached data.
 * Raw JWT tokens are NEVER stored in keys or exposed in logs.
 */
function getUserContext() {
    try {
        const rawUser = typeof localStorage !== 'undefined' ? localStorage.getItem('finsight_user') : null;
        if (rawUser) {
            const u = JSON.parse(rawUser);
            const uid = u.id || u.user_profile_id || u.emp_id || 'u';
            const role = u.role_code || u.role || 'r';
            return `u:${uid}:${role}`;
        }
    } catch {
        // ignore parse error
    }
    const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('finsight_token') || localStorage.getItem('token')) : null;
    if (token) {
        // Safe non-sensitive suffix identifier of token signature (last 10 chars)
        return `tok:${token.slice(-10)}`;
    }
    return 'anon';
}

/**
 * Build a canonical, deterministic, and user-isolated cache key.
 * Prepends user/role context and normalizes/sorts all query parameters and arrays.
 */
function getCacheKey(path, filters = {}) {
    const userScope = getUserContext();
    const keys = Object.keys(filters).sort();
    const parts = [];
    for (const key of keys) {
        const val = filters[key];
        if (val === undefined || val === null || val === '') continue;
        if (Array.isArray(val)) {
            const sorted = [...val].map(String).sort();
            parts.push(`${encodeURIComponent(key)}=[${sorted.map(encodeURIComponent).join(',')}]`);
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
        }
    }
    return `[${userScope}]${path}${parts.length ? `?${parts.join('&')}` : ''}`;
}

/**
 * Clears the executive dashboard query cache and cancels in-flight tracking.
 * Useful on logout, user change, or manual full refresh.
 */
export function clearExecDashboardCache() {
    queryCache.clear();
    inFlightRequests.clear();
}

/**
 * Invalidates cached queries matching a specific path or prefix.
 */
export function invalidateExecDashboardQuery(pathPrefix) {
    for (const key of queryCache.keys()) {
        if (key.includes(pathPrefix)) {
            queryCache.delete(key);
        }
    }
}

// Auto-purge cache on session logout or auth expiration
if (typeof window !== 'undefined') {
    window.addEventListener('auth:unauthorized', () => clearExecDashboardCache());
    window.addEventListener('storage', (e) => {
        if (e.key === 'finsight_token' || e.key === 'finsight_user' || e.key === 'token') {
            clearExecDashboardCache();
        }
    });
}

/**
 * Central execGet with:
 * 1. User & RBAC-isolated in-flight request deduplication:
 *    Concurrent calls for the exact same query share the same Promise.
 * 2. User & RBAC-isolated query caching (TTL):
 *    Subsequent calls within the TTL window receive the cached response immediately.
 * 3. Safe error & cancellation isolation:
 *    Failed requests are never cached; unmounting callers cannot cancel sibling consumers.
 * 4. Cache bypass / forceRefresh option:
 *    Pass { forceRefresh: true } or { bypassCache: true } to force a fresh network call.
 */
async function execGet(path, filters = {}, options = {}) {
    const cacheKey = getCacheKey(path, filters);
    const ttl = options.ttlMs ?? DEFAULT_CACHE_TTL_MS;
    const forceRefresh = options.forceRefresh || options.bypassCache || false;

    // 1. Check Query Cache (if fresh and not forced)
    if (!forceRefresh && queryCache.has(cacheKey)) {
        const cached = queryCache.get(cacheKey);
        if (Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }
        queryCache.delete(cacheKey);
    }

    // 2. In-Flight Request Deduplication:
    // If an identical request is already underway, attach to its Promise
    if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey);
    }

    // 3. Dispatch fresh request and register in-flight Promise
    const fetchPromise = (async () => {
        try {
            const response = await api.get(`/executive-dashboard${path}`, {
                params: buildParams(filters),
                headers: getAuthHeaders(),
            });

            // Store successful response in query cache
            queryCache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now(),
            });

            return response.data;
        } finally {
            // Always remove from in-flight requests once settled (fulfilled or rejected)
            inFlightRequests.delete(cacheKey);
        }
    })();

    inFlightRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
}

/**
 * Build the common hierarchy filter object from the dashboard appliedFilters state.
 * All endpoints share these exact parameter names.
 */
export function buildHierarchyParams(f = {}) {
    const dateVal = f.as_of_date || f.as_on_date || '2026-09-25';
    let periodType = f.period_type || f.period;
    if (!periodType || periodType === 'Current Period' || String(periodType).toUpperCase() === 'PTD') {
        periodType = 'PTD';
    } else if (String(periodType).toUpperCase().includes('YTD')) {
        periodType = 'YTD';
    } else {
        periodType = 'PTD';
    }
    return {
        as_of_date: dateVal,
        period_type: periodType,
        reporting_currency: f.reporting_currency || 'AED',
        ...(f.legal_group_id     ? { legal_group_id: f.legal_group_id }         : {}),
        ...(f.legal_entity_id    ? { legal_entity_id: f.legal_entity_id }       : {}),
        ...(f.parent_division_id ? { parent_division_id: f.parent_division_id } : {}),
        ...(f.subdivision_id     ? { subdivision_id: f.subdivision_id }         : {}),
    };
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. KPI CARDS
   GET /api/executive-dashboard/kpis
   Params: as_of_date, period_type (PTD|YTD), reporting_currency,
           legal_group_id, legal_entity_id, parent_division_id, subdivision_id
───────────────────────────────────────────────────────────────────────────── */

export async function getExecKpis(filters = {}, options = {}) {
    return execGet('/kpis', buildHierarchyParams(filters), options);
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. TRADE WORKING CAPITAL TREND
   GET /api/executive-dashboard/trade-working-capital-trend
   Params: months, legal_group_id, legal_entity_id,
           parent_division_id, subdivision_id
───────────────────────────────────────────────────────────────────────────── */

export async function getExecTwcTrend(filters = {}, options = {}) {
    const { as_of_date, period_type, reporting_currency, ...rest } = buildHierarchyParams(filters);
    return execGet('/trade-working-capital-trend', {
        months: 12,
        ...rest,
    }, options);
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. TWC VIEW ALL (table)
   GET /api/executive-dashboard/trade-working-capital-view-all
   Params: as_on_date (note: uses as_on_date not as_of_date),
           legal_group_id, legal_entity_id, parent_division_id, subdivision_id
   Multi-select supported for all hierarchy params.
   Backend columns:
     legal_entity, parent_division, sub_division,
     trade_receivables, dso_days,
     trade_payables, dpo_days,
     inventory, dio_days,
     trade_working_capital, cash_conversion_cycle_days
───────────────────────────────────────────────────────────────────────────── */

export async function getExecTwcViewAll(filters = {}, options = {}) {
    const h = buildHierarchyParams(filters);
    // This endpoint uses as_on_date (not as_of_date)
    const { as_of_date, period_type, reporting_currency, ...hierarchyOnly } = h;
    return execGet('/trade-working-capital-view-all', {
        ...(as_of_date ? { as_on_date: as_of_date } : {}),
        ...hierarchyOnly,
    }, options);
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. TWC VIEW ALL – EXCEL EXPORT
   GET /api/executive-dashboard/trade-working-capital-view-all/export/excel
   Pass exactly the same filter state as View All.
───────────────────────────────────────────────────────────────────────────── */

export async function exportExecTwcExcel(filters = {}) {
    const h = buildHierarchyParams(filters);
    const { as_of_date, period_type, reporting_currency, ...hierarchyOnly } = h;
    const response = await api.get(
        '/executive-dashboard/trade-working-capital-view-all/export/excel',
        {
            params: buildParams({
                ...(as_of_date ? { as_on_date: as_of_date } : {}),
                ...hierarchyOnly,
            }),
            headers: getAuthHeaders(),
            responseType: 'blob',
        }
    );
    downloadFile(response, 'twc_view_all.xlsx');
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. TWC VIEW ALL – PDF EXPORT
   GET /api/executive-dashboard/trade-working-capital-view-all/export/pdf
   Pass exactly the same filter state as View All.
   Backend PDF contains: Legal Entity, Parent Division, Sub-Division,
   Trade Receivables, DSO, Trade Payables, DPO, Inventory, DIO, TWC, CCC
───────────────────────────────────────────────────────────────────────────── */

export async function exportExecTwcPdf(filters = {}) {
    const h = buildHierarchyParams(filters);
    const { as_of_date, period_type, reporting_currency, ...hierarchyOnly } = h;
    const response = await api.get(
        '/executive-dashboard/trade-working-capital-view-all/export/pdf',
        {
            params: buildParams({
                ...(as_of_date ? { as_on_date: as_of_date } : {}),
                ...hierarchyOnly,
            }),
            headers: getAuthHeaders(),
            responseType: 'blob',
        }
    );
    downloadFile(response, 'twc_view_all.pdf');
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. REVENUE BY REGION
   GET /api/executive-dashboard/revenue-by-region
   Params: as_of_date, period_type (PTD|YTD), reporting_currency,
           legal_group_id, legal_entity_id, parent_division_id, subdivision_id
   Used directly for the Revenue by Region chart.
   Do NOT derive regional revenue by grouping the KPI response.
───────────────────────────────────────────────────────────────────────────── */

export async function getExecRevenueByRegion(filters = {}, options = {}) {
    return execGet('/revenue-by-region', buildHierarchyParams(filters), options);
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. PROFITABILITY BY REGION
   GET /api/executive-dashboard/profitability-by-region
   Params: as_of_date, period_type (PTD|YTD), reporting_currency,
           legal_group_id, legal_entity_id, parent_division_id, subdivision_id
   Use backend-returned profitability values directly.
   Do NOT calculate GP/EBITDA/NP percentages independently.
───────────────────────────────────────────────────────────────────────────── */

export async function getExecProfitabilityByRegion(filters = {}, options = {}) {
    return execGet('/profitability-by-region', buildHierarchyParams(filters), options);
}

/* ─────────────────────────────────────────────────────────────────────────────
   FILE DOWNLOAD HELPER
───────────────────────────────────────────────────────────────────────────── */

export function downloadFile(response, fallbackFileName) {
    const blob = new Blob([response.data], {
        type: response.headers?.['content-type'] || 'application/octet-stream',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Try to get filename from Content-Disposition header
    const disposition = response.headers?.['content-disposition'];
    let fileName = fallbackFileName;
    if (disposition) {
        const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
        const normalMatch = disposition.match(/filename\s*=\s*(?:"([^"]+)"|([^;]+))/i);
        const rawName = utf8Match?.[1] || normalMatch?.[1] || normalMatch?.[2];
        if (rawName) {
            try { fileName = decodeURIComponent(rawName).trim(); } catch { fileName = rawName.trim(); }
        }
    }

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}
