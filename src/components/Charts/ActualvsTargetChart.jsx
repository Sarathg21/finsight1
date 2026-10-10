
// import React, { useMemo, useState, useRef, useEffect } from "react";
// import {
//     ResponsiveContainer,
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     Legend,
//     Cell,
// } from "recharts";
// import { MoreVertical } from "lucide-react";
// import ExportButtons from "../Common/ExportButtons";

// /* =========================================================
//    FORMAT VALUE
// ========================================================= */

// const formatValue = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ""
//     ) {
//         return "—";
//     }

//     const number = Number(value);

//     if (Number.isNaN(number)) {
//         return "—";
//     }

//     return number.toLocaleString("en-US", {
//         maximumFractionDigits: 0,
//     });
// };

// /* =========================================================
//    NORMALIZE CHART DATA
// ========================================================= */

// const normalizeChartData = (data = []) => {
//     if (!Array.isArray(data)) {
//         return [];
//     }

//     return data.map((item) => {
//         const actual =
//             item?.actual !== undefined
//                 ? item.actual
//                 : item?.actual_ptd_aed;

//         const target =
//             item?.target !== undefined
//                 ? item.target
//                 : item?.target_ptd_aed;

//         const variance =
//             item?.variance_ptd !== undefined
//                 ? item.variance_ptd
//                 : item?.variance_ptd_aed;

//         const variancePct =
//             item?.variance_ptd_pct !== undefined
//                 ? item.variance_ptd_pct
//                 : null;

//         return {
//             category: item?.category ?? "—",

//             actual:
//                 actual !== null &&
//                     actual !== undefined &&
//                     actual !== ""
//                     ? Number(actual)
//                     : null,

//             target:
//                 target !== null &&
//                     target !== undefined &&
//                     target !== ""
//                     ? Number(target)
//                     : null,

//             actualBackend:
//                 actual !== null &&
//                     actual !== undefined &&
//                     actual !== ""
//                     ? String(actual)
//                     : null,

//             targetBackend:
//                 target !== null &&
//                     target !== undefined &&
//                     target !== ""
//                     ? String(target)
//                     : null,

//             variancePtd:
//                 variance !== null &&
//                     variance !== undefined &&
//                     variance !== ""
//                     ? Number(variance)
//                     : null,

//             variancePtdBackend:
//                 variance !== null &&
//                     variance !== undefined &&
//                     variance !== ""
//                     ? String(variance)
//                     : null,

//             variancePtdPct:
//                 variancePct !== null &&
//                     variancePct !== undefined &&
//                     variancePct !== ""
//                     ? Number(variancePct)
//                     : null,

//             variancePtdPctBackend:
//                 variancePct !== null &&
//                     variancePct !== undefined &&
//                     variancePct !== ""
//                     ? String(variancePct)
//                     : null,

//             varianceStatus:
//                 item?.variance_status ?? null,

//             reportingCurrency:
//                 item?.reporting_currency ?? null,

//             conversionRateToAed:
//                 item?.conversion_rate_to_aed ?? null,
//         };
//     });
// };

// /* =========================================================
//    CUSTOM TOOLTIP
// ========================================================= */

// function CustomTooltip({
//     active,
//     payload,
//     label,
//     reportingCurrency = "AED",
// }) {
//     if (
//         !active ||
//         !payload ||
//         !payload.length
//     ) {
//         return null;
//     }

//     const row = payload[0]?.payload || {};

//     const getBackendValue = (dataKey) => {
//         if (dataKey === "actual") {
//             return row.actualBackend;
//         }

//         if (dataKey === "target") {
//             return row.targetBackend;
//         }

//         return null;
//     };

//     const formatBackendDisplay = (value) => {
//         if (
//             value === null ||
//             value === undefined ||
//             value === ""
//         ) {
//             return "—";
//         }

//         const numericValue = Number(value);

//         if (Number.isNaN(numericValue)) {
//             return "—";
//         }

//         return `${reportingCurrency} ${numericValue.toLocaleString(
//             "en-US",
//             {
//                 maximumFractionDigits: 0,
//                 minimumFractionDigits: 0,
//             }
//         )}`;
//     };

//     return (
//         <div
//             style={{
//                 minWidth: 225,
//                 background:
//                     "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
//                 border: "1px solid rgba(148,163,184,0.30)",
//                 borderRadius: 12,
//                 padding: "11px 13px",
//                 boxShadow:
//                     "0 14px 34px rgba(15,23,42,0.16), 0 2px 8px rgba(79,70,229,0.08)",
//                 backdropFilter: "blur(12px)",
//                 WebkitBackdropFilter: "blur(12px)",

//                 /* SUBTLE TOOLTIP EFFECT */
//                 transform: "translateY(-2px)",
//                 transition:
//                     "opacity 160ms ease, transform 160ms ease",
//             }}
//         >
//             <div
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     gap: 12,
//                     marginBottom: 9,
//                 }}
//             >
//                 <div
//                     style={{
//                         fontSize: 12,
//                         fontWeight: 800,
//                         color: "#0F172A",
//                         lineHeight: 1.25,
//                     }}
//                 >
//                     {label}
//                 </div>
//             </div>

//             <div
//                 style={{
//                     height: 1,
//                     background: "#E2E8F0",
//                     marginBottom: 7,
//                 }}
//             />

//             {payload.map((item) => {
//                 const backendValue =
//                     getBackendValue(item?.dataKey);

//                 const itemColor =
//                     item?.dataKey === "actual"
//                         ? "#DC2626"
//                         : "#2563EB";

//                 return (
//                     <div
//                         key={item.dataKey}
//                         style={{
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "space-between",
//                             gap: 18,
//                             marginTop: 7,
//                         }}
//                     >
//                         <div
//                             style={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 7,
//                                 minWidth: 0,
//                             }}
//                         >
//                             <span
//                                 style={{
//                                     width: 8,
//                                     height: 8,
//                                     borderRadius: "50%",
//                                     background: itemColor,

//                                     /* SUBTLE DOT GLOW */
//                                     boxShadow: `0 0 0 3px ${itemColor}18, 0 0 8px ${itemColor}45`,

//                                     flex: "0 0 auto",
//                                 }}
//                             />

//                             <span
//                                 style={{
//                                     fontSize: 11,
//                                     fontWeight: 700,
//                                     color: itemColor,
//                                     whiteSpace: "nowrap",
//                                 }}
//                             >
//                                 {item.name}
//                             </span>
//                         </div>

//                         <span
//                             style={{
//                                 fontSize: 12,
//                                 fontWeight: 800,
//                                 color: itemColor,
//                                 whiteSpace: "nowrap",
//                                 fontVariantNumeric:
//                                     "tabular-nums",
//                             }}
//                         >
//                             {formatBackendDisplay(
//                                 backendValue
//                             )}
//                         </span>
//                     </div>
//                 );
//             })}
//         </div>
//     );
// }

// /* =========================================================
//    CUSTOM Y AXIS LABEL
// ========================================================= */

// function CustomYAxisTick({
//     x,
//     y,
//     payload,
//     hoveredCategory = null,
// }) {
//     const text = payload.value;

//     return (
//         <g
//             transform={`translate(${x},${y})`}
//         >
//             <text
//                 x={-165}
//                 y={0}
//                 textAnchor="start"
//                 dominantBaseline="middle"
//                 fill={
//                     hoveredCategory === text
//                         ? "#4F46E5"
//                         : "#1E293B"
//                 }
//                 fontSize={12}
//                 fontWeight={
//                     hoveredCategory === text
//                         ? 800
//                         : 700
//                 }
//                 style={{
//                     transition:
//                         "fill 180ms ease, font-weight 180ms ease",
//                 }}
//             >
//                 {text}
//             </text>
//         </g>
//     );
// }

