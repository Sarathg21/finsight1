

// import React, { useEffect, useState, useRef, useMemo } from "react";
// import {
//   getPayablesFilterOptions,
//   getPayablesDashboard,
//   getPayablesViewAll,
//   getPayablesBySubdivision,
//   getPayablesMonthOnMonth,
//   exportPayablesExcel,
//   exportPayablesPdf,
// } from "../api/payablesApi";

// /* ============================================================
//    PAYABLES DASHBOARD
//    ------------------------------------------------------------
//    Payables-specific filters:
//    - Legal Group
//    - Legal Entity
//    - Parent Division
//    - Sub-Division
//    - Reporting Currency
//    - As-On Date
//    - Aging Basis

//    No Business Unit filter.
//    ============================================================ */


// const PAYABLE_AGING_BUCKETS = [
//   "Current",
//   "0–30 Days",
//   "31–60 Days",
//   "61–90 Days",
//   "91–120 Days",
//   "121–180 Days",
//   "181–365 Days",
//   "Above 365 Days",
// ];

// const MONTHS = [
//   "Jan",
//   "Feb",
//   "Mar",
//   "Apr",
//   "May",
//   "Jun",
//   "Jul",
//   "Aug",
//   "Sep",
//   "Oct",
//   "Nov",
//   "Dec",
// ];

// /* ============================================================
//    DEFAULT FILTERS
//    ============================================================ */

// const defaultPayablesFilters = {
//   legal_group: ["All"],
//   legal_entities: ["All"],
//   parent_divisions: ["All"],
//   sub_divisions: ["All"],
//   reporting_currency: "AED",
//   as_on_date: "2024-04-30",

//   // VERY IMPORTANT:
//   // This value must always be sent to backend APIs later.
//   aging_basis: "Due Date Based",

//   year: 2024,
// };

// /* ============================================================
//    API NORMALIZATION / INTEGRATION HELPERS
//    ============================================================ */

// const emptyDashboardData = {
//   kpis: {},
//   agingSummary: [],
//   trend: [],
//   parentDivision: [],
//   topSuppliers: [],
//   overdueSummary: [],
//   subDivision: [],
//   monthOnMonth: [],
//   monthOnMonthYear: null,
//   viewAll: [],
//   viewAllSummary: {},
//   businessUnit: [],
// };

// const normalizeOption = (item) => {
//   if (item === null || item === undefined) return null;
//   if (typeof item === "string" || typeof item === "number") {
//     return { label: String(item), value: String(item) };
//   }

//   const value =
//     item.id ??
//     item.value ??
//     item.code ??
//     item.key ??
//     item.uuid ??
//     item.name;

//   const label =
//     item.label ??
//     item.name ??
//     item.title ??
//     item.description ??
//     item.code ??
//     value;

//   if (value === undefined || value === null || label === undefined || label === null) {
//     return null;
//   }

//   return {
//     label: String(label),
//     value: String(value),
//   };
// };

// const normalizeOptionList = (value) => {
//   if (!Array.isArray(value)) return [];
//   return value.map(normalizeOption).filter(Boolean);
// };

// const normalizeFilterOptions = (response) => {
//   const payload = response?.data?.data ?? response?.data ?? response ?? {};
//   const optionSource =
//     payload?.filters ??
//     payload?.filter_options ??
//     payload?.filterOptions ??
//     payload;

//   const pick = (...keys) => {
//     for (const key of keys) {
//       if (optionSource?.[key] !== undefined) return optionSource[key];
//       if (payload?.[key] !== undefined) return payload[key];
//     }
//     return [];
//   };

//   return {
//     legal_groups: normalizeOptionList(
//       pick("legal_groups", "legal_group", "legalGroup", "legal_group_options")
//     ),
//     legal_entities: normalizeOptionList(
//       pick("legal_entities", "legal_entity", "legalEntity", "legal_entity_options")
//     ),
//     parent_divisions: normalizeOptionList(
//       pick("parent_divisions", "parent_division", "parentDivision", "parent_division_options")
//     ),
//     sub_divisions: normalizeOptionList(
//       pick(
//         "sub_divisions",
//         "sub_division",
//         "subDivision",
//         "subdivision",
//         "subdivisions",
//         "subdivision_options",
//         "sub_division_options",
//         "subdivision_list"
//       )
//     ),
//     reporting_currencies: normalizeOptionList(
//       pick("reporting_currencies", "currencies", "currency", "reporting_currency")
//     ),
//     as_on_dates: normalizeOptionList(
//       pick("as_on_dates", "asOnDates", "dates", "as_of_dates", "as_on_date")
//     ).map((option) => ({
//       ...option,
//       label: toDisplayDate(option.label),
//     })),
//     aging_basis: normalizeOptionList(
//       pick("aging_basis", "aging_bases", "agingBasis", "aging_basis_options")
//     ),
//     years: Array.isArray(pick("years", "year"))
//       ? pick("years", "year").map((item) => Number(item)).filter(Number.isFinite)
//       : [],
//   };
// };

// const getOptionLabels = (options = []) =>
//   options.map((option) => option.label);

// const findOptionValue = (options = [], selected) => {
//   const match = options.find(
//     (option) =>
//       option.label === String(selected) ||
//       option.value === String(selected)
//   );
//   return match ? match.value : selected;
// };

// const toApiDate = (value) => {
//   if (!value) return undefined;
//   const text = String(value).trim();

//   if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
//     return text;
//   }

//   const parsed = new Date(text);
//   if (Number.isNaN(parsed.getTime())) return text;

//   const year = parsed.getFullYear();
//   const month = String(parsed.getMonth() + 1).padStart(2, "0");
//   const day = String(parsed.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const toDisplayDate = (value) => {
//   if (!value) return "";
//   const text = String(value).trim();

//   // As-On-Date UI format: yyyy-mm-dd
//   if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

//   const parsed = new Date(text);
//   if (Number.isNaN(parsed.getTime())) return text;

//   const year = parsed.getFullYear();
//   const month = String(parsed.getMonth() + 1).padStart(2, "0");
//   const day = String(parsed.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };

// const normalizeAgingBasis = (value) => {
//   const text = String(value || "DUE_DATE")
//     .trim()
//     .toUpperCase()
//     .replace(/[ -]/g, "_");

//   // Backend values:
//   // DUE_DATE -> Due Date Based
//   // INVOICE_DATE -> Invoice Date Based
//   // Also accept the backend labels when they are passed back from the UI.
//   if (text === "INVOICE_DATE" || text === "INVOICE_DATE_BASED") {
//     return "INVOICE_DATE";
//   }

//   return "DUE_DATE";
// };

// const displayAgingBasis = (value) =>
//   normalizeAgingBasis(value) === "INVOICE_DATE"
//     ? "Invoice Date Based"
//     : "Due Date Based";


// /* ============================================================
//    AGING BUCKET CODE HELPER
//    Shared by dashboard drilldowns and PayablesViewAll.
//    ============================================================ */
// const toAgingBucketCode = (value) => {
//   const text = String(value || "").trim().toUpperCase();

//   const normalized = text
//     .replace(/–/g, "-")
//     .replace(/—/g, "-")
//     .replace(/\\s+/g, "_");

//   const map = {
//     CURRENT: "CURRENT",
//     "0-30_DAYS": "0_30",
//     "0_30_DAYS": "0_30",
//     "0-30": "0_30",
//     "0_30": "0_30",
//     "31-60_DAYS": "31_60",
//     "31_60_DAYS": "31_60",
//     "31-60": "31_60",
//     "31_60": "31_60",
//     "61-90_DAYS": "61_90",
//     "61_90_DAYS": "61_90",
//     "61-90": "61_90",
//     "61_90": "61_90",
//     "91-120_DAYS": "91_120",
//     "91_120_DAYS": "91_120",
//     "91-120": "91_120",
//     "91_120": "91_120",
//     "121-180_DAYS": "121_180",
//     "121_180_DAYS": "121_180",
//     "121-180": "121_180",
//     "121_180": "121_180",
//     "181-365_DAYS": "181_365",
//     "181_365_DAYS": "181_365",
//     "181-365": "181_365",
//     "181_365": "181_365",
//     "ABOVE_365_DAYS": "ABOVE_365",
//     ABOVE_365: "ABOVE_365",
//   };

//   return map[normalized] || text;
// };

// const buildPayablesApiFilters = (filters = {}, optionMeta = {}) => {
//   const omitAll = (values, options) => {
//     const list = Array.isArray(values) ? values : values ? [values] : [];
//     return list
//       .filter((value) => String(value).toLowerCase() !== "all")
//       .map((value) => findOptionValue(options, value))
//       .filter((value) => value !== undefined && value !== null && value !== "");
//   };

//   const payload = {
//     aging_basis: normalizeAgingBasis(filters.aging_basis),
//     as_on_date: toApiDate(filters.as_on_date),
//     reporting_currency: filters.reporting_currency || "AED",
//   };

//   const legalGroups = omitAll(filters.legal_group, optionMeta.legal_groups);
//   const legalEntities = omitAll(filters.legal_entities, optionMeta.legal_entities);
//   const parentDivisions = omitAll(filters.parent_divisions, optionMeta.parent_divisions);
//   const subDivisions = omitAll(filters.sub_divisions, optionMeta.sub_divisions);

//   if (legalGroups.length) payload.legal_group_id = legalGroups;
//   if (legalEntities.length) payload.legal_entity_id = legalEntities;
//   if (parentDivisions.length) payload.parent_division_id = parentDivisions;
//   if (subDivisions.length) payload.subdivision_id = subDivisions;

//   return payload;
// };

// const firstOptionLabel = (options = [], fallback = "") =>
//   options.length ? options[0].label : fallback;

// const normalizeSubdivisionResponse = (response) => {
//   const payload = response?.data?.data ?? response?.data ?? response ?? {};

//   const rows =
//     Array.isArray(payload)
//       ? payload
//       : Array.isArray(payload?.data)
//         ? payload.data
//         : Array.isArray(payload?.records)
//           ? payload.records
//           : Array.isArray(payload?.rows)
//             ? payload.rows
//             : Array.isArray(payload?.by_subdivision)
//               ? payload.by_subdivision
//               : Array.isArray(payload?.sub_division)
//                 ? payload.sub_division
//                 : Array.isArray(payload?.sub_divisions)
//                   ? payload.sub_divisions
//                   : Array.isArray(payload?.subdivision_wise)
//                     ? payload.subdivision_wise
//                     : Array.isArray(payload?.subdivision_wise_data)
//                       ? payload.subdivision_wise_data
//                       : Array.isArray(payload?.subdivision_data)
//                         ? payload.subdivision_data
//                         : Array.isArray(payload?.items)
//                           ? payload.items
//                           : [];

//   return rows.map((item) => ({
//     ...item,
//     name:
//       item?.name ??
//       item?.subdivision_name ??
//       item?.sub_division_name ??
//       item?.subdivision ??
//       item?.sub_division ??
//       item?.label ??
//       "",
//     amount:
//       item?.amount ??
//       item?.total_payables ??
//       item?.total_payable ??
//       item?.payable_amount ??
//       item?.outstanding_amount ??
//       item?.total_amount ??
//       item?.total ??
//       0,
//     percentage:
//       item?.percentage ??
//       item?.percentage_of_total ??
//       item?.percent ??
//       item?.share_pct ??
//       item?.share_percentage ??
//       0,
//   }));
// };

// const normalizeMonthOnMonthResponse = (response) => {
//   const payload = response?.data?.data ?? response?.data ?? response ?? {};

//   const rows =
//     Array.isArray(payload)
//       ? payload
//       : Array.isArray(payload?.data)
//         ? payload.data
//         : Array.isArray(payload?.records)
//           ? payload.records
//           : Array.isArray(payload?.rows)
//             ? payload.rows
//             : Array.isArray(payload?.monthly_values)
//               ? payload.monthly_values
//               : payload?.monthly_values &&
//                 typeof payload.monthly_values === "object"
//                 ? [payload]
//                 : payload &&
//                   typeof payload === "object" &&
//                   Object.keys(payload).some((key) =>
//                     [
//                       "JAN",
//                       "FEB",
//                       "MAR",
//                       "APR",
//                       "MAY",
//                       "JUN",
//                       "JUL",
//                       "AUG",
//                       "SEP",
//                       "OCT",
//                       "NOV",
//                       "DEC",
//                     ].includes(String(key).toUpperCase())
//                   )
//                   ? [{ monthly_values: payload }]
//                   : [];

//   const normalizeMonthValue = (value) => {
//     // IMPORTANT: backend null means no successful snapshot.
//     // Keep null as null; never convert it to zero.
//     if (value === null || value === undefined || value === "") {
//       return value === null ? null : undefined;
//     }

//     return value;
//   };

//   return rows.map((item) => {
//     const monthlyValues = item?.monthly_values ?? item?.monthlyValues ?? {};

//     const row = {
//       ...item,
//       legal_entity:
//         item?.legal_entity ??
//         item?.legal_entity_name ??
//         item?.legalEntity ??
//         "",
//       parent_division:
//         item?.parent_division ??
//         item?.parent_division_name ??
//         item?.parentDivision ??
//         "",
//       sub_division:
//         item?.sub_division ??
//         item?.sub_division_name ??
//         item?.subdivision ??
//         item?.subdivision_name ??
//         "",
//     };

//     MONTHS.forEach((month) => {
//       const apiMonth = month.toUpperCase();
//       row[month] = normalizeMonthValue(
//         monthlyValues?.[apiMonth] ??
//         monthlyValues?.[month] ??
//         item?.[apiMonth] ??
//         item?.[month]
//       );
//     });

//     row.latest =
//       item?.latest ??
//       item?.latest_value ??
//       item?.latestValue ??
//       [...MONTHS]
//         .reverse()
//         .map((month) => row[month])
//         .find((value) => value !== null && value !== undefined);

//     return row;
//   });
// };

// const formatTrendMonth = (value) => {
//   if (!value) return "";

//   const text = String(value).trim();
//   const match = text.match(/^(\d{4})-(\d{2})-\d{2}$/);

//   if (match) {
//     const year = Number(match[1]);
//     const monthIndex = Number(match[2]) - 1;
//     if (monthIndex >= 0 && monthIndex < 12) {
//       return `${MONTHS[monthIndex]} ${year}`;
//     }
//   }

//   const parsed = new Date(text);
//   if (!Number.isNaN(parsed.getTime())) {
//     return `${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}`;
//   }

//   return text;
// };

// const normalizeDashboardResponse = (response) => {
//   const payload = response?.data?.data ?? response?.data ?? response ?? {};
//   const source = payload?.data ?? payload;
//   const k = source?.kpis ?? source?.KPI ?? source?.summary ?? {};

//   const getArray = (...keys) => {
//     for (const key of keys) {
//       if (Array.isArray(source?.[key])) return source[key];
//     }
//     return [];
//   };

//   const normalizeKpis = {
//     ...k,
//     total_payables:
//       k.total_payables ?? k.total ?? k.total_ar ?? k.total_outstanding ?? 0,
//     current_payables:
//       k.current_payables ?? k.current ?? k.current_amount ?? 0,
//     overdue_payables:
//       k.overdue_payables ?? k.overdue ?? k.overdue_amount ?? 0,
//     overdue_gt_90:
//       k.overdue_gt_90 ?? k.overdue_above_90 ?? k.overdue_above_90_days ?? k.above_90 ?? 0,
//     dpo: k.dpo ?? k.dpo_days ?? 0,
//     total_payables_variance:
//       k.total_payables_variance ?? k.total_variance ?? null,
//     current_payables_variance:
//       k.current_payables_variance ?? k.current_variance ?? null,
//     overdue_payables_variance:
//       k.overdue_payables_variance ?? k.overdue_variance ?? null,
//     overdue_gt_90_variance:
//       k.overdue_gt_90_variance ?? k.overdue_above_90_variance ?? null,
//     dpo_variance: k.dpo_variance ?? null,
//     previous_date: k.previous_date ?? k.previous_as_on_date ?? null,
//   };

//   const aging = getArray("aging_summary", "agingSummary", "aging", "aging_breakdown").map((item, index) => ({
//     ...item,
//     bucket_code: item.bucket_code ?? item.bucket ?? item.code ?? `BUCKET_${index}`,
//     bucket_name: item.bucket_name ?? item.bucket ?? item.label ?? item.bucket_code ?? `Bucket ${index + 1}`,
//     amount: item.amount ?? 0,
//     percentage: item.percentage ?? item.percentage_of_total ?? 0,
//   }));
//   const trend = getArray("trend", "payables_trend", "payablesTrend").map((item) => ({
//     ...item,
//     month: formatTrendMonth(item.as_on_date ?? item.snapshot_date ?? item.date ?? item.month ?? item.period ?? item.period_name),
//     total_payables: item.total_payables ?? item.total ?? item.amount ?? item.outstanding_amount ?? 0,
//     dpo: item.dpo ?? item.dpo_days ?? 0,
//   }));
//   const parentDivision = getArray("by_parent_division", "parent_division", "parent_divisions", "parentDivision", "division_breakdown").map((item) => ({
//     ...item,
//     name: item.name ?? item.parent_division ?? item.parent_division_name ?? item.label ?? "",
//     amount: item.amount ?? item.total_payables ?? item.payable_amount ?? item.outstanding_amount ?? 0,
//     percentage: item.percentage ?? item.percentage_of_total ?? item.percent ?? item.share_pct ?? 0,
//   }));
//   const topSuppliers = getArray("top_suppliers", "topSuppliers", "top_10_suppliers", "suppliers").map((item, index) => ({
//     ...item,
//     rank: item.rank ?? index + 1,
//     supplier_name: item.supplier_name ?? item.supplier ?? item.name ?? "",
//     payable_amount: item.payable_amount ?? item.total_payables ?? item.total_payable ?? item.outstanding_amount ?? 0,
//     percentage: item.percentage ?? item.percentage_of_total ?? item.percent ?? item.share_pct ?? 0,
//   }));
//   const businessUnit = getArray("by_business_unit", "business_unit", "business_units", "business_unit_breakdown", "businessUnit").map((item) => ({
//     ...item,
//     name: item.name ?? item.business_unit ?? item.business_unit_name ?? item.label ?? "",
//     amount: item.amount ?? item.total_payables ?? item.payable_amount ?? item.outstanding_amount ?? 0,
//     total_payables: item.total_payables ?? item.amount ?? 0,
//     current_payables: item.current_payables ?? item.current ?? 0,
//     overdue_payables: item.overdue_payables ?? item.overdue ?? 0,
//     percentage: item.percentage ?? item.percentage_of_total ?? item.percent ?? item.share_pct ?? 0,
//   }));

//   return {
//     ...emptyDashboardData,
//     kpis: normalizeKpis,
//     agingSummary: aging,
//     trend,
//     parentDivision,
//     topSuppliers,
//     businessUnit,
//     overdueSummary: getArray("overdue_summary", "overdueSummary", "overdue_breakdown").length
//       ? getArray("overdue_summary", "overdueSummary", "overdue_breakdown")
//       : aging.filter((item) => String(item.bucket_code || "").toUpperCase() !== "CURRENT").map((item) => ({
//         ...item,
//         bucket: item.bucket ?? item.bucket_name ?? item.bucket_code,
//         percentage: item.percentage ?? item.percentage_of_total ?? 0,
//       })),
//     subDivision: getArray("sub_division", "sub_divisions", "subDivision").map((item) => ({
//       ...item,
//       name: item.name ?? item.sub_division ?? item.sub_division_name ?? item.label ?? "",
//       amount: item.amount ?? item.total_payables ?? item.payable_amount ?? 0,
//       percentage: item.percentage ?? item.percent ?? item.share_pct ?? 0,
//     })),
//     monthOnMonth: getArray("month_on_month", "monthOnMonth", "monthly_payables"),
//     viewAll: source?.records ?? source?.rows ?? [],
//     viewAllSummary: source?.summary ?? {},
//   };
// };

// /* ============================================================
//    CURRENCY CONFIG
//    ------------------------------------------------------------
//    No dashboard value should hard-code a currency.
//    ============================================================ */

// const currencyConfig = {
//   AED: { code: "AED", locale: "en-AE" },
//   INR: { code: "INR", locale: "en-IN" },
//   OMR: { code: "OMR", locale: "en-OM" },
//   QAR: { code: "QAR", locale: "en-QA" },
//   SAR: { code: "SAR", locale: "en-SA" },
//   USD: { code: "USD", locale: "en-US" },
//   EUR: { code: "EUR", locale: "en-IE" },
// };

// /* ============================================================
//    HELPERS
//    ============================================================ */

// /**
//  * Format currency using selected reporting currency.
//  *
//  * The currency is passed into the function instead of
//  * being hard-coded.
//  */
// const formatPayablesCurrency = (
//   value,
//   currency = "AED"
// ) => {
//   if (value === null || value === undefined) {
//     return "—";
//   }

//   const config =
//     currencyConfig[currency] || currencyConfig.AED;

//   return new Intl.NumberFormat(config.locale, {
//     style: "currency",
//     currency: config.code,
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(Number(value));
// };

// /**
//  * Dashboard-friendly M/K formatting.
//  *
//  * Example:
//  * 192290000 -> AED 192.29M
//  *
//  * Currency is still dynamically selected.
//  */
// const formatPayablesCompact = (
//   value,
//   currency = "AED"
// ) => {
//   if (value === null || value === undefined) {
//     return "—";
//   }

//   const config =
//     currencyConfig[currency] || currencyConfig.AED;

//   const number = Number(value);

//   if (Math.abs(number) >= 1000000) {
//     return `${config.code} ${(number / 1000000).toFixed(2)}M`;
//   }

//   if (Math.abs(number) >= 1000) {
//     return `${config.code} ${(number / 1000).toFixed(2)}K`;
//   }

//   return `${config.code} ${number.toFixed(2)}`;
// };

// /**
//  * Month-on-month formatter.
//  *
//  * IMPORTANT:
//  * null -> —
//  * NOT zero.
//  */
// const formatMoMValue = (value) => {
//   if (
//     value === null ||
//     value === undefined ||
//     value === ""
//   ) {
//     return "—";
//   }

//   return Number(value).toFixed(2);
// };

// /**
//  * Percentage formatter.
//  */
// const formatPercentage = (value) => {
//   if (value === null || value === undefined) {
//     return "—";
//   }

//   return `${Number(value).toFixed(1)}%`;
// };

// /**
//  * Variance formatter.
//  */
// const formatVariance = (value) => {
//   if (value === null || value === undefined) {
//     return "—";
//   }

//   const number = Number(value);

//   return `${number >= 0 ? "▲" : "▼"} ${Math.abs(number).toFixed(
//     1
//   )}%`;
// };

// /* ============================================================
//    EXPORT MOCK
//    ============================================================ */

// const mockExportResult = {
//   success: true,
//   file_name: "Payables_Report_Due_Date_2024-04-30.xlsx",
//   format: "xlsx",
//   aging_basis: "Due Date",
//   reporting_currency: "AED",
// };

// const BLUE = "#132a78";
// const BLUE_2 = "#1d4ed8";
// const BORDER = "#e3e8f2";
// const TEXT = "#172554";
// const MUTED = "#64748b";
// const BG = "#f7f9fd";

// const cardStyle = {
//   background: "#fff",
//   border: `1px solid ${BORDER}`,
//   borderRadius: 10,
//   boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
// };

// function formatAxisMillions(value) {
//   if (value === null || value === undefined) return "—";
//   return `${(Number(value) / 1000000).toFixed(0)}M`;
// }

// /* ============================================================
//    SMALL UI COMPONENTS
//    ============================================================ */

// function InfoIcon({ title }) {
//   return (
//     <span
//       title={title}
//       style={{
//         display: "inline-flex",
//         width: 15,
//         height: 15,
//         borderRadius: "50%",
//         border: "1px solid #94a3b8",
//         alignItems: "center",
//         justifyContent: "center",
//         fontSize: 9,
//         color: "#64748b",
//         marginLeft: 5,
//         cursor: "help",
//       }}
//     >
//       i
//     </span>
//   );
// }

// function SectionTitle({ children, info }) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         fontSize: 14,
//         fontWeight: 700,
//         color: "#00000",
//         marginBottom: 12,
//       }}
//     >
//       {children}
//       {info && <InfoIcon title={info} />}
//     </div>
//   );
// }



// function SectionActions({
//   onViewAll,
//   onExportExcel,
//   onExportPdf,
// }) {
//   const [open, setOpen] = useState(false);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const handleOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleOutside);
//     return () => document.removeEventListener("mousedown", handleOutside);
//   }, []);

//   const runAction = (callback) => {
//     setOpen(false);
//     if (typeof callback === "function") callback();
//   };

//   const itemStyle = {
//     width: "100%",
//     height: 34,
//     border: "none",
//     background: "transparent",
//     borderRadius: 6,
//     display: "flex",
//     alignItems: "center",
//     gap: 9,
//     padding: "0 10px",
//     color: "#334155",
//     fontSize: 12,
//     fontWeight: 800,
//     cursor: "pointer",
//     textAlign: "left",
//   };

//   return (
//     <div
//       ref={menuRef}
//       style={{
//         position: "absolute",
//         top: 9,
//         right: 9,
//         zIndex: 50,
//       }}
//     >
//       <button
//         type="button"
//         onClick={() => setOpen((value) => !value)}
//         aria-label="More options"
//         style={{
//           width: 28,
//           height: 28,
//           border: "none",
//           background: "transparent",
//           color: "#64748b",
//           borderRadius: 6,
//           fontSize: 20,
//           lineHeight: 1,
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           padding: 0,
//         }}
//       >
//         ⋮
//       </button>

//       {open && (
//         <div
//           style={{
//             position: "absolute",
//             top: 31,
//             right: 0,
//             width: 165,
//             padding: 5,
//             background: "#ffffff",
//             border: "1px solid #e2e8f0",
//             borderRadius: 9,
//             boxShadow: "0 8px 24px rgba(15, 23, 42, 0.14)",
//             zIndex: 9999,
//           }}
//         >
//           <button
//             type="button"
//             onClick={() => runAction(onViewAll)}
//             style={itemStyle}
//             onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5ff"; }}
//             onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
//           >

//             <span>🔎 View All</span>
//           </button>

//           <button
//             type="button"
//             onClick={() => runAction(onExportExcel)}
//             style={itemStyle}
//             onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5ff"; }}
//             onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
//           >

//             <span>📊 Export Excel</span>
//           </button>

//           <button
//             type="button"
//             onClick={() => runAction(onExportPdf)}
//             style={itemStyle}
//             onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5ff"; }}
//             onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
//           >

//             <span>📄 Export PDF</span>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function FilterSelect({
//   label,
//   value,
//   options = [],
//   onChange,
//   multiple = false,
// }) {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const dropdownRef = useRef(null);

//   /* ==========================================================
//      NORMALIZE SELECTED VALUES
//   ========================================================== */
//   const selectedValues = multiple
//     ? Array.isArray(value)
//       ? value
//         .map((item) => {
//           if (
//             item &&
//             typeof item === "object" &&
//             !Array.isArray(item)
//           ) {
//             return item.value ?? item.id ?? item.label;
//           }

//           return item;
//         })
//         .filter(
//           (item) =>
//             item !== undefined &&
//             item !== null &&
//             String(item) !== ""
//         )
//       : value !== undefined &&
//         value !== null &&
//         value !== ""
//         ? [
//           value &&
//             typeof value === "object" &&
//             !Array.isArray(value)
//             ? value.value ?? value.id ?? value.label
//             : value,
//         ]
//         : []
//     : [];

//   /* ==========================================================
//      CLOSE WHEN CLICKING OUTSIDE
//   ========================================================== */
//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target)
//       ) {
//         setOpen(false);
//         setSearch("");
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleOutsideClick
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleOutsideClick
//       );
//     };
//   }, []);

//   /* ==========================================================
//      NORMALIZE BACKEND OPTIONS

//      Supports:

//      ["AED", "USD"]

//      AND:

//      [
//        {
//          value: 1,
//          label: "Alpha Ducts LLC"
//        }
//      ]
//   ========================================================== */
//   const normalizedOptions = useMemo(() => {
//     const result = [];
//     const seen = new Set();

//     (options || []).forEach((option, index) => {
//       if (
//         option === null ||
//         option === undefined
//       ) {
//         return;
//       }

//       let optionValue;
//       let optionLabel;

//       /* -----------------------------------------------
//          BACKEND OBJECT
//       ----------------------------------------------- */
//       if (
//         typeof option === "object" &&
//         !Array.isArray(option)
//       ) {
//         optionValue =
//           option.value !== undefined &&
//             option.value !== null
//             ? option.value
//             : option.id !== undefined &&
//               option.id !== null
//               ? option.id
//               : option.label;

//         optionLabel =
//           option.label !== undefined &&
//             option.label !== null
//             ? String(option.label)
//             : optionValue !== undefined &&
//               optionValue !== null
//               ? String(optionValue)
//               : "";
//       } else {
//         /* ---------------------------------------------
//            PRIMITIVE OPTION
//         --------------------------------------------- */
//         optionValue = option;
//         optionLabel = String(option);
//       }

//       if (
//         optionValue === undefined ||
//         optionValue === null
//       ) {
//         return;
//       }

//       const normalizedValue = String(optionValue);

//       /*
//        * Prevent duplicate values from creating duplicate
//        * React keys.
//        */
//       if (seen.has(normalizedValue)) {
//         return;
//       }

//       seen.add(normalizedValue);

//       result.push({
//         value: optionValue,
//         label: optionLabel,
//         _key: `${normalizedValue}-${index}`,
//       });
//     });

//     return result;
//   }, [options]);

//   /* ==========================================================
//      REMOVE "ALL"
//   ========================================================== */
//   const finalOptions = normalizedOptions.filter(
//     (option) =>
//       String(option.label).trim().toLowerCase() !==
//       "all"
//   );

//   /* ==========================================================
//      SEARCH
//   ========================================================== */
//   const filteredOptions = finalOptions.filter(
//     (option) =>
//       String(option.label)
//         .toLowerCase()
//         .includes(search.toLowerCase())
//   );

//   /* ==========================================================
//      SELECT ALL
//   ========================================================== */
//   const handleSelectAll = () => {
//     if (!multiple) return;

//     onChange(
//       finalOptions.map(
//         (option) => option.value
//       )
//     );
//   };

//   /* ==========================================================
//      CLEAR
//   ========================================================== */
//   const handleClear = () => {
//     if (!multiple) {
//       onChange("");
//     } else {
//       onChange([]);
//     }
//   };

//   /* ==========================================================
//      INDIVIDUAL OPTION
//   ========================================================== */
//   const handleOptionClick = (option) => {
//     /* -----------------------------------------------
//        SINGLE SELECT
//     ----------------------------------------------- */
//     if (!multiple) {
//       onChange(option.value);
//       setOpen(false);
//       setSearch("");
//       return;
//     }

//     /* -----------------------------------------------
//        MULTI SELECT
//     ----------------------------------------------- */
//     let nextValues = selectedValues.filter(
//       (item) =>
//         String(item).trim().toLowerCase() !==
//         "all"
//     );

//     const optionValue = option.value;

//     const alreadySelected = nextValues.some(
//       (item) =>
//         String(item) ===
//         String(optionValue)
//     );

//     if (alreadySelected) {
//       nextValues = nextValues.filter(
//         (item) =>
//           String(item) !==
//           String(optionValue)
//       );
//     } else {
//       nextValues = [
//         ...nextValues,
//         optionValue,
//       ];
//     }

//     onChange(nextValues);
//   };

//   /* ==========================================================
//      DISPLAY VALUE
//   ========================================================== */
//   const getDisplayValue = () => {
//     /* -----------------------------------------------
//        SINGLE SELECT
//     ----------------------------------------------- */
//     if (!multiple) {
//       if (
//         value === undefined ||
//         value === null ||
//         String(value) === ""
//       ) {
//         return "Select";
//       }

//       const actualValue =
//         value &&
//           typeof value === "object" &&
//           !Array.isArray(value)
//           ? value.value ??
//           value.id ??
//           value.label
//           : value;

//       const selectedOption =
//         finalOptions.find(
//           (option) =>
//             String(option.value) ===
//             String(actualValue)
//         );

//       return selectedOption
//         ? selectedOption.label
//         : String(actualValue);
//     }

//     /* -----------------------------------------------
//        MULTI SELECT
//     ----------------------------------------------- */
//     if (selectedValues.length === 0) {
//       return "Select";
//     }

//     if (selectedValues.length === 1) {
//       const selectedOption =
//         finalOptions.find(
//           (option) =>
//             String(option.value) ===
//             String(selectedValues[0])
//         );

//       return selectedOption
//         ? selectedOption.label
//         : String(selectedValues[0]);
//     }

//     return `${selectedValues.length} selected`;
//   };

//   /* ==========================================================
//      ALL SELECTED
//   ========================================================== */
//   const allSelected =
//     multiple &&
//     finalOptions.length > 0 &&
//     finalOptions.every((option) =>
//       selectedValues.some(
//         (item) =>
//           String(item) ===
//           String(option.value)
//       )
//     );

//   return (
//     <div
//       ref={dropdownRef}
//       style={{
//         flex: "1 1 0",
//         minWidth: 0,
//         position: "relative",
//       }}
//     >
//       {/* =====================================================
//           LABEL
//       ===================================================== */}
//       <label
//         style={{
//           display: "block",
//           fontSize: 10,
//           fontWeight: 700,
//           color: "#173b8f",
//           marginBottom: 5,
//           lineHeight: "12px",
//           whiteSpace: "nowrap",
//         }}
//       >
//         {label}
//       </label>

//       {/* =====================================================
//           FIELD
//       ===================================================== */}
//       <button
//         type="button"
//         onClick={() => {
//           setOpen((prev) => !prev);

//           if (open) {
//             setSearch("");
//           }
//         }}
//         style={{
//           width: "100%",
//           height: 34,
//           boxSizing: "border-box",
//           border: open
//             ? "1px solid #5b5bea"
//             : "1px solid #dce3ee",
//           borderRadius: 9,
//           padding: "0 30px 0 11px",
//           background: "#f4f7fb",
//           color: "#24366b",
//           fontSize: 11,
//           fontWeight: 600,
//           outline: "none",
//           cursor: "pointer",
//           textAlign: "left",
//           position: "relative",
//           overflow: "hidden",
//           whiteSpace: "nowrap",
//           textOverflow: "ellipsis",
//         }}
//       >
//         {getDisplayValue()}

//         <span
//           style={{
//             position: "absolute",
//             right: 10,
//             top: "50%",
//             transform: `translateY(-50%) ${open
//               ? "rotate(180deg)"
//               : "rotate(0deg)"
//               }`,
//             fontSize: 9,
//             color: "#52638a",
//             transition:
//               "transform 0.15s ease",
//             pointerEvents: "none",
//           }}
//         >
//           ▼
//         </span>
//       </button>

//       {/* =====================================================
//           DROPDOWN
//       ===================================================== */}
//       {open && (
//         <div
//           style={{
//             position: "absolute",
//             top: "calc(100% + 5px)",
//             left: 0,
//             width: "100%",
//             minWidth: 190,
//             background: "#ffffff",
//             border: "1px solid #dce3ee",
//             borderRadius: 9,
//             boxShadow:
//               "0 8px 24px rgba(24, 45, 80, 0.14)",
//             zIndex: 9999,
//             overflow: "hidden",
//           }}
//         >
//           {/* =================================================
//               SEARCH
//           ================================================= */}
//           <div
//             style={{
//               padding: "8px 8px 6px",
//               borderBottom:
//                 "1px solid #edf1f7",
//             }}
//           >
//             <div
//               style={{
//                 position: "relative",
//               }}
//             >
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) =>
//                   setSearch(e.target.value)
//                 }
//                 onClick={(e) =>
//                   e.stopPropagation()
//                 }
//                 placeholder={`Search ${label}`}
//                 autoFocus
//                 style={{
//                   width: "100%",
//                   height: 30,
//                   boxSizing: "border-box",
//                   border:
//                     "1px solid #dce3ee",
//                   borderRadius: 7,
//                   padding:
//                     "0 9px 0 28px",
//                   background: "#f8fafc",
//                   color: "#24366b",
//                   fontSize: 10.5,
//                   outline: "none",
//                 }}
//               />

