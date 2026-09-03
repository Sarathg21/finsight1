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
 *   GET  /api/bs/filter-options
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

const apiCache = new Map();

async function apiCall(path, params = {}) {
  const token = localStorage.getItem('finsight_token');

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

  if (apiCache.has(url)) {
    return apiCache.get(url);
  }

  const fetchPromise = (async () => {
    let res;
    try {
      res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (networkErr) {
      const err = { status: 0, message: `Network error: ${networkErr.message}`, isAuthError: false };
      console.error('[bsApi] Network error on', url, networkErr);
      throw err;
    }

    if (!res.ok) {
      if (res.status === 401) {
        throw { status: 401, message: 'Unauthorized', isAuthError: true };
      }

      const rawBody = await res.text().catch(() => '');
      let body = {};
      try { body = JSON.parse(rawBody); } catch { /* ignore */ }

      let message = body?.error?.message || body?.message || body?.detail;
      if (Array.isArray(message)) message = message.map(m => typeof m === 'object' ? m.msg : m).join(', ');
      if (!message) message = rawBody.slice(0, 120) || res.statusText || 'Error occurred';

      throw { status: res.status, message: String(message), rawBody: rawBody.slice(0, 300) };
    }

    return await res.json();
  })();

  apiCache.set(url, fetchPromise);
  setTimeout(() => apiCache.delete(url), 500);

  return fetchPromise;
}


function getAuthHeaders() {
  const token = localStorage.getItem('finsight_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// buildBSParams
function buildBSParams(filters = {}) {
  const active = (val) => {
    if (Array.isArray(val)) {
      const f = val.filter(v => v !== 'All' && v !== 'all');
      return f.length > 0 ? f : undefined;
    }
    return val && val !== 'All' && val !== 'all' ? val : undefined;
  };

  return {
    period:              active(filters.period),
    compare_period:      active(filters.comparePeriod),
    reporting_currency:  active(filters.currency),
    legal_group_id:      active(filters.legalGroup),
    legal_entity_id:     active(filters.legalEntity),
    parent_division_id:  active(filters.parentDivision),
    subdivision_id:      active(filters.subdivision),
    ledger:              active(filters.ledger),
    section:             active(filters.section),
    sub_section:         active(filters.subSection),
    account_code:        active(filters.accountCode),
    drilldown:           active(filters.drilldown),
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
 * @returns {Promise}
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
 * GET /api/bs/filter-options
 * Returns available filter options: periods, currencies, ledgers, legal_entities.
 *
 * @param {object} params  Optional: { analysis_code }
 * @returns {{ periods, currencies, legal_entities, ledgers, sections, sub_sections }}
 */
export async function fetchBSFilters(params = {}) {
  const apiParams = {};
  if (params.analysisCode) apiParams.analysis_code = params.analysisCode;

  const raw = await apiCall('/api/bs/filter-options', apiParams);
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
    reporting_currency: base.reporting_currency,
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
    reporting_currency: filters.currency,
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
    reporting_currency: filters.currency || undefined,
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
