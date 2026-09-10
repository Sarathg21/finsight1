

// import React, {
//     useEffect,
//     useRef,
//     useState,
// } from "react";

// import { createPortal } from "react-dom";

// import {
//     ResponsiveContainer,
//     PieChart,
//     Pie,
//     Cell,
//     Tooltip,
// } from "recharts";

// import {
//     Eye,
//     MoreVertical,
// } from "lucide-react";

// import ExportButtons from "../Common/ExportButtons";


// /* ========================================================= 
//    COLORS 
// ========================================================= */

// const COLORS = [
//     "#5B3FE4",
//     "#4E9A51",
//     "#E87920",
//     "#3478B9",
//     "#3FAFC1",
//     "#C24E9A",
// ];


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

//     const millions = number / 1000000;

//     return `${millions.toLocaleString("en-US", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     })}M`;
// };


// /* ========================================================= 
//    TOOLTIP FULL AMOUNT FORMAT 
//    ONLY USED INSIDE HOVER TOOLTIP 
// ========================================================= */

// const formatTooltipAmount = (value) => {
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
//         maximumFractionDigits: 2,
//     });
// };


// /* ========================================================= 
//    CUSTOM TOOLTIP 
// ========================================================= */

// function CustomTooltip({
//     active,
//     payload,
//     reportingCurrency = "AED",
//     total = null,
// }) {
//     if (
//         !active ||
//         !payload ||
//         !payload.length
//     ) {
//         return null;
//     }

//     const item = payload[0];

//     return (
//         <div
//             style={{
//                 width: 190,
//                 minHeight: "auto",
//                 background: "#FFFFFF",
//                 border: "1px solid #E5E7EB",
//                 borderRadius: 10,
//                 padding: "10px 12px",
//                 boxSizing: "border-box",
//                 boxShadow:
//                     "0 8px 20px rgba(15, 23, 42, 0.12)",
//                 pointerEvents: "none",
//             }}
//         >

//             {/* ================================================= 
//                 CATEGORY TITLE 
//             ================================================= */}

//             <div
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 7,
//                     marginBottom: 10,
//                     minWidth: 0,
//                 }}
//             >

//                 <span
//                     style={{
//                         width: 8,
//                         height: 8,
//                         minWidth: 8,
//                         borderRadius: 3,
//                         background:
//                             item?.payload?.fill ||
//                             item?.color ||
//                             "#5B3FE4",
//                         display: "inline-block",
//                     }}
//                 />

//                 <span
//                     style={{
//                         fontSize: 12,
//                         lineHeight: "15px",
//                         fontWeight: 800,
//                         color: "#111827",
//                         whiteSpace: "nowrap",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                     }}
//                     title={item.name}
//                 >
//                     {item.name}
//                 </span>

//             </div>


//             {/* ================================================= 
//                 AMOUNT 
//             ================================================= */}

//             <div
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     gap: 10,
//                     marginBottom: 7,
//                 }}
//             >

//                 <span
//                     style={{
//                         fontSize: 11,
//                         fontWeight: 800,
//                         color: "#64748B",
//                     }}
//                 >
//                     Amount
//                 </span>

//                 <span
//                     style={{
//                         fontSize: 14,
//                         fontWeight: 800,
//                         color: "#0F172A",
//                         textAlign: "right",
//                         whiteSpace: "nowrap",
//                     }}
//                 >
//                     {formatTooltipAmount(item.value) === "—"
//                         ? "—"
//                         : `${reportingCurrency} ${formatTooltipAmount(
//                             item.value
//                         )}`}
//                 </span>

//             </div>



//             <div
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     gap: 10,
//                 }}
//             >

//                 <span
//                     style={{
//                         fontSize: 11,
//                         fontWeight: 800,
//                         color: "#64748B",
//                     }}
//                 >
//                     Percentage
//                 </span>

//                 <span
//                     style={{
//                         fontSize: 14,
//                         fontWeight: 800,
//                         color: "#0F172A",
//                         textAlign: "right",
//                         whiteSpace: "nowrap",
//                     }}
//                 >
//                     {item.payload?.percentage === null ||
//                         item.payload?.percentage === undefined
//                         ? "—"
//                         : `${item.payload.percentage}%`}
//                 </span>

//             </div>

//         </div>
//     );
// }


// /* ========================================================= 
//    CUSTOM DONUT LABEL 
//    KEPT UNCHANGED 
//    NO LONGER DISPLAYED ON PIE 
// ========================================================= */

// function renderCustomLabel({
//     cx,
//     cy,
//     midAngle,
//     innerRadius,
//     outerRadius,
//     percentage,
// }) {
//     if (
//         percentage === null ||
//         percentage === undefined
//     ) {
//         return null;
//     }

//     const RADIAN = Math.PI / 180;

//     const radius =
//         innerRadius +
//         (outerRadius - innerRadius) * 0.55;

//     const x =
//         cx +
//         radius *
//         Math.cos(-midAngle * RADIAN);

//     const y =
//         cy +
//         radius *
//         Math.sin(-midAngle * RADIAN);

//     return (
//         <text
//             x={x}
//             y={y}
//             fill="#FFFFFF"
//             textAnchor="middle"
//             dominantBaseline="central"
//             fontSize={10}
//             fontWeight={800}
//         >
//             {percentage}%
//         </text>
//     );
// }


// /* ========================================================= 
//    MAIN COMPONENT 
// ========================================================= */

// export default function OpexCompositionChart({
//     data = [],
//     total = null,

//     /* ===================================================== 
//        ACTIVE OPEX FILTERS 
//     ===================================================== */

//     activeFilters = {},

//     /* ===================================================== 
//        REPORTING CURRENCY 
//     ===================================================== */

//     reportingCurrency = "AED",

//     /* ===================================================== 
//        EXISTING DRILL-DOWN HANDLER 
//     ===================================================== */

//     onDrillDown,

//     /* ===================================================== 
//        VIEW ALL / EXPORT HANDLERS 
//     ===================================================== */

//     onViewAll,
//     onExportPdf,
//     onExportExcel,

//     /* ===================================================== 
//        EXPORTING STATE 
//     ===================================================== */

//     exporting = "",
// }) {
//     /* ===================================================== 
//        MENU STATE 
//     ===================================================== */

