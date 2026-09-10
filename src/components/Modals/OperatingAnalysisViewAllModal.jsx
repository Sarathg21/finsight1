
// // import React, { useMemo, useState } from "react";

// // /* =========================================================
// //    FORMAT AMOUNT
// // ========================================================= */

// // const formatAmount = (value) => {
// //     if (
// //         value === null ||
// //         value === undefined ||
// //         value === "" ||
// //         value === "-"
// //     ) {
// //         return "—";
// //     }

// //     const number = Number(value);

// //     if (Number.isNaN(number)) {
// //         return "—";
// //     }

// //     return new Intl.NumberFormat("en-US", {
// //         minimumFractionDigits: 0,
// //         maximumFractionDigits: 2,
// //     }).format(number);
// // };


// // /* =========================================================
// //    FORMAT PERCENTAGE
// // ========================================================= */

// // const formatPercentage = (value) => {
// //     if (
// //         value === null ||
// //         value === undefined ||
// //         value === "" ||
// //         value === "-"
// //     ) {
// //         return "—";
// //     }

// //     const number = Number(value);

// //     if (Number.isNaN(number)) {
// //         return "—";
// //     }

// //     return `${number.toFixed(2)}%`;
// // };


// // /* =========================================================
// //    CHECK VALUE
// // ========================================================= */

// // const hasValue = (value) => {
// //     return !(
// //         value === null ||
// //         value === undefined ||
// //         value === "" ||
// //         value === "-"
// //     );
// // };


// // /* =========================================================
// //    CHECK "ALL" / EMPTY VALUE
// // ========================================================= */

// // const isEmptyOrAll = (value) => {
// //     if (
// //         value === null ||
// //         value === undefined ||
// //         value === ""
// //     ) {
// //         return true;
// //     }

// //     if (Array.isArray(value)) {
// //         return (
// //             value.length === 0 ||
// //             value.every((item) =>
// //                 isEmptyOrAll(item)
// //             )
// //         );
// //     }

// //     const text = String(value)
// //         .trim()
// //         .toLowerCase();

// //     return (
// //         text === "" ||
// //         text === "all" ||
// //         text === "all values" ||
// //         text === "all value" ||
// //         text === "all options" ||
// //         text === "-" ||
// //         text === "*"
// //     );
// // };


// // /* =========================================================
// //    CHECK "ALL" VALUE
// // ========================================================= */

// // const isAllValue = (value) => {
// //     if (value === null || value === undefined) {
// //         return true;
// //     }

// //     if (typeof value === "string") {
// //         const normalized = value.trim().toLowerCase();

// //         return (
// //             normalized === "" ||
// //             normalized === "all" ||
// //             normalized === "all values" ||
// //             normalized === "all options" ||
// //             normalized === "-"
// //         );
// //     }

// //     return false;
// // };


// // /* =========================================================
// //    GET DISPLAY NAME FROM FILTER OBJECT
// // ========================================================= */

// // const getFilterObjectDisplayValue = (value) => {
// //     if (value === null || value === undefined) {
// //         return null;
// //     }

// //     /* -------------------------------------------------------
// //        ARRAY
// //     ------------------------------------------------------- */

// //     if (Array.isArray(value)) {
// //         const values = value
// //             .map((item) =>
// //                 getFilterObjectDisplayValue(item)
// //             )
// //             .filter(
// //                 (item) =>
// //                     item !== null &&
// //                     item !== undefined &&
// //                     item !== ""
// //             );

// //         if (!values.length) {
// //             return null;
// //         }

// //         return values.join(", ");
// //     }


// //     /* -------------------------------------------------------
// //        OBJECT
// //     ------------------------------------------------------- */

// //     if (typeof value === "object") {

// //         /*
// //          * Prefer human-readable fields.
// //          * IDs / codes are deliberately lower priority.
// //          */

// //         const displayKeys = [
// //             "name",
// //             "label",
// //             "display_name",
// //             "displayName",
// //             "description",
// //             "title",
// //             "text",
// //             "period_name",
// //             "value",
// //         ];

// //         for (const key of displayKeys) {
// //             const displayValue = value?.[key];

// //             if (
// //                 hasValue(displayValue) &&
// //                 !isAllValue(displayValue)
// //             ) {
// //                 return String(displayValue);
// //             }
// //         }


// //         /*
// //          * If the object itself only contains an ID/code,
// //          * don't show the internal identifier.
// //          */

// //         const codeKeys = [
// //             "id",
// //             "code",
// //             "key",
// //             "uuid",
// //             "value_id",
// //             "value_code",
// //         ];

// //         const hasOnlyCodeValue = codeKeys.some(
// //             (key) =>
// //                 hasValue(value?.[key]) &&
// //                 !hasValue(
// //                     value?.name ||
// //                     value?.label ||
// //                     value?.display_name ||
// //                     value?.displayName
// //                 )
// //         );

// //         if (hasOnlyCodeValue) {
// //             return null;
// //         }

// //         return null;
// //     }


// //     /* -------------------------------------------------------
// //        STRING / NUMBER
// //     ------------------------------------------------------- */

// //     if (isAllValue(value)) {
// //         return null;
// //     }

// //     return String(value);
// // };


// // /* =========================================================
// //    GET OPTION DISPLAY NAME
// // ========================================================= */

// // const getOptionDisplayName = (option) => {
// //     if (
// //         option === null ||
// //         option === undefined
// //     ) {
// //         return "";
// //     }

// //     if (typeof option !== "object") {
// //         return String(option);
// //     }

// //     return (
// //         option.name ??
// //         option.label ??
// //         option.display_name ??
// //         option.displayName ??
// //         option.description ??
// //         option.title ??
// //         option.text ??
// //         option.period_name ??
// //         option.value ??
// //         option.code ??
// //         option.id ??
// //         ""
// //     );
// // };


// // /* =========================================================
// //    GET OPTION ID / VALUE
// // ========================================================= */

// // const getOptionId = (option) => {
// //     if (
// //         option === null ||
// //         option === undefined
// //     ) {
// //         return "";
// //     }

// //     if (typeof option !== "object") {
// //         return String(option);
// //     }

// //     return (
// //         option.value ??
// //         option.id ??
// //         option.code ??
// //         option.legal_group_id ??
// //         option.legal_entity_id ??
// //         option.parent_division_id ??
// //         option.subdivision_id ??
// //         option.period_name ??
// //         option.name ??
// //         ""
// //     );
// // };


// // /* =========================================================
// //    FIND SELECTED VALUE DISPLAY NAME
// // ========================================================= */

// // const findFilterOptionName = (
// //     selectedValue,
// //     options = []
// // ) => {
// //     if (
// //         selectedValue === null ||
// //         selectedValue === undefined ||
// //         selectedValue === ""
// //     ) {
// //         return "";
// //     }


// //     /* -------------------------------------------------------
// //        ARRAY
// //     ------------------------------------------------------- */

// //     if (Array.isArray(selectedValue)) {
// //         const names = selectedValue
// //             .filter(
// //                 (value) =>
// //                     !isEmptyOrAll(value)
// //             )
// //             .map((value) =>
// //                 findFilterOptionName(
// //                     value,
// //                     options
// //                 )
// //             )
// //             .filter(Boolean);

// //         return [
// //             ...new Set(names),
// //         ].join(", ");
// //     }


// //     /* -------------------------------------------------------
// //        OBJECT
// //     ------------------------------------------------------- */

// //     /*
// //      * If the selected value itself is an object,
// //      * use its human-readable name.
// //      */

// //     if (
// //         typeof selectedValue === "object"
// //     ) {
// //         return getOptionDisplayName(
// //             selectedValue
// //         );
// //     }


// //     /* -------------------------------------------------------
// //        STRING / NUMBER
// //     ------------------------------------------------------- */

// //     const selectedText = String(
// //         selectedValue
// //     ).trim();

// //     if (
// //         !selectedText ||
// //         isEmptyOrAll(selectedText)
// //     ) {
// //         return "";
// //     }


// //     /*
// //      * Find the selected ID/code in the
// //      * corresponding filter options.
// //      */

// //     const matchedOption =
// //         Array.isArray(options)
// //             ? options.find((option) => {

// //                 const optionId =
// //                     String(
// //                         getOptionId(
// //                             option
// //                         )
// //                     ).trim();

// //                 return (
// //                     optionId ===
// //                     selectedText
// //                 );
// //             })
// //             : null;


// //     if (matchedOption) {
// //         return getOptionDisplayName(
// //             matchedOption
// //         );
// //     }


// //     /*
// //      * If backend/filter already supplied
// //      * a display value, keep it.
// //      */

// //     return selectedText;
// // };


// // /* =========================================================
// //    GET SELECTED FILTER DISPLAY VALUE
// // ========================================================= */

// // const getSelectedFilterValue = (
// //     activeFilters,
// //     key,
// //     aliases = []
// // ) => {

// //     /*
// //      * First check the requested key.
// //      */

// //     const directValue =
// //         activeFilters?.[key];

// //     const directDisplay =
// //         getFilterObjectDisplayValue(
// //             directValue
// //         );

// //     if (directDisplay) {
// //         return directDisplay;
// //     }


// //     /*
// //      * Then check possible name/label fields.
// //      *
// //      * Example:
// //      * legal_group
// //      * legal_group_name
// //      * legal_group_label
// //      */

// //     const possibleKeys = [
// //         ...aliases,

// //         `${key}_name`,
// //         `${key}_label`,
// //         `${key}_display_name`,
// //         `${key}_displayName`,
// //         `${key}Name`,
// //         `${key}Label`,
// //     ];


// //     for (const possibleKey of possibleKeys) {

// //         const value =
// //             activeFilters?.[possibleKey];

// //         const displayValue =
// //             getFilterObjectDisplayValue(
// //                 value
// //             );

// //         if (displayValue) {
// //             return displayValue;
// //         }
// //     }


// //     return null;
// // };


// // /* =========================================================
// //    GET FILTER DISPLAY VALUE FROM OPTIONS
// // ========================================================= */

// // const getFilterDisplayValue = (
// //     filters,
// //     filterOptions,
// //     filterKey
// // ) => {

// //     const selectedValue =
// //         filters?.[filterKey];


// //     if (isEmptyOrAll(selectedValue)) {
// //         return "";
// //     }


// //     const optionMap = {

// //         legal_group:
// //             filterOptions?.legal_groups || [],

// //         legal_entity:
// //             filterOptions?.legal_entities || [],

// //         parent_division:
// //             filterOptions?.parent_divisions || [],

// //         subdivision:
// //             filterOptions?.subdivisions || [],

// //         period:
// //             filterOptions?.periods || [],

// //         year:
// //             filterOptions?.years ||
// //             filterOptions?.fiscal_years ||
// //             [],
// //     };


// //     return findFilterOptionName(
// //         selectedValue,
// //         optionMap[filterKey] || []
// //     );
// // };


// // /* =========================================================
// //    FILTER CHIP
// // ========================================================= */

// // const FilterChip = ({
// //     label,
// //     value,
// // }) => {

// //     const displayValue =
// //         getFilterObjectDisplayValue(
// //             value
// //         );


// //     /*
// //      * Do not show:
// //      * - null
// //      * - undefined
// //      * - empty
// //      * - "-"
// //      * - All
// //      */

// //     if (!displayValue) {
// //         return null;
// //     }


// //     return (
// //         <div className="finsight-detail-filter-chip">

// //             <span className="finsight-detail-filter-chip-label">
// //                 {label}:
// //             </span>

// //             <span>
// //                 {displayValue}
// //             </span>

// //         </div>
// //     );
// // };


// // /* =========================================================
// //    GET ROW VALUE
// // ========================================================= */

// // const getRowValue = (
// //     row,
// //     keys = []
// // ) => {

// //     for (const key of keys) {

// //         if (
// //             row?.[key] !== null &&
// //             row?.[key] !== undefined &&
// //             row?.[key] !== ""
// //         ) {
// //             return row[key];
// //         }
// //     }

// //     return null;
// // };


// // /* =========================================================
// //    ACTUAL VS TARGET TABLE
// // ========================================================= */

// // const ActualVsTargetTable = ({
// //     rows,
// //     currency,
// // }) => {

// //     const totalActual =
// //         rows.reduce(
// //             (sum, row) => {

// //                 const value =
// //                     getRowValue(
// //                         row,
// //                         [
// //                             "actual_ptd_aed",
// //                             "actual_ptd",
// //                             "actual",
// //                         ]
// //                     );

// //                 if (!hasValue(value)) {
// //                     return sum;
// //                 }

// //                 const number =
// //                     Number(value);

// //                 return Number.isNaN(number)
// //                     ? sum
// //                     : sum + number;

// //             },
// //             0
// //         );


// //     const targetValuesExist =
// //         rows.some(
// //             (row) => {

// //                 const value =
// //                     getRowValue(
// //                         row,
// //                         [
// //                             "target_ptd_aed",
// //                             "target_ptd",
// //                             "target",
// //                         ]
// //                     );

// //                 return hasValue(value);
// //             }
// //         );


// //     const totalTarget =
// //         rows.reduce(
// //             (sum, row) => {

// //                 const value =
// //                     getRowValue(
// //                         row,
// //                         [
// //                             "target_ptd_aed",
// //                             "target_ptd",
// //                             "target",
// //                         ]
// //                     );

// //                 if (!hasValue(value)) {
// //                     return sum;
// //                 }

// //                 const number =
// //                     Number(value);

// //                 return Number.isNaN(number)
// //                     ? sum
// //                     : sum + number;

// //             },
// //             0
// //         );


// //     return (
// //         <div className="finsight-detail-table-wrapper">

// //             <table className="finsight-detail-table">

// //                 <thead>
// //                     <tr>

// //                         <th className="text-left">
// //                             Expense Category
// //                         </th>

// //                         <th className="text-right">
// //                             Actual PTD ({currency})
// //                         </th>

// //                         <th className="text-right">
// //                             Target PTD ({currency})
// //                         </th>

// //                     </tr>
// //                 </thead>


// //                 <tbody>

// //                     {rows.map(
// //                         (
// //                             row,
// //                             index
// //                         ) => {

// //                             const category =
// //                                 getRowValue(
// //                                     row,
// //                                     [
// //                                         "category",
// //                                         "name",
// //                                     ]
// //                                 );


// //                             const actual =
// //                                 getRowValue(
// //                                     row,
// //                                     [
// //                                         "actual_ptd_aed",
// //                                         "actual_ptd",
// //                                         "actual",
// //                                     ]
// //                                 );


// //                             const target =
// //                                 getRowValue(
// //                                     row,
// //                                     [
// //                                         "target_ptd_aed",
// //                                         "target_ptd",
// //                                         "target",
// //                                     ]
// //                                 );


// //                             return (
// //                                 <tr
// //                                     key={
// //                                         `${category || "row"}-${index}`
// //                                     }
// //                                 >

// //                                     <td>
// //                                         {category || "—"}
// //                                     </td>


// //                                     <td className="text-right">
// //                                         {hasValue(actual)
// //                                             ? `${currency} ${formatAmount(actual)}`
// //                                             : "—"}
// //                                     </td>


// //                                     <td className="text-right">
// //                                         {hasValue(target)
// //                                             ? `${currency} ${formatAmount(target)}`
// //                                             : "—"}
// //                                     </td>

// //                                 </tr>
// //                             );
// //                         }
// //                     )}

// //                 </tbody>


// //                 <tfoot>
// //                     <tr>

// //                         <td>
// //                             Total
// //                         </td>

// //                         <td className="text-right">
// //                             {currency}{" "}
// //                             {formatAmount(totalActual)}
// //                         </td>

// //                         <td className="text-right">
// //                             {targetValuesExist
// //                                 ? `${currency} ${formatAmount(
// //                                     totalTarget
// //                                 )}`
// //                                 : "—"}
// //                         </td>

// //                     </tr>
// //                 </tfoot>

// //             </table>

// //         </div>
// //     );
// // };


// // /* =========================================================
// //    GENERIC TABLE
// // ========================================================= */

// // const GenericTable = ({
// //     rows,
// //     currency,
// //     categoryLabel,
// //     firstMetricLabel,
// //     secondMetricLabel,
// //     firstMetricType,
// //     secondMetricType,
// //     firstMetricKeys,
// //     secondMetricKeys,
// //     categoryKeys,
// //     totalLabel,
// // }) => {

