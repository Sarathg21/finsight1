


import axios from "axios";
import { getApiBaseUrl } from "../utils/apiBase";

/* ─────────────────────────────────────────────
   API BASE URL
───────────────────────────────────────────── */

const API_BASE_URL = getApiBaseUrl();

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
    ? { Authorization: `Bearer ${token}` }
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

  appendParam(params, "customer_type", filters.customer_type || "ALL");
  appendParam(params, "gl_code", filters.gl_code);

  appendParam(params, "aging_basis", filters.aging_basis || "DUE_DATE");
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
  appendParam(params, "sort_by", filters.sort_by || "total_receivables");
  appendParam(params, "sort_dir", filters.sort_dir || "desc");

  appendParam(params, "customer_id", filters.customer_id);
  appendParam(params, "source_currency", filters.source_currency);
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
  appendParam(params, "search", filters.search);
  appendParam(params, "section", filters.section);

  return params;
}

/* ─────────────────────────────────────────────
   1. FILTER OPTIONS
   Supports the hierarchy cascade on the main
   dashboard and the View All modal.
───────────────────────────────────────────── */

export async function getReceivablesFilterOptions(filters = {}) {
  const params = new URLSearchParams();

  appendParam(
    params,
    "legal_group_id",
    filters.legal_group_id ?? filters.legal_groups ?? filters.legal_group
  );

  appendParam(
    params,
    "legal_entity_id",
    filters.legal_entity_id ?? filters.legal_entities ?? filters.legal_entity
  );

  appendParam(
    params,
    "parent_division_id",
    filters.parent_division_id ??
    filters.parent_divisions ??
    filters.parent_division
  );

  appendParam(
    params,
    "subdivision_id",
    filters.subdivision_id ??
    filters.sub_divisions ??
    filters.subdivision
  );

  const response = await api.get("/api/receivables/filter-options", {
    params,
    headers: getAuthHeaders(),
  });

  return response;
}

/* ─────────────────────────────────────────────
   2. DASHBOARD
───────────────────────────────────────────── */

export async function getReceivablesDashboard(filters = {}) {
  const response = await api.get("/api/receivables/dashboard", {
    params: buildDashboardParams(filters),
    headers: getAuthHeaders(),
  });

  return response;
}

/* ─────────────────────────────────────────────
   3. KPI CARDS
───────────────────────────────────────────── */

export async function getReceivablesKPIs(filters = {}) {
  const response = await api.get("/api/receivables/kpis", {
    params: buildDashboardParams(filters),
    headers: getAuthHeaders(),
  });

  return response;
}

/* ─────────────────────────────────────────────
   4. AGING SUMMARY
───────────────────────────────────────────── */

export async function getReceivablesAgingSummary(filters = {}) {
  const response = await api.get("/api/receivables/aging-summary", {
    params: buildDashboardParams(filters),
    headers: getAuthHeaders(),
  });

  return response;
}

/* ─────────────────────────────────────────────
   5. MONTHLY TREND
───────────────────────────────────────────── */

export async function getReceivablesTrend(filters = {}) {
  const response = await api.get("/api/receivables/trend", {
    params: buildDashboardParams(filters),
    headers: getAuthHeaders(),
  });

  return response;
}

/* ─────────────────────────────────────────────
   6. PARENT DIVISION
───────────────────────────────────────────── */

export async function getReceivablesByParentDivision(filters = {}) {
  const response = await api.get("/api/receivables/by-parent-division", {
    params: buildDashboardParams(filters),
    headers: getAuthHeaders(),
  });

  return response;
}

/* ─────────────────────────────────────────────
   7. SUBDIVISION
───────────────────────────────────────────── */

export async function getReceivablesBySubdivision(filters = {}) {
  const response = await api.get("/api/receivables/by-subdivision", {
    params: buildDashboardParams(filters),
    headers: getAuthHeaders(),
  });

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

  const response = await api.get("/api/receivables/top-customers", {
    params,
    headers: getAuthHeaders(),
  });

  return response;
}

/* ─────────────────────────────────────────────
   9. MONTH-ON-MONTH
───────────────────────────────────────────── */

export async function getReceivablesMonthOnMonth(filters = {}) {
  const params = buildDashboardParams(filters);
  appendParam(params, "year", filters.year);

  const response = await api.get("/api/receivables/month-on-month", {
    params,
    headers: getAuthHeaders(),
  });

  return response;
}

/* ─────────────────────────────────────────────
   10. GLOBAL VIEW ALL
───────────────────────────────────────────── */

export async function getReceivablesViewAll(filters = {}) {
  const response = await api.get("/api/receivables/view-all", {
    params: buildViewAllParams(filters),
    headers: getAuthHeaders(),
  });

  return response;
}

/* ─────────────────────────────────────────────
   11. EXCEL EXPORT
───────────────────────────────────────────── */

export async function exportReceivablesExcel(filters = {}) {
  const response = await api.get("/api/receivables/export/excel", {
    params: buildExportParams(filters),
    headers: getAuthHeaders(),
    responseType: "blob",
  });

  return response;
}

/* ─────────────────────────────────────────────
   12. PDF EXPORT
───────────────────────────────────────────── */

export async function exportReceivablesPDF(filters = {}) {
  const response = await api.get("/api/receivables/export/pdf", {
    params: buildExportParams(filters),
    headers: getAuthHeaders(),
    responseType: "blob",
  });

  return response;
}

/* ─────────────────────────────────────────────
   13. PARENT DIVISION MONTH-ON-MONTH
───────────────────────────────────────────── */

export async function getReceivablesParentDivisionMonthOnMonth(
  filters = {}
) {
  const params = buildDashboardParams(filters);
  appendParam(params, "year", filters.year);

  const response = await api.get(
    "/api/receivables/month-on-month/parent-divisions",
    {
      params,
      headers: getAuthHeaders(),
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   14. PARENT DIVISION MOM EXCEL EXPORT
───────────────────────────────────────────── */

export async function exportReceivablesParentDivisionMonthOnMonthExcel(
  filters = {}
) {
  const params = buildDashboardParams(filters);
  appendParam(params, "year", filters.year);

  const response = await api.get(
    "/api/receivables/month-on-month/parent-divisions/export/excel",
    {
      params,
      headers: getAuthHeaders(),
      responseType: "blob",
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   15. PARENT DIVISION MOM PDF EXPORT
───────────────────────────────────────────── */

export async function exportReceivablesParentDivisionMonthOnMonthPDF(
  filters = {}
) {
  const params = buildDashboardParams(filters);
  appendParam(params, "year", filters.year);

  const response = await api.get(
    "/api/receivables/month-on-month/parent-divisions/export/pdf",
    {
      params,
      headers: getAuthHeaders(),
      responseType: "blob",
    }
  );

  return response;
}

/* ─────────────────────────────────────────────
   DEFAULT EXPORT
───────────────────────────────────────────── */

export default api;
