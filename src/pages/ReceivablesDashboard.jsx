
import React, { useEffect, useMemo, useState, useRef } from "react";
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
    (Array.isArray(items) ? items : []).map((item) =>
        typeof item === "object"
            ? { value: item.value, label: item.label ?? String(item.value ?? "") }
            : { value: item, label: String(item) }
    );

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
            total_payables: k.total_receivables,
            current_payables: k.current_receivables,
            overdue_payables: k.overdue_receivables,
            overdue_gt_90: k.overdue_above_90,
            dpo: k.dso_days,
            total_payables_variance: k.total_change_percentage,
            current_payables_variance: k.current_change_percentage,
            overdue_payables_variance: k.overdue_change_percentage,
            overdue_gt_90_variance: k.overdue_above_90_change_percentage,
            dpo_variance: k.dso_change_days,
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
                total_payables: row.total_receivables,
                dpo: row.dso_days,
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
            payable_amount: row.total_receivables,
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
        total_payable: row.total_receivables,
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

const formatPayablesCompact = (value, currency = "AED") => {
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

function SectionTitle({ children, info }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "#00000",
                marginBottom: 12,
            }}
        >
            {children}
            {info && <InfoIcon title={info} />}
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
    options = [],
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

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
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    /* ----------------------------------------------------------
       NORMALIZE DATE OPTIONS
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

    const finalOptions = [
        "All",
        ...normalizedOptions.filter((option) => option !== "All"),
    ];

    const filteredOptions = finalOptions.filter((option) =>
        option.toLowerCase().includes(search.toLowerCase())
    );

    const displayValue =
        value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
            ? String(value)
            : "All";

    return (
        <div
            ref={dropdownRef}
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
                {displayValue}

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
                                placeholder="Search As On Date"
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
                                const selected =
                                    option === "All"
                                        ? !value
                                        : String(value || "") ===
                                        option;

                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => {
                                            if (option === "All") {
                                                onChange("");
                                            } else {
                                                onChange(option);
                                            }

                                            setOpen(false);
                                            setSearch("");
                                        }}
                                        style={{
                                            width: "100%",
                                            minHeight: 31,
                                            display: "flex",
                                            alignItems: "center",
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
                                        <span
                                            style={{
                                                overflow: "hidden",
                                                textOverflow:
                                                    "ellipsis",
                                                whiteSpace:
                                                    "nowrap",
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
/* ============================================================
   KPI CARD
   ============================================================ */

