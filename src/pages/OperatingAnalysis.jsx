
// // import React from "react";
// // import { useState } from "react";
// // import ExportButtons from "../components/Common/ExportButtons";
// // import PageHeader from "../components/Common/PageHeader";
// // import FooterNote from "../components/FooterNote";
// // import Filters from "../components/Filters/Filters";
// // import KPICards from "../components/Cards/KPICards";
// // import {
// //     LineChart,
// //     Target,
// //     TrendingUp,
// //     Percent,
// //     BarChart3,
// //     ChartNoAxesColumnIncreasing
// // } from "lucide-react";
// // import {
// //     IoTrendingUpOutline,
// //     IoFlashOutline,
// // } from "react-icons/io5";
// // import ActualVsTargetChart from "../components/Charts/ActualvsTargetChart";
// // import OpexCompositionChart from "../components/Charts/OpexCompositionChart";
// // import ExpenseCategoryDrillDown from "../components/Tables/ExpenseCategoryDrillDown";
// // import MonthOnMonthOpexReport from "../components/Tables/MonthOnMonthOpexReport";
// // import OperatingExpenseSummary from "../components/Cards/OperatingExpenseSummary";

// // export default function OperatingAnalysis() {

// //     const dataAsOf = "2026-09-03";
// //     const currentMonthPartial = true;

// //     const [filterOptions, setFilterOptions] = useState({
// //         as_on_dates: [],
// //         currencies: [],
// //         legal_groups: [],
// //         legal_entities: [],
// //         parent_divisions: [],
// //         subdivisions: [],
// //     });

// //     const [exporting, setExporting] = useState("");
// //     const [loading, setLoading] = useState(true);



// //     /* =========================================================
// //       Fetch Filters from Backend  
// //     ========================================================= */

// //     const loadFilterOptions = async () => {
// //         try {
// //             setLoading(true);

// //             const response = await getOpexFilterOptions();

// //             const data = response?.data || {};

// //             setFilterOptions(data);

// //             const latestPeriod = getLatestPeriod(data.periods);

// //             setSelectedFilters((prev) => ({
// //                 ...prev,
// //                 period: latestPeriod,
// //                 reporting_currency:
// //                     data.default_reporting_currency || "AED",
// //             }));
// //         } catch (error) {
// //             console.error("Failed to load OPEX filter options", error);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };



// //     /* =========================================================
// //        MOCK CATEGORY STRUCTURE
// //        Target/variance are intentionally unavailable until API
// //        integration.
// //     ========================================================= */

// //     const actualVsTargetData = [
// //         {
// //             category: "Employee Cost",
// //             actual: null,
// //             target: null,
// //         },
// //         {
// //             category: "Administration Expense",
// //             actual: null,
// //             target: null,
// //         },
// //         {
// //             category: "Sales & Distribution Expense",
// //             actual: null,
// //             target: null,
// //         },
// //         {
// //             category: "Rent",
// //             actual: null,
// //             target: null,
// //         },
// //         {
// //             category: "Utilities & Office",
// //             actual: null,
// //             target: null,
// //         },
// //         {
// //             category: "Depreciation",
// //             actual: null,
// //             target: null,
// //         },
// //         {
// //             category: "Finance Cost",
// //             actual: null,
// //             target: null,
// //         },
// //     ];

// //     /* =========================================================
// //        OPEX COMPOSITION
// //        Empty until backend integration
// //     ========================================================= */

// //     const opexcompositiondata = [];

// //     /* =========================================================
// //        EXPENSE CATEGORY DRILLDOWN
// //        Empty until backend integration
// //     ========================================================= */

// //     const ExpenseCategoryDrilldowndata = [];

// //     /* =========================================================
// //        MONTH-ON-MONTH
// //        Empty until backend integration
// //     ========================================================= */

// //     const monthOnMonthOpexData = [];

// //     useEffect(() => {
// //         loadFilterOptions();
// //     }, []);

// //     return (
// //         <div className="page-content relative">

// //             <PageHeader
// //                 title="Operating Expenses Analysis"
// //                 subtitle="Detailed Operating expense performance and variance analysis across divisions."
// //             >
// //                 <ExportButtons
// //                     endpoint="operatinganalysis"
// //                     exporting={exporting}
// //                 />
// //             </PageHeader>

// //             {/* Main Content */}

// //             <div className="flex flex-col gap-2">

// //                 {/* Filters */}

// //                 <div className="top-0 z-30 bg-white py-2">
// //                     <Filters
// //                         filterOptions={filterOptions}
// //                         isOperatingExpenses={true}
// //                     />
// //                 </div>

// //                 {/* Operating Expense Summary */}

// //                 <OperatingExpenseSummary
// //                     data={{
// //                         actualPTD: 9.84,

// //                         // Target not integrated yet
// //                         targetPTD: null,

// //                         // Variance not available without target
// //                         variancePTD: null,
// //                         variancePTDPercent: null,

// //                         actualYTD: 74.60,

// //                         // Target not integrated yet
// //                         targetYTD: null,
// //                     }}
// //                 />

// //                 {/* Chart Section */}

// //                 <div className="grid grid-cols-16 gap-3 mt-3">

// //                     {/* Actual vs Target */}

// //                     <div className="col-span-8">
// //                         <ActualVsTargetChart
// //                             data={actualVsTargetData}
// //                         />
// //                     </div>

// //                     {/* OPEX Composition */}

