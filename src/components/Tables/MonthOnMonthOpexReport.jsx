
// import React, { useState } from "react";

// import {
//     ChevronRight,
//     ChevronDown,
//     ChevronsUp,
// } from "lucide-react";

// /* =========================================================
//    FORMAT VALUE
// ========================================================= */

// const formatValue = (value, unit = "millions") => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === "" ||
//         value === "-" ||
//         value === "—"
//     ) {
//         return "—";
//     }

//     const number = Number(value);

//     if (Number.isNaN(number)) {
//         return "—";
//     }

//     if (unit === "millions") {
//         const millions = number / 1000000;

//         if (number !== 0 && Math.abs(millions) < 0.01) {
//             return "<0.01M";
//         }

//         return `${millions.toFixed(2)}M`;
//     }

//     return Math.round(number).toLocaleString("en-IN");
// };

// /* =========================================================
//    MONTHS
// ========================================================= */

// const months = [
//     { key: "jan", label: "Jan" },
//     { key: "feb", label: "Feb" },
//     { key: "mar", label: "Mar" },
//     { key: "apr", label: "Apr" },
//     { key: "may", label: "May" },
//     { key: "jun", label: "Jun" },
//     { key: "jul", label: "Jul" },
//     { key: "aug", label: "Aug" },
//     { key: "sep", label: "Sep" },
//     { key: "oct", label: "Oct" },
//     { key: "nov", label: "Nov" },
//     { key: "dec", label: "Dec" },
// ];

// /* =========================================================
//    GET MONTHLY ACTUAL
// ========================================================= */

// const getMonthlyActual = (item) => {
//     return (
//         item?.monthly_actual ??
//         item?.monthlyActual ??
//         item?.monthly_actual_aed ??
//         item?.monthlyActualAed ??
//         null
//     );
// };

// /* =========================================================
//    GET MONTH VALUE
// ========================================================= */

// const getMonthValue = (item, monthKey, monthLabel) => {
//     const monthlyActual = getMonthlyActual(item);

//     if (
//         monthlyActual === null ||
//         monthlyActual === undefined
//     ) {
//         return null;
//     }

//     /* -------------------------------------------------------
//        OBJECT

//        Example:
//        {
//          "Jan-26": 8364319.95,
//          "Feb-26": 8417330,
//          "Sep-26": 664
//        }
//     ------------------------------------------------------- */

//     if (
//         typeof monthlyActual === "object" &&
//         !Array.isArray(monthlyActual)
//     ) {
//         const keys = Object.keys(monthlyActual);

//         const normalizedLabel = String(monthLabel)
//             .trim()
//             .toLowerCase();

//         const normalizedMonthKey = String(monthKey)
//             .trim()
//             .toLowerCase();

//         const matchingKey = keys.find((key) => {
//             const normalizedKey = String(key)
//                 .trim()
//                 .toLowerCase();

//             return (
//                 normalizedKey === normalizedLabel ||
//                 normalizedKey.startsWith(normalizedLabel) ||
//                 normalizedKey.startsWith(normalizedMonthKey)
//             );
//         });

//         if (matchingKey) {
//             return monthlyActual[matchingKey];
//         }

//         return null;
//     }

//     /* -------------------------------------------------------
//        ARRAY
//     ------------------------------------------------------- */

//     if (Array.isArray(monthlyActual)) {
//         const monthData = monthlyActual.find((entry) => {
//             const entryMonth =
//                 entry?.month ??
//                 entry?.month_name ??
//                 entry?.monthName;

//             if (!entryMonth) {
//                 return false;
//             }

//             const normalizedEntryMonth = String(entryMonth)
//                 .trim()
//                 .toLowerCase();

//             const normalizedLabel = String(monthLabel)
//                 .trim()
//                 .toLowerCase();

//             const normalizedKey = String(monthKey)
//                 .trim()
//                 .toLowerCase();

//             return (
//                 normalizedEntryMonth === normalizedLabel ||
//                 normalizedEntryMonth.startsWith(normalizedLabel) ||
//                 normalizedEntryMonth.startsWith(normalizedKey)
//             );
//         });

//         if (monthData) {
//             return (
//                 monthData?.value ??
//                 monthData?.actual ??
//                 monthData?.amount ??
//                 monthData?.monthly_actual ??
//                 null
//             );
//         }

//     }

//     return null;
// };

// /* =========================================================
//    GET TOTAL MONTH VALUE
// ========================================================= */

// const getTotalMonthValue = (
//     data,
//     monthKey,
//     monthLabel
// ) => {
//     if (!Array.isArray(data) || !data.length) {
//         return null;
//     }

//     let total = 0;
//     let hasValue = false;

//     data.forEach((item) => {
//         const value = getMonthValue(
//             item,
//             monthKey,
//             monthLabel
//         );

//         if (
//             value !== null &&
//             value !== undefined &&
//             value !== "" &&
//             value !== "-" &&
//             value !== "—"
//         ) {
//             const number = Number(value);

//             if (Number.isFinite(number)) {
//                 total += number;
//                 hasValue = true;
//             }
//         }
//     });

//     return hasValue ? total : null;
// };

// /* =========================================================
//    GET ACTUAL YTD
// ========================================================= */

// const getActualYTD = (item) => {
//     return (
//         item?.actual_ytd ??
//         item?.actualYTD ??
//         item?.actual_ytd_aed ??
//         item?.actualYtdaed ??
//         item?.ytd ??
//         null
//     );
// };

// /* =========================================================
//    GET TOTAL YTD
// ========================================================= */

// const getTotalYTD = (data) => {
//     if (!Array.isArray(data) || !data.length) {
//         return null;
//     }

//     let total = 0;
//     let hasValue = false;

//     data.forEach((item) => {
//         const value = getActualYTD(item);

//         if (
//             value !== null &&
//             value !== undefined &&
//             value !== "" &&
//             value !== "-" &&
//             value !== "—"
//         ) {
//             const number = Number(value);

//             if (Number.isFinite(number)) {
//                 total += number;
//                 hasValue = true;
//             }
//         }
//     });

//     return hasValue ? total : null;
// };

// /* =========================================================
//    GET TARGET YTD
// ========================================================= */

// const getTargetYTD = (item) => {
//     return (
//         item?.target_ytd ??
//         item?.targetYTD ??
//         item?.target ??
//         null
//     );
// };

// /* =========================================================
//    GET VARIANCE YTD
// ========================================================= */

// const getVarianceYTD = (item) => {
//     return (
//         item?.variance_ytd ??
//         item?.varianceYTD ??
//         item?.variance ??
//         null
//     );
// };

// /* =========================================================
//    GET VARIANCE %
// ========================================================= */

// const getVarianceYTDPercent = (item) => {
//     return (
//         item?.variance_ytd_pct ??
//         item?.varianceYTDPercent ??
//         item?.variancePercent ??
//         null
//     );
// };

// /* =========================================================
//    GET DETAILS FROM API RESPONSE
// ========================================================= */

// const getDetails = (value) => {
//     if (!value) {
//         return [];
//     }

//     if (Array.isArray(value)) {
//         return value;
//     }

//     if (Array.isArray(value?.data)) {
//         return value.data;
//     }

//     if (Array.isArray(value?.details)) {
//         return value.details;
//     }

//     if (Array.isArray(value?.categoryDetails)) {
//         return value.categoryDetails;
//     }

//     if (Array.isArray(value?.naturalAccounts)) {
//         return value.naturalAccounts;
//     }

//     return [];
// };

// /* =========================================================
//    GET ACCOUNT NAME
// ========================================================= */

// const getAccountName = (account) => {
//     return (
//         account?.account_name ??
//         account?.accountName ??
//         account?.natural_account_name ??
//         account?.naturalAccountName ??
//         account?.account ??
//         account?.name ??
//         "—"
//     );
// };

// /* =========================================================
//    GET ACCOUNT CODE
// ========================================================= */

// const getAccountCode = (account) => {
//     return (
//         account?.account_code ??
//         account?.accountCode ??
//         account?.natural_account_code ??
//         account?.naturalAccountCode ??
//         account?.natural_account_id ??
//         "—"
//     );
// };

// /* =========================================================
//    GET ACCOUNT MONTHLY DATA

//    category-detail API currently returns only:

//    actual_ptd
//    actual_ytd

//    It does NOT return monthly account-level values.

//    Therefore Jan-Dec correctly remain —.
// ========================================================= */

// const getAccountMonthValue = (
//     account,
//     monthKey,
//     monthLabel
// ) => {
//     return getMonthValue(
//         account,
//         monthKey,
//         monthLabel
//     );
// };

// /* =========================================================
//    MAIN COMPONENT
// ========================================================= */

// export default function MonthOnMonthOpexReport({
//     data = [],
//     totalData = null,
//     onExpandCategory,
//     detailLoading = {},
//     periodName = "Sep-26",
//     reportingCurrency = "AED",
// }) {
//     const [collapsed, setCollapsed] =
//         useState(false);

//     const [unit, setUnit] =
//         useState("millions");

//     const [expandedRows, setExpandedRows] =
//         useState({});

//     /* =======================================================
//        LAZY LOADED CATEGORY DETAILS

//        Example:

//        {
//          "Employee Cost": [
//            {
//              account_code: "950016",
//              account_name: "...",
//              actual_ptd: "...",
//              actual_ytd: "..."
//            }
//          ]
//        }
//     ======================================================= */

//     const [categoryDetails, setCategoryDetails] =
//         useState({});

//     const [categoryDetailLoading, setCategoryDetailLoading] =
//         useState({});

//     const [categoryDetailError, setCategoryDetailError] =
//         useState({});

//     /* =======================================================
//        NORMALIZE DATA

//        Supports both:

//        data = []

//        and

//        data = {
//          data: []
//        }
//     ======================================================= */

//     const rows = Array.isArray(data)
//         ? data
//         : Array.isArray(data?.data)
//             ? data.data
//             : [];

//     /* =======================================================
//        LOAD CATEGORY DETAIL

//        IMPORTANT:
//        This function is called ONLY after clicking >.
//     ======================================================= */

//     const loadCategoryDetails = async (
//         item
//     ) => {
//         const category =
//             item?.category;

//         if (!category) {
//             return [];
//         }

//         /* -----------------------------------------------------
//            Already loaded
//         ----------------------------------------------------- */