// //     const totalAmount =
// //         rows.reduce(
// //             (sum, row) => {

// //                 const value =
// //                     getRowValue(
// //                         row,
// //                         firstMetricKeys
// //                     );

// //                 const number =
// //                     Number(value);

// //                 return Number.isNaN(number)
// //                     ? sum
// //                     : sum + number;

// //             },
// //             0
// //         );


// //     const totalPercentage =
// //         rows.reduce(
// //             (sum, row) => {

// //                 const value =
// //                     getRowValue(
// //                         row,
// //                         secondMetricKeys
// //                     );

// //                 const number =
// //                     Number(value);

// //                 return Number.isNaN(number)
// //                     ? sum
// //                     : sum + number;

// //             },
// //             0
// //         );


// //     const formatFirstMetric = (row) => {

// //         const value =
// //             getRowValue(
// //                 row,
// //                 firstMetricKeys
// //             );


// //         if (
// //             firstMetricType ===
// //             "amount"
// //         ) {
// //             return formatAmount(value);
// //         }


// //         if (
// //             firstMetricType ===
// //             "percentage"
// //         ) {
// //             return formatPercentage(value);
// //         }


// //         if (!hasValue(value)) {
// //             return "—";
// //         }


// //         return value;
// //     };


// //     const formatSecondMetric = (row) => {

// //         const value =
// //             getRowValue(
// //                 row,
// //                 secondMetricKeys
// //             );


// //         if (
// //             secondMetricType ===
// //             "amount"
// //         ) {
// //             return formatAmount(value);
// //         }


// //         if (
// //             secondMetricType ===
// //             "percentage"
// //         ) {
// //             return formatPercentage(value);
// //         }


// //         if (!hasValue(value)) {
// //             return "—";
// //         }


// //         return value;
// //     };


// //     return (
// //         <div className="finsight-detail-table-wrapper">

// //             <table className="finsight-detail-table">

// //                 <thead>
// //                     <tr>

// //                         <th className="text-left">
// //                             {categoryLabel}
// //                         </th>

// //                         <th className="text-right">

// //                             {firstMetricLabel}

// //                             {firstMetricType ===
// //                                 "amount"
// //                                 ? ` (${currency})`
// //                                 : ""}

// //                         </th>

// //                         <th className="text-right">
// //                             {secondMetricLabel}
// //                         </th>

// //                     </tr>
// //                 </thead>


// //                 <tbody>

// //                     {rows.map(
// //                         (
// //                             row,
// //                             index
// //                         ) => {

// //                             const category =
// //                                 getRowValue(
// //                                     row,
// //                                     categoryKeys
// //                                 );


// //                             return (
// //                                 <tr
// //                                     key={
// //                                         `${category || "row"}-${index}`
// //                                     }
// //                                 >

// //                                     <td>
// //                                         {category || "—"}
// //                                     </td>

// //                                     <td className="text-right">
// //                                         {formatFirstMetric(
// //                                             row
// //                                         )}
// //                                     </td>

// //                                     <td className="text-right">
// //                                         {formatSecondMetric(
// //                                             row
// //                                         )}
// //                                     </td>

// //                                 </tr>
// //                             );
// //                         }
// //                     )}

// //                 </tbody>


// //                 <tfoot>
// //                     <tr>

// //                         <td>
// //                             {totalLabel}
// //                         </td>


// //                         <td className="text-right">

// //                             {currency}{" "}

// //                             {formatAmount(
// //                                 totalAmount
// //                             )}

// //                         </td>


// //                         <td className="text-right">

// //                             {formatPercentage(
// //                                 totalPercentage
// //                             )}

// //                         </td>

// //                     </tr>
// //                 </tfoot>

// //             </table>

// //         </div>
// //     );
// // };


// // /* =========================================================
// //    MAIN COMPONENT
// // ========================================================= */

// // export default function OperatingAnalysisViewAllModal({

// //     open,

// //     onClose,

// //     data = [],

// //     loading = false,

// //     activeFilters = {},

// //     /*
// //      * IMPORTANT:
// //      * filterOptions contains the human-readable
// //      * names corresponding to active filter IDs.
// //      *
// //      * This is display-only and does not modify
// //      * activeFilters or API filters.
// //      */
// //     filterOptions = {},

// //     reportingCurrency = "AED",


// //     /* =====================================================
// //        COMMON CONFIGURATION
// //     ===================================================== */

// //     title = "Detailed View",

// //     subtitle = "",

// //     categoryLabel = "Category",

// //     firstMetricLabel = "Amount",

// //     secondMetricLabel = "Percentage",

// //     firstMetricType = "amount",

// //     secondMetricType = "percentage",

// //     firstMetricKeys = [
// //         "amount",
// //         "amount_aed",
// //     ],

// //     secondMetricKeys = [
// //         "percentage",
// //     ],

// //     categoryKeys = [
// //         "category",
// //         "name",
// //     ],

// //     totalLabel = "Total",


// //     /* =====================================================
// //        VIEW TYPE
// //     ===================================================== */

// //     viewAllType = "",

// // }) {

// //     /* =====================================================
// //        ALL HOOKS MUST BE BEFORE EARLY RETURN
// //     ===================================================== */

// //     const [searchTerm, setSearchTerm] =
// //         useState("");


// //     /* =====================================================
// //        NORMALIZE DATA
// //     ===================================================== */

// //     const rows =
// //         Array.isArray(data)
// //             ? data
// //             : Array.isArray(data?.items)
// //                 ? data.items
// //                 : Array.isArray(data?.data)
// //                     ? data.data
// //                     : Array.isArray(data?.results)
// //                         ? data.results
// //                         : [];


// //     /* =====================================================
// //        SEARCH FILTER
// //     ===================================================== */

// //     const filteredRows =
// //         useMemo(() => {

// //             const search =
// //                 searchTerm
// //                     .trim()
// //                     .toLowerCase();


// //             if (!search) {
// //                 return rows;
// //             }


// //             return rows.filter((row) => {

// //                 if (!row) {
// //                     return false;
// //                 }


// //                 return Object.values(row).some(
// //                     (value) =>
// //                         String(value ?? "")
// //                             .toLowerCase()
// //                             .includes(search)
// //                 );

// //             });

// //         }, [rows, searchTerm]);


// //     /* =====================================================
// //        CURRENCY
// //     ===================================================== */

// //     const currency =
// //         rows?.[0]?.reporting_currency ||
// //         activeFilters?.reporting_currency ||
// //         reportingCurrency ||
// //         "AED";


// //     /* =====================================================
// //        VIEW TYPE
// //     ===================================================== */

// //     const isActualVsTarget =
// //         viewAllType ===
// //         "actual-vs-target";


// //     const isExpenseCategory =
// //         viewAllType ===
// //         "expense-category";


// //     /* =====================================================
// //        GENERIC TOTAL
// //     ===================================================== */

// //     const genericTotalAmount =
// //         filteredRows.reduce(
// //             (sum, row) => {

// //                 const value =
// //                     getRowValue(
// //                         row,
// //                         firstMetricKeys
// //                     );

// //                 const number =
// //                     Number(value);

// //                 return Number.isNaN(number)
// //                     ? sum
// //                     : sum + number;

// //             },
// //             0
// //         );


// //     /* =====================================================
// //        ACTUAL VS TARGET TOTAL
// //     ===================================================== */

// //     const actualVsTargetTotal =
// //         filteredRows.reduce(
// //             (sum, row) => {

// //                 const value =
// //                     getRowValue(
// //                         row,
// //                         [
// //                             "actual_ptd_aed",
// //                             "actual_ptd",
// //                             "actual",
// //                         ]
// //                     );


// //                 if (!hasValue(value)) {
// //                     return sum;
// //                 }


// //                 const number =
// //                     Number(value);


// //                 return Number.isNaN(number)
// //                     ? sum
// //                     : sum + number;

// //             },
// //             0
// //         );


// //     const summaryTotal =
// //         isActualVsTarget
// //             ? actualVsTargetTotal
// //             : genericTotalAmount;


// //     /* =====================================================
// //        GENERIC TOTAL PERCENTAGE
// //     ===================================================== */

// //     const totalPercentage =
// //         filteredRows.reduce(
// //             (sum, row) => {

// //                 const value =
// //                     getRowValue(
// //                         row,
// //                         secondMetricKeys
// //                     );

// //                 const number =
// //                     Number(value);

// //                 return Number.isNaN(number)
// //                     ? sum
// //                     : sum + number;

// //             },
// //             0
// //         );


// //     /* =====================================================
// //        FILTER DISPLAY VALUES
       
// //        IMPORTANT:
// //        These values are ONLY for displaying the selected
// //        filter names in the chips.
       
// //        They do NOT modify API/data filtering.
// //     ===================================================== */

// //     const selectedYear =
// //         getFilterDisplayValue(
// //             activeFilters,
// //             filterOptions,
// //             "year"
// //         );


// //     const selectedPeriod =
// //         getFilterDisplayValue(
// //             activeFilters,
// //             filterOptions,
// //             "period"
// //         );


// //     const selectedCurrency =
// //         currency;


// //     const selectedLegalGroup =
// //         getFilterDisplayValue(
// //             activeFilters,
// //             filterOptions,
// //             "legal_group"
// //         );


// //     const selectedLegalEntity =
// //         getFilterDisplayValue(
// //             activeFilters,
// //             filterOptions,
// //             "legal_entity"
// //         );


// //     const selectedParentDivision =
// //         getFilterDisplayValue(
// //             activeFilters,
// //             filterOptions,
// //             "parent_division"
// //         );


// //     const selectedSubdivision =
// //         getFilterDisplayValue(
// //             activeFilters,
// //             filterOptions,
// //             "subdivision"
// //         );


// //     /* =====================================================
// //        EXCEL EXPORT
// //     ===================================================== */

// //     const exportToExcel = () => {

// //         if (!filteredRows.length) {
// //             return;
// //         }


// //         let headers = [];
// //         let tableRows = [];


// //         if (isActualVsTarget) {

// //             headers = [
// //                 "Expense Category",
// //                 `Actual PTD (${currency})`,
// //                 `Target PTD (${currency})`,
// //             ];


// //             tableRows =
// //                 filteredRows.map((row) => {

// //                     const category =
// //                         getRowValue(
// //                             row,
// //                             [
// //                                 "category",
// //                                 "name",
// //                             ]
// //                         );


// //                     const actual =
// //                         getRowValue(
// //                             row,
// //                             [
// //                                 "actual_ptd_aed",
// //                                 "actual_ptd",
// //                                 "actual",
// //                             ]
// //                         );


// //                     const target =
// //                         getRowValue(
// //                             row,
// //                             [
// //                                 "target_ptd_aed",
// //                                 "target_ptd",
// //                                 "target",
// //                             ]
// //                         );


// //                     return [
// //                         category || "—",

// //                         hasValue(actual)
// //                             ? `${currency} ${formatAmount(actual)}`
// //                             : "—",

// //                         hasValue(target)
// //                             ? `${currency} ${formatAmount(target)}`
// //                             : "—",
// //                     ];
// //                 });


// //             tableRows.push([
// //                 "Total",
// //                 `${currency} ${formatAmount(
// //                     actualVsTargetTotal
// //                 )}`,
// //                 "",
// //             ]);

// //         } else {

// //             headers = [
// //                 categoryLabel,

// //                 `${firstMetricLabel}${
// //                     firstMetricType === "amount"
// //                         ? ` (${currency})`
// //                         : ""
// //                 }`,

// //                 secondMetricLabel,
// //             ];


// //             tableRows =
// //                 filteredRows.map((row) => {

// //                     const category =
// //                         getRowValue(
// //                             row,
// //                             categoryKeys
// //                         );


// //                     const firstValue =
// //                         getRowValue(
// //                             row,
// //                             firstMetricKeys
// //                         );


// //                     const secondValue =
// //                         getRowValue(
// //                             row,
// //                             secondMetricKeys
// //                         );


// //                     let formattedFirst = "—";
// //                     let formattedSecond = "—";


// //                     if (
// //                         firstMetricType ===
// //                         "amount"
// //                     ) {

// //                         formattedFirst =
// //                             formatAmount(
// //                                 firstValue
// //                             );

// //                     } else if (
// //                         firstMetricType ===
// //                         "percentage"
// //                     ) {

// //                         formattedFirst =
// //                             formatPercentage(
// //                                 firstValue
// //                             );

// //                     } else if (
// //                         hasValue(firstValue)
// //                     ) {

// //                         formattedFirst =
// //                             firstValue;
// //                     }


// //                     if (
// //                         secondMetricType ===
// //                         "amount"
// //                     ) {

// //                         formattedSecond =
// //                             formatAmount(
// //                                 secondValue
// //                             );

// //                     } else if (
// //                         secondMetricType ===
// //                         "percentage"
// //                     ) {

// //                         formattedSecond =
// //                             formatPercentage(
// //                                 secondValue
// //                             );

// //                     } else if (
// //                         hasValue(secondValue)
// //                     ) {

// //                         formattedSecond =
// //                             secondValue;
// //                     }


// //                     return [
// //                         category || "—",

// //                         firstMetricType ===
// //                             "amount"
// //                             ? `${currency} ${formattedFirst}`
// //                             : formattedFirst,

// //                         formattedSecond,
// //                     ];
// //                 });


// //             tableRows.push([
// //                 totalLabel,

// //                 `${currency} ${formatAmount(
// //                     genericTotalAmount
// //                 )}`,

// //                 formatPercentage(
// //                     totalPercentage
// //                 ),
// //             ]);
// //         }


// //         const escapeExcelValue = (value) => {

// //             const stringValue =
// //                 String(value ?? "");


// //             return `"${stringValue.replace(
// //                 /"/g,
// //                 '""'
// //             )}"`;
// //         };


// //         const excelContent = [

// //             headers
// //                 .map(escapeExcelValue)
// //                 .join("\t"),

// //             ...tableRows.map(
// //                 (row) =>
// //                     row
// //                         .map(escapeExcelValue)
// //                         .join("\t")
// //             ),

// //         ].join("\n");


// //         const blob =
// //             new Blob(
// //                 [
// //                     "\uFEFF" +
// //                     excelContent,
// //                 ],
// //                 {
// //                     type:
// //                         "application/vnd.ms-excel;charset=utf-8;",
// //                 }
// //             );


// //         const url =
// //             URL.createObjectURL(blob);


// //         const link =
// //             document.createElement("a");


// //         link.href = url;


// //         link.download =
// //             `${title
// //                 .replace(/[^a-z0-9]/gi, "_")
// //                 .toLowerCase()}_details.xls`;


// //         document.body.appendChild(link);

// //         link.click();

// //         document.body.removeChild(link);

// //         URL.revokeObjectURL(url);
// //     };


// //     /* =====================================================
// //        PDF EXPORT
// //     ===================================================== */

// //     const exportToPDF = () => {

// //         if (!filteredRows.length) {
// //             return;
// //         }


// //         const printWindow =
// //             window.open(
// //                 "",
// //                 "_blank",
// //                 "width=1200,height=800"
// //             );


// //         if (!printWindow) {
// //             return;
// //         }


// //         const escapeHTML = (value) => {

// //             return String(value ?? "")
// //                 .replace(/&/g, "&amp;")
// //                 .replace(/</g, "&lt;")
// //                 .replace(/>/g, "&gt;")
// //                 .replace(/"/g, "&quot;")
// //                 .replace(/'/g, "&#039;");
// //         };


// //         let headers = [];
// //         let tableRows = [];


// //         if (isActualVsTarget) {

// //             headers = [
// //                 "Expense Category",
// //                 `Actual PTD (${currency})`,
// //                 `Target PTD (${currency})`,
// //             ];


// //             tableRows =
// //                 filteredRows.map((row) => {

// //                     const category =
// //                         getRowValue(
// //                             row,
// //                             [
// //                                 "category",
// //                                 "name",
// //                             ]
// //                         );


// //                     const actual =
// //                         getRowValue(
// //                             row,
// //                             [
// //                                 "actual_ptd_aed",
// //                                 "actual_ptd",
// //                                 "actual",
// //                             ]
// //                         );


// //                     const target =
// //                         getRowValue(
// //                             row,
// //                             [
// //                                 "target_ptd_aed",
// //                                 "target_ptd",
// //                                 "target",
// //                             ]
// //                         );


