/**
 * Balance Sheet Report API Service
 * ──────────────────────────────────
 * Mirrors plApi.js patterns exactly:
 *  - JWT Bearer token from localStorage (key: finsight_token)
 *  - Demo-mode mock fallback (no token → rich mock data)
 *  - In-flight deduplication cache (500 ms window)
 *  - cleanNumbers() — converts formatted string numbers to JS Number
 *  - buildBSParams() — camelCase → snake_case param mapping
 *
 * Backend prefix: /api/bs
 * Base URL: VITE_API_BASE_URL env var (defaults to '' for Vite proxy)
 *
 * Endpoints consumed:
 *   GET  /api/bs/filters
 *   GET  /api/bs/summary
 *   GET  /api/bs/subdivision
 *   GET  /api/bs/trend
 *   GET  /api/bs/drilldown
 *   GET  /api/bs/reconciliation
 *   GET  /api/bs/summary/export
 *   GET  /api/bs/subdivision/export
 */

// Keep ?? (not ||) — empty string means relative paths (Vite proxy)
import { getApiBaseUrl } from '../utils/apiBase';
import { LEGAL_ENTITIES } from '../data/masterData';
const API_BASE = getApiBaseUrl();

/* ── Auth headers ─────────────────────────────────────────────────── */
function getAuthHeaders() {
  const token = localStorage.getItem('finsight_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ══════════════════════════════════════════════════════════════════════
   MOCK DATA  (used in demo mode — no JWT token present)
   Derived from bs_api_proposal.md example responses.
══════════════════════════════════════════════════════════════════════ */

const MOCK_FILTERS = {
  periods:         ['2026-06', '2026-05', '2026-04', '2026-03', '2026-02', '2026-01', '2025-12', '2025-11'],
  currencies:      ['AED', 'USD', 'SAR', 'QAR', 'OMR'],
  legal_entities:  [{ id: 1, name: 'FJ HQ' }, { id: 2, name: 'FJ Care UAE' }, { id: 3, name: 'Flowtech Qatar' }],
  ledgers:         ['UAE_PRIMARY_LEDGER', 'QTR_PRIMARY_LEDGER', 'OMN_PRIMARY_LEDGER'],
  sections:        ['SOURCES OF FUNDS', 'APPLICATION OF FUNDS'],
  sub_sections:    ['A. EQUITY', 'B. NON-CURRENT LIABILITIES', 'C. CURRENT LIABILITIES', 'D. NON-CURRENT ASSETS', 'E. CURRENT ASSETS'],
};

const MOCK_SUMMARY = {
  period:          '2026-06',
  period_name:     'June 2026',
  fiscal_year:     2026,
  fiscal_quarter:  2,
  currency:        'AED',
  report_date:     '2026-06-30',
  legal_entity:    null,
  ledger:          null,
  compare_period:  '2026-05',
  sections: [
    {
      section:        'SOURCES OF FUNDS',
      section_total:  -1605793444.21,
      compare_total:  -1547800000.00,
      variance:       -57993444.21,
      variance_pct:   3.75,
      sub_sections: [
        {
          sub_section:       'A. EQUITY',
          sub_total:         -603523099.37,
          compare_sub_total: -581200000.00,
          accounts: [
            { account_code: '930001', account_name: 'Share Capital',             display_order: 10,  balance_amount: -189000000.00, compare_amount: -189000000.00, variance:          0.00,       variance_pct:  0.00, dr_cr: 'CR', contributing_subdivisions: 63 },
            { account_code: '930005', account_name: 'General Reserve',           display_order: 50,  balance_amount: -231418099.37, compare_amount: -221500000.00, variance:  -9918099.37,       variance_pct:  4.48, dr_cr: 'CR', contributing_subdivisions: 45 },
            { account_code: '930010', account_name: 'Retained Earnings',         display_order: 80,  balance_amount: -183105000.00, compare_amount: -170700000.00, variance: -12405000.00,       variance_pct:  7.27, dr_cr: 'CR', contributing_subdivisions: 71 },
          ],
        },
        {
          sub_section:       'B. NON-CURRENT LIABILITIES',
          sub_total:         -273000000.00,
          compare_sub_total: -268500000.00,
          accounts: [
            { account_code: '920001', account_name: 'Long Term Borrowings',      display_order: 110, balance_amount: -200400000.00, compare_amount: -197200000.00, variance:  -3200000.00,       variance_pct:  1.62, dr_cr: 'CR', contributing_subdivisions: 28 },
            { account_code: '920004', account_name: 'Deferred Tax Liabilities',  display_order: 140, balance_amount:  -72600000.00, compare_amount:  -71300000.00, variance:  -1300000.00,       variance_pct:  1.82, dr_cr: 'CR', contributing_subdivisions: 22 },
          ],
        },
        {
          sub_section:       'C. CURRENT LIABILITIES',
          sub_total:         -729270344.84,
          compare_sub_total: -698100000.00,
          accounts: [
            { account_code: '920005', account_name: 'Trade Payables',            display_order: 180, balance_amount: -382654000.00, compare_amount: -365200000.00, variance: -17454000.00,       variance_pct:  4.78, dr_cr: 'CR', contributing_subdivisions: 58 },
            { account_code: '920007', account_name: 'Short Term Borrowings',     display_order: 190, balance_amount: -344346199.01, compare_amount: -330600000.00, variance: -13746199.01,       variance_pct:  4.16, dr_cr: 'CR', contributing_subdivisions: 47 },
            { account_code: '920008', account_name: 'Other Current Liabilities', display_order: 200, balance_amount:   -2270145.83, compare_amount:   -2300000.00, variance:     29854.17,       variance_pct: -1.30, dr_cr: 'CR', contributing_subdivisions: 71 },
          ],
        },
      ],
    },
    {
      section:        'APPLICATION OF FUNDS',
      section_total:  1823046523.41,
      compare_total:  1758200000.00,
      variance:         64846523.41,
      variance_pct:   3.69,
      sub_sections: [
        {
          sub_section:       'D. NON-CURRENT ASSETS',
          sub_total:          249900000.43,
          compare_sub_total:  246100000.00,
          accounts: [
            { account_code: '910001', account_name: 'Property Plant & Equipment',   display_order: 270, balance_amount: 194500000.00, compare_amount: 191800000.00, variance:  2700000.00, variance_pct:  1.41, dr_cr: 'DR', contributing_subdivisions: 52 },
            { account_code: '910003', account_name: 'Intangible Assets',            display_order: 290, balance_amount:  35200000.43, compare_amount:  34600000.00, variance:   600000.43, variance_pct:  1.73, dr_cr: 'DR', contributing_subdivisions: 18 },
            { account_code: '910005', account_name: 'Capital Work in Progress',     display_order: 310, balance_amount:  20200000.00, compare_amount:  19700000.00, variance:   500000.00, variance_pct:  2.54, dr_cr: 'DR', contributing_subdivisions: 14 },
          ],
        },
        {
          sub_section:       'E. CURRENT ASSETS',
          sub_total:         1573146522.98,
          compare_sub_total: 1512100000.00,
          accounts: [
            { account_code: '910009', account_name: 'Due from Related Parties', display_order: 350, balance_amount: 364852044.58, compare_amount: 350400000.00, variance:  14452044.58, variance_pct:  4.12, dr_cr: 'DR', contributing_subdivisions: 45 },
            { account_code: '910010', account_name: 'Trade Receivables',        display_order: 360, balance_amount: 419076934.09, compare_amount: 402300000.00, variance:  16776934.09, variance_pct:  4.17, dr_cr: 'DR', contributing_subdivisions: 71 },
            { account_code: '910011', account_name: 'Cash at Bank',             display_order: 370, balance_amount: 789617544.31, compare_amount: 759400000.00, variance:  30217544.31, variance_pct:  3.98, dr_cr: 'DR', contributing_subdivisions: 58 },
          ],
        },
      ],
    },
  ],
  grand_total:      217253079.20,
  balance_status:   'BALANCED',
  balance_variance: 0,
};

const MOCK_SUBDIVISION = {
  period:   '2026-06',
  currency: 'AED',
  filters:  { section: null, sub_section: null, account_code: null, ledger: null },
  pagination: { page: 1, page_size: 25, total_subdivisions: 77, total_pages: 4, has_next: true, has_prev: false },
  data: [
    { sub_division_id: 3,  sub_division_code: '4021', sub_division_name: 'Alpha Ducts',        section_totals: { 'SOURCES OF FUNDS': -4521000.00, 'APPLICATION OF FUNDS': 4748000.00 }, grand_total: 227000.00 },
    { sub_division_id: 11, sub_division_code: '4033', sub_division_name: 'Busbar',              section_totals: { 'SOURCES OF FUNDS': -8200000.00, 'APPLICATION OF FUNDS': 9100000.00 }, grand_total: 900000.00 },
    { sub_division_id: 22, sub_division_code: '4055', sub_division_name: 'Cooling Tower',       section_totals: { 'SOURCES OF FUNDS': -6350000.00, 'APPLICATION OF FUNDS': 6700000.00 }, grand_total: 350000.00 },
    { sub_division_id: 35, sub_division_code: '4068', sub_division_name: 'Electro Mechanical',  section_totals: { 'SOURCES OF FUNDS': -12400000.00, 'APPLICATION OF FUNDS': 13200000.00 }, grand_total: 800000.00 },
    { sub_division_id: 47, sub_division_code: '4082', sub_division_name: 'FJ Care Services',    section_totals: { 'SOURCES OF FUNDS': -9750000.00, 'APPLICATION OF FUNDS': 10500000.00 }, grand_total: 750000.00 },
    { sub_division_id: 51, sub_division_code: '4091', sub_division_name: 'Flowtech Oil & Gas',  section_totals: { 'SOURCES OF FUNDS': -18900000.00, 'APPLICATION OF FUNDS': 20100000.00 }, grand_total: 1200000.00 },
    { sub_division_id: 58, sub_division_code: '4097', sub_division_name: 'Gulf Trading Co.',    section_totals: { 'SOURCES OF FUNDS': -7800000.00, 'APPLICATION OF FUNDS': 8250000.00 }, grand_total: 450000.00 },
    { sub_division_id: 63, sub_division_code: '4101', sub_division_name: 'HQ Operations',       section_totals: { 'SOURCES OF FUNDS': -54000000.00, 'APPLICATION OF FUNDS': 56800000.00 }, grand_total: 2800000.00 },
  ],
};

const MOCK_TREND = {
  currency:           'AED',
  account_code:       null,
  account_name:       null,
  section:            'APPLICATION OF FUNDS',
  sub_section:        null,
  sub_division_code:  null,
  sub_division_name:  null,
  granularity:        'monthly',
  from_period:        '2026-01',
  to_period:          '2026-06',
  series: [
    { period: '2026-01', period_name: 'January 2026',  fiscal_year: 2026, fiscal_quarter: 1, balance_amount: 1520000000.00, mom_change: null,       mom_pct: null  },
    { period: '2026-02', period_name: 'February 2026', fiscal_year: 2026, fiscal_quarter: 1, balance_amount: 1574300000.00, mom_change: 54300000.00, mom_pct: 3.57  },
    { period: '2026-03', period_name: 'March 2026',    fiscal_year: 2026, fiscal_quarter: 1, balance_amount: 1638900000.00, mom_change: 64600000.00, mom_pct: 4.10  },
    { period: '2026-04', period_name: 'April 2026',    fiscal_year: 2026, fiscal_quarter: 2, balance_amount: 1692400000.00, mom_change: 53500000.00, mom_pct: 3.26  },
    { period: '2026-05', period_name: 'May 2026',      fiscal_year: 2026, fiscal_quarter: 2, balance_amount: 1758200000.00, mom_change: 65800000.00, mom_pct: 3.89  },
    { period: '2026-06', period_name: 'June 2026',     fiscal_year: 2026, fiscal_quarter: 2, balance_amount: 1823046523.41, mom_change: 64846523.41, mom_pct: 3.69  },
  ],
  summary: {
    total_periods:    6,
    min_period:       '2026-01',
    max_period:       '2026-06',
    min_balance:      1520000000.00,
    max_balance:      1823046523.41,
    opening_balance:  1520000000.00,
    closing_balance:  1823046523.41,
    period_change:    303046523.41,
    period_pct:       19.94,
  },
};

const MOCK_DRILLDOWN = {
  period:               '2026-06',
  period_name:          'June 2026',
  account_code:         '910011',
  account_name:         'Cash at Bank',
  section:              'APPLICATION OF FUNDS',
  sub_section:          'E. CURRENT ASSETS',
  display_order:        370,
  currency:             'AED',
  ledger:               null,
  consolidated_balance: 789617544.31,
  pagination: { page: 1, page_size: 100, total_subdivisions: 12, total_pages: 1, has_next: false, has_prev: false },
  data: [
    { sub_division_id: 63, sub_division_code: '4101', sub_division_name: 'HQ Operations',      ledger_code: 'UAE_PRIMARY_LEDGER', balance_amount: 185400000.00, dr_cr: 'DR', pct_of_total: 23.48, abs_pct_of_total: 23.48 },
    { sub_division_id: 51, sub_division_code: '4091', sub_division_name: 'Flowtech Oil & Gas', ledger_code: 'UAE_PRIMARY_LEDGER', balance_amount: 142700000.00, dr_cr: 'DR', pct_of_total: 18.07, abs_pct_of_total: 18.07 },
    { sub_division_id: 22, sub_division_code: '4055', sub_division_name: 'Cooling Tower',      ledger_code: 'UAE_PRIMARY_LEDGER', balance_amount: 112300000.00, dr_cr: 'DR', pct_of_total: 14.22, abs_pct_of_total: 14.22 },
    { sub_division_id: 35, sub_division_code: '4068', sub_division_name: 'Electro Mechanical', ledger_code: 'UAE_PRIMARY_LEDGER', balance_amount: 98500000.00,  dr_cr: 'DR', pct_of_total: 12.47, abs_pct_of_total: 12.47 },
    { sub_division_id: 47, sub_division_code: '4082', sub_division_name: 'FJ Care Services',   ledger_code: 'UAE_PRIMARY_LEDGER', balance_amount: 76400000.00,  dr_cr: 'DR', pct_of_total: 9.68,  abs_pct_of_total: 9.68  },
    { sub_division_id: 58, sub_division_code: '4097', sub_division_name: 'Gulf Trading Co.',   ledger_code: 'UAE_PRIMARY_LEDGER', balance_amount: 62100000.00,  dr_cr: 'DR', pct_of_total: 7.87,  abs_pct_of_total: 7.87  },
    { sub_division_id: 11, sub_division_code: '4033', sub_division_name: 'Busbar',             ledger_code: 'UAE_PRIMARY_LEDGER', balance_amount: 54800000.00,  dr_cr: 'DR', pct_of_total: 6.94,  abs_pct_of_total: 6.94  },
    { sub_division_id: 3,  sub_division_code: '4021', sub_division_name: 'Alpha Ducts',        ledger_code: 'UAE_PRIMARY_LEDGER', balance_amount: 41200000.00,  dr_cr: 'DR', pct_of_total: 5.22,  abs_pct_of_total: 5.22  },
    { sub_division_id: 71, sub_division_code: '4115', sub_division_name: 'KSA Engineering',    ledger_code: 'KSA_PRIMARY_LEDGER', balance_amount: 16217544.31,  dr_cr: 'DR', pct_of_total: 2.05,  abs_pct_of_total: 2.05  },
  ],
};

const MOCK_RECONCILIATION = [
  { period: '2026-06', period_name: 'June 2026',     currency: 'AED', sources_total: -1605793444.21, applications_total: 1823046523.41, net_variance: 217253079.20, balance_status: 'UNBALANCED' },
  { period: '2026-05', period_name: 'May 2026',       currency: 'AED', sources_total: -1541000000.00, applications_total: 1541000050.00, net_variance: 50.00,          balance_status: 'BALANCED'   },
  { period: '2026-04', period_name: 'April 2026',     currency: 'AED', sources_total: -1488200000.00, applications_total: 1488200000.00, net_variance: 0.00,           balance_status: 'BALANCED'   },
  { period: '2026-03', period_name: 'March 2026',     currency: 'AED', sources_total: -1430500000.00, applications_total: 1430500000.00, net_variance: 0.00,           balance_status: 'BALANCED'   },
  { period: '2026-02', period_name: 'February 2026',  currency: 'AED', sources_total: -1375800000.00, applications_total: 1375800000.00, net_variance: 0.00,           balance_status: 'BALANCED'   },
  { period: '2026-01', period_name: 'January 2026',   currency: 'AED', sources_total: -1320000000.00, applications_total: 1320000000.00, net_variance: 0.00,           balance_status: 'BALANCED'   },
];

/* ── Mock router ──────────────────────────────────────────────────── */
function getMockDataForPath(path) {
  if (path.includes('/filters'))         return MOCK_FILTERS;
  if (path.includes('/summary'))         return { status: 'ok', data: MOCK_SUMMARY };
  if (path.includes('/subdivision'))     return { status: 'ok', data: MOCK_SUBDIVISION };
  if (path.includes('/trend'))           return { status: 'ok', data: MOCK_TREND };
  if (path.includes('/drilldown'))       return { status: 'ok', data: MOCK_DRILLDOWN };
  if (path.includes('/reconciliation'))  return { status: 'ok', data: MOCK_RECONCILIATION };
  return {};
}

/* ══════════════════════════════════════════════════════════════════════
   CORE FETCH WRAPPER
══════════════════════════════════════════════════════════════════════ */

const apiCache = new Map();

/**
 * FIX C4: When the backend is unavailable (5xx / network error / no token),
 * the service silently falls back to demo data.  This function dispatches a
 * browser CustomEvent so any UI component can surface a visible warning.
 *
 * BalanceSheet.jsx listens for 'bsFallbackActive' and shows a banner.
 */
function notifyFallback(reason) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bsFallbackActive', { detail: { reason } }));
  }
}

