
import axios from "axios";
import { getApiBaseUrl } from "../utils/apiBase";

const API_BASE_URL = getApiBaseUrl();
const MANUFACTURING_BASE_PATH = "/api/manufacturing";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

function getAuthToken() {
    if (typeof window === "undefined" || !window.localStorage) {
        return "";
    }

    return String(
        window.localStorage.getItem("finsight_token") ||
        window.localStorage.getItem("token") ||
        ""
    )
        .replace(/^Bearer\s+/i, "")
        .replace(/^"+|"+$/g, "")
        .trim();
}

function getAuthHeaders() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function appendParam(params, key, value) {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
        value.forEach((item) => {
            if (item !== undefined && item !== null && item !== "") {
                params.append(key, String(item));
            }
        });
        return;
    }

    params.append(key, String(value));
}

function firstDefined(source, keys) {
    for (const key of keys) {
        if (source?.[key] !== undefined && source?.[key] !== null) {
            return source[key];
        }
    }
    return undefined;
}

/**
 * Convert camelCase and snake_case filters into API query parameters.
 * Multi-select hierarchy IDs are sent as repeated query parameters.
 */
export function buildManufacturingParams(filters = {}) {
    const params = new URLSearchParams();

    const aliases = [
        [
            "legal_group_id",
            ["legal_group_id", "legalGroup", "legalGroupId", "legal_groups", "legal_group"],
        ],
        [
            "legal_entity_id",
            ["legal_entity_id", "legalEntity", "legalEntityId", "legal_entities", "legal_entity"],
        ],
        [
            "parent_division_id",
            ["parent_division_id", "parent", "parentDivisionId", "parent_divisions", "parent_division"],
        ],
        [
            "subdivision_id",
            ["subdivision_id", "sub", "subdivisionId", "sub_divisions", "subdivision"],
        ],
        ["year", ["year"]],
        ["period_name", ["period_name", "period", "month"]],
        [
            "reporting_currency",
            ["reporting_currency", "reportingCurrency", "currency"],
        ],
    ];

    const consumed = new Set();

    aliases.forEach(([name, keys]) => {
        keys.forEach((key) => consumed.add(key));

        let value = firstDefined(filters, keys);

        if (
            name === "reporting_currency" &&
            (value === undefined || value === null || value === "")
        ) {
            value = "AED";
        }

        appendParam(params, name, value);
    });

    const endpointKeys = new Set([
        "page",
        "page_size",
        "pageSize",
        "sort_by",
        "sortBy",
        "sort_dir",
        "sortDir",
        "search",
        "category",
        "group_by",
        "groupBy",
        "format",
    ]);

    endpointKeys.forEach((key) => consumed.add(key));

    // Preserve additional filter parameters already used by the application.
    Object.entries(filters).forEach(([key, value]) => {
        if (!consumed.has(key)) {
            appendParam(params, key, value);
        }
    });

    return params;
}

function requestConfig(params, extra = {}) {
    return {
        params,
        headers: getAuthHeaders(),
        ...extra,
    };
}

function normalizeReportName(reportName = "category-breakdown") {
    const name = String(reportName)
        .trim()
        .replace(/^\/+|\/+$/g, "");

    const allowed = new Set([
        "summary",
        "monthly",
        "cost-mix",
        "category-breakdown",
        "category-detail",
        "monthly-by-dimension",
        "category-breakdown-by-hierarchy",
        "category-detail-by-hierarchy",
    ]);

    if (!allowed.has(name)) {
        throw new Error(
            `Unsupported Manufacturing report: ${name || "(empty)"}`
        );
    }

    return name;
}

function addViewAllParams(params, filters = {}) {
    appendParam(params, "page", filters.page ?? 1);

    appendParam(
        params,
        "page_size",
        filters.page_size ?? filters.pageSize ?? 50
    );

    appendParam(
        params,
        "sort_by",
        filters.sort_by ?? filters.sortBy
    );

    appendParam(
        params,
        "sort_dir",
        filters.sort_dir ?? filters.sortDir
    );

    appendParam(params, "search", filters.search);
    appendParam(params, "category", filters.category);

    appendParam(
        params,
        "group_by",
        filters.group_by ?? filters.groupBy
    );

    return params;
}

/* -------------------------------------------------------
   1. FILTER OPTIONS
   GET /api/manufacturing/filter-options
------------------------------------------------------- */

