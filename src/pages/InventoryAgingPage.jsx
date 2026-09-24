import React, { useMemo, useState, useEffect, useRef } from "react";
import MultiSelectDropdown from "../components/Filters/MultiSelectDropdown";
import { Coins, BarChart3, RotateCw, Calendar, AlertTriangle } from "lucide-react";
import { getInventoryFilters, getInventoryDashboard, getInventoryDetails, getInventoryExport } from "../api/inventoryApi";
import { toast } from "react-hot-toast";

export default function InventoryOverview() {
  // ============================================================
  // API STATE & LOGIC
  // ============================================================


  const handleExport = async (type, section = null) => {
    const toastId = toast.loading(`Exporting ${section || 'data'}...`);
    try {
      let formattedDate = filters.asOnDate;
      if (formattedDate && formattedDate !== "All" && formattedDate !== "") {
          const d = new Date(formattedDate);
          if (!isNaN(d.getTime())) {
              formattedDate = d.toISOString().split('T')[0];
          }
      }
      
      const apiFilters = {};
      const getApiVal = (val) => {
                  if (!val || val === "All") return null;
                  if (Array.isArray(val)) {
                      const c = val.filter(v => v !== "All");
                      return c.length > 0 ? c : null;
                  }
                  return [val];
              };
              
              if (getApiVal(filters.legalGroup)) apiFilters.legal_group_id = getApiVal(filters.legalGroup);
              if (getApiVal(filters.legalEntity)) apiFilters.legal_entity_id = getApiVal(filters.legalEntity);
              if (getApiVal(filters.parentDivision)) apiFilters.parent_division_id = getApiVal(filters.parentDivision);
              if (getApiVal(filters.subdivision)) apiFilters.subdivision_id = getApiVal(filters.subdivision);
              if (getApiVal(filters.subinventory)) apiFilters.subinventory_id = getApiVal(filters.subinventory);
              
              if (filters.currency && filters.currency !== "All" && filters.currency !== "AED") apiFilters.currency = filters.currency; // Modify if AED shouldn't be ignored
              if (formattedDate && formattedDate !== "All" && formattedDate !== "") apiFilters.as_on_date = formattedDate;

      const exportFilters = section ? { ...apiFilters, section } : apiFilters;
      const response = await getInventoryExport(type, exportFilters);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Inventory_${section || 'Export'}_${type}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export successful", { id: toastId });
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Export failed: " + (err.response?.data?.detail || err.message || "Unknown error"), { id: toastId });
    }
  };

  const [filters, setFilters] = useState({
      legalGroup: [],
      legalEntity: [],
      parentDivision: [],
      subdivision: [],
      subinventory: [],
      currency: "AED",
      asOnDate: "All",
  });
const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [detailPage, setDetailPage] = useState(0);
  const [detailPageSize, setDetailPageSize] = useState(15);
  const [parentDivViewMode, setParentDivViewMode] = useState("month"); // "month" | "mom"
  const [viewAllModal, setViewAllModal] = useState(null); // "trend" | "parentDivision" | "subdivision" | "aging" | "slowMoving" | "location" | "details" | null
  const [viewAllSearch, setViewAllSearch] = useState("");
  const [modalDetailPage, setModalDetailPage] = useState(0);
  const [modalDetailPageSize, setModalDetailPageSize] = useState(15);
  const [mockData, setMockData] = useState({
    filters: {
      legalGroups: [], legalEntities: [], parentDivisions: [], subdivisions: [], subinventories: [], currencies: [], dates: []
    },
    kpis: [],
    trend: { labels: [], previous: [], current: [], list: [] },
    divisions: [],
    allDivisions: [],
    businessUnits: [],
    bySubdivision: [],
    allSubdivisions: [],
    aging: [],
    slowMoving: [],
    allSlowMoving: [],
    locations: [],
    allLocations: [],
    details: []
  });

  

  const fmtAED = (v) => {
      if (v === null || v === undefined) return "—";
      const n = Number(v);
      if (isNaN(n)) return "—";
      const cur = filters.currency || "AED";
      if (n >= 1000000000) return `${cur} ${(n / 1000000000).toFixed(2)}B`;
      if (n >= 10000000) return `${cur} ${(n / 10000000).toFixed(2)} Cr`;
      if (n >= 1000000) return `${cur} ${(n / 1000000).toFixed(2)}M`;
      if (n >= 1000) return `${cur} ${(n / 1000).toFixed(2)}K`;
      return `${cur} ${n.toFixed(2)}`;
  };

  useEffect(() => {
      const loadData = async () => {
          setLoading(true);
          try {
              // Map UI filter keys to API filter keys
              
              let formattedDate = filters.asOnDate;
              if (formattedDate && formattedDate !== "All" && formattedDate !== "") {
                  const d = new Date(formattedDate);
                  if (!isNaN(d.getTime())) {
                      formattedDate = d.toISOString().split('T')[0];
                  }
              }

              const apiFilters = {};
              const getApiVal = (val) => {
                  if (!val || val === "All") return null;
                  if (Array.isArray(val)) {
                      const c = val.filter(v => v !== "All");
                      return c.length > 0 ? c : null;
                  }
                  return [val];
              };
              
              if (getApiVal(filters.legalGroup)) apiFilters.legal_group_id = getApiVal(filters.legalGroup);
              if (getApiVal(filters.legalEntity)) apiFilters.legal_entity_id = getApiVal(filters.legalEntity);
              if (getApiVal(filters.parentDivision)) apiFilters.parent_division_id = getApiVal(filters.parentDivision);
              if (getApiVal(filters.subdivision)) apiFilters.subdivision_id = getApiVal(filters.subdivision);
              if (getApiVal(filters.subinventory)) apiFilters.subinventory_id = getApiVal(filters.subinventory);
              
              if (filters.currency && filters.currency !== "All" && filters.currency !== "AED") apiFilters.currency = filters.currency; // Modify if AED shouldn't be ignored
              if (formattedDate && formattedDate !== "All" && formattedDate !== "") apiFilters.as_on_date = formattedDate;

              const [filterRes, dashRes, detailsRes] = await Promise.all([
                  getInventoryFilters(),
                  getInventoryDashboard(apiFilters),
                  getInventoryDetails({ ...apiFilters, limit: 100 })
              ]);
              
              const fData = filterRes.data || {};
              const dData = dashRes.data || {};
              
                            let kpis = [];
              if (dData.kpis) {
                    const sparkline = dData.trend && Array.isArray(dData.trend) 
                        ? dData.trend.map(t => Number(t.inventory_value || 0) / 10000000) 
                        : [];

                    kpis = [
                        {
                            key: "total_inv",
                            title: "Total Inventory Value",
                            titleColor: "#2563EB",
                            cardBg: "linear-gradient(180deg, #F0F6FE 0%, #FFFFFF 100%)",
                            borderColor: "#D6E4FA",
                            value: fmtAED(dData.kpis.total_inventory),
                            icon: Coins,
                            iconBg: "#DBEAFE",
                            iconColor: "#2563EB",
                            variance: dData.kpis.total_inventory_variance || null,
                            varianceLabel: dData.kpis.variance_label || null,
                            direction: "up",
                            line: sparkline
                        },
                        {
                            key: "avg_inv",
                            title: "Average Inventory Value",
                            titleColor: "#7C3AED",
                            cardBg: "linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%)",
                            borderColor: "#E9D5FF",
                            value: fmtAED(dData.kpis.average_inventory || dData.kpis.average_inventory_value),
                            icon: BarChart3,
                            iconBg: "#F3E8FF",
                            iconColor: "#7C3AED",
                            variance: dData.kpis.average_inventory_variance || null,
                            varianceLabel: dData.kpis.variance_label || null,
                            direction: "up",
                            line: sparkline
                        },
                        {
                            key: "turnover",
                            title: "Inventory Turnover (TTM)",
                            titleColor: "#EA580C",
                            cardBg: "linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%)",
                            borderColor: "#FED7AA",
                            value: (dData.kpis.inventory_turnover_ttm || dData.kpis.inventory_turnover) 
                                ? `${Number(dData.kpis.inventory_turnover_ttm || dData.kpis.inventory_turnover).toFixed(2)} Times` 
                                : "—",
                            icon: RotateCw,
                            iconBg: "#FFEDD5",
                            iconColor: "#EA580C",
                            variance: dData.kpis.turnover_variance || null,
                            varianceLabel: dData.kpis.variance_label || null,
                            direction: "down",
                            line: sparkline
                        },
                        {
                            key: "dio",
                            title: "Stock Holding Days (DIO)",
                            titleColor: "#16A34A",
                            cardBg: "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)",
                            borderColor: "#BBF7D0",
                            value: (dData.kpis.stock_holding_days || dData.kpis.dio) 
                                ? `${dData.kpis.stock_holding_days || dData.kpis.dio} Days` 
                                : "—",
                            icon: Calendar,
                            iconBg: "#DCFCE7",
                            iconColor: "#16A34A",
                            variance: dData.kpis.dio_variance || null,
                            varianceLabel: dData.kpis.variance_label || null,
                            direction: "down",
                            line: sparkline
                        },
                        {
                            key: "obsolete",
                            title: "Obsolete / Slow Moving Stock",
                            subtitle: "(> 365 Days)",
                            titleColor: "#DC2626",
                            cardBg: "linear-gradient(180deg, #FEF2F2 0%, #FFFFFF 100%)",
                            borderColor: "#FECACA",
                            value: fmtAED(dData.kpis.inventory_above_365),
                            icon: AlertTriangle,
                            iconBg: "#FEE2E2",
                            iconColor: "#DC2626",
                            variance: dData.kpis.obsolete_variance || null,
                            varianceLabel: dData.kpis.variance_label || null,
                            direction: "up",
                            arrowColor: "#DC2626",
                            line: sparkline
                        }
                    ];
              }

              let aging = [];
              if (dData.aging_summary) {
                  const agingColors = {
                      "0_30": "#2563eb",
                      "31_60": "#16a34a",
                      "61_90": "#f59e0b",
                      "91_120": "#7c3aed",
                      "121_180": "#ec4899",
                      "181_365": "#94a3b8",
                      "366_730": "#64748b",
                      "above_730": "#475569",
                      "ABOVE_730": "#475569"
                  };
                  const labels = {
                      "0_30": "0 - 30 Days",
                      "31_60": "31 - 60 Days",
                      "61_90": "61 - 90 Days",
                      "91_120": "91 - 120 Days",
                      "121_180": "121 - 180 Days",
                      "181_365": "181 - 365 Days",
                      "366_730": "366 - 730 Days",
                      "above_730": "Above 730 Days",
                      "ABOVE_730": "Above 730 Days"
                  };

                  const formatBucket = (raw) => {
                      if (!raw) return "";
                      const s = String(raw).trim();
                      if (labels[s]) return labels[s];
                      const lower = s.toLowerCase();
                      if (labels[lower]) return labels[lower];
                      if (lower.includes("above") || lower.includes("730")) return "Above 730 Days";
                      return s;
                  };

                  let totalAging = 0;
                  const formattedAging = [];
                  
                  if (Array.isArray(dData.aging_summary)) {
                      dData.aging_summary.forEach(item => {
                          const k = item.bucket_code || item.bucket || item.name;
                          const val = Number(item.amount || item.value || 0) / 10000000;
                          const pct = Number(item.percentage_of_total || item.percentage || 0);
                          if (val > 0) {
                              formattedAging.push({
                                  name: formatBucket(k),
                                  value: val,
                                  color: agingColors[k] || agingColors[String(k).toLowerCase()] || "#64748b",
                                  percentage: pct
                              });
                              totalAging += val;
                          }
                      });
                      aging = formattedAging;
                  } else {
                      Object.keys(dData.aging_summary).forEach(k => {
                          const val = Number(dData.aging_summary[k]) / 10000000;
                          if (val > 0) {
                              formattedAging.push({
                                  name: formatBucket(k),
                                  value: val,
                                  color: agingColors[k] || agingColors[String(k).toLowerCase()] || "#64748b",
                                  percentage: 0
                              });
                              totalAging += val;
                          }
                      });
                      if (totalAging > 0) {
                          formattedAging.forEach(item => {
                              item.percentage = (item.value / totalAging) * 100;
                          });
                      }
                      aging = formattedAging;
                  }
              }

              let allDivisions = [];
              let divisions = [];
              if (dData.by_parent_division) {
                  const colors = ["#2563eb", "#16a34a", "#f59e0b", "#7c3aed", "#ec4899", "#0891b2"];
                  allDivisions = dData.by_parent_division.map((item, idx) => ({
                      name: typeof item.label === 'object' ? (item.label?.name || item.label?.code) : item.label,
                      value: Number(item.inventory_value) / 10000000,
                      percentage: Number(item.percentage_of_total),
                      color: colors[idx % colors.length]
                  })).sort((a,b) => b.value - a.value);

                  if (allDivisions.length > 5) {
                      const top4 = allDivisions.slice(0, 4);
                      const others = allDivisions.slice(4);
                      const otherVal = others.reduce((s, r) => s + r.value, 0);
                      const otherPct = others.reduce((s, r) => s + r.percentage, 0);
                      divisions = [
                          ...top4,
                          { name: "Others", value: otherVal, percentage: otherPct, color: "#64748b" }
                      ];
                  } else {
                      divisions = allDivisions;
                  }
              }

              let allSubdivisions = [];
              let bySubdivision = [];
              if (dData.by_subdivision) {
                  allSubdivisions = dData.by_subdivision.map((item) => ({
                      name: typeof item.subdivision_name === 'object' ? (item.subdivision_name?.name || item.subdivision_name?.code) : item.subdivision_name,
                      value: Number(item.inventory_value) / 10000000,
                      percentage: Number(item.percentage_of_total || 0),
                  })).sort((a,b) => b.value - a.value);

                  const subTotal = allSubdivisions.reduce((s, r) => s + r.value, 0);
                  if (subTotal > 0) {
                      allSubdivisions.forEach(r => {
                          if (!r.percentage) r.percentage = (r.value / subTotal) * 100;
                      });
                  }

                  bySubdivision = allSubdivisions.slice(0, 5);
              }

              let trend = { labels: [], previous: [], current: [], list: [] };
              if (dData.trend && Array.isArray(dData.trend)) {
                  trend.labels = dData.trend.map(item => {
                      if (typeof item.month_start === 'object' && item.month_start?.name) {
                          return item.month_start.name;
                      }
                      if (item.month_start) {
                          const str = String(item.month_start);
                          return str.substring(0, 7);
                      }
                      return "";
                  });
                  trend.current = dData.trend.map(item => Number(item.inventory_value || 0) / 10000000);
                  trend.previous = dData.trend.map(item => (item.previous_value !== undefined && item.previous_value !== null) ? Number(item.previous_value) / 10000000 : null);
                  trend.list = dData.trend.map((item, idx) => {
                      const month = trend.labels[idx] || `M${idx + 1}`;
                      const curr = Number(item.inventory_value || 0) / 10000000;
                      const prev = (item.previous_value !== undefined && item.previous_value !== null) ? Number(item.previous_value) / 10000000 : null;
                      const variance = prev !== null ? curr - prev : null;
                      const growth = (prev !== null && prev !== 0) ? ((curr - prev) / prev) * 100 : null;
                      return { month, current: curr, previous: prev, variance, growth };
                  });
              }

              let allSlowMoving = [];
              let slowMoving = [];
              const slowSource = dData.slow_moving_by_parent_div || dData.top_items;
              if (slowSource && Array.isArray(slowSource)) {
                  allSlowMoving = slowSource.map((item, idx) => ({
                      no: idx + 1,
                      parentDiv: typeof item.parent_division === 'object' ? item.parent_division?.name : (item.parent_division || item.item_description || "N/A"),
                      obsolete: Number(item.obsolete_stock || item.inventory_value || 0) / 10000000,
                      total: Number(item.total_stock || item.inventory_value || 0) / 10000000,
                      percentage: Number(item.percentage_obsolete || item.percentage || 0)
                  }));
                  slowMoving = allSlowMoving.slice(0, 5);
              }

              let allLocations = [];
              let locations = [];
              const locSource = dData.locations || dData.by_location || dData.by_category || dData.top_items;
              if (locSource && Array.isArray(locSource)) {
                  let locSum = 0;
                  const formatted = locSource.map((item, idx) => {
                      const name = item.location || item.name || item.category || item.item_description || item.item_code || `Location ${idx + 1}`;
                      const val = Number(item.inventory_value || item.total_stock_value || item.value || 0) / 10000000;
                      const pct = Number(item.percentage_of_total || item.percentage || 0);
                      locSum += val;
                      return { name, value: val, percentage: pct };
                  });
                  if (locSum > 0) {
                      formatted.forEach(item => {
                          if (!item.percentage) item.percentage = (item.value / locSum) * 100;
                      });
                  }
                  allLocations = formatted;
                  locations = formatted.slice(0, 5);
              }


              let details = [];
              if (detailsRes && detailsRes.data && detailsRes.data.items) {
                  details = detailsRes.data.items.map((item, idx) => ({
                      id: `${item.legal_entity_name || item.legal_entity || 'le'}-${item.item_code || idx}-${idx}`,
                      legal_entity: item.legal_entity_name || (typeof item.legal_entity === 'object' ? item.legal_entity?.name : item.legal_entity) || "-",
                      parent_division: item.parent_division_name || (typeof item.parent_division === 'object' ? item.parent_division?.name : item.parent_division) || "-",
                      subdivision: item.subdivision_name || (typeof item.subdivision === 'object' ? item.subdivision?.name : item.subdivision) || "-",
                      subinventory: item.subinventory_name || item.subinventory || item.business_unit || "-",
                      item_code: item.item_code || "-",
                      item_description: item.item_description || "-",
                      quantity: item.quantity !== undefined && item.quantity !== null ? Number(item.quantity) : 0,
                      total_stock_value: item.total_stock_value !== undefined && item.total_stock_value !== null ? Number(item.total_stock_value) : (item.inventory_value || 0),
                      aging_0_30: item.aging_0_30 !== undefined && item.aging_0_30 !== null ? Number(item.aging_0_30) : 0,
                      aging_31_60: item.aging_31_60 !== undefined && item.aging_31_60 !== null ? Number(item.aging_31_60) : 0,
                      aging_61_90: item.aging_61_90 !== undefined && item.aging_61_90 !== null ? Number(item.aging_61_90) : 0,
                      aging_91_120: item.aging_91_120 !== undefined && item.aging_91_120 !== null ? Number(item.aging_91_120) : 0,
                      aging_121_180: item.aging_121_180 !== undefined && item.aging_121_180 !== null ? Number(item.aging_121_180) : 0,
                      aging_181_365: item.aging_181_365 !== undefined && item.aging_181_365 !== null ? Number(item.aging_181_365) : 0,
                      aging_366_730: item.aging_366_730 !== undefined && item.aging_366_730 !== null ? Number(item.aging_366_730) : 0,
                      aging_above_730: item.aging_above_730 !== undefined && item.aging_above_730 !== null ? Number(item.aging_above_730) : 0,
                      days: item.dio || item.days || "-",
                      avg_inv_value: item.avg_inv_value || item.average_inventory_value || "-",
                  }));
              }

              setMockData({
                  filters: {
                      legalGroups: [{value: "All", label: "All"}, ...(fData.legal_groups || []).map(x => ({ value: x.id || x.value || x, label: x.name || x.label || x }))],
                      legalEntities: [{value: "All", label: "All"}, ...(fData.legal_entities || []).map(x => ({ value: x.id || x.value || x, label: x.name || x.label || x }))],
                      parentDivisions: [{value: "All", label: "All"}, ...(fData.parent_divisions || []).map(x => ({ value: x.id || x.value || x, label: x.name || x.label || x }))],
                      subdivisions: [{value: "All", label: "All"}, ...(fData.subdivisions || []).map(x => ({ value: x.id || x.value || x, label: x.name || x.label || x }))],
                      subinventories: [{value: "All", label: "All"}, ...(fData.subinventories || []).map(x => ({ value: x.id || x.value || x, label: x.name || x.label || x }))],
                      currencies: [{value: "AED", label: "AED"}, ...(fData.currencies || []).map(x => ({ value: x.id || x.value || x, label: x.name || x.label || x }))],
                      dates: [{value: "All", label: "All"}, ...(fData.as_on_dates || []).map(x => ({ value: x, label: x }))],
                  },
                  kpis,
                  trend,
                  divisions,
                  allDivisions,
                  bySubdivision,
                  allSubdivisions,
                  aging,
                  slowMoving,
                  allSlowMoving,
                  locations,
                  allLocations,
                  details
              });
          } catch (err) {
              console.error(err);
          } finally {
              setLoading(false);
          }
      };
      loadData();
  }, [filters]);



  // ============================================================
  // FILTER STATE (Removed duplicated state, already defined above)

  // ============================================================

  

  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setDetailPage(0);
    setFilters({
      legalGroup: [],
      legalEntity: [],
      parentDivision: [],
      subdivision: [],
      subinventory: [],
      currency: "AED",
      asOnDate: "All",
    });
  };

  // ============================================================
  // SVG MINI LINE / AREA SPARKLINE
  // ============================================================

  const MiniLine = ({ points = [], color = "#2563eb", id = "kpi" }) => {
    const width = 200;
    const height = 30;

    const validPoints = points.filter(p => typeof p === 'number' && !isNaN(p));
    if (validPoints.length === 0) {
      return null;
    }

    const min = Math.min(...validPoints);
    const max = Math.max(...validPoints);
    const hasVariation = max > min && validPoints.length > 1;

    const pathPoints = validPoints.map((point, index) => {
      const x = validPoints.length > 1 ? (index / (validPoints.length - 1)) * width : width / 2;
      const normalized = hasVariation ? (point - min) / (max - min) : 0.5;
      const y = height - 4 - normalized * (height - 8);
      return { x, y };
    });

    const linePath = pathPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
    const gradId = `kpi-grad-${id}`;

    return (
      <svg
        width="100%"
        height="30"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {hasVariation && <path d={areaPath} fill={`url(#${gradId})`} />}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // ============================================================
  // KPI CARD
  // ============================================================

  const KpiCard = ({ item }) => {
    const isPositive = item.direction === "up";
    const hasVariance = item.variance !== null && item.variance !== undefined;

    return (
        <div
            style={{
                background: item.iconBg || "#F8FAFC",
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
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "#F1F5F9",
                        color: item.iconColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.06)",
                    }}
                >
                    {typeof item.icon === "string" ? (
                        item.icon
                    ) : (
                        <item.icon size={20} strokeWidth={2.2} />
                    )}
                </div>

                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: item.iconColor,
                        lineHeight: 1.2,
                    }}
                >
                    {item.title}
                </div>
            </div>

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
                {item.value || "—"}
            </div>

            {item.subtitle ? (
                <div
                    style={{
                        marginLeft: "46px",
                        marginTop: "1px",
                        fontSize: "10px",
                        color: "#64748b",
                        fontWeight: 500,
                        lineHeight: 1.2,
                    }}
                >
                    {item.subtitle}
                </div>
            ) : null}

            <div
                style={{
                    marginLeft: "46px",
                    fontSize: "11px",
                    color: isPositive ? "#0e9f75" : "#ef476f",
                    fontWeight: 600,
                    lineHeight: 1.2,
                }}
            >
                {hasVariance ? (
                    <>{isPositive ? "▲" : "▼"} {item.variance} {item.varianceLabel || ""}</>
                ) : (
                    "—"
                )}
            </div>
        </div>
    );
  };

  // ============================================================
  // LINE CHART
  // ============================================================

  const LineChart = () => {
    const width = 530;
    const height = 185;
    const paddingLeft = 38;
    const paddingRight = 14;
    const paddingTop = 12;
    const paddingBottom = 26;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const labels = mockData.trend.labels || [];
    const cyValues = mockData.trend.current || [];
    const pyValues = (mockData.trend.previous || []).filter(v => v !== null && typeof v === 'number' && !isNaN(v));

    if (labels.length === 0) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 165, color: "#94a3b8", fontSize: "11px" }}>
          No trend data available
        </div>
      );
    }

    const allValues = [...cyValues, ...pyValues].filter(v => typeof v === 'number' && !isNaN(v));
    const _rawMax = allValues.length ? Math.max(...allValues, 10) : 100;
    const maxValue = Math.max(10, Math.ceil(_rawMax * 1.2));
    const minValue = 0;

    const yTicks = [
      0,
      Math.round(maxValue * 0.25),
      Math.round(maxValue * 0.5),
      Math.round(maxValue * 0.75),
      Math.round(maxValue)
    ];

    const getCoord = (value, index, total) => {
      const x = total > 1 ? paddingLeft + (index / (total - 1)) * plotWidth : paddingLeft + plotWidth / 2;
      const y = paddingTop + plotHeight - ((value - minValue) / (maxValue - minValue)) * plotHeight;
      return { x, y };
    };

    const makePolylinePoints = (values) => {
      return values
        .map((val, idx) => {
          const { x, y } = getCoord(val, idx, values.length);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
    };

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        {/* Y Axis Grid lines and labels */}
        {yTicks.map((value) => {
          const y = paddingTop + plotHeight - ((value - minValue) / (maxValue - minValue)) * plotHeight;
          return (
            <g key={value}>
              <line
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={y}
                y2={y}
                stroke="#eef2f6"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 7}
                y={y + 3.5}
                textAnchor="end"
                fontSize="9"
                fontWeight="500"
                fill="#64748b"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* Left Y-axis line */}
        <line
          x1={paddingLeft}
          x2={paddingLeft}
          y1={paddingTop}
          y2={paddingTop + plotHeight}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* PY Line (Green) */}
        {pyValues.length > 1 && (
          <polyline
            points={makePolylinePoints(pyValues)}
            fill="none"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* CY Line (Blue) */}
        {cyValues.length > 1 && (
          <polyline
            points={makePolylinePoints(cyValues)}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* PY Points (Green circles) */}
        {pyValues.map((value, index) => {
          const { x, y } = getCoord(value, index, pyValues.length);
          return (
            <circle
              key={`py-${index}`}
              cx={x}
              cy={y}
              r="3.2"
              fill="#16a34a"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          );
        })}

        {/* CY Points (Blue circles) */}
        {cyValues.map((value, index) => {
          const { x, y } = getCoord(value, index, cyValues.length);
          return (
            <circle
              key={`cy-${index}`}
              cx={x}
              cy={y}
              r="3.2"
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          );
        })}

        {/* X Axis Month Labels */}
        {labels.map((label, index) => {
          const x = labels.length > 1 ? paddingLeft + (index / (labels.length - 1)) * plotWidth : paddingLeft + plotWidth / 2;
          return (
            <text
              key={`${label}-${index}`}
              x={x}
              y={height - 6}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill="#64748b"
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
    size = 120,
    strokeWidth = 18,
  }) => {
    const half = size / 2;
    const radius = half - strokeWidth / 2 - 2;
    const circumference = 2 * Math.PI * radius;

    let offset = 0;

    return (
      <div style={{ width: size, height: size, flex: `0 0 ${size}px`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: "visible" }}
        >
          <g transform={`rotate(-90 ${half} ${half})`}>
            <circle
              cx={half}
              cy={half}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {data.map((item) => {
              const dash = (item.percentage / 100) * circumference;
              const currentOffset = offset;
              offset += dash;

              return (
                <circle
                  key={item.name}
                  cx={half}
                  cy={half}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-currentOffset}
                />
              );
            })}
          </g>

          <text
            x={half}
            y={half + 4}
            textAnchor="middle"
            fontSize="11"
            fontWeight="800"
            fill="#1e293b"
            letterSpacing="-0.3px"
          >
            {centerSubText ? `${centerSubText === "Total" ? "" : centerSubText} ${centerText}`.trim() : centerText}
          </text>
        </svg>
      </div>
    );
  };

  // ============================================================
  // BAR CHART
  // ============================================================

  const SubdivisionChart = () => {
    const max = Math.max(
      ...(mockData.bySubdivision && mockData.bySubdivision.length > 0 ? mockData.bySubdivision.map((x) => x.value) : [1])
    );
    const roundMax = max <= 10 ? 10 : Math.ceil(max / 10) * 10;
    const ticks = [
      0,
      Math.round(roundMax * 0.25),
      Math.round(roundMax * 0.5),
      Math.round(roundMax * 0.75),
      roundMax,
    ];

    return (
      <div style={{ width: "100%", paddingTop: 4 }}>
        {(mockData.bySubdivision || []).map((item) => (
          <div
            key={item.name}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr 48px",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                color: "#475569",
                textAlign: "right",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: 500,
              }}
              title={item.name}
            >
              {item.name}
            </div>

            <div
              style={{
                height: 12,
                background: "#f1f5f9",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${roundMax > 0 ? (item.value / roundMax) * 100 : 0}%`,
                  background: "#2563eb",
                  borderRadius: 3,
                }}
              />
            </div>

            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#1e293b",
                textAlign: "right",
              }}
            >
              {item.value.toFixed(2)}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 4,
            marginLeft: 98,
            borderTop: "1px solid #e2e8f0",
            paddingTop: 4,
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.68rem",
            color: "#64748b",
          }}
        >
          {ticks.map((t, idx) => (
            <span key={idx}>{t}</span>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "0.68rem",
            color: "#64748b",
            marginTop: 3,
            fontWeight: 600,
          }}
        >
          {filters.currency || "AED"} Cr
        </div>
      </div>
    );
  };

  // ============================================================
  // SECTION HEADER
  // ============================================================

  // ============================================================
  // CARD HEADER COMPONENT
  // ============================================================

  const CardHeader = ({
      isExporting,
    title,
    subtitle,
    info,
    onViewAll,
    onExport,
    extra,
  }) => {
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef(null);

    useEffect(() => {
      if (!exportOpen) return;
      const handleClickOutside = (e) => {
        if (exportRef.current && !exportRef.current.contains(e.target)) {
          setExportOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [exportOpen]);

    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 6 }}>
            {title}
            {info && (
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                  cursor: "help",
                  fontWeight: 600,
                }}
                title={info}
              >
                ⓘ
              </span>
            )}
          </div>
          {subtitle && (
            <div style={{ fontSize: "0.70rem", color: "#64748b", marginTop: 2 }}>
              {subtitle}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {extra && (
            <div style={{ display: "flex", alignItems: "center" }}>{extra}</div>
          )}

          {(onViewAll || onExport) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative", whiteSpace: "nowrap", flexShrink: 0 }}>
              {onViewAll && (
                <button type="button"
                    style={{
                      height: 26,
                    padding: "0 10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    background: "#fff",
                    color: "#334155",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                  onClick={onViewAll}
                >
                  View All
                </button>
              )}

              {onExport && (
                <div ref={exportRef} style={{ position: "relative" }}>
                  <button type="button"
                    disabled={isExporting}
                    style={{
                      opacity: isExporting ? 0.6 : 1,
                      cursor: isExporting ? "not-allowed" : "pointer",
                      height: 26,
                      padding: "0 10px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      background: "#fff",
                      color: "#334155",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                    onClick={() => setExportOpen(prev => !prev)}
                  >
                    Export ▾
                  </button>

                  {exportOpen && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        marginTop: 4,
                        background: "#fff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                        zIndex: 100,
                        minWidth: 150,
                        overflow: "hidden",
                      }}
                    >
                      <button type="button"
                        onClick={() => {
                          setExportOpen(false);
                          if (typeof onExport === "function") onExport("excel");
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 12px",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: "0.74rem",
                          fontWeight: 500,
                          color: "#1e293b",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                      >
                        Export Excel (.xlsx)
                      </button>
                      <button type="button"
                        onClick={() => {
                          setExportOpen(false);
                          if (typeof onExport === "function") onExport("pdf");
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 12px",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          fontSize: "0.74rem",
                          fontWeight: 500,
                          color: "#1e293b",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                      >
                        Export PDF (.pdf)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SectionHeader = ({ children }) => (
    <div style={styles.sectionHeader}>{children}</div>
  );

  // ============================================================
  // FILTER FIELD
  // ============================================================

  const FilterField = ({
    label,
    value,
    options = [],
    onChange,
    date = false,
    minWidth = 110,
  }) => {
    const uniqueOptions = [];
    const seen = new Set();
    options.forEach(opt => {
      const lbl = typeof opt === 'object' ? opt.label : opt;
      const val = typeof opt === 'object' ? opt.value : opt;
      if (!seen.has(lbl)) {
        seen.add(lbl);
        uniqueOptions.push({ value: val, label: lbl });
      }
    });

    return (
      <div style={{ ...styles.filterField, minWidth }}>
        <label style={styles.filterLabel}>{label}</label>

        {date || label === "Reporting Currency" || label === "Currency" ? (
          <div style={styles.selectWrapper}>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={styles.select}
            >
              {uniqueOptions.map((opt, __idx) => (
                <option key={`${opt.value}-${__idx}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ ...styles.selectWrapper, border: "none", background: "transparent", padding: 0 }}>
            <MultiSelectDropdown 
              options={uniqueOptions.filter(o => o.value !== "All")} 
              value={Array.isArray(value) ? value : (value === "All" ? [] : [value])} 
              onChange={(valArr) => onChange(valArr)} 
              placeholder="All"
              label={label}
            />
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // DERIVED TOTALS
  // ============================================================

  const agingTotal = useMemo(() => {
    return mockData.aging.reduce(
      (sum, item) => sum + (Number(item.value) || 0),
      0
    );
  }, [mockData.aging]);

  const parentDivTotal = useMemo(() => {
    return (mockData.divisions || []).reduce(
      (sum, item) => sum + (Number(item.value) || 0),
      0
    );
  }, [mockData.divisions]);

  const locationTotal = useMemo(() => {
    return (mockData.locations || []).reduce(
      (sum, item) => sum + (Number(item.value) || 0),
      0
    );
  }, [mockData.locations]);

  const detailTotalRows = mockData.details.length;
  const detailTotalPages = Math.max(1, Math.ceil(detailTotalRows / detailPageSize));
  const paginatedDetails = useMemo(() => {
    return mockData.details.slice(detailPage * detailPageSize, (detailPage + 1) * detailPageSize);
  }, [mockData.details, detailPage, detailPageSize]);

  if (loading) {
      return (
        <div style={{ padding: 60, textAlign: "center", fontSize: "0.95rem", color: "#64748b", fontWeight: 600 }}>
          Loading Inventory Data...
        </div>
      );
  }

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
            Track inventory position, movement and aging across all dimensions
            <br />
            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 4, fontWeight: 600, color: '#334155' }}>
              As On Date: {filters.asOnDate && filters.asOnDate !== "All" ? filters.asOnDate : "Latest Snapshot"}
            </span>
            &nbsp;|&nbsp;
            <span style={{ color: '#16a34a', fontWeight: 700 }}>
              Currency: {filters.currency || "AED"}
            </span>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button type="button"
            id="btn-export-excel-inventory"
              disabled={isExporting}
              onClick={() => handleExport('excel')}
            title="Export to Excel"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              height: 32, padding: '0 12px',
              background: '#f0fdf4', color: '#15803d',
              border: '1px solid #bbf7d0', borderRadius: 7,
              fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            📊 Excel
          </button>
          <button type="button"
            id="btn-export-pdf-inventory"
              disabled={isExporting}
              onClick={() => handleExport('pdf')}
            title="Export to PDF"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              height: 32, padding: '0 12px',
              background: '#fff1f2', color: '#be123c',
              border: '1px solid #fecdd3', borderRadius: 7,
              fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            📄 PDF
          </button>
          <button type="button"
            onClick={() => window.location.reload()}
            title="Refresh"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32,
              background: '#fff', color: '#64748b',
              border: '1px solid #cbd5e1', borderRadius: 7,
              fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            ↻
          </button>
        </div>
      </div>

      {/* ========================================================
          FILTERS
      ======================================================== */}

      <div style={styles.filterPanel}>
        <FilterField
          label="Legal Group"
          value={filters.legalGroup}
          options={mockData.filters.legalGroups}
          onChange={(value) => updateFilter("legalGroup", value)}
          minWidth={115}
        />

        <FilterField
          label="Legal Entity"
          value={filters.legalEntity}
          options={mockData.filters.legalEntities}
          onChange={(value) => updateFilter("legalEntity", value)}
          minWidth={115}
        />

        <FilterField
          label="Parent Division"
          value={filters.parentDivision}
          options={mockData.filters.parentDivisions}
          onChange={(value) => updateFilter("parentDivision", value)}
          minWidth={115}
        />

        <FilterField
          label="Sub-Division"
          value={filters.subdivision}
          options={mockData.filters.subdivisions}
          onChange={(value) => updateFilter("subdivision", value)}
          minWidth={115}
        />

        <FilterField
          label="Subinventory"
          value={filters.subinventory}
          options={mockData.filters.subinventories}
          onChange={(value) => updateFilter("subinventory", value)}
          minWidth={105}
        />

        <FilterField
          label="Reporting Currency"
          value={filters.currency}
          options={mockData.filters.currencies}
          onChange={(value) => updateFilter("currency", value)}
          minWidth={85}
        />

        <FilterField
          label="As On Date"
          value={filters.asOnDate}
          options={mockData.filters.dates}
          onChange={(value) => updateFilter("asOnDate", value)}
          date
          minWidth={115}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-end', flexShrink: 0, paddingBottom: 1 }}>
          <button type="button" style={styles.applyButton} onClick={() => loadData()}>
            Apply
          </button>

          <button type="button" style={styles.resetButton} onClick={resetFilters}>
            Clear
          </button>
        </div>
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
        <div style={{ ...styles.panel, display: "flex", flexDirection: "column" }}>
          <CardHeader isExporting={isExporting}
            title={`Inventory Value Trend (${filters.currency || "AED"} Cr)`}
            subtitle="Current Year vs Previous Year month-by-month trajectory"
            info="Comparison of inventory value trend"
            onViewAll={() => setViewAllModal("trend")}
            onExport={(type) => handleExport(type || "excel", "trend")}
          />

          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: "#2563eb" }} />
              CY 2024
            </div>

            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: "#16a34a" }} />
              PY 2023
            </div>
          </div>

          <div style={{ ...styles.lineChartContainer, flex: 1 }}>
            <LineChart />
          </div>
        </div>

        {/* Parent Division */}
        <div style={{ ...styles.panel, display: "flex", flexDirection: "column" }}>
          <CardHeader isExporting={isExporting}
            title={`Inventory Value by Parent Division (${filters.currency || "AED"} Cr)`}
            subtitle={parentDivViewMode === "mom" ? `Month on Month distribution across parent divisions (${filters.currency || "AED"} Cr)` : `Distribution across parent divisions (${filters.currency || "AED"} Cr)`}
            info="Breakdown across key parent divisions"
            extra={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button type="button"
                  onClick={() => setParentDivViewMode("month")}
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: parentDivViewMode === "month" ? "#fff" : "#475569",
                    background: parentDivViewMode === "month" ? "#2563eb" : "#f1f5f9",
                    border: parentDivViewMode === "month" ? "1px solid #2563eb" : "1px solid #cbd5e1",
                    borderRadius: 5,
                    padding: "3px 10px",
                    cursor: "pointer",
                    boxShadow: parentDivViewMode === "month" ? "0 1px 2px rgba(37,99,235,0.25)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  Month
                </button>

                <div
                  onClick={() => setParentDivViewMode(prev => prev === "mom" ? "month" : "mom")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}
                  title="Toggle Month on Month comparison"
                >
                  <div
                    style={{
                      width: 32,
                      height: 18,
                      borderRadius: 10,
                      background: parentDivViewMode === "mom" ? "#2563eb" : "#cbd5e1",
                      padding: 2,
                      position: "relative",
                      transition: "background 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: 2,
                        left: parentDivViewMode === "mom" ? 16 : 2,
                        transition: "left 0.2s",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: parentDivViewMode === "mom" ? "#1e3a8a" : "#475569" }}>
                    Month on Month
                  </span>
                </div>
              </div>
            }
            onViewAll={() => setViewAllModal("parentDivision")}
            onExport={(type) => handleExport(type || "excel", "parent-divisions")}
          />

          <div style={styles.donutRow}>
            <DonutChart
              data={mockData.divisions}
              total={parentDivTotal.toFixed(2)}
              centerText={`${parentDivTotal.toFixed(2)} Cr`}
              centerSubText="Total"
              size={120}
              strokeWidth={18}
            />

            <div style={styles.legendList}>
              {mockData.divisions.map((item) => (
                <div key={item.name} style={styles.legendListRow}>
                  <div style={styles.legendName} title={item.name}>
                    <span style={{ ...styles.legendCircle, background: item.color, flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name}
                    </span>
                  </div>

                  <div style={styles.legendValue}>
                    {item.value.toFixed(2)} ({item.percentage.toFixed(2)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-division */}
        <div style={{ ...styles.panel, display: "flex", flexDirection: "column" }}>
          <CardHeader isExporting={isExporting}
            title={`Inventory Value by Sub-division (${filters.currency || "AED"} Cr)`}
            subtitle={`Sub-division inventory comparison (${filters.currency || "AED"} Cr)`}
            info="Sub-division holdings ranked by value"
            onViewAll={() => setViewAllModal("subdivision")}
            onExport={(type) => handleExport(type || "excel")}
          />

          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <SubdivisionChart />
          </div>
        </div>
      </div>

      {/* ========================================================
          SECOND ROW
      ======================================================== */}

      <div style={styles.bottomGrid}>
        {/* AGING */}
        <div style={{ ...styles.panel, display: "flex", flexDirection: "column" }}>
          <CardHeader isExporting={isExporting}
            title="Inventory Aging Summary"
            subtitle={`Aging distribution across 8 duration buckets (${filters.currency || "AED"} Cr)`}
            info="Summary of inventory value by aging bucket"
            onViewAll={() => setViewAllModal("aging")}
            onExport={(type) => handleExport(type || "excel")}
          />

          <div style={styles.agingContent}>
            <DonutChart
              data={mockData.aging}
              total={agingTotal.toFixed(2)}
              centerText={`${agingTotal.toFixed(2)} Cr`}
              centerSubText={filters.currency || "AED"}
              size={120}
              strokeWidth={18}
            />

            <div style={styles.agingTable}>
              <div style={styles.agingHeader}>
                <span>Bucket</span>
                <span style={{ textAlign: "right" }}>Amount (Cr)</span>
                <span style={{ textAlign: "right" }}>% Total</span>
              </div>

              {mockData.aging.map((item) => (
                <div key={item.name} style={styles.agingRow}>
                  <div style={styles.agingName} title={item.name}>
                    <span
                      style={{
                        ...styles.legendCircle,
                        background: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>
                  </div>

                  <div style={{ textAlign: "right", fontWeight: 600, color: "#1e293b" }}>
                    {item.value.toFixed(2)}
                  </div>

                  <div style={{ textAlign: "right", color: "#64748b", fontWeight: 500 }}>
                    {typeof item.percentage === "number" ? `${item.percentage.toFixed(2)}%` : item.percentage}
                  </div>
                </div>
              ))}

              <div style={styles.agingTotalRow}>
                <div style={{ fontWeight: 800, color: "#1e3a8a", display: "flex", alignItems: "center", gap: 6 }}>
                  Total
                </div>
                <div style={{ textAlign: "right", fontWeight: 800, color: "#1e293b" }}>
                  {agingTotal.toFixed(2)}
                </div>
                <div style={{ textAlign: "right", fontWeight: 800, color: "#1e293b" }}>
                  100.0%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLOW MOVING */}
        <div style={{ ...styles.panel, display: "flex", flexDirection: "column" }}>
          <CardHeader isExporting={isExporting}
            title="Slow Moving Stock by Parent Div"
            subtitle={`Obsolete inventory vs total stock (${filters.currency || "AED"} Cr)`}
            info="Parent divisions with highest obsolete inventory holdings"
            onViewAll={() => setViewAllModal("slowMoving")}
            onExport={(type) => handleExport(type || "excel", "slow-moving")}
          />
          
          <div style={{ ...styles.tableWrapper, flex: 1 }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: 28 }}>#</th>
                  <th>PARENT DIV</th>
                  <th style={{ textAlign: 'right' }}>OBSOLETE ({filters.currency || "AED"} Cr)</th>
                  <th style={{ textAlign: 'right' }}>TOTAL ({filters.currency || "AED"} Cr)</th>
                  <th style={{ textAlign: 'right' }}>% OBSOLETE</th>
                </tr>
              </thead>
              <tbody>
                {mockData.slowMoving.map((item, idx) => (
                  <tr key={item.no || idx}>
                    <td style={{ color: "#64748b", fontWeight: 600 }}>{item.no}</td>
                    <td>
                      <div style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        fontWeight: 600,
                        color: "#1e293b",
                      }}>
                        {item.parentDiv}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: "#e11d48" }}>{item.obsolete ? item.obsolete.toFixed(2) : "--"}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.total ? item.total.toFixed(2) : "--"}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: item.percentage > 50 ? "#dc2626" : "#e11d48" }}>{item.percentage ? `${item.percentage.toFixed(2)}%` : "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LOCATION */}
        <div style={{ ...styles.panel, display: "flex", flexDirection: "column" }}>
          <CardHeader isExporting={isExporting}
            title="Inventory by Location (Top 5)"
            subtitle={`Top holding locations by value (${filters.currency || "AED"} Cr)`}
            info="Top locations with highest inventory values"
            onViewAll={() => setViewAllModal("location")}
            onExport={(type) => handleExport(type || "excel")}
          />

          <div style={{ ...styles.tableWrapper, flex: 1, display: "flex", flexDirection: "column" }}>
            {mockData.locations.length === 0 ? (
              <div style={{ padding: "30px 0", textAlign: "center", color: "#94a3b8", fontSize: "0.74rem" }}>
                No location data available
              </div>
            ) : (
              <table style={{ ...styles.table, flex: 1 }}>
                <thead>
                  <tr>
                    <th>Location</th>
                    <th style={{ textAlign: 'right' }}>Value ({filters.currency || "AED"} Cr)</th>
                    <th style={{ textAlign: 'right' }}>% of Total</th>
                  </tr>
                </thead>

                <tbody>
                  {mockData.locations.map((row, idx) => (
                    <tr key={`${row.name}-${idx}`}>
                      <td style={{ fontWeight: 600, color: "#1e293b" }}>{row.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{row.value.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', color: "#64748b" }}>{row.percentage ? `${row.percentage.toFixed(2)}%` : "—"}</td>
                    </tr>
                  ))}

                  <tr style={{ height: "100%" }}><td colSpan={3}></td></tr>
                  <tr style={styles.totalRow}>
                    <td style={{ fontWeight: 800, color: "#1e3a8a" }}>Total</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: "#1e293b" }}>{locationTotal.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: "#1e293b" }}>
                      {mockData.locations.reduce((s, r) => s + (r.percentage || 0), 0).toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          DETAILED VIEW
      ======================================================== */}

      <div style={styles.detailPanel}>
        <CardHeader isExporting={isExporting}
          title="Inventory Detailed View"
          subtitle={`Line-item inventory breakdown and aging status (${filters.currency || "AED"})`}
          info="Detailed item-level inventory valuation and aging buckets"
          onViewAll={() => setViewAllModal("details")}
          onExport={(type) => handleExport(type || "excel")}
        />

        <div style={styles.detailTableWrapper} className="detail-table-scroll">
          <table style={styles.detailTable} className="detail-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left", width: 125, minWidth: 115 }}>Legal Entity</th>
                <th style={{ textAlign: "left", width: 110, minWidth: 100 }}>Parent Division</th>
                <th style={{ textAlign: "left", width: 110, minWidth: 100 }}>Sub-Division</th>
                <th style={{ textAlign: "left", width: 70, minWidth: 65 }}>Subinventory</th>
                <th style={{ textAlign: "left", width: 95, minWidth: 85 }}>Item Code</th>
                <th style={{ textAlign: "left", width: 145, minWidth: 135 }}>Item Description</th>
                <th style={{ textAlign: "right", width: 75, minWidth: 70 }}>Total Qty</th>
                <th style={{ textAlign: "right", width: 75, minWidth: 70 }}>Value ({filters.currency || "AED"})</th>
                <th style={{ textAlign: "right", width: 50, minWidth: 46 }}>0 - 30</th>
                <th style={{ textAlign: "right", width: 50, minWidth: 46 }}>31 - 60</th>
                <th style={{ textAlign: "right", width: 50, minWidth: 46 }}>61 - 90</th>
                <th style={{ textAlign: "right", width: 50, minWidth: 46 }}>91 - 120</th>
                <th style={{ textAlign: "right", width: 54, minWidth: 50 }}>121 - 180</th>
                <th style={{ textAlign: "right", width: 54, minWidth: 50 }}>181 - 365</th>
                <th style={{ textAlign: "right", width: 54, minWidth: 50 }}>366 - 730</th>
                <th style={{ textAlign: "right", width: 48, minWidth: 45 }}>&gt; 730</th>
                <th style={{ textAlign: "right", width: 45, minWidth: 40 }}>Days</th>
                <th style={{ textAlign: "right", width: 68, minWidth: 62 }}>Avg Value</th>
              </tr>
            </thead>

            <tbody>
              {paginatedDetails.map((row) => (
                <tr key={row.id}>
                  <td style={{ textAlign: "left", verticalAlign: "middle" }}>
                    <div style={{
                      whiteSpace: "normal",
                      wordBreak: "normal",
                      overflowWrap: "break-word",
                      lineHeight: 1.35,
                      fontWeight: 600,
                      color: "#1e293b",
                    }} title={row.legal_entity}>
                      {row.legal_entity}
                    </div>
                  </td>
                  <td style={{ textAlign: "left", verticalAlign: "middle" }}>
                    <div style={{
                      whiteSpace: "normal",
                      wordBreak: "normal",
                      overflowWrap: "break-word",
                      lineHeight: 1.35,
                      color: "#334155",
                    }} title={row.parent_division}>
                      {row.parent_division}
                    </div>
                  </td>
                  <td style={{ textAlign: "left", verticalAlign: "middle" }}>
                    <div style={{
                      whiteSpace: "normal",
                      wordBreak: "normal",
                      overflowWrap: "break-word",
                      lineHeight: 1.35,
                      color: "#334155",
                    }} title={row.subdivision}>
                      {row.subdivision}
                    </div>
                  </td>
                  <td style={{ textAlign: "left", verticalAlign: "middle" }}>
                    <div style={{
                      whiteSpace: "nowrap",
                      color: "#475569",
                    }} title={row.subinventory}>
                      {row.subinventory}
                    </div>
                  </td>
                  <td style={{ textAlign: "left", verticalAlign: "middle" }}>
                    <div style={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      lineHeight: 1.35,
                      fontWeight: 600,
                      color: "#1e3a8a",
                    }} title={row.item_code}>
                      {row.item_code}
                    </div>
                  </td>
                  <td style={{ textAlign: "left", verticalAlign: "middle" }}>
                    <div
                      style={{
                        whiteSpace: "normal",
                        wordBreak: "normal",
                        overflowWrap: "break-word",
                        lineHeight: 1.35,
                        color: "#334155",
                      }}
                      title={row.item_description}
                    >
                      {row.item_description}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                    {row.quantity ? Number(row.quantity).toLocaleString() : "0"}
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "#1e293b" }}>
                    {row.total_stock_value
                      ? (Number(row.total_stock_value) / 10000000).toFixed(2)
                      : "0.00"}
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {row.aging_0_30 ? (Number(row.aging_0_30) / 10000000).toFixed(2) : "0.00"}
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {row.aging_31_60 ? (Number(row.aging_31_60) / 10000000).toFixed(2) : "0.00"}
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {row.aging_61_90 ? (Number(row.aging_61_90) / 10000000).toFixed(2) : "0.00"}
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {row.aging_91_120 ? (Number(row.aging_91_120) / 10000000).toFixed(2) : "0.00"}
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {row.aging_121_180 ? (Number(row.aging_121_180) / 10000000).toFixed(2) : "0.00"}
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {row.aging_181_365 ? (Number(row.aging_181_365) / 10000000).toFixed(2) : "0.00"}
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {row.aging_366_730 ? (Number(row.aging_366_730) / 10000000).toFixed(2) : "0.00"}
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {row.aging_above_730 ? (Number(row.aging_above_730) / 10000000).toFixed(2) : "0.00"}
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap" }}>{row.days || "-"}</td>
                  <td style={{ textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {typeof row.avg_inv_value === "number"
                      ? (row.avg_inv_value / 10000000).toFixed(2)
                      : (row.avg_inv_value || "-")}
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              {mockData.details.length > 0 && (() => {
                const totals = mockData.details.reduce((acc, row) => {
                  acc.qty += Number(row.quantity || 0);
                  acc.totalVal += Number(row.total_stock_value || 0);
                  acc.d30 += Number(row.aging_0_30 || 0);
                  acc.d60 += Number(row.aging_31_60 || 0);
                  acc.d90 += Number(row.aging_61_90 || 0);
                  acc.d120 += Number(row.aging_91_120 || 0);
                  acc.d180 += Number(row.aging_121_180 || 0);
                  acc.d365 += Number(row.aging_181_365 || 0);
                  acc.d730 += Number(row.aging_366_730 || 0);
                  acc.dAbove730 += Number(row.aging_above_730 || 0);
                  return acc;
                }, { qty: 0, totalVal: 0, d30: 0, d60: 0, d90: 0, d120: 0, d180: 0, d365: 0, d730: 0, dAbove730: 0 });

                return (
                  <tr style={styles.detailTotalRow}>
                    <td style={{ textAlign: "left", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap" }}>Total</td>
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                    <td style={{ textAlign: "right", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {totals.qty.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {(totals.totalVal / 10000000).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {(totals.d30 / 10000000).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {(totals.d60 / 10000000).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {(totals.d90 / 10000000).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {(totals.d120 / 10000000).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {(totals.d180 / 10000000).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {(totals.d365 / 10000000).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {(totals.d730 / 10000000).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                      {(totals.dAbove730 / 10000000).toFixed(2)}
                    </td>
                    <td />
                    <td />
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar - Matching Sales Revenue by Parent Division — View Details */}
        <div style={{
          padding: "10px 18px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f8fafc",
          flexWrap: "wrap",
          gap: 8,
          borderRadius: "0 0 10px 10px",
        }}>
          <div style={{ fontSize: "0.76rem", color: "#64748b", fontWeight: 500 }}>
            {detailTotalRows > 0
              ? `Showing ${detailPage * detailPageSize + 1}–${Math.min((detailPage + 1) * detailPageSize, detailTotalRows)} of ${detailTotalRows} records`
              : "No records"}
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 6 }}>
              <span style={{ fontSize: "0.74rem", color: "#64748b" }}>Rows per page:</span>
              <select
                value={detailPageSize}
                onChange={(e) => {
                  setDetailPageSize(Number(e.target.value));
                  setDetailPage(0);
                }}
                style={{
                  padding: "3px 6px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  fontSize: "0.74rem",
                  color: "#334155",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button type="button"
              onClick={() => setDetailPage(p => Math.max(0, p - 1))}
              disabled={detailPage === 0}
              style={{
                padding: "5px 12px",
                borderRadius: 7,
                border: "1px solid #cbd5e1",
                background: detailPage === 0 ? "#f1f5f9" : "#fff",
                color: detailPage === 0 ? "#94a3b8" : "#1e293b",
                fontSize: "0.74rem",
                fontWeight: 600,
                cursor: detailPage === 0 ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "#1e293b", minWidth: 40, textAlign: "center" }}>
              {detailTotalRows > 0 ? detailPage + 1 : 0} / {detailTotalPages}
            </span>
            <button type="button"
              onClick={() => setDetailPage(p => Math.min(detailTotalPages - 1, p + 1))}
              disabled={detailPage >= detailTotalPages - 1}
              style={{
                padding: "5px 12px",
                borderRadius: 7,
                border: "1px solid #cbd5e1",
                background: detailPage >= detailTotalPages - 1 ? "#f1f5f9" : "#fff",
                color: detailPage >= detailTotalPages - 1 ? "#94a3b8" : "#1e293b",
                fontSize: "0.74rem",
                fontWeight: 600,
                cursor: detailPage >= detailTotalPages - 1 ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <div style={styles.footer}>
        <div>
          All values are in {filters.currency || "AED"} (Cr) &nbsp; | &nbsp; Data as on {filters.asOnDate && filters.asOnDate !== "All" ? filters.asOnDate : "Latest Available"}
        </div>

        <div style={styles.source}>
          <span style={{ fontSize: 16 }}>☁</span>
          Source: Oracle Fusion Cloud
        </div>
      </div>

      {/* ========================================================
      {/* ========================================================
          VIEW ALL MODAL (All Cards)
      ======================================================== */}
      {viewAllModal && (() => {
        const modalConfig = (() => {
          switch (viewAllModal) {
            case "trend":
              return {
                title: `Inventory Value Trend — View Details`,
                subtitle: `Current Year vs Previous Year month-by-month trajectory (${filters.currency || "AED"} Cr)`,
                searchPlaceholder: "Search months...",
                section: "trend",
                maxWidth: 840,
              };
            case "parentDivision":
              return {
                title: `Inventory Value by Parent Division — View Details`,
                subtitle: `Breakdown across all parent divisions (${filters.currency || "AED"} Cr)`,
                searchPlaceholder: "Search parent divisions...",
                section: "parent-divisions",
                maxWidth: 750,
              };
            case "subdivision":
              return {
                title: `Inventory Value by Sub-division — View Details`,
                subtitle: `Breakdown across all sub-divisions (${filters.currency || "AED"} Cr)`,
                searchPlaceholder: "Search sub-divisions...",
                section: null,
                maxWidth: 750,
              };
            case "aging":
              return {
                title: `Inventory Aging Summary — View Details`,
                subtitle: `Aging distribution across 8 duration buckets (${filters.currency || "AED"} Cr)`,
                searchPlaceholder: "Search aging buckets...",
                section: null,
                maxWidth: 750,
              };
            case "slowMoving":
              return {
                title: `Slow Moving Stock by Parent Div — View Details`,
                subtitle: `Obsolete inventory vs total stock (${filters.currency || "AED"} Cr)`,
                searchPlaceholder: "Search parent divisions...",
                section: "slow-moving",
                maxWidth: 860,
              };
            case "location":
              return {
                title: `Inventory by Location — View Details`,
                subtitle: `Holding locations ranked by value (${filters.currency || "AED"} Cr)`,
                searchPlaceholder: "Search locations...",
                section: null,
                maxWidth: 750,
              };
            case "details":
              return {
                title: `Inventory Detailed View — View Details`,
                subtitle: `Line-item inventory breakdown and aging status (${filters.currency || "AED"})`,
                searchPlaceholder: "Search item code, description, legal entity...",
                section: null,
                maxWidth: "96vw",
              };
            default:
              return {
                title: "View Details",
                subtitle: "",
                searchPlaceholder: "Search...",
                section: null,
                maxWidth: 750,
              };
          }
        })();

        return (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(2px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 20,
            }}
            onClick={() => {
              setViewAllModal(null);
              setViewAllSearch("");
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                width: "100%",
                maxWidth: modalConfig.maxWidth,
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "linear-gradient(90deg, #f8fafc, #fff)",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                    {modalConfig.title}
                  </h3>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                    {modalConfig.subtitle}
                  </div>
                </div>
                <button type="button"
                  onClick={() => {
                    setViewAllModal(null);
                    setViewAllSearch("");
                  }}
                  style={{
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#64748b",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    outline: "none",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Search & Export Bar */}
              <div
                style={{
                  padding: "10px 20px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  background: "#fafbfc",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder={modalConfig.searchPlaceholder}
                  value={viewAllSearch}
                  onChange={(e) => setViewAllSearch(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: "0.76rem",
                    width: viewAllModal === "details" ? 320 : 240,
                    outline: "none",
                  }}
                />

                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button"
                      disabled={isExporting}
                      onClick={() => handleExport("excel", modalConfig.section)}
                      style={{ opacity: isExporting ? 0.6 : 1, cursor: isExporting ? "not-allowed" : "pointer", 
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      color: "#166534",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Export Excel (.xlsx)
                  </button>
                  <button type="button"
                      disabled={isExporting}
                      onClick={() => handleExport("pdf", modalConfig.section)}
                      style={{ opacity: isExporting ? 0.6 : 1, cursor: isExporting ? "not-allowed" : "pointer", 
                      padding: "5px 12px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      color: "#991b1b",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Export PDF (.pdf)
                  </button>
                </div>
              </div>

              {/* Modal Table Content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
                {(() => {
                  if (viewAllModal === "trend") {
                    const rawList = mockData.trend?.list?.length ? mockData.trend.list : (
                      (mockData.trend?.labels || []).map((lbl, idx) => {
                        const curr = mockData.trend?.current?.[idx] || 0;
                        const prev = mockData.trend?.previous?.[idx];
                        const variance = prev !== null && prev !== undefined ? curr - prev : null;
                        const growth = prev ? ((curr - prev) / prev) * 100 : null;
                        return { month: lbl, current: curr, previous: prev, variance, growth };
                      })
                    );
                    const filtered = (rawList || []).filter(item =>
                      !viewAllSearch || item.month?.toLowerCase().includes(viewAllSearch.toLowerCase())
                    );
                    const totalCurr = filtered.reduce((s, r) => s + (Number(r.current) || 0), 0);
                    const prevItems = filtered.filter(r => r.previous !== null && r.previous !== undefined);
                    const totalPrev = prevItems.reduce((s, r) => s + (Number(r.previous) || 0), 0);
                    const totalVar = prevItems.length > 0 ? totalCurr - totalPrev : null;
                    const avgGrowth = totalPrev > 0 ? ((totalCurr - totalPrev) / totalPrev) * 100 : null;

                    return (
                      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 40 }}>#</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700 }}>Month</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700 }}>Current Year ({filters.currency || "AED"} Cr)</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700 }}>Previous Year ({filters.currency || "AED"} Cr)</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700 }}>Variance ({filters.currency || "AED"} Cr)</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700 }}>Growth %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No trend data found</td></tr>
                          ) : (
                            filtered.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                <td style={{ padding: "8px 10px", color: "#64748b" }}>{idx + 1}</td>
                                <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1e293b" }}>{item.month}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#2563eb" }}>{Number(item.current || 0).toFixed(2)}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 500, color: "#16a34a" }}>
                                  {item.previous !== null && item.previous !== undefined ? Number(item.previous).toFixed(2) : "—"}
                                </td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: item.variance === null ? "#64748b" : item.variance >= 0 ? "#16a34a" : "#dc2626" }}>
                                  {item.variance !== null ? `${item.variance >= 0 ? "+" : ""}${Number(item.variance).toFixed(2)}` : "—"}
                                </td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: item.growth === null ? "#64748b" : item.growth >= 0 ? "#16a34a" : "#dc2626" }}>
                                  {item.growth !== null ? `${item.growth >= 0 ? "+" : ""}${Number(item.growth).toFixed(2)}%` : "—"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {filtered.length > 0 && (
                          <tfoot>
                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                              <td style={{ padding: "10px 10px" }} />
                              <td style={{ padding: "10px 10px", color: "#1e3a8a" }}>Total</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#2563eb" }}>{totalCurr.toFixed(2)}</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#16a34a" }}>{prevItems.length > 0 ? totalPrev.toFixed(2) : "—"}</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: totalVar === null ? "#1e293b" : totalVar >= 0 ? "#16a34a" : "#dc2626" }}>
                                {totalVar !== null ? `${totalVar >= 0 ? "+" : ""}${totalVar.toFixed(2)}` : "—"}
                              </td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: avgGrowth === null ? "#1e293b" : avgGrowth >= 0 ? "#16a34a" : "#dc2626" }}>
                                {avgGrowth !== null ? `${avgGrowth >= 0 ? "+" : ""}${avgGrowth.toFixed(2)}%` : "—"}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    );
                  }

                  if (viewAllModal === "parentDivision" || viewAllModal === "subdivision") {
                    const rawList = viewAllModal === "parentDivision"
                      ? (mockData.allDivisions?.length ? mockData.allDivisions : mockData.divisions)
                      : (mockData.allSubdivisions?.length ? mockData.allSubdivisions : mockData.bySubdivision);
                    
                    const filtered = (rawList || []).filter(item =>
                      !viewAllSearch || item.name?.toLowerCase().includes(viewAllSearch.toLowerCase())
                    );

                    const totalVal = filtered.reduce((s, r) => s + (Number(r.value) || 0), 0);
                    const totalPct = filtered.reduce((s, r) => s + (Number(r.percentage) || 0), 0);

                    return (
                      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 40 }}>#</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700 }}>
                              {viewAllModal === "parentDivision" ? "Parent Division" : "Sub-Division"}
                            </th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 150 }}>
                              Value ({filters.currency || "AED"} Cr)
                            </th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 110 }}>
                              % of Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No divisions found</td></tr>
                          ) : (
                            filtered.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                <td style={{ padding: "8px 10px", color: "#64748b" }}>{idx + 1}</td>
                                <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1e293b" }}>{item.name}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{Number(item.value || 0).toFixed(2)}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", color: "#475569", fontWeight: 500 }}>{Number(item.percentage || 0).toFixed(2)}%</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {filtered.length > 0 && (
                          <tfoot>
                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                              <td style={{ padding: "10px 10px" }} />
                              <td style={{ padding: "10px 10px", color: "#1e3a8a" }}>Total</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>{totalVal.toFixed(2)}</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>{totalPct.toFixed(2)}%</td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    );
                  }

                  if (viewAllModal === "aging") {
                    const rawList = mockData.aging || [];
                    const filtered = (rawList || []).filter(item =>
                      !viewAllSearch || item.name?.toLowerCase().includes(viewAllSearch.toLowerCase())
                    );
                    const totalVal = filtered.reduce((s, r) => s + (Number(r.value) || 0), 0);
                    const totalPct = filtered.reduce((s, r) => s + (Number(r.percentage) || 0), 0);

                    return (
                      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 40 }}>#</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700 }}>Aging Bucket</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 160 }}>Amount ({filters.currency || "AED"} Cr)</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 120 }}>% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No aging data found</td></tr>
                          ) : (
                            filtered.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                <td style={{ padding: "8px 10px", color: "#64748b" }}>{idx + 1}</td>
                                <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color || "#64748b", display: "inline-block", flexShrink: 0 }} />
                                  {item.name}
                                </td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{Number(item.value || 0).toFixed(2)}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", color: "#475569", fontWeight: 500 }}>{Number(item.percentage || 0).toFixed(2)}%</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {filtered.length > 0 && (
                          <tfoot>
                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                              <td style={{ padding: "10px 10px" }} />
                              <td style={{ padding: "10px 10px", color: "#1e3a8a" }}>Total</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>{totalVal.toFixed(2)}</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>{totalPct.toFixed(2)}%</td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    );
                  }

                  if (viewAllModal === "slowMoving") {
                    const rawList = mockData.allSlowMoving?.length ? mockData.allSlowMoving : (mockData.slowMoving || []);
                    const filtered = (rawList || []).filter(item =>
                      !viewAllSearch || item.parentDiv?.toLowerCase().includes(viewAllSearch.toLowerCase())
                    );
                    const totalObs = filtered.reduce((s, r) => s + (Number(r.obsolete) || 0), 0);
                    const totalStock = filtered.reduce((s, r) => s + (Number(r.total) || 0), 0);
                    const totalPct = totalStock > 0 ? (totalObs / totalStock) * 100 : 0;

                    return (
                      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 40 }}>#</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700 }}>Parent Division</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 160 }}>Obsolete ({filters.currency || "AED"} Cr)</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 160 }}>Total ({filters.currency || "AED"} Cr)</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 110 }}>% Obsolete</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No records found</td></tr>
                          ) : (
                            filtered.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                <td style={{ padding: "8px 10px", color: "#64748b" }}>{idx + 1}</td>
                                <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1e293b" }}>{item.parentDiv}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#e11d48" }}>{item.obsolete ? Number(item.obsolete).toFixed(2) : "0.00"}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{item.total ? Number(item.total).toFixed(2) : "0.00"}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: item.percentage > 50 ? "#dc2626" : "#e11d48" }}>
                                  {item.percentage ? `${Number(item.percentage).toFixed(2)}%` : "0.00%"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {filtered.length > 0 && (
                          <tfoot>
                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                              <td style={{ padding: "10px 10px" }} />
                              <td style={{ padding: "10px 10px", color: "#1e3a8a" }}>Total</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#e11d48" }}>{totalObs.toFixed(2)}</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>{totalStock.toFixed(2)}</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: totalPct > 50 ? "#dc2626" : "#e11d48" }}>{totalPct.toFixed(2)}%</td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    );
                  }

                  if (viewAllModal === "location") {
                    const rawList = mockData.allLocations?.length ? mockData.allLocations : (mockData.locations || []);
                    const filtered = (rawList || []).filter(item =>
                      !viewAllSearch || item.name?.toLowerCase().includes(viewAllSearch.toLowerCase())
                    );
                    const totalVal = filtered.reduce((s, r) => s + (Number(r.value) || 0), 0);
                    const totalPct = filtered.reduce((s, r) => s + (Number(r.percentage) || 0), 0);

                    return (
                      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 40 }}>#</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700 }}>Location</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 160 }}>Value ({filters.currency || "AED"} Cr)</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 120 }}>% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No location data found</td></tr>
                          ) : (
                            filtered.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                <td style={{ padding: "8px 10px", color: "#64748b" }}>{idx + 1}</td>
                                <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1e293b" }}>{item.name}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{Number(item.value || 0).toFixed(2)}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", color: "#475569", fontWeight: 500 }}>{Number(item.percentage || 0).toFixed(2)}%</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {filtered.length > 0 && (
                          <tfoot>
                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                              <td style={{ padding: "10px 10px" }} />
                              <td style={{ padding: "10px 10px", color: "#1e3a8a" }}>Total</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>{totalVal.toFixed(2)}</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>{totalPct.toFixed(2)}%</td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    );
                  }

                  if (viewAllModal === "details") {
                    const rawList = mockData.details || [];
                    const filtered = rawList.filter(row => {
                      if (!viewAllSearch) return true;
                      const q = viewAllSearch.toLowerCase();
                      return (
                        (row.legal_entity || "").toLowerCase().includes(q) ||
                        (row.parent_division || "").toLowerCase().includes(q) ||
                        (row.subdivision || "").toLowerCase().includes(q) ||
                        (row.subinventory || "").toLowerCase().includes(q) ||
                        (row.item_code || "").toLowerCase().includes(q) ||
                        (row.item_description || "").toLowerCase().includes(q)
                      );
                    });

                    const totalItems = filtered.length;
                    const totalPages = Math.max(1, Math.ceil(totalItems / modalDetailPageSize));
                    
                    // Reset page if out of bounds due to search
                    const currentPage = Math.min(modalDetailPage, totalPages - 1);
                    if (currentPage !== modalDetailPage) setModalDetailPage(currentPage);

                    const startIndex = currentPage * modalDetailPageSize;
                    const paginated = filtered.slice(startIndex, startIndex + modalDetailPageSize);

                    const totalQty = filtered.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
                    const totalVal = filtered.reduce((s, r) => s + (Number(r.total_stock_value) || 0), 0);

                    return (
                      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                        <div style={{ overflowX: "auto", width: "100%", maxHeight: "60vh" }} className="detail-table-scroll">
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.80rem" }}>
                            <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#f8fafc" }}>
                              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 110, minWidth: 110 }}>Legal Entity</th>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 100, minWidth: 100 }}>Parent Division</th>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 100, minWidth: 100 }}>Sub-Division</th>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, minWidth: 80 }}>Subinventory</th>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, minWidth: 90 }}>Item Code</th>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 160, minWidth: 160 }}>Item Description</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 70 }}>Qty</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 90 }}>Value ({filters.currency || "AED"})</th>
                                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 50 }}>0-30</th>
                                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 50 }}>31-60</th>
                                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 50 }}>61-90</th>
                                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 50 }}>91-120</th>
                                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 55 }}>121-180</th>
                                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 55 }}>181-365</th>
                                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 55 }}>366-730</th>
                                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 50 }}>&gt;730</th>
                                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 45 }}>Days</th>
                                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, minWidth: 70 }}>Avg Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginated.length === 0 ? (
                                <tr><td colSpan={18} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No inventory records found</td></tr>
                              ) : (
                                paginated.map((row, idx) => (
                                  <tr key={row.id || idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                    <td style={{ padding: "6px 10px", fontWeight: 600, color: "#1e293b", maxWidth: 110, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.35 }}>{row.legal_entity}</td>
                                    <td style={{ padding: "6px 10px", color: "#334155", maxWidth: 100, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.35 }}>{row.parent_division}</td>
                                    <td style={{ padding: "6px 10px", color: "#334155", maxWidth: 100, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.35 }}>{row.subdivision}</td>
                                    <td style={{ padding: "6px 10px", color: "#475569" }}>{row.subinventory}</td>
                                    <td style={{ padding: "6px 10px", fontFamily: "monospace", color: "#1e3a8a", fontWeight: 600 }}>{row.item_code}</td>
                                    <td style={{ padding: "6px 10px", color: "#334155", maxWidth: 160, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.35 }}>{row.item_description}</td>
                                    <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 600 }}>{Number(row.quantity || 0).toLocaleString()}</td>
                                    <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>{Number(row.total_stock_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td style={{ padding: "6px 6px", textAlign: "right" }}>{Number(row.aging_0_30 || 0).toFixed(0)}</td>
                                    <td style={{ padding: "6px 6px", textAlign: "right" }}>{Number(row.aging_31_60 || 0).toFixed(0)}</td>
                                    <td style={{ padding: "6px 6px", textAlign: "right" }}>{Number(row.aging_61_90 || 0).toFixed(0)}</td>
                                    <td style={{ padding: "6px 6px", textAlign: "right" }}>{Number(row.aging_91_120 || 0).toFixed(0)}</td>
                                    <td style={{ padding: "6px 6px", textAlign: "right" }}>{Number(row.aging_121_180 || 0).toFixed(0)}</td>
                                    <td style={{ padding: "6px 6px", textAlign: "right" }}>{Number(row.aging_181_365 || 0).toFixed(0)}</td>
                                    <td style={{ padding: "6px 6px", textAlign: "right" }}>{Number(row.aging_366_730 || 0).toFixed(0)}</td>
                                    <td style={{ padding: "6px 6px", textAlign: "right" }}>{Number(row.aging_above_730 || 0).toFixed(0)}</td>
                                    <td style={{ padding: "6px 6px", textAlign: "right", fontWeight: 600 }}>{row.days}</td>
                                    <td style={{ padding: "6px 6px", textAlign: "right" }}>{row.avg_inv_value !== "-" ? Number(row.avg_inv_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                            {filtered.length > 0 && (
                              <tfoot style={{ position: "sticky", bottom: 0, zIndex: 10, background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                                <tr style={{ fontWeight: 800 }}>
                                  <td colSpan={6} style={{ padding: "10px 10px", color: "#1e3a8a" }}>Total ({filtered.length} items)</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>{totalQty.toLocaleString()}</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>{totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                  <td colSpan={10} style={{ padding: "10px 10px" }} />
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                        {totalPages > 1 && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", borderTop: "1px solid #e2e8f0", background: "#fff", fontSize: "0.76rem" }}>
                            <div style={{ color: "#64748b" }}>
                              Showing {startIndex + 1} to {Math.min(startIndex + modalDetailPageSize, totalItems)} of {totalItems} entries
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button type="button"
                                onClick={() => setModalDetailPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #cbd5e1", background: currentPage === 0 ? "#f1f5f9" : "#fff", color: currentPage === 0 ? "#94a3b8" : "#334155", cursor: currentPage === 0 ? "not-allowed" : "pointer" }}
                              >
                                Prev
                              </button>
                              <span style={{ fontWeight: 600, color: "#1e293b", padding: "0 4px" }}>
                                Page {currentPage + 1} of {totalPages}
                              </span>
                              <button type="button"
                                onClick={() => setModalDetailPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage === totalPages - 1}
                                style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #cbd5e1", background: currentPage === totalPages - 1 ? "#f1f5f9" : "#fff", color: currentPage === totalPages - 1 ? "#94a3b8" : "#334155", cursor: currentPage === totalPages - 1 ? "not-allowed" : "pointer" }}
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: "10px 20px",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#f8fafc",
                }}
              >
                <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                  Live inventory snapshot data
                </span>
                <button type="button"
                  onClick={() => {
                    setViewAllModal(null);
                    setViewAllSearch("");
                  }}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#334155",
                    fontSize: "0.74rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ================================================================
// INLINE CSS - Standardized to BalanceSheet & SalesRevenueReport
// ================================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "20px 24px 32px",
    boxSizing: "border-box",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#1e293b",
    fontSize: "0.78rem",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 16,
    flexWrap: "wrap",
  },

  pageTitle: {
    margin: 0,
    fontSize: "1.45rem",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#1e293b",
    letterSpacing: "-0.02em",
  },

  subtitle: {
    marginTop: 4,
    color: "#64748b",
    fontSize: "0.78rem",
    lineHeight: 1.5,
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  filterPanel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "10px 14px",
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    flexWrap: "wrap",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    marginBottom: 16,
  },

  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: 105,
    flex: "1 1 105px",
  },

  filterLabel: {
    display: "block",
    fontSize: "0.66rem",
    color: "#1e3a8a",
    marginBottom: 3,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    whiteSpace: "nowrap",
  },

  selectWrapper: {
    position: "relative",
    width: "100%",
  },

  select: {
    width: "100%",
    height: 32,
    border: "1px solid #cbd5e1",
    borderRadius: 7,
    padding: "0 28px 0 9px",
    fontSize: "0.76rem",
    fontWeight: 500,
    color: "#334155",
    background: "#fff",
    outline: "none",
    appearance: "none",
    cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    boxSizing: "border-box",
  },

  applyButton: {
    height: 32,
    padding: "0 16px",
    border: "none",
    borderRadius: 7,
    background: "#2563eb",
    color: "#fff",
    fontSize: "0.78rem",
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  },

  resetButton: {
    height: 32,
    padding: "0 8px",
    border: "none",
    background: "transparent",
    color: "#dc2626",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 16,
  },

  kpiCard: {
    minWidth: 0,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "12px 14px 8px",
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  kpiTop: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },

  kpiIcon: {
    flex: "0 0 38px",
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  kpiTitle: {
    fontSize: "0.75rem",
    lineHeight: 1.25,
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  kpiValue: {
    color: "#1e293b",
    fontSize: "1.25rem",
    lineHeight: 1.3,
    fontWeight: 800,
    marginTop: 2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    letterSpacing: "-0.02em",
  },

  kpiVariance: {
    fontSize: "0.70rem",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    marginTop: 3,
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 16,
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 16,
  },

  panel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "12px 14px",
    minWidth: 0,
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
  },

  legend: {
    display: "flex",
    justifyContent: "center",
    gap: 18,
    marginBottom: 6,
    fontSize: "0.72rem",
    color: "#64748b",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 500,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },

  lineChartContainer: {
    width: "100%",
    height: 180,
  },

  donutRow: {
    minHeight: 180,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 10,
    flex: 1,
  },

  donutWrapper: {
    width: 120,
    height: 120,
    flex: "0 0 120px",
  },

  legendList: {
    flex: 1,
    minWidth: 0,
  },

  legendListRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "4px 0",
    borderBottom: "1px solid #f8fafc",
    fontSize: "0.72rem",
  },

  legendName: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#334155",
    whiteSpace: "nowrap",
    fontWeight: 500,
  },

  legendCircle: {
    width: 8,
    height: 8,
    minWidth: 8,
    borderRadius: "50%",
    display: "inline-block",
  },

  legendValue: {
    color: "#1e293b",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  agingContent: {
    display: "flex",
    alignItems: "stretch",
    gap: 12,
    flex: 1,
    height: "100%",
    padding: "2px 0",
  },

  agingTable: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    fontSize: "0.72rem",
  },

  agingHeader: {
    display: "grid",
    gridTemplateColumns: "minmax(110px, 1fr) 56px 44px",
    gap: 6,
    color: "#1e3a8a",
    fontWeight: 700,
    fontSize: "0.70rem",
    padding: "4px 6px 5px",
    borderBottom: "2px solid #e2e8f0",
    background: "#f8fafc",
    borderRadius: "4px 4px 0 0",
  },

  agingRow: {
    display: "grid",
    gridTemplateColumns: "minmax(110px, 1fr) 56px 44px",
    gap: 6,
    alignItems: "center",
    padding: "3.5px 6px",
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
    fontSize: "0.72rem",
  },

  agingName: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
    fontWeight: 500,
  },

  agingTotalRow: {
    display: "grid",
    gridTemplateColumns: "minmax(110px, 1fr) 56px 44px",
    gap: 6,
    alignItems: "center",
    padding: "4px 6px",
    borderTop: "2px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: "0.72rem",
    borderRadius: "0 0 4px 4px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.74rem",
    color: "#334155",
  },

  totalRow: {
    fontWeight: 800,
    background: "#f8fafc",
    borderTop: "2px solid #e2e8f0",
    color: "#1e3a8a",
  },

  detailPanel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "12px 14px 14px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    overflow: "hidden",
  },

  detailTableWrapper: {
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: 6,
    scrollbarWidth: "auto",
    scrollbarColor: "#cbd5e1 #f1f5f9",
  },

  detailTable: {
    width: "100%",
    minWidth: 1200,
    borderCollapse: "collapse",
    fontSize: "0.82rem",
    color: "#334155",
    tableLayout: "auto",
  },

  detailTotalRow: {
    background: "#f8fafc",
    color: "#1e3a8a",
    fontWeight: 800,
    borderTop: "2px solid #e2e8f0",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 4px 0",
    color: "#64748b",
    fontSize: "0.72rem",
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
// Standardized to BalanceSheet & SalesRevenueReport tokens
// ================================================================

if (
  typeof document !== "undefined" &&
  !document.getElementById("inventory-overview-table-css")
) {
  const style = document.createElement("style");

  style.id = "inventory-overview-table-css";

  style.innerHTML = `
    table th {
      background: #f8fafc;
      color: #1e3a8a;
      font-weight: 700;
      white-space: nowrap;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 2px solid #e2e8f0;
      font-size: 0.72rem;
    }

    table td {
      padding: 6px 10px;
      border-bottom: 1px solid #f1f5f9;
      white-space: nowrap;
      font-size: 0.74rem;
      color: #334155;
    }

    table tbody tr:hover {
      background: #f8fafc;
    }

    /* Enhanced, Thick Horizontal Scrollbar matching BalanceSheet and SalesRevenue */
    .detail-table-scroll::-webkit-scrollbar {
      height: 10px !important;
      width: 10px !important;
    }

    .detail-table-scroll::-webkit-scrollbar-track {
      background: #f1f5f9 !important;
      border-radius: 6px !important;
    }

    .detail-table-scroll::-webkit-scrollbar-thumb {
      background: #cbd5e1 !important;
      border-radius: 6px !important;
      border: 2px solid #f1f5f9 !important;
    }

    .detail-table-scroll::-webkit-scrollbar-thumb:hover {
      background: #64748b !important;
    }

    /* Enhanced Detail Table Styling for high legibility */
    table.detail-table th {
      padding: 9px 7px !important;
      font-size: 0.81rem !important;
      letter-spacing: -0.01em !important;
      color: #1e3a8a !important;
      font-weight: 700 !important;
      vertical-align: middle !important;
    }

    table.detail-table td {
      padding: 9px 7px !important;
      font-size: 0.82rem !important;
      letter-spacing: -0.01em !important;
      color: #1e293b !important;
      line-height: 1.35 !important;
      vertical-align: middle !important;
      white-space: normal !important;
    }

    select:focus {
      border-color: #2563eb !important;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, .12);
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