// /* =========================================================
//    CUSTOM BAR LABEL
// ========================================================= */

// function formatMillions(value) {
//     if (
//         value === null ||
//         value === undefined ||
//         value === "" ||
//         Number.isNaN(Number(value))
//     ) {
//         return "—";
//     }

//     const number = Number(value);
//     const millions = number / 1000000;

//     if (Math.abs(millions) >= 100) {
//         return `${millions.toFixed(0)}M`;
//     }

//     if (Math.abs(millions) >= 10) {
//         return `${millions.toFixed(1)}M`;
//     }

//     return `${millions.toFixed(2)}M`;
// }

// /* =========================================================
//    ACTUAL BAR LABEL
// ========================================================= */

// function ActualBarLabel({
//     x,
//     y,
//     width,
//     value,
// }) {
//     const formatted = formatMillions(value);

//     if (formatted === "—") {
//         return null;
//     }

//     return (
//         <text
//             x={x + width + 6}
//             y={y + 6}
//             fill="#334155"
//             fontSize={10}
//             fontWeight={800}
//             textAnchor="start"
//             dominantBaseline="middle"
//             style={{
//                 fontVariantNumeric: "tabular-nums",
//             }}
//         >
//             {formatted}
//         </text>
//     );
// }

// /* =========================================================
//    TARGET BAR LABEL
// ========================================================= */

// function TargetBarLabel({
//     x,
//     y,
//     width,
//     value,
// }) {
//     const formatted = formatMillions(value);

//     if (formatted === "—") {
//         return null;
//     }

//     return (
//         <text
//             x={x + width + 6}
//             y={y + 6}
//             fill="#64748B"
//             fontSize={10}
//             fontWeight={800}
//             textAnchor="start"
//             dominantBaseline="middle"
//             style={{
//                 fontVariantNumeric: "tabular-nums",
//             }}
//         >
//             {formatted}
//         </text>
//     );
// }

// /* =========================================================
//    MAIN COMPONENT
// ========================================================= */

// export default function ActualVsTargetChart({
//     data = [],
//     total,
//     activeFilters,
//     reportingCurrency = "AED",
//     onDrillDown,
//     onViewAll,
//     onExportExcel,
//     onExportPdf,
//     exporting = "",
// }) {
//     /* =======================================================
//        MENU STATE
//     ======================================================= */

//     const [menuOpen, setMenuOpen] = useState(false);
//     const [hoveredBar, setHoveredBar] = useState(null);
//     const [hoveredCategory, setHoveredCategory] =
//         useState(null);

//     const menuRef = useRef(null);

//     /* =======================================================
//        CLOSE MENU WHEN CLICKING OUTSIDE
//     ======================================================= */

//     useEffect(() => {
//         const handleOutsideClick = (event) => {
//             if (
//                 menuRef.current &&
//                 !menuRef.current.contains(event.target)
//             ) {
//                 setMenuOpen(false);
//             }
//         };

//         if (menuOpen) {
//             document.addEventListener(
//                 "mousedown",
//                 handleOutsideClick
//             );
//         }

//         return () => {
//             document.removeEventListener(
//                 "mousedown",
//                 handleOutsideClick
//             );
//         };
//     }, [menuOpen]);

//     /* =======================================================
//        MENU HANDLERS
//     ======================================================= */

//     const handleViewAll = async () => {
//         setMenuOpen(false);

//         if (typeof onViewAll === "function") {
//             await onViewAll(chartData);
//         }
//     };

//     const handleExportExcel = async () => {
//         setMenuOpen(false);

//         if (typeof onExportExcel === "function") {
//             await onExportExcel();
//         }
//     };

//     const handleExportPdf = async () => {
//         setMenuOpen(false);

//         if (typeof onExportPdf === "function") {
//             await onExportPdf();
//         }
//     };

//     /* =======================================================
//        COMMON EXPORT HANDLER
//     ======================================================= */

//     const handleExport = async (type) => {
//         if (type === "excel") {
//             await handleExportExcel();
//             return;
//         }

//         if (type === "pdf") {
//             await handleExportPdf();
//         }
//     };

//     /* =======================================================
//        EXPORTING STATE FOR COMMON COMPONENT
//     ======================================================= */

//     const commonExporting =
//         exporting === "composition-excel"
//             ? "excel"
//             : exporting === "composition-pdf"
//                 ? "pdf"
//                 : "";

//     /* =======================================================
//        NORMALIZED DATA
//     ======================================================= */

//     const chartData = useMemo(
//         () => normalizeChartData(data),
//         [data]
//     );

//     /* =======================================================
//        X AXIS MAXIMUM
//     ======================================================= */

//     const xAxisMax = useMemo(() => {
//         const values = chartData
//             .flatMap((item) => [
//                 item.actual,
//                 item.target,
//             ])
//             .filter(
//                 (value) =>
//                     value !== null &&
//                     value !== undefined &&
//                     !Number.isNaN(value)
//             );

//         if (!values.length) {
//             return 1000;
//         }

//         const maxValue = Math.max(...values);

//         const calculatedMax =
//             maxValue * 1.2;

//         if (calculatedMax <= 1000) {
//             return 1000;
//         }

//         if (calculatedMax <= 5000) {
//             return 5000;
//         }

//         if (calculatedMax <= 10000) {
//             return 10000;
//         }

//         if (calculatedMax <= 25000) {
//             return 25000;
//         }

//         if (calculatedMax <= 50000) {
//             return 50000;
//         }

//         if (calculatedMax <= 100000) {
//             return 100000;
//         }

//         if (calculatedMax <= 250000) {
//             return 250000;
//         }

//         if (calculatedMax <= 500000) {
//             return 500000;
//         }

//         if (calculatedMax <= 1000000) {
//             return 1000000;
//         }

//         return (
//             Math.ceil(
//                 calculatedMax / 1000000
//             ) * 1000000
//         );
//     }, [chartData]);

//     /* =======================================================
//        X AXIS TICK FORMAT
//     ======================================================= */

//     const formatXAxis = (value) => {
//         if (
//             value === null ||
//             value === undefined ||
//             Number.isNaN(Number(value))
//         ) {
//             return "";
//         }

//         const millions =
//             Number(value) / 1000000;

//         if (millions === 0) {
//             return "0M";
//         }

//         if (Math.abs(millions) >= 100) {
//             return `${millions.toFixed(0)}M`;
//         }

//         if (Math.abs(millions) >= 10) {
//             return `${millions.toFixed(1)}M`;
//         }

//         return `${millions.toFixed(2)}M`;
//     };

//     return (
//         <div
//             style={{
//                 width: "100%",
//                 height: "100%",
//                 minHeight: 275,
//                 background: "#FFFFFF",
//                 border: "1px solid #E5E7EB",
//                 borderRadius: 10,
//                 padding: "12px 12px 8px",
//                 boxSizing: "border-box",
//                 display: "flex",
//                 flexDirection: "column",

//                 /* =================================================
//                    SUBTLE CARD EFFECT
//                 ================================================= */
//                 transition:
//                     "box-shadow 220ms ease, border-color 220ms ease",
//             }}
//             onMouseEnter={(event) => {
//                 event.currentTarget.style.boxShadow =
//                     "0 8px 24px rgba(15,23,42,0.08)";
//                 event.currentTarget.style.borderColor =
//                     "#D7DCE5";
//             }}
//             onMouseLeave={(event) => {
//                 event.currentTarget.style.boxShadow =
//                     "none";
//                 event.currentTarget.style.borderColor =
//                     "#E5E7EB";
//             }}
//         >
//             {/* HEADER */}

