

// import React, { useState, useEffect } from "react";

// /* =========================================================
//    Reusable Filter Field
// ========================================================= */

// function FilterField({ label, children }) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         gap: 4,
//         minWidth: 110,
//         flex: "1 1 auto",
//       }}
//     >
//       <span
//         style={{
//           fontSize: "0.66rem",
//           color: "#1e3a8a",
//           fontWeight: 700,
//           letterSpacing: "-0.02em",
//         }}
//       >
//         {label}
//       </span>

//       {children}
//     </div>
//   );
// }

// /* =========================================================
//    Common Select Filters
//    Used by existing pages
//    DO NOT CHANGE
// ========================================================= */

// const commonSelectFilters = [
//   {
//     label: "Legal Group",
//     optionKey: "legal_groups",
//     apiKey: "legal_group",
//   },
//   {
//     label: "Legal Entity",
//     optionKey: "legal_entities",
//     apiKey: "legal_entity",
//   },
//   {
//     label: "Parent Division",
//     optionKey: "parent_divisions",
//     apiKey: "parent_division",
//   },
//   {
//     label: "Sub-Division",
//     optionKey: "subdivisions",
//     apiKey: "subdivision",
//   },
//   {
//     label: "Currency",
//     optionKey: "currencies",
//     apiKey: "currency",
//   },
// ];

// /* =========================================================
//    Operating Expenses Filters
//    ONLY used when isOperatingExpenses = true
// ========================================================= */

// const operatingSelectFilters = [
//   {
//     label: "Legal Group",
//     optionKey: "legal_groups",
//     apiKey: "legal_group",
//   },
//   {
//     label: "Legal Entity",
//     optionKey: "legal_entities",
//     apiKey: "legal_entity",
//   },
//   {
//     label: "Parent Division",
//     optionKey: "parent_divisions",
//     apiKey: "parent_division",
//   },
//   {
//     label: "Sub-Division",
//     optionKey: "subdivisions",
//     apiKey: "subdivision",
//   },
// ];

// /* =========================================================
//    Operating Expenses Additional Filters

//    Reporting Currency is OPEX-specific.
//    Default = AED
// ========================================================= */

// const operatingAdditionalFilters = [
//   {
//     label: "Period",
//     optionKey: "periods",
//     apiKey: "period",
//   },
//   {
//     label: "Compare With",
//     optionKey: "compare_with",
//     apiKey: "compare_with",
//   },
//   {
//     label: "Reporting Currency",
//     optionKey: "currencies",
//     apiKey: "reporting_currency",
//   },
// ];

// /* =========================================================
//    Default State

//    Existing/common page behavior remains unchanged.

//    OPEX Reporting Currency defaults to AED.
// ========================================================= */

// const DEFAULT_FILTERS = {
//   legal_group: "",
//   legal_entity: "",
//   parent_division: "",
//   subdivision: "",
//   currency: "",
//   as_on_date: "",
//   period: "",
//   compare_with: "",
//   reporting_currency: "AED",
// };

// /* =========================================================
//    Helper
//    Get latest available period
// ========================================================= */

// function getLatestPeriod(periods = []) {
//   if (!Array.isArray(periods) || periods.length === 0) {
//     return "";
//   }

//   const first = periods[0];

//   if (typeof first === "object" && first !== null) {
//     return first.value ?? "";
//   }

//   return first;
// }

// /* =========================================================
//    Filters Component
// ========================================================= */

// export default function Filters({
//   filterOptions,
//   onApply,
//   onReset,
//   isOperatingExpenses = false,
// }) {
//   const [selectedFilters, setSelectedFilters] =
//     useState(DEFAULT_FILTERS);

//   /* =======================================================
//      Available Date Handling

//      ONLY for existing/common pages.

//      OPEX does NOT use As On Date.
//   ======================================================= */

//   useEffect(() => {
//     if (isOperatingExpenses) {
//       return;
//     }

//     const dates =
//       filterOptions?.available_dates ||
//       filterOptions?.as_on_dates ||
//       [];

//     if (dates.length) {
//       setSelectedFilters((prev) => ({
//         ...prev,
//         as_on_date: dates[0],
//       }));
//     }
//   }, [filterOptions, isOperatingExpenses]);

//   /* =======================================================
//      Operating Expenses Default Values

//      Period:
//        latest available period

//      Reporting Currency:
//        AED by default

//      Compare With:
//        first available option
//   ======================================================= */

//   useEffect(() => {
//     if (!isOperatingExpenses) {
//       return;
//     }

//     const periods = filterOptions?.periods || [];

//     const latestPeriod = getLatestPeriod(periods);

//     const firstCompareWith =
//       filterOptions?.compare_with?.[0];

//     setSelectedFilters((prev) => ({
//       ...prev,

//       period:
//         prev.period ||
//         latestPeriod ||
//         "",

//       compare_with:
//         prev.compare_with ||
//         (
//           firstCompareWith
//             ? typeof firstCompareWith === "object"
//               ? firstCompareWith.value
//               : firstCompareWith
//             : ""
//         ),

//       /* =================================================
//          Reporting Currency
//          AED is the default
//       ================================================= */

//       reporting_currency:
//         prev.reporting_currency || "AED",
//     }));
//   }, [filterOptions, isOperatingExpenses]);

//   /* =======================================================
//      Reset
//   ======================================================= */