// //                     <div className="col-span-8">
// //                         <OpexCompositionChart
// //                             data={opexcompositiondata}
// //                         />
// //                     </div>

// //                 </div>

// //                 {/* Expense Category Drill Down */}

// //                 <ExpenseCategoryDrillDown
// //                     data={ExpenseCategoryDrilldowndata}
// //                     dataAsOf={dataAsOf}
// //                     currentMonthPartial={currentMonthPartial}
// //                 />

// //                 {/* Month on Month */}

// //                 <MonthOnMonthOpexReport
// //                     data={monthOnMonthOpexData}
// //                 />

// //             </div>

// //             {/* Footer */}

// //             <div className="fixed bottom-0 left-58 right-2 z-50 bg-white border-t border-gray-200 p-2">
// //                 <FooterNote
// //                     title="Note:"
// //                     message="All values are in AED | ☁️ Source: Oracle Fusion Cloud"
// //                     showRefresh={false}
// //                 />
// //             </div>

// //         </div>
// //     );
// // }

// import React, { useEffect, useState } from "react";

// import ExportButtons from "../components/Common/ExportButtons";
// import PageHeader from "../components/Common/PageHeader";
// import FooterNote from "../components/FooterNote";
// import Filters from "../components/Filters/Filters";

// import ActualVsTargetChart from "../components/Charts/ActualvsTargetChart";
// import OpexCompositionChart from "../components/Charts/OpexCompositionChart";
// import ExpenseCategoryDrillDown from "../components/Tables/ExpenseCategoryDrillDown";
// import MonthOnMonthOpexReport from "../components/Tables/MonthOnMonthOpexReport";
// import OperatingExpenseSummary from "../components/Cards/OperatingExpenseSummary";

// import {
//     getOpexFilterOptions,
//     getOpexSummary,
//     getOpexCategoryComparison,
//     getOpexComposition,
//     getOpexCategoryBreakdown,
//     getOpexMonthly,
//     getOpexCategoryDetail,
// } from "../api/opexApi";

// /* =========================================================
//    HELPER
//    Convert amount to millions for existing chart UI.

//    This is display formatting only.
//    No financial calculation is performed.
// ========================================================= */

// const toMillions = (value) => {
//     if (value === null || value === undefined || value === "") {
//         return null;
//     }

//     const number = Number(value);

//     if (!Number.isFinite(number)) {
//         return null;
//     }

//     return number / 1000000;
// };


// /* =========================================================
//    HELPER
//    Extract option value from backend option.
// ========================================================= */

// const getOptionValue = (option) => {
//     if (option === null || option === undefined) {
//         return "";
//     }

//     if (typeof option === "object") {
//         return (
//             option.value ??
//             option.id ??
//             option.code ??
//             option.period_name ??
//             option.name ??
//             ""
//         );
//     }

//     return option;
// };


// /* =========================================================
//    GET LATEST PERIOD
// ========================================================= */

// const getLatestPeriod = (periods = []) => {
//     if (!Array.isArray(periods) || periods.length === 0) {
//         return "";
//     }

//     const latest = periods[periods.length - 1];

//     return getOptionValue(latest);
// };


// /* =========================================================
//    MAP UI FILTERS → BACKEND FILTERS
// ========================================================= */

// const buildApiFilters = (selectedFilters = {}) => {
//     return {
//         legal_group_id:
//             selectedFilters.legal_group || undefined,

//         legal_entity_id:
//             selectedFilters.legal_entity || undefined,

//         parent_division_id:
//             selectedFilters.parent_division || undefined,

//         subdivision_id:
//             selectedFilters.subdivision || undefined,

//         period_name:
//             selectedFilters.period || undefined,

//         compare_period_name:
//             selectedFilters.compare_with || undefined,

//         reporting_currency:
//             selectedFilters.reporting_currency || "AED",
//     };
// };


// export default function OperatingAnalysis() {

//     /* =========================================================
//        DATA AS OF
//     ========================================================= */

//     const [dataAsOf, setDataAsOf] = useState(null);


//     /* =========================================================
//        CURRENT MONTH PARTIAL
//     ========================================================= */

//     const [currentMonthPartial] = useState(true);


//     /* =========================================================
//        FILTER OPTIONS
//     ========================================================= */

//     const [filterOptions, setFilterOptions] = useState({
//         as_on_dates: [],
//         currencies: [],
//         legal_groups: [],
//         legal_entities: [],
//         parent_divisions: [],
//         subdivisions: [],
//         periods: [],
//         compare_with: [],
//     });


//     /* =========================================================
//        DASHBOARD DATA
//     ========================================================= */

//     const [summaryData, setSummaryData] = useState({
//         actualPTD: null,
//         targetPTD: null,
//         variancePTD: null,
//         variancePTDPercent: null,
//         actualYTD: null,
//         targetYTD: null,
//         varianceYTD: null,
//         varianceYTDPercent: null,
//     });


//     const [actualVsTargetData, setActualVsTargetData] =
//         useState([]);


//     const [opexCompositionData, setOpexCompositionData] =
//         useState([]);


//     const [expenseCategoryDrilldownData, setExpenseCategoryDrilldownData] =
//         useState([]);


//     const [monthOnMonthOpexData, setMonthOnMonthOpexData] =
//         useState([]);


//     /* =========================================================
//        UI STATE
//     ========================================================= */

//     const [exporting, setExporting] = useState("");

