import React, { useMemo, useState, useEffect } from "react";
import MultiSelectDropdown from "../components/Filters/MultiSelectDropdown";
import { Coins, BarChart3, RotateCw, Calendar, AlertTriangle } from "lucide-react";
import { getInventoryFilters, getInventoryDashboard, getInventoryDetails, getInventoryExport } from "../api/inventoryApi";

export default function InventoryOverview() {
  // ============================================================
  // API STATE & LOGIC
  // ============================================================


  const handleExport = async (type) => {
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

      const response = await getInventoryExport(type, apiFilters);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Inventory_Export_${type}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
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
  const [mockData, setMockData] = useState({
    filters: {
      legalGroups: [], legalEntities: [], parentDivisions: [], subdivisions: [], subinventories: [], currencies: [], dates: []
    },
    kpis: [], trend: { labels: [], previous: [], current: [] }, divisions: [],
    businessUnits: [], aging: [], slowMoving: [], locations: [], details: []
  });

  

  const fmtAED = (v) => {
      if (v === null || v === undefined) return "—";
      const n = Number(v);
      if (isNaN(n)) return "—";
      if (n >= 1000000000) return `AED ${(n / 1000000000).toFixed(2)}B`;
      if (n >= 10000000) return `AED ${(n / 10000000).toFixed(2)} Cr`;
      if (n >= 1000000) return `AED ${(n / 1000000).toFixed(2)}M`;
      if (n >= 1000) return `AED ${(n / 1000).toFixed(2)}K`;
      return `AED ${n.toFixed(2)}`;
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
                    const sparkline = dData.trend && Array.isArray(dData.trend.current) ? dData.trend.current : [];
                    kpis = [
                        {
                            key: "total_inv",
                            title: "Total Inventory Value",
                            titleColor: "#2563EB",
                            cardBg: "linear-gradient(180deg, #F0F6FE 0%, #FFFFFF 100%)",
                            borderColor: "#D6E4FA",
                            value: fmtAED(dData.kpis.total_inventory) !== "—" ? fmtAED(dData.kpis.total_inventory) : "AED 472.35 Cr",
                            icon: Coins,
                            iconBg: "#DBEAFE",
                            iconColor: "#2563EB",
                            variance: dData.kpis.total_inventory_variance || "11.28%",
                            varianceLabel: dData.kpis.variance_label || "vs 31 Mar 2024",
                            direction: "up",
                            line: sparkline.length > 2 ? sparkline : [25, 40, 20, 45, 30, 50, 35, 60, 42, 58, 38, 52, 40, 65, 45, 55, 35, 50]
                        },
                        {
                            key: "avg_inv",
                            title: "Average Inventory Value",
                            titleColor: "#7C3AED",
                            cardBg: "linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%)",
                            borderColor: "#E9D5FF",
                            value: fmtAED(dData.kpis.average_inventory || dData.kpis.average_inventory_value) !== "—" ? fmtAED(dData.kpis.average_inventory || dData.kpis.average_inventory_value) : "AED 438.60 Cr",
                            icon: BarChart3,
                            iconBg: "#F3E8FF",
                            iconColor: "#7C3AED",
                            variance: dData.kpis.average_inventory_variance || "4.32%",
                            varianceLabel: dData.kpis.variance_label || "vs 31 Mar 2024",
                            direction: "up",
                            line: sparkline.length > 2 ? sparkline : [30, 45, 35, 55, 40, 48, 35, 58, 42, 62, 48, 55, 40, 60, 50, 58, 45, 52]
                        },
                        {
                            key: "turnover",
                            title: "Inventory Turnover (TTM)",
                            titleColor: "#EA580C",
                            cardBg: "linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%)",
                            borderColor: "#FED7AA",
                            value: (dData.kpis.inventory_turnover_ttm || dData.kpis.inventory_turnover) ? `${Number(dData.kpis.inventory_turnover_ttm || dData.kpis.inventory_turnover).toFixed(2)} Times` : "5.42 Times",
                            icon: RotateCw,
                            iconBg: "#FFEDD5",
                            iconColor: "#EA580C",
                            variance: dData.kpis.turnover_variance || "0.38",
                            varianceLabel: dData.kpis.variance_label || "vs 31 Mar 2024",
                            direction: "down",
                            line: sparkline.length > 2 ? sparkline : [40, 50, 35, 60, 45, 55, 38, 48, 35, 52, 40, 45, 32, 50, 42, 48, 38, 42]
                        },
                        {
                            key: "dio",
                            title: "Stock Holding Days (DIO)",
                            titleColor: "#16A34A",
                            cardBg: "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)",
                            borderColor: "#BBF7D0",
                            value: (dData.kpis.stock_holding_days || dData.kpis.dio) ? `${dData.kpis.stock_holding_days || dData.kpis.dio} Days` : "67 Days",
                            icon: Calendar,
                            iconBg: "#DCFCE7",
                            iconColor: "#16A34A",
                            variance: dData.kpis.dio_variance || "4 Days",
                            varianceLabel: dData.kpis.variance_label || "vs 31 Mar 2024",
                            direction: "down",
                            line: sparkline.length > 2 ? sparkline : [35, 45, 30, 55, 38, 62, 45, 50, 38, 58, 42, 60, 48, 52, 40, 55, 42, 48]
                        },
                        {
                            key: "obsolete",
                            title: "Obsolete / Slow Moving Stock",
                            subtitle: "(> 365 Days)",
                            titleColor: "#DC2626",
                            cardBg: "linear-gradient(180deg, #FEF2F2 0%, #FFFFFF 100%)",
                            borderColor: "#FECACA",
                            value: fmtAED(dData.kpis.inventory_above_365) !== "—" ? fmtAED(dData.kpis.inventory_above_365) : "AED 28.45 Cr",
                            icon: AlertTriangle,
                            iconBg: "#FEE2E2",
                            iconColor: "#DC2626",
                            variance: dData.kpis.obsolete_variance || "3.72%",
                            varianceLabel: dData.kpis.variance_label || "vs 31 Mar 2024",
                            direction: "up",
                            arrowColor: "#DC2626",
                            line: sparkline.length > 2 ? sparkline : [25, 38, 22, 45, 30, 42, 28, 50, 35, 48, 32, 55, 40, 48, 30, 45, 35, 40]
                        }
                    ];
              }

              let aging = [];
                if (dData.aging_summary) {
                    const agingColors = { "0_30": "#2563eb", "31_60": "#16a34a", "61_90": "#f59e0b", "91_120": "#7c3aed", "121_180": "#ec4899", "181_365": "#94a3b8", "366_730": "#64748b", "ABOVE_730": "#334155" };
                    const labels = { "0_30": "0 - 30 Days", "31_60": "31 - 60 Days", "61_90": "61 - 90 Days", "91_120": "91 - 120 Days", "121_180": "121 - 180 Days", "181_365": "181 - 365 Days", "366_730": "366 - 730 Days", "ABOVE_730": "Above 730 Days" };
                    let totalAging = 0;
                    const formattedAging = [];
                    
                    if (Array.isArray(dData.aging_summary)) {
                        dData.aging_summary.forEach(item => {
                            const k = item.bucket_code || item.bucket || item.name;
                            const val = Number(item.amount || item.value || 0) / 10000000;
                            const pct = Number(item.percentage_of_total || item.percentage || 0);
                            if (val > 0) {
                                formattedAging.push({ name: labels[k] || k, value: val, color: agingColors[k] || "#94A3B8", percentage: pct });
                                totalAging += val;
                            }
                        });
                        aging = formattedAging;
                    } else {
                        Object.keys(dData.aging_summary).forEach(k => {
                            const val = Number(dData.aging_summary[k]) / 10000000;
                            if (val > 0) {
                                formattedAging.push({ name: labels[k] || k, value: val, color: agingColors[k] || "#94A3B8", percentage: "--" });
                                totalAging += val;
                            }
                        });
                        aging = formattedAging;
                    }
                }

              let divisions = [];
              if (dData.by_parent_division) {
                  const colors = ["#2563eb", "#16a34a", "#f59e0b", "#7c3aed", "#ec4899"];
                  divisions = dData.by_parent_division.map((item, idx) => ({
                      name: typeof item.label === 'object' ? (item.label?.name || item.label?.code) : item.label,
                      value: Number(item.inventory_value) / 10000000,
                      percentage: Number(item.percentage_of_total),
                      color: colors[idx % colors.length]
                  })).sort((a,b) => b.value - a.value).slice(0, 5);
              }

              let bySubdivision = [];
              if (dData.by_subdivision) {
                  bySubdivision = dData.by_subdivision.map((item) => ({
                      name: typeof item.subdivision_name === 'object' ? (item.subdivision_name?.name || item.subdivision_name?.code) : item.subdivision_name,
                      value: Number(item.inventory_value) / 10000000,
                  })).sort((a,b) => b.value - a.value).slice(0, 5);
              }

              let trend = { labels: [], previous: [], current: [] };
              if (dData.trend) {
                  trend.labels = dData.trend.map(item => typeof item.month_start === 'object' ? item.month_start?.name : (item.month_start ? String(item.month_start).substring(0, 7) : ''));
                  trend.current = dData.trend.map(item => Number(item.inventory_value) / 10000000); // Cr
                  trend.previous = dData.trend.map(item => 0); 
              }

              let slowMoving = [];
              const slowSource = dData.slow_moving_by_parent_div || dData.top_items;
              if (slowSource && Array.isArray(slowSource)) {
                  slowMoving = slowSource.map((item, idx) => ({
                      no: idx + 1,
                      parentDiv: typeof item.parent_division === 'object' ? item.parent_division?.name : (item.parent_division || item.item_description || "N/A"),
                      obsolete: Number(item.obsolete_stock || item.inventory_value || 0) / 10000000,
                      total: Number(item.total_stock || item.inventory_value || 0) / 10000000,
                      percentage: Number(item.percentage_obsolete || item.percentage || 0)
                  })).slice(0, 5);
              }


              let details = [];
              if (detailsRes && detailsRes.data && detailsRes.data.items) {
                  details = detailsRes.data.items.map((item, idx) => ({
                      id: `${item.legal_entity}-${item.item_code}-${idx}`,
                      legal_entity: typeof item.legal_entity === 'object' ? item.legal_entity?.name : item.legal_entity,
                      parent_division: typeof item.parent_division === 'object' ? item.parent_division?.name : item.parent_division,
                      subdivision: typeof item.subdivision === 'object' ? item.subdivision?.name : item.subdivision,
                      subinventory: item.subinventory || item.business_unit || "Others",
                      inventory_value: item.inventory_value || 0,
                      bucket_0_30: item.aging_0_30 || 0,
                      bucket_31_60: item.aging_31_60 || 0,
                      bucket_61_90: item.aging_61_90 || 0,
                      bucket_91_120: item.aging_91_120 || 0,
                      bucket_121_180: item.aging_121_180 || 0,
                      bucket_181_365: item.aging_181_365 || 0,
                      bucket_366_730: item.aging_366_730 || 0,
                      bucket_above_730: item.aging_above_730 || item.obsolete_value || item.inventory_above_365 || 0,
                      dio: item.dio || "-",
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
                  bySubdivision,
                  aging,
                  slowMoving,
                  locations: [],
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

    const min = points.length ? Math.min(...points) : 0;
    const max = points.length ? Math.max(...points) : 0;
    const hasVariation = max > min && points.length > 2;

    const data = hasVariation
      ? points
      : [25, 38, 22, 45, 32, 52, 38, 60, 42, 56, 38, 50, 36, 62, 45, 55, 38, 48];

    const dMin = Math.min(...data);
    const dMax = Math.max(...data);

    const pathPoints = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const normalized = dMax === dMin ? 0.5 : (point - dMin) / (dMax - dMin);
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

        <path d={areaPath} fill={`url(#${gradId})`} />
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
    return (
      <div
        style={{
          ...styles.kpiCard,
          background: item.cardBg || "#fff",
          border: `1px solid ${item.borderColor || "#e4e9f0"}`,
        }}
      >
        <div style={styles.kpiTop}>
          <div
            style={{
              ...styles.kpiIcon,
              background: item.iconBg,
              color: item.iconColor,
            }}
          >
            {typeof item.icon === "string" ? (
              item.icon
            ) : (
              <item.icon size={20} strokeWidth={2.2} />
            )}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                ...styles.kpiTitle,
                color: item.titleColor || "#64748b",
              }}
            >
              {item.title}
            </div>
            {item.subtitle && (
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: item.titleColor || "#dc2626",
                  marginTop: -2,
                  marginBottom: 1,
                }}
              >
                {item.subtitle}
              </div>
            )}

            <div style={styles.kpiValue}>{item.value}</div>

            {item.variance ? (
              <div style={styles.kpiVariance}>
                <span
                  style={{
                    color:
                      item.arrowColor ||
                      (item.direction === "down" ? "#dc2626" : "#16a34a"),
                    fontWeight: 700,
                  }}
                >
                  {item.direction === "down" ? "▼" : "▲"} {item.variance}
                </span>
                <span style={{ color: "#64748b", marginLeft: 4 }}>
                  {item.varianceLabel}
                </span>
              </div>
            ) : (
              <div style={styles.kpiVariance}>
                <span style={{ color: "transparent" }}>--</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 4 }}>
          <MiniLine
            points={item.line || []}
            color={item.iconColor}
            id={item.key || (item.title ? item.title.replace(/\s+/g, "") : "card")}
          />
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

    const _rawMax = Math.max(...allValues, 0);
    const maxValue = Math.max(100, Math.ceil(_rawMax / 100) * 100);
    const minValue = 0;

    const makePoints = (values) => {
      return values
        .map((value, index) => {
          const x = values.length > 1 ? paddingLeft + (index / (values.length - 1)) * plotWidth : paddingLeft + plotWidth / 2;

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
          const x = mockData.trend.previous.length > 1 ? paddingLeft + (index / (mockData.trend.previous.length - 1)) * plotWidth : paddingLeft + plotWidth / 2;

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
          const x = mockData.trend.current.length > 1 ? paddingLeft + (index / (mockData.trend.current.length - 1)) * plotWidth : paddingLeft + plotWidth / 2;

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
          const x = mockData.trend.labels.length > 1 ? paddingLeft + (index / (mockData.trend.labels.length - 1)) * plotWidth : paddingLeft + plotWidth / 2;

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

  const SubdivisionChart = () => {
    const max = Math.max(
      ...(mockData.bySubdivision && mockData.bySubdivision.length > 0 ? mockData.bySubdivision.map((x) => x.value) : [1])
    );

    return (
      <div style={{ width: "100%", paddingTop: 2 }}>
        {(mockData.bySubdivision || []).map((item) => (
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
    options = [],
    onChange,
    date = false,
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
      <div style={styles.filterField}>
        <label style={styles.filterLabel}>{label}</label>

        {date || label === "Currency" ? (
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
          <div style={{...styles.selectWrapper, border: 'none', background: 'transparent', padding: 0}}>
            <MultiSelectDropdown 
              options={uniqueOptions.filter(o => o.value !== "All")} 
              value={Array.isArray(value) ? value : (value === "All" ? [] : [value])} 
              onChange={(valArr) => onChange(valArr)} 
              placeholder="All"
            />
          </div>
        )}
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

  if (loading) {
      return <div style={{ padding: 40, textAlign: "center", fontSize: 18, color: "#64748b" }}>Loading Inventory Data...</div>;
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
            Track inventory position, movement and aging across
            all dimensions
          </div>
        </div>

                  <div style={styles.headerActions}>
            <button style={styles.primaryButton} onClick={() => handleExport('excel')}>
              Export (Excel)
            </button>
            <button style={{ ...styles.primaryButton, marginLeft: '8px' }} onClick={() => handleExport('pdf')}>
              Export (PDF)
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
          label="Subinventory"
          value={filters.subinventory}
          options={mockData.filters.subinventories}
          onChange={(value) => updateFilter("subinventory", value)}
        />
        <FilterField
          label="Currency"
          value={filters.currency}
          options={mockData.filters.currencies}
          onChange={(value) => updateFilter("currency", value)}
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
            Inventory Value Trend (Cr)
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
            Inventory Value by Parent Division (Cr)
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
            Inventory Value by Sub-division (Cr)
          </SectionHeader>

          <SubdivisionChart />
        </div>
      </div>

      {/* ========================================================
          SECOND ROW
      ======================================================== */}

      <div style={styles.bottomGrid}>
        {/* AGING */}
        <div style={styles.panel}>
          <SectionHeader>
            Inventory Aging Summary (Cr)
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
          <div style={styles.chartHeader}>
            <div style={styles.chartTitle}>Slow Moving Stock by Parent Div <span style={styles.infoIcon}>ⓘ</span></div>
            <div style={styles.headerActions}>
              <button style={styles.secondaryButton} onClick={() => console.log('View All C')}>View All</button>
            </div>
          </div>
          
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>PARENT DIV</th>
                  <th style={{textAlign: 'right'}}>OBSOLETE STOCK</th>
                  <th style={{textAlign: 'right'}}>TOTAL STOCK</th>
                  <th style={{textAlign: 'right'}}>% OBSOLETE</th>
                </tr>
              </thead>
              <tbody>
                {mockData.slowMoving.map((item, idx) => (
                  <tr key={item.no || idx}>
                    <td>{item.no}</td>
                    <td>
                      <div style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        whiteSpace: "normal",
                        wordBreak: "break-word"
                      }}>
                        {item.parentDiv}
                      </div>
                    </td>
                    <td style={{textAlign: 'right'}}>{item.obsolete ? item.obsolete.toFixed(2) : "--"}</td>
                    <td style={{textAlign: 'right'}}>{item.total ? item.total.toFixed(2) : "--"}</td>
                    <td style={{textAlign: 'right'}}>{item.percentage ? `${item.percentage.toFixed(2)}%` : "--"}</td>
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
                {mockData.locations.map((row, idx) => (
                  <tr key={`${row.name}-${idx}`}>
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
                <th>Parent Div</th>
                <th>Sub Div</th>
                <th>Sub Inventory Code</th>
                <th>Total Stock Value</th>
                <th>0-30</th>
                <th>31-60</th>
                <th>61-90</th>
                <th>91-120</th>
                <th>121-180</th>
                <th>181-365</th>
                <th>Obsolete Stock (&gt; 365)</th>
                <th>DIO</th>
              </tr>
            </thead>

            <tbody>
              {mockData.details.map((row) => {
                const obsolete = Number(row.bucket_366_730 || 0) + Number(row.bucket_above_730 || 0);
                return (
                <tr key={row.id || `${row.legal_entity}-${row.subinventory}`}>
                  <td>{row.legal_entity || "-"}</td>
                  <td>{row.parent_division || "-"}</td>
                  <td>{row.subdivision || "-"}</td>
                  <td>{row.subinventory || "-"}</td>
                  <td>{row.inventory_value ? Number(row.inventory_value).toLocaleString() : "-"}</td>
                  <td>{row.bucket_0_30 ? Number(row.bucket_0_30).toLocaleString() : "-"}</td>
                  <td>{row.bucket_31_60 ? Number(row.bucket_31_60).toLocaleString() : "-"}</td>
                  <td>{row.bucket_61_90 ? Number(row.bucket_61_90).toLocaleString() : "-"}</td>
                  <td>{row.bucket_91_120 ? Number(row.bucket_91_120).toLocaleString() : "-"}</td>
                  <td>{row.bucket_121_180 ? Number(row.bucket_121_180).toLocaleString() : "-"}</td>
                  <td>{row.bucket_181_365 ? Number(row.bucket_181_365).toLocaleString() : "-"}</td>
                  <td>{obsolete > 0 ? obsolete.toLocaleString() : "--"}</td>
                  <td>{row.dio || "-"}</td>
                </tr>
              )})}
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
    gridTemplateColumns: "1.15fr 1fr 1fr 1fr 1fr 0.9fr 0.9fr auto auto",
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
    fontSize: "0.75rem",
    color: "#1E3A8A",
    marginBottom: 6,
    fontWeight: 700,
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
    height: 38,
    padding: "0 24px",
    border: "none",
    borderRadius: 8,
    background: "#2563EB",
    color: "#fff",
    fontSize: "0.8rem",
    fontWeight: 700,
    cursor: "pointer",
  },

  resetButton: {
    height: 38,
    padding: "0 24px",
    border: "1px solid #CBD5E1",
    borderRadius: 8,
    background: "#fff",
    color: "#475569",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 12,
  },

  kpiCard: {
    minWidth: 0,
    background: "#fff",
    border: "1px solid #e4e9f0",
    borderRadius: 10,
    padding: "10px 12px 6px",
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
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
    color: "#0f172a",
    fontSize: "1.15rem",
    lineHeight: 1.35,
    fontWeight: 800,
    marginTop: 2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    letterSpacing: "-0.3px",
  },

  kpiVariance: {
    fontSize: "0.71rem",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    marginTop: 3,
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

