import React from "react";
import { useState } from "react";
import ExportButtons from "../components/Common/ExportButtons";
import PageHeader from "../components/Common/PageHeader";
import FooterNote from "../components/FooterNote";
import Filters from "../components/Filters/Filters";
import KPICards from "../components/Cards/KPICards";
import { LuCoins, LuBuilding2, LuBuilding, LuChartPie, LuGauge, LuClock3, LuWallet, LuLandmark, LuScale, LuChartLine, } from "react-icons/lu";
import { IoTrendingUpOutline, IoFlashOutline, } from "react-icons/io5";
import { WorkingCapitalTrendCard, WorkingCapitalComponents, CurrentAssetsVsLiabilities, CashConversionCycle, CashConversionTrend, WorkingCapitalInsights } from "../components/Charts/Charts";
import { BreakdownTable, KeyLiquidityRatios } from "../components/Tables/Tables";

export default function WorkingCapitalReport() {
    const [filterOptions, setFilterOptions] = useState({
        as_on_dates: [],
        currencies: [],
        legal_groups: [],
        legal_entities: [],
        parent_divisions: [],
        subdivisions: [],
    });
    const [exporting, setExporting] = useState("");
    const [loading, setLoading] = useState(true);


    /* ----mockdata for working capital kpi cards------------*/

    const workingCapitalKpiData = [
        {
            id: 1,
            title: "Net Working Capital",
            value: "186.45M",
            trend: "up",
            trendValue: "12.48%",
            comparisonText: "vs 31 Mar 2024",
            isCurrency: true,

            icon: LuCoins,
            trendColor: "#16A34A",
            iconColor: "#2563EB",
            iconBg: "#DBEAFE",
            titleColor: "#2563EB",
            iconBackground: "#DBEAFE",
            cardBackground: "#EAF4FF",
            sparklineColor: "#2563EB",

            sparklineData: [18, 22, 20, 25, 21, 24, 23, 22, 24, 23, 25, 24, 23, 22, 24, 22, 21, 24, 23],
        },

        {
            id: 2,
            title: "Current Assets",
            value: "1245.60M",
            trend: "up",
            trendValue: "5.62%",
            comparisonText: "vs 31 Mar 2024", isCurrency: true,

            icon: LuBuilding2,
            iconBackground: "#DCFCE7",
            cardBackground: "#EDFDF2",
            trendColor: "#16A34A",
            iconColor: "#16A34A",
            iconBg: "#DCFCE7",
            titleColor: "#16A34A",
            sparklineColor: "#16A34A",

            sparklineData: [20, 23, 22, 26, 24, 25, 23, 24, 25, 27, 26, 25, 26, 24, 25, 22, 24, 26, 24],
        },

        {
            id: 3,
            title: "Current Liabilities",
            value: "1059.15M",
            trend: "up",
            trendValue: "2.24%",
            comparisonText: "vs 31 Mar 2024", isCurrency: true,

            icon: LuBuilding,
            iconBackground: "#F3E8FF",
            cardBackground: "#F3ECFF",
            trendColor: "#16A34A",
            iconColor: "#9333EA",
            iconBg: "#F3E8FF",
            titleColor: "#9333EA",
            sparklineColor: "#9333EA",

            sparklineData: [18, 20, 22, 21, 24, 22, 23, 20, 22, 19, 21, 23, 21, 22, 24, 21, 22, 24, 23],
        },

        {
            id: 4,
            title: "Working Capital Ratio",
            value: "1.18",
            trend: "up",
            trendValue: "0.10",
            comparisonText: "vs 31 Mar 2024", isCurrency: false,

            icon: LuChartPie,
            iconColor: "#EA580C",
            iconBackground: "#FFEDD5",
            cardBackground: "#FFF2E8",
            trendColor: "#16A34A",
            iconBg: "#FFEDD5",
            titleColor: "#EA580C",
            sparklineColor: "#EA580C",

            sparklineData: [18, 23, 19, 21, 18, 22, 20, 19, 20, 21, 19, 20, 18, 20, 21, 23, 20, 21, 20],
        },

        {
            id: 5,
            title: "Quick Ratio",
            value: "0.92",
            trend: "up",
            trendValue: "0.06",
            comparisonText: "vs 31 Mar 2024", isCurrency: false,

            icon: LuGauge,
            iconColor: "#0891B2",
            iconBackground: "#CFFAFE",
            cardBackground: "#ECF9FF",
            iconBg: "#CFFAFE",
            trendColor: "#16A34A",
            titleColor: "#0891B2",
            sparklineColor: "#0891B2",

            sparklineData: [16, 17, 18, 16, 17, 16, 17, 17, 18, 20, 17, 18, 16, 18, 17, 19, 18, 18, 17],
        },

        {
            id: 6,
            title: "Cash Conversion Cycle(Days)",
            value: "28 Days",
            trend: "down",
            trendValue: "3 Days",
            comparisonText: "vs 31 Mar 2024", isCurrency: false,

            icon: LuClock3,
            iconColor: "#DB2777",
            iconBg: "#FCE7F3",
            iconBackground: "#FFE4E6",
            cardBackground: "#FFEFF3",
            trendColor: "#16A34A",
            titleColor: "#DB2777",
            sparklineColor: "#DB2777",

            sparklineData: [30, 32, 31, 34, 30, 31, 29, 30, 33, 30, 31, 30, 29, 31, 30, 32, 31, 32, 31],
        },
    ];
    /* ----mockdata for Working Capital Trend Chart------------*/
    const workingCapitalTrendData = [
        { month: "Nov 2023", nwc: 142500000, ratio: 1.05 },
        { month: "Dec 2023", nwc: 156300000, ratio: 1.08 },
        { month: "Jan 2024", nwc: 165450000, ratio: 1.15 },
        { month: "Feb 2024", nwc: 174200000, ratio: 1.17 },
        { month: "Mar 2024", nwc: 166850000, ratio: 1.08 },
        { month: "Apr 2024", nwc: 186450000, ratio: 1.18 },
    ];

    /* ----mockdata for Working Capital Components------------*/
    const workingCapitalComponents = [
        {
            name: "Current Assets",
            offset: 0,
            amount: 1245.60,
            color: "#4CAF50",
            displayValue: "1,245.60",
            originalAmount: 1245.60,
        },
        {
            name: "(-) Current Liabilities",
            offset: 186.45,
            amount: 1059.15,
            color: "#EC407A",
            displayValue: "(1,059.15)",
            originalAmount: -1059.15,
        },
        {
            name: "Net Working Capital",
            offset: 0,
            amount: 186.45,
            color: "#2962FF",
            displayValue: "186.45",
            originalAmount: 186.45,
        },
    ];
    /* ----mockdata for Working Capital Current Assets vs Current Liabilities------------*/
    const currentAssetsVsLiabilitiesData = [
        {
            name: "Current Assets",
            "31 Mar 2024": 1178.35,
            "30 Apr 2024": 1245.60,
        },
        {
            name: "Current Liabilities",
            "31 Mar 2024": 1035.95,
            "30 Apr 2024": 1059.15,
        },
    ];
    /* ----mockdata for Working Capital Current Assets Breakdown Table----------*/
    const currentAssetsBreakdown = [
        {
            particular: "Cash & Bank Balance",
            mar31: 105.40,
            apr30: 112.85,
            variance: 7.45,
            variancePct: 7.06,
        },
        {
            particular: "Trade Receivables",
            mar31: 455.20,
            apr30: 488.75,
            variance: 13.55,
            variancePct: 2.98,
        },
        {
            particular: "Inventories",
            mar31: 420.15,
            apr30: 442.30,
            variance: 22.15,
            variancePct: 5.27,
        },
        {
            particular: "Advances & Other Receivables",
            mar31: 112.60,
            apr30: 121.40,
            variance: 8.80,
            variancePct: 7.81,
        },
        {
            particular: "Other Current Assets",
            mar31: 84.00,
            apr30: 100.30,
            variance: 16.30,
            variancePct: 19.40,
        },
    ];

    const currentAssetsTotal = {
        particular: "Total Current Assets",
        mar31: 1178.35,
        apr30: 1245.60,
        variance: 67.25,
        variancePct: 5.70,
    };

    // CURRENT LIABILITIES
    const currentLiabilitiesBreakdown = [
        {
            particular: "Trade Payables",
            mar31: 587.40,
            apr30: 602.35,
            variance: 14.95,
            variancePct: 2.54,
        },
        {
            particular: "Short Term Borrowings",
            mar31: 210.30,
            apr30: 215.80,
            variance: 5.50,
            variancePct: 2.61,
        },
        {
            particular: "Other Current Liabilities",
            mar31: 153.25,
            apr30: 158.40,
            variance: 5.15,
            variancePct: 3.36,
        },
        {
            particular: "Provisions",
            mar31: 65.60,
            apr30: 67.30,
            variance: 1.70,
            variancePct: 2.59,
        },
        {
            particular: "Advances from Customers",
            mar31: 19.40,
            apr30: 15.30,
            variance: -4.10,
            variancePct: -21.13,
        },
    ];

    const currentLiabilitiesTotal = {
        particular: "Total Current Liabilities",
        mar31: 1035.95,
        apr30: 1059.15,
        variance: 23.20,
        variancePct: 2.24,
    };


    /* ----mockdata for Working Capital  Key Liquidity Ratios---------*/
    const keyLiquidityRatios = [
        {
            ratio: "Current Ratio",
            current: 1.18,
            previous: 1.14,
            variance: 0.04,
        },
        {
            ratio: "Quick Ratio",
            current: 0.92,
            previous: 0.88,
            variance: 0.06,
        },
        {
            ratio: "Cash Ratio",
            current: 0.11,
            previous: 0.10,
            variance: 0.01,
        },
        {
            ratio: "Working Capital Ratio",
            current: 1.18,
            previous: 1.08,
            variance: 0.10,
        },
    ];

    /* ----mockdata for Working Capital Cash Conversion Cycle Cards---------*/

    const cashConversionCycleData = [
        {
            key: "dso",
            label: "DSO (Days)",
            value: 52,
            variance: 4,
            direction: "up",
            icon: "clock",
            iconColor: "#2563eb",
            iconBg: "#eaf2ff",
            cardBg: "#f8fbff",
        },
        {
            key: "dio",
            label: "DIO (Days)",
            value: 47,
            variance: 2,
            direction: "up",
            icon: "inventory",
            iconColor: "#16a34a",
            iconBg: "#e9f8ef",
            cardBg: "#f8fcfa",
        },
        {
            key: "dpo",
            label: "DPO (Days)",
            value: 71,
            variance: 1,
            direction: "up",
            icon: "payment",
            iconColor: "#14b8a6",
            iconBg: "#e6f8f6",
            cardBg: "#f8fcfc",
        },
        {
            key: "ccc",
            label: "CCC (Days)",
            value: 28,
            variance: 3,
            direction: "down",
            icon: "cycle",
            iconColor: "#ec4899",
            iconBg: "#fdebf4",
            cardBg: "#fff9fc",
        },
    ];

    const cashConversionTrendData = [
        {
            month: "Nov 2023",
            value: 37,
        },
        {
            month: "Dec 2023",
            value: 34,
        },
        {
            month: "Jan 2024",
            value: 33,
        },
        {
            month: "Feb 2024",
            value: 32,
        },
        {
            month: "Mar 2024",
            value: 31,
        },
        {
            month: "Apr 2024",
            value: 28,
        },
    ];

    const workingCapitalInsights = [
        {
            text: "Net Working Capital increased by ₹ 20.60 Cr (12.48%) compared to 31 Mar 2024.",
        },
        {
            text: "Inventory levels increased leading to higher DIO.",
        },
        {
            text: "Collection efficiency improved. DSO reduced by 4 days.",
        },
        {
            text: "Overall Cash Conversion Cycle improved by 3 days.",
        },
    ];
    return (
        <div className="page-content relative">
            <PageHeader
                title="Working Capital Report"
                subtitle="Track working capital position and efficiency across all dimensions.">

                <ExportButtons
                    endpoint="working capital"
                    exporting={exporting}
                />
            </PageHeader>

            {/* Main Content */}

            <div className="flex flex-col gap-2">
                {/* ----Filters---- */}
                <Filters
                    filterOptions={filterOptions}
                />
                {/* -----KPI Cards----- */}
                <div style={{ marginTop: "-18px" }}>
                    <KPICards data={workingCapitalKpiData} />
                </div>

                {/* -----Working Capital Trend data---- */}
                <div className="grid grid-cols-16 gap-3 mt-3">

                    <div className="col-span-6">
                        <WorkingCapitalTrendCard
                            title="Working Capital Trend(AED)"
                            charttitle="Net Working Capital(AED)"
                            ratiotitle="Working Capital Ratio"
                            currency="AED"
                            data={workingCapitalTrendData}
                        />
                    </div>
                    <div className="col-span-5">
                        <WorkingCapitalComponents
                            title="Working Capital Components(AED)"
                            currency="AED"
                            data={workingCapitalComponents}
                        />
                    </div>
                    <div className="col-span-5">
                        <CurrentAssetsVsLiabilities
                            title="Current Assets vs Current Liabilities (AED)"
                            data={currentAssetsVsLiabilitiesData}
                            currency="AED"
                        />
                    </div>

                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1.25fr 1.25fr 0.85fr",
                        gap: "10px",
                        width: "100%",
                    }}
                >
                    {/* CURRENT ASSETS */}
                    <BreakdownTable
                        title="Current Assets Breakdown (AED)"
                        rows={currentAssetsBreakdown}
                        totalRow={currentAssetsTotal}
                    />

                    {/* CURRENT LIABILITIES */}
                    <BreakdownTable
                        title="Current Liabilities Breakdown (AED)"
                        rows={currentLiabilitiesBreakdown}
                        totalRow={currentLiabilitiesTotal}
                    />

                    {/* KEY LIQUIDITY RATIOS */}
                    <KeyLiquidityRatios
                        title="Key Liquidity Ratios"
                        rows={keyLiquidityRatios}
                    />
                </div>


                <div
                    style={{
                        display: "grid",

                        /* LEFT CCC + RIGHT TREND/INSIGHTS */
                        gridTemplateColumns: "1.05fr 1.95fr",

                        gap: "10px",

                        width: "100%",
                        height: "100%",
                        minWidth: 0,
                    }}
                >
                    {/* =========================================
                CASH CONVERSION CYCLE
            ========================================= */}

                    <CashConversionCycle
                        title="Cash Conversion Cycle (Days)"
                        data={cashConversionCycleData}
                    />

                    {/* =========================================
                TREND + INSIGHTS
            ========================================= */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1.7fr 0.85fr",
                            gap: "10px",
                            minWidth: 0,
                        }}
                    >
                        {/* TREND */}
                        <CashConversionTrend
                            title="Cash Conversion Cycle Trend (Days)"
                            data={cashConversionTrendData}
                        />

                        {/* INSIGHTS */}
                        <WorkingCapitalInsights
                            title="Insights"
                            data={workingCapitalInsights}
                        />
                    </div>
                </div>
            </div>
            {/* Footer */}
            <div className="fixed bottom-0 left-58 right-2 z-50 bg-white border-t border-gray-200 p-2">
                <FooterNote
                    title="Note:"
                    message="All values are in AED | ☁️ Source: Oracle Fusion Cloud"
                    showRefresh={false}
                />
            </div>
        </div>
    )
}


