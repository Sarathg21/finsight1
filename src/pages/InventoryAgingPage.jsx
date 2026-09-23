console.log('[INVENTORY MODULE] InventoryAgingDashboard.jsx loaded at', new Date().toISOString());
import React, { useState, useEffect } from "react";
import { Package, TrendingUp, Clock, AlertTriangle, Cuboid, Download } from "lucide-react";
import { InventoryValueTrend, OverDueSummaryCard, ParentDivisionCard, AgingSummaryCard, InventoryTurnoverTrend } from "../components/Charts/InventoryCharts";
import InventoryDetailedViewTable from "../components/Tables/InventoryDetailedViewTable";
import InventoryDetailsModal from "../components/InventoryDetailsModal";
import { getInventoryFilters, getInventoryDashboard, getInventoryExport, getInventoryDetails } from "../api/inventoryApi";

/* ─────────────────────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────────────────────── */
function fmtAED(v, currency = "AED") {
    if (v === null || v === undefined) return "–";
    const n = Number(v);
    if (isNaN(n)) return "–";
    if (n >= 1_000_000_000) return `${currency} ${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 10_000_000) return `${currency} ${(n / 10_000_000).toFixed(2)} Cr`;
    if (n >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${currency} ${(n / 1_000).toFixed(2)}K`;
    return `${currency} ${n.toFixed(2)}`;
}


