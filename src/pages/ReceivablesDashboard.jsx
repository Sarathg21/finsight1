import React from "react";
import { LuBuilding2 } from "react-icons/lu";
import { IoWalletOutline, IoHourglassOutline, IoAlertCircleOutline, } from "react-icons/io5";
import {
    FiPercent, FiRefreshCw,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChartMenu from "../components/ChartMenu";
import Filters from "../components/Filters/Filters";
import { Download, CalendarClock } from "lucide-react";
import { AgingSummaryCard, OverDueSummaryCard, PayablesTrendCard, ParentDivisionCard, } from "../components/Charts/Charts";
import { TopVendorsTable,  SubDivisionTable, SalesmanTable, } from "../components/Tables/Tables";
import DetailedViewTable from "../components/Tables/DetailedViewTable";
import KPICards from "../components/Cards/KPICards";
import { agingData, trendData, divisionData, topVendors, overdueData, businessUnitData, detailedViewData, } from '../data/dashboardData';
import {
    getReceivableFilters, getReceivableSummary, getReceivableAgingSummary, getReceivableTrend, getSalesmanPerformance,
    getReceivableDivisionWise, getReceivableTopCustomers, getReceivableDetails,
    getReceivableOverdueSummary, getReceivableSubDivision, getReceivableExport
} from "../api/recevablesApi"
import ExportButtons from "../components/Common/ExportButtons";
import PageHeader from "../components/Common/PageHeader";
import FooterNote from "../components/FooterNote";
import ReceivablesDetailsModal from "../components/ReceivablesDetailsModal"

export default function ReceivablesDashboard() {

    const [filterOptions, setFilterOptions] = useState({
        as_on_dates: [],
        currencies: [],
        legal_groups: [],
        legal_entities: [],
        parent_divisions: [],
        subdivisions: [],
        business_units: [],
        salesmen: [],
    });
    const navigate = useNavigate();
    const [filters, setFilters] = useState({});
    const [summary, setSummary] = useState(null);
    const [agingSummary, setAgingSummary] = useState([]);
    const [agingTotal, setAgingTotal] = useState(0);
    const [divisionData, setDivisionData] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [overdueData, setOverdueData] = useState([]);
    const [overdueTotal, setOverdueTotal] = useState(0);
    const [subDivisionData, setSubDivisionData] = useState([]);
    const [exporting, setExporting] = useState("");
    const [loading, setLoading] = useState(true);

    {/*------------Details table--------------------*/ }
    const [detailsData, setDetailsData] = useState([]);
    const [detailsPage, setDetailsPage] = useState(1);
    const [detailsPageSize] = useState(50);
    const [detailsTotalCount, setDetailsTotalCount] = useState(0);
    const [detailsSort, setDetailsSort] = useState({
        sort_by: "outstanding_amount",
        sort_dir: "desc"
    });
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [salesmanData, setSalesmanData] = useState([]);


    {/*-----------Currency Format--------------------*/ }

    const formatCurrency = (value) => {
        if (value == null) return "-";

        const amount = Number(value);

        if (amount >= 1_000_000) {
            return `AED ${(amount / 1_000_000).toFixed(2)}M`;
        }

        if (amount >= 1_000) {
            return `AED ${(amount / 1_000).toFixed(2)}K`;
        }

        return `AED ${amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };
    {/*-------------Array For Summary--------------------*/ }

    const receivableKpiData = summary ? [
        {
            id: 1, title: "Total Receivables", value: formatCurrency(summary.total_receivables), icon: LuBuilding2, titleColor: "#2563EB", titleBackground: "#EFF6FF", iconColor: "#2563EB", iconBackground: "#EAF2FF",
            cardBackground: "#F3F8FF", borderColor: "#E8EDF5", trend: "up", trendValue: "9.42%", comparisonText: "vs 31 Mar 2024", trendColor: "#16A34A",
            sparklineColor: "#2563EB",
            sparklineData: [
                6, 8, 7, 11, 6,
                9, 13, 7, 9, 15,
                8, 14, 10, 16, 7,
                11, 15, 9, 12, 10,
                14, 11]
        },
        {
            id: 2, title: "Current Receivables", value: formatCurrency(summary.current), icon: IoWalletOutline, titleColor: "#16A34A", iconColor: "#16A34A",
            iconBackground: "#ECFDF5", cardBackground: "#F0FDF4", borderColor: "#E8EDF5", trend: "up", trendValue: "7.31%",
            comparisonText: "vs 31 Mar 2024",
            trendColor: "#16A34A",
            sparklineColor: "#16A34A",
            sparklineData: [
                7, 8, 7, 9, 8,
                10, 9, 11, 8, 10,
                12, 9, 11, 10, 12,
                9, 11, 8, 10, 9,
                11, 8]
        },

        {
            id: 3, title: "Overdue Receivables", value: formatCurrency(summary.overdue), icon: IoHourglassOutline, titleColor: "#F59E0B", iconColor: "#F59E0B",
            iconBackground: "#FFF7ED", cardBackground: "#FFF7ED", borderColor: "#E8EDF5", trend: "down", trendValue: "14.85%",
            comparisonText: "vs 31 Mar 2024", trendColor: "#DC2626", sparklineColor: "#F59E0B",
            sparklineData: [
                9, 10, 8, 11, 9,
                8, 12, 9, 10, 8,
                11, 9, 8, 10, 9,
                8, 11, 9, 10, 8,
                9, 8
            ]
        },

        {
            id: 4, title: "Overdue > 90 Days",
            value: formatCurrency(summary.provision_exposure_over_365),
            icon: IoAlertCircleOutline,
            titleColor: "#EC4899",
            iconColor: "#EC4899",
            iconBackground: "#FDF2F8",
            cardBackground: "#FEF2F2",
            borderColor: "#E8EDF5",
            trend: "down",
            trendValue: "21.10%",
            comparisonText: "vs 31 Mar 2024",
            trendColor: "#DC2626",
            sparklineColor: "#EC4899",
            sparklineData: [
                7, 8, 7, 9, 8,
                7, 10, 8, 9, 7,
                8, 10, 7, 9, 8,
                7, 10, 8, 9, 8,
                10, 9
            ]
        },

        {
            id: 5,
            title: "DSO (Days)",
            value: "46 days",
            icon: FiPercent,
            titleColor: "#06B6D4",
            iconColor: "#06B6D4",
            iconBackground: "#ECFEFF",
            cardBackground: "#EFF6FF",
            borderColor: "#E8EDF5",
            trend: "up",
            trendValue: "3 Days",
            comparisonText: "vs 31 Mar 2024",
            trendColor: "#16A34A",
            sparklineColor: "#06B6D4",
            sparklineData: [
                8, 9, 8, 10, 9,
                8, 11, 9, 10, 8,
                10, 9, 11, 8, 10,
                9, 11, 9, 10, 9,
                10, 9
            ]
        },

        {
            id: 6,
            title: "Invoice Settlement Efficiency",
            value: "92.35%",
            icon: FiRefreshCw,
            titleColor: "#8B5CF6",
            iconColor: "#8B5CF6",
            iconBackground: "#F5F3FF",
            cardBackground: "#FAF5FF",
            borderColor: "#E8EDF5",
            trend: "up",
            trendValue: "4.12%",
            comparisonText: "vs 31 Mar 2024",
            trendColor: "#16A34A",
            sparklineColor: "#8B5CF6",
            sparklineData: [
                8, 10, 8, 11, 9,
                8, 12, 9, 11, 8,
                10, 12, 9, 11, 8,
                10, 12, 9, 11, 10,
                12, 10
            ]
        },
    ] : [];
    const handleViewDetails = () => {
        setShowDetailsModal(true);
    };
    const handleExportExcel = () => {
        console.log("Export Excel");
    };

    const handleExportPdf = () => {
        console.log("Export PDF");
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchFilters(),
                fetchSummary(),
                fetchAgingSummary(),
                fetchDivisionWise(),
                fetchTopCustomers(),
                fetchDetails(),
                fetchTrend(),
                fetchOverdueSummary(),
                fetchSubDivisions(),
                loadSalesman(),
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    {/*-------------Load Filter Data--------------------*/ }
    const fetchFilters = async (filters = {}) => {
        try {
            const response = await getReceivableFilters();
            setFilterOptions(response?.data?.data || {});
        } catch (error) {
            console.log("Error is", error)
        }
    };

    {/*-------------Load SummaryCards--------------------*/ }

    const fetchSummary = async (filters = {}) => {
        try {
            const response = await getReceivableSummary(filters);
            setSummary(response.data.data);
        } catch (error) {
            console.error("Error is", error);
        }
    };

    {/*-------------Load AgingSummary--------------------*/ }
    const fetchAgingSummary = async (filters = {}) => {
        try {
            const response = await getReceivableAgingSummary(filters);
            const result = response?.data?.data || {};
            setAgingSummary(result.buckets || []);
            setAgingTotal(result.total_amount || 0);
        } catch (error) {
            console.error("Error is", error);
        }
    };
    {/*-------------Load parent division--------------------*/ }
    const fetchDivisionWise = async (filters = {}) => {
        try {
            const response = await getReceivableDivisionWise(filters);
            setDivisionData(response?.data?.data || []);
        } catch (error) {
            console.error("Error is", error);
        }
    };
    {/*-------------Top Customers--------------------*/ }
    const fetchTopCustomers = async (filters = {}) => {
        try {
            const response = await getReceivableTopCustomers(filters);
            setTopCustomers(response?.data?.data || []);
        } catch (error) {
            console.error("Error is", error);
        }
    };

    {/*------------details fetch --------------------*/ }
    const fetchDetails = async (
        filters = {},
        page = detailsPage,
        sort = detailsSort,
        pageSize = 10
    ) => {
        try {
            const params = {
                ...filters,
                page,
                page_size: pageSize,
                sort_by: sort.sort_by,
                sort_dir: sort.sort_dir,
            };

            const response = await getReceivableDetails(params);

            setDetailsData(response?.data?.data?.rows || []);
            setDetailsTotalCount(response?.data?.data?.total_count || 0);
        } catch (err) {
            console.error(err);
        }
    };
    {/*------------trend  --------------------*/ }
    const fetchTrend = async (filters = {}) => {
        try {
            const response = await getReceivableTrend(filters);
            setTrendData(response?.data?.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    {/*------------Overdue Summary  --------------------*/ }
    const fetchOverdueSummary = async (filters = {}) => {
        try {
            const response = await getReceivableOverdueSummary(filters);
            const data = response?.data?.data || {};
            setOverdueTotal(
                Number(data.current || 0) + Number(data.total_overdue || 0)
            );
            const total = (data.current || 0) + (data.total_overdue || 0);

            const chartData = [
                {
                    name: "Current",
                    value: Number(data.current || 0),
                    percentage: `${((data.current / total) * 100).toFixed(1)}%`,
                    color: "#22C55E",
                },
                {
                    name: "1-30",
                    value: Number(data["1_30_days"] || 0),
                    percentage: `${((data["1_30_days"] / total) * 100).toFixed(1)}%`,
                    color: "#3B82F6",
                },
                {
                    name: "31-60",
                    value: Number(data["31_60_days"] || 0),
                    percentage: `${((data["31_60_days"] / total) * 100).toFixed(1)}%`,
                    color: "#FACC15",
                },
                {
                    name: "61-90",
                    value: Number(data["61_90_days"] || 0),
                    percentage: `${((data["61_90_days"] / total) * 100).toFixed(1)}%`,
                    color: "#FB923C",
                },
                {
                    name: "91-120",
                    value: Number(data["91_120_days"] || 0),
                    percentage: `${((data["91_120_days"] / total) * 100).toFixed(1)}%`,
                    color: "#EF4444",
                },
                {
                    name: ">120",
                    value: Number(data.above_120_days || 0),
                    percentage: `${((data.above_120_days / total) * 100).toFixed(1)}%`,
                    color: "#A855F7",
                },
            ];
            setOverdueData(chartData);

        } catch (error) {
            console.error(error);
        }
    };

    {/*------------Fetch Subdivisions --------------------*/ }
    const fetchSubDivisions = async (filters = {}) => {

        try {
            const response = await getReceivableSubDivision(filters);
            const rawData = response?.data?.data; const apiData = Array.isArray(rawData) ? rawData : [];
            const totalAmount = apiData.reduce(
                (sum, item) => sum + Number(item.amount || 0),
                0
            );
            const tableData = apiData.map((item) => ({
                subdivision: item.subdivision,
                amount: Number(item.amount || 0),
                percentage:
                    totalAmount > 0
                        ? ((item.amount / totalAmount) * 100).toFixed(1)
                        : "0.0",
            }));
            setSubDivisionData(tableData);

        } catch (error) {
            console.error(error);
        }
    };

    {/*------------Fetch SalesMan --------------------*/ }
    const loadSalesman = async (filters = {}) => {
        try {
            const res = await getSalesmanPerformance(filters);
            setSalesmanData(res.data.data || res.data);
        } catch (err) {
            console.log(err);
        }
    };
    const handleApply = async (selectedFilters) => {

        setFilters(selectedFilters);
        setLoading(true);

        try {
            await Promise.all([
                fetchSummary(selectedFilters),
                fetchAgingSummary(selectedFilters),
                fetchDivisionWise(selectedFilters),
                fetchTopCustomers(selectedFilters),
                fetchDetails(selectedFilters, 1, detailsSort),
                fetchTrend(selectedFilters),
                fetchOverdueSummary(selectedFilters),
                fetchSubDivisions(selectedFilters),
                loadSalesman(selectedFilters)
            ]);
        } catch (error) {
            console.error("Error loading receivables data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDetailsPageChange = (page) => {
        setDetailsPage(page);
        fetchDetails(
            filters,
            page,
            detailsSort
        );
    };

    const handleDetailsSort = (field) => {
        let direction = "desc";
        if (
            detailsSort.sort_by === field &&
            detailsSort.sort_dir === "desc"
        ) {
            direction = "asc";
        }
        const newSort = {
            sort_by: field,
            sort_dir: direction
        };
        setDetailsSort(newSort);
        fetchDetails(
            filters,
            1,
            newSort
        );
        setDetailsPage(1);
    };

    const handleReset = () => {
        setFilters({});

        fetchSummary();
        fetchAgingSummary();
        fetchDivisionWise();
        fetchTopCustomers();
        fetchDetails();
        fetchTrend();
        fetchOverdueSummary();
        fetchSubDivisions();
        loadSalesman();
    };
    const bucketColors = {
        CURRENT: "#22C55E",
        "1_30": "#3B82F6",
        "31_60": "#FACC15",
        "61_90": "#FB923C",
        "91_120": "#EF4444",
        "121_180": "#A855F7",
        "181_365": "#6366F1",
        OVER_365: "#7C2D12",
    };

    {/*-------------Create a new array for aging summary--------------------*/ }
    // For the PIE chart (only non-zero slices)
    const pieData = agingSummary
        .filter(item => Number(item.amount) > 0)
        .map(item => ({
            name: item.bucket_name,
            value: Number(item.amount),
            percentage: Number(item.percentage),
            color: bucketColors[item.bucket_code] || "#9CA3AF",
        }));

    // For the LEGEND (all buckets)
    const legendData = agingSummary.map(item => ({
        name: item.bucket_name,
        value: Number(item.amount),
        percentage: Number(item.percentage),
        color: bucketColors[item.bucket_code] || "#9CA3AF",
    }));


    {/*----------Parent division------------------*/ }
    const divisionTotalOutstanding = divisionData.reduce(
        (sum, item) => sum + Number(item.outstanding_amount || 0),
        0
    );
    const divisionChartData = divisionData.map((item) => ({
        name: item.division_name || "-",
        value: Number(item.outstanding_amount || 0),
        percentage:
            divisionTotalOutstanding > 0
                ? `${(
                    (Number(item.outstanding_amount || 0) /
                        divisionTotalOutstanding) *
                    100
                ).toFixed(1)}%`
                : "0%",
    }));

    {/*-----------Convert the api data for top customers------------------*/ }
    const topCustomerTableData = topCustomers.map((customer, index) => ({
        id: index + 1,
        name: customer.customer_name,
        amount: Number(customer.total_outstanding || 0),
        pct: Number(customer.percentage_of_total || 0)
    })
    );
    // const detailedTableData = detailsData.map((item, index) => ({
    //     id: index + 1,
    //     customerName: item.customer_name,
    //     customerType: item.customer_type,
    //     currency: item.currency,
    //     country: item.country,
    //     invoiceNumber: item.invoice_number,
    //     invoiceDate: item.invoice_date,
    //     dueDate: item.due_date,
    //     outstandingAmount: item.outstanding_amount,
    //     agingBucket: item.aging_bucket,
    //     salesman: item.salesman,
    //     division: item.division,
    //     legalEntity: item.legal_entity,
    // }));

    const receivableTrendChart = trendData.map(item => ({
        month: new Date(item.as_on_date).toLocaleString("default", {
            month: "short",
        }),

        // Bar expects payables
        payables: Number(item.total_receivables || 0),

        // Line expects dpo
        dpo: 0,

        current: Number(item.current || 0),
        overdue: Number(item.amount_1_30 || 0),
    }));

    useEffect(() => {
        loadDashboardData();
    }, []);


    const handleExport = async (type) => {
        try {
            setExporting(type);
            const response = await getReceivableExport(type, filters);
            const blob = new Blob([response.data], {
                type:
                    type === "excel"
                        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        : "application/pdf",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download =
                type === "excel"
                    ? "Receivables_Report.xlsx"
                    : "Receivables_Report.pdf";

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            if (type === "excel") {
                alert("Export Failed");
            }
            else {
                alert("PDF Download Failed");
            }
        } finally {
            setExporting("");
        }
    };

    return (
        <div className="page-content relative">

            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">

                        <div className="w-10 h-10 border-4 border-[#081B46] border-t-transparent rounded-full animate-spin"></div>

                        <p className="text-sm font-semibold text-[#081B46]">
                            Loading Receivables Dashboard...
                        </p>

                    </div>
                </div>
            )}

            <PageHeader
                title="Receivables Dashboard"
                subtitle="Tracking receivables, aging, overdue and collection performance.">

                <ExportButtons
                    endpoint="receivables"
                    exporting={exporting}
                    handleExport={handleExport}
                />
            </PageHeader>

            {/* Main Content */}

            <div className="flex flex-col gap-2">
                {/* ----Filters---- */}
                <Filters
                    filterOptions={filterOptions}
                    onApply={handleApply}
                    onReset={handleReset}
                />
                {/* -----KPI Cards----- */}
                <div style={{ marginTop: "-18px" }}>
                    <KPICards data={receivableKpiData} />
                </div>


                {/* Charts Row 1 */}
                <div className="receivables-grid gap-3">
                    <AgingSummaryCard
                        title="Receivables Aging Summary"
                        data={pieData}
                        date={filters.as_on_date}
                        legendData={legendData}
                        total={agingTotal}
                    />
                    <PayablesTrendCard
                        title="Receivables Trend"
                        daysname="DSO (Days)"
                        charttitle="Total Receivables"
                        data={receivableTrendChart}
                        currency="AED"
                        datakey="receivables"
                    />

                    <ParentDivisionCard
                        title="Receivables by Parent Division"
                        data={divisionChartData}
                    />

                </div>


                {/* Charts Row 2 */}

                <div className="receivables-grid gap-3">
                    <TopVendorsTable
                        title="Top 10 Customers by Receivables"
                        tabletitle1="Customer Name"
                        tabletitle2="Receivable"
                        data={topCustomerTableData}
                    />
                    <OverDueSummaryCard
                        title="Overdue Summary"
                        data={overdueData}
                        total={Number(overdueTotal).toFixed(2)}
                        Centerlabel="Total Overdue"
                    />
                    <SubDivisionTable
                        title="Receivables by Sub Division"
                        tabletitle="Receivable"
                        data={subDivisionData}
                    />
                </div>
                <div className="mt-20">
                    <SalesmanTable
                        title="Salesman Performance"
                        data={salesmanData}
                    />
                </div>
                <div className="card mt-20" style={{ padding: 0, overflow: "hidden" }}>
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-5 py-4 border-b bg-white" >
                        <div className="flex items-center gap-3">
                            <span className="text-[15px] font-extrabold text-[#081B46]">
                                Receivables Detailed View
                            </span>
                            <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                Amounts in AED
                            </span>
                        </div>
                        <ChartMenu
                            onViewAll={handleViewDetails}
                            onExportExcel={() => handleExport("excel")}
                            onExportPdf={() => handleExport("pdf")}
                        />
                    </div>

                    <DetailedViewTable
                        title="Receivables Detailed View"
                        data={detailsData}
                        currency="AED"
                        page={detailsPage}
                        pageSize={detailsPageSize}
                        totalCount={detailsTotalCount}
                        onPageChange={handleDetailsPageChange}
                        showPagination={false}
                        onSort={handleDetailsSort}

                        onViewDetails={handleViewDetails}
                        onExportExcel={handleExportExcel}
                        onExportPdf={handleExportPdf}
                    />
                    <ReceivablesDetailsModal
                        open={showDetailsModal}
                        onClose={() => setShowDetailsModal(false)}
                        filters={filters}
                    />


                </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-58 right-2 z-50 bg-white border-t border-gray-200 p-2">
                <FooterNote
                    title="Note:"
                    message="All values are in AED | ☁️ Source: Oracle Fusion Cloud"
                    lastUpdated={filters.as_on_date || filterOptions.as_on_dates?.[0]}
                    showRefresh={false}
                />
            </div>
        </div>
    );
}






