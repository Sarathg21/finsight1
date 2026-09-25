
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    getWorkingCapitalFilterOptions,
    getWorkingCapitalKpis,
    getWorkingCapitalComponents,
    getWorkingCapitalCurrentAssets,
    getWorkingCapitalCurrentLiabilities,
    getWorkingCapitalLiquidityRatios,
    getWorkingCapitalAssetsVsLiabilities,
    getWorkingCapitalCashConversionCycle,
    getWorkingCapitalTrend,
    getWorkingCapitalCccTrend,
    getWorkingCapitalTradeTrend,
    getWorkingCapitalCurrentAssetsViewAll,
    getWorkingCapitalCurrentLiabilitiesViewAll,
    getWorkingCapitalViewAllTrend,
    getWorkingCapitalViewAllTradeWorkingCapital,
    getWorkingCapitalViewAllCcc,
    exportWorkingCapitalCurrentAssetsExcel,
    exportWorkingCapitalCurrentAssetsPdf,
    exportWorkingCapitalCurrentLiabilitiesExcel,
    exportWorkingCapitalCurrentLiabilitiesPdf,
    downloadWorkingCapitalFile,
} from "../api/workingCapital";

import {
    C,
    T,
    S,
    SHADOW,
} from "../utils/theme.js";

/* ============================================================
   HELPERS
============================================================ */

function unwrapApiResponse(response) {
    return response?.data?.data ?? response?.data ?? response ?? {};
}

function toNumber(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function formatAmount(value, currency = "", compact = true) {
    const number = toNumber(value);

    if (number === null) return "—";

    let formatted;

    if (compact) {
        const abs = Math.abs(number);

        if (abs >= 1_000_000_000) {
            formatted = `${(number / 1_000_000_000).toFixed(2)}B`;
        } else if (abs >= 1_000_000) {
            formatted = `${(number / 1_000_000).toFixed(2)}M`;
        } else if (abs >= 1_000) {
            formatted = `${(number / 1_000).toFixed(2)}K`;
        } else {
            formatted = number.toLocaleString(undefined, {
                maximumFractionDigits: 2,
            });
        }
    } else {
        formatted = number.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    return currency ? `${currency} ${formatted}` : formatted;
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getValue(obj, ...keys) {
    for (const key of keys) {
        if (obj?.[key] !== undefined && obj?.[key] !== null) {
            return obj[key];
        }
    }

    return null;
}

function getNullableValue(obj, ...keys) {
    for (const key of keys) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
            return obj[key];
        }
    }

    return undefined;
}

function getRows(payload) {
    const data = unwrapApiResponse(payload);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data?.data)) return data.data;

    return [];
}

function optionList(source) {
    if (!Array.isArray(source)) return [];

    const normalizeIds = (...values) =>
        values
            .flatMap((value) =>
                Array.isArray(value) ? value : [value]
            )
            .filter(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    value !== ""
            )
            .map((value) => String(value));

    return source
        .map((item) => {
            if (typeof item === "string" || typeof item === "number") {
                return {
                    id: String(item),
                    label: String(item),
                    legalGroupIds: [],
                    legalEntityIds: [],
                    parentDivisionIds: [],
                };
            }

            const id =
                item?.id ??
                item?.value ??
                item?.key ??
                item?.code ??
                item?.legal_group_id ??
                item?.legal_entity_id ??
                item?.parent_division_id ??
                item?.subdivision_id;

            const label =
                item?.label ??
                item?.name ??
                item?.display_name ??
                item?.legal_group_name ??
                item?.legal_entity_name ??
                item?.parent_division_name ??
                item?.subdivision_name ??
                item?.value;

            return {
                id: id == null ? "" : String(id),
                label: label == null ? "" : String(label),
                legalGroupIds: normalizeIds(
                    item?.legal_group_ids,
                    item?.legalGroupIds,
                    item?.legal_group_id,
                    item?.legalGroupId
                ),
                legalEntityIds: normalizeIds(
                    item?.legal_entity_ids,
                    item?.legalEntityIds,
                    item?.legal_entity_id,
                    item?.legalEntityId
                ),
                parentDivisionIds: normalizeIds(
                    item?.parent_division_ids,
                    item?.parentDivisionIds,
                    item?.parent_division_id,
                    item?.parentDivisionId
                ),
            };
        })
        .filter((item) => item.id && item.label);
}


function getFilterOptionsPayload(payload) {
    const data = unwrapApiResponse(payload);
    return data?.filters ?? data?.filter_options ?? data ?? {};
}

function normalizeFilterOptions(payload) {
    const data = getFilterOptionsPayload(payload);

    const rawDates =
        data.as_on_dates ??
        data.asOnDates ??
        (data.operational_as_on_date
            ? [data.operational_as_on_date]
            : []);

    const rawPeriods =
        data.balance_sheet_periods ??
        data.balanceSheetPeriods ??
        [];

    const rawAgingBases =
        data.aging_bases ??
        data.agingBases ??
        ["DUE_DATE"];

    return {
        legalGroups: optionList(
            data.legal_groups ?? data.legalGroups
        ),
        legalEntities: optionList(
            data.legal_entities ?? data.legalEntities
        ),
        parentDivisions: optionList(
            data.parent_divisions ?? data.parentDivisions
        ),
        subDivisions: optionList(
            data.subdivisions ??
            data.sub_divisions ??
            data.subDivisions
        ),
        asOnDates: Array.isArray(rawDates)
            ? rawDates
                .map((item) =>
                    typeof item === "string"
                        ? item
                        : item?.value ??
                        item?.date ??
                        item?.as_on_date
                )
                .filter(Boolean)
            : [],
        balanceSheetPeriods: Array.isArray(rawPeriods)
            ? rawPeriods
                .map((item) => ({
                    value:
                        item?.value ??
                        item?.period_name ??
                        item?.period ??
                        "",
                    label:
                        item?.label ??
                        item?.value ??
                        item?.period_name ??
                        item?.period ??
                        "",
                    periodStart:
                        item?.period_start ??
                        item?.periodStart ??
                        null,
                    periodEnd:
                        item?.period_end ??
                        item?.periodEnd ??
                        null,
                }))
                .filter((item) => item.value)
            : [],
        agingBases: Array.isArray(rawAgingBases)
            ? rawAgingBases
                .map((item) =>
                    typeof item === "string"
                        ? item
                        : item?.value ??
                        item?.code ??
                        item?.name
                )
                .filter(Boolean)
            : ["DUE_DATE"],
        reportingCurrency:
            data.reporting_currency ??
            data.reportingCurrency ??
            "",
        operationalAsOnDate:
            data.operational_as_on_date ??
            data.operationalAsOnDate ??
            "",
    };
}

function selectedIds(options, selectedValues) {
    const selected = Array.isArray(selectedValues)
        ? selectedValues
        : [];

    return options
        .filter((option) => selected.includes(option.id))
        .map((option) => option.id);
}

function buildApiFilters(filters, options) {
    const apiFilters = {
        // These remain arrays so the existing API service can serialize them
        // as repeated query parameters:
        // ?legal_entity_id=1&legal_entity_id=2&subdivision_id=15
        legal_group_id: selectedIds(
            options.legalGroups,
            filters.legalGroups
        ),
        legal_entity_id: selectedIds(
            options.legalEntities,
            filters.legalEntities
        ),
        parent_division_id: selectedIds(
            options.parentDivisions,
            filters.parentDivisions
        ),
        subdivision_id: selectedIds(
            options.subDivisions,
            filters.subDivisions
        ),

        as_on_date:
            filters.asOnDate || undefined,

        // Keep the approved backend default unless the user selects
        // another basis explicitly provided by filter-options.
        aging_basis:
            filters.agingBasis ||
            "DUE_DATE",
    };

    // period_name is supplied from the backend-provided balance sheet
    // period options. Never hardcode period values in the frontend.
    if (filters.periodName) {
        apiFilters.period_name = filters.periodName;
    }

    return apiFilters;
}

function normalizeTrendRows(payload) {
    return getRows(payload)
        .map((row) => ({
            period:
                getValue(
                    row,
                    "month",
                    "period",
                    "period_name",
                    "label"
                ) ?? "—",
            value: toNumber(
                getValue(
                    row,
                    "net_working_capital",
                    "nwc",
                    "working_capital",
                    "value"
                )
            ),
            ratio: toNumber(
                getValue(row, "current_ratio", "ratio")
            ),
        }))
        .filter((row) => row.value !== null);
}

function normalizeTradeTrendRows(payload) {
    return getRows(payload)
        .map((row) => ({
            period:
                getValue(
                    row,
                    "month",
                    "period",
                    "period_name",
                    "label"
                ) ?? "—",
            value: toNumber(
                getValue(
                    row,
                    "trade_working_capital",
                    "trade_working_capital_value",
                    "working_capital",
                    "value"
                )
            ),
        }))
        .filter((row) => row.value !== null);
}

function normalizeCccTrendRows(payload) {
    return getRows(payload)
        .map((row) => ({
            period:
                getValue(
                    row,
                    "month_label",
                    "month",
                    "period",
                    "period_name",
                    "label"
                ) ?? "—",
            dso: toNumber(
                getValue(row, "dso_days", "dso")
            ),
            dio: toNumber(
                getValue(row, "dio_days", "dio")
            ),
            dpo: toNumber(
                getValue(row, "dpo_days", "dpo")
            ),
            // IMPORTANT:
            // CCC is always taken directly from the backend response.
            // Never derive CCC in the frontend from DSO + DIO - DPO.
            ccc: toNumber(
                getValue(
                    row,
                    "cash_conversion_cycle_days",
                    "ccc_days",
                    "ccc",
                    "value"
                )
            ),
            status:
                getValue(
                    row,
                    "status",
                    "ccc_status"
                ) ?? null,
        }))
        .filter(
            (row) =>
                row.dso !== null ||
                row.dio !== null ||
                row.dpo !== null ||
                row.ccc !== null ||
                row.status !== null
        );
}

function normalizeBreakdownRows(payload) {
    return getRows(payload).map((row) => ({
        key:
            getValue(row, "key") ?? null,
        particular:
            getValue(
                row,
                "label",
                "category",
                "name",
                "particular"
            ) ?? "—",
        // Dashboard APIs return the amount in `value`.
        // View-All APIs may return it as `amount`.
        amount: toNumber(
            getValue(row, "value", "amount", "current")
        ),
        // Current Assets / Current Liabilities dashboard responses do not
        // currently return percentage_of_total. Keep it null rather than
        // calculating a new frontend value. View-All responses can still
        // provide percentage_of_total when available.
        percentage: toNumber(
            getValue(
                row,
                "percentage_of_total",
                "percentage"
            )
        ),
        sourceAccountCodes:
            getValue(row, "source_account_codes") ?? [],
        period:
            getValue(row, "period", "period_name") ?? "—",
        periodEnd:
            getValue(row, "period_end") ?? null,
    }));
}

function normalizeCurrentRatio(payload) {
    const rows = getRows(payload);
    const ratioRow = rows.find((row) => {
        const key = String(
            getValue(row, "key", "ratio_key") ?? ""
        ).toLowerCase();
        const label = String(
            getValue(row, "label", "name", "category") ?? ""
        ).toLowerCase();

        return (
            key === "current_ratio" ||
            label === "current ratio"
        );
    });

    if (!ratioRow) return null;

    return toNumber(
        getValue(
            ratioRow,
            "current",
            "value",
            "ratio"
        )
    );
}

/* ============================================================
   STYLES
============================================================ */

const styles = {
    page: {
        minHeight: "100%",
        background: "var(--clr-bg)",
        color: C.navy,
        padding: "24px 0 36px",
        boxSizing: "border-box",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: S.cardGap,
        marginBottom: "22px",
        flexWrap: "wrap",
    },
    title: {
        ...T.pageTitle,
        margin: 0,
        color: C.navy,
    },
    subtitle: {
        margin: "3px 0 0",
        color: C.slate,
        fontSize: "0.78rem",
        lineHeight: 1.45,
    },
    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "flex-end",
    },
    button: {
        height: "32px",
        padding: "0 12px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--clr-border-strong)",
        background: "var(--clr-surface)",
        color: C.slate,
        fontSize: "0.70rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all var(--tr-fast)",
        boxShadow: SHADOW.card,
    },
    filterContainer: {
        background: "var(--clr-surface)",
        border: "1px solid var(--clr-border-strong)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        display: "grid",
        gridTemplateColumns: "repeat(10, minmax(82px, 1fr))",
        gap: "10px 6px",
        alignItems: "end",
        marginBottom: "16px",
        boxShadow: SHADOW.card,
        overflow: "visible",
        width: "100%",
        boxSizing: "border-box",
    },
    filterLabel: {
        display: "block",
        color: "#173575",
        fontSize: "0.74rem",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        marginBottom: "4px",
        lineHeight: 1.2,
    },
    filterInput: {
        width: "100%",
        minHeight: "32px",
        border: "1px solid var(--clr-border-strong)",
        borderRadius: "var(--radius-sm)",
        background: "var(--clr-surface)",
        color: C.slate,
        fontSize: "0.78rem",
        padding: "6px 10px",
        outline: "none",
        boxSizing: "border-box",
        transition: "all var(--tr-fast)",
    },
    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        gap: S.cardGap,
        marginBottom: S.pageGap,
        alignItems: "stretch",
    },
    card: {
        background: "var(--clr-surface)",
        border: "none",
        borderRadius: "var(--radius-md)",
        minHeight: "84px",
        padding: S.cardPad,
        boxSizing: "border-box",
        boxShadow: SHADOW.card,
        overflow: "hidden",
        position: "relative",
        transition: "transform var(--tr-base), box-shadow var(--tr-base)",
    },
    panel: {
        background: "var(--clr-surface)",
        border: "1px solid var(--clr-border-strong)",
        borderRadius: "var(--radius-lg)",
        padding: S.cardPad,
        boxSizing: "border-box",
        overflow: "hidden",
        boxShadow: SHADOW.card,
    },
    panelTitle: {
        ...T.sectionTitle,
        color: C.navy,
        fontSize: "0.88rem",
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
        margin: "0 0 0",
        fontWeight: 800,
    },
};


const workingCapitalFilterResponsiveCss = `.wc-sales-page .wc-sales-kpis {
    grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
    gap: 10px !important;
    align-items: stretch;
}

.wc-sales-page .wc-filter-grid {
    grid-template-columns: repeat(10, minmax(82px, 1fr)) !important;
    gap: 10px 6px !important;
    align-items: end !important;
}

.wc-sales-page .wc-filter-grid > button {
    align-self: end;
}

.wc-sales-page .wc-filter-grid button,
.wc-sales-page .wc-filter-grid select,
.wc-sales-page .wc-filter-grid input {
    font-size: 0.76rem !important;
}

.wc-sales-page {
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    color: #1e293b;
}
.wc-sales-page .wc-page-title {
    display: flex;
    align-items: center;
    gap: 4px;
}
.wc-sales-page .kpi-grid {
    margin-bottom: var(--section-gap);
}

.wc-filter-grid {
    width: 100%;
}
@media (max-width: 1250px) {
    .wc-filter-grid {
        grid-template-columns: repeat(3, minmax(145px, 1fr)) !important;
    }
}
@media (max-width: 900px) {
    .wc-filter-grid {
        grid-template-columns: repeat(2, minmax(145px, 1fr)) !important;
    }
}
@media (max-width: 600px) {
    .wc-filter-grid {
        grid-template-columns: 1fr !important;
    }
}
`;

/* ============================================================
   SMALL COMPONENTS
============================================================ */



