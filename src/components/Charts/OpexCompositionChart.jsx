

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

// /* =========================================================
//    COLORS
// ========================================================= */

// const COLORS = [
//     "#5B3FE4",
//     "#4E9A51",
//     "#E87920",
//     "#3478B9",
//     "#3FAFC1",
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
//    CUSTOM TOOLTIP
// ========================================================= */

// function CustomTooltip({
//     active,
//     payload,
//     reportingCurrency = "AED",
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
//                 background: "#FFFFFF",
//                 border: "1px solid #E5E7EB",
//                 borderRadius: 7,
//                 padding: "8px 10px",
//                 boxShadow:
//                     "0 4px 12px rgba(15, 23, 42, 0.10)",
//                 minWidth: 150,
//             }}
//         >
//             <div
//                 style={{
//                     fontSize: 11,
//                     fontWeight: 800,
//                     color: "#334155",
//                     marginBottom: 5,
//                 }}
//             >
//                 {item.name}
//             </div>

//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     gap: 15,
//                 }}
//             >
//                 <span
//                     style={{
//                         fontSize: 10,
//                         fontWeight: 600,
//                         color: "#64748B",
//                     }}
//                 >
//                     Amount
//                 </span>

//                 <span
//                     style={{
//                         fontSize: 10,
//                         fontWeight: 800,
//                         color: "#0F172A",
//                     }}
//                 >
//                     {formatValue(item.value) === "—"
//                         ? "—"
//                         : `${reportingCurrency} ${formatValue(
//                               item.value
//                           )}`}
//                 </span>
//             </div>

//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     gap: 15,
//                     marginTop: 3,
//                 }}
//             >
//                 <span
//                     style={{
//                         fontSize: 10,
//                         fontWeight: 600,
//                         color: "#64748B",
//                     }}
//                 >
//                     Percentage
//                 </span>

//                 <span
//                     style={{
//                         fontSize: 10,
//                         fontWeight: 800,
//                         color: "#0F172A",
//                     }}
//                 >
//                     {item.payload?.percentage === null ||
//                     item.payload?.percentage === undefined
//                         ? "—"
//                         : `${item.payload.percentage}%`}
//                 </span>
//             </div>
//         </div>
//     );
// }

// /* =========================================================
//    CUSTOM DONUT LABEL
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
//             Math.cos(-midAngle * RADIAN);

//     const y =
//         cy +
//         radius *
//             Math.sin(-midAngle * RADIAN);

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
//        POSITION DROPDOWN
       
//        The menu is rendered using a portal so it does not
//        affect ResponsiveContainer / PieChart layout.
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

//        Do not create a different filter object for PDF,
//        Excel, View All or Drill-Down.
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

//     const handleExportPdf = () => {
//         setMenuOpen(false);

//         if (
//             typeof onExportPdf ===
//             "function"
//         ) {
//             onExportPdf({
//                 filters: filterContext,
//                 data,
//                 total,
//             });
//         }
//     };

//     /* =====================================================
//        EXCEL EXPORT
//     ===================================================== */

//     const handleExportExcel = () => {
//         setMenuOpen(false);

//         if (
//             typeof onExportExcel ===
//             "function"
//         ) {
//             onExportExcel({
//                 filters: filterContext,
//                 data,
//                 total,
//             });
//         }
//     };

//     /* =====================================================
//        DRILL-DOWN

//        The exact same filter context is passed to the
//        existing drill-down handler.
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

//        Rendered outside the chart using createPortal.
//        This prevents the dropdown from affecting the
//        ResponsiveContainer dimensions.
//     ===================================================== */

//     const actionMenu =
//         menuOpen &&
//         typeof document !== "undefined"
//             ? createPortal(
//                   <div
//                       ref={menuRef}
//                       style={{
//                           position: "fixed",
//                           top: menuPosition.top,
//                           right: menuPosition.right,
//                           width: 105,
//                           background: "#FFFFFF",
//                           border:
//                               "1px solid #E5E7EB",
//                           borderRadius: 7,
//                           boxShadow:
//                               "0 8px 20px rgba(15, 23, 42, 0.12)",
//                           padding: 4,
//                           zIndex: 99999,
//                           boxSizing:
//                               "border-box",
//                       }}
//                   >
//                       {/* =================================================
//                           VIEW ALL
//                       ================================================= */}