// //                     return [
// //                         category || "—",

// //                         hasValue(actual)
// //                             ? `${currency} ${formatAmount(actual)}`
// //                             : "—",

// //                         hasValue(target)
// //                             ? `${currency} ${formatAmount(target)}`
// //                             : "—",
// //                     ];
// //                 });


// //             tableRows.push([
// //                 "Total",

// //                 `${currency} ${formatAmount(
// //                     actualVsTargetTotal
// //                 )}`,

// //                 "",
// //             ]);

// //         } else {

// //             headers = [
// //                 categoryLabel,

// //                 `${firstMetricLabel}${
// //                     firstMetricType === "amount"
// //                         ? ` (${currency})`
// //                         : ""
// //                 }`,

// //                 secondMetricLabel,
// //             ];


// //             tableRows =
// //                 filteredRows.map((row) => {

// //                     const category =
// //                         getRowValue(
// //                             row,
// //                             categoryKeys
// //                         );


// //                     const firstValue =
// //                         getRowValue(
// //                             row,
// //                             firstMetricKeys
// //                         );


// //                     const secondValue =
// //                         getRowValue(
// //                             row,
// //                             secondMetricKeys
// //                         );


// //                     let formattedFirst = "—";
// //                     let formattedSecond = "—";


// //                     if (
// //                         firstMetricType ===
// //                         "amount"
// //                     ) {

// //                         formattedFirst =
// //                             `${currency} ${formatAmount(
// //                                 firstValue
// //                             )}`;

// //                     } else if (
// //                         firstMetricType ===
// //                         "percentage"
// //                     ) {

// //                         formattedFirst =
// //                             formatPercentage(
// //                                 firstValue
// //                             );

// //                     } else if (
// //                         hasValue(firstValue)
// //                     ) {

// //                         formattedFirst =
// //                             firstValue;
// //                     }


// //                     if (
// //                         secondMetricType ===
// //                         "amount"
// //                     ) {

// //                         formattedSecond =
// //                             `${currency} ${formatAmount(
// //                                 secondValue
// //                             )}`;

// //                     } else if (
// //                         secondMetricType ===
// //                         "percentage"
// //                     ) {

// //                         formattedSecond =
// //                             formatPercentage(
// //                                 secondValue
// //                             );

// //                     } else if (
// //                         hasValue(secondValue)
// //                     ) {

// //                         formattedSecond =
// //                             secondValue;
// //                     }


// //                     return [
// //                         category || "—",
// //                         formattedFirst,
// //                         formattedSecond,
// //                     ];
// //                 });


// //             tableRows.push([
// //                 totalLabel,

// //                 `${currency} ${formatAmount(
// //                     genericTotalAmount
// //                 )}`,

// //                 formatPercentage(
// //                     totalPercentage
// //                 ),
// //             ]);
// //         }


// //         /*
// //          * IMPORTANT:
// //          * PDF also uses DISPLAY NAMES instead of
// //          * internal filter IDs/codes.
// //          */

// //         const filterEntries = [

// //             ["Year", selectedYear],

// //             ["Period", selectedPeriod],

// //             ["Currency", selectedCurrency],

// //             ["Legal Group", selectedLegalGroup],

// //             ["Legal Entity", selectedLegalEntity],

// //             ["Parent Division", selectedParentDivision],

// //             ["Subdivision", selectedSubdivision],

// //         ].filter(
// //             ([, value]) =>
// //                 value !== null &&
// //                 value !== undefined &&
// //                 value !== ""
// //         );


// //         const filterHTML =
// //             filterEntries
// //                 .map(
// //                     ([label, value]) =>
// //                         `<span class="filter">
// //                             <strong>${escapeHTML(label)}:</strong>
// //                             ${escapeHTML(value)}
// //                         </span>`
// //                 )
// //                 .join("");


// //         const headerHTML =
// //             headers
// //                 .map(
// //                     (header) =>
// //                         `<th>${escapeHTML(header)}</th>`
// //                 )
// //                 .join("");


// //         const bodyHTML =
// //             tableRows
// //                 .map(
// //                     (row, index) => {

// //                         const isTotal =
// //                             index ===
// //                             tableRows.length - 1;


// //                         return `
// //                             <tr class="${
// //                                 isTotal
// //                                     ? "total"
// //                                     : ""
// //                             }">
// //                                 ${row
// //                                     .map(
// //                                         (cell) =>
// //                                             `<td>${escapeHTML(
// //                                                 cell
// //                                             )}</td>`
// //                                     )
// //                                     .join("")}
// //                             </tr>
// //                         `;
// //                     }
// //                 )
// //                 .join("");


// //         printWindow.document.write(`
// //             <!DOCTYPE html>
// //             <html>
// //             <head>

// //                 <title>
// //                     ${escapeHTML(title)}
// //                 </title>

// //                 <style>

// //                     * {
// //                         box-sizing: border-box;
// //                     }

// //                     body {
// //                         margin: 0;
// //                         padding: 30px;
// //                         font-family:
// //                             Arial,
// //                             Helvetica,
// //                             sans-serif;
// //                         color: #334155;
// //                         background: #ffffff;
// //                     }

// //                     h1 {
// //                         margin: 0;
// //                         color: #102a43;
// //                         font-size: 20px;
// //                         font-weight: 700;
// //                     }

// //                     .subtitle {
// //                         margin-top: 5px;
// //                         color: #64748b;
// //                         font-size: 12px;
// //                     }

// //                     .filters {
// //                         display: flex;
// //                         flex-wrap: wrap;
// //                         gap: 7px;
// //                         margin-top: 18px;
// //                         margin-bottom: 18px;
// //                     }

// //                     .filter {
// //                         padding: 6px 9px;
// //                         border: 1px solid #d9e2eb;
// //                         border-radius: 5px;
// //                         background: #f8fafc;
// //                         font-size: 10px;
// //                         color: #475569;
// //                     }

// //                     table {
// //                         width: 100%;
// //                         border-collapse: collapse;
// //                         margin-top: 10px;
// //                     }

// //                     th {
// //                         padding: 9px;
// //                         text-align: left;
// //                         background: #f1f5f9;
// //                         color: #123a69;
// //                         border: 1px solid #cbd7e4;
// //                         font-size: 10px;
// //                         font-weight: 700;
// //                         text-transform: uppercase;
// //                     }

// //                     td {
// //                         padding: 8px 9px;
// //                         border: 1px solid #e2e8f0;
// //                         font-size: 11px;
// //                     }

// //                     td:not(:first-child),
// //                     th:not(:first-child) {
// //                         text-align: right;
// //                     }

// //                     tr:nth-child(even) td {
// //                         background: #f8fafc;
// //                     }

// //                     tr.total td {
// //                         background: #f3f6f9;
// //                         font-weight: 700;
// //                         border-top: 2px solid #cbd5e1;
// //                     }

// //                     .record-count {
// //                         margin-top: 10px;
// //                         color: #64748b;
// //                         font-size: 10px;
// //                     }

// //                     @media print {

// //                         body {
// //                             padding: 15px;
// //                         }

// //                     }

// //                 </style>

// //             </head>

// //             <body>

// //                 <h1>
// //                     ${escapeHTML(title)}
// //                 </h1>

// //                 ${
// //                     subtitle
// //                         ? `<div class="subtitle">
// //                             ${escapeHTML(subtitle)}
// //                            </div>`
// //                         : ""
// //                 }

// //                 ${
// //                     filterHTML
// //                         ? `<div class="filters">
// //                             ${filterHTML}
// //                            </div>`
// //                         : ""
// //                 }

// //                 <div class="record-count">
// //                     ${filteredRows.length}
// //                     ${
// //                         filteredRows.length === 1
// //                             ? "record"
// //                             : "records"
// //                     }
// //                 </div>

// //                 <table>

// //                     <thead>
// //                         <tr>
// //                             ${headerHTML}
// //                         </tr>
// //                     </thead>

// //                     <tbody>
// //                         ${bodyHTML}
// //                     </tbody>

// //                 </table>

// //             </body>
// //             </html>
// //         `);


// //         printWindow.document.close();

// //         printWindow.focus();


// //         setTimeout(() => {

// //             printWindow.print();

// //             printWindow.close();

// //         }, 300);
// //     };


// //     /* =====================================================
// //        EARLY RETURN
// //     ===================================================== */

// //     if (!open) {
// //         return null;
// //     }


// //     /* =====================================================
// //        MODAL
// //     ===================================================== */

// //     return (
// //         <>
// //             <style>{`

// //                 .finsight-detail-backdrop {
// //                     position: fixed;
// //                     inset: 0;
// //                     z-index: 1000;
// //                     background:
// //                         rgba(15, 23, 42, 0.42);
// //                     backdrop-filter:
// //                         blur(5px);
// //                     -webkit-backdrop-filter:
// //                         blur(5px);
// //                     display: flex;
// //                     align-items: center;
// //                     justify-content: center;
// //                     padding: 28px;
// //                     box-sizing: border-box;
// //                 }


// //                 .finsight-detail-modal {
// //                     width: 100%;
// //                     max-width: 1520px;
// //                     height:
// //                         min(82vh, 730px);
// //                     min-height: 520px;
// //                     background: #ffffff;
// //                     border-radius: 14px;
// //                     overflow: hidden;
// //                     display: flex;
// //                     flex-direction: column;
// //                     box-sizing: border-box;
// //                     border:
// //                         1px solid #e1e7ee;
// //                     box-shadow:
// //                         0 24px 60px
// //                         rgba(15, 23, 42, 0.24);
// //                 }


// //                 .finsight-detail-header {
// //                     min-height: 68px;
// //                     padding:
// //                         14px 20px 13px;
// //                     box-sizing: border-box;
// //                     display: flex;
// //                     align-items: flex-start;
// //                     justify-content: space-between;
// //                     gap: 20px;
// //                     border-bottom:
// //                         1px solid #e7edf3;
// //                     flex-shrink: 0;
// //                 }


// //                 .finsight-detail-title {
// //                     color: #102a43;
// //                     font-size: 15px;
// //                     line-height: 20px;
// //                     font-weight: 700;
// //                     letter-spacing:
// //                         -0.05px;
// //                 }


// //                 .finsight-detail-subtitle {
// //                     margin-top: 2px;
// //                     color: #55708d;
// //                     font-size: 11px;
// //                     line-height: 16px;
// //                 }


// //                 .finsight-detail-close {
// //                     width: 30px;
// //                     height: 30px;
// //                     padding: 0;
// //                     border: 0;
// //                     background:
// //                         transparent;
// //                     color: #718096;
// //                     border-radius: 6px;
// //                     cursor: pointer;
// //                     font-size: 22px;
// //                     line-height: 30px;
// //                     font-weight: 300;
// //                     display: inline-flex;
// //                     align-items: center;
// //                     justify-content: center;
// //                     flex-shrink: 0;
// //                     transition:
// //                         background 0.15s ease,
// //                         color 0.15s ease;
// //                 }


// //                 .finsight-detail-close:hover {
// //                     background:
// //                         #f1f5f9;
// //                     color:
// //                         #334155;
// //                 }


// //                 .finsight-detail-toolbar {
// //                     min-height: 54px;
// //                     padding:
// //                         9px 20px;
// //                     box-sizing: border-box;
// //                     display: flex;
// //                     align-items: center;
// //                     justify-content: space-between;
// //                     gap: 12px;
// //                     flex-wrap: wrap;
// //                     background:
// //                         #f8fafc;
// //                     border-bottom:
// //                         1px solid #e5ebf2;
// //                     flex-shrink: 0;
// //                 }


// //                 .finsight-detail-toolbar-left {
// //                     display: flex;
// //                     align-items: center;
// //                     flex-wrap: wrap;
// //                     gap: 5px;
// //                     min-width: 0;
// //                     flex: 1 1 auto;
// //                 }


// //                 .finsight-detail-filters {
// //                     display: flex;
// //                     align-items: center;
// //                     flex-wrap: wrap;
// //                     gap: 5px;
// //                     min-width: 0;
// //                 }


// //                 .finsight-detail-filter-chip {
// //                     min-height: 32px;
// //                     padding:
// //                         0 10px;
// //                     box-sizing: border-box;
// //                     display: inline-flex;
// //                     align-items: center;
// //                     gap: 5px;
// //                     white-space: nowrap;
// //                     background:
// //                         #ffffff;
// //                     border:
// //                         1px solid #d9e2eb;
// //                     border-radius:
// //                         6px;
// //                     color:
// //                         #475569;
// //                     font-size:
// //                         11px;
// //                     line-height:
// //                         16px;
// //                 }


// //                 .finsight-detail-filter-chip-label {
// //                     color:
// //                         #64748b;
// //                     font-weight:
// //                         600;
// //                 }


// //                 .finsight-detail-toolbar-right {
// //                     display: flex;
// //                     align-items: center;
// //                     justify-content: flex-end;
// //                     gap: 6px;
// //                     flex-shrink: 0;
// //                 }


// //                 .finsight-detail-search {
// //                     position: relative;
// //                     width: 190px;
// //                     height: 32px;
// //                     flex-shrink: 0;
// //                 }


// //                 .finsight-detail-search-icon {
// //                     position: absolute;
// //                     left: 9px;
// //                     top: 50%;
// //                     transform:
// //                         translateY(-50%);
// //                     color:
// //                         #94a3b8;
// //                     font-size: 14px;
// //                     line-height: 1;
// //                     pointer-events: none;
// //                 }


// //                 .finsight-detail-search-input {
// //                     width: 100%;
// //                     height: 32px;
// //                     padding:
// //                         0 10px 0 29px;
// //                     border:
// //                         1px solid #d5dee8;
// //                     border-radius:
// //                         6px;
// //                     outline: none;
// //                     background:
// //                         #ffffff;
// //                     color:
// //                         #334155;
// //                     font-size:
// //                         11px;
// //                     box-sizing:
// //                         border-box;
// //                     transition:
// //                         border-color 0.15s ease,
// //                         box-shadow 0.15s ease;
// //                 }


// //                 .finsight-detail-search-input::placeholder {
// //                     color:
// //                         #94a3b8;
// //                 }


// //                 .finsight-detail-search-input:focus {
// //                     border-color:
// //                         #9db7d2;
// //                     box-shadow:
// //                         0 0 0 2px
// //                         rgba(59, 130, 246, 0.08);
// //                 }


// //                 .finsight-detail-export-button {
// //                     height: 32px;
// //                     padding:
// //                         0 10px;
// //                     display: inline-flex;
// //                     align-items: center;
// //                     justify-content: center;
// //                     gap: 5px;
// //                     border:
// //                         1px solid #d5dee8;
// //                     border-radius:
// //                         6px;
// //                     background:
// //                         #ffffff;
// //                     color:
// //                         #475569;
// //                     font-size:
// //                         11px;
// //                     line-height:
// //                         16px;
// //                     font-weight:
// //                         600;
// //                     cursor:
// //                         pointer;
// //                     white-space:
// //                         nowrap;
// //                     transition:
// //                         background 0.15s ease,
// //                         border-color 0.15s ease,
// //                         color 0.15s ease;
// //                 }


// //                 .finsight-detail-export-button:hover {
// //                     background:
// //                         #f1f5f9;
// //                     border-color:
// //                         #c5d1dd;
// //                     color:
// //                         #26384d;
// //                 }


// //                 .finsight-detail-export-button:disabled {
// //                     opacity:
// //                         0.45;
// //                     cursor:
// //                         not-allowed;
// //                 }


// //                 .finsight-detail-export-icon {
// //                     font-size:
// //                         13px;
// //                     line-height:
// //                         1;
// //                 }


// //                 .finsight-detail-records {
// //                     margin-left: 3px;
// //                     white-space: nowrap;
// //                     color:
// //                         #8aa0b7;
// //                     font-size:
// //                         11px;
// //                 }


// //                 .finsight-detail-content {
// //                     flex: 1;
// //                     min-height: 0;
// //                     overflow: hidden;
// //                     padding:
// //                         0 16px 8px;
// //                     background:
// //                         #ffffff;
// //                     box-sizing:
// //                         border-box;
// //                 }


// //                 .finsight-detail-table-scroll {
// //                     width: 100%;
// //                     height: 100%;
// //                     overflow:
// //                         auto;
// //                     scrollbar-width:
// //                         thin;
// //                     scrollbar-color:
// //                         #cbd5e1 transparent;
// //                 }