export async function getManufacturingFilterOptions(filters = {}) {
    return api.get(
        `${MANUFACTURING_BASE_PATH}/filter-options`,
        requestConfig(buildManufacturingParams(filters))
    );
}

/* -------------------------------------------------------
   2. DASHBOARD
   GET /api/manufacturing/dashboard
------------------------------------------------------- */

export async function getManufacturingDashboard(filters = {}) {
    return api.get(
        `${MANUFACTURING_BASE_PATH}/dashboard`,
        requestConfig(buildManufacturingParams(filters))
    );
}

/* -------------------------------------------------------
   3. SUMMARY / KPI CARDS
   GET /api/manufacturing/summary
------------------------------------------------------- */

export async function getManufacturingSummary(filters = {}) {
    return api.get(
        `${MANUFACTURING_BASE_PATH}/summary`,
        requestConfig(buildManufacturingParams(filters))
    );
}

export const getManufacturingKPIs = getManufacturingSummary;

/* -------------------------------------------------------
   4. MONTHLY ACTUAL AND TARGET
   GET /api/manufacturing/monthly
------------------------------------------------------- */

export async function getManufacturingMonthly(filters = {}) {
    return api.get(
        `${MANUFACTURING_BASE_PATH}/monthly`,
        requestConfig(buildManufacturingParams(filters))
    );
}

/* -------------------------------------------------------
   5. COST MIX
   GET /api/manufacturing/cost-mix
------------------------------------------------------- */

export async function getManufacturingCostMix(filters = {}) {
    return api.get(
        `${MANUFACTURING_BASE_PATH}/cost-mix`,
        requestConfig(buildManufacturingParams(filters))
    );
}

/* -------------------------------------------------------
   6. ORIGINAL CATEGORY BREAKDOWN
   GET /api/manufacturing/category-breakdown
------------------------------------------------------- */

export async function getManufacturingCategoryBreakdown(filters = {}) {
    return api.get(
        `${MANUFACTURING_BASE_PATH}/category-breakdown`,
        requestConfig(buildManufacturingParams(filters))
    );
}

/* -------------------------------------------------------
   7. ORIGINAL CATEGORY / ACCOUNT DETAIL
   GET /api/manufacturing/category-detail?category=...
------------------------------------------------------- */

export async function getManufacturingCategoryDetail(
    filters = {},
    category
) {
    const params = buildManufacturingParams(filters);

    appendParam(params, "category", category ?? filters.category);

    return api.get(
        `${MANUFACTURING_BASE_PATH}/category-detail`,
        requestConfig(params)
    );
}

/* -------------------------------------------------------
   8. MONTHLY BY DIMENSION
   GET /api/manufacturing/monthly-by-dimension

   group_by:
   - legal_entity
   - parent_division
   - subdivision

   Sends the selected grouping together with all applied
   hierarchy filters, year, period, and reporting currency.
------------------------------------------------------- */

export async function getManufacturingMonthlyByDimension(
    filters = {},
    groupBy = "legal_entity"
) {
    const allowedGroups = new Set([
        "legal_entity",
        "parent_division",
        "subdivision",
    ]);

    if (!allowedGroups.has(groupBy)) {
        throw new Error(
            "Unsupported group_by. Use legal_entity, parent_division, or subdivision."
        );
    }

    const params = buildManufacturingParams(filters);

    // Use the explicit function argument when supplied.
    params.set("group_by", groupBy);

    return api.get(
        `${MANUFACTURING_BASE_PATH}/monthly-by-dimension`,
        requestConfig(params)
    );
}

/* -------------------------------------------------------
   9. HIERARCHY CATEGORY BREAKDOWN
   GET /api/manufacturing/category-breakdown-by-hierarchy/view-all
------------------------------------------------------- */

export async function getManufacturingHierarchyCategoryBreakdown(
    filters = {}
) {
    const params = addViewAllParams(
        buildManufacturingParams(filters),
        filters
    );

    return api.get(
        `${MANUFACTURING_BASE_PATH}/category-breakdown-by-hierarchy/view-all`,
        requestConfig(params)
    );
}

/* -------------------------------------------------------
   10. HIERARCHY ACCOUNT DETAIL
   GET /api/manufacturing/category-detail-by-hierarchy/view-all
------------------------------------------------------- */