//         if (
//             Object.prototype.hasOwnProperty.call(
//                 categoryDetails,
//                 category
//             )
//         ) {
//             return categoryDetails[category];
//         }

//         /* -----------------------------------------------------
//            Already loading
//         ----------------------------------------------------- */

//         if (
//             categoryDetailLoading?.[category]
//         ) {
//             return [];
//         }

//         setCategoryDetailLoading(
//             (prev) => ({
//                 ...prev,
//                 [category]: true,
//             })
//         );

//         setCategoryDetailError(
//             (prev) => ({
//                 ...prev,
//                 [category]: null,
//             })
//         );

//         try {
//             /* ===================================================
//                API BASE

//                VITE_API_BASE_URL can be either:

//                http://13.233.207.68:8000

//                OR

//                http://13.233.207.68:8000/api
//             =================================================== */

//             const configuredBase =
//                 import.meta.env
//                     .VITE_API_BASE_URL ||
//                 "";

//             const base =
//                 configuredBase.replace(
//                     /\/+$/,
//                     ""
//                 );

//             const apiUrl = base.endsWith(
//                 "/api"
//             )
//                 ? `${base}/opex/category-detail`
//                 : `${base}/api/opex/category-detail`;

//             const params =
//                 new URLSearchParams({
//                     category,
//                     period_name:
//                         periodName,
//                     reporting_currency:
//                         reportingCurrency,
//                 });

//             const token =
//                 localStorage.getItem(
//                     "token"
//                 );

//             const response =
//                 await fetch(
//                     `${apiUrl}?${params.toString()}`,
//                     {
//                         method: "GET",
//                         headers: {
//                             Accept:
//                                 "application/json",

//                             ...(token
//                                 ? {
//                                     Authorization: `Bearer ${token}`,
//                                 }
//                                 : {}),
//                         },
//                     }
//                 );

//             if (!response.ok) {
//                 throw new Error(
//                     `Category detail request failed: ${response.status}`
//                 );
//             }

//             const responseData =
//                 await response.json();

//             const details =
//                 getDetails(responseData);

//             /* ---------------------------------------------------
//                Save API result by category
//             --------------------------------------------------- */

//             setCategoryDetails(
//                 (prev) => ({
//                     ...prev,
//                     [category]: details,
//                 })
//             );

//             return details;
//         } catch (error) {
//             console.error(
//                 "Failed to load OPEX category details:",
//                 error
//             );

//             setCategoryDetailError(
//                 (prev) => ({
//                     ...prev,
//                     [category]:
//                         error?.message ||
//                         "Failed to load category details.",
//                 })
//             );

//             return [];
//         } finally {
//             setCategoryDetailLoading(
//                 (prev) => ({
//                     ...prev,
//                     [category]: false,
//                 })
//             );
//         }
//     };

//     /* =======================================================
//        TOGGLE ROW

//        > click
//          ↓
//        expand
//          ↓
//        category-detail API
//          ↓
//        store response
//          ↓
//        render accounts
//     ======================================================= */

//     const toggleRow = async (
//         item,
//         category
//     ) => {
//         const willExpand =
//             !expandedRows[category];

//         setExpandedRows(
//             (prev) => ({
//                 ...prev,
//                 [category]:
//                     willExpand,
//             })
//         );

//         if (!willExpand) {
//             return;
//         }

//         /* =====================================================
//            FIRST: EXISTING CALLBACK

//            Keep this so existing parent functionality is not
//            broken.

//            If parent already handles some additional logic,
//            it will continue to work.
//         ===================================================== */

//         if (
//             typeof onExpandCategory ===
//             "function"
//         ) {
//             try {
//                 await onExpandCategory(
//                     item
//                 );
//             } catch (error) {
//                 console.error(
//                     "onExpandCategory failed:",
//                     error
//                 );
//             }
//         }

//         /* =====================================================
//            THEN LOAD THE ACTUAL CATEGORY DETAIL DATA

//            This guarantees this component receives and stores
//            the category-detail API response itself.
//         ===================================================== */

//         await loadCategoryDetails(
//             item
//         );
//     };

//     /* =======================================================
//        DISPLAY
//     ======================================================= */

//     const displayValue = (
//         value
//     ) => {
//         return formatValue(
//             value,
//             unit
//         );
//     };

//     /* =======================================================
//        VARIANCE COLOR
//     ======================================================= */

//     const getVarianceColor = (
//         value
//     ) => {
//         if (
//             value === null ||
//             value === undefined ||
//             value === ""
//         ) {
//             return "#94A3B8";
//         }

//         const number =
//             Number(value);

//         if (
//             Number.isNaN(number)
//         ) {
//             return "#94A3B8";
//         }

//         return number < 0
//             ? "#DC2626"
//             : "#16A34A";
//     };

//     /* =======================================================
//        TARGET
//     ======================================================= */

//     const displayTarget = (
//         value
//     ) => {
//         if (
//             value === null ||
//             value === undefined ||
//             value === ""
//         ) {
//             return "—";
//         }

//         return displayValue(
//             value
//         );
//     };

//     /* =======================================================
//        VARIANCE
//     ======================================================= */

//     const displayVariance = (
//         value
//     ) => {
//         if (
//             value === null ||
//             value === undefined ||
//             value === ""
//         ) {
//             return "—";
//         }

//         const number =
//             Number(value);

//         if (
//             Number.isNaN(number)
//         ) {
//             return "—";
//         }

//         if (number < 0) {
//             if (
//                 unit === "millions"
//             ) {
//                 const millions =
//                     Math.abs(number) /
//                     1000000;

//                 return `(${millions.toFixed(
//                     2
//                 )}M)`;
//             }

//             return `(${Math.round(
//                 Math.abs(number)
//             ).toLocaleString(
//                 "en-IN"
//             )})`;
//         }

//         return displayValue(
//             number
//         );
//     };

//     /* =======================================================
//        VARIANCE %
//     ======================================================= */

//     const displayVariancePercent =
//         (value) => {
//             if (
//                 value === null ||
//                 value === undefined ||
//                 value === ""
//             ) {
//                 return "—";
//             }

//             const number =
//                 Number(value);

//             if (
//                 Number.isNaN(number)
//             ) {
//                 return "—";
//             }

//             return `${number.toFixed(
//                 1
//             )}%`;
//         };

//     /* =======================================================
//        TOTAL VALUES
//     ======================================================= */

//     const totalActualYTD =
//         getTotalYTD(rows);

//     return (
//         <div
//             style={{
//                 width: "100%",
//                 background: "#FFFFFF",
//                 border:
//                     "1px solid #E5E7EB",
//                 borderRadius: 10,
//                 boxSizing:
//                     "border-box",
//                 overflow: "hidden",
//                 marginTop: 12,
//             }}
//         >
//             {/* HEADER */}

//             <div
//                 style={{
//                     height: 44,
//                     display: "flex",
//                     alignItems:
//                         "center",
//                     justifyContent:
//                         "space-between",
//                     padding: "0 12px",
//                     boxSizing:
//                         "border-box",
//                     borderBottom:
//                         collapsed
//                             ? "none"
//                             : "1px solid #F1F5F9",
//                 }}
//             >
//                 <h3
//                     style={{
//                         margin: 0,
//                         fontSize: 13,
//                         lineHeight:
//                             "16px",
//                         fontWeight: 700,
//                         color: "#0F172A",
//                         whiteSpace:
//                             "nowrap",
//                     }}
//                 >
//                     Month-on-Month OPEX Report
//                 </h3>

//                 <div
//                     style={{
//                         display: "flex",
//                         alignItems:
//                             "center",
//                         gap: 8,
//                     }}
//                 >
//                     <button
//                         type="button"
//                         onClick={() =>
//                             setCollapsed(
//                                 (prev) =>
//                                     !prev
//                             )
//                         }
//                         style={{
//                             display: "flex",
//                             alignItems:
//                                 "center",
//                             gap: 4,
//                             border: "none",
//                             background:
//                                 "transparent",
//                             padding:
//                                 "3px 4px",
//                             cursor:
//                                 "pointer",
//                             color:
//                                 "#5B3FE4",
//                             fontSize: 10,
//                             fontWeight: 600,
//                             whiteSpace:
//                                 "nowrap",
//                         }}
//                     >
//                         {collapsed ? (
//                             <ChevronDown
//                                 size={11}
//                                 strokeWidth={2}
//                             />
//                         ) : (
//                             <ChevronsUp
//                                 size={11}
//                                 strokeWidth={2}
//                             />
//                         )}

//                         {collapsed
//                             ? "Expand"
//                             : "Collapse"}
//                     </button>

//                     <button
//                         type="button"
//                         onClick={() =>
//                             setUnit("aed")
//                         }
//                         style={{
//                             height: 28,
//                             minWidth: 39,
//                             padding:
//                                 "0 9px",
//                             borderRadius: 6,
//                             border:
//                                 "1px solid #E2E8F0",
//                             background:
//                                 unit === "aed"
//                                     ? "#5B3FE4"
//                                     : "#FFFFFF",
//                             color:
//                                 unit === "aed"
//                                     ? "#FFFFFF"
//                                     : "#334155",
//                             fontSize: 9,
//                             fontWeight: 600,
//                             cursor:
//                                 "pointer",
//                         }}
//                     >
//                         AED
//                     </button>

//                     <button
//                         type="button"
//                         onClick={() =>
//                             setUnit(
//                                 "millions"
//                             )
//                         }
//                         style={{
//                             height: 28,
//                             minWidth: 74,
//                             padding:
//                                 "0 9px",
//                             borderRadius: 6,
//                             border:
//                                 unit ===
//                                     "millions"
//                                     ? "1px solid #5B3FE4"
//                                     : "1px solid #E2E8F0",
//                             background:
//                                 unit ===
//                                     "millions"
//                                     ? "#5B3FE4"
//                                     : "#FFFFFF",
//                             color:
//                                 unit ===
//                                     "millions"
//                                     ? "#FFFFFF"
//                                     : "#334155",
//                             fontSize: 9,
//                             fontWeight: 600,
//                             cursor:
//                                 "pointer",
//                         }}
//                     >
//                         AED Millions
//                     </button>

//                     <button
//                         type="button"
//                         style={{
//                             border: "none",
//                             background:
//                                 "transparent",
//                             padding:
//                                 "2px 3px",
//                             cursor:
//                                 "pointer",
//                             color:
//                                 "#64748B",
//                             fontSize: 17,
//                             lineHeight: 1,
//                             marginLeft: 1,
//                         }}
//                     >
//                         ⋮
//                     </button>
//                 </div>
//             </div>

