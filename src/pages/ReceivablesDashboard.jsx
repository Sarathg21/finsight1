import React from "react";
import { useState, useEffect } from "react";
import Filters from "../components/Filters/Filters";
import { Download, CalendarClock } from "lucide-react";
import { AgingSummaryCard, OverDueSummaryCard, PayablesTrendCard, ParentDivisionCard, } from "../components/Charts/Charts";
import { TopVendorsTable, BusinessUnitTable, SalesmanTable, } from "../components/Tables/Tables";
import DetailedViewTable from "../components/Tables/DetailedViewTable";
import KPICards from "../components/Cards/KPICards";
import { kpiDataReceivable } from "../data/kpiData";
import { agingData, trendData, divisionData, topVendors, overdueData, businessUnitData, detailedViewData, } from '../data/dashboardData';
import {
    getReceivableFilters, getReceivableSummary, getReceivableAgingSummary, getReceivableTrend, getSalesmanPerformance,
    getReceivableDivisionWise, getReceivableTopCustomers, getReceivableDetails,
    getReceivableOverdueSummary, getReceivableBusinessUnit, getReceivableExport
} from "../api/recevablesApi"

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
    const [summary, setSummary] = useState(null);
    const [agingSummary, setAgingSummary] = useState([]);
    const [divisionData, setDivisionData] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [overdueData, setOverdueData] = useState([]);
    const [overdueTotal, setOverdueTotal] = useState(0);
    const [businessUnitData, setBusinessUnitData] = useState([]);
    const [exporting, setExporting] = useState("");

    {/*------------Details table--------------------*/ }
    const [detailsData, setDetailsData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalOutstanding, setTotalOutstanding] = useState(0);
    const [salesmanData, setSalesmanData] = useState([]);

    {/*-------------Array For Summary--------------------*/ }
    const receivableKpiData = summary ? [
        {
            id: 1,
            title: "Total Receivables",
            value: summary.total_receivables,
        },
        {
            id: 2,
            title: "Current",
            value: summary.current,
        },
        {
            id: 3,
            title: "Overdue",
            value: summary.overdue,
        },
        {
            id: 4,
            title: "Customers",
            value: summary.no_of_customers,
        },
        {
            id: 5,
            title: "Average Collection Days",
            value: summary.average_collection_days ?? "-",
        },
        {
            id: 6,
            title: "Provision >365",
            value: summary.provision_exposure_over_365,
        },
    ]
        : [];

    {/*-------------Load Filter Data--------------------*/ }
    const fetchFilters = async () => {
        try {
            const response = await getReceivableFilters();
            console.log(response.data);
            setFilterOptions(response.data.data);
        } catch (error) {
            console.log("Status:", error.response?.status);
            console.log("URL:", error.config?.baseURL + error.config?.url);
            console.log("Response:", error.response?.data);
        }
    };

    {/*-------------Load SummaryCards--------------------*/ }
    const fetchSummary = async () => {
        try {
            const response = await getReceivableSummary();
            console.log(response.data);
            setSummary(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    {/*-------------Load AgingSummary--------------------*/ }
    const fetchAgingSummary = async () => {
        try {
            const response = await getReceivableAgingSummary();
            console.log("Aging Summary:", response.data);
            setAgingSummary(response.data.data.buckets);
        } catch (error) {
            console.error(error);
        }
    };
    {/*-------------Load parent division--------------------*/ }
    const fetchDivisionWise = async () => {
        try {
            const response = await getReceivableDivisionWise();
            console.log("Division Wise:", response.data);
            setDivisionData(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };
    {/*-------------Top Customers--------------------*/ }
    const fetchTopCustomers = async () => {
        try {
            const response = await getReceivableTopCustomers();
            console.log("Top Customers", response.data);
            setTopCustomers(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    {/*------------details fetch --------------------*/ }
    const fetchDetails = async () => {
        try {
            const response = await getReceivableDetails();
            console.log(response.data);
            setDetailsData(response.data.data.rows);
            setTotalCount(response.data.data.total_count);
            setTotalOutstanding(response.data.data.total_outstanding);

        } catch (error) {
            console.error(error);
        }
    };

    {/*------------trend  --------------------*/ }
    const fetchTrend = async () => {
        try {
            const response = await getReceivableTrend();
            console.log("Trend API:", response.data);
            setTrendData(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    {/*------------Overdue Summary  --------------------*/ }
    const fetchOverdueSummary = async () => {
        try {
            const response = await getReceivableOverdueSummary();
            const data = response.data.data;
            setOverdueTotal(data.total_overdue);
            const chartData = [
                {
                    name: "Current",
                    value: data.current,
                    color: "#22C55E",
                },
                {
                    name: "1-30",
                    value: data["1_30_days"],
                    color: "#3B82F6",
                },
                {
                    name: "31-60",
                    value: data["31_60_days"],
                    color: "#F59E0B",
                },
                {
                    name: "61-90",
                    value: data["61_90_days"],
                    color: "#EF4444",
                },
                {
                    name: "91-120",
                    value: data["91_120_days"],
                    color: "#8B5CF6",
                },
                {
                    name: ">120",
                    value: data.above_120_days,
                    color: "#6B7280",
                },
            ];
            setOverdueData(chartData);
        } catch (error) {
            console.error(error);
        }
    };

    {/*------------Business Unit --------------------*/ }
    const fetchBusinessUnits = async () => {

        try {
            const response = await getReceivableBusinessUnit();
            const apiData = response.data.data;
            const totalAmount = apiData.reduce(
                (sum, item) => sum + item.amount,
                0
            );
            const chartData = apiData.map((item) => ({
                name: item.business_unit,
                value: item.amount,
                percentage:
                    totalAmount > 0
                        ? (
                            (item.amount / totalAmount) * 100
                        ).toFixed(1) + "%"
                        : "0%",
            }));
            setBusinessUnitData(chartData);
        } catch (error) {
            console.error(error);
        }
    };

    {/*------------Fetch SalesMan --------------------*/ }
    // const loadSalesman = async () => {
    //     try {
    //         const res = await getSalesmanPerformance(filters);
    //         setSalesmanData(res.data);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // };

    {/*------------Dummy data of SalesMan --------------------*/ }
    const salesmanDummyData = [
        {
            salesman: "Ahmed",
            customer_count: 45,
            outstanding_amount: 8.75,
            overdue_amount: 2.10,
            collection_percentage: 92.4,
            dso: 41,
        },
        {
            salesman: "Rahul",
            customer_count: 30,
            outstanding_amount: 6.10,
            overdue_amount: 1.30,
            collection_percentage: 88.2,
            dso: 46,
        },
        {
            salesman: "John",
            customer_count: 18,
            outstanding_amount: 3.25,
            overdue_amount: 0.55,
            collection_percentage: 95.8,
            dso: 37,
        },
         {
            salesman: "John",
            customer_count: 18,
            outstanding_amount: 3.25,
            overdue_amount: 0.55,
            collection_percentage: 95.8,
            dso: 37,
        },

         {
            salesman: "John",
            customer_count: 18,
            outstanding_amount: 3.25,
            overdue_amount: 0.55,
            collection_percentage: 95.8,
            dso: 37,
        },

         {
            salesman: "John",
            customer_count: 18,
            outstanding_amount: 3.25,
            overdue_amount: 0.55,
            collection_percentage: 95.8,
            dso: 37,
        },
        {
            salesman: "John",
            customer_count: 18,
            outstanding_amount: 3.25,
            overdue_amount: 0.55,
            collection_percentage: 95.8,
            dso: 37,
        },

         {
            salesman: "John",
            customer_count: 18,
            outstanding_amount: 3.25,
            overdue_amount: 0.55,
            collection_percentage: 95.8,
            dso: 37,
        },
        {
            salesman: "John",
            customer_count: 18,
            outstanding_amount: 3.25,
            overdue_amount: 0.55,
            collection_percentage: 95.8,
            dso: 37,
        },

         {
            salesman: "John",
            customer_count: 18,
            outstanding_amount: 3.25,
            overdue_amount: 0.55,
            collection_percentage: 95.8,
            dso: 37,
        },


    ];

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
    const agingChartData = agingSummary.map((item) => ({
        name: item.bucket_name,
        value: item.amount,
        percentage: `${item.percentage}%`,
        color: bucketColors[item.bucket_code] || "#9CA3AF",
    }));



    {/*----------Parent division------------------*/ }
    const divisionTotalOutstanding = divisionData.reduce(
        (sum, item) => sum + item.outstanding_amount,
        0
    );
    const divisionChartData = divisionData.map((item) => ({
        name: item.division_name,
        value: item.outstanding_amount,
        percentage:
            divisionTotalOutstanding > 0
                ? (
                    (item.outstanding_amount / divisionTotalOutstanding) *
                    100
                ).toFixed(1) + "%"
                : "0%",
    }));

    {/*-----------Convert the api data for top customers------------------*/ }
    const topCustomerTableData = topCustomers.map((customer, index) => ({
        id: index + 1,
        name: customer.customer_name,
        amount: customer.total_outstanding,
        pct: `${customer.percentage_of_total}%`,
    }));

    const detailedTableData = detailsData.map((item, index) => ({
        id: index + 1,
        customerName: item.customer_name,
        customerType: item.customer_type,
        currency: item.currency,
        country: item.country,
        invoiceNumber: item.invoice_number,
        invoiceDate: item.invoice_date,
        dueDate: item.due_date,
        outstandingAmount: item.outstanding_amount,
        agingBucket: item.aging_bucket,
        salesman: item.salesman,
        division: item.division,
        legalEntity: item.legal_entity,
    }));

    const receivableTrendChart = trendData.map(item => ({
        month: new Date(item.snapshot_date).toLocaleString("default", {
            month: "short",
        }),
        payables: item.total_receivables,
        dpo: item.average_collection_days ?? 0,
    }));

    useEffect(() => {
        fetchFilters();
        fetchSummary();
        fetchAgingSummary();
        fetchDivisionWise();
        fetchTopCustomers();
        fetchDetails();
        fetchTrend();
        fetchOverdueSummary();
        fetchBusinessUnits();
    }, []);

    // useEffect(() => {
    //     loadSalesman();
    // }, [filters]);

    const handleExport = async (type) => {
        try {
            setExporting(type);

            const response = await getReceivableExport(type);

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
            alert("Export Failed");
        } finally {
            setExporting("");
        }
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="page-header">
                {/* Left Content */}
                <div>
                    <h1 className="page-header-title">
                        Receivable Dashboard
                    </h1>
                    <p className="page-header-subtitle">
                        Tracking receivables,aging,overdue and collection performance.
                    </p>
                </div>
                {/* Actions */}
                <div className="topbar-actions">
                    <button id="btn-pl-export-excel"
                        onClick={() => handleExport("excel")}
                        disabled={exporting !== ""}
                        style={{
                            display: "flex", alignItems: "center", gap: 5, padding: "7px 14px",
                            background: exporting === "excel" ? "#d1fae5" : "#f0fdf4",
                            color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 8,
                            fontSize: "0.76rem", fontWeight: 700,
                            cursor: exporting ? "not-allowed" : "pointer",
                            opacity: exporting ? 0.7 : 1,
                        }}> {exporting === "excel" ? "⏳" : "📊"} Excel
                    </button>

                    <button
                        onClick={() => handleExport("pdf")}
                        disabled={exporting !== ""}
                        style={{
                            display: "flex",
                            alignItems: "center", gap: 5, padding: "7px 14px",
                            background: exporting === "pdf" ? "#fee2e2" : "#fef2f2",
                            color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8,
                            fontSize: "0.76rem", fontWeight: 700,
                            cursor: exporting ? "not-allowed" : "pointer", opacity: exporting ? 0.7 : 1,
                        }}> {exporting === "pdf" ? "⏳" : "📄"} PDF
                    </button>
                </div>
            </div>

            {/* Main Content */}

            <div className="flex flex-col gap-2">

                {/* Filters */}
                <Filters filterOptions={filterOptions} />


                {/* KPI Cards */}
                {/* <KPICards data={receivableKpiData} /> */}
                <KPICards data={kpiDataReceivable} />

                {/* Charts Row 1 */}

                <div className="grid-cols-3">
                    <AgingSummaryCard
                        title="Receivables Aging Summary (₹ Cr)"
                        data={agingChartData}
                        total={summary?.total_receivables}
                    />
                    <PayablesTrendCard
                        title="Receivables Trend"
                        daysname="DSO (days)"
                        charttitle="Total Receivables(Cr)"
                        data={receivableTrendChart}
                    />

                    <ParentDivisionCard
                        title="Receivables by Parent Division (₹ Cr)"
                        data={divisionChartData}
                    />


                </div>

                {/* Charts Row 2 */}

                <div className="grid-cols-3">

                    <TopVendorsTable
                        title="Top 10 Customers by Receivables (₹ Cr)"
                        tabletitle1="Customer Name"
                        tabletitle2="Receivable"
                        data={topCustomerTableData}
                    />

                    <OverDueSummaryCard
                        title="Overdue Summary (₹ Cr)"
                        data={overdueData}
                        total={overdueTotal.toFixed(2)}
                    />

                    <BusinessUnitTable
                        title="Receivables by Business Unit (₹ Cr)"
                        tabletitle="Receivable"
                        data={businessUnitData}
                    />

                </div>
                <div className="mt-20">
                    <SalesmanTable
                        title="Salesman Performance"
                        data={salesmanDummyData}
                    />
                </div>
                <div className="mt-20">
                    <DetailedViewTable
                        title="Receivables Detailed View"
                        data={detailedTableData}
                    />
                </div>
            </div>

            {/* Footer */}

            <footer
                className="fixed bottom-0 left-58 right-2 h-6 bg-white border-t border-gray-20 px-3 flex items-cente 
                          justify-between text-[10px] text-gray-600 z-50">
                <span>
                    All values are in INR (₹ Cr) | Data as on 30 Apr 2024
                </span>

                <span>
                    Source: Oracle Fusion Cloud
                </span>

            </footer>
        </div>

    );
}