//     const [menuOpen, setMenuOpen] = useState(false);

//     const menuButtonRef = useRef(null);
//     const menuRef = useRef(null);

//     const [menuPosition, setMenuPosition] = useState({
//         top: 0,
//         right: 0,
//     });


//     /* ===================================================== 
//        PIE HOVER STATE 
//        ONLY FOR HOVER FADE EFFECT 
//     ===================================================== */

//     const [activePieIndex, setActivePieIndex] =
//         useState(null);


//     /* ===================================================== 
//        POSITION DROPDOWN 
//     ===================================================== */

//     const updateMenuPosition = () => {
//         if (!menuButtonRef.current) {
//             return;
//         }

//         const rect =
//             menuButtonRef.current.getBoundingClientRect();

//         setMenuPosition({
//             top: rect.bottom + 5,
//             right:
//                 window.innerWidth -
//                 rect.right,
//         });
//     };


//     /* ===================================================== 
//        OPEN / CLOSE MENU 
//     ===================================================== */

//     const toggleMenu = () => {
//         setMenuOpen((prev) => {
//             const next = !prev;

//             if (next) {
//                 requestAnimationFrame(() => {
//                     updateMenuPosition();
//                 });
//             }

//             return next;
//         });
//     };


//     /* ===================================================== 
//        KEEP MENU POSITION CORRECT 
//     ===================================================== */

//     useEffect(() => {
//         if (!menuOpen) {
//             return;
//         }

//         const handlePositionUpdate = () => {
//             updateMenuPosition();
//         };

//         window.addEventListener(
//             "resize",
//             handlePositionUpdate
//         );

//         window.addEventListener(
//             "scroll",
//             handlePositionUpdate,
//             true
//         );

//         return () => {
//             window.removeEventListener(
//                 "resize",
//                 handlePositionUpdate
//             );

//             window.removeEventListener(
//                 "scroll",
//                 handlePositionUpdate,
//                 true
//             );
//         };
//     }, [menuOpen]);


//     /* ===================================================== 
//        CLOSE MENU WHEN CLICKING OUTSIDE 
//     ===================================================== */

//     useEffect(() => {
//         if (!menuOpen) {
//             return;
//         }

//         const handleClickOutside = (event) => {
//             const clickedButton =
//                 menuButtonRef.current?.contains(
//                     event.target
//                 );

//             const clickedMenu =
//                 menuRef.current?.contains(
//                     event.target
//                 );

//             if (
//                 !clickedButton &&
//                 !clickedMenu
//             ) {
//                 setMenuOpen(false);
//             }
//         };

//         document.addEventListener(
//             "mousedown",
//             handleClickOutside
//         );

//         return () => {
//             document.removeEventListener(
//                 "mousedown",
//                 handleClickOutside
//             );
//         };
//     }, [menuOpen]);


//     /* ===================================================== 
//        FINAL REPORTING CURRENCY 
//     ===================================================== */

//     const selectedReportingCurrency =
//         activeFilters?.reporting_currency ||
//         reportingCurrency ||
//         "AED";


//     /* ===================================================== 
//        SAME FILTER CONTEXT FOR ALL ACTIONS 
//     ===================================================== */

//     const filterContext = {
//         ...activeFilters,

//         reporting_currency:
//             selectedReportingCurrency,
//     };


//     /* ===================================================== 
//        VIEW ALL 
//     ===================================================== */

//     const handleViewAll = () => {
//         setMenuOpen(false);

//         if (typeof onViewAll === "function") {
//             onViewAll({
//                 filters: filterContext,
//                 data,
//                 total,
//             });
//         }
//     };


//     /* ===================================================== 
//        PDF EXPORT 
//     ===================================================== */

//     const handleExportPdf = async () => {
//         setMenuOpen(false);

//         if (
//             typeof onExportPdf ===
//             "function"
//         ) {
//             await onExportPdf({
//                 filters: filterContext,
//                 data,
//                 total,
//             });
//         }
//     };


//     /* ===================================================== 
//        EXCEL EXPORT 
//     ===================================================== */

//     const handleExportExcel = async () => {
//         setMenuOpen(false);

//         if (
//             typeof onExportExcel ===
//             "function"
//         ) {
//             await onExportExcel({
//                 filters: filterContext,
//                 data,
//                 total,
//             });
//         }
//     };


//     /* ===================================================== 
//        COMMON EXPORT BUTTON HANDLER 
//     ===================================================== */

//     const handleCommonExport = async (type) => {
//         if (type === "excel") {
//             await handleExportExcel();
//             return;
//         }

//         if (type === "pdf") {
//             await handleExportPdf();
//         }
//     };


//     /* ===================================================== 
//        NORMALIZE EXPORTING STATE 
//     ===================================================== */

//     const commonExporting =
//         exporting === "composition-excel"
//             ? "excel"
//             : exporting === "composition-pdf"
//                 ? "pdf"
//                 : exporting === "excel"
//                     ? "excel"
//                     : exporting === "pdf"
//                         ? "pdf"
//                         : "";


//     /* ===================================================== 
//        DRILL-DOWN 
//     ===================================================== */

//     const handleDrillDown = (item) => {
//         if (
//             typeof onDrillDown ===
//             "function"
//         ) {
//             onDrillDown({
//                 category: item,
//                 filters: filterContext,
//             });
//         }
//     };


//     /* ===================================================== 
//        DROPDOWN MENU 
//     ===================================================== */

//     const actionMenu =
//         menuOpen &&
//             typeof document !== "undefined"
//             ? createPortal(
//                 <div
//                     ref={menuRef}
//                     style={{
//                         position: "fixed",
//                         top: menuPosition.top,
//                         right: menuPosition.right,

//                         /* ============================== 
//                            MENU STYLE UPDATED ONLY 
//                         ============================== */

//                         minWidth: 165,

//                         background:
//                             "#FFFFFF",

//                         border:
//                             "1px solid #E5E7EB",

//                         borderRadius: 8,

//                         boxShadow:
//                             "0 8px 24px rgba(15, 23, 42, 0.12)",

//                         padding:
//                             "5px 0",

//                         zIndex: 99999,

//                         boxSizing:
//                             "border-box",
//                     }}
//                 >

//                     {/* ================================================= 
//                           VIEW ALL 
//                       ================================================= */}