//   const handleReset = () => {
//     let resetFilters = {
//       legal_group: "",
//       legal_entity: "",
//       parent_division: "",
//       subdivision: "",
//       currency: "",
//       as_on_date: "",
//       period: "",
//       compare_with: "",
//       reporting_currency: "AED",
//     };

//     /* =====================================================
//        Existing/common pages

//        KEEP EXISTING BEHAVIOR
//     ===================================================== */

//     if (!isOperatingExpenses) {
//       resetFilters = {
//         legal_group: "",
//         legal_entity: "",
//         parent_division: "",
//         subdivision: "",
//         currency: "",
//         as_on_date:
//           filterOptions?.as_on_dates?.[0] ||
//           filterOptions?.available_dates?.[0] ||
//           "",
//         period: "",
//         compare_with: "",
//         reporting_currency: "AED",
//       };
//     }

//     /* =====================================================
//        Operating Expenses page
//     ===================================================== */

//     if (isOperatingExpenses) {
//       const periods =
//         filterOptions?.periods || [];

//       const latestPeriod =
//         getLatestPeriod(periods);

//       const firstCompareWith =
//         filterOptions?.compare_with?.[0];

//       resetFilters = {
//         legal_group: "",
//         legal_entity: "",
//         parent_division: "",
//         subdivision: "",
//         currency: "",
//         as_on_date: "",

//         /* Latest period */
//         period: latestPeriod || "",

//         /* Compare With */
//         compare_with:
//           firstCompareWith
//             ? typeof firstCompareWith === "object"
//               ? firstCompareWith.value
//               : firstCompareWith
//             : "",

//         /* =================================================
//            Reporting Currency
//            Always reset to AED
//         ================================================= */

//         reporting_currency: "AED",
//       };
//     }

//     setSelectedFilters(resetFilters);

//     if (onReset) {
//       onReset();
//     }
//   };

//   /* =======================================================
//      Which Filters Should Be Displayed?
//   ======================================================= */

//   const filtersToDisplay = isOperatingExpenses
//     ? [
//         ...operatingSelectFilters,
//         ...operatingAdditionalFilters,
//       ]
//     : commonSelectFilters;

//   return (
//     <div
//       className="filter-bar"
//       style={{
//         display: "flex",
//         gap: "10px",
//         flexWrap: "wrap",
//         alignItems: "flex-end",
//         width: "100%",
//       }}
//     >
//       {/* ===================================================
//           Dynamic Filters
//       =================================================== */}

//       {filtersToDisplay.map((f, i) => {
//         const isPeriod =
//           isOperatingExpenses &&
//           f.apiKey === "period";

//         const isReportingCurrency =
//           isOperatingExpenses &&
//           f.apiKey === "reporting_currency";

//         return (
//           <FilterField
//             key={`${f.apiKey}-${i}`}
//             label={f.label}
//           >
//             <select
//               className="filter-select w-full"
//               value={
//                 selectedFilters[f.apiKey] || ""
//               }
//               onChange={(e) =>
//                 setSelectedFilters((prev) => ({
//                   ...prev,
//                   [f.apiKey]: e.target.value,
//                 }))
//               }
//             >
//               {/* =================================================
//                   Common filters keep "All"

//                   OPEX Period does NOT show "All"
//               ================================================= */}

//               {!isPeriod && (
//                 <option value="">
//                   All
//                 </option>
//               )}

//               {/* =================================================
//                   Reporting Currency

//                   AED is always available as default.
//               ================================================= */}

//               {isReportingCurrency &&
//                 !filterOptions?.currencies?.length && (
//                   <option value="AED">
//                     AED
//                   </option>
//                 )}

//               {/* =================================================
//                   Backend Options
//               ================================================= */}

//               {filterOptions?.[f.optionKey]?.map(
//                 (item, index) => {
//                   const value =
//                     typeof item === "object"
//                       ? item.value
//                       : item;

//                   const label =
//                     typeof item === "object"
//                       ? item.label
//                       : item;

//                   return (
//                     <option
//                       key={`${value}-${index}`}
//                       value={value}
//                     >
//                       {label}
//                     </option>
//                   );
//                 }
//               )}
//             </select>
//           </FilterField>
//         );
//       })}

//       {/* ===================================================
//           Currency + As On Date

//           Existing pages ONLY.

//           OPEX does NOT render these.
//       =================================================== */}

//       {!isOperatingExpenses && (
//         <>
//           <FilterField label="As On Date">
//             <input
//               type="text"
//               value={
//                 selectedFilters.as_on_date
//               }
//               readOnly
//               className="w-full h-8 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2"
//             />
//           </FilterField>
//         </>
//       )}

//       {/* ===================================================
//           Buttons
//       =================================================== */}

//       <div
//         style={{
//           display: "flex",
//           gap: "8px",
//           marginLeft: "auto",
//         }}
//       >
//         <button
//           className="btn btn-primary"
//           onClick={() =>
//             onApply(selectedFilters)
//           }
//         >
//           Apply
//         </button>

//         <button
//           className="btn btn-ghost"
//           onClick={handleReset}
//         >
//           Reset
//         </button>
//       </div>
//     </div>
//   );
// }


// // import React, { useState, useEffect } from "react";


// // /* =========================================================
// //    Reusable Filter Field
// // ========================================================= */

