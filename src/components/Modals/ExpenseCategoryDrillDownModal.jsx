

// import React, { useMemo, useState } from "react";
// import ExportButtons from "../Common/ExportButtons";

// /* =========================================================
//    FORMAT NUMBER
// ========================================================= */

// const formatNumber = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === "" ||
//         value === "-"
//     ) {
//         return "—";
//     }

//     const number = Number(value);

//     if (!Number.isFinite(number)) {
//         return "—";
//     }

//     return number.toLocaleString("en-US", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     });
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

//     if (!Number.isFinite(number)) {
//         return "—";
//     }

//     return `${number.toFixed(2)}%`;
// };

// /* =========================================================
//    GET VALUE
// ========================================================= */

// const getValue = (row, keys = []) => {
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
//    HAS VALUE
// ========================================================= */

// const hasValue = (value) => {
//     return (
//         value !== null &&
//         value !== undefined &&
//         value !== ""
//     );
// };

// /* =========================================================
//    FILTER OPTION HELPERS
// ========================================================= */

// const getFilterOptionId = (option) => {
//     if (option === null || option === undefined) {
//         return "";
//     }

//     if (typeof option !== "object") {
//         return String(option);
//     }

//     return (
//         option.value ??
//         option.id ??
//         option.code ??
//         option.legal_group_id ??
//         option.legal_entity_id ??
//         option.parent_division_id ??
//         option.subdivision_id ??
//         option.period_name ??
//         option.year ??
//         option.name ??
//         ""
//     );
// };

// const getFilterOptionName = (option) => {
//     if (option === null || option === undefined) {
//         return "";
//     }

//     if (typeof option !== "object") {
//         return String(option);
//     }

//     return (
//         option.name ??
//         option.label ??
//         option.display_name ??
//         option.displayName ??
//         option.description ??
//         option.title ??
//         option.text ??
//         option.period_name ??
//         option.value ??
//         option.code ??
//         option.id ??
//         ""
//     );
// };

// const isEmptyOrAllFilterValue = (value) => {
//     if (value === null || value === undefined) {
//         return true;
//     }

//     if (Array.isArray(value)) {
//         return (
//             value.length === 0 ||
//             value.every((item) =>
//                 isEmptyOrAllFilterValue(item)
//             )
//         );
//     }

//     const normalized = String(value)
//         .trim()
//         .toLowerCase();

//     return (
//         normalized === "" ||
//         normalized === "all" ||
//         normalized === "all values" ||
//         normalized === "all value" ||
//         normalized === "all options" ||
//         normalized === "*"
//     );
// };

// const resolveFilterDisplayValue = (
//     selectedValue,
//     options = []
// ) => {
//     if (isEmptyOrAllFilterValue(selectedValue)) {
//         return null;
//     }

//     /* -------------------------------------------------------
//        MULTI SELECT VALUES
//     ------------------------------------------------------- */

//     if (Array.isArray(selectedValue)) {
//         const resolvedValues = selectedValue
//             .filter(
//                 (value) =>
//                     !isEmptyOrAllFilterValue(value)
//             )
//             .map((value) =>
//                 resolveFilterDisplayValue(
//                     value,
//                     options
//                 )
//             )
//             .filter(Boolean);

//         if (!resolvedValues.length) {
//             return null;
//         }

//         return [...new Set(resolvedValues)].join(", ");
//     }

//     /* -------------------------------------------------------
//        OBJECT VALUE
//     ------------------------------------------------------- */

//     if (typeof selectedValue === "object") {
//         const displayName =
//             getFilterOptionName(selectedValue);

//         return isEmptyOrAllFilterValue(displayName)
//             ? null
//             : String(displayName);
//     }

//     /* -------------------------------------------------------
//        PRIMITIVE VALUE
//     ------------------------------------------------------- */

//     const selectedText = String(selectedValue).trim();

//     if (
//         !selectedText ||
//         isEmptyOrAllFilterValue(selectedText)
//     ) {
//         return null;
//     }

//     const matchedOption = Array.isArray(options)
//         ? options.find((option) => {
//               const optionId = String(
//                   getFilterOptionId(option)
//               ).trim();

//               const optionName = String(
//                   getFilterOptionName(option)
//               ).trim();

//               return (
//                   optionId === selectedText ||
//                   optionName === selectedText
//               );
//           })
//         : null;

//     if (matchedOption) {
//         const displayName =
//             getFilterOptionName(matchedOption);

//         return isEmptyOrAllFilterValue(displayName)
//             ? null
//             : String(displayName);
//     }

//     /*
//      * If no lookup match exists, preserve a value that
//      * was already supplied as a human-readable value.
//      */
//     return selectedText;
// };

// const getSelectedFilterDisplayValue = (
//     activeFilters,
//     filterOptions,
//     key
// ) => {
//     const optionMap = {
//         year:
//             filterOptions?.years ||
//             filterOptions?.fiscal_years ||
//             [],

//         period:
//             filterOptions?.periods || [],

//         legal_group:
//             filterOptions?.legal_groups || [],

//         legal_entity:
//             filterOptions?.legal_entities || [],

//         parent_division:
//             filterOptions?.parent_divisions || [],

//         subdivision:
//             filterOptions?.subdivisions || [],
//     };

//     const directValue = activeFilters?.[key];

//     const resolvedDirectValue =
//         resolveFilterDisplayValue(
//             directValue,
//             optionMap[key] || []
//         );

//     if (resolvedDirectValue) {
//         return resolvedDirectValue;
//     }

//     /* -------------------------------------------------------
//        FALLBACK DISPLAY FIELDS
//     ------------------------------------------------------- */

//     const possibleKeys = [
//         `${key}_name`,
//         `${key}_label`,
//         `${key}_display_name`,
//         `${key}_displayName`,
//         `${key}Name`,
//         `${key}Label`,
//     ];

//     for (const possibleKey of possibleKeys) {
//         const fallbackValue =
//             resolveFilterDisplayValue(
//                 activeFilters?.[possibleKey],
//                 optionMap[key] || []
//             );

//         if (fallbackValue) {
//             return fallbackValue;
//         }
//     }

//     return null;
// };

// /* =========================================================
//    FILTER CHIP
// ========================================================= */

// const FilterChip = ({ label, value }) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === "" ||
//         isEmptyOrAllFilterValue(value)
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
//                 borderRadius: "6px",
//                 background: "#f8fafc",
//                 border: "1px solid #e2e8f0",
//                 fontSize: "11px",
//                 color: "#475569",
//                 whiteSpace: "nowrap",
//             }}
//         >
//             <span
//                 style={{
//                     fontWeight: 600,
//                     color: "#64748b",
//                 }}
//             >
//                 {label}:
//             </span>

//             <span
//                 style={{
//                     fontWeight: 500,
//                     color: "#1e293b",
//                 }}
//             >
//                 {value}
//             </span>
//         </div>
//     );
// };

// /* =========================================================
//    EXPENSE CATEGORY DRILL-DOWN MODAL
// ========================================================= */

// export default function ExpenseCategoryDrillDownModal({
//     open,
//     onClose,
//     data = [],
//     loading = false,
//     activeFilters = {},
//     reportingCurrency = "AED",

//     /* =====================================================
//        FILTER OPTIONS
//     ===================================================== */

//     filterOptions = {},

//     /*
//      * Optional callback.
//      *
//      * When a category is expanded, the parent can call the
//      * category-detail API and return the natural-account rows.
//      *
//      * Expected:
//      * onExpandCategory(category) => Promise<rows> | rows
//      */
//     onExpandCategory,
// }) {
//     /* =====================================================
//        EXPANDED CATEGORIES
//     ===================================================== */

//     const [expandedCategories, setExpandedCategories] =
//         useState({});

//     const [detailData, setDetailData] = useState({});

//     const [detailLoading, setDetailLoading] =
//         useState({});

//     /* =====================================================
//        NORMALIZE CATEGORY DATA
//     ===================================================== */

//     const rows = useMemo(() => {
//         if (Array.isArray(data)) {
//             return data;
//         }

//         if (Array.isArray(data?.items)) {
//             return data.items;
//         }

//         if (Array.isArray(data?.categories)) {
//             return data.categories;
//         }

//         if (Array.isArray(data?.data)) {
//             return data.data;
//         }

//         if (Array.isArray(data?.results)) {
//             return data.results;
//         }

//         return [];
//     }, [data]);

//     /* =====================================================
//        CURRENCY
//     ===================================================== */

//     const currency =
//         rows?.[0]?.reporting_currency ||
//         activeFilters?.reporting_currency ||
//         reportingCurrency ||
//         "AED";

//     /* =====================================================
//        SELECTED FILTER DISPLAY VALUES
//     ===================================================== */

//     const selectedYear =
//         getSelectedFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "year"
//         );

//     const selectedPeriod =
//         getSelectedFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "period"
//         );

//     const selectedLegalGroup =
//         getSelectedFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "legal_group"
//         );

//     const selectedLegalEntity =
//         getSelectedFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "legal_entity"
//         );

//     const selectedParentDivision =
//         getSelectedFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "parent_division"
//         );

//     const selectedSubdivision =
//         getSelectedFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "subdivision"
//         );

//     /* =====================================================
//        TOTALS
//     ===================================================== */

//     const totals = useMemo(() => {
//         let actualPTD = 0;
//         let targetPTD = 0;
//         let variancePTD = 0;

//         let actualYTD = 0;
//         let targetYTD = 0;
//         let varianceYTD = 0;

//         let hasTargetPTD = false;
//         let hasVariancePTD = false;

//         let hasTargetYTD = false;
//         let hasVarianceYTD = false;

//         rows.forEach((row) => {
//             const rowActualPTD = getValue(row, [
//                 "actual_ptd_aed",
//                 "actual_ptd",
//             ]);

//             const rowTargetPTD = getValue(row, [
//                 "target_ptd_aed",
//                 "target_ptd",
//             ]);

//             const rowVariancePTD = getValue(row, [
//                 "variance_ptd_aed",
//                 "variance_ptd",
//             ]);

//             const rowActualYTD = getValue(row, [
//                 "actual_ytd_aed",
//                 "actual_ytd",
//             ]);

//             const rowTargetYTD = getValue(row, [
//                 "target_ytd_aed",
//                 "target_ytd",
//             ]);

//             const rowVarianceYTD = getValue(row, [
//                 "variance_ytd_aed",
//                 "variance_ytd",
//             ]);

//             if (hasValue(rowActualPTD)) {
//                 actualPTD += Number(rowActualPTD) || 0;
//             }

//             if (hasValue(rowTargetPTD)) {
//                 targetPTD += Number(rowTargetPTD) || 0;
//                 hasTargetPTD = true;
//             }

//             if (hasValue(rowVariancePTD)) {
//                 variancePTD +=
//                     Number(rowVariancePTD) || 0;
//                 hasVariancePTD = true;
//             }

//             if (hasValue(rowActualYTD)) {
//                 actualYTD += Number(rowActualYTD) || 0;
//             }

//             if (hasValue(rowTargetYTD)) {
//                 targetYTD += Number(rowTargetYTD) || 0;
//                 hasTargetYTD = true;
//             }

//             if (hasValue(rowVarianceYTD)) {
//                 varianceYTD +=
//                     Number(rowVarianceYTD) || 0;
//                 hasVarianceYTD = true;
//             }
//         });

//         return {
//             actualPTD,
//             targetPTD: hasTargetPTD
//                 ? targetPTD
//                 : null,
//             variancePTD: hasVariancePTD
//                 ? variancePTD
//                 : null,