/* ─────────────────────────────────────────────────────────────
   KPI card — matches the sample pastel card with icon, value,
   trend badge, sparkline
───────────────────────────────────────────────────────────── */
function InventoryKPICard({ title, value, change, up, icon: Icon, iconColor, iconBg }) {
    const isPositive = up;
    return (
        <div
            style={{
                background: "#F8FAFC",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                borderRadius: "12px",
                padding: "14px 16px",
                minHeight: "105px",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
                cursor: "default",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.06)";
                e.currentTarget.style.filter = "brightness(0.99)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(15, 23, 42, 0.04)";
                e.currentTarget.style.filter = "brightness(1)";
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                    width: "36px", height: "36px", borderRadius: "50%", background: iconBg || "#F1F5F9", color: iconColor,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(15, 23, 42, 0.06)"
                }}>
                    <Icon size={18} color={iconColor} />
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: iconColor, lineHeight: 1.2 }}>{title}</div>
            </div>
            <div style={{ marginLeft: "46px", marginTop: "-2px", fontSize: "18px", fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>
                {value ?? "—"}
            </div>
            {change ? (
                <div style={{ marginLeft: "46px", marginTop: "1px", fontSize: "10px", color: "#64748b", fontWeight: 500, lineHeight: 1.2 }}>
                    Previous: 31 Mar 2024
                </div>
            ) : null}
            <div style={{ marginLeft: "46px", fontSize: "11px", color: isPositive ? "#0e9f75" : "#ef476f", fontWeight: 600, lineHeight: 1.2 }}>
                {change ? `${isPositive ? '▲' : '▼'} ${change}` : "—"}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Slow Moving / Top Items table — matches the sample format:
   #, Item Description, Item Code, Qty (Nos), Value (₹ Cr), Days
───────────────────────────────────────────────────────────── */
function SlowMovingTable({ data = [], currency = "AED", onViewAll, onExport }) {
    return (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8EDF5', display: 'flex', flexDirection: 'column', height: 320, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px 8px', borderBottom: '1px solid #EEF2F7', flexShrink: 0,
            }}>
                <span style={{ fontSize: '0.79rem', fontWeight: 700, color: '#081B46' }}>Slow Moving Stock (Top 5)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {onViewAll && <button onClick={onViewAll} style={{ fontSize: '0.69rem', fontWeight: 600, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>}
                </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                        <tr style={{ background: '#F8FAFD', position: 'sticky', top: 0, zIndex: 5 }}>
                            {['#', 'Item Description', 'Item Code', 'Qty (Nos)', 'Value (AED)', 'Days'].map((h, i) => (
                                <th key={i} style={{ padding: '8px 8px', textAlign: i === 0 ? 'center' : i >= 3 ? 'right' : 'left', color: '#1E3A8A', fontWeight: 700, borderBottom: '1px solid #E8EDF5', whiteSpace: 'nowrap', fontSize: 11 }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length ? data.map((item, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#FBFCFE', borderBottom: '1px solid #EEF2F7' }}>
                                <td style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>{i + 1}</td>
                                <td style={{ padding: '8px', color: '#0F172A', fontWeight: 500, whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.item_description || '–'}
                                </td>
                                <td style={{ padding: '8px', color: '#2563EB', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.item_code || '–'}</td>
                                <td style={{ padding: '8px', textAlign: 'right', color: '#0F172A', fontWeight: 500 }}>{Number(item.quantity || 0).toLocaleString()}</td>
                                <td style={{ padding: '8px', textAlign: 'right', color: '#0F172A', fontWeight: 600 }}>{fmtAED(item.inventory_value, '')}</td>
                                <td style={{ padding: '8px', textAlign: 'right', color: '#E11D48', fontWeight: 700 }}>{item.days ?? '–'}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>No records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Main Dashboard Component
───────────────────────────────────────────────────────────── */
export default function InventoryAgingDashboard() {
    const [inventorySummary, setInventorySummary] = useState(null);
    const [inventoryTrendData, setInventoryTrendData] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [inventorySubdivision, setInventorySubdivision] = useState([]);
    const [inventoryAgingData, setInventoryAgingData] = useState([]);
    const [slowMovingItemsData, setSlowMovingItemsData] = useState([]);
    const [detailedViewData, setDetailedViewData] = useState([]);
    const [inventoryAgingTotal, setInventoryAgingTotal] = useState(0);
    const [filters, setFilters] = useState({});
    const [filterOptions, setFilterOptions] = useState({
        legal_groups: [], legal_entities: [], parent_divisions: [],
        subdivisions: [], currencies: [], as_on_dates: [],
    });
    const [exporting, setExporting] = useState("");
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [drilldownFilters, setDrilldownFilters] = useState({});

    const handleViewDetails = (drilldowns = {}) => {
        setDrilldownFilters(drilldowns || {});
        setShowDetailsModal(true);
    };

    const fetchFilters = async () => {
        try {
            const response = await getInventoryFilters();
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

    const fetchDashboard = async () => {
        try {
            const response = await getInventoryDashboard(filters);
            const data = response.data;

            if (data.kpis) {
                setInventorySummary({
                    total_inventory_value: data.kpis.total_inventory,
                    average_inventory_value: data.kpis.average_inventory || data.kpis.average_inventory_value || null,
                    inventory_turnover_ttm: data.kpis.inventory_turnover_ttm || data.kpis.inventory_turnover || null,
                    stock_holding_days: data.kpis.stock_holding_days || data.kpis.dio || null,
                    obsolete_slow_moving: data.kpis.inventory_above_365,
                });
            }

            if (data.aging_summary) {
                const agingColors = {
                    "0_30": "#16A34A", "31_60": "#F59E0B", "61_90": "#EF4444",
                    "91_120": "#8B5CF6", "121_180": "#0F766E", "181_365": "#2563EB",
                    "366_730": "#94A3B8", "ABOVE_730": "#64748B",
                };
                const labels = {
                    "0_30": "0 - 30 Days", "31_60": "31 - 60 Days", "61_90": "61 - 90 Days",
                    "91_120": "91 - 120 Days", "121_180": "121 - 180 Days", "181_365": "181 - 365 Days",
                    "366_730": "366 - 730 Days", "ABOVE_730": "Above 730 Days",
                };
                let totalAging = 0;
                const formattedAging = data.aging_summary.map(item => {
                    totalAging += Number(item.amount);
                    return {
                        name: labels[item.bucket_code] || (typeof item.bucket_name === 'object' ? (item.bucket_name?.name || item.bucket_name?.code) : item.bucket_name),
                        value: Number(item.amount),
                        id: item.bucket_code,
                        percentage: Number(item.percentage_of_total),
                        color: agingColors[item.bucket_code] || "#94A3B8"
                    };
                });
                setInventoryAgingData(formattedAging);
                setInventoryAgingTotal(totalAging);
            }

            if (data.by_parent_division) {
                let mappedData = data.by_parent_division.map(item => ({
                    name: typeof item.label === 'object' ? (item.label?.name || item.label?.code || item.label?.id) : item.label,
                    value: Number(item.inventory_value),
                    id: item.value,
                    percentage: Number(item.percentage_of_total),
                }));
                mappedData.sort((a, b) => b.value - a.value);
                const formattedParentDiv = mappedData.slice(0, 5).map((item, index) => ({
                    ...item,
                    color: ["#2563EB", "#16A34A", "#F59E0B", "#EF4444", "#8B5CF6"][index] || "#94A3B8"
                }));
                setInventoryData(formattedParentDiv);
            }

            if (data.by_subdivision) {
                let mappedSubDiv = data.by_subdivision.map(item => ({
                    name: typeof item.subdivision_name === 'object' ? (item.subdivision_name?.name || item.subdivision_name?.code) : item.subdivision_name,
                    value: Number(item.inventory_value),
                    id: item.subdivision_id
                }));
                mappedSubDiv.sort((a, b) => b.value - a.value);
                setInventorySubdivision(mappedSubDiv.slice(0, 5));
            }

            if (data.trend) {
                const formattedTrend = data.trend.map(item => ({
                    month: typeof item.month_start === 'object' ? item.month_start?.name : (item.month_start ? String(item.month_start).substring(0, 7) : ''),
                    inventoryValue: Number(item.inventory_value),
                    turnover: (item.inventory_turnover != null ? Number(item.inventory_turnover) : (item.turnover != null ? Number(item.turnover) : null)),
                    dio: (item.dio != null ? Number(item.dio) : (item.stock_holding_days != null ? Number(item.stock_holding_days) : null))
                }));
                setInventoryTrendData(formattedTrend);
                const inventoryValues = formattedTrend.map(i => i.inventoryValue).filter(v => v > 0);
                const latestTrend = formattedTrend[formattedTrend.length - 1] || {};
                setInventorySummary(prev => ({
                    ...prev,
                    average_inventory_value: prev?.average_inventory_value,
                    inventory_turnover_ttm: prev?.inventory_turnover_ttm || latestTrend.turnover || null,
                    stock_holding_days: prev?.stock_holding_days || latestTrend.dio || null,
                }));
            }

            if (data.top_items) {
                const formattedTopItems = data.top_items.map(item => ({
                    id: item.subdivision_id || item.item_code,
                    item_code: typeof item.item_code === 'object' ? (item.item_code?.name || item.item_code?.code) : item.item_code,
                    item_description: typeof item.item_description === 'object' ? item.item_description?.name : item.item_description,
                    inventory_value: Number(item.inventory_value || 0),
                    quantity: Number(item.quantity || 0),
                    days: item.days_in_inventory || item.aging_days || null,
                    category: typeof item.primary_category === 'object' ? (item.primary_category?.name || item.primary_category?.code) : item.primary_category,
                    uom: typeof item.uom === 'object' ? (item.uom?.name || item.uom?.code) : item.uom,
                }));
                setSlowMovingItemsData(formattedTopItems);
            }
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
        }

        try {
            const detailsResponse = await getInventoryDetails({ ...filters, limit: 10 });
            if (detailsResponse.data?.results) {
                const formattedDetails = detailsResponse.data.results.map(item => ({
                    legalEntity: typeof item.legal_entity === 'object' ? item.legal_entity?.name : item.legal_entity,
                    subDivision: typeof item.subdivision === 'object' ? item.subdivision?.name : item.subdivision,
                    warehouse: typeof item.subinventory === 'object' ? item.subinventory?.name : item.subinventory,
                    category: typeof item.primary_category === 'object' ? item.primary_category?.name : item.primary_category,
                    itemCode: typeof item.item_code === 'object' ? item.item_code?.name : item.item_code,
                    description: typeof item.item_description === 'object' ? item.item_description?.name : item.item_description,
                    quantity: Number(item.quantity || 0),
                    inventoryValue: Number(item.inventory_value || 0),
                    days0to30: Number(item.bucket_0_30 || item['0_30_days'] || 0),
                    days31to60: Number(item.bucket_31_60 || item['31_60_days'] || 0),
                    days61to90: Number(item.bucket_61_90 || item['61_90_days'] || 0),
                    days91to120: Number(item.bucket_91_120 || item['91_120_days'] || 0),
                    days121to180: Number(item.bucket_121_180 || item['121_180_days'] || 0),
                    days181to365: Number(item.bucket_181_365 || item['181_365_days'] || 0),
                    days366to730: Number(item.bucket_366_730 || item['366_730_days'] || 0),
                    daysAbove730: Number(item.bucket_above_730 || item['above_730_days'] || 0)
                }));
                setDetailedViewData(formattedDetails);
            } else if (Array.isArray(detailsResponse.data)) {
                 const formattedDetails = detailsResponse.data.slice(0, 10).map(item => ({
                    legalEntity: typeof item.legal_entity === 'object' ? item.legal_entity?.name : item.legal_entity,
                    subDivision: typeof item.subdivision === 'object' ? item.subdivision?.name : item.subdivision,
                    warehouse: typeof item.subinventory === 'object' ? item.subinventory?.name : item.subinventory,
                    category: typeof item.primary_category === 'object' ? item.primary_category?.name : item.primary_category,
                    itemCode: typeof item.item_code === 'object' ? item.item_code?.name : item.item_code,
                    description: typeof item.item_description === 'object' ? item.item_description?.name : item.item_description,
                    quantity: Number(item.quantity || 0),
                    inventoryValue: Number(item.inventory_value || 0),
                    days0to30: Number(item.bucket_0_30 || item['0_30_days'] || 0),
                    days31to60: Number(item.bucket_31_60 || item['31_60_days'] || 0),
                    days61to90: Number(item.bucket_61_90 || item['61_90_days'] || 0),
                    days91to120: Number(item.bucket_91_120 || item['91_120_days'] || 0),
                    days121to180: Number(item.bucket_121_180 || item['121_180_days'] || 0),
                    days181to365: Number(item.bucket_181_365 || item['181_365_days'] || 0),
                    days366to730: Number(item.bucket_366_730 || item['366_730_days'] || 0),
                    daysAbove730: Number(item.bucket_above_730 || item['above_730_days'] || 0)
                }));
                setDetailedViewData(formattedDetails);
            }
        } catch (error) {
            console.error("Detailed View Fetch Error:", error);
        }
    };

    useEffect(() => { fetchFilters(); }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchDashboard(); }, [filters]);

    const selectedCurrency = filters.currency || "AED";
    const totalInventory = inventoryData.reduce((s, i) => s + i.value, 0);

    const handleExport = async (type, section = null) => {
        try {
            setExporting(section ? `${section}-${type}` : type);
            const response = await getInventoryExport(type === "excel" ? "xlsx" : "pdf", { ...filters, section });
            const blob = new Blob([response.data], { type: response.headers["content-type"] });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", type === "excel" ? "Inventory_Report.xlsx" : "Inventory_Report.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export Error:", error);
            alert("Download Failed");
        } finally {
            setExporting("");
        }
    };

    /* KPI definitions */
    const kpis = [
        { id: 1, title: "Total Inventory Value", value: fmtAED(inventorySummary?.total_inventory_value, selectedCurrency), icon: Package, iconColor: "#2563EB", iconBg: "#DBEAFE", change: null, up: true },
        { id: 2, title: "Average Inventory Value", value: inventorySummary?.average_inventory_value != null ? fmtAED(inventorySummary.average_inventory_value, selectedCurrency) : "–", icon: Cuboid, iconColor: "#7C3AED", iconBg: "#F3E8FF", change: null, up: true },
        { id: 3, title: "Inventory Turnover (TTM)", value: inventorySummary?.inventory_turnover_ttm != null ? `${Number(inventorySummary.inventory_turnover_ttm).toFixed(2)} Times` : "–", icon: TrendingUp, iconColor: "#EA580C", iconBg: "#FFEDD5", change: null, up: false },
        { id: 4, title: "Stock Holding Days (DIO)", value: inventorySummary?.stock_holding_days != null ? `${inventorySummary.stock_holding_days} Days` : "–", icon: Clock, iconColor: "#0891B2", iconBg: "#CFFAFE", change: null, up: false },
        { id: 5, title: "Obsolete / Slow Moving Stock (> 365 Days)", value: fmtAED(inventorySummary?.obsolete_slow_moving, selectedCurrency), icon: AlertTriangle, iconColor: "#E11D48", iconBg: "#FFE4E6", change: null, up: true },
    ];

    /* Filter dropdown renderer matching new style */
    const FilterSelect = ({ label, value, onChange, options, placeholder = "All" }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120, flex: 1 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E3A8A', whiteSpace: 'nowrap' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <select
                    value={value || ""}
                    onChange={onChange}
                    style={{
                        padding: '8px 30px 8px 12px', borderRadius: 8, border: '1px solid #E8EDF5',
                        fontSize: '0.8rem', color: '#0F172A', background: '#F8FAFC', width: '100%',
                        height: 38, appearance: 'none', cursor: 'pointer', fontWeight: 500
                    }}
                >
                    <option value="">{placeholder}</option>
                    {options?.map((o, idx) => {
                        const val = typeof o === 'object' ? (o.id || o.code || o.name) : o;
                        const lbl = typeof o === 'object' ? (o.name || o.code || o.id) : o;
                        return <option key={`${val}-${idx}`} value={val}>{lbl}</option>;
                    })}
                </select>
                <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
        </div>
    );

    return (
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* ── Page Header ──────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <div>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#081B46', margin: 0, letterSpacing: '-0.02em' }}>Inventory Overview</h1>
                    <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0' }}>Track inventory position, movement and aging across all dimensions</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => handleExport('excel')} disabled={!!exporting}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 7, fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px', cursor: exporting ? 'not-allowed' : 'pointer' }}>
                        <Download size={13} /> {exporting === 'excel' ? '...' : 'Excel'}
                    </button>
                    <button onClick={() => handleExport('pdf')} disabled={!!exporting}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', borderRadius: 7, fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px', cursor: exporting ? 'not-allowed' : 'pointer' }}>
                        <Download size={13} /> {exporting === 'pdf' ? '...' : 'PDF'}
                    </button>
                </div>
            </div>

            {/* ── Filters ──────────────────────────────────────── */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, overflowX: 'auto', alignItems: 'flex-end', background: '#fff' }}>
                <FilterSelect label="Legal Group" value={filters.legal_group} onChange={e => setFilters(p => ({ ...p, legal_group: e.target.value }))} options={filterOptions.legal_groups} placeholder="All" />
                <FilterSelect label="Legal Entity" value={filters.legal_entity} onChange={e => setFilters(p => ({ ...p, legal_entity: e.target.value }))} options={filterOptions.legal_entities} />
                <FilterSelect label="Parent Division" value={filters.parent_division} onChange={e => setFilters(p => ({ ...p, parent_division: e.target.value }))} options={filterOptions.parent_divisions} />
                <FilterSelect label="Sub-Division" value={filters.subdivision} onChange={e => setFilters(p => ({ ...p, subdivision: e.target.value }))} options={filterOptions.subdivisions} />
                <FilterSelect label="Reporting Currency" value={filters.currency} onChange={e => setFilters(p => ({ ...p, currency: e.target.value }))} options={filterOptions.currencies} placeholder="AED" />
                <FilterSelect label="Aging Basis" value={filters.subinventory} onChange={e => setFilters(p => ({ ...p, subinventory: e.target.value }))} options={[]} placeholder="Due Date Based" />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120, flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E3A8A' }}>As On Date</label>
                    <div style={{ position: 'relative' }}>
                        <select value={filters.as_on_date || ""}
                            onChange={e => setFilters(p => ({ ...p, as_on_date: e.target.value }))}
                            style={{
                                padding: '8px 30px 8px 12px', borderRadius: 8, border: '1px solid #E8EDF5',
                                fontSize: '0.8rem', color: '#0F172A', background: '#F8FAFC', width: '100%',
                                height: 38, appearance: 'none', cursor: 'pointer', fontWeight: 500
                            }}>
                            {filterOptions.as_on_dates?.map((d, i) => <option key={`${d}-${i}`} value={d}>{d}</option>)}
                            {!filterOptions.as_on_dates?.length && <option value="">Select Date</option>}
                        </select>
                        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L5 5L9 1" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 8, flexShrink: 0 }}>
                    <button onClick={() => setFilters({ ...filters })}
                        style={{ padding: '0 24px', background: '#6366F1', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', height: 38 }}>
                        Apply
                    </button>
                    <button onClick={() => setFilters({})}
                        style={{ padding: '0 24px', background: '#fff', color: '#475569', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', height: 38 }}>
                        Reset
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ────────────────────────────────────── */}
            <div className="kpi-grid" style={{ marginBottom: 16 }}>
                {kpis.map(k => (
                    <InventoryKPICard key={k.id} title={k.title} value={k.value} change={k.change} up={k.up}
                        icon={k.icon} iconColor={k.iconColor} iconBg={k.iconBg} />
                ))}
            </div>

            {/* ── Charts Row 1 ─────────────────────────────────── */}
            <div className="grid-charts-3" style={{ marginBottom: 16 }}>
                <InventoryValueTrend
                    data={inventoryTrendData}
                    currency={selectedCurrency}
                    onViewAll={() => handleViewDetails({ section: 'trend' })}
                    onExport={() => handleExport('excel', 'trend')}
                />
                <OverDueSummaryCard
                    data={inventoryData}
                    total={totalInventory}
                    Centerlabel="Total Inventory"
                    currency={selectedCurrency}
                    onViewAll={() => handleViewDetails({})}
                    onExport={() => handleExport('excel')}
                />
                <ParentDivisionCard
                    data={inventorySubdivision}
                    currency={selectedCurrency}
                    onSliceClick={(item) => handleViewDetails({ drilldown_subdivision_id: item.id })}
                    onViewAll={() => handleViewDetails({ section: 'parent-divisions' })}
                    onExport={() => handleExport('excel', 'parent-divisions')}
                />
            </div>

            {/* ── Charts Row 2 ─────────────────────────────────── */}
            <div className="grid-charts-3" style={{ marginBottom: 16 }}>
                <AgingSummaryCard
                    data={inventoryAgingData}
                    legendData={inventoryAgingData}
                    total={inventoryAgingTotal}
                    currency={selectedCurrency}
                    onSliceClick={(item) => handleViewDetails({ aging_bucket: item.id })}
                    onViewAll={() => handleViewDetails({})}
                    onExport={() => handleExport('excel')}
                />
                <SlowMovingTable
                    data={slowMovingItemsData}
                    currency={selectedCurrency}
                    onViewAll={() => handleViewDetails({ section: 'slow-moving' })}
                    onExport={() => handleExport('excel', 'slow-moving')}
                />
                <InventoryTurnoverTrend
                    data={inventoryTrendData}
                    onViewAll={() => handleViewDetails({ section: 'trend' })}
                    onExport={() => handleExport('excel', 'trend')}
                />
            </div>

            {/* ── Inventory Detailed View ───────────────────────── */}
            <InventoryDetailedViewTable
                title="Inventory Detailed View"
                data={detailedViewData}
                currency={selectedCurrency}
                onViewAll={handleViewDetails}
            />

            {/* ── Footer ───────────────────────────────────────── */}
            <div style={{ padding: '10px 4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94A3B8', borderTop: '1px solid #EEF2F7', marginTop: 20 }}>
                <span>All values are in {selectedCurrency} &nbsp;|&nbsp; Data as on {filterOptions.as_on_dates?.[0] || '–'}</span>
                <span>🌐 Source: Oracle Fusion Cloud</span>
            </div>

            {/* ── View All Modal ────────────────────────────────── */}
            <InventoryDetailsModal
                open={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                filters={filters}
                drilldownFilters={drilldownFilters}
            />
        </div>
    );
}
