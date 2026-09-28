import axios from "axios";

/* ─────────────────────────────────────────────
   API BASE URL
───────────────────────────────────────────── */

import { getApiRoot } from '../utils/apiBase';

const API_BASE_URL = getApiRoot();

/* ─────────────────────────────────────────────
   AXIOS INSTANCE
───────────────────────────────────────────── */

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/* ─────────────────────────────────────────────
   AUTH TOKEN
───────────────────────────────────────────── */

function getAuthToken() {
  return (
    localStorage.getItem("finsight_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function getAuthHeaders() {
  const token = getAuthToken();

  return token
    ? {
      Authorization: `Bearer ${token}`,
    }
    : {};
}

/* ─────────────────────────────────────────────
   QUERY PARAM HELPERS
───────────────────────────────────────────── */

function appendParam(params, key, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item !== undefined && item !== null && item !== "") {
        params.append(key, item);
      }
    });

    return;
  }

  params.append(key, value);
}

/* ─────────────────────────────────────────────
   STANDARD RECEIVABLES PARAMETERS
───────────────────────────────────────────── */

function buildDashboardParams(filters = {}) {
  const params = new URLSearchParams();

  appendParam(params, "legal_group_id", filters.legal_group_id);
  appendParam(params, "legal_entity_id", filters.legal_entity_id);
  appendParam(params, "parent_division_id", filters.parent_division_id);
  appendParam(params, "subdivision_id", filters.subdivision_id);

  appendParam(
    params,
    "aging_basis",
    filters.aging_basis || "DUE_DATE"
  );

  appendParam(params, "as_on_date", filters.as_on_date);

  appendParam(
    params,
    "reporting_currency",
    filters.reporting_currency || "AED"
  );

  return params;
}

/* ─────────────────────────────────────────────
   VIEW ALL PARAMETERS
───────────────────────────────────────────── */

function buildViewAllParams(filters = {}) {
  const params = buildDashboardParams(filters);

  appendParam(params, "page", filters.page ?? 1);
  appendParam(params, "page_size", filters.page_size ?? 50);

  appendParam(
    params,
    "sort_by",
    filters.sort_by || "total_receivables"
  );

  appendParam(
    params,
    "sort_dir",
    filters.sort_dir || "desc"
  );

  appendParam(params, "customer_id", filters.customer_id);
  appendParam(params, "source_currency", filters.source_currency);
  appendParam(params, "gl_code", filters.gl_code);
  appendParam(params, "search", filters.search);

  appendParam(params, "aging_bucket", filters.aging_bucket);
  appendParam(params, "balance_status", filters.balance_status);

  return params;
}

/* ─────────────────────────────────────────────
   EXPORT PARAMETERS
───────────────────────────────────────────── */

function buildExportParams(filters = {}) {
  const params = buildDashboardParams(filters);

  appendParam(params, "aging_bucket", filters.aging_bucket);
  appendParam(params, "balance_status", filters.balance_status);

  appendParam(params, "customer_id", filters.customer_id);
  appendParam(params, "source_currency", filters.source_currency);
  appendParam(params, "gl_code", filters.gl_code);
  appendParam(params, "search", filters.search);

  appendParam(params, "section", filters.section);
  return params;
}

/* ─────────────────────────────────────────────
   1. FILTER OPTIONS
───────────────────────────────────────────── */

export async function getReceivablesFilterOptions() {
  const response = await api.get(
    "/receivables/filter-options",
    {
      headers: getAuthHeaders(),
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   2. DASHBOARD
───────────────────────────────────────────── */

export async function getReceivablesDashboard(filters = {}) {
  const params = buildDashboardParams(filters);

  const response = await api.get(
    "/receivables/dashboard",
    {
      params,
      headers: getAuthHeaders(),
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   3. KPI CARDS
───────────────────────────────────────────── */

export async function getReceivablesKPIs(filters = {}) {
  const params = buildDashboardParams(filters);

  const response = await api.get(
    "/receivables/kpis",
    {
      params,
      headers: getAuthHeaders(),
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   4. AGING SUMMARY
───────────────────────────────────────────── */

export async function getReceivablesAgingSummary(filters = {}) {
  const params = buildDashboardParams(filters);

  const response = await api.get(
    "/receivables/aging-summary",
    {
      params,
      headers: getAuthHeaders(),
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   5. MONTHLY TREND
───────────────────────────────────────────── */

export async function getReceivablesTrend(filters = {}) {
  const params = buildDashboardParams(filters);

  const response = await api.get(
    "/receivables/trend",
    {
      params,
      headers: getAuthHeaders(),
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   6. PARENT DIVISION
───────────────────────────────────────────── */

export async function getReceivablesByParentDivision(filters = {}) {
  const params = buildDashboardParams(filters);

  const response = await api.get(
    "/receivables/by-parent-division",
    {
      params,
      headers: getAuthHeaders(),
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   7. SUBDIVISION
───────────────────────────────────────────── */

export async function getReceivablesBySubdivision(filters = {}) {
  const params = buildDashboardParams(filters);

  const response = await api.get(
    "/receivables/by-subdivision",
    {
      params,
      headers: getAuthHeaders(),
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   8. TOP CUSTOMERS
───────────────────────────────────────────── */

export async function getReceivablesTopCustomers(
  filters = {},
  limit = 10
) {
  const params = buildDashboardParams(filters);

  appendParam(params, "limit", limit);

  const response = await api.get(
    "/receivables/top-customers",
    {
      params,
      headers: getAuthHeaders(),
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   9. MONTH-ON-MONTH
───────────────────────────────────────────── */

export async function getReceivablesMonthOnMonth(
  filters = {}
) {
  const params = buildDashboardParams(filters);

  appendParam(params, "year", filters.year);

  const response = await api.get(
    "/receivables/month-on-month",
    {
      params,
      headers: getAuthHeaders(),
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   10. VIEW ALL
───────────────────────────────────────────── */

export async function getReceivablesViewAll(filters = {}) {
  const params = buildViewAllParams(filters);

  const response = await api.get(
    "/receivables/view-all",
    {
      params,
      headers: getAuthHeaders(),
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   11. EXCEL EXPORT
───────────────────────────────────────────── */

export async function exportReceivablesExcel(filters = {}) {
  const params = buildExportParams(filters);

  const response = await api.get(
    "/receivables/export/excel",
    {
      params,
      headers: getAuthHeaders(),
      responseType: "blob",
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   12. PDF EXPORT
───────────────────────────────────────────── */

export async function exportReceivablesPDF(filters = {}) {
  const params = buildExportParams(filters);

  const response = await api.get(
    "/receivables/export/pdf",
    {
      params,
      headers: getAuthHeaders(),
      responseType: "blob",
    }
  );

  return response;
}

export default api;