//                     <button
//                         type="button"
//                         onClick={
//                             handleViewAll
//                         }
//                         disabled={
//                             !onViewAll
//                         }
//                         style={{
//                             width: "100%",
//                             display:
//                                 "flex",
//                             alignItems:
//                                 "center",
//                             gap: 9,
//                             border:
//                                 "none",
//                             background:
//                                 "transparent",
//                             padding:
//                                 "9px 12px",
//                             cursor:
//                                 onViewAll
//                                     ? "pointer"
//                                     : "not-allowed",
//                             textAlign:
//                                 "left",
//                             fontSize: 12,
//                             fontWeight: 500,
//                             color:
//                                 "#334155",
//                             opacity:
//                                 onViewAll
//                                     ? 1
//                                     : 0.5,
//                         }}
//                         onMouseEnter={(
//                             event
//                         ) => {
//                             if (onViewAll) {
//                                 event.currentTarget.style.background =
//                                     "#F8FAFC";
//                             }
//                         }}
//                         onMouseLeave={(
//                             event
//                         ) => {
//                             event.currentTarget.style.background =
//                                 "transparent";
//                         }}
//                     >
//                         <span
//                             style={{
//                                 fontSize: 14,
//                             }}
//                         >
//                             🔍
//                         </span>

//                         <span>
//                             View All
//                         </span>
//                     </button>


//                     {/* ================================================= 
//                           EXPORT EXCEL 
//                       ================================================= */}

//                     {onExportExcel && (
//                         <button
//                             type="button"
//                             onClick={
//                                 handleExportExcel
//                             }
//                             disabled={
//                                 commonExporting ===
//                                 "excel"
//                             }
//                             style={{
//                                 width: "100%",
//                                 display:
//                                     "flex",
//                                 alignItems:
//                                     "center",
//                                 gap: 9,
//                                 border:
//                                     "none",
//                                 background:
//                                     "transparent",
//                                 padding:
//                                     "9px 12px",
//                                 cursor:
//                                     commonExporting ===
//                                         "excel"
//                                         ? "not-allowed"
//                                         : "pointer",
//                                 textAlign:
//                                     "left",
//                                 fontSize: 12,
//                                 fontWeight: 500,
//                                 color:
//                                     "#334155",
//                                 opacity:
//                                     commonExporting ===
//                                         "excel"
//                                         ? 0.6
//                                         : 1,
//                             }}
//                             onMouseEnter={(
//                                 event
//                             ) => {
//                                 if (
//                                     commonExporting !==
//                                     "excel"
//                                 ) {
//                                     event.currentTarget.style.background =
//                                         "#F8FAFC";
//                                 }
//                             }}
//                             onMouseLeave={(
//                                 event
//                             ) => {
//                                 event.currentTarget.style.background =
//                                     "transparent";
//                             }}
//                         >
//                             <span
//                                 style={{
//                                     fontSize: 14,
//                                 }}
//                             >
//                                 📊
//                             </span>

//                             <span>
//                                 Export Excel
//                             </span>
//                         </button>
//                     )}


//                     {/* ================================================= 
//                           EXPORT PDF 
//                       ================================================= */}

//                     {onExportPdf && (
//                         <button
//                             type="button"
//                             onClick={
//                                 handleExportPdf
//                             }
//                             disabled={
//                                 commonExporting ===
//                                 "pdf"
//                             }
//                             style={{
//                                 width: "100%",
//                                 display:
//                                     "flex",
//                                 alignItems:
//                                     "center",
//                                 gap: 9,
//                                 border:
//                                     "none",
//                                 background:
//                                     "transparent",
//                                 padding:
//                                     "9px 12px",
//                                 cursor:
//                                     commonExporting ===
//                                         "pdf"
//                                         ? "not-allowed"
//                                         : "pointer",
//                                 textAlign:
//                                     "left",
//                                 fontSize: 12,
//                                 fontWeight: 500,
//                                 color:
//                                     "#334155",
//                                 opacity:
//                                     commonExporting ===
//                                         "pdf"
//                                         ? 0.6
//                                         : 1,
//                             }}
//                             onMouseEnter={(
//                                 event
//                             ) => {
//                                 if (
//                                     commonExporting !==
//                                     "pdf"
//                                 ) {
//                                     event.currentTarget.style.background =
//                                         "#F8FAFC";
//                                 }
//                             }}
//                             onMouseLeave={(
//                                 event
//                             ) => {
//                                 event.currentTarget.style.background =
//                                     "transparent";
//                             }}
//                         >
//                             <span
//                                 style={{
//                                     fontSize: 14,
//                                 }}
//                             >
//                                 📄
//                             </span>

//                             <span>
//                                 Export PDF
//                             </span>
//                         </button>
//                     )}

//                 </div>,
//                 document.body
//             )
//             : null;


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
//             }}
//         >

//             {/* =================================================== 
//                 HEADER 
//             =================================================== */}

//             <div
//                 style={{
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent:
//                         "space-between",
//                     marginBottom: 2,
//                 }}
//             >
//                 <h3
//                     style={{
//                         margin: 0,
//                         fontSize: 13,
//                         lineHeight: "16px",
//                         fontWeight: 800,
//                         color: "#0F172A",
//                     }}
//                 >
//                     OPEX Composition (YTD)
//                 </h3>


//                 {/* ================================================= 
//                     THREE DOT MENU BUTTON 
//                 ================================================= */}

//                 <button
//                     ref={menuButtonRef}
//                     type="button"
//                     onClick={toggleMenu}
//                     aria-label="OPEX Composition options"
//                     aria-expanded={menuOpen}
//                     style={{
//                         border: "none",
//                         background:
//                             "transparent",
//                         padding: "2px 5px",
//                         cursor: "pointer",
//                         color: "#64748B",
//                         borderRadius: 5,
//                         display: "flex",
//                         alignItems:
//                             "center",
//                         justifyContent:
//                             "center",
//                         flexShrink: 0,
//                     }}
//                 >
//                     <MoreVertical
//                         size={17}
//                         strokeWidth={2}
//                     />
//                 </button>
//             </div>


//             {/* =================================================== 
//                 PORTAL MENU 
//             =================================================== */}

//             {actionMenu}


//             {/* =================================================== 
//                 CONTENT 
//             =================================================== */}

