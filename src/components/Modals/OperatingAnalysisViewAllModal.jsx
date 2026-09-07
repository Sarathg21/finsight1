// import React from "react";

// /* =========================================================
//    FORMAT AMOUNT
// ========================================================= */

// const formatAmount = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === "" ||
//         value === "-"
//     ) {
//         return "—";
//     }

//     const number = Number(value);

//     if (Number.isNaN(number)) {
//         return "—";
//     }

//     return new Intl.NumberFormat("en-US", {
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 2,
//     }).format(number);
// };


// /* =========================================================
//    FORMAT PERCENTAGE
// ========================================================= */

// const formatPercentage = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === "" ||
//         value === "-"
//     ) {
//         return "—";
//     }

//     const number = Number(value);

//     if (Number.isNaN(number)) {
//         return "—";
//     }

//     return `${number.toFixed(2)}%`;
// };


// /* =========================================================
//    FILTER CHIP
// ========================================================= */

// const FilterChip = ({
//     label,
//     value,
// }) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ""
//     ) {
//         return null;
//     }

//     return (
//         <div
//             style={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "5px",
//                 padding: "5px 9px",
//                 background: "#f8fafc",
//                 border: "1px solid #e2e8f0",
//                 borderRadius: "6px",
//                 fontSize: "11px",
//                 color: "#475569",
//             }}
//         >
//             <span
//                 style={{
//                     fontWeight: 600,
//                 }}
//             >
//                 {label}:
//             </span>

//             <span>
//                 {value}
//             </span>
//         </div>
//     );
// };


// /* =========================================================
//    GET ROW VALUE
// ========================================================= */

// const getRowValue = (
//     row,
//     keys = []
// ) => {
//     for (const key of keys) {
//         if (
//             row?.[key] !== null &&
//             row?.[key] !== undefined &&
//             row?.[key] !== ""
//         ) {
//             return row[key];
//         }
//     }

//     return null;
// };


// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function OperatingAnalysisViewAllModal({

//     open,

//     onClose,

//     data = [],

//     loading = false,

//     activeFilters = {},

//     reportingCurrency = "AED",

//     /* =====================================================
//        COMMON CONFIGURATION
//     ===================================================== */

//     title = "Detailed View",

//     subtitle = "",

//     categoryLabel = "Category",

//     firstMetricLabel = "Amount",

//     secondMetricLabel = "Percentage",

//     firstMetricType = "amount",

//     secondMetricType = "percentage",

//     firstMetricKeys = [
//         "amount",
//         "amount_aed",
//     ],

//     secondMetricKeys = [
//         "percentage",
//     ],

//     categoryKeys = [
//         "category",
//         "name",
//     ],

//     totalLabel = "Total",

// }) {

//     if (!open) {
//         return null;
//     }


//     /* =====================================================
//        NORMALIZE DATA
//     ===================================================== */

//     const rows =
//         Array.isArray(data)
//             ? data
//             : [];


//     /* =====================================================
//        CURRENCY
//     ===================================================== */

//     const currency =
//         activeFilters?.reporting_currency ||
//         reportingCurrency ||
//         "AED";


//     /* =====================================================
//        TOTAL
//     ===================================================== */

//     const totalAmount =
//         rows.reduce(
//             (sum, row) => {

//                 const value =
//                     getRowValue(
//                         row,
//                         firstMetricKeys
//                     );

//                 const number =
//                     Number(value);

//                 return Number.isNaN(number)
//                     ? sum
//                     : sum + number;
//             },
//             0
//         );


//     /* =====================================================
//        TOTAL PERCENTAGE
//     ===================================================== */

//     const totalPercentage =
//         rows.reduce(
//             (sum, row) => {

//                 const value =
//                     getRowValue(
//                         row,
//                         secondMetricKeys
//                     );

//                 const number =
//                     Number(value);

//                 return Number.isNaN(number)
//                     ? sum
//                     : sum + number;
//             },
//             0
//         );


//     /* =====================================================
//        FORMAT FIRST METRIC
//     ===================================================== */

//     const formatFirstMetric = (
//         row
//     ) => {

//         const value =
//             getRowValue(
//                 row,
//                 firstMetricKeys
//             );

//         if (
//             firstMetricType ===
//             "amount"
//         ) {
//             return formatAmount(
//                 value
//             );
//         }

//         if (
//             firstMetricType ===
//             "percentage"
//         ) {
//             return formatPercentage(
//                 value
//             );
//         }

//         if (
//             value === null ||
//             value === undefined ||
//             value === ""
//         ) {
//             return "—";
//         }

//         return value;
//     };


//     /* =====================================================
//        FORMAT SECOND METRIC
//     ===================================================== */

//     const formatSecondMetric = (
//         row
//     ) => {

//         const value =
//             getRowValue(
//                 row,
//                 secondMetricKeys
//             );

//         if (
//             secondMetricType ===
//             "amount"
//         ) {
//             return formatAmount(
//                 value
//             );
//         }

//         if (
//             secondMetricType ===
//             "percentage"
//         ) {
//             return formatPercentage(
//                 value
//             );
//         }

//         if (
//             value === null ||
//             value === undefined ||
//             value === ""
//         ) {
//             return "—";
//         }

//         return value;
//     };


//     /* =====================================================
//        MODAL
//     ===================================================== */

//     return (
//         <div
//             onClick={(event) => {

//                 if (
//                     event.target ===
//                     event.currentTarget
//                 ) {
//                     onClose();
//                 }

//             }}

//             style={{
//                 position: "fixed",
//                 inset: 0,
//                 zIndex: 1000,

//                 background:
//                     "rgba(15, 23, 42, 0.45)",

//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",

//                 padding: "24px",
//             }}
//         >

