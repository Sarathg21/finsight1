// import React from "react";
// import { LuBuilding2 } from "react-icons/lu";
// import { IoWalletOutline, IoHourglassOutline, IoAlertCircleOutline, } from "react-icons/io5";
// import {
//     FiPercent, FiRefreshCw,
// } from "react-icons/fi";
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import ChartMenu from "../components/ChartMenu";
// import Filters from "../components/Filters/Filters";
// import { Download, CalendarClock } from "lucide-react";
// import { AgingSummaryCard, OverDueSummaryCard, PayablesTrendCard, ParentDivisionCard, } from "../components/Charts/Charts";
// import { TopVendorsTable, SubDivisionTable, SalesmanTable, } from "../components/Tables/Tables";
// import DetailedViewTable from "../components/Tables/DetailedViewTable";
// import KPICards from "../components/Cards/KPICards";
// import { agingData, trendData, divisionData, topVendors, overdueData, businessUnitData, detailedViewData, } from '../data/dashboardData';
// import {
//     getReceivableFilters,
//     getReceivableSummary,
//     getReceivableBuckets,
//     getReceivableOverdueBuckets,
//     getReceivableDivisionWise,
//     getReceivableTopCustomers,
// } from "../api/recevablesApi";
// import ExportButtons from "../components/Common/ExportButtons";
// import PageHeader from "../components/Common/PageHeader";
// import FooterNote from "../components/FooterNote";
// import ReceivablesDetailsModal from "../components/ReceivablesDetailsModal"
// import ReceivablesSummary from "../components/Cards/ReceivablesSummary";


// export default function ReceivablesDashboard() {

//     const [filterOptions, setFilterOptions] = useState({
//         as_on_dates: [],
//         currencies: [],
//         legal_groups: [],
//         legal_entities: [],
//         parent_divisions: [],
//         subdivisions: [],
//         business_units: [],
//         salesmen: [],
//     });
//     const navigate = useNavigate();
//     const [filters, setFilters] = useState({});
//     const [summary, setSummary] = useState(null);
//     const [agingSummary, setAgingSummary] = useState([]);
//     const [agingTotal, setAgingTotal] = useState(0);
//     const [divisionData, setDivisionData] = useState([]);
//     const [topCustomers, setTopCustomers] = useState([]);
//     const [trendData, setTrendData] = useState([]);
//     const [overdueData, setOverdueData] = useState([]);
//     const [overdueTotal, setOverdueTotal] = useState(0);
//     const [subDivisionData, setSubDivisionData] = useState([]);
//     const [exporting, setExporting] = useState("");
//     const [loading, setLoading] = useState(true);

//     {/*------------Details table--------------------*/ }
//     const [detailsData, setDetailsData] = useState([]);
//     const [detailsPage, setDetailsPage] = useState(1);
//     const [detailsPageSize] = useState(50);
//     const [detailsTotalCount, setDetailsTotalCount] = useState(0);
//     const [detailsSort, setDetailsSort] = useState({
//         sort_by: "outstanding_amount",
//         sort_dir: "desc"
//     });
//     const [showDetailsModal, setShowDetailsModal] = useState(false);
//     const [salesmanData, setSalesmanData] = useState([]);


//     // Selected reporting currency from Filters
//     const selectedCurrency =
//         filters?.currency ||
//         filters?.currency_code ||
//         (Array.isArray(filters?.currencies) ? filters.currencies[0] : filters?.currencies) ||
//         "AED";


//     {/*-----------Currency Format--------------------*/ }

//     const formatCurrency = (value) => {
//         if (value == null) return "-";

//         const amount = Number(value);

//         if (amount >= 1_000_000) {
//             return `${selectedCurrency} ${(amount / 1_000_000).toFixed(2)}M`;
//         }

//         if (amount >= 1_000) {
//             return `${selectedCurrency} ${(amount / 1_000).toFixed(2)}K`;
//         }

//         return `${selectedCurrency} ${amount.toLocaleString("en-US", {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2,
//         })}`;
//     };
//     {/*-------------Array For Summary--------------------*/ }

//     const receivableKpiData = summary ? [
//         {
//             // 1. Total Receivables
//             id: 1, title: "Total Receivables", value: formatCurrency(
//                 summary.total_ar
//             ),
//             icon: LuBuilding2, titleColor: "#2563EB", titleBackground: "#EFF6FF", iconColor: "#2563EB",
//             iconBackground: "#EAF2FF",
//             cardBackground: "#F3F8FF", borderColor: "#E8EDF5",
//             trend: "up", trendValue: "9.42%", comparisonText: "vs 31 Mar 2024", trendColor: "#16A34A",
//         },
//         {

//             // 2. Current Receivables
//             id: 2, title: "Current Receivables", value: formatCurrency(
//                 summary.current_not_due
//             ),
//             icon: IoWalletOutline, titleColor: "#16A34A", iconColor: "#16A34A",
//             iconBackground: "#ECFDF5", cardBackground: "#F0FDF4", borderColor: "#E8EDF5", trend: "up", trendValue: "7.31%",
//             comparisonText: "vs 31 Mar 2024",
//             trendColor: "#16A34A",

//         },

//         {
//             // 3. Overdue Receivables
//             id: 3, title: "Overdue Receivables", value: formatCurrency(
//                 summary.overdue_ar
//             ),
//             icon: IoHourglassOutline, titleColor: "#F59E0B", iconColor: "#F59E0B",
//             iconBackground: "#FFF7ED", cardBackground: "#FFF7ED", borderColor: "#E8EDF5",
//             trend: "down", trendValue: "14.85%",
//             comparisonText: "vs 31 Mar 2024", trendColor: "#DC2626", sparklineColor: "#F59E0B",

//         },

//         {

//             // 4. Overdue > 90 Days
//             id: 4, title: "Overdue > 90 Days",
//             value: formatCurrency(
//                 summary.above_90_ar
//             ),
//             icon: IoAlertCircleOutline,
//             titleColor: "#EC4899",
//             iconColor: "#EC4899",
//             iconBackground: "#FDF2F8",
//             cardBackground: "#FEF2F2",
//             borderColor: "#E8EDF5",
//             trend: "down",
//             trendValue: "21.10%",
//             comparisonText: "vs 31 Mar 2024",
//             trendColor: "#DC2626",

//         },

//         {
//             id: 5,
//             title: "DSO (Days)",
//             value: `${Number(
//                 summary.dso_days || 0
//             )} days`,
//             icon: FiPercent,
//             titleColor: "#06B6D4",
//             iconColor: "#06B6D4",
//             iconBackground: "#ECFEFF",
//             cardBackground: "#EFF6FF",
//             borderColor: "#E8EDF5",
//             trend: "up",
//             trendValue: "3 Days",
//             comparisonText: "vs 31 Mar 2024",
//             trendColor: "#16A34A",

//         },

//         {
//             id: 6,
//             title: "Invoice Settlement Efficiency",
//             value: `${Number(
//                 summary.invoice_settlement_efficiency || 0
//             ).toFixed(2)}%`,
//             icon: FiRefreshCw,
//             titleColor: "#8B5CF6",
//             iconColor: "#8B5CF6",
//             iconBackground: "#F5F3FF",
//             cardBackground: "#FAF5FF",
//             borderColor: "#E8EDF5",
//             trend: "up",
//             trendValue: "4.12%",
//             comparisonText: "vs 31 Mar 2024",
//             trendColor: "#16A34A",

//         },
//     ] : [];

//     const handleViewDetails = () => {
//         setShowDetailsModal(true);
//     };
//     const handleExportExcel = () => {
//         console.log("Export Excel");
//     };

//     const handleExportPdf = () => {
//         console.log("Export PDF");
//     };

//     const loadDashboardData = async () => {
//         try {
//             setLoading(true);

//             await Promise.all([
//                 fetchFilters(),
//                 fetchSummary(),

//                 // Aging Summary
//                 fetchAgingSummary(),

//                 // Parent + Sub Division
//                 fetchDivisionWise(),

//                 // Top Customers
//                 fetchTopCustomers(),

//                 // Overdue Summary
//                 fetchOverdueBuckets(),
//             ]);

//         } catch (error) {
//             console.error(
//                 "Receivables Dashboard Error:",
//                 error
//             );
//         } finally {
//             setLoading(false);
//         }
//     };


//     {/*-------------Load Filter Data--------------------*/ }
//     const fetchFilters = async () => {
//         try {
//             const response = await getReceivableFilters();

//             console.log("Receivables Filters:", response);

//             setFilterOptions({
//                 as_on_dates: response?.as_on_dates || [],
//                 currencies: response?.currencies || [],
//                 legal_groups: response?.legal_groups || [],
//                 legal_entities: response?.legal_entities || [],
//                 parent_divisions: response?.parent_divisions || [],
//                 subdivisions: response?.subdivisions || [],
//                 divisions: response?.divisions || [],
//                 business_units: response?.business_units || [],
//                 customer_types: response?.customer_types || [],
//                 countries: response?.countries || [],
//                 salesmen: response?.salesmen || [],
//             });
//         } catch (error) {
//             console.error(
//                 "Failed to fetch receivables filters:",
//                 error
//             );
//         }
//     };

//     {/*-------------Load SummaryCards--------------------*/ }


//     const fetchSummary = async (currentFilters = {}) => {
//         try {
//             const response =
//                 await getReceivableSummary(currentFilters);

//             console.log(
//                 "Receivables Summary Response:",
//                 response
//             );

//             const data =
//                 response?.data?.data ??
//                 response?.data ??
//                 response ??
//                 {};

//             console.log(
//                 "Receivables Summary Data:",
//                 data
//             );

//             setSummary(data);

//         } catch (error) {
//             console.error(
//                 "Receivables Summary Error:",
//                 error.response?.data || error
//             );

//             setSummary({});
//         }
//     };


//     {/*-------------Load AgingSummary--------------------*/ }
//     const fetchAgingSummary = async (
//         currentFilters = {}
//     ) => {
//         try {
//             const response =
//                 await getReceivableBuckets(
//                     currentFilters
//                 );

//             console.log(
//                 "AGING BUCKETS:",
//                 response
//             );

//             const data =
//                 response?.data?.data ??
//                 response?.data ??
//                 response ??
//                 {};

//             console.log(
//                 "AGING BUCKET DATA:",
//                 data
//             );

//             const bucketDefinitions = [
//                 {
//                     bucket_code: "CURRENT",
//                     bucket_name: "Current",
//                     key: "current_not_due",
//                 },
//                 {
//                     bucket_code: "1_30",
//                     bucket_name: "1-30 Days",
//                     key: "days_0_30",
//                 },
//                 {
//                     bucket_code: "31_60",
//                     bucket_name: "31-60 Days",
//                     key: "days_31_60",
//                 },
//                 {
//                     bucket_code: "61_90",
//                     bucket_name: "61-90 Days",
//                     key: "days_61_90",
//                 },
//                 {
//                     bucket_code: "91_120",
//                     bucket_name: "91-120 Days",
//                     key: "days_91_120",
//                 },
//                 {
//                     bucket_code: "121_180",
//                     bucket_name: "121-180 Days",
//                     key: "days_121_180",
//                 },
//                 {
//                     bucket_code: "181_365",
//                     bucket_name: "181-365 Days",
//                     key: "days_181_365",
//                 },
//                 {
//                     bucket_code: "366_730",
//                     bucket_name: "366-730 Days",
//                     key: "days_366_730",
//                 },
//                 {
//                     bucket_code: "OVER_730",
//                     bucket_name: ">730 Days",
//                     key: "above_730",
//                 },
//             ];

//             const total = bucketDefinitions.reduce(
//                 (sum, bucket) =>
//                     sum + Number(data?.[bucket.key] || 0),
//                 0
//             );

//             const buckets = bucketDefinitions.map(
//                 (bucket) => {
//                     const amount = Number(
//                         data?.[bucket.key] || 0
//                     );

//                     return {
//                         bucket_code: bucket.bucket_code,
//                         bucket_name: bucket.bucket_name,
//                         amount,
//                         value: amount,
//                         percentage:
//                             total > 0
//                                 ? (
//                                     (amount / total) *
//                                     100
//                                 ).toFixed(2)
//                                 : "0.00",
//                     };
//                 }
//             );

//             console.log(
//                 "AGING MAPPED DATA:",
//                 buckets
//             );

//             setAgingSummary(buckets);
//             setAgingTotal(total);

//         } catch (error) {
//             console.error(
//                 "Aging Summary Error:",
//                 error.response?.data || error
//             );

//             setAgingSummary([]);
//             setAgingTotal(0);
//         }
//     };
//     {/*-------------Load parent division--------------------*/ }
//     const fetchDivisionWise = async (
//         currentFilters = {}
//     ) => {
//         try {
//             const response =
//                 await getReceivableDivisionWise(
//                     currentFilters
//                 );

//             const data =
//                 response?.data?.data ??
//                 response?.data ??
//                 response ??
//                 [];

//             const rows = Array.isArray(data)
//                 ? data
//                 : [];

//             console.log(
//                 "Division Wise Data:",
//                 rows
//             );

//             setDivisionData(rows);

//             const subdivisions =
//                 rows.flatMap((parent) =>
//                     Array.isArray(
//                         parent.sub_divisions
//                     )
//                         ? parent.sub_divisions.map(
//                             (sub) => ({
//                                 subdivision:
//                                     sub.sub_division || "-",

//                                 amount:
//                                     Number(
//                                         sub.receivables || 0
//                                     ),

//                                 percentage:
//                                     Number(
//                                         sub.share_percentage || 0
//                                     ),
//                             })
//                         )
//                         : []
//                 );

//             setSubDivisionData(
//                 subdivisions
//             );

//         } catch (error) {
//             console.error(
//                 "Division Wise Error:",
//                 error.response?.data || error
//             );

//             setDivisionData([]);
//             setSubDivisionData([]);
//         }
//     };


//     {/*----------Parent division------------------*/ }
//     const divisionTotalOutstanding =
//         divisionData.reduce(
//             (sum, item) =>
//                 sum + Number(item.total_ar || 0),
//             0
//         );

//     const divisionChartData =
//         divisionData.map((item) => ({
//             name:
//                 item.parent_division || "-",

//             value:
//                 Number(item.total_ar || 0),

//             percentage:
//                 divisionTotalOutstanding > 0
//                     ? (
//                         (
//                             Number(item.total_ar || 0) /
//                             divisionTotalOutstanding
//                         ) * 100
//                     ).toFixed(1) + "%"
//                     : "0%",
//         }));


//     {/*-------------Top Customers--------------------*/ }
//     const fetchTopCustomers = async (
//         currentFilters = {}
//     ) => {
//         try {
//             const response =
//                 await getReceivableTopCustomers(
//                     currentFilters
//                 );

//             const data =
//                 response?.data?.data ??
//                 response?.data ??
//                 response ??
//                 [];

//             setTopCustomers(
//                 Array.isArray(data)
//                     ? data
//                     : []
//             );

//         } catch (error) {
//             console.error(
//                 "Top Customers Error:",
//                 error.response?.data || error
//             );

//             setTopCustomers([]);
//         }
//     };

//     {/*------------details fetch --------------------*/ }
//     const fetchDetails = async (
//         filters = {},
//         page = detailsPage,
//         sort = detailsSort,
//         pageSize = 10
//     ) => {
//         try {
//             const params = {
//                 ...filters,
//                 page,
//                 page_size: pageSize,
//                 sort_by: sort.sort_by,
//                 sort_dir: sort.sort_dir,
//             };

//             const response = await getReceivableDetails(params);

//             setDetailsData(response?.data?.data?.rows || []);
//             setDetailsTotalCount(response?.data?.data?.total_count || 0);
//         } catch (err) {
//             console.error(err);
//         }
//     };
//     {/*------------trend  --------------------*/ }
//     const fetchTrend = async (filters = {}) => {
//         try {
//             const response = await getReceivableTrend(filters);
//             setTrendData(response?.data?.data || []);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     {/*------------Overdue Summary  --------------------*/ }
//     const fetchOverdueBuckets = async (currentFilters = {}) => {
//         try {
//             const response =
//                 await getReceivableOverdueBuckets(currentFilters);
//             console.log(
//                 "Receivables Overdue Buckets:",
//                 response
//             );

//             const data =
//                 response?.data?.data ??
//                 response?.data ??
//                 response ??
//                 {};

//             // Handle array response
//             if (Array.isArray(data)) {
//                 const total = data.reduce(
//                     (sum, item) =>
//                         sum + Number(
//                             item?.amount ??
//                             item?.receivables ??
//                             item?.value ??
//                             0
//                         ),
//                     0
//                 );

//                 setOverdueData(data);
//                 setOverdueTotal(total);
//                 return;
//             }

//             // Handle object response
//             const buckets = [
//                 {
//                     bucket_code: "1_30",
//                     bucket_name: "1-30 Days",
//                     key: "days_0_30",
//                 },
//                 {
//                     bucket_code: "31_60",
//                     bucket_name: "31-60 Days",
//                     key: "days_31_60",
//                 },
//                 {
//                     bucket_code: "61_90",
//                     bucket_name: "61-90 Days",
//                     key: "days_61_90",
//                 },
//                 {
//                     bucket_code: "91_120",
//                     bucket_name: "91-120 Days",
//                     key: "days_91_120",
//                 },
//                 {
//                     bucket_code: "121_180",
//                     bucket_name: "121-180 Days",
//                     key: "days_121_180",
//                 },
//                 {
//                     bucket_code: "181_365",
//                     bucket_name: "181-365 Days",
//                     key: "days_181_365",
//                 },
//                 {
//                     bucket_code: "366_730",
//                     bucket_name: "366-730 Days",
//                     key: "days_366_730",
//                 },
//                 {
//                     bucket_code: "OVER_730",
//                     bucket_name: ">730 Days",
//                     key: "above_730",
//                 },
//             ];

//             const total = buckets.reduce(
//                 (sum, bucket) =>
//                     sum + Number(data?.[bucket.key] || 0),
//                 0
//             );

//             const formattedBuckets = buckets.map(
//                 (bucket) => {
//                     const amount = Number(
//                         data?.[bucket.key] || 0
//                     );

//                     return {
//                         bucket_code: bucket.bucket_code,
//                         bucket_name: bucket.bucket_name,
//                         amount,
//                         value: amount,
//                         percentage:
//                             total > 0
//                                 ? ((amount / total) * 100).toFixed(2)
//                                 : "0.00",
//                     };
//                 }
//             );

//             setOverdueData(formattedBuckets);
//             setOverdueTotal(total);
//         } catch (error) {
//             console.error(
//                 "Failed to fetch overdue buckets:",
//                 error
//             );

//             setOverdueData([]);
//             setOverdueTotal(0);
//         }
//     };
//     {/*------------Fetch Subdivisions --------------------*/ }
//     const fetchSubDivisions = async (filters = {}) => {