//     const [loading, setLoading] = useState(true);

//     const [dashboardLoading, setDashboardLoading] =
//         useState(false);

//     const [error, setError] = useState("");
//     const [detailLoading, setDetailLoading] = useState({});
//     const [activeOpexFilters, setActiveOpexFilters] = useState({});


//     /* =========================================================
//     CATEGORY DETAIL

//     Lazy loaded only when a category is expanded.

//     GET /api/opex/category-detail
//  ========================================================= */

//     const handleExpandCategory = async (item) => {
//         const category = item?.category;

//         if (!category) {
//             return;
//         }

//         /*
//           Do not call the API again if details
//           have already been loaded.
//         */
//         const existingDetails =
//             item?.categoryDetails ||
//             item?.naturalAccounts ||
//             item?.details;

//         if (Array.isArray(existingDetails)) {
//             return;
//         }

//         try {
//             setDetailLoading((prev) => ({
//                 ...prev,
//                 [category]: true,
//             }));

//             const apiFilters =
//                 buildApiFilters(
//                     activeOpexFilters
//                 );

//             const response =
//                 await getOpexCategoryDetail({
//                     category,
//                     ...apiFilters,
//                 });

//             const details =
//                 Array.isArray(response)
//                     ? response
//                     : response?.items ||
//                     response?.accounts ||
//                     response?.natural_accounts ||
//                     response?.details ||
//                     [];

//             setExpenseCategoryDrilldownData((prev) =>
//                 prev.map((row) =>
//                     row?.category === category
//                         ? {
//                             ...row,
//                             categoryDetails: details,
//                         }
//                         : row
//                 )
//             );
//         } catch (error) {
//             console.error(
//                 `Failed to load category details for ${category}:`,
//                 error
//             );

//             setError(
//                 error?.message ||
//                 `Failed to load details for ${category}.`
//             );
//         } finally {
//             setDetailLoading((prev) => ({
//                 ...prev,
//                 [category]: false,
//             }));
//         }
//     };
//     /* =========================================================
//        LOAD DASHBOARD APIs
//     ========================================================= */

//     const loadDashboardData = async (selectedFilters) => {

//         if (!selectedFilters?.period) {
//             console.warn(
//                 "OPEX dashboard skipped: period_name is missing."
//             );

//             return;
//         }


//         try {

//             setDashboardLoading(true);

//             setError("");


//             const apiFilters =
//                 buildApiFilters(selectedFilters);


//             console.log(
//                 "OPEX API filters:",
//                 apiFilters
//             );


//             /* =====================================================
//                CALL ALL 5 DASHBOARD APIs IN PARALLEL
//             ===================================================== */

//             const [
//                 summaryResponse,
//                 categoryComparisonResponse,
//                 compositionResponse,
//                 categoryBreakdownResponse,
//                 monthlyResponse,
//             ] = await Promise.all([

//                 getOpexSummary(apiFilters),

//                 getOpexCategoryComparison(
//                     apiFilters
//                 ),

//                 getOpexComposition(
//                     apiFilters
//                 ),

//                 getOpexCategoryBreakdown(
//                     apiFilters
//                 ),

//                 getOpexMonthly(
//                     apiFilters
//                 ),

//             ]);


//             /* =====================================================
//                SUMMARY
//             ===================================================== */

//             const summary =
//                 summaryResponse || {};


//             setSummaryData({

//                 actualPTD:
//                     summary.actual_ptd_aed ??
//                     summary.actual_ptd ??
//                     null,

//                 targetPTD:
//                     summary.target_ptd_aed ??
//                     summary.target_ptd ??
//                     null,

//                 variancePTD:
//                     summary.variance_ptd_aed ??
//                     summary.variance_ptd ??
//                     null,

//                 variancePTDPercent:
//                     summary.variance_ptd_pct ??
//                     null,

//                 actualYTD:
//                     summary.actual_ytd_aed ??
//                     summary.actual_ytd ??
//                     null,

//                 targetYTD:
//                     summary.target_ytd_aed ??
//                     summary.target_ytd ??
//                     null,

//                 varianceYTD:
//                     summary.variance_ytd_aed ??
//                     summary.variance_ytd ??
//                     null,

//                 varianceYTDPercent:
//                     summary.variance_ytd_pct ??
//                     null,

//             });


//             /* =====================================================
//                ACTUAL VS TARGET
//             ===================================================== */

//             const comparison =
//                 Array.isArray(categoryComparisonResponse)
//                     ? categoryComparisonResponse
//                     : categoryComparisonResponse?.items ||
//                     categoryComparisonResponse?.categories ||
//                     [];


//             setActualVsTargetData(
//                 comparison.map((item) => ({
//                     category:
//                         item.category ?? "",

//                     actual:
//                         toMillions(
//                             item.actual_ptd
//                         ),

//                     target:
//                         toMillions(
//                             item.target_ptd
//                         ),
//                 }))
//             );


//             /* =====================================================
//                OPEX COMPOSITION
//             ===================================================== */

//             const composition =
//                 Array.isArray(compositionResponse)
//                     ? compositionResponse
//                     : compositionResponse?.items ||
//                     compositionResponse?.categories ||
//                     [];


//             setOpexCompositionData(
//                 composition.map((item) => ({
//                     name:
//                         item.category ?? "",

//                     value:
//                         toMillions(
//                             item.amount
//                         ),

//                     percentage:
//                         item.percentage ??
//                         null,
//                 }))
//             );


