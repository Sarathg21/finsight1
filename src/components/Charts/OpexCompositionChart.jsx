// // // import React from "react";
// // // import {
// // //     ResponsiveContainer,
// // //     PieChart,
// // //     Pie,
// // //     Cell,
// // //     Tooltip,
// // // } from "recharts";


// // // /* =========================================================
// // //    COLORS
// // // ========================================================= */

// // // const COLORS = [
// // //     "#5B3FE4",
// // //     "#4E9A51",
// // //     "#E87920",
// // //     "#3478B9",
// // //     "#3FAFC1",
// // // ];

// // // /* =========================================================
// // //    FORMAT VALUE
// // // ========================================================= */

// // // const formatValue = (value) => {
// // //     return `${Number(value).toFixed(2)}M`;
// // // };

// // // /* =========================================================
// // //    CUSTOM TOOLTIP
// // // ========================================================= */

// // // function CustomTooltip({ active, payload }) {
// // //     if (!active || !payload || !payload.length) {
// // //         return null;
// // //     }

// // //     const item = payload[0];

// // //     return (
// // //         <div
// // //             style={{
// // //                 background: "#FFFFFF",
// // //                 border: "1px solid #E5E7EB",
// // //                 borderRadius: 7,
// // //                 padding: "8px 10px",
// // //                 boxShadow: "0 4px 12px rgba(15, 23, 42, 0.10)",
// // //                 minWidth: 150,
// // //             }}
// // //         >
// // //             <div
// // //                 style={{
// // //                     fontSize: 9,
// // //                     fontWeight: 700,
// // //                     color: "#334155",
// // //                     marginBottom: 5,
// // //                 }}
// // //             >
// // //                 {item.name}
// // //             </div>

// // //             <div
// // //                 style={{
// // //                     display: "flex",
// // //                     justifyContent: "space-between",
// // //                     gap: 15,
// // //                 }}
// // //             >
// // //                 <span
// // //                     style={{
// // //                         fontSize: 9,
// // //                         color: "#64748B",
// // //                     }}
// // //                 >
// // //                     Amount
// // //                 </span>

// // //                 <span
// // //                     style={{
// // //                         fontSize: 9,
// // //                         fontWeight: 700,
// // //                         color: "#0F172A",
// // //                     }}
// // //                 >
// // //                     AED {formatValue(item.value)}
// // //                 </span>
// // //             </div>

// // //             <div
// // //                 style={{
// // //                     display: "flex",
// // //                     justifyContent: "space-between",
// // //                     gap: 15,
// // //                     marginTop: 3,
// // //                 }}
// // //             >
// // //                 <span
// // //                     style={{
// // //                         fontSize: 9,
// // //                         color: "#64748B",
// // //                     }}
// // //                 >
// // //                     Percentage
// // //                 </span>

// // //                 <span
// // //                     style={{
// // //                         fontSize: 9,
// // //                         fontWeight: 700,
// // //                         color: "#0F172A",
// // //                     }}
// // //                 >
// // //                     {item.payload?.percentage ?? "-"}%
// // //                 </span>
// // //             </div>
// // //         </div>
// // //     );
// // // }

// // // /* =========================================================
// // //    CUSTOM DONUT LABEL
// // // ========================================================= */

// // // function renderCustomLabel({
// // //     cx,
// // //     cy,
// // //     midAngle,
// // //     innerRadius,
// // //     outerRadius,
// // //     percentage,
// // // }) {
// // //     const RADIAN = Math.PI / 180;

// // //     const radius =
// // //         innerRadius +
// // //         (outerRadius - innerRadius) * 0.55;

// // //     const x =
// // //         cx + radius * Math.cos(-midAngle * RADIAN);

// // //     const y =
// // //         cy + radius * Math.sin(-midAngle * RADIAN);

// // //     return (
// // //         <text
// // //             x={x}
// // //             y={y}
// // //             fill="#FFFFFF"
// // //             textAnchor="middle"
// // //             dominantBaseline="central"
// // //             fontSize={9}
// // //             fontWeight={700}
// // //         >
// // //             {percentage}%
// // //         </text>
// // //     );
// // // }

// // // /* =========================================================
// // //    MAIN COMPONENT
// // // ========================================================= */

