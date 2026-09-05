// // // import React from "react";
// // // import {
// // //     ResponsiveContainer,
// // //     BarChart,
// // //     Bar,
// // //     XAxis,
// // //     YAxis,
// // //     CartesianGrid,
// // //     Tooltip,
// // //     Legend,
// // // } from "recharts";



// // // /* =========================================================
// // //    FORMAT VALUE
// // // ========================================================= */

// // // const formatValue = (value) => {
// // //     if (value === null || value === undefined || value === "") {
// // //         return "-";
// // //     }

// // //     return `${Number(value).toFixed(2)}M`;
// // // };

// // // /* =========================================================
// // //    CUSTOM TOOLTIP
// // // ========================================================= */

// // // function CustomTooltip({ active, payload, label }) {
// // //     if (!active || !payload || !payload.length) {
// // //         return null;
// // //     }

// // //     return (
// // //         <div
// // //             style={{
// // //                 background: "#FFFFFF",
// // //                 border: "1px solid #E5E7EB",
// // //                 borderRadius: 7,
// // //                 padding: "8px 10px",
// // //                 boxShadow: "0 4px 12px rgba(15, 23, 42, 0.10)",
// // //                 minWidth: 155,
// // //             }}
// // //         >
// // //             <div
// // //                 style={{
// // //                     fontSize: 10,
// // //                     fontWeight: 700,
// // //                     color: "#334155",
// // //                     marginBottom: 6,
// // //                 }}
// // //             >
// // //                 {label}
// // //             </div>

// // //             {payload.map((item) => (
// // //                 <div
// // //                     key={item.dataKey}
// // //                     style={{
// // //                         display: "flex",
// // //                         alignItems: "center",
// // //                         justifyContent: "space-between",
// // //                         gap: 15,
// // //                         marginTop: 4,
// // //                     }}
// // //                 >
// // //                     <div
// // //                         style={{
// // //                             display: "flex",
// // //                             alignItems: "center",
// // //                             gap: 5,
// // //                         }}
// // //                     >
// // //                         <span
// // //                             style={{
// // //                                 width: 7,
// // //                                 height: 7,
// // //                                 borderRadius: "2px",
// // //                                 backgroundColor: item.color,
// // //                                 display: "inline-block",
// // //                             }}
// // //                         />

// // //                         <span
// // //                             style={{
// // //                                 fontSize: 10,
// // //                                 color: "#64748B",
// // //                             }}
// // //                         >
// // //                             {item.name}
// // //                         </span>
// // //                     </div>

// // //                     <span
// // //                         style={{
// // //                             fontSize: 10,
// // //                             fontWeight: 700,
// // //                             color: "#0F172A",
// // //                         }}
// // //                     >
// // //                         AED {Number(item.value).toFixed(2)}M
// // //                     </span>
// // //                 </div>
// // //             ))}
// // //         </div>
// // //     );
// // // }

// // // /* =========================================================
// // //    CUSTOM Y AXIS LABEL
// // // ========================================================= */

// // // function CustomYAxisTick({ x, y, payload }) {
// // //     const text = payload.value;

// // //     return (
// // //         <g transform={`translate(${x},${y})`}>
// // //             <text
// // //                 x={0}
// // //                 y={0}
// // //                 textAnchor="end"
// // //                 dominantBaseline="middle"
// // //                 fill="#334155"
// // //                 fontSize={8}
// // //                 fontWeight={500}
// // //             >
// // //                 {text}
// // //             </text>
// // //         </g>
// // //     );
// // // }

// // // /* =========================================================
// // //    CUSTOM BAR LABEL
// // // ========================================================= */

// // // function CustomBarLabel({ x, y, width, value }) {
// // //     return (
// // //         <text
// // //             x={x + width + 5}
// // //             y={y + 3}
// // //             fill="#475569"
// // //             fontSize={8}
// // //             fontWeight={600}
// // //             textAnchor="start"
// // //         >
// // //             {Number(value).toFixed(2)}M
// // //         </text>
// // //     );
// // // }

// // // /* =========================================================
// // //    MAIN COMPONENT
// // // ========================================================= */

