
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import { LineChart, Line, BarChart, Bar, AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, Legend, Cell, LabelList } from "recharts";
// import {
//     getWorkingCapitalFilterOptions,
//     getWorkingCapitalKpis,
//     getWorkingCapitalComponents,
//     getWorkingCapitalCurrentAssets,
//     getWorkingCapitalCurrentLiabilities,
//     getWorkingCapitalLiquidityRatios,
//     getWorkingCapitalAssetsVsLiabilities,
//     getWorkingCapitalCashConversionCycle,
//     getWorkingCapitalTrend,
//     getWorkingCapitalCccTrend,
//     getWorkingCapitalTradeTrend,
//     getWorkingCapitalCurrentAssetsViewAll,
//     getWorkingCapitalCurrentLiabilitiesViewAll,
//     getWorkingCapitalViewAllTrend,
//     getWorkingCapitalViewAllTradeWorkingCapital,
//     getWorkingCapitalViewAllCcc,
//     getWorkingCapitalParentDivisionTrend,
//     getWorkingCapitalSubDivisionTrend,
//     getWorkingCapitalViewAll,
//     exportWorkingCapitalViewAllExcel,
//     exportWorkingCapitalViewAllPdf,
//     exportWorkingCapitalCurrentAssetsExcel,
//     exportWorkingCapitalCurrentAssetsPdf,
//     exportWorkingCapitalCurrentLiabilitiesExcel,
//     exportWorkingCapitalCurrentLiabilitiesPdf,
//     downloadWorkingCapitalFile,
// } from "../api/workingCapital";

// import {
//     C,
//     T,
//     S,
//     SHADOW,
// } from "../utils/theme.js";

// /* ============================================================
//    HELPERS
// ============================================================ */

// function unwrapApiResponse(response) {
//     return response?.data?.data ?? response?.data ?? response ?? {};
// }

// function toNumber(value) {
//     if (value === null || value === undefined || value === "") {
//         return null;
//     }

//     const number = Number(value);
//     return Number.isFinite(number) ? number : null;
// }

// function formatAmount(value, currency = "", compact = true) {
//     const number = toNumber(value);

//     if (number === null) return "—";

//     let formatted;

//     if (compact) {
//         const abs = Math.abs(number);

//         if (abs >= 1_000_000_000) {
//             formatted = `${(number / 1_000_000_000).toFixed(2)}B`;
//         } else if (abs >= 1_000_000) {
//             formatted = `${(number / 1_000_000).toFixed(2)}M`;
//         } else if (abs >= 1_000) {
//             formatted = `${(number / 1_000).toFixed(2)}K`;
//         } else {
//             formatted = number.toLocaleString(undefined, {
//                 maximumFractionDigits: 2,
//             });
//         }
//     } else {
//         formatted = number.toLocaleString(undefined, {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//         });
//     }

//     return currency ? `${currency} ${formatted}` : formatted;
// }

// function formatDate(value) {
//     if (!value) return "—";

//     const raw = String(value).slice(0, 10);
//     const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

//     if (match) {
//         const [, year, month, day] = match;
//         return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
//     }

//     const date = new Date(`${raw}T00:00:00`);
//     if (Number.isNaN(date.getTime())) return value;

//     return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
// }

// function formatMonthLabel(value) {
//     if (value === null || value === undefined || value === "") {
//         return "—";
//     }

//     const raw = String(value);
//     const dateMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

//     if (dateMatch) {
//         const date = new Date(`${dateMatch[1]}-${String(dateMatch[2]).padStart(2, "0")}-01T00:00:00`);
//         if (!Number.isNaN(date.getTime())) {
//             return date.toLocaleDateString("en-US", { month: "short" });
//         }
//     }

//     const numericMonth = Number(raw);
//     if (Number.isInteger(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
//         return new Date(2000, numericMonth - 1, 1).toLocaleDateString("en-US", { month: "short" });
//     }

//     const parsed = new Date(`${raw.slice(0, 10)}T00:00:00`);
//     if (!Number.isNaN(parsed.getTime())) {
//         return parsed.toLocaleDateString("en-US", { month: "short" });
//     }

//     return raw;
// }

// function getValue(obj, ...keys) {
//     for (const key of keys) {
//         if (obj?.[key] !== undefined && obj?.[key] !== null) {
//             return obj[key];
//         }
//     }

//     return null;
// }

// function getNullableValue(obj, ...keys) {
//     for (const key of keys) {
//         if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
//             return obj[key];
//         }
//     }

//     return undefined;
// }

// function getRows(payload) {
//     const data = unwrapApiResponse(payload);

//     if (Array.isArray(data)) return data;
//     if (Array.isArray(data?.rows)) return data.rows;
//     if (Array.isArray(data?.data)) return data.data;

//     return [];
// }

// function optionList(source) {
//     if (!Array.isArray(source)) return [];

//     const normalizeIds = (...values) =>
//         values
//             .flatMap((value) =>
//                 Array.isArray(value) ? value : [value]
//             )
//             .filter(
//                 (value) =>
//                     value !== null &&
//                     value !== undefined &&
//                     value !== ""
//             )
//             .map((value) => String(value));

//     return source
//         .map((item) => {
//             if (typeof item === "string" || typeof item === "number") {
//                 return {
//                     id: String(item),
//                     label: String(item),
//                     legalGroupIds: [],
//                     legalEntityIds: [],
//                     parentDivisionIds: [],
//                 };
//             }

//             const id =
//                 item?.id ??
//                 item?.value ??
//                 item?.key ??
//                 item?.code ??
//                 item?.legal_group_id ??
//                 item?.legal_entity_id ??
//                 item?.parent_division_id ??
//                 item?.subdivision_id;

//             const label =
//                 item?.label ??
//                 item?.name ??
//                 item?.display_name ??
//                 item?.legal_group_name ??
//                 item?.legal_entity_name ??
//                 item?.parent_division_name ??
//                 item?.subdivision_name ??
//                 item?.value;

//             return {
//                 id: id == null ? "" : String(id),
//                 label: label == null ? "" : String(label),
//                 legalGroupIds: normalizeIds(
//                     item?.legal_group_ids,
//                     item?.legalGroupIds,
//                     item?.legal_group_id,
//                     item?.legalGroupId
//                 ),
//                 legalEntityIds: normalizeIds(
//                     item?.legal_entity_ids,
//                     item?.legalEntityIds,
//                     item?.legal_entity_id,
//                     item?.legalEntityId
//                 ),
//                 parentDivisionIds: normalizeIds(
//                     item?.parent_division_ids,
//                     item?.parentDivisionIds,
//                     item?.parent_division_id,
//                     item?.parentDivisionId
//                 ),
//             };
//         })
//         .filter((item) => item.id && item.label);
// }


// function getFilterOptionsPayload(payload) {
//     const data = unwrapApiResponse(payload);
//     return data?.filters ?? data?.filter_options ?? data ?? {};
// }

// function normalizeFilterOptions(payload) {
//     const data = getFilterOptionsPayload(payload);

//     const rawDates =
//         data.as_on_dates ??
//         data.asOnDates ??
//         (data.operational_as_on_date
//             ? [data.operational_as_on_date]
//             : []);

//     const rawPeriods =
//         data.balance_sheet_periods ??
//         data.balanceSheetPeriods ??
//         [];

//     const rawAgingBases =
//         data.aging_bases ??
//         data.agingBases ??
//         ["DUE_DATE"];

//     return {
//         legalGroups: optionList(
//             data.legal_groups ?? data.legalGroups
//         ),
//         legalEntities: optionList(
//             data.legal_entities ?? data.legalEntities
//         ),
//         parentDivisions: optionList(
//             data.parent_divisions ?? data.parentDivisions
//         ),
//         subDivisions: optionList(
//             data.subdivisions ??
//             data.sub_divisions ??
//             data.subDivisions
//         ),
//         asOnDates: Array.isArray(rawDates)
//             ? rawDates
//                 .map((item) =>
//                     typeof item === "string"
//                         ? item
//                         : item?.value ??
//                         item?.date ??
//                         item?.as_on_date
//                 )
//                 .filter(Boolean)
//             : [],
//         balanceSheetPeriods: Array.isArray(rawPeriods)
//             ? rawPeriods
//                 .map((item) => ({
//                     value:
//                         item?.value ??
//                         item?.period_name ??
//                         item?.period ??
//                         "",
//                     label:
//                         item?.label ??
//                         item?.value ??
//                         item?.period_name ??
//                         item?.period ??
//                         "",
//                     periodStart:
//                         item?.period_start ??
//                         item?.periodStart ??
//                         null,
//                     periodEnd:
//                         item?.period_end ??
//                         item?.periodEnd ??
//                         null,
//                 }))
//                 .filter((item) => item.value)
//             : [],
//         agingBases: Array.isArray(rawAgingBases)
//             ? rawAgingBases
//                 .map((item) =>
//                     typeof item === "string"
//                         ? item
//                         : item?.value ??
//                         item?.code ??
//                         item?.name
//                 )
//                 .filter(Boolean)
//             : ["DUE_DATE"],
//         reportingCurrency:
//             data.reporting_currency ??
//             data.reportingCurrency ??
//             "",
//         operationalAsOnDate:
//             data.operational_as_on_date ??
//             data.operationalAsOnDate ??
//             "",
//     };
// }

// function selectedIds(options, selectedValues) {
//     const selected = Array.isArray(selectedValues)
//         ? selectedValues
//         : [];

//     return options
//         .filter((option) => selected.includes(option.id))
//         .map((option) => option.id);
// }

// function buildApiFilters(filters, options) {
//     const apiFilters = {
//         // These remain arrays so the existing API service can serialize them
//         // as repeated query parameters:
//         // ?legal_entity_id=1&legal_entity_id=2&subdivision_id=15
//         legal_group_id: selectedIds(
//             options.legalGroups,
//             filters.legalGroups
//         ),
//         legal_entity_id: selectedIds(
//             options.legalEntities,
//             filters.legalEntities
//         ),
//         parent_division_id: selectedIds(
//             options.parentDivisions,
//             filters.parentDivisions
//         ),
//         subdivision_id: selectedIds(
//             options.subDivisions,
//             filters.subDivisions
//         ),

//         as_on_date:
//             filters.asOnDate || undefined,

//         // Keep the approved backend default unless the user selects
//         // another basis explicitly provided by filter-options.
//         aging_basis:
//             filters.agingBasis ||
//             "DUE_DATE",
//     };

//     // Balance Sheet Period is intentionally not exposed on this page.
//     // Keep the operational aging basis at the backend default without
//     // rendering an Aging Basis control.
//     return apiFilters;
// }

// /*
//  * Always build Reset from the current backend filter options.
//  * This keeps Reset consistent across the dashboard and every View All modal.
//  */
// function getWorkingCapitalDefaultFilters(filterOptions) {
//     const options = filterOptions || {};
//     return {
//         legalGroups: [],
//         legalEntities: [],
//         parentDivisions: [],
//         subDivisions: [],
//         agingBasis: options.agingBases?.[0] || "DUE_DATE",
//         asOnDate:
//             options.operationalAsOnDate ||
//             options.asOnDates?.[0] ||
//             "",
//     };
// }


// /*
//  * Common Parent Division / Sub-Division View All contract.
//  * Only these filters are sent to GET /api/working-capital/view-all:
//  *   as_on_date
//  *   legal_group_id
//  *   legal_entity_id
//  *   parent_division_id
//  *   subdivision_id
//  */
// function buildCfoViewAllApiFilters(filters, options) {
//     const source = filters || {};

//     return {
//         legal_group_id: selectedIds(
//             options.legalGroups,
//             source.legalGroups
//         ),
//         legal_entity_id: selectedIds(
//             options.legalEntities,
//             source.legalEntities
//         ),
//         parent_division_id: selectedIds(
//             options.parentDivisions,
//             source.parentDivisions
//         ),
//         subdivision_id: selectedIds(
//             options.subDivisions,
//             source.subDivisions
//         ),
//         aging_basis: source.agingBasis || "DUE_DATE",
//         as_on_date: source.asOnDate || undefined,
//     };
// }

// function normalizeTrendRows(payload) {
//     return getRows(payload)
//         .map((row) => {
//             const asOnDate = getValue(row, "as_on_date", "snapshot_date", "date", "period_end");
//             const rawPeriod = getValue(row, "month", "period", "period_name", "label");
//             return {
//                 period: formatMonthLabel(asOnDate ?? rawPeriod),
//                 asOnDate: asOnDate ?? null,
//                 value: toNumber(
//                     getValue(
//                         row,
//                         "net_working_capital",
//                         "nwc",
//                         "working_capital",
//                         "value"
//                     )
//                 ),
//                 ratio: toNumber(
//                     getValue(row, "current_ratio", "ratio")
//                 ),
//             };
//         })
//         .filter((row) => row.value !== null);
// }

// function normalizeTradeTrendRows(payload) {
//     return getRows(payload)
//         .map((row) => {
//             const asOnDate = getValue(row, "as_on_date", "snapshot_date", "date", "period_end");
//             const rawPeriod = getValue(row, "month", "period", "period_name", "label");
//             return {
//                 period: formatMonthLabel(asOnDate ?? rawPeriod),
//                 asOnDate: asOnDate ?? null,
//                 value: toNumber(
//                     getValue(
//                         row,
//                         "trade_working_capital",
//                         "trade_working_capital_value",
//                         "working_capital",
//                         "value"
//                     )
//                 ),
//             };
//         })
//         .filter((row) => row.value !== null);
// }

// function normalizeHierarchyTrendRows(payload, level = "parent") {
//     const data = unwrapApiResponse(payload);
//     let rawRows = [];

//     if (Array.isArray(data)) {
//         rawRows = data;
//     } else if (Array.isArray(data?.rows)) {
//         rawRows = data.rows;
//     } else if (Array.isArray(data?.data)) {
//         rawRows = data.data;
//     } else {
//         Object.entries(data || {}).forEach(([key, value]) => {
//             if (Array.isArray(value)) {
//                 value.forEach((row) => {
//                     rawRows.push({
//                         ...(row || {}),
//                         [level === "parent"
//                             ? "parent_division_name"
//                             : "subdivision_name"]:
//                             row?.[
//                             level === "parent"
//                                 ? "parent_division_name"
//                                 : "subdivision_name"
//                             ] ?? key,
//                     });
//                 });
//             }
//         });
//     }

//     const nameKeys =
//         level === "parent"
//             ? [
//                 "parent_division_name",
//                 "parentDivisionName",
//                 "parent_division",
//                 "division_name",
//                 "division",
//                 "name",
//                 "label",
//             ]
//             : [
//                 "subdivision_name",
//                 "sub_division_name",
//                 "subDivisionName",
//                 "subdivision",
//                 "sub_division",
//                 "name",
//                 "label",
//             ];

//     return rawRows
//         .map((row) => ({
//             name: String(
//                 getValue(row, ...nameKeys) ?? "—"
//             ),
//             period: formatMonthLabel(
//                 getValue(
//                     row,
//                     "month",
//                     "period",
//                     "period_name",
//                     "month_label",
//                     "as_on_date",
//                     "snapshot_date",
//                     "date",
//                     "period_end",
//                     "label"
//                 )
//             ),
//             value: toNumber(
//                 getValue(
//                     row,
//                     "trade_working_capital",
//                     "trade_working_capital_value",
//                     "working_capital",
//                     "value",
//                     "amount"
//                 )
//             ),
//             ccc: toNumber(
//                 getValue(
//                     row,
//                     "cash_conversion_cycle_days",
//                     "ccc_days",
//                     "ccc",
//                     "cash_conversion_cycle"
//                 )
//             ),
//         }))
//         .filter(
//             (row) =>
//                 row.value !== null &&
//                 row.name !== "—"
//         );
// }

// function normalizeCfoViewAllRows(payload) {
//     const data = unwrapApiResponse(payload);
//     const rawRows = Array.isArray(data)
//         ? data
//         : Array.isArray(data?.rows)
//             ? data.rows
//             : Array.isArray(data?.data)
//                 ? data.data
//                 : [];

//     /*
//      * Common Parent Division / Sub-Division View All table.
//      * DSO, DPO, DIO and CCC are intentionally null for now.
//      * Never derive these values in the frontend.
//      */
//     return rawRows.map((row) => ({
//         legalEntity:
//             getValue(
//                 row,
//                 "legal_entity",
//                 "legal_entity_name",
//                 "legalEntity",
//                 "legalEntityName",
//                 "entity_name",
//                 "entity"
//             ) ?? "—",
//         parentDivision:
//             getValue(
//                 row,
//                 "parent_division",
//                 "parent_division_name",
//                 "parentDivision",
//                 "parentDivisionName"
//             ) ?? "—",
//         subDivision:
//             getValue(
//                 row,
//                 "subdivision",
//                 "subdivision_name",
//                 "sub_division",
//                 "sub_division_name",
//                 "subDivision",
//                 "subDivisionName"
//             ) ?? "—",
//         tradeReceivables: toNumber(
//             getValue(
//                 row,
//                 "trade_receivables",
//                 "total_receivables",
//                 "receivables"
//             )
//         ),
//         dso: null,
//         tradePayables: toNumber(
//             getValue(
//                 row,
//                 "trade_payables",
//                 "total_payables",
//                 "payables"
//             )
//         ),
//         dpo: null,
//         inventory: toNumber(
//             getValue(row, "inventory", "total_inventory")
//         ),
//         dio: null,
//         tradeWorkingCapital: toNumber(
//             getValue(
//                 row,
//                 "trade_working_capital",
//                 "trade_working_capital_value",
//                 "working_capital"
//             )
//         ),
//         ccc: null,
//     }));
// }

// function normalizeCccTrendRows(payload) {
//     return getRows(payload)
//         .map((row) => ({
//             period:
//                 getValue(
//                     row,
//                     "month_label",
//                     "month",
//                     "period",
//                     "period_name",
//                     "label"
//                 ) ?? "—",
//             dso: toNumber(
//                 getValue(row, "dso_days", "dso")
//             ),
//             dio: toNumber(
//                 getValue(row, "dio_days", "dio")
//             ),
//             dpo: toNumber(
//                 getValue(row, "dpo_days", "dpo")
//             ),
//             // IMPORTANT:
//             // CCC is always taken directly from the backend response.
//             // Never derive CCC in the frontend from DSO + DIO - DPO.
//             ccc: toNumber(
//                 getValue(
//                     row,
//                     "cash_conversion_cycle_days",
//                     "ccc_days",
//                     "ccc",
//                     "value"
//                 )
//             ),
//             status:
//                 getValue(
//                     row,
//                     "status",
//                     "ccc_status"
//                 ) ?? null,
//         }))
//         .filter(
//             (row) =>
//                 row.dso !== null ||
//                 row.dio !== null ||
//                 row.dpo !== null ||
//                 row.ccc !== null ||
//                 row.status !== null
//         );
// }

// function normalizeBreakdownRows(payload) {
//     return getRows(payload).map((row) => ({
//         key:
//             getValue(row, "key") ?? null,
//         particular:
//             getValue(
//                 row,
//                 "label",
//                 "category",
//                 "name",
//                 "particular"
//             ) ?? "—",
//         // Dashboard APIs return the amount in `value`.
//         // View-All APIs may return it as `amount`.
//         amount: toNumber(
//             getValue(row, "value", "amount", "current")
//         ),
//         // Current Assets / Current Liabilities dashboard responses do not
//         // currently return percentage_of_total. Keep it null rather than
//         // calculating a new frontend value. View-All responses can still
//         // provide percentage_of_total when available.
//         percentage: toNumber(
//             getValue(
//                 row,
//                 "percentage_of_total",
//                 "percentage"
//             )
//         ),
//         sourceAccountCodes:
//             getValue(row, "source_account_codes") ?? [],
//         period:
//             getValue(row, "period", "period_name") ?? "—",
//         periodEnd:
//             getValue(row, "period_end") ?? null,
//     }));
// }

// function normalizeCurrentRatio(payload) {
//     const rows = getRows(payload);
//     const ratioRow = rows.find((row) => {
//         const key = String(
//             getValue(row, "key", "ratio_key") ?? ""
//         ).toLowerCase();
//         const label = String(
//             getValue(row, "label", "name", "category") ?? ""
//         ).toLowerCase();

//         return (
//             key === "current_ratio" ||
//             label === "current ratio"
//         );
//     });

//     if (!ratioRow) return null;

//     return toNumber(
//         getValue(
//             ratioRow,
//             "current",
//             "value",
//             "ratio"
//         )
//     );
// }

// /* ============================================================
//    STYLES
// ============================================================ */

// const styles = {
//     page: {
//         minHeight: "100%",
//         background: "var(--clr-bg)",
//         color: C.navy,
//         padding: "16px 0 36px",
//         boxSizing: "border-box",
//     },
//     header: {
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "flex-start",
//         gap: S.cardGap,
//         marginBottom: "16px",
//         flexWrap: "wrap",
//     },
//     title: {
//         ...T.pageTitle,
//         margin: 0,
//         color: C.navy,
//     },
//     subtitle: {
//         margin: "3px 0 0",
//         color: C.slate,
//         fontSize: "0.78rem",
//         lineHeight: 1.45,
//     },
//     headerActions: {
//         display: "flex",
//         alignItems: "center",
//         gap: "8px",
//         flexWrap: "wrap",
//         justifyContent: "flex-end",
//     },
//     button: {
//         height: "32px",
//         padding: "0 12px",
//         borderRadius: "var(--radius-sm)",
//         border: "1px solid var(--clr-border-strong)",
//         background: "var(--clr-surface)",
//         color: C.slate,
//         fontSize: "0.70rem",
//         fontWeight: 700,
//         cursor: "pointer",
//         transition: "all var(--tr-fast)",
//         boxShadow: SHADOW.card,
//     },
//     filterContainer: {
//         background: "var(--clr-surface)",
//         border: "1px solid var(--clr-border-strong)",
//         borderRadius: "var(--radius-md)",
//         padding: "10px 14px",
//         display: "grid",
//         gridTemplateColumns: "118px 118px 118px 118px 118px 112px 130px 70px 60px",
//         gap: "10px 6px",
//         alignItems: "end",
//         marginBottom: "16px",
//         boxShadow: SHADOW.card,
//         overflow: "visible",
//         width: "100%",
//         boxSizing: "border-box",
//     },
//     filterLabel: {
//         display: "block",
//         color: "#173575",
//         fontSize: "0.74rem",
//         fontWeight: 700,
//         letterSpacing: "-0.02em",
//         marginBottom: "4px",
//         lineHeight: 1.2,
//     },
//     filterInput: {
//         width: "100%",
//         minHeight: "32px",
//         border: "1px solid var(--clr-border-strong)",
//         borderRadius: "var(--radius-sm)",
//         background: "var(--clr-surface)",
//         color: C.slate,
//         fontSize: "0.78rem",
//         padding: "6px 10px",
//         outline: "none",
//         boxSizing: "border-box",
//         transition: "all var(--tr-fast)",
//     },
//     cardGrid: {
//         display: "grid",
//         gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
//         gap: "10px",
//         marginBottom: S.pageGap,
//         alignItems: "stretch",
//     },
//     card: {
//         background: "var(--clr-surface)",
//         border: "none",
//         borderRadius: "var(--radius-md)",
//         minHeight: "84px",
//         padding: S.cardPad,
//         boxSizing: "border-box",
//         boxShadow: SHADOW.card,
//         overflow: "hidden",
//         position: "relative",
//         transition: "transform var(--tr-base), box-shadow var(--tr-base)",
//     },
//     panel: {
//         background: "var(--clr-surface)",
//         border: "1px solid var(--clr-border)",
//         borderRadius: "var(--radius-lg)",
//         padding: "12px 16px 10px",
//         boxSizing: "border-box",
//         overflow: "hidden",
//         boxShadow: "var(--shadow-card)",
//         transition: "box-shadow var(--tr-base), transform var(--tr-base)",
//     },
//     panelTitle: {
//         ...T.sectionTitle,
//         color: C.navy,
//         fontSize: "0.88rem",
//         lineHeight: 1.3,
//         letterSpacing: "-0.01em",
//         margin: "0 0 0",
//         fontWeight: 800,
//     },
// };


// const workingCapitalFilterResponsiveCss = `.wc-sales-page .wc-sales-kpis {
//     grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
//     gap: 10px !important;
//     align-items: stretch;
// }

// .wc-sales-page .wc-filter-grid {
//     grid-template-columns: 118px 118px 118px 118px 118px 112px 130px 70px 60px !important;
//     gap: 10px 6px !important;
//     align-items: end !important;
// }

// .wc-sales-page .wc-filter-grid > button {
//     align-self: end;
// }

// .wc-sales-page .wc-filter-grid button,
// .wc-sales-page .wc-filter-grid select,
// .wc-sales-page .wc-filter-grid input {
//     font-size: 0.76rem !important;
// }

// .wc-sales-page {
//     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//     color: #1e293b;
// }
// .wc-sales-page .wc-page-title {
//     display: flex;
//     align-items: center;
//     gap: 4px;
// }
// .wc-sales-page .kpi-grid {
//     margin-bottom: var(--section-gap);
// }

// .wc-filter-grid {
//     width: 100%;
// }
// @media (max-width: 1250px) {
//     .wc-filter-grid {
//         grid-template-columns: repeat(3, minmax(145px, 1fr)) !important;
//     }
// }
// @media (max-width: 900px) {
//     .wc-filter-grid {
//         grid-template-columns: repeat(2, minmax(145px, 1fr)) !important;
//     }
// }
// @media (max-width: 600px) {
//     .wc-filter-grid {
//         grid-template-columns: 1fr !important;
//     }
// }
// `;

// /* ============================================================
//    SMALL COMPONENTS
// ============================================================ */



// function PageSkeleton() {
//     return (
//         <div
//             className="wc-page-skeleton"
//             aria-label="Loading Working Capital Report"
//         >
//             <div
//                 style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
//                     gap: "16px",
//                     marginBottom: "16px",
//                 }}
//             >
//                 {Array.from({ length: 8 }).map((_, index) => (
//                     <div
//                         key={index}
//                         style={{
//                             ...styles.card,
//                             minHeight: "84px",
//                         }}
//                     >
//                         <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
//                             <div
//                                 className="wc-skeleton-line"
//                                 style={{
//                                     width: 34,
//                                     minWidth: 34,
//                                     height: 34,
//                                     borderRadius: "50%",
//                                     margin: 0,
//                                 }}
//                             />
//                             <div style={{ minWidth: 0, flex: 1 }}>
//                                 <div className="wc-skeleton-line" style={{ width: "58%", height: 7 }} />
//                                 <div className="wc-skeleton-line" style={{ width: "82%", height: 15, marginTop: 7 }} />
//                                 <div className="wc-skeleton-line" style={{ width: "66%", height: 6, marginTop: 6 }} />
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             <div
//                 style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//                     gap: "10px",
//                     marginBottom: "10px",
//                 }}
//             >
//                 {Array.from({ length: 2 }).map((_, index) => (
//                     <div key={index} style={{ ...styles.panel, minHeight: 255 }}>
//                         <div className="wc-skeleton-line" style={{ width: "45%", height: 12 }} />
//                         <div className="wc-skeleton-chart" />
//                     </div>
//                 ))}
//             </div>

//             <div
//                 style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//                     gap: "10px",
//                     marginBottom: "10px",
//                 }}
//             >
//                 {Array.from({ length: 2 }).map((_, index) => (
//                     <div key={index} style={{ ...styles.panel, minHeight: 255 }}>
//                         <div className="wc-skeleton-line" style={{ width: "48%", height: 12 }} />
//                         <div className="wc-skeleton-chart" />
//                     </div>
//                 ))}
//             </div>

//             <div
//                 style={{
//                     display: "grid",
//                     gridTemplateColumns: "1.08fr 1.08fr .92fr",
//                     gap: "10px",
//                 }}
//             >
//                 {Array.from({ length: 3 }).map((_, index) => (
//                     <div key={index} style={{ ...styles.panel, minHeight: 210 }}>
//                         <div className="wc-skeleton-line" style={{ width: "52%", height: 12 }} />
//                         {Array.from({ length: 5 }).map((__, row) => (
//                             <div
//                                 key={row}
//                                 className="wc-skeleton-line"
//                                 style={{
//                                     width: row === 4 ? "86%" : "96%",
//                                     height: 7,
//                                     marginTop: row === 0 ? 20 : 12,
//                                 }}
//                             />
//                         ))}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

// function AnimatedKpiValue({ value, duration = 1100 }) {
//     const raw = String(value ?? "");
//     const numericMatch = raw.match(/-?\d+(?:\.\d+)?/);
//     const numeric = numericMatch ? Number(numericMatch[0]) : null;
//     const [display, setDisplay] = useState(numeric ?? 0);

//     useEffect(() => {
//         if (numeric === null || !Number.isFinite(numeric)) {
//             setDisplay(0);
//             return undefined;
//         }

//         let frameId = null;
//         const start = performance.now();
//         const from = 0;

//         const animate = (now) => {
//             const progress = Math.min((now - start) / duration, 1);
//             const eased = 1 - Math.pow(1 - progress, 3);
//             setDisplay(from + (numeric - from) * eased);

//             if (progress < 1) {
//                 frameId = requestAnimationFrame(animate);
//             }
//         };

//         setDisplay(0);
//         frameId = requestAnimationFrame(animate);

//         return () => {
//             if (frameId) cancelAnimationFrame(frameId);
//         };
//     }, [numeric, duration]);

//     if (numeric === null || !Number.isFinite(numeric)) {
//         return <>{value ?? "—"}</>;
//     }

//     const match = raw.match(/^(.*?)(-?\d+(?:\.\d+)?)(.*)$/);
//     if (!match) return <>{value}</>;

//     const [, prefix, , suffix] = match;
//     const decimals = (numericMatch?.[0].split(".")[1] || "").length;

//     return (
//         <>
//             {prefix}
//             {display.toFixed(decimals)}
//             {suffix}
//         </>
//     );
// }

// function KpiCard({ title, value, subtitle, icon }) {
//     const palettes = {
//         "Trade Working Capital": {
//             bg: "#EEF4FF",
//             iconBg: "#DCE9FF",
//             accent: "#2563EB",
//         },
//         "Net Working Capital": {
//             bg: "#EEF2FF",
//             iconBg: "#DCE3FF",
//             accent: "#4F46E5",
//         },
//         "Current Assets": {
//             bg: "#ECFDF3",
//             iconBg: "#D9F7E5",
//             accent: "#16A34A",
//         },
//         "Current Liabilities": {
//             bg: "#F5F1FF",
//             iconBg: "#E9DEFF",
//             accent: "#7C3AED",
//         },
//         "Current Ratio": {
//             bg: "#FFF6E8",
//             iconBg: "#FFE8C2",
//             accent: "#EA8A00",
//         },
//         "DSO": {
//             bg: "#ECFBFF",
//             iconBg: "#D5F3FA",
//             accent: "#0891B2",
//         },
//         "DIO": {
//             bg: "#F0FDF4",
//             iconBg: "#DCFCE7",
//             accent: "#16A34A",
//         },
//         "DPO": {
//             bg: "#FFF1F2",
//             iconBg: "#FFE0E4",
//             accent: "#DC2626",
//         },
//         "CCC": {
//             bg: "#FDF2F8",
//             iconBg: "#FCE0EE",
//             accent: "#DB2777",
//         },
//         "Target CCC": {
//             bg: "#F0F9FF",
//             iconBg: "#DDF3FF",
//             accent: "#0284C7",
//         },
//     };

//     const palette = palettes[title] || {
//         bg: "#EEF2FF",
//         iconBg: "#DCE3FF",
//         accent: "#4F46E5",
//     };

//     const [hover, setHover] = useState(false);

//     const isInsufficientHistory =
//         (title === "DIO" || title === "CCC") &&
//         value === "—";

//     return (
//         <div
//             className="sales-style-kpi"
//             style={{
//                 ...styles.card,
//                 background: palette.bg,
//                 transform: hover ? "translateY(-2px)" : "translateY(0)",
//                 boxShadow: hover
//                     ? `0 8px 18px ${palette.accent}22`
//                     : "0 2px 6px rgba(0,0,0,0.04)",
//             }}
//             onMouseEnter={() => setHover(true)}
//             onMouseLeave={() => setHover(false)}
//         >
//             <div
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "9px",
//                     height: "100%",
//                     minWidth: 0,
//                 }}
//             >
//                 <div
//                     style={{
//                         width: "34px",
//                         height: "34px",
//                         minWidth: "34px",
//                         borderRadius: "50%",
//                         background: palette.iconBg,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         color: palette.accent,
//                         fontSize: "16px",
//                         fontWeight: 800,
//                         boxShadow: "0 1px 2px rgba(15,23,42,.04)",
//                     }}
//                 >
//                     {icon}
//                 </div>

//                 <div
//                     style={{
//                         minWidth: 0,
//                         flex: 1,
//                         display: "flex",
//                         flexDirection: "column",
//                         justifyContent: "center",
//                         gap: "2px",
//                     }}
//                 >
//                     <div
//                         style={{
//                             color: palette.accent,
//                             fontSize: "0.68rem",
//                             lineHeight: 1.15,
//                             fontWeight: 700,
//                             whiteSpace: "nowrap",
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                         }}
//                         title={title}
//                     >
//                         {title}
//                     </div>

//                     <div
//                         style={{
//                             color: "#0F172A",
//                             fontSize: "1.02rem",
//                             lineHeight: 1.05,
//                             fontWeight: 800,
//                             letterSpacing: "-0.02em",
//                             whiteSpace: "nowrap",
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                         }}
//                         title={String(value)}
//                     >
//                         <AnimatedKpiValue value={value} />
//                     </div>

//                     {subtitle && (
//                         <div
//                             style={{
//                                 alignSelf: "flex-start",
//                                 maxWidth: "100%",
//                                 marginTop: "2px",
//                                 padding: "2px 6px",
//                                 borderRadius: "5px",
//                                 background: "rgba(255,255,255,.58)",
//                                 color: isInsufficientHistory
//                                     ? "#64748B"
//                                     : "#64748B",
//                                 fontSize: "0.58rem",
//                                 lineHeight: 1.15,
//                                 fontWeight: 600,
//                                 whiteSpace: "nowrap",
//                                 overflow: "hidden",
//                                 textOverflow: "ellipsis",
//                             }}
//                             title={subtitle}
//                         >
//                             {subtitle}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// function escapeSpreadsheetXml(value) {
//     return String(value ?? "")
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&apos;");
// }

// function exportTrendToExcel(data, title, currency, metricLabel) {
//     const rows = Array.isArray(data) ? data : [];

//     const xmlRows = rows
//         .map((row) => `
//             <Row>
//                 <Cell><Data ss:Type="String">${escapeSpreadsheetXml(row.period)}</Data></Cell>
//                 <Cell><Data ss:Type="Number">${Number(toNumber(row.value) ?? 0)}</Data></Cell>
//                 <Cell><Data ss:Type="String">${escapeSpreadsheetXml(currency || "")}</Data></Cell>
//             </Row>
//         `)
//         .join("");

//     const xml = `<?xml version="1.0"?>
// <?mso-application progid="Excel.Sheet"?>
// <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
//     xmlns:o="urn:schemas-microsoft-com:office:office"
//     xmlns:x="urn:schemas-microsoft-com:office:excel"
//     xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
//     <Worksheet ss:Name="Trend">
//         <Table>
//             <Row>
//                 <Cell><Data ss:Type="String">Period</Data></Cell>
//                 <Cell><Data ss:Type="String">${escapeSpreadsheetXml(metricLabel)}</Data></Cell>
//                 <Cell><Data ss:Type="String">Currency</Data></Cell>
//             </Row>
//             ${xmlRows}
//         </Table>
//     </Worksheet>
// </Workbook>`;

//     const blob = new Blob([xml], {
//         type: "application/vnd.ms-excel",
//     });

//     const url = URL.createObjectURL(blob);
//     const anchor = document.createElement("a");
//     anchor.href = url;
//     anchor.download = `${String(title || "working-capital-trend")
//         .replace(/[^a-z0-9]+/gi, "-")
//         .replace(/^-|-$/g, "")
//         .toLowerCase()}.xls`;
//     document.body.appendChild(anchor);
//     anchor.click();
//     anchor.remove();
//     URL.revokeObjectURL(url);
// }

// function exportTrendToPdf(data, title, currency, metricLabel) {
//     const rows = Array.isArray(data) ? data : [];

//     const popup = window.open("", "_blank", "width=900,height=700");
//     if (!popup) {
//         window.alert("Please allow pop-ups to export the chart as PDF.");
//         return;
//     }

//     const tableRows = rows
//         .map(
//             (row) => `
//                 <tr>
//                     <td>${escapeSpreadsheetXml(row.period)}</td>
//                     <td style="text-align:right;font-weight:700;">
//                         ${escapeSpreadsheetXml(
//                 formatAmount(row.value, currency, true)
//             )}
//                     </td>
//                 </tr>
//             `
//         )
//         .join("");

//     popup.document.write(`
//         <!doctype html>
//         <html>
//         <head>
//             <title>${escapeSpreadsheetXml(title)}</title>
//             <style>
//                 body {
//                     font-family: Arial, sans-serif;
//                     color: #0F172A;
//                     padding: 32px;
//                 }
//                 h1 {
//                     margin: 0 0 6px;
//                     font-size: 20px;
//                 }
//                 p {
//                     margin: 0 0 18px;
//                     color: #64748B;
//                     font-size: 12px;
//                 }
//                 table {
//                     width: 100%;
//                     border-collapse: collapse;
//                     font-size: 12px;
//                 }
//                 th {
//                     background: #EEF2FF;
//                     color: #1E3A8A;
//                     text-align: left;
//                     padding: 9px 10px;
//                     border-bottom: 2px solid #CBD5E1;
//                 }
//                 td {
//                     padding: 9px 10px;
//                     border-bottom: 1px solid #E2E8F0;
//                 }
//                 .footer {
//                     margin-top: 18px;
//                     color: #94A3B8;
//                     font-size: 10px;
//                 }
//             </style>
//         </head>
//         <body>
//             <h1>${escapeSpreadsheetXml(title)}</h1>
//             <p>${escapeSpreadsheetXml(metricLabel)} · Currency: ${escapeSpreadsheetXml(currency || "—")}</p>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Period</th>
//                         <th>${escapeSpreadsheetXml(metricLabel)}</th>
//                     </tr>
//                 </thead>
//                 <tbody>${tableRows}</tbody>
//             </table>
//             <div class="footer">Working Capital Report</div>
//         </body>
//         </html>
//     `);

//     popup.document.close();
//     popup.focus();
//     setTimeout(() => {
//         popup.print();
//     }, 250);
// }

// function SimpleTrendChart({
//     data,
//     currency,
//     title,
//     valueLabel,
//     metricLabel = "Net Working Capital",
//     nullText = "No data",
//     onViewAll,
//     onExportExcel,
//     onExportPdf,
// }) {
//     const width = 640;
//     const height = 245;
//     const left = 52;
//     const right = 26;
//     const top = 28;
//     const bottom = 50;

//     const visibleData = Array.isArray(data) ? data : [];
//     const [hoveredIndex, setHoveredIndex] = useState(null);
//     const [parentHoveredIndex, setParentHoveredIndex] = useState(null);

//     const values = visibleData
//         .map((item) => toNumber(item.value))
//         .filter((value) => value !== null);

//     const chartGradientId = `wc-trend-line-${String(title || "chart")
//         .replace(/[^a-z0-9]+/gi, "-")
//         .toLowerCase()}`;
//     const areaGradientId = `${chartGradientId}-area`;

//     if (!values.length) {
//         return (
//             <div className="wc-panel-animate" style={styles.panel}>
//                 <div
//                     style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         gap: 8,
//                     }}
//                 >
//                     <h3 style={{ ...styles.panelTitle, marginBottom: 0 }}>
//                         {title}
//                     </h3>
//                     <ActionMenu
//                         items={[
//                             {
//                                 key: "view-all",
//                                 label: "🔎 View All",
//                                 onClick: onViewAll,
//                             },
//                             ...(typeof onExportExcel === "function"
//                                 ? [{
//                                     key: "excel",
//                                     label: "📊 Export Excel",
//                                     onClick: onExportExcel,
//                                 }]
//                                 : []),
//                             ...(typeof onExportPdf === "function"
//                                 ? [{
//                                     key: "pdf",
//                                     label: "📄 Export PDF",
//                                     onClick: onExportPdf,
//                                 }]
//                                 : []),
//                         ]}
//                     />
//                 </div>
//                 <div
//                     style={{
//                         color: "#98A2B3",
//                         fontSize: "10px",
//                         padding: "34px 0",
//                     }}
//                 >
//                     {nullText}
//                 </div>
//             </div>
//         );
//     }

//     const minValue = Math.min(...values, 0);
//     const maxValue = Math.max(...values, 1);
//     const range = maxValue === minValue ? 1 : maxValue - minValue;

//     const xFor = (index) =>
//         visibleData.length <= 1
//             ? (left + width - right) / 2
//             : left +
//             (index / (visibleData.length - 1)) *
//             (width - left - right);

//     const yFor = (value) =>
//         top +
//         ((maxValue - value) / range) *
//         (height - top - bottom);

//     const pointPairs = visibleData
//         .map((item, index) => {
//             const value = toNumber(item.value);
//             return value === null
//                 ? null
//                 : {
//                     x: xFor(index),
//                     y: yFor(value),
//                     value,
//                     period: item.period,
//                     index,
//                 };
//         })
//         .filter(Boolean);

//     const points = pointPairs
//         .map((point) => `${point.x},${point.y}`)
//         .join(" ");

//     const firstPoint = pointPairs[0];
//     const lastPoint = pointPairs[pointPairs.length - 1];
//     const baselineY = height - bottom;

//     const areaPoints = firstPoint && lastPoint
//         ? `${firstPoint.x},${baselineY} ${points} ${lastPoint.x},${baselineY}`
//         : "";

//     const hoveredPoint =
//         hoveredIndex === null
//             ? null
//             : pointPairs.find(
//                 (point) => point.index === hoveredIndex
//             ) || null;

//     const tooltipWidth = 240;
//     const tooltipHeight = 88;
//     const tooltipX = hoveredPoint
//         ? Math.min(
//             Math.max(
//                 hoveredPoint.x - tooltipWidth / 2,
//                 left + 4
//             ),
//             width - right - tooltipWidth
//         )
//         : 0;
//     const tooltipY = hoveredPoint
//         ? Math.max(
//             top + 4,
//             hoveredPoint.y - tooltipHeight - 12
//         )
//         : 0;

//     const menuItems = [
//         {
//             key: "view-all",
//             label: "🔎 View All",
//             onClick: onViewAll,
//         },
//         ...(typeof onExportExcel === "function"
//             ? [{
//                 key: "excel",
//                 label: "📊 Export Excel",
//                 onClick: onExportExcel,
//             }]
//             : []),
//         ...(typeof onExportPdf === "function"
//             ? [{
//                 key: "pdf",
//                 label: "📄 Export PDF",
//                 onClick: onExportPdf,
//             }]
//             : []),
//     ];

//     return (
//         <div
//             className="wc-panel-animate wc-trend-panel"
//             style={{
//                 ...styles.panel,
//                 position: "relative",
//                 overflow: "visible",
//             }}
//         >
//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                     gap: 8,
//                 }}
//             >
//                 <div style={{ minWidth: 0 }}>
//                     <h3
//                         style={{
//                             ...styles.panelTitle,
//                             marginBottom: 2,
//                         }}
//                     >
//                         {title}
//                     </h3>
//                     <div
//                         style={{
//                             fontSize: "0.68rem",
//                             color: C.muted,
//                             fontWeight: 500,
//                             marginTop: 2,
//                         }}
//                     >
//                         {currency} — monthly available observations
//                     </div>
//                 </div>

//                 <ActionMenu items={menuItems} />
//             </div>

//             <div
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 6,
//                     marginTop: 8,
//                     marginBottom: 2,
//                     fontSize: "10px",
//                     color: "#334155",
//                 }}
//             >
//                 <span
//                     style={{
//                         width: 18,
//                         height: 3,
//                         borderRadius: 99,
//                         background: "#4F46E5",
//                         boxShadow: "0 0 7px rgba(79,70,229,.28)",
//                     }}
//                 />
//                 <span>{metricLabel}</span>
//                 {valueLabel ? (
//                     <span style={{ marginLeft: 3, color: "#94A3B8" }}>
//                         {valueLabel}
//                     </span>
//                 ) : null}
//             </div>

//             <svg
//                 viewBox={`0 0 ${width} ${height}`}
//                 width="100%"
//                 style={{
//                     display: "block",
//                     overflow: "visible",
//                 }}
//                 onMouseLeave={() => setHoveredIndex(null)}
//             >
//                 <defs>
//                     <linearGradient
//                         id={chartGradientId}
//                         x1="0"
//                         x2="1"
//                         y1="0"
//                         y2="0"
//                     >
//                         <stop offset="0%" stopColor="#6366F1" />
//                         <stop offset="50%" stopColor="#4F46E5" />
//                         <stop offset="100%" stopColor="#2563EB" />
//                     </linearGradient>

//                     <linearGradient
//                         id={areaGradientId}
//                         x1="0"
//                         x2="0"
//                         y1="0"
//                         y2="1"
//                     >
//                         <stop
//                             offset="0%"
//                             stopColor="#6366F1"
//                             stopOpacity="0.20"
//                         />
//                         <stop
//                             offset="100%"
//                             stopColor="#6366F1"
//                             stopOpacity="0.015"
//                         />
//                     </linearGradient>

//                     <filter
//                         id={`${chartGradientId}-shadow`}
//                         x="-50%"
//                         y="-50%"
//                         width="200%"
//                         height="200%"
//                     >
//                         <feDropShadow
//                             dx="0"
//                             dy="2"
//                             stdDeviation="2.5"
//                             floodColor="#4F46E5"
//                             floodOpacity="0.20"
//                         />
//                     </filter>
//                 </defs>

//                 {[0, 0.25, 0.5, 0.75, 1].map(
//                     (fraction) => {
//                         const value =
//                             maxValue - fraction * range;
//                         const y = yFor(value);

//                         return (
//                             <g key={fraction}>
//                                 <line
//                                     x1={left}
//                                     x2={width - right}
//                                     y1={y}
//                                     y2={y}
//                                     stroke="#E2E8F0"
//                                     strokeWidth="1"
//                                     strokeDasharray={
//                                         fraction === 0
//                                             ? "0"
//                                             : "3 4"
//                                     }
//                                 />
//                                 <text
//                                     x={left - 8}
//                                     y={y + 3}
//                                     textAnchor="end"
//                                     fontSize="10"
//                                     fontWeight="700"
//                                     fill="#64748B"
//                                 >
//                                     {formatAmount(
//                                         value,
//                                         "",
//                                         true
//                                     )}
//                                 </text>
//                             </g>
//                         );
//                     }
//                 )}

//                 {areaPoints && (
//                     <polygon
//                         points={areaPoints}
//                         fill={`url(#${areaGradientId})`}
//                         style={{
//                             transition: "opacity .2s ease",
//                         }}
//                     />
//                 )}

//                 {hoveredPoint && (
//                     <line
//                         x1={hoveredPoint.x}
//                         x2={hoveredPoint.x}
//                         y1={top}
//                         y2={baselineY}
//                         stroke="#94A3B8"
//                         strokeWidth="1"
//                         strokeDasharray="4 4"
//                         opacity="0.65"
//                         pointerEvents="none"
//                     />
//                 )}

//                 <polyline
//                     points={points}
//                     fill="none"
//                     stroke={`url(#${chartGradientId})`}
//                     strokeWidth="3"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     filter={`url(#${chartGradientId}-shadow)`}
//                     style={{
//                         strokeDasharray: 1400,
//                         strokeDashoffset: 1400,
//                         animation:
//                             "wcTrendDraw 1.15s cubic-bezier(.22,.61,.36,1) forwards",
//                     }}
//                 />

//                 {/* Subtle live-flow highlight travelling along the existing line. */}
//                 <polyline
//                     points={points}
//                     fill="none"
//                     stroke="#FFFFFF"
//                     strokeWidth="2.2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeDasharray="34 1366"
//                     strokeDashoffset="0"
//                     opacity="0.55"
//                     pointerEvents="none"
//                     style={{
//                         animation:
//                             "wcTrendLiveFlow 3.2s linear infinite",
//                     }}
//                 />

//                 {pointPairs.map((point) => {
//                     const isHovered =
//                         hoveredIndex === point.index;

//                     return (
//                         <g
//                             key={`${point.period}-${point.index}`}
//                             onMouseEnter={() =>
//                                 setHoveredIndex(
//                                     point.index
//                                 )
//                             }
//                             style={{
//                                 cursor: "pointer",
//                             }}
//                         >
//                             {isHovered && (
//                                 <circle
//                                     cx={point.x}
//                                     cy={point.y}
//                                     r="9"
//                                     fill="#6366F1"
//                                     opacity="0.12"
//                                 />
//                             )}

//                             <circle
//                                 cx={point.x}
//                                 cy={point.y}
//                                 r={isHovered ? 5.5 : 4}
//                                 fill="#FFFFFF"
//                                 stroke="#4F46E5"
//                                 strokeWidth={
//                                     isHovered ? 3 : 2.5
//                                 }
//                                 style={{
//                                     transition:
//                                         "r .15s ease, stroke-width .15s ease",
//                                     filter:
//                                         "drop-shadow(0 2px 3px rgba(79,70,229,.20))",
//                                 }}
//                             />

//                             <text
//                                 x={point.x}
//                                 y={point.y - 12}
//                                 textAnchor="middle"
//                                 fontSize={
//                                     isHovered ? "11" : "10"
//                                 }
//                                 fontWeight="800"
//                                 fill="#1E293B"
//                                 style={{
//                                     transition:
//                                         "font-size .15s ease",
//                                 }}
//                             >
//                                 {formatAmount(
//                                     point.value,
//                                     "",
//                                     true
//                                 )}
//                             </text>

//                             <text
//                                 x={point.x}
//                                 y={height - 15}
//                                 textAnchor="middle"
//                                 fontSize="11"
//                                 fontWeight={
//                                     isHovered ? "800" : "700"
//                                 }
//                                 fill={
//                                     isHovered
//                                         ? "#1E3A8A"
//                                         : "#64748B"
//                                 }
//                             >
//                                 {String(point.period)}
//                             </text>
//                         </g>
//                     );
//                 })}

//                 {hoveredPoint && (
//                     <g
//                         pointerEvents="none"
//                         style={{
//                             filter: "drop-shadow(0 6px 14px rgba(15,23,42,.12))",
//                             animation: "wcTooltipIn .14s ease-out forwards",
//                         }}
//                     >
//                         <rect
//                             x={tooltipX}
//                             y={tooltipY}
//                             width={tooltipWidth}
//                             height={tooltipHeight}
//                             rx="8"
//                             fill="#FFFFFF"
//                             stroke="#DCE3EE"
//                             strokeWidth="1"
//                             filter={`drop-shadow(0 6px 14px rgba(15,23,42,.12))`}
//                         />
//                         <circle
//                             cx={tooltipX + 12}
//                             cy={tooltipY + 14}
//                             r="5"
//                             fill="#4F46E5"
//                         />
//                         <text
//                             x={tooltipX + 22}
//                             y={tooltipY + 17}
//                             fontSize="13"
//                             fontWeight="800"
//                             fill="#1E1B4B"
//                         >
//                             {String(hoveredPoint.period)}
//                         </text>
//                         <text
//                             x={tooltipX + 12}
//                             y={tooltipY + 39}
//                             fontSize="12"
//                             fontWeight="600"
//                             fill="#64748B"
//                         >
//                             Amount
//                         </text>
//                         <text
//                             x={tooltipX + tooltipWidth - 12}
//                             y={tooltipY + 40}
//                             textAnchor="end"
//                             fontSize="15"
//                             fontWeight="800"
//                             fill="#4F46E5"
//                         >
//                             {formatAmount(
//                                 hoveredPoint.value,
//                                 currency,
//                                 false
//                             )}
//                         </text>
//                     </g>
//                 )}
//             </svg>
//         </div>
//     );
// }

// function exportWorkingCapitalAllToExcel(payload, currency) {
//     const sections = [
//         ["KPIs", payload.kpisRows || []],
//         ["Working Capital Trend", payload.trend || []],
//         ["Trade Working Capital Trend", payload.tradeTrend || []],
//         ["Components", payload.componentsRows || []],
//         ["Current Assets", payload.assetRows || []],
//         ["Current Liabilities", payload.liabilityRows || []],
//         ["Assets vs Liabilities", payload.avlRows || []],
//         ["CCC Trend", payload.cccTrend || []],
//     ];
//     const worksheets = sections.map(([name, rows]) => {
//         const safe = Array.isArray(rows) ? rows : [];
//         const keys = safe.length ? Object.keys(safe[0]) : ["value"];
//         const header = `<Row>${keys.map((k) => `<Cell><Data ss:Type="String">${escapeSpreadsheetXml(k)}</Data></Cell>`).join("")}</Row>`;
//         const body = safe.map((row) => `<Row>${keys.map((k) => { const v = row?.[k]; const n = toNumber(v); return n !== null && typeof v !== "string" ? `<Cell><Data ss:Type="Number">${n}</Data></Cell>` : `<Cell><Data ss:Type="String">${escapeSpreadsheetXml(v ?? "—")}</Data></Cell>`; }).join("")}</Row>`).join("");
//         return `<Worksheet ss:Name="${escapeSpreadsheetXml(name.slice(0, 31))}"><Table>${header}${body}</Table></Worksheet>`;
//     }).join("");
//     const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${worksheets}</Workbook>`;
//     const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
//     const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `working-capital-report-${currency || "reporting-currency"}.xls`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
// }

// function exportWorkingCapitalAllToPdf(payload, currency) {
//     const popup = window.open("", "_blank", "width=1100,height=800");
//     if (!popup) { window.alert("Please allow pop-ups to export Working Capital as PDF."); return; }
//     const sections = [
//         ["Working Capital KPIs", payload.kpisRows || []],
//         ["Working Capital Trend", payload.trend || []],
//         ["Trade Working Capital Trend", payload.tradeTrend || []],
//         ["Working Capital Components", payload.componentsRows || []],
//         ["Current Assets Breakdown", payload.assetRows || []],
//         ["Current Liabilities Breakdown", payload.liabilityRows || []],
//         ["Current Assets vs Current Liabilities", payload.avlRows || []],
//         ["Cash Conversion Cycle Trend", payload.cccTrend || []],
//     ];
//     const sectionHtml = sections.map(([title, rows]) => { const safe = Array.isArray(rows) ? rows : []; if (!safe.length) return `<section><h2>${escapeSpreadsheetXml(title)}</h2><p>No data available.</p></section>`; const keys = Object.keys(safe[0]); return `<section><h2>${escapeSpreadsheetXml(title)}</h2><table><thead><tr>${keys.map(k => `<th>${escapeSpreadsheetXml(k)}</th>`).join("")}</tr></thead><tbody>${safe.map(row => `<tr>${keys.map(k => `<td>${escapeSpreadsheetXml(row?.[k] ?? "—")}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`; }).join("");
//     popup.document.write(`<!doctype html><html><head><title>Working Capital Report</title><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');body{font-family:Inter,Arial,sans-serif;color:#0F172A;padding:28px}h1{font-size:22px;margin:0 0 5px;font-weight:800}p.meta{color:#64748B;font-size:11px;margin:0 0 20px}section{margin-bottom:24px;break-inside:avoid}h2{font-size:14px;color:#173575;margin:0 0 8px}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#F1F5F9;color:#173575;text-align:left;padding:7px;border-bottom:2px solid #CBD5E1}td{padding:7px;border-bottom:1px solid #E2E8F0}td:not(:first-child){text-align:right}@media print{section{break-inside:avoid}}</style></head><body><h1>Working Capital Report</h1><p class="meta">Reporting currency: ${escapeSpreadsheetXml(currency || "—")} · Exported from current loaded dashboard data</p>${sectionHtml}</body></html>`);
//     popup.document.close(); popup.focus(); setTimeout(() => popup.print(), 300);
// }



// function exportLiquidityRatioToExcel(value, period) {
//     const xml = `<?xml version="1.0"?>
// <?mso-application progid="Excel.Sheet"?>
// <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
//     xmlns:o="urn:schemas-microsoft-com:office:office"
//     xmlns:x="urn:schemas-microsoft-com:office:excel"
//     xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
//     <Worksheet ss:Name="Liquidity Ratio">
//         <Table>
//             <Row>
//                 <Cell><Data ss:Type="String">Period</Data></Cell>
//                 <Cell><Data ss:Type="String">Particulars</Data></Cell>
//                 <Cell><Data ss:Type="String">Value</Data></Cell>
//             </Row>
//             <Row>
//                 <Cell><Data ss:Type="String">${escapeSpreadsheetXml(period || "")}</Data></Cell>
//                 <Cell><Data ss:Type="String">Current Ratio</Data></Cell>
//                 <Cell><Data ss:Type="Number">${Number(toNumber(value) ?? 0)}</Data></Cell>
//             </Row>
//         </Table>
//     </Worksheet>
// </Workbook>`;

//     const blob = new Blob([xml], {
//         type: "application/vnd.ms-excel",
//     });

//     const url = URL.createObjectURL(blob);
//     const anchor = document.createElement("a");
//     anchor.href = url;
//     anchor.download = "working-capital-key-liquidity-ratio.xls";
//     document.body.appendChild(anchor);
//     anchor.click();
//     anchor.remove();
//     URL.revokeObjectURL(url);
// }

// function exportLiquidityRatioToPdf(value, period) {
//     const popup = window.open(
//         "",
//         "_blank",
//         "width=900,height=700"
//     );

//     if (!popup) {
//         window.alert(
//             "Please allow pop-ups to export the Key Liquidity Ratio as PDF."
//         );
//         return;
//     }

//     popup.document.write(`
//         <!doctype html>
//         <html>
//         <head>
//             <title>Key Liquidity Ratio</title>
//             <style>
//                 body {
//                     font-family: Arial, sans-serif;
//                     color: #0F172A;
//                     padding: 32px;
//                 }
//                 h1 {
//                     margin: 0 0 6px;
//                     font-size: 20px;
//                 }
//                 p {
//                     margin: 0 0 18px;
//                     color: #64748B;
//                     font-size: 12px;
//                 }
//                 table {
//                     width: 100%;
//                     border-collapse: collapse;
//                     font-size: 12px;
//                 }
//                 th {
//                     background: #EEF2FF;
//                     color: #1E3A8A;
//                     text-align: left;
//                     padding: 9px 10px;
//                     border-bottom: 2px solid #CBD5E1;
//                 }
//                 td {
//                     padding: 9px 10px;
//                     border-bottom: 1px solid #E2E8F0;
//                 }
//                 td:last-child, th:last-child {
//                     text-align: right;
//                 }
//             </style>
//         </head>
//         <body>
//             <h1>Key Liquidity Ratio</h1>
//             <p>Period: ${escapeSpreadsheetXml(period || "—")}</p>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Particulars</th>
//                         <th>Value</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     <tr>
//                         <td>Current Ratio</td>
//                         <td>${escapeSpreadsheetXml(
//         toNumber(value) === null
//             ? "—"
//             : toNumber(value).toFixed(2)
//     )}</td>
//                     </tr>
//                 </tbody>
//             </table>
//         </body>
//         </html>
//     `);

//     popup.document.close();
//     popup.focus();

//     setTimeout(() => {
//         popup.print();
//     }, 250);
// }

// function BreakdownTable({
//     title,
//     rows,
//     total,
//     currency,
//     period,
//     periodEnd,
//     onViewAll,
//     onExportExcel,
//     onExportPdf,
// }) {
//     const hasPercentages = rows.some(
//         (row) => row.percentage !== null
//     );

//     return (
//         <div
//             className="wc-panel-animate"
//             style={{
//                 ...styles.panel,
//                 display: "flex",
//                 flexDirection: "column",
//                 minHeight: "320px",
//             }}
//         >
//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     gap: "8px",
//                     marginBottom: "8px",
//                 }}
//             >
//                 <h3
//                     style={{
//                         ...styles.panelTitle,
//                         marginBottom: 0,
//                     }}
//                 >
//                     {title}
//                 </h3>

//                 <ActionMenu
//                     items={[
//                         {
//                             key: "view-all",
//                             label: "🔎 View All",
//                             onClick: onViewAll,
//                         },
//                         {
//                             key: "excel",
//                             label: "📊 Export Excel",
//                             onClick: onExportExcel,
//                         },
//                         {
//                             key: "pdf",
//                             label: "📄 Export PDF",
//                             onClick: onExportPdf,
//                         },
//                     ]}
//                 />
//             </div>

//             <div
//                 style={{
//                     color: C.muted,
//                     fontSize: "0.68rem",
//                     marginBottom: "8px",
//                     fontWeight: 600,
//                 }}
//             >
//                 {period
//                     ? `Period: ${period}`
//                     : "Period: —"}
//                 {periodEnd
//                     ? ` (${formatDate(periodEnd)})`
//                     : ""}
//             </div>

//             <div
//                 style={{
//                     overflowX: "auto",
//                     flex: 1,
//                     display: "flex",
//                     flexDirection: "column",
//                 }}
//             >
//                 <table
//                     className="wc-sales-data-table wc-breakdown-sales-table"
//                     style={{
//                         width: "100%",
//                         borderCollapse: "collapse",
//                         fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
//                         fontSize: "0.80rem",
//                         minWidth: hasPercentages ? "320px" : "280px",
//                         height: "100%",
//                         display: "flex",
//                         flexDirection: "column",
//                     }}
//                 >
//                     <thead
//                         style={{
//                             display: "block",
//                             width: "100%",
//                         }}
//                     >
//                         <tr
//                             style={{
//                                 background: "#F8FAFC",
//                                 color: "#1E3A8A",
//                                 display: "grid",
//                                 gridTemplateColumns: hasPercentages ? "1.4fr 1fr 0.7fr" : "1.6fr 1fr",
//                             }}
//                         >
//                             <th
//                                 style={{
//                                     padding: "8px 10px",
//                                     textAlign: "left",
//                                     fontSize: "0.74rem",
//                                     fontWeight: 700,
//                                 }}
//                             >
//                                 Particulars
//                             </th>

//                             <th
//                                 style={{
//                                     padding: "8px 10px",
//                                     textAlign: "right",
//                                     fontSize: "0.74rem",
//                                     fontWeight: 700,
//                                 }}
//                             >
//                                 Amount
//                             </th>

//                             {hasPercentages && (
//                                 <th
//                                     style={{
//                                         padding: "8px 10px",
//                                         textAlign: "right",
//                                     }}
//                                 >
//                                     % of Total
//                                 </th>
//                             )}
//                         </tr>
//                     </thead>

//                     <tbody style={{ display: "flex", flexDirection: "column", flex: 1 }}>
//                         {rows.length ? (
//                             rows.map((row, index) => {
//                                 const isNegative =
//                                     row.amount !== null &&
//                                     row.amount < 0;

//                                 return (
//                                     <tr
//                                         key={`${row.key || row.particular}-${index}`}
//                                         style={{ display: "grid", gridTemplateColumns: hasPercentages ? "1.4fr 1fr 0.7fr" : "1.6fr 1fr", minHeight: "42px" }}
//                                     >
//                                         <td
//                                             style={{
//                                                 padding: "8px 16px",
//                                                 borderBottom: "1px solid #EEF1F5",
//                                                 color: "#334155",
//                                                 fontSize: "0.80rem",
//                                                 fontWeight: 600,
//                                             }}
//                                         >
//                                             {row.particular}
//                                         </td>

//                                         <td
//                                             style={{
//                                                 padding: "8px 16px",
//                                                 textAlign: "right",
//                                                 borderBottom: "1px solid #EEF1F5",
//                                                 color: isNegative ? "#DC2626" : "#334155",
//                                                 fontSize: "0.80rem",
//                                                 fontWeight: 600,
//                                             }}
//                                         >
//                                             {row.amount === null
//                                                 ? "—"
//                                                 : formatAmount(
//                                                     row.amount,
//                                                     "",
//                                                     false
//                                                 )}
//                                         </td>

//                                         {hasPercentages && (
//                                             <td
//                                                 style={{
//                                                     padding: "8px 16px",
//                                                     textAlign: "right",
//                                                     borderBottom: "1px solid #EEF1F5",
//                                                     color: "#334155",
//                                                     fontSize: "0.80rem",
//                                                     fontWeight: 600,
//                                                 }}
//                                             >
//                                                 {row.percentage === null
//                                                     ? "—"
//                                                     : `${row.percentage.toFixed(2)}%`}
//                                             </td>
//                                         )}
//                                     </tr>
//                                 );
//                             })
//                         ) : (
//                             <tr>
//                                 <td
//                                     colSpan={hasPercentages ? 3 : 2}
//                                     style={{
//                                         padding: "20px",
//                                         textAlign: "center",
//                                         color: "#98A2B3",
//                                     }}
//                                 >
//                                     No data available.
//                                 </td>
//                             </tr>
//                         )}

//                         <tr
//                             className="wc-breakdown-total-row"
//                             style={{
//                                 background: "#F8FAFC",
//                                 display: "grid",
//                                 gridTemplateColumns: hasPercentages ? "1.4fr 1fr 0.7fr" : "1.6fr 1fr",
//                                 marginTop: "auto",
//                             }}
//                         >
//                             <td
//                                 style={{
//                                     padding: "8px 10px",
//                                     fontSize: "0.80rem",
//                                     fontWeight: 900,
//                                     color: "#172554",
//                                 }}
//                             >
//                                 Total
//                             </td>

//                             <td
//                                 style={{
//                                     padding: "8px 10px",
//                                     textAlign: "right",
//                                     fontSize: "0.80rem",
//                                     fontWeight: 900,
//                                     color: "#1E293B",
//                                 }}
//                             >
//                                 {formatAmount(
//                                     total,
//                                     "",
//                                     false
//                                 )}
//                             </td>

//                             {hasPercentages && (
//                                 <td
//                                     style={{
//                                         padding: "8px 10px",
//                                         textAlign: "right",
//                                         fontWeight: 900,
//                                         color: "#1E293B",
//                                     }}
//                                 >
//                                     100%
//                                 </td>
//                             )}
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

// function LiquidityRatioCard({
//     currentRatio,
//     currency,
//     period,
//     periodEnd,
//     onViewAll,
//     onExportExcel,
//     onExportPdf,
// }) {
//     const value = toNumber(currentRatio);

//     return (
//         <div className="wc-panel-animate" style={styles.panel}>
//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     gap: 8,
//                     marginBottom: 8,
//                 }}
//             >
//                 <h3
//                     style={{
//                         ...styles.panelTitle,
//                         marginBottom: 0,
//                     }}
//                 >
//                     Key Liquidity Ratio ({currency})
//                 </h3>

//                 <ActionMenu
//                     items={[
//                         {
//                             key: "view-all",
//                             label: "🔎 View All",
//                             onClick: onViewAll,
//                         },
//                         {
//                             key: "excel",
//                             label: "📊 Export Excel",
//                             onClick: onExportExcel,
//                         },
//                         {
//                             key: "pdf",
//                             label: "📄 Export PDF",
//                             onClick: onExportPdf,
//                         },
//                     ]}
//                 />
//             </div>

//             <div
//                 style={{
//                     color: C.muted,
//                     fontSize: "0.68rem",
//                     marginBottom: "8px",
//                     fontWeight: 500,
//                 }}
//             >
//                 {period
//                     ? `Period: ${period}`
//                     : "Period: —"}
//                 {periodEnd
//                     ? ` (${formatDate(periodEnd)})`
//                     : ""}
//             </div>

//             <div style={{ overflowX: "auto" }}>
//                 <table
//                     className="wc-sales-data-table wc-breakdown-sales-table"
//                     style={{
//                         width: "100%",
//                         borderCollapse: "collapse",
//                         fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
//                         fontSize: "0.80rem",
//                         minWidth: "280px",
//                     }}
//                 >
//                     <thead>
//                         <tr
//                             style={{
//                                 background: "#F8FAFC",
//                                 color: "#1E3A8A",
//                                 fontSize: "0.74rem",
//                                 fontWeight: 700,
//                             }}
//                         >
//                             <th
//                                 style={{
//                                     padding: "8px 10px",
//                                     textAlign: "left",
//                                 }}
//                             >
//                                 Particulars
//                             </th>
//                             <th
//                                 style={{
//                                     padding: "8px 10px",
//                                     textAlign: "right",
//                                 }}
//                             >
//                                 Value
//                             </th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         <tr>
//                             <td
//                                 style={{
//                                     padding: "8px 5px",
//                                     borderBottom: "1px solid #EEF1F5",
//                                     color: "#334155",
//                                     fontSize: "0.80rem",
//                                     fontWeight: 600,
//                                 }}
//                             >
//                                 Current Ratio
//                             </td>

//                             <td
//                                 style={{
//                                     padding: "8px 5px",
//                                     textAlign: "right",
//                                     borderBottom: "1px solid #EEF1F5",
//                                     color: "#173575",
//                                     fontWeight: 800,
//                                     fontSize: "0.80rem",
//                                 }}
//                             >
//                                 {value === null
//                                     ? "—"
//                                     : value.toFixed(2)}
//                             </td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>

//             <div
//                 style={{
//                     marginTop: "8px",
//                     color: "#64748B",
//                     fontSize: "8px",
//                 }}
//             >
//                 Current Ratio includes Short-Term Borrowings.
//             </div>
//         </div>
//     );
// }

// function exportRowsToExcelFile(rows, columns, filename, sheetName = "Working Capital") {
//     const safeRows = Array.isArray(rows) ? rows : [];
//     const header = `<Row>${columns.map((column) => `<Cell><Data ss:Type="String">${escapeSpreadsheetXml(column.label)}</Data></Cell>`).join("")}</Row>`;
//     const body = safeRows.map((row) => `<Row>${columns.map((column) => {
//         const value = typeof column.get === "function" ? column.get(row) : row?.[column.key];
//         const numeric = toNumber(value);
//         return numeric !== null && typeof value !== "string"
//             ? `<Cell><Data ss:Type="Number">${numeric}</Data></Cell>`
//             : `<Cell><Data ss:Type="String">${escapeSpreadsheetXml(value ?? "—")}</Data></Cell>`;
//     }).join("")}</Row>`).join("");
//     const xml = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="${escapeSpreadsheetXml(sheetName)}"><Table>${header}${body}</Table></Worksheet></Workbook>`;
//     const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
//     const url = URL.createObjectURL(blob);
//     const anchor = document.createElement("a");
//     anchor.href = url;
//     anchor.download = filename;
//     document.body.appendChild(anchor);
//     anchor.click();
//     anchor.remove();
//     URL.revokeObjectURL(url);
// }

// function exportRowsToPdfFile(title, rows, columns, subtitle = "") {
//     const popup = window.open("", "_blank", "width=1000,height=750");
//     if (!popup) {
//         window.alert("Please allow pop-ups to export the report as PDF.");
//         return;
//     }
//     const header = columns.map((column) => `<th>${escapeSpreadsheetXml(column.label)}</th>`).join("");
//     const body = (Array.isArray(rows) ? rows : []).map((row) => `<tr>${columns.map((column) => `<td>${escapeSpreadsheetXml(typeof column.get === "function" ? column.get(row) : row?.[column.key] ?? "—")}</td>`).join("")}</tr>`).join("");
//     popup.document.write(`<!doctype html><html><head><title>${escapeSpreadsheetXml(title)}</title><style>body{font-family:Inter,Arial,sans-serif;color:#0F172A;padding:30px}h1{font-size:20px;margin:0 0 5px}p{font-size:12px;color:#64748B;margin:0 0 18px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#EEF2FF;color:#1E3A8A;text-align:left;padding:9px;border-bottom:2px solid #CBD5E1}td{padding:9px;border-bottom:1px solid #E2E8F0}td:not(:first-child){text-align:right}.footer{margin-top:16px;color:#94A3B8;font-size:10px}</style></head><body><h1>${escapeSpreadsheetXml(title)}</h1><p>${escapeSpreadsheetXml(subtitle)}</p><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></body></html>`);
//     popup.document.close();
//     popup.focus();
//     setTimeout(() => popup.print(), 250);
// }



// function exportAssetsVsLiabilitiesToExcel(rows, currency) {
//     exportRowsToExcelFile(rows, [
//         { key: "label", label: "Particular" },
//         { key: "previous", label: `Previous (${currency})` },
//         { key: "current", label: `Current (${currency})` },
//     ], "working-capital-assets-vs-liabilities.xls", "Assets vs Liabilities");
// }

// function exportAssetsVsLiabilitiesToPdf(rows, currency, period) {
//     exportRowsToPdfFile("Current Assets vs Current Liabilities", rows, [
//         { key: "label", label: "Particular" },
//         { key: "previous", label: `Previous (${currency})` },
//         { key: "current", label: `Current (${currency})` },
//     ], `${currency} — Balance Sheet Period: ${period || "—"}`);
// }

// function TradeWorkingCapitalComponents({ components, currency, onViewAll }) {
//     const rows = [
//         {
//             label: "Receivables",
//             value: toNumber(
//                 getValue(components, "receivables", "total_receivables")
//             ),
//             type: "positive",
//         },
//         {
//             label: "Inventory",
//             value: toNumber(
//                 getValue(components, "inventory", "total_inventory")
//             ),
//             type: "positive",
//         },
//         {
//             label: "(-) Payables",
//             value: toNumber(
//                 getValue(components, "payables", "total_payables")
//             ),
//             type: "negative",
//         },
//         {
//             label: "Trade Working Capital",
//             value: toNumber(
//                 getValue(
//                     components,
//                     "trade_working_capital",
//                     "trade_working_capital_value",
//                     "working_capital"
//                 )
//             ),
//             type: "total",
//         },
//     ];

//     const validValues = rows
//         .map((row) => row.value)
//         .filter((value) => value !== null);

//     const maxValue = Math.max(...validValues, 1);
//     const width = 640;
//     const height = 245;
//     const left = 46;
//     const right = 18;
//     const top = 30;
//     const bottom = 54;
//     const plotHeight = height - top - bottom;
//     const slot = (width - left - right) / rows.length;
//     const barWidth = Math.min(46, slot * 0.52);
//     const scale = (value) =>
//         (Math.abs(value || 0) / maxValue) * plotHeight;

//     const [hoveredIndex, setHoveredIndex] = useState(null);

//     let running = 0;

//     const bars = rows.map((row) => {
//         if (row.type === "total") {
//             const value = row.value;
//             return {
//                 ...row,
//                 start: 0,
//                 end: value ?? 0,
//             };
//         }

//         const before = running;

//         if (row.value !== null) {
//             running +=
//                 row.type === "negative"
//                     ? -row.value
//                     : row.value;
//         }

//         return {
//             ...row,
//             start: before,
//             end: running,
//         };
//     });

//     const hoveredBar =
//         hoveredIndex === null
//             ? null
//             : bars[hoveredIndex] || null;

//     return (
//         <div
//             className="wc-panel-animate"
//             style={{
//                 ...styles.panel,
//                 position: "relative",
//                 overflow: "visible",
//             }}
//         >
//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     gap: 8,
//                 }}
//             >
//                 <div>
//                     <h3
//                         style={{
//                             ...styles.panelTitle,
//                             marginBottom: 2,
//                         }}
//                     >
//                         Working Capital Components ({currency})
//                     </h3>
//                     <div
//                         style={{
//                             fontSize: "0.68rem",
//                             color: C.muted,
//                             marginTop: 2,
//                             fontWeight: 500,
//                         }}
//                     >
//                         {currency} — Receivables + Inventory − Payables = Trade Working Capital
//                     </div>
//                 </div>

//                 <ActionMenu
//                     items={[
//                         {
//                             key: "view-all",
//                             label: "🔎 View All",
//                             onClick: onViewAll,
//                         },
//                     ]}
//                 />
//             </div>

//             <svg
//                 viewBox={`0 0 ${width} ${height}`}
//                 width="100%"
//                 style={{
//                     display: "block",
//                     marginTop: "3px",
//                     overflow: "visible",
//                 }}
//                 onMouseLeave={() => setHoveredIndex(null)}
//             >
//                 <defs>
//                     <linearGradient
//                         id="wc-components-positive"
//                         x1="0"
//                         y1="0"
//                         x2="0"
//                         y2="1"
//                     >
//                         <stop offset="0%" stopColor="#34D399" />
//                         <stop offset="100%" stopColor="#059669" />
//                     </linearGradient>
//                     <linearGradient
//                         id="wc-components-negative"
//                         x1="0"
//                         y1="0"
//                         x2="0"
//                         y2="1"
//                     >
//                         <stop offset="0%" stopColor="#FB7185" />
//                         <stop offset="100%" stopColor="#DB2777" />
//                     </linearGradient>
//                     <linearGradient
//                         id="wc-components-total"
//                         x1="0"
//                         y1="0"
//                         x2="0"
//                         y2="1"
//                     >
//                         <stop offset="0%" stopColor="#6366F1" />
//                         <stop offset="100%" stopColor="#2563EB" />
//                     </linearGradient>
//                 </defs>

//                 {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
//                     const yy =
//                         height -
//                         bottom -
//                         fraction * plotHeight;

//                     return (
//                         <g key={fraction}>
//                             <line
//                                 x1={left}
//                                 x2={width - right}
//                                 y1={yy}
//                                 y2={yy}
//                                 stroke="#E2E8F0"
//                                 strokeDasharray={
//                                     fraction === 0
//                                         ? "0"
//                                         : "3 4"
//                                 }
//                             />
//                             <text
//                                 x={left - 6}
//                                 y={yy + 3}
//                                 textAnchor="end"
//                                 fontSize="10"
//                                 fontWeight="600"
//                                 fill="#94A3B8"
//                             >
//                                 {formatAmount(
//                                     maxValue * fraction,
//                                     "",
//                                     true
//                                 )}
//                             </text>
//                         </g>
//                     );
//                 })}

//                 {bars.map((bar, index) => {
//                     const x =
//                         left +
//                         index * slot +
//                         (slot - barWidth) / 2;
//                     const value = bar.value;

//                     if (value === null) {
//                         return (
//                             <text
//                                 key={bar.label}
//                                 x={x + barWidth / 2}
//                                 y={height - 20}
//                                 textAnchor="middle"
//                                 fontSize="10"
//                                 fill="#64748B"
//                             >
//                                 {bar.label}
//                             </text>
//                         );
//                     }

//                     const topValue = Math.max(
//                         bar.start,
//                         bar.end
//                     );
//                     const bottomValue = Math.min(
//                         bar.start,
//                         bar.end
//                     );
//                     const barHeight = scale(
//                         topValue - bottomValue
//                     );
//                     const y =
//                         height -
//                         bottom -
//                         scale(topValue);
//                     const hovered =
//                         hoveredIndex === index;
//                     const fillId =
//                         bar.type === "negative"
//                             ? "url(#wc-components-negative)"
//                             : bar.type === "total"
//                                 ? "url(#wc-components-total)"
//                                 : "url(#wc-components-positive)";

//                     return (
//                         <g
//                             key={bar.label}
//                             onMouseEnter={() =>
//                                 setHoveredIndex(index)
//                             }
//                             style={{
//                                 cursor: "pointer",
//                             }}
//                         >
//                             <rect
//                                 x={x}
//                                 y={y}
//                                 width={barWidth}
//                                 height={Math.max(
//                                     barHeight,
//                                     2
//                                 )}
//                                 rx="5"
//                                 fill={fillId}
//                                 opacity={
//                                     hoveredIndex === null || hovered
//                                         ? 1
//                                         : 0.62
//                                 }
//                                 style={{
//                                     transition:
//                                         "opacity .18s ease, filter .18s ease, transform .18s ease",
//                                     transformOrigin: `${x + barWidth / 2}px ${height - bottom}px`,
//                                     filter: hovered
//                                         ? "drop-shadow(0 6px 7px rgba(37,99,235,.22))"
//                                         : "none",
//                                     transform: hovered
//                                         ? "translateY(-2px)"
//                                         : "translateY(0)",
//                                 }}
//                             />

//                             <text
//                                 x={x + barWidth / 2}
//                                 y={Math.max(
//                                     top + 10,
//                                     y - 7
//                                 )}
//                                 textAnchor="middle"
//                                 fontSize={hovered ? "13" : "12"}
//                                 fontWeight="800"
//                                 fill="#1E293B"
//                             >
//                                 {formatAmount(
//                                     value,
//                                     "",
//                                     true
//                                 )}
//                             </text>

//                             <text
//                                 x={x + barWidth / 2}
//                                 y={height - 21}
//                                 textAnchor="middle"
//                                 fontSize={hovered ? "12" : "11"}
//                                 fontWeight={hovered ? "700" : "500"}
//                                 fill={
//                                     hovered
//                                         ? "#1E293B"
//                                         : "#334155"
//                                 }
//                             >
//                                 {bar.label}
//                             </text>

//                             {hovered && (
//                                 <g
//                                     pointerEvents="none"
//                                     style={{
//                                         filter: "drop-shadow(0 5px 12px rgba(15,23,42,.14))",
//                                         animation: "wcTooltipIn .14s ease-out forwards",
//                                     }}
//                                 >
//                                     <rect
//                                         x={Math.max(4, Math.min(width - 174, x + barWidth / 2 - 87))}
//                                         y={Math.max(6, y - 72)}
//                                         width="174"
//                                         height="56"
//                                         rx="8"
//                                         fill="#FFFFFF"
//                                         stroke={bar.type === "negative" ? "#F3B4C8" : bar.type === "total" ? "#C7D2FE" : "#B7E4D3"}
//                                         strokeWidth="1"
//                                     />
//                                     <rect
//                                         x={Math.max(4, Math.min(width - 174, x + barWidth / 2 - 87)) + 10}
//                                         y={Math.max(6, y - 72) + 12}
//                                         width="7"
//                                         height="7"
//                                         rx="1.5"
//                                         fill={bar.type === "negative" ? "#DB2777" : bar.type === "total" ? "#4F46E5" : "#059669"}
//                                     />
//                                     <text
//                                         x={Math.max(4, Math.min(width - 174, x + barWidth / 2 - 87)) + 23}
//                                         y={Math.max(6, y - 72) + 19}
//                                         fontSize="11"
//                                         fontWeight="700"
//                                         fill="#334155"
//                                     >
//                                         {bar.label}
//                                     </text>
//                                     <text
//                                         x={Math.max(4, Math.min(width - 174, x + barWidth / 2 - 87)) + 10}
//                                         y={Math.max(6, y - 72) + 43}
//                                         fontSize="13"
//                                         fontWeight="800"
//                                         fill={bar.type === "negative" ? "#DB2777" : bar.type === "total" ? "#4F46E5" : "#047857"}
//                                     >
//                                         {currency ? `${currency} ${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}
//                                     </text>
//                                 </g>
//                             )}

//                             {index < bars.length - 1 && (
//                                 <line
//                                     x1={x + barWidth}
//                                     x2={
//                                         left +
//                                         (index + 1) * slot +
//                                         (slot - barWidth) / 2
//                                     }
//                                     y1={
//                                         height -
//                                         bottom -
//                                         scale(bar.end)
//                                     }
//                                     y2={
//                                         height -
//                                         bottom -
//                                         scale(bar.end)
//                                     }
//                                     stroke="#CBD5E1"
//                                     strokeWidth={hovered ? "1.5" : "1"}
//                                     strokeDasharray="3 3"
//                                 />
//                             )}
//                         </g>
//                     );
//                 })}
//             </svg>
//         </div>
//     );
// }

// function CashConversionCycle({
//     kpis,
//     cccPayload,
//     operationalDate,
// }) {
//     const dsoRaw = getNullableValue(cccPayload, "dso_days", "dso");
//     const dioRaw = getNullableValue(cccPayload, "dio_days", "dio");
//     const dpoRaw = getNullableValue(cccPayload, "dpo_days", "dpo");
//     const cccRaw = getNullableValue(
//         cccPayload,
//         "cash_conversion_cycle_days",
//         "ccc_days",
//         "ccc"
//     );

//     // Display backend values directly. Null DIO / CCC remain unavailable.
//     const dso = dsoRaw !== undefined ? toNumber(dsoRaw) : toNumber(kpis?.dso_days);
//     const dio = dioRaw !== undefined ? toNumber(dioRaw) : toNumber(kpis?.dio_days);
//     const dpo = dpoRaw !== undefined ? toNumber(dpoRaw) : toNumber(kpis?.dpo_days);
//     const ccc = cccRaw !== undefined
//         ? toNumber(cccRaw)
//         : toNumber(kpis?.cash_conversion_cycle_days);

//     const status =
//         getValue(cccPayload, "status", "ccc_status") ??
//         kpis?.ccc_status;

//     const cards = [
//         {
//             label: "DSO (Days)",
//             value: dso,
//             icon: "◔",
//             bg: "#EEF6FF",
//             iconBg: "#DDEEFF",
//             accent: "#2563EB",
//         },
//         {
//             label: "DIO (Days)",
//             value: dio,
//             icon: "♟",
//             bg: "#F1FBF5",
//             iconBg: "#DCF5E6",
//             accent: "#16A34A",
//         },
//         {
//             label: "DPO (Days)",
//             value: dpo,
//             icon: "¤",
//             bg: "#F0FBFD",
//             iconBg: "#D8F4F7",
//             accent: "#0891B2",
//         },
//         {
//             label: "CCC (Days)",
//             value: ccc,
//             icon: "◷",
//             bg: "#FFF2F7",
//             iconBg: "#FCE0EB",
//             accent: "#DB2777",
//         },
//     ];

//     const renderCard = (card) => (
//         <div
//             key={card.label}
//             style={{
//                 background: card.bg,
//                 border: "1px solid #EEF2F7",
//                 borderRadius: "9px",
//                 padding: "9px 6px 8px",
//                 minWidth: 0,
//                 textAlign: "center",
//                 boxSizing: "border-box",
//             }}
//         >
//             <div
//                 style={{
//                     width: "30px",
//                     height: "30px",
//                     margin: "0 auto 6px",
//                     borderRadius: "50%",
//                     background: card.iconBg,
//                     color: card.accent,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: "16px",
//                     fontWeight: 800,
//                     boxShadow: "0 1px 3px rgba(15,23,42,.06)",
//                 }}
//             >
//                 {card.icon}
//             </div>

//             <div
//                 style={{
//                     color: card.accent,
//                     fontSize: "9px",
//                     lineHeight: 1.15,
//                     fontWeight: 800,
//                     whiteSpace: "nowrap",
//                 }}
//             >
//                 {card.label}
//             </div>

//             <div
//                 style={{
//                     color: "#0F172A",
//                     fontSize: "20px",
//                     lineHeight: 1.05,
//                     fontWeight: 800,
//                     marginTop: "6px",
//                     letterSpacing: "-0.02em",
//                 }}
//                 title={
//                     card.value === null &&
//                         (card.label === "DIO (Days)" || card.label === "CCC (Days)") &&
//                         status === "INSUFFICIENT_INVENTORY_HISTORY"
//                         ? "DIO and CCC require sufficient inventory history."
//                         : undefined
//                 }
//             >
//                 {card.value === null ? "—" : card.value.toFixed(2)}
//             </div>
//         </div>
//     );

//     return (
//         <div className="wc-panel-animate" style={styles.panel}>
//             <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
//                 <div>
//                     <h3 style={{ ...styles.panelTitle, marginBottom: 2 }}>Cash Conversion Cycle (Days)</h3>
//                     <div style={{ fontSize: "0.68rem", color: C.muted, marginTop: 2, fontWeight: 500 }}>
//                         AED — monthly available observations
//                     </div>
//                 </div>
//             </div>

//             <div
//                 style={{
//                     display: "grid",
//                     gridTemplateColumns:
//                         "minmax(0, 1fr) 18px minmax(0, 1fr) 18px minmax(0, 1fr) 18px minmax(0, 1fr)",
//                     alignItems: "center",
//                     gap: "5px",
//                     marginTop: "48px",
//                 }}
//             >
//                 {renderCard(cards[0])}
//                 <div style={{ color: "#334155", fontSize: "18px", fontWeight: 800, textAlign: "center" }}>−</div>
//                 {renderCard(cards[1])}
//                 <div style={{ color: "#334155", fontSize: "18px", fontWeight: 800, textAlign: "center" }}>+</div>
//                 {renderCard(cards[2])}
//                 <div style={{ color: "#334155", fontSize: "18px", fontWeight: 800, textAlign: "center" }}>=</div>
//                 {renderCard(cards[3])}
//             </div>

//             <div
//                 style={{
//                     fontSize: "8px",
//                     color: "#64748B",
//                     marginTop: "8px",
//                     lineHeight: 1.45,
//                 }}
//             >
//                 Operational as on {formatDate(operationalDate)}
//                 {status === "INSUFFICIENT_INVENTORY_HISTORY"
//                     ? " · DIO and CCC require sufficient inventory history."
//                     : status
//                         ? ` · ${status}`
//                         : ""}
//             </div>
//         </div>
//     );
// }

// function MultiSelectField({
//     label,
//     values,
//     options,
//     onChange,
// }) {
//     const [open, setOpen] = useState(false);
//     const [query, setQuery] = useState("");
//     const ref = useRef(null);

//     useEffect(() => {
//         if (!open) return;
//         const handler = (event) => {
//             if (ref.current && !ref.current.contains(event.target)) {
//                 setOpen(false);
//                 setQuery("");
//             }
//         };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, [open]);

//     const selected = Array.isArray(values) ? values : [];

//     const visibleOptions = options.filter((option) =>
//         String(option.label || "")
//             .toLowerCase()
//             .includes(query.toLowerCase())
//     );

//     const toggle = (id) => {
//         const key = String(id);
//         const exists = selected.some((value) => String(value) === key);
//         onChange(
//             exists
//                 ? selected.filter((value) => String(value) !== key)
//                 : [...selected, key]
//         );
//     };

//     const displayValue =
//         selected.length === 0
//             ? "All"
//             : selected.length === options.length
//                 ? "All"
//                 : selected.length === 1
//                     ? options.find((option) => String(option.id) === String(selected[0]))?.label || "1 selected"
//                     : `${selected.length} selected`;

//     return (
//         <div ref={ref} style={{ position: "relative", minWidth: 0, zIndex: open ? 1500 : 1 }}>
//             <label style={styles.filterLabel}>{label}</label>

//             <button
//                 type="button"
//                 onClick={() => setOpen((value) => !value)}
//                 style={{
//                     ...styles.filterInput,
//                     height: "32px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     textAlign: "left",
//                     cursor: "pointer",
//                     padding: "0 9px",
//                 }}
//             >
//                 <span
//                     style={{
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         whiteSpace: "nowrap",
//                     }}
//                 >
//                     {displayValue}
//                 </span>
//                 <span
//                     style={{
//                         color: "#64748B",
//                         fontSize: "0.62rem",
//                         marginLeft: 5,
//                     }}
//                 >
//                     {open ? "▲" : "▼"}
//                 </span>
//             </button>

//             {open && (
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: "58px",
//                         left: 0,
//                         right: 0,
//                         minWidth: "210px",
//                         zIndex: 500,
//                         background: "#FFFFFF",
//                         border: "1px solid #E2E8F0",
//                         borderRadius: "9px",
//                         boxShadow: "0 12px 30px rgba(15,23,42,.14)",
//                         overflow: "hidden",
//                     }}
//                 >
//                     <div style={{ padding: "7px", borderBottom: "1px solid #E2E8F0" }}>
//                         <div style={{ position: "relative", width: "100%" }}>
//                             <span aria-hidden="true" style={{ position: "absolute", left: 9, top: 7, fontSize: "0.72rem", lineHeight: 1, pointerEvents: "none" }}>🔍</span>
//                             <input
//                                 value={query}
//                                 onChange={(event) => setQuery(event.target.value)}
//                                 placeholder={`Search ${label}`}
//                                 style={{
//                                     width: "100%",
//                                     height: "30px",
//                                     border: "1px solid #CBD5E1",
//                                     borderRadius: "6px",
//                                     padding: "0 9px 0 28px",
//                                     fontSize: "0.70rem",
//                                     outline: "none",
//                                     boxSizing: "border-box",
//                                 }}
//                             />
//                         </div>
//                     </div>

//                     <div
//                         style={{
//                             display: "flex",
//                             justifyContent: "space-between",
//                             padding: "6px 10px",
//                             borderBottom: "1px solid #F1F5F9",
//                         }}
//                     >
//                         <button
//                             type="button"
//                             onClick={() =>
//                                 onChange(options.map((option) => String(option.id)))
//                             }
//                             style={{
//                                 border: "none",
//                                 background: "transparent",
//                                 color: "#2563EB",
//                                 fontSize: "0.68rem",
//                                 fontWeight: 700,
//                                 cursor: "pointer",
//                                 padding: 0,
//                             }}
//                         >
//                             Select All
//                         </button>
//                         <button
//                             type="button"
//                             onClick={() => onChange([])}
//                             style={{
//                                 border: "none",
//                                 background: "transparent",
//                                 color: "#EF4444",
//                                 fontSize: "0.68rem",
//                                 fontWeight: 700,
//                                 cursor: "pointer",
//                                 padding: 0,
//                             }}
//                         >
//                             Clear
//                         </button>
//                     </div>

//                     <div style={{ maxHeight: 210, overflowY: "auto" }}>
//                         {visibleOptions.map((option) => {
//                             const checked = selected.some(
//                                 (value) => String(value) === String(option.id)
//                             );

//                             return (
//                                 <button
//                                     key={option.id}
//                                     type="button"
//                                     onClick={() => toggle(option.id)}
//                                     style={{
//                                         width: "100%",
//                                         display: "flex",
//                                         alignItems: "center",
//                                         gap: "7px",
//                                         border: "none",
//                                         borderBottom: "1px solid #F8FAFC",
//                                         background: checked ? "#EFF6FF" : "#FFFFFF",
//                                         color: checked ? "#2563EB" : "#334155",
//                                         fontSize: "0.70rem",
//                                         fontWeight: checked ? 700 : 500,
//                                         padding: "7px 10px",
//                                         textAlign: "left",
//                                         cursor: "pointer",
//                                     }}
//                                 >
//                                     <span
//                                         style={{
//                                             width: 14,
//                                             height: 14,
//                                             border: `1.5px solid ${checked ? "#2563EB" : "#CBD5E1"}`,
//                                             borderRadius: 3,
//                                             background: checked ? "#2563EB" : "#FFFFFF",
//                                             display: "inline-flex",
//                                             alignItems: "center",
//                                             justifyContent: "center",
//                                             flexShrink: 0,
//                                             color: "#FFFFFF",
//                                             fontSize: "0.60rem",
//                                         }}
//                                     >
//                                         {checked ? "✓" : ""}
//                                     </span>
//                                     <span
//                                         style={{
//                                             overflow: "hidden",
//                                             textOverflow: "ellipsis",
//                                             whiteSpace: "nowrap",
//                                         }}
//                                     >
//                                         {option.label}
//                                     </span>
//                                 </button>
//                             );
//                         })}

//                         {!visibleOptions.length && (
//                             <div
//                                 style={{
//                                     padding: "12px",
//                                     textAlign: "center",
//                                     color: "#94A3B8",
//                                     fontSize: "0.70rem",
//                                 }}
//                             >
//                                 No results
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// function SingleSelectField({ label, value, options, onChange }) {
//     const normalizedOptions = Array.isArray(options) ? options.map((option) => {
//         if (option !== null && typeof option === "object") {
//             return { value: option.value ?? option.id ?? option.key ?? "", label: option.label ?? option.name ?? option.value ?? option.id ?? "" };
//         }
//         return { value: option ?? "", label: option ?? "" };
//     }).filter((option) => option.value !== "") : [];
//     return (
//         <div>
//             <label style={styles.filterLabel}>{label}</label>
//             <select value={value ?? ""} onChange={(event) => onChange(event.target.value)} style={{ ...styles.filterInput, height: "32px", cursor: "pointer" }}>
//                 <option value="">All available</option>
//                 {normalizedOptions.map((option, index) => (
//                     <option key={`${String(option.value)}-${index}`} value={String(option.value)}>
//                         {label === "As On Date" ? formatDate(option.label) : String(option.label)}
//                     </option>
//                 ))}
//             </select>
//         </div>
//     );
// }

// function CalendarDateField({ value, onChange, width = 125 }) {
//     const inputRef = useRef(null);

//     const openCalendar = () => {
//         const input = inputRef.current;
//         if (!input) return;
//         if (typeof input.showPicker === "function") {
//             try {
//                 input.showPicker();
//                 return;
//             } catch (_) {
//                 // Fall through to the native input click.
//             }
//         }
//         input.click();
//     };

//     return (
//         <div
//             style={{
//                 position: "relative",
//                 width,
//                 height: 32,
//                 flexShrink: 0,
//             }}
//         >
//             <button
//                 type="button"
//                 onClick={openCalendar}
//                 style={{
//                     ...styles.filterInput,
//                     width: "100%",
//                     height: "32px",
//                     padding: "0 28px 0 9px",
//                     textAlign: "left",
//                     color: value ? "#334155" : "#94A3B8",
//                     fontWeight: value ? 600 : 500,
//                     cursor: "pointer",
//                     boxSizing: "border-box",
//                     fontFamily: "Inter, system-ui, sans-serif",
//                     background: "#FFFFFF",
//                     position: "relative",
//                     zIndex: 2,
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                     whiteSpace: "nowrap",
//                 }}
//             >
//                 {value ? formatDate(value) : "Select date"}
//             </button>
//             <span
//                 aria-hidden="true"
//                 style={{
//                     position: "absolute",
//                     right: 9,
//                     top: "50%",
//                     transform: "translateY(-50%)",
//                     color: "#64748B",
//                     width: 15,
//                     height: 15,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     pointerEvents: "none",
//                     zIndex: 3,
//                 }}
//             >
//                 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//                     <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
//                     <path d="M7 3.5V7M17 3.5V7M3.5 9.5H20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
//                 </svg>
//             </span>
//             <input
//                 ref={inputRef}
//                 type="date"
//                 value={value || ""}
//                 onChange={(event) => onChange(event.target.value)}
//                 aria-label="As On Date"
//                 style={{
//                     position: "absolute",
//                     inset: 0,
//                     width: "100%",
//                     height: "100%",
//                     opacity: 0,
//                     cursor: "pointer",
//                     pointerEvents: "none",
//                     zIndex: 1,
//                 }}
//             />
//         </div>
//     );
// }

// function ActionMenu({ items = [] }) {
//     const [open, setOpen] = useState(false);
//     const ref = useRef(null);

//     useEffect(() => {
//         if (!open) return undefined;
//         const handler = (event) => {
//             if (ref.current && !ref.current.contains(event.target)) {
//                 setOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, [open]);

//     return (
//         <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
//             <button
//                 type="button"
//                 onClick={(event) => {
//                     event.stopPropagation();
//                     setOpen((value) => !value);
//                 }}
//                 title="Options"
//                 aria-label="Options"
//                 style={{
//                     background: open ? "#F1F5F9" : "none",
//                     border: "none",
//                     cursor: "pointer",
//                     padding: "4px 6px",
//                     borderRadius: 6,
//                     fontSize: "1.1rem",
//                     color: "#94A3B8",
//                     lineHeight: 1,
//                     transition: "all .15s ease",
//                     display: "flex",
//                     alignItems: "center",
//                     outline: "none",
//                 }}
//             >
//                 ⋮
//             </button>

//             {open && (
//                 <div
//                     style={{
//                         position: "absolute",
//                         right: 0,
//                         top: "calc(100% + 4px)",
//                         background: "#FFFFFF",
//                         borderRadius: 10,
//                         boxShadow: "0 8px 24px rgba(0,0,0,.13)",
//                         border: "1px solid #E2E8F0",
//                         minWidth: 168,
//                         zIndex: 1200,
//                         overflow: "hidden",
//                         animation: "wcMenuScale .14s cubic-bezier(.34,1.56,.64,1) forwards",
//                     }}
//                     onClick={(event) => event.stopPropagation()}
//                 >
//                     {items.map((item, index) => {
//                         const disabled = !!item.disabled;
//                         return (
//                             <button
//                                 key={item.key || index}
//                                 type="button"
//                                 disabled={disabled}
//                                 onClick={() => {
//                                     if (disabled) return;
//                                     setOpen(false);
//                                     item.onClick?.();
//                                 }}
//                                 style={{
//                                     display: "block",
//                                     width: "100%",
//                                     textAlign: "left",
//                                     padding: "9px 14px",
//                                     background: "none",
//                                     border: "none",
//                                     borderTop: index > 0 ? "1px solid #F1F5F9" : "none",
//                                     fontSize: "0.75rem",
//                                     fontWeight: 600,
//                                     color: disabled ? "#98A2B3" : "#334155",
//                                     cursor: disabled ? "not-allowed" : "pointer",
//                                     transition: "background .12s ease",
//                                     opacity: disabled ? 0.65 : 1,
//                                 }}
//                                 onMouseEnter={(event) => {
//                                     if (!disabled) event.currentTarget.style.background = "#F8FAFC";
//                                 }}
//                                 onMouseLeave={(event) => {
//                                     event.currentTarget.style.background = "none";
//                                 }}
//                             >
//                                 {item.label}
//                             </button>
//                         );
//                     })}
//                 </div>
//             )}
//         </div>
//     );
// }

// function HeaderExportMenu({
//     exporting,
//     onExport,
// }) {
//     const [open, setOpen] = useState(null);
//     const ref = useRef(null);

//     useEffect(() => {
//         if (!open) return;
//         const handler = (event) => {
//             if (ref.current && !ref.current.contains(event.target)) {
//                 setOpen(null);
//             }
//         };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, [open]);

//     const choose = (format, section) => {
//         setOpen(null);
//         onExport(format, section);
//     };

//     const buttonStyle = (active) => ({
//         ...styles.button,
//         height: "32px",
//         minWidth: "68px",
//         padding: "0 10px",
//         display: "inline-flex",
//         alignItems: "center",
//         justifyContent: "center",
//         gap: 5,
//         color: active ? "#166534" : "#334155",
//         borderColor: active ? "#A7D8BF" : "#CBD5E1",
//         background: "#FFFFFF",
//         fontSize: "0.72rem",
//         fontWeight: 700,
//     });

//     return (
//         <div ref={ref} style={{ display: "flex", gap: 6, position: "relative" }}>
//             {["excel", "pdf"].map((format) => (
//                 <button
//                     key={format}
//                     type="button"
//                     disabled={exporting}
//                     onClick={() => setOpen(open === format ? null : format)}
//                     style={buttonStyle(open === format)}
//                 >
//                     {exporting ? "..." : format === "excel" ? "Excel" : "PDF"}
//                     <span style={{ fontSize: 8 }}>▾</span>
//                 </button>
//             ))}

//             {open && !exporting && (
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: 38,
//                         right: 0,
//                         zIndex: 800,
//                         minWidth: 210,
//                         background: "#FFFFFF",
//                         border: "1px solid #E2E8F0",
//                         borderRadius: 9,
//                         boxShadow: "0 12px 30px rgba(15,23,42,.14)",
//                         padding: 5,
//                     }}
//                 >
//                     <div style={{
//                         padding: "5px 9px 6px",
//                         color: "#64748B",
//                         fontSize: "0.66rem",
//                         fontWeight: 700,
//                     }}>
//                         Export {open === "excel" ? "Excel" : "PDF"}
//                     </div>
//                     {["assets", "liabilities"].map((section) => (
//                         <button
//                             key={section}
//                             type="button"
//                             onClick={() => choose(open, section)}
//                             style={{
//                                 width: "100%",
//                                 border: "none",
//                                 background: "transparent",
//                                 color: "#334155",
//                                 textAlign: "left",
//                                 padding: "8px 10px",
//                                 borderRadius: 6,
//                                 fontSize: "0.70rem",
//                                 fontWeight: 600,
//                                 cursor: "pointer",
//                             }}
//                             onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFC"; }}
//                             onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
//                         >
//                             {section === "assets" ? "Current Assets" : "Current Liabilities"}
//                         </button>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// function ViewAllMultiSelect({
//     label,
//     options = [],
//     value = [],
//     onChange,
//     width = 118,
// }) {
//     const [open, setOpen] = useState(false);
//     const [query, setQuery] = useState("");
//     const ref = useRef(null);
//     const selected = Array.isArray(value) ? value.map(String) : [];

//     useEffect(() => {
//         if (!open) return;
//         const close = (event) => {
//             if (ref.current && !ref.current.contains(event.target)) {
//                 setOpen(false);
//                 setQuery("");
//             }
//         };
//         document.addEventListener("mousedown", close);
//         return () => document.removeEventListener("mousedown", close);
//     }, [open]);

//     const visible = options.filter((item) =>
//         String(item?.label || "").toLowerCase().includes(query.toLowerCase())
//     );

//     const toggle = (id) => {
//         const key = String(id);
//         onChange(
//             selected.includes(key)
//                 ? selected.filter((v) => v !== key)
//                 : [...selected, key]
//         );
//     };

//     const display = selected.length === 0
//         ? "All"
//         : selected.length === 1
//             ? options.find((o) => String(o.id) === selected[0])?.label || "1 selected"
//             : `${selected.length} selected`;

//     return (
//         <div ref={ref} style={{ position: "relative", width, flexShrink: 0, zIndex: open ? 1400 : 1, display: "flex", flexDirection: "column", gap: 4 }}>
//             <span style={{ color: "#1E3A8A", fontSize: "0.68rem", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>{label}</span>
//             <button
//                 type="button"
//                 onClick={() => setOpen((v) => !v)}
//                 style={{
//                     width: "100%",
//                     height: 32,
//                     border: "1px solid #CBD5E1",
//                     borderRadius: 7,
//                     background: "#FFFFFF",
//                     color: "#334155",
//                     padding: "0 26px 0 10px",
//                     textAlign: "left",
//                     fontSize: "0.72rem",
//                     fontWeight: 500,
//                     position: "relative",
//                     cursor: "pointer",
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                 }}
//                 title={display}
//             >
//                 {display}
//                 <span style={{ position: "absolute", right: 9, top: 8, color: "#94A3B8", fontSize: 9 }}>▼</span>
//             </button>

//             {open && (
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: 36,
//                         left: 0,
//                         width: Math.max(width, 210),
//                         zIndex: 1500,
//                         background: "#FFFFFF",
//                         border: "1px solid #E2E8F0",
//                         borderRadius: 9,
//                         boxShadow: "0 14px 32px rgba(15,23,42,.16)",
//                         overflow: "hidden",
//                     }}
//                 >
//                     <div style={{ padding: 7, borderBottom: "1px solid #F1F5F9" }}>
//                         <div style={{ position: "relative", width: "100%" }}>
//                             <span aria-hidden="true" style={{ position: "absolute", left: 8, top: 6, fontSize: "0.70rem", lineHeight: 1, pointerEvents: "none" }}>🔍</span>
//                             <input
//                                 autoFocus
//                                 value={query}
//                                 onChange={(e) => setQuery(e.target.value)}
//                                 placeholder={`Search ${label}`}
//                                 style={{
//                                     width: "100%",
//                                     height: 29,
//                                     border: "1px solid #CBD5E1",
//                                     borderRadius: 6,
//                                     padding: "0 8px 0 27px",
//                                     fontSize: "0.70rem",
//                                     outline: "none",
//                                     boxSizing: "border-box",
//                                 }}
//                             />
//                         </div>
//                     </div>
//                     <div style={{ display: "flex", gap: 5, padding: "6px 8px", borderBottom: "1px solid #F1F5F9" }}>
//                         <button
//                             type="button"
//                             onClick={() => onChange(options.map((o) => String(o.id)))}
//                             style={{ border: "none", background: "#EEF2FF", color: "#4338CA", borderRadius: 5, padding: "4px 7px", fontSize: "0.64rem", fontWeight: 700, cursor: "pointer" }}
//                         >Select All</button>
//                         <button
//                             type="button"
//                             onClick={() => onChange([])}
//                             style={{ border: "none", background: "#F8FAFC", color: "#64748B", borderRadius: 5, padding: "4px 7px", fontSize: "0.64rem", fontWeight: 700, cursor: "pointer" }}
//                         >Clear</button>
//                     </div>
//                     <div style={{ maxHeight: 220, overflowY: "auto", padding: "4px 0" }}>
//                         {visible.length ? visible.map((option) => {
//                             const checked = selected.includes(String(option.id));
//                             return (
//                                 <label
//                                     key={option.id}
//                                     style={{
//                                         display: "flex",
//                                         alignItems: "center",
//                                         gap: 7,
//                                         padding: "6px 9px",
//                                         fontSize: "0.70rem",
//                                         color: "#334155",
//                                         cursor: "pointer",
//                                     }}
//                                 >
//                                     <input
//                                         type="checkbox"
//                                         checked={checked}
//                                         onChange={() => toggle(option.id)}
//                                     />
//                                     <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{option.label}</span>
//                                 </label>
//                             );
//                         }) : (
//                             <div style={{ padding: "12px 9px", color: "#94A3B8", fontSize: "0.68rem" }}>No options found</div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// /* ─── Modal Close Button (Sales Revenue style) ─────────────────── */
// function ModalCloseButton({ onClick }) {
//     const [hover, setHover] = useState(false);
//     return (
//         <button
//             type="button"
//             onClick={onClick}
//             onMouseEnter={() => setHover(true)}
//             onMouseLeave={() => setHover(false)}
//             style={{
//                 background: hover ? "#f1f5f9" : "none",
//                 border: "none",
//                 fontSize: "0.85rem",
//                 color: C.slate,
//                 cursor: "pointer",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 width: 28,
//                 height: 28,
//                 borderRadius: "50%",
//                 transition: "all 0.15s",
//                 outline: "none",
//             }}
//             title="Close"
//         >
//             ✕
//         </button>
//     );
// }

// /* ─── AED / AED Millions Toggle (Sales Revenue style) ──────────── */
// function UnitToggle({ unit, onToggle, currency = "AED" }) {
//     const isAED = unit === "aed";
//     const isMillions = unit === "millions";

//     return (
//         <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
//             <button
//                 type="button"
//                 onClick={() => onToggle("aed")}
//                 style={{
//                     height: 28,
//                     minWidth: 42,
//                     padding: "0 10px",
//                     borderRadius: 6,
//                     border: isAED ? "1px solid #5B3FE4" : "1px solid #E2E8F0",
//                     background: isAED ? "#5B3FE4" : "#FFFFFF",
//                     color: isAED ? "#FFFFFF" : "#334155",
//                     fontSize: 10,
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     transition: "all 0.15s ease",
//                     outline: "none",
//                 }}
//                 title={`Display in ${currency}`}
//             >
//                 {currency}
//             </button>
//             <button
//                 type="button"
//                 onClick={() => onToggle("millions")}
//                 style={{
//                     height: 28,
//                     minWidth: 78,
//                     padding: "0 10px",
//                     borderRadius: 6,
//                     border: isMillions ? "1px solid #5B3FE4" : "1px solid #E2E8F0",
//                     background: isMillions ? "#5B3FE4" : "#FFFFFF",
//                     color: isMillions ? "#FFFFFF" : "#334155",
//                     fontSize: 10,
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     transition: "all 0.15s ease",
//                     outline: "none",
//                 }}
//                 title={`Display in ${currency} Million`}
//             >
//                 {currency} Million
//             </button>
//         </div>
//     );
// }

// function cascadeViewAllOptions(filterOptions, localFilters) {
//     const groups = filterOptions?.legalGroups || [];
//     const entities = filterOptions?.legalEntities || [];
//     const parents = filterOptions?.parentDivisions || [];
//     const subs = filterOptions?.subDivisions || [];

//     const groupIds = (localFilters.legalGroups || []).map(String);
//     const entityIds = (localFilters.legalEntities || []).map(String);
//     const parentIds = (localFilters.parentDivisions || []).map(String);

//     const matches = (item, keys, selected) => {
//         if (!selected.length) return true;
//         const ids = (keys || []).map(String);
//         return !ids.length || ids.some((id) => selected.includes(id));
//     };

//     return {
//         legalGroups: groups,
//         legalEntities: entities.filter((item) => matches(item, item.legalGroupIds, groupIds)),
//         parentDivisions: parents.filter((item) => matches(item, item.legalEntityIds, entityIds) && matches(item, item.legalGroupIds, groupIds)),
//         subDivisions: subs.filter((item) => matches(item, item.parentDivisionIds, parentIds) && matches(item, item.legalEntityIds, entityIds) && matches(item, item.legalGroupIds, groupIds)),
//     };
// }

// function TradeWorkingCapitalViewAllChart({
//     rows = [],
//     currency = "",
//     unit = "aed",
// }) {
//     const [hoveredIndex, setHoveredIndex] = useState(null);

//     const data = (Array.isArray(rows) ? rows : [])
//         .map((row) => ({
//             period: String(row?.period ?? "—"),
//             value: toNumber(row?.value),
//         }))
//         .filter((row) => row.value !== null);

//     const displayValue = (value) => {
//         const n = toNumber(value);
//         if (n === null) return "—";
//         if (unit === "millions") return `${(n / 1000000).toFixed(2)}M`;
//         return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
//     };

//     const axisValue = (value) => {
//         const n = toNumber(value);
//         if (n === null) return "—";
//         if (unit === "millions") return `${(n / 1000000).toFixed(1)}M`;
//         const abs = Math.abs(n);
//         if (abs >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
//         if (abs >= 1000) return `${(n / 1000).toFixed(1)}K`;
//         return Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
//     };

//     const values = data.map((item) => item.value);
//     const rawMin = values.length ? Math.min(...values) : 0;
//     const rawMax = values.length ? Math.max(...values) : 1;
//     const rawRange = rawMax - rawMin;
//     const padding = rawRange > 0
//         ? rawRange * 0.12
//         : Math.max(Math.abs(rawMax) * 0.12, 1);
//     const minValue = Math.min(0, rawMin) - padding;
//     const maxValue = Math.max(0, rawMax) + padding;

//     const CustomTooltip = ({ active, payload, label }) => {
//         if (!active || !payload?.length) return null;

//         const value = payload[0]?.value;

//         return (
//             <div
//                 style={{
//                     background: "#FFFFFF",
//                     border: "1px solid #D8DEE8",
//                     borderRadius: 9,
//                     padding: "10px 13px",
//                     boxShadow: "0 8px 20px rgba(15,23,42,0.12)",
//                     minWidth: 185,
//                     fontFamily: "Inter, system-ui, sans-serif",
//                 }}
//             >
//                 <div
//                     style={{
//                         color: "#1E293B",
//                         fontSize: "0.68rem",
//                         fontWeight: 800,
//                         marginBottom: 8,
//                     }}
//                 >
//                     {label}
//                 </div>
//                 <div
//                     style={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                         gap: 22,
//                     }}
//                 >
//                     <span
//                         style={{
//                             color: "#64748B",
//                             fontSize: "0.64rem",
//                             fontWeight: 600,
//                             whiteSpace: "nowrap",
//                         }}
//                     >
//                         Trade Working Capital
//                     </span>
//                     <span
//                         style={{
//                             color: "#1E3A8A",
//                             fontSize: "0.70rem",
//                             fontWeight: 800,
//                             whiteSpace: "nowrap",
//                         }}
//                     >
//                         {displayValue(value)}
//                     </span>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div
//             style={{
//                 height: "100%",
//                 minHeight: 300,
//                 border: "1px solid #E2E8F0",
//                 borderRadius: 10,
//                 background: "#FFFFFF",
//                 padding: "12px 12px 10px",
//                 boxSizing: "border-box",
//                 display: "flex",
//                 flexDirection: "column",
//                 overflow: "hidden",
//             }}
//         >
//             <div
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     gap: 8,
//                     paddingBottom: 8,
//                     borderBottom: "1px solid #F1F5F9",
//                 }}
//             >
//                 <div>
//                     <div style={{ color: "#173575", fontSize: "0.76rem", fontWeight: 800 }}>
//                         Trade Working Capital Trend
//                     </div>
//                     <div style={{ marginTop: 2, color: "#94A3B8", fontSize: "0.60rem", fontWeight: 600 }}>
//                         {unit === "millions" ? `${currency || "AED"} Million` : currency || "AED"}
//                     </div>
//                 </div>
//                 <div
//                     style={{
//                         width: 9,
//                         height: 9,
//                         borderRadius: "50%",
//                         background: "#4F46E5",
//                         boxShadow: "0 0 0 3px #EEF2FF",
//                     }}
//                     title="Trade Working Capital"
//                 />
//             </div>

//             {data.length ? (
//                 <div
//                     style={{
//                         flex: 1,
//                         minHeight: 255,
//                         marginTop: 8,
//                         position: "relative",
//                         overflow: "hidden",
//                     }}
//                     onMouseLeave={() => setHoveredIndex(null)}
//                 >
//                     <ResponsiveContainer width="100%" height="100%">
//                         <AreaChart
//                             data={data}
//                             margin={{ top: 24, right: 20, left: 8, bottom: 8 }}
//                             onMouseMove={(state) => {
//                                 if (state?.activeTooltipIndex !== undefined && state?.activeTooltipIndex !== null) {
//                                     setHoveredIndex(state.activeTooltipIndex);
//                                 }
//                             }}
//                             onMouseLeave={() => setHoveredIndex(null)}
//                         >
//                             <defs>
//                                 <linearGradient id="wcTradeViewAllArea" x1="0" y1="0" x2="0" y2="1">
//                                     <stop offset="0%" stopColor="#6366F1" stopOpacity={0.24} />
//                                     <stop offset="100%" stopColor="#6366F1" stopOpacity={0.03} />
//                                 </linearGradient>
//                             </defs>
//                             <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
//                             <XAxis
//                                 dataKey="period"
//                                 tick={{ fill: "#64748B", fontSize: 10, fontWeight: 600 }}
//                                 axisLine={{ stroke: "#CBD5E1" }}
//                                 tickLine={{ stroke: "#CBD5E1" }}
//                             />
//                             <YAxis
//                                 domain={[minValue, maxValue]}
//                                 tickFormatter={axisValue}
//                                 width={52}
//                                 tick={{ fill: "#64748B", fontSize: 9, fontWeight: 600 }}
//                                 axisLine={false}
//                                 tickLine={false}
//                             />
//                             <Tooltip
//                                 cursor={{ stroke: "#94A3B8", strokeDasharray: "4 4", strokeWidth: 1 }}
//                                 content={<CustomTooltip />}
//                             />
//                             <Area
//                                 type="monotone"
//                                 dataKey="value"
//                                 name="Trade Working Capital"
//                                 stroke="#4F46E5"
//                                 strokeWidth={3}
//                                 fill="url(#wcTradeViewAllArea)"
//                                 dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#4F46E5", strokeWidth: 2 }}
//                                 activeDot={{
//                                     r: 7,
//                                     fill: "#FFFFFF",
//                                     stroke: "#4F46E5",
//                                     strokeWidth: 3,
//                                 }}
//                                 isAnimationActive={true}
//                                 animationDuration={900}
//                             />
//                         </AreaChart>
//                     </ResponsiveContainer>
//                 </div>
//             ) : (
//                 <div
//                     style={{
//                         flex: 1,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         color: "#94A3B8",
//                         fontSize: "0.72rem",
//                     }}
//                 >
//                     No Trade Working Capital history for the selected filters.
//                 </div>
//             )}
//         </div>
//     );
// }

// function modalNumber(value, currency, unit = "aed") {
//     const n = toNumber(value);
//     if (n === null) return "—";
//     if (unit === "millions") return `${(n / 1000000).toFixed(2)}M`;
//     return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
// }

// function ParentDivisionMonthOnMonthTable({ rows, currency, unit = "aed" }) {
//     const safeRows = Array.isArray(rows) ? rows : [];

//     const periods = Array.from(
//         new Set(
//             safeRows
//                 .map((row) => String(row?.period ?? ""))
//                 .filter(Boolean)
//         )
//     );

//     const divisions = Array.from(
//         new Set(
//             safeRows
//                 .map((row) => String(row?.name ?? "—"))
//                 .filter((name) => name && name !== "—")
//         )
//     );

//     const lookup = new Map();
//     safeRows.forEach((row) => {
//         const name = String(row?.name ?? "—");
//         const period = String(row?.period ?? "");
//         if (!name || name === "—" || !period) return;
//         lookup.set(`${name}__${period}`, row);
//     });

//     const formatValue = (value) => {
//         const n = toNumber(value);
//         if (n === null) return "—";
//         if (unit === "millions") return `${(n / 1000000).toFixed(2)}M`;
//         return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
//     };

//     if (!divisions.length || !periods.length) {
//         return (
//             <div
//                 style={{
//                     width: "100%",
//                     flex: 1,
//                     minHeight: 0,
//                     overflow: "auto",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     color: "#94A3B8",
//                     fontSize: "0.72rem",
//                 }}
//             >
//                 No available month-on-month history.
//             </div>
//         );
//     }

//     return (
//         <div
//             style={{
//                 width: "100%",
//                 flex: 1,
//                 minHeight: 0,
//                 overflow: "auto",
//                 borderTop: "1px solid #E2E8F0",
//             }}
//         >
//             <table
//                 style={{
//                     width: "100%",
//                     minWidth: Math.max(620, 190 + periods.length * 188),
//                     borderCollapse: "collapse",
//                     tableLayout: "fixed",
//                     fontFamily: "Inter, system-ui, sans-serif",
//                 }}
//             >
//                 <colgroup>
//                     <col style={{ width: 190 }} />
//                     {periods.map((period) => (
//                         <React.Fragment key={`col-${period}`}>
//                             <col style={{ width: 94 }} />
//                             <col style={{ width: 94 }} />
//                         </React.Fragment>
//                     ))}
//                 </colgroup>
//                 <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
//                     <tr>
//                         <th
//                             rowSpan={2}
//                             style={{
//                                 ...th,
//                                 width: 190,
//                                 minWidth: 190,
//                                 background: "#F8FAFC",
//                                 borderBottom: "1px solid #E2E8F0",
//                                 borderRight: "1px solid #E2E8F0",
//                                 position: "sticky",
//                                 left: 0,
//                                 zIndex: 7,
//                                 padding: "8px 10px",
//                                 fontSize: "0.61rem",
//                                 whiteSpace: "nowrap",
//                             }}
//                         >
//                             PARENT DIVISION
//                         </th>
//                         {periods.map((period) => (
//                             <th
//                                 key={`${period}-group`}
//                                 colSpan={2}
//                                 style={{
//                                     ...th,
//                                     textAlign: "center",
//                                     background: "#F8FAFC",
//                                     borderLeft: "1px solid #E2E8F0",
//                                     borderBottom: "1px solid #E2E8F0",
//                                     padding: "7px 4px",
//                                     fontSize: "0.61rem",
//                                     whiteSpace: "nowrap",
//                                 }}
//                             >
//                                 {period}
//                             </th>
//                         ))}
//                     </tr>
//                     <tr>
//                         {periods.map((period) => (
//                             <React.Fragment key={`${period}-subheader`}>
//                                 <th
//                                     style={{
//                                         ...thRight,
//                                         width: 94,
//                                         minWidth: 94,
//                                         maxWidth: 94,
//                                         textAlign: "center",
//                                         background: "#FBFCFE",
//                                         borderLeft: "1px solid #E2E8F0",
//                                         borderBottom: "1px solid #E2E8F0",
//                                         padding: "7px 3px",
//                                         fontSize: "0.56rem",
//                                         lineHeight: 1.15,
//                                         whiteSpace: "normal",
//                                         wordBreak: "normal",
//                                     }}
//                                 >
//                                     <span style={{ display: "block" }}>TRADE </span>
//                                     <span style={{ display: "block" }}> WORKING</span>
//                                     <span style={{ display: "block" }}>CAPITAL</span>
//                                 </th>
//                                 <th
//                                     style={{
//                                         ...thRight,
//                                         width: 94,
//                                         minWidth: 94,
//                                         maxWidth: 94,
//                                         textAlign: "center",
//                                         background: "#FBFCFE",
//                                         borderLeft: "1px solid #E2E8F0",
//                                         borderBottom: "1px solid #E2E8F0",
//                                         padding: "7px 3px",
//                                         fontSize: "0.58rem",
//                                         whiteSpace: "nowrap",
//                                     }}
//                                 >
//                                     CCC
//                                 </th>
//                             </React.Fragment>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {divisions.map((division, divisionIndex) => (
//                         <tr key={`${division}-${divisionIndex}`}>
//                             <td
//                                 style={{
//                                     ...td,
//                                     padding: "8px 10px",
//                                     fontSize: "0.68rem",
//                                     fontWeight: 700,
//                                     color: "#334155",
//                                     background: divisionIndex % 2 ? "#FCFDFE" : "#FFFFFF",
//                                     borderRight: "1px solid #E2E8F0",
//                                     position: "sticky",
//                                     left: 0,
//                                     zIndex: 2,
//                                     whiteSpace: "nowrap",
//                                     overflow: "hidden",
//                                     textOverflow: "ellipsis",
//                                 }}
//                                 title={division}
//                             >
//                                 {division}
//                             </td>
//                             {periods.map((period) => {
//                                 const row = lookup.get(`${division}__${period}`);
//                                 const value = row?.value;
//                                 const ccc = row?.ccc;
//                                 return (
//                                     <React.Fragment key={`${division}-${period}`}>
//                                         <td
//                                             style={{
//                                                 ...tdRight,
//                                                 width: 94,
//                                                 minWidth: 94,
//                                                 maxWidth: 94,
//                                                 padding: "8px 5px",
//                                                 fontSize: "0.67rem",
//                                                 whiteSpace: "nowrap",
//                                                 color: toNumber(value) !== null && toNumber(value) < 0 ? "#DC2626" : "#334155",
//                                                 fontWeight: 600,
//                                                 background: divisionIndex % 2 ? "#FCFDFE" : "#FFFFFF",
//                                             }}
//                                         >
//                                             {formatValue(value)}
//                                         </td>
//                                         <td
//                                             style={{
//                                                 ...tdRight,
//                                                 width: 94,
//                                                 minWidth: 94,
//                                                 maxWidth: 94,
//                                                 padding: "8px 5px",
//                                                 fontSize: "0.67rem",
//                                                 whiteSpace: "nowrap",
//                                                 color: "#475569",
//                                                 fontWeight: 600,
//                                                 background: divisionIndex % 2 ? "#FCFDFE" : "#FFFFFF",
//                                             }}
//                                         >
//                                             {toNumber(ccc) === null ? "—" : `${Number(ccc).toFixed(2)}`}
//                                         </td>
//                                     </React.Fragment>
//                                 );
//                             })}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

// function ViewAllModal({
//     title,
//     rows,
//     currency,
//     type,
//     onClose,
//     filterOptions,
//     baseFilters,
//     onApplyFilters,
//     onExport,
//     loading = false,
//     monthOnMonthRows = [],
// }) {
//     const isCfo = type === "cfo";
//     const isCcc = type === "ccc";
//     const isTrade = type === "trade";
//     const isComponents = type === "components";
//     const isTrend = type === "trend";
//     const showModalExports = !isCcc && !isTrade && !isComponents;
//     const cfoTh = {
//         ...th,
//         padding: "7px 6px",
//         fontSize: "0.62rem",
//         whiteSpace: "nowrap",
//     };
//     const cfoThRight = {
//         ...thRight,
//         padding: "7px 6px",
//         fontSize: "0.62rem",
//         whiteSpace: "nowrap",
//     };
//     const cfoTd = {
//         ...td,
//         padding: "7px 6px",
//         fontSize: "0.68rem",
//         whiteSpace: "normal",
//         overflowWrap: "anywhere",
//         wordBreak: "break-word",
//         lineHeight: 1.3,
//         verticalAlign: "top",
//     };
//     const cfoTdRight = {
//         ...tdRight,
//         padding: "7px 6px",
//         fontSize: "0.68rem",
//         whiteSpace: "nowrap",
//     };
//     const cfoNumberStyle = (value) => ({
//         ...cfoTdRight,
//         color: toNumber(value) !== null && toNumber(value) < 0 ? "#DC2626" : cfoTdRight.color,
//         fontWeight: toNumber(value) !== null && toNumber(value) < 0 ? 700 : cfoTdRight.fontWeight,
//     });
//     const [search, setSearch] = useState("");
//     const [modalUnit, setModalUnit] = useState("aed");
//     const [page, setPage] = useState(0);
//     const [cfoViewMode, setCfoViewMode] = useState("detailed");
//     const pageSize = 15;

//     const [localFilters, setLocalFilters] = useState(() => ({
//         legalGroups: baseFilters?.legalGroups || [],
//         legalEntities: baseFilters?.legalEntities || [],
//         parentDivisions: baseFilters?.parentDivisions || [],
//         subDivisions: baseFilters?.subDivisions || [],
//         agingBasis: baseFilters?.agingBasis || "DUE_DATE",
//         asOnDate: baseFilters?.asOnDate || "",
//     }));

//     useEffect(() => {
//         setLocalFilters({
//             legalGroups: baseFilters?.legalGroups || [],
//             legalEntities: baseFilters?.legalEntities || [],
//             parentDivisions: baseFilters?.parentDivisions || [],
//             subDivisions: baseFilters?.subDivisions || [],
//             agingBasis: baseFilters?.agingBasis || "DUE_DATE",
//             asOnDate: baseFilters?.asOnDate || "",
//         });
//         setSearch("");
//         setPage(0);
//         setCfoViewMode("detailed");
//     }, [baseFilters, type]);

//     const resetModalFilters = () => {
//         const reset = getWorkingCapitalDefaultFilters(filterOptions);
//         setLocalFilters(reset);
//         setSearch("");
//         setPage(0);
//         setCfoViewMode("detailed");
//         onApplyFilters?.(reset);
//     };

//     const cascaded = useMemo(
//         () => cascadeViewAllOptions(filterOptions, localFilters),
//         [filterOptions, localFilters]
//     );

//     const updateCascade = (key, values) => {
//         setLocalFilters((prev) => {
//             const next = { ...prev, [key]: values };
//             if (key === "legalGroups") {
//                 next.legalEntities = [];
//                 next.parentDivisions = [];
//                 next.subDivisions = [];
//             }
//             if (key === "legalEntities") {
//                 next.parentDivisions = [];
//                 next.subDivisions = [];
//             }
//             if (key === "parentDivisions") {
//                 next.subDivisions = [];
//             }
//             return next;
//         });
//         setPage(0);
//     };

//     const filtered = (Array.isArray(rows) ? rows : []).filter((row) => {
//         if (!search.trim()) return true;
//         const q = search.toLowerCase();
//         return Object.values(row || {}).some((value) => String(value ?? "").toLowerCase().includes(q));
//     });

//     const filteredMonthRows = (Array.isArray(monthOnMonthRows) ? monthOnMonthRows : []).filter((row) => {
//         if (!search.trim()) return true;
//         const q = search.toLowerCase();
//         return Object.values(row || {}).some((value) => String(value ?? "").toLowerCase().includes(q));
//     });

//     const monthDivisionNames = Array.from(
//         new Set(
//             filteredMonthRows
//                 .map((row) => String(row?.name ?? "—"))
//                 .filter((name) => name && name !== "—")
//         )
//     );

//     const totalPages = Math.max(
//         1,
//         Math.ceil(
//             (isCfo && cfoViewMode === "month-on-month"
//                 ? monthDivisionNames.length
//                 : filtered.length) / pageSize
//         )
//     );
//     const safePage = Math.min(page, totalPages - 1);
//     const pageRows = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

//     const modalFmt = (value) => {
//         const n = toNumber(value);
//         if (n === null) return "—";
//         if (modalUnit === "millions") return `${(n / 1000000).toFixed(2)}M`;
//         return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
//     };

//     if (!filterOptions) return null;

//     return (
//         <div
//             role="dialog"
//             aria-modal="true"
//             className="wc-sales-view-all-overlay"
//             style={{
//                 position: "fixed",
//                 inset: 0,
//                 background: "rgba(15, 23, 42, 0.35)",
//                 backdropFilter: "blur(6px)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 zIndex: 1000,
//                 padding: 0,
//             }}
//         >
//             <div
//                 className="wc-sales-view-all-modal"
//                 style={{
//                     width: "96vw",
//                     maxWidth: "1500px",
//                     height: "100vh",
//                     background: "#FFFFFF",
//                     borderRadius: 16,
//                     border: "1px solid #E2E8F0",
//                     boxShadow: "0 20px 60px rgba(0,0,0,.18)",
//                     overflow: "hidden",
//                     display: "flex",
//                     flexDirection: "column",
//                 }}
//             >
//                 <div style={{
//                     padding: "14px 20px",
//                     borderBottom: "1px solid #F1F5F9",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     background: "linear-gradient(90deg,#F8FAFC,#FFFFFF)",
//                     flexShrink: 0,
//                 }}>
//                     <div>
//                         <h2 style={{ margin: 0, color: C.navy, fontSize: "0.92rem", fontWeight: 800 }}>
//                             {title}
//                         </h2>
//                         <div style={{ marginTop: 2, color: "#64748B", fontSize: "0.68rem", fontWeight: 500 }}>
//                             {baseFilters?.asOnDate ? `As on: ${formatDate(baseFilters.asOnDate)}` : "All available periods"}
//                             <span style={{ margin: "0 6px", color: "#CBD5E1" }}>•</span>
//                             {isCfo ? "Common View All" : `Reporting currency: ${currency}`}
//                             {isCfo ? (
//                                 <>
//                                     <span style={{ margin: "0 6px", color: "#CBD5E1" }}>•</span>
//                                     Reporting currency: {currency}
//                                 </>
//                             ) : null}
//                         </div>
//                     </div>
//                     <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//                         {isCfo && (
//                             <div
//                                 style={{
//                                     display: "inline-flex",
//                                     alignItems: "center",
//                                     gap: 2,
//                                     padding: 2,
//                                     border: "1px solid #D8DEE8",
//                                     borderRadius: 7,
//                                     background: "#F8FAFC",
//                                 }}
//                             >
//                                 <button
//                                     type="button"
//                                     onClick={() => { setCfoViewMode("detailed"); setPage(0); }}
//                                     style={{
//                                         height: 27,
//                                         padding: "0 9px",
//                                         border: "none",
//                                         borderRadius: 5,
//                                         background: cfoViewMode === "detailed" ? "#1E3A8A" : "transparent",
//                                         color: cfoViewMode === "detailed" ? "#FFFFFF" : "#475569",
//                                         fontSize: "0.62rem",
//                                         fontWeight: 700,
//                                         cursor: "pointer",
//                                     }}
//                                 >
//                                     Detailed View
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => { setCfoViewMode("month-on-month"); setPage(0); }}
//                                     style={{
//                                         height: 27,
//                                         padding: "0 9px",
//                                         border: "none",
//                                         borderRadius: 5,
//                                         background: cfoViewMode === "month-on-month" ? "#4F46E5" : "transparent",
//                                         color: cfoViewMode === "month-on-month" ? "#FFFFFF" : "#475569",
//                                         fontSize: "0.62rem",
//                                         fontWeight: 700,
//                                         cursor: "pointer",
//                                     }}
//                                 >
//                                     Month-on-Month by Parent Division
//                                 </button>
//                             </div>
//                         )}
//                         {!isCcc && (
//                             <UnitToggle unit={modalUnit} onToggle={setModalUnit} currency={currency} />
//                         )}
//                         {showModalExports && (
//                             <>
//                                 <button type="button" onClick={() => onExport?.("excel", type, localFilters, rows)} disabled={loading} style={{ height: 30, padding: "0 10px", borderRadius: 7, border: "1px solid #A7D8BF", background: "#F8FFFC", color: "#168052", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}>Excel</button>
//                                 <button type="button" onClick={() => onExport?.("pdf", type, localFilters, rows)} disabled={loading} style={{ height: 30, padding: "0 10px", borderRadius: 7, border: "1px solid #F2B8B8", background: "#FFF8F8", color: "#C23B3B", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}>PDF</button>
//                             </>
//                         )}
//                         <ModalCloseButton onClick={onClose} />
//                     </div>
//                 </div>

//                 <div style={{
//                     padding: "10px 20px",
//                     borderBottom: "1px solid #F1F5F9",
//                     background: "#FAFBFC",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 6,
//                     flexWrap: "nowrap",
//                     overflow: "visible",
//                     position: "relative",
//                     zIndex: 20,
//                     flexShrink: 0,
//                 }}>
//                     <ViewAllMultiSelect label="Legal Group" options={cascaded.legalGroups} value={localFilters.legalGroups} onChange={(v) => updateCascade("legalGroups", v)} />
//                     <ViewAllMultiSelect label="Legal Entity" options={cascaded.legalEntities} value={localFilters.legalEntities} onChange={(v) => updateCascade("legalEntities", v)} />
//                     <ViewAllMultiSelect label="Parent Division" options={cascaded.parentDivisions} value={localFilters.parentDivisions} onChange={(v) => updateCascade("parentDivisions", v)} />
//                     <ViewAllMultiSelect label="Sub-Division" options={cascaded.subDivisions} value={localFilters.subDivisions} onChange={(v) => updateCascade("subDivisions", v)} />

//                     <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
//                         <span style={{ color: "#1E3A8A", fontSize: "0.68rem", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>Reporting Currency</span>
//                         <div
//                             style={{
//                                 width: 112,
//                                 height: 32,
//                                 border: "1px solid #CBD5E1",
//                                 borderRadius: 7,
//                                 background: "#FFFFFF",
//                                 color: "#334155",
//                                 padding: "0 9px",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 boxSizing: "border-box",
//                                 fontSize: "0.72rem",
//                                 fontWeight: 700,
//                             }}
//                         >
//                             {currency || "AED"}
//                         </div>
//                     </div>

//                     <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
//                         <span style={{ color: "#1E3A8A", fontSize: "0.68rem", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>Aging Basis</span>
//                         <select
//                             value={localFilters.agingBasis || "DUE_DATE"}
//                             onChange={(event) => setLocalFilters((p) => ({ ...p, agingBasis: event.target.value }))}
//                             style={{
//                                 width: 120,
//                                 height: 32,
//                                 border: "1px solid #CBD5E1",
//                                 borderRadius: 7,
//                                 background: "#FFFFFF",
//                                 color: "#334155",
//                                 padding: "0 8px",
//                                 fontSize: "0.72rem",
//                                 cursor: "pointer",
//                             }}
//                         >
//                             {(filterOptions.agingBases || ["DUE_DATE"]).map((basis) => (
//                                 <option key={basis} value={basis}>
//                                     {basis === "DUE_DATE" ? "Due Date Basis" : String(basis).replaceAll("_", " ")}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
//                         <span style={{ color: "#1E3A8A", fontSize: "0.68rem", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>As On Date</span>
//                         <CalendarDateField
//                             value={localFilters.asOnDate || ""}
//                             onChange={(value) => setLocalFilters((p) => ({ ...p, asOnDate: value }))}
//                             width={130}
//                         />
//                     </div>

//                     <button type="button" onClick={() => { setPage(0); onApplyFilters?.(localFilters); }} disabled={loading} style={{ height: 32, padding: "0 14px", border: "none", borderRadius: 7, background: "#2563EB", color: "#FFFFFF", fontSize: "0.70rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
//                         {loading ? "Loading..." : "Apply"}
//                     </button>
//                     <button type="button" onClick={resetModalFilters} disabled={loading} style={{ height: 32, padding: "0 9px", border: "none", background: "transparent", color: "#475569", fontSize: "0.70rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
//                         Reset
//                     </button>

//                 </div>

//                 <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "10px 16px 8px", background: "#FFFFFF", display: "flex", flexDirection: "column" }}>
//                     <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "0 2px 8px", flexShrink: 0 }}>
//                         <input
//                             value={search}
//                             onChange={(e) => { setSearch(e.target.value); setPage(0); }}
//                             placeholder={isCfo && cfoViewMode === "month-on-month" ? "Search Parent Divisions..." : isCcc ? "Search periods..." : "Search..."}
//                             style={{ height: 32, width: 220, border: "1px solid #CBD5E1", borderRadius: 7, padding: "0 10px", fontSize: "0.72rem", color: "#334155", outline: "none", fontFamily: "Inter, system-ui, sans-serif" }}
//                         />
//                         <span style={{ color: C.muted, fontSize: "0.70rem", fontWeight: 600 }}>
//                             {isCfo && cfoViewMode === "month-on-month" ? `${monthDivisionNames.length} Parent Divisions` : `${filtered.length} records`}
//                         </span>
//                     </div>

//                     {isTrade ? (
//                         <div className="wc-trade-view-all-grid" style={{ width: "100%", flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "minmax(220px, 0.58fr) minmax(560px, 1.42fr)", gap: 10, overflow: "hidden" }}>
//                             <div className="wc-trade-view-all-table" style={{ minWidth: 0, minHeight: 0, overflow: "auto" }}>
//                                 <table
//                                     style={{
//                                         width: "100%",
//                                         borderCollapse: "collapse",
//                                         tableLayout: isCfo ? "fixed" : isTrade ? "fixed" : "auto",
//                                         minWidth: isCfo
//                                             ? 980
//                                             : isCcc
//                                                 ? 650
//                                                 : isTrade
//                                                     ? 0
//                                                     : isTrend
//                                                         ? 520
//                                                         : 760,
//                                     }}
//                                 >
//                                     <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
//                                         <tr>
//                                             {isCfo ? (
//                                                 <>
//                                                     <th style={cfoTh}>LEGAL ENTITY</th>
//                                                     <th style={cfoTh}>PARENT DIVISION</th>
//                                                     <th style={cfoTh}>SUB-DIVISION</th>
//                                                     <th style={cfoThRight}>TRADE RECEIVABLES</th>
//                                                     <th style={cfoThRight}>DSO</th>
//                                                     <th style={cfoThRight}>TRADE PAYABLES</th>
//                                                     <th style={cfoThRight}>DPO</th>
//                                                     <th style={cfoThRight}>INVENTORY</th>
//                                                     <th style={cfoThRight}>DIO</th>
//                                                     <th style={{ ...cfoThRight, whiteSpace: "nowrap" }}>
//                                                         TRADE WORKING CAPITAL ({currency})
//                                                     </th>
//                                                     <th style={cfoThRight}>CCC</th>
//                                                 </>
//                                             ) : isCcc ? (
//                                                 <>
//                                                     <th style={th}>PERIOD</th>
//                                                     <th style={thRight}>DSO</th>
//                                                     <th style={thRight}>DIO</th>
//                                                     <th style={thRight}>DPO</th>
//                                                     <th style={thRight}>CCC</th>
//                                                 </>
//                                             ) : isTrade || isTrend ? (
//                                                 <>
//                                                     <th style={th}>PERIOD</th>
//                                                     <th style={thRight}>
//                                                         {isTrade ? "TRADE WORKING CAPITAL" : "NET WORKING CAPITAL"}
//                                                         {currency ? ` (${currency})` : ""}
//                                                     </th>
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <th style={th}>PERIOD</th>
//                                                     <th style={th}>CATEGORY</th>
//                                                     <th style={thRight}>AMOUNT</th>
//                                                     <th style={thRight}>% OF TOTAL</th>
//                                                 </>
//                                             )}
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {pageRows.length ? pageRows.map((row, index) => {
//                                             if (isCfo) {
//                                                 return (
//                                                     <tr
//                                                         key={`${row.legalEntity}-${row.parentDivision}-${row.subDivision}-${index}`}
//                                                     >
//                                                         <td style={cfoTd} title={row.legalEntity}>{row.legalEntity}</td>
//                                                         <td style={cfoTd} title={row.parentDivision}>{row.parentDivision}</td>
//                                                         <td style={cfoTd} title={row.subDivision}>{row.subDivision}</td>
//                                                         <td style={cfoNumberStyle(row.tradeReceivables)}>{modalFmt(row.tradeReceivables)}</td>
//                                                         <td style={cfoTdRight}>—</td>
//                                                         <td style={cfoNumberStyle(row.tradePayables)}>{modalFmt(row.tradePayables)}</td>
//                                                         <td style={cfoTdRight}>—</td>
//                                                         <td style={cfoNumberStyle(row.inventory)}>{modalFmt(row.inventory)}</td>
//                                                         <td style={cfoTdRight}>—</td>
//                                                         <td style={cfoNumberStyle(row.tradeWorkingCapital)}>{modalFmt(row.tradeWorkingCapital)}</td>
//                                                         <td style={cfoTdRight}>—</td>
//                                                     </tr>
//                                                 );
//                                             }

//                                             if (isCcc) return (
//                                                 <tr key={`${row.period}-${index}`}>
//                                                     <td style={td}>{row.period}</td>
//                                                     <td style={tdRight}>{row.dso == null ? "—" : Number(row.dso).toFixed(2)}</td>
//                                                     <td style={tdRight}>{row.dio == null ? "—" : Number(row.dio).toFixed(2)}</td>
//                                                     <td style={tdRight}>{row.dpo == null ? "—" : Number(row.dpo).toFixed(2)}</td>
//                                                     <td style={tdRight}>{row.ccc == null ? "—" : Number(row.ccc).toFixed(2)}</td>
//                                                 </tr>
//                                             );

//                                             if (isTrade || isTrend) return (
//                                                 <tr key={`${row.period}-${index}`}>
//                                                     <td style={td}>{row.period}</td>
//                                                     <td style={tdRight}>{modalFmt(row.value)}</td>
//                                                 </tr>
//                                             );

//                                             return (
//                                                 <tr key={`${row.period}-${row.particular}-${index}`}>
//                                                     <td style={td}>{row.period}</td>
//                                                     <td style={td}>{row.particular}</td>
//                                                     <td style={tdRight}>{modalFmt(row.amount)}</td>
//                                                     <td style={tdRight}>{row.percentage == null ? "—" : `${Number(row.percentage).toFixed(2)}%`}</td>
//                                                 </tr>
//                                             );
//                                         }) : (
//                                             <tr>
//                                                 <td
//                                                     colSpan={
//                                                         isCfo
//                                                             ? 11
//                                                             : isCcc
//                                                                 ? 5
//                                                                 : isTrade || isTrend
//                                                                     ? 2
//                                                                     : 4
//                                                     }
//                                                     style={{
//                                                         padding: 30,
//                                                         textAlign: "center",
//                                                         color: "#94A3B8",
//                                                         fontSize: "0.72rem",
//                                                     }}
//                                                 >
//                                                     {loading ? "Loading..." : "No available history."}
//                                                 </td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                             <TradeWorkingCapitalViewAllChart rows={filtered} currency={currency} unit={modalUnit} />
//                         </div>
//                     ) : isCfo && cfoViewMode === "month-on-month" ? (
//                         <ParentDivisionMonthOnMonthTable rows={filteredMonthRows} currency={currency} unit={modalUnit} />
//                     ) : (
//                         <div style={{ width: "100%", flex: 1, minHeight: 0, overflow: "auto" }}>
//                             <table
//                                 style={{
//                                     width: "100%",
//                                     borderCollapse: "collapse",
//                                     tableLayout: isCfo ? "fixed" : "auto",
//                                     minWidth: isCfo
//                                         ? 980
//                                         : isCcc
//                                             ? 650
//                                             : isTrade || isTrend
//                                                 ? 520
//                                                 : 760,
//                                 }}
//                             >
//                                 <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
//                                     <tr>
//                                         {isCfo ? (
//                                             <>
//                                                 <th style={cfoTh}>LEGAL ENTITY</th>
//                                                 <th style={cfoTh}>PARENT DIVISION</th>
//                                                 <th style={cfoTh}>SUB-DIVISION</th>
//                                                 <th style={cfoThRight}>TRADE RECEIVABLES</th>
//                                                 <th style={cfoThRight}>DSO</th>
//                                                 <th style={cfoThRight}>TRADE PAYABLES</th>
//                                                 <th style={cfoThRight}>DPO</th>
//                                                 <th style={cfoThRight}>INVENTORY</th>
//                                                 <th style={cfoThRight}>DIO</th>
//                                                 <th style={cfoThRight}>TRADE WORKING CAPITAL</th>
//                                                 <th style={cfoThRight}>CCC</th>
//                                             </>
//                                         ) : isCcc ? (
//                                             <>
//                                                 <th style={th}>PERIOD</th>
//                                                 <th style={thRight}>DSO</th>
//                                                 <th style={thRight}>DIO</th>
//                                                 <th style={thRight}>DPO</th>
//                                                 <th style={thRight}>CCC</th>
//                                             </>
//                                         ) : isTrade || isTrend ? (
//                                             <>
//                                                 <th style={th}>PERIOD</th>
//                                                 <th style={thRight}>{isTrade ? "TRADE WORKING CAPITAL" : "NET WORKING CAPITAL"}</th>
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <th style={th}>PERIOD</th>
//                                                 <th style={th}>CATEGORY</th>
//                                                 <th style={thRight}>AMOUNT</th>
//                                                 <th style={thRight}>% OF TOTAL</th>
//                                             </>
//                                         )}
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {pageRows.length ? pageRows.map((row, index) => {
//                                         if (isCfo) {
//                                             return (
//                                                 <tr key={`${row.legalEntity}-${row.parentDivision}-${row.subDivision}-${index}`}>
//                                                     <td style={cfoTd} title={row.legalEntity}>{row.legalEntity}</td>
//                                                     <td style={cfoTd} title={row.parentDivision}>{row.parentDivision}</td>
//                                                     <td style={cfoTd} title={row.subDivision}>{row.subDivision}</td>
//                                                     <td style={cfoNumberStyle(row.tradeReceivables)}>{modalFmt(row.tradeReceivables)}</td>
//                                                     <td style={cfoTdRight}>—</td>
//                                                     <td style={cfoNumberStyle(row.tradePayables)}>{modalFmt(row.tradePayables)}</td>
//                                                     <td style={cfoTdRight}>—</td>
//                                                     <td style={cfoNumberStyle(row.inventory)}>{modalFmt(row.inventory)}</td>
//                                                     <td style={cfoTdRight}>—</td>
//                                                     <td style={cfoNumberStyle(row.tradeWorkingCapital)}>{modalFmt(row.tradeWorkingCapital)}</td>
//                                                     <td style={cfoTdRight}>—</td>
//                                                 </tr>
//                                             );
//                                         }
//                                         if (isCcc) return (
//                                             <tr key={`${row.period}-${index}`}>
//                                                 <td style={td}>{row.period}</td>
//                                                 <td style={tdRight}>{row.dso == null ? "—" : Number(row.dso).toFixed(2)}</td>
//                                                 <td style={tdRight}>{row.dio == null ? "—" : Number(row.dio).toFixed(2)}</td>
//                                                 <td style={tdRight}>{row.dpo == null ? "—" : Number(row.dpo).toFixed(2)}</td>
//                                                 <td style={tdRight}>{row.ccc == null ? "—" : Number(row.ccc).toFixed(2)}</td>
//                                             </tr>
//                                         );
//                                         if (isTrade || isTrend) return (
//                                             <tr key={`${row.period}-${index}`}>
//                                                 <td style={td}>{row.period}</td>
//                                                 <td style={tdRight}>{modalFmt(row.value)}</td>
//                                             </tr>
//                                         );
//                                         return (
//                                             <tr key={`${row.period}-${row.particular}-${index}`}>
//                                                 <td style={td}>{isComponents ? formatDate(row.period) : row.period}</td>
//                                                 <td style={td}>{row.particular}</td>
//                                                 <td style={tdRight}>{modalFmt(row.amount)}</td>
//                                                 <td style={tdRight}>{row.percentage == null ? "—" : `${Number(row.percentage).toFixed(2)}%`}</td>
//                                             </tr>
//                                         );
//                                     }) : (
//                                         <tr>
//                                             <td colSpan={isCfo ? 11 : isCcc ? 5 : isTrade || isTrend ? 2 : 4} style={{ padding: 30, textAlign: "center", color: "#94A3B8", fontSize: "0.72rem" }}>
//                                                 {loading ? "Loading..." : "No available history."}
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </div>

//                 <div style={{
//                     borderTop: "1px solid #E2E8F0",
//                     padding: "9px 20px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     background: "#FFFFFF",
//                     flexShrink: 0,
//                 }}>
//                     <span style={{ color: "#64748B", fontSize: "0.70rem" }}>
//                         Showing {filtered.length ? `${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, filtered.length)}` : "0"} of {filtered.length} records
//                     </span>
//                     <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//                         <button type="button" disabled={safePage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ height: 30, padding: "0 10px", borderRadius: 7, border: "1px solid #E2E8F0", background: safePage === 0 ? "#F8FAFC" : "#FFFFFF", color: safePage === 0 ? "#94A3B8" : "#334155", fontSize: "0.68rem", fontWeight: 600 }}>← Prev</button>
//                         <span style={{ color: "#334155", fontSize: "0.70rem", fontWeight: 700 }}>{safePage + 1} / {totalPages}</span>
//                         <button type="button" disabled={safePage >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} style={{ height: 30, padding: "0 10px", borderRadius: 7, border: "1px solid #E2E8F0", background: safePage >= totalPages - 1 ? "#F8FAFC" : "#FFFFFF", color: safePage >= totalPages - 1 ? "#94A3B8" : "#334155", fontSize: "0.68rem", fontWeight: 600 }}>Next →</button>
//                         <button type="button" onClick={onClose} style={{ height: 30, padding: "0 15px", borderRadius: 7, border: "none", background: "#E2E8F0", color: "#334155", fontSize: "0.68rem", fontWeight: 700 }}>Close</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// const th = {
//     padding: "8px",
//     textAlign: "left",
//     borderBottom:
//         "2px solid #E2E8F0",
//     color: "#1E3A8A",
//     background: "#F8FAFC",
//     fontSize: "0.70rem",
//     fontWeight: 700,
// };

// const thRight = {
//     ...th,
//     textAlign: "right",
// };

// const td = {
//     padding: "8px 10px",
//     textAlign: "left",
//     borderBottom:
//         "1px solid #F1F5F9",
//     color: "#334155",
//     fontSize: "0.70rem",
//     fontWeight: 500,
// };

// const tdRight = {
//     ...td,
//     textAlign: "right",
// };

// /* ============================================================
//    MAIN REPORT
// ============================================================ */

// export default function WorkingCapitalReport() {
//     const [filters, setFilters] = useState({
//         legalGroups: [],
//         legalEntities: [],
//         parentDivisions: [],
//         subDivisions: [],
//         agingBasis: "DUE_DATE",
//         asOnDate: "",
//     });

//     // Load the Working Capital dashboard immediately on page load.
//     // "appliedFilters" represents the filters currently used by the data APIs.
//     // The user can edit the filter controls without changing loaded data until
//     // Apply is clicked.
//     const [appliedFilters, setAppliedFilters] =
//         useState(null);

//     const [filterOptionsLoaded, setFilterOptionsLoaded] =
//         useState(false);

//     const [filterOptions, setFilterOptions] =
//         useState({
//             legalGroups: [],
//             legalEntities: [],
//             parentDivisions: [],
//             subDivisions: [],
//             asOnDates: [],
//             balanceSheetPeriods: [],
//             agingBases: ["DUE_DATE"],
//             reportingCurrency: "",
//             operationalAsOnDate: "",
//         });

//     const [kpis, setKpis] = useState(null);
//     const [components, setComponents] =
//         useState(null);
//     const [currentAssets, setCurrentAssets] =
//         useState(null);
//     const [currentLiabilities, setCurrentLiabilities] =
//         useState(null);
//     const [liquidityRatios, setLiquidityRatios] =
//         useState(null);
//     const [assetsVsLiabilities, setAssetsVsLiabilities] =
//         useState(null);
//     const [ccc, setCcc] = useState(null);
//     const [trend, setTrend] = useState([]);
//     const [tradeTrend, setTradeTrend] =
//         useState([]);
//     const [cccTrend, setCccTrend] =
//         useState([]);

//     const [parentDivisionTrend, setParentDivisionTrend] =
//         useState([]);
//     const [subDivisionTrend, setSubDivisionTrend] =
//         useState([]);

//     const [loading, setLoading] =
//         useState(true);
//     const [error, setError] = useState("");
//     const [exporting, setExporting] =
//         useState(false);

//     const [viewAll, setViewAll] = useState(
//         null
//     );
//     const [viewAllLoading, setViewAllLoading] =
//         useState(false);

//     /*
//      * View-All request guard:
//      * - View-All endpoints are never prefetched.
//      * - Identical endpoint + filter combinations share one in-flight request.
//      * - Repeated clicks cannot create duplicate requests.
//      */
//     const viewAllInFlightRef = useRef(new Map());

//     /* --------------------------------------------------------
//        FILTER OPTIONS
//     -------------------------------------------------------- */

//     useEffect(() => {
//         let active = true;

//         async function loadFilterOptions() {
//             try {
//                 /*
//                  * Filter dropdowns are populated only from the backend.
//                  * No hierarchy lists are hardcoded in the frontend.
//                  *
//                  * The API supports the standard hierarchy parameters plus
//                  * aging_basis. On first load there are no hierarchy
//                  * selections yet, so only the approved default aging basis
//                  * is sent.
//                  */
//                 const response =
//                     await getWorkingCapitalFilterOptions({
//                         aging_basis: "DUE_DATE",
//                     });

//                 if (!active) return;

//                 const options =
//                     normalizeFilterOptions(response);

//                 setFilterOptions(options);

//                 /*
//                  * Set the backend-provided first available operational date
//                  * as the initial UI date when available. This does NOT wait
//                  * for the user to press Apply; it is the initial page-load
//                  * filter used by the dashboard.
//                  */
//                 const nextFilters = {
//                     ...filters,
//                     asOnDate:
//                         filters.asOnDate ||
//                         options.operationalAsOnDate ||
//                         options.asOnDates[0] ||
//                         "",
//                 };

//                 setFilters(nextFilters);
//                 setAppliedFilters((current) =>
//                     current === null
//                         ? { ...nextFilters }
//                         : current
//                 );

//                 setFilterOptionsLoaded(true);
//             } catch (err) {
//                 if (active) {
//                     setLoading(false);
//                     setFilterOptionsLoaded(true);
//                     setError(
//                         err?.response?.data
//                             ?.detail ||
//                         err?.message ||
//                         "Unable to load Working Capital filter options."
//                     );
//                 }
//             }
//         }

//         loadFilterOptions();

//         return () => {
//             active = false;
//         };
//     }, []);

//     /* --------------------------------------------------------
//        LOAD DASHBOARD
//     -------------------------------------------------------- */

//     useEffect(() => {
//         /*
//          * Load all Working Capital dashboard components automatically after
//          * the backend filter options are available. The user no longer needs
//          * to press Apply just to see the initial dashboard.
//          *
//          * After that initial load, changing filter controls alone does not
//          * trigger requests. Apply explicitly commits the selected filters.
//          */
//         if (!filterOptionsLoaded || !appliedFilters) return;

//         let active = true;

//         async function load() {
//             setLoading(true);
//             setError("");

//             const apiFilters =
//                 buildApiFilters(
//                     appliedFilters,
//                     filterOptions
//                 );

//             const dashboardFilters = {
//                 ...apiFilters,
//                 months: 6,
//             };

//             const results =
//                 await Promise.allSettled([
//                     getWorkingCapitalKpis(
//                         apiFilters
//                     ),
//                     getWorkingCapitalComponents(
//                         apiFilters
//                     ),
//                     getWorkingCapitalCurrentAssets(
//                         apiFilters
//                     ),
//                     getWorkingCapitalCurrentLiabilities(
//                         apiFilters
//                     ),
//                     getWorkingCapitalLiquidityRatios(
//                         apiFilters
//                     ),
//                     getWorkingCapitalAssetsVsLiabilities(
//                         apiFilters
//                     ),
//                     getWorkingCapitalCashConversionCycle(
//                         apiFilters
//                     ),
//                     getWorkingCapitalTrend(
//                         dashboardFilters
//                     ),
//                     getWorkingCapitalTradeTrend(
//                         dashboardFilters
//                     ),
//                     getWorkingCapitalCccTrend(
//                         dashboardFilters
//                     ),
//                     getWorkingCapitalParentDivisionTrend({
//                         ...apiFilters,
//                         months: 6,
//                     }),
//                     getWorkingCapitalSubDivisionTrend({
//                         ...apiFilters,
//                         months: 6,
//                     }),
//                 ]);

//             if (!active) return;

//             const value = (index) =>
//                 results[index]?.status ===
//                     "fulfilled"
//                     ? unwrapApiResponse(
//                         results[index]
//                             .value
//                     )
//                     : null;

//             const kpiPayload = value(0);
//             const componentsPayload = value(1);
//             const assetsPayload = value(2);
//             const liabilitiesPayload = value(3);
//             const ratiosPayload = value(4);
//             const avlPayload = value(5);
//             const cccPayload = value(6);
//             const trendPayload = value(7);
//             const tradePayload = value(8);
//             const cccTrendPayload = value(9);

//             setKpis(kpiPayload);
//             setComponents(
//                 componentsPayload
//             );
//             setCurrentAssets(
//                 assetsPayload
//             );
//             setCurrentLiabilities(
//                 liabilitiesPayload
//             );
//             setLiquidityRatios(
//                 ratiosPayload
//             );
//             setAssetsVsLiabilities(
//                 avlPayload
//             );
//             setCcc(cccPayload);

//             setTrend(
//                 normalizeTrendRows(
//                     trendPayload
//                 )
//             );

//             setTradeTrend(
//                 normalizeTradeTrendRows(
//                     tradePayload
//                 )
//             );

//             setCccTrend(
//                 normalizeCccTrendRows(
//                     cccTrendPayload
//                 )
//             );

//             const parentTrendPayload = value(10);
//             const subDivisionTrendPayload = value(11);

//             setParentDivisionTrend(
//                 normalizeHierarchyTrendRows(
//                     parentTrendPayload,
//                     "parent"
//                 )
//             );

//             setSubDivisionTrend(
//                 normalizeHierarchyTrendRows(
//                     subDivisionTrendPayload,
//                     "sub"
//                 )
//             );

//             const failed =
//                 results.filter(
//                     (item) =>
//                         item.status ===
//                         "rejected"
//                 );

//             if (
//                 failed.length ===
//                 results.length
//             ) {
//                 throw failed[0].reason;
//             }
//         }

//         load()
//             .catch((err) => {
//                 if (!active) return;

//                 setError(
//                     err?.response?.data
//                         ?.detail ||
//                     err?.message ||
//                     "Unable to load Working Capital data."
//                 );
//             })
//             .finally(() => {
//                 if (active) {
//                     setLoading(false);
//                 }
//             });

//         return () => {
//             active = false;
//         };
//     }, [
//         appliedFilters,
//         filterOptions,
//         filterOptionsLoaded,
//     ]);

//     /* --------------------------------------------------------
//        DERIVED DISPLAY VALUES
//        No KPI calculation is performed here.
//        These are backend values only.
//     -------------------------------------------------------- */

//     const currency =
//         kpis?.reporting_currency ||
//         currentAssets?.reporting_currency ||
//         currentLiabilities?.reporting_currency ||
//         "—";

//     const operationalDate =
//         kpis?.operational_as_on_date ??
//         ccc?.operational_as_on_date ??
//         "—";

//     // Current Assets / Current Liabilities / Liquidity Ratio are Balance Sheet
//     // responses. Prefer the values returned by those APIs directly so the
//     // dashboard always reflects the exact selected period.
//     const balanceSheetPeriod =
//         currentAssets?.period ??
//         currentLiabilities?.period ??
//         kpis?.balance_sheet_period ??
//         "—";

//     const balanceSheetPeriodEnd =
//         currentAssets?.period_end ??
//         currentLiabilities?.period_end ??
//         kpis?.balance_sheet_period_end ??
//         null;

//     const assetRows = useMemo(
//         () =>
//             normalizeBreakdownRows(
//                 currentAssets
//             ),
//         [currentAssets]
//     );

//     const liabilityRows = useMemo(
//         () =>
//             normalizeBreakdownRows(
//                 currentLiabilities
//             ),
//         [currentLiabilities]
//     );

//     // Totals are taken directly from the Current Assets / Current
//     // Liabilities API responses. No frontend summation is performed.
//     const currentAssetsTotal = toNumber(
//         currentAssets?.total ??
//         kpis?.current_assets
//     );

//     const currentLiabilitiesTotal =
//         toNumber(
//             currentLiabilities?.total ??
//             kpis?.current_liabilities
//         );

//     // Current Ratio must come from the dedicated liquidity-ratios API.
//     // Do not recalculate it in the frontend and do not let a KPI payload
//     // override the dedicated ratio response.
//     const ratioFromLiquidityApi =
//         normalizeCurrentRatio(
//             liquidityRatios
//         );

//     const ratioRaw = getNullableValue(
//         kpis,
//         "current_ratio"
//     );

//     const ratioValue =
//         ratioFromLiquidityApi !== null
//             ? ratioFromLiquidityApi
//             : toNumber(ratioRaw);

//     const avlRows = getRows(
//         assetsVsLiabilities
//     );

//     const componentData = components || {};

//     const operationalStatus =
//         getValue(
//             ccc,
//             "ccc_status"
//         ) ??
//         kpis?.ccc_status;

//     /* --------------------------------------------------------
//        CASCADING FILTER OPTIONS
//        Legal Group -> Legal Entity -> Parent Division -> Sub-Division
//        Only visible dropdown options are filtered; API contracts are unchanged.
//     -------------------------------------------------------- */
//     const cascadingFilterOptions = useMemo(() => {
//         const selectedGroups = Array.isArray(filters.legalGroups)
//             ? filters.legalGroups.map(String)
//             : [];
//         const selectedEntities = Array.isArray(filters.legalEntities)
//             ? filters.legalEntities.map(String)
//             : [];
//         const selectedParents = Array.isArray(filters.parentDivisions)
//             ? filters.parentDivisions.map(String)
//             : [];

//         const matches = (option, selected, relationKey) => {
//             if (!selected.length) return true;

//             const related = Array.isArray(option?.[relationKey])
//                 ? option[relationKey]
//                 : [];

//             return !related.length ||
//                 related.some((id) => selected.includes(String(id)));
//         };

//         const legalEntities = filterOptions.legalEntities.filter((option) =>
//             matches(option, selectedGroups, "legalGroupIds")
//         );

//         const visibleEntityIds = new Set(
//             selectedEntities.length
//                 ? selectedEntities
//                 : legalEntities.map((option) => String(option.id))
//         );

//         const parentDivisions = filterOptions.parentDivisions.filter((option) =>
//             matches(option, selectedGroups, "legalGroupIds") &&
//             matches(option, [...visibleEntityIds], "legalEntityIds")
//         );

//         const visibleParentIds = new Set(
//             selectedParents.length
//                 ? selectedParents
//                 : parentDivisions.map((option) => String(option.id))
//         );

//         const subDivisions = filterOptions.subDivisions.filter((option) =>
//             matches(option, selectedGroups, "legalGroupIds") &&
//             matches(option, [...visibleEntityIds], "legalEntityIds") &&
//             matches(option, [...visibleParentIds], "parentDivisionIds")
//         );

//         return {
//             ...filterOptions,
//             legalEntities,
//             parentDivisions,
//             subDivisions,
//         };
//     }, [
//         filterOptions,
//         filters.legalGroups,
//         filters.legalEntities,
//         filters.parentDivisions,
//     ]);

//     /* --------------------------------------------------------
//        FILTER ACTIONS
//     -------------------------------------------------------- */

//     function updateFilter(
//         key,
//         value
//     ) {
//         setFilters((previous) => {
//             const next = {
//                 ...previous,
//                 [key]: value,
//             };

//             if (key === "legalGroups") {
//                 next.legalEntities = [];
//                 next.parentDivisions = [];
//                 next.subDivisions = [];
//             } else if (key === "legalEntities") {
//                 next.parentDivisions = [];
//                 next.subDivisions = [];
//             } else if (key === "parentDivisions") {
//                 next.subDivisions = [];
//             }

//             return next;
//         });
//     }

//     function applyFilters() {
//         /*
//          * Commit the current multi-select hierarchy/date selections.
//          * This triggers the complete Working Capital data load.
//          */
//         setAppliedFilters({
//             ...filters,
//         });
//     }

//     function resetFilters() {
//         const next = getWorkingCapitalDefaultFilters(filterOptions);

//         // Update both the visible controls and the committed API scope.
//         // A fresh object is used for each state so React always sees the reset.
//         setFilters({ ...next });
//         setAppliedFilters({ ...next });
//         setViewAll(null);
//         setError("");
//     }

//     function handleRefresh() {
//         setAppliedFilters(
//             (previous) =>
//                 previous
//                     ? { ...previous }
//                     : null
//         );
//     }

//     /* --------------------------------------------------------
//        EXPORT
//        Same filters as View All.
//     -------------------------------------------------------- */

//     async function handleExport(
//         type,
//         section,
//         overrideFilters = null,
//         overrideRows = null
//     ) {
//         setExporting(true);
//         setError("");

//         try {
//             const activeFilters = overrideFilters || appliedFilters || filters;
//             const apiFilters =
//                 buildApiFilters(
//                     activeFilters,
//                     filterOptions
//                 );

//             let response;
//             let fallback;

//             if (section === "assets") {
//                 response =
//                     type === "excel"
//                         ? await exportWorkingCapitalCurrentAssetsExcel(
//                             apiFilters
//                         )
//                         : await exportWorkingCapitalCurrentAssetsPdf(
//                             apiFilters
//                         );

//                 fallback =
//                     type === "excel"
//                         ? "working-capital-current-assets.xlsx"
//                         : "working-capital-current-assets.pdf";

//                 downloadWorkingCapitalFile(
//                     response,
//                     fallback
//                 );
//             } else if (section === "liabilities") {
//                 response =
//                     type === "excel"
//                         ? await exportWorkingCapitalCurrentLiabilitiesExcel(
//                             apiFilters
//                         )
//                         : await exportWorkingCapitalCurrentLiabilitiesPdf(
//                             apiFilters
//                         );

//                 fallback =
//                     type === "excel"
//                         ? "working-capital-current-liabilities.xlsx"
//                         : "working-capital-current-liabilities.pdf";

//                 downloadWorkingCapitalFile(
//                     response,
//                     fallback
//                 );
//             } else if (section === "trend") {
//                 if (type === "excel") {
//                     exportTrendToExcel(
//                         overrideRows || trend,
//                         "Net Working Capital",
//                         currency,
//                         "Net Working Capital"
//                     );
//                 } else {
//                     exportTrendToPdf(
//                         overrideRows || trend,
//                         "Net Working Capital",
//                         currency,
//                         "Net Working Capital"
//                     );
//                 }
//             } else if (section === "liquidity") {
//                 if (type === "excel") {
//                     exportLiquidityRatioToExcel(
//                         ratioValue,
//                         balanceSheetPeriod
//                     );
//                 } else {
//                     exportLiquidityRatioToPdf(
//                         ratioValue,
//                         balanceSheetPeriod
//                     );
//                 }
//             }
//         } catch (err) {
//             setError(
//                 err?.response?.data
//                     ?.detail ||
//                 err?.message ||
//                 `Unable to export ${type}.`
//             );
//         } finally {
//             setExporting(false);
//         }
//     }

//     /*
//      * COMMON PARENT / SUB-DIVISION VIEW-ALL EXPORT
//      *
//      * Both Parent Division and Sub-Division use the same backend
//      * Common View All export endpoints:
//      *   GET /api/working-capital/view-all/export/excel
//      *   GET /api/working-capital/view-all/export/pdf
//      *
//      * The filters are the exact filters currently selected in the
//      * View All modal.
//      */
//     async function handleCfoViewAllExport(
//         type,
//         _section,
//         overrideFilters = null
//     ) {
//         setExporting(true);
//         setError("");

//         try {
//             const activeFilters =
//                 overrideFilters ||
//                 appliedFilters ||
//                 filters;

//             const cfoViewAllFilters =
//                 buildCfoViewAllApiFilters(
//                     activeFilters,
//                     filterOptions
//                 );

//             const response =
//                 type === "excel"
//                     ? await exportWorkingCapitalViewAllExcel(
//                         cfoViewAllFilters
//                     )
//                     : await exportWorkingCapitalViewAllPdf(
//                         cfoViewAllFilters
//                     );

//             const fallback =
//                 type === "excel"
//                     ? "working-capital-view-all.xlsx"
//                     : "working-capital-view-all.pdf";

//             downloadWorkingCapitalFile(
//                 response,
//                 fallback
//             );
//         } catch (err) {
//             setError(
//                 err?.response?.data?.detail ||
//                 err?.message ||
//                 `Unable to export ${type}.`
//             );
//         } finally {
//             setExporting(false);
//         }
//     }

//     async function handleHeaderExport(format) {
//         if (exporting) return;
//         setExporting(true);
//         try {
//             const kpisRows = kpis ? Object.entries(kpis).map(([key, value]) => ({ metric: key, value })) : [];
//             const componentsRows = [
//                 { label: "Receivables", value: getValue(components, "receivables", "total_receivables"), type: "positive" },
//                 { label: "Inventory", value: getValue(components, "inventory", "total_inventory"), type: "positive" },
//                 { label: "(-) Payables", value: getValue(components, "payables", "total_payables"), type: "negative" },
//                 { label: "Trade Working Capital", value: getValue(components, "trade_working_capital", "trade_working_capital_value", "working_capital"), type: "total" },
//             ];
//             const payload = { kpisRows, trend, tradeTrend, componentsRows, assetRows, liabilityRows, avlRows, cccTrend };
//             if (format === "excel") exportWorkingCapitalAllToExcel(payload, currency);
//             else exportWorkingCapitalAllToPdf(payload, currency);
//         } catch (err) {
//             setError(err?.message || `Working Capital ${format} export failed.`);
//         } finally {
//             setExporting(false);
//         }
//     }

//     /* --------------------------------------------------------
//        VIEW ALL
//     -------------------------------------------------------- */

//     async function openViewAll(type, overrideFilters = null, cfoViewLabel = null) {
//         /*
//          * This is an explicit View-All/drilldown action only.
//          * It is intentionally not called by useEffect or hierarchy loops.
//          */
//         const activeFilters = overrideFilters || appliedFilters || filters;

//         /*
//          * Working Capital Components View All must use the currently selected
//          * View-All filters. The previous implementation reused componentData
//          * from the dashboard, so Apply changed the filter state but left the
//          * displayed component values unchanged. Fetch the components again
//          * for the explicit View-All Apply action.
//          */
//         if (type === "components") {
//             setViewAllLoading(true);
//             setError("");

//             try {
//                 const componentApiFilters = buildApiFilters(
//                     activeFilters,
//                     filterOptions
//                 );
//                 const componentResponse = await getWorkingCapitalComponents(
//                     componentApiFilters
//                 );
//                 const componentSource =
//                     unwrapApiResponse(componentResponse) ?? {};

//                 const componentRows = [
//                     {
//                         period: formatDate(activeFilters?.asOnDate || operationalDate || "—"),
//                         particular: "Receivables",
//                         amount: toNumber(getValue(componentSource, "receivables", "total_receivables")),
//                         percentage: null,
//                     },
//                     {
//                         period: formatDate(activeFilters?.asOnDate || operationalDate || "—"),
//                         particular: "Inventory",
//                         amount: toNumber(getValue(componentSource, "inventory", "total_inventory")),
//                         percentage: null,
//                     },
//                     {
//                         period: formatDate(activeFilters?.asOnDate || operationalDate || "—"),
//                         particular: "(-) Payables",
//                         amount: toNumber(getValue(componentSource, "payables", "total_payables")),
//                         percentage: null,
//                     },
//                     {
//                         period: formatDate(activeFilters?.asOnDate || operationalDate || "—"),
//                         particular: "Trade Working Capital",
//                         amount: toNumber(getValue(componentSource, "trade_working_capital", "trade_working_capital_value", "working_capital")),
//                         percentage: null,
//                     },
//                 ];

//                 setViewAll({
//                     type,
//                     cfoViewLabel,
//                     title: "Working Capital Components Detailed View",
//                     rows: componentRows,
//                     monthOnMonthRows: [],
//                     filters: { ...activeFilters },
//                 });
//                 return componentRows;
//             } catch (err) {
//                 setError(
//                     err?.response?.data?.detail ||
//                     err?.message ||
//                     "Unable to load Working Capital Components."
//                 );
//                 return [];
//             } finally {
//                 setViewAllLoading(false);
//             }
//         }

//         const apiFilters = buildApiFilters(
//             activeFilters,
//             filterOptions
//         );

//         /*
//          * Same endpoint + same selected filter scope = one in-flight Promise.
//          */
//         const requestKey = `${type}:${JSON.stringify(apiFilters)}`;
//         const existingRequest =
//             viewAllInFlightRef.current.get(requestKey);

//         if (existingRequest) {
//             return existingRequest;
//         }

//         setViewAllLoading(true);
//         setError("");

//         const requestPromise = (async () => {
//             try {
//                 let response;
//                 let rows = [];
//                 let title = "";

//                 if (type === "assets") {
//                     response =
//                         await getWorkingCapitalCurrentAssetsViewAll(
//                             apiFilters
//                         );

//                     rows =
//                         normalizeBreakdownRows(
//                             response
//                         );

//                     title =
//                         `Current Assets — Full History (${currency})`;
//                 }

//                 if (type === "liabilities") {
//                     response =
//                         await getWorkingCapitalCurrentLiabilitiesViewAll(
//                             apiFilters
//                         );

//                     rows =
//                         normalizeBreakdownRows(
//                             response
//                         );

//                     title =
//                         `Current Liabilities — Full History (${currency})`;
//                 }

//                 if (type === "trend") {
//                     response =
//                         await getWorkingCapitalViewAllTrend(
//                             apiFilters
//                         );

//                     rows =
//                         normalizeTrendRows(
//                             response
//                         );

//                     title =
//                         `Net Working Capital — Full History (${currency})`;
//                 }

//                 /*
//                  * COMMON PARENT / SUB-DIVISION VIEW ALL
//                  *
//                  * Both hierarchy charts intentionally use the same endpoint:
//                  *   GET /api/working-capital/view-all
//                  *
//                  * No separate Parent Division or Sub-Division View All API
//                  * exists, and no hierarchy iteration is performed here.
//                  *
//                  * Only the selected hierarchy/date filters are forwarded.
//                  */
//                 let monthOnMonthRows = [];

//                 if (type === "cfo") {
//                     const cfoViewAllFilters =
//                         buildCfoViewAllApiFilters(
//                             activeFilters,
//                             filterOptions
//                         );

//                     const [cfoResponse, parentTrendResponse] =
//                         await Promise.all([
//                             getWorkingCapitalViewAll(cfoViewAllFilters),
//                             getWorkingCapitalParentDivisionTrend({
//                                 ...cfoViewAllFilters,
//                                 months: 12,
//                             }),
//                         ]);

//                     response = cfoResponse;
//                     rows = normalizeCfoViewAllRows(response);
//                     monthOnMonthRows = normalizeHierarchyTrendRows(
//                         parentTrendResponse,
//                         "parent"
//                     );

//                     title =
//                         `Working Capital - ${cfoViewLabel || "Detailed"} - Detailed View`;
//                 }

//                 /*
//                  * IMPORTANT:
//                  * Trade View-All is called exactly once for the currently
//                  * selected filter scope, and only after the user explicitly
//                  * opens Trade Working Capital -> View All.
//                  *
//                  * There is no Parent Division/Sub-Division iteration here.
//                  */
//                 if (type === "trade") {
//                     response =
//                         await getWorkingCapitalViewAllTradeWorkingCapital(
//                             apiFilters
//                         );

//                     rows =
//                         normalizeTradeTrendRows(
//                             response
//                         );

//                     title =
//                         "Trade Working Capital Detailed View";
//                 }

//                 if (type === "ccc") {
//                     response =
//                         await getWorkingCapitalViewAllCcc(
//                             apiFilters
//                         );

//                     rows =
//                         normalizeCccTrendRows(
//                             response
//                         );

//                     title =
//                         "Cash Conversion Cycle Detailed View";
//                 }

//                 if (type === "liquidity") {
//                     rows = [
//                         {
//                             period:
//                                 liquidityRatios?.period ??
//                                 balanceSheetPeriod ??
//                                 "—",
//                             particular: "Current Ratio",
//                             amount: ratioValue,
//                             percentage: null,
//                         },
//                     ];

//                     title =
//                         "Key Liquidity Ratio";
//                 }

//                 setViewAll({
//                     type,
//                     cfoViewLabel,
//                     title,
//                     rows,
//                     monthOnMonthRows,
//                     filters: { ...activeFilters },
//                 });

//                 return rows;
//             } catch (err) {
//                 setError(
//                     err?.response?.data
//                         ?.detail ||
//                     err?.message ||
//                     "Unable to load View All data."
//                 );
//                 throw err;
//             } finally {
//                 if (
//                     viewAllInFlightRef.current.get(requestKey) ===
//                     requestPromise
//                 ) {
//                     viewAllInFlightRef.current.delete(requestKey);
//                 }

//                 setViewAllLoading(false);
//             }
//         })();

//         viewAllInFlightRef.current.set(
//             requestKey,
//             requestPromise
//         );

//         /*
//          * Prevent an unhandled rejection when a second click receives the
//          * same in-flight Promise.
//          */
//         requestPromise.catch(() => { });

//         return requestPromise;
//     }
//     return (
//         <>
//             <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
//             <style>{workingCapitalFilterResponsiveCss}</style>
//             <style>{`
//                 .wc-trade-view-all-table table th,
//                 .wc-trade-view-all-table table td {
//                     padding: 5px 6px !important;
//                     font-size: 0.62rem !important;
//                 }
//                 .wc-trade-view-all-table table th {
//                     white-space: nowrap;
//                 }
//                 @media (max-width: 1050px) {
//                     .wc-trade-view-all-grid {
//                         grid-template-columns: 1fr !important;
//                         grid-template-rows: minmax(300px, 1fr) minmax(300px, 0.9fr) !important;
//                     }
//                 }
//             `}</style>
//             <style>{`
//                 .wc-sales-page, .wc-sales-page * {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
//                 }
//                 .wc-sales-page .page-header {
//                     padding-top: 4px;
//                 }
//             `}</style>
//             <style>{`
//                 @keyframes shimmer {
//                     0% { background-position: 200% 0; }
//                     100% { background-position: -200% 0; }
//                 }

//                 @keyframes fadeIn {
//                     from { opacity: 0; transform: translateY(4px); }
//                     to { opacity: 1; transform: translateY(0); }
//                 }

//                 @keyframes popIn {
//                     from { opacity: 0; transform: translateY(4px) scale(.98); }
//                     to { opacity: 1; transform: translateY(0) scale(1); }
//                 }

//                 @keyframes pulse-ripple {
//                     0% { transform: scale(1); opacity: .8; }
//                     70% { transform: scale(1.8); opacity: 0; }
//                     100% { transform: scale(1.8); opacity: 0; }
//                 }

//                 @keyframes wcTrendDraw {
//                     from {
//                         stroke-dashoffset: 1400;
//                         opacity: .35;
//                     }
//                     to {
//                         stroke-dashoffset: 0;
//                         opacity: 1;
//                     }
//                 }

//                 @keyframes wcTrendLiveFlow {
//                     from {
//                         stroke-dashoffset: 0;
//                     }
//                     to {
//                         stroke-dashoffset: -1400;
//                     }
//                 }

//                 @keyframes wcBarGrow {
//                     from {
//                         transform: scaleX(0);
//                         opacity: .35;
//                     }
//                     to {
//                         transform: scaleX(1);
//                         opacity: 1;
//                     }
//                 }

//                 @keyframes wcChartRise {
//                     from {
//                         opacity: 0;
//                         transform: translateY(8px);
//                     }
//                     to {
//                         opacity: 1;
//                         transform: translateY(0);
//                     }
//                 }

//                 .wc-chart-enter {
//                     animation: wcChartRise .42s cubic-bezier(.4,0,.2,1) both;
//                 }


//                 .wc-trend-panel {
//                     transition: transform .20s ease, box-shadow .20s ease;
//                 }

//                 .wc-trend-panel:hover {
//                     transform: translateY(-2px);
//                     box-shadow: 0 10px 24px rgba(15,23,42,.08);
//                 }

//                 .wc-sales-page {
//                     animation: fadeIn .28s ease-out both;
//                 }

//                 @keyframes wcKpiIn {
//                     0% { opacity: 0; transform: translateY(5px); }
//                     100% { opacity: 1; transform: translateY(0); }
//                 }

//                 .wc-sales-kpis > div {
//                     animation: wcKpiIn .28s ease-out both;
//                 }

//                 .wc-sales-kpis > div:nth-child(2) { animation-delay: .02s; }
//                 .wc-sales-kpis > div:nth-child(3) { animation-delay: .04s; }
//                 .wc-sales-kpis > div:nth-child(4) { animation-delay: .06s; }
//                 .wc-sales-kpis > div:nth-child(5) { animation-delay: .08s; }
//                 .wc-sales-kpis > div:nth-child(6) { animation-delay: .10s; }
//                 .wc-sales-kpis > div:nth-child(7) { animation-delay: .12s; }
//                 .wc-sales-kpis > div:nth-child(8) { animation-delay: .14s; }
//                 .wc-sales-kpis > div:nth-child(9) { animation-delay: .16s; }

//                 .wc-sales-page .wc-sales-kpis > div:hover {
//                     transform: translateY(-2px);
//                 }
//                 .wc-sales-page .wc-panel-animate {
//                     animation: popIn .30s ease-out both;
//                 }

//                 .wc-sales-page .wc-sales-footer {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
//                     line-height: 1.35;
//                 }

//                 .wc-sales-page .wc-sales-footer strong {
//                     color: #334155;
//                     font-weight: 700;
//                 }

//                 .wc-sales-page .wc-page-skeleton {
//                     animation: fadeIn .20s ease-out both;
//                 }
//                 .wc-sales-page .wc-page-skeleton > div > div {
//                     border-radius: 14px !important;
//                 }
//                 .wc-sales-page button:hover:not(:disabled) {
//                     transform: translateY(-1px);
//                 }

//                 @keyframes wcKpiIn {
//                     0% { opacity: 0; transform: translateY(5px); }
//                     100% { opacity: 1; transform: translateY(0); }
//                 }

//                 .wc-sales-kpis > div {
//                     animation: wcKpiIn .28s ease-out both;
//                 }

//                 .wc-sales-kpis > div:nth-child(2) { animation-delay: .02s; }
//                 .wc-sales-kpis > div:nth-child(3) { animation-delay: .04s; }
//                 .wc-sales-kpis > div:nth-child(4) { animation-delay: .06s; }
//                 .wc-sales-kpis > div:nth-child(5) { animation-delay: .08s; }
//                 .wc-sales-kpis > div:nth-child(6) { animation-delay: .10s; }
//                 .wc-sales-kpis > div:nth-child(7) { animation-delay: .12s; }
//                 .wc-sales-kpis > div:nth-child(8) { animation-delay: .14s; }
//                 .wc-sales-kpis > div:nth-child(9) { animation-delay: .16s; }

//                 .wc-sales-page .wc-sales-kpis > div:hover {
//                     transform: translateY(-2px);
//                     box-shadow: 0 8px 22px rgba(15,23,42,.08);
//                     border-color: #CBD5E1;
//                 }

//                 .wc-sales-page select:focus,
//                 .wc-sales-page input:focus {
//                     border-color: #818CF8 !important;
//                     box-shadow: 0 0 0 3px rgba(99,102,241,.10);
//                 }

//                 .wc-sales-page table {
//                     width: 100%;
//                     border-collapse: collapse;
//                     font-size: .74rem;
//                 }

//                 .wc-sales-page table thead th {
//                     background: #F8FAFC;
//                     color: #1E3A8A;
//                     font-size: .74rem;
//                     font-weight: 700;
//                     padding: 8px 10px;
//                     border-bottom: 2px solid #E2E8F0;
//                 }

//                 .wc-sales-page table tbody td {
//                     color: #334155;
//                     font-size: .74rem;
//                     font-weight: 500;
//                     padding: 8px 10px;
//                     border-bottom: 1px solid #F1F5F9;
//                 }

//                 .wc-sales-page .wc-sales-data-table {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                 }

//                 .wc-sales-page .wc-sales-data-table thead th {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                     font-size: .74rem !important;
//                     font-weight: 700 !important;
//                     padding: 8px 16px !important;
//                     color: #1E3A8A !important;
//                 }

//                 .wc-sales-page .wc-sales-data-table tbody td {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                     font-size: .74rem !important;
//                     padding: 8px 16px !important;
//                 }

//                 .wc-sales-page .wc-breakdown-sales-table,
//                 .wc-sales-page .wc-breakdown-sales-table * {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                 }

//                 .wc-sales-page .wc-breakdown-sales-table thead th {
//                     font-size: .76rem !important;
//                     font-weight: 700 !important;
//                     color: #1E3A8A !important;
//                     padding: 8px 16px !important;
//                 }

//                 .wc-sales-page .wc-breakdown-sales-table tbody td {
//                     font-size: .80rem !important;
//                     font-weight: 600 !important;
//                     color: #334155 !important;
//                     padding: 8px 16px !important;
//                 }

//                 /* Total row: keep these values darker and heavier than the
//                    generic breakdown-table rule above. */
//                 .wc-sales-page .wc-breakdown-sales-table tbody tr.wc-breakdown-total-row td:first-child {
//                     color: #172554 !important;
//                     font-weight: 900 !important;
//                 }

//                 .wc-sales-page .wc-breakdown-sales-table tbody tr.wc-breakdown-total-row td:nth-child(2),
//                 .wc-sales-page .wc-breakdown-sales-table tbody tr.wc-breakdown-total-row td:nth-child(3) {
//                     color: #1E293B !important;
//                     font-weight: 900 !important;
//                 }

//                 .wc-sales-page table tbody tr {
//                     transition: background .12s ease;
//                 }

//                 .wc-sales-page table tbody tr:hover {
//                     background: #F8FAFC;
//                 }

//                 .wc-skeleton-line,
//                 .wc-skeleton-chart {
//                     background: linear-gradient(
//                         90deg,
//                         #E2E8F0 25%,
//                         #F1F5F9 50%,
//                         #E2E8F0 75%
//                     );
//                     background-size: 200% 100%;
//                     border-radius: 6px;
//                     animation: shimmer 1.4s infinite;
//                 }

//                 .wc-skeleton-chart {
//                     height: 180px;
//                     margin-top: 18px;
//                     border-radius: 8px;
//                 }

//                 .wc-panel-animate {
//                     animation: fadeIn .35s ease-out both;
//                 }

//                 .wc-sales-page .wc-panel-animate:nth-child(2) {
//                     animation-delay: .04s;
//                 }

//                 .wc-sales-page .wc-panel-animate:nth-child(3) {
//                     animation-delay: .08s;
//                 }

//                 .wc-sales-page .wc-panel-animate:nth-child(4) {
//                     animation-delay: .12s;
//                 }


//                 .wc-sales-page ::-webkit-scrollbar { width: 14px; height: 14px; }
//                 .wc-sales-page ::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 6px; }
//                 .wc-sales-page ::-webkit-scrollbar-thumb { background: #64748b; border-radius: 6px; border: 3px solid #e2e8f0; }
//                 .wc-sales-page ::-webkit-scrollbar-thumb:hover { background: #334155; }
//                 @media (prefers-reduced-motion: reduce) {
//                     .wc-sales-page,
//                     .wc-sales-page .wc-panel-animate,
//                     .wc-sales-page .wc-chart-enter,
//                     .wc-sales-page .wc-sales-kpis > div,
//                     .wc-sales-page .wc-hierarchy-exposure-panel div[style*="wcBarGrow"] {
//                         animation: none !important;
//                     }
//                 }

//                 @media (max-width: 1400px) {
//                     .wc-sales-kpis {
//                         grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
//                     }
//                 }

//                 @media (max-width: 1200px) {
//                     .wc-sales-kpis {
//                         grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
//                     }
//                 }

//                 @media (max-width: 1000px) {
//                     .wc-sales-kpis {
//                         grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
//                     }
//                     .wc-page-skeleton > div {
//                         grid-template-columns: 1fr !important;
//                     }
//                     .wc-page-skeleton > div:first-child {
//                         grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
//                     }
//                     .wc-sales-main-grid {
//                         grid-template-columns: 1fr !important;
//                     }
//                     .wc-sales-three-grid {
//                         grid-template-columns: 1fr !important;
//                     }
//                 }

//                 @media (max-width: 600px) {
//                     .wc-sales-kpis,
//                     .wc-sales-main-grid,
//                     .wc-sales-three-grid {
//                         grid-template-columns: 1fr !important;
//                     }
//                     .wc-page-skeleton > div,
//                     .wc-page-skeleton > div:first-child {
//                         grid-template-columns: 1fr !important;
//                     }
//                 }
//             `}</style>
//             <style>{`
//                 /* ==========================================================
//                    WORKING CAPITAL — SALES REVENUE VISUAL SYSTEM
//                    Visual-only overrides. API/data/state behavior unchanged.
//                 ========================================================== */
//                 .wc-sales-page,
//                 .wc-sales-page * {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                 }

//                 .wc-sales-page {
//                     color: #1e293b !important;
//                 }

//                 .wc-sales-page .page-header {
//                     margin-bottom: 16px !important;
//                     padding-top: 0 !important;
//                     gap: 16px !important;
//                 }

//                 .wc-sales-page .page-header-title,
//                 .wc-sales-page .wc-page-title {
//                     color: #1e1b4b !important;
//                     font-size: 1.45rem !important;
//                     font-weight: 800 !important;
//                     line-height: 1.2 !important;
//                     letter-spacing: -0.02em !important;
//                     margin: 0 !important;
//                 }

//                 .wc-sales-page .page-header-subtitle {
//                     color: #64748b !important;
//                     font-size: 0.74rem !important;
//                     line-height: 1.45 !important;
//                     margin-top: 4px !important;
//                 }

//                 /* Compact Sales-style filter bar */
//                 .wc-sales-page .wc-filter-grid {
//                     width: 100% !important;
//                     background: #fff !important;
//                     border: 1px solid #e2e8f0 !important;
//                     border-radius: 12px !important;
//                     padding: 10px 12px !important;
//                     gap: 10px 8px !important;
//                     margin-bottom: 16px !important;
//                     box-shadow: 0 2px 8px rgba(15,23,42,.035) !important;
//                 }

//                 .wc-sales-page .wc-filter-grid select,
//                 .wc-sales-page .wc-filter-grid input,
//                 .wc-sales-page .wc-filter-grid button {
//                     min-height: 30px !important;
//                     height: 32px !important;
//                     border-radius: 7px !important;
//                     font-size: 0.70rem !important;
//                     font-weight: 600 !important;
//                 }

//                 .wc-sales-page .wc-filter-grid select,
//                 .wc-sales-page .wc-filter-grid input {
//                     border-color: #dbe2ea !important;
//                     background: #fff !important;
//                     color: #334155 !important;
//                 }

//                 .wc-sales-page .wc-filter-grid select:focus,
//                 .wc-sales-page .wc-filter-grid input:focus {
//                     border-color: #818cf8 !important;
//                     box-shadow: 0 0 0 3px rgba(99,102,241,.10) !important;
//                     outline: none !important;
//                 }

//                 /* KPI cards — same compact Sales/Receivables/Payables proportions */
//                 .wc-sales-page .wc-sales-kpis {
//                     grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
//                     gap: 10px !important;
//                     margin-top: 0 !important;
//                     margin-bottom: 16px !important;
//                     align-items: stretch !important;
//                 }

//                 .wc-sales-page .sales-style-kpi {
//                     border: none !important;
//                     border-radius: 12px !important;
//                     padding: 10px !important;
//                     min-height: 74px !important;
//                     box-shadow: none !important;
//                     transition: all .25s cubic-bezier(.4,0,.2,1) !important;
//                 }

//                 .wc-sales-page .sales-style-kpi:hover {
//                     box-shadow: 0 8px 24px rgba(37,99,235,.10) !important;
//                     transform: translateY(-2px) !important;
//                 }

//                 /* Panels / charts */
//                 .wc-sales-page .wc-panel-animate {
//                     background: #fff !important;
//                     border: 1px solid rgba(0,0,0,.04) !important;
//                     border-radius: 16px !important;
//                     box-shadow: 0 4px 24px rgba(0,0,0,.02), 0 1px 3px rgba(0,0,0,.03) !important;
//                     transition: box-shadow .2s cubic-bezier(.4,0,.2,1), transform .2s ease !important;
//                 }

//                 .wc-sales-page .wc-panel-animate:hover {
//                     box-shadow: 0 4px 12px rgba(0,0,0,.05) !important;
//                 }

//                 .wc-sales-page .wc-panel-animate h3 {
//                     color: #1e1b4b !important;
//                     font-weight: 800 !important;
//                     letter-spacing: -0.01em !important;
//                 }

//                 /* Tables */
//                 .wc-sales-page table {
//                     width: 100% !important;
//                     border-collapse: collapse !important;
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                 }

//                 .wc-sales-page table thead th {
//                     padding: 10px 16px !important;
//                     background: #f8fafc !important;
//                     color: #1e3a8a !important;
//                     border-bottom: 2px solid #e2e8f0 !important;
//                     font-size: 0.74rem !important;
//                     font-weight: 700 !important;
//                     line-height: 1.25 !important;
//                     white-space: nowrap !important;
//                     letter-spacing: 0 !important;
//                 }

//                 .wc-sales-page table tbody td {
//                     padding: 8px 16px !important;
//                     font-size: 0.74rem !important;
//                     color: #334155 !important;
//                     border-bottom-color: #f1f5f9 !important;
//                 }

//                 .wc-sales-page table tbody tr:hover td {
//                     background: #f8fafc !important;
//                 }

//                 .wc-sales-page .wc-sales-main-grid,
//                 .wc-sales-page .wc-sales-three-grid {
//                     gap: 10px !important;
//                     margin-bottom: 10px !important;
//                 }

//                 @media (max-width: 1400px) {
//                     .wc-sales-page .wc-sales-kpis {
//                         grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
//                     }
//                 }

//                 @media (max-width: 1200px) {
//                     .wc-sales-page .wc-sales-kpis {
//                         grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
//                     }
//                 }

//                 @media (max-width: 1000px) {
//                     .wc-sales-page .wc-sales-kpis {
//                         grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
//                     }
//                 }

//                 @media (max-width: 600px) {
//                     .wc-sales-page .wc-sales-kpis {
//                         grid-template-columns: 1fr !important;
//                     }
//                 }
//             `}</style>


//             <style>{`
//                 /* ==========================================================
//                    WORKING CAPITAL — SALES-UNIFORM VIEW ALL LAYER
//                    Visual-only. No API/state/handler/animation changes.
//                 ========================================================== */
//                 .wc-sales-page .wc-sales-view-all-overlay,
//                 .wc-sales-view-all-overlay {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                 }

//                 .wc-sales-view-all-overlay .wc-sales-view-all-modal {
//                     color: #0F172A !important;
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                     border-radius: 14px !important;
//                     border: 1px solid #E2E8F0 !important;
//                     box-shadow: 0 18px 48px rgba(15,23,42,.14) !important;
//                 }

//                 .wc-sales-view-all-overlay h2 {
//                     color: #1E1B4B !important;
//                     font-size: .96rem !important;
//                     font-weight: 800 !important;
//                     letter-spacing: -.015em !important;
//                 }

//                 .wc-sales-view-all-overlay input,
//                 .wc-sales-view-all-overlay button,
//                 .wc-sales-view-all-overlay select {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                 }

//                 .wc-sales-view-all-overlay input {
//                     color: #334155 !important;
//                     border-color: #CBD5E1 !important;
//                     border-radius: 7px !important;
//                 }

//                 .wc-sales-view-all-overlay input:focus,
//                 .wc-sales-view-all-overlay select:focus {
//                     border-color: #818CF8 !important;
//                     box-shadow: 0 0 0 3px rgba(99,102,241,.10) !important;
//                     outline: none !important;
//                 }

//                 .wc-sales-view-all-overlay table {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                 }

//                 .wc-sales-view-all-overlay table thead th {
//                     background: #F8FAFC !important;
//                     color: #1E3A8A !important;
//                     border-bottom: 2px solid #E2E8F0 !important;
//                     font-size: .72rem !important;
//                     font-weight: 700 !important;
//                     padding: 9px 10px !important;
//                     line-height: 1.25 !important;
//                 }

//                 .wc-sales-view-all-overlay table tbody td {
//                     color: #334155 !important;
//                     border-bottom: 1px solid #F1F5F9 !important;
//                     font-size: .72rem !important;
//                     font-weight: 500 !important;
//                     padding: 8px 10px !important;
//                 }

//                 .wc-sales-view-all-overlay table tbody tr:hover td {
//                     background: #F8FAFC !important;
//                 }

//                 .wc-sales-view-all-overlay .wc-view-all-toolbar {
//                     background: #FAFBFC !important;
//                     border-bottom-color: #E2E8F0 !important;
//                 }

//                 @media (max-width: 900px) {
//                     .wc-sales-view-all-overlay .wc-sales-view-all-modal {
//                         width: 98vw !important;
//                     }
//                 }
//             `}</style>

//             <div className="wc-sales-page animate-in" style={{ paddingTop: "16px", paddingBottom: "8px" }}>
//                 <div className="page-header" style={{ marginBottom: "16px", paddingTop: "0", gap: "16px" }}>
//                     <div>
//                         <h1 className="page-header-title wc-page-title" style={{ fontSize: "1.45rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
//                             <span style={{ fontSize: "1.3rem" }}>📈</span> Working Capital Report
//                         </h1>

//                         <p className="page-header-subtitle">
//                             Track working capital position and efficiency across all dimensions
//                             <br />
//                             <span style={{ display: "inline-block", marginTop: 4, fontWeight: 600, color: "#64748B", fontSize: "0.74rem" }}>
//                                 Reporting currency: <strong style={{ color: "#16A34A" }}>{currency}</strong>
//                                 <span style={{ margin: "0 6px", color: "#CBD5E1" }}>•</span>
//                                 Operational as on: {formatDate(operationalDate)}
//                             </span>
//                         </p>
//                     </div>

//                     <div
//                         style={
//                             styles.headerActions
//                         }
//                     >
//                         <button
//                             type="button"
//                             onClick={() => handleHeaderExport("excel")}
//                             disabled={exporting}
//                             style={{
//                                 ...styles.button,
//                                 color: "#15803D",
//                                 background: "#F0FDF4",
//                                 borderColor: "#BBF7D0",
//                                 minWidth: 78,
//                             }}
//                         >
//                             {exporting ? "⏳" : "📊"} Excel
//                         </button>
//                         <button
//                             type="button"
//                             onClick={() => handleHeaderExport("pdf")}
//                             disabled={exporting}
//                             style={{
//                                 ...styles.button,
//                                 color: "#BE123C",
//                                 background: "#FFF1F2",
//                                 borderColor: "#FECDD3",
//                                 minWidth: 72,
//                             }}
//                         >
//                             {exporting ? "⏳" : "📄"} PDF
//                         </button>

//                         <button
//                             type="button"
//                             onClick={
//                                 handleRefresh
//                             }
//                             style={{
//                                 ...styles.button,
//                                 width: "40px",
//                                 padding: 0,
//                                 fontSize: "17px",
//                                 color: "#4F46E5",
//                             }}
//                             disabled={loading}
//                             title="Refresh"
//                         >
//                             ↻
//                         </button>
//                     </div>
//                 </div>

//                 <div
//                     className="wc-filter-grid"
//                     style={
//                         styles.filterContainer
//                     }
//                 >
//                     {!filterOptionsLoaded && (
//                         <div
//                             style={{
//                                 gridColumn: "1 / -1",
//                                 color: "#64748B",
//                                 fontSize: "10px",
//                                 padding: "2px 0 4px",
//                             }}
//                         >
//                             Loading Working Capital filter options...
//                         </div>
//                     )}
//                     <MultiSelectField
//                         label="Legal Group"
//                         values={filters.legalGroups}
//                         options={cascadingFilterOptions.legalGroups}
//                         onChange={(value) => updateFilter("legalGroups", value)}
//                     />

//                     <MultiSelectField
//                         label="Legal Entity"
//                         values={filters.legalEntities}
//                         options={cascadingFilterOptions.legalEntities}
//                         onChange={(value) => updateFilter("legalEntities", value)}
//                     />

//                     <MultiSelectField
//                         label="Parent Division"
//                         values={filters.parentDivisions}
//                         options={cascadingFilterOptions.parentDivisions}
//                         onChange={(value) => updateFilter("parentDivisions", value)}
//                     />

//                     <MultiSelectField
//                         label="Sub-Division"
//                         values={filters.subDivisions}
//                         options={cascadingFilterOptions.subDivisions}
//                         onChange={(value) => updateFilter("subDivisions", value)}
//                     />

//                     <div style={{ minWidth: 0 }}>
//                         <label style={styles.filterLabel}>Reporting Currency</label>
//                         <div
//                             style={{
//                                 ...styles.filterInput,
//                                 height: "32px",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 color: "#334155",
//                                 fontWeight: 700,
//                                 background: "#FFFFFF",
//                                 cursor: "default",
//                             }}
//                         >
//                             {filterOptions.reportingCurrency || "AED"}
//                         </div>
//                     </div>

//                     <div style={{ minWidth: 0 }}>
//                         <label style={styles.filterLabel}>Aging Basis</label>
//                         <select
//                             value={filters.agingBasis || "DUE_DATE"}
//                             onChange={(event) => updateFilter("agingBasis", event.target.value)}
//                             style={{
//                                 ...styles.filterInput,
//                                 height: "32px",
//                                 cursor: "pointer",
//                             }}
//                         >
//                             {(filterOptions.agingBases || ["DUE_DATE"]).map((basis) => (
//                                 <option key={basis} value={basis}>
//                                     {basis === "DUE_DATE" ? "Due Date Basis" : String(basis).replaceAll("_", " ")}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div style={{ minWidth: 0 }}>
//                         <label style={styles.filterLabel}>As On Date</label>
//                         <CalendarDateField
//                             value={filters.asOnDate || ""}
//                             onChange={(value) => updateFilter("asOnDate", value)}
//                             width="100%"
//                         />
//                     </div>

//                     <button
//                         type="button"
//                         onClick={applyFilters}
//                         style={{
//                             height: "32px",
//                             padding: "0 18px",
//                             background: "#4F46E5",
//                             color: "#FFFFFF",
//                             border: "none",
//                             borderRadius: "5px",
//                             fontSize: "11px",
//                             fontWeight: 700,
//                             cursor: "pointer",
//                         }}
//                     >
//                         Apply
//                     </button>

//                     <button
//                         type="button"
//                         onClick={resetFilters}
//                         style={{
//                             height: "32px",
//                             border: "none",
//                             background: "transparent",
//                             color: "#263BD4",
//                             fontSize: "11px",
//                             fontWeight: 600,
//                             cursor: "pointer",
//                         }}
//                     >
//                         Reset
//                     </button>
//                 </div>

//                 {error && (
//                     <div
//                         style={{
//                             ...styles.panel,
//                             marginBottom: "10px",
//                             color: "#B42318",
//                             background:
//                                 "#FEF3F2",
//                         }}
//                     >
//                         {error}
//                     </div>
//                 )}

//                 {loading && <PageSkeleton />}

//                 {viewAllLoading && (
//                     <div
//                         style={{
//                             ...styles.panel,
//                             marginBottom: "10px",
//                             color: "#475467",
//                         }}
//                     >
//                         Loading full available
//                         history...
//                     </div>
//                 )}

//                 {!loading && (
//                     <>
//                         {/* ==================================================
//                         KPI CARDS
//                     ================================================== */}

//                         <div className="wc-sales-kpis kpi-grid">
//                             <KpiCard
//                                 title="Trade Working Capital"
//                                 value={formatAmount(kpis?.trade_working_capital, currency)}
//                                 subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
//                                 icon="↗"
//                             />
//                             <KpiCard
//                                 title="Trade Receivables"
//                                 value={formatAmount(kpis?.total_receivables, currency)}
//                                 subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
//                                 icon="◔"
//                             />
//                             <KpiCard
//                                 title="Inventory"
//                                 value={formatAmount(kpis?.total_inventory, currency)}
//                                 subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
//                                 icon="▦"
//                             />
//                             <KpiCard
//                                 title="Trade Payables"
//                                 value={formatAmount(kpis?.total_payables, currency)}
//                                 subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
//                                 icon="◒"
//                             />
//                             <KpiCard
//                                 title="Working Capital Ratio"
//                                 value={toNumber(kpis?.working_capital_ratio ?? kpis?.current_ratio) === null ? "—" : toNumber(kpis?.working_capital_ratio ?? kpis?.current_ratio).toFixed(2)}
//                                 subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
//                                 icon="◔"
//                             />
//                             <KpiCard
//                                 title="DSO"
//                                 value={toNumber(kpis?.dso_days) === null ? "—" : `${toNumber(kpis.dso_days).toFixed(2)} Days`}
//                                 subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
//                                 icon="◷"
//                             />
//                             <KpiCard
//                                 title="DIO"
//                                 value={toNumber(kpis?.dio_days) === null ? "—" : `${toNumber(kpis.dio_days).toFixed(2)} Days`}
//                                 subtitle={toNumber(kpis?.dio_days) === null ? "Insufficient history" : operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
//                                 icon="▦"
//                             />
//                             <KpiCard
//                                 title="DPO"
//                                 value={toNumber(kpis?.dpo_days) === null ? "—" : `${toNumber(kpis.dpo_days).toFixed(2)} Days`}
//                                 subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
//                                 icon="◒"
//                             />
//                             <KpiCard
//                                 title="CCC"
//                                 value={toNumber(kpis?.cash_conversion_cycle_days) === null ? "—" : `${toNumber(kpis.cash_conversion_cycle_days).toFixed(2)} Days`}
//                                 subtitle={toNumber(kpis?.cash_conversion_cycle_days) === null ? "Insufficient history" : operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
//                                 icon="◴"
//                             />
//                             <KpiCard
//                                 title="Target CCC"
//                                 value={(() => {
//                                     const target = toNumber(
//                                         getValue(
//                                             kpis,
//                                             "target_ccc_days",
//                                             "target_cash_conversion_cycle_days",
//                                             "target_cash_conversion_cycle",
//                                             "ccc_target_days",
//                                             "ccc_target",
//                                             "target_ccc"
//                                         )
//                                     );
//                                     return target === null ? "—" : `${target.toFixed(2)} Days`;
//                                 })()}
//                                 subtitle="Backend target"
//                                 icon="◎"
//                             />
//                         </div>

//                         {/* ==================================================
//                         TRADE WORKING CAPITAL TREND
//                     ================================================== */}

//                         <div
//                             className="wc-sales-main-grid"
//                             style={{
//                                 display: "grid",
//                                 gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//                                 gap: "10px",
//                                 marginBottom: "10px",
//                             }}
//                         >
//                             <TradeWorkingCapitalTrendPanel
//                                 data={tradeTrend}
//                                 currency={currency}
//                                 onViewAll={() => openViewAll("trade")}
//                             />

//                             <TradeWorkingCapitalComponents
//                                 components={componentData}
//                                 currency={currency}
//                                 onViewAll={() => openViewAll("components")}
//                             />
//                         </div>

//                         {/* ==================================================
//                         WORKING CAPITAL BY PARENT / SUB-DIVISION
//                         ==================================================
//                         No Trade Working Capital View-All API is prefetched here.

//                         View All is requested only by the explicit Trade Working
//                         Capital View All action, once for the selected scope.
//                         ================================================== */}

//                         {/* ==================================================
//                         PARENT DIVISION / SUB-DIVISION WORKING CAPITAL TRENDS

//                         Dashboard = Charts
//                         View All = Common detailed table
//                     ================================================== */}

//                         <div
//                             className="wc-sales-main-grid"
//                             style={{
//                                 display: "grid",
//                                 gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//                                 gap: "10px",
//                                 marginBottom: "10px",
//                             }}
//                         >
//                             <HierarchyTrendChart
//                                 data={subDivisionTrend}
//                                 currency={currency}
//                                 title={`Working Capital by Sub-Division (${currency})`}
//                                 levelLabel="Sub-Division"
//                                 onViewAll={() => openViewAll("cfo", null, "Sub-Division")}
//                                 onExportExcel={() =>
//                                     exportTrendToExcel(
//                                         subDivisionTrend,
//                                         "Working Capital by Sub-Division",
//                                         currency,
//                                         "Working Capital"
//                                     )
//                                 }
//                                 onExportPdf={() =>
//                                     exportTrendToPdf(
//                                         subDivisionTrend,
//                                         "Working Capital by Sub-Division",
//                                         currency,
//                                         "Working Capital"
//                                     )
//                                 }
//                             />

//                             <HierarchyTrendChart
//                                 data={parentDivisionTrend}
//                                 currency={currency}
//                                 title={`Working Capital by Parent Division (${currency})`}
//                                 levelLabel="Parent Division"
//                                 onViewAll={() => openViewAll("cfo", null, "Parent Division")}
//                                 onExportExcel={() =>
//                                     exportTrendToExcel(
//                                         parentDivisionTrend,
//                                         "Working Capital by Parent Division",
//                                         currency,
//                                         "Working Capital"
//                                     )
//                                 }
//                                 onExportPdf={() =>
//                                     exportTrendToPdf(
//                                         parentDivisionTrend,
//                                         "Working Capital by Parent Division",
//                                         currency,
//                                         "Working Capital"
//                                     )
//                                 }
//                             />
//                         </div>

//                         {/* ==================================================
//                         CCC / INSIGHTS
//                     ================================================== */}

//                         <div
//                             className="wc-sales-main-grid"
//                             style={{
//                                 display: "grid",
//                                 gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//                                 gap: "10px",
//                                 marginBottom: "10px",
//                             }}
//                         >
//                             <CashConversionCycle
//                                 kpis={kpis}
//                                 cccPayload={ccc}
//                                 operationalDate={operationalDate}
//                             />

//                             <div className="wc-panel-animate" style={styles.panel}>
//                                 <div
//                                     style={{
//                                         display: "flex",
//                                         justifyContent: "space-between",
//                                         alignItems: "center",
//                                     }}
//                                 >
//                                     <h3
//                                         style={{
//                                             ...styles.panelTitle,
//                                             marginBottom: 0,
//                                         }}
//                                     >
//                                         Cash Conversion Cycle Trend (Days)
//                                     </h3>

//                                     <ActionMenu
//                                         items={[
//                                             {
//                                                 key: "view-all",
//                                                 label: "🔎 View All",
//                                                 onClick: () => openViewAll("ccc"),
//                                             },
//                                         ]}
//                                     />
//                                 </div>

//                                 <CccTrendMini data={cccTrend} />
//                             </div>
//                         </div>

//                     </>
//                 )}

//                 {/* ==================================================
//                     FOOTER — matched to Sales Revenue
//                 ================================================== */}
//                 <div
//                     className="wc-sales-footer"
//                     style={{
//                         fontSize: "0.65rem",
//                         color: C.muted,
//                         display: "flex",
//                         justifyContent: "space-between",
//                         paddingTop: 10,
//                         paddingBottom: 4,
//                         marginTop: 2,
//                         flexWrap: "wrap",
//                         gap: 4,
//                         borderTop: "1px solid #F1F5F9",
//                     }}
//                 >
//                     <span>
//                         All values are in <strong>{currency || "—"}</strong>&nbsp;|&nbsp;
//                         {operationalDate && operationalDate !== "—"
//                             ? `Last Updated On: ${formatDate(operationalDate)}`
//                             : ""}
//                         &nbsp;|&nbsp;
//                         <span style={{ color: C.green, fontWeight: 700 }}>● Live</span>
//                     </span>
//                     <span>☁️ Source: Oracle Fusion Cloud</span>
//                 </div>

//                 {viewAll && (
//                     <ViewAllModal
//                         title={viewAll.title}
//                         rows={viewAll.rows}
//                         currency={currency}
//                         type={viewAll.type}
//                         monthOnMonthRows={viewAll.monthOnMonthRows || []}
//                         onClose={() => setViewAll(null)}
//                         filterOptions={filterOptions}
//                         baseFilters={viewAll.filters || appliedFilters || filters}
//                         loading={viewAllLoading}
//                         onApplyFilters={(nextFilters) => openViewAll(viewAll.type, nextFilters, viewAll.cfoViewLabel)}
//                         onExport={
//                             viewAll.type === "cfo"
//                                 ? handleCfoViewAllExport
//                                 : handleExport
//                         }
//                     />
//                 )}
//             </div>
//         </>
//     );
// }

// /* ============================================================
//    EXTRA VISUALS
// ============================================================ */

// function HierarchyTrendChart({
//     data,
//     currency,
//     title,
//     levelLabel,
//     onViewAll,
//     onExportExcel,
//     onExportPdf,
// }) {
//     const rows = Array.isArray(data) ? data : [];
//     const [hoveredIndex, setHoveredIndex] = useState(null);
//     const [parentHoveredIndex, setParentHoveredIndex] = useState(null);
//     const [parentTooltipPosition, setParentTooltipPosition] = useState(null);

//     /*
//      * Keep the existing backend response handling exactly as-is.
//      * The dashboard still consumes the individual hierarchy trend APIs:
//      *   Parent Division -> /trend/parent-divisions
//      *   Sub-Division   -> /trend/subdivisions
//      *
//      * Only the visual presentation changes here.
//      */
//     const periods = Array.from(
//         new Set(rows.map((row) => String(row.period ?? "")))
//     ).filter(Boolean);

//     const latestPeriod = periods.length
//         ? periods[periods.length - 1]
//         : null;

//     const latestRows = rows
//         .filter((row) => String(row.period ?? "") === String(latestPeriod))
//         .filter(
//             (row) =>
//                 row?.name &&
//                 row.name !== "—" &&
//                 toNumber(row.value) !== null
//         )
//         .map((row) => ({
//             ...row,
//             value: toNumber(row.value),
//         }))
//         .sort((a, b) => {
//             const av = Number.isFinite(a.value) ? a.value : -Infinity;
//             const bv = Number.isFinite(b.value) ? b.value : -Infinity;
//             return bv - av;
//         });

//     const visibleRows = latestRows.slice(0, 6);

//     /* ============================================================
//        SALES REVENUE STYLE — SUB-DIVISION

//        This branch intentionally mirrors the Revenue by Sub-Division
//        chart:
//        - vertical bars
//        - compact 6-item display
//        - gradient bars
//        - rounded tops
//        - value labels above bars
//        - light dotted grid
//        - compact navy/secondary typography
//        - animated bars
//        - white custom tooltip
//        - two-line long-name handling
//     ============================================================ */
//     if (levelLabel === "Sub-Division") {
//         const chartRows = visibleRows.map((row, index) => ({
//             ...row,
//             chartIndex: index,
//         }));

//         const splitLabel = (label) => {
//             const text = String(label ?? "—").trim();
//             if (text.length <= 15) return [text];

//             const words = text.split(/\s+/).filter(Boolean);
//             if (words.length <= 1) {
//                 return [
//                     text.slice(0, Math.ceil(text.length / 2)),
//                     text.slice(Math.ceil(text.length / 2)),
//                 ];
//             }

//             let line1 = "";
//             let line2 = "";

//             words.forEach((word) => {
//                 const candidate = line1
//                     ? `${line1} ${word}`
//                     : word;

//                 if (
//                     candidate.length <= 15 ||
//                     !line1
//                 ) {
//                     line1 = candidate;
//                 } else {
//                     line2 = line2
//                         ? `${line2} ${word}`
//                         : word;
//                 }
//             });

//             if (!line2 && line1.length > 15) {
//                 const midpoint = Math.ceil(line1.length / 2);
//                 const firstSpace = line1.lastIndexOf(" ", midpoint);

//                 if (firstSpace > 4) {
//                     line2 = line1.slice(firstSpace + 1);
//                     line1 = line1.slice(0, firstSpace);
//                 } else {
//                     line2 = line1.slice(midpoint);
//                     line1 = line1.slice(0, midpoint);
//                 }
//             }

//             return line2 ? [line1, line2] : [line1];
//         };

//         const formatAxisValue = (value) => {
//             const number = toNumber(value);
//             if (number === null) return "—";

//             const abs = Math.abs(number);
//             if (abs >= 1_000_000_000) {
//                 return `${(number / 1_000_000_000).toFixed(1)}B`;
//             }
//             if (abs >= 1_000_000) {
//                 return `${(number / 1_000_000).toFixed(1)}M`;
//             }
//             if (abs >= 1_000) {
//                 return `${(number / 1_000).toFixed(1)}K`;
//             }
//             return Number(number).toLocaleString(undefined, {
//                 maximumFractionDigits: 1,
//             });
//         };

//         const maxValue = Math.max(
//             ...chartRows.map((row) => Math.abs(toNumber(row.value) ?? 0)),
//             1
//         );

//         const chartData = chartRows.map((row) => ({
//             name: row.name,
//             value: row.value,
//             original: row,
//         }));

//         const colors = [
//             "#10B981",
//             "#3B82F6",
//             "#F59E0B",
//             "#8B5CF6",
//             "#06B6D4",
//             "#F43F5E",
//         ];

//         const chartKey = `wc-subdivision-${String(latestPeriod ?? "latest")}`
//             .replace(/[^a-zA-Z0-9_-]/g, "-");

//         return (
//             <div
//                 className="wc-panel-animate wc-chart-enter wc-hierarchy-exposure-panel"
//                 style={{
//                     ...styles.panel,
//                     position: "relative",
//                     overflow: "visible",
//                     padding: "14px 18px 10px",
//                     minHeight: 340,
//                 }}
//             >
//                 <div
//                     style={{
//                         display: "flex",
//                         alignItems: "flex-start",
//                         justifyContent: "space-between",
//                         gap: 10,
//                         marginBottom: 10,
//                     }}
//                 >
//                     <div style={{ minWidth: 0 }}>
//                         <h3
//                             style={{
//                                 ...styles.panelTitle,
//                                 marginBottom: 2,
//                                 fontSize: "0.88rem",
//                                 fontWeight: 800,
//                                 color: C.navy,
//                             }}
//                         >
//                             {title}
//                         </h3>

//                         <div
//                             style={{
//                                 fontSize: "0.68rem",
//                                 color: C.muted,
//                                 marginTop: 2,
//                                 lineHeight: 1.35,
//                             }}
//                         >
//                             {currency || "AED"} — all sub-divisions compared
//                         </div>
//                     </div>

//                     <ActionMenu
//                         items={[
//                             {
//                                 key: "view-all",
//                                 label: "🔎 View All",
//                                 onClick: onViewAll,
//                             },
//                             {
//                                 key: "export-excel",
//                                 label: "📊 Export Excel",
//                                 onClick: onExportExcel,
//                                 disabled: typeof onExportExcel !== "function",
//                             },
//                             {
//                                 key: "export-pdf",
//                                 label: "📄 Export PDF",
//                                 onClick: onExportPdf,
//                                 disabled: typeof onExportPdf !== "function",
//                             },
//                         ]}
//                     />
//                 </div>

//                 {!chartRows.length ? (
//                     <div
//                         style={{
//                             minHeight: 240,
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             color: C.muted,
//                             fontSize: "0.8rem",
//                         }}
//                     >
//                         No data
//                     </div>
//                 ) : (
//                     <div
//                         style={{
//                             width: "100%",
//                             height: 285,
//                             marginTop: 2,
//                             position: "relative",
//                         }}
//                         onMouseLeave={() => setHoveredIndex(null)}
//                     >
//                         <ResponsiveContainer
//                             width="100%"
//                             height="100%"
//                             minWidth={0}
//                             minHeight={220}
//                         >
//                             <BarChart
//                                 data={chartData}
//                                 margin={{
//                                     top: 28,
//                                     right: 14,
//                                     left: 10,
//                                     bottom: 58,
//                                 }}
//                                 onMouseMove={(state) => {
//                                     const index = state?.activeTooltipIndex;
//                                     setHoveredIndex(
//                                         index === undefined || index === null
//                                             ? null
//                                             : Number(index)
//                                     );
//                                 }}
//                                 onMouseLeave={() => setHoveredIndex(null)}
//                             >
//                                 <CartesianGrid
//                                     vertical={false}
//                                     stroke="#F1F5F9"
//                                     strokeDasharray="3 3"
//                                 />

//                                 <XAxis
//                                     dataKey="name"
//                                     axisLine={{ stroke: "#E2E8F0" }}
//                                     tickLine={false}
//                                     interval={0}
//                                     height={58}
//                                     tick={(props) => {
//                                         const { x, y, payload } = props;
//                                         const lines = splitLabel(payload?.value).slice(0, 2);

//                                         return (
//                                             <g transform={`translate(${x},${y})`}>
//                                                 <text
//                                                     x={0}
//                                                     y={0}
//                                                     textAnchor="middle"
//                                                     fill="#64748B"
//                                                     style={{
//                                                         fontSize: "10px",
//                                                         fontWeight: 600,
//                                                         fontFamily:
//                                                             "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//                                                     }}
//                                                 >
//                                                     {lines.map((line, lineIndex) => (
//                                                         <tspan
//                                                             key={`${line}-${lineIndex}`}
//                                                             x={0}
//                                                             dy={lineIndex === 0 ? 12 : 13}
//                                                         >
//                                                             {line}
//                                                         </tspan>
//                                                     ))}
//                                                 </text>
//                                             </g>
//                                         );
//                                     }}
//                                 />

//                                 <YAxis
//                                     axisLine={false}
//                                     tickLine={false}
//                                     tick={{
//                                         fontSize: 10,
//                                         fill: "#94A3B8",
//                                         fontWeight: 600,
//                                     }}
//                                     tickFormatter={formatAxisValue}
//                                     width={44}
//                                     domain={[0, Math.ceil(maxValue * 1.12)]}
//                                 />

//                                 <Tooltip
//                                     cursor={{
//                                         stroke: "#CBD5E1",
//                                         strokeWidth: 1,
//                                         strokeDasharray: "4 4",
//                                     }}
//                                     offset={18}
//                                     wrapperStyle={{
//                                         zIndex: 100,
//                                         pointerEvents: "none",
//                                     }}
//                                     content={(props) => {
//                                         const { active, payload } = props;

//                                         if (!active || !payload || !payload.length) {
//                                             return null;
//                                         }

//                                         const item = payload[0]?.payload;
//                                         const index = chartData.findIndex(
//                                             (entry) => entry.name === item?.name
//                                         );
//                                         const color = colors[Math.max(index, 0) % colors.length];

//                                         return (
//                                             <div
//                                                 style={{
//                                                     background: "#FFFFFF",
//                                                     border: `1px solid ${C.border}`,
//                                                     borderRadius: 10,
//                                                     padding: "12px 16px",
//                                                     boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
//                                                     minWidth: 190,
//                                                     fontFamily:
//                                                         "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//                                                 }}
//                                             >
//                                                 <div
//                                                     style={{
//                                                         fontWeight: 800,
//                                                         color: "#1E293B",
//                                                         marginBottom: 8,
//                                                         fontSize: "0.85rem",
//                                                         lineHeight: 1.25,
//                                                         maxWidth: 240,
//                                                     }}
//                                                 >
//                                                     {item?.name}
//                                                 </div>
//                                                 <div
//                                                     style={{
//                                                         display: "grid",
//                                                         gridTemplateColumns: "auto 1fr",
//                                                         gap: "6px 16px",
//                                                         alignItems: "center",
//                                                     }}
//                                                 >
//                                                     <span
//                                                         style={{
//                                                             color: "#64748B",
//                                                             fontSize: "0.75rem",
//                                                             fontWeight: 500,
//                                                         }}
//                                                     >
//                                                         <span
//                                                             style={{
//                                                                 display: "inline-block",
//                                                                 width: 8,
//                                                                 height: 8,
//                                                                 borderRadius: 2,
//                                                                 background: color,
//                                                                 marginRight: 6,
//                                                             }}
//                                                         />
//                                                         Working Capital:
//                                                     </span>
//                                                     <span
//                                                         style={{
//                                                             fontWeight: 800,
//                                                             color: "#0F172A",
//                                                             fontSize: "0.85rem",
//                                                             textAlign: "right",
//                                                             whiteSpace: "nowrap",
//                                                         }}
//                                                     >
//                                                         {currency || "AED"} {Number(item?.value || 0).toLocaleString()}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         );
//                                     }}
//                                 />

//                                 <Bar
//                                     dataKey="value"
//                                     name="Working Capital"
//                                     radius={[6, 6, 0, 0]}
//                                     maxBarSize={54}
//                                     isAnimationActive={true}
//                                     animationDuration={800}
//                                     animationEasing="ease-in-out"
//                                     fill="#4338CA"
//                                 >
//                                     {chartData.map((entry, index) => (
//                                         <Cell
//                                             key={`wc-subdivision-cell-${index}`}
//                                             fill={colors[index % colors.length]}
//                                             opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.72}
//                                         />
//                                     ))}
//                                     <LabelList
//                                         dataKey="value"
//                                         position="top"
//                                         offset={8}
//                                         formatter={formatAxisValue}
//                                         style={{
//                                             fill: "#1E293B",
//                                             fontSize: 11,
//                                             fontWeight: 700,
//                                         }}
//                                     />
//                                 </Bar>
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </div>
//                 )}
//             </div>
//         );
//     }

//     /* ============================================================
//        PARENT DIVISION — keep the existing Payables-style horizontal
//        exposure presentation. This branch is intentionally unchanged
//        in behavior and remains the second chart on the dashboard.
//     ============================================================ */

//     const barPalette = [
//         "#F43F5E",
//         "#F97316",
//         "#06B6D4",
//         "#65C800",
//         "#EC3FA5",
//         "#94A3B8",
//     ];

//     const maxValue = Math.max(
//         ...visibleRows.map((row) => Math.abs(toNumber(row.value) ?? 0)),
//         1
//     );

//     const rowHeight = 47;
//     const chartHeight = Math.max(visibleRows.length * rowHeight + 22, 118);
//     const parentTooltipWidth = 232;
//     const parentTooltipHeight = 92;
//     const axisTickCount = 5;

//     return (
//         <div
//             className="wc-panel-animate wc-chart-enter wc-hierarchy-exposure-panel"
//             style={{
//                 ...styles.panel,
//                 position: "relative",
//                 overflow: "visible",
//                 padding: "12px 12px 10px",
//             }}
//         >
//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                     gap: 8,
//                 }}
//             >
//                 <div style={{ minWidth: 0 }}>
//                     <h3
//                         style={{
//                             ...styles.panelTitle,
//                             marginBottom: 2,
//                         }}
//                     >
//                         {title}
//                     </h3>

//                     <div
//                         style={{
//                             fontSize: "0.68rem",
//                             color: "#64748B",
//                             fontWeight: 500,
//                             marginTop: 2,
//                             lineHeight: 1.35,
//                         }}
//                     >
//                         Working Capital exposure across {levelLabel.toLowerCase()}s
//                     </div>
//                 </div>

//                 <ActionMenu
//                     items={[
//                         {
//                             key: "view-all",
//                             label: "🔎 View All",
//                             onClick: onViewAll,
//                         },
//                         {
//                             key: "export-excel",
//                             label: "📊 Export Excel",
//                             onClick: onExportExcel,
//                             disabled: typeof onExportExcel !== "function",
//                         },
//                         {
//                             key: "export-pdf",
//                             label: "📄 Export PDF",
//                             onClick: onExportPdf,
//                             disabled: typeof onExportPdf !== "function",
//                         },
//                     ]}
//                 />
//             </div>

//             {!visibleRows.length ? (
//                 <div
//                     style={{
//                         minHeight: 210,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         color: "#98A2B3",
//                         fontSize: "10px",
//                     }}
//                 >
//                     No {levelLabel} trend data available.
//                 </div>
//             ) : (
//                 <div
//                     style={{
//                         position: "relative",
//                         marginTop: 8,
//                         minHeight: chartHeight,
//                         paddingTop: 1,
//                     }}
//                     onMouseLeave={() => {
//                         setParentHoveredIndex(null);
//                         setParentTooltipPosition(null);
//                     }}
//                 >
//                     {visibleRows.map((row, index) => {
//                         const value = toNumber(row.value);
//                         const barColor = barPalette[index % barPalette.length];
//                         const percentage =
//                             maxValue > 0
//                                 ? Math.max(
//                                     0,
//                                     Math.min(
//                                         100,
//                                         (Math.abs(value ?? 0) / maxValue) * 100
//                                     )
//                                 )
//                                 : 0;

//                         const isHovered = parentHoveredIndex === index;

//                         return (
//                             <div
//                                 key={`${row.name}-${row.period}-${index}`}
//                                 style={{
//                                     display: "grid",
//                                     gridTemplateColumns: "minmax(0, 1fr) 76px",
//                                     alignItems: "center",
//                                     columnGap: 8,
//                                     minHeight: 39,
//                                     marginBottom:
//                                         index === visibleRows.length - 1 ? 0 : 4,
//                                     position: "relative",
//                                     cursor: "pointer",
//                                     padding: "2px 0",
//                                     borderRadius: 8,
//                                     background: isHovered ? "rgba(248,250,252,.92)" : "transparent",
//                                     transition: "background .16s ease",
//                                 }}
//                                 onMouseEnter={(event) => {
//                                     setParentHoveredIndex(index);
//                                     setParentTooltipPosition({
//                                         x: event.clientX,
//                                         y: event.clientY,
//                                     });
//                                 }}
//                                 onMouseMove={(event) => {
//                                     setParentTooltipPosition({
//                                         x: event.clientX,
//                                         y: event.clientY,
//                                     });
//                                 }}
//                             >
//                                 <div style={{ minWidth: 0 }}>
//                                     <div
//                                         style={{
//                                             display: "flex",
//                                             alignItems: "center",
//                                             justifyContent: "space-between",
//                                             gap: 8,
//                                             marginBottom: 6,
//                                         }}
//                                     >
//                                         <span
//                                             title={String(row.name)}
//                                             style={{
//                                                 minWidth: 0,
//                                                 color: isHovered
//                                                     ? "#1E3A8A"
//                                                     : "#334155",
//                                                 fontSize: "0.72rem",
//                                                 lineHeight: 1.15,
//                                                 fontWeight: 700,
//                                                 whiteSpace: "nowrap",
//                                                 overflow: "hidden",
//                                                 textOverflow: "ellipsis",
//                                                 transition: "color .16s ease",
//                                             }}
//                                         >
//                                             {row.name}
//                                         </span>
//                                     </div>

//                                     <div
//                                         style={{
//                                             height: 10,
//                                             width: "100%",
//                                             background: "#EDF2F7",
//                                             borderRadius: 999,
//                                             overflow: "hidden",
//                                         }}
//                                     >
//                                         <div
//                                             style={{
//                                                 width: `${percentage}%`,
//                                                 height: "100%",
//                                                 minWidth:
//                                                     value !== null && value !== 0
//                                                         ? "3px"
//                                                         : 0,
//                                                 background: barColor,
//                                                 borderRadius: 999,
//                                                 transformOrigin:
//                                                     "left center",
//                                                 animation: `wcBarGrow .62s cubic-bezier(.4,0,.2,1) ${index * 55}ms both`,
//                                                 opacity:
//                                                     parentHoveredIndex === null ||
//                                                         isHovered
//                                                         ? 1
//                                                         : 0.72,
//                                                 boxShadow: isHovered
//                                                     ? `0 2px 8px ${barColor}55`
//                                                     : "none",
//                                                 transform:
//                                                     isHovered ? "scaleY(1.18)" : "scaleY(1)",
//                                                 transition:
//                                                     "width .35s ease, opacity .18s ease, box-shadow .18s ease, transform .18s ease",
//                                             }}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div
//                                     style={{
//                                         textAlign: "right",
//                                         color: isHovered
//                                             ? "#1E3A8A"
//                                             : "#1E293B",
//                                         fontSize: "0.76rem",
//                                         lineHeight: 1.1,
//                                         fontWeight: 800,
//                                         whiteSpace: "nowrap",
//                                         transition: "color .16s ease",
//                                     }}
//                                 >
//                                     {formatAmount(value, "", true)}
//                                 </div>

//                                 {isHovered && typeof document !== "undefined" && createPortal(
//                                     <div
//                                         style={{
//                                             position: "fixed",
//                                             zIndex: 5000,
//                                             left: parentTooltipPosition
//                                                 ? Math.min(
//                                                     Math.max(
//                                                         parentTooltipPosition.x + 16,
//                                                         8
//                                                     ),
//                                                     Math.max(
//                                                         8,
//                                                         window.innerWidth -
//                                                         parentTooltipWidth -
//                                                         8
//                                                     )
//                                                 )
//                                                 : 8,
//                                             top: parentTooltipPosition
//                                                 ? (
//                                                     parentTooltipPosition.y +
//                                                         16 +
//                                                         parentTooltipHeight >
//                                                         window.innerHeight - 8
//                                                         ? Math.max(
//                                                             8,
//                                                             parentTooltipPosition.y -
//                                                             parentTooltipHeight -
//                                                             16
//                                                         )
//                                                         : Math.min(
//                                                             parentTooltipPosition.y + 16,
//                                                             Math.max(
//                                                                 8,
//                                                                 window.innerHeight -
//                                                                 parentTooltipHeight -
//                                                                 8
//                                                             )
//                                                         )
//                                                 )
//                                                 : 8,
//                                             width: parentTooltipWidth,
//                                             boxSizing: "border-box",
//                                             padding: "12px 16px",
//                                             borderRadius: 10,
//                                             background: "#FFFFFF",
//                                             border: `1px solid ${C.border}`,
//                                             boxShadow:
//                                                 "0 10px 28px rgba(15,23,42,.16)",
//                                             animation:
//                                                 "wcTooltipIn .14s ease-out forwards",
//                                             pointerEvents: "none",
//                                             fontFamily:
//                                                 "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//                                         }}
//                                     >
//                                         <div
//                                             style={{
//                                                 fontWeight: 800,
//                                                 color: "#1E293B",
//                                                 marginBottom: 8,
//                                                 fontSize: "0.85rem",
//                                                 lineHeight: 1.25,
//                                             }}
//                                         >
//                                             {row.name}
//                                         </div>

//                                         <div
//                                             style={{
//                                                 display: "grid",
//                                                 gridTemplateColumns: "auto 1fr",
//                                                 gap: "6px 16px",
//                                                 alignItems: "center",
//                                             }}
//                                         >
//                                             <span
//                                                 style={{
//                                                     color: "#64748B",
//                                                     fontSize: "0.75rem",
//                                                     fontWeight: 500,
//                                                 }}
//                                             >
//                                                 <span
//                                                     style={{
//                                                         display: "inline-block",
//                                                         width: 8,
//                                                         height: 8,
//                                                         borderRadius: 2,
//                                                         background: barColor,
//                                                         marginRight: 6,
//                                                     }}
//                                                 />
//                                                 Working Capital:
//                                             </span>

//                                             <span
//                                                 style={{
//                                                     fontWeight: 800,
//                                                     color: "#0F172A",
//                                                     fontSize: "0.85rem",
//                                                     textAlign: "right",
//                                                     whiteSpace: "nowrap",
//                                                 }}
//                                             >
//                                                 {formatAmount(
//                                                     value,
//                                                     currency,
//                                                     false
//                                                 )}
//                                             </span>
//                                         </div>
//                                     </div>,
//                                     document.body
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </div>

//             )}

//             {visibleRows.length > 0 && (
//                 <div
//                     style={{
//                         marginTop: 8,
//                         padding: "7px 76px 0 0",
//                         borderTop: "1px solid #E2E8F0",
//                         display: "grid",
//                         gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
//                         alignItems: "start",
//                         gap: 0,
//                     }}
//                 >
//                     {Array.from({ length: 5 }, (_, tickIndex) => {
//                         const fraction = tickIndex / 4;
//                         const axisValue = maxValue * fraction;

//                         return (
//                             <div
//                                 key={`parent-x-axis-${tickIndex}`}
//                                 style={{
//                                     position: "relative",
//                                     textAlign:
//                                         tickIndex === 0
//                                             ? "left"
//                                             : tickIndex === 4
//                                                 ? "right"
//                                                 : "center",
//                                     color: "#94A3B8",
//                                     fontSize: "0.58rem",
//                                     fontWeight: 600,
//                                     lineHeight: 1.2,
//                                 }}
//                             >
//                                 <span
//                                     style={{
//                                         position: "absolute",
//                                         top: -8,
//                                         left:
//                                             tickIndex === 0
//                                                 ? 0
//                                                 : tickIndex === 4
//                                                     ? "auto"
//                                                     : "50%",
//                                         right:
//                                             tickIndex === 4 ? 0 : "auto",
//                                         width: 1,
//                                         height: 5,
//                                         background: "#CBD5E1",
//                                         transform:
//                                             tickIndex === 0 || tickIndex === 4
//                                                 ? "none"
//                                                 : "translateX(-50%)",
//                                     }}
//                                 />
//                                 {formatAmount(axisValue, "", true)}
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}
//         </div>
//     );
// }

// function TradeWorkingCapitalTrendPanel({
//     data,
//     currency,
//     onViewAll,
// }) {
//     return (
//         <SimpleTrendChart
//             data={data}
//             currency={currency}
//             title={`Trade Working Capital Trend (${currency})`}
//             valueLabel=""
//             metricLabel="Trade Working Capital"
//             nullText="No aligned Receivables / Inventory / Payables observations are available."
//             onViewAll={onViewAll}
//         />
//     );
// }

// function AssetsVsLiabilitiesPanel({
//     data,
//     currency,
//     period,
//     periodEnd,
//     fallbackAssets,
//     fallbackLiabilities,
//     onViewAll,
// }) {
//     const raw = data.length
//         ? data
//         : [
//             {
//                 label: "Current Assets",
//                 previous: null,
//                 current: fallbackAssets,
//             },
//             {
//                 label: "Current Liabilities",
//                 previous: null,
//                 current: fallbackLiabilities,
//             },
//         ];

//     const rows = raw.map((row) => ({
//         label:
//             getValue(
//                 row,
//                 "label",
//                 "category",
//                 "name",
//                 "particular"
//             ) ?? "—",
//         previous: toNumber(
//             getValue(
//                 row,
//                 "previous",
//                 "previous_assets",
//                 "previous_liabilities",
//                 "prior"
//             )
//         ),
//         current: toNumber(
//             getValue(
//                 row,
//                 "current",
//                 "current_assets",
//                 "current_liabilities",
//                 "value"
//             )
//         ),
//     }));

//     const values = rows
//         .flatMap((row) => [row.previous, row.current])
//         .filter((v) => v !== null);

//     const maxValue = Math.max(...values, 1);
//     const width = 640;
//     const height = 245;
//     const left = 46;
//     const right = 18;
//     const top = 30;
//     const bottom = 52;
//     const plotHeight = height - top - bottom;
//     const groupSlot =
//         (width - left - right) /
//         Math.max(rows.length, 1);
//     const barWidth = Math.min(
//         30,
//         groupSlot * 0.25
//     );

//     const [hovered, setHovered] = useState(null);

//     const hoveredRow =
//         hovered?.rowIndex !== undefined
//             ? rows[hovered.rowIndex]
//             : null;

//     return (
//         <div
//             className="wc-panel-animate"
//             style={{
//                 ...styles.panel,
//                 position: "relative",
//                 overflow: "visible",
//             }}
//         >
//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     gap: 8,
//                 }}
//             >
//                 <div>
//                     <h3
//                         style={{
//                             ...styles.panelTitle,
//                             marginBottom: 2,
//                         }}
//                     >
//                         Current Assets vs Current Liabilities ({currency})
//                     </h3>
//                     <div
//                         style={{
//                             fontSize: "0.68rem",
//                             color: C.muted,
//                             marginTop: 2,
//                             fontWeight: 500,
//                         }}
//                     >
//                         {currency} — Balance Sheet Period: {period || "—"}
//                         {periodEnd
//                             ? ` (${formatDate(periodEnd)})`
//                             : ""}
//                     </div>
//                 </div>

//                 <ActionMenu
//                     items={[
//                         {
//                             key: "view-all",
//                             label: "🔎 View All",
//                             onClick: onViewAll,
//                         },
//                         {
//                             key: "excel",
//                             label: "📊 Export Excel",
//                             onClick: () => exportAssetsVsLiabilitiesToExcel(rows, currency),
//                         },
//                         {
//                             key: "pdf",
//                             label: "📄 Export PDF",
//                             onClick: () => exportAssetsVsLiabilitiesToPdf(rows, currency, period),
//                         },
//                     ]}
//                 />
//             </div>

//             <svg
//                 viewBox={`0 0 ${width} ${height}`}
//                 width="100%"
//                 style={{
//                     display: "block",
//                     marginTop: "3px",
//                     overflow: "visible",
//                 }}
//                 onMouseLeave={() => setHovered(null)}
//             >
//                 <defs>
//                     <linearGradient
//                         id="wc-avl-previous"
//                         x1="0"
//                         y1="0"
//                         x2="0"
//                         y2="1"
//                     >
//                         <stop offset="0%" stopColor="#818CF8" />
//                         <stop offset="100%" stopColor="#4F46E5" />
//                     </linearGradient>
//                     <linearGradient
//                         id="wc-avl-current"
//                         x1="0"
//                         y1="0"
//                         x2="0"
//                         y2="1"
//                     >
//                         <stop offset="0%" stopColor="#34D399" />
//                         <stop offset="100%" stopColor="#059669" />
//                     </linearGradient>
//                 </defs>

//                 {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
//                     const yy =
//                         height -
//                         bottom -
//                         fraction * plotHeight;

//                     return (
//                         <g key={fraction}>
//                             <line
//                                 x1={left}
//                                 x2={width - right}
//                                 y1={yy}
//                                 y2={yy}
//                                 stroke="#E2E8F0"
//                                 strokeDasharray={
//                                     fraction === 0
//                                         ? "0"
//                                         : "3 4"
//                                 }
//                             />
//                             <text
//                                 x={left - 6}
//                                 y={yy + 3}
//                                 textAnchor="end"
//                                 fontSize="10"
//                                 fontWeight="600"
//                                 fill="#94A3B8"
//                             >
//                                 {formatAmount(
//                                     maxValue * fraction,
//                                     "",
//                                     true
//                                 )}
//                             </text>
//                         </g>
//                     );
//                 })}

//                 {rows.map((row, index) => {
//                     const center =
//                         left +
//                         groupSlot * index +
//                         groupSlot / 2;
//                     const previousHeight =
//                         row.previous === null
//                             ? 0
//                             : (row.previous / maxValue) *
//                             plotHeight;
//                     const currentHeight =
//                         row.current === null
//                             ? 0
//                             : (row.current / maxValue) *
//                             plotHeight;
//                     const previousX =
//                         center - barWidth - 3;
//                     const currentX = center + 3;
//                     const previousY =
//                         height - bottom - previousHeight;
//                     const currentY =
//                         height - bottom - currentHeight;
//                     const isHovered =
//                         hovered?.rowIndex === index;

//                     return (
//                         <g key={`${row.label}-${index}`}>
//                             {row.previous !== null && (
//                                 <g
//                                     onMouseEnter={() =>
//                                         setHovered({
//                                             rowIndex: index,
//                                             series: "previous",
//                                         })
//                                     }
//                                     style={{
//                                         cursor: "pointer",
//                                     }}
//                                 >
//                                     <rect
//                                         x={previousX}
//                                         y={previousY}
//                                         width={barWidth}
//                                         height={previousHeight}
//                                         rx="5"
//                                         fill="url(#wc-avl-previous)"
//                                         opacity={
//                                             hovered === null ||
//                                                 isHovered
//                                                 ? 1
//                                                 : 0.62
//                                         }
//                                         style={{
//                                             transition:
//                                                 "opacity .18s ease, filter .18s ease, transform .18s ease",
//                                             transformOrigin: `${previousX + barWidth / 2}px ${height - bottom}px`,
//                                             transform:
//                                                 isHovered
//                                                     ? "translateY(-2px)"
//                                                     : "translateY(0)",
//                                             filter:
//                                                 isHovered
//                                                     ? "drop-shadow(0 6px 7px rgba(79,70,229,.25))"
//                                                     : "none",
//                                         }}
//                                     />
//                                     <text
//                                         x={
//                                             previousX +
//                                             barWidth / 2
//                                         }
//                                         y={Math.max(
//                                             top + 10,
//                                             previousY - 6
//                                         )}
//                                         textAnchor="middle"
//                                         fontSize="11"
//                                         fontWeight="700"
//                                         fill="#334155"
//                                     >
//                                         {formatAmount(
//                                             row.previous,
//                                             "",
//                                             true
//                                         )}
//                                     </text>
//                                     {hovered?.rowIndex === index && hovered?.series === "previous" && (
//                                         <g pointerEvents="none" style={{ filter: "drop-shadow(0 5px 12px rgba(15,23,42,.14))", animation: "wcTooltipIn .14s ease-out forwards" }}>
//                                             <rect x={Math.max(4, Math.min(width - 174, previousX + barWidth / 2 - 87))} y={Math.max(6, previousY - 72)} width="174" height="56" rx="9" fill="#FFFFFF" stroke="#C7D2FE" />
//                                             <rect x={Math.max(4, Math.min(width - 174, previousX + barWidth / 2 - 87)) + 10} y={Math.max(6, previousY - 72) + 12} width="7" height="7" rx="1.5" fill="#6366F1" />
//                                             <text x={Math.max(4, Math.min(width - 174, previousX + barWidth / 2 - 87)) + 23} y={Math.max(6, previousY - 72) + 19} fontSize="11" fontWeight="700" fill="#334155">
//                                                 {row.label} — Previous
//                                             </text>
//                                             <text x={Math.max(4, Math.min(width - 174, previousX + barWidth / 2 - 87)) + 10} y={Math.max(6, previousY - 72) + 43} fontSize="13" fontWeight="800" fill="#4F46E5">
//                                                 {currency ? `${currency} ${Number(row.previous).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : Number(row.previous).toLocaleString("en-US", { maximumFractionDigits: 0 })}
//                                             </text>
//                                         </g>
//                                     )}
//                                 </g>
//                             )}

//                             {row.current !== null && (
//                                 <g
//                                     onMouseEnter={() =>
//                                         setHovered({
//                                             rowIndex: index,
//                                             series: "current",
//                                         })
//                                     }
//                                     style={{
//                                         cursor: "pointer",
//                                     }}
//                                 >
//                                     <rect
//                                         x={currentX}
//                                         y={currentY}
//                                         width={barWidth}
//                                         height={currentHeight}
//                                         rx="5"
//                                         fill="url(#wc-avl-current)"
//                                         opacity={
//                                             hovered === null ||
//                                                 isHovered
//                                                 ? 1
//                                                 : 0.62
//                                         }
//                                         style={{
//                                             transition:
//                                                 "opacity .18s ease, filter .18s ease, transform .18s ease",
//                                             transformOrigin: `${currentX + barWidth / 2}px ${height - bottom}px`,
//                                             transform:
//                                                 isHovered
//                                                     ? "translateY(-2px)"
//                                                     : "translateY(0)",
//                                             filter:
//                                                 isHovered
//                                                     ? "drop-shadow(0 6px 7px rgba(5,150,105,.25))"
//                                                     : "none",
//                                         }}
//                                     />
//                                     <text
//                                         x={
//                                             currentX +
//                                             barWidth / 2
//                                         }
//                                         y={Math.max(
//                                             top + 10,
//                                             currentY - 6
//                                         )}
//                                         textAnchor="middle"
//                                         fontSize="11"
//                                         fontWeight="700"
//                                         fill="#334155"
//                                     >
//                                         {formatAmount(
//                                             row.current,
//                                             "",
//                                             true
//                                         )}
//                                     </text>
//                                     {hovered?.rowIndex === index && hovered?.series === "current" && (
//                                         <g pointerEvents="none" style={{ filter: "drop-shadow(0 5px 12px rgba(15,23,42,.14))", animation: "wcTooltipIn .14s ease-out forwards" }}>
//                                             <rect x={Math.max(4, Math.min(width - 174, currentX + barWidth / 2 - 87))} y={Math.max(6, currentY - 72)} width="174" height="56" rx="9" fill="#FFFFFF" stroke="#A7F3D0" />
//                                             <rect x={Math.max(4, Math.min(width - 174, currentX + barWidth / 2 - 87)) + 10} y={Math.max(6, currentY - 72) + 12} width="7" height="7" rx="1.5" fill="#059669" />
//                                             <text x={Math.max(4, Math.min(width - 174, currentX + barWidth / 2 - 87)) + 23} y={Math.max(6, currentY - 72) + 19} fontSize="11" fontWeight="700" fill="#334155">
//                                                 {row.label} — Current
//                                             </text>
//                                             <text x={Math.max(4, Math.min(width - 174, currentX + barWidth / 2 - 87)) + 10} y={Math.max(6, currentY - 72) + 43} fontSize="13" fontWeight="800" fill="#047857">
//                                                 {currency ? `${currency} ${Number(row.current).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : Number(row.current).toLocaleString("en-US", { maximumFractionDigits: 0 })}
//                                             </text>
//                                         </g>
//                                     )}
//                                 </g>
//                             )}

//                             <text
//                                 x={center}
//                                 y={height - 18}
//                                 textAnchor="middle"
//                                 fontSize="11"
//                                 fontWeight="600"
//                                 fill="#64748B"
//                             >
//                                 {row.label}
//                             </text>
//                         </g>
//                     );
//                 })}

//                 <g
//                     transform={`translate(${width - 170}, 9)`}
//                 >
//                     <rect
//                         x="0"
//                         y="0"
//                         width="8"
//                         height="8"
//                         rx="2"
//                         fill="#6366F1"
//                     />
//                     <text
//                         x="12"
//                         y="8"
//                         fontSize="8"
//                         fill="#475467"
//                     >
//                         Previous
//                     </text>
//                     <rect
//                         x="65"
//                         y="0"
//                         width="8"
//                         height="8"
//                         rx="2"
//                         fill="#39A96B"
//                     />
//                     <text
//                         x="77"
//                         y="8"
//                         fontSize="8"
//                         fill="#475467"
//                     >
//                         Current
//                     </text>
//                 </g>
//             </svg>
//         </div>
//     );
// }
// function CccTrendMini({ data }) {
//     const rows = Array.isArray(data)
//         ? data.slice(-6)
//         : [];

//     const [hoveredPoint, setHoveredPoint] = useState(null);

//     const series = [
//         {
//             key: "dso",
//             label: "DSO",
//             color: "#4F46E5",
//         },
//         {
//             key: "dio",
//             label: "DIO",
//             color: "#10B981",
//         },
//         {
//             key: "dpo",
//             label: "DPO",
//             color: "#F59E0B",
//         },
//         {
//             key: "ccc",
//             label: "CCC",
//             color: "#EC4899",
//         },
//     ];

//     if (!rows.length) {
//         return (
//             <div
//                 style={{
//                     color: "#98A2B3",
//                     fontSize: "10px",
//                     padding: "25px 0",
//                     textAlign: "center",
//                 }}
//             >
//                 No CCC history available.
//             </div>
//         );
//     }

//     const hasAnyValue = series.some((item) =>
//         rows.some(
//             (row) =>
//                 toNumber(row?.[item.key]) !== null
//         )
//     );

//     if (!hasAnyValue) {
//         return (
//             <div
//                 style={{
//                     color: "#98A2B3",
//                     fontSize: "10px",
//                     padding: "25px 0",
//                     textAlign: "center",
//                 }}
//             >
//                 No CCC history available.
//             </div>
//         );
//     }

//     const width = 620;
//     const height = 250;

//     const margin = {
//         top: 30,
//         right: 18,
//         bottom: 48,
//         left: 42,
//     };

//     const chartWidth =
//         width - margin.left - margin.right;

//     const chartHeight =
//         height - margin.top - margin.bottom;

//     /*
//      * Only real backend numeric values participate
//      * in the Y-axis calculation.
//      *
//      * null values are deliberately ignored.
//      * We do NOT calculate DIO or CCC on the frontend.
//      */
//     const numericValues = [];

//     rows.forEach((row) => {
//         series.forEach((item) => {
//             const value = toNumber(
//                 row?.[item.key]
//             );

//             if (value !== null) {
//                 numericValues.push(value);
//             }
//         });
//     });

//     if (!numericValues.length) {
//         return (
//             <div
//                 style={{
//                     color: "#98A2B3",
//                     fontSize: "10px",
//                     padding: "25px 0",
//                     textAlign: "center",
//                 }}
//             >
//                 No CCC history available.
//             </div>
//         );
//     }

//     const minValue = Math.min(
//         0,
//         ...numericValues
//     );

//     const maxValue = Math.max(
//         ...numericValues
//     );

//     const range =
//         maxValue - minValue || 1;

//     const padding =
//         Math.max(range * 0.12, 5);

//     const yMin =
//         Math.min(0, minValue - padding);

//     const yMax =
//         maxValue + padding;

//     const yRange =
//         yMax - yMin || 1;

//     const xStep =
//         rows.length > 1
//             ? chartWidth / (rows.length - 1)
//             : 0;

//     const getX = (index) =>
//         margin.left +
//         (rows.length === 1
//             ? chartWidth / 2
//             : index * xStep);

//     const getY = (value) =>
//         margin.top +
//         chartHeight -
//         ((value - yMin) / yRange) *
//         chartHeight;

//     /*
//      * Creates line segments only between
//      * consecutive valid backend values.
//      *
//      * Example:
//      * 334 -> null -> 300
//      *
//      * will NOT draw a fake line across null.
//      */
//     const buildSegments = (key) => {
//         const segments = [];
//         let current = [];

//         rows.forEach((row, index) => {
//             const value = toNumber(
//                 row?.[key]
//             );

//             if (value === null) {
//                 if (current.length) {
//                     segments.push(current);
//                     current = [];
//                 }

//                 return;
//             }

//             current.push({
//                 index,
//                 value,
//                 x: getX(index),
//                 y: getY(value),
//             });
//         });

//         if (current.length) {
//             segments.push(current);
//         }

//         return segments;
//     };

//     const formatPeriod = (row) => {
//         const monthNames = [
//             "Jan",
//             "Feb",
//             "Mar",
//             "Apr",
//             "May",
//             "Jun",
//             "Jul",
//             "Aug",
//             "Sep",
//             "Oct",
//             "Nov",
//             "Dec",
//         ];

//         const rawPeriod = String(row?.period ?? "").trim();

//         // Backend monthly periods such as 2026-06 are displayed as 2026-Jun.
//         if (/^\d{4}-\d{1,2}$/.test(rawPeriod)) {
//             const [year, month] = rawPeriod.split("-");
//             const monthIndex = Number(month) - 1;

//             if (monthIndex >= 0 && monthIndex < 12) {
//                 return `${year}-${monthNames[monthIndex]}`;
//             }
//         }

//         if (rawPeriod) {
//             return rawPeriod;
//         }

//         if (
//             row?.year !== undefined &&
//             row?.month !== undefined
//         ) {
//             const monthIndex = Number(row.month) - 1;

//             if (monthIndex >= 0 && monthIndex < 12) {
//                 return `${row.year}-${monthNames[monthIndex]}`;
//             }

//             return `${row.year}-${String(row.month).padStart(2, "0")}`;
//         }

//         return "—";
//     };

//     const formatValue = (value) =>
//         value === null
//             ? "—"
//             : `${value.toFixed(2)} Days`;

//     /*
//      * Five horizontal grid levels.
//      */
//     const gridCount = 5;

//     const gridLines = Array.from(
//         { length: gridCount },
//         (_, index) => {
//             const ratio =
//                 index /
//                 (gridCount - 1);

//             const value =
//                 yMax -
//                 ratio * yRange;

//             return {
//                 value,
//                 y: getY(value),
//             };
//         }
//     );

//     return (
//         <div
//             style={{
//                 marginTop: "8px",
//                 width: "100%",
//                 overflowX: "auto",
//             }}
//         >
//             {/* Legend */}
//             <div
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     flexWrap: "wrap",
//                     gap: "12px",
//                     marginBottom: "5px",
//                 }}
//             >
//                 {series.map((item) => {
//                     const hasValue =
//                         rows.some(
//                             (row) =>
//                                 toNumber(
//                                     row?.[
//                                     item.key
//                                     ]
//                                 ) !== null
//                         );

//                     return (
//                         <div
//                             key={item.key}
//                             style={{
//                                 display:
//                                     "flex",
//                                 alignItems:
//                                     "center",
//                                 gap: "5px",
//                                 fontSize:
//                                     "9px",
//                                 color:
//                                     hasValue
//                                         ? "#475467"
//                                         : "#98A2B3",
//                                 fontWeight: 600,
//                             }}
//                         >
//                             <span
//                                 style={{
//                                     width:
//                                         "7px",
//                                     height:
//                                         "7px",
//                                     borderRadius:
//                                         "50%",
//                                     background:
//                                         hasValue
//                                             ? item.color
//                                             : "#CBD5E1",
//                                     display:
//                                         "inline-block",
//                                 }}
//                             />

//                             {item.label}

//                             {!hasValue && (
//                                 <span
//                                     style={{
//                                         fontWeight:
//                                             400,
//                                         fontSize:
//                                             "8px",
//                                     }}
//                                 >
//                                     —
//                                 </span>
//                             )}
//                         </div>
//                     );
//                 })}
//             </div>

//             <svg
//                 viewBox={`0 0 ${width} ${height}`}
//                 width="100%"
//                 height="250"
//                 role="img"
//                 aria-label="Cash Conversion Cycle trend showing DSO, DIO, DPO and CCC"
//                 style={{
//                     display: "block",
//                     minWidth: "520px",
//                     overflow: "visible",
//                 }}
//                 onMouseLeave={() => setHoveredPoint(null)}
//             >
//                 {/* Y-axis grid */}
//                 {gridLines.map(
//                     (grid, index) => (
//                         <g
//                             key={`grid-${index}`}
//                         >
//                             <line
//                                 x1={
//                                     margin.left
//                                 }
//                                 x2={
//                                     width -
//                                     margin.right
//                                 }
//                                 y1={grid.y}
//                                 y2={grid.y}
//                                 stroke="#E2E8F0"
//                                 strokeWidth="1"
//                                 strokeDasharray="3 4"
//                             />

//                             <text
//                                 x={
//                                     margin.left -
//                                     7
//                                 }
//                                 y={
//                                     grid.y +
//                                     3
//                                 }
//                                 textAnchor="end"
//                                 fontSize="8"
//                                 fill="#94A3B8"
//                             >
//                                 {Math.round(
//                                     grid.value
//                                 )}
//                             </text>
//                         </g>
//                     )
//                 )}

//                 {/* X-axis */}
//                 <line
//                     x1={margin.left}
//                     x2={
//                         width -
//                         margin.right
//                     }
//                     y1={
//                         margin.top +
//                         chartHeight
//                     }
//                     y2={
//                         margin.top +
//                         chartHeight
//                     }
//                     stroke="#CBD5E1"
//                     strokeWidth="1"
//                 />

//                 {/* Series */}
//                 {series.map((item) => {
//                     const segments =
//                         buildSegments(
//                             item.key
//                         );

//                     return (
//                         <g
//                             key={item.key}
//                         >
//                             {segments.map(
//                                 (
//                                     segment,
//                                     segmentIndex
//                                 ) => {
//                                     const points =
//                                         segment
//                                             .map(
//                                                 (
//                                                     point
//                                                 ) =>
//                                                     `${point.x},${point.y}`
//                                             )
//                                             .join(
//                                                 " "
//                                             );

//                                     return (
//                                         <g
//                                             key={`${item.key}-segment-${segmentIndex}`}
//                                         >
//                                             {/* Actual line */}
//                                             {segment.length >
//                                                 1 && (
//                                                     <>
//                                                         <polyline
//                                                             points={
//                                                                 points
//                                                             }
//                                                             fill="none"
//                                                             stroke={
//                                                                 item.color
//                                                             }
//                                                             strokeWidth="2.2"
//                                                             strokeLinecap="round"
//                                                             strokeLinejoin="round"
//                                                         />

//                                                         {/* Subtle live-flow highlight travelling along this series. */}
//                                                         <polyline
//                                                             points={
//                                                                 points
//                                                             }
//                                                             fill="none"
//                                                             stroke="#FFFFFF"
//                                                             strokeWidth="1.6"
//                                                             strokeLinecap="round"
//                                                             strokeLinejoin="round"
//                                                             strokeDasharray="28 872"
//                                                             strokeDashoffset="0"
//                                                             opacity="0.5"
//                                                             pointerEvents="none"
//                                                             style={{
//                                                                 animation:
//                                                                     "wcTrendLiveFlow 3.2s linear infinite",
//                                                                 animationDelay: `${segmentIndex * 180}ms`,
//                                                             }}
//                                                         />
//                                                     </>
//                                                 )}

//                                             {/* Data points */}
//                                             {segment.map(
//                                                 (
//                                                     point
//                                                 ) => {
//                                                     const row =
//                                                         rows[
//                                                         point.index
//                                                         ];

//                                                     return (
//                                                         <g
//                                                             key={`${item.key}-${point.index}`}
//                                                         >
//                                                             <circle
//                                                                 cx={
//                                                                     point.x
//                                                                 }
//                                                                 cy={
//                                                                     point.y
//                                                                 }
//                                                                 r={
//                                                                     hoveredPoint?.key === item.key &&
//                                                                         hoveredPoint?.index === point.index
//                                                                         ? "5.5"
//                                                                         : "3.5"
//                                                                 }
//                                                                 fill="#FFFFFF"
//                                                                 stroke={
//                                                                     item.color
//                                                                 }
//                                                                 strokeWidth={
//                                                                     hoveredPoint?.key === item.key &&
//                                                                         hoveredPoint?.index === point.index
//                                                                         ? "2.5"
//                                                                         : "2"
//                                                                 }
//                                                                 style={{
//                                                                     cursor: "pointer",
//                                                                     transition:
//                                                                         "r .14s ease, stroke-width .14s ease",
//                                                                 }}
//                                                                 onMouseEnter={() =>
//                                                                     setHoveredPoint({
//                                                                         key: item.key,
//                                                                         label: item.label,
//                                                                         index: point.index,
//                                                                         value: point.value,
//                                                                         x: point.x,
//                                                                         y: point.y,
//                                                                     })
//                                                                 }
//                                                                 onMouseLeave={() =>
//                                                                     setHoveredPoint(null)
//                                                                 }
//                                                             />
//                                                         </g>
//                                                     );
//                                                 }
//                                             )}
//                                         </g>
//                                     );
//                                 }
//                             )}
//                         </g>
//                     );
//                 })}

//                 {/* X-axis labels */}
//                 {rows.map(
//                     (row, index) => {
//                         const x =
//                             getX(index);

//                         return (
//                             <text
//                                 key={`period-${index}`}
//                                 x={x}
//                                 y={
//                                     height -
//                                     18
//                                 }
//                                 textAnchor="middle"
//                                 fontSize="8"
//                                 fill="#64748B"
//                             >
//                                 {formatPeriod(
//                                     row
//                                 )}
//                             </text>
//                         );
//                     }
//                 )}

//                 {hoveredPoint && (() => {
//                     const tooltipWidth = 174;
//                     const tooltipHeight = 58;
//                     const tooltipX = Math.min(
//                         Math.max(
//                             hoveredPoint.x - tooltipWidth / 2,
//                             margin.left
//                         ),
//                         width - margin.right - tooltipWidth
//                     );
//                     const tooltipY =
//                         hoveredPoint.y - tooltipHeight - 12 >= margin.top
//                             ? hoveredPoint.y - tooltipHeight - 12
//                             : Math.min(
//                                 height - margin.bottom - tooltipHeight,
//                                 hoveredPoint.y + 12
//                             );

//                     const row = rows[hoveredPoint.index];

//                     return (
//                         <g
//                             pointerEvents="none"
//                             style={{
//                                 filter:
//                                     "drop-shadow(0 6px 14px rgba(15,23,42,.14))",
//                             }}
//                         >
//                             <line
//                                 x1={hoveredPoint.x}
//                                 x2={hoveredPoint.x}
//                                 y1={margin.top}
//                                 y2={margin.top + chartHeight}
//                                 stroke="#94A3B8"
//                                 strokeWidth="1"
//                                 strokeDasharray="3 3"
//                                 opacity="0.55"
//                             />
//                             <rect
//                                 x={tooltipX}
//                                 y={tooltipY}
//                                 width={tooltipWidth}
//                                 height={tooltipHeight}
//                                 rx="8"
//                                 fill="#FFFFFF"
//                                 stroke="#E2E8F0"
//                             />
//                             <text
//                                 x={tooltipX + 11}
//                                 y={tooltipY + 18}
//                                 fontSize="9"
//                                 fontWeight="700"
//                                 fill="#64748B"
//                             >
//                                 {hoveredPoint.label} • {formatPeriod(row)}
//                             </text>
//                             <text
//                                 x={tooltipX + 11}
//                                 y={tooltipY + 40}
//                                 fontSize="13"
//                                 fontWeight="800"
//                                 fill="#0F172A"
//                             >
//                                 {formatValue(hoveredPoint.value)}
//                             </text>
//                         </g>
//                     );
//                 })()}
//             </svg>

//             {/* Backend null-state message */}
//             {rows.some(
//                 (row) =>
//                     toNumber(
//                         row?.dio
//                     ) === null ||
//                     toNumber(
//                         row?.ccc
//                     ) === null
//             ) && (
//                     <div
//                         style={{
//                             marginTop:
//                                 "2px",
//                             textAlign:
//                                 "center",
//                             fontSize:
//                                 "8px",
//                             color:
//                                 "#94A3B8",
//                         }}
//                     >
//                         DIO and CCC require
//                         sufficient inventory
//                         history.
//                     </div>
//                 )}
//         </div>
//     );
// }



import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer, XAxis, YAxis, Legend, Cell, LabelList } from "recharts";
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
    getWorkingCapitalParentDivisionTrend,
    getWorkingCapitalSubDivisionTrend,
    getWorkingCapitalViewAll,
    exportWorkingCapitalViewAllExcel,
    exportWorkingCapitalViewAllPdf,
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

    const raw = String(value).slice(0, 10);
    const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

    if (match) {
        const [, year, month, day] = match;
        return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
    }

    const date = new Date(`${raw}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

function formatMonthLabel(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const raw = String(value);
    const dateMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

    if (dateMatch) {
        const date = new Date(`${dateMatch[1]}-${String(dateMatch[2]).padStart(2, "0")}-01T00:00:00`);
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString("en-US", { month: "short" });
        }
    }

    const numericMonth = Number(raw);
    if (Number.isInteger(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
        return new Date(2000, numericMonth - 1, 1).toLocaleDateString("en-US", { month: "short" });
    }

    const parsed = new Date(`${raw.slice(0, 10)}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("en-US", { month: "short" });
    }

    return raw;
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

    };

    // Balance Sheet Period is intentionally not exposed on this page.
    // Only the supported hierarchy/date filters are returned.
    return apiFilters;
}

/*
 * Always build Reset from the current backend filter options.
 * This keeps Reset consistent across the dashboard and every View All modal.
 */
function getWorkingCapitalDefaultFilters(filterOptions) {
    const options = filterOptions || {};
    return {
        legalGroups: [],
        legalEntities: [],
        parentDivisions: [],
        subDivisions: [],
        asOnDate:
            options.operationalAsOnDate ||
            options.asOnDates?.[0] ||
            "",
    };
}


/*
 * Common Parent Division / Sub-Division View All contract.
 * Only these filters are sent to GET /api/working-capital/view-all:
 *   as_on_date
 *   legal_group_id
 *   legal_entity_id
 *   parent_division_id
 *   subdivision_id
 */
function buildCfoViewAllApiFilters(filters, options) {
    const source = filters || {};

    return {
        legal_group_id: selectedIds(
            options.legalGroups,
            source.legalGroups
        ),
        legal_entity_id: selectedIds(
            options.legalEntities,
            source.legalEntities
        ),
        parent_division_id: selectedIds(
            options.parentDivisions,
            source.parentDivisions
        ),
        subdivision_id: selectedIds(
            options.subDivisions,
            source.subDivisions
        ),
        as_on_date: source.asOnDate || undefined,
    };
}

function normalizeTrendRows(payload) {
    return getRows(payload)
        .map((row) => {
            const asOnDate = getValue(row, "as_on_date", "snapshot_date", "date", "period_end");
            const rawPeriod = getValue(row, "month", "period", "period_name", "label");
            return {
                period: formatMonthLabel(asOnDate ?? rawPeriod),
                asOnDate: asOnDate ?? null,
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
            };
        })
        .filter((row) => row.value !== null);
}

function normalizeTradeTrendRows(payload) {
    return getRows(payload)
        .map((row) => {
            const asOnDate = getValue(row, "as_on_date", "snapshot_date", "date", "period_end");
            const rawPeriod = getValue(row, "month", "period", "period_name", "label");
            return {
                period: formatMonthLabel(asOnDate ?? rawPeriod),
                asOnDate: asOnDate ?? null,
                value: toNumber(
                    getValue(
                        row,
                        "trade_working_capital",
                        "trade_working_capital_value",
                        "working_capital",
                        "value"
                    )
                ),
            };
        })
        .filter((row) => row.value !== null);
}

function normalizeHierarchyTrendRows(payload, level = "parent") {
    const data = unwrapApiResponse(payload);
    let rawRows = [];

    if (Array.isArray(data)) {
        rawRows = data;
    } else if (Array.isArray(data?.rows)) {
        rawRows = data.rows;
    } else if (Array.isArray(data?.data)) {
        rawRows = data.data;
    } else {
        Object.entries(data || {}).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((row) => {
                    rawRows.push({
                        ...(row || {}),
                        [level === "parent"
                            ? "parent_division_name"
                            : "subdivision_name"]:
                            row?.[
                            level === "parent"
                                ? "parent_division_name"
                                : "subdivision_name"
                            ] ?? key,
                    });
                });
            }
        });
    }

    const nameKeys =
        level === "parent"
            ? [
                "parent_division_name",
                "parentDivisionName",
                "parent_division",
                "division_name",
                "division",
                "name",
                "label",
            ]
            : [
                "subdivision_name",
                "sub_division_name",
                "subDivisionName",
                "subdivision",
                "sub_division",
                "name",
                "label",
            ];

    return rawRows
        .map((row) => ({
            name: String(
                getValue(row, ...nameKeys) ?? "—"
            ),
            period: formatMonthLabel(
                getValue(
                    row,
                    "month",
                    "period",
                    "period_name",
                    "month_label",
                    "as_on_date",
                    "snapshot_date",
                    "date",
                    "period_end",
                    "label"
                )
            ),
            value: toNumber(
                getValue(
                    row,
                    "trade_working_capital",
                    "trade_working_capital_value",
                    "working_capital",
                    "value",
                    "amount"
                )
            ),
            ccc: toNumber(
                getValue(
                    row,
                    "cash_conversion_cycle_days",
                    "ccc_days",
                    "ccc",
                    "cash_conversion_cycle"
                )
            ),
        }))
        .filter(
            (row) =>
                row.value !== null &&
                row.name !== "—"
        );
}

function normalizeCfoViewAllRows(payload) {
    const data = unwrapApiResponse(payload);
    const rawRows = Array.isArray(data)
        ? data
        : Array.isArray(data?.rows)
            ? data.rows
            : Array.isArray(data?.data)
                ? data.data
                : [];

    /*
     * Common Parent Division / Sub-Division View All table.
     * DSO, DPO, DIO and CCC are intentionally null for now.
     * Never derive these values in the frontend.
     */
    return rawRows.map((row) => ({
        legalEntity:
            getValue(
                row,
                "legal_entity",
                "legal_entity_name",
                "legalEntity",
                "legalEntityName",
                "entity_name",
                "entity"
            ) ?? "—",
        parentDivision:
            getValue(
                row,
                "parent_division",
                "parent_division_name",
                "parentDivision",
                "parentDivisionName"
            ) ?? "—",
        subDivision:
            getValue(
                row,
                "subdivision",
                "subdivision_name",
                "sub_division",
                "sub_division_name",
                "subDivision",
                "subDivisionName"
            ) ?? "—",
        tradeReceivables: toNumber(
            getValue(
                row,
                "trade_receivables",
                "total_receivables",
                "receivables"
            )
        ),
        dso: null,
        tradePayables: toNumber(
            getValue(
                row,
                "trade_payables",
                "total_payables",
                "payables"
            )
        ),
        dpo: null,
        inventory: toNumber(
            getValue(row, "inventory", "total_inventory")
        ),
        dio: null,
        tradeWorkingCapital: toNumber(
            getValue(
                row,
                "trade_working_capital",
                "trade_working_capital_value",
                "working_capital"
            )
        ),
        ccc: null,
    }));
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
        padding: "16px 0 36px",
        boxSizing: "border-box",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: S.cardGap,
        marginBottom: "16px",
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
        gridTemplateColumns: "118px 118px 118px 118px 112px 130px 70px 60px",
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
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gap: "10px",
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
        border: "1px solid var(--clr-border)",
        borderRadius: "var(--radius-lg)",
        padding: "12px 16px 10px",
        boxSizing: "border-box",
        overflow: "hidden",
        boxShadow: "var(--shadow-card)",
        transition: "box-shadow var(--tr-base), transform var(--tr-base)",
    },
    panelTitle: {
        ...T.sectionTitle,
        color: C.navy,
        fontSize: "0.88rem",
        lineHeight: 1.3,
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
    grid-template-columns: 118px 118px 118px 118px 112px 130px 70px 60px !important;
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

function AnimatedKpiValue({ value, duration = 1100 }) {
    const raw = String(value ?? "");
    const numericMatch = raw.match(/-?\d+(?:\.\d+)?/);
    const numeric = numericMatch ? Number(numericMatch[0]) : null;
    const [display, setDisplay] = useState(numeric ?? 0);

    useEffect(() => {
        if (numeric === null || !Number.isFinite(numeric)) {
            setDisplay(0);
            return undefined;
        }

        let frameId = null;
        const start = performance.now();
        const from = 0;

        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(from + (numeric - from) * eased);

            if (progress < 1) {
                frameId = requestAnimationFrame(animate);
            }
        };

        setDisplay(0);
        frameId = requestAnimationFrame(animate);

        return () => {
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [numeric, duration]);

    if (numeric === null || !Number.isFinite(numeric)) {
        return <>{value ?? "—"}</>;
    }

    const match = raw.match(/^(.*?)(-?\d+(?:\.\d+)?)(.*)$/);
    if (!match) return <>{value}</>;

    const [, prefix, , suffix] = match;
    const decimals = (numericMatch?.[0].split(".")[1] || "").length;

    return (
        <>
            {prefix}
            {display.toFixed(decimals)}
            {suffix}
        </>
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
        "Target CCC": {
            bg: "#F0F9FF",
            iconBg: "#DDF3FF",
            accent: "#0284C7",
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
            className="sales-style-kpi"
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
                        <AnimatedKpiValue value={value} />
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
    const [parentHoveredIndex, setParentHoveredIndex] = useState(null);

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
                            ...(typeof onExportExcel === "function"
                                ? [{
                                    key: "excel",
                                    label: "📊 Export Excel",
                                    onClick: onExportExcel,
                                }]
                                : []),
                            ...(typeof onExportPdf === "function"
                                ? [{
                                    key: "pdf",
                                    label: "📄 Export PDF",
                                    onClick: onExportPdf,
                                }]
                                : []),
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

    const tooltipWidth = 240;
    const tooltipHeight = 88;
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
        ...(typeof onExportExcel === "function"
            ? [{
                key: "excel",
                label: "📊 Export Excel",
                onClick: onExportExcel,
            }]
            : []),
        ...(typeof onExportPdf === "function"
            ? [{
                key: "pdf",
                label: "📄 Export PDF",
                onClick: onExportPdf,
            }]
            : []),
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

                {/* Subtle live-flow highlight travelling along the existing line. */}
                <polyline
                    points={points}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="34 1366"
                    strokeDashoffset="0"
                    opacity="0.55"
                    pointerEvents="none"
                    style={{
                        animation:
                            "wcTrendLiveFlow 3.2s linear infinite",
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
                                fontSize="11"
                                fontWeight={
                                    isHovered ? "800" : "700"
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
                            x={tooltipX + 12}
                            y={tooltipY + 39}
                            fontSize="12"
                            fontWeight="600"
                            fill="#64748B"
                        >
                            Amount
                        </text>
                        <text
                            x={tooltipX + tooltipWidth - 12}
                            y={tooltipY + 40}
                            textAnchor="end"
                            fontSize="15"
                            fontWeight="800"
                            fill="#4F46E5"
                        >
                            {formatAmount(
                                hoveredPoint.value,
                                currency,
                                false
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
                    marginTop: "48px",
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
        <div ref={ref} style={{ position: "relative", minWidth: 0, zIndex: open ? 1500 : 1 }}>
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
                        <div style={{ position: "relative", width: "100%" }}>
                            <span aria-hidden="true" style={{ position: "absolute", left: 9, top: 7, fontSize: "0.72rem", lineHeight: 1, pointerEvents: "none" }}>🔍</span>
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder={`Search ${label}`}
                                style={{
                                    width: "100%",
                                    height: "30px",
                                    border: "1px solid #CBD5E1",
                                    borderRadius: "6px",
                                    padding: "0 9px 0 28px",
                                    fontSize: "0.70rem",
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
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
    width = 118,
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
                        <div style={{ position: "relative", width: "100%" }}>
                            <span aria-hidden="true" style={{ position: "absolute", left: 8, top: 6, fontSize: "0.70rem", lineHeight: 1, pointerEvents: "none" }}>🔍</span>
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
                                    padding: "0 8px 0 27px",
                                    fontSize: "0.70rem",
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
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
                title={`Display in ${currency} Million`}
            >
                {currency} Million
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

function TradeWorkingCapitalViewAllChart({
    rows = [],
    currency = "",
    unit = "aed",
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const data = (Array.isArray(rows) ? rows : [])
        .map((row) => ({
            period: String(row?.period ?? "—"),
            value: toNumber(row?.value),
        }))
        .filter((row) => row.value !== null);

    const displayValue = (value) => {
        const n = toNumber(value);
        if (n === null) return "—";
        if (unit === "millions") return `${(n / 1000000).toFixed(2)}M`;
        return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    };

    const axisValue = (value) => {
        const n = toNumber(value);
        if (n === null) return "—";
        if (unit === "millions") return `${(n / 1000000).toFixed(1)}M`;
        const abs = Math.abs(n);
        if (abs >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (abs >= 1000) return `${(n / 1000).toFixed(1)}K`;
        return Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
    };

    const values = data.map((item) => item.value);
    const rawMin = values.length ? Math.min(...values) : 0;
    const rawMax = values.length ? Math.max(...values) : 1;
    const rawRange = rawMax - rawMin;
    const padding = rawRange > 0
        ? rawRange * 0.12
        : Math.max(Math.abs(rawMax) * 0.12, 1);
    const minValue = Math.min(0, rawMin) - padding;
    const maxValue = Math.max(0, rawMax) + padding;

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;

        const value = payload[0]?.value;

        return (
            <div
                style={{
                    background: "#FFFFFF",
                    border: "1px solid #D8DEE8",
                    borderRadius: 9,
                    padding: "10px 13px",
                    boxShadow: "0 8px 20px rgba(15,23,42,0.12)",
                    minWidth: 185,
                    fontFamily: "Inter, system-ui, sans-serif",
                }}
            >
                <div
                    style={{
                        color: "#1E293B",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        marginBottom: 8,
                    }}
                >
                    {label}
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 22,
                    }}
                >
                    <span
                        style={{
                            color: "#64748B",
                            fontSize: "0.64rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Trade Working Capital
                    </span>
                    <span
                        style={{
                            color: "#1E3A8A",
                            fontSize: "0.70rem",
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {displayValue(value)}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div
            style={{
                height: "100%",
                minHeight: 300,
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                background: "#FFFFFF",
                padding: "12px 12px 10px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    paddingBottom: 8,
                    borderBottom: "1px solid #F1F5F9",
                }}
            >
                <div>
                    <div style={{ color: "#173575", fontSize: "0.76rem", fontWeight: 800 }}>
                        Trade Working Capital Trend
                    </div>
                    <div style={{ marginTop: 2, color: "#94A3B8", fontSize: "0.60rem", fontWeight: 600 }}>
                        {unit === "millions" ? `${currency || "AED"} Million` : currency || "AED"}
                    </div>
                </div>
                <div
                    style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: "#4F46E5",
                        boxShadow: "0 0 0 3px #EEF2FF",
                    }}
                    title="Trade Working Capital"
                />
            </div>

            {data.length ? (
                <div
                    style={{
                        flex: 1,
                        minHeight: 255,
                        marginTop: 8,
                        position: "relative",
                        overflow: "hidden",
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 24, right: 20, left: 8, bottom: 8 }}
                            onMouseMove={(state) => {
                                if (state?.activeTooltipIndex !== undefined && state?.activeTooltipIndex !== null) {
                                    setHoveredIndex(state.activeTooltipIndex);
                                }
                            }}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <defs>
                                <linearGradient id="wcTradeViewAllArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.24} />
                                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.03} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
                            <XAxis
                                dataKey="period"
                                tick={{ fill: "#64748B", fontSize: 10, fontWeight: 600 }}
                                axisLine={{ stroke: "#CBD5E1" }}
                                tickLine={{ stroke: "#CBD5E1" }}
                            />
                            <YAxis
                                domain={[minValue, maxValue]}
                                tickFormatter={axisValue}
                                width={52}
                                tick={{ fill: "#64748B", fontSize: 9, fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ stroke: "#94A3B8", strokeDasharray: "4 4", strokeWidth: 1 }}
                                content={<CustomTooltip />}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                name="Trade Working Capital"
                                stroke="#4F46E5"
                                strokeWidth={3}
                                fill="url(#wcTradeViewAllArea)"
                                dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#4F46E5", strokeWidth: 2 }}
                                activeDot={{
                                    r: 7,
                                    fill: "#FFFFFF",
                                    stroke: "#4F46E5",
                                    strokeWidth: 3,
                                }}
                                isAnimationActive={true}
                                animationDuration={900}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#94A3B8",
                        fontSize: "0.72rem",
                    }}
                >
                    No Trade Working Capital history for the selected filters.
                </div>
            )}
        </div>
    );
}

function modalNumber(value, currency, unit = "aed") {
    const n = toNumber(value);
    if (n === null) return "—";
    if (unit === "millions") return `${(n / 1000000).toFixed(2)}M`;
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function ParentDivisionMonthOnMonthTable({ rows, currency, unit = "aed" }) {
    const safeRows = Array.isArray(rows) ? rows : [];

    const periods = Array.from(
        new Set(
            safeRows
                .map((row) => String(row?.period ?? ""))
                .filter(Boolean)
        )
    );

    const divisions = Array.from(
        new Set(
            safeRows
                .map((row) => String(row?.name ?? "—"))
                .filter((name) => name && name !== "—")
        )
    );

    const lookup = new Map();
    safeRows.forEach((row) => {
        const name = String(row?.name ?? "—");
        const period = String(row?.period ?? "");
        if (!name || name === "—" || !period) return;
        lookup.set(`${name}__${period}`, row);
    });

    const formatValue = (value) => {
        const n = toNumber(value);
        if (n === null) return "—";
        if (unit === "millions") return `${(n / 1000000).toFixed(2)}M`;
        return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    };

    if (!divisions.length || !periods.length) {
        return (
            <div
                style={{
                    width: "100%",
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94A3B8",
                    fontSize: "0.72rem",
                }}
            >
                No available month-on-month history.
            </div>
        );
    }

    return (
        <div
            style={{
                width: "100%",
                flex: 1,
                minHeight: 0,
                overflow: "auto",
                borderTop: "1px solid #E2E8F0",
            }}
        >
            <table
                style={{
                    width: "100%",
                    minWidth: Math.max(620, 190 + periods.length * 188),
                    borderCollapse: "collapse",
                    tableLayout: "fixed",
                    fontFamily: "Inter, system-ui, sans-serif",
                }}
            >
                <colgroup>
                    <col style={{ width: 190 }} />
                    {periods.map((period) => (
                        <React.Fragment key={`col-${period}`}>
                            <col style={{ width: 94 }} />
                            <col style={{ width: 94 }} />
                        </React.Fragment>
                    ))}
                </colgroup>
                <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
                    <tr>
                        <th
                            rowSpan={2}
                            style={{
                                ...th,
                                width: 190,
                                minWidth: 190,
                                background: "#F8FAFC",
                                borderBottom: "1px solid #E2E8F0",
                                borderRight: "1px solid #E2E8F0",
                                position: "sticky",
                                left: 0,
                                zIndex: 7,
                                padding: "8px 10px",
                                fontSize: "0.61rem",
                                whiteSpace: "nowrap",
                            }}
                        >
                            PARENT DIVISION
                        </th>
                        {periods.map((period) => (
                            <th
                                key={`${period}-group`}
                                colSpan={2}
                                style={{
                                    ...th,
                                    textAlign: "center",
                                    background: "#F8FAFC",
                                    borderLeft: "1px solid #E2E8F0",
                                    borderBottom: "1px solid #E2E8F0",
                                    padding: "7px 4px",
                                    fontSize: "0.61rem",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {period}
                            </th>
                        ))}
                    </tr>
                    <tr>
                        {periods.map((period) => (
                            <React.Fragment key={`${period}-subheader`}>
                                <th
                                    style={{
                                        ...thRight,
                                        width: 94,
                                        minWidth: 94,
                                        maxWidth: 94,
                                        textAlign: "center",
                                        background: "#FBFCFE",
                                        borderLeft: "1px solid #E2E8F0",
                                        borderBottom: "1px solid #E2E8F0",
                                        padding: "7px 3px",
                                        fontSize: "0.56rem",
                                        lineHeight: 1.15,
                                        whiteSpace: "normal",
                                        wordBreak: "normal",
                                    }}
                                >
                                    <span style={{ display: "block" }}>TRADE </span>
                                    <span style={{ display: "block" }}> WORKING</span>
                                    <span style={{ display: "block" }}>CAPITAL</span>
                                </th>
                                <th
                                    style={{
                                        ...thRight,
                                        width: 94,
                                        minWidth: 94,
                                        maxWidth: 94,
                                        textAlign: "center",
                                        background: "#FBFCFE",
                                        borderLeft: "1px solid #E2E8F0",
                                        borderBottom: "1px solid #E2E8F0",
                                        padding: "7px 3px",
                                        fontSize: "0.58rem",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    CCC
                                </th>
                            </React.Fragment>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {divisions.map((division, divisionIndex) => (
                        <tr key={`${division}-${divisionIndex}`}>
                            <td
                                style={{
                                    ...td,
                                    padding: "8px 10px",
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    color: "#334155",
                                    background: divisionIndex % 2 ? "#FCFDFE" : "#FFFFFF",
                                    borderRight: "1px solid #E2E8F0",
                                    position: "sticky",
                                    left: 0,
                                    zIndex: 2,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                                title={division}
                            >
                                {division}
                            </td>
                            {periods.map((period) => {
                                const row = lookup.get(`${division}__${period}`);
                                const value = row?.value;
                                const ccc = row?.ccc;
                                return (
                                    <React.Fragment key={`${division}-${period}`}>
                                        <td
                                            style={{
                                                ...tdRight,
                                                width: 94,
                                                minWidth: 94,
                                                maxWidth: 94,
                                                padding: "8px 5px",
                                                fontSize: "0.67rem",
                                                whiteSpace: "nowrap",
                                                color: toNumber(value) !== null && toNumber(value) < 0 ? "#DC2626" : "#334155",
                                                fontWeight: 600,
                                                background: divisionIndex % 2 ? "#FCFDFE" : "#FFFFFF",
                                            }}
                                        >
                                            {formatValue(value)}
                                        </td>
                                        <td
                                            style={{
                                                ...tdRight,
                                                width: 94,
                                                minWidth: 94,
                                                maxWidth: 94,
                                                padding: "8px 5px",
                                                fontSize: "0.67rem",
                                                whiteSpace: "nowrap",
                                                color: "#475569",
                                                fontWeight: 600,
                                                background: divisionIndex % 2 ? "#FCFDFE" : "#FFFFFF",
                                            }}
                                        >
                                            {toNumber(ccc) === null ? "—" : `${Number(ccc).toFixed(2)}`}
                                        </td>
                                    </React.Fragment>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
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
    monthOnMonthRows = [],
}) {
    const isCfo = type === "cfo";
    const isCcc = type === "ccc";
    const isTrade = type === "trade";
    const isComponents = type === "components";
    const isTrend = type === "trend";
    const showModalExports = !isCcc && !isTrade && !isComponents;
    const cfoTh = {
        ...th,
        padding: "7px 6px",
        fontSize: "0.62rem",
        whiteSpace: "nowrap",
    };
    const cfoThRight = {
        ...thRight,
        padding: "7px 6px",
        fontSize: "0.62rem",
        whiteSpace: "nowrap",
    };
    const cfoTd = {
        ...td,
        padding: "7px 6px",
        fontSize: "0.68rem",
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        lineHeight: 1.3,
        verticalAlign: "top",
    };
    const cfoTdRight = {
        ...tdRight,
        padding: "7px 6px",
        fontSize: "0.68rem",
        whiteSpace: "nowrap",
    };
    const cfoNumberStyle = (value) => ({
        ...cfoTdRight,
        color: toNumber(value) !== null && toNumber(value) < 0 ? "#DC2626" : cfoTdRight.color,
        fontWeight: toNumber(value) !== null && toNumber(value) < 0 ? 700 : cfoTdRight.fontWeight,
    });
    const [search, setSearch] = useState("");
    const [modalUnit, setModalUnit] = useState("aed");
    const [page, setPage] = useState(0);
    const [cfoViewMode, setCfoViewMode] = useState("detailed");
    const pageSize = 15;

    const [localFilters, setLocalFilters] = useState(() => ({
        legalGroups: baseFilters?.legalGroups || [],
        legalEntities: baseFilters?.legalEntities || [],
        parentDivisions: baseFilters?.parentDivisions || [],
        subDivisions: baseFilters?.subDivisions || [],
        asOnDate: baseFilters?.asOnDate || "",
    }));

    useEffect(() => {
        setLocalFilters({
            legalGroups: baseFilters?.legalGroups || [],
            legalEntities: baseFilters?.legalEntities || [],
            parentDivisions: baseFilters?.parentDivisions || [],
            subDivisions: baseFilters?.subDivisions || [],
            asOnDate: baseFilters?.asOnDate || "",
        });
        setSearch("");
        setPage(0);
        setCfoViewMode("detailed");
    }, [baseFilters, type]);

    const resetModalFilters = () => {
        const reset = getWorkingCapitalDefaultFilters(filterOptions);
        setLocalFilters(reset);
        setSearch("");
        setPage(0);
        setCfoViewMode("detailed");
        onApplyFilters?.(reset);
    };

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

    const filteredMonthRows = (Array.isArray(monthOnMonthRows) ? monthOnMonthRows : []).filter((row) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return Object.values(row || {}).some((value) => String(value ?? "").toLowerCase().includes(q));
    });

    const monthDivisionNames = Array.from(
        new Set(
            filteredMonthRows
                .map((row) => String(row?.name ?? "—"))
                .filter((name) => name && name !== "—")
        )
    );

    const totalPages = Math.max(
        1,
        Math.ceil(
            (isCfo && cfoViewMode === "month-on-month"
                ? monthDivisionNames.length
                : filtered.length) / pageSize
        )
    );
    const safePage = Math.min(page, totalPages - 1);
    const pageRows = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

    const modalFmt = (value) => {
        const n = toNumber(value);
        if (n === null) return "—";
        if (modalUnit === "millions") return `${(n / 1000000).toFixed(2)}M`;
        return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    };

    if (!filterOptions) return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            className="wc-sales-view-all-overlay"
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.35)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                zIndex: 10000,
                padding: "8px 0",
                boxSizing: "border-box",
            }}
        >
            <div
                className="wc-sales-view-all-modal"
                style={{
                    width: "96vw",
                    maxWidth: "1500px",
                    height: "calc(100vh - 16px)",
                    maxHeight: "calc(100vh - 16px)",
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
                            {baseFilters?.asOnDate ? `As on: ${formatDate(baseFilters.asOnDate)}` : "All available periods"}
                            <span style={{ margin: "0 6px", color: "#CBD5E1" }}>•</span>
                            {isCfo ? "Common View All" : `Reporting currency: ${currency}`}
                            {isCfo ? (
                                <>
                                    <span style={{ margin: "0 6px", color: "#CBD5E1" }}>•</span>
                                    Reporting currency: {currency}
                                </>
                            ) : null}
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        {isCfo && (
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 2,
                                    padding: 2,
                                    border: "1px solid #D8DEE8",
                                    borderRadius: 7,
                                    background: "#F8FAFC",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => { setCfoViewMode("detailed"); setPage(0); }}
                                    style={{
                                        height: 27,
                                        padding: "0 9px",
                                        border: "none",
                                        borderRadius: 5,
                                        background: cfoViewMode === "detailed" ? "#1E3A8A" : "transparent",
                                        color: cfoViewMode === "detailed" ? "#FFFFFF" : "#475569",
                                        fontSize: "0.62rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                    }}
                                >
                                    Detailed View
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setCfoViewMode("month-on-month"); setPage(0); }}
                                    style={{
                                        height: 27,
                                        padding: "0 9px",
                                        border: "none",
                                        borderRadius: 5,
                                        background: cfoViewMode === "month-on-month" ? "#4F46E5" : "transparent",
                                        color: cfoViewMode === "month-on-month" ? "#FFFFFF" : "#475569",
                                        fontSize: "0.62rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                    }}
                                >
                                    Month-on-Month by Parent Division
                                </button>
                            </div>
                        )}
                        {!isCcc && (
                            <UnitToggle unit={modalUnit} onToggle={setModalUnit} currency={currency} />
                        )}
                        {showModalExports && (
                            <>
                                <button type="button" onClick={() => onExport?.("excel", type, localFilters, rows)} disabled={loading} style={{ height: 30, padding: "0 10px", borderRadius: 7, border: "1px solid #A7D8BF", background: "#F8FFFC", color: "#168052", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}>Excel</button>
                                <button type="button" onClick={() => onExport?.("pdf", type, localFilters, rows)} disabled={loading} style={{ height: 30, padding: "0 10px", borderRadius: 7, border: "1px solid #F2B8B8", background: "#FFF8F8", color: "#C23B3B", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer" }}>PDF</button>
                            </>
                        )}
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
                        <span style={{ color: "#1E3A8A", fontSize: "0.68rem", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>Reporting Currency</span>
                        <div
                            style={{
                                width: 112,
                                height: 32,
                                border: "1px solid #CBD5E1",
                                borderRadius: 7,
                                background: "#FFFFFF",
                                color: "#334155",
                                padding: "0 9px",
                                display: "flex",
                                alignItems: "center",
                                boxSizing: "border-box",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                            }}
                        >
                            {currency || "AED"}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                        <span style={{ color: "#1E3A8A", fontSize: "0.68rem", fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap" }}>As On Date</span>
                        <CalendarDateField
                            value={localFilters.asOnDate || ""}
                            onChange={(value) => setLocalFilters((p) => ({ ...p, asOnDate: value }))}
                            width={130}
                        />
                    </div>

                    <button type="button" onClick={() => { setPage(0); onApplyFilters?.(localFilters); }} disabled={loading} style={{ height: 32, padding: "0 14px", border: "none", borderRadius: 7, background: "#2563EB", color: "#FFFFFF", fontSize: "0.70rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                        {loading ? "Loading..." : "Apply"}
                    </button>
                    <button type="button" onClick={resetModalFilters} disabled={loading} style={{ height: 32, padding: "0 9px", border: "none", background: "transparent", color: "#475569", fontSize: "0.70rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
                        Reset
                    </button>

                </div>

                <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "10px 16px 8px", background: "#FFFFFF", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "0 2px 8px", flexShrink: 0 }}>
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            placeholder={isCfo && cfoViewMode === "month-on-month" ? "Search Parent Divisions..." : isCcc ? "Search periods..." : "Search..."}
                            style={{ height: 32, width: 220, border: "1px solid #CBD5E1", borderRadius: 7, padding: "0 10px", fontSize: "0.72rem", color: "#334155", outline: "none", fontFamily: "Inter, system-ui, sans-serif" }}
                        />
                        <span style={{ color: C.muted, fontSize: "0.70rem", fontWeight: 600 }}>
                            {isCfo && cfoViewMode === "month-on-month" ? `${monthDivisionNames.length} Parent Divisions` : `${filtered.length} records`}
                        </span>
                    </div>

                    {isTrade ? (
                        <div className="wc-trade-view-all-grid" style={{ width: "100%", flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "minmax(220px, 0.58fr) minmax(560px, 1.42fr)", gap: 10, overflow: "hidden" }}>
                            <div className="wc-trade-view-all-table" style={{ minWidth: 0, minHeight: 0, overflow: "auto" }}>
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        tableLayout: isCfo ? "fixed" : isTrade ? "fixed" : "auto",
                                        minWidth: isCfo
                                            ? 980
                                            : isCcc
                                                ? 650
                                                : isTrade
                                                    ? 0
                                                    : isTrend
                                                        ? 520
                                                        : 760,
                                    }}
                                >
                                    <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
                                        <tr>
                                            {isCfo ? (
                                                <>
                                                    <th style={cfoTh}>LEGAL ENTITY</th>
                                                    <th style={cfoTh}>PARENT DIVISION</th>
                                                    <th style={cfoTh}>SUB-DIVISION</th>
                                                    <th style={cfoThRight}>TRADE RECEIVABLES</th>
                                                    <th style={cfoThRight}>DSO</th>
                                                    <th style={cfoThRight}>TRADE PAYABLES</th>
                                                    <th style={cfoThRight}>DPO</th>
                                                    <th style={cfoThRight}>INVENTORY</th>
                                                    <th style={cfoThRight}>DIO</th>
                                                    <th style={{ ...cfoThRight, whiteSpace: "nowrap" }}>
                                                        TRADE WORKING CAPITAL ({currency})
                                                    </th>
                                                    <th style={cfoThRight}>CCC</th>
                                                </>
                                            ) : isCcc ? (
                                                <>
                                                    <th style={th}>PERIOD</th>
                                                    <th style={thRight}>DSO</th>
                                                    <th style={thRight}>DIO</th>
                                                    <th style={thRight}>DPO</th>
                                                    <th style={thRight}>CCC</th>
                                                </>
                                            ) : isTrade || isTrend ? (
                                                <>
                                                    <th style={th}>PERIOD</th>
                                                    <th style={thRight}>
                                                        {isTrade ? "TRADE WORKING CAPITAL" : "NET WORKING CAPITAL"}
                                                        {currency ? ` (${currency})` : ""}
                                                    </th>
                                                </>
                                            ) : (
                                                <>
                                                    <th style={th}>PERIOD</th>
                                                    <th style={th}>CATEGORY</th>
                                                    <th style={thRight}>AMOUNT</th>
                                                    <th style={thRight}>% OF TOTAL</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageRows.length ? pageRows.map((row, index) => {
                                            if (isCfo) {
                                                return (
                                                    <tr
                                                        key={`${row.legalEntity}-${row.parentDivision}-${row.subDivision}-${index}`}
                                                    >
                                                        <td style={cfoTd} title={row.legalEntity}>{row.legalEntity}</td>
                                                        <td style={cfoTd} title={row.parentDivision}>{row.parentDivision}</td>
                                                        <td style={cfoTd} title={row.subDivision}>{row.subDivision}</td>
                                                        <td style={cfoNumberStyle(row.tradeReceivables)}>{modalFmt(row.tradeReceivables)}</td>
                                                        <td style={cfoTdRight}>—</td>
                                                        <td style={cfoNumberStyle(row.tradePayables)}>{modalFmt(row.tradePayables)}</td>
                                                        <td style={cfoTdRight}>—</td>
                                                        <td style={cfoNumberStyle(row.inventory)}>{modalFmt(row.inventory)}</td>
                                                        <td style={cfoTdRight}>—</td>
                                                        <td style={cfoNumberStyle(row.tradeWorkingCapital)}>{modalFmt(row.tradeWorkingCapital)}</td>
                                                        <td style={cfoTdRight}>—</td>
                                                    </tr>
                                                );
                                            }

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
                                            <tr>
                                                <td
                                                    colSpan={
                                                        isCfo
                                                            ? 11
                                                            : isCcc
                                                                ? 5
                                                                : isTrade || isTrend
                                                                    ? 2
                                                                    : 4
                                                    }
                                                    style={{
                                                        padding: 30,
                                                        textAlign: "center",
                                                        color: "#94A3B8",
                                                        fontSize: "0.72rem",
                                                    }}
                                                >
                                                    {loading ? "Loading..." : "No available history."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <TradeWorkingCapitalViewAllChart rows={filtered} currency={currency} unit={modalUnit} />
                        </div>
                    ) : isCfo && cfoViewMode === "month-on-month" ? (
                        <ParentDivisionMonthOnMonthTable rows={filteredMonthRows} currency={currency} unit={modalUnit} />
                    ) : (
                        <div style={{ width: "100%", flex: 1, minHeight: 0, overflow: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    tableLayout: isCfo ? "fixed" : "auto",
                                    minWidth: isCfo
                                        ? 980
                                        : isCcc
                                            ? 650
                                            : isTrade || isTrend
                                                ? 520
                                                : 760,
                                }}
                            >
                                <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
                                    <tr>
                                        {isCfo ? (
                                            <>
                                                <th style={cfoTh}>LEGAL ENTITY</th>
                                                <th style={cfoTh}>PARENT DIVISION</th>
                                                <th style={cfoTh}>SUB-DIVISION</th>
                                                <th style={cfoThRight}>TRADE RECEIVABLES</th>
                                                <th style={cfoThRight}>DSO</th>
                                                <th style={cfoThRight}>TRADE PAYABLES</th>
                                                <th style={cfoThRight}>DPO</th>
                                                <th style={cfoThRight}>INVENTORY</th>
                                                <th style={cfoThRight}>DIO</th>
                                                <th style={cfoThRight}>TRADE WORKING CAPITAL</th>
                                                <th style={cfoThRight}>CCC</th>
                                            </>
                                        ) : isCcc ? (
                                            <>
                                                <th style={th}>PERIOD</th>
                                                <th style={thRight}>DSO</th>
                                                <th style={thRight}>DIO</th>
                                                <th style={thRight}>DPO</th>
                                                <th style={thRight}>CCC</th>
                                            </>
                                        ) : isTrade || isTrend ? (
                                            <>
                                                <th style={th}>PERIOD</th>
                                                <th style={thRight}>{isTrade ? "TRADE WORKING CAPITAL" : "NET WORKING CAPITAL"}</th>
                                            </>
                                        ) : (
                                            <>
                                                <th style={th}>PERIOD</th>
                                                <th style={th}>CATEGORY</th>
                                                <th style={thRight}>AMOUNT</th>
                                                <th style={thRight}>% OF TOTAL</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.length ? pageRows.map((row, index) => {
                                        if (isCfo) {
                                            return (
                                                <tr key={`${row.legalEntity}-${row.parentDivision}-${row.subDivision}-${index}`}>
                                                    <td style={cfoTd} title={row.legalEntity}>{row.legalEntity}</td>
                                                    <td style={cfoTd} title={row.parentDivision}>{row.parentDivision}</td>
                                                    <td style={cfoTd} title={row.subDivision}>{row.subDivision}</td>
                                                    <td style={cfoNumberStyle(row.tradeReceivables)}>{modalFmt(row.tradeReceivables)}</td>
                                                    <td style={cfoTdRight}>—</td>
                                                    <td style={cfoNumberStyle(row.tradePayables)}>{modalFmt(row.tradePayables)}</td>
                                                    <td style={cfoTdRight}>—</td>
                                                    <td style={cfoNumberStyle(row.inventory)}>{modalFmt(row.inventory)}</td>
                                                    <td style={cfoTdRight}>—</td>
                                                    <td style={cfoNumberStyle(row.tradeWorkingCapital)}>{modalFmt(row.tradeWorkingCapital)}</td>
                                                    <td style={cfoTdRight}>—</td>
                                                </tr>
                                            );
                                        }
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
                                                <td style={td}>{isComponents ? formatDate(row.period) : row.period}</td>
                                                <td style={td}>{row.particular}</td>
                                                <td style={tdRight}>{modalFmt(row.amount)}</td>
                                                <td style={tdRight}>{row.percentage == null ? "—" : `${Number(row.percentage).toFixed(2)}%`}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={isCfo ? 11 : isCcc ? 5 : isTrade || isTrend ? 2 : 4} style={{ padding: 30, textAlign: "center", color: "#94A3B8", fontSize: "0.72rem" }}>
                                                {loading ? "Loading..." : "No available history."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
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
        </div>,
        document.body
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

    const [parentDivisionTrend, setParentDivisionTrend] =
        useState([]);
    const [subDivisionTrend, setSubDivisionTrend] =
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

    /*
     * View-All request guard:
     * - View-All endpoints are never prefetched.
     * - Identical endpoint + filter combinations share one in-flight request.
     * - Repeated clicks cannot create duplicate requests.
     */
    const viewAllInFlightRef = useRef(new Map());

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
                 * Aging Basis is not applicable to Working Capital, so it is
                 * intentionally not requested, stored, rendered, or sent.
                 */
                const response =
                    await getWorkingCapitalFilterOptions({});

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
                    getWorkingCapitalParentDivisionTrend({
                        ...apiFilters,
                        months: 6,
                    }),
                    getWorkingCapitalSubDivisionTrend({
                        ...apiFilters,
                        months: 6,
                    }),
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

            const parentTrendPayload = value(10);
            const subDivisionTrendPayload = value(11);

            setParentDivisionTrend(
                normalizeHierarchyTrendRows(
                    parentTrendPayload,
                    "parent"
                )
            );

            setSubDivisionTrend(
                normalizeHierarchyTrendRows(
                    subDivisionTrendPayload,
                    "sub"
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
        const next = getWorkingCapitalDefaultFilters(filterOptions);

        // Update both the visible controls and the committed API scope.
        // A fresh object is used for each state so React always sees the reset.
        setFilters({ ...next });
        setAppliedFilters({ ...next });
        setViewAll(null);
        setError("");
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

    /*
     * COMMON PARENT / SUB-DIVISION VIEW-ALL EXPORT
     *
     * Both Parent Division and Sub-Division use the same backend
     * Common View All export endpoints:
     *   GET /api/working-capital/view-all/export/excel
     *   GET /api/working-capital/view-all/export/pdf
     *
     * The filters are the exact filters currently selected in the
     * View All modal.
     */
    async function handleCfoViewAllExport(
        type,
        _section,
        overrideFilters = null
    ) {
        setExporting(true);
        setError("");

        try {
            const activeFilters =
                overrideFilters ||
                appliedFilters ||
                filters;

            const cfoViewAllFilters =
                buildCfoViewAllApiFilters(
                    activeFilters,
                    filterOptions
                );

            const response =
                type === "excel"
                    ? await exportWorkingCapitalViewAllExcel(
                        cfoViewAllFilters
                    )
                    : await exportWorkingCapitalViewAllPdf(
                        cfoViewAllFilters
                    );

            const fallback =
                type === "excel"
                    ? "working-capital-view-all.xlsx"
                    : "working-capital-view-all.pdf";

            downloadWorkingCapitalFile(
                response,
                fallback
            );
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
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

    async function openViewAll(type, overrideFilters = null, cfoViewLabel = null) {
        /*
         * This is an explicit View-All/drilldown action only.
         * It is intentionally not called by useEffect or hierarchy loops.
         */
        const activeFilters = overrideFilters || appliedFilters || filters;

        /*
         * Working Capital Components View All must use the currently selected
         * View-All filters. The previous implementation reused componentData
         * from the dashboard, so Apply changed the filter state but left the
         * displayed component values unchanged. Fetch the components again
         * for the explicit View-All Apply action.
         */
        if (type === "components") {
            setViewAllLoading(true);
            setError("");

            try {
                const componentApiFilters = buildApiFilters(
                    activeFilters,
                    filterOptions
                );
                const componentResponse = await getWorkingCapitalComponents(
                    componentApiFilters
                );
                const componentSource =
                    unwrapApiResponse(componentResponse) ?? {};

                const componentRows = [
                    {
                        period: formatDate(activeFilters?.asOnDate || operationalDate || "—"),
                        particular: "Receivables",
                        amount: toNumber(getValue(componentSource, "receivables", "total_receivables")),
                        percentage: null,
                    },
                    {
                        period: formatDate(activeFilters?.asOnDate || operationalDate || "—"),
                        particular: "Inventory",
                        amount: toNumber(getValue(componentSource, "inventory", "total_inventory")),
                        percentage: null,
                    },
                    {
                        period: formatDate(activeFilters?.asOnDate || operationalDate || "—"),
                        particular: "(-) Payables",
                        amount: toNumber(getValue(componentSource, "payables", "total_payables")),
                        percentage: null,
                    },
                    {
                        period: formatDate(activeFilters?.asOnDate || operationalDate || "—"),
                        particular: "Trade Working Capital",
                        amount: toNumber(getValue(componentSource, "trade_working_capital", "trade_working_capital_value", "working_capital")),
                        percentage: null,
                    },
                ];

                setViewAll({
                    type,
                    cfoViewLabel,
                    title: "Working Capital Components Detailed View",
                    rows: componentRows,
                    monthOnMonthRows: [],
                    filters: { ...activeFilters },
                });
                return componentRows;
            } catch (err) {
                setError(
                    err?.response?.data?.detail ||
                    err?.message ||
                    "Unable to load Working Capital Components."
                );
                return [];
            } finally {
                setViewAllLoading(false);
            }
        }

        const apiFilters = buildApiFilters(
            activeFilters,
            filterOptions
        );

        /*
         * Same endpoint + same selected filter scope = one in-flight Promise.
         */
        const requestKey = `${type}:${JSON.stringify(apiFilters)}`;
        const existingRequest =
            viewAllInFlightRef.current.get(requestKey);

        if (existingRequest) {
            return existingRequest;
        }

        setViewAllLoading(true);
        setError("");

        const requestPromise = (async () => {
            try {
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

                /*
                 * COMMON PARENT / SUB-DIVISION VIEW ALL
                 *
                 * Both hierarchy charts intentionally use the same endpoint:
                 *   GET /api/working-capital/view-all
                 *
                 * No separate Parent Division or Sub-Division View All API
                 * exists, and no hierarchy iteration is performed here.
                 *
                 * Only the selected hierarchy/date filters are forwarded.
                 */
                let monthOnMonthRows = [];

                if (type === "cfo") {
                    const cfoViewAllFilters =
                        buildCfoViewAllApiFilters(
                            activeFilters,
                            filterOptions
                        );

                    const [cfoResponse, parentTrendResponse] =
                        await Promise.all([
                            getWorkingCapitalViewAll(cfoViewAllFilters),
                            getWorkingCapitalParentDivisionTrend({
                                ...cfoViewAllFilters,
                                months: 12,
                            }),
                        ]);

                    response = cfoResponse;
                    rows = normalizeCfoViewAllRows(response);
                    monthOnMonthRows = normalizeHierarchyTrendRows(
                        parentTrendResponse,
                        "parent"
                    );

                    title =
                        `Working Capital - ${cfoViewLabel || "Detailed"} - Detailed View`;
                }

                /*
                 * IMPORTANT:
                 * Trade View-All is called exactly once for the currently
                 * selected filter scope, and only after the user explicitly
                 * opens Trade Working Capital -> View All.
                 *
                 * There is no Parent Division/Sub-Division iteration here.
                 */
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
                        "Trade Working Capital Detailed View";
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
                        "Cash Conversion Cycle Detailed View";
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
                    cfoViewLabel,
                    title,
                    rows,
                    monthOnMonthRows,
                    filters: { ...activeFilters },
                });

                return rows;
            } catch (err) {
                setError(
                    err?.response?.data
                        ?.detail ||
                    err?.message ||
                    "Unable to load View All data."
                );
                throw err;
            } finally {
                if (
                    viewAllInFlightRef.current.get(requestKey) ===
                    requestPromise
                ) {
                    viewAllInFlightRef.current.delete(requestKey);
                }

                setViewAllLoading(false);
            }
        })();

        viewAllInFlightRef.current.set(
            requestKey,
            requestPromise
        );

        /*
         * Prevent an unhandled rejection when a second click receives the
         * same in-flight Promise.
         */
        requestPromise.catch(() => { });

        return requestPromise;
    }
    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
            <style>{workingCapitalFilterResponsiveCss}</style>
            <style>{`
                .wc-trade-view-all-table table th,
                .wc-trade-view-all-table table td {
                    padding: 5px 6px !important;
                    font-size: 0.62rem !important;
                }
                .wc-trade-view-all-table table th {
                    white-space: nowrap;
                }
                @media (max-width: 1050px) {
                    .wc-trade-view-all-grid {
                        grid-template-columns: 1fr !important;
                        grid-template-rows: minmax(300px, 1fr) minmax(300px, 0.9fr) !important;
                    }
                }
            `}</style>
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

                @keyframes wcTrendLiveFlow {
                    from {
                        stroke-dashoffset: 0;
                    }
                    to {
                        stroke-dashoffset: -1400;
                    }
                }

                @keyframes wcBarGrow {
                    from {
                        transform: scaleX(0);
                        opacity: .35;
                    }
                    to {
                        transform: scaleX(1);
                        opacity: 1;
                    }
                }

                @keyframes wcChartRise {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .wc-chart-enter {
                    animation: wcChartRise .42s cubic-bezier(.4,0,.2,1) both;
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

                .wc-sales-page .wc-sales-footer {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    line-height: 1.35;
                }

                .wc-sales-page .wc-sales-footer strong {
                    color: #334155;
                    font-weight: 700;
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
                @media (prefers-reduced-motion: reduce) {
                    .wc-sales-page,
                    .wc-sales-page .wc-panel-animate,
                    .wc-sales-page .wc-chart-enter,
                    .wc-sales-page .wc-sales-kpis > div,
                    .wc-sales-page .wc-hierarchy-exposure-panel div[style*="wcBarGrow"] {
                        animation: none !important;
                    }
                }

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
            <style>{`
                /* ==========================================================
                   WORKING CAPITAL — SALES REVENUE VISUAL SYSTEM
                   Visual-only overrides. API/data/state behavior unchanged.
                ========================================================== */
                .wc-sales-page,
                .wc-sales-page * {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                }

                .wc-sales-page {
                    color: #1e293b !important;
                }

                .wc-sales-page .page-header {
                    margin-bottom: 16px !important;
                    padding-top: 0 !important;
                    gap: 16px !important;
                }

                .wc-sales-page .page-header-title,
                .wc-sales-page .wc-page-title {
                    color: #1e1b4b !important;
                    font-size: 1.45rem !important;
                    font-weight: 800 !important;
                    line-height: 1.2 !important;
                    letter-spacing: -0.02em !important;
                    margin: 0 !important;
                }

                .wc-sales-page .page-header-subtitle {
                    color: #64748b !important;
                    font-size: 0.74rem !important;
                    line-height: 1.45 !important;
                    margin-top: 4px !important;
                }

                /* Compact Sales-style filter bar */
                .wc-sales-page .wc-filter-grid {
                    width: 100% !important;
                    background: #fff !important;
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 12px !important;
                    padding: 10px 12px !important;
                    gap: 10px 8px !important;
                    margin-bottom: 16px !important;
                    box-shadow: 0 2px 8px rgba(15,23,42,.035) !important;
                }

                .wc-sales-page .wc-filter-grid select,
                .wc-sales-page .wc-filter-grid input,
                .wc-sales-page .wc-filter-grid button {
                    min-height: 30px !important;
                    height: 32px !important;
                    border-radius: 7px !important;
                    font-size: 0.70rem !important;
                    font-weight: 600 !important;
                }

                .wc-sales-page .wc-filter-grid select,
                .wc-sales-page .wc-filter-grid input {
                    border-color: #dbe2ea !important;
                    background: #fff !important;
                    color: #334155 !important;
                }

                .wc-sales-page .wc-filter-grid select:focus,
                .wc-sales-page .wc-filter-grid input:focus {
                    border-color: #818cf8 !important;
                    box-shadow: 0 0 0 3px rgba(99,102,241,.10) !important;
                    outline: none !important;
                }

                /* KPI cards — same compact Sales/Receivables/Payables proportions */
                .wc-sales-page .wc-sales-kpis {
                    grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
                    gap: 10px !important;
                    margin-top: 0 !important;
                    margin-bottom: 16px !important;
                    align-items: stretch !important;
                }

                .wc-sales-page .sales-style-kpi {
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 10px !important;
                    min-height: 74px !important;
                    box-shadow: none !important;
                    transition: all .25s cubic-bezier(.4,0,.2,1) !important;
                }

                .wc-sales-page .sales-style-kpi:hover {
                    box-shadow: 0 8px 24px rgba(37,99,235,.10) !important;
                    transform: translateY(-2px) !important;
                }

                /* Panels / charts */
                .wc-sales-page .wc-panel-animate {
                    background: #fff !important;
                    border: 1px solid rgba(0,0,0,.04) !important;
                    border-radius: 16px !important;
                    box-shadow: 0 4px 24px rgba(0,0,0,.02), 0 1px 3px rgba(0,0,0,.03) !important;
                    transition: box-shadow .2s cubic-bezier(.4,0,.2,1), transform .2s ease !important;
                }

                .wc-sales-page .wc-panel-animate:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,.05) !important;
                }

                .wc-sales-page .wc-panel-animate h3 {
                    color: #1e1b4b !important;
                    font-weight: 800 !important;
                    letter-spacing: -0.01em !important;
                }

                /* Tables */
                .wc-sales-page table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                }

                .wc-sales-page table thead th {
                    padding: 10px 16px !important;
                    background: #f8fafc !important;
                    color: #1e3a8a !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                    font-size: 0.74rem !important;
                    font-weight: 700 !important;
                    line-height: 1.25 !important;
                    white-space: nowrap !important;
                    letter-spacing: 0 !important;
                }

                .wc-sales-page table tbody td {
                    padding: 8px 16px !important;
                    font-size: 0.74rem !important;
                    color: #334155 !important;
                    border-bottom-color: #f1f5f9 !important;
                }

                .wc-sales-page table tbody tr:hover td {
                    background: #f8fafc !important;
                }

                .wc-sales-page .wc-sales-main-grid,
                .wc-sales-page .wc-sales-three-grid {
                    gap: 10px !important;
                    margin-bottom: 10px !important;
                }

                @media (max-width: 1400px) {
                    .wc-sales-page .wc-sales-kpis {
                        grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
                    }
                }

                @media (max-width: 1200px) {
                    .wc-sales-page .wc-sales-kpis {
                        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    }
                }

                @media (max-width: 1000px) {
                    .wc-sales-page .wc-sales-kpis {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    }
                }

                @media (max-width: 600px) {
                    .wc-sales-page .wc-sales-kpis {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>


            <style>{`
                /* ==========================================================
                   WORKING CAPITAL — SALES-UNIFORM VIEW ALL LAYER
                   Visual-only. No API/state/handler/animation changes.
                ========================================================== */
                .wc-sales-page .wc-sales-view-all-overlay,
                .wc-sales-view-all-overlay {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                }

                .wc-sales-view-all-overlay .wc-sales-view-all-modal {
                    color: #0F172A !important;
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                    border-radius: 14px !important;
                    border: 1px solid #E2E8F0 !important;
                    box-shadow: 0 18px 48px rgba(15,23,42,.14) !important;
                }

                .wc-sales-view-all-overlay h2 {
                    color: #1E1B4B !important;
                    font-size: .96rem !important;
                    font-weight: 800 !important;
                    letter-spacing: -.015em !important;
                }

                .wc-sales-view-all-overlay input,
                .wc-sales-view-all-overlay button,
                .wc-sales-view-all-overlay select {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                }

                .wc-sales-view-all-overlay input {
                    color: #334155 !important;
                    border-color: #CBD5E1 !important;
                    border-radius: 7px !important;
                }

                .wc-sales-view-all-overlay input:focus,
                .wc-sales-view-all-overlay select:focus {
                    border-color: #818CF8 !important;
                    box-shadow: 0 0 0 3px rgba(99,102,241,.10) !important;
                    outline: none !important;
                }

                .wc-sales-view-all-overlay table {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                }

                .wc-sales-view-all-overlay table thead th {
                    background: #F8FAFC !important;
                    color: #1E3A8A !important;
                    border-bottom: 2px solid #E2E8F0 !important;
                    font-size: .72rem !important;
                    font-weight: 700 !important;
                    padding: 9px 10px !important;
                    line-height: 1.25 !important;
                }

                .wc-sales-view-all-overlay table tbody td {
                    color: #334155 !important;
                    border-bottom: 1px solid #F1F5F9 !important;
                    font-size: .72rem !important;
                    font-weight: 500 !important;
                    padding: 8px 10px !important;
                }

                .wc-sales-view-all-overlay table tbody tr:hover td {
                    background: #F8FAFC !important;
                }

                .wc-sales-view-all-overlay .wc-view-all-toolbar {
                    background: #FAFBFC !important;
                    border-bottom-color: #E2E8F0 !important;
                }

                @media (max-width: 900px) {
                    .wc-sales-view-all-overlay .wc-sales-view-all-modal {
                        width: 98vw !important;
                    }
                }
            `}</style>

            <div className="wc-sales-page animate-in" style={{ paddingTop: "16px", paddingBottom: "8px" }}>
                <div className="page-header" style={{ marginBottom: "16px", paddingTop: "0", gap: "16px" }}>
                    <div>
                        <h1 className="page-header-title wc-page-title" style={{ fontSize: "1.45rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                            <span style={{ fontSize: "1.3rem" }}>📈</span> Working Capital Report
                        </h1>

                        <p className="page-header-subtitle">
                            Track working capital position and efficiency across all dimensions
                            <br />
                            <span style={{ display: "inline-block", marginTop: 4, fontWeight: 600, color: "#64748B", fontSize: "0.74rem" }}>
                                Reporting currency: <strong style={{ color: "#16A34A" }}>{currency}</strong>
                                <span style={{ margin: "0 6px", color: "#CBD5E1" }}>•</span>
                                Operational as on: {formatDate(operationalDate)}
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
                        onChange={(value) => updateFilter("legalGroups", value)}
                    />

                    <MultiSelectField
                        label="Legal Entity"
                        values={filters.legalEntities}
                        options={cascadingFilterOptions.legalEntities}
                        onChange={(value) => updateFilter("legalEntities", value)}
                    />

                    <MultiSelectField
                        label="Parent Division"
                        values={filters.parentDivisions}
                        options={cascadingFilterOptions.parentDivisions}
                        onChange={(value) => updateFilter("parentDivisions", value)}
                    />

                    <MultiSelectField
                        label="Sub-Division"
                        values={filters.subDivisions}
                        options={cascadingFilterOptions.subDivisions}
                        onChange={(value) => updateFilter("subDivisions", value)}
                    />

                    <div style={{ minWidth: 0 }}>
                        <label style={styles.filterLabel}>Reporting Currency</label>
                        <div
                            style={{
                                ...styles.filterInput,
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                color: "#334155",
                                fontWeight: 700,
                                background: "#FFFFFF",
                                cursor: "default",
                            }}
                        >
                            {filterOptions.reportingCurrency || "AED"}
                        </div>
                    </div>

                    <div style={{ minWidth: 0 }}>
                        <label style={styles.filterLabel}>As On Date</label>
                        <CalendarDateField
                            value={filters.asOnDate || ""}
                            onChange={(value) => updateFilter("asOnDate", value)}
                            width="100%"
                        />
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
                        onClick={resetFilters}
                        style={{
                            height: "32px",
                            border: "none",
                            background: "transparent",
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
                                value={formatAmount(kpis?.trade_working_capital, currency)}
                                subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
                                icon="↗"
                            />
                            <KpiCard
                                title="Trade Receivables"
                                value={formatAmount(kpis?.total_receivables, currency)}
                                subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
                                icon="◔"
                            />
                            <KpiCard
                                title="Inventory"
                                value={formatAmount(kpis?.total_inventory, currency)}
                                subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
                                icon="▦"
                            />
                            <KpiCard
                                title="Trade Payables"
                                value={formatAmount(kpis?.total_payables, currency)}
                                subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
                                icon="◒"
                            />
                            <KpiCard
                                title="Working Capital Ratio"
                                value={toNumber(kpis?.working_capital_ratio ?? kpis?.current_ratio) === null ? "—" : toNumber(kpis?.working_capital_ratio ?? kpis?.current_ratio).toFixed(2)}
                                subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
                                icon="◔"
                            />
                            <KpiCard
                                title="DSO"
                                value={toNumber(kpis?.dso_days) === null ? "—" : `${toNumber(kpis.dso_days).toFixed(2)} Days`}
                                subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
                                icon="◷"
                            />
                            <KpiCard
                                title="DIO"
                                value={toNumber(kpis?.dio_days) === null ? "—" : `${toNumber(kpis.dio_days).toFixed(2)} Days`}
                                subtitle={toNumber(kpis?.dio_days) === null ? "Insufficient history" : operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
                                icon="▦"
                            />
                            <KpiCard
                                title="DPO"
                                value={toNumber(kpis?.dpo_days) === null ? "—" : `${toNumber(kpis.dpo_days).toFixed(2)} Days`}
                                subtitle={operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
                                icon="◒"
                            />
                            <KpiCard
                                title="CCC"
                                value={toNumber(kpis?.cash_conversion_cycle_days) === null ? "—" : `${toNumber(kpis.cash_conversion_cycle_days).toFixed(2)} Days`}
                                subtitle={toNumber(kpis?.cash_conversion_cycle_days) === null ? "Insufficient history" : operationalDate !== "—" ? `As of ${formatDate(operationalDate)}` : undefined}
                                icon="◴"
                            />
                            <KpiCard
                                title="Target CCC"
                                value={(() => {
                                    const target = toNumber(
                                        getValue(
                                            kpis,
                                            "target_ccc_days",
                                            "target_cash_conversion_cycle_days",
                                            "target_cash_conversion_cycle",
                                            "ccc_target_days",
                                            "ccc_target",
                                            "target_ccc"
                                        )
                                    );
                                    return target === null ? "—" : `${target.toFixed(2)} Days`;
                                })()}
                                subtitle="Backend target"
                                icon="◎"
                            />
                        </div>

                        {/* ==================================================
                        TRADE WORKING CAPITAL TREND
                    ================================================== */}

                        <div
                            className="wc-sales-main-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                gap: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <TradeWorkingCapitalTrendPanel
                                data={tradeTrend}
                                currency={currency}
                                onViewAll={() => openViewAll("trade")}
                            />

                            <TradeWorkingCapitalComponents
                                components={componentData}
                                currency={currency}
                                onViewAll={() => openViewAll("components")}
                            />
                        </div>

                        {/* ==================================================
                        WORKING CAPITAL BY PARENT / SUB-DIVISION
                        ==================================================
                        No Trade Working Capital View-All API is prefetched here.

                        View All is requested only by the explicit Trade Working
                        Capital View All action, once for the selected scope.
                        ================================================== */}

                        {/* ==================================================
                        PARENT DIVISION / SUB-DIVISION WORKING CAPITAL TRENDS

                        Dashboard = Charts
                        View All = Common detailed table
                    ================================================== */}

                        <div
                            className="wc-sales-main-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                gap: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <HierarchyTrendChart
                                data={subDivisionTrend}
                                currency={currency}
                                title={`Working Capital by Sub-Division (${currency})`}
                                levelLabel="Sub-Division"
                                onViewAll={() => openViewAll("cfo", null, "Sub-Division")}
                                onExportExcel={() =>
                                    exportTrendToExcel(
                                        subDivisionTrend,
                                        "Working Capital by Sub-Division",
                                        currency,
                                        "Working Capital"
                                    )
                                }
                                onExportPdf={() =>
                                    exportTrendToPdf(
                                        subDivisionTrend,
                                        "Working Capital by Sub-Division",
                                        currency,
                                        "Working Capital"
                                    )
                                }
                            />

                            <HierarchyTrendChart
                                data={parentDivisionTrend}
                                currency={currency}
                                title={`Working Capital by Parent Division (${currency})`}
                                levelLabel="Parent Division"
                                onViewAll={() => openViewAll("cfo", null, "Parent Division")}
                                onExportExcel={() =>
                                    exportTrendToExcel(
                                        parentDivisionTrend,
                                        "Working Capital by Parent Division",
                                        currency,
                                        "Working Capital"
                                    )
                                }
                                onExportPdf={() =>
                                    exportTrendToPdf(
                                        parentDivisionTrend,
                                        "Working Capital by Parent Division",
                                        currency,
                                        "Working Capital"
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
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                gap: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <CashConversionCycle
                                kpis={kpis}
                                cccPayload={ccc}
                                operationalDate={operationalDate}
                            />

                            <div className="wc-panel-animate" style={styles.panel}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <h3
                                        style={{
                                            ...styles.panelTitle,
                                            marginBottom: 0,
                                        }}
                                    >
                                        Cash Conversion Cycle Trend (Days)
                                    </h3>

                                    <ActionMenu
                                        items={[
                                            {
                                                key: "view-all",
                                                label: "🔎 View All",
                                                onClick: () => openViewAll("ccc"),
                                            },
                                        ]}
                                    />
                                </div>

                                <CccTrendMini data={cccTrend} />
                            </div>
                        </div>

                    </>
                )}

                {/* ==================================================
                    FOOTER — matched to Sales Revenue
                ================================================== */}
                <div
                    className="wc-sales-footer"
                    style={{
                        fontSize: "0.65rem",
                        color: C.muted,
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: 10,
                        paddingBottom: 4,
                        marginTop: 2,
                        flexWrap: "wrap",
                        gap: 4,
                        borderTop: "1px solid #F1F5F9",
                    }}
                >
                    <span>
                        All values are in <strong>{currency || "—"}</strong>&nbsp;|&nbsp;
                        {operationalDate && operationalDate !== "—"
                            ? `Last Updated On: ${formatDate(operationalDate)}`
                            : ""}
                        &nbsp;|&nbsp;
                        <span style={{ color: C.green, fontWeight: 700 }}>● Live</span>
                    </span>
                    <span>☁️ Source: Oracle Fusion Cloud</span>
                </div>

                {viewAll && (
                    <ViewAllModal
                        title={viewAll.title}
                        rows={viewAll.rows}
                        currency={currency}
                        type={viewAll.type}
                        monthOnMonthRows={viewAll.monthOnMonthRows || []}
                        onClose={() => setViewAll(null)}
                        filterOptions={filterOptions}
                        baseFilters={viewAll.filters || appliedFilters || filters}
                        loading={viewAllLoading}
                        onApplyFilters={(nextFilters) => openViewAll(viewAll.type, nextFilters, viewAll.cfoViewLabel)}
                        onExport={
                            viewAll.type === "cfo"
                                ? handleCfoViewAllExport
                                : handleExport
                        }
                    />
                )}
            </div>
        </>
    );
}

/* ============================================================
   EXTRA VISUALS
============================================================ */

function HierarchyTrendChart({
    data,
    currency,
    title,
    levelLabel,
    onViewAll,
    onExportExcel,
    onExportPdf,
}) {
    const rows = Array.isArray(data) ? data : [];
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [parentHoveredIndex, setParentHoveredIndex] = useState(null);
    const [parentTooltipPosition, setParentTooltipPosition] = useState(null);

    /*
     * Keep the existing backend response handling exactly as-is.
     * The dashboard still consumes the individual hierarchy trend APIs:
     *   Parent Division -> /trend/parent-divisions
     *   Sub-Division   -> /trend/subdivisions
     *
     * Only the visual presentation changes here.
     */
    const periods = Array.from(
        new Set(rows.map((row) => String(row.period ?? "")))
    ).filter(Boolean);

    const latestPeriod = periods.length
        ? periods[periods.length - 1]
        : null;

    const latestRows = rows
        .filter((row) => String(row.period ?? "") === String(latestPeriod))
        .filter(
            (row) =>
                row?.name &&
                row.name !== "—" &&
                toNumber(row.value) !== null
        )
        .map((row) => ({
            ...row,
            value: toNumber(row.value),
        }))
        .sort((a, b) => {
            const av = Number.isFinite(a.value) ? a.value : -Infinity;
            const bv = Number.isFinite(b.value) ? b.value : -Infinity;
            return bv - av;
        });

    const visibleRows = latestRows.slice(0, 6);

    /* ============================================================
       SALES REVENUE STYLE — SUB-DIVISION

       This branch intentionally mirrors the Revenue by Sub-Division
       chart:
       - vertical bars
       - compact 6-item display
       - gradient bars
       - rounded tops
       - value labels above bars
       - light dotted grid
       - compact navy/secondary typography
       - animated bars
       - white custom tooltip
       - two-line long-name handling
    ============================================================ */
    if (levelLabel === "Sub-Division") {
        const chartRows = visibleRows.map((row, index) => ({
            ...row,
            chartIndex: index,
        }));

        const splitLabel = (label) => {
            const text = String(label ?? "—").trim();
            if (text.length <= 15) return [text];

            const words = text.split(/\s+/).filter(Boolean);
            if (words.length <= 1) {
                return [
                    text.slice(0, Math.ceil(text.length / 2)),
                    text.slice(Math.ceil(text.length / 2)),
                ];
            }

            let line1 = "";
            let line2 = "";

            words.forEach((word) => {
                const candidate = line1
                    ? `${line1} ${word}`
                    : word;

                if (
                    candidate.length <= 15 ||
                    !line1
                ) {
                    line1 = candidate;
                } else {
                    line2 = line2
                        ? `${line2} ${word}`
                        : word;
                }
            });

            if (!line2 && line1.length > 15) {
                const midpoint = Math.ceil(line1.length / 2);
                const firstSpace = line1.lastIndexOf(" ", midpoint);

                if (firstSpace > 4) {
                    line2 = line1.slice(firstSpace + 1);
                    line1 = line1.slice(0, firstSpace);
                } else {
                    line2 = line1.slice(midpoint);
                    line1 = line1.slice(0, midpoint);
                }
            }

            return line2 ? [line1, line2] : [line1];
        };

        const formatAxisValue = (value) => {
            const number = toNumber(value);
            if (number === null) return "—";

            const abs = Math.abs(number);
            if (abs >= 1_000_000_000) {
                return `${(number / 1_000_000_000).toFixed(1)}B`;
            }
            if (abs >= 1_000_000) {
                return `${(number / 1_000_000).toFixed(1)}M`;
            }
            if (abs >= 1_000) {
                return `${(number / 1_000).toFixed(1)}K`;
            }
            return Number(number).toLocaleString(undefined, {
                maximumFractionDigits: 1,
            });
        };

        const maxValue = Math.max(
            ...chartRows.map((row) => Math.abs(toNumber(row.value) ?? 0)),
            1
        );

        const chartData = chartRows.map((row) => ({
            name: row.name,
            value: row.value,
            original: row,
        }));

        const colors = [
            "#10B981",
            "#3B82F6",
            "#F59E0B",
            "#8B5CF6",
            "#06B6D4",
            "#F43F5E",
        ];

        const chartKey = `wc-subdivision-${String(latestPeriod ?? "latest")}`
            .replace(/[^a-zA-Z0-9_-]/g, "-");

        return (
            <div
                className="wc-panel-animate wc-chart-enter wc-hierarchy-exposure-panel"
                style={{
                    ...styles.panel,
                    position: "relative",
                    overflow: "visible",
                    padding: "14px 18px 10px",
                    minHeight: 340,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 10,
                        marginBottom: 10,
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <h3
                            style={{
                                ...styles.panelTitle,
                                marginBottom: 2,
                                fontSize: "0.88rem",
                                fontWeight: 800,
                                color: C.navy,
                            }}
                        >
                            {title}
                        </h3>

                        <div
                            style={{
                                fontSize: "0.68rem",
                                color: C.muted,
                                marginTop: 2,
                                lineHeight: 1.35,
                            }}
                        >
                            {currency || "AED"} — all sub-divisions compared
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
                                key: "export-excel",
                                label: "📊 Export Excel",
                                onClick: onExportExcel,
                                disabled: typeof onExportExcel !== "function",
                            },
                            {
                                key: "export-pdf",
                                label: "📄 Export PDF",
                                onClick: onExportPdf,
                                disabled: typeof onExportPdf !== "function",
                            },
                        ]}
                    />
                </div>

                {!chartRows.length ? (
                    <div
                        style={{
                            minHeight: 240,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: C.muted,
                            fontSize: "0.8rem",
                        }}
                    >
                        No data
                    </div>
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: 285,
                            marginTop: 2,
                            position: "relative",
                        }}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                            minWidth={0}
                            minHeight={220}
                        >
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 28,
                                    right: 14,
                                    left: 10,
                                    bottom: 58,
                                }}
                                onMouseMove={(state) => {
                                    const index = state?.activeTooltipIndex;
                                    setHoveredIndex(
                                        index === undefined || index === null
                                            ? null
                                            : Number(index)
                                    );
                                }}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <CartesianGrid
                                    vertical={false}
                                    stroke="#F1F5F9"
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="name"
                                    axisLine={{ stroke: "#E2E8F0" }}
                                    tickLine={false}
                                    interval={0}
                                    height={58}
                                    tick={(props) => {
                                        const { x, y, payload } = props;
                                        const lines = splitLabel(payload?.value).slice(0, 2);

                                        return (
                                            <g transform={`translate(${x},${y})`}>
                                                <text
                                                    x={0}
                                                    y={0}
                                                    textAnchor="middle"
                                                    fill="#64748B"
                                                    style={{
                                                        fontSize: "10px",
                                                        fontWeight: 600,
                                                        fontFamily:
                                                            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                                                    }}
                                                >
                                                    {lines.map((line, lineIndex) => (
                                                        <tspan
                                                            key={`${line}-${lineIndex}`}
                                                            x={0}
                                                            dy={lineIndex === 0 ? 12 : 13}
                                                        >
                                                            {line}
                                                        </tspan>
                                                    ))}
                                                </text>
                                            </g>
                                        );
                                    }}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fontSize: 10,
                                        fill: "#94A3B8",
                                        fontWeight: 600,
                                    }}
                                    tickFormatter={formatAxisValue}
                                    width={44}
                                    domain={[0, Math.ceil(maxValue * 1.12)]}
                                />

                                <Tooltip
                                    cursor={{
                                        stroke: "#CBD5E1",
                                        strokeWidth: 1,
                                        strokeDasharray: "4 4",
                                    }}
                                    offset={18}
                                    wrapperStyle={{
                                        zIndex: 100,
                                        pointerEvents: "none",
                                    }}
                                    content={(props) => {
                                        const { active, payload } = props;

                                        if (!active || !payload || !payload.length) {
                                            return null;
                                        }

                                        const item = payload[0]?.payload;
                                        const index = chartData.findIndex(
                                            (entry) => entry.name === item?.name
                                        );
                                        const color = colors[Math.max(index, 0) % colors.length];

                                        return (
                                            <div
                                                style={{
                                                    background: "#FFFFFF",
                                                    border: `1px solid ${C.border}`,
                                                    borderRadius: 10,
                                                    padding: "12px 16px",
                                                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                                    minWidth: 190,
                                                    fontFamily:
                                                        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 800,
                                                        color: "#1E293B",
                                                        marginBottom: 8,
                                                        fontSize: "0.85rem",
                                                        lineHeight: 1.25,
                                                        maxWidth: 240,
                                                    }}
                                                >
                                                    {item?.name}
                                                </div>
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "auto 1fr",
                                                        gap: "6px 16px",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: "#64748B",
                                                            fontSize: "0.75rem",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display: "inline-block",
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: 2,
                                                                background: color,
                                                                marginRight: 6,
                                                            }}
                                                        />
                                                        Working Capital:
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontWeight: 800,
                                                            color: "#0F172A",
                                                            fontSize: "0.85rem",
                                                            textAlign: "right",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {currency || "AED"} {Number(item?.value || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />

                                <Bar
                                    dataKey="value"
                                    name="Working Capital"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={54}
                                    isAnimationActive={true}
                                    animationDuration={800}
                                    animationEasing="ease-in-out"
                                    fill="#4338CA"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`wc-subdivision-cell-${index}`}
                                            fill={colors[index % colors.length]}
                                            opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.72}
                                        />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="top"
                                        offset={8}
                                        formatter={formatAxisValue}
                                        style={{
                                            fill: "#1E293B",
                                            fontSize: 11,
                                            fontWeight: 700,
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        );
    }

    /* ============================================================
       PARENT DIVISION — keep the existing Payables-style horizontal
       exposure presentation. This branch is intentionally unchanged
       in behavior and remains the second chart on the dashboard.
    ============================================================ */

    const barPalette = [
        "#F43F5E",
        "#F97316",
        "#06B6D4",
        "#65C800",
        "#EC3FA5",
        "#94A3B8",
    ];

    const maxValue = Math.max(
        ...visibleRows.map((row) => Math.abs(toNumber(row.value) ?? 0)),
        1
    );

    const rowHeight = 47;
    const chartHeight = Math.max(visibleRows.length * rowHeight + 22, 118);
    const parentTooltipWidth = 232;
    const parentTooltipHeight = 92;
    const axisTickCount = 5;

    return (
        <div
            className="wc-panel-animate wc-chart-enter wc-hierarchy-exposure-panel"
            style={{
                ...styles.panel,
                position: "relative",
                overflow: "visible",
                padding: "12px 12px 10px",
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
                            color: "#64748B",
                            fontWeight: 500,
                            marginTop: 2,
                            lineHeight: 1.35,
                        }}
                    >
                        Working Capital exposure across {levelLabel.toLowerCase()}s
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
                            key: "export-excel",
                            label: "📊 Export Excel",
                            onClick: onExportExcel,
                            disabled: typeof onExportExcel !== "function",
                        },
                        {
                            key: "export-pdf",
                            label: "📄 Export PDF",
                            onClick: onExportPdf,
                            disabled: typeof onExportPdf !== "function",
                        },
                    ]}
                />
            </div>

            {!visibleRows.length ? (
                <div
                    style={{
                        minHeight: 210,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#98A2B3",
                        fontSize: "10px",
                    }}
                >
                    No {levelLabel} trend data available.
                </div>
            ) : (
                <div
                    style={{
                        position: "relative",
                        marginTop: 8,
                        minHeight: chartHeight,
                        paddingTop: 1,
                    }}
                    onMouseLeave={() => {
                        setParentHoveredIndex(null);
                        setParentTooltipPosition(null);
                    }}
                >
                    {visibleRows.map((row, index) => {
                        const value = toNumber(row.value);
                        const barColor = barPalette[index % barPalette.length];
                        const percentage =
                            maxValue > 0
                                ? Math.max(
                                    0,
                                    Math.min(
                                        100,
                                        (Math.abs(value ?? 0) / maxValue) * 100
                                    )
                                )
                                : 0;

                        const isHovered = parentHoveredIndex === index;

                        return (
                            <div
                                key={`${row.name}-${row.period}-${index}`}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "minmax(0, 1fr) 76px",
                                    alignItems: "center",
                                    columnGap: 8,
                                    minHeight: 39,
                                    marginBottom:
                                        index === visibleRows.length - 1 ? 0 : 4,
                                    position: "relative",
                                    cursor: "pointer",
                                    padding: "2px 0",
                                    borderRadius: 8,
                                    background: isHovered ? "rgba(248,250,252,.92)" : "transparent",
                                    transition: "background .16s ease",
                                }}
                                onMouseEnter={(event) => {
                                    setParentHoveredIndex(index);
                                    setParentTooltipPosition({
                                        x: event.clientX,
                                        y: event.clientY,
                                    });
                                }}
                                onMouseMove={(event) => {
                                    setParentTooltipPosition({
                                        x: event.clientX,
                                        y: event.clientY,
                                    });
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 8,
                                            marginBottom: 6,
                                        }}
                                    >
                                        <span
                                            title={String(row.name)}
                                            style={{
                                                minWidth: 0,
                                                color: isHovered
                                                    ? "#1E3A8A"
                                                    : "#334155",
                                                fontSize: "0.72rem",
                                                lineHeight: 1.15,
                                                fontWeight: 700,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                transition: "color .16s ease",
                                            }}
                                        >
                                            {row.name}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            height: 10,
                                            width: "100%",
                                            background: "#EDF2F7",
                                            borderRadius: 999,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${percentage}%`,
                                                height: "100%",
                                                minWidth:
                                                    value !== null && value !== 0
                                                        ? "3px"
                                                        : 0,
                                                background: barColor,
                                                borderRadius: 999,
                                                transformOrigin:
                                                    "left center",
                                                animation: `wcBarGrow .62s cubic-bezier(.4,0,.2,1) ${index * 55}ms both`,
                                                opacity:
                                                    parentHoveredIndex === null ||
                                                        isHovered
                                                        ? 1
                                                        : 0.72,
                                                boxShadow: isHovered
                                                    ? `0 2px 8px ${barColor}55`
                                                    : "none",
                                                transform:
                                                    isHovered ? "scaleY(1.18)" : "scaleY(1)",
                                                transition:
                                                    "width .35s ease, opacity .18s ease, box-shadow .18s ease, transform .18s ease",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div
                                    style={{
                                        textAlign: "right",
                                        color: isHovered
                                            ? "#1E3A8A"
                                            : "#1E293B",
                                        fontSize: "0.76rem",
                                        lineHeight: 1.1,
                                        fontWeight: 800,
                                        whiteSpace: "nowrap",
                                        transition: "color .16s ease",
                                    }}
                                >
                                    {formatAmount(value, "", true)}
                                </div>

                                {isHovered && typeof document !== "undefined" && createPortal(
                                    <div
                                        style={{
                                            position: "fixed",
                                            zIndex: 5000,
                                            left: parentTooltipPosition
                                                ? Math.min(
                                                    Math.max(
                                                        parentTooltipPosition.x + 16,
                                                        8
                                                    ),
                                                    Math.max(
                                                        8,
                                                        window.innerWidth -
                                                        parentTooltipWidth -
                                                        8
                                                    )
                                                )
                                                : 8,
                                            top: parentTooltipPosition
                                                ? (
                                                    parentTooltipPosition.y +
                                                        16 +
                                                        parentTooltipHeight >
                                                        window.innerHeight - 8
                                                        ? Math.max(
                                                            8,
                                                            parentTooltipPosition.y -
                                                            parentTooltipHeight -
                                                            16
                                                        )
                                                        : Math.min(
                                                            parentTooltipPosition.y + 16,
                                                            Math.max(
                                                                8,
                                                                window.innerHeight -
                                                                parentTooltipHeight -
                                                                8
                                                            )
                                                        )
                                                )
                                                : 8,
                                            width: parentTooltipWidth,
                                            boxSizing: "border-box",
                                            padding: "12px 16px",
                                            borderRadius: 10,
                                            background: "#FFFFFF",
                                            border: `1px solid ${C.border}`,
                                            boxShadow:
                                                "0 10px 28px rgba(15,23,42,.16)",
                                            animation:
                                                "wcTooltipIn .14s ease-out forwards",
                                            pointerEvents: "none",
                                            fontFamily:
                                                "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontWeight: 800,
                                                color: "#1E293B",
                                                marginBottom: 8,
                                                fontSize: "0.85rem",
                                                lineHeight: 1.25,
                                            }}
                                        >
                                            {row.name}
                                        </div>

                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "auto 1fr",
                                                gap: "6px 16px",
                                                alignItems: "center",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "#64748B",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: 2,
                                                        background: barColor,
                                                        marginRight: 6,
                                                    }}
                                                />
                                                Working Capital:
                                            </span>

                                            <span
                                                style={{
                                                    fontWeight: 800,
                                                    color: "#0F172A",
                                                    fontSize: "0.85rem",
                                                    textAlign: "right",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {formatAmount(
                                                    value,
                                                    currency,
                                                    false
                                                )}
                                            </span>
                                        </div>
                                    </div>,
                                    document.body
                                )}
                            </div>
                        );
                    })}
                </div>

            )}

            {visibleRows.length > 0 && (
                <div
                    style={{
                        marginTop: 8,
                        padding: "7px 76px 0 0",
                        borderTop: "1px solid #E2E8F0",
                        display: "grid",
                        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                        alignItems: "start",
                        gap: 0,
                    }}
                >
                    {Array.from({ length: 5 }, (_, tickIndex) => {
                        const fraction = tickIndex / 4;
                        const axisValue = maxValue * fraction;

                        return (
                            <div
                                key={`parent-x-axis-${tickIndex}`}
                                style={{
                                    position: "relative",
                                    textAlign:
                                        tickIndex === 0
                                            ? "left"
                                            : tickIndex === 4
                                                ? "right"
                                                : "center",
                                    color: "#94A3B8",
                                    fontSize: "0.58rem",
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                }}
                            >
                                <span
                                    style={{
                                        position: "absolute",
                                        top: -8,
                                        left:
                                            tickIndex === 0
                                                ? 0
                                                : tickIndex === 4
                                                    ? "auto"
                                                    : "50%",
                                        right:
                                            tickIndex === 4 ? 0 : "auto",
                                        width: 1,
                                        height: 5,
                                        background: "#CBD5E1",
                                        transform:
                                            tickIndex === 0 || tickIndex === 4
                                                ? "none"
                                                : "translateX(-50%)",
                                    }}
                                />
                                {formatAmount(axisValue, "", true)}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function TradeWorkingCapitalTrendPanel({
    data,
    currency,
    onViewAll,
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
    const rows = Array.isArray(data)
        ? data.slice(-6)
        : [];

    const [hoveredPoint, setHoveredPoint] = useState(null);

    const series = [
        {
            key: "dso",
            label: "DSO",
            color: "#4F46E5",
        },
        {
            key: "dio",
            label: "DIO",
            color: "#10B981",
        },
        {
            key: "dpo",
            label: "DPO",
            color: "#F59E0B",
        },
        {
            key: "ccc",
            label: "CCC",
            color: "#EC4899",
        },
    ];

    if (!rows.length) {
        return (
            <div
                style={{
                    color: "#98A2B3",
                    fontSize: "10px",
                    padding: "25px 0",
                    textAlign: "center",
                }}
            >
                No CCC history available.
            </div>
        );
    }

    const hasAnyValue = series.some((item) =>
        rows.some(
            (row) =>
                toNumber(row?.[item.key]) !== null
        )
    );

    if (!hasAnyValue) {
        return (
            <div
                style={{
                    color: "#98A2B3",
                    fontSize: "10px",
                    padding: "25px 0",
                    textAlign: "center",
                }}
            >
                No CCC history available.
            </div>
        );
    }

    const width = 620;
    const height = 250;

    const margin = {
        top: 30,
        right: 18,
        bottom: 48,
        left: 42,
    };

    const chartWidth =
        width - margin.left - margin.right;

    const chartHeight =
        height - margin.top - margin.bottom;

    /*
     * Only real backend numeric values participate
     * in the Y-axis calculation.
     *
     * null values are deliberately ignored.
     * We do NOT calculate DIO or CCC on the frontend.
     */
    const numericValues = [];

    rows.forEach((row) => {
        series.forEach((item) => {
            const value = toNumber(
                row?.[item.key]
            );

            if (value !== null) {
                numericValues.push(value);
            }
        });
    });

    if (!numericValues.length) {
        return (
            <div
                style={{
                    color: "#98A2B3",
                    fontSize: "10px",
                    padding: "25px 0",
                    textAlign: "center",
                }}
            >
                No CCC history available.
            </div>
        );
    }

    const minValue = Math.min(
        0,
        ...numericValues
    );

    const maxValue = Math.max(
        ...numericValues
    );

    const range =
        maxValue - minValue || 1;

    const padding =
        Math.max(range * 0.12, 5);

    const yMin =
        Math.min(0, minValue - padding);

    const yMax =
        maxValue + padding;

    const yRange =
        yMax - yMin || 1;

    const xStep =
        rows.length > 1
            ? chartWidth / (rows.length - 1)
            : 0;

    const getX = (index) =>
        margin.left +
        (rows.length === 1
            ? chartWidth / 2
            : index * xStep);

    const getY = (value) =>
        margin.top +
        chartHeight -
        ((value - yMin) / yRange) *
        chartHeight;

    /*
     * Creates line segments only between
     * consecutive valid backend values.
     *
     * Example:
     * 334 -> null -> 300
     *
     * will NOT draw a fake line across null.
     */
    const buildSegments = (key) => {
        const segments = [];
        let current = [];

        rows.forEach((row, index) => {
            const value = toNumber(
                row?.[key]
            );

            if (value === null) {
                if (current.length) {
                    segments.push(current);
                    current = [];
                }

                return;
            }

            current.push({
                index,
                value,
                x: getX(index),
                y: getY(value),
            });
        });

        if (current.length) {
            segments.push(current);
        }

        return segments;
    };

    const formatPeriod = (row) => {
        const monthNames = [
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

        const rawPeriod = String(row?.period ?? "").trim();

        // Backend monthly periods such as 2026-06 are displayed as 2026-Jun.
        if (/^\d{4}-\d{1,2}$/.test(rawPeriod)) {
            const [year, month] = rawPeriod.split("-");
            const monthIndex = Number(month) - 1;

            if (monthIndex >= 0 && monthIndex < 12) {
                return `${year}-${monthNames[monthIndex]}`;
            }
        }

        if (rawPeriod) {
            return rawPeriod;
        }

        if (
            row?.year !== undefined &&
            row?.month !== undefined
        ) {
            const monthIndex = Number(row.month) - 1;

            if (monthIndex >= 0 && monthIndex < 12) {
                return `${row.year}-${monthNames[monthIndex]}`;
            }

            return `${row.year}-${String(row.month).padStart(2, "0")}`;
        }

        return "—";
    };

    const formatValue = (value) =>
        value === null
            ? "—"
            : `${value.toFixed(2)} Days`;

    /*
     * Five horizontal grid levels.
     */
    const gridCount = 5;

    const gridLines = Array.from(
        { length: gridCount },
        (_, index) => {
            const ratio =
                index /
                (gridCount - 1);

            const value =
                yMax -
                ratio * yRange;

            return {
                value,
                y: getY(value),
            };
        }
    );

    return (
        <div
            style={{
                marginTop: "8px",
                width: "100%",
                overflowX: "auto",
            }}
        >
            {/* Legend */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "5px",
                }}
            >
                {series.map((item) => {
                    const hasValue =
                        rows.some(
                            (row) =>
                                toNumber(
                                    row?.[
                                    item.key
                                    ]
                                ) !== null
                        );

                    return (
                        <div
                            key={item.key}
                            style={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: "5px",
                                fontSize:
                                    "9px",
                                color:
                                    hasValue
                                        ? "#475467"
                                        : "#98A2B3",
                                fontWeight: 600,
                            }}
                        >
                            <span
                                style={{
                                    width:
                                        "7px",
                                    height:
                                        "7px",
                                    borderRadius:
                                        "50%",
                                    background:
                                        hasValue
                                            ? item.color
                                            : "#CBD5E1",
                                    display:
                                        "inline-block",
                                }}
                            />

                            {item.label}

                            {!hasValue && (
                                <span
                                    style={{
                                        fontWeight:
                                            400,
                                        fontSize:
                                            "8px",
                                    }}
                                >
                                    —
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <svg
                viewBox={`0 0 ${width} ${height}`}
                width="100%"
                height="250"
                role="img"
                aria-label="Cash Conversion Cycle trend showing DSO, DIO, DPO and CCC"
                style={{
                    display: "block",
                    minWidth: "520px",
                    overflow: "visible",
                }}
                onMouseLeave={() => setHoveredPoint(null)}
            >
                {/* Y-axis grid */}
                {gridLines.map(
                    (grid, index) => (
                        <g
                            key={`grid-${index}`}
                        >
                            <line
                                x1={
                                    margin.left
                                }
                                x2={
                                    width -
                                    margin.right
                                }
                                y1={grid.y}
                                y2={grid.y}
                                stroke="#E2E8F0"
                                strokeWidth="1"
                                strokeDasharray="3 4"
                            />

                            <text
                                x={
                                    margin.left -
                                    7
                                }
                                y={
                                    grid.y +
                                    3
                                }
                                textAnchor="end"
                                fontSize="8"
                                fill="#94A3B8"
                            >
                                {Math.round(
                                    grid.value
                                )}
                            </text>
                        </g>
                    )
                )}

                {/* X-axis */}
                <line
                    x1={margin.left}
                    x2={
                        width -
                        margin.right
                    }
                    y1={
                        margin.top +
                        chartHeight
                    }
                    y2={
                        margin.top +
                        chartHeight
                    }
                    stroke="#CBD5E1"
                    strokeWidth="1"
                />

                {/* Series */}
                {series.map((item) => {
                    const segments =
                        buildSegments(
                            item.key
                        );

                    return (
                        <g
                            key={item.key}
                        >
                            {segments.map(
                                (
                                    segment,
                                    segmentIndex
                                ) => {
                                    const points =
                                        segment
                                            .map(
                                                (
                                                    point
                                                ) =>
                                                    `${point.x},${point.y}`
                                            )
                                            .join(
                                                " "
                                            );

                                    return (
                                        <g
                                            key={`${item.key}-segment-${segmentIndex}`}
                                        >
                                            {/* Actual line */}
                                            {segment.length >
                                                1 && (
                                                    <>
                                                        <polyline
                                                            points={
                                                                points
                                                            }
                                                            fill="none"
                                                            stroke={
                                                                item.color
                                                            }
                                                            strokeWidth="2.2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />

                                                        {/* Subtle live-flow highlight travelling along this series. */}
                                                        <polyline
                                                            points={
                                                                points
                                                            }
                                                            fill="none"
                                                            stroke="#FFFFFF"
                                                            strokeWidth="1.6"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeDasharray="28 872"
                                                            strokeDashoffset="0"
                                                            opacity="0.5"
                                                            pointerEvents="none"
                                                            style={{
                                                                animation:
                                                                    "wcTrendLiveFlow 3.2s linear infinite",
                                                                animationDelay: `${segmentIndex * 180}ms`,
                                                            }}
                                                        />
                                                    </>
                                                )}

                                            {/* Data points */}
                                            {segment.map(
                                                (
                                                    point
                                                ) => {
                                                    const row =
                                                        rows[
                                                        point.index
                                                        ];

                                                    return (
                                                        <g
                                                            key={`${item.key}-${point.index}`}
                                                        >
                                                            <circle
                                                                cx={
                                                                    point.x
                                                                }
                                                                cy={
                                                                    point.y
                                                                }
                                                                r={
                                                                    hoveredPoint?.key === item.key &&
                                                                        hoveredPoint?.index === point.index
                                                                        ? "5.5"
                                                                        : "3.5"
                                                                }
                                                                fill="#FFFFFF"
                                                                stroke={
                                                                    item.color
                                                                }
                                                                strokeWidth={
                                                                    hoveredPoint?.key === item.key &&
                                                                        hoveredPoint?.index === point.index
                                                                        ? "2.5"
                                                                        : "2"
                                                                }
                                                                style={{
                                                                    cursor: "pointer",
                                                                    transition:
                                                                        "r .14s ease, stroke-width .14s ease",
                                                                }}
                                                                onMouseEnter={() =>
                                                                    setHoveredPoint({
                                                                        key: item.key,
                                                                        label: item.label,
                                                                        index: point.index,
                                                                        value: point.value,
                                                                        x: point.x,
                                                                        y: point.y,
                                                                    })
                                                                }
                                                                onMouseLeave={() =>
                                                                    setHoveredPoint(null)
                                                                }
                                                            />
                                                        </g>
                                                    );
                                                }
                                            )}
                                        </g>
                                    );
                                }
                            )}
                        </g>
                    );
                })}

                {/* X-axis labels */}
                {rows.map(
                    (row, index) => {
                        const x =
                            getX(index);

                        return (
                            <text
                                key={`period-${index}`}
                                x={x}
                                y={
                                    height -
                                    18
                                }
                                textAnchor="middle"
                                fontSize="8"
                                fill="#64748B"
                            >
                                {formatPeriod(
                                    row
                                )}
                            </text>
                        );
                    }
                )}

                {hoveredPoint && (() => {
                    const tooltipWidth = 174;
                    const tooltipHeight = 58;
                    const tooltipX = Math.min(
                        Math.max(
                            hoveredPoint.x - tooltipWidth / 2,
                            margin.left
                        ),
                        width - margin.right - tooltipWidth
                    );
                    const tooltipY =
                        hoveredPoint.y - tooltipHeight - 12 >= margin.top
                            ? hoveredPoint.y - tooltipHeight - 12
                            : Math.min(
                                height - margin.bottom - tooltipHeight,
                                hoveredPoint.y + 12
                            );

                    const row = rows[hoveredPoint.index];

                    return (
                        <g
                            pointerEvents="none"
                            style={{
                                filter:
                                    "drop-shadow(0 6px 14px rgba(15,23,42,.14))",
                            }}
                        >
                            <line
                                x1={hoveredPoint.x}
                                x2={hoveredPoint.x}
                                y1={margin.top}
                                y2={margin.top + chartHeight}
                                stroke="#94A3B8"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                                opacity="0.55"
                            />
                            <rect
                                x={tooltipX}
                                y={tooltipY}
                                width={tooltipWidth}
                                height={tooltipHeight}
                                rx="8"
                                fill="#FFFFFF"
                                stroke="#E2E8F0"
                            />
                            <text
                                x={tooltipX + 11}
                                y={tooltipY + 18}
                                fontSize="9"
                                fontWeight="700"
                                fill="#64748B"
                            >
                                {hoveredPoint.label} • {formatPeriod(row)}
                            </text>
                            <text
                                x={tooltipX + 11}
                                y={tooltipY + 40}
                                fontSize="13"
                                fontWeight="800"
                                fill="#0F172A"
                            >
                                {formatValue(hoveredPoint.value)}
                            </text>
                        </g>
                    );
                })()}
            </svg>

            {/* Backend null-state message */}
            {rows.some(
                (row) =>
                    toNumber(
                        row?.dio
                    ) === null ||
                    toNumber(
                        row?.ccc
                    ) === null
            ) && (
                    <div
                        style={{
                            marginTop:
                                "2px",
                            textAlign:
                                "center",
                            fontSize:
                                "8px",
                            color:
                                "#94A3B8",
                        }}
                    >
                        DIO and CCC require
                        sufficient inventory
                        history.
                    </div>
                )}
        </div>
    );
}