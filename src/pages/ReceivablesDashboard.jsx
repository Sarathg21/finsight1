
import React, { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
    getReceivablesFilterOptions,
    getReceivablesDashboard,
    getReceivablesMonthOnMonth,
    getReceivablesViewAll,
    exportReceivablesExcel,
    exportReceivablesPDF,
} from "../api/recevablesApi";

// Compatibility helpers for the existing dashboard code.
const getReceivableFilters = getReceivablesFilterOptions;
const getReceivableDashboard = getReceivablesDashboard;
const getReceivableMonthOnMonth = getReceivablesMonthOnMonth;
const getReceivableDetails = getReceivablesViewAll;
const getReceivableExport = async (filters = {}, format = "xlsx") => {
    if (String(format).toLowerCase() === "pdf") {
        return exportReceivablesPDF(filters);
    }
    return exportReceivablesExcel(filters);
};

/* ------------------------------------------------------------
   EXPORT DOWNLOAD HELPER
   Supports Axios responses, Blob responses and fetch-style data.
   ------------------------------------------------------------ */
const triggerReceivablesBlobDownload = (response, fallbackName) => {
    const source = response?.data ?? response;
    const blob =
        source instanceof Blob
            ? source
            : new Blob([source], {
                type: response?.headers?.["content-type"] || "application/octet-stream",
            });

    const disposition =
        response?.headers?.["content-disposition"] ||
        response?.headers?.["Content-Disposition"] ||
        "";

    const match = disposition.match(/filename\*?=(?:UTF-8''|\")?([^;\"]+)/i);
    const filename = match?.[1]?.trim() || fallbackName;

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
};

/* ============================================================
   RECEIVABLES DASHBOARD
   ------------------------------------------------------------
   Receivables-specific filters:
   - Legal Group
   - Legal Entity
   - Parent Division
   - Sub-Division
   - Reporting Currency
   - As-On Date
   - Aging Basis

   No Business Unit filter.
   ============================================================ */


const RECEIVABLE_AGING_BUCKETS = [
    "Current",
    "0–30 Days",
    "31–60 Days",
    "61–90 Days",
    "91–120 Days",
    "121–180 Days",
    "181–365 Days",
    "Above 365 Days",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const defaultReceivableFilters = {
    legal_group: [],
    legal_entities: [],
    parent_divisions: [],
    sub_divisions: [],
    reporting_currency: "AED",
    as_on_date: "",
    aging_basis: "Due Date",
    year: new Date().getFullYear(),
};

const currencyConfig = {
    AED: { code: "AED", locale: "en-AE" },
    INR: { code: "INR", locale: "en-IN" },
    OMR: { code: "OMR", locale: "en-OM" },
    QAR: { code: "QAR", locale: "en-QA" },
    SAR: { code: "SAR", locale: "en-SA" },
    USD: { code: "USD", locale: "en-US" },
    EUR: { code: "EUR", locale: "en-IE" },
};
const apiAgingBasis = (value) =>
    String(value || "").toUpperCase().includes("INVOICE") ? "INVOICE_DATE" : "DUE_DATE";

const uiAgingBasis = (value) =>
    apiAgingBasis(value) === "INVOICE_DATE" ? "Invoice Date" : "Due Date";

const normalizeOptions = (items = []) =>
    (Array.isArray(items) ? items : []).map((item) => {
        if (item === null || item === undefined) return null;
        if (typeof item !== "object") {
            return { value: String(item), label: String(item), meta: item };
        }
        const value = item.value ?? item.id ?? item.code ?? item.key ?? item.name;
        const label = item.label ?? item.name ?? item.title ?? item.description ?? value;
        return { value: String(value ?? ""), label: String(label ?? ""), meta: item };
    }).filter(Boolean);

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

const normalizeDashboard = (raw = {}, filters = {}) => {
    const payload = raw?.data && !Array.isArray(raw.data) ? raw.data : raw || {};
    const k = payload.kpis || {};
    const aging = Array.isArray(payload.aging_summary) ? payload.aging_summary : [];
    const trend = Array.isArray(payload.trend) ? payload.trend : [];
    const parent = Array.isArray(payload.by_parent_division) ? payload.by_parent_division : [];
    const customers = Array.isArray(payload.top_customers) ? payload.top_customers : [];
    const subdivision = Array.isArray(payload.by_subdivision) ? payload.by_subdivision : [];
    const mom = payload.month_on_month || payload.monthOnMonth || {};

    const mapAmount = (row) => ({
        bucket: row.bucket_name ?? row.bucket ?? "",
        amount: Number(row.amount ?? 0),
        percentage: Number(row.percentage_of_total ?? row.percentage ?? 0),
        bucket_code: row.bucket_code,
    });

    return {
        kpis: {
            total_receivables: k.total_receivables,
            current_receivables: k.current_receivables,
            overdue_receivables: k.overdue_receivables,
            overdue_gt_90: k.overdue_above_90,
            dso: k.dso_days,
            total_receivables_variance: k.total_change_percentage,
            current_receivables_variance: k.current_change_percentage,
            overdue_receivables_variance: k.overdue_change_percentage,
            overdue_gt_90_variance: k.overdue_above_90_change_percentage,
            dso_variance: k.dso_change_days,
            previous_date: k.previous_date ?? k.previous_as_on_date ?? null,
        },

        agingSummary: aging.map(mapAmount),
        trend: trend.map((row) => {
            const d = row.as_on_date ? new Date(`${row.as_on_date}T00:00:00`) : null;
            const month = d && !Number.isNaN(d.getTime())
                ? d.toLocaleString("en-US", { month: "short", year: "numeric" })
                : row.as_on_date;
            return {
                ...row,
                month,
                total_receivables: row.total_receivables,
                dso: row.dso_days,
            };
        }),
        parentDivision: parent.map((row) => ({
            name: row.label,
            value: row.value,
            amount: row.total_receivables,
            percentage: row.percentage_of_total,
        })),
        topSuppliers: customers.map((row, index) => ({
            rank: index + 1,
            supplier_name: row.customer_name,
            supplier_code: row.customer_code,
            customer_id: row.customer_id,
            receivable_amount: row.total_receivables,
            percentage: row.percentage_of_total,
            country: row.customer_country,
        })),
        overdueSummary: aging
            .filter((row) => row.bucket_code !== "CURRENT")
            .map(mapAmount),
        subDivision: subdivision.map((row) => ({
            name: row.label,
            value: row.value,
            amount: row.total_receivables,
            percentage: row.percentage_of_total,
        })),
        monthOnMonth: (mom.rows || []).map((row) => {
            const values = row.monthly_values || {};
            const mapped = {};
            MONTHS.forEach((month) => {
                mapped[month] = values[month.toUpperCase()] ?? null;
            });
            return {
                legal_entity: row.legal_entity_name,
                legal_entity_id: row.legal_entity_id,
                parent_division: row.parent_division_name,
                parent_division_id: row.parent_division_id,
                sub_division: row.subdivision_name,
                subdivision_id: row.subdivision_id,
                ...mapped,
                latest: row.latest,
                _snapshot_dates: mom.snapshot_dates || {},
            };
        }),
        snapshotDates: mom.snapshot_dates || {},
        viewAll: [],
        filterOptions: raw?.filterOptions || {},
    };
};

const normalizeViewAllRows = (rows = []) =>
    (Array.isArray(rows) ? rows : []).map((row) => ({
        id: row.receivables_fact_id,
        receivables_fact_id: row.receivables_fact_id,
        supplier_name: row.customer_name,
        supplier_code: row.customer_code,
        legal_entity: row.legal_entity_name,
        parent_division: row.parent_division_name,
        sub_division: row.subdivision_name,
        country: row.customer_country,
        row_currency: row.reporting_currency || row.source_currency,
        total_receivable: row.total_receivables,
        current: row.current_receivables,
        "0_30": row.amount_0_30,
        "31_60": row.amount_31_60,
        "61_90": row.amount_61_90,
        "91_120": row.amount_91_120,
        "121_180": row.amount_121_180,
        "181_365": row.amount_181_365,
        above_365: row.amount_above_365,
        overdue_receivables: row.overdue_receivables,
        customer_id: row.customer_id,
        legal_entity_id: row.legal_entity_id,
        parent_division_id: row.parent_division_id,
        subdivision_id: row.subdivision_id,
        gl_code: row.gl_code,
    }));

const formatReceivablesCompact = (value, currency = "AED") => {
    if (value === null || value === undefined) return "—";
    const config = currencyConfig[currency] || currencyConfig.AED;
    const number = Number(value);
    if (Math.abs(number) >= 1000000) return `${config.code} ${(number / 1000000).toFixed(2)}M`;
    if (Math.abs(number) >= 1000) return `${config.code} ${(number / 1000).toFixed(2)}K`;
    return `${config.code} ${number.toFixed(2)}`;
};

const formatMoMValue = (value, displayUnit = "AED") => {
    if (value === null || value === undefined || value === "") return "—";
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";

    if (displayUnit === "Millions") {
        return `${(number / 1000000).toFixed(2)}M`;
    }

    return new Intl.NumberFormat("en-AE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};
const formatPercentage = (value) => value === null || value === undefined ? "—" : `${Number(value).toFixed(1)}%`;
const formatVariance = (value) => value === null || value === undefined ? "—" : `${Number(value) >= 0 ? "▲" : "▼"} ${Math.abs(Number(value)).toFixed(1)}%`;
const formatAxisMillions = (value) => value === null || value === undefined ? "—" : `${(Number(value) / 1000000).toFixed(0)}M`;

// Capitalize dashboard table labels consistently without changing underlying API values.
const capitalizeTableText = (value) => {
    if (value === null || value === undefined) return value;
    const text = String(value).trim();
    if (!text) return text;
    return text
        .toLowerCase()
        .replace(/\b([a-z])([a-z0-9]*)/g, (_, first, rest) => first.toUpperCase() + rest);
};

const BLUE = "#132a78";
const BLUE_2 = "#1d4ed8";
const BORDER = "#e3e8f2";
const TEXT = "#172554";
const MUTED = "#64748b";
const BG = "#f7f9fd";

const cardStyle = {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
};


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
        "Receivables Aging Summary": "Outstanding receivables grouped by aging bucket",
        "Receivables Trend": "Historical movement of total receivables and DSO",
        "Receivables by Parent Division": "Receivable exposure across parent divisions",
        "Top 10 Customers by Receivables": "Customers contributing the highest receivable balances",
        "Overdue Summary": "Distribution of overdue receivable exposure",
        "Receivables by Sub-Division": "Receivable exposure across sub-divisions",
        "Month-on-Month Receivables": "Monthly receivable balance movement",
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
    rightContent = null,
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
            style={{
                position: "absolute",
                top: 9,
                right: 9,
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                gap: 7,
            }}
        >
            {rightContent}

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

    /* ----------------------------------------------------------
       NORMALIZE SELECTED VALUES
    ---------------------------------------------------------- */
    const selectedValues = multiple
        ? Array.isArray(value)
            ? value
            : value !== undefined && value !== null && value !== ""
                ? [value]
                : []
        : [];

    /* ----------------------------------------------------------
       CLOSE WHEN CLICKING OUTSIDE
    ---------------------------------------------------------- */
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

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    /* ----------------------------------------------------------
       NORMALIZE OPTIONS
       KEEP "All" INSIDE DROPDOWN
    ---------------------------------------------------------- */
    const normalizedOptions = Array.from(
        new Set(
            (options || [])
                .filter(
                    (option) =>
                        option !== null &&
                        option !== undefined &&
                        String(option).trim() !== ""
                )
                .map((option) => String(option))
        )
    );

    /*
       Always keep "All" as the first dropdown option.
       If backend options already contain All, remove duplicate.
    */
    const finalOptions = normalizedOptions.filter(
        (option) => option !== "All"
    );

    /* ----------------------------------------------------------
       SEARCH
    ---------------------------------------------------------- */
    const filteredOptions = finalOptions.filter((option) =>
        option.toLowerCase().includes(search.toLowerCase())
    );

    /* ----------------------------------------------------------
       SELECT ALL
    ---------------------------------------------------------- */
    const handleSelectAll = () => {
        if (!multiple) return;

        onChange(
            finalOptions.filter((option) => option !== "All")
        );
    };

    /* ----------------------------------------------------------
       CLEAR
    ---------------------------------------------------------- */
    const handleClear = () => {
        if (!multiple) {
            onChange("");
        } else {
            onChange([]);
        }
    };

    /* ----------------------------------------------------------
       INDIVIDUAL OPTION
    ---------------------------------------------------------- */
    const handleOptionClick = (option) => {
        /* SINGLE SELECT */
        if (!multiple) {
            if (option === "All") {
                onChange("");
            } else {
                onChange(option);
            }

            setOpen(false);
            setSearch("");
            return;
        }

        /* MULTI SELECT */
        if (option === "All") {
            onChange([]);
            return;
        }

        let nextValues = selectedValues.filter(
            (item) => String(item) !== "All"
        );

        if (nextValues.includes(option)) {
            nextValues = nextValues.filter(
                (item) => item !== option
            );
        } else {
            nextValues = [...nextValues, option];
        }

        onChange(nextValues);
    };

    /* ----------------------------------------------------------
       DISPLAY VALUE
       DEFAULT = ALL
    ---------------------------------------------------------- */
    const getDisplayValue = () => {
        if (!multiple) {
            return value !== undefined &&
                value !== null &&
                String(value) !== ""
                ? String(value)
                : "All";
        }

        if (selectedValues.length === 0) {
            return "All";
        }

        if (selectedValues.length === 1) {
            return String(selectedValues[0]);
        }

        return `${selectedValues.length} selected`;
    };

    /* ----------------------------------------------------------
       ALL SELECTED
    ---------------------------------------------------------- */
    const selectableOptions = finalOptions.filter(
        (option) => option !== "All"
    );

    const allSelected =
        multiple &&
        selectableOptions.length > 0 &&
        selectableOptions.every((item) =>
            selectedValues.includes(item)
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
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#173b8f",
                    marginBottom: 5,
                    lineHeight: "12px",
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
                    height: 34,
                    boxSizing: "border-box",
                    border: open
                        ? "1px solid #5b5bea"
                        : "1px solid #dce3ee",
                    borderRadius: 9,
                    padding: "0 30px 0 11px",
                    background: "#f4f7fb",
                    color: "#24366b",
                    fontSize: 11,
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
                        color: "#52638a",
                        transition: "transform 0.15s ease",
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
                            borderBottom: "1px solid #edf1f7",
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
                                    border: "1px solid #dce3ee",
                                    borderRadius: 7,
                                    padding: "0 9px 0 28px",
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
                                justifyContent: "space-between",
                                padding: "7px 9px",
                                borderBottom:
                                    "1px solid #edf1f7",
                                background: "#fafbfe",
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleSelectAll}
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
                            filteredOptions.map((option) => {
                                const selected = multiple
                                    ? option === "All"
                                        ? selectedValues.length === 0
                                        : selectedValues.includes(option)
                                    : option === "All"
                                        ? !value
                                        : String(value || "") === option;

                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() =>
                                            handleOptionClick(option)
                                        }
                                        style={{
                                            width: "100%",
                                            minHeight: 31,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "5px 10px",
                                            border: "none",
                                            background: selected
                                                ? "#eef2ff"
                                                : "#ffffff",
                                            color: selected
                                                ? "#243b8f"
                                                : "#334155",
                                            fontSize: 10.5,
                                            fontWeight: selected
                                                ? 700
                                                : 500,
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        {multiple && (
                                            <span
                                                style={{
                                                    width: 14,
                                                    height: 14,
                                                    minWidth: 14,
                                                    borderRadius: 3,
                                                    border: selected
                                                        ? "1px solid #5b5bea"
                                                        : "1px solid #cbd5e1",
                                                    background: selected
                                                        ? "#5b5bea"
                                                        : "#ffffff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "center",
                                                    color: "#ffffff",
                                                    fontSize: 9,
                                                    fontWeight: 800,
                                                    boxSizing:
                                                        "border-box",
                                                }}
                                            >
                                                {selected ? "✓" : ""}
                                            </span>
                                        )}

                                        <span
                                            style={{
                                                overflow: "hidden",
                                                textOverflow:
                                                    "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {option}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


/* ================================================================
   DATE FILTER
   Initial display = All
   All remains available inside dropdown
   ================================================================ */
function DateFilter({
    value,
    onChange,
}) {
    const dateInputRef = useRef(null);

    const openCalendar = () => {
        if (dateInputRef.current) {
            if (
                typeof dateInputRef.current.showPicker === "function"
            ) {
                dateInputRef.current.showPicker();
            } else {
                dateInputRef.current.click();
            }
        }
    };

    const handleDateChange = (event) => {
        const selectedDate = event.target.value;

        if (!selectedDate) return;

        // Immediately send YYYY-MM-DD to parent
        onChange(selectedDate);
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
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#173b8f",
                    marginBottom: 5,
                    lineHeight: "12px",
                    whiteSpace: "nowrap",
                }}
            >
                As On Date
            </label>

            {/* Hidden native calendar */}
            <input
                ref={dateInputRef}
                type="date"
                value={value || ""}
                onChange={handleDateChange}
                style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: "none",
                }}
            />

            {/* Visible field */}
            <button
                type="button"
                onClick={openCalendar}
                style={{
                    width: "100%",
                    height: 34,
                    boxSizing: "border-box",
                    border: "1px solid #dce3ee",
                    borderRadius: 9,
                    padding: "0 38px 0 11px",
                    background: "#f4f7fb",
                    color: "#24366b",
                    fontSize: 11,
                    fontWeight: 600,
                    outline: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                }}
            >
                {value || "Select Date"}

                <span
                    style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 15,
                        pointerEvents: "none",
                    }}
                >
                    📅
                </span>
            </button>
        </div>
    );
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
        const from = 0;

        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(from + (target - from) * eased);
            if (progress < 1) frameId = requestAnimationFrame(animate);
        };

        setDisplayValue(0);
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [target, duration]);

    return <>{formatter(displayValue)}</>;
}

/* ============================================================
   KPI CARD
   ============================================================ */

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

        // DSO
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
     * The Receivables aging API can return negative percentages.
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
                            {formatReceivablesCompact(
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
                                    {formatReceivablesCompact(
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
                                            ? 8
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
            Number(item.total_receivables || 0)
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
                                    item.total_receivables
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

                                        {/* Total Receivables */}
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
                                                Receivables
                                            </span>

                                            <strong
                                                style={{
                                                    color: BLUE,
                                                }}
                                            >
                                                {formatReceivablesCompact(
                                                    item.total_receivables,
                                                    currency
                                                )}
                                            </strong>
                                        </div>

                                        {/* DSO */}
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
                                                DSO
                                            </span>

                                            <strong
                                                style={{
                                                    color: "#0e9f75",
                                                }}
                                            >
                                                {Number(
                                                    item.dso ||
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
                                            item.total_receivables
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
                    DSO LINE
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

                                const minDso =
                                    Math.min(
                                        ...data.map(
                                            (d) =>
                                                Number(
                                                    d.dso
                                                )
                                        )
                                    );

                                const maxDso =
                                    Math.max(
                                        ...data.map(
                                            (d) =>
                                                Number(
                                                    d.dso
                                                )
                                        )
                                    );

                                const range =
                                    Math.max(
                                        maxDso -
                                        minDso,
                                        1
                                    );

                                const y =
                                    105 -
                                    ((Number(
                                        item.dso
                                    ) -
                                        minDso) /
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
                        DSO POINTS
                    ================================================= */}
                    {data.map((item, index) => {
                        const x =
                            data.length === 1
                                ? 300
                                : (index /
                                    (data.length -
                                        1)) *
                                600;

                        const minDso =
                            Math.min(
                                ...data.map((d) =>
                                    Number(d.dso)
                                )
                            );

                        const maxDso =
                            Math.max(
                                ...data.map((d) =>
                                    Number(d.dso)
                                )
                            );

                        const range = Math.max(
                            maxDso - minDso,
                            1
                        );

                        const y =
                            105 -
                            ((Number(item.dso) -
                                minDso) /
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
                    Total Receivables
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
                    DSO (Days)
                </span>
            </div>
        </div>
    );
}
/* ============================================================
   HORIZONTAL BAR CHART
   ============================================================ */

function ParentDivisionChart({ data, currency, onItemClick }) {
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
                item?.total_receivables ??
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
        const formatted = formatReceivablesCompact(
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
                                onItemClick?.(item)
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

                                cursor: onItemClick
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

                            {/* Tooltip Receivables */}
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
                                    Receivables
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

    // Pagination is opt-in so other tables are not affected
    pageSize = null,

    // When true, the LAST row is kept fixed as the Total row
    keepFirstRow = false,

    // Optional numbered pagination; disabled by default so other tables
    // keep their existing pagination behavior.
    showPageNumbers = false,

    // Optional compact pagination matching the dashboard screenshot.
    paginationStyle = "default",

    // Optional cell-level click handler; disabled by default so existing
    // tables keep their current behavior.
    onCellClick = null,
}) {
    const [currentPage, setCurrentPage] = useState(1);

    /*
     * If keepFirstRow is true:
     * - Last row is always displayed as the Total row
     * - Remaining rows are paginated
     *
     * If false:
     * - Existing behavior remains unchanged
     */
    const fixedTotalRow =
        keepFirstRow && rows.length > 0
            ? rows[rows.length - 1]
            : null;

    const paginatedRows =
        keepFirstRow && rows.length > 0
            ? rows.slice(0, -1)
            : rows;

    // Enable pagination only when pageSize is provided
    const paginationEnabled =
        pageSize !== null &&
        Number(pageSize) > 0 &&
        paginatedRows.length > Number(pageSize);

    const totalPages = paginationEnabled
        ? Math.ceil(
            paginatedRows.length / Number(pageSize)
        )
        : 1;

    // Keep current page valid if rows change
    useEffect(() => {
        setCurrentPage(1);
    }, [rows]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }

        if (currentPage < 1) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    const pageNumbers = useMemo(() => {
        if (!showPageNumbers || totalPages <= 1) return [];
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        const pages = [1];
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        if (start > 2) pages.push("ellipsis-left");
        for (let page = start; page <= end; page += 1) pages.push(page);
        if (end < totalPages - 1) pages.push("ellipsis-right");
        pages.push(totalPages);

        return pages;
    }, [showPageNumbers, totalPages, currentPage]);

    const startIndex = paginationEnabled
        ? (currentPage - 1) * Number(pageSize)
        : 0;

    const displayedRows = paginationEnabled
        ? paginatedRows.slice(
            startIndex,
            startIndex + Number(pageSize)
        )
        : paginatedRows;

    // Check whether a value is negative
    const isNegativeValue = (value) => {
        if (value === null || value === undefined) {
            return false;
        }

        if (typeof value === "number") {
            return value < 0;
        }

        if (typeof value === "string") {
            const cleaned = value
                .replace(/,/g, "")
                .replace(/\s/g, "");

            // Handles:
            // -123
            // -123.45
            // -5%
            // AED -123.45
            // -AED 123.45
            return /^-/.test(cleaned) || /-\d/.test(cleaned);
        }

        return false;
    };

    // Render one table row
    const renderRow = (
        row,
        rowIndex,
        isFixedRow = false
    ) => {
        return (
            <tr
                key={
                    row.id ||
                    (isFixedRow
                        ? "fixed-total-row"
                        : `${startIndex}-${rowIndex}`)
                }
            >
                {columns.map((column) => {
                    const value = column.render
                        ? column.render(row)
                        : row[column.key];

                    return (
                        <td
                            key={column.key}
                            onClick={() => {
                                if (typeof onCellClick === "function") {
                                    onCellClick(row, column, value);
                                }
                            }}
                            style={{
                                cursor:
                                    typeof onCellClick === "function"
                                        ? "pointer"
                                        : "default",
                                padding: rowGap
                                    ? "13px 4px"
                                    : compactRows
                                        ? "3px 4px"
                                        : "6px 4px",

                                lineHeight: rowGap
                                    ? "17px"
                                    : compactRows
                                        ? "14px"
                                        : "normal",

                                borderBottom:
                                    "1px solid #edf1f6",

                                color: isNegativeValue(value)
                                    ? "#dc2626"
                                    : "#334155",

                                fontWeight: 700,

                                textAlign:
                                    column.align || "left",

                                width: column.width || undefined,

                                whiteSpace:
                                    column.key === "rank"
                                        ? "nowrap"
                                        : fitColumns
                                            ? "normal"
                                            : "nowrap",

                                overflow:
                                    column.key === "rank"
                                        ? "visible"
                                        : fitColumns
                                            ? "hidden"
                                            : "visible",

                                textOverflow:
                                    column.key === "rank"
                                        ? "clip"
                                        : fitColumns
                                            ? "ellipsis"
                                            : "clip",

                                // Slight emphasis for fixed Total row
                                ...(isFixedRow
                                    ? {
                                        fontWeight: 900,
                                        background: "#f8fafc",
                                        color:
                                            column.key === "name"
                                                ? "#172554"
                                                : "#1E293B",
                                    }
                                    : {}),
                            }}
                        >
                            {(() => {
                                if (
                                    typeof value ===
                                    "string"
                                ) {
                                    return value
                                        .replace(
                                            /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
                                            ""
                                        )
                                        .replace(
                                            /^#\s*/,
                                            ""
                                        );
                                }

                                return value;
                            })()}
                        </td>
                    );
                })}
            </tr>
        );
    };

    return (
        <div
            style={{
                width: "100%",
                overflowX: fitColumns
                    ? "hidden"
                    : "auto",
                border: "1px solid #e5eaf2",
                borderRadius: 5,
            }}
        >
            <table
                style={{
                    width: "100%",
                    minWidth: fitColumns
                        ? 0
                        : compact
                            ? 520
                            : 650,
                    tableLayout: fitColumns
                        ? "fixed"
                        : "auto",
                    borderCollapse: "collapse",
                    fontSize: 10,
                }}
            >
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                style={{
                                    background:
                                        "#eef4ff",
                                    color: BLUE,
                                    fontWeight: 700,
                                    padding: compactRows
                                        ? "5px 4px"
                                        : "7px 4px",
                                    borderBottom:
                                        "1px solid #dce5f4",
                                    textAlign:
                                        column.align ||
                                        "left",
                                    width: column.width || undefined,
                                    whiteSpace: fitColumns
                                        ? "normal"
                                        : "nowrap",
                                }}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {/* PAGINATED SUB-DIVISION ROWS */}
                    {displayedRows.map(
                        (row, rowIndex) =>
                            renderRow(
                                row,
                                rowIndex,
                                false
                            )
                    )}

                    {/* FIXED TOTAL ROW AT BOTTOM */}
                    {fixedTotalRow &&
                        renderRow(
                            fixedTotalRow,
                            0,
                            true
                        )}
                </tbody>
            </table>

            {/* Pagination AFTER Total row */}
            {paginationEnabled && paginationStyle === "compact" && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        padding: "9px 8px",
                        borderTop: "1px solid #edf1f6",
                        background: "#ffffff",
                    }}
                >
                    <span
                        style={{
                            fontSize: 9.5,
                            color: "#64748b",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Showing {startIndex + 1}–{Math.min(startIndex + Number(pageSize), paginatedRows.length)} of {paginatedRows.length}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {[
                            { label: "‹‹", action: () => setCurrentPage(1), disabled: currentPage === 1 },
                            { label: "‹", action: () => setCurrentPage((p) => Math.max(1, p - 1)), disabled: currentPage === 1 },
                            { label: String(currentPage), active: true, action: () => { }, disabled: false },
                            { label: "›", action: () => setCurrentPage((p) => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages },
                            { label: "››", action: () => setCurrentPage(totalPages), disabled: currentPage === totalPages },
                        ].map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={item.action}
                                disabled={item.disabled}
                                style={{
                                    width: 28,
                                    height: 25,
                                    padding: 0,
                                    border: "1px solid #dbe3ef",
                                    borderRadius: 5,
                                    background: item.active ? "#172f80" : item.disabled ? "#f8fafc" : "#ffffff",
                                    color: item.active ? "#ffffff" : item.disabled ? "#cbd5e1" : "#27438b",
                                    fontSize: item.label.length > 1 ? 12 : 14,
                                    fontWeight: 800,
                                    cursor: item.disabled ? "not-allowed" : "pointer",
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {paginationEnabled && paginationStyle !== "compact" && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 8px",
                        borderTop:
                            "1px solid #edf1f6",
                        background: "#ffffff",
                    }}
                >
                    {/* First */}
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentPage(1)
                        }
                        disabled={currentPage === 1}
                        style={{
                            padding: "4px 8px",
                            border:
                                "1px solid #dbe3ef",
                            borderRadius: 5,
                            background:
                                currentPage === 1
                                    ? "#f1f5f9"
                                    : "#ffffff",
                            color:
                                currentPage === 1
                                    ? "#94a3b8"
                                    : "#27438b",
                            fontSize: 10,
                            fontWeight: 700,
                            cursor:
                                currentPage === 1
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        &lt;&lt; First
                    </button>

                    {/* Previous */}
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.max(
                                    1,
                                    prev - 1
                                )
                            )
                        }
                        disabled={currentPage === 1}
                        style={{
                            padding: "4px 9px",
                            border:
                                "1px solid #dbe3ef",
                            borderRadius: 5,
                            background:
                                currentPage === 1
                                    ? "#f1f5f9"
                                    : "#ffffff",
                            color:
                                currentPage === 1
                                    ? "#94a3b8"
                                    : "#27438b",
                            fontSize: 10,
                            fontWeight: 700,
                            cursor:
                                currentPage === 1
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        Previous
                    </button>

                    {showPageNumbers ? (
                        pageNumbers.map((pageNumber) =>
                            typeof pageNumber === "string" ? (
                                <span
                                    key={pageNumber}
                                    style={{
                                        minWidth: 20,
                                        textAlign: "center",
                                        fontSize: 10,
                                        color: "#94a3b8",
                                        fontWeight: 700,
                                    }}
                                >
                                    …
                                </span>
                            ) : (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNumber)}
                                    style={{
                                        minWidth: 27,
                                        height: 25,
                                        padding: "0 6px",
                                        border: pageNumber === currentPage
                                            ? "1px solid #5b5bea"
                                            : "1px solid #dbe3ef",
                                        borderRadius: 5,
                                        background: pageNumber === currentPage
                                            ? "#5b5bea"
                                            : "#ffffff",
                                        color: pageNumber === currentPage
                                            ? "#ffffff"
                                            : "#27438b",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                    }}
                                >
                                    {pageNumber}
                                </button>
                            )
                        )
                    ) : (
                        <span
                            style={{
                                minWidth: 45,
                                textAlign: "center",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#64748b",
                            }}
                        >
                            {currentPage} / {totalPages}
                        </span>
                    )}

                    {/* Next */}
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(
                                    totalPages,
                                    prev + 1
                                )
                            )
                        }
                        disabled={
                            currentPage === totalPages
                        }
                        style={{
                            padding: "4px 9px",
                            border:
                                "1px solid #dbe3ef",
                            borderRadius: 5,
                            background:
                                currentPage ===
                                    totalPages
                                    ? "#f1f5f9"
                                    : "#ffffff",
                            color:
                                currentPage ===
                                    totalPages
                                    ? "#94a3b8"
                                    : "#27438b",
                            fontSize: 10,
                            fontWeight: 700,
                            cursor:
                                currentPage ===
                                    totalPages
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        Next
                    </button>

                    {/* Last */}
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentPage(totalPages)
                        }
                        disabled={
                            currentPage === totalPages
                        }
                        style={{
                            padding: "4px 8px",
                            border:
                                "1px solid #dbe3ef",
                            borderRadius: 5,
                            background:
                                currentPage ===
                                    totalPages
                                    ? "#f1f5f9"
                                    : "#ffffff",
                            color:
                                currentPage ===
                                    totalPages
                                    ? "#94a3b8"
                                    : "#27438b",
                            fontSize: 10,
                            fontWeight: 700,
                            cursor:
                                currentPage ===
                                    totalPages
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        Last &gt;&gt;
                    </button>
                </div>
            )}
        </div>
    );
}
/* ============================================================
   RECEIVABLES-STYLE PAGE SKELETON FOR RECEIVABLES
   ============================================================ */
function ReceivablesPageSkeleton() {
    return (
        <div className="receivables-page-skeleton" aria-hidden="true">
            <div className="receivables-skeleton-kpis">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div className="receivables-skeleton-card" key={index}>
                        <div className="receivables-skeleton-icon" />
                        <div className="receivables-skeleton-copy">
                            <div className="receivables-skeleton-line short" />
                            <div className="receivables-skeleton-line value" />
                            <div className="receivables-skeleton-line tiny" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="receivables-skeleton-grid three">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div className="receivables-skeleton-panel" key={index}>
                        <div className="receivables-skeleton-line title" />
                        <div className="receivables-skeleton-chart" />
                    </div>
                ))}
            </div>
            <div className="receivables-skeleton-grid three">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div className="receivables-skeleton-panel compact" key={index}>
                        <div className="receivables-skeleton-line title" />
                        <div className="receivables-skeleton-table-line" />
                        <div className="receivables-skeleton-table-line" />
                        <div className="receivables-skeleton-table-line" />
                        <div className="receivables-skeleton-table-line" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function ReceivablesDashboard() {
    const [filters, setFilters] = useState({ ...defaultReceivableFilters });
    const [appliedFilters, setAppliedFilters] = useState({ ...defaultReceivableFilters });
    const [filterOptions, setFilterOptions] = useState({
        legal_groups: [], legal_entities: [], parent_divisions: [], sub_divisions: [],
        reporting_currencies: [], as_on_dates: [], aging_bases: [], years: [],
    });
    const [dashboardResponse, setDashboardResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(true);
    const [showViewAll, setShowViewAll] = useState(false);
    const [viewAllContext, setViewAllContext] = useState({});

    const buildApiFilters = (source = appliedFilters) => {
        const ids = (values, options) => (Array.isArray(values) ? values : values ? [values] : [])
            .map((label) => options.find((o) => String(o.label) === String(label) || String(o.value) === String(label))?.value ?? label)
            .filter((value) => value !== "All" && value !== "");

        return {
            legal_group_id: ids(source.legal_group, filterOptions.legal_groups),
            legal_entity_id: ids(source.legal_entities, filterOptions.legal_entities),
            parent_division_id: ids(source.parent_divisions, filterOptions.parent_divisions),
            subdivision_id: ids(source.sub_divisions, filterOptions.sub_divisions),
            aging_basis: apiAgingBasis(source.aging_basis),
            as_on_date: source.as_on_date || undefined,
            reporting_currency: source.reporting_currency || "AED",
            year: source.year,
        };
    };

    const data = useMemo(() => normalizeDashboard(dashboardResponse || {}, appliedFilters), [dashboardResponse, appliedFilters]);
    const kpis = data.kpis;
    const currency = appliedFilters.reporting_currency || "AED";
    const [momDisplayUnit, setMomDisplayUnit] = useState("AED");
    const baseApiFilters = useMemo(() => buildApiFilters(), [appliedFilters, filterOptions]);

    const mainLegalEntities = cascadeLegalEntities(filterOptions.legal_entities, filters.legal_group);
    const mainParentDivisions = cascadeParentDivisions(
        filterOptions.parent_divisions,
        filters.legal_entities,
        filters.legal_group
    );
    const mainSubDivisions = cascadeSubDivisions(
        filterOptions.sub_divisions,
        filters.parent_divisions,
        filters.legal_entities,
        filters.legal_group
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const response = await getReceivableFilters();
                const raw = response?.data ?? response ?? {};
                const normalized = {
                    legal_groups: normalizeOptions(raw.legal_groups),
                    legal_entities: normalizeOptions(raw.legal_entities),
                    parent_divisions: normalizeOptions(raw.parent_divisions),
                    sub_divisions: normalizeOptions(raw.subdivisions || raw.sub_divisions),
                    reporting_currencies: normalizeOptions(raw.reporting_currencies),
                    as_on_dates: raw.as_on_dates || [],
                    aging_bases: normalizeOptions(raw.aging_bases),
                    years: Array.from(new Set((raw.as_on_dates || []).map((d) => Number(String(d).slice(0, 4))).filter(Boolean))),
                };
                const latestDate = normalized.as_on_dates[normalized.as_on_dates.length - 1] || "";
                const currencyOption = normalized.reporting_currencies.find((x) => x.value === "AED" || x.label === "AED");
                const dueOption = normalized.aging_bases.find((x) => x.value === "DUE_DATE" || String(x.label).toLowerCase().includes("due"));
                if (!cancelled) {
                    setFilterOptions(normalized);
                    setFilters((prev) => ({
                        ...prev,
                        as_on_date: latestDate,
                        reporting_currency: currencyOption?.value || "AED",
                        aging_basis: dueOption?.label || "Due Date",
                        year: Number(latestDate?.slice(0, 4)) || new Date().getFullYear(),
                    }));
                    setAppliedFilters((prev) => ({
                        ...prev,
                        as_on_date: latestDate,
                        reporting_currency: currencyOption?.value || "AED",
                        aging_basis: dueOption?.label || "Due Date",
                        year: Number(latestDate?.slice(0, 4)) || new Date().getFullYear(),
                    }));
                }
            } catch (error) {
                console.error("Receivables filter options failed", error);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const [dashboardResponseValue, momResponse] = await Promise.all([
                    getReceivableDashboard(baseApiFilters),
                    getReceivableMonthOnMonth(baseApiFilters),
                ]);

                if (cancelled) return;

                // Dashboard endsoint provides the main sections.
                // Month-on-Month is a separate endsoint, so merge it into
                // the same normalized shape expected by the existing UI.
                const dashboardPayload =
                    dashboardResponseValue?.data &&
                        !Array.isArray(dashboardResponseValue.data)
                        ? dashboardResponseValue.data
                        : dashboardResponseValue?.data ?? dashboardResponseValue ?? {};

                const momPayload =
                    momResponse?.data?.data ??
                    momResponse?.data ??
                    momResponse ??
                    {};

                const normalizedMom =
                    momPayload?.month_on_month ??
                    momPayload?.monthOnMonth ??
                    momPayload;

                setDashboardResponse({
                    ...dashboardResponseValue,
                    data: {
                        ...dashboardPayload,
                        month_on_month: normalizedMom || {},
                    },
                });
            } catch (error) {
                console.error("Receivables dashboard / month-on-month failed", error);
                if (!cancelled) setDashboardResponse(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [baseApiFilters, appliedFilters, filterOptions]);

    const setFilter = (key, value) => setFilters((previous) => ({ ...previous, [key]: value }));

    const handleApply = () => setAppliedFilters({ ...filters, aging_basis: uiAgingBasis(filters.aging_basis) });

    const handleReset = () => {
        const reset = { ...defaultReceivableFilters, as_on_date: filterOptions.as_on_dates?.[filterOptions.as_on_dates.length - 1] || "" };
        setFilters(reset);
        setAppliedFilters(reset);
    };

    const handleExport = async (format, extra = {}) => {
        try {
            const apiFilters = {
                ...buildApiFilters(),
                ...extra,
            };

            const response =
                String(format).toLowerCase() === "pdf"
                    ? await exportReceivablesPDF(apiFilters)
                    : await exportReceivablesExcel(apiFilters);

            triggerReceivablesBlobDownload(
                response,
                String(format).toLowerCase() === "pdf"
                    ? "Receivables_Report.pdf"
                    : "Receivables_Report.xlsx"
            );
        } catch (error) {
            console.error("Receivables export failed", error);
        }
    };

    const openReceivablesViewAll = (extra = {}) => {
        setViewAllContext(extra || {});
        setShowViewAll(true);
    };

    /*
     * Drill-down helpers
     * ------------------------------------------------------------
     * Aggregate "View All" continues to open the unfiltered
     * view-all. Chart/table/KPI interactions add only the backend
     * drill-down parameter required for that specific record.
     *
     * All current page filters are still supplied by ReceivablesViewAll
     * through baseFilters/appliedViewFilters.
     */
    const openAgingDrilldown = (item) => {
        const bucket = item?.bucket_code;
        if (bucket) openReceivablesViewAll({ aging_bucket: bucket, component: "Aging Summary" });
    };

    const openTrendDrilldown = (point) => {
        if (point?.as_on_date) {
            openReceivablesViewAll({ as_on_date: point.as_on_date, component: "Monthly Trend" });
        }
    };

    const openParentDivisionDrilldown = (item) => {
        const value = item?.value;
        if (value !== undefined && value !== null && value !== "") {
            openReceivablesViewAll({ parent_division_id: value, component: "Parent Division" });
        }
    };

    const openCustomerDrilldown = (row) => {
        const customerId = row?.customer_id;
        if (customerId !== undefined && customerId !== null && customerId !== "") {
            openReceivablesViewAll({ customer_id: customerId, component: "Top 10 Customers" });
        }
    };

    const openOverdueDrilldown = () => {
        openReceivablesViewAll({ balance_status: "OVERDUE" });
    };

    const openOverdueAbove90Drilldown = () => {
        openReceivablesViewAll({ balance_status: "OVERDUE_ABOVE_90", component: "Overdue > 90 Days" });
    };

    const openSubdivisionDrilldown = (row) => {
        const subdivisionId = row?.value;
        if (
            subdivisionId !== undefined &&
            subdivisionId !== null &&
            subdivisionId !== ""
        ) {
            openReceivablesViewAll({ subdivision_id: subdivisionId, component: "Sub-Division" });
        }
    };

    const openMomDrilldown = (row, column) => {
        const month = column?.key;
        if (!month || !MONTHS.includes(month)) return;

        const snapshotDates = row?._snapshot_dates || data?.snapshotDates || {};
        const snapshotDate = snapshotDates[String(month).toUpperCase()];

        if (!snapshotDate) return;

        openReceivablesViewAll({
            legal_entity_id: row?.legal_entity_id,
            parent_division_id: row?.parent_division_id,
            subdivision_id: row?.subdivision_id,
            as_on_date: snapshotDate,
            component: "Month-on-Month Receivables",
        });
    };

    const supplierRows = data.topSuppliers;

    const subDivisionTableRows = useMemo(
        () => [
            ...data.subDivision,
            {
                id: "subdivision-total",
                name: "Total",
                amount: data.subDivision.reduce(
                    (sum, item) => sum + Number(item.amount || 0),
                    0
                ),
                percentage: 100,
            },
        ],
        [data.subDivision]
    );

    const supplierColumns = [
        {
            key: "rank",
            label: "#",
            align: "center",
            width: "8%",
        },
        {
            key: "supplier_name",
            label: "Customer Name",
            width: "47%",
            render: (row) => capitalizeTableText(row.supplier_name),
        },
        {
            key: "receivable_amount",
            label: `Receivables (${currency})`,
            align: "right",
            width: "24%",
            render: (row) =>
                formatReceivablesCompact(row.receivable_amount, currency),
        },
        {
            key: "percentage",
            label: "% of Total",
            align: "right",
            width: "21%",
            render: (row) => formatPercentage(row.percentage),
        },
    ];

    const subDivisionColumns = [
        {
            key: "name",
            label: "Sub-Division",
            width: "50%",
            render: (row) => row.id === "subdivision-total" ? "Total:" : capitalizeTableText(row.name),
        },
        {
            key: "amount",
            label: `Receivables (${currency})`,
            align: "right",
            width: "28%",
            render: (row) =>
                formatReceivablesCompact(row.amount, currency),
        },
        {
            key: "percentage",
            label: "% of Total",
            align: "right",
            width: "22%",
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
            render: (row) => formatMoMValue(row[month], momDisplayUnit),
        })),
        {
            key: "latest",
            label: "Latest",
            align: "right",
            render: (row) => formatMoMValue(row.latest, momDisplayUnit),
        },
    ];

    return (
        <div
            className="receivables-sales-ui"
            style={{
                minHeight: "100vh",
                background: BG,
                fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: TEXT,
            }}
        >
            <style>{`
        .receivables-sales-ui {
          --sales-navy: #0f172a;
          --sales-slate: #64748b;
          --sales-blue: #4f46e5;
          --sales-border: rgba(0,0,0,0.04);
          --sales-bg: #f8fafc;
          --sales-surface: #ffffff;
          --sales-border-strong: #e2e8f0;
        }
        .receivables-sales-ui, .receivables-sales-ui * { box-sizing: border-box; }
        .receivables-sales-ui {
          background: var(--sales-bg) !important;
          color: var(--sales-navy);
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }
        .receivables-sales-ui main {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
          color: var(--sales-navy);
          animation: fadeInUp 0.35s ease forwards;
        }
        .receivables-sales-ui h1 {
          color: var(--sales-navy) !important;
          font-size: 1.45rem !important;
          font-weight: 800 !important;
          line-height: 1.15 !important;
          letter-spacing: -0.02em !important;
        }
        .receivables-sales-ui .sales-style-subtitle {
          color: var(--sales-slate) !important;
          font-size: 0.78rem !important;
          line-height: 1.45 !important;
        }
        .receivables-sales-ui .sales-style-filter-bar {
          padding: 10px 14px !important;
          margin-top: 0 !important;
          margin-bottom: 16px !important;
          gap: 6px !important;
          border: 1px solid var(--sales-border) !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.03) !important;
          background: #fff !important;
        }
        .receivables-sales-ui .sales-style-filter-bar {
          display: grid !important;
          grid-template-columns: repeat(7, minmax(0, 1fr)) auto auto !important;
          align-items: end !important;
          gap: 8px !important;
          width: 100% !important;
        }
        .receivables-sales-ui .sales-style-filter-bar > div {
          min-width: 0 !important;
          width: 100% !important;
          max-width: none !important;
        }
        .receivables-sales-ui .sales-style-filter-bar > button {
          width: auto !important;
          min-width: 72px !important;
        }
        .receivables-sales-ui .sales-style-filter-bar label {
          color: #1e3a8a !important;
          font-size: 0.66rem !important;
          font-weight: 700 !important;
          line-height: 1.2 !important;
          margin-bottom: 4px !important;
        }
        .receivables-sales-ui .sales-style-filter-bar input,
        .receivables-sales-ui .sales-style-filter-bar select,
        .receivables-sales-ui .sales-style-filter-bar > div > button {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }
        .receivables-sales-ui .sales-style-filter-bar > div > button {
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
        .receivables-sales-ui .sales-style-filter-bar > div > button:hover {
          border-color: #c7d2fe !important;
          background: #f8fafc !important;
        }
        .receivables-sales-ui .sales-style-filter-bar input,
        .receivables-sales-ui .sales-style-filter-bar select {
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
        .receivables-sales-ui .sales-style-filter-bar input[type="date"] {
          width: 100% !important;
          min-width: 0 !important;
          padding-left: 26px !important;
          padding-right: 6px !important;
        }
        .receivables-sales-ui .sales-style-filter-bar input:focus,
        .receivables-sales-ui .sales-style-filter-bar select:focus,
        .receivables-sales-ui .sales-style-filter-bar > div > button:focus-visible {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,.10) !important;
          outline: none !important;
        }
        .receivables-sales-ui .sales-style-filter-bar button {
          transition: all 0.15s ease !important;
        }
        .receivables-sales-ui .sales-style-filter-bar button#btn-apply-filter {
          background: #4f46e5 !important;
          color: #fff !important;
          border: 1px solid #4f46e5 !important;
          border-radius: 7px !important;
          font-size: 0.70rem !important;
          font-weight: 700 !important;
          box-shadow: none !important;
        }
        .receivables-sales-ui .sales-style-filter-bar button#btn-apply-filter:hover {
          background: #4338ca !important;
          border-color: #4338ca !important;
          transform: translateY(-1px);
        }
        .receivables-sales-ui .sales-style-filter-bar button#btn-reset-filter {
          background: #fff !important;
          color: #64748b !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 7px !important;
          font-size: 0.70rem !important;
          font-weight: 600 !important;
          box-shadow: none !important;
        }
        .receivables-sales-ui .sales-style-filter-bar button#btn-reset-filter:hover {
          background: #f8fafc !important;
          color: #334155 !important;
          border-color: #cbd5e1 !important;
        }
        .receivables-sales-ui .receivables-row-2 {
         align-items: stretch !important;
          grid-auto-rows: auto !important;
        }
        .receivables-sales-ui .receivables-row-2 > section {
          height: 100% !important;
          min-height: 0 !important;
          align-self: stretch !important;
        }
        .receivables-sales-ui .receivables-row-2 > section > :last-child {
          min-height: 0 !important;
        }
        .receivables-sales-ui .receivables-kpi-grid {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
          gap: 10px !important;
          margin-top: 0 !important;
          margin-bottom: 16px !important;
        }
        .receivables-sales-ui .sales-style-kpi {
          border: none !important;
          border-radius: 12px !important;
          padding: 10px !important;
          min-height: 74px !important;
          box-shadow: none !important;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1) !important;
        }
        .receivables-sales-ui .sales-style-kpi:hover {
          box-shadow: 0 8px 24px rgba(37,99,235,0.10) !important;
          transform: translateY(-2px) !important;
        }
        .receivables-sales-ui section {
          background: #fff !important;
          border: 1px solid rgba(0,0,0,0.04) !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 24px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.03) !important;
          transition: box-shadow 0.2s cubic-bezier(0.4,0,0.2,1) !important;
        }
        .receivables-sales-ui section:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
        }
        .receivables-sales-ui table th {
          padding: 10px 16px !important;
          font-size: 0.74rem !important;
          font-weight: 700 !important;
          color: #1e3a8a !important;
          background: #f8fafc !important;
          border-bottom: 2px solid #e2e8f0 !important;
          white-space: nowrap;
        }
        .receivables-sales-ui table td {
          padding: 8px 16px !important;
          font-size: 0.74rem !important;
          color: #334155 !important;
          border-bottom-color: #f1f5f9 !important;
        }
        .receivables-sales-ui table tbody tr { transition: background 0.12s ease !important; }
        .receivables-sales-ui table tbody tr:hover td { background: #f8fafc !important; }
        .receivables-sales-ui .receivables-page-skeleton { display: block; width: 100%; margin-top: 4px; }
        .receivables-sales-ui .receivables-skeleton-kpis,
        .receivables-sales-ui .receivables-skeleton-grid { display: grid; gap: 10px; width: 100%; margin-bottom: 10px; }
        .receivables-sales-ui .receivables-skeleton-kpis { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
        .receivables-sales-ui .receivables-skeleton-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .receivables-sales-ui .receivables-skeleton-card,
        .receivables-sales-ui .receivables-skeleton-panel {
          background: #fff; border: 1px solid rgba(0,0,0,0.04); border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.03);
        }
        .receivables-sales-ui .receivables-skeleton-card { min-height: 74px; padding: 10px; display: flex; align-items: center; gap: 8px; }
        .receivables-sales-ui .receivables-skeleton-panel { min-height: 280px; padding: 14px 16px; }
        .receivables-sales-ui .receivables-skeleton-panel.compact { min-height: 250px; }
        .receivables-sales-ui .receivables-skeleton-icon { width: 32px; height: 32px; border-radius: 50%; flex: 0 0 32px; background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        .receivables-sales-ui .receivables-skeleton-copy { flex: 1; min-width: 0; }
        .receivables-sales-ui .receivables-skeleton-line,
        .receivables-sales-ui .receivables-skeleton-chart,
        .receivables-sales-ui .receivables-skeleton-table-line { background: linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        .receivables-sales-ui .receivables-skeleton-line { height: 9px; border-radius: 5px; }
        .receivables-sales-ui .receivables-skeleton-line.short { width: 55%; margin-bottom: 8px; }
        .receivables-sales-ui .receivables-skeleton-line.value { width: 78%; height: 15px; margin-bottom: 7px; }
        .receivables-sales-ui .receivables-skeleton-line.tiny { width: 42%; height: 7px; }
        .receivables-sales-ui .receivables-skeleton-line.title { width: 42%; margin-bottom: 18px; }
        .receivables-sales-ui .receivables-skeleton-chart { width: 100%; height: 205px; border-radius: 9px; }
        .receivables-sales-ui .receivables-skeleton-table-line { width: 100%; height: 10px; border-radius: 5px; margin: 14px 0; }
        .receivables-sales-ui .receivables-action-menu button { border-radius: 6px; }
        .receivables-sales-ui .receivables-action-menu > button:hover { background: #f1f5f9 !important; }
        .receivables-sales-ui .receivables-action-menu > div {
          animation: scaleUp 0.14s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .receivables-sales-ui .sales-style-view-all-modal {
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
          animation: receivablesViewAllModalIn 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards !important;
        }
        .receivables-sales-ui .sales-style-view-all-modal input,
        .receivables-sales-ui .sales-style-view-all-modal select {
          border-radius: 8px !important; font-size: 0.74rem !important;
          border-color: #e2e8f0 !important; color: #334155 !important;
          background: #fff !important;
        }
        .receivables-sales-ui button { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        @keyframes receivablesViewAllModalIn {
          from { transform: translateX(-50%) scale(0.97); opacity: 0; }
          to { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .receivables-sales-ui .receivables-sales-main { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .receivables-sales-ui .sales-style-filter-bar { min-height: 58px; }
        .receivables-sales-ui .sales-style-filter-bar > div { min-width: 88px; }
        .receivables-sales-ui .sales-style-view-all-modal { overflow-y: auto !important; overflow-x: hidden !important; }
        .receivables-sales-ui .sales-style-view-all-modal > div:not([aria-hidden]) { box-sizing: border-box; }
        .receivables-sales-ui .sales-style-view-all-modal table th { position: sticky; top: 0; z-index: 3; }
        .receivables-sales-ui .sales-style-view-all-modal button:hover { transform: translateY(-1px); }
        .receivables-sales-ui .sales-style-view-all-modal input:focus,
        .receivables-sales-ui .sales-style-view-all-modal select:focus { border-color: #818cf8 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.10) !important; outline: none; }

        @media (max-width: 1200px) { .receivables-sales-ui .receivables-skeleton-grid.three { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 800px) {
          .receivables-sales-ui .receivables-skeleton-grid.three { grid-template-columns: 1fr; }
          .receivables-sales-ui .sales-style-filter-bar { align-items: stretch !important; }
          .receivables-sales-ui .sales-style-filter-bar > div { flex: 1 1 120px !important; }
        }
      `}</style>
            {/* ======================================================
          PAGE CONTENT
          ====================================================== */}

            <main
                className="receivables-sales-main animate-in"
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
                                lineHeight: 1.1,
                                fontWeight: 800,
                                letterSpacing: "-0.02em",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <span style={{ fontSize: "1.3rem" }}>💰</span> Receivables Dashboard
                        </h1>

                        <div
                            className="sales-style-subtitle"
                            style={{
                                marginTop: 3,
                                color: "#64748b",
                                fontSize: "0.78rem",
                            }}
                        >
                            Track receivables, aging, overdue exposure and payment performance
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
                                height: 34,
                                minWidth: 80,
                                padding: "0 13px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                border: "1px solid #86efac",
                                borderRadius: 8,
                                background: "#f7fffa",
                                color: "#16a34a",
                                fontSize: 11,
                                fontWeight: 800,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#ecfdf5";
                                e.currentTarget.style.borderColor = "#4ade80";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#f7fffa";
                                e.currentTarget.style.borderColor = "#86efac";
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
                                height: 34,
                                minWidth: 72,
                                padding: "0 13px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                border: "1px solid #fda4af",
                                borderRadius: 8,
                                background: "#fff8f8",
                                color: "#ef4444",
                                fontSize: 11,
                                fontWeight: 800,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#fff1f2";
                                e.currentTarget.style.borderColor = "#fb7185";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#fff8f8";
                                e.currentTarget.style.borderColor = "#fda4af";
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
                        border: "1px solid #edf1f7",
                        borderRadius: 12,
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 10,
                        boxShadow: "0 2px 8px rgba(30, 55, 90, 0.04)",
                        overflow: "visible",
                    }}
                >
                    <FilterSelect
                        label="Legal Group"
                        value={filters.legal_group}
                        options={filterOptions.legal_groups.map((x) => x.label)}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                legal_group: value,
                                legal_entities: [],
                                parent_divisions: [],
                                sub_divisions: [],
                            }))
                        }
                    />

                    <FilterSelect
                        label="Legal Entity"
                        value={filters.legal_entities}
                        options={mainLegalEntities.map((x) => x.label)}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                legal_entities: value,
                                parent_divisions: [],
                                sub_divisions: [],
                            }))
                        }
                    />

                    <FilterSelect
                        label="Parent Division"
                        value={filters.parent_divisions}
                        options={mainParentDivisions.map((x) => x.label)}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                parent_divisions: value,
                                sub_divisions: [],
                            }))
                        }
                    />

                    <FilterSelect
                        label="Sub-Division"
                        value={filters.sub_divisions}
                        options={mainSubDivisions.map((x) => x.label)}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                sub_divisions: value,
                            }))
                        }
                    />

                    <FilterSelect
                        label="Reporting Currency"
                        value={filters.reporting_currency}
                        options={filterOptions.reporting_currencies.map((x) => x.label)}
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
                        options={filterOptions.aging_bases.map((x) => x.label)}
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                aging_basis: value,
                            }))
                        }
                    />

                    <DateFilter
                        value={filters.as_on_date}
                        options={filterOptions?.as_on_dates || []}
                        onChange={(value) => {
                            setFilters((prev) => ({
                                ...prev,
                                as_on_date: value,
                            }));

                            // Clear the previous snapshot immediately so stale values
                            // never remain visible while the newly selected date loads.
                            setDashboardResponse(null);

                            // Date selection refreshes every dashboard component immediately.
                            setAppliedFilters((prev) => ({
                                ...prev,
                                as_on_date: value,
                                year: Number(String(value).slice(0, 4)) || prev.year,
                            }));
                        }}
                    />

                    <button
                        type="button"
                        onClick={handleApply}
                        style={{
                            height: 34,
                            minWidth: 76,
                            padding: "0 18px",
                            border: "none",
                            borderRadius: 9,
                            background: "#5b5bea",
                            color: "#ffffff",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 3px 8px rgba(91, 91, 234, 0.20)",
                            flexShrink: 0,
                        }}
                    >
                        Apply
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                            height: 34,
                            minWidth: 66,
                            padding: "0 16px",
                            border: "1px solid #e0e5ee",
                            borderRadius: 9,
                            background: "#ffffff",
                            color: "#52638a",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                    >
                        Reset
                    </button>
                </div>


                {loading ? (
                    <ReceivablesPageSkeleton />
                ) : (
                    <>

                        {/* ==================================================
            KPI CARDS
            ================================================== */}

                        <div
                            style={{
                                marginTop: "20px",
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(5, minmax(0, 1fr))",
                                gap: 9,
                                marginBottom: 12,
                            }}
                        >


                            <KpiCard
                                title="Total Receivables"
                                value={kpis.total_receivables}
                                variance={kpis.total_receivables_variance}
                                previousDate={kpis?.previous_date}
                                currency={currency}
                                icon="▤"
                                iconBg="#dbeafe"
                                iconColor="#2563eb"
                                cardBg="#f0f5ff"

                            />

                            <KpiCard
                                title="Current Receivables"
                                value={kpis.current_receivables}
                                variance={kpis.current_receivables_variance}
                                previousDate={kpis.previous_date}
                                currency={currency}
                                icon="▣"
                                iconBg="#dcfce7"
                                iconColor="#16a34a"
                                cardBg="#f0fdf4"
                            />

                            <KpiCard
                                title="Overdue Receivables"
                                value={kpis.overdue_receivables}
                                variance={kpis.overdue_receivables_variance}
                                previousDate={kpis.previous_date}
                                currency={currency}
                                icon="⌛"
                                iconBg="#ffedd5"
                                iconColor="#ea580c"
                                cardBg="#fff7ed"
                            />

                            <KpiCard
                                title="Overdue > 90 Days"
                                value={kpis.overdue_gt_90}
                                onClick={openOverdueAbove90Drilldown}
                                variance={kpis.overdue_gt_90_variance}
                                previousDate={kpis.previous_date}
                                currency={currency}
                                icon="!"
                                iconBg="#fce7f3"
                                iconColor="#db2777"
                                cardBg="#fdf2f8"
                            />

                            <KpiCard
                                title="DSO – Days Sales Outstanding"
                                value={kpis.dso}
                                variance={kpis.dso_variance}
                                previousDate={kpis.previous_date}
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
                                    onViewAll={() => openReceivablesViewAll({ component: "Aging Summary" })}
                                    onExportExcel={() => handleExport("excel")}
                                    onExportPdf={() => handleExport("pdf")}
                                />
                                <SectionTitle info="Receivables grouped by aging bucket">
                                    Receivables Aging Summary ({currency})
                                </SectionTitle>

                                <div
                                    style={{
                                        width: "100%",
                                        minWidth: 0,
                                        overflow: "hidden",
                                    }}
                                >
                                    {data.agingSummary?.length ? (
                                        <DonutChart
                                            data={data.agingSummary}
                                            total={kpis.total_receivables}
                                            currency={currency}
                                            centerLabel="Total"
                                            onSegmentClick={openAgingDrilldown}
                                        />
                                    ) : <NoDataAvailable minHeight={185} />}
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
                                    onViewAll={() => openReceivablesViewAll({ component: "Monthly Trend" })}
                                    onExportExcel={() => handleExport("excel")}
                                    onExportPdf={() => handleExport("pdf")}
                                />
                                <SectionTitle info="Historical total receivables and DSO">
                                    Receivables Trend ({currency})
                                </SectionTitle>

                                <div
                                    style={{
                                        width: "100%",
                                        minWidth: 0,
                                        overflow: "hidden",
                                    }}
                                >
                                    {data.trend?.length ? (
                                        <TrendChart
                                            data={data.trend}
                                            currency={currency}
                                            onPointClick={openTrendDrilldown}
                                        />
                                    ) : <NoDataAvailable minHeight={185} />}
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
                                    onViewAll={() => openReceivablesViewAll({ component: "Parent Division" })}
                                    onExportExcel={() => handleExport("excel")}
                                    onExportPdf={() => handleExport("pdf")}
                                />
                                <SectionTitle>
                                    Receivables by Parent Division ({currency})
                                </SectionTitle>

                                <div
                                    style={{
                                        width: "100%",
                                        minWidth: 0,
                                        overflow: "hidden",
                                    }}
                                >
                                    {data.parentDivision?.length ? (
                                        <ParentDivisionChart
                                            data={data.parentDivision}
                                            currency={currency}
                                            onItemClick={openParentDivisionDrilldown}
                                        />
                                    ) : <NoDataAvailable minHeight={185} />}
                                </div>
                            </section>
                        </div>

                        {/* ==================================================
            ROW 2
            ================================================== */}

                        <div
                            className="receivables-row-2"
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
                            {/* Top 10 Customers */}

                            <section
                                style={{ ...cardStyle, padding: 12, position: "relative" }}
                            >
                                <SectionActions
                                    onViewAll={() => openReceivablesViewAll({ component: "Top 10 Customers" })}
                                    onExportExcel={() => handleExport("excel")}
                                    onExportPdf={() => handleExport("pdf")}
                                />
                                <SectionTitle>
                                    Top 10 Customers by Receivables ({currency})
                                </SectionTitle>

                                {data.topSuppliers?.length ? (
                                    <DataTable
                                        columns={supplierColumns}
                                        rows={data.topSuppliers}
                                        fitColumns
                                        compactRows
                                        onCellClick={(row) => {
                                            openCustomerDrilldown(row);
                                        }}
                                    />
                                ) : <NoDataAvailable minHeight={185} />}
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "8% 47% 24% 21%",
                                        alignItems: "center",
                                        marginTop: 7,
                                        padding: "0 4px",
                                        fontSize: 12,
                                        fontWeight: 900,
                                    }}
                                >
                                    {/* Rank spacer */}
                                    <span aria-hidden="true" />

                                    {/* Total */}
                                    <span
                                        style={{
                                            textAlign: "left",
                                            color: "#172554",
                                            fontWeight: 900,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Total:
                                    </span>

                                    {/* Amount */}
                                    <span
                                        style={{
                                            textAlign: "right",
                                            color: "#1E293B",
                                            fontWeight: 900,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {formatReceivablesCompact(
                                            supplierRows.reduce(
                                                (sum, item) =>
                                                    sum + Number(item.receivable_amount || 0),
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
                                            color: "#1E293B",
                                            fontWeight: 900,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {formatPercentage(
                                            supplierRows.reduce(
                                                (sum, item) =>
                                                    sum + Number(item.percentage || 0),
                                                0
                                            )
                                        )}
                                    </span>
                                </div>
                            </section>

                            {/* Overdue Summary */}

                            <section
                                style={{ ...cardStyle, padding: 12, position: "relative" }}
                            >
                                <SectionActions
                                    onViewAll={() => openReceivablesViewAll({ balance_status: "OVERDUE", component: "Overdue Summary" })}
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
                                        boxSizing: "border-box",
                                        minHeight: 0,
                                    }}
                                >
                                    {data.overdueSummary?.length ? (
                                        <DonutChart
                                            data={data.overdueSummary}
                                            total={kpis.overdue_receivables}
                                            currency={currency}
                                            centerLabel="Overdue"
                                            legendBelow
                                            largeOverdueChart
                                            onSegmentClick={openAgingDrilldown}
                                        />
                                    ) : <NoDataAvailable minHeight={250} />}
                                </div>
                            </section>

                            {/* Sub Division */}

                            <section
                                style={{ ...cardStyle, padding: 12, position: "relative" }}
                            >
                                <SectionActions
                                    onViewAll={() => openReceivablesViewAll({ component: "Sub-Division" })}
                                    onExportExcel={() => handleExport("excel")}
                                    onExportPdf={() => handleExport("pdf")}
                                />
                                <SectionTitle>
                                    Receivables by Sub-Division ({currency})
                                </SectionTitle>

                                {data.subDivision?.length ? (
                                    <DataTable
                                        columns={subDivisionColumns}
                                        rows={subDivisionTableRows}
                                        pageSize={10}
                                        keepFirstRow={true}
                                        showPageNumbers={true}
                                        paginationStyle="compact"
                                        fitColumns
                                        rowGap
                                        onCellClick={(row, column) => {
                                            if (
                                                row?.id !== "subdivision-total" &&
                                                (column?.key === "name" ||
                                                    column?.key === "amount" ||
                                                    column?.key === "percentage")
                                            ) {
                                                openSubdivisionDrilldown(row);
                                            }
                                        }}
                                    />
                                ) : <NoDataAvailable minHeight={185} />}
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
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 20,
                                    marginBottom: 10,
                                    paddingRight: 42,
                                    boxSizing: "border-box",
                                    minWidth: 0,
                                }}
                            >
                                {/* LEFT */}
                                <SectionTitle info="Monthly receivable balance by legal entity">
                                    Month-on-Month Receivables ({currency})
                                </SectionTitle>

                                {/* RIGHT */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                        flexShrink: 0,
                                    }}
                                >
                                    {/* YEAR */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 7,
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

                                        <select
                                            value={filters.year}
                                            onChange={(e) =>
                                                setFilter(
                                                    "year",
                                                    Number(e.target.value)
                                                )
                                            }
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
                                        >
                                            {filterOptions.years.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* AED / AED MILLIONS */}
                                    <div
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            height: 30,
                                            border: "1px solid #d6deeb",
                                            borderRadius: 6,
                                            background: "#f8fafc",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setMomDisplayUnit("AED")}
                                            style={{
                                                height: "100%",
                                                minWidth: 42,
                                                padding: "0 9px",
                                                border: "none",
                                                borderRight: "1px solid #d6deeb",
                                                background:
                                                    momDisplayUnit === "AED"
                                                        ? "#172f80"
                                                        : "transparent",
                                                color:
                                                    momDisplayUnit === "AED"
                                                        ? "#ffffff"
                                                        : "#64748b",
                                                fontSize: 10,
                                                fontWeight: 800,
                                                cursor: "pointer",
                                            }}
                                        >
                                            AED
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setMomDisplayUnit("Millions")}
                                            style={{
                                                height: "100%",
                                                minWidth: 86,
                                                padding: "0 9px",
                                                border: "none",
                                                background:
                                                    momDisplayUnit === "Millions"
                                                        ? "#172f80"
                                                        : "transparent",
                                                color:
                                                    momDisplayUnit === "Millions"
                                                        ? "#ffffff"
                                                        : "#64748b",
                                                fontSize: 10,
                                                fontWeight: 800,
                                                cursor: "pointer",
                                            }}
                                        >
                                            AED Millions
                                        </button>
                                    </div>

                                    {/* 3 DOTS */}
                                    <SectionActions
                                        onViewAll={() => openReceivablesViewAll({ component: "Month-on-Month Receivables" })}
                                        onExportExcel={() => handleExport("excel")}
                                        onExportPdf={() => handleExport("pdf")}
                                    />
                                </div>
                            </div>

                            {data.monthOnMonth?.length ? (
                                <DataTable
                                    columns={monthColumns}
                                    rows={data.monthOnMonth}
                                    pageSize={8}
                                    paginationStyle="compact"
                                    onCellClick={openMomDrilldown}
                                />
                            ) : <NoDataAvailable minHeight={220} />}
                        </section>

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
                                Last Updated  on: {appliedFilters.as_on_date}
                            </span>
                        </div>
                    </>
                )}
            </main>

            {/* ======================================================
          VIEW ALL MODAL
          ====================================================== */}


            {showViewAll && (
                <ReceivablesViewAll
                    filters={appliedFilters}
                    data={data.viewAll}
                    currency={currency}
                    filterOptions={filterOptions}
                    baseFilters={baseApiFilters}
                    drilldown={viewAllContext}
                    onClose={() => setShowViewAll(false)}
                />
            )}
        </div>
    );
}