// // // export default function ActualVsTargetChart({
// // //     data
// // // }) {
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
// // //                     Actual vs Target by Expense Category
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
// // //           CHART
// // //       =================================================== */}

// // //             <div
// // //                 style={{
// // //                     flex: 1,
// // //                     minHeight: 235,
// // //                     width: "100%", 

// // //                 }}
// // //             >
// // //                 <ResponsiveContainer
// // //                     width="100%"
// // //                     height="100%"
// // //                 >
// // //                     <BarChart
// // //                         data={data}
// // //                         layout="vertical"
// // //                         margin={{
// // //                             top: 20,
// // //                             right: 38,
// // //                             left: 5,
// // //                             bottom: 20,
// // //                         }}
// // //                         barGap={2}
// // //                         barCategoryGap="25%"
// // //                     >

// // //                         {/* =================================================
// // //                 GRID
// // //             ================================================= */}

// // //                         <CartesianGrid
// // //                             strokeDasharray="3 3"
// // //                             horizontal={false}
// // //                             stroke="#E5E7EB"
// // //                         />

// // //                         {/* =================================================
// // //                 X AXIS
// // //             ================================================= */}

// // //                         <XAxis
// // //                             type="number"
// // //                             domain={[0, 4]}
// // //                             axisLine={{
// // //                                 stroke: "#CBD5E1",
// // //                             }}
// // //                             tickLine={false}
// // //                             tick={{
// // //                                 fill: "#64748B",
// // //                                 fontSize: 10,
// // //                             }}
// // //                             tickFormatter={(value) =>
// // //                                 value === 0 ? "0" : `${value}M`
// // //                             }
// // //                         />

// // //                         {/* =================================================
// // //                 Y AXIS
// // //             ================================================= */}

// // //                         <YAxis
// // //                             type="category"
// // //                             dataKey="category"
// // //                             width={125}
// // //                             axisLine={false}
// // //                             tickLine={false}
// // //                             interval={0}
// // //                             tick={<CustomYAxisTick />}
// // //                         />

// // //                         {/* =================================================
// // //                 TOOLTIP
// // //             ================================================= */}

// // //                         <Tooltip
// // //                             content={<CustomTooltip />}
// // //                             cursor={{
// // //                                 fill: "rgba(148, 163, 184, 0.08)",
// // //                             }}
// // //                         />

// // //                         {/* =================================================
// // //                 LEGEND
// // //             ================================================= */}

// // //                         <Legend
// // //                             verticalAlign="top"
// // //                             align="left"
// // //                             height={25}
// // //                             iconType="square"
// // //                             iconSize={7}
// // //                             wrapperStyle={{
// // //                                 fontSize: 10,
// // //                                 color: "#64748B",
// // //                                 paddingLeft: 125,
// // //                                 paddingBottom: 2,
// // //                             }}
// // //                         />

// // //                         {/* =================================================
// // //                 ACTUAL PTD
// // //             ================================================= */}

// // //                         <Bar
// // //                             dataKey="actual"
// // //                             name="Actual PTD (AED)"
// // //                             fill="#5B3FE4"
// // //                             radius={[0, 3, 3, 0]}
// // //                             maxBarSize={9}
// // //                             label={<CustomBarLabel />}
// // //                         />

// // //                         {/* =================================================
// // //                 TARGET PTD
// // //             ================================================= */}

// // //                         <Bar
// // //                             dataKey="target"
// // //                             name="Target PTD (AED)"
// // //                             fill="#C7BFF7"
// // //                             radius={[0, 3, 3, 0]}
// // //                             maxBarSize={9}
// // //                             label={<CustomBarLabel />}
// // //                         />

// // //                     </BarChart>
// // //                 </ResponsiveContainer>
// // //             </div>

// // //             {/* ===================================================
// // //           X AXIS TITLE
// // //       =================================================== */}

// // //             <div
// // //                 style={{
// // //                     textAlign: "center",
// // //                     fontWeight:700,
// // //                     fontSize: 10,
// // //                     color: "#64748B",
// // //                     marginTop: -2,
// // //                 }}
// // //             >
// // //                 Amount (AED)
// // //             </div>
// // //         </div>
// // //     );
// // // }