// // function FilterField({ label, children }) {
// //     return (
// //         <div
// //             style={{
// //                 display: "flex",
// //                 flexDirection: "column",
// //                 gap: 4,
// //                 minWidth: 110,
// //                 flex: "1 1 auto",
// //             }}
// //         >
// //             <span
// //                 style={{
// //                     fontSize: "0.66rem",
// //                     color: "#1e3a8a",
// //                     fontWeight: 700,
// //                     letterSpacing: "-0.02em",
// //                 }}
// //             >
// //                 {label}
// //             </span>

// //             {children}
// //         </div>
// //     );
// // }


// // /* =========================================================
// //    Common Select Filters
// //    Used by existing pages
// //    DO NOT CHANGE
// // ========================================================= */

// // const commonSelectFilters = [
// //     {
// //         label: "Legal Group",
// //         optionKey: "legal_groups",
// //         apiKey: "legal_group",
// //     },
// //     {
// //         label: "Legal Entity",
// //         optionKey: "legal_entities",
// //         apiKey: "legal_entity",
// //     },
// //     {
// //         label: "Parent Division",
// //         optionKey: "parent_divisions",
// //         apiKey: "parent_division",
// //     },
// //     {
// //         label: "Sub-Division",
// //         optionKey: "subdivisions",
// //         apiKey: "subdivision",
// //     },
// //     {
// //         label: "Currency",
// //         optionKey: "currencies",
// //         apiKey: "currency",
// //     },
// // ];


// // /* =========================================================
// //    Operating Expenses Filters
// //    ONLY used when isOperatingExpenses = true
// // ========================================================= */

// // const operatingSelectFilters = [
// //     {
// //         label: "Legal Group",
// //         optionKey: "legal_groups",
// //         apiKey: "legal_group",
// //     },
// //     {
// //         label: "Legal Entity",
// //         optionKey: "legal_entities",
// //         apiKey: "legal_entity",
// //     },
// //     {
// //         label: "Parent Division",
// //         optionKey: "parent_divisions",
// //         apiKey: "parent_division",
// //     },
// //     {
// //         label: "Sub-Division",
// //         optionKey: "subdivisions",
// //         apiKey: "subdivision",
// //     },
// // ];


// // /* =========================================================
// //    Operating Expenses Additional Filters

// //    Reporting Currency is OPEX-specific.
// //    Default = AED
// // ========================================================= */

// // const operatingAdditionalFilters = [
// //     {
// //         label: "Period",
// //         optionKey: "periods",
// //         apiKey: "period",
// //     },
// //     {
// //         label: "Compare With",
// //         optionKey: "compare_with",
// //         apiKey: "compare_with",
// //     },
// //     {
// //         label: "Reporting Currency",
// //         optionKey: "currencies",
// //         apiKey: "reporting_currency",
// //     },
// // ];


// // /* =========================================================
// //    Default State

// //    Existing/common page behavior remains unchanged.

// //    OPEX Reporting Currency defaults to AED.
// // ========================================================= */

// // const DEFAULT_FILTERS = {
// //     legal_group: "",
// //     legal_entity: "",
// //     parent_division: "",
// //     subdivision: "",
// //     currency: "",
// //     as_on_date: "",
// //     period: "",
// //     compare_with: "",
// //     reporting_currency: "AED",
// // };


// // /* =========================================================
// //    Helper
// //    Get latest available period
// // ========================================================= */

// // function getLatestPeriod(periods = []) {
// //     if (!Array.isArray(periods) || periods.length === 0) {
// //         return "";
// //     }

// //     /*
// //       Backend contract provides periods in chronological order.

// //       Example:
// //         Jan-26
// //         Feb-26
// //         ...
// //         Sep-26

// //       Therefore the latest available period is the last item.
// //     */

// //     const latest = periods[periods.length - 1];

// //     if (typeof latest === "object" && latest !== null) {
// //         return latest.value ?? "";
// //     }

// //     return latest ?? "";
// // }


// // /* =========================================================
// //    Helper
// //    Get option value
// // ========================================================= */

// // function getOptionValue(option) {
// //     if (typeof option === "object" && option !== null) {
// //         return option.value ?? "";
// //     }

// //     return option ?? "";
// // }


// // /* =========================================================
// //    Filters Component
// // ========================================================= */

// // export default function Filters({
// //     filterOptions,
// //     onApply,
// //     onReset,
// //     isOperatingExpenses = false,
// // }) {

// //     const [selectedFilters, setSelectedFilters] =
// //         useState(DEFAULT_FILTERS);


// //     /* =======================================================
// //        Available Date Handling

// //        ONLY for existing/common pages.

// //        OPEX does NOT use As On Date.
// //     ======================================================= */

// //     useEffect(() => {
// //         if (isOperatingExpenses) {
// //             return;
// //         }

// //         const dates =
// //             filterOptions?.available_dates ||
// //             filterOptions?.as_on_dates ||
// //             [];

// //         if (dates.length) {
// //             setSelectedFilters((prev) => ({
// //                 ...prev,
// //                 as_on_date: dates[0],
// //             }));
// //         }
// //     }, [filterOptions, isOperatingExpenses]);


// //     /* =======================================================
// //        Operating Expenses Default Values

// //        Period:
// //          latest available period

// //        Reporting Currency:
// //          AED by default

// //        Compare With:
// //          first available option
// //     ======================================================= */

// //     useEffect(() => {
// //         if (!isOperatingExpenses) {
// //             return;
// //         }