//             <div
//                 style={{
//                     width: "100%",
//                     maxWidth: "1180px",
//                     maxHeight: "90vh",

//                     background: "#ffffff",

//                     borderRadius: "10px",

//                     boxShadow:
//                         "0 20px 50px rgba(0,0,0,0.18)",

//                     display: "flex",
//                     flexDirection: "column",

//                     overflow: "hidden",
//                 }}
//             >

//                 {/* =================================================
//                     HEADER
//                 ================================================= */}

//                 <div
//                     style={{
//                         padding:
//                             "18px 20px",

//                         borderBottom:
//                             "1px solid #e5e7eb",

//                         display: "flex",
//                         justifyContent:
//                             "space-between",
//                         alignItems: "flex-start",
//                         gap: "20px",
//                     }}
//                 >

//                     <div>

//                         <div
//                             style={{
//                                 fontSize:
//                                     "17px",
//                                 fontWeight: 700,
//                                 color:
//                                     "#111827",
//                             }}
//                         >
//                             {title}
//                         </div>

//                         {subtitle && (
//                             <div
//                                 style={{
//                                     marginTop:
//                                         "4px",
//                                     fontSize:
//                                         "12px",
//                                     color:
//                                         "#64748b",
//                                 }}
//                             >
//                                 {subtitle}
//                             </div>
//                         )}

//                     </div>


//                     <button
//                         type="button"
//                         onClick={onClose}
//                         style={{
//                             width: "30px",
//                             height: "30px",

//                             border:
//                                 "1px solid #e5e7eb",

//                             background:
//                                 "#ffffff",

//                             borderRadius:
//                                 "6px",

//                             cursor:
//                                 "pointer",

//                             fontSize:
//                                 "18px",

//                             color:
//                                 "#64748b",
//                         }}
//                     >
//                         ×
//                     </button>

//                 </div>


//                 {/* =================================================
//                     FILTER SUMMARY
//                 ================================================= */}

//                 <div
//                     style={{
//                         padding:
//                             "12px 20px",

//                         display: "flex",
//                         flexWrap: "wrap",
//                         gap: "6px",

//                         borderBottom:
//                             "1px solid #f1f5f9",
//                     }}
//                 >

//                     <FilterChip
//                         label="Year"
//                         value={
//                             activeFilters?.year
//                         }
//                     />

//                     <FilterChip
//                         label="Period"
//                         value={
//                             activeFilters?.period
//                         }
//                     />

//                     <FilterChip
//                         label="Currency"
//                         value={
//                             currency
//                         }
//                     />

//                     <FilterChip
//                         label="Legal Group"
//                         value={
//                             activeFilters?.legal_group
//                         }
//                     />

//                     <FilterChip
//                         label="Legal Entity"
//                         value={
//                             activeFilters?.legal_entity
//                         }
//                     />

//                     <FilterChip
//                         label="Parent Division"
//                         value={
//                             activeFilters?.parent_division
//                         }
//                     />

//                     <FilterChip
//                         label="Subdivision"
//                         value={
//                             activeFilters?.subdivision
//                         }
//                     />

//                 </div>


//                 {/* =================================================
//                     CONTENT
//                 ================================================= */}

//                 <div
//                     style={{
//                         padding:
//                             "18px 20px",

//                         overflowY:
//                             "auto",
//                     }}
//                 >

//                     {loading ? (

//                         <div
//                             style={{
//                                 minHeight:
//                                     "280px",

//                                 display:
//                                     "flex",

//                                 alignItems:
//                                     "center",

//                                 justifyContent:
//                                     "center",

//                                 color:
//                                     "#64748b",

//                                 fontSize:
//                                     "13px",
//                             }}
//                         >
//                             Loading detailed data...
//                         </div>

//                     ) : rows.length === 0 ? (

//                         <div
//                             style={{
//                                 minHeight:
//                                     "280px",

//                                 display:
//                                     "flex",

//                                 flexDirection:
//                                     "column",

//                                 alignItems:
//                                     "center",

//                                 justifyContent:
//                                     "center",

//                                 color:
//                                     "#64748b",
//                             }}
//                         >

//                             <div
//                                 style={{
//                                     fontSize:
//                                         "14px",
//                                     fontWeight:
//                                         600,
//                                     color:
//                                         "#334155",
//                                 }}
//                             >
//                                 No data available
//                             </div>

//                             <div
//                                 style={{
//                                     marginTop:
//                                         "5px",
//                                     fontSize:
//                                         "12px",
//                                 }}
//                             >
//                                 Try changing the selected filters.
//                             </div>

//                         </div>

//                     ) : (

//                         <>

//                             {/* =================================================
//                                 SUMMARY CARDS
//                             ================================================= */}

//                             <div
//                                 style={{
//                                     display:
//                                         "grid",

//                                     gridTemplateColumns:
//                                         "repeat(3, 1fr)",

//                                     gap: "10px",

//                                     marginBottom:
//                                         "16px",
//                                 }}
//                             >

//                                 <div
//                                     style={{
//                                         border:
//                                             "1px solid #e5e7eb",
//                                         borderRadius:
//                                             "8px",
//                                         padding:
//                                             "12px",
//                                     }}
//                                 >

//                                     <div
//                                         style={{
//                                             fontSize:
//                                                 "11px",
//                                             color:
//                                                 "#64748b",
//                                         }}
//                                     >
//                                         Total
//                                     </div>

//                                     <div
//                                         style={{
//                                             marginTop:
//                                                 "4px",
//                                             fontSize:
//                                                 "18px",
//                                             fontWeight:
//                                                 700,
//                                             color:
//                                                 "#111827",
//                                         }}
//                                     >
//                                         {currency}{" "}
//                                         {formatAmount(
//                                             totalAmount
//                                         )}
//                                     </div>