//             {!collapsed && (
//                 <div
//                     style={{
//                         width: "100%",
//                         overflowX:
//                             "auto",
//                         overflowY:
//                             "hidden",
//                         padding:
//                             "0 8px 10px",
//                         boxSizing:
//                             "border-box",
//                     }}
//                 >
//                     <table
//                         style={{
//                             width: "100%",
//                             minWidth: 1500,
//                             borderCollapse:
//                                 "collapse",
//                             tableLayout:
//                                 "fixed",
//                         }}
//                     >
//                         <colgroup>
//                             <col
//                                 style={{
//                                     width:
//                                         "15.5%",
//                                 }}
//                             />

//                             {months.map(
//                                 (month) => (
//                                     <col
//                                         key={
//                                             month.key
//                                         }
//                                         style={{
//                                             width:
//                                                 "4.6%",
//                                         }}
//                                     />
//                                 )
//                             )}

//                             <col
//                                 style={{
//                                     width:
//                                         "6.8%",
//                                 }}
//                             />

//                             <col
//                                 style={{
//                                     width:
//                                         "6.8%",
//                                 }}
//                             />

//                             <col
//                                 style={{
//                                     width:
//                                         "6.8%",
//                                 }}
//                             />

//                             <col
//                                 style={{
//                                     width:
//                                         "7.5%",
//                                 }}
//                             />
//                         </colgroup>

//                         <thead>
//                             <tr
//                                 style={{
//                                     height: 43,
//                                     borderBottom:
//                                         "1px solid #E5E7EB",
//                                 }}
//                             >
//                                 <th
//                                     style={{
//                                         padding:
//                                             "0 7px",
//                                         textAlign:
//                                             "left",
//                                         color:
//                                             "#1E3A8A",
//                                         fontSize: 9,
//                                         fontWeight: 700,
//                                     }}
//                                 >
//                                     Expense Category
//                                 </th>

//                                 {months.map(
//                                     (month) => (
//                                         <th
//                                             key={
//                                                 month.key
//                                             }
//                                             style={{
//                                                 padding:
//                                                     "0 8px",
//                                                 textAlign:
//                                                     "right",
//                                                 color:
//                                                     "#1E3A8A",
//                                                 fontSize: 9,
//                                                 fontWeight: 700,
//                                                 whiteSpace:
//                                                     "nowrap",
//                                             }}
//                                         >
//                                             {
//                                                 month.label
//                                             }
//                                         </th>
//                                     )
//                                 )}

//                                 <th
//                                     style={{
//                                         padding:
//                                             "0 4px",
//                                         textAlign:
//                                             "right",
//                                         color:
//                                             "#1E3A8A",
//                                         fontSize: 9,
//                                         fontWeight: 700,
//                                         borderLeft:
//                                             "1px solid #E5E7EB",
//                                     }}
//                                 >
//                                     Actual YTD
//                                 </th>

//                                 <th
//                                     style={{
//                                         padding:
//                                             "0 4px",
//                                         textAlign:
//                                             "right",
//                                         color:
//                                             "#1E3A8A",
//                                         fontSize: 9,
//                                         fontWeight: 700,
//                                     }}
//                                 >
//                                     Target YTD
//                                 </th>

//                                 <th
//                                     style={{
//                                         padding:
//                                             "0 4px",
//                                         textAlign:
//                                             "right",
//                                         color:
//                                             "#1E3A8A",
//                                         fontSize: 9,
//                                         fontWeight: 700,
//                                     }}
//                                 >
//                                     Variance
//                                 </th>

//                                 <th
//                                     style={{
//                                         padding:
//                                             "0 4px",
//                                         textAlign:
//                                             "right",
//                                         color:
//                                             "#1E3A8A",
//                                         fontSize: 9,
//                                         fontWeight: 700,
//                                     }}
//                                 >
//                                     Variance %
//                                 </th>
//                             </tr>
//                         </thead>

//                         <tbody>
//                             {rows.map(
//                                 (
//                                     item,
//                                     index
//                                 ) => {
//                                     const rowKey =
//                                         item?.category ||
//                                         index;

//                                     const isExpanded =
//                                         !!expandedRows[
//                                         rowKey
//                                         ];

//                                     const actualYTD =
//                                         getActualYTD(
//                                             item
//                                         );

//                                     const targetYTD =
//                                         getTargetYTD(
//                                             item
//                                         );

//                                     const varianceYTD =
//                                         getVarianceYTD(
//                                             item
//                                         );

//                                     const varianceYTDPercent =
//                                         getVarianceYTDPercent(
//                                             item
//                                         );

//                                     const details =
//                                         getDetails(
//                                             categoryDetails[
//                                             rowKey
//                                             ]
//                                         );

//                                     const isLoading =
//                                         !!categoryDetailLoading[
//                                         rowKey
//                                         ] ||
//                                         !!detailLoading?.[
//                                         rowKey
//                                         ];

//                                     const error =
//                                         categoryDetailError[
//                                         rowKey
//                                         ];

//                                     return (
//                                         <React.Fragment
//                                             key={
//                                                 rowKey
//                                             }
//                                         >
//                                             <tr
//                                                 style={{
//                                                     height: 55,
//                                                     borderBottom:
//                                                         "1px solid #F1F5F9",
//                                                 }}
//                                             >
//                                                 <td
//                                                     style={{
//                                                         padding:
//                                                             "0 7px",
//                                                         textAlign:
//                                                             "left",
//                                                         fontSize: 10,
//                                                         fontWeight: 500,
//                                                         color:
//                                                             "#334155",
//                                                     }}
//                                                 >
//                                                     <button
//                                                         type="button"
//                                                         onClick={() =>
//                                                             toggleRow(
//                                                                 item,
//                                                                 rowKey
//                                                             )
//                                                         }
//                                                         style={{
//                                                             display:
//                                                                 "flex",
//                                                             alignItems:
//                                                                 "center",
//                                                             gap: 6,
//                                                             border:
//                                                                 "none",
//                                                             background:
//                                                                 "transparent",
//                                                             padding: 0,
//                                                             cursor:
//                                                                 "pointer",
//                                                             color:
//                                                                 "inherit",
//                                                             width:
//                                                                 "100%",
//                                                             textAlign:
//                                                                 "left",
//                                                         }}
//                                                     >
//                                                         {isExpanded ? (
//                                                             <ChevronDown
//                                                                 size={
//                                                                     12
//                                                                 }
//                                                                 strokeWidth={
//                                                                     1.8
//                                                                 }
//                                                                 color="#64748B"
//                                                             />
//                                                         ) : (
//                                                             <ChevronRight
//                                                                 size={
//                                                                     12
//                                                                 }
//                                                                 strokeWidth={
//                                                                     1.8
//                                                                 }
//                                                                 color="#64748B"
//                                                             />
//                                                         )}

//                                                         <span>
//                                                             {
//                                                                 item?.category
//                                                             }
//                                                         </span>
//                                                     </button>
//                                                 </td>

//                                                 {months.map(
//                                                     (
//                                                         month
//                                                     ) => {
//                                                         const value =
//                                                             getMonthValue(
//                                                                 item,
//                                                                 month.key,
//                                                                 month.label
//                                                             );

//                                                         const isEmpty =
//                                                             value ===
//                                                             null ||
//                                                             value ===
//                                                             undefined ||
//                                                             value ===
//                                                             "" ||
//                                                             value ===
//                                                             "-" ||
//                                                             value ===
//                                                             "—";

//                                                         return (
//                                                             <td
//                                                                 key={
//                                                                     month.key
//                                                                 }
//                                                                 style={{
//                                                                     padding:
//                                                                         "0 8px",
//                                                                     textAlign:
//                                                                         "right",
//                                                                     fontSize: 10,
//                                                                     fontWeight: 500,
//                                                                     color:
//                                                                         isEmpty
//                                                                             ? "#94A3B8"
//                                                                             : "#334155",
//                                                                     whiteSpace:
//                                                                         "nowrap",
//                                                                 }}
//                                                             >
//                                                                 {displayValue(
//                                                                     value
//                                                                 )}
//                                                             </td>
//                                                         );
//                                                     }
//                                                 )}

//                                                 <td
//                                                     style={{
//                                                         padding:
//                                                             "0 4px",
//                                                         textAlign:
//                                                             "right",
//                                                         fontSize: 10,
//                                                         fontWeight: 600,
//                                                         color:
//                                                             "#334155",
//                                                         borderLeft:
//                                                             "1px solid #E5E7EB",
//                                                     }}
//                                                 >
//                                                     {displayValue(
//                                                         actualYTD
//                                                     )}
//                                                 </td>

//                                                 <td
//                                                     style={{
//                                                         padding:
//                                                             "0 4px",
//                                                         textAlign:
//                                                             "right",
//                                                         fontSize: 10,
//                                                         fontWeight: 500,
//                                                         color:
//                                                             "#94A3B8",
//                                                     }}
//                                                 >
//                                                     {displayTarget(
//                                                         targetYTD
//                                                     )}
//                                                 </td>

//                                                 <td
//                                                     style={{
//                                                         padding:
//                                                             "0 4px",
//                                                         textAlign:
//                                                             "right",
//                                                         fontSize: 10,
//                                                         fontWeight: 600,
//                                                         color:
//                                                             getVarianceColor(
//                                                                 varianceYTD
//                                                             ),
//                                                     }}
//                                                 >
//                                                     {displayVariance(
//                                                         varianceYTD
//                                                     )}
//                                                 </td>

//                                                 <td
//                                                     style={{
//                                                         padding:
//                                                             "0 4px",
//                                                         textAlign:
//                                                             "right",
//                                                         fontSize: 10,
//                                                         fontWeight: 600,
//                                                         color:
//                                                             getVarianceColor(
//                                                                 varianceYTDPercent
//                                                             ),
//                                                     }}
//                                                 >
//                                                     {displayVariancePercent(
//                                                         varianceYTDPercent
//                                                     )}
//                                                 </td>
//                                             </tr>

//                                             {/* =================================================
//                           EXPANDED NATURAL ACCOUNT DETAILS
//                       ================================================= */}