//             actualYTD,
//             targetYTD: hasTargetYTD
//                 ? targetYTD
//                 : null,
//             varianceYTD: hasVarianceYTD
//                 ? varianceYTD
//                 : null,
//         };
//     }, [rows]);

//     /* =====================================================
//        TOTAL VARIANCE %
//     ===================================================== */

//     const totalVariancePTDPercent =
//         hasValue(totals.targetPTD) &&
//         Number(totals.targetPTD) !== 0 &&
//         hasValue(totals.variancePTD)
//             ? (Number(totals.variancePTD) /
//                   Number(totals.targetPTD)) *
//               100
//             : null;

//     const totalVarianceYTDPercent =
//         hasValue(totals.targetYTD) &&
//         Number(totals.targetYTD) !== 0 &&
//         hasValue(totals.varianceYTD)
//             ? (Number(totals.varianceYTD) /
//                   Number(totals.targetYTD)) *
//               100
//             : null;

//     /* =====================================================
//        NORMALIZE DETAIL RESPONSE
//     ===================================================== */

//     const normalizeDetailRows = (response) => {
//         if (Array.isArray(response)) {
//             return response;
//         }

//         if (Array.isArray(response?.items)) {
//             return response.items;
//         }

//         if (Array.isArray(response?.data)) {
//             return response.data;
//         }

//         if (Array.isArray(response?.results)) {
//             return response.results;
//         }

//         return [];
//     };

//     /* =====================================================
//        EXPAND CATEGORY
//     ===================================================== */

//     const handleToggleCategory = async (category) => {
//         if (!category) {
//             return;
//         }

//         const isExpanded =
//             expandedCategories[category];

//         /* -----------------------------------------------
//            COLLAPSE
//         ------------------------------------------------ */

//         if (isExpanded) {
//             setExpandedCategories((previous) => ({
//                 ...previous,
//                 [category]: false,
//             }));

//             return;
//         }

//         /* -----------------------------------------------
//            ALREADY LOADED
//         ------------------------------------------------ */

//         if (
//             Array.isArray(detailData[category])
//         ) {
//             setExpandedCategories((previous) => ({
//                 ...previous,
//                 [category]: true,
//             }));

//             return;
//         }

//         /* -----------------------------------------------
//            NO API CALLBACK
//         ------------------------------------------------ */

//         if (!onExpandCategory) {
//             setExpandedCategories((previous) => ({
//                 ...previous,
//                 [category]: true,
//             }));

//             return;
//         }

//         try {
//             setDetailLoading((previous) => ({
//                 ...previous,
//                 [category]: true,
//             }));

//             const response =
//                 await onExpandCategory(category);

//             const detailRows =
//                 normalizeDetailRows(response);

//             setDetailData((previous) => ({
//                 ...previous,
//                 [category]: detailRows,
//             }));

//             setExpandedCategories((previous) => ({
//                 ...previous,
//                 [category]: true,
//             }));
//         } catch (error) {
//             console.error(
//                 `Failed to load natural account details for ${category}:`,
//                 error
//             );

//             setDetailData((previous) => ({
//                 ...previous,
//                 [category]: [],
//             }));

//             setExpandedCategories((previous) => ({
//                 ...previous,
//                 [category]: true,
//             }));
//         } finally {
//             setDetailLoading((previous) => ({
//                 ...previous,
//                 [category]: false,
//             }));
//         }
//     };

//     /* =====================================================
//        RESET DETAILS WHEN MODAL CLOSES
//     ===================================================== */

//     const handleClose = () => {
//         setExpandedCategories({});
//         setDetailData({});
//         setDetailLoading({});
//         onClose?.();
//     };

//     /* =====================================================
//        COMMON EXPORT HANDLER
//     ===================================================== */

//     const handleExport = (type) => {
//         if (!rows.length) {
//             return;
//         }

//         const exportRows = [];

//         rows.forEach((row) => {
//             const category = getValue(row, [
//                 "category",
//                 "name",
//             ]);

//             exportRows.push({
//                 "Expense Category": category || "—",
//                 [`Actual PTD (${currency})`]:
//                     getValue(row, [
//                         "actual_ptd_aed",
//                         "actual_ptd",
//                     ]) ?? "",
//                 [`Target PTD (${currency})`]:
//                     getValue(row, [
//                         "target_ptd_aed",
//                         "target_ptd",
//                     ]) ?? "",
//                 [`Variance PTD (${currency})`]:
//                     getValue(row, [
//                         "variance_ptd_aed",
//                         "variance_ptd",
//                     ]) ?? "",
//                 "Variance PTD %":
//                     getValue(row, [
//                         "variance_ptd_pct",
//                     ]) ?? "",
//                 [`Actual YTD (${currency})`]:
//                     getValue(row, [
//                         "actual_ytd_aed",
//                         "actual_ytd",
//                     ]) ?? "",
//                 [`Target YTD (${currency})`]:
//                     getValue(row, [
//                         "target_ytd_aed",
//                         "target_ytd",
//                     ]) ?? "",
//                 [`Variance YTD (${currency})`]:
//                     getValue(row, [
//                         "variance_ytd_aed",
//                         "variance_ytd",
//                     ]) ?? "",
//                 "Variance YTD %":
//                     getValue(row, [
//                         "variance_ytd_pct",
//                     ]) ?? "",
//             });

//             const accounts =
//                 detailData[category] || [];

//             accounts.forEach((account) => {
//                 exportRows.push({
//                     "Expense Category":
//                         `${category || "—"} - Natural Account`,
//                     "Natural Account":
//                         account.account_code || "—",
//                     "Account Name":
//                         account.account_name || "—",
//                     [`Actual PTD (${currency})`]:
//                         getValue(account, [
//                             "actual_ptd_aed",
//                             "actual_ptd",
//                         ]) ?? "",
//                     [`Actual YTD (${currency})`]:
//                         getValue(account, [
//                             "actual_ytd_aed",
//                             "actual_ytd",
//                         ]) ?? "",
//                 });
//             });
//         });

//         if (type === "excel") {
//             const headers = Object.keys(
//                 exportRows[0] || {}
//             );

//             const csvRows = [
//                 headers.join(","),
//                 ...exportRows.map((row) =>
//                     headers
//                         .map((header) => {
//                             const value =
//                                 row[header] ?? "";

//                             return `"${String(value).replace(
//                                 /"/g,
//                                 '""'
//                             )}"`;
//                         })
//                         .join(",")
//                 ),
//             ];

//             const blob = new Blob(
//                 [csvRows.join("\n")],
//                 {
//                     type: "text/csv;charset=utf-8;",
//                 }
//             );

//             const url =
//                 URL.createObjectURL(blob);

//             const link =
//                 document.createElement("a");

//             link.href = url;
//             link.download =
//                 "expense-category-drill-down.csv";

//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);

//             URL.revokeObjectURL(url);

//             return;
//         }

//         if (type === "pdf") {
//             const printWindow =
//                 window.open(
//                     "",
//                     "_blank",
//                     "width=1200,height=800"
//                 );

//             if (!printWindow) {
//                 return;
//             }

//             const filterRows = [
//                 ["Year", selectedYear],
//                 ["Period", selectedPeriod],
//                 ["Currency", currency],
//                 [
//                     "Legal Group",
//                     selectedLegalGroup,
//                 ],
//                 [
//                     "Legal Entity",
//                     selectedLegalEntity,
//                 ],
//                 [
//                     "Parent Division",
//                     selectedParentDivision,
//                 ],
//                 [
//                     "Subdivision",
//                     selectedSubdivision,
//                 ],
//             ].filter(
//                 ([, value]) =>
//                     value !== null &&
//                     value !== undefined &&
//                     value !== ""
//             );

//             const tableRows = exportRows
//                 .map(
//                     (row) => `
//                         <tr>
//                             <td>${row["Expense Category"] || "—"}</td>
//                             <td>${row["Natural Account"] || "—"}</td>
//                             <td>${row["Account Name"] || "—"}</td>
//                             <td>${row[`Actual PTD (${currency})`] || "—"}</td>
//                             <td>${row[`Target PTD (${currency})`] || "—"}</td>
//                             <td>${row[`Variance PTD (${currency})`] || "—"}</td>
//                             <td>${row["Variance PTD %"] || "—"}</td>
//                             <td>${row[`Actual YTD (${currency})`] || "—"}</td>
//                             <td>${row[`Target YTD (${currency})`] || "—"}</td>
//                             <td>${row[`Variance YTD (${currency})`] || "—"}</td>
//                             <td>${row["Variance YTD %"] || "—"}</td>
//                         </tr>
//                     `
//                 )
//                 .join("");

//             printWindow.document.write(`
//                 <html>
//                     <head>
//                         <title>Expense Category Drill-Down</title>

//                         <style>
//                             body {
//                                 font-family: Arial, sans-serif;
//                                 padding: 24px;
//                                 color: #111827;
//                             }

//                             h1 {
//                                 font-size: 20px;
//                                 margin-bottom: 5px;
//                             }

//                             .subtitle {
//                                 color: #64748b;
//                                 font-size: 12px;
//                                 margin-bottom: 16px;
//                             }

//                             .filters {
//                                 display: flex;
//                                 flex-wrap: wrap;
//                                 gap: 6px;
//                                 margin-bottom: 16px;
//                             }

//                             .filter {
//                                 padding: 5px 8px;
//                                 border: 1px solid #e2e8f0;
//                                 border-radius: 5px;
//                                 font-size: 10px;
//                             }

//                             table {
//                                 width: 100%;
//                                 border-collapse: collapse;
//                                 font-size: 9px;
//                             }

//                             th,
//                             td {
//                                 border: 1px solid #d1d5db;
//                                 padding: 6px;
//                                 text-align: right;
//                             }

//                             th:first-child,
//                             td:first-child {
//                                 text-align: left;
//                             }

//                             th {
//                                 background: #f8fafc;
//                                 font-weight: 700;
//                             }

//                             @media print {
//                                 body {
//                                     padding: 10px;
//                                 }
//                             }
//                         </style>
//                     </head>

//                     <body>
//                         <h1>
//                             Expense Category Drill-Down
//                         </h1>

//                         <div class="subtitle">
//                             Detailed PTD and YTD expense category analysis
//                         </div>

//                         <div class="filters">
//                             ${filterRows
//                                 .map(
//                                     ([label, value]) =>
//                                         `<div class="filter"><strong>${label}:</strong> ${value}</div>`
//                                 )
//                                 .join("")}
//                         </div>

//                         <table>
//                             <thead>
//                                 <tr>
//                                     <th>Expense Category</th>
//                                     <th>Natural Account</th>
//                                     <th>Account Name</th>
//                                     <th>Actual PTD</th>
//                                     <th>Target PTD</th>
//                                     <th>Variance PTD</th>
//                                     <th>Variance PTD %</th>
//                                     <th>Actual YTD</th>
//                                     <th>Target YTD</th>
//                                     <th>Variance YTD</th>
//                                     <th>Variance YTD %</th>
//                                 </tr>
//                             </thead>

//                             <tbody>
//                                 ${tableRows}
//                             </tbody>
//                         </table>
//                     </body>
//                 </html>
//             `);

//             printWindow.document.close();

//             printWindow.focus();

//             setTimeout(() => {
//                 printWindow.print();
//             }, 300);
//         }
//     };

//     /* =====================================================
//        DON'T RENDER
//     ===================================================== */

//     if (!open) {
//         return null;
//     }

//     /* =====================================================
//        RENDER
//     ===================================================== */

