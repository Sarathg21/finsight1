// import React from "react";
// import { useState, useEffect } from "react";
// import ExportButtons from "../components/Common/ExportButtons";
// import PageHeader from "../components/Common/PageHeader";
// import FooterNote from "../components/FooterNote";
// import Filters from "../components/Filters/Filters";
// import KPICards from "../components/Cards/KPICards";
// import { LuPackage, LuBoxes, LuChartLine, } from "react-icons/lu";
// import { IoCubeOutline, IoTimerOutline, IoWarningOutline, } from "react-icons/io5";
// import { InventoryValueTrend, OverDueSummaryCard, ParentDivisionCard, AgingSummaryCard } from "../components/Charts/Charts";
// import { InventoryTable, InventoryLocationTable } from "../components/Tables/Tables";
// import InventoryDetailedViewTable from "../components/Tables/InventoryDetailedViewTable"
// import InventoryDetailsModal from "../components/InventoryDetailsModal";
// import ChartMenu from "../components/ChartMenu";
// import {
//     getInventoryFilters, getInventorySummary, getInventoryAgingSummary, getInventoryCategoryWise, getInventoryWarehouseWise, getInventoryTrend,
//     getInventoryTopItems, getInventoryDetails, getInventorySubDivisionWise,
//     getInventorySlowMovingItems, getInventoryExport, getInventoryDivisionWise
// } from "../api/inventoryApi"

// export default function InventoryAgingPage() {

//     const [inventorySummary, setInventorySummary] = useState(null);
//     const [inventoryTrendData, setInventoryTrendData] = useState([]);
//     const [inventoryData, setInventoryData] = useState([]);
//     const [inventorySubdivision, setinventorySubdivision] = useState([]);
//     const [inventoryAgingData, setInventoryAgingData] = useState([]);
//     const [slowMovingItemsData, setSlowMovingItemsData] = useState([]);
//     const [inventoryLocationData, setInventoryLocationData] = useState([]);
//     const [inventoryDetailsData, setInventoryDetailsData] = useState([]);
//     const [inventoryAgingTotal, setInventoryAgingTotal] = useState(0);

//     const [filters, setFilters] = useState({});

//     const [filterOptions, setFilterOptions] = useState({
//         legal_groups: [],
//         legal_entities: [],
//         parent_divisions: [],
//         subdivisions: [],
//         currencies: [],
//         as_on_dates: [],
//     });
//     const [exporting, setExporting] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [showDetailsModal, setShowDetailsModal] = useState(false);


//     const handleViewDetails = () => {
//         setShowDetailsModal(true);
//     };

//     // Fetch Filters
//     const fetchFilters = async () => {
//         try {
//             const response = await getInventoryFilters();

//             console.log("Raw Filter API:", response.data);

//             const data = response.data;
//             setFilterOptions({
//                 legal_groups: data.legal_groups || [],
//                 legal_entities: data.legal_entities || [],
//                 parent_divisions: data.parent_divisions || [],
//                 subdivisions: data.subdivisions || [],
//                 currencies: data.currencies || [],
//                 as_on_dates: data.available_dates || [],
//             });

//         } catch (error) {
//             console.error("Filters Error:", error);
//         }
//     };
//     // Fetch KPI Summary
//     const fetchSummary = async () => {
//         try {
//             const response = await getInventorySummary(filters);
//             console.log("Summary:", response.data);
//             setInventorySummary(response.data);

//         } catch (error) {
//             console.error("Summary Error:", error);
//         }
//     };

//     const agingColors = {
//         "0-30 Days": "#16A34A",
//         "31-60 Days": "#F59E0B",
//         "61-90 Days": "#EF4444",
//         "91-120 Days": "#8B5CF6",
//         "121-180 Days": "#0F766E",
//         "181-365 Days": "#2563EB",
//         "366-730 Days": "#94A3B8",
//         "Above 730 Days": "#64748B",
//     };

//     const fetchAgingSummary = async () => {
//         try {
//             const response = await getInventoryAgingSummary(filters);

//             const rawData = response.data; const apiData = Array.isArray(rawData) ? rawData : (rawData?.data || []);

//             const total = apiData.reduce(
//                 (sum, item) => sum + Number(item.value),
//                 0
//             );

//             const formattedData = apiData.map((item) => ({
//                 name: item.bucket,
//                 value: Number(item.value),
//                 percentage: (
//                     (Number(item.value) / total) *
//                     100
//                 ).toFixed(2), // <-- only 2 decimals
//                 color: agingColors[item.bucket] || "#94A3B8",
//             }));

//             setInventoryAgingData(formattedData);
//             setInventoryAgingTotal(total);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     // Fetch Warehouse location Wise
//     const fetchWarehouseWise = async () => {
//         try {
//             const response = await getInventoryWarehouseWise(filters);

//             console.log("Warehouse Wise:", response.data);

//             const arr = Array.isArray(response.data) ? response.data : (response?.data?.data || []);
//             const formattedData = arr.map((item) => ({
//                 location: item.location_name || item.warehouse,
//                 value: Number(item.total_value || 0),
//                 quantity: Number(item.total_quantity || 0),
//                 percentage: Number(item.share_percent || 0),
//             }));

//             setInventoryLocationData(formattedData);

//         } catch (error) {
//             console.error("Warehouse Wise Error:", error);
//         }
//     };

//     // Fetch Parent Division Wise
//     const fetchDivisionWise = async () => {
//         try {

//             const response = await getInventoryDivisionWise(filters);
//             console.log("Division Wise:", response.data);

//             const arr = Array.isArray(response.data) ? response.data : (response?.data?.data || []);
//             const formattedData = arr.map((item, index) => ({
//                 name: item.parent_division,
//                 value: Number(item.total_value),
//                 percentage: Number(item.share_percent),
//                 color: [
//                     "#2563EB",
//                     "#16A34A",
//                     "#F59E0B",
//                     "#EF4444",
//                     "#8B5CF6"
//                 ][index % 5]
//             }));

//             setInventoryData(formattedData);


//         } catch (error) {
//             console.error(
//                 "Division Wise Error:",
//                 error
//             );
//         }
//     };

//     // Fetch Trend
//     const fetchTrend = async () => {
//         try {
//             const response = await getInventoryTrend(filters);
//             console.log("Trend API:", response.data);

//             const arr = Array.isArray(response.data) ? response.data : (response?.data?.data || []);
//             const formattedData = arr.map((item) => ({
//                 month: item.month,
//                 inventoryValue: Number(item.inventory_value)
//             }));
//             setInventoryTrendData(formattedData);
//         } catch (error) {
//             console.error("Trend Error:", error);
//         }
//     };