//                       {onViewAll && (
//                           <button
//                               type="button"
//                               onClick={
//                                   handleViewAll
//                               }
//                               style={{
//                                   width: "100%",
//                                   border: "none",
//                                   background:
//                                       "transparent",
//                                   borderRadius: 5,
//                                   padding:
//                                       "7px 9px",
//                                   cursor:
//                                       "pointer",
//                                   color:
//                                       "#475569",
//                                   fontSize: 11,
//                                   fontWeight: 700,
//                                   textAlign:
//                                       "left",
//                                   display:
//                                       "block",
//                                   boxSizing:
//                                       "border-box",
//                               }}
//                               onMouseEnter={(
//                                   e
//                               ) => {
//                                   e.currentTarget.style.background =
//                                       "#F8FAFC";
//                               }}
//                               onMouseLeave={(
//                                   e
//                               ) => {
//                                   e.currentTarget.style.background =
//                                       "transparent";
//                               }}
//                           >
//                               View All
//                           </button>
//                       )}

//                       {/* =================================================
//                           PDF
//                       ================================================= */}

//                       {onExportPdf && (
//                           <button
//                               type="button"
//                               onClick={
//                                   handleExportPdf
//                               }
//                               style={{
//                                   width: "100%",
//                                   border: "none",
//                                   background:
//                                       "transparent",
//                                   borderRadius: 5,
//                                   padding:
//                                       "7px 9px",
//                                   cursor:
//                                       "pointer",
//                                   color:
//                                       "#475569",
//                                   fontSize: 11,
//                                   fontWeight: 700,
//                                   textAlign:
//                                       "left",
//                                   display:
//                                       "block",
//                                   boxSizing:
//                                       "border-box",
//                               }}
//                               onMouseEnter={(
//                                   e
//                               ) => {
//                                   e.currentTarget.style.background =
//                                       "#F8FAFC";
//                               }}
//                               onMouseLeave={(
//                                   e
//                               ) => {
//                                   e.currentTarget.style.background =
//                                       "transparent";
//                               }}
//                           >
//                             Export PDF
//                           </button>
//                       )}

//                       {/* =================================================
//                           EXCEL
//                       ================================================= */}

//                       {onExportExcel && (
//                           <button
//                               type="button"
//                               onClick={
//                                   handleExportExcel
//                               }
//                               style={{
//                                   width: "100%",
//                                   border: "none",
//                                   background:
//                                       "transparent",
//                                   borderRadius: 5,
//                                   padding:
//                                       "7px 9px",
//                                   cursor:
//                                       "pointer",
//                                   color:
//                                       "#475569",
//                                   fontSize: 11,
//                                   fontWeight: 700,
//                                   textAlign:
//                                       "left",
//                                   display:
//                                       "block",
//                                   boxSizing:
//                                       "border-box",
//                               }}
//                               onMouseEnter={(
//                                   e
//                               ) => {
//                                   e.currentTarget.style.background =
//                                       "#F8FAFC";
//                               }}
//                               onMouseLeave={(
//                                   e
//                               ) => {
//                                   e.currentTarget.style.background =
//                                       "transparent";
//                               }}
//                           >
//                               Export Excel
//                           </button>
//                       )}
//                   </div>,
//                   document.body
//               )
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
//                         fontSize: 12,
//                         lineHeight: "16px",
//                         fontWeight: 800,
//                         color: "#0F172A",
//                     }}
//                 >
//                     OPEX Composition (YTD)
//                 </h3>

//                 {/* =================================================
//                     THREE DOT MENU BUTTON

//                     IMPORTANT:
//                     Only the button stays inside the chart.
//                     The actual dropdown is rendered through
//                     a portal outside the chart.
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
//                         fontSize: 17,
//                         lineHeight: 1,
//                         borderRadius: 5,
//                         display: "flex",
//                         alignItems:
//                             "center",
//                         justifyContent:
//                             "center",
//                         flexShrink: 0,
//                     }}
//                 >
//                     ⋮
//                 </button>
//             </div>