// // // export default function OpexCompositionChart({
// // //     data,
// // // }) {
// // //     const total = data.reduce(
// // //         (sum, item) => sum + Number(item.value || 0),
// // //         0
// // //     );

// // //     return (
// // //         <div
// // //             style={{
// // //                 width: "100%",
// // //                 height: "100%",
// // //                 minHeight: 275,
// // //                 background: "#FFFFFF",
// // //                 border: "1px solid #E5E7EB",
// // //                 borderRadius: 10,
// // //                 padding: "12px 12px 8px",
// // //                 boxSizing: "border-box",
// // //                 display: "flex",
// // //                 flexDirection: "column",
// // //             }}
// // //         >
// // //             {/* ===================================================
// // //           HEADER
// // //       =================================================== */}

// // //             <div
// // //                 style={{
// // //                     display: "flex",
// // //                     alignItems: "center",
// // //                     justifyContent: "space-between",
// // //                     marginBottom: 2,
// // //                 }}
// // //             >
// // //                 <h3
// // //                     style={{
// // //                         margin: 0,
// // //                         fontSize: 11,
// // //                         lineHeight: "16px",
// // //                         fontWeight: 700,
// // //                         color: "#0F172A",
// // //                     }}
// // //                 >
// // //                     OPEX Composition (YTD)
// // //                 </h3>

// // //                 {/* Three-dot menu */}
// // //                 <button
// // //                     type="button"
// // //                     style={{
// // //                         border: "none",
// // //                         background: "transparent",
// // //                         padding: "2px 4px",
// // //                         cursor: "pointer",
// // //                         color: "#64748B",
// // //                         fontSize: 15,
// // //                         lineHeight: 1,
// // //                     }}
// // //                 >
// // //                     ⋮
// // //                 </button>
// // //             </div>

// // //             {/* ===================================================
// // //           CONTENT
// // //       =================================================== */}

// // //             <div
// // //                 style={{
// // //                     flex: 1,
// // //                     display: "flex",
// // //                     alignItems: "center",
// // //                     minHeight: 235,
// // //                     width: "100%",
// // //                 }}
// // //             >
// // //                 {/* =================================================
// // //             DONUT SECTION
// // //         ================================================= */}

// // //                 <div
// // //                     style={{
// // //                         width: "43%",
// // //                         height: 220,
// // //                         display: "flex",
// // //                         alignItems: "center",
// // //                         justifyContent: "center",
// // //                         flexShrink: 0,
// // //                     }}
// // //                 >
// // //                     <ResponsiveContainer
// // //                         width="100%"
// // //                         height="100%"
// // //                     >
// // //                         <PieChart>
// // //                             <Pie
// // //                                 data={data}
// // //                                 dataKey="value"
// // //                                 nameKey="name"
// // //                                 cx="50%"
// // //                                 cy="50%"
// // //                                 innerRadius={55}
// // //                                 outerRadius={90}
// // //                                 paddingAngle={0}
// // //                                 startAngle={90}
// // //                                 endAngle={-270}
// // //                                 stroke="#FFFFFF"
// // //                                 strokeWidth={1}
// // //                                 labelLine={false}
// // //                                 label={renderCustomLabel}
// // //                             >
// // //                                 {data.map((entry, index) => (
// // //                                     <Cell
// // //                                         key={`cell-${index}`}
// // //                                         fill={
// // //                                             COLORS[index % COLORS.length]
// // //                                         }
// // //                                     />
// // //                                 ))}
// // //                             </Pie>

// // //                             <Tooltip
// // //                                 content={<CustomTooltip />}
// // //                             />
// // //                         </PieChart>
// // //                     </ResponsiveContainer>

// // //                     {/* CENTER VALUE */}

// // //                     <div
// // //                         style={{
// // //                             position: "absolute",
// // //                             display: "flex",
// // //                             flexDirection: "column",
// // //                             alignItems: "center",
// // //                             justifyContent: "center",
// // //                             pointerEvents: "none",
// // //                         }}
// // //                     >
// // //                         <span
// // //                             style={{
// // //                                 fontSize: 9,
// // //                                 fontWeight: 600,
// // //                                 color: "#334155",
// // //                                 lineHeight: "12px",
// // //                             }}
// // //                         >
// // //                             AED
// // //                         </span>