//                                             {isExpanded && (
//                                                 <tr
//                                                     style={{
//                                                         background:
//                                                             "#FAFAFC",
//                                                     }}
//                                                 >
//                                                     <td
//                                                         colSpan={
//                                                             months.length +
//                                                             5
//                                                         }
//                                                         style={{
//                                                             padding:
//                                                                 "14px 27px",
//                                                         }}
//                                                     >
//                                                         {isLoading ? (
//                                                             <div
//                                                                 style={{
//                                                                     fontSize: 9,
//                                                                     color:
//                                                                         "#94A3B8",
//                                                                 }}
//                                                             >
//                                                                 Loading
//                                                                 natural-account
//                                                                 details...
//                                                             </div>
//                                                         ) : error ? (
//                                                             <div
//                                                                 style={{
//                                                                     fontSize: 9,
//                                                                     color:
//                                                                         "#DC2626",
//                                                                 }}
//                                                             >
//                                                                 Failed to
//                                                                 load
//                                                                 natural-account
//                                                                 details.
//                                                             </div>
//                                                         ) : !details.length ? (
//                                                             <div
//                                                                 style={{
//                                                                     fontSize: 9,
//                                                                     color:
//                                                                         "#94A3B8",
//                                                                 }}
//                                                             >
//                                                                 No
//                                                                 natural-account
//                                                                 details
//                                                                 available.
//                                                             </div>
//                                                         ) : (
//                                                             <div
//                                                                 style={{
//                                                                     width:
//                                                                         "100%",
//                                                                     overflowX:
//                                                                         "auto",
//                                                                 }}
//                                                             >
//                                                                 <div
//                                                                     style={{
//                                                                         fontSize: 10,
//                                                                         fontWeight: 700,
//                                                                         color:
//                                                                             "#0F172A",
//                                                                         marginBottom:
//                                                                             8,
//                                                                     }}
//                                                                 >
//                                                                     Natural-account
//                                                                     details
//                                                                     for{" "}
//                                                                     {
//                                                                         item?.category
//                                                                     }
//                                                                 </div>

//                                                                 <table
//                                                                     style={{
//                                                                         width:
//                                                                             "100%",
//                                                                         minWidth:
//                                                                             1300,
//                                                                         borderCollapse:
//                                                                             "collapse",
//                                                                         tableLayout:
//                                                                             "fixed",
//                                                                     }}
//                                                                 >
//                                                                     <colgroup>
//                                                                         <col
//                                                                             style={{
//                                                                                 width:
//                                                                                     "25%",
//                                                                             }}
//                                                                         />

//                                                                         {months.map(
//                                                                             (
//                                                                                 month
//                                                                             ) => (
//                                                                                 <col
//                                                                                     key={
//                                                                                         month.key
//                                                                                     }
//                                                                                     style={{
//                                                                                         width:
//                                                                                             "5.3%",
//                                                                                     }}
//                                                                                 />
//                                                                             )
//                                                                         )}
//                                                                     </colgroup>

//                                                                     <thead>
//                                                                         <tr
//                                                                             style={{
//                                                                                 height:
//                                                                                     34,
//                                                                                 borderBottom:
//                                                                                     "1px solid #E5E7EB",
//                                                                             }}
//                                                                         >
//                                                                             <th
//                                                                                 style={{
//                                                                                     padding:
//                                                                                         "0 7px",
//                                                                                     textAlign:
//                                                                                         "left",
//                                                                                     color:
//                                                                                         "#1E3A8A",
//                                                                                     fontSize: 9,
//                                                                                     fontWeight: 700,
//                                                                                 }}
//                                                                             >
//                                                                                 Natural
//                                                                                 Account
//                                                                             </th>

//                                                                             {months.map(
//                                                                                 (
//                                                                                     month
//                                                                                 ) => (
//                                                                                     <th
//                                                                                         key={
//                                                                                             month.key
//                                                                                         }
//                                                                                         style={{
//                                                                                             padding:
//                                                                                                 "0 8px",
//                                                                                             textAlign:
//                                                                                                 "right",
//                                                                                             color:
//                                                                                                 "#1E3A8A",
//                                                                                             fontSize: 9,
//                                                                                             fontWeight: 700,
//                                                                                             whiteSpace:
//                                                                                                 "nowrap",
//                                                                                         }}
//                                                                                     >
//                                                                                         {
//                                                                                             month.label
//                                                                                         }
//                                                                                     </th>
//                                                                                 )
//                                                                             )}
//                                                                         </tr>
//                                                                     </thead>

//                                                                     <tbody>
//                                                                         {details.map(
//                                                                             (
//                                                                                 account,
//                                                                                 accountIndex
//                                                                             ) => {
//                                                                                 const accountCode =
//                                                                                     getAccountCode(
//                                                                                         account
//                                                                                     );

//                                                                                 const accountName =
//                                                                                     getAccountName(
//                                                                                         account
//                                                                                     );

//                                                                                 return (
//                                                                                     <tr
//                                                                                         key={
//                                                                                             accountCode !==
//                                                                                                 "—"
//                                                                                                 ? accountCode
//                                                                                                 : accountIndex
//                                                                                         }
//                                                                                         style={{
//                                                                                             height:
//                                                                                                 42,
//                                                                                             borderBottom:
//                                                                                                 "1px solid #F1F5F9",
//                                                                                         }}
//                                                                                     >
//                                                                                         <td
//                                                                                             style={{
//                                                                                                 padding:
//                                                                                                     "0 7px",
//                                                                                                 textAlign:
//                                                                                                     "left",
//                                                                                                 fontSize: 9,
//                                                                                                 color:
//                                                                                                     "#334155",
//                                                                                                 fontWeight: 500,
//                                                                                                 whiteSpace:
//                                                                                                     "nowrap",
//                                                                                             }}
//                                                                                         >
//                                                                                             {accountCode !==
//                                                                                                 "—" && (
//                                                                                                     <span>
//                                                                                                         {
//                                                                                                             accountCode
//                                                                                                         }{" "}
//                                                                                                     </span>
//                                                                                                 )}

//                                                                                             {
//                                                                                                 accountName
//                                                                                             }
//                                                                                         </td>

//                                                                                         {months.map(
//                                                                                             (
//                                                                                                 month
//                                                                                             ) => {
//                                                                                                 const value =
//                                                                                                     getAccountMonthValue(
//                                                                                                         account,
//                                                                                                         month.key,
//                                                                                                         month.label
//                                                                                                     );

//                                                                                                 return (
//                                                                                                     <td
//                                                                                                         key={
//                                                                                                             month.key
//                                                                                                         }
//                                                                                                         style={{
//                                                                                                             padding:
//                                                                                                                 "0 8px",
//                                                                                                             textAlign:
//                                                                                                                 "right",
//                                                                                                             fontSize: 9,
//                                                                                                             color:
//                                                                                                                 value ===
//                                                                                                                     null ||
//                                                                                                                     value ===
//                                                                                                                     undefined ||
//                                                                                                                     value ===
//                                                                                                                     "" ||
//                                                                                                                     value ===
//                                                                                                                     "-" ||
//                                                                                                                     value ===
//                                                                                                                     "—"
//                                                                                                                     ? "#94A3B8"
//                                                                                                                     : "#334155",
//                                                                                                             whiteSpace:
//                                                                                                                 "nowrap",
//                                                                                                         }}
//                                                                                                     >
//                                                                                                         {displayValue(
//                                                                                                             value
//                                                                                                         )}
//                                                                                                     </td>
//                                                                                                 );
//                                                                                             }
//                                                                                         )}
//                                                                                     </tr>
//                                                                                 );
//                                                                             }
//                                                                         )}
//                                                                     </tbody>
//                                                                 </table>
//                                                             </div>
//                                                         )}
//                                                     </td>
//                                                 </tr>
//                                             )}
//                                         </React.Fragment>
//                                     );
//                                 }
//                             )}

//                             {/* =================================================
//                   TOTAL OPERATING EXPENSES
//               ================================================= */}

//                             <tr
//                                 style={{
//                                     height: 56,
//                                     background:
//                                         "#F4F2FF",
//                                 }}
//                             >
//                                 <td
//                                     style={{
//                                         padding:
//                                             "0 7px",
//                                         textAlign:
//                                             "left",
//                                         fontSize: 10,
//                                         fontWeight: 700,
//                                         color:
//                                             "#0F172A",
//                                     }}
//                                 >
//                                     <div
//                                         style={{
//                                             display:
//                                                 "flex",
//                                             alignItems:
//                                                 "center",
//                                             gap: 6,
//                                         }}
//                                     >
//                                         <ChevronRight
//                                             size={12}
//                                             strokeWidth={
//                                                 1.8
//                                             }
//                                             color="#64748B"
//                                         />

//                                         <span>
//                                             Total Operating
//                                             Expenses
//                                         </span>
//                                     </div>
//                                 </td>

//                                 {/* TOTAL JAN - DEC */}

//                                 {months.map(
//                                     (month) => {
//                                         const value =
//                                             getTotalMonthValue(
//                                                 rows,
//                                                 month.key,
//                                                 month.label
//                                             );

//                                         const isEmpty =
//                                             value ===
//                                             null ||
//                                             value ===
//                                             undefined ||
//                                             value ===
//                                             "" ||
//                                             value ===
//                                             "-" ||
//                                             value ===
//                                             "—";

//                                         return (
//                                             <td
//                                                 key={
//                                                     month.key
//                                                 }
//                                                 style={{
//                                                     padding:
//                                                         "0 8px",
//                                                     textAlign:
//                                                         "right",
//                                                     fontSize: 10,
//                                                     fontWeight: 700,
//                                                     color:
//                                                         isEmpty
//                                                             ? "#94A3B8"
//                                                             : "#0F172A",
//                                                     whiteSpace:
//                                                         "nowrap",
//                                                 }}
//                                             >
//                                                 {displayValue(
//                                                     value
//                                                 )}
//                                             </td>
//                                         );
//                                     }
//                                 )}

//                                 {/* TOTAL ACTUAL YTD */}

//                                 <td
//                                     style={{
//                                         padding:
//                                             "0 4px",
//                                         textAlign:
//                                             "right",
//                                         fontSize: 10,
//                                         fontWeight: 700,
//                                         color:
//                                             "#0F172A",
//                                         borderLeft:
//                                             "1px solid #DDD8F7",
//                                     }}
//                                 >
//                                     {displayValue(
//                                         totalActualYTD
//                                     )}
//                                 </td>

//                                 {/* TOTAL TARGET YTD */}