//         try {
//             const response = await getReceivableSubDivision(filters);
//             const rawData = response?.data?.data; const apiData = Array.isArray(rawData) ? rawData : [];
//             const totalAmount = apiData.reduce(
//                 (sum, item) => sum + Number(item.amount || 0),
//                 0
//             );
//             const tableData = apiData.map((item) => ({
//                 subdivision: item.subdivision,
//                 amount: Number(item.amount || 0),
//                 percentage:
//                     totalAmount > 0
//                         ? ((item.amount / totalAmount) * 100).toFixed(1)
//                         : "0.0",
//             }));
//             setSubDivisionData(tableData);

//         } catch (error) {
//             console.error(error);
//         }
//     };

//     {/*------------Fetch SalesMan --------------------*/ }
//     const loadSalesman = async (filters = {}) => {
//         try {
//             const res = await getSalesmanPerformance(filters);
//             setSalesmanData(res.data.data || res.data);
//         } catch (err) {
//             console.log(err);
//         }
//     };
//     const handleApply = async (
//         selectedFilters
//     ) => {
//         setFilters(selectedFilters);
//         setLoading(true);

//         console.log(
//             "Selected Receivables Filters:",
//             selectedFilters
//         );

//         try {
//             await Promise.all([
//                 fetchSummary(selectedFilters),

//                 fetchAgingSummary(
//                     selectedFilters
//                 ),

//                 fetchOverdueBuckets(
//                     selectedFilters
//                 ),

//                 fetchDivisionWise(
//                     selectedFilters
//                 ),

//                 fetchTopCustomers(
//                     selectedFilters
//                 ),
//             ]);