//               <span
//                 style={{
//                   position: "absolute",
//                   left: 9,
//                   top: "50%",
//                   transform:
//                     "translateY(-50%)",
//                   color: "#64748b",
//                   fontSize: 12,
//                   pointerEvents: "none",
//                 }}
//               >
//                 🔍
//               </span>
//             </div>
//           </div>

//           {/* =================================================
//               SELECT ALL / CLEAR
//           ================================================= */}
//           {multiple && (
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent:
//                   "space-between",
//                 padding: "7px 9px",
//                 borderBottom:
//                   "1px solid #edf1f7",
//                 background: "#fafbfe",
//               }}
//             >
//               <button
//                 type="button"
//                 onClick={() => {
//                   if (allSelected) {
//                     onChange([]);
//                   } else {
//                     handleSelectAll();
//                   }
//                 }}
//                 style={{
//                   border: "none",
//                   background: "transparent",
//                   padding: 0,
//                   color: "#4f46e5",
//                   fontSize: 10,
//                   fontWeight: 700,
//                   cursor: "pointer",
//                 }}
//               >
//                 {allSelected
//                   ? "Unselect All"
//                   : "Select All"}
//               </button>

//               <button
//                 type="button"
//                 onClick={handleClear}
//                 style={{
//                   border: "none",
//                   background: "transparent",
//                   padding: 0,
//                   color: "#64748b",
//                   fontSize: 10,
//                   fontWeight: 600,
//                   cursor: "pointer",
//                 }}
//               >
//                 Clear
//               </button>
//             </div>
//           )}

//           {/* =================================================
//               OPTIONS
//           ================================================= */}
//           <div
//             style={{
//               maxHeight: 230,
//               overflowY: "auto",
//               padding: "4px 0",
//             }}
//           >
//             {filteredOptions.length === 0 ? (
//               <div
//                 style={{
//                   padding: "14px 10px",
//                   textAlign: "center",
//                   color: "#94a3b8",
//                   fontSize: 10.5,
//                 }}
//               >
//                 No options found
//               </div>
//             ) : (
//               filteredOptions.map(
//                 (option) => {
//                   const selected =
//                     multiple
//                       ? selectedValues.some(
//                         (item) =>
//                           String(item) ===
//                           String(
//                             option.value
//                           )
//                       )
//                       : String(
//                         value ?? ""
//                       ) ===
//                       String(
//                         option.value
//                       );

//                   return (
//                     <button
//                       key={option._key}
//                       type="button"
//                       onClick={() =>
//                         handleOptionClick(
//                           option
//                         )
//                       }
//                       style={{
//                         width: "100%",
//                         minHeight: 31,
//                         display: "flex",
//                         alignItems:
//                           "center",
//                         gap: 8,
//                         padding:
//                           "5px 10px",
//                         border: "none",
//                         background:
//                           selected
//                             ? "#eef2ff"
//                             : "#ffffff",
//                         color: selected
//                           ? "#243b8f"
//                           : "#334155",
//                         fontSize: 10.5,
//                         fontWeight:
//                           selected
//                             ? 700
//                             : 500,
//                         cursor:
//                           "pointer",
//                         textAlign: "left",
//                       }}
//                     >
//                       {/* CHECKBOX */}
//                       {multiple && (
//                         <span
//                           style={{
//                             width: 14,
//                             height: 14,
//                             minWidth: 14,
//                             borderRadius: 3,
//                             border:
//                               selected
//                                 ? "1px solid #5b5bea"
//                                 : "1px solid #cbd5e1",
//                             background:
//                               selected
//                                 ? "#5b5bea"
//                                 : "#ffffff",
//                             display:
//                               "flex",
//                             alignItems:
//                               "center",
//                             justifyContent:
//                               "center",
//                             color:
//                               "#ffffff",
//                             fontSize: 9,
//                             fontWeight: 800,
//                             boxSizing:
//                               "border-box",
//                           }}
//                         >
//                           {selected
//                             ? "✓"
//                             : ""}
//                         </span>
//                       )}

//                       <span
//                         style={{
//                           overflow:
//                             "hidden",
//                           textOverflow:
//                             "ellipsis",
//                           whiteSpace:
//                             "nowrap",
//                         }}
//                         title={
//                           option.label
//                         }
//                       >
//                         {option.label}
//                       </span>
//                     </button>
//                   );
//                 }
//               )
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ============================================================
//    DATE DISPLAY
// ============================================================ */
// function formatDateDisplay(dateValue) {
//   if (
//     dateValue === undefined ||
//     dateValue === null ||
//     dateValue === ""
//   ) {
//     return "";
//   }

//   /*
//    * Safety:
//    * If backend/date option is accidentally passed
//    * as an object, extract the actual value.
//    */
//   let actualValue = dateValue;

//   if (
//     typeof dateValue === "object" &&
//     !Array.isArray(dateValue)
//   ) {
//     actualValue =
//       dateValue.value ??
//       dateValue.date ??
//       dateValue.as_on_date ??
//       dateValue.label ??
//       "";
//   }

//   const dateString = String(
//     actualValue
//   ).trim();

//   if (!dateString) {
//     return "";
//   }

//   const parts = dateString.split("-");

//   if (parts.length !== 3) {
//     return dateString;
//   }

//   const [year, month, day] = parts;

//   const date = new Date(
//     Number(year),
//     Number(month) - 1,
//     Number(day)
//   );

//   if (
//     Number.isNaN(
//       date.getTime()
//     )
//   ) {
//     return dateString;
//   }

//   // As-On-Date is displayed everywhere as yyyy-mm-dd.
//   const normalized = toApiDate(dateString);
//   return normalized || dateString;
// }

// /* ============================================================
//    DATE FILTER
// ============================================================ */
// function DateFilter({
//   value,
//   options = [],
//   onChange,
// }) {
//   const [open, setOpen] = useState(false);
//   const [search, setSearch] = useState("");
//   const dropdownRef = useRef(null);

//   /* ==========================================================
//      CLOSE OUTSIDE
//   ========================================================== */
//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(
//           event.target
//         )
//       ) {
//         setOpen(false);
//         setSearch("");
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleOutsideClick
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleOutsideClick
//       );
//     };
//   }, []);

//   /* ==========================================================
//      NORMALIZE DATE OPTIONS

//      Supports backend:

//      [
//        "2026-09-20",
//        "2026-09-19"
//      ]

//      Also safely supports:

//      [
//        {
//          value: "2026-09-20",
//          label: "20 Sep 2026"
//        }
//      ]
//   ========================================================== */
//   const normalizedDates = useMemo(() => {
//     const result = [];
//     const seen = new Set();

//     (options || []).forEach(
//       (item, index) => {
//         if (
//           item === undefined ||
//           item === null
//         ) {
//           return;
//         }

//         let dateValue;
//         let dateLabel;

//         /* -----------------------------------------------
//            OBJECT
//         ----------------------------------------------- */
//         if (
//           typeof item === "object" &&
//           !Array.isArray(item)
//         ) {
//           dateValue =
//             item.value ??
//             item.date ??
//             item.as_on_date ??
//             item.label ??
//             "";

//           dateLabel =
//             item.label ??
//             formatDateDisplay(
//               dateValue
//             );
//         } else {
//           /* ---------------------------------------------
//              STRING DATE
//           --------------------------------------------- */
//           dateValue = item;
//           dateLabel =
//             formatDateDisplay(item);
//         }

//         dateValue = String(
//           dateValue ?? ""
//         ).trim();

//         dateLabel = String(
//           dateLabel ?? ""
//         ).trim();

//         if (!dateValue) {
//           return;
//         }

//         /*
//          * Prevent duplicate dates.
//          */
//         if (seen.has(dateValue)) {
//           return;
//         }

//         seen.add(dateValue);

//         result.push({
//           value: dateValue,
//           label:
//             dateLabel ||
//             formatDateDisplay(
//               dateValue
//             ),
//           _key: `date-${dateValue}-${index}`,
//         });
//       }
//     );

//     return result;
//   }, [options]);

//   /* ==========================================================
//      SEARCH DATE
//   ========================================================== */
//   const filteredDates =
//     normalizedDates.filter(
//       (item) =>
//         item.label
//           .toLowerCase()
//           .includes(
//             search.toLowerCase()
//           ) ||
//         item.value
//           .toLowerCase()
//           .includes(
//             search.toLowerCase()
//           )
//     );

//   /* ==========================================================
//      CURRENT SELECTED DATE

//      Supports value being either:

//      "2026-09-20"

//      OR:

//      { value: "2026-09-20" }
//   ========================================================== */
//   const selectedValue =
//     value &&
//       typeof value === "object" &&
//       !Array.isArray(value)
//       ? String(
//         value.value ??
//         value.date ??
//         value.as_on_date ??
//         value.label ??
//         ""
//       )
//       : String(value ?? "");

//   return (
//     <div
//       ref={dropdownRef}
//       style={{
//         flex: "1 1 0",
//         minWidth: 0,
//         position: "relative",
//       }}
//     >
//       {/* =====================================================
//           LABEL
//       ===================================================== */}
//       <label
//         style={{
//           display: "block",
//           fontSize: 10,
//           fontWeight: 700,
//           color: "#173b8f",
//           marginBottom: 5,
//           lineHeight: "12px",
//           whiteSpace: "nowrap",
//         }}
//       >
//         As On Date
//       </label>

//       {/* =====================================================
//           FIELD
//       ===================================================== */}
//       <button
//         type="button"
//         onClick={() => {
//           setOpen((prev) => !prev);

//           if (open) {
//             setSearch("");
//           }
//         }}
//         style={{
//           width: "100%",
//           height: 34,
//           boxSizing: "border-box",
//           border: open
//             ? "1px solid #5b5bea"
//             : "1px solid #dce3ee",
//           borderRadius: 9,
//           padding:
//             "0 30px 0 11px",
//           background: "#f4f7fb",
//           color: "#24366b",
//           fontSize: 11,
//           fontWeight: 600,
//           outline: "none",
//           cursor: "pointer",
//           textAlign: "left",
//           position: "relative",
//           overflow: "hidden",
//           whiteSpace: "nowrap",
//           textOverflow:
//             "ellipsis",
//         }}
//       >
//         {selectedValue
//           ? formatDateDisplay(
//             selectedValue
//           )
//           : "Select Date"}

//         <span
//           style={{
//             position: "absolute",
//             right: 10,
//             top: "50%",
//             transform: `translateY(-50%) ${open
//               ? "rotate(180deg)"
//               : "rotate(0deg)"
//               }`,
//             fontSize: 9,
//             color: "#52638a",
//             transition:
//               "transform 0.15s ease",
//             pointerEvents: "none",
//           }}
//         >
//           ▼
//         </span>
//       </button>

//       {/* =====================================================
//           DROPDOWN
//       ===================================================== */}
//       {open && (
//         <div
//           style={{
//             position: "absolute",
//             top: "calc(100% + 5px)",
//             left: 0,
//             width: "100%",
//             minWidth: 190,
//             background:
//               "#ffffff",
//             border:
//               "1px solid #dce3ee",
//             borderRadius: 9,
//             boxShadow:
//               "0 8px 24px rgba(24, 45, 80, 0.14)",
//             zIndex: 9999,
//             overflow: "hidden",
//           }}
//         >
//           {/* =================================================
//               SEARCH
//           ================================================= */}
//           <div
//             style={{
//               padding:
//                 "8px 8px 6px",
//               borderBottom:
//                 "1px solid #edf1f7",
//             }}
//           >
//             <input
//               type="text"
//               value={search}
//               onChange={(e) =>
//                 setSearch(
//                   e.target.value
//                 )
//               }
//               onClick={(e) =>
//                 e.stopPropagation()
//               }
//               placeholder="Search date"
//               autoFocus
//               style={{
//                 width: "100%",
//                 height: 30,
//                 boxSizing:
//                   "border-box",
//                 border:
//                   "1px solid #dce3ee",
//                 borderRadius: 7,
//                 padding:
//                   "0 9px",
//                 background:
//                   "#f8fafc",
//                 color:
//                   "#24366b",
//                 fontSize: 10.5,
//                 outline:
//                   "none",
//               }}
//             />
//           </div>

//           {/* =================================================
//               DATES
//           ================================================= */}
//           <div
//             style={{
//               maxHeight: 230,
//               overflowY:
//                 "auto",
//               padding:
//                 "4px 0",
//             }}
//           >
//             {filteredDates.length ===
//               0 ? (
//               <div
//                 style={{
//                   padding:
//                     "14px 10px",
//                   textAlign:
//                     "center",
//                   color:
//                     "#94a3b8",
//                   fontSize:
//                     10.5,
//                 }}
//               >
//                 No dates found
//               </div>
//             ) : (
//               filteredDates.map(
//                 (dateOption) => {
//                   const selected =
//                     selectedValue ===
//                     dateOption.value;

//                   return (
//                     <button
//                       key={
//                         dateOption._key
//                       }
//                       type="button"
//                       onClick={() => {
//                         /*
//                          * IMPORTANT:
//                          * Send the ORIGINAL
//                          * backend value to API.
//                          *
//                          * Example:
//                          * "2026-09-20"
//                          */
//                         onChange(
//                           dateOption.value
//                         );

//                         setOpen(
//                           false
//                         );
//                         setSearch("");
//                       }}
//                       style={{
//                         width: "100%",
//                         minHeight: 31,
//                         padding:
//                           "5px 10px",
//                         border: "none",
//                         background:
//                           selected
//                             ? "#eef2ff"
//                             : "#ffffff",
//                         color:
//                           selected
//                             ? "#243b8f"
//                             : "#334155",
//                         fontSize:
//                           10.5,
//                         fontWeight:
//                           selected
//                             ? 700
//                             : 500,
//                         cursor:
//                           "pointer",
//                         textAlign:
//                           "left",
//                       }}
//                     >
//                       {formatDateDisplay(
//                         dateOption.value
//                       )}
//                     </button>
//                   );
//                 }
//               )
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// /* ============================================================
//    KPI CARD
//    ============================================================ */

// function KpiCard({
//   title,
//   value,
//   variance,
//   previousDate,
//   icon,
//   iconBg,
//   iconColor,
//   currency,
//   suffix,
//   onClick,
// }) {
//   const formatValue = (value) => {
//     if (value === null || value === undefined) return "—";

//     // DPO
//     if (suffix === "Days") {
//       return `${Number(value).toFixed(0)} Days`;
//     }

//     // Currency values
//     if (Number(value) >= 1000000) {
//       return `${currency} ${(Number(value) / 1000000).toFixed(2)}M`;
//     }

//     if (Number(value) >= 1000) {
//       return `${currency} ${(Number(value) / 1000).toFixed(2)}K`;
//     }

//     return `${currency} ${Number(value).toFixed(2)}`;
//   };

//   const numericValue = Number(value);
//   const isNegativeValue =
//     Number.isFinite(numericValue) && numericValue < 0;
//   const isPositive = Number(variance) >= 0;

//   return (
//     <div
//       style={{
//         background: iconBg || "#F8FAFC",
//         border: "1px solid rgba(255, 255, 255, 0.8)",
//         borderRadius: "12px",
//         padding: "14px 16px",
//         minHeight: "105px",
//         boxSizing: "border-box",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "space-between",

//         // Card shadow
//         boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",

//         // Smooth hover effect
//         transition:
//           "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
//         cursor: typeof onClick === "function" ? "pointer" : "default",
//       }}
//       onClick={typeof onClick === "function" ? onClick : undefined}
//       onMouseEnter={(e) => {
//         e.currentTarget.style.transform = "translateY(-2px)";
//         e.currentTarget.style.boxShadow =
//           "0 4px 12px rgba(15, 23, 42, 0.06)";
//         e.currentTarget.style.filter = "brightness(0.99)";
//       }}

//       onMouseLeave={(e) => {
//         e.currentTarget.style.transform = "translateY(0)";
//         e.currentTarget.style.boxShadow =
//           "0 2px 8px rgba(15, 23, 42, 0.04)";
//         e.currentTarget.style.filter = "brightness(1)";
//       }}
//     >
//       {/* TOP */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: "10px",
//         }}
//       >
//         {/* ICON */}
//         <div
//           style={{
//             width: "36px",
//             height: "36px",
//             borderRadius: "50%",
//             background: "#F1F5F9",
//             color: iconColor,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: "18px",
//             fontWeight: 700,
//             flexShrink: 0,
//             boxShadow: "0 2px 6px rgba(15, 23, 42, 0.06)",
//           }}
//         >
//           {icon}
//         </div>

//         {/* TITLE */}
//         <div
//           style={{
//             fontSize: "12px",
//             fontWeight: 600,
//             color: iconColor,
//             lineHeight: 1.2,
//           }}
//         >
//           {title}
//         </div>
//       </div>

//       {/* VALUE */}
//       <div
//         style={{
//           marginLeft: "46px",
//           marginTop: "-2px",
//           fontSize: "18px",
//           fontWeight: 800,
//           color: "#111827",
//           lineHeight: 1.1,
//         }}
//       >
//         {formatValue(value)}
//       </div>

//       {/* VARIANCE */}
//       <div
//         style={{
//           marginLeft: "46px",
//           fontSize: "11px",
//           color: isPositive ? "#0e9f75" : "#ef476f",
//           fontWeight: 600,
//           lineHeight: 1.2,
//         }}
//       >
//         {variance !== null && variance !== undefined
//           ? `${isPositive ? "▲" : "▼"} ${Math.abs(
//             Number(variance)
//           ).toFixed(1)}%`
//           : "—"}

//         {previousDate && (
//           <span
//             style={{
//               color: "#64748b",
//               fontWeight: 500,
//               marginLeft: "4px",
//             }}
//           >
//             vs {previousDate}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }


// /* ============================================================
//    DONUT CHART
//    ============================================================ */

// function DonutChart({
//   data,
//   total,
//   currency,
//   centerLabel,
//   legendBelow = false,
//   onSegmentClick,
// }) {
//   const [selectedIndex, setSelectedIndex] = useState(null);
//   const [hoveredIndex, setHoveredIndex] = useState(null);

//   const colors = [
//     "#1665e8",
//     "#0e9f75",
//     "#f59e0b",
//     "#7c3aed",
//     "#ef6b82",
//     "#f59ab5",
//     "#c026d3",
//     "#be185d",
//   ];

//   const radius = 65;
//   const circumference = 2 * Math.PI * radius;
//   const hasData = Array.isArray(data) && data.length > 0;

//   if (!hasData) {
//     return (
//       <div
//         style={{
//           minHeight: legendBelow ? 250 : 185,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           textAlign: "center",
//           color: MUTED,
//           fontSize: 11,
//           fontWeight: 700,
//         }}
//       >
//         No data available
//       </div>
//     );
//   }

//   /*
//    * The Payables aging API can return negative percentages for some
//    * buckets (for example 181-365 Days and Above 365 Days).
//    *
//    * SVG strokeDasharray cannot render a negative segment length.
//    * Previously those negative lengths made the donut geometry invalid,
//    * which could result in only the first segment being visible.
//    *
//    * Use the absolute magnitude of every bucket for the donut geometry
//    * and normalize the magnitudes so ALL API buckets are displayed.
//    * The original API amount/percentage is still shown in the tooltip
//    * and legend.
//    */
//   const normalizedData = Array.isArray(data) ? data : [];

//   const segmentWeights = normalizedData.map((item) =>
//     Math.abs(
//       Number(
//         item.percentage ??
//         item.percentage_of_total ??
//         0
//       )
//     )
//   );

//   const totalSegmentWeight = segmentWeights.reduce(
//     (sum, value) => sum + value,
//     0
//   );

//   let accumulated = 0;

//   /* ==========================================================
//      CLICK SEGMENT
//   ========================================================== */
//   const handleSegmentClick = (index) => {
//     setSelectedIndex((prev) =>
//       prev === index ? null : index
//     );

//     if (typeof onSegmentClick === "function") {
//       onSegmentClick(normalizedData[index], index);
//     }
//   };

//   /* ==========================================================
//      GET SEGMENT POSITION
//      Used to create the "explode / pop-out" effect
//   ========================================================== */
//   const getSegmentTransform = (
//     startLength,
//     segmentLength,
//     active
//   ) => {
//     if (!active) {
//       return "rotate(-90 87.5 87.5)";
//     }

//     const startAngle =
//       (startLength / circumference) * 360 - 90;

//     const segmentAngle =
//       (segmentLength / circumference) * 360;

//     const middleAngle =
//       startAngle + segmentAngle / 2;

//     const angleInRadians =
//       (middleAngle * Math.PI) / 180;

//     /* Distance that the selected slice moves outward */
//     const offset = 8;

//     const translateX =
//       Math.cos(angleInRadians) * offset;

//     const translateY =
//       Math.sin(angleInRadians) * offset;

//     return `
//       translate(${translateX} ${translateY})
//       rotate(-90 87.5 87.5)
//     `;
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: legendBelow ? "column" : "row",
//         alignItems: legendBelow ? "center" : "center",
//         gap: legendBelow ? 24 : 20, // more gap between donut and legend
//         minHeight: legendBelow ? 250 : 185,
//         position: "relative",
//       }}
//     >
//       {/* =====================================================
//           DONUT
//       ===================================================== */}
//       <div
//         style={{
//           width: 175,
//           minWidth: 175,
//           height: 175,
//           position: "relative",
//         }}
//       >
//         <svg
//           width="175"
//           height="175"
//           viewBox="0 0 175 175"
//           style={{
//             overflow: "visible",
//           }}
//         >
//           {/* =================================================
//               BACKGROUND RING
//           ================================================= */}
//           <circle
//             cx="87.5"
//             cy="87.5"
//             r={radius}
//             fill="none"
//             stroke="#eef2f7"
//             strokeWidth="25"
//           />

//           {/* =================================================
//               DONUT SEGMENTS
//           ================================================= */}
//           {normalizedData.map((item, index) => {
//             /*
//              * Always use a positive geometry value.
//              * This is important because the backend can return negative
//              * percentages for negative aging amounts.
//              */
//             const weight = segmentWeights[index] || 0;

//             const percent =
//               totalSegmentWeight > 0
//                 ? weight / totalSegmentWeight
//                 : 0;

//             const length =
//               circumference * percent;

//             const offset = -accumulated;

//             const segmentStart = accumulated;

//             accumulated += length;

//             const isSelected =
//               selectedIndex === index;

//             const isHovered =
//               hoveredIndex === index;

//             /*
//               Selected takes priority.
//               Hover also gives the pop-out effect.
//             */
//             const isActive =
//               isSelected || isHovered;

//             return (
//               <circle
//                 key={`donut-segment-${index}-${item.bucket_code ?? item.bucket_name ?? item.bucket ?? "segment"}`}
//                 cx="87.5"
//                 cy="87.5"
//                 r={radius}
//                 fill="none"
//                 stroke={
//                   colors[index % colors.length]
//                 }
//                 strokeWidth={
//                   isActive ? 29 : 25
//                 }
//                 strokeDasharray={`${length} ${circumference - length
//                   }`}
//                 strokeDashoffset={offset}
//                 transform={getSegmentTransform(
//                   segmentStart,
//                   length,
//                   isActive
//                 )}
//                 strokeLinecap="butt"
//                 style={{
//                   cursor: "pointer",

//                   /*
//                     Selected segment becomes slightly
//                     more prominent, but other segments
//                     remain visible.
//                   */
//                   opacity:
//                     selectedIndex !== null &&
//                       !isSelected
//                       ? 0.55
//                       : 1,

//                   filter: isActive
//                     ? "drop-shadow(0 4px 7px rgba(0,0,0,0.20))"
//                     : "none",

//                   transition:
//                     "transform 0.25s ease, stroke-width 0.2s ease, opacity 0.2s ease, filter 0.2s ease",
//                 }}
//                 onMouseEnter={() =>
//                   setHoveredIndex(index)
//                 }
//                 onMouseLeave={() =>
//                   setHoveredIndex(null)
//                 }
//                 onClick={() =>
//                   handleSegmentClick(index)
//                 }
//               />
//             );
//           })}
//         </svg>

//         {/* ===================================================
//             CENTER VALUE
//             Hidden ONLY when a segment is clicked/selected
//         =================================================== */}
//         {selectedIndex === null && (
//           <div
//             style={{
//               position: "absolute",
//               inset: 0,
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#00000",
//               pointerEvents: "none",
//               transition: "opacity 0.2s ease",
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 16,
//                 fontWeight: 800,
//               }}
//             >
//               {formatPayablesCompact(
//                 total,
//                 currency
//               )}
//             </div>

//             <div
//               style={{
//                 fontSize: 11,
//                 fontWeight: 700,
//               }}
//             >
//               {centerLabel}
//             </div>
//           </div>
//         )}

//         {/* ===================================================
//             TOOLTIP
//         =================================================== */}
//         {hoveredIndex !== null &&
//           normalizedData[hoveredIndex] && (
//             <div
//               style={{
//                 position: "absolute",

//                 /*
//                   Positioned similarly to the P&L
//                   Expense Breakdown tooltip.
//                 */
//                 left: "50%",
//                 top: "50%",

//                 transform:
//                   "translate(-50%, -50%)",

//                 minWidth: 180,
//                 background: "#ffffff",
//                 border: "1px solid #e5eaf2",
//                 borderRadius: 16,
//                 padding: "14px 16px",
//                 boxShadow:
//                   "0 12px 30px rgba(24,45,80,0.16)",
//                 zIndex: 50,
//                 pointerEvents: "none",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {/* =================================================
//                   TOOLTIP TITLE
//               ================================================= */}
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 8,
//                   fontSize: 13,
//                   fontWeight: 800,
//                   color: "#17213c",
//                   marginBottom: 12,
//                 }}
//               >
//                 <span
//                   style={{
//                     width: 10,
//                     height: 10,
//                     borderRadius: 3,
//                     background:
//                       colors[
//                       hoveredIndex %
//                       colors.length
//                       ],
//                     display: "inline-block",
//                   }}
//                 />

//                 {normalizedData[hoveredIndex].bucket_name ?? normalizedData[hoveredIndex].bucket ?? normalizedData[hoveredIndex].bucket_code}
//               </div>

//               {/* =================================================
//                   AMOUNT
//               ================================================= */}
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   gap: 24,
//                   marginBottom: 9,
//                   fontSize: 11,
//                 }}
//               >
//                 <span
//                   style={{
//                     color: "#718096",
//                   }}
//                 >
//                   Amount
//                 </span>

//                 <strong
//                   style={{
//                     color: "#17213c",
//                     fontSize: 13,
//                   }}
//                 >
//                   {formatPayablesCompact(
//                     normalizedData[hoveredIndex].amount,
//                     currency
//                   )}
//                 </strong>
//               </div>

//               {/* =================================================
//                   SHARE / PERCENTAGE
//               ================================================= */}
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   gap: 24,
//                   fontSize: 11,
//                 }}
//               >
//                 <span
//                   style={{
//                     color: "#718096",
//                   }}
//                 >
//                   Share
//                 </span>

//                 <strong
//                   style={{
//                     color:
//                       colors[
//                       hoveredIndex %
//                       colors.length
//                       ],
//                     fontSize: 13,
//                   }}
//                 >
//                   {formatPercentage(
//                     normalizedData[hoveredIndex].percentage ?? normalizedData[hoveredIndex].percentage_of_total
//                   )}
//                 </strong>
//               </div>
//             </div>
//           )}
//       </div>

//       {/* =====================================================
//           LEGEND
//       ===================================================== */}
//       <div
//         style={{
//           flex: legendBelow ? "none" : 1,
//           width: legendBelow ? "100%" : "auto",
//           minWidth: 0,
//         }}
//       >
//         {normalizedData.map((item, index) => {
//           const isSelected =
//             selectedIndex === index;

//           const isHovered =
//             hoveredIndex === index;

//           const isActive =
//             isSelected || isHovered;

//           return (
//             <div
//               key={`donut-legend-${index}-${item.bucket_code ?? item.bucket_name ?? item.bucket ?? "bucket"}`}
//               onClick={() =>
//                 handleSegmentClick(index)
//               }
//               onMouseEnter={() =>
//                 setHoveredIndex(index)
//               }
//               onMouseLeave={() =>
//                 setHoveredIndex(null)
//               }
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 7,
//                 marginBottom: 16,
//                 fontSize: 12,
//                 color: "#334155",
//                 cursor: "pointer",
//                 padding: "3px 5px",
//                 borderRadius: 6,

//                 background: isSelected
//                   ? "#f1f5ff"
//                   : isHovered
//                     ? "#f8fafc"
//                     : "transparent",

//                 transition:
//                   "background 0.2s ease",
//               }}
//             >
//               {/* Color Dot */}
//               <span
//                 style={{
//                   width: 9,
//                   height: 9,
//                   borderRadius: "50%",
//                   background:
//                     colors[
//                     index % colors.length
//                     ],
//                   display: "inline-block",
//                   flexShrink: 0,

//                   boxShadow: isActive
//                     ? `0 0 0 3px ${colors[
//                     index %
//                     colors.length
//                     ]
//                     }22`
//                     : "none",

//                   transition:
//                     "box-shadow 0.2s ease",
//                 }}
//               />

//               {/* Bucket */}
//               <span
//                 style={{
//                   flex: 1,
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                   whiteSpace: "nowrap",
//                   fontWeight: isActive
//                     ? 800
//                     : 700,
//                 }}
//               >
//                 {item.bucket_name ?? item.bucket ?? item.bucket_code}
//               </span>

//               {/* Amount */}
//               <strong
//                 style={{
//                   color: "#344b8a",
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 {(Number(item.amount || 0) / 1000000).toFixed(2)}M
//               </strong>

//               {/* Percentage */}
//               <span
//                 style={{
//                   color: "#64748b",
//                   minWidth: 36,
//                   whiteSpace: "nowrap",
//                   fontWeight: isActive
//                     ? 700
//                     : 500,
//                 }}
//               >
//                 (
//                 {formatPercentage(
//                   item.percentage ?? item.percentage_of_total
//                 )}
//                 )
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// /* ============================================================
//    TREND CHART
//    ============================================================ */

// function TrendChart({ data, currency, onPointClick }) {
//   const [hoveredIndex, setHoveredIndex] = useState(null);

//   const maxValue = Math.max(0, ...data.map((item) => Number(item.total_payables || 0)));
//   const hasData = Array.isArray(data) && data.length > 0;

//   if (!hasData) {
//     return (
//       <div
//         style={{
//           minHeight: 190,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           textAlign: "center",
//           color: MUTED,
//           fontSize: 11,
//           fontWeight: 700,
//         }}
//       >
//         No data available
//       </div>
//     );
//   }

//   return (
//     <div style={{ width: "100%", overflowX: "hidden" }}>
//       <div
//         style={{
//           width: "100%",
//           height: 220,
//           position: "relative",
//           padding: "10px 10px 35px 45px",
//           boxSizing: "border-box",
//         }}
//       >
//         {[0, 1, 2, 3, 4].map((line) => (
//           <div
//             key={line}
//             style={{
//               position: "absolute",
//               left: 45,
//               right: 10,
//               top: 15 + line * 36,
//               borderTop: "1px dashed #e2e8f0",
//             }}
//           />
//         ))}

//         <div
//           style={{
//             position: "absolute",
//             left: 3,
//             top: 5,
//             fontSize: 10,
//             color: MUTED,
//           }}
//         >
//           {currency} (M)
//         </div>

//         <div
//           style={{
//             position: "absolute",
//             left: 3,
//             top: 78,
//             fontSize: 9,
//             color: MUTED,
//           }}
//         >
//           {formatAxisMillions(maxValue / 2)}
//         </div>

//         <div
//           style={{
//             position: "absolute",
//             left: 18,
//             bottom: 42,
//             fontSize: 9,
//             color: MUTED,
//           }}
//         >
//           0
//         </div>

//         {/* =====================================================
//             BARS
//         ===================================================== */}
//         <div
//           style={{
//             position: "absolute",
//             left: 55,
//             right: 15,
//             bottom: 35,
//             height: 150,
//             display: "flex",
//             alignItems: "flex-end",
//             justifyContent: "space-between",
//             gap: 2,
//           }}
//         >
//           {data.map((item, index) => {
//             const height =
//               maxValue > 0
//                 ? (Number(item.total_payables) / maxValue) * 125
//                 : 0;

//             const isHovered = hoveredIndex === index;

//             return (
//               <div
//                 key={item.month}
//                 style={{
//                   flex: 1,
//                   height: 150,
//                   position: "relative",
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "flex-end",
//                   alignItems: "center",
//                   cursor:
//                     typeof onPointClick === "function"
//                       ? "pointer"
//                       : "default",
//                 }}
//                 onMouseEnter={() => setHoveredIndex(index)}
//                 onMouseLeave={() => setHoveredIndex(null)}
//                 onClick={() => {
//                   if (typeof onPointClick === "function") {
//                     onPointClick(item, index);
//                   }
//                 }}
//               >
//                 {/* =================================================
//                     TOOLTIP
//                 ================================================= */}

//                 {isHovered && (
//                   <div
//                     style={{
//                       position: "absolute",

//                       // Keep tooltip inside the chart
//                       top: 5,

//                       left: "50%",
//                       transform: "translateX(-50%)",

//                       minWidth: 160,
//                       maxWidth: 190,

//                       background: "#ffffff",
//                       border: "1px solid #dce3ee",
//                       borderRadius: 8,

//                       padding: "9px 11px",

//                       boxShadow:
//                         "0 8px 22px rgba(24, 45, 80, 0.16)",

//                       zIndex: 1000,
//                       pointerEvents: "none",

//                       whiteSpace: "normal",
//                       boxSizing: "border-box",
//                     }}
//                   >
//                     {/* Month */}
//                     <div
//                       style={{
//                         fontSize: 12,
//                         fontWeight: 800,
//                         color: "#24366b",
//                         marginBottom: 7,
//                       }}
//                     >
//                       {item.month}
//                     </div>

//                     {/* Total Payables */}
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         gap: 15,
//                         fontSize: 11, fontWeight: 800,
//                         marginBottom: 5,
//                       }}
//                     >
//                       <span
//                         style={{
//                           color: "#64748b",
//                         }}
//                       >
//                         Total Payables
//                       </span>

//                       <strong
//                         style={{
//                           color: BLUE,
//                         }}
//                       >
//                         {formatPayablesCompact(
//                           item.total_payables,
//                           currency
//                         )}
//                       </strong>
//                     </div>

//                     {/* DPO */}
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         gap: 15,
//                         fontSize: 11, fontWeight: 800,
//                       }}
//                     >
//                       <span
//                         style={{
//                           color: "#64748b",
//                         }}
//                       >
//                         DPO
//                       </span>

//                       <strong
//                         style={{
//                           color: "#0e9f75",
//                         }}
//                       >
//                         {Number(item.dpo || 0).toFixed(1)} Days
//                       </strong>
//                     </div>
//                   </div>
//                 )}

//                 {/* Value above bar */}
//                 <div
//                   style={{
//                     fontSize: 10,
//                     color: BLUE,
//                     fontWeight: 800,
//                     marginBottom: 3,
//                     opacity: isHovered ? 0 : 1,
//                     transition: "opacity 0.15s ease",
//                   }}
//                 >
//                   {(Number(item.total_payables) / 1000000).toFixed(2)}
//                 </div>