//             <div
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent:
//                         "space-between",
//                     marginBottom: 2,
//                     position: "relative",
//                 }}
//             >
//                 <div
//                     style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         gap: 2,
//                         minWidth: 0,
//                     }}
//                 >
//                     <h3
//                         style={{
//                             margin: 0,
//                             fontSize: 13,
//                             lineHeight: "18px",
//                             fontWeight: 700,
//                             color: "#0F172A",
//                         }}
//                     >
//                         Actual vs Target by Expense Category
//                     </h3>

//                     <div
//                         style={{
//                             fontSize: 10,
//                             lineHeight: "15px",
//                             fontWeight: 500,
//                             color: "#64748B",
//                         }}
//                     >
//                         Compare actual PTD costs against target PTD by expense category
//                     </div>
//                 </div>

//                 {/* THREE DOT MENU */}

//                 <div
//                     ref={menuRef}
//                     style={{
//                         position: "relative",
//                     }}
//                 >
//                     <button
//                         type="button"
//                         onClick={() =>
//                             setMenuOpen(
//                                 (prev) => !prev
//                             )
//                         }
//                         aria-label="Chart options"
//                         aria-expanded={menuOpen}
//                         style={{
//                             border: "none",
//                             background:
//                                 "transparent",
//                             padding: "4px",
//                             cursor: "pointer",
//                             color: "#64748B",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             borderRadius: 5,
//                             transition:
//                                 "background 160ms ease, color 160ms ease, transform 160ms ease",
//                         }}
//                         onMouseEnter={(event) => {
//                             event.currentTarget.style.background =
//                                 "#F1F5F9";
//                             event.currentTarget.style.color =
//                                 "#334155";
//                             event.currentTarget.style.transform =
//                                 "scale(1.05)";
//                         }}
//                         onMouseLeave={(event) => {
//                             event.currentTarget.style.background =
//                                 "transparent";
//                             event.currentTarget.style.color =
//                                 "#64748B";
//                             event.currentTarget.style.transform =
//                                 "scale(1)";
//                         }}
//                     >
//                         <MoreVertical
//                             size={17}
//                             strokeWidth={2}
//                         />
//                     </button>

//                     {/* ACTION MENU */}

//                     {menuOpen && (
//                         <div
//                             style={{
//                                 position: "absolute",
//                                 top: 28,
//                                 right: 0,
//                                 minWidth: 165,
//                                 background: "#FFFFFF",
//                                 border: "1px solid #E5E7EB",
//                                 borderRadius: 8,
//                                 boxShadow:
//                                     "0 8px 24px rgba(15, 23, 42, 0.12)",
//                                 padding: "5px 0",
//                                 zIndex: 100,
//                             }}
//                         >
//                             {/* VIEW ALL */}

//                             <button
//                                 type="button"
//                                 onClick={
//                                     handleViewAll
//                                 }
//                                 disabled={
//                                     !onViewAll
//                                 }
//                                 style={{
//                                     width: "100%",
//                                     display:
//                                         "flex",
//                                     alignItems:
//                                         "center",
//                                     gap: 9,
//                                     border:
//                                         "none",
//                                     background:
//                                         "transparent",
//                                     padding:
//                                         "9px 12px",
//                                     cursor:
//                                         onViewAll
//                                             ? "pointer"
//                                             : "not-allowed",
//                                     textAlign:
//                                         "left",
//                                     fontSize: 12,
//                                     fontWeight: 500,
//                                     color:
//                                         "#334155",
//                                     opacity:
//                                         onViewAll
//                                             ? 1
//                                             : 0.5,
//                                     transition:
//                                         "background 140ms ease",
//                                 }}
//                                 onMouseEnter={(
//                                     event
//                                 ) => {
//                                     if (onViewAll) {
//                                         event.currentTarget.style.background =
//                                             "#F8FAFC";
//                                     }
//                                 }}
//                                 onMouseLeave={(
//                                     event
//                                 ) => {
//                                     event.currentTarget.style.background =
//                                         "transparent";
//                                 }}
//                             >
//                                 <span
//                                     style={{
//                                         fontSize: 14,
//                                     }}
//                                 >
//                                     🔍
//                                 </span>

//                                 <span>
//                                     View All
//                                 </span>
//                             </button>

//                             {/* EXPORT EXCEL */}

//                             <button
//                                 type="button"
//                                 onClick={
//                                     handleExportExcel
//                                 }
//                                 disabled={
//                                     commonExporting ===
//                                     "excel"
//                                 }
//                                 style={{
//                                     width: "100%",
//                                     display:
//                                         "flex",
//                                     alignItems:
//                                         "center",
//                                     gap: 9,
//                                     border:
//                                         "none",
//                                     background:
//                                         "transparent",
//                                     padding:
//                                         "9px 12px",
//                                     cursor:
//                                         commonExporting ===
//                                             "excel"
//                                             ? "not-allowed"
//                                             : "pointer",
//                                     textAlign:
//                                         "left",
//                                     fontSize: 12,
//                                     fontWeight: 500,
//                                     color:
//                                         "#334155",
//                                     opacity:
//                                         commonExporting ===
//                                             "excel"
//                                             ? 0.6
//                                             : 1,
//                                     transition:
//                                         "background 140ms ease",
//                                 }}
//                                 onMouseEnter={(
//                                     event
//                                 ) => {
//                                     if (
//                                         commonExporting !==
//                                         "excel"
//                                     ) {
//                                         event.currentTarget.style.background =
//                                             "#F8FAFC";
//                                     }
//                                 }}
//                                 onMouseLeave={(
//                                     event
//                                 ) => {
//                                     event.currentTarget.style.background =
//                                         "transparent";
//                                 }}
//                             >
//                                 <span
//                                     style={{
//                                         fontSize: 14,
//                                     }}
//                                 >
//                                     📊
//                                 </span>

//                                 <span>
//                                     Export Excel
//                                 </span>
//                             </button>

//                             {/* EXPORT PDF */}

//                             <button
//                                 type="button"
//                                 onClick={
//                                     handleExportPdf
//                                 }
//                                 disabled={
//                                     commonExporting ===
//                                     "pdf"
//                                 }
//                                 style={{
//                                     width: "100%",
//                                     display:
//                                         "flex",
//                                     alignItems:
//                                         "center",
//                                     gap: 9,
//                                     border:
//                                         "none",
//                                     background:
//                                         "transparent",
//                                     padding:
//                                         "9px 12px",
//                                     cursor:
//                                         commonExporting ===
//                                             "pdf"
//                                             ? "not-allowed"
//                                             : "pointer",
//                                     textAlign:
//                                         "left",
//                                     fontSize: 12,
//                                     fontWeight: 500,
//                                     color:
//                                         "#334155",
//                                     opacity:
//                                         commonExporting ===
//                                             "pdf"
//                                             ? 0.6
//                                             : 1,
//                                     transition:
//                                         "background 140ms ease",
//                                 }}
//                                 onMouseEnter={(
//                                     event
//                                 ) => {
//                                     if (
//                                         commonExporting !==
//                                         "pdf"
//                                     ) {
//                                         event.currentTarget.style.background =
//                                             "#F8FAFC";
//                                     }
//                                 }}
//                                 onMouseLeave={(
//                                     event
//                                 ) => {
//                                     event.currentTarget.style.background =
//                                         "transparent";
//                                 }}
//                             >
//                                 <span
//                                     style={{
//                                         fontSize: 14,
//                                     }}
//                                 >
//                                     📄
//                                 </span>