// // //                         <span
// // //                             style={{
// // //                                 fontSize: 12,
// // //                                 fontWeight: 800,
// // //                                 color: "#0F172A",
// // //                                 lineHeight: "15px",
// // //                             }}
// // //                         >
// // //                             {total.toFixed(2)}M
// // //                         </span>
// // //                     </div>
// // //                 </div>

// // //                 {/* =================================================
// // //             TABLE SECTION
// // //         ================================================= */}

// // //                 <div
// // //                     style={{
// // //                         width: "57%",
// // //                         height: "100%",
// // //                         display: "flex",
// // //                         flexDirection: "column",
// // //                         justifyContent: "center",
// // //                         paddingLeft: 5,
// // //                         boxSizing: "border-box",
// // //                     }}
// // //                 >
// // //                     {/* TABLE HEADER */}

// // //                     <div
// // //                         style={{
// // //                             display: "grid",
// // //                             gridTemplateColumns: "1fr 62px 50px",
// // //                             alignItems: "center",
// // //                             borderBottom: "1px solid #E5E7EB",
// // //                             paddingBottom: 6,
// // //                             marginBottom: 3,
// // //                         }}
// // //                     >
// // //                         <span
// // //                             style={{
// // //                                 fontSize: 12,
// // //                                 fontWeight: 700,
// // //                                 color: "#64748B",
// // //                             }}
// // //                         >
// // //                             Expense Category
// // //                         </span>

// // //                         <span
// // //                             style={{
// // //                                 fontSize: 12,
// // //                                 fontWeight: 500,
// // //                                 color: "#64748B",
// // //                                 textAlign: "right",
// // //                             }}
// // //                         >
// // //                             Amount (AED)
// // //                         </span>

// // //                         <span
// // //                             style={{
// // //                                 fontSize: 12,
// // //                                 fontWeight: 500,
// // //                                 color: "#64748B",
// // //                                 textAlign: "right",
// // //                             }}
// // //                         >
// // //                             %
// // //                         </span>
// // //                     </div>

// // //                     {/* TABLE ROWS */}

// // //                     {data.map((item, index) => (
// // //                         <div
// // //                             key={item.name}
// // //                             style={{
// // //                                 display: "grid",
// // //                                 gridTemplateColumns: "1fr 62px 50px",
// // //                                 alignItems: "center",
// // //                                 minHeight: 27,
// // //                             }}
// // //                         >
// // //                             {/* CATEGORY */}

// // //                             <div
// // //                                 style={{
// // //                                     display: "flex",
// // //                                     alignItems: "center",
// // //                                     minWidth: 0,
// // //                                     gap: 6,
// // //                                 }}
// // //                             >
// // //                                 <span
// // //                                     style={{
// // //                                         width: 7,
// // //                                         height: 7,
// // //                                         minWidth: 7,
// // //                                         borderRadius: "50%",
// // //                                         backgroundColor:
// // //                                             COLORS[index % COLORS.length],
// // //                                         display: "inline-block",
// // //                                     }}
// // //                                 />

// // //                                 <span
// // //                                     style={{
// // //                                         fontSize: 10,
// // //                                         color: "#475569",
// // //                                         fontWeight: 600,
// // //                                         whiteSpace: "nowrap",
// // //                                         overflow: "hidden",
// // //                                         textOverflow: "ellipsis",
// // //                                     }}
// // //                                     title={item.name}
// // //                                 >
// // //                                     {item.name}
// // //                                 </span>
// // //                             </div>

// // //                             {/* AMOUNT */}

// // //                             <span
// // //                                 style={{
// // //                                     fontSize: 10,
// // //                                     color: "#334155",
// // //                                     fontWeight: 600,
// // //                                     textAlign: "right",
// // //                                 }}
// // //                             >
// // //                                 {formatValue(item.value)}
// // //                             </span>

// // //                             {/* PERCENTAGE */}

// // //                             <span
// // //                                 style={{
// // //                                     fontSize: 10,
// // //                                     color: "#475569",
// // //                                     fontWeight: 600,
// // //                                     textAlign: "right",
// // //                                 }}
// // //                             >
// // //                                 ({item.percentage}%)
// // //                             </span>
// // //                         </div>
// // //                     ))}

// // //                     {/* =================================================
// // //               TOTAL
// // //           ================================================= */}