//                 {/* Bar */}
//                 <div
//                   style={{
//                     width: isHovered ? "78%" : "70%",
//                     maxWidth: 38,
//                     height,
//                     minHeight: 3,
//                     background: BLUE_2,
//                     borderRadius: "2px 2px 0 0",
//                     cursor: "pointer",
//                     opacity: isHovered ? 0.85 : 1,
//                     boxShadow: isHovered
//                       ? "0 3px 10px rgba(91, 91, 234, 0.25)"
//                       : "none",
//                     transition:
//                       "width 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease",
//                   }}
//                 />

//                 {/* Month */}
//                 <div
//                   style={{
//                     position: "absolute",
//                     bottom: -25,
//                     fontSize: 10,
//                     fontWeight: 800,
//                     color: "#475569",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   {item.month}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* =====================================================
//             DPO LINE
//         ===================================================== */}
//         <svg
//           style={{
//             position: "absolute",
//             left: 55,
//             right: 15,
//             bottom: 35,
//             width: "calc(100% - 70px)",
//             height: 125,
//             pointerEvents: "none",
//             overflow: "visible",
//           }}
//           viewBox="0 0 600 125"
//           preserveAspectRatio="none"
//         >
//           <polyline
//             points={data
//               .map((item, index) => {
//                 const x =
//                   data.length === 1
//                     ? 300
//                     : (index / (data.length - 1)) * 600;

//                 const minDpo = Math.min(
//                   ...data.map((d) => Number(d.dpo))
//                 );

//                 const maxDpo = Math.max(
//                   ...data.map((d) => Number(d.dpo))
//                 );

//                 const range = Math.max(maxDpo - minDpo, 1);

//                 const y =
//                   105 -
//                   ((Number(item.dpo) - minDpo) / range) * 80;

//                 return `${x},${y}`;
//               })
//               .join(" ")}
//             fill="none"
//             stroke="#0e9f75"
//             strokeWidth="2"
//             vectorEffect="non-scaling-stroke"
//           />

//           {data.map((item, index) => {
//             const x =
//               data.length === 1
//                 ? 300
//                 : (index / (data.length - 1)) * 600;

//             const minDpo = Math.min(
//               ...data.map((d) => Number(d.dpo))
//             );

//             const maxDpo = Math.max(
//               ...data.map((d) => Number(d.dpo))
//             );

//             const range = Math.max(maxDpo - minDpo, 1);

//             const y =
//               105 -
//               ((Number(item.dpo) - minDpo) / range) * 80;

//             return (
//               <circle
//                 key={item.month}
//                 cx={x}
//                 cy={y}
//                 r={hoveredIndex === index ? 5 : 3}
//                 fill="#fff"
//                 stroke="#0e9f75"
//                 strokeWidth={hoveredIndex === index ? 3 : 2}
//                 style={{
//                   transition: "r 0.15s ease",
//                 }}
//               />
//             );
//           })}
//         </svg>
//       </div>

//       {/* =====================================================
//           LEGEND
//       ===================================================== */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           gap: 20,
//           fontSize: 10,
//           fontWeight: 800,
//           color: "#475569",
//           marginTop: -5,
//         }}
//       >
//         <span>
//           <span
//             style={{
//               display: "inline-block",
//               width: 10,
//               height: 8,
//               background: BLUE_2,
//               marginRight: 5,
//             }}
//           />
//           Total Payables
//         </span>

//         <span>
//           <span
//             style={{
//               display: "inline-block",
//               width: 18,
//               borderTop: "2px dashed #0e9f75",
//               marginRight: 5,
//               verticalAlign: "middle",

//             }}
//           />
//           DPO (Days)
//         </span>
//       </div>
//     </div>
//   );
// }

// /* ============================================================
//    HORIZONTAL BAR CHART
//    ============================================================ */

// function ParentDivisionChart({ data, currency, onRowClick }) {
//   const [hoveredIndex, setHoveredIndex] = useState(null);
//   const [page, setPage] = useState(1);
//   const PAGE_SIZE = 7;

//   useEffect(() => {
//     setPage(1);
//     setHoveredIndex(null);
//   }, [data]);

//   // Backend response:
//   // label
//   // total_payables
//   // percentage_of_total
//   //
//   // Normalize here so the existing chart can work directly
//   // with the backend response without changing the API.
//   const chartData = Array.isArray(data)
//     ? data.map((item, index) => ({
//       ...item,
//       name:
//         item.name ??
//         item.label ??
//         `Division ${index + 1}`,
//       amount: Number(
//         item.amount ??
//         item.total_payables ??
//         0
//       ),
//       percentage: Number(
//         item.percentage ??
//         item.percentage_of_total ??
//         0
//       ),
//     }))
//     : [];

//   const totalPages = Math.max(
//     1,
//     Math.ceil(
//       chartData.length / PAGE_SIZE
//     )
//   );

//   const safePage = Math.min(
//     page,
//     totalPages
//   );

//   const paginatedChartData =
//     chartData.slice(
//       (safePage - 1) * PAGE_SIZE,
//       safePage * PAGE_SIZE
//     );

//   // Use absolute values so negative payables do not create
//   // invalid negative CSS widths.
//   const max = Math.max(
//     0,
//     ...paginatedChartData.map(
//       (item) =>
//         Math.abs(
//           Number(item.amount || 0)
//         )
//     )
//   );

//   if (chartData.length === 0) {
//     return (
//       <div
//         style={{
//           minHeight: 150,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           textAlign: "center",
//           color: MUTED,
//           fontSize: 11,
//           fontWeight: 700,
//         }}
//       >
//         No data available
//       </div>
//     );
//   }

//   return (
//     <div style={{ paddingTop: 5 }}>
//       {paginatedChartData.map(
//         (item, index) => {
//           const amount = Number(
//             item.amount || 0
//           );

//           const percentage = Number(
//             item.percentage || 0
//           );

//           const width =
//             max > 0
//               ? (Math.abs(amount) / max) *
//               100
//               : 0;

//           const isNegative =
//             amount < 0;

//           const isHovered =
//             hoveredIndex === index;

//           return (
//             <div
//               key={
//                 item.value != null
//                   ? `division-${item.value}`
//                   : item.id != null
//                     ? `division-${item.id}`
//                     : `division-${item.name || "item"}-${index}`
//               }
//               style={{
//                 display: "grid",
//                 gridTemplateColumns:
//                   "70px 1fr 100px",
//                 alignItems: "center",
//                 gap: 8,

//                 // Gap between each horizontal bar
//                 marginBottom:
//                   index ===
//                     paginatedChartData.length - 1
//                     ? 0
//                     : 25,

//                 position: "relative",
//                 cursor:
//                   typeof onRowClick === "function"
//                     ? "pointer"
//                     : "default",
//               }}
//               onMouseEnter={() =>
//                 setHoveredIndex(index)
//               }
//               onMouseLeave={() =>
//                 setHoveredIndex(null)
//               }
//               onClick={() => {
//                 if (typeof onRowClick === "function") {
//                   onRowClick(item, index);
//                 }
//               }}
//             >
//               {/* Division Name */}
//               <div
//                 style={{
//                   fontSize: 10,
//                   fontWeight: 800,
//                   color: "#334155",
//                   whiteSpace:
//                     "nowrap",
//                   overflow: "hidden",
//                   textOverflow:
//                     "ellipsis",
//                 }}
//                 title={item.name}
//               >
//                 {item.name}
//               </div>

//               {/* Bar */}
//               <div
//                 style={{
//                   height: 17,
//                   background: "#eef3fb",
//                   borderRadius: 2,
//                   overflow: "hidden",
//                   cursor: "pointer",
//                 }}
//               >
//                 <div
//                   style={{
//                     height: "100%",
//                     width: `${width}%`,

//                     // Keep the existing blue style.
//                     // Negative values are still displayed
//                     // as a valid bar using their absolute magnitude.
//                     background: isNegative
//                       ? "#dc2626"
//                       : "#1464e8",

//                     opacity:
//                       hoveredIndex !== null &&
//                         !isHovered
//                         ? 0.65
//                         : 1,

//                     transition:
//                       "opacity 0.15s ease, width 0.2s ease",
//                   }}
//                 />
//               </div>

//               {/* Value */}
//               <div
//                 style={{
//                   fontSize: 10,
//                   fontWeight: 700,
//                   color: isNegative
//                     ? "#dc2626"
//                     : "#27438b",
//                   textAlign: "right",
//                 }}
//               >
//                 {formatPayablesCompact(
//                   amount,
//                   ""
//                 ).replace(
//                   /^[A-Z]{3}\s*/,
//                   ""
//                 )}{" "}

//                 <span
//                   style={{
//                     color: isNegative
//                       ? "#dc2626"
//                       : "#64748b",
//                     fontWeight: 500,
//                   }}
//                 >
//                   (
//                   {formatPercentage(
//                     percentage
//                   )}
//                   )
//                 </span>
//               </div>

//               {/* Hover Tooltip */}
//               {isHovered && (
//                 <div
//                   style={{
//                     position: "absolute",
//                     left: "50%",
//                     top:
//                       index ===
//                         paginatedChartData.length -
//                         1
//                         ? "auto"
//                         : "100%",
//                     bottom:
//                       index ===
//                         paginatedChartData.length -
//                         1
//                         ? "100%"
//                         : "auto",
//                     transform:
//                       "translateX(-50%)",

//                     marginTop:
//                       index ===
//                         paginatedChartData.length -
//                         1
//                         ? 0
//                         : 6,

//                     marginBottom:
//                       index ===
//                         paginatedChartData.length -
//                         1
//                         ? 6
//                         : 0,

//                     zIndex: 9999,
//                     background: "#ffffff",
//                     border:
//                       "1px solid #dbe3ef",
//                     borderRadius: 7,
//                     boxShadow:
//                       "0 5px 18px rgba(15, 23, 42, 0.16)",
//                     padding:
//                       "8px 11px",
//                     minWidth: 165,
//                     whiteSpace:
//                       "nowrap",
//                     pointerEvents:
//                       "none",
//                   }}
//                 >
//                   {/* Division */}
//                   <div
//                     style={{
//                       fontSize: 10,
//                       fontWeight: 900,
//                       color: "#173b8f",
//                       marginBottom: 5,
//                     }}
//                   >
//                     {item.name}
//                   </div>

//                   {/* Payables */}
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent:
//                         "space-between",
//                       gap: 18,
//                       fontSize: 11,
//                       fontWeight: 900,
//                       marginBottom: 3,
//                     }}
//                   >
//                     <span
//                       style={{
//                         color: "#64748b",
//                       }}
//                     >
//                       Payables
//                     </span>

//                     <span
//                       style={{
//                         color: isNegative
//                           ? "#dc2626"
//                           : "#27438b",
//                         fontWeight: 800,
//                       }}
//                     >
//                       {formatPayablesCompact(
//                         amount,
//                         currency
//                       )}
//                     </span>
//                   </div>

//                   {/* Percentage */}
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent:
//                         "space-between",
//                       gap: 18,
//                       fontSize: 11,
//                       fontWeight: 900,
//                     }}
//                   >
//                     <span
//                       style={{
//                         color: "#64748b",
//                       }}
//                     >
//                       Percentage
//                     </span>

//                     <span
//                       style={{
//                         color: isNegative
//                           ? "#dc2626"
//                           : "#27438b",
//                         fontWeight: 800,
//                       }}
//                     >
//                       {formatPercentage(
//                         percentage
//                       )}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         }
//       )}

//       {/* =====================================================
//           PAGINATION
//           Same style as Sub-Division pagination
//       ===================================================== */}
//       {totalPages > 1 && (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "flex-end",
//             gap: 5,
//             marginTop: 8,
//           }}
//         >
//           {/* Showing X - Y of Total */}
//           <div
//             style={{
//               fontSize: 10,
//               color: "#64748b",
//               fontWeight: 500,
//               marginRight: 4,
//               whiteSpace: "nowrap",
//             }}
//           >
//             Showing{" "}
//             {(safePage - 1) * PAGE_SIZE + 1}{" "}
//             -{" "}
//             {Math.min(
//               safePage * PAGE_SIZE,
//               chartData.length
//             )}{" "}
//             of {chartData.length}
//           </div>

//           {/* FIRST PAGE */}
//           <button
//             type="button"
//             onClick={() => {
//               setPage(1);
//               setHoveredIndex(null);
//             }}
//             disabled={safePage === 1}
//             title="First page"
//             style={{
//               width: 28,
//               height: 26,
//               border:
//                 "1px solid #dce3ee",
//               borderRadius: 5,
//               background:
//                 safePage === 1
//                   ? "#f8fafc"
//                   : "#ffffff",
//               color:
//                 safePage === 1
//                   ? "#cbd5e1"
//                   : "#173b8f",
//               fontSize: 13,
//               fontWeight: 800,
//               cursor:
//                 safePage === 1
//                   ? "default"
//                   : "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: 0,
//             }}
//           >
//             «
//           </button>

//           {/* PREVIOUS PAGE */}
//           <button
//             type="button"
//             onClick={() => {
//               setPage((prev) =>
//                 Math.max(
//                   1,
//                   prev - 1
//                 )
//               );
//               setHoveredIndex(null);
//             }}
//             disabled={safePage === 1}
//             title="Previous page"
//             style={{
//               width: 28,
//               height: 26,
//               border:
//                 "1px solid #dce3ee",
//               borderRadius: 5,
//               background:
//                 safePage === 1
//                   ? "#f8fafc"
//                   : "#ffffff",
//               color:
//                 safePage === 1
//                   ? "#cbd5e1"
//                   : "#173b8f",
//               fontSize: 13,
//               fontWeight: 800,
//               cursor:
//                 safePage === 1
//                   ? "default"
//                   : "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: 0,
//             }}
//           >
//             ‹
//           </button>

//           {/* CURRENT PAGE */}
//           <button
//             type="button"
//             disabled
//             style={{
//               width: 28,
//               height: 26,
//               border:
//                 "1px solid #173b8f",
//               borderRadius: 5,
//               background: "#173b8f",
//               color: "#ffffff",
//               fontSize: 10,
//               fontWeight: 800,
//               cursor: "default",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: 0,
//             }}
//           >
//             {safePage}
//           </button>

//           {/* NEXT PAGE */}
//           <button
//             type="button"
//             onClick={() => {
//               setPage((prev) =>
//                 Math.min(
//                   totalPages,
//                   prev + 1
//                 )
//               );
//               setHoveredIndex(null);
//             }}
//             disabled={
//               safePage ===
//               totalPages
//             }
//             title="Next page"
//             style={{
//               width: 28,
//               height: 26,
//               border:
//                 "1px solid #dce3ee",
//               borderRadius: 5,
//               background:
//                 safePage ===
//                   totalPages
//                   ? "#f8fafc"
//                   : "#ffffff",
//               color:
//                 safePage ===
//                   totalPages
//                   ? "#cbd5e1"
//                   : "#173b8f",
//               fontSize: 13,
//               fontWeight: 800,
//               cursor:
//                 safePage ===
//                   totalPages
//                   ? "default"
//                   : "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: 0,
//             }}
//           >
//             ›
//           </button>

//           {/* LAST PAGE */}
//           <button
//             type="button"
//             onClick={() => {
//               setPage(totalPages);
//               setHoveredIndex(null);
//             }}
//             disabled={
//               safePage ===
//               totalPages
//             }
//             title="Last page"
//             style={{
//               width: 28,
//               height: 26,
//               border:
//                 "1px solid #dce3ee",
//               borderRadius: 5,
//               background:
//                 safePage ===
//                   totalPages
//                   ? "#f8fafc"
//                   : "#ffffff",
//               color:
//                 safePage ===
//                   totalPages
//                   ? "#cbd5e1"
//                   : "#173b8f",
//               fontSize: 13,
//               fontWeight: 800,
//               cursor:
//                 safePage ===
//                   totalPages
//                   ? "default"
//                   : "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: 0,
//             }}
//           >
//             »
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
// /* ============================================================
//    TABLE
//    ============================================================ */

// function DataTable({
//   columns,
//   rows,
//   compact = false,
//   fitColumns = false,
//   compactRows = false,
//   rowGap = false,
//   emptyMessage = "No data available",

//   // --------------------------------------------------
//   // Optional table features
//   // These remain OFF by default so other tables
//   // are not affected.
//   // --------------------------------------------------
//   pagination = false,
//   pageSize = 9,

//   // Optional total/footer row rendered before the pagination controls.
//   totalRow = null,

//   // Remove year from month headers
//   removeYearFromHeader = false,

//   // Extra spacing between month columns
//   monthColumnGap = false,

//   // Remove decimal values
//   removeDecimals = false,

//   // Shorten long Legal Entity values
//   truncateLegalEntity = false,
//   legalEntityMaxLength = 18,

//   // Negative values are red in every DataTable by default.
//   negativeValuesRed = true,

//   // AED / AED Millions toggle
//   currencyToggle = false,
//   currencyMode: controlledCurrencyMode = null,
//   onCurrencyModeChange = null,
//   showCurrencyToggle = true,
//   onRowClick = null,
//   onCellClick = null,
// }) {
//   const [currentPage, setCurrentPage] = React.useState(1);

//   const [internalCurrencyMode, setInternalCurrencyMode] =
//     React.useState("AED");

//   const currencyMode =
//     controlledCurrencyMode || internalCurrencyMode;

//   const setCurrencyMode = (nextMode) => {
//     setInternalCurrencyMode(nextMode);
//     if (typeof onCurrencyModeChange === "function") {
//       onCurrencyModeChange(nextMode);
//     }
//   };

//   // --------------------------------------------------
//   // Reset pagination when table data changes
//   // --------------------------------------------------
//   React.useEffect(() => {
//     setCurrentPage(1);
//   }, [rows]);

//   const safeRows = Array.isArray(rows) ? rows : [];

//   // --------------------------------------------------
//   // Pagination
//   // --------------------------------------------------
//   const totalPages = pagination
//     ? Math.max(
//       1,
//       Math.ceil(safeRows.length / pageSize)
//     )
//     : 1;

//   const paginatedRows = pagination
//     ? safeRows.slice(
//       (currentPage - 1) * pageSize,
//       currentPage * pageSize
//     )
//     : safeRows;

//   const goToPage = (page) => {
//     const nextPage = Math.min(
//       Math.max(page, 1),
//       totalPages
//     );

//     setCurrentPage(nextPage);
//   };

//   // --------------------------------------------------
//   // Header formatter
//   // Example:
//   // Jan-26 -> Jan
//   // Feb-26 -> Feb
//   // --------------------------------------------------
//   const formatHeader = (label) => {
//     if (
//       !removeYearFromHeader ||
//       typeof label !== "string"
//     ) {
//       return label;
//     }

//     return label
//       .replace(
//         /\b(20\d{2}|19\d{2})\b/g,
//         ""
//       )
//       .replace(
//         /[-/\s]+$/,
//         ""
//       )
//       .trim();
//   };

//   // --------------------------------------------------
//   // Detect numeric values
//   // --------------------------------------------------
//   const isNumericValue = (value) => {
//     if (
//       typeof value === "number" &&
//       Number.isFinite(value)
//     ) {
//       return true;
//     }

//     if (
//       typeof value === "string" &&
//       value.trim() !== ""
//     ) {
//       const cleaned = value
//         .replace(/,/g, "")
//         .replace(
//           /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
//           ""
//         )
//         .replace(/%$/, "")
//         .trim();

//       return (
//         cleaned !== "" &&
//         Number.isFinite(Number(cleaned))
//       );
//     }

//     return false;
//   };

//   // --------------------------------------------------
//   // Convert value to number
//   // --------------------------------------------------
//   const getNumericValue = (value) => {
//     if (typeof value === "number") {
//       return value;
//     }

//     if (typeof value === "string") {
//       const cleaned = value
//         .replace(/,/g, "")
//         .replace(
//           /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
//           ""
//         )
//         .replace(/%$/, "")
//         .trim();

//       const number = Number(cleaned);

//       return Number.isFinite(number)
//         ? number
//         : null;
//     }

//     return null;
//   };

//   // --------------------------------------------------
//   // Format numeric value
//   // --------------------------------------------------
//   const formatNumericValue = (value) => {
//     const number = getNumericValue(value);

//     if (number === null) {
//       return value;
//     }

//     let displayValue = number;

//     // AED Millions
//     if (currencyMode === "AED_MILLIONS") {
//       displayValue = number / 1000000;

//       return `AED ${displayValue.toLocaleString(
//         "en-US",
//         {
//           minimumFractionDigits: 0,
//           maximumFractionDigits: 0,
//         }
//       )}M`;
//     }

//     // Normal AED
//     return displayValue.toLocaleString(
//       "en-US",
//       {
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0,
//       }
//     );
//   };

//   // --------------------------------------------------
//   // Shorten Legal Entity
//   // --------------------------------------------------
//   const formatLegalEntity = (value) => {
//     if (
//       !truncateLegalEntity ||
//       typeof value !== "string"
//     ) {
//       return {
//         display: value,
//         title: undefined,
//       };
//     }

//     if (
//       value.length <= legalEntityMaxLength
//     ) {
//       return {
//         display: value,
//         title: undefined,
//       };
//     }

//     return {
//       display:
//         value.slice(
//           0,
//           Math.max(1, legalEntityMaxLength - 3)
//         ) + "...",
//       title: value,
//     };
//   };

//   // --------------------------------------------------
//   // Detect Legal Entity column
//   // --------------------------------------------------
//   const isLegalEntityColumn = (column) => {
//     const key = String(
//       column?.key || ""
//     ).toLowerCase();

//     const label = String(
//       column?.label || ""
//     ).toLowerCase();

//     return (
//       key === "legal_entity" ||
//       key === "legalentity" ||
//       key === "legal_entity_name" ||
//       label === "legal entity" ||
//       label === "legal entity name"
//     );
//   };

//   // --------------------------------------------------
//   // Detect month column
//   // --------------------------------------------------
//   const isMonthColumn = (column) => {
//     const key = String(
//       column?.key || ""
//     ).toLowerCase();

//     const label = String(
//       column?.label || ""
//     ).toLowerCase();

//     return (
//       key.includes("month") ||
//       label.includes("jan") ||
//       label.includes("feb") ||
//       label.includes("mar") ||
//       label.includes("apr") ||
//       label.includes("may") ||
//       label.includes("jun") ||
//       label.includes("jul") ||
//       label.includes("aug") ||
//       label.includes("sep") ||
//       label.includes("oct") ||
//       label.includes("nov") ||
//       label.includes("dec")
//     );
//   };

//   // --------------------------------------------------
//   // Render cell value
//   // --------------------------------------------------
//   const renderCellValue = (
//     row,
//     column
//   ) => {
//     const value = column.render
//       ? column.render(row)
//       : row[column.key];

//     // ----------------------------------------------
//     // Legal Entity
//     // ----------------------------------------------
//     if (
//       truncateLegalEntity &&
//       isLegalEntityColumn(column) &&
//       typeof value === "string"
//     ) {
//       return formatLegalEntity(value);
//     }

//     // ----------------------------------------------
//     // Numeric values
//     // ----------------------------------------------
//     if (
//       removeDecimals &&
//       isNumericValue(value)
//     ) {
//       const number =
//         getNumericValue(value);

//       return {
//         display:
//           currencyToggle &&
//             currencyMode === "AED_MILLIONS"
//             ? formatNumericValue(value)
//             : number.toLocaleString(
//               "en-US",
//               {
//                 minimumFractionDigits: 0,
//                 maximumFractionDigits: 0,
//               }
//             ),
//         title: undefined,
//       };
//     }

//     // ----------------------------------------------
//     // Currency toggle
//     // ----------------------------------------------
//     if (
//       currencyToggle &&
//       isNumericValue(value)
//     ) {
//       return {
//         display:
//           formatNumericValue(value),
//         title: undefined,
//       };
//     }

//     // ----------------------------------------------
//     // Existing currency removal
//     // ----------------------------------------------
//     if (typeof value === "string") {
//       return {
//         display: value
//           .replace(
//             /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
//             ""
//           )
//           .replace(/^#\s*/, ""),
//         title: undefined,
//       };
//     }

//     return {
//       display: value,
//       title: undefined,
//     };
//   };

//   return (
//     <div style={{ width: "100%" }}>

//       {/* ==================================================
//           TABLE HEADER CONTROLS
//           ================================================== */}
//       {currencyToggle && showCurrencyToggle && (
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "flex-end",
//             alignItems: "center",
//             marginBottom: 8,
//           }}
//         >
//           <div
//             style={{
//               display: "inline-flex",
//               alignItems: "center",
//               border: "1px solid #dbe3ef",
//               borderRadius: 5,
//               padding: 2,
//               background: "#f8fafc",
//               gap: 2,
//             }}
//           >
//             {/* AED */}
//             <button
//               type="button"
//               onClick={() =>
//                 setCurrencyMode("AED")
//               }
//               style={{
//                 border: "none",
//                 borderRadius: 4,
//                 padding: "5px 10px",
//                 fontSize: 10,
//                 fontWeight: 700,
//                 cursor: "pointer",
//                 background:
//                   currencyMode === "AED"
//                     ? BLUE
//                     : "transparent",
//                 color:
//                   currencyMode === "AED"
//                     ? "#ffffff"
//                     : "#475569",
//               }}
//             >
//               AED
//             </button>

//             {/* AED Millions */}
//             <button
//               type="button"
//               onClick={() =>
//                 setCurrencyMode(
//                   "AED_MILLIONS"
//                 )
//               }
//               style={{
//                 border: "none",
//                 borderRadius: 4,
//                 padding: "5px 10px",
//                 fontSize: 10,
//                 fontWeight: 700,
//                 cursor: "pointer",
//                 background:
//                   currencyMode ===
//                     "AED_MILLIONS"
//                     ? BLUE
//                     : "transparent",
//                 color:
//                   currencyMode ===
//                     "AED_MILLIONS"
//                     ? "#ffffff"
//                     : "#475569",
//               }}
//             >
//               AED Millions
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ==================================================
//           TABLE
//           ================================================== */}
//       <div
//         style={{
//           width: "100%",
//           overflowX: fitColumns
//             ? "hidden"
//             : "auto",
//           border: "1px solid #e5eaf2",
//           borderRadius: 5,
//         }}
//       >
//         <table
//           style={{
//             width: "100%",
//             minWidth: fitColumns
//               ? 0
//               : compact
//                 ? 520
//                 : 650,
//             tableLayout: fitColumns
//               ? "fixed"
//               : "auto",
//             borderCollapse: "collapse",
//             fontSize: 10,
//           }}
//         >
//           <thead>
//             <tr>
//               {columns.map((column) => (
//                 <th
//                   key={column.key}
//                   style={{
//                     background: "#eef4ff",
//                     color: BLUE,
//                     fontWeight: 700,

//                     padding:
//                       monthColumnGap &&
//                         isMonthColumn(column)
//                         ? "7px 14px"
//                         : compactRows
//                           ? "5px 4px"
//                           : "7px 4px",

//                     borderBottom:
//                       "1px solid #dce5f4",

//                     textAlign:
//                       column.align ||
//                       "left",

//                     whiteSpace: fitColumns
//                       ? "normal"
//                       : "nowrap",
//                   }}
//                 >
//                   {formatHeader(
//                     column.label
//                   )}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody>
//             {paginatedRows.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={columns.length}
//                   style={{
//                     padding:
//                       "18px 10px",
//                     textAlign:
//                       "center",
//                     color: MUTED,
//                     fontSize: 11,
//                     fontWeight: 600,
//                     borderBottom:
//                       "none",
//                   }}
//                 >
//                   {emptyMessage}
//                 </td>
//               </tr>
//             ) : (
//               paginatedRows.map(
//                 (row, rowIndex) => (
//                   <tr
//                     key={
//                       row.id ||
//                       row.subdivision_id ||
//                       rowIndex
//                     }
//                     onClick={
//                       typeof onRowClick === "function"
//                         ? () => onRowClick(row, rowIndex)
//                         : undefined
//                     }
//                     style={{
//                       cursor:
//                         typeof onRowClick === "function"
//                           ? "pointer"
//                           : "default",
//                     }}
//                   >
//                     {columns.map(
//                       (column) => {
//                         const cell =
//                           renderCellValue(
//                             row,
//                             column
//                           );

//                         const rawNumericSource =
//                           row?.[column.key] ??
//                           (column.render
//                             ? column.render(row)
//                             : undefined);

//                         const numericValue =
//                           getNumericValue(rawNumericSource);

//                         const isNegative =
//                           negativeValuesRed &&
//                           numericValue !==
//                           null &&
//                           numericValue < 0;

//                         return (
//                           <td
//                             key={
//                               column.key
//                             }
//                             title={
//                               cell?.title
//                             }
//                             onClick={
//                               typeof onCellClick === "function"
//                                 ? () => onCellClick(row, column, rowIndex)
//                                 : undefined
//                             }
//                             style={{
//                               padding:
//                                 monthColumnGap &&
//                                   isMonthColumn(
//                                     column
//                                   )
//                                   ? rowGap
//                                     ? "13px 14px"
//                                     : compactRows
//                                       ? "3px 14px"
//                                       : "6px 14px"
//                                   : rowGap
//                                     ? "13px 4px"
//                                     : compactRows
//                                       ? "3px 4px"
//                                       : "6px 4px",

//                               lineHeight:
//                                 rowGap
//                                   ? "17px"
//                                   : compactRows
//                                     ? "14px"
//                                     : "normal",

//                               borderBottom:
//                                 rowIndex ===
//                                   paginatedRows.length -
//                                   1
//                                   ? "none"
//                                   : "1px solid #edf1f6",

//                               color:
//                                 isNegative
//                                   ? "#dc2626"
//                                   : "#334155",

//                               fontWeight: 700,

//                               textAlign:
//                                 column.align ||
//                                 "left",

//                               whiteSpace:
//                                 fitColumns
//                                   ? "normal"
//                                   : "nowrap",

//                               overflow:
//                                 fitColumns
//                                   ? "hidden"
//                                   : "visible",

//                               textOverflow:
//                                 fitColumns
//                                   ? "ellipsis"
//                                   : "clip",

//                               maxWidth:
//                                 truncateLegalEntity &&
//                                   isLegalEntityColumn(
//                                     column
//                                   )
//                                   ? 180
//                                   : undefined,
//                             }}
//                           >
//                             {cell?.display}
//                           </td>
//                         );
//                       }
//                     )}
//                   </tr>
//                 )
//               )
//             )}

//             {totalRow && (
//               <tr>
//                 {columns.map((column) => {
//                   const cell = renderCellValue(totalRow, column);

//                   const rawNumericSource =
//                     totalRow?.[column.key] ??
//                     (column.render
//                       ? column.render(totalRow)
//                       : undefined);

//                   const numericValue =
//                     getNumericValue(rawNumericSource);

//                   const isNegative =
//                     negativeValuesRed &&
//                     numericValue !== null &&
//                     numericValue < 0;

//                   return (
//                     <td
//                       key={`total-${column.key}`}
//                       title={cell?.title}
//                       style={{
//                         padding:
//                           monthColumnGap && isMonthColumn(column)
//                             ? "8px 14px"
//                             : "8px 4px",
//                         borderTop: "1px solid #d7e1ef",
//                         borderBottom: "none",
//                         background: "#f8fbff",
//                         color: isNegative ? "#dc2626" : BLUE,
//                         fontWeight: 800,
//                         textAlign: column.align || "left",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {cell?.display}
//                     </td>
//                   );
//                 })}
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* ==================================================
//           PAGINATION
//           ================================================== */}
//       {pagination &&
//         safeRows.length > pageSize && (
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent:
//                 "space-between",
//               marginTop: 10,
//               padding: "0 2px",
//             }}
//           >
//             {/* Showing */}
//             <div
//               style={{
//                 fontSize: 10,
//                 color: "#64748b",
//                 fontWeight: 600,
//               }}
//             >
//               Showing{" "}
//               {Math.min(
//                 (currentPage - 1) *
//                 pageSize +
//                 1,
//                 safeRows.length
//               )}{" "}
//               -{" "}
//               {Math.min(
//                 currentPage *
//                 pageSize,
//                 safeRows.length
//               )}{" "}
//               of{" "}
//               {safeRows.length}
//             </div>

//             {/* Pagination */}
//             <div
//               style={{
//                 display: "flex",
//                 alignItems:
//                   "center",
//                 gap: 4,
//               }}
//             >
//               {/* First */}
//               <button
//                 type="button"
//                 onClick={() =>
//                   goToPage(1)
//                 }
//                 disabled={
//                   currentPage === 1
//                 }
//                 style={{
//                   width: 28,
//                   height: 26,
//                   border:
//                     "1px solid #dbe3ef",
//                   borderRadius: 4,
//                   background:
//                     currentPage ===
//                       1
//                       ? "#f8fafc"
//                       : "#ffffff",
//                   color:
//                     currentPage ===
//                       1
//                       ? "#cbd5e1"
//                       : "#475569",
//                   cursor:
//                     currentPage ===
//                       1
//                       ? "not-allowed"
//                       : "pointer",
//                   fontSize: 11,
//                   fontWeight: 700,
//                 }}
//                 title="First page"
//               >
//                 «
//               </button>

//               {/* Previous */}
//               <button
//                 type="button"
//                 onClick={() =>
//                   goToPage(
//                     currentPage - 1
//                   )
//                 }
//                 disabled={
//                   currentPage === 1
//                 }
//                 style={{
//                   width: 28,
//                   height: 26,
//                   border:
//                     "1px solid #dbe3ef",
//                   borderRadius: 4,
//                   background:
//                     currentPage ===
//                       1
//                       ? "#f8fafc"
//                       : "#ffffff",
//                   color:
//                     currentPage ===
//                       1
//                       ? "#cbd5e1"
//                       : "#475569",
//                   cursor:
//                     currentPage ===
//                       1
//                       ? "not-allowed"
//                       : "pointer",
//                   fontSize: 11,
//                   fontWeight: 700,
//                 }}
//                 title="Previous page"
//               >
//                 ‹
//               </button>

//               {/* Current */}
//               <div
//                 style={{
//                   minWidth: 28,
//                   height: 26,
//                   padding: "0 7px",
//                   borderRadius: 4,
//                   background: BLUE,
//                   color: "#ffffff",
//                   display: "flex",
//                   alignItems:
//                     "center",
//                   justifyContent:
//                     "center",
//                   fontSize: 10,
//                   fontWeight: 700,
//                 }}
//               >
//                 {currentPage}
//               </div>

//               {/* Next */}
//               <button
//                 type="button"
//                 onClick={() =>
//                   goToPage(
//                     currentPage + 1
//                   )
//                 }
//                 disabled={
//                   currentPage ===
//                   totalPages
//                 }
//                 style={{
//                   width: 28,
//                   height: 26,
//                   border:
//                     "1px solid #dbe3ef",
//                   borderRadius: 4,
//                   background:
//                     currentPage ===
//                       totalPages
//                       ? "#f8fafc"
//                       : "#ffffff",
//                   color:
//                     currentPage ===
//                       totalPages
//                       ? "#cbd5e1"
//                       : "#475569",
//                   cursor:
//                     currentPage ===
//                       totalPages
//                       ? "not-allowed"
//                       : "pointer",
//                   fontSize: 11,
//                   fontWeight: 700,
//                 }}
//                 title="Next page"
//               >
//                 ›
//               </button>

//               {/* Last */}
//               <button
//                 type="button"
//                 onClick={() =>
//                   goToPage(
//                     totalPages
//                   )
//                 }
//                 disabled={
//                   currentPage ===
//                   totalPages
//                 }
//                 style={{
//                   width: 28,
//                   height: 26,
//                   border:
//                     "1px solid #dbe3ef",
//                   borderRadius: 4,
//                   background:
//                     currentPage ===
//                       totalPages
//                       ? "#f8fafc"
//                       : "#ffffff",
//                   color:
//                     currentPage ===
//                       totalPages
//                       ? "#cbd5e1"
//                       : "#475569",
//                   cursor:
//                     currentPage ===
//                       totalPages
//                       ? "not-allowed"
//                       : "pointer",
//                   fontSize: 11,
//                   fontWeight: 700,
//                 }}
//                 title="Last page"
//               >
//                 »
//               </button>
//             </div>
//           </div>
//         )}
//     </div>
//   );
// }