// // import React from "react";
// // import {
// //     ResponsiveContainer,
// //     BarChart,
// //     Bar,
// //     XAxis,
// //     YAxis,
// //     CartesianGrid,
// //     Tooltip,
// //     Legend,
// // } from "recharts";

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
// //     label,
// // }) {
// //     if (
// //         !active ||
// //         !payload ||
// //         !payload.length
// //     ) {
// //         return null;
// //     }

// //     return (
// //         <div
// //             style={{
// //                 background: "#FFFFFF",
// //                 border: "1px solid #E5E7EB",
// //                 borderRadius: 7,
// //                 padding: "8px 10px",
// //                 boxShadow:
// //                     "0 4px 12px rgba(15, 23, 42, 0.10)",
// //                 minWidth: 155,
// //             }}
// //         >
// //             <div
// //                 style={{
// //                     fontSize: 10,
// //                     fontWeight: 700,
// //                     color: "#334155",
// //                     marginBottom: 6,
// //                 }}
// //             >
// //                 {label}
// //             </div>

// //             {payload.map((item) => {
// //                 const value =
// //                     item?.value;

// //                 return (
// //                     <div
// //                         key={item.dataKey}
// //                         style={{
// //                             display: "flex",
// //                             alignItems: "center",
// //                             justifyContent:
// //                                 "space-between",
// //                             gap: 15,
// //                             marginTop: 4,
// //                         }}
// //                     >
// //                         <div
// //                             style={{
// //                                 display: "flex",
// //                                 alignItems:
// //                                     "center",
// //                                 gap: 5,
// //                             }}
// //                         >
// //                             <span
// //                                 style={{
// //                                     width: 7,
// //                                     height: 7,
// //                                     borderRadius: "2px",
// //                                     backgroundColor:
// //                                         item.color,
// //                                     display:
// //                                         "inline-block",
// //                                 }}
// //                             />

// //                             <span
// //                                 style={{
// //                                     fontSize: 10,
// //                                     color: "#64748B",
// //                                 }}
// //                             >
// //                                 {item.name}
// //                             </span>
// //                         </div>

// //                         <span
// //                             style={{
// //                                 fontSize: 10,
// //                                 fontWeight: 700,
// //                                 color: "#0F172A",
// //                             }}
// //                         >
// //                             {formatValue(value) === "—"
// //                                 ? "—"
// //                                 : `AED ${formatValue(
// //                                       value
// //                                   )}`}
// //                         </span>
// //                     </div>
// //                 );
// //             })}
// //         </div>
// //     );
// // }

// // /* =========================================================
// //    CUSTOM Y AXIS LABEL
// // ========================================================= */

// // function CustomYAxisTick({
// //     x,
// //     y,
// //     payload,
// // }) {
// //     const text = payload.value;

// //     return (
// //         <g
// //             transform={`translate(${x},${y})`}
// //         >
// //             <text
// //                 x={0}
// //                 y={0}
// //                 textAnchor="end"
// //                 dominantBaseline="middle"
// //                 fill="#334155"
// //                 fontSize={8}
// //                 fontWeight={500}
// //             >
// //                 {text}
// //             </text>
// //         </g>
// //     );
// // }

// // /* =========================================================
// //    CUSTOM BAR LABEL
// // ========================================================= */

// // function CustomBarLabel({
// //     x,
// //     y,
// //     width,
// //     value,
// // }) {
// //     const formatted =
// //         formatValue(value);

// //     return (
// //         <text
// //             x={x + width + 5}
// //             y={y + 3}
// //             fill="#475569"
// //             fontSize={8}
// //             fontWeight={600}
// //             textAnchor="start"
// //         >
// //             {formatted}
// //         </text>
// //     );
// // }

// // /* =========================================================
// //    MAIN COMPONENT
// // ========================================================= */

// // export default function ActualVsTargetChart({
// //     data = [],
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
// //                     Actual vs Target by Expense Category
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
// //                 CHART
// //             =================================================== */}

