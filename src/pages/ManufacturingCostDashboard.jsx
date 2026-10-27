
// import React, { useMemo, useState } from "react";
// import { createPortal } from "react-dom";
// import { Maximize2, Minimize2, MoreVertical, X } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { fetchPLDirectCostBreakdown, fetchPLDirectCostDetail } from "../services/plApi";
// import {
//     getManufacturingFilterOptions,
//     getManufacturingDashboard,
//     getManufacturingSummary,
//     getManufacturingViewAll,
//     getManufacturingHierarchyCategoryBreakdown,
//     getManufacturingHierarchyCategoryDetail,
//     getManufacturingMonthlyByDimension,
//     exportManufacturingExcel,
//     exportManufacturingPDF,
// } from "../api/manufacturingApi";
// import {
//     ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
//     Tooltip, Area
// } from "recharts";

// /**
//  * ManufacturingCostDashboard.jsx
//  * Manufacturing Cost & Production Performance dashboard.
//  * Uses the documented /api/manufacturing endpoints.
//  * Keeps changes scoped to this dashboard component.
//  */

// // Shared visual tokens aligned with the Sales Revenue page.
// const COLORS = {
//     navy: "#0B2E6F", blue: "#5B3FE4", muted: "#64748b", border: "#e2e8f0",
//     green: "#10b981", purple: "#8b5cf6", orange: "#f59e0b", red: "#dc2626",
//     teal: "#14b8a6", panel: "#ffffff", page: "#f8fafc"
// };

// const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// const monthsForYear = (year) => monthNames.map((month) => `${month}-${String(year || new Date().getFullYear()).slice(-2)}`);
// const monthIndexFromPeriod = (value) => {
//     const match = String(value ?? "").trim().match(/^([A-Za-z]{3,})[- /,]?(\\d{2,4})?$/);
//     return match ? monthNames.findIndex((month) => month.toLowerCase() === match[1].slice(0, 3).toLowerCase()) : -1;
// };
// const periodYearFromPeriod = (value, fallbackYear) => {
//     const match = String(value ?? "").trim().match(/^([A-Za-z]{3,})[- /,]?(\\d{2,4})?$/);
//     if (!match?.[2]) return Number(fallbackYear);
//     return Number(match[2].length === 2 ? `20${match[2]}` : match[2]);
// };
// const sortPeriodsChronologically = (items, year) => {
//     const labels = asArray(items).map(labelOf).filter(Boolean);
//     return [...new Set(labels)].sort((a, b) => {
//         const ay = periodYearFromPeriod(a, year), by = periodYearFromPeriod(b, year);
//         return ay - by || monthIndexFromPeriod(a) - monthIndexFromPeriod(b);
//     });
// };
// const numberOrNull = (value) => value === null || value === undefined || value === "" || !Number.isFinite(Number(value)) ? null : Number(value);
// const first = (obj, keys, fallback = null) => {
//     for (const key of keys) if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
//     return fallback;
// };
// const asArray = (value) => Array.isArray(value) ? value : Array.isArray(value?.rows) ? value.rows : Array.isArray(value?.data) ? value.data : [];
// const labelOf = (item) => typeof item === "string" ? item : String(first(item, ["name", "label", "title", "display_name", "legal_group_name", "legal_entity_name", "parent_division_name", "subdivision_name", "period_name", "value"], ""));
// const idOf = (item) => typeof item === "string" ? item : first(item, ["id", "value", "code", "legal_group_id", "legal_entity_id", "parent_division_id", "subdivision_id"], "");
// const withoutAllOptions = (items) => asArray(items).filter((item) => !/^all(?:\s+.*)?$/i.test(labelOf(item).trim()));
// const normalizeComparison = (row, phase) => {
//     const nested = row?.[phase] || row?.[phase.toUpperCase()] || {};
//     const get = (keys) => numberOrNull(first(nested, keys, first(row, keys.map((k) => `${phase}_${k}`))));
//     return {
//         actual: get(["actual", "actual_reporting_currency", "actual_value", "actual_amount"]),
//         target: get(["target", "budget", "target_reporting_currency", "target_value", "budget_amount", "target_amount"]),
//         variance: get(["variance", "variance_reporting_currency", "variance_amount", "actual_variance"]),
//         variancePct: numberOrNull(first(nested, ["variance_pct"], first(row, [`${phase}_variance_pct`, "variance_pct"]))),
//         variancePp: numberOrNull(first(nested, ["variance_pp"], first(row, [`${phase}_variance_pp`, "variance_pp"]))),
//         varianceStatus: first(nested, ["variance_status"], first(row, [`${phase}_variance_status`, "variance_status"]))
//     };
// };
// const normalizeBreakdownRow = (row) => {
//     const category = String(first(row, ["category", "category_name", "account_name", "account_group", "account_code", "name", "label"], "Unnamed category"));
//     const ptd = normalizeComparison(row, "ptd");
//     const ytd = normalizeComparison(row, "ytd");
//     return {
//         category,
//         legalEntity: String(first(row, ["legal_entity_name", "legal_entity", "entity_name", "legalEntityName"], "—")),
//         parentDivision: String(first(row, ["parent_division_name", "parent_division", "parentDivisionName"], "—")),
//         subDivision: String(first(row, ["subdivision_name", "sub_division_name", "subdivision", "sub_division", "subDivisionName"], "—")),
//         accountCode: String(first(row, ["account_code", "accountCode", "gl_code", "gl_account_code", "account_number", "code"], "—")),
//         accountName: String(first(row, ["account_name", "accountName", "gl_name", "gl_account_name", "account_description", "name"], category)),
//         actualPtd: ptd.actual, targetPtd: ptd.target, variancePtd: ptd.variance ?? (ptd.actual != null && ptd.target != null ? ptd.actual - ptd.target : null),
//         varianceStatusPtd: ptd.varianceStatus,
//         actualYtd: ytd.actual, targetYtd: ytd.target, varianceYtd: ytd.variance ?? (ytd.actual != null && ytd.target != null ? ytd.actual - ytd.target : null),
//         varianceStatusYtd: ytd.varianceStatus, raw: row
//     };
// };
// const FILTER_DEFAULTS = { legalGroup: [], legalEntity: [], parent: [], sub: [], year: String(new Date().getFullYear()), period: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date().getMonth()]}-${String(new Date().getFullYear()).slice(-2)}`, currency: "AED" };
// const filterParamKeys = { legalGroup: "legal_group_id", legalEntity: "legal_entity_id", parent: "parent_division_id", sub: "subdivision_id" };
// const previousPeriodName = (period, year) => {
//     const normalizedPeriod = String(period || "").trim();
//     // Handles the API's standard "Oct-26" value and month-name variants.
//     const match = normalizedPeriod.match(/^([A-Za-z]+)[- ,/]?(\d{2,4})?$/);
//     const monthToken = String(match?.[1] || "").slice(0, 3).toLowerCase();
//     const index = monthNames.findIndex((m) => m.toLowerCase() === monthToken);
//     if (index < 0) return null;
//     const prevIndex = (index + 11) % 12;
//     const rawYear = year || (match?.[2]
//         ? (String(match[2]).length === 2 ? `20${match[2]}` : match[2])
//         : new Date().getFullYear());
//     const selectedYear = Number(rawYear);
//     const y = selectedYear - (index === 0 ? 1 : 0);
//     return `${monthNames[prevIndex]}-${String(y).slice(-2)}`;
// };

// const buildQuery = (filters) => {
//     const params = new URLSearchParams();
//     Object.entries(filterParamKeys).forEach(([key, param]) => { const values = Array.isArray(filters[key]) ? filters[key] : (filters[key] ? [filters[key]] : []); values.forEach((value) => params.append(param, String(value))); });
//     params.set("year", String(filters.year));
//     params.set("period_name", String(filters.period));
//     params.set("reporting_currency", filters.currency || "AED");
//     return params.toString();
// };
// // API calls are centralized in src/api/manufacturingApi.js.
// // Keep this adapter so component error handling remains unchanged.
// function unwrapApiResponse(response) {
//     return response?.data ?? response;
// }
// function parseManufacturingFilterOptions(response) {
//     const data = unwrapApiResponse(response);
//     const src = data?.options || data?.filters || data?.data || data || {};
//     return {
//         legalGroups: withoutAllOptions(first(src, ["legal_groups", "legalGroups", "legal_group_options"], [])),
//         legalEntities: withoutAllOptions(first(src, ["legal_entities", "legalEntities", "legal_entity_options"], [])),
//         parentDivisions: withoutAllOptions(first(src, ["parent_divisions", "parentDivisions", "parent_division_options"], [])),
//         subdivisions: withoutAllOptions(first(src, ["subdivisions", "sub_divisions", "subDivisions", "subdivision_options"], [])),
//         years: asArray(first(src, ["years", "year_options"], [])),
//         periods: asArray(first(src, ["periods", "period_names", "period_options"], [])),
//     };
// }
// function manufacturingFilters(filters = {}) {
//     return {
//         legal_group_id: Array.isArray(filters.legalGroup) ? filters.legalGroup : (filters.legalGroup ? [filters.legalGroup] : []),
//         legal_entity_id: Array.isArray(filters.legalEntity) ? filters.legalEntity : (filters.legalEntity ? [filters.legalEntity] : []),
//         parent_division_id: Array.isArray(filters.parent) ? filters.parent : (filters.parent ? [filters.parent] : []),
//         subdivision_id: Array.isArray(filters.sub) ? filters.sub : (filters.sub ? [filters.sub] : []),
//         year: filters.year,
//         period_name: filters.period,
//         reporting_currency: filters.currency || "AED",
//     };
// }
// const COLORS_BY_CATEGORY = ["#14b8a6", "#8b5cf6", "#f59e0b", "#f97316", "#2563eb", "#0ea5e9"];
// const fmtM = (n, currency = "AED") => `${currency} ${Number(n).toFixed(2)}M`;
// const fmtNum = (n) => {
//     const numeric = Number(n);
//     if (!Number.isFinite(numeric)) return "—";
//     // Avoid showing a rounded negative zero. Preserve the explicit 0.00 convention
//     // for tiny amounts that round to zero; other amounts retain the existing whole-AED format.
//     const rounded = Math.round(numeric);
//     if (rounded === 0 && (numeric !== 0 || Object.is(numeric, -0))) return "0.00";
//     return (Object.is(rounded, -0) || rounded === 0 ? 0 : rounded).toLocaleString("en-US", { maximumFractionDigits: 0 });
// };
// const isFavorableStatus = (status) => {
//     const value = String(status ?? "").toLowerCase().replace(/[_-]+/g, " ").trim();
//     if (!value) return null;
//     if (/unfavo[u]?rable|\bunfavourable\b|\bnegative\b|\bbelow target\b|\bunder recovery\b|\bmiss\b/.test(value)) return false;
//     if (/favo[u]?rable|\brecovery\b|\bpositive\b|\bon target\b|\bwithin target\b/.test(value)) return true;
//     return null;
// };
// const varianceColor = (status, variance, lowerIsBetter = true) => {
//     const apiFavorable = isFavorableStatus(status);
//     const favorable = apiFavorable == null
//         ? (variance == null ? null : (lowerIsBetter ? variance <= 0 : variance >= 0))
//         : apiFavorable;
//     return favorable == null ? "#64748b" : favorable ? "#15803d" : "#dc2626";
// };
// const fmtMillions = (n) => `${(Number(n) / 1_000_000).toFixed(2)}M`;
// const formatViewAllValue = (value, reportName, unit) => {
//     if (value == null || value === "") return "—";
//     const numeric = Number(value);
//     if (!Number.isFinite(numeric)) return String(value);
//     const isMonthlyChart = reportName === "monthly-trend" || reportName === "production-overhead-monthly";
//     const displayValue = isMonthlyChart
//         ? (unit === "aed" ? numeric * 1_000_000 : numeric)
//         : (unit === "aed" ? numeric : numeric / 1_000_000);
//     return displayValue.toLocaleString("en-US", { minimumFractionDigits: unit === "aed" ? 0 : 2, maximumFractionDigits: unit === "aed" ? 0 : 2 });
// };

// const normalizeGroupBy = (value) => ({
//     legal_entity: "legal_entity",
//     parent_division: "parent_division",
//     subdivision: "subdivision",
// }[value] || "legal_entity");
// const statusLabel = (value) => {
//     if (value == null || value === "") return "";
//     return String(value).replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
// };

// // Normalize metric labels from dashboard and summary endpoints. The API may use
// // metric codes (for example overhead_absorption_pct) in one response and labels
// // (Overhead Absorption %) in another.
// const normalizeMetricKey = (value) => {
//     const text = String(value ?? "").toLowerCase().replace(/[%]/g, " percent ").replace(/[_-]+/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
//     if (text.includes("overhead absorption") && (text.includes("percent") || text.includes("pct"))) return "overhead absorption percent";
//     if (text.includes("overhead absorption")) return "overhead absorption";
//     // Keep percentage-of-sales material KPIs separate from currency material KPIs.
//     // Otherwise a previous-month lookup can match the currency row first.
//     if ((text.includes("cost of material") || text === "material" || text.includes("material cost")) &&
//         (text.includes("percent") || text.includes("pct") || text.includes("against sales"))) return "cost of material percent";
//     if (text.includes("cost of material") || text === "material" || text.includes("material cost")) return "cost of material";
//     if (text.includes("production overhead")) return "production overhead";
//     return text;
// };

// // Read summary rows from either the summary endpoint's row format or the
// // dashboard-style controls object. The controls fallback matters for metrics
// // such as overhead_absorption_pct when an endpoint returns controls instead
// // of a flat summary array.
// const extractSummaryRows = (response, expectedPeriod = null, expectedYear = null) => {
//     // Axios normally gives response.data, but tolerate an additional data wrapper
//     // used by some API gateways without changing the API service or request flow.
//     let root = unwrapApiResponse(response);
//     for (let depth = 0; depth < 2 && root?.data && !root?.sections && !root?.summary && !root?.rows; depth += 1) {
//         root = root.data;
//     }

//     // Do not let a stale or mismatched response (for example Aug-26 when Sep-26
//     // was requested) populate the previous-month KPI comparison.
//     const responsePeriod = first(root, ["period_name", "period", "reporting_period"], null);
//     const responseYear = numberOrNull(first(root, ["year", "reporting_year"], null));
//     const normalizePeriod = (value) => String(value ?? "").trim().replace(/[- /]+/g, "-").toLowerCase();
//     if (expectedPeriod && responsePeriod && normalizePeriod(responsePeriod) !== normalizePeriod(expectedPeriod)) return [];
//     if (expectedYear != null && responseYear != null && Number(responseYear) !== Number(expectedYear)) return [];

//     const source = root?.sections || root?.data?.sections || root?.data || root || {};
//     const rows = asArray(
//         Array.isArray(root) ? root :
//             Array.isArray(source) ? source :
//                 source?.summary || source?.kpis || source?.rows ||
//                 root?.summary || root?.kpis || root?.rows
//     ).slice();

//     const controls = source?.controls || root?.controls || root?.data?.controls;
//     if (!controls || typeof controls !== "object") return rows;

//     ["ptd", "ytd"].forEach((phase) => {
//         const actuals = controls[phase] || {};
//         const targets = controls[`target_${phase}`] || controls[`target${phase.toUpperCase()}`] || {};
//         Object.entries(actuals).forEach(([metric, actual]) => {
//             if (metric === "signed_overhead_absorption") return;
//             const alreadyExists = rows.some((row) =>
//                 normalizeMetricKey(first(row, ["metric", "label", "display_name", "metric_label", "name"], "")) === normalizeMetricKey(metric) &&
//                 String(first(row, ["phase", "period"], "")).toLowerCase() === phase
//             );
//             if (alreadyExists) return;
//             const target = numberOrNull(targets[metric]);
//             const actualNumber = numberOrNull(actual);
//             const isPercent = /(?:_pct|percent|%)/i.test(metric);
//             rows.push({
//                 metric,
//                 label: statusLabel(metric),
//                 phase: phase.toUpperCase(),
//                 actual: actualNumber,
//                 target,
//                 variance: actualNumber != null && target != null ? actualNumber - target : null,
//                 variance_pp: isPercent && actualNumber != null && target != null ? actualNumber - target : null,
//                 unit: isPercent ? "PERCENT" : "CURRENCY"
//             });
//         });
//     });
//     return rows;
// };
// function CountUp({ value, formatter = (v) => v.toLocaleString("en-US", { maximumFractionDigits: 2 }), duration = 850 }) {
//     const [shown, setShown] = React.useState(0);
//     React.useEffect(() => {
//         let start;
//         let raf;
//         const tick = (time) => {
//             if (!start) start = time;
//             const p = Math.min((time - start) / duration, 1);
//             const eased = 1 - Math.pow(1 - p, 3);
//             setShown(value * eased);
//             if (p < 1) raf = requestAnimationFrame(tick);
//         };
//         raf = requestAnimationFrame(tick);
//         return () => cancelAnimationFrame(raf);
//     }, [value, duration]);
//     return <>{formatter(shown)}</>;
// }

// function ExportButtons({ onExcel, onPdf }) {
//     const buttonBase = { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, fontSize: "0.70rem", fontWeight: 700, cursor: "pointer", transition: "all .15s", outline: "none" };
//     return <div style={{ display: "flex", gap: 8 }}>
//         <button onClick={onExcel} style={{ ...buttonBase, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>📊 Excel</button>
//         <button onClick={onPdf} style={{ ...buttonBase, color: "#be123c", background: "#fff1f2", border: "1px solid #fecdd3" }}>📄 PDF</button>
//     </div>;
// }

// function Panel({ title, subtitle, action, children, style = {}, className = "" }) {
//     return <section className={`mfg-panel ${className}`} style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", boxShadow: "0 2px 8px rgba(15,23,42,.04)", minWidth: 0, ...style }}>
//         <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
//             <div><div style={{ fontSize: "0.88rem", fontWeight: 750, letterSpacing: "-.015em", color: COLORS.navy }}>{title}</div>
//                 {subtitle && <div style={{ fontSize: "0.72rem", color: COLORS.muted, marginTop: 3, lineHeight: 1.45 }}>{subtitle}</div>}</div>
//             {action}
//         </div>
//         {children}
//     </section>;
// }

// function KpiCard({ item, delay, currency = "AED" }) {
//     const hasTarget = item.value !== null && item.value !== undefined && Number.isFinite(item.value) && item.target !== null && item.target !== undefined && Number.isFinite(item.target);
//     const isPercent = item.percent === true;
//     const variance = item.varianceDisplay != null
//         ? item.varianceDisplay
//         : hasTarget ? item.value - item.target : null;
//     const favorable = isFavorableStatus(item.varianceStatus) ?? (hasTarget ? (item.lowerIsBetter ? variance <= 0 : variance >= 0) : null);
//     const varianceText = variance === null
//         ? "Variance: —"
//         : isPercent
//             ? `${variance > 0 ? "+" : variance < 0 ? "−" : ""}${Math.abs(variance).toFixed(1)} pp`
//             : `${currency} ${Math.abs(variance).toFixed(2)}M${item.variancePct == null ? "" : ` · ${item.variancePct > 0 ? "+" : item.variancePct < 0 ? "−" : ""}${Math.abs(item.variancePct).toFixed(1)}%`}`;

//     return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, delay }}
//         whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(15,23,42,.07)" }}
//         style={{ borderRadius: 14, padding: "10px 11px 8px", minHeight: 98, background: item.bg, border: "1px solid rgba(255,255,255,.9)", display: "flex", flexDirection: "column", gap: 5, minWidth: 0, boxShadow: "0 1px 3px rgba(15,23,42,.025)" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
//             <div style={{ width: 29, height: 29, borderRadius: "50%", background: `${item.color}18`, display: "grid", placeItems: "center", color: item.color, fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
//             <div style={{ minWidth: 0, flex: 1 }}>
//                 <div title={item.label} style={{ fontSize: 11, color: item.color, fontWeight: 800, lineHeight: 1.2 }}>{item.label}</div>
//                 <div style={{ fontSize: 16, color: COLORS.navy, fontWeight: 850, letterSpacing: "-.025em", marginTop: 2, lineHeight: 1.15, overflowWrap: "anywhere" }}>
//                     {item.value == null ? "—" : isPercent ? <CountUp value={item.value} formatter={(v) => `${v.toFixed(1)}%`} /> : <>{currency} <CountUp value={item.value} formatter={(v) => v.toFixed(2)} />M</>}
//                 </div>
//             </div>
//             <span style={{ fontSize: 8.5, fontWeight: 800, color: COLORS.navy, background: "#ffffffb8", padding: "3px 5px", borderRadius: 5, flexShrink: 0 }}>{item.period}</span>
//         </div>
//         <div style={{ marginTop: "auto", background: "#ffffffb8", borderRadius: 7, padding: "5px 7px", display: "grid", gap: 3 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, fontSize: 9.5, lineHeight: 1.2 }}><span style={{ color: "#64748b" }}>vs Target</span><strong style={{ color: item.target == null ? "#94a3b8" : (favorable === null ? "#64748b" : favorable ? "#059669" : "#e11d48"), fontSize: 9.5, textAlign: "right" }}>{item.target == null ? "—" : `${variance > 0 ? "▲" : variance < 0 ? "▼" : "•"} ${varianceText.replace(/^Variance: /, "")}`}</strong></div>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, fontSize: 9.5, lineHeight: 1.2 }}><span style={{ color: "#64748b" }}>vs Last Month</span><strong style={{ color: item.lastMonthValue == null || item.value == null ? "#94a3b8" : (item.lowerIsBetter ? (item.value - item.lastMonthValue) <= 0 : (item.value - item.lastMonthValue) >= 0) ? "#059669" : "#e11d48", fontSize: 9.5 }}>{item.lastMonthValue == null || item.value == null ? "—" : `${item.value - item.lastMonthValue < 0 ? "▼" : item.value - item.lastMonthValue > 0 ? "▲" : "•"} ${Math.abs(item.value - item.lastMonthValue).toFixed(1)}${isPercent ? " pp" : "M"}`}</strong></div>
//         </div>
//     </motion.div>;
// }

// function Filter({ label, value, onChange, options, showAll = false, hidePlaceholder = false }) {
//     const [open, setOpen] = useState(false);
//     const [optionSearch, setOptionSearch] = useState("");
//     const triggerRef = React.useRef(null);
//     const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, width: 220, maxHeight: 280 });
//     const safeOptions = withoutAllOptions(options).map((item) => {
//         if (item && typeof item === "object") return item;
//         return { id: String(item ?? ""), name: String(item ?? "") };
//     }).filter((item) => {
//         const optionValue = String(idOf(item) ?? "").trim();
//         const optionLabel = labelOf(item).trim();
//         return optionValue !== "" && !/^select(?:\.{3}|…)?$/i.test(optionLabel);
//     });
//     const selectedOption = safeOptions.find((item) => String(idOf(item)) === String(value ?? ""));
//     const displayOptions = value != null && String(value) !== "" && !selectedOption
//         ? [{ id: String(value), name: String(value) }, ...safeOptions]
//         : safeOptions;
//     const selectedLabel = selectedOption ? labelOf(selectedOption) : (value == null || value === "" ? "" : String(value));
//     const filteredOptions = displayOptions.filter((item) =>
//         labelOf(item).toLowerCase().includes(optionSearch.trim().toLowerCase())
//     );
//     const updatePopupPosition = React.useCallback(() => {
//         const rect = triggerRef.current?.getBoundingClientRect();
//         if (!rect || typeof window === "undefined") return;
//         const pad = 12;
//         const width = Math.min(Math.max(rect.width, 210), Math.max(210, window.innerWidth - pad * 2));
//         const left = Math.max(pad, Math.min(rect.left, window.innerWidth - width - pad));
//         const below = Math.max(0, window.innerHeight - rect.bottom - pad - 6);
//         const above = Math.max(0, rect.top - pad - 6);
//         const openAbove = below < 190 && above > below;
//         const available = openAbove ? above : below;
//         const maxHeight = Math.max(80, Math.min(300, available));
//         const proposedTop = openAbove ? rect.top - maxHeight - 6 : rect.bottom + 6;
//         const top = Math.max(pad, Math.min(proposedTop, window.innerHeight - maxHeight - pad));
//         setPopupPosition({ top, left, width, maxHeight });
//     }, []);
//     React.useEffect(() => {
//         if (!open) return undefined;
//         updatePopupPosition();
//         const reposition = () => updatePopupPosition();
//         const onKeyDown = (event) => { if (event.key === "Escape") setOpen(false); };
//         window.addEventListener("resize", reposition);
//         window.addEventListener("scroll", reposition, true);
//         document.addEventListener("keydown", onKeyDown);
//         return () => {
//             window.removeEventListener("resize", reposition);
//             window.removeEventListener("scroll", reposition, true);
//             document.removeEventListener("keydown", onKeyDown);
//         };
//     }, [open, updatePopupPosition]);
//     const choose = (option) => {
//         onChange(String(idOf(option)));
//         setOpen(false);
//         setOptionSearch("");
//     };
//     return <>
//         <label className="mfg-filter-field" style={{ display: "block", minWidth: 0 }}>
//             <span style={{ display: "block", color: "#0b2d67", fontSize: "0.68rem", fontWeight: 700, margin: "0 0 4px 1px", whiteSpace: "nowrap" }}>{label}</span>
//             <button ref={triggerRef} type="button" className="mfg-select" aria-haspopup="listbox" aria-expanded={open}
//                 onClick={() => { if (!open) updatePopupPosition(); setOpen((v) => !v); }}
//                 title={selectedLabel || (showAll ? "All" : "Select…")}
//                 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", minWidth: 0, minHeight: 33, height: "auto", boxSizing: "border-box", borderRadius: 7, border: "1px solid #d7e0f0", background: "#fff", color: "#26364f", padding: "6px 9px", fontSize: "0.72rem", fontWeight: 500, outline: "none", cursor: "pointer", textAlign: "left", lineHeight: 1.25 }}>
//                 <span style={{ minWidth: 0, flex: "1 1 auto", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word" }}>{selectedLabel || (showAll ? "All" : hidePlaceholder ? "—" : "Select…")}</span>
//                 <span aria-hidden="true" style={{ color: "#526b91", flex: "0 0 auto" }}>▾</span>
//             </button>
//         </label>
//         {open && typeof document !== "undefined" && createPortal(<>
//             <div onMouseDown={(e) => { e.preventDefault(); setOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "transparent" }} />
//             <div role="listbox" onMouseDown={(e) => e.stopPropagation()} style={{ position: "fixed", zIndex: 9999, top: popupPosition.top, left: popupPosition.left, width: popupPosition.width, maxWidth: "calc(100vw - 24px)", maxHeight: popupPosition.maxHeight, boxSizing: "border-box", display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #dbe5f5", borderRadius: 10, boxShadow: "0 14px 32px rgba(15,23,42,.18)", padding: 9, overflow: "hidden" }}>
//                 <input autoFocus value={optionSearch} onChange={(e) => setOptionSearch(e.target.value)} placeholder={`🔍 Search ${label}...`} aria-label={`Search ${label}`} style={{ width: "100%", boxSizing: "border-box", height: 31, border: "1px solid #c7d2fe", borderRadius: 7, padding: "0 8px", marginBottom: 7, fontSize: 11, outline: "none" }} />
//                 {showAll && <button type="button" onClick={() => { onChange(""); setOpen(false); setOptionSearch(""); }} style={{ border: 0, background: "transparent", padding: "7px 5px", textAlign: "left", color: "#173b68", fontSize: 11, cursor: "pointer" }}>All</button>}
//                 <div style={{ minHeight: 0, overflowY: "auto", overscrollBehavior: "contain" }}>
//                     {filteredOptions.map((item) => {
//                         const optionValue = String(idOf(item));
//                         const optionLabel = labelOf(item);
//                         const active = optionValue === String(value ?? "");
//                         return <button key={`${optionValue}-${optionLabel}`} type="button" role="option" aria-selected={active} onClick={() => choose(item)}
//                             style={{ display: "block", width: "100%", border: 0, borderBottom: "1px solid #f1f5f9", borderRadius: 4, padding: "8px 6px", background: active ? "#eff6ff" : "#fff", color: active ? "#173b8f" : "#173b68", fontSize: 11, fontWeight: active ? 750 : 500, textAlign: "left", cursor: "pointer", whiteSpace: "normal", overflowWrap: "anywhere", lineHeight: 1.35 }}>
//                             {optionLabel}
//                         </button>;
//                     })}
//                     {!filteredOptions.length && <div style={{ padding: "9px 4px", fontSize: 11, color: "#64748b" }}>No matching options</div>}
//                 </div>
//             </div>
//         </>, document.body)}
//     </>;
// }

// function MultiSelectFilter({ label, value, onChange, options, allowAll = true }) {
//     const [open, setOpen] = useState(false);
//     const [optionSearch, setOptionSearch] = useState("");
//     const triggerRef = React.useRef(null);
//     const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, width: 220, maxHeight: 300 });
//     const updatePopupPosition = React.useCallback(() => {
//         const rect = triggerRef.current?.getBoundingClientRect();
//         if (!rect || typeof window === "undefined") return;
//         const viewportPadding = 12;
//         const width = Math.min(Math.max(rect.width, 210), Math.max(210, window.innerWidth - viewportPadding * 2));
//         const left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - width - viewportPadding));
//         const availableBelow = Math.max(0, window.innerHeight - rect.bottom - viewportPadding - 6);
//         const availableAbove = Math.max(0, rect.top - viewportPadding - 6);
//         const openAbove = availableBelow < 210 && availableAbove > availableBelow;
//         const available = openAbove ? availableAbove : availableBelow;
//         // Respect the real available viewport space. Never force a 120px popup
//         // into a smaller gap, which caused the menu to overlap/mis-anchor.
//         const maxHeight = Math.max(80, Math.min(320, available));
//         const proposedTop = openAbove ? rect.top - maxHeight - 6 : rect.bottom + 6;
//         const top = Math.max(viewportPadding, Math.min(proposedTop, window.innerHeight - maxHeight - viewportPadding));
//         setPopupPosition({ top, left, width, maxHeight });
//     }, []);
//     const selected = Array.isArray(value) ? value.map(String) : (value ? [String(value)] : []);
//     React.useEffect(() => {
//         if (!open) return undefined;
//         // Keep the popup anchored to its trigger when selected labels wrap,
//         // cascading options refresh, or the dashboard layout changes.
//         const reposition = () => updatePopupPosition();
//         reposition();
//         window.addEventListener("resize", reposition);
//         window.addEventListener("scroll", reposition, true);
//         let observer;
//         if (typeof ResizeObserver !== "undefined" && triggerRef.current) {
//             observer = new ResizeObserver(reposition);
//             observer.observe(triggerRef.current);
//         }
//         return () => {
//             window.removeEventListener("resize", reposition);
//             window.removeEventListener("scroll", reposition, true);
//             observer?.disconnect();
//         };
//     }, [open, updatePopupPosition, selected.join("|")]);
//     const safeOptions = asArray(options).filter((item) => {
//         const id = String(idOf(item) ?? "").trim();
//         const text = labelOf(item).trim();
//         return id !== "" && !/^select(?:\.{3}|…)?$/i.test(text) && !/^all(?:\s+.*)?$/i.test(text);
//     });
//     const filteredOptions = safeOptions.filter((item) => labelOf(item).toLowerCase().includes(optionSearch.toLowerCase()));
//     const toggle = (id) => onChange(selected.includes(String(id)) ? selected.filter((x) => x !== String(id)) : [...selected, String(id)]);
//     const selectedLabels = selected.map((id) => labelOf(safeOptions.find((item) => String(idOf(item)) === id) || id));
//     // Match the OPEX filter behaviour: an empty selection means All, and selecting
//     // every available option must also display All instead of dumping every label
//     // into the small trigger and overlapping the dashboard content.
//     const allOptionsSelected = safeOptions.length > 0 && selected.length >= safeOptions.length &&
//         safeOptions.every((item) => selected.includes(String(idOf(item))));
//     const summary = safeOptions.length === 0
//         ? "Loading…"
//         : allOptionsSelected || selected.length === 0
//             ? (allowAll ? "All" : "Select…")
//             : selected.length === 1
//                 ? selectedLabels[0]
//                 : `${selected.length} selected`;
//     return <>
//         <div className="mfg-filter-field mfg-multiselect-field" style={{ position: "relative", minWidth: 0, zIndex: open ? 120 : 1 }}>
//             <span style={{ display: "block", color: "#0b2d67", fontSize: "0.68rem", fontWeight: 700, margin: "0 0 4px 1px", whiteSpace: "nowrap" }}>{label}</span>
//             <button ref={triggerRef} type="button" className="mfg-select mfg-multiselect-trigger" aria-expanded={open} disabled={safeOptions.length === 0} onClick={() => { if (!open && safeOptions.length) updatePopupPosition(); if (safeOptions.length) setOpen((v) => !v); }} style={{ appearance: "none", display: "flex", alignItems: "center", width: "100%", minWidth: 0, minHeight: 38, height: 38, maxHeight: 38, boxSizing: "border-box", borderRadius: 7, border: "1px solid #d7e0f0", background: "#fff", color: "#26364f", padding: "7px 27px 7px 9px", fontSize: "0.72rem", fontWeight: 500, textAlign: "left", cursor: safeOptions.length ? "pointer" : "wait", opacity: safeOptions.length ? 1 : 0.72, overflow: "hidden", lineHeight: 1.25, position: "relative" }} title={safeOptions.length === 0 ? "Loading filter options" : allOptionsSelected || selected.length === 0 ? "All" : selectedLabels.join(", ") || summary}><span style={{ display: "block", flex: "1 1 auto", minWidth: 0, maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 2, lineHeight: 1.25 }}>{summary}</span><span aria-hidden="true" style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#526b91", background: "#fff", lineHeight: 1 }}>▾</span></button>
//         </div>
//         {open && typeof document !== "undefined" && createPortal(<>
//             <div onMouseDown={(e) => { e.preventDefault(); setOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "transparent" }} />
//             <div onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} style={{ position: "fixed", zIndex: 9999, top: popupPosition.top, left: popupPosition.left, width: popupPosition.width, maxWidth: "calc(100vw - 24px)", maxHeight: popupPosition.maxHeight, boxSizing: "border-box", display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #dbe5f5", borderRadius: 10, boxShadow: "0 14px 32px rgba(15,23,42,.18)", padding: 9, overflow: "hidden" }}>
//                 <input value={optionSearch} onChange={(e) => setOptionSearch(e.target.value)} placeholder={`🔍 Search ${label}...`} style={{ width: "100%", height: 30, border: "1px solid #c7d2fe", borderRadius: 7, padding: "0 8px", marginBottom: 7, fontSize: 11, outline: "none" }} />
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, margin: "0 1px 7px", padding: "0 1px" }}>
//                     <button type="button" onClick={() => onChange(safeOptions.map((item) => String(idOf(item))))} style={{ border: 0, padding: "2px 0", background: "transparent", color: "#5B3FE4", fontSize: 10, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>Select All</button>
//                     <button type="button" onClick={() => onChange([])} style={{ border: 0, padding: "2px 0", background: "transparent", color: "#64748b", fontSize: 10, fontWeight: 700, cursor: "pointer", textAlign: "right" }}>Clear</button>
//                 </div>
//                 <div style={{ minHeight: 0, maxHeight: Math.max(80, popupPosition.maxHeight - 92), overflowY: "auto", overscrollBehavior: "contain" }}>
//                     {filteredOptions.map((item) => {
//                         const id = String(idOf(item));
//                         return <div key={id} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "7px 4px", fontSize: 11, lineHeight: 1.35, color: "#173b68", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}><input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} style={{ flex: "0 0 auto", marginTop: 2 }} /><button type="button" onClick={() => toggle(id)} style={{ minWidth: 0, flex: 1, border: 0, padding: 0, background: "transparent", color: "inherit", textAlign: "left", fontSize: "inherit", lineHeight: "inherit", cursor: "pointer", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word" }}>{labelOf(item)}</button></div>;
//                     })}
//                     {!filteredOptions.length && <div style={{ padding: "9px 4px", fontSize: 11, color: "#64748b" }}>No matching options</div>}
//                 </div>
//             </div>
//         </>, document.body)}
//     </>;
// }
// function TooltipBox({ active, payload, label }) {
//     if (!active || !payload?.length) return null;
//     return <div style={{ minWidth: 150, background: "linear-gradient(145deg,#ffffff 0%,#f8faff 100%)", border: "1px solid #dbe5f5", borderRadius: 12, padding: "10px 12px", boxShadow: "0 14px 34px rgba(15,23,42,.18)", fontSize: 11, backdropFilter: "blur(10px)" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 850, color: COLORS.navy, marginBottom: 7, paddingBottom: 6, borderBottom: "1px solid #e8eef8" }}><span style={{ width: 6, height: 6, borderRadius: 99, background: COLORS.blue }} />{label}</div>
//         {payload.filter((p) => p.value != null).map((p, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginTop: 5, color: "#475569" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: p.color || p.fill || "#64748b" }} />{p.name}</span><b style={{ color: COLORS.navy, fontVariantNumeric: "tabular-nums" }}>{typeof p.value === "number" ? `${p.value.toFixed(2)}M` : p.value}</b></div>)}
//     </div>;
// }

// function ProductionOverheadTooltip({ active, payload, label, groupBy, currency = "AED", dimensionOrder = [] }) {
//     if (!active || !payload?.length) return null;
//     const point = payload.find((item) => item?.payload)?.payload;
//     if (!point) return null;
//     const suffixes = ["__actual", "__target"];
//     const names = Object.keys(point)
//         .filter((key) => suffixes.some((suffix) => key.endsWith(suffix)))
//         .map((key) => key.slice(0, key.lastIndexOf("__")))
//         .filter((name, index, all) => all.indexOf(name) === index);
//     const money = (value) => value == null || !Number.isFinite(Number(value)) ? "—" : `${currency} ${Number(value).toFixed(2)}M`;
//     const level = groupBy === "legal_entity" ? "Legal Entity" : groupBy === "parent_division" ? "Parent Division" : "Subdivision";
//     return <div style={{ minWidth: 230, maxWidth: 320, background: "#fff", border: "1px solid #dbe5f5", borderRadius: 10, padding: "10px 12px", boxShadow: "0 12px 30px rgba(15,23,42,.18)", fontSize: 11 }}>
//         <div style={{ fontWeight: 850, color: COLORS.navy, paddingBottom: 7, marginBottom: 7, borderBottom: "1px solid #e8eef8" }}>Month: {label}</div>
//         {names.map((name) => {
//             const actual = numberOrNull(point[`${name}__actual`]);
//             const target = numberOrNull(point[`${name}__target`]);
//             const variance = actual != null && target != null ? actual - target : null;
//             const colorIndex = dimensionOrder.length ? dimensionOrder.indexOf(name) : names.indexOf(name);
//             const color = COLORS_BY_CATEGORY[Math.max(0, colorIndex) % COLORS_BY_CATEGORY.length];
//             return <div key={name} style={{ borderBottom: "1px solid #f1f5f9", padding: "5px 0" }}>
//                 <div style={{ display: "flex", gap: 6, alignItems: "flex-start", fontWeight: 800, color: COLORS.navy, overflowWrap: "anywhere", marginBottom: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0, marginTop: 2 }} />{level}: {name}</div>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, color: "#475569" }}>
//                     <span>Actual: <b style={{ color: COLORS.navy }}>{money(actual)}</b></span>
//                     <span>Target: <b style={{ color: COLORS.navy }}>{money(target)}</b></span>
//                     <span style={{ gridColumn: "1 / -1" }}>Variance: <b style={{ color: variance == null ? "#64748b" : variance <= 0 ? "#15803d" : "#dc2626" }}>{money(variance)}</b></span>
//                 </div>
//             </div>;
//         })}
//     </div>;
// }


// function ManufacturingDirectCostTable({ filters }) {
//     const [rows, setRows] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [expanded, setExpanded] = useState({});
//     const [details, setDetails] = useState({});
//     const [loadingDetails, setLoadingDetails] = useState({});
//     const [retry, setRetry] = useState(0);
//     const plFilters = useMemo(() => ({
//         legalGroupId: Array.isArray(filters.legalGroup) ? filters.legalGroup : (filters.legalGroup ? [filters.legalGroup] : []),
//         legalEntityId: Array.isArray(filters.legalEntity) ? filters.legalEntity : (filters.legalEntity ? [filters.legalEntity] : []),
//         parentDivisionId: Array.isArray(filters.parent) ? filters.parent : (filters.parent ? [filters.parent] : []),
//         subdivisionId: Array.isArray(filters.sub) ? filters.sub : (filters.sub ? [filters.sub] : []),
//         year: filters.year, periodName: filters.period, currency: filters.currency || "AED",
//     }), [JSON.stringify(filters)]);
//     const unwrap = (payload) => {
//         const root = payload?.data ?? payload;
//         if (Array.isArray(root)) return root;
//         for (const key of ["rows", "data", "items", "results", "breakdown", "categories"]) if (Array.isArray(root?.[key])) return root[key];
//         return [];
//     };
//     const read = (row, keys) => { for (const key of keys) if (row?.[key] != null) return row[key]; return null; };
//     const label = (row) => String(read(row, ["category", "cost_category", "costCategory", "classification", "label", "name", "particulars"]) ?? "—");
//     const num = (v) => v == null || v === "" || !Number.isFinite(Number(String(v).replace(/,/g, ""))) ? null : Number(String(v).replace(/,/g, ""));
//     const money = (v) => num(v) == null ? (v == null || v === "" ? "—" : String(v)) : num(v).toLocaleString("en-US", { maximumFractionDigits: 0 });
//     const getters = [
//         (r) => read(r, ["actual_ptd", "current_ptd", "ptd", "ptd_value", "actual", "current", "value", "amount"]),
//         (r) => read(r, ["target_ptd", "target_ptd_aed", "target_period", "target_period_aed", "target", "target_aed"]),
//         (r) => read(r, ["variance_ptd", "variance_ptd_value", "variance"]),
//         (r) => read(r, ["actual_ytd", "current_ytd", "ytd", "ytd_value"]),
//         (r) => read(r, ["target_ytd", "ytd_target"]),
//         (r) => read(r, ["variance_ytd", "variance_ytd_value"]),
//     ];
//     const valueColor = (v, variance) => {
//         const value = num(v);
//         // Only variance columns are color-coded: positive green, negative red,
//         // and zero/missing values neutral. Other table values retain their base color.
//         if (!variance) return "#334155";
//         if (value == null || value === 0) return "#64748b";
//         return value > 0 ? "#15803d" : "#dc2626";
//     };

//     React.useEffect(() => {
//         let active = true;
//         if (!plFilters.periodName) { setRows([]); setLoading(false); return () => { active = false; }; }
//         setLoading(true); setError("");
//         fetchPLDirectCostBreakdown(plFilters)
//             .then((result) => { if (active) { setRows(unwrap(result)); setDetails({}); setExpanded({}); } })
//             .catch((err) => { if (active) { setRows([]); setError(err?.message || "Failed to load Direct Cost Drill-Down."); } })
//             .finally(() => { if (active) setLoading(false); });
//         return () => { active = false; };
//     }, [plFilters, retry]);

//     const onExpand = async (row, key) => {
//         const category = label(row), open = !expanded[key];
//         setExpanded((old) => ({ ...old, [key]: open }));
//         if (!open || Object.prototype.hasOwnProperty.call(details, category)) return;
//         setLoadingDetails((old) => ({ ...old, [category]: true }));
//         try {
//             const response = await fetchPLDirectCostDetail(plFilters, category);
//             setDetails((old) => ({ ...old, [category]: unwrap(response) }));
//         } catch (err) {
//             setDetails((old) => ({ ...old, [category]: [] }));
//             setError(err?.message || `Failed to load details for ${category}.`);
//         } finally { setLoadingDetails((old) => ({ ...old, [category]: false })); }
//     };

//     return <Panel title="Direct Cost Drill-Down" subtitle="Actual, target and variance by cost category" className="mfg-direct-cost-panel">
//         {loading && <div style={{ padding: "12px 8px", color: "#64748b", fontSize: 11 }}>Loading Direct Cost Drill-Down…</div>}
//         {error && <div role="alert" style={{ padding: "8px", color: "#b91c1c", fontSize: 11 }}>{error} <button type="button" onClick={() => setRetry((v) => v + 1)}>Retry</button></div>}
//         <div style={{ overflowX: "auto" }}>
//             <table className="cost-structure-table mfg-direct-cost-table" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: 12, minWidth: 900 }}>
//                 <colgroup><col style={{ width: 30 }} /><col style={{ width: "24%" }} />{Array.from({ length: 6 }).map((_, i) => <col key={i} style={{ width: "12.1667%" }} />)}</colgroup>
//                 <thead><tr style={{ background: "#fff" }}><th style={{ width: 30, borderTop: "1px solid #e4e9ef", borderBottom: "1px solid #e4e9ef" }} />{["Cost Category", "Actual PTD", "Target PTD", "Variance PTD", "Actual YTD", "Target YTD", "Variance YTD"].map((h) => <th key={h} style={{ padding: 8, textAlign: h === "Cost Category" ? "left" : "right", fontWeight: 800, fontSize: 11, letterSpacing: ".02em", color: "#173b68", background: "#f1f5f9", borderRight: "1px solid #e4e9ef", borderBottom: "1px solid #e4e9ef", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
//                 <tbody>
//                     {rows.map((row, index) => {
//                         const category = label(row), key = `${category}-${index}`, isOpen = !!expanded[key], children = details[category] || [];
//                         return <React.Fragment key={key}>
//                             <tr style={{ borderBottom: "1px solid #edf0f4", background: "#fff" }}>
//                                 <td style={{ textAlign: "center", padding: "9px 3px", borderRight: "1px solid #edf0f4" }}><button type="button" onClick={() => onExpand(row, key)} aria-label={`${isOpen ? "Collapse" : "Expand"} ${category}`} style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", color: "#364152", fontSize: 16 }}>{isOpen ? "⌄" : "›"}</button></td>
//                                 <td style={{ padding: "9px 8px", color: "#344054", borderRight: "1px solid #edf0f4", fontSize: 11, fontWeight: 800, textTransform: "uppercase", overflowWrap: "anywhere", lineHeight: 1.3 }}>{category}</td>
//                                 {getters.map((get, i) => { const v = get(row); const isVariance = i === 2 || i === 5; const colorClass = !isVariance || num(v) == null || num(v) === 0 ? "mfg-variance-neutral" : num(v) > 0 ? "mfg-variance-positive" : "mfg-variance-negative"; return <td key={i} className={isVariance ? `mfg-variance-cell ${colorClass}` : undefined} style={{ padding: "9px 8px", textAlign: "right", color: valueColor(v, isVariance), fontWeight: isVariance ? 800 : 500, borderRight: "1px solid #edf0f4", whiteSpace: "nowrap" }}>{money(v)}</td>; })}
//                             </tr>
//                             {isOpen && <tr style={{ background: "#fafbfd" }}><td colSpan={8} style={{ padding: 0 }}>
//                                 {loadingDetails[category] ? <div style={{ padding: "12px 28px", color: "#64748b", fontSize: 11 }}>Loading account details…</div> : children.length ? <table className="cost-structure-table cost-detail-table mfg-direct-cost-table mfg-direct-cost-detail-table" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: 12 }}>
//                                     <colgroup>
//                                         <col style={{ width: "3%" }} />
//                                         <col style={{ width: "9%" }} />
//                                         <col style={{ width: "15%" }} />
//                                         {Array.from({ length: 6 }).map((_, i) => <col key={i} style={{ width: "12.1667%" }} />)}
//                                     </colgroup>
//                                     <thead><tr>{["", "Account Code", "Account Name", "Actual PTD", "Target PTD", "Variance PTD", "Actual YTD", "Target YTD", "Variance YTD"].map((h, i) => <th key={h || "blank"} style={{ padding: 7, textAlign: i < 3 ? "left" : "right", color: "#173b68", background: "#fff", fontWeight: 700 }}>{h}</th>)}</tr></thead>
//                                     <tbody>{children.map((detail, i) => <tr key={i} className="mfg-direct-cost-detail-row" style={{ borderTop: "1px solid #edf0f4", background: i % 2 ? "#f8fafc" : "#fff" }}>
//                                         <td aria-hidden="true" style={{ padding: 0 }} />
//                                         <td style={{ padding: "10px 10px", color: "#475569", fontWeight: 500, textAlign: "left", verticalAlign: "middle", whiteSpace: "nowrap" }}>{read(detail, ["account_code", "accountCode", "code", "account"]) ?? "—"}</td>
//                                         <td title={read(detail, ["account_name", "accountName", "name", "particulars"]) ?? "—"} style={{ padding: "9px 10px", color: "#475569", fontWeight: 500, textAlign: "left", verticalAlign: "middle", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.3 }}>{read(detail, ["account_name", "accountName", "name", "particulars"]) ?? "—"}</td>
//                                         {getters.map((get, j) => { const v = get(detail); const isVariance = j === 2 || j === 5; const colorClass = !isVariance || num(v) == null || num(v) === 0 ? "mfg-variance-neutral" : num(v) > 0 ? "mfg-variance-positive" : "mfg-variance-negative"; return <td key={j} className={isVariance ? `mfg-variance-cell ${colorClass}` : undefined} style={{ padding: "10px 8px", textAlign: "right", verticalAlign: "middle", fontWeight: isVariance ? 800 : 500, whiteSpace: "nowrap", color: valueColor(v, isVariance) }}>{money(v)}</td>; })}
//                                     </tr>)}</tbody>
//                                 </table> : <div style={{ padding: "12px 28px", color: "#94a3b8", fontSize: 11 }}>No account details returned by backend.</div>}
//                             </td></tr>}
//                         </React.Fragment>;
//                     })}
//                     {!loading && !rows.length && !error && <tr><td colSpan={8} style={{ padding: 30, textAlign: "center", color: "#94a3b8" }}>No data available</td></tr>}
//                     {!!rows.length && <tr style={{ background: "#f1f5f9", fontWeight: 800 }}><td /><td style={{ padding: "9px 8px", color: "#182338" }}>Total Cost of Sales</td>{getters.map((get, i) => { const vals = rows.map((r) => num(get(r))).filter((v) => v != null); const total = vals.length ? vals.reduce((a, b) => a + b, 0) : null; const isVariance = i === 2 || i === 5; const colorClass = !isVariance || total == null || total === 0 ? "mfg-variance-neutral" : total > 0 ? "mfg-variance-positive" : "mfg-variance-negative"; return <td key={i} className={isVariance ? `mfg-variance-cell ${colorClass}` : undefined} style={{ padding: "9px 8px", textAlign: "right", color: valueColor(total, isVariance), fontWeight: 800 }}>{money(total)}</td>; })}</tr>}
//                 </tbody>
//             </table>
//         </div>
//     </Panel>;
// }


// export default function ManufacturingCostDashboard() {
//     const [filters, setFilters] = useState(FILTER_DEFAULTS);
//     const filtersRef = React.useRef(FILTER_DEFAULTS);
//     filtersRef.current = filters;
//     const [appliedFilters, setAppliedFilters] = useState(FILTER_DEFAULTS);
//     const [viewAll, setViewAll] = useState("");
//     const [viewAllMaximized, setViewAllMaximized] = useState(false);
//     const [drilldownCollapsed, setDrilldownCollapsed] = useState(false);
//     const [drilldownUnit, setDrilldownUnit] = useState("aed");
//     const [selectedDetailCategory, setSelectedDetailCategory] = useState("");
//     const [expandedCostCategories, setExpandedCostCategories] = useState(() => new Set());
//     const [inlineCategoryDetails, setInlineCategoryDetails] = useState({});
//     const [inlineCategoryLoading, setInlineCategoryLoading] = useState({});
//     const [viewAllFilters, setViewAllFilters] = useState(FILTER_DEFAULTS);
//     const viewAllFiltersRef = React.useRef(FILTER_DEFAULTS);
//     viewAllFiltersRef.current = viewAllFilters;
//     const [viewAllUnit, setViewAllUnit] = useState("millions");
//     const [drillMenuOpen, setDrillMenuOpen] = useState(false);
//     const [trendMenuOpen, setTrendMenuOpen] = useState(false);
//     const [overheadMenuOpen, setOverheadMenuOpen] = useState(false);
//     React.useEffect(() => {
//         if (!drillMenuOpen && !trendMenuOpen && !overheadMenuOpen) return undefined;
//         const closeMenus = (event) => {
//             if (!event.target.closest?.(".mfg-menu-container")) {
//                 setDrillMenuOpen(false);
//                 setTrendMenuOpen(false);
//                 setOverheadMenuOpen(false);
//             }
//         };
//         const onKeyDown = (event) => {
//             if (event.key === "Escape") {
//                 setDrillMenuOpen(false);
//                 setTrendMenuOpen(false);
//                 setOverheadMenuOpen(false);
//             }
//         };
//         document.addEventListener("mousedown", closeMenus);
//         document.addEventListener("keydown", onKeyDown);
//         return () => {
//             document.removeEventListener("mousedown", closeMenus);
//             document.removeEventListener("keydown", onKeyDown);
//         };
//     }, [drillMenuOpen, trendMenuOpen, overheadMenuOpen]);
//     const [search, setSearch] = useState("");
//     const [pageSize, setPageSize] = useState(10);
//     const [viewAllPage, setViewAllPage] = useState(1);
//     const [viewAllPageSize, setViewAllPageSize] = useState(25);
//     const [filterOptions, setFilterOptions] = useState({ legalGroups: [], legalEntities: [], parentDivisions: [], subdivisions: [], years: [], periods: [] });
//     const [viewAllFilterOptions, setViewAllFilterOptions] = useState({ legalGroups: [], legalEntities: [], parentDivisions: [], subdivisions: [], years: [], periods: [] });
//     const [dashboard, setDashboard] = useState({ summary: [], monthly: [], costMix: [], categoryBreakdown: [] });
//     const [overheadGroupBy, setOverheadGroupBy] = useState("legal_entity");
//     const [overheadSelectedDimensions, setOverheadSelectedDimensions] = useState([]);
//     const [dimensionOverheadRows, setDimensionOverheadRows] = useState([]);
//     const [dimensionOverheadLoading, setDimensionOverheadLoading] = useState(false);
//     const [dimensionOverheadError, setDimensionOverheadError] = useState("");
//     const [viewAllRows, setViewAllRows] = useState([]);
//     const [viewAllTotals, setViewAllTotals] = useState(null);
//     const [previousSummaryRows, setPreviousSummaryRows] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [detailLoading, setDetailLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [detailError, setDetailError] = useState("");
//     const [retryCounter, setRetryCounter] = useState(0);
//     const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
//     const initialFilterOptionsResolved = React.useRef(false);
//     const previousMainHierarchy = React.useRef(null);
//     const previousViewHierarchy = React.useRef(null);
//     const mainOptionsRequestId = React.useRef(0);
//     const viewOptionsRequestId = React.useRef(0);

//     const update = (key, value) => {
//         const old = filtersRef.current || filters;
//         const next = { ...old, [key]: value };
//         if (key === "legalGroup") { next.legalEntity = []; next.parent = []; next.sub = []; }
//         if (key === "legalEntity") { next.parent = []; next.sub = []; }
//         if (key === "parent") next.sub = [];
//         filtersRef.current = next;
//         setFilters(next);
//     };
//     const updateViewAll = (key, value) => {
//         const old = viewAllFiltersRef.current || viewAllFilters;
//         const next = { ...old, [key]: value };
//         if (key === "legalGroup") { next.legalEntity = []; next.parent = []; next.sub = []; }
//         if (key === "legalEntity") { next.parent = []; next.sub = []; }
//         if (key === "parent") next.sub = [];
//         viewAllFiltersRef.current = next;
//         setViewAllFilters(next);
//     };
//     const optionsQuery = useMemo(() => buildQuery(filters), [filters]);

//     React.useEffect(() => {
//         let cancelled = false;
//         const requestId = ++mainOptionsRequestId.current;
//         const currentScope = {
//             group: JSON.stringify(filters.legalGroup),
//             entity: JSON.stringify(filters.legalEntity),
//             parent: JSON.stringify(filters.parent),
//         };
//         const previous = previousMainHierarchy.current;
//         const groupChanged = !previous || previous.group !== currentScope.group;
//         const entityChanged = !previous || previous.entity !== currentScope.entity;
//         const parentChanged = !previous || previous.parent !== currentScope.parent;
//         previousMainHierarchy.current = currentScope;
//         // One options request per hierarchy change. Keep parent-level option lists cached
//         // when only a descendant changes, so returning to Legal Entity shows every option.
//         getManufacturingFilterOptions(manufacturingFilters(filters)).then(async (response) => {
//             if (cancelled || requestId !== mainOptionsRequestId.current) return;
//             const options = parseManufacturingFilterOptions(response);
//             const { legalGroups: groups, years, periods } = options;

//             // On first page load, resolve the default hierarchy scope before publishing
//             // the filter options. This prevents Legal Group/Year/Period from appearing
//             // populated while Legal Entity and lower hierarchy options are still waiting
//             // on a second, sequential request. The controls become ready together.
//             if (!initialFilterOptionsResolved.current) {
//                 const fjGroup = groups.find((x) => /\bfj\s*group\b/i.test(labelOf(x)));
//                 const markedGroup = groups.find((x) => x?.is_default || x?.default);
//                 const groupDefault = fjGroup || markedGroup || (groups.length === 1 ? groups[0] : null);
//                 const markedYear = years.find((x) => x?.is_default || x?.default);
//                 const markedPeriod = periods.find((x) => x?.is_default || x?.default || x?.is_latest || x?.latest);
//                 const sortedPeriods = sortPeriodsChronologically(periods, filters.year);
//                 const latestPeriod = sortedPeriods.length ? sortedPeriods[sortedPeriods.length - 1] : FILTER_DEFAULTS.period;
//                 const defaultYear = String(idOf(markedYear || (years.length === 1 ? years[0] : new Date().getFullYear())));
//                 const periodForDefaultYear = sortedPeriods.filter((period) => periodYearFromPeriod(period, defaultYear) === Number(defaultYear));
//                 const defaultValues = {
//                     legalGroup: groupDefault ? [String(idOf(groupDefault))] : (Array.isArray(filters.legalGroup) ? filters.legalGroup : []),
//                     year: filters.year || defaultYear,
//                     period: filters.period || String(labelOf(markedPeriod) || periodForDefaultYear[periodForDefaultYear.length - 1] || latestPeriod),
//                 };
//                 const initializedFilters = { ...(filtersRef.current || filters), ...defaultValues };
//                 let initialOptions = options;
//                 if (groupDefault) {
//                     try {
//                         const scopedResponse = await getManufacturingFilterOptions(manufacturingFilters(initializedFilters));
//                         if (cancelled || requestId !== mainOptionsRequestId.current) return;
//                         const scopedOptions = parseManufacturingFilterOptions(scopedResponse);
//                         // Merge scoped hierarchy lists with the initial global lists so
//                         // dimensions omitted by a scoped response still remain available.
//                         initialOptions = {
//                             legalGroups: options.legalGroups,
//                             legalEntities: scopedOptions.legalEntities.length ? scopedOptions.legalEntities : options.legalEntities,
//                             parentDivisions: scopedOptions.parentDivisions.length ? scopedOptions.parentDivisions : options.parentDivisions,
//                             subdivisions: scopedOptions.subdivisions.length ? scopedOptions.subdivisions : options.subdivisions,
//                             years: options.years.length ? options.years : scopedOptions.years,
//                             periods: options.periods.length ? options.periods : scopedOptions.periods,
//                         };
//                     } catch (scopeError) {
//                         // Preserve the first response if scoped options fail; do not block
//                         // the dashboard or alter the filter API's established error path.
//                     }
//                 }
//                 if (cancelled || requestId !== mainOptionsRequestId.current) return;
//                 setFilterOptions(initialOptions);
//                 filtersRef.current = initializedFilters;
//                 setFilters(initializedFilters);
//                 setAppliedFilters((old) => ({ ...old, ...defaultValues }));
//                 initialFilterOptionsResolved.current = true;
//                 return;
//             }

//             // Subsequent hierarchy changes retain the existing cascade and multi-select
//             // stability behavior; only the initial options publication is synchronized.
//             setFilterOptions((old) => ({
//                 ...options,
//                 legalGroups: options.legalGroups.length ? options.legalGroups : old.legalGroups,
//                 legalEntities: groupChanged ? options.legalEntities : (options.legalEntities.length ? old.legalEntities : old.legalEntities),
//                 parentDivisions: (groupChanged || entityChanged) ? options.parentDivisions : (options.parentDivisions.length ? old.parentDivisions : old.parentDivisions),
//                 subdivisions: (groupChanged || entityChanged || parentChanged) ? options.subdivisions : (options.subdivisions.length ? old.subdivisions : old.subdivisions),
//                 years: options.years.length ? options.years : old.years,
//                 periods: options.periods.length ? options.periods : old.periods,
//             }));
//         }).catch((e) => {
//             if (!cancelled) setError((old) => old || `Unable to load manufacturing filter options: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`);
//         });
//         return () => { cancelled = true; };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [JSON.stringify(filters.legalGroup), JSON.stringify(filters.legalEntity), JSON.stringify(filters.parent), retryCounter]);

//     // View All maintains its own selections and caches ancestor option lists independently.
//     React.useEffect(() => {
//         if (!viewAll) return undefined;
//         let cancelled = false;
//         const requestId = ++viewOptionsRequestId.current;
//         const currentScope = {
//             group: JSON.stringify(viewAllFilters.legalGroup),
//             entity: JSON.stringify(viewAllFilters.legalEntity),
//             parent: JSON.stringify(viewAllFilters.parent),
//         };
//         const previous = previousViewHierarchy.current;
//         const groupChanged = !previous || previous.group !== currentScope.group;
//         const entityChanged = !previous || previous.entity !== currentScope.entity;
//         const parentChanged = !previous || previous.parent !== currentScope.parent;
//         previousViewHierarchy.current = currentScope;
//         getManufacturingFilterOptions(manufacturingFilters(viewAllFilters)).then((response) => {
//             if (cancelled || requestId !== viewOptionsRequestId.current) return;
//             const options = parseManufacturingFilterOptions(response);
//             setViewAllFilterOptions((old) => ({
//                 ...options,
//                 // Keep ancestor options stable while selecting multiple values.
//                 legalGroups: options.legalGroups.length ? options.legalGroups : old.legalGroups,
//                 legalEntities: groupChanged
//                     ? options.legalEntities
//                     : (options.legalEntities.length ? old.legalEntities : old.legalEntities),
//                 parentDivisions: (groupChanged || entityChanged)
//                     ? options.parentDivisions
//                     : (options.parentDivisions.length ? old.parentDivisions : old.parentDivisions),
//                 subdivisions: (groupChanged || entityChanged || parentChanged)
//                     ? options.subdivisions
//                     : (options.subdivisions.length ? old.subdivisions : old.subdivisions),
//                 years: options.years.length ? options.years : old.years,
//                 periods: options.periods.length ? options.periods : old.periods,
//             }));
//         }).catch((e) => {
//             if (!cancelled) setDetailError((old) => old || `Unable to load View All filter options: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`);
//         });
//         return () => { cancelled = true; };
//     }, [viewAll, JSON.stringify(viewAllFilters.legalGroup), JSON.stringify(viewAllFilters.legalEntity), JSON.stringify(viewAllFilters.parent), retryCounter]);

//     // Separate grouped endpoint for the bottom-right analysis chart only.
//     // The combined monthly trend continues to use dashboard.monthly.
//     React.useEffect(() => {
//         let cancelled = false;
//         setDimensionOverheadLoading(true);
//         setDimensionOverheadError("");
//         getManufacturingMonthlyByDimension({ ...manufacturingFilters(appliedFilters), metric: "production_overhead" }, overheadGroupBy)
//             .then((response) => {
//                 if (cancelled) return;
//                 let payload = unwrapApiResponse(response);
//                 for (let depth = 0; depth < 2 && payload?.data && !Array.isArray(payload?.rows); depth += 1) payload = payload.data;
//                 const rows = asArray(payload?.rows || payload?.results || payload?.data || payload);
//                 const productionOverheadRows = rows.filter((row) => {
//                     const metric = first(row, ["metric", "metric_code", "metric_name", "measure", "measure_code"], null);
//                     return metric == null || String(metric).toLowerCase().replace(/[-\s]+/g, "_") === "production_overhead";
//                 });
//                 setDimensionOverheadRows(productionOverheadRows.map((row) => {
//                     const month = String(first(row, ["period_name", "month", "period", "month_name"], "")).trim();
//                     const dimension = String(first(row, ["dimension_name", "group_name", "legal_entity_name", "parent_division_name", "subdivision_name", "legal_entity", "parent_division", "subdivision", "name", "label", "dimension"], "Unspecified"));
//                     const actual = numberOrNull(first(row, ["actual_reporting_currency", "production_overhead_actual", "actual", "actual_value", "actual_amount", "actual_aed"]));
//                     const target = numberOrNull(first(row, ["target_reporting_currency", "production_overhead_target", "target", "budget", "target_value", "budget_amount", "target_aed"]));
//                     const variance = numberOrNull(first(row, ["variance_reporting_currency", "production_overhead_variance", "variance", "variance_amount", "actual_variance"]));
//                     return { month, dimension, actual: actual == null ? null : actual / 1_000_000, target: target == null ? null : target / 1_000_000, variance: variance == null ? (actual != null && target != null ? (actual - target) / 1_000_000 : null) : variance / 1_000_000, raw: row };
//                 }).filter((row) => row.month));
//             })
//             .catch((e) => {
//                 if (!cancelled) {
//                     setDimensionOverheadRows([]);
//                     setDimensionOverheadError(e?.response?.data?.detail || e?.response?.data?.message || e.message || "Unable to load grouped production overhead.");
//                 }
//             })
//             .finally(() => { if (!cancelled) setDimensionOverheadLoading(false); });
//         return () => { cancelled = true; };
//     }, [JSON.stringify(appliedFilters), overheadGroupBy, retryCounter]);

//     React.useEffect(() => {
//         let cancelled = false;
//         setLoading(true); setError("");
//         const previousPeriod = previousPeriodName(appliedFilters.period, appliedFilters.year);
//         const previousYear = /^Jan/i.test(String(appliedFilters.period)) ? Number(appliedFilters.year) - 1 : Number(appliedFilters.year);
//         Promise.all([
//             getManufacturingDashboard(manufacturingFilters(appliedFilters)),
//             previousPeriod ? getManufacturingSummary(manufacturingFilters({ ...appliedFilters, period: previousPeriod, year: previousYear })).catch(() => null) : Promise.resolve(null)
//         ])
//             .then(([response, previousResponse]) => {
//                 if (cancelled) return;
//                 // Keep the same applied hierarchy/date/currency filters for the previous
//                 // period. Validate the response period so an older request cannot supply
//                 // the wrong month's values to the KPI comparison.
//                 setPreviousSummaryRows(extractSummaryRows(previousResponse, previousPeriod, previousYear));
//                 if (cancelled) return;
//                 const data = unwrapApiResponse(response);
//                 const sections = data?.sections || data?.data?.sections || data?.data || data || {};
//                 setDashboard({
//                     summary: asArray(sections.summary || sections.kpis),
//                     monthly: asArray(sections.monthly),
//                     // Accept the documented hyphenated response keys as well as
//                     // the legacy snake_case/camelCase keys. Keep all API calls,
//                     // filters, permissions, and downstream component logic intact.
//                     costMix: asArray(
//                         sections["cost-mix"] ||
//                         sections.cost_mix ||
//                         sections.costMix
//                     ),
//                     categoryBreakdown: asArray(
//                         sections["category-breakdown"] ||
//                         sections.category_breakdown ||
//                         sections.categoryBreakdown ||
//                         sections.breakdown
//                     ).map(normalizeBreakdownRow)
//                 });
//             })
//             .catch((e) => { if (!cancelled) { setDashboard({ summary: [], monthly: [], costMix: [], categoryBreakdown: [] }); setError(`Unable to load Manufacturing dashboard: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`); } })
//             .finally(() => { if (!cancelled) setLoading(false); });
//         return () => { cancelled = true; };
//     }, [buildQuery(appliedFilters), retryCounter, dashboardRefreshKey]);

//     const legalGroups = withoutAllOptions(filterOptions.legalGroups);
//     const selectedMainGroups = (Array.isArray(filters.legalGroup) ? filters.legalGroup : (filters.legalGroup ? [filters.legalGroup] : [])).map(String);
//     const selectedMainEntities = (Array.isArray(filters.legalEntity) ? filters.legalEntity : (filters.legalEntity ? [filters.legalEntity] : [])).map(String);
//     const selectedMainParents = (Array.isArray(filters.parent) ? filters.parent : (filters.parent ? [filters.parent] : [])).map(String);
//     const legalEntities = withoutAllOptions(filterOptions.legalEntities).filter((x) => {
//         const groupId = first(x, ["legal_group_id", "legalGroupId", "group_id"], null);
//         return !selectedMainGroups.length || groupId == null || selectedMainGroups.includes(String(groupId));
//     });
//     const parentDivisions = withoutAllOptions(filterOptions.parentDivisions).filter((x) => {
//         const entityId = first(x, ["legal_entity_id", "legalEntityId", "entity_id"], null);
//         const groupId = first(x, ["legal_group_id", "legalGroupId", "group_id"], null);
//         return (!selectedMainEntities.length || entityId == null || selectedMainEntities.includes(String(entityId))) && (!selectedMainGroups.length || groupId == null || selectedMainGroups.includes(String(groupId)));
//     });
//     const subdivisions = withoutAllOptions(filterOptions.subdivisions).filter((x) => {
//         const parentId = first(x, ["parent_division_id", "parentDivisionId"], null);
//         return !selectedMainParents.length || parentId == null || selectedMainParents.includes(String(parentId));
//     });
//     const viewGroups = withoutAllOptions(viewAllFilterOptions.legalGroups.length ? viewAllFilterOptions.legalGroups : filterOptions.legalGroups);
//     const selectedViewGroups = (Array.isArray(viewAllFilters.legalGroup) ? viewAllFilters.legalGroup : (viewAllFilters.legalGroup ? [viewAllFilters.legalGroup] : [])).map(String);
//     const selectedViewEntities = (Array.isArray(viewAllFilters.legalEntity) ? viewAllFilters.legalEntity : (viewAllFilters.legalEntity ? [viewAllFilters.legalEntity] : [])).map(String);
//     const selectedViewParents = (Array.isArray(viewAllFilters.parent) ? viewAllFilters.parent : (viewAllFilters.parent ? [viewAllFilters.parent] : [])).map(String);
//     const viewAllLegalEntities = withoutAllOptions(viewAllFilterOptions.legalEntities.length ? viewAllFilterOptions.legalEntities : filterOptions.legalEntities).filter((x) => {
//         const groupId = first(x, ["legal_group_id", "legalGroupId", "group_id"], null);
//         return !selectedViewGroups.length || groupId == null || selectedViewGroups.includes(String(groupId));
//     });
//     const viewAllParentDivisions = withoutAllOptions(viewAllFilterOptions.parentDivisions.length ? viewAllFilterOptions.parentDivisions : filterOptions.parentDivisions).filter((x) => {
//         const entityId = first(x, ["legal_entity_id", "legalEntityId", "entity_id"], null);
//         const groupId = first(x, ["legal_group_id", "legalGroupId", "group_id"], null);
//         return (!selectedViewEntities.length || entityId == null || selectedViewEntities.includes(String(entityId))) && (!selectedViewGroups.length || groupId == null || selectedViewGroups.includes(String(groupId)));
//     });
//     const viewAllSubdivisions = withoutAllOptions(viewAllFilterOptions.subdivisions.length ? viewAllFilterOptions.subdivisions : filterOptions.subdivisions).filter((x) => {
//         const parentId = first(x, ["parent_division_id", "parentDivisionId"], null);
//         return !selectedViewParents.length || parentId == null || selectedViewParents.includes(String(parentId));
//     });

//     const drillRows = dashboard.categoryBreakdown;
//     const toggleCostCategory = async (category) => {
//         const isOpen = expandedCostCategories.has(category);
//         setExpandedCostCategories((old) => {
//             const next = new Set(old);
//             isOpen ? next.delete(category) : next.add(category);
//             return next;
//         });
//         if (isOpen || Object.prototype.hasOwnProperty.call(inlineCategoryDetails, category)) return;
//         setInlineCategoryLoading((old) => ({ ...old, [category]: true }));
//         try {
//             const response = await getManufacturingHierarchyCategoryDetail(
//                 manufacturingFilters(appliedFilters),
//                 category
//             );
//             let payload = unwrapApiResponse(response);
//             for (let depth = 0; depth < 2 && payload?.data && !Array.isArray(payload?.rows); depth += 1) payload = payload.data;
//             const rows = asArray(payload?.rows || payload?.results || payload?.data || payload)
//                 .map(normalizeBreakdownRow);
//             setInlineCategoryDetails((old) => ({ ...old, [category]: rows }));
//         } catch (e) {
//             setInlineCategoryDetails((old) => ({
//                 ...old,
//                 [category]: { error: e?.response?.data?.detail || e?.response?.data?.message || e.message || "Unable to load account details." }
//             }));
//         } finally {
//             setInlineCategoryLoading((old) => ({ ...old, [category]: false }));
//         }
//     };
//     const summaryRows = dashboard.summary;
//     const kpis = useMemo(() => {
//         const palette = [
//             { icon: "▤", color: "#0f9f8f", bg: "#e9faf5" }, { icon: "▥", color: "#7c3aed", bg: "#f3edff" },
//             { icon: "⬡", color: "#d97706", bg: "#fff6e8" }, { icon: "◔", color: "#2563eb", bg: "#eaf4ff" },
//             { icon: "%", color: "#0f766e", bg: "#e6fffb" }
//         ];
//         return summaryRows.map((row, index) => {
//             const unit = String(first(row, ["unit"], "AED")).toLowerCase();
//             const metric = String(first(row, ["metric", "label", "name"], "Metric"));
//             const percent = unit.includes("%") || unit.includes("percent") || /percentage|percent|pct|%/.test(metric.toLowerCase());
//             const actual = numberOrNull(first(row, ["actual", "actual_value"]));
//             const target = numberOrNull(first(row, ["target", "budget", "target_value"]));
//             const apiVariance = numberOrNull(first(row, ["variance"]));
//             const apiVariancePp = numberOrNull(first(row, ["variance_pp"]));
//             const displayVariance = percent
//                 ? (apiVariancePp != null ? apiVariancePp : (actual != null && target != null ? actual - target : null))
//                 : (apiVariance != null ? apiVariance / 1_000_000 : (actual != null && target != null ? (actual - target) / 1_000_000 : null));
//             return {
//                 period: String(first(row, ["phase", "period"], index < 5 ? "PTD" : "YTD")).toUpperCase(),
//                 displayOrder: numberOrNull(first(row, ["display_order", "displayOrder"])) ?? index,
//                 label: String(first(row, ["label", "display_name", "metric_label", "metric", "name"], metric)),
//                 value: actual == null ? null : (percent ? actual : actual / 1_000_000),
//                 target: target == null ? null : (percent ? target : target / 1_000_000),
//                 percent,
//                 lowerIsBetter: !/absorption/i.test(metric),
//                 icon: palette[index % palette.length].icon, color: palette[index % palette.length].color,
//                 bg: palette[index % palette.length].bg,
//                 varianceDisplay: displayVariance,
//                 varianceStatus: first(row, ["variance_status"]),
//                 variancePct: numberOrNull(first(row, ["variance_pct"])),
//                 variancePp: apiVariancePp,
//                 lastMonthValue: (() => {
//                     const metricKey = normalizeMetricKey(metric);
//                     const phaseKey = String(first(row, ["phase", "period"], "")).toUpperCase();
//                     // Match the previous period by metric + PTD/YTD phase + unit.
//                     // Read only its actual value: target/variance must never be used
//                     // for the "Vs Last Month" comparison.
//                     const previous = previousSummaryRows.find((candidate) => {
//                         const candidateMetric = first(candidate, ["metric", "label", "display_name", "metric_label", "name"], "");
//                         const candidatePhase = String(first(candidate, ["phase", "period"], "")).toUpperCase();
//                         const candidateUnit = String(first(candidate, ["unit"], "")).toLowerCase();
//                         const candidateIsPercent = candidateUnit.includes("percent") || candidateUnit.includes("%") ||
//                             /(?:percent|pct|%)/i.test(String(candidateMetric));
//                         return normalizeMetricKey(candidateMetric) === metricKey &&
//                             candidatePhase === phaseKey &&
//                             candidateIsPercent === percent;
//                     });
//                     const prev = numberOrNull(first(previous, ["actual", "actual_value", "actual_reporting_currency"]));
//                     return prev == null ? null : (percent ? prev : prev / 1_000_000);
//                 })(),
//                 raw: row
//             };
//         }).sort((a, b) => {
//             const phaseOrder = (a.period === "PTD" ? 0 : 1) - (b.period === "PTD" ? 0 : 1);
//             const orderFor = (item) => {
//                 const label = String(item.label || "").toLowerCase();
//                 if (label.includes("cost of material") && !label.includes("%") && !label.includes("against sales")) return 0;
//                 if (label.includes("cost of material") && (label.includes("%") || label.includes("against sales"))) return 1;
//                 if (label.includes("production overhead")) return 2;
//                 if (label.includes("overhead absorption") && !label.includes("%")) return 3;
//                 if (label.includes("overhead absorption") && label.includes("%")) return 4;
//                 return 10 + item.displayOrder;
//             };
//             return phaseOrder || orderFor(a) - orderFor(b) || a.displayOrder - b.displayOrder;
//         });
//     }, [summaryRows, previousSummaryRows]);

//     // The dashboard endpoint's monthly section is the authoritative Jan-to-selected-month
//     // trend. Do not feed monthly-by-dimension grouped rows into this chart: their grain and
//     // shape differ and summing dimension rows can double-count alternative series.
//     const monthlySource = dashboard.monthly;
//     const trendData = (() => {
//         const rows = monthlySource;
//         const wide = rows.some((row) =>
//             ["production_overhead", "production_overhead_actual", "production_overhead_target", "material", "material_actual", "material_target", "cost_of_material", "cost_of_material_actual", "cost_of_material_target", "labour", "labour_actual", "labour_target", "direct_labour", "direct_labour_actual", "overheads", "overheads_actual", "overheads_target", "manufacturing_overheads", "manufacturing_overheads_actual", "manufacturing_direct_overheads", "manufacturing_direct_overheads_actual", "manufacturing_direct_overheads_target", "manufacturing_direct_overheads_variance"].some((key) => row?.[key] !== undefined)
//         );
//         if (wide) return rows.map((row) => {
//             const month = String(first(row, ["period_name", "month", "period"], ""));
//             const amount = (keys) => {
//                 const value = numberOrNull(first(row, keys));
//                 return value == null ? null : value / 1_000_000;
//             };
//             return {
//                 month,
//                 actual: amount(["production_overhead_actual", "production_overhead", "actual_reporting_currency", "actual", "actual_total"]),
//                 target: amount(["production_overhead_target", "production_overhead_budget", "target_reporting_currency", "target", "budget", "target_total"]),
//                 material: amount(["material_actual", "cost_of_material_actual", "material", "cost_of_material"]),
//                 materialTarget: amount(["material_target", "cost_of_material_target", "material_budget", "cost_of_material_budget"]),
//                 labour: amount(["labour_actual", "direct_labour_actual", "labour", "direct_labour", "direct_labor"]),
//                 labourTarget: amount(["labour_target", "direct_labour_target", "labour_budget", "direct_labour_budget"]),
//                 overheads: amount(["overheads_actual", "manufacturing_overheads_actual", "manufacturing_direct_overheads_actual", "overheads", "manufacturing_overheads", "manufacturing_direct_overheads"]),
//                 overheadsTarget: amount(["overheads_target", "manufacturing_overheads_target", "manufacturing_direct_overheads_target", "overheads_budget", "manufacturing_overheads_budget"]),
//                 overheadsVariance: amount(["overheads_variance", "manufacturing_overheads_variance", "manufacturing_direct_overheads_variance", "manufacturing_direct_overheads_variance_aed"])
//             };
//         });
//         const grouped = new Map();
//         rows.forEach((row) => {
//             const month = String(first(row, ["period_name", "month", "period"], ""));
//             if (!grouped.has(month)) grouped.set(month, { month });
//             const item = grouped.get(month);
//             const metric = String(first(row, ["metric", "metric_name", "series", "category"], "")).toLowerCase().replace(/[_-]+/g, " ");
//             const actual = numberOrNull(first(row, ["actual_reporting_currency", "actual", "actual_value", "actual_amount", "actual_aed"]));
//             const target = numberOrNull(first(row, ["target_reporting_currency", "target", "budget", "target_value", "budget_amount"]));
//             const reportedVariance = numberOrNull(first(row, ["variance_reporting_currency", "variance", "variance_amount", "actual_variance"]));
//             const assign = (a, t) => { item[a] = actual == null ? null : actual / 1_000_000; item[t] = target == null ? null : target / 1_000_000; };
//             if (metric.includes("material percentage") || metric.includes("material %")) return;
//             if (metric.includes("material")) assign("material", "materialTarget");
//             else if (metric.includes("labour") || metric.includes("labor")) assign("labour", "labourTarget");
//             else if (metric.includes("manufacturing overhead") || metric.includes("direct overhead")) {
//                 assign("overheads", "overheadsTarget");
//                 item.overheadsVariance = reportedVariance == null ? null : reportedVariance / 1_000_000;
//             }
//             else if (metric.includes("production overhead")) assign("actual", "target");
//         });
//         const monthOrder = (value) => { const m = String(value).match(/^([A-Za-z]{3})[- ](\d{2,4})$/); return m ? Number(m[2]) * 12 + monthNames.indexOf(m[1]) : 0; };
//         return Array.from(grouped.values()).sort((a, b) => monthOrder(a.month) - monthOrder(b.month));
//     })();
//     const monthAnalysis = trendData.map((d) => ({ ...d, variance: d.actual != null && d.target != null ? d.actual - d.target : null }));
//     // The API monthly payload is long-form: one row per metric/month. Build a dedicated
//     // production-overhead series from the exact metric rows instead of relying on the
//     // broader cost-trend mapper, so the chart remains populated for the documented schema.
//     const overheadByMonth = new Map();
//     monthlySource.forEach((row) => {
//         const metricValue = first(row, ["metric", "metric_name", "series"], null);
//         const metric = String(metricValue ?? first(row, ["category", "category_name", "label"], "")).toLowerCase().replace(/[_-]+/g, " ");
//         if (!metric.includes("production overhead")) return;
//         const month = String(first(row, ["period_name", "month", "period"], "")).trim();
//         if (!month) return;
//         const actualRaw = numberOrNull(first(row, ["actual_reporting_currency", "actual", "actual_value", "actual_amount", "actual_aed"]));
//         const targetRaw = numberOrNull(first(row, ["target_reporting_currency", "target", "budget", "target_value", "budget_amount", "target_aed"]));
//         const current = overheadByMonth.get(month) || { month, actual: null, target: null };
//         current.actual = actualRaw == null ? current.actual : actualRaw / 1_000_000;
//         current.target = targetRaw == null ? current.target : targetRaw / 1_000_000;
//         overheadByMonth.set(month, current);
//     });
//     const monthSortLocal = (v) => { const m = String(v).match(/^([A-Za-z]{3})[- ](\d{2,4})$/); return m ? Number(m[2]) * 12 + monthNames.indexOf(m[1]) : 0; };
//     const overheadFallbackByMonth = new Map(trendData
//         .filter((row) => row.actual != null || row.target != null)
//         .map((row) => [row.month, { month: row.month, actual: row.actual, target: row.target }]));
//     overheadByMonth.forEach((row, month) => {
//         const fallback = overheadFallbackByMonth.get(month) || { month, actual: null, target: null };
//         overheadFallbackByMonth.set(month, {
//             month,
//             actual: row.actual ?? fallback.actual,
//             target: row.target ?? fallback.target
//         });
//     });
//     const overheadChartData = Array.from(overheadFallbackByMonth.values())
//         .filter((row) => row.actual != null || row.target != null)
//         .sort((a, b) => monthSortLocal(a.month) - monthSortLocal(b.month));
//     const dimensionNames = Array.from(new Set(dimensionOverheadRows.map((row) => row.dimension))).sort((a, b) => a.localeCompare(b));
//     // Keep the grouped chart readable: show up to four groups by default. Users can
//     // explicitly select a different subset without changing the applied data scope.
//     React.useEffect(() => {
//         // If main filters change (e.g. Legal Group RKME), remove stale selected names
//         // and let the new permitted group options drive the chart.
//         setOverheadSelectedDimensions((current) => current.filter((name) => dimensionNames.includes(name)));
//     }, [dimensionNames.join("\\u001f")]);
//     const visibleDimensionNames = overheadSelectedDimensions.length
//         ? dimensionNames.filter((name) => overheadSelectedDimensions.includes(name))
//         : dimensionNames.slice(0, 5);
//     // One X-axis tick per month. Each selected dimension gets its own Actual/Target
//     // series, preventing long repeated "dimension · month" labels from overlapping.
//     const dimensionOverheadChartData = (() => {
//         const byMonth = new Map();
//         dimensionOverheadRows.filter((row) => visibleDimensionNames.includes(row.dimension)).forEach((row) => {
//             if (!byMonth.has(row.month)) byMonth.set(row.month, { month: row.month });
//             const monthRow = byMonth.get(row.month);
//             monthRow[`${row.dimension}__actual`] = row.actual;
//             monthRow[`${row.dimension}__target`] = row.target;
//         });
//         return Array.from(byMonth.values()).sort((a, b) => monthSortLocal(a.month) - monthSortLocal(b.month));
//     })();
//     const mixColors = COLORS_BY_CATEGORY;
//     const costMixRaw = dashboard.costMix.map((row, i) => ({
//         name: String(first(row, ["category", "name", "metric", "label"], "Cost category")),
//         // `actual` is the reporting-currency amount; never substitute raw AED values for another currency.
//         rawAmount: numberOrNull(first(row, ["actual_reporting_currency", "actual", "amount_reporting_currency", "amount", "amount_aed", "value"])),
//         apiPct: numberOrNull(first(row, ["percentage", "pct", "share_pct", "percent"])),
//         color: mixColors[i % mixColors.length]
//     }));
//     const requiredMixLabels = ["material", "labour", "overhead", "opex", "operating expense"];
//     const costMixComponents = costMixRaw.filter((item) => {
//         const label = item.name.toLowerCase();
//         if (label.includes("absorption") || label.includes("percentage") || label.includes("%")) return false;
//         return requiredMixLabels.some((candidate) => label.includes(candidate));
//     });
//     const hasAllMixAmounts = costMixComponents.length === 4 && costMixComponents.every((item) => item.rawAmount != null);
//     const costMixTotal = hasAllMixAmounts ? costMixComponents.reduce((sum, item) => sum + item.rawAmount, 0) : null;
//     const costMix = costMixComponents.map((item) => ({
//         name: item.name,
//         amount: item.rawAmount == null ? null : item.rawAmount / 1_000_000,
//         pct: item.apiPct != null ? item.apiPct : (hasAllMixAmounts && costMixTotal > 0 && item.rawAmount != null ? item.rawAmount / costMixTotal * 100 : null),
//         color: item.color
//     }));
//     const filteredRows = drillRows.filter((r) => r.category.toLowerCase().includes(search.toLowerCase()));
//     const visibleRows = filteredRows.slice(0, pageSize);
//     const exportReport = async (format, reportName = "category-breakdown", filterSet = filters) => {
//         try {
//             setDetailError("");
//             const apiReportName = reportName === "category-breakdown" ? "category-breakdown-by-hierarchy"
//                 : reportName === "category-detail" ? "category-detail-by-hierarchy"
//                     : reportName === "production-overhead-monthly" ? "monthly-by-dimension" : reportName;
//             const exportFilters = {
//                 ...manufacturingFilters(filterSet), search,
//                 ...(reportName === "production-overhead-monthly" ? { group_by: overheadGroupBy, metric: "production_overhead" } : {})
//             };
//             if (reportName === "category-detail") {
//                 exportFilters.category = selectedDetailCategory;
//             }
//             // Use the hierarchy report names for both Excel and PDF, without
//             // changing the legacy report names used by other dashboard exports.
//             const response = format === "excel"
//                 ? await exportManufacturingExcel(exportFilters, apiReportName)
//                 : await exportManufacturingPDF(exportFilters, apiReportName);
//             const blob = response?.data instanceof Blob
//                 ? response.data
//                 : response instanceof Blob
//                     ? response
//                     : new Blob([response?.data ?? response]);
//             const disposition = response?.headers?.["content-disposition"] || "";
//             const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
//             const groupingSuffix = reportName === "production-overhead-monthly" ? `_${overheadGroupBy}` : "";
//             const fallback = `Manufacturing_${reportName.replace(/-/g, "_")}${groupingSuffix}_${filterSet.period}.${format === "excel" ? "xlsx" : "pdf"}`;
//             let filename = fallback;
//             if (match) {
//                 const rawName = (match[1] || match[2] || "").trim();
//                 try { filename = decodeURIComponent(rawName); } catch { filename = rawName || fallback; }
//             }
//             const url = URL.createObjectURL(blob);
//             const link = document.createElement("a");
//             link.href = url;
//             link.download = filename;
//             document.body.appendChild(link);
//             link.click();
//             link.remove();
//             window.setTimeout(() => URL.revokeObjectURL(url), 1000);
//         } catch (e) {
//             const message = e?.response?.data?.detail || e?.response?.data?.message || e.message;
//             setDetailError(`Unable to export ${format.toUpperCase()}: ${message}`);
//         }
//     };
//     const exportExcel = () => exportReport("excel");
//     const exportPdf = () => exportReport("pdf");
//     const openViewAll = async (reportName = "category-breakdown", category = "", filterOverride = appliedFilters) => {
//         setViewAll(reportName);
//         setSelectedDetailCategory(reportName === "category-detail" ? category : "");
//         viewAllFiltersRef.current = {
//             ...filterOverride,
//             legalGroup: [...(filterOverride.legalGroup || [])],
//             legalEntity: [...(filterOverride.legalEntity || [])],
//             parent: [...(filterOverride.parent || [])],
//             sub: [...(filterOverride.sub || [])],
//         };
//         setViewAllFilters(viewAllFiltersRef.current);
//         setViewAllUnit("millions");
//         setSearch("");
//         setViewAllPage(1);
//         setDetailLoading(true); setDetailError(""); setViewAllRows([]); setViewAllTotals(null);
//         try {
//             if (reportName === "monthly-trend") {
//                 setPageSize(20);
//                 setViewAllRows(trendData.map((r) => ({
//                     category: r.month,
//                     actualPtd: r.material,
//                     targetPtd: r.materialTarget,
//                     variancePtd: r.material != null && r.materialTarget != null ? r.material - r.materialTarget : null,
//                     actualYtd: r.labour,
//                     targetYtd: r.labourTarget,
//                     varianceYtd: r.labour != null && r.labourTarget != null ? r.labour - r.labourTarget : null,
//                     overheadActual: r.overheads,
//                     overheadTarget: r.overheadsTarget,
//                     overheadVariance: r.overheadsVariance ?? (r.overheads != null && r.overheadsTarget != null ? r.overheads - r.overheadsTarget : null),
//                 })));
//                 setDetailLoading(false);
//                 return;
//             }
//             if (reportName === "production-overhead-monthly") {
//                 setPageSize(20);
//                 const response = await getManufacturingMonthlyByDimension({ ...manufacturingFilters(filterOverride), metric: "production_overhead" }, overheadGroupBy);
//                 let payload = unwrapApiResponse(response);
//                 for (let depth = 0; depth < 2 && payload?.data && !Array.isArray(payload?.rows); depth += 1) payload = payload.data;
//                 const rows = asArray(payload?.rows || payload?.results || payload?.data || payload).filter((row) => {
//                     const metric = first(row, ["metric", "metric_code", "metric_name", "measure", "measure_code"], null);
//                     return metric == null || String(metric).toLowerCase().replace(/[-\s]+/g, "_") === "production_overhead";
//                 }).map((row) => {
//                     const month = String(first(row, ["period_name", "month", "period", "month_name"], "")).trim();
//                     const dimension = String(first(row, ["dimension_name", "group_name", "legal_entity_name", "parent_division_name", "subdivision_name", "legal_entity", "parent_division", "subdivision", "name", "label", "dimension"], "Unspecified"));
//                     const actual = numberOrNull(first(row, ["actual_reporting_currency", "production_overhead_actual", "actual", "actual_value", "actual_amount", "actual_aed"]));
//                     const target = numberOrNull(first(row, ["target_reporting_currency", "production_overhead_target", "target", "budget", "target_value", "budget_amount", "target_aed"]));
//                     const variance = numberOrNull(first(row, ["variance_reporting_currency", "production_overhead_variance", "variance", "variance_amount", "actual_variance"]));
//                     return { month, dimension, actualRaw: actual, targetRaw: target, varianceRaw: variance };
//                 }).filter((row) => row.month);
//                 const monthSort = (value) => {
//                     const match = String(value).match(/^([A-Za-z]{3})[- ](\d{2,4})$/);
//                     if (!match) return 0;
//                     const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2]);
//                     return year * 12 + monthNames.findIndex((m) => m.toLowerCase() === match[1].toLowerCase());
//                 };
//                 const monthColumns = Array.from(new Set(rows.map((row) => row.month))).sort((a, b) => monthSort(a) - monthSort(b));
//                 const pivot = new Map();
//                 rows.forEach((row) => {
//                     if (!pivot.has(row.dimension)) pivot.set(row.dimension, { category: row.dimension, dimension: row.dimension, monthColumns });
//                     const targetRow = pivot.get(row.dimension);
//                     targetRow[`month__${row.month}`] = row.actualRaw == null ? null : row.actualRaw / 1_000_000;
//                     targetRow[`target__${row.month}`] = row.targetRaw == null ? null : row.targetRaw / 1_000_000;
//                     targetRow[`variance__${row.month}`] = row.varianceRaw == null ? (row.actualRaw != null && row.targetRaw != null ? (row.actualRaw - row.targetRaw) / 1_000_000 : null) : row.varianceRaw / 1_000_000;
//                 });
//                 const pivotRows = Array.from(pivot.values()).map((row) => {
//                     const actuals = monthColumns.map((month) => numberOrNull(row[`month__${month}`])).filter((v) => v != null);
//                     const targets = monthColumns.map((month) => numberOrNull(row[`target__${month}`])).filter((v) => v != null);
//                     const variances = monthColumns.map((month) => numberOrNull(row[`variance__${month}`])).filter((v) => v != null);
//                     return {
//                         ...row,
//                         actualPtd: actuals.length ? actuals.reduce((sum, v) => sum + v, 0) : null,
//                         targetPtd: targets.length ? targets.reduce((sum, v) => sum + v, 0) : null,
//                         variancePtd: variances.length ? variances.reduce((sum, v) => sum + v, 0) : null,
//                         monthColumns,
//                     };
//                 });
//                 setViewAllRows(pivotRows);
//                 setDetailLoading(false);
//                 return;
//             }
//             const viewFilters = {
//                 ...manufacturingFilters(filterOverride),
//                 category: reportName === "category-detail" ? (category || selectedDetailCategory) : category,
//                 page: 1,
//                 page_size: pageSize,
//                 search: "",
//             };
//             const apiReportName = reportName === "category-breakdown" ? "category-breakdown-by-hierarchy"
//                 : reportName === "category-detail" ? "category-detail-by-hierarchy" : reportName;
//             // Route the two hierarchy reports through their explicit service helpers.
//             // Other report types keep using the existing generic View All service.
//             const response = reportName === "category-breakdown"
//                 ? await getManufacturingHierarchyCategoryBreakdown(viewFilters)
//                 : reportName === "category-detail"
//                     ? await getManufacturingHierarchyCategoryDetail(
//                         viewFilters,
//                         category || selectedDetailCategory
//                     )
//                     : await getManufacturingViewAll(viewFilters, apiReportName);
//             const data = unwrapApiResponse(response);
//             const payload = data?.data && !data?.rows ? data.data : data;
//             setViewAllTotals(payload?.totals || null);
//             setViewAllRows(asArray(payload?.rows ? payload : payload?.data || payload).map((row) => {
//                 const normalized = normalizeBreakdownRow(row);
//                 return reportName === "category-detail" ? { ...normalized, category: selectedDetailCategory || category || normalized.category } : normalized;
//             }));
//         } catch (e) {
//             setDetailError(`Unable to load View All: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`);
//         } finally { setDetailLoading(false); }
//     };
//     const applyViewAllFilters = async () => {
//         const reportName = viewAll || "category-breakdown";
//         const currentViewFilters = viewAllFiltersRef.current || viewAllFilters;
//         const selectedFilters = {
//             ...currentViewFilters,
//             legalGroup: [...(currentViewFilters.legalGroup || [])],
//             legalEntity: [...(currentViewFilters.legalEntity || [])],
//             parent: [...(currentViewFilters.parent || [])],
//             sub: [...(currentViewFilters.sub || [])],
//         };
//         setDetailError("");
//         setViewAllPage(1);
//         setDetailLoading(true);
//         setViewAllRows([]);
//         const requestId = ++viewOptionsRequestId.current;
//         try {
//             // Refresh cascade options asynchronously, but never make the first Apply click
//             // wait for that request. Use the values selected in the View All controls now.
//             const optionsRequestId = requestId;
//             getManufacturingFilterOptions(manufacturingFilters(selectedFilters)).then((optionsResponse) => {
//                 if (optionsRequestId !== viewOptionsRequestId.current) return;
//                 const scopedOptions = parseManufacturingFilterOptions(optionsResponse);
//                 setViewAllFilterOptions((old) => ({ ...scopedOptions, years: scopedOptions.years.length ? scopedOptions.years : old.years, periods: scopedOptions.periods.length ? scopedOptions.periods : old.periods }));
//             }).catch(() => { /* Keep applying the selected report filters even if option refresh fails. */ });
//             if (reportName === "production-overhead-monthly") {
//                 const response = await getManufacturingMonthlyByDimension({ ...manufacturingFilters(selectedFilters), metric: "production_overhead" }, overheadGroupBy);
//                 let payload = unwrapApiResponse(response);
//                 for (let depth = 0; depth < 2 && payload?.data && !Array.isArray(payload?.rows); depth += 1) payload = payload.data;
//                 const rows = asArray(payload?.rows || payload?.results || payload?.data || payload).filter((row) => {
//                     const metric = first(row, ["metric", "metric_code", "metric_name", "measure", "measure_code"], null);
//                     return metric == null || String(metric).toLowerCase().replace(/[-\s]+/g, "_") === "production_overhead";
//                 }).map((row) => {
//                     const month = String(first(row, ["period_name", "month", "period", "month_name"], "")).trim();
//                     const dimension = String(first(row, ["dimension_name", "group_name", "legal_entity_name", "parent_division_name", "subdivision_name", "legal_entity", "parent_division", "subdivision", "name", "label", "dimension"], "Unspecified"));
//                     const actual = numberOrNull(first(row, ["actual_reporting_currency", "production_overhead_actual", "actual", "actual_value", "actual_amount", "actual_aed"]));
//                     const target = numberOrNull(first(row, ["target_reporting_currency", "production_overhead_target", "target", "budget", "target_value", "budget_amount", "target_aed"]));
//                     const variance = numberOrNull(first(row, ["variance_reporting_currency", "production_overhead_variance", "variance", "variance_amount", "actual_variance"]));
//                     return { month, dimension, actualRaw: actual, targetRaw: target, varianceRaw: variance };
//                 }).filter((row) => row.month);
//                 const monthSort = (value) => {
//                     const match = String(value).match(/^([A-Za-z]{3})[- ](\d{2,4})$/);
//                     if (!match) return 0;
//                     const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2]);
//                     return year * 12 + monthNames.findIndex((m) => m.toLowerCase() === match[1].toLowerCase());
//                 };
//                 const monthColumns = Array.from(new Set(rows.map((row) => row.month))).sort((a, b) => monthSort(a) - monthSort(b));
//                 const pivot = new Map();
//                 rows.forEach((row) => {
//                     if (!pivot.has(row.dimension)) pivot.set(row.dimension, { category: row.dimension, dimension: row.dimension, monthColumns });
//                     const targetRow = pivot.get(row.dimension);
//                     targetRow[`month__${row.month}`] = row.actualRaw == null ? null : row.actualRaw / 1_000_000;
//                     targetRow[`target__${row.month}`] = row.targetRaw == null ? null : row.targetRaw / 1_000_000;
//                     targetRow[`variance__${row.month}`] = row.varianceRaw == null ? (row.actualRaw != null && row.targetRaw != null ? (row.actualRaw - row.targetRaw) / 1_000_000 : null) : row.varianceRaw / 1_000_000;
//                 });
//                 const pivotRows = Array.from(pivot.values()).map((row) => {
//                     const actuals = monthColumns.map((month) => numberOrNull(row[`month__${month}`])).filter((v) => v != null);
//                     const targets = monthColumns.map((month) => numberOrNull(row[`target__${month}`])).filter((v) => v != null);
//                     const variances = monthColumns.map((month) => numberOrNull(row[`variance__${month}`])).filter((v) => v != null);
//                     return {
//                         ...row,
//                         actualPtd: actuals.length ? actuals.reduce((sum, v) => sum + v, 0) : null,
//                         targetPtd: targets.length ? targets.reduce((sum, v) => sum + v, 0) : null,
//                         variancePtd: variances.length ? variances.reduce((sum, v) => sum + v, 0) : null,
//                         monthColumns,
//                     };
//                 });
//                 setViewAllRows(pivotRows);
//                 return;
//             }
//             if (reportName === "monthly-trend") {
//                 const response = await getManufacturingDashboard(manufacturingFilters(selectedFilters));
//                 const data = unwrapApiResponse(response);
//                 const sections = data?.sections || data?.data?.sections || data?.data || data || {};
//                 const monthly = asArray(sections.monthly);
//                 if (reportName === "production-overhead-monthly") {
//                     const byMonth = new Map();
//                     monthly.forEach((row) => {
//                         const metric = String(first(row, ["metric", "metric_name", "series", "category", "category_name", "label"], "")).toLowerCase().replace(/[_-]+/g, " ");
//                         if (!metric.includes("production overhead")) return;
//                         const month = String(first(row, ["period_name", "month", "period"], "")).trim();
//                         if (!month) return;
//                         const actual = numberOrNull(first(row, ["actual_reporting_currency", "actual", "actual_value", "actual_amount", "actual_aed"]));
//                         const target = numberOrNull(first(row, ["target_reporting_currency", "target", "budget", "target_value", "budget_amount", "target_aed"]));
//                         const item = byMonth.get(month) || { category: month, actualPtd: null, targetPtd: null, variancePtd: null };
//                         if (actual != null) item.actualPtd = actual / 1_000_000;
//                         if (target != null) item.targetPtd = target / 1_000_000;
//                         item.variancePtd = item.actualPtd != null && item.targetPtd != null ? item.actualPtd - item.targetPtd : null;
//                         byMonth.set(month, item);
//                     });
//                     setViewAllRows(Array.from(byMonth.values()).sort((a, b) => monthSort(a.category) - monthSort(b.category)));
//                 } else {
//                     const grouped = new Map();
//                     monthly.forEach((row) => {
//                         const month = String(first(row, ["period_name", "month", "period"], "")).trim();
//                         const metric = String(first(row, ["metric", "metric_name", "series", "category"], "")).toLowerCase().replace(/[_-]+/g, " ");
//                         if (!month) return;
//                         const actual = numberOrNull(first(row, ["actual_reporting_currency", "actual", "actual_value", "actual_amount", "actual_aed"]));
//                         const target = numberOrNull(first(row, ["target_reporting_currency", "target", "budget", "target_value", "budget_amount", "target_aed"]));
//                         const reportedVariance = numberOrNull(first(row, ["variance_reporting_currency", "variance", "variance_amount", "actual_variance"]));
//                         const item = grouped.get(month) || { category: month };
//                         const assign = (actualKey, targetKey) => { item[actualKey] = actual == null ? null : actual / 1_000_000; item[targetKey] = target == null ? null : target / 1_000_000; };
//                         if (metric.includes("material") && !metric.includes("percentage")) assign("actualPtd", "targetPtd");
//                         else if (metric.includes("labour") || metric.includes("labor")) assign("actualYtd", "targetYtd");
//                         else if (metric.includes("manufacturing direct overhead") || metric.includes("manufacturing overhead") || metric.includes("direct overhead")) {
//                             assign("overheadActual", "overheadTarget");
//                             item.overheadVariance = reportedVariance != null
//                                 ? reportedVariance / 1_000_000
//                                 : (actual != null && target != null ? (actual - target) / 1_000_000 : null);
//                         }
//                         grouped.set(month, item);
//                     });
//                     setViewAllRows(Array.from(grouped.values()).sort((a, b) => monthSort(a.category) - monthSort(b.category)).map(r => ({ ...r, variancePtd: r.actualPtd != null && r.targetPtd != null ? r.actualPtd - r.targetPtd : null, varianceYtd: r.actualYtd != null && r.targetYtd != null ? r.actualYtd - r.targetYtd : null })));
//                 }
//             } else {
//                 await openViewAll(reportName, reportName === "category-detail" ? selectedDetailCategory : "", selectedFilters);
//             }
//         } catch (e) {
//             setDetailError(`Unable to apply View All filters: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`);
//         } finally { setDetailLoading(false); }
//     };
//     const monthSort = (value) => { const m = String(value).match(/^([A-Za-z]{3})[- ](\d{2,4})$/); return m ? Number(m[2]) * 12 + monthNames.indexOf(m[1]) : 0; };
//     const retryDashboard = () => { setError(""); setDetailError(""); setRetryCounter((x) => x + 1); };
//     const getResetFilters = () => {
//         const fjGroup = legalGroups.find((x) => /\bfj\s*group\b/i.test(labelOf(x)));
//         const markedGroup = legalGroups.find((x) => x?.is_default || x?.default);
//         const defaultGroup = fjGroup || markedGroup || (legalGroups.length === 1 ? legalGroups[0] : null);
//         return { ...FILTER_DEFAULTS, legalGroup: defaultGroup ? [String(idOf(defaultGroup))] : [] };
//     };
//     const resetFilters = () => {
//         const resetValues = getResetFilters();
//         filtersRef.current = resetValues;
//         setFilters(resetValues);
//         setAppliedFilters(resetValues);
//         setSearch("");
//         setError(""); setDetailError("");
//         setRetryCounter((x) => x + 1);
//     };
//     const filterActionStyle = { height: 32, padding: "0 14px", borderRadius: 7, fontSize: 11, fontWeight: 750, cursor: "pointer", whiteSpace: "nowrap" };
//     const panelButton = { border: "1px solid #dbe3ef", background: "#fff", color: COLORS.navy, borderRadius: 7, padding: "5px 9px", fontSize: 10.5, fontWeight: 750, cursor: "pointer" };
//     const unitLabel = viewAllUnit === "aed" ? "AED" : "AED Millions";
//     const productionOverheadMonths = Array.from(new Set(viewAllRows[0]?.monthColumns || []));
//     const viewAllHeaders = viewAll === "monthly-trend"
//         ? ["Month", "Material Actual", "Material Target", "Material Variance", "Labour Actual", "Labour Target", "Labour Variance", "MFG EXP ACTUAL", "MFG EXP TARGET", "MFG EXP VARIANCE"]
//         : viewAll === "production-overhead-monthly"
//             ? [overheadGroupBy === "legal_entity" ? "Legal Entity" : overheadGroupBy === "parent_division" ? "Parent Division" : "Subdivision", ...productionOverheadMonths, "Actual YTD", "Target YTD", "Variance", "Variance %"]
//             : viewAll === "category-detail"
//                 ? ["Legal Entity", "Parent Division", "Subdivision", "Account Code", "Account Name", "Actual PTD", "Target PTD", "Variance PTD", "Actual YTD", "Target YTD", "Variance YTD"]
//                 : ["Legal Entity", "Parent Division", "Subdivision", "Cost Category", "Actual PTD", "Target PTD", "Variance PTD", "Actual YTD", "Target YTD", "Variance YTD"];

//     const viewAllFilteredRows = viewAllRows.filter((r) =>
//         [r.category, r.dimension, r.accountCode, r.accountName, r.legalEntity, r.parentDivision, r.subDivision]
//             .some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()))
//     );
//     const viewAllPageCount = Math.max(1, Math.ceil(viewAllFilteredRows.length / viewAllPageSize));
//     const safeViewAllPage = Math.min(viewAllPage, viewAllPageCount);
//     const pagedViewAllRows = viewAllFilteredRows.slice((safeViewAllPage - 1) * viewAllPageSize, safeViewAllPage * viewAllPageSize);
//     // Totals are calculated from every filtered record, not just the current page.
//     // Monthly values are already normalized to millions in the production-overhead pivot.
//     const productionOverheadTotalRow = viewAll === "production-overhead-monthly" ? {
//         months: productionOverheadMonths.map((month) => {
//             const values = viewAllFilteredRows
//                 .map((row) => numberOrNull(row[`month__${month}`]))
//                 .filter((value) => value != null);
//             return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
//         }),
//         actual: (() => {
//             const values = viewAllFilteredRows.map((row) => numberOrNull(row.actualPtd)).filter((value) => value != null);
//             return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
//         })(),
//         target: (() => {
//             const values = viewAllFilteredRows.map((row) => numberOrNull(row.targetPtd)).filter((value) => value != null);
//             return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
//         })(),
//         variance: (() => {
//             const values = viewAllFilteredRows.map((row) => numberOrNull(row.variancePtd)).filter((value) => value != null);
//             return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
//         })(),
//     } : null;
//     const productionOverheadTotalVariancePct = productionOverheadTotalRow?.variance != null &&
//         productionOverheadTotalRow?.target != null && productionOverheadTotalRow.target !== 0
//         ? productionOverheadTotalRow.variance / Math.abs(productionOverheadTotalRow.target) * 100
//         : null;
//     // Monthly Cost Trend totals are calculated from the full filtered dataset,
//     // never from the current page. Each displayed measure gets its own total.
//     const monthlyTrendTotalRow = viewAll === "monthly-trend" ? [
//         "Total",
//         ...["actualPtd", "targetPtd", "variancePtd", "actualYtd", "targetYtd", "varianceYtd", "overheadActual", "overheadTarget", "overheadVariance"].map((key) => {
//             const values = viewAllFilteredRows.map((row) => numberOrNull(row[key])).filter((value) => value != null);
//             return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
//         }),
//     ] : null;

//     return <div className="manufacturing-dashboard" style={{ minHeight: "100vh", background: COLORS.page, padding: "20px 0 32px", color: COLORS.navy, fontFamily: "Inter, Segoe UI, Arial, sans-serif", boxSizing: "border-box" }}>
//         <style>{`
//       .manufacturing-dashboard, .manufacturing-dashboard * { box-sizing: border-box; }
//       .manufacturing-dashboard { color:#0f172a; font-family:Inter, Segoe UI, Arial, sans-serif; }
//       .manufacturing-dashboard button, .manufacturing-dashboard select, .manufacturing-dashboard input { font-family:inherit; }
//       @keyframes shimmer { 0% {background-position: 200% 0} 100% {background-position: -200% 0} }
//       .manufacturing-dashboard .mfg-skeleton { background:linear-gradient(100deg,#edf2f8 20%,#f8fafc 38%,#edf2f8 56%); background-size:220% 100%; animation:shimmer 1.25s ease-in-out infinite; border-radius:9px; }
//       @keyframes enterUp { from { opacity:0; transform:translateY(8px) } to {opacity:1;transform:translateY(0)} }
//       .manufacturing-dashboard .mfg-select:focus { border-color:#a5b4fc !important; box-shadow:0 0 0 2px #e0e7ff !important; }
//       .manufacturing-dashboard .mfg-row { transition:background .12s ease; }
//       .manufacturing-dashboard .mfg-row:hover { background:#f8fafc !important; }
//       .manufacturing-dashboard .mfg-action { transition:all .15s ease; }
//       .manufacturing-dashboard .mfg-action:hover { transform:translateY(-1px); box-shadow:0 4px 10px #0f172a12; }
//       .manufacturing-dashboard .mfg-filter-grid { background:#fff !important; padding:10px 12px !important; gap:7px !important; box-shadow:0 2px 8px rgba(15,23,42,.035); overflow:visible !important; position:relative; z-index:8; }
//       .manufacturing-dashboard .mfg-multiselect-field:has([aria-expanded="true"]) { z-index:150 !important; }
//       .manufacturing-dashboard .mfg-filter-grid:has([aria-expanded="true"]) { z-index:100 !important; }
//       .manufacturing-dashboard .mfg-multiselect-field { overflow:visible !important; }
//       .manufacturing-dashboard .mfg-filter-grid { overflow:visible !important; }
//       .manufacturing-dashboard .mfg-menu-container { z-index:30; }
//       .manufacturing-dashboard .mfg-kpi-grid { grid-template-columns:repeat(5,minmax(0,1fr)) !important; }
//       .manufacturing-dashboard .mfg-filter-field > span:first-child { color:#0b2d67 !important; }
//       .manufacturing-dashboard .mfg-filter-actions { min-width:max-content; }
//       .manufacturing-dashboard .mfg-panel { transition:transform .22s ease, box-shadow .22s ease, border-color .22s ease; animation:mfgPanelIn .42s ease both; }
//       .manufacturing-dashboard .mfg-panel:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(15,23,42,.075) !important; border-color:#d8d5ff !important; }
//       .manufacturing-dashboard .mfg-select { transition:border-color .18s ease, box-shadow .18s ease, background .18s ease; }
//       .manufacturing-dashboard .mfg-select:hover { border-color:#a5b4fc !important; }
//       .manufacturing-dashboard .mfg-select:focus { border-color:#5B3FE4 !important; box-shadow:0 0 0 3px rgba(91,63,228,.12) !important; }
//       .manufacturing-dashboard .mfg-row { transition:background .16s ease, transform .16s ease; }
//       .manufacturing-dashboard .mfg-row:hover { background:#f0f5ff !important; }
//       .manufacturing-dashboard .mfg-mix-row[data-tooltip] { position:relative; }
//       .manufacturing-dashboard .mfg-mix-row[data-tooltip]:hover::after { content:attr(data-tooltip); position:absolute; left:8px; bottom:calc(100% + 7px); z-index:60; max-width:min(340px,80vw); white-space:normal; background:linear-gradient(135deg,#111827,#273449); color:#fff; border:1px solid #64748b55; border-radius:9px; padding:9px 11px; font-size:10.5px; font-weight:650; line-height:1.45; box-shadow:0 12px 28px rgba(15,23,42,.24); pointer-events:none; animation:mfgTipIn .14s ease both; }
//       @keyframes mfgTipIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
//       @keyframes mfgPanelIn { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:translateY(0); } }
//       .manufacturing-dashboard .mfg-panel { box-shadow:0 2px 8px rgba(15,23,42,.035) !important; }
//       .manufacturing-dashboard .mfg-chart-panel { transition: transform .24s ease, box-shadow .24s ease, border-color .24s ease; }
//       .manufacturing-dashboard .mfg-chart-panel:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(91,63,228,.10) !important; border-color: #c7d2fe !important; }
//       .manufacturing-dashboard .mfg-chart-canvas { animation: enterUp .48s ease both; }
//       .manufacturing-dashboard .mfg-kpi-grid { gap:8px !important; }
//       .manufacturing-dashboard table { font-variant-numeric:tabular-nums; }
//       .manufacturing-dashboard th { font-size:.66rem !important; font-weight:700 !important; letter-spacing:.025em; color:#64748b !important; background:#f8fafc !important; }
//       .manufacturing-dashboard td { font-size:.72rem; }
//       /* Layout: trend and cost mix share the first row; grouped overhead and drill-down each get a full-width row. */
//       .manufacturing-dashboard .mfg-dashboard-panel-grid { grid-template-areas: "trend mix" "directcost directcost" "overhead overhead" "drilldown drilldown" !important; }
//       .manufacturing-dashboard .mfg-dashboard-panel-grid > .mfg-panel-column { display: contents !important; }
//       .manufacturing-dashboard .mfg-dashboard-panel-grid .mfg-trend-panel { grid-area: trend; min-width: 0; }
//       .manufacturing-dashboard .mfg-dashboard-panel-grid .mfg-costmix-panel { grid-area: mix; min-width: 0; }
//       .manufacturing-dashboard .mfg-dashboard-panel-grid .mfg-direct-cost-panel { grid-area: directcost; min-width: 0; }
//       .manufacturing-dashboard .mfg-dashboard-panel-grid .mfg-overhead-panel { grid-area: overhead; min-width: 0; }
//       .manufacturing-dashboard .mfg-dashboard-panel-grid .mfg-drilldown-panel { grid-area: drilldown; min-width: 0; }
//       @media (max-width: 1000px) { .manufacturing-dashboard .mfg-dashboard-panel-grid { grid-template-columns:minmax(0,1fr) !important; grid-template-areas: "trend" "mix" "directcost" "overhead" "drilldown" !important; } }
//       .manufacturing-dashboard .mfg-modal-table-wrap { scrollbar-width:thin; scrollbar-color:#94a3b8 #f1f5f9; }
//       .manufacturing-dashboard .mfg-modal-table-wrap::-webkit-scrollbar { width:8px; height:8px; }
//       .manufacturing-dashboard .mfg-modal-table-wrap::-webkit-scrollbar-thumb { background:#94a3b8; border-radius:8px; border:2px solid #f1f5f9; }
//       .manufacturing-dashboard .mfg-modal-table { margin-bottom:0 !important; }
//       .manufacturing-dashboard .mfg-modal-table tfoot { position:sticky !important; bottom:0 !important; z-index:6 !important; }
//       .manufacturing-dashboard .mfg-modal-table tfoot td { position:sticky !important; bottom:0 !important; }
//       .manufacturing-dashboard .mfg-modal-table tfoot td:first-child { left:0 !important; z-index:8 !important; }
//       /* Reference-matched Direct Cost Drill-Down table typography and hierarchy. */
//       .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table {
//         width:100% !important;
//         border-collapse:collapse !important;
//         table-layout:fixed !important;
//         font-size:12px !important;
//         color:#334155 !important;
//         font-variant-numeric:tabular-nums !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table thead th {
//         padding:9px 10px !important;
//         background:#f8fafc !important;
//         color:#234675 !important;
//         font-size:11px !important;
//         font-weight:800 !important;
//         letter-spacing:.025em !important;
//         text-transform:uppercase !important;
//         border-right:1px solid #e4e9ef !important;
//         border-bottom:2px solid #dbe3ef !important;
//         white-space:nowrap !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table tbody > tr:not(:has(.mfg-direct-cost-detail-table)) > td {
//         padding:9px 10px !important;
//         font-size:11.5px !important;
//         font-weight:650 !important;
//         border-bottom:1px solid #edf0f4 !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table tbody > tr > td:nth-child(2) {
//         font-size:11.5px !important;
//         font-weight:800 !important;
//         color:#344054 !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table tbody > tr:hover > td {
//         background:#f8fbff !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table .mfg-direct-cost-detail-table thead th,
//       .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-detail-table thead th {
//         padding:8px 10px !important;
//         background:#f8fafc !important;
//         font-size:10.5px !important;
//         font-weight:800 !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-detail-table tbody td {
//         padding:8px 10px !important;
//         font-size:11px !important;
//         line-height:1.35 !important;
//         border-top:1px solid #edf0f4 !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table tbody tr:last-child td {
//         border-bottom:1px solid #e2e8f0 !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table tbody tr:has(td[colspan="8"]) td {
//         padding:0 !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel .cost-structure-table th { background:#f1f5f9 !important; color:#0B2E6F !important; font-weight:800 !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel .cost-structure-table td { font-variant-numeric:tabular-nums; }
//       /* Match the OPEX Month-on-Month table header across every Manufacturing View All table. */
//       .manufacturing-dashboard .mfg-modal-table thead th {
//         background:#f1f5f9 !important;
//         color:#0B2E6F !important;
//         text-transform:uppercase !important;
//         font-weight:800 !important;
//         font-size:.68rem !important;
//         letter-spacing:.025em !important;
//         border-bottom:2px solid #dbe3ef !important;
//       }
//       /* Match the OPEX header treatment on the main Manufacturing Cost Drill-Down table. */
//       .manufacturing-dashboard .mfg-drilldown-panel table thead th {
//         background:#f1f5f9 !important;
//         color:#0B2E6F !important;
//         text-transform:uppercase !important;
//         font-weight:800 !important;
//         font-size:.68rem !important;
//         letter-spacing:.025em !important;
//         border-bottom:2px solid #dbe3ef !important;
//       }
//       /* OPEX-style Cost Category table: compact uppercase labels, disclosure arrows,
//          alternating rows and a softly highlighted total row. */
//       .manufacturing-dashboard .mfg-drilldown-panel tbody tr.mfg-row:hover td { background:#eef3ff !important; }
//       .manufacturing-dashboard .mfg-drilldown-panel tbody tr.mfg-row td:first-child { color:#172554 !important; }
//       .manufacturing-dashboard .mfg-drilldown-panel tfoot td { background:#f1efff !important; font-weight:800 !important; }
//       .manufacturing-dashboard .mfg-modal-table .mfg-sticky-first-col {
//         position:sticky !important;
//         left:0 !important;
//         background:#fff !important;
//         z-index:2 !important;
//         box-shadow:2px 0 0 rgba(226,232,240,.95);
//       }
//       .manufacturing-dashboard .mfg-modal-table thead .mfg-sticky-first-col {
//         background:#f1f5f9 !important;
//         color:#0B2E6F !important;
//         z-index:7 !important;
//       }
//       .manufacturing-dashboard .mfg-modal-table tbody tr:nth-child(even) .mfg-sticky-first-col { background:#f8fafc !important; }
//       .manufacturing-dashboard .mfg-modal-table tbody tr:nth-child(odd) .mfg-sticky-first-col { background:#fff !important; }
//       @media (max-width: 1150px) { .manufacturing-dashboard .mfg-overhead-controls { flex-wrap: wrap !important; } }
//       @media (max-width: 1000px) { .manufacturing-dashboard .mfg-filter-grid { grid-template-columns:repeat(3,minmax(0,1fr)) !important; } .manufacturing-dashboard .mfg-filter-actions { grid-column:1 / -1; justify-content:flex-end; } .manufacturing-dashboard .mfg-content-grid { grid-template-columns:1fr !important; } .manufacturing-dashboard .mfg-kpi-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; } }
//       @media (max-width: 600px) { .manufacturing-dashboard .mfg-filter-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; } .manufacturing-dashboard .mfg-kpi-grid { grid-template-columns:1fr !important; } .manufacturing-dashboard .mfg-header { align-items:flex-start !important; flex-direction:column !important; } }
//       /* Sales Revenue visual-parity pass: typography, spacing, panels and tables.
//          Styling-only overrides; no API, filter, RBAC, export or popup handlers changed. */
//       .manufacturing-dashboard {
//         color:#0B2E6F !important;
//         font-family:Inter, "Segoe UI", Arial, sans-serif !important;
//         font-size:12px !important;
//       }
//       .manufacturing-dashboard .mfg-header h1 {
//         color:#0B2E6F !important;
//         font-size:1.22rem !important;
//         line-height:1.3 !important;
//         letter-spacing:-.02em !important;
//         font-weight:800 !important;
//       }
//       .manufacturing-dashboard .mfg-header > div:first-child > div {
//         font-size:.72rem !important;
//         line-height:1.45 !important;
//       }
//       .manufacturing-dashboard .mfg-filter-grid {
//         border:1px solid #e2e8f0 !important;
//         border-radius:12px !important;
//         padding:10px 12px !important;
//         margin-bottom:12px !important;
//         gap:8px !important;
//         box-shadow:0 2px 6px rgba(15,23,42,.035) !important;
//       }
//       .manufacturing-dashboard .mfg-filter-field > span:first-child {
//         color:#0B2E6F !important;
//         font-size:.68rem !important;
//         font-weight:750 !important;
//         margin-bottom:4px !important;
//       }
//       .manufacturing-dashboard .mfg-select {
//         min-height:34px !important;
//         height:34px;
//         border-radius:7px !important;
//         border-color:#dbe3ef !important;
//         font-family:inherit !important;
//         font-size:.72rem !important;
//         color:#334155 !important;
//         min-width:0 !important;
//       }
//       .manufacturing-dashboard .mfg-multiselect-trigger {
//         height:auto !important;
//         min-height:38px !important;
//         max-height:none !important;
//         box-sizing:border-box !important;
//         white-space:normal !important;
//         overflow:visible !important;
//         text-overflow:clip !important;
//         line-height:1.25 !important;
//         overflow-wrap:anywhere !important;
//       }
//       .manufacturing-dashboard .mfg-filter-grid > *,
//       .manufacturing-dashboard .mfg-filter-grid .mfg-filter-field,
//       .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field { min-width:0 !important; }
//       .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-trigger > span:first-child { max-width:100%; }
//       .manufacturing-dashboard .mfg-filter-grid .mfg-filter-actions { align-self:end; }
//       /* Keep filter controls inside both dashboard and View All panels at all widths. */
//       .manufacturing-dashboard .mfg-filter-grid { grid-template-columns:repeat(auto-fit,minmax(min(100%,145px),1fr)) !important; overflow:visible !important; align-items:end !important; }
//       .manufacturing-dashboard .mfg-filter-grid .mfg-filter-actions { min-width:0 !important; flex-wrap:wrap !important; white-space:nowrap !important; }
//       .manufacturing-dashboard .mfg-multiselect-field { min-width:0 !important; max-width:100% !important; }
//       .manufacturing-dashboard .mfg-multiselect-trigger { box-sizing:border-box !important; width:100% !important; max-width:100% !important; overflow-wrap:anywhere !important; word-break:break-word !important; }
//       .manufacturing-dashboard .mfg-multiselect-trigger > span:first-child { display:block !important; max-width:100% !important; white-space:normal !important; overflow-wrap:anywhere !important; word-break:break-word !important; }
//       /* Selected labels grow vertically so the active filter value is never clipped. */
//       .manufacturing-dashboard button.mfg-multiselect-trigger {
//         display:flex !important;
//         align-items:center !important;
//         min-height:38px !important;
//         height:auto !important;
//         max-height:none !important;
//         box-sizing:border-box !important;
//         padding:7px 30px 7px 9px !important;
//         line-height:1.25 !important;
//         white-space:normal !important;
//         overflow:visible !important;
//         text-overflow:clip !important;
//         overflow-wrap:anywhere !important;
//       }
//       .manufacturing-dashboard button.mfg-multiselect-trigger > span:first-child {
//         flex:1 1 auto !important;
//         min-width:0 !important;
//         max-width:100% !important;
//         white-space:normal !important;
//         overflow:visible !important;
//         text-overflow:clip !important;
//         overflow-wrap:anywhere !important;
//         word-break:break-word !important;
//         padding-right:2px !important;
//       }
//       .manufacturing-dashboard .mfg-filter-grid { align-items:stretch !important; }
//       .manufacturing-dashboard .mfg-filter-field { align-self:stretch !important; }
//       .manufacturing-dashboard .mfg-filter-actions { align-self:end !important; }
//       .manufacturing-dashboard .mfg-multiselect-field { z-index:1; }
//       .manufacturing-dashboard .mfg-multiselect-field:has(button[aria-expanded="true"]) { z-index:150 !important; }
//       .manufacturing-dashboard .mfg-direct-cost-table thead th {
//         background:#f1f5f9 !important;
//         color:#173b68 !important;
//         font-size:11px !important;
//         font-weight:800 !important;
//         text-transform:uppercase !important;
//         letter-spacing:.02em !important;
//         border-bottom:2px solid #dbe3ef !important;
//         padding:9px 8px !important;
//         white-space:nowrap !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr:nth-child(even) { background:#f8fafc !important; }
//       .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr:hover > td { background:#eef3ff !important; }
//       .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr > td { border-bottom:1px solid #edf0f4 !important; }
//       .manufacturing-dashboard .mfg-direct-cost-detail-table thead th { background:#fff !important; color:#173b68 !important; }
//       .manufacturing-dashboard .mfg-direct-cost-detail-table tbody tr.mfg-direct-cost-detail-row td {
//         background:inherit !important;
//         color:#475569 !important;
//         font-size:11px !important;
//         font-weight:500 !important;
//         border-bottom:1px solid #edf0f4 !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-detail-table tbody tr.mfg-direct-cost-detail-row:nth-child(even) td { background:#f8fafc !important; }
//       .manufacturing-dashboard .mfg-direct-cost-detail-table tbody tr.mfg-direct-cost-detail-row:hover td { background:#eef3ff !important; }
//       .manufacturing-dashboard .mfg-panel {
//         border:1px solid #e2e8f0 !important;
//         border-radius:12px !important;
//         padding:12px 14px !important;
//         box-shadow:0 2px 6px rgba(15,23,42,.035) !important;
//         background:#fff !important;
//       }
//       .manufacturing-dashboard .mfg-panel > div:first-child {
//         margin-bottom:10px !important;
//         gap:12px !important;
//       }
//       .manufacturing-dashboard .mfg-panel > div:first-child > div > div:first-child {
//         color:#0B2E6F !important;
//         font-size:.84rem !important;
//         line-height:1.3 !important;
//         font-weight:800 !important;
//         letter-spacing:-.01em !important;
//       }
//       .manufacturing-dashboard .mfg-panel > div:first-child > div > div:nth-child(2) {
//         color:#64748b !important;
//         font-size:.70rem !important;
//         line-height:1.4 !important;
//         margin-top:3px !important;
//       }
//       .manufacturing-dashboard .mfg-kpi-grid {
//         gap:8px !important;
//       }
//       .manufacturing-dashboard .mfg-kpi-grid > div {
//         border-radius:12px !important;
//         box-shadow:0 1px 4px rgba(15,23,42,.035) !important;
//       }
//       .manufacturing-dashboard table {
//         font-family:Inter, "Segoe UI", Arial, sans-serif !important;
//         font-variant-numeric:tabular-nums !important;
//       }
//       .manufacturing-dashboard th,
//       .manufacturing-dashboard .mfg-modal-table thead th,
//       .manufacturing-dashboard .mfg-drilldown-panel table thead th {
//         color:#0B2E6F !important;
//         background:#f1f5f9 !important;
//         text-transform:uppercase !important;
//         font-size:.68rem !important;
//         font-weight:800 !important;
//         letter-spacing:.025em !important;
//         line-height:1.3 !important;
//         border-bottom:2px solid #dbe3ef !important;
//         padding:10px 9px !important;
//       }
//       .manufacturing-dashboard td {
//         color:#334155;
//         font-size:.74rem !important;
//         line-height:1.4 !important;
//       }
//       .manufacturing-dashboard .mfg-drilldown-panel tbody td {
//         padding:10px 9px !important;
//       }
//       .manufacturing-dashboard .mfg-drilldown-panel tbody td:first-child,
//       .manufacturing-dashboard .mfg-drilldown-panel tbody td:first-child button {
//         color:#0B2E6F !important;
//         font-size:.74rem !important;
//         font-weight:700 !important;
//         line-height:1.4 !important;
//       }
//       .manufacturing-dashboard .mfg-drilldown-panel tbody tr:nth-child(even) td {
//         background:#f8fafc !important;
//       }
//       .manufacturing-dashboard .mfg-drilldown-panel tbody tr:nth-child(odd) td {
//         background:#fff !important;
//       }
//       .manufacturing-dashboard .mfg-drilldown-panel tbody tr.mfg-row:hover td {
//         background:#eef3ff !important;
//       }
//       .manufacturing-dashboard .mfg-drilldown-panel tfoot td {
//         background:#f1f5f9 !important;
//         color:#0B2E6F !important;
//         font-weight:800 !important;
//         border-top:1px solid #dbe3ef !important;
//       }
//       .manufacturing-dashboard .mfg-modal-table tbody td {
//         padding:9px 10px !important;
//         font-size:.73rem !important;
//         line-height:1.4 !important;
//       }
//       .manufacturing-dashboard .mfg-action,
//       .manufacturing-dashboard .mfg-filter-actions button {
//         font-family:inherit !important;
//         font-size:.70rem !important;
//         font-weight:750 !important;
//         border-radius:7px !important;
//       }
//       .manufacturing-dashboard .mfg-chart-panel .recharts-cartesian-axis-tick text {
//         font-family:Inter, "Segoe UI", Arial, sans-serif !important;
//         font-size:10px !important;
//         fill:#64748b !important;
//       }
//       .manufacturing-dashboard .mfg-chart-panel .recharts-cartesian-grid line {
//         stroke:#e2e8f0 !important;
//       }
//       @media (max-width:1000px) {
//         .manufacturing-dashboard .mfg-filter-grid { gap:8px !important; }
//         .manufacturing-dashboard .mfg-panel { padding:11px !important; }
//       }

//       /* FINAL FIX: match the supplied P&L Direct Cost Drill-Down reference.
//          Scope the category table and nested account table independently so global
//          dashboard table rules cannot bold or recolor the detail rows. */
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) {
//         width:100% !important; table-layout:fixed !important; border-collapse:collapse !important;
//         color:#334155 !important; font-family:Inter, "Segoe UI", Arial, sans-serif !important;
//         font-size:11.5px !important; font-variant-numeric:tabular-nums !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > thead > tr > th {
//         padding:9px 10px !important; background:#f1f5f9 !important; color:#234675 !important;
//         font-size:11px !important; font-weight:800 !important; text-transform:uppercase !important;
//         letter-spacing:.025em !important; border-right:1px solid #e4e9ef !important;
//         border-bottom:2px solid #dbe3ef !important; white-space:nowrap !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr > td {
//         padding:10px 9px !important; font-size:11.5px !important; line-height:1.35 !important;
//         font-weight:500 !important; border-right:1px solid #edf0f4 !important;
//         border-bottom:1px solid #e8edf4 !important; vertical-align:middle !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr > td:nth-child(2) {
//         color:#344054 !important; font-weight:800 !important; text-transform:uppercase !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr:hover > td { background:#eef3ff !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table {
//         width:100% !important; table-layout:fixed !important; border-collapse:collapse !important;
//         margin:0 !important; font-family:Inter, "Segoe UI", Arial, sans-serif !important;
//         font-size:11px !important; font-variant-numeric:tabular-nums !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > thead > tr > th {
//         padding:8px 10px !important; background:#f1f5f9 !important; color:#234675 !important;
//         font-size:10.5px !important; font-weight:800 !important; text-transform:uppercase !important;
//         letter-spacing:.02em !important; line-height:1.25 !important; border-right:1px solid #e4e9ef !important;
//         border-bottom:2px solid #dbe3ef !important; white-space:nowrap !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td {
//         padding:10px 10px !important; background:#fff !important;
//         font-size:11px !important; font-weight:500 !important; line-height:1.35 !important;
//         border-right:1px solid #edf0f4 !important; border-bottom:1px solid #edf0f4 !important;
//         vertical-align:middle !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr:nth-child(even) > td { background:#f8fafc !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr:hover > td { background:#eef3ff !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td:nth-child(2),
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td:nth-child(3) {
//         color:#475569 !important; font-weight:500 !important; text-align:left !important; white-space:normal !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td:nth-child(n+4) {
//         text-align:right !important; white-space:nowrap !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td:nth-child(6),
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td:nth-child(9) { font-weight:800 !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr:last-child > td {
//         background:#f1f5f9 !important; font-weight:850 !important;
//         border-top:1px solid #cbd5e1 !important; border-bottom:1px solid #dbe3ef !important;
//       }
//       /* Keep filter triggers stable while showing up to two lines of a selected value. */
//       .manufacturing-dashboard .mfg-filter-grid { align-items:end !important; }
//       .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field { min-height:58px !important; }
//       .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field > span:first-child { height:14px !important; line-height:14px !important; overflow:hidden !important; }
//       .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-trigger > span:first-child { max-height:29px !important; }
//       .manufacturing-dashboard .mfg-filter-grid .mfg-filter-actions { align-self:end !important; }
//       @media print { body { background:#fff !important; } .manufacturing-dashboard .no-print { display:none !important; } .manufacturing-dashboard .print-panel { break-inside:avoid; box-shadow:none !important; } }

//       /* Final filter alignment: content-sized selected labels and a viewport-level dropdown. */
//       .manufacturing-dashboard .mfg-filter-grid,
//       .manufacturing-dashboard .mfg-filter-grid .mfg-filter-field,
//       .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field { min-width:0 !important; overflow:visible !important; }
//       .manufacturing-dashboard .mfg-filter-grid { position:relative !important; z-index:20 !important; }
//       .manufacturing-dashboard button.mfg-multiselect-trigger {
//         width:100% !important; height:auto !important; min-height:38px !important; max-height:none !important;
//         display:flex !important; align-items:center !important; box-sizing:border-box !important;
//         overflow:visible !important; white-space:normal !important; text-overflow:clip !important;
//         padding:7px 28px 7px 9px !important; line-height:1.25 !important; overflow-wrap:anywhere !important;
//       }
//       .manufacturing-dashboard button.mfg-multiselect-trigger > span:first-child {
//         display:block !important; flex:1 1 auto !important; min-width:0 !important; max-width:100% !important;
//         overflow:visible !important; white-space:normal !important; text-overflow:clip !important;
//         overflow-wrap:anywhere !important; word-break:break-word !important;
//         line-height:1.25 !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-panel { overflow:visible !important; }
//       .manufacturing-dashboard .mfg-direct-cost-table { width:100% !important; border-collapse:collapse !important; table-layout:fixed !important; color:#334155 !important; font-family:Inter, "Segoe UI", Arial, sans-serif !important; font-variant-numeric:tabular-nums !important; }
//       .manufacturing-dashboard .mfg-direct-cost-table > thead > tr > th {
//         height:36px !important; padding:9px 8px !important; background:#f1f5f9 !important; color:#173b68 !important;
//         font-size:11px !important; font-weight:800 !important; text-transform:uppercase !important; letter-spacing:.02em !important;
//         line-height:1.25 !important; border-right:1px solid #e4e9ef !important; border-bottom:2px solid #dbe3ef !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr:not(.mfg-direct-cost-detail-row) > td {
//         padding:10px 9px !important; min-height:40px !important; font-size:11px !important; line-height:1.35 !important;
//         font-weight:750 !important; border-right:1px solid #edf0f4 !important; border-bottom:1px solid #edf0f4 !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr:not(.mfg-direct-cost-detail-row):hover > td { background:#eef3ff !important; }
//       .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row > td {
//         padding:10px 9px !important; font-size:11px !important; line-height:1.35 !important; font-weight:500 !important;
//         color:#475569 !important; border-right:1px solid #edf0f4 !important; border-bottom:1px solid #edf0f4 !important;
//         vertical-align:middle !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row:nth-child(odd) > td { background:#fff !important; }
//       .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row:nth-child(even) > td { background:#f8fafc !important; }
//       .manufacturing-dashboard .mfg-direct-cost-detail-table > thead > tr > th {
//         height:35px !important; padding:8px 9px !important; background:#fff !important; color:#173b68 !important;
//         font-size:11px !important; font-weight:800 !important; text-transform:uppercase !important;
//         border-bottom:2px solid #dbe3ef !important; border-right:1px solid #e4e9ef !important;
//       }
//       .manufacturing-dashboard .mfg-direct-cost-detail-table { margin:0 !important; background:#fff !important; }
//       .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row > td:nth-child(2),
//       .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row > td:nth-child(3) { text-align:left !important; }
//       .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row > td:nth-child(n+4) { text-align:right !important; white-space:nowrap !important; }
//       .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr:last-child:not(.mfg-direct-cost-detail-row) > td { background:#f1f5f9 !important; color:#182338 !important; font-weight:850 !important; border-top:1px solid #dbe3ef !important; }

//       /* Last-in-cascade corrections for the supplied reference screenshot. */
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr > td { font-size:11.5px !important; line-height:1.35 !important; font-weight:500 !important; border-bottom:1px solid #e8edf4 !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr > td:nth-child(2) { font-weight:800 !important; text-transform:uppercase !important; color:#344054 !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > thead > tr > th { padding:8px 10px !important; background:#f1f5f9 !important; color:#234675 !important; font-size:10.5px !important; font-weight:800 !important; text-transform:uppercase !important; border-bottom:2px solid #dbe3ef !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row > td { padding:10px 10px !important; font-size:11px !important; line-height:1.35 !important; font-weight:500 !important; border-bottom:1px solid #edf0f4 !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row:nth-child(odd) > td { background:#fff !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row:nth-child(even) > td { background:#f8fafc !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row > td:nth-child(2),
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row > td:nth-child(3) { text-align:left !important; font-weight:500 !important; white-space:normal !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row > td:nth-child(n+4) { text-align:right !important; white-space:nowrap !important; font-weight:500 !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr:last-child > td { background:#f1f5f9 !important; font-weight:850 !important; border-top:1px solid #cbd5e1 !important; }
//       .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field { min-height:58px !important; }
//       .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field > span:first-child { height:14px !important; line-height:14px !important; }
//       .manufacturing-dashboard button.mfg-multiselect-trigger { height:auto !important; min-height:38px !important; max-height:none !important; align-items:center !important; white-space:normal !important; overflow:visible !important; }
//       .manufacturing-dashboard button.mfg-multiselect-trigger > span:first-child { display:block !important; white-space:normal !important; overflow:visible !important; text-overflow:clip !important; overflow-wrap:anywhere !important; word-break:break-word !important; max-height:none !important; }
//       /* Variance styling must beat legacy detail-table !important declarations. */
//       .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-positive,
//       .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-positive * { color:#15803d !important; font-weight:800 !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-negative,
//       .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-negative * { color:#dc2626 !important; font-weight:800 !important; }
//       .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-neutral,
//       .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-neutral * { color:#64748b !important; font-weight:800 !important; }
//       /* Stable OPEX-style filter triggers: selected labels stay inside the control. */
//       .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field { min-width:0 !important; width:100% !important; }
//       .manufacturing-dashboard button.mfg-multiselect-trigger {
//         display:flex !important; width:100% !important; min-width:0 !important;
//         height:38px !important; min-height:38px !important; max-height:38px !important;
//         overflow:hidden !important; white-space:nowrap !important; align-items:center !important;
//         flex-wrap:nowrap !important; position:relative !important;
//       }
//       .manufacturing-dashboard button.mfg-multiselect-trigger > span:first-child {
//         display:block !important; flex:1 1 auto !important; min-width:0 !important; max-width:100% !important;
//         height:auto !important; max-height:100% !important; line-height:18px !important;
//         white-space:nowrap !important; overflow:hidden !important; text-overflow:ellipsis !important;
//         overflow-wrap:normal !important; word-break:normal !important;
//       }
//       .manufacturing-dashboard .mfg-filter-grid { align-items:start !important; }
//       .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field > span:first-child { height:14px !important; line-height:14px !important; }

//     `}</style>

//         <header className="mfg-header print-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, background: "transparent", border: 0, borderRadius: 12, padding: "0 0 12px", marginBottom: 12, boxShadow: "none" }}>
//             <div style={{ minWidth: 0 }}>
//                 <h1 style={{ margin: 0, fontSize: "1.45rem", letterSpacing: "-.02em", lineHeight: 1.25, fontWeight: 800, color: COLORS.navy }}>🏭 Manufacturing Cost &amp; Production Performance</h1>
//                 <div style={{ marginTop: 3, fontSize: "0.78rem", color: COLORS.muted }}>Monitor material cost, production overhead, and overhead absorption performance.</div>
//                 <div style={{ marginTop: 4, fontSize: "0.72rem", color: "#64748b", fontWeight: 800 }}>
//                     <span style={{ color: "#16a34a" }}>
//                         Currency: {appliedFilters.currency || "AED"}
//                     </span>
//                     {" | "} Period:
//                     {appliedFilters.period}
//                 </div>
//             </div>
//             <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
//                 <ExportButtons onExcel={exportExcel} onPdf={exportPdf} />

//             </div>
//         </header>

//         <section className="mfg-filter-grid print-panel" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr)) auto", gap: 7, padding: "10px 12px", marginBottom: 14, borderRadius: 12, border: `1px solid ${COLORS.border}`, background: "#fff" }}>
//             <MultiSelectFilter label="Legal Group" value={filters.legalGroup} onChange={v => update("legalGroup", v)} options={legalGroups} />
//             <MultiSelectFilter label="Legal Entity" value={filters.legalEntity} onChange={v => update("legalEntity", v)} options={legalEntities} />
//             <MultiSelectFilter label="Parent Division" value={filters.parent} onChange={v => update("parent", v)} options={parentDivisions} />
//             <MultiSelectFilter label="Sub-Division" value={filters.sub} onChange={v => update("sub", v)} options={subdivisions} />
//             <Filter label="Year" value={filters.year} onChange={v => update("year", v)} options={[...new Set([filters.year, ...filterOptions.years.map((x) => String(idOf(x)))].filter(Boolean))]} icon="▦" />
//             <Filter label="Period" value={filters.period} onChange={v => update("period", v)} options={sortPeriodsChronologically(filterOptions.periods, filters.year)} hidePlaceholder icon="▦" />
//             <Filter label="Reporting Currency" value={filters.currency} onChange={v => update("currency", v)} options={["AED", "USD", "EUR", "GBP"]} icon="¤" />
//             <div className="mfg-filter-actions" style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 7, paddingBottom: 0 }}>
//                 <button type="button" aria-label="Apply Manufacturing Cost filters" onClick={() => {
//                     // Apply the exact values currently shown in the controls immediately.
//                     // Do not block the first click on a second hierarchy-options request.
//                     const currentFilters = filtersRef.current || filters;
//                     const selected = { ...currentFilters, legalGroup: [...(currentFilters.legalGroup || [])], legalEntity: [...(currentFilters.legalEntity || [])], parent: [...(currentFilters.parent || [])], sub: [...(currentFilters.sub || [])] };
//                     setError("");
//                     filtersRef.current = selected;
//                     setAppliedFilters(selected);
//                     setDashboardRefreshKey((x) => x + 1);
//                     // Refresh cascade options in the background; this must not delay applying
//                     // the user's selected scope or overwrite their current selections.
//                     const requestId = ++mainOptionsRequestId.current;
//                     getManufacturingFilterOptions(manufacturingFilters(selected)).then((optionsResponse) => {
//                         if (requestId !== mainOptionsRequestId.current) return;
//                         const scopedOptions = parseManufacturingFilterOptions(optionsResponse);
//                         setFilterOptions((old) => ({ ...scopedOptions, years: scopedOptions.years.length ? scopedOptions.years : old.years, periods: scopedOptions.periods.length ? scopedOptions.periods : old.periods }));
//                     }).catch((e) => {
//                         setError(`Unable to refresh hierarchy filters: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`);
//                     });
//                 }} className="mfg-action" style={{ ...filterActionStyle, height: 33, border: "1px solid #5B3FE4", background: "#5B3FE4", color: "#fff", padding: "0 13px" }}>Apply</button>
//                 <button type="button" onClick={resetFilters} className="mfg-action" style={{ ...filterActionStyle, height: 33, border: 0, background: "transparent", color: "#475569", padding: "0 8px" }}>Reset</button>
//             </div>
//         </section>

//         {(error || detailError) && <div role="alert" style={{ marginBottom: 10, padding: "10px 12px", border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", borderRadius: 9, fontSize: 12, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><span>{error || detailError}</span><button onClick={retryDashboard} style={{ border: "1px solid #fca5a5", background: "#fff", borderRadius: 7, padding: "5px 9px", cursor: "pointer" }}>Retry</button></div>}
//         {loading && <div aria-label="Loading manufacturing dashboard" style={{ display: "grid", gap: 10, marginBottom: 12 }}>
//             <div style={{ display: "grid", gap: 8 }}>{[0, 1].map((row) => <div key={row} style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 9 }}>{Array.from({ length: 5 }, (_, i) => <div key={i} className="mfg-skeleton" style={{ height: 94, border: "1px solid #e2e8f0" }} />)}</div>)}</div>
//             <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.65fr) minmax(350px,1fr)", gap: 12 }}><div className="mfg-skeleton" style={{ height: 250 }} /><div className="mfg-skeleton" style={{ height: 250 }} /></div>
//         </div>}
//         {!loading && <section aria-label="Period-to-date manufacturing KPIs" style={{ marginBottom: 9 }}>
//             <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: ".04em", color: "#64748b", margin: "0 0 6px 2px" }}>PERIOD TO DATE (PTD)</div>
//             <div className="mfg-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 9, marginBottom: 12 }}>
//                 {kpis.filter((item) => item.period === "PTD").map((item, i) => <KpiCard key={`${item.period}-${item.label}`} item={item} delay={i * .035} currency={appliedFilters.currency} />)}
//             </div>
//             <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: ".04em", color: "#64748b", margin: "0 0 6px 2px" }}>YEAR TO DATE (YTD)</div>
//             <div className="mfg-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 9 }}>
//                 {kpis.filter((item) => item.period === "YTD").map((item, i) => <KpiCard key={`${item.period}-${item.label}`} item={item} delay={i * .035} currency={appliedFilters.currency} />)}
//             </div>
//         </section>}

//         {!loading && <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 9, padding: "7px 11px", marginBottom: 10, background: "#f8fafc", color: "#64748b", fontSize: 11, display: "flex", gap: 8, alignItems: "center" }}>
//             <span style={{ display: "grid", placeItems: "center", width: 17, height: 17, borderRadius: "50%", background: "#e0e7ff", color: "#3730a3", fontWeight: 900, flexShrink: 0 }}>i</span>
//             Production Overhead = Direct Labour + Manufacturing / Direct Overheads. Overhead Absorption % = Absorbed Overhead ÷ Production Overhead × 100. Percentage variances are displayed as percentages (%). Values are sourced from the Manufacturing API; absorption recovery follows the signed P&L control.
//         </div>}

//         {!loading && <div className="mfg-content-grid mfg-dashboard-panel-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12, alignItems: "stretch" }}>
//             <div className="mfg-panel-column" style={{ display: "grid", gap: 10, minWidth: 0 }}>
//                 <Panel title="Monthly Cost Trend" subtitle="Actual vs Target by cost category" style={{ minHeight: 265 }} className="mfg-chart-panel mfg-trend-panel" action={<div className="mfg-menu-container" style={{ position: "relative" }}><button className="mfg-action" aria-label="Monthly trend options" title="More options" style={{ ...panelButton, width: 32, height: 30, padding: 0, fontSize: 19 }} onClick={() => setTrendMenuOpen(v => !v)}><MoreVertical size={17} strokeWidth={1.8} /></button>{trendMenuOpen && <div style={{ position: "absolute", right: 0, top: 35, zIndex: 50, width: 165, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 9, boxShadow: "0 10px 26px rgba(15,23,42,.16)", overflow: "hidden" }}><button onClick={() => { openViewAll("monthly-trend"); setTrendMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 11, fontWeight: 800, cursor: "pointer", color: "#334155" }}>🔎 View All</button><button onClick={() => { exportReport("excel", "monthly-trend", appliedFilters); setTrendMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>📊 Export Excel</button><button onClick={() => { exportReport("pdf", "monthly-trend", appliedFilters); setTrendMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📄 Export PDF</button></div>}</div>}>

//                     <div style={{ display: "flex", justifyContent: "flex-start", gap: 14, flexWrap: "wrap", margin: "0 0 3px 12px", paddingLeft: 4, fontSize: 10.5, color: "#475569" }}>
//                         {[["#14b8a6", "Material (Actual)", false], ["#14b8a6", "Material (Target)", true], ["#8b5cf6", "Labour (Actual)", false], ["#8b5cf6", "Labour (Target)", true], ["#f59e0b", "Overheads (Actual)", false], ["#f59e0b", "Overheads (Target)", true]].map(([c, t, target]) => <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i style={{ width: 10, height: 10, background: target ? `${c}20` : c, border: target ? `1px dashed ${c}` : `1px solid ${c}`, borderRadius: 3 }} />{t}</span>)}
//                     </div>
//                     <motion.div className="mfg-chart-canvas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} style={{ height: 190, marginTop: 12 }}>
//                         <ResponsiveContainer width="100%" height="100%">
//                             <BarChart data={trendData} margin={{ top: 7, right: 5, left: -15, bottom: 0 }} barGap={1} barCategoryGap="26%">
//                                 <CartesianGrid stroke="#e8eef6" strokeDasharray="3 3" vertical={false} />
//                                 <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
//                                 <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}M`} />
//                                 <Tooltip content={<TooltipBox />} />
//                                 <Bar dataKey="material" name="Material Actual" fill="#14b8a6" radius={[2, 2, 0, 0]} isAnimationActive />
//                                 <Bar dataKey="materialTarget" name="Material Target" fill="#14b8a6" fillOpacity={0.16} stroke="#14b8a6" strokeDasharray="4 3" radius={[2, 2, 0, 0]} />
//                                 <Bar dataKey="labour" name="Labour Actual" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
//                                 <Bar dataKey="labourTarget" name="Labour Target" fill="#8b5cf6" fillOpacity={0.16} stroke="#8b5cf6" strokeDasharray="4 3" radius={[2, 2, 0, 0]} />
//                                 <Bar dataKey="overheads" name="Overheads Actual" fill="#f59e0b" radius={[2, 2, 0, 0]} />
//                                 <Bar dataKey="overheadsTarget" name="Overheads Target" fill="#f59e0b" fillOpacity={0.16} stroke="#f59e0b" strokeDasharray="4 3" radius={[2, 2, 0, 0]} />
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </motion.div>
//                 </Panel>

//                 <ManufacturingDirectCostTable filters={appliedFilters} />

//                 <Panel title="Manufacturing Cost Drill-Down" subtitle="Actual, target and variance by cost category" className="mfg-drilldown-panel" action={<div style={{ display: "flex", alignItems: "center", gap: 7 }}><div role="group" aria-label="Manufacturing drill-down amount unit" style={{ display: "inline-flex", alignItems: "center", padding: 3, gap: 2, border: "1px solid #dbe3ef", borderRadius: 8, background: "#f1f5f9" }}><button type="button" onClick={() => setDrilldownUnit("aed")} aria-pressed={drilldownUnit === "aed"} style={{ border: 0, borderRadius: 6, padding: "5px 9px", background: drilldownUnit === "aed" ? "#0B2E6F" : "transparent", color: drilldownUnit === "aed" ? "#fff" : "#0B2E6F", fontSize: 10.5, fontWeight: 800, cursor: "pointer" }}>AED</button><button type="button" onClick={() => setDrilldownUnit("millions")} aria-pressed={drilldownUnit === "millions"} style={{ border: 0, borderRadius: 6, padding: "5px 9px", background: drilldownUnit === "millions" ? "#0B2E6F" : "transparent", color: drilldownUnit === "millions" ? "#fff" : "#0B2E6F", fontSize: 10.5, fontWeight: 800, cursor: "pointer" }}>AED Million</button></div><button type="button" onClick={() => setDrilldownCollapsed((collapsed) => !collapsed)} style={{ ...panelButton, height: 30, padding: "0 10px", color: "#0B2E6F", borderColor: "#0B2E6F", whiteSpace: "nowrap" }}>{drilldownCollapsed ? "⌄ Expand" : "⌃ Collapse"}</button><div className="mfg-menu-container" style={{ position: "relative" }}><button className="mfg-action" aria-label="Manufacturing drill-down options" title="More options" style={{ ...panelButton, width: 32, height: 30, padding: 0, fontSize: 19, lineHeight: 1 }} onClick={() => setDrillMenuOpen((v) => !v)}><MoreVertical size={17} strokeWidth={1.8} /></button>{drillMenuOpen && <div style={{ position: "absolute", right: 0, top: 35, zIndex: 50, width: 170, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 9, boxShadow: "0 10px 26px rgba(15,23,42,.16)", overflow: "hidden" }}><button onClick={() => { openViewAll("category-breakdown"); setDrillMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#334155" }}>🔎 View All</button><button onClick={() => { exportReport("excel", "category-breakdown"); setDrillMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, borderTop: "1px solid #f1f5f9", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📊 Export Excel</button><button onClick={() => { exportReport("pdf", "category-breakdown"); setDrillMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, borderTop: "1px solid #f1f5f9", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📄 Export PDF</button></div>}</div></div>}>
//                     {!drilldownCollapsed && <div style={{ overflowX: "auto" }}>
//                         <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12, minWidth: 650 }}>
//                             <thead><tr>{["COST CATEGORY", "ACTUAL PTD", "TARGET PTD", "VARIANCE PTD", "ACTUAL YTD", "TARGET YTD", "VARIANCE YTD"].map((h, i) => <th key={h} style={{ textAlign: i === 0 ? "left" : "right", padding: "10px 9px", color: "#1e40af", fontSize: 11, fontWeight: 850, textTransform: "uppercase", letterSpacing: ".025em", lineHeight: 1.25, background: "#ffffff", borderBottom: "2px solid #dbe3ef", whiteSpace: "normal" }}>{h}</th>)}</tr></thead>
//                             <tbody>{drillRows.map((r, idx) => <tr className="mfg-row" key={r.category} onClick={() => openViewAll("category-detail", r.category)} title={`Open account details for ${r.category}`} style={{ background: idx % 2 ? "#f8fafc" : "#fff", cursor: "pointer" }}>
//                                 <td title={`Open account details for ${r.category}`} style={{ padding: "10px 9px", color: "#172554", fontWeight: 700, fontSize: 12, borderBottom: "1px solid #e8edf5", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal", lineHeight: 1.4, maxWidth: 260 }}><button type="button" onClick={(event) => { event.stopPropagation(); openViewAll("category-detail", r.category); }} style={{ display: "inline-flex", alignItems: "flex-start", gap: 7, border: 0, padding: 0, background: "transparent", color: "#172554", font: "inherit", fontWeight: 700, textAlign: "left", cursor: "pointer", whiteSpace: "normal", overflowWrap: "anywhere" }}><span aria-hidden="true" style={{ color: "#000", fontSize: 11, lineHeight: "1.5", flex: "0 0 auto" }}>▶</span><span>{String(r.category || "").toUpperCase()}</span></button></td>
//                                 {[r.actualPtd, r.targetPtd, r.variancePtd, r.actualYtd, r.targetYtd, r.varianceYtd].map((v, i) => {
//                                     const isVariance = i === 2 || i === 5;
//                                     const status = i === 2 ? r.varianceStatusPtd : i === 5 ? r.varianceStatusYtd : null;
//                                     const absorption = /absorption/i.test(r.category);
//                                     const color = isVariance ? (v == null || Number(v) === 0 ? "#64748b" : Number(v) > 0 ? "#15803d" : "#dc2626") : "#334155";
//                                     return <td key={i} style={{ textAlign: "right", padding: "10px 9px", borderBottom: "1px solid #e8edf5", whiteSpace: "nowrap", fontWeight: isVariance ? 800 : 500, color: isVariance && (v == null || Number(v) === 0) ? "#64748b" : color }}>{v == null ? "—" : drilldownUnit === "millions" ? `${(Number(v) / 1_000_000).toFixed(2)}M` : fmtNum(v)}</td>;
//                                 })}
//                             </tr>)}</tbody>
//                             <tfoot><tr style={{ background: "#f1efff", fontWeight: 900 }}>{["Net Cost of Sales", ...[
//                                 ["actualPtd", "actual"], ["targetPtd", "target"], ["variancePtd", "variance"],
//                                 ["actualYtd", "actual"], ["targetYtd", "target"], ["varianceYtd", "variance"]
//                             ].map(([key, kind]) => {
//                                 if (!drillRows.length || !drillRows.every((r) => r[key] != null)) return null;
//                                 const total = drillRows.reduce((sum, r) => sum + r[key], 0);
//                                 // Absorption is a recovery and must be deducted from net cost of sales.
//                                 const absorption = drillRows.filter((r) => /absorption/i.test(r.category));
//                                 return key.startsWith("variance") ? total : total - absorption.reduce((sum, r) => sum + (numberOrNull(r[key]) || 0), 0);
//                             })
//                             ].map((v, i) => <td key={i} style={{ padding: "7px 6px", textAlign: i ? "right" : "left", color: i === 0 ? COLORS.navy : (i === 3 || i === 6) ? (v == null || Number(v) === 0 ? "#64748b" : Number(v) > 0 ? "#15803d" : "#dc2626") : COLORS.navy, fontWeight: i === 3 || i === 6 ? 900 : 800, whiteSpace: "nowrap" }}>{i === 0 ? v : v == null ? "—" : drilldownUnit === "millions" ? `${(Number(v) / 1_000_000).toFixed(2)}M` : fmtNum(v)}</td>)}</tr></tfoot>
//                         </table>
//                     </div>}
//                 </Panel>
//             </div>

//             <div className="mfg-panel-column" style={{ display: "grid", gap: 10, minWidth: 0 }}>
//                 <Panel title="Current PTD Cost Mix" subtitle="Share of current period cost" className="mfg-chart-panel mfg-costmix-panel" style={{ minHeight: 265 }}>
//                     <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} style={{ display: "grid", gap: 9 }}>
//                         {costMix.map((item) => <div key={item.name} data-tooltip={`${item.name} | Amount: ${item.amount == null ? "Unavailable" : `${appliedFilters.currency} ${item.amount.toFixed(2)}M`} | Share: ${item.pct == null ? "Unavailable" : `${item.pct.toFixed(1)}%`}`} style={{ display: "grid", gridTemplateColumns: "minmax(100px,.8fr) minmax(70px,1.7fr) 88px", gap: 8, alignItems: "center", borderRadius: 8, padding: "6px 5px", transition: "background .18s ease, transform .18s ease", position: "relative" }} className="mfg-row mfg-mix-row">
//                             <div style={{ color: "#334155", fontSize: 11, lineHeight: 1.2, fontWeight: 750 }}>{item.name}</div>
//                             <div style={{ height: 21, background: "#f1f5f9", borderRadius: 5, overflow: "hidden" }}><motion.div initial={{ width: 0 }} animate={{ width: `${item.pct == null ? 0 : Math.max(0, Math.min(item.pct, 100))}%` }} transition={{ duration: .8, delay: .1 }} style={{ height: "100%", borderRadius: 5, background: item.color }} /></div>
//                             <div style={{ fontSize: 10.5, lineHeight: 1.25, color: "#475569" }}><b style={{ color: COLORS.navy }}>{item.amount == null ? "—" : `${appliedFilters.currency} ${item.amount.toFixed(2)}M`}</b><br />{item.pct == null ? "—" : `${item.pct.toFixed(1)}%`}</div>
//                         </div>)}
//                     </motion.div>
//                 </Panel>



//                 <Panel title="Month-on-Month Production Overhead" subtitle="Each month compares Actual and Target for each selected group" className="mfg-chart-panel mfg-overhead-panel" action={<div className="mfg-overhead-controls" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap", justifyContent: "flex-end", minWidth: 0 }}>
//                     <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "#475569", fontWeight: 750, whiteSpace: "nowrap" }}>
//                         View by
//                         <select id="manufacturing-overhead-group-by" aria-label="View production overhead by" value={overheadGroupBy} onChange={(e) => { setOverheadGroupBy(e.target.value); setOverheadSelectedDimensions([]); }} style={{ height: 30, maxWidth: 150, border: "1px solid #d7e0f0", borderRadius: 7, background: "#fff", color: "#26364f", padding: "0 8px", fontSize: 10.5, fontWeight: 650 }}>
//                             <option value="legal_entity">Legal Entity</option>
//                             <option value="parent_division">Parent Division</option>
//                             <option value="subdivision">Subdivision</option>
//                         </select>
//                     </label>
//                     <div style={{ minWidth: 180, maxWidth: 250, flex: "0 1 230px" }}>
//                         <MultiSelectFilter
//                             label={overheadGroupBy === "legal_entity" ? "Legal Entities" : overheadGroupBy === "parent_division" ? "Divisions" : "Subdivisions"}
//                             value={overheadSelectedDimensions}
//                             onChange={setOverheadSelectedDimensions}
//                             options={dimensionNames}
//                             allowAll={false}
//                         />
//                     </div>
//                     <div className="mfg-menu-container" style={{ position: "relative" }}><button className="mfg-action" aria-label="Production overhead options" title="More options" style={{ ...panelButton, width: 32, height: 30, padding: 0, fontSize: 19 }} onClick={() => setOverheadMenuOpen(v => !v)}><MoreVertical size={17} strokeWidth={1.8} /></button>{overheadMenuOpen && <div style={{ position: "absolute", right: 0, top: 35, zIndex: 50, width: 165, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 9, boxShadow: "0 10px 26px rgba(15,23,42,.16)", overflow: "hidden" }}><button onClick={() => { openViewAll("production-overhead-monthly"); setOverheadMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#334155" }}>🔎 View All</button><button onClick={() => { exportReport("excel", "production-overhead-monthly", appliedFilters); setOverheadMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📊 Export Excel</button><button onClick={() => { exportReport("pdf", "production-overhead-monthly", appliedFilters); setOverheadMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📄 Export PDF</button></div>}</div>
//                 </div>}>
//                     {dimensionOverheadError && <div role="alert" style={{ color: "#b91c1c", fontSize: 11, padding: "4px 0 8px" }}>{dimensionOverheadError}</div>}
//                     {dimensionOverheadLoading ? <div style={{ height: 180, display: "grid", placeItems: "center", color: "#64748b", fontSize: 11 }}>Loading grouped production overhead…</div> : !dimensionOverheadChartData.length ? <div style={{ height: 180, display: "grid", placeItems: "center", color: "#64748b", fontSize: 11 }}>No grouped production overhead data for the selected filters.</div> : <motion.div className="mfg-chart-canvas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }} style={{ height: 205 }}>
//                         <ResponsiveContainer width="100%" height="100%">
//                             <BarChart data={dimensionOverheadChartData} margin={{ top: 8, right: 8, left: 2, bottom: 2 }} barGap={1} barCategoryGap="16%">
//                                 <CartesianGrid stroke="#e8eef6" strokeDasharray="3 3" vertical={false} />
//                                 <XAxis dataKey="month" interval="preserveStartEnd" minTickGap={16} height={24} tick={{ fontSize: 9, fill: "#475569" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
//                                 <YAxis width={58} label={{ value: `Amount (${appliedFilters.currency || "AED"}, Millions)`, angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#475569", fontSize: 9, fontWeight: 700 } }} tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => `${v.toFixed ? v.toFixed(2) : v}M`} />
//                                 <Tooltip content={<ProductionOverheadTooltip groupBy={overheadGroupBy} currency={appliedFilters.currency || "AED"} dimensionOrder={dimensionNames} />} cursor={{ fill: "#eef2ff", opacity: 0.45 }} />
//                                 {visibleDimensionNames.map((dimension) => {
//                                     const color = COLORS_BY_CATEGORY[Math.max(0, dimensionNames.indexOf(dimension)) % COLORS_BY_CATEGORY.length];
//                                     return <React.Fragment key={dimension}>
//                                         <Bar dataKey={`${dimension}__actual`} name={`${dimension} · Actual`} fill={color} maxBarSize={12} radius={[2, 2, 0, 0]} />
//                                         <Bar dataKey={`${dimension}__target`} name={`${dimension} · Target`} fill="#ffffff" stroke={color} strokeWidth={1.5} maxBarSize={12} radius={[2, 2, 0, 0]} />
//                                     </React.Fragment>;
//                                 })}
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </motion.div>}
//                     <div aria-label="Production overhead chart legend" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "7px 14px", padding: "8px 2px 5px", marginTop: 2, borderTop: "1px solid #eef2f7" }}>
//                         <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#334155", fontWeight: 750, whiteSpace: "nowrap" }}><i style={{ width: 11, height: 11, display: "inline-block", borderRadius: 2, background: "#334155" }} /> Actual</span>
//                         <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#334155", fontWeight: 750, whiteSpace: "nowrap" }}><i style={{ width: 11, height: 11, display: "inline-block", borderRadius: 2, background: "#fff", border: "1.5px solid #334155" }} /> Target</span>
//                         <span style={{ width: 1, height: 16, background: "#dbe3ef" }} />
//                         {visibleDimensionNames.map((dimension) => {
//                             const color = COLORS_BY_CATEGORY[Math.max(0, dimensionNames.indexOf(dimension)) % COLORS_BY_CATEGORY.length];
//                             return <span key={dimension} title={dimension} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#475569", maxWidth: 190, minWidth: 0 }}><i style={{ width: 9, height: 9, display: "inline-block", borderRadius: 99, background: color, flexShrink: 0 }} /><span style={{ overflowWrap: "anywhere", lineHeight: 1.25 }}>{dimension}</span></span>;
//                         })}
//                     </div>
//                     <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.4, marginTop: 2 }}>Chart displays {visibleDimensionNames.length} selected {overheadGroupBy === "legal_entity" ? "legal entit(y/ies)" : overheadGroupBy === "parent_division" ? "parent division(s)" : "subdivision(s)"}. View All and Excel/PDF exports include the full filtered scope for the selected grouping, not just the chart selection.</div>
//                 </Panel>
//             </div>
//         </div>}

//         <AnimatePresence>
//             {viewAll && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.42)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", padding: viewAllMaximized ? 0 : 16 }} onMouseDown={e => { if (e.target === e.currentTarget) setViewAll(""); }}>
//                 <motion.div initial={{ y: 15, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, scale: .98 }} style={{ width: viewAllMaximized ? "100vw" : "min(1400px, 96vw)", height: viewAllMaximized ? "100vh" : "auto", maxHeight: viewAllMaximized ? "100vh" : "92vh", background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: viewAllMaximized ? 0 : 12, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(15,23,42,.18)" }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`, background: "#fff" }}>
//                         <div><div style={{ fontSize: "0.95rem", fontWeight: 800, color: COLORS.navy }}>{viewAll === "category-breakdown" ? "Manufacturing Cost Drill-Down — Detailed View" : viewAll === "category-detail" ? `Manufacturing Account Detail${selectedDetailCategory ? ` — ${selectedDetailCategory}` : ""}` : viewAll === "monthly-trend" ? "Monthly Cost Trend- Detailed View" : viewAll === "production-overhead-monthly" ? "Month-on-Month Production Overhead — Detailed View" : viewAll}</div><div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>Current filters · {(Array.isArray(viewAllFilters.legalGroup) ? viewAllFilters.legalGroup : (viewAllFilters.legalGroup ? [viewAllFilters.legalGroup] : [])).map((id) => labelOf(legalGroups.find((x) => String(idOf(x)) === String(id)) || id)).join(", ") || "All Legal Groups"} · {viewAllFilters.period} · Reporting Currency: {viewAllFilters.currency || "AED"}{viewAll === "production-overhead-monthly" ? ` · Grouping: ${overheadGroupBy === "legal_entity" ? "Legal Entity" : overheadGroupBy === "parent_division" ? "Parent Division" : "Subdivision"} · View All/exports include the full filtered scope` : ""}</div></div>
//                         <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
//                             <button type="button" onClick={() => setViewAllMaximized((current) => !current)} title={viewAllMaximized ? "Restore window size" : "Maximize to full screen"} aria-label={viewAllMaximized ? "Restore window size" : "Maximize to full screen"} style={{ border: "1px solid #dbe3ef", background: "#f8fafc", color: COLORS.navy, borderRadius: 8, minWidth: 34, height: 32, padding: "0 8px", fontSize: 16, cursor: "pointer", lineHeight: 1 }}>{viewAllMaximized ? <Minimize2 size={16} strokeWidth={1.8} /> : <Maximize2 size={16} strokeWidth={1.8} />}</button>
//                             <button type="button" onClick={() => { setViewAll(""); setViewAllMaximized(false); }} title="Close" aria-label="Close View All" style={{ border: "1px solid #dbe3ef", background: "#fff", color: COLORS.navy, borderRadius: 8, width: 32, height: 32, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={16} strokeWidth={1.8} /></button>
//                         </div>
//                     </div>
//                     <div className="no-print mfg-filter-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr)) auto", alignItems: "end", gap: 7, padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}`, background: "#fff" }}>
//                         <MultiSelectFilter label="Legal Group" value={viewAllFilters.legalGroup} onChange={v => updateViewAll("legalGroup", v)} options={viewGroups} />
//                         <MultiSelectFilter label="Legal Entity" value={viewAllFilters.legalEntity} onChange={v => updateViewAll("legalEntity", v)} options={viewAllLegalEntities} />
//                         <MultiSelectFilter label="Parent Division" value={viewAllFilters.parent} onChange={v => updateViewAll("parent", v)} options={viewAllParentDivisions} />
//                         <MultiSelectFilter label="Sub-Division" value={viewAllFilters.sub} onChange={v => updateViewAll("sub", v)} options={viewAllSubdivisions} />
//                         <Filter label="Year" value={viewAllFilters.year} onChange={v => updateViewAll("year", v)} options={[...new Set([viewAllFilters.year, ...(viewAllFilterOptions.years.length ? viewAllFilterOptions.years : filterOptions.years).map((x) => String(idOf(x)))].filter(Boolean))]} />
//                         <Filter label="Period" value={viewAllFilters.period} onChange={v => updateViewAll("period", v)} options={sortPeriodsChronologically(viewAllFilterOptions.periods.length ? viewAllFilterOptions.periods : filterOptions.periods, viewAllFilters.year)} hidePlaceholder />
//                         <Filter label="Reporting Currency" value={viewAllFilters.currency} onChange={v => updateViewAll("currency", v)} options={["AED", "USD", "EUR", "GBP"]} />
//                         <div className="mfg-filter-actions" style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
//                             <button type="button" onClick={applyViewAllFilters} disabled={detailLoading} style={{ ...filterActionStyle, height: 33, border: "1px solid #5B3FE4", background: detailLoading ? "#8b7bf0" : "#5B3FE4", color: "#fff", padding: "0 12px", opacity: detailLoading ? .9 : 1, cursor: detailLoading ? "wait" : "pointer" }}>{detailLoading ? "Applying…" : "Apply"}</button>
//                             <button type="button" onClick={() => { const fj = viewGroups.find((x) => /\bfj\s*group\b/i.test(labelOf(x))); const marked = viewGroups.find((x) => x?.is_default || x?.default); const resetValues = { ...FILTER_DEFAULTS, legalGroup: (fj || marked) ? [String(idOf(fj || marked))] : [] }; viewAllFiltersRef.current = resetValues; setViewAllFilters(resetValues); setSearch(""); openViewAll(viewAll || "category-breakdown", "", resetValues); }} style={{ ...filterActionStyle, height: 33, border: 0, background: "transparent", color: "#475569", padding: "0 7px" }}>Reset</button>
//                         </div>
//                     </div>
//                     <div className="no-print" style={{ padding: "10px 16px", display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${COLORS.border}`, background: "#f8fafc" }}>
//                         <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", fontSize: 11, color: COLORS.muted }}>
//                             <><div role="group" aria-label="View All amount unit" style={{ display: "inline-flex", padding: 3, gap: 2, border: "1px solid #dbe3ef", borderRadius: 8, background: "#f1f5f9" }}><button type="button" onClick={() => setViewAllUnit("aed")} aria-pressed={viewAllUnit === "aed"} style={{ border: 0, borderRadius: 6, padding: "5px 9px", background: viewAllUnit === "aed" ? "#5B3FE4" : "transparent", color: viewAllUnit === "aed" ? "#fff" : "#475569", fontSize: 10.5, fontWeight: 800, cursor: "pointer" }}>AED</button><button type="button" onClick={() => setViewAllUnit("millions")} aria-pressed={viewAllUnit === "millions"} style={{ border: 0, borderRadius: 6, padding: "5px 9px", background: viewAllUnit === "millions" ? "#5B3FE4" : "transparent", color: viewAllUnit === "millions" ? "#fff" : "#475569", fontSize: 10.5, fontWeight: 800, cursor: "pointer" }}>AED Million</button></div></>
//                             <ExportButtons onExcel={() => exportReport("excel", viewAll || "category-breakdown", viewAllFilters)} onPdf={() => exportReport("pdf", viewAll || "category-breakdown", viewAllFilters)} />
//                         </div>
//                     </div>
//                     {detailLoading && <div style={{ padding: 12, fontSize: 12, color: COLORS.muted }}>Loading report details…</div>}
//                     <div className="mfg-modal-table-wrap" style={{ overflow: "auto", padding: "0 16px 0", marginBottom: 0, paddingBottom: 0 }}>
//                         <table className="mfg-modal-table" style={{ width: "100%", tableLayout: "auto", borderCollapse: "separate", borderSpacing: 0, minWidth: viewAll === "monthly-trend" ? 1100 : viewAll === "production-overhead-monthly" ? Math.max(1100, 190 + productionOverheadMonths.length * 100 + 420) : (viewAll === "category-breakdown" || viewAll === "category-detail" ? 1120 : 720), fontSize: 11 }}>
//                             <thead style={{ position: "sticky", top: 0, zIndex: 3 }}><tr>{viewAllHeaders.map((h, i) => {
//                                 const firstNumericColumn = viewAll === "production-overhead-monthly" ? 1 : viewAll === "monthly-trend" ? 1 : viewAll === "category-detail" ? 5 : viewAll === "category-breakdown" ? 4 : 1;
//                                 const numericColumn = i >= firstNumericColumn;
//                                 return <th key={h} className={i === 0 ? "mfg-sticky-first-col" : undefined} scope="col" title={h} style={{ position: "sticky", top: 0, left: i === 0 ? 0 : undefined, zIndex: i === 0 ? 7 : 3, background: "#f1f5f9", color: "#061b49", textAlign: numericColumn ? "right" : "left", padding: "11px 9px", borderBottom: "2px solid #dbe3ef", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal", textTransform: "uppercase", letterSpacing: ".025em", fontWeight: 850, lineHeight: 1.25, fontVariantNumeric: "tabular-nums", minWidth: viewAll === "production-overhead-monthly" && i === 0 ? 190 : undefined, maxWidth: viewAll === "production-overhead-monthly" && i === 0 ? 220 : undefined }}>{h}</th>;
//                             })}</tr></thead>
//                             <tbody>{pagedViewAllRows.map((r, idx) => <tr className="mfg-row" key={`${first(r.raw, ["legal_entity_id", "legal_entity_code"], r.legalEntity || "")}-${first(r.raw, ["parent_division_id", "parent_division_code"], r.parentDivision || "")}-${first(r.raw, ["subdivision_id", "subdivision_code"], r.subDivision || "")}-${first(r.raw, ["source_code", "source_id", "category_id"], r.category || "")}-${r.accountCode || ""}-${r.accountName || ""}-${idx}`} style={{ background: idx % 2 ? "#f8fafc" : "#fff" }}>{viewAll === "category-breakdown" ? <>{[r.legalEntity, r.parentDivision, r.subDivision, r.category].map((v, i) => <td key={`breakdown-${i}`} title={v} style={{ padding: "10px 9px", textAlign: "left", verticalAlign: "top", borderBottom: "1px solid #e2e8f0", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal", minWidth: i === 0 ? 145 : i === 1 ? 145 : i === 2 ? 135 : 150, maxWidth: i < 3 ? 210 : 260, lineHeight: 1.4, color: i === 3 ? COLORS.navy : "#475569", fontWeight: i === 3 ? 750 : 500 }}>{v || "—"}</td>)}</> : viewAll === "category-detail" ? <>{[r.legalEntity, r.parentDivision, r.subDivision, r.accountCode, r.accountName].map((v, i) => <td key={`detail-${i}`} title={v} style={{ padding: "10px 9px", textAlign: "left", verticalAlign: "top", borderBottom: "1px solid #e2e8f0", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal", minWidth: i === 0 ? 145 : i === 1 ? 145 : i === 2 ? 135 : i === 3 ? 105 : 180, maxWidth: i < 3 ? 210 : 280, lineHeight: 1.4, color: i >= 3 ? COLORS.navy : "#475569", fontWeight: i >= 3 ? 650 : 500 }}>{v || "—"}</td>)}</> : viewAll === "production-overhead-monthly" ? <td className="mfg-sticky-first-col" title={r.dimension || "—"} style={{ padding: "10px 9px", textAlign: "left", verticalAlign: "middle", fontWeight: 750, background: idx % 2 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e2e8f0", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal", lineHeight: 1.35, minWidth: 190, maxWidth: 220 }}>{r.dimension || r.category || "—"}</td> : <td style={{ padding: "10px 9px", fontWeight: 750, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{r.category}</td>}{(viewAll === "monthly-trend" ? [r.actualPtd, r.targetPtd, r.variancePtd, r.actualYtd, r.targetYtd, r.varianceYtd, r.overheadActual, r.overheadTarget, r.overheadVariance] : viewAll === "production-overhead-monthly" ? [...productionOverheadMonths.map((month) => r[`month__${month}`]), r.actualPtd, r.targetPtd, r.variancePtd, r.actualPtd != null && r.targetPtd != null && r.targetPtd !== 0 ? (r.variancePtd / Math.abs(r.targetPtd)) * 100 : null] : [r.actualPtd, r.targetPtd, r.variancePtd, r.actualYtd, r.targetYtd, r.varianceYtd]).map((v, i) => <td key={i} style={{
//                                 padding: "10px 9px", textAlign: "right", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", color: (viewAll === "monthly-trend" ? [2, 5, 8].includes(i) : viewAll === "production-overhead-monthly" ? i >= productionOverheadMonths.length + 2 : [2, 5].includes(i))
//                                     ? (v == null ? "#64748b" : (viewAll === "category-breakdown" || viewAll === "category-detail")
//                                         ? (numberOrNull(v) == null || Number(v) === 0 ? "#64748b" : Number(v) > 0 ? "#15803d" : "#dc2626")
//                                         : (numberOrNull(v) == null || Number(v) === 0 ? "#64748b" : Number(v) > 0 ? "#15803d" : "#dc2626"))
//                                     : "#334155", fontWeight: viewAll === "production-overhead-monthly" ? (i >= productionOverheadMonths.length + 2 ? 750 : 500) : (viewAll === "monthly-trend" ? [2, 5, 8].includes(i) : [2, 5].includes(i)) ? 750 : 500
//                             }}>{viewAll === "production-overhead-monthly" && i === productionOverheadMonths.length + 3 ? (v == null ? "—" : `${Number(v).toFixed(1)}%`) : formatViewAllValue(v, viewAll, viewAllUnit)}</td>)}</tr>)}</tbody>
//                             {viewAll === "monthly-trend" && <tfoot><tr>
//                                 {monthlyTrendTotalRow.map((value, index) => <td key={`monthly-trend-total-${index}`} className={index === 0 ? "mfg-sticky-first-col" : undefined} style={{ position: "sticky", bottom: 0, left: index === 0 ? 0 : undefined, zIndex: index === 0 ? 8 : 6, background: "#e8eef8", borderTop: "2px solid #94a3b8", boxShadow: "0 -3px 8px rgba(15,23,42,.06)", padding: "10px 9px", textAlign: index ? "right" : "left", fontWeight: 900, color: index === 0 ? COLORS.navy : [3, 6, 9].includes(index) ? (value == null ? COLORS.navy : value <= 0 ? "#15803d" : "#dc2626") : COLORS.navy, whiteSpace: "nowrap" }}>
//                                     {index === 0 ? value : value == null ? "—" : formatViewAllValue(value, viewAll, viewAllUnit)}
//                                 </td>)}
//                             </tr></tfoot>}
//                             {viewAll === "production-overhead-monthly" && <tfoot><tr>
//                                 {[
//                                     "Total",
//                                     ...productionOverheadTotalRow.months,
//                                     productionOverheadTotalRow.actual,
//                                     productionOverheadTotalRow.target,
//                                     productionOverheadTotalRow.variance,
//                                     productionOverheadTotalVariancePct,
//                                 ].map((value, index) => <td key={`production-overhead-total-${index}`} className={index === 0 ? "mfg-sticky-first-col" : undefined} style={{ position: "sticky", bottom: 0, left: index === 0 ? 0 : undefined, zIndex: index === 0 ? 8 : 6, background: "#e8eef8", borderTop: "2px solid #94a3b8", boxShadow: "0 -3px 8px rgba(15,23,42,.06)", padding: "11px 9px", textAlign: index ? "right" : "left", fontWeight: 900, color: index === 0 ? COLORS.navy : index === productionOverheadMonths.length + 3 ? (value == null ? COLORS.navy : value <= 0 ? "#15803d" : "#dc2626") : COLORS.navy, whiteSpace: "nowrap" }}>
//                                     {index === 0 ? value : value == null ? "—" : index === productionOverheadMonths.length + 4 ? `${Number(value).toFixed(1)}%` : formatViewAllValue(value, viewAll, viewAllUnit)}
//                                 </td>)}
//                             </tr></tfoot>}
//                             {!(["monthly-trend", "production-overhead-monthly"].includes(viewAll)) && <tfoot><tr>{[
//                                 viewAll === "category-breakdown" ? "Net Cost of Sales" : "Category Total",
//                                 ...(viewAll === "category-detail" ? ["", "", "", ""] : ["", "", ""]),
//                                 ...["actual", "target", "variance"].flatMap((key) => [numberOrNull(first(viewAllTotals?.ptd, [key, `${key}_reporting_currency`, `${key}_amount`])) == null ? null : numberOrNull(first(viewAllTotals?.ptd, [key, `${key}_reporting_currency`, `${key}_amount`]))]),
//                                 ...["actual", "target", "variance"].map((key) => {
//                                     const value = numberOrNull(first(viewAllTotals?.ytd, [key, `${key}_reporting_currency`, `${key}_amount`]));
//                                     return value == null ? null : value;
//                                 })
//                             ].map((v, i) => <td key={i} className={i === 0 ? "mfg-sticky-first-col" : undefined} style={{ position: "sticky", bottom: 0, left: i === 0 ? 0 : undefined, zIndex: i === 0 ? 8 : 6, background: "#f1f5f9", borderTop: "2px solid #cbd5e1", padding: "11px 9px", textAlign: i ? "right" : "left", fontWeight: 900, color: i === 3 || i === 6 ? (v == null ? COLORS.navy : v <= 0 ? "#15803d" : "#dc2626") : COLORS.navy, whiteSpace: "nowrap" }}>{i === 0 ? v : v == null ? "—" : formatViewAllValue(v, viewAll, viewAllUnit)}</td>)}</tr></tfoot>}
//                         </table>
//                     </div>
//                     <div style={{ padding: "9px 18px", borderTop: `1px solid ${COLORS.border}`, background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 11, color: COLORS.muted }}>
//                         <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//                             <span>Showing {viewAllFilteredRows.length ? (safeViewAllPage - 1) * viewAllPageSize + 1 : 0}–{Math.min(safeViewAllPage * viewAllPageSize, viewAllFilteredRows.length)} of {viewAllFilteredRows.length} records</span>
//                             <label style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Rows per page
//                                 <select value={viewAllPageSize} onChange={(e) => { setViewAllPageSize(Number(e.target.value)); setViewAllPage(1); }} style={{ border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", padding: "4px 6px", color: COLORS.navy }}>
//                                     {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
//                                 </select>
//                             </label>
//                             <button type="button" disabled={safeViewAllPage <= 1} onClick={() => setViewAllPage((page) => Math.max(1, page - 1))} style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "5px 9px", background: safeViewAllPage <= 1 ? "#f1f5f9" : "#fff", color: safeViewAllPage <= 1 ? "#94a3b8" : COLORS.navy, cursor: safeViewAllPage <= 1 ? "not-allowed" : "pointer" }}>Previous</button>
//                             <span>Page {safeViewAllPage} of {viewAllPageCount}</span>
//                             <button type="button" disabled={safeViewAllPage >= viewAllPageCount} onClick={() => setViewAllPage((page) => Math.min(viewAllPageCount, page + 1))} style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "5px 9px", background: safeViewAllPage >= viewAllPageCount ? "#f1f5f9" : "#fff", color: safeViewAllPage >= viewAllPageCount ? "#94a3b8" : COLORS.navy, cursor: safeViewAllPage >= viewAllPageCount ? "not-allowed" : "pointer" }}>Next</button>
//                         </div>
//                         <button onClick={() => setViewAll("")} style={{ background: "#e2e8f0", border: 0, borderRadius: 8, padding: "7px 17px", fontWeight: 800, color: COLORS.navy, cursor: "pointer" }}>Close</button>
//                     </div>
//                 </motion.div>
//             </motion.div>}
//         </AnimatePresence>
//     </div>;
// }





import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, MoreVertical, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPLDirectCostBreakdown, fetchPLDirectCostDetail } from "../services/plApi";
import {
    getManufacturingFilterOptions,
    getManufacturingDashboard,
    getManufacturingSummary,
    getManufacturingViewAll,
    getManufacturingHierarchyCategoryBreakdown,
    getManufacturingHierarchyCategoryDetail,
    getManufacturingMonthlyByDimension,
    exportManufacturingExcel,
    exportManufacturingPDF,
} from "../api/manufacturingApi";
import {
    ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, Area
} from "recharts";

/**
 * ManufacturingCostDashboard.jsx
 * Manufacturing Cost & Production Performance dashboard.
 * Uses the documented /api/manufacturing endpoints.
 * Keeps changes scoped to this dashboard component.
 */

// Shared visual tokens aligned with the Sales Revenue page.
const COLORS = {
    navy: "#0B2E6F", blue: "#5B3FE4", muted: "#64748b", border: "#e2e8f0",
    green: "#10b981", purple: "#8b5cf6", orange: "#f59e0b", red: "#dc2626",
    teal: "#14b8a6", panel: "#ffffff", page: "#f8fafc"
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthsForYear = (year) => monthNames.map((month) => `${month}-${String(year || new Date().getFullYear()).slice(-2)}`);
const monthIndexFromPeriod = (value) => {
    const match = String(value ?? "").trim().match(/^([A-Za-z]{3,})[- /,]?(\\d{2,4})?$/);
    return match ? monthNames.findIndex((month) => month.toLowerCase() === match[1].slice(0, 3).toLowerCase()) : -1;
};
const periodYearFromPeriod = (value, fallbackYear) => {
    const match = String(value ?? "").trim().match(/^([A-Za-z]{3,})[- /,]?(\\d{2,4})?$/);
    if (!match?.[2]) return Number(fallbackYear);
    return Number(match[2].length === 2 ? `20${match[2]}` : match[2]);
};
const sortPeriodsChronologically = (items, year) => {
    const labels = asArray(items).map(labelOf).filter(Boolean);
    return [...new Set(labels)].sort((a, b) => {
        const ay = periodYearFromPeriod(a, year), by = periodYearFromPeriod(b, year);
        return ay - by || monthIndexFromPeriod(a) - monthIndexFromPeriod(b);
    });
};
const numberOrNull = (value) => value === null || value === undefined || value === "" || !Number.isFinite(Number(value)) ? null : Number(value);
const first = (obj, keys, fallback = null) => {
    for (const key of keys) if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
    return fallback;
};
const asArray = (value) => Array.isArray(value) ? value : Array.isArray(value?.rows) ? value.rows : Array.isArray(value?.data) ? value.data : [];
const labelOf = (item) => typeof item === "string" ? item : String(first(item, ["name", "label", "title", "display_name", "legal_group_name", "legal_entity_name", "parent_division_name", "subdivision_name", "period_name", "value"], ""));
const idOf = (item) => typeof item === "string" ? item : first(item, ["id", "value", "code", "legal_group_id", "legal_entity_id", "parent_division_id", "subdivision_id"], "");
const withoutAllOptions = (items) => asArray(items).filter((item) => !/^all(?:\s+.*)?$/i.test(labelOf(item).trim()));
const normalizeComparison = (row, phase) => {
    const nested = row?.[phase] || row?.[phase.toUpperCase()] || {};
    const get = (keys) => numberOrNull(first(nested, keys, first(row, keys.map((k) => `${phase}_${k}`))));
    return {
        actual: get(["actual", "actual_reporting_currency", "actual_value", "actual_amount"]),
        target: get(["target", "budget", "target_reporting_currency", "target_value", "budget_amount", "target_amount"]),
        variance: get(["variance", "variance_reporting_currency", "variance_amount", "actual_variance"]),
        variancePct: numberOrNull(first(nested, ["variance_pct"], first(row, [`${phase}_variance_pct`, "variance_pct"]))),
        variancePp: numberOrNull(first(nested, ["variance_pp"], first(row, [`${phase}_variance_pp`, "variance_pp"]))),
        varianceStatus: first(nested, ["variance_status"], first(row, [`${phase}_variance_status`, "variance_status"]))
    };
};
const normalizeBreakdownRow = (row) => {
    const category = String(first(row, ["category", "category_name", "account_name", "account_group", "account_code", "name", "label"], "Unnamed category"));
    const ptd = normalizeComparison(row, "ptd");
    const ytd = normalizeComparison(row, "ytd");
    return {
        category,
        legalEntity: String(first(row, ["legal_entity_name", "legal_entity", "entity_name", "legalEntityName"], "—")),
        parentDivision: String(first(row, ["parent_division_name", "parent_division", "parentDivisionName"], "—")),
        subDivision: String(first(row, ["subdivision_name", "sub_division_name", "subdivision", "sub_division", "subDivisionName"], "—")),
        accountCode: String(first(row, ["account_code", "accountCode", "gl_code", "gl_account_code", "account_number", "code"], "—")),
        accountName: String(first(row, ["account_name", "accountName", "gl_name", "gl_account_name", "account_description", "name"], category)),
        actualPtd: ptd.actual, targetPtd: ptd.target, variancePtd: ptd.variance ?? (ptd.actual != null && ptd.target != null ? ptd.actual - ptd.target : null),
        varianceStatusPtd: ptd.varianceStatus,
        actualYtd: ytd.actual, targetYtd: ytd.target, varianceYtd: ytd.variance ?? (ytd.actual != null && ytd.target != null ? ytd.actual - ytd.target : null),
        varianceStatusYtd: ytd.varianceStatus, raw: row
    };
};
const FILTER_DEFAULTS = { legalGroup: [], legalEntity: [], parent: [], sub: [], year: String(new Date().getFullYear()), period: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date().getMonth()]}-${String(new Date().getFullYear()).slice(-2)}`, currency: "AED" };
const filterParamKeys = { legalGroup: "legal_group_id", legalEntity: "legal_entity_id", parent: "parent_division_id", sub: "subdivision_id" };
const previousPeriodName = (period, year) => {
    const normalizedPeriod = String(period || "").trim();
    // Handles the API's standard "Oct-26" value and month-name variants.
    const match = normalizedPeriod.match(/^([A-Za-z]+)[- ,/]?(\d{2,4})?$/);
    const monthToken = String(match?.[1] || "").slice(0, 3).toLowerCase();
    const index = monthNames.findIndex((m) => m.toLowerCase() === monthToken);
    if (index < 0) return null;
    const prevIndex = (index + 11) % 12;
    const rawYear = year || (match?.[2]
        ? (String(match[2]).length === 2 ? `20${match[2]}` : match[2])
        : new Date().getFullYear());
    const selectedYear = Number(rawYear);
    const y = selectedYear - (index === 0 ? 1 : 0);
    return `${monthNames[prevIndex]}-${String(y).slice(-2)}`;
};

const buildQuery = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filterParamKeys).forEach(([key, param]) => { const values = Array.isArray(filters[key]) ? filters[key] : (filters[key] ? [filters[key]] : []); values.forEach((value) => params.append(param, String(value))); });
    params.set("year", String(filters.year));
    params.set("period_name", String(filters.period));
    params.set("reporting_currency", filters.currency || "AED");
    return params.toString();
};
// API calls are centralized in src/api/manufacturingApi.js.
// Keep this adapter so component error handling remains unchanged.
function unwrapApiResponse(response) {
    return response?.data ?? response;
}
function parseManufacturingFilterOptions(response) {
    const data = unwrapApiResponse(response);
    const src = data?.options || data?.filters || data?.data || data || {};
    return {
        legalGroups: withoutAllOptions(first(src, ["legal_groups", "legalGroups", "legal_group_options"], [])),
        legalEntities: withoutAllOptions(first(src, ["legal_entities", "legalEntities", "legal_entity_options"], [])),
        parentDivisions: withoutAllOptions(first(src, ["parent_divisions", "parentDivisions", "parent_division_options"], [])),
        subdivisions: withoutAllOptions(first(src, ["subdivisions", "sub_divisions", "subDivisions", "subdivision_options"], [])),
        years: asArray(first(src, ["years", "year_options"], [])),
        periods: asArray(first(src, ["periods", "period_names", "period_options"], [])),
    };
}
function manufacturingFilters(filters = {}) {
    return {
        legal_group_id: Array.isArray(filters.legalGroup) ? filters.legalGroup : (filters.legalGroup ? [filters.legalGroup] : []),
        legal_entity_id: Array.isArray(filters.legalEntity) ? filters.legalEntity : (filters.legalEntity ? [filters.legalEntity] : []),
        parent_division_id: Array.isArray(filters.parent) ? filters.parent : (filters.parent ? [filters.parent] : []),
        subdivision_id: Array.isArray(filters.sub) ? filters.sub : (filters.sub ? [filters.sub] : []),
        year: filters.year,
        period_name: filters.period,
        reporting_currency: filters.currency || "AED",
    };
}
const COLORS_BY_CATEGORY = ["#14b8a6", "#8b5cf6", "#f59e0b", "#f97316", "#2563eb", "#0ea5e9"];
const fmtM = (n, currency = "AED") => `${currency} ${Number(n).toFixed(2)}M`;
const fmtNum = (n) => {
    const numeric = Number(n);
    if (!Number.isFinite(numeric)) return "—";
    // Avoid showing a rounded negative zero. Preserve the explicit 0.00 convention
    // for tiny amounts that round to zero; other amounts retain the existing whole-AED format.
    const rounded = Math.round(numeric);
    if (rounded === 0 && (numeric !== 0 || Object.is(numeric, -0))) return "0.00";
    return (Object.is(rounded, -0) || rounded === 0 ? 0 : rounded).toLocaleString("en-US", { maximumFractionDigits: 0 });
};
const isFavorableStatus = (status) => {
    const value = String(status ?? "").toLowerCase().replace(/[_-]+/g, " ").trim();
    if (!value) return null;
    if (/unfavo[u]?rable|\bunfavourable\b|\bnegative\b|\bbelow target\b|\bunder recovery\b|\bmiss\b/.test(value)) return false;
    if (/favo[u]?rable|\brecovery\b|\bpositive\b|\bon target\b|\bwithin target\b/.test(value)) return true;
    return null;
};
const varianceColor = (status, variance, lowerIsBetter = true) => {
    const apiFavorable = isFavorableStatus(status);
    const favorable = apiFavorable == null
        ? (variance == null ? null : (lowerIsBetter ? variance <= 0 : variance >= 0))
        : apiFavorable;
    return favorable == null ? "#64748b" : favorable ? "#15803d" : "#dc2626";
};
const fmtMillions = (n) => `${(Number(n) / 1_000_000).toFixed(2)}M`;
const formatViewAllValue = (value, reportName, unit) => {
    if (value == null || value === "") return "—";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return String(value);
    const isMonthlyChart = reportName === "monthly-trend" || reportName === "production-overhead-monthly";
    const displayValue = isMonthlyChart
        ? (unit === "aed" ? numeric * 1_000_000 : numeric)
        : (unit === "aed" ? numeric : numeric / 1_000_000);
    return displayValue.toLocaleString("en-US", { minimumFractionDigits: unit === "aed" ? 0 : 2, maximumFractionDigits: unit === "aed" ? 0 : 2 });
};

const normalizeGroupBy = (value) => ({
    legal_entity: "legal_entity",
    parent_division: "parent_division",
    subdivision: "subdivision",
}[value] || "legal_entity");
const statusLabel = (value) => {
    if (value == null || value === "") return "";
    return String(value).replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

// Normalize metric labels from dashboard and summary endpoints. The API may use
// metric codes (for example overhead_absorption_pct) in one response and labels
// (Overhead Absorption %) in another.
const normalizeMetricKey = (value) => {
    const text = String(value ?? "").toLowerCase().replace(/[%]/g, " percent ").replace(/[_-]+/g, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    if (text.includes("overhead absorption") && (text.includes("percent") || text.includes("pct"))) return "overhead absorption percent";
    if (text.includes("overhead absorption")) return "overhead absorption";
    // Keep percentage-of-sales material KPIs separate from currency material KPIs.
    // Otherwise a previous-month lookup can match the currency row first.
    if ((text.includes("cost of material") || text === "material" || text.includes("material cost")) &&
        (text.includes("percent") || text.includes("pct") || text.includes("against sales"))) return "cost of material percent";
    if (text.includes("cost of material") || text === "material" || text.includes("material cost")) return "cost of material";
    if (text.includes("production overhead")) return "production overhead";
    return text;
};

// Read summary rows from either the summary endpoint's row format or the
// dashboard-style controls object. The controls fallback matters for metrics
// such as overhead_absorption_pct when an endpoint returns controls instead
// of a flat summary array.
const extractSummaryRows = (response, expectedPeriod = null, expectedYear = null) => {
    // Axios normally gives response.data, but tolerate an additional data wrapper
    // used by some API gateways without changing the API service or request flow.
    let root = unwrapApiResponse(response);
    for (let depth = 0; depth < 2 && root?.data && !root?.sections && !root?.summary && !root?.rows; depth += 1) {
        root = root.data;
    }

    // Do not let a stale or mismatched response (for example Aug-26 when Sep-26
    // was requested) populate the previous-month KPI comparison.
    const responsePeriod = first(root, ["period_name", "period", "reporting_period"], null);
    const responseYear = numberOrNull(first(root, ["year", "reporting_year"], null));
    const normalizePeriod = (value) => String(value ?? "").trim().replace(/[- /]+/g, "-").toLowerCase();
    if (expectedPeriod && responsePeriod && normalizePeriod(responsePeriod) !== normalizePeriod(expectedPeriod)) return [];
    if (expectedYear != null && responseYear != null && Number(responseYear) !== Number(expectedYear)) return [];

    const source = root?.sections || root?.data?.sections || root?.data || root || {};
    const rows = asArray(
        Array.isArray(root) ? root :
            Array.isArray(source) ? source :
                source?.summary || source?.kpis || source?.rows ||
                root?.summary || root?.kpis || root?.rows
    ).slice();

    const controls = source?.controls || root?.controls || root?.data?.controls;
    if (!controls || typeof controls !== "object") return rows;

    ["ptd", "ytd"].forEach((phase) => {
        const actuals = controls[phase] || {};
        const targets = controls[`target_${phase}`] || controls[`target${phase.toUpperCase()}`] || {};
        Object.entries(actuals).forEach(([metric, actual]) => {
            if (metric === "signed_overhead_absorption") return;
            const alreadyExists = rows.some((row) =>
                normalizeMetricKey(first(row, ["metric", "label", "display_name", "metric_label", "name"], "")) === normalizeMetricKey(metric) &&
                String(first(row, ["phase", "period"], "")).toLowerCase() === phase
            );
            if (alreadyExists) return;
            const target = numberOrNull(targets[metric]);
            const actualNumber = numberOrNull(actual);
            const isPercent = /(?:_pct|percent|%)/i.test(metric);
            rows.push({
                metric,
                label: statusLabel(metric),
                phase: phase.toUpperCase(),
                actual: actualNumber,
                target,
                variance: actualNumber != null && target != null ? actualNumber - target : null,
                variance_pp: isPercent && actualNumber != null && target != null ? actualNumber - target : null,
                unit: isPercent ? "PERCENT" : "CURRENCY"
            });
        });
    });
    return rows;
};
function CountUp({ value, formatter = (v) => v.toLocaleString("en-US", { maximumFractionDigits: 2 }), duration = 850 }) {
    const [shown, setShown] = React.useState(0);
    React.useEffect(() => {
        let start;
        let raf;
        const tick = (time) => {
            if (!start) start = time;
            const p = Math.min((time - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setShown(value * eased);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    return <>{formatter(shown)}</>;
}

function ExportButtons({ onExcel, onPdf }) {
    const buttonBase = { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, fontSize: "0.70rem", fontWeight: 700, cursor: "pointer", transition: "all .15s", outline: "none" };
    return <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onExcel} style={{ ...buttonBase, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>📊 Excel</button>
        <button onClick={onPdf} style={{ ...buttonBase, color: "#be123c", background: "#fff1f2", border: "1px solid #fecdd3" }}>📄 PDF</button>
    </div>;
}

function Panel({ title, subtitle, action, children, style = {}, className = "" }) {
    return <section className={`mfg-panel ${className}`} style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", boxShadow: "0 2px 8px rgba(15,23,42,.04)", minWidth: 0, ...style }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <div><div style={{ fontSize: "0.88rem", fontWeight: 750, letterSpacing: "-.015em", color: COLORS.navy }}>{title}</div>
                {subtitle && <div style={{ fontSize: "0.72rem", color: COLORS.muted, marginTop: 3, lineHeight: 1.45 }}>{subtitle}</div>}</div>
            {action}
        </div>
        {children}
    </section>;
}

function KpiCard({ item, delay, currency = "AED" }) {
    const hasTarget = item.value !== null && item.value !== undefined && Number.isFinite(item.value) && item.target !== null && item.target !== undefined && Number.isFinite(item.target);
    const isPercent = item.percent === true;
    const variance = item.varianceDisplay != null
        ? item.varianceDisplay
        : hasTarget ? item.value - item.target : null;
    const favorable = isFavorableStatus(item.varianceStatus) ?? (hasTarget ? (item.lowerIsBetter ? variance <= 0 : variance >= 0) : null);
    const varianceText = variance === null
        ? "Variance: —"
        : isPercent
            ? `${variance > 0 ? "+" : variance < 0 ? "−" : ""}${Math.abs(variance).toFixed(1)} pp`
            : `${currency} ${Math.abs(variance).toFixed(2)}M${item.variancePct == null ? "" : ` · ${item.variancePct > 0 ? "+" : item.variancePct < 0 ? "−" : ""}${Math.abs(item.variancePct).toFixed(1)}%`}`;

    return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, delay }}
        whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(15,23,42,.07)" }}
        style={{ borderRadius: 14, padding: "10px 11px 8px", minHeight: 98, background: item.bg, border: "1px solid rgba(255,255,255,.9)", display: "flex", flexDirection: "column", gap: 5, minWidth: 0, boxShadow: "0 1px 3px rgba(15,23,42,.025)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
            <div style={{ width: 29, height: 29, borderRadius: "50%", background: `${item.color}18`, display: "grid", placeItems: "center", color: item.color, fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <div title={item.label} style={{ fontSize: 11, color: item.color, fontWeight: 800, lineHeight: 1.2 }}>{item.label}</div>
                <div style={{ fontSize: 16, color: COLORS.navy, fontWeight: 850, letterSpacing: "-.025em", marginTop: 2, lineHeight: 1.15, overflowWrap: "anywhere" }}>
                    {item.value == null ? "—" : isPercent ? <CountUp value={item.value} formatter={(v) => `${v.toFixed(1)}%`} /> : <>{currency} <CountUp value={item.value} formatter={(v) => v.toFixed(2)} />M</>}
                </div>
            </div>
            <span style={{ fontSize: 8.5, fontWeight: 800, color: COLORS.navy, background: "#ffffffb8", padding: "3px 5px", borderRadius: 5, flexShrink: 0 }}>{item.period}</span>
        </div>
        <div style={{ marginTop: "auto", background: "#ffffffb8", borderRadius: 7, padding: "5px 7px", display: "grid", gap: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, fontSize: 9.5, lineHeight: 1.2 }}><span style={{ color: "#64748b" }}>vs Target</span><strong style={{ color: item.target == null ? "#94a3b8" : (favorable === null ? "#64748b" : favorable ? "#059669" : "#e11d48"), fontSize: 9.5, textAlign: "right" }}>{item.target == null ? "—" : `${variance > 0 ? "▲" : variance < 0 ? "▼" : "•"} ${varianceText.replace(/^Variance: /, "")}`}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, fontSize: 9.5, lineHeight: 1.2 }}><span style={{ color: "#64748b" }}>vs Last Month</span><strong style={{ color: item.lastMonthValue == null || item.value == null ? "#94a3b8" : (item.lowerIsBetter ? (item.value - item.lastMonthValue) <= 0 : (item.value - item.lastMonthValue) >= 0) ? "#059669" : "#e11d48", fontSize: 9.5 }}>{item.lastMonthValue == null || item.value == null ? "—" : `${item.value - item.lastMonthValue < 0 ? "▼" : item.value - item.lastMonthValue > 0 ? "▲" : "•"} ${Math.abs(item.value - item.lastMonthValue).toFixed(1)}${isPercent ? " pp" : "M"}`}</strong></div>
        </div>
    </motion.div>;
}

function Filter({ label, value, onChange, options, showAll = false, hidePlaceholder = false }) {
    const [open, setOpen] = useState(false);
    const [optionSearch, setOptionSearch] = useState("");
    const triggerRef = React.useRef(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, width: 220, maxHeight: 280 });
    const safeOptions = withoutAllOptions(options).map((item) => {
        if (item && typeof item === "object") return item;
        return { id: String(item ?? ""), name: String(item ?? "") };
    }).filter((item) => {
        const optionValue = String(idOf(item) ?? "").trim();
        const optionLabel = labelOf(item).trim();
        return optionValue !== "" && !/^select(?:\.{3}|…)?$/i.test(optionLabel);
    });
    const selectedOption = safeOptions.find((item) => String(idOf(item)) === String(value ?? ""));
    const displayOptions = value != null && String(value) !== "" && !selectedOption
        ? [{ id: String(value), name: String(value) }, ...safeOptions]
        : safeOptions;
    const selectedLabel = selectedOption ? labelOf(selectedOption) : (value == null || value === "" ? "" : String(value));
    const filteredOptions = displayOptions.filter((item) =>
        labelOf(item).toLowerCase().includes(optionSearch.trim().toLowerCase())
    );
    const updatePopupPosition = React.useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect || typeof window === "undefined") return;
        const pad = 12;
        const width = Math.min(Math.max(rect.width, 210), Math.max(210, window.innerWidth - pad * 2));
        const left = Math.max(pad, Math.min(rect.left, window.innerWidth - width - pad));
        const below = Math.max(0, window.innerHeight - rect.bottom - pad - 6);
        const above = Math.max(0, rect.top - pad - 6);
        const openAbove = below < 190 && above > below;
        const available = openAbove ? above : below;
        const maxHeight = Math.max(80, Math.min(300, available));
        const proposedTop = openAbove ? rect.top - maxHeight - 6 : rect.bottom + 6;
        const top = Math.max(pad, Math.min(proposedTop, window.innerHeight - maxHeight - pad));
        setPopupPosition({ top, left, width, maxHeight });
    }, []);
    React.useEffect(() => {
        if (!open) return undefined;
        updatePopupPosition();
        const reposition = () => updatePopupPosition();
        const onKeyDown = (event) => { if (event.key === "Escape") setOpen(false); };
        window.addEventListener("resize", reposition);
        window.addEventListener("scroll", reposition, true);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("resize", reposition);
            window.removeEventListener("scroll", reposition, true);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open, updatePopupPosition]);
    const choose = (option) => {
        onChange(String(idOf(option)));
        setOpen(false);
        setOptionSearch("");
    };
    return <>
        <label className="mfg-filter-field" style={{ display: "block", minWidth: 0 }}>
            <span style={{ display: "block", color: "#0b2d67", fontSize: "0.68rem", fontWeight: 700, margin: "0 0 4px 1px", whiteSpace: "nowrap" }}>{label}</span>
            <button ref={triggerRef} type="button" className="mfg-select" aria-haspopup="listbox" aria-expanded={open}
                onClick={() => { if (!open) updatePopupPosition(); setOpen((v) => !v); }}
                title={selectedLabel || (showAll ? "All" : "Select…")}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", minWidth: 0, minHeight: 33, height: "auto", boxSizing: "border-box", borderRadius: 7, border: "1px solid #d7e0f0", background: "#fff", color: "#26364f", padding: "6px 9px", fontSize: "0.72rem", fontWeight: 500, outline: "none", cursor: "pointer", textAlign: "left", lineHeight: 1.25 }}>
                <span style={{ minWidth: 0, flex: "1 1 auto", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word" }}>{selectedLabel || (showAll ? "All" : hidePlaceholder ? "—" : "Select…")}</span>
                <span aria-hidden="true" style={{ color: "#526b91", flex: "0 0 auto" }}>▾</span>
            </button>
        </label>
        {open && typeof document !== "undefined" && createPortal(<>
            <div onMouseDown={(e) => { e.preventDefault(); setOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "transparent" }} />
            <div role="listbox" onMouseDown={(e) => e.stopPropagation()} style={{ position: "fixed", zIndex: 9999, top: popupPosition.top, left: popupPosition.left, width: popupPosition.width, maxWidth: "calc(100vw - 24px)", maxHeight: popupPosition.maxHeight, boxSizing: "border-box", display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #dbe5f5", borderRadius: 10, boxShadow: "0 14px 32px rgba(15,23,42,.18)", padding: 9, overflow: "hidden" }}>
                <input autoFocus value={optionSearch} onChange={(e) => setOptionSearch(e.target.value)} placeholder={`🔍 Search ${label}...`} aria-label={`Search ${label}`} style={{ width: "100%", boxSizing: "border-box", height: 31, border: "1px solid #c7d2fe", borderRadius: 7, padding: "0 8px", marginBottom: 7, fontSize: 11, outline: "none" }} />
                {showAll && <button type="button" onClick={() => { onChange(""); setOpen(false); setOptionSearch(""); }} style={{ border: 0, background: "transparent", padding: "7px 5px", textAlign: "left", color: "#173b68", fontSize: 11, cursor: "pointer" }}>All</button>}
                <div style={{ minHeight: 0, overflowY: "auto", overscrollBehavior: "contain" }}>
                    {filteredOptions.map((item) => {
                        const optionValue = String(idOf(item));
                        const optionLabel = labelOf(item);
                        const active = optionValue === String(value ?? "");
                        return <button key={`${optionValue}-${optionLabel}`} type="button" role="option" aria-selected={active} onClick={() => choose(item)}
                            style={{ display: "block", width: "100%", border: 0, borderBottom: "1px solid #f1f5f9", borderRadius: 4, padding: "8px 6px", background: active ? "#eff6ff" : "#fff", color: active ? "#173b8f" : "#173b68", fontSize: 11, fontWeight: active ? 750 : 500, textAlign: "left", cursor: "pointer", whiteSpace: "normal", overflowWrap: "anywhere", lineHeight: 1.35 }}>
                            {optionLabel}
                        </button>;
                    })}
                    {!filteredOptions.length && <div style={{ padding: "9px 4px", fontSize: 11, color: "#64748b" }}>No matching options</div>}
                </div>
            </div>
        </>, document.body)}
    </>;
}

function MultiSelectFilter({ label, value, onChange, options, allowAll = true }) {
    const [open, setOpen] = useState(false);
    const [optionSearch, setOptionSearch] = useState("");
    const triggerRef = React.useRef(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, width: 220, maxHeight: 300 });
    const updatePopupPosition = React.useCallback(() => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect || typeof window === "undefined") return;
        const viewportPadding = 12;
        const width = Math.min(Math.max(rect.width, 210), Math.max(210, window.innerWidth - viewportPadding * 2));
        const left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - width - viewportPadding));
        const availableBelow = Math.max(0, window.innerHeight - rect.bottom - viewportPadding - 6);
        const availableAbove = Math.max(0, rect.top - viewportPadding - 6);
        const openAbove = availableBelow < 210 && availableAbove > availableBelow;
        const available = openAbove ? availableAbove : availableBelow;
        // Respect the real available viewport space. Never force a 120px popup
        // into a smaller gap, which caused the menu to overlap/mis-anchor.
        const maxHeight = Math.max(80, Math.min(320, available));
        const proposedTop = openAbove ? rect.top - maxHeight - 6 : rect.bottom + 6;
        const top = Math.max(viewportPadding, Math.min(proposedTop, window.innerHeight - maxHeight - viewportPadding));
        setPopupPosition({ top, left, width, maxHeight });
    }, []);
    const selected = Array.isArray(value) ? value.map(String) : (value ? [String(value)] : []);
    React.useEffect(() => {
        if (!open) return undefined;
        // Keep the popup anchored to its trigger when selected labels wrap,
        // cascading options refresh, or the dashboard layout changes.
        const reposition = () => updatePopupPosition();
        reposition();
        window.addEventListener("resize", reposition);
        window.addEventListener("scroll", reposition, true);
        let observer;
        if (typeof ResizeObserver !== "undefined" && triggerRef.current) {
            observer = new ResizeObserver(reposition);
            observer.observe(triggerRef.current);
        }
        return () => {
            window.removeEventListener("resize", reposition);
            window.removeEventListener("scroll", reposition, true);
            observer?.disconnect();
        };
    }, [open, updatePopupPosition, selected.join("|")]);
    const safeOptions = asArray(options).filter((item) => {
        const id = String(idOf(item) ?? "").trim();
        const text = labelOf(item).trim();
        return id !== "" && !/^select(?:\.{3}|…)?$/i.test(text) && !/^all(?:\s+.*)?$/i.test(text);
    });
    const filteredOptions = safeOptions.filter((item) => labelOf(item).toLowerCase().includes(optionSearch.toLowerCase()));
    const toggle = (id) => onChange(selected.includes(String(id)) ? selected.filter((x) => x !== String(id)) : [...selected, String(id)]);
    const selectedLabels = selected.map((id) => labelOf(safeOptions.find((item) => String(idOf(item)) === id) || id));
    // Match the OPEX filter behaviour: an empty selection means All, and selecting
    // every available option must also display All instead of dumping every label
    // into the small trigger and overlapping the dashboard content.
    const allOptionsSelected = safeOptions.length > 0 && selected.length >= safeOptions.length &&
        safeOptions.every((item) => selected.includes(String(idOf(item))));
    const summary = safeOptions.length === 0
        ? "Loading…"
        : allOptionsSelected || selected.length === 0
            ? (allowAll ? "All" : "Select…")
            : selected.length === 1
                ? selectedLabels[0]
                : `${selected.length} selected`;
    return <>
        <div className="mfg-filter-field mfg-multiselect-field" style={{ position: "relative", minWidth: 0, zIndex: open ? 120 : 1 }}>
            <span style={{ display: "block", color: "#0b2d67", fontSize: "0.68rem", fontWeight: 700, margin: "0 0 4px 1px", whiteSpace: "nowrap" }}>{label}</span>
            <button ref={triggerRef} type="button" className="mfg-select mfg-multiselect-trigger" aria-expanded={open} disabled={safeOptions.length === 0} onClick={() => { if (!open && safeOptions.length) updatePopupPosition(); if (safeOptions.length) setOpen((v) => !v); }} style={{ appearance: "none", display: "flex", alignItems: "center", width: "100%", minWidth: 0, minHeight: 38, height: 38, maxHeight: 38, boxSizing: "border-box", borderRadius: 7, border: "1px solid #d7e0f0", background: "#fff", color: "#26364f", padding: "7px 27px 7px 9px", fontSize: "0.72rem", fontWeight: 500, textAlign: "left", cursor: safeOptions.length ? "pointer" : "wait", opacity: safeOptions.length ? 1 : 0.72, overflow: "hidden", lineHeight: 1.25, position: "relative" }} title={safeOptions.length === 0 ? "Loading filter options" : allOptionsSelected || selected.length === 0 ? "All" : selectedLabels.join(", ") || summary}><span style={{ display: "block", flex: "1 1 auto", minWidth: 0, maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 2, lineHeight: 1.25 }}>{summary}</span><span aria-hidden="true" style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#526b91", background: "#fff", lineHeight: 1 }}>▾</span></button>
        </div>
        {open && typeof document !== "undefined" && createPortal(<>
            <div onMouseDown={(e) => { e.preventDefault(); setOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 9998, background: "transparent" }} />
            <div onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} style={{ position: "fixed", zIndex: 9999, top: popupPosition.top, left: popupPosition.left, width: popupPosition.width, maxWidth: "calc(100vw - 24px)", maxHeight: popupPosition.maxHeight, boxSizing: "border-box", display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #dbe5f5", borderRadius: 10, boxShadow: "0 14px 32px rgba(15,23,42,.18)", padding: 9, overflow: "hidden" }}>
                <input value={optionSearch} onChange={(e) => setOptionSearch(e.target.value)} placeholder={`🔍 Search ${label}...`} style={{ width: "100%", height: 30, border: "1px solid #c7d2fe", borderRadius: 7, padding: "0 8px", marginBottom: 7, fontSize: 11, outline: "none" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, margin: "0 1px 7px", padding: "0 1px" }}>
                    <button type="button" onClick={() => onChange(safeOptions.map((item) => String(idOf(item))))} style={{ border: 0, padding: "2px 0", background: "transparent", color: "#5B3FE4", fontSize: 10, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>Select All</button>
                    <button type="button" onClick={() => { onChange([]); setOptionSearch(""); setOpen(false); }} style={{ border: 0, padding: "2px 0", background: "transparent", color: "#64748b", fontSize: 10, fontWeight: 700, cursor: "pointer", textAlign: "right" }}>Clear</button>
                </div>
                <div style={{ minHeight: 0, maxHeight: Math.max(80, popupPosition.maxHeight - 92), overflowY: "auto", overscrollBehavior: "contain" }}>
                    {filteredOptions.map((item) => {
                        const id = String(idOf(item));
                        return <div key={id} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "7px 4px", fontSize: 11, lineHeight: 1.35, color: "#173b68", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}><input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} style={{ flex: "0 0 auto", marginTop: 2 }} /><button type="button" onClick={() => toggle(id)} style={{ minWidth: 0, flex: 1, border: 0, padding: 0, background: "transparent", color: "inherit", textAlign: "left", fontSize: "inherit", lineHeight: "inherit", cursor: "pointer", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word" }}>{labelOf(item)}</button></div>;
                    })}
                    {!filteredOptions.length && <div style={{ padding: "9px 4px", fontSize: 11, color: "#64748b" }}>No matching options</div>}
                </div>
            </div>
        </>, document.body)}
    </>;
}
function TooltipBox({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return <div style={{ minWidth: 150, background: "linear-gradient(145deg,#ffffff 0%,#f8faff 100%)", border: "1px solid #dbe5f5", borderRadius: 12, padding: "10px 12px", boxShadow: "0 14px 34px rgba(15,23,42,.18)", fontSize: 11, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 850, color: COLORS.navy, marginBottom: 7, paddingBottom: 6, borderBottom: "1px solid #e8eef8" }}><span style={{ width: 6, height: 6, borderRadius: 99, background: COLORS.blue }} />{label}</div>
        {payload.filter((p) => p.value != null).map((p, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginTop: 5, color: "#475569" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i style={{ display: "inline-block", width: 7, height: 7, borderRadius: 2, background: p.color || p.fill || "#64748b" }} />{p.name}</span><b style={{ color: COLORS.navy, fontVariantNumeric: "tabular-nums" }}>{typeof p.value === "number" ? `${p.value.toFixed(2)}M` : p.value}</b></div>)}
    </div>;
}

function ProductionOverheadTooltip({ active, payload, label, groupBy, currency = "AED", dimensionOrder = [] }) {
    if (!active || !payload?.length) return null;
    const point = payload.find((item) => item?.payload)?.payload;
    if (!point) return null;
    const suffixes = ["__actual", "__target"];
    const names = Object.keys(point)
        .filter((key) => suffixes.some((suffix) => key.endsWith(suffix)))
        .map((key) => key.slice(0, key.lastIndexOf("__")))
        .filter((name, index, all) => all.indexOf(name) === index);
    const money = (value) => value == null || !Number.isFinite(Number(value)) ? "—" : `${currency} ${Number(value).toFixed(2)}M`;
    const level = groupBy === "legal_entity" ? "Legal Entity" : groupBy === "parent_division" ? "Parent Division" : "Subdivision";
    return <div style={{ minWidth: 230, maxWidth: 320, background: "#fff", border: "1px solid #dbe5f5", borderRadius: 10, padding: "10px 12px", boxShadow: "0 12px 30px rgba(15,23,42,.18)", fontSize: 11 }}>
        <div style={{ fontWeight: 850, color: COLORS.navy, paddingBottom: 7, marginBottom: 7, borderBottom: "1px solid #e8eef8" }}>Month: {label}</div>
        {names.map((name) => {
            const actual = numberOrNull(point[`${name}__actual`]);
            const target = numberOrNull(point[`${name}__target`]);
            const variance = actual != null && target != null ? actual - target : null;
            const colorIndex = dimensionOrder.length ? dimensionOrder.indexOf(name) : names.indexOf(name);
            const color = COLORS_BY_CATEGORY[Math.max(0, colorIndex) % COLORS_BY_CATEGORY.length];
            return <div key={name} style={{ borderBottom: "1px solid #f1f5f9", padding: "5px 0" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start", fontWeight: 800, color: COLORS.navy, overflowWrap: "anywhere", marginBottom: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0, marginTop: 2 }} />{level}: {name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, color: "#475569" }}>
                    <span>Actual: <b style={{ color: COLORS.navy }}>{money(actual)}</b></span>
                    <span>Target: <b style={{ color: COLORS.navy }}>{money(target)}</b></span>
                    <span style={{ gridColumn: "1 / -1" }}>Variance: <b style={{ color: variance == null ? "#64748b" : variance <= 0 ? "#15803d" : "#dc2626" }}>{money(variance)}</b></span>
                </div>
            </div>;
        })}
    </div>;
}


function ManufacturingDirectCostTable({ filters }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState({});
    const [details, setDetails] = useState({});
    const [loadingDetails, setLoadingDetails] = useState({});
    const [retry, setRetry] = useState(0);
    const plFilters = useMemo(() => ({
        legalGroupId: Array.isArray(filters.legalGroup) ? filters.legalGroup : (filters.legalGroup ? [filters.legalGroup] : []),
        legalEntityId: Array.isArray(filters.legalEntity) ? filters.legalEntity : (filters.legalEntity ? [filters.legalEntity] : []),
        parentDivisionId: Array.isArray(filters.parent) ? filters.parent : (filters.parent ? [filters.parent] : []),
        subdivisionId: Array.isArray(filters.sub) ? filters.sub : (filters.sub ? [filters.sub] : []),
        year: filters.year, periodName: filters.period, currency: filters.currency || "AED",
    }), [JSON.stringify(filters)]);
    const unwrap = (payload) => {
        const root = payload?.data ?? payload;
        if (Array.isArray(root)) return root;
        for (const key of ["rows", "data", "items", "results", "breakdown", "categories"]) if (Array.isArray(root?.[key])) return root[key];
        return [];
    };
    const read = (row, keys) => { for (const key of keys) if (row?.[key] != null) return row[key]; return null; };
    const label = (row) => String(read(row, ["category", "cost_category", "costCategory", "classification", "label", "name", "particulars"]) ?? "—");
    const num = (v) => v == null || v === "" || !Number.isFinite(Number(String(v).replace(/,/g, ""))) ? null : Number(String(v).replace(/,/g, ""));
    const money = (v) => num(v) == null ? (v == null || v === "" ? "—" : String(v)) : num(v).toLocaleString("en-US", { maximumFractionDigits: 0 });
    const getters = [
        (r) => read(r, ["actual_ptd", "current_ptd", "ptd", "ptd_value", "actual", "current", "value", "amount"]),
        (r) => read(r, ["target_ptd", "target_ptd_aed", "target_period", "target_period_aed", "target", "target_aed"]),
        (r) => read(r, ["variance_ptd", "variance_ptd_value", "variance"]),
        (r) => read(r, ["actual_ytd", "current_ytd", "ytd", "ytd_value"]),
        (r) => read(r, ["target_ytd", "ytd_target"]),
        (r) => read(r, ["variance_ytd", "variance_ytd_value"]),
    ];
    const valueColor = (v, variance) => {
        const value = num(v);
        // Only variance columns are color-coded: positive green, negative red,
        // and zero/missing values neutral. Other table values retain their base color.
        if (!variance) return "#334155";
        if (value == null || value === 0) return "#64748b";
        return value > 0 ? "#15803d" : "#dc2626";
    };

    React.useEffect(() => {
        let active = true;
        if (!plFilters.periodName) { setRows([]); setLoading(false); return () => { active = false; }; }
        setLoading(true); setError("");
        fetchPLDirectCostBreakdown(plFilters)
            .then((result) => { if (active) { setRows(unwrap(result)); setDetails({}); setExpanded({}); } })
            .catch((err) => { if (active) { setRows([]); setError(err?.message || "Failed to load Direct Cost Drill-Down."); } })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [plFilters, retry]);

    const onExpand = async (row, key) => {
        const category = label(row), open = !expanded[key];
        setExpanded((old) => ({ ...old, [key]: open }));
        if (!open || Object.prototype.hasOwnProperty.call(details, category)) return;
        setLoadingDetails((old) => ({ ...old, [category]: true }));
        try {
            const response = await fetchPLDirectCostDetail(plFilters, category);
            setDetails((old) => ({ ...old, [category]: unwrap(response) }));
        } catch (err) {
            setDetails((old) => ({ ...old, [category]: [] }));
            setError(err?.message || `Failed to load details for ${category}.`);
        } finally { setLoadingDetails((old) => ({ ...old, [category]: false })); }
    };

    return <Panel title="Direct Cost Drill-Down" subtitle="Actual, target and variance by cost category" className="mfg-direct-cost-panel">
        {loading && <div style={{ padding: "12px 8px", color: "#64748b", fontSize: 11 }}>Loading Direct Cost Drill-Down…</div>}
        {error && <div role="alert" style={{ padding: "8px", color: "#b91c1c", fontSize: 11 }}>{error} <button type="button" onClick={() => setRetry((v) => v + 1)}>Retry</button></div>}
        <div style={{ overflowX: "auto" }}>
            <table className="cost-structure-table mfg-direct-cost-table" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: 12, minWidth: 900 }}>
                <colgroup><col style={{ width: 30 }} /><col style={{ width: "24%" }} />{Array.from({ length: 6 }).map((_, i) => <col key={i} style={{ width: "12.1667%" }} />)}</colgroup>
                <thead><tr style={{ background: "#fff" }}><th style={{ width: 30, borderTop: "1px solid #e4e9ef", borderBottom: "1px solid #e4e9ef" }} />{["Cost Category", "Actual PTD", "Target PTD", "Variance PTD", "Actual YTD", "Target YTD", "Variance YTD"].map((h) => <th key={h} style={{ padding: 8, textAlign: h === "Cost Category" ? "left" : "right", fontWeight: 800, fontSize: 11, letterSpacing: ".02em", color: "#173b68", background: "#f1f5f9", borderRight: "1px solid #e4e9ef", borderBottom: "1px solid #e4e9ef", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                <tbody>
                    {rows.map((row, index) => {
                        const category = label(row), key = `${category}-${index}`, isOpen = !!expanded[key], children = details[category] || [];
                        return <React.Fragment key={key}>
                            <tr style={{ borderBottom: "1px solid #edf0f4", background: "#fff" }}>
                                <td style={{ textAlign: "center", padding: "9px 3px", borderRight: "1px solid #edf0f4" }}><button type="button" onClick={() => onExpand(row, key)} aria-label={`${isOpen ? "Collapse" : "Expand"} ${category}`} style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer", color: "#364152", fontSize: 16 }}>{isOpen ? "⌄" : "›"}</button></td>
                                <td style={{ padding: "9px 8px", color: "#344054", borderRight: "1px solid #edf0f4", fontSize: 11, fontWeight: 800, textTransform: "uppercase", overflowWrap: "anywhere", lineHeight: 1.3 }}>{category}</td>
                                {getters.map((get, i) => { const v = get(row); const isVariance = i === 2 || i === 5; const colorClass = !isVariance || num(v) == null || num(v) === 0 ? "mfg-variance-neutral" : num(v) > 0 ? "mfg-variance-positive" : "mfg-variance-negative"; return <td key={i} className={isVariance ? `mfg-variance-cell ${colorClass}` : undefined} style={{ padding: "9px 8px", textAlign: "right", color: valueColor(v, isVariance), fontWeight: isVariance ? 800 : 500, borderRight: "1px solid #edf0f4", whiteSpace: "nowrap" }}>{money(v)}</td>; })}
                            </tr>
                            {isOpen && <tr style={{ background: "#fafbfd" }}><td colSpan={8} style={{ padding: 0 }}>
                                {loadingDetails[category] ? <div style={{ padding: "12px 28px", color: "#64748b", fontSize: 11 }}>Loading account details…</div> : children.length ? <table className="cost-structure-table cost-detail-table mfg-direct-cost-table mfg-direct-cost-detail-table" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: 12 }}>
                                    <colgroup>
                                        <col style={{ width: "3%" }} />
                                        <col style={{ width: "9%" }} />
                                        <col style={{ width: "15%" }} />
                                        {Array.from({ length: 6 }).map((_, i) => <col key={i} style={{ width: "12.1667%" }} />)}
                                    </colgroup>
                                    <thead><tr>{["", "Account Code", "Account Name", "Actual PTD", "Target PTD", "Variance PTD", "Actual YTD", "Target YTD", "Variance YTD"].map((h, i) => <th key={h || "blank"} style={{ padding: 7, textAlign: i < 3 ? "left" : "right", color: "#173b68", background: "#fff", fontWeight: 700 }}>{h}</th>)}</tr></thead>
                                    <tbody>{children.map((detail, i) => <tr key={i} className="mfg-direct-cost-detail-row" style={{ borderTop: "1px solid #edf0f4", background: i % 2 ? "#f8fafc" : "#fff" }}>
                                        <td aria-hidden="true" style={{ padding: 0 }} />
                                        <td style={{ padding: "10px 10px", color: "#475569", fontWeight: 500, textAlign: "left", verticalAlign: "middle", whiteSpace: "nowrap" }}>{read(detail, ["account_code", "accountCode", "code", "account"]) ?? "—"}</td>
                                        <td title={read(detail, ["account_name", "accountName", "name", "particulars"]) ?? "—"} style={{ padding: "9px 10px", color: "#475569", fontWeight: 500, textAlign: "left", verticalAlign: "middle", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word", lineHeight: 1.3 }}>{read(detail, ["account_name", "accountName", "name", "particulars"]) ?? "—"}</td>
                                        {getters.map((get, j) => { const v = get(detail); const isVariance = j === 2 || j === 5; const colorClass = !isVariance || num(v) == null || num(v) === 0 ? "mfg-variance-neutral" : num(v) > 0 ? "mfg-variance-positive" : "mfg-variance-negative"; return <td key={j} className={isVariance ? `mfg-variance-cell ${colorClass}` : undefined} style={{ padding: "10px 8px", textAlign: "right", verticalAlign: "middle", fontWeight: isVariance ? 800 : 500, whiteSpace: "nowrap", color: valueColor(v, isVariance) }}>{money(v)}</td>; })}
                                    </tr>)}</tbody>
                                </table> : <div style={{ padding: "12px 28px", color: "#94a3b8", fontSize: 11 }}>No account details returned by backend.</div>}
                            </td></tr>}
                        </React.Fragment>;
                    })}
                    {!loading && !rows.length && !error && <tr><td colSpan={8} style={{ padding: 30, textAlign: "center", color: "#94a3b8" }}>No data available</td></tr>}
                    {!!rows.length && <tr style={{ background: "#f1f5f9", fontWeight: 800 }}><td /><td style={{ padding: "9px 8px", color: "#182338" }}>Total Cost of Sales</td>{getters.map((get, i) => { const vals = rows.map((r) => num(get(r))).filter((v) => v != null); const total = vals.length ? vals.reduce((a, b) => a + b, 0) : null; const isVariance = i === 2 || i === 5; const colorClass = !isVariance || total == null || total === 0 ? "mfg-variance-neutral" : total > 0 ? "mfg-variance-positive" : "mfg-variance-negative"; return <td key={i} className={isVariance ? `mfg-variance-cell ${colorClass}` : undefined} style={{ padding: "9px 8px", textAlign: "right", color: valueColor(total, isVariance), fontWeight: 800 }}>{money(total)}</td>; })}</tr>}
                </tbody>
            </table>
        </div>
    </Panel>;
}


export default function ManufacturingCostDashboard() {
    const [filters, setFilters] = useState(FILTER_DEFAULTS);
    const filtersRef = React.useRef(FILTER_DEFAULTS);
    filtersRef.current = filters;
    const [appliedFilters, setAppliedFilters] = useState(FILTER_DEFAULTS);
    const [viewAll, setViewAll] = useState("");
    const [viewAllMaximized, setViewAllMaximized] = useState(false);
    const [drilldownCollapsed, setDrilldownCollapsed] = useState(false);
    const [drilldownUnit, setDrilldownUnit] = useState("aed");
    const [selectedDetailCategory, setSelectedDetailCategory] = useState("");
    const [expandedCostCategories, setExpandedCostCategories] = useState(() => new Set());
    const [inlineCategoryDetails, setInlineCategoryDetails] = useState({});
    const [inlineCategoryLoading, setInlineCategoryLoading] = useState({});
    const [viewAllFilters, setViewAllFilters] = useState(FILTER_DEFAULTS);
    const viewAllFiltersRef = React.useRef(FILTER_DEFAULTS);
    viewAllFiltersRef.current = viewAllFilters;
    const [viewAllUnit, setViewAllUnit] = useState("millions");
    const [drillMenuOpen, setDrillMenuOpen] = useState(false);
    const [trendMenuOpen, setTrendMenuOpen] = useState(false);
    const [overheadMenuOpen, setOverheadMenuOpen] = useState(false);
    React.useEffect(() => {
        if (!drillMenuOpen && !trendMenuOpen && !overheadMenuOpen) return undefined;
        const closeMenus = (event) => {
            if (!event.target.closest?.(".mfg-menu-container")) {
                setDrillMenuOpen(false);
                setTrendMenuOpen(false);
                setOverheadMenuOpen(false);
            }
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setDrillMenuOpen(false);
                setTrendMenuOpen(false);
                setOverheadMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", closeMenus);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", closeMenus);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [drillMenuOpen, trendMenuOpen, overheadMenuOpen]);
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [viewAllPage, setViewAllPage] = useState(1);
    const [viewAllPageSize, setViewAllPageSize] = useState(25);
    const [filterOptions, setFilterOptions] = useState({ legalGroups: [], legalEntities: [], parentDivisions: [], subdivisions: [], years: [], periods: [] });
    const [viewAllFilterOptions, setViewAllFilterOptions] = useState({ legalGroups: [], legalEntities: [], parentDivisions: [], subdivisions: [], years: [], periods: [] });
    const [dashboard, setDashboard] = useState({ summary: [], monthly: [], costMix: [], categoryBreakdown: [] });
    const [overheadGroupBy, setOverheadGroupBy] = useState("legal_entity");
    const [overheadSelectedDimensions, setOverheadSelectedDimensions] = useState([]);
    const [dimensionOverheadRows, setDimensionOverheadRows] = useState([]);
    const [dimensionOverheadLoading, setDimensionOverheadLoading] = useState(false);
    const [dimensionOverheadError, setDimensionOverheadError] = useState("");
    const [viewAllRows, setViewAllRows] = useState([]);
    const [viewAllTotals, setViewAllTotals] = useState(null);
    const [previousSummaryRows, setPreviousSummaryRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState("");
    const [detailError, setDetailError] = useState("");
    const [retryCounter, setRetryCounter] = useState(0);
    const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
    const initialFilterOptionsResolved = React.useRef(false);
    const previousMainHierarchy = React.useRef(null);
    const previousViewHierarchy = React.useRef(null);
    const mainOptionsRequestId = React.useRef(0);
    const viewOptionsRequestId = React.useRef(0);

    const update = (key, value) => {
        const old = filtersRef.current || filters;
        const next = { ...old, [key]: value };
        if (key === "legalGroup") { next.legalEntity = []; next.parent = []; next.sub = []; }
        if (key === "legalEntity") { next.parent = []; next.sub = []; }
        if (key === "parent") next.sub = [];
        filtersRef.current = next;
        setFilters(next);
    };
    const updateViewAll = (key, value) => {
        const old = viewAllFiltersRef.current || viewAllFilters;
        const next = { ...old, [key]: value };
        if (key === "legalGroup") { next.legalEntity = []; next.parent = []; next.sub = []; }
        if (key === "legalEntity") { next.parent = []; next.sub = []; }
        if (key === "parent") next.sub = [];
        viewAllFiltersRef.current = next;
        setViewAllFilters(next);
    };
    const optionsQuery = useMemo(() => buildQuery(filters), [filters]);

    React.useEffect(() => {
        let cancelled = false;
        const requestId = ++mainOptionsRequestId.current;
        const currentScope = {
            group: JSON.stringify(filters.legalGroup),
            entity: JSON.stringify(filters.legalEntity),
            parent: JSON.stringify(filters.parent),
        };
        const previous = previousMainHierarchy.current;
        const groupChanged = !previous || previous.group !== currentScope.group;
        const entityChanged = !previous || previous.entity !== currentScope.entity;
        const parentChanged = !previous || previous.parent !== currentScope.parent;
        previousMainHierarchy.current = currentScope;
        // One options request per hierarchy change. Keep parent-level option lists cached
        // when only a descendant changes, so returning to Legal Entity shows every option.
        getManufacturingFilterOptions(manufacturingFilters(filters)).then(async (response) => {
            if (cancelled || requestId !== mainOptionsRequestId.current) return;
            const options = parseManufacturingFilterOptions(response);
            const { legalGroups: groups, years, periods } = options;

            // On first page load, resolve the default hierarchy scope before publishing
            // the filter options. This prevents Legal Group/Year/Period from appearing
            // populated while Legal Entity and lower hierarchy options are still waiting
            // on a second, sequential request. The controls become ready together.
            if (!initialFilterOptionsResolved.current) {
                const fjGroup = groups.find((x) => /\bfj\s*group\b/i.test(labelOf(x)));
                const markedGroup = groups.find((x) => x?.is_default || x?.default);
                const groupDefault = fjGroup || markedGroup || (groups.length === 1 ? groups[0] : null);
                const markedYear = years.find((x) => x?.is_default || x?.default);
                const markedPeriod = periods.find((x) => x?.is_default || x?.default || x?.is_latest || x?.latest);
                const sortedPeriods = sortPeriodsChronologically(periods, filters.year);
                const latestPeriod = sortedPeriods.length ? sortedPeriods[sortedPeriods.length - 1] : FILTER_DEFAULTS.period;
                const defaultYear = String(idOf(markedYear || (years.length === 1 ? years[0] : new Date().getFullYear())));
                const periodForDefaultYear = sortedPeriods.filter((period) => periodYearFromPeriod(period, defaultYear) === Number(defaultYear));
                const defaultValues = {
                    legalGroup: groupDefault ? [String(idOf(groupDefault))] : (Array.isArray(filters.legalGroup) ? filters.legalGroup : []),
                    year: filters.year || defaultYear,
                    period: filters.period || String(labelOf(markedPeriod) || periodForDefaultYear[periodForDefaultYear.length - 1] || latestPeriod),
                };
                const initializedFilters = { ...(filtersRef.current || filters), ...defaultValues };
                // Publish the base options immediately. Do not await a second, scoped
                // request here: once the default Legal Group is applied, this effect
                // runs again and loads the cascaded Legal Entity/Division options in
                // parallel with the dashboard's primary data request.
                if (cancelled || requestId !== mainOptionsRequestId.current) return;
                setFilterOptions(options);
                filtersRef.current = initializedFilters;
                setFilters(initializedFilters);
                setAppliedFilters((old) => ({ ...old, ...defaultValues }));
                initialFilterOptionsResolved.current = true;
                return;
            }

            // Subsequent hierarchy changes retain the existing cascade and multi-select
            // stability behavior; only the initial options publication is synchronized.
            setFilterOptions((old) => ({
                ...options,
                legalGroups: options.legalGroups.length ? options.legalGroups : old.legalGroups,
                legalEntities: groupChanged ? options.legalEntities : (options.legalEntities.length ? old.legalEntities : old.legalEntities),
                parentDivisions: (groupChanged || entityChanged) ? options.parentDivisions : (options.parentDivisions.length ? old.parentDivisions : old.parentDivisions),
                subdivisions: (groupChanged || entityChanged || parentChanged) ? options.subdivisions : (options.subdivisions.length ? old.subdivisions : old.subdivisions),
                years: options.years.length ? options.years : old.years,
                periods: options.periods.length ? options.periods : old.periods,
            }));
        }).catch((e) => {
            if (!cancelled) setError((old) => old || `Unable to load manufacturing filter options: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`);
        });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(filters.legalGroup), JSON.stringify(filters.legalEntity), JSON.stringify(filters.parent), retryCounter]);

    // View All maintains its own selections and caches ancestor option lists independently.
    React.useEffect(() => {
        if (!viewAll) return undefined;
        let cancelled = false;
        const requestId = ++viewOptionsRequestId.current;
        const currentScope = {
            group: JSON.stringify(viewAllFilters.legalGroup),
            entity: JSON.stringify(viewAllFilters.legalEntity),
            parent: JSON.stringify(viewAllFilters.parent),
        };
        const previous = previousViewHierarchy.current;
        const groupChanged = !previous || previous.group !== currentScope.group;
        const entityChanged = !previous || previous.entity !== currentScope.entity;
        const parentChanged = !previous || previous.parent !== currentScope.parent;
        previousViewHierarchy.current = currentScope;
        getManufacturingFilterOptions(manufacturingFilters(viewAllFilters)).then((response) => {
            if (cancelled || requestId !== viewOptionsRequestId.current) return;
            const options = parseManufacturingFilterOptions(response);
            setViewAllFilterOptions((old) => ({
                ...options,
                // Keep ancestor options stable while selecting multiple values.
                legalGroups: options.legalGroups.length ? options.legalGroups : old.legalGroups,
                legalEntities: groupChanged
                    ? options.legalEntities
                    : (options.legalEntities.length ? old.legalEntities : old.legalEntities),
                parentDivisions: (groupChanged || entityChanged)
                    ? options.parentDivisions
                    : (options.parentDivisions.length ? old.parentDivisions : old.parentDivisions),
                subdivisions: (groupChanged || entityChanged || parentChanged)
                    ? options.subdivisions
                    : (options.subdivisions.length ? old.subdivisions : old.subdivisions),
                years: options.years.length ? options.years : old.years,
                periods: options.periods.length ? options.periods : old.periods,
            }));
        }).catch((e) => {
            if (!cancelled) setDetailError((old) => old || `Unable to load View All filter options: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`);
        });
        return () => { cancelled = true; };
    }, [viewAll, JSON.stringify(viewAllFilters.legalGroup), JSON.stringify(viewAllFilters.legalEntity), JSON.stringify(viewAllFilters.parent), retryCounter]);

    // Separate grouped endpoint for the bottom-right analysis chart only.
    // The combined monthly trend continues to use dashboard.monthly.
    React.useEffect(() => {
        let cancelled = false;
        setDimensionOverheadLoading(true);
        setDimensionOverheadError("");
        getManufacturingMonthlyByDimension({ ...manufacturingFilters(appliedFilters), metric: "production_overhead" }, overheadGroupBy)
            .then((response) => {
                if (cancelled) return;
                let payload = unwrapApiResponse(response);
                for (let depth = 0; depth < 2 && payload?.data && !Array.isArray(payload?.rows); depth += 1) payload = payload.data;
                const rows = asArray(payload?.rows || payload?.results || payload?.data || payload);
                const productionOverheadRows = rows.filter((row) => {
                    const metric = first(row, ["metric", "metric_code", "metric_name", "measure", "measure_code"], null);
                    return metric == null || String(metric).toLowerCase().replace(/[-\s]+/g, "_") === "production_overhead";
                });
                setDimensionOverheadRows(productionOverheadRows.map((row) => {
                    const month = String(first(row, ["period_name", "month", "period", "month_name"], "")).trim();
                    const dimension = String(first(row, ["dimension_name", "group_name", "legal_entity_name", "parent_division_name", "subdivision_name", "legal_entity", "parent_division", "subdivision", "name", "label", "dimension"], "Unspecified"));
                    const actual = numberOrNull(first(row, ["actual_reporting_currency", "production_overhead_actual", "actual", "actual_value", "actual_amount", "actual_aed"]));
                    const target = numberOrNull(first(row, ["target_reporting_currency", "production_overhead_target", "target", "budget", "target_value", "budget_amount", "target_aed"]));
                    const variance = numberOrNull(first(row, ["variance_reporting_currency", "production_overhead_variance", "variance", "variance_amount", "actual_variance"]));
                    return { month, dimension, actual: actual == null ? null : actual / 1_000_000, target: target == null ? null : target / 1_000_000, variance: variance == null ? (actual != null && target != null ? (actual - target) / 1_000_000 : null) : variance / 1_000_000, raw: row };
                }).filter((row) => row.month));
            })
            .catch((e) => {
                if (!cancelled) {
                    setDimensionOverheadRows([]);
                    setDimensionOverheadError(e?.response?.data?.detail || e?.response?.data?.message || e.message || "Unable to load grouped production overhead.");
                }
            })
            .finally(() => { if (!cancelled) setDimensionOverheadLoading(false); });
        return () => { cancelled = true; };
    }, [JSON.stringify(appliedFilters), overheadGroupBy, retryCounter]);

    React.useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        getManufacturingDashboard(manufacturingFilters(appliedFilters))
            .then((response) => {
                if (cancelled) return;
                const data = unwrapApiResponse(response);
                const sections = data?.sections || data?.data?.sections || data?.data || data || {};
                setDashboard({
                    summary: asArray(sections.summary || sections.kpis),
                    monthly: asArray(sections.monthly),
                    // Accept the documented hyphenated response keys as well as
                    // the legacy snake_case/camelCase keys. Keep all API calls,
                    // filters, permissions, and downstream component logic intact.
                    costMix: asArray(
                        sections["cost-mix"] ||
                        sections.cost_mix ||
                        sections.costMix
                    ),
                    categoryBreakdown: asArray(
                        sections["category-breakdown"] ||
                        sections.category_breakdown ||
                        sections.categoryBreakdown ||
                        sections.breakdown
                    ).map(normalizeBreakdownRow)
                });
            })
            .catch((e) => {
                if (!cancelled) {
                    setDashboard({ summary: [], monthly: [], costMix: [], categoryBreakdown: [] });
                    setError(`Unable to load Manufacturing dashboard: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`);
                }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [buildQuery(appliedFilters), retryCounter, dashboardRefreshKey]);

    // Previous-month KPI comparison is fetched independently so a slower summary
    // endpoint never holds up the main dashboard, charts, or KPI cards.
    React.useEffect(() => {
        let cancelled = false;
        const previousPeriod = previousPeriodName(appliedFilters.period, appliedFilters.year);
        const previousYear = /^Jan/i.test(String(appliedFilters.period)) ? Number(appliedFilters.year) - 1 : Number(appliedFilters.year);
        if (!previousPeriod) {
            setPreviousSummaryRows([]);
            return undefined;
        }
        getManufacturingSummary(manufacturingFilters({ ...appliedFilters, period: previousPeriod, year: previousYear }))
            .then((response) => {
                if (!cancelled) setPreviousSummaryRows(extractSummaryRows(response, previousPeriod, previousYear));
            })
            .catch(() => {
                if (!cancelled) setPreviousSummaryRows([]);
            });
        return () => { cancelled = true; };
    }, [buildQuery(appliedFilters), retryCounter]);

    const legalGroups = withoutAllOptions(filterOptions.legalGroups);
    const selectedMainGroups = (Array.isArray(filters.legalGroup) ? filters.legalGroup : (filters.legalGroup ? [filters.legalGroup] : [])).map(String);
    const selectedMainEntities = (Array.isArray(filters.legalEntity) ? filters.legalEntity : (filters.legalEntity ? [filters.legalEntity] : [])).map(String);
    const selectedMainParents = (Array.isArray(filters.parent) ? filters.parent : (filters.parent ? [filters.parent] : [])).map(String);
    const legalEntities = withoutAllOptions(filterOptions.legalEntities).filter((x) => {
        const groupId = first(x, ["legal_group_id", "legalGroupId", "group_id"], null);
        return !selectedMainGroups.length || groupId == null || selectedMainGroups.includes(String(groupId));
    });
    const parentDivisions = withoutAllOptions(filterOptions.parentDivisions).filter((x) => {
        const entityId = first(x, ["legal_entity_id", "legalEntityId", "entity_id"], null);
        const groupId = first(x, ["legal_group_id", "legalGroupId", "group_id"], null);
        return (!selectedMainEntities.length || entityId == null || selectedMainEntities.includes(String(entityId))) && (!selectedMainGroups.length || groupId == null || selectedMainGroups.includes(String(groupId)));
    });
    const subdivisions = withoutAllOptions(filterOptions.subdivisions).filter((x) => {
        const parentId = first(x, ["parent_division_id", "parentDivisionId"], null);
        return !selectedMainParents.length || parentId == null || selectedMainParents.includes(String(parentId));
    });
    const viewGroups = withoutAllOptions(viewAllFilterOptions.legalGroups.length ? viewAllFilterOptions.legalGroups : filterOptions.legalGroups);
    const selectedViewGroups = (Array.isArray(viewAllFilters.legalGroup) ? viewAllFilters.legalGroup : (viewAllFilters.legalGroup ? [viewAllFilters.legalGroup] : [])).map(String);
    const selectedViewEntities = (Array.isArray(viewAllFilters.legalEntity) ? viewAllFilters.legalEntity : (viewAllFilters.legalEntity ? [viewAllFilters.legalEntity] : [])).map(String);
    const selectedViewParents = (Array.isArray(viewAllFilters.parent) ? viewAllFilters.parent : (viewAllFilters.parent ? [viewAllFilters.parent] : [])).map(String);
    const viewAllLegalEntities = withoutAllOptions(viewAllFilterOptions.legalEntities.length ? viewAllFilterOptions.legalEntities : filterOptions.legalEntities).filter((x) => {
        const groupId = first(x, ["legal_group_id", "legalGroupId", "group_id"], null);
        return !selectedViewGroups.length || groupId == null || selectedViewGroups.includes(String(groupId));
    });
    const viewAllParentDivisions = withoutAllOptions(viewAllFilterOptions.parentDivisions.length ? viewAllFilterOptions.parentDivisions : filterOptions.parentDivisions).filter((x) => {
        const entityId = first(x, ["legal_entity_id", "legalEntityId", "entity_id"], null);
        const groupId = first(x, ["legal_group_id", "legalGroupId", "group_id"], null);
        return (!selectedViewEntities.length || entityId == null || selectedViewEntities.includes(String(entityId))) && (!selectedViewGroups.length || groupId == null || selectedViewGroups.includes(String(groupId)));
    });
    const viewAllSubdivisions = withoutAllOptions(viewAllFilterOptions.subdivisions.length ? viewAllFilterOptions.subdivisions : filterOptions.subdivisions).filter((x) => {
        const parentId = first(x, ["parent_division_id", "parentDivisionId"], null);
        return !selectedViewParents.length || parentId == null || selectedViewParents.includes(String(parentId));
    });

    const drillRows = dashboard.categoryBreakdown;
    const toggleCostCategory = async (category) => {
        const isOpen = expandedCostCategories.has(category);
        setExpandedCostCategories((old) => {
            const next = new Set(old);
            isOpen ? next.delete(category) : next.add(category);
            return next;
        });
        if (isOpen || Object.prototype.hasOwnProperty.call(inlineCategoryDetails, category)) return;
        setInlineCategoryLoading((old) => ({ ...old, [category]: true }));
        try {
            const response = await getManufacturingHierarchyCategoryDetail(
                manufacturingFilters(appliedFilters),
                category
            );
            let payload = unwrapApiResponse(response);
            for (let depth = 0; depth < 2 && payload?.data && !Array.isArray(payload?.rows); depth += 1) payload = payload.data;
            const rows = asArray(payload?.rows || payload?.results || payload?.data || payload)
                .map(normalizeBreakdownRow);
            setInlineCategoryDetails((old) => ({ ...old, [category]: rows }));
        } catch (e) {
            setInlineCategoryDetails((old) => ({
                ...old,
                [category]: { error: e?.response?.data?.detail || e?.response?.data?.message || e.message || "Unable to load account details." }
            }));
        } finally {
            setInlineCategoryLoading((old) => ({ ...old, [category]: false }));
        }
    };
    const summaryRows = dashboard.summary;
    const kpis = useMemo(() => {
        const palette = [
            { icon: "▤", color: "#0f9f8f", bg: "#e9faf5" }, { icon: "▥", color: "#7c3aed", bg: "#f3edff" },
            { icon: "⬡", color: "#d97706", bg: "#fff6e8" }, { icon: "◔", color: "#2563eb", bg: "#eaf4ff" },
            { icon: "%", color: "#0f766e", bg: "#e6fffb" }
        ];
        return summaryRows.map((row, index) => {
            const unit = String(first(row, ["unit"], "AED")).toLowerCase();
            const metric = String(first(row, ["metric", "label", "name"], "Metric"));
            const percent = unit.includes("%") || unit.includes("percent") || /percentage|percent|pct|%/.test(metric.toLowerCase());
            const actual = numberOrNull(first(row, ["actual", "actual_value"]));
            const target = numberOrNull(first(row, ["target", "budget", "target_value"]));
            const apiVariance = numberOrNull(first(row, ["variance"]));
            const apiVariancePp = numberOrNull(first(row, ["variance_pp"]));
            const displayVariance = percent
                ? (apiVariancePp != null ? apiVariancePp : (actual != null && target != null ? actual - target : null))
                : (apiVariance != null ? apiVariance / 1_000_000 : (actual != null && target != null ? (actual - target) / 1_000_000 : null));
            return {
                period: String(first(row, ["phase", "period"], index < 5 ? "PTD" : "YTD")).toUpperCase(),
                displayOrder: numberOrNull(first(row, ["display_order", "displayOrder"])) ?? index,
                label: String(first(row, ["label", "display_name", "metric_label", "metric", "name"], metric)),
                value: actual == null ? null : (percent ? actual : actual / 1_000_000),
                target: target == null ? null : (percent ? target : target / 1_000_000),
                percent,
                lowerIsBetter: !/absorption/i.test(metric),
                icon: palette[index % palette.length].icon, color: palette[index % palette.length].color,
                bg: palette[index % palette.length].bg,
                varianceDisplay: displayVariance,
                varianceStatus: first(row, ["variance_status"]),
                variancePct: numberOrNull(first(row, ["variance_pct"])),
                variancePp: apiVariancePp,
                lastMonthValue: (() => {
                    const metricKey = normalizeMetricKey(metric);
                    const phaseKey = String(first(row, ["phase", "period"], "")).toUpperCase();
                    // Match the previous period by metric + PTD/YTD phase + unit.
                    // Read only its actual value: target/variance must never be used
                    // for the "Vs Last Month" comparison.
                    const previous = previousSummaryRows.find((candidate) => {
                        const candidateMetric = first(candidate, ["metric", "label", "display_name", "metric_label", "name"], "");
                        const candidatePhase = String(first(candidate, ["phase", "period"], "")).toUpperCase();
                        const candidateUnit = String(first(candidate, ["unit"], "")).toLowerCase();
                        const candidateIsPercent = candidateUnit.includes("percent") || candidateUnit.includes("%") ||
                            /(?:percent|pct|%)/i.test(String(candidateMetric));
                        return normalizeMetricKey(candidateMetric) === metricKey &&
                            candidatePhase === phaseKey &&
                            candidateIsPercent === percent;
                    });
                    const prev = numberOrNull(first(previous, ["actual", "actual_value", "actual_reporting_currency"]));
                    return prev == null ? null : (percent ? prev : prev / 1_000_000);
                })(),
                raw: row
            };
        }).sort((a, b) => {
            const phaseOrder = (a.period === "PTD" ? 0 : 1) - (b.period === "PTD" ? 0 : 1);
            const orderFor = (item) => {
                const label = String(item.label || "").toLowerCase();
                if (label.includes("cost of material") && !label.includes("%") && !label.includes("against sales")) return 0;
                if (label.includes("cost of material") && (label.includes("%") || label.includes("against sales"))) return 1;
                if (label.includes("production overhead")) return 2;
                if (label.includes("overhead absorption") && !label.includes("%")) return 3;
                if (label.includes("overhead absorption") && label.includes("%")) return 4;
                return 10 + item.displayOrder;
            };
            return phaseOrder || orderFor(a) - orderFor(b) || a.displayOrder - b.displayOrder;
        });
    }, [summaryRows, previousSummaryRows]);

    // The dashboard endpoint's monthly section is the authoritative Jan-to-selected-month
    // trend. Do not feed monthly-by-dimension grouped rows into this chart: their grain and
    // shape differ and summing dimension rows can double-count alternative series.
    const monthlySource = dashboard.monthly;
    const trendData = (() => {
        const rows = monthlySource;
        const wide = rows.some((row) =>
            ["production_overhead", "production_overhead_actual", "production_overhead_target", "material", "material_actual", "material_target", "cost_of_material", "cost_of_material_actual", "cost_of_material_target", "labour", "labour_actual", "labour_target", "direct_labour", "direct_labour_actual", "overheads", "overheads_actual", "overheads_target", "manufacturing_overheads", "manufacturing_overheads_actual", "manufacturing_direct_overheads", "manufacturing_direct_overheads_actual", "manufacturing_direct_overheads_target", "manufacturing_direct_overheads_variance"].some((key) => row?.[key] !== undefined)
        );
        if (wide) return rows.map((row) => {
            const month = String(first(row, ["period_name", "month", "period"], ""));
            const amount = (keys) => {
                const value = numberOrNull(first(row, keys));
                return value == null ? null : value / 1_000_000;
            };
            return {
                month,
                actual: amount(["production_overhead_actual", "production_overhead", "actual_reporting_currency", "actual", "actual_total"]),
                target: amount(["production_overhead_target", "production_overhead_budget", "target_reporting_currency", "target", "budget", "target_total"]),
                material: amount(["material_actual", "cost_of_material_actual", "material", "cost_of_material"]),
                materialTarget: amount(["material_target", "cost_of_material_target", "material_budget", "cost_of_material_budget"]),
                labour: amount(["labour_actual", "direct_labour_actual", "labour", "direct_labour", "direct_labor"]),
                labourTarget: amount(["labour_target", "direct_labour_target", "labour_budget", "direct_labour_budget"]),
                overheads: amount(["overheads_actual", "manufacturing_overheads_actual", "manufacturing_direct_overheads_actual", "overheads", "manufacturing_overheads", "manufacturing_direct_overheads"]),
                overheadsTarget: amount(["overheads_target", "manufacturing_overheads_target", "manufacturing_direct_overheads_target", "overheads_budget", "manufacturing_overheads_budget"]),
                overheadsVariance: amount(["overheads_variance", "manufacturing_overheads_variance", "manufacturing_direct_overheads_variance", "manufacturing_direct_overheads_variance_aed"])
            };
        });
        const grouped = new Map();
        rows.forEach((row) => {
            const month = String(first(row, ["period_name", "month", "period"], ""));
            if (!grouped.has(month)) grouped.set(month, { month });
            const item = grouped.get(month);
            const metric = String(first(row, ["metric", "metric_name", "series", "category"], "")).toLowerCase().replace(/[_-]+/g, " ");
            const actual = numberOrNull(first(row, ["actual_reporting_currency", "actual", "actual_value", "actual_amount", "actual_aed"]));
            const target = numberOrNull(first(row, ["target_reporting_currency", "target", "budget", "target_value", "budget_amount"]));
            const reportedVariance = numberOrNull(first(row, ["variance_reporting_currency", "variance", "variance_amount", "actual_variance"]));
            const assign = (a, t) => { item[a] = actual == null ? null : actual / 1_000_000; item[t] = target == null ? null : target / 1_000_000; };
            if (metric.includes("material percentage") || metric.includes("material %")) return;
            if (metric.includes("material")) assign("material", "materialTarget");
            else if (metric.includes("labour") || metric.includes("labor")) assign("labour", "labourTarget");
            else if (metric.includes("manufacturing overhead") || metric.includes("direct overhead")) {
                assign("overheads", "overheadsTarget");
                item.overheadsVariance = reportedVariance == null ? null : reportedVariance / 1_000_000;
            }
            else if (metric.includes("production overhead")) assign("actual", "target");
        });
        const monthOrder = (value) => { const m = String(value).match(/^([A-Za-z]{3})[- ](\d{2,4})$/); return m ? Number(m[2]) * 12 + monthNames.indexOf(m[1]) : 0; };
        return Array.from(grouped.values()).sort((a, b) => monthOrder(a.month) - monthOrder(b.month));
    })();
    const monthAnalysis = trendData.map((d) => ({ ...d, variance: d.actual != null && d.target != null ? d.actual - d.target : null }));
    // The API monthly payload is long-form: one row per metric/month. Build a dedicated
    // production-overhead series from the exact metric rows instead of relying on the
    // broader cost-trend mapper, so the chart remains populated for the documented schema.
    const overheadByMonth = new Map();
    monthlySource.forEach((row) => {
        const metricValue = first(row, ["metric", "metric_name", "series"], null);
        const metric = String(metricValue ?? first(row, ["category", "category_name", "label"], "")).toLowerCase().replace(/[_-]+/g, " ");
        if (!metric.includes("production overhead")) return;
        const month = String(first(row, ["period_name", "month", "period"], "")).trim();
        if (!month) return;
        const actualRaw = numberOrNull(first(row, ["actual_reporting_currency", "actual", "actual_value", "actual_amount", "actual_aed"]));
        const targetRaw = numberOrNull(first(row, ["target_reporting_currency", "target", "budget", "target_value", "budget_amount", "target_aed"]));
        const current = overheadByMonth.get(month) || { month, actual: null, target: null };
        current.actual = actualRaw == null ? current.actual : actualRaw / 1_000_000;
        current.target = targetRaw == null ? current.target : targetRaw / 1_000_000;
        overheadByMonth.set(month, current);
    });
    const monthSortLocal = (v) => { const m = String(v).match(/^([A-Za-z]{3})[- ](\d{2,4})$/); return m ? Number(m[2]) * 12 + monthNames.indexOf(m[1]) : 0; };
    const overheadFallbackByMonth = new Map(trendData
        .filter((row) => row.actual != null || row.target != null)
        .map((row) => [row.month, { month: row.month, actual: row.actual, target: row.target }]));
    overheadByMonth.forEach((row, month) => {
        const fallback = overheadFallbackByMonth.get(month) || { month, actual: null, target: null };
        overheadFallbackByMonth.set(month, {
            month,
            actual: row.actual ?? fallback.actual,
            target: row.target ?? fallback.target
        });
    });
    const overheadChartData = Array.from(overheadFallbackByMonth.values())
        .filter((row) => row.actual != null || row.target != null)
        .sort((a, b) => monthSortLocal(a.month) - monthSortLocal(b.month));
    const dimensionNames = Array.from(new Set(dimensionOverheadRows.map((row) => row.dimension))).sort((a, b) => a.localeCompare(b));
    // Keep the grouped chart readable: show up to four groups by default. Users can
    // explicitly select a different subset without changing the applied data scope.
    React.useEffect(() => {
        // If main filters change (e.g. Legal Group RKME), remove stale selected names
        // and let the new permitted group options drive the chart.
        setOverheadSelectedDimensions((current) => current.filter((name) => dimensionNames.includes(name)));
    }, [dimensionNames.join("\\u001f")]);
    const visibleDimensionNames = overheadSelectedDimensions.length
        ? dimensionNames.filter((name) => overheadSelectedDimensions.includes(name))
        : dimensionNames.slice(0, 5);
    // One X-axis tick per month. Each selected dimension gets its own Actual/Target
    // series, preventing long repeated "dimension · month" labels from overlapping.
    const dimensionOverheadChartData = (() => {
        const byMonth = new Map();
        dimensionOverheadRows.filter((row) => visibleDimensionNames.includes(row.dimension)).forEach((row) => {
            if (!byMonth.has(row.month)) byMonth.set(row.month, { month: row.month });
            const monthRow = byMonth.get(row.month);
            monthRow[`${row.dimension}__actual`] = row.actual;
            monthRow[`${row.dimension}__target`] = row.target;
        });
        return Array.from(byMonth.values()).sort((a, b) => monthSortLocal(a.month) - monthSortLocal(b.month));
    })();
    const mixColors = COLORS_BY_CATEGORY;
    const costMixRaw = dashboard.costMix.map((row, i) => ({
        name: String(first(row, ["category", "name", "metric", "label"], "Cost category")),
        // `actual` is the reporting-currency amount; never substitute raw AED values for another currency.
        rawAmount: numberOrNull(first(row, ["actual_reporting_currency", "actual", "amount_reporting_currency", "amount", "amount_aed", "value"])),
        apiPct: numberOrNull(first(row, ["percentage", "pct", "share_pct", "percent"])),
        color: mixColors[i % mixColors.length]
    }));
    const requiredMixLabels = ["material", "labour", "overhead", "opex", "operating expense"];
    const costMixComponents = costMixRaw.filter((item) => {
        const label = item.name.toLowerCase();
        if (label.includes("absorption") || label.includes("percentage") || label.includes("%")) return false;
        return requiredMixLabels.some((candidate) => label.includes(candidate));
    });
    const hasAllMixAmounts = costMixComponents.length === 4 && costMixComponents.every((item) => item.rawAmount != null);
    const costMixTotal = hasAllMixAmounts ? costMixComponents.reduce((sum, item) => sum + item.rawAmount, 0) : null;
    const costMix = costMixComponents.map((item) => ({
        name: item.name,
        amount: item.rawAmount == null ? null : item.rawAmount / 1_000_000,
        pct: item.apiPct != null ? item.apiPct : (hasAllMixAmounts && costMixTotal > 0 && item.rawAmount != null ? item.rawAmount / costMixTotal * 100 : null),
        color: item.color
    }));
    const filteredRows = drillRows.filter((r) => r.category.toLowerCase().includes(search.toLowerCase()));
    const visibleRows = filteredRows.slice(0, pageSize);
    const exportReport = async (format, reportName = "category-breakdown", filterSet = filters) => {
        try {
            setDetailError("");
            const apiReportName = reportName === "category-breakdown" ? "category-breakdown-by-hierarchy"
                : reportName === "category-detail" ? "category-detail-by-hierarchy"
                    : reportName === "production-overhead-monthly" ? "monthly-by-dimension" : reportName;
            const exportFilters = {
                ...manufacturingFilters(filterSet), search,
                ...(reportName === "production-overhead-monthly" ? { group_by: overheadGroupBy, metric: "production_overhead" } : {})
            };
            if (reportName === "category-detail") {
                exportFilters.category = selectedDetailCategory;
            }
            // Use the hierarchy report names for both Excel and PDF, without
            // changing the legacy report names used by other dashboard exports.
            const response = format === "excel"
                ? await exportManufacturingExcel(exportFilters, apiReportName)
                : await exportManufacturingPDF(exportFilters, apiReportName);
            const blob = response?.data instanceof Blob
                ? response.data
                : response instanceof Blob
                    ? response
                    : new Blob([response?.data ?? response]);
            const disposition = response?.headers?.["content-disposition"] || "";
            const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
            const groupingSuffix = reportName === "production-overhead-monthly" ? `_${overheadGroupBy}` : "";
            const fallback = `Manufacturing_${reportName.replace(/-/g, "_")}${groupingSuffix}_${filterSet.period}.${format === "excel" ? "xlsx" : "pdf"}`;
            let filename = fallback;
            if (match) {
                const rawName = (match[1] || match[2] || "").trim();
                try { filename = decodeURIComponent(rawName); } catch { filename = rawName || fallback; }
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (e) {
            const message = e?.response?.data?.detail || e?.response?.data?.message || e.message;
            setDetailError(`Unable to export ${format.toUpperCase()}: ${message}`);
        }
    };
    const exportExcel = () => exportReport("excel");
    const exportPdf = () => exportReport("pdf");
    const openViewAll = async (reportName = "category-breakdown", category = "", filterOverride = appliedFilters) => {
        setViewAll(reportName);
        setSelectedDetailCategory(reportName === "category-detail" ? category : "");
        viewAllFiltersRef.current = {
            ...filterOverride,
            legalGroup: [...(filterOverride.legalGroup || [])],
            legalEntity: [...(filterOverride.legalEntity || [])],
            parent: [...(filterOverride.parent || [])],
            sub: [...(filterOverride.sub || [])],
        };
        setViewAllFilters(viewAllFiltersRef.current);
        setViewAllUnit("millions");
        setSearch("");
        setViewAllPage(1);
        setDetailLoading(true); setDetailError(""); setViewAllRows([]); setViewAllTotals(null);
        try {
            if (reportName === "monthly-trend") {
                setPageSize(20);
                setViewAllRows(trendData.map((r) => ({
                    category: r.month,
                    actualPtd: r.material,
                    targetPtd: r.materialTarget,
                    variancePtd: r.material != null && r.materialTarget != null ? r.material - r.materialTarget : null,
                    actualYtd: r.labour,
                    targetYtd: r.labourTarget,
                    varianceYtd: r.labour != null && r.labourTarget != null ? r.labour - r.labourTarget : null,
                    overheadActual: r.overheads,
                    overheadTarget: r.overheadsTarget,
                    overheadVariance: r.overheadsVariance ?? (r.overheads != null && r.overheadsTarget != null ? r.overheads - r.overheadsTarget : null),
                })));
                setDetailLoading(false);
                return;
            }
            if (reportName === "production-overhead-monthly") {
                setPageSize(20);
                const response = await getManufacturingMonthlyByDimension({ ...manufacturingFilters(filterOverride), metric: "production_overhead" }, overheadGroupBy);
                let payload = unwrapApiResponse(response);
                for (let depth = 0; depth < 2 && payload?.data && !Array.isArray(payload?.rows); depth += 1) payload = payload.data;
                const rows = asArray(payload?.rows || payload?.results || payload?.data || payload).filter((row) => {
                    const metric = first(row, ["metric", "metric_code", "metric_name", "measure", "measure_code"], null);
                    return metric == null || String(metric).toLowerCase().replace(/[-\s]+/g, "_") === "production_overhead";
                }).map((row) => {
                    const month = String(first(row, ["period_name", "month", "period", "month_name"], "")).trim();
                    const dimension = String(first(row, ["dimension_name", "group_name", "legal_entity_name", "parent_division_name", "subdivision_name", "legal_entity", "parent_division", "subdivision", "name", "label", "dimension"], "Unspecified"));
                    const actual = numberOrNull(first(row, ["actual_reporting_currency", "production_overhead_actual", "actual", "actual_value", "actual_amount", "actual_aed"]));
                    const target = numberOrNull(first(row, ["target_reporting_currency", "production_overhead_target", "target", "budget", "target_value", "budget_amount", "target_aed"]));
                    const variance = numberOrNull(first(row, ["variance_reporting_currency", "production_overhead_variance", "variance", "variance_amount", "actual_variance"]));
                    return { month, dimension, actualRaw: actual, targetRaw: target, varianceRaw: variance };
                }).filter((row) => row.month);
                const monthSort = (value) => {
                    const match = String(value).match(/^([A-Za-z]{3})[- ](\d{2,4})$/);
                    if (!match) return 0;
                    const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2]);
                    return year * 12 + monthNames.findIndex((m) => m.toLowerCase() === match[1].toLowerCase());
                };
                const monthColumns = Array.from(new Set(rows.map((row) => row.month))).sort((a, b) => monthSort(a) - monthSort(b));
                const pivot = new Map();
                rows.forEach((row) => {
                    if (!pivot.has(row.dimension)) pivot.set(row.dimension, { category: row.dimension, dimension: row.dimension, monthColumns });
                    const targetRow = pivot.get(row.dimension);
                    targetRow[`month__${row.month}`] = row.actualRaw == null ? null : row.actualRaw / 1_000_000;
                    targetRow[`target__${row.month}`] = row.targetRaw == null ? null : row.targetRaw / 1_000_000;
                    targetRow[`variance__${row.month}`] = row.varianceRaw == null ? (row.actualRaw != null && row.targetRaw != null ? (row.actualRaw - row.targetRaw) / 1_000_000 : null) : row.varianceRaw / 1_000_000;
                });
                const pivotRows = Array.from(pivot.values()).map((row) => {
                    const actuals = monthColumns.map((month) => numberOrNull(row[`month__${month}`])).filter((v) => v != null);
                    const targets = monthColumns.map((month) => numberOrNull(row[`target__${month}`])).filter((v) => v != null);
                    const variances = monthColumns.map((month) => numberOrNull(row[`variance__${month}`])).filter((v) => v != null);
                    return {
                        ...row,
                        actualPtd: actuals.length ? actuals.reduce((sum, v) => sum + v, 0) : null,
                        targetPtd: targets.length ? targets.reduce((sum, v) => sum + v, 0) : null,
                        variancePtd: variances.length ? variances.reduce((sum, v) => sum + v, 0) : null,
                        monthColumns,
                    };
                });
                setViewAllRows(pivotRows);
                setDetailLoading(false);
                return;
            }
            const viewFilters = {
                ...manufacturingFilters(filterOverride),
                category: reportName === "category-detail" ? (category || selectedDetailCategory) : category,
                page: 1,
                page_size: pageSize,
                search: "",
            };
            const apiReportName = reportName === "category-breakdown" ? "category-breakdown-by-hierarchy"
                : reportName === "category-detail" ? "category-detail-by-hierarchy" : reportName;
            // Route the two hierarchy reports through their explicit service helpers.
            // Other report types keep using the existing generic View All service.
            const response = reportName === "category-breakdown"
                ? await getManufacturingHierarchyCategoryBreakdown(viewFilters)
                : reportName === "category-detail"
                    ? await getManufacturingHierarchyCategoryDetail(
                        viewFilters,
                        category || selectedDetailCategory
                    )
                    : await getManufacturingViewAll(viewFilters, apiReportName);
            const data = unwrapApiResponse(response);
            const payload = data?.data && !data?.rows ? data.data : data;
            setViewAllTotals(payload?.totals || null);
            setViewAllRows(asArray(payload?.rows ? payload : payload?.data || payload).map((row) => {
                const normalized = normalizeBreakdownRow(row);
                return reportName === "category-detail" ? { ...normalized, category: selectedDetailCategory || category || normalized.category } : normalized;
            }));
        } catch (e) {
            setDetailError(`Unable to load View All: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`);
        } finally { setDetailLoading(false); }
    };
    const applyViewAllFilters = async () => {
        const reportName = viewAll || "category-breakdown";
        const currentViewFilters = viewAllFiltersRef.current || viewAllFilters;
        const selectedFilters = {
            ...currentViewFilters,
            legalGroup: [...(currentViewFilters.legalGroup || [])],
            legalEntity: [...(currentViewFilters.legalEntity || [])],
            parent: [...(currentViewFilters.parent || [])],
            sub: [...(currentViewFilters.sub || [])],
        };
        setDetailError("");
        setViewAllPage(1);
        setDetailLoading(true);
        setViewAllRows([]);
        const requestId = ++viewOptionsRequestId.current;
        try {
            // Refresh cascade options asynchronously, but never make the first Apply click
            // wait for that request. Use the values selected in the View All controls now.
            const optionsRequestId = requestId;
            getManufacturingFilterOptions(manufacturingFilters(selectedFilters)).then((optionsResponse) => {
                if (optionsRequestId !== viewOptionsRequestId.current) return;
                const scopedOptions = parseManufacturingFilterOptions(optionsResponse);
                setViewAllFilterOptions((old) => ({ ...scopedOptions, years: scopedOptions.years.length ? scopedOptions.years : old.years, periods: scopedOptions.periods.length ? scopedOptions.periods : old.periods }));
            }).catch(() => { /* Keep applying the selected report filters even if option refresh fails. */ });
            if (reportName === "production-overhead-monthly") {
                const response = await getManufacturingMonthlyByDimension({ ...manufacturingFilters(selectedFilters), metric: "production_overhead" }, overheadGroupBy);
                let payload = unwrapApiResponse(response);
                for (let depth = 0; depth < 2 && payload?.data && !Array.isArray(payload?.rows); depth += 1) payload = payload.data;
                const rows = asArray(payload?.rows || payload?.results || payload?.data || payload).filter((row) => {
                    const metric = first(row, ["metric", "metric_code", "metric_name", "measure", "measure_code"], null);
                    return metric == null || String(metric).toLowerCase().replace(/[-\s]+/g, "_") === "production_overhead";
                }).map((row) => {
                    const month = String(first(row, ["period_name", "month", "period", "month_name"], "")).trim();
                    const dimension = String(first(row, ["dimension_name", "group_name", "legal_entity_name", "parent_division_name", "subdivision_name", "legal_entity", "parent_division", "subdivision", "name", "label", "dimension"], "Unspecified"));
                    const actual = numberOrNull(first(row, ["actual_reporting_currency", "production_overhead_actual", "actual", "actual_value", "actual_amount", "actual_aed"]));
                    const target = numberOrNull(first(row, ["target_reporting_currency", "production_overhead_target", "target", "budget", "target_value", "budget_amount", "target_aed"]));
                    const variance = numberOrNull(first(row, ["variance_reporting_currency", "production_overhead_variance", "variance", "variance_amount", "actual_variance"]));
                    return { month, dimension, actualRaw: actual, targetRaw: target, varianceRaw: variance };
                }).filter((row) => row.month);
                const monthSort = (value) => {
                    const match = String(value).match(/^([A-Za-z]{3})[- ](\d{2,4})$/);
                    if (!match) return 0;
                    const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2]);
                    return year * 12 + monthNames.findIndex((m) => m.toLowerCase() === match[1].toLowerCase());
                };
                const monthColumns = Array.from(new Set(rows.map((row) => row.month))).sort((a, b) => monthSort(a) - monthSort(b));
                const pivot = new Map();
                rows.forEach((row) => {
                    if (!pivot.has(row.dimension)) pivot.set(row.dimension, { category: row.dimension, dimension: row.dimension, monthColumns });
                    const targetRow = pivot.get(row.dimension);
                    targetRow[`month__${row.month}`] = row.actualRaw == null ? null : row.actualRaw / 1_000_000;
                    targetRow[`target__${row.month}`] = row.targetRaw == null ? null : row.targetRaw / 1_000_000;
                    targetRow[`variance__${row.month}`] = row.varianceRaw == null ? (row.actualRaw != null && row.targetRaw != null ? (row.actualRaw - row.targetRaw) / 1_000_000 : null) : row.varianceRaw / 1_000_000;
                });
                const pivotRows = Array.from(pivot.values()).map((row) => {
                    const actuals = monthColumns.map((month) => numberOrNull(row[`month__${month}`])).filter((v) => v != null);
                    const targets = monthColumns.map((month) => numberOrNull(row[`target__${month}`])).filter((v) => v != null);
                    const variances = monthColumns.map((month) => numberOrNull(row[`variance__${month}`])).filter((v) => v != null);
                    return {
                        ...row,
                        actualPtd: actuals.length ? actuals.reduce((sum, v) => sum + v, 0) : null,
                        targetPtd: targets.length ? targets.reduce((sum, v) => sum + v, 0) : null,
                        variancePtd: variances.length ? variances.reduce((sum, v) => sum + v, 0) : null,
                        monthColumns,
                    };
                });
                setViewAllRows(pivotRows);
                return;
            }
            if (reportName === "monthly-trend") {
                const response = await getManufacturingDashboard(manufacturingFilters(selectedFilters));
                const data = unwrapApiResponse(response);
                const sections = data?.sections || data?.data?.sections || data?.data || data || {};
                const monthly = asArray(sections.monthly);
                if (reportName === "production-overhead-monthly") {
                    const byMonth = new Map();
                    monthly.forEach((row) => {
                        const metric = String(first(row, ["metric", "metric_name", "series", "category", "category_name", "label"], "")).toLowerCase().replace(/[_-]+/g, " ");
                        if (!metric.includes("production overhead")) return;
                        const month = String(first(row, ["period_name", "month", "period"], "")).trim();
                        if (!month) return;
                        const actual = numberOrNull(first(row, ["actual_reporting_currency", "actual", "actual_value", "actual_amount", "actual_aed"]));
                        const target = numberOrNull(first(row, ["target_reporting_currency", "target", "budget", "target_value", "budget_amount", "target_aed"]));
                        const item = byMonth.get(month) || { category: month, actualPtd: null, targetPtd: null, variancePtd: null };
                        if (actual != null) item.actualPtd = actual / 1_000_000;
                        if (target != null) item.targetPtd = target / 1_000_000;
                        item.variancePtd = item.actualPtd != null && item.targetPtd != null ? item.actualPtd - item.targetPtd : null;
                        byMonth.set(month, item);
                    });
                    setViewAllRows(Array.from(byMonth.values()).sort((a, b) => monthSort(a.category) - monthSort(b.category)));
                } else {
                    const grouped = new Map();
                    monthly.forEach((row) => {
                        const month = String(first(row, ["period_name", "month", "period"], "")).trim();
                        const metric = String(first(row, ["metric", "metric_name", "series", "category"], "")).toLowerCase().replace(/[_-]+/g, " ");
                        if (!month) return;
                        const actual = numberOrNull(first(row, ["actual_reporting_currency", "actual", "actual_value", "actual_amount", "actual_aed"]));
                        const target = numberOrNull(first(row, ["target_reporting_currency", "target", "budget", "target_value", "budget_amount", "target_aed"]));
                        const reportedVariance = numberOrNull(first(row, ["variance_reporting_currency", "variance", "variance_amount", "actual_variance"]));
                        const item = grouped.get(month) || { category: month };
                        const assign = (actualKey, targetKey) => { item[actualKey] = actual == null ? null : actual / 1_000_000; item[targetKey] = target == null ? null : target / 1_000_000; };
                        if (metric.includes("material") && !metric.includes("percentage")) assign("actualPtd", "targetPtd");
                        else if (metric.includes("labour") || metric.includes("labor")) assign("actualYtd", "targetYtd");
                        else if (metric.includes("manufacturing direct overhead") || metric.includes("manufacturing overhead") || metric.includes("direct overhead")) {
                            assign("overheadActual", "overheadTarget");
                            item.overheadVariance = reportedVariance != null
                                ? reportedVariance / 1_000_000
                                : (actual != null && target != null ? (actual - target) / 1_000_000 : null);
                        }
                        grouped.set(month, item);
                    });
                    setViewAllRows(Array.from(grouped.values()).sort((a, b) => monthSort(a.category) - monthSort(b.category)).map(r => ({ ...r, variancePtd: r.actualPtd != null && r.targetPtd != null ? r.actualPtd - r.targetPtd : null, varianceYtd: r.actualYtd != null && r.targetYtd != null ? r.actualYtd - r.targetYtd : null })));
                }
            } else {
                await openViewAll(reportName, reportName === "category-detail" ? selectedDetailCategory : "", selectedFilters);
            }
        } catch (e) {
            setDetailError(`Unable to apply View All filters: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`);
        } finally { setDetailLoading(false); }
    };
    const monthSort = (value) => { const m = String(value).match(/^([A-Za-z]{3})[- ](\d{2,4})$/); return m ? Number(m[2]) * 12 + monthNames.indexOf(m[1]) : 0; };
    const retryDashboard = () => { setError(""); setDetailError(""); setRetryCounter((x) => x + 1); };
    const getResetFilters = () => {
        const fjGroup = legalGroups.find((x) => /\bfj\s*group\b/i.test(labelOf(x)));
        const markedGroup = legalGroups.find((x) => x?.is_default || x?.default);
        const defaultGroup = fjGroup || markedGroup || (legalGroups.length === 1 ? legalGroups[0] : null);
        return { ...FILTER_DEFAULTS, legalGroup: defaultGroup ? [String(idOf(defaultGroup))] : [] };
    };
    const resetFilters = () => {
        const resetValues = getResetFilters();
        filtersRef.current = resetValues;
        setFilters(resetValues);
        setAppliedFilters(resetValues);
        setSearch("");
        setError(""); setDetailError("");
        setRetryCounter((x) => x + 1);
    };
    const filterActionStyle = { height: 32, padding: "0 14px", borderRadius: 7, fontSize: 11, fontWeight: 750, cursor: "pointer", whiteSpace: "nowrap" };
    const panelButton = { border: "1px solid #dbe3ef", background: "#fff", color: COLORS.navy, borderRadius: 7, padding: "5px 9px", fontSize: 10.5, fontWeight: 750, cursor: "pointer" };
    const unitLabel = viewAllUnit === "aed" ? "AED" : "AED Millions";
    const productionOverheadMonths = Array.from(new Set(viewAllRows[0]?.monthColumns || []));
    const viewAllHeaders = viewAll === "monthly-trend"
        ? ["Month", "Material Actual", "Material Target", "Material Variance", "Labour Actual", "Labour Target", "Labour Variance", "MFG EXP ACTUAL", "MFG EXP TARGET", "MFG EXP VARIANCE"]
        : viewAll === "production-overhead-monthly"
            ? [overheadGroupBy === "legal_entity" ? "Legal Entity" : overheadGroupBy === "parent_division" ? "Parent Division" : "Subdivision", ...productionOverheadMonths, "Actual YTD", "Target YTD", "Variance", "Variance %"]
            : viewAll === "category-detail"
                ? ["Legal Entity", "Parent Division", "Subdivision", "Account Code", "Account Name", "Actual PTD", "Target PTD", "Variance PTD", "Actual YTD", "Target YTD", "Variance YTD"]
                : ["Legal Entity", "Parent Division", "Subdivision", "Cost Category", "Actual PTD", "Target PTD", "Variance PTD", "Actual YTD", "Target YTD", "Variance YTD"];

    const viewAllFilteredRows = viewAllRows.filter((r) =>
        [r.category, r.dimension, r.accountCode, r.accountName, r.legalEntity, r.parentDivision, r.subDivision]
            .some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()))
    );
    const viewAllPageCount = Math.max(1, Math.ceil(viewAllFilteredRows.length / viewAllPageSize));
    const safeViewAllPage = Math.min(viewAllPage, viewAllPageCount);
    const pagedViewAllRows = viewAllFilteredRows.slice((safeViewAllPage - 1) * viewAllPageSize, safeViewAllPage * viewAllPageSize);
    // Totals are calculated from every filtered record, not just the current page.
    // Monthly values are already normalized to millions in the production-overhead pivot.
    const productionOverheadTotalRow = viewAll === "production-overhead-monthly" ? {
        months: productionOverheadMonths.map((month) => {
            const values = viewAllFilteredRows
                .map((row) => numberOrNull(row[`month__${month}`]))
                .filter((value) => value != null);
            return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
        }),
        actual: (() => {
            const values = viewAllFilteredRows.map((row) => numberOrNull(row.actualPtd)).filter((value) => value != null);
            return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
        })(),
        target: (() => {
            const values = viewAllFilteredRows.map((row) => numberOrNull(row.targetPtd)).filter((value) => value != null);
            return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
        })(),
        variance: (() => {
            const values = viewAllFilteredRows.map((row) => numberOrNull(row.variancePtd)).filter((value) => value != null);
            return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
        })(),
    } : null;
    const productionOverheadTotalVariancePct = productionOverheadTotalRow?.variance != null &&
        productionOverheadTotalRow?.target != null && productionOverheadTotalRow.target !== 0
        ? productionOverheadTotalRow.variance / Math.abs(productionOverheadTotalRow.target) * 100
        : null;
    // Monthly Cost Trend totals are calculated from the full filtered dataset,
    // never from the current page. Each displayed measure gets its own total.
    const monthlyTrendTotalRow = viewAll === "monthly-trend" ? [
        "Total",
        ...["actualPtd", "targetPtd", "variancePtd", "actualYtd", "targetYtd", "varianceYtd", "overheadActual", "overheadTarget", "overheadVariance"].map((key) => {
            const values = viewAllFilteredRows.map((row) => numberOrNull(row[key])).filter((value) => value != null);
            return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
        }),
    ] : null;

    return <div className="manufacturing-dashboard" style={{ minHeight: "100vh", background: COLORS.page, padding: "20px 0 32px", color: COLORS.navy, fontFamily: "Inter, Segoe UI, Arial, sans-serif", boxSizing: "border-box" }}>
        <style>{`
      .manufacturing-dashboard, .manufacturing-dashboard * { box-sizing: border-box; }
      .manufacturing-dashboard { color:#0f172a; font-family:Inter, Segoe UI, Arial, sans-serif; }
      .manufacturing-dashboard button, .manufacturing-dashboard select, .manufacturing-dashboard input { font-family:inherit; }
      @keyframes shimmer { 0% {background-position: 200% 0} 100% {background-position: -200% 0} }
      .manufacturing-dashboard .mfg-skeleton { background:linear-gradient(100deg,#edf2f8 20%,#f8fafc 38%,#edf2f8 56%); background-size:220% 100%; animation:shimmer 1.25s ease-in-out infinite; border-radius:9px; }
      @keyframes enterUp { from { opacity:0; transform:translateY(8px) } to {opacity:1;transform:translateY(0)} }
      .manufacturing-dashboard .mfg-select:focus { border-color:#a5b4fc !important; box-shadow:0 0 0 2px #e0e7ff !important; }
      .manufacturing-dashboard .mfg-row { transition:background .12s ease; }
      .manufacturing-dashboard .mfg-row:hover { background:#f8fafc !important; }
      .manufacturing-dashboard .mfg-action { transition:all .15s ease; }
      .manufacturing-dashboard .mfg-action:hover { transform:translateY(-1px); box-shadow:0 4px 10px #0f172a12; }
      .manufacturing-dashboard .mfg-filter-grid { background:#fff !important; padding:10px 12px !important; gap:7px !important; box-shadow:0 2px 8px rgba(15,23,42,.035); overflow:visible !important; position:relative; z-index:8; }
      .manufacturing-dashboard .mfg-multiselect-field:has([aria-expanded="true"]) { z-index:150 !important; }
      .manufacturing-dashboard .mfg-filter-grid:has([aria-expanded="true"]) { z-index:100 !important; }
      .manufacturing-dashboard .mfg-multiselect-field { overflow:visible !important; }
      .manufacturing-dashboard .mfg-filter-grid { overflow:visible !important; }
      .manufacturing-dashboard .mfg-menu-container { z-index:30; }
      .manufacturing-dashboard .mfg-kpi-grid { grid-template-columns:repeat(5,minmax(0,1fr)) !important; }
      .manufacturing-dashboard .mfg-filter-field > span:first-child { color:#0b2d67 !important; }
      .manufacturing-dashboard .mfg-filter-actions { min-width:max-content; }
      .manufacturing-dashboard .mfg-panel { transition:transform .22s ease, box-shadow .22s ease, border-color .22s ease; animation:mfgPanelIn .42s ease both; }
      .manufacturing-dashboard .mfg-panel:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(15,23,42,.075) !important; border-color:#d8d5ff !important; }
      .manufacturing-dashboard .mfg-select { transition:border-color .18s ease, box-shadow .18s ease, background .18s ease; }
      .manufacturing-dashboard .mfg-select:hover { border-color:#a5b4fc !important; }
      .manufacturing-dashboard .mfg-select:focus { border-color:#5B3FE4 !important; box-shadow:0 0 0 3px rgba(91,63,228,.12) !important; }
      .manufacturing-dashboard .mfg-row { transition:background .16s ease, transform .16s ease; }
      .manufacturing-dashboard .mfg-row:hover { background:#f0f5ff !important; }
      .manufacturing-dashboard .mfg-mix-row[data-tooltip] { position:relative; }
      .manufacturing-dashboard .mfg-mix-row[data-tooltip]:hover::after { content:attr(data-tooltip); position:absolute; left:8px; bottom:calc(100% + 7px); z-index:60; max-width:min(340px,80vw); white-space:normal; background:linear-gradient(135deg,#111827,#273449); color:#fff; border:1px solid #64748b55; border-radius:9px; padding:9px 11px; font-size:10.5px; font-weight:650; line-height:1.45; box-shadow:0 12px 28px rgba(15,23,42,.24); pointer-events:none; animation:mfgTipIn .14s ease both; }
      @keyframes mfgTipIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
      @keyframes mfgPanelIn { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:translateY(0); } }
      .manufacturing-dashboard .mfg-panel { box-shadow:0 2px 8px rgba(15,23,42,.035) !important; }
      .manufacturing-dashboard .mfg-chart-panel { transition: transform .24s ease, box-shadow .24s ease, border-color .24s ease; }
      .manufacturing-dashboard .mfg-chart-panel:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(91,63,228,.10) !important; border-color: #c7d2fe !important; }
      .manufacturing-dashboard .mfg-chart-canvas { animation: enterUp .48s ease both; }
      .manufacturing-dashboard .mfg-kpi-grid { gap:8px !important; }
      .manufacturing-dashboard table { font-variant-numeric:tabular-nums; }
      .manufacturing-dashboard th { font-size:.66rem !important; font-weight:700 !important; letter-spacing:.025em; color:#64748b !important; background:#f8fafc !important; }
      .manufacturing-dashboard td { font-size:.72rem; }
      /* Layout: trend and cost mix share the first row; grouped overhead and drill-down each get a full-width row. */
      .manufacturing-dashboard .mfg-dashboard-panel-grid { grid-template-areas: "trend mix" "directcost directcost" "overhead overhead" "drilldown drilldown" !important; }
      .manufacturing-dashboard .mfg-dashboard-panel-grid > .mfg-panel-column { display: contents !important; }
      .manufacturing-dashboard .mfg-dashboard-panel-grid .mfg-trend-panel { grid-area: trend; min-width: 0; }
      .manufacturing-dashboard .mfg-dashboard-panel-grid .mfg-costmix-panel { grid-area: mix; min-width: 0; }
      .manufacturing-dashboard .mfg-dashboard-panel-grid .mfg-direct-cost-panel { grid-area: directcost; min-width: 0; }
      .manufacturing-dashboard .mfg-dashboard-panel-grid .mfg-overhead-panel { grid-area: overhead; min-width: 0; }
      .manufacturing-dashboard .mfg-dashboard-panel-grid .mfg-drilldown-panel { grid-area: drilldown; min-width: 0; }
      @media (max-width: 1000px) { .manufacturing-dashboard .mfg-dashboard-panel-grid { grid-template-columns:minmax(0,1fr) !important; grid-template-areas: "trend" "mix" "directcost" "overhead" "drilldown" !important; } }
      .manufacturing-dashboard .mfg-modal-table-wrap { scrollbar-width:thin; scrollbar-color:#94a3b8 #f1f5f9; }
      .manufacturing-dashboard .mfg-modal-table-wrap::-webkit-scrollbar { width:8px; height:8px; }
      .manufacturing-dashboard .mfg-modal-table-wrap::-webkit-scrollbar-thumb { background:#94a3b8; border-radius:8px; border:2px solid #f1f5f9; }
      .manufacturing-dashboard .mfg-modal-table { margin-bottom:0 !important; }
      .manufacturing-dashboard .mfg-modal-table tfoot { position:sticky !important; bottom:0 !important; z-index:6 !important; }
      .manufacturing-dashboard .mfg-modal-table tfoot td { position:sticky !important; bottom:0 !important; }
      .manufacturing-dashboard .mfg-modal-table tfoot td:first-child { left:0 !important; z-index:8 !important; }
      /* Reference-matched Direct Cost Drill-Down table typography and hierarchy. */
      .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table {
        width:100% !important;
        border-collapse:collapse !important;
        table-layout:fixed !important;
        font-size:12px !important;
        color:#334155 !important;
        font-variant-numeric:tabular-nums !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table thead th {
        padding:9px 10px !important;
        background:#f8fafc !important;
        color:#234675 !important;
        font-size:11px !important;
        font-weight:800 !important;
        letter-spacing:.025em !important;
        text-transform:uppercase !important;
        border-right:1px solid #e4e9ef !important;
        border-bottom:2px solid #dbe3ef !important;
        white-space:nowrap !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table tbody > tr:not(:has(.mfg-direct-cost-detail-table)) > td {
        padding:9px 10px !important;
        font-size:11.5px !important;
        font-weight:650 !important;
        border-bottom:1px solid #edf0f4 !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table tbody > tr > td:nth-child(2) {
        font-size:11.5px !important;
        font-weight:800 !important;
        color:#344054 !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table tbody > tr:hover > td {
        background:#f8fbff !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table .mfg-direct-cost-detail-table thead th,
      .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-detail-table thead th {
        padding:8px 10px !important;
        background:#f8fafc !important;
        font-size:10.5px !important;
        font-weight:800 !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-detail-table tbody td {
        padding:8px 10px !important;
        font-size:11px !important;
        line-height:1.35 !important;
        border-top:1px solid #edf0f4 !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table tbody tr:last-child td {
        border-bottom:1px solid #e2e8f0 !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel .mfg-direct-cost-table tbody tr:has(td[colspan="8"]) td {
        padding:0 !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel .cost-structure-table th { background:#f1f5f9 !important; color:#0B2E6F !important; font-weight:800 !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel .cost-structure-table td { font-variant-numeric:tabular-nums; }
      /* Match the OPEX Month-on-Month table header across every Manufacturing View All table. */
      .manufacturing-dashboard .mfg-modal-table thead th {
        background:#f1f5f9 !important;
        color:#0B2E6F !important;
        text-transform:uppercase !important;
        font-weight:800 !important;
        font-size:.68rem !important;
        letter-spacing:.025em !important;
        border-bottom:2px solid #dbe3ef !important;
      }
      /* Match the OPEX header treatment on the main Manufacturing Cost Drill-Down table. */
      .manufacturing-dashboard .mfg-drilldown-panel table thead th {
        background:#f1f5f9 !important;
        color:#0B2E6F !important;
        text-transform:uppercase !important;
        font-weight:800 !important;
        font-size:.68rem !important;
        letter-spacing:.025em !important;
        border-bottom:2px solid #dbe3ef !important;
      }
      /* OPEX-style Cost Category table: compact uppercase labels, disclosure arrows,
         alternating rows and a softly highlighted total row. */
      .manufacturing-dashboard .mfg-drilldown-panel tbody tr.mfg-row:hover td { background:#eef3ff !important; }
      .manufacturing-dashboard .mfg-drilldown-panel tbody tr.mfg-row td:first-child { color:#172554 !important; }
      .manufacturing-dashboard .mfg-drilldown-panel tfoot td { background:#f1efff !important; font-weight:800 !important; }
      .manufacturing-dashboard .mfg-modal-table .mfg-sticky-first-col {
        position:sticky !important;
        left:0 !important;
        background:#fff !important;
        z-index:2 !important;
        box-shadow:2px 0 0 rgba(226,232,240,.95);
      }
      .manufacturing-dashboard .mfg-modal-table thead .mfg-sticky-first-col {
        background:#f1f5f9 !important;
        color:#0B2E6F !important;
        z-index:7 !important;
      }
      .manufacturing-dashboard .mfg-modal-table tbody tr:nth-child(even) .mfg-sticky-first-col { background:#f8fafc !important; }
      .manufacturing-dashboard .mfg-modal-table tbody tr:nth-child(odd) .mfg-sticky-first-col { background:#fff !important; }
      @media (max-width: 1150px) { .manufacturing-dashboard .mfg-overhead-controls { flex-wrap: wrap !important; } }
      @media (max-width: 1000px) { .manufacturing-dashboard .mfg-filter-grid { grid-template-columns:repeat(3,minmax(0,1fr)) !important; } .manufacturing-dashboard .mfg-filter-actions { grid-column:1 / -1; justify-content:flex-end; } .manufacturing-dashboard .mfg-content-grid { grid-template-columns:1fr !important; } .manufacturing-dashboard .mfg-kpi-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; } }
      @media (max-width: 600px) { .manufacturing-dashboard .mfg-filter-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; } .manufacturing-dashboard .mfg-kpi-grid { grid-template-columns:1fr !important; } .manufacturing-dashboard .mfg-header { align-items:flex-start !important; flex-direction:column !important; } }
      /* Sales Revenue visual-parity pass: typography, spacing, panels and tables.
         Styling-only overrides; no API, filter, RBAC, export or popup handlers changed. */
      .manufacturing-dashboard {
        color:#0B2E6F !important;
        font-family:Inter, "Segoe UI", Arial, sans-serif !important;
        font-size:12px !important;
      }
      .manufacturing-dashboard .mfg-header h1 {
        color:#0B2E6F !important;
        font-size:1.22rem !important;
        line-height:1.3 !important;
        letter-spacing:-.02em !important;
        font-weight:800 !important;
      }
      .manufacturing-dashboard .mfg-header > div:first-child > div {
        font-size:.72rem !important;
        line-height:1.45 !important;
      }
      .manufacturing-dashboard .mfg-filter-grid {
        border:1px solid #e2e8f0 !important;
        border-radius:12px !important;
        padding:10px 12px !important;
        margin-bottom:12px !important;
        gap:8px !important;
        box-shadow:0 2px 6px rgba(15,23,42,.035) !important;
      }
      .manufacturing-dashboard .mfg-filter-field > span:first-child {
        color:#0B2E6F !important;
        font-size:.68rem !important;
        font-weight:750 !important;
        margin-bottom:4px !important;
      }
      .manufacturing-dashboard .mfg-select {
        min-height:34px !important;
        height:34px;
        border-radius:7px !important;
        border-color:#dbe3ef !important;
        font-family:inherit !important;
        font-size:.72rem !important;
        color:#334155 !important;
        min-width:0 !important;
      }
      .manufacturing-dashboard .mfg-multiselect-trigger {
        height:auto !important;
        min-height:38px !important;
        max-height:none !important;
        box-sizing:border-box !important;
        white-space:normal !important;
        overflow:visible !important;
        text-overflow:clip !important;
        line-height:1.25 !important;
        overflow-wrap:anywhere !important;
      }
      .manufacturing-dashboard .mfg-filter-grid > *,
      .manufacturing-dashboard .mfg-filter-grid .mfg-filter-field,
      .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field { min-width:0 !important; }
      .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-trigger > span:first-child { max-width:100%; }
      .manufacturing-dashboard .mfg-filter-grid .mfg-filter-actions { align-self:end; }
      /* Keep filter controls inside both dashboard and View All panels at all widths. */
      .manufacturing-dashboard .mfg-filter-grid { grid-template-columns:repeat(auto-fit,minmax(min(100%,145px),1fr)) !important; overflow:visible !important; align-items:end !important; }
      .manufacturing-dashboard .mfg-filter-grid .mfg-filter-actions { min-width:0 !important; flex-wrap:wrap !important; white-space:nowrap !important; }
      .manufacturing-dashboard .mfg-multiselect-field { min-width:0 !important; max-width:100% !important; }
      .manufacturing-dashboard .mfg-multiselect-trigger { box-sizing:border-box !important; width:100% !important; max-width:100% !important; overflow-wrap:anywhere !important; word-break:break-word !important; }
      .manufacturing-dashboard .mfg-multiselect-trigger > span:first-child { display:block !important; max-width:100% !important; white-space:normal !important; overflow-wrap:anywhere !important; word-break:break-word !important; }
      /* Selected labels grow vertically so the active filter value is never clipped. */
      .manufacturing-dashboard button.mfg-multiselect-trigger {
        display:flex !important;
        align-items:center !important;
        min-height:38px !important;
        height:auto !important;
        max-height:none !important;
        box-sizing:border-box !important;
        padding:7px 30px 7px 9px !important;
        line-height:1.25 !important;
        white-space:normal !important;
        overflow:visible !important;
        text-overflow:clip !important;
        overflow-wrap:anywhere !important;
      }
      .manufacturing-dashboard button.mfg-multiselect-trigger > span:first-child {
        flex:1 1 auto !important;
        min-width:0 !important;
        max-width:100% !important;
        white-space:normal !important;
        overflow:visible !important;
        text-overflow:clip !important;
        overflow-wrap:anywhere !important;
        word-break:break-word !important;
        padding-right:2px !important;
      }
      .manufacturing-dashboard .mfg-filter-grid { align-items:stretch !important; }
      .manufacturing-dashboard .mfg-filter-field { align-self:stretch !important; }
      .manufacturing-dashboard .mfg-filter-actions { align-self:end !important; }
      .manufacturing-dashboard .mfg-multiselect-field { z-index:1; }
      .manufacturing-dashboard .mfg-multiselect-field:has(button[aria-expanded="true"]) { z-index:150 !important; }
      .manufacturing-dashboard .mfg-direct-cost-table thead th {
        background:#f1f5f9 !important;
        color:#173b68 !important;
        font-size:11px !important;
        font-weight:800 !important;
        text-transform:uppercase !important;
        letter-spacing:.02em !important;
        border-bottom:2px solid #dbe3ef !important;
        padding:9px 8px !important;
        white-space:nowrap !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr:nth-child(even) { background:#f8fafc !important; }
      .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr:hover > td { background:#eef3ff !important; }
      .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr > td { border-bottom:1px solid #edf0f4 !important; }
      .manufacturing-dashboard .mfg-direct-cost-detail-table thead th { background:#fff !important; color:#173b68 !important; }
      .manufacturing-dashboard .mfg-direct-cost-detail-table tbody tr.mfg-direct-cost-detail-row td {
        background:inherit !important;
        color:#475569 !important;
        font-size:11px !important;
        font-weight:500 !important;
        border-bottom:1px solid #edf0f4 !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-detail-table tbody tr.mfg-direct-cost-detail-row:nth-child(even) td { background:#f8fafc !important; }
      .manufacturing-dashboard .mfg-direct-cost-detail-table tbody tr.mfg-direct-cost-detail-row:hover td { background:#eef3ff !important; }
      .manufacturing-dashboard .mfg-panel {
        border:1px solid #e2e8f0 !important;
        border-radius:12px !important;
        padding:12px 14px !important;
        box-shadow:0 2px 6px rgba(15,23,42,.035) !important;
        background:#fff !important;
      }
      .manufacturing-dashboard .mfg-panel > div:first-child {
        margin-bottom:10px !important;
        gap:12px !important;
      }
      .manufacturing-dashboard .mfg-panel > div:first-child > div > div:first-child {
        color:#0B2E6F !important;
        font-size:.84rem !important;
        line-height:1.3 !important;
        font-weight:800 !important;
        letter-spacing:-.01em !important;
      }
      .manufacturing-dashboard .mfg-panel > div:first-child > div > div:nth-child(2) {
        color:#64748b !important;
        font-size:.70rem !important;
        line-height:1.4 !important;
        margin-top:3px !important;
      }
      .manufacturing-dashboard .mfg-kpi-grid {
        gap:8px !important;
      }
      .manufacturing-dashboard .mfg-kpi-grid > div {
        border-radius:12px !important;
        box-shadow:0 1px 4px rgba(15,23,42,.035) !important;
      }
      .manufacturing-dashboard table {
        font-family:Inter, "Segoe UI", Arial, sans-serif !important;
        font-variant-numeric:tabular-nums !important;
      }
      .manufacturing-dashboard th,
      .manufacturing-dashboard .mfg-modal-table thead th,
      .manufacturing-dashboard .mfg-drilldown-panel table thead th {
        color:#0B2E6F !important;
        background:#f1f5f9 !important;
        text-transform:uppercase !important;
        font-size:.68rem !important;
        font-weight:800 !important;
        letter-spacing:.025em !important;
        line-height:1.3 !important;
        border-bottom:2px solid #dbe3ef !important;
        padding:10px 9px !important;
      }
      .manufacturing-dashboard td {
        color:#334155;
        font-size:.74rem !important;
        line-height:1.4 !important;
      }
      .manufacturing-dashboard .mfg-drilldown-panel tbody td {
        padding:10px 9px !important;
      }
      .manufacturing-dashboard .mfg-drilldown-panel tbody td:first-child,
      .manufacturing-dashboard .mfg-drilldown-panel tbody td:first-child button {
        color:#0B2E6F !important;
        font-size:.74rem !important;
        font-weight:700 !important;
        line-height:1.4 !important;
      }
      .manufacturing-dashboard .mfg-drilldown-panel tbody tr:nth-child(even) td {
        background:#f8fafc !important;
      }
      .manufacturing-dashboard .mfg-drilldown-panel tbody tr:nth-child(odd) td {
        background:#fff !important;
      }
      .manufacturing-dashboard .mfg-drilldown-panel tbody tr.mfg-row:hover td {
        background:#eef3ff !important;
      }
      .manufacturing-dashboard .mfg-drilldown-panel tfoot td {
        background:#f1f5f9 !important;
        color:#0B2E6F !important;
        font-weight:800 !important;
        border-top:1px solid #dbe3ef !important;
      }
      .manufacturing-dashboard .mfg-modal-table tbody td {
        padding:9px 10px !important;
        font-size:.73rem !important;
        line-height:1.4 !important;
      }
      .manufacturing-dashboard .mfg-action,
      .manufacturing-dashboard .mfg-filter-actions button {
        font-family:inherit !important;
        font-size:.70rem !important;
        font-weight:750 !important;
        border-radius:7px !important;
      }
      .manufacturing-dashboard .mfg-chart-panel .recharts-cartesian-axis-tick text {
        font-family:Inter, "Segoe UI", Arial, sans-serif !important;
        font-size:10px !important;
        fill:#64748b !important;
      }
      .manufacturing-dashboard .mfg-chart-panel .recharts-cartesian-grid line {
        stroke:#e2e8f0 !important;
      }
      @media (max-width:1000px) {
        .manufacturing-dashboard .mfg-filter-grid { gap:8px !important; }
        .manufacturing-dashboard .mfg-panel { padding:11px !important; }
      }

      /* FINAL FIX: match the supplied P&L Direct Cost Drill-Down reference.
         Scope the category table and nested account table independently so global
         dashboard table rules cannot bold or recolor the detail rows. */
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) {
        width:100% !important; table-layout:fixed !important; border-collapse:collapse !important;
        color:#334155 !important; font-family:Inter, "Segoe UI", Arial, sans-serif !important;
        font-size:11.5px !important; font-variant-numeric:tabular-nums !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > thead > tr > th {
        padding:9px 10px !important; background:#f1f5f9 !important; color:#234675 !important;
        font-size:11px !important; font-weight:800 !important; text-transform:uppercase !important;
        letter-spacing:.025em !important; border-right:1px solid #e4e9ef !important;
        border-bottom:2px solid #dbe3ef !important; white-space:nowrap !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr > td {
        padding:10px 9px !important; font-size:11.5px !important; line-height:1.35 !important;
        font-weight:500 !important; border-right:1px solid #edf0f4 !important;
        border-bottom:1px solid #e8edf4 !important; vertical-align:middle !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr > td:nth-child(2) {
        color:#344054 !important; font-weight:800 !important; text-transform:uppercase !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr:hover > td { background:#eef3ff !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table {
        width:100% !important; table-layout:fixed !important; border-collapse:collapse !important;
        margin:0 !important; font-family:Inter, "Segoe UI", Arial, sans-serif !important;
        font-size:11px !important; font-variant-numeric:tabular-nums !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > thead > tr > th {
        padding:8px 10px !important; background:#f1f5f9 !important; color:#234675 !important;
        font-size:10.5px !important; font-weight:800 !important; text-transform:uppercase !important;
        letter-spacing:.02em !important; line-height:1.25 !important; border-right:1px solid #e4e9ef !important;
        border-bottom:2px solid #dbe3ef !important; white-space:nowrap !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td {
        padding:10px 10px !important; background:#fff !important;
        font-size:11px !important; font-weight:500 !important; line-height:1.35 !important;
        border-right:1px solid #edf0f4 !important; border-bottom:1px solid #edf0f4 !important;
        vertical-align:middle !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr:nth-child(even) > td { background:#f8fafc !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr:hover > td { background:#eef3ff !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td:nth-child(2),
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td:nth-child(3) {
        color:#475569 !important; font-weight:500 !important; text-align:left !important; white-space:normal !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td:nth-child(n+4) {
        text-align:right !important; white-space:nowrap !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td:nth-child(6),
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr > td:nth-child(9) { font-weight:800 !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr:last-child > td {
        background:#f1f5f9 !important; font-weight:850 !important;
        border-top:1px solid #cbd5e1 !important; border-bottom:1px solid #dbe3ef !important;
      }
      /* Keep filter triggers stable while showing up to two lines of a selected value. */
      .manufacturing-dashboard .mfg-filter-grid { align-items:end !important; }
      .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field { min-height:58px !important; }
      .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field > span:first-child { height:14px !important; line-height:14px !important; overflow:hidden !important; }
      .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-trigger > span:first-child { max-height:29px !important; }
      .manufacturing-dashboard .mfg-filter-grid .mfg-filter-actions { align-self:end !important; }
      @media print { body { background:#fff !important; } .manufacturing-dashboard .no-print { display:none !important; } .manufacturing-dashboard .print-panel { break-inside:avoid; box-shadow:none !important; } }

      /* Final filter alignment: content-sized selected labels and a viewport-level dropdown. */
      .manufacturing-dashboard .mfg-filter-grid,
      .manufacturing-dashboard .mfg-filter-grid .mfg-filter-field,
      .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field { min-width:0 !important; overflow:visible !important; }
      .manufacturing-dashboard .mfg-filter-grid { position:relative !important; z-index:20 !important; }
      .manufacturing-dashboard button.mfg-multiselect-trigger {
        width:100% !important; height:auto !important; min-height:38px !important; max-height:none !important;
        display:flex !important; align-items:center !important; box-sizing:border-box !important;
        overflow:visible !important; white-space:normal !important; text-overflow:clip !important;
        padding:7px 28px 7px 9px !important; line-height:1.25 !important; overflow-wrap:anywhere !important;
      }
      .manufacturing-dashboard button.mfg-multiselect-trigger > span:first-child {
        display:block !important; flex:1 1 auto !important; min-width:0 !important; max-width:100% !important;
        overflow:visible !important; white-space:normal !important; text-overflow:clip !important;
        overflow-wrap:anywhere !important; word-break:break-word !important;
        line-height:1.25 !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-panel { overflow:visible !important; }
      .manufacturing-dashboard .mfg-direct-cost-table { width:100% !important; border-collapse:collapse !important; table-layout:fixed !important; color:#334155 !important; font-family:Inter, "Segoe UI", Arial, sans-serif !important; font-variant-numeric:tabular-nums !important; }
      .manufacturing-dashboard .mfg-direct-cost-table > thead > tr > th {
        height:36px !important; padding:9px 8px !important; background:#f1f5f9 !important; color:#173b68 !important;
        font-size:11px !important; font-weight:800 !important; text-transform:uppercase !important; letter-spacing:.02em !important;
        line-height:1.25 !important; border-right:1px solid #e4e9ef !important; border-bottom:2px solid #dbe3ef !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr:not(.mfg-direct-cost-detail-row) > td {
        padding:10px 9px !important; min-height:40px !important; font-size:11px !important; line-height:1.35 !important;
        font-weight:750 !important; border-right:1px solid #edf0f4 !important; border-bottom:1px solid #edf0f4 !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr:not(.mfg-direct-cost-detail-row):hover > td { background:#eef3ff !important; }
      .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row > td {
        padding:10px 9px !important; font-size:11px !important; line-height:1.35 !important; font-weight:500 !important;
        color:#475569 !important; border-right:1px solid #edf0f4 !important; border-bottom:1px solid #edf0f4 !important;
        vertical-align:middle !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row:nth-child(odd) > td { background:#fff !important; }
      .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row:nth-child(even) > td { background:#f8fafc !important; }
      .manufacturing-dashboard .mfg-direct-cost-detail-table > thead > tr > th {
        height:35px !important; padding:8px 9px !important; background:#fff !important; color:#173b68 !important;
        font-size:11px !important; font-weight:800 !important; text-transform:uppercase !important;
        border-bottom:2px solid #dbe3ef !important; border-right:1px solid #e4e9ef !important;
      }
      .manufacturing-dashboard .mfg-direct-cost-detail-table { margin:0 !important; background:#fff !important; }
      .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row > td:nth-child(2),
      .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row > td:nth-child(3) { text-align:left !important; }
      .manufacturing-dashboard .mfg-direct-cost-table .mfg-direct-cost-detail-row > td:nth-child(n+4) { text-align:right !important; white-space:nowrap !important; }
      .manufacturing-dashboard .mfg-direct-cost-table > tbody > tr:last-child:not(.mfg-direct-cost-detail-row) > td { background:#f1f5f9 !important; color:#182338 !important; font-weight:850 !important; border-top:1px solid #dbe3ef !important; }

      /* Last-in-cascade corrections for the supplied reference screenshot. */
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr > td { font-size:11.5px !important; line-height:1.35 !important; font-weight:500 !important; border-bottom:1px solid #e8edf4 !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr > td:nth-child(2) { font-weight:800 !important; text-transform:uppercase !important; color:#344054 !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > thead > tr > th { padding:8px 10px !important; background:#f1f5f9 !important; color:#234675 !important; font-size:10.5px !important; font-weight:800 !important; text-transform:uppercase !important; border-bottom:2px solid #dbe3ef !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row > td { padding:10px 10px !important; font-size:11px !important; line-height:1.35 !important; font-weight:500 !important; border-bottom:1px solid #edf0f4 !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row:nth-child(odd) > td { background:#fff !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row:nth-child(even) > td { background:#f8fafc !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row > td:nth-child(2),
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row > td:nth-child(3) { text-align:left !important; font-weight:500 !important; white-space:normal !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-detail-table > tbody > tr.mfg-direct-cost-detail-row > td:nth-child(n+4) { text-align:right !important; white-space:nowrap !important; font-weight:500 !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel table.mfg-direct-cost-table:not(.mfg-direct-cost-detail-table) > tbody > tr:last-child > td { background:#f1f5f9 !important; font-weight:850 !important; border-top:1px solid #cbd5e1 !important; }
      .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field { min-height:58px !important; }
      .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field > span:first-child { height:14px !important; line-height:14px !important; }
      .manufacturing-dashboard button.mfg-multiselect-trigger { height:auto !important; min-height:38px !important; max-height:none !important; align-items:center !important; white-space:normal !important; overflow:visible !important; }
      .manufacturing-dashboard button.mfg-multiselect-trigger > span:first-child { display:block !important; white-space:normal !important; overflow:visible !important; text-overflow:clip !important; overflow-wrap:anywhere !important; word-break:break-word !important; max-height:none !important; }
      /* Variance styling must beat legacy detail-table !important declarations. */
      .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-positive,
      .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-positive * { color:#15803d !important; font-weight:800 !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-negative,
      .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-negative * { color:#dc2626 !important; font-weight:800 !important; }
      .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-neutral,
      .manufacturing-dashboard .mfg-direct-cost-panel td.mfg-variance-cell.mfg-variance-neutral * { color:#64748b !important; font-weight:800 !important; }
      /* Stable OPEX-style filter triggers: selected labels stay inside the control. */
      .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field { min-width:0 !important; width:100% !important; }
      .manufacturing-dashboard button.mfg-multiselect-trigger {
        display:flex !important; width:100% !important; min-width:0 !important;
        height:38px !important; min-height:38px !important; max-height:38px !important;
        overflow:hidden !important; white-space:nowrap !important; align-items:center !important;
        flex-wrap:nowrap !important; position:relative !important;
      }
      .manufacturing-dashboard button.mfg-multiselect-trigger > span:first-child {
        display:block !important; flex:1 1 auto !important; min-width:0 !important; max-width:100% !important;
        height:auto !important; max-height:100% !important; line-height:18px !important;
        white-space:nowrap !important; overflow:hidden !important; text-overflow:ellipsis !important;
        overflow-wrap:normal !important; word-break:normal !important;
      }
      .manufacturing-dashboard .mfg-filter-grid { align-items:start !important; }
      .manufacturing-dashboard .mfg-filter-grid .mfg-multiselect-field > span:first-child { height:14px !important; line-height:14px !important; }

    `}</style>

        <header className="mfg-header print-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, background: "transparent", border: 0, borderRadius: 12, padding: "0 0 12px", marginBottom: 12, boxShadow: "none" }}>
            <div style={{ minWidth: 0 }}>
                <h1 style={{ margin: 0, fontSize: "1.45rem", letterSpacing: "-.02em", lineHeight: 1.25, fontWeight: 800, color: COLORS.navy }}>🏭 Manufacturing Cost &amp; Production Performance</h1>
                <div style={{ marginTop: 3, fontSize: "0.78rem", color: COLORS.muted }}>Monitor material cost, production overhead, and overhead absorption performance.</div>
                <div style={{ marginTop: 4, fontSize: "0.72rem", color: "#64748b", fontWeight: 800 }}>
                    <span style={{ color: "#16a34a" }}>
                        Currency: {appliedFilters.currency || "AED"}
                    </span>
                    {" | "} Period:
                    {appliedFilters.period}
                </div>
            </div>
            <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <ExportButtons onExcel={exportExcel} onPdf={exportPdf} />

            </div>
        </header>

        <section className="mfg-filter-grid print-panel" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr)) auto", gap: 7, padding: "10px 12px", marginBottom: 14, borderRadius: 12, border: `1px solid ${COLORS.border}`, background: "#fff" }}>
            <MultiSelectFilter label="Legal Group" value={filters.legalGroup} onChange={v => update("legalGroup", v)} options={legalGroups} />
            <MultiSelectFilter label="Legal Entity" value={filters.legalEntity} onChange={v => update("legalEntity", v)} options={legalEntities} />
            <MultiSelectFilter label="Parent Division" value={filters.parent} onChange={v => update("parent", v)} options={parentDivisions} />
            <MultiSelectFilter label="Sub-Division" value={filters.sub} onChange={v => update("sub", v)} options={subdivisions} />
            <Filter label="Year" value={filters.year} onChange={v => update("year", v)} options={[...new Set([filters.year, ...filterOptions.years.map((x) => String(idOf(x)))].filter(Boolean))]} icon="▦" />
            <Filter label="Period" value={filters.period} onChange={v => update("period", v)} options={sortPeriodsChronologically(filterOptions.periods, filters.year)} hidePlaceholder icon="▦" />
            <Filter label="Reporting Currency" value={filters.currency} onChange={v => update("currency", v)} options={["AED", "USD", "EUR", "GBP"]} icon="¤" />
            <div className="mfg-filter-actions" style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 7, paddingBottom: 0 }}>
                <button type="button" aria-label="Apply Manufacturing Cost filters" onClick={() => {
                    // Apply the exact values currently shown in the controls immediately.
                    // Do not block the first click on a second hierarchy-options request.
                    const currentFilters = filtersRef.current || filters;
                    const selected = { ...currentFilters, legalGroup: [...(currentFilters.legalGroup || [])], legalEntity: [...(currentFilters.legalEntity || [])], parent: [...(currentFilters.parent || [])], sub: [...(currentFilters.sub || [])] };
                    setError("");
                    filtersRef.current = selected;
                    setAppliedFilters(selected);
                    setDashboardRefreshKey((x) => x + 1);
                    // Refresh cascade options in the background; this must not delay applying
                    // the user's selected scope or overwrite their current selections.
                    const requestId = ++mainOptionsRequestId.current;
                    getManufacturingFilterOptions(manufacturingFilters(selected)).then((optionsResponse) => {
                        if (requestId !== mainOptionsRequestId.current) return;
                        const scopedOptions = parseManufacturingFilterOptions(optionsResponse);
                        setFilterOptions((old) => ({ ...scopedOptions, years: scopedOptions.years.length ? scopedOptions.years : old.years, periods: scopedOptions.periods.length ? scopedOptions.periods : old.periods }));
                    }).catch((e) => {
                        setError(`Unable to refresh hierarchy filters: ${e?.response?.data?.detail || e?.response?.data?.message || e.message}`);
                    });
                }} className="mfg-action" style={{ ...filterActionStyle, height: 33, border: "1px solid #5B3FE4", background: "#5B3FE4", color: "#fff", padding: "0 13px" }}>Apply</button>
                <button type="button" onClick={resetFilters} className="mfg-action" style={{ ...filterActionStyle, height: 33, border: 0, background: "transparent", color: "#475569", padding: "0 8px" }}>Reset</button>
            </div>
        </section>

        {(error || detailError) && <div role="alert" style={{ marginBottom: 10, padding: "10px 12px", border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", borderRadius: 9, fontSize: 12, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><span>{error || detailError}</span><button onClick={retryDashboard} style={{ border: "1px solid #fca5a5", background: "#fff", borderRadius: 7, padding: "5px 9px", cursor: "pointer" }}>Retry</button></div>}
        {loading && <div aria-label="Loading manufacturing dashboard" style={{ display: "grid", gap: 10, marginBottom: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>{[0, 1].map((row) => <div key={row} style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 9 }}>{Array.from({ length: 5 }, (_, i) => <div key={i} className="mfg-skeleton" style={{ height: 94, border: "1px solid #e2e8f0" }} />)}</div>)}</div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.65fr) minmax(350px,1fr)", gap: 12 }}><div className="mfg-skeleton" style={{ height: 250 }} /><div className="mfg-skeleton" style={{ height: 250 }} /></div>
        </div>}
        {!loading && <section aria-label="Period-to-date manufacturing KPIs" style={{ marginBottom: 9 }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: ".04em", color: "#64748b", margin: "0 0 6px 2px" }}>PERIOD TO DATE (PTD)</div>
            <div className="mfg-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 9, marginBottom: 12 }}>
                {kpis.filter((item) => item.period === "PTD").map((item, i) => <KpiCard key={`${item.period}-${item.label}`} item={item} delay={i * .035} currency={appliedFilters.currency} />)}
            </div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: ".04em", color: "#64748b", margin: "0 0 6px 2px" }}>YEAR TO DATE (YTD)</div>
            <div className="mfg-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 9 }}>
                {kpis.filter((item) => item.period === "YTD").map((item, i) => <KpiCard key={`${item.period}-${item.label}`} item={item} delay={i * .035} currency={appliedFilters.currency} />)}
            </div>
        </section>}

        {!loading && <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 9, padding: "7px 11px", marginBottom: 10, background: "#f8fafc", color: "#64748b", fontSize: 11, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ display: "grid", placeItems: "center", width: 17, height: 17, borderRadius: "50%", background: "#e0e7ff", color: "#3730a3", fontWeight: 900, flexShrink: 0 }}>i</span>
            Production Overhead = Direct Labour + Manufacturing / Direct Overheads. Overhead Absorption % = Absorbed Overhead ÷ Production Overhead × 100. Percentage variances are displayed as percentages (%). Values are sourced from the Manufacturing API; absorption recovery follows the signed P&L control.
        </div>}

        {!loading && <div className="mfg-content-grid mfg-dashboard-panel-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12, alignItems: "stretch" }}>
            <div className="mfg-panel-column" style={{ display: "grid", gap: 10, minWidth: 0 }}>
                <Panel title="Monthly Cost Trend" subtitle="Actual vs Target by cost category" style={{ minHeight: 265 }} className="mfg-chart-panel mfg-trend-panel" action={<div className="mfg-menu-container" style={{ position: "relative" }}><button className="mfg-action" aria-label="Monthly trend options" title="More options" style={{ ...panelButton, width: 32, height: 30, padding: 0, fontSize: 19 }} onClick={() => setTrendMenuOpen(v => !v)}><MoreVertical size={17} strokeWidth={1.8} /></button>{trendMenuOpen && <div style={{ position: "absolute", right: 0, top: 35, zIndex: 50, width: 165, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 9, boxShadow: "0 10px 26px rgba(15,23,42,.16)", overflow: "hidden" }}><button onClick={() => { openViewAll("monthly-trend"); setTrendMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 11, fontWeight: 800, cursor: "pointer", color: "#334155" }}>🔎 View All</button><button onClick={() => { exportReport("excel", "monthly-trend", appliedFilters); setTrendMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>📊 Export Excel</button><button onClick={() => { exportReport("pdf", "monthly-trend", appliedFilters); setTrendMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📄 Export PDF</button></div>}</div>}>

                    <div style={{ display: "flex", justifyContent: "flex-start", gap: 14, flexWrap: "wrap", margin: "0 0 3px 12px", paddingLeft: 4, fontSize: 10.5, color: "#475569" }}>
                        {[["#14b8a6", "Material (Actual)", false], ["#14b8a6", "Material (Target)", true], ["#8b5cf6", "Labour (Actual)", false], ["#8b5cf6", "Labour (Target)", true], ["#f59e0b", "Overheads (Actual)", false], ["#f59e0b", "Overheads (Target)", true]].map(([c, t, target]) => <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i style={{ width: 10, height: 10, background: target ? `${c}20` : c, border: target ? `1px dashed ${c}` : `1px solid ${c}`, borderRadius: 3 }} />{t}</span>)}
                    </div>
                    <motion.div className="mfg-chart-canvas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} style={{ height: 190, marginTop: 12 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 7, right: 5, left: -15, bottom: 0 }} barGap={1} barCategoryGap="26%">
                                <CartesianGrid stroke="#e8eef6" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}M`} />
                                <Tooltip content={<TooltipBox />} />
                                <Bar dataKey="material" name="Material Actual" fill="#14b8a6" radius={[2, 2, 0, 0]} isAnimationActive />
                                <Bar dataKey="materialTarget" name="Material Target" fill="#14b8a6" fillOpacity={0.16} stroke="#14b8a6" strokeDasharray="4 3" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="labour" name="Labour Actual" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="labourTarget" name="Labour Target" fill="#8b5cf6" fillOpacity={0.16} stroke="#8b5cf6" strokeDasharray="4 3" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="overheads" name="Overheads Actual" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="overheadsTarget" name="Overheads Target" fill="#f59e0b" fillOpacity={0.16} stroke="#f59e0b" strokeDasharray="4 3" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </Panel>

                <ManufacturingDirectCostTable filters={appliedFilters} />

                <Panel title="Manufacturing Cost Drill-Down" subtitle="Actual, target and variance by cost category" className="mfg-drilldown-panel" action={<div style={{ display: "flex", alignItems: "center", gap: 7 }}><div role="group" aria-label="Manufacturing drill-down amount unit" style={{ display: "inline-flex", alignItems: "center", padding: 3, gap: 2, border: "1px solid #dbe3ef", borderRadius: 8, background: "#f1f5f9" }}><button type="button" onClick={() => setDrilldownUnit("aed")} aria-pressed={drilldownUnit === "aed"} style={{ border: 0, borderRadius: 6, padding: "5px 9px", background: drilldownUnit === "aed" ? "#0B2E6F" : "transparent", color: drilldownUnit === "aed" ? "#fff" : "#0B2E6F", fontSize: 10.5, fontWeight: 800, cursor: "pointer" }}>AED</button><button type="button" onClick={() => setDrilldownUnit("millions")} aria-pressed={drilldownUnit === "millions"} style={{ border: 0, borderRadius: 6, padding: "5px 9px", background: drilldownUnit === "millions" ? "#0B2E6F" : "transparent", color: drilldownUnit === "millions" ? "#fff" : "#0B2E6F", fontSize: 10.5, fontWeight: 800, cursor: "pointer" }}>AED Million</button></div><button type="button" onClick={() => setDrilldownCollapsed((collapsed) => !collapsed)} style={{ ...panelButton, height: 30, padding: "0 10px", color: "#0B2E6F", borderColor: "#0B2E6F", whiteSpace: "nowrap" }}>{drilldownCollapsed ? "⌄ Expand" : "⌃ Collapse"}</button><div className="mfg-menu-container" style={{ position: "relative" }}><button className="mfg-action" aria-label="Manufacturing drill-down options" title="More options" style={{ ...panelButton, width: 32, height: 30, padding: 0, fontSize: 19, lineHeight: 1 }} onClick={() => setDrillMenuOpen((v) => !v)}><MoreVertical size={17} strokeWidth={1.8} /></button>{drillMenuOpen && <div style={{ position: "absolute", right: 0, top: 35, zIndex: 50, width: 170, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 9, boxShadow: "0 10px 26px rgba(15,23,42,.16)", overflow: "hidden" }}><button onClick={() => { openViewAll("category-breakdown"); setDrillMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#334155" }}>🔎 View All</button><button onClick={() => { exportReport("excel", "category-breakdown"); setDrillMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, borderTop: "1px solid #f1f5f9", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📊 Export Excel</button><button onClick={() => { exportReport("pdf", "category-breakdown"); setDrillMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, borderTop: "1px solid #f1f5f9", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📄 Export PDF</button></div>}</div></div>}>
                    {!drilldownCollapsed && <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12, minWidth: 650 }}>
                            <thead><tr>{["COST CATEGORY", "ACTUAL PTD", "TARGET PTD", "VARIANCE PTD", "ACTUAL YTD", "TARGET YTD", "VARIANCE YTD"].map((h, i) => <th key={h} style={{ textAlign: i === 0 ? "left" : "right", padding: "10px 9px", color: "#1e40af", fontSize: 11, fontWeight: 850, textTransform: "uppercase", letterSpacing: ".025em", lineHeight: 1.25, background: "#ffffff", borderBottom: "2px solid #dbe3ef", whiteSpace: "normal" }}>{h}</th>)}</tr></thead>
                            <tbody>{drillRows.map((r, idx) => <tr className="mfg-row" key={r.category} onClick={() => openViewAll("category-detail", r.category)} title={`Open account details for ${r.category}`} style={{ background: idx % 2 ? "#f8fafc" : "#fff", cursor: "pointer" }}>
                                <td title={`Open account details for ${r.category}`} style={{ padding: "10px 9px", color: "#172554", fontWeight: 700, fontSize: 12, borderBottom: "1px solid #e8edf5", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal", lineHeight: 1.4, maxWidth: 260 }}><button type="button" onClick={(event) => { event.stopPropagation(); openViewAll("category-detail", r.category); }} style={{ display: "inline-flex", alignItems: "flex-start", gap: 7, border: 0, padding: 0, background: "transparent", color: "#172554", font: "inherit", fontWeight: 700, textAlign: "left", cursor: "pointer", whiteSpace: "normal", overflowWrap: "anywhere" }}><span aria-hidden="true" style={{ color: "#000", fontSize: 11, lineHeight: "1.5", flex: "0 0 auto" }}>▶</span><span>{String(r.category || "").toUpperCase()}</span></button></td>
                                {[r.actualPtd, r.targetPtd, r.variancePtd, r.actualYtd, r.targetYtd, r.varianceYtd].map((v, i) => {
                                    const isVariance = i === 2 || i === 5;
                                    const status = i === 2 ? r.varianceStatusPtd : i === 5 ? r.varianceStatusYtd : null;
                                    const absorption = /absorption/i.test(r.category);
                                    const color = isVariance ? (v == null || Number(v) === 0 ? "#64748b" : Number(v) > 0 ? "#15803d" : "#dc2626") : "#334155";
                                    return <td key={i} style={{ textAlign: "right", padding: "10px 9px", borderBottom: "1px solid #e8edf5", whiteSpace: "nowrap", fontWeight: isVariance ? 800 : 500, color: isVariance && (v == null || Number(v) === 0) ? "#64748b" : color }}>{v == null ? "—" : drilldownUnit === "millions" ? `${(Number(v) / 1_000_000).toFixed(2)}M` : fmtNum(v)}</td>;
                                })}
                            </tr>)}</tbody>
                            <tfoot><tr style={{ background: "#f1efff", fontWeight: 900 }}>{["Net Cost of Sales", ...[
                                ["actualPtd", "actual"], ["targetPtd", "target"], ["variancePtd", "variance"],
                                ["actualYtd", "actual"], ["targetYtd", "target"], ["varianceYtd", "variance"]
                            ].map(([key, kind]) => {
                                if (!drillRows.length || !drillRows.every((r) => r[key] != null)) return null;
                                const total = drillRows.reduce((sum, r) => sum + r[key], 0);
                                // Absorption is a recovery and must be deducted from net cost of sales.
                                const absorption = drillRows.filter((r) => /absorption/i.test(r.category));
                                return key.startsWith("variance") ? total : total - absorption.reduce((sum, r) => sum + (numberOrNull(r[key]) || 0), 0);
                            })
                            ].map((v, i) => <td key={i} style={{ padding: "7px 6px", textAlign: i ? "right" : "left", color: i === 0 ? COLORS.navy : (i === 3 || i === 6) ? (v == null || Number(v) === 0 ? "#64748b" : Number(v) > 0 ? "#15803d" : "#dc2626") : COLORS.navy, fontWeight: i === 3 || i === 6 ? 900 : 800, whiteSpace: "nowrap" }}>{i === 0 ? v : v == null ? "—" : drilldownUnit === "millions" ? `${(Number(v) / 1_000_000).toFixed(2)}M` : fmtNum(v)}</td>)}</tr></tfoot>
                        </table>
                    </div>}
                </Panel>
            </div>

            <div className="mfg-panel-column" style={{ display: "grid", gap: 10, minWidth: 0 }}>
                <Panel title="Current PTD Cost Mix" subtitle="Share of current period cost" className="mfg-chart-panel mfg-costmix-panel" style={{ minHeight: 265 }}>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} style={{ display: "grid", gap: 9 }}>
                        {costMix.map((item) => <div key={item.name} data-tooltip={`${item.name} | Amount: ${item.amount == null ? "Unavailable" : `${appliedFilters.currency} ${item.amount.toFixed(2)}M`} | Share: ${item.pct == null ? "Unavailable" : `${item.pct.toFixed(1)}%`}`} style={{ display: "grid", gridTemplateColumns: "minmax(100px,.8fr) minmax(70px,1.7fr) 88px", gap: 8, alignItems: "center", borderRadius: 8, padding: "6px 5px", transition: "background .18s ease, transform .18s ease", position: "relative" }} className="mfg-row mfg-mix-row">
                            <div style={{ color: "#334155", fontSize: 11, lineHeight: 1.2, fontWeight: 750 }}>{item.name}</div>
                            <div style={{ height: 21, background: "#f1f5f9", borderRadius: 5, overflow: "hidden" }}><motion.div initial={{ width: 0 }} animate={{ width: `${item.pct == null ? 0 : Math.max(0, Math.min(item.pct, 100))}%` }} transition={{ duration: .8, delay: .1 }} style={{ height: "100%", borderRadius: 5, background: item.color }} /></div>
                            <div style={{ fontSize: 10.5, lineHeight: 1.25, color: "#475569" }}><b style={{ color: COLORS.navy }}>{item.amount == null ? "—" : `${appliedFilters.currency} ${item.amount.toFixed(2)}M`}</b><br />{item.pct == null ? "—" : `${item.pct.toFixed(1)}%`}</div>
                        </div>)}
                    </motion.div>
                </Panel>



                <Panel title="Month-on-Month Production Overhead" subtitle="Each month compares Actual and Target for each selected group" className="mfg-chart-panel mfg-overhead-panel" action={<div className="mfg-overhead-controls" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap", justifyContent: "flex-end", minWidth: 0 }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "#475569", fontWeight: 750, whiteSpace: "nowrap" }}>
                        View by
                        <select id="manufacturing-overhead-group-by" aria-label="View production overhead by" value={overheadGroupBy} onChange={(e) => { setOverheadGroupBy(e.target.value); setOverheadSelectedDimensions([]); }} style={{ height: 30, maxWidth: 150, border: "1px solid #d7e0f0", borderRadius: 7, background: "#fff", color: "#26364f", padding: "0 8px", fontSize: 10.5, fontWeight: 650 }}>
                            <option value="legal_entity">Legal Entity</option>
                            <option value="parent_division">Parent Division</option>
                            <option value="subdivision">Subdivision</option>
                        </select>
                    </label>
                    <div style={{ minWidth: 180, maxWidth: 250, flex: "0 1 230px" }}>
                        <MultiSelectFilter
                            label={overheadGroupBy === "legal_entity" ? "Legal Entities" : overheadGroupBy === "parent_division" ? "Divisions" : "Subdivisions"}
                            value={overheadSelectedDimensions}
                            onChange={setOverheadSelectedDimensions}
                            options={dimensionNames}
                            allowAll={false}
                        />
                    </div>
                    <div className="mfg-menu-container" style={{ position: "relative" }}><button className="mfg-action" aria-label="Production overhead options" title="More options" style={{ ...panelButton, width: 32, height: 30, padding: 0, fontSize: 19 }} onClick={() => setOverheadMenuOpen(v => !v)}><MoreVertical size={17} strokeWidth={1.8} /></button>{overheadMenuOpen && <div style={{ position: "absolute", right: 0, top: 35, zIndex: 50, width: 165, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 9, boxShadow: "0 10px 26px rgba(15,23,42,.16)", overflow: "hidden" }}><button onClick={() => { openViewAll("production-overhead-monthly"); setOverheadMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#334155" }}>🔎 View All</button><button onClick={() => { exportReport("excel", "production-overhead-monthly", appliedFilters); setOverheadMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📊 Export Excel</button><button onClick={() => { exportReport("pdf", "production-overhead-monthly", appliedFilters); setOverheadMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "9px 11px", textAlign: "left", background: "#fff", border: 0, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>📄 Export PDF</button></div>}</div>
                </div>}>
                    {dimensionOverheadError && <div role="alert" style={{ color: "#b91c1c", fontSize: 11, padding: "4px 0 8px" }}>{dimensionOverheadError}</div>}
                    {dimensionOverheadLoading ? <div style={{ height: 180, display: "grid", placeItems: "center", color: "#64748b", fontSize: 11 }}>Loading grouped production overhead…</div> : !dimensionOverheadChartData.length ? <div style={{ height: 180, display: "grid", placeItems: "center", color: "#64748b", fontSize: 11 }}>No grouped production overhead data for the selected filters.</div> : <motion.div className="mfg-chart-canvas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }} style={{ height: 205 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dimensionOverheadChartData} margin={{ top: 8, right: 8, left: 2, bottom: 2 }} barGap={1} barCategoryGap="16%">
                                <CartesianGrid stroke="#e8eef6" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" interval="preserveStartEnd" minTickGap={16} height={24} tick={{ fontSize: 9, fill: "#475569" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                                <YAxis width={58} label={{ value: `Amount (${appliedFilters.currency || "AED"}, Millions)`, angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#475569", fontSize: 9, fontWeight: 700 } }} tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => `${v.toFixed ? v.toFixed(2) : v}M`} />
                                <Tooltip content={<ProductionOverheadTooltip groupBy={overheadGroupBy} currency={appliedFilters.currency || "AED"} dimensionOrder={dimensionNames} />} cursor={{ fill: "#eef2ff", opacity: 0.45 }} />
                                {visibleDimensionNames.map((dimension) => {
                                    const color = COLORS_BY_CATEGORY[Math.max(0, dimensionNames.indexOf(dimension)) % COLORS_BY_CATEGORY.length];
                                    return <React.Fragment key={dimension}>
                                        <Bar dataKey={`${dimension}__actual`} name={`${dimension} · Actual`} fill={color} maxBarSize={12} radius={[2, 2, 0, 0]} />
                                        <Bar dataKey={`${dimension}__target`} name={`${dimension} · Target`} fill="#ffffff" stroke={color} strokeWidth={1.5} maxBarSize={12} radius={[2, 2, 0, 0]} />
                                    </React.Fragment>;
                                })}
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>}
                    <div aria-label="Production overhead chart legend" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "7px 14px", padding: "8px 2px 5px", marginTop: 2, borderTop: "1px solid #eef2f7" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#334155", fontWeight: 750, whiteSpace: "nowrap" }}><i style={{ width: 11, height: 11, display: "inline-block", borderRadius: 2, background: "#334155" }} /> Actual</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#334155", fontWeight: 750, whiteSpace: "nowrap" }}><i style={{ width: 11, height: 11, display: "inline-block", borderRadius: 2, background: "#fff", border: "1.5px solid #334155" }} /> Target</span>
                        <span style={{ width: 1, height: 16, background: "#dbe3ef" }} />
                        {visibleDimensionNames.map((dimension) => {
                            const color = COLORS_BY_CATEGORY[Math.max(0, dimensionNames.indexOf(dimension)) % COLORS_BY_CATEGORY.length];
                            return <span key={dimension} title={dimension} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#475569", maxWidth: 190, minWidth: 0 }}><i style={{ width: 9, height: 9, display: "inline-block", borderRadius: 99, background: color, flexShrink: 0 }} /><span style={{ overflowWrap: "anywhere", lineHeight: 1.25 }}>{dimension}</span></span>;
                        })}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.4, marginTop: 2 }}>Chart displays {visibleDimensionNames.length} selected {overheadGroupBy === "legal_entity" ? "legal entit(y/ies)" : overheadGroupBy === "parent_division" ? "parent division(s)" : "subdivision(s)"}. View All and Excel/PDF exports include the full filtered scope for the selected grouping, not just the chart selection.</div>
                </Panel>
            </div>
        </div>}

        <AnimatePresence>
            {viewAll && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.42)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", padding: viewAllMaximized ? 0 : 16 }} onMouseDown={e => { if (e.target === e.currentTarget) setViewAll(""); }}>
                <motion.div initial={{ y: 15, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, scale: .98 }} style={{ width: viewAllMaximized ? "100vw" : "min(1400px, 96vw)", height: viewAllMaximized ? "100vh" : "auto", maxHeight: viewAllMaximized ? "100vh" : "92vh", background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: viewAllMaximized ? 0 : 12, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(15,23,42,.18)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${COLORS.border}`, background: "#fff" }}>
                        <div><div style={{ fontSize: "0.95rem", fontWeight: 800, color: COLORS.navy }}>{viewAll === "category-breakdown" ? "Manufacturing Cost Drill-Down — Detailed View" : viewAll === "category-detail" ? `Manufacturing Account Detail${selectedDetailCategory ? ` — ${selectedDetailCategory}` : ""}` : viewAll === "monthly-trend" ? "Monthly Cost Trend- Detailed View" : viewAll === "production-overhead-monthly" ? "Month-on-Month Production Overhead — Detailed View" : viewAll}</div><div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>Current filters · {(Array.isArray(viewAllFilters.legalGroup) ? viewAllFilters.legalGroup : (viewAllFilters.legalGroup ? [viewAllFilters.legalGroup] : [])).map((id) => labelOf(legalGroups.find((x) => String(idOf(x)) === String(id)) || id)).join(", ") || "All Legal Groups"} · {viewAllFilters.period} · Reporting Currency: {viewAllFilters.currency || "AED"}{viewAll === "production-overhead-monthly" ? ` · Grouping: ${overheadGroupBy === "legal_entity" ? "Legal Entity" : overheadGroupBy === "parent_division" ? "Parent Division" : "Subdivision"} · View All/exports include the full filtered scope` : ""}</div></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <button type="button" onClick={() => setViewAllMaximized((current) => !current)} title={viewAllMaximized ? "Restore window size" : "Maximize to full screen"} aria-label={viewAllMaximized ? "Restore window size" : "Maximize to full screen"} style={{ border: "1px solid #dbe3ef", background: "#f8fafc", color: COLORS.navy, borderRadius: 8, minWidth: 34, height: 32, padding: "0 8px", fontSize: 16, cursor: "pointer", lineHeight: 1 }}>{viewAllMaximized ? <Minimize2 size={16} strokeWidth={1.8} /> : <Maximize2 size={16} strokeWidth={1.8} />}</button>
                            <button type="button" onClick={() => { setViewAll(""); setViewAllMaximized(false); }} title="Close" aria-label="Close View All" style={{ border: "1px solid #dbe3ef", background: "#fff", color: COLORS.navy, borderRadius: 8, width: 32, height: 32, display: "grid", placeItems: "center", cursor: "pointer" }}><X size={16} strokeWidth={1.8} /></button>
                        </div>
                    </div>
                    <div className="no-print mfg-filter-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr)) auto", alignItems: "end", gap: 7, padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}`, background: "#fff" }}>
                        <MultiSelectFilter label="Legal Group" value={viewAllFilters.legalGroup} onChange={v => updateViewAll("legalGroup", v)} options={viewGroups} />
                        <MultiSelectFilter label="Legal Entity" value={viewAllFilters.legalEntity} onChange={v => updateViewAll("legalEntity", v)} options={viewAllLegalEntities} />
                        <MultiSelectFilter label="Parent Division" value={viewAllFilters.parent} onChange={v => updateViewAll("parent", v)} options={viewAllParentDivisions} />
                        <MultiSelectFilter label="Sub-Division" value={viewAllFilters.sub} onChange={v => updateViewAll("sub", v)} options={viewAllSubdivisions} />
                        <Filter label="Year" value={viewAllFilters.year} onChange={v => updateViewAll("year", v)} options={[...new Set([viewAllFilters.year, ...(viewAllFilterOptions.years.length ? viewAllFilterOptions.years : filterOptions.years).map((x) => String(idOf(x)))].filter(Boolean))]} />
                        <Filter label="Period" value={viewAllFilters.period} onChange={v => updateViewAll("period", v)} options={sortPeriodsChronologically(viewAllFilterOptions.periods.length ? viewAllFilterOptions.periods : filterOptions.periods, viewAllFilters.year)} hidePlaceholder />
                        <Filter label="Reporting Currency" value={viewAllFilters.currency} onChange={v => updateViewAll("currency", v)} options={["AED", "USD", "EUR", "GBP"]} />
                        <div className="mfg-filter-actions" style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                            <button type="button" onClick={applyViewAllFilters} disabled={detailLoading} style={{ ...filterActionStyle, height: 33, border: "1px solid #5B3FE4", background: detailLoading ? "#8b7bf0" : "#5B3FE4", color: "#fff", padding: "0 12px", opacity: detailLoading ? .9 : 1, cursor: detailLoading ? "wait" : "pointer" }}>{detailLoading ? "Applying…" : "Apply"}</button>
                            <button type="button" onClick={() => { const fj = viewGroups.find((x) => /\bfj\s*group\b/i.test(labelOf(x))); const marked = viewGroups.find((x) => x?.is_default || x?.default); const resetValues = { ...FILTER_DEFAULTS, legalGroup: (fj || marked) ? [String(idOf(fj || marked))] : [] }; viewAllFiltersRef.current = resetValues; setViewAllFilters(resetValues); setSearch(""); openViewAll(viewAll || "category-breakdown", "", resetValues); }} style={{ ...filterActionStyle, height: 33, border: 0, background: "transparent", color: "#475569", padding: "0 7px" }}>Reset</button>
                        </div>
                    </div>
                    <div className="no-print" style={{ padding: "10px 16px", display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${COLORS.border}`, background: "#f8fafc" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", fontSize: 11, color: COLORS.muted }}>
                            <><div role="group" aria-label="View All amount unit" style={{ display: "inline-flex", padding: 3, gap: 2, border: "1px solid #dbe3ef", borderRadius: 8, background: "#f1f5f9" }}><button type="button" onClick={() => setViewAllUnit("aed")} aria-pressed={viewAllUnit === "aed"} style={{ border: 0, borderRadius: 6, padding: "5px 9px", background: viewAllUnit === "aed" ? "#5B3FE4" : "transparent", color: viewAllUnit === "aed" ? "#fff" : "#475569", fontSize: 10.5, fontWeight: 800, cursor: "pointer" }}>AED</button><button type="button" onClick={() => setViewAllUnit("millions")} aria-pressed={viewAllUnit === "millions"} style={{ border: 0, borderRadius: 6, padding: "5px 9px", background: viewAllUnit === "millions" ? "#5B3FE4" : "transparent", color: viewAllUnit === "millions" ? "#fff" : "#475569", fontSize: 10.5, fontWeight: 800, cursor: "pointer" }}>AED Million</button></div></>
                            <ExportButtons onExcel={() => exportReport("excel", viewAll || "category-breakdown", viewAllFilters)} onPdf={() => exportReport("pdf", viewAll || "category-breakdown", viewAllFilters)} />
                        </div>
                    </div>
                    {detailLoading && <div style={{ padding: 12, fontSize: 12, color: COLORS.muted }}>Loading report details…</div>}
                    <div className="mfg-modal-table-wrap" style={{ overflow: "auto", padding: "0 16px 0", marginBottom: 0, paddingBottom: 0 }}>
                        <table className="mfg-modal-table" style={{ width: "100%", tableLayout: "auto", borderCollapse: "separate", borderSpacing: 0, minWidth: viewAll === "monthly-trend" ? 1100 : viewAll === "production-overhead-monthly" ? Math.max(1100, 190 + productionOverheadMonths.length * 100 + 420) : (viewAll === "category-breakdown" || viewAll === "category-detail" ? 1120 : 720), fontSize: 11 }}>
                            <thead style={{ position: "sticky", top: 0, zIndex: 3 }}><tr>{viewAllHeaders.map((h, i) => {
                                const firstNumericColumn = viewAll === "production-overhead-monthly" ? 1 : viewAll === "monthly-trend" ? 1 : viewAll === "category-detail" ? 5 : viewAll === "category-breakdown" ? 4 : 1;
                                const numericColumn = i >= firstNumericColumn;
                                return <th key={h} className={i === 0 ? "mfg-sticky-first-col" : undefined} scope="col" title={h} style={{ position: "sticky", top: 0, left: i === 0 ? 0 : undefined, zIndex: i === 0 ? 7 : 3, background: "#f1f5f9", color: "#061b49", textAlign: numericColumn ? "right" : "left", padding: "11px 9px", borderBottom: "2px solid #dbe3ef", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal", textTransform: "uppercase", letterSpacing: ".025em", fontWeight: 850, lineHeight: 1.25, fontVariantNumeric: "tabular-nums", minWidth: viewAll === "production-overhead-monthly" && i === 0 ? 190 : undefined, maxWidth: viewAll === "production-overhead-monthly" && i === 0 ? 220 : undefined }}>{h}</th>;
                            })}</tr></thead>
                            <tbody>{pagedViewAllRows.map((r, idx) => <tr className="mfg-row" key={`${first(r.raw, ["legal_entity_id", "legal_entity_code"], r.legalEntity || "")}-${first(r.raw, ["parent_division_id", "parent_division_code"], r.parentDivision || "")}-${first(r.raw, ["subdivision_id", "subdivision_code"], r.subDivision || "")}-${first(r.raw, ["source_code", "source_id", "category_id"], r.category || "")}-${r.accountCode || ""}-${r.accountName || ""}-${idx}`} style={{ background: idx % 2 ? "#f8fafc" : "#fff" }}>{viewAll === "category-breakdown" ? <>{[r.legalEntity, r.parentDivision, r.subDivision, r.category].map((v, i) => <td key={`breakdown-${i}`} title={v} style={{ padding: "10px 9px", textAlign: "left", verticalAlign: "top", borderBottom: "1px solid #e2e8f0", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal", minWidth: i === 0 ? 145 : i === 1 ? 145 : i === 2 ? 135 : 150, maxWidth: i < 3 ? 210 : 260, lineHeight: 1.4, color: i === 3 ? COLORS.navy : "#475569", fontWeight: i === 3 ? 750 : 500 }}>{v || "—"}</td>)}</> : viewAll === "category-detail" ? <>{[r.legalEntity, r.parentDivision, r.subDivision, r.accountCode, r.accountName].map((v, i) => <td key={`detail-${i}`} title={v} style={{ padding: "10px 9px", textAlign: "left", verticalAlign: "top", borderBottom: "1px solid #e2e8f0", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal", minWidth: i === 0 ? 145 : i === 1 ? 145 : i === 2 ? 135 : i === 3 ? 105 : 180, maxWidth: i < 3 ? 210 : 280, lineHeight: 1.4, color: i >= 3 ? COLORS.navy : "#475569", fontWeight: i >= 3 ? 650 : 500 }}>{v || "—"}</td>)}</> : viewAll === "production-overhead-monthly" ? <td className="mfg-sticky-first-col" title={r.dimension || "—"} style={{ padding: "10px 9px", textAlign: "left", verticalAlign: "middle", fontWeight: 750, background: idx % 2 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e2e8f0", whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "normal", lineHeight: 1.35, minWidth: 190, maxWidth: 220 }}>{r.dimension || r.category || "—"}</td> : <td style={{ padding: "10px 9px", fontWeight: 750, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{r.category}</td>}{(viewAll === "monthly-trend" ? [r.actualPtd, r.targetPtd, r.variancePtd, r.actualYtd, r.targetYtd, r.varianceYtd, r.overheadActual, r.overheadTarget, r.overheadVariance] : viewAll === "production-overhead-monthly" ? [...productionOverheadMonths.map((month) => r[`month__${month}`]), r.actualPtd, r.targetPtd, r.variancePtd, r.actualPtd != null && r.targetPtd != null && r.targetPtd !== 0 ? (r.variancePtd / Math.abs(r.targetPtd)) * 100 : null] : [r.actualPtd, r.targetPtd, r.variancePtd, r.actualYtd, r.targetYtd, r.varianceYtd]).map((v, i) => <td key={i} style={{
                                padding: "10px 9px", textAlign: "right", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", color: (viewAll === "monthly-trend" ? [2, 5, 8].includes(i) : viewAll === "production-overhead-monthly" ? i >= productionOverheadMonths.length + 2 : [2, 5].includes(i))
                                    ? (v == null ? "#64748b" : (viewAll === "category-breakdown" || viewAll === "category-detail")
                                        ? (numberOrNull(v) == null || Number(v) === 0 ? "#64748b" : Number(v) > 0 ? "#15803d" : "#dc2626")
                                        : (numberOrNull(v) == null || Number(v) === 0 ? "#64748b" : Number(v) > 0 ? "#15803d" : "#dc2626"))
                                    : "#334155", fontWeight: viewAll === "production-overhead-monthly" ? (i >= productionOverheadMonths.length + 2 ? 750 : 500) : (viewAll === "monthly-trend" ? [2, 5, 8].includes(i) : [2, 5].includes(i)) ? 750 : 500
                            }}>{viewAll === "production-overhead-monthly" && i === productionOverheadMonths.length + 3 ? (v == null ? "—" : `${Number(v).toFixed(1)}%`) : formatViewAllValue(v, viewAll, viewAllUnit)}</td>)}</tr>)}</tbody>
                            {viewAll === "monthly-trend" && <tfoot><tr>
                                {monthlyTrendTotalRow.map((value, index) => <td key={`monthly-trend-total-${index}`} className={index === 0 ? "mfg-sticky-first-col" : undefined} style={{ position: "sticky", bottom: 0, left: index === 0 ? 0 : undefined, zIndex: index === 0 ? 8 : 6, background: "#e8eef8", borderTop: "2px solid #94a3b8", boxShadow: "0 -3px 8px rgba(15,23,42,.06)", padding: "10px 9px", textAlign: index ? "right" : "left", fontWeight: 900, color: index === 0 ? COLORS.navy : [3, 6, 9].includes(index) ? (value == null ? COLORS.navy : value <= 0 ? "#15803d" : "#dc2626") : COLORS.navy, whiteSpace: "nowrap" }}>
                                    {index === 0 ? value : value == null ? "—" : formatViewAllValue(value, viewAll, viewAllUnit)}
                                </td>)}
                            </tr></tfoot>}
                            {viewAll === "production-overhead-monthly" && <tfoot><tr>
                                {[
                                    "Total",
                                    ...productionOverheadTotalRow.months,
                                    productionOverheadTotalRow.actual,
                                    productionOverheadTotalRow.target,
                                    productionOverheadTotalRow.variance,
                                    productionOverheadTotalVariancePct,
                                ].map((value, index) => <td key={`production-overhead-total-${index}`} className={index === 0 ? "mfg-sticky-first-col" : undefined} style={{ position: "sticky", bottom: 0, left: index === 0 ? 0 : undefined, zIndex: index === 0 ? 8 : 6, background: "#e8eef8", borderTop: "2px solid #94a3b8", boxShadow: "0 -3px 8px rgba(15,23,42,.06)", padding: "11px 9px", textAlign: index ? "right" : "left", fontWeight: 900, color: index === 0 ? COLORS.navy : index === productionOverheadMonths.length + 3 ? (value == null ? COLORS.navy : value <= 0 ? "#15803d" : "#dc2626") : COLORS.navy, whiteSpace: "nowrap" }}>
                                    {index === 0 ? value : value == null ? "—" : index === productionOverheadMonths.length + 4 ? `${Number(value).toFixed(1)}%` : formatViewAllValue(value, viewAll, viewAllUnit)}
                                </td>)}
                            </tr></tfoot>}
                            {!(["monthly-trend", "production-overhead-monthly"].includes(viewAll)) && <tfoot><tr>{[
                                viewAll === "category-breakdown" ? "Net Cost of Sales" : "Category Total",
                                ...(viewAll === "category-detail" ? ["", "", "", ""] : ["", "", ""]),
                                ...["actual", "target", "variance"].flatMap((key) => [numberOrNull(first(viewAllTotals?.ptd, [key, `${key}_reporting_currency`, `${key}_amount`])) == null ? null : numberOrNull(first(viewAllTotals?.ptd, [key, `${key}_reporting_currency`, `${key}_amount`]))]),
                                ...["actual", "target", "variance"].map((key) => {
                                    const value = numberOrNull(first(viewAllTotals?.ytd, [key, `${key}_reporting_currency`, `${key}_amount`]));
                                    return value == null ? null : value;
                                })
                            ].map((v, i) => <td key={i} className={i === 0 ? "mfg-sticky-first-col" : undefined} style={{ position: "sticky", bottom: 0, left: i === 0 ? 0 : undefined, zIndex: i === 0 ? 8 : 6, background: "#f1f5f9", borderTop: "2px solid #cbd5e1", padding: "11px 9px", textAlign: i ? "right" : "left", fontWeight: 900, color: i === 3 || i === 6 ? (v == null ? COLORS.navy : v <= 0 ? "#15803d" : "#dc2626") : COLORS.navy, whiteSpace: "nowrap" }}>{i === 0 ? v : v == null ? "—" : formatViewAllValue(v, viewAll, viewAllUnit)}</td>)}</tr></tfoot>}
                        </table>
                    </div>
                    <div style={{ padding: "9px 18px", borderTop: `1px solid ${COLORS.border}`, background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 11, color: COLORS.muted }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <span>Showing {viewAllFilteredRows.length ? (safeViewAllPage - 1) * viewAllPageSize + 1 : 0}–{Math.min(safeViewAllPage * viewAllPageSize, viewAllFilteredRows.length)} of {viewAllFilteredRows.length} records</span>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Rows per page
                                <select value={viewAllPageSize} onChange={(e) => { setViewAllPageSize(Number(e.target.value)); setViewAllPage(1); }} style={{ border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", padding: "4px 6px", color: COLORS.navy }}>
                                    {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
                                </select>
                            </label>
                            <button type="button" disabled={safeViewAllPage <= 1} onClick={() => setViewAllPage((page) => Math.max(1, page - 1))} style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "5px 9px", background: safeViewAllPage <= 1 ? "#f1f5f9" : "#fff", color: safeViewAllPage <= 1 ? "#94a3b8" : COLORS.navy, cursor: safeViewAllPage <= 1 ? "not-allowed" : "pointer" }}>Previous</button>
                            <span>Page {safeViewAllPage} of {viewAllPageCount}</span>
                            <button type="button" disabled={safeViewAllPage >= viewAllPageCount} onClick={() => setViewAllPage((page) => Math.min(viewAllPageCount, page + 1))} style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: "5px 9px", background: safeViewAllPage >= viewAllPageCount ? "#f1f5f9" : "#fff", color: safeViewAllPage >= viewAllPageCount ? "#94a3b8" : COLORS.navy, cursor: safeViewAllPage >= viewAllPageCount ? "not-allowed" : "pointer" }}>Next</button>
                        </div>
                        <button onClick={() => setViewAll("")} style={{ background: "#e2e8f0", border: 0, borderRadius: 8, padding: "7px 17px", fontWeight: 800, color: COLORS.navy, cursor: "pointer" }}>Close</button>
                    </div>
                </motion.div>
            </motion.div>}
        </AnimatePresence>
    </div>;
}