//         } catch (error) {
//             console.error(
//                 "Receivables Filter Error:",
//                 error
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDetailsPageChange = (page) => {
//         setDetailsPage(page);
//         fetchDetails(
//             filters,
//             page,
//             detailsSort
//         );
//     };

//     const handleDetailsSort = (field) => {
//         let direction = "desc";
//         if (
//             detailsSort.sort_by === field &&
//             detailsSort.sort_dir === "desc"
//         ) {
//             direction = "asc";
//         }
//         const newSort = {
//             sort_by: field,
//             sort_dir: direction
//         };
//         setDetailsSort(newSort);
//         fetchDetails(
//             filters,
//             1,
//             newSort
//         );
//         setDetailsPage(1);
//     };

//     const handleReset = async () => {
//         setFilters({});
//         setLoading(true);

//         try {
//             await Promise.all([
//                 fetchSummary({}),

//                 fetchAgingSummary({}),

//                 fetchOverdueBuckets({}),

//                 fetchDivisionWise({}),

//                 fetchTopCustomers({}),
//             ]);

//         } catch (error) {
//             console.error(
//                 "Receivables Reset Error:",
//                 error
//             );
//         } finally {
//             setLoading(false);
//         }
//     };
//     const bucketColors = {
//         CURRENT: "#22C55E",
//         "1_30": "#3B82F6",
//         "31_60": "#FACC15",
//         "61_90": "#FB923C",
//         "91_120": "#EF4444",
//         "121_180": "#A855F7",
//         "181_365": "#6366F1",
//         "366_730": "#7C2D12",
//         OVER_730: "#991B1B",
//     };

//     {/*-------------Create a new array for aging summary--------------------*/ }
//     // For the PIE chart (only non-zero slices)
//     const pieData = agingSummary
//         .filter(item => Number(item.amount) > 0)
//         .map(item => ({
//             name: item.bucket_name,
//             value: Number(item.amount),
//             percentage: Number(item.percentage),
//             color: bucketColors[item.bucket_code] || "#9CA3AF",
//         }));

//     // For the LEGEND (all buckets)
//     const legendData = agingSummary.map(item => ({
//         name: item.bucket_name,
//         value: Number(item.amount),
//         percentage: Number(item.percentage),
//         color: bucketColors[item.bucket_code] || "#9CA3AF",
//     }));



//     {/*-----------Convert the api data for top customers------------------*/ }
//     const topCustomerTableData =
//         topCustomers.map(
//             (customer, index) => ({
//                 id: index + 1,

//                 name:
//                     customer.customer_name || "-",

//                 amount:
//                     Number(
//                         customer.receivables || 0
//                     ),

//                 pct:
//                     Number(
//                         customer.share_percentage || 0
//                     ),
//             })
//         );
//     // const detailedTableData = detailsData.map((item, index) => ({
//     //     id: index + 1,
//     //     customerName: item.customer_name,
//     //     customerType: item.customer_type,
//     //     currency: item.currency,
//     //     country: item.country,
//     //     invoiceNumber: item.invoice_number,
//     //     invoiceDate: item.invoice_date,
//     //     dueDate: item.due_date,
//     //     outstandingAmount: item.outstanding_amount,
//     //     agingBucket: item.aging_bucket,
//     //     salesman: item.salesman,
//     //     division: item.division,
//     //     legalEntity: item.legal_entity,
//     // }));

//     const receivableTrendChart = trendData.map(item => ({
//         month: new Date(item.as_on_date).toLocaleString("default", {
//             month: "short",
//         }),

//         // Bar expects payables
//         payables: Number(item.total_receivables || 0),

//         // Line expects dpo
//         dpo: 0,

//         current: Number(item.current || 0),
//         overdue: Number(item.amount_1_30 || 0),
//     }));

//     useEffect(() => {
//         loadDashboardData();
//     }, []);


//     const handleExport = async (type) => {
//         try {
//             setExporting(type);
//             const response = await getReceivableExport(type, filters);
//             const blob = new Blob([response.data], {
//                 type:
//                     type === "excel"
//                         ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//                         : "application/pdf",
//             });

//             const url = window.URL.createObjectURL(blob);
//             const link = document.createElement("a");
//             link.href = url;
//             link.download =
//                 type === "excel"
//                     ? "Receivables_Report.xlsx"
//                     : "Receivables_Report.pdf";

//             document.body.appendChild(link);
//             link.click();
//             link.remove();
//             window.URL.revokeObjectURL(url);
//         } catch (err) {
//             console.error(err);
//             if (type === "excel") {
//                 alert("Export Failed");
//             }
//             else {
//                 alert("PDF Download Failed");
//             }
//         } finally {
//             setExporting("");
//         }
//     };

//     return (
//         <div className="page-content relative">

//             {loading && (
//                 <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
//                     <div className="flex flex-col items-center gap-3">

//                         <div className="w-10 h-10 border-4 border-[#081B46] border-t-transparent rounded-full animate-spin"></div>

//                         <p className="text-sm font-semibold text-[#081B46]">
//                             Loading Receivables Dashboard...
//                         </p>

//                     </div>
//                 </div>
//             )}

//             <PageHeader
//                 title="Receivables Dashboard"
//                 subtitle="Tracking receivables, aging, overdue and collection performance.">

//                 <ExportButtons
//                     endpoint="receivables"
//                     exporting={exporting}
//                     handleExport={handleExport}
//                 />
//             </PageHeader>

//             {/* Main Content */}

//             <div className="flex flex-col gap-2">
//                 {/* ----Filters---- */}
//                 <Filters
//                     filterOptions={filterOptions}
//                     onApply={handleApply}
//                     onReset={handleReset}
//                     isReceivables={true}
//                 />
//                 {/* -----KPI Cards----- */}
//                 <div style={{ marginTop: "-18px" }}>
//                     <ReceivablesSummary
//                         data={summary ?? {}}
//                         reportingCurrency={selectedCurrency}
//                     />
//                 </div>


//                 {/* Charts Row 1 */}
//                 <div className="receivables-grid gap-3">
//                     <AgingSummaryCard
//                         title="Receivables Aging Summary"
//                         data={pieData}
//                         date={filters.as_on_date}
//                         legendData={legendData}
//                         total={agingTotal}
//                         currency={selectedCurrency}
//                     />
//                     <PayablesTrendCard
//                         title="Receivables Trend"
//                         daysname="DSO (Days)"
//                         charttitle="Total Receivables"
//                         data={receivableTrendChart}
//                         currency="AED"
//                         datakey="receivables"
//                     />

//                     <ParentDivisionCard
//                         title="Receivables by Parent Division"
//                         data={divisionChartData}
//                     />

//                 </div>


//                 {/* Charts Row 2 */}

//                 <div className="receivables-grid gap-3">
//                     <TopVendorsTable
//                         title="Top 10 Customers by Receivables"
//                         tabletitle1="Customer Name"
//                         tabletitle2="Receivable"
//                         data={topCustomerTableData}
//                     />
//                     <OverDueSummaryCard
//                         title="Overdue Summary"
//                         data={overdueData}
//                         total={Number(overdueTotal).toFixed(2)}
//                         Centerlabel="Total Overdue"
//                     />
//                     <SubDivisionTable
//                         title="Receivables by Sub Division"
//                         tabletitle="Receivable"
//                         data={subDivisionData}
//                     />
//                 </div>

//                 <div className="card mt-20" style={{ padding: 0, overflow: "hidden" }}>
//                     {/* Header */}
//                     {/* <div
//                         className="flex items-center justify-between px-5 py-4 border-b bg-white" >
//                         <div className="flex items-center gap-3">
//                             <span className="text-[15px] font-extrabold text-[#081B46]">
//                                 Receivables Detailed View
//                             </span>
//                             <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">
//                                 Amounts in AED
//                             </span>
//                         </div>
//                         <ChartMenu
//                             onViewAll={handleViewDetails}
//                             onExportExcel={() => handleExport("excel")}
//                             onExportPdf={() => handleExport("pdf")}
//                         />
//                     </div> */}

//                     <DetailedViewTable

//                     />
//                     {/* <ReceivablesDetailsModal
//                         open={showDetailsModal}
//                         onClose={() => setShowDetailsModal(false)}
//                         filters={filters}
//                     /> */}


//                 </div>
//             </div>

//             {/* Footer */}
//             <div className="fixed bottom-0 left-58 right-2 z-50 bg-white border-t border-gray-200 p-2">
//                 <FooterNote
//                     title="Note:"
//                     message="All values are in ${selectedCurrency} | ☁️ Source: Oracle Fusion Cloud"
//                     lastUpdated={filters.as_on_date || filterOptions.as_on_dates?.[0]}
//                     showRefresh={false}
//                 />
//             </div>
//         </div>
//     );
// }



import React, { useEffect, useMemo, useState, useRef } from "react";

/* ============================================================
   PAYABLES DASHBOARD
   ------------------------------------------------------------
   Payables-specific filters:
   - Legal Group
   - Legal Entity
   - Parent Division
   - Sub-Division
   - Reporting Currency
   - As-On Date
   - Aging Basis

   No Business Unit filter.
   ============================================================ */


const PAYABLE_AGING_BUCKETS = [
    "Current",
    "0–30 Days",
    "31–60 Days",
    "61–90 Days",
    "91–120 Days",
    "121–180 Days",
    "181–365 Days",
    "Above 365 Days",
];

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

/* ============================================================
   FILTER OPTIONS
   ============================================================ */

const payablesFilterOptions = {
    legal_groups: [
        "FJ Group ",
        "FJ Group India",
        "FJ Group Middle East",
        "FJ Group Africa",
    ],

    legal_entities: [
        "All",
        "Alpha Coils LLC",
        "DC Serve Equipment LLC",
        "Filter Fan UAE",
        "Alpine Gears LLC",
        "Emirates Trading LLC",
        "Global Industrial Co.",
        "Metro Equipment FZE",
        "Precision Materials LLC",
        "Rapid Parts LLC",
    ],

    parent_divisions: [
        "All",
        "Alpine",
        "DC Serve",
        "Filter Fan",
        "Alpine Gears",
        "Others",
    ],

    sub_divisions: [
        "All",
        "Coils BU",
        "Service BU",
        "Fans BU",
        "Gears BU",
        "Valves BU",
        "Electrical BU",
        "Fasteners BU",
        "Others",
    ],

    reporting_currencies: [
        "AED",
        "INR",
        "OMR",
        "QAR",
        "SAR",
        "USD",
    ],

    as_on_dates: [
        "30 Apr 2024",
        "31 May 2024",
        "30 Jun 2024",
        "31 Jul 2024",
        "31 Aug 2024",
        "30 Sep 2024",
        "31 Oct 2024",
        "30 Nov 2024",
        "31 Dec 2024",
    ],

    aging_basis: [
        "Invoice Date",
        "Due Date",
    ],

    years: [
        2024,
        2025,
        2026,
    ],
};

/* ============================================================
   DEFAULT FILTERS
   ============================================================ */

const defaultPayablesFilters = {
    legal_group: ["All"],
    legal_entities: ["All"],
    parent_divisions: ["All"],
    sub_divisions: ["All"],
    reporting_currency: "AED",
    as_on_date: "30 Apr 2024",

    // VERY IMPORTANT:
    // This value must always be sent to backend APIs later.
    aging_basis: "Due Date",

    year: 2024,
};

/* ============================================================
   KPI MOCK DATA
   ============================================================ */

const payablesKpis = {
    "Due Date": {
        total_payables: 192290000,
        current_payables: 119260000,
        overdue_payables: 73030000,
        overdue_gt_90: 24130000,

        dpo: 46,

        total_payables_variance: 8.4,
        current_payables_variance: 6.1,
        overdue_payables_variance: 12.8,
        overdue_gt_90_variance: 15.6,
        dpo_variance: 4.2,

        previous_date: "31 Mar 2024",
    },

    "Invoice Date": {
        total_payables: 192290000,
        current_payables: 108740000,
        overdue_payables: 83550000,
        overdue_gt_90: 31860000,

        dpo: 49,

        total_payables_variance: 7.2,
        current_payables_variance: 4.8,
        overdue_payables_variance: 14.1,
        overdue_gt_90_variance: 17.3,
        dpo_variance: 5.1,

        previous_date: "31 Mar 2024",
    },
};

/* ============================================================
   AGING SUMMARY
   ============================================================ */

const payablesAgingSummary = {
    "Due Date": [
        {
            bucket: "Current",
            amount: 119260000,
            percentage: 62.0,
        },
        {
            bucket: "0–30 Days",
            amount: 24380000,
            percentage: 12.7,
        },
        {
            bucket: "31–60 Days",
            amount: 18440000,
            percentage: 9.6,
        },
        {
            bucket: "61–90 Days",
            amount: 11320000,
            percentage: 5.9,
        },
        {
            bucket: "91–120 Days",
            amount: 8150000,
            percentage: 4.2,
        },
        {
            bucket: "121–180 Days",
            amount: 5620000,
            percentage: 2.9,
        },
        {
            bucket: "181–365 Days",
            amount: 3410000,
            percentage: 1.8,
        },
        {
            bucket: "Above 365 Days",
            amount: 1710000,
            percentage: 0.9,
        },
    ],

    "Invoice Date": [
        {
            bucket: "Current",
            amount: 108740000,
            percentage: 56.5,
        },
        {
            bucket: "0–30 Days",
            amount: 28600000,
            percentage: 14.9,
        },
        {
            bucket: "31–60 Days",
            amount: 20300000,
            percentage: 10.6,
        },
        {
            bucket: "61–90 Days",
            amount: 13250000,
            percentage: 6.9,
        },
        {
            bucket: "91–120 Days",
            amount: 8420000,
            percentage: 4.4,
        },
        {
            bucket: "121–180 Days",
            amount: 5980000,
            percentage: 3.1,
        },
        {
            bucket: "181–365 Days",
            amount: 4290000,
            percentage: 2.2,
        },
        {
            bucket: "Above 365 Days",
            amount: 2710000,
            percentage: 1.4,
        },
    ],
};

/* ============================================================
   PAYABLE TREND + DPO
   ============================================================ */

const payablesTrend = {
    "Due Date": [
        {
            month: "Nov 2023",
            total_payables: 164200000,
            dpo: 68,
        },
        {
            month: "Dec 2023",
            total_payables: 172340000,
            dpo: 72,
        },
        {
            month: "Jan 2024",
            total_payables: 168900000,
            dpo: 75,
        },
        {
            month: "Feb 2024",
            total_payables: 178450000,
            dpo: 71,
        },
        {
            month: "Mar 2024",
            total_payables: 177120000,
            dpo: 69,
        },
        {
            month: "Apr 2024",
            total_payables: 192290000,
            dpo: 74,
        },
    ],

    "Invoice Date": [
        {
            month: "Nov 2023",
            total_payables: 159400000,
            dpo: 66,
        },
        {
            month: "Dec 2023",
            total_payables: 169820000,
            dpo: 70,
        },
        {
            month: "Jan 2024",
            total_payables: 173450000,
            dpo: 73,
        },
        {
            month: "Feb 2024",
            total_payables: 181230000,
            dpo: 76,
        },
        {
            month: "Mar 2024",
            total_payables: 184570000,
            dpo: 78,
        },
        {
            month: "Apr 2024",
            total_payables: 192290000,
            dpo: 79,
        },
    ],
};

/* ============================================================
   PAYABLES BY PARENT DIVISION
   ============================================================ */

const payablesByParentDivision = {
    "Due Date": [
        {
            name: "Alpine",
            amount: 68230000,
            percentage: 35.6,
        },
        {
            name: "DC Serve",
            amount: 42170000,
            percentage: 21.9,
        },
        {
            name: "Filter Fan",
            amount: 28340000,
            percentage: 14.7,
        },
        {
            name: "Alpine Gears",
            amount: 22060000,
            percentage: 11.5,
        },
        {
            name: "Others",
            amount: 31290000,
            percentage: 16.3,
        },
    ],

    "Invoice Date": [
        {
            name: "Alpine",
            amount: 64150000,
            percentage: 33.4,
        },
        {
            name: "DC Serve",
            amount: 45260000,
            percentage: 23.5,
        },
        {
            name: "Filter Fan",
            amount: 30650000,
            percentage: 15.9,
        },
        {
            name: "Alpine Gears",
            amount: 24780000,
            percentage: 12.9,
        },
        {
            name: "Others",
            amount: 26850000,
            percentage: 14.0,
        },
    ],
};

/* ============================================================
   TOP 10 SUPPLIERS
   ============================================================ */

const top10Suppliers = {
    "Due Date": [
        {
            rank: 1,
            supplier_name: "Alpha Supplies LLC",
            payable_amount: 18240000,
            percentage: 9.5,
        },
        {
            rank: 2,
            supplier_name: "Global Industrial Co.",
            payable_amount: 12670000,
            percentage: 6.6,
        },
        {
            rank: 3,
            supplier_name: "TechParts Trading",
            payable_amount: 9480000,
            percentage: 4.9,
        },
        {
            rank: 4,
            supplier_name: "Metro Equipment FZE",
            payable_amount: 8310000,
            percentage: 4.3,
        },
        {
            rank: 5,
            supplier_name: "Emirates Industrial",
            payable_amount: 7950000,
            percentage: 4.1,
        },
        {
            rank: 6,
            supplier_name: "Precision Materials",
            payable_amount: 6720000,
            percentage: 3.5,
        },
        {
            rank: 7,
            supplier_name: "Union Hardware LLC",
            payable_amount: 5980000,
            percentage: 3.1,
        },
        {
            rank: 8,
            supplier_name: "Star Components",
            payable_amount: 5140000,
            percentage: 2.7,
        },
        {
            rank: 9,
            supplier_name: "Al Noor Trading",
            payable_amount: 4760000,
            percentage: 2.5,
        },
        {
            rank: 10,
            supplier_name: "Rapid Parts LLC",
            payable_amount: 4610000,
            percentage: 2.4,
        },
    ],

    "Invoice Date": [
        {
            rank: 1,
            supplier_name: "Alpha Supplies LLC",
            payable_amount: 17650000,
            percentage: 9.2,
        },
        {
            rank: 2,
            supplier_name: "Global Industrial Co.",
            payable_amount: 13820000,
            percentage: 7.2,
        },
        {
            rank: 3,
            supplier_name: "TechParts Trading",
            payable_amount: 10150000,
            percentage: 5.3,
        },
        {
            rank: 4,
            supplier_name: "Metro Equipment FZE",
            payable_amount: 8650000,
            percentage: 4.5,
        },
        {
            rank: 5,
            supplier_name: "Emirates Industrial",
            payable_amount: 8210000,
            percentage: 4.3,
        },
        {
            rank: 6,
            supplier_name: "Precision Materials",
            payable_amount: 7050000,
            percentage: 3.7,
        },
        {
            rank: 7,
            supplier_name: "Union Hardware LLC",
            payable_amount: 6340000,
            percentage: 3.3,
        },
        {
            rank: 8,
            supplier_name: "Star Components",
            payable_amount: 5480000,
            percentage: 2.9,
        },
        {
            rank: 9,
            supplier_name: "Al Noor Trading",
            payable_amount: 4930000,
            percentage: 2.6,
        },
        {
            rank: 10,
            supplier_name: "Rapid Parts LLC",
            payable_amount: 4780000,
            percentage: 2.5,
        },
    ],
};

/* ============================================================
   OVERDUE SUMMARY
   ------------------------------------------------------------
   Does NOT include Current because this chart is overdue only.
   ============================================================ */

const overdueSummary = {
    "Due Date": [
        {
            bucket: "0–30 Days",
            amount: 24380000,
            percentage: 33.4,
        },
        {
            bucket: "31–60 Days",
            amount: 18440000,
            percentage: 25.3,
        },
        {
            bucket: "61–90 Days",
            amount: 11320000,
            percentage: 15.5,
        },
        {
            bucket: "91–120 Days",
            amount: 8150000,
            percentage: 11.2,
        },
        {
            bucket: "121–180 Days",
            amount: 5620000,
            percentage: 7.7,
        },
        {
            bucket: "181–365 Days",
            amount: 3410000,
            percentage: 4.7,
        },
        {
            bucket: "Above 365 Days",
            amount: 1710000,
            percentage: 2.3,
        },
    ],

    "Invoice Date": [
        {
            bucket: "0–30 Days",
            amount: 28600000,
            percentage: 34.2,
        },
        {
            bucket: "31–60 Days",
            amount: 20300000,
            percentage: 24.3,
        },
        {
            bucket: "61–90 Days",
            amount: 13250000,
            percentage: 15.9,
        },
        {
            bucket: "91–120 Days",
            amount: 8420000,
            percentage: 10.1,
        },
        {
            bucket: "121–180 Days",
            amount: 5980000,
            percentage: 7.2,
        },
        {
            bucket: "181–365 Days",
            amount: 4290000,
            percentage: 5.1,
        },
        {
            bucket: "Above 365 Days",
            amount: 2710000,
            percentage: 3.2,
        },
    ],
};

/* ============================================================
   PAYABLES BY SUB-DIVISION
   ============================================================ */

const payablesBySubDivision = {
    "Due Date": [
        {
            name: "Coils BU",
            amount: 48710000,
            percentage: 25.3,
        },
        {
            name: "Service BU",
            amount: 36220000,
            percentage: 18.8,
        },
        {
            name: "Fans BU",
            amount: 28060000,
            percentage: 14.6,
        },
        {
            name: "Gears BU",
            amount: 22110000,
            percentage: 11.5,
        },
        {
            name: "Valves BU",
            amount: 18760000,
            percentage: 9.7,
        },
        {
            name: "Electrical BU",
            amount: 14380000,
            percentage: 7.5,
        },
        {
            name: "Fasteners BU",
            amount: 12040000,
            percentage: 6.3,
        },
        {
            name: "Others",
            amount: 11990000,
            percentage: 6.2,
        },
    ],

    "Invoice Date": [
        {
            name: "Coils BU",
            amount: 45230000,
            percentage: 23.5,
        },
        {
            name: "Service BU",
            amount: 38650000,
            percentage: 20.1,
        },
        {
            name: "Fans BU",
            amount: 29450000,
            percentage: 15.3,
        },
        {
            name: "Gears BU",
            amount: 23850000,
            percentage: 12.4,
        },
        {
            name: "Valves BU",
            amount: 19320000,
            percentage: 10.0,
        },
        {
            name: "Electrical BU",
            amount: 13850000,
            percentage: 7.2,
        },
        {
            name: "Fasteners BU",
            amount: 11350000,
            percentage: 5.9,
        },
        {
            name: "Others",
            amount: 10900000,
            percentage: 5.7,
        },
    ],
};

/* ============================================================
   MONTH-ON-MONTH PAYABLES
   ------------------------------------------------------------
   IMPORTANT:
   Missing months are represented as null.
   UI should display "—" for null.
   NEVER convert null to 0.
   ============================================================ */

const monthOnMonthPayables = {
    "Due Date": [
        {
            legal_entity: "Alpha Coils",
            parent_division: "Alpine",
            sub_division: "Coils BU",

            Jan: 12.40,
            Feb: 13.10,
            Mar: 14.20,
            Apr: 15.60,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 15.60,
        },

        {
            legal_entity: "DC Serve Equip.",
            parent_division: "DC Serve",
            sub_division: "Service BU",

            Jan: 8.20,
            Feb: 8.90,
            Mar: 9.10,
            Apr: 9.40,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 9.40,
        },

        {
            legal_entity: "Filter Fan - UAE",
            parent_division: "Filter Fan",
            sub_division: "Fans BU",

            Jan: 6.10,
            Feb: 6.45,
            Mar: 7.20,
            Apr: 7.90,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 7.90,
        },

        {
            legal_entity: "Alpine Gears",
            parent_division: "Alpine Gears",
            sub_division: "Gears BU",

            Jan: 5.80,
            Feb: 6.10,
            Mar: 6.85,
            Apr: 7.31,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 7.31,
        },

        {
            legal_entity: "Emirates Trading",
            parent_division: "Others",
            sub_division: "Others",

            Jan: 4.05,
            Feb: 4.65,
            Mar: 5.10,
            Apr: 5.42,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 5.42,
        },

        {
            legal_entity: "Global Industrial",
            parent_division: "Others",
            sub_division: "Electrical BU",

            Jan: 3.82,
            Feb: 4.15,
            Mar: 4.76,
            Apr: 5.11,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 5.11,
        },

        {
            legal_entity: "Metro Equipment",
            parent_division: "DC Serve",
            sub_division: "Valves BU",

            Jan: 3.10,
            Feb: 3.46,
            Mar: 3.92,
            Apr: 4.28,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 4.28,
        },

        {
            legal_entity: "Precision Materials",
            parent_division: "Alpine",
            sub_division: "Fasteners BU",

            Jan: 2.85,
            Feb: 3.05,
            Mar: 3.62,
            Apr: 3.94,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 3.94,
        },
    ],

    "Invoice Date": [
        {
            legal_entity: "Alpha Coils",
            parent_division: "Alpine",
            sub_division: "Coils BU",

            Jan: 11.90,
            Feb: 12.80,
            Mar: 14.05,
            Apr: 15.20,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 15.20,
        },

        {
            legal_entity: "DC Serve Equip.",
            parent_division: "DC Serve",
            sub_division: "Service BU",

            Jan: 8.45,
            Feb: 9.10,
            Mar: 9.35,
            Apr: 9.82,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 9.82,
        },

        {
            legal_entity: "Filter Fan - UAE",
            parent_division: "Filter Fan",
            sub_division: "Fans BU",

            Jan: 6.35,
            Feb: 6.72,
            Mar: 7.41,
            Apr: 8.02,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 8.02,
        },

        {
            legal_entity: "Alpine Gears",
            parent_division: "Alpine Gears",
            sub_division: "Gears BU",

            Jan: 5.95,
            Feb: 6.32,
            Mar: 6.91,
            Apr: 7.58,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 7.58,
        },

        {
            legal_entity: "Emirates Trading",
            parent_division: "Others",
            sub_division: "Others",

            Jan: 4.18,
            Feb: 4.72,
            Mar: 5.26,
            Apr: 5.63,

            May: null,
            Jun: null,
            Jul: null,
            Aug: null,
            Sep: null,
            Oct: null,
            Nov: null,
            Dec: null,

            latest: 5.63,
        },
    ],
};

/* ============================================================
   VIEW ALL - SUPPLIER LEVEL DATA
   ============================================================ */

const payablesViewAll = {
    "Due Date": [
        {
            id: 1,
            supplier_name: "Alpha Supplies LLC",
            legal_entity: "Alpha Coils",
            parent_division: "Alpine",
            sub_division: "Coils BU",

            current: 12400000,
            "0_30": 2850000,
            "31_60": 1420000,
            "61_90": 780000,
            "91_120": 510000,
            "121_180": 320000,
            "181_365": 180000,
            above_365: 90000,

            total_payable: 18550000,
        },

        {
            id: 2,
            supplier_name: "Global Industrial Co.",
            legal_entity: "Global Industrial",
            parent_division: "Others",
            sub_division: "Electrical BU",

            current: 8200000,
            "0_30": 1760000,
            "31_60": 1120000,
            "61_90": 640000,
            "91_120": 420000,
            "121_180": 260000,
            "181_365": 170000,
            above_365: 100000,

            total_payable: 12670000,
        },

        {
            id: 3,
            supplier_name: "TechParts Trading",
            legal_entity: "Metro Equipment",
            parent_division: "DC Serve",
            sub_division: "Service BU",

            current: 6120000,
            "0_30": 1240000,
            "31_60": 860000,
            "61_90": 490000,
            "91_120": 310000,
            "121_180": 210000,
            "181_365": 150000,
            above_365: 100000,

            total_payable: 9480000,
        },

        {
            id: 4,
            supplier_name: "Metro Equipment FZE",
            legal_entity: "Metro Equipment",
            parent_division: "DC Serve",
            sub_division: "Valves BU",

            current: 5320000,
            "0_30": 1080000,
            "31_60": 620000,
            "61_90": 420000,
            "91_120": 280000,
            "121_180": 180000,
            "181_365": 120000,
            above_365: 90000,

            total_payable: 8110000,
        },

        {
            id: 5,
            supplier_name: "Emirates Industrial",
            legal_entity: "Emirates Trading",
            parent_division: "Others",
            sub_division: "Others",

            current: 4980000,
            "0_30": 920000,
            "31_60": 570000,
            "61_90": 410000,
            "91_120": 270000,
            "121_180": 170000,
            "181_365": 110000,
            above_365: 80000,

            total_payable: 7510000,
        },

        {
            id: 6,
            supplier_name: "Precision Materials",
            legal_entity: "Precision Materials",
            parent_division: "Alpine",
            sub_division: "Fasteners BU",

            current: 4230000,
            "0_30": 780000,
            "31_60": 530000,
            "61_90": 360000,
            "91_120": 250000,
            "121_180": 180000,
            "181_365": 110000,
            above_365: 80000,

            total_payable: 6520000,
        },

        {
            id: 7,
            supplier_name: "Union Hardware LLC",
            legal_entity: "Alpha Coils",
            parent_division: "Alpine",
            sub_division: "Coils BU",

            current: 3810000,
            "0_30": 690000,
            "31_60": 490000,
            "61_90": 320000,
            "91_120": 220000,
            "121_180": 150000,
            "181_365": 100000,
            above_365: 70000,

            total_payable: 5850000,
        },

        {
            id: 8,
            supplier_name: "Star Components",
            legal_entity: "Global Industrial",
            parent_division: "Others",
            sub_division: "Electrical BU",

            current: 3260000,
            "0_30": 610000,
            "31_60": 420000,
            "61_90": 290000,
            "91_120": 190000,
            "121_180": 130000,
            "181_365": 90000,
            above_365: 60000,

            total_payable: 5050000,
        },

        {
            id: 9,
            supplier_name: "Al Noor Trading",
            legal_entity: "Filter Fan - UAE",
            parent_division: "Filter Fan",
            sub_division: "Fans BU",

            current: 2980000,
            "0_30": 570000,
            "31_60": 390000,
            "61_90": 260000,
            "91_120": 180000,
            "121_180": 120000,
            "181_365": 80000,
            above_365: 50000,

            total_payable: 4630000,
        },

        {
            id: 10,
            supplier_name: "Rapid Parts LLC",
            legal_entity: "DC Serve Equipment",
            parent_division: "DC Serve",
            sub_division: "Service BU",

            current: 2860000,
            "0_30": 520000,
            "31_60": 360000,
            "61_90": 240000,
            "91_120": 160000,
            "121_180": 110000,
            "181_365": 70000,
            above_365: 50000,

            total_payable: 4370000,
        },

        {
            id: 11,
            supplier_name: "Gulf Industrial Supplies",
            legal_entity: "Alpine Gears",
            parent_division: "Alpine Gears",
            sub_division: "Gears BU",

            current: 2740000,
            "0_30": 490000,
            "31_60": 340000,
            "61_90": 220000,
            "91_120": 150000,
            "121_180": 100000,
            "181_365": 70000,
            above_365: 40000,

            total_payable: 4150000,
        },

        {
            id: 12,
            supplier_name: "Prime Mechanical LLC",
            legal_entity: "Alpine Gears",
            parent_division: "Alpine Gears",
            sub_division: "Gears BU",

            current: 2520000,
            "0_30": 450000,
            "31_60": 320000,
            "61_90": 210000,
            "91_120": 140000,
            "121_180": 95000,
            "181_365": 65000,
            above_365: 40000,

            total_payable: 3840000,
        },

        {
            id: 13,
            supplier_name: "United Technical LLC",
            legal_entity: "Filter Fan - UAE",
            parent_division: "Filter Fan",
            sub_division: "Fans BU",

            current: 2380000,
            "0_30": 430000,
            "31_60": 300000,
            "61_90": 200000,
            "91_120": 130000,
            "121_180": 90000,
            "181_365": 60000,
            above_365: 40000,

            total_payable: 3630000,
        },

        {
            id: 14,
            supplier_name: "Eastern Electricals",
            legal_entity: "Global Industrial",
            parent_division: "Others",
            sub_division: "Electrical BU",

            current: 2190000,
            "0_30": 390000,
            "31_60": 280000,
            "61_90": 180000,
            "91_120": 120000,
            "121_180": 80000,
            "181_365": 50000,
            above_365: 30000,

            total_payable: 3320000,
        },

        {
            id: 15,
            supplier_name: "National Hardware",
            legal_entity: "Alpha Coils",
            parent_division: "Alpine",
            sub_division: "Valves BU",

            current: 1980000,
            "0_30": 350000,
            "31_60": 250000,
            "61_90": 160000,
            "91_120": 110000,
            "121_180": 70000,
            "181_365": 50000,
            above_365: 30000,

            total_payable: 3000000,
        },
    ],

    "Invoice Date": [
        {
            id: 1,
            supplier_name: "Alpha Supplies LLC",
            legal_entity: "Alpha Coils",
            parent_division: "Alpine",
            sub_division: "Coils BU",

            current: 11200000,
            "0_30": 3200000,
            "31_60": 1620000,
            "61_90": 840000,
            "91_120": 580000,
            "121_180": 360000,
            "181_365": 210000,
            above_365: 120000,

            total_payable: 18130000,
        },

        {
            id: 2,
            supplier_name: "Global Industrial Co.",
            legal_entity: "Global Industrial",
            parent_division: "Others",
            sub_division: "Electrical BU",

            current: 7900000,
            "0_30": 1960000,
            "31_60": 1280000,
            "61_90": 710000,
            "91_120": 460000,
            "121_180": 290000,
            "181_365": 190000,
            above_365: 110000,

            total_payable: 12900000,
        },

        {
            id: 3,
            supplier_name: "TechParts Trading",
            legal_entity: "Metro Equipment",
            parent_division: "DC Serve",
            sub_division: "Service BU",

            current: 5800000,
            "0_30": 1430000,
            "31_60": 940000,
            "61_90": 550000,
            "91_120": 350000,
            "121_180": 230000,
            "181_365": 170000,
            above_365: 110000,

            total_payable: 9580000,
        },

        {
            id: 4,
            supplier_name: "Metro Equipment FZE",
            legal_entity: "Metro Equipment",
            parent_division: "DC Serve",
            sub_division: "Valves BU",

            current: 5080000,
            "0_30": 1190000,
            "31_60": 710000,
            "61_90": 480000,
            "91_120": 310000,
            "121_180": 210000,
            "181_365": 140000,
            above_365: 100000,

            total_payable: 8220000,
        },

        {
            id: 5,
            supplier_name: "Emirates Industrial",
            legal_entity: "Emirates Trading",
            parent_division: "Others",
            sub_division: "Others",

            current: 4760000,
            "0_30": 1010000,
            "31_60": 650000,
            "61_90": 460000,
            "91_120": 300000,
            "121_180": 200000,
            "181_365": 130000,
            above_365: 90000,

            total_payable: 7600000,
        },
    ],
};

/* ============================================================
   MOCK VIEW ALL SUMMARY
   ============================================================ */

const payablesViewAllSummary = {
    "Due Date": {
        total_payables: 192290000,
        current_payables: 119260000,
        overdue_payables: 73030000,
        overdue_gt_90: 24130000,
        total_records: 1258,
    },

    "Invoice Date": {
        total_payables: 192290000,
        current_payables: 108740000,
        overdue_payables: 83550000,
        overdue_gt_90: 31860000,
        total_records: 1258,
    },
};

/* ============================================================
   CURRENCY CONFIG
   ------------------------------------------------------------
   No dashboard value should hard-code a currency.
   ============================================================ */

const currencyConfig = {
    AED: {
        code: "AED",
        locale: "en-AE",
        decimals: 2,
    },

    INR: {
        code: "INR",
        locale: "en-IN",
        decimals: 2,
    },

    OMR: {
        code: "OMR",
        locale: "en-OM",
        decimals: 2,
    },

    QAR: {
        code: "QAR",
        locale: "en-QA",
        decimals: 2,
    },

    SAR: {
        code: "SAR",
        locale: "en-SA",
        decimals: 2,
    },

    USD: {
        code: "USD",
        locale: "en-US",
        decimals: 2,
    },
};

/* ============================================================
   HELPERS
   ============================================================ */

/**
 * Get data for selected aging basis.
 *
 * This ensures Invoice Date and Due Date are NEVER combined.
 */
const getPayablesDataByBasis = (agingBasis = "Due Date") => {
    const basis =
        agingBasis === "Invoice Date"
            ? "Invoice Date"
            : "Due Date";

    return {
        agingSummary: payablesAgingSummary[basis],
        trend: payablesTrend[basis],
        parentDivision: payablesByParentDivision[basis],
        topSuppliers: top10Suppliers[basis],
        overdueSummary: overdueSummary[basis],
        subDivision: payablesBySubDivision[basis],
        monthOnMonth: monthOnMonthPayables[basis],
        viewAll: payablesViewAll[basis],
        kpis: payablesKpis[basis],
        viewAllSummary: payablesViewAllSummary[basis],

        // This is the value that will eventually be sent
        // to every backend API.
        aging_basis: basis,
    };
};

/**
 * Format currency using selected reporting currency.
 *
 * The currency is passed into the function instead of
 * being hard-coded.
 */
const formatPayablesCurrency = (
    value,
    currency = "AED"
) => {
    if (value === null || value === undefined) {
        return "—";
    }

    const config =
        currencyConfig[currency] || currencyConfig.AED;

    return new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: config.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value));
};