/**
 * Central GET request handler — mirrors plApi.js exactly.
 * @param {string} path   e.g. '/api/bs/summary'
 * @param {object} params  query-string key/value pairs
 * @returns {Promise<any>} parsed JSON response
 */
async function apiCall(path, params = {}) {
  const token = localStorage.getItem('finsight_token');

  // Demo mode — no token present
  if (!token) {
    if (import.meta.env.DEV)
      console.warn(`[bsApi] Token missing. Returning mock fallback for: ${path}`);
    notifyFallback('no-token');
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockDataForPath(path)), 300);
    });
  }

  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null && v !== 'All')
  ).toString();

  const url = `${API_BASE}${path}${qs ? `?${qs}` : ''}`;

  // Dedup concurrent identical requests (React Strict Mode double-renders)
  // Log AFTER the cache check so the 2nd StrictMode call never emits a log line.
  if (apiCache.has(url)) return apiCache.get(url);
  if (import.meta.env.DEV) console.log('[bsApi] Request:', url);

  const fetchPromise = (async () => {
    let res;
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
    } catch (networkErr) {
      // FIX C4 (network path): Remote server unreachable → fall back to demo data gracefully.
      if (import.meta.env.DEV)
        console.warn('[bsApi] Network error → mock fallback:', networkErr.message);
      notifyFallback('network-error');
      return getMockDataForPath(path);
    }

    if (!res.ok) {
      if (res.status === 401) {
        if (import.meta.env.DEV)
          console.warn('[bsApi] 401 — clearing token, using mock fallback.');
        localStorage.removeItem('finsight_token');
        return getMockDataForPath(path);
      }

      // 5xx — backend erroring. Fall back to demo data and notify the UI banner.
      if (res.status >= 500) {
        if (import.meta.env.DEV)
          console.warn(`[bsApi] ${res.status} on ${path} — falling back to mock data.`);
        notifyFallback(`server-${res.status}`);
        return getMockDataForPath(path);
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

      console.error(`[bsApi] ${res.status} on ${url}\nBody:`, rawBody.slice(0, 500));
      throw { status: res.status, message: String(message), rawBody: rawBody.slice(0, 300) };
    }

    let json = await res.json();

    // Deep-clean formatted string numbers (e.g. "1,234,567.89" → 1234567.89)
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
 * Deep walks API responses and converts formatted string numbers into pure JS
 * Numbers. Fixes Recharts rejecting NaN and dropping chart bars/lines.
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

/* ══════════════════════════════════════════════════════════════════════
   FILTER PARAMS BUILDER
══════════════════════════════════════════════════════════════════════ */

/**
 * Map frontend camelCase filter state → backend snake_case query params.
 * Only includes non-empty / non-'All' values.
 */
function buildBSParams(filters = {}) {
  const active = (val) =>
    val && val !== 'All' && val !== 'all' ? val : undefined;

  let leId = undefined;
  if (filters.legalEntityId && filters.legalEntityId !== 'All' && filters.legalEntityId !== '') {
    const num = Number(filters.legalEntityId);
    if (!isNaN(num) && num > 0) {
      leId = num;
    }
  }

  return {
    period:          active(filters.period),
    compare_period:  active(filters.comparePeriod),
    currency:        active(filters.currency),
    legal_entity_id: leId,
    ledger:          active(filters.ledger),
    section:         active(filters.section),
    sub_section:     active(filters.subSection),
    account_code:    active(filters.accountCode),
  };
}

/* ══════════════════════════════════════════════════════════════════════
   EXPORT HELPER
══════════════════════════════════════════════════════════════════════ */

/**
 * Trigger a file download for Balance Sheet export.
 * @param {'excel'|'pdf'} format
 * @param {'summary'|'subdivision'} section  Which export endpoint to call
 * @param {object} filters — current applied filters
 * @returns {Promise<void>}
 */
export function exportBS(format = 'excel', section = 'summary', filters = {}) {
  const token = localStorage.getItem('finsight_token');
  const base  = buildBSParams(filters);
  const params = { ...base, format };

  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  ).toString();

  const endpoint = section === 'subdivision' ? '/api/bs/subdivision/export' : '/api/bs/summary/export';
  const url = `${API_BASE}${endpoint}${qs ? `?${qs}` : ''}`;
  const ext = format === 'excel' ? 'xlsx' : 'pdf';
  const filename = `bs_${section}_export.${ext}`;

  if (token) {
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error(`Export failed: ${res.status} ${res.statusText}`);
        return res.blob();
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      });
  } else {
    // Demo mode — open URL directly (browser will handle download prompt)
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return Promise.resolve();
  }
}