//     const fetchSubdivisionWise = async () => {
//         try {
//             const response = await getInventorySubDivisionWise(filters);

//             console.log("Subdivision API:", response.data);

//             const rawData = response.data; const apiData = Array.isArray(rawData) ? rawData : (rawData?.data || []);

//             const formattedData = apiData.map((item, index) => ({
//                 name: item.subdivision,
//                 value: Number(item.total_value || item.amount || 0),
//                 percentage: Number(item.share_percent || 0),
//                 color: [
//                     "#2563EB",
//                     "#16A34A",
//                     "#F59E0B",
//                     "#EF4444",
//                     "#8B5CF6"
//                 ][index % 5]
//             }));

//             console.log("Formatted Subdivision:", formattedData);

//             setinventorySubdivision(formattedData);

//         } catch (error) {
//             console.error("Subdivision Error:", error);
//         }
//     };

//     const fetchslowmovingItems = async () => {
//         try {
//             const response = await getInventorySlowMovingItems(filters);

//             const arr = Array.isArray(response.data) ? response.data : (response?.data?.data || []);
//             const formattedData = arr.map((item) => ({
//                 item: item.item_description,
//                 code: item.item_code,
//                 qty: item.total_quantity,
//                 value: item.total_value,
//                 category: item.primary_category,
//             }));

//             setSlowMovingItemsData(formattedData);

//         } catch (error) {
//             console.error("SlowMoving Items Error:", error);
//         }
//     };

//     // Fetch Details
//     const fetchDetails = async () => {
//         try {
//             const response = await getInventoryDetails(filters);
//             const rawData = response?.data; const apiData = Array.isArray(rawData) ? rawData : (rawData?.data || []);
//             const formattedData = apiData.map((item) => ({
//                 legalEntity: item.legal_entity,
//                 subDivision: item.subdivision ?? "-",
//                 warehouse: item.warehouse,
//                 category: item.primary_category,
//                 itemCode: item.item_code,
//                 description: item.item_description,
//                 quantity: Number(item.quantity),
//                 inventoryValue: Number(item.total_cost_value),

//                 days0to30: Number(item.val_0_30),
//                 days31to60: Number(item.val_31_60),
//                 days61to90: Number(item.val_61_90),
//                 days91to120: Number(item.val_91_120),
//                 days121to180: Number(item.val_121_180),
//                 days181to365: Number(item.val_181_365),
//                 days366to730: Number(item.val_366_730),
//                 daysAbove730: Number(item.val_above_730),
//             }));

//             setInventoryDetailsData(formattedData);
//         } catch (error) {
//             console.error(error);
//         }
//     };
//     useEffect(() => {
//         fetchFilters();
//     }, []);


//     useEffect(() => {
//         fetchSummary();
//         fetchAgingSummary();
//         fetchslowmovingItems();
//         fetchWarehouseWise();
//         fetchDivisionWise();
//         fetchTrend();
//         fetchSubdivisionWise();
//         fetchDetails();
//     }, [filters]);

//     const formatAED = (value) => {
//         if (value === null || value === undefined) return "-";

//         if (value >= 1000000) {
//             return `AED ${(value / 1000000).toFixed(2)}M`;
//         }
//         if (value >= 1000) {
//             return `AED ${(value / 1000).toFixed(2)}K`;
//         }
//         return `AED ${value.toFixed(2)}`;
//     };

//     const formatNumber = (value) => {
//         if (value === null || value === undefined) return "-";

//         return new Intl.NumberFormat("en-IN").format(value);
//     };

//     const selectedCurrency =
//         filters.currency || inventorySummary?.currency || "AED";
//     console.log("Selected Currency:", selectedCurrency);

//     {/*------------Inventory kpi crads mockdata------------------*/ }
//     const InventoryKpiData = [
//         {
//             id: 1,
//             title: "Total Inventory Value",
//             value: inventorySummary?.total_inventory_value,
//             formatType: "currency",
//             currency: selectedCurrency,
//             icon: LuPackage,
//             titleColor: "#2563EB",
//             iconColor: "#2563EB",
//             iconBackground: "#DBEAFE",
//             cardBackground: "#EAF4FF",
//             trend: "up",
//             trendValue: "11.28%",
//             comparisonText: "vs 31 Mar 2024",
//             trendColor: "#16A34A",
//             sparklineColor: "#2563EB",
//             sparklineData: [
//                 8, 9, 11, 10, 12,
//                 9, 10, 11, 13, 12,
//                 14, 13, 12, 14, 13,
//                 15, 14, 13, 15, 14,
//                 16, 15
//             ]
//         },

//         {
//             id: 2,
//             title: "Inventory Value >365Days",
//             value: inventorySummary?.total_stock_quantity,
//             formatType: "number",
//             icon: LuBoxes,
//             titleColor: "#16A34A",
//             iconColor: "#16A34A",
//             iconBackground: "#DCFCE7",
//             cardBackground: "#EDFDF2",
//             trend: "up",
//             trendValue: "6.85%",
//             comparisonText: "vs 31 Mar 2024",
//             trendColor: "#16A34A",
//             sparklineColor: "#16A34A",
//             sparklineData: [
//                 7, 8, 9, 8, 10,
//                 9, 8, 10, 12, 9,
//                 10, 11, 9, 10, 11,
//                 10, 9, 11, 10, 12,
//                 11, 10
//             ]
//         },

//         {
//             id: 3,
//             title: "Avg. Inventory Value",
//             value: inventorySummary?.average_inventory_value,
//             formatType: "currency",
//             currency: selectedCurrency,
//             icon: IoCubeOutline,
//             titleColor: "#7C3AED",
//             iconColor: "#7C3AED",
//             iconBackground: "#F3E8FF",
//             cardBackground: "#F3ECFF",
//             trend: "up",
//             trendValue: "4.32%",
//             comparisonText: "vs 31 Mar 2024",
//             trendColor: "#16A34A",
//             sparklineColor: "#7C3AED",
//             sparklineData: [
//                 9, 10, 12, 11, 13,
//                 10, 12, 11, 9, 10,
//                 12, 11, 13, 10, 11,
//                 9, 12, 10, 13, 11,
//                 14, 13
//             ]
//         },