//                                 <span>
//                                     Export PDF
//                                 </span>
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* CHART */}

//             <div
//                 style={{
//                     flex: 1,
//                     minHeight: Math.max(
//                         235,
//                         chartData.length * 55
//                     ),
//                     width: "100%",
//                 }}
//             >
//                 <ResponsiveContainer
//                     width="100%"
//                     height="100%"
//                 >
//                     <BarChart
//                         data={chartData}
//                         layout="vertical"
//                         margin={{
//                             top: 20,
//                             right: 58,
//                             left: 25,
//                             bottom: 20,
//                         }}
//                         barGap={3}
//                         barCategoryGap="18%"
//                         onMouseLeave={() => {
//                             setHoveredBar(null);
//                             setHoveredCategory(null);
//                         }}
//                     >
//                         <defs>

//                             {/* =================================================
//                                SPENT / ACTUAL RED GRADIENT
//                             ================================================= */}

//                             <linearGradient
//                                 id="actualVsTargetActualGradient"
//                                 x1="0"
//                                 y1="0"
//                                 x2="1"
//                                 y2="0"
//                             >
//                                 <stop
//                                     offset="0%"
//                                     stopColor="#B91C1C"
//                                 />

//                                 <stop
//                                     offset="55%"
//                                     stopColor="#DC2626"
//                                 />

//                                 <stop
//                                     offset="100%"
//                                     stopColor="#F87171"
//                                 />
//                             </linearGradient>

//                             {/* =================================================
//                                TARGET BLUE GRADIENT
//                             ================================================= */}

//                             <linearGradient
//                                 id="actualVsTargetTargetGradient"
//                                 x1="0"
//                                 y1="0"
//                                 x2="1"
//                                 y2="0"
//                             >
//                                 <stop
//                                     offset="0%"
//                                     stopColor="#1D4ED8"
//                                 />

//                                 <stop
//                                     offset="55%"
//                                     stopColor="#2563EB"
//                                 />

//                                 <stop
//                                     offset="100%"
//                                     stopColor="#60A5FA"
//                                 />
//                             </linearGradient>

//                             {/* =================================================
//                                SPENT / ACTUAL RED HOVER GLOW
//                             ================================================= */}

//                             <filter
//                                 id="actualVsTargetActualGlow"
//                                 x="-30%"
//                                 y="-100%"
//                                 width="180%"
//                                 height="300%"
//                             >
//                                 <feDropShadow
//                                     dx="0"
//                                     dy="2"
//                                     stdDeviation="4"
//                                     floodColor="#DC2626"
//                                     floodOpacity="0.48"
//                                 />

//                                 <feDropShadow
//                                     dx="0"
//                                     dy="0"
//                                     stdDeviation="1.5"
//                                     floodColor="#F87171"
//                                     floodOpacity="0.35"
//                                 />
//                             </filter>

//                             {/* =================================================
//                                TARGET BLUE HOVER GLOW
//                             ================================================= */}

//                             <filter
//                                 id="actualVsTargetTargetGlow"
//                                 x="-30%"
//                                 y="-100%"
//                                 width="180%"
//                                 height="300%"
//                             >
//                                 <feDropShadow
//                                     dx="0"
//                                     dy="2"
//                                     stdDeviation="4"
//                                     floodColor="#2563EB"
//                                     floodOpacity="0.42"
//                                 />

//                                 <feDropShadow
//                                     dx="0"
//                                     dy="0"
//                                     stdDeviation="1.5"
//                                     floodColor="#60A5FA"
//                                     floodOpacity="0.30"
//                                 />
//                             </filter>
//                         </defs>

//                         <CartesianGrid
//                             strokeDasharray="3 3"
//                             horizontal={false}
//                             stroke="#E5E7EB"
//                         />

//                         {/* X AXIS */}

//                         <XAxis
//                             type="number"
//                             domain={[
//                                 0,
//                                 xAxisMax,
//                             ]}
//                             axisLine={{
//                                 stroke: "#CBD5E1",
//                             }}
//                             tickLine={false}
//                             tick={{
//                                 fill: "#475569",
//                                 fontSize: 11,
//                                 fontWeight: 700,
//                             }}
//                             tickFormatter={
//                                 formatXAxis
//                             }
//                         />

//                         {/* Y AXIS */}

//                         <YAxis
//                             type="category"
//                             dataKey="category"
//                             width={175}
//                             axisLine={false}
//                             tickLine={false}
//                             interval={0}
//                             tick={
//                                 <CustomYAxisTick
//                                     hoveredCategory={
//                                         hoveredCategory
//                                     }
//                                 />
//                             }
//                         />

//                         {/* TOOLTIP */}

//                         <Tooltip
//                             content={
//                                 <CustomTooltip
//                                     reportingCurrency={
//                                         reportingCurrency
//                                     }
//                                 />
//                             }
//                             cursor={{
//                                 fill:
//                                     "rgba(37,99,235,0.055)",
//                                 stroke:
//                                     "rgba(37,99,235,0.20)",
//                                 strokeWidth: 1,
//                             }}
//                         />

//                         {/* LEGEND */}

//                         <Legend
//                             verticalAlign="top"
//                             align="center"
//                             height={27}
//                             iconType="square"
//                             iconSize={8}
//                             wrapperStyle={{
//                                 fontSize: 12,
//                                 fontWeight: 700,
//                                 color: "#334155",
//                                 paddingLeft: 125,
//                                 paddingBottom: 2,
//                             }}
//                         />

//                         {/* =================================================
//                            SPENT / ACTUAL
//                         ================================================= */}

//                         <Bar
//                             dataKey="actual"
//                             name={`Actual PTD (${reportingCurrency})`}
//                             fill="url(#actualVsTargetActualGradient)"
//                             radius={[
//                                 0,
//                                 6,
//                                 6,
//                                 0,
//                             ]}
//                             barSize={12}
//                             maxBarSize={12}

//                             /* SMOOTH ENTRANCE EFFECT */
//                             animationDuration={1100}
//                             animationBegin={80}
//                             animationEasing="ease-out"

//                             label={
//                                 <ActualBarLabel />
//                             }

//                             onMouseEnter={(
//                                 data,
//                                 index
//                             ) => {
//                                 setHoveredBar(
//                                     `${index}-actual`
//                                 );

//                                 setHoveredCategory(
//                                     chartData[index]
//                                         ?.category ??
//                                     null
//                                 );
//                             }}

//                             onMouseLeave={() => {
//                                 setHoveredBar(null);
//                                 setHoveredCategory(null);
//                             }}
//                         >
//                             {chartData.map(
//                                 (_, index) => (
//                                     <Cell
//                                         key={`actual-cell-${index}`}
//                                         fill="url(#actualVsTargetActualGradient)"

//                                         /* SMOOTH HOVER FADE */
//                                         opacity={
//                                             hoveredBar &&
//                                                 hoveredBar !==
//                                                 `${index}-actual` &&
//                                                 hoveredBar !==
//                                                 `${index}-target`
//                                                 ? 0.20
//                                                 : 1
//                                         }

//                                         style={{
//                                             filter:
//                                                 hoveredBar ===
//                                                     `${index}-actual`
//                                                     ? "url(#actualVsTargetActualGlow)"
//                                                     : "none",

//                                             transition:
//                                                 "opacity 240ms ease, filter 240ms ease",
//                                         }}
//                                     />
//                                 )
//                             )}
//                         </Bar>

//                         {/* =================================================
//                            TARGET
//                         ================================================= */}