// // //                     <div
// // //                         style={{
// // //                             display: "grid",
// // //                             gridTemplateColumns: "1fr 62px 50px",
// // //                             alignItems: "center",
// // //                             borderTop: "1px solid #E5E7EB",
// // //                             marginTop: 4,
// // //                             paddingTop: 7,
// // //                         }}
// // //                     >
// // //                         <span
// // //                             style={{
// // //                                 fontSize: 10,
// // //                                 fontWeight: 800,
// // //                                 color: "#0F172A",
// // //                             }}
// // //                         >
// // //                             Total
// // //                         </span>

// // //                         <span
// // //                             style={{
// // //                                 fontSize: 10,
// // //                                 fontWeight: 800,
// // //                                 color: "#334155",
// // //                                 textAlign: "right",
// // //                             }}
// // //                         >
// // //                             {total.toFixed(2)}M
// // //                         </span>

// // //                         <span
// // //                             style={{
// // //                                 fontSize: 10,
// // //                                 fontWeight: 800,
// // //                                 color: "#334155",
// // //                                 textAlign: "right",
// // //                             }}
// // //                         >
// // //                             (100%)
// // //                         </span>
// // //                     </div>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );
// // // }


// // import React from "react";
// // import {
// //     ResponsiveContainer,
// //     PieChart,
// //     Pie,
// //     Cell,
// //     Tooltip,
// // } from "recharts";

// // /* =========================================================
// //    COLORS
// // ========================================================= */

// // const COLORS = [
// //     "#5B3FE4",
// //     "#4E9A51",
// //     "#E87920",
// //     "#3478B9",
// //     "#3FAFC1",
// // ];

// // /* =========================================================
// //    FORMAT VALUE
// // ========================================================= */

// // const formatValue = (value) => {
// //     if (
// //         value === null ||
// //         value === undefined ||
// //         value === ""
// //     ) {
// //         return "—";
// //     }

// //     const number = Number(value);

// //     if (Number.isNaN(number)) {
// //         return "—";
// //     }

// //     return `${number.toFixed(2)}M`;
// // };

// // /* =========================================================
// //    CUSTOM TOOLTIP
// // ========================================================= */

// // function CustomTooltip({
// //     active,
// //     payload,
// // }) {
// //     if (
// //         !active ||
// //         !payload ||
// //         !payload.length
// //     ) {
// //         return null;
// //     }

// //     const item = payload[0];

// //     return (
// //         <div
// //             style={{
// //                 background: "#FFFFFF",
// //                 border: "1px solid #E5E7EB",
// //                 borderRadius: 7,
// //                 padding: "8px 10px",
// //                 boxShadow:
// //                     "0 4px 12px rgba(15, 23, 42, 0.10)",
// //                 minWidth: 150,
// //             }}
// //         >
// //             <div
// //                 style={{
// //                     fontSize: 9,
// //                     fontWeight: 700,
// //                     color: "#334155",
// //                     marginBottom: 5,
// //                 }}
// //             >
// //                 {item.name}
// //             </div>

// //             <div
// //                 style={{
// //                     display: "flex",
// //                     justifyContent:
// //                         "space-between",
// //                     gap: 15,
// //                 }}
// //             >
// //                 <span
// //                     style={{
// //                         fontSize: 9,
// //                         color: "#64748B",
// //                     }}
// //                 >
// //                     Amount
// //                 </span>

// //                 <span
// //                     style={{
// //                         fontSize: 9,
// //                         fontWeight: 700,
// //                         color: "#0F172A",
// //                     }}
// //                 >
// //                     {formatValue(
// //                         item.value
// //                     ) === "—"
// //                         ? "—"
// //                         : `AED ${formatValue(
// //                               item.value
// //                           )}`}
// //                 </span>
// //             </div>

// //             <div
// //                 style={{
// //                     display: "flex",
// //                     justifyContent:
// //                         "space-between",
// //                     gap: 15,
// //                     marginTop: 3,
// //                 }}
// //             >
// //                 <span
// //                     style={{
// //                         fontSize: 9,
// //                         color: "#64748B",
// //                     }}
// //                 >
// //                     Percentage
// //                 </span>