//             <div
//                 style={{
//                     flex: 1,
//                     display: "flex",
//                     alignItems: "center",
//                     minHeight: 235,
//                     width: "100%",
//                 }}
//             >

//                 {/* ================================================= 
//                     DONUT SECTION 
//                 ================================================= */}

//                 <div
//                     style={{
//                         width: "43%",
//                         height: 220,
//                         display: "flex",
//                         alignItems:
//                             "center",
//                         justifyContent:
//                             "center",
//                         flexShrink: 0,
//                         position:
//                             "relative",
//                     }}
//                 >
//                     <ResponsiveContainer
//                         width="100%"
//                         height="100%"
//                     >
//                         <PieChart>

//                             <Pie
//                                 data={data}
//                                 dataKey="value"
//                                 nameKey="name"
//                                 cx="50%"
//                                 cy="50%"
//                                 innerRadius={55}
//                                 outerRadius={95}
//                                 paddingAngle={0}
//                                 startAngle={90}
//                                 endAngle={-270}
//                                 stroke="#FFFFFF"
//                                 strokeWidth={1}

//                                 /* ================================================= 
//                                    PIE VALUES REMOVED FROM CHART 
//                                    THEY NOW APPEAR ONLY IN TOOLTIP 
//                                 ================================================= */

//                                 labelLine={false}

//                                 /* ================================================= 
//                                    EXISTING CLICK FUNCTION - UNCHANGED 
//                                 ================================================= */

//                                 onClick={
//                                     handleDrillDown
//                                 }

//                                 /* ================================================= 
//                                    HOVER EFFECT 
//                                 ================================================= */

//                                 onMouseEnter={(
//                                     entry,
//                                     index
//                                 ) => {
//                                     setActivePieIndex(
//                                         index
//                                     );
//                                 }}

//                                 onMouseLeave={() => {
//                                     setActivePieIndex(
//                                         null
//                                     );
//                                 }}
//                             >

//                                 {data.map(
//                                     (
//                                         entry,
//                                         index
//                                     ) => (
//                                         <Cell
//                                             key={`cell-${index}`}

//                                             /* ================================================= 
//                                                SAME COLORS 
//                                             ================================================= */

//                                             fill={
//                                                 COLORS[
//                                                 index %
//                                                 COLORS.length
//                                                 ]
//                                             }

//                                             /* ================================================= 
//                                                FADE OTHER PIE SECTIONS 
//                                             ================================================= */

//                                             opacity={
//                                                 activePieIndex ===
//                                                     null ||
//                                                     activePieIndex ===
//                                                     index
//                                                     ? 1
//                                                     : 0.22
//                                             }

//                                             style={{
//                                                 transition:
//                                                     "opacity 180ms ease",
//                                             }}
//                                         />
//                                     )
//                                 )}

//                             </Pie>


//                             {/* ================================================= 
//                                 HOVER TOOLTIP 
//                             ================================================= */}

//                             <Tooltip
//                                 cursor={false}
//                                 content={
//                                     <CustomTooltip
//                                         reportingCurrency={
//                                             selectedReportingCurrency
//                                         }
//                                         total={total}
//                                     />
//                                 }
//                             />

//                         </PieChart>
//                     </ResponsiveContainer>

//                     {/* =================================================
//                        CENTER VALUE
//                        HIDDEN WHILE HOVERING PIE
//                    ================================================= */}

//                     <div
//                         style={{
//                             position: "absolute",
//                             display:
//                                 activePieIndex === null
//                                     ? "flex"
//                                     : "none",
//                             flexDirection: "column",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             pointerEvents: "none",
//                             zIndex: 2,
//                         }}
//                     >
//                         <span
//                             style={{
//                                 fontSize: 15,
//                                 fontWeight: 900,
//                                 color: "#0F172A",
//                                 lineHeight: "12px",
//                             }}
//                         >
//                             {selectedReportingCurrency}
//                         </span>

//                         <span
//                             style={{
//                                 fontSize: 16,
//                                 fontWeight: 900,
//                                 color: "#0F172A",
//                                 lineHeight: "16px",
//                             }}
//                         >
//                             {formatValue(total)}
//                         </span>
//                     </div>



//                 </div>


//                 {/* ================================================= 
//                     TABLE SECTION 
//                 ================================================= */}

//                 <div
//                     style={{
//                         width: "57%",
//                         height: "100%",
//                         display:
//                             "flex",
//                         flexDirection:
//                             "column",
//                         justifyContent:
//                             "center",
//                         paddingLeft: 5,
//                         boxSizing:
//                             "border-box",
//                     }}
//                 >

//                     {/* ================================================= 
//                         TABLE HEADER 
//                     ================================================= */}

//                     <div
//                         style={{
//                             display:
//                                 "grid",
//                             gridTemplateColumns:
//                                 "1fr 62px 50px",
//                             alignItems:
//                                 "center",
//                             borderBottom:
//                                 "1px solid #E5E7EB",
//                             paddingBottom: 6,
//                             marginBottom: 3,
//                         }}
//                     >
//                         <span
//                             style={{
//                                 fontSize: 13,
//                                 fontWeight: 800,
//                                 color: "#000000",
//                             }}
//                         >
//                             Expense Category
//                         </span>

//                         <span
//                             style={{
//                                 fontSize: 12,
//                                 fontWeight: 700,
//                                 color: "#000000",
//                                 textAlign:
//                                     "right",
//                             }}
//                         >
//                             Amount (
//                             {
//                                 selectedReportingCurrency
//                             })
//                         </span>

//                         <span
//                             style={{
//                                 fontSize: 12,
//                                 fontWeight: 700,
//                                 color: "#000000",
//                                 textAlign:
//                                     "right",
//                             }}
//                         >
//                             %
//                         </span>
//                     </div>


//                     {/* ================================================= 
//                         TABLE ROWS 
//                     ================================================= */}

//                     {data.map(
//                         (
//                             item,
//                             index
//                         ) => {
//                             const categoryColor =
//                                 COLORS[
//                                 index %
//                                 COLORS.length
//                                 ];