// /* ============================================================
//    MAIN PAGE
//    ============================================================ */

// export default function PayablesDashboard() {
//   const [filters, setFilters] = useState({
//     ...defaultPayablesFilters,
//   });

//   const [appliedFilters, setAppliedFilters] = useState({
//     ...defaultPayablesFilters,
//   });

//   const [showFilters, setShowFilters] = useState(true);
//   const [showViewAll, setShowViewAll] = useState(false);
//   const [viewAllSection, setViewAllSection] = useState("all");
//   const [viewAllDetailFilters, setViewAllDetailFilters] = useState({});
//   const [monthCurrencyMode, setMonthCurrencyMode] = useState("AED");
//   const [monthOnMonthYear, setMonthOnMonthYear] = useState(defaultPayablesFilters.year);
//   const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false);
//   const [filterOptions, setFilterOptions] = useState({
//     legal_groups: [],
//     legal_entities: [],
//     parent_divisions: [],
//     sub_divisions: [],
//     reporting_currencies: [],
//     as_on_dates: [],
//     aging_basis: [],
//     years: [],
//   });
//   const [data, setData] = useState(emptyDashboardData);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const kpis = data.kpis || {};
//   const currency = appliedFilters.reporting_currency || "AED";

//   useEffect(() => {
//     let active = true;

//     const loadFilterOptions = async () => {
//       try {
//         const response = await getPayablesFilterOptions();
//         if (!active) return;

//         const normalized = normalizeFilterOptions(response);
//         setFilterOptions(normalized);
//         setFilterOptionsLoaded(true);

//         const initial = {
//           legal_group: ["All"],
//           legal_entities: ["All"],
//           parent_divisions: ["All"],
//           sub_divisions: ["All"],
//           reporting_currency:
//             firstOptionLabel(normalized.reporting_currencies, "AED"),
//           as_on_date:
//             firstOptionLabel(normalized.as_on_dates, ""),
//           aging_basis:
//             displayAgingBasis(
//               firstOptionLabel(normalized.aging_basis, "DUE_DATE")
//             ),
//           year:
//             normalized.years.length
//               ? normalized.years[normalized.years.length - 1]
//               : new Date().getFullYear(),
//         };

//         setFilters(initial);
//         setAppliedFilters(initial);
//       } catch (requestError) {
//         console.error("Payables filter options failed", requestError);
//         if (active) {
//           setError(
//             requestError?.response?.data?.detail ||
//             requestError?.message ||
//             "Failed to load Payables filter options."
//           );
//         }
//       }
//     };

//     loadFilterOptions();

//     return () => {
//       active = false;
//     };
//   }, []);

//   useEffect(() => {
//     let active = true;

//     const loadDashboard = async () => {
//       if (!filterOptionsLoaded || !appliedFilters.as_on_date) return;

//       setLoading(true);
//       setError("");

//       try {
//         const apiFilters = buildPayablesApiFilters(
//           appliedFilters,
//           filterOptions
//         );
//         /*
//          * Keep the existing dashboard integration intact.
//          * The newly deployed Sub-Division and Month-on-Month endpoints
//          * are loaded separately so a failure in either new endpoint
//          * does not break the existing dashboard response.
//          */
//         const [dashboardResult, subdivisionResult, monthOnMonthResult] =
//           await Promise.allSettled([
//             getPayablesDashboard(apiFilters),
//             getPayablesBySubdivision(apiFilters),
//             getPayablesMonthOnMonth({
//               ...apiFilters,
//               year: appliedFilters.year,
//             }),
//           ]);

//         if (!active) return;

//         if (dashboardResult.status === "rejected") {
//           throw dashboardResult.reason;
//         }

//         const dashboardData = normalizeDashboardResponse(
//           dashboardResult.value
//         );

//         const subdivisionData =
//           subdivisionResult.status === "fulfilled"
//             ? normalizeSubdivisionResponse(subdivisionResult.value)
//             : [];

//         const monthOnMonthResponse =
//           monthOnMonthResult.status === "fulfilled"
//             ? monthOnMonthResult.value
//             : null;

//         const monthOnMonthData = monthOnMonthResponse
//           ? normalizeMonthOnMonthResponse(monthOnMonthResponse)
//           : [];

//         /*
//          * Preserve the year returned by the Month-on-Month API even when
//          * the response shape is { data: [...], year: 2026 }.
//          * This year drives the Month-on-Month header dropdown.
//          */
//         const monthOnMonthPayload =
//           monthOnMonthResponse?.data?.data ??
//           monthOnMonthResponse?.data ??
//           monthOnMonthResponse ??
//           {};

//         const returnedMonthOnMonthYear = Number(
//           monthOnMonthResponse?.data?.year ??
//           monthOnMonthResponse?.data?.selected_year ??
//           monthOnMonthResponse?.data?.selectedYear ??
//           monthOnMonthResponse?.year ??
//           monthOnMonthResponse?.selected_year ??
//           monthOnMonthResponse?.selectedYear ??
//           monthOnMonthPayload?.year ??
//           monthOnMonthPayload?.selected_year ??
//           monthOnMonthPayload?.selectedYear ??
//           appliedFilters.year
//         );

//         setData({
//           ...dashboardData,
//           subDivision: subdivisionData,
//           monthOnMonth: monthOnMonthData,
//           monthOnMonthYear: Number.isFinite(returnedMonthOnMonthYear)
//             ? returnedMonthOnMonthYear
//             : appliedFilters.year,
//         });
//         setMonthOnMonthYear(
//           Number.isFinite(returnedMonthOnMonthYear)
//             ? returnedMonthOnMonthYear
//             : appliedFilters.year
//         );

//         if (subdivisionResult.status === "rejected") {
//           console.error(
//             "Payables Sub-Division API failed",
//             subdivisionResult.reason
//           );
//         }

//         if (monthOnMonthResult.status === "rejected") {
//           console.error(
//             "Payables Month-on-Month API failed",
//             monthOnMonthResult.reason
//           );
//         }
//       } catch (requestError) {
//         console.error("Payables dashboard failed", requestError);
//         if (active) {
//           setData(emptyDashboardData);
//           setError(
//             requestError?.response?.data?.detail ||
//             requestError?.message ||
//             "Failed to load Payables dashboard."
//           );
//         }
//       } finally {
//         if (active) setLoading(false);
//       }
//     };

//     loadDashboard();

//     return () => {
//       active = false;
//     };
//   }, [appliedFilters, filterOptions, filterOptionsLoaded]);

//   const setFilter = (key, value) => {
//     setFilters((previous) => ({
//       ...previous,
//       [key]: value,
//     }));
//   };

//   const handleApply = () => {
//     /*
//      * IMPORTANT:
//      * aging_basis is preserved exactly here.
//      * Future API calls should send:
//      *
//      * {
//      *   ...filters,
//      *   aging_basis: filters.aging_basis
//      * }
//      */
//     setAppliedFilters({
//       ...filters,
//       aging_basis: displayAgingBasis(filters.aging_basis),
//     });
//   };

//   const handleReset = () => {
//     const reset = {
//       legal_group: ["All"],
//       legal_entities: ["All"],
//       parent_divisions: ["All"],
//       sub_divisions: ["All"],
//       reporting_currency:
//         firstOptionLabel(filterOptions.reporting_currencies, "AED"),
//       as_on_date:
//         firstOptionLabel(filterOptions.as_on_dates, ""),
//       aging_basis: displayAgingBasis(
//         firstOptionLabel(filterOptions.aging_basis, "DUE_DATE")
//       ),
//       year:
//         filterOptions.years?.length
//           ? filterOptions.years[filterOptions.years.length - 1]
//           : new Date().getFullYear(),
//     };

//     setFilters(reset);
//     setAppliedFilters(reset);
//   };

//   const handleExport = async (format) => {
//     try {
//       const apiFilters = buildPayablesApiFilters(
//         appliedFilters,
//         filterOptions
//       );

//       const response =
//         format === "excel"
//           ? await exportPayablesExcel(apiFilters)
//           : await exportPayablesPdf(apiFilters);

//       const blob = response?.data;

//       if (!(blob instanceof Blob)) {
//         throw new Error("Export response did not contain a downloadable file.");
//       }

//       const contentDisposition =
//         response?.headers?.["content-disposition"] ||
//         response?.headers?.["Content-Disposition"] ||
//         "";

//       const filenameMatch = contentDisposition.match(
//         /filename\*?=(?:UTF-8''|")?([^";\n]+)"?/i
//       );

//       const fallbackName =
//         format === "excel"
//           ? "Payables_Report.xlsx"
//           : "Payables_Report.pdf";

//       const filename = filenameMatch?.[1]
//         ? decodeURIComponent(filenameMatch[1])
//         : fallbackName;

//       const url = window.URL.createObjectURL(blob);
//       const anchor = document.createElement("a");

//       anchor.href = url;
//       anchor.download = filename;
//       document.body.appendChild(anchor);
//       anchor.click();
//       anchor.remove();

//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Payables export failed", error);

//       setError(
//         error?.response?.data?.detail ||
//         error?.message ||
//         `Failed to export Payables ${format === "excel" ? "Excel" : "PDF"}.`
//       );
//     }
//   };

//   const openPayablesViewAll = (
//     section = "all",
//     detailFilters = {}
//   ) => {
//     setViewAllSection(section);
//     setViewAllDetailFilters(detailFilters || {});
//     setShowViewAll(true);
//   };

//   const openPayablesRecordViewAll = (detailFilters = {}) => {
//     openPayablesViewAll("all", detailFilters);
//   };

//   const handleAgingDrillDown = (row) => {
//     const bucketCode =
//       row?.bucket_code ??
//       row?.bucket ??
//       row?.code;

//     const normalizedBucket = toAgingBucketCode(bucketCode);

//     if (normalizedBucket) {
//       openPayablesRecordViewAll({
//         aging_bucket: normalizedBucket,
//       });
//     }
//   };

//   const handleTrendDrillDown = (point) => {
//     const snapshotDate =
//       point?.as_on_date ??
//       point?.snapshot_date ??
//       point?.date;

//     if (snapshotDate) {
//       openPayablesRecordViewAll({
//         as_on_date: toApiDate(snapshotDate),
//       });
//     }
//   };

//   const handleParentDivisionDrillDown = (row) => {
//     const id =
//       row?.parent_division_id ??
//       row?.parentDivisionId ??
//       row?.value ??
//       row?.id;

//     if (id !== undefined && id !== null && id !== "") {
//       openPayablesRecordViewAll({
//         parent_division_id: id,
//       });
//     }
//   };

//   const handleSupplierDrillDown = (row) => {
//     const id =
//       row?.supplier_id ??
//       row?.supplierId ??
//       row?.supplier_code ??
//       row?.id;

//     if (id !== undefined && id !== null && id !== "") {
//       openPayablesRecordViewAll({
//         supplier_id: id,
//       });
//     }
//   };

//   const handleOverdueDrillDown = () => {
//     openPayablesRecordViewAll({
//       balance_status: "OVERDUE",
//     });
//   };

//   const handleOverdueAbove90DrillDown = () => {
//     openPayablesRecordViewAll({
//       balance_status: "OVERDUE_ABOVE_90",
//     });
//   };

//   const handleSubdivisionDrillDown = (row) => {
//     const id =
//       row?.subdivision_id ??
//       row?.sub_division_id ??
//       row?.subdivisionId ??
//       row?.id;

//     if (id !== undefined && id !== null && id !== "") {
//       openPayablesRecordViewAll({
//         subdivision_id: id,
//       });
//     }
//   };

//   const getMoMSnapshotDate = (row, month) => {
//     const snapshotDates =
//       row?.snapshot_dates ??
//       row?.snapshotDates ??
//       {};

//     return (
//       snapshotDates?.[month] ??
//       snapshotDates?.[String(month).toUpperCase()] ??
//       null
//     );
//   };

//   const handleMoMDrillDown = (row, month) => {
//     const snapshotDate = getMoMSnapshotDate(row, month);

//     const detailFilters = {
//       ...(row?.legal_entity_id != null
//         ? { legal_entity_id: row.legal_entity_id }
//         : {}),
//       ...(row?.parent_division_id != null
//         ? { parent_division_id: row.parent_division_id }
//         : {}),
//       ...(row?.subdivision_id != null
//         ? { subdivision_id: row.subdivision_id }
//         : row?.sub_division_id != null
//           ? { subdivision_id: row.sub_division_id }
//           : {}),
//       ...(snapshotDate
//         ? { as_on_date: toApiDate(snapshotDate) }
//         : {}),
//     };

//     if (Object.keys(detailFilters).length > 0) {
//       openPayablesRecordViewAll(detailFilters);
//     }
//   };

//   const supplierRows = data.topSuppliers;

//   const supplierColumns = [
//     {
//       key: "rank",
//       label: "#",
//       align: "left",
//     },
//     {
//       key: "supplier_name",
//       label: "Supplier Name",
//     },
//     {
//       key: "payable_amount",
//       label: `Payables (${currency})`,
//       align: "right",
//       render: (row) =>
//         formatPayablesCompact(row.payable_amount, currency),
//     },
//     {
//       key: "percentage",
//       label: "% of Total",
//       align: "right",
//       render: (row) => formatPercentage(row.percentage),
//     },
//   ];

//   const subDivisionColumns = [
//     {
//       key: "name",
//       label: "Sub-Division",
//     },
//     {
//       key: "amount",
//       label: `Payables (${currency})`,
//       align: "right",
//       render: (row) =>
//         formatPayablesCompact(row.amount, currency),
//     },
//     {
//       key: "percentage",
//       label: "% of Total",
//       align: "right",
//       render: (row) => formatPercentage(row.percentage),
//     },
//   ];

//   const monthColumns = [
//     {
//       key: "legal_entity",
//       label: "Legal Entity",
//     },
//     {
//       key: "parent_division",
//       label: "Parent Division",
//     },
//     {
//       key: "sub_division",
//       label: "Sub-Division",
//     },
//     ...MONTHS.map((month) => ({
//       key: month,
//       label: month,
//       align: "right",
//       render: (row) => formatMoMValue(row[month]),
//     })),
//     {
//       key: "latest",
//       label: "Latest",
//       align: "right",
//       render: (row) => formatMoMValue(row.latest),
//     },
//   ];

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: BG,
//         fontFamily:
//           "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//         color: TEXT,
//       }}
//     >
//       {/* ======================================================
//           PAGE CONTENT
//           ====================================================== */}

//       <main
//         style={{
//           width: "100%",
//           boxSizing: "border-box",
//           padding: "16px 18px 22px",
//         }}
//       >
//         {/* HEADER */}

//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             gap: 15,
//             marginBottom: 12,
//           }}
//         >
//           <div>
//             <h1
//               style={{
//                 margin: 0,
//                 color: "#00000",
//                 fontSize: 26,
//                 lineHeight: 1.1,
//                 fontWeight: 800,
//               }}
//             >
//               Payables Dashboard
//             </h1>

//             <div
//               style={{
//                 marginTop: 3,
//                 color: "#66789e",
//                 fontSize: 12,
//               }}
//             >
//               Track payables, aging, overdue exposure and payment
//               performance
//             </div>
//           </div>

//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 9,
//             }}
//           >

//             {/* Excel */}
//             <button
//               type="button"
//               onClick={() => handleExport("excel")}
//               style={{
//                 height: 34,
//                 minWidth: 80,
//                 padding: "0 13px",
//                 display: "inline-flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: 6,
//                 border: "1px solid #86efac",
//                 borderRadius: 8,
//                 background: "#f7fffa",
//                 color: "#16a34a",
//                 fontSize: 11,
//                 fontWeight: 800,
//                 cursor: "pointer",
//                 transition: "all 0.2s ease",
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.background = "#ecfdf5";
//                 e.currentTarget.style.borderColor = "#4ade80";
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.background = "#f7fffa";
//                 e.currentTarget.style.borderColor = "#86efac";
//               }}
//             >
//               <span style={{ fontSize: 13 }}>📊</span>
//               Excel
//             </button>

//             {/* PDF */}
//             <button
//               type="button"
//               onClick={() => handleExport("pdf")}
//               style={{
//                 height: 34,
//                 minWidth: 72,
//                 padding: "0 13px",
//                 display: "inline-flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: 6,
//                 border: "1px solid #fda4af",
//                 borderRadius: 8,
//                 background: "#fff8f8",
//                 color: "#ef4444",
//                 fontSize: 11,
//                 fontWeight: 800,
//                 cursor: "pointer",
//                 transition: "all 0.2s ease",
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.background = "#fff1f2";
//                 e.currentTarget.style.borderColor = "#fb7185";
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.background = "#fff8f8";
//                 e.currentTarget.style.borderColor = "#fda4af";
//               }}
//             >
//               <span style={{ fontSize: 13 }}>📄</span>
//               PDF
//             </button>


//           </div>
//         </div>

//         {/* ==================================================
//             PAYABLE-SPECIFIC FILTER BAR
//             ================================================== */}

//         <div
//           style={{
//             width: "100%",
//             boxSizing: "border-box",
//             background: "#ffffff",
//             border: "1px solid #edf1f7",
//             borderRadius: 12,
//             padding: "12px 16px",
//             display: "flex",
//             alignItems: "flex-end",
//             gap: 10,
//             boxShadow: "0 2px 8px rgba(30, 55, 90, 0.04)",
//             overflow: "visible",
//           }}
//         >
//           <FilterSelect
//             label="Legal Group"
//             value={filters.legal_group}
//             options={getOptionLabels(filterOptions.legal_groups)}
//             multiple
//             onChange={(value) =>
//               setFilters((prev) => ({
//                 ...prev,
//                 legal_group: value,
//               }))
//             }
//           />

//           <FilterSelect
//             label="Legal Entity"
//             value={filters.legal_entities}
//             options={getOptionLabels(filterOptions.legal_entities)}
//             multiple
//             onChange={(value) =>
//               setFilters((prev) => ({
//                 ...prev,
//                 legal_entities: value,
//               }))
//             }
//           />

//           <FilterSelect
//             label="Parent Division"
//             value={filters.parent_divisions}
//             options={getOptionLabels(filterOptions.parent_divisions)}
//             multiple
//             onChange={(value) =>
//               setFilters((prev) => ({
//                 ...prev,
//                 parent_divisions: value,
//               }))
//             }
//           />

//           <FilterSelect
//             label="Sub-Division"
//             value={filters.sub_divisions}
//             options={getOptionLabels(filterOptions.sub_divisions)}
//             onChange={(value) =>
//               setFilters((prev) => ({
//                 ...prev,
//                 sub_divisions: value,
//               }))
//             }
//             multiple
//           />

//           <FilterSelect
//             label="Reporting Currency"
//             value={filters.reporting_currency}
//             options={getOptionLabels(filterOptions.reporting_currencies)}
//             onChange={(value) =>
//               setFilters((prev) => ({
//                 ...prev,
//                 reporting_currency: value,
//               }))
//             }
//           />

//           <FilterSelect
//             label="Aging Basis"
//             value={filters.aging_basis}
//             options={getOptionLabels(filterOptions.aging_basis).map(displayAgingBasis)}
//             onChange={(value) =>
//               setFilters((prev) => ({
//                 ...prev,
//                 aging_basis: value,
//               }))
//             }
//           />

//           <DateFilter
//             value={filters.as_on_date}
//             options={filterOptions.as_on_dates || []}
//             onChange={(value) =>
//               setFilters((prev) => ({
//                 ...prev,
//                 as_on_date: value,
//               }))
//             }
//           />
//           <button
//             type="button"
//             onClick={handleApply}
//             style={{
//               height: 34,
//               minWidth: 76,
//               padding: "0 18px",
//               border: "none",
//               borderRadius: 9,
//               background: "#5b5bea",
//               color: "#ffffff",
//               fontSize: 11,
//               fontWeight: 700,
//               cursor: "pointer",
//               boxShadow: "0 3px 8px rgba(91, 91, 234, 0.20)",
//               flexShrink: 0,
//             }}
//           >
//             Apply
//           </button>

//           <button
//             type="button"
//             onClick={handleReset}
//             style={{
//               height: 34,
//               minWidth: 66,
//               padding: "0 16px",
//               border: "1px solid #e0e5ee",
//               borderRadius: 9,
//               background: "#ffffff",
//               color: "#52638a",
//               fontSize: 11,
//               fontWeight: 600,
//               cursor: "pointer",
//               flexShrink: 0,
//             }}
//           >
//             Reset
//           </button>
//         </div>

//         {error && (
//           <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 8, background: "#fff1f2", color: "#be123c", fontSize: 11, fontWeight: 600 }}>
//             {error}
//           </div>
//         )}

//         {loading && (
//           <div style={{ marginTop: 10, padding: "8px 12px", color: "#64748b", fontSize: 11 }}>
//             Loading Payables data...
//           </div>
//         )}

//         {/* ==================================================
//             KPI CARDS
//             ================================================== */}

//         <div
//           style={{
//             marginTop: "20px",
//             display: "grid",
//             gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
//             gap: 9,
//             marginBottom: 12,
//           }}
//         >
//           <KpiCard
//             title="Total Payables"
//             value={kpis.total_payables}
//             variance={kpis.total_change_percentage}
//             previousDate={kpis.previous_as_on_date}
//             currency={currency}
//             icon="▤"
//             iconBg="#F5F9FF"
//             iconColor="#2563eb"
//           />

//           <KpiCard
//             title="Current Payables"
//             value={kpis.current_payables}
//             variance={kpis.current_change_percentage}
//             previousDate={kpis.previous_as_on_date}
//             currency={currency}
//             icon="▣"
//             iconBg="#F3FCF6"
//             iconColor="#0e9f75"
//           />

//           <KpiCard
//             title="Overdue Payables"
//             value={kpis.overdue_payables}
//             variance={kpis.overdue_change_percentage}
//             previousDate={kpis.previous_as_on_date}
//             currency={currency}
//             icon="⌛"
//             iconBg="#FFF9F3"
//             iconColor="#f59e0b"
//           // onClick={handleOverdueDrillDown}
//           />

//           <KpiCard
//             title="Overdue > 90 Days"
//             value={kpis.overdue_above_90}
//             variance={kpis.overdue_above_90_change_percentage}
//             previousDate={kpis.previous_as_on_date}
//             currency={currency}
//             icon="!"
//             iconBg="#FFF7FA"
//             iconColor="#ef476f"
//           // onClick={handleOverdueAbove90DrillDown}
//           />

//           <KpiCard
//             title="DPO – Days Payable Outstanding"
//             value={kpis.dpo_days}
//             variance={kpis.dpo_change_days}
//             previousDate={kpis.previous_as_on_date}
//             suffix="Days"
//             currency={currency}
//             icon="%"
//             iconBg="#F3FCFF"
//             iconColor="#0ea5c9"
//           />
//         </div>

//         {/* ==================================================
//             ROW 1
//             ================================================== */}

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
//             gap: 9,
//             marginBottom: 9,
//             width: "100%",
//             alignItems: "stretch",
//           }}
//         >
//           {/* Aging Summary */}
//           <section
//             style={{
//               ...cardStyle,
//               padding: 12,
//               minWidth: 0,
//               width: "100%",
//               boxSizing: "border-box",
//               overflow: "hidden",
//               position: "relative",
//             }}
//           >
//             <SectionActions
//               onViewAll={() => openPayablesViewAll("aging")}
//               onExportExcel={() => handleExport("excel")}
//               onExportPdf={() => handleExport("pdf")}
//             />
//             <SectionTitle info="Payables grouped by aging bucket">
//               Payables Aging Summary ({currency})
//             </SectionTitle>

//             <div
//               style={{
//                 width: "100%",
//                 minWidth: 0,
//                 overflow: "hidden",
//               }}
//             >
//               <DonutChart
//                 data={data.agingSummary}
//                 total={kpis.total_payables}
//                 currency={currency}
//                 centerLabel="Total"
//                 onSegmentClick={handleAgingDrillDown}
//               />
//             </div>
//           </section>

//           {/* Trend */}
//           <section
//             style={{
//               ...cardStyle,
//               padding: 12,
//               minWidth: 0,
//               width: "100%",
//               boxSizing: "border-box",
//               overflow: "hidden",
//               position: "relative",
//             }}
//           >
//             <SectionActions
//               onViewAll={() => openPayablesViewAll("trend")}
//               onExportExcel={() => handleExport("excel")}
//               onExportPdf={() => handleExport("pdf")}
//             />
//             <SectionTitle info="Historical total payables and DPO">
//               Payables Trend ({currency})
//             </SectionTitle>

//             <div
//               style={{
//                 width: "100%",
//                 minWidth: 0,
//                 overflow: "hidden",
//               }}
//             >
//               <TrendChart
//                 data={data.trend}
//                 currency={currency}
//                 onPointClick={handleTrendDrillDown}
//               />
//             </div>
//           </section>

//           {/* Parent Division */}
//           <section
//             style={{
//               ...cardStyle,
//               padding: 12,
//               minWidth: 0,
//               width: "100%",
//               boxSizing: "border-box",
//               overflow: "hidden",
//               position: "relative",
//             }}
//           >
//             <SectionActions
//               onViewAll={() => openPayablesViewAll("parent_division")}
//               onExportExcel={() => handleExport("excel")}
//               onExportPdf={() => handleExport("pdf")}
//             />
//             <SectionTitle>
//               Payables by Parent Division ({currency})
//             </SectionTitle>

//             <div
//               style={{
//                 width: "100%",
//                 minWidth: 0,
//                 overflow: "hidden",
//               }}
//             >
//               <ParentDivisionChart
//                 data={data.parentDivision}
//                 currency={currency}
//                 onRowClick={handleParentDivisionDrillDown}
//               />
//             </div>
//           </section>
//         </div>

//         {/* ==================================================
//             ROW 2
//             ================================================== */}

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
//             gap: 9,
//             marginBottom: 9,
//             width: "100%",
//           }}
//         >
//           {/* Top 10 Suppliers */}

//           <section
//             style={{ ...cardStyle, padding: 12, position: "relative" }}
//           >
//             <SectionActions
//               onViewAll={() => openPayablesViewAll("top_suppliers")}
//               onExportExcel={() => handleExport("excel")}
//               onExportPdf={() => handleExport("pdf")}
//             />
//             <SectionTitle>
//               Top 10 Suppliers by Payables ({currency})
//             </SectionTitle>

//             <DataTable
//               columns={supplierColumns}
//               rows={data.topSuppliers}
//               fitColumns
//               compactRows
//               onRowClick={handleSupplierDrillDown}
//             />
//             {supplierRows.length > 0 && (
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 100px 55px",
//                   alignItems: "center",
//                   marginTop: 7,
//                   padding: "0 4px",
//                   color: BLUE,
//                   fontSize: 12,
//                   fontWeight: 700,
//                 }}
//               >
//                 {/* Total */}
//                 <span
//                   style={{
//                     textAlign: "center",
//                   }}
//                 >
//                   Total
//                 </span>

//                 {/* Amount */}
//                 <span
//                   style={{
//                     textAlign: "left",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   {formatPayablesCompact(
//                     supplierRows.reduce(
//                       (sum, item) =>
//                         sum + Number(item.payable_amount || 0),
//                       0
//                     ),
//                     currency
//                   ).replace(
//                     /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
//                     ""
//                   )}
//                 </span>

//                 {/* Percentage */}
//                 <span
//                   style={{
//                     textAlign: "right",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   {formatPercentage(
//                     supplierRows.reduce(
//                       (sum, item) =>
//                         sum + Number(item.percentage || 0),
//                       0
//                     )
//                   )}
//                 </span>
//               </div>
//             )}
//           </section>

//           {/* Overdue Summary */}

//           <section
//             style={{ ...cardStyle, padding: 12, position: "relative" }}
//           >
//             <SectionActions
//               onViewAll={() => openPayablesViewAll("overdue")}
//               onExportExcel={() => handleExport("excel")}
//               onExportPdf={() => handleExport("pdf")}
//             />
//             <SectionTitle>
//               Overdue Summary ({currency})
//             </SectionTitle>



//             <DonutChart
//               data={data.overdueSummary}
//               total={kpis.overdue_payables}
//               currency={currency}
//               centerLabel="Overdue"
//               legendBelow
//               onSegmentClick={handleAgingDrillDown}
//             />
//           </section>

//           {/* Sub Division */}

//           <section
//             style={{ ...cardStyle, padding: 12, position: "relative" }}
//           >
//             <SectionActions
//               onViewAll={() => openPayablesViewAll("sub_division")}
//               onExportExcel={() => handleExport("excel")}
//               onExportPdf={() => handleExport("pdf")}
//             />
//             <SectionTitle>
//               Payables by Sub-Division ({currency})
//             </SectionTitle>
//             <DataTable
//               columns={subDivisionColumns}
//               rows={data.subDivision}
//               onRowClick={handleSubdivisionDrillDown}
//               pagination={true}
//               pageSize={10}
//               fitColumns
//               rowGap
//               totalRow={
//                 data.subDivision.length > 0
//                   ? {
//                     name: "Total",
//                     amount: data.subDivision.reduce(
//                       (sum, item) =>
//                         sum + Number(item.amount || 0),
//                       0
//                     ),
//                     percentage:
//                       data.subDivision.reduce(
//                         (sum, item) =>
//                           sum + Number(item.amount || 0),
//                         0
//                       ) > 0
//                         ? 100
//                         : null,
//                   }
//                   : null
//               }
//             />
//           </section>
//         </div>


//         {/* ==================================================
//             MONTH-ON-MONTH
//             ================================================== */}

//         <section
//           style={{
//             ...cardStyle,
//             padding: 12,
//             marginBottom: 10,
//             position: "relative",
//           }}
//         >
//           <SectionActions
//             onViewAll={() => openPayablesViewAll("month_on_month")}
//             onExportExcel={() => handleExport("excel")}
//             onExportPdf={() => handleExport("pdf")}
//           />
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               gap: 14,
//               marginBottom: 10,
//               paddingRight: 58,
//               boxSizing: "border-box",
//             }}
//           >
//             <SectionTitle info="Monthly payable balance by legal entity">
//               Month-on-Month Payables ({currency})
//             </SectionTitle>

//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 8,
//                 marginRight: 10,
//                 flexShrink: 0,
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: 10,
//                   color: MUTED,
//                 }}
//               >
//                 Year
//               </span>

//               <input
//                 value={monthOnMonthYear || filters.year}
//                 onChange={(e) => {
//                   const nextYear = Number(e.target.value);
//                   setMonthOnMonthYear(nextYear);
//                   setFilter("year", nextYear);
//                   setAppliedFilters((previous) => ({
//                     ...previous,
//                     year: nextYear,
//                   }));
//                 }} readOnly
//                 style={{
//                   height: 30,
//                   minWidth: 75,
//                   border: "1px solid #d5ddeb",
//                   borderRadius: 5,
//                   background: "#fff",
//                   color: BLUE,
//                   padding: "0 8px",
//                   fontSize: 10,
//                   fontWeight: 600,
//                 }}
//               />
//               {/* {filterOptions.years.map((year) => (
//                   <option key={year} value={year}>
//                     {year}
//                   </option>
//                 ))} */}


//               {/* AED / AED Millions toggle stays on the same row as Year and the ⋮ menu. */}
//               <div
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   border: "1px solid #dbe3ef",
//                   borderRadius: 5,
//                   padding: 2,
//                   background: "#f8fafc",
//                   gap: 2,
//                   flexShrink: 0,
//                 }}
//               >
//                 <button
//                   type="button"
//                   onClick={() => setMonthCurrencyMode("AED")}
//                   style={{
//                     border: "none",
//                     borderRadius: 4,
//                     padding: "5px 9px",
//                     fontSize: 10,
//                     fontWeight: 700,
//                     cursor: "pointer",
//                     background: monthCurrencyMode === "AED" ? BLUE : "transparent",
//                     color: monthCurrencyMode === "AED" ? "#fff" : "#475569",
//                   }}
//                 >
//                   AED
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setMonthCurrencyMode("AED_MILLIONS")}
//                   style={{
//                     border: "none",
//                     borderRadius: 4,
//                     padding: "5px 9px",
//                     fontSize: 10,
//                     fontWeight: 700,
//                     cursor: "pointer",
//                     background: monthCurrencyMode === "AED_MILLIONS" ? BLUE : "transparent",
//                     color: monthCurrencyMode === "AED_MILLIONS" ? "#fff" : "#475569",
//                   }}
//                 >
//                   AED Millions
//                 </button>
//               </div>
//             </div>
//           </div>


//           <DataTable columns={monthColumns}
//             rows={data.monthOnMonth}
//             pagination={true} pageSize={8}
//             truncateLegalEntity={true}
//             legalEntityMaxLength={18}
//             monthColumnGap={true}
//             removeDecimals={true}
//             removeYearFromHeader={true}
//             currencyToggle={true}
//             currencyMode={monthCurrencyMode}
//             showCurrencyToggle={false}
//             negativeValuesRed={true}
//             onCellClick={(row, column) => {
//               if (MONTHS.includes(column?.key)) {
//                 handleMoMDrillDown(row, column.key);
//               }
//             }} />

//         </section>

//         {/* ==================================================
//             FOOTER
//             ================================================== */}

//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             gap: 10,
//             fontSize: 10, fontWeight: 700,
//             color: "#64748b",
//             padding: "3px 8px",
//           }}
//         >
//           <span>
//             Values shown in {currency}
//           </span>

//           <span>
//             Aging Basis:{" "}
//             <strong style={{ color: BLUE }}>
//               {appliedFilters.aging_basis}
//             </strong>
//           </span>

//           <span>
//             Last Updated On: {appliedFilters.as_on_date}
//           </span>
//         </div>
//       </main >

//       {/* ======================================================
//           VIEW ALL MODAL
//           ====================================================== */}

//       {showViewAll && (
//         <PayablesViewAll
//           filters={appliedFilters}
//           section={viewAllSection}
//           detailFilters={viewAllDetailFilters}
//           data={data.viewAll}
//           currency={currency}
//           filterOptions={filterOptions}
//           onClose={() => setShowViewAll(false)}
//         />
//       )}
//     </div >
//   );
// }


// /* ============================================================
//    SECTION-SPECIFIC VIEW ALL
//    Each dashboard component opens its own View All dataset/table.
//    ============================================================ */
// function PayablesSectionViewAllLegacy({
//   section,
//   dashboardData = {},
//   currency,
//   filters = {},
//   filterOptions = {},
//   onClose,
// }) {
//   const sectionConfig = {
//     aging: {
//       title: "Payables Aging Summary View All",
//       subtitle: "Detailed aging bucket balances for the selected snapshot.",
//       rows: dashboardData.agingSummary || [],
//       columns: [
//         { key: "bucket_name", label: "Aging Bucket" },
//         { key: "amount", label: `Amount (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
//         { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     trend: {
//       title: "Payables Trend View All",
//       subtitle: "Monthly payables trend and DPO details.",
//       rows: dashboardData.trend || [],
//       columns: [
//         { key: "month", label: "Month" },
//         { key: "total_payables", label: `Total Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.total_payables, currency) },
//         { key: "dpo", label: "DPO (Days)", align: "right", render: (r) => `${Number(r.dpo || 0).toFixed(1)} Days` },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     parent_division: {
//       title: "Payables by Parent Division View All",
//       subtitle: "Complete parent-division payable balances.",
//       rows: dashboardData.parentDivision || [],
//       columns: [
//         { key: "name", label: "Parent Division" },
//         { key: "amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
//         { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     top_suppliers: {
//       title: "Top Suppliers by Payables View All",
//       subtitle: "Supplier-level payable balances from the dashboard data.",
//       rows: dashboardData.topSuppliers || [],
//       columns: [
//         { key: "rank", label: "#", align: "left" },
//         { key: "supplier_name", label: "Supplier Name" },
//         { key: "payable_amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.payable_amount, currency) },
//         { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     overdue: {
//       title: "Overdue Summary View All",
//       subtitle: "Detailed overdue aging buckets and balances.",
//       rows: dashboardData.overdueSummary || [],
//       columns: [
//         { key: "bucket", label: "Overdue Bucket" },
//         { key: "amount", label: `Amount (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount ?? r.total_payables ?? r.payable_amount, currency) },
//         { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     sub_division: {
//       title: "Payables by Sub-Division View All",
//       subtitle: "Complete sub-division payable balances.",
//       rows: dashboardData.subDivision || [],
//       columns: [
//         { key: "name", label: "Sub-Division" },
//         { key: "amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
//         { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     month_on_month: {
//       title: "Month-on-Month Payables View All",
//       subtitle: "Detailed month-on-month payable balances by legal entity.",
//       rows: dashboardData.monthOnMonth || [],
//       columns: [
//         { key: "legal_entity", label: "Legal Entity" },
//         { key: "parent_division", label: "Parent Division" },
//         { key: "sub_division", label: "Sub-Division" },
//         ...MONTHS.map((month) => ({ key: month, label: month, align: "right", render: (r) => formatMoMValue(r[month]) })),
//         { key: "latest", label: "Latest", align: "right", render: (r) => formatMoMValue(r.latest) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//   }[section];