//                                 </div>


//                                 <div
//                                     style={{
//                                         border:
//                                             "1px solid #e5e7eb",
//                                         borderRadius:
//                                             "8px",
//                                         padding:
//                                             "12px",
//                                     }}
//                                 >

//                                     <div
//                                         style={{
//                                             fontSize:
//                                                 "11px",
//                                             color:
//                                                 "#64748b",
//                                         }}
//                                     >
//                                         Categories
//                                     </div>

//                                     <div
//                                         style={{
//                                             marginTop:
//                                                 "4px",
//                                             fontSize:
//                                                 "18px",
//                                             fontWeight:
//                                                 700,
//                                             color:
//                                                 "#111827",
//                                         }}
//                                     >
//                                         {rows.length}
//                                     </div>

//                                 </div>


//                                 <div
//                                     style={{
//                                         border:
//                                             "1px solid #e5e7eb",
//                                         borderRadius:
//                                             "8px",
//                                         padding:
//                                             "12px",
//                                     }}
//                                 >

//                                     <div
//                                         style={{
//                                             fontSize:
//                                                 "11px",
//                                             color:
//                                                 "#64748b",
//                                         }}
//                                     >
//                                         Total Percentage
//                                     </div>

//                                     <div
//                                         style={{
//                                             marginTop:
//                                                 "4px",
//                                             fontSize:
//                                                 "18px",
//                                             fontWeight:
//                                                 700,
//                                             color:
//                                                 "#111827",
//                                         }}
//                                     >
//                                         {formatPercentage(
//                                             totalPercentage
//                                         )}
//                                     </div>

//                                 </div>

//                             </div>


//                             {/* =================================================
//                                 TABLE
//                             ================================================= */}

//                             <div
//                                 style={{
//                                     border:
//                                         "1px solid #e5e7eb",

//                                     borderRadius:
//                                         "8px",

//                                     overflow:
//                                         "hidden",
//                                 }}
//                             >

//                                 <div
//                                     style={{
//                                         overflowX:
//                                             "auto",
//                                     }}
//                                 >

//                                     <table
//                                         style={{
//                                             width:
//                                                 "100%",

//                                             minWidth:
//                                                 "720px",

//                                             borderCollapse:
//                                                 "collapse",
//                                         }}
//                                     >

//                                         <thead>

//                                             <tr
//                                                 style={{
//                                                     background:
//                                                         "#f8fafc",
//                                                 }}
//                                             >

//                                                 <th
//                                                     style={{
//                                                         padding:
//                                                             "11px 14px",
//                                                         textAlign:
//                                                             "left",
//                                                         fontSize:
//                                                             "11px",
//                                                         fontWeight:
//                                                             700,
//                                                         color:
//                                                             "#475569",
//                                                         borderBottom:
//                                                             "1px solid #e5e7eb",
//                                                     }}
//                                                 >
//                                                     {categoryLabel}
//                                                 </th>

//                                                 <th
//                                                     style={{
//                                                         padding:
//                                                             "11px 14px",
//                                                         textAlign:
//                                                             "right",
//                                                         fontSize:
//                                                             "11px",
//                                                         fontWeight:
//                                                             700,
//                                                         color:
//                                                             "#475569",
//                                                         borderBottom:
//                                                             "1px solid #e5e7eb",
//                                                     }}
//                                                 >
//                                                     {firstMetricLabel}
//                                                     {firstMetricType ===
//                                                         "amount"
//                                                         ? ` (${currency})`
//                                                         : ""}
//                                                 </th>

//                                                 <th
//                                                     style={{
//                                                         padding:
//                                                             "11px 14px",
//                                                         textAlign:
//                                                             "right",
//                                                         fontSize:
//                                                             "11px",
//                                                         fontWeight:
//                                                             700,
//                                                         color:
//                                                             "#475569",
//                                                         borderBottom:
//                                                             "1px solid #e5e7eb",
//                                                     }}
//                                                 >
//                                                     {secondMetricLabel}
//                                                 </th>

//                                             </tr>

//                                         </thead>


//                                         <tbody>

//                                             {rows.map(
//                                                 (
//                                                     row,
//                                                     index
//                                                 ) => {

//                                                     const category =
//                                                         getRowValue(
//                                                             row,
//                                                             categoryKeys
//                                                         );

//                                                     return (
//                                                         <tr
//                                                             key={
//                                                                 `${category || "row"}-${index}`
//                                                             }
//                                                         >

//                                                             <td
//                                                                 style={{
//                                                                     padding:
//                                                                         "11px 14px",
//                                                                     fontSize:
//                                                                         "12px",
//                                                                     color:
//                                                                         "#334155",
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                 }}
//                                                             >
//                                                                 {category ||
//                                                                     "—"}
//                                                             </td>

//                                                             <td
//                                                                 style={{
//                                                                     padding:
//                                                                         "11px 14px",
//                                                                     fontSize:
//                                                                         "12px",
//                                                                     textAlign:
//                                                                         "right",
//                                                                     color:
//                                                                         "#111827",
//                                                                     fontWeight:
//                                                                         600,
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                 }}
//                                                             >
//                                                                 {formatFirstMetric(
//                                                                     row
//                                                                 )}
//                                                             </td>

//                                                             <td
//                                                                 style={{
//                                                                     padding:
//                                                                         "11px 14px",
//                                                                     fontSize:
//                                                                         "12px",
//                                                                     textAlign:
//                                                                         "right",
//                                                                     color:
//                                                                         "#334155",
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                 }}
//                                                             >
//                                                                 {formatSecondMetric(
//                                                                     row
//                                                                 )}
//                                                             </td>

