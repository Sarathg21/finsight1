
import axios from "axios";
import { getApiBaseUrl } from "../utils/apiBase";

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

function getAuthToken() {
    return (
        localStorage.getItem("finsight_token") ||
        localStorage.getItem("token") ||
        ""
    );
}

function getAuthHeaders() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Append scalar or array values to URLSearchParams.
 * Array values are sent as repeated query parameters.
 */
function appendParam(params, key, value) {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
        value.forEach((item) => {
            if (
                item !== undefined &&
                item !== null &&
                String(item).trim() !== ""
            ) {
                params.append(key, String(item));
            }
        });
        return;
    }

    params.append(key, String(value));
}

/** Shared dashboard parameters. */
function buildDashboardParams(filters = {}) {
    const params = new URLSearchParams();

    appendParam(params, "legal_group_id", filters.legal_group_id);
    appendParam(params, "legal_entity_id", filters.legal_entity_id);
    appendParam(params, "parent_division_id", filters.parent_division_id);
    appendParam(params, "subdivision_id", filters.subdivision_id);
    appendParam(params, "aging_basis", filters.aging_basis || "DUE_DATE");
    appendParam(params, "as_on_date", filters.as_on_date);
    appendParam(
        params,
        "reporting_currency",
        filters.reporting_currency || "AED"
    );
    appendParam(params, "supplier_type", filters.supplier_type);
    appendParam(params, "gl_code", filters.gl_code);

    return params;
}

/** View All parameters. */
function buildViewAllParams(filters = {}) {
    const params = buildDashboardParams(filters);

    appendParam(params, "page", filters.page ?? 1);
    appendParam(params, "page_size", filters.page_size ?? 50);
    appendParam(params, "sort_by", filters.sort_by || "total_payables");
    appendParam(params, "sort_dir", filters.sort_dir || "desc");
    appendParam(params, "supplier_id", filters.supplier_id);
    appendParam(params, "source_currency", filters.source_currency);
    appendParam(params, "search", filters.search);

    return params;
}

/** Export parameters. */
function buildExportParams(filters = {}) {
    const params = buildDashboardParams(filters);

    appendParam(params, "aging_bucket", filters.aging_bucket);
    appendParam(params, "balance_status", filters.balance_status);
    appendParam(params, "supplier_id", filters.supplier_id);
    appendParam(params, "source_currency", filters.source_currency);
    appendParam(params, "search", filters.search);

    return params;
}

/**
 * Filter options with hierarchy parameters.
 *
 * The backend should scope the returned options to the selected
 * Legal Group, Legal Entity, and Parent Division.
 */
export async function getPayablesFilterOptions(filters = {}) {
    const params = new URLSearchParams();

    appendParam(params, "legal_group_id", filters.legal_group_id);
    appendParam(params, "legal_entity_id", filters.legal_entity_id);
    appendParam(params, "parent_division_id", filters.parent_division_id);
    appendParam(params, "subdivision_id", filters.subdivision_id);

    return api.get("/api/payables/filter-options", {
        params,
        headers: getAuthHeaders(),
    });
}

/** Dashboard. */
export async function getPayablesDashboard(filters = {}) {
    return api.get("/api/payables/dashboard", {
        params: buildDashboardParams(filters),
        headers: getAuthHeaders(),
    });
}

/** Other balances. */
export async function getPayablesOtherBalances(filters = {}) {
    const params = buildDashboardParams(filters);
    appendParam(params, "year", filters.year);

    return api.get("/api/payables/other-balances", {
        params,
        headers: getAuthHeaders(),
    });
}

/** View All. */
export async function getPayablesViewAll(filters = {}) {
    return api.get("/api/payables/view-all", {
        params: buildViewAllParams(filters),
        headers: getAuthHeaders(),
    });
}

/** Payables by subdivision. */
export async function getPayablesBySubdivision(filters = {}) {
    return api.get("/api/payables/by-subdivision", {
        params: buildDashboardParams(filters),
        headers: getAuthHeaders(),
    });
}

/** Month-on-Month Payables. */
export async function getPayablesMonthOnMonth(filters = {}) {
    const params = buildDashboardParams(filters);
    appendParam(params, "year", filters.year);

    return api.get("/api/payables/month-on-month", {
        params,
        headers: getAuthHeaders(),
    });
}

/** Excel export. */
export async function exportPayablesExcel(filters = {}) {
    return api.get("/api/payables/export/excel", {
        params: buildExportParams(filters),
        headers: getAuthHeaders(),
        responseType: "blob",
    });
}

/** PDF export. */
export async function exportPayablesPdf(filters = {}) {
    return api.get("/api/payables/export/pdf", {
        params: buildExportParams(filters),
        headers: getAuthHeaders(),
        responseType: "blob",
    });
}

/** Parent Division Month-on-Month. */
export async function getPayablesParentDivisionMonthOnMonth(filters = {}) {
    const params = buildDashboardParams(filters);
    appendParam(params, "year", filters.year);

    return api.get("/api/payables/month-on-month/parent-divisions", {
        params,
        headers: getAuthHeaders(),
    });
}

/** Parent Division Month-on-Month Excel export. */
export async function exportPayablesParentDivisionMonthOnMonthExcel(
    filters = {}
) {
    const params = buildDashboardParams(filters);
    appendParam(params, "year", filters.year);

    return api.get(
        "/api/payables/month-on-month/parent-divisions/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/** Parent Division Month-on-Month PDF export. */
export async function exportPayablesParentDivisionMonthOnMonthPdf(
    filters = {}
) {
    const params = buildDashboardParams(filters);
    appendParam(params, "year", filters.year);

    return api.get(
        "/api/payables/month-on-month/parent-divisions/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}