//     return (
//         <div
//             style={{
//                 position: "fixed",
//                 inset: 0,
//                 zIndex: 1000,
//                 background: "rgba(15, 23, 42, 0.45)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 padding: "20px",
//             }}
//             onMouseDown={(event) => {
//                 if (
//                     event.target ===
//                     event.currentTarget
//                 ) {
//                     handleClose();
//                 }
//             }}
//         >
//             <div
//                 style={{
//                     width: "100%",
//                     maxWidth: "1400px",
//                     maxHeight: "92vh",
//                     background: "#ffffff",
//                     borderRadius: "10px",
//                     boxShadow:
//                         "0 20px 50px rgba(15, 23, 42, 0.20)",
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
//                         padding: "18px 22px 14px",
//                         borderBottom:
//                             "1px solid #e5e7eb",
//                         display: "flex",
//                         alignItems: "flex-start",
//                         justifyContent: "space-between",
//                         gap: "16px",
//                         flexShrink: 0,
//                     }}
//                 >
//                     <div>
//                         <div
//                             style={{
//                                 fontSize: "18px",
//                                 fontWeight: 700,
//                                 color: "#111827",
//                                 lineHeight: 1.3,
//                             }}
//                         >
//                             Expense Category Drill-Down
//                         </div>

//                         <div
//                             style={{
//                                 marginTop: "4px",
//                                 fontSize: "12px",
//                                 color: "#6b7280",
//                             }}
//                         >
//                             Detailed PTD and YTD expense
//                             category analysis
//                         </div>
//                     </div>

//                     {/* =================================================
//                         COMMON EXPORT BUTTONS
//                     ================================================= */}

//                     <div
//                         style={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: "8px",
//                             marginLeft: "auto",
//                         }}
//                     >
//                         <ExportButtons
//                             endpoint="expense-category-drill-down"
//                             exporting={
//                                 loading ||
//                                 rows.length === 0
//                                     ? "disabled"
//                                     : false
//                             }
//                             handleExport={handleExport}
//                         />

//                         <button
//                             type="button"
//                             onClick={handleClose}
//                             aria-label="Close"
//                             style={{
//                                 width: "32px",
//                                 height: "32px",
//                                 border: "none",
//                                 background: "transparent",
//                                 borderRadius: "6px",
//                                 cursor: "pointer",
//                                 color: "#64748b",
//                                 fontSize: "24px",
//                                 lineHeight: "28px",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 flexShrink: 0,
//                             }}
//                         >
//                             ×
//                         </button>
//                     </div>
//                 </div>

//                 {/* =================================================
//                     FILTER SUMMARY
//                 ================================================= */}

//                 <div
//                     style={{
//                         padding: "10px 22px",
//                         borderBottom:
//                             "1px solid #f1f5f9",
//                         display: "flex",
//                         flexWrap: "wrap",
//                         gap: "6px",
//                         background: "#ffffff",
//                         flexShrink: 0,
//                     }}
//                 >
//                     <FilterChip
//                         label="Year"
//                         value={selectedYear}
//                     />

//                     <FilterChip
//                         label="Period"
//                         value={selectedPeriod}
//                     />

//                     <FilterChip
//                         label="Currency"
//                         value={currency}
//                     />

//                     <FilterChip
//                         label="Legal Group"
//                         value={selectedLegalGroup}
//                     />

//                     <FilterChip
//                         label="Legal Entity"
//                         value={selectedLegalEntity}
//                     />

//                     <FilterChip
//                         label="Parent Division"
//                         value={selectedParentDivision}
//                     />

//                     <FilterChip
//                         label="Subdivision"
//                         value={selectedSubdivision}
//                     />
//                 </div>

//                 {/* =================================================
//                     CONTENT
//                 ================================================= */}

//                 <div
//                     style={{
//                         flex: 1,
//                         minHeight: 0,
//                         overflow: "auto",
//                         padding: "18px 22px",
//                     }}
//                 >
//                     {loading ? (
//                         <div
//                             style={{
//                                 minHeight: "300px",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 color: "#64748b",
//                                 fontSize: "13px",
//                             }}
//                         >
//                             Loading expense category
//                             details...
//                         </div>
//                     ) : rows.length === 0 ? (
//                         <div
//                             style={{
//                                 minHeight: "300px",
//                                 display: "flex",
//                                 flexDirection: "column",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 color: "#64748b",
//                                 fontSize: "13px",
//                                 textAlign: "center",
//                             }}
//                         >
//                             <div
//                                 style={{
//                                     fontSize: "15px",
//                                     fontWeight: 600,
//                                     color: "#334155",
//                                     marginBottom: "5px",
//                                 }}
//                             >
//                                 No expense category data
//                             </div>

//                             <div>
//                                 No records are available
//                                 for the selected filters.
//                             </div>
//                         </div>
//                     ) : (
//                         <>
//                             {/* =================================================
//                                 SUMMARY CARDS
//                             ================================================= */}

//                             <div
//                                 style={{
//                                     display: "grid",
//                                     gridTemplateColumns:
//                                         "repeat(4, minmax(0, 1fr))",
//                                     gap: "10px",
//                                     marginBottom: "16px",
//                                 }}
//                             >
//                                 {[
//                                     {
//                                         label: "PTD Actual",
//                                         value: `${currency} ${formatNumber(
//                                             totals.actualPTD
//                                         )}`,
//                                     },
//                                     {
//                                         label: "PTD Target",
//                                         value: hasValue(
//                                             totals.targetPTD
//                                         )
//                                             ? `${currency} ${formatNumber(
//                                                   totals.targetPTD
//                                               )}`
//                                             : "—",
//                                     },
//                                     {
//                                         label: "YTD Actual",
//                                         value: `${currency} ${formatNumber(
//                                             totals.actualYTD
//                                         )}`,
//                                     },
//                                     {
//                                         label: "YTD Target",
//                                         value: hasValue(
//                                             totals.targetYTD
//                                         )
//                                             ? `${currency} ${formatNumber(
//                                                   totals.targetYTD
//                                               )}`
//                                             : "—",
//                                     },
//                                 ].map(
//                                     (
//                                         card
//                                     ) => (
//                                         <div
//                                             key={
//                                                 card.label
//                                             }
//                                             style={{
//                                                 border:
//                                                     "1px solid #e5e7eb",
//                                                 borderRadius:
//                                                     "8px",
//                                                 padding:
//                                                     "12px 14px",
//                                                 background:
//                                                     "#ffffff",
//                                             }}
//                                         >
//                                             <div
//                                                 style={{
//                                                     fontSize:
//                                                         "10px",
//                                                     fontWeight:
//                                                         600,
//                                                     color:
//                                                         "#64748b",
//                                                     textTransform:
//                                                         "uppercase",
//                                                     letterSpacing:
//                                                         "0.04em",
//                                                 }}
//                                             >
//                                                 {
//                                                     card.label
//                                                 }
//                                             </div>

//                                             <div
//                                                 style={{
//                                                     marginTop:
//                                                         "5px",
//                                                     fontSize:
//                                                         "17px",
//                                                     fontWeight:
//                                                         700,
//                                                     color:
//                                                         "#111827",
//                                                 }}
//                                             >
//                                                 {
//                                                     card.value
//                                                 }
//                                             </div>
//                                         </div>
//                                     )
//                                 )}
//                             </div>

//                             {/* =================================================
//                                 TABLE
//                             ================================================= */}

//                             <div
//                                 style={{
//                                     width: "100%",
//                                     overflowX: "auto",
//                                     overflowY: "visible",
//                                     border:
//                                         "1px solid #e5e7eb",
//                                     borderRadius: "8px",
//                                 }}
//                             >
//                                 <table
//                                     style={{
//                                         width: "100%",
//                                         minWidth:
//                                             "1250px",
//                                         borderCollapse:
//                                             "separate",
//                                         borderSpacing:
//                                             0,
//                                         fontSize:
//                                             "12px",
//                                     }}
//                                 >
//                                     <thead>
//                                         <tr>
//                                             <th
//                                                 rowSpan={
//                                                     2
//                                                 }
//                                                 style={{
//                                                     position:
//                                                         "sticky",
//                                                     left: 0,
//                                                     zIndex: 4,
//                                                     minWidth:
//                                                         "300px",
//                                                     padding:
//                                                         "10px 12px",
//                                                     textAlign:
//                                                         "left",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderBottom:
//                                                         "1px solid #e5e7eb",
//                                                     borderRight:
//                                                         "1px solid #e5e7eb",
//                                                     color:
//                                                         "#475569",
//                                                     fontWeight:
//                                                         700,
//                                                     whiteSpace:
//                                                         "nowrap",
//                                                 }}
//                                             >
//                                                 Expense Category
//                                             </th>

//                                             <th
//                                                 colSpan={
//                                                     4
//                                                 }
//                                                 style={{
//                                                     padding:
//                                                         "9px 12px",
//                                                     textAlign:
//                                                         "center",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderBottom:
//                                                         "1px solid #e5e7eb",
//                                                     borderRight:
//                                                         "1px solid #e5e7eb",
//                                                     color:
//                                                         "#334155",
//                                                     fontWeight:
//                                                         700,
//                                                 }}
//                                             >
//                                                 PTD
//                                             </th>

//                                             <th
//                                                 colSpan={
//                                                     4
//                                                 }
//                                                 style={{
//                                                     padding:
//                                                         "9px 12px",
//                                                     textAlign:
//                                                         "center",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderBottom:
//                                                         "1px solid #e5e7eb",
//                                                     color:
//                                                         "#334155",
//                                                     fontWeight:
//                                                         700,
//                                                 }}
//                                             >
//                                                 YTD
//                                             </th>
//                                         </tr>

//                                         <tr>
//                                             {[
//                                                 `Actual (${currency})`,
//                                                 `Target (${currency})`,
//                                                 `Variance (${currency})`,
//                                                 "Variance %",
//                                                 `Actual (${currency})`,
//                                                 `Target (${currency})`,
//                                                 `Variance (${currency})`,
//                                                 "Variance %",
//                                             ].map(
//                                                 (
//                                                     heading,
//                                                     index
//                                                 ) => (
//                                                     <th
//                                                         key={
//                                                             heading
//                                                         }
//                                                         style={{
//                                                             padding:
//                                                                 "9px 12px",
//                                                             textAlign:
//                                                                 "right",
//                                                             background:
//                                                                 "#f8fafc",
//                                                             borderBottom:
//                                                                 "1px solid #e5e7eb",
//                                                             borderRight:
//                                                                 index ===
//                                                                 3
//                                                                     ? "1px solid #e5e7eb"
//                                                                     : "none",
//                                                             color:
//                                                                 "#64748b",
//                                                             fontWeight:
//                                                                 600,
//                                                             whiteSpace:
//                                                                 "nowrap",
//                                                         }}
//                                                     >
//                                                         {
//                                                             heading
//                                                         }
//                                                     </th>
//                                                 )
//                                             )}
//                                         </tr>
//                                     </thead>

//                                     <tbody>
//                                         {rows.map(
//                                             (
//                                                 row,
//                                                 index
//                                             ) => {
//                                                 const category =
//                                                     getValue(
//                                                         row,
//                                                         [
//                                                             "category",
//                                                             "name",
//                                                         ]
//                                                     );

//                                                 const actualPTD =
//                                                     getValue(
//                                                         row,
//                                                         [
//                                                             "actual_ptd_aed",
//                                                             "actual_ptd",
//                                                         ]
//                                                     );