//                                                         </tr>
//                                                     );
//                                                 }
//                                             )}

//                                         </tbody>


//                                         <tfoot>

//                                             <tr
//                                                 style={{
//                                                     background:
//                                                         "#f8fafc",
//                                                 }}
//                                             >

//                                                 <td
//                                                     style={{
//                                                         padding:
//                                                             "12px 14px",
//                                                         fontSize:
//                                                             "12px",
//                                                         fontWeight:
//                                                             700,
//                                                         color:
//                                                             "#111827",
//                                                     }}
//                                                 >
//                                                     {totalLabel}
//                                                 </td>

//                                                 <td
//                                                     style={{
//                                                         padding:
//                                                             "12px 14px",
//                                                         fontSize:
//                                                             "12px",
//                                                         textAlign:
//                                                             "right",
//                                                         fontWeight:
//                                                             700,
//                                                         color:
//                                                             "#111827",
//                                                     }}
//                                                 >
//                                                     {currency}{" "}
//                                                     {formatAmount(
//                                                         totalAmount
//                                                     )}
//                                                 </td>

//                                                 <td
//                                                     style={{
//                                                         padding:
//                                                             "12px 14px",
//                                                         fontSize:
//                                                             "12px",
//                                                         textAlign:
//                                                             "right",
//                                                         fontWeight:
//                                                             700,
//                                                         color:
//                                                             "#111827",
//                                                     }}
//                                                 >
//                                                     {formatPercentage(
//                                                         totalPercentage
//                                                     )}
//                                                 </td>

//                                             </tr>

//                                         </tfoot>

//                                     </table>

//                                 </div>

//                             </div>

//                         </>

//                     )}

//                 </div>


//                 {/* =================================================
//                     FOOTER
//                 ================================================= */}

//                 <div
//                     style={{
//                         padding:
//                             "12px 20px",

//                         borderTop:
//                             "1px solid #e5e7eb",

//                         display:
//                             "flex",

//                         justifyContent:
//                             "flex-end",
//                     }}
//                 >

//                     <button
//                         type="button"
//                         onClick={onClose}
//                         style={{
//                             padding:
//                                 "7px 16px",

//                             border:
//                                 "1px solid #d1d5db",

//                             borderRadius:
//                                 "6px",

//                             background:
//                                 "#ffffff",

//                             color:
//                                 "#374151",

//                             fontSize:
//                                 "12px",

//                             fontWeight:
//                                 600,

//                             cursor:
//                                 "pointer",
//                         }}
//                     >
//                         Close
//                     </button>

//                 </div>

//             </div>

//         </div>
//     );
// }

import React from "react";

/* =========================================================
   FORMAT AMOUNT
========================================================= */

const formatAmount = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-"
    ) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "—";
    }

    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(number);
};


/* =========================================================
   FORMAT PERCENTAGE
========================================================= */

const formatPercentage = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-"
    ) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "—";
    }

    return `${number.toFixed(2)}%`;
};


/* =========================================================
   CHECK VALUE
========================================================= */

const hasValue = (value) => {
    return !(
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-"
    );
};


/* =========================================================
   FILTER CHIP
========================================================= */

const FilterChip = ({
    label,
    value,
}) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "5px 9px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "11px",
                color: "#475569",
            }}
        >
            <span
                style={{
                    fontWeight: 600,
                }}
            >
                {label}:
            </span>

            <span>
                {value}
            </span>
        </div>
    );
};


/* =========================================================
   GET ROW VALUE
========================================================= */

const getRowValue = (
    row,
    keys = []
) => {
    for (const key of keys) {
        if (
            row?.[key] !== null &&
            row?.[key] !== undefined &&
            row?.[key] !== ""
        ) {
            return row[key];
        }
    }

    return null;
};


/* =========================================================
   ACTUAL VS TARGET TABLE
   ---------------------------------------------------------
   Backend response:

   category
   actual_ptd_aed
   target_ptd_aed
   ========================================================= */