// //         const periods =
// //             filterOptions?.periods || [];

// //         const latestPeriod =
// //             getLatestPeriod(periods);

// //         const firstCompareWith =
// //             filterOptions?.compare_with?.[0];

// //         const compareWithValue =
// //             getOptionValue(firstCompareWith);

// //         const defaultReportingCurrency =
// //             filterOptions?.default_reporting_currency ||
// //             "AED";

// //         setSelectedFilters((prev) => ({
// //             ...prev,

// //             /*
// //               Only set the latest period when no period
// //               has already been selected by the user.
// //             */
// //             period:
// //                 prev.period ||
// //                 latestPeriod ||
// //                 "",

// //             /*
// //               Preserve existing Compare With selection.
// //             */
// //             compare_with:
// //                 prev.compare_with ||
// //                 compareWithValue ||
// //                 "",

// //             /*
// //               Backend default takes priority when available.
// //               Otherwise AED.
// //             */
// //             reporting_currency:
// //                 prev.reporting_currency ||
// //                 defaultReportingCurrency,
// //         }));

// //     }, [filterOptions, isOperatingExpenses]);


// //     /* =======================================================
// //        Reset
// //     ======================================================= */

// //     const handleReset = () => {

// //         let resetFilters = {
// //             legal_group: "",
// //             legal_entity: "",
// //             parent_division: "",
// //             subdivision: "",
// //             currency: "",
// //             as_on_date: "",
// //             period: "",
// //             compare_with: "",
// //             reporting_currency: "AED",
// //         };


// //         /* =====================================================
// //            Existing/common pages

// //            KEEP EXISTING BEHAVIOR
// //         ===================================================== */

// //         if (!isOperatingExpenses) {

// //             resetFilters = {
// //                 legal_group: "",
// //                 legal_entity: "",
// //                 parent_division: "",
// //                 subdivision: "",
// //                 currency: "",
// //                 as_on_date:
// //                     filterOptions?.as_on_dates?.[0] ||
// //                     filterOptions?.available_dates?.[0] ||
// //                     "",
// //                 period: "",
// //                 compare_with: "",
// //                 reporting_currency: "AED",
// //             };
// //         }


// //         /* =====================================================
// //            Operating Expenses page
// //         ===================================================== */

// //         if (isOperatingExpenses) {

// //             const periods =
// //                 filterOptions?.periods || [];

// //             const latestPeriod =
// //                 getLatestPeriod(periods);

// //             const firstCompareWith =
// //                 filterOptions?.compare_with?.[0];

// //             const compareWithValue =
// //                 getOptionValue(firstCompareWith);

// //             resetFilters = {
// //                 legal_group: "",
// //                 legal_entity: "",
// //                 parent_division: "",
// //                 subdivision: "",
// //                 currency: "",
// //                 as_on_date: "",

// //                 /* Latest available period */
// //                 period: latestPeriod || "",

// //                 /* Compare With */
// //                 compare_with:
// //                     compareWithValue || "",

// //                 /* Reporting Currency */
// //                 reporting_currency:
// //                     filterOptions?.default_reporting_currency ||
// //                     "AED",
// //             };
// //         }


// //         setSelectedFilters(resetFilters);


// //         if (onReset) {
// //             onReset();
// //         }
// //     };


// //     /* =======================================================
// //        Which Filters Should Be Displayed?
// //     ======================================================= */

// //     const filtersToDisplay = isOperatingExpenses
// //         ? [
// //             ...operatingSelectFilters,
// //             ...operatingAdditionalFilters,
// //         ]
// //         : commonSelectFilters;


// //     return (
// //         <div
// //             className="filter-bar"
// //             style={{
// //                 display: "flex",
// //                 gap: "10px",
// //                 flexWrap: "wrap",
// //                 alignItems: "flex-end",
// //                 width: "100%",
// //             }}
// //         >

// //             {/* ===================================================
// //                 Dynamic Filters
// //             =================================================== */}

// //             {filtersToDisplay.map((f, i) => {

// //                 const isPeriod =
// //                     isOperatingExpenses &&
// //                     f.apiKey === "period";

// //                 const isReportingCurrency =
// //                     isOperatingExpenses &&
// //                     f.apiKey === "reporting_currency";


// //                 return (
// //                     <FilterField
// //                         key={`${f.apiKey}-${i}`}
// //                         label={f.label}
// //                     >

// //                         <select
// //                             className="filter-select w-full"
// //                             value={
// //                                 selectedFilters[f.apiKey] || ""
// //                             }
// //                             onChange={(e) =>
// //                                 setSelectedFilters((prev) => ({
// //                                     ...prev,
// //                                     [f.apiKey]:
// //                                         e.target.value,
// //                                 }))
// //                             }
// //                         >

// //                             {/* =================================================
// //                                 Common filters keep "All"

// //                                 OPEX Period does NOT show "All"
// //                             ================================================= */}

// //                             {!isPeriod && (
// //                                 <option value="">
// //                                     All
// //                                 </option>
// //                             )}


// //                             {/* =================================================
// //                                 Reporting Currency

// //                                 AED is always available as default.
// //                             ================================================= */}

// //                             {isReportingCurrency &&
// //                                 !filterOptions?.currencies?.length && (
// //                                     <option value="AED">
// //                                         AED
// //                                     </option>
// //                                 )}