/* ============================================================
   VIEW ALL
   ============================================================ */

function ReceivablesViewAll({
    filters,
    data,
    currency,
    filterOptions = {},
    baseFilters = {},
    drilldown = {},
    onClose,
}) {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("total_receivable");
    const [sortDirection, setSortDirection] = useState("desc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Display-only title for the View All modal. This never goes to the API.
    const componentTitle = drilldown?.component || "Receivables";

    /* ============================================================
       VIEW ALL FILTERS
    ============================================================ */

    const getInitialViewFilters = () => ({
        // Carry the exact filters already applied on the main dashboard
        // into View All. This is only the initial UI state; Apply/Reset
        // inside View All continues to use the existing API flow.
        legal_group: Array.isArray(filters?.legal_group)
            ? [...filters.legal_group]
            : filters?.legal_group
                ? [filters.legal_group]
                : [],
        legal_entities: Array.isArray(filters?.legal_entities)
            ? [...filters.legal_entities]
            : filters?.legal_entities
                ? [filters.legal_entities]
                : [],
        parent_divisions: Array.isArray(filters?.parent_divisions)
            ? [...filters.parent_divisions]
            : filters?.parent_divisions
                ? [filters.parent_divisions]
                : [],
        sub_divisions: Array.isArray(filters?.sub_divisions)
            ? [...filters.sub_divisions]
            : filters?.sub_divisions
                ? [filters.sub_divisions]
                : [],
        reporting_currency:
            filters?.reporting_currency || currency || "AED",
        as_on_date:
            filters?.as_on_date ||
            filters?.as_on_dates ||
            filters?.asOfDate ||
            "",
        aging_basis: uiAgingBasis(
            filters?.aging_basis ||
            filters?.agingBasis ||
            "DUE_DATE"
        ),
    });

    const [viewFilters, setViewFilters] = useState(
        getInitialViewFilters
    );

    const [appliedViewFilters, setAppliedViewFilters] =
        useState(getInitialViewFilters);

    const viewAllCurrency =
        appliedViewFilters?.reporting_currency ||
        currency ||
        "AED";


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

    const initialData = Array.isArray(data) ? data : [];

    /* ============================================================
       API FILTER OPTIONS
       ============================================================ */

    const viewFilterOptions = {
        legal_group: (filterOptions.legal_groups || []).map((x) => x.label ?? x),
        legal_entities: (filterOptions.legal_entities || []).map((x) => x.label ?? x),
        parent_divisions: (filterOptions.parent_divisions || []).map((x) => x.label ?? x),
        sub_divisions: (filterOptions.sub_divisions || []).map((x) => x.label ?? x),
        reporting_currencies: (filterOptions.reporting_currencies || []).map((x) => x.label ?? x),
        as_on_dates: filterOptions.as_on_dates || [],
        aging_basis: (filterOptions.aging_bases || []).map((x) => x.label ?? x),
    };

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
        if (!value) return "30 Apr 2024";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
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
            options: viewFilterOptions.legal_group,
        },

        legal_entities: {
            label: "Legal Entity",
            options: viewFilterOptions.legal_entities,
        },

        parent_divisions: {
            label: "Parent Division",
            options: viewFilterOptions.parent_divisions,
        },

        sub_divisions: {
            label: "Sub-Division",
            options: viewFilterOptions.sub_divisions,
        },
    };

    const singleFilterConfig = {
        reporting_currency: {
            label: "Reporting Currency",
            options: viewFilterOptions.reporting_currencies,
        },

        as_on_date: {
            label: "As On Date",
            options: viewFilterOptions.as_on_dates,
        },

        aging_basis: {
            label: "Aging Basis",
            options: viewFilterOptions.aging_basis,
        },
    };

    const handleFilterSearch = (key, value) => {
        setFilterSearch((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const toggleMultiFilterValue = (key, value) => {
        setViewFilters((prev) => {
            const currentValues = Array.isArray(prev[key])
                ? prev[key]
                : [];

            const exists = currentValues.includes(value);

            return {
                ...prev,
                [key]: exists
                    ? currentValues.filter((item) => item !== value)
                    : [...currentValues, value],
            };
        });
    };

    const selectAllFilterValues = (key) => {
        setViewFilters((prev) => ({
            ...prev,
            [key]: [...(multiFilterConfig[key]?.options || [])],
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

        setOpenFilter(null);
    };

    const getMultiFilterDisplayValue = (key) => {
        const selected = Array.isArray(viewFilters[key])
            ? viewFilters[key]
            : [];

        const options = multiFilterConfig[key]?.options || [];

        if (selected.length === 0) {
            return "All";
        }

        if (selected.length === options.length) {
            return "All";
        }

        if (selected.length <= 2) {
            return selected.join(", ");
        }

        return `${selected.length} selected`;
    };

    const getSingleFilterDisplayValue = (key) => {
        const value = viewFilters[key];

        if (!value) {
            return "All";
        }

        return value;
    };

    /* ============================================================
       FILTER DROPDOWN
    ============================================================ */

    const MultiSelectDropdown = ({
        filterKey,
        label,
    }) => {
        const options = multiFilterConfig[filterKey]?.options || [];

        const query = (
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

        return (
            <div
                style={{
                    position: "relative",
                }}
            >
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#173b8f",
                        marginBottom: 5,
                    }}
                >
                    {label}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setOpenFilter((current) =>
                            current === filterKey ? null : filterKey
                        );
                    }}
                    style={{
                        width: "100%",
                        height: 34,
                        border: "1px solid #d9e1ee",
                        borderRadius: 5,
                        background: "#ffffff",
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
                    }}
                >
                    <span
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            paddingRight: 5,
                        }}
                    >
                        {getMultiFilterDisplayValue(filterKey)}
                    </span>

                    <span
                        style={{
                            color: "#173b8f",
                            flexShrink: 0,
                        }}
                    >
                        ⌄
                    </span>
                </button>

                {openFilter === filterKey && (
                    <div
                        style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            width: "100%",
                            minWidth: 230,
                            background: "#ffffff",
                            border: "1px solid #d7dfeb",
                            borderRadius: 6,
                            boxShadow:
                                "0 8px 20px rgba(15, 23, 42, 0.12)",
                            zIndex: 5000,
                            overflow: "hidden",
                        }}
                    >
                        {/* SEARCH */}
                        <div
                            style={{
                                padding: "7px 8px",
                                borderBottom: "1px solid #edf1f6",
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
                                    }}
                                >
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={filterSearch[filterKey] || ""}
                                    onChange={(e) =>
                                        handleFilterSearch(
                                            filterKey,
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search..."
                                    autoFocus
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
                                fontSize: 10,
                                fontWeight: 700,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    selectAllFilterValues(
                                        filterKey
                                    )
                                }
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#24479d",
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
                                maxHeight: 220,
                                overflowY: "auto",
                                padding: "3px 0",
                            }}
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => {
                                    const checked =
                                        selectedValues.includes(
                                            option
                                        );

                                    return (
                                        <label
                                            key={option}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 7,
                                                padding:
                                                    "6px 9px",
                                                cursor: "pointer",
                                                fontSize: 10,
                                                color: "#334155",
                                                lineHeight: 1.2,
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
                                                    width: 12,
                                                    height: 12,
                                                    margin: 0,
                                                    accentColor:
                                                        "#4936e9",
                                                }}
                                            />

                                            <span
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow:
                                                        "ellipsis",
                                                    whiteSpace:
                                                        "nowrap",
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

    const ViewAllDateFilter = ({ filterKey = "as_on_date", label = "As On Date" }) => {
        const dateRef = useRef(null);
        const value = viewFilters[filterKey] || "";

        const openCalendar = () => {
            if (!dateRef.current) return;
            if (typeof dateRef.current.showPicker === "function") dateRef.current.showPicker();
            else dateRef.current.click();
        };

        return (
            <div style={{ position: "relative" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#173b8f", marginBottom: 5 }}>
                    {label}
                </div>
                <input
                    ref={dateRef}
                    type="date"
                    value={value}
                    onChange={(e) => setViewFilters((prev) => ({ ...prev, [filterKey]: e.target.value }))}
                    style={{
                        position: "absolute",
                        width: 1,
                        height: 1,
                        opacity: 0,
                        pointerEvents: "none",
                    }}
                />
                <button
                    type="button"
                    onClick={openCalendar}
                    style={{
                        width: "100%",
                        height: 34,
                        border: "1px solid #d9e1ee",
                        borderRadius: 5,
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 9px",
                        boxSizing: "border-box",
                        color: value ? "#29427f" : "#64748b",
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        textAlign: "left",
                    }}
                >
                    <span>{value || "Select Date"}</span>
                    <span style={{ fontSize: 15 }}>📅</span>
                </button>
            </div>
        );
    };

    const SingleSelectDropdown = ({
        filterKey,
        label,
        noSearch = false,
        noClear = false,
    }) => {
        const options =
            singleFilterConfig[filterKey]?.options || [];

        const query = (
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
                }}
            >
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#173b8f",
                        marginBottom: 5,
                    }}
                >
                    {label}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setOpenFilter((current) =>
                            current === filterKey ? null : filterKey
                        );
                    }}
                    style={{
                        width: "100%",
                        height: 34,
                        border: "1px solid #d9e1ee",
                        borderRadius: 5,
                        background: "#ffffff",
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
                    }}
                >
                    <span
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {getSingleFilterDisplayValue(
                            filterKey
                        )}
                    </span>

                    <span
                        style={{
                            color: "#173b8f",
                            marginLeft: 5,
                        }}
                    >
                        ⌄
                    </span>
                </button>

                {openFilter === filterKey && (
                    <div
                        style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            width: "100%",
                            minWidth: 200,
                            background: "#ffffff",
                            border: "1px solid #d7dfeb",
                            borderRadius: 6,
                            boxShadow:
                                "0 8px 20px rgba(15, 23, 42, 0.12)",
                            zIndex: 5000,
                            overflow: "hidden",
                        }}
                    >
                        {/* SEARCH */}
                        {!noSearch && (
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
                                        }}
                                    >
                                        ⌕
                                    </span>

                                    <input
                                        type="text"
                                        value={filterSearch[filterKey] || ""}
                                        onChange={(e) =>
                                            handleFilterSearch(
                                                filterKey,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Search..."
                                        autoFocus
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
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* CLEAR */}
                        {!noClear && (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "flex-end",
                                    padding: "7px 9px",
                                    borderBottom:
                                        "1px solid #edf1f6",
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
                        )}

                        {/* OPTIONS */}
                        <div
                            style={{
                                maxHeight: 200,
                                overflowY: "auto",
                                padding: "3px 0",
                            }}
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() =>
                                            selectSingleFilterValue(
                                                filterKey,
                                                option
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            border: "none",
                                            background:
                                                viewFilters[
                                                    filterKey
                                                ] === option
                                                    ? "#f1f5ff"
                                                    : "#ffffff",
                                            padding:
                                                "7px 10px",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            color:
                                                viewFilters[
                                                    filterKey
                                                ] === option
                                                    ? "#4936e9"
                                                    : "#334155",
                                            fontSize: 10,
                                            fontWeight:
                                                viewFilters[
                                                    filterKey
                                                ] === option
                                                    ? 700
                                                    : 500,
                                        }}
                                    >
                                        {option}
                                    </button>
                                ))
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

    const [serverRows, setServerRows] = useState(() => normalizeViewAllRows(initialData));
    const safeData = serverRows;
    const [serverMeta, setServerMeta] = useState({ total_records: 0, page: 1, page_size: pageSize });
    const [detailLoading, setDetailLoading] = useState(false);

    const handleExport = async (format) => {
        try {
            const apiFilters = buildDetailFilters();
            const isPdf = String(format).toLowerCase() === "pdf";

            const response = isPdf
                ? await exportReceivablesPDF(apiFilters)
                : await exportReceivablesExcel(apiFilters);

            triggerReceivablesBlobDownload(
                response,
                isPdf
                    ? "Receivables_View_All.pdf"
                    : "Receivables_View_All.xlsx"
            );
        } catch (error) {
            console.error("Receivables View All export failed", error);
        }
    };

    const buildDetailFilters = () => {
        /*
         * View-all supports the record drill-down parameters:
         * aging_bucket, balance_status, customer_id, parent_division_id,
         * subdivision_id and as_on_date. These are sent together with the
         * current page filters and aging_basis/reporting_currency.
         */
        const toIds = (values, options) => (Array.isArray(values) ? values : values ? [values] : [])
            .map((label) => options.find((x) => String(x.label ?? x) === String(label) || String(x.value ?? x) === String(label))?.value ?? label)
            .filter((value) => value !== "All" && value !== "");
        const optionList = (key) => filterOptions[key] || [];
        const { component: _component, ...drilldownFilters } = drilldown || {};
        return ({
            ...baseFilters,
            ...drilldownFilters,
            aging_basis: apiAgingBasis(appliedViewFilters.aging_basis || filters?.aging_basis),
            as_on_date:
                drilldown?.as_on_date ||
                appliedViewFilters.as_on_date ||
                filters?.as_on_date ||
                baseFilters.as_on_date,
            reporting_currency:
                appliedViewFilters.reporting_currency ||
                filters?.reporting_currency ||
                baseFilters.reporting_currency,
            legal_group_id: toIds(appliedViewFilters.legal_group, optionList("legal_groups")),
            legal_entity_id:
                drilldown?.legal_entity_id ??
                toIds(appliedViewFilters.legal_entities, optionList("legal_entities")),
            parent_division_id:
                drilldown?.parent_division_id ??
                toIds(appliedViewFilters.parent_divisions, optionList("parent_divisions")),
            subdivision_id:
                drilldown?.subdivision_id ??
                toIds(appliedViewFilters.sub_divisions, optionList("sub_divisions")),
            ...(search.trim()
                ? {
                    customer_name: search.trim(),
                    search: search.trim(),
                }
                : {}),
            // Keep the exact drill-down context for View All exports.
            // The export API accepts the same detail parameters as View All:
            // aging_bucket, balance_status, customer_id, parent_division_id,
            // subdivision_id and as_on_date.
            page,
            page_size: pageSize,
            sort_by: sortKey === "supplier_name" ? "customer_name" :
                sortKey === "legal_entity" ? "legal_entity_name" :
                    sortKey === "parent_division" ? "parent_division_name" :
                        sortKey === "sub_division" ? "subdivision_name" :
                            sortKey === "total_receivable" ? "total_receivables" :
                                sortKey === "overdue_receivable" ? "overdue_receivables" : sortKey,
            sort_dir: sortDirection,
        });
    };

    useEffect(() => {
        let cancelled = false;
        setDetailLoading(true);
        getReceivableDetails(buildDetailFilters())
            .then((response) => {
                if (cancelled) return;

                // Axios response is normally:
                // { data: { data: [...], meta: {...} } }
                // while some API wrappers may return the payload directly.
                // Support both shapes so View All never treats the payload
                // object itself as the row array.
                const payload = response?.data ?? response ?? {};
                const rows = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.data)
                        ? payload.data
                        : [];

                const meta = Array.isArray(payload)
                    ? response?.meta
                    : payload?.meta ?? response?.meta;

                setServerRows(normalizeViewAllRows(rows));
                setServerMeta(
                    meta ||
                    { total_records: rows.length, page, page_size: pageSize }
                );
            })
            .catch((error) => {
                console.error("Receivables View All failed", error);
                if (!cancelled) {
                    setServerRows([]);
                    setServerMeta({ total_records: 0, page, page_size: pageSize });
                }
            })
            .finally(() => { if (!cancelled) setDetailLoading(false); });
        return () => { cancelled = true; };
    }, [appliedViewFilters, search, page, pageSize, sortKey, sortDirection, baseFilters, drilldown]);

    const filtered = serverRows;
    const totalPages = Math.max(1, Math.ceil(Number(serverMeta.total_records || 0) / pageSize));
    const pageRows = filtered;

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const changeSort = (key) => {
        if (sortKey === key) setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDirection("desc"); }
        setPage(1);
    };

    // Searching must always start from the first server-side page.
    useEffect(() => {
        setPage(1);
    }, [search]);

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
            label: "Customer Code",
            sortable: true,
            text: true,
        },
        {
            key: "supplier_name",
            label: "Customer Name",
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
            key: "total_receivable",
            label: "Total Receivables",
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
        "total_receivable",
        "current",
        "0_30",
        "31_60",
        "61_90",
        "91_120",
        "121_180",
        "181_365",
        "above_365",
    ];

    /* ============================================================
       SUMMARY VALUES
    ============================================================ */

    const totalReceivables = safeData.reduce(
        (sum, row) =>
            sum + Number(row.total_receivable || 0),
        0
    );

    const currentReceivables = safeData.reduce(
        (sum, row) =>
            sum + Number(row.current || 0),
        0
    );

    const overdueReceivables = safeData.reduce(
        (sum, row) =>
            sum +
            Number(row["0_30"] || 0) +
            Number(row["31_60"] || 0) +
            Number(row["61_90"] || 0) +
            Number(row["91_120"] || 0) +
            Number(row["121_180"] || 0) +
            Number(row["181_365"] || 0) +
            Number(row["above_365"] || 0),
        0
    );

    const overdue90 = safeData.reduce(
        (sum, row) =>
            sum +
            Number(row["91_120"] || 0) +
            Number(row["121_180"] || 0) +
            Number(row["181_365"] || 0) +
            Number(row["above_365"] || 0),
        0
    );

    const snapshotDate =
        appliedViewFilters?.as_on_date ||
        filters?.as_on_date ||
        filters?.as_on_dates ||
        filters?.asOfDate ||
        filters?.snapshot_date ||
        null;

    const agingBasis =
        appliedViewFilters?.aging_basis ||
        filters?.aging_basis ||
        filters?.agingBasis ||
        "Due Date";

    /* ============================================================
       KPI CARD
    ============================================================ */

    // Use the currency selected in View All after Apply for all View All summary cards.
    // Keep this scoped to the View All component only.
    // const viewAllCurrency =
    //     appliedViewFilters?.reporting_currency ||
    //     currency ||
    //     "AED";

    const SummaryCard = ({
        icon,
        title,
        value,
        iconBackground,
        iconColor,
        titleColor,
        cardBackground,
    }) => (
        <div
            style={{
                background: cardBackground || "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
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
                    {formatReceivablesCompact(
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

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2000,
                background: "rgba(15, 23, 42, 0.48)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                boxSizing: "border-box",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="sales-style-view-all-modal"
                style={{
                    width: "min(1450px, 100%)",
                    maxHeight: "92vh",
                    background: "#f7faff",
                    borderRadius: 10,
                    overflow: "hidden",
                    boxShadow:
                        "0 18px 55px rgba(15, 23, 42, 0.28)",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        minHeight: 0,
                        overflowY: "auto",
                        padding: "18px 18px 30px",
                        boxSizing: "border-box",
                        color: "#17213c",
                    }}
                >
                    {/* ======================================================
              PAGE HEADER
          ====================================================== */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 15,
                            marginBottom: 16,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 27,
                                    lineHeight: 1.1,
                                    fontWeight: 800,
                                    color: "#102a72",
                                    letterSpacing: "-0.5px",
                                }}
                            >
                                {componentTitle} View All
                            </div>

                            <div
                                style={{
                                    marginTop: 5,
                                    fontSize: 12,
                                    color: "#64748b",
                                }}
                            >
                                Review complete receivable balances and
                                aging details for the selected snapshot.
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    handleExport("excel")
                                }
                                style={{
                                    height: 34,
                                    minWidth: 80,
                                    padding: "0 13px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                    border: "1px solid #86efac",
                                    borderRadius: 8,
                                    background: "#f7fffa",
                                    color: "#16a34a",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                }}
                            >
                                <span style={{ fontSize: 13 }}>
                                    📊
                                </span>
                                Excel
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleExport("pdf")
                                }
                                style={{
                                    height: 34,
                                    minWidth: 72,
                                    padding: "0 13px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                    border: "1px solid #fda4af",
                                    borderRadius: 8,
                                    background: "#fff8f8",
                                    color: "#ef4444",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                }}
                            >
                                <span style={{ fontSize: 13 }}>
                                    📄
                                </span>
                                PDF
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    height: 34,
                                    padding: "0 13px",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: 5,
                                    background: "#ffffff",
                                    color: "#3149a5",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                ✖
                            </button>
                        </div>
                    </div>

                    {/* ======================================================
              FILTERS
          ====================================================== */}

                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e3e9f2",
                            borderRadius: 9,
                            padding: "13px 14px 15px",
                            marginBottom: 14,
                            boxShadow:
                                "0 2px 8px rgba(15, 23, 42, 0.025)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 11,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 9,
                                    color: "#173b8f",
                                    fontSize: 16,
                                    fontWeight: 800,
                                }}
                            >
                                Filters
                            </div>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1.05fr 1fr 1fr 1fr 1fr 1fr 1fr auto auto",
                                gap: 10,
                                alignItems: "end",
                            }}
                        >
                            {/* LEGAL GROUP */}
                            <MultiSelectDropdown
                                filterKey="legal_group"
                                label="Legal Group"
                            />

                            {/* LEGAL ENTITY */}
                            <MultiSelectDropdown
                                filterKey="legal_entities"
                                label="Legal Entity"
                            />

                            {/* PARENT DIVISION */}
                            <MultiSelectDropdown
                                filterKey="parent_divisions"
                                label="Parent Division"
                            />

                            {/* SUB-DIVISION */}
                            <MultiSelectDropdown
                                filterKey="sub_divisions"
                                label="Sub-Division"
                            />

                            {/* REPORTING CURRENCY */}
                            <SingleSelectDropdown
                                filterKey="reporting_currency"
                                label="Reporting Currency"
                            />

                            {/* AS ON DATE */}
                            <ViewAllDateFilter
                                filterKey="as_on_date"
                                label="As On Date"
                            />

                            {/* AGING BASIS */}
                            <SingleSelectDropdown
                                filterKey="aging_basis"
                                label="Aging Basis"
                                noSearch
                                noClear
                            />

                            {/* APPLY */}
                            <button
                                type="button"
                                onClick={
                                    handleApplyViewFilters
                                }
                                style={{
                                    height: 34,
                                    padding: "0 20px",
                                    border: "none",
                                    borderRadius: 5,
                                    background: "#4936e9",
                                    color: "#ffffff",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                }}
                            >
                                Apply
                            </button>

                            {/* RESET */}
                            <button
                                type="button"
                                onClick={
                                    handleResetViewFilters
                                }
                                style={{
                                    height: 34,
                                    padding: "0 18px",
                                    border:
                                        "1px solid #d4dbe7",
                                    borderRadius: 5,
                                    background: "#ffffff",
                                    color: "#334155",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                Reset
                            </button>
                        </div>
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
                                borderRadius: 12,
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
                                    {filtered.length.toLocaleString()}
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
                            title="Total Receivables"
                            value={totalReceivables}
                            iconBackground="#e5faf2"
                            iconColor="#149b6f"
                            titleColor="#149b6f"
                            cardBackground="#f0fdf4"
                        />

                        <SummaryCard
                            icon="▤"
                            title="Current"
                            value={currentReceivables}
                            iconBackground="#e5faf2"
                            iconColor="#149b6f"
                            titleColor="#149b6f"
                            cardBackground="#f0fdf4"
                        />

                        <SummaryCard
                            icon="⌛"
                            title="Overdue"
                            value={overdueReceivables}
                            iconBackground="#fff2df"
                            iconColor="#ed8a17"
                            titleColor="#c2410c"
                            cardBackground="#fff7ed"
                        />

                        <SummaryCard
                            icon="!"
                            title="Overdue > 90 Days"
                            value={overdue90}
                            iconBackground="#ffeaf0"
                            iconColor="#ed3c69"
                            titleColor="#be185d"
                            cardBackground="#fdf2f8"
                        />
                    </div>

                    {/* ======================================================
              ALL RECEIVABLES CARD
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
                                            fontSize: 19,
                                            fontWeight: 800,
                                            color: "#142b6f",
                                        }}
                                    >
                                        All Receivables
                                    </div>

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
                                            placeholder="Search Customer"
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
                                        {filtered.length === 0
                                            ? 0
                                            : (page - 1) *
                                            pageSize +
                                            1}{" "}
                                        –{" "}
                                        {Math.min(
                                            page * pageSize,
                                            filtered.length
                                        )}{" "}
                                        of{" "}
                                        {filtered.length.toLocaleString()}
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
                        {/*
                         * View All table only:
                         * - More horizontal room between columns.
                         * - First 3 columns stay visible while scrolling horizontally.
                         * No other dashboard table is affected.
                         */}
                        <div
                            style={{
                                width: "100%",
                                overflowX: "auto",
                                overflowY: "auto",
                                maxWidth: "100%",
                            }}
                        >
                            <table
                                style={{
                                    width: "max-content",
                                    minWidth: 1900,
                                    borderCollapse: "separate",
                                    borderSpacing: 0,
                                    tableLayout: "fixed",
                                    fontSize: 10,
                                }}
                            >
                                <thead>
                                    <tr>
                                        {viewColumns.map(
                                            (column, columnIndex) => {
                                                const isText = column.text;
                                                const isSticky = columnIndex < 3;

                                                const stickyLeft =
                                                    columnIndex === 0
                                                        ? 0
                                                        : columnIndex === 1
                                                            ? 210
                                                            : 400;

                                                const columnWidth =
                                                    columnIndex === 0
                                                        ? 210
                                                        : columnIndex === 1
                                                            ? 190
                                                            : columnIndex === 2
                                                                ? 180
                                                                : columnIndex === 3
                                                                    ? 145
                                                                    : columnIndex === 4
                                                                        ? 220
                                                                        : columnIndex === 5
                                                                            ? 130
                                                                            : columnIndex === 6
                                                                                ? 105
                                                                                : 145;

                                                return (
                                                    <th
                                                        key={column.key}
                                                        onClick={() =>
                                                            column.sortable &&
                                                            changeSort(column.key)
                                                        }
                                                        style={{
                                                            position: isSticky
                                                                ? "sticky"
                                                                : "static",
                                                            left: isSticky
                                                                ? stickyLeft
                                                                : undefined,
                                                            top: 0,
                                                            zIndex: isSticky ? 5 : 2,
                                                            width: columnWidth,
                                                            minWidth: columnWidth,
                                                            maxWidth: columnWidth,
                                                            boxSizing: "border-box",
                                                            background: "#edf4ff",
                                                            color: "#24479d",
                                                            fontWeight: 800,
                                                            padding: "8px 12px",
                                                            borderBottom:
                                                                "1px solid #d7e1ef",
                                                            borderRight:
                                                                "1px solid #e7edf6",
                                                            textAlign: isText
                                                                ? "left"
                                                                : "right",
                                                            whiteSpace: "nowrap",
                                                            cursor: column.sortable
                                                                ? "pointer"
                                                                : "default",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                        }}
                                                    >
                                                        {column.label}

                                                        {column.sortable &&
                                                            sortKey === column.key && (
                                                                <span
                                                                    style={{
                                                                        marginLeft: 4,
                                                                        fontSize: 8,
                                                                    }}
                                                                >
                                                                    {sortDirection === "asc"
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
                                    {filtered.map((row, rowIndex) => (
                                        <tr key={row.id ?? rowIndex}>
                                            {viewColumns.map((column, columnIndex) => {
                                                const isSticky = columnIndex < 3;

                                                const stickyLeft =
                                                    columnIndex === 0
                                                        ? 0
                                                        : columnIndex === 1
                                                            ? 210
                                                            : 400;

                                                let value;

                                                if (column.key === "row_currency") {
                                                    value =
                                                        appliedViewFilters?.reporting_currency ||
                                                        row.row_currency ||
                                                        row.currency ||
                                                        currency ||
                                                        "AED";
                                                } else {
                                                    value = row[column.key];
                                                }

                                                if (column.key === "supplier_name") {
                                                    value = value || row.supplier || "-";
                                                }

                                                return (
                                                    <td
                                                        key={column.key}
                                                        style={{
                                                            position: isSticky ? "sticky" : "static",
                                                            left: isSticky ? stickyLeft : undefined,
                                                            zIndex: isSticky ? 4 : 1,
                                                            width:
                                                                column.key === "total_receivable"
                                                                    ? 180 :
                                                                    columnIndex === 0
                                                                        ? 210
                                                                        : columnIndex === 1
                                                                            ? 190
                                                                            : columnIndex === 2
                                                                                ? 180
                                                                                : columnIndex === 3
                                                                                    ? 145
                                                                                    : columnIndex === 4
                                                                                        ? 220
                                                                                        : columnIndex === 5
                                                                                            ? 130
                                                                                            : columnIndex === 6
                                                                                                ? 105
                                                                                                : 145,
                                                            minWidth:
                                                                columnIndex === 0
                                                                    ? 210
                                                                    : columnIndex === 1
                                                                        ? 190
                                                                        : columnIndex === 2
                                                                            ? 180
                                                                            : columnIndex === 3
                                                                                ? 145
                                                                                : columnIndex === 4
                                                                                    ? 220
                                                                                    : columnIndex === 5
                                                                                        ? 130
                                                                                        : columnIndex === 6
                                                                                            ? 105
                                                                                            : 145,
                                                            padding: "9px 12px",
                                                            borderRight: "1px solid #edf1f6",
                                                            background:
                                                                rowIndex % 2 === 0
                                                                    ? "#f9fbff"
                                                                    : "#ffffff",
                                                            whiteSpace: column.text
                                                                ? "nowrap"
                                                                : "normal",
                                                            textAlign: column.text ? "left" : "right",
                                                            color:
                                                                amountColumns.includes(column.key) &&
                                                                    Number(String(value ?? "0").replace(/,/g, "").replace(/[^\d.-]/g, "")) < 0
                                                                    ? "#c62828"
                                                                    : "#334b8e",
                                                            fontWeight: amountColumns.includes(column.key) ? 600 : 500,
                                                        }}
                                                    >
                                                        {column.key === "row_currency"
                                                            ? value || "-"
                                                            : amountColumns.includes(column.key)
                                                                ? formatTableAmount(value)
                                                                : cleanCurrency(value || "-")}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* NO DATA */}

                        {pageRows.length === 0 && (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: 45,
                                    color: "#64748b",
                                    fontSize: 12,
                                }}
                            >
                                No Customers found.
                            </div>
                        )}

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
                                Values shown in {currency}

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
                                    {filtered.length === 0
                                        ? 0
                                        : (page - 1) *
                                        pageSize +
                                        1}
                                    {" – "}
                                    {Math.min(
                                        page * pageSize,
                                        filtered.length
                                    )}
                                    {" of "}
                                    {filtered.length.toLocaleString()}
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
        </div >
    );
}