//                             return (
//                                 <div
//                                     key={
//                                         item.name ||
//                                         index
//                                     }
//                                     onClick={() =>
//                                         handleDrillDown(
//                                             item
//                                         )
//                                     }
//                                     style={{
//                                         display:
//                                             "grid",
//                                         gridTemplateColumns:
//                                             "1fr 62px 50px",
//                                         alignItems:
//                                             "center",
//                                         minHeight: 27,
//                                         cursor:
//                                             onDrillDown
//                                                 ? "pointer"
//                                                 : "default",
//                                     }}
//                                 >

//                                     {/* ===================================== 
//                                         EXPENSE CATEGORY 
//                                     ===================================== */}

//                                     <div
//                                         style={{
//                                             display:
//                                                 "flex",
//                                             alignItems:
//                                                 "center",
//                                             minWidth: 0,
//                                             gap: 6,
//                                         }}
//                                     >
//                                         <span
//                                             style={{
//                                                 width: 7,
//                                                 height: 7,
//                                                 minWidth: 7,
//                                                 borderRadius:
//                                                     "50%",
//                                                 backgroundColor:
//                                                     categoryColor,
//                                                 display:
//                                                     "inline-block",
//                                             }}
//                                         />

//                                         <span
//                                             style={{
//                                                 fontSize: 13,
//                                                 color: "#000000",
//                                                 fontWeight: 700,
//                                                 whiteSpace:
//                                                     "nowrap",
//                                                 overflow:
//                                                     "hidden",
//                                                 textOverflow:
//                                                     "ellipsis",
//                                             }}
//                                             title={
//                                                 item.name
//                                             }
//                                         >
//                                             {
//                                                 item.name
//                                             }
//                                         </span>
//                                     </div>


//                                     {/* ===================================== 
//                                         AMOUNT 
//                                     ===================================== */}

//                                     <span
//                                         style={{
//                                             fontSize: 12,
//                                             color:
//                                                 categoryColor,
//                                             fontWeight: 800,
//                                             textAlign:
//                                                 "right",
//                                         }}
//                                     >
//                                         {formatValue(
//                                             item.value
//                                         )}
//                                     </span>


//                                     {/* ===================================== 
//                                         PERCENTAGE 
//                                     ===================================== */}

//                                     <span
//                                         style={{
//                                             fontSize: 12,
//                                             color:
//                                                 categoryColor,
//                                             fontWeight: 800,
//                                             textAlign:
//                                                 "right",
//                                         }}
//                                     >
//                                         {item.percentage ===
//                                             null ||
//                                             item.percentage ===
//                                             undefined
//                                             ? "—"
//                                             : `(${item.percentage}%)`}
//                                     </span>
//                                 </div>
//                             );
//                         }
//                     )}


//                     {/* ================================================= 
//                         TOTAL 
//                     ================================================= */}

//                     <div
//                         style={{
//                             display:
//                                 "grid",
//                             gridTemplateColumns:
//                                 "1fr 62px 50px",
//                             alignItems:
//                                 "center",
//                             borderTop:
//                                 "1px solid #E5E7EB",
//                             marginTop: 4,
//                             paddingTop: 7,
//                         }}
//                     >
//                         <span
//                             style={{
//                                 fontSize: 13,
//                                 fontWeight: 800,
//                                 color: "#0F172A",
//                             }}
//                         >
//                             Total
//                         </span>

//                         <span
//                             style={{
//                                 fontSize: 11,
//                                 fontWeight: 800,
//                                 color: "#334155",
//                                 textAlign:
//                                     "right",
//                             }}
//                         >
//                             {formatValue(
//                                 total
//                             )}
//                         </span>

//                         <span
//                             style={{
//                                 fontSize: 11,
//                                 fontWeight: 800,
//                                 color: "#334155",
//                                 textAlign:
//                                     "right",
//                             }}
//                         >
//                             {total === null ||
//                                 total ===
//                                 undefined
//                                 ? "—"
//                                 : "(100%)"}
//                         </span>
//                     </div>

//                 </div>

//             </div>

//         </div>
//     );
// }


import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import { createPortal } from "react-dom";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from "recharts";

import {
    MoreVertical,
} from "lucide-react";


import ExportButtons from "../Common/ExportButtons";


/* =========================================================
   COLORS
========================================================= */

const COLORS = [
    "#5B3FE4",
    "#4E9A51",
    "#E87920",
    "#3478B9",
    "#3FAFC1",
    "#C24E9A",
];


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

    const millions = number / 1000000;

    return `${millions.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}M`;
};


/* =========================================================
   TOOLTIP FULL AMOUNT FORMAT
   ONLY USED INSIDE HOVER TOOLTIP
========================================================= */

const formatTooltipAmount = (value) => {
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
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};


/* =========================================================
   YTD VALUE RESOLVER
   ---------------------------------------------------------
   OPEX COMPOSITION MUST ALWAYS USE YTD VALUES.

   Supports the common backend field names without changing
   the existing API integration.
========================================================= */

const getYtdValue = (item) => {
    if (!item) {
        return null;
    }

    const ytdValue =
        item.actual_ytd ??
        item.actualYtd ??
        item.ytd_value ??
        item.ytdValue ??
        item.value_ytd ??
        item.valueYtd ??
        item.amount_ytd ??
        item.amountYtd ??
        item.ytd ??
        item.YTD ??
        item["Actual YTD"] ??
        item["YTD Value"] ??
        null;

    if (
        ytdValue !== null &&
        ytdValue !== undefined &&
        ytdValue !== ""
    ) {
        return ytdValue;
    }

    /*
     * Compatibility fallback:
     * If the existing parent integration has already mapped
     * the API's YTD amount into `value`, preserve that value.
     *
     * The preferred fields above always take priority.
     */
    return item.value ?? null;
};


/* =========================================================
   YTD TOTAL RESOLVER
========================================================= */

const getYtdTotal = (data, total) => {
    if (
        total !== null &&
        total !== undefined &&
        total !== ""
    ) {
        return Number(total);
    }

    if (!Array.isArray(data) || data.length === 0) {
        return 0;
    }

    return data.reduce((sum, item) => {
        const value = Number(getYtdValue(item));

        if (Number.isNaN(value)) {
            return sum;
        }

        return sum + value;
    }, 0);
};


/* =========================================================
   YTD PERCENTAGE
   ---------------------------------------------------------
   Percentage is ALWAYS calculated from YTD amount / YTD
   total so PTD percentages cannot leak into this section.
========================================================= */