// //                 .finsight-detail-table-scroll::-webkit-scrollbar {
// //                     width: 8px;
// //                     height: 8px;
// //                 }


// //                 .finsight-detail-table-scroll::-webkit-scrollbar-track {
// //                     background:
// //                         transparent;
// //                 }


// //                 .finsight-detail-table-scroll::-webkit-scrollbar-thumb {
// //                     background:
// //                         #cbd5e1;
// //                     border-radius:
// //                         8px;
// //                 }


// //                 .finsight-detail-table-scroll::-webkit-scrollbar-thumb:hover {
// //                     background:
// //                         #94a3b8;
// //                 }


// //                 .finsight-detail-table-wrapper {
// //                     width: 100%;
// //                     min-width: 100%;
// //                     overflow: hidden;
// //                     border:
// //                         1px solid #dce4ec;
// //                     border-top: 0;
// //                     box-sizing: border-box;
// //                 }


// //                 .finsight-detail-table {
// //                     width: 100%;
// //                     min-width: 720px;
// //                     border-collapse:
// //                         separate;
// //                     border-spacing: 0;
// //                     font-family:
// //                         inherit;
// //                     table-layout:
// //                         auto;
// //                 }


// //                 .finsight-detail-table thead th {
// //                     position: sticky;
// //                     top: 0;
// //                     z-index: 3;
// //                     padding:
// //                         10px 9px;
// //                     background:
// //                         #f1f5f9;
// //                     color:
// //                         #123a69;
// //                     border-bottom:
// //                         1px solid #cbd7e4;
// //                     border-right:
// //                         1px solid #d5dee8;
// //                     font-size:
// //                         11px;
// //                     line-height:
// //                         16px;
// //                     font-weight:
// //                         700;
// //                     letter-spacing:
// //                         0.35px;
// //                     text-transform:
// //                         uppercase;
// //                     white-space:
// //                         nowrap;
// //                     box-sizing:
// //                         border-box;
// //                 }


// //                 .finsight-detail-table thead th:first-child {
// //                     padding-left:
// //                         9px;
// //                 }


// //                 .finsight-detail-table thead th:last-child {
// //                     border-right:
// //                         0;
// //                 }


// //                 .finsight-detail-table tbody td {
// //                     padding:
// //                         8px 9px;
// //                     color:
// //                         #334155;
// //                     border-bottom:
// //                         1px solid #edf1f5;
// //                     border-right:
// //                         1px solid #edf1f5;
// //                     font-size:
// //                         12px;
// //                     line-height:
// //                         17px;
// //                     white-space:
// //                         nowrap;
// //                     box-sizing:
// //                         border-box;
// //                 }


// //                 .finsight-detail-table tbody tr:nth-child(even) td {
// //                     background:
// //                         #f8fafc;
// //                 }


// //                 .finsight-detail-table tbody tr:hover td {
// //                     background:
// //                         #f2f6fa;
// //                 }


// //                 .finsight-detail-table tbody td:first-child {
// //                     color:
// //                         #26384d;
// //                     font-weight:
// //                         600;
// //                 }


// //                 .finsight-detail-table tbody td:last-child {
// //                     border-right:
// //                         0;
// //                 }


// //                 .finsight-detail-table tfoot td {
// //                     position: sticky;
// //                     bottom: 0;
// //                     z-index: 2;
// //                     padding:
// //                         9px;
// //                     background:
// //                         #f3f6f9;
// //                     color:
// //                         #1e2f43;
// //                     border-top:
// //                         1px solid #d3dde7;
// //                     border-right:
// //                         1px solid #dfe6ed;
// //                     font-size:
// //                         12px;
// //                     line-height:
// //                         17px;
// //                     font-weight:
// //                         700;
// //                     white-space:
// //                         nowrap;
// //                     box-sizing:
// //                         border-box;
// //                 }


// //                 .finsight-detail-table tfoot td:last-child {
// //                     border-right:
// //                         0;
// //                 }


// //                 .finsight-detail-table .text-left {
// //                     text-align:
// //                         left;
// //                 }


// //                 .finsight-detail-table .text-right {
// //                     text-align:
// //                         right;
// //                 }


// //                 .finsight-detail-loading {
// //                     min-height:
// //                         280px;
// //                     height:
// //                         100%;
// //                     display:
// //                         flex;
// //                     align-items:
// //                         center;
// //                     justify-content:
// //                         center;
// //                     color:
// //                         #64748b;
// //                     font-size:
// //                         13px;
// //                 }


// //                 .finsight-detail-empty {
// //                     min-height:
// //                         280px;
// //                     height:
// //                         100%;
// //                     display:
// //                         flex;
// //                     flex-direction:
// //                         column;
// //                     align-items:
// //                         center;
// //                     justify-content:
// //                         center;
// //                     color:
// //                         #64748b;
// //                     text-align:
// //                         center;
// //                 }


// //                 .finsight-detail-empty-title {
// //                     color:
// //                         #334155;
// //                     font-size:
// //                         14px;
// //                     font-weight:
// //                         600;
// //                 }


// //                 .finsight-detail-empty-message {
// //                     margin-top:
// //                         5px;
// //                     font-size:
// //                         12px;
// //                 }


// //                 .finsight-detail-footer {
// //                     min-height:
// //                         64px;
// //                     padding:
// //                         12px 20px;
// //                     box-sizing:
// //                         border-box;
// //                     display:
// //                         flex;
// //                     align-items:
// //                         center;
// //                     justify-content:
// //                         flex-end;
// //                     background:
// //                         #ffffff;
// //                     border-top:
// //                         1px solid #e5ebf2;
// //                     flex-shrink:
// //                         0;
// //                 }


// //                 .finsight-detail-footer-button {
// //                     min-width:
// //                         70px;
// //                     height:
// //                         31px;
// //                     padding:
// //                         0 16px;
// //                     border:
// //                         1px solid #d4dce5;
// //                     border-radius:
// //                         7px;
// //                     background:
// //                         #f1f5f9;
// //                     color:
// //                         #41566d;
// //                     font-size:
// //                         12px;
// //                     font-weight:
// //                         600;
// //                     cursor:
// //                         pointer;
// //                     transition:
// //                         background 0.15s ease;
// //                 }


// //                 .finsight-detail-footer-button:hover {
// //                     background:
// //                         #e8eef5;
// //                 }


// //                 @media (max-width: 1100px) {

// //                     .finsight-detail-toolbar {
// //                         align-items:
// //                             flex-start;
// //                     }

// //                     .finsight-detail-toolbar-right {
// //                         width:
// //                             100%;
// //                         justify-content:
// //                             flex-start;
// //                     }

// //                     .finsight-detail-records {
// //                         margin-left:
// //                             auto;
// //                     }

// //                 }


// //                 @media (max-width: 900px) {

// //                     .finsight-detail-backdrop {
// //                         padding:
// //                             14px;
// //                     }

// //                     .finsight-detail-modal {
// //                         height:
// //                             calc(100vh - 28px);
// //                         min-height:
// //                             420px;
// //                         border-radius:
// //                             10px;
// //                     }

// //                     .finsight-detail-toolbar {
// //                         align-items:
// //                             flex-start;
// //                     }

// //                     .finsight-detail-toolbar-left {
// //                         width:
// //                             100%;
// //                     }

// //                     .finsight-detail-toolbar-right {
// //                         width:
// //                             100%;
// //                         justify-content:
// //                             flex-start;
// //                     }

// //                     .finsight-detail-search {
// //                         flex:
// //                             1 1 180px;
// //                     }

// //                     .finsight-detail-records {
// //                         margin-left:
// //                             3px;
// //                     }

// //                 }


// //                 @media (max-width: 600px) {

// //                     .finsight-detail-search {
// //                         width:
// //                             100%;
// //                     }

// //                     .finsight-detail-export-button {
// //                         flex:
// //                             1 1 auto;
// //                     }

// //                 }

// //             `}</style>


// //             {/* =====================================================
// //                 BACKDROP
// //             ===================================================== */}

// //             <div
// //                 className="finsight-detail-backdrop"
// //                 onClick={(event) => {

// //                     if (
// //                         event.target ===
// //                         event.currentTarget
// //                     ) {
// //                         onClose();
// //                     }

// //                 }}
// //             >


// //                 {/* =================================================
// //                     MODAL
// //                 ================================================= */}

// //                 <div className="finsight-detail-modal">


// //                     {/* =================================================
// //                         HEADER
// //                     ================================================= */}

// //                     <div className="finsight-detail-header">

// //                         <div>

// //                             <div className="finsight-detail-title">
// //                                 {title}
// //                             </div>


// //                             {subtitle && (
// //                                 <div className="finsight-detail-subtitle">
// //                                     {subtitle}
// //                                 </div>
// //                             )}

// //                         </div>


// //                         <button
// //                             type="button"
// //                             className="finsight-detail-close"
// //                             onClick={onClose}
// //                             aria-label="Close"
// //                         >
// //                             ×
// //                         </button>

// //                     </div>


// //                     {/* =================================================
// //                         FILTER / ACTION BAR
// //                     ================================================= */}

// //                     <div className="finsight-detail-toolbar">


// //                         {/* =================================================
// //                             SELECTED FILTERS ONLY
// //                         ================================================= */}

// //                         <div className="finsight-detail-toolbar-left">

// //                             <div className="finsight-detail-filters">


// //                                 {/* =================================================
// //                                     YEAR
// //                                 ================================================= */}

// //                                 <FilterChip
// //                                     label="Year"
// //                                     value={
// //                                         selectedYear
// //                                     }
// //                                 />


// //                                 {/* =================================================
// //                                     PERIOD
// //                                 ================================================= */}

// //                                 <FilterChip
// //                                     label="Period"
// //                                     value={
// //                                         selectedPeriod
// //                                     }
// //                                 />


// //                                 {/* =================================================
// //                                     CURRENCY
// //                                 ================================================= */}

// //                                 <FilterChip
// //                                     label="Currency"
// //                                     value={
// //                                         selectedCurrency
// //                                     }
// //                                 />


// //                                 {/* =================================================
// //                                     LEGAL GROUP
// //                                 ================================================= */}

// //                                 <FilterChip
// //                                     label="Legal Group"
// //                                     value={
// //                                         selectedLegalGroup
// //                                     }
// //                                 />


// //                                 {/* =================================================
// //                                     LEGAL ENTITY
// //                                 ================================================= */}

// //                                 <FilterChip
// //                                     label="Legal Entity"
// //                                     value={
// //                                         selectedLegalEntity
// //                                     }
// //                                 />


// //                                 {/* =================================================
// //                                     PARENT DIVISION
// //                                 ================================================= */}

// //                                 <FilterChip
// //                                     label="Parent Division"
// //                                     value={
// //                                         selectedParentDivision
// //                                     }
// //                                 />


// //                                 {/* =================================================
// //                                     SUBDIVISION
// //                                 ================================================= */}

// //                                 <FilterChip
// //                                     label="Subdivision"
// //                                     value={
// //                                         selectedSubdivision
// //                                     }
// //                                 />

// //                             </div>

// //                         </div>


// //                         {/* =================================================
// //                             RIGHT SIDE
// //                         ================================================= */}

// //                         <div className="finsight-detail-toolbar-right">


// //                             {/* =================================================
// //                                 SEARCH
// //                             ================================================= */}

// //                             <div className="finsight-detail-search">

// //                                 <span
// //                                     className="finsight-detail-search-icon"
// //                                     aria-hidden="true"
// //                                 >
// //                                     🔍
// //                                 </span>


// //                                 <input
// //                                     type="text"
// //                                     className="finsight-detail-search-input"
// //                                     value={searchTerm}
// //                                     onChange={(event) =>
// //                                         setSearchTerm(
// //                                             event.target.value
// //                                         )
// //                                     }
// //                                     placeholder="Search..."
// //                                     aria-label="Search detailed data"
// //                                 />

// //                             </div>


// //                             {/* =================================================
// //                                 EXCEL
// //                             ================================================= */}

// //                             <button
// //                                 type="button"
// //                                 className="finsight-detail-export-button"
// //                                 onClick={exportToExcel}
// //                                 disabled={
// //                                     loading ||
// //                                     filteredRows.length === 0
// //                                 }
// //                                 title="Export to Excel"
// //                             >

// //                                 <span className="finsight-detail-export-icon">
// //                                     ↓
// //                                 </span>

// //                                 Excel

// //                             </button>


// //                             {/* =================================================
// //                                 PDF
// //                             ================================================= */}

// //                             <button
// //                                 type="button"
// //                                 className="finsight-detail-export-button"
// //                                 onClick={exportToPDF}
// //                                 disabled={
// //                                     loading ||
// //                                     filteredRows.length === 0
// //                                 }
// //                                 title="Export to PDF"
// //                             >

// //                                 <span className="finsight-detail-export-icon">
// //                                     ↓
// //                                 </span>

// //                                 PDF

// //                             </button>


// //                             {/* =================================================
// //                                 RECORD COUNT
// //                             ================================================= */}

// //                             <div className="finsight-detail-records">

// //                                 {filteredRows.length}{" "}

// //                                 {filteredRows.length === 1
// //                                     ? "record"
// //                                     : "records"}

// //                             </div>

// //                         </div>

// //                     </div>


// //                     {/* =================================================
// //                         CONTENT
// //                     ================================================= */}

// //                     <div className="finsight-detail-content">

// //                         {loading ? (

// //                             <div className="finsight-detail-loading">
// //                                 Loading detailed data...
// //                             </div>

// //                         ) : filteredRows.length === 0 ? (

// //                             <div className="finsight-detail-empty">

// //                                 <div className="finsight-detail-empty-title">

// //                                     {searchTerm.trim()
// //                                         ? "No matching records"
// //                                         : "No data available"}

// //                                 </div>


// //                                 <div className="finsight-detail-empty-message">

// //                                     {searchTerm.trim()
// //                                         ? "Try changing your search."
// //                                         : "Try changing the selected filters."}

// //                                 </div>

// //                             </div>

// //                         ) : (

// //                             <div className="finsight-detail-table-scroll">

// //                                 {isActualVsTarget ? (

// //                                     <ActualVsTargetTable
// //                                         rows={filteredRows}
// //                                         currency={currency}
// //                                     />

// //                                 ) : (

// //                                     <GenericTable
// //                                         rows={filteredRows}
// //                                         currency={currency}
// //                                         categoryLabel={
// //                                             categoryLabel
// //                                         }
// //                                         firstMetricLabel={
// //                                             firstMetricLabel
// //                                         }
// //                                         secondMetricLabel={
// //                                             secondMetricLabel
// //                                         }
// //                                         firstMetricType={
// //                                             firstMetricType
// //                                         }
// //                                         secondMetricType={
// //                                             secondMetricType
// //                                         }
// //                                         firstMetricKeys={
// //                                             firstMetricKeys
// //                                         }
// //                                         secondMetricKeys={
// //                                             secondMetricKeys
// //                                         }
// //                                         categoryKeys={
// //                                             categoryKeys
// //                                         }
// //                                         totalLabel={
// //                                             totalLabel
// //                                         }
// //                                     />

// //                                 )}

// //                             </div>

// //                         )}

// //                     </div>


// //                     {/* =================================================
// //                         FOOTER
// //                     ================================================= */}

// //                     <div className="finsight-detail-footer">

// //                         <button
// //                             type="button"
// //                             className="finsight-detail-footer-button"
// //                             onClick={onClose}
// //                         >
// //                             Close
// //                         </button>

// //                     </div>

// //                 </div>

// //             </div>

// //         </>
// //     );
// // }

// import React, { useMemo, useState } from "react";
// import ExportButtons from "../Common/ExportButtons";

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
//    CHECK VALUE
// ========================================================= */

// const hasValue = (value) => {
//     return !(
//         value === null ||
//         value === undefined ||
//         value === "" ||
//         value === "-"
//     );
// };


// /* =========================================================
//    CHECK "ALL" / EMPTY VALUE
// ========================================================= */

// const isEmptyOrAll = (value) => {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ""
//     ) {
//         return true;
//     }

//     if (Array.isArray(value)) {
//         return (
//             value.length === 0 ||
//             value.every((item) =>
//                 isEmptyOrAll(item)
//             )
//         );
//     }