//                         <Bar
//                             dataKey="target"
//                             name={`Target PTD (${reportingCurrency})`}
//                             fill="url(#actualVsTargetTargetGradient)"
//                             radius={[
//                                 0,
//                                 6,
//                                 6,
//                                 0,
//                             ]}
//                             barSize={12}
//                             maxBarSize={12}

//                             /* SMOOTH ENTRANCE EFFECT */
//                             animationDuration={1250}
//                             animationBegin={180}
//                             animationEasing="ease-out"

//                             label={
//                                 <TargetBarLabel />
//                             }

//                             onMouseEnter={(
//                                 data,
//                                 index
//                             ) => {
//                                 setHoveredBar(
//                                     `${index}-target`
//                                 );

//                                 setHoveredCategory(
//                                     chartData[index]
//                                         ?.category ??
//                                     null
//                                 );
//                             }}

//                             onMouseLeave={() => {
//                                 setHoveredBar(null);
//                                 setHoveredCategory(null);
//                             }}
//                         >
//                             {chartData.map(
//                                 (_, index) => (
//                                     <Cell
//                                         key={`target-cell-${index}`}
//                                         fill="url(#actualVsTargetTargetGradient)"

//                                         /* SMOOTH HOVER FADE */
//                                         opacity={
//                                             hoveredBar &&
//                                                 hoveredBar !==
//                                                 `${index}-actual` &&
//                                                 hoveredBar !==
//                                                 `${index}-target`
//                                                 ? 0.20
//                                                 : 1
//                                         }

//                                         style={{
//                                             filter:
//                                                 hoveredBar ===
//                                                     `${index}-target`
//                                                     ? "url(#actualVsTargetTargetGlow)"
//                                                     : "none",

//                                             transition:
//                                                 "opacity 240ms ease, filter 240ms ease",
//                                         }}
//                                     />
//                                 )
//                             )}
//                         </Bar>
//                     </BarChart>
//                 </ResponsiveContainer>
//             </div>

//             {/* X AXIS TITLE */}

//             <div
//                 style={{
//                     textAlign: "center",
//                     fontWeight: 800,
//                     fontSize: 11,
//                     color: "#334155",
//                     marginTop: -2,
//                 }}
//             >
//                 Amount ({reportingCurrency})
//             </div>
//         </div>
//     );
// }



import React, { useMemo, useState, useRef, useEffect } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
} from "recharts";
import { MoreVertical } from "lucide-react";
import ExportButtons from "../Common/ExportButtons";

/* =========================================================
   FORMAT VALUE
========================================================= */

const formatValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "—";
    }

    return number.toLocaleString("en-US", {
        maximumFractionDigits: 0,
    });
};

/* =========================================================
   NORMALIZE CHART DATA
========================================================= */

const normalizeChartData = (data = []) => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data.map((item) => {
        const actual =
            item?.actual !== undefined
                ? item.actual
                : item?.actual_ptd_aed;

        const target =
            item?.target !== undefined
                ? item.target
                : item?.target_ptd_aed;

        const variance =
            item?.variance_ptd !== undefined
                ? item.variance_ptd
                : item?.variance_ptd_aed;

        const variancePct =
            item?.variance_ptd_pct !== undefined
                ? item.variance_ptd_pct
                : null;

        return {
            category: item?.category ?? "—",

            actual:
                actual !== null &&
                    actual !== undefined &&
                    actual !== ""
                    ? Number(actual)
                    : null,

            target:
                target !== null &&
                    target !== undefined &&
                    target !== ""
                    ? Number(target)
                    : null,

            actualBackend:
                actual !== null &&
                    actual !== undefined &&
                    actual !== ""
                    ? String(actual)
                    : null,

            targetBackend:
                target !== null &&
                    target !== undefined &&
                    target !== ""
                    ? String(target)
                    : null,

            variancePtd:
                variance !== null &&
                    variance !== undefined &&
                    variance !== ""
                    ? Number(variance)
                    : null,

            variancePtdBackend:
                variance !== null &&
                    variance !== undefined &&
                    variance !== ""
                    ? String(variance)
                    : null,

            variancePtdPct:
                variancePct !== null &&
                    variancePct !== undefined &&
                    variancePct !== ""
                    ? Number(variancePct)
                    : null,

            variancePtdPctBackend:
                variancePct !== null &&
                    variancePct !== undefined &&
                    variancePct !== ""
                    ? String(variancePct)
                    : null,

            varianceStatus:
                item?.variance_status ?? null,

            reportingCurrency:
                item?.reporting_currency ?? null,

            conversionRateToAed:
                item?.conversion_rate_to_aed ?? null,
        };
    });
};

/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

function CustomTooltip({
    active,
    payload,
    label,
    reportingCurrency = "AED",
    displayUnit = "AED",
}) {
    if (
        !active ||
        !payload ||
        !payload.length
    ) {
        return null;
    }

    const row = payload[0]?.payload || {};

    const getDisplayValue = (dataKey) => {
        if (dataKey === "actual") {
            return row.actual;
        }

        if (dataKey === "target") {
            return row.target;
        }

        return null;
    };

    const formatDisplayValue = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        const numericValue = Number(value);

        if (Number.isNaN(numericValue)) {
            return "—";
        }

        if (displayUnit === "AED_MILLIONS") {
            const millions = numericValue;

            if (Math.abs(millions) >= 100) {
                return `${reportingCurrency} ${millions.toFixed(0)}M`;
            }

            if (Math.abs(millions) >= 10) {
                return `${reportingCurrency} ${millions.toFixed(1)}M`;
            }

            return `${reportingCurrency} ${millions.toFixed(2)}M`;
        }

        return `${reportingCurrency} ${numericValue.toLocaleString(
            "en-US",
            {
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
            }
        )}`;
    };

    return (
        <div
            style={{
                minWidth: 225,
                background:
                    "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
                border: "1px solid rgba(148,163,184,0.30)",
                borderRadius: 12,
                padding: "11px 13px",
                boxShadow:
                    "0 14px 34px rgba(15,23,42,0.16), 0 2px 8px rgba(79,70,229,0.08)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",

                /* SUBTLE TOOLTIP EFFECT */
                transform: "translateY(-2px)",
                transition:
                    "opacity 160ms ease, transform 160ms ease",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 9,
                }}
            >
                <div
                    style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#0F172A",
                        lineHeight: 1.25,
                    }}
                >
                    {label}
                </div>
            </div>

            <div
                style={{
                    height: 1,
                    background: "#E2E8F0",
                    marginBottom: 7,
                }}
            />

            {payload.map((item) => {
                const backendValue =
                    getDisplayValue(item?.dataKey);

                const itemColor =
                    item?.dataKey === "actual"
                        ? "#DC2626"
                        : "#2563EB";

                return (
                    <div
                        key={item.dataKey}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 18,
                            marginTop: 7,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                minWidth: 0,
                            }}
                        >
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: itemColor,

                                    /* SUBTLE DOT GLOW */
                                    boxShadow: `0 0 0 3px ${itemColor}18, 0 0 8px ${itemColor}45`,

                                    flex: "0 0 auto",
                                }}
                            />

                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: itemColor,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {item.name}
                            </span>
                        </div>

                        <span
                            style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: itemColor,
                                whiteSpace: "nowrap",
                                fontVariantNumeric:
                                    "tabular-nums",
                            }}
                        >
                            {formatDisplayValue(
                                backendValue
                            )}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/* =========================================================
   CUSTOM Y AXIS LABEL
========================================================= */