/* ══════════════════════════════════════════════════════════════════════
   PUBLIC API FUNCTIONS
══════════════════════════════════════════════════════════════════════ */

/**
 * GET /api/bs/filters
 * Returns available filter options: periods, currencies, ledgers, legal_entities.
 *
 * @param {object} params  Optional: { analysis_code }
 * @returns {{ periods, currencies, legal_entities, ledgers, sections, sub_sections }}
 */
export async function fetchBSFilters(params = {}) {
  const apiParams = {};
  if (params.analysisCode) apiParams.analysis_code = params.analysisCode;

  const raw = await apiCall('/api/bs/filters', apiParams);
  // DEV-only: log raw filters response for debugging. Fires once per real request
  // (StrictMode double-invoke is deduped at the apiCall cache level).
  if (import.meta.env.DEV) console.log('[bsApi] fetchBSFilters raw:', raw);

  // Unwrap envelope if present
  const unwrap = (r) => {
    if (!r || typeof r !== 'object') return r;
    if (r.periods !== undefined)     return r;      // already unwrapped
    if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) return r.data;
    if (r.result && typeof r.result === 'object')  return r.result;
    return r;
  };

  const res = unwrap(raw) || {};
  let leList = res.legal_entities || [];
  if (!Array.isArray(leList)) leList = [];
  
  // Filter out any string/object whose value/name is 'All'
  const valid = leList
    .map(e => typeof e === 'string' ? { name: e } : e)
    .filter(e => e && e.name && e.name.toLowerCase() !== 'all' && e.id !== '' && e.id !== 'All');

  const map = new Map();
  const dbIds = new Set();

  // First, add all active database entities with their real database IDs
  valid.forEach(item => {
    const id = (item.id !== undefined && item.id !== '' && !isNaN(Number(item.id)))
      ? Number(item.id)
      : (item.name.toLowerCase() === 'fj group' ? 1 : 99);
    map.set(item.name.toLowerCase(), { id, name: item.name });
    dbIds.add(id);
  });

  // Second, add master entities that are NOT yet in the database, offset by +100 so their IDs never collide with database IDs (e.g. ID 1)
  LEGAL_ENTITIES.forEach(le => {
    if (!map.has(le.name.toLowerCase())) {
      const uniqueId = dbIds.has(le.id) ? (100 + Number(le.id)) : Number(le.id);
      map.set(le.name.toLowerCase(), { id: uniqueId, name: le.name });
      dbIds.add(uniqueId);
    }
  });

  res.legal_entities = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));

  return res;
}