//     const text = String(value)
//         .trim()
//         .toLowerCase();

//     return (
//         text === "" ||
//         text === "all" ||
//         text === "all values" ||
//         text === "all value" ||
//         text === "all options" ||
//         text === "-" ||
//         text === "*"
//     );
// };


// /* =========================================================
//    CHECK "ALL" VALUE
// ========================================================= */

// const isAllValue = (value) => {
//     if (value === null || value === undefined) {
//         return true;
//     }

//     if (typeof value === "string") {
//         const normalized = value.trim().toLowerCase();

//         return (
//             normalized === "" ||
//             normalized === "all" ||
//             normalized === "all values" ||
//             normalized === "all options" ||
//             normalized === "-"
//         );
//     }

//     return false;
// };


// /* =========================================================
//    GET DISPLAY NAME FROM FILTER OBJECT
// ========================================================= */

// const getFilterObjectDisplayValue = (value) => {
//     if (value === null || value === undefined) {
//         return null;
//     }

//     /* -------------------------------------------------------
//        ARRAY
//     ------------------------------------------------------- */

//     if (Array.isArray(value)) {
//         const values = value
//             .map((item) =>
//                 getFilterObjectDisplayValue(item)
//             )
//             .filter(
//                 (item) =>
//                     item !== null &&
//                     item !== undefined &&
//                     item !== ""
//             );

//         if (!values.length) {
//             return null;
//         }

//         return values.join(", ");
//     }


//     /* -------------------------------------------------------
//        OBJECT
//     ------------------------------------------------------- */

//     if (typeof value === "object") {

//         /*
//          * Prefer human-readable fields.
//          * IDs / codes are deliberately lower priority.
//          */

//         const displayKeys = [
//             "name",
//             "label",
//             "display_name",
//             "displayName",
//             "description",
//             "title",
//             "text",
//             "period_name",
//             "value",
//         ];

//         for (const key of displayKeys) {
//             const displayValue = value?.[key];

//             if (
//                 hasValue(displayValue) &&
//                 !isAllValue(displayValue)
//             ) {
//                 return String(displayValue);
//             }
//         }


//         /*
//          * If the object itself only contains an ID/code,
//          * don't show the internal identifier.
//          */

//         const codeKeys = [
//             "id",
//             "code",
//             "key",
//             "uuid",
//             "value_id",
//             "value_code",
//         ];

//         const hasOnlyCodeValue = codeKeys.some(
//             (key) =>
//                 hasValue(value?.[key]) &&
//                 !hasValue(
//                     value?.name ||
//                     value?.label ||
//                     value?.display_name ||
//                     value?.displayName
//                 )
//         );

//         if (hasOnlyCodeValue) {
//             return null;
//         }

//         return null;
//     }


//     /* -------------------------------------------------------
//        STRING / NUMBER
//     ------------------------------------------------------- */

//     if (isAllValue(value)) {
//         return null;
//     }

//     return String(value);
// };


// /* =========================================================
//    GET OPTION DISPLAY NAME
// ========================================================= */

// const getOptionDisplayName = (option) => {
//     if (
//         option === null ||
//         option === undefined
//     ) {
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


// /* =========================================================
//    GET OPTION ID / VALUE
// ========================================================= */

// const getOptionId = (option) => {
//     if (
//         option === null ||
//         option === undefined
//     ) {
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
//         option.name ??
//         ""
//     );
// };


// /* =========================================================
//    FIND SELECTED VALUE DISPLAY NAME
// ========================================================= */

// const findFilterOptionName = (
//     selectedValue,
//     options = []
// ) => {
//     if (
//         selectedValue === null ||
//         selectedValue === undefined ||
//         selectedValue === ""
//     ) {
//         return "";
//     }


//     /* -------------------------------------------------------
//        ARRAY
//     ------------------------------------------------------- */

//     if (Array.isArray(selectedValue)) {
//         const names = selectedValue
//             .filter(
//                 (value) =>
//                     !isEmptyOrAll(value)
//             )
//             .map((value) =>
//                 findFilterOptionName(
//                     value,
//                     options
//                 )
//             )
//             .filter(Boolean);

//         return [
//             ...new Set(names),
//         ].join(", ");
//     }


//     /* -------------------------------------------------------
//        OBJECT
//     ------------------------------------------------------- */

//     /*
//      * If the selected value itself is an object,
//      * use its human-readable name.
//      */

//     if (
//         typeof selectedValue === "object"
//     ) {
//         return getOptionDisplayName(
//             selectedValue
//         );
//     }


//     /* -------------------------------------------------------
//        STRING / NUMBER
//     ------------------------------------------------------- */

//     const selectedText = String(
//         selectedValue
//     ).trim();

//     if (
//         !selectedText ||
//         isEmptyOrAll(selectedText)
//     ) {
//         return "";
//     }


//     /*
//      * Find the selected ID/code in the
//      * corresponding filter options.
//      */

//     const matchedOption =
//         Array.isArray(options)
//             ? options.find((option) => {

//                 const optionId =
//                     String(
//                         getOptionId(
//                             option
//                         )
//                     ).trim();

//                 return (
//                     optionId ===
//                     selectedText
//                 );
//             })
//             : null;


//     if (matchedOption) {
//         return getOptionDisplayName(
//             matchedOption
//         );
//     }


//     /*
//      * If backend/filter already supplied
//      * a display value, keep it.
//      */

//     return selectedText;
// };


// /* =========================================================
//    GET SELECTED FILTER DISPLAY VALUE
// ========================================================= */

// const getSelectedFilterValue = (
//     activeFilters,
//     key,
//     aliases = []
// ) => {

//     /*
//      * First check the requested key.
//      */

//     const directValue =
//         activeFilters?.[key];

//     const directDisplay =
//         getFilterObjectDisplayValue(
//             directValue
//         );

//     if (directDisplay) {
//         return directDisplay;
//     }


//     /*
//      * Then check possible name/label fields.
//      *
//      * Example:
//      * legal_group
//      * legal_group_name
//      * legal_group_label
//      */

//     const possibleKeys = [
//         ...aliases,

//         `${key}_name`,
//         `${key}_label`,
//         `${key}_display_name`,
//         `${key}_displayName`,
//         `${key}Name`,
//         `${key}Label`,
//     ];


//     for (const possibleKey of possibleKeys) {

//         const value =
//             activeFilters?.[possibleKey];

//         const displayValue =
//             getFilterObjectDisplayValue(
//                 value
//             );

//         if (displayValue) {
//             return displayValue;
//         }
//     }


//     return null;
// };


// /* =========================================================
//    GET FILTER DISPLAY VALUE FROM OPTIONS
// ========================================================= */

// const getFilterDisplayValue = (
//     filters,
//     filterOptions,
//     filterKey
// ) => {

//     const selectedValue =
//         filters?.[filterKey];


//     if (isEmptyOrAll(selectedValue)) {
//         return "";
//     }


//     const optionMap = {

//         legal_group:
//             filterOptions?.legal_groups || [],

//         legal_entity:
//             filterOptions?.legal_entities || [],

//         parent_division:
//             filterOptions?.parent_divisions || [],

//         subdivision:
//             filterOptions?.subdivisions || [],

//         period:
//             filterOptions?.periods || [],

//         year:
//             filterOptions?.years ||
//             filterOptions?.fiscal_years ||
//             [],
//     };


//     return findFilterOptionName(
//         selectedValue,
//         optionMap[filterKey] || []
//     );
// };


// /* =========================================================
//    FILTER CHIP
// ========================================================= */

// const FilterChip = ({
//     label,
//     value,
// }) => {

//     const displayValue =
//         getFilterObjectDisplayValue(
//             value
//         );


//     /*
//      * Do not show:
//      * - null
//      * - undefined
//      * - empty
//      * - "-"
//      * - All
//      */

//     if (!displayValue) {
//         return null;
//     }


//     return (
//         <div className="finsight-detail-filter-chip">

//             <span className="finsight-detail-filter-chip-label">
//                 {label}:
//             </span>

//             <span>
//                 {displayValue}
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
//    ACTUAL VS TARGET TABLE
// ========================================================= */

// const ActualVsTargetTable = ({
//     rows,
//     currency,
// }) => {

//     const totalActual =
//         rows.reduce(
//             (sum, row) => {

//                 const value =
//                     getRowValue(
//                         row,
//                         [
//                             "actual_ptd_aed",
//                             "actual_ptd",
//                             "actual",
//                         ]
//                     );

//                 if (!hasValue(value)) {
//                     return sum;
//                 }

//                 const number =
//                     Number(value);

//                 return Number.isNaN(number)
//                     ? sum
//                     : sum + number;

//             },
//             0
//         );


//     const targetValuesExist =
//         rows.some(
//             (row) => {

//                 const value =
//                     getRowValue(
//                         row,
//                         [
//                             "target_ptd_aed",
//                             "target_ptd",
//                             "target",
//                         ]
//                     );

//                 return hasValue(value);
//             }
//         );


//     const totalTarget =
//         rows.reduce(
//             (sum, row) => {

//                 const value =
//                     getRowValue(
//                         row,
//                         [
//                             "target_ptd_aed",
//                             "target_ptd",
//                             "target",
//                         ]
//                     );

//                 if (!hasValue(value)) {
//                     return sum;
//                 }

//                 const number =
//                     Number(value);

//                 return Number.isNaN(number)
//                     ? sum
//                     : sum + number;

//             },
//             0
//         );


//     return (
//         <div className="finsight-detail-table-wrapper">

//             <table className="finsight-detail-table">

//                 <thead>
//                     <tr>

//                         <th className="text-left">
//                             Expense Category
//                         </th>

//                         <th className="text-right">
//                             Actual PTD ({currency})
//                         </th>

//                         <th className="text-right">
//                             Target PTD ({currency})
//                         </th>

//                     </tr>
//                 </thead>


//                 <tbody>

//                     {rows.map(
//                         (
//                             row,
//                             index
//                         ) => {

//                             const category =
//                                 getRowValue(
//                                     row,
//                                     [
//                                         "category",
//                                         "name",
//                                     ]
//                                 );


//                             const actual =
//                                 getRowValue(
//                                     row,
//                                     [
//                                         "actual_ptd_aed",
//                                         "actual_ptd",
//                                         "actual",
//                                     ]
//                                 );


//                             const target =
//                                 getRowValue(
//                                     row,
//                                     [
//                                         "target_ptd_aed",
//                                         "target_ptd",
//                                         "target",
//                                     ]
//                                 );


//                             return (
//                                 <tr
//                                     key={
//                                         `${category || "row"}-${index}`
//                                     }
//                                 >

//                                     <td>
//                                         {category || "—"}
//                                     </td>


//                                     <td className="text-right">
//                                         {hasValue(actual)
//                                             ? `${currency} ${formatAmount(actual)}`
//                                             : "—"}
//                                     </td>


//                                     <td className="text-right">
//                                         {hasValue(target)
//                                             ? `${currency} ${formatAmount(target)}`
//                                             : "—"}
//                                     </td>

//                                 </tr>
//                             );
//                         }
//                     )}

//                 </tbody>


//                 <tfoot>
//                     <tr>

//                         <td>
//                             Total
//                         </td>

//                         <td className="text-right">
//                             {currency}{" "}
//                             {formatAmount(totalActual)}
//                         </td>

//                         <td className="text-right">
//                             {targetValuesExist
//                                 ? `${currency} ${formatAmount(
//                                     totalTarget
//                                 )}`
//                                 : "—"}
//                         </td>

//                     </tr>
//                 </tfoot>

//             </table>

//         </div>
//     );
// };


// /* =========================================================
//    GENERIC TABLE
// ========================================================= */

// const GenericTable = ({
//     rows,
//     currency,
//     categoryLabel,
//     firstMetricLabel,
//     secondMetricLabel,
//     firstMetricType,
//     secondMetricType,
//     firstMetricKeys,
//     secondMetricKeys,
//     categoryKeys,
//     totalLabel,
// }) => {

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


//     const formatFirstMetric = (row) => {

//         const value =
//             getRowValue(
//                 row,
//                 firstMetricKeys
//             );


//         if (
//             firstMetricType ===
//             "amount"
//         ) {
//             return formatAmount(value);
//         }


//         if (
//             firstMetricType ===
//             "percentage"
//         ) {
//             return formatPercentage(value);
//         }


//         if (!hasValue(value)) {
//             return "—";
//         }


//         return value;
//     };


//     const formatSecondMetric = (row) => {

//         const value =
//             getRowValue(
//                 row,
//                 secondMetricKeys
//             );


//         if (
//             secondMetricType ===
//             "amount"
//         ) {
//             return formatAmount(value);
//         }


//         if (
//             secondMetricType ===
//             "percentage"
//         ) {
//             return formatPercentage(value);
//         }


//         if (!hasValue(value)) {
//             return "—";
//         }


//         return value;
//     };


//     return (
//         <div className="finsight-detail-table-wrapper">

//             <table className="finsight-detail-table">

//                 <thead>
//                     <tr>

//                         <th className="text-left">
//                             {categoryLabel}
//                         </th>

//                         <th className="text-right">

//                             {firstMetricLabel}

//                             {firstMetricType ===
//                                 "amount"
//                                 ? ` (${currency})`
//                                 : ""}

//                         </th>

//                         <th className="text-right">
//                             {secondMetricLabel}
//                         </th>

//                     </tr>
//                 </thead>


//                 <tbody>

//                     {rows.map(
//                         (
//                             row,
//                             index
//                         ) => {

//                             const category =
//                                 getRowValue(
//                                     row,
//                                     categoryKeys
//                                 );


//                             return (
//                                 <tr
//                                     key={
//                                         `${category || "row"}-${index}`
//                                     }
//                                 >

//                                     <td>
//                                         {category || "—"}
//                                     </td>

//                                     <td className="text-right">
//                                         {formatFirstMetric(
//                                             row
//                                         )}
//                                     </td>

//                                     <td className="text-right">
//                                         {formatSecondMetric(
//                                             row
//                                         )}
//                                     </td>

//                                 </tr>
//                             );
//                         }
//                     )}

//                 </tbody>


//                 <tfoot>
//                     <tr>

//                         <td>
//                             {totalLabel}
//                         </td>


//                         <td className="text-right">

//                             {currency}{" "}

//                             {formatAmount(
//                                 totalAmount
//                             )}

//                         </td>


//                         <td className="text-right">

//                             {formatPercentage(
//                                 totalPercentage
//                             )}

//                         </td>

//                     </tr>
//                 </tfoot>

//             </table>

//         </div>
//     );
// };


// /* =========================================================
//    MAIN COMPONENT
// ========================================================= */

// export default function OperatingAnalysisViewAllModal({

//     open,

//     onClose,

//     data = [],

//     loading = false,

//     activeFilters = {},

//     /*
//      * IMPORTANT:
//      * filterOptions contains the human-readable
//      * names corresponding to active filter IDs.
//      *
//      * This is display-only and does not modify
//      * activeFilters or API filters.
//      */
//     filterOptions = {},

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


//     /* =====================================================
//        VIEW TYPE
//     ===================================================== */

//     viewAllType = "",

// }) {

//     /* =====================================================
//        ALL HOOKS MUST BE BEFORE EARLY RETURN
//     ===================================================== */

//     const [searchTerm, setSearchTerm] =
//         useState("");


//     /* =====================================================
//        NORMALIZE DATA
//     ===================================================== */

//     const rows =
//         Array.isArray(data)
//             ? data
//             : Array.isArray(data?.items)
//                 ? data.items
//                 : Array.isArray(data?.data)
//                     ? data.data
//                     : Array.isArray(data?.results)
//                         ? data.results
//                         : [];


//     /* =====================================================
//        SEARCH FILTER
//     ===================================================== */

//     const filteredRows =
//         useMemo(() => {

//             const search =
//                 searchTerm
//                     .trim()
//                     .toLowerCase();


//             if (!search) {
//                 return rows;
//             }


//             return rows.filter((row) => {

//                 if (!row) {
//                     return false;
//                 }


//                 return Object.values(row).some(
//                     (value) =>
//                         String(value ?? "")
//                             .toLowerCase()
//                             .includes(search)
//                 );

//             });

//         }, [rows, searchTerm]);


//     /* =====================================================
//        CURRENCY
//     ===================================================== */

//     const currency =
//         rows?.[0]?.reporting_currency ||
//         activeFilters?.reporting_currency ||
//         reportingCurrency ||
//         "AED";