//             /* =====================================================
//                CATEGORY BREAKDOWN
//             ===================================================== */

//             const breakdown =
//                 Array.isArray(categoryBreakdownResponse)
//                     ? categoryBreakdownResponse
//                     : categoryBreakdownResponse?.items ||
//                     categoryBreakdownResponse?.categories ||
//                     [];


//             setExpenseCategoryDrilldownData(
//                 breakdown
//             );


//             /* =====================================================
//                MONTHLY
//             ===================================================== */

//             const monthly =
//                 Array.isArray(monthlyResponse)
//                     ? monthlyResponse
//                     : monthlyResponse?.items ||
//                     monthlyResponse?.months ||
//                     [];


//             setMonthOnMonthOpexData(
//                 monthly
//             );


//             /* =====================================================
//                DATA AS OF

//                Summary can also contain data_as_of.
//             ===================================================== */

//             if (summary.data_as_of) {
//                 setDataAsOf(
//                     summary.data_as_of
//                 );
//             }


//         } catch (error) {

//             console.error(
//                 "Failed to load OPEX dashboard data:",
//                 error
//             );

//             setError(
//                 error?.message ||
//                 "Failed to load OPEX dashboard data."
//             );

//             /* =====================================================
//                Keep API-null behaviour.
//                Do NOT put mock values here.
//             ===================================================== */

//             setSummaryData({
//                 actualPTD: null,
//                 targetPTD: null,
//                 variancePTD: null,
//                 variancePTDPercent: null,
//                 actualYTD: null,
//                 targetYTD: null,
//                 varianceYTD: null,
//                 varianceYTDPercent: null,
//             });

//             setActualVsTargetData([]);

//             setOpexCompositionData([]);

//             setExpenseCategoryDrilldownData([]);

//             setMonthOnMonthOpexData([]);

//         } finally {

//             setDashboardLoading(false);

//         }
//     };


//     /* =========================================================
//        LOAD FILTER OPTIONS
//     ========================================================= */

//     const loadFilterOptions = async () => {

//         try {

//             setLoading(true);

//             setError("");


//             const response =
//                 await getOpexFilterOptions();


//             /*
//               IMPORTANT:

//               opexApi.js already unwraps response.data.

//               Therefore DO NOT use:

//                   response?.data

//               here.
//             */

//             const data =
//                 response || {};


//             const periods =
//                 data.periods || [];


//             const latestPeriod =
//                 getLatestPeriod(periods);


//             setFilterOptions({

//                 as_on_dates:
//                     data.as_on_dates || [],

//                 currencies:
//                     data.currencies || [],

//                 legal_groups:
//                     data.legal_groups || [],

//                 legal_entities:
//                     data.legal_entities || [],

//                 parent_divisions:
//                     data.parent_divisions || [],

//                 subdivisions:
//                     data.subdivisions || [],

//                 periods,

//                 compare_with:
//                     data.compare_with ||
//                     data.compare_periods ||
//                     [],

//                 default_reporting_currency:
//                     data.default_reporting_currency ||
//                     data.reporting_currency ||
//                     "AED",

//             });


//             /* =====================================================
//                DATA AS OF
//             ===================================================== */

//             setDataAsOf(
//                 data.data_as_of || null
//             );


//             /* =====================================================
//                INITIAL DASHBOARD LOAD

//                API contract says period is required.

//                Therefore use latest available period.
//             ===================================================== */

//             if (latestPeriod) {

//                 await loadDashboardData({

//                     legal_group: "",

//                     legal_entity: "",

//                     parent_division: "",

//                     subdivision: "",

//                     period:
//                         latestPeriod,

//                     compare_with: "",

//                     reporting_currency:
//                         data.default_reporting_currency ||
//                         "AED",

//                 });

//             } else {

//                 console.warn(
//                     "No OPEX period returned by filter-options API."
//                 );

//             }

//         } catch (error) {

//             console.error(
//                 "Failed to load OPEX filter options:",
//                 error
//             );

//             setError(
//                 error?.message ||
//                 "Failed to load OPEX filter options."
//             );

//         } finally {

//             setLoading(false);

//         }

//     };


//     /* =========================================================
//        INITIAL LOAD
//     ========================================================= */

//     useEffect(() => {

//         loadFilterOptions();

//     }, []);


//     /* =========================================================
//        APPLY FILTERS
//     ========================================================= */

//     const handleApplyFilters = async (
//         selectedFilters
//     ) => {

//         console.log(
//             "OPEX filters applied:",
//             selectedFilters
//         );

//         setActiveOpexFilters(
//             selectedFilters
//         );

//         await loadDashboardData(
//             selectedFilters
//         );
//     };

//     /* =========================================================
//        RESET FILTERS
//     ========================================================= */

//     const handleResetFilters = async () => {

//         const latestPeriod =
//             getLatestPeriod(
//                 filterOptions.periods
//             );

//         if (!latestPeriod) {
//             return;
//         }

//         const resetFilters = {
//             legal_group: "",
//             legal_entity: "",
//             parent_division: "",
//             subdivision: "",
//             period: latestPeriod,
//             compare_with: "",
//             reporting_currency:
//                 filterOptions.default_reporting_currency ||
//                 "AED",
//         };

//         setActiveOpexFilters(
//             resetFilters
//         );

//         setDetailLoading({});

//         await loadDashboardData(
//             resetFilters
//         );
//     };