//   const config = sectionConfig || { title: "Payables View All", subtitle: "Complete payable details.", rows: [], columns: [] };

//   const initial = {
//     legal_group: [],
//     legal_entities: [],
//     parent_divisions: [],
//     sub_divisions: [],
//     reporting_currency: filters.reporting_currency || currency || "AED",
//     as_on_date: filters.as_on_date || "",
//     aging_basis: filters.aging_basis || "Due Date Based",
//   };
//   const [viewFilters, setViewFilters] = React.useState(initial);
//   const [applied, setApplied] = React.useState(initial);
//   const [sectionRows, setSectionRows] = React.useState(config.rows || []);
//   const [sectionLoading, setSectionLoading] = React.useState(false);
//   const [sectionError, setSectionError] = React.useState("");
//   const [openFilter, setOpenFilter] = React.useState(null);
//   const [filterSearch, setFilterSearch] = React.useState({});
//   const [search, setSearch] = React.useState("");
//   const [page, setPage] = React.useState(1);
//   const pageSize = 10;

//   const labels = (arr) => getOptionLabels(arr || []);
//   const options = {
//     legal_group: labels(filterOptions.legal_groups),
//     legal_entities: labels(filterOptions.legal_entities),
//     parent_divisions: labels(filterOptions.parent_divisions),
//     sub_divisions: labels(filterOptions.sub_divisions || filterOptions.subdivision || filterOptions.subdivisions),
//     reporting_currency: labels(filterOptions.reporting_currencies),
//     as_on_date: labels(filterOptions.as_on_dates),
//     aging_basis: labels(filterOptions.aging_basis).map(displayAgingBasis),
//   };

//   const getSelected = (key) => {
//     const value = viewFilters[key];
//     return Array.isArray(value) ? value : [value].filter(Boolean);
//   };

//   const toggle = (key, value) => {
//     setViewFilters((prev) => {
//       const current = Array.isArray(prev[key])
//         ? prev[key].filter((x) => String(x).trim().toLowerCase() !== "all")
//         : [];
//       const next = current.includes(value)
//         ? current.filter((x) => x !== value)
//         : [...current, value];
//       return { ...prev, [key]: next };
//     });
//   };

//   const setSingle = (key, value) => {
//     setViewFilters((prev) => ({ ...prev, [key]: value || "" }));
//     setOpenFilter(null);
//   };

//   const clearFilter = (key) => {
//     const isMulti = [
//       "legal_group",
//       "legal_entities",
//       "parent_divisions",
//       "sub_divisions",
//     ].includes(key);
//     setViewFilters((prev) => ({
//       ...prev,
//       [key]: isMulti ? [] : "",
//     }));
//     setFilterSearch((prev) => ({ ...prev, [key]: "" }));
//   };

//   const selectAllFilter = (key) => {
//     const allOptions = (options[key] || []).filter(
//       (option) => String(option).trim().toLowerCase() !== "all"
//     );
//     setViewFilters((prev) => ({
//       ...prev,
//       [key]: [...allOptions],
//     }));
//   };

//   /*
//    * View All filters must be applied to the backend data source.
//    * The section summary arrays (especially Aging Summary) do not contain
//    * legal-group/entity/division fields, so filtering those local arrays
//    * cannot work. Reload the relevant existing API with the selected filters.
//    */
//   React.useEffect(() => {
//     let active = true;

//     const loadFilteredSection = async () => {
//       setSectionLoading(true);
//       setSectionError("");

//       try {
//         const apiFilters = buildPayablesApiFilters(
//           { ...filters, ...applied },
//           filterOptions
//         );

//         let result;
//         if (section === "sub_division") {
//           result = await getPayablesBySubdivision(apiFilters);
//           const rows = normalizeSubdivisionResponse(result);
//           if (active) setSectionRows(Array.isArray(rows) ? rows : []);
//         } else if (section === "month_on_month") {
//           result = await getPayablesMonthOnMonth({
//             ...apiFilters,
//             year: applied?.year || filters?.year,
//           });
//           const rows = normalizeMonthOnMonthResponse(result);
//           if (active) setSectionRows(Array.isArray(rows) ? rows : []);
//         } else {
//           result = await getPayablesDashboard(apiFilters);
//           const dashboard = normalizeDashboardResponse(result);
//           const sectionKey = {
//             aging: "agingSummary",
//             trend: "trend",
//             parent_division: "parentDivision",
//             top_suppliers: "topSuppliers",
//             overdue: "overdueSummary",
//           }[section];
//           const rows = sectionKey ? dashboard?.[sectionKey] : config.rows;
//           if (active) setSectionRows(Array.isArray(rows) ? rows : []);
//         }
//       } catch (error) {
//         console.error(`Payables ${section} View All filter failed`, error);
//         if (active) {
//           setSectionRows([]);
//           setSectionError(
//             error?.response?.data?.detail ||
//             error?.message ||
//             "Failed to load filtered data."
//           );
//         }
//       } finally {
//         if (active) setSectionLoading(false);
//       }
//     };

//     loadFilteredSection();
//     return () => {
//       active = false;
//     };
//   }, [section, applied, filters, filterOptions]);

//   const filteredRows = (sectionRows || []).filter((row) => {
//     if (search.trim()) {
//       const q = search.trim().toLowerCase();
//       if (!Object.values(row || {}).some((v) => String(v ?? "").toLowerCase().includes(q))) return false;
//     }
//     return true;
//   });

//   const totalRows = filteredRows.length;
//   const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
//   const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
//   React.useEffect(() => { setPage(1); }, [section, applied, search]);

//   const amountForRow = (row) => {
//     const candidates = [row.amount, row.total_payables, row.total_payable, row.payable_amount, row.latest];
//     return candidates.find((v) => v !== undefined && v !== null && Number.isFinite(Number(v))) ?? 0;
//   };
//   const kpiRows = filteredRows;
//   const total = kpiRows.reduce((s, r) => s + Number(r.total_payables ?? r.total_payable ?? r.payable_amount ?? r.amount ?? r.latest ?? 0), 0);
//   const current = kpiRows.reduce((s, r) => s + Number(r.current ?? r.current_payables ?? 0), 0);
//   const overdue = kpiRows.reduce((s, r) => s + Number(r.overdue_payables ?? r.overdue ?? r.overdue_amount ?? 0), 0);
//   const overdue90 = kpiRows.reduce((s, r) => s + Number(r["91_120"] ?? 0) + Number(r["121_180"] ?? 0) + Number(r["181_365"] ?? 0) + Number(r.above_365 ?? 0), 0);
//   const kpis = [
//     ["Total Payables", total, "#eef2ff", "#4f46e5", "₹"],
//     ["Current Payables", current, "#ecfdf5", "#059669", "✓"],
//     ["Overdue Payables", overdue, "#fff7ed", "#ea580c", "!"],
//     ["Overdue > 90 Days", overdue90, "#fef2f2", "#dc2626", "90+"],
//   ];

//   const exportSection = async (format) => {
//     try {
//       const apiFilters = buildPayablesApiFilters({ ...filters, ...applied }, filterOptions);
//       const response = format === "excel" ? await exportPayablesExcel(apiFilters) : await exportPayablesPdf(apiFilters);
//       const blob = response?.data instanceof Blob ? response.data : response instanceof Blob ? response : null;
//       if (!blob) throw new Error("Export response did not contain a downloadable file.");
//       const disposition = response?.headers?.["content-disposition"] || response?.headers?.["Content-Disposition"] || "";
//       const match = disposition.match(/filename\\*?=(?:UTF-8''|")?([^";\\n]+)"?/i);
//       const fallback = `${String(section || "payables").replace(/[^a-z0-9]+/gi, "_")}_View_All.${format === "excel" ? "xlsx" : "pdf"}`;
//       const filename = match?.[1] ? decodeURIComponent(match[1]) : fallback;
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
//     } catch (e) {
//       console.error(`Payables ${section} View All export failed`, e);
//     }
//   };

//   const MultiFilter = ({ label, filterKey, optionList }) => {
//     const cleanOptions = (optionList || []).filter(
//       (option) => String(option).trim().toLowerCase() !== "all"
//     );
//     const selected = getSelected(filterKey).filter(
//       (value) => String(value).trim().toLowerCase() !== "all"
//     );
//     const query = String(filterSearch[filterKey] || "").trim().toLowerCase();
//     const filteredOptions = cleanOptions.filter((option) =>
//       String(option).toLowerCase().includes(query)
//     );
//     const allSelected = cleanOptions.length > 0 && selected.length === cleanOptions.length;
//     const display = selected.length === 0 || allSelected
//       ? "All"
//       : selected.length === 1
//         ? selected[0]
//         : `${selected.length} selected`;

//     return (
//       <div style={{ position: "relative", minWidth: 0 }}>
//         <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5, whiteSpace: "nowrap" }}>{label}</div>
//         <button type="button" onClick={() => setOpenFilter((v) => v === filterKey ? null : filterKey)} style={{ width: "100%", height: 34, border: "1px solid #d5ddeb", borderRadius: 6, background: "#f4f7fc", color: "#29427f", fontSize: 11, fontWeight: 600, padding: "0 9px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}>
//           <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{display}</span>
//           <span style={{ fontSize: 10, marginLeft: 6 }}>▾</span>
//         </button>
//         {openFilter === filterKey && (
//           <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, width: 220, background: "#fff", border: "1px solid #d7dfeb", borderRadius: 7, boxShadow: "0 8px 22px rgba(15,23,42,.14)", zIndex: 10050, overflow: "hidden" }}>
//             <div style={{ padding: 7, borderBottom: "1px solid #edf1f6" }}>
//               <div style={{ position: "relative" }}>
//                 <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
//                 <input value={filterSearch[filterKey] || ""} onChange={(e) => setFilterSearch((p) => ({ ...p, [filterKey]: e.target.value }))} onClick={(e) => e.stopPropagation()} autoFocus placeholder={`Search ${label}`} style={{ width: "100%", height: 30, border: "1px solid #d9e1ee", borderRadius: 5, padding: "0 8px 0 27px", outline: "none", fontSize: 10, boxSizing: "border-box" }} />
//               </div>
//             </div>
//             <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 9px", borderBottom: "1px solid #edf1f6" }}>
//               <button type="button" onClick={() => { if (allSelected) clearFilter(filterKey); else selectAllFilter(filterKey); }} style={{ border: 0, background: "transparent", padding: 0, color: "#4d46e5", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{allSelected ? "Deselect All" : "Select All"}</button>
//               <button type="button" onClick={() => clearFilter(filterKey)} style={{ border: 0, background: "transparent", padding: 0, color: "#64748b", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Clear</button>
//             </div>
//             <div style={{ maxHeight: 235, overflowY: "auto", padding: "3px 0" }}>
//               {filteredOptions.map((option) => {
//                 const checked = selected.includes(option);
//                 return (
//                   <label key={String(option)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", cursor: "pointer", fontSize: 10, color: "#334155", background: checked ? "#f5f7ff" : "#fff" }}>
//                     <input type="checkbox" checked={checked} onChange={() => toggle(filterKey, option)} style={{ width: 13, height: 13, margin: 0, accentColor: "#4936e9", cursor: "pointer" }} />
//                     <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{option}</span>
//                   </label>
//                 );
//               })}
//               {!filteredOptions.length && <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 10 }}>No results found</div>}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const SingleFilter = ({ label, filterKey, optionList }) => {
//     const current = String(viewFilters[filterKey] || "");
//     const query = String(filterSearch[filterKey] || "").trim().toLowerCase();
//     const filteredOptions = optionList.filter((option) => String(option).toLowerCase().includes(query));
//     const display = current || "All";
//     return (
//       <div style={{ position: "relative", minWidth: 0 }}>
//         <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5, whiteSpace: "nowrap" }}>{label}</div>
//         <button type="button" onClick={() => setOpenFilter((v) => v === filterKey ? null : filterKey)} style={{ width: "100%", height: 34, border: "1px solid #d5ddeb", borderRadius: 6, background: "#f4f7fc", color: "#29427f", fontSize: 11, fontWeight: 600, padding: "0 9px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}>
//           <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{display}</span><span style={{ fontSize: 10 }}>▾</span>
//         </button>
//         {openFilter === filterKey && (
//           <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, width: 210, background: "#fff", border: "1px solid #d7dfeb", borderRadius: 7, boxShadow: "0 8px 22px rgba(15,23,42,.14)", zIndex: 10050, overflow: "hidden" }}>
//             <div style={{ padding: 7, borderBottom: "1px solid #edf1f6" }}><input value={filterSearch[filterKey] || ""} onChange={(e) => setFilterSearch((p) => ({ ...p, [filterKey]: e.target.value }))} autoFocus placeholder={`Search ${label}`} style={{ width: "100%", height: 30, border: "1px solid #d9e1ee", borderRadius: 5, padding: "0 8px", outline: "none", fontSize: 10, boxSizing: "border-box" }} /></div>
//             <div style={{ maxHeight: 220, overflowY: "auto" }}>
//               <button type="button" onClick={() => setSingle(filterKey, "")} style={{ display: "block", width: "100%", border: 0, background: !current ? "#f5f7ff" : "#fff", padding: "7px 9px", textAlign: "left", fontSize: 10, cursor: "pointer" }}>All</button>
//               {filteredOptions.map((option) => <button key={String(option)} type="button" onClick={() => setSingle(filterKey, option)} style={{ display: "block", width: "100%", border: 0, background: current === option ? "#f5f7ff" : "#fff", padding: "7px 9px", textAlign: "left", fontSize: 10, cursor: "pointer" }}>{option}</button>)}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.48)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
//       <div style={{ width: "min(1450px,100%)", maxHeight: "92vh", background: "#f7faff", borderRadius: 10, overflow: "hidden", boxShadow: "0 18px 55px rgba(15,23,42,0.28)", display: "flex", flexDirection: "column" }}>
//         <div style={{ overflowY: "auto", padding: "18px 18px 28px" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 15, marginBottom: 14 }}>
//             <div>
//               <div style={{ fontSize: 27, lineHeight: 1.1, fontWeight: 800, color: "#102a72" }}>{config.title}</div>
//               <div style={{ marginTop: 5, fontSize: 12, color: "#64748b" }}>{config.subtitle}</div>
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//               <button type="button" onClick={() => exportSection("excel")} style={{ height: 34, padding: "0 13px", border: "1px solid #86efac", borderRadius: 8, background: "#f7fffa", color: "#16a34a", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>📊 Excel</button>
//               <button type="button" onClick={() => exportSection("pdf")} style={{ height: 34, padding: "0 13px", border: "1px solid #fda4af", borderRadius: 8, background: "#fff8f8", color: "#ef4444", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>📄 PDF</button>
//               <button type="button" onClick={onClose} style={{ height: 34, padding: "0 13px", border: "1px solid #cbd5e1", borderRadius: 5, background: "#fff", color: "#3149a5", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✖</button>
//             </div>
//           </div>

//           <div style={{ background: "#fff", border: "1px solid #e3e9f2", borderRadius: 9, padding: "13px 14px 15px", marginBottom: 14 }}>
//             <div style={{ fontSize: 16, fontWeight: 800, color: "#173b8f", marginBottom: 11 }}>Filters</div>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(110px,1fr)) auto auto", gap: 10, alignItems: "end" }}>
//               <MultiFilter label="Legal Group" filterKey="legal_group" optionList={options.legal_group} />
//               <MultiFilter label="Legal Entity" filterKey="legal_entities" optionList={options.legal_entities} />
//               <MultiFilter label="Parent Division" filterKey="parent_divisions" optionList={options.parent_divisions} />
//               <MultiFilter label="Sub-Division" filterKey="sub_divisions" optionList={options.sub_divisions} />
//               <SingleFilter label="Reporting Currency" filterKey="reporting_currency" optionList={options.reporting_currency} />
//               <SingleFilter label="As On Date" filterKey="as_on_date" optionList={options.as_on_date} />
//               <SingleFilter label="Aging Basis" filterKey="aging_basis" optionList={options.aging_basis} />
//               <button type="button" onClick={() => { setApplied({ ...viewFilters }); setOpenFilter(null); }} style={{ height: 34, padding: "0 20px", border: 0, borderRadius: 5, background: "#4936e9", color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Apply</button>
//               <button type="button" onClick={() => { setViewFilters(initial); setApplied(initial); setFilterSearch({}); setOpenFilter(null); }} style={{ height: 34, padding: "0 18px", border: "1px solid #d4dbe7", borderRadius: 5, background: "#fff", color: "#334155", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Reset</button>
//             </div>
//           </div>

//           <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9, marginBottom: 14 }}>
//             {kpis.map(([title, value, bg, color, icon]) => (
//               <div key={title} style={{ background: "#fff", border: "1px solid #e5eaf2", borderRadius: 8, minHeight: 78, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
//                 <div style={{ width: 42, height: 42, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: icon === "90+" ? 11 : 18, fontWeight: 800 }}>{icon}</div>
//                 <div><div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 3 }}>{title}</div><div style={{ fontSize: 18, fontWeight: 800, color: Number(value) < 0 ? "#dc2626" : "#142b6f" }}>{formatPayablesCompact(value, currency)}</div></div>
//               </div>
//             ))}
//           </div>

//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
//             <div style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>{totalRows.toLocaleString()} records</div>
//             <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." style={{ width: 220, height: 32, border: "1px solid #d5ddeb", borderRadius: 6, padding: "0 9px", fontSize: 10 }} />
//           </div>

//           <div style={{ background: "#fff", border: "1px solid #e3e9f2", borderRadius: 9, overflow: "hidden" }}>
//             <DataTable columns={config.columns} rows={pageRows} pagination={false} fitColumns negativeValuesRed={true} monthColumnGap={section === "month_on_month"} removeDecimals={section !== "month_on_month"} currencyToggle={section === "month_on_month"} />
//             {pageRows.length === 0 && <div style={{ textAlign: "center", padding: 35, color: "#64748b", fontSize: 12 }}>No data available for this section.</div>}
//           </div>
//           <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 10 }}>
//             <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ height: 30, padding: "0 12px", border: "1px solid #d5ddeb", borderRadius: 5, background: "#fff" }}>‹</button>
//             <span style={{ fontSize: 10, color: "#64748b" }}>Page {page} of {pageCount}</span>
//             <button disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} style={{ height: 30, padding: "0 12px", border: "1px solid #d5ddeb", borderRadius: 5, background: "#fff" }}>›</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ============================================================
//    VIEW ALL
//    ============================================================ */


// function PayablesSectionViewAll({
//   section,
//   dashboardData = {},
//   currency,
//   filters = {},
//   filterOptions = {},
//   onClose,
// }) {
//   const sectionConfig = {
//     aging: {
//       title: "Payables Aging Summary View All",
//       subtitle: "Detailed aging bucket balances for the selected snapshot.",
//       rows: dashboardData.agingSummary || [],
//       columns: [
//         { key: "bucket_name", label: "Aging Bucket" },
//         { key: "amount", label: `Amount (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
//         { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     trend: {
//       title: "Payables Trend View All",
//       subtitle: "Monthly payables trend and DPO details.",
//       rows: dashboardData.trend || [],
//       columns: [
//         { key: "month", label: "Month" },
//         { key: "total_payables", label: `Total Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.total_payables, currency) },
//         { key: "dpo", label: "DPO (Days)", align: "right", render: (r) => `${Number(r.dpo || 0).toFixed(1)} Days` },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     parent_division: {
//       title: "Payables by Parent Division View All",
//       subtitle: "Complete parent-division payable balances.",
//       rows: dashboardData.parentDivision || [],
//       columns: [
//         { key: "name", label: "Parent Division" },
//         { key: "amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
//         { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     top_suppliers: {
//       title: "Top Suppliers by Payables View All",
//       subtitle: "Supplier-level payable balances from the dashboard data.",
//       rows: dashboardData.topSuppliers || [],
//       columns: [
//         { key: "rank", label: "#", align: "left" },
//         { key: "supplier_name", label: "Supplier Name" },
//         { key: "payable_amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.payable_amount, currency) },
//         { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     overdue: {
//       title: "Overdue Summary View All",
//       subtitle: "Detailed overdue aging buckets and balances.",
//       rows: dashboardData.overdueSummary || [],
//       columns: [
//         { key: "bucket", label: "Overdue Bucket" },
//         { key: "amount", label: `Amount (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount ?? r.total_payables ?? r.payable_amount, currency) },
//         { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     sub_division: {
//       title: "Payables by Sub-Division View All",
//       subtitle: "Complete sub-division payable balances.",
//       rows: dashboardData.subDivision || [],
//       columns: [
//         { key: "name", label: "Sub-Division" },
//         { key: "amount", label: `Payables (${currency})`, align: "right", render: (r) => formatPayablesCompact(r.amount, currency) },
//         { key: "percentage", label: "% of Total", align: "right", render: (r) => formatPercentage(r.percentage) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//     month_on_month: {
//       title: "Month-on-Month Payables View All",
//       subtitle: "Detailed month-on-month payable balances by legal entity.",
//       rows: dashboardData.monthOnMonth || [],
//       columns: [
//         { key: "legal_entity", label: "Legal Entity" },
//         { key: "parent_division", label: "Parent Division" },
//         { key: "sub_division", label: "Sub-Division" },
//         ...MONTHS.map((month) => ({ key: month, label: month, align: "right", render: (r) => formatMoMValue(r[month]) })),
//         { key: "latest", label: "Latest", align: "right", render: (r) => formatMoMValue(r.latest) },
//       ],
//       kpis: ["Total Payables", "Current Payables", "Overdue Payables", "Overdue > 90 Days"],
//     },
//   }[section];

//   const config = sectionConfig || { title: "Payables View All", subtitle: "Complete payable details.", rows: [], columns: [] };

//   const initial = {
//     legal_group: [],
//     legal_entities: [],
//     parent_divisions: [],
//     sub_divisions: [],
//     reporting_currency: filters.reporting_currency || currency || "AED",
//     as_on_date: filters.as_on_date || "",
//     aging_basis: filters.aging_basis || "Due Date Based",
//   };
//   const [viewFilters, setViewFilters] = React.useState(initial);
//   const [applied, setApplied] = React.useState(initial);
//   const [sectionRows, setSectionRows] = React.useState(config.rows || []);
//   const [sectionLoading, setSectionLoading] = React.useState(false);
//   const [sectionError, setSectionError] = React.useState("");
//   const [openFilter, setOpenFilter] = React.useState(null);
//   const [filterSearch, setFilterSearch] = React.useState({});
//   const [search, setSearch] = React.useState("");
//   const [page, setPage] = React.useState(1);
//   const pageSize = 10;

//   const labels = (arr) => getOptionLabels(arr || []);
//   const options = {
//     legal_group: labels(filterOptions.legal_groups),
//     legal_entities: labels(filterOptions.legal_entities),
//     parent_divisions: labels(filterOptions.parent_divisions),
//     sub_divisions: labels(filterOptions.sub_divisions || filterOptions.subdivision || filterOptions.subdivisions),
//     reporting_currency: labels(filterOptions.reporting_currencies),
//     as_on_date: labels(filterOptions.as_on_dates),
//     aging_basis: labels(filterOptions.aging_basis).map(displayAgingBasis),
//   };

//   const getSelected = (key) => {
//     const value = viewFilters[key];
//     return Array.isArray(value) ? value : [value].filter(Boolean);
//   };

//   const toggle = (key, value) => {
//     setViewFilters((prev) => {
//       const current = Array.isArray(prev[key])
//         ? prev[key].filter((x) => String(x).trim().toLowerCase() !== "all")
//         : [];
//       const next = current.includes(value)
//         ? current.filter((x) => x !== value)
//         : [...current, value];
//       return { ...prev, [key]: next };
//     });
//   };

//   const setSingle = (key, value) => {
//     setViewFilters((prev) => ({ ...prev, [key]: value || "" }));
//     setOpenFilter(null);
//   };

//   const clearFilter = (key) => {
//     const isMulti = [
//       "legal_group",
//       "legal_entities",
//       "parent_divisions",
//       "sub_divisions",
//     ].includes(key);
//     setViewFilters((prev) => ({
//       ...prev,
//       [key]: isMulti ? [] : "",
//     }));
//     setFilterSearch((prev) => ({ ...prev, [key]: "" }));
//   };

//   const selectAllFilter = (key) => {
//     const allOptions = (options[key] || []).filter(
//       (option) => String(option).trim().toLowerCase() !== "all"
//     );
//     setViewFilters((prev) => ({
//       ...prev,
//       [key]: [...allOptions],
//     }));
//   };

//   /*
//    * View All filters must be applied to the backend data source.
//    * The section summary arrays (especially Aging Summary) do not contain
//    * legal-group/entity/division fields, so filtering those local arrays
//    * cannot work. Reload the relevant existing API with the selected filters.
//    */
//   React.useEffect(() => {
//     let active = true;

//     const loadFilteredSection = async () => {
//       setSectionLoading(true);
//       setSectionError("");

//       try {
//         const apiFilters = buildPayablesApiFilters(
//           { ...filters, ...applied },
//           filterOptions
//         );

//         let result;
//         if (section === "sub_division") {
//           result = await getPayablesBySubdivision(apiFilters);
//           const rows = normalizeSubdivisionResponse(result);
//           if (active) setSectionRows(Array.isArray(rows) ? rows : []);
//         } else if (section === "month_on_month") {
//           result = await getPayablesMonthOnMonth({
//             ...apiFilters,
//             year: applied?.year || filters?.year,
//           });
//           const rows = normalizeMonthOnMonthResponse(result);
//           if (active) setSectionRows(Array.isArray(rows) ? rows : []);
//         } else {
//           result = await getPayablesDashboard(apiFilters);
//           const dashboard = normalizeDashboardResponse(result);
//           const sectionKey = {
//             aging: "agingSummary",
//             trend: "trend",
//             parent_division: "parentDivision",
//             top_suppliers: "topSuppliers",
//             overdue: "overdueSummary",
//           }[section];
//           const rows = sectionKey ? dashboard?.[sectionKey] : config.rows;
//           if (active) setSectionRows(Array.isArray(rows) ? rows : []);
//         }
//       } catch (error) {
//         console.error(`Payables ${section} View All filter failed`, error);
//         if (active) {
//           setSectionRows([]);
//           setSectionError(
//             error?.response?.data?.detail ||
//             error?.message ||
//             "Failed to load filtered data."
//           );
//         }
//       } finally {
//         if (active) setSectionLoading(false);
//       }
//     };

//     loadFilteredSection();
//     return () => {
//       active = false;
//     };
//   }, [section, applied, filters, filterOptions]);

//   const filteredRows = (sectionRows || []).filter((row) => {
//     if (search.trim()) {
//       const q = search.trim().toLowerCase();
//       if (!Object.values(row || {}).some((v) => String(v ?? "").toLowerCase().includes(q))) return false;
//     }
//     return true;
//   });

//   const totalRows = filteredRows.length;
//   const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
//   const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
//   React.useEffect(() => { setPage(1); }, [section, applied, search]);

//   const amountForRow = (row) => {
//     const candidates = [row.amount, row.total_payables, row.total_payable, row.payable_amount, row.latest];
//     return candidates.find((v) => v !== undefined && v !== null && Number.isFinite(Number(v))) ?? 0;
//   };
//   const kpiRows = filteredRows;
//   const total = kpiRows.reduce((s, r) => s + Number(r.total_payables ?? r.total_payable ?? r.payable_amount ?? r.amount ?? r.latest ?? 0), 0);
//   const current = kpiRows.reduce((s, r) => s + Number(r.current ?? r.current_payables ?? 0), 0);
//   const overdue = kpiRows.reduce((s, r) => s + Number(r.overdue_payables ?? r.overdue ?? r.overdue_amount ?? 0), 0);
//   const overdue90 = kpiRows.reduce((s, r) => s + Number(r["91_120"] ?? 0) + Number(r["121_180"] ?? 0) + Number(r["181_365"] ?? 0) + Number(r.above_365 ?? 0), 0);
//   const kpis = [
//     ["Total Payables", total, "#eef2ff", "#4f46e5", "₹"],
//     ["Current Payables", current, "#ecfdf5", "#059669", "✓"],
//     ["Overdue Payables", overdue, "#fff7ed", "#ea580c", "!"],
//     ["Overdue > 90 Days", overdue90, "#fef2f2", "#dc2626", "90+"],
//   ];

//   const exportSection = async (format) => {
//     try {
//       const apiFilters = buildPayablesApiFilters({ ...filters, ...applied }, filterOptions);
//       const response = format === "excel" ? await exportPayablesExcel(apiFilters) : await exportPayablesPdf(apiFilters);
//       const blob = response?.data instanceof Blob ? response.data : response instanceof Blob ? response : null;
//       if (!blob) throw new Error("Export response did not contain a downloadable file.");
//       const disposition = response?.headers?.["content-disposition"] || response?.headers?.["Content-Disposition"] || "";
//       const match = disposition.match(/filename\\*?=(?:UTF-8''|")?([^";\\n]+)"?/i);
//       const fallback = `${String(section || "payables").replace(/[^a-z0-9]+/gi, "_")}_View_All.${format === "excel" ? "xlsx" : "pdf"}`;
//       const filename = match?.[1] ? decodeURIComponent(match[1]) : fallback;
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
//     } catch (e) {
//       console.error(`Payables ${section} View All export failed`, e);
//     }
//   };

//   const MultiFilter = ({ label, filterKey, optionList }) => {
//     const cleanOptions = (optionList || []).filter(
//       (option) => String(option).trim().toLowerCase() !== "all"
//     );
//     const selected = getSelected(filterKey).filter(
//       (value) => String(value).trim().toLowerCase() !== "all"
//     );
//     const query = String(filterSearch[filterKey] || "").trim().toLowerCase();
//     const filteredOptions = cleanOptions.filter((option) =>
//       String(option).toLowerCase().includes(query)
//     );
//     const allSelected = cleanOptions.length > 0 && selected.length === cleanOptions.length;
//     const display = selected.length === 0 || allSelected
//       ? "All"
//       : selected.length === 1
//         ? selected[0]
//         : `${selected.length} selected`;

//     return (
//       <div style={{ position: "relative", minWidth: 0 }}>
//         <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5, whiteSpace: "nowrap" }}>{label}</div>
//         <button type="button" onClick={() => setOpenFilter((v) => v === filterKey ? null : filterKey)} style={{ width: "100%", height: 34, border: "1px solid #d5ddeb", borderRadius: 6, background: "#f4f7fc", color: "#29427f", fontSize: 11, fontWeight: 600, padding: "0 9px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}>
//           <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{display}</span>
//           <span style={{ fontSize: 10, marginLeft: 6 }}>▾</span>
//         </button>
//         {openFilter === filterKey && (
//           <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, width: 220, background: "#fff", border: "1px solid #d7dfeb", borderRadius: 7, boxShadow: "0 8px 22px rgba(15,23,42,.14)", zIndex: 10050, overflow: "hidden" }}>
//             <div style={{ padding: 7, borderBottom: "1px solid #edf1f6" }}>
//               <div style={{ position: "relative" }}>
//                 <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#94a3b8", pointerEvents: "none" }}>🔍</span>
//                 <input value={filterSearch[filterKey] || ""} onChange={(e) => setFilterSearch((p) => ({ ...p, [filterKey]: e.target.value }))} onClick={(e) => e.stopPropagation()} autoFocus placeholder={`Search ${label}`} style={{ width: "100%", height: 30, border: "1px solid #d9e1ee", borderRadius: 5, padding: "0 8px 0 27px", outline: "none", fontSize: 10, boxSizing: "border-box" }} />
//               </div>
//             </div>
//             <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 9px", borderBottom: "1px solid #edf1f6" }}>
//               <button type="button" onClick={() => { if (allSelected) clearFilter(filterKey); else selectAllFilter(filterKey); }} style={{ border: 0, background: "transparent", padding: 0, color: "#4d46e5", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{allSelected ? "Deselect All" : "Select All"}</button>
//               <button type="button" onClick={() => clearFilter(filterKey)} style={{ border: 0, background: "transparent", padding: 0, color: "#64748b", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Clear</button>
//             </div>
//             <div style={{ maxHeight: 235, overflowY: "auto", padding: "3px 0" }}>
//               {filteredOptions.map((option) => {
//                 const checked = selected.includes(option);
//                 return (
//                   <label key={String(option)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", cursor: "pointer", fontSize: 10, color: "#334155", background: checked ? "#f5f7ff" : "#fff" }}>
//                     <input type="checkbox" checked={checked} onChange={() => toggle(filterKey, option)} style={{ width: 13, height: 13, margin: 0, accentColor: "#4936e9", cursor: "pointer" }} />
//                     <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{option}</span>
//                   </label>
//                 );
//               })}
//               {!filteredOptions.length && <div style={{ padding: 16, textAlign: "center", color: "#94a3b8", fontSize: 10 }}>No results found</div>}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const SingleFilter = ({ label, filterKey, optionList }) => {
//     const current = String(viewFilters[filterKey] || "");
//     const query = String(filterSearch[filterKey] || "").trim().toLowerCase();
//     const filteredOptions = optionList.filter((option) => String(option).toLowerCase().includes(query));
//     const display = current || "All";
//     return (
//       <div style={{ position: "relative", minWidth: 0 }}>
//         <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 5, whiteSpace: "nowrap" }}>{label}</div>
//         <button type="button" onClick={() => setOpenFilter((v) => v === filterKey ? null : filterKey)} style={{ width: "100%", height: 34, border: "1px solid #d5ddeb", borderRadius: 6, background: "#f4f7fc", color: "#29427f", fontSize: 11, fontWeight: 600, padding: "0 9px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", boxSizing: "border-box" }}>
//           <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{display}</span><span style={{ fontSize: 10 }}>▾</span>
//         </button>
//         {openFilter === filterKey && (
//           <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, width: 210, background: "#fff", border: "1px solid #d7dfeb", borderRadius: 7, boxShadow: "0 8px 22px rgba(15,23,42,.14)", zIndex: 10050, overflow: "hidden" }}>
//             <div style={{ padding: 7, borderBottom: "1px solid #edf1f6" }}><input value={filterSearch[filterKey] || ""} onChange={(e) => setFilterSearch((p) => ({ ...p, [filterKey]: e.target.value }))} autoFocus placeholder={`Search ${label}`} style={{ width: "100%", height: 30, border: "1px solid #d9e1ee", borderRadius: 5, padding: "0 8px", outline: "none", fontSize: 10, boxSizing: "border-box" }} /></div>
//             <div style={{ maxHeight: 220, overflowY: "auto" }}>
//               <button type="button" onClick={() => setSingle(filterKey, "")} style={{ display: "block", width: "100%", border: 0, background: !current ? "#f5f7ff" : "#fff", padding: "7px 9px", textAlign: "left", fontSize: 10, cursor: "pointer" }}>All</button>
//               {filteredOptions.map((option) => <button key={String(option)} type="button" onClick={() => setSingle(filterKey, option)} style={{ display: "block", width: "100%", border: 0, background: current === option ? "#f5f7ff" : "#fff", padding: "7px 9px", textAlign: "left", fontSize: 10, cursor: "pointer" }}>{option}</button>)}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.48)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
//       <div style={{ width: "min(1450px,100%)", maxHeight: "92vh", background: "#f7faff", borderRadius: 10, overflow: "hidden", boxShadow: "0 18px 55px rgba(15,23,42,0.28)", display: "flex", flexDirection: "column" }}>
//         <div style={{ overflowY: "auto", padding: "18px 18px 28px" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 15, marginBottom: 14 }}>
//             <div>
//               <div style={{ fontSize: 27, lineHeight: 1.1, fontWeight: 800, color: "#102a72" }}>{config.title}</div>
//               <div style={{ marginTop: 5, fontSize: 12, color: "#64748b" }}>{config.subtitle}</div>
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//               <button type="button" onClick={() => exportSection("excel")} style={{ height: 34, padding: "0 13px", border: "1px solid #86efac", borderRadius: 8, background: "#f7fffa", color: "#16a34a", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>📊 Excel</button>
//               <button type="button" onClick={() => exportSection("pdf")} style={{ height: 34, padding: "0 13px", border: "1px solid #fda4af", borderRadius: 8, background: "#fff8f8", color: "#ef4444", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>📄 PDF</button>
//               <button type="button" onClick={onClose} style={{ height: 34, padding: "0 13px", border: "1px solid #cbd5e1", borderRadius: 5, background: "#fff", color: "#3149a5", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✖</button>
//             </div>
//           </div>