function PageSkeleton() {
    return (
        <div
            className="wc-page-skeleton"
            aria-label="Loading Working Capital Report"
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                    gap: "16px",
                    marginBottom: "16px",
                }}
            >
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.card,
                            minHeight: "84px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div
                                className="wc-skeleton-line"
                                style={{
                                    width: 34,
                                    minWidth: 34,
                                    height: 34,
                                    borderRadius: "50%",
                                    margin: 0,
                                }}
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div className="wc-skeleton-line" style={{ width: "58%", height: 7 }} />
                                <div className="wc-skeleton-line" style={{ width: "82%", height: 15, marginTop: 7 }} />
                                <div className="wc-skeleton-line" style={{ width: "66%", height: 6, marginTop: 6 }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "10px",
                    marginBottom: "10px",
                }}
            >
                {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} style={{ ...styles.panel, minHeight: 255 }}>
                        <div className="wc-skeleton-line" style={{ width: "45%", height: 12 }} />
                        <div className="wc-skeleton-chart" />
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "10px",
                    marginBottom: "10px",
                }}
            >
                {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} style={{ ...styles.panel, minHeight: 255 }}>
                        <div className="wc-skeleton-line" style={{ width: "48%", height: 12 }} />
                        <div className="wc-skeleton-chart" />
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.08fr 1.08fr .92fr",
                    gap: "10px",
                }}
            >
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} style={{ ...styles.panel, minHeight: 210 }}>
                        <div className="wc-skeleton-line" style={{ width: "52%", height: 12 }} />
                        {Array.from({ length: 5 }).map((__, row) => (
                            <div
                                key={row}
                                className="wc-skeleton-line"
                                style={{
                                    width: row === 4 ? "86%" : "96%",
                                    height: 7,
                                    marginTop: row === 0 ? 20 : 12,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function KpiCard({ title, value, subtitle, icon }) {
    const palettes = {
        "Trade Working Capital": {
            bg: "#EEF4FF",
            iconBg: "#DCE9FF",
            accent: "#2563EB",
        },
        "Net Working Capital": {
            bg: "#EEF2FF",
            iconBg: "#DCE3FF",
            accent: "#4F46E5",
        },
        "Current Assets": {
            bg: "#ECFDF3",
            iconBg: "#D9F7E5",
            accent: "#16A34A",
        },
        "Current Liabilities": {
            bg: "#F5F1FF",
            iconBg: "#E9DEFF",
            accent: "#7C3AED",
        },
        "Current Ratio": {
            bg: "#FFF6E8",
            iconBg: "#FFE8C2",
            accent: "#EA8A00",
        },
        "DSO": {
            bg: "#ECFBFF",
            iconBg: "#D5F3FA",
            accent: "#0891B2",
        },
        "DIO": {
            bg: "#F0FDF4",
            iconBg: "#DCFCE7",
            accent: "#16A34A",
        },
        "DPO": {
            bg: "#FFF1F2",
            iconBg: "#FFE0E4",
            accent: "#DC2626",
        },
        "CCC": {
            bg: "#FDF2F8",
            iconBg: "#FCE0EE",
            accent: "#DB2777",
        },
    };

    const palette = palettes[title] || {
        bg: "#EEF2FF",
        iconBg: "#DCE3FF",
        accent: "#4F46E5",
    };

    const [hover, setHover] = useState(false);

    const isInsufficientHistory =
        (title === "DIO" || title === "CCC") &&
        value === "—";

    return (
        <div
            style={{
                ...styles.card,
                background: palette.bg,
                transform: hover ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hover
                    ? `0 8px 18px ${palette.accent}22`
                    : "0 2px 6px rgba(0,0,0,0.04)",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    height: "100%",
                    minWidth: 0,
                }}
            >
                <div
                    style={{
                        width: "34px",
                        height: "34px",
                        minWidth: "34px",
                        borderRadius: "50%",
                        background: palette.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: palette.accent,
                        fontSize: "16px",
                        fontWeight: 800,
                        boxShadow: "0 1px 2px rgba(15,23,42,.04)",
                    }}
                >
                    {icon}
                </div>

                <div
                    style={{
                        minWidth: 0,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: "2px",
                    }}
                >
                    <div
                        style={{
                            color: palette.accent,
                            fontSize: "0.68rem",
                            lineHeight: 1.15,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                        title={title}
                    >
                        {title}
                    </div>

                    <div
                        style={{
                            color: "#0F172A",
                            fontSize: "1.02rem",
                            lineHeight: 1.05,
                            fontWeight: 800,
                            letterSpacing: "-0.02em",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                        title={String(value)}
                    >
                        {value}
                    </div>

                    {subtitle && (
                        <div
                            style={{
                                alignSelf: "flex-start",
                                maxWidth: "100%",
                                marginTop: "2px",
                                padding: "2px 6px",
                                borderRadius: "5px",
                                background: "rgba(255,255,255,.58)",
                                color: isInsufficientHistory
                                    ? "#64748B"
                                    : "#64748B",
                                fontSize: "0.58rem",
                                lineHeight: 1.15,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                            title={subtitle}
                        >
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function escapeSpreadsheetXml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function exportTrendToExcel(data, title, currency, metricLabel) {
    const rows = Array.isArray(data) ? data : [];

    const xmlRows = rows
        .map((row) => `
            <Row>
                <Cell><Data ss:Type="String">${escapeSpreadsheetXml(row.period)}</Data></Cell>
                <Cell><Data ss:Type="Number">${Number(toNumber(row.value) ?? 0)}</Data></Cell>
                <Cell><Data ss:Type="String">${escapeSpreadsheetXml(currency || "")}</Data></Cell>
            </Row>
        `)
        .join("");

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="Trend">
        <Table>
            <Row>
                <Cell><Data ss:Type="String">Period</Data></Cell>
                <Cell><Data ss:Type="String">${escapeSpreadsheetXml(metricLabel)}</Data></Cell>
                <Cell><Data ss:Type="String">Currency</Data></Cell>
            </Row>
            ${xmlRows}
        </Table>
    </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], {
        type: "application/vnd.ms-excel",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${String(title || "working-capital-trend")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase()}.xls`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function exportTrendToPdf(data, title, currency, metricLabel) {
    const rows = Array.isArray(data) ? data : [];

    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
        window.alert("Please allow pop-ups to export the chart as PDF.");
        return;
    }

    const tableRows = rows
        .map(
            (row) => `
                <tr>
                    <td>${escapeSpreadsheetXml(row.period)}</td>
                    <td style="text-align:right;font-weight:700;">
                        ${escapeSpreadsheetXml(
                formatAmount(row.value, currency, true)
            )}
                    </td>
                </tr>
            `
        )
        .join("");

    popup.document.write(`
        <!doctype html>
        <html>
        <head>
            <title>${escapeSpreadsheetXml(title)}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #0F172A;
                    padding: 32px;
                }
                h1 {
                    margin: 0 0 6px;
                    font-size: 20px;
                }
                p {
                    margin: 0 0 18px;
                    color: #64748B;
                    font-size: 12px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }
                th {
                    background: #EEF2FF;
                    color: #1E3A8A;
                    text-align: left;
                    padding: 9px 10px;
                    border-bottom: 2px solid #CBD5E1;
                }
                td {
                    padding: 9px 10px;
                    border-bottom: 1px solid #E2E8F0;
                }
                .footer {
                    margin-top: 18px;
                    color: #94A3B8;
                    font-size: 10px;
                }
            </style>
        </head>
        <body>
            <h1>${escapeSpreadsheetXml(title)}</h1>
            <p>${escapeSpreadsheetXml(metricLabel)} · Currency: ${escapeSpreadsheetXml(currency || "—")}</p>
            <table>
                <thead>
                    <tr>
                        <th>Period</th>
                        <th>${escapeSpreadsheetXml(metricLabel)}</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
            <div class="footer">Working Capital Report</div>
        </body>
        </html>
    `);

    popup.document.close();
    popup.focus();
    setTimeout(() => {
        popup.print();
    }, 250);
}

function SimpleTrendChart({
    data,
    currency,
    title,
    valueLabel,
    metricLabel = "Net Working Capital",
    nullText = "No data",
    onViewAll,
    onExportExcel,
    onExportPdf,
}) {
    const width = 640;
    const height = 245;
    const left = 52;
    const right = 26;
    const top = 28;
    const bottom = 50;

    const visibleData = Array.isArray(data) ? data : [];
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const values = visibleData
        .map((item) => toNumber(item.value))
        .filter((value) => value !== null);

    const chartGradientId = `wc-trend-line-${String(title || "chart")
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase()}`;
    const areaGradientId = `${chartGradientId}-area`;

    if (!values.length) {
        return (
            <div className="wc-panel-animate" style={styles.panel}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <h3 style={{ ...styles.panelTitle, marginBottom: 0 }}>
                        {title}
                    </h3>
                    <ActionMenu
                        items={[
                            {
                                key: "view-all",
                                label: "🔎 View All",
                                onClick: onViewAll,
                            },
                            {
                                key: "excel",
                                label: "📊 Export Excel",
                                onClick: onExportExcel,
                            },
                            {
                                key: "pdf",
                                label: "📄 Export PDF",
                                onClick: onExportPdf,
                            },
                        ]}
                    />
                </div>
                <div
                    style={{
                        color: "#98A2B3",
                        fontSize: "10px",
                        padding: "34px 0",
                    }}
                >
                    {nullText}
                </div>
            </div>
        );
    }

    const minValue = Math.min(...values, 0);
    const maxValue = Math.max(...values, 1);
    const range = maxValue === minValue ? 1 : maxValue - minValue;

    const xFor = (index) =>
        visibleData.length <= 1
            ? (left + width - right) / 2
            : left +
            (index / (visibleData.length - 1)) *
            (width - left - right);

    const yFor = (value) =>
        top +
        ((maxValue - value) / range) *
        (height - top - bottom);

    const pointPairs = visibleData
        .map((item, index) => {
            const value = toNumber(item.value);
            return value === null
                ? null
                : {
                    x: xFor(index),
                    y: yFor(value),
                    value,
                    period: item.period,
                    index,
                };
        })
        .filter(Boolean);

    const points = pointPairs
        .map((point) => `${point.x},${point.y}`)
        .join(" ");

    const firstPoint = pointPairs[0];
    const lastPoint = pointPairs[pointPairs.length - 1];
    const baselineY = height - bottom;

    const areaPoints = firstPoint && lastPoint
        ? `${firstPoint.x},${baselineY} ${points} ${lastPoint.x},${baselineY}`
        : "";

    const hoveredPoint =
        hoveredIndex === null
            ? null
            : pointPairs.find(
                (point) => point.index === hoveredIndex
            ) || null;

    const tooltipWidth = 220;
    const tooltipHeight = 82;
    const tooltipX = hoveredPoint
        ? Math.min(
            Math.max(
                hoveredPoint.x - tooltipWidth / 2,
                left + 4
            ),
            width - right - tooltipWidth
        )
        : 0;
    const tooltipY = hoveredPoint
        ? Math.max(
            top + 4,
            hoveredPoint.y - tooltipHeight - 12
        )
        : 0;

    const menuItems = [
        {
            key: "view-all",
            label: "🔎 View All",
            onClick: onViewAll,
        },
        {
            key: "excel",
            label: "📊 Export Excel",
            onClick: onExportExcel,
        },
        {
            key: "pdf",
            label: "📄 Export PDF",
            onClick: onExportPdf,
        },
    ];

    return (
        <div
            className="wc-panel-animate wc-trend-panel"
            style={{
                ...styles.panel,
                position: "relative",
                overflow: "visible",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                }}
            >
                <div style={{ minWidth: 0 }}>
                    <h3
                        style={{
                            ...styles.panelTitle,
                            marginBottom: 2,
                        }}
                    >
                        {title}
                    </h3>
                    <div
                        style={{
                            fontSize: "0.68rem",
                            color: C.muted,
                            fontWeight: 500,
                            marginTop: 2,
                        }}
                    >
                        {currency} — monthly available observations
                    </div>
                </div>

                <ActionMenu items={menuItems} />
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                    marginBottom: 2,
                    fontSize: "10px",
                    color: "#334155",
                }}
            >
                <span
                    style={{
                        width: 18,
                        height: 3,
                        borderRadius: 99,
                        background: "#4F46E5",
                        boxShadow: "0 0 7px rgba(79,70,229,.28)",
                    }}
                />
                <span>{metricLabel}</span>
                {valueLabel ? (
                    <span style={{ marginLeft: 3, color: "#94A3B8" }}>
                        {valueLabel}
                    </span>
                ) : null}
            </div>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                style={{
                    display: "block",
                    overflow: "visible",
                }}
                onMouseLeave={() => setHoveredIndex(null)}
            >
                <defs>
                    <linearGradient
                        id={chartGradientId}
                        x1="0"
                        x2="1"
                        y1="0"
                        y2="0"
                    >
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="50%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>

                    <linearGradient
                        id={areaGradientId}
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="#6366F1"
                            stopOpacity="0.20"
                        />
                        <stop
                            offset="100%"
                            stopColor="#6366F1"
                            stopOpacity="0.015"
                        />
                    </linearGradient>

                    <filter
                        id={`${chartGradientId}-shadow`}
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        <feDropShadow
                            dx="0"
                            dy="2"
                            stdDeviation="2.5"
                            floodColor="#4F46E5"
                            floodOpacity="0.20"
                        />
                    </filter>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map(
                    (fraction) => {
                        const value =
                            maxValue - fraction * range;
                        const y = yFor(value);

                        return (
                            <g key={fraction}>
                                <line
                                    x1={left}
                                    x2={width - right}
                                    y1={y}
                                    y2={y}
                                    stroke="#E2E8F0"
                                    strokeWidth="1"
                                    strokeDasharray={
                                        fraction === 0
                                            ? "0"
                                            : "3 4"
                                    }
                                />
                                <text
                                    x={left - 8}
                                    y={y + 3}
                                    textAnchor="end"
                                    fontSize="10"
                                    fontWeight="700"
                                    fill="#64748B"
                                >
                                    {formatAmount(
                                        value,
                                        "",
                                        true
                                    )}
                                </text>
                            </g>
                        );
                    }
                )}

                {areaPoints && (
                    <polygon
                        points={areaPoints}
                        fill={`url(#${areaGradientId})`}
                        style={{
                            transition: "opacity .2s ease",
                        }}
                    />
                )}

                {hoveredPoint && (
                    <line
                        x1={hoveredPoint.x}
                        x2={hoveredPoint.x}
                        y1={top}
                        y2={baselineY}
                        stroke="#94A3B8"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.65"
                        pointerEvents="none"
                    />
                )}

                <polyline
                    points={points}
                    fill="none"
                    stroke={`url(#${chartGradientId})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#${chartGradientId}-shadow)`}
                    style={{
                        strokeDasharray: 1400,
                        strokeDashoffset: 1400,
                        animation:
                            "wcTrendDraw 1.15s cubic-bezier(.22,.61,.36,1) forwards",
                    }}
                />

                {pointPairs.map((point) => {
                    const isHovered =
                        hoveredIndex === point.index;

                    return (
                        <g
                            key={`${point.period}-${point.index}`}
                            onMouseEnter={() =>
                                setHoveredIndex(
                                    point.index
                                )
                            }
                            style={{
                                cursor: "pointer",
                            }}
                        >
                            {isHovered && (
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="9"
                                    fill="#6366F1"
                                    opacity="0.12"
                                />
                            )}

                            <circle
                                cx={point.x}
                                cy={point.y}
                                r={isHovered ? 5.5 : 4}
                                fill="#FFFFFF"
                                stroke="#4F46E5"
                                strokeWidth={
                                    isHovered ? 3 : 2.5
                                }
                                style={{
                                    transition:
                                        "r .15s ease, stroke-width .15s ease",
                                    filter:
                                        "drop-shadow(0 2px 3px rgba(79,70,229,.20))",
                                }}
                            />

                            <text
                                x={point.x}
                                y={point.y - 12}
                                textAnchor="middle"
                                fontSize={
                                    isHovered ? "11" : "10"
                                }
                                fontWeight="800"
                                fill="#1E293B"
                                style={{
                                    transition:
                                        "font-size .15s ease",
                                }}
                            >
                                {formatAmount(
                                    point.value,
                                    "",
                                    true
                                )}
                            </text>

                            <text
                                x={point.x}
                                y={height - 15}
                                textAnchor="middle"
                                fontSize="10"
                                fontWeight={
                                    isHovered ? "700" : "500"
                                }
                                fill={
                                    isHovered
                                        ? "#1E3A8A"
                                        : "#64748B"
                                }
                            >
                                {String(point.period)}
                            </text>
                        </g>
                    );
                })}

                {hoveredPoint && (
                    <g
                        pointerEvents="none"
                        style={{
                            filter: "drop-shadow(0 6px 14px rgba(15,23,42,.12))",
                            animation: "wcTooltipIn .14s ease-out forwards",
                        }}
                    >
                        <rect
                            x={tooltipX}
                            y={tooltipY}
                            width={tooltipWidth}
                            height={tooltipHeight}
                            rx="8"
                            fill="#FFFFFF"
                            stroke="#DCE3EE"
                            strokeWidth="1"
                            filter={`drop-shadow(0 6px 14px rgba(15,23,42,.12))`}
                        />
                        <circle
                            cx={tooltipX + 12}
                            cy={tooltipY + 14}
                            r="5"
                            fill="#4F46E5"
                        />
                        <text
                            x={tooltipX + 22}
                            y={tooltipY + 17}
                            fontSize="13"
                            fontWeight="800"
                            fill="#1E1B4B"
                        >
                            {String(hoveredPoint.period)}
                        </text>
                        <text
                            x={tooltipX + 11}
                            y={tooltipY + 38}
                            fontSize="12"
                            fontWeight="600"
                            fill="#64748B"
                        >
                            Amount
                        </text>
                        <text
                            x={tooltipX + tooltipWidth - 10}
                            y={tooltipY + 38}
                            textAnchor="end"
                            fontSize="15"
                            fontWeight="800"
                            fill="#4F46E5"
                        >
                            {formatAmount(
                                hoveredPoint.value,
                                currency,
                                true
                            )}
                        </text>
                    </g>
                )}
            </svg>
        </div>
    );
}

function exportWorkingCapitalAllToExcel(payload, currency) {
    const sections = [
        ["KPIs", payload.kpisRows || []],
        ["Working Capital Trend", payload.trend || []],
        ["Trade Working Capital Trend", payload.tradeTrend || []],
        ["Components", payload.componentsRows || []],
        ["Current Assets", payload.assetRows || []],
        ["Current Liabilities", payload.liabilityRows || []],
        ["Assets vs Liabilities", payload.avlRows || []],
        ["CCC Trend", payload.cccTrend || []],
    ];
    const worksheets = sections.map(([name, rows]) => {
        const safe = Array.isArray(rows) ? rows : [];
        const keys = safe.length ? Object.keys(safe[0]) : ["value"];
        const header = `<Row>${keys.map((k) => `<Cell><Data ss:Type="String">${escapeSpreadsheetXml(k)}</Data></Cell>`).join("")}</Row>`;
        const body = safe.map((row) => `<Row>${keys.map((k) => { const v = row?.[k]; const n = toNumber(v); return n !== null && typeof v !== "string" ? `<Cell><Data ss:Type="Number">${n}</Data></Cell>` : `<Cell><Data ss:Type="String">${escapeSpreadsheetXml(v ?? "—")}</Data></Cell>`; }).join("")}</Row>`).join("");
        return `<Worksheet ss:Name="${escapeSpreadsheetXml(name.slice(0, 31))}"><Table>${header}${body}</Table></Worksheet>`;
    }).join("");
    const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${worksheets}</Workbook>`;
    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `working-capital-report-${currency || "reporting-currency"}.xls`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function exportWorkingCapitalAllToPdf(payload, currency) {
    const popup = window.open("", "_blank", "width=1100,height=800");
    if (!popup) { window.alert("Please allow pop-ups to export Working Capital as PDF."); return; }
    const sections = [
        ["Working Capital KPIs", payload.kpisRows || []],
        ["Working Capital Trend", payload.trend || []],
        ["Trade Working Capital Trend", payload.tradeTrend || []],
        ["Working Capital Components", payload.componentsRows || []],
        ["Current Assets Breakdown", payload.assetRows || []],
        ["Current Liabilities Breakdown", payload.liabilityRows || []],
        ["Current Assets vs Current Liabilities", payload.avlRows || []],
        ["Cash Conversion Cycle Trend", payload.cccTrend || []],
    ];
    const sectionHtml = sections.map(([title, rows]) => { const safe = Array.isArray(rows) ? rows : []; if (!safe.length) return `<section><h2>${escapeSpreadsheetXml(title)}</h2><p>No data available.</p></section>`; const keys = Object.keys(safe[0]); return `<section><h2>${escapeSpreadsheetXml(title)}</h2><table><thead><tr>${keys.map(k => `<th>${escapeSpreadsheetXml(k)}</th>`).join("")}</tr></thead><tbody>${safe.map(row => `<tr>${keys.map(k => `<td>${escapeSpreadsheetXml(row?.[k] ?? "—")}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`; }).join("");
    popup.document.write(`<!doctype html><html><head><title>Working Capital Report</title><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');body{font-family:Inter,Arial,sans-serif;color:#0F172A;padding:28px}h1{font-size:22px;margin:0 0 5px;font-weight:800}p.meta{color:#64748B;font-size:11px;margin:0 0 20px}section{margin-bottom:24px;break-inside:avoid}h2{font-size:14px;color:#173575;margin:0 0 8px}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#F1F5F9;color:#173575;text-align:left;padding:7px;border-bottom:2px solid #CBD5E1}td{padding:7px;border-bottom:1px solid #E2E8F0}td:not(:first-child){text-align:right}@media print{section{break-inside:avoid}}</style></head><body><h1>Working Capital Report</h1><p class="meta">Reporting currency: ${escapeSpreadsheetXml(currency || "—")} · Exported from current loaded dashboard data</p>${sectionHtml}</body></html>`);
    popup.document.close(); popup.focus(); setTimeout(() => popup.print(), 300);
}

function exportCccTrendToExcel(data) {
    const rows = Array.isArray(data) ? data : [];
    const xmlRows = rows.map((row) => `
        <Row>
            <Cell><Data ss:Type="String">${escapeSpreadsheetXml(row.period)}</Data></Cell>
            <Cell><Data ss:Type="String">${row.dso === null ? "—" : Number(row.dso)}</Data></Cell>
            <Cell><Data ss:Type="String">${row.dio === null ? "—" : Number(row.dio)}</Data></Cell>
            <Cell><Data ss:Type="String">${row.dpo === null ? "—" : Number(row.dpo)}</Data></Cell>
            <Cell><Data ss:Type="String">${row.ccc === null ? "—" : Number(row.ccc)}</Data></Cell>
            <Cell><Data ss:Type="String">${escapeSpreadsheetXml(row.status || "")}</Data></Cell>
        </Row>
    `).join("");

    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="CCC Trend">
        <Table>
            <Row>
                <Cell><Data ss:Type="String">Period</Data></Cell>
                <Cell><Data ss:Type="String">DSO (Days)</Data></Cell>
                <Cell><Data ss:Type="String">DIO (Days)</Data></Cell>
                <Cell><Data ss:Type="String">DPO (Days)</Data></Cell>
                <Cell><Data ss:Type="String">CCC (Days)</Data></Cell>
                <Cell><Data ss:Type="String">Status</Data></Cell>
            </Row>
            ${xmlRows}
        </Table>
    </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "working-capital-cash-conversion-cycle-trend.xls";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function exportCccTrendToPdf(data) {
    const rows = Array.isArray(data) ? data : [];
    const popup = window.open("", "_blank", "width=1000,height=750");

    if (!popup) {
        window.alert("Please allow pop-ups to export the Cash Conversion Cycle Trend as PDF.");
        return;
    }

    const tableRows = rows.map((row) => `
        <tr>
            <td>${escapeSpreadsheetXml(row.period)}</td>
            <td>${row.dso === null ? "—" : Number(row.dso).toFixed(2)}</td>
            <td>${row.dio === null ? "—" : Number(row.dio).toFixed(2)}</td>
            <td>${row.dpo === null ? "—" : Number(row.dpo).toFixed(2)}</td>
            <td>${row.ccc === null ? "—" : Number(row.ccc).toFixed(2)}</td>
            <td>${escapeSpreadsheetXml(row.status === "INSUFFICIENT_INVENTORY_HISTORY" ? "Insufficient inventory history" : row.status || "")}</td>
        </tr>
    `).join("");

    popup.document.write(`
        <!doctype html>
        <html>
        <head>
            <title>Cash Conversion Cycle Trend (Days)</title>
            <style>
                body { font-family: Arial, sans-serif; color: #0F172A; padding: 32px; }
                h1 { margin: 0 0 6px; font-size: 20px; }
                p { margin: 0 0 18px; color: #64748B; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th { background: #EEF2FF; color: #1E3A8A; text-align: left; padding: 9px 10px; border-bottom: 2px solid #CBD5E1; }
                td { padding: 9px 10px; border-bottom: 1px solid #E2E8F0; }
                .note { margin-top: 18px; color: #64748B; font-size: 10px; }
            </style>
        </head>
        <body>
            <h1>Cash Conversion Cycle Trend (Days)</h1>
            <p>Backend values · CCC is not calculated in the frontend</p>
            <table>
                <thead>
                    <tr><th>Period</th><th>DSO (Days)</th><th>DIO (Days)</th><th>DPO (Days)</th><th>CCC (Days)</th><th>Status</th></tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
            <div class="note">DIO and CCC require sufficient inventory history when the backend returns insufficient history.</div>
        </body>
        </html>
    `);
    popup.document.close();
    popup.focus();
    setTimeout(() => popup.print(), 250);
}

function exportLiquidityRatioToExcel(value, period) {
    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="Liquidity Ratio">
        <Table>
            <Row>
                <Cell><Data ss:Type="String">Period</Data></Cell>
                <Cell><Data ss:Type="String">Particulars</Data></Cell>
                <Cell><Data ss:Type="String">Value</Data></Cell>
            </Row>
            <Row>
                <Cell><Data ss:Type="String">${escapeSpreadsheetXml(period || "")}</Data></Cell>
                <Cell><Data ss:Type="String">Current Ratio</Data></Cell>
                <Cell><Data ss:Type="Number">${Number(toNumber(value) ?? 0)}</Data></Cell>
            </Row>
        </Table>
    </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], {
        type: "application/vnd.ms-excel",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "working-capital-key-liquidity-ratio.xls";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function exportLiquidityRatioToPdf(value, period) {
    const popup = window.open(
        "",
        "_blank",
        "width=900,height=700"
    );

    if (!popup) {
        window.alert(
            "Please allow pop-ups to export the Key Liquidity Ratio as PDF."
        );
        return;
    }

    popup.document.write(`
        <!doctype html>
        <html>
        <head>
            <title>Key Liquidity Ratio</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #0F172A;
                    padding: 32px;
                }
                h1 {
                    margin: 0 0 6px;
                    font-size: 20px;
                }
                p {
                    margin: 0 0 18px;
                    color: #64748B;
                    font-size: 12px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }
                th {
                    background: #EEF2FF;
                    color: #1E3A8A;
                    text-align: left;
                    padding: 9px 10px;
                    border-bottom: 2px solid #CBD5E1;
                }
                td {
                    padding: 9px 10px;
                    border-bottom: 1px solid #E2E8F0;
                }
                td:last-child, th:last-child {
                    text-align: right;
                }
            </style>
        </head>
        <body>
            <h1>Key Liquidity Ratio</h1>
            <p>Period: ${escapeSpreadsheetXml(period || "—")}</p>
            <table>
                <thead>
                    <tr>
                        <th>Particulars</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Current Ratio</td>
                        <td>${escapeSpreadsheetXml(
        toNumber(value) === null
            ? "—"
            : toNumber(value).toFixed(2)
    )}</td>
                    </tr>
                </tbody>
            </table>
        </body>
        </html>
    `);

    popup.document.close();
    popup.focus();

    setTimeout(() => {
        popup.print();
    }, 250);
}

function BreakdownTable({
    title,
    rows,
    total,
    currency,
    period,
    periodEnd,
    onViewAll,
    onExportExcel,
    onExportPdf,
}) {
    const hasPercentages = rows.some(
        (row) => row.percentage !== null
    );

    return (
        <div
            className="wc-panel-animate"
            style={{
                ...styles.panel,
                display: "flex",
                flexDirection: "column",
                minHeight: "320px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                }}
            >
                <h3
                    style={{
                        ...styles.panelTitle,
                        marginBottom: 0,
                    }}
                >
                    {title}
                </h3>

                <ActionMenu
                    items={[
                        {
                            key: "view-all",
                            label: "🔎 View All",
                            onClick: onViewAll,
                        },
                        {
                            key: "excel",
                            label: "📊 Export Excel",
                            onClick: onExportExcel,
                        },
                        {
                            key: "pdf",
                            label: "📄 Export PDF",
                            onClick: onExportPdf,
                        },
                    ]}
                />
            </div>

            <div
                style={{
                    color: C.muted,
                    fontSize: "0.68rem",
                    marginBottom: "8px",
                    fontWeight: 600,
                }}
            >
                {period
                    ? `Period: ${period}`
                    : "Period: —"}
                {periodEnd
                    ? ` (${formatDate(periodEnd)})`
                    : ""}
            </div>

            <div
                style={{
                    overflowX: "auto",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <table
                    className="wc-sales-data-table wc-breakdown-sales-table"
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
                        fontSize: "0.80rem",
                        minWidth: hasPercentages ? "320px" : "280px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <thead
                        style={{
                            display: "block",
                            width: "100%",
                        }}
                    >
                        <tr
                            style={{
                                background: "#F8FAFC",
                                color: "#1E3A8A",
                                display: "grid",
                                gridTemplateColumns: hasPercentages ? "1.4fr 1fr 0.7fr" : "1.6fr 1fr",
                            }}
                        >
                            <th
                                style={{
                                    padding: "8px 10px",
                                    textAlign: "left",
                                    fontSize: "0.74rem",
                                    fontWeight: 700,
                                }}
                            >
                                Particulars
                            </th>

                            <th
                                style={{
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontSize: "0.74rem",
                                    fontWeight: 700,
                                }}
                            >
                                Amount
                            </th>

                            {hasPercentages && (
                                <th
                                    style={{
                                        padding: "8px 10px",
                                        textAlign: "right",
                                    }}
                                >
                                    % of Total
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        {rows.length ? (
                            rows.map((row, index) => {
                                const isNegative =
                                    row.amount !== null &&
                                    row.amount < 0;

                                return (
                                    <tr
                                        key={`${row.key || row.particular}-${index}`}
                                        style={{ display: "grid", gridTemplateColumns: hasPercentages ? "1.4fr 1fr 0.7fr" : "1.6fr 1fr", minHeight: "42px" }}
                                    >
                                        <td
                                            style={{
                                                padding: "8px 16px",
                                                borderBottom: "1px solid #EEF1F5",
                                                color: "#334155",
                                                fontSize: "0.80rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {row.particular}
                                        </td>

                                        <td
                                            style={{
                                                padding: "8px 16px",
                                                textAlign: "right",
                                                borderBottom: "1px solid #EEF1F5",
                                                color: isNegative ? "#DC2626" : "#334155",
                                                fontSize: "0.80rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {row.amount === null
                                                ? "—"
                                                : formatAmount(
                                                    row.amount,
                                                    "",
                                                    false
                                                )}
                                        </td>

                                        {hasPercentages && (
                                            <td
                                                style={{
                                                    padding: "8px 16px",
                                                    textAlign: "right",
                                                    borderBottom: "1px solid #EEF1F5",
                                                    color: "#334155",
                                                    fontSize: "0.80rem",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {row.percentage === null
                                                    ? "—"
                                                    : `${row.percentage.toFixed(2)}%`}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={hasPercentages ? 3 : 2}
                                    style={{
                                        padding: "20px",
                                        textAlign: "center",
                                        color: "#98A2B3",
                                    }}
                                >
                                    No data available.
                                </td>
                            </tr>
                        )}

                        <tr
                            className="wc-breakdown-total-row"
                            style={{
                                background: "#F8FAFC",
                                display: "grid",
                                gridTemplateColumns: hasPercentages ? "1.4fr 1fr 0.7fr" : "1.6fr 1fr",
                                marginTop: "auto",
                            }}
                        >
                            <td
                                style={{
                                    padding: "8px 10px",
                                    fontSize: "0.80rem",
                                    fontWeight: 900,
                                    color: "#172554",
                                }}
                            >
                                Total
                            </td>

                            <td
                                style={{
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontSize: "0.80rem",
                                    fontWeight: 900,
                                    color: "#1E293B",
                                }}
                            >
                                {formatAmount(
                                    total,
                                    "",
                                    false
                                )}
                            </td>

                            {hasPercentages && (
                                <td
                                    style={{
                                        padding: "8px 10px",
                                        textAlign: "right",
                                        fontWeight: 900,
                                        color: "#1E293B",
                                    }}
                                >
                                    100%
                                </td>
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LiquidityRatioCard({
    currentRatio,
    currency,
    period,
    periodEnd,
    onViewAll,
    onExportExcel,
    onExportPdf,
}) {
    const value = toNumber(currentRatio);

    return (
        <div className="wc-panel-animate" style={styles.panel}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                }}
            >
                <h3
                    style={{
                        ...styles.panelTitle,
                        marginBottom: 0,
                    }}
                >
                    Key Liquidity Ratio ({currency})
                </h3>

                <ActionMenu
                    items={[
                        {
                            key: "view-all",
                            label: "🔎 View All",
                            onClick: onViewAll,
                        },
                        {
                            key: "excel",
                            label: "📊 Export Excel",
                            onClick: onExportExcel,
                        },
                        {
                            key: "pdf",
                            label: "📄 Export PDF",
                            onClick: onExportPdf,
                        },
                    ]}
                />
            </div>

            <div
                style={{
                    color: C.muted,
                    fontSize: "0.68rem",
                    marginBottom: "8px",
                    fontWeight: 500,
                }}
            >
                {period
                    ? `Period: ${period}`
                    : "Period: —"}
                {periodEnd
                    ? ` (${formatDate(periodEnd)})`
                    : ""}
            </div>

            <div style={{ overflowX: "auto" }}>
                <table
                    className="wc-sales-data-table wc-breakdown-sales-table"
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
                        fontSize: "0.80rem",
                        minWidth: "280px",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                background: "#F8FAFC",
                                color: "#1E3A8A",
                                fontSize: "0.74rem",
                                fontWeight: 700,
                            }}
                        >
                            <th
                                style={{
                                    padding: "8px 10px",
                                    textAlign: "left",
                                }}
                            >
                                Particulars
                            </th>
                            <th
                                style={{
                                    padding: "8px 10px",
                                    textAlign: "right",
                                }}
                            >
                                Value
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td
                                style={{
                                    padding: "8px 5px",
                                    borderBottom: "1px solid #EEF1F5",
                                    color: "#334155",
                                    fontSize: "0.80rem",
                                    fontWeight: 600,
                                }}
                            >
                                Current Ratio
                            </td>

                            <td
                                style={{
                                    padding: "8px 5px",
                                    textAlign: "right",
                                    borderBottom: "1px solid #EEF1F5",
                                    color: "#173575",
                                    fontWeight: 800,
                                    fontSize: "0.80rem",
                                }}
                            >
                                {value === null
                                    ? "—"
                                    : value.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div
                style={{
                    marginTop: "8px",
                    color: "#64748B",
                    fontSize: "8px",
                }}
            >
                Current Ratio includes Short-Term Borrowings.
            </div>
        </div>
    );
}

function exportRowsToExcelFile(rows, columns, filename, sheetName = "Working Capital") {
    const safeRows = Array.isArray(rows) ? rows : [];
    const header = `<Row>${columns.map((column) => `<Cell><Data ss:Type="String">${escapeSpreadsheetXml(column.label)}</Data></Cell>`).join("")}</Row>`;
    const body = safeRows.map((row) => `<Row>${columns.map((column) => {
        const value = typeof column.get === "function" ? column.get(row) : row?.[column.key];
        const numeric = toNumber(value);
        return numeric !== null && typeof value !== "string"
            ? `<Cell><Data ss:Type="Number">${numeric}</Data></Cell>`
            : `<Cell><Data ss:Type="String">${escapeSpreadsheetXml(value ?? "—")}</Data></Cell>`;
    }).join("")}</Row>`).join("");
    const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="${escapeSpreadsheetXml(sheetName)}"><Table>${header}${body}</Table></Worksheet></Workbook>`;
    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function exportRowsToPdfFile(title, rows, columns, subtitle = "") {
    const popup = window.open("", "_blank", "width=1000,height=750");
    if (!popup) {
        window.alert("Please allow pop-ups to export the report as PDF.");
        return;
    }
    const header = columns.map((column) => `<th>${escapeSpreadsheetXml(column.label)}</th>`).join("");
    const body = (Array.isArray(rows) ? rows : []).map((row) => `<tr>${columns.map((column) => `<td>${escapeSpreadsheetXml(typeof column.get === "function" ? column.get(row) : row?.[column.key] ?? "—")}</td>`).join("")}</tr>`).join("");
    popup.document.write(`<!doctype html><html><head><title>${escapeSpreadsheetXml(title)}</title><style>body{font-family:Inter,Arial,sans-serif;color:#0F172A;padding:30px}h1{font-size:20px;margin:0 0 5px}p{font-size:12px;color:#64748B;margin:0 0 18px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#EEF2FF;color:#1E3A8A;text-align:left;padding:9px;border-bottom:2px solid #CBD5E1}td{padding:9px;border-bottom:1px solid #E2E8F0}td:not(:first-child){text-align:right}.footer{margin-top:16px;color:#94A3B8;font-size:10px}</style></head><body><h1>${escapeSpreadsheetXml(title)}</h1><p>${escapeSpreadsheetXml(subtitle)}</p><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></body></html>`);
    popup.document.close();
    popup.focus();
    setTimeout(() => popup.print(), 250);
}

function exportComponentsToExcel(rows, currency) {
    exportRowsToExcelFile(rows, [
        { key: "label", label: "Component" },
        { key: "value", label: `Amount (${currency})` },
        { key: "type", label: "Type" },
    ], "working-capital-components.xls", "Working Capital Components");
}

function exportComponentsToPdf(rows, currency) {
    exportRowsToPdfFile("Working Capital Components", rows, [
        { key: "label", label: "Component" },
        { key: "value", label: `Amount (${currency})` },
        { key: "type", label: "Type" },
    ], `${currency} — Receivables + Inventory − Payables = Trade Working Capital`);
}

function exportAssetsVsLiabilitiesToExcel(rows, currency) {
    exportRowsToExcelFile(rows, [
        { key: "label", label: "Particular" },
        { key: "previous", label: `Previous (${currency})` },
        { key: "current", label: `Current (${currency})` },
    ], "working-capital-assets-vs-liabilities.xls", "Assets vs Liabilities");
}

function exportAssetsVsLiabilitiesToPdf(rows, currency, period) {
    exportRowsToPdfFile("Current Assets vs Current Liabilities", rows, [
        { key: "label", label: "Particular" },
        { key: "previous", label: `Previous (${currency})` },
        { key: "current", label: `Current (${currency})` },
    ], `${currency} — Balance Sheet Period: ${period || "—"}`);
}

function TradeWorkingCapitalComponents({ components, currency, onViewAll }) {
    const rows = [
        {
            label: "Receivables",
            value: toNumber(
                getValue(components, "receivables", "total_receivables")
            ),
            type: "positive",
        },
        {
            label: "Inventory",
            value: toNumber(
                getValue(components, "inventory", "total_inventory")
            ),
            type: "positive",
        },
        {
            label: "(-) Payables",
            value: toNumber(
                getValue(components, "payables", "total_payables")
            ),
            type: "negative",
        },
        {
            label: "Trade Working Capital",
            value: toNumber(
                getValue(
                    components,
                    "trade_working_capital",
                    "trade_working_capital_value",
                    "working_capital"
                )
            ),
            type: "total",
        },
    ];

    const validValues = rows
        .map((row) => row.value)
        .filter((value) => value !== null);

    const maxValue = Math.max(...validValues, 1);
    const width = 640;
    const height = 245;
    const left = 46;
    const right = 18;
    const top = 30;
    const bottom = 54;
    const plotHeight = height - top - bottom;
    const slot = (width - left - right) / rows.length;
    const barWidth = Math.min(46, slot * 0.52);
    const scale = (value) =>
        (Math.abs(value || 0) / maxValue) * plotHeight;

    const [hoveredIndex, setHoveredIndex] = useState(null);

    let running = 0;

    const bars = rows.map((row) => {
        if (row.type === "total") {
            const value = row.value;
            return {
                ...row,
                start: 0,
                end: value ?? 0,
            };
        }

        const before = running;

        if (row.value !== null) {
            running +=
                row.type === "negative"
                    ? -row.value
                    : row.value;
        }

        return {
            ...row,
            start: before,
            end: running,
        };
    });

    const hoveredBar =
        hoveredIndex === null
            ? null
            : bars[hoveredIndex] || null;

    return (
        <div
            className="wc-panel-animate"
            style={{
                ...styles.panel,
                position: "relative",
                overflow: "visible",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <div>
                    <h3
                        style={{
                            ...styles.panelTitle,
                            marginBottom: 2,
                        }}
                    >
                        Working Capital Components ({currency})
                    </h3>
                    <div
                        style={{
                            fontSize: "0.68rem",
                            color: C.muted,
                            marginTop: 2,
                            fontWeight: 500,
                        }}
                    >
                        {currency} — Receivables + Inventory − Payables = Trade Working Capital
                    </div>
                </div>

                <ActionMenu
                    items={[
                        {
                            key: "view-all",
                            label: "🔎 View All",
                            onClick: onViewAll,
                        },
                        {
                            key: "excel",
                            label: "📊 Export Excel",
                            onClick: () => exportComponentsToExcel(rows, currency),
                        },
                        {
                            key: "pdf",
                            label: "📄 Export PDF",
                            onClick: () => exportComponentsToPdf(rows, currency),
                        },
                    ]}
                />
            </div>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                style={{
                    display: "block",
                    marginTop: "3px",
                    overflow: "visible",
                }}
                onMouseLeave={() => setHoveredIndex(null)}
            >
                <defs>
                    <linearGradient
                        id="wc-components-positive"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient
                        id="wc-components-negative"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="#FB7185" />
                        <stop offset="100%" stopColor="#DB2777" />
                    </linearGradient>
                    <linearGradient
                        id="wc-components-total"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                    const yy =
                        height -
                        bottom -
                        fraction * plotHeight;

                    return (
                        <g key={fraction}>
                            <line
                                x1={left}
                                x2={width - right}
                                y1={yy}
                                y2={yy}
                                stroke="#E2E8F0"
                                strokeDasharray={
                                    fraction === 0
                                        ? "0"
                                        : "3 4"
                                }
                            />
                            <text
                                x={left - 6}
                                y={yy + 3}
                                textAnchor="end"
                                fontSize="10"
                                fontWeight="600"
                                fill="#94A3B8"
                            >
                                {formatAmount(
                                    maxValue * fraction,
                                    "",
                                    true
                                )}
                            </text>
                        </g>
                    );
                })}

                {bars.map((bar, index) => {
                    const x =
                        left +
                        index * slot +
                        (slot - barWidth) / 2;
                    const value = bar.value;

                    if (value === null) {
                        return (
                            <text
                                key={bar.label}
                                x={x + barWidth / 2}
                                y={height - 20}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#64748B"
                            >
                                {bar.label}
                            </text>
                        );
                    }

                    const topValue = Math.max(
                        bar.start,
                        bar.end
                    );
                    const bottomValue = Math.min(
                        bar.start,
                        bar.end
                    );
                    const barHeight = scale(
                        topValue - bottomValue
                    );
                    const y =
                        height -
                        bottom -
                        scale(topValue);
                    const hovered =
                        hoveredIndex === index;
                    const fillId =
                        bar.type === "negative"
                            ? "url(#wc-components-negative)"
                            : bar.type === "total"
                                ? "url(#wc-components-total)"
                                : "url(#wc-components-positive)";

                    return (
                        <g
                            key={bar.label}
                            onMouseEnter={() =>
                                setHoveredIndex(index)
                            }
                            style={{
                                cursor: "pointer",
                            }}
                        >
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(
                                    barHeight,
                                    2
                                )}
                                rx="5"
                                fill={fillId}
                                opacity={
                                    hoveredIndex === null || hovered
                                        ? 1
                                        : 0.62
                                }
                                style={{
                                    transition:
                                        "opacity .18s ease, filter .18s ease, transform .18s ease",
                                    transformOrigin: `${x + barWidth / 2}px ${height - bottom}px`,
                                    filter: hovered
                                        ? "drop-shadow(0 6px 7px rgba(37,99,235,.22))"
                                        : "none",
                                    transform: hovered
                                        ? "translateY(-2px)"
                                        : "translateY(0)",
                                }}
                            />

                            <text
                                x={x + barWidth / 2}
                                y={Math.max(
                                    top + 10,
                                    y - 7
                                )}
                                textAnchor="middle"
                                fontSize={hovered ? "13" : "12"}
                                fontWeight="800"
                                fill="#1E293B"
                            >
                                {formatAmount(
                                    value,
                                    "",
                                    true
                                )}
                            </text>

                            <text
                                x={x + barWidth / 2}
                                y={height - 21}
                                textAnchor="middle"
                                fontSize={hovered ? "12" : "11"}
                                fontWeight={hovered ? "700" : "500"}
                                fill={
                                    hovered
                                        ? "#1E293B"
                                        : "#334155"
                                }
                            >
                                {bar.label}
                            </text>

                            {hovered && (
                                <g
                                    pointerEvents="none"
                                    style={{
                                        filter: "drop-shadow(0 5px 12px rgba(15,23,42,.14))",
                                        animation: "wcTooltipIn .14s ease-out forwards",
                                    }}
                                >
                                    <rect
                                        x={Math.max(4, Math.min(width - 174, x + barWidth / 2 - 87))}
                                        y={Math.max(6, y - 72)}
                                        width="174"
                                        height="56"
                                        rx="8"
                                        fill="#FFFFFF"
                                        stroke={bar.type === "negative" ? "#F3B4C8" : bar.type === "total" ? "#C7D2FE" : "#B7E4D3"}
                                        strokeWidth="1"
                                    />
                                    <rect
                                        x={Math.max(4, Math.min(width - 174, x + barWidth / 2 - 87)) + 10}
                                        y={Math.max(6, y - 72) + 12}
                                        width="7"
                                        height="7"
                                        rx="1.5"
                                        fill={bar.type === "negative" ? "#DB2777" : bar.type === "total" ? "#4F46E5" : "#059669"}
                                    />
                                    <text
                                        x={Math.max(4, Math.min(width - 174, x + barWidth / 2 - 87)) + 23}
                                        y={Math.max(6, y - 72) + 19}
                                        fontSize="11"
                                        fontWeight="700"
                                        fill="#334155"
                                    >
                                        {bar.label}
                                    </text>
                                    <text
                                        x={Math.max(4, Math.min(width - 174, x + barWidth / 2 - 87)) + 10}
                                        y={Math.max(6, y - 72) + 43}
                                        fontSize="13"
                                        fontWeight="800"
                                        fill={bar.type === "negative" ? "#DB2777" : bar.type === "total" ? "#4F46E5" : "#047857"}
                                    >
                                        {currency ? `${currency} ${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                    </text>
                                </g>
                            )}

                            {index < bars.length - 1 && (
                                <line
                                    x1={x + barWidth}
                                    x2={
                                        left +
                                        (index + 1) * slot +
                                        (slot - barWidth) / 2
                                    }
                                    y1={
                                        height -
                                        bottom -
                                        scale(bar.end)
                                    }
                                    y2={
                                        height -
                                        bottom -
                                        scale(bar.end)
                                    }
                                    stroke="#CBD5E1"
                                    strokeWidth={hovered ? "1.5" : "1"}
                                    strokeDasharray="3 3"
                                />
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function CashConversionCycle({
    kpis,
    cccPayload,
    operationalDate,
}) {
    const dsoRaw = getNullableValue(cccPayload, "dso_days", "dso");
    const dioRaw = getNullableValue(cccPayload, "dio_days", "dio");
    const dpoRaw = getNullableValue(cccPayload, "dpo_days", "dpo");
    const cccRaw = getNullableValue(
        cccPayload,
        "cash_conversion_cycle_days",
        "ccc_days",
        "ccc"
    );

    // Display backend values directly. Null DIO / CCC remain unavailable.
    const dso = dsoRaw !== undefined ? toNumber(dsoRaw) : toNumber(kpis?.dso_days);
    const dio = dioRaw !== undefined ? toNumber(dioRaw) : toNumber(kpis?.dio_days);
    const dpo = dpoRaw !== undefined ? toNumber(dpoRaw) : toNumber(kpis?.dpo_days);
    const ccc = cccRaw !== undefined
        ? toNumber(cccRaw)
        : toNumber(kpis?.cash_conversion_cycle_days);

    const status =
        getValue(cccPayload, "status", "ccc_status") ??
        kpis?.ccc_status;

    const cards = [
        {
            label: "DSO (Days)",
            value: dso,
            icon: "◔",
            bg: "#EEF6FF",
            iconBg: "#DDEEFF",
            accent: "#2563EB",
        },
        {
            label: "DIO (Days)",
            value: dio,
            icon: "♟",
            bg: "#F1FBF5",
            iconBg: "#DCF5E6",
            accent: "#16A34A",
        },
        {
            label: "DPO (Days)",
            value: dpo,
            icon: "¤",
            bg: "#F0FBFD",
            iconBg: "#D8F4F7",
            accent: "#0891B2",
        },
        {
            label: "CCC (Days)",
            value: ccc,
            icon: "◷",
            bg: "#FFF2F7",
            iconBg: "#FCE0EB",
            accent: "#DB2777",
        },
    ];

    const renderCard = (card) => (
        <div
            key={card.label}
            style={{
                background: card.bg,
                border: "1px solid #EEF2F7",
                borderRadius: "9px",
                padding: "9px 6px 8px",
                minWidth: 0,
                textAlign: "center",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    width: "30px",
                    height: "30px",
                    margin: "0 auto 6px",
                    borderRadius: "50%",
                    background: card.iconBg,
                    color: card.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 800,
                    boxShadow: "0 1px 3px rgba(15,23,42,.06)",
                }}
            >
                {card.icon}
            </div>

            <div
                style={{
                    color: card.accent,
                    fontSize: "9px",
                    lineHeight: 1.15,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                }}
            >
                {card.label}
            </div>

            <div
                style={{
                    color: "#0F172A",
                    fontSize: "20px",
                    lineHeight: 1.05,
                    fontWeight: 800,
                    marginTop: "6px",
                    letterSpacing: "-0.02em",
                }}
                title={
                    card.value === null &&
                        (card.label === "DIO (Days)" || card.label === "CCC (Days)") &&
                        status === "INSUFFICIENT_INVENTORY_HISTORY"
                        ? "DIO and CCC require sufficient inventory history."
                        : undefined
                }
            >
                {card.value === null ? "—" : card.value.toFixed(2)}
            </div>
        </div>
    );

    return (
        <div className="wc-panel-animate" style={styles.panel}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                <div>
                    <h3 style={{ ...styles.panelTitle, marginBottom: 2 }}>Cash Conversion Cycle (Days)</h3>
                    <div style={{ fontSize: "0.68rem", color: C.muted, marginTop: 2, fontWeight: 500 }}>
                        AED — monthly available observations
                    </div>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "minmax(0, 1fr) 18px minmax(0, 1fr) 18px minmax(0, 1fr) 18px minmax(0, 1fr)",
                    alignItems: "center",
                    gap: "5px",
                }}
            >
                {renderCard(cards[0])}
                <div style={{ color: "#334155", fontSize: "18px", fontWeight: 800, textAlign: "center" }}>−</div>
                {renderCard(cards[1])}
                <div style={{ color: "#334155", fontSize: "18px", fontWeight: 800, textAlign: "center" }}>+</div>
                {renderCard(cards[2])}
                <div style={{ color: "#334155", fontSize: "18px", fontWeight: 800, textAlign: "center" }}>=</div>
                {renderCard(cards[3])}
            </div>

            <div
                style={{
                    fontSize: "8px",
                    color: "#64748B",
                    marginTop: "8px",
                    lineHeight: 1.45,
                }}
            >
                Operational as on {formatDate(operationalDate)}
                {status === "INSUFFICIENT_INVENTORY_HISTORY"
                    ? " · DIO and CCC require sufficient inventory history."
                    : status
                        ? ` · ${status}`
                        : ""}
            </div>
        </div>
    );
}

function MultiSelectField({
    label,
    values,
    options,
    onChange,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const selected = Array.isArray(values) ? values : [];

    const visibleOptions = options.filter((option) =>
        String(option.label || "")
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    const toggle = (id) => {
        const key = String(id);
        const exists = selected.some((value) => String(value) === key);
        onChange(
            exists
                ? selected.filter((value) => String(value) !== key)
                : [...selected, key]
        );
    };

    const displayValue =
        selected.length === 0
            ? "All"
            : selected.length === options.length
                ? "All"
                : selected.length === 1
                    ? options.find((option) => String(option.id) === String(selected[0]))?.label || "1 selected"
                    : `${selected.length} selected`;

    return (
        <div ref={ref} style={{ position: "relative", minWidth: 0 }}>
            <label style={styles.filterLabel}>{label}</label>

            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                style={{
                    ...styles.filterInput,
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                    cursor: "pointer",
                    padding: "0 9px",
                }}
            >
                <span
                    style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {displayValue}
                </span>
                <span
                    style={{
                        color: "#64748B",
                        fontSize: "0.62rem",
                        marginLeft: 5,
                    }}
                >
                    {open ? "▲" : "▼"}
                </span>
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "58px",
                        left: 0,
                        right: 0,
                        minWidth: "210px",
                        zIndex: 500,
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "9px",
                        boxShadow: "0 12px 30px rgba(15,23,42,.14)",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: "7px", borderBottom: "1px solid #E2E8F0" }}>
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={`Search ${label}`}
                            style={{
                                width: "100%",
                                height: "30px",
                                border: "1px solid #CBD5E1",
                                borderRadius: "6px",
                                padding: "0 9px",
                                fontSize: "0.70rem",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "6px 10px",
                            borderBottom: "1px solid #F1F5F9",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                onChange(options.map((option) => String(option.id)))
                            }
                            style={{
                                border: "none",
                                background: "transparent",
                                color: "#2563EB",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            Select All
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            style={{
                                border: "none",
                                background: "transparent",
                                color: "#EF4444",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            Clear
                        </button>
                    </div>

                    <div style={{ maxHeight: 210, overflowY: "auto" }}>
                        {visibleOptions.map((option) => {
                            const checked = selected.some(
                                (value) => String(value) === String(option.id)
                            );

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => toggle(option.id)}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "7px",
                                        border: "none",
                                        borderBottom: "1px solid #F8FAFC",
                                        background: checked ? "#EFF6FF" : "#FFFFFF",
                                        color: checked ? "#2563EB" : "#334155",
                                        fontSize: "0.70rem",
                                        fontWeight: checked ? 700 : 500,
                                        padding: "7px 10px",
                                        textAlign: "left",
                                        cursor: "pointer",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 14,
                                            height: 14,
                                            border: `1.5px solid ${checked ? "#2563EB" : "#CBD5E1"}`,
                                            borderRadius: 3,
                                            background: checked ? "#2563EB" : "#FFFFFF",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            color: "#FFFFFF",
                                            fontSize: "0.60rem",
                                        }}
                                    >
                                        {checked ? "✓" : ""}
                                    </span>
                                    <span
                                        style={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {option.label}
                                    </span>
                                </button>
                            );
                        })}

                        {!visibleOptions.length && (
                            <div
                                style={{
                                    padding: "12px",
                                    textAlign: "center",
                                    color: "#94A3B8",
                                    fontSize: "0.70rem",
                                }}
                            >
                                No results
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function SingleSelectField({ label, value, options, onChange }) {
    const normalizedOptions = Array.isArray(options) ? options.map((option) => {
        if (option !== null && typeof option === "object") {
            return { value: option.value ?? option.id ?? option.key ?? "", label: option.label ?? option.name ?? option.value ?? option.id ?? "" };
        }
        return { value: option ?? "", label: option ?? "" };
    }).filter((option) => option.value !== "") : [];
    return (
        <div>
            <label style={styles.filterLabel}>{label}</label>
            <select value={value ?? ""} onChange={(event) => onChange(event.target.value)} style={{ ...styles.filterInput, height: "32px", cursor: "pointer" }}>
                <option value="">All available</option>
                {normalizedOptions.map((option, index) => (
                    <option key={`${String(option.value)}-${index}`} value={String(option.value)}>
                        {label === "As On Date" ? formatDate(option.label) : String(option.label)}
                    </option>
                ))}
            </select>
        </div>
    );
}

function CalendarDateField({ value, onChange, width = 125 }) {
    const inputRef = useRef(null);

    const openCalendar = () => {
        const input = inputRef.current;
        if (!input) return;
        if (typeof input.showPicker === "function") {
            try {
                input.showPicker();
                return;
            } catch (_) {
                // Fall through to the native input click.
            }
        }
        input.click();
    };

    return (
        <div
            style={{
                position: "relative",
                width,
                height: 32,
                flexShrink: 0,
            }}
        >
            <button
                type="button"
                onClick={openCalendar}
                style={{
                    ...styles.filterInput,
                    width: "100%",
                    height: "32px",
                    padding: "0 28px 0 9px",
                    textAlign: "left",
                    color: value ? "#334155" : "#94A3B8",
                    fontWeight: value ? 600 : 500,
                    cursor: "pointer",
                    boxSizing: "border-box",
                    fontFamily: "Inter, system-ui, sans-serif",
                    background: "#FFFFFF",
                    position: "relative",
                    zIndex: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {value ? formatDate(value) : "Select date"}
            </button>
            <span
                aria-hidden="true"
                style={{
                    position: "absolute",
                    right: 9,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748B",
                    width: 15,
                    height: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    zIndex: 3,
                }}
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M7 3.5V7M17 3.5V7M3.5 9.5H20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
            </span>
            <input
                ref={inputRef}
                type="date"
                value={value || ""}
                onChange={(event) => onChange(event.target.value)}
                aria-label="As On Date"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    pointerEvents: "none",
                    zIndex: 1,
                }}
            />
        </div>
    );
}

function ActionMenu({ items = [] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const handler = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    setOpen((value) => !value);
                }}
                title="Options"
                aria-label="Options"
                style={{
                    background: open ? "#F1F5F9" : "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 6px",
                    borderRadius: 6,
                    fontSize: "1.1rem",
                    color: "#94A3B8",
                    lineHeight: 1,
                    transition: "all .15s ease",
                    display: "flex",
                    alignItems: "center",
                    outline: "none",
                }}
            >
                ⋮
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 4px)",
                        background: "#FFFFFF",
                        borderRadius: 10,
                        boxShadow: "0 8px 24px rgba(0,0,0,.13)",
                        border: "1px solid #E2E8F0",
                        minWidth: 168,
                        zIndex: 1200,
                        overflow: "hidden",
                        animation: "wcMenuScale .14s cubic-bezier(.34,1.56,.64,1) forwards",
                    }}
                    onClick={(event) => event.stopPropagation()}
                >
                    {items.map((item, index) => {
                        const disabled = !!item.disabled;
                        return (
                            <button
                                key={item.key || index}
                                type="button"
                                disabled={disabled}
                                onClick={() => {
                                    if (disabled) return;
                                    setOpen(false);
                                    item.onClick?.();
                                }}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "9px 14px",
                                    background: "none",
                                    border: "none",
                                    borderTop: index > 0 ? "1px solid #F1F5F9" : "none",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: disabled ? "#98A2B3" : "#334155",
                                    cursor: disabled ? "not-allowed" : "pointer",
                                    transition: "background .12s ease",
                                    opacity: disabled ? 0.65 : 1,
                                }}
                                onMouseEnter={(event) => {
                                    if (!disabled) event.currentTarget.style.background = "#F8FAFC";
                                }}
                                onMouseLeave={(event) => {
                                    event.currentTarget.style.background = "none";
                                }}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function HeaderExportMenu({
    exporting,
    onExport,
}) {
    const [open, setOpen] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const choose = (format, section) => {
        setOpen(null);
        onExport(format, section);
    };

    const buttonStyle = (active) => ({
        ...styles.button,
        height: "32px",
        minWidth: "68px",
        padding: "0 10px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        color: active ? "#166534" : "#334155",
        borderColor: active ? "#A7D8BF" : "#CBD5E1",
        background: "#FFFFFF",
        fontSize: "0.72rem",
        fontWeight: 700,
    });

    return (
        <div ref={ref} style={{ display: "flex", gap: 6, position: "relative" }}>
            {["excel", "pdf"].map((format) => (
                <button
                    key={format}
                    type="button"
                    disabled={exporting}
                    onClick={() => setOpen(open === format ? null : format)}
                    style={buttonStyle(open === format)}
                >
                    {exporting ? "..." : format === "excel" ? "Excel" : "PDF"}
                    <span style={{ fontSize: 8 }}>▾</span>
                </button>
            ))}

            {open && !exporting && (
                <div
                    style={{
                        position: "absolute",
                        top: 38,
                        right: 0,
                        zIndex: 800,
                        minWidth: 210,
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 9,
                        boxShadow: "0 12px 30px rgba(15,23,42,.14)",
                        padding: 5,
                    }}
                >
                    <div style={{
                        padding: "5px 9px 6px",
                        color: "#64748B",
                        fontSize: "0.66rem",
                        fontWeight: 700,
                    }}>
                        Export {open === "excel" ? "Excel" : "PDF"}
                    </div>
                    {["assets", "liabilities"].map((section) => (
                        <button
                            key={section}
                            type="button"
                            onClick={() => choose(open, section)}
                            style={{
                                width: "100%",
                                border: "none",
                                background: "transparent",
                                color: "#334155",
                                textAlign: "left",
                                padding: "8px 10px",
                                borderRadius: 6,
                                fontSize: "0.70rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFC"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                            {section === "assets" ? "Current Assets" : "Current Liabilities"}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ViewAllMultiSelect({
    label,
    options = [],
    value = [],
    onChange,
    width = 150,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef(null);
    const selected = Array.isArray(value) ? value.map(String) : [];

    useEffect(() => {
        if (!open) return;
        const close = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [open]);

    const visible = options.filter((item) =>
        String(item?.label || "").toLowerCase().includes(query.toLowerCase())
    );

    const toggle = (id) => {
        const key = String(id);
        onChange(
            selected.includes(key)
                ? selected.filter((v) => v !== key)
                : [...selected, key]
        );
    };

    const display = selected.length === 0
        ? "All"
        : selected.length === 1
            ? options.find((o) => String(o.id) === selected[0])?.label || "1 selected"
            : `${selected.length} selected`;

    return (
        <div ref={ref} style={{ position: "relative", width, flexShrink: 0, zIndex: open ? 1400 : 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ color: "#1E3A8A", fontSize: "0.68rem", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>{label}</span>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={{
                    width: "100%",
                    height: 32,
                    border: "1px solid #CBD5E1",
                    borderRadius: 7,
                    background: "#FFFFFF",
                    color: "#334155",
                    padding: "0 26px 0 10px",
                    textAlign: "left",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    position: "relative",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
                title={display}
            >
                {display}
                <span style={{ position: "absolute", right: 9, top: 8, color: "#94A3B8", fontSize: 9 }}>▼</span>
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: 36,
                        left: 0,
                        width: Math.max(width, 210),
                        zIndex: 1500,
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 9,
                        boxShadow: "0 14px 32px rgba(15,23,42,.16)",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: 7, borderBottom: "1px solid #F1F5F9" }}>
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Search ${label}`}
                            style={{
                                width: "100%",
                                height: 29,
                                border: "1px solid #CBD5E1",
                                borderRadius: 6,
                                padding: "0 8px",
                                fontSize: "0.70rem",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: 5, padding: "6px 8px", borderBottom: "1px solid #F1F5F9" }}>
                        <button
                            type="button"
                            onClick={() => onChange(options.map((o) => String(o.id)))}
                            style={{ border: "none", background: "#EEF2FF", color: "#4338CA", borderRadius: 5, padding: "4px 7px", fontSize: "0.64rem", fontWeight: 700, cursor: "pointer" }}
                        >Select All</button>
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            style={{ border: "none", background: "#F8FAFC", color: "#64748B", borderRadius: 5, padding: "4px 7px", fontSize: "0.64rem", fontWeight: 700, cursor: "pointer" }}
                        >Clear</button>
                    </div>
                    <div style={{ maxHeight: 220, overflowY: "auto", padding: "4px 0" }}>
                        {visible.length ? visible.map((option) => {
                            const checked = selected.includes(String(option.id));
                            return (
                                <label
                                    key={option.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 7,
                                        padding: "6px 9px",
                                        fontSize: "0.70rem",
                                        color: "#334155",
                                        cursor: "pointer",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggle(option.id)}
                                    />
                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{option.label}</span>
                                </label>
                            );
                        }) : (
                            <div style={{ padding: "12px 9px", color: "#94A3B8", fontSize: "0.68rem" }}>No options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Modal Close Button (Sales Revenue style) ─────────────────── */
function ModalCloseButton({ onClick }) {
    const [hover, setHover] = useState(false);
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                background: hover ? "#f1f5f9" : "none",
                border: "none",
                fontSize: "0.85rem",
                color: C.slate,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: "50%",
                transition: "all 0.15s",
                outline: "none",
            }}
            title="Close"
        >
            ✕
        </button>
    );
}

/* ─── AED / AED Millions Toggle (Sales Revenue style) ──────────── */
function UnitToggle({ unit, onToggle, currency = "AED" }) {
    const isAED = unit === "aed";
    const isMillions = unit === "millions";

    return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <button
                type="button"
                onClick={() => onToggle("aed")}
                style={{
                    height: 28,
                    minWidth: 42,
                    padding: "0 10px",
                    borderRadius: 6,
                    border: isAED ? "1px solid #5B3FE4" : "1px solid #E2E8F0",
                    background: isAED ? "#5B3FE4" : "#FFFFFF",
                    color: isAED ? "#FFFFFF" : "#334155",
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    outline: "none",
                }}
                title={`Display in ${currency}`}
            >
                {currency}
            </button>
            <button
                type="button"
                onClick={() => onToggle("millions")}
                style={{
                    height: 28,
                    minWidth: 78,
                    padding: "0 10px",
                    borderRadius: 6,
                    border: isMillions ? "1px solid #5B3FE4" : "1px solid #E2E8F0",
                    background: isMillions ? "#5B3FE4" : "#FFFFFF",
                    color: isMillions ? "#FFFFFF" : "#334155",
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    outline: "none",
                }}
                title={`Display in ${currency} Millions`}
            >
                {currency} Millions
            </button>
        </div>
    );
}

function cascadeViewAllOptions(filterOptions, localFilters) {
    const groups = filterOptions?.legalGroups || [];
    const entities = filterOptions?.legalEntities || [];
    const parents = filterOptions?.parentDivisions || [];
    const subs = filterOptions?.subDivisions || [];

    const groupIds = (localFilters.legalGroups || []).map(String);
    const entityIds = (localFilters.legalEntities || []).map(String);
    const parentIds = (localFilters.parentDivisions || []).map(String);

    const matches = (item, keys, selected) => {
        if (!selected.length) return true;
        const ids = (keys || []).map(String);
        return !ids.length || ids.some((id) => selected.includes(id));
    };

    return {
        legalGroups: groups,
        legalEntities: entities.filter((item) => matches(item, item.legalGroupIds, groupIds)),
        parentDivisions: parents.filter((item) => matches(item, item.legalEntityIds, entityIds) && matches(item, item.legalGroupIds, groupIds)),
        subDivisions: subs.filter((item) => matches(item, item.parentDivisionIds, parentIds) && matches(item, item.legalEntityIds, entityIds) && matches(item, item.legalGroupIds, groupIds)),
    };
}

function ViewAllModal({
    title,
    rows,
    currency,
    type,
    onClose,
    filterOptions,
    baseFilters,
    onApplyFilters,
    onExport,
    loading = false,
}) {
    const isCcc = type === "ccc";
    const isTrade = type === "trade";
    const isTrend = type === "trend";
    const [search, setSearch] = useState("");
    const [modalUnit, setModalUnit] = useState("aed");
    const [page, setPage] = useState(0);
    const pageSize = 15;

    const [localFilters, setLocalFilters] = useState(() => ({
        legalGroups: baseFilters?.legalGroups || [],
        legalEntities: baseFilters?.legalEntities || [],
        parentDivisions: baseFilters?.parentDivisions || [],
        subDivisions: baseFilters?.subDivisions || [],
        asOnDate: baseFilters?.asOnDate || "",
        periodName: baseFilters?.periodName || "",
        agingBasis: baseFilters?.agingBasis || "DUE_DATE",
    }));

    useEffect(() => {
        setLocalFilters({
            legalGroups: baseFilters?.legalGroups || [],
            legalEntities: baseFilters?.legalEntities || [],
            parentDivisions: baseFilters?.parentDivisions || [],
            subDivisions: baseFilters?.subDivisions || [],
            asOnDate: baseFilters?.asOnDate || "",
            periodName: baseFilters?.periodName || "",
            agingBasis: baseFilters?.agingBasis || "DUE_DATE",
        });
        setPage(0);
    }, [baseFilters, type]);

    const cascaded = useMemo(
        () => cascadeViewAllOptions(filterOptions, localFilters),
        [filterOptions, localFilters]
    );

    const updateCascade = (key, values) => {
        setLocalFilters((prev) => {
            const next = { ...prev, [key]: values };
            if (key === "legalGroups") {
                next.legalEntities = [];
                next.parentDivisions = [];
                next.subDivisions = [];
            }
            if (key === "legalEntities") {
                next.parentDivisions = [];
                next.subDivisions = [];
            }
            if (key === "parentDivisions") {
                next.subDivisions = [];
            }
            return next;
        });
        setPage(0);
    };

    const filtered = (Array.isArray(rows) ? rows : []).filter((row) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return Object.values(row || {}).some((value) => String(value ?? "").toLowerCase().includes(q));
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages - 1);
    const pageRows = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

    const modalFmt = (value) => {
        const n = toNumber(value);
        if (n === null) return "—";
        if (modalUnit === "millions") return `${(n / 1000000).toFixed(2)}M`;
        return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    };

    if (!filterOptions) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.35)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 0,
            }}
        >
            <div
                style={{
                    width: "96vw",
                    maxWidth: "1500px",
                    height: "100vh",
                    background: "#FFFFFF",
                    borderRadius: 16,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 20px 60px rgba(0,0,0,.18)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid #F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "linear-gradient(90deg,#F8FAFC,#FFFFFF)",
                    flexShrink: 0,
                }}>
                    <div>
                        <h2 style={{ margin: 0, color: C.navy, fontSize: "0.92rem", fontWeight: 800 }}>
                            {title}
                        </h2>
                        <div style={{ marginTop: 2, color: "#64748B", fontSize: "0.68rem", fontWeight: 500 }}>
                            {baseFilters?.asOnDate ? `As on: ${formatDate(baseFilters.asOnDate)}` : baseFilters?.periodName ? `Period: ${baseFilters.periodName}` : "All available periods"}
                            <span style={{ margin: "0 6px", color: "#CBD5E1" }}>•</span>
                            Reporting currency: {currency}
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <UnitToggle unit={modalUnit} onToggle={setModalUnit} currency={currency} />
                        <button type="button" onClick={() => onExport?.("excel", type, localFilters, rows)} disabled={loading} style={{ height: 30, padding: "0 10px", borderRadius: 7, border: "1px solid #A7D8BF", background: "#F8FFFC", color: "#168052", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}>Excel</button>
                        <button type="button" onClick={() => onExport?.("pdf", type, localFilters, rows)} disabled={loading} style={{ height: 30, padding: "0 10px", borderRadius: 7, border: "1px solid #F2B8B8", background: "#FFF8F8", color: "#C23B3B", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}>PDF</button>
                        <ModalCloseButton onClick={onClose} />
                    </div>
                </div>

                <div style={{
                    padding: "10px 20px",
                    borderBottom: "1px solid #F1F5F9",
                    background: "#FAFBFC",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "nowrap",
                    overflow: "visible",
                    position: "relative",
                    zIndex: 20,
                    flexShrink: 0,
                }}>
                    <ViewAllMultiSelect label="Legal Group" options={cascaded.legalGroups} value={localFilters.legalGroups} onChange={(v) => updateCascade("legalGroups", v)} />
                    <ViewAllMultiSelect label="Legal Entity" options={cascaded.legalEntities} value={localFilters.legalEntities} onChange={(v) => updateCascade("legalEntities", v)} />
                    <ViewAllMultiSelect label="Parent Division" options={cascaded.parentDivisions} value={localFilters.parentDivisions} onChange={(v) => updateCascade("parentDivisions", v)} />
                    <ViewAllMultiSelect label="Sub-Division" options={cascaded.subDivisions} value={localFilters.subDivisions} onChange={(v) => updateCascade("subDivisions", v)} />

                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                        <span style={{ color: "#1E3A8A", fontSize: "0.68rem", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>As On Date</span>
                        <CalendarDateField
                            value={localFilters.asOnDate || ""}
                            onChange={(value) => setLocalFilters((p) => ({ ...p, asOnDate: value }))}
                            width={135}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                        <span style={{ color: "#1E3A8A", fontSize: "0.68rem", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>Period</span>
                        <select value={localFilters.periodName || ""} onChange={(e) => setLocalFilters((p) => ({ ...p, periodName: e.target.value }))} style={{ height: 32, minWidth: 125, border: "1px solid #CBD5E1", borderRadius: 7, padding: "0 8px", background: "#FFFFFF", color: "#334155", fontSize: "0.70rem" }}>
                            <option value="">All Periods</option>
                            {(filterOptions.balanceSheetPeriods || []).map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                        <span style={{ color: "#1E3A8A", fontSize: "0.68rem", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>Aging Basis</span>
                        <select value={localFilters.agingBasis || "DUE_DATE"} onChange={(e) => setLocalFilters((p) => ({ ...p, agingBasis: e.target.value }))} style={{ height: 32, minWidth: 110, border: "1px solid #CBD5E1", borderRadius: 7, padding: "0 8px", background: "#FFFFFF", color: "#334155", fontSize: "0.70rem" }}>
                            {(filterOptions.agingBases || ["DUE_DATE"]).map((basis) => <option key={basis} value={basis}>{basis}</option>)}
                        </select>
                    </div>

                    <button type="button" onClick={() => { setPage(0); onApplyFilters?.(localFilters); }} disabled={loading} style={{ height: 32, padding: "0 14px", border: "none", borderRadius: 7, background: "#2563EB", color: "#FFFFFF", fontSize: "0.70rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                        {loading ? "Loading..." : "Apply"}
                    </button>
                    <button type="button" onClick={() => {
                        const reset = {
                            legalGroups: baseFilters?.legalGroups || [],
                            legalEntities: baseFilters?.legalEntities || [],
                            parentDivisions: baseFilters?.parentDivisions || [],
                            subDivisions: baseFilters?.subDivisions || [],
                            asOnDate: baseFilters?.asOnDate || "",
                            periodName: baseFilters?.periodName || "",
                            agingBasis: baseFilters?.agingBasis || "DUE_DATE",
                        };
                        setLocalFilters(reset);
                        setPage(0);
                        onApplyFilters?.(reset);
                    }} disabled={loading} style={{ height: 32, padding: "0 9px", border: "none", background: "transparent", color: "#475569", fontSize: "0.70rem", fontWeight: 600, cursor: "pointer" }}>
                        Reset
                    </button>

                </div>

                <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "10px 16px 8px", background: "#FFFFFF", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "0 2px 8px", flexShrink: 0 }}>
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            placeholder={isCcc ? "Search periods..." : "Search..."}
                            style={{ height: 32, width: 220, border: "1px solid #CBD5E1", borderRadius: 7, padding: "0 10px", fontSize: "0.72rem", color: "#334155", outline: "none", fontFamily: "Inter, system-ui, sans-serif" }}
                        />
                        <span style={{ color: C.muted, fontSize: "0.70rem", fontWeight: 600 }}>{filtered.length} records</span>
                    </div>
                    <div style={{ width: "100%", flex: 1, minHeight: 0, overflow: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isCcc ? 650 : isTrade || isTrend ? 520 : 760 }}>
                            <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
                                <tr>
                                    {isCcc ? (
                                        <>
                                            <th style={th}>PERIOD</th><th style={thRight}>DSO</th><th style={thRight}>DIO</th><th style={thRight}>DPO</th><th style={thRight}>CCC</th>
                                        </>
                                    ) : isTrade || isTrend ? (
                                        <><th style={th}>PERIOD</th><th style={thRight}>{isTrade ? "TRADE WORKING CAPITAL" : "NET WORKING CAPITAL"}{currency ? ` (${currency})` : ""}</th></>
                                    ) : (
                                        <><th style={th}>PERIOD</th><th style={th}>CATEGORY</th><th style={thRight}>AMOUNT ({currency})</th><th style={thRight}>% OF TOTAL</th></>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.length ? pageRows.map((row, index) => {
                                    if (isCcc) return (
                                        <tr key={`${row.period}-${index}`}>
                                            <td style={td}>{row.period}</td>
                                            <td style={tdRight}>{row.dso == null ? "—" : Number(row.dso).toFixed(2)}</td>
                                            <td style={tdRight}>{row.dio == null ? "—" : Number(row.dio).toFixed(2)}</td>
                                            <td style={tdRight}>{row.dpo == null ? "—" : Number(row.dpo).toFixed(2)}</td>
                                            <td style={tdRight}>{row.ccc == null ? "—" : Number(row.ccc).toFixed(2)}</td>
                                        </tr>
                                    );
                                    if (isTrade || isTrend) return (
                                        <tr key={`${row.period}-${index}`}>
                                            <td style={td}>{row.period}</td>
                                            <td style={tdRight}>{modalFmt(row.value)}</td>
                                        </tr>
                                    );
                                    return (
                                        <tr key={`${row.period}-${row.particular}-${index}`}>
                                            <td style={td}>{row.period}</td>
                                            <td style={td}>{row.particular}</td>
                                            <td style={tdRight}>{modalFmt(row.amount)}</td>
                                            <td style={tdRight}>{row.percentage == null ? "—" : `${Number(row.percentage).toFixed(2)}%`}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={isCcc ? 5 : isTrade || isTrend ? 2 : 4} style={{ padding: 30, textAlign: "center", color: "#94A3B8", fontSize: "0.72rem" }}>{loading ? "Loading..." : "No available history."}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{
                    borderTop: "1px solid #E2E8F0",
                    padding: "9px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#FFFFFF",
                    flexShrink: 0,
                }}>
                    <span style={{ color: "#64748B", fontSize: "0.70rem" }}>
                        Showing {filtered.length ? `${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, filtered.length)}` : "0"} of {filtered.length} records
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <button type="button" disabled={safePage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ height: 30, padding: "0 10px", borderRadius: 7, border: "1px solid #E2E8F0", background: safePage === 0 ? "#F8FAFC" : "#FFFFFF", color: safePage === 0 ? "#94A3B8" : "#334155", fontSize: "0.68rem", fontWeight: 600 }}>← Prev</button>
                        <span style={{ color: "#334155", fontSize: "0.70rem", fontWeight: 700 }}>{safePage + 1} / {totalPages}</span>
                        <button type="button" disabled={safePage >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} style={{ height: 30, padding: "0 10px", borderRadius: 7, border: "1px solid #E2E8F0", background: safePage >= totalPages - 1 ? "#F8FAFC" : "#FFFFFF", color: safePage >= totalPages - 1 ? "#94A3B8" : "#334155", fontSize: "0.68rem", fontWeight: 600 }}>Next →</button>
                        <button type="button" onClick={onClose} style={{ height: 30, padding: "0 15px", borderRadius: 7, border: "none", background: "#E2E8F0", color: "#334155", fontSize: "0.68rem", fontWeight: 700 }}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const th = {
    padding: "8px",
    textAlign: "left",
    borderBottom:
        "2px solid #E2E8F0",
    color: "#1E3A8A",
    background: "#F8FAFC",
    fontSize: "0.70rem",
    fontWeight: 700,
};

const thRight = {
    ...th,
    textAlign: "right",
};

const td = {
    padding: "8px 10px",
    textAlign: "left",
    borderBottom:
        "1px solid #F1F5F9",
    color: "#334155",
    fontSize: "0.70rem",
    fontWeight: 500,
};

const tdRight = {
    ...td,
    textAlign: "right",
};

/* ============================================================
   MAIN REPORT
============================================================ */

export default function WorkingCapitalReport() {
    const [filters, setFilters] = useState({
        legalGroups: [],
        legalEntities: [],
        parentDivisions: [],
        subDivisions: [],
        asOnDate: "",
        periodName: "",
        agingBasis: "DUE_DATE",
    });

    // Load the Working Capital dashboard immediately on page load.
    // "appliedFilters" represents the filters currently used by the data APIs.
    // The user can edit the filter controls without changing loaded data until
    // Apply is clicked.
    const [appliedFilters, setAppliedFilters] =
        useState(null);

    const [filterOptionsLoaded, setFilterOptionsLoaded] =
        useState(false);

    const [filterOptions, setFilterOptions] =
        useState({
            legalGroups: [],
            legalEntities: [],
            parentDivisions: [],
            subDivisions: [],
            asOnDates: [],
            balanceSheetPeriods: [],
            agingBases: ["DUE_DATE"],
            reportingCurrency: "",
            operationalAsOnDate: "",
        });

    const [kpis, setKpis] = useState(null);
    const [components, setComponents] =
        useState(null);
    const [currentAssets, setCurrentAssets] =
        useState(null);
    const [currentLiabilities, setCurrentLiabilities] =
        useState(null);
    const [liquidityRatios, setLiquidityRatios] =
        useState(null);
    const [assetsVsLiabilities, setAssetsVsLiabilities] =
        useState(null);
    const [ccc, setCcc] = useState(null);
    const [trend, setTrend] = useState([]);
    const [tradeTrend, setTradeTrend] =
        useState([]);
    const [cccTrend, setCccTrend] =
        useState([]);

    const [loading, setLoading] =
        useState(true);
    const [error, setError] = useState("");
    const [exporting, setExporting] =
        useState(false);

    const [viewAll, setViewAll] = useState(
        null
    );
    const [viewAllLoading, setViewAllLoading] =
        useState(false);

    /* --------------------------------------------------------
       FILTER OPTIONS
    -------------------------------------------------------- */

    useEffect(() => {
        let active = true;

        async function loadFilterOptions() {
            try {
                /*
                 * Filter dropdowns are populated only from the backend.
                 * No hierarchy lists are hardcoded in the frontend.
                 *
                 * The API supports the standard hierarchy parameters plus
                 * aging_basis. On first load there are no hierarchy
                 * selections yet, so only the approved default aging basis
                 * is sent.
                 */
                const response =
                    await getWorkingCapitalFilterOptions({
                        aging_basis: "DUE_DATE",
                    });

                if (!active) return;

                const options =
                    normalizeFilterOptions(response);

                setFilterOptions(options);

                /*
                 * Set the backend-provided first available operational date
                 * as the initial UI date when available. This does NOT wait
                 * for the user to press Apply; it is the initial page-load
                 * filter used by the dashboard.
                 */
                const nextFilters = {
                    ...filters,
                    asOnDate:
                        filters.asOnDate ||
                        options.operationalAsOnDate ||
                        options.asOnDates[0] ||
                        "",
                    periodName:
                        filters.periodName ||
                        options.balanceSheetPeriods[0]?.value ||
                        "",
                    agingBasis:
                        filters.agingBasis ||
                        options.agingBases[0] ||
                        "DUE_DATE",
                };

                setFilters(nextFilters);
                setAppliedFilters((current) =>
                    current === null
                        ? { ...nextFilters }
                        : current
                );

                setFilterOptionsLoaded(true);
            } catch (err) {
                if (active) {
                    setLoading(false);
                    setFilterOptionsLoaded(true);
                    setError(
                        err?.response?.data
                            ?.detail ||
                        err?.message ||
                        "Unable to load Working Capital filter options."
                    );
                }
            }
        }

        loadFilterOptions();

        return () => {
            active = false;
        };
    }, []);

    /* --------------------------------------------------------
       LOAD DASHBOARD
    -------------------------------------------------------- */

    useEffect(() => {
        /*
         * Load all Working Capital dashboard components automatically after
         * the backend filter options are available. The user no longer needs
         * to press Apply just to see the initial dashboard.
         *
         * After that initial load, changing filter controls alone does not
         * trigger requests. Apply explicitly commits the selected filters.
         */
        if (!filterOptionsLoaded || !appliedFilters) return;

        let active = true;

        async function load() {
            setLoading(true);
            setError("");

            const apiFilters =
                buildApiFilters(
                    appliedFilters,
                    filterOptions
                );

            const dashboardFilters = {
                ...apiFilters,
                months: 6,
            };

            const results =
                await Promise.allSettled([
                    getWorkingCapitalKpis(
                        apiFilters
                    ),
                    getWorkingCapitalComponents(
                        apiFilters
                    ),
                    getWorkingCapitalCurrentAssets(
                        apiFilters
                    ),
                    getWorkingCapitalCurrentLiabilities(
                        apiFilters
                    ),
                    getWorkingCapitalLiquidityRatios(
                        apiFilters
                    ),
                    getWorkingCapitalAssetsVsLiabilities(
                        apiFilters
                    ),
                    getWorkingCapitalCashConversionCycle(
                        apiFilters
                    ),
                    getWorkingCapitalTrend(
                        dashboardFilters
                    ),
                    getWorkingCapitalTradeTrend(
                        dashboardFilters
                    ),
                    getWorkingCapitalCccTrend(
                        dashboardFilters
                    ),
                ]);

            if (!active) return;

            const value = (index) =>
                results[index]?.status ===
                    "fulfilled"
                    ? unwrapApiResponse(
                        results[index]
                            .value
                    )
                    : null;

            const kpiPayload = value(0);
            const componentsPayload = value(1);
            const assetsPayload = value(2);
            const liabilitiesPayload = value(3);
            const ratiosPayload = value(4);
            const avlPayload = value(5);
            const cccPayload = value(6);
            const trendPayload = value(7);
            const tradePayload = value(8);
            const cccTrendPayload = value(9);

            setKpis(kpiPayload);
            setComponents(
                componentsPayload
            );
            setCurrentAssets(
                assetsPayload
            );
            setCurrentLiabilities(
                liabilitiesPayload
            );
            setLiquidityRatios(
                ratiosPayload
            );
            setAssetsVsLiabilities(
                avlPayload
            );
            setCcc(cccPayload);

            setTrend(
                normalizeTrendRows(
                    trendPayload
                )
            );

            setTradeTrend(
                normalizeTradeTrendRows(
                    tradePayload
                )
            );

            setCccTrend(
                normalizeCccTrendRows(
                    cccTrendPayload
                )
            );

            const failed =
                results.filter(
                    (item) =>
                        item.status ===
                        "rejected"
                );

            if (
                failed.length ===
                results.length
            ) {
                throw failed[0].reason;
            }
        }

        load()
            .catch((err) => {
                if (!active) return;

                setError(
                    err?.response?.data
                        ?.detail ||
                    err?.message ||
                    "Unable to load Working Capital data."
                );
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [
        appliedFilters,
        filterOptions,
        filterOptionsLoaded,
    ]);

    /* --------------------------------------------------------
       DERIVED DISPLAY VALUES
       No KPI calculation is performed here.
       These are backend values only.
    -------------------------------------------------------- */

    const currency =
        kpis?.reporting_currency ||
        currentAssets?.reporting_currency ||
        currentLiabilities?.reporting_currency ||
        "—";

    const operationalDate =
        kpis?.operational_as_on_date ??
        ccc?.operational_as_on_date ??
        "—";

    // Current Assets / Current Liabilities / Liquidity Ratio are Balance Sheet
    // responses. Prefer the values returned by those APIs directly so the
    // dashboard always reflects the exact selected period.
    const balanceSheetPeriod =
        currentAssets?.period ??
        currentLiabilities?.period ??
        kpis?.balance_sheet_period ??
        "—";

    const balanceSheetPeriodEnd =
        currentAssets?.period_end ??
        currentLiabilities?.period_end ??
        kpis?.balance_sheet_period_end ??
        null;

    const assetRows = useMemo(
        () =>
            normalizeBreakdownRows(
                currentAssets
            ),
        [currentAssets]
    );

    const liabilityRows = useMemo(
        () =>
            normalizeBreakdownRows(
                currentLiabilities
            ),
        [currentLiabilities]
    );

    // Totals are taken directly from the Current Assets / Current
    // Liabilities API responses. No frontend summation is performed.
    const currentAssetsTotal = toNumber(
        currentAssets?.total ??
        kpis?.current_assets
    );

    const currentLiabilitiesTotal =
        toNumber(
            currentLiabilities?.total ??
            kpis?.current_liabilities
        );

    // Current Ratio must come from the dedicated liquidity-ratios API.
    // Do not recalculate it in the frontend and do not let a KPI payload
    // override the dedicated ratio response.
    const ratioFromLiquidityApi =
        normalizeCurrentRatio(
            liquidityRatios
        );

    const ratioRaw = getNullableValue(
        kpis,
        "current_ratio"
    );

    const ratioValue =
        ratioFromLiquidityApi !== null
            ? ratioFromLiquidityApi
            : toNumber(ratioRaw);

    const avlRows = getRows(
        assetsVsLiabilities
    );

    const componentData = components || {};

    const operationalStatus =
        getValue(
            ccc,
            "ccc_status"
        ) ??
        kpis?.ccc_status;

    /* --------------------------------------------------------
       CASCADING FILTER OPTIONS
       Legal Group -> Legal Entity -> Parent Division -> Sub-Division
       Only visible dropdown options are filtered; API contracts are unchanged.
    -------------------------------------------------------- */
    const cascadingFilterOptions = useMemo(() => {
        const selectedGroups = Array.isArray(filters.legalGroups)
            ? filters.legalGroups.map(String)
            : [];
        const selectedEntities = Array.isArray(filters.legalEntities)
            ? filters.legalEntities.map(String)
            : [];
        const selectedParents = Array.isArray(filters.parentDivisions)
            ? filters.parentDivisions.map(String)
            : [];

        const matches = (option, selected, relationKey) => {
            if (!selected.length) return true;

            const related = Array.isArray(option?.[relationKey])
                ? option[relationKey]
                : [];

            return !related.length ||
                related.some((id) => selected.includes(String(id)));
        };

        const legalEntities = filterOptions.legalEntities.filter((option) =>
            matches(option, selectedGroups, "legalGroupIds")
        );

        const visibleEntityIds = new Set(
            selectedEntities.length
                ? selectedEntities
                : legalEntities.map((option) => String(option.id))
        );

        const parentDivisions = filterOptions.parentDivisions.filter((option) =>
            matches(option, selectedGroups, "legalGroupIds") &&
            matches(option, [...visibleEntityIds], "legalEntityIds")
        );

        const visibleParentIds = new Set(
            selectedParents.length
                ? selectedParents
                : parentDivisions.map((option) => String(option.id))
        );

        const subDivisions = filterOptions.subDivisions.filter((option) =>
            matches(option, selectedGroups, "legalGroupIds") &&
            matches(option, [...visibleEntityIds], "legalEntityIds") &&
            matches(option, [...visibleParentIds], "parentDivisionIds")
        );

        return {
            ...filterOptions,
            legalEntities,
            parentDivisions,
            subDivisions,
        };
    }, [
        filterOptions,
        filters.legalGroups,
        filters.legalEntities,
        filters.parentDivisions,
    ]);

    /* --------------------------------------------------------
       FILTER ACTIONS
    -------------------------------------------------------- */

    function updateFilter(
        key,
        value
    ) {
        setFilters((previous) => {
            const next = {
                ...previous,
                [key]: value,
            };

            if (key === "legalGroups") {
                next.legalEntities = [];
                next.parentDivisions = [];
                next.subDivisions = [];
            } else if (key === "legalEntities") {
                next.parentDivisions = [];
                next.subDivisions = [];
            } else if (key === "parentDivisions") {
                next.subDivisions = [];
            }

            return next;
        });
    }

    function applyFilters() {
        /*
         * Commit the current multi-select hierarchy/date selections.
         * This triggers the complete Working Capital data load.
         */
        setAppliedFilters({
            ...filters,
        });
    }

    function resetFilters() {
        const next = {
            legalGroups: [],
            legalEntities: [],
            parentDivisions: [],
            subDivisions: [],
            asOnDate:
                filterOptions.operationalAsOnDate ||
                filterOptions.asOnDates[0] ||
                "",
            periodName:
                filterOptions.balanceSheetPeriods[0]?.value ||
                "",
            agingBasis:
                filterOptions.agingBases[0] ||
                "DUE_DATE",
        };

        setFilters(next);
        setAppliedFilters(next);
    }

    function handleRefresh() {
        setAppliedFilters(
            (previous) =>
                previous
                    ? { ...previous }
                    : null
        );
    }

    /* --------------------------------------------------------
       EXPORT
       Same filters as View All.
    -------------------------------------------------------- */

    async function handleExport(
        type,
        section,
        overrideFilters = null,
        overrideRows = null
    ) {
        setExporting(true);
        setError("");

        try {
            const activeFilters = overrideFilters || appliedFilters || filters;
            const apiFilters =
                buildApiFilters(
                    activeFilters,
                    filterOptions
                );

            let response;
            let fallback;

            if (section === "assets") {
                response =
                    type === "excel"
                        ? await exportWorkingCapitalCurrentAssetsExcel(
                            apiFilters
                        )
                        : await exportWorkingCapitalCurrentAssetsPdf(
                            apiFilters
                        );

                fallback =
                    type === "excel"
                        ? "working-capital-current-assets.xlsx"
                        : "working-capital-current-assets.pdf";

                downloadWorkingCapitalFile(
                    response,
                    fallback
                );
            } else if (section === "liabilities") {
                response =
                    type === "excel"
                        ? await exportWorkingCapitalCurrentLiabilitiesExcel(
                            apiFilters
                        )
                        : await exportWorkingCapitalCurrentLiabilitiesPdf(
                            apiFilters
                        );

                fallback =
                    type === "excel"
                        ? "working-capital-current-liabilities.xlsx"
                        : "working-capital-current-liabilities.pdf";

                downloadWorkingCapitalFile(
                    response,
                    fallback
                );
            } else if (section === "trend") {
                if (type === "excel") {
                    exportTrendToExcel(
                        overrideRows || trend,
                        "Net Working Capital",
                        currency,
                        "Net Working Capital"
                    );
                } else {
                    exportTrendToPdf(
                        overrideRows || trend,
                        "Net Working Capital",
                        currency,
                        "Net Working Capital"
                    );
                }
            } else if (section === "trade") {
                if (type === "excel") {
                    exportTrendToExcel(
                        overrideRows || tradeTrend,
                        "Trade Working Capital",
                        currency,
                        "Trade Working Capital"
                    );
                } else {
                    exportTrendToPdf(
                        overrideRows || tradeTrend,
                        "Trade Working Capital",
                        currency,
                        "Trade Working Capital"
                    );
                }
            } else if (section === "ccc") {
                if (type === "excel") {
                    exportCccTrendToExcel(overrideRows || cccTrend);
                } else {
                    exportCccTrendToPdf(overrideRows || cccTrend);
                }
            } else if (section === "liquidity") {
                if (type === "excel") {
                    exportLiquidityRatioToExcel(
                        ratioValue,
                        balanceSheetPeriod
                    );
                } else {
                    exportLiquidityRatioToPdf(
                        ratioValue,
                        balanceSheetPeriod
                    );
                }
            }
        } catch (err) {
            setError(
                err?.response?.data
                    ?.detail ||
                err?.message ||
                `Unable to export ${type}.`
            );
        } finally {
            setExporting(false);
        }
    }

    async function handleHeaderExport(format) {
        if (exporting) return;
        setExporting(true);
        try {
            const kpisRows = kpis ? Object.entries(kpis).map(([key, value]) => ({ metric: key, value })) : [];
            const componentsRows = [
                { label: "Receivables", value: getValue(components, "receivables", "total_receivables"), type: "positive" },
                { label: "Inventory", value: getValue(components, "inventory", "total_inventory"), type: "positive" },
                { label: "(-) Payables", value: getValue(components, "payables", "total_payables"), type: "negative" },
                { label: "Trade Working Capital", value: getValue(components, "trade_working_capital", "trade_working_capital_value", "working_capital"), type: "total" },
            ];
            const payload = { kpisRows, trend, tradeTrend, componentsRows, assetRows, liabilityRows, avlRows, cccTrend };
            if (format === "excel") exportWorkingCapitalAllToExcel(payload, currency);
            else exportWorkingCapitalAllToPdf(payload, currency);
        } catch (err) {
            setError(err?.message || `Working Capital ${format} export failed.`);
        } finally {
            setExporting(false);
        }
    }

    /* --------------------------------------------------------
       VIEW ALL
    -------------------------------------------------------- */

    async function openViewAll(type, overrideFilters = null) {
        setViewAllLoading(true);
        setError("");

        try {
            const activeFilters = overrideFilters || appliedFilters || filters;
            const apiFilters =
                buildApiFilters(
                    activeFilters,
                    filterOptions
                );

            let response;
            let rows = [];
            let title = "";

            if (type === "assets") {
                response =
                    await getWorkingCapitalCurrentAssetsViewAll(
                        apiFilters
                    );

                rows =
                    normalizeBreakdownRows(
                        response
                    );

                title =
                    `Current Assets — Full History (${currency})`;
            }

            if (type === "liabilities") {
                response =
                    await getWorkingCapitalCurrentLiabilitiesViewAll(
                        apiFilters
                    );

                rows =
                    normalizeBreakdownRows(
                        response
                    );

                title =
                    `Current Liabilities — Full History (${currency})`;
            }

            if (type === "trend") {
                response =
                    await getWorkingCapitalViewAllTrend(
                        apiFilters
                    );

                rows =
                    normalizeTrendRows(
                        response
                    );

                title =
                    `Net Working Capital — Full History (${currency})`;
            }

            if (type === "trade") {
                response =
                    await getWorkingCapitalViewAllTradeWorkingCapital(
                        apiFilters
                    );

                rows =
                    normalizeTradeTrendRows(
                        response
                    );

                title =
                    `Trade Working Capital — Full History (${currency})`;
            }

            if (type === "ccc") {
                response =
                    await getWorkingCapitalViewAllCcc(
                        apiFilters
                    );

                rows =
                    normalizeCccTrendRows(
                        response
                    );

                title =
                    "Cash Conversion Cycle — Full History";
            }

            if (type === "liquidity") {
                rows = [
                    {
                        period:
                            liquidityRatios?.period ??
                            balanceSheetPeriod ??
                            "—",
                        particular: "Current Ratio",
                        amount: ratioValue,
                        percentage: null,
                    },
                ];

                title =
                    "Key Liquidity Ratio";
            }

            setViewAll({
                type,
                title,
                rows,
                filters: { ...activeFilters },
            });
        } catch (err) {
            setError(
                err?.response?.data
                    ?.detail ||
                err?.message ||
                "Unable to load View All data."
            );
        } finally {
            setViewAllLoading(false);
        }
    }

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
            <style>{workingCapitalFilterResponsiveCss}</style>
            <style>{`
                .wc-sales-page, .wc-sales-page * {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                }
                .wc-sales-page .page-header {
                    padding-top: 4px;
                }
            `}</style>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes popIn {
                    from { opacity: 0; transform: translateY(4px) scale(.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes pulse-ripple {
                    0% { transform: scale(1); opacity: .8; }
                    70% { transform: scale(1.8); opacity: 0; }
                    100% { transform: scale(1.8); opacity: 0; }
                }

                @keyframes wcTrendDraw {
                    from {
                        stroke-dashoffset: 1400;
                        opacity: .35;
                    }
                    to {
                        stroke-dashoffset: 0;
                        opacity: 1;
                    }
                }

                .wc-trend-panel {
                    transition: transform .20s ease, box-shadow .20s ease;
                }

                .wc-trend-panel:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 24px rgba(15,23,42,.08);
                }

                .wc-sales-page {
                    animation: fadeIn .28s ease-out both;
                }

                @keyframes wcKpiIn {
                    0% { opacity: 0; transform: translateY(5px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                .wc-sales-kpis > div {
                    animation: wcKpiIn .28s ease-out both;
                }

                .wc-sales-kpis > div:nth-child(2) { animation-delay: .02s; }
                .wc-sales-kpis > div:nth-child(3) { animation-delay: .04s; }
                .wc-sales-kpis > div:nth-child(4) { animation-delay: .06s; }
                .wc-sales-kpis > div:nth-child(5) { animation-delay: .08s; }
                .wc-sales-kpis > div:nth-child(6) { animation-delay: .10s; }
                .wc-sales-kpis > div:nth-child(7) { animation-delay: .12s; }
                .wc-sales-kpis > div:nth-child(8) { animation-delay: .14s; }
                .wc-sales-kpis > div:nth-child(9) { animation-delay: .16s; }

                .wc-sales-page .wc-sales-kpis > div:hover {
                    transform: translateY(-2px);
                }
                .wc-sales-page .wc-panel-animate {
                    animation: popIn .30s ease-out both;
                }
                .wc-sales-page .wc-page-skeleton {
                    animation: fadeIn .20s ease-out both;
                }
                .wc-sales-page .wc-page-skeleton > div > div {
                    border-radius: 14px !important;
                }
                .wc-sales-page button:hover:not(:disabled) {
                    transform: translateY(-1px);
                }

                @keyframes wcKpiIn {
                    0% { opacity: 0; transform: translateY(5px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                .wc-sales-kpis > div {
                    animation: wcKpiIn .28s ease-out both;
                }

                .wc-sales-kpis > div:nth-child(2) { animation-delay: .02s; }
                .wc-sales-kpis > div:nth-child(3) { animation-delay: .04s; }
                .wc-sales-kpis > div:nth-child(4) { animation-delay: .06s; }
                .wc-sales-kpis > div:nth-child(5) { animation-delay: .08s; }
                .wc-sales-kpis > div:nth-child(6) { animation-delay: .10s; }
                .wc-sales-kpis > div:nth-child(7) { animation-delay: .12s; }
                .wc-sales-kpis > div:nth-child(8) { animation-delay: .14s; }
                .wc-sales-kpis > div:nth-child(9) { animation-delay: .16s; }

                .wc-sales-page .wc-sales-kpis > div:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 22px rgba(15,23,42,.08);
                    border-color: #CBD5E1;
                }

                .wc-sales-page select:focus,
                .wc-sales-page input:focus {
                    border-color: #818CF8 !important;
                    box-shadow: 0 0 0 3px rgba(99,102,241,.10);
                }

                .wc-sales-page table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: .74rem;
                }

                .wc-sales-page table thead th {
                    background: #F8FAFC;
                    color: #1E3A8A;
                    font-size: .74rem;
                    font-weight: 700;
                    padding: 8px 10px;
                    border-bottom: 2px solid #E2E8F0;
                }

                .wc-sales-page table tbody td {
                    color: #334155;
                    font-size: .74rem;
                    font-weight: 500;
                    padding: 8px 10px;
                    border-bottom: 1px solid #F1F5F9;
                }

                .wc-sales-page .wc-sales-data-table {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                }

                .wc-sales-page .wc-sales-data-table thead th {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                    font-size: .74rem !important;
                    font-weight: 700 !important;
                    padding: 8px 16px !important;
                    color: #1E3A8A !important;
                }

                .wc-sales-page .wc-sales-data-table tbody td {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                    font-size: .74rem !important;
                    padding: 8px 16px !important;
                }

                .wc-sales-page .wc-breakdown-sales-table,
                .wc-sales-page .wc-breakdown-sales-table * {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                }

                .wc-sales-page .wc-breakdown-sales-table thead th {
                    font-size: .76rem !important;
                    font-weight: 700 !important;
                    color: #1E3A8A !important;
                    padding: 8px 16px !important;
                }

                .wc-sales-page .wc-breakdown-sales-table tbody td {
                    font-size: .80rem !important;
                    font-weight: 600 !important;
                    color: #334155 !important;
                    padding: 8px 16px !important;
                }

                /* Total row: keep these values darker and heavier than the
                   generic breakdown-table rule above. */
                .wc-sales-page .wc-breakdown-sales-table tbody tr.wc-breakdown-total-row td:first-child {
                    color: #172554 !important;
                    font-weight: 900 !important;
                }

                .wc-sales-page .wc-breakdown-sales-table tbody tr.wc-breakdown-total-row td:nth-child(2),
                .wc-sales-page .wc-breakdown-sales-table tbody tr.wc-breakdown-total-row td:nth-child(3) {
                    color: #1E293B !important;
                    font-weight: 900 !important;
                }

                .wc-sales-page table tbody tr {
                    transition: background .12s ease;
                }

                .wc-sales-page table tbody tr:hover {
                    background: #F8FAFC;
                }

                .wc-skeleton-line,
                .wc-skeleton-chart {
                    background: linear-gradient(
                        90deg,
                        #E2E8F0 25%,
                        #F1F5F9 50%,
                        #E2E8F0 75%
                    );
                    background-size: 200% 100%;
                    border-radius: 6px;
                    animation: shimmer 1.4s infinite;
                }

                .wc-skeleton-chart {
                    height: 180px;
                    margin-top: 18px;
                    border-radius: 8px;
                }

                .wc-panel-animate {
                    animation: fadeIn .35s ease-out both;
                }

                .wc-sales-page .wc-panel-animate:nth-child(2) {
                    animation-delay: .04s;
                }

                .wc-sales-page .wc-panel-animate:nth-child(3) {
                    animation-delay: .08s;
                }

                .wc-sales-page .wc-panel-animate:nth-child(4) {
                    animation-delay: .12s;
                }


                .wc-sales-page ::-webkit-scrollbar { width: 14px; height: 14px; }
                .wc-sales-page ::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 6px; }
                .wc-sales-page ::-webkit-scrollbar-thumb { background: #64748b; border-radius: 6px; border: 3px solid #e2e8f0; }
                .wc-sales-page ::-webkit-scrollbar-thumb:hover { background: #334155; }
                @media (max-width: 1400px) {
                    .wc-sales-kpis {
                        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
                    }
                }

                @media (max-width: 1200px) {
                    .wc-sales-kpis {
                        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    }
                }

                @media (max-width: 1000px) {
                    .wc-sales-kpis {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    }
                    .wc-page-skeleton > div {
                        grid-template-columns: 1fr !important;
                    }
                    .wc-page-skeleton > div:first-child {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    }
                    .wc-sales-main-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .wc-sales-three-grid {
                        grid-template-columns: 1fr !important;
                    }
                }

                @media (max-width: 600px) {
                    .wc-sales-kpis,
                    .wc-sales-main-grid,
                    .wc-sales-three-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .wc-page-skeleton > div,
                    .wc-page-skeleton > div:first-child {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
            <div className="wc-sales-page animate-in" style={{ paddingTop: "16px" }}>
                <div className="page-header" style={{ marginBottom: "24px", paddingTop: "8px", gap: "20px" }}>
                    <div>
                        <h1 className="page-header-title wc-page-title">
                            <span style={{ fontSize: "1.3rem" }}>📈</span> Working Capital Report
                        </h1>

                        <p className="page-header-subtitle">
                            Track working capital position and efficiency across all dimensions
                            <br />
                            <span style={{ display: "inline-block", marginTop: 4, fontWeight: 600, color: "#64748B", fontSize: "0.74rem" }}>
                                Reporting currency: <strong style={{ color: "#16A34A" }}>{currency}</strong>
                                <span style={{ margin: "0 6px", color: "#CBD5E1" }}>•</span>
                                Operational as on: {formatDate(operationalDate)}
                                <span style={{ margin: "0 6px", color: "#CBD5E1" }}>•</span>
                                Balance Sheet Period: {balanceSheetPeriod || "—"}{balanceSheetPeriodEnd ? ` (${formatDate(balanceSheetPeriodEnd)})` : ""}
                            </span>
                        </p>
                    </div>

                    <div
                        style={
                            styles.headerActions
                        }
                    >
                        <button
                            type="button"
                            onClick={() => handleHeaderExport("excel")}
                            disabled={exporting}
                            style={{
                                ...styles.button,
                                color: "#15803D",
                                background: "#F0FDF4",
                                borderColor: "#BBF7D0",
                                minWidth: 78,
                            }}
                        >
                            {exporting ? "⏳" : "📊"} Excel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleHeaderExport("pdf")}
                            disabled={exporting}
                            style={{
                                ...styles.button,
                                color: "#BE123C",
                                background: "#FFF1F2",
                                borderColor: "#FECDD3",
                                minWidth: 72,
                            }}
                        >
                            {exporting ? "⏳" : "📄"} PDF
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleRefresh
                            }
                            style={{
                                ...styles.button,
                                width: "40px",
                                padding: 0,
                                fontSize: "17px",
                                color: "#4F46E5",
                            }}
                            disabled={loading}
                            title="Refresh"
                        >
                            ↻
                        </button>
                    </div>
                </div>

                <div
                    className="wc-filter-grid"
                    style={
                        styles.filterContainer
                    }
                >
                    {!filterOptionsLoaded && (
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                color: "#64748B",
                                fontSize: "10px",
                                padding: "2px 0 4px",
                            }}
                        >
                            Loading Working Capital filter options...
                        </div>
                    )}
                    <MultiSelectField
                        label="Legal Group"
                        values={filters.legalGroups}
                        options={cascadingFilterOptions.legalGroups}
                        onChange={(value) =>
                            updateFilter("legalGroups", value)
                        }
                    />

                    <MultiSelectField
                        label="Legal Entity"
                        values={filters.legalEntities}
                        options={cascadingFilterOptions.legalEntities}
                        onChange={(value) =>
                            updateFilter("legalEntities", value)
                        }
                    />

                    <MultiSelectField
                        label="Parent Division"
                        values={filters.parentDivisions}
                        options={cascadingFilterOptions.parentDivisions}
                        onChange={(value) =>
                            updateFilter("parentDivisions", value)
                        }
                    />

                    <MultiSelectField
                        label="Sub-Division"
                        values={filters.subDivisions}
                        options={cascadingFilterOptions.subDivisions}
                        onChange={(value) =>
                            updateFilter("subDivisions", value)
                        }
                    />

                    <div style={{ minWidth: 0 }}>
                        <label style={styles.filterLabel}>
                            As On Date
                        </label>
                        <CalendarDateField
                            value={filters.asOnDate || ""}
                            onChange={(value) =>
                                updateFilter("asOnDate", value)
                            }
                            width="100%"
                        />
                    </div>

                    <SingleSelectField
                        label="Balance Sheet Period"
                        value={filters.periodName}
                        options={filterOptions.balanceSheetPeriods}
                        onChange={(value) =>
                            updateFilter("periodName", value)
                        }
                    />

                    <SingleSelectField
                        label="Aging Basis"
                        value={filters.agingBasis}
                        options={filterOptions.agingBases}
                        onChange={(value) =>
                            updateFilter("agingBasis", value)
                        }
                    />

                    <div style={{ minWidth: 0 }}>
                        <label style={styles.filterLabel}>
                            Reporting Currency
                        </label>
                        <div
                            style={{
                                ...styles.filterInput,
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                color: "#334155",
                                fontWeight: 700,
                                background: "#F8FAFC",
                            }}
                        >
                            {filterOptions.reportingCurrency || "—"}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={applyFilters}
                        style={{
                            height: "32px",
                            padding: "0 18px",
                            background: "#4F46E5",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Apply
                    </button>

                    <button
                        type="button"
                        onClick={
                            resetFilters
                        }
                        style={{
                            height: "32px",
                            border: "none",
                            background:
                                "transparent",
                            color: "#263BD4",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Reset
                    </button>
                </div>

                {error && (
                    <div
                        style={{
                            ...styles.panel,
                            marginBottom: "10px",
                            color: "#B42318",
                            background:
                                "#FEF3F2",
                        }}
                    >
                        {error}
                    </div>
                )}

                {loading && <PageSkeleton />}

                {viewAllLoading && (
                    <div
                        style={{
                            ...styles.panel,
                            marginBottom: "10px",
                            color: "#475467",
                        }}
                    >
                        Loading full available
                        history...
                    </div>
                )}

                {!loading && (
                    <>
                        {/* ==================================================
                        KPI CARDS
                    ================================================== */}

                        <div className="wc-sales-kpis kpi-grid">
                            <KpiCard
                                title="Trade Working Capital"
                                value={formatAmount(
                                    kpis?.trade_working_capital,
                                    currency
                                )}
                                subtitle={
                                    operationalDate !== "—"
                                        ? `As of ${formatDate(operationalDate)}`
                                        : undefined
                                }
                                icon="↗"
                            />

                            <KpiCard
                                title="Net Working Capital"
                                value={formatAmount(
                                    kpis?.net_working_capital,
                                    currency
                                )}
                                subtitle={
                                    balanceSheetPeriod !== "—"
                                        ? `Period: ${balanceSheetPeriod}`
                                        : undefined
                                }
                                icon="▣"
                            />

                            <KpiCard
                                title="Current Assets"
                                value={formatAmount(
                                    kpis?.current_assets,
                                    currency
                                )}
                                subtitle={
                                    balanceSheetPeriod !== "—"
                                        ? `Period: ${balanceSheetPeriod}`
                                        : undefined
                                }
                                icon="▥"
                            />

                            <KpiCard
                                title="Current Liabilities"
                                value={formatAmount(
                                    kpis?.current_liabilities,
                                    currency
                                )}
                                subtitle={
                                    balanceSheetPeriod !== "—"
                                        ? `Period: ${balanceSheetPeriod}`
                                        : undefined
                                }
                                icon="▤"
                            />

                            <KpiCard
                                title="Current Ratio"
                                value={
                                    ratioValue === null
                                        ? "—"
                                        : ratioValue.toFixed(2)
                                }
                                subtitle={
                                    balanceSheetPeriod !== "—"
                                        ? `Period: ${balanceSheetPeriod}`
                                        : undefined
                                }
                                icon="◔"
                            />

                            <KpiCard
                                title="DSO"
                                value={
                                    toNumber(kpis?.dso_days) === null
                                        ? "—"
                                        : `${toNumber(kpis.dso_days).toFixed(2)} Days`
                                }
                                subtitle={
                                    operationalDate !== "—"
                                        ? `As of ${formatDate(operationalDate)}`
                                        : undefined
                                }
                                icon="◷"
                            />

                            <KpiCard
                                title="DIO"
                                value={
                                    toNumber(kpis?.dio_days) === null
                                        ? "—"
                                        : `${toNumber(kpis.dio_days).toFixed(2)} Days`
                                }
                                subtitle={
                                    toNumber(kpis?.dio_days) === null
                                        ? "Insufficient history"
                                        : operationalDate !== "—"
                                            ? `As of ${formatDate(operationalDate)}`
                                            : undefined
                                }
                                icon="▦"
                            />

                            <KpiCard
                                title="DPO"
                                value={
                                    toNumber(kpis?.dpo_days) === null
                                        ? "—"
                                        : `${toNumber(kpis.dpo_days).toFixed(2)} Days`
                                }
                                subtitle={
                                    operationalDate !== "—"
                                        ? `As of ${formatDate(operationalDate)}`
                                        : undefined
                                }
                                icon="◒"
                            />

                            <KpiCard
                                title="CCC"
                                value={
                                    toNumber(
                                        kpis?.cash_conversion_cycle_days
                                    ) === null
                                        ? "—"
                                        : `${toNumber(
                                            kpis.cash_conversion_cycle_days
                                        ).toFixed(2)} Days`
                                }
                                subtitle={
                                    toNumber(
                                        kpis?.cash_conversion_cycle_days
                                    ) === null
                                        ? "Insufficient history"
                                        : operationalDate !== "—"
                                            ? `As of ${formatDate(operationalDate)}`
                                            : undefined
                                }
                                icon="◴"
                            />
                        </div>

                        {/* ==================================================
                        DASHBOARD TRENDS
                    ================================================== */}

                        <div
                            className="wc-sales-main-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(2, minmax(0, 1fr))",
                                gap: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <SimpleTrendChart
                                data={trend}
                                currency={currency}
                                title={`Working Capital Trend (${currency})`}
                                valueLabel={currency}
                                metricLabel="Net Working Capital"
                                onViewAll={() =>
                                    openViewAll("trend")
                                }
                                onExportExcel={() =>
                                    exportTrendToExcel(
                                        trend,
                                        "Working Capital Trend",
                                        currency,
                                        "Net Working Capital"
                                    )
                                }
                                onExportPdf={() =>
                                    exportTrendToPdf(
                                        trend,
                                        "Working Capital Trend",
                                        currency,
                                        "Net Working Capital"
                                    )
                                }
                            />

                            <TradeWorkingCapitalTrendPanel
                                data={tradeTrend}
                                currency={currency}
                                onViewAll={() =>
                                    openViewAll("trade")
                                }
                                onExportExcel={() =>
                                    exportTrendToExcel(
                                        tradeTrend,
                                        "Trade Working Capital Trend",
                                        currency,
                                        "Trade Working Capital"
                                    )
                                }
                                onExportPdf={() =>
                                    exportTrendToPdf(
                                        tradeTrend,
                                        "Trade Working Capital Trend",
                                        currency,
                                        "Trade Working Capital"
                                    )
                                }
                            />
                        </div>

                        {/* ==================================================
                        COMPONENTS / ASSETS VS LIABILITIES
                    ================================================== */}

                        <div
                            className="wc-sales-main-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(2, minmax(0, 1fr))",
                                gap: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <TradeWorkingCapitalComponents
                                components={
                                    componentData
                                }
                                currency={currency}
                            />

                            <AssetsVsLiabilitiesPanel
                                data={
                                    avlRows
                                }
                                currency={
                                    currency
                                }
                                period={
                                    balanceSheetPeriod
                                }
                                periodEnd={
                                    balanceSheetPeriodEnd
                                }
                                fallbackAssets={
                                    currentAssetsTotal
                                }
                                fallbackLiabilities={
                                    currentLiabilitiesTotal
                                }
                                onViewAll={() => openViewAll("assets")}
                            />
                        </div>

                        {/* ==================================================
                        CURRENT ASSETS / LIABILITIES
                    ================================================== */}

                        <div
                            className="wc-sales-three-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1.08fr 1.08fr 0.92fr",
                                gap: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <BreakdownTable
                                title={`Current Assets Breakdown (${currency})`}
                                rows={assetRows}
                                total={
                                    currentAssetsTotal
                                }
                                currency={
                                    currency
                                }
                                period={
                                    currentAssets?.period ??
                                    balanceSheetPeriod
                                }
                                periodEnd={
                                    currentAssets?.period_end ??
                                    balanceSheetPeriodEnd
                                }
                                onViewAll={() =>
                                    openViewAll(
                                        "assets"
                                    )
                                }
                                onExportExcel={() =>
                                    handleExport(
                                        "excel",
                                        "assets"
                                    )
                                }
                                onExportPdf={() =>
                                    handleExport(
                                        "pdf",
                                        "assets"
                                    )
                                }
                            />

                            <BreakdownTable
                                title={`Current Liabilities Breakdown (${currency})`}
                                rows={
                                    liabilityRows
                                }
                                total={
                                    currentLiabilitiesTotal
                                }
                                currency={
                                    currency
                                }
                                period={
                                    currentLiabilities?.period ??
                                    balanceSheetPeriod
                                }
                                periodEnd={
                                    currentLiabilities?.period_end ??
                                    balanceSheetPeriodEnd
                                }
                                onViewAll={() =>
                                    openViewAll(
                                        "liabilities"
                                    )
                                }
                                onExportExcel={() =>
                                    handleExport(
                                        "excel",
                                        "liabilities"
                                    )
                                }
                                onExportPdf={() =>
                                    handleExport(
                                        "pdf",
                                        "liabilities"
                                    )
                                }
                            />

                            <LiquidityRatioCard
                                currentRatio={
                                    ratioValue
                                }
                                currency={currency}
                                period={
                                    liquidityRatios?.period ??
                                    balanceSheetPeriod
                                }
                                periodEnd={
                                    balanceSheetPeriodEnd
                                }
                                onViewAll={() =>
                                    openViewAll(
                                        "liquidity"
                                    )
                                }
                                onExportExcel={() =>
                                    handleExport(
                                        "excel",
                                        "liquidity"
                                    )
                                }
                                onExportPdf={() =>
                                    handleExport(
                                        "pdf",
                                        "liquidity"
                                    )
                                }
                            />
                        </div>

                        {/* ==================================================
                        CCC / INSIGHTS
                    ================================================== */}

                        <div
                            className="wc-sales-main-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(2, minmax(0, 1fr))",
                                gap: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <CashConversionCycle
                                kpis={kpis}
                                cccPayload={ccc}
                                operationalDate={
                                    operationalDate
                                }
                            />

                            <div className="wc-panel-animate" style={styles.panel}>
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center",
                                    }}
                                >
                                    <h3
                                        style={{
                                            ...styles.panelTitle,
                                            marginBottom:
                                                0,
                                        }}
                                    >
                                        Cash Conversion
                                        Cycle Trend (Days)
                                    </h3>

                                    <ActionMenu
                                        items={[
                                            {
                                                key: "view-all",
                                                label: "🔎 View All",
                                                onClick: () => openViewAll("ccc"),
                                            },
                                            {
                                                key: "excel",
                                                label: "📊 Export Excel",
                                                onClick: () => handleExport("excel", "ccc"),
                                            },
                                            {
                                                key: "pdf",
                                                label: "📄 Export PDF",
                                                onClick: () => handleExport("pdf", "ccc"),
                                            },
                                        ]}
                                    />
                                </div>

                                <CccTrendMini
                                    data={
                                        cccTrend
                                    }
                                />
                            </div>
                        </div>

                    </>
                )}

                {viewAll && (
                    <ViewAllModal
                        title={viewAll.title}
                        rows={viewAll.rows}
                        currency={currency}
                        type={viewAll.type}
                        onClose={() => setViewAll(null)}
                        filterOptions={filterOptions}
                        baseFilters={viewAll.filters || appliedFilters || filters}
                        loading={viewAllLoading}
                        onApplyFilters={(nextFilters) => openViewAll(viewAll.type, nextFilters)}
                        onExport={handleExport}
                    />
                )}
            </div>
        </>
    );
}

/* ============================================================
   EXTRA VISUALS
============================================================ */

function TradeWorkingCapitalTrendPanel({
    data,
    currency,
    onViewAll,
    onExportExcel,
    onExportPdf,
}) {
    return (
        <SimpleTrendChart
            data={data}
            currency={currency}
            title={`Trade Working Capital Trend (${currency})`}
            valueLabel=""
            metricLabel="Trade Working Capital"
            nullText="No aligned Receivables / Inventory / Payables observations are available."
            onViewAll={onViewAll}
            onExportExcel={onExportExcel}
            onExportPdf={onExportPdf}
        />
    );
}

function AssetsVsLiabilitiesPanel({
    data,
    currency,
    period,
    periodEnd,
    fallbackAssets,
    fallbackLiabilities,
    onViewAll,
}) {
    const raw = data.length
        ? data
        : [
            {
                label: "Current Assets",
                previous: null,
                current: fallbackAssets,
            },
            {
                label: "Current Liabilities",
                previous: null,
                current: fallbackLiabilities,
            },
        ];

    const rows = raw.map((row) => ({
        label:
            getValue(
                row,
                "label",
                "category",
                "name",
                "particular"
            ) ?? "—",
        previous: toNumber(
            getValue(
                row,
                "previous",
                "previous_assets",
                "previous_liabilities",
                "prior"
            )
        ),
        current: toNumber(
            getValue(
                row,
                "current",
                "current_assets",
                "current_liabilities",
                "value"
            )
        ),
    }));

    const values = rows
        .flatMap((row) => [row.previous, row.current])
        .filter((v) => v !== null);

    const maxValue = Math.max(...values, 1);
    const width = 640;
    const height = 245;
    const left = 46;
    const right = 18;
    const top = 30;
    const bottom = 52;
    const plotHeight = height - top - bottom;
    const groupSlot =
        (width - left - right) /
        Math.max(rows.length, 1);
    const barWidth = Math.min(
        30,
        groupSlot * 0.25
    );

    const [hovered, setHovered] = useState(null);

    const hoveredRow =
        hovered?.rowIndex !== undefined
            ? rows[hovered.rowIndex]
            : null;

    return (
        <div
            className="wc-panel-animate"
            style={{
                ...styles.panel,
                position: "relative",
                overflow: "visible",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <div>
                    <h3
                        style={{
                            ...styles.panelTitle,
                            marginBottom: 2,
                        }}
                    >
                        Current Assets vs Current Liabilities ({currency})
                    </h3>
                    <div
                        style={{
                            fontSize: "0.68rem",
                            color: C.muted,
                            marginTop: 2,
                            fontWeight: 500,
                        }}
                    >
                        {currency} — Balance Sheet Period: {period || "—"}
                        {periodEnd
                            ? ` (${formatDate(periodEnd)})`
                            : ""}
                    </div>
                </div>

                <ActionMenu
                    items={[
                        {
                            key: "view-all",
                            label: "🔎 View All",
                            onClick: onViewAll,
                        },
                        {
                            key: "excel",
                            label: "📊 Export Excel",
                            onClick: () => exportAssetsVsLiabilitiesToExcel(rows, currency),
                        },
                        {
                            key: "pdf",
                            label: "📄 Export PDF",
                            onClick: () => exportAssetsVsLiabilitiesToPdf(rows, currency, period),
                        },
                    ]}
                />
            </div>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                style={{
                    display: "block",
                    marginTop: "3px",
                    overflow: "visible",
                }}
                onMouseLeave={() => setHovered(null)}
            >
                <defs>
                    <linearGradient
                        id="wc-avl-previous"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="#818CF8" />
                        <stop offset="100%" stopColor="#4F46E5" />
                    </linearGradient>
                    <linearGradient
                        id="wc-avl-current"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                    const yy =
                        height -
                        bottom -
                        fraction * plotHeight;

                    return (
                        <g key={fraction}>
                            <line
                                x1={left}
                                x2={width - right}
                                y1={yy}
                                y2={yy}
                                stroke="#E2E8F0"
                                strokeDasharray={
                                    fraction === 0
                                        ? "0"
                                        : "3 4"
                                }
                            />
                            <text
                                x={left - 6}
                                y={yy + 3}
                                textAnchor="end"
                                fontSize="10"
                                fontWeight="600"
                                fill="#94A3B8"
                            >
                                {formatAmount(
                                    maxValue * fraction,
                                    "",
                                    true
                                )}
                            </text>
                        </g>
                    );
                })}

                {rows.map((row, index) => {
                    const center =
                        left +
                        groupSlot * index +
                        groupSlot / 2;
                    const previousHeight =
                        row.previous === null
                            ? 0
                            : (row.previous / maxValue) *
                            plotHeight;
                    const currentHeight =
                        row.current === null
                            ? 0
                            : (row.current / maxValue) *
                            plotHeight;
                    const previousX =
                        center - barWidth - 3;
                    const currentX = center + 3;
                    const previousY =
                        height - bottom - previousHeight;
                    const currentY =
                        height - bottom - currentHeight;
                    const isHovered =
                        hovered?.rowIndex === index;

                    return (
                        <g key={`${row.label}-${index}`}>
                            {row.previous !== null && (
                                <g
                                    onMouseEnter={() =>
                                        setHovered({
                                            rowIndex: index,
                                            series: "previous",
                                        })
                                    }
                                    style={{
                                        cursor: "pointer",
                                    }}
                                >
                                    <rect
                                        x={previousX}
                                        y={previousY}
                                        width={barWidth}
                                        height={previousHeight}
                                        rx="5"
                                        fill="url(#wc-avl-previous)"
                                        opacity={
                                            hovered === null ||
                                                isHovered
                                                ? 1
                                                : 0.62
                                        }
                                        style={{
                                            transition:
                                                "opacity .18s ease, filter .18s ease, transform .18s ease",
                                            transformOrigin: `${previousX + barWidth / 2}px ${height - bottom}px`,
                                            transform:
                                                isHovered
                                                    ? "translateY(-2px)"
                                                    : "translateY(0)",
                                            filter:
                                                isHovered
                                                    ? "drop-shadow(0 6px 7px rgba(79,70,229,.25))"
                                                    : "none",
                                        }}
                                    />
                                    <text
                                        x={
                                            previousX +
                                            barWidth / 2
                                        }
                                        y={Math.max(
                                            top + 10,
                                            previousY - 6
                                        )}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="700"
                                        fill="#334155"
                                    >
                                        {formatAmount(
                                            row.previous,
                                            "",
                                            true
                                        )}
                                    </text>
                                    {hovered?.rowIndex === index && hovered?.series === "previous" && (
                                        <g pointerEvents="none" style={{ filter: "drop-shadow(0 5px 12px rgba(15,23,42,.14))", animation: "wcTooltipIn .14s ease-out forwards" }}>
                                            <rect x={Math.max(4, Math.min(width - 174, previousX + barWidth / 2 - 87))} y={Math.max(6, previousY - 72)} width="174" height="56" rx="9" fill="#FFFFFF" stroke="#C7D2FE" />
                                            <rect x={Math.max(4, Math.min(width - 174, previousX + barWidth / 2 - 87)) + 10} y={Math.max(6, previousY - 72) + 12} width="7" height="7" rx="1.5" fill="#6366F1" />
                                            <text x={Math.max(4, Math.min(width - 174, previousX + barWidth / 2 - 87)) + 23} y={Math.max(6, previousY - 72) + 19} fontSize="11" fontWeight="700" fill="#334155">
                                                {row.label} — Previous
                                            </text>
                                            <text x={Math.max(4, Math.min(width - 174, previousX + barWidth / 2 - 87)) + 10} y={Math.max(6, previousY - 72) + 43} fontSize="13" fontWeight="800" fill="#4F46E5">
                                                {currency ? `${currency} ${Number(row.previous).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : Number(row.previous).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            )}

                            {row.current !== null && (
                                <g
                                    onMouseEnter={() =>
                                        setHovered({
                                            rowIndex: index,
                                            series: "current",
                                        })
                                    }
                                    style={{
                                        cursor: "pointer",
                                    }}
                                >
                                    <rect
                                        x={currentX}
                                        y={currentY}
                                        width={barWidth}
                                        height={currentHeight}
                                        rx="5"
                                        fill="url(#wc-avl-current)"
                                        opacity={
                                            hovered === null ||
                                                isHovered
                                                ? 1
                                                : 0.62
                                        }
                                        style={{
                                            transition:
                                                "opacity .18s ease, filter .18s ease, transform .18s ease",
                                            transformOrigin: `${currentX + barWidth / 2}px ${height - bottom}px`,
                                            transform:
                                                isHovered
                                                    ? "translateY(-2px)"
                                                    : "translateY(0)",
                                            filter:
                                                isHovered
                                                    ? "drop-shadow(0 6px 7px rgba(5,150,105,.25))"
                                                    : "none",
                                        }}
                                    />
                                    <text
                                        x={
                                            currentX +
                                            barWidth / 2
                                        }
                                        y={Math.max(
                                            top + 10,
                                            currentY - 6
                                        )}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="700"
                                        fill="#334155"
                                    >
                                        {formatAmount(
                                            row.current,
                                            "",
                                            true
                                        )}
                                    </text>
                                    {hovered?.rowIndex === index && hovered?.series === "current" && (
                                        <g pointerEvents="none" style={{ filter: "drop-shadow(0 5px 12px rgba(15,23,42,.14))", animation: "wcTooltipIn .14s ease-out forwards" }}>
                                            <rect x={Math.max(4, Math.min(width - 174, currentX + barWidth / 2 - 87))} y={Math.max(6, currentY - 72)} width="174" height="56" rx="9" fill="#FFFFFF" stroke="#A7F3D0" />
                                            <rect x={Math.max(4, Math.min(width - 174, currentX + barWidth / 2 - 87)) + 10} y={Math.max(6, currentY - 72) + 12} width="7" height="7" rx="1.5" fill="#059669" />
                                            <text x={Math.max(4, Math.min(width - 174, currentX + barWidth / 2 - 87)) + 23} y={Math.max(6, currentY - 72) + 19} fontSize="11" fontWeight="700" fill="#334155">
                                                {row.label} — Current
                                            </text>
                                            <text x={Math.max(4, Math.min(width - 174, currentX + barWidth / 2 - 87)) + 10} y={Math.max(6, currentY - 72) + 43} fontSize="13" fontWeight="800" fill="#047857">
                                                {currency ? `${currency} ${Number(row.current).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : Number(row.current).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            )}

                            <text
                                x={center}
                                y={height - 18}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="600"
                                fill="#64748B"
                            >
                                {row.label}
                            </text>
                        </g>
                    );
                })}

                <g
                    transform={`translate(${width - 170}, 9)`}
                >
                    <rect
                        x="0"
                        y="0"
                        width="8"
                        height="8"
                        rx="2"
                        fill="#6366F1"
                    />
                    <text
                        x="12"
                        y="8"
                        fontSize="8"
                        fill="#475467"
                    >
                        Previous
                    </text>
                    <rect
                        x="65"
                        y="0"
                        width="8"
                        height="8"
                        rx="2"
                        fill="#39A96B"
                    />
                    <text
                        x="77"
                        y="8"
                        fontSize="8"
                        fill="#475467"
                    >
                        Current
                    </text>
                </g>
            </svg>
        </div>
    );
}
function CccTrendMini({ data }) {
    const rows = Array.isArray(data) ? data : [];

    /*
     * This chart is intentionally driven ONLY by the backend's
     * cash_conversion_cycle_days value.
     *
     * We do not calculate:
     *   DSO + DIO - DPO
     *
     * When the backend returns CCC = null because inventory history
     * is insufficient, the chart does not convert it to 0, NaN,
     * Infinity, or any other substitute.
     */
    const validPoints = rows
        .map((row, index) => ({
            ...row,
            index,
            value: toNumber(row?.ccc),
        }))
        .filter((row) => row.value !== null);

    const hasInsufficientHistory = rows.some(
        (row) =>
            String(row?.status || "").toUpperCase() ===
            "INSUFFICIENT_INVENTORY_HISTORY"
    );

    if (!rows.length) {
        return (
            <div
                style={{
                    color: "#98A2B3",
                    fontSize: "10px",
                    padding: "25px 0",
                }}
            >
                No CCC history available.
            </div>
        );
    }

    if (!validPoints.length) {
        return (
            <div
                style={{
                    padding: "20px 4px 16px",
                    minHeight: "168px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                }}
                title={
                    hasInsufficientHistory
                        ? "DIO and CCC require sufficient inventory history."
                        : undefined
                }
            >
                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#475467",
                        marginBottom: "6px",
                    }}
                >
                    {hasInsufficientHistory
                        ? "Insufficient history"
                        : "—"}
                </div>

                <div
                    style={{
                        fontSize: "9px",
                        lineHeight: 1.45,
                        color: "#98A2B3",
                        maxWidth: "250px",
                    }}
                >
                    {hasInsufficientHistory
                        ? "DIO and CCC require sufficient inventory history."
                        : "No CCC values were returned by the backend."}
                </div>
            </div>
        );
    }

    const width = 640;
    const height = 220;
    const left = 42;
    const right = 22;
    const top = 20;
    const bottom = 42;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    const numericValues = validPoints.map(
        (point) => point.value
    );

    const minData = Math.min(...numericValues);
    const maxData = Math.max(...numericValues);

    /*
     * These are visual axis bounds only. They are not KPI calculations.
     * The plotted value itself is always the backend CCC value.
     */
    const axisMin = Math.max(
        0,
        minData === maxData
            ? minData * 0.75
            : Math.min(0, minData)
    );
    const axisMax =
        minData === maxData
            ? Math.max(1, maxData * 1.25)
            : maxData;

    const range =
        axisMax === axisMin
            ? 1
            : axisMax - axisMin;

    const xFor = (index) =>
        rows.length <= 1
            ? left + chartWidth / 2
            : left +
            (index / (rows.length - 1)) *
            chartWidth;

    const yFor = (value) =>
        top +
        ((axisMax - value) / range) *
        chartHeight;

    const pointByIndex = new Map(
        validPoints.map((point) => [
            point.index,
            {
                ...point,
                x: xFor(point.index),
                y: yFor(point.value),
            },
        ])
    );

    const formatPeriodLabel = (period) => {
        const value = String(period ?? "");

        const match = value.match(
            /^(\\d{4})-(\\d{1,2})$/
        );

        if (!match) {
            return value;
        }

        const year = Number(match[1]);
        const month = Number(match[2]);

        if (
            !Number.isInteger(year) ||
            !Number.isInteger(month) ||
            month < 1 ||
            month > 12
        ) {
            return value;
        }

        return new Date(
            year,
            month - 1,
            1
        ).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });
    };

    const axisTicks = Array.from(
        { length: 5 },
        (_, index) =>
            axisMax -
            (index / 4) * range
    );

    const [hoveredIndex, setHoveredIndex] =
        useState(null);

    const hoveredPoint =
        hoveredIndex === null
            ? null
            : pointByIndex.get(hoveredIndex) ||
            null;

    const tooltipWidth = 190;
    const tooltipHeight = 66;

    const tooltipX = hoveredPoint
        ? Math.min(
            Math.max(
                hoveredPoint.x -
                tooltipWidth / 2,
                left + 2
            ),
            width -
            right -
            tooltipWidth
        )
        : 0;

    const tooltipY = hoveredPoint
        ? Math.max(
            top + 2,
            hoveredPoint.y -
            tooltipHeight -
            10
        )
        : 0;

    /*
     * Build independent line segments so a null CCC does not become
     * zero and does not create a false connection across missing data.
     */
    const segments = [];
    let currentSegment = [];

    rows.forEach((row, index) => {
        const point = pointByIndex.get(index);

        if (point) {
            currentSegment.push(point);

            if (
                index === rows.length - 1
            ) {
                if (currentSegment.length) {
                    segments.push(
                        currentSegment
                    );
                }
            }
        } else if (currentSegment.length) {
            segments.push(currentSegment);
            currentSegment = [];
        }
    });

    const linePaths = segments
        .filter((segment) => segment.length >= 2)
        .map((segment) =>
            segment
                .map(
                    (point, index) =>
                        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
                )
                .join(" ")
        );

    return (
        <div
            style={{
                marginTop: "4px",
                position: "relative",
            }}
        >
            <div
                style={{
                    fontSize: "8px",
                    color: "#64748B",
                    fontWeight: 600,
                    marginBottom: "2px",
                }}
            >
                Days
            </div>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                style={{
                    display: "block",
                    overflow: "visible",
                }}
                onMouseLeave={() =>
                    setHoveredIndex(null)
                }
            >
                {axisTicks.map(
                    (tick, index) => {
                        const y = yFor(tick);

                        return (
                            <g key={`tick-${index}`}>
                                <line
                                    x1={left}
                                    x2={
                                        width -
                                        right
                                    }
                                    y1={y}
                                    y2={y}
                                    stroke="#E2E8F0"
                                    strokeWidth="1"
                                    strokeDasharray={
                                        index === 4
                                            ? "0"
                                            : "3 4"
                                    }
                                />

                                <text
                                    x={left - 7}
                                    y={y + 3}
                                    textAnchor="end"
                                    fontSize="8"
                                    fontWeight="600"
                                    fill="#64748B"
                                >
                                    {Math.round(
                                        tick
                                    )}
                                </text>
                            </g>
                        );
                    }
                )}

                {linePaths.map(
                    (path, index) => (
                        <path
                            key={`ccc-line-${index}`}
                            d={path}
                            fill="none"
                            stroke="#2563EB"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                strokeDasharray: 1000,
                                strokeDashoffset: 1000,
                                animation:
                                    "wcTrendDraw 1s cubic-bezier(.22,.61,.36,1) forwards",
                            }}
                        />
                    )
                )}

                {validPoints.map(
                    (point) => {
                        const plotted =
                            pointByIndex.get(
                                point.index
                            );

                        if (!plotted) {
                            return null;
                        }

                        const isHovered =
                            hoveredIndex ===
                            point.index;

                        return (
                            <g
                                key={`ccc-point-${point.index}`}
                                onMouseEnter={() =>
                                    setHoveredIndex(
                                        point.index
                                    )
                                }
                                style={{
                                    cursor: "pointer",
                                }}
                            >
                                {isHovered && (
                                    <line
                                        x1={
                                            plotted.x
                                        }
                                        x2={
                                            plotted.x
                                        }
                                        y1={
                                            top
                                        }
                                        y2={
                                            height -
                                            bottom
                                        }
                                        stroke="#CBD5E1"
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                    />
                                )}

                                <circle
                                    cx={
                                        plotted.x
                                    }
                                    cy={
                                        plotted.y
                                    }
                                    r={
                                        isHovered
                                            ? 5
                                            : 3.5
                                    }
                                    fill="#2563EB"
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                />

                                <text
                                    x={
                                        plotted.x
                                    }
                                    y={Math.max(
                                        top + 10,
                                        plotted.y -
                                        9
                                    )}
                                    textAnchor="middle"
                                    fontSize={
                                        isHovered
                                            ? "9"
                                            : "8"
                                    }
                                    fontWeight="700"
                                    fill="#334155"
                                >
                                    {point.value.toFixed(
                                        2
                                    )}
                                </text>
                            </g>
                        );
                    }
                )}

                {rows.map(
                    (row, index) => (
                        <text
                            key={`ccc-label-${index}`}
                            x={xFor(index)}
                            y={
                                height -
                                bottom +
                                21
                            }
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight={
                                hoveredIndex ===
                                    index
                                    ? "700"
                                    : "500"
                            }
                            fill={
                                hoveredIndex ===
                                    index
                                    ? "#1E293B"
                                    : "#334155"
                            }
                            style={{
                                cursor: pointByIndex.has(
                                    index
                                )
                                    ? "pointer"
                                    : "default",
                            }}
                            onMouseEnter={() => {
                                if (
                                    pointByIndex.has(
                                        index
                                    )
                                ) {
                                    setHoveredIndex(
                                        index
                                    );
                                }
                            }}
                        >
                            {formatPeriodLabel(
                                row.period
                            )}
                        </text>
                    )
                )}

                {hoveredPoint && (
                    <g
                        pointerEvents="none"
                    >
                        <rect
                            x={tooltipX}
                            y={tooltipY}
                            width={
                                tooltipWidth
                            }
                            height={
                                tooltipHeight
                            }
                            rx="7"
                            fill="#FFFFFF"
                            stroke="#DCE3EE"
                            strokeWidth="1"
                        />
                        <text
                            x={
                                tooltipX + 10
                            }
                            y={
                                tooltipY + 17
                            }
                            fontSize="11"
                            fontWeight="800"
                            fill="#1E1B4B"
                        >
                            {formatPeriodLabel(
                                hoveredPoint.period
                            )}
                        </text>
                        <text
                            x={
                                tooltipX + 10
                            }
                            y={
                                tooltipY + 34
                            }
                            fontSize="12"
                            fontWeight="800"
                            fill="#4F46E5"
                        >
                            CCC:{" "}
                            {hoveredPoint.value.toFixed(
                                2
                            )} Days
                        </text>
                    </g>
                )}
            </svg>

            {hasInsufficientHistory && (
                <div
                    style={{
                        marginTop: "2px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "8px",
                        color: "#64748B",
                    }}
                    title="DIO and CCC require sufficient inventory history."
                >
                    <span
                        style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: "#94A3B8",
                            flexShrink: 0,
                        }}
                    />
                    <span>
                        Insufficient inventory
                        history for CCC.
                    </span>
                </div>
            )}
        </div>
    );
}