function KpiCard({
    title,
    value,
    variance,
    previousDate,
    onClick,
    icon,
    iconBg,
    iconColor,
    currency,
    suffix,
}) {
    const formatValue = (value) => {
        if (value === null || value === undefined) return "—";

        // DSO / Days
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

    const isPositive = Number(variance) >= 0;

    /* ----------------------------------------------------------
       FORMAT PREVIOUS DATE
       API: 2026-09-20
       DISPLAY: 20 Sep 2026
    ---------------------------------------------------------- */
    const formatPreviousDate = (date) => {
        if (!date) return "";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date);
        }

        return parsedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const effectivePreviousDate =
        previousDate || "";

    const formattedPreviousDate =
        formatPreviousDate(effectivePreviousDate);

    return (
        <div
            style={{
                background: iconBg || "#F8FAFC",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                borderRadius: "12px",
                padding: "14px 16px",
                minHeight: "105px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",

                // Card shadow
                boxShadow:
                    "0 2px 8px rgba(15, 23, 42, 0.04)",

                // Smooth hover effect
                transition:
                    "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",

                cursor: "default",
            }}
            onClick={typeof onClick === "function" ? onClick : undefined}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                    "translateY(-2px)";

                e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(15, 23, 42, 0.06)";

                e.currentTarget.style.filter =
                    "brightness(0.99)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                    "translateY(0)";

                e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(15, 23, 42, 0.04)";

                e.currentTarget.style.filter =
                    "brightness(1)";
            }}
        >
            {/* =====================================================
                TOP ROW
            ===================================================== */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                {/* ICON */}
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#F1F5F9",
                        color: iconColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow:
                            "0 2px 6px rgba(15, 23, 42, 0.06)",
                    }}
                >
                    {icon}
                </div>

                {/* TITLE */}
                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: iconColor,
                        lineHeight: 1.2,
                    }}
                >
                    {title}
                </div>
            </div>

            {/* =====================================================
                VALUE
            ===================================================== */}
            <div
                style={{
                    marginLeft: "46px",
                    marginTop: "-2px",
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#111827",
                    lineHeight: 1.1,
                }}
            >
                {formatValue(value)}
            </div>

            {/* =====================================================
                PREVIOUS DATE - SECOND ROW
            ===================================================== */}
            {formattedPreviousDate && (
                <div
                    style={{
                        marginLeft: "46px",
                        marginTop: "1px",
                        fontSize: "10px",
                        color: "#64748b",
                        fontWeight: 500,
                        lineHeight: 1.2,
                    }}
                >
                    Previous: {formattedPreviousDate}
                </div>
            )}

            {/* =====================================================
                VARIANCE
            ===================================================== */}
            <div
                style={{
                    marginLeft: "46px",
                    fontSize: "11px",
                    color: isPositive
                        ? "#0e9f75"
                        : "#ef476f",
                    fontWeight: 600,
                    lineHeight: 1.2,
                }}
            >
                {variance !== null &&
                    variance !== undefined
                    ? `${isPositive ? "▲" : "▼"} ${Math.abs(
                        Number(variance)
                    ).toFixed(1)}%`
                    : "—"}
            </div>
        </div>
    );
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

    const radius = 65;
    const circumference = 2 * Math.PI * radius;

    /*
     * ==========================================================
     * NORMALIZE API DATA
     * ==========================================================
     */
    const normalizedData = Array.isArray(data)
        ? data.map((item) => {
            const amount = Number(item?.amount || 0);

            let percentage;

            if (
                String(centerLabel || "").toLowerCase() ===
                "overdue"
            ) {
                const overdueTotal = Number(total || 0);

                percentage =
                    overdueTotal !== 0
                        ? (amount / overdueTotal) * 100
                        : 0;
            } else {
                percentage = Number(
                    item?.percentage ??
                    item?.percentage_of_total ??
                    0
                );
            }

            return {
                ...item,
                bucket:
                    item?.bucket ??
                    item?.bucket_name ??
                    "",
                amount,
                percentage,
            };
        })
        : [];

    let accumulated = 0;

    /* ==========================================================
       CLICK SEGMENT
    ========================================================== */
    const handleSegmentClick = (index) => {
        setSelectedIndex((prev) =>
            prev === index ? null : index
        );

        if (typeof onSegmentClick === "function") {
            onSegmentClick(normalizedData[index], index);
        }
    };

    /* ==========================================================
       GET SEGMENT POSITION
    ========================================================== */
    const getSegmentTransform = (
        startLength,
        segmentLength,
        active
    ) => {
        if (!active) {
            return "rotate(-90 87.5 87.5)";
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
            rotate(-90 87.5 87.5)
        `;
    };

    return (
        <div
            style={{
                display: "flex",

                /*
                 * Only Overdue Summary uses column layout.
                 * Other donut charts remain unchanged.
                 */
                flexDirection: legendBelow
                    ? "column"
                    : "row",

                alignItems: "center",

                /*
                 * Increased only for legendBelow / Overdue Summary.
                 */
                gap: legendBelow ? 30 : 20,

                minHeight: legendBelow ? 250 : 185,
                position: "relative",
            }}
        >
            {/* =====================================================
                DONUT
            ===================================================== */}
            <div
                style={{
                    width: 175,
                    minWidth: 175,
                    height: 175,
                    position: "relative",
                }}
            >
                <svg
                    width="175"
                    height="175"
                    viewBox="0 0 175 175"
                    style={{
                        overflow: "visible",
                    }}
                >
                    {/* =================================================
                        BACKGROUND RING
                    ================================================= */}
                    <circle
                        cx="87.5"
                        cy="87.5"
                        r={radius}
                        fill="none"
                        stroke="#eef2f7"
                        strokeWidth="25"
                    />

                    {/* =================================================
                        DONUT SEGMENTS
                    ================================================= */}
                    {normalizedData.map(
                        (item, index) => {
                            const percent =
                                Number(
                                    item.percentage || 0
                                ) / 100;

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

                            const isActive =
                                isSelected ||
                                isHovered;

                            return (
                                <circle
                                    key={
                                        item.bucket ||
                                        item.bucket_code ||
                                        index
                                    }
                                    cx="87.5"
                                    cy="87.5"
                                    r={radius}
                                    fill="none"
                                    stroke={
                                        colors[
                                        index %
                                        colors.length
                                        ]
                                    }
                                    strokeWidth={
                                        isActive ? 29 : 25
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

                                        opacity:
                                            selectedIndex !==
                                                null &&
                                                !isSelected
                                                ? 0.55
                                                : 1,

                                        filter: isActive
                                            ? "drop-shadow(0 4px 7px rgba(0,0,0,0.20))"
                                            : "none",

                                        transition:
                                            "transform 0.25s ease, stroke-width 0.2s ease, opacity 0.2s ease, filter 0.2s ease",
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
                =================================================== */}
                {selectedIndex === null && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#000000",
                            pointerEvents: "none",
                            transition:
                                "opacity 0.2s ease",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 16,
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
                                fontSize: 11,
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
                    normalizedData[hoveredIndex] && (
                        <div
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform:
                                    "translate(-50%, -50%)",
                                minWidth: 180,
                                background: "#ffffff",
                                border:
                                    "1px solid #e5eaf2",
                                borderRadius: 16,
                                padding: "14px 16px",
                                boxShadow:
                                    "0 12px 30px rgba(24,45,80,0.16)",
                                zIndex: 50,
                                pointerEvents: "none",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {/* Tooltip Title */}
                            <div
                                style={{
                                    display: "flex",
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
                                        borderRadius: 3,
                                        background:
                                            colors[
                                            hoveredIndex %
                                            colors.length
                                            ],
                                        display:
                                            "inline-block",
                                    }}
                                />

                                {
                                    normalizedData[
                                        hoveredIndex
                                    ].bucket
                                }
                            </div>

                            {/* Amount */}
                            <div
                                style={{
                                    display: "flex",
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
                                        color: "#17213c",
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

                            {/* Share */}
                            <div
                                style={{
                                    display: "flex",
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
                                        ].percentage
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
                     * Extra spacing between donut and legend
                     * for Overdue Summary only.
                     */
                    marginTop: legendBelow
                        ? 4
                        : 0,
                }}
            >
                {normalizedData.map(
                    (item, index) => {
                        const isSelected =
                            selectedIndex === index;

                        const isHovered =
                            hoveredIndex === index;

                        const isActive =
                            isSelected ||
                            isHovered;

                        return (
                            <div
                                key={
                                    item.bucket ||
                                    item.bucket_code ||
                                    index
                                }
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
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    gap: 7,

                                    /*
                                     * Increased gap between
                                     * legend items only when
                                     * legend is below donut.
                                     */
                                    marginBottom:
                                        legendBelow
                                            ? 30
                                            : 7,

                                    fontSize: 12,
                                    color: "#334155",
                                    cursor: "pointer",
                                    padding:
                                        "3px 5px",
                                    borderRadius: 6,

                                    background:
                                        isSelected
                                            ? "#f1f5ff"
                                            : isHovered
                                                ? "#f8fafc"
                                                : "transparent",

                                    transition:
                                        "background 0.2s ease",
                                }}
                            >
                                {/* Color Dot */}
                                <span
                                    style={{
                                        width: 9,
                                        height: 9,
                                        borderRadius:
                                            "50%",
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
                                    }}
                                />

                                {/* Bucket */}
                                <span
                                    style={{
                                        flex: 1,
                                        overflow:
                                            "hidden",
                                        textOverflow:
                                            "ellipsis",
                                        whiteSpace:
                                            "nowrap",
                                        fontWeight:
                                            isActive
                                                ? 800
                                                : 700,
                                    }}
                                >
                                    {item.bucket}
                                </span>

                                {/* Amount */}
                                <strong
                                    style={{
                                        color: "#344b8a",
                                        whiteSpace:
                                            "nowrap",
                                    }}
                                >
                                    {(
                                        Number(
                                            item.amount ||
                                            0
                                        ) / 1000000
                                    ).toFixed(2)}
                                    M
                                </strong>

                                {/* Percentage */}
                                <span
                                    style={{
                                        color: "#64748b",
                                        minWidth: 36,
                                        whiteSpace:
                                            "nowrap",
                                        fontWeight:
                                            isActive
                                                ? 700
                                                : 500,
                                    }}
                                >
                                    (
                                    {formatPercentage(
                                        item.percentage
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

    const maxValue = Math.max(
        ...data.map((item) => Number(item.total_payables || 0))
    );

    return (
        <div style={{ width: "100%", overflowX: "hidden" }}>
            <div
                style={{
                    width: "100%",
                    height: 220,
                    position: "relative",
                    padding: "10px 10px 35px 45px",
                    boxSizing: "border-box",
                }}
            >
                {[0, 1, 2, 3, 4].map((line) => (
                    <div
                        key={line}
                        style={{
                            position: "absolute",
                            left: 45,
                            right: 10,
                            top: 15 + line * 36,
                            borderTop: "1px dashed #e2e8f0",
                        }}
                    />
                ))}

                <div
                    style={{
                        position: "absolute",
                        left: 3,
                        top: 5,
                        fontSize: 10,
                        color: MUTED,
                    }}
                >
                    {currency} (M)
                </div>

                <div
                    style={{
                        position: "absolute",
                        left: 3,
                        top: 78,
                        fontSize: 9,
                        color: MUTED,
                    }}
                >
                    {formatAxisMillions(maxValue / 2)}
                </div>

                <div
                    style={{
                        position: "absolute",
                        left: 18,
                        bottom: 42,
                        fontSize: 9,
                        color: MUTED,
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
                        justifyContent: "space-between",
                        gap: 2,
                    }}
                >
                    {data.map((item, index) => {
                        const height =
                            maxValue > 0
                                ? (Number(item.total_payables) / maxValue) * 125
                                : 0;

                        const isHovered = hoveredIndex === index;

                        return (
                            <div
                                key={item.month}
                                style={{
                                    flex: 1,
                                    height: 150,
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    cursor: typeof onPointClick === "function" ? "pointer" : "default",
                                }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => {
                                    if (typeof onPointClick === "function") {
                                        onPointClick(item);
                                    }
                                }}
                            >
                                {/* =================================================
                    TOOLTIP
                ================================================= */}

                                {isHovered && (
                                    <div
                                        style={{
                                            position: "absolute",

                                            // Keep tooltip inside the chart
                                            top: 5,

                                            left: "50%",
                                            transform: "translateX(-50%)",

                                            minWidth: 160,
                                            maxWidth: 190,

                                            background: "#ffffff",
                                            border: "1px solid #dce3ee",
                                            borderRadius: 8,

                                            padding: "9px 11px",

                                            boxShadow:
                                                "0 8px 22px rgba(24, 45, 80, 0.16)",

                                            zIndex: 1000,
                                            pointerEvents: "none",

                                            whiteSpace: "normal",
                                            boxSizing: "border-box",
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
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 15,
                                                fontSize: 11, fontWeight: 800,
                                                marginBottom: 5,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "#64748b",
                                                }}
                                            >
                                                Total Payables
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
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 15,
                                                fontSize: 11, fontWeight: 800,
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
                                                {Number(item.dpo || 0).toFixed(1)} Days
                                            </strong>
                                        </div>
                                    </div>
                                )}

                                {/* Value above bar */}
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: BLUE,
                                        fontWeight: 800,
                                        marginBottom: 3,
                                        opacity: isHovered ? 0 : 1,
                                        transition: "opacity 0.15s ease",
                                    }}
                                >
                                    {(Number(item.total_payables) / 1000000).toFixed(2)}
                                </div>

                                {/* Bar */}
                                <div
                                    style={{
                                        width: isHovered ? "78%" : "70%",
                                        maxWidth: 38,
                                        height,
                                        minHeight: 3,
                                        background: BLUE_2,
                                        borderRadius: "2px 2px 0 0",
                                        cursor: "pointer",
                                        opacity: isHovered ? 0.85 : 1,
                                        boxShadow: isHovered
                                            ? "0 3px 10px rgba(91, 91, 234, 0.25)"
                                            : "none",
                                        transition:
                                            "width 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease",
                                    }}
                                />

                                {/* Month */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: -25,
                                        fontSize: 10,
                                        fontWeight: 800,
                                        color: "#475569",
                                        whiteSpace: "nowrap",
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
                                        : (index / (data.length - 1)) * 600;

                                const minDpo = Math.min(
                                    ...data.map((d) => Number(d.dpo))
                                );

                                const maxDpo = Math.max(
                                    ...data.map((d) => Number(d.dpo))
                                );

                                const range = Math.max(maxDpo - minDpo, 1);

                                const y =
                                    105 -
                                    ((Number(item.dpo) - minDpo) / range) * 80;

                                return `${x},${y}`;
                            })
                            .join(" ")}
                        fill="none"
                        stroke="#0e9f75"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />

                    {data.map((item, index) => {
                        const x =
                            data.length === 1
                                ? 300
                                : (index / (data.length - 1)) * 600;

                        const minDpo = Math.min(
                            ...data.map((d) => Number(d.dpo))
                        );

                        const maxDpo = Math.max(
                            ...data.map((d) => Number(d.dpo))
                        );

                        const range = Math.max(maxDpo - minDpo, 1);

                        const y =
                            105 -
                            ((Number(item.dpo) - minDpo) / range) * 80;

                        return (
                            <circle
                                key={item.month}
                                cx={x}
                                cy={y}
                                r={hoveredIndex === index ? 5 : 3}
                                fill="#fff"
                                stroke="#0e9f75"
                                strokeWidth={hoveredIndex === index ? 3 : 2}
                                style={{
                                    transition: "r 0.15s ease",
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
                    justifyContent: "center",
                    gap: 20,
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#475569",
                    marginTop: -5,
                }}
            >
                <span>
                    <span
                        style={{
                            display: "inline-block",
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
                            display: "inline-block",
                            width: 18,
                            borderTop: "2px dashed #0e9f75",
                            marginRight: 5,
                            verticalAlign: "middle",

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
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 6;

    const max = Math.max(...data.map((item) => Number(item.amount || 0)));

    // Pagination
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = data.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // Reset page if data changes and current page becomes invalid
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <div style={{ paddingTop: 5 }}>
            {paginatedData.map((item, index) => {
                const actualIndex = startIndex + index;

                const width =
                    max > 0
                        ? (Number(item.amount || 0) / max) * 100
                        : 0;

                const isHovered = hoveredIndex === actualIndex;

                return (
                    <div
                        key={item.name}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "70px 1fr 100px",
                            alignItems: "center",
                            gap: 8,
                            cursor: typeof onItemClick === "function" ? "pointer" : "default",

                            // Gap between each horizontal bar
                            marginBottom:
                                index === paginatedData.length - 1 ? 0 : 25,

                            position: "relative",
                        }}
                        onMouseEnter={() => setHoveredIndex(actualIndex)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => {
                            if (typeof onItemClick === "function") {
                                onItemClick(item);
                            }
                        }}
                    >
                        {/* Division Name */}
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 800,
                                color: "#334155",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {item.name}
                        </div>

                        {/* Bar */}
                        <div
                            style={{
                                height: 17,
                                background: "#eef3fb",
                                borderRadius: 2,
                                overflow: "hidden",
                                cursor: "pointer",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${width}%`,
                                    background: "#1464e8",
                                    opacity:
                                        hoveredIndex !== null &&
                                            !isHovered
                                            ? 0.65
                                            : 1,
                                    transition:
                                        "opacity 0.15s ease, width 0.2s ease",
                                }}
                            />
                        </div>

                        {/* Value */}
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#27438b",
                                textAlign: "right",
                            }}
                        >
                            {formatPayablesCompact(item.amount, "").replace(
                                /^[A-Z]{3}\s*/,
                                ""
                            )}{" "}
                            <span
                                style={{
                                    color: "#64748b",
                                    fontWeight: 500,
                                }}
                            >
                                ({formatPercentage(item.percentage)})
                            </span>
                        </div>

                        {/* Hover Tooltip */}
                        {isHovered && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: "50%",
                                    top:
                                        index === paginatedData.length - 1
                                            ? "auto"
                                            : "100%",
                                    bottom:
                                        index === paginatedData.length - 1
                                            ? "100%"
                                            : "auto",
                                    transform: "translateX(-50%)",
                                    marginTop:
                                        index === paginatedData.length - 1
                                            ? 0
                                            : 6,
                                    marginBottom:
                                        index === paginatedData.length - 1
                                            ? 6
                                            : 0,
                                    zIndex: 9999,
                                    background: "#ffffff",
                                    border: "1px solid #dbe3ef",
                                    borderRadius: 7,
                                    boxShadow:
                                        "0 5px 18px rgba(15, 23, 42, 0.16)",
                                    padding: "8px 11px",
                                    minWidth: 165,
                                    whiteSpace: "nowrap",
                                    pointerEvents: "none",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 900,
                                        color: "#173b8f",
                                        marginBottom: 5,
                                    }}
                                >
                                    {item.name}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 18,
                                        fontSize: 11,
                                        fontWeight: 900,
                                        marginBottom: 3,
                                    }}
                                >
                                    <span style={{ color: "#64748b" }}>
                                        Receivables
                                    </span>

                                    <span
                                        style={{
                                            color: "#27438b",
                                            fontWeight: 800,
                                        }}
                                    >
                                        {formatPayablesCompact(
                                            item.amount,
                                            currency
                                        )}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 18,
                                        fontSize: 11,
                                        fontWeight: 900,
                                    }}
                                >
                                    <span style={{ color: "#64748b" }}>
                                        Percentage
                                    </span>

                                    <span
                                        style={{
                                            color: "#27438b",
                                            fontWeight: 800,
                                        }}
                                    >
                                        {formatPercentage(item.percentage)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Compact pagination - same UI as the dashboard tables */}
            {totalPages > 1 && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        marginTop: 16,
                        paddingTop: 8,
                        borderTop: "1px solid #edf1f6",
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
                        Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, data.length)} of {data.length}
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
        </div>
    );
}
/* ============================================================
   TABLE
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

                                whiteSpace: fitColumns
                                    ? "normal"
                                    : "nowrap",

                                overflow: fitColumns
                                    ? "hidden"
                                    : "visible",

                                textOverflow: fitColumns
                                    ? "ellipsis"
                                    : "clip",

                                // Slight emphasis for fixed Total row
                                ...(isFixedRow
                                    ? {
                                        fontWeight: 800,
                                        background:
                                            "#f8fafc",
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

                // Dashboard endpoint provides the main sections.
                // Month-on-Month is a separate endpoint, so merge it into
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

    const openPayablesViewAll = (extra = {}) => {
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
     * All current page filters are still supplied by PayablesViewAll
     * through baseFilters/appliedViewFilters.
     */
    const openAgingDrilldown = (item) => {
        const bucket = item?.bucket_code;
        if (bucket) openPayablesViewAll({ aging_bucket: bucket, component: "Aging Summary" });
    };

    const openTrendDrilldown = (point) => {
        if (point?.as_on_date) {
            openPayablesViewAll({ as_on_date: point.as_on_date, component: "Monthly Trend" });
        }
    };

    const openParentDivisionDrilldown = (item) => {
        const value = item?.value;
        if (value !== undefined && value !== null && value !== "") {
            openPayablesViewAll({ parent_division_id: value, component: "Parent Division" });
        }
    };

    const openCustomerDrilldown = (row) => {
        const customerId = row?.customer_id;
        if (customerId !== undefined && customerId !== null && customerId !== "") {
            openPayablesViewAll({ customer_id: customerId, component: "Top 10 Customers" });
        }
    };

    const openOverdueDrilldown = () => {
        openPayablesViewAll({ balance_status: "OVERDUE" });
    };

    const openOverdueAbove90Drilldown = () => {
        openPayablesViewAll({ balance_status: "OVERDUE_ABOVE_90", component: "Overdue > 90 Days" });
    };

    const openSubdivisionDrilldown = (row) => {
        const subdivisionId = row?.value;
        if (
            subdivisionId !== undefined &&
            subdivisionId !== null &&
            subdivisionId !== ""
        ) {
            openPayablesViewAll({ subdivision_id: subdivisionId, component: "Sub-Division" });
        }
    };

    const openMomDrilldown = (row, column) => {
        const month = column?.key;
        if (!month || !MONTHS.includes(month)) return;

        const snapshotDates = row?._snapshot_dates || data?.snapshotDates || {};
        const snapshotDate = snapshotDates[String(month).toUpperCase()];

        if (!snapshotDate) return;

        openPayablesViewAll({
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
            align: "left",
        },
        {
            key: "supplier_name",
            label: "Customer Name",
        },
        {
            key: "payable_amount",
            label: `Receivables (${currency})`,
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
            label: `Receivables (${currency})`,
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
            style={{
                minHeight: "100vh",
                background: BG,
                fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: TEXT,
            }}
        >
            {/* ======================================================
          PAGE CONTENT
          ====================================================== */}

            <main
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "16px 18px 22px",
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
                                color: "#00000",
                                fontSize: 26,
                                lineHeight: 1.1,
                                fontWeight: 800,
                            }}
                        >
                            Receivables Dashboard
                        </h1>

                        <div
                            style={{
                                marginTop: 3,
                                color: "#66789e",
                                fontSize: 12,
                            }}
                        >
                            Track receivables, aging, overdue exposure and payment
                            performance
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
                            }))
                        }
                    />

                    <FilterSelect
                        label="Legal Entity"
                        value={filters.legal_entities}
                        options={filterOptions.legal_entities.map((x) => x.label)}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                legal_entities: value,
                            }))
                        }
                    />

                    <FilterSelect
                        label="Parent Division"
                        value={filters.parent_divisions}
                        options={filterOptions.parent_divisions.map((x) => x.label)}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                parent_divisions: value,
                            }))
                        }
                    />

                    <FilterSelect
                        label="Sub-Division"
                        value={filters.sub_divisions}
                        options={filterOptions.sub_divisions.map((x) => x.label)}
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
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                as_on_date: value,
                            }))
                        }
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
                        value={kpis.total_payables}
                        variance={kpis.total_payables_variance}
                        previousDate={kpis?.previous_date}
                        currency={currency}
                        icon="▤"
                        iconBg="#F5F9FF"
                        iconColor="#2563eb"

                    />

                    <KpiCard
                        title="Current Receivables"
                        value={kpis.current_payables}
                        variance={kpis.current_payables_variance}
                        previousDate={kpis.previous_date}
                        currency={currency}
                        icon="▣"
                        iconBg="#F3FCF6"
                        iconColor="#0e9f75"
                    />

                    <KpiCard
                        title="Overdue Receivables"
                        value={kpis.overdue_payables}
                        variance={kpis.overdue_payables_variance}
                        previousDate={kpis.previous_date}
                        currency={currency}
                        icon="⌛"
                        iconBg="#FFF9F3"
                        iconColor="#f59e0b"
                    />

                    <KpiCard
                        title="Overdue > 90 Days"
                        value={kpis.overdue_gt_90}
                        onClick={openOverdueAbove90Drilldown}
                        variance={kpis.overdue_gt_90_variance}
                        previousDate={kpis.previous_date}
                        currency={currency}
                        icon="!"
                        iconBg="#FFF7FA"
                        iconColor="#ef476f"
                    />

                    <KpiCard
                        title="DSO – Days Sales Outstanding"
                        value={kpis.dpo}
                        variance={kpis.dpo_variance}
                        previousDate={kpis.previous_date}
                        suffix="Days"
                        currency={currency}
                        icon="%"
                        iconBg="#F3FCFF"
                        iconColor="#0ea5c9"
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
                            onViewAll={() => openPayablesViewAll({ component: "Aging Summary" })}
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
                            <DonutChart
                                data={data.agingSummary}
                                total={kpis.total_payables}
                                currency={currency}
                                centerLabel="Total"
                                onSegmentClick={openAgingDrilldown}
                            />
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
                            onViewAll={() => openPayablesViewAll({ component: "Monthly Trend" })}
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
                            <TrendChart
                                data={data.trend}
                                currency={currency}
                                onPointClick={openTrendDrilldown}
                            />
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
                            onViewAll={() => openPayablesViewAll({ component: "Parent Division" })}
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
                            <ParentDivisionChart
                                data={data.parentDivision}
                                currency={currency}
                                onItemClick={openParentDivisionDrilldown}
                            />
                        </div>
                    </section>
                </div>

                {/* ==================================================
            ROW 2
            ================================================== */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 9,
                        marginBottom: 9,
                        width: "100%",
                    }}
                >
                    {/* Top 10 Customers */}

                    <section
                        style={{ ...cardStyle, padding: 12, position: "relative" }}
                    >
                        <SectionActions
                            onViewAll={() => openPayablesViewAll({ component: "Top 10 Customers" })}
                            onExportExcel={() => handleExport("excel")}
                            onExportPdf={() => handleExport("pdf")}
                        />
                        <SectionTitle>
                            Top 10 Customers by Receivables ({currency})
                        </SectionTitle>

                        <DataTable
                            columns={supplierColumns}
                            rows={data.topSuppliers}
                            fitColumns
                            compactRows
                            onCellClick={(row) => {
                                openCustomerDrilldown(row);
                            }}
                        />
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 100px 55px",
                                alignItems: "center",
                                marginTop: 7,
                                padding: "0 4px",
                                color: BLUE,
                                fontSize: 12,
                                fontWeight: 900,
                            }}
                        >
                            {/* Total */}
                            <span
                                style={{
                                    textAlign: "center",
                                }}
                            >
                                Total
                            </span>

                            {/* Amount */}
                            <span
                                style={{
                                    textAlign: "left",
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
                            onViewAll={() => openPayablesViewAll({ balance_status: "OVERDUE", component: "Overdue Summary" })}
                            onExportExcel={() => handleExport("excel")}
                            onExportPdf={() => handleExport("pdf")}
                        />
                        <SectionTitle>
                            Overdue Summary ({currency})
                        </SectionTitle>



                        <DonutChart
                            data={data.overdueSummary}
                            total={kpis.overdue_payables}
                            currency={currency}
                            centerLabel="Overdue"
                            legendBelow
                            onSegmentClick={openAgingDrilldown}
                        />
                    </section>

                    {/* Sub Division */}

                    <section
                        style={{ ...cardStyle, padding: 12, position: "relative" }}
                    >
                        <SectionActions
                            onViewAll={() => openPayablesViewAll({ component: "Sub-Division" })}
                            onExportExcel={() => handleExport("excel")}
                            onExportPdf={() => handleExport("pdf")}
                        />
                        <SectionTitle>
                            Receivables by Sub-Division ({currency})
                        </SectionTitle>

                        <DataTable
                            columns={subDivisionColumns}
                            rows={subDivisionTableRows}
                            pageSize={12}
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
                        <SectionTitle info="Monthly payable balance by legal entity">
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
                                onViewAll={() => openPayablesViewAll({ component: "Month-on-Month Receivables" })}
                                onExportExcel={() => handleExport("excel")}
                                onExportPdf={() => handleExport("pdf")}
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={monthColumns}
                        rows={data.monthOnMonth}
                        pageSize={8}
                        paginationStyle="compact"
                        onCellClick={openMomDrilldown}
                    />
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
            </main>

            {/* ======================================================
          VIEW ALL MODAL
          ====================================================== */}

            {showViewAll && (
                <PayablesViewAll
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

function PayablesViewAll({
    filters,
    data,
    currency,
    filterOptions = {},
    baseFilters = {},
    drilldown = {},
    onClose,
}) {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("total_payable");
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

    const SingleSelectDropdown = ({
        filterKey,
        label,
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

                        {/* CLEAR */}
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
                            sortKey === "total_payable" ? "total_receivables" :
                                sortKey === "overdue_payable" ? "overdue_receivables" : sortKey,
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
            key: "total_payable",
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

    /* ============================================================
       SUMMARY VALUES
    ============================================================ */

    const totalPayables = safeData.reduce(
        (sum, row) =>
            sum + Number(row.total_payable || 0),
        0
    );

    const currentPayables = safeData.reduce(
        (sum, row) =>
            sum + Number(row.current || 0),
        0
    );

    const overduePayables = safeData.reduce(
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
    }) => (
        <div
            style={{
                background: "#ffffff",
                border: "1px solid #e5eaf2",
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
                            <SingleSelectDropdown
                                filterKey="as_on_date"
                                label="As On Date"
                            />

                            {/* AGING BASIS */}
                            <SingleSelectDropdown
                                filterKey="aging_basis"
                                label="Aging Basis"
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
                                background: "#ffffff",
                                border: "1px solid #e5eaf2",
                                borderRadius: 8,
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
                            value={totalPayables}
                            iconBackground="#e5faf2"
                            iconColor="#149b6f"
                            titleColor="#149b6f"
                        />

                        <SummaryCard
                            icon="▤"
                            title="Current"
                            value={currentPayables}
                            iconBackground="#e5faf2"
                            iconColor="#149b6f"
                            titleColor="#149b6f"
                        />

                        <SummaryCard
                            icon="⌛"
                            title="Overdue"
                            value={overduePayables}
                            iconBackground="#fff2df"
                            iconColor="#ed8a17"
                            titleColor="#ed8a17"
                        />

                        <SummaryCard
                            icon="!"
                            title="Overdue > 90 Days"
                            value={overdue90}
                            iconBackground="#ffeaf0"
                            iconColor="#ed3c69"
                            titleColor="#ed3c69"
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
                                                                column.key === "total_payable"
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









































































































































































































































































































