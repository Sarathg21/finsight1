/**
 * P&L Report API Service
 * ─────────────────────────
 * Mirrors salesRevenueApi.js patterns:
 *  - JWT Bearer token from localStorage
 *  - Demo-mode mock fallback (no token → rich mock data)
 *  - In-flight deduplication cache
 *  - Cascading filter support via /api/pl/filters
 *
 * Base URL: VITE_API_BASE_URL env var (defaults to '' for Vite proxy)
 */

// Keep ?? (not ||) — empty string means relative paths (Vite proxy), not fallback to default
import { LEGAL_ENTITIES } from '../data/masterData';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/* ── Auth headers ───────────────────────────────────────────────── */
function getAuthHeaders() {
  const token = localStorage.getItem('finsight_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ══════════════════════════════════════════════════════════════════
   MOCK DATA  (used in demo mode — no JWT token present)
══════════════════════════════════════════════════════════════════ */

const MOCK_FILTERS = {
  legal_groups:     ['FJ Group'],
  legal_entities:   ['FJ HQ', 'FJ Care UAE', 'FJ Care Int\'l', 'Flowtech Qatar', 'Flowtech Oman', 'FJ Engineering KSA'],
  parent_divisions: ['Corporate', 'FJ Care', 'Flowtech UAE, QTR, OMN', 'Engineering'],
  subdivisions:     ['HQ Operations', 'FJ Care Services', 'Flowtech Sales', 'Engineering Services'],
  periods:          [
    'Jun-26', 'May-26', 'Apr-26', 'Mar-26', 'Feb-26', 'Jan-26',
    'Dec-25', 'Nov-25', 'Oct-25', 'Sep-25', 'Aug-25', 'Jul-25',
  ],
};

const MOCK_SUMMARY = {
  // Revenue
  total_revenue:       14250000,
  // Cost of Sales
  cost_of_sales:       9787500,
  // Gross Profit
  gross_profit:        4462500,
  gross_profit_pct:    31.31,
  // Other Income
  other_income:        325000,
  // Operating Expenses
  operating_expenses:  2480000,
  // EBITDA
  ebitda:              2307500,
  ebitda_pct:          16.19,
  // PBT / Tax / NP
  pbt:                 1865000,
  tax_expense:         354350,
  net_profit:          1510650,
  net_profit_pct:      10.60,
  // Compare period values (for variance calculation)
  compare_total_revenue:  13100000,
  compare_gross_profit:   3930000,
  compare_gross_profit_pct: 30.00,
  compare_ebitda:         2031000,
  compare_ebitda_pct:     15.50,
  compare_net_profit:     1376000,
  compare_net_profit_pct: 10.50,
  // Variance %
  revenue_variance_pct:    8.78,
  gross_profit_variance_pct: 13.55,
  ebitda_variance_pct:     13.61,
  net_profit_variance_pct: 9.78,
};

const MOCK_TREND = [
  { period_name: 'Jul-25', total_revenue: 10200000, gross_profit: 3162000,  ebitda: 1632000,  net_profit: 1071900  },
  { period_name: 'Aug-25', total_revenue: 10850000, gross_profit: 3364500,  ebitda: 1736000,  net_profit: 1138000  },
  { period_name: 'Sep-25', total_revenue: 11400000, gross_profit: 3534000,  ebitda: 1824000,  net_profit: 1197000  },
  { period_name: 'Oct-25', total_revenue: 12100000, gross_profit: 3751000,  ebitda: 1936000,  net_profit: 1271000  },
  { period_name: 'Nov-25', total_revenue: 12800000, gross_profit: 3968000,  ebitda: 2048000,  net_profit: 1344000  },
  { period_name: 'Dec-25', total_revenue: 13900000, gross_profit: 4309000,  ebitda: 2224000,  net_profit: 1460000  },
  { period_name: 'Jan-26', total_revenue: 12500000, gross_profit: 3875000,  ebitda: 2000000,  net_profit: 1313000  },
  { period_name: 'Feb-26', total_revenue: 13100000, gross_profit: 3930000,  ebitda: 2031000,  net_profit: 1376000  },
  { period_name: 'Mar-26', total_revenue: 13500000, gross_profit: 4185000,  ebitda: 2160000,  net_profit: 1418000  },
  { period_name: 'Apr-26', total_revenue: 14100000, gross_profit: 4371000,  ebitda: 2256000,  net_profit: 1494000  },
  { period_name: 'May-26', total_revenue: 13800000, gross_profit: 4278000,  ebitda: 2208000,  net_profit: 1463000  },
  { period_name: 'Jun-26', total_revenue: 14250000, gross_profit: 4462500,  ebitda: 2307500,  net_profit: 1510650  },
];

const MOCK_COMPARISON = [
  {
    metric:       'Revenue',
    current:      14250000,
    compare:      13100000,
    prior_year:   11800000,
  },
  {
    metric:       'Gross Profit',
    current:      4462500,
    compare:      3930000,
    prior_year:   3304000,
  },
  {
    metric:       'EBITDA',
    current:      2307500,
    compare:      2031000,
    prior_year:   1770000,
  },
  {
    metric:       'Net Profit',
    current:      1510650,
    compare:      1376000,
    prior_year:   1180000,
  },
];

const MOCK_EXPENSE_BREAKDOWN = {
  total_expenses: 2480000,
  items: [
    { name: 'Personnel Expenses',              amount: 868000,  pct: 35.00 },
    { name: 'General & Administrative',         amount: 496000,  pct: 20.00 },
    { name: 'Sales & Distribution',             amount: 347200,  pct: 14.00 },
    { name: 'Rent, Utilities & Office',          amount: 322400,  pct: 13.00 },
    { name: 'Depreciation',                     amount: 247680,  pct: 9.99  },
    { name: 'Finance Cost',                     amount: 198720,  pct: 8.01  },
  ],
};

// P&L Statement – each row has: label, current, compare, var_value, var_pct, ytd_current, ytd_prev, ytd_var_pct
// Positive var_value / var_pct = Green; Negative = Red
const MOCK_STATEMENT = {
  income: [
    { label: 'Revenue from Sales of Goods & Services', current: 13800000, compare: 12700000, var_value:  1100000, var_pct:  8.66,  ytd_current: 153600000, ytd_prev: 140200000, ytd_var_pct:  9.56 },
    { label: 'Rental Income',                           current:   300000, compare:   270000, var_value:    30000, var_pct: 11.11,  ytd_current:   3200000, ytd_prev:   2900000, ytd_var_pct: 10.34 },
    { label: 'Other Revenue',                           current:   150000, compare:   130000, var_value:    20000, var_pct: 15.38,  ytd_current:   1600000, ytd_prev:   1400000, ytd_var_pct: 14.29 },
    { label: 'Total Revenue',                           current: 14250000, compare: 13100000, var_value:  1150000, var_pct:  8.78,  ytd_current: 158400000, ytd_prev: 144500000, ytd_var_pct:  9.62, isTotal: true },
  ],
  cost_of_sales: [
    { label: 'Cost of Material',                        current:  6600000, compare:  6100000, var_value:   500000, var_pct:  8.20,  ytd_current:  73200000, ytd_prev:  67800000, ytd_var_pct:  7.96 },
    { label: 'Direct Labour',                           current:  1200000, compare:  1100000, var_value:   100000, var_pct:  9.09,  ytd_current:  13200000, ytd_prev:  11900000, ytd_var_pct: 10.92 },
    { label: 'Manufacturing / Direct Overheads',        current:   850000, compare:   790000, var_value:    60000, var_pct:  7.59,  ytd_current:   9350000, ytd_prev:   8500000, ytd_var_pct: 10.00 },
    { label: 'Manufacturing Overhead Absorption',       current:  -250000, compare:  -225000, var_value:   -25000, var_pct: -11.11, ytd_current:  -2750000, ytd_prev:  -2500000, ytd_var_pct: -10.00 },
    { label: 'Direct Expenses RKME',                    current:  1387500, compare:  1285000, var_value:   102500, var_pct:  7.98,  ytd_current:  15312500, ytd_prev:  13900000, ytd_var_pct: 10.16 },
    { label: 'Cost of Sales',                           current:  9787500, compare:  9050000, var_value:   737500, var_pct:  8.15,  ytd_current: 108312500, ytd_prev:  99600000, ytd_var_pct:  8.75, isTotal: true },
    { label: 'Gross Profit',                            current:  4462500, compare:  4050000, var_value:   412500, var_pct: 10.19,  ytd_current:  50087500, ytd_prev:  44900000, ytd_var_pct: 11.55, isGrossProfit: true },
    { label: 'Gross Profit %',                          current:    31.31, compare:    30.92, var_value:      0.39,var_pct: null,   ytd_current:     31.62, ytd_prev:     31.08, ytd_var_pct: null, isPct: true },
  ],
  expenses: [
    { label: 'Personnel Expenses',                      current:   868000, compare:   802000, var_value:    66000, var_pct:  8.23,  ytd_current:   9568000, ytd_prev:   8700000, ytd_var_pct:  9.98 },
    { label: 'General Administrative Expenses',         current:   496000, compare:   458000, var_value:    38000, var_pct:  8.30,  ytd_current:   5466000, ytd_prev:   5000000, ytd_var_pct:  9.32 },
    { label: 'Sales & Distribution Expenses',           current:   347200, compare:   320000, var_value:    27200, var_pct:  8.50,  ytd_current:   3822400, ytd_prev:   3450000, ytd_var_pct: 10.79 },
    { label: 'Rent, Utilities & Office Expenses',       current:   322400, compare:   298000, var_value:    24400, var_pct:  8.19,  ytd_current:   3554400, ytd_prev:   3200000, ytd_var_pct: 11.08 },
    { label: 'Depreciation',                            current:   247680, compare:   228000, var_value:    19680, var_pct:  8.63,  ytd_current:   2724480, ytd_prev:   2500000, ytd_var_pct:  8.98 },
    { label: 'Finance Cost',                            current:   198720, compare:   184000, var_value:    14720, var_pct:  7.99,  ytd_current:   2187040, ytd_prev:   1975000, ytd_var_pct: 10.74 },
    { label: 'Total Expenses',                          current:  2480000, compare:  2290000, var_value:   190000, var_pct:  8.30,  ytd_current:  27322320, ytd_prev:  24825000, ytd_var_pct: 10.06, isTotal: true },
    { label: 'EBITDA',                                  current:  2307500, compare:  2031000, var_value:   276500, var_pct: 13.61,  ytd_current:  26258180, ytd_prev:  23112500, ytd_var_pct: 13.61, isEbitda: true },
    { label: 'EBITDA %',                                current:    16.19, compare:    15.50, var_value:      0.69,var_pct: null,   ytd_current:     16.59, ytd_prev:     15.99, ytd_var_pct: null, isPct: true },
  ],
  bottom: [
    { label: 'Profit Before Tax',                       current:  1865000, compare:  1720000, var_value:   145000, var_pct:  8.43,  ytd_current:  20558000, ytd_prev:  18700000, ytd_var_pct:  9.93 },
    { label: 'Tax Expense',                             current:   354350, compare:   326800, var_value:    27550, var_pct:  8.43,  ytd_current:   3906020, ytd_prev:   3553000, ytd_var_pct:  9.93 },
    { label: 'Net Profit',                              current:  1510650, compare:  1376000, var_value:   134650, var_pct:  9.78,  ytd_current:  16651980, ytd_prev:  15147000, ytd_var_pct:  9.94, isNetProfit: true },
  ],
};

/* ── Mock router ────────────────────────────────────────────────── */
function getMockDataForPath(path, params = {}) {
  if (path.includes('/filters'))           return MOCK_FILTERS;
  if (path.includes('/summary'))           return MOCK_SUMMARY;
  if (path.includes('/trend')) {
    if (params.period_name) {
      const idx = MOCK_TREND.findIndex(m => m.period_name === params.period_name);
      if (idx !== -1) {
        return MOCK_TREND.slice(Math.max(0, idx - 8), idx + 1);
      }
    }
    return MOCK_TREND;
  }
  if (path.includes('/comparison'))        return MOCK_COMPARISON;
  if (path.includes('/expense-breakdown')) return MOCK_EXPENSE_BREAKDOWN;
  if (path.includes('/statement'))         return MOCK_STATEMENT;
  return {};
}

/* ══════════════════════════════════════════════════════════════════
   CORE FETCH WRAPPER
══════════════════════════════════════════════════════════════════ */

const apiCache = new Map();

/**
 * Central request handler — identical pattern to salesRevenueApi.js
 * @param {string} path    e.g. '/api/pl/summary'
 * @param {object} params  query-string key/value pairs (filters)
 * @returns {Promise<any>} parsed JSON response
 */
async function apiCall(path, params = {}) {
  const token = localStorage.getItem('finsight_token');

  // Demo mode fallback — no token present
  if (!token) {
    console.warn(`[plApi] Token missing. Returning mock fallback for: ${path}`);
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockDataForPath(path, params)), 300);
    });
  }

  const urlParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === 'All' || v === 'all' || v === '') continue;
    if (Array.isArray(v)) {
      if (v.length === 0 || (v.length === 1 && (v[0] === 'All' || v[0] === 'all'))) continue;
      v.forEach(item => {
        if (item !== 'All' && item !== 'all') urlParams.append(k, item);
      });
    } else {
      urlParams.append(k, v);
    }
  }
  const qs = urlParams.toString();

  const url = `${API_BASE}${path}${qs ? `?${qs}` : ''}`;

  // Dedup concurrent identical requests (React Strict Mode double-renders)
  if (apiCache.has(url)) return apiCache.get(url);

  const fetchPromise = (async () => {
    let res;
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
    } catch (networkErr) {
      const err = { status: 0, message: `Network error: ${networkErr.message}` };
      console.error('[plApi] Network error on', url, networkErr);
      throw err;
    }

    if (!res.ok) {
      if (res.status === 401) {
        console.warn('[plApi] 401 Unauthorized. Clearing token → mock fallback.');
        localStorage.removeItem('finsight_token');
        return getMockDataForPath(path, params);
      }

      if (res.status >= 500) {
        console.warn(`[plApi] ${res.status} server error on ${url} → mock fallback.`);
        return getMockDataForPath(path, params);
      }

      const rawBody = await res.text().catch(() => '');
      let body = {};
      try { body = JSON.parse(rawBody); } catch { /* non-JSON */ }

      let message = body?.error?.message || body?.message;
      if (!message && body?.detail) {
        message = typeof body.detail === 'string' ? body.detail : Array.isArray(body.detail) ? body.detail.map(d => typeof d === 'object' ? (d.msg || JSON.stringify(d)) : String(d)).join(', ') : JSON.stringify(body.detail);
      }
      if (!message && body?.error && typeof body.error === 'string') message = body.error;
      if (!message) message = rawBody.slice(0, 120) || res.statusText || 'Error occurred';

      console.error(`[plApi] ${res.status} on ${url}\nBody:`, rawBody.slice(0, 500));
      throw { status: res.status, message: String(message), rawBody: rawBody.slice(0, 300) };
    }

    let json = await res.json();
    
    // The backend returns values as formatted strings (e.g. "2,568,396,862") 
    // which breaks Recharts BarChart and local formatting. We must deep clean them.
    json = cleanNumbers(json);

    // Normalize: if backend returns a direct array, wrap it
    if (Array.isArray(json)) return { data: json };

    return json;
  })();

  apiCache.set(url, fetchPromise);
  setTimeout(() => apiCache.delete(url), 500);

  return fetchPromise;
}