// //                 <span
// //                     style={{
// //                         fontSize: 9,
// //                         fontWeight: 700,
// //                         color: "#0F172A",
// //                     }}
// //                 >
// //                     {item.payload?.percentage ===
// //                     null ||
// //                     item.payload?.percentage ===
// //                         undefined
// //                         ? "—"
// //                         : `${item.payload.percentage}%`}
// //                 </span>
// //             </div>
// //         </div>
// //     );
// // }

// // /* =========================================================
// //    CUSTOM DONUT LABEL
// // ========================================================= */

// // function renderCustomLabel({
// //     cx,
// //     cy,
// //     midAngle,
// //     innerRadius,
// //     outerRadius,
// //     percentage,
// // }) {
// //     if (
// //         percentage === null ||
// //         percentage === undefined
// //     ) {
// //         return null;
// //     }

// //     const RADIAN =
// //         Math.PI / 180;

// //     const radius =
// //         innerRadius +
// //         (outerRadius - innerRadius) *
// //             0.55;

// //     const x =
// //         cx +
// //         radius *
// //             Math.cos(
// //                 -midAngle * RADIAN
// //             );

// //     const y =
// //         cy +
// //         radius *
// //             Math.sin(
// //                 -midAngle * RADIAN
// //             );

// //     return (
// //         <text
// //             x={x}
// //             y={y}
// //             fill="#FFFFFF"
// //             textAnchor="middle"
// //             dominantBaseline="central"
// //             fontSize={9}
// //             fontWeight={700}
// //         >
// //             {percentage}%
// //         </text>
// //     );
// // }

// // /* =========================================================
// //    MAIN COMPONENT
// // ========================================================= */

// // export default function OpexCompositionChart({
// //     data = [],
// //     total = null,
// // }) {
// //     return (
// //         <div
// //             style={{
// //                 width: "100%",
// //                 height: "100%",
// //                 minHeight: 275,
// //                 background: "#FFFFFF",
// //                 border: "1px solid #E5E7EB",
// //                 borderRadius: 10,
// //                 padding: "12px 12px 8px",
// //                 boxSizing: "border-box",
// //                 display: "flex",
// //                 flexDirection: "column",
// //             }}
// //         >
// //             {/* ===================================================
// //                 HEADER
// //             =================================================== */}

// //             <div
// //                 style={{
// //                     display: "flex",
// //                     alignItems: "center",
// //                     justifyContent:
// //                         "space-between",
// //                     marginBottom: 2,
// //                 }}
// //             >
// //                 <h3
// //                     style={{
// //                         margin: 0,
// //                         fontSize: 11,
// //                         lineHeight: "16px",
// //                         fontWeight: 700,
// //                         color: "#0F172A",
// //                     }}
// //                 >
// //                     OPEX Composition (YTD)
// //                 </h3>

// //                 <button
// //                     type="button"
// //                     style={{
// //                         border: "none",
// //                         background:
// //                             "transparent",
// //                         padding: "2px 4px",
// //                         cursor: "pointer",
// //                         color: "#64748B",
// //                         fontSize: 15,
// //                         lineHeight: 1,
// //                     }}
// //                 >
// //                     ⋮
// //                 </button>
// //             </div>

// //             {/* ===================================================
// //                 CONTENT
// //             =================================================== */}

// //             <div
// //                 style={{
// //                     flex: 1,
// //                     display: "flex",
// //                     alignItems: "center",
// //                     minHeight: 235,
// //                     width: "100%",
// //                 }}
// //             >
// //                 {/* =================================================
// //                     DONUT SECTION
// //                 ================================================= */}

// //                 <div
// //                     style={{
// //                         width: "43%",
// //                         height: 220,
// //                         display: "flex",
// //                         alignItems: "center",
// //                         justifyContent:
// //                             "center",
// //                         flexShrink: 0,
// //                         position: "relative",
// //                     }}
// //                 >
// //                     <ResponsiveContainer
// //                         width="100%"
// //                         height="100%"
// //                     >
// //                         <PieChart>
// //                             <Pie
// //                                 data={data}
// //                                 dataKey="value"
// //                                 nameKey="name"
// //                                 cx="50%"
// //                                 cy="50%"
// //                                 innerRadius={55}
// //                                 outerRadius={90}
// //                                 paddingAngle={0}
// //                                 startAngle={90}
// //                                 endAngle={-270}
// //                                 stroke="#FFFFFF"
// //                                 strokeWidth={1}
// //                                 labelLine={false}
// //                                 label={
// //                                     renderCustomLabel
// //                                 }
// //                             >
// //                                 {data.map(
// //                                     (
// //                                         entry,
// //                                         index
// //                                     ) => (
// //                                         <Cell
// //                                             key={`cell-${index}`}
// //                                             fill={
// //                                                 COLORS[
// //                                                     index %
// //                                                         COLORS.length
// //                                                 ]
// //                                             }
// //                                         />
// //                                     )
// //                                 )}
// //                             </Pie>