const getYtdPercentage = (item, ytdTotal) => {
    const ytdValue = Number(getYtdValue(item));

    if (
        Number.isNaN(ytdValue) ||
        ytdTotal === null ||
        ytdTotal === undefined ||
        Number.isNaN(Number(ytdTotal)) ||
        Number(ytdTotal) === 0
    ) {
        return null;
    }

    return Number(
        ((ytdValue / Number(ytdTotal)) * 100).toFixed(2)
    );
};


/* =========================================================
   BUILD YTD COMPOSITION DATA
========================================================= */

const buildYtdCompositionData = (data, ytdTotal) => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data.map((item) => {
        const ytdValue = getYtdValue(item);

        const ytdPercentage = getYtdPercentage(
            item,
            ytdTotal
        );

        return {
            ...item,

            /*
             * IMPORTANT:
             * Keep `value` as the YTD value for the Pie,
             * legend and downstream View All/export handlers.
             */
            value: ytdValue,

            /*
             * Keep explicit YTD fields as well.
             */
            actual_ytd: ytdValue,
            ytd_value: ytdValue,

            /*
             * Force percentage to YTD percentage.
             */
            percentage: ytdPercentage,
            ytd_percentage: ytdPercentage,

            composition_basis: "YTD",
        };
    });
};


/* =========================================================
   CUSTOM TOOLTIP
========================================================= */

function CustomTooltip({
    active,
    payload,
    reportingCurrency = "AED",
}) {
    if (
        !active ||
        !payload ||
        !payload.length
    ) {
        return null;
    }

    const item = payload[0];

    return (
        <div
            style={{
                width: 240,
                minHeight: 120,
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                padding: "14px 16px",
                boxSizing: "border-box",
                boxShadow:
                    "0 8px 20px rgba(15, 23, 42, 0.12)",
                pointerEvents: "none",
            }}>

            {/* =================================================
                CATEGORY TITLE
            ================================================= */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 10,
                    minWidth: 0,
                }}
            >

                <span
                    style={{
                        width: 8,
                        height: 8,
                        minWidth: 8,
                        borderRadius: 3,
                        background:
                            item?.payload?.fill ||
                            item?.color ||
                            "#5B3FE4",
                        display: "inline-block",
                    }}
                />

                <span
                    style={{
                        fontSize: 12,
                        lineHeight: "15px",
                        fontWeight: 800,
                        color: "#111827",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                    title={item.name}
                >
                    {item.name}
                </span>

            </div>


            {/* =================================================
                AMOUNT
            ================================================= */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 7,
                }}
            >

                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#64748B",
                    }}
                >
                    YTD Amount
                </span>

                <span
                    style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#0F172A",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                    }}
                >
                    {formatTooltipAmount(item.value) === "—"
                        ? "—"
                        : `${reportingCurrency} ${formatTooltipAmount(
                            item.value
                        )}`}
                </span>

            </div>


            {/* =================================================
                PERCENTAGE
            ================================================= */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                }}
            >

                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#64748B",
                    }}
                >
                    YTD Percentage
                </span>

                <span
                    style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#0F172A",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                    }}
                >
                    {item.payload?.percentage === null ||
                        item.payload?.percentage === undefined
                        ? "—"
                        : `${item.payload.percentage}%`}
                </span>

            </div>

        </div>
    );
}


/* =========================================================
   CUSTOM DONUT LABEL
   KEPT UNCHANGED
   NO LONGER DISPLAYED ON PIE
========================================================= */