/**
 * Deep walks API responses and converts formatted string numbers (e.g. "1,234,567.89")
 * into pure JS Numbers. This fixes Recharts BarCharts rejecting NaN and dropping bars.
 */
function cleanNumbers(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanNumbers);
  } else if (obj !== null && typeof obj === 'object') {
    const cleaned = {};
    for (const [k, v] of Object.entries(obj)) {
      cleaned[k] = cleanNumbers(v);
    }
    return cleaned;
  } else if (typeof obj === 'string') {
    // Match anything that looks like a number with commas, e.g. "-1,234,567.89" or "45.0"
    if (/^-?[\d,]+(\.\d+)?$/.test(obj)) {
      const stripped = obj.replace(/,/g, '');
      if (stripped.length > 0 && stripped !== '-') {
        const parsed = Number(stripped);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return obj;
  }
  return obj;
}

/* ══════════════════════════════════════════════════════════════════
   FILTER PARAMS BUILDER
══════════════════════════════════════════════════════════════════ */

/**
 * Map frontend camelCase filter state → backend snake_case query params.
 * Only includes non-empty / non-"All" values.
 */
function buildPLParams(filters = {}) {
  const active = (val) => {
    if (!val) return undefined;
    const actualVal = Array.isArray(val) ? val[0] : val;
    if (
      actualVal === undefined ||
      actualVal === null ||
      actualVal === '' ||
      actualVal === 'All' ||
      actualVal === 'all'
    ) {
      return undefined;
    }
    return actualVal;
  };

  const activeIds = (arr) => {
    if (!arr || !Array.isArray(arr)) return undefined;
    const ids = arr
      .filter(v => v !== 'All' && v !== 'all' && v !== '' && v != null)
      .map(v => (typeof v === 'number' ? v : parseInt(v, 10)))
      .filter(v => !isNaN(v));
    return ids.length > 0 ? ids : undefined;
  };

  const activeStrings = (arr) => {
    if (!arr || !Array.isArray(arr)) {
      if (arr === 'All' || !arr) return undefined;
      return [arr];
    }
    const strs = arr.filter(v => v !== 'All' && v !== 'all' && v !== '' && v != null);
    return strs.length > 0 ? strs : undefined;
  };

  return {
    legal_group_id:     activeIds(filters.legalGroupId),
    legal_entity_id:    activeIds(filters.legalEntityId),
    parent_division_id: activeIds(filters.parentDivisionId),
    subdivision_id:     activeIds(filters.subdivisionId),
    period_name:         filters.periodName || undefined,
    compare_period_name: filters.comparePeriodName || undefined,
    currency:            active(filters.currency),
  };
}

/* ══════════════════════════════════════════════════════════════════
   EXPORT HELPER
══════════════════════════════════════════════════════════════════ */

/**
 * Trigger a file download for P&L export.
 * @param {'excel'|'pdf'} format
 * @param {object} filters — current applied filters
 */
export function exportPL(format, filters = {}) {
  const token = localStorage.getItem('finsight_token');

  const params = {
    ...buildPLParams(filters),
    format,
  };

  const urlParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === 'All' || v === 'all' || v === '') continue;
    if (Array.isArray(v)) {
      if (v.length === 0 || (v.length === 1 && (v[0] === 'All' || v[0] === 'all'))) continue;
      v.forEach(item => {
        if (item !== 'All' && item !== 'all') urlParams.append(k, item);
      });
    } else {
      urlParams.append(k, v);
    }
  }
  const qs = urlParams.toString();

  const url = `${API_BASE}/api/pl/export${qs ? `?${qs}` : ''}`;

  const a = document.createElement('a');
  a.href = url;
  if (token) {
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error(`Export failed: ${res.status} ${res.statusText}`);
        return res.blob();
      })
      .then(blob => {
        const _url = window.URL.createObjectURL(blob);
        const _a = document.createElement('a');
        _a.href = _url;
        _a.download = `PL_Export_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(_a);
        _a.click();
        _a.remove();
        window.URL.revokeObjectURL(_url);
      });
  } else {
    // Demo fallback
    a.download = `PL_Export_Mock.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return Promise.resolve();
  }
}