//     /* =====================================================
//        VIEW TYPE
//     ===================================================== */

//     const isActualVsTarget =
//         viewAllType ===
//         "actual-vs-target";


//     const isExpenseCategory =
//         viewAllType ===
//         "expense-category";


//     /* =====================================================
//        GENERIC TOTAL
//     ===================================================== */

//     const genericTotalAmount =
//         filteredRows.reduce(
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
//        ACTUAL VS TARGET TOTAL
//     ===================================================== */

//     const actualVsTargetTotal =
//         filteredRows.reduce(
//             (sum, row) => {

//                 const value =
//                     getRowValue(
//                         row,
//                         [
//                             "actual_ptd_aed",
//                             "actual_ptd",
//                             "actual",
//                         ]
//                     );


//                 if (!hasValue(value)) {
//                     return sum;
//                 }


//                 const number =
//                     Number(value);


//                 return Number.isNaN(number)
//                     ? sum
//                     : sum + number;

//             },
//             0
//         );


//     const summaryTotal =
//         isActualVsTarget
//             ? actualVsTargetTotal
//             : genericTotalAmount;


//     /* =====================================================
//        GENERIC TOTAL PERCENTAGE
//     ===================================================== */

//     const totalPercentage =
//         filteredRows.reduce(
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
//        FILTER DISPLAY VALUES

//        IMPORTANT:
//        These values are ONLY for displaying the selected
//        filter names in the chips.

//        They do NOT modify API/data filtering.
//     ===================================================== */

//     const selectedYear =
//         getFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "year"
//         );


//     const selectedPeriod =
//         getFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "period"
//         );


//     const selectedCurrency =
//         currency;


//     const selectedLegalGroup =
//         getFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "legal_group"
//         );


//     const selectedLegalEntity =
//         getFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "legal_entity"
//         );


//     const selectedParentDivision =
//         getFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "parent_division"
//         );


//     const selectedSubdivision =
//         getFilterDisplayValue(
//             activeFilters,
//             filterOptions,
//             "subdivision"
//         );


//     /* =====================================================
//        EXCEL EXPORT
//     ===================================================== */

//     const exportToExcel = () => {

//         if (!filteredRows.length) {
//             return;
//         }


//         let headers = [];
//         let tableRows = [];


//         if (isActualVsTarget) {

//             headers = [
//                 "Expense Category",
//                 `Actual PTD (${currency})`,
//                 `Target PTD (${currency})`,
//             ];


//             tableRows =
//                 filteredRows.map((row) => {

//                     const category =
//                         getRowValue(
//                             row,
//                             [
//                                 "category",
//                                 "name",
//                             ]
//                         );


//                     const actual =
//                         getRowValue(
//                             row,
//                             [
//                                 "actual_ptd_aed",
//                                 "actual_ptd",
//                                 "actual",
//                             ]
//                         );


//                     const target =
//                         getRowValue(
//                             row,
//                             [
//                                 "target_ptd_aed",
//                                 "target_ptd",
//                                 "target",
//                             ]
//                         );


//                     return [
//                         category || "—",

//                         hasValue(actual)
//                             ? `${currency} ${formatAmount(actual)}`
//                             : "—",

//                         hasValue(target)
//                             ? `${currency} ${formatAmount(target)}`
//                             : "—",
//                     ];
//                 });


//             tableRows.push([
//                 "Total",
//                 `${currency} ${formatAmount(
//                     actualVsTargetTotal
//                 )}`,
//                 "",
//             ]);

//         } else {

//             headers = [
//                 categoryLabel,

//                 `${firstMetricLabel}${
//                     firstMetricType === "amount"
//                         ? ` (${currency})`
//                         : ""
//                 }`,

//                 secondMetricLabel,
//             ];


//             tableRows =
//                 filteredRows.map((row) => {

//                     const category =
//                         getRowValue(
//                             row,
//                             categoryKeys
//                         );


//                     const firstValue =
//                         getRowValue(
//                             row,
//                             firstMetricKeys
//                         );


//                     const secondValue =
//                         getRowValue(
//                             row,
//                             secondMetricKeys
//                         );


//                     let formattedFirst = "—";
//                     let formattedSecond = "—";


//                     if (
//                         firstMetricType ===
//                         "amount"
//                     ) {

//                         formattedFirst =
//                             formatAmount(
//                                 firstValue
//                             );

//                     } else if (
//                         firstMetricType ===
//                         "percentage"
//                     ) {

//                         formattedFirst =
//                             formatPercentage(
//                                 firstValue
//                             );

//                     } else if (
//                         hasValue(firstValue)
//                     ) {

//                         formattedFirst =
//                             firstValue;
//                     }


//                     if (
//                         secondMetricType ===
//                         "amount"
//                     ) {

//                         formattedSecond =
//                             formatAmount(
//                                 secondValue
//                             );

//                     } else if (
//                         secondMetricType ===
//                         "percentage"
//                     ) {

//                         formattedSecond =
//                             formatPercentage(
//                                 secondValue
//                             );

//                     } else if (
//                         hasValue(secondValue)
//                     ) {

//                         formattedSecond =
//                             secondValue;
//                     }


//                     return [
//                         category || "—",

//                         firstMetricType ===
//                             "amount"
//                             ? `${currency} ${formattedFirst}`
//                             : formattedFirst,

//                         formattedSecond,
//                     ];
//                 });


//             tableRows.push([
//                 totalLabel,

//                 `${currency} ${formatAmount(
//                     genericTotalAmount
//                 )}`,

//                 formatPercentage(
//                     totalPercentage
//                 ),
//             ]);
//         }


//         const escapeExcelValue = (value) => {

//             const stringValue =
//                 String(value ?? "");


//             return `"${stringValue.replace(
//                 /"/g,
//                 '""'
//             )}"`;
//         };


//         const excelContent = [

//             headers
//                 .map(escapeExcelValue)
//                 .join("\t"),

//             ...tableRows.map(
//                 (row) =>
//                     row
//                         .map(escapeExcelValue)
//                         .join("\t")
//             ),

//         ].join("\n");


//         const blob =
//             new Blob(
//                 [
//                     "\uFEFF" +
//                     excelContent,
//                 ],
//                 {
//                     type:
//                         "application/vnd.ms-excel;charset=utf-8;",
//                 }
//             );


//         const url =
//             URL.createObjectURL(blob);


//         const link =
//             document.createElement("a");


//         link.href = url;


//         link.download =
//             `${title
//                 .replace(/[^a-z0-9]/gi, "_")
//                 .toLowerCase()}_details.xls`;


//         document.body.appendChild(link);


//         link.click();


//         document.body.removeChild(link);


//         URL.revokeObjectURL(url);
//     };


//     /* =====================================================
//        PDF EXPORT
//     ===================================================== */

//     const exportToPDF = () => {

//         if (!filteredRows.length) {
//             return;
//         }


//         const printWindow =
//             window.open(
//                 "",
//                 "_blank",
//                 "width=1200,height=800"
//             );


//         if (!printWindow) {
//             return;
//         }


//         const escapeHTML = (value) => {

//             return String(value ?? "")
//                 .replace(/&/g, "&amp;")
//                 .replace(/</g, "&lt;")
//                 .replace(/>/g, "&gt;")
//                 .replace(/"/g, "&quot;")
//                 .replace(/'/g, "&#039;");
//         };


//         let headers = [];
//         let tableRows = [];


//         if (isActualVsTarget) {

//             headers = [
//                 "Expense Category",
//                 `Actual PTD (${currency})`,
//                 `Target PTD (${currency})`,
//             ];


//             tableRows =
//                 filteredRows.map((row) => {

//                     const category =
//                         getRowValue(
//                             row,
//                             [
//                                 "category",
//                                 "name",
//                             ]
//                         );


//                     const actual =
//                         getRowValue(
//                             row,
//                             [
//                                 "actual_ptd_aed",
//                                 "actual_ptd",
//                                 "actual",
//                             ]
//                         );


//                     const target =
//                         getRowValue(
//                             row,
//                             [
//                                 "target_ptd_aed",
//                                 "target_ptd",
//                                 "target",
//                             ]
//                         );


//                     return [
//                         category || "—",

//                         hasValue(actual)
//                             ? `${currency} ${formatAmount(actual)}`
//                             : "—",

//                         hasValue(target)
//                             ? `${currency} ${formatAmount(target)}`
//                             : "—",
//                     ];
//                 });


//             tableRows.push([
//                 "Total",

//                 `${currency} ${formatAmount(
//                     actualVsTargetTotal
//                 )}`,

//                 "",
//             ]);

//         } else {

//             headers = [
//                 categoryLabel,

//                 `${firstMetricLabel}${
//                     firstMetricType === "amount"
//                         ? ` (${currency})`
//                         : ""
//                 }`,

//                 secondMetricLabel,
//             ];


//             tableRows =
//                 filteredRows.map((row) => {

//                     const category =
//                         getRowValue(
//                             row,
//                             categoryKeys
//                         );


//                     const firstValue =
//                         getRowValue(
//                             row,
//                             firstMetricKeys
//                         );


//                     const secondValue =
//                         getRowValue(
//                             row,
//                             secondMetricKeys
//                         );


//                     let formattedFirst = "—";
//                     let formattedSecond = "—";


//                     if (
//                         firstMetricType ===
//                         "amount"
//                     ) {

//                         formattedFirst =
//                             `${currency} ${formatAmount(
//                                 firstValue
//                             )}`;

//                     } else if (
//                         firstMetricType ===
//                         "percentage"
//                     ) {

//                         formattedFirst =
//                             formatPercentage(
//                                 firstValue
//                             );

//                     } else if (
//                         hasValue(firstValue)
//                     ) {

//                         formattedFirst =
//                             firstValue;
//                     }


//                     if (
//                         secondMetricType ===
//                         "amount"
//                     ) {

//                         formattedSecond =
//                             `${currency} ${formatAmount(
//                                 secondValue
//                             )}`;

//                     } else if (
//                         secondMetricType ===
//                         "percentage"
//                     ) {

//                         formattedSecond =
//                             formatPercentage(
//                                 secondValue
//                             );

//                     } else if (
//                         hasValue(secondValue)
//                     ) {

//                         formattedSecond =
//                             secondValue;
//                     }


//                     return [
//                         category || "—",
//                         formattedFirst,
//                         formattedSecond,
//                     ];
//                 });


//             tableRows.push([
//                 totalLabel,

//                 `${currency} ${formatAmount(
//                     genericTotalAmount
//                 )}`,

//                 formatPercentage(
//                     totalPercentage
//                 ),
//             ]);
//         }


//         /*
//          * IMPORTANT:
//          * PDF also uses DISPLAY NAMES instead of
//          * internal filter IDs/codes.
//          */

//         const filterEntries = [

//             ["Year", selectedYear],

//             ["Period", selectedPeriod],

//             ["Currency", selectedCurrency],

//             ["Legal Group", selectedLegalGroup],

//             ["Legal Entity", selectedLegalEntity],

//             ["Parent Division", selectedParentDivision],

//             ["Subdivision", selectedSubdivision],

//         ].filter(
//             ([, value]) =>
//                 value !== null &&
//                 value !== undefined &&
//                 value !== ""
//         );


//         const filterHTML =
//             filterEntries
//                 .map(
//                     ([label, value]) =>
//                         `<span class="filter">
//                             <strong>${escapeHTML(label)}:</strong>
//                             ${escapeHTML(value)}
//                         </span>`
//                 )
//                 .join("");


//         const headerHTML =
//             headers
//                 .map(
//                     (header) =>
//                         `<th>${escapeHTML(header)}</th>`
//                 )
//                 .join("");


//         const bodyHTML =
//             tableRows
//                 .map(
//                     (row, index) => {

//                         const isTotal =
//                             index ===
//                             tableRows.length - 1;


//                         return `
//                             <tr class="${
//                                 isTotal
//                                     ? "total"
//                                     : ""
//                             }">
//                                 ${row
//                                     .map(
//                                         (cell) =>
//                                             `<td>${escapeHTML(
//                                                 cell
//                                             )}</td>`
//                                     )
//                                     .join("")}
//                             </tr>
//                         `;
//                     }
//                 )
//                 .join("");


//         printWindow.document.write(`
//             <!DOCTYPE html>
//             <html>
//             <head>

//                 <title>
//                     ${escapeHTML(title)}
//                 </title>

//                 <style>

//                     * {
//                         box-sizing: border-box;
//                     }

//                     body {
//                         margin: 0;
//                         padding: 30px;
//                         font-family:
//                             Arial,
//                             Helvetica,
//                             sans-serif;
//                         color: #334155;
//                         background: #ffffff;
//                     }

//                     h1 {
//                         margin: 0;
//                         color: #102a43;
//                         font-size: 20px;
//                         font-weight: 700;
//                     }

//                     .subtitle {
//                         margin-top: 5px;
//                         color: #64748b;
//                         font-size: 12px;
//                     }

//                     .filters {
//                         display: flex;
//                         flex-wrap: wrap;
//                         gap: 7px;
//                         margin-top: 18px;
//                         margin-bottom: 18px;
//                     }

//                     .filter {
//                         padding: 6px 9px;
//                         border: 1px solid #d9e2eb;
//                         border-radius: 5px;
//                         background: #f8fafc;
//                         font-size: 10px;
//                         color: #475569;
//                     }

//                     table {
//                         width: 100%;
//                         border-collapse: collapse;
//                         margin-top: 10px;
//                     }

//                     th {
//                         padding: 9px;
//                         text-align: left;
//                         background: #f1f5f9;
//                         color: #123a69;
//                         border: 1px solid #cbd7e4;
//                         font-size: 10px;
//                         font-weight: 700;
//                         text-transform: uppercase;
//                     }

//                     td {
//                         padding: 8px 9px;
//                         border: 1px solid #e2e8f0;
//                         font-size: 11px;
//                     }

//                     td:not(:first-child),
//                     th:not(:first-child) {
//                         text-align: right;
//                     }

//                     tr:nth-child(even) td {
//                         background: #f8fafc;
//                     }

//                     tr.total td {
//                         background: #f3f6f9;
//                         font-weight: 700;
//                         border-top: 2px solid #cbd5e1;
//                     }

//                     .record-count {
//                         margin-top: 10px;
//                         color: #64748b;
//                         font-size: 10px;
//                     }

//                     @media print {

//                         body {
//                             padding: 15px;
//                         }

//                     }

//                 </style>

//             </head>

//             <body>

//                 <h1>
//                     ${escapeHTML(title)}
//                 </h1>

//                 ${
//                     subtitle
//                         ? `<div class="subtitle">
//                             ${escapeHTML(subtitle)}
//                            </div>`
//                         : ""
//                 }

//                 ${
//                     filterHTML
//                         ? `<div class="filters">
//                             ${filterHTML}
//                            </div>`
//                         : ""
//                 }

//                 <div class="record-count">
//                     ${filteredRows.length}
//                     ${
//                         filteredRows.length === 1
//                             ? "record"
//                             : "records"
//                     }
//                 </div>

//                 <table>

//                     <thead>
//                         <tr>
//                             ${headerHTML}
//                         </tr>
//                     </thead>

//                     <tbody>
//                         ${bodyHTML}
//                     </tbody>

//                 </table>

//             </body>
//             </html>
//         `);


//         printWindow.document.close();

//         printWindow.focus();


//         setTimeout(() => {

//             printWindow.print();

//             printWindow.close();

//         }, 300);
//     };


//     /* =====================================================
//        COMMON EXPORT BUTTON HANDLER
       
//        Uses the existing Excel/PDF export logic above.
//     ===================================================== */

//     const handleCommonExport = (type) => {

//         if (loading || !filteredRows.length) {
//             return;
//         }

//         if (type === "excel") {
//             exportToExcel();
//             return;
//         }

//         if (type === "pdf") {
//             exportToPDF();
//         }
//     };


//     /* =====================================================
//        EARLY RETURN
//     ===================================================== */

//     if (!open) {
//         return null;
//     }


//     /* =====================================================
//        MODAL
//     ===================================================== */

//     return (
//         <>
//             <style>{`