//                                                 const targetPTD =
//                                                     getValue(
//                                                         row,
//                                                         [
//                                                             "target_ptd_aed",
//                                                             "target_ptd",
//                                                         ]
//                                                     );

//                                                 const variancePTD =
//                                                     getValue(
//                                                         row,
//                                                         [
//                                                             "variance_ptd_aed",
//                                                             "variance_ptd",
//                                                         ]
//                                                     );

//                                                 const variancePTDPercent =
//                                                     getValue(
//                                                         row,
//                                                         [
//                                                             "variance_ptd_pct",
//                                                         ]
//                                                     );

//                                                 const actualYTD =
//                                                     getValue(
//                                                         row,
//                                                         [
//                                                             "actual_ytd_aed",
//                                                             "actual_ytd",
//                                                         ]
//                                                     );

//                                                 const targetYTD =
//                                                     getValue(
//                                                         row,
//                                                         [
//                                                             "target_ytd_aed",
//                                                             "target_ytd",
//                                                         ]
//                                                     );

//                                                 const varianceYTD =
//                                                     getValue(
//                                                         row,
//                                                         [
//                                                             "variance_ytd_aed",
//                                                             "variance_ytd",
//                                                         ]
//                                                     );

//                                                 const varianceYTDPercent =
//                                                     getValue(
//                                                         row,
//                                                         [
//                                                             "variance_ytd_pct",
//                                                         ]
//                                                     );

//                                                 const isExpanded =
//                                                     !!expandedCategories[
//                                                         category
//                                                     ];

//                                                 const categoryLoading =
//                                                     !!detailLoading[
//                                                         category
//                                                     ];

//                                                 const accounts =
//                                                     detailData[
//                                                         category
//                                                     ] || [];

//                                                 return (
//                                                     <React.Fragment
//                                                         key={`${category}-${index}`}
//                                                     >
//                                                         {/* =================================================
//                                                             CATEGORY ROW
//                                                         ================================================= */}

//                                                         <tr>
//                                                             <td
//                                                                 style={{
//                                                                     position:
//                                                                         "sticky",
//                                                                     left: 0,
//                                                                     zIndex: 2,
//                                                                     minWidth:
//                                                                         "300px",
//                                                                     padding:
//                                                                         "10px 12px",
//                                                                     background:
//                                                                         "#ffffff",
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                     borderRight:
//                                                                         "1px solid #e5e7eb",
//                                                                     color:
//                                                                         "#1e293b",
//                                                                     fontWeight:
//                                                                         600,
//                                                                     whiteSpace:
//                                                                         "nowrap",
//                                                                 }}
//                                                             >
//                                                                 <button
//                                                                     type="button"
//                                                                     onClick={() =>
//                                                                         handleToggleCategory(
//                                                                             category
//                                                                         )
//                                                                     }
//                                                                     style={{
//                                                                         width:
//                                                                             "24px",
//                                                                         height:
//                                                                             "24px",
//                                                                         marginRight:
//                                                                             "7px",
//                                                                         border:
//                                                                             "none",
//                                                                         background:
//                                                                             "transparent",
//                                                                         cursor:
//                                                                             "pointer",
//                                                                         color:
//                                                                             "#64748b",
//                                                                         fontSize:
//                                                                             "12px",
//                                                                         padding:
//                                                                             0,
//                                                                         verticalAlign:
//                                                                             "middle",
//                                                                     }}
//                                                                     aria-label={
//                                                                         isExpanded
//                                                                             ? `Collapse ${category}`
//                                                                             : `Expand ${category}`
//                                                                     }
//                                                                 >
//                                                                     {isExpanded
//                                                                         ? "▼"
//                                                                         : "▶"}
//                                                                 </button>

//                                                                 {category ||
//                                                                     "—"}
//                                                             </td>

//                                                             <td
//                                                                 style={{
//                                                                     padding:
//                                                                         "10px 12px",
//                                                                     textAlign:
//                                                                         "right",
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                     color:
//                                                                         "#334155",
//                                                                     whiteSpace:
//                                                                         "nowrap",
//                                                                 }}
//                                                             >
//                                                                 {formatNumber(
//                                                                     actualPTD
//                                                                 )}
//                                                             </td>

//                                                             <td
//                                                                 style={{
//                                                                     padding:
//                                                                         "10px 12px",
//                                                                     textAlign:
//                                                                         "right",
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                     color:
//                                                                         "#334155",
//                                                                     whiteSpace:
//                                                                         "nowrap",
//                                                                 }}
//                                                             >
//                                                                 {formatNumber(
//                                                                     targetPTD
//                                                                 )}
//                                                             </td>

//                                                             <td
//                                                                 style={{
//                                                                     padding:
//                                                                         "10px 12px",
//                                                                     textAlign:
//                                                                         "right",
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                     color:
//                                                                         "#334155",
//                                                                     whiteSpace:
//                                                                         "nowrap",
//                                                                 }}
//                                                             >
//                                                                 {formatNumber(
//                                                                     variancePTD
//                                                                 )}
//                                                             </td>

//                                                             <td
//                                                                 style={{
//                                                                     padding:
//                                                                         "10px 12px",
//                                                                     textAlign:
//                                                                         "right",
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                     borderRight:
//                                                                         "1px solid #e5e7eb",
//                                                                     color:
//                                                                         "#334155",
//                                                                     whiteSpace:
//                                                                         "nowrap",
//                                                                 }}
//                                                             >
//                                                                 {formatPercentage(
//                                                                     variancePTDPercent
//                                                                 )}
//                                                             </td>

//                                                             <td
//                                                                 style={{
//                                                                     padding:
//                                                                         "10px 12px",
//                                                                     textAlign:
//                                                                         "right",
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                     color:
//                                                                         "#334155",
//                                                                     whiteSpace:
//                                                                         "nowrap",
//                                                                 }}
//                                                             >
//                                                                 {formatNumber(
//                                                                     actualYTD
//                                                                 )}
//                                                             </td>

//                                                             <td
//                                                                 style={{
//                                                                     padding:
//                                                                         "10px 12px",
//                                                                     textAlign:
//                                                                         "right",
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                     color:
//                                                                         "#334155",
//                                                                     whiteSpace:
//                                                                         "nowrap",
//                                                                 }}
//                                                             >
//                                                                 {formatNumber(
//                                                                     targetYTD
//                                                                 )}
//                                                             </td>

//                                                             <td
//                                                                 style={{
//                                                                     padding:
//                                                                         "10px 12px",
//                                                                     textAlign:
//                                                                         "right",
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                     color:
//                                                                         "#334155",
//                                                                     whiteSpace:
//                                                                         "nowrap",
//                                                                 }}
//                                                             >
//                                                                 {formatNumber(
//                                                                     varianceYTD
//                                                                 )}
//                                                             </td>

//                                                             <td
//                                                                 style={{
//                                                                     padding:
//                                                                         "10px 12px",
//                                                                     textAlign:
//                                                                         "right",
//                                                                     borderBottom:
//                                                                         "1px solid #f1f5f9",
//                                                                     color:
//                                                                         "#334155",
//                                                                     whiteSpace:
//                                                                         "nowrap",
//                                                                 }}
//                                                             >
//                                                                 {formatPercentage(
//                                                                     varianceYTDPercent
//                                                                 )}
//                                                             </td>
//                                                         </tr>

//                                                         {/* =================================================
//                                                             NATURAL ACCOUNT LOADING ROW
//                                                         ================================================= */}

//                                                         {isExpanded &&
//                                                             categoryLoading && (
//                                                                 <tr>
//                                                                     <td
//                                                                         colSpan={
//                                                                             9
//                                                                         }
//                                                                         style={{
//                                                                             padding:
//                                                                                 "14px 20px",
//                                                                             background:
//                                                                                 "#f8fafc",
//                                                                             borderBottom:
//                                                                                 "1px solid #e5e7eb",
//                                                                             color:
//                                                                                 "#64748b",
//                                                                             fontSize:
//                                                                                 "11px",
//                                                                         }}
//                                                                     >
//                                                                         Loading natural account details...
//                                                                     </td>
//                                                                 </tr>
//                                                             )}

//                                                         {/* =================================================
//                                                             NATURAL ACCOUNT ROWS
//                                                         ================================================= */}

//                                                         {isExpanded &&
//                                                             !categoryLoading &&
//                                                             accounts.length >
//                                                                 0 &&
//                                                             accounts.map(
//                                                                 (
//                                                                     account,
//                                                                     accountIndex
//                                                                 ) => (
//                                                                     <tr
//                                                                         key={`${category}-${account.account_code}-${accountIndex}`}
//                                                                     >
//                                                                         <td
//                                                                             style={{
//                                                                                 position:
//                                                                                     "sticky",
//                                                                                 left: 0,
//                                                                                 zIndex: 1,
//                                                                                 minWidth:
//                                                                                     "300px",
//                                                                                 padding:
//                                                                                     "9px 12px 9px 45px",
//                                                                                 background:
//                                                                                     "#f8fafc",
//                                                                                 borderBottom:
//                                                                                     "1px solid #eef2f7",
//                                                                                 borderRight:
//                                                                                     "1px solid #e5e7eb",
//                                                                                 color:
//                                                                                     "#475569",
//                                                                                 fontWeight:
//                                                                                     500,
//                                                                             }}
//                                                                         >
//                                                                             <div
//                                                                                 style={{
//                                                                                     fontSize:
//                                                                                         "11px",
//                                                                                     color:
//                                                                                         "#64748b",
//                                                                                     fontWeight:
//                                                                                         600,
//                                                                                 }}
//                                                                             >
//                                                                                 {account.account_code ||
//                                                                                     "—"}
//                                                                             </div>

//                                                                             <div
//                                                                                 style={{
//                                                                                     marginTop:
//                                                                                         "2px",
//                                                                                     fontSize:
//                                                                                         "11px",
//                                                                                     color:
//                                                                                         "#334155",
//                                                                                     fontWeight:
//                                                                                         500,
//                                                                                     whiteSpace:
//                                                                                         "normal",
//                                                                                     lineHeight:
//                                                                                         1.4,
//                                                                                 }}
//                                                                             >
//                                                                                 {account.account_name ||
//                                                                                     "—"}
//                                                                             </div>
//                                                                         </td>

//                                                                         <td
//                                                                             style={{
//                                                                                 padding:
//                                                                                     "9px 12px",
//                                                                                 textAlign:
//                                                                                     "right",
//                                                                                 background:
//                                                                                     "#f8fafc",
//                                                                                 borderBottom:
//                                                                                     "1px solid #eef2f7",
//                                                                                 color:
//                                                                                     "#475569",
//                                                                                 whiteSpace:
//                                                                                     "nowrap",
//                                                                             }}
//                                                                         >
//                                                                             {formatNumber(
//                                                                                 getValue(
//                                                                                     account,
//                                                                                     [
//                                                                                         "actual_ptd_aed",
//                                                                                         "actual_ptd",
//                                                                                     ]
//                                                                                 )
//                                                                             )}
//                                                                         </td>

//                                                                         <td
//                                                                             style={{
//                                                                                 padding:
//                                                                                     "9px 12px",
//                                                                                 textAlign:
//                                                                                     "right",
//                                                                                 background:
//                                                                                     "#f8fafc",
//                                                                                 borderBottom:
//                                                                                     "1px solid #eef2f7",
//                                                                                 color:
//                                                                                     "#94a3b8",
//                                                                             }}
//                                                                         >
//                                                                             —
//                                                                         </td>