const ActualVsTargetTable = ({
    rows,
    currency,
}) => {

    const totalActual = rows.reduce(
        (sum, row) => {

            const value =
                getRowValue(
                    row,
                    [
                        "actual_ptd_aed",
                        "actual_ptd",
                        "actual",
                    ]
                );

            if (!hasValue(value)) {
                return sum;
            }

            const number = Number(value);

            return Number.isNaN(number)
                ? sum
                : sum + number;
        },
        0
    );


    const targetValuesExist = rows.some(
        (row) => {
            const value =
                getRowValue(
                    row,
                    [
                        "target_ptd_aed",
                        "target_ptd",
                        "target",
                    ]
                );

            return hasValue(value);
        }
    );


    const totalTarget = rows.reduce(
        (sum, row) => {

            const value =
                getRowValue(
                    row,
                    [
                        "target_ptd_aed",
                        "target_ptd",
                        "target",
                    ]
                );

            if (!hasValue(value)) {
                return sum;
            }

            const number = Number(value);

            return Number.isNaN(number)
                ? sum
                : sum + number;
        },
        0
    );


    return (
        <div
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                overflow: "hidden",
            }}
        >

            <div
                style={{
                    overflowX: "auto",
                }}
            >

                <table
                    style={{
                        width: "100%",
                        minWidth: "620px",
                        borderCollapse: "collapse",
                    }}
                >

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <thead>

                        <tr
                            style={{
                                background: "#f8fafc",
                            }}
                        >

                            <th
                                style={{
                                    padding: "11px 14px",
                                    textAlign: "left",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#475569",
                                    borderBottom:
                                        "1px solid #e5e7eb",
                                }}
                            >
                                Expense Category
                            </th>


                            <th
                                style={{
                                    padding: "11px 14px",
                                    textAlign: "right",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#475569",
                                    borderBottom:
                                        "1px solid #e5e7eb",
                                }}
                            >
                                Actual PTD ({currency})
                            </th>


                            <th
                                style={{
                                    padding: "11px 14px",
                                    textAlign: "right",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#475569",
                                    borderBottom:
                                        "1px solid #e5e7eb",
                                }}
                            >
                                Target PTD ({currency})
                            </th>

                        </tr>

                    </thead>


                    {/* =================================================
                        BODY
                    ================================================= */}

                    <tbody>

                        {rows.map(
                            (
                                row,
                                index
                            ) => {

                                const category =
                                    getRowValue(
                                        row,
                                        [
                                            "category",
                                            "name",
                                        ]
                                    );


                                const actual =
                                    getRowValue(
                                        row,
                                        [
                                            "actual_ptd_aed",
                                            "actual_ptd",
                                            "actual",
                                        ]
                                    );


                                const target =
                                    getRowValue(
                                        row,
                                        [
                                            "target_ptd_aed",
                                            "target_ptd",
                                            "target",
                                        ]
                                    );


                                return (
                                    <tr
                                        key={
                                            `${category || "row"}-${index}`
                                        }
                                    >

                                        {/* CATEGORY */}

                                        <td
                                            style={{
                                                padding:
                                                    "11px 14px",
                                                fontSize:
                                                    "12px",
                                                color:
                                                    "#334155",
                                                fontWeight:
                                                    500,
                                                borderBottom:
                                                    "1px solid #f1f5f9",
                                            }}
                                        >
                                            {category || "—"}
                                        </td>


                                        {/* ACTUAL */}

                                        <td
                                            style={{
                                                padding:
                                                    "11px 14px",
                                                fontSize:
                                                    "12px",
                                                textAlign:
                                                    "right",
                                                color:
                                                    "#111827",
                                                fontWeight:
                                                    600,
                                                borderBottom:
                                                    "1px solid #f1f5f9",
                                            }}
                                        >
                                            {hasValue(actual)
                                                ? `${currency} ${formatAmount(actual)}`
                                                : "—"}
                                        </td>


                                        {/* TARGET */}

                                        <td
                                            style={{
                                                padding:
                                                    "11px 14px",
                                                fontSize:
                                                    "12px",
                                                textAlign:
                                                    "right",
                                                color:
                                                    "#334155",
                                                fontWeight:
                                                    600,
                                                borderBottom:
                                                    "1px solid #f1f5f9",
                                            }}
                                        >
                                            {hasValue(target)
                                                ? `${currency} ${formatAmount(target)}`
                                                : "—"}
                                        </td>

                                    </tr>
                                );
                            }
                        )}

                    </tbody>


                    {/* =================================================
                        TOTAL
                    ================================================= */}

                    <tfoot>

                        <tr
                            style={{
                                background: "#f8fafc",
                            }}
                        >

                            <td
                                style={{
                                    padding:
                                        "12px 14px",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        700,
                                    color:
                                        "#111827",
                                }}
                            >
                                Total
                            </td>


                            <td
                                style={{
                                    padding:
                                        "12px 14px",
                                    fontSize:
                                        "12px",
                                    textAlign:
                                        "right",
                                    fontWeight:
                                        700,
                                    color:
                                        "#111827",
                                }}
                            >
                                {currency}{" "}
                                {formatAmount(
                                    totalActual
                                )}
                            </td>


                            <td
                                style={{
                                    padding:
                                        "12px 14px",
                                    fontSize:
                                        "12px",
                                    textAlign:
                                        "right",
                                    fontWeight:
                                        700,
                                    color:
                                        "#111827",
                                }}
                            >
                                {targetValuesExist
                                    ? `${currency} ${formatAmount(
                                        totalTarget
                                    )}`
                                    : "—"}
                            </td>

                        </tr>

                    </tfoot>

                </table>

            </div>

        </div>
    );
};


/* =========================================================
   GENERIC TABLE
   ---------------------------------------------------------
   Used by OPEX Composition and Expense Category
   Drill-Down.
========================================================= */