//             {/* ===================================================
//                 PORTAL MENU

//                 Does NOT participate in the chart layout.
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
//                                 outerRadius={90}
//                                 paddingAngle={0}
//                                 startAngle={90}
//                                 endAngle={-270}
//                                 stroke="#FFFFFF"
//                                 strokeWidth={1}
//                                 labelLine={
//                                     false
//                                 }
//                                 label={
//                                     renderCustomLabel
//                                 }
//                                 onClick={
//                                     handleDrillDown
//                                 }
//                             >
//                                 {data.map(
//                                     (
//                                         entry,
//                                         index
//                                     ) => (
//                                         <Cell
//                                             key={`cell-${index}`}
//                                             fill={
//                                                 COLORS[
//                                                     index %
//                                                         COLORS.length
//                                                 ]
//                                             }
//                                         />
//                                     )
//                                 )}
//                             </Pie>

//                             <Tooltip
//                                 content={
//                                     <CustomTooltip
//                                         reportingCurrency={
//                                             selectedReportingCurrency
//                                         }
//                                     />
//                                 }
//                             />
//                         </PieChart>
//                     </ResponsiveContainer>

//                     {/* =================================================
//                         CENTER VALUE
//                     ================================================= */}

//                     <div
//                         style={{
//                             position:
//                                 "absolute",
//                             display:
//                                 "flex",
//                             flexDirection:
//                                 "column",
//                             alignItems:
//                                 "center",
//                             justifyContent:
//                                 "center",
//                             pointerEvents:
//                                 "none",
//                             zIndex: 2,
//                         }}
//                     >
//                         <span
//                             style={{
//                                 fontSize: 10,
//                                 fontWeight: 900,
//                                 color: "#334155",
//                                 lineHeight:
//                                     "12px",
//                             }}
//                         >
//                             {
//                                 selectedReportingCurrency
//                             }
//                         </span>

//                         <span
//                             style={{
//                                 fontSize: 14,
//                                 fontWeight: 800,
//                                 color: "#0F172A",
//                                 lineHeight:
//                                     "16px",
//                             }}
//                         >
//                             {formatValue(
//                                 total
//                             )}
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
//                                 fontSize: 12,
//                                 fontWeight: 800,
//                                 color: "#64748B",
//                             }}
//                         >
//                             Expense Category
//                         </span>

//                         <span
//                             style={{
//                                 fontSize: 12,
//                                 fontWeight: 700,
//                                 color: "#64748B",
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
//                                 color: "#64748B",
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
//                         ) => (
//                             <div
//                                 key={
//                                     item.name ||
//                                     index
//                                 }
//                                 onClick={() =>
//                                     handleDrillDown(
//                                         item
//                                     )
//                                 }
//                                 style={{
//                                     display:
//                                         "grid",
//                                     gridTemplateColumns:
//                                         "1fr 62px 50px",
//                                     alignItems:
//                                         "center",
//                                     minHeight: 27,
//                                     cursor:
//                                         onDrillDown
//                                             ? "pointer"
//                                             : "default",
//                                 }}
//                             >
//                                 <div
//                                     style={{
//                                         display:
//                                             "flex",
//                                         alignItems:
//                                             "center",
//                                         minWidth: 0,
//                                         gap: 6,
//                                     }}
//                                 >
//                                     <span
//                                         style={{
//                                             width: 7,
//                                             height: 7,
//                                             minWidth: 7,
//                                             borderRadius:
//                                                 "50%",
//                                             backgroundColor:
//                                                 COLORS[
//                                                     index %
//                                                         COLORS.length
//                                                 ],
//                                             display:
//                                                 "inline-block",
//                                         }}
//                                     />