//         {
//             id: 4,
//             title: "Inventory Turnover (TTM)",
//             value: inventorySummary?.inventory_turnover_ttm,
//             formatType: "ratio",
//             icon: LuChartLine,
//             titleColor: "#EA580C",
//             iconColor: "#EA580C",
//             iconBackground: "#FFEDD5",
//             cardBackground: "#FFF2E8",
//             trend: "up",
//             trendValue: "0.38",
//             comparisonText: "vs 31 Mar 2024",
//             trendColor: "#16A34A",
//             sparklineColor: "#EA580C",
//             sparklineData: [
//                 8, 9, 9, 10, 9,
//                 11, 10, 12, 11, 10,
//                 12, 11, 10, 11, 12,
//                 11, 12, 13, 12, 13,
//                 14, 14
//             ]
//         },

//         {
//             id: 5,
//             title: "Stock Holding Days",
//             value: inventorySummary?.stock_holding_days,
//             formatType: "days",
//             icon: IoTimerOutline,
//             titleColor: "#0891B2",
//             iconColor: "#0891B2",
//             iconBackground: "#CFFAFE",
//             cardBackground: "#ECF9FF",
//             trend: "down",
//             trendValue: "4 Days",
//             comparisonText: "vs 31 Mar 2024",
//             trendColor: "#DC2626",
//             sparklineColor: "#0891B2",
//             sparklineData: [
//                 13, 12, 14, 13, 12,
//                 14, 13, 15, 12, 14,
//                 13, 15, 13, 14, 12,
//                 14, 13, 15, 14, 13,
//                 14, 13
//             ]
//         },

//         {
//             id: 6,
//             title: "Obsolete / Slow Moving",
//             value: inventorySummary?.obsolete_slow_moving,
//             formatType: "currency",
//             currency: selectedCurrency,
//             icon: IoWarningOutline,
//             titleColor: "#E11D48",
//             iconColor: "#E11D48",
//             iconBackground: "#FFE4E6",
//             cardBackground: "#FFEFF3",
//             trend: "up",
//             trendValue: "3.72%",
//             comparisonText: "vs 31 Mar 2024",
//             trendColor: "#DC2626",
//             sparklineColor: "#E11D48",
//             sparklineData: [
//                 11, 12, 14, 13, 15,
//                 12, 13, 14, 16, 13,
//                 15, 14, 16, 14, 13,
//                 15, 16, 13, 15, 14,
//                 16, 15
//             ]
//         }
//     ];


//     {/*------------Total calculation Inventory parent division mockdata------------------*/ }
//     const totalInventory = inventoryData.reduce(
//         (sum, item) => sum + item.value,
//         0
//     );


//     const handleFilterApply = (selectedFilters) => {
//         console.log("Applied Filters:", selectedFilters);
//         setFilters(selectedFilters);
//     };

//     const handleFilterReset = () => {
//         const resetFilters = {};
//         setFilters(resetFilters);
//     };

//     const handleExport = async (type) => {
//         try {
//             setExporting(type);

//             const response = await getInventoryExport(
//                 type === "excel" ? "xlsx" : "pdf",
//                 filters
//             );

//             const blob = new Blob([response.data], {
//                 type: response.headers["content-type"],
//             });

//             const url = window.URL.createObjectURL(blob);

//             const link = document.createElement("a");
//             link.href = url;

//             const fileName =
//                 type === "excel"
//                     ? "Inventory_Detailed_Report.xlsx"
//                     : "Inventory_Detailed_Report.pdf";

//             link.setAttribute("download", fileName);

//             document.body.appendChild(link);

//             link.click();

//             link.remove();

//             window.URL.revokeObjectURL(url);

//         } catch (error) {
//             console.error("Inventory Export Error:", error);
//             alert("Download Failed");
//         } finally {
//             setExporting("");
//         }
//     };

//     return (
//         <div className="page-content relative">
//             <PageHeader
//                 title="Inventory Overview"
//                 subtitle="Track inventory position,movement and aging across all dimensions.">
//                 <ExportButtons
//                     endpoint="inventory"
//                     exporting={exporting}
//                     handleExport={handleExport}
//                 />
//             </PageHeader>

//             {/* Main Content */}

//             <div className="flex flex-col gap-2">
//                 {/* ----Filters---- */}
//                 <Filters
//                     filterOptions={filterOptions}
//                     onApply={handleFilterApply}
//                     onReset={handleFilterReset}
//                 />
//                 {/* -----KPI Cards----- */}
//                 <div style={{ marginTop: "-18px" }}>
//                     <KPICards data={InventoryKpiData} />
//                 </div>
//                 <div className="receivables-grid gap-3">
//                     <InventoryValueTrend
//                         title="Inventory Value Trend"
//                         data={inventoryTrendData}
//                         currency={selectedCurrency}
//                     />

//                     <OverDueSummaryCard
//                         title="Inventory Value by Parent Division"
//                         data={inventoryData}
//                         total={totalInventory}
//                         Centerlabel="Total Inventory"
//                         currency={selectedCurrency}
//                     />
//                     <ParentDivisionCard
//                         title="Inventory Value by Subdivision"
//                         data={inventorySubdivision || []}
//                         currency={selectedCurrency}
//                     />
//                 </div>

//                 <div className="inventory-grid">
//                     <AgingSummaryCard
//                         title="Inventory Aging Summary"
//                         data={inventoryAgingData}
//                         legendData={inventoryAgingData}
//                         total={inventoryAgingTotal}
//                         date="31 Mar 2025"
//                         showSummaryHeader
//                         wideLegend
//                         currency={selectedCurrency}
//                     />
//                     <InventoryTable
//                         title="Top 5 High Value Inventory Items"
//                         data={slowMovingItemsData}
//                         currency={selectedCurrency}
//                     />

//                     <InventoryLocationTable
//                         title="Inventory by Location (Top 5)"
//                         data={inventoryLocationData}
//                         currency={selectedCurrency}
//                     />
//                 </div>

//                 <InventoryDetailedViewTable
//                     title="Inventory Detailed View"
//                     data={inventoryDetailsData}
//                     currency={selectedCurrency}
//                     onViewAll={handleViewDetails}
//                     onExportExcel={() => handleExport("excel")}
//                     onExportPdf={() => handleExport("pdf")}
//                 />
//             </div>

//             {/* Footer */}
//             <div className="fixed bottom-0 left-58 right-2 z-50 bg-white border-t border-gray-200 p-2">
//                 <FooterNote
//                     title="Note:"
//                     message={`All values are in ${selectedCurrency} | ☁️ Source: Oracle Fusion Cloud`}
//                     showRefresh={false}
//                 />
//             </div>