//                                 <td
//                                     style={{
//                                         padding:
//                                             "0 4px",
//                                         textAlign:
//                                             "right",
//                                         fontSize: 10,
//                                         fontWeight: 700,
//                                         color:
//                                             "#94A3B8",
//                                     }}
//                                 >
//                                     {displayTarget(
//                                         null
//                                     )}
//                                 </td>

//                                 {/* TOTAL VARIANCE */}

//                                 <td
//                                     style={{
//                                         padding:
//                                             "0 4px",
//                                         textAlign:
//                                             "right",
//                                         fontSize: 10,
//                                         fontWeight: 700,
//                                         color:
//                                             getVarianceColor(
//                                                 null
//                                             ),
//                                     }}
//                                 >
//                                     {displayVariance(
//                                         null
//                                     )}
//                                 </td>

//                                 {/* TOTAL VARIANCE % */}

//                                 <td
//                                     style={{
//                                         padding:
//                                             "0 4px",
//                                         textAlign:
//                                             "right",
//                                         fontSize: 10,
//                                         fontWeight: 700,
//                                         color:
//                                             getVarianceColor(
//                                                 null
//                                             ),
//                                     }}
//                                 >
//                                     {displayVariancePercent(
//                                         null
//                                     )}
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// }

import React, { useState } from "react";

import {
    ChevronRight,
    ChevronDown,
    ChevronsUp,
} from "lucide-react";

/* =========================================================
   FORMAT VALUE
========================================================= */

const formatValue = (value, unit = "millions") => {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-" ||
        value === "—"
    ) {
        return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "—";
    }

    /* -------------------------------------------------------
       GENUINE ZERO
    ------------------------------------------------------- */

    if (number === 0) {
        return "0";
    }

    if (unit === "millions") {
        const millions = number / 1000000;

        /* ---------------------------------------------------
           SMALL NON-ZERO VALUE
        --------------------------------------------------- */

        if (Math.abs(millions) < 0.01) {
            return millions < 0 ? "-<0.01M" : "<0.01M";
        }

        return `${millions.toFixed(2)}M`;
    }

    return Math.round(number).toLocaleString("en-IN");
};

/* =========================================================
   MONTHS
========================================================= */

const months = [
    { key: "jan", label: "Jan" },
    { key: "feb", label: "Feb" },
    { key: "mar", label: "Mar" },
    { key: "apr", label: "Apr" },
    { key: "may", label: "May" },
    { key: "jun", label: "Jun" },
    { key: "jul", label: "Jul" },
    { key: "aug", label: "Aug" },
    { key: "sep", label: "Sep" },
    { key: "oct", label: "Oct" },
    { key: "nov", label: "Nov" },
    { key: "dec", label: "Dec" },
];

/* =========================================================
   GET MONTHLY ACTUAL
========================================================= */

const getMonthlyActual = (item) => {
    return (
        item?.monthly_actual ??
        item?.monthlyActual ??
        item?.monthly_actual_aed ??
        item?.monthlyActualAed ??
        item?.monthly_actuals ??
        item?.monthlyActuals ??
        null
    );
};

/* =========================================================
   GET MONTH VALUE
========================================================= */

const getMonthValue = (
    item,
    monthKey,
    monthLabel
) => {
    const monthlyActual =
        getMonthlyActual(item);

    if (
        monthlyActual === null ||
        monthlyActual === undefined
    ) {
        return null;
    }

    /* -------------------------------------------------------
       OBJECT

       Supports:

       {
         "Jan-26": 8364319.95,
         "Feb-26": 8417330,
         "Sep-26": 664
       }

       Also supports:

       {
         jan: 100,
         feb: 200
       }
    ------------------------------------------------------- */

    if (
        typeof monthlyActual === "object" &&
        !Array.isArray(monthlyActual)
    ) {
        const keys =
            Object.keys(monthlyActual);

        const normalizedLabel =
            String(monthLabel)
                .trim()
                .toLowerCase();

        const normalizedMonthKey =
            String(monthKey)
                .trim()
                .toLowerCase();

        const matchingKey =
            keys.find((key) => {
                const normalizedKey =
                    String(key)
                        .trim()
                        .toLowerCase();

                return (
                    normalizedKey ===
                    normalizedLabel ||
                    normalizedKey.startsWith(
                        normalizedLabel
                    ) ||
                    normalizedKey ===
                    normalizedMonthKey ||
                    normalizedKey.startsWith(
                        normalizedMonthKey
                    )
                );
            });

        if (matchingKey) {
            const monthValue =
                monthlyActual[
                matchingKey
                ];

            /* -----------------------------------------------
               Some APIs return:

               { Jan: { actual: 123 } }
            ----------------------------------------------- */

            if (
                monthValue &&
                typeof monthValue === "object"
            ) {
                return (
                    monthValue?.value ??
                    monthValue?.actual ??
                    monthValue?.amount ??
                    monthValue?.monthly_actual ??
                    null
                );
            }

            return monthValue;
        }

        return null;
    }

    /* -------------------------------------------------------
       ARRAY
    ------------------------------------------------------- */

    if (
        Array.isArray(monthlyActual)
    ) {
        const monthData =
            monthlyActual.find(
                (entry) => {
                    const entryMonth =
                        entry?.month ??
                        entry?.month_name ??
                        entry?.monthName;

                    if (!entryMonth) {
                        return false;
                    }

                    const normalizedEntryMonth =
                        String(entryMonth)
                            .trim()
                            .toLowerCase();

                    const normalizedLabel =
                        String(monthLabel)
                            .trim()
                            .toLowerCase();

                    const normalizedKey =
                        String(monthKey)
                            .trim()
                            .toLowerCase();

                    return (
                        normalizedEntryMonth ===
                        normalizedLabel ||
                        normalizedEntryMonth.startsWith(
                            normalizedLabel
                        ) ||
                        normalizedEntryMonth ===
                        normalizedKey ||
                        normalizedEntryMonth.startsWith(
                            normalizedKey
                        )
                    );
                }
            );

        if (monthData) {
            return (
                monthData?.value ??
                monthData?.actual ??
                monthData?.amount ??
                monthData?.monthly_actual ??
                null
            );
        }
    }

    return null;
};

/* =========================================================
   GET TOTAL MONTH VALUE
========================================================= */

const getTotalMonthValue = (
    data,
    monthKey,
    monthLabel
) => {
    if (
        !Array.isArray(data) ||
        !data.length
    ) {
        return null;
    }

    let total = 0;
    let hasValue = false;

    data.forEach((item) => {
        const value =
            getMonthValue(
                item,
                monthKey,
                monthLabel
            );

        if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            value !== "-" &&
            value !== "—"
        ) {
            const number =
                Number(value);

            if (
                Number.isFinite(number)
            ) {
                total += number;
                hasValue = true;
            }
        }
    });

    return hasValue
        ? total
        : null;
};

/* =========================================================
   GET ACTUAL YTD
========================================================= */

const getActualYTD = (item) => {
    return (
        item?.actual_ytd ??
        item?.actualYTD ??
        item?.actual_ytd_aed ??
        item?.actualYtdaed ??
        item?.ytd ??
        null
    );
};

/* =========================================================
   GET TOTAL YTD
========================================================= */

const getTotalYTD = (data) => {
    if (
        !Array.isArray(data) ||
        !data.length
    ) {
        return null;
    }

    let total = 0;
    let hasValue = false;

    data.forEach((item) => {
        const value =
            getActualYTD(item);

        if (
            value !== null &&
            value !== undefined &&
            value !== "" &&
            value !== "-" &&
            value !== "—"
        ) {
            const number =
                Number(value);

            if (
                Number.isFinite(number)
            ) {
                total += number;
                hasValue = true;
            }
        }
    });

    return hasValue
        ? total
        : null;
};

/* =========================================================
   GET TARGET YTD
========================================================= */

const getTargetYTD = (item) => {
    return (
        item?.target_ytd ??
        item?.targetYTD ??
        item?.target ??
        null
    );
};

/* =========================================================
   GET VARIANCE YTD
========================================================= */

const getVarianceYTD = (item) => {
    return (
        item?.variance_ytd ??
        item?.varianceYTD ??
        item?.variance ??
        null
    );
};

/* =========================================================
   GET VARIANCE %
========================================================= */

const getVarianceYTDPercent = (item) => {
    return (
        item?.variance_ytd_pct ??
        item?.varianceYTDPercent ??
        item?.variancePercent ??
        null
    );
};

/* =========================================================
   GET DETAILS FROM API RESPONSE
========================================================= */

const getDetails = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    if (Array.isArray(value?.details)) {
        return value.details;
    }

    if (
        Array.isArray(
            value?.categoryDetails
        )
    ) {
        return value.categoryDetails;
    }

    if (
        Array.isArray(
            value?.naturalAccounts
        )
    ) {
        return value.naturalAccounts;
    }

    if (
        Array.isArray(
            value?.natural_accounts
        )
    ) {
        return value.natural_accounts;
    }

    if (
        Array.isArray(
            value?.accounts
        )
    ) {
        return value.accounts;
    }

    return [];
};

/* =========================================================
   GET ACCOUNT NAME
========================================================= */

const getAccountName = (account) => {
    return (
        account?.account_name ??
        account?.accountName ??
        account?.natural_account_name ??
        account?.naturalAccountName ??
        account?.account ??
        account?.name ??
        "—"
    );
};

/* =========================================================
   GET ACCOUNT CODE
========================================================= */

const getAccountCode = (account) => {
    return (
        account?.account_code ??
        account?.accountCode ??
        account?.natural_account_code ??
        account?.naturalAccountCode ??
        account?.natural_account_id ??
        "—"
    );
};

/* =========================================================
   GET NATURAL ACCOUNT LABEL

   Prevents duplicate account code display.

   Example:

   Code: 610100
   Name: 610100 - Salaries

   Result:
   610100 - Salaries

   Instead of:
   610100 610100 - Salaries
========================================================= */