//                                     <span
//                                         style={{
//                                             fontSize: 11,
//                                             color: "#475569",
//                                             fontWeight: 700,
//                                             whiteSpace:
//                                                 "nowrap",
//                                             overflow:
//                                                 "hidden",
//                                             textOverflow:
//                                                 "ellipsis",
//                                         }}
//                                         title={
//                                             item.name
//                                         }
//                                     >
//                                         {
//                                             item.name
//                                         }
//                                     </span>
//                                 </div>

//                                 <span
//                                     style={{
//                                         fontSize: 11,
//                                         color: "#334155",
//                                         fontWeight: 700,
//                                         textAlign:
//                                             "right",
//                                     }}
//                                 >
//                                     {formatValue(
//                                         item.value
//                                     )}
//                                 </span>

//                                 <span
//                                     style={{
//                                         fontSize: 11,
//                                         color: "#475569",
//                                         fontWeight: 700,
//                                         textAlign:
//                                             "right",
//                                     }}
//                                 >
//                                     {item.percentage ===
//                                         null ||
//                                     item.percentage ===
//                                         undefined
//                                         ? "—"
//                                         : `(${item.percentage}%)`}
//                                 </span>
//                             </div>
//                         )
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
//                                 fontSize: 11,
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
//                             total ===
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
    Eye,
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
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 7,
                padding: "8px 10px",
                boxShadow:
                    "0 4px 12px rgba(15, 23, 42, 0.10)",
                minWidth: 150,
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#334155",
                    marginBottom: 5,
                }}
            >
                {item.name}
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 15,
                }}
            >
                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748B",
                    }}
                >
                    Amount
                </span>

                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#0F172A",
                    }}
                >
                    {formatValue(item.value) === "—"
                        ? "—"
                        : `${reportingCurrency} ${formatValue(
                              item.value
                          )}`}
                </span>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 15,
                    marginTop: 3,
                }}
            >
                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#64748B",
                    }}
                >
                    Percentage
                </span>

                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#0F172A",
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

       Optional.
       Supports values such as:
       "composition-excel"
       "composition-pdf"
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
       POSITION DROPDOWN

       The menu is rendered using a portal so it does not
       affect ResponsiveContainer / PieChart layout.
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
       SAME FILTER CONTEXT FOR ALL ACTIONS

       Do not create a different filter object for PDF,
       Excel, View All or Drill-Down.
    ===================================================== */

    const filterContext = {
        ...activeFilters,

        reporting_currency:
            selectedReportingCurrency,
    };

    /* =====================================================
       VIEW ALL
    ===================================================== */

    const handleViewAll = () => {
        setMenuOpen(false);

        if (typeof onViewAll === "function") {
            onViewAll({
                filters: filterContext,
                data,
                total,
            });
        }
    };

    /* =====================================================
       PDF EXPORT
    ===================================================== */

    const handleExportPdf = async () => {
        setMenuOpen(false);

        if (
            typeof onExportPdf ===
            "function"
        ) {
            await onExportPdf({
                filters: filterContext,
                data,
                total,
            });
        }
    };

    /* =====================================================
       EXCEL EXPORT
    ===================================================== */

    const handleExportExcel = async () => {
        setMenuOpen(false);

        if (
            typeof onExportExcel ===
            "function"
        ) {
            await onExportExcel({
                filters: filterContext,
                data,
                total,
            });
        }
    };

    /* =====================================================
       COMMON EXPORT BUTTON HANDLER

       This connects the common ExportButtons component
       to the existing OPEX Composition export handlers.
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

       Common ExportButtons expects:
       "excel"
       "pdf"
       or empty string.

       Existing parent/page can continue using:
       "composition-excel"
       "composition-pdf"
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

       The exact same filter context is passed to the
       existing drill-down handler.
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

       Rendered outside the chart using createPortal.
       This prevents the dropdown from affecting the
       ResponsiveContainer dimensions.
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
                          width: 145,
                          background: "#FFFFFF",
                          border:
                              "1px solid #E5E7EB",
                          borderRadius: 7,
                          boxShadow:
                              "0 8px 20px rgba(15, 23, 42, 0.12)",
                          padding: 4,
                          zIndex: 99999,
                          boxSizing:
                              "border-box",
                      }}
                  >
                      {/* =================================================
                          VIEW ALL
                      ================================================= */}

                      {onViewAll && (
                          <button
                              type="button"
                              onClick={
                                  handleViewAll
                              }
                              style={{
                                  width: "100%",
                                  border: "none",
                                  background:
                                      "transparent",
                                  borderRadius: 5,
                                  padding:
                                      "8px 11px",
                                  cursor:
                                      "pointer",
                                  color:
                                      "#334155",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  textAlign:
                                      "left",
                                  display: "flex",
                                  alignItems:
                                      "center",
                                  gap: 9,
                                  boxSizing:
                                      "border-box",
                              }}
                              onMouseEnter={(
                                  e
                              ) => {
                                  e.currentTarget.style.background =
                                      "#F8FAFC";
                              }}
                              onMouseLeave={(
                                  e
                              ) => {
                                  e.currentTarget.style.background =
                                      "transparent";
                              }}
                          >
                              <Eye
                                  size={15}
                                  strokeWidth={2}
                              />

                              <span>
                                  View All
                              </span>
                          </button>
                      )}

                      {/* =================================================
                          COMMON EXPORT BUTTONS

                          Excel + PDF icons and buttons now come
                          from the shared ExportButtons component.
                      ================================================= */}

                      {(onExportExcel ||
                          onExportPdf) && (
                          <ExportButtons
                              endpoint="opex-composition"
                              exporting={
                                  commonExporting
                              }
                              handleExport={
                                  handleCommonExport
                              }
                              variant="menu"
                          />
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
                        fontSize: 12,
                        lineHeight: "16px",
                        fontWeight: 800,
                        color: "#0F172A",
                    }}
                >
                    OPEX Composition (YTD)
                </h3>

                {/* =================================================
                    THREE DOT MENU BUTTON

                    IMPORTANT:
                    Only the button stays inside the chart.
                    The actual dropdown is rendered through
                    a portal outside the chart.
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

                Does NOT participate in the chart layout.
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
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={0}
                                startAngle={90}
                                endAngle={-270}
                                stroke="#FFFFFF"
                                strokeWidth={1}
                                labelLine={
                                    false
                                }
                                label={
                                    renderCustomLabel
                                }
                                onClick={
                                    handleDrillDown
                                }
                            >
                                {data.map(
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
                                        />
                                    )
                                )}
                            </Pie>

                            <Tooltip
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
                    ================================================= */}

                    <div
                        style={{
                            position:
                                "absolute",
                            display:
                                "flex",
                            flexDirection:
                                "column",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            pointerEvents:
                                "none",
                            zIndex: 2,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 10,
                                fontWeight: 900,
                                color: "#334155",
                                lineHeight:
                                    "12px",
                            }}
                        >
                            {
                                selectedReportingCurrency
                            }
                        </span>

                        <span
                            style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: "#0F172A",
                                lineHeight:
                                    "16px",
                            }}
                        >
                            {formatValue(
                                total
                            )}
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
                                fontSize: 12,
                                fontWeight: 800,
                                color: "#64748B",
                            }}
                        >
                            Expense Category
                        </span>

                        <span
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#64748B",
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
                                color: "#64748B",
                                textAlign:
                                    "right",
                            }}
                        >
                            %
                        </span>
                    </div>

                    {/* =================================================
                        TABLE ROWS
                    ================================================= */}

                    {data.map(
                        (
                            item,
                            index
                        ) => (
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
                                                COLORS[
                                                    index %
                                                        COLORS.length
                                                ],
                                            display:
                                                "inline-block",
                                        }}
                                    />

                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: "#475569",
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

                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "#334155",
                                        fontWeight: 700,
                                        textAlign:
                                            "right",
                                    }}
                                >
                                    {formatValue(
                                        item.value
                                    )}
                                </span>

                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "#475569",
                                        fontWeight: 700,
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
                        )
                    )}

                    {/* =================================================
                        TOTAL
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
                                fontSize: 11,
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
                                total
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
                            {total === null ||
                            total ===
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