const GenericTable = ({
    rows,
    currency,
    categoryLabel,
    firstMetricLabel,
    secondMetricLabel,
    firstMetricType,
    secondMetricType,
    firstMetricKeys,
    secondMetricKeys,
    categoryKeys,
    totalLabel,
}) => {

    /* =====================================================
       TOTAL AMOUNT
    ===================================================== */

    const totalAmount =
        rows.reduce(
            (sum, row) => {

                const value =
                    getRowValue(
                        row,
                        firstMetricKeys
                    );

                const number =
                    Number(value);

                return Number.isNaN(number)
                    ? sum
                    : sum + number;
            },
            0
        );


    /* =====================================================
       TOTAL PERCENTAGE
    ===================================================== */

    const totalPercentage =
        rows.reduce(
            (sum, row) => {

                const value =
                    getRowValue(
                        row,
                        secondMetricKeys
                    );

                const number =
                    Number(value);

                return Number.isNaN(number)
                    ? sum
                    : sum + number;
            },
            0
        );


    /* =====================================================
       FORMAT FIRST METRIC
    ===================================================== */

    const formatFirstMetric = (
        row
    ) => {

        const value =
            getRowValue(
                row,
                firstMetricKeys
            );

        if (
            firstMetricType ===
            "amount"
        ) {
            return formatAmount(
                value
            );
        }

        if (
            firstMetricType ===
            "percentage"
        ) {
            return formatPercentage(
                value
            );
        }

        if (!hasValue(value)) {
            return "—";
        }

        return value;
    };


    /* =====================================================
       FORMAT SECOND METRIC
    ===================================================== */

    const formatSecondMetric = (
        row
    ) => {

        const value =
            getRowValue(
                row,
                secondMetricKeys
            );

        if (
            secondMetricType ===
            "amount"
        ) {
            return formatAmount(
                value
            );
        }

        if (
            secondMetricType ===
            "percentage"
        ) {
            return formatPercentage(
                value
            );
        }

        if (!hasValue(value)) {
            return "—";
        }

        return value;
    };


    return (
        <div
            style={{
                border:
                    "1px solid #e5e7eb",

                borderRadius:
                    "8px",

                overflow:
                    "hidden",
            }}
        >

            <div
                style={{
                    overflowX:
                        "auto",
                }}
            >

                <table
                    style={{
                        width:
                            "100%",

                        minWidth:
                            "720px",

                        borderCollapse:
                            "collapse",
                    }}
                >

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <thead>

                        <tr
                            style={{
                                background:
                                    "#f8fafc",
                            }}
                        >

                            <th
                                style={{
                                    padding:
                                        "11px 14px",
                                    textAlign:
                                        "left",
                                    fontSize:
                                        "11px",
                                    fontWeight:
                                        700,
                                    color:
                                        "#475569",
                                    borderBottom:
                                        "1px solid #e5e7eb",
                                }}
                            >
                                {categoryLabel}
                            </th>


                            <th
                                style={{
                                    padding:
                                        "11px 14px",
                                    textAlign:
                                        "right",
                                    fontSize:
                                        "11px",
                                    fontWeight:
                                        700,
                                    color:
                                        "#475569",
                                    borderBottom:
                                        "1px solid #e5e7eb",
                                }}
                            >
                                {firstMetricLabel}

                                {firstMetricType ===
                                    "amount"
                                    ? ` (${currency})`
                                    : ""}
                            </th>


                            <th
                                style={{
                                    padding:
                                        "11px 14px",
                                    textAlign:
                                        "right",
                                    fontSize:
                                        "11px",
                                    fontWeight:
                                        700,
                                    color:
                                        "#475569",
                                    borderBottom:
                                        "1px solid #e5e7eb",
                                }}
                            >
                                {secondMetricLabel}
                            </th>

                        </tr>

                    </thead>


                    {/* =================================================
                        BODY
                    ================================================= */}

                    <tbody>

                        {rows.map(
                            (
                                row,
                                index
                            ) => {

                                const category =
                                    getRowValue(
                                        row,
                                        categoryKeys
                                    );

                                return (
                                    <tr
                                        key={
                                            `${category || "row"}-${index}`
                                        }
                                    >

                                        <td
                                            style={{
                                                padding:
                                                    "11px 14px",
                                                fontSize:
                                                    "12px",
                                                color:
                                                    "#334155",
                                                borderBottom:
                                                    "1px solid #f1f5f9",
                                            }}
                                        >
                                            {category ||
                                                "—"}
                                        </td>


                                        <td
                                            style={{
                                                padding:
                                                    "11px 14px",
                                                fontSize:
                                                    "12px",
                                                textAlign:
                                                    "right",
                                                color:
                                                    "#111827",
                                                fontWeight:
                                                    600,
                                                borderBottom:
                                                    "1px solid #f1f5f9",
                                            }}
                                        >
                                            {formatFirstMetric(
                                                row
                                            )}
                                        </td>


                                        <td
                                            style={{
                                                padding:
                                                    "11px 14px",
                                                fontSize:
                                                    "12px",
                                                textAlign:
                                                    "right",
                                                color:
                                                    "#334155",
                                                borderBottom:
                                                    "1px solid #f1f5f9",
                                            }}
                                        >
                                            {formatSecondMetric(
                                                row
                                            )}
                                        </td>

                                    </tr>
                                );
                            }
                        )}

                    </tbody>


                    {/* =================================================
                        TOTAL
                    ================================================= */}

                    <tfoot>

                        <tr
                            style={{
                                background:
                                    "#f8fafc",
                            }}
                        >

                            <td
                                style={{
                                    padding:
                                        "12px 14px",
                                    fontSize:
                                        "12px",
                                    fontWeight:
                                        700,
                                    color:
                                        "#111827",
                                }}
                            >
                                {totalLabel}
                            </td>


                            <td
                                style={{
                                    padding:
                                        "12px 14px",
                                    fontSize:
                                        "12px",
                                    textAlign:
                                        "right",
                                    fontWeight:
                                        700,
                                    color:
                                        "#111827",
                                }}
                            >
                                {currency}{" "}
                                {formatAmount(
                                    totalAmount
                                )}
                            </td>


                            <td
                                style={{
                                    padding:
                                        "12px 14px",
                                    fontSize:
                                        "12px",
                                    textAlign:
                                        "right",
                                    fontWeight:
                                        700,
                                    color:
                                        "#111827",
                                }}
                            >
                                {formatPercentage(
                                    totalPercentage
                                )}
                            </td>

                        </tr>

                    </tfoot>

                </table>

            </div>

        </div>
    );
};


/* =========================================================
   COMPONENT
========================================================= */