/**
 * GET /api/bs/summary
 * Consolidated Balance Sheet for a single accounting period.
 * Hierarchical: section → sub_section → accounts.
 *
 * @param {object} filters  Applied filter state
 * @returns {{ period, period_name, currency, sections, grand_total, balance_status, balance_variance }}
 */
export async function fetchBSSummary(filters) {
  const res = await apiCall('/api/bs/summary', buildBSParams(filters));
  // Backend returns { status: 'ok', data: {...} } — unwrap .data
  return res?.data ?? res;
}

/**
 * GET /api/bs/subdivision
 * Per-subdivision balance sheet rows for a given period and currency.
 * Paginated, sortable, and filterable.
 *
 * @param {object} filters  Applied filter state
 * @param {object} pageOpts  Optional: { page, page_size, sort_by, sort_dir }
 * @returns {{ period, currency, pagination, data: [...] }}
 */
export async function fetchBSSubDivision(filters, pageOpts = {}) {
  const params = {
    ...buildBSParams(filters),
    page:      pageOpts.page      ?? 1,
    page_size: pageOpts.page_size ?? 50,
    sort_by:   pageOpts.sort_by   ?? 'sub_division_name',
    sort_dir:  pageOpts.sort_dir  ?? 'asc',
  };
  const res = await apiCall('/api/bs/subdivision', params);
  return res?.data ?? res;
}