// //                             {/* =================================================
// //                                 Backend Options
// //                             ================================================= */}

// //                             {filterOptions?.[f.optionKey]?.map(
// //                                 (item, index) => {

// //                                     const value =
// //                                         typeof item === "object"
// //                                             ? item.value
// //                                             : item;

// //                                     const label =
// //                                         typeof item === "object"
// //                                             ? item.label
// //                                             : item;


// //                                     return (
// //                                         <option
// //                                             key={`${value}-${index}`}
// //                                             value={value}
// //                                         >
// //                                             {label}
// //                                         </option>
// //                                     );
// //                                 }
// //                             )}

// //                         </select>

// //                     </FilterField>
// //                 );
// //             })}


// //             {/* ===================================================
// //                 Currency + As On Date

// //                 Existing pages ONLY.

// //                 OPEX does NOT render these.
// //             =================================================== */}

// //             {!isOperatingExpenses && (
// //                 <>
// //                     <FilterField label="As On Date">

// //                         <input
// //                             type="text"
// //                             value={
// //                                 selectedFilters.as_on_date
// //                             }
// //                             readOnly
// //                             className="w-full h-8 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2"
// //                         />

// //                     </FilterField>
// //                 </>
// //             )}


// //             {/* ===================================================
// //                 Buttons
// //             =================================================== */}

// //             <div
// //                 style={{
// //                     display: "flex",
// //                     gap: "8px",
// //                     marginLeft: "auto",
// //                 }}
// //             >

// //                 <button
// //                     className="btn btn-primary"
// //                     onClick={() =>
// //                         onApply &&
// //                         onApply(selectedFilters)
// //                     }
// //                 >
// //                     Apply
// //                 </button>


// //                 <button
// //                     className="btn btn-ghost"
// //                     onClick={handleReset}
// //                 >
// //                     Reset
// //                 </button>

// //             </div>

// //         </div>
// //     );
// // }


import React, { useState, useEffect } from "react";
import { getOpexFilterOptions } from "../../api/opexApi";

/* =========================================================
   Reusable Filter Field
========================================================= */

function FilterField({ label, children, isOperatingExpenses = false }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,

        /*
          IMPORTANT:
          Common pages keep the original layout behavior.

          OPEX:
          minWidth: 0 + flex: 1 1 0
          allows all 7 filters to stay in one row.
        */
        minWidth: isOperatingExpenses ? 0 : 110,
        flex: isOperatingExpenses
          ? "1 1 0"
          : "1 1 auto",

        /*
          Prevent select content from forcing
          the flex item wider.
        */
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: "0.66rem",
          color: "#1e3a8a",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>

      {children}
    </div>
  );
}

/* =========================================================
   Common Select Filters
   Used by existing pages
   DO NOT CHANGE
========================================================= */

const commonSelectFilters = [
  {
    label: "Legal Group",
    optionKey: "legal_groups",
    apiKey: "legal_group",
  },
  {
    label: "Legal Entity",
    optionKey: "legal_entities",
    apiKey: "legal_entity",
  },
  {
    label: "Parent Division",
    optionKey: "parent_divisions",
    apiKey: "parent_division",
  },
  {
    label: "Sub-Division",
    optionKey: "subdivisions",
    apiKey: "subdivision",
  },
  {
    label: "Currency",
    optionKey: "currencies",
    apiKey: "currency",
  },
];

/* =========================================================
   Operating Expenses Filters
   ONLY used when isOperatingExpenses = true
========================================================= */

const operatingSelectFilters = [
  {
    label: "Legal Group",
    optionKey: "legal_groups",
    apiKey: "legal_group",
  },
  {
    label: "Legal Entity",
    optionKey: "legal_entities",
    apiKey: "legal_entity",
  },
  {
    label: "Parent Division",
    optionKey: "parent_divisions",
    apiKey: "parent_division",
  },
  {
    label: "Sub-Division",
    optionKey: "subdivisions",
    apiKey: "subdivision",
  },
];

/* =========================================================
   Operating Expenses Additional Filters

   Reporting Currency is OPEX-specific.
   Default = AED
========================================================= */

const operatingAdditionalFilters = [
  {
    label: "Period",
    optionKey: "periods",
    apiKey: "period",
  },
  {
    label: "Compare With",
    optionKey: "compare_with",
    apiKey: "compare_with",
  },
  {
    label: "Reporting Currency",
    optionKey: "currencies",
    apiKey: "reporting_currency",
  },
];

/* =========================================================
   Default State

   Existing/common page behavior remains unchanged.

   OPEX Reporting Currency defaults to AED.
========================================================= */

const DEFAULT_FILTERS = {
  legal_group: "",
  legal_entity: "",
  parent_division: "",
  subdivision: "",
  currency: "",
  as_on_date: "",
  period: "",
  compare_with: "",
  reporting_currency: "AED",
};

/* =========================================================
   Helper
   Get option value
========================================================= */

function getOptionValue(option) {
  if (option === null || option === undefined) {
    return "";
  }

  if (typeof option === "object") {
    return (
      option.value ??
      option.id ??
      option.code ??
      option.period_name ??
      option.name ??
      option.currency_code ??
      ""
    );
  }

  return option;
}

/* =========================================================
   Helper
   Get option label
========================================================= */