//                 .finsight-detail-backdrop {
//                     position: fixed;
//                     inset: 0;
//                     z-index: 1000;
//                     background:
//                         rgba(15, 23, 42, 0.42);
//                     backdrop-filter:
//                         blur(5px);
//                     -webkit-backdrop-filter:
//                         blur(5px);
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     padding: 28px;
//                     box-sizing: border-box;
//                 }


//                 .finsight-detail-modal {
//                     width: 100%;
//                     max-width: 1520px;
//                     height:
//                         min(82vh, 730px);
//                     min-height: 520px;
//                     background: #ffffff;
//                     border-radius: 14px;
//                     overflow: hidden;
//                     display: flex;
//                     flex-direction: column;
//                     box-sizing: border-box;
//                     border:
//                         1px solid #e1e7ee;
//                     box-shadow:
//                         0 24px 60px
//                         rgba(15, 23, 42, 0.24);
//                 }


//                 .finsight-detail-header {
//                     min-height: 68px;
//                     padding:
//                         14px 20px 13px;
//                     box-sizing: border-box;
//                     display: flex;
//                     align-items: flex-start;
//                     justify-content: space-between;
//                     gap: 20px;
//                     border-bottom:
//                         1px solid #e7edf3;
//                     flex-shrink: 0;
//                 }


//                 .finsight-detail-title {
//                     color: #102a43;
//                     font-size: 15px;
//                     line-height: 20px;
//                     font-weight: 700;
//                     letter-spacing:
//                         -0.05px;
//                 }


//                 .finsight-detail-subtitle {
//                     margin-top: 2px;
//                     color: #55708d;
//                     font-size: 11px;
//                     line-height: 16px;
//                 }


//                 .finsight-detail-close {
//                     width: 30px;
//                     height: 30px;
//                     padding: 0;
//                     border: 0;
//                     background:
//                         transparent;
//                     color: #718096;
//                     border-radius: 6px;
//                     cursor: pointer;
//                     font-size: 22px;
//                     line-height: 30px;
//                     font-weight: 300;
//                     display: inline-flex;
//                     align-items: center;
//                     justify-content: center;
//                     flex-shrink: 0;
//                     transition:
//                         background 0.15s ease,
//                         color 0.15s ease;
//                 }


//                 .finsight-detail-close:hover {
//                     background:
//                         #f1f5f9;
//                     color:
//                         #334155;
//                 }


//                 .finsight-detail-toolbar {
//                     min-height: 54px;
//                     padding:
//                         9px 20px;
//                     box-sizing: border-box;
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                     gap: 12px;
//                     flex-wrap: wrap;
//                     background:
//                         #f8fafc;
//                     border-bottom:
//                         1px solid #e5ebf2;
//                     flex-shrink: 0;
//                 }


//                 .finsight-detail-toolbar-left {
//                     display: flex;
//                     align-items: center;
//                     flex-wrap: wrap;
//                     gap: 5px;
//                     min-width: 0;
//                     flex: 1 1 auto;
//                 }


//                 .finsight-detail-filters {
//                     display: flex;
//                     align-items: center;
//                     flex-wrap: wrap;
//                     gap: 5px;
//                     min-width: 0;
//                 }


//                 .finsight-detail-filter-chip {
//                     min-height: 32px;
//                     padding:
//                         0 10px;
//                     box-sizing: border-box;
//                     display: inline-flex;
//                     align-items: center;
//                     gap: 5px;
//                     white-space: nowrap;
//                     background:
//                         #ffffff;
//                     border:
//                         1px solid #d9e2eb;
//                     border-radius:
//                         6px;
//                     color:
//                         #475569;
//                     font-size:
//                         11px;
//                     line-height:
//                         16px;
//                 }


//                 .finsight-detail-filter-chip-label {
//                     color:
//                         #64748b;
//                     font-weight:
//                         600;
//                 }


//                 .finsight-detail-toolbar-right {
//                     display: flex;
//                     align-items: center;
//                     justify-content: flex-end;
//                     gap: 6px;
//                     flex-shrink: 0;
//                 }


//                 .finsight-detail-search {
//                     position: relative;
//                     width: 190px;
//                     height: 32px;
//                     flex-shrink: 0;
//                 }


//                 .finsight-detail-search-icon {
//                     position: absolute;
//                     left: 9px;
//                     top: 50%;
//                     transform:
//                         translateY(-50%);
//                     color:
//                         #94a3b8;
//                     font-size: 14px;
//                     line-height: 1;
//                     pointer-events: none;
//                 }


//                 .finsight-detail-search-input {
//                     width: 100%;
//                     height: 32px;
//                     padding:
//                         0 10px 0 29px;
//                     border:
//                         1px solid #d5dee8;
//                     border-radius:
//                         6px;
//                     outline: none;
//                     background:
//                         #ffffff;
//                     color:
//                         #334155;
//                     font-size:
//                         11px;
//                     box-sizing:
//                         border-box;
//                     transition:
//                         border-color 0.15s ease,
//                         box-shadow 0.15s ease;
//                 }


//                 .finsight-detail-search-input::placeholder {
//                     color:
//                         #94a3b8;
//                 }


//                 .finsight-detail-search-input:focus {
//                     border-color:
//                         #9db7d2;
//                     box-shadow:
//                         0 0 0 2px
//                         rgba(59, 130, 246, 0.08);
//                 }


//                 .finsight-detail-export-button {
//                     height: 32px;
//                     padding:
//                         0 10px;
//                     display: inline-flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 5px;
//                     border:
//                         1px solid #d5dee8;
//                     border-radius:
//                         6px;
//                     background:
//                         #ffffff;
//                     color:
//                         #475569;
//                     font-size:
//                         11px;
//                     line-height:
//                         16px;
//                     font-weight:
//                         600;
//                     cursor:
//                         pointer;
//                     white-space:
//                         nowrap;
//                     transition:
//                         background 0.15s ease,
//                         border-color 0.15s ease,
//                         color 0.15s ease;
//                 }


//                 .finsight-detail-export-button:hover {
//                     background:
//                         #f1f5f9;
//                     border-color:
//                         #c5d1dd;
//                     color:
//                         #26384d;
//                 }


//                 .finsight-detail-export-button:disabled {
//                     opacity:
//                         0.45;
//                     cursor:
//                         not-allowed;
//                 }


//                 .finsight-detail-export-icon {
//                     font-size:
//                         13px;
//                     line-height:
//                         1;
//                 }


//                 .finsight-detail-records {
//                     margin-left: 3px;
//                     white-space: nowrap;
//                     color:
//                         #8aa0b7;
//                     font-size:
//                         11px;
//                 }


//                 .finsight-detail-content {
//                     flex: 1;
//                     min-height: 0;
//                     overflow: hidden;
//                     padding:
//                         0 16px 8px;
//                     background:
//                         #ffffff;
//                     box-sizing:
//                         border-box;
//                 }


//                 .finsight-detail-table-scroll {
//                     width: 100%;
//                     height: 100%;
//                     overflow:
//                         auto;
//                     scrollbar-width:
//                         thin;
//                     scrollbar-color:
//                         #cbd5e1 transparent;
//                 }


//                 .finsight-detail-table-scroll::-webkit-scrollbar {
//                     width: 8px;
//                     height: 8px;
//                 }


//                 .finsight-detail-table-scroll::-webkit-scrollbar-track {
//                     background:
//                         transparent;
//                 }


//                 .finsight-detail-table-scroll::-webkit-scrollbar-thumb {
//                     background:
//                         #cbd5e1;
//                     border-radius:
//                         8px;
//                 }


//                 .finsight-detail-table-scroll::-webkit-scrollbar-thumb:hover {
//                     background:
//                         #94a3b8;
//                 }


//                 .finsight-detail-table-wrapper {
//                     width: 100%;
//                     min-width: 100%;
//                     overflow: hidden;
//                     border:
//                         1px solid #dce4ec;
//                     border-top: 0;
//                     box-sizing: border-box;
//                 }


//                 .finsight-detail-table {
//                     width: 100%;
//                     min-width: 720px;
//                     border-collapse:
//                         separate;
//                     border-spacing: 0;
//                     font-family:
//                         inherit;
//                     table-layout:
//                         auto;
//                 }


//                 .finsight-detail-table thead th {
//                     position: sticky;
//                     top: 0;
//                     z-index: 3;
//                     padding:
//                         10px 9px;
//                     background:
//                         #f1f5f9;
//                     color:
//                         #123a69;
//                     border-bottom:
//                         1px solid #cbd7e4;
//                     border-right:
//                         1px solid #d5dee8;
//                     font-size:
//                         11px;
//                     line-height:
//                         16px;
//                     font-weight:
//                         700;
//                     letter-spacing:
//                         0.35px;
//                     text-transform:
//                         uppercase;
//                     white-space:
//                         nowrap;
//                     box-sizing:
//                         border-box;
//                 }


//                 .finsight-detail-table thead th:first-child {
//                     padding-left:
//                         9px;
//                 }


//                 .finsight-detail-table thead th:last-child {
//                     border-right:
//                         0;
//                 }


//                 .finsight-detail-table tbody td {
//                     padding:
//                         8px 9px;
//                     color:
//                         #334155;
//                     border-bottom:
//                         1px solid #edf1f5;
//                     border-right:
//                         1px solid #edf1f5;
//                     font-size:
//                         12px;
//                     line-height:
//                         17px;
//                     white-space:
//                         nowrap;
//                     box-sizing:
//                         border-box;
//                 }


//                 .finsight-detail-table tbody tr:nth-child(even) td {
//                     background:
//                         #f8fafc;
//                 }


//                 .finsight-detail-table tbody tr:hover td {
//                     background:
//                         #f2f6fa;
//                 }


//                 .finsight-detail-table tbody td:first-child {
//                     color:
//                         #26384d;
//                     font-weight:
//                         600;
//                 }


//                 .finsight-detail-table tbody td:last-child {
//                     border-right:
//                         0;
//                 }


//                 .finsight-detail-table tfoot td {
//                     position: sticky;
//                     bottom: 0;
//                     z-index: 2;
//                     padding:
//                         9px;
//                     background:
//                         #f3f6f9;
//                     color:
//                         #1e2f43;
//                     border-top:
//                         1px solid #d3dde7;
//                     border-right:
//                         1px solid #dfe6ed;
//                     font-size:
//                         12px;
//                     line-height:
//                         17px;
//                     font-weight:
//                         700;
//                     white-space:
//                         nowrap;
//                     box-sizing:
//                         border-box;
//                 }


//                 .finsight-detail-table tfoot td:last-child {
//                     border-right:
//                         0;
//                 }


//                 .finsight-detail-table .text-left {
//                     text-align:
//                         left;
//                 }


//                 .finsight-detail-table .text-right {
//                     text-align:
//                         right;
//                 }


//                 .finsight-detail-loading {
//                     min-height:
//                         280px;
//                     height:
//                         100%;
//                     display:
//                         flex;
//                     align-items:
//                         center;
//                     justify-content:
//                         center;
//                     color:
//                         #64748b;
//                     font-size:
//                         13px;
//                 }


//                 .finsight-detail-empty {
//                     min-height:
//                         280px;
//                     height:
//                         100%;
//                     display:
//                         flex;
//                     flex-direction:
//                         column;
//                     align-items:
//                         center;
//                     justify-content:
//                         center;
//                     color:
//                         #64748b;
//                     text-align:
//                         center;
//                 }


//                 .finsight-detail-empty-title {
//                     color:
//                         #334155;
//                     font-size:
//                         14px;
//                     font-weight:
//                         600;
//                 }


//                 .finsight-detail-empty-message {
//                     margin-top:
//                         5px;
//                     font-size:
//                         12px;
//                 }


//                 .finsight-detail-footer {
//                     min-height:
//                         64px;
//                     padding:
//                         12px 20px;
//                     box-sizing:
//                         border-box;
//                     display:
//                         flex;
//                     align-items:
//                         center;
//                     justify-content:
//                         flex-end;
//                     background:
//                         #ffffff;
//                     border-top:
//                         1px solid #e5ebf2;
//                     flex-shrink:
//                         0;
//                 }


//                 .finsight-detail-footer-button {
//                     min-width:
//                         70px;
//                     height:
//                         31px;
//                     padding:
//                         0 16px;
//                     border:
//                         1px solid #d4dce5;
//                     border-radius:
//                         7px;
//                     background:
//                         #f1f5f9;
//                     color:
//                         #41566d;
//                     font-size:
//                         12px;
//                     font-weight:
//                         600;
//                     cursor:
//                         pointer;
//                     transition:
//                         background 0.15s ease;
//                 }


//                 .finsight-detail-footer-button:hover {
//                     background:
//                         #e8eef5;
//                 }


//                 @media (max-width: 1100px) {

//                     .finsight-detail-toolbar {
//                         align-items:
//                             flex-start;
//                     }

//                     .finsight-detail-toolbar-right {
//                         width:
//                             100%;
//                         justify-content:
//                             flex-start;
//                     }

//                     .finsight-detail-records {
//                         margin-left:
//                             auto;
//                     }

//                 }


//                 @media (max-width: 900px) {

//                     .finsight-detail-backdrop {
//                         padding:
//                             14px;
//                     }

//                     .finsight-detail-modal {
//                         height:
//                             calc(100vh - 28px);
//                         min-height:
//                             420px;
//                         border-radius:
//                             10px;
//                     }

//                     .finsight-detail-toolbar {
//                         align-items:
//                             flex-start;
//                     }

//                     .finsight-detail-toolbar-left {
//                         width:
//                             100%;
//                     }

//                     .finsight-detail-toolbar-right {
//                         width:
//                             100%;
//                         justify-content:
//                             flex-start;
//                     }

//                     .finsight-detail-search {
//                         flex:
//                             1 1 180px;
//                     }

//                     .finsight-detail-records {
//                         margin-left:
//                             3px;
//                     }

//                 }


//                 @media (max-width: 600px) {

//                     .finsight-detail-search {
//                         width:
//                             100%;
//                     }

//                     .finsight-detail-export-button {
//                         flex:
//                             1 1 auto;
//                     }

//                 }

//             `}</style>


//             {/* =====================================================
//                 BACKDROP
//             ===================================================== */}

//             <div
//                 className="finsight-detail-backdrop"
//                 onClick={(event) => {

//                     if (
//                         event.target ===
//                         event.currentTarget
//                     ) {
//                         onClose();
//                     }

//                 }}
//             >


//                 {/* =================================================
//                     MODAL
//                 ================================================= */}

//                 <div className="finsight-detail-modal">


//                     {/* =================================================
//                         HEADER
//                     ================================================= */}

//                     <div className="finsight-detail-header">

//                         <div>

//                             <div className="finsight-detail-title">
//                                 {title}
//                             </div>


//                             {subtitle && (
//                                 <div className="finsight-detail-subtitle">
//                                     {subtitle}
//                                 </div>
//                             )}

//                         </div>


//                         <button
//                             type="button"
//                             className="finsight-detail-close"
//                             onClick={onClose}
//                             aria-label="Close"
//                         >
//                             ×
//                         </button>

//                     </div>


//                     {/* =================================================
//                         FILTER / ACTION BAR
//                     ================================================= */}

//                     <div className="finsight-detail-toolbar">


//                         {/* =================================================
//                             SELECTED FILTERS ONLY
//                         ================================================= */}

//                         <div className="finsight-detail-toolbar-left">

//                             <div className="finsight-detail-filters">


//                                 {/* =================================================
//                                     YEAR
//                                 ================================================= */}

//                                 <FilterChip
//                                     label="Year"
//                                     value={
//                                         selectedYear
//                                     }
//                                 />


//                                 {/* =================================================
//                                     PERIOD
//                                 ================================================= */}

//                                 <FilterChip
//                                     label="Period"
//                                     value={
//                                         selectedPeriod
//                                     }
//                                 />


//                                 {/* =================================================
//                                     CURRENCY
//                                 ================================================= */}

//                                 <FilterChip
//                                     label="Currency"
//                                     value={
//                                         selectedCurrency
//                                     }
//                                 />


//                                 {/* =================================================
//                                     LEGAL GROUP
//                                 ================================================= */}

//                                 <FilterChip
//                                     label="Legal Group"
//                                     value={
//                                         selectedLegalGroup
//                                     }
//                                 />


//                                 {/* =================================================
//                                     LEGAL ENTITY
//                                 ================================================= */}

//                                 <FilterChip
//                                     label="Legal Entity"
//                                     value={
//                                         selectedLegalEntity
//                                     }
//                                 />