function renderCustomLabel({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
}) {
    if (
        percentage === null ||
        percentage === undefined
    ) {
        return null;
    }

    const RADIAN = Math.PI / 180;

    const radius =
        innerRadius +
        (outerRadius - innerRadius) * 0.55;

    const x =
        cx +
        radius *
        Math.cos(-midAngle * RADIAN);

    const y =
        cy +
        radius *
        Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="#FFFFFF"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={800}
        >
            {percentage}%
        </text>
    );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function OpexCompositionChart({
    data = [],
    total = null,

    /* =====================================================
       ACTIVE OPEX FILTERS
    ===================================================== */

    activeFilters = {},

    /* =====================================================
       REPORTING CURRENCY
    ===================================================== */

    reportingCurrency = "AED",

    /* =====================================================
       EXISTING DRILL-DOWN HANDLER
    ===================================================== */

    onDrillDown,

    /* =====================================================
       VIEW ALL / EXPORT HANDLERS
    ===================================================== */

    onViewAll,
    onExportPdf,
    onExportExcel,

    /* =====================================================
       EXPORTING STATE
    ===================================================== */

    exporting = "",
}) {

    /* =====================================================
       MENU STATE
    ===================================================== */

    const [menuOpen, setMenuOpen] = useState(false);

    const menuButtonRef = useRef(null);
    const menuRef = useRef(null);

    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        right: 0,
    });


    /* =====================================================
       PIE HOVER STATE
       ONLY FOR HOVER FADE EFFECT
    ===================================================== */

    const [activePieIndex, setActivePieIndex] =
        useState(null);


    /* =====================================================
       POSITION DROPDOWN
    ===================================================== */

    const updateMenuPosition = () => {
        if (!menuButtonRef.current) {
            return;
        }

        const rect =
            menuButtonRef.current.getBoundingClientRect();

        setMenuPosition({
            top: rect.bottom + 5,
            right:
                window.innerWidth -
                rect.right,
        });
    };


    /* =====================================================
       OPEN / CLOSE MENU
    ===================================================== */

    const toggleMenu = () => {
        setMenuOpen((prev) => {
            const next = !prev;

            if (next) {
                requestAnimationFrame(() => {
                    updateMenuPosition();
                });
            }

            return next;
        });
    };


    /* =====================================================
       KEEP MENU POSITION CORRECT
    ===================================================== */

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const handlePositionUpdate = () => {
            updateMenuPosition();
        };

        window.addEventListener(
            "resize",
            handlePositionUpdate
        );

        window.addEventListener(
            "scroll",
            handlePositionUpdate,
            true
        );

        return () => {
            window.removeEventListener(
                "resize",
                handlePositionUpdate
            );

            window.removeEventListener(
                "scroll",
                handlePositionUpdate,
                true
            );
        };
    }, [menuOpen]);


    /* =====================================================
       CLOSE MENU WHEN CLICKING OUTSIDE
    ===================================================== */

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const handleClickOutside = (event) => {
            const clickedButton =
                menuButtonRef.current?.contains(
                    event.target
                );

            const clickedMenu =
                menuRef.current?.contains(
                    event.target
                );

            if (
                !clickedButton &&
                !clickedMenu
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, [menuOpen]);


    /* =====================================================
       FINAL REPORTING CURRENCY
    ===================================================== */

    const selectedReportingCurrency =
        activeFilters?.reporting_currency ||
        reportingCurrency ||
        "AED";


    /* =====================================================
       YTD TOTAL
       -----------------------------------------------------
       Existing `total` is retained when supplied because
       the parent already provides the YTD total.
    ===================================================== */

    const ytdTotal = getYtdTotal(
        data,
        total
    );


    /* =====================================================
       YTD COMPOSITION DATA
       -----------------------------------------------------
       IMPORTANT:
       Everything in this section now uses this data:
       - donut
       - tooltip
       - legend/category amounts
       - percentages
       - View All
       - Excel
       - PDF
    ===================================================== */

    const ytdCompositionData =
        buildYtdCompositionData(
            data,
            ytdTotal
        );


    /* =====================================================
       SAME FILTER CONTEXT FOR ALL ACTIONS
    ===================================================== */

    const filterContext = {
        ...activeFilters,

        reporting_currency:
            selectedReportingCurrency,
    };


    /* =====================================================
       VIEW ALL
       -----------------------------------------------------
       Pass the YTD-normalized data so View All receives
       the same composition basis as the chart.
    ===================================================== */

    const handleViewAll = () => {
        setMenuOpen(false);

        if (typeof onViewAll === "function") {
            onViewAll({
                filters: filterContext,
                data: ytdCompositionData,
                total: ytdTotal,
            });
        }
    };


    /* =====================================================
       PDF EXPORT
       -----------------------------------------------------
       Pass the same YTD-normalized data.
    ===================================================== */

    const handleExportPdf = async () => {
        setMenuOpen(false);

        if (
            typeof onExportPdf ===
            "function"
        ) {
            await onExportPdf({
                filters: filterContext,
                data: ytdCompositionData,
                total: ytdTotal,
            });
        }
    };


    /* =====================================================
       EXCEL EXPORT
       -----------------------------------------------------
       Pass the same YTD-normalized data.
    ===================================================== */

    const handleExportExcel = async () => {
        setMenuOpen(false);

        if (
            typeof onExportExcel ===
            "function"
        ) {
            await onExportExcel({
                filters: filterContext,
                data: ytdCompositionData,
                total: ytdTotal,
            });
        }
    };


    /* =====================================================
       COMMON EXPORT BUTTON HANDLER
    ===================================================== */

    const handleCommonExport = async (type) => {
        if (type === "excel") {
            await handleExportExcel();
            return;
        }

        if (type === "pdf") {
            await handleExportPdf();
        }
    };


    /* =====================================================
       NORMALIZE EXPORTING STATE
    ===================================================== */

    const commonExporting =
        exporting === "composition-excel"
            ? "excel"
            : exporting === "composition-pdf"
                ? "pdf"
                : exporting === "excel"
                    ? "excel"
                    : exporting === "pdf"
                        ? "pdf"
                        : "";


    /* =====================================================
       DRILL-DOWN
       -----------------------------------------------------
       Existing drill-down behavior remains unchanged.
    ===================================================== */

    const handleDrillDown = (item) => {
        if (
            typeof onDrillDown ===
            "function"
        ) {
            onDrillDown({
                category: item,
                filters: filterContext,
            });
        }
    };


    /* =====================================================
       DROPDOWN MENU
    ===================================================== */

    const actionMenu =
        menuOpen &&
            typeof document !== "undefined"
            ? createPortal(
                <div
                    ref={menuRef}
                    style={{
                        position: "fixed",
                        top: menuPosition.top,
                        right: menuPosition.right,

                        minWidth: 165,

                        background:
                            "#FFFFFF",

                        border:
                            "1px solid #E5E7EB",

                        borderRadius: 8,

                        boxShadow:
                            "0 8px 24px rgba(15, 23, 42, 0.12)",

                        padding:
                            "5px 0",

                        zIndex: 99999,

                        boxSizing:
                            "border-box",
                    }}
                >

                    {/* =================================================
                          VIEW ALL
                    ================================================= */}

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


                    {/* =================================================
                          EXPORT EXCEL
                    ================================================= */}

                    {onExportExcel && (
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
                    )}


                    {/* =================================================
                          EXPORT PDF
                    ================================================= */}

                    {onExportPdf && (
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
                    )}

                </div>,
                document.body
            )
            : null;


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
            }}
        >

            {/* ===================================================
                HEADER
            =================================================== */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "space-between",
                    marginBottom: 2,
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: "16px",
                        fontWeight: 800,
                        color: "#0F172A",
                    }}
                >
                    OPEX Composition (YTD)
                </h3>


                {/* =================================================
                    THREE DOT MENU BUTTON
                ================================================= */}

                <button
                    ref={menuButtonRef}
                    type="button"
                    onClick={toggleMenu}
                    aria-label="OPEX Composition options"
                    aria-expanded={menuOpen}
                    style={{
                        border: "none",
                        background:
                            "transparent",
                        padding: "2px 5px",
                        cursor: "pointer",
                        color: "#64748B",
                        borderRadius: 5,
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        flexShrink: 0,
                    }}
                >
                    <MoreVertical
                        size={17}
                        strokeWidth={2}
                    />
                </button>
            </div>


            {/* ===================================================
                PORTAL MENU
            =================================================== */}

            {actionMenu}


            {/* ===================================================
                CONTENT
            =================================================== */}

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    minHeight: 235,
                    width: "100%",
                }}
            >

                {/* =================================================
                    DONUT SECTION
                ================================================= */}

                <div
                    style={{
                        width: "43%",
                        height: 220,
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        flexShrink: 0,
                        position:
                            "relative",
                    }}
                >
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <PieChart>

                            <Pie
                                data={ytdCompositionData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={95}
                                paddingAngle={0}
                                startAngle={90}
                                endAngle={-270}
                                stroke="#FFFFFF"
                                strokeWidth={1}

                                labelLine={false}

                                onClick={
                                    handleDrillDown
                                }

                                onMouseEnter={(
                                    entry,
                                    index
                                ) => {
                                    setActivePieIndex(
                                        index
                                    );
                                }}

                                onMouseLeave={() => {
                                    setActivePieIndex(
                                        null
                                    );
                                }}
                            >

                                {ytdCompositionData.map(
                                    (
                                        entry,
                                        index
                                    ) => (
                                        <Cell
                                            key={`cell-${index}`}

                                            fill={
                                                COLORS[
                                                index %
                                                COLORS.length
                                                ]
                                            }

                                            opacity={
                                                activePieIndex ===
                                                    null ||
                                                    activePieIndex ===
                                                    index
                                                    ? 1
                                                    : 0.22
                                            }

                                            style={{
                                                transition:
                                                    "opacity 180ms ease",
                                            }}
                                        />
                                    )
                                )}

                            </Pie>


                            {/* =================================================
                                HOVER TOOLTIP
                            ================================================= */}

                            <Tooltip
                                cursor={false}
                                content={
                                    <CustomTooltip
                                        reportingCurrency={
                                            selectedReportingCurrency
                                        }
                                    />
                                }
                            />

                        </PieChart>
                    </ResponsiveContainer>


                    {/* =================================================
                       CENTER VALUE
                       ALWAYS YTD TOTAL
                    ================================================= */}

                    <div
                        style={{
                            position: "absolute",
                            display:
                                activePieIndex === null
                                    ? "flex"
                                    : "none",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                            zIndex: 2,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 15,
                                fontWeight: 900,
                                color: "#0F172A",
                                lineHeight: "12px",
                            }}
                        >
                            {selectedReportingCurrency}
                        </span>

                        <span
                            style={{
                                fontSize: 16,
                                fontWeight: 900,
                                color: "#0F172A",
                                lineHeight: "16px",
                            }}
                        >
                            {formatValue(ytdTotal)}
                        </span>
                    </div>

                </div>


                {/* =================================================
                    TABLE SECTION
                ================================================= */}

                <div
                    style={{
                        width: "57%",
                        height: "100%",
                        display:
                            "flex",
                        flexDirection:
                            "column",
                        justifyContent:
                            "center",
                        paddingLeft: 5,
                        boxSizing:
                            "border-box",
                    }}
                >

                    {/* =================================================
                        TABLE HEADER
                    ================================================= */}

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "1fr 62px 50px",
                            alignItems:
                                "center",
                            borderBottom:
                                "1px solid #E5E7EB",
                            paddingBottom: 6,
                            marginBottom: 3,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#000000",
                            }}
                        >
                            Expense Category
                        </span>

                        <span
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#000000",
                                textAlign:
                                    "right",
                            }}
                        >
                            Amount (
                            {
                                selectedReportingCurrency
                            })
                        </span>

                        <span
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#000000",
                                textAlign:
                                    "right",
                            }}
                        >
                            %
                        </span>
                    </div>


                    {/* =================================================
                        TABLE ROWS
                        -------------------------------------------------
                        IMPORTANT:
                        Uses YTD-normalized data only.
                    ================================================= */}

                    {ytdCompositionData.map(
                        (
                            item,
                            index
                        ) => {
                            const categoryColor =
                                COLORS[
                                index %
                                COLORS.length
                                ];

                            return (
                                <div
                                    key={
                                        item.name ||
                                        index
                                    }
                                    onClick={() =>
                                        handleDrillDown(
                                            item
                                        )
                                    }
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "1fr 62px 50px",
                                        alignItems:
                                            "center",
                                        minHeight: 27,
                                        cursor:
                                            onDrillDown
                                                ? "pointer"
                                                : "default",
                                    }}
                                >

                                    {/* =====================================
                                        EXPENSE CATEGORY
                                    ===================================== */}

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            minWidth: 0,
                                            gap: 6,
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 7,
                                                height: 7,
                                                minWidth: 7,
                                                borderRadius:
                                                    "50%",
                                                backgroundColor:
                                                    categoryColor,
                                                display:
                                                    "inline-block",
                                            }}
                                        />

                                        <span
                                            style={{
                                                fontSize: 13,
                                                color: "#000000",
                                                fontWeight: 700,
                                                whiteSpace:
                                                    "nowrap",
                                                overflow:
                                                    "hidden",
                                                textOverflow:
                                                    "ellipsis",
                                            }}
                                            title={
                                                item.name
                                            }
                                        >
                                            {
                                                item.name
                                            }
                                        </span>
                                    </div>


                                    {/* =====================================
                                        YTD AMOUNT
                                    ===================================== */}

                                    <span
                                        style={{
                                            fontSize: 12,
                                            color:
                                                categoryColor,
                                            fontWeight: 800,
                                            textAlign:
                                                "right",
                                        }}
                                    >
                                        {formatValue(
                                            item.value
                                        )}
                                    </span>


                                    {/* =====================================
                                        YTD PERCENTAGE
                                    ===================================== */}

                                    <span
                                        style={{
                                            fontSize: 12,
                                            color:
                                                categoryColor,
                                            fontWeight: 800,
                                            textAlign:
                                                "right",
                                        }}
                                    >
                                        {item.percentage ===
                                            null ||
                                            item.percentage ===
                                            undefined
                                            ? "—"
                                            : `(${item.percentage}%)`}
                                    </span>
                                </div>
                            );
                        }
                    )}


                    {/* =================================================
                        TOTAL
                        -------------------------------------------------
                        Always YTD total / 100%.
                    ================================================= */}

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "1fr 62px 50px",
                            alignItems:
                                "center",
                            borderTop:
                                "1px solid #E5E7EB",
                            marginTop: 4,
                            paddingTop: 7,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#0F172A",
                            }}
                        >
                            Total
                        </span>

                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: "#334155",
                                textAlign:
                                    "right",
                            }}
                        >
                            {formatValue(
                                ytdTotal
                            )}
                        </span>

                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: "#334155",
                                textAlign:
                                    "right",
                            }}
                        >
                            {ytdTotal === null ||
                                ytdTotal ===
                                undefined
                                ? "—"
                                : "(100%)"}
                        </span>
                    </div>

                </div>

            </div>

        </div>
    );
}