// //             <div
// //                 style={{
// //                     flex: 1,
// //                     minHeight: 235,
// //                     width: "100%",
// //                 }}
// //             >
// //                 <ResponsiveContainer
// //                     width="100%"
// //                     height="100%"
// //                 >
// //                     <BarChart
// //                         data={data}
// //                         layout="vertical"
// //                         margin={{
// //                             top: 20,
// //                             right: 38,
// //                             left: 5,
// //                             bottom: 20,
// //                         }}
// //                         barGap={2}
// //                         barCategoryGap="25%"
// //                     >
// //                         <CartesianGrid
// //                             strokeDasharray="3 3"
// //                             horizontal={false}
// //                             stroke="#E5E7EB"
// //                         />

// //                         <XAxis
// //                             type="number"
// //                             domain={[0, 4]}
// //                             axisLine={{
// //                                 stroke: "#CBD5E1",
// //                             }}
// //                             tickLine={false}
// //                             tick={{
// //                                 fill: "#64748B",
// //                                 fontSize: 10,
// //                             }}
// //                             tickFormatter={(value) =>
// //                                 value === 0
// //                                     ? "0"
// //                                     : `${value}M`
// //                             }
// //                         />

// //                         <YAxis
// //                             type="category"
// //                             dataKey="category"
// //                             width={125}
// //                             axisLine={false}
// //                             tickLine={false}
// //                             interval={0}
// //                             tick={
// //                                 <CustomYAxisTick />
// //                             }
// //                         />

// //                         <Tooltip
// //                             content={
// //                                 <CustomTooltip />
// //                             }
// //                             cursor={{
// //                                 fill:
// //                                     "rgba(148, 163, 184, 0.08)",
// //                             }}
// //                         />

// //                         <Legend
// //                             verticalAlign="top"
// //                             align="left"
// //                             height={25}
// //                             iconType="square"
// //                             iconSize={7}
// //                             wrapperStyle={{
// //                                 fontSize: 10,
// //                                 color: "#64748B",
// //                                 paddingLeft: 125,
// //                                 paddingBottom: 2,
// //                             }}
// //                         />

// //                         <Bar
// //                             dataKey="actual"
// //                             name="Actual PTD (AED)"
// //                             fill="#5B3FE4"
// //                             radius={[
// //                                 0,
// //                                 3,
// //                                 3,
// //                                 0,
// //                             ]}
// //                             maxBarSize={9}
// //                             label={
// //                                 <CustomBarLabel />
// //                             }
// //                         />

// //                         <Bar
// //                             dataKey="target"
// //                             name="Target PTD (AED)"
// //                             fill="#C7BFF7"
// //                             radius={[
// //                                 0,
// //                                 3,
// //                                 3,
// //                                 0,
// //                             ]}
// //                             maxBarSize={9}
// //                             label={
// //                                 <CustomBarLabel />
// //                             }
// //                         />
// //                     </BarChart>
// //                 </ResponsiveContainer>
// //             </div>

// //             {/* ===================================================
// //                 X AXIS TITLE
// //             =================================================== */}

// //             <div
// //                 style={{
// //                     textAlign: "center",
// //                     fontWeight: 700,
// //                     fontSize: 10,
// //                     color: "#64748B",
// //                     marginTop: -2,
// //                 }}
// //             >
// //                 Amount (AED)
// //             </div>
// //         </div>
// //     );
// // }


// import React from "react";
// import {
//     ResponsiveContainer,
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     Legend,
// } from "recharts";

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

//     return `${number.toFixed(2)}M`;
// };

// /* =========================================================
//    CUSTOM TOOLTIP
// ========================================================= */

// function CustomTooltip({
//     active,
//     payload,
//     label,
// }) {
//     if (
//         !active ||
//         !payload ||
//         !payload.length
//     ) {
//         return null;
//     }