function CustomYAxisTick({
    x,
    y,
    payload,
    hoveredCategory = null,
}) {
    const text = payload.value;

    return (
        <g
            transform={`translate(${x},${y})`}
        >
            <text
                x={-165}
                y={0}
                textAnchor="start"
                dominantBaseline="middle"
                fill={
                    hoveredCategory === text
                        ? "#4F46E5"
                        : "#1E293B"
                }
                fontSize={12}
                fontWeight={
                    hoveredCategory === text
                        ? 800
                        : 700
                }
                style={{
                    transition:
                        "fill 180ms ease, font-weight 180ms ease",
                }}
            >
                {text}
            </text>
        </g>
    );
}

/* =========================================================
   CUSTOM BAR LABEL
========================================================= */

function formatBarValue(value, displayUnit = "AED") {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    const number = Number(value);

    if (displayUnit === "AED_MILLIONS") {
        if (Math.abs(number) >= 100) {
            return `${number.toFixed(0)}M`;
        }

        if (Math.abs(number) >= 10) {
            return `${number.toFixed(1)}M`;
        }

        return `${number.toFixed(2)}M`;
    }

    return number.toLocaleString("en-US", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });
}

/* =========================================================
   ACTUAL BAR LABEL
========================================================= */

function ActualBarLabel({
    x,
    y,
    width,
    value,
    displayUnit = "AED",
}) {
    const formatted = formatBarValue(
        value,
        displayUnit
    );

    if (formatted === "—") {
        return null;
    }

    return (
        <text
            x={x + width + 6}
            y={y + 6}
            fill="#334155"
            fontSize={10}
            fontWeight={800}
            textAnchor="start"
            dominantBaseline="middle"
            style={{
                fontVariantNumeric: "tabular-nums",
            }}
        >
            {formatted}
        </text>
    );
}

/* =========================================================
   TARGET BAR LABEL
========================================================= */