//                                                                         <td
//                                                                             style={{
//                                                                                 padding:
//                                                                                     "9px 12px",
//                                                                                 textAlign:
//                                                                                     "right",
//                                                                                 background:
//                                                                                     "#f8fafc",
//                                                                                 borderBottom:
//                                                                                     "1px solid #eef2f7",
//                                                                                 color:
//                                                                                     "#94a3b8",
//                                                                             }}
//                                                                         >
//                                                                             —
//                                                                         </td>

//                                                                         <td
//                                                                             style={{
//                                                                                 padding:
//                                                                                     "9px 12px",
//                                                                                 textAlign:
//                                                                                     "right",
//                                                                                 background:
//                                                                                     "#f8fafc",
//                                                                                 borderBottom:
//                                                                                     "1px solid #eef2f7",
//                                                                                 borderRight:
//                                                                                     "1px solid #e5e7eb",
//                                                                                 color:
//                                                                                     "#94a3b8",
//                                                                             }}
//                                                                         >
//                                                                             —
//                                                                         </td>

//                                                                         <td
//                                                                             style={{
//                                                                                 padding:
//                                                                                     "9px 12px",
//                                                                                 textAlign:
//                                                                                     "right",
//                                                                                 background:
//                                                                                     "#f8fafc",
//                                                                                 borderBottom:
//                                                                                     "1px solid #eef2f7",
//                                                                                 color:
//                                                                                     "#475569",
//                                                                                 whiteSpace:
//                                                                                     "nowrap",
//                                                                             }}
//                                                                         >
//                                                                             {formatNumber(
//                                                                                 getValue(
//                                                                                     account,
//                                                                                     [
//                                                                                         "actual_ytd_aed",
//                                                                                         "actual_ytd",
//                                                                                     ]
//                                                                                 )
//                                                                             )}
//                                                                         </td>

//                                                                         <td
//                                                                             style={{
//                                                                                 padding:
//                                                                                     "9px 12px",
//                                                                                 textAlign:
//                                                                                     "right",
//                                                                                 background:
//                                                                                     "#f8fafc",
//                                                                                 borderBottom:
//                                                                                     "1px solid #eef2f7",
//                                                                                 color:
//                                                                                     "#94a3b8",
//                                                                             }}
//                                                                         >
//                                                                             —
//                                                                         </td>

//                                                                         <td
//                                                                             style={{
//                                                                                 padding:
//                                                                                     "9px 12px",
//                                                                                 textAlign:
//                                                                                     "right",
//                                                                                 background:
//                                                                                     "#f8fafc",
//                                                                                 borderBottom:
//                                                                                     "1px solid #eef2f7",
//                                                                                 color:
//                                                                                     "#94a3b8",
//                                                                             }}
//                                                                         >
//                                                                             —
//                                                                         </td>

//                                                                         <td
//                                                                             style={{
//                                                                                 padding:
//                                                                                     "9px 12px",
//                                                                                 textAlign:
//                                                                                     "right",
//                                                                                 background:
//                                                                                     "#f8fafc",
//                                                                                 borderBottom:
//                                                                                     "1px solid #e5e7eb",
//                                                                                 color:
//                                                                                     "#94a3b8",
//                                                                             }}
//                                                                         >
//                                                                             —
//                                                                         </td>
//                                                                     </tr>
//                                                                 )
//                                                             )}

//                                                         {/* =================================================
//                                                             NO ACCOUNT DATA
//                                                         ================================================= */}

//                                                         {isExpanded &&
//                                                             !categoryLoading &&
//                                                             accounts.length ===
//                                                                 0 && (
//                                                                 <tr>
//                                                                     <td
//                                                                         colSpan={
//                                                                             9
//                                                                         }
//                                                                         style={{
//                                                                             padding:
//                                                                                 "12px 20px 12px 45px",
//                                                                             background:
//                                                                                 "#f8fafc",
//                                                                             borderBottom:
//                                                                                 "1px solid #e5e7eb",
//                                                                             color:
//                                                                                 "#64748b",
//                                                                             fontSize:
//                                                                                 "11px",
//                                                                         }}
//                                                                     >
//                                                                         No natural account details available for{" "}
//                                                                         <strong>
//                                                                             {
//                                                                                 category
//                                                                             }
//                                                                         </strong>
//                                                                         .
//                                                                     </td>
//                                                                 </tr>
//                                                             )}
//                                                     </React.Fragment>
//                                                 );
//                                             }
//                                         )}

//                                         {/* =================================================
//                                             TOTAL ROW
//                                         ================================================= */}

//                                         <tr>
//                                             <td
//                                                 style={{
//                                                     position:
//                                                         "sticky",
//                                                     left: 0,
//                                                     zIndex: 3,
//                                                     padding:
//                                                         "11px 12px",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderTop:
//                                                         "1px solid #cbd5e1",
//                                                     borderRight:
//                                                         "1px solid #e5e7eb",
//                                                     color:
//                                                         "#0f172a",
//                                                     fontWeight:
//                                                         700,
//                                                     whiteSpace:
//                                                         "nowrap",
//                                                 }}
//                                             >
//                                                 Total
//                                             </td>

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "11px 12px",
//                                                     textAlign:
//                                                         "right",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderTop:
//                                                         "1px solid #cbd5e1",
//                                                     color:
//                                                         "#0f172a",
//                                                     fontWeight:
//                                                         700,
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     totals.actualPTD
//                                                 )}
//                                             </td>

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "11px 12px",
//                                                     textAlign:
//                                                         "right",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderTop:
//                                                         "1px solid #cbd5e1",
//                                                     color:
//                                                         "#0f172a",
//                                                     fontWeight:
//                                                         700,
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     totals.targetPTD
//                                                 )}
//                                             </td>

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "11px 12px",
//                                                     textAlign:
//                                                         "right",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderTop:
//                                                         "1px solid #cbd5e1",
//                                                     color:
//                                                         "#0f172a",
//                                                     fontWeight:
//                                                         700,
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     totals.variancePTD
//                                                 )}
//                                             </td>

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "11px 12px",
//                                                     textAlign:
//                                                         "right",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderTop:
//                                                         "1px solid #cbd5e1",
//                                                     borderRight:
//                                                         "1px solid #e5e7eb",
//                                                     color:
//                                                         "#0f172a",
//                                                     fontWeight:
//                                                         700,
//                                                 }}
//                                             >
//                                                 {formatPercentage(
//                                                     totalVariancePTDPercent
//                                                 )}
//                                             </td>

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "11px 12px",
//                                                     textAlign:
//                                                         "right",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderTop:
//                                                         "1px solid #cbd5e1",
//                                                     color:
//                                                         "#0f172a",
//                                                     fontWeight:
//                                                         700,
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     totals.actualYTD
//                                                 )}
//                                             </td>

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "11px 12px",
//                                                     textAlign:
//                                                         "right",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderTop:
//                                                         "1px solid #cbd5e1",
//                                                     color:
//                                                         "#0f172a",
//                                                     fontWeight:
//                                                         700,
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     totals.targetYTD
//                                                 )}
//                                             </td>

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "11px 12px",
//                                                     textAlign:
//                                                         "right",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderTop:
//                                                         "1px solid #cbd5e1",
//                                                     color:
//                                                         "#0f172a",
//                                                     fontWeight:
//                                                         700,
//                                                 }}
//                                             >
//                                                 {formatNumber(
//                                                     totals.varianceYTD
//                                                 )}
//                                             </td>

//                                             <td
//                                                 style={{
//                                                     padding:
//                                                         "11px 12px",
//                                                     textAlign:
//                                                         "right",
//                                                     background:
//                                                         "#f8fafc",
//                                                     borderTop:
//                                                         "1px solid #cbd5e1",
//                                                     color:
//                                                         "#0f172a",
//                                                     fontWeight:
//                                                         700,
//                                                 }}
//                                             >
//                                                 {formatPercentage(
//                                                     totalVarianceYTDPercent
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </>
//                     )}
//                 </div>

//                 {/* =================================================
//                     FOOTER
//                 ================================================= */}

//                 <div
//                     style={{
//                         padding: "12px 22px",
//                         borderTop:
//                             "1px solid #e5e7eb",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "flex-end",
//                         background: "#ffffff",
//                         flexShrink: 0,
//                     }}
//                 >
//                     <button
//                         type="button"
//                         onClick={handleClose}
//                         style={{
//                             padding: "8px 18px",
//                             borderRadius: "6px",
//                             border:
//                                 "1px solid #d1d5db",
//                             background: "#ffffff",
//                             color: "#374151",
//                             fontSize: "12px",
//                             fontWeight: 600,
//                             cursor: "pointer",
//                         }}
//                     >
//                         Close
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }


import React, { useMemo, useState } from "react";
import ExportButtons from "../Common/ExportButtons";
import { deriveCategoryNaturalAccounts } from "../../data/opexNaturalAccounts";

/* =========================================================
   FORMAT NUMBER
========================================================= */

const formatNumber = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        value === "-"
    ) {
        return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
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

    if (!Number.isFinite(number)) {
        return "—";
    }

    return `${number.toFixed(2)}%`;
};

/* =========================================================
   GET VALUE
========================================================= */

