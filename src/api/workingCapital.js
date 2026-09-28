import axios from "axios";
import { getApiBaseUrl } from "../utils/apiBase";

/* ============================================================
   WORKING CAPITAL API
============================================================ */

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

/* ============================================================
   AUTH
============================================================ */

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

/* ============================================================
   QUERY PARAM BUILDER
   Supports repeated parameters such as:
   legal_entity_id=1&legal_entity_id=2
============================================================ */

function buildQueryParams(filters = {}) {
    const params = new URLSearchParams();

    const arrayKeys = [
        "legal_group_id",
        "legal_entity_id",
        "parent_division_id",
        "subdivision_id",
    ];

    Object.entries(filters || {}).forEach(([key, value]) => {
        if (
            value === undefined ||
            value === null ||
            value === "" ||
            value === "All"
        ) {
            return;
        }

        const values = Array.isArray(value) ? value : [value];

        if (arrayKeys.includes(key) || Array.isArray(value)) {
            values.forEach((item) => {
                if (
                    item !== undefined &&
                    item !== null &&
                    item !== "" &&
                    item !== "All"
                ) {
                    params.append(key, String(item));
                }
            });

            return;
        }

        params.append(key, String(value));
    });

    return params;
}

/* ============================================================
   COMMON GET REQUEST
============================================================ */

async function getWorkingCapital(endpoint, filters = {}) {
    const params = buildQueryParams(filters);

    const response = await api.get(`/api/working-capital${endpoint}`, {
        params,
        headers: getAuthHeaders(),
    });

    return response.data;
}

/* ============================================================
   FILTER OPTIONS
============================================================ */

export async function getWorkingCapitalFilterOptions(filters = {}) {
    const params = buildQueryParams(filters);

    const response = await api.get(
        "/api/working-capital/filter-options",
        {
            params,
            headers: getAuthHeaders(),
        }
    );

    return response.data;
}

/* ============================================================
   DASHBOARD
============================================================ */

export async function getWorkingCapitalDashboard(filters = {}) {
    return getWorkingCapital("/dashboard", {
        aging_basis: "DUE_DATE",
        months: 6,
        ...filters,
    });
}

/* ============================================================
   KPIs
============================================================ */

export async function getWorkingCapitalKpis(filters = {}) {
    return getWorkingCapital("/kpis", {
        aging_basis: "DUE_DATE",
        ...filters,
    });
}

/* ============================================================
   COMPONENTS
============================================================ */

export async function getWorkingCapitalComponents(filters = {}) {
    return getWorkingCapital("/components", {
        aging_basis: "DUE_DATE",
        ...filters,
    });
}

/* ============================================================
   CURRENT ASSETS
============================================================ */

export async function getWorkingCapitalCurrentAssets(filters = {}) {
    return getWorkingCapital("/current-assets", filters);
}

/* ============================================================
   CURRENT LIABILITIES
============================================================ */

export async function getWorkingCapitalCurrentLiabilities(filters = {}) {
    return getWorkingCapital("/current-liabilities", filters);
}

/* ============================================================
   LIQUIDITY RATIOS
============================================================ */

export async function getWorkingCapitalLiquidityRatios(filters = {}) {
    return getWorkingCapital("/liquidity-ratios", filters);
}

/* ============================================================
   ASSETS VS LIABILITIES
============================================================ */

export async function getWorkingCapitalAssetsVsLiabilities(filters = {}) {
    return getWorkingCapital("/assets-vs-liabilities", filters);
}

/* ============================================================
   CASH CONVERSION CYCLE
============================================================ */

export async function getWorkingCapitalCashConversionCycle(filters = {}) {
    return getWorkingCapital("/cash-conversion-cycle", {
        aging_basis: "DUE_DATE",
        ...filters,
    });
}

/* ============================================================
   DASHBOARD TRENDS
============================================================ */

export async function getWorkingCapitalTrend(filters = {}) {
    return getWorkingCapital("/trend", {
        months: 6,
        ...filters,
    });
}

export async function getWorkingCapitalTradeTrend(filters = {}) {
    return getWorkingCapital("/trade-working-capital-trend", {
        aging_basis: "DUE_DATE",
        months: 6,
        ...filters,
    });
}

export async function getWorkingCapitalCccTrend(filters = {}) {
    return getWorkingCapital("/ccc-trend", {
        aging_basis: "DUE_DATE",
        months: 6,
        ...filters,
    });
}

/* ============================================================
   VIEW ALL
============================================================ */

export async function getWorkingCapitalCurrentAssetsViewAll(
    filters = {}
) {
    return getWorkingCapital(
        "/view-all/current-assets",
        filters
    );
}

export async function getWorkingCapitalCurrentLiabilitiesViewAll(
    filters = {}
) {
    return getWorkingCapital(
        "/view-all/current-liabilities",
        filters
    );
}

export async function getWorkingCapitalViewAllTrend(filters = {}) {
    return getWorkingCapital("/view-all/trend", filters);
}

export async function getWorkingCapitalViewAllTradeWorkingCapital(
    filters = {}
) {
    return getWorkingCapital(
        "/view-all/trade-working-capital",
        {
            aging_basis: "DUE_DATE",
            ...filters,
        }
    );
}

export async function getWorkingCapitalViewAllCcc(filters = {}) {
    return getWorkingCapital(
        "/view-all/ccc",
        {
            aging_basis: "DUE_DATE",
            ...filters,
        }
    );
}

/* ============================================================
   EXPORTS
============================================================ */

export async function exportWorkingCapitalCurrentAssetsExcel(
    filters = {}
) {
    const params = buildQueryParams(filters);

    return api.get(
        "/api/working-capital/view-all/current-assets/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

export async function exportWorkingCapitalCurrentAssetsPdf(
    filters = {}
) {
    const params = buildQueryParams(filters);

    return api.get(
        "/api/working-capital/view-all/current-assets/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

export async function exportWorkingCapitalCurrentLiabilitiesExcel(
    filters = {}
) {
    const params = buildQueryParams(filters);

    return api.get(
        "/api/working-capital/view-all/current-liabilities/export/excel",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

export async function exportWorkingCapitalCurrentLiabilitiesPdf(
    filters = {}
) {
    const params = buildQueryParams(filters);

    return api.get(
        "/api/working-capital/view-all/current-liabilities/export/pdf",
        {
            params,
            headers: getAuthHeaders(),
            responseType: "blob",
        }
    );
}

/* ============================================================
   FILE DOWNLOAD HELPER
============================================================ */

export function downloadWorkingCapitalFile(
    response,
    fallbackFileName
) {
    const blob = new Blob([response.data], {
        type:
            response.headers?.["content-type"] ||
            "application/octet-stream",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    const disposition =
        response.headers?.["content-disposition"];

    let fileName = fallbackFileName;

    if (disposition) {
        const utf8Match = disposition.match(
            /filename\*\s*=\s*UTF-8''([^;]+)/i
        );

        const normalMatch = disposition.match(
            /filename\s*=\s*(?:"([^"]+)"|([^;]+))/i
        );

        const rawName =
            utf8Match?.[1] ||
            normalMatch?.[1] ||
            normalMatch?.[2];

        if (rawName) {
            try {
                fileName = decodeURIComponent(rawName).trim();
            } catch {
                fileName = rawName.trim();
            }
        }
    }

    link.setAttribute("download", fileName);

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
}