// //                             <Tooltip
// //                                 content={
// //                                     <CustomTooltip />
// //                                 }
// //                             />
// //                         </PieChart>
// //                     </ResponsiveContainer>

// //                     {/* CENTER VALUE */}

// //                     <div
// //                         style={{
// //                             position:
// //                                 "absolute",
// //                             display: "flex",
// //                             flexDirection:
// //                                 "column",
// //                             alignItems:
// //                                 "center",
// //                             justifyContent:
// //                                 "center",
// //                             pointerEvents:
// //                                 "none",
// //                         }}
// //                     >
// //                         <span
// //                             style={{
// //                                 fontSize: 9,
// //                                 fontWeight: 600,
// //                                 color: "#334155",
// //                                 lineHeight:
// //                                     "12px",
// //                             }}
// //                         >
// //                             AED
// //                         </span>

// //                         <span
// //                             style={{
// //                                 fontSize: 12,
// //                                 fontWeight: 800,
// //                                 color: "#0F172A",
// //                                 lineHeight:
// //                                     "15px",
// //                             }}
// //                         >
// //                             {formatValue(total)}
// //                         </span>
// //                     </div>
// //                 </div>

// //                 {/* =================================================
// //                     TABLE SECTION
// //                 ================================================= */}

// //                 <div
// //                     style={{
// //                         width: "57%",
// //                         height: "100%",
// //                         display: "flex",
// //                         flexDirection:
// //                             "column",
// //                         justifyContent:
// //                             "center",
// //                         paddingLeft: 5,
// //                         boxSizing:
// //                             "border-box",
// //                     }}
// //                 >
// //                     {/* TABLE HEADER */}

// //                     <div
// //                         style={{
// //                             display: "grid",
// //                             gridTemplateColumns:
// //                                 "1fr 62px 50px",
// //                             alignItems:
// //                                 "center",
// //                             borderBottom:
// //                                 "1px solid #E5E7EB",
// //                             paddingBottom: 6,
// //                             marginBottom: 3,
// //                         }}
// //                     >
// //                         <span
// //                             style={{
// //                                 fontSize: 12,
// //                                 fontWeight: 700,
// //                                 color: "#64748B",
// //                             }}
// //                         >
// //                             Expense Category
// //                         </span>

// //                         <span
// //                             style={{
// //                                 fontSize: 12,
// //                                 fontWeight: 500,
// //                                 color: "#64748B",
// //                                 textAlign:
// //                                     "right",
// //                             }}
// //                         >
// //                             Amount (AED)
// //                         </span>

// //                         <span
// //                             style={{
// //                                 fontSize: 12,
// //                                 fontWeight: 500,
// //                                 color: "#64748B",
// //                                 textAlign:
// //                                     "right",
// //                             }}
// //                         >
// //                             %
// //                         </span>
// //                     </div>

// //                     {/* TABLE ROWS */}

// //                     {data.map(
// //                         (
// //                             item,
// //                             index
// //                         ) => (
// //                             <div
// //                                 key={
// //                                     item.name ||
// //                                     index
// //                                 }
// //                                 style={{
// //                                     display:
// //                                         "grid",
// //                                     gridTemplateColumns:
// //                                         "1fr 62px 50px",
// //                                     alignItems:
// //                                         "center",
// //                                     minHeight: 27,
// //                                 }}
// //                             >
// //                                 <div
// //                                     style={{
// //                                         display:
// //                                             "flex",
// //                                         alignItems:
// //                                             "center",
// //                                         minWidth: 0,
// //                                         gap: 6,
// //                                     }}
// //                                 >
// //                                     <span
// //                                         style={{
// //                                             width: 7,
// //                                             height: 7,
// //                                             minWidth: 7,
// //                                             borderRadius:
// //                                                 "50%",
// //                                             backgroundColor:
// //                                                 COLORS[
// //                                                     index %
// //                                                         COLORS.length
// //                                                 ],
// //                                             display:
// //                                                 "inline-block",
// //                                         }}
// //                                     />