const getValue = (row, keys = []) => {
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
   HAS VALUE
========================================================= */

const hasValue = (value) => {
    return (
        value !== null &&
        value !== undefined &&
        value !== ""
    );
};

/* =========================================================
   FILTER OPTION HELPERS
========================================================= */

const getFilterOptionId = (option) => {
    if (option === null || option === undefined) {
        return "";
    }

    if (typeof option !== "object") {
        return String(option);
    }

    return (
        option.value ??
        option.id ??
        option.code ??
        option.legal_group_id ??
        option.legal_entity_id ??
        option.parent_division_id ??
        option.subdivision_id ??
        option.period_name ??
        option.year ??
        option.name ??
        ""
    );
};

const getFilterOptionName = (option) => {
    if (option === null || option === undefined) {
        return "";
    }

    if (typeof option !== "object") {
        return String(option);
    }

    return (
        option.name ??
        option.label ??
        option.display_name ??
        option.displayName ??
        option.description ??
        option.title ??
        option.text ??
        option.period_name ??
        option.value ??
        option.code ??
        option.id ??
        ""
    );
};

const isEmptyOrAllFilterValue = (value) => {
    if (value === null || value === undefined) {
        return true;
    }

    if (Array.isArray(value)) {
        return (
            value.length === 0 ||
            value.every((item) =>
                isEmptyOrAllFilterValue(item)
            )
        );
    }

    const normalized = String(value)
        .trim()
        .toLowerCase();

    return (
        normalized === "" ||
        normalized === "all" ||
        normalized === "all values" ||
        normalized === "all value" ||
        normalized === "all options" ||
        normalized === "*"
    );
};

const resolveFilterDisplayValue = (
    selectedValue,
    options = []
) => {
    if (isEmptyOrAllFilterValue(selectedValue)) {
        return null;
    }

    /* -------------------------------------------------------
       MULTI SELECT VALUES
    ------------------------------------------------------- */

    if (Array.isArray(selectedValue)) {
        const resolvedValues = selectedValue
            .filter(
                (value) =>
                    !isEmptyOrAllFilterValue(value)
            )
            .map((value) =>
                resolveFilterDisplayValue(
                    value,
                    options
                )
            )
            .filter(Boolean);

        if (!resolvedValues.length) {
            return null;
        }

        return [...new Set(resolvedValues)].join(", ");
    }

    /* -------------------------------------------------------
       OBJECT VALUE
    ------------------------------------------------------- */

    if (typeof selectedValue === "object") {
        const displayName =
            getFilterOptionName(selectedValue);

        return isEmptyOrAllFilterValue(displayName)
            ? null
            : String(displayName);
    }

    /* -------------------------------------------------------
       PRIMITIVE VALUE
    ------------------------------------------------------- */

    const selectedText = String(selectedValue).trim();

    if (
        !selectedText ||
        isEmptyOrAllFilterValue(selectedText)
    ) {
        return null;
    }

    const matchedOption = Array.isArray(options)
        ? options.find((option) => {
            const optionId = String(
                getFilterOptionId(option)
            ).trim();

            const optionName = String(
                getFilterOptionName(option)
            ).trim();

            return (
                optionId === selectedText ||
                optionName === selectedText
            );
        })
        : null;

    if (matchedOption) {
        const displayName =
            getFilterOptionName(matchedOption);

        return isEmptyOrAllFilterValue(displayName)
            ? null
            : String(displayName);
    }

    /*
     * If no lookup match exists, preserve a value that
     * was already supplied as a human-readable value.
     */
    return selectedText;
};

const getSelectedFilterDisplayValue = (
    activeFilters,
    filterOptions,
    key
) => {
    const optionMap = {
        year:
            filterOptions?.years ||
            filterOptions?.fiscal_years ||
            [],

        period:
            filterOptions?.periods || [],

        legal_group:
            filterOptions?.legal_groups || [],

        legal_entity:
            filterOptions?.legal_entities || [],

        parent_division:
            filterOptions?.parent_divisions || [],

        subdivision:
            filterOptions?.subdivisions || [],
    };

    const directValue = activeFilters?.[key];

    const resolvedDirectValue =
        resolveFilterDisplayValue(
            directValue,
            optionMap[key] || []
        );

    if (resolvedDirectValue) {
        return resolvedDirectValue;
    }

    /* -------------------------------------------------------
       FALLBACK DISPLAY FIELDS
    ------------------------------------------------------- */

    const possibleKeys = [
        `${key}_name`,
        `${key}_label`,
        `${key}_display_name`,
        `${key}_displayName`,
        `${key}Name`,
        `${key}Label`,
    ];

    for (const possibleKey of possibleKeys) {
        const fallbackValue =
            resolveFilterDisplayValue(
                activeFilters?.[possibleKey],
                optionMap[key] || []
            );

        if (fallbackValue) {
            return fallbackValue;
        }
    }

    return null;
};

/* =========================================================
   FILTER CHIP
========================================================= */

const FilterChip = ({ label, value }) => {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        isEmptyOrAllFilterValue(value)
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
                borderRadius: "6px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontSize: "11px",
                color: "#475569",
                whiteSpace: "nowrap",
            }}
        >
            <span
                style={{
                    fontWeight: 600,
                    color: "#64748b",
                }}
            >
                {label}:
            </span>

            <span
                style={{
                    fontWeight: 500,
                    color: "#1e293b",
                }}
            >
                {value}
            </span>
        </div>
    );
};

/* =========================================================
   EXPENSE CATEGORY DRILL-DOWN MODAL
========================================================= */