//           <div style={{ background: "#fff", border: "1px solid #e3e9f2", borderRadius: 9, padding: "13px 14px 15px", marginBottom: 14 }}>
//             <div style={{ fontSize: 16, fontWeight: 800, color: "#173b8f", marginBottom: 11 }}>Filters</div>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(110px,1fr)) auto auto", gap: 10, alignItems: "end" }}>
//               <MultiFilter label="Legal Group" filterKey="legal_group" optionList={options.legal_group} />
//               <MultiFilter label="Legal Entity" filterKey="legal_entities" optionList={options.legal_entities} />
//               <MultiFilter label="Parent Division" filterKey="parent_divisions" optionList={options.parent_divisions} />
//               <MultiFilter label="Sub-Division" filterKey="sub_divisions" optionList={options.sub_divisions} />
//               <SingleFilter label="Reporting Currency" filterKey="reporting_currency" optionList={options.reporting_currency} />
//               <SingleFilter label="As On Date" filterKey="as_on_date" optionList={options.as_on_date} />
//               <SingleFilter label="Aging Basis" filterKey="aging_basis" optionList={options.aging_basis} />
//               <button type="button" onClick={() => { setApplied({ ...viewFilters }); setOpenFilter(null); }} style={{ height: 34, padding: "0 20px", border: 0, borderRadius: 5, background: "#4936e9", color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Apply</button>
//               <button type="button" onClick={() => { setViewFilters(initial); setApplied(initial); setFilterSearch({}); setOpenFilter(null); }} style={{ height: 34, padding: "0 18px", border: "1px solid #d4dbe7", borderRadius: 5, background: "#fff", color: "#334155", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Reset</button>
//             </div>
//           </div>

//           <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9, marginBottom: 14 }}>
//             {kpis.map(([title, value, bg, color, icon]) => (
//               <div key={title} style={{ background: "#fff", border: "1px solid #e5eaf2", borderRadius: 8, minHeight: 78, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
//                 <div style={{ width: 42, height: 42, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: icon === "90+" ? 11 : 18, fontWeight: 800 }}>{icon}</div>
//                 <div><div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 3 }}>{title}</div><div style={{ fontSize: 18, fontWeight: 800, color: Number(value) < 0 ? "#dc2626" : "#142b6f" }}>{formatPayablesCompact(value, currency)}</div></div>
//               </div>
//             ))}
//           </div>

//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
//             <div style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>{totalRows.toLocaleString()} records</div>
//             <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." style={{ width: 220, height: 32, border: "1px solid #d5ddeb", borderRadius: 6, padding: "0 9px", fontSize: 10 }} />
//           </div>

//           <div style={{ background: "#fff", border: "1px solid #e3e9f2", borderRadius: 9, overflow: "hidden" }}>
//             <DataTable columns={config.columns} rows={pageRows} pagination={false} fitColumns negativeValuesRed={true} monthColumnGap={section === "month_on_month"} removeDecimals={section !== "month_on_month"} currencyToggle={section === "month_on_month"} />
//             {pageRows.length === 0 && <div style={{ textAlign: "center", padding: 35, color: "#64748b", fontSize: 12 }}>No data available for this section.</div>}
//           </div>
//           <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 10 }}>
//             <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ height: 30, padding: "0 12px", border: "1px solid #d5ddeb", borderRadius: 5, background: "#fff" }}>‹</button>
//             <span style={{ fontSize: 10, color: "#64748b" }}>Page {page} of {pageCount}</span>
//             <button disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))} style={{ height: 30, padding: "0 12px", border: "1px solid #d5ddeb", borderRadius: 5, background: "#fff" }}>›</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ============================================================
//    VIEW ALL
//    ============================================================ */


// function PayablesViewAll({
//   filters,
//   section = "all",
//   data,
//   currency,
//   filterOptions = {},
//   detailFilters = {},
//   onClose,
// }) {
//   const [search, setSearch] = useState("");
//   const [sortKey, setSortKey] = useState("total_payable");
//   const [sortDirection, setSortDirection] = useState("desc");
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   const sectionViewAllTitles = {
//     all: ["Payables View All", "Complete payable records."],
//     aging: ["Payables Aging Summary View All", "Underlying payable records for the selected snapshot."],
//     trend: ["Payables Trend View All", "Underlying payable records for the selected snapshot."],
//     parent_division: ["Payables by Parent Division View All", "Underlying payable records for the selected dashboard scope."],
//     top_suppliers: ["Top Suppliers by Payables View All", "Underlying supplier payable records."],
//     overdue: ["Overdue Summary View All", "Underlying overdue payable records."],
//     sub_division: ["Payables by Sub-Division View All", "Underlying payable records for the selected dashboard scope."],
//     month_on_month: ["Month-on-Month Payables View All", "Underlying payable records for the selected month and hierarchy."],
//   };

//   const [viewAllTitle, viewAllSubtitle] =
//     sectionViewAllTitles[section] || sectionViewAllTitles.all;

//   /* ============================================================
//      VIEW ALL FILTERS
//   ============================================================ */

//   const getInitialViewFilters = () => {
//     const toMultiValue = (value) => {
//       if (Array.isArray(value)) {
//         const values = value.filter(
//           (item) => item !== undefined && item !== null && String(item) !== ""
//         );
//         return values.length ? [...values] : ["All"];
//       }

//       if (value !== undefined && value !== null && String(value) !== "") {
//         return [value];
//       }

//       return ["All"];
//     };

//     return {
//       // Carry the exact main-page selections into View All.
//       // If the main filter is unselected, keep the existing "All" state.
//       legal_group: toMultiValue(filters?.legal_group),
//       legal_entities: toMultiValue(filters?.legal_entities),
//       parent_divisions: toMultiValue(filters?.parent_divisions),
//       sub_divisions: toMultiValue(filters?.sub_divisions),

//       reporting_currency:
//         filters?.reporting_currency ||
//         currency ||
//         "AED",

//       as_on_date:
//         filters?.as_on_date ||
//         filters?.as_on_dates ||
//         filters?.asOfDate ||
//         "",

//       aging_basis:
//         filters?.aging_basis ||
//         filters?.agingBasis ||
//         "Due Date Based",
//     };
//   };

//   const [viewFilters, setViewFilters] = useState(
//     getInitialViewFilters
//   );

//   const [appliedViewFilters, setAppliedViewFilters] =
//     useState(getInitialViewFilters);

//   /* ============================================================
//      DROPDOWN STATE
//   ============================================================ */

//   const [openFilter, setOpenFilter] = useState(null);

//   const [filterSearch, setFilterSearch] = useState({
//     legal_group: "",
//     legal_entities: "",
//     parent_divisions: "",
//     sub_divisions: "",
//     reporting_currency: "",
//     as_on_date: "",
//     aging_basis: "",
//   });

//   const [serverRows, setServerRows] = useState(Array.isArray(data) ? data : []);
//   const [serverTotalRecords, setServerTotalRecords] = useState(0);
//   const [serverSummary, setServerSummary] = useState({});
//   const [viewLoading, setViewLoading] = useState(false);
//   const [viewError, setViewError] = useState("");

//   const safeData = Array.isArray(serverRows) ? serverRows : [];

//   const viewFilterOptions = {
//     legal_group: getOptionLabels(filterOptions.legal_groups || []),
//     legal_entities: getOptionLabels(filterOptions.legal_entities || []),
//     parent_divisions: getOptionLabels(filterOptions.parent_divisions || []),
//     sub_divisions: getOptionLabels(filterOptions.sub_divisions || []),
//     reporting_currencies: getOptionLabels(filterOptions.reporting_currencies || []),
//     as_on_dates: getOptionLabels(filterOptions.as_on_dates || []),
//     aging_basis: getOptionLabels(filterOptions.aging_basis || []).map(displayAgingBasis),
//   };

//   const normalizeViewAllRow = (row = {}) => ({
//     ...row,
//     id: row.id ?? row.supplier_id ?? row.supplier_code,
//     legal_entity: row.legal_entity ?? row.legal_entity_name ?? "",
//     parent_division: row.parent_division ?? row.parent_division_name ?? "",
//     sub_division:
//       row.sub_division ??
//       row.subdivision ??
//       row.subdivision_name ??
//       row.sub_division_name ??
//       "",
//     supplier_code: row.supplier_code ?? row.supplier_id ?? "",
//     supplier_name: row.supplier_name ?? row.supplier ?? row.name ?? "",
//     country: row.country ?? row.supplier_country ?? "",
//     currency:
//       row.currency ??
//       row.source_currency ??
//       row.reporting_currency ??
//       "",
//     row_currency:
//       row.row_currency ??
//       row.source_currency ??
//       row.reporting_currency ??
//       row.currency ??
//       "",
//     total_payable:
//       row.total_payable ??
//       row.total_payables ??
//       row.total_outstanding ??
//       row.outstanding_amount ??
//       0,
//     current:
//       row.current ??
//       row.current_payables ??
//       row.current_amount ??
//       0,
//     "0_30":
//       row["0_30"] ??
//       row["0-30"] ??
//       row.amount_0_30 ??
//       row.bucket_0_30 ??
//       0,
//     "31_60":
//       row["31_60"] ??
//       row["31-60"] ??
//       row.amount_31_60 ??
//       row.bucket_31_60 ??
//       0,
//     "61_90":
//       row["61_90"] ??
//       row["61-90"] ??
//       row.amount_61_90 ??
//       row.bucket_61_90 ??
//       0,
//     "91_120":
//       row["91_120"] ??
//       row["91-120"] ??
//       row.amount_91_120 ??
//       row.bucket_91_120 ??
//       0,
//     "121_180":
//       row["121_180"] ??
//       row["121-180"] ??
//       row.amount_121_180 ??
//       row.bucket_121_180 ??
//       0,
//     "181_365":
//       row["181_365"] ??
//       row["181-365"] ??
//       row.amount_181_365 ??
//       row.bucket_181_365 ??
//       0,
//     above_365:
//       row.above_365 ??
//       row["above_365"] ??
//       row.amount_above_365 ??
//       row.above_365_days ??
//       0,
//   });

//   /*
//    * IMPORTANT: the View All export must use the exact same drill-down
//    * parameters that were used to open this View All.  Do not rebuild these
//    * from the visible table rows or from the dashboard aggregates.
//    *
//    * Supported backend drill-down parameters:
//    *   - aging_bucket
//    *   - as_on_date
//    *   - parent_division_id
//    *   - supplier_id
//    *   - balance_status
//    *   - subdivision_id
//    *   - legal_entity_id
//    *   - parent_division_id + subdivision_id + as_on_date (MoM)
//    */
//   const normalizedDetailFilters = useMemo(() => {
//     const source = detailFilters || {};
//     const normalized = {};

//     if (source.aging_bucket !== undefined && source.aging_bucket !== null && source.aging_bucket !== "") {
//       normalized.aging_bucket = toAgingBucketCode(source.aging_bucket);
//     }

//     if (source.balance_status !== undefined && source.balance_status !== null && source.balance_status !== "") {
//       normalized.balance_status = String(source.balance_status).trim().toUpperCase();
//     }

//     if (source.as_on_date !== undefined && source.as_on_date !== null && source.as_on_date !== "") {
//       normalized.as_on_date = toApiDate(source.as_on_date);
//     }

//     [
//       "supplier_id",
//       "customer_id",
//       "parent_division_id",
//       "subdivision_id",
//       "legal_entity_id",
//     ].forEach((key) => {
//       if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
//         normalized[key] = source[key];
//       }
//     });

//     return normalized;
//   }, [detailFilters]);


//   useEffect(() => {
//     let active = true;

//     const loadViewAll = async () => {
//       setViewLoading(true);
//       setViewError("");

//       try {
//         const apiFilters = buildPayablesApiFilters(
//           {
//             ...filters,
//             ...appliedViewFilters,
//           },
//           filterOptions
//         );

//         const response = await getPayablesViewAll({
//           ...apiFilters,
//           ...normalizedDetailFilters,
//           page,
//           page_size: pageSize,
//           sort_by: sortKey === "total_payable" ? "total_payables" : sortKey,
//           sort_dir: sortDirection,
//           search: search.trim() || undefined,
//         });

//         if (!active) return;

//         /*
//          * Backend response:
//          * {
//          *   data: [ ...rows ],
//          *   meta: {
//          *     total_records,
//          *     page,
//          *     page_size
//          *   }
//          * }
//          *
//          * IMPORTANT:
//          * response.data.data is the row array itself.
//          * meta is NOT inside data.
//          */
//         const responseBody = response?.data ?? response ?? {};
//         const records = Array.isArray(responseBody?.data)
//           ? responseBody.data
//           : (
//             responseBody?.records ??
//             responseBody?.rows ??
//             []
//           );

//         const meta = responseBody?.meta ?? {};
//         const total = Number(
//           meta?.total_records ??
//           meta?.total_count ??
//           responseBody?.total_records ??
//           responseBody?.total_count ??
//           (Array.isArray(records) ? records.length : 0)
//         );

//         const normalizedRows = Array.isArray(records)
//           ? records.map(normalizeViewAllRow)
//           : [];

//         setServerRows(normalizedRows);
//         setServerTotalRecords(
//           Number.isFinite(total)
//             ? total
//             : normalizedRows.length
//         );

//         setServerSummary(
//           responseBody?.summary ??
//           responseBody?.totals ??
//           {}
//         );
//       } catch (requestError) {
//         console.error("Payables View All failed", requestError);
//         if (active) {
//           setServerRows([]);
//           setServerTotalRecords(0);
//           setServerSummary({});
//           setViewError(
//             requestError?.response?.data?.detail ||
//             requestError?.message ||
//             "Failed to load Payables View All."
//           );
//         }
//       } finally {
//         if (active) setViewLoading(false);
//       }
//     };

//     loadViewAll();

//     return () => {
//       active = false;
//     };
//   }, [
//     filters,
//     appliedViewFilters,
//     filterOptions,
//     normalizedDetailFilters,
//     page,
//     pageSize,
//     sortKey,
//     sortDirection,
//     search,
//   ]);

//   /* ============================================================
//      FILTER HELPERS
//   ============================================================ */

//   const getFilterValue = (key, fallback = "All") => {
//     const value = filters?.[key];

//     if (
//       value === undefined ||
//       value === null ||
//       value === ""
//     ) {
//       return fallback;
//     }

//     if (Array.isArray(value)) {
//       return value.length ? value.join(", ") : fallback;
//     }

//     return value;
//   };

//   const formatDate = (value) => {
//     if (!value) return "";

//     const normalized = toApiDate(value);
//     return normalized || String(value);
//   };

//   const cleanCurrency = (value) => {
//     if (typeof value !== "string") {
//       return value;
//     }

//     return value.replace(
//       /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
//       ""
//     );
//   };

//   const formatTableAmount = (value) => {
//     const number = Number(value || 0);

//     if (number < 0) {
//       return `(${Math.abs(number).toLocaleString("en-US", {
//         maximumFractionDigits: 0,
//       })})`;
//     }

//     return number.toLocaleString("en-US", {
//       maximumFractionDigits: 0,
//     });
//   };

//   /* ============================================================
//      DROPDOWN HELPERS
//   ============================================================ */

//   const multiFilterConfig = {
//     legal_group: {
//       label: "Legal Group",
//       options: viewFilterOptions.legal_group || [],
//     },

//     legal_entities: {
//       label: "Legal Entity",
//       options: viewFilterOptions.legal_entities || [],
//     },

//     parent_divisions: {
//       label: "Parent Division",
//       options: viewFilterOptions.parent_divisions || [],
//     },

//     sub_divisions: {
//       label: "Sub-Division",
//       options: viewFilterOptions.sub_divisions || [],
//     },
//   };

//   const singleFilterConfig = {
//     reporting_currency: {
//       label: "Reporting Currency",
//       options: viewFilterOptions.reporting_currencies || [],
//     },

//     as_on_date: {
//       label: "As On Date",
//       options: viewFilterOptions.as_on_dates || [],
//     },

//     aging_basis: {
//       label: "Aging Basis",
//       options: viewFilterOptions.aging_basis || [],
//     },
//   };
//   const handleFilterSearch = (key, value) => {
//     setFilterSearch((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   /* ============================================================
//      MULTI SELECT VALUE HELPERS
//      ============================================================ */

//   const getNormalizedSelectedValues = (key) => {
//     const selected = Array.isArray(viewFilters[key])
//       ? viewFilters[key]
//       : [];

//     const options = multiFilterConfig[key]?.options || [];

//     /*
//      * "All" is only a display/default state.
//      * It should never be combined with individual values.
//      */
//     if (
//       selected.length === 0 ||
//       selected.includes("All") ||
//       (options.length > 0 &&
//         selected.length === options.length)
//     ) {
//       return options;
//     }

//     return selected;
//   };


//   const toggleMultiFilterValue = (key, value) => {
//     setViewFilters((prev) => {
//       const options = multiFilterConfig[key]?.options || [];

//       let currentValues = Array.isArray(prev[key])
//         ? prev[key]
//         : [];

//       /*
//        * If current state is "All", start from no individual
//        * selection before adding the clicked item.
//        */
//       if (
//         currentValues.includes("All") ||
//         currentValues.length === options.length
//       ) {
//         currentValues = [];
//       }

//       const exists = currentValues.includes(value);

//       const nextValues = exists
//         ? currentValues.filter((item) => item !== value)
//         : [...currentValues, value];

//       return {
//         ...prev,
//         [key]:
//           nextValues.length === 0
//             ? []
//             : nextValues,
//       };
//     });
//   };


//   const selectAllFilterValues = (key) => {
//     const options = multiFilterConfig[key]?.options || [];

//     setViewFilters((prev) => ({
//       ...prev,
//       [key]: [...options],
//     }));
//   };

//   const clearFilterValues = (key) => {
//     setViewFilters((prev) => ({
//       ...prev,
//       [key]: Array.isArray(prev[key]) ? [] : "",
//     }));

//     setFilterSearch((prev) => ({
//       ...prev,
//       [key]: "",
//     }));
//   };

//   const selectSingleFilterValue = (key, value) => {
//     setViewFilters((prev) => ({
//       ...prev,
//       [key]: value,
//     }));

//     setFilterSearch((prev) => ({
//       ...prev,
//       [key]: "",
//     }));

//     setOpenFilter(null);
//   };

//   const getMultiFilterDisplayValue = (key) => {
//     const selected = Array.isArray(viewFilters[key])
//       ? viewFilters[key]
//       : [];

//     const options =
//       multiFilterConfig[key]?.options || [];

//     // Nothing selected = All
//     if (selected.length === 0) {
//       return "All";
//     }

//     // Everything selected = All
//     if (
//       options.length > 0 &&
//       selected.length === options.length
//     ) {
//       return "All";
//     }

//     if (selected.length === 1) {
//       return selected[0];
//     }

//     if (selected.length === 2) {
//       return selected.join(", ");
//     }

//     return `${selected.length} selected`;
//   };

//   const getSingleFilterDisplayValue = (key) => {
//     const value = viewFilters[key];

//     if (
//       value === undefined ||
//       value === null ||
//       value === ""
//     ) {
//       return "All";
//     }

//     return value;
//   };

//   /* ============================================================
//      FILTER DROPDOWN
//   ============================================================ */

//   /* ============================================================
//    MULTI SELECT DROPDOWN
//    ============================================================ */

//   const MultiSelectDropdown = ({
//     filterKey,
//     label,
//   }) => {
//     const options =
//       multiFilterConfig[filterKey]?.options || [];

//     const query = String(
//       filterSearch[filterKey] || ""
//     )
//       .trim()
//       .toLowerCase();

//     const filteredOptions = options.filter((option) =>
//       String(option)
//         .toLowerCase()
//         .includes(query)
//     );

//     const selectedValues = Array.isArray(
//       viewFilters[filterKey]
//     )
//       ? viewFilters[filterKey]
//       : [];

//     const allSelected =
//       options.length > 0 &&
//       selectedValues.length === options.length;

//     const handleSelectAll = () => {
//       if (allSelected) {
//         setViewFilters((prev) => ({
//           ...prev,
//           [filterKey]: [],
//         }));
//       } else {
//         setViewFilters((prev) => ({
//           ...prev,
//           [filterKey]: [...options],
//         }));
//       };
//     };

//     return (
//       <div
//         style={{
//           position: "relative",
//           width: 150,
//           flex: "0 0 150px",
//         }}
//       >
//         {/* LABEL */}
//         <div
//           style={{
//             fontSize: 10,
//             fontWeight: 700,
//             color: "#173b8f",
//             marginBottom: 5,
//             lineHeight: 1.2,
//           }}
//         >
//           {label}
//         </div>

//         {/* CLOSED SELECT */}
//         <button
//           type="button"
//           onClick={() => {
//             setOpenFilter((current) =>
//               current === filterKey
//                 ? null
//                 : filterKey
//             );
//           }}
//           style={{
//             width: "100%",
//             height: 34,
//             border: "1px solid #d9e1ee",
//             borderRadius: 6,
//             background: "#f4f7fc",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             padding: "0 9px",
//             boxSizing: "border-box",
//             color: "#29427f",
//             fontSize: 11,
//             fontWeight: 600,
//             whiteSpace: "nowrap",
//             cursor: "pointer",
//             textAlign: "left",
//             outline: "none",
//           }}
//         >
//           <span
//             style={{
//               minWidth: 0,
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               whiteSpace: "nowrap",
//               paddingRight: 6,
//             }}
//           >
//             {getMultiFilterDisplayValue(filterKey)}
//           </span>

//           <span
//             style={{
//               color: "#53698f",
//               fontSize: 11,
//               flexShrink: 0,
//               transform:
//                 openFilter === filterKey
//                   ? "rotate(180deg)"
//                   : "rotate(0deg)",
//             }}
//           >
//             ▼
//           </span>
//         </button>

//         {/* DROPDOWN */}
//         {openFilter === filterKey && (
//           <div
//             style={{
//               position: "absolute",
//               top: "calc(100% + 5px)",
//               left: 0,
//               width: 190,
//               background: "#ffffff",
//               border: "1px solid #d7dfeb",
//               borderRadius: 7,
//               boxShadow:
//                 "0 8px 22px rgba(15, 23, 42, 0.14)",
//               zIndex: 9999,
//               overflow: "hidden",
//             }}
//           >
//             {/* SEARCH */}
//             <div
//               style={{
//                 padding: "7px 8px",
//                 borderBottom:
//                   "1px solid #edf1f6",
//               }}
//             >
//               <div
//                 style={{
//                   position: "relative",
//                 }}
//               >
//                 <span
//                   style={{
//                     position: "absolute",
//                     left: 9,
//                     top: "50%",
//                     transform:
//                       "translateY(-50%)",
//                     color: "#94a3b8",
//                     fontSize: 13,
//                     pointerEvents: "none",
//                   }}
//                 >
//                   ⌕
//                 </span>

//                 <input
//                   type="text"
//                   value={
//                     filterSearch[filterKey] || ""
//                   }
//                   onChange={(e) =>
//                     handleFilterSearch(
//                       filterKey,
//                       e.target.value
//                     )
//                   }
//                   placeholder={`Search ${label}`}
//                   autoFocus
//                   onClick={(e) =>
//                     e.stopPropagation()
//                   }
//                   style={{
//                     width: "100%",
//                     height: 30,
//                     border:
//                       "1px solid #d9e1ee",
//                     borderRadius: 5,
//                     padding:
//                       "0 8px 0 27px",
//                     outline: "none",
//                     fontSize: 10,
//                     color: "#334155",
//                     boxSizing: "border-box",
//                     background: "#ffffff",
//                   }}
//                 />
//               </div>
//             </div>

//             {/* SELECT ALL / CLEAR */}
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 padding: "7px 9px",
//                 borderBottom:
//                   "1px solid #edf1f6",
//                 background: "#ffffff",
//               }}
//             >
//               <button
//                 type="button"
//                 onClick={handleSelectAll}
//                 style={{
//                   border: "none",
//                   background: "transparent",
//                   padding: 0,
//                   color: "#4d46e5",
//                   cursor: "pointer",
//                   fontSize: 10,
//                   fontWeight: 700,
//                 }}
//               >
//                 {allSelected
//                   ? "Deselect All"
//                   : "Select All"}
//               </button>

//               <button
//                 type="button"
//                 onClick={() =>
//                   clearFilterValues(filterKey)
//                 }
//                 style={{
//                   border: "none",
//                   background: "transparent",
//                   padding: 0,
//                   color: "#64748b",
//                   cursor: "pointer",
//                   fontSize: 10,
//                   fontWeight: 600,
//                 }}
//               >
//                 Clear
//               </button>
//             </div>

//             {/* OPTIONS */}
//             <div
//               style={{
//                 maxHeight: 235,
//                 overflowY: "auto",
//                 padding: "3px 0",
//                 background: "#ffffff",
//               }}
//             >
//               {filteredOptions.length > 0 ? (
//                 filteredOptions.map((option) => {
//                   const checked =
//                     selectedValues.includes(option);

//                   return (
//                     <label
//                       key={option}
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 7,
//                         padding: "6px 9px",
//                         cursor: "pointer",
//                         fontSize: 10,
//                         color: "#334155",
//                         lineHeight: 1.2,
//                         background: checked
//                           ? "#f5f7ff"
//                           : "#ffffff",
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.background =
//                           "#f5f7ff";
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.background =
//                           checked
//                             ? "#f5f7ff"
//                             : "#ffffff";
//                       }}
//                     >
//                       <input
//                         type="checkbox"
//                         checked={checked}
//                         onChange={() =>
//                           toggleMultiFilterValue(
//                             filterKey,
//                             option
//                           )
//                         }
//                         style={{
//                           width: 13,
//                           height: 13,
//                           margin: 0,
//                           accentColor: "#4936e9",
//                           cursor: "pointer",
//                           flexShrink: 0,
//                         }}
//                       />

//                       <span
//                         style={{
//                           overflow: "hidden",
//                           textOverflow:
//                             "ellipsis",
//                           whiteSpace: "nowrap",
//                           flex: 1,
//                         }}
//                         title={option}
//                       >
//                         {option}
//                       </span>
//                     </label>
//                   );
//                 })
//               ) : (
//                 <div
//                   style={{
//                     padding: "18px 10px",
//                     textAlign: "center",
//                     color: "#94a3b8",
//                     fontSize: 10,
//                   }}
//                 >
//                   No results found
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };
//   /* ============================================================
//      SINGLE SELECT DROPDOWN
//      ============================================================ */

//   const SingleSelectDropdown = ({
//     filterKey,
//     label,
//   }) => {
//     const options =
//       singleFilterConfig[filterKey]?.options || [];

//     const query = String(
//       filterSearch[filterKey] || ""
//     )
//       .trim()
//       .toLowerCase();

//     const filteredOptions = options.filter((option) =>
//       String(option)
//         .toLowerCase()
//         .includes(query)
//     );

//     return (
//       <div
//         style={{
//           position: "relative",
//           width: 150,
//           minWidth: 150,
//           flex: "0 0 150px",
//         }}
//       >
//         {/* LABEL */}
//         <div
//           style={{
//             fontSize: 10,
//             lineHeight: 1.2,
//             fontWeight: 700,
//             color: "#173b8f",
//             marginBottom: 5,
//             whiteSpace: "nowrap",
//           }}
//         >
//           {label}
//         </div>

//         {/* SELECT BOX */}
//         <button
//           type="button"
//           onClick={() => {
//             setOpenFilter((current) =>
//               current === filterKey
//                 ? null
//                 : filterKey
//             );
//           }}
//           style={{
//             width: "100%",
//             height: 34,
//             border: "1px solid #d9e1ee",
//             borderRadius: 5,
//             background: "#f4f7fc",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             padding: "0 9px",
//             boxSizing: "border-box",
//             color: "#29427f",
//             fontSize: 11,
//             fontWeight: 600,
//             whiteSpace: "nowrap",
//             cursor: "pointer",
//             textAlign: "left",
//             outline: "none",
//           }}
//         >
//           <span
//             style={{
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               whiteSpace: "nowrap",
//               minWidth: 0,
//             }}
//             title={getSingleFilterDisplayValue(
//               filterKey
//             )}
//           >
//             {getSingleFilterDisplayValue(
//               filterKey
//             )}
//           </span>

//           <span
//             style={{
//               color: "#173b8f",
//               fontSize: 12,
//               flexShrink: 0,
//               lineHeight: 1,
//               transform:
//                 openFilter === filterKey
//                   ? "rotate(180deg)"
//                   : "rotate(0deg)",
//               transition:
//                 "transform 0.15s ease",
//             }}
//           >
//             ▼
//           </span>
//         </button>

//         {/* DROPDOWN */}
//         {openFilter === filterKey && (
//           <div
//             style={{
//               position: "absolute",
//               top: "calc(100% + 5px)",
//               left: 0,
//               width: 210,
//               background: "#ffffff",
//               border: "1px solid #d7dfeb",
//               borderRadius: 7,
//               boxShadow:
//                 "0 8px 22px rgba(15, 23, 42, 0.16)",
//               zIndex: 9999,
//               overflow: "hidden",
//             }}
//           >
//             {/* SEARCH */}
//             <div
//               style={{
//                 padding: "8px",
//                 borderBottom:
//                   "1px solid #edf1f6",
//               }}
//             >
//               <div
//                 style={{
//                   position: "relative",
//                 }}
//               >
//                 <span
//                   style={{
//                     position: "absolute",
//                     left: 9,
//                     top: "50%",
//                     transform:
//                       "translateY(-50%)",
//                     color: "#64748b",
//                     fontSize: 13,
//                     pointerEvents: "none",
//                   }}
//                 >
//                   🔍
//                 </span>

//                 <input
//                   type="text"
//                   value={
//                     filterSearch[filterKey] || ""
//                   }
//                   onChange={(e) =>
//                     handleFilterSearch(
//                       filterKey,
//                       e.target.value
//                     )
//                   }
//                   placeholder={`Search ${label}`}
//                   autoFocus
//                   style={{
//                     width: "100%",
//                     height: 32,
//                     border:
//                       "1px solid #d6dfec",
//                     borderRadius: 5,
//                     padding:
//                       "0 8px 0 29px",
//                     outline: "none",
//                     fontSize: 10,
//                     color: "#334155",
//                     boxSizing: "border-box",
//                   }}
//                 />
//               </div>
//             </div>

//             {/* CLEAR */}
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent:
//                   "flex-end",
//                 alignItems: "center",
//                 height: 32,
//                 padding: "0 9px",
//                 borderBottom:
//                   "1px solid #edf1f6",
//                 boxSizing: "border-box",
//               }}
//             >
//               <button
//                 type="button"
//                 onClick={() =>
//                   clearFilterValues(
//                     filterKey
//                   )
//                 }
//                 style={{
//                   border: "none",
//                   background: "transparent",
//                   padding: 0,
//                   color: "#64748b",
//                   cursor: "pointer",
//                   fontSize: 10,
//                   fontWeight: 600,
//                 }}
//               >
//                 Clear
//               </button>
//             </div>

//             {/* OPTIONS */}
//             <div
//               style={{
//                 maxHeight: 200,
//                 overflowY: "auto",
//                 padding: "3px 0",
//               }}
//             >
//               {filteredOptions.length > 0 ? (
//                 filteredOptions.map(
//                   (option) => {
//                     const selected =
//                       viewFilters[
//                       filterKey
//                       ] === option;

//                     return (
//                       <button
//                         key={`${filterKey}-${option}`}
//                         type="button"
//                         onClick={() =>
//                           selectSingleFilterValue(
//                             filterKey,
//                             option
//                           )
//                         }
//                         style={{
//                           width: "100%",
//                           minHeight: 30,
//                           border: "none",
//                           background: selected
//                             ? "#f1f5ff"
//                             : "#ffffff",
//                           padding:
//                             "6px 10px",
//                           textAlign: "left",
//                           cursor: "pointer",
//                           color: selected
//                             ? "#4936e9"
//                             : "#334155",
//                           fontSize: 10,
//                           fontWeight: selected
//                             ? 700
//                             : 500,
//                           boxSizing:
//                             "border-box",
//                         }}
//                       >
//                         {option}
//                       </button>
//                     );
//                   }
//                 )
//               ) : (
//                 <div
//                   style={{
//                     padding: 15,
//                     textAlign: "center",
//                     color: "#94a3b8",
//                     fontSize: 10,
//                   }}
//                 >
//                   No results found
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const filtered = safeData;

//   const totalPages = Math.max(
//     1,
//     Math.ceil(serverTotalRecords / pageSize)
//   );

//   const pageRows = filtered;

//   useEffect(() => {
//     setPage(1);
//   }, [search, appliedViewFilters, pageSize, sortKey, sortDirection]);

//   const changeSort = (key) => {
//     if (sortKey === key) {
//       setSortDirection((direction) =>
//         direction === "asc" ? "desc" : "asc"
//       );
//     } else {
//       setSortKey(key);
//       setSortDirection("desc");
//     }
//   };

//   /* ============================================================
//      APPLY / RESET FILTERS
//   ============================================================ */

//   const handleApplyViewFilters = () => {
//     setAppliedViewFilters({
//       ...viewFilters,
//     });

//     setOpenFilter(null);
//   };

//   const handleResetViewFilters = () => {
//     const initialFilters = getInitialViewFilters();

//     setViewFilters(initialFilters);
//     setAppliedViewFilters(initialFilters);

//     setFilterSearch({
//       legal_group: "",
//       legal_entities: "",
//       parent_divisions: "",
//       sub_divisions: "",
//       reporting_currency: "",
//       as_on_date: "",
//       aging_basis: "",
//     });

//     setOpenFilter(null);
//   };

//   /* ============================================================
//      TABLE COLUMNS
//   ============================================================ */

