

import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
    getPayablesFilterOptions,
    getPayablesDashboard,
    getPayablesViewAll,
    getPayablesBySubdivision,
    getPayablesMonthOnMonth,
    exportPayablesExcel,
    exportPayablesPdf,
} from "../api/payablesApi";

/* ============================================================
   PAYABLES DASHBOARD
   ------------------------------------------------------------
   Payables-specific filters:
   - Legal Group
   - Legal Entity
   - Parent Division
   - Sub-Division
   - Reporting Currency
   - As-On Date
   - Aging Basis

   No Business Unit filter.
   ============================================================ */


const PAYABLE_AGING_BUCKETS = [
    "Current",
    "0–30 Days",
    "31–60 Days",
    "61–90 Days",
    "91–120 Days",
    "121–180 Days",
    "181–365 Days",
    "Above 365 Days",
];

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

/* ============================================================
   DEFAULT FILTERS
   ============================================================ */

const defaultPayablesFilters = {
    legal_group: ["All"],
    legal_entities: ["All"],
    parent_divisions: ["All"],
    sub_divisions: ["All"],
    reporting_currency: "AED",
    as_on_date: "2024-04-30",

    // VERY IMPORTANT:
    // This value must always be sent to backend APIs later.
    aging_basis: "Due Date Based",

    year: 2024,
};

/* ============================================================
   API NORMALIZATION / INTEGRATION HELPERS
   ============================================================ */

const emptyDashboardData = {
    kpis: {},
    agingSummary: [],
    trend: [],
    parentDivision: [],
    topSuppliers: [],
    overdueSummary: [],
    subDivision: [],
    monthOnMonth: [],
    monthOnMonthYear: null,
    viewAll: [],
    viewAllSummary: {},
    businessUnit: [],
};

const normalizeOption = (item) => {
    if (item === null || item === undefined) return null;
    if (typeof item === "string" || typeof item === "number") {
        return { label: String(item), value: String(item) };
    }

    const value =
        item.id ??
        item.value ??
        item.code ??
        item.key ??
        item.uuid ??
        item.name;

    const label =
        item.label ??
        item.name ??
        item.title ??
        item.description ??
        item.code ??
        value;

    if (value === undefined || value === null || label === undefined || label === null) {
        return null;
    }

    return {
        label: String(label),
        value: String(value),
        // Preserve backend relationship metadata for cascade filters.
        // The UI only uses these fields when they are supplied by the API.
        meta: item,
    };
};

const normalizeOptionList = (value) => {
    if (!Array.isArray(value)) return [];
    return value.map(normalizeOption).filter(Boolean);
};

const normalizeFilterOptions = (response) => {
    const payload = response?.data?.data ?? response?.data ?? response ?? {};
    const optionSource =
        payload?.filters ??
        payload?.filter_options ??
        payload?.filterOptions ??
        payload;

    const pick = (...keys) => {
        for (const key of keys) {
            if (optionSource?.[key] !== undefined) return optionSource[key];
            if (payload?.[key] !== undefined) return payload[key];
        }
        return [];
    };

    return {
        legal_groups: normalizeOptionList(
            pick("legal_groups", "legal_group", "legalGroup", "legal_group_options")
        ),
        legal_entities: normalizeOptionList(
            pick("legal_entities", "legal_entity", "legalEntity", "legal_entity_options")
        ),
        parent_divisions: normalizeOptionList(
            pick("parent_divisions", "parent_division", "parentDivision", "parent_division_options")
        ),
        sub_divisions: normalizeOptionList(
            pick(
                "sub_divisions",
                "sub_division",
                "subDivision",
                "subdivision",
                "subdivisions",
                "subdivision_options",
                "sub_division_options",
                "subdivision_list"
            )
        ),
        reporting_currencies: normalizeOptionList(
            pick("reporting_currencies", "currencies", "currency", "reporting_currency")
        ),
        as_on_dates: normalizeOptionList(
            pick("as_on_dates", "asOnDates", "dates", "as_of_dates", "as_on_date")
        ).map((option) => ({
            ...option,
            label: toDisplayDate(option.label),
        })),
        aging_basis: normalizeOptionList(
            pick("aging_basis", "aging_bases", "agingBasis", "aging_basis_options")
        ),
        years: Array.isArray(pick("years", "year"))
            ? pick("years", "year").map((item) => Number(item)).filter(Number.isFinite)
            : [],
    };
};

const getOptionLabels = (options = []) =>
    options.map((option) => option.label);

const selectedFilterValues = (value) => {
    const values = Array.isArray(value) ? value : [value];
    return values
        .filter((v) => v !== undefined && v !== null && String(v) !== "")
        .map((v) => String(v))
        .filter((v) => v !== "All");
};

const getMetaValue = (option, keys = []) => {
    const meta = option?.meta || option || {};
    for (const key of keys) {
        const value = meta?.[key];
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return null;
};

/*
 * Cascade support is deliberately defensive: if the backend supplies parent
 * relationship IDs/names, dependent options are filtered immediately. If the
 * endpoint returns flat option lists, the full list is retained so existing
 * API behaviour is not broken.
 */
const cascadeFilterOptions = (options = [], parentValue, relationKeys = []) => {
    const parents = selectedFilterValues(parentValue);
    if (!parents.length || !Array.isArray(options) || !options.length) return options || [];

    let relationshipFieldFound = false;
    const filtered = options.filter((option) => {
        const relation = getMetaValue(option, relationKeys);
        if (relation === null) return true;
        relationshipFieldFound = true;
        const relations = Array.isArray(relation) ? relation.map(String) : [String(relation)];
        return parents.some((parent) => relations.includes(String(parent)));
    });

    // If the API supplied relationship metadata, honour an empty result.
    // If it did not, leave the original flat list untouched.
    return relationshipFieldFound ? filtered : options;
};

const cascadeLegalEntities = (options, legalGroup) =>
    cascadeFilterOptions(options, legalGroup, [
        "legal_group_id", "legalGroupId", "legal_group", "legalGroup", "group_id", "groupId"
    ]);

const cascadeParentDivisions = (options, legalEntities, legalGroup) => {
    let result = cascadeFilterOptions(options, legalGroup, [
        "legal_group_id", "legalGroupId", "legal_group", "legalGroup", "group_id", "groupId"
    ]);
    result = cascadeFilterOptions(result, legalEntities, [
        "legal_entity_id", "legalEntityId", "legal_entity", "legalEntity", "entity_id", "entityId"
    ]);
    return result;
};

const cascadeSubDivisions = (options, parentDivisions, legalEntities, legalGroup) => {
    let result = cascadeFilterOptions(options, legalGroup, [
        "legal_group_id", "legalGroupId", "legal_group", "legalGroup", "group_id", "groupId"
    ]);
    result = cascadeFilterOptions(result, legalEntities, [
        "legal_entity_id", "legalEntityId", "legal_entity", "legalEntity", "entity_id", "entityId"
    ]);
    result = cascadeFilterOptions(result, parentDivisions, [
        "parent_division_id", "parentDivisionId", "parent_division", "parentDivision", "division_id", "divisionId"
    ]);
    return result;
};

const findOptionValue = (options = [], selected) => {
    const match = options.find(
        (option) =>
            option.label === String(selected) ||
            option.value === String(selected)
    );
    return match ? match.value : selected;
};

const toApiDate = (value) => {
    if (!value) return undefined;
    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return text;
    }

    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return text;

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const toDisplayDate = (value) => {
    if (!value) return "";
    const text = String(value).trim();

    // As-On-Date UI format: yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return text;

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const normalizeAgingBasis = (value) => {
    const text = String(value || "DUE_DATE")
        .trim()
        .toUpperCase()
        .replace(/[ -]/g, "_");

    // Backend values:
    // DUE_DATE -> Due Date Based
    // INVOICE_DATE -> Invoice Date Based
    // Also accept the backend labels when they are passed back from the UI.
    if (text === "INVOICE_DATE" || text === "INVOICE_DATE_BASED") {
        return "INVOICE_DATE";
    }

    return "DUE_DATE";
};

const displayAgingBasis = (value) =>
    normalizeAgingBasis(value) === "INVOICE_DATE"
        ? "Invoice Date Based"
        : "Due Date Based";


/* ============================================================
   AGING BUCKET CODE HELPER
   Shared by dashboard drilldowns and PayablesViewAll.
   ============================================================ */
const toAgingBucketCode = (value) => {
    const text = String(value || "").trim().toUpperCase();

    const normalized = text
        .replace(/–/g, "-")
        .replace(/—/g, "-")
        .replace(/\\s+/g, "_");

    const map = {
        CURRENT: "CURRENT",
        "0-30_DAYS": "0_30",
        "0_30_DAYS": "0_30",
        "0-30": "0_30",
        "0_30": "0_30",
        "31-60_DAYS": "31_60",
        "31_60_DAYS": "31_60",
        "31-60": "31_60",
        "31_60": "31_60",
        "61-90_DAYS": "61_90",
        "61_90_DAYS": "61_90",
        "61-90": "61_90",
        "61_90": "61_90",
        "91-120_DAYS": "91_120",
        "91_120_DAYS": "91_120",
        "91-120": "91_120",
        "91_120": "91_120",
        "121-180_DAYS": "121_180",
        "121_180_DAYS": "121_180",
        "121-180": "121_180",
        "121_180": "121_180",
        "181-365_DAYS": "181_365",
        "181_365_DAYS": "181_365",
        "181-365": "181_365",
        "181_365": "181_365",
        "ABOVE_365_DAYS": "ABOVE_365",
        ABOVE_365: "ABOVE_365",
    };

    return map[normalized] || text;
};

const buildPayablesApiFilters = (filters = {}, optionMeta = {}) => {
    const omitAll = (values, options) => {
        const list = Array.isArray(values) ? values : values ? [values] : [];
        return list
            .filter((value) => String(value).toLowerCase() !== "all")
            .map((value) => findOptionValue(options, value))
            .filter((value) => value !== undefined && value !== null && value !== "");
    };

    const payload = {
        aging_basis: normalizeAgingBasis(filters.aging_basis),
        as_on_date: toApiDate(filters.as_on_date),
        reporting_currency: filters.reporting_currency || "AED",
    };

    const legalGroups = omitAll(filters.legal_group, optionMeta.legal_groups);
    const legalEntities = omitAll(filters.legal_entities, optionMeta.legal_entities);
    const parentDivisions = omitAll(filters.parent_divisions, optionMeta.parent_divisions);
    const subDivisions = omitAll(filters.sub_divisions, optionMeta.sub_divisions);

    if (legalGroups.length) payload.legal_group_id = legalGroups;
    if (legalEntities.length) payload.legal_entity_id = legalEntities;
    if (parentDivisions.length) payload.parent_division_id = parentDivisions;
    if (subDivisions.length) payload.subdivision_id = subDivisions;

    return payload;
};

const firstOptionLabel = (options = [], fallback = "") =>
    options.length ? options[0].label : fallback;

const normalizeSubdivisionResponse = (response) => {
    const payload = response?.data?.data ?? response?.data ?? response ?? {};

    const rows =
        Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.records)
                    ? payload.records
                    : Array.isArray(payload?.rows)
                        ? payload.rows
                        : Array.isArray(payload?.by_subdivision)
                            ? payload.by_subdivision
                            : Array.isArray(payload?.sub_division)
                                ? payload.sub_division
                                : Array.isArray(payload?.sub_divisions)
                                    ? payload.sub_divisions
                                    : Array.isArray(payload?.subdivision_wise)
                                        ? payload.subdivision_wise
                                        : Array.isArray(payload?.subdivision_wise_data)
                                            ? payload.subdivision_wise_data
                                            : Array.isArray(payload?.subdivision_data)
                                                ? payload.subdivision_data
                                                : Array.isArray(payload?.items)
                                                    ? payload.items
                                                    : [];

    return rows.map((item) => ({
        ...item,
        name:
            item?.name ??
            item?.subdivision_name ??
            item?.sub_division_name ??
            item?.subdivision ??
            item?.sub_division ??
            item?.label ??
            "",
        amount:
            item?.amount ??
            item?.total_payables ??
            item?.total_payable ??
            item?.payable_amount ??
            item?.outstanding_amount ??
            item?.total_amount ??
            item?.total ??
            0,
        percentage:
            item?.percentage ??
            item?.percentage_of_total ??
            item?.percent ??
            item?.share_pct ??
            item?.share_percentage ??
            0,
    }));
};

const normalizeMonthOnMonthResponse = (response) => {
    const payload = response?.data?.data ?? response?.data ?? response ?? {};

    const rows =
        Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.records)
                    ? payload.records
                    : Array.isArray(payload?.rows)
                        ? payload.rows
                        : Array.isArray(payload?.monthly_values)
                            ? payload.monthly_values
                            : payload?.monthly_values &&
                                typeof payload.monthly_values === "object"
                                ? [payload]
                                : payload &&
                                    typeof payload === "object" &&
                                    Object.keys(payload).some((key) =>
                                        [
                                            "JAN",
                                            "FEB",
                                            "MAR",
                                            "APR",
                                            "MAY",
                                            "JUN",
                                            "JUL",
                                            "AUG",
                                            "SEP",
                                            "OCT",
                                            "NOV",
                                            "DEC",
                                        ].includes(String(key).toUpperCase())
                                    )
                                    ? [{ monthly_values: payload }]
                                    : [];

    const normalizeMonthValue = (value) => {
        // IMPORTANT: backend null means no successful snapshot.
        // Keep null as null; never convert it to zero.
        if (value === null || value === undefined || value === "") {
            return value === null ? null : undefined;
        }

        return value;
    };

    return rows.map((item) => {
        const monthlyValues = item?.monthly_values ?? item?.monthlyValues ?? {};

        const row = {
            ...item,
            legal_entity:
                item?.legal_entity ??
                item?.legal_entity_name ??
                item?.legalEntity ??
                "",
            parent_division:
                item?.parent_division ??
                item?.parent_division_name ??
                item?.parentDivision ??
                "",
            sub_division:
                item?.sub_division ??
                item?.sub_division_name ??
                item?.subdivision ??
                item?.subdivision_name ??
                "",
        };

        MONTHS.forEach((month) => {
            const apiMonth = month.toUpperCase();
            row[month] = normalizeMonthValue(
                monthlyValues?.[apiMonth] ??
                monthlyValues?.[month] ??
                item?.[apiMonth] ??
                item?.[month]
            );
        });

        row.latest =
            item?.latest ??
            item?.latest_value ??
            item?.latestValue ??
            [...MONTHS]
                .reverse()
                .map((month) => row[month])
                .find((value) => value !== null && value !== undefined);

        return row;
    });
};

const formatTrendMonth = (value) => {
    if (!value) return "";

    const text = String(value).trim();
    const match = text.match(/^(\d{4})-(\d{2})-\d{2}$/);

    if (match) {
        const year = Number(match[1]);
        const monthIndex = Number(match[2]) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            return `${MONTHS[monthIndex]} ${year}`;
        }
    }

    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) {
        return `${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
    }

    return text;
};

const normalizeDashboardResponse = (response) => {
    const payload = response?.data?.data ?? response?.data ?? response ?? {};
    const source = payload?.data ?? payload;
    const k = source?.kpis ?? source?.KPI ?? source?.summary ?? {};

    const getArray = (...keys) => {
        for (const key of keys) {
            if (Array.isArray(source?.[key])) return source[key];
        }
        return [];
    };

    const normalizeKpis = {
        ...k,
        total_payables:
            k.total_payables ?? k.total ?? k.total_ar ?? k.total_outstanding ?? null,
        current_payables:
            k.current_payables ?? k.current ?? k.current_amount ?? null,
        overdue_payables:
            k.overdue_payables ?? k.overdue ?? k.overdue_amount ?? null,
        overdue_gt_90:
            k.overdue_gt_90 ?? k.overdue_above_90 ?? k.overdue_above_90_days ?? k.above_90 ?? null,
        dpo: k.dpo ?? k.dpo_days ?? null,
        total_payables_variance:
            k.total_payables_variance ?? k.total_variance ?? null,
        current_payables_variance:
            k.current_payables_variance ?? k.current_variance ?? null,
        overdue_payables_variance:
            k.overdue_payables_variance ?? k.overdue_variance ?? null,
        overdue_gt_90_variance:
            k.overdue_gt_90_variance ?? k.overdue_above_90_variance ?? null,
        dpo_variance: k.dpo_variance ?? null,
        previous_date: k.previous_date ?? k.previous_as_on_date ?? null,
    };

    const aging = getArray("aging_summary", "agingSummary", "aging", "aging_breakdown").map((item, index) => ({
        ...item,
        bucket_code: item.bucket_code ?? item.bucket ?? item.code ?? `BUCKET_${index}`,
        bucket_name: item.bucket_name ?? item.bucket ?? item.label ?? item.bucket_code ?? `Bucket ${index + 1}`,
        amount: item.amount ?? 0,
        percentage: item.percentage ?? item.percentage_of_total ?? 0,
    }));
    const trend = getArray("trend", "payables_trend", "payablesTrend").map((item) => ({
        ...item,
        month: formatTrendMonth(item.as_on_date ?? item.snapshot_date ?? item.date ?? item.month ?? item.period ?? item.period_name),
        total_payables: item.total_payables ?? item.total ?? item.amount ?? item.outstanding_amount ?? 0,
        dpo: item.dpo ?? item.dpo_days ?? 0,
    }));
    const parentDivision = getArray("by_parent_division", "parent_division", "parent_divisions", "parentDivision", "division_breakdown").map((item) => ({
        ...item,
        name: item.name ?? item.parent_division ?? item.parent_division_name ?? item.label ?? "",
        amount: item.amount ?? item.total_payables ?? item.payable_amount ?? item.outstanding_amount ?? 0,
        percentage: item.percentage ?? item.percentage_of_total ?? item.percent ?? item.share_pct ?? 0,
    }));
    const topSuppliers = getArray("top_suppliers", "topSuppliers", "top_10_suppliers", "suppliers").map((item, index) => ({
        ...item,
        rank: item.rank ?? index + 1,
        supplier_name: item.supplier_name ?? item.supplier ?? item.name ?? "",
        payable_amount: item.payable_amount ?? item.total_payables ?? item.total_payable ?? item.outstanding_amount ?? 0,
        percentage: item.percentage ?? item.percentage_of_total ?? item.percent ?? item.share_pct ?? 0,
    }));
    const businessUnit = getArray("by_business_unit", "business_unit", "business_units", "business_unit_breakdown", "businessUnit").map((item) => ({
        ...item,
        name: item.name ?? item.business_unit ?? item.business_unit_name ?? item.label ?? "",
        amount: item.amount ?? item.total_payables ?? item.payable_amount ?? item.outstanding_amount ?? 0,
        total_payables: item.total_payables ?? item.amount ?? 0,
        current_payables: item.current_payables ?? item.current ?? 0,
        overdue_payables: item.overdue_payables ?? item.overdue ?? 0,
        percentage: item.percentage ?? item.percentage_of_total ?? item.percent ?? item.share_pct ?? 0,
    }));

    return {
        ...emptyDashboardData,
        kpis: normalizeKpis,
        agingSummary: aging,
        trend,
        parentDivision,
        topSuppliers,
        businessUnit,
        overdueSummary: getArray("overdue_summary", "overdueSummary", "overdue_breakdown").length
            ? getArray("overdue_summary", "overdueSummary", "overdue_breakdown")
            : aging.filter((item) => String(item.bucket_code || "").toUpperCase() !== "CURRENT").map((item) => ({
                ...item,
                bucket: item.bucket ?? item.bucket_name ?? item.bucket_code,
                percentage: item.percentage ?? item.percentage_of_total ?? 0,
            })),
        subDivision: getArray("sub_division", "sub_divisions", "subDivision").map((item) => ({
            ...item,
            name: item.name ?? item.sub_division ?? item.sub_division_name ?? item.label ?? "",
            amount: item.amount ?? item.total_payables ?? item.payable_amount ?? 0,
            percentage: item.percentage ?? item.percent ?? item.share_pct ?? 0,
        })),
        monthOnMonth: getArray("month_on_month", "monthOnMonth", "monthly_payables"),
        viewAll: source?.records ?? source?.rows ?? [],
        viewAllSummary: source?.summary ?? {},
    };
};

/* ============================================================
   CURRENCY CONFIG
   ------------------------------------------------------------
   No dashboard value should hard-code a currency.
   ============================================================ */

const currencyConfig = {
    AED: { code: "AED", locale: "en-AE" },
    INR: { code: "INR", locale: "en-IN" },
    OMR: { code: "OMR", locale: "en-OM" },
    QAR: { code: "QAR", locale: "en-QA" },
    SAR: { code: "SAR", locale: "en-SA" },
    USD: { code: "USD", locale: "en-US" },
    EUR: { code: "EUR", locale: "en-IE" },
};

/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Format currency using selected reporting currency.
 *
 * The currency is passed into the function instead of
 * being hard-coded.
 */
const formatPayablesCurrency = (
    value,
    currency = "AED"
) => {
    if (value === null || value === undefined) {
        return "—";
    }

    const config =
        currencyConfig[currency] || currencyConfig.AED;

    return new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: config.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value));
};

/**
 * Dashboard-friendly M/K formatting.
 *
 * Example:
 * 192290000 -> AED 192.29M
 *
 * Currency is still dynamically selected.
 */
const formatPayablesCompact = (
    value,
    currency = "AED"
) => {
    if (value === null || value === undefined) {
        return "—";
    }

    const config =
        currencyConfig[currency] || currencyConfig.AED;

    const number = Number(value);

    if (Math.abs(number) >= 1000000) {
        return `${config.code} ${(number / 1000000).toFixed(2)}M`;
    }

    if (Math.abs(number) >= 1000) {
        return `${config.code} ${(number / 1000).toFixed(2)}K`;
    }

    return `${config.code} ${number.toFixed(2)}`;
};

/**
 * Month-on-month formatter.
 *
 * IMPORTANT:
 * null -> —
 * NOT zero.
 */
const formatMoMValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    return Number(value).toFixed(2);
};

/**
 * Percentage formatter.
 */
const formatPercentage = (value) => {
    if (value === null || value === undefined) {
        return "—";
    }

    return `${Number(value).toFixed(1)}%`;
};

/**
 * Variance formatter.
 */
const formatVariance = (value) => {
    if (value === null || value === undefined) {
        return "—";
    }

    const number = Number(value);

    return `${number >= 0 ? "▲" : "▼"} ${Math.abs(number).toFixed(
        1
    )}%`;
};

/* ============================================================
   EXPORT MOCK
   ============================================================ */

const mockExportResult = {
    success: true,
    file_name: "Payables_Report_Due_Date_2024-04-30.xlsx",
    format: "xlsx",
    aging_basis: "Due Date",
    reporting_currency: "AED",
};

const BLUE = "#132a78";
const BLUE_2 = "#1d4ed8";
const BORDER = "#e3e8f2";
const TEXT = "#172554";
const MUTED = "#64748b";
const BG = "#f7f9fd";

const cardStyle = {
    background: "#fff",
    border: `1px solid #e2e8f0`,
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
};

function formatAxisMillions(value) {
    if (value === null || value === undefined || value === "") return "-";
    return `${(Number(value) / 1000000).toFixed(0)}M`;
}

/* ============================================================
   SMALL UI COMPONENTS
   ============================================================ */

function InfoIcon({ title }) {
    return (
        <span
            title={title}
            style={{
                display: "inline-flex",
                width: 15,
                height: 15,
                borderRadius: "50%",
                border: "1px solid #94a3b8",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: "#64748b",
                marginLeft: 5,
                cursor: "help",
            }}
        >
            i
        </span>
    );
}

function SectionTitle({ children, info, subtitle }) {
    const titleText = String(children ?? "");

    const defaultSubtitles = {
        "Payables Aging Summary": "Outstanding payables grouped by aging bucket",
        "Payables Trend": "Historical movement of total payables and DPO",
        "Payables by Parent Division": "Payable exposure across parent divisions",
        "Top 10 Suppliers by Payables": "Suppliers contributing the highest payable balances",
        "Overdue Summary": "Distribution of overdue payable exposure",
        "Payables by Sub-Division": "Payable exposure across sub-divisions",
        "Month-on-Month Payables": "Monthly payable balance movement",
    };

    const matchedSubtitle = Object.entries(defaultSubtitles).find(([key]) =>
        titleText.startsWith(key)
    )?.[1];

    return (
        <div style={{ marginBottom: 10, minWidth: 0 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    fontSize: "0.88rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    lineHeight: 1.2,
                }}
            >
                {children}
                {info && <InfoIcon title={info} />}
            </div>
            {(subtitle || matchedSubtitle) && (
                <div
                    style={{
                        marginTop: 3,
                        fontSize: "0.68rem",
                        fontWeight: 500,
                        color: "#64748b",
                        lineHeight: 1.35,
                    }}
                >
                    {subtitle || matchedSubtitle}
                </div>
            )}
        </div>
    );
}



function SectionActions({
    onViewAll,
    onExportExcel,
    onExportPdf,
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const runAction = (callback) => {
        setOpen(false);
        if (typeof callback === "function") callback();
    };

    const itemStyle = {
        width: "100%",
        height: 34,
        border: "none",
        background: "transparent",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "0 10px",
        color: "#334155",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
        textAlign: "left",
    };

    return (
        <div
            ref={menuRef}
            className="payables-action-menu"
            style={{
                position: "absolute",
                top: 9,
                right: 9,
                zIndex: 50,
            }}
        >
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label="More options"
                style={{
                    width: 28,
                    height: 28,
                    border: "none",
                    background: "transparent",
                    color: "#64748b",
                    borderRadius: 6,
                    fontSize: 20,
                    lineHeight: 1,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                }}
            >
                ⋮
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: 31,
                        right: 0,
                        width: 165,
                        padding: 5,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 9,
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.14)",
                        zIndex: 9999,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => runAction(onViewAll)}
                        style={itemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5ff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >

                        <span>🔎 View All</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => runAction(onExportExcel)}
                        style={itemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5ff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >

                        <span>📊 Export Excel</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => runAction(onExportPdf)}
                        style={itemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5ff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >

                        <span>📄 Export PDF</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function FilterSelect({
    label,
    value,
    options = [],
    onChange,
    multiple = false,
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    /* ==========================================================
       NORMALIZE SELECTED VALUES
    ========================================================== */
    const selectedValues = multiple
        ? Array.isArray(value)
            ? value
                .map((item) => {
                    if (
                        item &&
                        typeof item === "object" &&
                        !Array.isArray(item)
                    ) {
                        return item.value ?? item.id ?? item.label;
                    }

                    return item;
                })
                .filter(
                    (item) =>
                        item !== undefined &&
                        item !== null &&
                        String(item) !== ""
                )
            : value !== undefined &&
                value !== null &&
                value !== ""
                ? [
                    value &&
                        typeof value === "object" &&
                        !Array.isArray(value)
                        ? value.value ?? value.id ?? value.label
                        : value,
                ]
                : []
        : [];

    /* ==========================================================
       CLOSE WHEN CLICKING OUTSIDE
    ========================================================== */
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
                setSearch("");
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    /* ==========================================================
       NORMALIZE BACKEND OPTIONS
  
       Supports:
  
       ["AED", "USD"]
  
       AND:
  
       [
         {
           value: 1,
           label: "Alpha Ducts LLC"
         }
       ]
    ========================================================== */
    const normalizedOptions = useMemo(() => {
        const result = [];
        const seen = new Set();

        (options || []).forEach((option, index) => {
            if (
                option === null ||
                option === undefined
            ) {
                return;
            }

            let optionValue;
            let optionLabel;

            /* -----------------------------------------------
               BACKEND OBJECT
            ----------------------------------------------- */
            if (
                typeof option === "object" &&
                !Array.isArray(option)
            ) {
                optionValue =
                    option.value !== undefined &&
                        option.value !== null
                        ? option.value
                        : option.id !== undefined &&
                            option.id !== null
                            ? option.id
                            : option.label;

                optionLabel =
                    option.label !== undefined &&
                        option.label !== null
                        ? String(option.label)
                        : optionValue !== undefined &&
                            optionValue !== null
                            ? String(optionValue)
                            : "";
            } else {
                /* ---------------------------------------------
                   PRIMITIVE OPTION
                --------------------------------------------- */
                optionValue = option;
                optionLabel = String(option);
            }

            if (
                optionValue === undefined ||
                optionValue === null
            ) {
                return;
            }

            const normalizedValue = String(optionValue);

            /*
             * Prevent duplicate values from creating duplicate
             * React keys.
             */
            if (seen.has(normalizedValue)) {
                return;
            }

            seen.add(normalizedValue);

            result.push({
                value: optionValue,
                label: optionLabel,
                _key: `${normalizedValue}-${index}`,
            });
        });

        return result;
    }, [options]);

    /* ==========================================================
       REMOVE "ALL"
    ========================================================== */
    const finalOptions = normalizedOptions.filter(
        (option) =>
            String(option.label).trim().toLowerCase() !==
            "all"
    );

    /* ==========================================================
       SEARCH
    ========================================================== */
    const filteredOptions = finalOptions.filter(
        (option) =>
            String(option.label)
                .toLowerCase()
                .includes(search.toLowerCase())
    );

    /* ==========================================================
       SELECT ALL
    ========================================================== */
    const handleSelectAll = () => {
        if (!multiple) return;

        onChange(
            finalOptions.map(
                (option) => option.value
            )
        );
    };

    /* ==========================================================
       CLEAR
    ========================================================== */
    const handleClear = () => {
        if (!multiple) {
            onChange("");
        } else {
            onChange([]);
        }
    };

    /* ==========================================================
       INDIVIDUAL OPTION
    ========================================================== */
    const handleOptionClick = (option) => {
        /* -----------------------------------------------
           SINGLE SELECT
        ----------------------------------------------- */
        if (!multiple) {
            onChange(option.value);
            setOpen(false);
            setSearch("");
            return;
        }

        /* -----------------------------------------------
           MULTI SELECT
        ----------------------------------------------- */
        let nextValues = selectedValues.filter(
            (item) =>
                String(item).trim().toLowerCase() !==
                "all"
        );

        const optionValue = option.value;

        const alreadySelected = nextValues.some(
            (item) =>
                String(item) ===
                String(optionValue)
        );

        if (alreadySelected) {
            nextValues = nextValues.filter(
                (item) =>
                    String(item) !==
                    String(optionValue)
            );
        } else {
            nextValues = [
                ...nextValues,
                optionValue,
            ];
        }

        onChange(nextValues);
    };

    /* ==========================================================
       DISPLAY VALUE
    ========================================================== */
    const getDisplayValue = () => {
        /* -----------------------------------------------
           SINGLE SELECT
        ----------------------------------------------- */
        if (!multiple) {
            if (
                value === undefined ||
                value === null ||
                String(value) === ""
            ) {
                return "Select";
            }

            const actualValue =
                value &&
                    typeof value === "object" &&
                    !Array.isArray(value)
                    ? value.value ??
                    value.id ??
                    value.label
                    : value;

            const selectedOption =
                finalOptions.find(
                    (option) =>
                        String(option.value) ===
                        String(actualValue)
                );

            return selectedOption
                ? selectedOption.label
                : String(actualValue);
        }

        /* -----------------------------------------------
           MULTI SELECT
        ----------------------------------------------- */
        if (selectedValues.length === 0) {
            return "Select";
        }

        if (selectedValues.length === 1) {
            const selectedOption =
                finalOptions.find(
                    (option) =>
                        String(option.value) ===
                        String(selectedValues[0])
                );

            return selectedOption
                ? selectedOption.label
                : String(selectedValues[0]);
        }

        return `${selectedValues.length} selected`;
    };

    /* ==========================================================
       ALL SELECTED
    ========================================================== */
    const allSelected =
        multiple &&
        finalOptions.length > 0 &&
        finalOptions.every((option) =>
            selectedValues.some(
                (item) =>
                    String(item) ===
                    String(option.value)
            )
        );

    return (
        <div
            ref={dropdownRef}
            style={{
                flex: "1 1 0",
                minWidth: 0,
                position: "relative",
            }}
        >
            {/* =====================================================
          LABEL
      ===================================================== */}
            <label
                style={{
                    display: "block",
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#1e3a8a",
                    marginBottom: 4,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                }}
            >
                {label}
            </label>

            {/* =====================================================
          FIELD
      ===================================================== */}
            <button
                type="button"
                onClick={() => {
                    setOpen((prev) => !prev);

                    if (open) {
                        setSearch("");
                    }
                }}
                style={{
                    width: "100%",
                    height: 32,
                    boxSizing: "border-box",
                    border: open
                        ? "1px solid #818cf8"
                        : "1px solid #e2e8f0",
                    borderRadius: 7,
                    padding: "0 28px 0 10px",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    outline: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                }}
            >
                {getDisplayValue()}

                <span
                    style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: `translateY(-50%) ${open
                            ? "rotate(180deg)"
                            : "rotate(0deg)"
                            }`,
                        fontSize: 9,
                        color: "#94a3b8",
                        transition:
                            "transform 0.15s ease",
                        pointerEvents: "none",
                    }}
                >
                    ▼
                </span>
            </button>

            {/* =====================================================
          DROPDOWN
      ===================================================== */}
            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 5px)",
                        left: 0,
                        width: "100%",
                        minWidth: 190,
                        background: "#ffffff",
                        border: "1px solid #dce3ee",
                        borderRadius: 9,
                        boxShadow:
                            "0 8px 24px rgba(24, 45, 80, 0.14)",
                        zIndex: 9999,
                        overflow: "hidden",
                    }}
                >
                    {/* =================================================
              SEARCH
          ================================================= */}
                    <div
                        style={{
                            padding: "8px 8px 6px",
                            borderBottom:
                                "1px solid #edf1f7",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                            }}
                        >
                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
                                placeholder={`Search ${label}`}
                                autoFocus
                                style={{
                                    width: "100%",
                                    height: 30,
                                    boxSizing: "border-box",
                                    border:
                                        "1px solid #dce3ee",
                                    borderRadius: 7,
                                    padding:
                                        "0 9px 0 28px",
                                    background: "#f8fafc",
                                    color: "#24366b",
                                    fontSize: 10.5,
                                    outline: "none",
                                }}
                            />

                            <span
                                style={{
                                    position: "absolute",
                                    left: 9,
                                    top: "50%",
                                    transform:
                                        "translateY(-50%)",
                                    color: "#64748b",
                                    fontSize: 12,
                                    pointerEvents: "none",
                                }}
                            >
                                🔍
                            </span>
                        </div>
                    </div>

                    {/* =================================================
              SELECT ALL / CLEAR
          ================================================= */}
                    {multiple && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "space-between",
                                padding: "7px 9px",
                                borderBottom:
                                    "1px solid #edf1f7",
                                background: "#fafbfe",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    if (allSelected) {
                                        onChange([]);
                                    } else {
                                        handleSelectAll();
                                    }
                                }}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#4f46e5",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                {allSelected
                                    ? "Unselect All"
                                    : "Select All"}
                            </button>

                            <button
                                type="button"
                                onClick={handleClear}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#64748b",
                                    fontSize: 10,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    )}

                    {/* =================================================
              OPTIONS
          ================================================= */}
                    <div
                        style={{
                            maxHeight: 230,
                            overflowY: "auto",
                            padding: "4px 0",
                        }}
                    >
                        {filteredOptions.length === 0 ? (
                            <div
                                style={{
                                    padding: "14px 10px",
                                    textAlign: "center",
                                    color: "#94a3b8",
                                    fontSize: 10.5,
                                }}
                            >
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map(
                                (option) => {
                                    const selected =
                                        multiple
                                            ? selectedValues.some(
                                                (item) =>
                                                    String(item) ===
                                                    String(
                                                        option.value
                                                    )
                                            )
                                            : String(
                                                value ?? ""
                                            ) ===
                                            String(
                                                option.value
                                            );

                                    return (
                                        <button
                                            key={option._key}
                                            type="button"
                                            onClick={() =>
                                                handleOptionClick(
                                                    option
                                                )
                                            }
                                            style={{
                                                width: "100%",
                                                minHeight: 31,
                                                display: "flex",
                                                alignItems:
                                                    "center",
                                                gap: 8,
                                                padding:
                                                    "5px 10px",
                                                border: "none",
                                                background:
                                                    selected
                                                        ? "#eef2ff"
                                                        : "#ffffff",
                                                color: selected
                                                    ? "#243b8f"
                                                    : "#334155",
                                                fontSize: 10.5,
                                                fontWeight:
                                                    selected
                                                        ? 700
                                                        : 500,
                                                cursor:
                                                    "pointer",
                                                textAlign: "left",
                                            }}
                                        >
                                            {/* CHECKBOX */}
                                            {multiple && (
                                                <span
                                                    style={{
                                                        width: 14,
                                                        height: 14,
                                                        minWidth: 14,
                                                        borderRadius: 3,
                                                        border:
                                                            selected
                                                                ? "1px solid #5b5bea"
                                                                : "1px solid #cbd5e1",
                                                        background:
                                                            selected
                                                                ? "#5b5bea"
                                                                : "#ffffff",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        color:
                                                            "#ffffff",
                                                        fontSize: 9,
                                                        fontWeight: 800,
                                                        boxSizing:
                                                            "border-box",
                                                    }}
                                                >
                                                    {selected
                                                        ? "✓"
                                                        : ""}
                                                </span>
                                            )}

                                            <span
                                                style={{
                                                    overflow:
                                                        "hidden",
                                                    textOverflow:
                                                        "ellipsis",
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                                title={
                                                    option.label
                                                }
                                            >
                                                {option.label}
                                            </span>
                                        </button>
                                    );
                                }
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ============================================================
   DATE DISPLAY
============================================================ */
function formatDateDisplay(dateValue) {
    if (
        dateValue === undefined ||
        dateValue === null ||
        dateValue === ""
    ) {
        return "";
    }

    /*
     * Safety:
     * If backend/date option is accidentally passed
     * as an object, extract the actual value.
     */
    let actualValue = dateValue;

    if (
        typeof dateValue === "object" &&
        !Array.isArray(dateValue)
    ) {
        actualValue =
            dateValue.value ??
            dateValue.date ??
            dateValue.as_on_date ??
            dateValue.label ??
            "";
    }

    const dateString = String(
        actualValue
    ).trim();

    if (!dateString) {
        return "";
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    const [year, month, day] = parts;

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return dateString;
    }

    // As-On-Date is displayed everywhere as yyyy-mm-dd.
    const normalized = toApiDate(dateString);
    return normalized || dateString;
}

/* ============================================================
   COMMON EMPTY STATE / KPI ANIMATION
============================================================ */
function NoDataAvailable({ minHeight = 180 }) {
    return (
        <div
            style={{
                width: "100%",
                minHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: 12,
                fontWeight: 700,
                textAlign: "center",
            }}
        >
            No Data Available
        </div>
    );
}

function AnimatedNumber({ value, formatter, duration = 700 }) {
    const numericValue = Number(value);
    const target = Number.isFinite(numericValue) ? numericValue : 0;
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let frameId;
        const start = performance.now();

        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(target * eased);

            if (progress < 1) {
                frameId = requestAnimationFrame(animate);
            }
        };

        setDisplayValue(0);
        frameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frameId);
    }, [target, duration]);

    return <>{formatter(displayValue)}</>;
}

/* ============================================================
   DATE FILTER
============================================================ */
function DateFilter({
    value,
    onChange,
}) {
    const dateInputRef = useRef(null);

    const selectedValue =
        value && typeof value === "object" && !Array.isArray(value)
            ? String(
                value.value ??
                value.date ??
                value.as_on_date ??
                value.label ??
                ""
            )
            : String(value ?? "");

    const openCalendar = () => {
        const input = dateInputRef.current;
        if (!input) return;

        if (typeof input.showPicker === "function") {
            try {
                input.showPicker();
                return;
            } catch (error) {
                // Fall back to the native date input when showPicker is unavailable.
            }
        }

        input.focus();
        input.click();
    };

    const handleDateChange = (event) => {
        const nextDate = event.target.value;
        if (!nextDate) return;

        // Immediately send the selected YYYY-MM-DD value to the parent.
        onChange(nextDate);
    };

    return (
        <div
            style={{
                flex: "1 1 0",
                minWidth: 0,
                position: "relative",
            }}
        >
            <label
                style={{
                    display: "block",
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#1e3a8a",
                    marginBottom: 4,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                }}
            >
                As On Date
            </label>

            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: 32,
                }}
                onClick={openCalendar}
            >
                <input
                    ref={dateInputRef}
                    type="date"
                    value={selectedValue}
                    onChange={handleDateChange}
                    aria-label="As On Date"
                    style={{
                        width: "100%",
                        height: 32,
                        boxSizing: "border-box",
                        border: "1px solid #e2e8f0",
                        borderRadius: 7,
                        padding: "0 30px 0 26px",
                        background: "#ffffff",
                        color: "#334155",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        outline: "none",
                        cursor: "pointer",
                    }}
                />

                <span
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 15,
                        lineHeight: 1,
                        pointerEvents: "none",
                    }}
                >
                    📅
                </span>
            </div>
        </div>
    );
}