export default function ExpenseCategoryDrillDownModal({
    open,
    onClose,
    data = [],
    loading = false,
    activeFilters = {},
    reportingCurrency = "AED",

    /* =====================================================
       FILTER OPTIONS
    ===================================================== */

    filterOptions = {},

    /*
     * Optional callback.
     *
     * When a category is expanded, the parent can call the
     * category-detail API and return the natural-account rows.
     *
     * Expected:
     * onExpandCategory(category) => Promise<rows> | rows
     */
    onExpandCategory,
}) {
    /* =====================================================
       EXPANDED CATEGORIES
    ===================================================== */

    const [expandedCategories, setExpandedCategories] =
        useState({});

    const [detailData, setDetailData] = useState({});

    const [detailLoading, setDetailLoading] =
        useState({});

    /* =====================================================
       NORMALIZE CATEGORY DATA
    ===================================================== */

    const rows = useMemo(() => {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data?.items)) {
            return data.items;
        }

        if (Array.isArray(data?.categories)) {
            return data.categories;
        }

        if (Array.isArray(data?.data)) {
            return data.data;
        }

        if (Array.isArray(data?.results)) {
            return data.results;
        }

        return [];
    }, [data]);

    /* =====================================================
       CURRENCY
    ===================================================== */

    const currency =
        rows?.[0]?.reporting_currency ||
        activeFilters?.reporting_currency ||
        reportingCurrency ||
        "AED";

    /* =====================================================
       SELECTED FILTER DISPLAY VALUES
    ===================================================== */

    const selectedYear =
        getSelectedFilterDisplayValue(
            activeFilters,
            filterOptions,
            "year"
        );

    const selectedPeriod =
        getSelectedFilterDisplayValue(
            activeFilters,
            filterOptions,
            "period"
        );

    const selectedLegalGroup =
        getSelectedFilterDisplayValue(
            activeFilters,
            filterOptions,
            "legal_group"
        );

    const selectedLegalEntity =
        getSelectedFilterDisplayValue(
            activeFilters,
            filterOptions,
            "legal_entity"
        );

    const selectedParentDivision =
        getSelectedFilterDisplayValue(
            activeFilters,
            filterOptions,
            "parent_division"
        );

    const selectedSubdivision =
        getSelectedFilterDisplayValue(
            activeFilters,
            filterOptions,
            "subdivision"
        );

    /* =====================================================
       TOTALS
    ===================================================== */

    const totals = useMemo(() => {
        let actualPTD = 0;
        let targetPTD = 0;
        let variancePTD = 0;

        let actualYTD = 0;
        let targetYTD = 0;
        let varianceYTD = 0;

        let hasTargetPTD = false;
        let hasVariancePTD = false;

        let hasTargetYTD = false;
        let hasVarianceYTD = false;

        rows.forEach((row) => {
            const rowActualPTD = getValue(row, [
                "actual_ptd_aed",
                "actual_ptd",
            ]);

            const rowTargetPTD = getValue(row, [
                "target_ptd_aed",
                "target_ptd",
            ]);

            const rowVariancePTD = getValue(row, [
                "variance_ptd_aed",
                "variance_ptd",
            ]);

            const rowActualYTD = getValue(row, [
                "actual_ytd_aed",
                "actual_ytd",
            ]);

            const rowTargetYTD = getValue(row, [
                "target_ytd_aed",
                "target_ytd",
            ]);

            const rowVarianceYTD = getValue(row, [
                "variance_ytd_aed",
                "variance_ytd",
            ]);

            if (hasValue(rowActualPTD)) {
                actualPTD += Number(rowActualPTD) || 0;
            }

            if (hasValue(rowTargetPTD)) {
                targetPTD += Number(rowTargetPTD) || 0;
                hasTargetPTD = true;
            }

            if (hasValue(rowVariancePTD)) {
                variancePTD +=
                    Number(rowVariancePTD) || 0;
                hasVariancePTD = true;
            }

            if (hasValue(rowActualYTD)) {
                actualYTD += Number(rowActualYTD) || 0;
            }

            if (hasValue(rowTargetYTD)) {
                targetYTD += Number(rowTargetYTD) || 0;
                hasTargetYTD = true;
            }

            if (hasValue(rowVarianceYTD)) {
                varianceYTD +=
                    Number(rowVarianceYTD) || 0;
                hasVarianceYTD = true;
            }
        });

        return {
            actualPTD,
            targetPTD: hasTargetPTD
                ? targetPTD
                : null,
            variancePTD: hasVariancePTD
                ? variancePTD
                : null,

            actualYTD,
            targetYTD: hasTargetYTD
                ? targetYTD
                : null,
            varianceYTD: hasVarianceYTD
                ? varianceYTD
                : null,
        };
    }, [rows]);

    /* =====================================================
       TOTAL VARIANCE %
    ===================================================== */

    const totalVariancePTDPercent =
        hasValue(totals.targetPTD) &&
            Number(totals.targetPTD) !== 0 &&
            hasValue(totals.variancePTD)
            ? (Number(totals.variancePTD) /
                Number(totals.targetPTD)) *
            100
            : null;

    const totalVarianceYTDPercent =
        hasValue(totals.targetYTD) &&
            Number(totals.targetYTD) !== 0 &&
            hasValue(totals.varianceYTD)
            ? (Number(totals.varianceYTD) /
                Number(totals.targetYTD)) *
            100
            : null;

    /* =====================================================
       NORMALIZE DETAIL RESPONSE
    ===================================================== */

    const normalizeDetailRows = (response) => {
        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.items)) {
            return response.items;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.results)) {
            return response.results;
        }

        return [];
    };

    /* =====================================================
       EXPAND CATEGORY
    ===================================================== */

    const handleToggleCategory = async (category, row) => {
        if (!category) {
            return;
        }

        const isExpanded =
            expandedCategories[category];

        /* -----------------------------------------------
           COLLAPSE
        ------------------------------------------------ */

        if (isExpanded) {
            setExpandedCategories((previous) => ({
                ...previous,
                [category]: false,
            }));

            return;
        }

        /* -----------------------------------------------
           ALREADY LOADED
        ------------------------------------------------ */

        if (
            Array.isArray(detailData[category]) &&
            detailData[category].length > 0
        ) {
            setExpandedCategories((previous) => ({
                ...previous,
                [category]: true,
            }));

            return;
        }

        /* -----------------------------------------------
           NO API CALLBACK
        ------------------------------------------------ */

        if (!onExpandCategory) {
            const fallbackRows = row ? deriveCategoryNaturalAccounts(row, category) : [];
            setDetailData((previous) => ({
                ...previous,
                [category]: fallbackRows,
            }));
            setExpandedCategories((previous) => ({
                ...previous,
                [category]: true,
            }));

            return;
        }

        try {
            setDetailLoading((previous) => ({
                ...previous,
                [category]: true,
            }));

            const response =
                await onExpandCategory(category, row);

            let detailRows =
                normalizeDetailRows(response);

            if ((!detailRows || detailRows.length === 0) && row) {
                detailRows = deriveCategoryNaturalAccounts(row, category);
            }

            setDetailData((previous) => ({
                ...previous,
                [category]: detailRows,
            }));

            setExpandedCategories((previous) => ({
                ...previous,
                [category]: true,
            }));
        } catch (error) {
            console.error(
                `Failed to load natural account details for ${category}:`,
                error
            );

            const fallbackRows = row ? deriveCategoryNaturalAccounts(row, category) : [];

            setDetailData((previous) => ({
                ...previous,
                [category]: fallbackRows,
            }));

            setExpandedCategories((previous) => ({
                ...previous,
                [category]: true,
            }));
        } finally {
            setDetailLoading((previous) => ({
                ...previous,
                [category]: false,
            }));
        }
    };

    /* =====================================================
       RESET DETAILS WHEN MODAL CLOSES
    ===================================================== */

    const handleClose = () => {
        setExpandedCategories({});
        setDetailData({});
        setDetailLoading({});
        onClose?.();
    };

    /* =====================================================
       COMMON EXPORT HANDLER
    ===================================================== */

    const handleExport = (type) => {
        if (!rows.length) {
            return;
        }

        const exportRows = [];

        rows.forEach((row) => {
            const category = getValue(row, [
                "category",
                "name",
            ]);

            exportRows.push({
                "Expense Category": category || "—",
                [`Actual PTD (${currency})`]:
                    getValue(row, [
                        "actual_ptd_aed",
                        "actual_ptd",
                    ]) ?? "",
                [`Target PTD (${currency})`]:
                    getValue(row, [
                        "target_ptd_aed",
                        "target_ptd",
                    ]) ?? "",
                [`Variance PTD (${currency})`]:
                    getValue(row, [
                        "variance_ptd_aed",
                        "variance_ptd",
                    ]) ?? "",
                "Variance PTD %":
                    getValue(row, [
                        "variance_ptd_pct",
                    ]) ?? "",
                [`Actual YTD (${currency})`]:
                    getValue(row, [
                        "actual_ytd_aed",
                        "actual_ytd",
                    ]) ?? "",
                [`Target YTD (${currency})`]:
                    getValue(row, [
                        "target_ytd_aed",
                        "target_ytd",
                    ]) ?? "",
                [`Variance YTD (${currency})`]:
                    getValue(row, [
                        "variance_ytd_aed",
                        "variance_ytd",
                    ]) ?? "",
                "Variance YTD %":
                    getValue(row, [
                        "variance_ytd_pct",
                    ]) ?? "",
            });

            const accounts =
                detailData[category] || [];

            accounts.forEach((account) => {
                exportRows.push({
                    "Expense Category":
                        `${category || "—"} - Natural Account`,
                    "Natural Account":
                        account.account_code || "—",
                    "Account Name":
                        account.account_name || "—",
                    [`Actual PTD (${currency})`]:
                        getValue(account, [
                            "actual_ptd_aed",
                            "actual_ptd",
                        ]) ?? "",
                    [`Actual YTD (${currency})`]:
                        getValue(account, [
                            "actual_ytd_aed",
                            "actual_ytd",
                        ]) ?? "",
                });
            });
        });

        if (type === "excel") {
            const headers = Object.keys(
                exportRows[0] || {}
            );

            const csvRows = [
                headers.join(","),
                ...exportRows.map((row) =>
                    headers
                        .map((header) => {
                            const value =
                                row[header] ?? "";

                            return `"${String(value).replace(
                                /"/g,
                                '""'
                            )}"`;
                        })
                        .join(",")
                ),
            ];

            const blob = new Blob(
                [csvRows.join("\n")],
                {
                    type: "text/csv;charset=utf-8;",
                }
            );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;
            link.download =
                "expense-category-drill-down.csv";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            return;
        }

        if (type === "pdf") {
            const printWindow =
                window.open(
                    "",
                    "_blank",
                    "width=1200,height=800"
                );

            if (!printWindow) {
                return;
            }

            const filterRows = [
                ["Year", selectedYear],
                ["Period", selectedPeriod],
                ["Currency", currency],
                [
                    "Legal Group",
                    selectedLegalGroup,
                ],
                [
                    "Legal Entity",
                    selectedLegalEntity,
                ],
                [
                    "Parent Division",
                    selectedParentDivision,
                ],
                [
                    "Subdivision",
                    selectedSubdivision,
                ],
            ].filter(
                ([, value]) =>
                    value !== null &&
                    value !== undefined &&
                    value !== ""
            );

            const tableRows = exportRows
                .map(
                    (row) => `
                        <tr>
                            <td>${row["Expense Category"] || "—"}</td>
                            <td>${row["Natural Account"] || "—"}</td>
                            <td>${row["Account Name"] || "—"}</td>
                            <td>${row[`Actual PTD (${currency})`] || "—"}</td>
                            <td>${row[`Target PTD (${currency})`] || "—"}</td>
                            <td>${row[`Variance PTD (${currency})`] || "—"}</td>
                            <td>${row["Variance PTD %"] || "—"}</td>
                            <td>${row[`Actual YTD (${currency})`] || "—"}</td>
                            <td>${row[`Target YTD (${currency})`] || "—"}</td>
                            <td>${row[`Variance YTD (${currency})`] || "—"}</td>
                            <td>${row["Variance YTD %"] || "—"}</td>
                        </tr>
                    `
                )
                .join("");

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Expense Category Drill-Down</title>

                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                padding: 24px;
                                color: #111827;
                            }

                            h1 {
                                font-size: 20px;
                                margin-bottom: 5px;
                            }

                            .subtitle {
                                color: #64748b;
                                font-size: 12px;
                                margin-bottom: 16px;
                            }

                            .filters {
                                display: flex;
                                flex-wrap: wrap;
                                gap: 6px;
                                margin-bottom: 16px;
                            }

                            .filter {
                                padding: 5px 8px;
                                border: 1px solid #e2e8f0;
                                border-radius: 5px;
                                font-size: 10px;
                            }

                            table {
                                width: 100%;
                                border-collapse: collapse;
                                font-size: 9px;
                            }

                            th,
                            td {
                                border: 1px solid #d1d5db;
                                padding: 6px;
                                text-align: right;
                            }

                            th:first-child,
                            td:first-child {
                                text-align: left;
                            }

                            th {
                                background: #f8fafc;
                                font-weight: 700;
                            }

                            @media print {
                                body {
                                    padding: 10px;
                                }
                            }
                        </style>
                    </head>

                    <body>
                        <h1>
                            Expense Category Drill-Down
                        </h1>

                        <div class="subtitle">
                            Detailed PTD and YTD expense category analysis
                        </div>

                        <div class="filters">
                            ${filterRows
                    .map(
                        ([label, value]) =>
                            `<div class="filter"><strong>${label}:</strong> ${value}</div>`
                    )
                    .join("")}
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Expense Category</th>
                                    <th>Natural Account</th>
                                    <th>Account Name</th>
                                    <th>Actual PTD</th>
                                    <th>Target PTD</th>
                                    <th>Variance PTD</th>
                                    <th>Variance PTD %</th>
                                    <th>Actual YTD</th>
                                    <th>Target YTD</th>
                                    <th>Variance YTD</th>
                                    <th>Variance YTD %</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </body>
                </html>
            `);

            printWindow.document.close();

            printWindow.focus();

            setTimeout(() => {
                printWindow.print();
            }, 300);
        }
    };

    /* =====================================================
       DON'T RENDER
    ===================================================== */

    if (!open) {
        return null;
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: "rgba(15, 23, 42, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    handleClose();
                }
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "1400px",
                    maxHeight: "92vh",
                    background: "#ffffff",
                    borderRadius: "10px",
                    boxShadow:
                        "0 20px 50px rgba(15, 23, 42, 0.20)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    style={{
                        padding: "18px 22px 14px",
                        borderBottom:
                            "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "16px",
                        flexShrink: 0,
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "18px",
                                fontWeight: 700,
                                color: "#111827",
                                lineHeight: 1.3,
                            }}
                        >
                            Expense Category Drill-Down
                        </div>

                        <div
                            style={{
                                marginTop: "4px",
                                fontSize: "12px",
                                color: "#6b7280",
                            }}
                        >
                            Detailed PTD and YTD expense
                            category analysis
                        </div>
                    </div>

                    {/* =================================================
                        CLOSE BUTTON
                    ================================================= */}

                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close"
                        style={{
                            width: "32px",
                            height: "32px",
                            border: "none",
                            background: "transparent",
                            borderRadius: "6px",
                            cursor: "pointer",
                            color: "#64748b",
                            fontSize: "24px",
                            lineHeight: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
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
                        padding: "10px 22px",
                        borderBottom:
                            "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "6px",
                        background: "#ffffff",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "6px",
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <FilterChip
                            label="Year"
                            value={selectedYear}
                        />

                        <FilterChip
                            label="Period"
                            value={selectedPeriod}
                        />

                        <FilterChip
                            label="Currency"
                            value={currency}
                        />

                        <FilterChip
                            label="Legal Group"
                            value={selectedLegalGroup}
                        />

                        <FilterChip
                            label="Legal Entity"
                            value={selectedLegalEntity}
                        />

                        <FilterChip
                            label="Parent Division"
                            value={selectedParentDivision}
                        />

                        <FilterChip
                            label="Subdivision"
                            value={selectedSubdivision}
                        />
                    </div>

                    {/* =================================================
                        COMMON EXPORT BUTTONS
                        RIGHT CORNER OF FILTER SECTION
                    ================================================= */}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginLeft: "auto",
                            flexShrink: 0,
                        }}
                    >
                        <ExportButtons
                            endpoint="expense-category-drill-down"
                            exporting={
                                loading ||
                                    rows.length === 0
                                    ? "disabled"
                                    : false
                            }
                            handleExport={handleExport}
                        />
                    </div>
                </div>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflow: "auto",
                        padding: "18px 22px",
                    }}
                >
                    {loading ? (
                        <div
                            style={{
                                minHeight: "300px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748b",
                                fontSize: "13px",
                            }}
                        >
                            Loading expense category
                            details...
                        </div>
                    ) : rows.length === 0 ? (
                        <div
                            style={{
                                minHeight: "300px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748b",
                                fontSize: "13px",
                                textAlign: "center",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "5px",
                                }}
                            >
                                No expense category data
                            </div>

                            <div>
                                No records are available
                                for the selected filters.
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* =================================================
                                SUMMARY CARDS
                            ================================================= */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(4, minmax(0, 1fr))",
                                    gap: "10px",
                                    marginBottom: "16px",
                                }}
                            >
                                {[
                                    {
                                        label: "PTD Actual",
                                        value: `${currency} ${formatNumber(
                                            totals.actualPTD
                                        )}`,
                                    },
                                    {
                                        label: "PTD Target",
                                        value: hasValue(
                                            totals.targetPTD
                                        )
                                            ? `${currency} ${formatNumber(
                                                totals.targetPTD
                                            )}`
                                            : "—",
                                    },
                                    {
                                        label: "YTD Actual",
                                        value: `${currency} ${formatNumber(
                                            totals.actualYTD
                                        )}`,
                                    },
                                    {
                                        label: "YTD Target",
                                        value: hasValue(
                                            totals.targetYTD
                                        )
                                            ? `${currency} ${formatNumber(
                                                totals.targetYTD
                                            )}`
                                            : "—",
                                    },
                                ].map(
                                    (
                                        card
                                    ) => (
                                        <div
                                            key={
                                                card.label
                                            }
                                            style={{
                                                border:
                                                    "1px solid #e5e7eb",
                                                borderRadius:
                                                    "8px",
                                                padding:
                                                    "12px 14px",
                                                background:
                                                    "#ffffff",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize:
                                                        "10px",
                                                    fontWeight:
                                                        600,
                                                    color:
                                                        "#64748b",
                                                    textTransform:
                                                        "uppercase",
                                                    letterSpacing:
                                                        "0.04em",
                                                }}
                                            >
                                                {
                                                    card.label
                                                }
                                            </div>

                                            <div
                                                style={{
                                                    marginTop:
                                                        "5px",
                                                    fontSize:
                                                        "17px",
                                                    fontWeight:
                                                        700,
                                                    color:
                                                        "#111827",
                                                }}
                                            >
                                                {
                                                    card.value
                                                }
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* =================================================
                                TABLE
                            ================================================= */}

                            <div
                                style={{
                                    width: "100%",
                                    overflowX: "auto",
                                    overflowY: "visible",
                                    border:
                                        "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                }}
                            >
                                <table
                                    style={{
                                        width: "100%",
                                        minWidth:
                                            "1250px",
                                        borderCollapse:
                                            "separate",
                                        borderSpacing:
                                            0,
                                        fontSize:
                                            "12px",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                rowSpan={
                                                    2
                                                }
                                                style={{
                                                    position:
                                                        "sticky",
                                                    left: 0,
                                                    zIndex: 4,
                                                    minWidth:
                                                        "300px",
                                                    padding:
                                                        "10px 12px",
                                                    textAlign:
                                                        "left",
                                                    background:
                                                        "#f8fafc",
                                                    borderBottom:
                                                        "1px solid #e5e7eb",
                                                    borderRight:
                                                        "1px solid #e5e7eb",
                                                    color:
                                                        "#475569",
                                                    fontWeight:
                                                        700,
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                Expense Category
                                            </th>

                                            <th
                                                colSpan={
                                                    4
                                                }
                                                style={{
                                                    padding:
                                                        "9px 12px",
                                                    textAlign:
                                                        "center",
                                                    background:
                                                        "#f8fafc",
                                                    borderBottom:
                                                        "1px solid #e5e7eb",
                                                    borderRight:
                                                        "1px solid #e5e7eb",
                                                    color:
                                                        "#334155",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                PTD
                                            </th>

                                            <th
                                                colSpan={
                                                    4
                                                }
                                                style={{
                                                    padding:
                                                        "9px 12px",
                                                    textAlign:
                                                        "center",
                                                    background:
                                                        "#f8fafc",
                                                    borderBottom:
                                                        "1px solid #e5e7eb",
                                                    color:
                                                        "#334155",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                YTD
                                            </th>
                                        </tr>

                                        <tr>
                                            {[
                                                `Actual (${currency})`,
                                                `Target (${currency})`,
                                                `Variance (${currency})`,
                                                "Variance %",
                                                `Actual (${currency})`,
                                                `Target (${currency})`,
                                                `Variance (${currency})`,
                                                "Variance %",
                                            ].map((heading, index) => (
                                                <th
                                                    key={`${heading}-${index}`}
                                                    style={{
                                                        padding: "9px 12px",
                                                        textAlign: "right",
                                                        background: "#f8fafc",
                                                        borderBottom: "1px solid #e5e7eb",
                                                        borderRight:
                                                            index === 3
                                                                ? "1px solid #e5e7eb"
                                                                : "none",
                                                        color: "#64748b",
                                                        fontWeight: 600,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rows.map(
                                            (
                                                row,
                                                index
                                            ) => {
                                                const category =
                                                    getValue(
                                                        row,
                                                        [
                                                            "category",
                                                            "name",
                                                        ]
                                                    );

                                                const actualPTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "actual_ptd_aed",
                                                            "actual_ptd",
                                                        ]
                                                    );

                                                const targetPTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "target_ptd_aed",
                                                            "target_ptd",
                                                        ]
                                                    );

                                                const variancePTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "variance_ptd_aed",
                                                            "variance_ptd",
                                                        ]
                                                    );

                                                const variancePTDPercent =
                                                    getValue(
                                                        row,
                                                        [
                                                            "variance_ptd_pct",
                                                        ]
                                                    );

                                                const actualYTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "actual_ytd_aed",
                                                            "actual_ytd",
                                                        ]
                                                    );

                                                const targetYTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "target_ytd_aed",
                                                            "target_ytd",
                                                        ]
                                                    );

                                                const varianceYTD =
                                                    getValue(
                                                        row,
                                                        [
                                                            "variance_ytd_aed",
                                                            "variance_ytd",
                                                        ]
                                                    );

                                                const varianceYTDPercent =
                                                    getValue(
                                                        row,
                                                        [
                                                            "variance_ytd_pct",
                                                        ]
                                                    );

                                                const isExpanded =
                                                    !!expandedCategories[
                                                    category
                                                    ];

                                                const categoryLoading =
                                                    !!detailLoading[
                                                    category
                                                    ];

                                                const accounts =
                                                    (Array.isArray(detailData[category]) && detailData[category].length > 0)
                                                        ? detailData[category]
                                                        : (row ? deriveCategoryNaturalAccounts(row, category) : []);

                                                return (
                                                    <React.Fragment
                                                        key={`${category}-${index}`}
                                                    >
                                                        {/* =================================================
                                                            CATEGORY ROW
                                                        ================================================= */}

                                                        <tr>
                                                            <td
                                                                style={{
                                                                    position:
                                                                        "sticky",
                                                                    left: 0,
                                                                    zIndex: 2,
                                                                    minWidth:
                                                                        "300px",
                                                                    padding:
                                                                        "10px 12px",
                                                                    background:
                                                                        "#ffffff",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    borderRight:
                                                                        "1px solid #e5e7eb",
                                                                    color:
                                                                        "#1e293b",
                                                                    fontWeight:
                                                                        600,
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleToggleCategory(
                                                                            category,
                                                                            row
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width:
                                                                            "24px",
                                                                        height:
                                                                            "24px",
                                                                        marginRight:
                                                                            "7px",
                                                                        border:
                                                                            "none",
                                                                        background:
                                                                            "transparent",
                                                                        cursor:
                                                                            "pointer",
                                                                        color:
                                                                            "#64748b",
                                                                        fontSize:
                                                                            "12px",
                                                                        padding:
                                                                            0,
                                                                        verticalAlign:
                                                                            "middle",
                                                                    }}
                                                                    aria-label={
                                                                        isExpanded
                                                                            ? `Collapse ${category}`
                                                                            : `Expand ${category}`
                                                                    }
                                                                >
                                                                    {isExpanded
                                                                        ? "▼"
                                                                        : "▶"}
                                                                </button>

                                                                {category ||
                                                                    "—"}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    actualPTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    targetPTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    variancePTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    borderRight:
                                                                        "1px solid #e5e7eb",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatPercentage(
                                                                    variancePTDPercent
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    actualYTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    targetYTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatNumber(
                                                                    varianceYTD
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "10px 12px",
                                                                    textAlign:
                                                                        "right",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    color:
                                                                        "#334155",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                {formatPercentage(
                                                                    varianceYTDPercent
                                                                )}
                                                            </td>
                                                        </tr>

                                                        {/* =================================================
                                                            NATURAL ACCOUNT LOADING ROW
                                                        ================================================= */}

                                                        {isExpanded &&
                                                            categoryLoading && (
                                                                <tr>
                                                                    <td
                                                                        colSpan={
                                                                            9
                                                                        }
                                                                        style={{
                                                                            padding:
                                                                                "14px 20px",
                                                                            background:
                                                                                "#f8fafc",
                                                                            borderBottom:
                                                                                "1px solid #e5e7eb",
                                                                            color:
                                                                                "#64748b",
                                                                            fontSize:
                                                                                "11px",
                                                                        }}
                                                                    >
                                                                        Loading natural account details...
                                                                    </td>
                                                                </tr>
                                                            )}

                                                        {/* =================================================
                                                            NATURAL ACCOUNT ROWS
                                                        ================================================= */}

                                                        {isExpanded &&
                                                            !categoryLoading &&
                                                            accounts.length >
                                                            0 &&
                                                            accounts.map(
                                                                (
                                                                    account,
                                                                    accountIndex
                                                                ) => (
                                                                    <tr
                                                                        key={`${category}-${account.account_code}-${accountIndex}`}
                                                                    >
                                                                        <td
                                                                            style={{
                                                                                position:
                                                                                    "sticky",
                                                                                left: 0,
                                                                                zIndex: 1,
                                                                                minWidth:
                                                                                    "300px",
                                                                                padding:
                                                                                    "9px 12px 9px 45px",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                borderRight:
                                                                                    "1px solid #e5e7eb",
                                                                                color:
                                                                                    "#475569",
                                                                                fontWeight:
                                                                                    500,
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    fontSize:
                                                                                        "11px",
                                                                                    color:
                                                                                        "#64748b",
                                                                                    fontWeight:
                                                                                        600,
                                                                                }}
                                                                            >
                                                                                {account.account_code ||
                                                                                    "—"}
                                                                            </div>

                                                                            <div
                                                                                style={{
                                                                                    marginTop:
                                                                                        "2px",
                                                                                    fontSize:
                                                                                        "11px",
                                                                                    color:
                                                                                        "#334155",
                                                                                    fontWeight:
                                                                                        500,
                                                                                    whiteSpace:
                                                                                        "normal",
                                                                                    lineHeight:
                                                                                        1.4,
                                                                                }}
                                                                            >
                                                                                {account.account_name ||
                                                                                    "—"}
                                                                            </div>
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#475569",
                                                                                whiteSpace:
                                                                                    "nowrap",
                                                                            }}
                                                                        >
                                                                            {formatNumber(
                                                                                getValue(
                                                                                    account,
                                                                                    [
                                                                                        "actual_ptd_aed",
                                                                                        "actual_ptd",
                                                                                    ]
                                                                                )
                                                                            )}
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                borderRight:
                                                                                    "1px solid #e5e7eb",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#475569",
                                                                                whiteSpace:
                                                                                    "nowrap",
                                                                            }}
                                                                        >
                                                                            {formatNumber(
                                                                                getValue(
                                                                                    account,
                                                                                    [
                                                                                        "actual_ytd_aed",
                                                                                        "actual_ytd",
                                                                                    ]
                                                                                )
                                                                            )}
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #eef2f7",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>

                                                                        <td
                                                                            style={{
                                                                                padding:
                                                                                    "9px 12px",
                                                                                textAlign:
                                                                                    "right",
                                                                                background:
                                                                                    "#f8fafc",
                                                                                borderBottom:
                                                                                    "1px solid #e5e7eb",
                                                                                color:
                                                                                    "#94a3b8",
                                                                            }}
                                                                        >
                                                                            —
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}

                                                        {/* =================================================
                                                            NO ACCOUNT DATA
                                                        ================================================= */}

                                                        {isExpanded &&
                                                            !categoryLoading &&
                                                            accounts.length ===
                                                            0 && (
                                                                <tr>
                                                                    <td
                                                                        colSpan={
                                                                            9
                                                                        }
                                                                        style={{
                                                                            padding:
                                                                                "12px 20px 12px 45px",
                                                                            background:
                                                                                "#f8fafc",
                                                                            borderBottom:
                                                                                "1px solid #e5e7eb",
                                                                            color:
                                                                                "#64748b",
                                                                            fontSize:
                                                                                "11px",
                                                                        }}
                                                                    >
                                                                        No natural account details available for{" "}
                                                                        <strong>
                                                                            {
                                                                                category
                                                                            }
                                                                        </strong>
                                                                        .
                                                                    </td>
                                                                </tr>
                                                            )}
                                                    </React.Fragment>
                                                );
                                            }
                                        )}

                                        {/* =================================================
                                            TOTAL ROW
                                        ================================================= */}

                                        <tr>
                                            <td
                                                style={{
                                                    position:
                                                        "sticky",
                                                    left: 0,
                                                    zIndex: 3,
                                                    padding:
                                                        "11px 12px",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    borderRight:
                                                        "1px solid #e5e7eb",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                Total
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.actualPTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.targetPTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.variancePTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    borderRight:
                                                        "1px solid #e5e7eb",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatPercentage(
                                                    totalVariancePTDPercent
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.actualYTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.targetYTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatNumber(
                                                    totals.varianceYTD
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "11px 12px",
                                                    textAlign:
                                                        "right",
                                                    background:
                                                        "#f8fafc",
                                                    borderTop:
                                                        "1px solid #cbd5e1",
                                                    color:
                                                        "#0f172a",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {formatPercentage(
                                                    totalVarianceYTDPercent
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    style={{
                        padding: "12px 22px",
                        borderTop:
                            "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        background: "#ffffff",
                        flexShrink: 0,
                    }}
                >
                    <button
                        type="button"
                        onClick={handleClose}
                        style={{
                            padding: "8px 18px",
                            borderRadius: "6px",
                            border:
                                "1px solid #d1d5db",
                            background: "#ffffff",
                            color: "#374151",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}