//   const viewColumns = [
//     {
//       key: "legal_entity",
//       label: "Legal Entity",
//       sortable: true,
//       text: true,
//     },
//     {
//       key: "parent_division",
//       label: "Parent Division",
//       sortable: true,
//       text: true,
//     },
//     {
//       key: "sub_division",
//       label: "Sub-Division",
//       sortable: true,
//       text: true,
//     },
//     {
//       key: "supplier_code",
//       label: "Supplier Code",
//       sortable: true,
//       text: true,
//     },
//     {
//       key: "supplier_name",
//       label: "Supplier Name",
//       sortable: true,
//       text: true,
//     },
//     {
//       key: "country",
//       label: "Country",
//       sortable: true,
//       text: true,
//     },
//     {
//       key: "row_currency",
//       label: "Currency",
//       text: true,
//     },
//     {
//       key: "total_payable",
//       label: "Total Payables",
//       sortable: true,
//     },
//     {
//       key: "current",
//       label: "Current",
//       sortable: true,
//     },
//     {
//       key: "0_30",
//       label: "0 – 30",
//       sortable: true,
//     },
//     {
//       key: "31_60",
//       label: "31 – 60",
//       sortable: true,
//     },
//     {
//       key: "61_90",
//       label: "61 – 90",
//       sortable: true,
//     },
//     {
//       key: "91_120",
//       label: "91 – 120",
//       sortable: true,
//     },
//     {
//       key: "121_180",
//       label: "121 – 180",
//       sortable: true,
//     },
//     {
//       key: "181_365",
//       label: "181 – 365",
//       sortable: true,
//     },
//     {
//       key: "above_365",
//       label: "Above 365",
//       sortable: true,
//     },
//   ];

//   const amountColumns = [
//     "total_payable",
//     "current",
//     "0_30",
//     "31_60",
//     "61_90",
//     "91_120",
//     "121_180",
//     "181_365",
//     "above_365",
//   ];

//   /*
//    * Fixed column widths prevent long names from expanding the numeric
//    * columns and keep the View All table compact and predictable.
//    */
//   const viewColumnWidths = {
//     legal_entity: 175,
//     parent_division: 125,
//     sub_division: 125,
//     supplier_code: 120,
//     supplier_name: 185,
//     country: 105,
//     row_currency: 92,
//     total_payable: 145,
//     current: 100,
//     "0_30": 92,
//     "31_60": 92,
//     "61_90": 92,
//     "91_120": 96,
//     "121_180": 102,
//     "181_365": 102,
//     above_365: 96,
//   };

//   const viewTableMinWidth =
//     Object.values(viewColumnWidths).reduce(
//       (sum, width) => sum + width,
//       0
//     );

//   const handleViewAllExport = async (format) => {
//     try {
//       const apiFilters = buildPayablesApiFilters(
//         {
//           ...filters,
//           ...appliedViewFilters,
//         },
//         filterOptions
//       );

//       // Keep the drill-down filters separate and merge them last so that
//       // they can never be lost/overwritten by normal dashboard filters.
//       const exportParams = {
//         ...apiFilters,
//         ...normalizedDetailFilters,
//       };

//       const response =
//         format === "excel"
//           ? await exportPayablesExcel(exportParams)
//           : await exportPayablesPdf(exportParams);

//       const blob =
//         response?.data instanceof Blob
//           ? response.data
//           : response instanceof Blob
//             ? response
//             : null;

//       if (!blob) {
//         throw new Error("Export response did not contain a downloadable file.");
//       }

//       const disposition =
//         response?.headers?.["content-disposition"] ||
//         response?.headers?.["Content-Disposition"] ||
//         "";
//       const match = disposition.match(
//         /filename\*?=(?:UTF-8''|")?([^";\n]+)"?/i
//       );
//       const safeSection = String(section || "payables")
//         .replace(/[^a-z0-9]+/gi, "_")
//         .replace(/^_+|_+$/g, "");
//       const fallback = `Payables_${safeSection || "View_All"}_View_All.${format === "excel" ? "xlsx" : "pdf"
//         }`;
//       const filename = match?.[1]
//         ? decodeURIComponent(match[1])
//         : fallback;

//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error(`Payables View All ${format} export failed`, error);
//     }
//   };

//   const summarySource = serverSummary || {};
//   /*
//    * KPI calculation priority:
//    * 1. Use an aggregate returned by the backend, when available.
//    * 2. Otherwise calculate from the rows currently loaded.
//    *
//    * The /api/payables/view-all response supplied for this page contains
//    * only the current page in `data` and has no summary object, so summing
//    * those rows is a PAGE TOTAL, not a 4,152-record grand total.
//    */
//   const pageTotalPayables = safeData.reduce(
//     (sum, row) =>
//       sum +
//       Number(
//         row.total_payable ??
//         row.total_payables ??
//         0
//       ),
//     0
//   );

//   const pageCurrentPayables = safeData.reduce(
//     (sum, row) =>
//       sum +
//       Number(
//         row.current ??
//         row.current_payables ??
//         0
//       ),
//     0
//   );

//   const pageOverduePayables = safeData.reduce(
//     (sum, row) =>
//       sum +
//       Number(row["0_30"] ?? 0) +
//       Number(row["31_60"] ?? 0) +
//       Number(row["61_90"] ?? 0) +
//       Number(row["91_120"] ?? 0) +
//       Number(row["121_180"] ?? 0) +
//       Number(row["181_365"] ?? 0) +
//       Number(row["above_365"] ?? 0),
//     0
//   );

//   const pageOverdue90 = safeData.reduce(
//     (sum, row) =>
//       sum +
//       Number(row["91_120"] ?? 0) +
//       Number(row["121_180"] ?? 0) +
//       Number(row["181_365"] ?? 0) +
//       Number(row["above_365"] ?? 0),
//     0
//   );

//   const totalPayables = Number(
//     summarySource.total_payables ??
//     summarySource.total ??
//     pageTotalPayables
//   );

//   const currentPayables = Number(
//     summarySource.current_payables ??
//     summarySource.current ??
//     pageCurrentPayables
//   );

//   const overduePayables = Number(
//     summarySource.overdue_payables ??
//     summarySource.overdue ??
//     pageOverduePayables
//   );

//   const overdue90 = Number(
//     summarySource.overdue_gt_90 ??
//     summarySource.overdue_above_90 ??
//     pageOverdue90
//   );

//   const hasBackendSummary = Boolean(
//     summarySource &&
//     (
//       summarySource.total_payables !== undefined ||
//       summarySource.current_payables !== undefined ||
//       summarySource.overdue_payables !== undefined ||
//       summarySource.overdue_gt_90 !== undefined ||
//       summarySource.overdue_above_90 !== undefined
//     )
//   );

//   const snapshotDate =
//     filters?.as_on_date ||
//     filters?.as_on_dates ||
//     filters?.asOfDate ||
//     filters?.snapshot_date ||
//     null;

//   const agingBasis =
//     appliedViewFilters?.aging_basis ||
//     filters?.aging_basis ||
//     filters?.agingBasis ||
//     "Due Date Based";

//   /* ============================================================
//      KPI CARD
//   ============================================================ */

//   const SummaryCard = ({
//     icon,
//     title,
//     value,
//     iconBackground,
//     iconColor,
//     titleColor,
//   }) => (
//     <div
//       style={{
//         background: "#ffffff",
//         border: "1px solid #e5eaf2",
//         borderRadius: 8,
//         minHeight: 78,
//         padding: "12px 14px",
//         display: "flex",
//         alignItems: "center",
//         gap: 12,
//         boxSizing: "border-box",
//         boxShadow:
//           "0 2px 8px rgba(15, 23, 42, 0.03)",
//       }}
//     >
//       <div
//         style={{
//           width: 42,
//           height: 42,
//           minWidth: 42,
//           borderRadius: "50%",
//           background: iconBackground,
//           color: iconColor,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: 20,
//           fontWeight: 800,
//         }}
//       >
//         {icon}
//       </div>

//       <div
//         style={{
//           minWidth: 0,
//         }}
//       >
//         <div
//           style={{
//             fontSize: 10,
//             fontWeight: 700,
//             color: titleColor,
//             marginBottom: 3,
//           }}
//         >
//           {title}
//         </div>

//         <div
//           style={{
//             fontSize: 18,
//             fontWeight: 800,
//             color: "#142b6f",
//             whiteSpace: "nowrap",
//           }}
//         >
//           {formatPayablesCompact(
//             value,
//             currency
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   /* ============================================================
//      RETURN
//   ============================================================ */

//   /*
//    * View All is a real modal overlay, not a block rendered after the
//    * dashboard footer.  Keeping the existing View All content intact while
//    * changing only this outer container makes the existing API/data/table
//    * behavior independent from the modal presentation.
//    */
//   useEffect(() => {
//     const previousOverflow = document.body.style.overflow;
//     document.body.style.overflow = "hidden";

//     return () => {
//       document.body.style.overflow = previousOverflow;
//     };
//   }, []);

//   return (
//     <div
//       role="dialog"
//       aria-modal="true"
//       aria-labelledby="payables-view-all-title"
//       style={{
//         position: "fixed",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         width: "96vw",
//         maxWidth: 1540,
//         height: "94vh",
//         maxHeight: 900,
//         background: "#f8fafc",
//         border: "1px solid #dbe3ef",
//         borderRadius: 12,
//         boxShadow: "0 24px 70px rgba(15, 23, 42, 0.28)",
//         zIndex: 100000,
//         overflowY: "auto",
//         overflowX: "hidden",
//         padding: "12px 14px 16px",
//         boxSizing: "border-box",
//       }}
//     >
//       {/* MODAL HEADER */}
//       <div
//         style={{
//           position: "sticky",
//           top: -12,
//           zIndex: 20,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           gap: 16,
//           margin: "-12px -14px 12px",
//           padding: "12px 14px",
//           background: "#ffffff",
//           borderBottom: "1px solid #e3e9f2",
//         }}
//       >
//         <div style={{ minWidth: 0 }}>
//           <div
//             id="payables-view-all-title"
//             style={{
//               color: "#142b6f",
//               fontSize: 19,
//               fontWeight: 800,
//               lineHeight: 1.2,
//             }}
//           >
//             {viewAllTitle}
//           </div>
//           <div
//             style={{
//               marginTop: 3,
//               color: "#64748b",
//               fontSize: 10,
//               lineHeight: 1.35,
//             }}
//           >
//             {viewAllSubtitle}
//           </div>
//         </div>

//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 8,
//             flexShrink: 0,
//           }}
//         >
//           <button
//             type="button"
//             onClick={() => handleViewAllExport("excel")}
//             style={{
//               height: 32,
//               padding: "0 12px",
//               border: "1px solid #d6dfec",
//               borderRadius: 7,
//               background: "#ffffff",
//               color: "#1f4f9a",
//               fontSize: 11,
//               fontWeight: 700,
//               cursor: "pointer",
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 6,
//             }}
//           >
//             <span aria-hidden="true">📊</span>
//             Excel
//           </button>

//           <button
//             type="button"
//             onClick={() => handleViewAllExport("pdf")}
//             style={{
//               height: 32,
//               padding: "0 12px",
//               border: "1px solid #d6dfec",
//               borderRadius: 7,
//               background: "#ffffff",
//               color: "#b42318",
//               fontSize: 11,
//               fontWeight: 700,
//               cursor: "pointer",
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 6,
//             }}
//           >
//             <span aria-hidden="true">📄</span>
//             PDF
//           </button>

//           <button
//             type="button"
//             onClick={onClose}
//             aria-label="Close View All"
//             title="Close"
//             style={{
//               width: 32,
//               height: 32,
//               border: "1px solid #d6dfec",
//               borderRadius: 7,
//               background: "#ffffff",
//               color: "#475569",
//               fontSize: 20,
//               lineHeight: 1,
//               cursor: "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             ×
//           </button>
//         </div>
//       </div>

//       {/* ======================================================
//           VIEW ALL FILTERS
//       ====================================================== */}

//       <div
//         style={{
//           width: "100%",
//           background: "#ffffff",
//           border: "1px solid #e5eaf2",
//           borderRadius: 10,
//           padding: "12px 14px",
//           marginBottom: 14,
//           boxSizing: "border-box",
//           boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
//         }}
//       >
//         <div
//           style={{
//             display: "grid",

//             // Same one-line layout as the main dashboard
//             gridTemplateColumns:
//               "1fr 1fr 1fr 1fr 1fr 1fr 1fr auto auto",

//             gap: 10,
//             alignItems: "end",
//             width: "100%",
//           }}
//         >
//           {/* ==================================================
//         LEGAL GROUP
//     ================================================== */}

//           <FilterSelect
//             label="Legal Group"
//             value={viewFilters.legal_group}
//             options={viewFilterOptions.legal_group}
//             multiple
//             onChange={(value) =>
//               setViewFilters((prev) => ({
//                 ...prev,
//                 legal_group: value,
//               }))
//             }
//           />

//           {/* ==================================================
//         LEGAL ENTITY
//     ================================================== */}

//           <FilterSelect
//             label="Legal Entity"
//             value={viewFilters.legal_entities}
//             options={viewFilterOptions.legal_entities}
//             multiple
//             onChange={(value) =>
//               setViewFilters((prev) => ({
//                 ...prev,
//                 legal_entities: value,
//               }))
//             }
//           />

//           {/* ==================================================
//         PARENT DIVISION
//     ================================================== */}

//           <FilterSelect
//             label="Parent Division"
//             value={viewFilters.parent_divisions}
//             options={viewFilterOptions.parent_divisions}
//             multiple
//             onChange={(value) =>
//               setViewFilters((prev) => ({
//                 ...prev,
//                 parent_divisions: value,
//               }))
//             }
//           />

//           {/* ==================================================
//         SUB-DIVISION
//     ================================================== */}

//           <FilterSelect
//             label="Sub-Division"
//             value={viewFilters.sub_divisions}
//             options={viewFilterOptions.sub_divisions}
//             multiple
//             onChange={(value) =>
//               setViewFilters((prev) => ({
//                 ...prev,
//                 sub_divisions: value,
//               }))
//             }
//           />

//           {/* ==================================================
//         REPORTING CURRENCY
//     ================================================== */}

//           <FilterSelect
//             label="Reporting Currency"
//             value={viewFilters.reporting_currency}
//             options={viewFilterOptions.reporting_currencies}
//             onChange={(value) =>
//               setViewFilters((prev) => ({
//                 ...prev,
//                 reporting_currency: value,
//               }))
//             }
//           />

//           {/* ==================================================
//         AGING BASIS
//     ================================================== */}

//           <FilterSelect
//             label="Aging Basis"
//             value={viewFilters.aging_basis}
//             options={viewFilterOptions.aging_basis}
//             onChange={(value) =>
//               setViewFilters((prev) => ({
//                 ...prev,
//                 aging_basis: value,
//               }))
//             }
//           />

//           {/* ==================================================
//         AS ON DATE

//         Put DateFilter after Aging Basis so the order can
//         be adjusted independently from the API.
//     ================================================== */}

//           <DateFilter
//             value={viewFilters.as_on_date}
//             onChange={(value) =>
//               setViewFilters((prev) => ({
//                 ...prev,
//                 as_on_date: value,
//               }))
//             }
//           />

//           {/* ==================================================
//         APPLY
//     ================================================== */}

//           <button
//             type="button"
//             onClick={handleApplyViewFilters}
//             style={{
//               height: 34,
//               minWidth: 70,
//               padding: "0 18px",
//               border: "none",
//               borderRadius: 8,
//               background: "#5b5bea",
//               color: "#ffffff",
//               fontSize: 11,
//               fontWeight: 800,
//               cursor: "pointer",
//               boxSizing: "border-box",
//               whiteSpace: "nowrap",
//               boxShadow:
//                 "0 3px 8px rgba(91, 91, 234, 0.18)",
//             }}
//           >
//             Apply
//           </button>

//           {/* ==================================================
//         RESET
//     ================================================== */}

//           <button
//             type="button"
//             onClick={handleResetViewFilters}
//             style={{
//               height: 34,
//               minWidth: 66,
//               padding: "0 16px",
//               border: "1px solid #d4dbe7",
//               borderRadius: 8,
//               background: "#ffffff",
//               color: "#334155",
//               fontSize: 11,
//               fontWeight: 700,
//               cursor: "pointer",
//               boxSizing: "border-box",
//               whiteSpace: "nowrap",
//             }}
//           >
//             Reset
//           </button>

//         </div>

//         {/* ======================================================
//               SUMMARY CARDS
//           ====================================================== */}

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns:
//               "1.05fr repeat(4, 1fr)",
//             gap: 9,
//             marginBottom: 14,
//           }}
//         >
//           <div
//             style={{
//               background: "#ffffff",
//               border: "1px solid #e5eaf2",
//               borderRadius: 8,
//               minHeight: 78,
//               padding: "12px 14px",
//               display: "flex",
//               alignItems: "center",
//               gap: 12,
//             }}
//           >
//             <div
//               style={{
//                 width: 42,
//                 height: 42,
//                 borderRadius: "50%",
//                 background: "#edf4ff",
//                 color: "#1464e8",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: 19,
//               }}
//             >
//               ▤
//             </div>

//             <div>
//               <div
//                 style={{
//                   fontSize: 20,
//                   fontWeight: 800,
//                   color: "#142b6f",
//                 }}
//               >
//                 {serverTotalRecords.toLocaleString()}
//               </div>

//               <div
//                 style={{
//                   fontSize: 10,
//                   color: "#64748b",
//                   marginTop: 1,
//                 }}
//               >
//                 records
//               </div>
//             </div>
//           </div>

//           <SummaryCard
//             icon="▣"
//             title={
//               hasBackendSummary
//                 ? "Total Payables"
//                 : "Total Payables (Page)"
//             }
//             value={totalPayables}
//             iconBackground="#e5faf2"
//             iconColor="#149b6f"
//             titleColor="#149b6f"
//           />

//           <SummaryCard
//             icon="▤"
//             title={
//               hasBackendSummary
//                 ? "Current"
//                 : "Current (Page)"
//             }
//             value={currentPayables}
//             iconBackground="#e5faf2"
//             iconColor="#149b6f"
//             titleColor="#149b6f"
//           />

//           <SummaryCard
//             icon="⌛"
//             title={
//               hasBackendSummary
//                 ? "Overdue"
//                 : "Overdue (Page)"
//             }
//             value={overduePayables}
//             iconBackground="#fff2df"
//             iconColor="#ed8a17"
//             titleColor="#ed8a17"
//           />

//           <SummaryCard
//             icon="!"
//             title={
//               hasBackendSummary
//                 ? "Overdue > 90 Days"
//                 : "Overdue > 90 Days (Page)"
//             }
//             value={overdue90}
//             iconBackground="#ffeaf0"
//             iconColor="#ed3c69"
//             titleColor="#ed3c69"
//           />
//         </div>

//         {/* ======================================================
//               ALL PAYABLES CARD
//           ====================================================== */}

//         <div
//           style={{
//             background: "#ffffff",
//             border: "1px solid #e3e9f2",
//             borderRadius: 9,
//             overflow: "hidden",
//             boxShadow:
//               "0 2px 8px rgba(15, 23, 42, 0.025)",
//           }}
//         >
//           {/* CARD HEADER */}

//           <div
//             style={{
//               padding: "12px 13px 9px",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "flex-end",
//                 gap: 10,
//               }}
//             >
//               <div>
//                 <div
//                   style={{
//                     marginTop: 5,
//                     fontSize: 10,
//                     color: "#64748b",
//                   }}
//                 >
//                   Aging basis:{" "}
//                   <strong
//                     style={{
//                       color: "#334b8e",
//                     }}
//                   >
//                     {agingBasis}
//                   </strong>

//                   <span
//                     style={{
//                       margin: "0 8px",
//                       color: "#a0aec0",
//                     }}
//                   >
//                     |
//                   </span>

//                   Snapshot:{" "}
//                   <strong
//                     style={{
//                       color: "#334b8e",
//                     }}
//                   >
//                     {formatDate(snapshotDate)}
//                   </strong>
//                 </div>
//               </div>

//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 10,
//                 }}
//               >
//                 {/* SEARCH */}

//                 <div
//                   style={{
//                     position: "relative",
//                   }}
//                 >
//                   <span
//                     style={{
//                       position: "absolute",
//                       left: 10,
//                       top: "50%",
//                       transform:
//                         "translateY(-50%)",
//                       color: "#52658d",
//                       fontSize: 14,
//                     }}
//                   >
//                     ⌕
//                   </span>

//                   <input
//                     type="text"
//                     value={search}
//                     onChange={(e) => {
//                       setSearch(
//                         e.target.value
//                       );
//                       setPage(1);
//                     }}
//                     placeholder="Search supplier"
//                     style={{
//                       width: 245,
//                       height: 34,
//                       border:
//                         "1px solid #d6dfec",
//                       borderRadius: 5,
//                       padding:
//                         "0 10px 0 29px",
//                       outline: "none",
//                       fontSize: 10,
//                       color: "#334155",
//                       boxSizing:
//                         "border-box",
//                     }}
//                   />
//                 </div>

//                 {/* ROWS */}

//                 <select
//                   value={pageSize}
//                   onChange={(e) => {
//                     setPageSize(
//                       Number(e.target.value)
//                     );
//                     setPage(1);
//                   }}
//                   style={{
//                     width: 110,
//                     height: 34,
//                     border:
//                       "1px solid #d6dfec",
//                     borderRadius: 5,
//                     padding: "0 9px",
//                     color: "#334b8e",
//                     background: "#ffffff",
//                     fontSize: 10,
//                     fontWeight: 700,
//                     outline: "none",
//                   }}
//                 >
//                   <option value={10}>
//                     10 rows
//                   </option>
//                   <option value={20}>
//                     20 rows
//                   </option>
//                   <option value={50}>
//                     50 rows
//                   </option>
//                   <option value={100}>
//                     100 rows
//                   </option>
//                 </select>

//                 {/* PAGINATION TOP */}

//                 <button
//                   type="button"
//                   disabled={page <= 1}
//                   onClick={() =>
//                     setPage((p) =>
//                       Math.max(1, p - 1)
//                     )
//                   }
//                   style={{
//                     border: "none",
//                     background:
//                       "transparent",
//                     color:
//                       page <= 1
//                         ? "#cbd5e1"
//                         : "#3048a5",
//                     fontSize: 21,
//                     cursor:
//                       page <= 1
//                         ? "not-allowed"
//                         : "pointer",
//                     padding: 0,
//                   }}
//                 >
//                   ‹
//                 </button>

//                 <span
//                   style={{
//                     fontSize: 11,
//                     color: "#3048a5",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   {serverTotalRecords === 0
//                     ? 0
//                     : (page - 1) *
//                     pageSize +
//                     1}{" "}
//                   –{" "}
//                   {Math.min(
//                     page * pageSize,
//                     serverTotalRecords
//                   )}{" "}
//                   of{" "}
//                   {serverTotalRecords.toLocaleString()}
//                 </span>

//                 <button
//                   type="button"
//                   disabled={
//                     page >= totalPages
//                   }
//                   onClick={() =>
//                     setPage((p) =>
//                       Math.min(
//                         totalPages,
//                         p + 1
//                       )
//                     )
//                   }
//                   style={{
//                     border: "none",
//                     background:
//                       "transparent",
//                     color:
//                       page >= totalPages
//                         ? "#cbd5e1"
//                         : "#3048a5",
//                     fontSize: 21,
//                     cursor:
//                       page >= totalPages
//                         ? "not-allowed"
//                         : "pointer",
//                     padding: 0,
//                   }}
//                 >
//                   ›
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* TABLE */}

//           <div
//             style={{
//               width: "100%",
//               overflowX: "auto",
//             }}
//           >
//             <table
//               style={{
//                 width: "100%",
//                 minWidth: viewTableMinWidth,
//                 borderCollapse: "separate",
//                 borderSpacing: 0,
//                 tableLayout: "fixed",
//                 fontSize: 10,
//               }}
//             >
//               <colgroup>
//                 {viewColumns.map((column) => (
//                   <col
//                     key={`col-${column.key}`}
//                     style={{
//                       width:
//                         viewColumnWidths[column.key] ||
//                         100,
//                     }}
//                   />
//                 ))}
//               </colgroup>
//               <thead>
//                 <tr>
//                   {viewColumns.map(
//                     (column) => {
//                       const isText =
//                         column.text;

//                       return (
//                         <th
//                           key={column.key}
//                           onClick={() =>
//                             column.sortable &&
//                             changeSort(
//                               column.key
//                             )
//                           }
//                           style={{
//                             position:
//                               "sticky",
//                             top: 0,
//                             zIndex: 2,
//                             background:
//                               "#edf4ff",
//                             color:
//                               "#24479d",
//                             fontWeight: 800,
//                             padding:
//                               "9px 8px",
//                             borderBottom:
//                               "1px solid #d7e1ef",
//                             lineHeight: 1.25,
//                             minHeight: 34,

//                             textAlign:
//                               isText
//                                 ? "left"
//                                 : "right",
//                             whiteSpace:
//                               "nowrap",
//                             overflow: "visible",
//                             cursor:
//                               column.sortable
//                                 ? "pointer"
//                                 : "default",
//                             width:
//                               viewColumnWidths[column.key] ||
//                               100,
//                             maxWidth:
//                               viewColumnWidths[column.key] ||
//                               100,
//                             overflow:
//                               "hidden",
//                             textOverflow:
//                               "ellipsis",
//                           }}
//                         >
//                           {column.label}

//                           {column.sortable &&
//                             sortKey ===
//                             column.key && (
//                               <span
//                                 style={{
//                                   marginLeft: 4,
//                                   fontSize: 8,
//                                 }}
//                               >
//                                 {sortDirection ===
//                                   "asc"
//                                   ? "▲"
//                                   : "▼"}
//                               </span>
//                             )}
//                         </th>
//                       );
//                     }
//                   )}
//                 </tr>
//               </thead>

//               <tbody>
//                 {pageRows.map(
//                   (row, rowIndex) => (
//                     <tr
//                       key={
//                         row.id ||
//                         row.supplier_code ||
//                         rowIndex
//                       }
//                       style={{
//                         background:
//                           rowIndex % 2 === 0
//                             ? "#f9fbff"
//                             : "#ffffff",
//                       }}
//                     >
//                       {viewColumns.map(
//                         (column) => {
//                           const isText =
//                             column.text;

//                           let value;

//                           if (
//                             column.key ===
//                             "row_currency"
//                           ) {
//                             // View All currency must follow the currently
//                             // applied View All Reporting Currency filter.
//                             // Only fall back to the row/main currency when
//                             // no View All currency is available.
//                             value =
//                               appliedViewFilters?.reporting_currency ||
//                               row.row_currency ||
//                               row.source_currency ||
//                               row.reporting_currency ||
//                               row.currency ||
//                               currency ||
//                               "AED";
//                           } else {
//                             value =
//                               row[
//                               column.key
//                               ];
//                           }

//                           if (
//                             column.key ===
//                             "supplier_name"
//                           ) {
//                             value =
//                               value ||
//                               row.supplier ||
//                               "-";
//                           }

//                           if (
//                             amountColumns.includes(
//                               column.key
//                             )
//                           ) {
//                             const numericValue =
//                               Number(
//                                 value || 0
//                               );

//                             return (
//                               <td
//                                 key={
//                                   column.key
//                                 }
//                                 style={{
//                                   padding:
//                                     "7px 6px",
//                                   width:
//                                     viewColumnWidths[column.key] ||
//                                     100,
//                                   maxWidth:
//                                     viewColumnWidths[column.key] ||
//                                     100,
//                                   borderBottom:
//                                     "1px solid #edf1f6",
//                                   color:
//                                     numericValue <
//                                       0
//                                       ? "#c62828"
//                                       : "#334b8e",
//                                   textAlign:
//                                     "right",
//                                   whiteSpace:
//                                     "nowrap",
//                                   fontWeight:
//                                     column.key ===
//                                       "total_payable"
//                                       ? 700
//                                       : 500,
//                                 }}
//                               >
//                                 {formatTableAmount(
//                                   numericValue
//                                 )}
//                               </td>
//                             );
//                           }

//                           return (
//                             <td
//                               key={
//                                 column.key
//                               }
//                               style={{
//                                 padding:
//                                   "7px 6px",
//                                 width:
//                                   viewColumnWidths[column.key] ||
//                                   100,
//                                 maxWidth:
//                                   viewColumnWidths[column.key] ||
//                                   100,
//                                 borderBottom:
//                                   "1px solid #edf1f6",
//                                 color:
//                                   "#334b8e",
//                                 textAlign:
//                                   isText
//                                     ? "left"
//                                     : "center",
//                                 whiteSpace:
//                                   "nowrap",
//                                 overflow:
//                                   "hidden",
//                                 textOverflow:
//                                   "ellipsis",
//                                 fontWeight:
//                                   column.key ===
//                                     "supplier_name"
//                                     ? 600
//                                     : 500,
//                               }}
//                               title={
//                                 value || ""
//                               }
//                             >
//                               {column.key === "row_currency"
//                                 ? (value || "-")
//                                 : cleanCurrency(value || "-")}
//                             </td>
//                           );
//                         }
//                       )}
//                     </tr>
//                   )
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* NO DATA */}

//           {
//             pageRows.length === 0 && (
//               <div
//                 style={{
//                   textAlign: "center",
//                   padding: 45,
//                   color: "#64748b",
//                   fontSize: 12,
//                 }}
//               >
//                 No suppliers found.
//               </div>
//             )
//           }

//           {/* FOOTER */}

//           <div
//             style={{
//               minHeight: 55,
//               padding: "10px 13px",
//               borderTop:
//                 "1px solid #e5eaf2",
//               display: "flex",
//               alignItems: "center",
//               justifyContent:
//                 "space-between",
//               gap: 15,
//               boxSizing: "border-box",
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 10,
//                 color: "#5b6d99",
//               }}
//             >
//               Values shown in selected
//               reporting currency

//               <span
//                 style={{
//                   margin: "0 8px",
//                   color: "#b0bacb",
//                 }}
//               >
//                 |
//               </span>

//               Source: Oracle Fusion Cloud
//             </div>

//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 8,
//                 color: "#3048a5",
//                 fontSize: 11,
//                 fontWeight: 600,
//               }}
//             >
//               <button
//                 type="button"
//                 disabled={page <= 1}
//                 onClick={() =>
//                   setPage((p) =>
//                     Math.max(1, p - 1)
//                   )
//                 }
//                 style={{
//                   border: "none",
//                   background:
//                     "transparent",
//                   color:
//                     page <= 1
//                       ? "#cbd5e1"
//                       : "#3048a5",
//                   fontSize: 20,
//                   cursor:
//                     page <= 1
//                       ? "not-allowed"
//                       : "pointer",
//                 }}
//               >
//                 ‹
//               </button>

//               <span>
//                 {serverTotalRecords === 0
//                   ? 0
//                   : (page - 1) * pageSize + 1}
//                 {" – "}
//                 {Math.min(page * pageSize, serverTotalRecords)}
//                 {" of "}
//                 {serverTotalRecords.toLocaleString()}
//               </span>

//               <button
//                 type="button"
//                 disabled={
//                   page >= totalPages
//                 }
//                 onClick={() =>
//                   setPage((p) =>
//                     Math.min(
//                       totalPages,
//                       p + 1
//                     )
//                   )
//                 }
//                 style={{
//                   border: "none",
//                   background:
//                     "transparent",
//                   color:
//                     page >= totalPages
//                       ? "#cbd5e1"
//                       : "#3048a5",
//                   fontSize: 20,
//                   cursor:
//                     page >= totalPages
//                       ? "not-allowed"
//                       : "pointer",
//                 }}
//               >
//                 ›
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useEffect, useState, useRef, useMemo } from "react";
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
      k.total_payables ?? k.total ?? k.total_ar ?? k.total_outstanding ?? 0,
    current_payables:
      k.current_payables ?? k.current ?? k.current_amount ?? 0,
    overdue_payables:
      k.overdue_payables ?? k.overdue ?? k.overdue_amount ?? 0,
    overdue_gt_90:
      k.overdue_gt_90 ?? k.overdue_above_90 ?? k.overdue_above_90_days ?? k.above_90 ?? 0,
    dpo: k.dpo ?? k.dpo_days ?? 0,
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
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
};