//                                 {/* =================================================
//                                     PARENT DIVISION
//                                 ================================================= */}

//                                 <FilterChip
//                                     label="Parent Division"
//                                     value={
//                                         selectedParentDivision
//                                     }
//                                 />


//                                 {/* =================================================
//                                     SUBDIVISION
//                                 ================================================= */}

//                                 <FilterChip
//                                     label="Subdivision"
//                                     value={
//                                         selectedSubdivision
//                                     }
//                                 />

//                             </div>

//                         </div>


//                         {/* =================================================
//                             RIGHT SIDE
//                         ================================================= */}

//                         <div className="finsight-detail-toolbar-right">


//                             {/* =================================================
//                                 SEARCH
//                             ================================================= */}

//                             <div className="finsight-detail-search">

//                                 <span
//                                     className="finsight-detail-search-icon"
//                                     aria-hidden="true"
//                                 >
//                                     🔍
//                                 </span>


//                                 <input
//                                     type="text"
//                                     className="finsight-detail-search-input"
//                                     value={searchTerm}
//                                     onChange={(event) =>
//                                         setSearchTerm(
//                                             event.target.value
//                                         )
//                                     }
//                                     placeholder="Search..."
//                                     aria-label="Search detailed data"
//                                 />

//                             </div>


//                             {/* =================================================
//                                 COMMON EXPORT BUTTONS
//                             ================================================= */}

//                             <ExportButtons
//                                 endpoint="operating-analysis-view-all"
//                                 exporting={
//                                     loading || !filteredRows.length
//                                         ? "disabled"
//                                         : false
//                                 }
//                                 handleExport={
//                                     handleCommonExport
//                                 }
//                             />


//                             {/* =================================================
//                                 RECORD COUNT
//                             ================================================= */}

//                             <div className="finsight-detail-records">

//                                 {filteredRows.length}{" "}

//                                 {filteredRows.length === 1
//                                     ? "record"
//                                     : "records"}

//                             </div>

//                         </div>

//                     </div>


//                     {/* =================================================
//                         CONTENT
//                     ================================================= */}

//                     <div className="finsight-detail-content">

//                         {loading ? (

//                             <div className="finsight-detail-loading">
//                                 Loading detailed data...
//                             </div>

//                         ) : filteredRows.length === 0 ? (

//                             <div className="finsight-detail-empty">

//                                 <div className="finsight-detail-empty-title">

//                                     {searchTerm.trim()
//                                         ? "No matching records"
//                                         : "No data available"}

//                                 </div>


//                                 <div className="finsight-detail-empty-message">

//                                     {searchTerm.trim()
//                                         ? "Try changing your search."
//                                         : "Try changing the selected filters."}

//                                 </div>

//                             </div>

//                         ) : (

//                             <div className="finsight-detail-table-scroll">

//                                 {isActualVsTarget ? (

//                                     <ActualVsTargetTable
//                                         rows={filteredRows}
//                                         currency={currency}
//                                     />

//                                 ) : (

//                                     <GenericTable
//                                         rows={filteredRows}
//                                         currency={currency}
//                                         categoryLabel={
//                                             categoryLabel
//                                         }
//                                         firstMetricLabel={
//                                             firstMetricLabel
//                                         }
//                                         secondMetricLabel={
//                                             secondMetricLabel
//                                         }
//                                         firstMetricType={
//                                             firstMetricType
//                                         }
//                                         secondMetricType={
//                                             secondMetricType
//                                         }
//                                         firstMetricKeys={
//                                             firstMetricKeys
//                                         }
//                                         secondMetricKeys={
//                                             secondMetricKeys
//                                         }
//                                         categoryKeys={
//                                             categoryKeys
//                                         }
//                                         totalLabel={
//                                             totalLabel
//                                         }
//                                     />

//                                 )}

//                             </div>

//                         )}

//                     </div>


//                     {/* =================================================
//                         FOOTER
//                     ================================================= */}

//                     <div className="finsight-detail-footer">

//                         <button
//                             type="button"
//                             className="finsight-detail-footer-button"
//                             onClick={onClose}
//                         >
//                             Close
//                         </button>

//                     </div>

//                 </div>

//             </div>

//         </>
//     );
// }

import React, { useMemo, useState } from "react";
import ExportButtons from "../Common/ExportButtons";

/* =========================================================
   FORMATTERS & HELPERS
========================================================= */

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "" || value === "-") {
    return "—";
  }
  const number = Number(value);
  if (Number.isNaN(number)) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const formatPercentage = (value) => {
  if (value === null || value === undefined || value === "" || value === "-") {
    return "—";
  }
  const number = Number(value);
  if (Number.isNaN(number)) return "—";
  return `${number.toFixed(2)}%`;
};

const hasValue = (value) => {
  return !(value === null || value === undefined || value === "" || value === "-");
};

const isEmptyOrAll = (value) => {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value)) {
    return value.length === 0 || value.every((item) => isEmptyOrAll(item));
  }
  const text = String(value).trim().toLowerCase();
  return (
    text === "" ||
    text === "all" ||
    text === "all values" ||
    text === "all value" ||
    text === "all options" ||
    text === "-" ||
    text === "*"
  );
};

const getFilterDisplayValue = (filters, filterOptions, filterKey) => {
  const selectedValue = filters?.[filterKey];
  if (isEmptyOrAll(selectedValue)) return "";

  const optionMap = {
    legal_group: filterOptions?.legal_groups || [],
    legal_entity: filterOptions?.legal_entities || [],
    parent_division: filterOptions?.parent_divisions || [],
    subdivision: filterOptions?.subdivisions || [],
    period: filterOptions?.periods || [],
    year: filterOptions?.years || filterOptions?.fiscal_years || [],
  };

  const list = optionMap[filterKey] || [];
  if (Array.isArray(selectedValue)) {
    return selectedValue
      .map((val) => {
        const match = list.find((opt) => String(opt.id || opt.value || opt.code) === String(val));
        return match ? match.name || match.label || match.display_name || val : val;
      })
      .join(", ");
  }

  const match = list.find((opt) => String(opt.id || opt.value || opt.code) === String(selectedValue));
  return match ? match.name || match.label || match.display_name || selectedValue : String(selectedValue);
};

const FilterChip = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="finsight-modal-chip">
      <span className="finsight-modal-chip-label">{label}:</span>
      <span>{value}</span>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function OperatingAnalysisViewAllModal({
  open,
  onClose,
  data = [],
  loading = false,
  activeFilters = {},
  filterOptions = {},
  reportingCurrency = "AED",
  title = "Detailed View",
  subtitle = "Detailed analysis view",
  viewAllType = "", // "actual-vs-target" | "opex-composition"
  onExportExcel,
  onExportPDF,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const rows = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  }, [data]);

  const filteredRows = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return rows;
    return rows.filter((row) =>
      Object.values(row || {}).some((val) =>
        String(val ?? "").toLowerCase().includes(search)
      )
    );
  }, [rows, searchTerm]);

  const currency =
    rows?.[0]?.reporting_currency ||
    activeFilters?.reporting_currency ||
    reportingCurrency ||
    "AED";

  // Summary Metrics Calculation
  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        const actualPtd = Number(row.actual_ptd_aed ?? row.actual_ptd ?? row.actual ?? row.amount ?? 0) || 0;
        const targetPtd = Number(row.target_ptd_aed ?? row.target_ptd ?? row.target ?? 0) || 0;
        const actualYtd = Number(row.actual_ytd_aed ?? row.actual_ytd ?? 0) || 0;
        const targetYtd = Number(row.target_ytd_aed ?? row.target_ytd ?? 0) || 0;
        const pct = Number(row.percentage ?? row.share_pct ?? 0) || 0;

        acc.actualPtd += actualPtd;
        acc.targetPtd += targetPtd;
        acc.actualYtd += actualYtd;
        acc.targetYtd += targetYtd;
        acc.totalPct += pct;
        return acc;
      },
      { actualPtd: 0, targetPtd: 0, actualYtd: 0, targetYtd: 0, totalPct: 0 }
    );
  }, [filteredRows]);

  if (!open) return null;

  const isActualVsTarget = viewAllType === "actual-vs-target";

  const selectedYear = getFilterDisplayValue(activeFilters, filterOptions, "year") || activeFilters?.year || "";
  const selectedPeriod = getFilterDisplayValue(activeFilters, filterOptions, "period") || activeFilters?.period || "";
  const selectedLegalGroup = getFilterDisplayValue(activeFilters, filterOptions, "legal_group");
  const selectedLegalEntity = getFilterDisplayValue(activeFilters, filterOptions, "legal_entity");

  const handleExport = (type) => {
    if (type === "excel" && onExportExcel) onExportExcel();
    if (type === "pdf" && onExportPDF) onExportPDF();
  };

  return (
    <>
      <style>{`
        .finsight-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
        }

        .finsight-modal-container {
          width: 100%;
          max-width: 1300px;
          max-height: 88vh;
          background: #ffffff;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .finsight-modal-header {
          padding: 18px 24px 14px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
        }

        .finsight-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .finsight-modal-subtitle {
          font-size: 12px;
          color: #64748b;
          margin-top: 3px;
        }

        .finsight-modal-close-btn {
          background: transparent;
          border: none;
          font-size: 20px;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          line-height: 1;
        }

        .finsight-modal-close-btn:hover {
          color: #334155;
          background: #f8fafc;
        }

        .finsight-modal-toolbar {
          padding: 12px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .finsight-modal-chips-container {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .finsight-modal-chip {
          padding: 4px 10px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 11px;
          color: #334155;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .finsight-modal-chip-label {
          color: #64748b;
          font-weight: 600;
        }

        .finsight-modal-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .finsight-modal-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 16px 24px;
          background: #ffffff;
        }

        .finsight-modal-kpi-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          background: #ffffff;
        }

        .finsight-modal-kpi-title {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .finsight-modal-kpi-value {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 4px;
        }

        .finsight-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0 24px 20px;
        }

        .finsight-modal-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 12px;
        }

        .finsight-modal-table th {
          position: sticky;
          top: 0;
          background: #f8fafc;
          color: #475569;
          font-weight: 700;
          text-align: left;
          padding: 10px 12px;
          border-bottom: 2px solid #e2e8f0;
          border-top: 1px solid #e2e8f0;
          white-space: nowrap;
          z-index: 10;
        }

        .finsight-modal-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          white-space: nowrap;
        }

        .finsight-modal-table tr:hover td {
          background: #f8fafc;
        }

        .finsight-modal-table tfoot td {
          position: sticky;
          bottom: 0;
          background: #f8fafc;
          font-weight: 700;
          color: #0f172a;
          border-top: 2px solid #e2e8f0;
        }

        .text-right { text-align: right !important; }
        .text-left { text-align: left !important; }

        .finsight-modal-footer {
          padding: 12px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background: #ffffff;
        }

        .finsight-modal-btn-close {
          padding: 6px 16px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          color: #334155;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
        }

        .finsight-modal-btn-close:hover {
          background: #e2e8f0;
        }

        .finsight-modal-empty {
          padding: 48px;
          text-align: center;
          color: #64748b;
        }
      `}</style>

      <div className="finsight-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="finsight-modal-container">
          {/* Header */}
          <div className="finsight-modal-header">
            <div>
              <h2 className="finsight-modal-title">{title}</h2>
              <div className="finsight-modal-subtitle">{subtitle}</div>
            </div>
            <button type="button" className="finsight-modal-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Filter Bar & Export Actions */}
          <div className="finsight-modal-toolbar">
            <div className="finsight-modal-chips-container">
              {selectedYear && <FilterChip label="Year" value={selectedYear} />}
              {selectedPeriod && <FilterChip label="Period" value={selectedPeriod} />}
              <FilterChip label="Currency" value={currency} />
              {selectedLegalGroup && <FilterChip label="Legal Group" value={selectedLegalGroup} />}
              {selectedLegalEntity && <FilterChip label="Legal Entity" value={selectedLegalEntity} />}
            </div>

            <div className="finsight-modal-actions">
              <ExportButtons
                endpoint="operating-analysis-view-all"
                exporting={loading || !filteredRows.length ? "disabled" : false}
                handleExport={handleExport}
              />
            </div>
          </div>

          {/* KPI Summary Banner */}
          <div className="finsight-modal-kpi-grid">
            <div className="finsight-modal-kpi-card">
              <div className="finsight-modal-kpi-title">PTD ACTUAL</div>
              <div className="finsight-modal-kpi-value">{currency} {formatAmount(totals.actualPtd)}</div>
            </div>
            <div className="finsight-modal-kpi-card">
              <div className="finsight-modal-kpi-title">PTD TARGET</div>
              <div className="finsight-modal-kpi-value">{totals.targetPtd ? `${currency} ${formatAmount(totals.targetPtd)}` : "—"}</div>
            </div>
            <div className="finsight-modal-kpi-card">
              <div className="finsight-modal-kpi-title">YTD ACTUAL</div>
              <div className="finsight-modal-kpi-value">{totals.actualYtd ? `${currency} ${formatAmount(totals.actualYtd)}` : "—"}</div>
            </div>
            <div className="finsight-modal-kpi-card">
              <div className="finsight-modal-kpi-title">YTD TARGET</div>
              <div className="finsight-modal-kpi-value">{totals.targetYtd ? `${currency} ${formatAmount(totals.targetYtd)}` : "—"}</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="finsight-modal-body">
            {loading ? (
              <div className="finsight-modal-empty">Loading detailed operational data...</div>
            ) : filteredRows.length === 0 ? (
              <div className="finsight-modal-empty">No records found for the applied filters.</div>
            ) : (
              <table className="finsight-modal-table">
                <thead>
                  {isActualVsTarget ? (
                    <tr>
                      <th className="text-left">Expense Category</th>
                      <th className="text-right">Actual PTD ({currency})</th>
                      <th className="text-right">Target PTD ({currency})</th>
                      <th className="text-right">Variance ({currency})</th>
                      <th className="text-right">Variance %</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="text-left">Expense Category</th>
                      <th className="text-right">Amount ({currency})</th>
                      <th className="text-right">Share (%)</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => {
                    const category = row.category || row.name || row.category_name || "—";

                    if (isActualVsTarget) {
                      const actual = row.actual_ptd_aed ?? row.actual_ptd ?? row.actual;
                      const target = row.target_ptd_aed ?? row.target_ptd ?? row.target;
                      const variance = hasValue(actual) && hasValue(target) ? Number(actual) - Number(target) : null;
                      const variancePct = target && Number(target) !== 0 ? (variance / Number(target)) * 100 : null;

                      return (
                        <tr key={`${category}-${index}`}>
                          <td className="text-left" style={{ fontWeight: 600 }}>{category}</td>
                          <td className="text-right">{hasValue(actual) ? formatAmount(actual) : "—"}</td>
                          <td className="text-right">{hasValue(target) ? formatAmount(target) : "—"}</td>
                          <td className="text-right">{hasValue(variance) ? formatAmount(variance) : "—"}</td>
                          <td className="text-right">{hasValue(variancePct) ? formatPercentage(variancePct) : "—"}</td>
                        </tr>
                      );
                    }

                    const amount = row.amount ?? row.amount_aed ?? row.actual_ptd;
                    const pct = row.percentage ?? row.share_pct;

                    return (
                      <tr key={`${category}-${index}`}>
                        <td className="text-left" style={{ fontWeight: 600 }}>{category}</td>
                        <td className="text-right">{hasValue(amount) ? formatAmount(amount) : "—"}</td>
                        <td className="text-right">{hasValue(pct) ? formatPercentage(pct) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  {isActualVsTarget ? (
                    <tr>
                      <td className="text-left">Total</td>
                      <td className="text-right">{formatAmount(totals.actualPtd)}</td>
                      <td className="text-right">{totals.targetPtd ? formatAmount(totals.targetPtd) : "—"}</td>
                      <td className="text-right">—</td>
                      <td className="text-right">—</td>
                    </tr>
                  ) : (
                    <tr>
                      <td className="text-left">Total</td>
                      <td className="text-right">{formatAmount(totals.actualPtd)}</td>
                      <td className="text-right">{formatPercentage(totals.totalPct || 100)}</td>
                    </tr>
                  )}
                </tfoot>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="finsight-modal-footer">
            <button type="button" className="finsight-modal-btn-close" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}