//             <InventoryDetailsModal
//                 open={showDetailsModal}
//                 onClose={() => setShowDetailsModal(false)}
//                 data={inventoryDetailsData}
//                 onExportExcel={() => handleExport("excel")}
//                 onExportPdf={() => handleExport("pdf")}
//             />
//         </div>

//     );
// }


import React, { useMemo, useState } from "react";

export default function InventoryOverview() {
  // ============================================================
  // MOCK DATA
  // ============================================================

  const mockData = {
    filters: {
      legalGroups: [
        "FJ Group (Consolidated)",
        "RKME Group",
        "Al Futtaim Group",
      ],
      legalEntities: [
        "All",
        "Alpine Coils LLC",
        "DC Serve LLC",
        "Filter Fan LLC",
        "Alpine Gears LLC",
        "Valves KSA LLC",
      ],
      parentDivisions: [
        "All",
        "Alpine",
        "DC Serve",
        "Filter Fan",
        "Others",
      ],
      subdivisions: [
        "All",
        "Alpine Coils",
        "DC Serve Equip.",
        "Filter Fan - UAE",
        "Alpine Gears",
        "Valves KSA",
        "Others",
      ],
      businessUnits: [
        "All",
        "Coils BU",
        "Service BU",
        "Fans BU",
        "Gears BU",
        "Valves BU",
        "Others",
      ],
      dates: ["30 Apr 2024", "31 Mar 2024", "29 Feb 2024"],
    },

    kpis: [
      {
        title: "Total Inventory Value",
        value: "₹ 472.35 Cr",
        variance: "11.28%",
        varianceLabel: "vs 31 Mar 2024",
        direction: "up",
        icon: "▣",
        iconBg: "#edf5ff",
        iconColor: "#2563eb",
       
      },
      {
        title: "Total Stock Quantity",
        value: "2,36,48,520 Nos",
        variance: "6.85%",
        varianceLabel: "vs 31 Mar 2024",
        direction: "up",
        icon: "▰",
        iconBg: "#edfff4",
        iconColor: "#16a34a",
       
      },
      {
        title: "Avg. Inventory Value",
        value: "₹ 2.78 Cr",
        variance: "4.32%",
        varianceLabel: "vs 31 Mar 2024",
        direction: "up",
        icon: "♙",
        iconBg: "#f5edff",
        iconColor: "#7c3aed",
       
      },
      {
        title: "Inventory Turnover (TTM)",
        value: "5.42 Times",
        variance: "0.38",
        varianceLabel: "vs 31 Mar 2024",
        direction: "up",
        icon: "◔",
        iconBg: "#fff7e8",
        iconColor: "#f59e0b",
       
      },
      {
        title: "Stock Holding Days",
        value: "67 Days",
        variance: "4 Days",
        varianceLabel: "vs 31 Mar 2024",
        direction: "down",
        icon: "%",
        iconBg: "#eafcff",
        iconColor: "#0891b2",
        
      },
      {
        title: "Obsolete / Slow Moving",
        value: "₹ 28.45 Cr",
        variance: "3.72%",
        varianceLabel: "vs 31 Mar 2024",
        direction: "up",
        icon: "!",
        iconBg: "#fff0f4",
        iconColor: "#e11d48",
       
      },
    ],

    trend: {
      labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
      previous: [340, 400, 370, 410, 420, 395],
      current: [250, 330, 280, 325, 350, 455],
    },

    divisions: [
      { name: "Alpine", value: 212.45, percentage: 44.97, color: "#2563eb" },
      { name: "DC Serve", value: 136.8, percentage: 28.94, color: "#16a34a" },
      { name: "Filter Fan", value: 74.3, percentage: 15.73, color: "#f59e0b" },
      { name: "Others", value: 48.8, percentage: 10.36, color: "#7c3aed" },
    ],

    businessUnits: [
      { name: "Coils BU", value: 158.45 },
      { name: "Service BU", value: 102.3 },
      { name: "Fans BU", value: 74.6 },
      { name: "Gears BU", value: 62.4 },
      { name: "Valves BU", value: 48.2 },
      { name: "Others", value: 26.4 },
    ],

    aging: [
      { name: "0 - 30 Days", value: 152.45, percentage: 32.3, color: "#2563eb" },
      { name: "31 - 60 Days", value: 108.6, percentage: 22.98, color: "#16a34a" },
      { name: "61 - 90 Days", value: 86.3, percentage: 18.26, color: "#f59e0b" },
      { name: "91 - 180 Days", value: 72.45, percentage: 15.33, color: "#7c3aed" },
      { name: "> 180 Days", value: 52.55, percentage: 11.13, color: "#ec4899" },
    ],

    slowMoving: [
      {
        no: 1,
        description: 'Industrial Fan 24"',
        code: "IF-24-001",
        qty: "12,450",
        value: "3.85",
        days: "245",
      },
      {
        no: 2,
        description: "Coil CRCA 1.2mm",
        code: "CRCA-12",
        qty: "18,600",
        value: "3.25",
        days: "232",
      },
      {
        no: 3,
        description: "Gear Box Helical 40-1",
        code: "GB-40-1",
        qty: "8,750",
        value: "2.40",
        days: "215",
      },
      {
        no: 4,
        description: "Motor IE3 7.5 kW",
        code: "MTR-75",
        qty: "6,320",
        value: "1.95",
        days: "210",
      },
      {
        no: 5,
        description: 'Valve Gate 4"',
        code: "VG-04",
        qty: "4,850",
        value: "1.75",
        days: "205",
      },
    ],

    locations: [
      {
        name: "Al Ain Warehouse",
        value: 96.45,
        percentage: 20.42,
      },
      {
        name: "Jebel Ali Warehouse",
        value: 85.2,
        percentage: 18.04,
      },
      {
        name: "Riyadh Warehouse",
        value: 72.6,
        percentage: 15.37,
      },
      {
        name: "Dammam Warehouse",
        value: 63.4,
        percentage: 13.42,
      },
      {
        name: "Abu Dhabi Warehouse",
        value: 54.3,
        percentage: 11.5,
      },
    ],

    details: [
      {
        legalEntity: "Alpine Coils LLC",
        parentDivision: "Alpine",
        subdivision: "Alpine Coils",
        businessUnit: "Coils BU",
        qty: "58,45,210",
        total: "212.45",
        d30: "68.20",
        d60: "48.30",
        d90: "38.10",
        d180: "32.45",
        d180plus: "25.40",
        slow: "15.60",
      },
      {
        legalEntity: "DC Serve LLC",
        parentDivision: "DC Serve",
        subdivision: "DC Serve Equip.",
        businessUnit: "Service BU",
        qty: "42,10,850",
        total: "136.80",
        d30: "44.30",
        d60: "31.25",
        d90: "24.70",
        d180: "20.40",
        d180plus: "16.15",
        slow: "9.85",
      },
      {
        legalEntity: "Filter Fan LLC",
        parentDivision: "Alpine",
        subdivision: "Filter Fan - UAE",
        businessUnit: "Fans BU",
        qty: "31,25,460",
        total: "74.30",
        d30: "23.60",
        d60: "16.80",
        d90: "12.90",
        d180: "11.50",
        d180plus: "7.80",
        slow: "4.60",
      },
      {
        legalEntity: "Alpine Gears LLC",
        parentDivision: "Alpine",
        subdivision: "Alpine Gears",
        businessUnit: "Gears BU",
        qty: "27,40,120",
        total: "62.40",
        d30: "18.90",
        d60: "14.20",
        d90: "10.40",
        d180: "8.95",
        d180plus: "6.35",
        slow: "3.20",
      },
      {
        legalEntity: "Valves KSA LLC",
        parentDivision: "DC Serve",
        subdivision: "Valves KSA",
        businessUnit: "Valves BU",
        qty: "19,85,730",
        total: "48.20",
        d30: "15.45",
        d60: "10.30",
        d90: "7.25",
        d180: "6.10",
        d180plus: "4.85",
        slow: "2.45",
      },
      {
        legalEntity: "Others",
        parentDivision: "Others",
        subdivision: "Others",
        businessUnit: "Others",
        qty: "57,41,150",
        total: "28.20",
        d30: "8.00",
        d60: "6.75",
        d90: "4.95",
        d180: "3.45",
        d180plus: "5.05",
        slow: "2.75",
      },
    ],
  };

  // ============================================================
  // FILTER STATE
  // ============================================================

  const [filters, setFilters] = useState({
    legalGroup: "FJ Group (Consolidated)",
    legalEntity: "All",
    parentDivision: "All",
    subdivision: "All",
    businessUnit: "All",
    asOnDate: "30 Apr 2024",
  });

  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      legalGroup: "FJ Group (Consolidated)",
      legalEntity: "All",
      parentDivision: "All",
      subdivision: "All",
      businessUnit: "All",
      asOnDate: "30 Apr 2024",
    });
  };

  // ============================================================
  // SVG MINI LINE
  // ============================================================

  const MiniLine = ({ points, color }) => {
    const width = 170;
    const height = 34;

    const min = Math.min(...points);
    const max = Math.max(...points);

    const path = points
      .map((point, index) => {
        const x = (index / (points.length - 1)) * width;

        const normalized =
          max === min ? 0.5 : (point - min) / (max - min);

        const y = height - normalized * (height - 5);

        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");

    return (
      <svg
        width="100%"
        height="38"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
        />

        {points.map((point, index) => {
          const x = (index / (points.length - 1)) * width;

          const normalized =
            max === min ? 0.5 : (point - min) / (max - min);

          const y = height - normalized * (height - 5);

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.7"
              fill={color}
            />
          );
        })}
      </svg>
    );
  };

  // ============================================================
  // KPI CARD
  // ============================================================

  const KpiCard = ({ item }) => {
    return (
      <div style={styles.kpiCard}>
        <div style={styles.kpiTop}>
          <div
            style={{
              ...styles.kpiIcon,
              background: item.iconBg,
              color: item.iconColor,
            }}
          >
            {item.icon}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={styles.kpiTitle}>{item.title}</div>

            <div style={styles.kpiValue}>{item.value}</div>

            <div style={styles.kpiVariance}>
              <span
                style={{
                  color:
                    item.direction === "down"
                      ? "#dc2626"
                      : "#16a34a",
                  fontWeight: 700,
                }}
              >
                {item.direction === "down" ? "▼" : "▲"}{" "}
                {item.variance}
              </span>

              <span style={{ color: "#64748b" }}>
                {" "}
                {item.varianceLabel}
              </span>
            </div>
          </div>
        </div>

        {/* <div style={{ marginTop: 7 }}>
          <MiniLine points={item.line} color={item.iconColor} />
        </div> */}
      </div>
    );
  };

  // ============================================================
  // LINE CHART
  // ============================================================

  const LineChart = () => {
    const width = 530;
    const height = 185;
    const paddingLeft = 48;
    const paddingRight = 12;
    const paddingTop = 15;
    const paddingBottom = 30;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const allValues = [
      ...mockData.trend.previous,
      ...mockData.trend.current,
    ];

    const maxValue = Math.ceil(Math.max(...allValues) / 100) * 100;
    const minValue = 0;

    const makePoints = (values) => {
      return values
        .map((value, index) => {
          const x =
            paddingLeft +
            (index / (values.length - 1)) * plotWidth;

          const y =
            paddingTop +
            plotHeight -
            ((value - minValue) / (maxValue - minValue)) *
              plotHeight;

          return `${x},${y}`;
        })
        .join(" ");
    };

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        {[0, 100, 200, 300, 400, 500, 600].map((value) => {
          const y =
            paddingTop +
            plotHeight -
            (value / maxValue) * plotHeight;

          return (
            <g key={value}>
              <line
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={y}
                y2={y}
                stroke="#e8edf4"
                strokeWidth="1"
              />

              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
              >
                {value}
              </text>
            </g>
          );
        })}

        <polyline
          points={makePoints(mockData.trend.previous)}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
        />

        <polyline
          points={makePoints(mockData.trend.current)}
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
        />

        {mockData.trend.previous.map((value, index) => {
          const x =
            paddingLeft +
            (index / (mockData.trend.previous.length - 1)) *
              plotWidth;

          const y =
            paddingTop +
            plotHeight -
            (value / maxValue) * plotHeight;

          return (
            <circle
              key={`p-${index}`}
              cx={x}
              cy={y}
              r="3"
              fill="#2563eb"
            />
          );
        })}

        {mockData.trend.current.map((value, index) => {
          const x =
            paddingLeft +
            (index / (mockData.trend.current.length - 1)) *
              plotWidth;

          const y =
            paddingTop +
            plotHeight -
            (value / maxValue) * plotHeight;

          return (
            <circle
              key={`c-${index}`}
              cx={x}
              cy={y}
              r="3"
              fill="#16a34a"
            />
          );
        })}

        {mockData.trend.labels.map((label, index) => {
          const x =
            paddingLeft +
            (index / (mockData.trend.labels.length - 1)) *
              plotWidth;

          return (
            <text
              key={label}
              x={x}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#475569"
            >
              {label}
            </text>
          );
        })}
      </svg>
    );
  };

  // ============================================================
  // DONUT CHART
  // ============================================================

  const DonutChart = ({
    data,
    total,
    centerText,
    centerSubText,
  }) => {
    const radius = 58;
    const circumference = 2 * Math.PI * radius;

    let offset = 0;

    return (
      <div style={styles.donutWrapper}>
        <svg
          width="145"
          height="145"
          viewBox="0 0 145 145"
        >
          <g transform="rotate(-90 72.5 72.5)">
            <circle
              cx="72.5"
              cy="72.5"
              r={radius}
              fill="none"
              stroke="#edf1f6"
              strokeWidth="26"
            />

            {data.map((item) => {
              const dash =
                (item.percentage / 100) * circumference;

              const currentOffset = offset;

              offset += dash;

              return (
                <circle
                  key={item.name}
                  cx="72.5"
                  cy="72.5"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="26"
                  strokeDasharray={`${dash} ${
                    circumference - dash
                  }`}
                  strokeDashoffset={-currentOffset}
                />
              );
            })}
          </g>

          <text
            x="72.5"
            y="68"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#334155"
          >
            {centerText}
          </text>

          {centerSubText && (
            <text
              x="72.5"
              y="84"
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {centerSubText}
            </text>
          )}
        </svg>
      </div>
    );
  };

  // ============================================================
  // BAR CHART
  // ============================================================

  const BusinessUnitChart = () => {
    const max = Math.max(
      ...mockData.businessUnits.map((x) => x.value)
    );

    return (
      <div style={{ width: "100%", paddingTop: 2 }}>
        {mockData.businessUnits.map((item) => (
          <div
            key={item.name}
            style={{
              display: "grid",
              gridTemplateColumns: "85px 1fr 48px",
              alignItems: "center",
              gap: 7,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#475569",
                textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </div>

            <div
              style={{
                height: 13,
                background: "#f1f5f9",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(item.value / max) * 100}%`,
                  background: "#2563eb",
                  borderRadius: 2,
                }}
              />
            </div>

            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#475569",
              }}
            >
              {item.value.toFixed(2)}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 2,
            marginLeft: 93,
            borderTop: "1px solid #e5eaf1",
            paddingTop: 3,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 9,
            color: "#64748b",
          }}
        >
          <span>0</span>
          <span>40</span>
          <span>80</span>
          <span>120</span>
          <span>160</span>
          <span>200</span>
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: 9,
            color: "#64748b",
            marginTop: 2,
          }}
        >
          ₹ Cr
        </div>
      </div>
    );
  };

  // ============================================================
  // SECTION HEADER
  // ============================================================

  const SectionHeader = ({ children }) => (
    <div style={styles.sectionHeader}>{children}</div>
  );

  // ============================================================
  // FILTER FIELD
  // ============================================================

  const FilterField = ({
    label,
    value,
    options,
    onChange,
    date = false,
  }) => {
    return (
      <div style={styles.filterField}>
        <label style={styles.filterLabel}>{label}</label>

        <div style={styles.selectWrapper}>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={styles.select}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          {!date && (
            <span style={styles.selectArrow}>⌄</span>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // DERIVED TOTAL
  // ============================================================

  const locationTotal = useMemo(() => {
    return mockData.locations.reduce(
      (sum, item) => sum + item.value,
      0
    );
  }, []);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={styles.page}>
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Inventory Overview</h1>

          <div style={styles.subtitle}>
            Track inventory position, movement and aging across
            all dimensions
          </div>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.primaryButton}>
            Export
            <span style={{ marginLeft: 8 }}>⌄</span>
          </button>

          <button style={styles.secondaryButton}>
            <span style={styles.buttonIcon}>▣</span>
            Schedule
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <span style={styles.buttonIcon}>⚱</span>
            More Filters
            <span style={{ marginLeft: 8 }}>⌄</span>
          </button>

          <button
            style={styles.refreshButton}
            onClick={() => window.location.reload()}
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      {/* ========================================================
          FILTERS
      ======================================================== */}

      <div
        style={{
          ...styles.filterPanel,
          ...(showFilters ? styles.filterPanelExpanded : {}),
        }}
      >
        <FilterField
          label="Legal Group"
          value={filters.legalGroup}
          options={mockData.filters.legalGroups}
          onChange={(value) =>
            updateFilter("legalGroup", value)
          }
        />

        <FilterField
          label="Legal Entity"
          value={filters.legalEntity}
          options={mockData.filters.legalEntities}
          onChange={(value) =>
            updateFilter("legalEntity", value)
          }
        />

        <FilterField
          label="Parent Division"
          value={filters.parentDivision}
          options={mockData.filters.parentDivisions}
          onChange={(value) =>
            updateFilter("parentDivision", value)
          }
        />

        <FilterField
          label="Sub-Division"
          value={filters.subdivision}
          options={mockData.filters.subdivisions}
          onChange={(value) =>
            updateFilter("subdivision", value)
          }
        />

        <FilterField
          label="Business Unit"
          value={filters.businessUnit}
          options={mockData.filters.businessUnits}
          onChange={(value) =>
            updateFilter("businessUnit", value)
          }
        />

        <FilterField
          label="As On Date"
          value={filters.asOnDate}
          options={mockData.filters.dates}
          onChange={(value) =>
            updateFilter("asOnDate", value)
          }
          date
        />

        <button style={styles.applyButton}>Apply</button>

        <button
          style={styles.resetButton}
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* ========================================================
          KPI CARDS
      ======================================================== */}

      <div style={styles.kpiGrid}>
        {mockData.kpis.map((item) => (
          <KpiCard key={item.title} item={item} />
        ))}
      </div>

      {/* ========================================================
          FIRST CHART ROW
      ======================================================== */}

      <div style={styles.chartGrid}>
        {/* Inventory Trend */}
        <div style={styles.panel}>
          <SectionHeader>
            Inventory Value Trend (₹ Cr)
          </SectionHeader>

          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <span
                style={{
                  ...styles.legendDot,
                  background: "#2563eb",
                }}
              />
              FY 23-24
            </div>

            <div style={styles.legendItem}>
              <span
                style={{
                  ...styles.legendDot,
                  background: "#16a34a",
                }}
              />
              FY 24-25
            </div>
          </div>

          <div style={styles.lineChartContainer}>
            <LineChart />
          </div>
        </div>

        {/* Parent Division */}
        <div style={styles.panel}>
          <SectionHeader>
            Inventory Value by Parent Division (₹ Cr)
          </SectionHeader>

          <div style={styles.donutRow}>
            <DonutChart
              data={mockData.divisions}
              total="472.35"
              centerText="₹ 472.35"
              centerSubText="Cr"
            />

            <div style={styles.legendList}>
              {mockData.divisions.map((item) => (
                <div
                  key={item.name}
                  style={styles.legendListRow}
                >
                  <div style={styles.legendName}>
                    <span
                      style={{
                        ...styles.legendCircle,
                        background: item.color,
                      }}
                    />
                    {item.name}
                  </div>

                  <div style={styles.legendValue}>
                    {item.value.toFixed(2)} (
                    {item.percentage.toFixed(2)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Business Unit */}
        <div style={styles.panel}>
          <SectionHeader>
            Inventory Value by Business Unit (₹ Cr)
          </SectionHeader>

          <BusinessUnitChart />
        </div>
      </div>

      {/* ========================================================
          SECOND ROW
      ======================================================== */}

      <div style={styles.bottomGrid}>
        {/* AGING */}
        <div style={styles.panel}>
          <SectionHeader>
            Inventory Aging Summary (₹ Cr)
          </SectionHeader>

          <div style={styles.agingContent}>
            <DonutChart
              data={mockData.aging}
              total="472.35"
              centerText="₹ 472.35 Cr"
            />

            <div style={styles.agingTable}>
              <div style={styles.agingHeader}>
                <span />
                <span>Amount (₹ Cr)</span>
                <span>% of Total</span>
              </div>

              {mockData.aging.map((item) => (
                <div
                  key={item.name}
                  style={styles.agingRow}
                >
                  <div style={styles.agingName}>
                    <span
                      style={{
                        ...styles.legendCircle,
                        background: item.color,
                      }}
                    />
                    {item.name}
                  </div>

                  <div>{item.value.toFixed(2)}</div>

                  <div>{item.percentage.toFixed(2)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLOW MOVING */}
        <div style={styles.panel}>
          <SectionHeader>
            Slow Moving Items (Top 5)
          </SectionHeader>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Description</th>
                  <th>Item Code</th>
                  <th>Qty (Nos)</th>
                  <th>Value (₹ Cr)</th>
                  <th>Days</th>
                </tr>
              </thead>

              <tbody>
                {mockData.slowMoving.map((row) => (
                  <tr key={row.no}>
                    <td>{row.no}</td>
                    <td>{row.description}</td>
                    <td>{row.code}</td>
                    <td>{row.qty}</td>
                    <td>{row.value}</td>
                    <td>{row.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LOCATION */}
        <div style={styles.panel}>
          <SectionHeader>
            Inventory by Location (Top 5) (₹ Cr)
          </SectionHeader>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Value (₹ Cr)</th>
                  <th>% of Total</th>
                </tr>
              </thead>

              <tbody>
                {mockData.locations.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.value.toFixed(2)}</td>
                    <td>{row.percentage.toFixed(2)}%</td>
                  </tr>
                ))}

                <tr style={styles.totalRow}>
                  <td>Total</td>
                  <td>{locationTotal.toFixed(2)}</td>
                  <td>78.75%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================
          DETAILED VIEW
      ======================================================== */}

      <div style={styles.detailPanel}>
        <SectionHeader>Inventory Detailed View</SectionHeader>

        <div style={styles.detailTableWrapper}>
          <table style={styles.detailTable}>
            <thead>
              <tr>
                <th>Legal Entity</th>
                <th>Parent Division</th>
                <th>Sub-Division</th>
                <th>Business Unit</th>
                <th>Total Qty (Nos)</th>
                <th>Inventory Value (₹ Cr)</th>
                <th>0 - 30 Days (₹ Cr)</th>
                <th>31 - 60 Days (₹ Cr)</th>
                <th>61 - 90 Days (₹ Cr)</th>
                <th>91 - 180 Days (₹ Cr)</th>
                <th>&gt; 180 Days (₹ Cr)</th>
                <th>Slow Moving (₹ Cr)</th>
              </tr>
            </thead>

            <tbody>
              {mockData.details.map((row) => (
                <tr key={row.legalEntity}>
                  <td>{row.legalEntity}</td>
                  <td>{row.parentDivision}</td>
                  <td>{row.subdivision}</td>
                  <td>{row.businessUnit}</td>
                  <td>{row.qty}</td>
                  <td>{row.total}</td>
                  <td>{row.d30}</td>
                  <td>{row.d60}</td>
                  <td>{row.d90}</td>
                  <td>{row.d180}</td>
                  <td>{row.d180plus}</td>
                  <td>{row.slow}</td>
                </tr>
              ))}

              <tr style={styles.detailTotalRow}>
                <td>Total</td>
                <td />
                <td />
                <td />
                <td>2,36,48,520</td>
                <td>562.35</td>
                <td>127.50</td>
                <td>127.60</td>
                <td>98.30</td>
                <td>62.85</td>
                <td>65.60</td>
                <td>38.45</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <div style={styles.footer}>
        <div>
          All values are in INR (₹ Cr) &nbsp; | &nbsp; Data as
          on 30 Apr 2024
        </div>

        <div style={styles.source}>
          <span style={{ fontSize: 16 }}>☁</span>
          Source: Oracle Fusion Cloud
        </div>
      </div>
    </div>
  );
}

// ================================================================
// INLINE CSS
// ================================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "14px 18px 18px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#172033",
    fontSize: 12,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 12,
  },

  pageTitle: {
    margin: 0,
    fontSize: 22,
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#14245c",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 11,
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 9,
  },

  primaryButton: {
    height: 32,
    border: "none",
    borderRadius: 5,
    padding: "0 14px",
    background: "#4f24d8",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(79,36,216,.15)",
  },

  secondaryButton: {
    height: 32,
    border: "1px solid #d7dce5",
    borderRadius: 5,
    padding: "0 12px",
    background: "#fff",
    color: "#334155",
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
  },

  buttonIcon: {
    marginRight: 7,
    color: "#4f24d8",
  },

  refreshButton: {
    width: 34,
    height: 32,
    border: "1px solid #d7dce5",
    borderRadius: 5,
    background: "#fff",
    color: "#334155",
    fontSize: 18,
    cursor: "pointer",
  },

  filterPanel: {
    background: "#fff",
    border: "1px solid #e3e8ef",
    borderRadius: 7,
    padding: "10px 12px",
    display: "grid",
    gridTemplateColumns:
      "1.15fr 1fr 1fr 1fr 1fr 1fr auto auto",
    alignItems: "end",
    gap: 12,
    boxShadow: "0 1px 3px rgba(15,23,42,.025)",
    marginBottom: 10,
  },

  filterPanelExpanded: {
    boxShadow: "0 3px 12px rgba(15,23,42,.07)",
  },

  filterField: {
    minWidth: 0,
  },

  filterLabel: {
    display: "block",
    fontSize: 9,
    color: "#475569",
    marginBottom: 4,
    fontWeight: 600,
  },

  selectWrapper: {
    position: "relative",
  },

  select: {
    width: "100%",
    height: 30,
    border: "1px solid #dfe4ec",
    borderRadius: 5,
    padding: "0 26px 0 9px",
    fontSize: 10.5,
    color: "#334155",
    background: "#fff",
    outline: "none",
    appearance: "none",
    cursor: "pointer",
  },

  selectArrow: {
    position: "absolute",
    right: 9,
    top: "50%",
    transform: "translateY(-55%)",
    color: "#475569",
    pointerEvents: "none",
    fontSize: 13,
  },

  applyButton: {
    height: 30,
    padding: "0 18px",
    border: "none",
    borderRadius: 5,
    background: "#4f24d8",
    color: "#fff",
    fontSize: 10.5,
    fontWeight: 700,
    cursor: "pointer",
  },

  resetButton: {
    height: 30,
    padding: "0 7px",
    border: "none",
    background: "transparent",
    color: "#334155",
    fontSize: 10.5,
    cursor: "pointer",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: 10,
    marginBottom: 10,
  },

  kpiCard: {
    minWidth: 0,
    minHeight: 105,
    background: "#fff",
    border: "1px solid #e4e9f0",
    borderRadius: 8,
    padding: "10px 11px 7px",
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(15,23,42,.025)",
  },

  kpiTop: {
    display: "flex",
    gap: 9,
    alignItems: "flex-start",
  },

  kpiIcon: {
    flex: "0 0 31px",
    width: 31,
    height: 31,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 17,
    fontWeight: 800,
  },

  kpiTitle: {
    color: "#64748b",
    fontSize: 9,
    lineHeight: 1.2,
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  kpiValue: {
    color: "#172033",
    fontSize: 14,
    lineHeight: 1.45,
    fontWeight: 800,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  kpiVariance: {
    fontSize: 8.5,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginBottom: 10,
  },

  panel: {
    background: "#fff",
    border: "1px solid #e3e8ef",
    borderRadius: 7,
    padding: "9px 11px",
    minWidth: 0,
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(15,23,42,.02)",
  },

  sectionHeader: {
    color: "#12275e",
    fontSize: 11,
    fontWeight: 800,
    marginBottom: 7,
  },

  legend: {
    display: "flex",
    justifyContent: "center",
    gap: 18,
    marginBottom: 1,
    fontSize: 9,
    color: "#475569",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },

  legendDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
  },

  lineChartContainer: {
    width: "100%",
    height: 165,
  },

  donutRow: {
    minHeight: 176,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 5,
  },

  donutWrapper: {
    width: 145,
    height: 145,
    flex: "0 0 145px",
  },

  legendList: {
    flex: 1,
    minWidth: 0,
  },

  legendListRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 7,
    marginBottom: 12,
    fontSize: 10,
  },

  legendName: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    color: "#334155",
    whiteSpace: "nowrap",
  },

  legendCircle: {
    width: 9,
    height: 9,
    minWidth: 9,
    borderRadius: "50%",
    display: "inline-block",
  },

  legendValue: {
    color: "#475569",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1.02fr 1.18fr 1.12fr",
    gap: 10,
    marginBottom: 10,
  },

  agingContent: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    minHeight: 157,
  },

  agingTable: {
    flex: 1,
    minWidth: 0,
    fontSize: 9.5,
  },

  agingHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 75px 62px",
    gap: 5,
    color: "#64748b",
    fontWeight: 700,
    fontSize: 8,
    paddingBottom: 5,
    borderBottom: "1px solid #e5eaf1",
  },

  agingRow: {
    display: "grid",
    gridTemplateColumns: "1fr 75px 62px",
    gap: 5,
    alignItems: "center",
    minHeight: 21,
    borderBottom: "1px solid #f0f3f7",
    color: "#475569",
  },

  agingName: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 8.5,
    color: "#334155",
  },

  tableHeader: {},

  tableCell: {},

  totalRow: {
    fontWeight: 800,
    background: "#f4f7fc",
  },

  detailPanel: {
    background: "#fff",
    border: "1px solid #e3e8ef",
    borderRadius: 7,
    padding: "9px 11px 10px",
    boxShadow: "0 1px 3px rgba(15,23,42,.02)",
    overflow: "hidden",
  },

  detailTableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  detailTable: {
    width: "100%",
    minWidth: 1100,
    borderCollapse: "collapse",
    fontSize: 8.5,
    color: "#334155",
  },

  detailTotalRow: {
    background: "#eef4ff",
    color: "#12275e",
    fontWeight: 800,
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 2px 0",
    color: "#475569",
    fontSize: 9,
  },

  source: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#64748b",
  },
};

// ================================================================
// TABLE CSS USING A SMALL GLOBAL STYLE INJECTION
// This keeps everything in this single component file.
// ================================================================

if (
  typeof document !== "undefined" &&
  !document.getElementById("inventory-overview-table-css")
) {
  const style = document.createElement("style");

  style.id = "inventory-overview-table-css";

  style.innerHTML = `
    table th {
      background: #f3f6fb;
      color: #1e3a70;
      font-weight: 700;
      white-space: nowrap;
      text-align: left;
      padding: 6px 6px;
      border-bottom: 1px solid #e0e6ef;
    }

    table td {
      padding: 5px 6px;
      border-bottom: 1px solid #edf1f5;
      white-space: nowrap;
    }

    table tbody tr:hover {
      background: #f8fbff;
    }

    select:focus {
      border-color: #8064e9 !important;
      box-shadow: 0 0 0 2px rgba(79, 36, 216, .08);
    }

    button {
      font-family: inherit;
    }

    @media (max-width: 1200px) {
      .inventory-page {
        overflow-x: auto;
      }
    }
  `;

  document.head.appendChild(style);
}