/**
 * GET /api/bs/trend
 * Multi-period time series for a GL account or section.
 * At least one of account_code or section must be provided.
 *
 * @param {object} filters  Applied filter state (must include currency, section or accountCode)
 * @returns {{ currency, series: [...], summary: {...} }}
 */
export async function fetchBSTrend(filters) {
  const base = buildBSParams(filters);

  // Trend requires at least section or account_code — default to APPLICATION OF FUNDS
  if (!base.account_code && !base.section) {
    base.section = 'APPLICATION OF FUNDS';
  }

  const params = {
    currency:    base.currency,
    section:     base.section,
    account_code: base.account_code,
    sub_section:  base.sub_section,
    ledger:       base.ledger,
    from_period:  filters.fromPeriod || undefined,
    to_period:    base.period,         // use selected period as end
    granularity:  filters.granularity || 'monthly',
  };

  const res = await apiCall('/api/bs/trend', params);
  return res?.data ?? res;
}

/**
 * GET /api/bs/drilldown
 * All subdivisions contributing to one GL account for a given period.
 *
 * @param {object} filters  Must include: period, currency, accountCode
 * @returns {{ period, account_code, account_name, consolidated_balance, data: [...] }}
 */
export async function fetchBSDrilldown(filters) {
  const params = {
    period:       filters.period,
    currency:     filters.currency,
    account_code: filters.accountCode,
    ledger:       filters.ledger || undefined,
    sort_by:      filters.sortBy  || 'balance_amount',
    sort_dir:     filters.sortDir || 'desc',
  };
  const res = await apiCall('/api/bs/drilldown', params);
  const raw = res?.data ?? res;
  if (!raw || typeof raw !== 'object') return raw;

  // Normalise live-backend field names → frontend-expected names.
  // Backend (bs_repo.py fetch_bs_drilldown) returns:
  //   { period, currency, account_code, account_name, section, sub_section,
  //     total_amount, subdivision_count, rows: [{sub_division_id, sub_division_code,
  //     sub_division_name, parent_division, business_unit, balance_amount, dr_cr}] }
  // DrilldownModal reads:
  //   data.data (rows), data.consolidated_balance, data.period_name,
  //   row.ledger_code, row.abs_pct_of_total

  const totalAmt = raw.consolidated_balance ?? raw.total_amount ?? 0;
  const sourceRows = raw.data ?? raw.rows ?? [];

  const normRows = sourceRows.map((row) => ({
    ...row,
    // abs_pct_of_total: derive from balance_amount / total for the progress bar
    abs_pct_of_total: totalAmt !== 0
      ? Math.round((Math.abs(row.balance_amount) / Math.abs(totalAmt)) * 100 * 10) / 10
      : 0,
    // ledger_code: not returned per-row from backend; show parent_division as context
    ledger_code: row.ledger_code || row.parent_division || '—',
  }));

  return {
    ...raw,
    // Bridge field names
    consolidated_balance: totalAmt,
    data:                 normRows,
    // period_name may not be in drilldown response; fall back to period
    period_name:          raw.period_name || raw.period,
  };
}