function getOptionLabel(option) {
  if (option === null || option === undefined) {
    return "";
  }

  if (typeof option === "object") {
    return (
      option.label ??
      option.name ??
      option.currency_code ??
      option.value ??
      option.code ??
      option.period_name ??
      ""
    );
  }

  return option;
}

/* =========================================================
   Helper
   Get latest available period

   Backend contract:
   periods are chronological.

   Example:
   Jan-26 ... Sep-26

   Latest = last item.
========================================================= */

function getLatestPeriod(periods = []) {
  if (!Array.isArray(periods) || periods.length === 0) {
    return "";
  }

  const latest = periods[periods.length - 1];

  return getOptionValue(latest);
}

/* =========================================================
   Normalize OPEX filter-options response

   Backend:
   legal_groups
   legal_entities
   parent_divisions
   subdivisions
   periods
   ledger_currencies
   reporting_currencies
   currencies
   data_as_of
   default_reporting_currency
========================================================= */

function normalizeOpexFilterOptions(data = {}) {
  /*
    Some API service functions return:

      response.data

    while others may already return:

      data

    Support both without changing UI.
  */
  const payload =
    data?.data &&
    typeof data.data === "object" &&
    !Array.isArray(data.data)
      ? data.data
      : data;

  /*
    Backend OPEX Reporting Currency options.
  */
  const reportingCurrencies =
    payload?.reporting_currencies ||
    payload?.currencies ||
    [];

  const currencies = Array.isArray(reportingCurrencies)
    ? reportingCurrencies.map((item) => {
        if (
          typeof item === "object" &&
          item !== null
        ) {
          const value =
            item.currency_code ??
            item.value ??
            item.code ??
            item.id ??
            "";

          const label =
            item.label ??
            item.currency_code ??
            item.value ??
            item.code ??
            "";

          return {
            value,
            label,
          };
        }

        return {
          value: item,
          label: item,
        };
      })
    : [];

  return {
    legal_groups:
      Array.isArray(payload?.legal_groups)
        ? payload.legal_groups
        : [],

    legal_entities:
      Array.isArray(payload?.legal_entities)
        ? payload.legal_entities
        : [],

    parent_divisions:
      Array.isArray(payload?.parent_divisions)
        ? payload.parent_divisions
        : [],

    subdivisions:
      Array.isArray(payload?.subdivisions)
        ? payload.subdivisions
        : [],

    periods:
      Array.isArray(payload?.periods)
        ? payload.periods
        : [],

    /*
      Used by Reporting Currency dropdown.
    */
    currencies,

    /*
      Keep these separately for API-ready usage.
    */
    ledger_currencies:
      Array.isArray(payload?.ledger_currencies)
        ? payload.ledger_currencies
        : [],

    reporting_currencies:
      Array.isArray(payload?.reporting_currencies)
        ? payload.reporting_currencies
        : Array.isArray(payload?.currencies)
        ? payload.currencies
        : [],

    /*
      Compare With may or may not be returned
      by the filter-options endpoint.
    */
    compare_with:
      Array.isArray(payload?.compare_with)
        ? payload.compare_with
        : Array.isArray(payload?.compare_periods)
        ? payload.compare_periods
        : [],

    data_as_of:
      payload?.data_as_of || null,

    default_reporting_currency:
      payload?.default_reporting_currency ||
      "AED",
  };
}

/* =========================================================
   Filters Component
========================================================= */