export default function OperatingAnalysisViewAllModal({

    open,

    onClose,

    data = [],

    loading = false,

    activeFilters = {},

    reportingCurrency = "AED",

    /* =====================================================
       COMMON CONFIGURATION
    ===================================================== */

    title = "Detailed View",

    subtitle = "",

    categoryLabel = "Category",

    firstMetricLabel = "Amount",

    secondMetricLabel = "Percentage",

    firstMetricType = "amount",

    secondMetricType = "percentage",

    firstMetricKeys = [
        "amount",
        "amount_aed",
    ],

    secondMetricKeys = [
        "percentage",
    ],

    categoryKeys = [
        "category",
        "name",
    ],

    totalLabel = "Total",

    /* =====================================================
       IMPORTANT
       This is passed from OperatingAnalysis.jsx
    ===================================================== */

    viewAllType = "",

}) {

    if (!open) {
        return null;
    }


    /* =====================================================
       NORMALIZE DATA
    ===================================================== */

    const rows =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
                ? data.items
                : Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.results)
                        ? data.results
                        : [];


    /* =====================================================
       CURRENCY
    ===================================================== */

    const currency =
        rows?.[0]?.reporting_currency ||
        activeFilters?.reporting_currency ||
        reportingCurrency ||
        "AED";


    /* =====================================================
       VIEW TYPE
    ===================================================== */

    const isActualVsTarget =
        viewAllType ===
        "actual-vs-target";


    const isExpenseCategory =
        viewAllType ===
        "expense-category";


    /* =====================================================
       GENERIC TOTAL
       Used for summary cards.

       For Actual vs Target we calculate actual PTD only.
    ===================================================== */

    const genericTotalAmount =
        rows.reduce(
            (sum, row) => {

                const value =
                    getRowValue(
                        row,
                        firstMetricKeys
                    );

                const number =
                    Number(value);

                return Number.isNaN(number)
                    ? sum
                    : sum + number;
            },
            0
        );


    const actualVsTargetTotal =
        rows.reduce(
            (sum, row) => {

                const value =
                    getRowValue(
                        row,
                        [
                            "actual_ptd_aed",
                            "actual_ptd",
                            "actual",
                        ]
                    );

                if (!hasValue(value)) {
                    return sum;
                }

                const number =
                    Number(value);

                return Number.isNaN(number)
                    ? sum
                    : sum + number;
            },
            0
        );


    const summaryTotal =
        isActualVsTarget
            ? actualVsTargetTotal
            : genericTotalAmount;


    /* =====================================================
       GENERIC TOTAL PERCENTAGE
    ===================================================== */

    const totalPercentage =
        rows.reduce(
            (sum, row) => {

                const value =
                    getRowValue(
                        row,
                        secondMetricKeys
                    );

                const number =
                    Number(value);

                return Number.isNaN(number)
                    ? sum
                    : sum + number;
            },
            0
        );


    /* =====================================================
       MODAL
    ===================================================== */

    return (
        <div
            onClick={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }

            }}

            style={{
                position:
                    "fixed",

                inset: 0,

                zIndex: 1000,

                background:
                    "rgba(15, 23, 42, 0.45)",

                display:
                    "flex",

                alignItems:
                    "center",

                justifyContent:
                    "center",

                padding:
                    "24px",
            }}
        >

            <div
                style={{
                    width:
                        "100%",

                    maxWidth:
                        "1180px",

                    maxHeight:
                        "90vh",

                    background:
                        "#ffffff",

                    borderRadius:
                        "10px",

                    boxShadow:
                        "0 20px 50px rgba(0,0,0,0.18)",

                    display:
                        "flex",

                    flexDirection:
                        "column",

                    overflow:
                        "hidden",
                }}
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    style={{
                        padding:
                            "18px 20px",

                        borderBottom:
                            "1px solid #e5e7eb",

                        display:
                            "flex",

                        justifyContent:
                            "space-between",

                        alignItems:
                            "flex-start",

                        gap:
                            "20px",
                    }}
                >

                    <div>

                        <div
                            style={{
                                fontSize:
                                    "17px",

                                fontWeight:
                                    700,

                                color:
                                    "#111827",
                            }}
                        >
                            {title}
                        </div>


                        {subtitle && (

                            <div
                                style={{
                                    marginTop:
                                        "4px",

                                    fontSize:
                                        "12px",

                                    color:
                                        "#64748b",
                                }}
                            >
                                {subtitle}
                            </div>

                        )}

                    </div>


                    <button
                        type="button"

                        onClick={
                            onClose
                        }

                        style={{
                            width:
                                "30px",

                            height:
                                "30px",

                            border:
                                "1px solid #e5e7eb",

                            background:
                                "#ffffff",

                            borderRadius:
                                "6px",

                            cursor:
                                "pointer",

                            fontSize:
                                "18px",

                            color:
                                "#64748b",
                        }}
                    >
                        ×
                    </button>

                </div>


                {/* =================================================
                    FILTER SUMMARY
                ================================================= */}

                <div
                    style={{
                        padding:
                            "12px 20px",

                        display:
                            "flex",

                        flexWrap:
                            "wrap",

                        gap:
                            "6px",

                        borderBottom:
                            "1px solid #f1f5f9",
                    }}
                >

                    <FilterChip
                        label="Year"
                        value={
                            activeFilters?.year
                        }
                    />


                    <FilterChip
                        label="Period"
                        value={
                            activeFilters?.period
                        }
                    />


                    <FilterChip
                        label="Currency"
                        value={
                            currency
                        }
                    />


                    <FilterChip
                        label="Legal Group"
                        value={
                            activeFilters?.legal_group
                        }
                    />


                    <FilterChip
                        label="Legal Entity"
                        value={
                            activeFilters?.legal_entity
                        }
                    />


                    <FilterChip
                        label="Parent Division"
                        value={
                            activeFilters?.parent_division
                        }
                    />


                    <FilterChip
                        label="Subdivision"
                        value={
                            activeFilters?.subdivision
                        }
                    />

                </div>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                    style={{
                        padding:
                            "18px 20px",

                        overflowY:
                            "auto",
                    }}
                >

                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading ? (

                        <div
                            style={{
                                minHeight:
                                    "280px",

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                color:
                                    "#64748b",

                                fontSize:
                                    "13px",
                            }}
                        >
                            Loading detailed data...
                        </div>

                    ) : rows.length === 0 ? (

                        /* =================================================
                            NO DATA
                        ================================================= */

                        <div
                            style={{
                                minHeight:
                                    "280px",

                                display:
                                    "flex",

                                flexDirection:
                                    "column",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                color:
                                    "#64748b",
                            }}
                        >

                            <div
                                style={{
                                    fontSize:
                                        "14px",

                                    fontWeight:
                                        600,

                                    color:
                                        "#334155",
                                }}
                            >
                                No data available
                            </div>


                            <div
                                style={{
                                    marginTop:
                                        "5px",

                                    fontSize:
                                        "12px",
                                }}
                            >
                                Try changing the selected filters.
                            </div>

                        </div>

                    ) : (

                        <>

                            {/* =================================================
                                SUMMARY CARDS
                            ================================================= */}

                            <div
                                style={{
                                    display:
                                        "grid",

                                    gridTemplateColumns:
                                        "repeat(3, 1fr)",

                                    gap:
                                        "10px",

                                    marginBottom:
                                        "16px",
                                }}
                            >

                                {/* =================================================
                                    TOTAL
                                ================================================= */}

                                <div
                                    style={{
                                        border:
                                            "1px solid #e5e7eb",

                                        borderRadius:
                                            "8px",

                                        padding:
                                            "12px",
                                    }}
                                >

                                    <div
                                        style={{
                                            fontSize:
                                                "11px",

                                            color:
                                                "#64748b",
                                        }}
                                    >
                                        {isActualVsTarget
                                            ? "Actual PTD Total"
                                            : "Total"}
                                    </div>


                                    <div
                                        style={{
                                            marginTop:
                                                "4px",

                                            fontSize:
                                                "18px",

                                            fontWeight:
                                                700,

                                            color:
                                                "#111827",
                                        }}
                                    >
                                        {currency}{" "}
                                        {formatAmount(
                                            summaryTotal
                                        )}
                                    </div>

                                </div>


                                {/* =================================================
                                    CATEGORIES
                                ================================================= */}

                                <div
                                    style={{
                                        border:
                                            "1px solid #e5e7eb",

                                        borderRadius:
                                            "8px",

                                        padding:
                                            "12px",
                                    }}
                                >

                                    <div
                                        style={{
                                            fontSize:
                                                "11px",

                                            color:
                                                "#64748b",
                                        }}
                                    >
                                        Categories
                                    </div>


                                    <div
                                        style={{
                                            marginTop:
                                                "4px",

                                            fontSize:
                                                "18px",

                                            fontWeight:
                                                700,

                                            color:
                                                "#111827",
                                        }}
                                    >
                                        {rows.length}
                                    </div>

                                </div>


                                {/* =================================================
                                    TOTAL PERCENTAGE
                                ================================================= */}

                                <div
                                    style={{
                                        border:
                                            "1px solid #e5e7eb",

                                        borderRadius:
                                            "8px",

                                        padding:
                                            "12px",
                                    }}
                                >

                                    <div
                                        style={{
                                            fontSize:
                                                "11px",

                                            color:
                                                "#64748b",
                                        }}
                                    >
                                        {isActualVsTarget
                                            ? "Target Availability"
                                            : "Total Percentage"}
                                    </div>


                                    <div
                                        style={{
                                            marginTop:
                                                "4px",

                                            fontSize:
                                                "18px",

                                            fontWeight:
                                                700,

                                            color:
                                                "#111827",
                                        }}
                                    >
                                        {isActualVsTarget
                                            ? (
                                                rows.some(
                                                    (row) =>
                                                        hasValue(
                                                            getRowValue(
                                                                row,
                                                                [
                                                                    "target_ptd_aed",
                                                                    "target_ptd",
                                                                    "target",
                                                                ]
                                                            )
                                                        )
                                                )
                                                    ? "Available"
                                                    : "—"
                                            )
                                            : formatPercentage(
                                                totalPercentage
                                            )}
                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                TABLE

                                IMPORTANT:

                                Actual vs Target gets its own
                                3-column table.

                                Other two View All pages continue
                                using the existing generic table.
                            ================================================= */}

                            {isActualVsTarget ? (

                                <ActualVsTargetTable
                                    rows={rows}
                                    currency={currency}
                                />

                            ) : (

                                <GenericTable
                                    rows={rows}
                                    currency={currency}
                                    categoryLabel={
                                        categoryLabel
                                    }
                                    firstMetricLabel={
                                        firstMetricLabel
                                    }
                                    secondMetricLabel={
                                        secondMetricLabel
                                    }
                                    firstMetricType={
                                        firstMetricType
                                    }
                                    secondMetricType={
                                        secondMetricType
                                    }
                                    firstMetricKeys={
                                        firstMetricKeys
                                    }
                                    secondMetricKeys={
                                        secondMetricKeys
                                    }
                                    categoryKeys={
                                        categoryKeys
                                    }
                                    totalLabel={
                                        totalLabel
                                    }
                                />

                            )}

                        </>

                    )}

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    style={{
                        padding:
                            "12px 20px",

                        borderTop:
                            "1px solid #e5e7eb",

                        display:
                            "flex",

                        justifyContent:
                            "flex-end",
                    }}
                >

                    <button
                        type="button"

                        onClick={
                            onClose
                        }

                        style={{
                            padding:
                                "7px 16px",

                            border:
                                "1px solid #d1d5db",

                            borderRadius:
                                "6px",

                            background:
                                "#ffffff",

                            color:
                                "#374151",

                            fontSize:
                                "12px",

                            fontWeight:
                                600,

                            cursor:
                                "pointer",
                        }}
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>
    );
}