import React from "react";
import { useState } from "react";
import ExportButtons from "../components/Common/ExportButtons";
import PageHeader from "../components/Common/PageHeader";
import FooterNote from "../components/FooterNote";
import Filters from "../components/Filters/Filters";
import KPICards from "../components/Cards/KPICards";
import { LuPackage, LuBoxes, LuChartLine, } from "react-icons/lu";
import { IoCubeOutline, IoTimerOutline, IoWarningOutline, } from "react-icons/io5";
import { InventoryValueTrend, OverDueSummaryCard, ParentDivisionCard, AgingSummaryCard } from "../components/Charts/Charts";
import { InventoryTable, InventoryLocationTable } from "../components/Tables/Tables";
import InventoryDetailedViewTable from "../components/Tables/InventoryDetailedViewTable"


export default function InventoryAgingPage() {

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
    const [exporting, setExporting] = useState("");
    const [loading, setLoading] = useState(true);


    {/*------------Inventory kpi crads mockdata------------------*/ }
    const inventoryKpiData = [
        {
            id: 1,
            title: "Total Inventory Value",
            value: "₹ 472.35 Cr",
            icon: LuPackage,
            titleColor: "#2563EB",
            iconColor: "#2563EB",
            iconBackground: "#DBEAFE",
            cardBackground: "#F8FBFF",
            trend: "up",
            trendValue: "11.28%",
            comparisonText: "vs 31 Mar 2024",
            trendColor: "#16A34A",
            sparklineColor: "#2563EB",
            sparklineData: [
                8, 9, 11, 10, 12,
                9, 10, 11, 13, 12,
                14, 13, 12, 14, 13,
                15, 14, 13, 15, 14,
                16, 15
            ]
        },

        {
            id: 2,
            title: "Total Stock Quantity",
            value: "2,36,48,520 Nos",
            icon: LuBoxes,
            titleColor: "#16A34A",
            iconColor: "#16A34A",
            iconBackground: "#DCFCE7",
            cardBackground: "#F8FFFA",
            trend: "up",
            trendValue: "6.85%",
            comparisonText: "vs 31 Mar 2024",
            trendColor: "#16A34A",
            sparklineColor: "#16A34A",
            sparklineData: [
                7, 8, 9, 8, 10,
                9, 8, 10, 12, 9,
                10, 11, 9, 10, 11,
                10, 9, 11, 10, 12,
                11, 10
            ]
        },

        {
            id: 3,
            title: "Avg. Inventory Value",
            value: "₹ 2.78 Cr",
            icon: IoCubeOutline,
            titleColor: "#7C3AED",
            iconColor: "#7C3AED",
            iconBackground: "#F3E8FF",
            cardBackground: "#FAF5FF",
            trend: "up",
            trendValue: "4.32%",
            comparisonText: "vs 31 Mar 2024",
            trendColor: "#16A34A",
            sparklineColor: "#7C3AED",
            sparklineData: [
                9, 10, 12, 11, 13,
                10, 12, 11, 9, 10,
                12, 11, 13, 10, 11,
                9, 12, 10, 13, 11,
                14, 13
            ]
        },

        {
            id: 4,
            title: "Inventory Turnover (TTM)",
            value: "5.42 Times",
            icon: LuChartLine,
            titleColor: "#EA580C",
            iconColor: "#EA580C",
            iconBackground: "#FFEDD5",
            cardBackground: "#FFF9F5",
            trend: "up",
            trendValue: "0.38",
            comparisonText: "vs 31 Mar 2024",
            trendColor: "#16A34A",
            sparklineColor: "#EA580C",
            sparklineData: [
                8, 9, 9, 10, 9,
                11, 10, 12, 11, 10,
                12, 11, 10, 11, 12,
                11, 12, 13, 12, 13,
                14, 14
            ]
        },

        {
            id: 5,
            title: "Stock Holding Days",
            value: "67 Days",
            icon: IoTimerOutline,
            titleColor: "#0891B2",
            iconColor: "#0891B2",
            iconBackground: "#CFFAFE",
            cardBackground: "#F7FDFF",
            trend: "down",
            trendValue: "4 Days",
            comparisonText: "vs 31 Mar 2024",
            trendColor: "#DC2626",
            sparklineColor: "#0891B2",
            sparklineData: [
                13, 12, 14, 13, 12,
                14, 13, 15, 12, 14,
                13, 15, 13, 14, 12,
                14, 13, 15, 14, 13,
                14, 13
            ]
        },

        {
            id: 6,
            title: "Obsolete / Slow Moving",
            value: "₹ 28.45 Cr",
            icon: IoWarningOutline,
            titleColor: "#E11D48",
            iconColor: "#E11D48",
            iconBackground: "#FFE4E6",
            cardBackground: "#FFF8F9",
            trend: "up",
            trendValue: "3.72%",
            comparisonText: "vs 31 Mar 2024",
            trendColor: "#DC2626",
            sparklineColor: "#E11D48",
            sparklineData: [
                11, 12, 14, 13, 15,
                12, 13, 14, 16, 13,
                15, 14, 16, 14, 13,
                15, 16, 13, 15, 14,
                16, 15
            ]
        }
    ];
    {/*------------Inventory trend mockdata------------------*/ }
    const inventoryTrendData = [
        {
            month: "Nov",
            fy2324: 340,
            fy2425: 260,
        },
        {
            month: "Dec",
            fy2324: 410,
            fy2425: 320,
        },
        {
            month: "Jan",
            fy2324: 380,
            fy2425: 285,
        },
        {
            month: "Feb",
            fy2324: 420,
            fy2425: 320,
        },
        {
            month: "Mar",
            fy2324: 425,
            fy2425: 360,
        },
        {
            month: "Apr",
            fy2324: 400,
            fy2425: 455,
        },
    ];

    {/*------------Inventory parent division mockdata------------------*/ }
    const inventoryData = [
        {
            name: "Corporate",
            value: 3200000,
            percentage: 34,
            color: "#2563EB",
        },
        {
            name: "Retail",
            value: 2800000,
            percentage: 30,
            color: "#16A34A",
        },
        {
            name: "Trading",
            value: 1900000,
            percentage: 20,
            color: "#F59E0B",
        },
        {
            name: "Projects",
            value: 1300000,
            percentage: 16,
            color: "#EF4444",
        },
    ];
    {/*------------Total calculation Inventory parent division mockdata------------------*/ }
    const totalInventory = inventoryData.reduce(
        (sum, item) => sum + item.value,
        0
    );
    {/*------------Inventory business unit mockdata------------------*/ }
    const inventoryBusinessUnitData = [
        { name: "Coils BU", value: 158.45 },
        { name: "Service BU", value: 102.30 },
        { name: "Fans BU", value: 74.60 },
        { name: "Gears BU", value: 62.40 },
        { name: "Valves BU", value: 48.20 },
        { name: "Others", value: 26.40 },
    ];
    {/*------------Inventory aging summary mockdata------------------*/ }
    const inventoryAgingData = [
        {
            name: "0-30 Days",
            value: 2300000,
            percentage: 23,
            color: "#16A34A",
        },
        {
            name: "31-60 Days",
            value: 1600000,
            percentage: 16,
            color: "#F59E0B",
        },
        {
            name: "61-90 Days",
            value: 900000,
            percentage: 9,
            color: "#EF4444",
        },
        {
            name: "91-180 Days",
            value: 600000,
            percentage: 6,
            color: "#8B5CF6",
        },
        {
            name: " > 180 Days",
            value: 400000,
            percentage: 4,
            color: "#0F766E",
        },
    ];

    const totalInventoryAging = inventoryAgingData.reduce(
        (sum, item) => sum + item.value,
        0
    );

    {/*------------Inventory Slow moving items Top 5 mockdata------------------*/ }
    const slowMovingItemsData = [
        {
            item: 'Industrial Fan 24"',
            code: "IF-24-001",
            qty: 12450,
            value: 3.85,
            days: 245,
        },
        {
            item: "Coil CRCA 1.2mm",
            code: "CRCA-12",
            qty: 18600,
            value: 3.25,
            days: 232,
        },
        {
            item: "Gear Box Helical 40-1",
            code: "GB-40-1",
            qty: 8750,
            value: 2.40,
            days: 215,
        },
        {
            item: "Motor IE3 7.5 KW",
            code: "MTR-75",
            qty: 6320,
            value: 1.95,
            days: 210,
        },
        {
            item: 'Valve Gate 4"',
            code: "VG-04",
            qty: 4850,
            value: 1.75,
            days: 205,
        },
    ];
    {/*------------Inventory Location Top 5 mockdata------------------*/ }
    const inventoryLocationData = [
        {
            location: "Al Ain Warehouse",
            value: 96.45,
            percentage: 20.42,
        },
        {
            location: "Jebel Ali Warehouse",
            value: 85.20,
            percentage: 18.04,
        },
        {
            location: "Riyadh Warehouse",
            value: 72.60,
            percentage: 15.37,
        },
        {
            location: "Dammam Warehouse",
            value: 63.40,
            percentage: 13.42,
        },
        {
            location: "Abu Dhabi Warehouse",
            value: 54.30,
            percentage: 11.50,
        },
    ];

    const inventoryLocationTotal = {
        value: 371.95,
        percentage: 78.75,
    };
    const inventoryDetailsData = [
        {
            legalEntity: "Alpine Coils LLC",
            parentDivision: "Alpine",
            subDivision: "Alpine Coils",
            businessUnit: "Coils BU",
            totalQty: 5845210,
            inventoryValue: 212.45,
            days0to30: 68.20,
            days31to60: 48.30,
            days61to90: 38.10,
            days91to180: 32.45,
            daysAbove180: 25.40,
            slowMoving: 15.60,
        },
        {
            legalEntity: "DC Serve LLC",
            parentDivision: "DC Serve",
            subDivision: "DC Serve Equip.",
            businessUnit: "Service BU",
            totalQty: 4210850,
            inventoryValue: 136.80,
            days0to30: 44.30,
            days31to60: 31.25,
            days61to90: 24.70,
            days91to180: 20.40,
            daysAbove180: 16.15,
            slowMoving: 9.85,
        },
        {
            legalEntity: "Filter Fan LLC",
            parentDivision: "Alpine",
            subDivision: "Filter Fan - UAE",
            businessUnit: "Fans BU",
            totalQty: 3125460,
            inventoryValue: 74.30,
            days0to30: 23.60,
            days31to60: 16.80,
            days61to90: 12.90,
            days91to180: 11.50,
            daysAbove180: 7.80,
            slowMoving: 4.60,
        },
        {
            legalEntity: "Alpine Gears LLC",
            parentDivision: "Alpine",
            subDivision: "Alpine Gears",
            businessUnit: "Gears BU",
            totalQty: 2740120,
            inventoryValue: 62.40,
            days0to30: 18.90,
            days31to60: 14.20,
            days61to90: 10.40,
            days91to180: 8.95,
            daysAbove180: 6.35,
            slowMoving: 3.20,
        },
        {
            legalEntity: "Valves KSA LLC",
            parentDivision: "DC Serve",
            subDivision: "Valves KSA",
            businessUnit: "Valves BU",
            totalQty: 1985730,
            inventoryValue: 48.20,
            days0to30: 15.45,
            days31to60: 10.30,
            days61to90: 7.25,
            days91to180: 6.10,
            daysAbove180: 4.85,
            slowMoving: 2.45,
        },
        {
            legalEntity: "Others",
            parentDivision: "Others",
            subDivision: "Others",
            businessUnit: "Others",
            totalQty: 5741150,
            inventoryValue: 28.20,
            days0to30: 8.00,
            days31to60: 6.75,
            days61to90: 4.95,
            days91to180: 3.45,
            daysAbove180: 5.05,
            slowMoving: 2.75,
        },
    ];

    return (
        <div className="page-content relative">
            <PageHeader
                title="Inventory Overview"
                subtitle="Track inventory position,movement and aging across all dimensions.">

                <ExportButtons
                    endpoint="inventory"
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
                    <KPICards data={inventoryKpiData} />
                </div>
                <div className="receivables-grid gap-3">
                    <InventoryValueTrend
                        title="Inventory Value Trend"
                        data={inventoryTrendData}
                    />

                    <OverDueSummaryCard
                        title="Inventory Value by Parent Division"
                        data={inventoryData}
                        total={totalInventory}
                        Centerlabel="Total Inventory"
                    />
                    <ParentDivisionCard
                        title="Inventory Value by Business Unit"
                        data={inventoryBusinessUnitData}
                    />
                </div>

                <div className="inventory-grid">
                    <AgingSummaryCard
                        title="Inventory Aging Summary"
                        data={inventoryAgingData}
                        legendData={inventoryAgingData}
                        total={totalInventoryAging}
                        date="31 Mar 2025"
                        showSummaryHeader
                    />

                    <InventoryTable
                        title="Slow Moving Items (Top 5)"
                        data={slowMovingItemsData}
                    />

                    <InventoryLocationTable
                        title="Inventory by Location (Top 5)"
                        data={inventoryLocationData}
                    />
                </div>
                <InventoryDetailedViewTable
                    title="Inventory Detailed View"
                    data={inventoryDetailsData}
                />

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

    );
}