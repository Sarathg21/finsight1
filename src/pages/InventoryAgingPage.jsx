import React from "react";
import { useState, useEffect } from "react";
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
import InventoryDetailsModal from "../components/InventoryDetailsModal";
import ChartMenu from "../components/ChartMenu";
import {
    getInventoryFilters, getInventorySummary, getInventoryAgingSummary, getInventoryCategoryWise, getInventoryWarehouseWise, getInventoryTrend,
    getInventoryTopItems, getInventoryDetails, getInventorySubDivisionWise,
    getInventorySlowMovingItems, getInventoryExport, getInventoryDivisionWise
} from "../api/inventoryApi"

export default function InventoryAgingPage() {

    const [inventorySummary, setInventorySummary] = useState(null);
    const [inventoryTrendData, setInventoryTrendData] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [inventorySubdivision, setinventorySubdivision] = useState([]);
    const [inventoryAgingData, setInventoryAgingData] = useState([]);
    const [slowMovingItemsData, setSlowMovingItemsData] = useState([]);
    const [inventoryLocationData, setInventoryLocationData] = useState([]);
    const [inventoryDetailsData, setInventoryDetailsData] = useState([]);
    const [inventoryAgingTotal, setInventoryAgingTotal] = useState(0);

    const [filters, setFilters] = useState({});

    const [filterOptions, setFilterOptions] = useState({
        legal_groups: [],
        legal_entities: [],
        parent_divisions: [],
        subdivisions: [],
        currencies: [],
        as_on_dates: [],
    });
    const [exporting, setExporting] = useState("");
    const [loading, setLoading] = useState(true);
    const [showDetailsModal, setShowDetailsModal] = useState(false);


    const handleViewDetails = () => {
        setShowDetailsModal(true);
    };

    // Fetch Filters
    const fetchFilters = async () => {
        try {
            const response = await getInventoryFilters();

            console.log("Raw Filter API:", response.data);

            const data = response.data;
            setFilterOptions({
                legal_groups: data.legal_groups || [],
                legal_entities: data.legal_entities || [],
                parent_divisions: data.parent_divisions || [],
                subdivisions: data.subdivisions || [],
                currencies: data.currencies || [],
                as_on_dates: data.available_dates || [],
            });

        } catch (error) {
            console.error("Filters Error:", error);
        }
    };
    // Fetch KPI Summary
    const fetchSummary = async () => {
        try {
            const response = await getInventorySummary(filters);
            console.log("Summary:", response.data);
            setInventorySummary(response.data);

        } catch (error) {
            console.error("Summary Error:", error);
        }
    };

    const agingColors = {
        "0-30 Days": "#16A34A",
        "31-60 Days": "#F59E0B",
        "61-90 Days": "#EF4444",
        "91-120 Days": "#8B5CF6",
        "121-180 Days": "#0F766E",
        "181-365 Days": "#2563EB",
        "366-730 Days": "#94A3B8",
        "Above 730 Days": "#64748B",
    };

    const fetchAgingSummary = async () => {
        try {
            const response = await getInventoryAgingSummary(filters);

            const apiData = response.data;

            const total = apiData.reduce(
                (sum, item) => sum + Number(item.value),
                0
            );

            const formattedData = apiData.map((item) => ({
                name: item.bucket,
                value: Number(item.value),
                percentage: (
                    (Number(item.value) / total) *
                    100
                ).toFixed(2), // <-- only 2 decimals
                color: agingColors[item.bucket] || "#94A3B8",
            }));

            setInventoryAgingData(formattedData);
            setInventoryAgingTotal(total);
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch Warehouse location Wise
    const fetchWarehouseWise = async () => {
        try {
            const response = await getInventoryWarehouseWise(filters);

            console.log("Warehouse Wise:", response.data);

            const formattedData = response.data.map((item) => ({
                location: item.location_name || item.warehouse,
                value: Number(item.total_value || 0),
                quantity: Number(item.total_quantity || 0),
                percentage: Number(item.share_percent || 0),
            }));

            setInventoryLocationData(formattedData);

        } catch (error) {
            console.error("Warehouse Wise Error:", error);
        }
    };

    // Fetch Parent Division Wise
    const fetchDivisionWise = async () => {
        try {

            const response = await getInventoryDivisionWise(filters);
            console.log("Division Wise:", response.data);

            const formattedData = response.data.map((item, index) => ({
                name: item.parent_division,
                value: Number(item.total_value),
                percentage: Number(item.share_percent),
                color: [
                    "#2563EB",
                    "#16A34A",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6"
                ][index % 5]
            }));

            setInventoryData(formattedData);


        } catch (error) {
            console.error(
                "Division Wise Error:",
                error
            );
        }
    };

    // Fetch Trend
    const fetchTrend = async () => {
        try {
            const response = await getInventoryTrend(filters);
            console.log("Trend API:", response.data);

            const formattedData = response.data.map((item) => ({
                month: item.month,
                inventoryValue: Number(item.inventory_value)
            }));
            setInventoryTrendData(formattedData);
        } catch (error) {
            console.error("Trend Error:", error);
        }
    };

    const fetchSubdivisionWise = async () => {
        try {
            const response = await getInventorySubDivisionWise(filters);

            console.log("Subdivision API:", response.data);

            const apiData = response.data.data || response.data;

            const formattedData = apiData.map((item, index) => ({
                name: item.subdivision,
                value: Number(item.total_value || item.amount || 0),
                percentage: Number(item.share_percent || 0),
                color: [
                    "#2563EB",
                    "#16A34A",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6"
                ][index % 5]
            }));

            console.log("Formatted Subdivision:", formattedData);

            setinventorySubdivision(formattedData);

        } catch (error) {
            console.error("Subdivision Error:", error);
        }
    };

    const fetchslowmovingItems = async () => {
        try {
            const response = await getInventorySlowMovingItems(filters);

            const formattedData = response.data.map((item) => ({
                item: item.item_description,
                code: item.item_code,
                qty: item.total_quantity,
                value: item.total_value,
                category: item.primary_category,
            }));

            setSlowMovingItemsData(formattedData);

        } catch (error) {
            console.error("SlowMoving Items Error:", error);
        }
    };

    // Fetch Details
    const fetchDetails = async () => {
        try {
            const response = await getInventoryDetails(filters);
            const apiData = response.data?.data || [];
            const formattedData = apiData.map((item) => ({
                legalEntity: item.legal_entity,
                subDivision: item.subdivision ?? "-",
                warehouse: item.warehouse,
                category: item.primary_category,
                itemCode: item.item_code,
                description: item.item_description,
                quantity: Number(item.quantity),
                inventoryValue: Number(item.total_cost_value),

                days0to30: Number(item.val_0_30),
                days31to60: Number(item.val_31_60),
                days61to90: Number(item.val_61_90),
                days91to120: Number(item.val_91_120),
                days121to180: Number(item.val_121_180),
                days181to365: Number(item.val_181_365),
                days366to730: Number(item.val_366_730),
                daysAbove730: Number(item.val_above_730),
            }));

            setInventoryDetailsData(formattedData);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        fetchFilters();
    }, []);


    useEffect(() => {
        fetchSummary();
        fetchAgingSummary();
        fetchslowmovingItems();
        fetchWarehouseWise();
        fetchDivisionWise();
        fetchTrend();
        fetchSubdivisionWise();
        fetchDetails();
    }, [filters]);

    const formatAED = (value) => {
        if (value === null || value === undefined) return "-";

        if (value >= 1000000) {
            return `AED ${(value / 1000000).toFixed(2)}M`;
        }
        if (value >= 1000) {
            return `AED ${(value / 1000).toFixed(2)}K`;
        }
        return `AED ${value.toFixed(2)}`;
    };

    const formatNumber = (value) => {
        if (value === null || value === undefined) return "-";

        return new Intl.NumberFormat("en-IN").format(value);
    };

    const selectedCurrency =
        filters.currency || inventorySummary?.currency || "AED";
    console.log("Selected Currency:", selectedCurrency);

    {/*------------Inventory kpi crads mockdata------------------*/ }
    const InventoryKpiData = [
        {
            id: 1,
            title: "Total Inventory Value",
            value: inventorySummary?.total_inventory_value,
            formatType: "currency",
            currency: selectedCurrency,
            icon: LuPackage,
            titleColor: "#2563EB",
            iconColor: "#2563EB",
            iconBackground: "#DBEAFE",
            cardBackground: "#EAF4FF",
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
            title: "Inventory Value >365Days",
            value: inventorySummary?.total_stock_quantity,
            formatType: "number",
            icon: LuBoxes,
            titleColor: "#16A34A",
            iconColor: "#16A34A",
            iconBackground: "#DCFCE7",
            cardBackground: "#EDFDF2",
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
            value: inventorySummary?.average_inventory_value,
            formatType: "currency",
            currency: selectedCurrency,
            icon: IoCubeOutline,
            titleColor: "#7C3AED",
            iconColor: "#7C3AED",
            iconBackground: "#F3E8FF",
            cardBackground: "#F3ECFF",
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
            value: inventorySummary?.inventory_turnover_ttm,
            formatType: "ratio",
            icon: LuChartLine,
            titleColor: "#EA580C",
            iconColor: "#EA580C",
            iconBackground: "#FFEDD5",
            cardBackground: "#FFF2E8",
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
            value: inventorySummary?.stock_holding_days,
            formatType: "days",
            icon: IoTimerOutline,
            titleColor: "#0891B2",
            iconColor: "#0891B2",
            iconBackground: "#CFFAFE",
            cardBackground: "#ECF9FF",
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
            value: inventorySummary?.obsolete_slow_moving,
            formatType: "currency",
            currency: selectedCurrency,
            icon: IoWarningOutline,
            titleColor: "#E11D48",
            iconColor: "#E11D48",
            iconBackground: "#FFE4E6",
            cardBackground: "#FFEFF3",
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


    {/*------------Total calculation Inventory parent division mockdata------------------*/ }
    const totalInventory = inventoryData.reduce(
        (sum, item) => sum + item.value,
        0
    );


    const handleFilterApply = (selectedFilters) => {
        console.log("Applied Filters:", selectedFilters);
        setFilters(selectedFilters);
    };

    const handleFilterReset = () => {
        const resetFilters = {};
        setFilters(resetFilters);
    };

    const handleExport = async (type) => {
        try {
            setExporting(type);

            const response = await getInventoryExport(
                type === "excel" ? "xlsx" : "pdf",
                filters
            );

            const blob = new Blob([response.data], {
                type: response.headers["content-type"],
            });

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;

            const fileName =
                type === "excel"
                    ? "Inventory_Detailed_Report.xlsx"
                    : "Inventory_Detailed_Report.pdf";

            link.setAttribute("download", fileName);

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Inventory Export Error:", error);
            alert("Download Failed");
        } finally {
            setExporting("");
        }
    };

    return (
        <div className="page-content relative">
            <PageHeader
                title="Inventory Overview"
                subtitle="Track inventory position,movement and aging across all dimensions.">
                <ExportButtons
                    endpoint="inventory"
                    exporting={exporting}
                    handleExport={handleExport}
                />
            </PageHeader>

            {/* Main Content */}

            <div className="flex flex-col gap-2">
                {/* ----Filters---- */}
                <Filters
                    filterOptions={filterOptions}
                    onApply={handleFilterApply}
                    onReset={handleFilterReset}
                />
                {/* -----KPI Cards----- */}
                <div style={{ marginTop: "-18px" }}>
                    <KPICards data={InventoryKpiData} />
                </div>
                <div className="receivables-grid gap-3">
                    <InventoryValueTrend
                        title="Inventory Value Trend"
                        data={inventoryTrendData}
                        currency={selectedCurrency}
                    />

                    <OverDueSummaryCard
                        title="Inventory Value by Parent Division"
                        data={inventoryData}
                        total={totalInventory}
                        Centerlabel="Total Inventory"
                        currency={selectedCurrency}
                    />
                    <ParentDivisionCard
                        title="Inventory Value by Subdivision"
                        data={inventorySubdivision || []}
                        currency={selectedCurrency}
                    />
                </div>

                <div className="inventory-grid">
                    <AgingSummaryCard
                        title="Inventory Aging Summary"
                        data={inventoryAgingData}
                        legendData={inventoryAgingData}
                        total={inventoryAgingTotal}
                        date="31 Mar 2025"
                        showSummaryHeader
                        wideLegend
                        currency={selectedCurrency}
                    />
                    <InventoryTable
                        title="Top 5 High Value Inventory Items"
                        data={slowMovingItemsData}
                        currency={selectedCurrency}
                    />

                    <InventoryLocationTable
                        title="Inventory by Location (Top 5)"
                        data={inventoryLocationData}
                        currency={selectedCurrency}
                    />
                </div>

                <InventoryDetailedViewTable
                    title="Inventory Detailed View"
                    data={inventoryDetailsData}
                    currency={selectedCurrency}
                    onViewAll={handleViewDetails}
                    onExportExcel={() => handleExport("excel")}
                    onExportPdf={() => handleExport("pdf")}
                />
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-58 right-2 z-50 bg-white border-t border-gray-200 p-2">
                <FooterNote
                    title="Note:"
                    message={`All values are in ${selectedCurrency} | ☁️ Source: Oracle Fusion Cloud`}
                    showRefresh={false}
                />
            </div>

            <InventoryDetailsModal
                open={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                data={inventoryDetailsData}
                onExportExcel={() => handleExport("excel")}
                onExportPdf={() => handleExport("pdf")}
            />
        </div>

    );
}