/**
 * Dashboard-friendly M/K formatting.
 *
 * Example:
 * 192290000 -> AED 192.29M
 *
 * Currency is still dynamically selected.
 */
const formatPayablesCompact = (
    value,
    currency = "AED"
) => {
    if (value === null || value === undefined) {
        return "—";
    }

    const config =
        currencyConfig[currency] || currencyConfig.AED;

    const number = Number(value);

    if (Math.abs(number) >= 1000000) {
        return `${config.code} ${(number / 1000000).toFixed(2)}M`;
    }

    if (Math.abs(number) >= 1000) {
        return `${config.code} ${(number / 1000).toFixed(2)}K`;
    }

    return `${config.code} ${number.toFixed(2)}`;
};

/**
 * Month-on-month formatter.
 *
 * IMPORTANT:
 * null -> —
 * NOT zero.
 */
const formatMoMValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    return Number(value).toFixed(2);
};

/**
 * Percentage formatter.
 */
const formatPercentage = (value) => {
    if (value === null || value === undefined) {
        return "—";
    }

    return `${Number(value).toFixed(1)}%`;
};

/**
 * Variance formatter.
 */
const formatVariance = (value) => {
    if (value === null || value === undefined) {
        return "—";
    }

    const number = Number(value);

    return `${number >= 0 ? "▲" : "▼"} ${Math.abs(number).toFixed(
        1
    )}%`;
};

/* ============================================================
   EXPORT MOCK
   ============================================================ */

const mockExportResult = {
    success: true,
    file_name: "Payables_Report_Due_Date_2024-04-30.xlsx",
    format: "xlsx",
    aging_basis: "Due Date",
    reporting_currency: "AED",
};

/* ============================================================
   MOCK API-LIKE FUNCTIONS
   ------------------------------------------------------------
   These allow your JSX to be written almost exactly like
   the future API integration.
   ============================================================ */

const getPayablesFiltersMock = async () => {
    return {
        success: true,
        data: payablesFilterOptions,
    };
};

const getPayablesDashboardMock = async (
    filters = defaultPayablesFilters
) => {
    const data = getPayablesDataByBasis(
        filters.aging_basis
    );

    return {
        success: true,

        filters: {
            ...filters,

            // Always explicitly returned.
            aging_basis: filters.aging_basis,
        },

        data: {
            kpis: data.kpis,

            aging_summary: data.agingSummary,

            trend: data.trend,

            parent_division: data.parentDivision,

            top_suppliers: data.topSuppliers,

            overdue_summary: data.overdueSummary,

            sub_division: data.subDivision,

            month_on_month: data.monthOnMonth,
        },
    };
};

const getPayablesViewAllMock = async (
    filters = defaultPayablesFilters
) => {
    const data = getPayablesDataByBasis(
        filters.aging_basis
    );

    return {
        success: true,

        filters: {
            ...filters,

            aging_basis: filters.aging_basis,
        },

        summary: data.viewAllSummary,

        total_records: data.viewAll.length,

        records: data.viewAll,
    };
};

/* ============================================================
   MOCK EXPORT FUNCTION
   ============================================================ */

const exportPayablesMock = async ({
    filters = defaultPayablesFilters,
    format = "xlsx",
}) => {
    return {
        success: true,

        file_name:
            format === "pdf"
                ? "Payables_Report.pdf"
                : "Payables_Report.xlsx",

        format,

        // Important for the future API.
        aging_basis: filters.aging_basis,

        reporting_currency:
            filters.reporting_currency,

        filters,
    };
};


const BLUE = "#132a78";
const BLUE_2 = "#1d4ed8";
const BORDER = "#e3e8f2";
const TEXT = "#172554";
const MUTED = "#64748b";
const BG = "#f7f9fd";

const cardStyle = {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
};

function formatAxisMillions(value) {
    if (value === null || value === undefined) return "—";
    return `${(Number(value) / 1000000).toFixed(0)}M`;
}

/* ============================================================
   SMALL UI COMPONENTS
   ============================================================ */

function InfoIcon({ title }) {
    return (
        <span
            title={title}
            style={{
                display: "inline-flex",
                width: 15,
                height: 15,
                borderRadius: "50%",
                border: "1px solid #94a3b8",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                color: "#64748b",
                marginLeft: 5,
                cursor: "help",
            }}
        >
            i
        </span>
    );
}

function SectionTitle({ children, info }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "#00000",
                marginBottom: 12,
            }}
        >
            {children}
            {info && <InfoIcon title={info} />}
        </div>
    );
}



function SectionActions({
    onViewAll,
    onExportExcel,
    onExportPdf,
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const runAction = (callback) => {
        setOpen(false);
        if (typeof callback === "function") callback();
    };

    const itemStyle = {
        width: "100%",
        height: 34,
        border: "none",
        background: "transparent",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "0 10px",
        color: "#334155",
        fontSize: 12,
        fontWeight: 800,
        cursor: "pointer",
        textAlign: "left",
    };

    return (
        <div
            ref={menuRef}
            style={{
                position: "absolute",
                top: 9,
                right: 9,
                zIndex: 50,
            }}
        >
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label="More options"
                style={{
                    width: 28,
                    height: 28,
                    border: "none",
                    background: "transparent",
                    color: "#64748b",
                    borderRadius: 6,
                    fontSize: 20,
                    lineHeight: 1,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                }}
            >
                ⋮
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: 31,
                        right: 0,
                        width: 165,
                        padding: 5,
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 9,
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.14)",
                        zIndex: 9999,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => runAction(onViewAll)}
                        style={itemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5ff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >

                        <span>🔎 View All</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => runAction(onExportExcel)}
                        style={itemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5ff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >

                        <span>📊 Export Excel</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => runAction(onExportPdf)}
                        style={itemStyle}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5ff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >

                        <span>📄 Export PDF</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function FilterSelect({
    label,
    value,
    options = [],
    onChange,
    multiple = false,
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef(null);

    /* ----------------------------------------------------------
       NORMALIZE SELECTED VALUES
    ---------------------------------------------------------- */
    const selectedValues = multiple
        ? Array.isArray(value)
            ? value
            : value !== undefined && value !== null && value !== ""
                ? [value]
                : []
        : [];

    /* ----------------------------------------------------------
       CLOSE WHEN CLICKING OUTSIDE
    ---------------------------------------------------------- */
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    /* ----------------------------------------------------------
       NORMALIZE OPTIONS
       ALWAYS KEEP "All" AS FIRST OPTION
    ---------------------------------------------------------- */
    const normalizedOptions = Array.from(
        new Set(
            (options || [])
                .filter(
                    (option) =>
                        option !== null &&
                        option !== undefined &&
                        String(option).trim() !== ""
                )
                .map((option) => String(option))
        )
    );

    // Always keep All in the dropdown
    const finalOptions = normalizedOptions.filter(
        (option) => option !== "All"
    );

    /* ----------------------------------------------------------
       SEARCH
    ---------------------------------------------------------- */
    const filteredOptions = finalOptions.filter((option) =>
        option.toLowerCase().includes(search.toLowerCase())
    );

    /* ----------------------------------------------------------
       SELECT ALL
    ---------------------------------------------------------- */
    const handleSelectAll = () => {
        if (!multiple) return;

        onChange([...finalOptions]);
    };

    /* ----------------------------------------------------------
       CLEAR
    ---------------------------------------------------------- */
    const handleClear = () => {
        if (!multiple) {
            onChange("");
        } else {
            onChange([]);
        }
    };

    /* ----------------------------------------------------------
       INDIVIDUAL OPTION
    ---------------------------------------------------------- */
    const handleOptionClick = (option) => {
        /* SINGLE SELECT */
        if (!multiple) {
            onChange(option);
            setOpen(false);
            setSearch("");
            return;
        }

        /* MULTI SELECT */
        let nextValues = selectedValues.filter(
            (item) => String(item) !== "All"
        );

        if (nextValues.includes(option)) {
            nextValues = nextValues.filter(
                (item) => item !== option
            );
        } else {
            nextValues = [...nextValues, option];
        }

        onChange(nextValues);
    };

    /* ----------------------------------------------------------
       DISPLAY VALUE
    ---------------------------------------------------------- */
    const getDisplayValue = () => {
        if (!multiple) {
            return value !== undefined &&
                value !== null &&
                String(value) !== ""
                ? String(value)
                : "";
        }

        if (selectedValues.length === 0) {
            return "Select";
        }

        if (selectedValues.length === 1) {
            return String(selectedValues[0]);
        }

        return `${selectedValues.length} selected`;
    };
    /* ----------------------------------------------------------
       ALL SELECTED
    ---------------------------------------------------------- */
    const allSelected =
        multiple &&
        finalOptions.length > 0 &&
        finalOptions.every((item) =>
            selectedValues.includes(item)
        );

    return (
        <div
            ref={dropdownRef}
            style={{
                flex: "1 1 0",
                minWidth: 0,
                position: "relative",
            }}
        >
            {/* =====================================================
          LABEL
      ===================================================== */}
            <label
                style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#173b8f",
                    marginBottom: 5,
                    lineHeight: "12px",
                    whiteSpace: "nowrap",
                }}
            >
                {label}
            </label>

            {/* =====================================================
          FIELD
      ===================================================== */}
            <button
                type="button"
                onClick={() => {
                    setOpen((prev) => !prev);

                    if (open) {
                        setSearch("");
                    }
                }}
                style={{
                    width: "100%",
                    height: 34,
                    boxSizing: "border-box",
                    border: open
                        ? "1px solid #5b5bea"
                        : "1px solid #dce3ee",
                    borderRadius: 9,
                    padding: "0 30px 0 11px",
                    background: "#f4f7fb",
                    color: "#24366b",
                    fontSize: 11,
                    fontWeight: 600,
                    outline: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                }}
            >
                {getDisplayValue()}

                <span
                    style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: `translateY(-50%) ${open ? "rotate(180deg)" : "rotate(0deg)"
                            }`,
                        fontSize: 9,
                        color: "#52638a",
                        transition: "transform 0.15s ease",
                        pointerEvents: "none",
                    }}
                >
                    ▼
                </span>
            </button>

            {/* =====================================================
          DROPDOWN
      ===================================================== */}
            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 5px)",
                        left: 0,
                        width: "100%",
                        minWidth: 190,
                        background: "#ffffff",
                        border: "1px solid #dce3ee",
                        borderRadius: 9,
                        boxShadow:
                            "0 8px 24px rgba(24, 45, 80, 0.14)",
                        zIndex: 9999,
                        overflow: "hidden",
                    }}
                >
                    {/* =================================================
              SEARCH
          ================================================= */}
                    <div
                        style={{
                            padding: "8px 8px 6px",
                            borderBottom: "1px solid #edf1f7",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                            }}
                        >
                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                onClick={(e) =>
                                    e.stopPropagation()
                                }
                                placeholder={`Search ${label}`}
                                autoFocus
                                style={{
                                    width: "100%",
                                    height: 30,
                                    boxSizing: "border-box",
                                    border: "1px solid #dce3ee",
                                    borderRadius: 7,
                                    padding: "0 9px 0 28px",
                                    background: "#f8fafc",
                                    color: "#24366b",
                                    fontSize: 10.5,
                                    outline: "none",
                                }}
                            />

                            <span
                                style={{
                                    position: "absolute",
                                    left: 9,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#64748b",
                                    fontSize: 12,
                                    pointerEvents: "none",
                                }}
                            >
                                🔍
                            </span>
                        </div>
                    </div>

                    {/* =================================================
              SELECT ALL / CLEAR
          ================================================= */}
                    {multiple && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "7px 9px",
                                borderBottom: "1px solid #edf1f7",
                                background: "#fafbfe",
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#4f46e5",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                {allSelected
                                    ? "Unselect All"
                                    : "Select All"}
                            </button>

                            <button
                                type="button"
                                onClick={handleClear}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#64748b",
                                    fontSize: 10,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    )}

                    {/* =================================================
              OPTIONS
          ================================================= */}
                    <div
                        style={{
                            maxHeight: 230,
                            overflowY: "auto",
                            padding: "4px 0",
                        }}
                    >
                        {filteredOptions.length === 0 ? (
                            <div
                                style={{
                                    padding: "14px 10px",
                                    textAlign: "center",
                                    color: "#94a3b8",
                                    fontSize: 10.5,
                                }}
                            >
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const selected = multiple
                                    ? selectedValues.includes(option) ||
                                    (
                                        option === "All" &&
                                        selectedValues.includes("All")
                                    )
                                    : String(value || "All") === option;

                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() =>
                                            handleOptionClick(option)
                                        }
                                        style={{
                                            width: "100%",
                                            minHeight: 31,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "5px 10px",
                                            border: "none",
                                            background: selected
                                                ? "#eef2ff"
                                                : "#ffffff",
                                            color: selected
                                                ? "#243b8f"
                                                : "#334155",
                                            fontSize: 10.5,
                                            fontWeight: selected ? 700 : 500,
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        {/* CHECKBOX */}
                                        {multiple && (
                                            <span
                                                style={{
                                                    width: 14,
                                                    height: 14,
                                                    minWidth: 14,
                                                    borderRadius: 3,
                                                    border: selected
                                                        ? "1px solid #5b5bea"
                                                        : "1px solid #cbd5e1",
                                                    background: selected
                                                        ? "#5b5bea"
                                                        : "#ffffff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#ffffff",
                                                    fontSize: 9,
                                                    fontWeight: 800,
                                                    boxSizing: "border-box",
                                                }}
                                            >
                                                {selected ? "✓" : ""}
                                            </span>
                                        )}

                                        <span
                                            style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {option}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function DateFilter({ value, onChange }) {
    return (
        <div
            style={{
                flex: "1 1 0",
                minWidth: 0,
            }}
        >
            <label
                style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#173b8f",
                    marginBottom: 5,
                    lineHeight: "12px",
                    whiteSpace: "nowrap",
                }}
            >
                As On Date
            </label>

            <div
                style={{
                    position: "relative",
                    width: "100%",
                }}
            >
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Select Date"
                    style={{
                        width: "100%",
                        height: 34,
                        boxSizing: "border-box",
                        border: "1px solid #dce3ee",
                        borderRadius: 9,
                        padding: "0 34px 0 11px",
                        background: "#f4f7fb",
                        color: "#24366b",
                        fontSize: 11,
                        fontWeight: 600,
                        outline: "none",
                    }}
                />

                <span
                    style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 13,
                        color: "#64748b",
                        pointerEvents: "none",
                    }}
                >
                    ▣
                </span>
            </div>
        </div>
    );
}
/* ============================================================
   KPI CARD
   ============================================================ */

function KpiCard({
    title,
    value,
    variance,
    previousDate,
    icon,
    iconBg,
    iconColor,
    currency,
    suffix,
}) {
    const formatValue = (value) => {
        if (value === null || value === undefined) return "—";

        // DPO
        if (suffix === "Days") {
            return `${Number(value).toFixed(0)} Days`;
        }

        // Currency values
        if (Number(value) >= 1000000) {
            return `${currency} ${(Number(value) / 1000000).toFixed(2)}M`;
        }

        if (Number(value) >= 1000) {
            return `${currency} ${(Number(value) / 1000).toFixed(2)}K`;
        }

        return `${currency} ${Number(value).toFixed(2)}`;
    };

    const isPositive = Number(variance) >= 0;

    return (
        <div
            style={{
                background: iconBg || "#F8FAFC",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                borderRadius: "12px",
                padding: "14px 16px",
                minHeight: "105px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",

                // Card shadow
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",

                // Smooth hover effect
                transition:
                    "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
                cursor: "default",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(15, 23, 42, 0.06)";
                e.currentTarget.style.filter = "brightness(0.99)";
            }}

            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(15, 23, 42, 0.04)";
                e.currentTarget.style.filter = "brightness(1)";
            }}
        >
            {/* TOP */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                {/* ICON */}
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#F1F5F9",
                        color: iconColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.06)",
                    }}
                >
                    {icon}
                </div>

                {/* TITLE */}
                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: iconColor,
                        lineHeight: 1.2,
                    }}
                >
                    {title}
                </div>
            </div>

            {/* VALUE */}
            <div
                style={{
                    marginLeft: "46px",
                    marginTop: "-2px",
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#111827",
                    lineHeight: 1.1,
                }}
            >
                {formatValue(value)}
            </div>

            {/* VARIANCE */}
            <div
                style={{
                    marginLeft: "46px",
                    fontSize: "11px",
                    color: isPositive ? "#0e9f75" : "#ef476f",
                    fontWeight: 600,
                    lineHeight: 1.2,
                }}
            >
                {variance !== null && variance !== undefined
                    ? `${isPositive ? "▲" : "▼"} ${Math.abs(
                        Number(variance)
                    ).toFixed(1)}%`
                    : "—"}

                {previousDate && (
                    <span
                        style={{
                            color: "#64748b",
                            fontWeight: 500,
                            marginLeft: "4px",
                        }}
                    >
                        vs {previousDate}
                    </span>
                )}
            </div>
        </div>
    );
}


/* ============================================================
   DONUT CHART
   ============================================================ */