function formatAxisMillions(value) {
  if (value === null || value === undefined) return "—";
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
   DATE FILTER
============================================================ */
function DateFilter({
  value,
  options = [],
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  /* ==========================================================
     CLOSE OUTSIDE
  ========================================================== */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
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
     NORMALIZE DATE OPTIONS

     Supports backend:

     [
       "2026-09-20",
       "2026-09-19"
     ]

     Also safely supports:

     [
       {
         value: "2026-09-20",
         label: "20 Sep 2026"
       }
     ]
  ========================================================== */
  const normalizedDates = useMemo(() => {
    const result = [];
    const seen = new Set();

    (options || []).forEach(
      (item, index) => {
        if (
          item === undefined ||
          item === null
        ) {
          return;
        }

        let dateValue;
        let dateLabel;

        /* -----------------------------------------------
           OBJECT
        ----------------------------------------------- */
        if (
          typeof item === "object" &&
          !Array.isArray(item)
        ) {
          dateValue =
            item.value ??
            item.date ??
            item.as_on_date ??
            item.label ??
            "";

          dateLabel =
            item.label ??
            formatDateDisplay(
              dateValue
            );
        } else {
          /* ---------------------------------------------
             STRING DATE
          --------------------------------------------- */
          dateValue = item;
          dateLabel =
            formatDateDisplay(item);
        }

        dateValue = String(
          dateValue ?? ""
        ).trim();

        dateLabel = String(
          dateLabel ?? ""
        ).trim();

        if (!dateValue) {
          return;
        }

        /*
         * Prevent duplicate dates.
         */
        if (seen.has(dateValue)) {
          return;
        }

        seen.add(dateValue);

        result.push({
          value: dateValue,
          label:
            dateLabel ||
            formatDateDisplay(
              dateValue
            ),
          _key: `date-${dateValue}-${index}`,
        });
      }
    );

    return result;
  }, [options]);

  /* ==========================================================
     SEARCH DATE
  ========================================================== */
  const filteredDates =
    normalizedDates.filter(
      (item) =>
        item.label
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        item.value
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  /* ==========================================================
     CURRENT SELECTED DATE

     Supports value being either:

     "2026-09-20"

     OR:

     { value: "2026-09-20" }
  ========================================================== */
  const selectedValue =
    value &&
      typeof value === "object" &&
      !Array.isArray(value)
      ? String(
        value.value ??
        value.date ??
        value.as_on_date ??
        value.label ??
        ""
      )
      : String(value ?? "");

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
          padding:
            "0 30px 0 11px",
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
          textOverflow:
            "ellipsis",
        }}
      >
        {selectedValue
          ? formatDateDisplay(
            selectedValue
          )
          : "Select Date"}

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
            background:
              "#ffffff",
            border:
              "1px solid #dce3ee",
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
              padding:
                "8px 8px 6px",
              borderBottom:
                "1px solid #edf1f7",
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              onClick={(e) =>
                e.stopPropagation()
              }
              placeholder="Search date"
              autoFocus
              style={{
                width: "100%",
                height: 30,
                boxSizing:
                  "border-box",
                border:
                  "1px solid #dce3ee",
                borderRadius: 7,
                padding:
                  "0 9px",
                background:
                  "#f8fafc",
                color:
                  "#24366b",
                fontSize: 10.5,
                outline:
                  "none",
              }}
            />
          </div>

          {/* =================================================
              DATES
          ================================================= */}
          <div
            style={{
              maxHeight: 230,
              overflowY:
                "auto",
              padding:
                "4px 0",
            }}
          >
            {filteredDates.length ===
              0 ? (
              <div
                style={{
                  padding:
                    "14px 10px",
                  textAlign:
                    "center",
                  color:
                    "#94a3b8",
                  fontSize:
                    10.5,
                }}
              >
                No dates found
              </div>
            ) : (
              filteredDates.map(
                (dateOption) => {
                  const selected =
                    selectedValue ===
                    dateOption.value;

                  return (
                    <button
                      key={
                        dateOption._key
                      }
                      type="button"
                      onClick={() => {
                        /*
                         * IMPORTANT:
                         * Send the ORIGINAL
                         * backend value to API.
                         *
                         * Example:
                         * "2026-09-20"
                         */
                        onChange(
                          dateOption.value
                        );

                        setOpen(
                          false
                        );
                        setSearch("");
                      }}
                      style={{
                        width: "100%",
                        minHeight: 31,
                        padding:
                          "5px 10px",
                        border: "none",
                        background:
                          selected
                            ? "#eef2ff"
                            : "#ffffff",
                        color:
                          selected
                            ? "#243b8f"
                            : "#334155",
                        fontSize:
                          10.5,
                        fontWeight:
                          selected
                            ? 700
                            : 500,
                        cursor:
                          "pointer",
                        textAlign:
                          "left",
                      }}
                    >
                      {formatDateDisplay(
                        dateOption.value
                      )}
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
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",

        // Smooth hover effect
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
        cursor: typeof onClick === "function" ? "pointer" : "default",
      }}
      onClick={typeof onClick === "function" ? onClick : undefined}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 4px 12px rgba(15, 23, 42, 0.06)";
        e.currentTarget.style.filter = "brightness(0.99)";
      }}

      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 2px 8px rgba(15, 23, 42, 0.04)";
        e.currentTarget.style.filter = "brightness(1)";
      }}
    >
      {/* TOP */}
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
            boxShadow: "0 2px 6px rgba(15, 23, 42, 0.06)",
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

      {/* VALUE */}
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

      {/* VARIANCE */}
      <div
        style={{
          marginLeft: "46px",
          fontSize: "11px",
          color: isPositive ? "#0e9f75" : "#ef476f",
          fontWeight: 600,
          lineHeight: 1.2,
        }}
      >
        {variance !== null && variance !== undefined
          ? `${isPositive ? "▲" : "▼"} ${Math.abs(
            Number(variance)
          ).toFixed(1)}%`
          : "—"}

        {previousDate && (
          <span
            style={{
              color: "#64748b",
              fontWeight: 500,
              marginLeft: "4px",
            }}
          >
            vs {previousDate}
          </span>
        )}
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
  const hasData = Array.isArray(data) && data.length > 0;

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
   * The Payables aging API can return negative percentages for some
   * buckets (for example 181-365 Days and Above 365 Days).
   *
   * SVG strokeDasharray cannot render a negative segment length.
   * Previously those negative lengths made the donut geometry invalid,
   * which could result in only the first segment being visible.
   *
   * Use the absolute magnitude of every bucket for the donut geometry
   * and normalize the magnitudes so ALL API buckets are displayed.
   * The original API amount/percentage is still shown in the tooltip
   * and legend.
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
      onSegmentClick(normalizedData[index], index);
    }
  };

  /* ==========================================================
     GET SEGMENT POSITION
     Used to create the "explode / pop-out" effect
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

    /* Distance that the selected slice moves outward */
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
        flexDirection: legendBelow ? "column" : "row",
        alignItems: legendBelow ? "center" : "center",
        gap: legendBelow ? 24 : 20, // more gap between donut and legend
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
          {normalizedData.map((item, index) => {
            /*
             * Always use a positive geometry value.
             * This is important because the backend can return negative
             * percentages for negative aging amounts.
             */
            const weight = segmentWeights[index] || 0;

            const percent =
              totalSegmentWeight > 0
                ? weight / totalSegmentWeight
                : 0;

            const length =
              circumference * percent;

            const offset = -accumulated;

            const segmentStart = accumulated;

            accumulated += length;

            const isSelected =
              selectedIndex === index;

            const isHovered =
              hoveredIndex === index;

            /*
              Selected takes priority.
              Hover also gives the pop-out effect.
            */
            const isActive =
              isSelected || isHovered;

            return (
              <circle
                key={`donut-segment-${index}-${item.bucket_code ?? item.bucket_name ?? item.bucket ?? "segment"}`}
                cx="87.5"
                cy="87.5"
                r={radius}
                fill="none"
                stroke={
                  colors[index % colors.length]
                }
                strokeWidth={
                  isActive ? 29 : 25
                }
                strokeDasharray={`${length} ${circumference - length
                  }`}
                strokeDashoffset={offset}
                transform={getSegmentTransform(
                  segmentStart,
                  length,
                  isActive
                )}
                strokeLinecap="butt"
                style={{
                  cursor: "pointer",

                  /*
                    Selected segment becomes slightly
                    more prominent, but other segments
                    remain visible.
                  */
                  opacity:
                    selectedIndex !== null &&
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
                  setHoveredIndex(index)
                }
                onMouseLeave={() =>
                  setHoveredIndex(null)
                }
                onClick={() =>
                  handleSegmentClick(index)
                }
              />
            );
          })}
        </svg>

        {/* ===================================================
            CENTER VALUE
            Hidden ONLY when a segment is clicked/selected
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
              color: "#00000",
              pointerEvents: "none",
              transition: "opacity 0.2s ease",
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

                /*
                  Positioned similarly to the P&L
                  Expense Breakdown tooltip.
                */
                left: "50%",
                top: "50%",

                transform:
                  "translate(-50%, -50%)",

                minWidth: 180,
                background: "#ffffff",
                border: "1px solid #e5eaf2",
                borderRadius: 16,
                padding: "14px 16px",
                boxShadow:
                  "0 12px 30px rgba(24,45,80,0.16)",
                zIndex: 50,
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              {/* =================================================
                  TOOLTIP TITLE
              ================================================= */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
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
                    display: "inline-block",
                  }}
                />

                {normalizedData[hoveredIndex].bucket_name ?? normalizedData[hoveredIndex].bucket ?? normalizedData[hoveredIndex].bucket_code}
              </div>

              {/* =================================================
                  AMOUNT
              ================================================= */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
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
                    normalizedData[hoveredIndex].amount,
                    currency
                  )}
                </strong>
              </div>

              {/* =================================================
                  SHARE / PERCENTAGE
              ================================================= */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
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
                    normalizedData[hoveredIndex].percentage ?? normalizedData[hoveredIndex].percentage_of_total
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
          flex: legendBelow ? "none" : 1,
          width: legendBelow ? "100%" : "auto",
          minWidth: 0,
        }}
      >
        {normalizedData.map((item, index) => {
          const isSelected =
            selectedIndex === index;

          const isHovered =
            hoveredIndex === index;

          const isActive =
            isSelected || isHovered;

          return (
            <div
              key={`donut-legend-${index}-${item.bucket_code ?? item.bucket_name ?? item.bucket ?? "bucket"}`}
              onClick={() =>
                handleSegmentClick(index)
              }
              onMouseEnter={() =>
                setHoveredIndex(index)
              }
              onMouseLeave={() =>
                setHoveredIndex(null)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 16,
                fontSize: 12,
                color: "#334155",
                cursor: "pointer",
                padding: "3px 5px",
                borderRadius: 6,

                background: isSelected
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
                  borderRadius: "50%",
                  background:
                    colors[
                    index % colors.length
                    ],
                  display: "inline-block",
                  flexShrink: 0,

                  boxShadow: isActive
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
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: isActive
                    ? 800
                    : 700,
                }}
              >
                {item.bucket_name ?? item.bucket ?? item.bucket_code}
              </span>

              {/* Amount */}
              <strong
                style={{
                  color: "#344b8a",
                  whiteSpace: "nowrap",
                }}
              >
                {(Number(item.amount || 0) / 1000000).toFixed(2)}M
              </strong>

              {/* Percentage */}
              <span
                style={{
                  color: "#64748b",
                  minWidth: 36,
                  whiteSpace: "nowrap",
                  fontWeight: isActive
                    ? 700
                    : 500,
                }}
              >
                (
                {formatPercentage(
                  item.percentage ?? item.percentage_of_total
                )}
                )
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   TREND CHART
   ============================================================ */

function TrendChart({ data, currency, onPointClick }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const maxValue = Math.max(0, ...data.map((item) => Number(item.total_payables || 0)));
  const hasData = Array.isArray(data) && data.length > 0;

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
                  cursor:
                    typeof onPointClick === "function"
                      ? "pointer"
                      : "default",
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  if (typeof onPointClick === "function") {
                    onPointClick(item, index);
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
                        DPO
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
  const PAGE_SIZE = 7;

  useEffect(() => {
    setPage(1);
    setHoveredIndex(null);
  }, [data]);

  // Backend response:
  // label
  // total_payables
  // percentage_of_total
  //
  // Normalize here so the existing chart can work directly
  // with the backend response without changing the API.
  const chartData = Array.isArray(data)
    ? data.map((item, index) => ({
      ...item,
      name:
        item.name ??
        item.label ??
        `Division ${index + 1}`,
      amount: Number(
        item.amount ??
        item.total_payables ??
        0
      ),
      percentage: Number(
        item.percentage ??
        item.percentage_of_total ??
        0
      ),
    }))
    : [];

  const totalPages = Math.max(
    1,
    Math.ceil(
      chartData.length / PAGE_SIZE
    )
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const paginatedChartData =
    chartData.slice(
      (safePage - 1) * PAGE_SIZE,
      safePage * PAGE_SIZE
    );

  // Use absolute values so negative payables do not create
  // invalid negative CSS widths.
  const max = Math.max(
    0,
    ...paginatedChartData.map(
      (item) =>
        Math.abs(
          Number(item.amount || 0)
        )
    )
  );

  if (chartData.length === 0) {
    return (
      <div
        style={{
          minHeight: 150,
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
    <div style={{ paddingTop: 5 }}>
      {paginatedChartData.map(
        (item, index) => {
          const amount = Number(
            item.amount || 0
          );

          const percentage = Number(
            item.percentage || 0
          );

          const width =
            max > 0
              ? (Math.abs(amount) / max) *
              100
              : 0;

          const isNegative =
            amount < 0;

          const isHovered =
            hoveredIndex === index;

          return (
            <div
              key={
                item.value != null
                  ? `division-${item.value}`
                  : item.id != null
                    ? `division-${item.id}`
                    : `division-${item.name || "item"}-${index}`
              }
              style={{
                display: "grid",
                gridTemplateColumns:
                  "70px 1fr 100px",
                alignItems: "center",
                gap: 8,

                // Gap between each horizontal bar
                marginBottom:
                  index ===
                    paginatedChartData.length - 1
                    ? 0
                    : 25,

                position: "relative",
                cursor:
                  typeof onRowClick === "function"
                    ? "pointer"
                    : "default",
              }}
              onMouseEnter={() =>
                setHoveredIndex(index)
              }
              onMouseLeave={() =>
                setHoveredIndex(null)
              }
              onClick={() => {
                if (typeof onRowClick === "function") {
                  onRowClick(item, index);
                }
              }}
            >
              {/* Division Name */}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#334155",
                  whiteSpace:
                    "nowrap",
                  overflow: "hidden",
                  textOverflow:
                    "ellipsis",
                }}
                title={item.name}
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

                    // Keep the existing blue style.
                    // Negative values are still displayed
                    // as a valid bar using their absolute magnitude.
                    background: isNegative
                      ? "#dc2626"
                      : "#1464e8",

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
                  color: isNegative
                    ? "#dc2626"
                    : "#27438b",
                  textAlign: "right",
                }}
              >
                {formatPayablesCompact(
                  amount,
                  ""
                ).replace(
                  /^[A-Z]{3}\s*/,
                  ""
                )}{" "}

                <span
                  style={{
                    color: isNegative
                      ? "#dc2626"
                      : "#64748b",
                    fontWeight: 500,
                  }}
                >
                  (
                  {formatPercentage(
                    percentage
                  )}
                  )
                </span>
              </div>

              {/* Hover Tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top:
                      index ===
                        paginatedChartData.length -
                        1
                        ? "auto"
                        : "100%",
                    bottom:
                      index ===
                        paginatedChartData.length -
                        1
                        ? "100%"
                        : "auto",
                    transform:
                      "translateX(-50%)",

                    marginTop:
                      index ===
                        paginatedChartData.length -
                        1
                        ? 0
                        : 6,

                    marginBottom:
                      index ===
                        paginatedChartData.length -
                        1
                        ? 6
                        : 0,

                    zIndex: 9999,
                    background: "#ffffff",
                    border:
                      "1px solid #dbe3ef",
                    borderRadius: 7,
                    boxShadow:
                      "0 5px 18px rgba(15, 23, 42, 0.16)",
                    padding:
                      "8px 11px",
                    minWidth: 165,
                    whiteSpace:
                      "nowrap",
                    pointerEvents:
                      "none",
                  }}
                >
                  {/* Division */}
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

                  {/* Payables */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: 18,
                      fontSize: 11,
                      fontWeight: 900,
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        color: "#64748b",
                      }}
                    >
                      Payables
                    </span>

                    <span
                      style={{
                        color: isNegative
                          ? "#dc2626"
                          : "#27438b",
                        fontWeight: 800,
                      }}
                    >
                      {formatPayablesCompact(
                        amount,
                        currency
                      )}
                    </span>
                  </div>

                  {/* Percentage */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: 18,
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    <span
                      style={{
                        color: "#64748b",
                      }}
                    >
                      Percentage
                    </span>

                    <span
                      style={{
                        color: isNegative
                          ? "#dc2626"
                          : "#27438b",
                        fontWeight: 800,
                      }}
                    >
                      {formatPercentage(
                        percentage
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        }
      )}

      {/* =====================================================
          PAGINATION
          Same style as Sub-Division pagination
      ===================================================== */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 5,
            marginTop: 8,
          }}
        >
          {/* Showing X - Y of Total */}
          <div
            style={{
              fontSize: 10,
              color: "#64748b",
              fontWeight: 500,
              marginRight: 4,
              whiteSpace: "nowrap",
            }}
          >
            Showing{" "}
            {(safePage - 1) * PAGE_SIZE + 1}{" "}
            -{" "}
            {Math.min(
              safePage * PAGE_SIZE,
              chartData.length
            )}{" "}
            of {chartData.length}
          </div>

          {/* FIRST PAGE */}
          <button
            type="button"
            onClick={() => {
              setPage(1);
              setHoveredIndex(null);
            }}
            disabled={safePage === 1}
            title="First page"
            style={{
              width: 28,
              height: 26,
              border:
                "1px solid #dce3ee",
              borderRadius: 5,
              background:
                safePage === 1
                  ? "#f8fafc"
                  : "#ffffff",
              color:
                safePage === 1
                  ? "#cbd5e1"
                  : "#173b8f",
              fontSize: 13,
              fontWeight: 800,
              cursor:
                safePage === 1
                  ? "default"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            «
          </button>

          {/* PREVIOUS PAGE */}
          <button
            type="button"
            onClick={() => {
              setPage((prev) =>
                Math.max(
                  1,
                  prev - 1
                )
              );
              setHoveredIndex(null);
            }}
            disabled={safePage === 1}
            title="Previous page"
            style={{
              width: 28,
              height: 26,
              border:
                "1px solid #dce3ee",
              borderRadius: 5,
              background:
                safePage === 1
                  ? "#f8fafc"
                  : "#ffffff",
              color:
                safePage === 1
                  ? "#cbd5e1"
                  : "#173b8f",
              fontSize: 13,
              fontWeight: 800,
              cursor:
                safePage === 1
                  ? "default"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            ‹
          </button>

          {/* CURRENT PAGE */}
          <button
            type="button"
            disabled
            style={{
              width: 28,
              height: 26,
              border:
                "1px solid #173b8f",
              borderRadius: 5,
              background: "#173b8f",
              color: "#ffffff",
              fontSize: 10,
              fontWeight: 800,
              cursor: "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            {safePage}
          </button>

          {/* NEXT PAGE */}
          <button
            type="button"
            onClick={() => {
              setPage((prev) =>
                Math.min(
                  totalPages,
                  prev + 1
                )
              );
              setHoveredIndex(null);
            }}
            disabled={
              safePage ===
              totalPages
            }
            title="Next page"
            style={{
              width: 28,
              height: 26,
              border:
                "1px solid #dce3ee",
              borderRadius: 5,
              background:
                safePage ===
                  totalPages
                  ? "#f8fafc"
                  : "#ffffff",
              color:
                safePage ===
                  totalPages
                  ? "#cbd5e1"
                  : "#173b8f",
              fontSize: 13,
              fontWeight: 800,
              cursor:
                safePage ===
                  totalPages
                  ? "default"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            ›
          </button>

          {/* LAST PAGE */}
          <button
            type="button"
            onClick={() => {
              setPage(totalPages);
              setHoveredIndex(null);
            }}
            disabled={
              safePage ===
              totalPages
            }
            title="Last page"
            style={{
              width: 28,
              height: 26,
              border:
                "1px solid #dce3ee",
              borderRadius: 5,
              background:
                safePage ===
                  totalPages
                  ? "#f8fafc"
                  : "#ffffff",
              color:
                safePage ===
                  totalPages
                  ? "#cbd5e1"
                  : "#173b8f",
              fontSize: 13,
              fontWeight: 800,
              cursor:
                safePage ===
                  totalPages
                  ? "default"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            »
          </button>
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
  emptyMessage = "No data available",

  // --------------------------------------------------
  // Optional table features
  // These remain OFF by default so other tables
  // are not affected.
  // --------------------------------------------------
  pagination = false,
  pageSize = 9,

  // Optional total/footer row rendered before the pagination controls.
  totalRow = null,

  // Remove year from month headers
  removeYearFromHeader = false,

  // Extra spacing between month columns
  monthColumnGap = false,

  // Remove decimal values
  removeDecimals = false,

  // Shorten long Legal Entity values
  truncateLegalEntity = false,
  legalEntityMaxLength = 18,

  // Negative values are red in every DataTable by default.
  negativeValuesRed = true,

  // AED / AED Millions toggle
  currencyToggle = false,
  currencyMode: controlledCurrencyMode = null,
  onCurrencyModeChange = null,
  showCurrencyToggle = true,
  onRowClick = null,
  onCellClick = null,
}) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const [internalCurrencyMode, setInternalCurrencyMode] =
    React.useState("AED");

  const currencyMode =
    controlledCurrencyMode || internalCurrencyMode;

  const setCurrencyMode = (nextMode) => {
    setInternalCurrencyMode(nextMode);
    if (typeof onCurrencyModeChange === "function") {
      onCurrencyModeChange(nextMode);
    }
  };

  // --------------------------------------------------
  // Reset pagination when table data changes
  // --------------------------------------------------
  React.useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  const safeRows = Array.isArray(rows) ? rows : [];

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------
  const totalPages = pagination
    ? Math.max(
      1,
      Math.ceil(safeRows.length / pageSize)
    )
    : 1;

  const paginatedRows = pagination
    ? safeRows.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    )
    : safeRows;

  const goToPage = (page) => {
    const nextPage = Math.min(
      Math.max(page, 1),
      totalPages
    );

    setCurrentPage(nextPage);
  };

  // --------------------------------------------------
  // Header formatter
  // Example:
  // Jan-26 -> Jan
  // Feb-26 -> Feb
  // --------------------------------------------------
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

  // --------------------------------------------------
  // Detect numeric values
  // --------------------------------------------------
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
        Number.isFinite(Number(cleaned))
      );
    }

    return false;
  };

  // --------------------------------------------------
  // Convert value to number
  // --------------------------------------------------
  const getNumericValue = (value) => {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      const cleaned = value
        .replace(/,/g, "")
        .replace(
          /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
          ""
        )
        .replace(/%$/, "")
        .trim();

      const number = Number(cleaned);

      return Number.isFinite(number)
        ? number
        : null;
    }

    return null;
  };

  // --------------------------------------------------
  // Format numeric value
  // --------------------------------------------------
  const formatNumericValue = (value) => {
    const number = getNumericValue(value);

    if (number === null) {
      return value;
    }

    let displayValue = number;

    // AED Millions
    if (currencyMode === "AED_MILLIONS") {
      displayValue = number / 1000000;

      return `AED ${displayValue.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }
      )}M`;
    }

    // Normal AED
    return displayValue.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    );
  };

  // --------------------------------------------------
  // Shorten Legal Entity
  // --------------------------------------------------
  const formatLegalEntity = (value) => {
    if (
      !truncateLegalEntity ||
      typeof value !== "string"
    ) {
      return {
        display: value,
        title: undefined,
      };
    }

    if (
      value.length <= legalEntityMaxLength
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
          Math.max(1, legalEntityMaxLength - 3)
        ) + "...",
      title: value,
    };
  };

  // --------------------------------------------------
  // Detect Legal Entity column
  // --------------------------------------------------
  const isLegalEntityColumn = (column) => {
    const key = String(
      column?.key || ""
    ).toLowerCase();

    const label = String(
      column?.label || ""
    ).toLowerCase();

    return (
      key === "legal_entity" ||
      key === "legalentity" ||
      key === "legal_entity_name" ||
      label === "legal entity" ||
      label === "legal entity name"
    );
  };

  // --------------------------------------------------
  // Detect month column
  // --------------------------------------------------
  const isMonthColumn = (column) => {
    const key = String(
      column?.key || ""
    ).toLowerCase();

    const label = String(
      column?.label || ""
    ).toLowerCase();

    return (
      key.includes("month") ||
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

  // --------------------------------------------------
  // Render cell value
  // --------------------------------------------------
  const renderCellValue = (
    row,
    column
  ) => {
    const value = column.render
      ? column.render(row)
      : row[column.key];

    // ----------------------------------------------
    // Legal Entity
    // ----------------------------------------------
    if (
      truncateLegalEntity &&
      isLegalEntityColumn(column) &&
      typeof value === "string"
    ) {
      return formatLegalEntity(value);
    }

    // ----------------------------------------------
    // Numeric values
    // ----------------------------------------------
    if (
      removeDecimals &&
      isNumericValue(value)
    ) {
      const number =
        getNumericValue(value);

      return {
        display:
          currencyToggle &&
            currencyMode === "AED_MILLIONS"
            ? formatNumericValue(value)
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

    // ----------------------------------------------
    // Currency toggle
    // ----------------------------------------------
    if (
      currencyToggle &&
      isNumericValue(value)
    ) {
      return {
        display:
          formatNumericValue(value),
        title: undefined,
      };
    }

    // ----------------------------------------------
    // Existing currency removal
    // ----------------------------------------------
    if (typeof value === "string") {
      return {
        display: value
          .replace(
            /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
            ""
          )
          .replace(/^#\s*/, ""),
        title: undefined,
      };
    }

    return {
      display: value,
      title: undefined,
    };
  };

  return (
    <div style={{ width: "100%" }}>

      {/* ==================================================
          TABLE HEADER CONTROLS
          ================================================== */}
      {currencyToggle && showCurrencyToggle && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid #dbe3ef",
              borderRadius: 5,
              padding: 2,
              background: "#f8fafc",
              gap: 2,
            }}
          >
            {/* AED */}
            <button
              type="button"
              onClick={() =>
                setCurrencyMode("AED")
              }
              style={{
                border: "none",
                borderRadius: 4,
                padding: "5px 10px",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                background:
                  currencyMode === "AED"
                    ? BLUE
                    : "transparent",
                color:
                  currencyMode === "AED"
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
                border: "none",
                borderRadius: 4,
                padding: "5px 10px",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
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
          TABLE
          ================================================== */}
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
                    background: "#eef4ff",
                    color: BLUE,
                    fontWeight: 700,

                    padding:
                      monthColumnGap &&
                        isMonthColumn(column)
                        ? "7px 14px"
                        : compactRows
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
                  {formatHeader(
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding:
                      "18px 10px",
                    textAlign:
                      "center",
                    color: MUTED,
                    fontSize: 11,
                    fontWeight: 600,
                    borderBottom:
                      "none",
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedRows.map(
                (row, rowIndex) => (
                  <tr
                    key={
                      row.id ||
                      row.subdivision_id ||
                      rowIndex
                    }
                    onClick={
                      typeof onRowClick === "function"
                        ? () => onRowClick(row, rowIndex)
                        : undefined
                    }
                    style={{
                      cursor:
                        typeof onRowClick === "function"
                          ? "pointer"
                          : "default",
                    }}
                  >
                    {columns.map(
                      (column) => {
                        const cell =
                          renderCellValue(
                            row,
                            column
                          );

                        const rawNumericSource =
                          row?.[column.key] ??
                          (column.render
                            ? column.render(row)
                            : undefined);

                        const numericValue =
                          getNumericValue(rawNumericSource);

                        const isNegative =
                          negativeValuesRed &&
                          numericValue !==
                          null &&
                          numericValue < 0;

                        return (
                          <td
                            key={
                              column.key
                            }
                            title={
                              cell?.title
                            }
                            onClick={
                              typeof onCellClick === "function"
                                ? () => onCellClick(row, column, rowIndex)
                                : undefined
                            }
                            style={{
                              padding:
                                monthColumnGap &&
                                  isMonthColumn(
                                    column
                                  )
                                  ? rowGap
                                    ? "13px 14px"
                                    : compactRows
                                      ? "3px 14px"
                                      : "6px 14px"
                                  : rowGap
                                    ? "13px 4px"
                                    : compactRows
                                      ? "3px 4px"
                                      : "6px 4px",

                              lineHeight:
                                rowGap
                                  ? "17px"
                                  : compactRows
                                    ? "14px"
                                    : "normal",

                              borderBottom:
                                rowIndex ===
                                  paginatedRows.length -
                                  1
                                  ? "none"
                                  : "1px solid #edf1f6",

                              color:
                                isNegative
                                  ? "#dc2626"
                                  : "#334155",

                              fontWeight: 700,

                              textAlign:
                                column.align ||
                                "left",

                              whiteSpace:
                                fitColumns
                                  ? "normal"
                                  : "nowrap",

                              overflow:
                                fitColumns
                                  ? "hidden"
                                  : "visible",

                              textOverflow:
                                fitColumns
                                  ? "ellipsis"
                                  : "clip",

                              maxWidth:
                                truncateLegalEntity &&
                                  isLegalEntityColumn(
                                    column
                                  )
                                  ? 180
                                  : undefined,
                            }}
                          >
                            {cell?.display}
                          </td>
                        );
                      }
                    )}
                  </tr>
                )
              )
            )}

            {totalRow && (
              <tr>
                {columns.map((column) => {
                  const cell = renderCellValue(totalRow, column);

                  const rawNumericSource =
                    totalRow?.[column.key] ??
                    (column.render
                      ? column.render(totalRow)
                      : undefined);

                  const numericValue =
                    getNumericValue(rawNumericSource);

                  const isNegative =
                    negativeValuesRed &&
                    numericValue !== null &&
                    numericValue < 0;

                  return (
                    <td
                      key={`total-${column.key}`}
                      title={cell?.title}
                      style={{
                        padding:
                          monthColumnGap && isMonthColumn(column)
                            ? "8px 14px"
                            : "8px 4px",
                        borderTop: "1px solid #d7e1ef",
                        borderBottom: "none",
                        background: "#f8fbff",
                        color: isNegative ? "#dc2626" : BLUE,
                        fontWeight: 800,
                        textAlign: column.align || "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cell?.display}
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==================================================
          PAGINATION
          ================================================== */}
      {pagination &&
        safeRows.length > pageSize && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              marginTop: 10,
              padding: "0 2px",
            }}
          >
            {/* Showing */}
            <div
              style={{
                fontSize: 10,
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              Showing{" "}
              {Math.min(
                (currentPage - 1) *
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
              {safeRows.length}
            </div>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: 4,
              }}
            >
              {/* First */}
              <button
                type="button"
                onClick={() =>
                  goToPage(1)
                }
                disabled={
                  currentPage === 1
                }
                style={{
                  width: 28,
                  height: 26,
                  border:
                    "1px solid #dbe3ef",
                  borderRadius: 4,
                  background:
                    currentPage ===
                      1
                      ? "#f8fafc"
                      : "#ffffff",
                  color:
                    currentPage ===
                      1
                      ? "#cbd5e1"
                      : "#475569",
                  cursor:
                    currentPage ===
                      1
                      ? "not-allowed"
                      : "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                }}
                title="First page"
              >
                «
              </button>

              {/* Previous */}
              <button
                type="button"
                onClick={() =>
                  goToPage(
                    currentPage - 1
                  )
                }
                disabled={
                  currentPage === 1
                }
                style={{
                  width: 28,
                  height: 26,
                  border:
                    "1px solid #dbe3ef",
                  borderRadius: 4,
                  background:
                    currentPage ===
                      1
                      ? "#f8fafc"
                      : "#ffffff",
                  color:
                    currentPage ===
                      1
                      ? "#cbd5e1"
                      : "#475569",
                  cursor:
                    currentPage ===
                      1
                      ? "not-allowed"
                      : "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                }}
                title="Previous page"
              >
                ‹
              </button>

              {/* Current */}
              <div
                style={{
                  minWidth: 28,
                  height: 26,
                  padding: "0 7px",
                  borderRadius: 4,
                  background: BLUE,
                  color: "#ffffff",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {currentPage}
              </div>

              {/* Next */}
              <button
                type="button"
                onClick={() =>
                  goToPage(
                    currentPage + 1
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                style={{
                  width: 28,
                  height: 26,
                  border:
                    "1px solid #dbe3ef",
                  borderRadius: 4,
                  background:
                    currentPage ===
                      totalPages
                      ? "#f8fafc"
                      : "#ffffff",
                  color:
                    currentPage ===
                      totalPages
                      ? "#cbd5e1"
                      : "#475569",
                  cursor:
                    currentPage ===
                      totalPages
                      ? "not-allowed"
                      : "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                }}
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
                style={{
                  width: 28,
                  height: 26,
                  border:
                    "1px solid #dbe3ef",
                  borderRadius: 4,
                  background:
                    currentPage ===
                      totalPages
                      ? "#f8fafc"
                      : "#ffffff",
                  color:
                    currentPage ===
                      totalPages
                      ? "#cbd5e1"
                      : "#475569",
                  cursor:
                    currentPage ===
                      totalPages
                      ? "not-allowed"
                      : "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                }}
                title="Last page"
              >
                »
              </button>
            </div>
          </div>
        )}
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
              Payables Dashboard
            </h1>

            <div
              style={{
                marginTop: 3,
                color: "#66789e",
                fontSize: 12,
              }}
            >
              Track payables, aging, overdue exposure and payment
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
            options={getOptionLabels(filterOptions.legal_groups)}
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
            options={getOptionLabels(filterOptions.legal_entities)}
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
            options={getOptionLabels(filterOptions.parent_divisions)}
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
            options={getOptionLabels(filterOptions.sub_divisions)}
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
            options={filterOptions.as_on_dates || []}
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

        {/* ==================================================
            KPI CARDS
            ================================================== */}

        <div
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 9,
            marginBottom: 12,
          }}
        >
          <KpiCard
            title="Total Payables"
            value={kpis.total_payables}
            variance={kpis.total_change_percentage}
            previousDate={kpis.previous_as_on_date}
            currency={currency}
            icon="▤"
            iconBg="#F5F9FF"
            iconColor="#2563eb"
          />

          <KpiCard
            title="Current Payables"
            value={kpis.current_payables}
            variance={kpis.current_change_percentage}
            previousDate={kpis.previous_as_on_date}
            currency={currency}
            icon="▣"
            iconBg="#F3FCF6"
            iconColor="#0e9f75"
          />

          <KpiCard
            title="Overdue Payables"
            value={kpis.overdue_payables}
            variance={kpis.overdue_change_percentage}
            previousDate={kpis.previous_as_on_date}
            currency={currency}
            icon="⌛"
            iconBg="#FFF9F3"
            iconColor="#f59e0b"
          // onClick={handleOverdueDrillDown}
          />

          <KpiCard
            title="Overdue > 90 Days"
            value={kpis.overdue_above_90}
            variance={kpis.overdue_above_90_change_percentage}
            previousDate={kpis.previous_as_on_date}
            currency={currency}
            icon="!"
            iconBg="#FFF7FA"
            iconColor="#ef476f"
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
              <DonutChart
                data={data.agingSummary}
                total={kpis.total_payables}
                currency={currency}
                centerLabel="Total"
                onSegmentClick={handleAgingDrillDown}
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
              <TrendChart
                data={data.trend}
                currency={currency}
                onPointClick={handleTrendDrillDown}
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
              <ParentDivisionChart
                data={data.parentDivision}
                currency={currency}
                onRowClick={handleParentDivisionDrillDown}
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

            <DataTable
              columns={supplierColumns}
              rows={data.topSuppliers}
              fitColumns
              compactRows
              onRowClick={handleSupplierDrillDown}
            />
            {supplierRows.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 55px",
                  alignItems: "center",
                  marginTop: 7,
                  padding: "0 4px",
                  color: BLUE,
                  fontSize: 12,
                  fontWeight: 700,
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



            <DonutChart
              data={data.overdueSummary}
              total={kpis.overdue_payables}
              currency={currency}
              centerLabel="Overdue"
              legendBelow
              onSegmentClick={handleAgingDrillDown}
            />
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
            <DataTable
              columns={subDivisionColumns}
              rows={data.subDivision}
              onRowClick={handleSubdivisionDrillDown}
              pagination={true}
              pageSize={10}
              fitColumns
              rowGap
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
            onCellClick={(row, column) => {
              if (MONTHS.includes(column?.key)) {
                handleMoMDrillDown(row, column.key);
              }
            }} />

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payables-view-all-title"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "96vw",
        maxWidth: 1540,
        height: "94vh",
        maxHeight: 900,
        background: "#f8fafc",
        border: "1px solid #dbe3ef",
        borderRadius: 12,
        boxShadow: "0 24px 70px rgba(15, 23, 42, 0.28)",
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
          background: "#ffffff",
          borderBottom: "1px solid #e3e9f2",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            id="payables-view-all-title"
            style={{
              color: "#142b6f",
              fontSize: 19,
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
              fontSize: 10,
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
          border: "1px solid #e5eaf2",
          borderRadius: 10,
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
              }))
            }
          />

          {/* ==================================================
        LEGAL ENTITY
    ================================================== */}

          <FilterSelect
            label="Legal Entity"
            value={viewFilters.legal_entities}
            options={viewFilterOptions.legal_entities}
            multiple
            onChange={(value) =>
              setViewFilters((prev) => ({
                ...prev,
                legal_entities: value,
              }))
            }
          />

          {/* ==================================================
        PARENT DIVISION
    ================================================== */}

          <FilterSelect
            label="Parent Division"
            value={viewFilters.parent_divisions}
            options={viewFilterOptions.parent_divisions}
            multiple
            onChange={(value) =>
              setViewFilters((prev) => ({
                ...prev,
                parent_divisions: value,
              }))
            }
          />

          {/* ==================================================
        SUB-DIVISION
    ================================================== */}

          <FilterSelect
            label="Sub-Division"
            value={viewFilters.sub_divisions}
            options={viewFilterOptions.sub_divisions}
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
            onChange={(value) =>
              setViewFilters((prev) => ({
                ...prev,
                as_on_date: value,
              }))
            }
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
            iconBackground="#e5faf2"
            iconColor="#149b6f"
            titleColor="#149b6f"
          />

          <SummaryCard
            icon="▤"
            title={
              hasBackendSummary
                ? "Current"
                : "Current (Page)"
            }
            value={currentPayables}
            iconBackground="#e5faf2"
            iconColor="#149b6f"
            titleColor="#149b6f"
          />

          <SummaryCard
            icon="⌛"
            title={
              hasBackendSummary
                ? "Overdue"
                : "Overdue (Page)"
            }
            value={overduePayables}
            iconBackground="#fff2df"
            iconColor="#ed8a17"
            titleColor="#ed8a17"
          />

          <SummaryCard
            icon="!"
            title={
              hasBackendSummary
                ? "Overdue > 90 Days"
                : "Overdue > 90 Days (Page)"
            }
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
  );
}