export async function getManufacturingHierarchyCategoryDetail(
    filters = {},
    category
) {
    const selectedCategory = category ?? filters.category;

    if (
        selectedCategory === undefined ||
        selectedCategory === null ||
        String(selectedCategory).trim() === ""
    ) {
        throw new Error(
            "A selected cost category is required for Manufacturing Account Detail."
        );
    }

    const detailFilters = {
        ...filters,
        category: selectedCategory,
    };

    const params = addViewAllParams(
        buildManufacturingParams(detailFilters),
        detailFilters
    );

    return api.get(
        `${MANUFACTURING_BASE_PATH}/category-detail-by-hierarchy/view-all`,
        requestConfig(params)
    );
}

/* -------------------------------------------------------
   11. GENERIC VIEW ALL
------------------------------------------------------- */

export async function getManufacturingViewAll(
    filters = {},
    reportName = "category-breakdown"
) {
    const name = normalizeReportName(reportName);

    if (name === "category-detail") {
        return getManufacturingCategoryDetail(filters, filters.category);
    }

    if (name === "category-breakdown-by-hierarchy") {
        return getManufacturingHierarchyCategoryBreakdown(filters);
    }

    if (name === "category-detail-by-hierarchy") {
        return getManufacturingHierarchyCategoryDetail(
            filters,
            filters.category
        );
    }

    const params = addViewAllParams(
        buildManufacturingParams(filters),
        filters
    );

    return api.get(
        `${MANUFACTURING_BASE_PATH}/${name}/view-all`,
        requestConfig(params)
    );
}

/* -------------------------------------------------------
   12. GENERIC EXCEL / PDF EXPORT
   GET /api/manufacturing/{report_name}/export

   Supports group_by for monthly-by-dimension exports.
------------------------------------------------------- */

export async function exportManufacturingReport(
    filters = {},
    format = "excel",
    reportName = "category-breakdown"
) {
    const name = normalizeReportName(reportName);
    const normalizedFormat = String(format).toLowerCase();

    if (!["excel", "pdf"].includes(normalizedFormat)) {
        throw new Error(
            'Unsupported Manufacturing export format. Use "excel" or "pdf".'
        );
    }

    const params = buildManufacturingParams(filters);

    params.set("format", normalizedFormat);

    appendParam(params, "search", filters.search);
    appendParam(params, "category", filters.category);

    appendParam(
        params,
        "group_by",
        filters.group_by ?? filters.groupBy
    );

    return api.get(
        `${MANUFACTURING_BASE_PATH}/${name}/export`,
        requestConfig(params, {
            responseType: "blob",
        })
    );
}

/* -------------------------------------------------------
   13. EXCEL EXPORT
------------------------------------------------------- */

export const exportManufacturingExcel = (
    filters = {},
    reportName = "category-breakdown"
) =>
    exportManufacturingReport(
        filters,
        "excel",
        reportName
    );

/* -------------------------------------------------------
   14. PDF EXPORT
------------------------------------------------------- */

export const exportManufacturingPDF = (
    filters = {},
    reportName = "category-breakdown"
) =>
    exportManufacturingReport(
        filters,
        "pdf",
        reportName
    );

/* -------------------------------------------------------
   15. EXISTING CATEGORY EXPORT HELPERS
------------------------------------------------------- */

export const exportManufacturingCategoryBreakdownExcel = (
    filters = {}
) =>
    exportManufacturingExcel(
        filters,
        "category-breakdown"
    );

export const exportManufacturingCategoryBreakdownPDF = (
    filters = {}
) =>
    exportManufacturingPDF(
        filters,
        "category-breakdown"
    );

/* -------------------------------------------------------
   16. MONTHLY-BY-DIMENSION EXCEL / PDF EXPORTS

   The selected group_by and filters are retained for exports.
------------------------------------------------------- */

export const exportManufacturingMonthlyByDimensionExcel = (
    filters = {}
) =>
    exportManufacturingExcel(
        {
            ...filters,
            group_by:
                filters.group_by ??
                filters.groupBy ??
                "legal_entity",
        },
        "monthly-by-dimension"
    );

export const exportManufacturingMonthlyByDimensionPDF = (
    filters = {}
) =>
    exportManufacturingPDF(
        {
            ...filters,
            group_by:
                filters.group_by ??
                filters.groupBy ??
                "legal_entity",
        },
        "monthly-by-dimension"
    );

/* -------------------------------------------------------
   DEFAULT EXPORT
------------------------------------------------------- */

export default api;