// //                                     <span
// //                                         style={{
// //                                             fontSize: 10,
// //                                             color: "#475569",
// //                                             fontWeight: 600,
// //                                             whiteSpace:
// //                                                 "nowrap",
// //                                             overflow:
// //                                                 "hidden",
// //                                             textOverflow:
// //                                                 "ellipsis",
// //                                         }}
// //                                         title={
// //                                             item.name
// //                                         }
// //                                     >
// //                                         {
// //                                             item.name
// //                                         }
// //                                     </span>
// //                                 </div>

// //                                 <span
// //                                     style={{
// //                                         fontSize: 10,
// //                                         color: "#334155",
// //                                         fontWeight: 600,
// //                                         textAlign:
// //                                             "right",
// //                                     }}
// //                                 >
// //                                     {formatValue(
// //                                         item.value
// //                                     )}
// //                                 </span>

// //                                 <span
// //                                     style={{
// //                                         fontSize: 10,
// //                                         color: "#475569",
// //                                         fontWeight: 600,
// //                                         textAlign:
// //                                             "right",
// //                                     }}
// //                                 >
// //                                     {item.percentage ===
// //                                         null ||
// //                                     item.percentage ===
// //                                         undefined
// //                                         ? "—"
// //                                         : `(${item.percentage}%)`}
// //                                 </span>
// //                             </div>
// //                         )
// //                     )}

// //                     {/* TOTAL */}

// //                     <div
// //                         style={{
// //                             display: "grid",
// //                             gridTemplateColumns:
// //                                 "1fr 62px 50px",
// //                             alignItems:
// //                                 "center",
// //                             borderTop:
// //                                 "1px solid #E5E7EB",
// //                             marginTop: 4,
// //                             paddingTop: 7,
// //                         }}
// //                     >
// //                         <span
// //                             style={{
// //                                 fontSize: 10,
// //                                 fontWeight: 800,
// //                                 color: "#0F172A",
// //                             }}
// //                         >
// //                             Total
// //                         </span>

// //                         <span
// //                             style={{
// //                                 fontSize: 10,
// //                                 fontWeight: 800,
// //                                 color: "#334155",
// //                                 textAlign:
// //                                     "right",
// //                             }}
// //                         >
// //                             {formatValue(total)}
// //                         </span>

// //                         <span
// //                             style={{
// //                                 fontSize: 10,
// //                                 fontWeight: 800,
// //                                 color: "#334155",
// //                                 textAlign:
// //                                     "right",
// //                             }}
// //                         >
// //                             {total === null ||
// //                             total ===
// //                                 undefined
// //                                 ? "—"
// //                                 : "(100%)"}
// //                         </span>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }


// import React from "react";
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
//                     justifyContent:
//                         "space-between",
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
//                     {formatValue(
//                         item.value
//                     ) === "—"
//                         ? "—"
//                         : `AED ${formatValue(
//                             item.value
//                         )}`}
//                 </span>
//             </div>

//             <div
//                 style={{
//                     display: "flex",
//                     justifyContent:
//                         "space-between",
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
//                     {item.payload?.percentage ===
//                         null ||
//                         item.payload?.percentage ===
//                         undefined
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

//     const RADIAN =
//         Math.PI / 180;

//     const radius =
//         innerRadius +
//         (outerRadius - innerRadius) *
//         0.55;

//     const x =
//         cx +
//         radius *
//         Math.cos(
//             -midAngle * RADIAN
//         );

//     const y =
//         cy +
//         radius *
//         Math.sin(
//             -midAngle * RADIAN
//         );

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
// }) {
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