//     return (
//         <div className="page-content relative">

//             <PageHeader
//                 title="Operating Expenses Analysis"
//                 subtitle="Detailed Operating expense performance and variance analysis across divisions."
//             >

//                 <ExportButtons
//                     endpoint="operatinganalysis"
//                     exporting={exporting}
//                 />

//             </PageHeader>


//             {/* =====================================================
//                 MAIN CONTENT
//             ===================================================== */}

//             <div className="flex flex-col gap-2">


//                 {/* =================================================
//                     FILTERS
//                 ================================================= */}

//                 <div className="top-0 z-30 bg-white py-2">

//                     <Filters
//                         filterOptions={
//                             filterOptions
//                         }

//                         onApply={
//                             handleApplyFilters
//                         }

//                         onReset={
//                             handleResetFilters
//                         }

//                         isOperatingExpenses={
//                             true
//                         }
//                     />

//                 </div>


//                 {/* =================================================
//                     ERROR
//                 ================================================= */}

//                 {error && (
//                     <div
//                         style={{
//                             padding: "8px 12px",
//                             borderRadius: "6px",
//                             background: "#fff7ed",
//                             border: "1px solid #fed7aa",
//                             color: "#c2410c",
//                             fontSize: "12px",
//                         }}
//                     >
//                         {error}
//                     </div>
//                 )}


//                 {/* =================================================
//                     OPERATING EXPENSE SUMMARY
//                 ================================================= */}

//                 <OperatingExpenseSummary
//                     data={summaryData}
//                 />


//                 {/* =================================================
//                     CHART SECTION
//                 ================================================= */}

//                 <div className="grid grid-cols-16 gap-3 mt-3">


//                     {/* =================================================
//                         ACTUAL VS TARGET
//                     ================================================= */}

//                     <div className="col-span-8">

//                         <ActualVsTargetChart
//                             data={
//                                 actualVsTargetData
//                             }
//                         />

//                     </div>


//                     {/* =================================================
//                         OPEX COMPOSITION
//                     ================================================= */}

//                     <div className="col-span-8">

//                         <OpexCompositionChart
//                             data={
//                                 opexCompositionData
//                             }
//                         />

//                     </div>

//                 </div>


//                 {/* =================================================
//                     EXPENSE CATEGORY DRILL DOWN
//                 ================================================= */}

//                 <ExpenseCategoryDrillDown
//                     data={
//                         expenseCategoryDrilldownData
//                     }

//                     dataAsOf={
//                         dataAsOf
//                     }

//                     currentMonthPartial={
//                         currentMonthPartial
//                     }
//                 />


//                 {/* =================================================
//                     MONTH ON MONTH
//                 ================================================= */}

//                 <MonthOnMonthOpexReport
//                     data={
//                         monthOnMonthOpexData
//                     }
//                 />

//             </div>


//             {/* =====================================================
//                 FOOTER
//             ===================================================== */}

//             <div className="fixed bottom-0 left-58 right-2 z-50 bg-white border-t border-gray-200 p-2">

//                 <FooterNote
//                     title="Note:"
//                     message="All values are in AED | ☁️ Source: Oracle Fusion Cloud"
//                     showRefresh={false}
//                 />

//             </div>

//         </div>
//     );
// }

import React, { useEffect, useState } from "react";

import ExportButtons from "../components/Common/ExportButtons";
import PageHeader from "../components/Common/PageHeader";
import FooterNote from "../components/FooterNote";
import Filters from "../components/Filters/Filters";

import ActualVsTargetChart from "../components/Charts/ActualvsTargetChart";
import OpexCompositionChart from "../components/Charts/OpexCompositionChart";
import ExpenseCategoryDrillDown from "../components/Tables/ExpenseCategoryDrillDown";
import MonthOnMonthOpexReport from "../components/Tables/MonthOnMonthOpexReport";
import OperatingExpenseSummary from "../components/Cards/OperatingExpenseSummary";

import {
    getOpexFilterOptions,
    getOpexSummary,
    getOpexCategoryComparison,
    getOpexComposition,
    getOpexCategoryBreakdown,
    getOpexMonthly,
    getOpexCategoryDetail,
} from "../api/opexApi";


/* =========================================================
   HELPER
   Convert amount to millions for existing chart UI.

   This is display formatting only.
   No financial calculation is performed.
========================================================= */

const toMillions = (value) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return null;
    }

    return number / 1000000;
};


/* =========================================================
   HELPER
   Extract option value from backend option.
========================================================= */

const getOptionValue = (option) => {
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
            ""
        );
    }

    return option;
};


/* =========================================================
   GET LATEST PERIOD
========================================================= */

const getLatestPeriod = (periods = []) => {
    if (!Array.isArray(periods) || periods.length === 0) {
        return "";
    }

    const latest = periods[periods.length - 1];

    return getOptionValue(latest);
};


/* =========================================================
   MAP UI FILTERS → BACKEND FILTERS
========================================================= */

const buildApiFilters = (selectedFilters = {}) => {
    return {
        legal_group_id:
            selectedFilters.legal_group || undefined,

        legal_entity_id:
            selectedFilters.legal_entity || undefined,

        parent_division_id:
            selectedFilters.parent_division || undefined,

        subdivision_id:
            selectedFilters.subdivision || undefined,

        period_name:
            selectedFilters.period || undefined,

        compare_period_name:
            selectedFilters.compare_with || undefined,

        reporting_currency:
            selectedFilters.reporting_currency || "AED",
    };
};