const getNaturalAccountLabel = (
    account
) => {
    const code =
        String(
            getAccountCode(account) ?? ""
        ).trim();

    const name =
        String(
            getAccountName(account) ?? ""
        ).trim();

    if (
        !code ||
        code === "—"
    ) {
        return name || "—";
    }

    if (
        !name ||
        name === "—"
    ) {
        return code;
    }

    const normalizedCode =
        code.toLowerCase();

    const normalizedName =
        name.toLowerCase();

    /* -------------------------------------------------------
       Account name already contains the code.
    ------------------------------------------------------- */

    if (
        normalizedName ===
        normalizedCode ||
        normalizedName.startsWith(
            `${normalizedCode} -`
        ) ||
        normalizedName.startsWith(
            `${normalizedCode}-`
        ) ||
        normalizedName.startsWith(
            `${normalizedCode} `
        )
    ) {
        return name;
    }

    return `${code} ${name}`;
};

/* =========================================================
   GET ACCOUNT MONTH VALUE

   Reads monthly actuals returned by:

   /api/opex/category-detail-monthly
========================================================= */

const getAccountMonthValue = (
    account,
    monthKey,
    monthLabel
) => {
    return getMonthValue(
        account,
        monthKey,
        monthLabel
    );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MonthOnMonthOpexReport({
    data = [],
    totalData = null,

    detailLoading = {},
    periodName = "Sep-26",
    reportingCurrency = "AED",

    /*
     * Existing parent can pass the same hierarchy
     * filters used by the main OPEX page.
     *
     * Example:
     *
     * hierarchyFilters={{
     *   legal_group_code: "...",
     *   legal_entity_code: "...",
     *   parent_division_code: "...",
     *   subdivision_code: "...",
     *   business_unit_code: "...",
     *   analysis_code: "..."
     * }}
     *
     * No existing behavior is changed if this
     * prop is not supplied.
     */
    hierarchyFilters = {},
}) {
    const [collapsed, setCollapsed] =
        useState(false);

    const [unit, setUnit] =
        useState("millions");

    const [expandedRows, setExpandedRows] =
        useState({});

    /* =======================================================
       LAZY LOADED CATEGORY DETAILS
    ======================================================= */

    const [categoryDetails, setCategoryDetails] =
        useState({});

    const [categoryDetailLoading, setCategoryDetailLoading] =
        useState({});

    const [categoryDetailError, setCategoryDetailError] =
        useState({});

    /* =======================================================
       NORMALIZE DATA
    ======================================================= */

    const rows =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : [];

    /* =======================================================
       LOAD CATEGORY DETAIL

       LIVE API:
       /api/opex/category-detail-monthly

       Uses:

       - category
       - selected period
       - reporting currency
       - hierarchy filters
    ======================================================= */

    const loadCategoryDetails = async (item) => {
       

        const category = item?.category;

       
        if (!category) {
            console.log("NO CATEGORY - RETURNING");
            return [];
        }
        /* -------------------------------------------------
           Already loaded
        ------------------------------------------------- */

        if (
            Object.prototype.hasOwnProperty.call(
                categoryDetails,
                category
            )
        ) {
            return categoryDetails[
                category
            ];
        }

        /* -------------------------------------------------
           Already loading
        ------------------------------------------------- */

        if (
            categoryDetailLoading?.[
            category
            ]
        ) {
            return [];
        }

        setCategoryDetailLoading(
            (prev) => ({
                ...prev,
                [category]: true,
            })
        );

        setCategoryDetailError(
            (prev) => ({
                ...prev,
                [category]: null,
            })
        );

        try {
            /* =============================================
               API BASE
            ============================================= */

            const configuredBase =
                import.meta.env
                    .VITE_API_BASE_URL ||
                "";

            const base =
                configuredBase.replace(
                    /\/+$/,
                    ""
                );

            /* =============================================
               LIVE MONTHLY CATEGORY DETAIL ENDPOINT
            ============================================= */

            const apiUrl =
                base.endsWith("/api")
                    ? `${base}/opex/category-detail-monthly`
                    : `${base}/api/opex/category-detail-monthly`;

            /* =============================================
               REQUEST PARAMETERS

               Required:
               - category
               - period_name
               - reporting_currency

               Plus the same hierarchy filters
               supplied by the main OPEX page.
            ============================================= */

            const params =
                new URLSearchParams();

            /* ---------------------------------------------
               Category
            --------------------------------------------- */

            params.set(
                "category",
                category
            );

            /* ---------------------------------------------
               Selected Period
            --------------------------------------------- */

            params.set(
                "period_name",
                periodName
            );

            /* ---------------------------------------------
               Reporting Currency
            --------------------------------------------- */

            params.set(
                "reporting_currency",
                reportingCurrency
            );

            /* ---------------------------------------------
               SAME HIERARCHY FILTERS

               Only non-empty values are added.

               This keeps the API request synchronized
               with the main OPEX page filters.
            --------------------------------------------- */

            if (
                hierarchyFilters &&
                typeof hierarchyFilters ===
                "object"
            ) {
                Object.entries(
                    hierarchyFilters
                ).forEach(
                    ([key, value]) => {
                        if (
                            value !==
                            null &&
                            value !==
                            undefined &&
                            value !==
                            "" &&
                            value !==
                            "—"
                        ) {
                            params.set(
                                key,
                                String(value)
                            );
                        }
                    }
                );
            }

            /* =============================================
               AUTH TOKEN
            ============================================= */

            const token =
                localStorage.getItem(
                    "finsight_token"
                );

            /* =============================================
               API REQUEST
            ============================================= */

            const response =
                await fetch(
                    `${apiUrl}?${params.toString()}`,
                    {
                        method: "GET",

                        headers: {
                            Accept:
                                "application/json",

                            ...(token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`,
                                }
                                : {}),
                        },
                    }
                );

            if (
                !response.ok
            ) {
                throw new Error(
                    `Category detail monthly request failed: ${response.status}`
                );
            }

            const responseData =
                await response.json();

            /* =============================================
               EXTRACT NATURAL ACCOUNT DATA
            ============================================= */

            const details =
                getDetails(
                    responseData
                );

            /* =============================================
               SAVE API RESULT BY CATEGORY
            ============================================= */

            setCategoryDetails(
                (prev) => ({
                    ...prev,
                    [category]:
                        details,
                })
            );

            return details;
        } catch (error) {
            console.error(
                "Failed to load OPEX category monthly details:",
                error
            );

            setCategoryDetailError(
                (prev) => ({
                    ...prev,
                    [category]:
                        error?.message ||
                        "Failed to load category monthly details.",
                })
            );

            return [];
        } finally {
            setCategoryDetailLoading(
                (prev) => ({
                    ...prev,
                    [category]: false,
                })
            );
        }
    };

    /* =======================================================
       TOGGLE ROW

       >
       ↓
       expand
       ↓
       category-detail-monthly API
       ↓
       store response
       ↓
       render natural accounts
    ======================================================= */

    const toggleRow = async (item, category) => {
        const willExpand = !expandedRows[category];

        setExpandedRows((prev) => ({
            ...prev,
            [category]: willExpand,
        }));

        if (!willExpand) {
            return;
        }

        await loadCategoryDetails(item);
    };


   
    /* =======================================================
       DISPLAY
    ======================================================= */

    const displayValue = (
        value
    ) => {
        return formatValue(
            value,
            unit
        );
    };

    /* =======================================================
       VARIANCE COLOR
    ======================================================= */

    const getVarianceColor = (
        value
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "#94A3B8";
        }

        const number =
            Number(value);

        if (
            Number.isNaN(number)
        ) {
            return "#94A3B8";
        }

        return number < 0
            ? "#DC2626"
            : "#16A34A";
    };

    /* =======================================================
       TARGET

       Null target = —
    ======================================================= */

    const displayTarget = (
        value
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        return displayValue(
            value
        );
    };

    /* =======================================================
       VARIANCE

       Null variance = —

       No status is displayed.
    ======================================================= */

    const displayVariance = (
        value
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        const number =
            Number(value);

        if (
            Number.isNaN(number)
        ) {
            return "—";
        }

        if (number === 0) {
            return "0";
        }

        if (number < 0) {
            if (
                unit === "millions"
            ) {
                const millions =
                    Math.abs(number) /
                    1000000;

                if (
                    millions < 0.01
                ) {
                    return "(<0.01M)";
                }

                return `(${millions.toFixed(
                    2
                )}M)`;
            }

            return `(${Math.round(
                Math.abs(number)
            ).toLocaleString(
                "en-IN"
            )})`;
        }

        return displayValue(
            number
        );
    };

    /* =======================================================
       VARIANCE %
    ======================================================= */

    const displayVariancePercent =
        (value) => {
            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                return "—";
            }

            const number =
                Number(value);

            if (
                Number.isNaN(number)
            ) {
                return "—";
            }

            return `${number.toFixed(
                1
            )}%`;
        };

    /* =======================================================
       TOTAL VALUES
    ======================================================= */

    const totalActualYTD =
        getTotalYTD(rows);

    return (
        <div
            style={{
                width: "100%",
                background: "#FFFFFF",
                border:
                    "1px solid #E5E7EB",
                borderRadius: 10,
                boxSizing:
                    "border-box",
                overflow: "hidden",
                marginTop: 12,
            }}
        >
            {/* HEADER */}

            <div
                style={{
                    height: 44,
                    display: "flex",
                    alignItems:
                        "center",
                    justifyContent:
                        "space-between",
                    padding: "0 12px",
                    boxSizing:
                        "border-box",
                    borderBottom:
                        collapsed
                            ? "none"
                            : "1px solid #F1F5F9",
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight:
                            "16px",
                        fontWeight: 700,
                        color: "#0F172A",
                        whiteSpace:
                            "nowrap",
                    }}
                >
                    Month-on-Month OPEX Report
                </h3>

                <div
                    style={{
                        display: "flex",
                        alignItems:
                            "center",
                        gap: 8,
                    }}
                >
                    <button
                        type="button"
                        onClick={() =>
                            setCollapsed(
                                (prev) =>
                                    !prev
                            )
                        }
                        style={{
                            display: "flex",
                            alignItems:
                                "center",
                            gap: 4,
                            border: "none",
                            background:
                                "transparent",
                            padding:
                                "3px 4px",
                            cursor:
                                "pointer",
                            color:
                                "#5B3FE4",
                            fontSize: 10,
                            fontWeight: 600,
                            whiteSpace:
                                "nowrap",
                        }}
                    >
                        {collapsed ? (
                            <ChevronDown
                                size={11}
                                strokeWidth={
                                    2
                                }
                            />
                        ) : (
                            <ChevronsUp
                                size={11}
                                strokeWidth={
                                    2
                                }
                            />
                        )}

                        {collapsed
                            ? "Expand"
                            : "Collapse"}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setUnit("aed")
                        }
                        style={{
                            height: 28,
                            minWidth: 39,
                            padding:
                                "0 9px",
                            borderRadius: 6,
                            border:
                                "1px solid #E2E8F0",
                            background:
                                unit === "aed"
                                    ? "#5B3FE4"
                                    : "#FFFFFF",
                            color:
                                unit === "aed"
                                    ? "#FFFFFF"
                                    : "#334155",
                            fontSize: 9,
                            fontWeight: 600,
                            cursor:
                                "pointer",
                        }}
                    >
                        AED
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setUnit(
                                "millions"
                            )
                        }
                        style={{
                            height: 28,
                            minWidth: 74,
                            padding:
                                "0 9px",
                            borderRadius: 6,
                            border:
                                unit ===
                                    "millions"
                                    ? "1px solid #5B3FE4"
                                    : "1px solid #E2E8F0",
                            background:
                                unit ===
                                    "millions"
                                    ? "#5B3FE4"
                                    : "#FFFFFF",
                            color:
                                unit ===
                                    "millions"
                                    ? "#FFFFFF"
                                    : "#334155",
                            fontSize: 9,
                            fontWeight: 600,
                            cursor:
                                "pointer",
                        }}
                    >
                        AED Millions
                    </button>

                    <button
                        type="button"
                        style={{
                            border: "none",
                            background:
                                "transparent",
                            padding:
                                "2px 3px",
                            cursor:
                                "pointer",
                            color:
                                "#64748B",
                            fontSize: 17,
                            lineHeight: 1,
                            marginLeft: 1,
                        }}
                    >
                        ⋮
                    </button>
                </div>
            </div>

            {!collapsed && (
                <div
                    style={{
                        width: "100%",
                        overflowX:
                            "auto",
                        overflowY:
                            "hidden",
                        padding:
                            "0 8px 10px",
                        boxSizing:
                            "border-box",
                    }}
                >
                    <table
                        style={{
                            width: "100%",
                            minWidth: 1500,
                            borderCollapse:
                                "collapse",
                            tableLayout:
                                "fixed",
                        }}
                    >
                        <colgroup>
                            <col
                                style={{
                                    width:
                                        "15.5%",
                                }}
                            />

                            {months.map(
                                (month) => (
                                    <col
                                        key={
                                            month.key
                                        }
                                        style={{
                                            width:
                                                "4.6%",
                                        }}
                                    />
                                )
                            )}

                            <col
                                style={{
                                    width:
                                        "6.8%",
                                }}
                            />

                            <col
                                style={{
                                    width:
                                        "6.8%",
                                }}
                            />

                            <col
                                style={{
                                    width:
                                        "6.8%",
                                }}
                            />

                            <col
                                style={{
                                    width:
                                        "7.5%",
                                }}
                            />
                        </colgroup>

                        <thead>
                            <tr
                                style={{
                                    height: 43,
                                    borderBottom:
                                        "1px solid #E5E7EB",
                                }}
                            >
                                <th
                                    style={{
                                        padding:
                                            "0 7px",
                                        textAlign:
                                            "left",
                                        color:
                                            "#1E3A8A",
                                        fontSize: 9,
                                        fontWeight: 700,
                                    }}
                                >
                                    Expense Category
                                </th>

                                {months.map(
                                    (month) => (
                                        <th
                                            key={
                                                month.key
                                            }
                                            style={{
                                                padding:
                                                    "0 8px",
                                                textAlign:
                                                    "right",
                                                color:
                                                    "#1E3A8A",
                                                fontSize: 9,
                                                fontWeight: 700,
                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {
                                                month.label
                                            }
                                        </th>
                                    )
                                )}

                                <th
                                    style={{
                                        padding:
                                            "0 4px",
                                        textAlign:
                                            "right",
                                        color:
                                            "#1E3A8A",
                                        fontSize: 9,
                                        fontWeight: 700,
                                        borderLeft:
                                            "1px solid #E5E7EB",
                                    }}
                                >
                                    Actual YTD
                                </th>

                                <th
                                    style={{
                                        padding:
                                            "0 4px",
                                        textAlign:
                                            "right",
                                        color:
                                            "#1E3A8A",
                                        fontSize: 9,
                                        fontWeight: 700,
                                    }}
                                >
                                    Target YTD
                                </th>

                                <th
                                    style={{
                                        padding:
                                            "0 4px",
                                        textAlign:
                                            "right",
                                        color:
                                            "#1E3A8A",
                                        fontSize: 9,
                                        fontWeight: 700,
                                    }}
                                >
                                    Variance
                                </th>

                                <th
                                    style={{
                                        padding:
                                            "0 4px",
                                        textAlign:
                                            "right",
                                        color:
                                            "#1E3A8A",
                                        fontSize: 9,
                                        fontWeight: 700,
                                    }}
                                >
                                    Variance %
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map(
                                (
                                    item,
                                    index
                                ) => {
                                    const rowKey =
                                        item?.category ||
                                        index;

                                    const isExpanded =
                                        !!expandedRows[
                                        rowKey
                                        ];

                                    const actualYTD =
                                        getActualYTD(
                                            item
                                        );

                                    const targetYTD =
                                        getTargetYTD(
                                            item
                                        );

                                    const varianceYTD =
                                        getVarianceYTD(
                                            item
                                        );

                                    const varianceYTDPercent =
                                        getVarianceYTDPercent(
                                            item
                                        );

                                    const details =
                                        getDetails(
                                            categoryDetails[
                                            rowKey
                                            ]
                                        );

                                    const isLoading =
                                        !!categoryDetailLoading[
                                        rowKey
                                        ] ||
                                        !!detailLoading?.[
                                        rowKey
                                        ];

                                    const error =
                                        categoryDetailError[
                                        rowKey
                                        ];

                                    return (
                                        <React.Fragment
                                            key={
                                                rowKey
                                            }
                                        >
                                            {/* =================================================
                                                CATEGORY ROW
                                            ================================================= */}

                                            <tr
                                                style={{
                                                    height: 55,
                                                    borderBottom:
                                                        "1px solid #F1F5F9",
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding:
                                                            "0 7px",
                                                        textAlign:
                                                            "left",
                                                        fontSize: 10,
                                                        fontWeight: 500,
                                                        color:
                                                            "#334155",
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleRow(
                                                                item,
                                                                rowKey
                                                            )
                                                        }
                                                        style={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 6,
                                                            border:
                                                                "none",
                                                            background:
                                                                "transparent",
                                                            padding: 0,
                                                            cursor:
                                                                "pointer",
                                                            color:
                                                                "inherit",
                                                            width:
                                                                "100%",
                                                            textAlign:
                                                                "left",
                                                        }}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown
                                                                size={
                                                                    12
                                                                }
                                                                strokeWidth={
                                                                    1.8
                                                                }
                                                                color="#64748B"
                                                            />
                                                        ) : (
                                                            <ChevronRight
                                                                size={
                                                                    12
                                                                }
                                                                strokeWidth={
                                                                    1.8
                                                                }
                                                                color="#64748B"
                                                            />
                                                        )}

                                                        <span>
                                                            {
                                                                item?.category
                                                            }
                                                        </span>
                                                    </button>
                                                </td>

                                                {months.map(
                                                    (
                                                        month
                                                    ) => {
                                                        const value =
                                                            getMonthValue(
                                                                item,
                                                                month.key,
                                                                month.label
                                                            );

                                                        const isEmpty =
                                                            value ===
                                                            null ||
                                                            value ===
                                                            undefined ||
                                                            value ===
                                                            "" ||
                                                            value ===
                                                            "-" ||
                                                            value ===
                                                            "—";

                                                        return (
                                                            <td
                                                                key={
                                                                    month.key
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "0 8px",
                                                                    textAlign:
                                                                        "right",
                                                                    fontSize: 10,
                                                                    fontWeight: 500,
                                                                    color:
                                                                        isEmpty
                                                                            ? "#94A3B8"
                                                                            : "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {displayValue(
                                                                    value
                                                                )}
                                                            </td>
                                                        );
                                                    }
                                                )}

                                                <td
                                                    style={{
                                                        padding:
                                                            "0 4px",
                                                        textAlign:
                                                            "right",
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        color:
                                                            "#334155",
                                                        borderLeft:
                                                            "1px solid #E5E7EB",
                                                    }}
                                                >
                                                    {displayValue(
                                                        actualYTD
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "0 4px",
                                                        textAlign:
                                                            "right",
                                                        fontSize: 10,
                                                        fontWeight: 500,
                                                        color:
                                                            "#94A3B8",
                                                    }}
                                                >
                                                    {displayTarget(
                                                        targetYTD
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "0 4px",
                                                        textAlign:
                                                            "right",
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        color:
                                                            getVarianceColor(
                                                                varianceYTD
                                                            ),
                                                    }}
                                                >
                                                    {displayVariance(
                                                        varianceYTD
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "0 4px",
                                                        textAlign:
                                                            "right",
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        color:
                                                            getVarianceColor(
                                                                varianceYTDPercent
                                                            ),
                                                    }}
                                                >
                                                    {displayVariancePercent(
                                                        varianceYTDPercent
                                                    )}
                                                </td>
                                            </tr>

                                            {/* =================================================
                                                EXPANDED NATURAL ACCOUNT DETAILS
                                            ================================================= */}

                                            {isExpanded && (
                                                <tr
                                                    style={{
                                                        background:
                                                            "#FAFAFC",
                                                    }}
                                                >
                                                    <td
                                                        colSpan={
                                                            months.length +
                                                            5
                                                        }
                                                        style={{
                                                            padding:
                                                                "14px 27px",
                                                        }}
                                                    >
                                                        {isLoading ? (
                                                            <div
                                                                style={{
                                                                    fontSize: 9,
                                                                    color:
                                                                        "#94A3B8",
                                                                }}
                                                            >
                                                                Loading
                                                                natural-account
                                                                details...
                                                            </div>
                                                        ) : error ? (
                                                            <div
                                                                style={{
                                                                    fontSize: 9,
                                                                    color:
                                                                        "#DC2626",
                                                                }}
                                                            >
                                                                Failed to
                                                                load
                                                                natural-account
                                                                details.
                                                            </div>
                                                        ) : !details.length ? (
                                                            <div
                                                                style={{
                                                                    fontSize: 9,
                                                                    color:
                                                                        "#94A3B8",
                                                                }}
                                                            >
                                                                No
                                                                natural-account
                                                                details
                                                                available.
                                                            </div>
                                                        ) : (
                                                            <div
                                                                style={{
                                                                    width:
                                                                        "100%",
                                                                    overflowX:
                                                                        "auto",
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        fontSize: 10,
                                                                        fontWeight: 700,
                                                                        color:
                                                                            "#0F172A",
                                                                        marginBottom:
                                                                            8,
                                                                    }}
                                                                >
                                                                    Natural-account
                                                                    details
                                                                    for{" "}
                                                                    {
                                                                        item?.category
                                                                    }
                                                                </div>

                                                                <table
                                                                    style={{
                                                                        width:
                                                                            "100%",
                                                                        minWidth:
                                                                            1750,
                                                                        borderCollapse:
                                                                            "collapse",
                                                                        tableLayout:
                                                                            "fixed",
                                                                    }}
                                                                >
                                                                    <colgroup>
                                                                        <col
                                                                            style={{
                                                                                width:
                                                                                    "25%",
                                                                            }}
                                                                        />

                                                                        {months.map(
                                                                            (
                                                                                month
                                                                            ) => (
                                                                                <col
                                                                                    key={
                                                                                        month.key
                                                                                    }
                                                                                    style={{
                                                                                        width:
                                                                                            "5%",
                                                                                    }}
                                                                                />
                                                                            )
                                                                        )}

                                                                        <col
                                                                            style={{
                                                                                width:
                                                                                    "10%",
                                                                            }}
                                                                        />
                                                                    </colgroup>

                                                                    <thead>
                                                                        <tr
                                                                            style={{
                                                                                height:
                                                                                    34,
                                                                                borderBottom:
                                                                                    "1px solid #E5E7EB",
                                                                            }}
                                                                        >
                                                                            <th
                                                                                style={{
                                                                                    padding:
                                                                                        "0 7px",
                                                                                    textAlign:
                                                                                        "left",
                                                                                    color:
                                                                                        "#1E3A8A",
                                                                                    fontSize: 9,
                                                                                    fontWeight: 700,
                                                                                }}
                                                                            >
                                                                                Natural
                                                                                Account
                                                                            </th>

                                                                            {months.map(
                                                                                (
                                                                                    month
                                                                                ) => (
                                                                                    <th
                                                                                        key={
                                                                                            month.key
                                                                                        }
                                                                                        style={{
                                                                                            padding:
                                                                                                "0 8px",
                                                                                            textAlign:
                                                                                                "right",
                                                                                            color:
                                                                                                "#1E3A8A",
                                                                                            fontSize: 9,
                                                                                            fontWeight: 700,
                                                                                            whiteSpace:
                                                                                                "nowrap",
                                                                                        }}
                                                                                    >
                                                                                        {
                                                                                            month.label
                                                                                        }
                                                                                    </th>
                                                                                )
                                                                            )}

                                                                            <th
                                                                                style={{
                                                                                    padding:
                                                                                        "0 8px",
                                                                                    textAlign:
                                                                                        "right",
                                                                                    color:
                                                                                        "#1E3A8A",
                                                                                    fontSize: 9,
                                                                                    fontWeight: 700,
                                                                                    whiteSpace:
                                                                                        "nowrap",
                                                                                    borderLeft:
                                                                                        "1px solid #E5E7EB",
                                                                                }}
                                                                            >
                                                                                Actual YTD
                                                                            </th>
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                        {details.map(
                                                                            (
                                                                                account,
                                                                                accountIndex
                                                                            ) => {
                                                                                const accountCode =
                                                                                    getAccountCode(
                                                                                        account
                                                                                    );

                                                                                const accountYTD =
                                                                                    getActualYTD(
                                                                                        account
                                                                                    );

                                                                                /*
                                                                                 * Use the new helper here.
                                                                                 *
                                                                                 * This prevents:
                                                                                 *
                                                                                 * 610100 610100 - Salaries
                                                                                 *
                                                                                 * and displays:
                                                                                 *
                                                                                 * 610100 - Salaries
                                                                                 */
                                                                                const naturalAccountLabel =
                                                                                    getNaturalAccountLabel(
                                                                                        account
                                                                                    );

                                                                                return (
                                                                                    <tr
                                                                                        key={
                                                                                            accountCode !==
                                                                                                "—"
                                                                                                ? accountCode
                                                                                                : accountIndex
                                                                                        }
                                                                                        style={{
                                                                                            height:
                                                                                                42,
                                                                                            borderBottom:
                                                                                                "1px solid #F1F5F9",
                                                                                        }}
                                                                                    >
                                                                                        {/* =================================================
                                                                                            NATURAL ACCOUNT

                                                                                            Duplicate account code
                                                                                            is prevented here.
                                                                                        ================================================= */}

                                                                                        <td
                                                                                            style={{
                                                                                                padding:
                                                                                                    "0 7px",
                                                                                                textAlign:
                                                                                                    "left",
                                                                                                fontSize: 9,
                                                                                                color:
                                                                                                    "#334155",
                                                                                                fontWeight: 500,
                                                                                                whiteSpace:
                                                                                                    "nowrap",
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                naturalAccountLabel
                                                                                            }
                                                                                        </td>

                                                                                        {/* =================================================
                                                                                            JAN - DEC ACCOUNT MONTHLY VALUES

                                                                                            Live API data.

                                                                                            Missing/future month:
                                                                                            —

                                                                                            Genuine zero:
                                                                                            0

                                                                                            Small non-zero AED Millions:
                                                                                            <0.01M
                                                                                        ================================================= */}

                                                                                        {months.map(
                                                                                            (
                                                                                                month
                                                                                            ) => {
                                                                                                const value =
                                                                                                    getAccountMonthValue(
                                                                                                        account,
                                                                                                        month.key,
                                                                                                        month.label
                                                                                                    );

                                                                                                const isEmpty =
                                                                                                    value ===
                                                                                                    null ||
                                                                                                    value ===
                                                                                                    undefined ||
                                                                                                    value ===
                                                                                                    "" ||
                                                                                                    value ===
                                                                                                    "-" ||
                                                                                                    value ===
                                                                                                    "—";

                                                                                                return (
                                                                                                    <td
                                                                                                        key={
                                                                                                            month.key
                                                                                                        }
                                                                                                        style={{
                                                                                                            padding:
                                                                                                                "0 8px",
                                                                                                            textAlign:
                                                                                                                "right",
                                                                                                            fontSize: 9,
                                                                                                            color:
                                                                                                                isEmpty
                                                                                                                    ? "#94A3B8"
                                                                                                                    : "#334155",
                                                                                                            whiteSpace:
                                                                                                                "nowrap",
                                                                                                        }}
                                                                                                    >
                                                                                                        {displayValue(
                                                                                                            value
                                                                                                        )}
                                                                                                    </td>
                                                                                                );
                                                                                            }
                                                                                        )}

                                                                                        {/* =================================================
                                                                                            ACCOUNT ACTUAL YTD
                                                                                        ================================================= */}

                                                                                        <td
                                                                                            style={{
                                                                                                padding:
                                                                                                    "0 8px",
                                                                                                textAlign:
                                                                                                    "right",
                                                                                                fontSize: 9,
                                                                                                fontWeight: 600,
                                                                                                color:
                                                                                                    "#334155",
                                                                                                whiteSpace:
                                                                                                    "nowrap",
                                                                                                borderLeft:
                                                                                                    "1px solid #E5E7EB",
                                                                                            }}
                                                                                        >
                                                                                            {displayValue(
                                                                                                accountYTD
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                }
                            )}

                            {/* =================================================
                                TOTAL OPERATING EXPENSES
                            ================================================= */}

                            <tr
                                style={{
                                    height: 56,
                                    background:
                                        "#F4F2FF",
                                }}
                            >
                                <td
                                    style={{
                                        padding:
                                            "0 7px",
                                        textAlign:
                                            "left",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color:
                                            "#0F172A",
                                    }}
                                >
                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: 6,
                                        }}
                                    >
                                        <ChevronRight
                                            size={
                                                12
                                            }
                                            strokeWidth={
                                                1.8
                                            }
                                            color="#64748B"
                                        />

                                        <span>
                                            Total Operating
                                            Expenses
                                        </span>
                                    </div>
                                </td>

                                {/* TOTAL JAN - DEC */}

                                {months.map(
                                    (month) => {
                                        const value =
                                            getTotalMonthValue(
                                                rows,
                                                month.key,
                                                month.label
                                            );

                                        const isEmpty =
                                            value ===
                                            null ||
                                            value ===
                                            undefined ||
                                            value ===
                                            "" ||
                                            value ===
                                            "-" ||
                                            value ===
                                            "—";

                                        return (
                                            <td
                                                key={
                                                    month.key
                                                }
                                                style={{
                                                    padding:
                                                        "0 8px",
                                                    textAlign:
                                                        "right",
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color:
                                                        isEmpty
                                                            ? "#94A3B8"
                                                            : "#0F172A",
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {displayValue(
                                                    value
                                                )}
                                            </td>
                                        );
                                    }
                                )}

                                {/* TOTAL ACTUAL YTD */}

                                <td
                                    style={{
                                        padding:
                                            "0 4px",
                                        textAlign:
                                            "right",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color:
                                            "#0F172A",
                                        borderLeft:
                                            "1px solid #DDD8F7",
                                    }}
                                >
                                    {displayValue(
                                        totalActualYTD
                                    )}
                                </td>

                                {/* TOTAL TARGET YTD */}

                                <td
                                    style={{
                                        padding:
                                            "0 4px",
                                        textAlign:
                                            "right",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color:
                                            "#94A3B8",
                                    }}
                                >
                                    {displayTarget(
                                        null
                                    )}
                                </td>

                                {/* TOTAL VARIANCE */}

                                <td
                                    style={{
                                        padding:
                                            "0 4px",
                                        textAlign:
                                            "right",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color:
                                            getVarianceColor(
                                                null
                                            ),
                                    }}
                                >
                                    {displayVariance(
                                        null
                                    )}
                                </td>

                                {/* TOTAL VARIANCE % */}

                                <td
                                    style={{
                                        padding:
                                            "0 4px",
                                        textAlign:
                                            "right",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color:
                                            getVarianceColor(
                                                null
                                            ),
                                    }}
                                >
                                    {displayVariancePercent(
                                        null
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}