//                 <button
//                     type="button"
//                     style={{
//                         border: "none",
//                         background:
//                             "transparent",
//                         padding: "2px 4px",
//                         cursor: "pointer",
//                         color: "#64748B",
//                         fontSize: 15,
//                         lineHeight: 1,
//                     }}
//                 >
//                     ⋮
//                 </button>
//             </div>

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
//                         alignItems: "center",
//                         justifyContent:
//                             "center",
//                         flexShrink: 0,
//                         position: "relative",
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
//                                 labelLine={false}
//                                 label={
//                                     renderCustomLabel
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
//                                                 index %
//                                                 COLORS.length
//                                                 ]
//                                             }
//                                         />
//                                     )
//                                 )}
//                             </Pie>

//                             <Tooltip
//                                 content={
//                                     <CustomTooltip />
//                                 }
//                             />
//                         </PieChart>
//                     </ResponsiveContainer>

//                     {/* CENTER VALUE */}

//                     <div
//                         style={{
//                             position:
//                                 "absolute",
//                             display: "flex",
//                             flexDirection:
//                                 "column",
//                             alignItems:
//                                 "center",
//                             justifyContent:
//                                 "center",
//                             pointerEvents:
//                                 "none",
//                         }}
//                     >
//                         <span
//                             style={{
//                                 fontSize: 10,
//                                 fontWeight: 700,
//                                 color: "#334155",
//                                 lineHeight:
//                                     "12px",
//                             }}
//                         >
//                             AED
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
//                         display: "flex",
//                         flexDirection:
//                             "column",
//                         justifyContent:
//                             "center",
//                         paddingLeft: 5,
//                         boxSizing:
//                             "border-box",
//                     }}
//                 >
//                     {/* TABLE HEADER */}

//                     <div
//                         style={{
//                             display: "grid",
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
//                             Amount (AED)
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

//                     {/* TABLE ROWS */}

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
//                                 style={{
//                                     display:
//                                         "grid",
//                                     gridTemplateColumns:
//                                         "1fr 62px 50px",
//                                     alignItems:
//                                         "center",
//                                     minHeight: 27,
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
//                                                 index %
//                                                 COLORS.length
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
//                                         item.percentage ===
//                                         undefined
//                                         ? "—"
//                                         : `(${item.percentage}%)`}
//                                 </span>
//                             </div>
//                         )
//                     )}

//                     {/* TOTAL */}

//                     <div
//                         style={{
//                             display: "grid",
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
//                             {formatValue(total)}
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

import React from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from "recharts";

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
                    justifyContent:
                        "space-between",
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
                    {formatValue(
                        item.value
                    ) === "—"
                        ? "—"
                        : `AED ${formatValue(
                            item.value
                        )}`}
                </span>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
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
                    {item.payload?.percentage ===
                        null ||
                        item.payload?.percentage ===
                        undefined
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

    const RADIAN =
        Math.PI / 180;

    const radius =
        innerRadius +
        (outerRadius - innerRadius) *
        0.55;

    const x =
        cx +
        radius *
        Math.cos(
            -midAngle * RADIAN
        );

    const y =
        cy +
        radius *
        Math.sin(
            -midAngle * RADIAN
        );

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
}) {
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

                <button
                    type="button"
                    style={{
                        border: "none",
                        background:
                            "transparent",
                        padding: "2px 4px",
                        cursor: "pointer",
                        color: "#64748B",
                        fontSize: 15,
                        lineHeight: 1,
                    }}
                >
                    ⋮
                </button>
            </div>

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
                        alignItems: "center",
                        justifyContent:
                            "center",
                        flexShrink: 0,
                        position: "relative",
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
                                labelLine={false}
                                label={
                                    renderCustomLabel
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
                                    <CustomTooltip />
                                }
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* CENTER VALUE */}

                    <div
                        style={{
                            position:
                                "absolute",
                            display: "flex",
                            flexDirection:
                                "column",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            pointerEvents:
                                "none",
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
                            AED
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
                            {formatValue(total)}
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
                        display: "flex",
                        flexDirection:
                            "column",
                        justifyContent:
                            "center",
                        paddingLeft: 5,
                        boxSizing:
                            "border-box",
                    }}
                >
                    {/* TABLE HEADER */}

                    <div
                        style={{
                            display: "grid",
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
                            Amount (AED)
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

                    {/* TABLE ROWS */}

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
                                style={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                        "1fr 62px 50px",
                                    alignItems:
                                        "center",
                                    minHeight: 27,
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

                    {/* TOTAL */}

                    <div
                        style={{
                            display: "grid",
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
                            {formatValue(total)}
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