/**
 * GET /api/bs/reconciliation
 * Period-wise Balance Sheet reconciliation.
 * Returns BALANCED / VARIANCE status per period and currency.
 *
 * @param {object} filters  Optional: { currency, fromPeriod, toPeriod }
 * @returns {Array<{ period, period_name, currency, sources_total, applications_total, net_variance, balance_status }>}
 */
export async function fetchBSReconciliation(filters = {}) {
  const params = {
    currency:    filters.currency    || undefined,
    from_period: filters.fromPeriod  || undefined,
    to_period:   filters.toPeriod    || undefined,
  };
  const res = await apiCall('/api/bs/reconciliation', params);
  // May be { status: 'ok', data: [...] } or a plain array
  const raw = res?.data ?? res;
  if (!Array.isArray(raw)) return [];

  // Normalise live-backend field names → frontend-expected names.
  // Backend schema (bs_schema.py BSReconciliationRow):
  //   period_code, period_name, currency_code, status,
  //   sources_total, applications_total, combined_total, absolute_variance
  // Frontend (BalanceSheet.jsx) reads:
  //   period, period_name, currency, balance_status, net_variance,
  //   sources_total, applications_total
  return raw.map((row) => ({
    // Pass through all original fields first
    ...row,
    // Map backend names → frontend names (no-op if already correct / mock data)
    period:         row.period         ?? row.period_code,
    currency:       row.currency       ?? row.currency_code,
    balance_status: row.balance_status ?? (row.status === 'BALANCED' ? 'BALANCED' : 'UNBALANCED'),
    net_variance:   row.net_variance   ?? row.absolute_variance,
  }));
}