function KpiCard({
    title,
    value,
    variance,
    previousDate,
    icon,
    iconBg,
    iconColor,
    cardBg,
    currency,
    suffix,
    onClick,
}) {
    const formatValue = (value) => {
        if (value === null || value === undefined) return "—";

        // DPO
        if (suffix === "Days") {
            return `${Number(value).toFixed(0)} Days`;
        }

        // Currency values
        if (Number(value) >= 1000000) {
            return `${currency} ${(Number(value) / 1000000).toFixed(2)}M`;
        }

        if (Number(value) >= 1000) {
            return `${currency} ${(Number(value) / 1000).toFixed(2)}K`;
        }

        return `${currency} ${Number(value).toFixed(2)}`;
    };

    const numericValue = Number(value);
    const isNegativeValue =
        Number.isFinite(numericValue) && numericValue < 0;
    const isPositive = Number(variance) >= 0;

    return (
        <div
            className="sales-style-kpi"
            onClick={typeof onClick === "function" ? onClick : undefined}
            style={{
                background: cardBg || "#ffffff",
                borderRadius: 12,
                padding: "10px 10px",
                boxShadow: "none",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: typeof onClick === "function" ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                gap: 8,
                overflow: "visible",
                position: "relative",
                minHeight: 74,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${iconColor || "#2563eb"}20`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            <div
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: iconBg || "#f1f5f9",
                    color: iconColor || "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minWidth: 0,
                    flex: 1,
                    justifyContent: "center",
                }}
            >
                <span
                    style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: iconColor || "#2563eb",
                        lineHeight: 1.2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word",
                    }}
                >
                    {title}
                </span>

                <div
                    style={{
                        fontSize: "1.02rem",
                        fontWeight: 800,
                        color: "#0f172a",
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word",
                    }}
                >
                    {value === null || value === undefined || value === "" ? "—" : <AnimatedNumber value={value} formatter={formatValue} />}
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexWrap: "wrap",
                        fontSize: "0.62rem",
                        fontWeight: 600,
                        color: "#64748b",
                        lineHeight: 1.1,
                    }}
                >
                    {variance !== null && variance !== undefined ? (
                        <span style={{ color: isPositive ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                            {isPositive ? "▲" : "▼"} {Math.abs(Number(variance)).toFixed(1)}%
                        </span>
                    ) : null}
                    {previousDate && <span>vs {previousDate}</span>}
                </div>
            </div>
        </div>
    )
}


/* ============================================================
   DONUT CHART
   ============================================================ */

function DonutChart({
    data,
    total,
    currency,
    centerLabel,
    legendBelow = false,
    onSegmentClick,

    // ============================================================
    // NEW:
    // Enable only for Overdue Summary
    // ============================================================
    largeOverdueChart = false,
}) {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const colors = [
        "#1665e8",
        "#0e9f75",
        "#f59e0b",
        "#7c3aed",
        "#ef6b82",
        "#f59ab5",
        "#c026d3",
        "#be185d",
    ];

    // ============================================================
    // DONUT SIZE
    // Normal charts remain unchanged.
    // Overdue Summary can use larger size.
    // ============================================================

    const donutSize = largeOverdueChart ? 205 : 175;
    const donutCenter = donutSize / 2;

    const radius = largeOverdueChart ? 76 : 65;
    const strokeWidth = largeOverdueChart ? 28 : 25;

    const circumference = 2 * Math.PI * radius;

    const hasData =
        Array.isArray(data) && data.length > 0;

    if (!hasData) {
        return (
            <div
                style={{
                    minHeight: legendBelow ? 250 : 185,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: MUTED,
                    fontSize: 11,
                    fontWeight: 700,
                }}
            >
                No data available
            </div>
        );
    }

    /*
     * The Payables aging API can return negative percentages.
     * Use absolute values only for donut geometry so every
     * bucket remains visible.
     */
    const normalizedData = Array.isArray(data) ? data : [];

    const segmentWeights = normalizedData.map((item) =>
        Math.abs(
            Number(
                item.percentage ??
                item.percentage_of_total ??
                0
            )
        )
    );

    const totalSegmentWeight = segmentWeights.reduce(
        (sum, value) => sum + value,
        0
    );

    let accumulated = 0;

    /* ==========================================================
       CLICK SEGMENT
    ========================================================== */
    const handleSegmentClick = (index) => {
        setSelectedIndex((prev) =>
            prev === index ? null : index
        );

        if (typeof onSegmentClick === "function") {
            onSegmentClick(
                normalizedData[index],
                index
            );
        }
    };

    /* ==========================================================
       GET SEGMENT POSITION
       Existing CLICK behavior preserved.
    ========================================================== */
    const getSegmentTransform = (
        startLength,
        segmentLength,
        active
    ) => {
        if (!active) {
            return `rotate(-90 ${donutCenter} ${donutCenter})`;
        }

        const startAngle =
            (startLength / circumference) * 360 - 90;

        const segmentAngle =
            (segmentLength / circumference) * 360;

        const middleAngle =
            startAngle + segmentAngle / 2;

        const angleInRadians =
            (middleAngle * Math.PI) / 180;

        const offset = 8;

        const translateX =
            Math.cos(angleInRadians) * offset;

        const translateY =
            Math.sin(angleInRadians) * offset;

        return `
            translate(${translateX} ${translateY})
            rotate(-90 ${donutCenter} ${donutCenter})
        `;
    };

    return (
        <div
            style={{
                display: "flex",

                /*
                 * Keep existing row/column behavior.
                 */
                flexDirection: legendBelow
                    ? "column"
                    : "row",

                /*
                 * For the larger Overdue chart,
                 * create more separation between
                 * donut and legend.
                 */
                gap: legendBelow
                    ? largeOverdueChart
                        ? 32
                        : 24
                    : largeOverdueChart
                        ? 34
                        : 20,

                minHeight: legendBelow
                    ? largeOverdueChart
                        ? 285
                        : 250
                    : largeOverdueChart
                        ? 225
                        : 185,

                position: "relative",

                /*
                 * Give the larger chart a little more
                 * horizontal breathing room.
                 */
                padding:
                    largeOverdueChart && !legendBelow
                        ? "4px 4px 4px 8px"
                        : 0,

                boxSizing: "border-box",
            }}
        >
            {/* =====================================================
                DONUT
            ===================================================== */}
            <div
                style={{
                    width: donutSize,
                    minWidth: donutSize,
                    height: donutSize,
                    position: "relative",

                    /*
                     * Extra spacing below/around the
                     * Overdue Summary donut.
                     */
                    marginBottom:
                        largeOverdueChart && legendBelow
                            ? 8
                            : 0,
                }}
            >
                <svg
                    width={donutSize}
                    height={donutSize}
                    viewBox={`0 0 ${donutSize} ${donutSize}`}
                    style={{
                        overflow: "visible",
                    }}
                >
                    {/* =================================================
                        BACKGROUND RING
                    ================================================= */}
                    <circle
                        cx={donutCenter}
                        cy={donutCenter}
                        r={radius}
                        fill="none"
                        stroke="#eef2f7"
                        strokeWidth={strokeWidth}
                    />

                    {/* =================================================
                        DONUT SEGMENTS
                    ================================================= */}
                    {normalizedData.map(
                        (item, index) => {
                            const weight =
                                segmentWeights[index] ||
                                0;

                            const percent =
                                totalSegmentWeight > 0
                                    ? weight /
                                    totalSegmentWeight
                                    : 0;

                            const length =
                                circumference *
                                percent;

                            const offset =
                                -accumulated;

                            const segmentStart =
                                accumulated;

                            accumulated += length;

                            const isSelected =
                                selectedIndex ===
                                index;

                            const isHovered =
                                hoveredIndex ===
                                index;

                            /*
                             * When hovering one segment:
                             *
                             * Hovered segment = enabled
                             * Other segments = disabled
                             */
                            const hasHover =
                                hoveredIndex !==
                                null;

                            const isHoverTarget =
                                hoveredIndex ===
                                index;

                            const isDisabledByHover =
                                hasHover &&
                                !isHoverTarget;

                            /*
                             * Click selection continues
                             * to work exactly as before.
                             */
                            const isActive =
                                isSelected;

                            return (
                                <circle
                                    key={`donut-segment-${index}-${item.bucket_code ?? item.bucket_name ?? item.bucket ?? "segment"}`}
                                    cx={donutCenter}
                                    cy={donutCenter}
                                    r={radius}
                                    fill="none"
                                    stroke={
                                        colors[
                                        index %
                                        colors.length
                                        ]
                                    }
                                    strokeWidth={
                                        isActive ||
                                            isHoverTarget
                                            ? largeOverdueChart
                                                ? 32
                                                : 29
                                            : strokeWidth
                                    }
                                    strokeDasharray={`${length} ${circumference -
                                        length
                                        }`}
                                    strokeDashoffset={
                                        offset
                                    }
                                    transform={getSegmentTransform(
                                        segmentStart,
                                        length,
                                        isActive
                                    )}
                                    strokeLinecap="butt"
                                    style={{
                                        cursor: "pointer",

                                        /*
                                         * Hover behavior
                                         */
                                        opacity:
                                            isDisabledByHover
                                                ? 0.16
                                                : selectedIndex !==
                                                    null &&
                                                    !isSelected
                                                    ? isHovered
                                                        ? 0.82
                                                        : 0.55
                                                    : 1,

                                        /*
                                         * Hovered segment glow.
                                         */
                                        filter: isHoverTarget
                                            ? `drop-shadow(0 0 7px ${colors[
                                            index %
                                            colors.length
                                            ]
                                            }88)`
                                            : isSelected
                                                ? "drop-shadow(0 4px 7px rgba(0,0,0,0.20))"
                                                : "none",

                                        transition:
                                            "opacity 0.25s ease, filter 0.25s ease, stroke-width 0.2s ease",
                                    }}
                                    onMouseEnter={() =>
                                        setHoveredIndex(
                                            index
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setHoveredIndex(
                                            null
                                        )
                                    }
                                    onClick={() =>
                                        handleSegmentClick(
                                            index
                                        )
                                    }
                                />
                            );
                        }
                    )}
                </svg>

                {/* ===================================================
                    CENTER VALUE
                    Hidden ONLY when a segment is selected
                =================================================== */}
                {selectedIndex === null && (
                    <div
                        style={{
                            position:
                                "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection:
                                "column",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            color: "#000000",
                            pointerEvents:
                                "none",
                            transition:
                                "opacity 0.2s ease",
                        }}
                    >
                        <div
                            style={{
                                fontSize:
                                    largeOverdueChart
                                        ? 18
                                        : 16,
                                fontWeight: 800,
                            }}
                        >
                            {formatPayablesCompact(
                                total,
                                currency
                            )}
                        </div>

                        <div
                            style={{
                                fontSize:
                                    largeOverdueChart
                                        ? 12
                                        : 11,
                                fontWeight: 700,
                            }}
                        >
                            {centerLabel}
                        </div>
                    </div>
                )}

                {/* ===================================================
                    TOOLTIP
                =================================================== */}
                {hoveredIndex !== null &&
                    normalizedData[
                    hoveredIndex
                    ] && (
                        <div
                            style={{
                                position:
                                    "absolute",
                                left: "50%",
                                top: "50%",
                                transform:
                                    "translate(-50%, -50%)",

                                minWidth: 180,
                                background:
                                    "#ffffff",
                                border:
                                    "1px solid #e5eaf2",
                                borderRadius: 16,
                                padding:
                                    "14px 16px",
                                boxShadow:
                                    "0 12px 30px rgba(24,45,80,0.16)",
                                zIndex: 50,
                                pointerEvents:
                                    "none",
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            {/* TOOLTIP TITLE */}
                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: 8,
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: "#17213c",
                                    marginBottom: 12,
                                }}
                            >
                                <span
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 2,
                                        background:
                                            colors[
                                            hoveredIndex %
                                            colors.length
                                            ],
                                        display:
                                            "inline-block",
                                        flexShrink: 0,
                                    }}
                                />

                                {normalizedData[
                                    hoveredIndex
                                ]
                                    .bucket_name ??
                                    normalizedData[
                                        hoveredIndex
                                    ].bucket ??
                                    normalizedData[
                                        hoveredIndex
                                    ].bucket_code}
                            </div>

                            {/* AMOUNT */}
                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    gap: 24,
                                    marginBottom: 9,
                                    fontSize: 11,
                                }}
                            >
                                <span
                                    style={{
                                        color: "#718096",
                                    }}
                                >
                                    Amount
                                </span>

                                <strong
                                    style={{
                                        color:
                                            colors[
                                            hoveredIndex %
                                            colors.length
                                            ],
                                        fontSize: 13,
                                    }}
                                >
                                    {formatPayablesCompact(
                                        normalizedData[
                                            hoveredIndex
                                        ].amount,
                                        currency
                                    )}
                                </strong>
                            </div>

                            {/* SHARE / PERCENTAGE */}
                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    gap: 24,
                                    fontSize: 11,
                                }}
                            >
                                <span
                                    style={{
                                        color: "#718096",
                                    }}
                                >
                                    Share
                                </span>

                                <strong
                                    style={{
                                        color:
                                            colors[
                                            hoveredIndex %
                                            colors.length
                                            ],
                                        fontSize: 13,
                                    }}
                                >
                                    {formatPercentage(
                                        normalizedData[
                                            hoveredIndex
                                        ]
                                            .percentage ??
                                        normalizedData[
                                            hoveredIndex
                                        ]
                                            .percentage_of_total
                                    )}
                                </strong>
                            </div>
                        </div>
                    )}
            </div>

            {/* =====================================================
                LEGEND
            ===================================================== */}
            <div
                style={{
                    flex: legendBelow
                        ? "none"
                        : 1,

                    width: legendBelow
                        ? "100%"
                        : "auto",

                    minWidth: 0,

                    /*
                     * IMPORTANT:
                     * More gap between donut and legend
                     * only for the larger Overdue chart.
                     */
                    marginLeft:
                        !legendBelow &&
                            largeOverdueChart
                            ? 10
                            : 0,

                    /*
                     * If legend is below the donut,
                     * keep clear separation.
                     */
                    marginTop:
                        legendBelow
                            ? largeOverdueChart
                                ? 8
                                : 0
                            : 0,
                }}
            >
                {normalizedData.map(
                    (item, index) => {
                        const isSelected =
                            selectedIndex ===
                            index;

                        const isHovered =
                            hoveredIndex ===
                            index;

                        const isActive =
                            isSelected ||
                            isHovered;

                        return (
                            <div
                                key={`donut-legend-${index}-${item.bucket_code ?? item.bucket_name ?? item.bucket ?? "bucket"}`}
                                onClick={() =>
                                    handleSegmentClick(
                                        index
                                    )
                                }
                                onMouseEnter={() =>
                                    setHoveredIndex(
                                        index
                                    )
                                }
                                onMouseLeave={() =>
                                    setHoveredIndex(
                                        null
                                    )
                                }
                                style={{
                                    display:
                                        "flex",

                                    alignItems:
                                        "flex-start",

                                    gap: 8,

                                    /*
                                     * Increased legend
                                     * vertical spacing.
                                     */
                                    marginBottom:
                                        largeOverdueChart
                                            ? 21
                                            : 16,

                                    fontSize: 12,
                                    color: "#334155",
                                    cursor: "pointer",

                                    padding:
                                        "5px 7px",

                                    borderRadius: 7,

                                    background:
                                        isSelected
                                            ? "#f1f5ff"
                                            : isHovered
                                                ? "#f8fafc"
                                                : "transparent",

                                    borderLeft:
                                        isActive
                                            ? `3px solid ${colors[
                                            index %
                                            colors.length
                                            ]
                                            }`
                                            : "3px solid transparent",

                                    transform:
                                        isHovered
                                            ? "translateX(3px)"
                                            : "translateX(0)",

                                    transition:
                                        "background 0.2s ease, transform 0.2s ease, border-left 0.2s ease",

                                    /*
                                     * IMPORTANT:
                                     * Allow long bucket names
                                     * to use maximum 2 rows.
                                     */
                                    minHeight:
                                        largeOverdueChart
                                            ? 34
                                            : "auto",

                                    boxSizing:
                                        "border-box",
                                }}
                            >
                                {/* =================================================
                                    SQUARE COLOR INDICATOR
                                ================================================= */}
                                <span
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 2,
                                        background:
                                            colors[
                                            index %
                                            colors.length
                                            ],
                                        display:
                                            "inline-block",
                                        flexShrink: 0,

                                        boxShadow:
                                            isActive
                                                ? `0 0 0 3px ${colors[
                                                index %
                                                colors.length
                                                ]
                                                }22`
                                                : "none",

                                        transition:
                                            "box-shadow 0.2s ease",

                                        marginTop: 3,
                                    }}
                                />

                                {/* =================================================
                                    BUCKET NAME
                                    Maximum 2 rows
                                ================================================= */}
                                <span
                                    style={{
                                        flex: 1,

                                        /*
                                         * Allow wrapping.
                                         */
                                        whiteSpace:
                                            "normal",

                                        overflow:
                                            "hidden",

                                        display:
                                            "-webkit-box",

                                        WebkitBoxOrient:
                                            "vertical",

                                        WebkitLineClamp:
                                            2,

                                        lineHeight:
                                            "16px",

                                        minWidth: 0,

                                        wordBreak:
                                            "break-word",

                                        fontWeight:
                                            isActive
                                                ? 800
                                                : 700,
                                    }}
                                >
                                    {item.bucket_name ??
                                        item.bucket ??
                                        item.bucket_code}
                                </span>

                                {/* =================================================
                                    AMOUNT
                                    Same color as donut segment
                                ================================================= */}
                                <strong
                                    style={{
                                        color:
                                            colors[
                                            index %
                                            colors.length
                                            ],

                                        whiteSpace:
                                            "nowrap",

                                        flexShrink: 0,

                                        fontWeight:
                                            isActive
                                                ? 800
                                                : 700,

                                        lineHeight:
                                            "16px",
                                    }}
                                >
                                    {(
                                        Number(
                                            item.amount ||
                                            0
                                        ) /
                                        1000000
                                    ).toFixed(2)}
                                    M
                                </strong>

                                {/* =================================================
                                    PERCENTAGE
                                ================================================= */}
                                <span
                                    style={{
                                        color:
                                            isActive
                                                ? colors[
                                                index %
                                                colors.length
                                                ]
                                                : "#64748b",

                                        minWidth: 36,

                                        whiteSpace:
                                            "nowrap",

                                        flexShrink: 0,

                                        fontWeight:
                                            isActive
                                                ? 700
                                                : 500,

                                        lineHeight:
                                            "16px",

                                        transition:
                                            "color 0.2s ease",
                                    }}
                                >
                                    (
                                    {formatPercentage(
                                        item.percentage ??
                                        item.percentage_of_total
                                    )}
                                    )
                                </span>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
}

/* ============================================================
   TREND CHART
   ============================================================ */

function TrendChart({ data, currency, onPointClick }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Load animation state
    const [chartLoaded, setChartLoaded] = useState(false);

    useEffect(() => {
        // Start the chart animation after the first render
        const frame = requestAnimationFrame(() => {
            setChartLoaded(true);
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    const maxValue = Math.max(
        0,
        ...data.map((item) =>
            Number(item.total_payables || 0)
        )
    );

    const hasData =
        Array.isArray(data) && data.length > 0;

    if (!hasData) {
        return (
            <div
                style={{
                    minHeight: 190,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: MUTED,
                    fontSize: 11,
                    fontWeight: 700,
                }}
            >
                No data available
            </div>
        );
    }

    return (
        <div
            style={{
                width: "100%",
                overflowX: "hidden",
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: 220,
                    position: "relative",
                    padding: "10px 10px 35px 45px",
                    boxSizing: "border-box",
                }}
            >
                {/* =====================================================
                    GRID LINES
                ===================================================== */}
                {[0, 1, 2, 3, 4].map((line) => (
                    <div
                        key={line}
                        style={{
                            position: "absolute",
                            left: 45,
                            right: 10,
                            top: 15 + line * 36,
                            borderTop:
                                "1px dashed #e2e8f0",
                        }}
                    />
                ))}

                {/* =====================================================
                    Y AXIS LABEL - CURRENCY
                ===================================================== */}
                <div
                    style={{
                        position: "absolute",
                        left: 3,
                        top: 5,
                        fontSize: 10, fontWeight: 700,
                        color: MUTED,
                    }}
                >
                    {currency} (M)
                </div>

                {/* =====================================================
                    Y AXIS MID VALUE
                ===================================================== */}
                <div
                    style={{
                        position: "absolute",
                        left: 3,
                        top: 78,
                        fontSize: 10, fontWeight: 700,
                        color: MUTED,
                    }}
                >
                    {formatAxisMillions(
                        maxValue / 2
                    )}
                </div>

                {/* =====================================================
                    Y AXIS ZERO
                ===================================================== */}
                <div
                    style={{
                        position: "absolute",
                        left: 18,
                        bottom: 42,
                        fontSize: 10, fontWeight: 700,
                        color: "MUTED",
                    }}
                >
                    0
                </div>

                {/* =====================================================
                    BARS
                ===================================================== */}
                <div
                    style={{
                        position: "absolute",
                        left: 55,
                        right: 15,
                        bottom: 35,
                        height: 150,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent:
                            "space-between",
                        gap: 2,
                    }}
                >
                    {data.map((item, index) => {
                        const height =
                            maxValue > 0
                                ? (Number(
                                    item.total_payables
                                ) /
                                    maxValue) *
                                125
                                : 0;

                        const isHovered =
                            hoveredIndex === index;

                        return (
                            <div
                                key={item.month}
                                style={{
                                    flex: 1,
                                    height: 150,
                                    position: "relative",
                                    display: "flex",
                                    flexDirection:
                                        "column",
                                    justifyContent:
                                        "flex-end",
                                    alignItems:
                                        "center",
                                    cursor:
                                        typeof onPointClick ===
                                            "function"
                                            ? "pointer"
                                            : "default",

                                    /*
                                     * Small lift when hovering.
                                     * Does not affect layout.
                                     */
                                    transform:
                                        isHovered
                                            ? "translateY(-3px)"
                                            : "translateY(0)",

                                    transition:
                                        "transform 0.2s ease",
                                }}
                                onMouseEnter={() =>
                                    setHoveredIndex(
                                        index
                                    )
                                }
                                onMouseLeave={() =>
                                    setHoveredIndex(
                                        null
                                    )
                                }
                                onClick={() => {
                                    if (
                                        typeof onPointClick ===
                                        "function"
                                    ) {
                                        onPointClick(
                                            item,
                                            index
                                        );
                                    }
                                }}
                            >
                                {/* =================================================
                                    TOOLTIP
                                ================================================= */}
                                {isHovered && (
                                    <div
                                        style={{
                                            position:
                                                "absolute",

                                            top: 5,

                                            left: "50%",
                                            transform:
                                                "translateX(-50%)",

                                            minWidth: 160,
                                            maxWidth: 190,

                                            background:
                                                "#ffffff",
                                            border:
                                                "1px solid #dce3ee",
                                            borderRadius: 8,

                                            padding:
                                                "9px 11px",

                                            boxShadow:
                                                "0 8px 22px rgba(24, 45, 80, 0.16)",

                                            zIndex: 1000,
                                            pointerEvents:
                                                "none",

                                            whiteSpace:
                                                "normal",
                                            boxSizing:
                                                "border-box",
                                        }}
                                    >
                                        {/* Month */}
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 800,
                                                color: "#24366b",
                                                marginBottom: 7,
                                            }}
                                        >
                                            {item.month}
                                        </div>

                                        {/* Total Payables */}
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                gap: 15,
                                                fontSize: 11,
                                                fontWeight: 800,
                                                marginBottom: 5,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "#64748b",
                                                }}
                                            >
                                                Total
                                                Payables
                                            </span>

                                            <strong
                                                style={{
                                                    color: BLUE,
                                                }}
                                            >
                                                {formatPayablesCompact(
                                                    item.total_payables,
                                                    currency
                                                )}
                                            </strong>
                                        </div>

                                        {/* DPO */}
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                gap: 15,
                                                fontSize: 11,
                                                fontWeight: 800,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "#64748b",
                                                }}
                                            >
                                                DPO
                                            </span>

                                            <strong
                                                style={{
                                                    color: "#0e9f75",
                                                }}
                                            >
                                                {Number(
                                                    item.dpo ||
                                                    0
                                                ).toFixed(
                                                    1
                                                )}{" "}
                                                Days
                                            </strong>
                                        </div>
                                    </div>
                                )}

                                {/* =================================================
                                    VALUE ABOVE BAR
                                    Increased size + hover emphasis
                                ================================================= */}
                                <div
                                    style={{
                                        fontSize:
                                            isHovered
                                                ? 13
                                                : 12,

                                        color: BLUE,

                                        fontWeight: 900,

                                        marginBottom: 5,

                                        letterSpacing:
                                            "-0.15px",

                                        transform:
                                            isHovered
                                                ? "translateY(-2px) scale(1.04)"
                                                : "translateY(0) scale(1)",

                                        opacity: 1,

                                        transition:
                                            "font-size 0.15s ease, transform 0.2s ease, opacity 0.15s ease",

                                        whiteSpace:
                                            "nowrap",
                                    }}
                                >
                                    {(
                                        Number(
                                            item.total_payables
                                        ) / 1000000
                                    ).toFixed(2)}
                                </div>

                                {/* =================================================
                                    BAR
                                    Stylish animated bar
                                ================================================= */}
                                <div
                                    style={{
                                        width: isHovered
                                            ? "82%"
                                            : "72%",

                                        maxWidth: 42,

                                        height: chartLoaded
                                            ? height
                                            : 0,

                                        minHeight:
                                            chartLoaded
                                                ? 4
                                                : 0,

                                        /*
                                         * Stylish gradient
                                         */
                                        background:
                                            "linear-gradient(180deg, #5b5bea 0%, #3f46c6 55%, #3038a8 100%)",

                                        /*
                                         * More rounded top
                                         */
                                        borderRadius:
                                            "7px 7px 2px 2px",

                                        cursor: "pointer",

                                        /*
                                         * Hover becomes brighter
                                         */
                                        opacity:
                                            isHovered
                                                ? 1
                                                : 0.94,

                                        /*
                                         * Stylish shadow
                                         */
                                        boxShadow:
                                            isHovered
                                                ? "0 6px 16px rgba(91, 91, 234, 0.38)"
                                                : "0 3px 8px rgba(91, 91, 234, 0.16)",

                                        /*
                                         * Subtle border
                                         */
                                        border:
                                            "1px solid rgba(255,255,255,0.25)",

                                        boxSizing:
                                            "border-box",

                                        /*
                                         * Existing load animation
                                         * + hover animation
                                         */
                                        transition:
                                            "height 0.65s cubic-bezier(0.22, 1, 0.36, 1), " +
                                            "width 0.18s ease, " +
                                            "opacity 0.18s ease, " +
                                            "box-shadow 0.2s ease, " +
                                            "border-radius 0.2s ease",

                                        /*
                                         * Keep staggered load animation
                                         */
                                        transitionDelay:
                                            chartLoaded
                                                ? `${index * 45}ms`
                                                : "0ms",
                                    }}
                                />

                                {/* =================================================
                                    MONTH
                                ================================================= */}
                                <div
                                    style={{
                                        position:
                                            "absolute",
                                        bottom: -25,
                                        fontSize: 10,
                                        fontWeight: 800,
                                        color: "#475569",
                                        whiteSpace:
                                            "nowrap",
                                    }}
                                >
                                    {item.month}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* =====================================================
                    DPO LINE
                    Existing behavior preserved
                ===================================================== */}
                <svg
                    style={{
                        position: "absolute",
                        left: 55,
                        right: 15,
                        bottom: 35,
                        width: "calc(100% - 70px)",
                        height: 125,
                        pointerEvents: "none",
                        overflow: "visible",

                        opacity: chartLoaded
                            ? 1
                            : 0,

                        transform: chartLoaded
                            ? "translateY(0)"
                            : "translateY(8px)",

                        transition:
                            "opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s",
                    }}
                    viewBox="0 0 600 125"
                    preserveAspectRatio="none"
                >
                    <polyline
                        points={data
                            .map((item, index) => {
                                const x =
                                    data.length === 1
                                        ? 300
                                        : (index /
                                            (data.length -
                                                1)) *
                                        600;

                                const minDpo =
                                    Math.min(
                                        ...data.map(
                                            (d) =>
                                                Number(
                                                    d.dpo
                                                )
                                        )
                                    );

                                const maxDpo =
                                    Math.max(
                                        ...data.map(
                                            (d) =>
                                                Number(
                                                    d.dpo
                                                )
                                        )
                                    );

                                const range =
                                    Math.max(
                                        maxDpo -
                                        minDpo,
                                        1
                                    );

                                const y =
                                    105 -
                                    ((Number(
                                        item.dpo
                                    ) -
                                        minDpo) /
                                        range) *
                                    80;

                                return `${x},${y}`;
                            })
                            .join(" ")}
                        fill="none"
                        stroke="#0e9f75"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* =================================================
                        DPO POINTS
                    ================================================= */}
                    {data.map((item, index) => {
                        const x =
                            data.length === 1
                                ? 300
                                : (index /
                                    (data.length -
                                        1)) *
                                600;

                        const minDpo =
                            Math.min(
                                ...data.map((d) =>
                                    Number(d.dpo)
                                )
                            );

                        const maxDpo =
                            Math.max(
                                ...data.map((d) =>
                                    Number(d.dpo)
                                )
                            );

                        const range = Math.max(
                            maxDpo - minDpo,
                            1
                        );

                        const y =
                            105 -
                            ((Number(item.dpo) -
                                minDpo) /
                                range) *
                            80;

                        return (
                            <circle
                                key={item.month}
                                cx={x}
                                cy={y}
                                r={
                                    hoveredIndex ===
                                        index
                                        ? 5
                                        : 3
                                }
                                fill="#fff"
                                stroke="#0e9f75"
                                strokeWidth={
                                    hoveredIndex ===
                                        index
                                        ? 3
                                        : 2
                                }
                                style={{
                                    transition:
                                        "r 0.15s ease",
                                }}
                            />
                        );
                    })}
                </svg>
            </div>

            {/* =====================================================
                LEGEND
            ===================================================== */}
            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "center",
                    gap: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#475569",
                    marginTop: -5,
                }}
            >
                <span>
                    <span
                        style={{
                            display:
                                "inline-block",
                            width: 10,
                            height: 8,
                            background: BLUE_2,
                            marginRight: 5,
                        }}
                    />
                    Total Payables
                </span>

                <span>
                    <span
                        style={{
                            display:
                                "inline-block",
                            width: 18,
                            borderTop:
                                "2px dashed #0e9f75",
                            marginRight: 5,
                            verticalAlign:
                                "middle",
                        }}
                    />
                    DPO (Days)
                </span>
            </div>
        </div>
    );
}
/* ============================================================
   HORIZONTAL BAR CHART
   ============================================================ */
function ParentDivisionChart({ data, currency, onRowClick }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [page, setPage] = useState(1);
    const [chartLoaded, setChartLoaded] = useState(false);

    // ADDED: tooltip mouse position only
    const [tooltipPosition, setTooltipPosition] = useState({
        x: 0,
        y: 0,
    });

    const PAGE_SIZE = 5;

    useEffect(() => {
        setPage(1);
        setHoveredIndex(null);
        setChartLoaded(false);

        const frame = requestAnimationFrame(() => {
            setChartLoaded(true);
        });

        return () => cancelAnimationFrame(frame);
    }, [data]);

    // Normalize backend data
    const chartData = Array.isArray(data)
        ? data.map((item, index) => ({
            name:
                item?.name ??
                item?.label ??
                `Division ${index + 1}`,

            amount: Number(
                item?.amount ??
                item?.total_payables ??
                0
            ),

            percentage: Number(
                item?.percentage ??
                item?.percentage_of_total ??
                0
            ),
        }))
        : [];

    // Pagination
    const totalPages = Math.max(
        1,
        Math.ceil(chartData.length / PAGE_SIZE)
    );

    const safePage = Math.min(
        Math.max(page, 1),
        totalPages
    );

    const startIndex = (safePage - 1) * PAGE_SIZE;

    const paginatedChartData = chartData.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    // Maximum amount used for bar width
    const max = Math.max(
        ...chartData.map((item) =>
            Math.abs(item.amount)
        ),
        1
    );

    // Empty state
    if (!chartData.length) {
        return (
            <div
                style={{
                    minHeight: 260,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                    fontWeight: 600,
                }}
            >
                No data available
            </div>
        );
    }

    const formatAmount = (amount) => {
        const formatted = formatPayablesCompact(
            amount,
            ""
        );

        return formatted.replace(
            /^[A-Z]{3}\s*/,
            ""
        );
    };

    return (
        <div
            style={{
                width: "100%",
                overflow: "visible",
            }}
        >
            {/* Chart Rows */}
            <div
                style={{
                    width: "100%",
                    overflow: "visible",
                }}
            >
                {paginatedChartData.map((item, index) => {
                    const actualIndex =
                        startIndex + index;

                    const isHovered =
                        hoveredIndex === actualIndex;

                    const width =
                        (Math.abs(item.amount) / max) * 100;

                    const isNegative =
                        item.amount < 0;

                    return (
                        <div
                            key={`${item.name}-${actualIndex}`}

                            // CHANGED: track mouse position
                            onMouseEnter={(e) => {
                                setHoveredIndex(actualIndex);

                                setTooltipPosition({
                                    x: e.clientX,
                                    y: e.clientY,
                                });
                            }}

                            // ADDED: keep tooltip position updated
                            onMouseMove={(e) => {
                                if (
                                    hoveredIndex ===
                                    actualIndex
                                ) {
                                    setTooltipPosition({
                                        x: e.clientX,
                                        y: e.clientY,
                                    });
                                }
                            }}

                            onMouseLeave={() =>
                                setHoveredIndex(null)
                            }

                            onClick={() =>
                                onRowClick?.(item)
                            }

                            style={{
                                display: "grid",

                                gridTemplateColumns:
                                    "130px minmax(0, 1fr) 95px",

                                alignItems: "center",
                                columnGap: 9,

                                marginBottom: 10,
                                padding: "7px 8px",

                                borderRadius: 9,

                                background: isHovered
                                    ? "#f8fbff"
                                    : "transparent",

                                border: isHovered
                                    ? "1px solid #e5edf7"
                                    : "1px solid transparent",

                                boxShadow: isHovered
                                    ? "0 3px 10px rgba(15, 23, 42, 0.05)"
                                    : "none",

                                cursor: onRowClick
                                    ? "pointer"
                                    : "default",

                                transition:
                                    "background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease",

                                position: "relative",

                                zIndex: isHovered
                                    ? 100
                                    : 1,

                                overflow: "visible",
                            }}
                        >
                            {/* Division Name */}
                            <div
                                style={{
                                    minWidth: 0,

                                    whiteSpace: "normal",
                                    overflowWrap: "anywhere",
                                    wordBreak: "break-word",

                                    fontSize: 13,
                                    lineHeight: 1.3,
                                    fontWeight: 700,

                                    color: isHovered
                                        ? "#0f172a"
                                        : "#334155",

                                    transition:
                                        "color 0.2s ease",
                                }}
                                title={item.name}
                            >
                                {item.name}
                            </div>

                            {/* Bar Area */}
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    minWidth: 0,
                                    height: 18,

                                    background: "#edf2f8",

                                    borderRadius: 999,

                                    overflow: "visible",

                                    transition:
                                        "background 0.2s ease",

                                    zIndex: isHovered
                                        ? 2
                                        : 1,
                                }}
                            >
                                {/* Bar */}
                                <div
                                    onMouseEnter={(e) => {
                                        setHoveredIndex(
                                            actualIndex
                                        );

                                        setTooltipPosition({
                                            x: e.clientX,
                                            y: e.clientY,
                                        });
                                    }}
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        top: 0,

                                        height: "100%",

                                        width: chartLoaded
                                            ? `${Math.max(
                                                width,
                                                2
                                            )}%`
                                            : "0%",

                                        borderRadius: 999,

                                        background: isNegative
                                            ? "linear-gradient(90deg, #ef4444, #dc2626)"
                                            : "linear-gradient(90deg, #1464e8, #3b82f6)",

                                        transform: isHovered
                                            ? "scaleY(1.18)"
                                            : "scaleY(1)",

                                        transformOrigin:
                                            "center",

                                        boxShadow: isHovered
                                            ? isNegative
                                                ? "0 4px 12px rgba(220, 38, 38, 0.30)"
                                                : "0 4px 12px rgba(20, 100, 232, 0.30)"
                                            : "0 1px 3px rgba(15, 23, 42, 0.08)",

                                        filter: isHovered
                                            ? "brightness(1.06)"
                                            : "brightness(1)",

                                        opacity:
                                            chartLoaded
                                                ? 1
                                                : 0,

                                        transition:
                                            "width 0.7s ease, transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, opacity 0.35s ease",

                                        zIndex: isHovered
                                            ? 3
                                            : 1,
                                    }}
                                />
                            </div>

                            {/* Value + Percentage */}
                            <div
                                style={{
                                    minWidth: 0,

                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",

                                    lineHeight: 1.2,
                                }}
                            >
                                {/* Chart Value */}
                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 800,

                                        color: isHovered
                                            ? "#0f172a"
                                            : "#334155",

                                        whiteSpace: "nowrap",

                                        transition:
                                            "color 0.2s ease",
                                    }}
                                >
                                    {formatAmount(
                                        item.amount
                                    )}
                                </div>

                                {/* Chart Percentage */}
                                <div
                                    style={{
                                        marginTop: 2,

                                        fontSize: 10,

                                        fontWeight: 650,

                                        color: isHovered
                                            ? "#475569"
                                            : "#64748b",

                                        whiteSpace: "nowrap",

                                        transition:
                                            "color 0.2s ease",
                                    }}
                                >
                                    {item.percentage.toFixed(
                                        2
                                    )}
                                    %
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 5,

                        marginTop: 8,
                    }}
                >
                    {/* First */}
                    <button
                        type="button"
                        onClick={() => setPage(1)}
                        disabled={safePage === 1}
                        style={{
                            width: 28,
                            height: 28,

                            borderRadius: 7,
                            border:
                                "1px solid #e2e8f0",

                            background:
                                safePage === 1
                                    ? "#f8fafc"
                                    : "#fff",

                            color:
                                safePage === 1
                                    ? "#cbd5e1"
                                    : "#475569",

                            cursor:
                                safePage === 1
                                    ? "not-allowed"
                                    : "pointer",

                            fontSize: 12,
                            fontWeight: 700,
                        }}
                    >
                        «
                    </button>

                    {/* Previous */}
                    <button
                        type="button"
                        onClick={() =>
                            setPage((p) =>
                                Math.max(1, p - 1)
                            )
                        }
                        disabled={safePage === 1}
                        style={{
                            width: 28,
                            height: 28,

                            borderRadius: 7,
                            border:
                                "1px solid #e2e8f0",

                            background:
                                safePage === 1
                                    ? "#f8fafc"
                                    : "#fff",

                            color:
                                safePage === 1
                                    ? "#cbd5e1"
                                    : "#475569",

                            cursor:
                                safePage === 1
                                    ? "not-allowed"
                                    : "pointer",

                            fontSize: 12,
                            fontWeight: 700,
                        }}
                    >
                        ‹
                    </button>

                    {/* Current Page */}
                    <div
                        style={{
                            minWidth: 32,
                            height: 28,

                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",

                            padding: "0 7px",

                            borderRadius: 7,

                            background: "#1464e8",
                            color: "#fff",

                            fontSize: 11,
                            fontWeight: 700,

                            boxShadow:
                                "0 2px 6px rgba(20, 100, 232, 0.20)",
                        }}
                    >
                        {safePage}
                    </div>

                    {/* Next */}
                    <button
                        type="button"
                        onClick={() =>
                            setPage((p) =>
                                Math.min(
                                    totalPages,
                                    p + 1
                                )
                            )
                        }
                        disabled={
                            safePage === totalPages
                        }
                        style={{
                            width: 28,
                            height: 28,

                            borderRadius: 7,
                            border:
                                "1px solid #e2e8f0",

                            background:
                                safePage === totalPages
                                    ? "#f8fafc"
                                    : "#fff",

                            color:
                                safePage === totalPages
                                    ? "#cbd5e1"
                                    : "#475569",

                            cursor:
                                safePage === totalPages
                                    ? "not-allowed"
                                    : "pointer",

                            fontSize: 12,
                            fontWeight: 700,
                        }}
                    >
                        ›
                    </button>

                    {/* Last */}
                    <button
                        type="button"
                        onClick={() =>
                            setPage(totalPages)
                        }
                        disabled={
                            safePage === totalPages
                        }
                        style={{
                            width: 28,
                            height: 28,

                            borderRadius: 7,
                            border:
                                "1px solid #e2e8f0",

                            background:
                                safePage === totalPages
                                    ? "#f8fafc"
                                    : "#fff",

                            color:
                                safePage === totalPages
                                    ? "#cbd5e1"
                                    : "#475569",

                            cursor:
                                safePage === totalPages
                                    ? "not-allowed"
                                    : "pointer",

                            fontSize: 12,
                            fontWeight: 700,
                        }}
                    >
                        »
                    </button>
                </div>
            )}

            {/* =====================================================
                FIXED TOOLTIP
                This is outside all chart rows.
               ===================================================== */}
            {hoveredIndex !== null &&
                chartData[hoveredIndex] &&
                createPortal(
                    <>
                        <div
                            style={{
                                position: "fixed",

                                /*
                                 * Position beside the mouse so it
                                 * cannot be clipped by chart rows.
                                 */
                                left: Math.max(8, Math.min(
                                    tooltipPosition.x + 14,
                                    window.innerWidth - 278
                                )),

                                top: tooltipPosition.y < 92
                                    ? Math.min(window.innerHeight - 8, tooltipPosition.y + 16)
                                    : Math.max(8, Math.min(
                                        tooltipPosition.y - 10,
                                        window.innerHeight - 8
                                    )),

                                /*
                                 * Above the pointer when there is room; below it near
                                 * the top edge. The position is always viewport-clamped.
                                 */
                                transform:
                                    tooltipPosition.y < 92
                                        ? "translateY(0)"
                                        : "translateY(-100%)",

                                minWidth: 175,
                                maxWidth: "min(260px, calc(100vw - 16px))",

                                padding: "9px 11px",

                                borderRadius: 8,

                                background:
                                    "rgba(15, 23, 42, 0.96)",

                                color: "#fff",

                                boxShadow:
                                    "0 8px 20px rgba(15, 23, 42, 0.18)",

                                pointerEvents:
                                    "none",

                                /*
                                 * Very high so other chart rows
                                 * cannot cover it.
                                 */
                                zIndex: 999999,

                                animation:
                                    "parentDivisionTooltipIn 0.16s ease-out",

                                whiteSpace: "normal",

                                overflowWrap:
                                    "anywhere",

                                wordBreak:
                                    "break-word",

                                width: "max-content",
                            }}
                        >
                            {/* Tooltip Division Name */}
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    lineHeight: 1.35,

                                    color: "#e2e8f0",

                                    marginBottom: 6,
                                }}
                            >
                                {
                                    chartData[
                                        hoveredIndex
                                    ].name
                                }
                            </div>

                            {/* Tooltip Payables */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "center",

                                    gap: 12,

                                    fontSize: 11.5,
                                    lineHeight: 1.35,
                                }}
                            >
                                <span
                                    style={{
                                        color: "#aebccc",
                                        fontWeight: 600,
                                        flexShrink: 0,
                                    }}
                                >
                                    Payables
                                </span>

                                <span
                                    style={{
                                        color: "#fff",
                                        fontWeight: 800,
                                        whiteSpace:
                                            "nowrap",
                                    }}
                                >
                                    {formatAmount(
                                        chartData[
                                            hoveredIndex
                                        ].amount
                                    )}
                                </span>
                            </div>

                            {/* Tooltip Percentage */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "center",

                                    gap: 12,

                                    marginTop: 4,

                                    fontSize: 11.5,
                                    lineHeight: 1.35,
                                }}
                            >
                                <span
                                    style={{
                                        color: "#aebccc",
                                        fontWeight: 600,
                                        flexShrink: 0,
                                    }}
                                >
                                    Percentage
                                </span>

                                <span
                                    style={{
                                        color: "#fff",
                                        fontWeight: 800,
                                        whiteSpace:
                                            "nowrap",
                                    }}
                                >
                                    {chartData[
                                        hoveredIndex
                                    ].percentage.toFixed(2)}
                                    %
                                </span>
                            </div>
                        </div>
                    </>,
                    document.body
                )}

            {/* Tooltip Animation */}
            <style>
                {`
                    @keyframes parentDivisionTooltipIn {
                        from {
                            opacity: 0;
                        }

                        to {
                            opacity: 1;
                        }
                    }
                `}
            </style>
        </div>
    );
}

/* ============================================================
   DATA TABLE
============================================================ */
function DataTable({
    columns,
    rows,
    compact = false,
    fitColumns = false,
    compactRows = false,
    rowGap = false,
    emptyMessage = "No Data Available",

    // --------------------------------------------------
    // Optional table features
    // --------------------------------------------------
    pagination = false,
    pageSize = 9,

    totalRow = null,

    removeYearFromHeader = false,
    monthColumnGap = false,
    removeDecimals = false,

    truncateLegalEntity = false,
    legalEntityMaxLength = 18,

    negativeValuesRed = true,

    // --------------------------------------------------
    // AED / AED Millions toggle
    // --------------------------------------------------
    currencyToggle = false,
    currencyMode: controlledCurrencyMode = null,
    onCurrencyModeChange = null,
    showCurrencyToggle = true,

    onRowClick = null,
    onCellClick = null,

    // ==================================================
    // TOP 10 SUPPLIERS
    // ==================================================
    supplierTwoLine = false,
    capitalizeSupplierNames = false,

    // ==================================================
    // TOP 10 SUPPLIERS REFERENCE STYLE
    // ==================================================
    topSupplierStyle = false,

    // ==================================================
    // PAYABLES BY SUB-DIVISION
    // ==================================================
    subDivisionTableStyle = false,

    increasedRowGap = false,

    // ==================================================
    // FIXED HIERARCHY COLUMNS
    // ==================================================
    fixedHierarchyColumns = false,

    // ==================================================
    // MONTH-ON-MONTH PAYABLES
    // ==================================================
    widerLegalEntity = false,

    // ==================================================
    // MODERN PAGINATION
    // ==================================================
    modernPagination = false,

    // ==================================================
    // PARENT DIVISION PAGINATION STYLE
    // ==================================================
    parentDivisionPaginationStyle = false,

    // ==================================================
    // SUB-DIVISION PERCENTAGE
    // ==================================================
    showSubDivisionPercentage = false,

    // ==================================================
    // MONTH-ON-MONTH STYLE
    // Matches Sales Revenue Consolidated View
    // ==================================================
    monthOnMonthStyle = false,

    // ==================================================
    // LIGHT BLUE ACTIVE PAGINATION
    // ==================================================
    lightBluePaginationActive = false,
}) {
    const [currentPage, setCurrentPage] =
        React.useState(1);

    const [internalCurrencyMode, setInternalCurrencyMode] =
        React.useState("AED");

    const currencyMode =
        controlledCurrencyMode ||
        internalCurrencyMode;

    // Payables by Sub-Division uses the percentage column automatically.
    // Month-on-Month uses the Sales Revenue Consolidated View styling
    // when widerLegalEntity is enabled.
    const shouldShowSubDivisionPercentage =
        showSubDivisionPercentage ||
        subDivisionTableStyle;

    const useMonthOnMonthStyle =
        monthOnMonthStyle ||
        widerLegalEntity;

    // ==================================================
    // CURRENCY MODE
    // ==================================================

    const setCurrencyMode = (nextMode) => {
        setInternalCurrencyMode(nextMode);

        if (
            typeof onCurrencyModeChange ===
            "function"
        ) {
            onCurrencyModeChange(nextMode);
        }
    };

    // ==================================================
    // RESET PAGINATION WHEN DATA CHANGES
    // ==================================================

    React.useEffect(() => {
        setCurrentPage(1);
    }, [rows]);

    // ==================================================
    // SAFE ROWS
    // ==================================================

    const safeRows =
        Array.isArray(rows)
            ? rows
            : [];

    // ==================================================
    // SAFE COLUMNS
    // ==================================================

    const safeColumns =
        Array.isArray(columns)
            ? columns
            : [];

    // ==================================================
    // NUMERIC VALUE DETECTION
    // ==================================================

    const isNumericValue = (value) => {
        if (
            typeof value === "number" &&
            Number.isFinite(value)
        ) {
            return true;
        }

        if (
            typeof value === "string" &&
            value.trim() !== ""
        ) {
            const cleaned = value
                .replace(/,/g, "")
                .replace(
                    /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
                    ""
                )
                .replace(/%$/, "")
                .trim();

            return (
                cleaned !== "" &&
                Number.isFinite(
                    Number(cleaned)
                )
            );
        }

        return false;
    };

    // ==================================================
    // GET NUMERIC VALUE
    // ==================================================

    const getNumericValue = (value) => {
        if (
            typeof value === "number"
        ) {
            return value;
        }

        if (
            typeof value === "string"
        ) {
            const cleaned = value
                .replace(/,/g, "")
                .replace(
                    /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
                    ""
                )
                .replace(/%$/, "")
                .trim();

            const number =
                Number(cleaned);

            return Number.isFinite(number)
                ? number
                : null;
        }

        return null;
    };

    // ==================================================
    // PAGINATION
    // ==================================================

    const totalPages = pagination
        ? Math.max(
            1,
            Math.ceil(
                safeRows.length /
                pageSize
            )
        )
        : 1;

    const paginatedRows = pagination
        ? safeRows.slice(
            (currentPage - 1) *
            pageSize,
            currentPage *
            pageSize
        )
        : safeRows;

    const goToPage = (page) => {
        const nextPage =
            Math.min(
                Math.max(
                    page,
                    1
                ),
                totalPages
            );

        setCurrentPage(
            nextPage
        );
    };

    // ==================================================
    // HEADER FORMATTER
    // ==================================================

    const formatHeader = (label) => {
        if (
            !removeYearFromHeader ||
            typeof label !== "string"
        ) {
            return label;
        }

        return label
            .replace(
                /\b(20\d{2}|19\d{2})\b/g,
                ""
            )
            .replace(
                /[-/\s]+$/,
                ""
            )
            .trim();
    };

    // ==================================================
    // FORMAT NUMERIC VALUE
    // ==================================================

    const formatNumericValue = (
        value
    ) => {
        const number =
            getNumericValue(
                value
            );

        if (
            number === null
        ) {
            return value;
        }

        let displayValue =
            number;

        // ------------------------------------------------
        // AED MILLIONS
        // ------------------------------------------------

        if (
            currencyMode ===
            "AED_MILLIONS"
        ) {
            displayValue =
                number /
                1000000;

            return `AED ${displayValue.toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }
            )}M`;
        }

        // ------------------------------------------------
        // NORMAL AED
        // ------------------------------------------------

        return displayValue.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }
        );
    };

    // ==================================================
    // CAPITALIZE SUPPLIER NAME
    // ==================================================

    const capitalizeName = (
        value
    ) => {
        if (
            typeof value !== "string" ||
            !value.trim()
        ) {
            return value;
        }

        return value
            .toLowerCase()
            .split(/\s+/)
            .map(
                (word) => {
                    if (!word) {
                        return word;
                    }

                    return (
                        word
                            .charAt(0)
                            .toUpperCase() +
                        word.slice(1)
                    );
                }
            )
            .join(" ");
    };

    // ==================================================
    // SUPPLIER COLUMN
    // ==================================================

    const isSupplierColumn = (
        column
    ) => {
        const key =
            String(
                column?.key || ""
            ).toLowerCase();

        const label =
            String(
                column?.label || ""
            ).toLowerCase();

        return (
            key === "supplier" ||
            key === "supplier_name" ||
            key === "suppliername" ||
            key.includes(
                "supplier"
            ) ||
            label === "supplier" ||
            label === "supplier name" ||
            label.includes(
                "supplier"
            )
        );
    };

    // ==================================================
    // LEGAL ENTITY COLUMN
    // ==================================================

    const isLegalEntityColumn = (
        column
    ) => {
        const key =
            String(
                column?.key || ""
            ).toLowerCase();

        const label =
            String(
                column?.label || ""
            ).toLowerCase();

        return (
            key ===
            "legal_entity" ||
            key ===
            "legalentity" ||
            key ===
            "legal_entity_name" ||
            label ===
            "legal entity" ||
            label ===
            "legal entity name"
        );
    };

    // ==================================================
    // PARENT DIVISION COLUMN
    // ==================================================

    const isParentDivisionColumn = (
        column
    ) => {
        const key =
            String(
                column?.key || ""
            ).toLowerCase();

        const label =
            String(
                column?.label || ""
            ).toLowerCase();

        return (
            key ===
            "parent_division" ||
            key ===
            "parentdivision" ||
            key.includes(
                "parent_division"
            ) ||
            label ===
            "parent division"
        );
    };

    // ==================================================
    // SUB-DIVISION COLUMN
    // ==================================================

    const isSubDivisionColumn = (
        column
    ) => {
        const key =
            String(
                column?.key || ""
            ).toLowerCase();

        const label =
            String(
                column?.label || ""
            ).toLowerCase();

        return (
            key ===
            "subdivision" ||
            key ===
            "sub_division" ||
            key ===
            "subdivision_name" ||
            key.includes(
                "subdivision"
            ) ||
            label ===
            "sub-division" ||
            label ===
            "sub division" ||
            label ===
            "sub-division name"
        );
    };

    // ==================================================
    // PERCENTAGE COLUMN
    // ==================================================

    const isPercentageColumn = (
        column
    ) => {
        const key =
            String(
                column?.key || ""
            ).toLowerCase();

        const label =
            String(
                column?.label || ""
            ).toLowerCase();

        return (
            key ===
            "percentage" ||
            key ===
            "percent" ||
            key ===
            "percentage_share" ||
            key ===
            "percentage_share" ||
            key ===
            "share_percentage" ||
            key ===
            "share_percent" ||
            key ===
            "pct_share" ||
            key ===
            "percent_share" ||
            key ===
            "share" ||
            key ===
            "__supplier_percentage" ||
            key ===
            "__subdivision_percentage" ||
            label === "%" ||
            label ===
            "% share" ||
            label ===
            "percentage" ||
            label ===
            "percentage share" ||
            label ===
            "share"
        );
    };

    // ==================================================
    // MONTH COLUMN
    // ==================================================

    const isMonthColumn = (
        column
    ) => {
        const key =
            String(
                column?.key || ""
            ).toLowerCase();

        const label =
            String(
                column?.label || ""
            ).toLowerCase();

        return (
            key.includes(
                "month"
            ) ||
            label.includes("jan") ||
            label.includes("feb") ||
            label.includes("mar") ||
            label.includes("apr") ||
            label.includes("may") ||
            label.includes("jun") ||
            label.includes("jul") ||
            label.includes("aug") ||
            label.includes("sep") ||
            label.includes("oct") ||
            label.includes("nov") ||
            label.includes("dec")
        );
    };

    // ==================================================
    // FIXED HIERARCHY COLUMN
    // ==================================================

    const isFixedHierarchyColumn = (
        column
    ) => {
        return (
            isLegalEntityColumn(
                column
            ) ||
            isParentDivisionColumn(
                column
            ) ||
            isSubDivisionColumn(
                column
            )
        );
    };

    // ==================================================
    // FIXED COLUMN WIDTH
    // ==================================================

    const getColumnWidth = (
        column
    ) => {
        if (
            isLegalEntityColumn(
                column
            )
        ) {
            return widerLegalEntity
                ? 240
                : 220;
        }

        if (
            isParentDivisionColumn(
                column
            )
        ) {
            return 190;
        }

        if (
            isSubDivisionColumn(
                column
            )
        ) {
            return 190;
        }

        return 0;
    };

    // ==================================================
    // GET FIXED COLUMN LEFT
    // ==================================================

    const getFixedColumnLeft = (
        column,
        columnIndex
    ) => {
        if (
            !fixedHierarchyColumns ||
            !isFixedHierarchyColumn(
                column
            )
        ) {
            return undefined;
        }

        let left = 0;

        for (
            let i = 0;
            i < columnIndex;
            i++
        ) {
            const previousColumn =
                safeColumns[i];

            if (
                !isFixedHierarchyColumn(
                    previousColumn
                )
            ) {
                continue;
            }

            left +=
                getColumnWidth(
                    previousColumn
                );
        }

        return left;
    };

    // ==================================================
    // FIXED COLUMN STYLE
    // ==================================================

    const getFixedColumnStyle = (
        column,
        columnIndex
    ) => {
        if (
            !fixedHierarchyColumns ||
            !isFixedHierarchyColumn(
                column
            )
        ) {
            return {};
        }

        const left =
            getFixedColumnLeft(
                column,
                columnIndex
            );

        return {
            position:
                "sticky",

            left,

            zIndex: 4,

            background:
                "#ffffff",

            boxShadow:
                "3px 0 6px rgba(15, 23, 42, 0.07)",
        };
    };

    // ==================================================
    // FORMAT LEGAL ENTITY
    // ==================================================

    const formatLegalEntity = (
        value
    ) => {
        if (
            widerLegalEntity &&
            typeof value === "string"
        ) {
            return {
                display: value,
                title: undefined,
            };
        }

        if (
            !truncateLegalEntity ||
            typeof value !==
            "string"
        ) {
            return {
                display: value,
                title: undefined,
            };
        }

        if (
            value.length <=
            legalEntityMaxLength
        ) {
            return {
                display: value,
                title: undefined,
            };
        }

        return {
            display:
                value.slice(
                    0,
                    Math.max(
                        1,
                        legalEntityMaxLength -
                        3
                    )
                ) + "...",

            title: value,
        };
    };

    // ==================================================
    // FIND SUB-DIVISION AMOUNT
    // Used only for percentage calculation
    // ==================================================

    const getSubDivisionAmount = (
        row
    ) => {
        if (!row) {
            return null;
        }

        // First prefer common payables fields
        const preferredKeys = [
            "payables",
            "total_payables",
            "payable",
            "outstanding",
            "total_outstanding",
            "amount",
            "value",
        ];

        for (
            const key of preferredKeys
        ) {
            if (
                row[key] !==
                undefined &&
                row[key] !== null &&
                isNumericValue(
                    row[key]
                )
            ) {
                return getNumericValue(
                    row[key]
                );
            }
        }

        // Fallback:
        // find first numeric non-percentage field
        for (
            const column of safeColumns
        ) {
            if (
                isPercentageColumn(
                    column
                )
            ) {
                continue;
            }

            const value =
                row[
                column.key
                ];

            if (
                isNumericValue(
                    value
                )
            ) {
                return getNumericValue(
                    value
                );
            }
        }

        return null;
    };

    // ==================================================
    // GET EXISTING PERCENTAGE FROM ROW
    // ==================================================

    const getExistingPercentage = (
        row
    ) => {
        if (!row) {
            return null;
        }

        const percentageKeys = [
            "percentage",
            "percent",
            "percentage_share",
            "share_percentage",
            "share_percent",
            "pct_share",
            "percent_share",
            "share",
        ];

        for (
            const key of percentageKeys
        ) {
            if (
                row[key] !==
                undefined &&
                row[key] !== null &&
                isNumericValue(
                    row[key]
                )
            ) {
                return getNumericValue(
                    row[key]
                );
            }
        }

        return null;
    };

    // ==================================================
    // TOP 10 SUPPLIER PERCENTAGE
    // --------------------------------------------------
    // If the backend already sends a percentage, use it.
    // Otherwise calculate the share from the displayed
    // supplier payable amounts. Presentation only.
    // ==================================================

    const shouldShowSupplierPercentage =
        safeColumns.some((column) =>
            isSupplierColumn(column)
        ) &&
        safeColumns.some((column) =>
            String(column?.key || "").toLowerCase() ===
            "payable_amount"
        );

    const getSupplierAmount = (row) => {
        if (!row) {
            return null;
        }

        const keys = [
            "payable_amount",
            "total_payables",
            "total_payable",
            "outstanding_amount",
            "payables",
            "amount",
            "value",
        ];

        for (const key of keys) {
            if (
                row[key] !== undefined &&
                row[key] !== null &&
                isNumericValue(row[key])
            ) {
                return getNumericValue(row[key]);
            }
        }

        return null;
    };

    const getSupplierTotal = () => {
        return safeRows.reduce((total, row) => {
            const amount = getSupplierAmount(row);
            return total + (amount === null ? 0 : amount);
        }, 0);
    };

    const supplierTotal = getSupplierTotal();

    const getSupplierPercentage = (row) => {
        const existing = getExistingPercentage(row);

        if (existing !== null) {
            return existing;
        }

        const amount = getSupplierAmount(row);

        if (
            amount === null ||
            !supplierTotal
        ) {
            return 0;
        }

        return (amount / supplierTotal) * 100;
    };

    // ==================================================
    // SUB-DIVISION TOTAL AMOUNT
    // ==================================================

    const getSubDivisionTotal =
        () => {
            return safeRows.reduce(
                (
                    total,
                    row
                ) => {
                    const amount =
                        getSubDivisionAmount(
                            row
                        );

                    return (
                        total +
                        (
                            amount ===
                                null
                                ? 0
                                : amount
                        )
                    );
                },
                0
            );
        };

    const subDivisionTotal =
        shouldShowSubDivisionPercentage
            ? getSubDivisionTotal()
            : 0;

    // ==================================================
    // GET SUB-DIVISION PERCENTAGE
    // ==================================================

    const getSubDivisionPercentage =
        (row) => {
            const existing =
                getExistingPercentage(
                    row
                );

            if (
                existing !==
                null
            ) {
                return existing;
            }

            const amount =
                getSubDivisionAmount(
                    row
                );

            if (
                amount === null ||
                !subDivisionTotal
            ) {
                return 0;
            }

            return (
                amount /
                subDivisionTotal
            ) *
                100;
        };

    // ==================================================
    // FORMAT PERCENTAGE
    // ==================================================

    const formatPercentageValue =
        (value) => {
            if (
                value ===
                null ||
                value ===
                undefined ||
                value === ""
            ) {
                return "0.00%";
            }

            const number =
                getNumericValue(
                    value
                );

            if (
                number === null
            ) {
                return value;
            }

            return `${number.toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            )}%`;
        };

    // ==================================================
    // DISPLAY COLUMNS
    // ==================================================
    // Add the percentage column automatically for the
    // Payables by Sub-Division table when it is not already
    // supplied by the caller. This is presentation-only.
    // ==================================================

    const hasPercentageColumn =
        safeColumns.some((column) =>
            isPercentageColumn(column)
        );

    const displayColumns =
        shouldShowSubDivisionPercentage &&
            !hasPercentageColumn
            ? [
                ...safeColumns,
                {
                    key: "__subdivision_percentage",
                    label: "% Share",
                    align: "right",
                    render: (row) =>
                        getSubDivisionPercentage(row),
                },
            ]
            : shouldShowSupplierPercentage &&
                !hasPercentageColumn
                ? [
                    ...safeColumns,
                    {
                        key: "__supplier_percentage",
                        label: "% of Total",
                        align: "right",
                        render: (row) =>
                            getSupplierPercentage(row),
                    },
                ]
                : safeColumns;

    // ==================================================
    // RENDER CELL VALUE
    // ==================================================

    const renderCellValue = (
        row,
        column
    ) => {
        const value =
            column.render
                ? column.render(
                    row
                )
                : row[
                column.key
                ];

        // ------------------------------------------------
        // Sub-Division generated percentage
        // ------------------------------------------------

        if (
            shouldShowSubDivisionPercentage &&
            isPercentageColumn(
                column
            )
        ) {
            return {
                display:
                    formatPercentageValue(
                        getSubDivisionPercentage(
                            row
                        )
                    ),
                title: undefined,
            };
        }

        // ------------------------------------------------
        // Supplier
        // ------------------------------------------------

        if (
            capitalizeSupplierNames &&
            isSupplierColumn(
                column
            ) &&
            typeof value ===
            "string"
        ) {
            return {
                display:
                    capitalizeName(
                        value
                    ),
                title: value,
            };
        }

        // ------------------------------------------------
        // Legal Entity
        // ------------------------------------------------

        if (
            isLegalEntityColumn(
                column
            ) &&
            typeof value ===
            "string"
        ) {
            return formatLegalEntity(
                value
            );
        }

        // ------------------------------------------------
        // Top 10 Supplier percentage
        // ------------------------------------------------

        if (
            shouldShowSupplierPercentage &&
            (
                String(column?.key || "").toLowerCase() ===
                "__supplier_percentage" ||
                isPercentageColumn(column)
            )
        ) {
            return {
                display:
                    formatPercentageValue(
                        getSupplierPercentage(row)
                    ),
                title: undefined,
            };
        }

        // ------------------------------------------------
        // Percentage
        // ------------------------------------------------

        if (
            isPercentageColumn(
                column
            ) &&
            isNumericValue(
                value
            )
        ) {
            return {
                display:
                    formatPercentageValue(
                        value
                    ),
                title: undefined,
            };
        }

        // ------------------------------------------------
        // Remove decimals
        // ------------------------------------------------

        if (
            removeDecimals &&
            isNumericValue(
                value
            )
        ) {
            const number =
                getNumericValue(
                    value
                );

            return {
                display:
                    currencyToggle &&
                        currencyMode ===
                        "AED_MILLIONS"
                        ? formatNumericValue(
                            value
                        )
                        : number.toLocaleString(
                            "en-US",
                            {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            }
                        ),

                title: undefined,
            };
        }

        // ------------------------------------------------
        // Currency toggle
        // ------------------------------------------------

        if (
            currencyToggle &&
            isNumericValue(
                value
            )
        ) {
            return {
                display:
                    formatNumericValue(
                        value
                    ),
                title: undefined,
            };
        }

        // ------------------------------------------------
        // Existing currency removal
        // ------------------------------------------------

        if (
            typeof value ===
            "string"
        ) {
            return {
                display:
                    value
                        .replace(
                            /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
                            ""
                        )
                        .replace(
                            /^#\s*/,
                            ""
                        ),

                title: undefined,
            };
        }

        return {
            display: value,
            title: undefined,
        };
    };

    // ==================================================
    // ROW GAP
    // ==================================================

    const useIncreasedRowGap =
        rowGap ||
        increasedRowGap;

    // ==================================================
    // SUPPLIER CELL STYLE
    // ==================================================

    const getSupplierCellStyle =
        (isSupplier) => {
            if (
                !topSupplierStyle ||
                !isSupplier
            ) {
                return {};
            }

            return {
                fontSize: 13,
                fontWeight: 700,
                color: "#17233f",
                lineHeight:
                    "20px",
                verticalAlign:
                    "middle",
            };
        };

    // ==================================================
    // SUPPLIER TEXT STYLE
    // ==================================================

    const getSupplierTextStyle =
        (isSupplier) => {
            if (
                !isSupplier
            ) {
                return {};
            }

            if (
                topSupplierStyle
            ) {
                return {
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#17233f",
                    lineHeight:
                        "20px",
                    whiteSpace:
                        "normal",
                    wordBreak:
                        "normal",
                    overflowWrap:
                        "break-word",
                    width: "100%",
                    maxWidth:
                        "none",
                    padding:
                        "0 2px",
                };
            }

            if (
                !supplierTwoLine
            ) {
                return {};
            }

            return {
                lineHeight:
                    "19px",
                maxWidth:
                    "250px",
                whiteSpace:
                    "normal",
                wordBreak:
                    "break-word",
                overflowWrap:
                    "anywhere",
            };
        };

    // ==================================================
    // PAGINATION BUTTON STYLE
    // ==================================================

    const getPaginationButtonStyle =
        ({
            disabled = false,
            active = false,
        }) => {

            const useLightBluePagination =
                lightBluePaginationActive ||
                subDivisionTableStyle ||
                useMonthOnMonthStyle;

            // ------------------------------------------------
            // Parent Division pagination style
            // ------------------------------------------------

            if (
                parentDivisionPaginationStyle
            ) {
                return {
                    width: 30,
                    minWidth: 30,
                    height: 28,

                    padding: 0,

                    border:
                        active &&
                            useLightBluePagination
                            ? "1px solid #93c5fd"
                            : "1px solid #dbe3ef",

                    borderRadius: 6,

                    background:
                        active
                            ? useLightBluePagination
                                ? "#dbeafe"
                                : BLUE
                            : disabled
                                ? "#f8fafc"
                                : "#ffffff",

                    color:
                        active
                            ? useLightBluePagination
                                ? "#2563eb"
                                : "#ffffff"
                            : disabled
                                ? "#cbd5e1"
                                : "#64748b",

                    cursor:
                        disabled
                            ? "not-allowed"
                            : "pointer",

                    fontSize: 12,

                    fontWeight: 700,

                    display: "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",

                    boxShadow:
                        active
                            ? useLightBluePagination
                                ? "0 2px 5px rgba(59, 130, 246, 0.12)"
                                : "0 2px 5px rgba(37, 99, 235, 0.18)"
                            : "0 1px 2px rgba(15, 23, 42, 0.03)",

                    transition:
                        "all 0.15s ease",
                };
            }

            // ------------------------------------------------
            // Modern pagination
            // ------------------------------------------------

            if (
                modernPagination
            ) {
                return {
                    minWidth: 32,
                    height: 32,

                    padding:
                        "0 9px",

                    border:
                        active
                            ? useLightBluePagination
                                ? "1px solid #93c5fd"
                                : `1px solid ${BLUE}`
                            : "1px solid #e2e8f0",

                    borderRadius: 8,

                    background:
                        active
                            ? useLightBluePagination
                                ? "#dbeafe"
                                : BLUE
                            : disabled
                                ? "#f8fafc"
                                : "#ffffff",

                    color:
                        active
                            ? useLightBluePagination
                                ? "#2563eb"
                                : "#ffffff"
                            : disabled
                                ? "#cbd5e1"
                                : "#475569",

                    cursor:
                        disabled
                            ? "not-allowed"
                            : "pointer",

                    fontSize: 11,

                    fontWeight: 700,

                    display: "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",

                    boxShadow:
                        active
                            ? "0 3px 8px rgba(37, 99, 235, 0.12)"
                            : "0 1px 2px rgba(15, 23, 42, 0.04)",

                    transition:
                        "all 0.18s ease",
                };
            }

            // ------------------------------------------------
            // Existing pagination
            // ------------------------------------------------

            return {
                minWidth: 28,
                height: 27,

                border:
                    active &&
                        useLightBluePagination
                        ? "1px solid #93c5fd"
                        : "1px solid #dbe3ef",

                borderRadius: 5,

                background:
                    disabled
                        ? "#f8fafc"
                        : active
                            ? useLightBluePagination
                                ? "#dbeafe"
                                : BLUE
                            : "#ffffff",

                color:
                    active
                        ? useLightBluePagination
                            ? "#2563eb"
                            : "#ffffff"
                        : disabled
                            ? "#cbd5e1"
                            : "#475569",

                cursor:
                    disabled
                        ? "not-allowed"
                        : "pointer",

                fontSize: 11,

                fontWeight: 700,

                display: "flex",

                alignItems:
                    "center",

                justifyContent:
                    "center",

                transition:
                    "all 0.15s ease",
            };
        };

    // ==================================================
    // PAGE NUMBER LIST
    // ==================================================

    const getPageNumbers =
        () => {
            if (
                totalPages <= 5
            ) {
                return Array.from(
                    {
                        length:
                            totalPages,
                    },
                    (_, index) =>
                        index + 1
                );
            }

            if (
                currentPage <= 3
            ) {
                return [
                    1,
                    2,
                    3,
                    4,
                    "...",
                    totalPages,
                ];
            }

            if (
                currentPage >=
                totalPages - 2
            ) {
                return [
                    1,
                    "...",
                    totalPages - 3,
                    totalPages - 2,
                    totalPages - 1,
                    totalPages,
                ];
            }

            return [
                1,
                "...",
                currentPage - 1,
                currentPage,
                currentPage + 1,
                "...",
                totalPages,
            ];
        };

    // ==================================================
    // SUB-DIVISION TABLE STYLE
    // ==================================================

    const getSubDivisionTableStyle =
        () => {
            if (
                !subDivisionTableStyle
            ) {
                return {};
            }

            return {
                borderRadius: 9,

                boxShadow:
                    "0 1px 3px rgba(15, 23, 42, 0.04)",
            };
        };

    // ==================================================
    // MONTH-ON-MONTH HEADER STYLE
    // Sales Revenue Consolidated View reference
    // ==================================================

    const getMonthOnMonthHeaderStyle =
        () => {
            if (
                !useMonthOnMonthStyle
            ) {
                return {};
            }

            return {
                background:
                    "#f7f9fc",

                color:
                    BLUE,

                fontWeight: 800,

                fontSize: 10,

                letterSpacing:
                    "0.3px",

                padding:
                    "10px 10px",

                borderBottom:
                    "1px solid #d8e1ec",

                borderRight:
                    "1px solid #e3e9f1",

                textTransform:
                    "uppercase",

                verticalAlign:
                    "middle",

                whiteSpace:
                    "nowrap",
            };
        };

    // ==================================================
    // MONTH-ON-MONTH CELL STYLE
    // ==================================================

    const getMonthOnMonthCellStyle =
        (
            column,
            isNegative
        ) => {
            if (
                !useMonthOnMonthStyle
            ) {
                return {};
            }

            const isPercentage =
                isPercentageColumn(
                    column
                );

            return {
                padding:
                    "9px 10px",

                background:
                    "#ffffff",

                color:
                    isNegative
                        ? "#ef4444"
                        : isPercentage
                            ? "#334155"
                            : "#17233f",

                fontWeight:
                    600,

                fontSize: 11,

                lineHeight:
                    "18px",

                borderBottom:
                    "1px solid #edf1f6",

                borderRight:
                    "1px solid #edf1f6",

                verticalAlign:
                    "middle",

                textAlign:
                    column.align ||
                    (
                        isPercentage
                            ? "right"
                            : "left"
                    ),

                whiteSpace:
                    isLegalEntityColumn(
                        column
                    )
                        ? "normal"
                        : "nowrap",
            };
        };

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <div
            style={{
                width: "100%",
            }}
        >

            {/* ==================================================
                CURRENCY TOGGLE
            ================================================== */}

            {currencyToggle &&
                showCurrencyToggle && (
                    <div
                        style={{
                            display:
                                "flex",

                            justifyContent:
                                "flex-end",

                            alignItems:
                                "center",

                            marginBottom:
                                8,
                        }}
                    >
                        <div
                            style={{
                                display:
                                    "inline-flex",

                                alignItems:
                                    "center",

                                border:
                                    "1px solid #dbe3ef",

                                borderRadius:
                                    6,

                                padding: 2,

                                background:
                                    "#f8fafc",

                                gap: 2,
                            }}
                        >
                            {/* AED */}

                            <button
                                type="button"
                                onClick={() =>
                                    setCurrencyMode(
                                        "AED"
                                    )
                                }
                                style={{
                                    border:
                                        "none",

                                    borderRadius:
                                        5,

                                    padding:
                                        "5px 10px",

                                    fontSize:
                                        10,

                                    fontWeight:
                                        700,

                                    cursor:
                                        "pointer",

                                    background:
                                        currencyMode ===
                                            "AED"
                                            ? BLUE
                                            : "transparent",

                                    color:
                                        currencyMode ===
                                            "AED"
                                            ? "#ffffff"
                                            : "#475569",
                                }}
                            >
                                AED
                            </button>

                            {/* AED Millions */}

                            <button
                                type="button"
                                onClick={() =>
                                    setCurrencyMode(
                                        "AED_MILLIONS"
                                    )
                                }
                                style={{
                                    border:
                                        "none",

                                    borderRadius:
                                        5,

                                    padding:
                                        "5px 10px",

                                    fontSize:
                                        10,

                                    fontWeight:
                                        700,

                                    cursor:
                                        "pointer",

                                    background:
                                        currencyMode ===
                                            "AED_MILLIONS"
                                            ? BLUE
                                            : "transparent",

                                    color:
                                        currencyMode ===
                                            "AED_MILLIONS"
                                            ? "#ffffff"
                                            : "#475569",
                                }}
                            >
                                AED Millions
                            </button>
                        </div>
                    </div>
                )}

            {/* ==================================================
                TABLE CONTAINER
            ================================================== */}

            <div
                style={{
                    width: "100%",

                    overflowX:
                        shouldShowSubDivisionPercentage
                            ? "hidden"
                            : fitColumns &&
                                !subDivisionTableStyle &&
                                !useMonthOnMonthStyle
                                ? "hidden"
                                : "auto",

                    border:
                        "1px solid #e2e8f0",

                    borderRadius:
                        topSupplierStyle ||
                            subDivisionTableStyle ||
                            useMonthOnMonthStyle
                            ? 9
                            : 6,

                    position:
                        "relative",

                    background:
                        "#ffffff",

                    ...getSubDivisionTableStyle(),

                    boxShadow:
                        topSupplierStyle
                            ? "0 1px 3px rgba(15, 23, 42, 0.04)"
                            : subDivisionTableStyle
                                ? "0 1px 3px rgba(15, 23, 42, 0.04)"
                                : useMonthOnMonthStyle
                                    ? "0 1px 3px rgba(15, 23, 42, 0.04)"
                                    : "none",
                }}
            >

                <table
                    style={{
                        width: "100%",

                        minWidth:
                            shouldShowSubDivisionPercentage ||
                                topSupplierStyle
                                ? 0
                                : Math.max(
                                    fixedHierarchyColumns
                                        ? 1050
                                        : useMonthOnMonthStyle
                                            ? 850
                                            : subDivisionTableStyle
                                                ? 520
                                                : fitColumns
                                                    ? 0
                                                    : compact
                                                        ? 520
                                                        : 650,
                                    displayColumns.length *
                                    (
                                        useMonthOnMonthStyle
                                            ? 125
                                            : 115
                                    )
                                ),

                        tableLayout:
                            shouldShowSubDivisionPercentage
                                ? "fixed"
                                : fitColumns
                                    ? "fixed"
                                    : topSupplierStyle ||
                                        subDivisionTableStyle
                                        ? "fixed"
                                        : "auto",

                        borderCollapse:
                            "collapse",

                        fontSize:
                            useMonthOnMonthStyle
                                ? 12
                                : topSupplierStyle ||
                                    subDivisionTableStyle
                                    ? 13
                                    : 10,
                    }}
                >

                    {/* ==================================================
                        HEADER
                    ================================================== */}

                    <thead>
                        <tr>
                            {displayColumns.map(
                                (
                                    column,
                                    columnIndex
                                ) => {

                                    const isSupplier =
                                        isSupplierColumn(
                                            column
                                        );

                                    const isLegal =
                                        isLegalEntityColumn(
                                            column
                                        );

                                    const label =
                                        String(
                                            column?.label ||
                                            ""
                                        ).toLowerCase();

                                    const isRankColumn =
                                        label === "#" ||
                                        label ===
                                        "rank" ||
                                        column?.key ===
                                        "rank";

                                    const isPercentage =
                                        isPercentageColumn(
                                            column
                                        );

                                    return (
                                        <th
                                            key={
                                                column.key
                                            }
                                            style={{
                                                background:
                                                    useMonthOnMonthStyle
                                                        ? "#f7f9fc"
                                                        : topSupplierStyle ||
                                                            subDivisionTableStyle
                                                            ? "#eef3f9"
                                                            : "#eef4ff",

                                                color:
                                                    useMonthOnMonthStyle
                                                        ? BLUE
                                                        : topSupplierStyle ||
                                                            subDivisionTableStyle
                                                            ? "#294675"
                                                            : BLUE,

                                                fontWeight:
                                                    800,

                                                fontSize:
                                                    useMonthOnMonthStyle
                                                        ? 11
                                                        : subDivisionTableStyle
                                                            ? 10
                                                            : topSupplierStyle
                                                                ? 12
                                                                : 10,

                                                letterSpacing:
                                                    useMonthOnMonthStyle ||
                                                        topSupplierStyle ||
                                                        subDivisionTableStyle
                                                        ? "0.3px"
                                                        : "normal",

                                                padding:
                                                    useMonthOnMonthStyle
                                                        ? "10px 10px"
                                                        : subDivisionTableStyle
                                                            ? "8px 5px"
                                                            : topSupplierStyle
                                                                ? "10px 10px"
                                                                : monthColumnGap &&
                                                                    isMonthColumn(
                                                                        column
                                                                    )
                                                                    ? "8px 14px"
                                                                    : compactRows
                                                                        ? "6px 4px"
                                                                        : "8px 6px",

                                                borderBottom:
                                                    useMonthOnMonthStyle
                                                        ? "1px solid #d8e1ec"
                                                        : topSupplierStyle ||
                                                            subDivisionTableStyle
                                                            ? "1px solid #d7e1ec"
                                                            : "1px solid #dce5f4",

                                                borderRight:
                                                    useMonthOnMonthStyle
                                                        ? "1px solid #e3e9f1"
                                                        : "none",

                                                textAlign:
                                                    isRankColumn &&
                                                        (
                                                            topSupplierStyle ||
                                                            subDivisionTableStyle
                                                        )
                                                        ? "center"
                                                        : column.align ||
                                                        (
                                                            isPercentage
                                                                ? "right"
                                                                : "left"
                                                        ),

                                                verticalAlign:
                                                    "middle",

                                                whiteSpace:
                                                    useMonthOnMonthStyle
                                                        ? "nowrap"
                                                        : topSupplierStyle ||
                                                            subDivisionTableStyle
                                                            ? "nowrap"
                                                            : supplierTwoLine &&
                                                                isSupplier
                                                                ? "normal"
                                                                : widerLegalEntity &&
                                                                    isLegal
                                                                    ? "normal"
                                                                    : fitColumns
                                                                        ? "normal"
                                                                        : "nowrap",

                                                width:
                                                    subDivisionTableStyle &&
                                                        isSubDivisionColumn(
                                                            column
                                                        )
                                                        ? "50%"
                                                        : subDivisionTableStyle &&
                                                            String(column?.key || "").toLowerCase() ===
                                                            "amount"
                                                            ? "28%"
                                                            : subDivisionTableStyle &&
                                                                isPercentage
                                                                ? "22%"
                                                                : topSupplierStyle &&
                                                                    isRankColumn
                                                                    ? "8%"
                                                                    : topSupplierStyle &&
                                                                        isSupplier
                                                                        ? "47%"
                                                                        : topSupplierStyle &&
                                                                            String(column?.key || "").toLowerCase() ===
                                                                            "payable_amount"
                                                                            ? "24%"
                                                                            : topSupplierStyle &&
                                                                                isPercentage
                                                                                ? "21%"
                                                                                : widerLegalEntity &&
                                                                                    isLegal
                                                                                    ? 240
                                                                                    : fixedHierarchyColumns &&
                                                                                        isLegal
                                                                                        ? 220
                                                                                        : useMonthOnMonthStyle &&
                                                                                            isLegal
                                                                                            ? 240
                                                                                            : undefined,

                                                minWidth:
                                                    topSupplierStyle &&
                                                        isRankColumn
                                                        ? 48
                                                        : widerLegalEntity &&
                                                            isLegal
                                                            ? 240
                                                            : fixedHierarchyColumns &&
                                                                isLegal
                                                                ? 220
                                                                : useMonthOnMonthStyle &&
                                                                    isLegal
                                                                    ? 240
                                                                    : undefined,

                                                ...getFixedColumnStyle(
                                                    column,
                                                    columnIndex
                                                ),

                                                zIndex:
                                                    fixedHierarchyColumns &&
                                                        isFixedHierarchyColumn(
                                                            column
                                                        )
                                                        ? 6
                                                        : undefined,

                                                ...getMonthOnMonthHeaderStyle(),
                                            }}
                                        >
                                            {formatHeader(
                                                column.label
                                            )}
                                        </th>
                                    );
                                }
                            )}
                        </tr>
                    </thead>

                    {/* ==================================================
                        BODY
                    ================================================== */}

                    <tbody>
                        {paginatedRows.length ===
                            0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        displayColumns.length
                                    }
                                    style={{
                                        padding:
                                            "20px 10px",

                                        textAlign:
                                            "center",

                                        color:
                                            MUTED,

                                        fontSize:
                                            11,

                                        fontWeight:
                                            600,

                                        borderBottom:
                                            "none",
                                    }}
                                >
                                    {
                                        emptyMessage
                                    }
                                </td>
                            </tr>
                        ) : (
                            paginatedRows.map(
                                (
                                    row,
                                    rowIndex
                                ) => (
                                    <tr
                                        key={
                                            row.id ||
                                            row.supplier_id ||
                                            row.subdivision_id ||
                                            rowIndex
                                        }
                                        onClick={
                                            typeof onRowClick ===
                                                "function"
                                                ? () =>
                                                    onRowClick(
                                                        row,
                                                        rowIndex
                                                    )
                                                : undefined
                                        }
                                        style={{
                                            cursor:
                                                typeof onRowClick ===
                                                    "function"
                                                    ? "pointer"
                                                    : "default",

                                            transition:
                                                "background 0.15s ease",

                                            background:
                                                topSupplierStyle ||
                                                    subDivisionTableStyle
                                                    ? rowIndex %
                                                        2 ===
                                                        0
                                                        ? "#ffffff"
                                                        : "#fbfdff"
                                                    : "#ffffff",
                                        }}
                                    >
                                        {displayColumns.map(
                                            (
                                                column,
                                                columnIndex
                                            ) => {

                                                const cell =
                                                    renderCellValue(
                                                        row,
                                                        column
                                                    );

                                                const rawNumericSource =
                                                    shouldShowSubDivisionPercentage &&
                                                        isPercentageColumn(
                                                            column
                                                        )
                                                        ? getSubDivisionPercentage(
                                                            row
                                                        )
                                                        : shouldShowSupplierPercentage &&
                                                            String(column?.key || "").toLowerCase() ===
                                                            "__supplier_percentage"
                                                            ? getSupplierPercentage(row)
                                                            : row?.[
                                                            column.key
                                                            ] ??
                                                            (
                                                                column.render
                                                                    ? column.render(
                                                                        row
                                                                    )
                                                                    : undefined
                                                            );

                                                const numericValue =
                                                    getNumericValue(
                                                        rawNumericSource
                                                    );

                                                const isNegative =
                                                    negativeValuesRed &&
                                                    numericValue !==
                                                    null &&
                                                    numericValue <
                                                    0;

                                                const isSupplier =
                                                    isSupplierColumn(
                                                        column
                                                    );

                                                const isLegalEntity =
                                                    isLegalEntityColumn(
                                                        column
                                                    );

                                                const isFixed =
                                                    fixedHierarchyColumns &&
                                                    isFixedHierarchyColumn(
                                                        column
                                                    );

                                                const isPercentage =
                                                    isPercentageColumn(
                                                        column
                                                    );

                                                const label =
                                                    String(
                                                        column?.label ||
                                                        ""
                                                    ).toLowerCase();

                                                const isRankColumn =
                                                    label === "#" ||
                                                    label ===
                                                    "rank" ||
                                                    column?.key ===
                                                    "rank";

                                                return (
                                                    <td
                                                        key={
                                                            column.key
                                                        }
                                                        title={
                                                            cell?.title
                                                        }
                                                        onClick={
                                                            typeof onCellClick ===
                                                                "function"
                                                                ? (
                                                                    event
                                                                ) => {
                                                                    event.stopPropagation();

                                                                    onCellClick(
                                                                        row,
                                                                        column,
                                                                        rowIndex
                                                                    );
                                                                }
                                                                : undefined
                                                        }
                                                        style={{
                                                            padding:
                                                                useMonthOnMonthStyle
                                                                    ? "10px 10px"
                                                                    : topSupplierStyle ||
                                                                        subDivisionTableStyle
                                                                        ? "11px 10px"
                                                                        : monthColumnGap &&
                                                                            isMonthColumn(
                                                                                column
                                                                            )
                                                                            ? useIncreasedRowGap
                                                                                ? "15px 14px"
                                                                                : compactRows
                                                                                    ? "4px 14px"
                                                                                    : "7px 14px"
                                                                            : useIncreasedRowGap
                                                                                ? "18px 6px"
                                                                                : compactRows
                                                                                    ? "4px 6px"
                                                                                    : "7px 6px",
                                                            minHeight:
                                                                useMonthOnMonthStyle
                                                                    ? 42
                                                                    : topSupplierStyle ||
                                                                        subDivisionTableStyle
                                                                        ? 44
                                                                        : useIncreasedRowGap
                                                                            ? 48
                                                                            : undefined,

                                                            lineHeight:
                                                                useMonthOnMonthStyle
                                                                    ? "18px"
                                                                    : topSupplierStyle ||
                                                                        subDivisionTableStyle
                                                                        ? "20px"
                                                                        : useIncreasedRowGap
                                                                            ? "19px"
                                                                            : compactRows
                                                                                ? "14px"
                                                                                : "normal",

                                                            borderBottom:
                                                                rowIndex ===
                                                                    paginatedRows.length -
                                                                    1
                                                                    ? "none"
                                                                    : useMonthOnMonthStyle
                                                                        ? "1px solid #edf1f6"
                                                                        : topSupplierStyle ||
                                                                            subDivisionTableStyle
                                                                            ? "1px solid #e2e8f0"
                                                                            : "1px solid #edf1f6",

                                                            borderRight:
                                                                useMonthOnMonthStyle
                                                                    ? "1px solid #edf1f6"
                                                                    : "none",

                                                            color:
                                                                isNegative
                                                                    ? "#dc2626"
                                                                    : useMonthOnMonthStyle
                                                                        ? isPercentage
                                                                            ? "#334155"
                                                                            : "#17233f"
                                                                        : topSupplierStyle ||
                                                                            subDivisionTableStyle
                                                                            ? "#17233f"
                                                                            : "#334155",

                                                            fontWeight:
                                                                useMonthOnMonthStyle
                                                                    ? 600
                                                                    : topSupplierStyle ||
                                                                        subDivisionTableStyle
                                                                        ? 700
                                                                        : 700,

                                                            fontSize:
                                                                useMonthOnMonthStyle
                                                                    ? 12
                                                                    : topSupplierStyle ||
                                                                        subDivisionTableStyle
                                                                        ? 13
                                                                        : 10,

                                                            textAlign:
                                                                isRankColumn &&
                                                                    (
                                                                        topSupplierStyle ||
                                                                        subDivisionTableStyle
                                                                    )
                                                                    ? "center"
                                                                    : column.align ||
                                                                    (
                                                                        isPercentage
                                                                            ? "right"
                                                                            : "left"
                                                                    ),

                                                            verticalAlign:
                                                                "middle",

                                                            whiteSpace:
                                                                useMonthOnMonthStyle
                                                                    ? isLegalEntity
                                                                        ? "normal"
                                                                        : "nowrap"
                                                                    : topSupplierStyle ||
                                                                        subDivisionTableStyle
                                                                        ? "normal"
                                                                        : supplierTwoLine &&
                                                                            isSupplier
                                                                            ? "normal"
                                                                            : widerLegalEntity &&
                                                                                isLegalEntity
                                                                                ? "normal"
                                                                                : fitColumns
                                                                                    ? "normal"
                                                                                    : "nowrap",

                                                            overflow:
                                                                "visible",

                                                            textOverflow:
                                                                "clip",

                                                            minWidth:
                                                                topSupplierStyle &&
                                                                    isRankColumn
                                                                    ? 48
                                                                    : widerLegalEntity &&
                                                                        isLegalEntity
                                                                        ? 240
                                                                        : fixedHierarchyColumns &&
                                                                            isLegalEntity
                                                                            ? 220
                                                                            : useMonthOnMonthStyle &&
                                                                                isLegalEntity
                                                                                ? 240
                                                                                : undefined,

                                                            width:
                                                                topSupplierStyle &&
                                                                    isRankColumn
                                                                    ? 48
                                                                    : widerLegalEntity &&
                                                                        isLegalEntity
                                                                        ? 240
                                                                        : fixedHierarchyColumns &&
                                                                            isLegalEntity
                                                                            ? 220
                                                                            : useMonthOnMonthStyle &&
                                                                                isLegalEntity
                                                                                ? 240
                                                                                : undefined,

                                                            maxWidth:
                                                                widerLegalEntity &&
                                                                    isLegalEntity
                                                                    ? 240
                                                                    : useMonthOnMonthStyle &&
                                                                        isLegalEntity
                                                                        ? 240
                                                                        : topSupplierStyle &&
                                                                            isSupplier
                                                                            ? 250
                                                                            : supplierTwoLine &&
                                                                                isSupplier
                                                                                ? 250
                                                                                : truncateLegalEntity &&
                                                                                    isLegalEntity
                                                                                    ? 180
                                                                                    : undefined,

                                                            wordBreak:
                                                                useMonthOnMonthStyle &&
                                                                    isLegalEntity
                                                                    ? "break-word"
                                                                    : topSupplierStyle &&
                                                                        isSupplier
                                                                        ? "break-word"
                                                                        : widerLegalEntity &&
                                                                            isLegalEntity
                                                                            ? "break-word"
                                                                            : subDivisionTableStyle
                                                                                ? "break-word"
                                                                                : "normal",

                                                            ...getSupplierCellStyle(
                                                                isSupplier
                                                            ),

                                                            ...getFixedColumnStyle(
                                                                column,
                                                                columnIndex
                                                            ),

                                                            zIndex:
                                                                isFixed
                                                                    ? 3
                                                                    : undefined,

                                                            ...getMonthOnMonthCellStyle(
                                                                column,
                                                                isNegative
                                                            ),
                                                        }}
                                                    >

                                                        {/* ==================================================
                                                            SUPPLIER TEXT
                                                        ================================================== */}

                                                        {isSupplier ? (
                                                            <div
                                                                style={{
                                                                    ...getSupplierTextStyle(
                                                                        true
                                                                    ),

                                                                    textAlign:
                                                                        column.align ||
                                                                        "left",

                                                                    fontWeight:
                                                                        topSupplierStyle
                                                                            ? 700
                                                                            : undefined,

                                                                    color:
                                                                        topSupplierStyle
                                                                            ? "#17233f"
                                                                            : undefined,
                                                                }}
                                                            >
                                                                {
                                                                    cell?.display
                                                                }
                                                            </div>
                                                        ) : (
                                                            <span
                                                                style={{
                                                                    fontSize:
                                                                        useMonthOnMonthStyle
                                                                            ? 12
                                                                            : topSupplierStyle ||
                                                                                subDivisionTableStyle
                                                                                ? 13
                                                                                : undefined,

                                                                    fontWeight:
                                                                        useMonthOnMonthStyle
                                                                            ? 600
                                                                            : topSupplierStyle ||
                                                                                subDivisionTableStyle
                                                                                ? 700
                                                                                : undefined,

                                                                    color:
                                                                        isNegative
                                                                            ? "#dc2626"
                                                                            : useMonthOnMonthStyle
                                                                                ? isPercentage
                                                                                    ? "#334155"
                                                                                    : "#17233f"
                                                                                : topSupplierStyle ||
                                                                                    subDivisionTableStyle
                                                                                    ? "#334155"
                                                                                    : undefined,
                                                                }}
                                                            >
                                                                {
                                                                    cell?.display
                                                                }
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            }
                                        )}
                                    </tr>
                                )
                            )
                        )}

                        {/* ==================================================
                            TOTAL ROW
                        ================================================== */}

                        {totalRow && (
                            <tr>
                                {displayColumns.map(
                                    (
                                        column,
                                        columnIndex
                                    ) => {

                                        const cell =
                                            renderCellValue(
                                                totalRow,
                                                column
                                            );

                                        const isPercentage =
                                            isPercentageColumn(
                                                column
                                            );

                                        const rawNumericSource =
                                            shouldShowSubDivisionPercentage &&
                                                isPercentage
                                                ? 100
                                                : totalRow?.[
                                                column.key
                                                ] ??
                                                (
                                                    column.render
                                                        ? column.render(
                                                            totalRow
                                                        )
                                                        : undefined
                                                );

                                        const numericValue =
                                            getNumericValue(
                                                rawNumericSource
                                            );

                                        const isNegative =
                                            negativeValuesRed &&
                                            numericValue !==
                                            null &&
                                            numericValue <
                                            0;

                                        const label =
                                            String(
                                                column?.label ||
                                                ""
                                            ).toLowerCase();

                                        const isRankColumn =
                                            label === "#" ||
                                            label ===
                                            "rank" ||
                                            column?.key ===
                                            "rank";

                                        return (
                                            <td
                                                key={`total-${column.key}`}
                                                title={
                                                    cell?.title
                                                }
                                                style={{
                                                    padding:
                                                        useMonthOnMonthStyle
                                                            ? "11px 10px"
                                                            : topSupplierStyle
                                                                ? "16px 10px"
                                                                : subDivisionTableStyle
                                                                    ? "11px 10px"
                                                                    : monthColumnGap &&
                                                                        isMonthColumn(
                                                                            column
                                                                        )
                                                                        ? "9px 14px"
                                                                        : "9px 6px",

                                                    borderTop:
                                                        useMonthOnMonthStyle
                                                            ? "1px solid #d8e1ec"
                                                            : topSupplierStyle ||
                                                                subDivisionTableStyle
                                                                ? "1px solid #d8e1ec"
                                                                : "1px solid #d7e1ef",

                                                    borderBottom:
                                                        "none",

                                                    borderRight:
                                                        useMonthOnMonthStyle
                                                            ? "1px solid #e3e9f1"
                                                            : "none",

                                                    background:
                                                        useMonthOnMonthStyle
                                                            ? "#f7f9fc"
                                                            : topSupplierStyle ||
                                                                subDivisionTableStyle
                                                                ? "#f3f6fa"
                                                                : "#f8fbff",

                                                    color:
                                                        isNegative
                                                            ? "#dc2626"
                                                            : useMonthOnMonthStyle
                                                                ? "#17233f"
                                                                : topSupplierStyle ||
                                                                    subDivisionTableStyle
                                                                    ? "#17233f"
                                                                    : BLUE,

                                                    fontWeight:
                                                        800,

                                                    fontSize:
                                                        useMonthOnMonthStyle
                                                            ? 11
                                                            : topSupplierStyle ||
                                                                subDivisionTableStyle
                                                                ? 13
                                                                : 10,

                                                    textAlign:
                                                        isRankColumn &&
                                                            (
                                                                topSupplierStyle ||
                                                                subDivisionTableStyle
                                                            )
                                                            ? "center"
                                                            : column.align ||
                                                            (
                                                                isPercentage
                                                                    ? "right"
                                                                    : "left"
                                                            ),

                                                    verticalAlign:
                                                        "middle",

                                                    whiteSpace:
                                                        "nowrap",

                                                    ...getFixedColumnStyle(
                                                        column,
                                                        columnIndex
                                                    ),
                                                }}
                                            >
                                                {shouldShowSubDivisionPercentage &&
                                                    isPercentage
                                                    ? "100.00%"
                                                    : cell?.display}
                                            </td>
                                        );
                                    }
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ==================================================
                PAGINATION
            ================================================== */}

            {pagination &&
                safeRows.length >
                pageSize && (
                    <>
                        {/* ==================================================
                            PARENT DIVISION STYLE
                        ================================================== */}

                        {parentDivisionPaginationStyle ? (
                            <div
                                style={{
                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "flex-end",

                                    marginTop:
                                        10,

                                    padding:
                                        "0 2px",

                                    gap: 5,
                                }}
                            >

                                {/* First */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        goToPage(
                                            1
                                        )
                                    }
                                    disabled={
                                        currentPage ===
                                        1
                                    }
                                    style={getPaginationButtonStyle(
                                        {
                                            disabled:
                                                currentPage ===
                                                1,
                                        }
                                    )}
                                    title="First page"
                                >
                                    «
                                </button>

                                {/* Previous */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        goToPage(
                                            currentPage -
                                            1
                                        )
                                    }
                                    disabled={
                                        currentPage ===
                                        1
                                    }
                                    style={getPaginationButtonStyle(
                                        {
                                            disabled:
                                                currentPage ===
                                                1,
                                        }
                                    )}
                                    title="Previous page"
                                >
                                    ‹
                                </button>

                                {/* Current Page */}

                                <div
                                    style={getPaginationButtonStyle(
                                        {
                                            active:
                                                true,
                                        }
                                    )}
                                >
                                    {
                                        currentPage
                                    }
                                </div>

                                {/* Next */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        goToPage(
                                            currentPage +
                                            1
                                        )
                                    }
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    style={getPaginationButtonStyle(
                                        {
                                            disabled:
                                                currentPage ===
                                                totalPages,
                                        }
                                    )}
                                    title="Next page"
                                >
                                    ›
                                </button>

                                {/* Last */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        goToPage(
                                            totalPages
                                        )
                                    }
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    style={getPaginationButtonStyle(
                                        {
                                            disabled:
                                                currentPage ===
                                                totalPages,
                                        }
                                    )}
                                    title="Last page"
                                >
                                    »
                                </button>
                            </div>
                        ) : modernPagination ? (

                            /* ==================================================
                                MODERN PAGINATION
                            ================================================== */

                            <div
                                style={{
                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "space-between",

                                    marginTop:
                                        12,

                                    padding:
                                        "0 3px",

                                    gap: 12,
                                }}
                            >

                                {/* Left */}

                                <div
                                    style={{
                                        fontSize:
                                            10,

                                        color:
                                            "#64748b",

                                        fontWeight:
                                            600,

                                        whiteSpace:
                                            "nowrap",
                                    }}
                                >
                                    Showing{" "}
                                    <span
                                        style={{
                                            color:
                                                "#334155",

                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        {Math.min(
                                            (
                                                currentPage -
                                                1
                                            ) *
                                            pageSize +
                                            1,
                                            safeRows.length
                                        )}
                                    </span>{" "}
                                    -{" "}
                                    <span
                                        style={{
                                            color:
                                                "#334155",

                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        {Math.min(
                                            currentPage *
                                            pageSize,
                                            safeRows.length
                                        )}
                                    </span>{" "}
                                    of{" "}
                                    <span
                                        style={{
                                            color:
                                                "#334155",

                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        {
                                            safeRows.length
                                        }
                                    </span>
                                </div>

                                {/* Right */}

                                <div
                                    style={{
                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        gap: 5,
                                    }}
                                >

                                    {/* First */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            goToPage(
                                                1
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        style={getPaginationButtonStyle(
                                            {
                                                disabled:
                                                    currentPage ===
                                                    1,
                                            }
                                        )}
                                    >
                                        «
                                    </button>

                                    {/* Previous */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            goToPage(
                                                currentPage -
                                                1
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        style={getPaginationButtonStyle(
                                            {
                                                disabled:
                                                    currentPage ===
                                                    1,
                                            }
                                        )}
                                    >
                                        ‹
                                    </button>

                                    {/* Page Numbers */}

                                    {getPageNumbers().map(
                                        (
                                            page,
                                            index
                                        ) => {

                                            if (
                                                page ===
                                                "..."
                                            ) {
                                                return (
                                                    <span
                                                        key={`ellipsis-${index}`}
                                                        style={{
                                                            minWidth:
                                                                24,

                                                            textAlign:
                                                                "center",

                                                            color:
                                                                "#94a3b8",

                                                            fontSize:
                                                                11,

                                                            fontWeight:
                                                                700,
                                                        }}
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={
                                                        page
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        goToPage(
                                                            page
                                                        )
                                                    }
                                                    style={getPaginationButtonStyle(
                                                        {
                                                            active:
                                                                currentPage ===
                                                                page,
                                                        }
                                                    )}
                                                >
                                                    {
                                                        page
                                                    }
                                                </button>
                                            );
                                        }
                                    )}

                                    {/* Next */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            goToPage(
                                                currentPage +
                                                1
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        style={getPaginationButtonStyle(
                                            {
                                                disabled:
                                                    currentPage ===
                                                    totalPages,
                                            }
                                        )}
                                    >
                                        ›
                                    </button>

                                    {/* Last */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            goToPage(
                                                totalPages
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        style={getPaginationButtonStyle(
                                            {
                                                disabled:
                                                    currentPage ===
                                                    totalPages,
                                            }
                                        )}
                                    >
                                        »
                                    </button>
                                </div>
                            </div>
                        ) : (

                            /* ==================================================
                                EXISTING PAGINATION
                            ================================================== */

                            <div
                                style={{
                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "space-between",

                                    marginTop:
                                        10,

                                    padding:
                                        "0 2px",
                                }}
                            >

                                {/* Showing */}

                                <div
                                    style={{
                                        fontSize:
                                            10,

                                        color:
                                            "#64748b",

                                        fontWeight:
                                            600,
                                    }}
                                >
                                    Showing{" "}
                                    {Math.min(
                                        (
                                            currentPage -
                                            1
                                        ) *
                                        pageSize +
                                        1,
                                        safeRows.length
                                    )}{" "}
                                    -{" "}
                                    {Math.min(
                                        currentPage *
                                        pageSize,
                                        safeRows.length
                                    )}{" "}
                                    of{" "}
                                    {
                                        safeRows.length
                                    }
                                </div>

                                {/* Pagination */}

                                <div
                                    style={{
                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        gap: 5,
                                    }}
                                >

                                    {/* First */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            goToPage(
                                                1
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        style={getPaginationButtonStyle(
                                            {
                                                disabled:
                                                    currentPage ===
                                                    1,
                                            }
                                        )}
                                    >
                                        «
                                    </button>

                                    {/* Previous */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            goToPage(
                                                currentPage -
                                                1
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            1
                                        }
                                        style={getPaginationButtonStyle(
                                            {
                                                disabled:
                                                    currentPage ===
                                                    1,
                                            }
                                        )}
                                    >
                                        ‹
                                    </button>

                                    {/* Current */}

                                    <div
                                        style={getPaginationButtonStyle(
                                            {
                                                active:
                                                    true,
                                            }
                                        )}
                                    >
                                        {
                                            currentPage
                                        }
                                    </div>

                                    {/* Next */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            goToPage(
                                                currentPage +
                                                1
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        style={getPaginationButtonStyle(
                                            {
                                                disabled:
                                                    currentPage ===
                                                    totalPages,
                                            }
                                        )}
                                    >
                                        ›
                                    </button>

                                    {/* Last */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            goToPage(
                                                totalPages
                                            )
                                        }
                                        disabled={
                                            currentPage ===
                                            totalPages
                                        }
                                        style={getPaginationButtonStyle(
                                            {
                                                disabled:
                                                    currentPage ===
                                                    totalPages,
                                            }
                                        )}
                                    >
                                        »
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
        </div>
    );
}
/* ============================================================
   SALES-STYLE PAGE SKELETON — UI ONLY
   ============================================================ */
function PayablesPageSkeleton() {
    return (
        <div className="payables-page-skeleton" aria-hidden="true">
            <div className="payables-skeleton-kpis">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div className="payables-skeleton-card" key={index}>
                        <div className="payables-skeleton-icon" />
                        <div className="payables-skeleton-copy">
                            <div className="payables-skeleton-line short" />
                            <div className="payables-skeleton-line value" />
                            <div className="payables-skeleton-line tiny" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="payables-skeleton-grid three">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div className="payables-skeleton-panel" key={index}>
                        <div className="payables-skeleton-line title" />
                        <div className="payables-skeleton-chart" />
                    </div>
                ))}
            </div>
            <div className="payables-skeleton-grid three">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div className="payables-skeleton-panel compact" key={index}>
                        <div className="payables-skeleton-line title" />
                        <div className="payables-skeleton-table-line" />
                        <div className="payables-skeleton-table-line" />
                        <div className="payables-skeleton-table-line" />
                        <div className="payables-skeleton-table-line" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function PayablesDashboard() {
    const [filters, setFilters] = useState({
        ...defaultPayablesFilters,
    });

    const [appliedFilters, setAppliedFilters] = useState({
        ...defaultPayablesFilters,
    });

    const [showFilters, setShowFilters] = useState(true);
    const [showViewAll, setShowViewAll] = useState(false);
    const [viewAllSection, setViewAllSection] = useState("all");
    const [viewAllDetailFilters, setViewAllDetailFilters] = useState({});
    const [monthCurrencyMode, setMonthCurrencyMode] = useState("AED");
    const [monthOnMonthYear, setMonthOnMonthYear] = useState(defaultPayablesFilters.year);
    const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        legal_groups: [],
        legal_entities: [],
        parent_divisions: [],
        sub_divisions: [],
        reporting_currencies: [],
        as_on_dates: [],
        aging_basis: [],
        years: [],
    });
    const [data, setData] = useState(emptyDashboardData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const kpis = data.kpis || {};
    const currency = appliedFilters.reporting_currency || "AED";

    useEffect(() => {
        let active = true;

        const loadFilterOptions = async () => {
            try {
                const response = await getPayablesFilterOptions();
                if (!active) return;

                const normalized = normalizeFilterOptions(response);
                setFilterOptions(normalized);
                setFilterOptionsLoaded(true);

                const initial = {
                    legal_group: ["All"],
                    legal_entities: ["All"],
                    parent_divisions: ["All"],
                    sub_divisions: ["All"],
                    reporting_currency:
                        firstOptionLabel(normalized.reporting_currencies, "AED"),
                    as_on_date:
                        firstOptionLabel(normalized.as_on_dates, ""),
                    aging_basis:
                        displayAgingBasis(
                            firstOptionLabel(normalized.aging_basis, "DUE_DATE")
                        ),
                    year:
                        normalized.years.length
                            ? normalized.years[normalized.years.length - 1]
                            : new Date().getFullYear(),
                };

                setFilters(initial);
                setAppliedFilters(initial);
            } catch (requestError) {
                console.error("Payables filter options failed", requestError);
                if (active) {
                    setError(
                        requestError?.response?.data?.detail ||
                        requestError?.message ||
                        "Failed to load Payables filter options."
                    );
                }
            }
        };

        loadFilterOptions();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            if (!filterOptionsLoaded || !appliedFilters.as_on_date) return;

            setLoading(true);
            setError("");

            try {
                const apiFilters = buildPayablesApiFilters(
                    appliedFilters,
                    filterOptions
                );
                /*
                 * Keep the existing dashboard integration intact.
                 * The newly deployed Sub-Division and Month-on-Month endpoints
                 * are loaded separately so a failure in either new endpoint
                 * does not break the existing dashboard response.
                 */
                const [dashboardResult, subdivisionResult, monthOnMonthResult] =
                    await Promise.allSettled([
                        getPayablesDashboard(apiFilters),
                        getPayablesBySubdivision(apiFilters),
                        getPayablesMonthOnMonth({
                            ...apiFilters,
                            year: appliedFilters.year,
                        }),
                    ]);

                if (!active) return;

                if (dashboardResult.status === "rejected") {
                    throw dashboardResult.reason;
                }

                const dashboardData = normalizeDashboardResponse(
                    dashboardResult.value
                );

                const subdivisionData =
                    subdivisionResult.status === "fulfilled"
                        ? normalizeSubdivisionResponse(subdivisionResult.value)
                        : [];

                const monthOnMonthResponse =
                    monthOnMonthResult.status === "fulfilled"
                        ? monthOnMonthResult.value
                        : null;

                const monthOnMonthData = monthOnMonthResponse
                    ? normalizeMonthOnMonthResponse(monthOnMonthResponse)
                    : [];

                /*
                 * Preserve the year returned by the Month-on-Month API even when
                 * the response shape is { data: [...], year: 2026 }.
                 * This year drives the Month-on-Month header dropdown.
                 */
                const monthOnMonthPayload =
                    monthOnMonthResponse?.data?.data ??
                    monthOnMonthResponse?.data ??
                    monthOnMonthResponse ??
                    {};

                const returnedMonthOnMonthYear = Number(
                    monthOnMonthResponse?.data?.year ??
                    monthOnMonthResponse?.data?.selected_year ??
                    monthOnMonthResponse?.data?.selectedYear ??
                    monthOnMonthResponse?.year ??
                    monthOnMonthResponse?.selected_year ??
                    monthOnMonthResponse?.selectedYear ??
                    monthOnMonthPayload?.year ??
                    monthOnMonthPayload?.selected_year ??
                    monthOnMonthPayload?.selectedYear ??
                    appliedFilters.year
                );

                setData({
                    ...dashboardData,
                    subDivision: subdivisionData,
                    monthOnMonth: monthOnMonthData,
                    monthOnMonthYear: Number.isFinite(returnedMonthOnMonthYear)
                        ? returnedMonthOnMonthYear
                        : appliedFilters.year,
                });
                setMonthOnMonthYear(
                    Number.isFinite(returnedMonthOnMonthYear)
                        ? returnedMonthOnMonthYear
                        : appliedFilters.year
                );

                if (subdivisionResult.status === "rejected") {
                    console.error(
                        "Payables Sub-Division API failed",
                        subdivisionResult.reason
                    );
                }

                if (monthOnMonthResult.status === "rejected") {
                    console.error(
                        "Payables Month-on-Month API failed",
                        monthOnMonthResult.reason
                    );
                }
            } catch (requestError) {
                console.error("Payables dashboard failed", requestError);
                if (active) {
                    setData(emptyDashboardData);
                    setError(
                        requestError?.response?.data?.detail ||
                        requestError?.message ||
                        "Failed to load Payables dashboard."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadDashboard();

        return () => {
            active = false;
        };
    }, [appliedFilters, filterOptions, filterOptionsLoaded]);

    const setFilter = (key, value) => {
        setFilters((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const handleApply = () => {
        /*
         * IMPORTANT:
         * aging_basis is preserved exactly here.
         * Future API calls should send:
         *
         * {
         *   ...filters,
         *   aging_basis: filters.aging_basis
         * }
         */
        setAppliedFilters({
            ...filters,
            aging_basis: displayAgingBasis(filters.aging_basis),
        });
    };

    const handleReset = () => {
        const reset = {
            legal_group: ["All"],
            legal_entities: ["All"],
            parent_divisions: ["All"],
            sub_divisions: ["All"],
            reporting_currency:
                firstOptionLabel(filterOptions.reporting_currencies, "AED"),
            as_on_date:
                firstOptionLabel(filterOptions.as_on_dates, ""),
            aging_basis: displayAgingBasis(
                firstOptionLabel(filterOptions.aging_basis, "DUE_DATE")
            ),
            year:
                filterOptions.years?.length
                    ? filterOptions.years[filterOptions.years.length - 1]
                    : new Date().getFullYear(),
        };

        setFilters(reset);
        setAppliedFilters(reset);
    };

    const handleExport = async (format) => {
        try {
            const apiFilters = buildPayablesApiFilters(
                appliedFilters,
                filterOptions
            );

            const response =
                format === "excel"
                    ? await exportPayablesExcel(apiFilters)
                    : await exportPayablesPdf(apiFilters);

            const blob = response?.data;

            if (!(blob instanceof Blob)) {
                throw new Error("Export response did not contain a downloadable file.");
            }

            const contentDisposition =
                response?.headers?.["content-disposition"] ||
                response?.headers?.["Content-Disposition"] ||
                "";

            const filenameMatch = contentDisposition.match(
                /filename\*?=(?:UTF-8''|")?([^";\n]+)"?/i
            );

            const fallbackName =
                format === "excel"
                    ? "Payables_Report.xlsx"
                    : "Payables_Report.pdf";

            const filename = filenameMatch?.[1]
                ? decodeURIComponent(filenameMatch[1])
                : fallbackName;

            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");

            anchor.href = url;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Payables export failed", error);

            setError(
                error?.response?.data?.detail ||
                error?.message ||
                `Failed to export Payables ${format === "excel" ? "Excel" : "PDF"}.`
            );
        }
    };

    const openPayablesViewAll = (
        section = "all",
        detailFilters = {}
    ) => {
        setViewAllSection(section);
        setViewAllDetailFilters(detailFilters || {});
        setShowViewAll(true);
    };

    const openPayablesRecordViewAll = (detailFilters = {}) => {
        openPayablesViewAll("all", detailFilters);
    };

    const handleAgingDrillDown = (row) => {
        const bucketCode =
            row?.bucket_code ??
            row?.bucket ??
            row?.code;

        const normalizedBucket = toAgingBucketCode(bucketCode);

        if (normalizedBucket) {
            openPayablesRecordViewAll({
                aging_bucket: normalizedBucket,
            });
        }
    };

    const handleTrendDrillDown = (point) => {
        const snapshotDate =
            point?.as_on_date ??
            point?.snapshot_date ??
            point?.date;

        if (snapshotDate) {
            openPayablesRecordViewAll({
                as_on_date: toApiDate(snapshotDate),
            });
        }
    };

    const handleParentDivisionDrillDown = (row) => {
        const id =
            row?.parent_division_id ??
            row?.parentDivisionId ??
            row?.value ??
            row?.id;

        if (id !== undefined && id !== null && id !== "") {
            openPayablesRecordViewAll({
                parent_division_id: id,
            });
        }
    };

    const handleSupplierDrillDown = (row) => {
        const id =
            row?.supplier_id ??
            row?.supplierId ??
            row?.supplier_code ??
            row?.id;

        if (id !== undefined && id !== null && id !== "") {
            openPayablesRecordViewAll({
                supplier_id: id,
            });
        }
    };

    const handleOverdueDrillDown = () => {
        openPayablesRecordViewAll({
            balance_status: "OVERDUE",
        });
    };

    const handleOverdueAbove90DrillDown = () => {
        openPayablesRecordViewAll({
            balance_status: "OVERDUE_ABOVE_90",
        });
    };

    const handleSubdivisionDrillDown = (row) => {
        const id =
            row?.subdivision_id ??
            row?.sub_division_id ??
            row?.subdivisionId ??
            row?.id;

        if (id !== undefined && id !== null && id !== "") {
            openPayablesRecordViewAll({
                subdivision_id: id,
            });
        }
    };

    const getMoMSnapshotDate = (row, month) => {
        const snapshotDates =
            row?.snapshot_dates ??
            row?.snapshotDates ??
            {};

        return (
            snapshotDates?.[month] ??
            snapshotDates?.[String(month).toUpperCase()] ??
            null
        );
    };

    const handleMoMDrillDown = (row, month) => {
        const snapshotDate = getMoMSnapshotDate(row, month);

        const detailFilters = {
            ...(row?.legal_entity_id != null
                ? { legal_entity_id: row.legal_entity_id }
                : {}),
            ...(row?.parent_division_id != null
                ? { parent_division_id: row.parent_division_id }
                : {}),
            ...(row?.subdivision_id != null
                ? { subdivision_id: row.subdivision_id }
                : row?.sub_division_id != null
                    ? { subdivision_id: row.sub_division_id }
                    : {}),
            ...(snapshotDate
                ? { as_on_date: toApiDate(snapshotDate) }
                : {}),
        };

        if (Object.keys(detailFilters).length > 0) {
            openPayablesRecordViewAll(detailFilters);
        }
    };

    const mainLegalEntities = cascadeLegalEntities(filterOptions.legal_entities, filters.legal_group);
    const mainParentDivisions = cascadeParentDivisions(filterOptions.parent_divisions, filters.legal_entities, filters.legal_group);
    const mainSubDivisions = cascadeSubDivisions(filterOptions.sub_divisions, filters.parent_divisions, filters.legal_entities, filters.legal_group);

    const supplierRows = data.topSuppliers;

    const supplierColumns = [
        {
            key: "rank",
            label: "#",
            align: "left",
        },
        {
            key: "supplier_name",
            label: "Supplier Name",
            align: "left",
        },
        {
            key: "payable_amount",
            label: `Payables (${currency})`,
            align: "right",
            render: (row) =>
                formatPayablesCompact(row.payable_amount, currency),
        },
        {
            key: "percentage",
            label: "% of Total",
            align: "right",
            render: (row) => formatPercentage(row.percentage),
        },
    ];

    const subDivisionColumns = [
        {
            key: "name",
            label: "Sub-Division",
        },
        {
            key: "amount",
            label: `Payables (${currency})`,
            align: "right",
            render: (row) =>
                formatPayablesCompact(row.amount, currency),
        },
        {
            key: "percentage",
            label: "% of Total",
            align: "right",
            render: (row) => formatPercentage(row.percentage),
        },
    ];

    const monthColumns = [
        {
            key: "legal_entity",
            label: "Legal Entity",
        },
        {
            key: "parent_division",
            label: "Parent Division",
        },
        {
            key: "sub_division",
            label: "Sub-Division",
        },
        ...MONTHS.map((month) => ({
            key: month,
            label: month,
            align: "right",
            render: (row) => formatMoMValue(row[month]),
        })),
        {
            key: "latest",
            label: "Latest",
            align: "right",
            render: (row) => formatMoMValue(row.latest),
        },
    ];

    return (
        <div
            className="payables-sales-ui"
            style={{
                minHeight: "100vh",
                background: BG,
                fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: TEXT,
            }}
        >
            {/* UI-only styling aligned to the Sales Revenue Report.
          No API, state, data mapping, event handler, or business logic is changed. */}
            <style>{`
        .payables-sales-ui {
          --sales-navy: #0f172a;
          --sales-slate: #64748b;
          --sales-blue: #4f46e5;
          --sales-border: rgba(0,0,0,0.04);
          --sales-bg: #f8fafc;
          --sales-surface: #ffffff;
          --sales-border-strong: #e2e8f0;
        }
        .payables-sales-ui, .payables-sales-ui * { box-sizing: border-box; }
        .payables-sales-ui {
          background: var(--sales-bg) !important;
          color: var(--sales-navy);
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }
        .payables-sales-ui main {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
          color: var(--sales-navy);
          animation: fadeInUp 0.35s ease forwards;
        }
        .payables-sales-ui h1 {
          color: var(--sales-navy) !important;
          font-size: 1.45rem !important;
          font-weight: 800 !important;
          line-height: 1.15 !important;
          letter-spacing: -0.02em !important;
        }
        .payables-sales-ui .sales-style-subtitle {
          color: var(--sales-slate) !important;
          font-size: 0.78rem !important;
          line-height: 1.45 !important;
        }
        .payables-sales-ui .sales-style-filter-bar {
          padding: 10px 14px !important;
          margin-top: 0 !important;
          margin-bottom: 16px !important;
          gap: 6px !important;
          border: 1px solid var(--sales-border) !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.03) !important;
          background: #fff !important;
        }
        .payables-sales-ui .sales-style-filter-bar {
          display: grid !important;
          grid-template-columns: repeat(7, minmax(0, 1fr)) auto auto !important;
          align-items: end !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .payables-sales-ui .sales-style-filter-bar > div {
          min-width: 0 !important;
          width: 100% !important;
          max-width: none !important;
        }
        .payables-sales-ui .sales-style-filter-bar > button {
          width: auto !important;
          min-width: 72px !important;
        }
        .payables-sales-ui .sales-style-filter-bar label {
          color: #1e3a8a !important;
          font-size: 0.66rem !important;
          font-weight: 700 !important;
          line-height: 1.2 !important;
          margin-bottom: 4px !important;
        }
        .payables-sales-ui .sales-style-filter-bar input,
        .payables-sales-ui .sales-style-filter-bar select,
        .payables-sales-ui .sales-style-filter-bar > div > button {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }
        .payables-sales-ui .sales-style-filter-bar > div > button {
          height: 32px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 7px !important;
          background: #fff !important;
          color: #334155 !important;
          font-size: 0.72rem !important;
          font-weight: 600 !important;
          box-shadow: none !important;
          transition: all 0.15s !important;
        }
        .payables-sales-ui .sales-style-filter-bar > div > button:hover {
          border-color: #c7d2fe !important;
          background: #f8fafc !important;
        }
        .payables-sales-ui .sales-style-filter-bar input,
        .payables-sales-ui .sales-style-filter-bar select {
          min-height: 32px !important;
          height: 32px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 7px !important;
          background: #fff !important;
          color: #334155 !important;
          font-size: 0.72rem !important;
          font-weight: 600 !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .payables-sales-ui .sales-style-filter-bar input[type="date"] {
          width: 100% !important;
          min-width: 0 !important;
          padding-left: 26px !important;
          padding-right: 6px !important;
        }
        .payables-sales-ui .sales-style-filter-bar input:focus,
        .payables-sales-ui .sales-style-filter-bar select:focus,
        .payables-sales-ui .sales-style-filter-bar > div > button:focus-visible {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,.10) !important;
          outline: none !important;
        }
        .payables-sales-ui .sales-style-filter-bar button {
          transition: all 0.15s ease !important;
        }
        .payables-sales-ui .sales-style-filter-bar button#btn-apply-filter {
          background: #4f46e5 !important;
          color: #fff !important;
          border: 1px solid #4f46e5 !important;
          border-radius: 7px !important;
          font-size: 0.70rem !important;
          font-weight: 700 !important;
          box-shadow: none !important;
        }
        .payables-sales-ui .sales-style-filter-bar button#btn-apply-filter:hover {
          background: #4338ca !important;
          border-color: #4338ca !important;
          transform: translateY(-1px);
        }
        .payables-sales-ui .sales-style-filter-bar button#btn-reset-filter {
          background: #fff !important;
          color: #64748b !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 7px !important;
          font-size: 0.70rem !important;
          font-weight: 600 !important;
          box-shadow: none !important;
        }
        .payables-sales-ui .sales-style-filter-bar button#btn-reset-filter:hover {
          background: #f8fafc !important;
          color: #334155 !important;
          border-color: #cbd5e1 !important;
        }
        .payables-sales-ui .payables-row-2 > section {
          height: 100% !important;
          min-height: 0 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .payables-sales-ui .payables-row-2 > section > :last-child {
          min-height: 0;
        }
        .payables-sales-ui .payables-kpi-grid {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
          gap: 10px !important;
          margin-top: 0 !important;
          margin-bottom: 16px !important;
        }
        .payables-sales-ui .sales-style-kpi {
          border: none !important;
          border-radius: 12px !important;
          padding: 10px !important;
          min-height: 74px !important;
          box-shadow: none !important;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1) !important;
        }
        .payables-sales-ui .sales-style-kpi:hover {
          box-shadow: 0 8px 24px rgba(37,99,235,0.10) !important;
          transform: translateY(-2px) !important;
        }
        .payables-sales-ui section {
          background: #fff !important;
          border: 1px solid rgba(0,0,0,0.04) !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.03) !important;
          transition: box-shadow 0.2s cubic-bezier(0.4,0,0.2,1) !important;
        }
        .payables-sales-ui section:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
        }
        .payables-sales-ui table th {
          padding: 10px 16px !important;
          font-size: 0.74rem !important;
          font-weight: 700 !important;
          color: #1e3a8a !important;
          background: #f8fafc !important;
          border-bottom: 2px solid #e2e8f0 !important;
          white-space: nowrap;
        }
        .payables-sales-ui table td {
          padding: 8px 16px !important;
          font-size: 0.74rem !important;
          color: #334155 !important;
          border-bottom-color: #f1f5f9 !important;
        }
        .payables-sales-ui table tbody tr { transition: background 0.12s ease !important; }
        .payables-sales-ui table tbody tr:hover td { background: #f8fafc !important; }
        .payables-sales-ui .payables-page-skeleton { display: block; width: 100%; margin-top: 4px; }
        .payables-sales-ui .payables-skeleton-kpis,
        .payables-sales-ui .payables-skeleton-grid { display: grid; gap: 10px; width: 100%; margin-bottom: 10px; }
        .payables-sales-ui .payables-skeleton-kpis { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
        .payables-sales-ui .payables-skeleton-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .payables-sales-ui .payables-skeleton-card,
        .payables-sales-ui .payables-skeleton-panel {
          background: #fff; border: 1px solid rgba(0,0,0,0.04); border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.03);
        }
        .payables-sales-ui .payables-skeleton-card { min-height: 74px; padding: 10px; display: flex; align-items: center; gap: 8px; }
        .payables-sales-ui .payables-skeleton-panel { min-height: 280px; padding: 14px 16px; }
        .payables-sales-ui .payables-skeleton-panel.compact { min-height: 250px; }
        .payables-sales-ui .payables-skeleton-icon { width: 32px; height: 32px; border-radius: 50%; flex: 0 0 32px; background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        .payables-sales-ui .payables-skeleton-copy { flex: 1; min-width: 0; }
        .payables-sales-ui .payables-skeleton-line,
        .payables-sales-ui .payables-skeleton-chart,
        .payables-sales-ui .payables-skeleton-table-line { background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        .payables-sales-ui .payables-skeleton-line { height: 9px; border-radius: 5px; }
        .payables-sales-ui .payables-skeleton-line.short { width: 55%; margin-bottom: 8px; }
        .payables-sales-ui .payables-skeleton-line.value { width: 78%; height: 15px; margin-bottom: 7px; }
        .payables-sales-ui .payables-skeleton-line.tiny { width: 42%; height: 7px; }
        .payables-sales-ui .payables-skeleton-line.title { width: 42%; margin-bottom: 18px; }
        .payables-sales-ui .payables-skeleton-chart { width: 100%; height: 205px; border-radius: 9px; }
        .payables-sales-ui .payables-skeleton-table-line { width: 100%; height: 10px; border-radius: 5px; margin: 14px 0; }
        .payables-sales-ui .payables-action-menu button { border-radius: 6px; }
        .payables-sales-ui .payables-action-menu > button:hover { background: #f1f5f9 !important; }
        .payables-sales-ui .payables-action-menu > div {
          animation: scaleUp 0.14s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .payables-sales-ui .sales-style-view-all-modal {
          position: fixed !important;
          top: 0 !important;
          left: 50% !important;
          right: auto !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 96vw !important;
          max-width: 1540px !important;
          height: 100vh !important;
          max-height: 100vh !important;
          transform: translateX(-50%) !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          box-shadow: 0 0 0 100vmax rgba(15,23,42,0.35), 0 20px 60px rgba(0,0,0,0.18) !important;
          background: #fff !important;
          animation: payablesViewAllModalIn 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards !important;
        }
        .payables-sales-ui .sales-style-view-all-modal input,
        .payables-sales-ui .sales-style-view-all-modal select {
          border-radius: 8px !important; font-size: 0.74rem !important;
          border-color: #e2e8f0 !important; color: #334155 !important;
          background: #fff !important;
        }
        .payables-sales-ui button { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        @keyframes payablesViewAllModalIn {
          from { transform: translateX(-50%) scale(0.97); opacity: 0; }
          to { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .payables-sales-ui .payables-sales-main { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .payables-sales-ui .sales-style-filter-bar { min-height: 58px; }
        .payables-sales-ui .sales-style-filter-bar > div { min-width: 88px; }
        .payables-sales-ui .sales-style-view-all-modal { overflow-y: auto !important; overflow-x: hidden !important; }
        .payables-sales-ui .sales-style-view-all-modal > div:not([aria-hidden]) { box-sizing: border-box; }
        .payables-sales-ui .sales-style-view-all-modal table th { position: sticky; top: 0; z-index: 3; }
        .payables-sales-ui .sales-style-view-all-modal button:hover { transform: translateY(-1px); }
        .payables-sales-ui .sales-style-view-all-modal input:focus,
        .payables-sales-ui .sales-style-view-all-modal select:focus { border-color: #818cf8 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.10) !important; outline: none; }

        @media (max-width: 1200px) { .payables-sales-ui .payables-skeleton-grid.three { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 800px) {
          .payables-sales-ui .payables-skeleton-grid.three { grid-template-columns: 1fr; }
          .payables-sales-ui .sales-style-filter-bar { align-items: stretch !important; }
          .payables-sales-ui .sales-style-filter-bar > div { flex: 1 1 120px !important; }
        }

        /* ============================================================
           SALES REVENUE DESIGN SYSTEM — PAYABLES UI ONLY
           Typography, spacing, cards, tables, filters and effects.
           No API / state / data / event logic is changed.
        ============================================================ */

        .payables-sales-ui,
        .payables-sales-ui button,
        .payables-sales-ui input,
        .payables-sales-ui select,
        .payables-sales-ui textarea,
        .payables-sales-ui table,
        .payables-sales-ui th,
        .payables-sales-ui td {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }

        .payables-sales-ui {
          --payables-text: #0f172a;
          --payables-muted: #64748b;
          --payables-slate: #475569;
          --payables-blue: #4f46e5;
          --payables-dark-blue: #1e3a8a;
          --payables-border: rgba(0,0,0,0.04);
          --payables-border-strong: #e2e8f0;
          --payables-bg: #f8fafc;
          --payables-surface: #ffffff;
          --payables-card-shadow: 0 4px 24px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.03);
          --payables-hover-shadow: 0 4px 12px rgba(0,0,0,0.05);
          color: var(--payables-text) !important;
          background: var(--payables-bg) !important;
          line-height: 1.5 !important;
        }

        /* Page heading / subtitle */
        .payables-sales-ui h1 {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
          font-size: 1.45rem !important;
          line-height: 1.15 !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em !important;
          color: #0f172a !important;
        }

        .payables-sales-ui h2,
        .payables-sales-ui h3 {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
          color: #0f172a !important;
          letter-spacing: -0.01em !important;
        }

        .payables-sales-ui .sales-style-subtitle {
          font-size: 0.78rem !important;
          line-height: 1.45 !important;
          font-weight: 500 !important;
          color: #64748b !important;
        }

        /* Consistent page sections / cards */
        .payables-sales-ui section {
          background: #fff !important;
          border: 1px solid rgba(0,0,0,0.04) !important;
          border-radius: 16px !important;
          box-shadow: var(--payables-card-shadow) !important;
          transition: box-shadow 0.20s cubic-bezier(0.4,0,0.2,1),
                      transform 0.20s cubic-bezier(0.4,0,0.2,1) !important;
        }

        .payables-sales-ui section:hover {
          box-shadow: var(--payables-hover-shadow) !important;
        }

        /* Filters — same compact Sales Revenue treatment */
        .payables-sales-ui .sales-style-filter-bar {
          background: #fff !important;
          border: 1px solid rgba(0,0,0,0.04) !important;
          border-radius: 16px !important;
          padding: 10px 14px !important;
          margin-bottom: 16px !important;
          gap: 8px !important;
          box-shadow: var(--payables-card-shadow) !important;
        }

        .payables-sales-ui .sales-style-filter-bar label {
          color: #1e3a8a !important;
          font-size: 0.66rem !important;
          line-height: 1.2 !important;
          font-weight: 700 !important;
          margin-bottom: 4px !important;
          letter-spacing: 0 !important;
        }

        .payables-sales-ui .sales-style-filter-bar input,
        .payables-sales-ui .sales-style-filter-bar select,
        .payables-sales-ui .sales-style-filter-bar > div > button {
          min-height: 32px !important;
          height: 32px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 7px !important;
          background: #fff !important;
          color: #334155 !important;
          font-size: 0.72rem !important;
          font-weight: 600 !important;
          line-height: 1.2 !important;
          box-shadow: none !important;
          outline: none !important;
          transition: border-color .15s ease, background .15s ease, box-shadow .15s ease, transform .15s ease !important;
        }

        .payables-sales-ui .sales-style-filter-bar input::placeholder {
          color: #94a3b8 !important;
          font-weight: 500 !important;
        }

        .payables-sales-ui .sales-style-filter-bar input:focus,
        .payables-sales-ui .sales-style-filter-bar select:focus,
        .payables-sales-ui .sales-style-filter-bar > div > button:focus-visible {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,.10) !important;
          outline: none !important;
        }

        .payables-sales-ui .sales-style-filter-bar > div > button:hover {
          background: #f8fafc !important;
          border-color: #c7d2fe !important;
        }

        .payables-sales-ui .sales-style-filter-bar button#btn-apply-filter {
          background: #4f46e5 !important;
          border-color: #4f46e5 !important;
          color: #fff !important;
          font-size: 0.70rem !important;
          font-weight: 700 !important;
        }

        .payables-sales-ui .sales-style-filter-bar button#btn-reset-filter {
          background: #fff !important;
          border-color: #e2e8f0 !important;
          color: #64748b !important;
          font-size: 0.70rem !important;
          font-weight: 600 !important;
        }

        .payables-sales-ui .sales-style-filter-bar button#btn-apply-filter:hover,
        .payables-sales-ui .sales-style-filter-bar button#btn-reset-filter:hover {
          transform: translateY(-1px) !important;
        }

        /* KPI cards — Sales Revenue visual hierarchy */
        .payables-sales-ui .payables-kpi-grid {
          gap: 10px !important;
          margin-top: 0 !important;
          margin-bottom: 16px !important;
        }

        .payables-sales-ui .sales-style-kpi {
          border: none !important;
          border-radius: 12px !important;
          padding: 10px !important;
          min-height: 74px !important;
          box-shadow: none !important;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1) !important;
        }

        .payables-sales-ui .sales-style-kpi:hover {
          box-shadow: 0 8px 24px rgba(37,99,235,0.10) !important;
          transform: translateY(-2px) !important;
        }

        /* KPI text hierarchy */
        .payables-sales-ui .sales-style-kpi [style*="font-size: 0.68rem"],
        .payables-sales-ui .sales-style-kpi [style*="fontSize: \"0.68rem\""] {
          font-weight: 700 !important;
        }

        /* Tables — same Sales Revenue typography, borders and hover */
        .payables-sales-ui table {
          width: 100%;
          border-collapse: collapse !important;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }

        .payables-sales-ui table th {
          padding: 10px 16px !important;
          background: #f8fafc !important;
          color: #1e3a8a !important;
          border-bottom: 2px solid #e2e8f0 !important;
          font-size: 0.74rem !important;
          font-weight: 700 !important;
          line-height: 1.25 !important;
          white-space: nowrap;
          letter-spacing: 0 !important;
        }

        .payables-sales-ui table td {
          padding: 8px 16px !important;
          color: #334155 !important;
          border-bottom: 1px solid #f1f5f9 !important;
          font-size: 0.74rem !important;
          font-weight: 600 !important;
          line-height: 1.35 !important;
          font-variant-numeric: tabular-nums;
        }

        .payables-sales-ui table tbody tr {
          transition: background-color .12s ease !important;
        }

        .payables-sales-ui table tbody tr:hover td {
          background: #f8fafc !important;
        }

        .payables-sales-ui table tbody tr:last-child td {
          border-bottom: none !important;
        }

        /* Chart typography */
        .payables-sales-ui .recharts-text,
        .payables-sales-ui .recharts-cartesian-axis-tick-value,
        .payables-sales-ui .recharts-legend-item-text {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }

        .payables-sales-ui .recharts-cartesian-axis-tick-value {
          fill: #64748b !important;
          font-size: 11px !important;
          font-weight: 500 !important;
        }

        .payables-sales-ui .recharts-label {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
          fill: #334155 !important;
          font-weight: 600 !important;
        }

        /* Chart/table/menu interaction effects */
        .payables-sales-ui button {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }

        .payables-sales-ui .payables-action-menu > button {
          transition: background-color .15s ease, color .15s ease, transform .15s ease !important;
        }

        .payables-sales-ui .payables-action-menu > button:hover {
          background: #f1f5f9 !important;
          color: #334155 !important;
          transform: translateY(-1px) !important;
        }

        /* View All modal — same rounded surface / typography */
        .payables-sales-ui .sales-style-view-all-modal {
          background: #fff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 28px rgba(0,0,0,0.06) !important;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }

        .payables-sales-ui .sales-style-view-all-modal table th {
          color: #1e3a8a !important;
          background: #f8fafc !important;
          font-size: 0.72rem !important;
          font-weight: 700 !important;
        }

        .payables-sales-ui .sales-style-view-all-modal table td {
          color: #334155 !important;
          font-size: 0.74rem !important;
          font-weight: 600 !important;
        }

        /* Skeleton / loading animation — Sales Revenue style */
        .payables-sales-ui .payables-skeleton-card,
        .payables-sales-ui .payables-skeleton-panel {
          background: #fff !important;
          border: 1px solid rgba(0,0,0,0.04) !important;
          border-radius: 16px !important;
          box-shadow: var(--payables-card-shadow) !important;
        }

        .payables-sales-ui .payables-skeleton-line,
        .payables-sales-ui .payables-skeleton-chart,
        .payables-sales-ui .payables-skeleton-table-line,
        .payables-sales-ui .payables-skeleton-icon {
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f1f5f9 50%,
            #e2e8f0 75%
          ) !important;
          background-size: 200% 100% !important;
          animation: shimmer 1.4s infinite !important;
        }

        /* Consistent responsive spacing */
        @media (max-width: 1200px) {
          .payables-sales-ui .sales-style-filter-bar {
            gap: 7px !important;
          }
          .payables-sales-ui table th,
          .payables-sales-ui table td {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }

        @media (max-width: 900px) {
          .payables-sales-ui .sales-style-filter-bar {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 600px) {
          .payables-sales-ui .sales-style-filter-bar {
            grid-template-columns: 1fr !important;
            padding: 10px !important;
          }

          .payables-sales-ui .payables-kpi-grid {
            grid-template-columns: 1fr !important;
          }

          .payables-sales-ui table th,
          .payables-sales-ui table td {
            padding: 7px 9px !important;
            font-size: 0.70rem !important;
          }
        }
      `}</style>

            {/* ======================================================
          PAGE CONTENT
          ====================================================== */}

            <main
                className="payables-sales-main animate-in"
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "20px 0 32px",
                    background: "#f8fafc",
                    minHeight: "100%",
                }}
            >
                {/* HEADER */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 15,
                        marginBottom: 12,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                color: "#0f172a",
                                fontSize: "1.45rem",
                                lineHeight: 1.15,
                                fontWeight: 800,
                                letterSpacing: "-0.02em",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <span style={{ fontSize: "1.3rem" }}>💳</span> Payables Dashboard
                        </h1>

                        <div
                            className="sales-style-subtitle"
                            style={{
                                marginTop: 3,
                                color: "#64748b",
                                fontSize: "0.78rem",
                                lineHeight: 1.45,
                            }}
                        >
                            Track payables, aging, overdue exposure and payment performance
                            <br />
                            <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, display: "inline-block", marginTop: 4, fontWeight: 600 }}>
                                Viewing: {filters.as_on_date || appliedFilters.as_on_date || "—"}
                            </span>
                            &nbsp;|&nbsp;
                            <span style={{ color: "#16a34a", fontWeight: 700 }}>Currency: {currency}</span>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                        }}
                    >

                        {/* Excel */}
                        <button
                            type="button"
                            onClick={() => handleExport("excel")}
                            style={{
                                height: 30,
                                minWidth: 0,
                                padding: "5px 10px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                border: "1px solid #bbf7d0",
                                borderRadius: 7,
                                background: "#f0fdf4",
                                color: "#15803d",
                                fontSize: "0.70rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#ecfdf5";
                                e.currentTarget.style.borderColor = "#86efac";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#f0fdf4";
                                e.currentTarget.style.borderColor = "#bbf7d0";
                            }}
                        >
                            <span style={{ fontSize: 13 }}>📊</span>
                            Excel
                        </button>

                        {/* PDF */}
                        <button
                            type="button"
                            onClick={() => handleExport("pdf")}
                            style={{
                                height: 30,
                                minWidth: 0,
                                padding: "5px 10px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                border: "1px solid #fecdd3",
                                borderRadius: 7,
                                background: "#fff1f2",
                                color: "#be123c",
                                fontSize: "0.70rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#ffe4e6";
                                e.currentTarget.style.borderColor = "#fda4af";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#fff1f2";
                                e.currentTarget.style.borderColor = "#fecdd3";
                            }}
                        >
                            <span style={{ fontSize: 13 }}>📄</span>
                            PDF
                        </button>


                    </div>
                </div>

                {/* ==================================================
            PAYABLE-SPECIFIC FILTER BAR
            ================================================== */}

                <div
                    className="sales-style-filter-bar"
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "#ffffff",
                        border: "1px solid rgba(0,0,0,0.04)",
                        borderRadius: 16,
                        padding: "10px 14px",
                        display: "grid",
                        gridTemplateColumns: "repeat(7, minmax(0, 1fr)) auto auto",
                        alignItems: "end",
                        gap: 8,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.03)",
                        overflow: "visible",
                    }}
                >
                    <FilterSelect
                        label="Legal Group"
                        value={filters.legal_group}
                        options={getOptionLabels(filterOptions.legal_groups)}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                legal_group: value,
                                legal_entities: ["All"],
                                parent_divisions: ["All"],
                                sub_divisions: ["All"],
                            }))
                        }
                    />

                    <FilterSelect
                        label="Legal Entity"
                        value={filters.legal_entities}
                        options={getOptionLabels(mainLegalEntities)}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                legal_entities: value,
                                parent_divisions: ["All"],
                                sub_divisions: ["All"],
                            }))
                        }
                    />

                    <FilterSelect
                        label="Parent Division"
                        value={filters.parent_divisions}
                        options={getOptionLabels(mainParentDivisions)}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                parent_divisions: value,
                                sub_divisions: ["All"],
                            }))
                        }
                    />

                    <FilterSelect
                        label="Sub-Division"
                        value={filters.sub_divisions}
                        options={getOptionLabels(mainSubDivisions)}
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                sub_divisions: value,
                            }))
                        }
                        multiple
                    />

                    <FilterSelect
                        label="Reporting Currency"
                        value={filters.reporting_currency}
                        options={getOptionLabels(filterOptions.reporting_currencies)}
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                reporting_currency: value,
                            }))
                        }
                    />

                    <FilterSelect
                        label="Aging Basis"
                        value={filters.aging_basis}
                        options={getOptionLabels(filterOptions.aging_basis).map(displayAgingBasis)}
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                aging_basis: value,
                            }))
                        }
                    />

                    <DateFilter
                        value={filters.as_on_date}
                        onChange={(value) => {
                            const nextYear = Number(String(value).slice(0, 4));

                            // Date selection immediately refreshes the main dashboard.
                            setFilters((prev) => ({
                                ...prev,
                                as_on_date: value,
                                year: Number.isFinite(nextYear) ? nextYear : prev.year,
                            }));
                            setData(emptyDashboardData);
                            setAppliedFilters((prev) => ({
                                ...prev,
                                as_on_date: value,
                                year: Number.isFinite(nextYear) ? nextYear : prev.year,
                            }));
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleApply}
                        style={{
                            height: 32,
                            minWidth: 0,
                            padding: "0 16px",
                            border: "1px solid #4f46e5",
                            borderRadius: 7,
                            background: "#4f46e5",
                            color: "#ffffff",
                            fontSize: "0.70rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "none",
                            flexShrink: 0,
                        }}
                    >
                        Apply
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                            height: 32,
                            minWidth: 0,
                            padding: "0 6px",
                            border: "1px solid #e2e8f0",
                            borderRadius: 7,
                            background: "#ffffff",
                            color: "#64748b",
                            fontSize: "0.70rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                    >
                        Reset
                    </button>
                </div>

                {error && (
                    <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 8, background: "#fff1f2", color: "#be123c", fontSize: 11, fontWeight: 600 }}>
                        {error}
                    </div>
                )}

                {loading && (
                    <div style={{ marginTop: 10, padding: "8px 12px", color: "#64748b", fontSize: 11 }}>
                        Loading Payables data...
                    </div>
                )}

                {loading && <PayablesPageSkeleton />}

                <div style={{ display: loading ? "none" : "block" }}>

                    {/* ==================================================
            KPI CARDS
            ================================================== */}

                    <div
                        className="payables-kpi-grid"
                        style={{
                            marginTop: 0,
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: 10,
                            marginBottom: 16,
                        }}
                    >
                        <KpiCard
                            title="Total Payables"
                            value={kpis.total_payables}
                            variance={kpis.total_change_percentage}
                            previousDate={kpis.previous_as_on_date}
                            currency={currency}
                            icon="▤"
                            iconBg="#dbeafe"
                            iconColor="#2563eb"
                            cardBg="#f0f5ff"
                        />

                        <KpiCard
                            title="Current Payables"
                            value={kpis.current_payables}
                            variance={kpis.current_change_percentage}
                            previousDate={kpis.previous_as_on_date}
                            currency={currency}
                            icon="▣"
                            iconBg="#dcfce7"
                            iconColor="#16a34a"
                            cardBg="#f0fdf4"
                        />

                        <KpiCard
                            title="Overdue Payables"
                            value={kpis.overdue_payables}
                            variance={kpis.overdue_change_percentage}
                            previousDate={kpis.previous_as_on_date}
                            currency={currency}
                            icon="⌛"
                            iconBg="#ffedd5"
                            iconColor="#ea580c"
                            cardBg="#fff7ed"
                        // onClick={handleOverdueDrillDown}
                        />

                        <KpiCard
                            title="Overdue > 90 Days"
                            value={kpis.overdue_above_90}
                            variance={kpis.overdue_above_90_change_percentage}
                            previousDate={kpis.previous_as_on_date}
                            currency={currency}
                            icon="!"
                            iconBg="#fce7f3"
                            iconColor="#db2777"
                            cardBg="#fdf2f8"
                        // onClick={handleOverdueAbove90DrillDown}
                        />

                        <KpiCard
                            title="DPO – Days Payable Outstanding"
                            value={kpis.dpo_days}
                            variance={kpis.dpo_change_days}
                            previousDate={kpis.previous_as_on_date}
                            suffix="Days"
                            currency={currency}
                            icon="%"
                            iconBg="#cffafe"
                            iconColor="#0891b2"
                            cardBg="#ecfeff"
                        />
                    </div>

                    {/* ==================================================
            ROW 1
            ================================================== */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: 9,
                            marginBottom: 9,
                            width: "100%",
                            alignItems: "stretch",
                        }}
                    >
                        {/* Aging Summary */}
                        <section
                            style={{
                                ...cardStyle,
                                padding: 12,
                                minWidth: 0,
                                width: "100%",
                                boxSizing: "border-box",
                                overflow: "hidden",
                                position: "relative",
                            }}
                        >
                            <SectionActions
                                onViewAll={() => openPayablesViewAll("aging")}
                                onExportExcel={() => handleExport("excel")}
                                onExportPdf={() => handleExport("pdf")}
                            />
                            <SectionTitle info="Payables grouped by aging bucket">
                                Payables Aging Summary ({currency})
                            </SectionTitle>

                            <div
                                style={{
                                    width: "100%",
                                    minWidth: 0,
                                    overflow: "hidden",
                                }}
                            >
                                {data.agingSummary?.length ? <DonutChart data={data.agingSummary} total={kpis.total_payables} currency={currency} centerLabel="Total" onSegmentClick={handleAgingDrillDown} /> : <NoDataAvailable />}
                            </div>
                        </section>

                        {/* Trend */}
                        <section
                            style={{
                                ...cardStyle,
                                padding: 12,
                                minWidth: 0,
                                width: "100%",
                                boxSizing: "border-box",
                                overflow: "hidden",
                                position: "relative",
                            }}
                        >
                            <SectionActions
                                onViewAll={() => openPayablesViewAll("trend")}
                                onExportExcel={() => handleExport("excel")}
                                onExportPdf={() => handleExport("pdf")}
                            />
                            <SectionTitle info="Historical total payables and DPO">
                                Payables Trend ({currency})
                            </SectionTitle>

                            <div
                                style={{
                                    width: "100%",
                                    minWidth: 0,
                                    overflow: "hidden",
                                }}
                            >
                                {data.trend?.length ? <TrendChart data={data.trend} currency={currency} onPointClick={handleTrendDrillDown} /> : <NoDataAvailable />}
                            </div>
                        </section>

                        {/* Parent Division */}
                        <section
                            style={{
                                ...cardStyle,
                                padding: 12,
                                minWidth: 0,
                                width: "100%",
                                boxSizing: "border-box",
                                overflow: "hidden",
                                position: "relative",
                            }}
                        >
                            <SectionActions
                                onViewAll={() => openPayablesViewAll("parent_division")}
                                onExportExcel={() => handleExport("excel")}
                                onExportPdf={() => handleExport("pdf")}
                            />
                            <SectionTitle>
                                Payables by Parent Division ({currency})
                            </SectionTitle>

                            <div
                                style={{
                                    width: "100%",
                                    minWidth: 0,
                                    overflow: "hidden",
                                }}
                            >
                                {data.parentDivision?.length ? <ParentDivisionChart data={data.parentDivision} currency={currency} onRowClick={handleParentDivisionDrillDown} /> : <NoDataAvailable />}
                            </div>
                        </section>
                    </div>

                    {/* ==================================================
            ROW 2
            ================================================== */}

                    <div
                        className="payables-row-2"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: 9,
                            marginBottom: 9,
                            width: "100%",
                            alignItems: "stretch",
                            gridAutoRows: "minmax(330px, auto)",
                        }}
                    >
                        {/* Top 10 Suppliers */}

                        <section
                            style={{ ...cardStyle, padding: 12, position: "relative" }}
                        >
                            <SectionActions
                                onViewAll={() => openPayablesViewAll("top_suppliers")}
                                onExportExcel={() => handleExport("excel")}
                                onExportPdf={() => handleExport("pdf")}
                            />
                            <SectionTitle>
                                Top 10 Suppliers by Payables ({currency})
                            </SectionTitle>

                            {data.topSuppliers?.length ? <DataTable columns={supplierColumns} rows={data.topSuppliers}
                                fitColumns compactRows supplierTwoLine={true} capitalizeSupplierNames={true}
                                pagination={true}
                                pageSize={10}
                                topSupplierStyle={true}

                                increasedRowGap={true}
                                onRowClick={handleSupplierDrillDown} /> : <NoDataAvailable />}
                            {supplierRows.length > 0 && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "28px minmax(0, 1fr) minmax(90px, 1fr) minmax(70px, 0.72fr)",
                                        alignItems: "center",
                                        marginTop: 7,
                                        padding: "0 4px",
                                        color: BLUE,
                                        fontSize: 12,
                                        fontWeight: 700,
                                    }}
                                >
                                    {/* Rank spacer */}
                                    <span />

                                    {/* Total */}
                                    <span
                                        style={{
                                            textAlign: "left",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Total
                                    </span>

                                    {/* Amount */}
                                    <span
                                        style={{
                                            textAlign: "right",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {formatPayablesCompact(
                                            supplierRows.reduce(
                                                (sum, item) =>
                                                    sum + Number(item.payable_amount || 0),
                                                0
                                            ),
                                            currency
                                        ).replace(
                                            /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
                                            ""
                                        )}
                                    </span>

                                    {/* Percentage */}
                                    <span
                                        style={{
                                            textAlign: "right",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {formatPercentage(
                                            supplierRows.length > 0
                                                ? 100
                                                : 0
                                        )}
                                    </span>
                                </div>
                            )}
                        </section>

                        {/* Overdue Summary */}

                        <section
                            style={{ ...cardStyle, padding: 12, position: "relative" }}
                        >
                            <SectionActions
                                onViewAll={() => openPayablesViewAll("overdue")}
                                onExportExcel={() => handleExport("excel")}
                                onExportPdf={() => handleExport("pdf")}
                            />
                            <SectionTitle>
                                Overdue Summary ({currency})
                            </SectionTitle>

                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >

                                {data.overdueSummary?.length ? <DonutChart data={data.overdueSummary} total={kpis.overdue_payables}
                                    currency={currency} centerLabel="Overdue" legendBelow largeOverdueChart={true}
                                    onSegmentClick={handleAgingDrillDown} /> : <NoDataAvailable minHeight={250} />}
                            </div>
                        </section>

                        {/* Sub Division */}

                        <section
                            style={{ ...cardStyle, padding: 12, position: "relative" }}
                        >
                            <SectionActions
                                onViewAll={() => openPayablesViewAll("sub_division")}
                                onExportExcel={() => handleExport("excel")}
                                onExportPdf={() => handleExport("pdf")}
                            />
                            <SectionTitle>
                                Payables by Sub-Division ({currency})
                            </SectionTitle>
                            {data.subDivision?.length ? (
                                <DataTable
                                    columns={subDivisionColumns}
                                    rows={data.subDivision}
                                    onRowClick={handleSubdivisionDrillDown}
                                    pagination={true}
                                    pageSize={13}
                                    fitColumns
                                    rowGap
                                    increasedRowGap={true}
                                    modernPagination={true}

                                    subDivisionTableStyle={true}
                                    parentDivisionPaginationStyle={true}
                                    showSubDivisionPercentage



                                    totalRow={
                                        data.subDivision.length > 0
                                            ? {
                                                name: "Total",
                                                amount: data.subDivision.reduce(
                                                    (sum, item) =>
                                                        sum + Number(item.amount || 0),
                                                    0
                                                ),
                                                percentage:
                                                    data.subDivision.reduce(
                                                        (sum, item) =>
                                                            sum + Number(item.amount || 0),
                                                        0
                                                    ) > 0
                                                        ? 100
                                                        : null,
                                            }
                                            : null
                                    }
                                />
                            ) : <NoDataAvailable />}
                        </section>
                    </div>


                    {/* ==================================================
            MONTH-ON-MONTH
            ================================================== */}

                    <section
                        style={{
                            ...cardStyle,
                            padding: 12,
                            marginBottom: 10,
                            position: "relative",
                        }}
                    >
                        <SectionActions
                            onViewAll={() => openPayablesViewAll("month_on_month")}
                            onExportExcel={() => handleExport("excel")}
                            onExportPdf={() => handleExport("pdf")}
                        />
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 14,
                                marginBottom: 10,
                                paddingRight: 58,
                                boxSizing: "border-box",
                            }}
                        >
                            <SectionTitle info="Monthly payable balance by legal entity">
                                Month-on-Month Payables ({currency})
                            </SectionTitle>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginRight: 10,
                                    flexShrink: 0,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 10,
                                        color: MUTED,
                                    }}
                                >
                                    Year
                                </span>

                                <input
                                    value={monthOnMonthYear || filters.year}
                                    onChange={(e) => {
                                        const nextYear = Number(e.target.value);
                                        setMonthOnMonthYear(nextYear);
                                        setFilter("year", nextYear);
                                        setAppliedFilters((previous) => ({
                                            ...previous,
                                            year: nextYear,
                                        }));
                                    }} readOnly
                                    style={{
                                        height: 30,
                                        minWidth: 75,
                                        border: "1px solid #d5ddeb",
                                        borderRadius: 5,
                                        background: "#fff",
                                        color: BLUE,
                                        padding: "0 8px",
                                        fontSize: 10,
                                        fontWeight: 600,
                                    }}
                                />
                                {/* {filterOptions.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))} */}


                                {/* AED / AED Millions toggle stays on the same row as Year and the ⋮ menu. */}
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        border: "1px solid #dbe3ef",
                                        borderRadius: 5,
                                        padding: 2,
                                        background: "#f8fafc",
                                        gap: 2,
                                        flexShrink: 0,
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setMonthCurrencyMode("AED")}
                                        style={{
                                            border: "none",
                                            borderRadius: 4,
                                            padding: "5px 9px",
                                            fontSize: 10,
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            background: monthCurrencyMode === "AED" ? BLUE : "transparent",
                                            color: monthCurrencyMode === "AED" ? "#fff" : "#475569",
                                        }}
                                    >
                                        AED
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMonthCurrencyMode("AED_MILLIONS")}
                                        style={{
                                            border: "none",
                                            borderRadius: 4,
                                            padding: "5px 9px",
                                            fontSize: 10,
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            background: monthCurrencyMode === "AED_MILLIONS" ? BLUE : "transparent",
                                            color: monthCurrencyMode === "AED_MILLIONS" ? "#fff" : "#475569",
                                        }}
                                    >
                                        AED Millions
                                    </button>
                                </div>
                            </div>
                        </div>


                        {data.monthOnMonth?.length ? (
                            <DataTable columns={monthColumns}
                                rows={data.monthOnMonth}
                                pagination={true} pageSize={8}
                                truncateLegalEntity={true}
                                legalEntityMaxLength={18}
                                monthColumnGap={true}
                                removeDecimals={true}
                                removeYearFromHeader={true}
                                currencyToggle={true}
                                currencyMode={monthCurrencyMode}
                                showCurrencyToggle={false}
                                negativeValuesRed={true}
                                widerLegalEntity={true}
                                fixedHierarchyColumns={true}
                                parentDivisionPaginationStyle={true}
                                onCellClick={(row, column) => {
                                    if (MONTHS.includes(column?.key)) {
                                        handleMoMDrillDown(row, column.key);
                                    }
                                }} />
                        ) : <NoDataAvailable minHeight={220} />}

                    </section>

                </div>

                {/* ==================================================
            FOOTER
            ================================================== */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        fontSize: 10, fontWeight: 700,
                        color: "#64748b",
                        padding: "3px 8px",
                    }}
                >
                    <span>
                        Values shown in {currency}
                    </span>

                    <span>
                        Aging Basis:{" "}
                        <strong style={{ color: BLUE }}>
                            {appliedFilters.aging_basis}
                        </strong>
                    </span>

                    <span>
                        Last Updated On: {appliedFilters.as_on_date}
                    </span>
                </div>
            </main >

            {/* ======================================================
          VIEW ALL MODAL
          ====================================================== */}

            {showViewAll && (
                <PayablesViewAll
                    filters={appliedFilters}
                    section={viewAllSection}
                    detailFilters={viewAllDetailFilters}
                    data={data.viewAll}
                    currency={currency}
                    filterOptions={filterOptions}
                    onClose={() => setShowViewAll(false)}
                />
            )}
        </div >
    );
}


/* ============================================================
   SECTION-SPECIFIC VIEW ALL
   Each dashboard component opens its own View All dataset/table.
   ============================================================ */
function PayablesSectionViewAllLegacy({
    section,
    dashboardData = {},
    currency,
    filters = {},
    filterOptions = {},
    onClose,
}) {
    const sectionConfig = {
        aging: {
            title: "Payables Aging Summary View All",
            subtitle: "Detailed aging bucket balances for the selected snapshot.",
            rows: dashboardData.agingSummary || [],
            columns: [
                { key: "bucket_name", label: "Aging Bucket" },
                { key: "amount", label: `Amount (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
                { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        trend: {
            title: "Payables Trend View All",
            subtitle: "Monthly payables trend and DPO details.",
            rows: dashboardData.trend || [],
            columns: [
                { key: "month", label: "Month" },
                { key: "total_payables", label: `Total Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.total_payables, currency) },
                { key: "dpo", label: "DPO (Days)", align: "right", render: (r) => `${Number(r.dpo || 0).toFixed(1)} Days` },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        parent_division: {
            title: "Payables by Parent Division View All",
            subtitle: "Complete parent-division payable balances.",
            rows: dashboardData.parentDivision || [],
            columns: [
                { key: "name", label: "Parent Division" },
                { key: "amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
                { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        top_suppliers: {
            title: "Top Suppliers by Payables View All",
            subtitle: "Supplier-level payable balances from the dashboard data.",
            rows: dashboardData.topSuppliers || [],
            columns: [
                { key: "rank", label: "#", align: "left" },
                { key: "supplier_name", label: "Supplier Name" },
                { key: "payable_amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.payable_amount, currency) },
                { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        overdue: {
            title: "Overdue Summary View All",
            subtitle: "Detailed overdue aging buckets and balances.",
            rows: dashboardData.overdueSummary || [],
            columns: [
                { key: "bucket", label: "Overdue Bucket" },
                { key: "amount", label: `Amount (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount ?? r.total_payables ?? r.payable_amount, currency) },
                { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        sub_division: {
            title: "Payables by Sub-Division View All",
            subtitle: "Complete sub-division payable balances.",
            rows: dashboardData.subDivision || [],
            columns: [
                { key: "name", label: "Sub-Division" },
                { key: "amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
                { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        month_on_month: {
            title: "Month-on-Month Payables View All",
            subtitle: "Detailed month-on-month payable balances by legal entity.",
            rows: dashboardData.monthOnMonth || [],
            columns: [
                { key: "legal_entity", label: "Legal Entity" },
                { key: "parent_division", label: "Parent Division" },
                { key: "sub_division", label: "Sub-Division" },
                ...MONTHS.map((month) => ({ key: month, label: month, align: "right", render: (r) => formatMoMValue(r[month]) })),
                { key: "latest", label: "Latest", align: "right", render: (r) => formatMoMValue(r.latest) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
    }[section];

    const config = sectionConfig || { title: "Payables View All", subtitle: "Complete payable details.", rows: [], columns: [] };

    const initial = {
        legal_group: [],
        legal_entities: [],
        parent_divisions: [],
        sub_divisions: [],
        reporting_currency: filters.reporting_currency || currency || "AED",
        as_on_date: filters.as_on_date || "",
        aging_basis: filters.aging_basis || "Due Date Based",
    };
    const [viewFilters, setViewFilters] = React.useState(initial);
    const [applied, setApplied] = React.useState(initial);
    const [sectionRows, setSectionRows] = React.useState(config.rows || []);
    const [sectionLoading, setSectionLoading] = React.useState(false);
    const [sectionError, setSectionError] = React.useState("");
    const [openFilter, setOpenFilter] = React.useState(null);
    const [filterSearch, setFilterSearch] = React.useState({});
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const pageSize = 10;

    const labels = (arr) => getOptionLabels(arr || []);
    const options = {
        legal_group: labels(filterOptions.legal_groups),
        legal_entities: labels(filterOptions.legal_entities),
        parent_divisions: labels(filterOptions.parent_divisions),
        sub_divisions: labels(filterOptions.sub_divisions || filterOptions.subdivision || filterOptions.subdivisions),
        reporting_currency: labels(filterOptions.reporting_currencies),
        as_on_date: labels(filterOptions.as_on_dates),
        aging_basis: labels(filterOptions.aging_basis).map(displayAgingBasis),
    };

    const getSelected = (key) => {
        const value = viewFilters[key];
        return Array.isArray(value) ? value : [value].filter(Boolean);
    };

    const toggle = (key, value) => {
        setViewFilters((prev) => {
            const current = Array.isArray(prev[key])
                ? prev[key].filter((x) => String(x).trim().toLowerCase() !== "all")
                : [];
            const next = current.includes(value)
                ? current.filter((x) => x !== value)
                : [...current, value];
            return { ...prev, [key]: next };
        });
    };

    const setSingle = (key, value) => {
        setViewFilters((prev) => ({ ...prev, [key]: value || "" }));
        setOpenFilter(null);
    };

    const clearFilter = (key) => {
        const isMulti = [
            "legal_group",
            "legal_entities",
            "parent_divisions",
            "sub_divisions",
        ].includes(key);
        setViewFilters((prev) => ({
            ...prev,
            [key]: isMulti ? [] : "",
        }));
        setFilterSearch((prev) => ({ ...prev, [key]: "" }));
    };

    const selectAllFilter = (key) => {
        const allOptions = (options[key] || []).filter(
            (option) => String(option).trim().toLowerCase() !== "all"
        );
        setViewFilters((prev) => ({
            ...prev,
            [key]: [...allOptions],
        }));
    };

    /*
     * View All filters must be applied to the backend data source.
     * The section summary arrays (especially Aging Summary) do not contain
     * legal-group/entity/division fields, so filtering those local arrays
     * cannot work. Reload the relevant existing API with the selected filters.
     */
    React.useEffect(() => {
        let active = true;

        const loadFilteredSection = async () => {
            setSectionLoading(true);
            setSectionError("");

            try {
                const apiFilters = buildPayablesApiFilters(
                    { ...filters, ...applied },
                    filterOptions
                );

                let result;
                if (section === "sub_division") {
                    result = await getPayablesBySubdivision(apiFilters);
                    const rows = normalizeSubdivisionResponse(result);
                    if (active) setSectionRows(Array.isArray(rows) ? rows : []);
                } else if (section === "month_on_month") {
                    result = await getPayablesMonthOnMonth({
                        ...apiFilters,
                        year: applied?.year || filters?.year,
                    });
                    const rows = normalizeMonthOnMonthResponse(result);
                    if (active) setSectionRows(Array.isArray(rows) ? rows : []);
                } else {
                    result = await getPayablesDashboard(apiFilters);
                    const dashboard = normalizeDashboardResponse(result);
                    const sectionKey = {
                        aging: "agingSummary",
                        trend: "trend",
                        parent_division: "parentDivision",
                        top_suppliers: "topSuppliers",
                        overdue: "overdueSummary",
                    }[section];
                    const rows = sectionKey ? dashboard?.[sectionKey] : config.rows;
                    if (active) setSectionRows(Array.isArray(rows) ? rows : []);
                }
            } catch (error) {
                console.error(`Payables ${section} View All filter failed`, error);
                if (active) {
                    setSectionRows([]);
                    setSectionError(
                        error?.response?.data?.detail ||
                        error?.message ||
                        "Failed to load filtered data."
                    );
                }
            } finally {
                if (active) setSectionLoading(false);
            }
        };

        loadFilteredSection();
        return () => {
            active = false;
        };
    }, [section, applied, filters, filterOptions]);

    const filteredRows = (sectionRows || []).filter((row) => {
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            if (!Object.values(row || {}).some((v) => String(v ?? "").toLowerCase().includes(q))) return false;
        }
        return true;
    });

    const totalRows = filteredRows.length;
    const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
    const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
    React.useEffect(() => { setPage(1); }, [section, applied, search]);

    const amountForRow = (row) => {
        const candidates = [row.amount, row.total_payables, row.total_payable, row.payable_amount, row.latest];
        return candidates.find((v) => v !== undefined && v !== null && Number.isFinite(Number(v))) ?? 0;
    };
    const kpiRows = filteredRows;
    const total = kpiRows.reduce((s, r) => s + Number(r.total_payables ?? r.total_payable ?? r.payable_amount ?? r.amount ?? r.latest ?? 0), 0);
    const current = kpiRows.reduce((s, r) => s + Number(r.current ?? r.current_payables ?? 0), 0);
    const overdue = kpiRows.reduce((s, r) => s + Number(r.overdue_payables ?? r.overdue ?? r.overdue_amount ?? 0), 0);
    const overdue90 = kpiRows.reduce((s, r) => s + Number(r["91_120"] ?? 0) + Number(r["121_180"] ?? 0) + Number(r["181_365"] ?? 0) + Number(r.above_365 ?? 0), 0);
    const kpis = [
        ["Total Payables", total, "#eef2ff", "#4f46e5", "₹"],
        ["Current Payables", current, "#ecfdf5", "#059669", "✓"],
        ["Overdue Payables", overdue, "#fff7ed", "#ea580c", "!"],
        ["Overdue > 90 Days", overdue90, "#fef2f2", "#dc2626", "90+"],
    ];

    const exportSection = async (format) => {
        try {
            const apiFilters = buildPayablesApiFilters({ ...filters, ...applied }, filterOptions);
            const response = format === "excel" ? await exportPayablesExcel(apiFilters) : await exportPayablesPdf(apiFilters);
            const blob = response?.data instanceof Blob ? response.data : response instanceof Blob ? response : null;
            if (!blob) throw new Error("Export response did not contain a downloadable file.");
            const disposition = response?.headers?.["content-disposition"] || response?.headers?.["Content-Disposition"] || "";
            const match = disposition.match(/filename\\*?=(?:UTF-8''|")?([^";\\n]+)"?/i);
            const fallback = `${String(section || "payables").replace(/[^a-z0-9]+/gi, "_")}_View_All.${format === "excel" ? "xlsx" : "pdf"}`;
            const filename = match?.[1] ? decodeURIComponent(match[1]) : fallback;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(`Payables ${section} View All export failed`, e);
        }
    };

    const MultiFilter = ({ label, filterKey, optionList }) => {
        const cleanOptions = (optionList || []).filter(
            (option) => String(option).trim().toLowerCase() !== "all"
        );
        const selected = getSelected(filterKey).filter(
            (value) => String(value).trim().toLowerCase() !== "all"
        );
        const query = String(filterSearch[filterKey] || "").trim().toLowerCase();
        const filteredOptions = cleanOptions.filter((option) =>
            String(option).toLowerCase().includes(query)
        );
        const allSelected = cleanOptions.length > 0 && selected.length === cleanOptions.length;
        const display = selected.length === 0 || allSelected
            ? "All"
            : selected.length === 1
                ? selected[0]
                : `${selected.length} selected`;

        return (
            <div style={{ position: "relative", minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5, whiteSpace: "nowrap" }}>{label}</div>
                <button type="button" onClick={() => setOpenFilter((v) => v === filterKey ? null : filterKey)} style={{ width: "100%", height: 34, border: "1px solid #d5ddeb", borderRadius: 6, background: "#f4f7fc", color: "#29427f", fontSize: 11, fontWeight: 600, padding: "0 9px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{display}</span>
                    <span style={{ fontSize: 10, marginLeft: 6 }}>▾</span>
                </button>
                {openFilter === filterKey && (
                    <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, width: 220, background: "#fff", border: "1px solid #d7dfeb", borderRadius: 7, boxShadow: "0 8px 22px rgba(15,23,42,.14)", zIndex: 10050, overflow: "hidden" }}>
                        <div style={{ padding: 7, borderBottom: "1px solid #edf1f6" }}>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
                                <input value={filterSearch[filterKey] || ""} onChange={(e) => setFilterSearch((p) => ({ ...p, [filterKey]: e.target.value }))} onClick={(e) => e.stopPropagation()} autoFocus placeholder={`Search ${label}`} style={{ width: "100%", height: 30, border: "1px solid #d9e1ee", borderRadius: 5, padding: "0 8px 0 27px", outline: "none", fontSize: 10, boxSizing: "border-box" }} />
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 9px", borderBottom: "1px solid #edf1f6" }}>
                            <button type="button" onClick={() => { if (allSelected) clearFilter(filterKey); else selectAllFilter(filterKey); }} style={{ border: 0, background: "transparent", padding: 0, color: "#4d46e5", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{allSelected ? "Deselect All" : "Select All"}</button>
                            <button type="button" onClick={() => clearFilter(filterKey)} style={{ border: 0, background: "transparent", padding: 0, color: "#64748b", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Clear</button>
                        </div>
                        <div style={{ maxHeight: 235, overflowY: "auto", padding: "3px 0" }}>
                            {filteredOptions.map((option) => {
                                const checked = selected.includes(option);
                                return (
                                    <label key={String(option)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", cursor: "pointer", fontSize: 10, color: "#334155", background: checked ? "#f5f7ff" : "#fff" }}>
                                        <input type="checkbox" checked={checked} onChange={() => toggle(filterKey, option)} style={{ width: 13, height: 13, margin: 0, accentColor: "#4936e9", cursor: "pointer" }} />
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{option}</span>
                                    </label>
                                );
                            })}
                            {!filteredOptions.length && <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 10 }}>No results found</div>}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const SingleFilter = ({ label, filterKey, optionList }) => {
        const current = String(viewFilters[filterKey] || "");
        const query = String(filterSearch[filterKey] || "").trim().toLowerCase();
        const filteredOptions = optionList.filter((option) => String(option).toLowerCase().includes(query));
        const display = current || "All";
        return (
            <div style={{ position: "relative", minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5, whiteSpace: "nowrap" }}>{label}</div>
                <button type="button" onClick={() => setOpenFilter((v) => v === filterKey ? null : filterKey)} style={{ width: "100%", height: 34, border: "1px solid #d5ddeb", borderRadius: 6, background: "#f4f7fc", color: "#29427f", fontSize: 11, fontWeight: 600, padding: "0 9px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{display}</span><span style={{ fontSize: 10 }}>▾</span>
                </button>
                {openFilter === filterKey && (
                    <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, width: 210, background: "#fff", border: "1px solid #d7dfeb", borderRadius: 7, boxShadow: "0 8px 22px rgba(15,23,42,.14)", zIndex: 10050, overflow: "hidden" }}>
                        <div style={{ padding: 7, borderBottom: "1px solid #edf1f6" }}><input value={filterSearch[filterKey] || ""} onChange={(e) => setFilterSearch((p) => ({ ...p, [filterKey]: e.target.value }))} autoFocus placeholder={`Search ${label}`} style={{ width: "100%", height: 30, border: "1px solid #d9e1ee", borderRadius: 5, padding: "0 8px", outline: "none", fontSize: 10, boxSizing: "border-box" }} /></div>
                        <div style={{ maxHeight: 220, overflowY: "auto" }}>
                            <button type="button" onClick={() => setSingle(filterKey, "")} style={{ display: "block", width: "100%", border: 0, background: !current ? "#f5f7ff" : "#fff", padding: "7px 9px", textAlign: "left", fontSize: 10, cursor: "pointer" }}>All</button>
                            {filteredOptions.map((option) => <button key={String(option)} type="button" onClick={() => setSingle(filterKey, option)} style={{ display: "block", width: "100%", border: 0, background: current === option ? "#f5f7ff" : "#fff", padding: "7px 9px", textAlign: "left", fontSize: 10, cursor: "pointer" }}>{option}</button>)}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.48)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ width: "min(1450px,100%)", maxHeight: "92vh", background: "#f7faff", borderRadius: 10, overflow: "hidden", boxShadow: "0 18px 55px rgba(15,23,42,0.28)", display: "flex", flexDirection: "column" }}>
                <div style={{ overflowY: "auto", padding: "18px 18px 28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 15, marginBottom: 14 }}>
                        <div>
                            <div style={{ fontSize: 27, lineHeight: 1.1, fontWeight: 800, color: "#102a72" }}>{config.title}</div>
                            <div style={{ marginTop: 5, fontSize: 12, color: "#64748b" }}>{config.subtitle}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button type="button" onClick={() => exportSection("excel")} style={{ height: 34, padding: "0 13px", border: "1px solid #86efac", borderRadius: 8, background: "#f7fffa", color: "#16a34a", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>📊 Excel</button>
                            <button type="button" onClick={() => exportSection("pdf")} style={{ height: 34, padding: "0 13px", border: "1px solid #fda4af", borderRadius: 8, background: "#fff8f8", color: "#ef4444", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>📄 PDF</button>
                            <button type="button" onClick={onClose} style={{ height: 34, padding: "0 13px", border: "1px solid #cbd5e1", borderRadius: 5, background: "#fff", color: "#3149a5", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✖</button>
                        </div>
                    </div>

                    <div style={{ background: "#fff", border: "1px solid #e3e9f2", borderRadius: 9, padding: "13px 14px 15px", marginBottom: 14 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#173b8f", marginBottom: 11 }}>Filters</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(110px,1fr)) auto auto", gap: 10, alignItems: "end" }}>
                            <MultiFilter label="Legal Group" filterKey="legal_group" optionList={options.legal_group} />
                            <MultiFilter label="Legal Entity" filterKey="legal_entities" optionList={options.legal_entities} />
                            <MultiFilter label="Parent Division" filterKey="parent_divisions" optionList={options.parent_divisions} />
                            <MultiFilter label="Sub-Division" filterKey="sub_divisions" optionList={options.sub_divisions} />
                            <SingleFilter label="Reporting Currency" filterKey="reporting_currency" optionList={options.reporting_currency} />
                            <SingleFilter label="As On Date" filterKey="as_on_date" optionList={options.as_on_date} />
                            <SingleFilter label="Aging Basis" filterKey="aging_basis" optionList={options.aging_basis} />
                            <button type="button" onClick={() => { setApplied({ ...viewFilters }); setOpenFilter(null); }} style={{ height: 34, padding: "0 20px", border: 0, borderRadius: 5, background: "#4936e9", color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Apply</button>
                            <button type="button" onClick={() => { setViewFilters(initial); setApplied(initial); setFilterSearch({}); setOpenFilter(null); }} style={{ height: 34, padding: "0 18px", border: "1px solid #d4dbe7", borderRadius: 5, background: "#fff", color: "#334155", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Reset</button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9, marginBottom: 14 }}>
                        {kpis.map(([title, value, bg, color, icon]) => (
                            <div key={title} style={{ background: "#fff", border: "1px solid #e5eaf2", borderRadius: 8, minHeight: 78, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 42, height: 42, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: icon === "90+" ? 11 : 18, fontWeight: 800 }}>{icon}</div>
                                <div><div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 3 }}>{title}</div><div style={{ fontSize: 18, fontWeight: 800, color: Number(value) < 0 ? "#dc2626" : "#142b6f" }}>{formatPayablesCompact(value, currency)}</div></div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>{totalRows.toLocaleString()} records</div>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." style={{ width: 220, height: 32, border: "1px solid #d5ddeb", borderRadius: 6, padding: "0 9px", fontSize: 10 }} />
                    </div>

                    <div style={{ background: "#fff", border: "1px solid #e3e9f2", borderRadius: 9, overflow: "hidden" }}>
                        <DataTable columns={config.columns} rows={pageRows} pagination={false} fitColumns negativeValuesRed={true} monthColumnGap={section === "month_on_month"} removeDecimals={section !== "month_on_month"} currencyToggle={section === "month_on_month"} />
                        {pageRows.length === 0 && <div style={{ textAlign: "center", padding: 35, color: "#64748b", fontSize: 12 }}>No data available for this section.</div>}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 10 }}>
                        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ height: 30, padding: "0 12px", border: "1px solid #d5ddeb", borderRadius: 5, background: "#fff" }}>‹</button>
                        <span style={{ fontSize: 10, color: "#64748b" }}>Page {page} of {pageCount}</span>
                        <button disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} style={{ height: 30, padding: "0 12px", border: "1px solid #d5ddeb", borderRadius: 5, background: "#fff" }}>›</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   VIEW ALL
   ============================================================ */


function PayablesSectionViewAll({
    section,
    dashboardData = {},
    currency,
    filters = {},
    filterOptions = {},
    onClose,
}) {
    const sectionConfig = {
        aging: {
            title: "Payables Aging Summary View All",
            subtitle: "Detailed aging bucket balances for the selected snapshot.",
            rows: dashboardData.agingSummary || [],
            columns: [
                { key: "bucket_name", label: "Aging Bucket" },
                { key: "amount", label: `Amount (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
                { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        trend: {
            title: "Payables Trend View All",
            subtitle: "Monthly payables trend and DPO details.",
            rows: dashboardData.trend || [],
            columns: [
                { key: "month", label: "Month" },
                { key: "total_payables", label: `Total Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.total_payables, currency) },
                { key: "dpo", label: "DPO (Days)", align: "right", render: (r) => `${Number(r.dpo || 0).toFixed(1)} Days` },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        parent_division: {
            title: "Payables by Parent Division View All",
            subtitle: "Complete parent-division payable balances.",
            rows: dashboardData.parentDivision || [],
            columns: [
                { key: "name", label: "Parent Division" },
                { key: "amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
                { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        top_suppliers: {
            title: "Top Suppliers by Payables View All",
            subtitle: "Supplier-level payable balances from the dashboard data.",
            rows: dashboardData.topSuppliers || [],
            columns: [
                { key: "rank", label: "#", align: "left" },
                { key: "supplier_name", label: "Supplier Name" },
                { key: "payable_amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.payable_amount, currency) },
                { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        overdue: {
            title: "Overdue Summary View All",
            subtitle: "Detailed overdue aging buckets and balances.",
            rows: dashboardData.overdueSummary || [],
            columns: [
                { key: "bucket", label: "Overdue Bucket" },
                { key: "amount", label: `Amount (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount ?? r.total_payables ?? r.payable_amount, currency) },
                { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        sub_division: {
            title: "Payables by Sub-Division View All",
            subtitle: "Complete sub-division payable balances.",
            rows: dashboardData.subDivision || [],
            columns: [
                { key: "name", label: "Sub-Division" },
                { key: "amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
                { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
        month_on_month: {
            title: "Month-on-Month Payables View All",
            subtitle: "Detailed month-on-month payable balances by legal entity.",
            rows: dashboardData.monthOnMonth || [],
            columns: [
                { key: "legal_entity", label: "Legal Entity" },
                { key: "parent_division", label: "Parent Division" },
                { key: "sub_division", label: "Sub-Division" },
                ...MONTHS.map((month) => ({ key: month, label: month, align: "right", render: (r) => formatMoMValue(r[month]) })),
                { key: "latest", label: "Latest", align: "right", render: (r) => formatMoMValue(r.latest) },
            ],
            kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
        },
    }[section];

    const config = sectionConfig || { title: "Payables View All", subtitle: "Complete payable details.", rows: [], columns: [] };

    const initial = {
        legal_group: [],
        legal_entities: [],
        parent_divisions: [],
        sub_divisions: [],
        reporting_currency: filters.reporting_currency || currency || "AED",
        as_on_date: filters.as_on_date || "",
        aging_basis: filters.aging_basis || "Due Date Based",
    };
    const [viewFilters, setViewFilters] = React.useState(initial);
    const [applied, setApplied] = React.useState(initial);
    const [sectionRows, setSectionRows] = React.useState(config.rows || []);
    const [sectionLoading, setSectionLoading] = React.useState(false);
    const [sectionError, setSectionError] = React.useState("");
    const [openFilter, setOpenFilter] = React.useState(null);
    const [filterSearch, setFilterSearch] = React.useState({});
    const [search, setSearch] = React.useState("");
    const [page, setPage] = React.useState(1);
    const pageSize = 10;

    const labels = (arr) => getOptionLabels(arr || []);
    const options = {
        legal_group: labels(filterOptions.legal_groups),
        legal_entities: labels(filterOptions.legal_entities),
        parent_divisions: labels(filterOptions.parent_divisions),
        sub_divisions: labels(filterOptions.sub_divisions || filterOptions.subdivision || filterOptions.subdivisions),
        reporting_currency: labels(filterOptions.reporting_currencies),
        as_on_date: labels(filterOptions.as_on_dates),
        aging_basis: labels(filterOptions.aging_basis).map(displayAgingBasis),
    };

    const getSelected = (key) => {
        const value = viewFilters[key];
        return Array.isArray(value) ? value : [value].filter(Boolean);
    };

    const toggle = (key, value) => {
        setViewFilters((prev) => {
            const current = Array.isArray(prev[key])
                ? prev[key].filter((x) => String(x).trim().toLowerCase() !== "all")
                : [];
            const next = current.includes(value)
                ? current.filter((x) => x !== value)
                : [...current, value];
            return { ...prev, [key]: next };
        });
    };

    const setSingle = (key, value) => {
        setViewFilters((prev) => ({ ...prev, [key]: value || "" }));
        setOpenFilter(null);
    };

    const clearFilter = (key) => {
        const isMulti = [
            "legal_group",
            "legal_entities",
            "parent_divisions",
            "sub_divisions",
        ].includes(key);
        setViewFilters((prev) => ({
            ...prev,
            [key]: isMulti ? [] : "",
        }));
        setFilterSearch((prev) => ({ ...prev, [key]: "" }));
    };

    const selectAllFilter = (key) => {
        const allOptions = (options[key] || []).filter(
            (option) => String(option).trim().toLowerCase() !== "all"
        );
        setViewFilters((prev) => ({
            ...prev,
            [key]: [...allOptions],
        }));
    };

    /*
     * View All filters must be applied to the backend data source.
     * The section summary arrays (especially Aging Summary) do not contain
     * legal-group/entity/division fields, so filtering those local arrays
     * cannot work. Reload the relevant existing API with the selected filters.
     */
    React.useEffect(() => {
        let active = true;

        const loadFilteredSection = async () => {
            setSectionLoading(true);
            setSectionError("");

            try {
                const apiFilters = buildPayablesApiFilters(
                    { ...filters, ...applied },
                    filterOptions
                );

                let result;
                if (section === "sub_division") {
                    result = await getPayablesBySubdivision(apiFilters);
                    const rows = normalizeSubdivisionResponse(result);
                    if (active) setSectionRows(Array.isArray(rows) ? rows : []);
                } else if (section === "month_on_month") {
                    result = await getPayablesMonthOnMonth({
                        ...apiFilters,
                        year: applied?.year || filters?.year,
                    });
                    const rows = normalizeMonthOnMonthResponse(result);
                    if (active) setSectionRows(Array.isArray(rows) ? rows : []);
                } else {
                    result = await getPayablesDashboard(apiFilters);
                    const dashboard = normalizeDashboardResponse(result);
                    const sectionKey = {
                        aging: "agingSummary",
                        trend: "trend",
                        parent_division: "parentDivision",
                        top_suppliers: "topSuppliers",
                        overdue: "overdueSummary",
                    }[section];
                    const rows = sectionKey ? dashboard?.[sectionKey] : config.rows;
                    if (active) setSectionRows(Array.isArray(rows) ? rows : []);
                }
            } catch (error) {
                console.error(`Payables ${section} View All filter failed`, error);
                if (active) {
                    setSectionRows([]);
                    setSectionError(
                        error?.response?.data?.detail ||
                        error?.message ||
                        "Failed to load filtered data."
                    );
                }
            } finally {
                if (active) setSectionLoading(false);
            }
        };

        loadFilteredSection();
        return () => {
            active = false;
        };
    }, [section, applied, filters, filterOptions]);

    const filteredRows = (sectionRows || []).filter((row) => {
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            if (!Object.values(row || {}).some((v) => String(v ?? "").toLowerCase().includes(q))) return false;
        }
        return true;
    });

    const totalRows = filteredRows.length;
    const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
    const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
    React.useEffect(() => { setPage(1); }, [section, applied, search]);

    const amountForRow = (row) => {
        const candidates = [row.amount, row.total_payables, row.total_payable, row.payable_amount, row.latest];
        return candidates.find((v) => v !== undefined && v !== null && Number.isFinite(Number(v))) ?? 0;
    };
    const kpiRows = filteredRows;
    const total = kpiRows.reduce((s, r) => s + Number(r.total_payables ?? r.total_payable ?? r.payable_amount ?? r.amount ?? r.latest ?? 0), 0);
    const current = kpiRows.reduce((s, r) => s + Number(r.current ?? r.current_payables ?? 0), 0);
    const overdue = kpiRows.reduce((s, r) => s + Number(r.overdue_payables ?? r.overdue ?? r.overdue_amount ?? 0), 0);
    const overdue90 = kpiRows.reduce((s, r) => s + Number(r["91_120"] ?? 0) + Number(r["121_180"] ?? 0) + Number(r["181_365"] ?? 0) + Number(r.above_365 ?? 0), 0);
    const kpis = [
        ["Total Payables", total, "#eef2ff", "#4f46e5", "₹"],
        ["Current Payables", current, "#ecfdf5", "#059669", "✓"],
        ["Overdue Payables", overdue, "#fff7ed", "#ea580c", "!"],
        ["Overdue > 90 Days", overdue90, "#fef2f2", "#dc2626", "90+"],
    ];

    const exportSection = async (format) => {
        try {
            const apiFilters = buildPayablesApiFilters({ ...filters, ...applied }, filterOptions);
            const response = format === "excel" ? await exportPayablesExcel(apiFilters) : await exportPayablesPdf(apiFilters);
            const blob = response?.data instanceof Blob ? response.data : response instanceof Blob ? response : null;
            if (!blob) throw new Error("Export response did not contain a downloadable file.");
            const disposition = response?.headers?.["content-disposition"] || response?.headers?.["Content-Disposition"] || "";
            const match = disposition.match(/filename\\*?=(?:UTF-8''|")?([^";\\n]+)"?/i);
            const fallback = `${String(section || "payables").replace(/[^a-z0-9]+/gi, "_")}_View_All.${format === "excel" ? "xlsx" : "pdf"}`;
            const filename = match?.[1] ? decodeURIComponent(match[1]) : fallback;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(`Payables ${section} View All export failed`, e);
        }
    };

    const MultiFilter = ({ label, filterKey, optionList }) => {
        const cleanOptions = (optionList || []).filter(
            (option) => String(option).trim().toLowerCase() !== "all"
        );
        const selected = getSelected(filterKey).filter(
            (value) => String(value).trim().toLowerCase() !== "all"
        );
        const query = String(filterSearch[filterKey] || "").trim().toLowerCase();
        const filteredOptions = cleanOptions.filter((option) =>
            String(option).toLowerCase().includes(query)
        );
        const allSelected = cleanOptions.length > 0 && selected.length === cleanOptions.length;
        const display = selected.length === 0 || allSelected
            ? "All"
            : selected.length === 1
                ? selected[0]
                : `${selected.length} selected`;

        return (
            <div style={{ position: "relative", minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5, whiteSpace: "nowrap" }}>{label}</div>
                <button type="button" onClick={() => setOpenFilter((v) => v === filterKey ? null : filterKey)} style={{ width: "100%", height: 34, border: "1px solid #d5ddeb", borderRadius: 6, background: "#f4f7fc", color: "#29427f", fontSize: 11, fontWeight: 600, padding: "0 9px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{display}</span>
                    <span style={{ fontSize: 10, marginLeft: 6 }}>▾</span>
                </button>
                {openFilter === filterKey && (
                    <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, width: 220, background: "#fff", border: "1px solid #d7dfeb", borderRadius: 7, boxShadow: "0 8px 22px rgba(15,23,42,.14)", zIndex: 10050, overflow: "hidden" }}>
                        <div style={{ padding: 7, borderBottom: "1px solid #edf1f6" }}>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
                                <input value={filterSearch[filterKey] || ""} onChange={(e) => setFilterSearch((p) => ({ ...p, [filterKey]: e.target.value }))} onClick={(e) => e.stopPropagation()} autoFocus placeholder={`Search ${label}`} style={{ width: "100%", height: 30, border: "1px solid #d9e1ee", borderRadius: 5, padding: "0 8px 0 27px", outline: "none", fontSize: 10, boxSizing: "border-box" }} />
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 9px", borderBottom: "1px solid #edf1f6" }}>
                            <button type="button" onClick={() => { if (allSelected) clearFilter(filterKey); else selectAllFilter(filterKey); }} style={{ border: 0, background: "transparent", padding: 0, color: "#4d46e5", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{allSelected ? "Deselect All" : "Select All"}</button>
                            <button type="button" onClick={() => clearFilter(filterKey)} style={{ border: 0, background: "transparent", padding: 0, color: "#64748b", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Clear</button>
                        </div>
                        <div style={{ maxHeight: 235, overflowY: "auto", padding: "3px 0" }}>
                            {filteredOptions.map((option) => {
                                const checked = selected.includes(option);
                                return (
                                    <label key={String(option)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", cursor: "pointer", fontSize: 10, color: "#334155", background: checked ? "#f5f7ff" : "#fff" }}>
                                        <input type="checkbox" checked={checked} onChange={() => toggle(filterKey, option)} style={{ width: 13, height: 13, margin: 0, accentColor: "#4936e9", cursor: "pointer" }} />
                                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{option}</span>
                                    </label>
                                );
                            })}
                            {!filteredOptions.length && <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 10 }}>No results found</div>}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const SingleFilter = ({ label, filterKey, optionList }) => {
        const current = String(viewFilters[filterKey] || "");
        const query = String(filterSearch[filterKey] || "").trim().toLowerCase();
        const filteredOptions = optionList.filter((option) => String(option).toLowerCase().includes(query));
        const display = current || "All";
        return (
            <div style={{ position: "relative", minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5, whiteSpace: "nowrap" }}>{label}</div>
                <button type="button" onClick={() => setOpenFilter((v) => v === filterKey ? null : filterKey)} style={{ width: "100%", height: 34, border: "1px solid #d5ddeb", borderRadius: 6, background: "#f4f7fc", color: "#29427f", fontSize: 11, fontWeight: 600, padding: "0 9px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{display}</span><span style={{ fontSize: 10 }}>▾</span>
                </button>
                {openFilter === filterKey && (
                    <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, width: 210, background: "#fff", border: "1px solid #d7dfeb", borderRadius: 7, boxShadow: "0 8px 22px rgba(15,23,42,.14)", zIndex: 10050, overflow: "hidden" }}>
                        <div style={{ padding: 7, borderBottom: "1px solid #edf1f6" }}><input value={filterSearch[filterKey] || ""} onChange={(e) => setFilterSearch((p) => ({ ...p, [filterKey]: e.target.value }))} autoFocus placeholder={`Search ${label}`} style={{ width: "100%", height: 30, border: "1px solid #d9e1ee", borderRadius: 5, padding: "0 8px", outline: "none", fontSize: 10, boxSizing: "border-box" }} /></div>
                        <div style={{ maxHeight: 220, overflowY: "auto" }}>
                            <button type="button" onClick={() => setSingle(filterKey, "")} style={{ display: "block", width: "100%", border: 0, background: !current ? "#f5f7ff" : "#fff", padding: "7px 9px", textAlign: "left", fontSize: 10, cursor: "pointer" }}>All</button>
                            {filteredOptions.map((option) => <button key={String(option)} type="button" onClick={() => setSingle(filterKey, option)} style={{ display: "block", width: "100%", border: 0, background: current === option ? "#f5f7ff" : "#fff", padding: "7px 9px", textAlign: "left", fontSize: 10, cursor: "pointer" }}>{option}</button>)}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.48)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ width: "min(1450px,100%)", maxHeight: "92vh", background: "#f7faff", borderRadius: 10, overflow: "hidden", boxShadow: "0 18px 55px rgba(15,23,42,0.28)", display: "flex", flexDirection: "column" }}>
                <div style={{ overflowY: "auto", padding: "18px 18px 28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 15, marginBottom: 14 }}>
                        <div>
                            <div style={{ fontSize: 27, lineHeight: 1.1, fontWeight: 800, color: "#102a72" }}>{config.title}</div>
                            <div style={{ marginTop: 5, fontSize: 12, color: "#64748b" }}>{config.subtitle}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button type="button" onClick={() => exportSection("excel")} style={{ height: 34, padding: "0 13px", border: "1px solid #86efac", borderRadius: 8, background: "#f7fffa", color: "#16a34a", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>📊 Excel</button>
                            <button type="button" onClick={() => exportSection("pdf")} style={{ height: 34, padding: "0 13px", border: "1px solid #fda4af", borderRadius: 8, background: "#fff8f8", color: "#ef4444", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>📄 PDF</button>
                            <button type="button" onClick={onClose} style={{ height: 34, padding: "0 13px", border: "1px solid #cbd5e1", borderRadius: 5, background: "#fff", color: "#3149a5", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✖</button>
                        </div>
                    </div>

                    <div style={{ background: "#fff", border: "1px solid #e3e9f2", borderRadius: 9, padding: "13px 14px 15px", marginBottom: 14 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#173b8f", marginBottom: 11 }}>Filters</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(110px,1fr)) auto auto", gap: 10, alignItems: "end" }}>
                            <MultiFilter label="Legal Group" filterKey="legal_group" optionList={options.legal_group} />
                            <MultiFilter label="Legal Entity" filterKey="legal_entities" optionList={options.legal_entities} />
                            <MultiFilter label="Parent Division" filterKey="parent_divisions" optionList={options.parent_divisions} />
                            <MultiFilter label="Sub-Division" filterKey="sub_divisions" optionList={options.sub_divisions} />
                            <SingleFilter label="Reporting Currency" filterKey="reporting_currency" optionList={options.reporting_currency} />
                            <SingleFilter label="As On Date" filterKey="as_on_date" optionList={options.as_on_date} />
                            <SingleFilter label="Aging Basis" filterKey="aging_basis" optionList={options.aging_basis} />
                            <button type="button" onClick={() => { setApplied({ ...viewFilters }); setOpenFilter(null); }} style={{ height: 34, padding: "0 20px", border: 0, borderRadius: 5, background: "#4936e9", color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Apply</button>
                            <button type="button" onClick={() => { setViewFilters(initial); setApplied(initial); setFilterSearch({}); setOpenFilter(null); }} style={{ height: 34, padding: "0 18px", border: "1px solid #d4dbe7", borderRadius: 5, background: "#fff", color: "#334155", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Reset</button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9, marginBottom: 14 }}>
                        {kpis.map(([title, value, bg, color, icon]) => (
                            <div key={title} style={{ background: "#fff", border: "1px solid #e5eaf2", borderRadius: 8, minHeight: 78, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 42, height: 42, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: icon === "90+" ? 11 : 18, fontWeight: 800 }}>{icon}</div>
                                <div><div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 3 }}>{title}</div><div style={{ fontSize: 18, fontWeight: 800, color: Number(value) < 0 ? "#dc2626" : "#142b6f" }}>{formatPayablesCompact(value, currency)}</div></div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>{totalRows.toLocaleString()} records</div>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." style={{ width: 220, height: 32, border: "1px solid #d5ddeb", borderRadius: 6, padding: "0 9px", fontSize: 10 }} />
                    </div>

                    <div style={{ background: "#fff", border: "1px solid #e3e9f2", borderRadius: 9, overflow: "hidden" }}>
                        <DataTable columns={config.columns} rows={pageRows} pagination={false} fitColumns negativeValuesRed={true} monthColumnGap={section === "month_on_month"} removeDecimals={section !== "month_on_month"} currencyToggle={section === "month_on_month"} />
                        {pageRows.length === 0 && <div style={{ textAlign: "center", padding: 35, color: "#64748b", fontSize: 12 }}>No data available for this section.</div>}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 10 }}>
                        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ height: 30, padding: "0 12px", border: "1px solid #d5ddeb", borderRadius: 5, background: "#fff" }}>‹</button>
                        <span style={{ fontSize: 10, color: "#64748b" }}>Page {page} of {pageCount}</span>
                        <button disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} style={{ height: 30, padding: "0 12px", border: "1px solid #d5ddeb", borderRadius: 5, background: "#fff" }}>›</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   VIEW ALL
   ============================================================ */


function PayablesViewAll({
    filters,
    section = "all",
    data,
    currency,
    filterOptions = {},
    detailFilters = {},
    onClose,
}) {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("total_payable");
    const [sortDirection, setSortDirection] = useState("desc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const sectionViewAllTitles = {
        all: ["Payables View All", "Complete payable records."],
        aging: ["Payables Aging Summary View All", "Underlying payable records for the selected snapshot."],
        trend: ["Payables Trend View All", "Underlying payable records for the selected snapshot."],
        parent_division: ["Payables by Parent Division View All", "Underlying payable records for the selected dashboard scope."],
        top_suppliers: ["Top Suppliers by Payables View All", "Underlying supplier payable records."],
        overdue: ["Overdue Summary View All", "Underlying overdue payable records."],
        sub_division: ["Payables by Sub-Division View All", "Underlying payable records for the selected dashboard scope."],
        month_on_month: ["Month-on-Month Payables View All", "Underlying payable records for the selected month and hierarchy."],
    };

    const [viewAllTitle, viewAllSubtitle] =
        sectionViewAllTitles[section] || sectionViewAllTitles.all;

    /* ============================================================
       VIEW ALL FILTERS
    ============================================================ */

    const getInitialViewFilters = () => {
        const toMultiValue = (value) => {
            if (Array.isArray(value)) {
                const values = value.filter(
                    (item) => item !== undefined && item !== null && String(item) !== ""
                );
                return values.length ? [...values] : ["All"];
            }

            if (value !== undefined && value !== null && String(value) !== "") {
                return [value];
            }

            return ["All"];
        };

        return {
            // Carry the exact main-page selections into View All.
            // If the main filter is unselected, keep the existing "All" state.
            legal_group: toMultiValue(filters?.legal_group),
            legal_entities: toMultiValue(filters?.legal_entities),
            parent_divisions: toMultiValue(filters?.parent_divisions),
            sub_divisions: toMultiValue(filters?.sub_divisions),

            reporting_currency:
                filters?.reporting_currency ||
                currency ||
                "AED",

            as_on_date:
                filters?.as_on_date ||
                filters?.as_on_dates ||
                filters?.asOfDate ||
                "",

            aging_basis:
                filters?.aging_basis ||
                filters?.agingBasis ||
                "Due Date Based",
        };
    };

    const [viewFilters, setViewFilters] = useState(
        getInitialViewFilters
    );

    const [appliedViewFilters, setAppliedViewFilters] =
        useState(getInitialViewFilters);

    /* ============================================================
       DROPDOWN STATE
    ============================================================ */

    const [openFilter, setOpenFilter] = useState(null);

    const [filterSearch, setFilterSearch] = useState({
        legal_group: "",
        legal_entities: "",
        parent_divisions: "",
        sub_divisions: "",
        reporting_currency: "",
        as_on_date: "",
        aging_basis: "",
    });

    const [serverRows, setServerRows] = useState(Array.isArray(data) ? data : []);
    const [serverTotalRecords, setServerTotalRecords] = useState(0);
    const [serverSummary, setServerSummary] = useState({});
    const [viewLoading, setViewLoading] = useState(false);
    const [viewError, setViewError] = useState("");

    const safeData = Array.isArray(serverRows) ? serverRows : [];

    const viewFilterOptions = {
        legal_group: getOptionLabels(filterOptions.legal_groups || []),
        legal_entities: getOptionLabels(filterOptions.legal_entities || []),
        parent_divisions: getOptionLabels(filterOptions.parent_divisions || []),
        sub_divisions: getOptionLabels(filterOptions.sub_divisions || []),
        reporting_currencies: getOptionLabels(filterOptions.reporting_currencies || []),
        as_on_dates: getOptionLabels(filterOptions.as_on_dates || []),
        aging_basis: getOptionLabels(filterOptions.aging_basis || []).map(displayAgingBasis),
    };

    const viewCascadeLegalEntities = cascadeLegalEntities(filterOptions.legal_entities || [], viewFilters.legal_group);
    const viewCascadeParentDivisions = cascadeParentDivisions(filterOptions.parent_divisions || [], viewFilters.legal_entities, viewFilters.legal_group);
    const viewCascadeSubDivisions = cascadeSubDivisions(filterOptions.sub_divisions || [], viewFilters.parent_divisions, viewFilters.legal_entities, viewFilters.legal_group);

    const normalizeViewAllRow = (row = {}) => ({
        ...row,
        id: row.id ?? row.supplier_id ?? row.supplier_code,
        legal_entity: row.legal_entity ?? row.legal_entity_name ?? "",
        parent_division: row.parent_division ?? row.parent_division_name ?? "",
        sub_division:
            row.sub_division ??
            row.subdivision ??
            row.subdivision_name ??
            row.sub_division_name ??
            "",
        supplier_code: row.supplier_code ?? row.supplier_id ?? "",
        supplier_name: row.supplier_name ?? row.supplier ?? row.name ?? "",
        country: row.country ?? row.supplier_country ?? "",
        currency:
            row.currency ??
            row.source_currency ??
            row.reporting_currency ??
            "",
        row_currency:
            row.row_currency ??
            row.source_currency ??
            row.reporting_currency ??
            row.currency ??
            "",
        total_payable:
            row.total_payable ??
            row.total_payables ??
            row.total_outstanding ??
            row.outstanding_amount ??
            0,
        current:
            row.current ??
            row.current_payables ??
            row.current_amount ??
            0,
        "0_30":
            row["0_30"] ??
            row["0-30"] ??
            row.amount_0_30 ??
            row.bucket_0_30 ??
            0,
        "31_60":
            row["31_60"] ??
            row["31-60"] ??
            row.amount_31_60 ??
            row.bucket_31_60 ??
            0,
        "61_90":
            row["61_90"] ??
            row["61-90"] ??
            row.amount_61_90 ??
            row.bucket_61_90 ??
            0,
        "91_120":
            row["91_120"] ??
            row["91-120"] ??
            row.amount_91_120 ??
            row.bucket_91_120 ??
            0,
        "121_180":
            row["121_180"] ??
            row["121-180"] ??
            row.amount_121_180 ??
            row.bucket_121_180 ??
            0,
        "181_365":
            row["181_365"] ??
            row["181-365"] ??
            row.amount_181_365 ??
            row.bucket_181_365 ??
            0,
        above_365:
            row.above_365 ??
            row["above_365"] ??
            row.amount_above_365 ??
            row.above_365_days ??
            0,
    });

    /*
     * IMPORTANT: the View All export must use the exact same drill-down
     * parameters that were used to open this View All.  Do not rebuild these
     * from the visible table rows or from the dashboard aggregates.
     *
     * Supported backend drill-down parameters:
     *   - aging_bucket
     *   - as_on_date
     *   - parent_division_id
     *   - supplier_id
     *   - balance_status
     *   - subdivision_id
     *   - legal_entity_id
     *   - parent_division_id + subdivision_id + as_on_date (MoM)
     */
    const normalizedDetailFilters = useMemo(() => {
        const source = detailFilters || {};
        const normalized = {};

        if (source.aging_bucket !== undefined && source.aging_bucket !== null && source.aging_bucket !== "") {
            normalized.aging_bucket = toAgingBucketCode(source.aging_bucket);
        }

        if (source.balance_status !== undefined && source.balance_status !== null && source.balance_status !== "") {
            normalized.balance_status = String(source.balance_status).trim().toUpperCase();
        }

        if (source.as_on_date !== undefined && source.as_on_date !== null && source.as_on_date !== "") {
            normalized.as_on_date = toApiDate(source.as_on_date);
        }

        [
            "supplier_id",
            "customer_id",
            "parent_division_id",
            "subdivision_id",
            "legal_entity_id",
        ].forEach((key) => {
            if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
                normalized[key] = source[key];
            }
        });

        return normalized;
    }, [detailFilters]);


    useEffect(() => {
        let active = true;

        const loadViewAll = async () => {
            setViewLoading(true);
            setViewError("");

            try {
                const apiFilters = buildPayablesApiFilters(
                    {
                        ...filters,
                        ...appliedViewFilters,
                    },
                    filterOptions
                );

                const response = await getPayablesViewAll({
                    ...apiFilters,
                    ...normalizedDetailFilters,
                    page,
                    page_size: pageSize,
                    sort_by: sortKey === "total_payable" ? "total_payables" : sortKey,
                    sort_dir: sortDirection,
                    search: search.trim() || undefined,
                });

                if (!active) return;

                /*
                 * Backend response:
                 * {
                 *   data: [ ...rows ],
                 *   meta: {
                 *     total_records,
                 *     page,
                 *     page_size
                 *   }
                 * }
                 *
                 * IMPORTANT:
                 * response.data.data is the row array itself.
                 * meta is NOT inside data.
                 */
                const responseBody = response?.data ?? response ?? {};
                const records = Array.isArray(responseBody?.data)
                    ? responseBody.data
                    : (
                        responseBody?.records ??
                        responseBody?.rows ??
                        []
                    );

                const meta = responseBody?.meta ?? {};
                const total = Number(
                    meta?.total_records ??
                    meta?.total_count ??
                    responseBody?.total_records ??
                    responseBody?.total_count ??
                    (Array.isArray(records) ? records.length : 0)
                );

                const normalizedRows = Array.isArray(records)
                    ? records.map(normalizeViewAllRow)
                    : [];

                setServerRows(normalizedRows);
                setServerTotalRecords(
                    Number.isFinite(total)
                        ? total
                        : normalizedRows.length
                );

                setServerSummary(
                    responseBody?.summary ??
                    responseBody?.totals ??
                    {}
                );
            } catch (requestError) {
                console.error("Payables View All failed", requestError);
                if (active) {
                    setServerRows([]);
                    setServerTotalRecords(0);
                    setServerSummary({});
                    setViewError(
                        requestError?.response?.data?.detail ||
                        requestError?.message ||
                        "Failed to load Payables View All."
                    );
                }
            } finally {
                if (active) setViewLoading(false);
            }
        };

        loadViewAll();

        return () => {
            active = false;
        };
    }, [
        filters,
        appliedViewFilters,
        filterOptions,
        normalizedDetailFilters,
        page,
        pageSize,
        sortKey,
        sortDirection,
        search,
    ]);

    /* ============================================================
       FILTER HELPERS
    ============================================================ */

    const getFilterValue = (key, fallback = "All") => {
        const value = filters?.[key];

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return fallback;
        }

        if (Array.isArray(value)) {
            return value.length ? value.join(", ") : fallback;
        }

        return value;
    };

    const formatDate = (value) => {
        if (!value) return "";

        const normalized = toApiDate(value);
        return normalized || String(value);
    };

    const cleanCurrency = (value) => {
        if (typeof value !== "string") {
            return value;
        }

        return value.replace(
            /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
            ""
        );
    };

    const formatTableAmount = (value) => {
        const number = Number(value || 0);

        if (number < 0) {
            return `(${Math.abs(number).toLocaleString("en-US", {
                maximumFractionDigits: 0,
            })})`;
        }

        return number.toLocaleString("en-US", {
            maximumFractionDigits: 0,
        });
    };

    /* ============================================================
       DROPDOWN HELPERS
    ============================================================ */

    const multiFilterConfig = {
        legal_group: {
            label: "Legal Group",
            options: viewFilterOptions.legal_group || [],
        },

        legal_entities: {
            label: "Legal Entity",
            options: viewFilterOptions.legal_entities || [],
        },

        parent_divisions: {
            label: "Parent Division",
            options: viewFilterOptions.parent_divisions || [],
        },

        sub_divisions: {
            label: "Sub-Division",
            options: viewFilterOptions.sub_divisions || [],
        },
    };

    const singleFilterConfig = {
        reporting_currency: {
            label: "Reporting Currency",
            options: viewFilterOptions.reporting_currencies || [],
        },

        as_on_date: {
            label: "As On Date",
            options: viewFilterOptions.as_on_dates || [],
        },

        aging_basis: {
            label: "Aging Basis",
            options: viewFilterOptions.aging_basis || [],
        },
    };
    const handleFilterSearch = (key, value) => {
        setFilterSearch((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    /* ============================================================
       MULTI SELECT VALUE HELPERS
       ============================================================ */

    const getNormalizedSelectedValues = (key) => {
        const selected = Array.isArray(viewFilters[key])
            ? viewFilters[key]
            : [];

        const options = multiFilterConfig[key]?.options || [];

        /*
         * "All" is only a display/default state.
         * It should never be combined with individual values.
         */
        if (
            selected.length === 0 ||
            selected.includes("All") ||
            (options.length > 0 &&
                selected.length === options.length)
        ) {
            return options;
        }

        return selected;
    };


    const toggleMultiFilterValue = (key, value) => {
        setViewFilters((prev) => {
            const options = multiFilterConfig[key]?.options || [];

            let currentValues = Array.isArray(prev[key])
                ? prev[key]
                : [];

            /*
             * If current state is "All", start from no individual
             * selection before adding the clicked item.
             */
            if (
                currentValues.includes("All") ||
                currentValues.length === options.length
            ) {
                currentValues = [];
            }

            const exists = currentValues.includes(value);

            const nextValues = exists
                ? currentValues.filter((item) => item !== value)
                : [...currentValues, value];

            return {
                ...prev,
                [key]:
                    nextValues.length === 0
                        ? []
                        : nextValues,
            };
        });
    };


    const selectAllFilterValues = (key) => {
        const options = multiFilterConfig[key]?.options || [];

        setViewFilters((prev) => ({
            ...prev,
            [key]: [...options],
        }));
    };

    const clearFilterValues = (key) => {
        setViewFilters((prev) => ({
            ...prev,
            [key]: Array.isArray(prev[key]) ? [] : "",
        }));

        setFilterSearch((prev) => ({
            ...prev,
            [key]: "",
        }));
    };

    const selectSingleFilterValue = (key, value) => {
        setViewFilters((prev) => ({
            ...prev,
            [key]: value,
        }));

        setFilterSearch((prev) => ({
            ...prev,
            [key]: "",
        }));

        setOpenFilter(null);
    };

    const getMultiFilterDisplayValue = (key) => {
        const selected = Array.isArray(viewFilters[key])
            ? viewFilters[key]
            : [];

        const options =
            multiFilterConfig[key]?.options || [];

        // Nothing selected = All
        if (selected.length === 0) {
            return "All";
        }

        // Everything selected = All
        if (
            options.length > 0 &&
            selected.length === options.length
        ) {
            return "All";
        }

        if (selected.length === 1) {
            return selected[0];
        }

        if (selected.length === 2) {
            return selected.join(", ");
        }

        return `${selected.length} selected`;
    };

    const getSingleFilterDisplayValue = (key) => {
        const value = viewFilters[key];

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return "All";
        }

        return value;
    };

    /* ============================================================
       FILTER DROPDOWN
    ============================================================ */

    /* ============================================================
     MULTI SELECT DROPDOWN
     ============================================================ */

    const MultiSelectDropdown = ({
        filterKey,
        label,
    }) => {
        const options =
            multiFilterConfig[filterKey]?.options || [];

        const query = String(
            filterSearch[filterKey] || ""
        )
            .trim()
            .toLowerCase();

        const filteredOptions = options.filter((option) =>
            String(option)
                .toLowerCase()
                .includes(query)
        );

        const selectedValues = Array.isArray(
            viewFilters[filterKey]
        )
            ? viewFilters[filterKey]
            : [];

        const allSelected =
            options.length > 0 &&
            selectedValues.length === options.length;

        const handleSelectAll = () => {
            if (allSelected) {
                setViewFilters((prev) => ({
                    ...prev,
                    [filterKey]: [],
                }));
            } else {
                setViewFilters((prev) => ({
                    ...prev,
                    [filterKey]: [...options],
                }));
            };
        };

        return (
            <div
                style={{
                    position: "relative",
                    width: 150,
                    flex: "0 0 150px",
                }}
            >
                {/* LABEL */}
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#173b8f",
                        marginBottom: 5,
                        lineHeight: 1.2,
                    }}
                >
                    {label}
                </div>

                {/* CLOSED SELECT */}
                <button
                    type="button"
                    onClick={() => {
                        setOpenFilter((current) =>
                            current === filterKey
                                ? null
                                : filterKey
                        );
                    }}
                    style={{
                        width: "100%",
                        height: 34,
                        border: "1px solid #d9e1ee",
                        borderRadius: 6,
                        background: "#f4f7fc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 9px",
                        boxSizing: "border-box",
                        color: "#29427f",
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        textAlign: "left",
                        outline: "none",
                    }}
                >
                    <span
                        style={{
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            paddingRight: 6,
                        }}
                    >
                        {getMultiFilterDisplayValue(filterKey)}
                    </span>

                    <span
                        style={{
                            color: "#53698f",
                            fontSize: 11,
                            flexShrink: 0,
                            transform:
                                openFilter === filterKey
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                        }}
                    >
                        ▼
                    </span>
                </button>

                {/* DROPDOWN */}
                {openFilter === filterKey && (
                    <div
                        style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            width: 190,
                            background: "#ffffff",
                            border: "1px solid #d7dfeb",
                            borderRadius: 7,
                            boxShadow:
                                "0 8px 22px rgba(15, 23, 42, 0.14)",
                            zIndex: 9999,
                            overflow: "hidden",
                        }}
                    >
                        {/* SEARCH */}
                        <div
                            style={{
                                padding: "7px 8px",
                                borderBottom:
                                    "1px solid #edf1f6",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                }}
                            >
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 9,
                                        top: "50%",
                                        transform:
                                            "translateY(-50%)",
                                        color: "#94a3b8",
                                        fontSize: 13,
                                        pointerEvents: "none",
                                    }}
                                >
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={
                                        filterSearch[filterKey] || ""
                                    }
                                    onChange={(e) =>
                                        handleFilterSearch(
                                            filterKey,
                                            e.target.value
                                        )
                                    }
                                    placeholder={`Search ${label}`}
                                    autoFocus
                                    onClick={(e) =>
                                        e.stopPropagation()
                                    }
                                    style={{
                                        width: "100%",
                                        height: 30,
                                        border:
                                            "1px solid #d9e1ee",
                                        borderRadius: 5,
                                        padding:
                                            "0 8px 0 27px",
                                        outline: "none",
                                        fontSize: 10,
                                        color: "#334155",
                                        boxSizing: "border-box",
                                        background: "#ffffff",
                                    }}
                                />
                            </div>
                        </div>

                        {/* SELECT ALL / CLEAR */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "7px 9px",
                                borderBottom:
                                    "1px solid #edf1f6",
                                background: "#ffffff",
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#4d46e5",
                                    cursor: "pointer",
                                    fontSize: 10,
                                    fontWeight: 700,
                                }}
                            >
                                {allSelected
                                    ? "Deselect All"
                                    : "Select All"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    clearFilterValues(filterKey)
                                }
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#64748b",
                                    cursor: "pointer",
                                    fontSize: 10,
                                    fontWeight: 600,
                                }}
                            >
                                Clear
                            </button>
                        </div>

                        {/* OPTIONS */}
                        <div
                            style={{
                                maxHeight: 235,
                                overflowY: "auto",
                                padding: "3px 0",
                                background: "#ffffff",
                            }}
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => {
                                    const checked =
                                        selectedValues.includes(option);

                                    return (
                                        <label
                                            key={option}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 7,
                                                padding: "6px 9px",
                                                cursor: "pointer",
                                                fontSize: 10,
                                                color: "#334155",
                                                lineHeight: 1.2,
                                                background: checked
                                                    ? "#f5f7ff"
                                                    : "#ffffff",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background =
                                                    "#f5f7ff";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background =
                                                    checked
                                                        ? "#f5f7ff"
                                                        : "#ffffff";
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    toggleMultiFilterValue(
                                                        filterKey,
                                                        option
                                                    )
                                                }
                                                style={{
                                                    width: 13,
                                                    height: 13,
                                                    margin: 0,
                                                    accentColor: "#4936e9",
                                                    cursor: "pointer",
                                                    flexShrink: 0,
                                                }}
                                            />

                                            <span
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow:
                                                        "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    flex: 1,
                                                }}
                                                title={option}
                                            >
                                                {option}
                                            </span>
                                        </label>
                                    );
                                })
                            ) : (
                                <div
                                    style={{
                                        padding: "18px 10px",
                                        textAlign: "center",
                                        color: "#94a3b8",
                                        fontSize: 10,
                                    }}
                                >
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };
    /* ============================================================
       SINGLE SELECT DROPDOWN
       ============================================================ */

    const SingleSelectDropdown = ({
        filterKey,
        label,
    }) => {
        const options =
            singleFilterConfig[filterKey]?.options || [];

        const query = String(
            filterSearch[filterKey] || ""
        )
            .trim()
            .toLowerCase();

        const filteredOptions = options.filter((option) =>
            String(option)
                .toLowerCase()
                .includes(query)
        );

        return (
            <div
                style={{
                    position: "relative",
                    width: 150,
                    minWidth: 150,
                    flex: "0 0 150px",
                }}
            >
                {/* LABEL */}
                <div
                    style={{
                        fontSize: 10,
                        lineHeight: 1.2,
                        fontWeight: 700,
                        color: "#173b8f",
                        marginBottom: 5,
                        whiteSpace: "nowrap",
                    }}
                >
                    {label}
                </div>

                {/* SELECT BOX */}
                <button
                    type="button"
                    onClick={() => {
                        setOpenFilter((current) =>
                            current === filterKey
                                ? null
                                : filterKey
                        );
                    }}
                    style={{
                        width: "100%",
                        height: 34,
                        border: "1px solid #d9e1ee",
                        borderRadius: 5,
                        background: "#f4f7fc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 9px",
                        boxSizing: "border-box",
                        color: "#29427f",
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        textAlign: "left",
                        outline: "none",
                    }}
                >
                    <span
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            minWidth: 0,
                        }}
                        title={getSingleFilterDisplayValue(
                            filterKey
                        )}
                    >
                        {getSingleFilterDisplayValue(
                            filterKey
                        )}
                    </span>

                    <span
                        style={{
                            color: "#173b8f",
                            fontSize: 12,
                            flexShrink: 0,
                            lineHeight: 1,
                            transform:
                                openFilter === filterKey
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                            transition:
                                "transform 0.15s ease",
                        }}
                    >
                        ▼
                    </span>
                </button>

                {/* DROPDOWN */}
                {openFilter === filterKey && (
                    <div
                        style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            width: 210,
                            background: "#ffffff",
                            border: "1px solid #d7dfeb",
                            borderRadius: 7,
                            boxShadow:
                                "0 8px 22px rgba(15, 23, 42, 0.16)",
                            zIndex: 9999,
                            overflow: "hidden",
                        }}
                    >
                        {/* SEARCH */}
                        <div
                            style={{
                                padding: "8px",
                                borderBottom:
                                    "1px solid #edf1f6",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                }}
                            >
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 9,
                                        top: "50%",
                                        transform:
                                            "translateY(-50%)",
                                        color: "#64748b",
                                        fontSize: 13,
                                        pointerEvents: "none",
                                    }}
                                >
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    value={
                                        filterSearch[filterKey] || ""
                                    }
                                    onChange={(e) =>
                                        handleFilterSearch(
                                            filterKey,
                                            e.target.value
                                        )
                                    }
                                    placeholder={`Search ${label}`}
                                    autoFocus
                                    style={{
                                        width: "100%",
                                        height: 32,
                                        border:
                                            "1px solid #d6dfec",
                                        borderRadius: 5,
                                        padding:
                                            "0 8px 0 29px",
                                        outline: "none",
                                        fontSize: 10,
                                        color: "#334155",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        </div>

                        {/* CLEAR */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "flex-end",
                                alignItems: "center",
                                height: 32,
                                padding: "0 9px",
                                borderBottom:
                                    "1px solid #edf1f6",
                                boxSizing: "border-box",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    clearFilterValues(
                                        filterKey
                                    )
                                }
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#64748b",
                                    cursor: "pointer",
                                    fontSize: 10,
                                    fontWeight: 600,
                                }}
                            >
                                Clear
                            </button>
                        </div>

                        {/* OPTIONS */}
                        <div
                            style={{
                                maxHeight: 200,
                                overflowY: "auto",
                                padding: "3px 0",
                            }}
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map(
                                    (option) => {
                                        const selected =
                                            viewFilters[
                                            filterKey
                                            ] === option;

                                        return (
                                            <button
                                                key={`${filterKey}-${option}`}
                                                type="button"
                                                onClick={() =>
                                                    selectSingleFilterValue(
                                                        filterKey,
                                                        option
                                                    )
                                                }
                                                style={{
                                                    width: "100%",
                                                    minHeight: 30,
                                                    border: "none",
                                                    background: selected
                                                        ? "#f1f5ff"
                                                        : "#ffffff",
                                                    padding:
                                                        "6px 10px",
                                                    textAlign: "left",
                                                    cursor: "pointer",
                                                    color: selected
                                                        ? "#4936e9"
                                                        : "#334155",
                                                    fontSize: 10,
                                                    fontWeight: selected
                                                        ? 700
                                                        : 500,
                                                    boxSizing:
                                                        "border-box",
                                                }}
                                            >
                                                {option}
                                            </button>
                                        );
                                    }
                                )
                            ) : (
                                <div
                                    style={{
                                        padding: 15,
                                        textAlign: "center",
                                        color: "#94a3b8",
                                        fontSize: 10,
                                    }}
                                >
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const filtered = safeData;

    const totalPages = Math.max(
        1,
        Math.ceil(serverTotalRecords / pageSize)
    );

    const pageRows = filtered;

    useEffect(() => {
        setPage(1);
    }, [search, appliedViewFilters, pageSize, sortKey, sortDirection]);

    const changeSort = (key) => {
        if (sortKey === key) {
            setSortDirection((direction) =>
                direction === "asc" ? "desc" : "asc"
            );
        } else {
            setSortKey(key);
            setSortDirection("desc");
        }
    };

    /* ============================================================
       APPLY / RESET FILTERS
    ============================================================ */

    const handleApplyViewFilters = () => {
        setAppliedViewFilters({
            ...viewFilters,
        });

        setOpenFilter(null);
    };

    const handleResetViewFilters = () => {
        const initialFilters = getInitialViewFilters();

        setViewFilters(initialFilters);
        setAppliedViewFilters(initialFilters);

        setFilterSearch({
            legal_group: "",
            legal_entities: "",
            parent_divisions: "",
            sub_divisions: "",
            reporting_currency: "",
            as_on_date: "",
            aging_basis: "",
        });

        setOpenFilter(null);
    };

    /* ============================================================
       TABLE COLUMNS
    ============================================================ */

    const viewColumns = [
        {
            key: "legal_entity",
            label: "Legal Entity",
            sortable: true,
            text: true,
        },
        {
            key: "parent_division",
            label: "Parent Division",
            sortable: true,
            text: true,
        },
        {
            key: "sub_division",
            label: "Sub-Division",
            sortable: true,
            text: true,
        },
        {
            key: "supplier_code",
            label: "Supplier Code",
            sortable: true,
            text: true,
        },
        {
            key: "supplier_name",
            label: "Supplier Name",
            sortable: true,
            text: true,
        },
        {
            key: "country",
            label: "Country",
            sortable: true,
            text: true,
        },
        {
            key: "row_currency",
            label: "Currency",
            text: true,
        },
        {
            key: "total_payable",
            label: "Total Payables",
            sortable: true,
        },
        {
            key: "current",
            label: "Current",
            sortable: true,
        },
        {
            key: "0_30",
            label: "0 – 30",
            sortable: true,
        },
        {
            key: "31_60",
            label: "31 – 60",
            sortable: true,
        },
        {
            key: "61_90",
            label: "61 – 90",
            sortable: true,
        },
        {
            key: "91_120",
            label: "91 – 120",
            sortable: true,
        },
        {
            key: "121_180",
            label: "121 – 180",
            sortable: true,
        },
        {
            key: "181_365",
            label: "181 – 365",
            sortable: true,
        },
        {
            key: "above_365",
            label: "Above 365",
            sortable: true,
        },
    ];

    const amountColumns = [
        "total_payable",
        "current",
        "0_30",
        "31_60",
        "61_90",
        "91_120",
        "121_180",
        "181_365",
        "above_365",
    ];

    /*
     * Fixed column widths prevent long names from expanding the numeric
     * columns and keep the View All table compact and predictable.
     */
    const viewColumnWidths = {
        legal_entity: 175,
        parent_division: 125,
        sub_division: 125,
        supplier_code: 120,
        supplier_name: 185,
        country: 105,
        row_currency: 92,
        total_payable: 145,
        current: 100,
        "0_30": 92,
        "31_60": 92,
        "61_90": 92,
        "91_120": 96,
        "121_180": 102,
        "181_365": 102,
        above_365: 96,
    };

    const viewTableMinWidth =
        Object.values(viewColumnWidths).reduce(
            (sum, width) => sum + width,
            0
        );

    const handleViewAllExport = async (format) => {
        try {
            const apiFilters = buildPayablesApiFilters(
                {
                    ...filters,
                    ...appliedViewFilters,
                },
                filterOptions
            );

            // Keep the drill-down filters separate and merge them last so that
            // they can never be lost/overwritten by normal dashboard filters.
            const exportParams = {
                ...apiFilters,
                ...normalizedDetailFilters,
            };

            const response =
                format === "excel"
                    ? await exportPayablesExcel(exportParams)
                    : await exportPayablesPdf(exportParams);

            const blob =
                response?.data instanceof Blob
                    ? response.data
                    : response instanceof Blob
                        ? response
                        : null;

            if (!blob) {
                throw new Error("Export response did not contain a downloadable file.");
            }

            const disposition =
                response?.headers?.["content-disposition"] ||
                response?.headers?.["Content-Disposition"] ||
                "";
            const match = disposition.match(
                /filename\*?=(?:UTF-8''|")?([^";\n]+)"?/i
            );
            const safeSection = String(section || "payables")
                .replace(/[^a-z0-9]+/gi, "_")
                .replace(/^_+|_+$/g, "");
            const fallback = `Payables_${safeSection || "View_All"}_View_All.${format === "excel" ? "xlsx" : "pdf"
                }`;
            const filename = match?.[1]
                ? decodeURIComponent(match[1])
                : fallback;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Payables View All ${format} export failed`, error);
        }
    };

    const summarySource = serverSummary || {};
    /*
     * KPI calculation priority:
     * 1. Use an aggregate returned by the backend, when available.
     * 2. Otherwise calculate from the rows currently loaded.
     *
     * The /api/payables/view-all response supplied for this page contains
     * only the current page in `data` and has no summary object, so summing
     * those rows is a PAGE TOTAL, not a 4,152-record grand total.
     */
    const pageTotalPayables = safeData.reduce(
        (sum, row) =>
            sum +
            Number(
                row.total_payable ??
                row.total_payables ??
                0
            ),
        0
    );

    const pageCurrentPayables = safeData.reduce(
        (sum, row) =>
            sum +
            Number(
                row.current ??
                row.current_payables ??
                0
            ),
        0
    );

    const pageOverduePayables = safeData.reduce(
        (sum, row) =>
            sum +
            Number(row["0_30"] ?? 0) +
            Number(row["31_60"] ?? 0) +
            Number(row["61_90"] ?? 0) +
            Number(row["91_120"] ?? 0) +
            Number(row["121_180"] ?? 0) +
            Number(row["181_365"] ?? 0) +
            Number(row["above_365"] ?? 0),
        0
    );

    const pageOverdue90 = safeData.reduce(
        (sum, row) =>
            sum +
            Number(row["91_120"] ?? 0) +
            Number(row["121_180"] ?? 0) +
            Number(row["181_365"] ?? 0) +
            Number(row["above_365"] ?? 0),
        0
    );

    const totalPayables = Number(
        summarySource.total_payables ??
        summarySource.total ??
        pageTotalPayables
    );

    const currentPayables = Number(
        summarySource.current_payables ??
        summarySource.current ??
        pageCurrentPayables
    );

    const overduePayables = Number(
        summarySource.overdue_payables ??
        summarySource.overdue ??
        pageOverduePayables
    );

    const overdue90 = Number(
        summarySource.overdue_gt_90 ??
        summarySource.overdue_above_90 ??
        pageOverdue90
    );

    const hasBackendSummary = Boolean(
        summarySource &&
        (
            summarySource.total_payables !== undefined ||
            summarySource.current_payables !== undefined ||
            summarySource.overdue_payables !== undefined ||
            summarySource.overdue_gt_90 !== undefined ||
            summarySource.overdue_above_90 !== undefined
        )
    );

    const snapshotDate =
        filters?.as_on_date ||
        filters?.as_on_dates ||
        filters?.asOfDate ||
        filters?.snapshot_date ||
        null;

    const agingBasis =
        appliedViewFilters?.aging_basis ||
        filters?.aging_basis ||
        filters?.agingBasis ||
        "Due Date Based";

    // View All Summary Cards must use the Reporting Currency
    // selected inside View All and applied by the user.
    const viewAllCurrency =
        appliedViewFilters?.reporting_currency ||
        currency ||
        "AED";

    /* ============================================================
       KPI CARD
    ============================================================ */

    const SummaryCard = ({
        icon,
        title,
        value,
        iconBackground,
        iconColor,
        titleColor,
        cardBackground = "#ffffff",
    }) => (
        <div
            style={{
                background: cardBackground,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                minHeight: 78,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxSizing: "border-box",
                boxShadow:
                    "0 2px 8px rgba(15, 23, 42, 0.03)",
            }}
        >
            <div
                style={{
                    width: 42,
                    height: 42,
                    minWidth: 42,
                    borderRadius: "50%",
                    background: iconBackground,
                    color: iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 800,
                }}
            >
                {icon}
            </div>

            <div
                style={{
                    minWidth: 0,
                }}
            >
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: titleColor,
                        marginBottom: 3,
                    }}
                >
                    {title}
                </div>

                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#142b6f",
                        whiteSpace: "nowrap",
                    }}
                >
                    {formatPayablesCompact(
                        value,
                        viewAllCurrency
                    )}
                </div>
            </div>
        </div>
    );

    /* ============================================================
       RETURN
    ============================================================ */

    /*
     * View All is a real modal overlay, not a block rendered after the
     * dashboard footer.  Keeping the existing View All content intact while
     * changing only this outer container makes the existing API/data/table
     * behavior independent from the modal presentation.
     */
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    return (
        <>
            <div
                aria-hidden="true"
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(15,23,42,0.46)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    zIndex: 99999,
                }}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="payables-view-all-title"
                className="sales-style-view-all-modal"
                style={{
                    position: "fixed",
                    top: 0,
                    left: "50%",
                    right: "auto",
                    marginLeft: 0,
                    marginRight: 0,
                    transform: "translateX(-50%)",
                    width: "96vw",
                    maxWidth: 1540,
                    height: "100vh",
                    maxHeight: "100vh",
                    minHeight: 0,
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: 16,
                    boxShadow: "0 24px 80px rgba(15,23,42,0.28), 0 8px 30px rgba(15,23,42,0.12)",
                    backdropFilter: "none",
                    animation: "payablesViewAllModalIn 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards",
                    zIndex: 100000,
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "12px 14px 16px",
                    boxSizing: "border-box",
                }}
            >
                {/* MODAL HEADER */}
                <div
                    style={{
                        position: "sticky",
                        top: -12,
                        zIndex: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        margin: "-12px -14px 12px",
                        padding: "12px 14px",
                        background: "linear-gradient(135deg,#eef2ff 0%,#ffffff 48%,#f8fafc 100%)",
                        borderBottom: "1px solid #e2e8f0",
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <div
                            id="payables-view-all-title"
                            style={{
                                color: "#0f172a",
                                fontSize: "0.92rem",
                                fontWeight: 800,
                                lineHeight: 1.2,
                            }}
                        >
                            {viewAllTitle}
                        </div>
                        <div
                            style={{
                                marginTop: 3,
                                color: "#64748b",
                                fontSize: "0.68rem",
                                lineHeight: 1.35,
                            }}
                        >
                            {viewAllSubtitle}
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexShrink: 0,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => handleViewAllExport("excel")}
                            style={{
                                height: 32,
                                padding: "0 12px",
                                border: "1px solid #d6dfec",
                                borderRadius: 7,
                                background: "#ffffff",
                                color: "#1f4f9a",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <span aria-hidden="true">📊</span>
                            Excel
                        </button>

                        <button
                            type="button"
                            onClick={() => handleViewAllExport("pdf")}
                            style={{
                                height: 32,
                                padding: "0 12px",
                                border: "1px solid #d6dfec",
                                borderRadius: 7,
                                background: "#ffffff",
                                color: "#b42318",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <span aria-hidden="true">📄</span>
                            PDF
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close View All"
                            title="Close"
                            style={{
                                width: 32,
                                height: 32,
                                border: "1px solid #d6dfec",
                                borderRadius: 7,
                                background: "#ffffff",
                                color: "#475569",
                                fontSize: 20,
                                lineHeight: 1,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* ======================================================
          VIEW ALL FILTERS
      ====================================================== */}

                <div
                    style={{
                        width: "100%",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "12px 14px",
                        marginBottom: 14,
                        boxSizing: "border-box",
                        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                    }}
                >
                    <div
                        style={{
                            display: "grid",

                            // Same one-line layout as the main dashboard
                            gridTemplateColumns:
                                "1fr 1fr 1fr 1fr 1fr 1fr 1fr auto auto",

                            gap: 10,
                            alignItems: "end",
                            width: "100%",
                        }}
                    >
                        {/* ==================================================
        LEGAL GROUP
    ================================================== */}

                        <FilterSelect
                            label="Legal Group"
                            value={viewFilters.legal_group}
                            options={viewFilterOptions.legal_group}
                            multiple
                            onChange={(value) =>
                                setViewFilters((prev) => ({
                                    ...prev,
                                    legal_group: value,
                                    legal_entities: ["All"],
                                    parent_divisions: ["All"],
                                    sub_divisions: ["All"],
                                }))
                            }
                        />

                        {/* ==================================================
        LEGAL ENTITY
    ================================================== */}

                        <FilterSelect
                            label="Legal Entity"
                            value={viewFilters.legal_entities}
                            options={viewCascadeLegalEntities}
                            multiple
                            onChange={(value) =>
                                setViewFilters((prev) => ({
                                    ...prev,
                                    legal_entities: value,
                                    parent_divisions: ["All"],
                                    sub_divisions: ["All"],
                                }))
                            }
                        />

                        {/* ==================================================
        PARENT DIVISION
    ================================================== */}

                        <FilterSelect
                            label="Parent Division"
                            value={viewFilters.parent_divisions}
                            options={viewCascadeParentDivisions}
                            multiple
                            onChange={(value) =>
                                setViewFilters((prev) => ({
                                    ...prev,
                                    parent_divisions: value,
                                    sub_divisions: ["All"],
                                }))
                            }
                        />

                        {/* ==================================================
        SUB-DIVISION
    ================================================== */}

                        <FilterSelect
                            label="Sub-Division"
                            value={viewFilters.sub_divisions}
                            options={viewCascadeSubDivisions}
                            multiple
                            onChange={(value) =>
                                setViewFilters((prev) => ({
                                    ...prev,
                                    sub_divisions: value,
                                }))
                            }
                        />

                        {/* ==================================================
        REPORTING CURRENCY
    ================================================== */}

                        <FilterSelect
                            label="Reporting Currency"
                            value={viewFilters.reporting_currency}
                            options={viewFilterOptions.reporting_currencies}
                            onChange={(value) =>
                                setViewFilters((prev) => ({
                                    ...prev,
                                    reporting_currency: value,
                                }))
                            }
                        />

                        {/* ==================================================
        AGING BASIS
    ================================================== */}

                        <FilterSelect
                            label="Aging Basis"
                            value={viewFilters.aging_basis}
                            options={viewFilterOptions.aging_basis}
                            onChange={(value) =>
                                setViewFilters((prev) => ({
                                    ...prev,
                                    aging_basis: value,
                                }))
                            }
                        />

                        {/* ==================================================
        AS ON DATE

        Put DateFilter after Aging Basis so the order can
        be adjusted independently from the API.
    ================================================== */}

                        <DateFilter
                            value={viewFilters.as_on_date}
                            onChange={(value) => {
                                // View All date selection immediately refreshes its server data.
                                setViewFilters((prev) => ({
                                    ...prev,
                                    as_on_date: value,
                                }));
                                setAppliedViewFilters((prev) => ({
                                    ...prev,
                                    as_on_date: value,
                                }));
                                setPage(1);
                                setOpenFilter(null);
                            }}
                        />

                        {/* ==================================================
        APPLY
    ================================================== */}

                        <button
                            type="button"
                            onClick={handleApplyViewFilters}
                            style={{
                                height: 34,
                                minWidth: 70,
                                padding: "0 18px",
                                border: "none",
                                borderRadius: 8,
                                background: "#5b5bea",
                                color: "#ffffff",
                                fontSize: 11,
                                fontWeight: 800,
                                cursor: "pointer",
                                boxSizing: "border-box",
                                whiteSpace: "nowrap",
                                boxShadow:
                                    "0 3px 8px rgba(91, 91, 234, 0.18)",
                            }}
                        >
                            Apply
                        </button>

                        {/* ==================================================
        RESET
    ================================================== */}

                        <button
                            type="button"
                            onClick={handleResetViewFilters}
                            style={{
                                height: 34,
                                minWidth: 66,
                                padding: "0 16px",
                                border: "1px solid #d4dbe7",
                                borderRadius: 8,
                                background: "#ffffff",
                                color: "#334155",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                boxSizing: "border-box",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Reset
                        </button>

                    </div>

                    {/* ======================================================
              SUMMARY CARDS
          ====================================================== */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1.05fr repeat(4, 1fr)",
                            gap: 9,
                            marginBottom: 14,
                        }}
                    >
                        <div
                            style={{
                                background: "#f0f5ff",
                                border: "1px solid #dbeafe",
                                borderRadius: 10,
                                minHeight: 78,
                                padding: "12px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: "50%",
                                    background: "#edf4ff",
                                    color: "#1464e8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 19,
                                }}
                            >
                                ▤
                            </div>

                            <div>
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 800,
                                        color: "#142b6f",
                                    }}
                                >
                                    {serverTotalRecords.toLocaleString()}
                                </div>

                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "#64748b",
                                        marginTop: 1,
                                    }}
                                >
                                    records
                                </div>
                            </div>
                        </div>

                        <SummaryCard
                            icon="▣"
                            title={
                                hasBackendSummary
                                    ? "Total Payables"
                                    : "Total Payables (Page)"
                            }
                            value={totalPayables}
                            iconBackground="#dcfce7"
                            iconColor="#16a34a"
                            titleColor="#15803d"
                            cardBackground="#f0fdf4"
                        />

                        <SummaryCard
                            icon="▤"
                            title={
                                hasBackendSummary
                                    ? "Current"
                                    : "Current (Page)"
                            }
                            value={currentPayables}
                            iconBackground="#dcfce7"
                            iconColor="#16a34a"
                            titleColor="#15803d"
                            cardBackground="#f0fdf4"
                        />

                        <SummaryCard
                            icon="⌛"
                            title={
                                hasBackendSummary
                                    ? "Overdue"
                                    : "Overdue (Page)"
                            }
                            value={overduePayables}
                            iconBackground="#ffedd5"
                            iconColor="#ea580c"
                            titleColor="#c2410c"
                            cardBackground="#fff7ed"
                        />

                        <SummaryCard
                            icon="!"
                            title={
                                hasBackendSummary
                                    ? "Overdue > 90 Days"
                                    : "Overdue > 90 Days (Page)"
                            }
                            value={overdue90}
                            iconBackground="#fce7f3"
                            iconColor="#db2777"
                            titleColor="#be185d"
                            cardBackground="#fdf2f8"
                        />
                    </div>

                    {/* ======================================================
              ALL PAYABLES CARD
          ====================================================== */}

                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e3e9f2",
                            borderRadius: 9,
                            overflow: "hidden",
                            boxShadow:
                                "0 2px 8px rgba(15, 23, 42, 0.025)",
                        }}
                    >
                        {/* CARD HEADER */}

                        <div
                            style={{
                                padding: "12px 13px 9px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-end",
                                    gap: 10,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            marginTop: 5,
                                            fontSize: 10,
                                            color: "#64748b",
                                        }}
                                    >
                                        Aging basis:{" "}
                                        <strong
                                            style={{
                                                color: "#334b8e",
                                            }}
                                        >
                                            {agingBasis}
                                        </strong>

                                        <span
                                            style={{
                                                margin: "0 8px",
                                                color: "#a0aec0",
                                            }}
                                        >
                                            |
                                        </span>

                                        Snapshot:{" "}
                                        <strong
                                            style={{
                                                color: "#334b8e",
                                            }}
                                        >
                                            {formatDate(snapshotDate)}
                                        </strong>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    {/* SEARCH */}

                                    <div
                                        style={{
                                            position: "relative",
                                        }}
                                    >
                                        <span
                                            style={{
                                                position: "absolute",
                                                left: 10,
                                                top: "50%",
                                                transform:
                                                    "translateY(-50%)",
                                                color: "#52658d",
                                                fontSize: 14,
                                            }}
                                        >
                                            ⌕
                                        </span>

                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => {
                                                setSearch(
                                                    e.target.value
                                                );
                                                setPage(1);
                                            }}
                                            placeholder="Search supplier"
                                            style={{
                                                width: 245,
                                                height: 34,
                                                border:
                                                    "1px solid #d6dfec",
                                                borderRadius: 5,
                                                padding:
                                                    "0 10px 0 29px",
                                                outline: "none",
                                                fontSize: 10,
                                                color: "#334155",
                                                boxSizing:
                                                    "border-box",
                                            }}
                                        />
                                    </div>

                                    {/* ROWS */}

                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(
                                                Number(e.target.value)
                                            );
                                            setPage(1);
                                        }}
                                        style={{
                                            width: 110,
                                            height: 34,
                                            border:
                                                "1px solid #d6dfec",
                                            borderRadius: 5,
                                            padding: "0 9px",
                                            color: "#334b8e",
                                            background: "#ffffff",
                                            fontSize: 10,
                                            fontWeight: 700,
                                            outline: "none",
                                        }}
                                    >
                                        <option value={10}>
                                            10 rows
                                        </option>
                                        <option value={20}>
                                            20 rows
                                        </option>
                                        <option value={50}>
                                            50 rows
                                        </option>
                                        <option value={100}>
                                            100 rows
                                        </option>
                                    </select>

                                    {/* PAGINATION TOP */}

                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.max(1, p - 1)
                                            )
                                        }
                                        style={{
                                            border: "none",
                                            background:
                                                "transparent",
                                            color:
                                                page <= 1
                                                    ? "#cbd5e1"
                                                    : "#3048a5",
                                            fontSize: 21,
                                            cursor:
                                                page <= 1
                                                    ? "not-allowed"
                                                    : "pointer",
                                            padding: 0,
                                        }}
                                    >
                                        ‹
                                    </button>

                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: "#3048a5",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {serverTotalRecords === 0
                                            ? 0
                                            : (page - 1) *
                                            pageSize +
                                            1}{" "}
                                        –{" "}
                                        {Math.min(
                                            page * pageSize,
                                            serverTotalRecords
                                        )}{" "}
                                        of{" "}
                                        {serverTotalRecords.toLocaleString()}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            page >= totalPages
                                        }
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(
                                                    totalPages,
                                                    p + 1
                                                )
                                            )
                                        }
                                        style={{
                                            border: "none",
                                            background:
                                                "transparent",
                                            color:
                                                page >= totalPages
                                                    ? "#cbd5e1"
                                                    : "#3048a5",
                                            fontSize: 21,
                                            cursor:
                                                page >= totalPages
                                                    ? "not-allowed"
                                                    : "pointer",
                                            padding: 0,
                                        }}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* TABLE */}

                        <div
                            style={{
                                width: "100%",
                                overflowX: "auto",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    minWidth: viewTableMinWidth,
                                    borderCollapse: "separate",
                                    borderSpacing: 0,
                                    tableLayout: "fixed",
                                    fontSize: 10,
                                }}
                            >
                                <colgroup>
                                    {viewColumns.map((column) => (
                                        <col
                                            key={`col-${column.key}`}
                                            style={{
                                                width:
                                                    viewColumnWidths[column.key] ||
                                                    100,
                                            }}
                                        />
                                    ))}
                                </colgroup>
                                <thead>
                                    <tr>
                                        {viewColumns.map(
                                            (column) => {
                                                const isText =
                                                    column.text;

                                                return (
                                                    <th
                                                        key={column.key}
                                                        onClick={() =>
                                                            column.sortable &&
                                                            changeSort(
                                                                column.key
                                                            )
                                                        }
                                                        style={{
                                                            position:
                                                                "sticky",
                                                            top: 0,
                                                            zIndex: 2,
                                                            background:
                                                                "#edf4ff",
                                                            color:
                                                                "#24479d",
                                                            fontWeight: 800,
                                                            padding:
                                                                "9px 8px",
                                                            borderBottom:
                                                                "1px solid #d7e1ef",
                                                            lineHeight: 1.25,
                                                            minHeight: 34,

                                                            textAlign:
                                                                isText
                                                                    ? "left"
                                                                    : "right",
                                                            whiteSpace:
                                                                "nowrap",
                                                            overflow: "visible",
                                                            cursor:
                                                                column.sortable
                                                                    ? "pointer"
                                                                    : "default",
                                                            width:
                                                                viewColumnWidths[column.key] ||
                                                                100,
                                                            maxWidth:
                                                                viewColumnWidths[column.key] ||
                                                                100,
                                                            overflow:
                                                                "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                        }}
                                                    >
                                                        {column.label}

                                                        {column.sortable &&
                                                            sortKey ===
                                                            column.key && (
                                                                <span
                                                                    style={{
                                                                        marginLeft: 4,
                                                                        fontSize: 8,
                                                                    }}
                                                                >
                                                                    {sortDirection ===
                                                                        "asc"
                                                                        ? "▲"
                                                                        : "▼"}
                                                                </span>
                                                            )}
                                                    </th>
                                                );
                                            }
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {pageRows.map(
                                        (row, rowIndex) => (
                                            <tr
                                                key={
                                                    row.id ||
                                                    row.supplier_code ||
                                                    rowIndex
                                                }
                                                style={{
                                                    background:
                                                        rowIndex % 2 === 0
                                                            ? "#f9fbff"
                                                            : "#ffffff",
                                                }}
                                            >
                                                {viewColumns.map(
                                                    (column) => {
                                                        const isText =
                                                            column.text;

                                                        let value;

                                                        if (
                                                            column.key ===
                                                            "row_currency"
                                                        ) {
                                                            // View All currency must follow the currently
                                                            // applied View All Reporting Currency filter.
                                                            // Only fall back to the row/main currency when
                                                            // no View All currency is available.
                                                            value =
                                                                appliedViewFilters?.reporting_currency ||
                                                                row.row_currency ||
                                                                row.source_currency ||
                                                                row.reporting_currency ||
                                                                row.currency ||
                                                                currency ||
                                                                "AED";
                                                        } else {
                                                            value =
                                                                row[
                                                                column.key
                                                                ];
                                                        }

                                                        if (
                                                            column.key ===
                                                            "supplier_name"
                                                        ) {
                                                            value =
                                                                value ||
                                                                row.supplier ||
                                                                "-";
                                                        }

                                                        if (
                                                            amountColumns.includes(
                                                                column.key
                                                            )
                                                        ) {
                                                            const numericValue =
                                                                Number(
                                                                    value || 0
                                                                );

                                                            return (
                                                                <td
                                                                    key={
                                                                        column.key
                                                                    }
                                                                    style={{
                                                                        padding:
                                                                            "7px 6px",
                                                                        width:
                                                                            viewColumnWidths[column.key] ||
                                                                            100,
                                                                        maxWidth:
                                                                            viewColumnWidths[column.key] ||
                                                                            100,
                                                                        borderBottom:
                                                                            "1px solid #edf1f6",
                                                                        color:
                                                                            numericValue <
                                                                                0
                                                                                ? "#c62828"
                                                                                : "#334b8e",
                                                                        textAlign:
                                                                            "right",
                                                                        whiteSpace:
                                                                            "nowrap",
                                                                        fontWeight:
                                                                            column.key ===
                                                                                "total_payable"
                                                                                ? 700
                                                                                : 500,
                                                                    }}
                                                                >
                                                                    {formatTableAmount(
                                                                        numericValue
                                                                    )}
                                                                </td>
                                                            );
                                                        }

                                                        return (
                                                            <td
                                                                key={
                                                                    column.key
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "7px 6px",
                                                                    width:
                                                                        viewColumnWidths[column.key] ||
                                                                        100,
                                                                    maxWidth:
                                                                        viewColumnWidths[column.key] ||
                                                                        100,
                                                                    borderBottom:
                                                                        "1px solid #edf1f6",
                                                                    color:
                                                                        "#334b8e",
                                                                    textAlign:
                                                                        isText
                                                                            ? "left"
                                                                            : "center",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                    overflow:
                                                                        "hidden",
                                                                    textOverflow:
                                                                        "ellipsis",
                                                                    fontWeight:
                                                                        column.key ===
                                                                            "supplier_name"
                                                                            ? 600
                                                                            : 500,
                                                                }}
                                                                title={
                                                                    value || ""
                                                                }
                                                            >
                                                                {column.key === "row_currency"
                                                                    ? (value || "-")
                                                                    : cleanCurrency(value || "-")}
                                                            </td>
                                                        );
                                                    }
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* NO DATA */}

                        {
                            pageRows.length === 0 && (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: 45,
                                        color: "#64748b",
                                        fontSize: 12,
                                    }}
                                >
                                    No suppliers found.
                                </div>
                            )
                        }

                        {/* FOOTER */}

                        <div
                            style={{
                                minHeight: 55,
                                padding: "10px 13px",
                                borderTop:
                                    "1px solid #e5eaf2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "space-between",
                                gap: 15,
                                boxSizing: "border-box",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 10,
                                    color: "#5b6d99",
                                }}
                            >
                                Values shown in selected
                                reporting currency

                                <span
                                    style={{
                                        margin: "0 8px",
                                        color: "#b0bacb",
                                    }}
                                >
                                    |
                                </span>

                                Source: Oracle Fusion Cloud
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    color: "#3048a5",
                                    fontSize: 11,
                                    fontWeight: 600,
                                }}
                            >
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.max(1, p - 1)
                                        )
                                    }
                                    style={{
                                        border: "none",
                                        background:
                                            "transparent",
                                        color:
                                            page <= 1
                                                ? "#cbd5e1"
                                                : "#3048a5",
                                        fontSize: 20,
                                        cursor:
                                            page <= 1
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                >
                                    ‹
                                </button>

                                <span>
                                    {serverTotalRecords === 0
                                        ? 0
                                        : (page - 1) * pageSize + 1}
                                    {" – "}
                                    {Math.min(page * pageSize, serverTotalRecords)}
                                    {" of "}
                                    {serverTotalRecords.toLocaleString()}
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        page >= totalPages
                                    }
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(
                                                totalPages,
                                                p + 1
                                            )
                                        )
                                    }
                                    style={{
                                        border: "none",
                                        background:
                                            "transparent",
                                        color:
                                            page >= totalPages
                                                ? "#cbd5e1"
                                                : "#3048a5",
                                        fontSize: 20,
                                        cursor:
                                            page >= totalPages
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}