function DonutChart({ data, total, currency, centerLabel, legendBelow = false, }) {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const colors = [
        "#1665e8",
        "#0e9f75",
        "#f59e0b",
        "#7c3aed",
        "#ef6b82",
        "#f59ab5",
        "#c026d3",
        "#be185d",
    ];

    const radius = 65;
    const circumference = 2 * Math.PI * radius;

    let accumulated = 0;

    /* ==========================================================
       CLICK SEGMENT
    ========================================================== */
    const handleSegmentClick = (index) => {
        setSelectedIndex((prev) =>
            prev === index ? null : index
        );
    };

    /* ==========================================================
       GET SEGMENT POSITION
       Used to create the "explode / pop-out" effect
    ========================================================== */
    const getSegmentTransform = (
        startLength,
        segmentLength,
        active
    ) => {
        if (!active) {
            return "rotate(-90 87.5 87.5)";
        }

        const startAngle =
            (startLength / circumference) * 360 - 90;

        const segmentAngle =
            (segmentLength / circumference) * 360;

        const middleAngle =
            startAngle + segmentAngle / 2;

        const angleInRadians =
            (middleAngle * Math.PI) / 180;

        /* Distance that the selected slice moves outward */
        const offset = 8;

        const translateX =
            Math.cos(angleInRadians) * offset;

        const translateY =
            Math.sin(angleInRadians) * offset;

        return `
      translate(${translateX} ${translateY})
      rotate(-90 87.5 87.5)
    `;
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: legendBelow ? "column" : "row",
                alignItems: legendBelow ? "center" : "center",
                gap: legendBelow ? 10 : 20,
                minHeight: legendBelow ? 250 : 185,
                position: "relative",
            }}
        >
            {/* =====================================================
          DONUT
      ===================================================== */}
            <div
                style={{
                    width: 175,
                    minWidth: 175,
                    height: 175,
                    position: "relative",
                }}
            >
                <svg
                    width="175"
                    height="175"
                    viewBox="0 0 175 175"
                    style={{
                        overflow: "visible",
                    }}
                >
                    {/* =================================================
              BACKGROUND RING
          ================================================= */}
                    <circle
                        cx="87.5"
                        cy="87.5"
                        r={radius}
                        fill="none"
                        stroke="#eef2f7"
                        strokeWidth="25"
                    />

                    {/* =================================================
              DONUT SEGMENTS
          ================================================= */}
                    {data.map((item, index) => {
                        const percent =
                            Number(item.percentage || 0) / 100;

                        const length =
                            circumference * percent;

                        const offset = -accumulated;

                        const segmentStart = accumulated;

                        accumulated += length;

                        const isSelected =
                            selectedIndex === index;

                        const isHovered =
                            hoveredIndex === index;

                        /*
                          Selected takes priority.
                          Hover also gives the pop-out effect.
                        */
                        const isActive =
                            isSelected || isHovered;

                        return (
                            <circle
                                key={item.bucket}
                                cx="87.5"
                                cy="87.5"
                                r={radius}
                                fill="none"
                                stroke={
                                    colors[index % colors.length]
                                }
                                strokeWidth={
                                    isActive ? 29 : 25
                                }
                                strokeDasharray={`${length} ${circumference - length
                                    }`}
                                strokeDashoffset={offset}
                                transform={getSegmentTransform(
                                    segmentStart,
                                    length,
                                    isActive
                                )}
                                strokeLinecap="butt"
                                style={{
                                    cursor: "pointer",

                                    /*
                                      Selected segment becomes slightly
                                      more prominent, but other segments
                                      remain visible.
                                    */
                                    opacity:
                                        selectedIndex !== null &&
                                            !isSelected
                                            ? 0.55
                                            : 1,

                                    filter: isActive
                                        ? "drop-shadow(0 4px 7px rgba(0,0,0,0.20))"
                                        : "none",

                                    transition:
                                        "transform 0.25s ease, stroke-width 0.2s ease, opacity 0.2s ease, filter 0.2s ease",
                                }}
                                onMouseEnter={() =>
                                    setHoveredIndex(index)
                                }
                                onMouseLeave={() =>
                                    setHoveredIndex(null)
                                }
                                onClick={() =>
                                    handleSegmentClick(index)
                                }
                            />
                        );
                    })}
                </svg>

                {/* ===================================================
            CENTER VALUE
            Hidden ONLY when a segment is clicked/selected
        =================================================== */}
                {selectedIndex === null && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#00000",
                            pointerEvents: "none",
                            transition: "opacity 0.2s ease",
                        }}
                    >
                        <div
                            style={{
                                fontSize: 16,
                                fontWeight: 800,
                            }}
                        >
                            {formatPayablesCompact(
                                total,
                                currency
                            )}
                        </div>

                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                            }}
                        >
                            {centerLabel}
                        </div>
                    </div>
                )}

                {/* ===================================================
            TOOLTIP
        =================================================== */}
                {hoveredIndex !== null &&
                    data[hoveredIndex] && (
                        <div
                            style={{
                                position: "absolute",

                                /*
                                  Positioned similarly to the P&L
                                  Expense Breakdown tooltip.
                                */
                                left: "50%",
                                top: "50%",

                                transform:
                                    "translate(-50%, -50%)",

                                minWidth: 180,
                                background: "#ffffff",
                                border: "1px solid #e5eaf2",
                                borderRadius: 16,
                                padding: "14px 16px",
                                boxShadow:
                                    "0 12px 30px rgba(24,45,80,0.16)",
                                zIndex: 50,
                                pointerEvents: "none",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {/* =================================================
                  TOOLTIP TITLE
              ================================================= */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: "#17213c",
                                    marginBottom: 12,
                                }}
                            >
                                <span
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: 3,
                                        background:
                                            colors[
                                            hoveredIndex %
                                            colors.length
                                            ],
                                        display: "inline-block",
                                    }}
                                />

                                {data[hoveredIndex].bucket}
                            </div>

                            {/* =================================================
                  AMOUNT
              ================================================= */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 24,
                                    marginBottom: 9,
                                    fontSize: 11,
                                }}
                            >
                                <span
                                    style={{
                                        color: "#718096",
                                    }}
                                >
                                    Amount
                                </span>

                                <strong
                                    style={{
                                        color: "#17213c",
                                        fontSize: 13,
                                    }}
                                >
                                    {formatPayablesCompact(
                                        data[hoveredIndex].amount,
                                        currency
                                    )}
                                </strong>
                            </div>

                            {/* =================================================
                  SHARE / PERCENTAGE
              ================================================= */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 24,
                                    fontSize: 11,
                                }}
                            >
                                <span
                                    style={{
                                        color: "#718096",
                                    }}
                                >
                                    Share
                                </span>

                                <strong
                                    style={{
                                        color:
                                            colors[
                                            hoveredIndex %
                                            colors.length
                                            ],
                                        fontSize: 13,
                                    }}
                                >
                                    {formatPercentage(
                                        data[hoveredIndex].percentage
                                    )}
                                </strong>
                            </div>
                        </div>
                    )}
            </div>

            {/* =====================================================
          LEGEND
      ===================================================== */}
            <div
                style={{
                    flex: legendBelow ? "none" : 1,
                    width: legendBelow ? "100%" : "auto",
                    minWidth: 0,
                }}
            >
                {data.map((item, index) => {
                    const isSelected =
                        selectedIndex === index;

                    const isHovered =
                        hoveredIndex === index;

                    const isActive =
                        isSelected || isHovered;

                    return (
                        <div
                            key={item.bucket}
                            onClick={() =>
                                handleSegmentClick(index)
                            }
                            onMouseEnter={() =>
                                setHoveredIndex(index)
                            }
                            onMouseLeave={() =>
                                setHoveredIndex(null)
                            }
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                                marginBottom: 7,
                                fontSize: 12,
                                color: "#334155",
                                cursor: "pointer",
                                padding: "3px 5px",
                                borderRadius: 6,

                                background: isSelected
                                    ? "#f1f5ff"
                                    : isHovered
                                        ? "#f8fafc"
                                        : "transparent",

                                transition:
                                    "background 0.2s ease",
                            }}
                        >
                            {/* Color Dot */}
                            <span
                                style={{
                                    width: 9,
                                    height: 9,
                                    borderRadius: "50%",
                                    background:
                                        colors[
                                        index % colors.length
                                        ],
                                    display: "inline-block",
                                    flexShrink: 0,

                                    boxShadow: isActive
                                        ? `0 0 0 3px ${colors[
                                        index %
                                        colors.length
                                        ]
                                        }22`
                                        : "none",

                                    transition:
                                        "box-shadow 0.2s ease",
                                }}
                            />

                            {/* Bucket */}
                            <span
                                style={{
                                    flex: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    fontWeight: isActive
                                        ? 800
                                        : 700,
                                }}
                            >
                                {item.bucket}
                            </span>

                            {/* Amount */}
                            <strong
                                style={{
                                    color: "#344b8a",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {(Number(item.amount || 0) / 1000000).toFixed(2)}M
                            </strong>

                            {/* Percentage */}
                            <span
                                style={{
                                    color: "#64748b",
                                    minWidth: 36,
                                    whiteSpace: "nowrap",
                                    fontWeight: isActive
                                        ? 700
                                        : 500,
                                }}
                            >
                                (
                                {formatPercentage(
                                    item.percentage
                                )}
                                )
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ============================================================
   TREND CHART
   ============================================================ */

function TrendChart({ data, currency }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const maxValue = Math.max(
        ...data.map((item) => Number(item.total_payables || 0))
    );

    return (
        <div style={{ width: "100%", overflowX: "hidden" }}>
            <div
                style={{
                    width: "100%",
                    height: 220,
                    position: "relative",
                    padding: "10px 10px 35px 45px",
                    boxSizing: "border-box",
                }}
            >
                {[0, 1, 2, 3, 4].map((line) => (
                    <div
                        key={line}
                        style={{
                            position: "absolute",
                            left: 45,
                            right: 10,
                            top: 15 + line * 36,
                            borderTop: "1px dashed #e2e8f0",
                        }}
                    />
                ))}

                <div
                    style={{
                        position: "absolute",
                        left: 3,
                        top: 5,
                        fontSize: 10,
                        color: MUTED,
                    }}
                >
                    {currency} (M)
                </div>

                <div
                    style={{
                        position: "absolute",
                        left: 3,
                        top: 78,
                        fontSize: 9,
                        color: MUTED,
                    }}
                >
                    {formatAxisMillions(maxValue / 2)}
                </div>

                <div
                    style={{
                        position: "absolute",
                        left: 18,
                        bottom: 42,
                        fontSize: 9,
                        color: MUTED,
                    }}
                >
                    0
                </div>

                {/* =====================================================
            BARS
        ===================================================== */}
                <div
                    style={{
                        position: "absolute",
                        left: 55,
                        right: 15,
                        bottom: 35,
                        height: 150,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: 2,
                    }}
                >
                    {data.map((item, index) => {
                        const height =
                            maxValue > 0
                                ? (Number(item.total_payables) / maxValue) * 125
                                : 0;

                        const isHovered = hoveredIndex === index;

                        return (
                            <div
                                key={item.month}
                                style={{
                                    flex: 1,
                                    height: 150,
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* =================================================
                    TOOLTIP
                ================================================= */}

                                {isHovered && (
                                    <div
                                        style={{
                                            position: "absolute",

                                            // Keep tooltip inside the chart
                                            top: 5,

                                            left: "50%",
                                            transform: "translateX(-50%)",

                                            minWidth: 160,
                                            maxWidth: 190,

                                            background: "#ffffff",
                                            border: "1px solid #dce3ee",
                                            borderRadius: 8,

                                            padding: "9px 11px",

                                            boxShadow:
                                                "0 8px 22px rgba(24, 45, 80, 0.16)",

                                            zIndex: 1000,
                                            pointerEvents: "none",

                                            whiteSpace: "normal",
                                            boxSizing: "border-box",
                                        }}
                                    >
                                        {/* Month */}
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 800,
                                                color: "#24366b",
                                                marginBottom: 7,
                                            }}
                                        >
                                            {item.month}
                                        </div>

                                        {/* Total Payables */}
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 15,
                                                fontSize: 11, fontWeight: 800,
                                                marginBottom: 5,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "#64748b",
                                                }}
                                            >
                                                Total Payables
                                            </span>

                                            <strong
                                                style={{
                                                    color: BLUE,
                                                }}
                                            >
                                                {formatPayablesCompact(
                                                    item.total_payables,
                                                    currency
                                                )}
                                            </strong>
                                        </div>

                                        {/* DPO */}
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 15,
                                                fontSize: 11, fontWeight: 800,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: "#64748b",
                                                }}
                                            >
                                                DSO
                                            </span>

                                            <strong
                                                style={{
                                                    color: "#0e9f75",
                                                }}
                                            >
                                                {Number(item.dpo || 0).toFixed(1)} Days
                                            </strong>
                                        </div>
                                    </div>
                                )}

                                {/* Value above bar */}
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: BLUE,
                                        fontWeight: 800,
                                        marginBottom: 3,
                                        opacity: isHovered ? 0 : 1,
                                        transition: "opacity 0.15s ease",
                                    }}
                                >
                                    {(Number(item.total_payables) / 1000000).toFixed(2)}
                                </div>

                                {/* Bar */}
                                <div
                                    style={{
                                        width: isHovered ? "78%" : "70%",
                                        maxWidth: 38,
                                        height,
                                        minHeight: 3,
                                        background: BLUE_2,
                                        borderRadius: "2px 2px 0 0",
                                        cursor: "pointer",
                                        opacity: isHovered ? 0.85 : 1,
                                        boxShadow: isHovered
                                            ? "0 3px 10px rgba(91, 91, 234, 0.25)"
                                            : "none",
                                        transition:
                                            "width 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease",
                                    }}
                                />

                                {/* Month */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: -25,
                                        fontSize: 10,
                                        fontWeight: 800,
                                        color: "#475569",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {item.month}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* =====================================================
            DPO LINE
        ===================================================== */}
                <svg
                    style={{
                        position: "absolute",
                        left: 55,
                        right: 15,
                        bottom: 35,
                        width: "calc(100% - 70px)",
                        height: 125,
                        pointerEvents: "none",
                        overflow: "visible",
                    }}
                    viewBox="0 0 600 125"
                    preserveAspectRatio="none"
                >
                    <polyline
                        points={data
                            .map((item, index) => {
                                const x =
                                    data.length === 1
                                        ? 300
                                        : (index / (data.length - 1)) * 600;

                                const minDpo = Math.min(
                                    ...data.map((d) => Number(d.dpo))
                                );

                                const maxDpo = Math.max(
                                    ...data.map((d) => Number(d.dpo))
                                );

                                const range = Math.max(maxDpo - minDpo, 1);

                                const y =
                                    105 -
                                    ((Number(item.dpo) - minDpo) / range) * 80;

                                return `${x},${y}`;
                            })
                            .join(" ")}
                        fill="none"
                        stroke="#0e9f75"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />

                    {data.map((item, index) => {
                        const x =
                            data.length === 1
                                ? 300
                                : (index / (data.length - 1)) * 600;

                        const minDpo = Math.min(
                            ...data.map((d) => Number(d.dpo))
                        );

                        const maxDpo = Math.max(
                            ...data.map((d) => Number(d.dpo))
                        );

                        const range = Math.max(maxDpo - minDpo, 1);

                        const y =
                            105 -
                            ((Number(item.dpo) - minDpo) / range) * 80;

                        return (
                            <circle
                                key={item.month}
                                cx={x}
                                cy={y}
                                r={hoveredIndex === index ? 5 : 3}
                                fill="#fff"
                                stroke="#0e9f75"
                                strokeWidth={hoveredIndex === index ? 3 : 2}
                                style={{
                                    transition: "r 0.15s ease",
                                }}
                            />
                        );
                    })}
                </svg>
            </div>

            {/* =====================================================
          LEGEND
      ===================================================== */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 20,
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#475569",
                    marginTop: -5,
                }}
            >
                <span>
                    <span
                        style={{
                            display: "inline-block",
                            width: 10,
                            height: 8,
                            background: BLUE_2,
                            marginRight: 5,
                        }}
                    />
                    Total Payables
                </span>

                <span>
                    <span
                        style={{
                            display: "inline-block",
                            width: 18,
                            borderTop: "2px dashed #0e9f75",
                            marginRight: 5,
                            verticalAlign: "middle",

                        }}
                    />
                    DSO (Days)
                </span>
            </div>
        </div>
    );
}

/* ============================================================
   HORIZONTAL BAR CHART
   ============================================================ */

