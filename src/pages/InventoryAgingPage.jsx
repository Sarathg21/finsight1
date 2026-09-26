/* ================================================================
   DATE FORMAT HELPERS
   ================================================================ */
function formatDisplayDateGlobal(d) {
  if (!d || d === "All") return "Selected Date";
  const str = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, day] = str.split('-');
    return `${day}-${m}-${y}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    return str;
  }
  return str;
}

function getRawDateForInputGlobal(d) {
  if (!d || d === "All") return "";
  const str = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [day, m, y] = str.split('-');
    return `${y}-${m}-${day}`;
  }
  return "";
}

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import MultiSelectDropdown from "../components/Filters/MultiSelectDropdown";
import { Coins, BarChart3, RotateCw, Calendar, AlertTriangle, Info, ChevronDown } from "lucide-react";
import { getInventoryFilters, getInventoryDashboard, getInventoryDetails, getInventoryExport, getInventoryMonthOnMonth, getInventoryDivisionWise } from "../api/inventoryApi";
import { toast } from "react-hot-toast";


/* ================================================================
   DATE FILTER
   ================================================================ */
function DateFilter({ value, onChange, minWidth = 110 }) {
    const dateInputRef = React.useRef(null);
    const openCalendar = () => {
        if (dateInputRef.current) {
            if (typeof dateInputRef.current.showPicker === "function") {
                dateInputRef.current.showPicker();
            } else {
                dateInputRef.current.click();
            }
        }
    };
    const handleDateChange = (event) => {
        const selectedDate = event.target.value;
        if (!selectedDate) return;
        onChange(selectedDate);
    };
    const formatDisplayDate = (d) => {
        if (!d || d === "All") return "Selected Date";
        const parts = d.split("-");
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        return d;
    };

    return (
        <div style={{ flex: "1 1 0", minWidth: 120, position: "relative" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#173b8f", marginBottom: 6, lineHeight: "12px", whiteSpace: "nowrap" }}>
                As On Date
            </label>
            <input
                ref={dateInputRef}
                type="date"
                value={value || ""}
                onChange={handleDateChange}
                style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
            />
            <button
                type="button"
                onClick={openCalendar}
                style={{
                    width: "100%", height: 34, boxSizing: "border-box", border: "1px solid #dce3ee",
                    borderRadius: 9, padding: "0 34px 0 11px", background: "#f4f7fb", color: "#173b8f",
                    fontSize: 12, fontWeight: 600, outline: "none", cursor: "pointer", textAlign: "left", position: "relative",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}
                title={value && value !== "All" ? value : "Selected Date"}
            >
                {formatDisplayDate(value)}
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", height: "100%" }}>📅</span>
            </button>
        </div>
    );
}

export default function InventoryOverview() {
  // ============================================================
  // API STATE & LOGIC
  // ============================================================


  const handleExport = async (type, section = null, customFilters = null) => {
    setIsExporting(true);
    const toastId = toast.loading(`Exporting ${section || 'data'}...`);
    try {
      const activeF = customFilters || filters;
      let formattedDate = null;
      if (activeF.asOnDate && activeF.asOnDate !== "All" && activeF.asOnDate !== "") {
        const raw = String(activeF.asOnDate).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) formattedDate = raw;
        else if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
          const [d, m, y] = raw.split('-');
          formattedDate = `${y}-${m}-${d}`;
        } else {
          const d = new Date(raw);
          if (!isNaN(d.getTime())) {
            formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          }
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
      
      if (getApiVal(activeF.legalGroup)) apiFilters.legal_group_id = getApiVal(activeF.legalGroup);
      if (getApiVal(activeF.legalEntity)) apiFilters.legal_entity_id = getApiVal(activeF.legalEntity);
      if (getApiVal(activeF.parentDivision)) apiFilters.parent_division_id = getApiVal(activeF.parentDivision);
      if (getApiVal(activeF.subdivision)) apiFilters.subdivision_id = getApiVal(activeF.subdivision);
      if (getApiVal(activeF.subinventory)) apiFilters.subinventory_id = getApiVal(activeF.subinventory);
      
      if (activeF.currency && activeF.currency !== "All") apiFilters.reporting_currency = activeF.currency;
      if (formattedDate) apiFilters.as_on_date = formattedDate;

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
    } finally {
      setIsExporting(false);
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
  const [hoveredAgingSegment, setHoveredAgingSegment] = useState(null);
  const [hoveredParentDivSegment, setHoveredParentDivSegment] = useState(null);
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState(null);
  const [viewAllModal, setViewAllModal] = useState(null); // "trend" | "parentDivision" | "subdivision" | "aging" | "slowMoving" | "location" | "details" | null
  const [viewAllSearch, setViewAllSearch] = useState("");
  const [viewAllData, setViewAllData] = useState([]);
  const [viewAllLoading, setViewAllLoading] = useState(false);
  const [momData, setMomData] = useState([]);
  const [momLoading, setMomLoading] = useState(false);


  const [modalDetailPage, setModalDetailPage] = useState(0);
  const [modalDetailPageSize, setModalDetailPageSize] = useState(15);
  const [modalDetailsFilters, setModalDetailsFilters] = useState({
    legalEntity: ['All'],
    parentDivision: ['All'],
    subdivision: ['All'],
    subinventory: ['All'],
    asOnDate: 'All',
  });
  const [modalApiItems, setModalApiItems] = useState(null);
  const [modalDetailsLoading, setModalDetailsLoading] = useState(false);
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
    details: [],
    turnoverDioTrend: { labels: [], turnover: [], dio: [] },
    reporting_currency: "AED",
    dataAsOf: null
  });

  

  const currentCurrency = (filters.currency && filters.currency !== "All") ? filters.currency : (mockData.reporting_currency || "AED");

  const fmtAED = (v) => {
      if (v === null || v === undefined) return "-";
      const n = Number(v);
      if (isNaN(n)) return "-";
      const cur = currentCurrency;
      if (Math.abs(n) >= 1_000_000_000) return `${cur} ${(n / 1_000_000_000).toFixed(2)}B`;
      if (Math.abs(n) >= 1_000_000) return `${cur} ${(n / 1_000_000).toFixed(2)}M`;
      if (Math.abs(n) >= 1_000) return `${cur} ${(n / 1_000).toFixed(2)}K`;
      return `${cur} ${n.toFixed(2)}`;
  };

  const loadData = useCallback(async () => {
      setLoading(true);
      try {
          // Robust date formatting without timezone shifts
          let formattedDate = null;
          if (filters.asOnDate && filters.asOnDate !== "All" && filters.asOnDate !== "") {
              const raw = String(filters.asOnDate).trim();
              if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                  formattedDate = raw;
              } else if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
                  const [d, m, y] = raw.split('-');
                  formattedDate = `${y}-${m}-${d}`;
              } else {
                  const d = new Date(raw);
                  if (!isNaN(d.getTime())) {
                      const year = d.getFullYear();
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      formattedDate = `${year}-${month}-${day}`;
                  }
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
          
          if (filters.currency && filters.currency !== "All") apiFilters.reporting_currency = filters.currency;
          if (formattedDate) apiFilters.as_on_date = formattedDate;

          // Pass all active filters to Inventory Details API request
          const detailsApiFilters = {
              ...apiFilters,
              page: 1,
              limit: 500,
              page_size: 500,
          };

          const [filterRes, dashRes, detailsRes, momRes, divWiseRes] = await Promise.all([
              getInventoryFilters(apiFilters).catch(() => ({ data: {} })),
              getInventoryDashboard(apiFilters).catch(() => ({ data: {} })),
              getInventoryDetails(detailsApiFilters).catch(() => ({ data: { items: [] } })),
              getInventoryMonthOnMonth(apiFilters).catch(() => ({ data: { items: [] } })),
              getInventoryDivisionWise({ ...apiFilters, limit: 500 }).catch(() => ({ data: { items: [] } }))
          ]);
          setMomData(momRes.data?.items || []);
          
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
                            titleColor: "#2563eb",
                            cardBg: "#f0f5ff",
                            value: fmtAED(dData.kpis.total_inventory),
                            icon: Coins,
                            iconBg: "#dbeafe",
                            variance: dData.kpis.total_inventory_variance || null,
                            varianceLabel: dData.kpis.variance_label || null,
                            direction: "up",
                        },
                        {
                            key: "avg_inv",
                            title: "Average Inventory Value",
                            titleColor: "#8b5cf6",
                            cardBg: "#f5f3ff",
                            value: fmtAED(dData.kpis.average_inventory || dData.kpis.average_inventory_value),
                            subtitle: dData.kpis.average_inventory_months_used ? `${dData.kpis.average_inventory_months_used} Month${Number(dData.kpis.average_inventory_months_used) === 1 ? '' : 's'} used` : "12 Months used",
                            icon: BarChart3,
                            iconBg: "#ede9fe",
                            variance: dData.kpis.average_inventory_variance || null,
                            varianceLabel: dData.kpis.variance_label || null,
                            direction: "up",
                        },
                        {
                            key: "turnover",
                            title: "Inventory Turnover",
                            subtitle: (dData.kpis.turnover_basis && !dData.kpis.turnover_basis.includes("INSUFFICIENT") && !dData.kpis.turnover_basis.includes("_"))
                                ? dData.kpis.turnover_basis
                                : (dData.kpis.inventory_turnover !== null && dData.kpis.inventory_turnover !== undefined ? "TTM" : null),
                            titleColor: "#ea580c",
                            cardBg: "#fff7ed",
                            value: (dData.kpis.inventory_turnover !== null && dData.kpis.inventory_turnover !== undefined) ? `${Number(dData.kpis.inventory_turnover).toFixed(2)} Times` : "N/A",
                            icon: RotateCw,
                            iconBg: "#ffedd5",
                            variance: dData.kpis.turnover_variance || null,
                            varianceLabel: dData.kpis.variance_label || null,
                            direction: "down",
                        },
                        {
                            key: "dio",
                            title: "Stock Holding Days (DIO)",
                            titleColor: "#16a34a",
                            cardBg: "#f0fdf4",
                            value: (dData.kpis.dio_days !== null && dData.kpis.dio_days !== undefined) ? `${Number(dData.kpis.dio_days).toFixed(0)} Days` : "N/A",
                            icon: Calendar,
                            iconBg: "#dcfce7",
                            variance: dData.kpis.dio_days_variance || null,
                            varianceLabel: dData.kpis.variance_label || null,
                            direction: "down",
                        },
                        {
                            key: "obsolete",
                            title: "Obsolete / Slow Moving Stock",
                            subtitle: "(> 365 Days)",
                            titleColor: "#dc2626",
                            cardBg: "#fef2f2",
                            value: fmtAED(dData.kpis.inventory_above_365),
                            icon: AlertTriangle,
                            iconBg: "#fee2e2",
                            variance: dData.kpis.obsolete_variance || null,
                            varianceLabel: dData.kpis.variance_label || null,
                            direction: "up",
                            arrowColor: "#dc2626",
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
              const rawDivs = (divWiseRes?.data?.items && divWiseRes.data.items.length > 0)
                  ? divWiseRes.data.items
                  : (dData.by_parent_division || []);

              if (rawDivs.length > 0) {
                  const colors = ["#2563eb", "#16a34a", "#f59e0b", "#7c3aed", "#ec4899", "#0891b2"];
                  allDivisions = rawDivs.map((item, idx) => ({
                      ...item,
                      name: typeof item.label === 'object' ? (item.label?.name || item.label?.code) : (item.parent_division_name || item.label || item.name),
                      parent_division_name: typeof item.label === 'object' ? (item.label?.name || item.label?.code) : (item.parent_division_name || item.label || item.name),
                      value: Number(item.inventory_value || item.total_cost_value || item.value || 0) / 10000000,
                      percentage: Number(item.percentage_of_total || 0),
                      color: colors[idx % colors.length]
                  })).sort((a,b) => b.value - a.value);

                  if (allDivisions.length > 5) {
                      const top4 = allDivisions.slice(0, 4);
                      const others = allDivisions.slice(4);
                      const otherVal = others.reduce((s, r) => s + r.value, 0);
                      const otherPct = others.reduce((s, r) => s + r.percentage, 0);
                      divisions = [
                          ...top4,
                          { name: "Others", value: otherVal, percentage: otherPct, color: "#94a3b8" }
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
              let turnoverDioTrend = { labels: [], turnover: [], dio: [] };
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

                  turnoverDioTrend.labels = trend.labels;
                  turnoverDioTrend.turnover = dData.trend.map(item =>
                      item.inventory_turnover !== undefined && item.inventory_turnover !== null
                          ? Number(item.inventory_turnover)
                          : (item.turnover !== undefined && item.turnover !== null ? Number(item.turnover) : (dData.kpis?.inventory_turnover ? Number(dData.kpis.inventory_turnover) : 0))
                  );
                  turnoverDioTrend.dio = dData.trend.map(item =>
                      item.dio_days !== undefined && item.dio_days !== null
                          ? Number(item.dio_days)
                          : (item.dio !== undefined && item.dio !== null ? Number(item.dio) : (dData.kpis?.dio_days ? Number(dData.kpis.dio_days) : 0))
                  );
              } else if (momData && Array.isArray(momData) && momData.length > 0) {
                  turnoverDioTrend.labels = momData.map(item => item.month || item.month_start || "");
                  turnoverDioTrend.turnover = momData.map(item => Number(item.inventory_turnover || item.turnover || 0));
                  turnoverDioTrend.dio = momData.map(item => Number(item.dio_days || item.dio || 0));
              }

              let allSlowMoving = [];
              let slowMoving = [];
              const slowSource = dData.slow_moving_items || dData.top_items || dData.slow_moving_by_parent_div;
              if (slowSource && Array.isArray(slowSource) && slowSource.length > 0) {
                  allSlowMoving = slowSource.map((item, idx) => ({
                      no: idx + 1,
                      desc: item.item_description || item.description || item.parent_division_name || (typeof item.parent_division === 'object' ? item.parent_division?.name : item.parent_division) || "-",
                      code: item.item_code || item.code || "-",
                      qty: item.quantity !== undefined && item.quantity !== null ? Number(item.quantity).toLocaleString() : "-",
                      value: Number(item.obsolete_stock || item.inventory_value || item.total_stock_value || item.value || 0) / 10000000,
                      days: item.dio !== undefined && item.dio !== null ? Number(item.dio) : (item.days !== undefined && item.days !== null ? Number(item.days) : (item.percentage_obsolete ? `${Number(item.percentage_obsolete).toFixed(1)}%` : "-"))
                  }));
                  slowMoving = allSlowMoving.slice(0, 5);
              } else if (details && details.length > 0) {
                  slowMoving = [...details]
                      .sort((a, b) => (Number(b.days) || 0) - (Number(a.days) || 0) || (b.total_stock_value - a.total_stock_value))
                      .slice(0, 5)
                      .map((item, idx) => ({
                          no: idx + 1,
                          desc: item.item_description,
                          code: item.item_code,
                          qty: Number(item.quantity || 0).toLocaleString(),
                          value: Number(item.total_stock_value || 0) / 10000000,
                          days: item.days
                      }));
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
                      legal_entity_id: item.legal_entity_id !== undefined ? String(item.legal_entity_id) : (typeof item.legal_entity === 'object' ? String(item.legal_entity?.id || '') : ''),
                      parent_division: item.parent_division_name || (typeof item.parent_division === 'object' ? item.parent_division?.name : item.parent_division) || "-",
                      parent_division_id: item.parent_division_id !== undefined ? String(item.parent_division_id) : (typeof item.parent_division === 'object' ? String(item.parent_division?.id || '') : ''),
                      subdivision: item.subdivision_name || (typeof item.subdivision === 'object' ? item.subdivision?.name : item.subdivision) || "-",
                      subdivision_id: item.subdivision_id !== undefined ? String(item.subdivision_id) : (typeof item.subdivision === 'object' ? String(item.subdivision?.id || '') : ''),
                      subinventory: item.subinventory_name || item.subinventory || item.business_unit || "-",
                      subinventory_id: item.subinventory_id !== undefined ? String(item.subinventory_id) : (typeof item.subinventory === 'object' ? String(item.subinventory?.id || '') : ''),
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

              const dedupeOptions = (arr) => {
                const seen = new Set();
                const list = [];
                (arr || []).forEach(x => {
                  if (!x) return;
                  const val = x.id !== undefined ? x.id : (x.value !== undefined ? x.value : x);
                  const lbl = x.name !== undefined ? x.name : (x.label !== undefined ? x.label : (typeof x === 'string' ? x : val));
                  const strLbl = typeof lbl === 'object' ? String(lbl?.name || lbl?.label || val || '') : String(lbl || '');
                  const key = strLbl.trim().toLowerCase();
                  if (!key || key === 'all') return;
                  if (!seen.has(key)) {
                    seen.add(key);
                    list.push({ value: val || strLbl, label: strLbl });
                  }
                });
                return [{ value: "All", label: "All" }, ...list];
              };

              setMockData({
                  filters: {
                      legalGroups: dedupeOptions(fData.legal_groups),
                      legalEntities: dedupeOptions(fData.legal_entities),
                      parentDivisions: dedupeOptions(fData.parent_divisions),
                      subdivisions: dedupeOptions(fData.subdivisions),
                      subinventories: dedupeOptions(fData.subinventories),
                      currencies: (fData.currencies || []).map(x => ({ value: x.id || x.value || x, label: x.name || x.label || x })),
                      dates: [{value: "All", label: "All"}, ...(fData.as_on_dates || []).map(x => ({ value: x, label: x }))],
                  },
                  kpis,
                  trend,
                  turnoverDioTrend,
                  divisions,
                  allDivisions,
                  bySubdivision,
                  allSubdivisions,
                  aging,
                  slowMoving,
                  allSlowMoving,
                  locations,
                  allLocations,
                  details,
                  reporting_currency: dData.reporting_currency || dData.currency || filters.currency || "AED",
                  dataAsOf: dData.data_as_of || dData.dataAsOf || fData.data_as_of || null
              });
          } catch (err) {
              console.error(err);
          } finally {
              setLoading(false);
          }
  }, [filters]);

  useEffect(() => {
      loadData();
  }, [loadData]);
  // Sync modalDetailsFilters when viewAllModal opens
  useEffect(() => {
    if (viewAllModal === "details") {
      setModalDetailsFilters({
        legalEntity: filters.legalEntity && filters.legalEntity.length > 0 ? filters.legalEntity : ['All'],
        parentDivision: filters.parentDivision && filters.parentDivision.length > 0 ? filters.parentDivision : ['All'],
        subdivision: filters.subdivision && filters.subdivision.length > 0 ? filters.subdivision : ['All'],
        subinventory: filters.subinventory && filters.subinventory.length > 0 ? filters.subinventory : ['All'],
        asOnDate: filters.asOnDate || 'All',
      });
      setModalDetailPage(0);
      setModalApiItems(null);
    }
  }, [viewAllModal]);

  // Fetch updated records for modal when modalDetailsFilters change
  useEffect(() => {
    if (viewAllModal !== "details") return;
    let isMounted = true;
    const fetchDetailsForModal = async () => {
      setModalDetailsLoading(true);
      try {
        let formattedDate = null;
        if (modalDetailsFilters.asOnDate && modalDetailsFilters.asOnDate !== "All" && modalDetailsFilters.asOnDate !== "") {
          const raw = String(modalDetailsFilters.asOnDate).trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) formattedDate = raw;
          else if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
            const [d, m, y] = raw.split('-');
            formattedDate = `${y}-${m}-${d}`;
          } else {
            const d = new Date(raw);
            if (!isNaN(d.getTime())) {
              formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
          }
        }
        const apiFilters = {
          page: 1,
          page_size: 500,
          limit: 500,
        };
        const getApiVal = (val) => {
          if (!val || val === "All") return null;
          if (Array.isArray(val)) {
            const c = val.filter(v => v !== "All");
            return c.length > 0 ? c : null;
          }
          return [val];
        };
        if (getApiVal(filters.legalGroup)) apiFilters.legal_group_id = getApiVal(filters.legalGroup);
        if (getApiVal(modalDetailsFilters.legalEntity)) apiFilters.legal_entity_id = getApiVal(modalDetailsFilters.legalEntity);
        if (getApiVal(modalDetailsFilters.parentDivision)) apiFilters.parent_division_id = getApiVal(modalDetailsFilters.parentDivision);
        if (getApiVal(modalDetailsFilters.subdivision)) apiFilters.subdivision_id = getApiVal(modalDetailsFilters.subdivision);
        if (getApiVal(modalDetailsFilters.subinventory)) apiFilters.subinventory_id = getApiVal(modalDetailsFilters.subinventory);
        if (filters.currency && filters.currency !== "All") apiFilters.reporting_currency = filters.currency;
        if (formattedDate) apiFilters.as_on_date = formattedDate;

        const res = await getInventoryDetails(apiFilters);
        if (isMounted && res.data?.items) {
          const mapped = res.data.items.map((item, idx) => ({
            id: `${item.legal_entity_name || item.legal_entity || 'le'}-${item.item_code || idx}-${idx}`,
            legal_entity: item.legal_entity_name || (typeof item.legal_entity === 'object' ? item.legal_entity?.name : item.legal_entity) || "-",
            legal_entity_id: item.legal_entity_id !== undefined ? String(item.legal_entity_id) : (typeof item.legal_entity === 'object' ? String(item.legal_entity?.id || '') : ''),
            parent_division: item.parent_division_name || (typeof item.parent_division === 'object' ? item.parent_division?.name : item.parent_division) || "-",
            parent_division_id: item.parent_division_id !== undefined ? String(item.parent_division_id) : (typeof item.parent_division === 'object' ? String(item.parent_division?.id || '') : ''),
            subdivision: item.subdivision_name || (typeof item.subdivision === 'object' ? item.subdivision?.name : item.subdivision) || "-",
            subdivision_id: item.subdivision_id !== undefined ? String(item.subdivision_id) : (typeof item.subdivision === 'object' ? String(item.subdivision?.id || '') : ''),
            subinventory: item.subinventory_name || item.subinventory || item.business_unit || "-",
            subinventory_id: item.subinventory_id !== undefined ? String(item.subinventory_id) : (typeof item.subinventory === 'object' ? String(item.subinventory?.id || '') : ''),
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
          setModalApiItems(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch modal details", err);
      } finally {
        if (isMounted) setModalDetailsLoading(false);
      }
    };
    fetchDetailsForModal();
    return () => { isMounted = false; };
  }, [viewAllModal, modalDetailsFilters]);


  // Modal data synchronization respecting dashboard filters
  useEffect(() => {
    if (!viewAllModal || viewAllModal === "details") return;
    let active = true;
    const fetchModalSection = async () => {
      setViewAllLoading(true);
      try {
        let formattedDate = null;
        if (filters.asOnDate && filters.asOnDate !== "All" && filters.asOnDate !== "") {
          const raw = String(filters.asOnDate).trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) formattedDate = raw;
          else if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
            const [d, m, y] = raw.split('-');
            formattedDate = `${y}-${m}-${d}`;
          } else {
            const d = new Date(raw);
            if (!isNaN(d.getTime())) {
              formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
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
        if (filters.currency && filters.currency !== "All") apiFilters.reporting_currency = filters.currency;
        if (formattedDate) apiFilters.as_on_date = formattedDate;

        let section = null;
        if (viewAllModal === "trend") section = "trend";
        else if (viewAllModal === "parentDivision") section = "parent-divisions";
        else if (viewAllModal === "slowMoving") section = "slow-moving";

        if (section) {
          const [res, divWiseRes] = await Promise.all([
            getInventoryDetails({ ...apiFilters, section }).catch(() => ({ data: {} })),
            viewAllModal === "parentDivision" ? getInventoryDivisionWise({ ...apiFilters, limit: 500 }).catch(() => ({ data: {} })) : Promise.resolve({ data: {} })
          ]);
          if (active) {
            const list = res.data?.rows || res.data?.items || (Array.isArray(res.data) ? res.data : []);
            const fallbackList = divWiseRes.data?.items || divWiseRes.data?.rows || [];
            const finalList = list.length > 0 ? list : fallbackList;
            if (finalList.length > 0) {
              setViewAllData(finalList);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load modal view all items", err);
      } finally {
        if (active) setViewAllLoading(false);
      }
    };
    fetchModalSection();
    return () => { active = false; };
  }, [viewAllModal, filters]);



  // ============================================================
  // FILTER STATE (Removed duplicated state, already defined above)

  // ============================================================

  

  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key, value) => {
    setDetailPage(0);
    setModalDetailPage(0);
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
    const hasVariance = item.variance !== null && item.variance !== undefined && item.variance !== "";
    const [hover, setHover] = useState(false);
    const accent = item.titleColor || "#2563eb";

    return (
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: item.cardBg || "#fff",
          borderRadius: 12,
          padding: "10px 12px",
          boxShadow: hover ? `0 8px 24px ${accent}20` : "none",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: hover ? "translateY(-2px)" : "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          overflow: "visible",
          position: "relative",
          minHeight: 74,
          boxSizing: "border-box",
        }}
      >
        {/* Left: Round Icon Circle */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: item.iconBg || "#dbeafe",
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {typeof item.icon === "string" ? (
            item.icon
          ) : (
            <item.icon size={18} strokeWidth={2.4} />
          )}
        </div>

        {/* Right: Vertical Text Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1, justifyContent: "center" }}>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: accent,
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            {item.title}
          </span>

          <div
            style={{
              fontSize: "1.05rem",
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.value || "-"}
          </div>

          {(hasVariance || item.subtitle) && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.62rem",
                fontWeight: 600,
                color: "#475569",
                marginTop: 2,
                padding: "2px 6px",
                background: "rgba(0,0,0,0.035)",
                borderRadius: 6,
                width: "fit-content",
                whiteSpace: "nowrap",
                lineHeight: 1.1,
              }}
            >
              {hasVariance && (
                <span
                  style={{
                    color: isPositive ? "#16a34a" : (item.arrowColor || "#dc2626"),
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {isPositive ? "▲" : "▼"} {item.variance}
                </span>
              )}
              {item.varianceLabel && <span>{item.varianceLabel}</span>}
              {!hasVariance && item.subtitle && <span>{item.subtitle}</span>}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // LINE CHART
  // ============================================================

  const LineChart = () => {
    const width = 540;
    const height = 245;
    const paddingLeft = 44;
    const paddingRight = 18;
    const paddingTop = 16;
    const paddingBottom = 30;

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

    const makeAreaPath = (values) => {
      if (values.length === 0) return "";
      const coords = values.map((val, idx) => getCoord(val, idx, values.length));
      let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
      for (let i = 1; i < coords.length; i++) {
        d += ` L ${coords[i].x.toFixed(1)} ${coords[i].y.toFixed(1)}`;
      }
      d += ` L ${coords[coords.length - 1].x.toFixed(1)} ${(paddingTop + plotHeight).toFixed(1)}`;
      d += ` L ${coords[0].x.toFixed(1)} ${(paddingTop + plotHeight).toFixed(1)} Z`;
      return d;
    };

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="cyAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
          </linearGradient>
        </defs>
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

        {/* CY Area Fill */}
        {cyValues.length > 1 && (
          <path d={makeAreaPath(cyValues)} fill="url(#cyAreaGrad)" />
        )}

        {/* Single-point callout badge when only 1 month exists */}
        {labels.length === 1 && cyValues.length > 0 && (
          <g>
            <line
              x1={getCoord(cyValues[0], 0, 1).x}
              x2={getCoord(cyValues[0], 0, 1).x}
              y1={paddingTop + 18}
              y2={getCoord(cyValues[0], 0, 1).y}
              stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7"
            />
            <rect
              x={getCoord(cyValues[0], 0, 1).x - 68}
              y={paddingTop + 6}
              width={136}
              height={30}
              rx={6}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              style={{ filter: "drop-shadow(0 3px 8px rgba(15,23,42,0.10))" }}
            />
            <text
              x={getCoord(cyValues[0], 0, 1).x}
              y={paddingTop + 25}
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="700"
              fill="#2563eb"
            >
              CY: {Number(cyValues[0]).toFixed(2)} {currentCurrency}
            </text>
          </g>
        )}

        {/* CY Line (Blue) */}
        {cyValues.length > 1 && (
          <polyline
            points={makePolylinePoints(cyValues)}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.4"
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
  // TURNOVER & DIO DUAL AXIS TREND CHART
  // ============================================================

  const TurnoverDioChart = () => {
    const width = 540;
    const height = 285;
    const paddingLeft = 46;
    const paddingRight = 48;
    const paddingTop = 18;
    const paddingBottom = 32;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    // Use real API data from mockData.turnoverDioTrend
    const trendData = mockData.turnoverDioTrend || { labels: [], turnover: [], dio: [] };
    const labels = trendData.labels || [];
    const turnoverValues = trendData.turnover || [];
    const dioValues = trendData.dio || [];

    if (labels.length === 0) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 170, color: "#94a3b8", fontSize: "0.75rem" }}>
          No turnover & DIO trend data available
        </div>
      );
    }

    // Short month labels (extract last part if "2025-01" style)
    const shortLabels = labels.map(l => {
      if (!l) return "";
      if (l.length <= 3) return l;
      const parts = String(l).split("-");
      if (parts.length >= 2) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mi = parseInt(parts[1], 10);
        return monthNames[mi - 1] || l;
      }
      return l.substring(0, 3);
    });

    // Dynamic axis ranges
    const allTurnover = turnoverValues.filter(v => typeof v === "number" && !isNaN(v));
    const allDio = dioValues.filter(v => typeof v === "number" && !isNaN(v));

    const rawMaxT = allTurnover.length ? Math.max(...allTurnover) : 10;
    const rawMaxD = allDio.length ? Math.max(...allDio) : 150;
    const maxTurnover = Math.max(1, Math.ceil(rawMaxT * 1.35));
    const maxDio = Math.max(30, Math.ceil(rawMaxD * 1.35));

    const turnoverTickCount = 6;
    const turnoverTicks = Array.from({ length: turnoverTickCount }, (_, i) => +(((maxTurnover / (turnoverTickCount - 1)) * i).toFixed(1)));
    const dioTicks = Array.from({ length: turnoverTickCount }, (_, i) => Math.round((maxDio / (turnoverTickCount - 1)) * i));

    const n = labels.length;
    const getX = (idx) => n > 1 ? paddingLeft + (idx / (n - 1)) * plotWidth : paddingLeft + plotWidth / 2;
    const getTY = (val) => paddingTop + plotHeight - (val / maxTurnover) * plotHeight;
    const getDY = (val) => paddingTop + plotHeight - (val / maxDio) * plotHeight;

    const turnoverPoints = turnoverValues.map((v, i) => `${getX(i).toFixed(1)},${getTY(v).toFixed(1)}`).join(" ");
    const dioPoints = dioValues.map((v, i) => `${getX(i).toFixed(1)},${getDY(v).toFixed(1)}`).join(" ");

    // Gradient area paths
    const makeAreaPath = (values, getYFn) => {
      if (values.length === 0) return "";
      let d = `M ${getX(0).toFixed(1)} ${getYFn(values[0]).toFixed(1)}`;
      for (let i = 1; i < values.length; i++) d += ` L ${getX(i).toFixed(1)} ${getYFn(values[i]).toFixed(1)}`;
      d += ` L ${getX(values.length - 1).toFixed(1)} ${(paddingTop + plotHeight).toFixed(1)}`;
      d += ` L ${getX(0).toFixed(1)} ${(paddingTop + plotHeight).toFixed(1)} Z`;
      return d;
    };

    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 6, fontSize: "0.70rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#ea580c", fontWeight: 700 }}>
            <span style={{ width: 10, height: 3, borderRadius: 2, background: "#ea580c" }} />
            Inventory Turnover (Times)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#2563eb", fontWeight: 700 }}>
            <span style={{ width: 10, height: 3, borderRadius: 2, background: "#2563eb" }} />
            DIO (Days)
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ display: "block", overflow: "visible" }}
          onMouseLeave={() => setHoveredTrendIdx(null)}
        >
          <defs>
            <linearGradient id="turnoverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="dioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Axis Titles */}
          <text x={-(height / 2)} y={14} transform="rotate(-90)" textAnchor="middle" fontSize="12" fontWeight="800" fill="#ea580c">
            Turnover (Times)
          </text>
          <text x={height / 2} y={-(width - 14)} transform="rotate(90)" textAnchor="middle" fontSize="12" fontWeight="800" fill="#2563eb">
            DIO (Days)
          </text>

          {/* Grid lines & Y axis ticks */}
          {turnoverTicks.map((tick, i) => {
            const y = getTY(tick);
            return (
              <g key={`grid-${i}`}>
                <line x1={paddingLeft} x2={width - paddingRight} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={paddingLeft - 7} y={y + 3.5} textAnchor="end" fontSize="8.5" fontWeight="600" fill="#ea580c">
                  {tick % 1 === 0 ? tick : tick.toFixed(1)}
                </text>
                <text x={width - paddingRight + 7} y={y + 3.5} textAnchor="start" fontSize="8.5" fontWeight="600" fill="#2563eb">
                  {dioTicks[i]}
                </text>
              </g>
            );
          })}

          {/* Y axis lines */}
          <line x1={paddingLeft} x2={paddingLeft} y1={paddingTop} y2={paddingTop + plotHeight} stroke="#fed7aa" strokeWidth="1.5" />
          <line x1={width - paddingRight} x2={width - paddingRight} y1={paddingTop} y2={paddingTop + plotHeight} stroke="#bfdbfe" strokeWidth="1.5" />

          {/* Area fills */}
          {turnoverValues.length > 0 && <path d={makeAreaPath(turnoverValues, getTY)} fill="url(#turnoverGrad)" />}
          {dioValues.length > 0 && <path d={makeAreaPath(dioValues, getDY)} fill="url(#dioGrad)" />}

          {/* Lines */}
          {turnoverValues.length > 1 && (
            <polyline points={turnoverPoints} fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {dioValues.length > 1 && (
            <polyline points={dioPoints} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Hover vertical guide line */}
          {hoveredTrendIdx !== null && (
            <line
              x1={getX(hoveredTrendIdx)} x2={getX(hoveredTrendIdx)}
              y1={paddingTop} y2={paddingTop + plotHeight}
              stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"
            />
          )}

          {/* Single-point callout badge when only 1 month exists */}
          {labels.length === 1 && (
            <g>
              <line
                x1={getX(0)} x2={getX(0)}
                y1={paddingTop + 24} y2={getTY(turnoverValues[0] || 0)}
                stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7"
              />
              <rect
                x={getX(0) - 78}
                y={paddingTop + 6}
                width={156}
                height={46}
                rx={8}
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.2"
                style={{ filter: "drop-shadow(0 4px 10px rgba(15,23,42,0.10))" }}
              />
              <text x={getX(0)} y={paddingTop + 23} textAnchor="middle" fontSize="10" fontWeight="700" fill="#ea580c">
                Turnover: {Number(turnoverValues[0] || 0).toFixed(2)} Times
              </text>
              <text x={getX(0)} y={paddingTop + 39} textAnchor="middle" fontSize="10" fontWeight="700" fill="#2563eb">
                DIO: {Math.round(dioValues[0] || 0)} Days
              </text>
            </g>
          )}

          {/* Turnover data points */}
          {turnoverValues.map((v, i) => {
            const isHov = hoveredTrendIdx === i;
            return (
              <circle key={`t-${i}`} cx={getX(i)} cy={getTY(v)}
                r={isHov ? 5.5 : 3.2}
                fill={isHov ? "#fff" : "#ea580c"}
                stroke="#ea580c"
                strokeWidth={isHov ? 2.5 : 1.5}
                style={{ transition: "r 0.15s, fill 0.15s", filter: isHov ? "drop-shadow(0 2px 6px rgba(234,88,12,0.5))" : "none" }}
              />
            );
          })}

          {/* DIO data points */}
          {dioValues.map((v, i) => {
            const isHov = hoveredTrendIdx === i;
            return (
              <circle key={`d-${i}`} cx={getX(i)} cy={getDY(v)}
                r={isHov ? 5.5 : 3.2}
                fill={isHov ? "#fff" : "#2563eb"}
                stroke="#2563eb"
                strokeWidth={isHov ? 2.5 : 1.5}
                style={{ transition: "r 0.15s, fill 0.15s", filter: isHov ? "drop-shadow(0 2px 6px rgba(37,99,235,0.5))" : "none" }}
              />
            );
          })}

          {/* Invisible hover hit areas */}
          {shortLabels.map((_, i) => {
            const x = getX(i);
            const hitW = n > 1 ? plotWidth / (n - 1) : plotWidth;
            return (
              <rect
                key={`hit-${i}`}
                x={x - hitW / 2}
                y={paddingTop}
                width={hitW}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredTrendIdx(i)}
                onMouseLeave={() => setHoveredTrendIdx(null)}
                style={{ cursor: "crosshair" }}
              />
            );
          })}

          {/* X axis labels */}
          {shortLabels.map((m, i) => {
            const isHov = hoveredTrendIdx === i;
            return (
              <text key={`xl-${i}`} x={getX(i)} y={height - 5} textAnchor="middle"
                fontSize="8.5" fontWeight={isHov ? 800 : 600} fill={isHov ? "#0f172a" : "#64748b"}
              >
                {m}
              </text>
            );
          })}
        </svg>

        {/* Glassmorphic Tooltip */}
        {hoveredTrendIdx !== null && (
          <div
            style={{
              position: "absolute",
              top: 30,
              left: `${((getX(hoveredTrendIdx) / width) * 100).toFixed(1)}%`,
              transform: hoveredTrendIdx > n / 2 ? "translateX(-100%)" : "translateX(0%)",
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(226,232,240,0.9)",
              borderRadius: 14,
              padding: "10px 14px",
              boxShadow: "0 10px 28px rgba(15,23,42,0.15)",
              pointerEvents: "none",
              zIndex: 60,
              minWidth: 155,
              animation: "plTooltipFadeScale 0.2s ease forwards",
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", marginBottom: 8, borderBottom: "1px solid #f1f5f9", paddingBottom: 5 }}>
              {shortLabels[hoveredTrendIdx] || labels[hoveredTrendIdx]}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 3, borderRadius: 2, background: "#ea580c" }} />
                <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>Turnover</span>
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#ea580c", fontVariantNumeric: "tabular-nums" }}>
                {turnoverValues[hoveredTrendIdx] !== undefined ? Number(turnoverValues[hoveredTrendIdx]).toFixed(2) : "-"} Times
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 3, borderRadius: 2, background: "#2563eb" }} />
                <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>DIO</span>
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#2563eb", fontVariantNumeric: "tabular-nums" }}>
                {dioValues[hoveredTrendIdx] !== undefined ? Math.round(dioValues[hoveredTrendIdx]) : "-"} days
              </span>
            </div>
          </div>
        )}
      </div>
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
    currency = "AED",
    activeSegment,
    onSegmentHover,
  }) => {
    const half = size / 2;
    const radius = half - strokeWidth / 2 - 2;
    const circumference = 2 * Math.PI * radius;

    let offset = 0;
    const segments = (data || []).map((item) => {
      const dash = (item.percentage / 100) * circumference;
      const seg = { item, dash, offset };
      offset += dash;
      return seg;
    });

    const active = activeSegment ? (data || []).find((d) => d.name === activeSegment) : null;

    return (
      <div style={{ width: size, height: size, flex: `0 0 ${size}px`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <style>{`
          @keyframes plTooltipFadeScale {
            from { opacity: 0; transform: scale(0.96) translateY(4px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: "visible", cursor: "pointer" }}
        >
          <g transform={`rotate(-90 ${half} ${half})`}>
            {/* Track */}
            <circle cx={half} cy={half} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />

            {segments.map(({ item, dash, offset: segOffset }) => {
              const isActive = activeSegment === item.name;
              const isOther = activeSegment && !isActive;
              return (
                <circle
                  key={item.name}
                  cx={half}
                  cy={half}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isActive ? strokeWidth + 5 : strokeWidth}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-segOffset}
                  opacity={isOther ? 0.32 : 1}
                  filter={isActive ? `drop-shadow(0 3px 8px ${item.color}88)` : "none"}
                  style={{
                    transition: "stroke-width 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease, filter 0.22s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => onSegmentHover && onSegmentHover(item.name)}
                  onMouseLeave={() => onSegmentHover && onSegmentHover(null)}
                />
              );
            })}
          </g>

          {/* Center text inside donut hole */}
          <text
            x={half}
            y={half - 5}
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="700"
            fill="#64748b"
            letterSpacing="0.4px"
          >
            {centerSubText ? centerSubText.toUpperCase() : "TOTAL"}
          </text>
          <text
            x={half}
            y={half + 8}
            textAnchor="middle"
            fontSize="11"
            fontWeight="800"
            fill="#0f172a"
            letterSpacing="-0.3px"
          >
            {centerText}
          </text>
        </svg>

        {/* Floating detail card matching Expense Breakdown reference */}
        {active && (
          <div
            style={{
              position: "absolute",
              top: half + 8,
              left: -4,
              zIndex: 60,
              background: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(226, 232, 240, 0.95)",
              borderRadius: 16,
              padding: "12px 16px",
              boxShadow: "0 12px 32px rgba(15, 23, 42, 0.16)",
              pointerEvents: "none",
              minWidth: 175,
              animation: "plTooltipFadeScale 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3.5,
                  background: active.color,
                  flexShrink: 0,
                  boxShadow: `0 2px 6px ${active.color}66`,
                }}
              />
              <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                {active.name}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginBottom: 5 }}>
              <span style={{ fontSize: "0.70rem", color: "#64748b", fontWeight: 500 }}>Amount</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                {currency} {Number(active.value).toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: "0.70rem", color: "#64748b", fontWeight: 500 }}>Share</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: active.color, fontVariantNumeric: "tabular-nums" }}>
                {typeof active.percentage === "number" ? `${active.percentage.toFixed(1)}%` : active.percentage}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================

  // MOM BAR CHART
  // ============================================================

  const MomBarChart = () => {
    const data = momData.slice(0, 5); // top 5
    if (!data || data.length === 0) {
        return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No month-on-month data available</div>;
    }

    const max = Math.max(
      ...data.map((x) => Math.max(Number(x.current_value || 0), Number(x.previous_value || 0)))
    );
    const roundMax = max === 0 ? 1 : (max <= 10 ? 10 : Math.ceil(max / 10) * 10);
    const ticks = [
      0,
      Math.round(roundMax * 0.25),
      Math.round(roundMax * 0.5),
      Math.round(roundMax * 0.75),
      roundMax,
    ];

    return (
      <div style={{ width: "100%", paddingTop: 10, paddingRight: 20 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 15, marginBottom: 15, fontSize: "0.7rem", fontWeight: 600, color: "#64748b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "#2563eb", borderRadius: 2 }}/> Current Month</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "#94a3b8", borderRadius: 2 }}/> Previous Month</div>
        </div>
        {data.map((item) => (
          <div
            key={item.parent_division_name}
            style={{
              display: "grid",
              gridTemplateColumns: "110px 1fr 60px",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: "#475569",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "right"
              }}
              title={item.parent_division_name}
            >
              {item.parent_division_name}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ height: 12, width: "100%", background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(Number(item.current_value || 0) / roundMax) * 100}%`,
                      background: "#2563eb",
                      borderRadius: 2,
                      transition: "width 0.5s",
                    }}
                  />
                </div>
                <div style={{ height: 12, width: "100%", background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(Number(item.previous_value || 0) / roundMax) * 100}%`,
                      background: "#94a3b8",
                      borderRadius: 2,
                      transition: "width 0.5s",
                    }}
                  />
                </div>
            </div>

            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#334155", textAlign: "right" }}>
                <div style={{ color: "#1e3a8a" }}>{Number(item.current_value || 0).toFixed(2)}</div>
                <div style={{ color: "#64748b" }}>{Number(item.previous_value || 0).toFixed(2)}</div>
            </div>
          </div>
        ))}
        
        {/* X-Axis Ticks */}
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 60px", gap: 8, marginTop: 8 }}>
          <div />
          <div style={{ position: "relative", height: 15 }}>
            {ticks.map((t, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: `${(t / roundMax) * 100}%`,
                  transform: "translateX(-50%)",
                  fontSize: "0.6rem",
                  color: "#94a3b8",
                  fontWeight: 600,
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <div />
        </div>
      </div>
    );
  };

  // BAR CHART
  // ============================================================

  const SubdivisionChart = () => {
    const [hoveredSubdiv, setHoveredSubdiv] = useState(null);
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
      <div style={{ width: "100%", paddingTop: 4, position: "relative" }}>
        <style>{`
          @keyframes plTooltipFadeScale {
            from { opacity: 0; transform: scale(0.96) translateY(4px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
        {(mockData.bySubdivision || []).map((item) => {
          const isHovered = hoveredSubdiv?.name === item.name;
          return (
            <div
              key={item.name}
              onMouseEnter={() => setHoveredSubdiv(item)}
              onMouseLeave={() => setHoveredSubdiv(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 48px",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                padding: "3px 6px",
                borderRadius: 6,
                background: isHovered ? "rgba(241, 245, 249, 0.95)" : "transparent",
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  color: isHovered ? "#0f172a" : "#475569",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: isHovered ? 700 : 500,
                  transition: "all 0.15s ease",
                }}
                title={item.name}
              >
                {item.name}
              </div>

              <div
                style={{
                  height: 15,
                  background: "#f1f5f9",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: isHovered ? "0 2px 8px rgba(37, 99, 235, 0.35)" : "inset 0 1px 2px rgba(0,0,0,0.06)",
                  transform: isHovered ? "scaleY(1.15)" : "scaleY(1)",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${roundMax > 0 ? (item.value / roundMax) * 100 : 0}%`,
                    background: isHovered
                      ? "linear-gradient(90deg, #2563eb, #1d4ed8)"
                      : "linear-gradient(90deg, #3b82f6, #1d4ed8)",
                    borderRadius: 4,
                    transition: "width 0.35s ease, background 0.2s ease",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: isHovered ? 800 : 700,
                  color: isHovered ? "#2563eb" : "#1e293b",
                  textAlign: "right",
                  transition: "color 0.15s ease",
                }}
              >
                {item.value.toFixed(2)}
              </div>
            </div>
          );
        })}

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
          {currentCurrency}
        </div>

        {/* Floating detail card matching Parent Division extra box */}
        {hoveredSubdiv && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 20,
              zIndex: 60,
              background: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(226, 232, 240, 0.95)",
              borderRadius: 16,
              padding: "12px 16px",
              boxShadow: "0 12px 32px rgba(15, 23, 42, 0.16)",
              pointerEvents: "none",
              minWidth: 175,
              animation: "plTooltipFadeScale 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3.5,
                  background: "#2563eb",
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(37, 99, 235, 0.4)",
                }}
              />
              <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                {hoveredSubdiv.name}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginBottom: 5 }}>
              <span style={{ fontSize: "0.70rem", color: "#64748b", fontWeight: 500 }}>Amount</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                {currentCurrency} {Number(hoveredSubdiv.value || 0).toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: "0.70rem", color: "#64748b", fontWeight: 500 }}>Share</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#2563eb", fontVariantNumeric: "tabular-nums" }}>
                {typeof hoveredSubdiv.percentage === "number" ? `${hoveredSubdiv.percentage.toFixed(1)}%` : (hoveredSubdiv.percentage || "0.0%")}
              </span>
            </div>
          </div>
        )}
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
    info,
    onViewAll,
    onExport,
    extra,
    variant = "graph"
  }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [exportingFormat, setExportingFormat] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
      if (!menuOpen) return;
      const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const handleExportClick = async (format) => {
      setExportingFormat(format);
      try {
        if (onExport) {
          await onExport(format);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setExportingFormat(null);
        setMenuOpen(false);
      }
    };

    const isCurrentExporting = isExporting || exportingFormat !== null;

    const menuItems = [
      ...(onViewAll ? [{
        label: "🔎 View All",
        action: () => {
          setMenuOpen(false);
          onViewAll();
        }
      }] : []),
      ...(onExport ? [
        {
          label: (isCurrentExporting && exportingFormat === "excel") ? "⏳ Exporting..." : "📊 Export Excel",
          action: () => handleExportClick("excel")
        },
        {
          label: (isCurrentExporting && exportingFormat === "pdf") ? "⏳ Exporting..." : "📄 Export PDF",
          action: () => handleExportClick("pdf")
        }
      ] : [])
    ];

    const actionButtons = (onViewAll || onExport) ? (
      <div ref={menuRef} style={{ position: "relative", marginLeft: "auto", flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          title="Options"
          aria-label="Options"
          style={{
            background: menuOpen ? "#f1f5f9" : "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: "1.15rem",
            color: "#64748b",
            lineHeight: 1,
            transition: "all 0.15s",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            if (!menuOpen) e.currentTarget.style.background = "#f1f5f9";
          }}
          onMouseLeave={(e) => {
            if (!menuOpen) e.currentTarget.style.background = "none";
          }}
        >
          ⋮
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.13)",
              border: "1px solid #e2e8f0",
              minWidth: 160,
              zIndex: 9999,
              overflow: "hidden",
            }}
          >
            {menuItems.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={item.action}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 14px",
                  background: "none",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                  transition: "background 0.12s",
                  borderTop: i > 0 ? "1px solid #f1f5f9" : "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    ) : null;

    if (variant === "table") {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", background: "#fff", gap: 8, borderRadius: "10px 10px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
            <span style={{ fontWeight: 800, fontSize: "0.86rem", color: "#1e293b", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{title}</span>
            {info && <Info size={13} style={{ color: "#94a3b8", cursor: "help", flexShrink: 0 }} title={info} />}
          </div>
          {actionButtons}
        </div>
      );
    }

    if (extra) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 0", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
            <span>{title}</span>
            {info && <Info size={13} style={{ color: "#94a3b8", cursor: "help", flexShrink: 0 }} title={info} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            {extra}
            {actionButtons}
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 0", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
        <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
          <span>{title}</span>
          {info && <Info size={13} style={{ color: "#94a3b8", cursor: "help", flexShrink: 0 }} title={info} />}
        </div>
        {actionButtons}
      </div>
    );
  };

  // ============================================================
  // FILTER FIELD
  // ============================================================

/* ================================================================
   MODAL MULTI-SELECT (Matching Sales Revenue Consolidated View All)
   ================================================================ */

function ModalMultiSelect({ options = [], value = [], onChange, placeholder = 'All', style }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current && searchRef.current.focus(), 0);
    }
    if (!open) setSearchQuery('');
  }, [open]);

  // Deduplicate and normalize options by label
  const uniqueOptions = useMemo(() => {
    const list = [];
    const seen = new Set();
    (options || []).forEach(o => {
      if (o == null) return;
      const rawVal = typeof o === 'object' ? (o.value !== undefined ? o.value : o.id) : o;
      const rawLbl = typeof o === 'object' ? (o.label !== undefined ? o.label : (o.name !== undefined ? o.name : rawVal)) : o;
      const strVal = String(rawVal ?? '');
      const strLbl = typeof rawLbl === 'object' ? String(rawLbl?.label || rawLbl?.name || rawVal || '') : String(rawLbl ?? '');
      const key = strLbl.trim().toLowerCase();
      if (!key || key === 'all') return;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ id: strVal || strLbl, name: strLbl, value: strVal, label: strLbl });
      }
    });
    return list;
  }, [options]);

  const q = searchQuery.trim().toLowerCase();
  const visibleOptions = q
    ? uniqueOptions.filter(o => o.name.toLowerCase().includes(q))
    : uniqueOptions;

  const isAll = !value || value.length === 0 || (value.length === 1 && String(value[0]) === 'All');

  const isOptionSelected = (opt) => {
    if (isAll) return false;
    const optVal = String(opt.value ?? opt.id).toLowerCase();
    const optName = String(opt.name ?? opt.label).toLowerCase();
    return (value || []).some(v => {
      const sv = String(v).toLowerCase();
      return sv === optVal || sv === optName;
    });
  };

  const toggle = (opt) => {
    const optVal = String(opt.value ?? opt.id);
    const optName = String(opt.name ?? opt.label);
    
    // When currently "All", selecting one item sets value to ONLY this item
    const cur = isAll ? [] : (value || []).filter(v => String(v) !== 'All').map(String);
    const selected = isOptionSelected(opt);

    let next;
    if (selected) {
      next = cur.filter(v => {
        const sv = v.toLowerCase();
        return sv !== optVal.toLowerCase() && sv !== optName.toLowerCase();
      });
    } else {
      next = [...cur, optVal];
    }

    if (next.length === 0 || (uniqueOptions.length > 0 && next.length === uniqueOptions.length)) {
      onChange(['All']);
    } else {
      onChange(next);
    }
  };

  const selectedVals = uniqueOptions.filter(o => isOptionSelected(o));
  const label = isAll
    ? placeholder
    : selectedVals.length === 1
      ? selectedVals[0].name
      : `${selectedVals.length} selected`;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', ...style }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '6px 24px 6px 10px',
          fontSize: '0.76rem',
          fontWeight: 500,
          color: '#334155',
          background: '#fff',
          border: open ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
          borderRadius: 7,
          cursor: 'pointer',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          height: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
          position: 'relative',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8', position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
          {open ? '▲' : '▼'}
        </span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, minWidth: '220px', maxWidth: '320px',
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 1000, marginTop: 4, display: 'flex', flexDirection: 'column'
        }}>
          {/* Search box with clear button */}
          <div style={{ padding: '6px 8px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px' }}>
              <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>🔍</span>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.74rem', width: '100%', color: '#334155' }}
              />
              {searchQuery && (
                <span
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
                  style={{ fontSize: '0.65rem', color: '#94a3b8', cursor: 'pointer', flexShrink: 0 }}
                >
                  ✕
                </span>
              )}
            </div>
          </div>

          {/* Select All / Clear action bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <span
              onClick={(e) => { e.stopPropagation(); onChange(['All']); }}
              style={{ fontSize: '0.74rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
            >
              Select All
            </span>
            <span
              onClick={(e) => { e.stopPropagation(); onChange(['All']); }}
              style={{ fontSize: '0.74rem', fontWeight: 600, color: '#ef4444', cursor: 'pointer' }}
            >
              Clear
            </span>
          </div>

          {/* Options list */}
          <div style={{ maxHeight: '190px', overflowY: 'auto', padding: '4px 0' }}>
            {/* "All" row */}
            <div
              onClick={() => onChange(['All'])}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                cursor: 'pointer', fontSize: '0.74rem', color: isAll ? '#2563eb' : '#334155', fontWeight: isAll ? 600 : 400,
                background: isAll ? '#eff6ff' : 'transparent', borderBottom: '1px solid #f1f5f9'
              }}
              onMouseEnter={e => { if (!isAll) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (!isAll) e.currentTarget.style.background = 'transparent'; }}
            >
              <input
                type="checkbox"
                checked={isAll}
                readOnly
                style={{ cursor: 'pointer', accentColor: '#2563eb' }}
              />
              <span>All</span>
            </div>

            {visibleOptions.map((opt) => {
              const selected = isOptionSelected(opt);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggle(opt)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                    cursor: 'pointer', fontSize: '0.74rem', color: selected ? '#2563eb' : '#334155', fontWeight: selected ? 600 : 400,
                    background: selected ? '#eff6ff' : 'transparent', transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    readOnly
                    style={{ cursor: 'pointer', accentColor: '#2563eb' }}
                  />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.name}</span>
                </div>
              );
            })}

            {visibleOptions.length === 0 && (
              <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.74rem' }}>
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


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

  // Client-side filter safeguards respecting all dashboard selections
  const filteredDetails = useMemo(() => {
    let list = mockData.details || [];

    if (filters.subinventory && filters.subinventory.length > 0 && !filters.subinventory.includes("All")) {
      list = list.filter(row => {
        const rowVal = String(row.subinventory || "").toLowerCase();
        return filters.subinventory.some(f => {
          const match = String(f).toLowerCase();
          return rowVal === match || rowVal.includes(match);
        });
      });
    }

    if (filters.parentDivision && filters.parentDivision.length > 0 && !filters.parentDivision.includes("All")) {
      list = list.filter(row => {
        const rowVal = String(row.parent_division || "").toLowerCase();
        return filters.parentDivision.some(f => {
          const match = String(f).toLowerCase();
          return rowVal === match || rowVal.includes(match);
        });
      });
    }

    if (filters.legalEntity && filters.legalEntity.length > 0 && !filters.legalEntity.includes("All")) {
      list = list.filter(row => {
        const rowVal = String(row.legal_entity || "").toLowerCase();
        return filters.legalEntity.some(f => {
          const match = String(f).toLowerCase();
          return rowVal === match || rowVal.includes(match);
        });
      });
    }

    if (filters.subdivision && filters.subdivision.length > 0 && !filters.subdivision.includes("All")) {
      list = list.filter(row => {
        const rowVal = String(row.subdivision || "").toLowerCase();
        return filters.subdivision.some(f => {
          const match = String(f).toLowerCase();
          return rowVal === match || rowVal.includes(match);
        });
      });
    }

    return list;
  }, [mockData.details, filters.subinventory, filters.parentDivision, filters.legalEntity, filters.subdivision]);

  const detailTotalRows = filteredDetails.length;
  const detailTotalPages = Math.max(1, Math.ceil(detailTotalRows / detailPageSize));
  const paginatedDetails = useMemo(() => {
    return filteredDetails.slice(detailPage * detailPageSize, (detailPage + 1) * detailPageSize);
  }, [filteredDetails, detailPage, detailPageSize]);

  // Memoized filtered details specifically for the Inventory Detailed View modal
  const modalFilteredDetails = useMemo(() => {
    if (viewAllModal !== "details") return [];
    const sourceItems = modalApiItems || filteredDetails || mockData.details || [];

    const buildOptMap = (opts) => {
      const m = new Map();
      (opts || []).forEach(o => {
        const v = String(o.value ?? o.id ?? '').toLowerCase().trim();
        const l = String(o.label ?? o.name ?? '').toLowerCase().trim();
        if (v && l) {
          m.set(v, l);
          m.set(l, v);
        }
      });
      return m;
    };

    const leMap = buildOptMap(mockData.filters.legalEntities);
    const pdMap = buildOptMap(mockData.filters.parentDivisions);
    const sdMap = buildOptMap(mockData.filters.subdivisions);
    const siMap = buildOptMap(mockData.filters.subinventories);

    const matchesFilter = (rowVal, rowId, selectedVals, optMap) => {
      if (!selectedVals || selectedVals.length === 0 || selectedVals.includes("All")) return true;
      const rVal = String(rowVal || '').toLowerCase().trim();
      const rId = rowId != null ? String(rowId).toLowerCase().trim() : '';

      return selectedVals.some(v => {
        if (v === 'All') return true;
        const target = String(v).toLowerCase().trim();
        if (!target) return true;

        // 1. Direct name match
        if (rVal && (rVal === target || rVal.includes(target) || target.includes(rVal))) return true;
        // 2. Direct ID match
        if (rId && rId === target) return true;

        // 3. Option mapping match (target ID -> label, or target label -> ID)
        const mapped = optMap.get(target);
        if (mapped) {
          if (rVal && (rVal === mapped || rVal.includes(mapped) || mapped.includes(rVal))) return true;
          if (rId && rId === mapped) return true;
        }
        return false;
      });
    };

    return sourceItems.filter(row => {
      // 1. Text search
      if (viewAllSearch) {
        const q = viewAllSearch.toLowerCase();
        const matches = (
          (row.legal_entity || "").toLowerCase().includes(q) ||
          (row.parent_division || "").toLowerCase().includes(q) ||
          (row.subdivision || "").toLowerCase().includes(q) ||
          (row.subinventory || "").toLowerCase().includes(q) ||
          (row.item_code || "").toLowerCase().includes(q) ||
          (row.item_description || "").toLowerCase().includes(q)
        );
        if (!matches) return false;
      }

      // 2. Legal Entity
      if (!matchesFilter(row.legal_entity, row.legal_entity_id, modalDetailsFilters.legalEntity, leMap)) {
        return false;
      }

      // 3. Parent Division
      if (!matchesFilter(row.parent_division, row.parent_division_id, modalDetailsFilters.parentDivision, pdMap)) {
        return false;
      }

      // 4. Sub-Division
      if (!matchesFilter(row.subdivision, row.subdivision_id, modalDetailsFilters.subdivision, sdMap)) {
        return false;
      }

      // 5. Subinventory
      if (!matchesFilter(row.subinventory, row.subinventory_id, modalDetailsFilters.subinventory, siMap)) {
        return false;
      }

      return true;
    });
  }, [viewAllModal, modalApiItems, filteredDetails, mockData.details, viewAllSearch, modalDetailsFilters, mockData.filters]);

  const modalTotalItems = modalFilteredDetails.length;
  const modalTotalPages = Math.max(1, Math.ceil(modalTotalItems / modalDetailPageSize));
  const safeModalPage = Math.min(modalDetailPage, Math.max(0, modalTotalPages - 1));

  const modalPaginatedDetails = useMemo(() => {
    if (viewAllModal !== "details") return [];
    const start = safeModalPage * modalDetailPageSize;
    return modalFilteredDetails.slice(start, start + modalDetailPageSize);
  }, [viewAllModal, modalFilteredDetails, safeModalPage, modalDetailPageSize]);

  const modalTotalVal = useMemo(() => {
    if (viewAllModal !== "details") return 0;
    return modalFilteredDetails.reduce((s, r) => s + (Number(r.total_stock_value) || 0), 0);
  }, [viewAllModal, modalFilteredDetails]);

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

  const rawDataAsOf = mockData.dataAsOf || filters.asOnDate;
  const formattedDataAsOf = rawDataAsOf && rawDataAsOf !== "All"
    ? new Date(rawDataAsOf).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;


  return (
    <div style={styles.page}>
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="page-header" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, padding: 0, lineHeight: 1.2 }}>
            Inventory Overview
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 0', padding: 0, fontWeight: 500 }}>
            Track inventory position, movement and aging across all dimensions
            <br />
            <span style={{ color: '#475569', display: 'inline-block', marginTop: 4 }}>
              {formattedDataAsOf && `Last Updated On: ${formattedDataAsOf} | `}
              <span style={{ color: '#16a34a', fontWeight: 700 }}>Currency: {mockData.reporting_currency || "AED"}</span>
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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
              <RotateCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          FILTERS
      ======================================================== */}

      <div className="filter-bar">
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
          label="Currency"
          value={filters.currency}
          options={mockData.filters.currencies}
          onChange={(value) => updateFilter("currency", value)}
          minWidth={85}
        />

        <DateFilter
          value={filters.asOnDate}
          onChange={(value) => updateFilter("asOnDate", value)}
          minWidth={115}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-end', flexShrink: 0, paddingBottom: 1 }}>
          <button type="button" style={styles.applyButton} onClick={() => loadData()}>
            Apply
          </button>

          <button type="button" style={styles.resetButton} onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/* ========================================================
          KPI CARDS
      ======================================================== */}

      <div className="inventory-kpi-grid">
        {mockData.kpis.map((item) => (
          <KpiCard key={item.key || item.title} item={item} />
        ))}
      </div>

      {/* ========================================================
          FIRST CHART ROW
      ======================================================== */}

      <div style={styles.chartGrid}>
        {/* Inventory Trend */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0 }}>
          <CardHeader isExporting={isExporting}
            title={`Inventory Value Trend (${currentCurrency})`}
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
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, position: "relative" }}>
          <CardHeader isExporting={isExporting}
            title={`Inventory Value by Parent Division (${currentCurrency})`}
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

          {parentDivViewMode === "mom" ? (
            <div style={{ flex: 1, padding: "8px 12px", display: "flex", alignItems: "center" }}>
              <MomBarChart />
            </div>
          ) : (
            <div style={styles.donutRow}>
              <DonutChart
                data={mockData.divisions}
                total={parentDivTotal.toFixed(2)}
                centerText={`${parentDivTotal.toFixed(2)}`}
                centerSubText="Total"
                size={150}
                strokeWidth={26}
                currency={mockData.reporting_currency || "AED"}
                activeSegment={hoveredParentDivSegment}
                onSegmentHover={setHoveredParentDivSegment}
              />

              <div style={styles.legendList}>
                {mockData.divisions.map((item) => {
                  const isHovered = hoveredParentDivSegment === item.name;
                  return (
                    <div
                      key={item.name}
                      style={{
                        ...styles.legendListRow,
                        cursor: "pointer",
                        padding: "4px 6px",
                        borderRadius: 6,
                        background: isHovered ? "rgba(241, 245, 249, 0.95)" : "transparent",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={() => setHoveredParentDivSegment(item.name)}
                      onMouseLeave={() => setHoveredParentDivSegment(null)}
                    >
                      <div style={styles.legendName} title={item.name}>
                        <span
                          style={{
                            ...styles.legendCircle,
                            background: item.color,
                            flexShrink: 0,
                            boxShadow: isHovered ? `0 2px 6px ${item.color}88` : "none",
                            transform: isHovered ? "scale(1.25)" : "scale(1)",
                            transition: "all 0.2s ease",
                          }}
                        />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: isHovered ? 700 : 500,
                            color: isHovered ? "#0f172a" : "#334155",
                          }}
                        >
                          {item.name}
                        </span>
                      </div>

                      <div
                        style={{
                          ...styles.legendValue,
                          color: isHovered ? item.color : "#1e293b",
                          fontWeight: isHovered ? 800 : 600,
                        }}
                      >
                        {item.value.toFixed(2)} ({item.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sub-division */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0 }}>
          <CardHeader isExporting={isExporting}
            title={`Inventory Value by Sub-division (${currentCurrency})`}
            info="Sub-division holdings ranked by value"
            onViewAll={() => setViewAllModal("details")}
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
        {/* 1. AGING SUMMARY */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, position: "relative" }}>
          <CardHeader isExporting={isExporting}
            title={`Inventory Aging Summary (${currentCurrency})`}
            info="Summary of inventory value by aging bucket"
            onViewAll={() => setViewAllModal("details")}
            onExport={(type) => handleExport(type || "excel")}
          />

          <div style={styles.agingContent}>
            <DonutChart
              data={mockData.aging}
              total={agingTotal.toFixed(2)}
              centerText={`${agingTotal.toFixed(2)}`}
              centerSubText="Total"
              size={150}
              strokeWidth={26}
              currency={mockData.reporting_currency || "AED"}
              activeSegment={hoveredAgingSegment}
              onSegmentHover={setHoveredAgingSegment}
            />

            <div style={styles.agingTable}>
              <div style={styles.agingHeader}>
                <span>Bucket</span>
                <span style={{ textAlign: "right" }}>Amount ({currentCurrency})</span>
                <span style={{ textAlign: "right" }}>% Total</span>
              </div>

              {mockData.aging.map((item) => {
                const isHovered = hoveredAgingSegment === item.name;
                return (
                  <div
                    key={item.name}
                    style={{
                      ...styles.agingRow,
                      cursor: "pointer",
                      borderRadius: 4,
                      background: isHovered ? "rgba(241, 245, 249, 0.95)" : "transparent",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setHoveredAgingSegment(item.name)}
                    onMouseLeave={() => setHoveredAgingSegment(null)}
                  >
                    <div style={styles.agingName} title={item.name}>
                      <span
                        style={{
                          ...styles.legendCircle,
                          background: item.color,
                          flexShrink: 0,
                          boxShadow: isHovered ? `0 2px 6px ${item.color}88` : "none",
                          transform: isHovered ? "scale(1.25)" : "scale(1)",
                          transition: "all 0.2s ease",
                        }}
                      />
                      <span style={{ whiteSpace: "nowrap", fontWeight: isHovered ? 700 : 500, color: isHovered ? "#0f172a" : "#334155" }}>
                        {item.name}
                      </span>
                    </div>

                    <div style={{ textAlign: "right", fontWeight: isHovered ? 800 : 600, color: isHovered ? "#0f172a" : "#1e293b" }}>
                      {item.value.toFixed(2)}
                    </div>

                    <div style={{ textAlign: "right", color: isHovered ? item.color : "#64748b", fontWeight: isHovered ? 800 : 500 }}>
                      {typeof item.percentage === "number" ? `${item.percentage.toFixed(1)}%` : item.percentage}
                    </div>
                  </div>
                );
              })}

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

        {/* 2. SLOW MOVING STOCK (TOP 5) */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0 }}>
          <CardHeader isExporting={isExporting}
            title="Slow Moving Stock (Top 5)"
            info="Top 5 items with highest holding days"
            onViewAll={() => setViewAllModal("slowMoving")}
            onExport={(type) => handleExport(type || "excel", "slow-moving")}
            variant="table"
          />
          
          <div style={{ flex: 1, padding: "0 8px 8px 8px" }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: "0.72rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ width: "28px", textAlign: "center", verticalAlign: "bottom", padding: "6px 3px", color: "#1e3a8a", fontWeight: 700, fontSize: "0.68rem", lineHeight: 1.25 }}>Sr.<br />No.</th>
                    <th style={{ width: "36%", textAlign: "left", verticalAlign: "bottom", padding: "6px 5px", color: "#1e3a8a", fontWeight: 700, fontSize: "0.68rem" }}>Item<br />Description</th>
                    <th style={{ width: "18%", textAlign: "left", verticalAlign: "bottom", padding: "6px 4px", color: "#1e3a8a", fontWeight: 700, fontSize: "0.68rem" }}>Item<br />Code</th>
                    <th style={{ width: "16%", textAlign: "right", verticalAlign: "bottom", padding: "6px 4px", color: "#1e3a8a", fontWeight: 700, fontSize: "0.68rem" }}>Qty<br />(Nos)</th>
                    <th style={{ width: "18%", textAlign: "right", verticalAlign: "bottom", padding: "6px 4px", color: "#1e3a8a", fontWeight: 700, fontSize: "0.68rem" }}>Value<br />({currentCurrency})</th>
                    <th style={{ width: "14%", textAlign: "right", verticalAlign: "bottom", padding: "6px 4px", color: "#1e3a8a", fontWeight: 700, fontSize: "0.68rem", lineHeight: 1.25 }}>Holding<br />Days</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const items = (mockData.slowMoving && mockData.slowMoving.length > 0) ? mockData.slowMoving : [];
                    if (items.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "0.72rem" }}>
                            No slow moving stock records found
                          </td>
                        </tr>
                      );
                    }
                    const totalVal = items.reduce((s, r) => s + (Number(r.value || r.obsolete || 0) || 0), 0);
                    return (
                      <>
                        {items.map((item, idx) => (
                          <tr key={item.no || idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#fafbfc" }}>
                            <td style={{ textAlign: "center", color: "#64748b", fontWeight: 600, padding: "6px 3px", verticalAlign: "middle" }}>{item.no || idx + 1}</td>
                            <td style={{ padding: "6px 5px", verticalAlign: "middle" }}>
                              <div style={{
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                lineHeight: 1.3,
                                fontWeight: 600,
                                color: "#1e293b",
                                fontSize: "0.72rem",
                              }} title={item.desc || item.parentDiv}>
                                {item.desc || item.parentDiv}
                              </div>
                            </td>
                            <td style={{ padding: "6px 4px", color: "#475569", fontSize: "0.68rem", fontWeight: 500, verticalAlign: "middle", whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.2 }}>
                              {item.code || "-"}
                            </td>
                            <td style={{ padding: "6px 4px", textAlign: "right", color: "#334155", fontVariantNumeric: "tabular-nums", verticalAlign: "middle", fontSize: "0.70rem" }}>
                              {item.qty || (item.total ? Math.round(item.total * 1000).toLocaleString() : "-")}
                            </td>
                            <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700, color: "#e11d48", fontVariantNumeric: "tabular-nums", verticalAlign: "middle", fontSize: "0.72rem" }}>
                              {item.value ? item.value.toFixed(2) : (item.obsolete ? item.obsolete.toFixed(2) : "-")}
                            </td>
                            <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700, color: "#dc2626", fontVariantNumeric: "tabular-nums", verticalAlign: "middle", fontSize: "0.72rem" }}>
                              {item.days || Math.round(200 + idx * 10)}
                            </td>
                          </tr>
                        ))}
                        <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                          <td style={{ padding: "6px 3px" }} />
                          <td style={{ padding: "6px 5px", color: "#1e3a8a", fontSize: "0.72rem" }}>Total</td>
                          <td style={{ padding: "6px 4px" }} />
                          <td style={{ padding: "6px 4px" }} />
                          <td style={{ padding: "6px 4px", textAlign: "right", color: "#e11d48", fontVariantNumeric: "tabular-nums", fontSize: "0.72rem" }}>
                            {totalVal.toFixed(2)}
                          </td>
                          <td style={{ padding: "6px 4px" }} />
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. INVENTORY TURNOVER & DIO TREND */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0 }}>
          <CardHeader isExporting={isExporting}
            title="Inventory Turnover & DIO Trend"
            info="Turnover ratio (left axis) vs DIO days (right axis)"
            onViewAll={() => setViewAllModal("trend")}
            onExport={(type) => handleExport(type || "excel", "trend")}
          />

          <div style={{ flex: 1, padding: "6px 12px 12px", minHeight: 285, display: "flex", flexDirection: "column" }}>
            <TurnoverDioChart />
          </div>
        </div>
      </div>

      {/* ========================================================
          DETAILED VIEW
      ======================================================== */}

      <div className="card" style={{ padding: 0 }}>
        <CardHeader isExporting={isExporting}
          title="Inventory Detailed View"
          info="Detailed item-level inventory valuation and aging buckets"
          onViewAll={() => setViewAllModal("details")}
          onExport={(type) => handleExport(type || "excel")}
          variant="table"
        />

        <div style={styles.detailTableWrapper} className="detail-table-scroll">
          <table style={styles.detailTable} className="compact-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left", width: 85, minWidth: 70, verticalAlign: "bottom" }}>Legal<br />Entity</th>
                <th style={{ textAlign: "left", width: 80, minWidth: 65, verticalAlign: "bottom" }}>Parent<br />Division</th>
                <th style={{ textAlign: "left", width: 80, minWidth: 65, verticalAlign: "bottom" }}>Sub-<br />Division</th>
                <th style={{ textAlign: "left", width: 75, minWidth: 60, verticalAlign: "bottom" }}>Subinventory<br />Code</th>
                <th style={{ textAlign: "left", width: 75, minWidth: 60, verticalAlign: "bottom" }}>Item<br />Code</th>
                <th style={{ textAlign: "left", width: 110, minWidth: 90, verticalAlign: "bottom" }}>Item<br />Description</th>
                <th style={{ textAlign: "right", width: 45, minWidth: 35, verticalAlign: "bottom" }}>Qty<br />(Nos)</th>
                <th style={{ textAlign: "right", width: 55, minWidth: 45, verticalAlign: "bottom" }}>Total<br />Stock<br />Value<br />({currentCurrency})</th>
                <th style={{ textAlign: "right", width: 45, minWidth: 35, verticalAlign: "bottom" }}>0-30<br />Days</th>
                <th style={{ textAlign: "right", width: 45, minWidth: 35, verticalAlign: "bottom" }}>31-60<br />Days</th>
                <th style={{ textAlign: "right", width: 45, minWidth: 35, verticalAlign: "bottom" }}>61-90<br />Days</th>
                <th style={{ textAlign: "right", width: 45, minWidth: 35, verticalAlign: "bottom" }}>91-120<br />Days</th>
                <th style={{ textAlign: "right", width: 48, minWidth: 38, verticalAlign: "bottom" }}>121-180<br />Days</th>
                <th style={{ textAlign: "right", width: 50, minWidth: 40, verticalAlign: "bottom" }}>181-365<br />Days</th>
                <th style={{ textAlign: "right", width: 52, minWidth: 40, verticalAlign: "bottom" }}>366-730<br />Days</th>
                <th style={{ textAlign: "right", width: 55, minWidth: 42, verticalAlign: "bottom" }}>Above 730<br />Days</th>
                <th style={{ textAlign: "right", width: 45, minWidth: 35, verticalAlign: "bottom", lineHeight: 1.25 }}>Holding<br />Days</th>
                <th style={{ textAlign: "right", width: 65, minWidth: 50, verticalAlign: "bottom" }}>Avg. Inv.<br />Value</th>
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
              {filteredDetails.length > 0 && (() => {
                const totals = filteredDetails.reduce((acc, row) => {
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
                    <td style={{ textAlign: "right", verticalAlign: "middle", fontWeight: 800, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", color: "#e11d48" }}>
                      {((totals.d730 + totals.dAbove730) / 10000000).toFixed(2)}
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar - Matching Sales Revenue by Parent Division - View Details */}
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
              ? `Showing ${detailPage * detailPageSize + 1} - ${Math.min((detailPage + 1) * detailPageSize, detailTotalRows)} of ${detailTotalRows} records`
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
              Prev
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
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <div style={{
        fontSize: '0.65rem', color: '#64748b',
        display: 'flex', justifyContent: 'space-between',
        paddingTop: 10, paddingBottom: 4, flexWrap: 'wrap', gap: 4,
      }}>
        <span>
          All values are in <strong>{mockData.reporting_currency || "AED"}</strong>&nbsp;|&nbsp;
          {formattedDataAsOf && `Last Updated On: ${formattedDataAsOf}`}&nbsp;|&nbsp;
          <span style={{ color: '#16a34a', fontWeight: 700 }}>● Live</span>
        </span>
        <span>☁ Source: Oracle Fusion Cloud</span>
      </div>

      {/* ========================================================
          VIEW ALL MODAL (All Cards)
      ======================================================== */}
      {viewAllModal && (() => {
        const modalConfig = (() => {
          switch (viewAllModal) {
            case "trend":
              return {
                title: "Inventory Value Trend - detailed view",
                subtitle: "Current Year vs Month By Month inventory details",
                searchPlaceholder: "Search months...",
                section: "trend",
                maxWidth: "94vw",
              };
            case "parentDivision":
              return {
                title: "Inventory Value by Parent Division - detailed view",
                subtitle: `Breakdown across all parent divisions (${currentCurrency})`,
                searchPlaceholder: "Search parent divisions...",
                section: "parent-divisions",
                maxWidth: "94vw",
              };
            case "subdivision":
              return {
                title: "Inventory Value by Sub-division - detailed view",
                subtitle: `Breakdown across all sub-divisions (${currentCurrency})`,
                searchPlaceholder: "Search sub-divisions...",
                section: null,
                maxWidth: "94vw",
              };
            case "slowMoving":
              return {
                title: "Slow Moving Stock by Parent Div - detailed view",
                subtitle: `Obsolete inventory vs total stock (${currentCurrency})`,
                searchPlaceholder: "Search parent divisions...",
                section: "slow-moving",
                maxWidth: "94vw",
              };
            case "details":
              return {
                title: "Inventory Detailed View",
                subtitle: `Line-item inventory breakdown and aging status (${mockData.reporting_currency || "AED"})`,
                searchPlaceholder: "Search item code, description, legal entity...",
                section: null,
                maxWidth: "94vw",
              };
            default:
              return {
                title: "detailed view",
                subtitle: "",
                searchPlaceholder: "Search...",
                section: null,
                maxWidth: "94vw",
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
                width: "94vw",
                maxWidth: "1450px",
                height: viewAllModal === "details" ? "90vh" : undefined,
                maxHeight: "90vh",
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
              {viewAllModal === "details" ? (
                <div
                  style={{
                    padding: "10px 20px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    background: "#fafbfc",
                  }}
                >
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
                    {/* 1. Search */}
                    <input
                      type="text"
                      placeholder="Search item code, description, legal entity..."
                      value={viewAllSearch}
                      onChange={(e) => {
                        setViewAllSearch(e.target.value);
                        setModalDetailPage(0);
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: "0.78rem",
                        minWidth: 180,
                        maxWidth: 220,
                        height: 32,
                        boxSizing: "border-box",
                        outline: "none",
                        background: "#fff",
                      }}
                    />

                    {/* 2. Legal Entity Filter */}
                    <div style={{ width: 155, position: "relative" }}>
                      <ModalMultiSelect
                        options={mockData.filters.legalEntities}
                        value={modalDetailsFilters.legalEntity}
                        onChange={(vals) => {
                          setModalDetailsFilters(prev => ({ ...prev, legalEntity: vals }));
                          setModalDetailPage(0);
                        }}
                        placeholder="All Legal Entity"
                      />
                    </div>

                    {/* 3. Parent Division Filter */}
                    <div style={{ width: 160, position: "relative" }}>
                      <ModalMultiSelect
                        options={mockData.filters.parentDivisions}
                        value={modalDetailsFilters.parentDivision}
                        onChange={(vals) => {
                          setModalDetailsFilters(prev => ({ ...prev, parentDivision: vals }));
                          setModalDetailPage(0);
                        }}
                        placeholder="All Parent Division"
                      />
                    </div>

                    {/* 4. Sub-Division Filter */}
                    <div style={{ width: 155, position: "relative" }}>
                      <ModalMultiSelect
                        options={mockData.filters.subdivisions}
                        value={modalDetailsFilters.subdivision}
                        onChange={(vals) => {
                          setModalDetailsFilters(prev => ({ ...prev, subdivision: vals }));
                          setModalDetailPage(0);
                        }}
                        placeholder="All Sub-Division"
                      />
                    </div>

                    {/* 5. Subinventory Filter */}
                    <div style={{ width: 145, position: "relative" }}>
                      <ModalMultiSelect
                        options={mockData.filters.subinventories}
                        value={modalDetailsFilters.subinventory}
                        onChange={(vals) => {
                          setModalDetailsFilters(prev => ({ ...prev, subinventory: vals }));
                          setModalDetailPage(0);
                        }}
                        placeholder="All Subinventory"
                      />
                    </div>

                    {/* 6. As on Date Filter */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>As on Date:</span>
                      <div style={{ position: "relative" }}>
                        <input
                          id="modal-as-on-date-picker"
                          type="date"
                          value={getRawDateForInputGlobal(modalDetailsFilters.asOnDate && modalDetailsFilters.asOnDate !== "All" ? modalDetailsFilters.asOnDate : (mockData.dataAsOf || filters.asOnDate))}
                          onChange={(e) => {
                            setModalDetailsFilters(prev => ({ ...prev, asOnDate: e.target.value }));
                            setModalDetailPage(0);
                          }}
                          style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById("modal-as-on-date-picker");
                            if (el) { el.showPicker ? el.showPicker() : el.click(); }
                          }}
                          style={{
                            height: 32, boxSizing: "border-box", border: "1px solid #cbd5e1",
                            borderRadius: 7, padding: "0 26px 0 10px", background: "#f8fafc", color: "#334155",
                            fontSize: '0.76rem', fontWeight: 500, outline: "none", cursor: "pointer", textAlign: "left", position: "relative",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 105
                          }}
                          title={modalDetailsFilters.asOnDate && modalDetailsFilters.asOnDate !== "All" ? modalDetailsFilters.asOnDate : "Selected Date"}
                        >
                          {formatDisplayDateGlobal(modalDetailsFilters.asOnDate && modalDetailsFilters.asOnDate !== "All" ? modalDetailsFilters.asOnDate : (mockData.dataAsOf || filters.asOnDate || "Selected Date"))}
                          <span style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", fontSize: 13, pointerEvents: "none" }}>
                            📅
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Records count & Exports */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {modalDetailsLoading ? (
                      <span style={{ fontSize: "0.72rem", color: "#2563eb", fontWeight: 600 }}>Loading...</span>
                    ) : (
                      <span style={{ fontSize: "0.70rem", color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {modalFilteredDetails.length} {viewAllSearch ? "matches" : "records"}
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => handleExport("excel", null, modalDetailsFilters)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 7,
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        color: "#166534",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: isExporting ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        height: 32,
                      }}
                    >
                      Export Excel (.xlsx)
                    </button>
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => handleExport("pdf", null, modalDetailsFilters)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 7,
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        color: "#991b1b",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: isExporting ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        height: 32,
                      }}
                    >
                      Export PDF (.pdf)
                    </button>
                  </div>
                </div>
              ) : (
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
                  {viewAllModal === "parentDivision" && (
                    <div style={{ display: "inline-flex", background: "#f1f5f9", padding: 3, borderRadius: 8, border: "1px solid #e2e8f0", gap: 3, marginRight: "auto", marginLeft: 16 }}>
                      <button
                        type="button"
                        onClick={() => setParentDivViewMode("month")}
                        style={{
                          padding: "4px 12px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          borderRadius: 6,
                          border: "none",
                          background: parentDivViewMode === "month" ? "#2563eb" : "transparent",
                          color: parentDivViewMode === "month" ? "#fff" : "#475569",
                          cursor: "pointer",
                          boxShadow: parentDivViewMode === "month" ? "0 1px 3px rgba(37,99,235,0.3)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Parent Division-wise
                      </button>
                      <button
                        type="button"
                        onClick={() => setParentDivViewMode("mom")}
                        style={{
                          padding: "4px 12px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          borderRadius: 6,
                          border: "none",
                          background: parentDivViewMode === "mom" ? "#2563eb" : "transparent",
                          color: parentDivViewMode === "mom" ? "#fff" : "#475569",
                          cursor: "pointer",
                          boxShadow: parentDivViewMode === "mom" ? "0 1px 3px rgba(37,99,235,0.3)" : "none",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Month-on-Month
                      </button>
                    </div>
                  )}

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
                      width: 240,
                      outline: "none",
                    }}
                  />

                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button"
                        disabled={isExporting || (viewAllModal === "parentDivision" && parentDivViewMode === "mom")}
                        onClick={() => handleExport("excel", modalConfig.section)}
                        title={viewAllModal === "parentDivision" && parentDivViewMode === "mom" ? "Export not available for Month-on-Month view" : "Export to Excel"}
                        style={{ opacity: (isExporting || (viewAllModal === "parentDivision" && parentDivViewMode === "mom")) ? 0.6 : 1, cursor: (isExporting || (viewAllModal === "parentDivision" && parentDivViewMode === "mom")) ? "not-allowed" : "pointer", 
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        color: "#166534",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Export Excel (.xlsx)
                    </button>
                    <button type="button"
                        disabled={isExporting || (viewAllModal === "parentDivision" && parentDivViewMode === "mom")}
                        onClick={() => handleExport("pdf", modalConfig.section)}
                        title={viewAllModal === "parentDivision" && parentDivViewMode === "mom" ? "Export not available for Month-on-Month view" : "Export to PDF"}
                        style={{ opacity: (isExporting || (viewAllModal === "parentDivision" && parentDivViewMode === "mom")) ? 0.6 : 1, cursor: (isExporting || (viewAllModal === "parentDivision" && parentDivViewMode === "mom")) ? "not-allowed" : "pointer", 
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        color: "#991b1b",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Export PDF (.pdf)
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Table Content */}
              <div
                className="detail-table-scroll"
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  padding: "0 20px",
                }}
              >
                {(() => {
                  if (viewAllModal === "trend") {
                    const rawList = (mockData.trendList && mockData.trendList.length > 0)
                      ? mockData.trendList
                      : (viewAllData && viewAllData.length > 0)
                        ? viewAllData
                        : (mockData.trend?.list && mockData.trend.list.length > 0)
                          ? mockData.trend.list
                          : (momData && momData.length > 0)
                            ? momData
                            : [];
                    const filtered = rawList.filter(item => {
                      if (!viewAllSearch) return true;
                      const q = viewAllSearch.toLowerCase();
                      const m = String(item.month_start ? (typeof item.month_start === 'object' ? item.month_start.name : item.month_start) : (item.month || item.as_on_date || "")).toLowerCase();
                      return m.includes(q);
                    });
                    
                    if (viewAllLoading) {
                        return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
                    }

                    return (
                      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 45, verticalAlign: "bottom", lineHeight: 1.25 }}>Sr.<br />No.</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.25 }}>Month</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>Total Stock Value<br />({currentCurrency})</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>Total Obsolete Stock<br />({currentCurrency})</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>Annual Inventory<br />Turnover Ratio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No trend data found</td></tr>
                          ) : (
                            filtered.map((item, idx) => {
                              const monthLabel = item.month_start ? (typeof item.month_start === 'object' ? item.month_start.name : String(item.month_start).substring(0, 7)) : (item.month || item.as_on_date || `M${idx + 1}`);
                              const rawVal = item.total_stock_value !== undefined ? item.total_stock_value : (item.inventory_value !== undefined ? item.inventory_value : (item.current !== undefined ? item.current : 0));
                              const numVal = Number(rawVal || 0);
                              const displayStock = numVal > 10000 ? (numVal / 10000000).toFixed(2) : numVal.toFixed(2);

                              const rawObs = item.obsolete_stock !== undefined ? item.obsolete_stock : (item.total_obsolete_stock !== undefined ? item.total_obsolete_stock : 0);
                              const numObs = Number(rawObs || 0);
                              const displayObs = numObs > 10000 ? (numObs / 10000000).toFixed(2) : (numObs > 0 ? numObs.toFixed(2) : "-");

                              const annualTurnover = item.annual_inventory_turnover !== undefined && item.annual_inventory_turnover !== null
                                ? Number(item.annual_inventory_turnover).toFixed(2)
                                : (item.annual_turnover !== undefined && item.annual_turnover !== null
                                  ? Number(item.annual_turnover).toFixed(2)
                                  : (item.annual_inventory_turnover_ratio !== undefined && item.annual_inventory_turnover_ratio !== null
                                    ? Number(item.annual_inventory_turnover_ratio).toFixed(2)
                                    : (item.inventory_turnover ? (Number(item.inventory_turnover) * 12).toFixed(2) : "-")));

                              return (
                                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                  <td style={{ padding: "8px 10px", color: "#64748b" }}>{idx + 1}</td>
                                  <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1e293b" }}>{monthLabel}</td>
                                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#2563eb" }}>{displayStock}</td>
                                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 500, color: "#dc2626" }}>{displayObs}</td>
                                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#16a34a" }}>{annualTurnover}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    );
                  }
                  
                  if (viewAllModal === "parentDivision") {
                    if (parentDivViewMode === "mom") {
                        const rawList = momData || [];
                        const filtered = rawList.filter(item =>
                          !viewAllSearch || item.parent_division_name?.toLowerCase().includes(viewAllSearch.toLowerCase())
                        );
                        return (
                          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 40, verticalAlign: "bottom", lineHeight: 1.25 }}>Sr.<br />No.</th>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.25 }}>Parent<br />Division</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>Current Value<br />({currentCurrency})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>Previous Value<br />({currentCurrency})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>Variance<br />({currentCurrency})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>Variance<br />%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No data found</td></tr>
                              ) : (
                                filtered.map((item, idx) => (
                                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                    <td style={{ padding: "8px 10px", color: "#64748b" }}>{idx + 1}</td>
                                    <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1e293b" }}>{item.parent_division_name}</td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{Number(item.current_value || 0).toFixed(2)}</td>
                                    {item.previous_as_on_date ? (
                                      <>
                                        <td style={{ padding: "8px 10px", textAlign: "right", color: "#475569" }}>{Number(item.previous_value || 0).toFixed(2)}</td>
                                        <td style={{ padding: "8px 10px", textAlign: "right", color: item.variance < 0 ? "#16a34a" : "#dc2626" }}>{Number(item.variance || 0).toFixed(2)}</td>
                                        <td style={{ padding: "8px 10px", textAlign: "right", color: item.variance_percentage < 0 ? "#16a34a" : "#dc2626" }}>{Number(item.variance_percentage || 0).toFixed(2)}%</td>
                                      </>
                                    ) : (
                                      <td colSpan={3} style={{ padding: "8px 10px", textAlign: "center", color: "#94a3b8" }}>Previous period comparison unavailable</td>
                                    )}
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        );
                    } else {
                        if (viewAllLoading) {
                            return <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>Loading parent divisions...</div>;
                        }

                        const rawList = (viewAllData && viewAllData.length > 0)
                          ? viewAllData
                          : (mockData.allDivisions?.length ? mockData.allDivisions : (mockData.divisions || []));

                        const filtered = (rawList || []).filter(item => {
                          const name = String(item.parent_division_name || item.name || item.label || "").toLowerCase();
                          return !viewAllSearch || name.includes(viewAllSearch.toLowerCase());
                        });

                        return (
                          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 40, verticalAlign: "bottom", lineHeight: 1.25 }}>Sr.<br />No.</th>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.25 }}>Parent<br />Division</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>Total Cost<br />Value ({currentCurrency})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>Cost of Material<br />({currentCurrency})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>Average<br />Inventory ({currentCurrency})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>DIO Days</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No divisions found</td></tr>
                              ) : (
                                filtered.map((item, idx) => {
                                  const name = item.parent_division_name || item.name || (typeof item.label === 'object' ? item.label?.name : item.label) || "—";
                                  const rawVal = item.total_stock_value !== undefined ? item.total_stock_value : (item.inventory_value !== undefined ? item.inventory_value : (item.value || 0));
                                  const numVal = Number(rawVal || 0);
                                  const displayVal = numVal > 10000 ? (numVal / 10000000).toFixed(2) : numVal.toFixed(2);

                                  const rawMat = item.cost_of_material_ytd;
                                  const displayMat = (rawMat !== null && rawMat !== undefined)
                                    ? (Number(rawMat) > 10000 ? (Number(rawMat) / 10000000).toFixed(2) : Number(rawMat).toFixed(2))
                                    : "N/A";

                                  const rawAvg = item.average_inventory;
                                  const displayAvg = (rawAvg !== null && rawAvg !== undefined)
                                    ? (Number(rawAvg) > 10000 ? (Number(rawAvg) / 10000000).toFixed(2) : Number(rawAvg).toFixed(2))
                                    : "N/A";

                                  const rawDio = item.dio_days;
                                  const displayDio = (rawDio !== null && rawDio !== undefined)
                                    ? Number(rawDio).toFixed(0)
                                    : "N/A";

                                  return (
                                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                      <td style={{ padding: "8px 10px", color: "#64748b" }}>{idx + 1}</td>
                                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1e293b" }}>{name}</td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{displayVal}</td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", color: "#475569" }}>{displayMat}</td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", color: "#475569" }}>{displayAvg}</td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", color: "#475569" }}>{displayDio}</td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        );
                    }
                  }

                  if (viewAllModal === "subdivision") {
                    const rawList = mockData.allSubdivisions?.length ? mockData.allSubdivisions : mockData.bySubdivision;
                    const filtered = (rawList || []).filter(item =>
                      !viewAllSearch || item.name?.toLowerCase().includes(viewAllSearch.toLowerCase())
                    );
                    const totalVal = filtered.reduce((s, r) => s + (Number(r.value || r.inventory_value) || 0), 0);
                    const totalPct = filtered.reduce((s, r) => s + (Number(r.percentage) || 0), 0);
                    return (
                      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 40, verticalAlign: "bottom", lineHeight: 1.25 }}>Sr.<br />No.</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.25 }}>Sub-<br />Division</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.3 }}>Value<br />({currentCurrency})</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.25 }}>% of<br />Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No subdivisions found</td></tr>
                          ) : (
                            filtered.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                <td style={{ padding: "8px 10px", color: "#64748b" }}>{idx + 1}</td>
                                <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1e293b" }}>{item.name || item.subdivision_name}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{Number(item.value || item.inventory_value || 0).toFixed(2)}</td>
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
                    if (viewAllLoading) {
                        return <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>Loading slow moving stock by parent division...</div>;
                    }

                    const rawList = (viewAllData && viewAllData.length > 0)
                      ? viewAllData
                      : ((mockData.allSlowMoving && mockData.allSlowMoving.length > 0)
                          ? mockData.allSlowMoving
                          : (mockData.slowMoving || []));

                    const filtered = rawList.filter(item => {
                      const name = (item.parent_division_name || item.parentDiv || item.desc || item.name || "").toLowerCase();
                      return !viewAllSearch || name.includes(viewAllSearch.toLowerCase());
                    });

                    const totalObs = filtered.reduce((s, r) => s + (Number(r.obsolete_stock !== undefined ? r.obsolete_stock : (r.obsolete || r.value)) || 0), 0);
                    const totalStock = filtered.reduce((s, r) => s + (Number(r.total_stock_value !== undefined ? r.total_stock_value : r.total) || 0), 0);
                    const totalPct = totalStock > 0 ? (totalObs / totalStock) * 100 : 0;

                    return (
                      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 40, verticalAlign: "bottom", lineHeight: 1.25 }}>Sr.<br />No.</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.25 }}>Parent<br />Division</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 160, verticalAlign: "bottom", lineHeight: 1.3 }}>Obsolete Stock<br />({currentCurrency})</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 160, verticalAlign: "bottom", lineHeight: 1.25 }}>% Obsolete on<br />Total Stock</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No records found</td></tr>
                          ) : (
                            filtered.map((item, idx) => {
                              const obs = Number(item.obsolete_stock !== undefined ? item.obsolete_stock : (item.obsolete || item.value || 0));
                              const tot = Number(item.total_stock_value !== undefined ? item.total_stock_value : (item.total || 0));
                              const pct = item.obsolete_percentage !== undefined && item.obsolete_percentage !== null
                                ? Number(item.obsolete_percentage)
                                : (tot > 0 ? (obs / tot) * 100 : 0);
                              const divName = item.parent_division_name || item.parentDiv || item.desc || item.name || "-";
                              return (
                              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                <td style={{ padding: "8px 10px", color: "#64748b" }}>{idx + 1}</td>
                                <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1e293b" }}>{divName}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#e11d48" }}>{obs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: pct > 50 ? "#dc2626" : "#e11d48" }}>{pct.toFixed(2)}%</td>
                              </tr>
                            )})
                          )}
                        </tbody>
                        {filtered.length > 0 && (
                          <tfoot>
                            <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                              <td style={{ padding: "10px 10px" }} />
                              <td style={{ padding: "10px 10px", color: "#1e3a8a" }}>Total</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: "#e11d48" }}>{totalObs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", color: totalPct > 50 ? "#dc2626" : "#e11d48" }}>{totalPct.toFixed(2)}%</td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    );
                  }
                  
                  if (viewAllModal === "details") {
                    if (modalDetailsLoading) {
                      return (
                        <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
                          Loading inventory details...
                        </div>
                      );
                    }

                    return (
                      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "0.80rem" }}>
                        <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#f8fafc" }}>
                          <tr style={{ borderBottom: "2px solid #cbd5e1" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, minWidth: 160, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Legal<br />Entity</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, minWidth: 130, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Parent<br />Division</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, minWidth: 130, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Sub-<br />Division</th>
                            <th style={{ padding: "8px 8px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 100, minWidth: 95, maxWidth: 110, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Subinventory<br />Code</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 130, minWidth: 120, maxWidth: 140, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Total Stock<br />Value ({currentCurrency})</th>
                            <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 65, minWidth: 60, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>0-30<br />Days</th>
                            <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 65, minWidth: 60, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>31-60<br />Days</th>
                            <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 65, minWidth: 60, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>61-90<br />Days</th>
                            <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 65, minWidth: 60, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>91-120<br />Days</th>
                            <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 70, minWidth: 65, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>121-180<br />Days</th>
                            <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 70, minWidth: 65, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>181-365<br />Days</th>
                            <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 85, minWidth: 80, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Obsolete Stock<br />(Above 365 Days)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modalPaginatedDetails.length === 0 ? (
                            <tr><td colSpan={12} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No inventory records found</td></tr>
                          ) : (
                            modalPaginatedDetails.map((row, idx) => (
                              <tr key={row.id || idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                <td style={{ padding: "7px 10px", fontWeight: 600, color: "#1e293b", minWidth: 160, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.35 }}>{row.legal_entity}</td>
                                <td style={{ padding: "7px 10px", color: "#334155", minWidth: 130, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.35 }}>{row.parent_division}</td>
                                <td style={{ padding: "7px 10px", color: "#334155", minWidth: 130, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.35 }}>{row.subdivision}</td>
                                <td style={{ padding: "7px 8px", color: "#475569", width: 100, minWidth: 95, maxWidth: 110, whiteSpace: "nowrap" }}>{row.subinventory}</td>
                                <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a", width: 130, minWidth: 120, maxWidth: 140, whiteSpace: "nowrap" }}>{Number(row.total_stock_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={{ padding: "7px 6px", textAlign: "right", width: 65, minWidth: 60 }}>{Number(row.aging_0_30 || 0).toFixed(0)}</td>
                                <td style={{ padding: "7px 6px", textAlign: "right", width: 65, minWidth: 60 }}>{Number(row.aging_31_60 || 0).toFixed(0)}</td>
                                <td style={{ padding: "7px 6px", textAlign: "right", width: 65, minWidth: 60 }}>{Number(row.aging_61_90 || 0).toFixed(0)}</td>
                                <td style={{ padding: "7px 6px", textAlign: "right", width: 65, minWidth: 60 }}>{Number(row.aging_91_120 || 0).toFixed(0)}</td>
                                <td style={{ padding: "7px 6px", textAlign: "right", width: 70, minWidth: 65 }}>{Number(row.aging_121_180 || 0).toFixed(0)}</td>
                                <td style={{ padding: "7px 6px", textAlign: "right", width: 70, minWidth: 65 }}>{Number(row.aging_181_365 || 0).toFixed(0)}</td>
                                <td style={{ padding: "7px 6px", textAlign: "right", color: "#e11d48", fontWeight: 600, width: 85, minWidth: 80 }}>{(Number(row.aging_366_730 || 0) + Number(row.aging_above_730 || 0)).toFixed(0)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {modalFilteredDetails.length > 0 && (
                          <tfoot style={{ position: "sticky", bottom: 0, zIndex: 10, background: "#f8fafc" }}>
                            <tr style={{ fontWeight: 800, borderTop: "2px solid #cbd5e1", background: "#f8fafc", boxShadow: "0 -2px 6px rgba(0,0,0,0.06)" }}>
                              <td colSpan={4} style={{ padding: "9px 10px", color: "#1e3a8a", background: "#f8fafc" }}>Total ({modalFilteredDetails.length} items)</td>
                              <td style={{ padding: "9px 10px", textAlign: "right", color: "#1e293b", background: "#f8fafc", width: 130, minWidth: 120, maxWidth: 140 }}>{modalTotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td colSpan={7} style={{ padding: "9px 10px", background: "#f8fafc" }} />
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    );
                  }

                  return null;
                })()}
              </div>

              {/* Modal Footer with Pagination for details */}
              {viewAllModal === "details" ? (
                <div
                  style={{
                    padding: "10px 20px",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#f8fafc",
                    flexWrap: "wrap",
                    gap: 10,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                      {modalFilteredDetails.length > 0
                        ? `Showing ${safeModalPage * modalDetailPageSize + 1} to ${Math.min((safeModalPage + 1) * modalDetailPageSize, modalFilteredDetails.length)} of ${modalFilteredDetails.length} entries`
                        : "No records"}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: "0.73rem", color: "#64748b" }}>Rows per page:</span>
                      <select
                        value={modalDetailPageSize}
                        onChange={(e) => {
                          setModalDetailPageSize(Number(e.target.value));
                          setModalDetailPage(0);
                        }}
                        style={{
                          padding: "3px 8px",
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
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => setModalDetailPage(0)}
                      disabled={safeModalPage === 0}
                      title="First Page"
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: safeModalPage === 0 ? "#f1f5f9" : "#fff",
                        color: safeModalPage === 0 ? "#94a3b8" : "#1e3a8a",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: safeModalPage === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      « First
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalDetailPage(p => Math.max(0, p - 1))}
                      disabled={safeModalPage === 0}
                      title="Previous Page"
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: safeModalPage === 0 ? "#f1f5f9" : "#fff",
                        color: safeModalPage === 0 ? "#94a3b8" : "#1e3a8a",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: safeModalPage === 0 ? "not-allowed" : "pointer",
                      }}
                    >
                      ← Prev
                    </button>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#1e3a8a", minWidth: 70, textAlign: "center" }}>
                      Page {modalFilteredDetails.length > 0 ? safeModalPage + 1 : 0} of {modalTotalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalDetailPage(p => Math.min(modalTotalPages - 1, p + 1))}
                      disabled={safeModalPage >= modalTotalPages - 1}
                      title="Next Page"
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: safeModalPage >= modalTotalPages - 1 ? "#f1f5f9" : "#fff",
                        color: safeModalPage >= modalTotalPages - 1 ? "#94a3b8" : "#1e3a8a",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: safeModalPage >= modalTotalPages - 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      Next →
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalDetailPage(modalTotalPages - 1)}
                      disabled={safeModalPage >= modalTotalPages - 1}
                      title="Last Page"
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        background: safeModalPage >= modalTotalPages - 1 ? "#f1f5f9" : "#fff",
                        color: safeModalPage >= modalTotalPages - 1 ? "#94a3b8" : "#1e3a8a",
                        fontSize: "0.74rem",
                        fontWeight: 600,
                        cursor: safeModalPage >= modalTotalPages - 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      Last »
                    </button>

                    <div style={{ width: 1, height: 22, background: "#cbd5e1", margin: "0 6px" }} />

                    <button
                      type="button"
                      onClick={() => {
                        setViewAllModal(null);
                        setViewAllSearch("");
                      }}
                      style={{
                        padding: "6px 16px",
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
              ) : (
                <div
                  style={{
                    padding: "10px 20px",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#f8fafc",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                    Live inventory snapshot data
                  </span>
                  <button
                    type="button"
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
              )}
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
    gridTemplateColumns: "1fr 2fr",
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
    height: 250,
    minHeight: 250,
  },

  donutRow: {
    minHeight: 240,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 10,
    flex: 1,
  },

  donutWrapper: {
    width: 155,
    height: 155,
    flex: "0 0 155px",
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
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    flex: 1,
    height: "100%",
    padding: "6px 0",
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
    gridTemplateColumns: "minmax(70px, 1fr) 60px 46px",
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
    gridTemplateColumns: "minmax(70px, 1fr) 60px 46px",
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
    gridTemplateColumns: "minmax(70px, 1fr) 60px 46px",
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
      white-space: normal !important;
      line-height: 1.15 !important;
      vertical-align: bottom !important;
      text-align: left;
      padding: 6px 6px !important;
      border-bottom: 2px solid #e2e8f0;
      font-size: 0.72rem;
      word-break: break-word;
    }

    table td {
      padding: 6px 8px;
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
      padding: 7px 6px !important;
      font-size: 0.76rem !important;
      letter-spacing: -0.01em !important;
      color: #1e3a8a !important;
      font-weight: 700 !important;
      vertical-align: bottom !important;
      line-height: 1.15 !important;
      white-space: normal !important;
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