/* ══════════════════════════════════════════════════════════════════
   PUBLIC API FUNCTIONS
══════════════════════════════════════════════════════════════════ */

/**
 * GET /api/pl/filters
 * Cascading filter options. Pass partial filters to narrow downstream dropdowns.
 *
 * @param {object} params  Optional: { legal_group, legal_entity, parent_division }
 * @returns {{ legal_groups, legal_entities, parent_divisions, subdivisions, periods }}
 */
export async function fetchPLFilters(filters = {}) {
  const token = localStorage.getItem('finsight_token');
  if (!token) return Promise.resolve({ legalGroups: [], legalEntities: [], parentDivisions: [], subdivisions: [], periods: [], comparePeriods: [] });

  const apiParams = {
    ...buildPLParams(filters),
    // override period names to undefined for filter fetching if needed,
    // though usually they don't impact hierarchy.
  };

  const raw = await apiCall('/api/pl/filter-options', apiParams);
  const unwrap = (r) => (r && typeof r === 'object' && !Array.isArray(r) && (r.legal_entities !== undefined ? r : (r.data || r.result || r))) || r;
  const res = unwrap(raw) || {};

  const normalizeIdName = (list) => {
    if (!Array.isArray(list)) return [];
    const mapped = list.map((e, i) => {
      if (typeof e === 'object' && e !== null) {
        return {
          id: String(e.value !== undefined ? e.value : (e.id !== undefined ? e.id : String(i))),
          name: String(e.label !== undefined ? e.label : (e.name !== undefined ? e.name : String(e)))
        };
      }
      return { id: String(e), name: String(e) };
    });
    
    // Filter out the backend's dummy 'All' options (often value -1 or label 'All')
    return mapped.filter(item => item.name.toLowerCase() !== 'all' && item.id !== '-1');
  };

  return {
    legalGroups:     normalizeIdName(res.legal_groups),
    legalEntities:   normalizeIdName(res.legal_entities),
    parentDivisions: normalizeIdName(res.parent_divisions),
    subdivisions:    normalizeIdName(res.subdivisions),
    periods:         res.periods || [],
    comparePeriods:  res.compare_periods || [],
  };
}