export default function Filters({
  filterOptions,
  onApply,
  onReset,
  isOperatingExpenses = false,
}) {
  const [selectedFilters, setSelectedFilters] =
    useState(DEFAULT_FILTERS);

  /* =======================================================
     OPEX LOCAL FILTER OPTIONS

     Existing pages continue using filterOptions
     passed by parent.

     OPEX uses its own API-driven options.
  ======================================================= */

  const [opexFilterOptions, setOpexFilterOptions] =
    useState({
      legal_groups: [],
      legal_entities: [],
      parent_divisions: [],
      subdivisions: [],
      periods: [],
      currencies: [],
      reporting_currencies: [],
      ledger_currencies: [],
      compare_with: [],
      data_as_of: null,
      default_reporting_currency: "AED",
    });

  /* =======================================================
     OPEX FILTER API LOADING
  ======================================================= */

  const [opexFilterLoading, setOpexFilterLoading] =
    useState(false);

  /* =======================================================
     OPEX FILTER API

     Converts frontend filter names into
     backend OPEX query parameters.
  ======================================================= */

  const loadOpexFilterOptions = async (
    currentFilters = {}
  ) => {
    try {
      setOpexFilterLoading(true);

      /* =====================================================
         Backend filter parameters
      ===================================================== */

      const apiFilters = {};

      if (currentFilters.legal_group) {
        apiFilters.legal_group_id =
          currentFilters.legal_group;
      }

      if (currentFilters.legal_entity) {
        apiFilters.legal_entity_id =
          currentFilters.legal_entity;
      }

      if (currentFilters.parent_division) {
        apiFilters.parent_division_id =
          currentFilters.parent_division;
      }

      if (currentFilters.subdivision) {
        apiFilters.subdivision_id =
          currentFilters.subdivision;
      }

      /*
        filter-options does not require period_name.
      */

      const response =
        await getOpexFilterOptions(apiFilters);

      const normalized =
        normalizeOpexFilterOptions(
          response || {}
        );

      setOpexFilterOptions(normalized);

      return normalized;
    } catch (error) {
      console.error(
        "Failed to load OPEX filter options:",
        error
      );

      return null;
    } finally {
      setOpexFilterLoading(false);
    }
  };

  /* =======================================================
     Available Date Handling

     ONLY for existing/common pages.

     OPEX does NOT use As On Date.

     DO NOT CHANGE.
  ======================================================= */

  useEffect(() => {
    if (isOperatingExpenses) {
      return;
    }

    const dates =
      filterOptions?.available_dates ||
      filterOptions?.as_on_dates ||
      [];

    if (dates.length) {
      setSelectedFilters((prev) => ({
        ...prev,
        as_on_date: dates[0],
      }));
    }
  }, [filterOptions, isOperatingExpenses]);

  /* =======================================================
     INITIAL OPEX FILTER API LOAD
  ======================================================= */

  useEffect(() => {
    if (!isOperatingExpenses) {
      return;
    }

    /*
      Load all initial OPEX filter options.

      No hierarchy restrictions initially.
    */
    loadOpexFilterOptions({});
  }, [isOperatingExpenses]);

  /* =======================================================
     INITIAL OPEX DEFAULT VALUES

     Period:
       latest available period

     Reporting Currency:
       backend default or AED

     Compare With:
       backend first option if provided,
       otherwise blank.
  ======================================================= */

  useEffect(() => {
    if (!isOperatingExpenses) {
      return;
    }

    /*
      Prefer API-loaded OPEX options.
    */
    const periods =
      opexFilterOptions?.periods?.length
        ? opexFilterOptions.periods
        : filterOptions?.periods || [];

    const latestPeriod =
      getLatestPeriod(periods);

    const compareOptions =
      opexFilterOptions?.compare_with?.length
        ? opexFilterOptions.compare_with
        : filterOptions?.compare_with || [];

    const firstCompareWith =
      compareOptions[0];

    const compareWithValue =
      getOptionValue(firstCompareWith);

    const defaultReportingCurrency =
      opexFilterOptions
        ?.default_reporting_currency ||
      filterOptions
        ?.default_reporting_currency ||
      "AED";

    /*
      Initialize period only when
      backend options are available.
    */

    setSelectedFilters((prev) => ({
      ...prev,

      /*
        Do not overwrite an already selected period.
      */
      period:
        prev.period ||
        latestPeriod ||
        "",

      /*
        Compare With stays blank if
        backend doesn't provide one.
      */
      compare_with:
        prev.compare_with ||
        compareWithValue ||
        "",

      /*
        Reporting Currency defaults to
        backend default, normally AED.
      */
      reporting_currency:
        prev.reporting_currency ||
        defaultReportingCurrency ||
        "AED",
    }));
  }, [
    opexFilterOptions,
    filterOptions,
    isOperatingExpenses,
  ]);

  /* =======================================================
     OPEX CASCADING FILTER HANDLER

     Hierarchy:

     Legal Group
          ↓
     Legal Entity
          ↓
     Parent Division
          ↓
     Sub-Division

     Backend filter-options is called when
     hierarchy selection changes.
  ======================================================= */

  const handleOpexFilterChange = async (
    apiKey,
    value
  ) => {
    /*
      Start with current selections.
    */
    let nextFilters = {
      ...selectedFilters,
      [apiKey]: value,
    };

    /* =====================================================
       Legal Group changes
       Reset lower levels
    ===================================================== */

    if (apiKey === "legal_group") {
      nextFilters = {
        ...nextFilters,
        legal_entity: "",
        parent_division: "",
        subdivision: "",
      };
    }

    /* =====================================================
       Legal Entity changes
       Reset lower levels
    ===================================================== */

    if (apiKey === "legal_entity") {
      nextFilters = {
        ...nextFilters,
        parent_division: "",
        subdivision: "",
      };
    }

    /* =====================================================
       Parent Division changes
       Reset Sub-Division
    ===================================================== */

    if (apiKey === "parent_division") {
      nextFilters = {
        ...nextFilters,
        subdivision: "",
      };
    }

    /*
      Update selected values immediately.
    */
    setSelectedFilters(nextFilters);

    /* =====================================================
       Refresh cascading API options
    ===================================================== */

    if (
      apiKey === "legal_group" ||
      apiKey === "legal_entity" ||
      apiKey === "parent_division" ||
      apiKey === "subdivision"
    ) {
      await loadOpexFilterOptions(
        nextFilters
      );
    }
  };

  /* =======================================================
     Reset
  ======================================================= */

  const handleReset = async () => {
    let resetFilters = {
      legal_group: "",
      legal_entity: "",
      parent_division: "",
      subdivision: "",
      currency: "",
      as_on_date: "",
      period: "",
      compare_with: "",
      reporting_currency: "AED",
    };

    /* =====================================================
       Existing/common pages

       KEEP EXISTING BEHAVIOR
    ===================================================== */

    if (!isOperatingExpenses) {
      resetFilters = {
        legal_group: "",
        legal_entity: "",
        parent_division: "",
        subdivision: "",
        currency: "",
        as_on_date:
          filterOptions?.as_on_dates?.[0] ||
          filterOptions?.available_dates?.[0] ||
          "",
        period: "",
        compare_with: "",
        reporting_currency: "AED",
      };
    }

    /* =====================================================
       Operating Expenses page
    ===================================================== */

    if (isOperatingExpenses) {
      /*
        Refresh OPEX filter options
        without hierarchy restrictions.
      */

      const normalized =
        await loadOpexFilterOptions({});

      const periods =
        normalized?.periods ||
        opexFilterOptions?.periods ||
        filterOptions?.periods ||
        [];

      const latestPeriod =
        getLatestPeriod(periods);

      resetFilters = {
        legal_group: "",
        legal_entity: "",
        parent_division: "",
        subdivision: "",
        currency: "",
        as_on_date: "",

        /*
          Latest available period from API.
        */
        period:
          latestPeriod || "",

        /*
          Compare With stays blank.
        */
        compare_with: "",

        /*
          Backend default currency.
        */
        reporting_currency:
          normalized
            ?.default_reporting_currency ||
          "AED",
      };
    }

    setSelectedFilters(resetFilters);

    if (onReset) {
      onReset();
    }
  };

  /* =======================================================
     Which Filters Should Be Displayed?
  ======================================================= */

  const filtersToDisplay =
    isOperatingExpenses
      ? [
          ...operatingSelectFilters,
          ...operatingAdditionalFilters,
        ]
      : commonSelectFilters;

  /* =======================================================
     OPTIONS TO RENDER

     OPEX:
       local API options

     Existing pages:
       parent filterOptions
  ======================================================= */

  const activeFilterOptions =
    isOperatingExpenses
      ? {
          ...filterOptions,
          ...opexFilterOptions,
        }
      : filterOptions;

  return (
    <div
      className="filter-bar"
      style={{
        display: "flex",
        gap: "10px",

        /*
          IMPORTANT:

          Existing/common pages:
          keep flexWrap exactly as before.

          OPEX:
          no wrapping so all 7 filters + buttons
          remain on one line.
        */
        flexWrap: isOperatingExpenses
          ? "nowrap"
          : "wrap",

        alignItems: "flex-end",
        width: "100%",

        /*
          Prevent children from forcing
          horizontal overflow.
        */
        minWidth: 0,
      }}
    >
      {/* ===================================================
          Dynamic Filters
      =================================================== */}

      {filtersToDisplay.map((f, i) => {
        const isPeriod =
          isOperatingExpenses &&
          f.apiKey === "period";

        const isReportingCurrency =
          isOperatingExpenses &&
          f.apiKey ===
            "reporting_currency";

        return (
          <FilterField
            key={`${f.apiKey}-${i}`}
            label={f.label}
            isOperatingExpenses={
              isOperatingExpenses
            }
          >
            <select
              className="filter-select w-full"
              value={
                selectedFilters[
                  f.apiKey
                ] || ""
              }
              /*
                IMPORTANT:
                We don't disable the dropdown while
                the API is loading.

                This avoids changing the visual
                appearance of the existing UI.
              */
              onChange={(e) => {
                const value =
                  e.target.value;

                if (
                  isOperatingExpenses
                ) {
                  handleOpexFilterChange(
                    f.apiKey,
                    value
                  );
                } else {
                  setSelectedFilters(
                    (prev) => ({
                      ...prev,
                      [f.apiKey]:
                        value,
                    })
                  );
                }
              }}
              style={{
                /*
                  Prevent select's content from
                  forcing the flex item wider.
                */
                minWidth: 0,
                width: "100%",
              }}
            >
              {/* =================================================
                  Common filters keep "All"

                  OPEX Period does NOT show "All"
              ================================================= */}

              {!isPeriod && (
                <option value="">
                  All
                </option>
              )}

              {/* =================================================
                  Reporting Currency

                  AED fallback if API currencies
                  are not available.
              ================================================= */}

              {isReportingCurrency &&
                !activeFilterOptions
                  ?.currencies
                  ?.length && (
                  <option value="AED">
                    AED
                  </option>
                )}

              {/* =================================================
                  Backend Options
              ================================================= */}

              {activeFilterOptions?.[
                f.optionKey
              ]?.map(
                (item, index) => {
                  const value =
                    getOptionValue(
                      item
                    );

                  const label =
                    getOptionLabel(
                      item
                    );

                  /*
                    Ignore malformed empty
                    API options.
                  */
                  if (
                    value === "" ||
                    value === null ||
                    value === undefined
                  ) {
                    return null;
                  }

                  return (
                    <option
                      key={`${value}-${index}`}
                      value={value}
                    >
                      {label}
                    </option>
                  );
                }
              )}
            </select>
          </FilterField>
        );
      })}

      {/* ===================================================
          Currency + As On Date

          Existing pages ONLY.

          OPEX does NOT render these.
      =================================================== */}

      {!isOperatingExpenses && (
        <>
          <FilterField label="As On Date">
            <input
              type="text"
              value={
                selectedFilters
                  .as_on_date
              }
              readOnly
              className="w-full h-8 text-[10px] font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md px-2"
            />
          </FilterField>
        </>
      )}

      {/* ===================================================
          Buttons
      =================================================== */}

      <div
        style={{
          display: "flex",
          gap: "8px",

          /*
            Existing behavior preserved.
          */
          marginLeft: "auto",

          /*
            Important for OPEX:
            buttons should not shrink or wrap.
          */
          flexShrink: 0,
        }}
      >
        <button
          className="btn btn-primary"
          onClick={() =>
            onApply &&
            onApply(
              selectedFilters
            )
          }
        >
          Apply
        </button>

        <button
          className="btn btn-ghost"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}