//     return (
//         <div
//             style={{
//                 background: "#FFFFFF",
//                 border: "1px solid #E5E7EB",
//                 borderRadius: 7,
//                 padding: "8px 10px",
//                 boxShadow:
//                     "0 4px 12px rgba(15, 23, 42, 0.10)",
//                 minWidth: 155,
//             }}
//         >
//             <div
//                 style={{
//                     fontSize: 10,
//                     fontWeight: 700,
//                     color: "#334155",
//                     marginBottom: 6,
//                 }}
//             >
//                 {label}
//             </div>

//             {payload.map((item) => {
//                 const value = item?.value;

//                 return (
//                     <div
//                         key={item.dataKey}
//                         style={{
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent:
//                                 "space-between",
//                             gap: 15,
//                             marginTop: 4,
//                         }}
//                     >
//                         <div
//                             style={{
//                                 display: "flex",
//                                 alignItems:
//                                     "center",
//                                 gap: 5,
//                             }}
//                         >
//                             <span
//                                 style={{
//                                     width: 7,
//                                     height: 7,
//                                     borderRadius: "2px",
//                                     backgroundColor:
//                                         item.color,
//                                     display:
//                                         "inline-block",
//                                 }}
//                             />

//                             <span
//                                 style={{
//                                     fontSize: 10,
//                                     color: "#64748B",
//                                 }}
//                             >
//                                 {item.name}
//                             </span>
//                         </div>

//                         <span
//                             style={{
//                                 fontSize: 10,
//                                 fontWeight: 700,
//                                 color: "#0F172A",
//                             }}
//                         >
//                             {formatValue(value) === "—"
//                                 ? "—"
//                                 : `AED ${formatValue(
//                                     value
//                                 )}`}
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
// }) {
//     const text = payload.value;

//     return (
//         <g
//             transform={`translate(${x},${y})`}
//         >
//             <text
//                 x={0}
//                 y={0}
//                 textAnchor="end"
//                 dominantBaseline="middle"
//                 fill="#1E293B"
//                 fontSize={10}
//                 fontWeight={700}
//             >
//                 {text}
//             </text>
//         </g>
//     );
// }

// /* =========================================================
//    CUSTOM BAR LABEL
// ========================================================= */

// function CustomBarLabel({
//     x,
//     y,
//     width,
//     value,
// }) {
//     const formatted =
//         formatValue(value);

//     return (
//         <text
//             x={x + width + 5}
//             y={y + 3}
//             fill="#475569"
//             fontSize={8}
//             fontWeight={600}
//             textAnchor="start"
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
//                         fontSize: 11,
//                         lineHeight: "16px",
//                         fontWeight: 700,
//                         color: "#0F172A",
//                     }}
//                 >
//                     Actual vs Target by Expense Category
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
//                 CHART
//             =================================================== */}

//             <div
//                 style={{
//                     flex: 1,
//                     minHeight: 235,
//                     width: "100%",
//                 }}
//             >
//                 <ResponsiveContainer
//                     width="100%"
//                     height="100%"
//                 >
//                     <BarChart
//                         data={data}
//                         layout="vertical"
//                         margin={{
//                             top: 20,
//                             right: 38,
//                             left: 5,
//                             bottom: 20,
//                         }}
//                         barGap={2}
//                         barCategoryGap="25%"
//                     >
//                         <CartesianGrid
//                             strokeDasharray="3 3"
//                             horizontal={false}
//                             stroke="#E5E7EB"
//                         />

//                         <XAxis
//                             type="number"
//                             domain={[0, 4]}
//                             axisLine={{
//                                 stroke: "#CBD5E1",
//                             }}
//                             tickLine={false}
//                             tick={{
//                                 fill: "#475569",
//                                 fontSize: 10,
//                                 fontWeight: 700,
//                             }}
//                             tickFormatter={(value) =>
//                                 value === 0
//                                     ? "0"
//                                     : `${value}M`
//                             }
//                         />

//                         <YAxis
//                             type="category"
//                             dataKey="category"
//                             width={145}
//                             axisLine={false}
//                             tickLine={false}
//                             interval={0}
//                             tick={
//                                 <CustomYAxisTick />
//                             }
//                         />

//                         <Tooltip
//                             content={
//                                 <CustomTooltip />
//                             }
//                             cursor={{
//                                 fill:
//                                     "rgba(148, 163, 184, 0.08)",
//                             }}
//                         />