function TargetBarLabel({
    x,
    y,
    width,
    value,
    displayUnit = "AED",
}) {
    const formatted = formatBarValue(
        value,
        displayUnit
    );

    if (formatted === "—") {
        return null;
    }

    return (
        <text
            x={x + width + 6}
            y={y + 6}
            fill="#64748B"
            fontSize={10}
            fontWeight={800}
            textAnchor="start"
            dominantBaseline="middle"
            style={{
                fontVariantNumeric: "tabular-nums",
            }}
        >
            {formatted}
        </text>
    );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ActualVsTargetChart({
    data = [],
    total,
    activeFilters,
    reportingCurrency = "AED",
    onDrillDown,
    onViewAll,
    onExportExcel,
    onExportPdf,
    exporting = "",
}) {
    /* =======================================================
       MENU STATE
    ======================================================= */

    const [menuOpen, setMenuOpen] = useState(false);
    const [displayUnit, setDisplayUnit] = useState("AED");
    const [hoveredBar, setHoveredBar] = useState(null);
    const [hoveredCategory, setHoveredCategory] =
        useState(null);

    const menuRef = useRef(null);

    /* =======================================================
       CLOSE MENU WHEN CLICKING OUTSIDE
    ======================================================= */

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener(
                "mousedown",
                handleOutsideClick
            );
        }

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, [menuOpen]);

    /* =======================================================
       MENU HANDLERS
    ======================================================= */

    const handleViewAll = async () => {
        setMenuOpen(false);

        if (typeof onViewAll === "function") {
            await onViewAll(chartData);
        }
    };

    const handleExportExcel = async () => {
        setMenuOpen(false);

        if (typeof onExportExcel === "function") {
            await onExportExcel();
        }
    };

    const handleExportPdf = async () => {
        setMenuOpen(false);

        if (typeof onExportPdf === "function") {
            await onExportPdf();
        }
    };

    /* =======================================================
       COMMON EXPORT HANDLER
    ======================================================= */

    const handleExport = async (type) => {
        if (type === "excel") {
            await handleExportExcel();
            return;
        }

        if (type === "pdf") {
            await handleExportPdf();
        }
    };

    /* =======================================================
       EXPORTING STATE FOR COMMON COMPONENT
    ======================================================= */

    const commonExporting =
        exporting === "composition-excel"
            ? "excel"
            : exporting === "composition-pdf"
                ? "pdf"
                : "";

    /* =======================================================
       NORMALIZED DATA
    ======================================================= */

    const chartData = useMemo(
        () => normalizeChartData(data),
        [data]
    );

    const displayChartData = useMemo(() => {
        const divisor =
            displayUnit === "AED_MILLIONS"
                ? 1000000
                : 1;

        return chartData.map((item) => ({
            ...item,
            actual:
                item.actual === null ||
                    item.actual === undefined
                    ? item.actual
                    : item.actual / divisor,
            target:
                item.target === null ||
                    item.target === undefined
                    ? item.target
                    : item.target / divisor,
        }));
    }, [chartData, displayUnit]);

    /* =======================================================
       X AXIS MAXIMUM
    ======================================================= */

    const xAxisMax = useMemo(() => {
        const values = displayChartData
            .flatMap((item) => [
                item.actual,
                item.target,
            ])
            .filter(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    !Number.isNaN(value)
            );

        if (!values.length) {
            return displayUnit === "AED_MILLIONS"
                ? 1
                : 1000;
        }

        const maxValue = Math.max(...values);
        const calculatedMax = maxValue * 1.2;

        if (displayUnit === "AED_MILLIONS") {
            if (calculatedMax <= 1) return 1;
            if (calculatedMax <= 5) return 5;
            if (calculatedMax <= 10) return 10;
            if (calculatedMax <= 25) return 25;
            if (calculatedMax <= 50) return 50;
            if (calculatedMax <= 100) return 100;
            if (calculatedMax <= 250) return 250;
            if (calculatedMax <= 500) return 500;
            if (calculatedMax <= 1000) return 1000;

            return (
                Math.ceil(calculatedMax / 1000) * 1000
            );
        }

        if (calculatedMax <= 1000) return 1000;
        if (calculatedMax <= 5000) return 5000;
        if (calculatedMax <= 10000) return 10000;
        if (calculatedMax <= 25000) return 25000;
        if (calculatedMax <= 50000) return 50000;
        if (calculatedMax <= 100000) return 100000;
        if (calculatedMax <= 250000) return 250000;
        if (calculatedMax <= 500000) return 500000;
        if (calculatedMax <= 1000000) return 1000000;

        return (
            Math.ceil(
                calculatedMax / 1000000
            ) * 1000000
        );
    }, [displayChartData, displayUnit]);

    /* =======================================================
       X AXIS TICK FORMAT
    ======================================================= */

    const formatXAxis = (value) => {
        if (
            value === null ||
            value === undefined ||
            Number.isNaN(Number(value))
        ) {
            return "";
        }

        const number = Number(value);

        if (displayUnit === "AED_MILLIONS") {
            if (number === 0) return "0M";
            if (Math.abs(number) >= 100) {
                return `${number.toFixed(0)}M`;
            }
            if (Math.abs(number) >= 10) {
                return `${number.toFixed(1)}M`;
            }
            return `${number.toFixed(2)}M`;
        }

        return number.toLocaleString("en-US", {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
        });
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minHeight: 275,
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                padding: "12px 12px 8px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",

                /* =================================================
                   SUBTLE CARD EFFECT
                ================================================= */
                transition:
                    "box-shadow 220ms ease, border-color 220ms ease",
            }}
            onMouseEnter={(event) => {
                event.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(15,23,42,0.08)";
                event.currentTarget.style.borderColor =
                    "#D7DCE5";
            }}
            onMouseLeave={(event) => {
                event.currentTarget.style.boxShadow =
                    "none";
                event.currentTarget.style.borderColor =
                    "#E5E7EB";
            }}
        >
            {/* HEADER */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "space-between",
                    marginBottom: 2,
                    position: "relative",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        minWidth: 0,
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontSize: 13,
                            lineHeight: "18px",
                            fontWeight: 700,
                            color: "#0F172A",
                        }}
                    >
                        Actual vs Target by Expense Category
                    </h3>

                    <div
                        style={{
                            fontSize: 10,
                            lineHeight: "15px",
                            fontWeight: 500,
                            color: "#64748B",
                        }}
                    >
                        Compare actual PTD costs against target PTD by expense category
                    </div>
                </div>

                {/* AED / AED MILLIONS TOGGLE */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        marginLeft: "auto",
                        marginRight: 8,
                        padding: 2,
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 7,
                        boxSizing: "border-box",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setDisplayUnit("AED")}
                        aria-pressed={displayUnit === "AED"}
                        style={{
                            border: "none",

                            // Selected = purple
                            background:
                                displayUnit === "AED"
                                    ? "#5B3FE4"
                                    : "#FFFFFF",

                            // Selected = white text
                            color:
                                displayUnit === "AED"
                                    ? "#FFFFFF"
                                    : "#173B8F",

                            padding: "5px 12px",
                            borderRadius: 5,
                            fontSize: 10,
                            lineHeight: "14px",
                            fontWeight: 800,
                            cursor: "pointer",

                            boxShadow: "none",

                            transition:
                                "background 140ms ease, color 140ms ease",

                            whiteSpace: "nowrap",
                        }}
                    >
                        AED
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setDisplayUnit("AED_MILLIONS")
                        }
                        aria-pressed={
                            displayUnit === "AED_MILLIONS"
                        }
                        style={{
                            border: "none",

                            // Selected = purple
                            background:
                                displayUnit === "AED_MILLIONS"
                                    ? "#5B3FE4"
                                    : "#FFFFFF",

                            // Selected = white text
                            color:
                                displayUnit === "AED_MILLIONS"
                                    ? "#FFFFFF"
                                    : "#173B8F",

                            padding: "5px 12px",
                            borderRadius: 5,
                            fontSize: 10,
                            lineHeight: "14px",
                            fontWeight: 800,
                            cursor: "pointer",

                            boxShadow: "none",

                            transition:
                                "background 140ms ease, color 140ms ease",

                            whiteSpace: "nowrap",
                        }}
                    >
                        AED Millions
                    </button>
                </div>

                {/* THREE DOT MENU */}

                <div
                    ref={menuRef}
                    style={{
                        position: "relative",
                    }}
                >
                    <button
                        type="button"
                        onClick={() =>
                            setMenuOpen(
                                (prev) => !prev
                            )
                        }
                        aria-label="Chart options"
                        aria-expanded={menuOpen}
                        style={{
                            border: "none",
                            background:
                                "transparent",
                            padding: "4px",
                            cursor: "pointer",
                            color: "#64748B",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 5,
                            transition:
                                "background 160ms ease, color 160ms ease, transform 160ms ease",
                        }}
                        onMouseEnter={(event) => {
                            event.currentTarget.style.background =
                                "#F1F5F9";
                            event.currentTarget.style.color =
                                "#334155";
                            event.currentTarget.style.transform =
                                "scale(1.05)";
                        }}
                        onMouseLeave={(event) => {
                            event.currentTarget.style.background =
                                "transparent";
                            event.currentTarget.style.color =
                                "#64748B";
                            event.currentTarget.style.transform =
                                "scale(1)";
                        }}
                    >
                        <MoreVertical
                            size={17}
                            strokeWidth={2}
                        />
                    </button>

                    {/* ACTION MENU */}

                    {menuOpen && (
                        <div
                            style={{
                                position: "absolute",
                                top: 28,
                                right: 0,
                                minWidth: 165,
                                background: "#FFFFFF",
                                border: "1px solid #E5E7EB",
                                borderRadius: 8,
                                boxShadow:
                                    "0 8px 24px rgba(15, 23, 42, 0.12)",
                                padding: "5px 0",
                                zIndex: 100,
                            }}
                        >
                            {/* VIEW ALL */}

                            <button
                                type="button"
                                onClick={
                                    handleViewAll
                                }
                                disabled={
                                    !onViewAll
                                }
                                style={{
                                    width: "100%",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: 9,
                                    border:
                                        "none",
                                    background:
                                        "transparent",
                                    padding:
                                        "9px 12px",
                                    cursor:
                                        onViewAll
                                            ? "pointer"
                                            : "not-allowed",
                                    textAlign:
                                        "left",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                    opacity:
                                        onViewAll
                                            ? 1
                                            : 0.5,
                                    transition:
                                        "background 140ms ease",
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    if (onViewAll) {
                                        event.currentTarget.style.background =
                                            "#F8FAFC";
                                    }
                                }}
                                onMouseLeave={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "transparent";
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 14,
                                    }}
                                >
                                    🔍
                                </span>

                                <span>
                                    View All
                                </span>
                            </button>

                            {/* EXPORT EXCEL */}

                            <button
                                type="button"
                                onClick={
                                    handleExportExcel
                                }
                                disabled={
                                    commonExporting ===
                                    "excel"
                                }
                                style={{
                                    width: "100%",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: 9,
                                    border:
                                        "none",
                                    background:
                                        "transparent",
                                    padding:
                                        "9px 12px",
                                    cursor:
                                        commonExporting ===
                                            "excel"
                                            ? "not-allowed"
                                            : "pointer",
                                    textAlign:
                                        "left",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                    opacity:
                                        commonExporting ===
                                            "excel"
                                            ? 0.6
                                            : 1,
                                    transition:
                                        "background 140ms ease",
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    if (
                                        commonExporting !==
                                        "excel"
                                    ) {
                                        event.currentTarget.style.background =
                                            "#F8FAFC";
                                    }
                                }}
                                onMouseLeave={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "transparent";
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 14,
                                    }}
                                >
                                    📊
                                </span>

                                <span>
                                    Export Excel
                                </span>
                            </button>

                            {/* EXPORT PDF */}

                            <button
                                type="button"
                                onClick={
                                    handleExportPdf
                                }
                                disabled={
                                    commonExporting ===
                                    "pdf"
                                }
                                style={{
                                    width: "100%",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: 9,
                                    border:
                                        "none",
                                    background:
                                        "transparent",
                                    padding:
                                        "9px 12px",
                                    cursor:
                                        commonExporting ===
                                            "pdf"
                                            ? "not-allowed"
                                            : "pointer",
                                    textAlign:
                                        "left",
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color:
                                        "#334155",
                                    opacity:
                                        commonExporting ===
                                            "pdf"
                                            ? 0.6
                                            : 1,
                                    transition:
                                        "background 140ms ease",
                                }}
                                onMouseEnter={(
                                    event
                                ) => {
                                    if (
                                        commonExporting !==
                                        "pdf"
                                    ) {
                                        event.currentTarget.style.background =
                                            "#F8FAFC";
                                    }
                                }}
                                onMouseLeave={(
                                    event
                                ) => {
                                    event.currentTarget.style.background =
                                        "transparent";
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 14,
                                    }}
                                >
                                    📄
                                </span>

                                <span>
                                    Export PDF
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* CHART */}

            <div
                style={{
                    flex: 1,
                    minHeight: Math.max(
                        235,
                        chartData.length * 55
                    ),
                    width: "100%",
                }}
            >
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <BarChart
                        data={displayChartData}
                        layout="vertical"
                        margin={{
                            top: 20,
                            right: 58,
                            left: 25,
                            bottom: 20,
                        }}
                        barGap={3}
                        barCategoryGap="18%"
                        onMouseLeave={() => {
                            setHoveredBar(null);
                            setHoveredCategory(null);
                        }}
                    >
                        <defs>

                            {/* =================================================
                               SPENT / ACTUAL RED GRADIENT
                            ================================================= */}

                            <linearGradient
                                id="actualVsTargetActualGradient"
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="0"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#B91C1C"
                                />

                                <stop
                                    offset="55%"
                                    stopColor="#DC2626"
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#F87171"
                                />
                            </linearGradient>

                            {/* =================================================
                               TARGET BLUE GRADIENT
                            ================================================= */}

                            <linearGradient
                                id="actualVsTargetTargetGradient"
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="0"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#1D4ED8"
                                />

                                <stop
                                    offset="55%"
                                    stopColor="#2563EB"
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#60A5FA"
                                />
                            </linearGradient>

                            {/* =================================================
                               SPENT / ACTUAL RED HOVER GLOW
                            ================================================= */}

                            <filter
                                id="actualVsTargetActualGlow"
                                x="-30%"
                                y="-100%"
                                width="180%"
                                height="300%"
                            >
                                <feDropShadow
                                    dx="0"
                                    dy="2"
                                    stdDeviation="4"
                                    floodColor="#DC2626"
                                    floodOpacity="0.48"
                                />

                                <feDropShadow
                                    dx="0"
                                    dy="0"
                                    stdDeviation="1.5"
                                    floodColor="#F87171"
                                    floodOpacity="0.35"
                                />
                            </filter>

                            {/* =================================================
                               TARGET BLUE HOVER GLOW
                            ================================================= */}

                            <filter
                                id="actualVsTargetTargetGlow"
                                x="-30%"
                                y="-100%"
                                width="180%"
                                height="300%"
                            >
                                <feDropShadow
                                    dx="0"
                                    dy="2"
                                    stdDeviation="4"
                                    floodColor="#2563EB"
                                    floodOpacity="0.42"
                                />

                                <feDropShadow
                                    dx="0"
                                    dy="0"
                                    stdDeviation="1.5"
                                    floodColor="#60A5FA"
                                    floodOpacity="0.30"
                                />
                            </filter>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke="#E5E7EB"
                        />

                        {/* X AXIS */}

                        <XAxis
                            type="number"
                            domain={[
                                0,
                                xAxisMax,
                            ]}
                            axisLine={{
                                stroke: "#CBD5E1",
                            }}
                            tickLine={false}
                            tick={{
                                fill: "#475569",
                                fontSize: 11,
                                fontWeight: 700,
                            }}
                            tickFormatter={
                                formatXAxis
                            }
                        />

                        {/* Y AXIS */}

                        <YAxis
                            type="category"
                            dataKey="category"
                            width={175}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            tick={
                                <CustomYAxisTick
                                    hoveredCategory={
                                        hoveredCategory
                                    }
                                />
                            }
                        />

                        {/* TOOLTIP */}

                        <Tooltip
                            content={
                                <CustomTooltip
                                    reportingCurrency={
                                        reportingCurrency
                                    }
                                />
                            }
                            cursor={{
                                fill:
                                    "rgba(37,99,235,0.055)",
                                stroke:
                                    "rgba(37,99,235,0.20)",
                                strokeWidth: 1,
                            }}
                        />

                        {/* LEGEND */}

                        <Legend
                            verticalAlign="top"
                            align="center"
                            height={27}
                            iconType="square"
                            iconSize={8}
                            wrapperStyle={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#334155",
                                paddingLeft: 125,
                                paddingBottom: 2,
                            }}
                        />

                        {/* =================================================
                           SPENT / ACTUAL
                        ================================================= */}

                        <Bar
                            dataKey="actual"
                            name={`Actual PTD (${reportingCurrency})`}
                            fill="url(#actualVsTargetActualGradient)"
                            radius={[
                                0,
                                6,
                                6,
                                0,
                            ]}
                            barSize={12}
                            maxBarSize={12}

                            /* SMOOTH ENTRANCE EFFECT */
                            animationDuration={1100}
                            animationBegin={80}
                            animationEasing="ease-out"

                            label={
                                <ActualBarLabel
                                    displayUnit={
                                        displayUnit
                                    }
                                />
                            }

                            onMouseEnter={(
                                data,
                                index
                            ) => {
                                setHoveredBar(
                                    `${index}-actual`
                                );

                                setHoveredCategory(
                                    chartData[index]
                                        ?.category ??
                                    null
                                );
                            }}

                            onMouseLeave={() => {
                                setHoveredBar(null);
                                setHoveredCategory(null);
                            }}
                        >
                            {chartData.map(
                                (_, index) => (
                                    <Cell
                                        key={`actual-cell-${index}`}
                                        fill="url(#actualVsTargetActualGradient)"

                                        /* SMOOTH HOVER FADE */
                                        opacity={
                                            hoveredBar &&
                                                hoveredBar !==
                                                `${index}-actual` &&
                                                hoveredBar !==
                                                `${index}-target`
                                                ? 0.20
                                                : 1
                                        }

                                        style={{
                                            filter:
                                                hoveredBar ===
                                                    `${index}-actual`
                                                    ? "url(#actualVsTargetActualGlow)"
                                                    : "none",

                                            transition:
                                                "opacity 240ms ease, filter 240ms ease",
                                        }}
                                    />
                                )
                            )}
                        </Bar>

                        {/* =================================================
                           TARGET
                        ================================================= */}

                        <Bar
                            dataKey="target"
                            name={`Target PTD (${reportingCurrency})`}
                            fill="url(#actualVsTargetTargetGradient)"
                            radius={[
                                0,
                                6,
                                6,
                                0,
                            ]}
                            barSize={12}
                            maxBarSize={12}

                            /* SMOOTH ENTRANCE EFFECT */
                            animationDuration={1250}
                            animationBegin={180}
                            animationEasing="ease-out"

                            label={
                                <TargetBarLabel
                                    displayUnit={
                                        displayUnit
                                    }
                                />
                            }

                            onMouseEnter={(
                                data,
                                index
                            ) => {
                                setHoveredBar(
                                    `${index}-target`
                                );

                                setHoveredCategory(
                                    chartData[index]
                                        ?.category ??
                                    null
                                );
                            }}

                            onMouseLeave={() => {
                                setHoveredBar(null);
                                setHoveredCategory(null);
                            }}
                        >
                            {chartData.map(
                                (_, index) => (
                                    <Cell
                                        key={`target-cell-${index}`}
                                        fill="url(#actualVsTargetTargetGradient)"

                                        /* SMOOTH HOVER FADE */
                                        opacity={
                                            hoveredBar &&
                                                hoveredBar !==
                                                `${index}-actual` &&
                                                hoveredBar !==
                                                `${index}-target`
                                                ? 0.20
                                                : 1
                                        }

                                        style={{
                                            filter:
                                                hoveredBar ===
                                                    `${index}-target`
                                                    ? "url(#actualVsTargetTargetGlow)"
                                                    : "none",

                                            transition:
                                                "opacity 240ms ease, filter 240ms ease",
                                        }}
                                    />
                                )
                            )}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* X AXIS TITLE */}

            <div
                style={{
                    textAlign: "center",
                    fontWeight: 800,
                    fontSize: 11,
                    color: "#334155",
                    marginTop: -2,
                }}
            >
                Amount (
                {displayUnit === "AED_MILLIONS"
                    ? "AED Millions"
                    : reportingCurrency}
                )
            </div>
        </div>
    );
}