/**
 * GET /api/pl/summary
 * KPI card data.
 *
 * @param {object} filters  Applied filter state
 * @returns {{ total_revenue, cost_of_sales, gross_profit, gross_profit_pct,
 *             other_income, operating_expenses, ebitda, ebitda_pct,
 *             pbt, tax_expense, net_profit, net_profit_pct, … compare_* }}
 */
export async function fetchPLSummary(filters) {
  return apiCall('/api/pl/summary', buildPLParams(filters));
}

/**
 * GET /api/pl/trend
 * Line chart data — monthly P&L trend.
 *
 * @param {object} filters
 * @returns {Array<{ period_name, total_revenue, gross_profit, ebitda, net_profit }>}
 */
export async function fetchPLTrend(filters) {
  const data = await apiCall('/api/pl/trend', buildPLParams(filters));
  // Normalize: backend may return array directly or wrapped in .data
  return Array.isArray(data) ? data : (data?.data || []);
}

/**
 * GET /api/pl/comparison
 * Bar chart data — selected vs compare vs prior year.
 *
 * @param {object} filters
 * @returns {Array<{ metric, current, compare, prior_year }>}
 */
export async function fetchPLComparison(filters) {
  const data = await apiCall('/api/pl/comparison', buildPLParams(filters));
  const arr = Array.isArray(data) ? data : (data?.data || []);
  
  // Normalize live backend properties to match our internal expected keys
  return arr.map(item => {
    const current = item.current ?? item.current_period ?? item.current_value ?? item.currentPeriod ?? item['Current Period'] ?? 0;
    const compare = item.compare ?? item.compare_period ?? item.compare_value ?? item.comparePeriod ?? item['Compare Period'] ?? 0;
    const prior   = item.prior_year ?? item.priorYear ?? item.prior_year_value ?? item['Prior Year'] ?? 0;
    return {
      ...item,
      metric: item.metric || item.Metric || '',
      current,
      compare,
      prior_year: prior,
    };
  });
}