//                         <Legend
//                             verticalAlign="top"
//                             align="center"
//                             height={25}
//                             iconType="square"
//                             iconSize={7}
//                             wrapperStyle={{
//                                 fontSize: 11,
//                                 fontWeight: 700,
//                                 color: "#334155",
//                                 paddingLeft: 125,
//                                 paddingBottom: 2,
//                             }}
//                         />

//                         <Bar
//                             dataKey="actual"
//                             name="Actual PTD (AED)"
//                             fill="#5B3FE4"
//                             radius={[
//                                 0,
//                                 3,
//                                 3,
//                                 0,
//                             ]}
//                             maxBarSize={9}
//                             label={
//                                 <CustomBarLabel />
//                             }
//                         />

//                         <Bar
//                             dataKey="target"
//                             name="Target PTD (AED)"
//                             fill="#C7BFF7"
//                             radius={[
//                                 0,
//                                 3,
//                                 3,
//                                 0,
//                             ]}
//                             maxBarSize={9}
//                             label={
//                                 <CustomBarLabel />
//                             }
//                         />
//                     </BarChart>
//                 </ResponsiveContainer>
//             </div>

//             {/* ===================================================
//                 X AXIS TITLE
//             =================================================== */}

//             <div
//                 style={{
//                     textAlign: "center",
//                     fontWeight: 800,
//                     fontSize: 11,
//                     color: "#334155",
//                     marginTop: -2,
//                 }}
//             >
//                 Amount (AED)
//             </div>
//         </div>
//     );
// }

import React, { useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

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
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
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
        /*
         * Parent component is expected to send:
         *
         * {
         *   category: "Employee Cost",
         *   actual: 1101.4,
         *   target: null
         * }
         *
         * Also support raw API response just in case.
         */

        const actual =
            item?.actual !== undefined
                ? item.actual
                : item?.actual_ptd_aed;

        const target =
            item?.target !== undefined
                ? item.target
                : item?.target_ptd_aed;

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
}) {
    if (
        !active ||
        !payload ||
        !payload.length
    ) {
        return null;
    }

    return (
        <div
            style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 7,
                padding: "8px 10px",
                boxShadow:
                    "0 4px 12px rgba(15, 23, 42, 0.10)",
                minWidth: 155,
            }}
        >
            <div
                style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#334155",
                    marginBottom: 6,
                }}
            >
                {label}
            </div>

            {payload.map((item) => {
                const value = item?.value;

                return (
                    <div
                        key={item.dataKey}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                                "space-between",
                            gap: 15,
                            marginTop: 4,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems:
                                    "center",
                                gap: 5,
                            }}
                        >
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "2px",
                                    backgroundColor:
                                        item.color,
                                    display:
                                        "inline-block",
                                }}
                            />

                            <span
                                style={{
                                    fontSize: 10,
                                    color: "#64748B",
                                }}
                            >
                                {item.name}
                            </span>
                        </div>

                        <span
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#0F172A",
                            }}
                        >
                            {formatValue(value) === "—"
                                ? "—"
                                : `AED ${formatValue(
                                      value
                                  )}`}
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
}) {
    const text = payload.value;

    return (
        <g
            transform={`translate(${x},${y})`}
        >
            <text
                x={0}
                y={0}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#1E293B"
                fontSize={10}
                fontWeight={700}
            >
                {text}
            </text>
        </g>
    );
}

/* =========================================================
   CUSTOM BAR LABEL
========================================================= */