function ParentDivisionChart({ data, currency }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const max = Math.max(...data.map((item) => Number(item.amount || 0)));

    return (
        <div style={{ paddingTop: 5 }}>
            {data.map((item, index) => {
                const width =
                    max > 0 ? (Number(item.amount || 0) / max) * 100 : 0;

                const isHovered = hoveredIndex === index;

                return (
                    <div
                        key={item.name}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "70px 1fr 100px",
                            alignItems: "center",
                            gap: 8,
                            // 👇 Gap between each horizontal bar
                            marginBottom: index === data.length - 1 ? 0 : 25,
                            position: "relative",
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* Division Name */}
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 800,
                                color: "#334155",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {item.name}
                        </div>

                        {/* Bar */}
                        <div
                            style={{
                                height: 17,
                                background: "#eef3fb",
                                borderRadius: 2,
                                overflow: "hidden",
                                cursor: "pointer",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${width}%`,
                                    background: "#1464e8",
                                    opacity: hoveredIndex !== null && !isHovered ? 0.65 : 1,
                                    transition: "opacity 0.15s ease, width 0.2s ease",
                                }}
                            />
                        </div>

                        {/* Value */}
                        <div
                            style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#27438b",
                                textAlign: "right",
                            }}
                        >
                            {formatPayablesCompact(item.amount, "").replace(/^[A-Z]{3}\s*/, "")}{" "}
                            <span
                                style={{
                                    color: "#64748b",
                                    fontWeight: 500,
                                }}
                            >
                                ({formatPercentage(item.percentage)})
                            </span>
                        </div>

                        {/* Hover Tooltip */}
                        {isHovered && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: index === data.length - 1 ? "auto" : "100%",
                                    bottom: index === data.length - 1 ? "100%" : "auto",
                                    transform: "translateX(-50%)",
                                    marginTop: index === data.length - 1 ? 0 : 6,
                                    marginBottom: index === data.length - 1 ? 6 : 0,
                                    zIndex: 9999,
                                    background: "#ffffff",
                                    border: "1px solid #dbe3ef",
                                    borderRadius: 7,
                                    boxShadow: "0 5px 18px rgba(15, 23, 42, 0.16)",
                                    padding: "8px 11px",
                                    minWidth: 165,
                                    whiteSpace: "nowrap",
                                    pointerEvents: "none",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 900,
                                        color: "#173b8f",
                                        marginBottom: 5,
                                    }}
                                >
                                    {item.name}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 18,
                                        fontSize: 11, fontWeight: 900,
                                        marginBottom: 3,
                                    }}
                                >
                                    <span style={{ color: "#64748b" }}>
                                        Payables
                                    </span>

                                    <span
                                        style={{
                                            color: "#27438b",
                                            fontWeight: 800,
                                        }}
                                    >
                                        {formatPayablesCompact(item.amount, currency)}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 18,
                                        fontSize: 11, fontWeight: 900,
                                    }}
                                >
                                    <span style={{ color: "#64748b" }}>
                                        Percentage
                                    </span>

                                    <span
                                        style={{
                                            color: "#27438b",
                                            fontWeight: 800,
                                        }}
                                    >
                                        {formatPercentage(item.percentage)}
                                    </span>
                                </div>
                            </div>
                        )}

                    </div>
                );
            })}
        </div>
    );
}

/* ============================================================
   TABLE
   ============================================================ */
function DataTable({
    columns,
    rows,
    compact = false,
    fitColumns = false,
    compactRows = false,
    rowGap = false, // 👈 add this
}) {
    return (
        <div
            style={{
                width: "100%",
                overflowX: fitColumns ? "hidden" : "auto",
                border: "1px solid #e5eaf2",
                borderRadius: 5,
            }}
        >
            <table
                style={{
                    width: "100%",
                    minWidth: fitColumns ? 0 : compact ? 520 : 650,
                    tableLayout: fitColumns ? "fixed" : "auto",
                    borderCollapse: "collapse",
                    fontSize: 10,
                }}
            >
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                style={{
                                    background: "#eef4ff",
                                    color: BLUE,
                                    fontWeight: 700,
                                    padding: compactRows
                                        ? "5px 4px"
                                        : "7px 4px",
                                    borderBottom: "1px solid #dce5f4",
                                    textAlign: column.align || "left",
                                    whiteSpace: fitColumns
                                        ? "normal"
                                        : "nowrap",
                                }}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={row.id || rowIndex}>
                            {columns.map((column) => (
                                <td
                                    key={column.key}
                                    style={{
                                        padding: rowGap
                                            ? "13px 4px" // 👈 more row spacing
                                            : compactRows
                                                ? "3px 4px"
                                                : "6px 4px",

                                        lineHeight: rowGap
                                            ? "17px"
                                            : compactRows
                                                ? "14px"
                                                : "normal",

                                        borderBottom:
                                            rowIndex === rows.length - 1
                                                ? "none"
                                                : "1px solid #edf1f6",

                                        color: "#334155", fontWeight: 700,
                                        textAlign: column.align || "left",

                                        whiteSpace: fitColumns
                                            ? "normal"
                                            : "nowrap",

                                        overflow: fitColumns
                                            ? "hidden"
                                            : "visible",

                                        textOverflow: fitColumns
                                            ? "ellipsis"
                                            : "clip",
                                    }}
                                >
                                    {(() => {
                                        const value = column.render
                                            ? column.render(row)
                                            : row[column.key];

                                        if (typeof value === "string") {
                                            return value
                                                .replace(
                                                    /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
                                                    ""
                                                )
                                                .replace(/^#\s*/, "");
                                        }

                                        return value;
                                    })()}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function PayablesDashboard() {
    const [filters, setFilters] = useState({
        ...defaultPayablesFilters,
    });

    const [appliedFilters, setAppliedFilters] = useState({
        ...defaultPayablesFilters,
    });

    const [showFilters, setShowFilters] = useState(true);
    const [showViewAll, setShowViewAll] = useState(false);

    const data = useMemo(
        () => getPayablesDataByBasis(appliedFilters.aging_basis),
        [appliedFilters.aging_basis]
    );

    const kpis = data.kpis;

    const currency = appliedFilters.reporting_currency;

    const setFilter = (key, value) => {
        setFilters((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const handleApply = () => {
        /*
         * IMPORTANT:
         * aging_basis is preserved exactly here.
         * Future API calls should send:
         *
         * {
         *   ...filters,
         *   aging_basis: filters.aging_basis
         * }
         */
        setAppliedFilters({
            ...filters,
            aging_basis:
                filters.aging_basis === "Invoice Date"
                    ? "Invoice Date"
                    : "Due Date",
        });
    };

    const handleReset = () => {
        const reset = {
            ...defaultPayablesFilters,
        };

        setFilters(reset);
        setAppliedFilters(reset);
    };

    const handleExport = async (format) => {
        try {
            const result = await exportPayablesMock({
                filters: appliedFilters,
                format: format === "excel" ? "xlsx" : "pdf",
            });

            // Keep the existing export integration point intact.
            // Replace only the mock function later when the real API is connected.
            console.log("Payables export", result);
        } catch (error) {
            console.error("Payables export failed", error);
        }
    };

    const openPayablesViewAll = () => {
        setShowViewAll(true);
    };

    const supplierRows = data.topSuppliers;

    const supplierColumns = [
        {
            key: "rank",
            label: "#",
            align: "left",
        },
        {
            key: "supplier_name",
            label: "Customer Name",
        },
        {
            key: "payable_amount",
            label: `Receivables (${currency})`,
            align: "right",
            render: (row) =>
                formatPayablesCompact(row.payable_amount, currency),
        },
        {
            key: "percentage",
            label: "% of Total",
            align: "right",
            render: (row) => formatPercentage(row.percentage),
        },
    ];

    const subDivisionColumns = [
        {
            key: "name",
            label: "Sub-Division",
        },
        {
            key: "amount",
            label: `Receivables (${currency})`,
            align: "right",
            render: (row) =>
                formatPayablesCompact(row.amount, currency),
        },
        {
            key: "percentage",
            label: "% of Total",
            align: "right",
            render: (row) => formatPercentage(row.percentage),
        },
    ];

    const monthColumns = [
        {
            key: "legal_entity",
            label: "Legal Entity",
        },
        {
            key: "parent_division",
            label: "Parent Division",
        },
        {
            key: "sub_division",
            label: "Sub-Division",
        },
        ...MONTHS.map((month) => ({
            key: month,
            label: month,
            align: "right",
            render: (row) => formatMoMValue(row[month]),
        })),
        {
            key: "latest",
            label: "Latest",
            align: "right",
            render: (row) => formatMoMValue(row.latest),
        },
    ];

    return (
        <div
            style={{
                minHeight: "100vh",
                background: BG,
                fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: TEXT,
            }}
        >
            {/* ======================================================
          PAGE CONTENT
          ====================================================== */}

            <main
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "16px 18px 22px",
                }}
            >
                {/* HEADER */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 15,
                        marginBottom: 12,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                margin: 0,
                                color: "#00000",
                                fontSize: 26,
                                lineHeight: 1.1,
                                fontWeight: 800,
                            }}
                        >
                            Receivables Dashboard
                        </h1>

                        <div
                            style={{
                                marginTop: 3,
                                color: "#66789e",
                                fontSize: 12,
                            }}
                        >
                            Track receivables, aging, overdue exposure and payment
                            performance
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                        }}
                    >

                        {/* Excel */}
                        <button
                            type="button"
                            onClick={() => handleExport("excel")}
                            style={{
                                height: 34,
                                minWidth: 80,
                                padding: "0 13px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                border: "1px solid #86efac",
                                borderRadius: 8,
                                background: "#f7fffa",
                                color: "#16a34a",
                                fontSize: 11,
                                fontWeight: 800,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#ecfdf5";
                                e.currentTarget.style.borderColor = "#4ade80";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#f7fffa";
                                e.currentTarget.style.borderColor = "#86efac";
                            }}
                        >
                            <span style={{ fontSize: 13 }}>📊</span>
                            Excel
                        </button>

                        {/* PDF */}
                        <button
                            type="button"
                            onClick={() => handleExport("pdf")}
                            style={{
                                height: 34,
                                minWidth: 72,
                                padding: "0 13px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                border: "1px solid #fda4af",
                                borderRadius: 8,
                                background: "#fff8f8",
                                color: "#ef4444",
                                fontSize: 11,
                                fontWeight: 800,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#fff1f2";
                                e.currentTarget.style.borderColor = "#fb7185";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#fff8f8";
                                e.currentTarget.style.borderColor = "#fda4af";
                            }}
                        >
                            <span style={{ fontSize: 13 }}>📄</span>
                            PDF
                        </button>


                    </div>
                </div>

                {/* ==================================================
            PAYABLE-SPECIFIC FILTER BAR
            ================================================== */}

                <div
                    style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "#ffffff",
                        border: "1px solid #edf1f7",
                        borderRadius: 12,
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 10,
                        boxShadow: "0 2px 8px rgba(30, 55, 90, 0.04)",
                        overflow: "visible",
                    }}
                >
                    <FilterSelect
                        label="Legal Group"
                        value={filters.legal_group}
                        options={payablesFilterOptions.legal_groups}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                legal_group: value,
                            }))
                        }
                    />

                    <FilterSelect
                        label="Legal Entity"
                        value={filters.legal_entities}
                        options={payablesFilterOptions.legal_entities}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                legal_entities: value,
                            }))
                        }
                    />

                    <FilterSelect
                        label="Parent Division"
                        value={filters.parent_divisions}
                        options={payablesFilterOptions.parent_divisions}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                parent_divisions: value,
                            }))
                        }
                    />

                    <FilterSelect
                        label="Sub-Division"
                        value={filters.sub_divisions}
                        options={payablesFilterOptions.sub_divisions}
                        multiple
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                sub_divisions: value,
                            }))
                        }
                    />

                    <FilterSelect
                        label="Reporting Currency"
                        value={filters.reporting_currency}
                        options={payablesFilterOptions.reporting_currencies}
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                reporting_currency: value,
                            }))
                        }
                    />

                    <FilterSelect
                        label="Aging Basis"
                        value={filters.aging_basis}
                        options={payablesFilterOptions.aging_basis}
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                aging_basis: value,
                            }))
                        }
                    />

                    <DateFilter
                        value={filters.as_on_date}
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                as_on_date: value,
                            }))
                        }
                    />

                    <button
                        type="button"
                        onClick={handleApply}
                        style={{
                            height: 34,
                            minWidth: 76,
                            padding: "0 18px",
                            border: "none",
                            borderRadius: 9,
                            background: "#5b5bea",
                            color: "#ffffff",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 3px 8px rgba(91, 91, 234, 0.20)",
                            flexShrink: 0,
                        }}
                    >
                        Apply
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                            height: 34,
                            minWidth: 66,
                            padding: "0 16px",
                            border: "1px solid #e0e5ee",
                            borderRadius: 9,
                            background: "#ffffff",
                            color: "#52638a",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                    >
                        Reset
                    </button>
                </div>

                {/* ==================================================
            KPI CARDS
            ================================================== */}

                <div
                    style={{
                        marginTop: "20px",
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(5, minmax(0, 1fr))",
                        gap: 9,
                        marginBottom: 12,
                    }}
                >
                    <KpiCard
                        title="Total Receivables"
                        value={kpis.total_payables}
                        variance={kpis.total_payables_variance}
                        previousDate={kpis.previous_date}
                        currency={currency}
                        icon="▤"
                        iconBg="#F5F9FF"
                        iconColor="#2563eb"
                    />

                    <KpiCard
                        title="Current Receivables"
                        value={kpis.current_payables}
                        variance={kpis.current_payables_variance}
                        previousDate={kpis.previous_date}
                        currency={currency}
                        icon="▣"
                        iconBg="#F3FCF6"
                        iconColor="#0e9f75"
                    />

                    <KpiCard
                        title="Overdue Receivables"
                        value={kpis.overdue_payables}
                        variance={kpis.overdue_payables_variance}
                        previousDate={kpis.previous_date}
                        currency={currency}
                        icon="⌛"
                        iconBg="#FFF9F3"
                        iconColor="#f59e0b"
                    />

                    <KpiCard
                        title="Overdue > 90 Days"
                        value={kpis.overdue_gt_90}
                        variance={kpis.overdue_gt_90_variance}
                        previousDate={kpis.previous_date}
                        currency={currency}
                        icon="!"
                        iconBg="#FFF7FA"
                        iconColor="#ef476f"
                    />

                    <KpiCard
                        title="DSO – Days Sales Outstanding"
                        value={kpis.dpo}
                        variance={kpis.dpo_variance}
                        previousDate={kpis.previous_date}
                        suffix="Days"
                        currency={currency}
                        icon="%"
                        iconBg="#F3FCFF"
                        iconColor="#0ea5c9"
                    />

                </div>

                {/* ==================================================
            ROW 1
            ================================================== */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 9,
                        marginBottom: 9,
                        width: "100%",
                        alignItems: "stretch",
                    }}
                >
                    {/* Aging Summary */}
                    <section
                        style={{
                            ...cardStyle,
                            padding: 12,
                            minWidth: 0,
                            width: "100%",
                            boxSizing: "border-box",
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <SectionActions
                            onViewAll={openPayablesViewAll}
                            onExportExcel={() => handleExport("excel")}
                            onExportPdf={() => handleExport("pdf")}
                        />
                        <SectionTitle info="Receivables grouped by aging bucket">
                            Receivables Aging Summary ({currency})
                        </SectionTitle>

                        <div
                            style={{
                                width: "100%",
                                minWidth: 0,
                                overflow: "hidden",
                            }}
                        >
                            <DonutChart
                                data={data.agingSummary}
                                total={kpis.total_payables}
                                currency={currency}
                                centerLabel="Total"
                            />
                        </div>
                    </section>

                    {/* Trend */}
                    <section
                        style={{
                            ...cardStyle,
                            padding: 12,
                            minWidth: 0,
                            width: "100%",
                            boxSizing: "border-box",
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <SectionActions
                            onViewAll={openPayablesViewAll}
                            onExportExcel={() => handleExport("excel")}
                            onExportPdf={() => handleExport("pdf")}
                        />
                        <SectionTitle info="Historical total receivables and DSO">
                            Receivables Trend ({currency})
                        </SectionTitle>

                        <div
                            style={{
                                width: "100%",
                                minWidth: 0,
                                overflow: "hidden",
                            }}
                        >
                            <TrendChart
                                data={data.trend}
                                currency={currency}
                            />
                        </div>
                    </section>

                    {/* Parent Division */}
                    <section
                        style={{
                            ...cardStyle,
                            padding: 12,
                            minWidth: 0,
                            width: "100%",
                            boxSizing: "border-box",
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <SectionActions
                            onViewAll={openPayablesViewAll}
                            onExportExcel={() => handleExport("excel")}
                            onExportPdf={() => handleExport("pdf")}
                        />
                        <SectionTitle>
                            Receivables by Parent Division ({currency})
                        </SectionTitle>

                        <div
                            style={{
                                width: "100%",
                                minWidth: 0,
                                overflow: "hidden",
                            }}
                        >
                            <ParentDivisionChart
                                data={data.parentDivision}
                                currency={currency}
                            />
                        </div>
                    </section>
                </div>

                {/* ==================================================
            ROW 2
            ================================================== */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 9,
                        marginBottom: 9,
                        width: "100%",
                    }}
                >
                    {/* Top 10 Customers */}

                    <section
                        style={{ ...cardStyle, padding: 12, position: "relative" }}
                    >
                        <SectionActions
                            onViewAll={openPayablesViewAll}
                            onExportExcel={() => handleExport("excel")}
                            onExportPdf={() => handleExport("pdf")}
                        />
                        <SectionTitle>
                            Top 10 Customers by Receivables ({currency})
                        </SectionTitle>

                        <DataTable
                            columns={supplierColumns}
                            rows={data.topSuppliers}
                            fitColumns
                            compactRows
                        />
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 100px 55px",
                                alignItems: "center",
                                marginTop: 7,
                                padding: "0 4px",
                                color: BLUE,
                                fontSize: 12,
                                fontWeight: 700,
                            }}
                        >
                            {/* Total */}
                            <span
                                style={{
                                    textAlign: "center",
                                }}
                            >
                                Total
                            </span>

                            {/* Amount */}
                            <span
                                style={{
                                    textAlign: "left",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {formatPayablesCompact(
                                    supplierRows.reduce(
                                        (sum, item) =>
                                            sum + Number(item.payable_amount || 0),
                                        0
                                    ),
                                    currency
                                ).replace(
                                    /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
                                    ""
                                )}
                            </span>

                            {/* Percentage */}
                            <span
                                style={{
                                    textAlign: "right",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {formatPercentage(
                                    supplierRows.reduce(
                                        (sum, item) =>
                                            sum + Number(item.percentage || 0),
                                        0
                                    )
                                )}
                            </span>
                        </div>
                    </section>

                    {/* Overdue Summary */}

                    <section
                        style={{ ...cardStyle, padding: 12, position: "relative" }}
                    >
                        <SectionActions
                            onViewAll={openPayablesViewAll}
                            onExportExcel={() => handleExport("excel")}
                            onExportPdf={() => handleExport("pdf")}
                        />
                        <SectionTitle>
                            Overdue Summary ({currency})
                        </SectionTitle>



                        <DonutChart
                            data={data.overdueSummary}
                            total={kpis.overdue_payables}
                            currency={currency}
                            centerLabel="Overdue"
                            legendBelow
                        />
                    </section>

                    {/* Sub Division */}

                    <section
                        style={{ ...cardStyle, padding: 12, position: "relative" }}
                    >
                        <SectionActions
                            onViewAll={openPayablesViewAll}
                            onExportExcel={() => handleExport("excel")}
                            onExportPdf={() => handleExport("pdf")}
                        />
                        <SectionTitle>
                            Receivables by Sub-Division ({currency})
                        </SectionTitle>

                        <DataTable
                            columns={subDivisionColumns}
                            rows={data.subDivision}
                            fitColumns
                            rowGap
                        />

                        <div
                            style={{
                                marginTop: 7,
                                display: "grid",
                                gridTemplateColumns: "1fr 100px 55px",
                                alignItems: "center",
                                padding: "0 4px",
                                color: BLUE,
                                fontSize: 12,
                                fontWeight: 700,
                            }}
                        >
                            {/* Total */}
                            <span
                                style={{
                                    textAlign: "left",
                                }}
                            >
                                Total
                            </span>

                            {/* Amount */}
                            <span
                                style={{
                                    textAlign: "left",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {formatPayablesCompact(
                                    data.subDivision.reduce(
                                        (sum, item) =>
                                            sum + Number(item.amount || 0),
                                        0
                                    ),
                                    currency
                                ).replace(
                                    /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
                                    ""
                                )}
                            </span>

                            {/* Percentage */}
                            <span
                                style={{
                                    textAlign: "right",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                100.0%
                            </span>
                        </div>
                    </section>
                </div>

                {/* ==================================================
            MONTH-ON-MONTH
            ================================================== */}

                <section
                    style={{
                        ...cardStyle,
                        padding: 12,
                        marginBottom: 10,
                        position: "relative",
                    }}
                >
                    <SectionActions
                        onViewAll={openPayablesViewAll}
                        onExportExcel={() => handleExport("excel")}
                        onExportPdf={() => handleExport("pdf")}
                    />
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 14,
                            marginBottom: 10,
                            paddingRight: 42,
                            boxSizing: "border-box",
                        }}
                    >
                        <SectionTitle info="Monthly payable balance by legal entity">
                            Month-on-Month Receivables ({currency})
                        </SectionTitle>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginRight: 4,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 10,
                                    color: MUTED,
                                }}
                            >
                                Year
                            </span>

                            <select
                                value={filters.year}
                                onChange={(e) =>
                                    setFilter(
                                        "year",
                                        Number(e.target.value)
                                    )
                                }
                                style={{
                                    height: 30,
                                    minWidth: 75,
                                    border: "1px solid #d5ddeb",
                                    borderRadius: 5,
                                    background: "#fff",
                                    color: BLUE,
                                    padding: "0 8px",
                                    fontSize: 10,
                                    fontWeight: 600,
                                }}
                            >
                                {payablesFilterOptions.years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <DataTable
                        columns={monthColumns}
                        rows={data.monthOnMonth}
                    />

                </section>

                {/* ==================================================
            FOOTER
            ================================================== */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        fontSize: 9,
                        color: "#64748b",
                        padding: "3px 8px",
                    }}
                >
                    <span>
                        Values shown in selected reporting currency
                    </span>

                    <span>
                        Aging Basis:{" "}
                        <strong style={{ color: BLUE }}>
                            {appliedFilters.aging_basis}
                        </strong>
                    </span>

                    <span>
                        As on: {appliedFilters.as_on_date}
                    </span>
                </div>
            </main>

            {/* ======================================================
          VIEW ALL MODAL
          ====================================================== */}

            {showViewAll && (
                <PayablesViewAll
                    filters={appliedFilters}
                    data={data.viewAll}
                    currency={currency}
                    onClose={() => setShowViewAll(false)}
                />
            )}
        </div>
    );
}

/* ============================================================
   VIEW ALL
   ============================================================ */

function PayablesViewAll({
    filters,
    data,
    currency,
    onClose,
}) {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("total_payable");
    const [sortDirection, setSortDirection] = useState("desc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    /* ============================================================
       VIEW ALL FILTERS
    ============================================================ */

    const getInitialViewFilters = () => ({
        legal_group: [],
        legal_entities: [],
        parent_divisions: [],
        sub_divisions: [],
        reporting_currency: currency || "AED",
        as_on_date:
            filters?.as_on_date ||
            filters?.as_on_dates ||
            filters?.asOfDate ||
            "",
        aging_basis:
            filters?.aging_basis ||
            filters?.agingBasis ||
            "Due Date",
    });

    const [viewFilters, setViewFilters] = useState(
        getInitialViewFilters
    );

    const [appliedViewFilters, setAppliedViewFilters] =
        useState(getInitialViewFilters);

    /* ============================================================
       DROPDOWN STATE
    ============================================================ */

    const [openFilter, setOpenFilter] = useState(null);

    const [filterSearch, setFilterSearch] = useState({
        legal_group: "",
        legal_entities: "",
        parent_divisions: "",
        sub_divisions: "",
        reporting_currency: "",
        as_on_date: "",
        aging_basis: "",
    });

    const safeData = Array.isArray(data) ? data : [];

    /* ============================================================
       MOCK FILTER OPTIONS
    ============================================================ */

    const getUniqueValues = (key) => {
        const values = safeData
            .map((row) => row?.[key])
            .filter(
                (value) =>
                    value !== undefined &&
                    value !== null &&
                    String(value).trim() !== ""
            )
            .map((value) => String(value));

        return [...new Set(values)];
    };

    const mockLegalGroups = [
        "FJ Group (Consolidated)",
        "FJ Group",
        "FJ Manufacturing Group",
    ];

    const mockLegalEntities = [
        "Alpha Ducts LLC",
        "Alpine Coils Industry LLC",
        "DC Servo Equipment Trading LLC",
        "Euroclima Middle East Central LLC",
        "FJ Care Airconditioning Trading LLC",
        "FJ Care Technical Services LLC",
        "FJ Industries WLL",
        "Flowtech Air Distribution Industries LLC",
        "Tawreed Co. LLC",
    ];

    const mockParentDivisions = [
        "Manufacturing",
        "Trading",
        "Services",
        "Corporate",
    ];

    const mockSubDivisions = [
        "Air Distribution",
        "HVAC",
        "Technical Services",
        "Projects",
        "Trading",
    ];

    const viewFilterOptions = {
        legal_group:
            getUniqueValues("legal_group").length > 0
                ? getUniqueValues("legal_group")
                : mockLegalGroups,

        legal_entities:
            getUniqueValues("legal_entity").length > 0
                ? getUniqueValues("legal_entity")
                : mockLegalEntities,

        parent_divisions:
            getUniqueValues("parent_division").length > 0
                ? getUniqueValues("parent_division")
                : mockParentDivisions,

        sub_divisions:
            getUniqueValues("sub_division").length > 0
                ? getUniqueValues("sub_division")
                : mockSubDivisions,

        reporting_currencies: [
            "AED",
            "INR",
            "OMR",
            "QAR",
            "SAR",
            "USD",
        ],

        as_on_dates: [
            "30 Apr 2024",
            "31 May 2024",
            "30 Jun 2024",
            "31 Jul 2024",
            "31 Aug 2024",
            "30 Sep 2024",
        ],

        aging_basis: [
            "Due Date",
            "Invoice Date",
            "Accounting Date",
        ],
    };

    /* ============================================================
       FILTER HELPERS
    ============================================================ */

    const getFilterValue = (key, fallback = "All") => {
        const value = filters?.[key];

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return fallback;
        }

        if (Array.isArray(value)) {
            return value.length ? value.join(", ") : fallback;
        }

        return value;
    };

    const formatDate = (value) => {
        if (!value) return "30 Apr 2024";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const cleanCurrency = (value) => {
        if (typeof value !== "string") {
            return value;
        }

        return value.replace(
            /^(AED|INR|OMR|QAR|SAR|USD)\s*/i,
            ""
        );
    };

    const formatTableAmount = (value) => {
        const number = Number(value || 0);

        if (number < 0) {
            return `(${Math.abs(number).toLocaleString("en-US", {
                maximumFractionDigits: 0,
            })})`;
        }

        return number.toLocaleString("en-US", {
            maximumFractionDigits: 0,
        });
    };

    /* ============================================================
       DROPDOWN HELPERS
    ============================================================ */

    const multiFilterConfig = {
        legal_group: {
            label: "Legal Group",
            options: viewFilterOptions.legal_group,
        },

        legal_entities: {
            label: "Legal Entity",
            options: viewFilterOptions.legal_entities,
        },

        parent_divisions: {
            label: "Parent Division",
            options: viewFilterOptions.parent_divisions,
        },

        sub_divisions: {
            label: "Sub-Division",
            options: viewFilterOptions.sub_divisions,
        },
    };

    const singleFilterConfig = {
        reporting_currency: {
            label: "Reporting Currency",
            options: viewFilterOptions.reporting_currencies,
        },

        as_on_date: {
            label: "As On Date",
            options: viewFilterOptions.as_on_dates,
        },

        aging_basis: {
            label: "Aging Basis",
            options: viewFilterOptions.aging_basis,
        },
    };

    const handleFilterSearch = (key, value) => {
        setFilterSearch((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const toggleMultiFilterValue = (key, value) => {
        setViewFilters((prev) => {
            const currentValues = Array.isArray(prev[key])
                ? prev[key]
                : [];

            const exists = currentValues.includes(value);

            return {
                ...prev,
                [key]: exists
                    ? currentValues.filter((item) => item !== value)
                    : [...currentValues, value],
            };
        });
    };

    const selectAllFilterValues = (key) => {
        setViewFilters((prev) => ({
            ...prev,
            [key]: [...(multiFilterConfig[key]?.options || [])],
        }));
    };

    const clearFilterValues = (key) => {
        setViewFilters((prev) => ({
            ...prev,
            [key]: Array.isArray(prev[key]) ? [] : "",
        }));

        setFilterSearch((prev) => ({
            ...prev,
            [key]: "",
        }));
    };

    const selectSingleFilterValue = (key, value) => {
        setViewFilters((prev) => ({
            ...prev,
            [key]: value,
        }));

        setOpenFilter(null);
    };

    const getMultiFilterDisplayValue = (key) => {
        const selected = Array.isArray(viewFilters[key])
            ? viewFilters[key]
            : [];

        const options = multiFilterConfig[key]?.options || [];

        if (selected.length === 0) {
            return "All";
        }

        if (selected.length === options.length) {
            return "All";
        }

        if (selected.length <= 2) {
            return selected.join(", ");
        }

        return `${selected.length} selected`;
    };

    const getSingleFilterDisplayValue = (key) => {
        const value = viewFilters[key];

        if (!value) {
            return "All";
        }

        return value;
    };

    /* ============================================================
       FILTER DROPDOWN
    ============================================================ */

    const MultiSelectDropdown = ({
        filterKey,
        label,
    }) => {
        const options = multiFilterConfig[filterKey]?.options || [];

        const query = (
            filterSearch[filterKey] || ""
        )
            .trim()
            .toLowerCase();

        const filteredOptions = options.filter((option) =>
            String(option)
                .toLowerCase()
                .includes(query)
        );

        const selectedValues = Array.isArray(
            viewFilters[filterKey]
        )
            ? viewFilters[filterKey]
            : [];

        const allSelected =
            options.length > 0 &&
            selectedValues.length === options.length;

        return (
            <div
                style={{
                    position: "relative",
                }}
            >
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#173b8f",
                        marginBottom: 5,
                    }}
                >
                    {label}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setOpenFilter((current) =>
                            current === filterKey ? null : filterKey
                        );
                    }}
                    style={{
                        width: "100%",
                        height: 34,
                        border: "1px solid #d9e1ee",
                        borderRadius: 5,
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 9px",
                        boxSizing: "border-box",
                        color: "#29427f",
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        textAlign: "left",
                    }}
                >
                    <span
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            paddingRight: 5,
                        }}
                    >
                        {getMultiFilterDisplayValue(filterKey)}
                    </span>

                    <span
                        style={{
                            color: "#173b8f",
                            flexShrink: 0,
                        }}
                    >
                        ⌄
                    </span>
                </button>

                {openFilter === filterKey && (
                    <div
                        style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            width: "100%",
                            minWidth: 230,
                            background: "#ffffff",
                            border: "1px solid #d7dfeb",
                            borderRadius: 6,
                            boxShadow:
                                "0 8px 20px rgba(15, 23, 42, 0.12)",
                            zIndex: 5000,
                            overflow: "hidden",
                        }}
                    >
                        {/* SEARCH */}
                        <div
                            style={{
                                padding: "7px 8px",
                                borderBottom: "1px solid #edf1f6",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                }}
                            >
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 9,
                                        top: "50%",
                                        transform:
                                            "translateY(-50%)",
                                        color: "#94a3b8",
                                        fontSize: 13,
                                    }}
                                >
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={filterSearch[filterKey] || ""}
                                    onChange={(e) =>
                                        handleFilterSearch(
                                            filterKey,
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search..."
                                    autoFocus
                                    style={{
                                        width: "100%",
                                        height: 30,
                                        border:
                                            "1px solid #d9e1ee",
                                        borderRadius: 5,
                                        padding:
                                            "0 8px 0 27px",
                                        outline: "none",
                                        fontSize: 10,
                                        color: "#334155",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        </div>

                        {/* SELECT ALL / CLEAR */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "7px 9px",
                                borderBottom:
                                    "1px solid #edf1f6",
                                fontSize: 10,
                                fontWeight: 700,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    selectAllFilterValues(
                                        filterKey
                                    )
                                }
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#24479d",
                                    cursor: "pointer",
                                    fontSize: 10,
                                    fontWeight: 700,
                                }}
                            >
                                {allSelected
                                    ? "Deselect All"
                                    : "Select All"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    clearFilterValues(
                                        filterKey
                                    )
                                }
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#64748b",
                                    cursor: "pointer",
                                    fontSize: 10,
                                    fontWeight: 600,
                                }}
                            >
                                Clear
                            </button>
                        </div>

                        {/* OPTIONS */}
                        <div
                            style={{
                                maxHeight: 220,
                                overflowY: "auto",
                                padding: "3px 0",
                            }}
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => {
                                    const checked =
                                        selectedValues.includes(
                                            option
                                        );

                                    return (
                                        <label
                                            key={option}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 7,
                                                padding:
                                                    "6px 9px",
                                                cursor: "pointer",
                                                fontSize: 10,
                                                color: "#334155",
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    toggleMultiFilterValue(
                                                        filterKey,
                                                        option
                                                    )
                                                }
                                                style={{
                                                    width: 12,
                                                    height: 12,
                                                    margin: 0,
                                                    accentColor:
                                                        "#4936e9",
                                                }}
                                            />

                                            <span
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow:
                                                        "ellipsis",
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                                title={option}
                                            >
                                                {option}
                                            </span>
                                        </label>
                                    );
                                })
                            ) : (
                                <div
                                    style={{
                                        padding: 15,
                                        textAlign: "center",
                                        color: "#94a3b8",
                                        fontSize: 10,
                                    }}
                                >
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const SingleSelectDropdown = ({
        filterKey,
        label,
    }) => {
        const options =
            singleFilterConfig[filterKey]?.options || [];

        const query = (
            filterSearch[filterKey] || ""
        )
            .trim()
            .toLowerCase();

        const filteredOptions = options.filter((option) =>
            String(option)
                .toLowerCase()
                .includes(query)
        );

        return (
            <div
                style={{
                    position: "relative",
                }}
            >
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#173b8f",
                        marginBottom: 5,
                    }}
                >
                    {label}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setOpenFilter((current) =>
                            current === filterKey ? null : filterKey
                        );
                    }}
                    style={{
                        width: "100%",
                        height: 34,
                        border: "1px solid #d9e1ee",
                        borderRadius: 5,
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 9px",
                        boxSizing: "border-box",
                        color: "#29427f",
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        textAlign: "left",
                    }}
                >
                    <span
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {getSingleFilterDisplayValue(
                            filterKey
                        )}
                    </span>

                    <span
                        style={{
                            color: "#173b8f",
                            marginLeft: 5,
                        }}
                    >
                        ⌄
                    </span>
                </button>

                {openFilter === filterKey && (
                    <div
                        style={{
                            position: "absolute",
                            top: "calc(100% + 5px)",
                            left: 0,
                            width: "100%",
                            minWidth: 200,
                            background: "#ffffff",
                            border: "1px solid #d7dfeb",
                            borderRadius: 6,
                            boxShadow:
                                "0 8px 20px rgba(15, 23, 42, 0.12)",
                            zIndex: 5000,
                            overflow: "hidden",
                        }}
                    >
                        {/* SEARCH */}
                        <div
                            style={{
                                padding: "7px 8px",
                                borderBottom:
                                    "1px solid #edf1f6",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                }}
                            >
                                <span
                                    style={{
                                        position: "absolute",
                                        left: 9,
                                        top: "50%",
                                        transform:
                                            "translateY(-50%)",
                                        color: "#94a3b8",
                                        fontSize: 13,
                                    }}
                                >
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={filterSearch[filterKey] || ""}
                                    onChange={(e) =>
                                        handleFilterSearch(
                                            filterKey,
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search..."
                                    autoFocus
                                    style={{
                                        width: "100%",
                                        height: 30,
                                        border:
                                            "1px solid #d9e1ee",
                                        borderRadius: 5,
                                        padding:
                                            "0 8px 0 27px",
                                        outline: "none",
                                        fontSize: 10,
                                        color: "#334155",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        </div>

                        {/* CLEAR */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "flex-end",
                                padding: "7px 9px",
                                borderBottom:
                                    "1px solid #edf1f6",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    clearFilterValues(
                                        filterKey
                                    )
                                }
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    color: "#64748b",
                                    cursor: "pointer",
                                    fontSize: 10,
                                    fontWeight: 600,
                                }}
                            >
                                Clear
                            </button>
                        </div>

                        {/* OPTIONS */}
                        <div
                            style={{
                                maxHeight: 200,
                                overflowY: "auto",
                                padding: "3px 0",
                            }}
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() =>
                                            selectSingleFilterValue(
                                                filterKey,
                                                option
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            border: "none",
                                            background:
                                                viewFilters[
                                                    filterKey
                                                ] === option
                                                    ? "#f1f5ff"
                                                    : "#ffffff",
                                            padding:
                                                "7px 10px",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            color:
                                                viewFilters[
                                                    filterKey
                                                ] === option
                                                    ? "#4936e9"
                                                    : "#334155",
                                            fontSize: 10,
                                            fontWeight:
                                                viewFilters[
                                                    filterKey
                                                ] === option
                                                    ? 700
                                                    : 500,
                                        }}
                                    >
                                        {option}
                                    </button>
                                ))
                            ) : (
                                <div
                                    style={{
                                        padding: 15,
                                        textAlign: "center",
                                        color: "#94a3b8",
                                        fontSize: 10,
                                    }}
                                >
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /* ============================================================
       FILTERED + SORTED DATA
    ============================================================ */

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        let rows = safeData.filter((row) => {
            if (!query) return true;

            return (
                String(row.supplier_name || "")
                    .toLowerCase()
                    .includes(query) ||
                String(row.supplier_code || "")
                    .toLowerCase()
                    .includes(query) ||
                String(row.legal_entity || "")
                    .toLowerCase()
                    .includes(query) ||
                String(row.parent_division || "")
                    .toLowerCase()
                    .includes(query) ||
                String(row.sub_division || "")
                    .toLowerCase()
                    .includes(query) ||
                String(row.country || "")
                    .toLowerCase()
                    .includes(query)
            );
        });

        rows = [...rows].sort((a, b) => {
            const av = a?.[sortKey];
            const bv = b?.[sortKey];

            if (
                typeof av === "string" ||
                typeof bv === "string"
            ) {
                return sortDirection === "asc"
                    ? String(av || "").localeCompare(
                        String(bv || "")
                    )
                    : String(bv || "").localeCompare(
                        String(av || "")
                    );
            }

            return sortDirection === "asc"
                ? Number(av || 0) - Number(bv || 0)
                : Number(bv || 0) - Number(av || 0);
        });

        return rows;
    }, [
        safeData,
        search,
        sortKey,
        sortDirection,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / pageSize)
    );

    const pageRows = filtered.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const changeSort = (key) => {
        if (sortKey === key) {
            setSortDirection((direction) =>
                direction === "asc" ? "desc" : "asc"
            );
        } else {
            setSortKey(key);
            setSortDirection("desc");
        }
    };

    /* ============================================================
       APPLY / RESET FILTERS
    ============================================================ */

    const handleApplyViewFilters = () => {
        setAppliedViewFilters({
            ...viewFilters,
        });

        setOpenFilter(null);
    };

    const handleResetViewFilters = () => {
        const initialFilters = getInitialViewFilters();

        setViewFilters(initialFilters);
        setAppliedViewFilters(initialFilters);

        setFilterSearch({
            legal_group: "",
            legal_entities: "",
            parent_divisions: "",
            sub_divisions: "",
            reporting_currency: "",
            as_on_date: "",
            aging_basis: "",
        });

        setOpenFilter(null);
    };

    /* ============================================================
       TABLE COLUMNS
    ============================================================ */

    const viewColumns = [
        {
            key: "legal_entity",
            label: "Legal Entity",
            sortable: true,
            text: true,
        },
        {
            key: "parent_division",
            label: "Parent Division",
            sortable: true,
            text: true,
        },
        {
            key: "sub_division",
            label: "Sub-Division",
            sortable: true,
            text: true,
        },
        {
            key: "supplier_code",
            label: "Customer Code",
            sortable: true,
            text: true,
        },
        {
            key: "supplier_name",
            label: "Customer Name",
            sortable: true,
            text: true,
        },
        {
            key: "country",
            label: "Country",
            sortable: true,
            text: true,
        },
        {
            key: "row_currency",
            label: "Currency",
            text: true,
        },
        {
            key: "total_payable",
            label: "Total Receivables",
            sortable: true,
        },
        {
            key: "current",
            label: "Current",
            sortable: true,
        },
        {
            key: "0_30",
            label: "0 – 30",
            sortable: true,
        },
        {
            key: "31_60",
            label: "31 – 60",
            sortable: true,
        },
        {
            key: "61_90",
            label: "61 – 90",
            sortable: true,
        },
        {
            key: "91_120",
            label: "91 – 120",
            sortable: true,
        },
        {
            key: "121_180",
            label: "121 – 180",
            sortable: true,
        },
        {
            key: "181_365",
            label: "181 – 365",
            sortable: true,
        },
        {
            key: "above_365",
            label: "Above 365",
            sortable: true,
        },
    ];

    const amountColumns = [
        "total_payable",
        "current",
        "0_30",
        "31_60",
        "61_90",
        "91_120",
        "121_180",
        "181_365",
        "above_365",
    ];

    /* ============================================================
       SUMMARY VALUES
    ============================================================ */

    const totalPayables = safeData.reduce(
        (sum, row) =>
            sum + Number(row.total_payable || 0),
        0
    );

    const currentPayables = safeData.reduce(
        (sum, row) =>
            sum + Number(row.current || 0),
        0
    );

    const overduePayables = safeData.reduce(
        (sum, row) =>
            sum +
            Number(row["0_30"] || 0) +
            Number(row["31_60"] || 0) +
            Number(row["61_90"] || 0) +
            Number(row["91_120"] || 0) +
            Number(row["121_180"] || 0) +
            Number(row["181_365"] || 0) +
            Number(row["above_365"] || 0),
        0
    );

    const overdue90 = safeData.reduce(
        (sum, row) =>
            sum +
            Number(row["91_120"] || 0) +
            Number(row["121_180"] || 0) +
            Number(row["181_365"] || 0) +
            Number(row["above_365"] || 0),
        0
    );

    const snapshotDate =
        filters?.as_on_date ||
        filters?.as_on_dates ||
        filters?.asOfDate ||
        filters?.snapshot_date ||
        null;

    const agingBasis =
        filters?.aging_basis ||
        filters?.agingBasis ||
        "Due Date";

    /* ============================================================
       KPI CARD
    ============================================================ */

    const SummaryCard = ({
        icon,
        title,
        value,
        iconBackground,
        iconColor,
        titleColor,
    }) => (
        <div
            style={{
                background: "#ffffff",
                border: "1px solid #e5eaf2",
                borderRadius: 8,
                minHeight: 78,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxSizing: "border-box",
                boxShadow:
                    "0 2px 8px rgba(15, 23, 42, 0.03)",
            }}
        >
            <div
                style={{
                    width: 42,
                    height: 42,
                    minWidth: 42,
                    borderRadius: "50%",
                    background: iconBackground,
                    color: iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 800,
                }}
            >
                {icon}
            </div>

            <div
                style={{
                    minWidth: 0,
                }}
            >
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: titleColor,
                        marginBottom: 3,
                    }}
                >
                    {title}
                </div>

                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#142b6f",
                        whiteSpace: "nowrap",
                    }}
                >
                    {formatPayablesCompact(
                        value,
                        currency
                    )}
                </div>
            </div>
        </div>
    );

    /* ============================================================
       RETURN
    ============================================================ */

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2000,
                background: "rgba(15, 23, 42, 0.48)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                boxSizing: "border-box",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                style={{
                    width: "min(1450px, 100%)",
                    maxHeight: "92vh",
                    background: "#f7faff",
                    borderRadius: 10,
                    overflow: "hidden",
                    boxShadow:
                        "0 18px 55px rgba(15, 23, 42, 0.28)",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        minHeight: 0,
                        overflowY: "auto",
                        padding: "18px 18px 30px",
                        boxSizing: "border-box",
                        color: "#17213c",
                    }}
                >
                    {/* ======================================================
              PAGE HEADER
          ====================================================== */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 15,
                            marginBottom: 16,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 27,
                                    lineHeight: 1.1,
                                    fontWeight: 800,
                                    color: "#102a72",
                                    letterSpacing: "-0.5px",
                                }}
                            >
                                Receivables View All
                            </div>

                            <div
                                style={{
                                    marginTop: 5,
                                    fontSize: 12,
                                    color: "#64748b",
                                }}
                            >
                                Review complete payable balances and
                                aging details for the selected snapshot.
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    handleExport("excel")
                                }
                                style={{
                                    height: 34,
                                    minWidth: 80,
                                    padding: "0 13px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                    border: "1px solid #86efac",
                                    borderRadius: 8,
                                    background: "#f7fffa",
                                    color: "#16a34a",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                }}
                            >
                                <span style={{ fontSize: 13 }}>
                                    📊
                                </span>
                                Excel
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleExport("pdf")
                                }
                                style={{
                                    height: 34,
                                    minWidth: 72,
                                    padding: "0 13px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                    border: "1px solid #fda4af",
                                    borderRadius: 8,
                                    background: "#fff8f8",
                                    color: "#ef4444",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                }}
                            >
                                <span style={{ fontSize: 13 }}>
                                    📄
                                </span>
                                PDF
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    height: 34,
                                    padding: "0 13px",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: 5,
                                    background: "#ffffff",
                                    color: "#3149a5",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                ✖
                            </button>
                        </div>
                    </div>

                    {/* ======================================================
              FILTERS
          ====================================================== */}

                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e3e9f2",
                            borderRadius: 9,
                            padding: "13px 14px 15px",
                            marginBottom: 14,
                            boxShadow:
                                "0 2px 8px rgba(15, 23, 42, 0.025)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 11,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 9,
                                    color: "#173b8f",
                                    fontSize: 16,
                                    fontWeight: 800,
                                }}
                            >
                                Filters
                            </div>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1.05fr 1fr 1fr 1fr 1fr 1fr 1fr auto auto",
                                gap: 10,
                                alignItems: "end",
                            }}
                        >
                            {/* LEGAL GROUP */}
                            <MultiSelectDropdown
                                filterKey="legal_group"
                                label="Legal Group"
                            />

                            {/* LEGAL ENTITY */}
                            <MultiSelectDropdown
                                filterKey="legal_entities"
                                label="Legal Entity"
                            />

                            {/* PARENT DIVISION */}
                            <MultiSelectDropdown
                                filterKey="parent_divisions"
                                label="Parent Division"
                            />

                            {/* SUB-DIVISION */}
                            <MultiSelectDropdown
                                filterKey="sub_divisions"
                                label="Sub-Division"
                            />

                            {/* REPORTING CURRENCY */}
                            <SingleSelectDropdown
                                filterKey="reporting_currency"
                                label="Reporting Currency"
                            />

                            {/* AS ON DATE */}
                            <SingleSelectDropdown
                                filterKey="as_on_date"
                                label="As On Date"
                            />

                            {/* AGING BASIS */}
                            <SingleSelectDropdown
                                filterKey="aging_basis"
                                label="Aging Basis"
                            />

                            {/* APPLY */}
                            <button
                                type="button"
                                onClick={
                                    handleApplyViewFilters
                                }
                                style={{
                                    height: 34,
                                    padding: "0 20px",
                                    border: "none",
                                    borderRadius: 5,
                                    background: "#4936e9",
                                    color: "#ffffff",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                }}
                            >
                                Apply
                            </button>

                            {/* RESET */}
                            <button
                                type="button"
                                onClick={
                                    handleResetViewFilters
                                }
                                style={{
                                    height: 34,
                                    padding: "0 18px",
                                    border:
                                        "1px solid #d4dbe7",
                                    borderRadius: 5,
                                    background: "#ffffff",
                                    color: "#334155",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* ======================================================
              SUMMARY CARDS
          ====================================================== */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1.05fr repeat(4, 1fr)",
                            gap: 9,
                            marginBottom: 14,
                        }}
                    >
                        <div
                            style={{
                                background: "#ffffff",
                                border: "1px solid #e5eaf2",
                                borderRadius: 8,
                                minHeight: 78,
                                padding: "12px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: "50%",
                                    background: "#edf4ff",
                                    color: "#1464e8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 19,
                                }}
                            >
                                ▤
                            </div>

                            <div>
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 800,
                                        color: "#142b6f",
                                    }}
                                >
                                    {filtered.length.toLocaleString()}
                                </div>

                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "#64748b",
                                        marginTop: 1,
                                    }}
                                >
                                    records
                                </div>
                            </div>
                        </div>

                        <SummaryCard
                            icon="▣"
                            title="Total Receivables"
                            value={totalPayables}
                            iconBackground="#e5faf2"
                            iconColor="#149b6f"
                            titleColor="#149b6f"
                        />

                        <SummaryCard
                            icon="▤"
                            title="Current"
                            value={currentPayables}
                            iconBackground="#e5faf2"
                            iconColor="#149b6f"
                            titleColor="#149b6f"
                        />

                        <SummaryCard
                            icon="⌛"
                            title="Overdue"
                            value={overduePayables}
                            iconBackground="#fff2df"
                            iconColor="#ed8a17"
                            titleColor="#ed8a17"
                        />

                        <SummaryCard
                            icon="!"
                            title="Overdue > 90 Days"
                            value={overdue90}
                            iconBackground="#ffeaf0"
                            iconColor="#ed3c69"
                            titleColor="#ed3c69"
                        />
                    </div>

                    {/* ======================================================
              ALL PAYABLES CARD
          ====================================================== */}

                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e3e9f2",
                            borderRadius: 9,
                            overflow: "hidden",
                            boxShadow:
                                "0 2px 8px rgba(15, 23, 42, 0.025)",
                        }}
                    >
                        {/* CARD HEADER */}

                        <div
                            style={{
                                padding: "12px 13px 9px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-end",
                                    gap: 10,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 19,
                                            fontWeight: 800,
                                            color: "#142b6f",
                                        }}
                                    >
                                        All Receivables
                                    </div>

                                    <div
                                        style={{
                                            marginTop: 5,
                                            fontSize: 10,
                                            color: "#64748b",
                                        }}
                                    >
                                        Aging basis:{" "}
                                        <strong
                                            style={{
                                                color: "#334b8e",
                                            }}
                                        >
                                            {agingBasis}
                                        </strong>

                                        <span
                                            style={{
                                                margin: "0 8px",
                                                color: "#a0aec0",
                                            }}
                                        >
                                            |
                                        </span>

                                        Snapshot:{" "}
                                        <strong
                                            style={{
                                                color: "#334b8e",
                                            }}
                                        >
                                            {formatDate(snapshotDate)}
                                        </strong>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    {/* SEARCH */}

                                    <div
                                        style={{
                                            position: "relative",
                                        }}
                                    >
                                        <span
                                            style={{
                                                position: "absolute",
                                                left: 10,
                                                top: "50%",
                                                transform:
                                                    "translateY(-50%)",
                                                color: "#52658d",
                                                fontSize: 14,
                                            }}
                                        >
                                            ⌕
                                        </span>

                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => {
                                                setSearch(
                                                    e.target.value
                                                );
                                                setPage(1);
                                            }}
                                            placeholder="Search supplier"
                                            style={{
                                                width: 245,
                                                height: 34,
                                                border:
                                                    "1px solid #d6dfec",
                                                borderRadius: 5,
                                                padding:
                                                    "0 10px 0 29px",
                                                outline: "none",
                                                fontSize: 10,
                                                color: "#334155",
                                                boxSizing:
                                                    "border-box",
                                            }}
                                        />
                                    </div>

                                    {/* ROWS */}

                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(
                                                Number(e.target.value)
                                            );
                                            setPage(1);
                                        }}
                                        style={{
                                            width: 110,
                                            height: 34,
                                            border:
                                                "1px solid #d6dfec",
                                            borderRadius: 5,
                                            padding: "0 9px",
                                            color: "#334b8e",
                                            background: "#ffffff",
                                            fontSize: 10,
                                            fontWeight: 700,
                                            outline: "none",
                                        }}
                                    >
                                        <option value={10}>
                                            10 rows
                                        </option>
                                        <option value={20}>
                                            20 rows
                                        </option>
                                        <option value={50}>
                                            50 rows
                                        </option>
                                        <option value={100}>
                                            100 rows
                                        </option>
                                    </select>

                                    {/* PAGINATION TOP */}

                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.max(1, p - 1)
                                            )
                                        }
                                        style={{
                                            border: "none",
                                            background:
                                                "transparent",
                                            color:
                                                page <= 1
                                                    ? "#cbd5e1"
                                                    : "#3048a5",
                                            fontSize: 21,
                                            cursor:
                                                page <= 1
                                                    ? "not-allowed"
                                                    : "pointer",
                                            padding: 0,
                                        }}
                                    >
                                        ‹
                                    </button>

                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: "#3048a5",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {filtered.length === 0
                                            ? 0
                                            : (page - 1) *
                                            pageSize +
                                            1}{" "}
                                        –{" "}
                                        {Math.min(
                                            page * pageSize,
                                            filtered.length
                                        )}{" "}
                                        of{" "}
                                        {filtered.length.toLocaleString()}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            page >= totalPages
                                        }
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(
                                                    totalPages,
                                                    p + 1
                                                )
                                            )
                                        }
                                        style={{
                                            border: "none",
                                            background:
                                                "transparent",
                                            color:
                                                page >= totalPages
                                                    ? "#cbd5e1"
                                                    : "#3048a5",
                                            fontSize: 21,
                                            cursor:
                                                page >= totalPages
                                                    ? "not-allowed"
                                                    : "pointer",
                                            padding: 0,
                                        }}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* TABLE */}

                        <div
                            style={{
                                width: "100%",
                                overflowX: "auto",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    minWidth: 1280,
                                    borderCollapse: "separate",
                                    borderSpacing: 0,
                                    tableLayout: "fixed",
                                    fontSize: 10,
                                }}
                            >
                                <thead>
                                    <tr>
                                        {viewColumns.map(
                                            (column) => {
                                                const isText =
                                                    column.text;

                                                return (
                                                    <th
                                                        key={column.key}
                                                        onClick={() =>
                                                            column.sortable &&
                                                            changeSort(
                                                                column.key
                                                            )
                                                        }
                                                        style={{
                                                            position:
                                                                "sticky",
                                                            top: 0,
                                                            zIndex: 2,
                                                            background:
                                                                "#edf4ff",
                                                            color:
                                                                "#24479d",
                                                            fontWeight: 800,
                                                            padding:
                                                                "8px 6px",
                                                            borderBottom:
                                                                "1px solid #d7e1ef",
                                                            textAlign:
                                                                isText
                                                                    ? "left"
                                                                    : "right",
                                                            whiteSpace:
                                                                "nowrap",
                                                            cursor:
                                                                column.sortable
                                                                    ? "pointer"
                                                                    : "default",
                                                            overflow:
                                                                "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                        }}
                                                    >
                                                        {column.label}

                                                        {column.sortable &&
                                                            sortKey ===
                                                            column.key && (
                                                                <span
                                                                    style={{
                                                                        marginLeft: 4,
                                                                        fontSize: 8,
                                                                    }}
                                                                >
                                                                    {sortDirection ===
                                                                        "asc"
                                                                        ? "▲"
                                                                        : "▼"}
                                                                </span>
                                                            )}
                                                    </th>
                                                );
                                            }
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {pageRows.map(
                                        (row, rowIndex) => (
                                            <tr
                                                key={
                                                    row.id ||
                                                    row.supplier_code ||
                                                    rowIndex
                                                }
                                                style={{
                                                    background:
                                                        rowIndex % 2 === 0
                                                            ? "#f9fbff"
                                                            : "#ffffff",
                                                }}
                                            >
                                                {viewColumns.map(
                                                    (column) => {
                                                        const isText =
                                                            column.text;

                                                        let value;

                                                        if (
                                                            column.key ===
                                                            "row_currency"
                                                        ) {
                                                            value =
                                                                row.currency ||
                                                                currency ||
                                                                "AED";
                                                        } else {
                                                            value =
                                                                row[
                                                                column.key
                                                                ];
                                                        }

                                                        if (
                                                            column.key ===
                                                            "supplier_name"
                                                        ) {
                                                            value =
                                                                value ||
                                                                row.supplier ||
                                                                "-";
                                                        }

                                                        if (
                                                            amountColumns.includes(
                                                                column.key
                                                            )
                                                        ) {
                                                            const numericValue =
                                                                Number(
                                                                    value || 0
                                                                );

                                                            return (
                                                                <td
                                                                    key={
                                                                        column.key
                                                                    }
                                                                    style={{
                                                                        padding:
                                                                            "7px 6px",
                                                                        borderBottom:
                                                                            "1px solid #edf1f6",
                                                                        color:
                                                                            numericValue <
                                                                                0
                                                                                ? "#c62828"
                                                                                : "#334b8e",
                                                                        textAlign:
                                                                            "right",
                                                                        whiteSpace:
                                                                            "nowrap",
                                                                        fontWeight:
                                                                            column.key ===
                                                                                "total_payable"
                                                                                ? 700
                                                                                : 500,
                                                                    }}
                                                                >
                                                                    {formatTableAmount(
                                                                        numericValue
                                                                    )}
                                                                </td>
                                                            );
                                                        }

                                                        return (
                                                            <td
                                                                key={
                                                                    column.key
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "7px 6px",
                                                                    borderBottom:
                                                                        "1px solid #edf1f6",
                                                                    color:
                                                                        "#334b8e",
                                                                    textAlign:
                                                                        isText
                                                                            ? "left"
                                                                            : "center",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                    overflow:
                                                                        "hidden",
                                                                    textOverflow:
                                                                        "ellipsis",
                                                                    fontWeight:
                                                                        column.key ===
                                                                            "supplier_name"
                                                                            ? 600
                                                                            : 500,
                                                                }}
                                                                title={
                                                                    value || ""
                                                                }
                                                            >
                                                                {cleanCurrency(
                                                                    value || "-"
                                                                )}
                                                            </td>
                                                        );
                                                    }
                                                )}
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* NO DATA */}

                        {pageRows.length === 0 && (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: 45,
                                    color: "#64748b",
                                    fontSize: 12,
                                }}
                            >
                                No suppliers found.
                            </div>
                        )}

                        {/* FOOTER */}

                        <div
                            style={{
                                minHeight: 55,
                                padding: "10px 13px",
                                borderTop:
                                    "1px solid #e5eaf2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    "space-between",
                                gap: 15,
                                boxSizing: "border-box",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 10,
                                    color: "#5b6d99",
                                }}
                            >
                                Values shown in selected
                                reporting currency

                                <span
                                    style={{
                                        margin: "0 8px",
                                        color: "#b0bacb",
                                    }}
                                >
                                    |
                                </span>

                                Source: Oracle Fusion Cloud
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    color: "#3048a5",
                                    fontSize: 11,
                                    fontWeight: 600,
                                }}
                            >
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.max(1, p - 1)
                                        )
                                    }
                                    style={{
                                        border: "none",
                                        background:
                                            "transparent",
                                        color:
                                            page <= 1
                                                ? "#cbd5e1"
                                                : "#3048a5",
                                        fontSize: 20,
                                        cursor:
                                            page <= 1
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                >
                                    ‹
                                </button>

                                <span>
                                    {filtered.length === 0
                                        ? 0
                                        : (page - 1) *
                                        pageSize +
                                        1}
                                    {" – "}
                                    {Math.min(
                                        page * pageSize,
                                        filtered.length
                                    )}
                                    {" of "}
                                    {filtered.length.toLocaleString()}
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        page >= totalPages
                                    }
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(
                                                totalPages,
                                                p + 1
                                            )
                                        )
                                    }
                                    style={{
                                        border: "none",
                                        background:
                                            "transparent",
                                        color:
                                            page >= totalPages
                                                ? "#cbd5e1"
                                                : "#3048a5",
                                        fontSize: 20,
                                        cursor:
                                            page >= totalPages
                                                ? "not-allowed"
                                                : "pointer",
                                    }}
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}




