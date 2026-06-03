/**
 * Sales Revenue API Service
 * ─────────────────────────
 * All calls include JWT Bearer token from localStorage.
 * Base URL is read from the Vite env variable VITE_API_BASE_URL
 * (defaults to http://localhost:8000 for local development).
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://13.233.207.68:8000';

/* ── JWT helpers ───────────────────────────────────────────────── */

/**
 * Build the Authorization + Content-Type headers for every request.
 * Token key: localStorage.finsight_token  (written by the real backend after login).
 */
function getAuthHeaders() {
  const token = localStorage.getItem('finsight_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ── Mock data for Demo fallback ──────────────────────────────── */

const MOCK_FILTERS = {
  legal_groups: ['FJ Group'],
  legal_entities: ['FJ HQ', 'FJ Care UAE', 'FJ Care Int\'l', 'Flowtech Qatar', 'Flowtech Oman', 'FJ Engineering KSA'],
  parent_divisions: ['Corporate', 'FJ Care', 'Flowtech UAE, QTR, OMN', 'Engineering'],
  sub_divisions: ['HQ Operations', 'FJ Care Services', 'Flowtech Sales', 'Engineering Services'],
  salesmen: ['Hassan Al Nuaimi', 'John Doe', 'Sarah Connor']
};

const MOCK_SUMMARY = {
  mtd_revenue: 14250000,
  ytd_revenue: 168900000,
  prev_mtd_revenue: 13100000,
  prev_ytd_revenue: 154000000,
  mtd_change_pct: 8.78,
  ytd_change_pct: 9.68,
  top_legal_entity: { name: 'FJ HQ', value: 7850000, pct: 55.09 },
  top_parent_division: { name: 'Engineering', value: 6540000, pct: 45.89 },
  currency: 'AED',
  data_as_of: new Date().toISOString(),
  current_year_label: 'Current Year',
  previous_year_label: 'Previous Year'
};

const MOCK_TREND = {
  data: [
    { period: 'Jan', current_year: 12000000, previous_year: 11000000, target: 11500000 },
    { period: 'Feb', current_year: 13500000, previous_year: 12200000, target: 13000000 },
    { period: 'Mar', current_year: 14200000, previous_year: 13000000, target: 13800000 },
    { period: 'Apr', current_year: 15100000, previous_year: 14000000, target: 14500000 },
    { period: 'May', current_year: 16200000, previous_year: 14800000, target: 15500000 },
    { period: 'Jun', current_year: 17500000, previous_year: 15500000, target: 16800000 },
  ]
};

const MOCK_LEGAL_ENTITY = {
  data: [
    { name: 'FJ HQ', value: 7850000, pct: 55.09 },
    { name: 'FJ Care UAE', value: 2450000, pct: 17.19 },
    { name: 'Flowtech Qatar', value: 1850000, pct: 12.98 },
    { name: 'FJ Engineering KSA', value: 2100000, pct: 14.74 },
  ],
  total: 14250000
};

const MOCK_PARENT_DIVISION = {
  data: [
    { name: 'Corporate', value: 7850000 },
    { name: 'FJ Care', value: 2450000 },
    { name: 'Flowtech UAE, QTR, OMN', value: 1850000 },
    { name: 'Engineering', value: 2100000 },
  ],
  total: 14250000
};

const MOCK_SUBDIVISION = {
  data: [
    { name: 'HQ Operations', value: 7850000 },
    { name: 'FJ Care Services', value: 2450000 },
    { name: 'Flowtech Sales', value: 1850000 },
    { name: 'Engineering Services', value: 2100000 },
  ],
  total: 14250000
};

const MOCK_DETAILS = {
  rows: [
    {
      legal_entity: 'FJ HQ',
      parent_division: 'Corporate',
      sub_division: 'HQ Operations',
      mtd_revenue: 7850000,
      prev_mtd_revenue: 7200000,
      ytd_revenue: 92000000,
      ytd_py_revenue: 85000000,
      variance_mtd_pct: 9.03,
      variance_ytd_pct: 8.24,
    },
    {
      legal_entity: 'FJ Care UAE',
      parent_division: 'FJ Care',
      sub_division: 'FJ Care Services',
      mtd_revenue: 2450000,
      prev_mtd_revenue: 2200000,
      ytd_revenue: 28000000,
      ytd_py_revenue: 25000000,
      variance_mtd_pct: 11.36,
      variance_ytd_pct: 12.00,
    },
    {
      legal_entity: 'Flowtech Qatar',
      parent_division: 'Flowtech UAE, QTR, OMN',
      sub_division: 'Flowtech Sales',
      mtd_revenue: 1850000,
      prev_mtd_revenue: 1700000,
      ytd_revenue: 22000000,
      ytd_py_revenue: 20000000,
      variance_mtd_pct: 8.82,
      variance_ytd_pct: 10.00,
    },
    {
      legal_entity: 'FJ Engineering KSA',
      parent_division: 'Engineering',
      sub_division: 'Engineering Services',
      mtd_revenue: 2100000,
      prev_mtd_revenue: 2000000,
      ytd_revenue: 26900000,
      ytd_py_revenue: 24000000,
      variance_mtd_pct: 5.00,
      variance_ytd_pct: 12.08,
    }
  ],
  totals: {
    mtd_revenue: 14250000,
    prev_mtd_revenue: 13100000,
    ytd_revenue: 168900000,
    ytd_py_revenue: 154000000,
    variance_mtd_pct: 8.78,
    variance_ytd_pct: 9.68,
  }
};

function getMockDataForPath(path) {
  if (path.includes('/filters')) return MOCK_FILTERS;
  if (path.includes('/summary')) return MOCK_SUMMARY;
  if (path.includes('/trend')) return MOCK_TREND;
  if (path.includes('/legal-entity')) return MOCK_LEGAL_ENTITY;
  if (path.includes('/parent-division')) return MOCK_PARENT_DIVISION;
  if (path.includes('/subdivision')) return MOCK_SUBDIVISION;
  if (path.includes('/details')) return MOCK_DETAILS;
  return {};
}

/* ── Core fetch wrapper ────────────────────────────────────────── */

/**
 * Central request handler.
 * @param {string} path     - e.g. '/api/sales-revenue/summary'
 * @param {object} params   - query-string parameters (filters)
 * @returns {Promise<any>}  - parsed JSON response
 * @throws {{ status: number, message: string }}
 */
async function apiCall(path, params = {}) {
  const token = localStorage.getItem('finsight_token');

  // If no token exists in localStorage, fall back to high-fidelity mock data.
  // This allows the page to work seamlessly when logged in via Demo Mode.
  if (!token) {
    console.warn(`[salesRevenueApi] Token missing. Returning local mock fallback data for: ${path}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockDataForPath(path));
      }, 300); // simulate network latency
    });
  }

  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString();

  const url = `${API_BASE}${path}${qs ? `?${qs}` : ''}`;

  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (networkErr) {
    const err = { status: 0, message: `Network error: ${networkErr.message}` };
    console.error('[salesRevenueApi] Network error on', url, networkErr);
    throw err;
  }

  if (!res.ok) {
    // Capture the full response body for debugging 502s
    const rawBody = await res.text().catch(() => '');
    let body = {};
    try { body = JSON.parse(rawBody); } catch { /* non-JSON body */ }

    const message =
      body?.detail ||
      body?.message ||
      body?.error ||
      rawBody.slice(0, 120) ||
      res.statusText;

    console.error(
      `[salesRevenueApi] ${res.status} on ${url}`,
      '\nBody:', rawBody.slice(0, 500)
    );

    throw { status: res.status, message, rawBody: rawBody.slice(0, 300) };
  }

  return res.json();
}


/* ── Filter params builder ─────────────────────────────────────── */

/**
 * Normalise the filter state object into API-ready query params.
 */
function buildParams(filters = {}) {
  return {
    legal_group:   filters.legalGroup   !== 'All' ? filters.legalGroup   : undefined,
    legal_entity:  filters.legalEntity  !== 'All' ? filters.legalEntity  : undefined,
    parent_division: filters.parentDiv  !== 'All' ? filters.parentDiv    : undefined,
    sub_division:  filters.subDiv       !== 'All' ? filters.subDiv       : undefined,
    salesman:      filters.salesman     !== 'All' ? filters.salesman     : undefined,
    from_date:     filters.fromDate     || undefined,
    to_date:       filters.toDate       || undefined,
    currency:      'AED',
  };
}

/* ── Public API functions ──────────────────────────────────────── */

/**
 * GET /api/sales-revenue/filters
 * Returns available filter options (dropdown values).
 *
 * Expected response shape:
 * {
 *   legal_groups: string[],
 *   legal_entities: string[],
 *   parent_divisions: string[],
 *   sub_divisions: string[],
 *   salesmen: string[],
 * }
 */
export async function fetchFilters() {
  return apiCall('/api/sales-revenue/filters', { currency: 'AED' });
}

/**
 * GET /api/sales-revenue/summary
 * Returns KPI summary values.
 *
 * Expected response shape:
 * {
 *   mtd_revenue: number,
 *   ytd_revenue: number,
 *   prev_mtd_revenue: number,
 *   prev_ytd_revenue: number,
 *   mtd_change_pct: number,
 *   ytd_change_pct: number,
 *   top_legal_entity: { name: string, value: number, pct: number },
 *   top_parent_division: { name: string, value: number, pct: number },
 *   currency: string,
 *   data_as_of: string,   // ISO date string
 * }
 */
export async function fetchSummary(filters) {
  return apiCall('/api/sales-revenue/summary', buildParams(filters));
}

/**
 * GET /api/sales-revenue/trend
 * Returns monthly revenue trend data.
 *
 * Expected response shape:
 * {
 *   data: [
 *     { period: string, current_year: number, previous_year: number, target: number }
 *   ]
 * }
 */
export async function fetchTrend(filters) {
  return apiCall('/api/sales-revenue/trend', buildParams(filters));
}

/**
 * GET /api/sales-revenue/legal-entity
 * Returns revenue breakdown by legal entity.
 *
 * Expected response shape:
 * {
 *   data: [
 *     { name: string, value: number, pct: number }
 *   ],
 *   total: number
 * }
 */
export async function fetchLegalEntity(filters) {
  return apiCall('/api/sales-revenue/legal-entity', buildParams(filters));
}

/**
 * GET /api/sales-revenue/parent-division
 * Returns revenue breakdown by parent division.
 *
 * Expected response shape:
 * {
 *   data: [
 *     { name: string, value: number }
 *   ],
 *   total: number
 * }
 */
export async function fetchParentDivision(filters) {
  return apiCall('/api/sales-revenue/parent-division', buildParams(filters));
}

/**
 * GET /api/sales-revenue/subdivision
 * Returns revenue breakdown by sub-division.
 *
 * Expected response shape:
 * {
 *   data: [
 *     { name: string, value: number }
 *   ],
 *   total: number
 * }
 */
export async function fetchSubDivision(filters) {
  return apiCall('/api/sales-revenue/subdivision', buildParams(filters));
}

/**
 * GET /api/sales-revenue/details
 * Returns the full detailed view rows.
 *
 * Expected response shape:
 * {
 *   rows: [
 *     {
 *       legal_entity: string,
 *       parent_division: string,
 *       sub_division: string,
 *       mtd_revenue: number,
 *       prev_mtd_revenue: number,
 *       ytd_revenue: number,
 *       ytd_py_revenue: number,
 *       variance_mtd_pct: number,
 *       variance_ytd_pct: number,
 *     }
 *   ],
 *   totals: {
 *     mtd_revenue: number,
 *     prev_mtd_revenue: number,
 *     ytd_revenue: number,
 *     ytd_py_revenue: number,
 *     variance_mtd_pct: number,
 *     variance_ytd_pct: number,
 *   }
 * }
 */
export async function fetchDetails(filters) {
  return apiCall('/api/sales-revenue/details', buildParams(filters));
}