/**
 * GET /api/pl/expense-breakdown
 * Donut chart data — expense category breakdown.
 *
 * @param {object} filters
 * @returns {{ total_expenses, items: Array<{ name, amount, pct }> }}
 */
export async function fetchPLExpenseBreakdown(filters) {
  const data = await apiCall('/api/pl/expense-breakdown', buildPLParams(filters));
  
  // Extract items array whether it's { items: [] }, { data: [] }, or just []
  const rawItems = data?.items || (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
  
  // Normalize item properties
  const items = rawItems.map(item => {
    const amount = Number(item.amount ?? item.value ?? item.Amount ?? 0);
    return {
      ...item,
      name: item.name || item.category || item.expense_category || item.label || item.Category || item.Name || 'Unknown',
      amount,
      pct: item.pct ?? item.percentage ?? item.Percentage ?? null
    };
  });

  // Calculate total if not provided explicitly
  const total_expenses = data?.total_expenses ?? items.reduce((sum, i) => sum + i.amount, 0);

  // If pct is missing from backend entirely, we calculate it dynamically
  items.forEach(item => {
    if (item.pct == null && total_expenses > 0) {
      item.pct = (item.amount / total_expenses) * 100;
    }
  });

  return { total_expenses, items };
}

/**
 * GET /api/pl/statement
 * Full P&L statement table rows.
 *
 * @param {object} filters
 * @returns {{ income, cost_of_sales, expenses, bottom }}
 *   Each section is an array of row objects:
 *   { label, current, compare, var_value, var_pct, ytd_current, ytd_prev, ytd_var_pct,
 *     isTotal?, isGrossProfit?, isEbitda?, isNetProfit?, isPct? }
 */
export async function fetchPLStatement(filters) {
  const res = await apiCall('/api/pl/statement', buildPLParams(filters));
  
  // If the response is already grouped (e.g. MOCK_STATEMENT fallback), return it directly
  if (res && res.income && Array.isArray(res.income)) {
    return res;
  }

  // Otherwise, assume it's a flat array from the live API that needs grouping
  const rawArray = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  
  const income = [];
  const cost_of_sales = [];
  const expenses = [];
  const bottom = [];

  rawArray.forEach(item => {
    const lbl = item.particulars || item.Particulars || item.name || item.label || '—';
    const row = {
      label: lbl,
      current: Number(item.amount ?? item.current_period ?? item.current ?? 0),
      compare: Number(item.compare_amount ?? item.compare_period ?? item.compare ?? 0),
      var_value: Number(item.variance_amount ?? item.variance ?? 0),
      var_pct: Number(item.variance_pct ?? 0),
      ytd_current: Number(item.ytd_amount ?? item.ytd ?? 0),
      ytd_prev: Number(item.ytd_compare ?? item.ytd_prev ?? 0),
      ytd_var_pct: Number(item.ytd_variance_pct ?? 0),
      isTotal: false,
      isGrossProfit: false,
      isEbitda: false,
      isNetProfit: false,
    };

    const lblLower = lbl.toLowerCase();
    if (lblLower.includes('total') || lblLower === 'gross profit' || lblLower === 'ebitda' || lblLower === 'net profit' || lblLower === 'pbt') {
      row.isTotal = true;
    }
    if (lblLower === 'gross profit') row.isGrossProfit = true;
    if (lblLower === 'ebitda') row.isEbitda = true;
    if (lblLower === 'net profit') row.isNetProfit = true;

    const sec = (item.section || '').toUpperCase();
    if (sec === 'INCOME') {
      income.push(row);
    } else if (sec === 'COST OF SALES') {
      cost_of_sales.push(row);
    } else if (sec === 'EXPENSES') {
      expenses.push(row);
    } else if (sec === 'PROFITABILITY') {
      if (lblLower === 'gross profit') {
        cost_of_sales.push(row); // Gross profit goes at the end of COGS
      } else {
        bottom.push(row); // EBITDA, PBT, Tax, Net Profit go in the bottom section
      }
    }
  });

  return { income, cost_of_sales, expenses, bottom };
}