export default function OperatingAnalysis() {

    /* =========================================================
       DATA AS OF
    ========================================================= */

    const [dataAsOf, setDataAsOf] = useState(null);


    /* =========================================================
       CURRENT MONTH PARTIAL
    ========================================================= */

    const [currentMonthPartial] = useState(true);


    /* =========================================================
       FILTER OPTIONS
    ========================================================= */

    const [filterOptions, setFilterOptions] = useState({
        as_on_dates: [],
        currencies: [],
        legal_groups: [],
        legal_entities: [],
        parent_divisions: [],
        subdivisions: [],
        periods: [],
        compare_with: [],
    });


    /* =========================================================
       DASHBOARD DATA
    ========================================================= */

    const [summaryData, setSummaryData] = useState({
        actualPTD: null,
        targetPTD: null,
        variancePTD: null,
        variancePTDPercent: null,
        actualYTD: null,
        targetYTD: null,
        varianceYTD: null,
        varianceYTDPercent: null,
    });


    const [actualVsTargetData, setActualVsTargetData] =
        useState([]);


    const [opexCompositionData, setOpexCompositionData] =
        useState([]);


    const [expenseCategoryDrilldownData, setExpenseCategoryDrilldownData] =
        useState([]);


    const [monthOnMonthOpexData, setMonthOnMonthOpexData] =
        useState([]);


    /* =========================================================
       UI STATE
    ========================================================= */

    const [exporting, setExporting] = useState("");

    const [loading, setLoading] = useState(true);

    const [dashboardLoading, setDashboardLoading] =
        useState(false);

    const [error, setError] = useState("");

    /* =========================================================
       CATEGORY DETAIL LOADING
    ========================================================= */

    const [detailLoading, setDetailLoading] = useState({});


    /* =========================================================
       ACTIVE OPEX FILTERS

       Used by category-detail API so that the expanded
       category uses the currently applied dashboard filters.
    ========================================================= */

    const [activeOpexFilters, setActiveOpexFilters] =
        useState({});


    /* =========================================================
       CATEGORY DETAIL

       Lazy loaded only when a category is expanded.

       GET /api/opex/category-detail
    ========================================================= */

    const handleExpandCategory = async (item) => {

        const category = item?.category;

        if (!category) {
            return;
        }


        /*
          Do not call the API again if details
          have already been loaded.
        */

        const existingDetails =
            item?.categoryDetails ||
            item?.naturalAccounts ||
            item?.details;

        if (Array.isArray(existingDetails)) {
            return;
        }


        try {

            setDetailLoading((prev) => ({
                ...prev,
                [category]: true,
            }));


            /*
              Use the currently active dashboard filters.
            */

            const apiFilters =
                buildApiFilters(
                    activeOpexFilters
                );


            /*
              Call category-detail only when
              the category is expanded.
            */

            const response =
                await getOpexCategoryDetail({
                    category,
                    ...apiFilters,
                });


            /*
              opexApi.js already unwraps response.data.
            */

            const details =
                Array.isArray(response)
                    ? response
                    : response?.items ||
                    response?.accounts ||
                    response?.natural_accounts ||
                    response?.details ||
                    [];


            /*
              Attach the API details to the matching
              category row.

              ExpenseCategoryDrillDown already supports
              categoryDetails.
            */

            setExpenseCategoryDrilldownData((prev) =>
                prev.map((row) =>
                    row?.category === category
                        ? {
                            ...row,
                            categoryDetails: details,
                        }
                        : row
                )
            );

        } catch (error) {

            console.error(
                `Failed to load category details for ${category}:`,
                error
            );


            setError(
                error?.message ||
                `Failed to load details for ${category}.`
            );

        } finally {

            setDetailLoading((prev) => ({
                ...prev,
                [category]: false,
            }));

        }
    };


    /* =========================================================
       LOAD DASHBOARD APIs
    ========================================================= */

    const loadDashboardData = async (selectedFilters) => {

        if (!selectedFilters?.period) {

            console.warn(
                "OPEX dashboard skipped: period_name is missing."
            );

            return;
        }


        try {

            setDashboardLoading(true);

            setError("");


            const apiFilters =
                buildApiFilters(selectedFilters);


            console.log(
                "OPEX API filters:",
                apiFilters
            );


            /* =====================================================
               CALL ALL 5 DASHBOARD APIs IN PARALLEL
            ===================================================== */

            const [
                summaryResponse,
                categoryComparisonResponse,
                compositionResponse,
                categoryBreakdownResponse,
                monthlyResponse,
            ] = await Promise.all([

                getOpexSummary(apiFilters),

                getOpexCategoryComparison(
                    apiFilters
                ),

                getOpexComposition(
                    apiFilters
                ),

                getOpexCategoryBreakdown(
                    apiFilters
                ),

                getOpexMonthly(
                    apiFilters
                ),

            ]);


            /* =====================================================
               SUMMARY
            ===================================================== */

            const summary =
                summaryResponse || {};


            setSummaryData({

                actualPTD:
                    summary.actual_ptd_aed ??
                    summary.actual_ptd ??
                    null,

                targetPTD:
                    summary.target_ptd_aed ??
                    summary.target_ptd ??
                    null,

                variancePTD:
                    summary.variance_ptd_aed ??
                    summary.variance_ptd ??
                    null,

                variancePTDPercent:
                    summary.variance_ptd_pct ??
                    null,

                actualYTD:
                    summary.actual_ytd_aed ??
                    summary.actual_ytd ??
                    null,

                targetYTD:
                    summary.target_ytd_aed ??
                    summary.target_ytd ??
                    null,

                varianceYTD:
                    summary.variance_ytd_aed ??
                    summary.variance_ytd ??
                    null,

                varianceYTDPercent:
                    summary.variance_ytd_pct ??
                    null,

            });


            /* =========================================================
    ACTUAL VS TARGET DATA
 ========================================================= */

            const comparison =
                Array.isArray(categoryComparisonResponse)
                    ? categoryComparisonResponse
                    : categoryComparisonResponse?.items ||
                    categoryComparisonResponse?.categories ||
                    [];

            /*
             * API response:
             *
             * actual_ptd_aed
             * target_ptd_aed
             *
             * Chart expects:
             *
             * actual
             * target
             *
             * Do NOT convert to millions here.
             * The chart UI is Amount (AED).
             */

            setActualVsTargetData(
                comparison.map((item) => ({
                    category: item?.category ?? "",

                    actual:
                        item?.actual_ptd_aed !== null &&
                            item?.actual_ptd_aed !== undefined
                            ? Number(item.actual_ptd_aed)
                            : null,

                    target:
                        item?.target_ptd_aed !== null &&
                            item?.target_ptd_aed !== undefined
                            ? Number(item.target_ptd_aed)
                            : null,
                }))
            );


            /* ===================================================== 
    OPEX COMPOSITION 
 ===================================================== */

            const composition =
                Array.isArray(compositionResponse)
                    ? compositionResponse
                    : compositionResponse?.items ||
                    compositionResponse?.categories ||
                    [];

            setOpexCompositionData(
                composition.map((item) => ({
                    name: item?.category ?? "",

                    value:
                        item?.amount_aed !== null &&
                            item?.amount_aed !== undefined
                            ? Number(item.amount_aed)
                            : item?.amount !== null &&
                                item?.amount !== undefined
                                ? Number(item.amount)
                                : null,

                    percentage:
                        item?.percentage !== null &&
                            item?.percentage !== undefined &&
                            item?.percentage !== ""
                            ? Number(item.percentage)
                            : null,
                }))
            );


            /* =====================================================
               CATEGORY BREAKDOWN
            ===================================================== */

            const breakdown =
                Array.isArray(categoryBreakdownResponse)
                    ? categoryBreakdownResponse
                    : categoryBreakdownResponse?.items ||
                    categoryBreakdownResponse?.categories ||
                    [];


            setExpenseCategoryDrilldownData(
                breakdown
            );


            /* =====================================================
               MONTHLY
            ===================================================== */



            const monthly =
                Array.isArray(monthlyResponse)
                    ? monthlyResponse
                    : monthlyResponse?.items ||
                    monthlyResponse?.months ||
                    [];


            setMonthOnMonthOpexData(
                monthly
            );


            /* =====================================================
               DATA AS OF

               Summary can also contain data_as_of.
            ===================================================== */

            if (summary.data_as_of) {

                setDataAsOf(
                    summary.data_as_of
                );

            }


        } catch (error) {

            console.error(
                "Failed to load OPEX dashboard data:",
                error
            );


            setError(
                error?.message ||
                "Failed to load OPEX dashboard data."
            );


            /* =====================================================
               Keep API-null behaviour.
               Do NOT put mock values here.
            ===================================================== */

            setSummaryData({
                actualPTD: null,
                targetPTD: null,
                variancePTD: null,
                variancePTDPercent: null,
                actualYTD: null,
                targetYTD: null,
                varianceYTD: null,
                varianceYTDPercent: null,
            });


            setActualVsTargetData([]);

            setOpexCompositionData([]);

            setExpenseCategoryDrilldownData([]);

            setMonthOnMonthOpexData([]);

        } finally {

            setDashboardLoading(false);

        }
    };


    /* =========================================================
       LOAD FILTER OPTIONS
    ========================================================= */

    const loadFilterOptions = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await getOpexFilterOptions();


            /*
              IMPORTANT:

              opexApi.js already unwraps response.data.

              Therefore DO NOT use:

                  response?.data

              here.
            */

            const data =
                response || {};


            const periods =
                data.periods || [];


            const latestPeriod =
                getLatestPeriod(periods);


            setFilterOptions({

                as_on_dates:
                    data.as_on_dates || [],

                currencies:
                    data.currencies || [],

                legal_groups:
                    data.legal_groups || [],

                legal_entities:
                    data.legal_entities || [],

                parent_divisions:
                    data.parent_divisions || [],

                subdivisions:
                    data.subdivisions || [],

                periods,

                compare_with:
                    data.compare_with ||
                    data.compare_periods ||
                    [],

                default_reporting_currency:
                    data.default_reporting_currency ||
                    data.reporting_currency ||
                    "AED",

            });


            /* =====================================================
               DATA AS OF
            ===================================================== */

            setDataAsOf(
                data.data_as_of || null
            );


            /* =====================================================
               INITIAL DASHBOARD LOAD

               API contract says period is required.

               Therefore use latest available period.
            ===================================================== */

            if (latestPeriod) {

                const initialFilters = {

                    legal_group: "",

                    legal_entity: "",

                    parent_division: "",

                    subdivision: "",

                    period:
                        latestPeriod,

                    compare_with: "",

                    reporting_currency:
                        data.default_reporting_currency ||
                        "AED",

                };


                /*
                  Store the same filters that are being used
                  for the initial dashboard load.
                */

                setActiveOpexFilters(
                    initialFilters
                );


                await loadDashboardData(
                    initialFilters
                );

            } else {

                console.warn(
                    "No OPEX period returned by filter-options API."
                );

            }


        } catch (error) {

            console.error(
                "Failed to load OPEX filter options:",
                error
            );


            setError(
                error?.message ||
                "Failed to load OPEX filter options."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================================================
       INITIAL LOAD
    ========================================================= */

    useEffect(() => {

        loadFilterOptions();

    }, []);


    /* =========================================================
       APPLY FILTERS
    ========================================================= */

    const handleApplyFilters = async (
        selectedFilters
    ) => {

        console.log(
            "OPEX filters applied:",
            selectedFilters
        );


        /*
          Store currently applied filters so that
          category-detail uses the same filters.
        */

        setActiveOpexFilters(
            selectedFilters
        );


        await loadDashboardData(
            selectedFilters
        );

    };


    /* =========================================================
       RESET FILTERS
    ========================================================= */

    const handleResetFilters = async () => {

        const latestPeriod =
            getLatestPeriod(
                filterOptions.periods
            );


        if (!latestPeriod) {
            return;
        }


        const resetFilters = {

            legal_group: "",

            legal_entity: "",

            parent_division: "",

            subdivision: "",

            period:
                latestPeriod,

            compare_with: "",

            reporting_currency:
                filterOptions.default_reporting_currency ||
                "AED",

        };


        /*
          Store reset filters as active filters.
        */

        setActiveOpexFilters(
            resetFilters
        );


        /*
          Clear previously loaded category details
          because filters have changed.
        */

        setDetailLoading({});


        await loadDashboardData(
            resetFilters
        );

    };


    return (

        <div className="page-content relative">


            <PageHeader
                title="Operating Expenses Analysis"
                subtitle="Detailed Operating expense performance and variance analysis across divisions."
            >

                <ExportButtons
                    endpoint="operatinganalysis"
                    exporting={exporting}
                />

            </PageHeader>


            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <div className="flex flex-col gap-2">


                {/* =================================================
                    FILTERS
                ================================================= */}

                <div className="top-0 z-30 bg-white py-2">

                    <Filters

                        filterOptions={
                            filterOptions
                        }

                        onApply={
                            handleApplyFilters
                        }

                        onReset={
                            handleResetFilters
                        }

                        isOperatingExpenses={
                            true
                        }

                    />

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            background: "#fff7ed",
                            border: "1px solid #fed7aa",
                            color: "#c2410c",
                            fontSize: "12px",
                        }}
                    >
                        {error}
                    </div>

                )}


                {/* =================================================
                    OPERATING EXPENSE SUMMARY
                ================================================= */}

                <OperatingExpenseSummary
                    data={summaryData}
                />


                {/* =================================================
                    CHART SECTION
                ================================================= */}

                <div className="grid grid-cols-16 gap-3 mt-3">


                    {/* =================================================
                        ACTUAL VS TARGET
                    ================================================= */}

                    <div className="col-span-8">

                        <ActualVsTargetChart
                            data={
                                actualVsTargetData
                            }
                        />

                    </div>


                    {/* =================================================
                        OPEX COMPOSITION
                    ================================================= */}

                    <div className="col-span-8">

                        <OpexCompositionChart
                            data={
                                opexCompositionData
                            }
                            total={summaryData?.actualYTD}
                        />

                    </div>

                </div>


                {/* =================================================
                    EXPENSE CATEGORY DRILL DOWN
                ================================================= */}

                <ExpenseCategoryDrillDown

                    data={
                        expenseCategoryDrilldownData
                    }

                    dataAsOf={
                        dataAsOf
                    }

                    currentMonthPartial={
                        currentMonthPartial
                    }

                    /*
                      Category-detail API is called only
                      when a category row is expanded.
                    */

                    onExpandCategory={
                        handleExpandCategory
                    }

                    /*
                      Pass loading state to the table
                      so the expanded row can show loading.
                    */

                    detailLoading={
                        detailLoading
                    }

                />


                {/* =================================================
                    MONTH ON MONTH
                ================================================= */}

                <MonthOnMonthOpexReport
                    data={monthOnMonthOpexData}
                    onExpandCategory={handleExpandCategory}
                    detailLoading={detailLoading}
                    periodName={activeOpexFilters?.period || ""}
                    reportingCurrency={
                        activeOpexFilters?.reporting_currency || "AED"
                    }
                    hierarchyFilters={{
                        legal_group_id:
                            activeOpexFilters?.legal_group || "",
                        legal_entity_id:
                            activeOpexFilters?.legal_entity || "",
                        parent_division_id:
                            activeOpexFilters?.parent_division || "",
                        subdivision_id:
                            activeOpexFilters?.subdivision || "",
                    }}
                />

            </div>


            {/* =====================================================
                FOOTER
            ================================================= */}

            <div className="fixed bottom-0 left-58 right-2 z-50 bg-white border-t border-gray-200 p-2">

                <FooterNote
                    title="Note:"
                    message="All values are in AED | ☁️ Source: Oracle Fusion Cloud"
                    showRefresh={false}
                />

            </div>

        </div>

    );

}