function CustomBarLabel({
    x,
    y,
    width,
    value,
}) {
    const formatted =
        formatValue(value);

    /*
     * Do not render a label for null target.
     */
    if (formatted === "—") {
        return null;
    }

    return (
        <text
            x={x + width + 5}
            y={y + 3}
            fill="#475569"
            fontSize={8}
            fontWeight={600}
            textAnchor="start"
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
}) {
    /* =======================================================
       NORMALIZED DATA
    ======================================================= */

    const chartData = useMemo(
        () => normalizeChartData(data),
        [data]
    );

    /* =======================================================
       X AXIS MAXIMUM
    ======================================================= */

    const xAxisMax = useMemo(() => {
        const values = chartData
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
            return 1000;
        }

        const maxValue = Math.max(...values);

        const calculatedMax =
            maxValue * 1.2;

        if (calculatedMax <= 1000) {
            return 1000;
        }

        if (calculatedMax <= 5000) {
            return 5000;
        }

        if (calculatedMax <= 10000) {
            return 10000;
        }

        if (calculatedMax <= 25000) {
            return 25000;
        }

        if (calculatedMax <= 50000) {
            return 50000;
        }

        if (calculatedMax <= 100000) {
            return 100000;
        }

        if (calculatedMax <= 250000) {
            return 250000;
        }

        if (calculatedMax <= 500000) {
            return 500000;
        }

        if (calculatedMax <= 1000000) {
            return 1000000;
        }

        return (
            Math.ceil(
                calculatedMax / 1000000
            ) * 1000000
        );
    }, [chartData]);

    /* =========================================================
       X AXIS TICK FORMAT
    ========================================================= */

    const formatXAxis = (value) => {
        if (value === 0) {
            return "0";
        }

        if (value >= 1000000) {
            return `${(
                value / 1000000
            ).toFixed(
                value % 1000000 === 0 ? 0 : 1
            )}M`;
        }

        if (value >= 1000) {
            return `${Math.round(
                value / 1000
            )}K`;
        }

        return `${Math.round(value)}`;
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
                        fontSize: 11,
                        lineHeight: "16px",
                        fontWeight: 700,
                        color: "#0F172A",
                    }}
                >
                    Actual vs Target by Expense Category
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
                CHART
            =================================================== */}

            <div
                style={{
                    flex: 1,
                    minHeight: 235,
                    width: "100%",
                }}
            >
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{
                            top: 20,
                            right: 38,
                            left: 5,
                            bottom: 20,
                        }}
                        barGap={2}
                        barCategoryGap="25%"
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke="#E5E7EB"
                        />

                        {/* =================================================
                            X AXIS
                        ================================================= */}

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
                                fontSize: 10,
                                fontWeight: 700,
                            }}
                            tickFormatter={
                                formatXAxis
                            }
                        />

                        {/* =================================================
                            Y AXIS
                        ================================================= */}

                        <YAxis
                            type="category"
                            dataKey="category"
                            width={145}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            tick={
                                <CustomYAxisTick />
                            }
                        />

                        {/* =================================================
                            TOOLTIP
                        ================================================= */}

                        <Tooltip
                            content={
                                <CustomTooltip />
                            }
                            cursor={{
                                fill:
                                    "rgba(148, 163, 184, 0.08)",
                            }}
                        />

                        {/* =================================================
                            LEGEND
                        ================================================= */}

                        <Legend
                            verticalAlign="top"
                            align="center"
                            height={25}
                            iconType="square"
                            iconSize={7}
                            wrapperStyle={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#334155",
                                paddingLeft: 125,
                                paddingBottom: 2,
                            }}
                        />

                        {/* =================================================
                            ACTUAL
                        ================================================= */}

                        <Bar
                            dataKey="actual"
                            name="Actual PTD (AED)"
                            fill="#5B3FE4"
                            radius={[
                                0,
                                3,
                                3,
                                0,
                            ]}
                            maxBarSize={9}
                            label={
                                <CustomBarLabel />
                            }
                        />

                        {/* =================================================
                            TARGET
                        ================================================= */}

                        <Bar
                            dataKey="target"
                            name="Target PTD (AED)"
                            fill="#C7BFF7"
                            radius={[
                                0,
                                3,
                                3,
                                0,
                            ]}
                            maxBarSize={9}
                            label={
                                <CustomBarLabel />
                            }
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ===================================================
                X AXIS TITLE
            =================================================== */}

            <div
                style={{
                    textAlign: "center",
                    fontWeight: 800,
                    fontSize: 11,
                    color: "#334155",
                    marginTop: -2,
                }}
            >
                Amount (AED)
            </div>
        </div>
    );
}