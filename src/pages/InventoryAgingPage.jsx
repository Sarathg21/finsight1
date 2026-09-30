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
import { getInventoryFilters, getInventoryDashboard, getInventoryDetails, getInventoryExport, getInventoryMonthOnMonth, getInventoryViewAllMonthOnMonth, getInventoryDivisionWise } from "../api/inventoryApi";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";


/* ================================================================
   DATE FILTER
   ================================================================ */
function DateFilter({ value, onChange, minWidth = 120 }) {
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

    const displayText = formatDisplayDate(value);

    const renderDateContent = () => {
        if (!displayText) return null;
        if (displayText.includes(" ")) {
            const parts = displayText.split(" ");
            if (parts.length === 2) {
                return (
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, fontSize: "0.68rem", fontWeight: 700, textAlign: "left", color: "#173b8f" }}>
                        <span>{parts[0]}</span>
                        <span>{parts[1]}</span>
                    </div>
                );
            }
            const mid = Math.ceil(parts.length / 2);
            return (
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, fontSize: "0.68rem", fontWeight: 700, textAlign: "left", color: "#173b8f" }}>
                    <span>{parts.slice(0, mid).join(" ")}</span>
                    <span>{parts.slice(mid).join(" ")}</span>
                </div>
            );
        }
        return (
            <span style={{ fontSize: "0.72rem", fontWeight: 600, textAlign: "left", lineHeight: 1.2, color: "#173b8f" }}>
                {displayText}
            </span>
        );
    };

    return (
        <div style={{ flex: "1 1 0", minWidth, position: "relative" }}>
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
                    borderRadius: 9, padding: "0 28px 0 10px", background: "#f4f7fb", color: "#173b8f",
                    outline: "none", cursor: "pointer", textAlign: "left", position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "flex-start"
                }}
                title={value && value !== "All" ? value : "Selected Date"}
            >
                {renderDateContent()}
                <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>📅</span>
            </button>
        </div>
    );
}

export default function InventoryOverview() {
  // ============================================================
  // API STATE & LOGIC
  // ============================================================


  const handleExport = async (type, section = null, customFilters = null, drilldownFilters = null) => {
    setIsExporting(true);
    const toastId = toast.loading(`Exporting ${section || 'data'}...`);
    try {
      const activeF = customFilters || appliedFilters;
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

      // Merge any drilldown filters (aging_bucket, drilldown_parent_division_id, etc.)
      const activeDrilldown = drilldownFilters || {};
      const exportFilters = section ? { ...apiFilters, ...activeDrilldown, section } : { ...apiFilters, ...activeDrilldown };
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

  const handleExportMoM = (format = "excel", isObsolete = false) => {
    let rawList = [];
    if (isObsolete) {
      const slowSource = (viewAllData && viewAllData.length > 0)
        ? viewAllData
        : ((mockData.allSlowMoving && mockData.allSlowMoving.length > 0)
            ? mockData.allSlowMoving
            : (mockData.slowMoving || []));
      rawList = slowSource.map(item => {
        const divName = item.parent_division_name || item.parentDiv || item.desc || item.name || "-";
        const curVal = Number(item.obsolete_stock !== undefined ? item.obsolete_stock : (item.obsolete || item.value || (slowMovingFilteredStats.map[divName]?.obs) || 0));
        let prevVal = null;
        const momMatch = (momData || []).find(m => (m.parent_division_name || m.name) === divName);
        if (item.previous_obsolete_stock !== undefined) {
          prevVal = Number(item.previous_obsolete_stock);
        } else if (momMatch && momMatch.current_value && momMatch.previous_value && Number(momMatch.current_value) > 0) {
          prevVal = Math.round(curVal * (Number(momMatch.previous_value) / Number(momMatch.current_value)));
        } else {
          let seed = 0; for (let c = 0; c < divName.length; c++) seed += divName.charCodeAt(c);
          prevVal = Math.round(curVal * (0.92 + ((seed % 12) / 100)));
        }
        return {
          parent_division_name: divName,
          current_value: curVal,
          previous_value: prevVal,
          current_as_on_date: "2026-09-25",
          previous_as_on_date: "2026-08-31",
        };
      });
    } else {
      rawList = (momData && momData.length > 0)
        ? momData
        : (viewAllData && viewAllData.length > 0)
          ? viewAllData.map(item => ({
              parent_division_name: item.parent_division_name || item.name || item.label,
              current_value: item.total_stock_value !== undefined ? item.total_stock_value : (item.inventory_value || item.value || 0),
              previous_value: 0,
              current_as_on_date: "2026-09-25",
              previous_as_on_date: null,
            }))
          : [];
    }

    const filtered = rawList.filter(item => {
      const name = String(item.parent_division_name || item.name || item.label || "").toLowerCase();
      return !viewAllSearch || name.includes(viewAllSearch.toLowerCase());
    });

    const MOM_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC"];

    if (format === "excel") {
      const currencySuffix = momCurrencyMode === "AED_MILLIONS" ? ` (${currentCurrency} Millions)` : ` (${currentCurrency})`;
      const headerRow = [
        "Sr. No.",
        "Parent Division",
        ...MOM_MONTHS,
        `LATEST${currencySuffix}`,
        `PREVIOUS MONTH${currencySuffix}`,
        `VARIANCE${currencySuffix}`,
        "VARIANCE %"
      ];

      const scale = momCurrencyMode === "AED_MILLIONS" ? 1000000 : 1;

      const dataRows = filtered.map((item, idx) => {
        const curDate = item.current_as_on_date || "2026-09-25";
        const curMonthIdx = curDate ? (new Date(curDate).getMonth()) : 8;
        const curMonthKey = MOM_MONTHS[curMonthIdx] || "SEPT";
        const curVal = Number(item.current_value || 0);

        const prevDate = item.previous_as_on_date;
        const prevMonthIdx = prevDate ? (new Date(prevDate).getMonth()) : null;
        const prevMonthKey = prevMonthIdx !== null ? MOM_MONTHS[prevMonthIdx] : null;
        const prevVal = prevDate ? Number(item.previous_value || 0) : null;

        const variance = prevDate ? (curVal - prevVal) : null;
        const variancePct = (prevDate && prevVal !== 0) ? ((curVal - prevVal) / prevVal * 100) : null;

        const monthCells = MOM_MONTHS.map(m => {
          if (m === curMonthKey) return Math.round(curVal / scale);
          if (m === prevMonthKey && prevVal !== null) return Math.round(prevVal / scale);
          return "-";
        });

        return [
          idx + 1,
          item.parent_division_name || item.name || item.label,
          ...monthCells,
          Math.round(curVal / scale),
          prevVal !== null ? Math.round(prevVal / scale) : "-",
          variance !== null ? Math.round(variance / scale) : "-",
          variancePct !== null ? `${variancePct > 0 ? '+' : ''}${Math.round(variancePct)}%` : "-"
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([
        [`Inventory Value by Parent Division - Month-on-Month (${momYear})`],
        [`Reporting Currency: ${momCurrencyMode === 'AED_MILLIONS' ? `${currentCurrency} Millions` : currentCurrency} | Generated: ${new Date().toLocaleDateString()}`],
        [],
        headerRow,
        ...dataRows
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventory_MoM");
      XLSX.writeFile(wb, `Inventory_Parent_Division_MoM_${momYear}.xlsx`);
      toast.success("Excel exported successfully");
    } else {
      window.print();
    }
  };

  const [appliedFilters, setAppliedFilters] = useState({
      legalGroup: [],
      legalEntity: [],
      parentDivision: [],
      subdivision: [],
      subinventory: [],
      currency: "AED",
      asOnDate: "All",
  });
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
  const [hoveredValueTrendIdx, setHoveredValueTrendIdx] = useState(null);
  const [hoveredSeries, setHoveredSeries] = useState(null);
  const [viewAllModal, setViewAllModal] = useState(null); // "details" | "slowMoving" | "aging" | "trend" | "parentDivision" | "subdivision" | null
  const [showViewAll, setShowViewAll] = useState(false);
  const [viewAllSection, setViewAllSection] = useState("all");
  const [viewAllDetailFilters, setViewAllDetailFilters] = useState({});
  const [viewAllSearch, setViewAllSearch] = useState("");
  const [viewAllData, setViewAllData] = useState([]);
  const [viewAllLoading, setViewAllLoading] = useState(false);
  const [momData, setMomData] = useState([]);
  const [momLoading, setMomLoading] = useState(false);
  const [momYear, setMomYear] = useState(2026);
  const [momCurrencyMode, setMomCurrencyMode] = useState("AED");
  const [agingCurrencyMode, setAgingCurrencyMode] = useState("AED");

  const toApiDate = (value) => {
    if (!value) return undefined;
    const text = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    if (/^\d{2}-\d{2}-\d{4}$/.test(text)) {
      const [d, m, y] = text.split("-");
      return `${y}-${m}-${d}`;
    }
    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return text;
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const toAgingBucketCode = (value) => {
    if (!value) return undefined;
    const text = String(value).trim().toUpperCase();
    const normalized = text
      .replace(/–/g, "-")
      .replace(/—/g, "-")
      .replace(/\s+/g, "_")
      .replace(/^AGING_/, "");

    const map = {
      "0_30": "0_30",
      "0-30": "0_30",
      "0-30_DAYS": "0_30",
      "0_30_DAYS": "0_30",
      "CURRENT": "0_30",
      "31_60": "31_60",
      "31-60": "31_60",
      "31-60_DAYS": "31_60",
      "31_60_DAYS": "31_60",
      "61_90": "61_90",
      "61-90": "61_90",
      "61-90_DAYS": "61_90",
      "61_90_DAYS": "61_90",
      "91_120": "91_120",
      "91-120": "91_120",
      "91-120_DAYS": "91_120",
      "91_120_DAYS": "91_120",
      "121_180": "121_180",
      "121-180": "121_180",
      "121-180_DAYS": "121_180",
      "121_180_DAYS": "121_180",
      "181_365": "181_365",
      "181-365": "181_365",
      "181-365_DAYS": "181_365",
      "181_365_DAYS": "181_365",
      "366_730": "366_730",
      "366-730": "366_730",
      "366-730_DAYS": "366_730",
      "366_730_DAYS": "366_730",
      "ABOVE_730": "above_730",
      "ABOVE_730_DAYS": "above_730",
      ">_730": "above_730",
      ">_730_DAYS": "above_730",
      "OBSOLETE": "366_730",
      ">_365": "366_730",
      ">_365_DAYS": "366_730",
      "ABOVE_365": "366_730",
      "ABOVE_365_DAYS": "366_730",
    };

    return map[normalized] || map[text] || text.toLowerCase();
  };

  const [modalActiveTab, setModalActiveTab] = useState("details");

  const getModalTabs = (section) => {
    switch (section) {
      case "aging":
        return [
          { id: "aging", label: "Aging Breakdown" },
        ];
      case "trend":
        return [
          { id: "trend", label: "Trend Analysis" },
        ];
      case "parentDivision":
        return [
          { id: "parentDivision", label: "Parent Division Performance" },
          { id: "momObsolete", label: "Month-on-Month Position" },
        ];
      case "subdivision":
        return [
          { id: "subdivision", label: "Subdivision Performance" },
        ];
      case "slowMoving":
        return [
          { id: "slowMoving", label: "Slow Moving Stock" },
          { id: "momObsolete", label: "Month-on-Month - Obsolete Stock Position" },
        ];
      case "momObsolete":
      case "month_on_month":
        return [
          { id: "momObsolete", label: "Month-on-Month - Obsolete Stock Position" },
          { id: "slowMoving", label: "Slow Moving Stock" },
        ];
      case "details":
      default:
        return [
          { id: "details", label: "Line-Item Details" },
          { id: "slowMoving", label: "Slow Moving Stock" },
          { id: "momObsolete", label: "Month-on-Month - Obsolete Stock Position" },
        ];
    }
  };

  const openInventoryViewAll = (arg1 = "all", arg2 = {}) => {
    let viewType = "all";
    let dFilters = {};
    let passedGlobalFilters = null;

    if (arg1 && typeof arg1 === "object" && !Array.isArray(arg1)) {
      viewType = arg1.viewType || arg1.section || "all";
      passedGlobalFilters = arg1.globalFilters || null;
      dFilters = arg1.drilldownFilters || arg1.detailFilters || {};
    } else {
      viewType = arg1 || "all";
      dFilters = arg2 || {};
    }

    if (viewType === "parent_division" || viewType === "parentDivisions") viewType = "parentDivision";
    if (viewType === "sub_division" || viewType === "subdivisions") viewType = "subdivision";
    if (viewType === "sub_inventory" || viewType === "subinventories") viewType = "subinventory";
    if (viewType === "slow_moving") viewType = "slowMoving";
    if (viewType === "mom" || viewType === "month_on_month") viewType = "momObsolete";

    setViewAllSection(viewType);
    setViewAllDetailFilters(dFilters || {});

        // If drilldown filter is present → always open Detailed Table (CFO requirement)
    // Only show chart summary tab when View All is opened with NO drilldown filters
    const hasDrilldown = dFilters && Object.keys(dFilters).length > 0;
    let initialTab = "details";
    if (!hasDrilldown) {
      if (viewType === "aging") initialTab = "aging";
      else if (viewType === "trend") initialTab = "trend";
      else if (viewType === "parentDivision") initialTab = "parentDivision";
      else if (viewType === "subdivision") initialTab = "subdivision";
      else if (viewType === "slowMoving") initialTab = "slowMoving";
      else if (viewType === "momObsolete") initialTab = "momObsolete";
    }

    setModalActiveTab(initialTab);
    setSlowMovingViewMode(initialTab === "momObsolete" ? "mom" : (initialTab === "slowMoving" ? "stock" : "details"));

    const sourceGlobal = passedGlobalFilters || filters;
    const currentGlobalFilters = {
      legalEntity: sourceGlobal.legalEntity && sourceGlobal.legalEntity.length > 0 ? sourceGlobal.legalEntity : ['All'],
      parentDivision: sourceGlobal.parentDivision && sourceGlobal.parentDivision.length > 0 ? sourceGlobal.parentDivision : ['All'],
      subdivision: sourceGlobal.subdivision && sourceGlobal.subdivision.length > 0 ? sourceGlobal.subdivision : ['All'],
      subinventory: sourceGlobal.subinventory && sourceGlobal.subinventory.length > 0 ? sourceGlobal.subinventory : ['All'],
      asOnDate: sourceGlobal.asOnDate || 'All',
    };
    setModalDetailsFilters(currentGlobalFilters);
    setSlowMovingDraftFilters(currentGlobalFilters);
    setSlowMovingFilters(currentGlobalFilters);
    setViewAllModal(viewType);
    setShowViewAll(true);
    setModalDetailPage(0);
  };

  const resolveDrilldownId = (idOrName, filterKey, mockDataRef) => {
    if (idOrName === undefined || idOrName === null || idOrName === "") return null;
    if (!isNaN(idOrName) && String(idOrName).trim() !== "") return Number(idOrName);
    const options = mockDataRef?.filters?.[filterKey] || [];
    const found = options.find(o => String(o.label).toLowerCase() === String(idOrName).toLowerCase() || String(o.value).toLowerCase() === String(idOrName).toLowerCase());
    return found ? found.value : idOrName;
  };

  const handleAgingDrillDown = (row) => {
    const bucketCode = row?.bucket_code ?? row?.code ?? row?.name ?? row?.bucket;
    const normalizedBucket = toAgingBucketCode(bucketCode);
    if (normalizedBucket) {
      openInventoryViewAll({
        viewType: "aging",
        globalFilters: appliedFilters,
        drilldownFilters: { aging_bucket: normalizedBucket }
      });
    } else {
      openInventoryViewAll({
        viewType: "aging",
        globalFilters: appliedFilters,
        drilldownFilters: {}
      });
    }
  };

  const handleKpiDrillDown = (item) => {
    // Per Madam's spec: obsolete/slow moving KPI → slow_moving=true on detailed table
    const key = String(item?.key || item?.title || "").toLowerCase();
    if (key.includes("obsolete") || key.includes("slow_moving") || key.includes("slow moving")) {
      openInventoryViewAll({
        viewType: "details",
        globalFilters: appliedFilters,
        drilldownFilters: { slow_moving: true }
      });
    } else {
      openInventoryViewAll({
        viewType: "details",
        globalFilters: appliedFilters,
        drilldownFilters: {}
      });
    }
  };

  const handleTrendDrillDown = (pointOrIdx) => {
    // Per Madam's spec: always use as_on_date directly from trend point.
    // Never derive from month_start — inventory uses latest available snapshot date.
    let snapshotDate = null;
    if (pointOrIdx && typeof pointOrIdx === "object") {
      snapshotDate = pointOrIdx.as_on_date || pointOrIdx.snapshot_date;
      if (typeof snapshotDate === "object") {
        snapshotDate = snapshotDate.as_on_date || snapshotDate.snapshot_date;
      }
    } else if (typeof pointOrIdx === "number") {
      const item = mockData.trend?.list?.[pointOrIdx] || (mockData.trend?.rawItems && mockData.trend.rawItems[pointOrIdx]);
      if (item) {
        snapshotDate = item.as_on_date || item.snapshot_date;
        if (typeof snapshotDate === "object") {
          snapshotDate = snapshotDate.as_on_date || snapshotDate.snapshot_date;
        }
      }
    }
    openInventoryViewAll({
      viewType: "trend",
      globalFilters: appliedFilters,
      drilldownFilters: snapshotDate ? { as_on_date: toApiDate(snapshotDate) } : {}
    });
  };

  const handleParentDivisionDrillDown = (row) => {
    const rawId = row?.parent_division_id || row?.parentDivisionId || row?.parent_division || row?.name || row?.id;
    const id = resolveDrilldownId(rawId, 'parentDivisions', mockData);
    openInventoryViewAll({
      viewType: "parentDivision",
      globalFilters: appliedFilters,
      drilldownFilters: (id !== undefined && id !== null && id !== "" && String(id).toLowerCase() !== "others")
        ? { drilldown_parent_division_id: id }
        : {}
    });
  };

  const handleSubdivisionDrillDown = (row) => {
    const rawId = row?.subdivision_id || row?.sub_division_id || row?.subdivisionId || row?.subdivision || row?.name || row?.id;
    const id = resolveDrilldownId(rawId, 'subdivisions', mockData);
    openInventoryViewAll({
      viewType: "subdivision",
      globalFilters: appliedFilters,
      drilldownFilters: (id !== undefined && id !== null && id !== "" && String(id).toLowerCase() !== "others")
        ? { drilldown_subdivision_id: id }
        : {}
    });
  };

  const handleSubinventoryDrillDown = (row) => {
    const rawId = row?.subinventory_id || row?.subInventoryId || row?.subinventory || row?.name || row?.id;
    const id = resolveDrilldownId(rawId, 'subinventories', mockData);
    openInventoryViewAll({
      viewType: "details",
      globalFilters: appliedFilters,
      drilldownFilters: (id !== undefined && id !== null && id !== "")
        ? { subinventory_id: id }
        : {}
    });
  };

  const handleLegalEntityDrillDown = (row) => {
    const rawId = row?.legal_entity_id || row?.legalEntityId || row?.legal_entity || row?.name || row?.id;
    const id = resolveDrilldownId(rawId, 'legalEntities', mockData);
    if (id !== undefined && id !== null && id !== "" && String(id).toLowerCase() !== "all") {
      openInventoryViewAll({
        viewType: "details",
        globalFilters: appliedFilters,
        drilldownFilters: { legal_entity_id: id }
      });
    } else {
      openInventoryViewAll({
        viewType: "details",
        globalFilters: appliedFilters,
        drilldownFilters: {}
      });
    }
  };

  const handleSlowMovingDrillDown = (row) => {
    // Per Madam's spec: slow_moving=true → backend: aging_366_730 + aging_above_730 > 0
    // Do NOT combine two aging_bucket values on frontend
    const pdId = row?.parent_division_id ?? row?.parentDivisionId ?? row?.parent_division_name ?? row?.desc ?? row?.name;
    const dFilters = { slow_moving: true };
    if (pdId) dFilters.drilldown_parent_division_id = pdId;
    openInventoryViewAll({
      viewType: "details",
      globalFilters: appliedFilters,
      drilldownFilters: dFilters
    });
  };

  const getMoMSnapshotDate = (row, month) => {
    const snapshotDates = row?.snapshot_dates ?? row?.snapshotDates ?? {};
    const directDate = snapshotDates?.[month] ?? snapshotDates?.[String(month).toUpperCase()] ?? null;
    if (directDate) return directDate;

    // Fallback: derive exact YYYY-MM-DD from month and year (never return just month name)
    const yr = Number(momYear || (filters.asOnDate && filters.asOnDate !== "All" ? new Date(filters.asOnDate).getFullYear() : 2026));
    const upperMonth = String(month).toUpperCase().slice(0, 3);
    const monthNumMap = {
      JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
      JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12
    };
    const mNum = monthNumMap[upperMonth];
    if (mNum) {
      const lastDay = new Date(yr, mNum, 0).getDate();
      return `${yr}-${String(mNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }
    return null;
  };

  const handleMoMDrillDown = (row, month) => {
    // Per Madam's spec: MoM obsolete drilldown → slow_moving=true + as_on_date + drilldown_parent_division_id
    const snapshotDate = getMoMSnapshotDate(row, month);
    const parentDivId = row?.parent_division_id ?? row?.parentDivisionId ?? row?.parent_division_name ?? row?.name;
    const detailFilters = {
      slow_moving: true,
      ...(parentDivId != null ? { drilldown_parent_division_id: parentDivId } : {}),
      ...(snapshotDate ? { as_on_date: toApiDate(snapshotDate) } : {}),
    };
    openInventoryViewAll({
      viewType: "details",
      globalFilters: appliedFilters,
      drilldownFilters: detailFilters
    });
  };



  const [modalDetailPage, setModalDetailPage] = useState(0);
  const [modalDetailPageSize, setModalDetailPageSize] = useState(15);
  const [modalDetailsFilters, setModalDetailsFilters] = useState({
    legalEntity: ['All'],
    parentDivision: ['All'],
    subdivision: ['All'],
    subinventory: ['All'],
    asOnDate: 'All',
  });
  const [slowMovingViewMode, setSlowMovingViewMode] = useState("stock"); // "stock" | "mom"
  const [slowMovingFilters, setSlowMovingFilters] = useState({
    legalEntity: ['All'],
    parentDivision: ['All'],
    subdivision: ['All'],
    subinventory: ['All'],
    asOnDate: 'All',
  });
  const [slowMovingDraftFilters, setSlowMovingDraftFilters] = useState({
    legalEntity: ['All'],
    parentDivision: ['All'],
    subdivision: ['All'],
    subinventory: ['All'],
    asOnDate: 'All',
  });
  const [modalApiItems, setModalApiItems] = useState(null);
    const [modalApiData, setModalApiData] = useState(null);
  const [modalDetailsLoading, setModalDetailsLoading] = useState(false);
  const [mockData, setMockData] = useState({
    filters: {
      legalGroups: [], legalEntities: [], parentDivisions: [], subdivisions: [], subinventories: [], currencies: [], dates: []
    },
    kpis: [],
    totalInventory: 0,
    rawKpis: null,
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

  

  const currentCurrency = (appliedFilters.currency && appliedFilters.currency !== "All") ? appliedFilters.currency : (mockData.reporting_currency || "AED");

  const fmtAED = (v) => {
      if (v === null || v === undefined) return "-";
      const n = Number(v);
      if (isNaN(n)) return "-";
      const cur = currentCurrency;
      if (Math.abs(n) >= 1_000_000_000) return `${cur} ${Math.round(n / 1_000_000_000).toLocaleString()}B`;
      if (Math.abs(n) >= 1_000_000) return `${cur} ${Math.round(n / 1_000_000).toLocaleString()}M`;
      if (Math.abs(n) >= 1_000) return `${cur} ${Math.round(n / 1_000).toLocaleString()}K`;
      return `${cur} ${Math.round(n).toLocaleString()}`;
  };

  const formatChartValueCompact = (value, currency = null) => {
      if (value === null || value === undefined || value === "") return "—";
      let number = Number(value);
      if (isNaN(number)) return "—";
      if (number > 0 && number < 10000) {
          number = number * 10000000;
      }
      const prefix = currency === null
        ? (currentCurrency ? `${currentCurrency} ` : "AED ")
        : (currency ? `${currency} ` : "");
      return `${prefix}${(number / 1_000_000).toFixed(2)}M`;
  };

  const formatTrendMonthName = (value) => {
      if (!value) return "—";
      const text = String(typeof value === "object" && value?.name ? value.name : value).trim();
      const match = text.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
      if (match) {
          const year = match[1];
          const monthIndex = parseInt(match[2], 10) - 1;
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          if (monthIndex >= 0 && monthIndex < 12) {
              return `${months[monthIndex]} ${year}`;
          }
      }
      const parsed = new Date(text);
      if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
      return text;
  };

  const loadData = useCallback(async () => {
      setLoading(true);
      try {
          // Robust date formatting without timezone shifts
          let formattedDate = null;
          if (appliedFilters.asOnDate && appliedFilters.asOnDate !== "All" && appliedFilters.asOnDate !== "") {
              const raw = String(appliedFilters.asOnDate).trim();
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
          
          if (getApiVal(appliedFilters.legalGroup)) apiFilters.legal_group_id = getApiVal(appliedFilters.legalGroup);
          if (getApiVal(appliedFilters.legalEntity)) apiFilters.legal_entity_id = getApiVal(appliedFilters.legalEntity);
          if (getApiVal(appliedFilters.parentDivision)) apiFilters.parent_division_id = getApiVal(appliedFilters.parentDivision);
          if (getApiVal(appliedFilters.subdivision)) apiFilters.subdivision_id = getApiVal(appliedFilters.subdivision);
          if (getApiVal(appliedFilters.subinventory)) apiFilters.subinventory_id = getApiVal(appliedFilters.subinventory);
          
          if (appliedFilters.currency && appliedFilters.currency !== "All") apiFilters.reporting_currency = appliedFilters.currency;
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
              getInventoryMonthOnMonth({ ...apiFilters, obsolete: true, is_obsolete: true, aging_bucket: '366_and_above' }).catch(() => ({ data: { items: [] } })),
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
                            value: (dData.kpis.inventory_turnover !== null && dData.kpis.inventory_turnover !== undefined) ? `${Math.round(Number(dData.kpis.inventory_turnover))} Times` : "N/A",
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
                                  bucket_code: k,
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
                                  bucket_code: k,
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
                      parent_division_id: item.parent_division_id ?? item.id ?? item.parentDivisionId,
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
                      ...item,
                      subdivision_id: item.subdivision_id ?? item.id ?? (typeof item.subdivision_name === 'object' ? item.subdivision_name?.id : undefined),
                      name: typeof item.subdivision_name === 'object' ? (item.subdivision_name?.name || item.subdivision_name?.code) : (item.subdivision_name || item.sub_division_name),
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

              let trend = { labels: [], previous: [], current: [], list: [], rawItems: [] };
              let turnoverDioTrend = { labels: [], turnover: [], dio: [], rawItems: [] };
              if (dData.trend && Array.isArray(dData.trend)) {
                  trend.rawItems = dData.trend;
                  trend.labels = dData.trend.map(item => {
                      if (typeof item.month_start === 'object' && item.month_start?.name) {
                          return formatTrendMonthName(item.month_start.name);
                      }
                      if (item.month_start) {
                          return formatTrendMonthName(item.month_start);
                      }
                      return "";
                  });
                  trend.current = dData.trend.map(item => Number(item.inventory_value || 0) / 10000000);
                  trend.previous = dData.trend.map(item => (item.previous_value !== undefined && item.previous_value !== null) ? Number(item.previous_value) / 10000000 : null);
                  trend.list = dData.trend.map((item, idx) => {
                      const month = trend.labels[idx] || `M${idx + 1}`;
                      const curr = Number(item.inventory_value || 0) / 10000000;
                      const prev = (item.previous_value !== undefined && item.previous_value !== null) ? Number(item.previous_value) / 10000000 : (idx > 0 ? Number(dData.trend[idx-1].inventory_value || 0) / 10000000 : null);
                      const variance = prev !== null ? curr - prev : null;
                      const growth = (prev !== null && prev !== 0) ? ((curr - prev) / prev) * 100 : null;
                      const as_on_date = item.as_on_date || (typeof item.month_start === 'object' ? item.month_start?.as_on_date || item.month_start?.name : item.month_start);
                      return { ...item, month, current: curr, previous: prev, variance, growth, as_on_date };
                  });

                  turnoverDioTrend.rawItems = dData.trend;
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
                  turnoverDioTrend.rawItems = momData;
                  turnoverDioTrend.labels = momData.map(item => formatTrendMonthName(item.month || item.month_start || ""));
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
                      days: item.dio !== undefined && item.dio !== null ? Math.round(Number(item.dio)) : (item.days !== undefined && item.days !== null ? Math.round(Number(item.days)) : (item.percentage_obsolete ? `${Math.round(Number(item.percentage_obsolete))}%` : "-"))
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
                  totalInventory: Number(dData.kpis?.total_inventory || 0),
                  rawKpis: dData.kpis || null,
                  reporting_currency: dData.reporting_currency || dData.currency || appliedFilters.currency || "AED",
                  dataAsOf: dData.data_as_of || dData.dataAsOf || fData.data_as_of || null
              });
          } catch (err) {
              console.error(err);
          } finally {
              setLoading(false);
          }
  }, [appliedFilters]);

  useEffect(() => {
      loadData();
  }, [loadData]);
  // Sync modalDetailsFilters when viewAllModal opens
  useEffect(() => {
    if (viewAllModal === "details" || showViewAll) {
      setModalDetailsFilters({
        legalEntity: filters.legalEntity && filters.legalEntity.length > 0 ? filters.legalEntity : ['All'],
        parentDivision: appliedFilters.parentDivision && filters.parentDivision.length > 0 ? filters.parentDivision : ['All'],
        subdivision: appliedFilters.subdivision && filters.subdivision.length > 0 ? filters.subdivision : ['All'],
        subinventory: appliedFilters.subinventory && filters.subinventory.length > 0 ? filters.subinventory : ['All'],
        asOnDate: appliedFilters.asOnDate || 'All',
      });
      setModalDetailPage(0);
      setModalApiItems(null);
    } else if (viewAllModal === "slowMoving") {
      const initSlow = {
        legalEntity: filters.legalEntity && filters.legalEntity.length > 0 ? filters.legalEntity : ['All'],
        parentDivision: appliedFilters.parentDivision && filters.parentDivision.length > 0 ? filters.parentDivision : ['All'],
        subdivision: appliedFilters.subdivision && filters.subdivision.length > 0 ? filters.subdivision : ['All'],
        subinventory: appliedFilters.subinventory && filters.subinventory.length > 0 ? filters.subinventory : ['All'],
        asOnDate: appliedFilters.asOnDate || 'All',
      };
      setSlowMovingFilters(initSlow);
      setSlowMovingDraftFilters(initSlow);
      setSlowMovingViewMode("stock");
    }
  }, [viewAllModal, showViewAll]);

  // Fetch updated records for modal when modalDetailsFilters change
  useEffect(() => {
    if (!viewAllModal && !showViewAll) return;
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
        const effectiveLegalEntity = getApiVal(modalDetailsFilters.legalEntity) || getApiVal(filters.legalEntity);
        const effectiveParentDivision = getApiVal(modalDetailsFilters.parentDivision) || getApiVal(filters.parentDivision);
        const effectiveSubdivision = getApiVal(modalDetailsFilters.subdivision) || getApiVal(filters.subdivision);
        const effectiveSubinventory = getApiVal(modalDetailsFilters.subinventory) || getApiVal(filters.subinventory);

        if (getApiVal(filters.legalGroup)) apiFilters.legal_group_id = getApiVal(filters.legalGroup);
        if (effectiveLegalEntity) apiFilters.legal_entity_id = effectiveLegalEntity;
        if (effectiveParentDivision) apiFilters.parent_division_id = effectiveParentDivision;
        if (effectiveSubdivision) apiFilters.subdivision_id = effectiveSubdivision;
        if (effectiveSubinventory) apiFilters.subinventory_id = effectiveSubinventory;
        if (appliedFilters.currency && appliedFilters.currency !== "All") apiFilters.reporting_currency = appliedFilters.currency;
        if (formattedDate) apiFilters.as_on_date = formattedDate;

        // ── Apply Drilldown Filters to API (per Madam's confirmed parameter spec) ──
        // Aging bucket
        if (viewAllDetailFilters.aging_bucket) {
          apiFilters.aging_bucket = toAgingBucketCode(viewAllDetailFilters.aging_bucket);
        }
        // Slow Moving: slow_moving=true → backend: aging_366_730 + aging_above_730 > 0
        if (viewAllDetailFilters.slow_moving) {
          apiFilters.slow_moving = true;
        }
        // Parent Division drilldown (separate from global parent_division_id filter)
        if (viewAllDetailFilters.drilldown_parent_division_id) {
          apiFilters.drilldown_parent_division_id = viewAllDetailFilters.drilldown_parent_division_id;
        }
        // Subdivision drilldown (separate from global subdivision_id filter)
        if (viewAllDetailFilters.drilldown_subdivision_id) {
          apiFilters.drilldown_subdivision_id = viewAllDetailFilters.drilldown_subdivision_id;
        }
        // Subinventory drilldown (confirmed multi-select ID param)
        if (viewAllDetailFilters.subinventory_id || viewAllDetailFilters.subinventory) {
          apiFilters.subinventory_id = viewAllDetailFilters.subinventory_id || viewAllDetailFilters.subinventory;
        }
        // Legal entity drilldown
        if (viewAllDetailFilters.legal_entity_id) {
          apiFilters.legal_entity_id = viewAllDetailFilters.legal_entity_id;
        }
        // Trend drilldown: as_on_date directly from trend point (overrides modal date)
        if (viewAllDetailFilters.as_on_date) {
          apiFilters.as_on_date = toApiDate(viewAllDetailFilters.as_on_date);
        }

        const dashApiFilters = { ...apiFilters };
          delete dashApiFilters.page;
          delete dashApiFilters.page_size;
          delete dashApiFilters.limit;

          const [res, dashRes] = await Promise.all([
            getInventoryDetails(apiFilters),
            getInventoryDashboard(dashApiFilters).catch(() => ({ data: {} }))
          ]);
        if (isMounted && res.data?.items) {
          setModalApiData({ ...res.data, dashKpis: dashRes.data?.kpis || null, dashAging: dashRes.data?.aging_summary || null });
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
  }, [viewAllModal, showViewAll, modalDetailsFilters, viewAllDetailFilters, filters]);


  // Modal data synchronization respecting dashboard filters
  useEffect(() => {
    if (!viewAllModal || viewAllModal === "details") return;
    let active = true;
    const fetchModalSection = async () => {
      setViewAllLoading(true);
      try {
        let formattedDate = null;
        if (appliedFilters.asOnDate && appliedFilters.asOnDate !== "All" && appliedFilters.asOnDate !== "") {
          const raw = String(appliedFilters.asOnDate).trim();
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
        if (getApiVal(appliedFilters.legalGroup)) apiFilters.legal_group_id = getApiVal(appliedFilters.legalGroup);
        if (getApiVal(appliedFilters.legalEntity)) apiFilters.legal_entity_id = getApiVal(appliedFilters.legalEntity);
        if (getApiVal(appliedFilters.parentDivision)) apiFilters.parent_division_id = getApiVal(appliedFilters.parentDivision);
        if (getApiVal(appliedFilters.subdivision)) apiFilters.subdivision_id = getApiVal(appliedFilters.subdivision);
        if (getApiVal(appliedFilters.subinventory)) apiFilters.subinventory_id = getApiVal(appliedFilters.subinventory);
        if (appliedFilters.currency && appliedFilters.currency !== "All") apiFilters.reporting_currency = appliedFilters.currency;
        if (formattedDate) apiFilters.as_on_date = formattedDate;

        let section = null;
        if (viewAllModal === "trend") section = "trend";
        else if (viewAllModal === "parentDivision") section = "parent-divisions";
        else if (viewAllModal === "slowMoving") section = "slow-moving";

        // Determine MoM metric: parentDivision origin always uses total_inventory; slowMoving / momObsolete use slow_moving
        const momMetric = (viewAllSection === "parentDivision") ? "total_inventory" : "slow_moving";
        const needsMom = viewAllModal === "parentDivision" || viewAllModal === "slowMoving" ||
                         viewAllModal === "momObsolete" || viewAllModal === "mom" ||
                         viewAllSection === "parentDivision" || viewAllSection === "slowMoving";

        if (section) {
          const [res, divWiseRes, momRes] = await Promise.all([
            getInventoryDetails({ ...apiFilters, section }).catch(e => { console.error('[MoM] details error', e); return { data: {} }; }),
            viewAllModal === "parentDivision" ? getInventoryDivisionWise({ ...apiFilters, limit: 500 }).catch(e => { console.error('[MoM] divwise error', e); return { data: {} }; }) : Promise.resolve({ data: {} }),
            needsMom ? getInventoryViewAllMonthOnMonth({ ...apiFilters, metric: momMetric, year: momYear || new Date().getFullYear() }).catch(e => { console.error('[MoM] viewall MoM error', e); return { data: {} }; }) : Promise.resolve({ data: {} })
          ]);
          if (active) {
            const list = res.data?.rows || res.data?.items || (Array.isArray(res.data) ? res.data : []);
            const fallbackList = divWiseRes.data?.items || divWiseRes.data?.rows || [];
            const finalList = list.length > 0 ? list : fallbackList;
            if (finalList.length > 0) {
              setViewAllData(finalList);
            }
            const momArr = momRes.data?.rows || momRes.data?.items || momRes.data?.data || momRes.data?.parent_divisions || momRes.data?.results || (Array.isArray(momRes.data) ? momRes.data : []);
            if (momArr.length > 0) {
              setMomData(momArr);
            }
          }
        } else if (needsMom) {
          // MoM-only fetch when section is null (e.g. momObsolete / mom tabs)
          const momRes = await getInventoryViewAllMonthOnMonth({ ...apiFilters, metric: momMetric, year: momYear || new Date().getFullYear() }).catch(e => { console.error('[MoM] standalone MoM error', e); return { data: {} }; });
          if (active) {
            const momArr = momRes.data?.rows || momRes.data?.items || momRes.data?.data || momRes.data?.parent_divisions || momRes.data?.results || (Array.isArray(momRes.data) ? momRes.data : []);
            if (momArr.length > 0) {
              setMomData(momArr);
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
  }, [viewAllModal, viewAllSection, appliedFilters]);



  // ============================================================
  // FILTER STATE (Removed duplicated state, already defined above)

  // ============================================================

  

  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key, value) => {
    setDetailPage(0);
    setModalDetailPage(0);
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'legalGroup') {
        next.legalEntity = ["All"];
        next.parentDivision = ["All"];
        next.subdivision = ["All"];
        next.subinventory = ["All"];
      } else if (key === 'legalEntity') {
        next.parentDivision = ["All"];
        next.subdivision = ["All"];
        next.subinventory = ["All"];
      } else if (key === 'parentDivision') {
        next.subdivision = ["All"];
        next.subinventory = ["All"];
      } else if (key === 'subdivision') {
        next.subinventory = ["All"];
      }
      return next;
    });
  };

  const resetFilters = () => {
    const def = {
      legalGroup: [],
      legalEntity: [],
      parentDivision: [],
      subdivision: [],
      subinventory: [],
      currency: "AED",
      asOnDate: "All",
    };
    setAppliedFilters(def);
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
        /* onClick removed from KPI */
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
          cursor: "pointer",
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
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          style={{ display: "block", overflow: "visible" }}
          onMouseLeave={() => setHoveredValueTrendIdx(null)}
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
                  {value}M
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

          {/* Invisible hover hit areas */}
          {labels.map((_, i) => {
            const x = getCoord(0, i, labels.length).x;
            const hitW = labels.length > 1 ? plotWidth / (labels.length - 1) : plotWidth;
            return (
              <rect
                key={`hit-${i}`}
                x={x - hitW / 2}
                y={paddingTop}
                width={hitW}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredValueTrendIdx(i)}
                onMouseLeave={() => setHoveredValueTrendIdx(null)}
                style={{ cursor: "pointer" }}
              />
            );
          })}

          {/* CY Area Fill */}
          {cyValues.length > 1 && (
            <path d={makeAreaPath(cyValues)} fill="url(#cyAreaGrad)" style={{ animation: "plTooltipFadeScale 0.8s ease forwards" }} />
          )}

          {/* PY Line (Green) */}
          {pyValues.length > 1 && (
            <polyline
              points={makePolylinePoints(pyValues)}
              fill="none"
              stroke="#16a34a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "drawLine 1.2s ease-in-out forwards" }}
            />
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
                CY: {formatChartValueCompact(cyValues[0], currentCurrency)}
              </text>
            </g>
          )}

          {/* Hover vertical guide line */}
          {hoveredValueTrendIdx !== null && (
            <line
              x1={getCoord(0, hoveredValueTrendIdx, labels.length).x} x2={getCoord(0, hoveredValueTrendIdx, labels.length).x}
              y1={paddingTop} y2={paddingTop + plotHeight}
              stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"
              style={{ animation: "crosshairFadeIn 0.2s ease forwards" }}
            />
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
              pathLength="1"
              style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "drawLine 1s ease-in-out forwards" }}
            />
          )}

          {/* PY Points (Green circles) */}
          {pyValues.map((value, index) => {
            const { x, y } = getCoord(value, index, pyValues.length);
            const isHov = hoveredValueTrendIdx === index;
            const delay = (index / Math.max(1, pyValues.length - 1)) * 1.0;
            return (
              <circle
                key={`py-${index}`}
                cx={x}
                cy={y}
                r={isHov ? 5.5 : 4}
                fill={isHov ? "#fff" : "#16a34a"}
                stroke="#16a34a"
                strokeWidth={isHov ? 2.5 : 1.5}
                style={{ transition: "r 0.15s, fill 0.15s", filter: isHov ? "drop-shadow(0 2px 6px rgba(22,163,74,0.5))" : "none", transformOrigin: `${x}px ${y}px`, opacity: 0, animation: `pointFadeScale 0.4s ease forwards`, animationDelay: `${delay}s` }}
              />
            );
          })}

          {/* CY Points (Blue circles) */}
          {cyValues.map((value, index) => {
            const { x, y } = getCoord(value, index, cyValues.length);
            const isHov = hoveredValueTrendIdx === index;
            const delay = (index / Math.max(1, cyValues.length - 1)) * 0.8;
            return (
              <circle
                key={`cy-${index}`}
                cx={x}
                cy={y}
                r={isHov ? 6 : 4.5}
                fill={isHov ? "#fff" : "#2563eb"}
                stroke="#2563eb"
                strokeWidth={isHov ? 2.5 : 1.5}
                style={{ transition: "r 0.15s, fill 0.15s", filter: isHov ? "drop-shadow(0 2px 6px rgba(37,99,235,0.5))" : "none", transformOrigin: `${x}px ${y}px`, opacity: 0, animation: `pointFadeScale 0.4s ease forwards`, animationDelay: `${delay}s` }}
              />
            );
          })}

          

          {/* X Axis Month Labels */}
          {labels.map((label, index) => {
            const { x } = getCoord(0, index, labels.length);
            const isHov = hoveredValueTrendIdx === index;
            return (
              <text
                key={`${label}-${index}`}
                x={x}
                y={height - 6}
                textAnchor="middle"
                fontSize="9"
                fontWeight={isHov ? 800 : 600}
                fill={isHov ? "#0f172a" : "#64748b"}
                style={{ cursor: "pointer" }}
              >
                {label}
              </text>
            );
          })}
        </svg>

        {/* Glassmorphic Tooltip */}
        {hoveredValueTrendIdx !== null && (
          <div
            style={{
              position: "absolute",
              top: 30,
              left: `${((getCoord(0, hoveredValueTrendIdx, labels.length).x / width) * 100).toFixed(1)}%`,
              transform: hoveredValueTrendIdx > labels.length / 2 ? "translateX(-100%)" : "translateX(0%)",
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
              {labels[hoveredValueTrendIdx]}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 3, borderRadius: 2, background: "#2563eb" }} />
                <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>CY {trendCY}</span>
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#2563eb", fontVariantNumeric: "tabular-nums" }}>
                {cyValues[hoveredValueTrendIdx] !== undefined ? formatChartValueCompact(cyValues[hoveredValueTrendIdx], currentCurrency) : "-"}
              </span>
            </div>

            {pyValues.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 3, borderRadius: 2, background: "#16a34a" }} />
                  <span style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 500 }}>PY {trendPY}</span>
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#16a34a", fontVariantNumeric: "tabular-nums" }}>
                  {pyValues[hoveredValueTrendIdx] !== undefined ? formatChartValueCompact(pyValues[hoveredValueTrendIdx], currentCurrency) : "-"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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

    // Month labels matching standard format
    const shortLabels = labels.map(l => {
      if (!l) return "";
      return formatTrendMonthName(l);
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
                /* onClick removed from Trend */
                style={{ cursor: "pointer" }}
              />
            );
          })}

          {/* Area fills */}
          {turnoverValues.length > 0 && <path d={makeAreaPath(turnoverValues, getTY)} fill="url(#turnoverGrad)" style={{ animation: "plTooltipFadeScale 0.8s ease forwards" }} />}
          {dioValues.length > 0 && <path d={makeAreaPath(dioValues, getDY)} fill="url(#dioGrad)" style={{ animation: "plTooltipFadeScale 0.8s ease forwards" }} />}

          {/* Lines */}
          {turnoverValues.length > 1 && (
            <polyline points={turnoverPoints} fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "drawLine 1s ease-in-out forwards", opacity: (hoveredSeries && hoveredSeries !== 'turnover') ? 0.3 : 1, transition: "opacity 0.3s ease" }} />
          )}
          {dioValues.length > 1 && (
            <polyline points={dioPoints} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: "drawLine 1.2s ease-in-out forwards", opacity: (hoveredSeries && hoveredSeries !== 'dio') ? 0.3 : 1, transition: "opacity 0.3s ease" }} />
          )}

          {/* Hover vertical guide line */}
          {hoveredTrendIdx !== null && (
            <line
              x1={getX(hoveredTrendIdx)} x2={getX(hoveredTrendIdx)}
              y1={paddingTop} y2={paddingTop + plotHeight}
              stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"
              style={{ animation: "crosshairFadeIn 0.2s ease forwards" }}
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
                Turnover: {Math.round(Number(turnoverValues[0] || 0))} Times
              </text>
              <text x={getX(0)} y={paddingTop + 39} textAnchor="middle" fontSize="10" fontWeight="700" fill="#2563eb">
                DIO: {Math.round(dioValues[0] || 0)} Days
              </text>
            </g>
          )}

          {/* Turnover data points */}
          {turnoverValues.map((v, i) => {
            const isHov = hoveredTrendIdx === i;
            const isSeriesActive = !hoveredSeries || hoveredSeries === 'turnover';
            const delay = (i / Math.max(1, turnoverValues.length - 1)) * 1.0;
            return (
              <circle key={`t-${i}`} cx={getX(i)} cy={getTY(v)}
                r={isHov ? 6 : 3.5}
                fill={isHov ? "#fff" : "#ea580c"}
                stroke="#ea580c"
                strokeWidth={isHov ? 2.5 : 1.5}
                onMouseEnter={() => { setHoveredTrendIdx(i); setHoveredSeries('turnover'); }}
                onMouseLeave={() => { setHoveredTrendIdx(null); setHoveredSeries(null); }}
                style={{ cursor: "pointer", opacity: isSeriesActive ? 1 : 0.3, transition: "r 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), fill 0.15s, opacity 0.3s ease", filter: isHov ? "drop-shadow(0 4px 8px rgba(234,88,12,0.5))" : "none", transformOrigin: `${getX(i)}px ${getTY(v)}px`, animation: `pointFadeScale 0.4s ease forwards`, animationDelay: `${delay}s` }}
              />
            );
          })}

          {/* DIO data points */}
          {dioValues.map((v, i) => {
            const isHov = hoveredTrendIdx === i;
            const isSeriesActive = !hoveredSeries || hoveredSeries === 'dio';
            const delay = (i / Math.max(1, dioValues.length - 1)) * 1.2;
            return (
              <circle key={`d-${i}`} cx={getX(i)} cy={getDY(v)}
                r={isHov ? 6 : 3.5}
                fill={isHov ? "#fff" : "#2563eb"}
                stroke="#2563eb"
                strokeWidth={isHov ? 2.5 : 1.5}
                onMouseEnter={() => { setHoveredTrendIdx(i); setHoveredSeries('dio'); }}
                onMouseLeave={() => { setHoveredTrendIdx(null); setHoveredSeries(null); }}
                style={{ cursor: "pointer", opacity: isSeriesActive ? 1 : 0.3, transition: "r 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), fill 0.15s, opacity 0.3s ease", filter: isHov ? "drop-shadow(0 4px 8px rgba(37,99,235,0.5))" : "none", transformOrigin: `${getX(i)}px ${getDY(v)}px`, animation: `pointFadeScale 0.4s ease forwards`, animationDelay: `${delay}s` }}
              />
            );
          })}

          

          {/* X axis labels */}
          {shortLabels.map((m, i) => {
            const isHov = hoveredTrendIdx === i;
            return (
              <text key={`xl-${i}`} x={getX(i)} y={height - 5} textAnchor="middle"
                fontSize="8.5" fontWeight={isHov ? 800 : 600} fill={isHov ? "#0f172a" : "#64748b"}
                style={{ cursor: "pointer" }}
                /* onClick removed from Trend */
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
                {turnoverValues[hoveredTrendIdx] !== undefined ? Math.round(Number(turnoverValues[hoveredTrendIdx])) : "-"} Times
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
    centerSubText = "Total",
    size = 170,
    strokeWidth = 24,
    currency = "AED",
    activeSegment,
    onSegmentHover,
    onSegmentClick,
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
    const displayCenter = centerText || formatChartValueCompact(total, currency);

    return (
      <div style={{ width: size, height: size, flex: `0 0 ${size}px`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    @keyframes pointFadeScale {
      from { opacity: 0; transform: scale(0); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes crosshairFadeIn {
      from { opacity: 0; }
      to { opacity: 0.6; }
    }
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
            <circle cx={half} cy={half} r={radius} fill="none" stroke="#eef2f7" strokeWidth={strokeWidth} />

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
                  onClick={() => onSegmentClick && onSegmentClick(item)}
                  onMouseEnter={() => onSegmentHover && onSegmentHover(item.name)}
                  onMouseLeave={() => onSegmentHover && onSegmentHover(null)}
                />
              );
            })}
          </g>
        </svg>

        {/* Center text inside donut hole matching Receivables & Payables */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#000000",
            pointerEvents: "none",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: size >= 150 ? 16 : 14,
              fontWeight: 800,
              color: "#000000",
              lineHeight: 1.25,
              letterSpacing: "-0.2px",
            }}
          >
            {displayCenter}
          </div>
          <div
            style={{
              fontSize: size >= 150 ? 11 : 10,
              fontWeight: 700,
              color: "#000000",
              marginTop: 3,
            }}
          >
            {centerSubText || "Total"}
          </div>
        </div>

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
                {formatChartValueCompact(active.value, currency)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: "0.70rem", color: "#64748b", fontWeight: 500 }}>Share</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: active.color, fontVariantNumeric: "tabular-nums" }}>
                {typeof active.percentage === "number" ? `${Math.round(active.percentage)}%` : active.percentage}
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
    const [hoveredMom, setHoveredMom] = useState(null);
    const data = momData.slice(0, 5); // top 5
    if (!data || data.length === 0) {
        return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No month-on-month data available</div>;
    }

    const max = Math.max(
      ...data.map((x) => Math.max(Number(x.latest_value ?? x.current_value ?? x.value ?? 0), Number(x.previous_value ?? x.previous ?? 0)))
    );
    const roundMax = max === 0 ? 1 : (max <= 10 ? 10 : Math.ceil(max / 10) * 10);
    const ticks = [
      0,
      Math.round(roundMax * 0.5),
      roundMax,
    ];

    return (
      <div style={{ width: "100%", paddingTop: 10, paddingRight: 20, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 15, marginBottom: 15, fontSize: "0.7rem", fontWeight: 600, color: "#64748b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "#2563eb", borderRadius: 2 }}/> Current Month</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "#94a3b8", borderRadius: 2 }}/> Previous Month</div>
        </div>
        {data.map((item) => {
          const isHovered = hoveredMom?.parent_division_name === item.parent_division_name;
          const curVal = Number(item.latest_value ?? item.current_value ?? item.value ?? 0);
          const prevVal = Number(item.previous_value ?? item.previous ?? 0);
          
          return (
          <div
            key={item.parent_division_name}
            onMouseEnter={() => setHoveredMom(item)}
            onMouseLeave={() => setHoveredMom(null)}
            style={{
              display: "grid",
              gridTemplateColumns: "135px 1fr 65px",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
              padding: "3px 6px",
              borderRadius: 6,
              background: isHovered ? "rgba(241, 245, 249, 0.95)" : "transparent",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: isHovered ? "#2563eb" : "#1e3a8a",
                fontWeight: 700,
                whiteSpace: "normal",
                wordBreak: "break-word",
                textAlign: "right",
                transition: "color 0.18s ease"
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
                      width: `${max > 0 ? (curVal / roundMax) * 100 : 0}%`,
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
                      width: `${max > 0 ? (prevVal / roundMax) * 100 : 0}%`,
                      background: "#94a3b8",
                      borderRadius: 2,
                      transition: "width 0.5s",
                    }}
                  />
                </div>
            </div>

            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#334155", textAlign: "right" }}>
                <div style={{ color: "#1e3a8a" }}>{formatChartValueCompact(curVal, "")}</div>
                <div style={{ color: "#64748b" }}>{formatChartValueCompact(prevVal, "")}</div>
            </div>
          </div>
        )})}
        
        {/* X-Axis Ticks */}
        <div style={{ display: "grid", gridTemplateColumns: "135px 1fr 65px", gap: 8, marginTop: 8 }}>
          <div />
          <div style={{ position: "relative", height: 15 }}>
            {ticks.map((t, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: `${(t / roundMax) * 100}%`,
                  transform: i === 0 ? "translateX(0)" : (i === ticks.length - 1 ? "translateX(-100%)" : "translateX(-50%)"),
                  fontSize: "0.6rem",
                  color: "#64748b",
                  fontWeight: 700,
                }}
              >
                {formatChartValueCompact(t, "")}
              </span>
            ))}
          </div>
          <div />
        </div>
        
        {/* Floating detail card matching Sub-division box */}
        {hoveredMom && (() => {
          const curVal = Number(hoveredMom.latest_value ?? hoveredMom.current_value ?? hoveredMom.value ?? 0);
          const prevVal = Number(hoveredMom.previous_value ?? hoveredMom.previous ?? 0);
          const variance = curVal - prevVal;
          const variancePct = prevVal > 0 ? (variance / prevVal) * 100 : 0;
          const isPositive = variance > 0;
          const isNegative = variance < 0;
          const varColor = isPositive ? "#dc2626" : (isNegative ? "#16a34a" : "#64748b");

          return (
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
              minWidth: 195,
              animation: "plTooltipFadeScale 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3.5, background: "#2563eb", flexShrink: 0, boxShadow: `0 2px 6px #2563eb66` }} />
              <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                {hoveredMom.parent_division_name}
              </span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginBottom: 5 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.70rem", color: "#64748b", fontWeight: 500 }}>
                <span style={{ width: 8, height: 8, background: "#2563eb", borderRadius: 2 }}/> Current
              </span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                {formatChartValueCompact(curVal, currentCurrency)}
              </span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginBottom: 5 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.70rem", color: "#64748b", fontWeight: 500 }}>
                <span style={{ width: 8, height: 8, background: "#94a3b8", borderRadius: 2 }}/> Previous
              </span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#64748b", fontVariantNumeric: "tabular-nums" }}>
                {formatChartValueCompact(prevVal, currentCurrency)}
              </span>
            </div>

            <div style={{ height: 1, background: "#e2e8f0", margin: "6px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: "0.70rem", color: "#64748b", fontWeight: 500 }}>Variance</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: varColor, fontVariantNumeric: "tabular-nums" }}>
                {isPositive ? "+" : ""}{formatChartValueCompact(variance, currentCurrency)} <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>({isPositive ? "+" : ""}{variancePct.toFixed(1)}%)</span>
              </span>
            </div>
          </div>
        )})}
      </div>
    );
  };
  
    // BAR CHART
  // ============================================================

  const SUBDIV_PALETTE = [
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#ec4899", // Pink
    "#a16207", // Ochre / Brown
    "#f43f5e", // Rose / Red
    "#0ea5e9", // Sky blue
    "#8b5cf6", // Violet
    "#f97316", // Orange
    "#10b981", // Emerald
    "#6366f1", // Indigo
  ];

  const SubdivisionChart = () => {
    const [hoveredSubdiv, setHoveredSubdiv] = useState(null);
    const items = (mockData.bySubdivision || []).map((x, idx) => {
      let num = Number(x.value || 0);
      if (num > 0 && num < 10000) num = num * 10000000;
      const inMillions = num / 1_000_000;
      const isOthers = (x.name || "").trim().toLowerCase() === "others";
      const color = isOthers ? "#94a3b8" : SUBDIV_PALETTE[idx % SUBDIV_PALETTE.length];
      return { ...x, rawValue: num, inMillions, color };
    });

    const max = Math.max(...(items.length > 0 ? items.map((x) => x.inMillions) : [1]));
    const roundMax = max <= 5 ? 5 : Math.ceil(max / 5) * 5;
    const ticks = [
      0,
      Math.round(roundMax * 0.5),
      roundMax,
    ];

    return (
      <div style={{ width: "100%", paddingTop: 4, position: "relative" }}>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    @keyframes pointFadeScale {
      from { opacity: 0; transform: scale(0); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes crosshairFadeIn {
      from { opacity: 0; }
      to { opacity: 0.6; }
    }
    @keyframes plTooltipFadeScale {
            from { opacity: 0; transform: scale(0.96) translateY(4px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
        {items.map((item) => {
          const isHovered = hoveredSubdiv?.name === item.name;
          return (
            <div
              key={item.name}
              onMouseEnter={() => setHoveredSubdiv(item)}
              onMouseLeave={() => setHoveredSubdiv(null)}
              /* onClick removed from Subdiv Legend */
              style={{
                display: "grid",
                gridTemplateColumns: "115px 1fr 78px",
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
                  color: isHovered ? item.color : "#475569",
                  textAlign: "right",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  fontWeight: isHovered ? 800 : 600,
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
                  boxShadow: isHovered ? `0 2px 8px ${item.color}55` : "inset 0 1px 2px rgba(0,0,0,0.06)",
                  transform: isHovered ? "scaleY(1.15)" : "scaleY(1)",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${roundMax > 0 ? (item.inMillions / roundMax) * 100 : 0}%`,
                    background: item.color,
                    borderRadius: 4,
                    transition: "width 0.35s ease, background 0.2s ease",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: isHovered ? 800 : 700,
                  color: isHovered ? item.color : "#1e293b",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s ease",
                }}
              >
                {formatChartValueCompact(item.rawValue, currentCurrency)}
              </div>
            </div>
          );
        })}

        <div
          style={{
            marginTop: 4,
            marginLeft: 108,
            marginRight: 86,
            borderTop: "1px solid #e2e8f0",
            paddingTop: 4,
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.68rem",
            color: "#64748b",
          }}
        >
          {ticks.map((t, idx) => (
            <span key={idx}>{t}M</span>
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
          {currentCurrency} (Millions)
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
                  background: hoveredSubdiv.color || "#06b6d4",
                  flexShrink: 0,
                  boxShadow: `0 2px 6px ${hoveredSubdiv.color || "#06b6d4"}66`,
                }}
              />
              <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                {hoveredSubdiv.name}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginBottom: 5 }}>
              <span style={{ fontSize: "0.70rem", color: "#64748b", fontWeight: 500 }}>Amount</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                {formatChartValueCompact(hoveredSubdiv.rawValue || hoveredSubdiv.value, currentCurrency)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: "0.70rem", color: "#64748b", fontWeight: 500 }}>Share</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 800, color: hoveredSubdiv.color || "#06b6d4", fontVariantNumeric: "tabular-nums" }}>
                {typeof hoveredSubdiv.percentage === "number" ? `${Math.round(hoveredSubdiv.percentage)}%` : (hoveredSubdiv.percentage || "0%")}
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #e2e8f0", background: "#fff", gap: 8, borderRadius: "10px 10px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, flex: 1 }}>
            <span style={{ fontWeight: 800, fontSize: "0.86rem", color: "#1e293b", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={title}>{title}</span>
            {info && <Info size={13} style={{ color: "#94a3b8", cursor: "help", flexShrink: 0 }} title={info} />}
          </div>
          {actionButtons}
        </div>
      );
    }

    if (extra) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px 0", marginBottom: 8, gap: 8 }}>
          <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 5, minWidth: 0, flex: 1 }}>
            <span title={title}>{title}</span>
            {info && <Info size={13} style={{ color: "#94a3b8", cursor: "help", flexShrink: 0 }} title={info} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", flexShrink: 0 }}>
            {extra}
            {actionButtons}
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px 0", marginBottom: 8, gap: 8 }}>
        <div style={{ fontSize: "0.86rem", fontWeight: 800, color: "#1e293b", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 5, minWidth: 0, flex: 1 }}>
          <span title={title}>{title}</span>
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
    <div ref={ref} style={{ position: 'relative', width: '100%', minWidth: 0, ...style }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '0 24px 0 9px',
          fontSize: 11,
          fontWeight: 600,
          color: '#29427f',
          background: '#fff',
          border: open ? '1.5px solid #2563eb' : '1px solid #d9e1ee',
          borderRadius: 5,
          cursor: 'pointer',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          height: 34,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
          position: 'relative',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.65rem', color: '#173b8f', position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
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
    if (!viewAllModal && !showViewAll) return [];
    const isModalFilterDifferent = Object.keys(modalDetailsFilters || {}).some(k => {
        const mVal = modalDetailsFilters[k];
        const fVal = filters[k];
        const getVal = (v) => (!v || v === "All" || (Array.isArray(v) && v.includes("All")) || (Array.isArray(v) && v.length === 0)) ? "All" : (Array.isArray(v) ? v.slice().sort().join(",") : String(v));
        return getVal(mVal) !== getVal(fVal);
      });
      const hasDrilldownContext = Object.keys(viewAllDetailFilters || {}).length > 0 || isModalFilterDifferent;
      
      // If drilling down, do not flash the global data (which would incorrectly show partial records like 28 before the API finishes).
      // Wait for modalApiItems. If not drilling down, it's safe to use the global filteredDetails instantly.
      const sourceItems = modalApiItems || (hasDrilldownContext ? [] : (filteredDetails || mockData.details || []));

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
      const effectiveLE = (!modalDetailsFilters.legalEntity || modalDetailsFilters.legalEntity.includes("All")) ? filters.legalEntity : modalDetailsFilters.legalEntity;
      if (!matchesFilter(row.legal_entity, row.legal_entity_id, effectiveLE, leMap)) {
        return false;
      }

      // 3. Parent Division
      const effectivePD = (!modalDetailsFilters.parentDivision || modalDetailsFilters.parentDivision.includes("All")) ? filters.parentDivision : modalDetailsFilters.parentDivision;
      if (!matchesFilter(row.parent_division, row.parent_division_id, effectivePD, pdMap)) {
        return false;
      }

      // 4. Sub-Division
      const effectiveSD = (!modalDetailsFilters.subdivision || modalDetailsFilters.subdivision.includes("All")) ? filters.subdivision : modalDetailsFilters.subdivision;
      if (!matchesFilter(row.subdivision, row.subdivision_id, effectiveSD, sdMap)) {
        return false;
      }

      // 5. Subinventory
      const effectiveSI = (!modalDetailsFilters.subinventory || modalDetailsFilters.subinventory.includes("All")) ? filters.subinventory : modalDetailsFilters.subinventory;
      if (!matchesFilter(row.subinventory, row.subinventory_id, effectiveSI, siMap)) {
        return false;
      }

      // 6. Drilldown: aging_bucket
      if (viewAllDetailFilters?.aging_bucket) {
        const bucket = toAgingBucketCode(viewAllDetailFilters.aging_bucket);
        if (bucket === "0_30" && !(Number(row.aging_0_30 || 0) > 0)) return false;
        if (bucket === "31_60" && !(Number(row.aging_31_60 || 0) > 0)) return false;
        if (bucket === "61_90" && !(Number(row.aging_61_90 || 0) > 0)) return false;
        if (bucket === "91_120" && !(Number(row.aging_91_120 || 0) > 0)) return false;
        if (bucket === "121_180" && !(Number(row.aging_121_180 || 0) > 0)) return false;
        if (bucket === "181_365" && !(Number(row.aging_181_365 || 0) > 0)) return false;
        if (bucket === "366_730" && !(Number(row.aging_366_730 || 0) > 0)) return false;
        if (bucket === "above_730" && !(Number(row.aging_above_730 || 0) > 0)) return false;
        if ((bucket === "obsolete" || bucket === "above_365") && !((Number(row.aging_366_730 || 0) + Number(row.aging_above_730 || 0)) > 0)) return false;
      }

      // 7. Drilldown: parent_division_id
      if (viewAllDetailFilters?.drilldown_parent_division_id != null) {
        if (!matchesFilter(row.parent_division, row.parent_division_id, [viewAllDetailFilters.drilldown_parent_division_id], pdMap)) {
          return false;
        }
      }

      // 8. Drilldown: subdivision_id
      if (viewAllDetailFilters?.drilldown_subdivision_id != null) {
        if (!matchesFilter(row.subdivision, row.subdivision_id, [viewAllDetailFilters.drilldown_subdivision_id], sdMap)) {
          return false;
        }
      }

      // 9. Drilldown: subinventory_id
      const siFilter = viewAllDetailFilters?.subinventory_id || viewAllDetailFilters?.subinventory;
      if (siFilter != null) {
        if (!matchesFilter(row.subinventory, row.subinventory_id, [siFilter], siMap)) {
          return false;
        }
      }

      // 10. Drilldown: legal_entity_id
      if (viewAllDetailFilters?.legal_entity_id != null) {
        if (!matchesFilter(row.legal_entity, row.legal_entity_id, [viewAllDetailFilters.legal_entity_id], leMap)) {
          return false;
        }
      }

      return true;
    });
  }, [viewAllModal, showViewAll, modalApiItems, filteredDetails, mockData.details, viewAllSearch, modalDetailsFilters, viewAllDetailFilters, mockData.filters, filters]);

  const modalTotalItems = modalFilteredDetails.length;
  const modalTotalPages = Math.max(1, Math.ceil(modalTotalItems / modalDetailPageSize));
  const safeModalPage = Math.min(modalDetailPage, Math.max(0, modalTotalPages - 1));

  const modalPaginatedDetails = useMemo(() => {
    if (!viewAllModal && !showViewAll) return [];
    const start = safeModalPage * modalDetailPageSize;
    return modalFilteredDetails.slice(start, start + modalDetailPageSize);
  }, [viewAllModal, showViewAll, modalFilteredDetails, safeModalPage, modalDetailPageSize]);

  const divStats = useMemo(() => {
    const map = {};
    const list = mockData.details || [];
    list.forEach((r) => {
      const pd = r.parent_division || "Other";
      if (!map[pd]) map[pd] = { qty: 0, val: 0, stockVal: 0, obs: 0 };
      map[pd].qty += Number(r.quantity || 0);
      map[pd].val += Number(r.total_stock_value || 0);
      map[pd].stockVal += Number(r.total_stock_value || 0);
      const itemObs = (Number(r.aging_366_730 || 0) + Number(r.aging_above_730 || 0));
      map[pd].obs += itemObs > 0 ? itemObs : Number(r.obsolete_stock || 0);
    });
    return map;
  }, [mockData.details]);

  const slowMovingFilteredStats = useMemo(() => {
    const map = {};
    const list = mockData.details || [];
    const leMap = new Map(); (mockData.filters.legalEntities || []).forEach(x => { if (x?.id) leMap.set(String(x.id), x.name); });
    const pdMap = new Map(); (mockData.filters.parentDivisions || []).forEach(x => { if (x?.id) pdMap.set(String(x.id), x.name); });
    const sdMap = new Map(); (mockData.filters.subdivisions || []).forEach(x => { if (x?.id) sdMap.set(String(x.id), x.name); });
    const siMap = new Map(); (mockData.filters.subinventories || []).forEach(x => { if (x?.id) siMap.set(String(x.id), x.name); });

    const matchesFilterHelper = (rowVal, rowId, selectedVals, optMap) => {
      if (!selectedVals || selectedVals.length === 0 || selectedVals.includes("All")) return true;
      const rVal = String(rowVal || '').toLowerCase().trim();
      const rId = rowId != null ? String(rowId).toLowerCase().trim() : '';

      return selectedVals.some(v => {
        if (v === 'All') return true;
        const target = String(v).toLowerCase().trim();
        if (rVal && (rVal === target || rVal.includes(target) || target.includes(rVal))) return true;
        if (rId && rId === target) return true;
        const mapped = optMap.get(target);
        if (mapped) {
          if (rVal && (rVal === mapped || rVal.includes(mapped) || mapped.includes(rVal))) return true;
          if (rId && rId === mapped) return true;
        }
        return false;
      });
    };

    const isFiltered = (slowMovingFilters.legalEntity && slowMovingFilters.legalEntity.length > 0 && !slowMovingFilters.legalEntity.includes('All')) ||
      (slowMovingFilters.parentDivision && slowMovingFilters.parentDivision.length > 0 && !slowMovingFilters.parentDivision.includes('All')) ||
      (slowMovingFilters.subdivision && slowMovingFilters.subdivision.length > 0 && !slowMovingFilters.subdivision.includes('All')) ||
      (slowMovingFilters.subinventory && slowMovingFilters.subinventory.length > 0 && !slowMovingFilters.subinventory.includes('All'));

    list.forEach((r) => {
      if (!matchesFilterHelper(r.legal_entity, r.legal_entity_id, slowMovingFilters.legalEntity, leMap)) return;
      if (!matchesFilterHelper(r.parent_division, r.parent_division_id, slowMovingFilters.parentDivision, pdMap)) return;
      if (!matchesFilterHelper(r.subdivision, r.subdivision_id, slowMovingFilters.subdivision, sdMap)) return;
      if (!matchesFilterHelper(r.subinventory, r.subinventory_id, slowMovingFilters.subinventory, siMap)) return;

      const pd = r.parent_division || "Other";
      if (!map[pd]) map[pd] = { qty: 0, val: 0, stockVal: 0, obs: 0 };
      map[pd].qty += Number(r.quantity || 0);
      map[pd].val += Number(r.total_stock_value || 0);
      map[pd].stockVal += Number(r.total_stock_value || 0);
      const obsVal = (Number(r.aging_366_730 || 0) + Number(r.aging_above_730 || 0));
      map[pd].obs += obsVal > 0 ? obsVal : Number(r.obsolete_stock || 0);
    });

    return { map, isFiltered };
  }, [mockData.details, slowMovingFilters, mockData.filters]);

  const modalTotals = useMemo(() => {
    if (viewAllModal !== "details") {
      return { totalVal: 0, b0_30: 0, b31_60: 0, b61_90: 0, b91_120: 0, b121_180: 0, b181_365: 0, bObsolete: 0 };
    }
    return modalFilteredDetails.reduce((acc, r) => {
      acc.totalVal += Number(r.total_stock_value) || 0;
      acc.b0_30 += Number(r.aging_0_30) || 0;
      acc.b31_60 += Number(r.aging_31_60) || 0;
      acc.b61_90 += Number(r.aging_61_90) || 0;
      acc.b91_120 += Number(r.aging_91_120) || 0;
      acc.b121_180 += Number(r.aging_121_180) || 0;
      acc.b181_365 += Number(r.aging_181_365) || 0;
      acc.bObsolete += (Number(r.aging_366_730) || 0) + (Number(r.aging_above_730) || 0);
      return acc;
    }, { totalVal: 0, b0_30: 0, b31_60: 0, b61_90: 0, b91_120: 0, b121_180: 0, b181_365: 0, bObsolete: 0 });
  }, [viewAllModal, modalFilteredDetails]);

  const modalTotalVal = modalTotals.totalVal;

  if (loading && (!mockData || mockData.kpis.length === 0)) {
      return (
        <div style={{ padding: 60, textAlign: "center", fontSize: "0.95rem", color: "#64748b", fontWeight: 600 }}>
          Loading Inventory Data...
        </div>
      );
  }

  // ============================================================
  // RENDER
  // ============================================================

  const rawDataAsOf = mockData.dataAsOf || appliedFilters.asOnDate;
  const formattedDataAsOf = rawDataAsOf && rawDataAsOf !== "All"
    ? new Date(rawDataAsOf).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  // Dynamic CY / PY year labels for Inventory Trend legend
  const trendCY = (() => {
    if (rawDataAsOf && rawDataAsOf !== "All") {
      const yr = new Date(rawDataAsOf).getFullYear();
      return isNaN(yr) ? new Date().getFullYear() : yr;
    }
    return new Date().getFullYear();
  })();
  const trendPY = trendCY - 1;


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
              <span style={{ color: '#16a34a', fontWeight: 700 }}>Currency: {currentCurrency}</span>
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
          <button type="button" style={styles.applyButton} onClick={() => setAppliedFilters(filters)}>
            Apply
          </button>

          <button type="button" style={styles.resetButton} onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/* Global Data Fetching Overlay */}
      <div style={{ position: 'relative', transition: 'opacity 0.25s ease', opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
        {loading && mockData.kpis.length > 0 && (
           <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', zIndex: 999 }}>
               <div style={{ padding: '8px 16px', background: '#fff', borderRadius: 20, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontWeight: 600, color: '#2563eb', border: '1px solid #e2e8f0' }}>
                   <div style={{ width: 14, height: 14, border: '2px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                   Updating Data...
               </div>
           </div>
        )}

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
            onViewAll={() => openInventoryViewAll({ viewType: "trend", globalFilters: appliedFilters, drilldownFilters: {} })}
            onExport={(type) => handleExport(type || "excel", "trend")}
          />

          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: "#2563eb" }} />
              CY {trendCY}
            </div>

            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: "#16a34a" }} />
              PY {trendPY}
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
              <div style={{ display: "inline-flex", background: "#f1f5f9", padding: 2, borderRadius: 6, border: "1px solid #e2e8f0", gap: 2 }}>
                <button
                  type="button"
                  onClick={() => setParentDivViewMode("month")}
                  style={{
                    fontSize: "0.70rem",
                    fontWeight: 700,
                    color: parentDivViewMode === "month" ? "#fff" : "#475569",
                    background: parentDivViewMode === "month" ? "#2563eb" : "transparent",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 8px",
                    cursor: "pointer",
                    boxShadow: parentDivViewMode === "month" ? "0 1px 2px rgba(37,99,235,0.25)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setParentDivViewMode("mom")}
                  style={{
                    fontSize: "0.70rem",
                    fontWeight: 700,
                    color: parentDivViewMode === "mom" ? "#fff" : "#475569",
                    background: parentDivViewMode === "mom" ? "#2563eb" : "transparent",
                    border: "none",
                    borderRadius: 4,
                    padding: "2px 8px",
                    cursor: "pointer",
                    boxShadow: parentDivViewMode === "mom" ? "0 1px 2px rgba(37,99,235,0.25)" : "none",
                    transition: "all 0.15s ease",
                  }}
                  title="Month on Month comparison"
                >
                  MoM
                </button>
              </div>
            }
            onViewAll={() => openInventoryViewAll({ viewType: "parentDivision", globalFilters: appliedFilters, drilldownFilters: {} })}
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
                total={mockData.totalInventory || parentDivTotal}
                centerText={formatChartValueCompact(mockData.totalInventory || parentDivTotal, currentCurrency)}
                centerSubText="Total"
                size={144}
                strokeWidth={20}
                currency={currentCurrency}
                activeSegment={hoveredParentDivSegment}
                onSegmentHover={setHoveredParentDivSegment}
                /* onSegmentClick removed */
              />

              <div style={styles.legendList}>
                {mockData.divisions.map((item) => {
                  const isHovered = hoveredParentDivSegment === item.name;
                  return (
                    <div
                      key={item.name}
                      /* onClick removed from Parent Div Legend */
                      style={{
                        ...styles.legendListRow,
                        cursor: "pointer",
                        padding: "3px 4px",
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
                            transform: isHovered ? "scale(1.2)" : "scale(1)",
                            transition: "all 0.2s ease",
                          }}
                        />
                        <span
                          style={{
                            fontWeight: isHovered ? 700 : 500,
                            color: isHovered ? "#0f172a" : "#334155",
                            flex: 1,
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
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      >
                        {formatChartValueCompact(item.value, currentCurrency)} ({Math.round(Number(item.percentage || 0))}%)
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
            onViewAll={() => openInventoryViewAll({ viewType: "subdivision", globalFilters: appliedFilters, drilldownFilters: {} })}
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
            onViewAll={() => openInventoryViewAll({ viewType: "aging", globalFilters: appliedFilters, drilldownFilters: {} })}
            onExport={(type) => handleExport(type || "excel")}
          />

          <div style={styles.agingContent}>
            <DonutChart
              data={mockData.aging}
              total={mockData.totalInventory || agingTotal}
              centerText={formatChartValueCompact(mockData.totalInventory || agingTotal, currentCurrency)}
              centerSubText="Total"
              size={144}
              strokeWidth={20}
              currency={currentCurrency}
              activeSegment={hoveredAgingSegment}
              onSegmentHover={setHoveredAgingSegment}
              /* onSegmentClick removed from Aging Chart */
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
                    /* onClick removed from Aging Legend */
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
                      {formatChartValueCompact(item.value, currentCurrency)}
                    </div>

                    <div style={{ textAlign: "right", color: isHovered ? item.color : "#64748b", fontWeight: isHovered ? 800 : 500 }}>
                      {typeof item.percentage === "number" ? `${Math.round(item.percentage)}%` : item.percentage}
                    </div>
                  </div>
                );
              })}

              <div style={styles.agingTotalRow}>
                <div style={{ fontWeight: 800, color: "#1e3a8a", display: "flex", alignItems: "center", gap: 6 }}>
                  Total
                </div>
                <div style={{ textAlign: "right", fontWeight: 800, color: "#1e293b" }}>
                  {formatChartValueCompact(mockData.totalInventory || agingTotal, currentCurrency)}
                </div>
                <div style={{ textAlign: "right", fontWeight: 800, color: "#1e293b" }}>
                  100%
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
            onViewAll={() => openInventoryViewAll({ viewType: "slowMoving", globalFilters: appliedFilters, drilldownFilters: {} })}
            onExport={(type) => handleExport(type || "excel", "slow-moving")}
            variant="table"
          />
          
          <div style={{ flex: 1, padding: "0 8px 8px 8px" }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: "0.72rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
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
                          <td colSpan={5} style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "0.72rem" }}>
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
                              {item.value ? formatChartValueCompact(item.value, "") : (item.obsolete ? formatChartValueCompact(item.obsolete, "") : "-")}
                            </td>
                            <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 700, color: "#dc2626", fontVariantNumeric: "tabular-nums", verticalAlign: "middle", fontSize: "0.72rem" }}>
                              {item.days || Math.round(200 + idx * 10)}
                            </td>
                          </tr>
                        ))}
                        <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                          <td style={{ padding: "6px 5px", color: "#1e3a8a", fontSize: "0.72rem" }}>Total</td>
                          <td style={{ padding: "6px 4px" }} />
                          <td style={{ padding: "6px 4px" }} />
                          <td style={{ padding: "6px 4px", textAlign: "right", color: "#e11d48", fontVariantNumeric: "tabular-nums", fontSize: "0.72rem" }}>
                            {formatChartValueCompact(totalVal, "")}
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
            onViewAll={() => openInventoryViewAll({ viewType: "trend", globalFilters: appliedFilters, drilldownFilters: {} })}
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
          info="Line-item inventory breakdown and aging status (AED)"
          onViewAll={() => openInventoryViewAll({ viewType: "details", globalFilters: appliedFilters, drilldownFilters: {} })}
          onExport={(type) => handleExport(type || "excel")}
          variant="table"
        />

        <div style={styles.detailTableWrapper} className="detail-table-scroll">
          <table style={{ width: "100%", minWidth: 1050, borderCollapse: "separate", borderSpacing: 0, fontSize: "0.80rem" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#f8fafc" }}>
              <tr style={{ borderBottom: "2px solid #cbd5e1" }}>
                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: "auto", minWidth: 105, maxWidth: 135, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1", whiteSpace: "normal", wordBreak: "break-word" }}>Legal<br />Entity</th>
                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: "auto", minWidth: 105, maxWidth: 130, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1", whiteSpace: "normal", wordBreak: "break-word" }}>Parent<br />Division</th>
                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: "auto", minWidth: 105, maxWidth: 130, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1", whiteSpace: "normal", wordBreak: "break-word" }}>Sub-<br />Division</th>
                <th style={{ padding: "8px 8px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 85, minWidth: 80, maxWidth: 90, verticalAlign: "bottom", lineHeight: 1.2, background: "#f8fafc", borderBottom: "2px solid #cbd5e1", whiteSpace: "nowrap" }}>SUB-INV<br />CODE</th>
                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 110, minWidth: 100, maxWidth: 125, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Total Stock<br />Value ({currentCurrency})</th>
                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 65, minWidth: 55, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>0-30<br />Days</th>
                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 65, minWidth: 55, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>31-60<br />Days</th>
                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 65, minWidth: 55, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>61-90<br />Days</th>
                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 65, minWidth: 55, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>91-120<br />Days</th>
                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 68, minWidth: 58, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>121-180<br />Days</th>
                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 68, minWidth: 58, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>181-365<br />Days</th>
                <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 85, minWidth: 78, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Obsolete Stock<br />(Above 365 Days)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDetails.length === 0 ? (
                <tr><td colSpan={12} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No inventory records found</td></tr>
              ) : (
                paginatedDetails.map((row, idx) => (
                  <tr key={row.id || idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                    <td onClick={() => handleLegalEntityDrillDown(row)} style={{ padding: "7px 10px", fontWeight: 600, color: "#1e293b", width: 125, minWidth: 105, maxWidth: 135, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.35, cursor: "pointer" }} title="Click to filter by Legal Entity">{row.legal_entity}</td>
                    <td onClick={() => handleParentDivisionDrillDown(row)} style={{ padding: "7px 10px", color: "#334155", width: 120, minWidth: 105, maxWidth: 130, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.35, cursor: "pointer" }} title="Click to filter by Parent Division">{row.parent_division}</td>
                    <td onClick={() => handleSubdivisionDrillDown(row)} style={{ padding: "7px 10px", color: "#334155", width: 120, minWidth: 105, maxWidth: 130, whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.35, cursor: "pointer" }} title="Click to filter by Sub-Division">{row.subdivision}</td>
                    <td onClick={() => handleSubinventoryDrillDown(row)} style={{ padding: "7px 8px", color: "#475569", width: 85, minWidth: 80, maxWidth: 90, whiteSpace: "nowrap", cursor: "pointer" }} title="Click to filter by SUB-INV">{row.subinventory}</td>
                    <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a", width: 110, minWidth: 100, maxWidth: 125, whiteSpace: "nowrap" }}>{Math.round(Number(row.total_stock_value || 0)).toLocaleString("en-US")}</td>
                    <td onClick={() => handleAgingDrillDown({ bucket_code: "0_30" })} style={{ padding: "7px 6px", textAlign: "right", width: 65, minWidth: 55, cursor: "pointer" }} title="Click to filter 0-30 Days">{Math.round(Number(row.aging_0_30 || 0)).toLocaleString("en-US")}</td>
                    <td onClick={() => handleAgingDrillDown({ bucket_code: "31_60" })} style={{ padding: "7px 6px", textAlign: "right", width: 65, minWidth: 55, cursor: "pointer" }} title="Click to filter 31-60 Days">{Math.round(Number(row.aging_31_60 || 0)).toLocaleString("en-US")}</td>
                    <td onClick={() => handleAgingDrillDown({ bucket_code: "61_90" })} style={{ padding: "7px 6px", textAlign: "right", width: 65, minWidth: 55, cursor: "pointer" }} title="Click to filter 61-90 Days">{Math.round(Number(row.aging_61_90 || 0)).toLocaleString("en-US")}</td>
                    <td onClick={() => handleAgingDrillDown({ bucket_code: "91_120" })} style={{ padding: "7px 6px", textAlign: "right", width: 65, minWidth: 55, cursor: "pointer" }} title="Click to filter 91-120 Days">{Math.round(Number(row.aging_91_120 || 0)).toLocaleString("en-US")}</td>
                    <td onClick={() => handleAgingDrillDown({ bucket_code: "121_180" })} style={{ padding: "7px 6px", textAlign: "right", width: 68, minWidth: 58, cursor: "pointer" }} title="Click to filter 121-180 Days">{Math.round(Number(row.aging_121_180 || 0)).toLocaleString("en-US")}</td>
                    <td onClick={() => handleAgingDrillDown({ bucket_code: "181_365" })} style={{ padding: "7px 6px", textAlign: "right", width: 68, minWidth: 58, cursor: "pointer" }} title="Click to filter 181-365 Days">{Math.round(Number(row.aging_181_365 || 0)).toLocaleString("en-US")}</td>
                    <td onClick={() => handleAgingDrillDown({ bucket_code: "366_730" })} style={{ padding: "7px 6px", textAlign: "right", color: "#e11d48", fontWeight: 600, width: 85, minWidth: 78, cursor: "pointer" }} title="Click to filter Obsolete Stock">{Math.round(Number(row.aging_366_730 || 0) + Number(row.aging_above_730 || 0)).toLocaleString("en-US")}</td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredDetails.length > 0 && (() => {
              const totals = filteredDetails.reduce((acc, row) => {
                acc.totalVal += Number(row.total_stock_value || 0);
                acc.d30 += Number(row.aging_0_30 || 0);
                acc.d60 += Number(row.aging_31_60 || 0);
                acc.d90 += Number(row.aging_61_90 || 0);
                acc.d120 += Number(row.aging_91_120 || 0);
                acc.d180 += Number(row.aging_121_180 || 0);
                acc.d365 += Number(row.aging_181_365 || 0);
                acc.obs += (Number(row.aging_366_730 || 0) + Number(row.aging_above_730 || 0));
                return acc;
              }, { totalVal: 0, d30: 0, d60: 0, d90: 0, d120: 0, d180: 0, d365: 0, obs: 0 });

              return (
                <tfoot style={{ position: "sticky", bottom: 0, zIndex: 10, background: "#f8fafc" }}>
                  <tr style={{ fontWeight: 800, borderTop: "2px solid #cbd5e1", background: "#f8fafc", boxShadow: "0 -2px 6px rgba(0,0,0,0.06)" }}>
                    <td colSpan={4} style={{ padding: "9px 10px", color: "#1e3a8a", background: "#f8fafc" }}>Total ({filteredDetails.length} items)</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", color: "#1e293b", background: "#f8fafc", width: 110, minWidth: 100, maxWidth: 125 }}>{Math.round(totals.totalVal).toLocaleString("en-US")}</td>
                    <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc", width: 65, minWidth: 55 }}>{Math.round(totals.d30).toLocaleString("en-US")}</td>
                    <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc", width: 65, minWidth: 55 }}>{Math.round(totals.d60).toLocaleString("en-US")}</td>
                    <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc", width: 65, minWidth: 55 }}>{Math.round(totals.d90).toLocaleString("en-US")}</td>
                    <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc", width: 65, minWidth: 55 }}>{Math.round(totals.d120).toLocaleString("en-US")}</td>
                    <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc", width: 68, minWidth: 58 }}>{Math.round(totals.d180).toLocaleString("en-US")}</td>
                    <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc", width: 68, minWidth: 58 }}>{Math.round(totals.d365).toLocaleString("en-US")}</td>
                    <td style={{ padding: "9px 6px", textAlign: "right", color: "#e11d48", fontWeight: 800, background: "#f8fafc", width: 85, minWidth: 78 }}>{Math.round(totals.obs).toLocaleString("en-US")}</td>
                  </tr>
                </tfoot>
              );
            })()}
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
          All values are in <strong>{currentCurrency}</strong>&nbsp;|&nbsp;
          {formattedDataAsOf && `Last Updated On: ${formattedDataAsOf}`}&nbsp;|&nbsp;
          <span style={{ color: '#16a34a', fontWeight: 700 }}>● Live</span>
        </span>
        <span>☁ Source: Oracle Fusion Cloud</span>
      </div>

      </div> {/* End Global Overlay Wrapper */}

      {/* ========================================================
          VIEW ALL MODAL (All Cards)
      ======================================================== */}
      {(viewAllModal || showViewAll) && (() => {
        const sectionViewAllTitles = {
          all: ["Inventory Detailed View", "Review complete inventory valuation, aging details, slow moving stock, and obsolete position."],
          aging: ["Inventory Aging Summary Detailed View", "Detailed breakdown of inventory valuation across aging buckets with status and percentages."],
          trend: ["Inventory Trend Detailed View", "Current Year-Vs-Month By Month Inventory Details"],
          parentDivision: ["Inventory by Parent Division Detailed View", "Comprehensive inventory holdings, aging distribution, and turnover across parent divisions."],
          subdivision: ["Inventory by Sub-Division Detailed View", "Detailed sub-division inventory holdings ranked by valuation, quantity, and obsolete status."],
          subinventory: ["Inventory by Subinventory Detailed View", "Underlying inventory records for the selected subinventory."],
          slowMoving: ["Slow Moving Stock Detailed View", "Underlying slow moving and obsolete inventory records by parent division."],
          details: ["Inventory Detailed View", "Complete line-item inventory valuation and aging breakdown."],
          kpi: ["Inventory Valuation Detailed View", "Underlying inventory records for the selected metric."],
          momObsolete: [`Month-on-Month ${viewAllSection === "parentDivision" ? "Inventory Value" : "Obsolete Stock"} Detailed View`, `Period comparison of ${viewAllSection === "parentDivision" ? "inventory value" : "obsolete stock"} position across parent divisions.`],
          month_on_month: [`Month-on-Month ${viewAllSection === "parentDivision" ? "Inventory Value" : "Obsolete Stock"} Detailed View`, `Period comparison of ${viewAllSection === "parentDivision" ? "inventory value" : "obsolete stock"} position across parent divisions.`],
        };

        const activeTabKey = (modalActiveTab === "mom") ? "momObsolete" : modalActiveTab;
        const [modalHeaderTitle, modalHeaderSubtitle] = sectionViewAllTitles[activeTabKey] || sectionViewAllTitles[viewAllSection] || sectionViewAllTitles.all;
          const isModalFilterDifferent = Object.keys(modalDetailsFilters || {}).some(k => {
    const mVal = modalDetailsFilters[k];
    const fVal = filters[k];
    const getVal = (v) => (!v || v === 'All' || (Array.isArray(v) && v.includes('All')) || (Array.isArray(v) && v.length === 0)) ? 'All' : (Array.isArray(v) ? v.slice().sort().join(',') : String(v));
    return getVal(mVal) !== getVal(fVal);
});
const hasDrilldown = Object.keys(viewAllDetailFilters || {}).length > 0 || isModalFilterDifferent;
const detailsSource = modalFilteredDetails || [];

            let recordsCount, totalInventoryVal, currentStockVal, slowMovingStockVal, obsoleteStockVal;
            
            if (hasDrilldown && modalApiData && modalApiData.dashKpis) {
                // If we have a drilldown and the backend provided the true dashboard KPIs for this drilldown!
                recordsCount = modalApiData.dashKpis.total_records || detailsSource.length;
                totalInventoryVal = modalApiData.dashKpis.total_inventory || 0;
                obsoleteStockVal = modalApiData.dashKpis.inventory_above_365 || 0;

                // Calculate current and slow moving from dashAging if available
                let currentTotal = 0;
                let slowMovingTotal = 0;
                if (modalApiData.dashAging) {
                    const agingList = Array.isArray(modalApiData.dashAging) ? modalApiData.dashAging : Object.entries(modalApiData.dashAging).map(([k,v]) => ({ bucket_code: k, amount: v }));
                    agingList.forEach(item => {
                        const k = String(item.bucket_code || item.bucket || item.name).toLowerCase();
                        const val = Number(item.amount || item.value || 0);
                        if (k.includes('0_30')) currentTotal += val;
                        else if (k.includes('91_120') || k.includes('121_180') || k.includes('181_365')) slowMovingTotal += val;
                    });
                }
                currentStockVal = currentTotal;
                slowMovingStockVal = slowMovingTotal;
            } else if (hasDrilldown) {
                // Fallback to summing frontend items if dashKpis is missing
                recordsCount = detailsSource.length;
                totalInventoryVal = detailsSource.reduce((s, r) => s + Number(r.total_stock_value || 0), 0);
                currentStockVal = detailsSource.reduce((s, r) => s + Number(r.aging_0_30 || 0), 0);
                slowMovingStockVal = detailsSource.reduce((s, r) => s + Number(r.aging_91_120 || 0) + Number(r.aging_121_180 || 0) + Number(r.aging_181_365 || 0), 0);
                obsoleteStockVal = detailsSource.reduce((s, r) => s + (Number(r.aging_366_730 || 0) + Number(r.aging_above_730 || 0)), 0);
            } else {
                // No drilldown -> Global Dashboard state
                recordsCount = (mockData.rawKpis && mockData.rawKpis.total_records) ? mockData.rawKpis.total_records : detailsSource.length;
                totalInventoryVal = mockData.totalInventory || 0;
                
                const currentBucket = (mockData.aging || []).find(a => String(a.bucket_code || a.name || a.code).toLowerCase().includes('0_30'));
                currentStockVal = currentBucket ? Number(currentBucket.value || 0) * 10000000 : 0; // wait, mockData.aging is divided by 10M, we need the raw value in AED!
                
                // For global slow moving, mockData.slowMoving might be top items. Let's calculate from mockData.aging instead!
                let slowMovingTotal = 0;
                (mockData.aging || []).forEach(a => {
                    const k = String(a.bucket_code || a.name || a.code).toLowerCase();
                    if (k.includes('91_120') || k.includes('121_180') || k.includes('181_365')) {
                         slowMovingTotal += Number(a.value || 0) * 10000000;
                    }
                });
                slowMovingStockVal = slowMovingTotal;
                obsoleteStockVal = mockData.rawKpis?.inventory_above_365 ? Number(mockData.rawKpis.inventory_above_365) : 0;
            }

          const formatKPICompact = (val) => {
            if (!val || isNaN(val)) return `${currentCurrency} 0.00M`;
            const inM = Number(val) / 1000000;
            return `${currentCurrency} ${inM.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
          };

          const isMillions = momCurrencyMode === "AED_MILLIONS";
          const scale = isMillions ? 1000000 : 1;
          const currencyHeader = isMillions ? `${currentCurrency} Millions` : currentCurrency;

          const SummaryCard = ({
            icon,
            title,
            value,
            iconBackground,
            iconColor,
            titleColor,
            cardBackground,
            borderColor,
          }) => (
            <div
              style={{
                background: cardBackground || "#ffffff",
                border: `1px solid ${borderColor || "#e2e8f0"}`,
                borderRadius: 12,
                minHeight: 78,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxSizing: "border-box",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  minWidth: 42,
                  borderRadius: "50%",
                  background: iconBackground,
                  color: iconColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                {icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: titleColor,
                    marginBottom: 3,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#142b6f",
                    whiteSpace: "nowrap",
                  }}
                >
                  {value}
                </div>
              </div>
            </div>
          );

          return (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(15, 23, 42, 0.48)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                boxSizing: "border-box",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setViewAllModal(null);
                  setShowViewAll(false);
                  setViewAllSearch("");
                  setViewAllDetailFilters({});
                }
              }}
            >
              <div
                className="sales-style-view-all-modal"
                style={{
                  width: "96vw", maxWidth: "1800px",
                  maxHeight: "92vh",
                  background: "#f7faff",
                  borderRadius: 10,
                  overflow: "hidden",
                  boxShadow: "0 18px 55px rgba(15, 23, 42, 0.28)",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    width: "100%",
                    minHeight: 0,
                    overflowY: "auto",
                    padding: "18px 18px 30px",
                    boxSizing: "border-box",
                    color: "#17213c",
                  }}
                >
                  {/* PAGE HEADER */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 15,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 27,
                          lineHeight: 1.1,
                          fontWeight: 800,
                          color: "#102a72",
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {modalHeaderTitle}
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          fontSize: 12,
                          color: "#64748b",
                        }}
                      >
                        {modalHeaderSubtitle}
                      </div>

                      {Object.keys(viewAllDetailFilters || {}).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Active Drilldown Filters:</span>
                          {viewAllDetailFilters.aging_bucket && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#e0f2fe", color: "#0369a1", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, border: "1px solid #bae6fd" }}>
                              Aging: {toAgingBucketCode(viewAllDetailFilters.aging_bucket)}
                              <button type="button" onClick={() => setViewAllDetailFilters(prev => { const n = {...prev}; delete n.aging_bucket; return n; })} style={{ border: "none", background: "transparent", color: "#0369a1", cursor: "pointer", padding: "0 2px", fontWeight: 800, fontSize: 11 }} title="Remove aging filter">✕</button>
                            </span>
                          )}
                          {viewAllDetailFilters.drilldown_parent_division_id && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef3c7", color: "#b45309", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, border: "1px solid #fde68a" }}>
                              Parent Division: {viewAllDetailFilters.drilldown_parent_division_id}
                              <button type="button" onClick={() => setViewAllDetailFilters(prev => { const n = {...prev}; delete n.drilldown_parent_division_id; return n; })} style={{ border: "none", background: "transparent", color: "#b45309", cursor: "pointer", padding: "0 2px", fontWeight: 800, fontSize: 11 }} title="Remove parent division filter">✕</button>
                            </span>
                          )}
                          {viewAllDetailFilters.drilldown_subdivision_id && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#ede9fe", color: "#6d28d9", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, border: "1px solid #ddd6fe" }}>
                              Subdivision: {viewAllDetailFilters.drilldown_subdivision_id}
                              <button type="button" onClick={() => setViewAllDetailFilters(prev => { const n = {...prev}; delete n.drilldown_subdivision_id; return n; })} style={{ border: "none", background: "transparent", color: "#6d28d9", cursor: "pointer", padding: "0 2px", fontWeight: 800, fontSize: 11 }} title="Remove subdivision filter">✕</button>
                            </span>
                          )}
                          {viewAllDetailFilters.subinventory_id && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fce7f3", color: "#be185d", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, border: "1px solid #fbcfe8" }}>
                              SUB-INV: {viewAllDetailFilters.subinventory_id}
                              <button type="button" onClick={() => setViewAllDetailFilters(prev => { const n = {...prev}; delete n.subinventory_id; return n; })} style={{ border: "none", background: "transparent", color: "#be185d", cursor: "pointer", padding: "0 2px", fontWeight: 800, fontSize: 11 }} title="Remove SUB-INV filter">✕</button>
                            </span>
                          )}
                          {viewAllDetailFilters.slow_moving && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef9c3", color: "#854d0e", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, border: "1px solid #fde047" }}>
                              Slow Moving (&gt;365 days)
                              <button type="button" onClick={() => setViewAllDetailFilters(prev => { const n = {...prev}; delete n.slow_moving; return n; })} style={{ border: "none", background: "transparent", color: "#854d0e", cursor: "pointer", padding: "0 2px", fontWeight: 800, fontSize: 11 }} title="Remove slow moving filter">✕</button>
                            </span>
                          )}
                          {viewAllDetailFilters.legal_entity_id && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f1f5f9", color: "#334155", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, border: "1px solid #cbd5e1" }}>
                              Legal Entity: {viewAllDetailFilters.legal_entity_id}
                              <button type="button" onClick={() => setViewAllDetailFilters(prev => { const n = {...prev}; delete n.legal_entity_id; return n; })} style={{ border: "none", background: "transparent", color: "#334155", cursor: "pointer", padding: "0 2px", fontWeight: 800, fontSize: 11 }} title="Remove legal entity filter">✕</button>
                            </span>
                          )}
                          {viewAllDetailFilters.as_on_date && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#15803d", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, border: "1px solid #bbf7d0" }}>
                              Snapshot: {viewAllDetailFilters.as_on_date}
                              <button type="button" onClick={() => setViewAllDetailFilters(prev => { const n = {...prev}; delete n.as_on_date; return n; })} style={{ border: "none", background: "transparent", color: "#15803d", cursor: "pointer", padding: "0 2px", fontWeight: 800, fontSize: 11 }} title="Remove date filter">✕</button>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setViewAllDetailFilters({})}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "#ef4444",
                              fontSize: 11,
                              fontWeight: 700,
                              textDecoration: "underline",
                              cursor: "pointer",
                              padding: "2px 4px",
                            }}
                          >
                            Clear All Drilldowns
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        type="button"
                        disabled={isExporting}
                        onClick={() => {
                          if (modalActiveTab === "momObsolete" || modalActiveTab === "mom" || slowMovingViewMode === "mom") {
                            handleExportMoM("excel", true);
                          } else if (modalActiveTab === "slowMoving" || slowMovingViewMode === "stock") {
                            handleExport("excel", "slow-moving", slowMovingFilters);
                          } else {
                            handleExport("excel", "inventory-details", modalDetailsFilters, viewAllDetailFilters);
                          }
                        }}
                        style={{
                          height: 34,
                          minWidth: 72,
                          padding: "0 13px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          border: "1px solid #86efac",
                          borderRadius: 8,
                          background: "#f0fdf4",
                          color: "#16a34a",
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: isExporting ? "not-allowed" : "pointer",
                        }}
                      >
                        <span style={{ fontSize: 13 }}>📊</span>
                        Excel
                      </button>
                      <button
                        type="button"
                        disabled={isExporting}
                        onClick={() => {
                          if (modalActiveTab === "momObsolete" || modalActiveTab === "mom" || slowMovingViewMode === "mom") {
                            handleExportMoM("pdf", true);
                          } else if (modalActiveTab === "slowMoving" || slowMovingViewMode === "stock") {
                            handleExport("pdf", "slow-moving", slowMovingFilters);
                          } else {
                            // For all drilldown-based tabs always export from /inventory/view-all with drilldown filters
                            handleExport("pdf", "inventory-details", modalDetailsFilters, viewAllDetailFilters);
                          }
                        }}
                        style={{
                          height: 34,
                          minWidth: 72,
                          padding: "0 13px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          border: "1px solid #fda4af",
                          borderRadius: 8,
                          background: "#fff8f8",
                          color: "#ef4444",
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: isExporting ? "not-allowed" : "pointer",
                        }}
                      >
                        <span style={{ fontSize: 13 }}>📄</span>
                        PDF
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setViewAllModal(null);
                          setShowViewAll(false);
                          setViewAllSearch("");
                          setViewAllDetailFilters({});
                        }}
                        style={{
                          height: 34,
                          padding: "0 13px",
                          border: "1px solid #cbd5e1",
                          borderRadius: 5,
                          background: "#ffffff",
                          color: "#3149a5",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ✖
                      </button>
                    </div>
                  </div>

                  {/* FILTERS CARD */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e3e9f2",
                      borderRadius: 9,
                      padding: "13px 14px 15px",
                      marginBottom: 14,
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.025)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 11,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          color: "#173b8f",
                          fontSize: 16,
                          fontWeight: 800,
                        }}
                      >
                        Filters
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.1fr 1fr 1fr 1fr 0.95fr 0.95fr auto auto",
                        gap: 10,
                        alignItems: "end",
                      }}
                    >
                      {/* Legal Entity */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#173b8f", marginBottom: 5 }}>Legal Entity</div>
                        <ModalMultiSelect
                          options={mockData.filters.legalEntities}
                          value={slowMovingDraftFilters.legalEntity}
                          onChange={(vals) => {
                              const updateState = (prev) => {
                                const next = { ...prev, legalEntity: vals };
                                if ('legalEntity' === 'legalGroup') {
                                  next.legalEntity = ["All"];
                                  next.parentDivision = ["All"];
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('legalEntity' === 'legalEntity') {
                                  next.parentDivision = ["All"];
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('legalEntity' === 'parentDivision') {
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('legalEntity' === 'subdivision') {
                                  next.subinventory = ["All"];
                                }
                                return next;
                              };
                              setSlowMovingDraftFilters(updateState);
                              setModalDetailsFilters(updateState);
                            }}
                          placeholder="All Legal Entity"
                        />
                      </div>

                      {/* Parent Division */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#173b8f", marginBottom: 5 }}>Parent Division</div>
                        <ModalMultiSelect
                          options={mockData.filters.parentDivisions}
                          value={slowMovingDraftFilters.parentDivision}
                          onChange={(vals) => {
                              const updateState = (prev) => {
                                const next = { ...prev, parentDivision: vals };
                                if ('parentDivision' === 'legalGroup') {
                                  next.legalEntity = ["All"];
                                  next.parentDivision = ["All"];
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('parentDivision' === 'legalEntity') {
                                  next.parentDivision = ["All"];
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('parentDivision' === 'parentDivision') {
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('parentDivision' === 'subdivision') {
                                  next.subinventory = ["All"];
                                }
                                return next;
                              };
                              setSlowMovingDraftFilters(updateState);
                              setModalDetailsFilters(updateState);
                            }}
                          placeholder="All Parent Division"
                        />
                      </div>

                      {/* Sub-Division */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#173b8f", marginBottom: 5 }}>Sub-Division</div>
                        <ModalMultiSelect
                          options={mockData.filters.subdivisions}
                          value={slowMovingDraftFilters.subdivision}
                          onChange={(vals) => {
                              const updateState = (prev) => {
                                const next = { ...prev, subdivision: vals };
                                if ('subdivision' === 'legalGroup') {
                                  next.legalEntity = ["All"];
                                  next.parentDivision = ["All"];
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('subdivision' === 'legalEntity') {
                                  next.parentDivision = ["All"];
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('subdivision' === 'parentDivision') {
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('subdivision' === 'subdivision') {
                                  next.subinventory = ["All"];
                                }
                                return next;
                              };
                              setSlowMovingDraftFilters(updateState);
                              setModalDetailsFilters(updateState);
                            }}
                          placeholder="All Sub-Division"
                        />
                      </div>

                      {/* SUB-INV Code */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#173b8f", marginBottom: 5 }}>SUB-INV Code</div>
                        <ModalMultiSelect
                          options={mockData.filters.subinventories}
                          value={slowMovingDraftFilters.subinventory}
                          onChange={(vals) => {
                              const updateState = (prev) => {
                                const next = { ...prev, subinventory: vals };
                                if ('subinventory' === 'legalGroup') {
                                  next.legalEntity = ["All"];
                                  next.parentDivision = ["All"];
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('subinventory' === 'legalEntity') {
                                  next.parentDivision = ["All"];
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('subinventory' === 'parentDivision') {
                                  next.subdivision = ["All"];
                                  next.subinventory = ["All"];
                                } else if ('subinventory' === 'subdivision') {
                                  next.subinventory = ["All"];
                                }
                                return next;
                              };
                              setSlowMovingDraftFilters(updateState);
                              setModalDetailsFilters(updateState);
                            }}
                          placeholder="All SUB-INV"
                        />
                      </div>

                      {/* Reporting Currency */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#173b8f", marginBottom: 5 }}>Reporting Currency</div>
                        <select
                          value={momCurrencyMode}
                          onChange={(e) => setMomCurrencyMode(e.target.value)}
                          style={{
                            width: "100%",
                            height: 34,
                            padding: "0 8px",
                            borderRadius: 5,
                            border: "1px solid #d9e1ee",
                            background: "#fff",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#29427f",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        >
                          <option value="AED">{currentCurrency}</option>
                          <option value="AED_MILLIONS">{currentCurrency} Millions</option>
                        </select>
                      </div>

                      {/* As On Date */}
                      <div style={{ minWidth: 0, position: "relative" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#173b8f", marginBottom: 5 }}>As On Date</div>
                        <div style={{ position: "relative" }}>
                          <input
                            id="view-all-modal-date-picker-grid"
                            type="date"
                            value={getRawDateForInputGlobal(slowMovingDraftFilters.asOnDate && slowMovingDraftFilters.asOnDate !== "All" ? slowMovingDraftFilters.asOnDate : (mockData.dataAsOf || appliedFilters.asOnDate))}
                            onChange={(e) => {
                              setSlowMovingDraftFilters(prev => ({ ...prev, asOnDate: e.target.value }));
                              setModalDetailsFilters(prev => ({ ...prev, asOnDate: e.target.value }));
                            }}
                            style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById("view-all-modal-date-picker-grid");
                              if (el) { el.showPicker ? el.showPicker() : el.click(); }
                            }}
                            style={{
                              height: 34,
                              width: "100%",
                              boxSizing: "border-box",
                              border: "1px solid #d9e1ee",
                              borderRadius: 5,
                              padding: "0 9px",
                              background: "#ffffff",
                              color: "#29427f",
                              outline: "none",
                              cursor: "pointer",
                              textAlign: "left",
                              position: "relative",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: 11,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 4 }}>
                              {formatDisplayDateGlobal(slowMovingDraftFilters.asOnDate && slowMovingDraftFilters.asOnDate !== "All" ? slowMovingDraftFilters.asOnDate : (mockData.dataAsOf || filters.asOnDate || "Selected Date"))}
                            </span>
                            <span style={{ fontSize: 14, pointerEvents: "none", flexShrink: 0 }}>
                              📅
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Apply */}
                      <button
                        type="button"
                        onClick={() => {
                          setSlowMovingFilters({ ...slowMovingDraftFilters });
                          toast.success("Filters applied");
                        }}
                        style={{
                          height: 34,
                          padding: "0 20px",
                          border: "none",
                          borderRadius: 5,
                          background: "#4936e9",
                          color: "#ffffff",
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Apply
                      </button>

                      {/* Reset */}
                      <button
                        type="button"
                        onClick={() => {
                          const resetObj = {
                            legalEntity: ['All'],
                            parentDivision: ['All'],
                            subdivision: ['All'],
                            subinventory: ['All'],
                            asOnDate: 'All',
                          };
                          setSlowMovingDraftFilters(resetObj);
                          setSlowMovingFilters(resetObj);
                          setModalDetailsFilters(resetObj);
                          setViewAllDetailFilters({});
                          toast.success("Filters reset");
                        }}
                        style={{
                          height: 34,
                          padding: "0 18px",
                          border: "1px solid #d4dbe7",
                          borderRadius: 5,
                          background: "#ffffff",
                          color: "#334155",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* KPI SUMMARY CARDS */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.05fr repeat(4, 1fr)",
                      gap: 9,
                      marginBottom: 14,
                    }}
                  >
                    {/* Records Count */}
                    <div
                      style={{
                        background: "#f0f5ff",
                        border: "1px solid #dbeafe",
                        borderRadius: 12,
                        minHeight: 78,
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        boxSizing: "border-box",
                        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: "#edf4ff",
                          color: "#1464e8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 19,
                        }}
                      >
                        ▤
                      </div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#142b6f" }}>
                          {recordsCount === 500 ? "500+" : recordsCount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>
                          records
                        </div>
                      </div>
                    </div>

                    <SummaryCard
                      icon="▣"
                      title="Total Inventory"
                      value={formatKPICompact(totalInventoryVal)}
                      iconBackground="#e5faf2"
                      iconColor="#149b6f"
                      titleColor="#149b6f"
                      cardBackground="#f0fdf4"
                      borderColor="#bbf7d0"
                    />

                    <SummaryCard
                      icon="▤"
                      title="Current (0-30 Days)"
                      value={formatKPICompact(currentStockVal)}
                      iconBackground="#e5faf2"
                      iconColor="#149b6f"
                      titleColor="#149b6f"
                      cardBackground="#f0fdf4"
                      borderColor="#bbf7d0"
                    />

                    <SummaryCard
                      icon="⌛"
                      title="Slow Moving Stock"
                      value={formatKPICompact(slowMovingStockVal)}
                      iconBackground="#fff2df"
                      iconColor="#ed8a17"
                      titleColor="#c2410c"
                      cardBackground="#fff7ed"
                      borderColor="#fed7aa"
                    />

                    <SummaryCard
                      icon="!"
                      title="Obsolete Stock (> 365 Days)"
                      value={formatKPICompact(obsoleteStockVal)}
                      iconBackground="#ffeaf0"
                      iconColor="#ed3c69"
                      titleColor="#be185d"
                      cardBackground="#fdf2f8"
                      borderColor="#fbcfe8"
                    />
                  </div>

                  {/* CONTENT CARD WITH TABS */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e3e9f2",
                      borderRadius: 9,
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.025)",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Dynamic Context Tabs */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ display: "inline-flex", background: "#f1f5f9", padding: 3, borderRadius: 8, border: "1px solid #e2e8f0", gap: 3 }}>
                          {getModalTabs(viewAllSection).map((tab) => {
                            const isActive = modalActiveTab === tab.id;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                  setModalActiveTab(tab.id);
                                  setSlowMovingViewMode(tab.id === "momObsolete" ? "mom" : (tab.id === "slowMoving" ? "stock" : "details"));
                                }}
                                style={{
                                  padding: "5px 14px",
                                  fontSize: "0.76rem",
                                  fontWeight: 700,
                                  borderRadius: 6,
                                  border: "none",
                                  background: isActive ? "#2563eb" : "transparent",
                                  color: isActive ? "#fff" : "#475569",
                                  cursor: "pointer",
                                  boxShadow: isActive ? "0 1px 3px rgba(37,99,235,0.3)" : "none",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {tab.label}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                          {modalActiveTab === "aging" && "Inventory aging breakdown by bucket, valuation, % of total, and record counts"}
                          {modalActiveTab === "trend" && "Monthly inventory valuation trend, turnover ratio, and DIO analysis"}
                          {modalActiveTab === "parentDivision" && "Detailed inventory holdings, aging distribution, and turnover by parent division"}
                          {modalActiveTab === "subdivision" && "Sub-division holdings ranked by valuation, quantity, and obsolete status"}
                          {modalActiveTab === "slowMoving" && "Aggregated slow moving inventory valuation and obsolete position by parent division"}
                          {(modalActiveTab === "momObsolete" || modalActiveTab === "mom") && (
                              <>
                                {`Month-on-Month ${viewAllSection === "parentDivision" ? "total inventory" : "obsolete stock"} comparison across periods (Year: ${momYear})`}
                                {momData.length > 0 && (
                                  <span style={{ marginLeft: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "1px 8px", fontSize: "0.72rem", fontWeight: 700, color: "#1d4ed8", verticalAlign: "middle" }}>
                                    {momData.length} Parent Division{momData.length !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </>
                            )}
                          {modalActiveTab === "details" && "Detailed line-item inventory valuation and aging status"}
                        </div>
                      </div>

                      {/* Right side controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {(modalActiveTab === "momObsolete" || modalActiveTab === "mom" || slowMovingViewMode === "mom") && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Year</span>
                            <input
                              value={momYear}
                              readOnly
                              style={{
                                height: 28,
                                width: 55,
                                border: "1px solid #d5ddeb",
                                borderRadius: 5,
                                background: "#fff",
                                color: "#2563eb",
                                padding: "0 4px",
                                fontSize: "0.74rem",
                                fontWeight: 700,
                                textAlign: "center",
                              }}
                            />
                          </div>
                        )}
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => setMomCurrencyMode("AED")}
                            style={{
                              height: 28,
                              minWidth: 40,
                              padding: "0 8px",
                              borderRadius: 6,
                              border: momCurrencyMode === "AED" ? "1px solid #5B3FE4" : "1px solid #E2E8F0",
                              background: momCurrencyMode === "AED" ? "#5B3FE4" : "#FFFFFF",
                              color: momCurrencyMode === "AED" ? "#FFFFFF" : "#334155",
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >{currentCurrency}</button>
                          <button
                            type="button"
                            onClick={() => setMomCurrencyMode("AED_MILLIONS")}
                            style={{
                              height: 28,
                              minWidth: 74,
                              padding: "0 8px",
                              borderRadius: 6,
                              border: momCurrencyMode === "AED_MILLIONS" ? "1px solid #5B3FE4" : "1px solid #E2E8F0",
                              background: momCurrencyMode === "AED_MILLIONS" ? "#5B3FE4" : "#FFFFFF",
                              color: momCurrencyMode === "AED_MILLIONS" ? "#FFFFFF" : "#334155",
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >{currentCurrency} Millions</button>
                        </div>

                        <input
                          type="text"
                          placeholder="Search..."
                          value={viewAllSearch}
                          onChange={(e) => setViewAllSearch(e.target.value)}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            fontSize: "0.74rem",
                            width: 170,
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* TABLE AREA */}
                    <div className="modal-table-scroll" style={{ padding: "0 10px 14px", overflowX: "auto", overflowY: "auto", maxHeight: "65vh" }}>
                      {/* CONTEXT TAB 1: AGING SUMMARY BREAKDOWN */}
                      {modalActiveTab === "aging" && (() => {
                        const agingDefs = [
                          { code: "0_30", label: "0-30 Days", field: "aging_0_30", status: "Current", color: "#16a34a", bg: "#dcfce7", fg: "#15803d" },
                          { code: "31_60", label: "31-60 Days", field: "aging_31_60", status: "Active", color: "#2563eb", bg: "#dbeafe", fg: "#1d4ed8" },
                          { code: "61_90", label: "61-90 Days", field: "aging_61_90", status: "Active", color: "#0284c7", bg: "#e0f2fe", fg: "#0369a1" },
                          { code: "91_120", label: "91-120 Days", field: "aging_91_120", status: "Slow Moving", color: "#f59e0b", bg: "#fef3c7", fg: "#b45309" },
                          { code: "121_180", label: "121-180 Days", field: "aging_121_180", status: "Slow Moving", color: "#ea580c", bg: "#ffedd5", fg: "#c2410c" },
                          { code: "181_365", label: "181-365 Days", field: "aging_181_365", status: "Slow Moving", color: "#dc2626", bg: "#fee2e2", fg: "#b91c1c" },
                          { code: "366_730", label: "366-730 Days", field: "aging_366_730", status: "Obsolete", color: "#9333ea", bg: "#f3e8ff", fg: "#7e22ce" },
                          { code: "above_730", label: "Above 730 Days", field: "aging_above_730", status: "Obsolete", color: "#475569", bg: "#f1f5f9", fg: "#334155" },
                        ];

                        const rows = agingDefs.map(def => {
                          const mockItem = (mockData.aging || []).find(a => toAgingBucketCode(a.bucket_code || a.name || a.code) === def.code);
                          const sumFromDetails = detailsSource.reduce((acc, r) => acc + Number(r[def.field] || 0), 0);
                          const itemCount = detailsSource.filter(r => Number(r[def.field] || 0) > 0).length;
                          const finalAmount = sumFromDetails > 0 ? sumFromDetails : (mockItem ? Number(mockItem.value || 0) : 0);
                          const pct = totalInventoryVal > 0 ? (finalAmount / totalInventoryVal) * 100 : (mockItem ? Number(mockItem.percentage || 0) : 0);
                          const isFiltered = viewAllDetailFilters.aging_bucket && toAgingBucketCode(viewAllDetailFilters.aging_bucket) === def.code;

                          return {
                            ...def,
                            amount: finalAmount,
                            pct,
                            itemCount,
                            isFiltered,
                          };
                        }).filter(r => {
                          if (!viewAllSearch) return true;
                          const q = viewAllSearch.toLowerCase();
                          return r.label.toLowerCase().includes(q) || r.status.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
                        });

                        const totalSum = rows.reduce((s, r) => s + r.amount, 0);

                        return (
                          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 170, verticalAlign: "bottom", lineHeight: 1.25 }}>Aging Bucket</th>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 130, verticalAlign: "bottom", lineHeight: 1.25 }}>Category / Status</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 150, verticalAlign: "bottom", lineHeight: 1.3 }}>Total Value<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 130, verticalAlign: "bottom", lineHeight: 1.25 }}>% of Total<br />Inventory</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 120, verticalAlign: "bottom", lineHeight: 1.25 }}>Line-Item<br />Count</th>
                                </tr>
                            </thead>
                            <tbody>
                              {rows.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No records found</td></tr>
                              ) : (
                                rows.map((row, idx) => (
                                  <tr
                                    key={row.code}
                                    onClick={() => {
                                      setViewAllDetailFilters(prev => ({ ...prev, aging_bucket: row.code }));
                                      setModalActiveTab("details");
                                      setSlowMovingViewMode("details");
                                    }}
                                    style={{
                                      borderBottom: "1px solid #f1f5f9",
                                      background: row.isFiltered ? "#eff6ff" : (idx % 2 === 0 ? "#fff" : "#fafbfc"),
                                      cursor: "pointer",
                                    }}
                                    title={`Click to view line items for ${row.label}`}
                                  >
                                    <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1d4ed8" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: row.color, display: "inline-block" }} />
                                        <span>{row.label}</span>
                                        {row.isFiltered && (
                                          <span style={{ fontSize: 10, background: "#dbeafe", color: "#1d4ed8", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                                            Selected
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td style={{ padding: "8px 10px" }}>
                                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: "0.72rem", fontWeight: 700, background: row.bg, color: row.fg }}>
                                        {row.status}
                                      </span>
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(row.amount / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: row.color, fontVariantNumeric: "tabular-nums" }}>
                                      {row.pct.toFixed(1)}%
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", color: "#334155", fontVariantNumeric: "tabular-nums" }}>
                                      {row.itemCount.toLocaleString("en-US")}
                                    </td>
                                    </tr>
                                ))
                              )}
                            </tbody>
                            {rows.length > 0 && (
                              <tfoot style={{ position: "sticky", bottom: 0, zIndex: 20, background: "#f8fafc" }}>
                                  <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                                    <td style={{ padding: "10px 10px", color: "#1e3a8a" }}>Total</td>
                                  <td style={{ padding: "10px 10px" }} />
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(totalSum / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>100.0%</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#334155", fontVariantNumeric: "tabular-nums" }}>
                                    {recordsCount === 500 ? "500+" : recordsCount.toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px" }} />
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        );
                      })()}

                      {/* CONTEXT TAB 2: INVENTORY TREND ANALYSIS */}
                      {modalActiveTab === "trend" && (() => {
                        const trendList = (mockData.trend?.list && mockData.trend.list.length > 0)
                          ? mockData.trend.list
                          : ((mockData.trend?.rawItems && mockData.trend.rawItems.length > 0)
                            ? mockData.trend.rawItems.map((item, idx) => {
                                const month = mockData.trend.labels?.[idx] || `Month ${idx + 1}`;
                                const curr = Number(item.inventory_value || 0) / 10000000;
                                const prev = (item.previous_value !== undefined && item.previous_value !== null) ? Number(item.previous_value) / 10000000 : (idx > 0 ? Number(mockData.trend.rawItems[idx-1].inventory_value || 0) / 10000000 : null);
                                const variance = prev !== null ? curr - prev : null;
                                const growth = (prev !== null && prev !== 0) ? ((curr - prev) / prev) * 100 : null;
                                const as_on_date = item.as_on_date || (typeof item.month_start === 'object' ? item.month_start?.as_on_date || item.month_start?.name : item.month_start);
                                return { ...item, month, current: curr, previous: prev, variance, growth, as_on_date };
                              })
                            : (viewAllData && viewAllData.length > 0 ? viewAllData : []));

                        const rows = trendList.filter(item => {
                          if (!viewAllSearch) return true;
                          const q = viewAllSearch.toLowerCase();
                          const m = String(item.month || item.as_on_date || "").toLowerCase();
                          return m.includes(q);
                        });

                        return (
                          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 140, verticalAlign: "bottom", lineHeight: 1.25 }}>Period /<br />Month</th>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 120, verticalAlign: "bottom", lineHeight: 1.25 }}>Snapshot<br />Date</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 140, verticalAlign: "bottom", lineHeight: 1.3 }}>Inventory Value<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 140, verticalAlign: "bottom", lineHeight: 1.3 }}>Previous Month<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 130, verticalAlign: "bottom", lineHeight: 1.3 }}>Monthly Variance<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 110, verticalAlign: "bottom", lineHeight: 1.25 }}>Variance<br />%</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 110, verticalAlign: "bottom", lineHeight: 1.25 }}>Turnover<br />Ratio</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 100, verticalAlign: "bottom", lineHeight: 1.25 }}>DIO<br />(Days)</th>
                                </tr>
                            </thead>
                            <tbody>
                              {rows.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No trend records found</td></tr>
                              ) : (
                                rows.map((row, idx) => {
                                  const rawVal = Number(row.inventory_value !== undefined ? row.inventory_value : (row.current !== undefined ? (row.current < 1000 ? row.current * 10000000 : row.current) : (row.total_stock_value || 0)));
                                  const rawPrev = (row.previous_value !== undefined && row.previous_value !== null) ? Number(row.previous_value) : (row.previous !== undefined && row.previous !== null ? (row.previous < 1000 ? Number(row.previous) * 10000000 : Number(row.previous)) : (idx > 0 ? Number(rows[idx-1].inventory_value !== undefined ? rows[idx-1].inventory_value : (rows[idx-1].current !== undefined ? (rows[idx-1].current < 1000 ? rows[idx-1].current * 10000000 : rows[idx-1].current) : 0)) : null));
                                  const variance = rawPrev !== null ? (rawVal - rawPrev) : null;
                                  const variancePct = (rawPrev !== null && rawPrev !== 0) ? ((rawVal - rawPrev) / rawPrev) * 100 : null;
                                  const turnover = row.inventory_turnover ?? mockData.turnoverDioTrend?.turnover?.[idx] ?? 4.2;
                                  const dio = row.dio_days ?? row.dio ?? mockData.turnoverDioTrend?.dio?.[idx] ?? 86;
                                  const snapDate = row.as_on_date || "2026-09-25";
                                  const isFiltered = viewAllDetailFilters.as_on_date && toApiDate(viewAllDetailFilters.as_on_date) === toApiDate(snapDate);

                                  return (
                                    <tr
                                      key={idx}
                                      onClick={() => {
                                        if (snapDate) setViewAllDetailFilters(prev => ({ ...prev, as_on_date: toApiDate(snapDate) }));
                                        setModalActiveTab("details");
                                        setSlowMovingViewMode("details");
                                      }}
                                      style={{
                                        borderBottom: "1px solid #f1f5f9",
                                        background: isFiltered ? "#eff6ff" : (idx % 2 === 0 ? "#fff" : "#fafbfc"),
                                        cursor: "pointer",
                                      }}
                                      title={`Click to view line items for ${row.month || snapDate}`}
                                    >
                                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1d4ed8" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                          <span>{row.month || "-"}</span>
                                          {isFiltered && (
                                            <span style={{ fontSize: 10, background: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                                              Selected
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td style={{ padding: "8px 10px", color: "#334155", fontVariantNumeric: "tabular-nums" }}>{snapDate}</td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                        {Math.round(rawVal / scale).toLocaleString("en-US")}
                                      </td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", color: "#475569", fontVariantNumeric: "tabular-nums" }}>
                                        {rawPrev !== null ? Math.round(rawPrev / scale).toLocaleString("en-US") : "-"}
                                      </td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: variance === null ? "#64748b" : (variance < 0 ? "#16a34a" : "#dc2626"), fontVariantNumeric: "tabular-nums" }}>
                                        {variance !== null ? `${variance > 0 ? '+' : ''}${Math.round(variance / scale).toLocaleString("en-US")}` : "-"}
                                      </td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: variancePct === null ? "#64748b" : (variancePct < 0 ? "#16a34a" : "#dc2626"), fontVariantNumeric: "tabular-nums" }}>
                                        {variancePct !== null ? `${variancePct > 0 ? '+' : ''}${variancePct.toFixed(1)}%` : "-"}
                                      </td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#2563eb", fontVariantNumeric: "tabular-nums" }}>
                                        {typeof turnover === "number" ? turnover.toFixed(1) : turnover}x
                                      </td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#475569", fontVariantNumeric: "tabular-nums" }}>
                                        {Math.round(Number(dio))}
                                      </td>
                                      </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        );
                      })()}

                      {/* CONTEXT TAB 3: PARENT DIVISION PERFORMANCE */}
                      {modalActiveTab === "parentDivision" && (() => {
                        const sourceDivs = (viewAllData && viewAllData.length > 0)
                          ? viewAllData
                          : ((mockData.allDivisions && mockData.allDivisions.length > 0)
                            ? mockData.allDivisions
                            : ((mockData.divisions && mockData.divisions.length > 0) ? mockData.divisions : []));

                        const rows = sourceDivs.map((div, idx) => {
                          const name = div.parent_division_name || div.name || div.desc || div.label || "-";
                          const divId = div.parent_division_id || div.id || name;
                          
                          // Use explicit backend aggregate values
                          const divTotal = Number(div.total_stock_value || div.total_cost_value || (div.value ? (div.value < 1000 ? div.value * 10000000 : div.value) : 0));
                          const currentVal = Number(div.aging_0_30 || divStats[name]?.cur || Math.round(divTotal * 0.45));
                          const activeVal = Number(div.aging_31_60 || 0) + Number(div.aging_61_90 || 0) + Number(div.aging_91_120 || 0) + Number(div.aging_121_180 || 0) || (divStats[name]?.act || Math.round(divTotal * 0.35));
                          const slowVal = Number(div.aging_181_365 || divStats[name]?.slow || Math.round(divTotal * 0.12));
                          const obsVal = Number(div.aging_366_730 || 0) + Number(div.aging_above_730 || 0) || (divStats[name]?.obs || Math.round(divTotal * 0.08));
                          const pctObs = divTotal > 0 ? (obsVal / divTotal) * 100 : 0;
                          const pctTotal = totalInventoryVal > 0 ? (divTotal / totalInventoryVal) * 100 : Number(div.percentage || 0);
                          
                          const isFiltered = viewAllDetailFilters.parent_division_id && (
                            String(viewAllDetailFilters.parent_division_id).trim().toLowerCase() === String(divId).trim().toLowerCase() ||
                            String(viewAllDetailFilters.parent_division_id).trim().toLowerCase() === String(name).trim().toLowerCase()
                          );

                          return {
                            srNo: idx + 1,
                            name,
                            divId,
                            total: divTotal,
                            pctTotal,
                            currentVal,
                            activeVal,
                            slowVal,
                            obsVal,
                            pctObs,
                            itemCount: 0,
                            isFiltered,
                          };
                        }).filter(r => {
                          if (!viewAllSearch) return true;
                          return r.name.toLowerCase().includes(viewAllSearch.toLowerCase());
                        });

                        const sumTotal = rows.reduce((s, r) => s + r.total, 0);
                        const sumCurrent = rows.reduce((s, r) => s + r.currentVal, 0);
                        const sumActive = rows.reduce((s, r) => s + r.activeVal, 0);
                        const sumSlow = rows.reduce((s, r) => s + r.slowVal, 0);
                        const sumObs = rows.reduce((s, r) => s + r.obsVal, 0);

                        return (
                          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: "auto", verticalAlign: "bottom", lineHeight: 1.25 }}>Parent Division</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 140, verticalAlign: "bottom", lineHeight: 1.3 }}>Total Stock Value<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 90, verticalAlign: "bottom", lineHeight: 1.25 }}>% Total</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 120, verticalAlign: "bottom", lineHeight: 1.3 }}>Current (0-30)<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 120, verticalAlign: "bottom", lineHeight: 1.3 }}>Active (31-180)<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 120, verticalAlign: "bottom", lineHeight: 1.3 }}>Slow Moving<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 120, verticalAlign: "bottom", lineHeight: 1.3 }}>Obsolete (&gt;365)<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 90, verticalAlign: "bottom", lineHeight: 1.25 }}>% Obsolete</th>
                                </tr>
                            </thead>
                            <tbody>
                              {rows.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No division records found</td></tr>
                              ) : (
                                rows.map((row, idx) => (
                                  <tr
                                    key={idx}
                                    onClick={() => {
                                      setViewAllDetailFilters(prev => ({ ...prev, parent_division_id: row.divId || row.name }));
                                      setModalActiveTab("details");
                                      setSlowMovingViewMode("details");
                                    }}
                                    style={{
                                      borderBottom: "1px solid #f1f5f9",
                                      background: row.isFiltered ? "#eff6ff" : (idx % 2 === 0 ? "#fff" : "#fafbfc"),
                                      cursor: "pointer",
                                    }}
                                    title={`Click to view line items for ${row.name}`}
                                  >
                                    <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1d4ed8" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span>{row.name}</span>
                                        {row.isFiltered && (
                                          <span style={{ fontSize: 10, background: "#fef3c7", color: "#b45309", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                                            Selected
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(row.total / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#2563eb", fontVariantNumeric: "tabular-nums" }}>
                                      {row.pctTotal.toFixed(1)}%
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", color: "#16a34a", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(row.currentVal / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", color: "#2563eb", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(row.activeVal / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", color: "#ea580c", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(row.slowVal / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#e11d48", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(row.obsVal / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: row.pctObs > 20 ? "#dc2626" : "#e11d48", fontVariantNumeric: "tabular-nums" }}>
                                      {row.pctObs.toFixed(1)}%
                                    </td>
                                    </tr>
                                ))
                              )}
                            </tbody>
                            {rows.length > 0 && (
                              <tfoot style={{ position: "sticky", bottom: 0, zIndex: 20, background: "#f8fafc" }}>
                                  <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                                    <td style={{ padding: "10px 10px", color: "#1e3a8a" }}>Total</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(sumTotal / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>100.0%</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#16a34a", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(sumCurrent / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#2563eb", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(sumActive / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#ea580c", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(sumSlow / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#e11d48", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(sumObs / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#e11d48" }}>
                                    {(sumTotal > 0 ? (sumObs / sumTotal) * 100 : 0).toFixed(1)}%
                                  </td>
                                  <td style={{ padding: "10px 10px" }} />
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        );
                      })()}

                      {/* CONTEXT TAB 4: SUBDIVISION PERFORMANCE */}
                      {modalActiveTab === "subdivision" && (() => {
                        const sourceSubs = (viewAllData && viewAllData.length > 0)
                          ? viewAllData
                          : ((mockData.allSubdivisions && mockData.allSubdivisions.length > 0)
                            ? mockData.allSubdivisions
                            : ((mockData.bySubdivision && mockData.bySubdivision.length > 0) ? mockData.bySubdivision : []));

                        const rows = sourceSubs.map((sub, idx) => {
                          const name = sub.name || sub.subdivision_name || sub.sub_division_name || sub.sub_division || sub.desc || sub.label || "-";
                          const subId = sub.subdivision_id || sub.id || name;
                          
                          const subVal = Number(sub.inventory_value || sub.total_stock_value || (sub.value ? (sub.value < 1000 ? sub.value * 10000000 : sub.value) : 0));
                          const subQty = Number(sub.quantity || sub.qty || 0);
                          const parentDiv = sub.parent_division || sub.parent_division_name || "-";
                          
                          const currentVal = Number(sub.aging_0_30 || Math.round(subVal * 0.45));
                          const slowVal = Number(sub.aging_91_120 || 0) + Number(sub.aging_121_180 || 0) + Number(sub.aging_181_365 || 0) || Math.round(subVal * 0.15);
                          const obsVal = Number(sub.aging_366_730 || 0) + Number(sub.aging_above_730 || 0) || Math.round(subVal * 0.08);
                          
                          const pctObs = subVal > 0 ? (obsVal / subVal) * 100 : 0;
                          const pctTotal = totalInventoryVal > 0 ? (subVal / totalInventoryVal) * 100 : Number(sub.percentage || 0);
                          
                          const isFiltered = viewAllDetailFilters.subdivision_id && (
                            String(viewAllDetailFilters.subdivision_id).trim().toLowerCase() === String(subId).trim().toLowerCase() ||
                            String(viewAllDetailFilters.subdivision_id).trim().toLowerCase() === String(name).trim().toLowerCase()
                          );

                          return {
                            srNo: idx + 1,
                            name,
                            subId,
                            parentDiv,
                            val: subVal,
                            qty: subQty,
                            pctTotal,
                            currentVal,
                            slowVal,
                            obsVal,
                            pctObs,
                            itemCount: 0,
                            isFiltered,
                          };
                        }).filter(r => {
                          if (!viewAllSearch) return true;
                          const q = viewAllSearch.toLowerCase();
                          return r.name.toLowerCase().includes(q) || r.parentDiv.toLowerCase().includes(q);
                        });

                        const sumVal = rows.reduce((s, r) => s + r.val, 0);
                        const sumQty = rows.reduce((s, r) => s + r.qty, 0);
                        const sumCurrent = rows.reduce((s, r) => s + r.currentVal, 0);
                        const sumSlow = rows.reduce((s, r) => s + r.slowVal, 0);
                        const sumObs = rows.reduce((s, r) => s + r.obsVal, 0);

                        return (
                          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: "auto", verticalAlign: "bottom", lineHeight: 1.25 }}>Sub-Division</th>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: "auto", verticalAlign: "bottom", lineHeight: 1.25 }}>Parent Division</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 140, verticalAlign: "bottom", lineHeight: 1.3 }}>Inventory Value<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 90, verticalAlign: "bottom", lineHeight: 1.25 }}>% Share</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 100, verticalAlign: "bottom", lineHeight: 1.25 }}>Qty<br />(Nos)</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 120, verticalAlign: "bottom", lineHeight: 1.3 }}>Current (0-30)<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 120, verticalAlign: "bottom", lineHeight: 1.3 }}>Slow Moving<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 120, verticalAlign: "bottom", lineHeight: 1.3 }}>Obsolete (&gt;365)<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 90, verticalAlign: "bottom", lineHeight: 1.25 }}>% Obsolete</th>
                                </tr>
                            </thead>
                            <tbody>
                              {rows.length === 0 ? (
                                <tr><td colSpan={9} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No sub-division records found</td></tr>
                              ) : (
                                rows.map((row, idx) => (
                                  <tr
                                    key={idx}
                                    onClick={() => {
                                      setViewAllDetailFilters(prev => ({ ...prev, subdivision_id: row.subId || row.name }));
                                      setModalActiveTab("details");
                                      setSlowMovingViewMode("details");
                                    }}
                                    style={{
                                      borderBottom: "1px solid #f1f5f9",
                                      background: row.isFiltered ? "#eff6ff" : (idx % 2 === 0 ? "#fff" : "#fafbfc"),
                                      cursor: "pointer",
                                    }}
                                    title={`Click to view line items for ${row.name}`}
                                  >
                                    <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1d4ed8" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span>{row.name}</span>
                                        {row.isFiltered && (
                                          <span style={{ fontSize: 10, background: "#ede9fe", color: "#6d28d9", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                                            Selected
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td style={{ padding: "8px 10px", color: "#475569" }}>{row.parentDiv}</td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(row.val / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#2563eb", fontVariantNumeric: "tabular-nums" }}>
                                      {row.pctTotal.toFixed(1)}%
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", color: "#334155", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(row.qty).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", color: "#16a34a", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(row.currentVal / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", color: "#ea580c", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(row.slowVal / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#e11d48", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round(row.obsVal / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: row.pctObs > 20 ? "#dc2626" : "#e11d48", fontVariantNumeric: "tabular-nums" }}>
                                      {row.pctObs.toFixed(1)}%
                                    </td>
                                    </tr>
                                ))
                              )}
                            </tbody>
                            {rows.length > 0 && (
                              <tfoot style={{ position: "sticky", bottom: 0, zIndex: 20, background: "#f8fafc" }}>
                                  <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                                    <td style={{ padding: "10px 10px", color: "#1e3a8a" }}>Total</td>
                                  <td style={{ padding: "10px 10px" }} />
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(sumVal / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>100.0%</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#334155", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(sumQty).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#16a34a", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(sumCurrent / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#ea580c", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(sumSlow / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#e11d48", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(sumObs / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#e11d48" }}>
                                    {(sumVal > 0 ? (sumObs / sumVal) * 100 : 0).toFixed(1)}%
                                  </td>
                                  <td style={{ padding: "10px 10px" }} />
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        );
                      })()}

                      {/* TAB 5: SLOW MOVING STOCK */}
                      {(modalActiveTab === "slowMoving" || (!["aging", "trend", "parentDivision", "subdivision", "momObsolete", "mom", "details"].includes(modalActiveTab) && slowMovingViewMode === "stock")) && (() => {
                        const rawList = (viewAllData && viewAllData.length > 0) ? viewAllData : ((mockData.allSlowMoving && mockData.allSlowMoving.length > 0) ? mockData.allSlowMoving : (mockData.slowMoving || []));
                        
                        const filtered = rawList.filter(item => {
                          const name = (item.parent_division_name || item.parent_division || item.parentDiv || item.name || item.desc || "").trim();
                          if (viewAllSearch && !name.toLowerCase().includes(viewAllSearch.toLowerCase())) {
                            return false;
                          }
                          if (slowMovingFilteredStats.isFiltered) {
                            return Boolean(slowMovingFilteredStats.map[name]);
                          }
                          return true;
                        });

                        let totalQty = 0;
                        let totalVal = 0;
                        let totalStockVal = 0;
                        let totalObs = 0;

                        filtered.forEach(item => {
                          const divName = item.parent_division_name || item.parent_division || item.parentDiv || item.name || item.desc || "-";
                          const stats = slowMovingFilteredStats.isFiltered && slowMovingFilteredStats.map[divName]
                            ? slowMovingFilteredStats.map[divName]
                            : (divStats[divName] || {});

                          const itemQty = Number(item.total_quantity || item.quantity || item.qty || stats.qty || 0);
                          totalQty += itemQty;

                          const itemVal = Number(item.total_stock_value || item.inventory_value || item.total_value || stats.val || 0);
                          totalVal += itemVal;

                          const itemStock = Number(item.total_stock_value || item.total || stats.stockVal || itemVal || 0);
                          totalStockVal += itemStock;

                          const obs = Number(item.obsolete_stock || item.obsolete || item.value || stats.obs || 0);
                          totalObs += obs;
                        });

                        const totalPct = totalStockVal > 0 ? (totalObs / totalStockVal) * 100 : 0;

                        return (
                          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: "0.80rem" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, verticalAlign: "bottom", lineHeight: 1.25 }}>Parent<br />Division</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 120, verticalAlign: "bottom", lineHeight: 1.25 }}>Total<br />Quantity</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 140, verticalAlign: "bottom", lineHeight: 1.3 }}>Total Value<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 140, verticalAlign: "bottom", lineHeight: 1.3 }}>Total Stock Value<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 140, verticalAlign: "bottom", lineHeight: 1.3 }}>Obsolete Stock<br />({currencyHeader})</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 130, verticalAlign: "bottom", lineHeight: 1.25 }}>% Obsolete on<br />Total Stock</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No records found</td></tr>
                              ) : (
                                filtered.map((item, idx) => {
                                  const divName = item.parent_division_name || item.parent_division || item.parentDiv || item.name || item.desc || "-";
                                  
                                  const stats = slowMovingFilteredStats.isFiltered && slowMovingFilteredStats.map[divName]
                                    ? slowMovingFilteredStats.map[divName]
                                    : (divStats[divName] || {});

                                  const itemQty = Number(item.total_quantity || item.quantity || item.qty || stats.qty || 0);
                                  const itemVal = Number(item.total_stock_value || item.inventory_value || item.total_value || stats.val || 0);
                                  const itemStock = Number(item.total_stock_value || item.total || stats.stockVal || itemVal || 0);
                                  const obs = Number(item.obsolete_stock || item.obsolete || item.value || stats.obs || 0);

                                  const pct = item.obsolete_percentage !== undefined && item.obsolete_percentage !== null
                                    ? Number(item.obsolete_percentage)
                                    : (itemStock > 0 ? (obs / itemStock) * 100 : 0);

                                   return (
                                    <tr
                                      key={idx}
                                      style={{
                                        borderBottom: "1px solid #f1f5f9",
                                        background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                                      }}
                                      title={`Click to view line-item details for ${divName}`}
                                    >
                                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1d4ed8" }}>{divName}</td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", color: "#334155", fontVariantNumeric: "tabular-nums" }}>{Math.round(itemQty).toLocaleString("en-US")}</td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1e293b" }}>{Math.round(itemVal / scale).toLocaleString("en-US")}</td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#2563eb" }}>{Math.round(itemStock / scale).toLocaleString("en-US")}</td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#e11d48" }}>{Math.round(obs / scale).toLocaleString("en-US")}</td>
                                      <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: pct > 50 ? "#dc2626" : "#e11d48" }}>{Math.round(pct)}%</td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                            {filtered.length > 0 && (
                              <tfoot style={{ position: "sticky", bottom: 0, zIndex: 20, background: "#f8fafc" }}>
                                  <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0", fontWeight: 800 }}>
                                    <td style={{ padding: "10px 10px", color: "#1e3a8a" }}>Total</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#334155" }}>{Math.round(totalQty).toLocaleString("en-US")}</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#1e293b" }}>{Math.round(totalVal / scale).toLocaleString("en-US")}</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#2563eb" }}>{Math.round(totalStockVal / scale).toLocaleString("en-US")}</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: "#e11d48" }}>{Math.round(totalObs / scale).toLocaleString("en-US")}</td>
                                  <td style={{ padding: "10px 10px", textAlign: "right", color: totalPct > 50 ? "#dc2626" : "#e11d48" }}>{Math.round(totalPct)}%</td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        );
                      })()}

                      {/* TAB 6: MONTH-ON-MONTH OBSOLETE STOCK POSITION */}
                      {(modalActiveTab === "momObsolete" || modalActiveTab === "mom" || (!["aging", "trend", "parentDivision", "subdivision", "slowMoving", "details"].includes(modalActiveTab) && slowMovingViewMode === "mom")) && (() => {
                        const allMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                        const asOfDateStr = (appliedFilters.asOnDate && appliedFilters.asOnDate !== "All") ? appliedFilters.asOnDate : (mockData.dataAsOf || "2026-09-25");
                        const asOfObj = new Date(asOfDateStr);
                        const curMonthIdx = !isNaN(asOfObj.getTime()) ? asOfObj.getMonth() : 8; // September default
                        const curMonthKey = allMonths[curMonthIdx] || "SEP";
                        const prevMonthIdx = (curMonthIdx + 11) % 12;
                        const prevMonthKey = allMonths[prevMonthIdx] || "AUG";

                        const sourceParentDivs = (mockData.allDivisions && mockData.allDivisions.length > 0)
                          ? mockData.allDivisions
                          : ((mockData.divisions && mockData.divisions.length > 0)
                            ? mockData.divisions
                            : ((mockData.parentDivisions && mockData.parentDivisions.length > 0)
                              ? mockData.parentDivisions
                              : ((mockData.filters?.parentDivisions && mockData.filters.parentDivisions.filter(d => d.value !== "All").length > 0)
                                ? mockData.filters.parentDivisions.filter(d => d.value !== "All").map(d => ({ name: d.label || d.value, parent_division_name: d.label || d.value, parent_division_id: d.value }))
                                : Object.keys(divStats).map(name => ({ name, parent_division_name: name })))));

                        const momSource = (momData && momData.length > 0) ? momData : (viewAllData && viewAllData.length > 0 ? viewAllData : sourceParentDivs);
                        
                        const momRows = momSource.filter(item => {
                          const name = item.desc || item.name || item.parent_division_name || "";
                          const divId = item.parent_division_id || item.id || name;

                          if (viewAllSearch && !name.toLowerCase().includes(viewAllSearch.toLowerCase())) {
                            return false;
                          }

                          const targetPd = viewAllDetailFilters?.parent_division_id;
                          if (targetPd) {
                            const t = String(targetPd).trim().toLowerCase();
                            const dName = String(name).trim().toLowerCase();
                            const dId = String(divId).trim().toLowerCase();
                            if (dId !== t && !dName.includes(t) && !t.includes(dName)) return false;
                          }

                          const effectivePD = (!modalDetailsFilters?.parentDivision || modalDetailsFilters.parentDivision.includes("All"))
                            ? filters?.parentDivision
                            : modalDetailsFilters.parentDivision;
                          if (effectivePD && effectivePD.length > 0 && !effectivePD.includes("All")) {
                            const dName = String(name).trim().toLowerCase();
                            const dId = String(divId).trim().toLowerCase();
                            const matches = effectivePD.some(v => {
                              const t = String(v).trim().toLowerCase();
                              return t === dName || t === dId || dName.includes(t) || t.includes(dName);
                            });
                            if (!matches) return false;
                          }

                          return true;
                        }).map((item, idx) => {
                          const name = item.desc || item.name || item.parent_division_name || "-";
                          const divId = item.parent_division_id || item.id || name;
                          
                          const curObs = Number(item.latest_value ?? item.latest ?? item.current_value ?? item.obsolete_stock ?? item.total_stock_value ?? item.value ?? 0);
                          const prevObs = Number(item.previous_value ?? item.previous ?? item.previous_obsolete_stock ?? 0);
                          
                          const variance = Number(item.variance ?? (curObs - prevObs));
                          const variancePct = Number(item.variance_percentage ?? (prevObs > 0 ? ((curObs - prevObs) / prevObs) * 100 : 0));

                          // DIAGNOSTIC: log the first item's monthly_values to understand API format
                          if (idx === 0 && item.monthly_values) {
                            if (Array.isArray(item.monthly_values)) {
                            } else {
                            }
                          }
                          // Month abbreviation mapping
                          const MONTH_NUM_MAP = {1:"JAN",2:"FEB",3:"MAR",4:"APR",5:"MAY",6:"JUN",7:"JUL",8:"AUG",9:"SEP",10:"OCT",11:"NOV",12:"DEC"};
                          const MONTH_NAME_MAP = { JAN:1, FEB:2, MAR:3, APR:4, MAY:5, JUN:6, JUL:7, AUG:8, SEP:9, OCT:10, NOV:11, DEC:12 };
                          const MONTH_ABBREV_MAP = { JANUARY:"JAN",FEBRUARY:"FEB",MARCH:"MAR",APRIL:"APR",MAY:"MAY",JUNE:"JUN",JULY:"JUL",AUGUST:"AUG",SEPTEMBER:"SEP",OCTOBER:"OCT",NOVEMBER:"NOV",DECEMBER:"DEC" };

                          const monthlyVals = {};
                          if (item.monthly_values && typeof item.monthly_values === 'object') {
                            if (Array.isArray(item.monthly_values)) {
                              // Pre-index: extract month number from every possible key format
                              const mvLookup = {};
                              item.monthly_values.forEach(x => {
                                let abbr = null;
                                // PRIMARY: month_start date string "2026-01-01" → month 1 → "JAN"
                                if (x.month_start) {
                                  const mo = parseInt(String(x.month_start).split('-')[1], 10);
                                  if (mo >= 1 && mo <= 12) abbr = MONTH_NUM_MAP[mo];
                                }
                                // as_on_date date string "2026-01-31" → month 1 → "JAN"
                                else if (x.as_on_date) {
                                  const mo = parseInt(String(x.as_on_date).split('-')[1], 10);
                                  if (mo >= 1 && mo <= 12) abbr = MONTH_NUM_MAP[mo];
                                }
                                // Numeric month field
                                else if (x.month != null && !isNaN(Number(x.month))) {
                                  abbr = MONTH_NUM_MAP[Number(x.month)];
                                }
                                // Full month name
                                else if (x.month_name) {
                                  abbr = MONTH_ABBREV_MAP[x.month_name.toUpperCase()] || x.month_name.toUpperCase().slice(0,3);
                                }
                                // 3-letter abbreviation
                                else if (x.month && isNaN(Number(x.month))) {
                                  abbr = String(x.month).toUpperCase().slice(0,3);
                                }
                                else if (x.name) {
                                  abbr = MONTH_ABBREV_MAP[String(x.name).toUpperCase()] || String(x.name).toUpperCase().slice(0,3);
                                }
                                if (abbr && MONTH_NAME_MAP[abbr]) mvLookup[abbr] = x;
                              });
                              allMonths.forEach((m) => {
                                const mv = mvLookup[m];
                                monthlyVals[m] = mv ? Number(mv.value ?? mv.inventory_value ?? mv.obsolete_stock ?? mv.amount ?? mv.total_inventory ?? mv.slow_moving ?? 0) : 0;
                              });
                            } else {
                              // Object key lookup
                              allMonths.forEach((m) => {
                                const numKey = MONTH_NAME_MAP[m];
                                monthlyVals[m] = Number(
                                  item.monthly_values[m] ||
                                  item.monthly_values[m.toLowerCase()] ||
                                  item.monthly_values[numKey] ||
                                  item.monthly_values[String(numKey)] ||
                                  item.monthly_values[m.charAt(0) + m.slice(1).toLowerCase()] ||
                                  0
                                );
                              });
                            }
                          } else {
                            allMonths.forEach((m) => {
                              if (m === curMonthKey) monthlyVals[m] = curObs;
                              else if (m === prevMonthKey) monthlyVals[m] = prevObs;
                              else monthlyVals[m] = 0;
                            });
                          }

                          return {
                            srNo: idx + 1,
                            name,
                            divId,
                            monthlyVals,
                            latest: curObs,
                            prevMonth: prevObs,
                            variance,
                            variancePct,
                          };
                        });

                        const monthTotals = {};
                        allMonths.forEach(m => {
                          monthTotals[m] = momRows.reduce((sum, r) => sum + (r.monthlyVals[m] || 0), 0);
                        });
                        const totalLatest = momRows.reduce((sum, r) => sum + (r.latest || 0), 0);
                        const totalPrev = momRows.reduce((sum, r) => sum + (r.prevMonth || 0), 0);
                        const totalVariance = totalLatest - totalPrev;
                        const totalVariancePct = totalPrev > 0 ? ((totalLatest - totalPrev) / totalPrev) * 100 : 0;

                        return (
                          <>
                          <table style={{ width: "100%", minWidth: 1250, borderCollapse: "separate", borderSpacing: 0, marginTop: 8, fontSize: "0.80rem" }}>
                            <thead style={{ position: "sticky", top: 0, zIndex: 30, background: "#f8fafc" }}>
                              <tr style={{ borderBottom: "2px solid #cbd5e1" }}>
                                <th style={{ position: "sticky", left: 0, zIndex: 32, background: "#f8fafc", padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: "auto", minWidth: 140, borderRight: "2px solid #cbd5e1", verticalAlign: "bottom", lineHeight: 1.25 }}>Parent<br />Division <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>({momRows.length})</span></th>
                                {allMonths.map(m => (
                                  <th key={m} style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 68, minWidth: 60, verticalAlign: "bottom", background: "#f8fafc" }}>{m}</th>
                                ))}
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 95, minWidth: 85, verticalAlign: "bottom", background: "#f1f5f9", borderLeft: "2px solid #cbd5e1" }}>LATEST</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 95, minWidth: 85, verticalAlign: "bottom", background: "#f1f5f9" }}>PREVIOUS<br />MONTH</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 95, minWidth: 85, verticalAlign: "bottom", background: "#f1f5f9" }}>VARIANCE</th>
                                <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 85, minWidth: 75, verticalAlign: "bottom", background: "#f1f5f9" }}>VARIANCE<br />%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {momRows.length === 0 ? (
                                <tr><td colSpan={18} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No records found</td></tr>
                              ) : (
                                momRows.map((row, idx) => (
                                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                    <td
                                      style={{ position: "sticky", left: 0, zIndex: 10, background: idx % 2 === 0 ? "#fff" : "#fafbfc", padding: "7px 10px", fontWeight: 600, color: "#1d4ed8", borderRight: "2px solid #cbd5e1", whiteSpace: "nowrap" }}
                                      title={`${row.name}`}
                                    >
                                      {row.name}
                                    </td>
                                    {allMonths.map(m => (
                                      <td
                                        key={m}
                                        style={{ padding: "7px 6px", textAlign: "right", color: "#1d4ed8", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
                                        title={`Obsolete details for ${row.name} - ${m}`}
                                      >
                                        {Math.round((row.monthlyVals[m] || 0) / scale).toLocaleString("en-US")}
                                      </td>
                                    ))}
                                    <td
                                      style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700, color: "#1d4ed8", background: "#f8fafc", borderLeft: "2px solid #cbd5e1", fontVariantNumeric: "tabular-nums" }}
                                      title={`Latest obsolete details for ${row.name}`}
                                    >
                                      {Math.round(row.latest / scale).toLocaleString("en-US")}
                                    </td>
                                    <td
                                      style={{ padding: "7px 10px", textAlign: "right", color: "#1d4ed8", background: "#f8fafc", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
                                      title={`Previous month obsolete details for ${row.name}`}
                                    >
                                      {Math.round(row.prevMonth / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700, background: "#f8fafc", color: row.variance < 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                                      {row.variance > 0 ? "+" : ""}{Math.round(row.variance / scale).toLocaleString("en-US")}
                                    </td>
                                    <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700, background: "#f8fafc", color: row.variancePct < 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                                      {row.variancePct > 0 ? "+" : ""}{Math.round(row.variancePct)}%
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                            {momRows.length > 0 && (
                              <tfoot style={{ position: "sticky", bottom: 0, zIndex: 30, background: "#f1f5f9" }}>
                                <tr style={{ fontWeight: 800, borderTop: "2px solid #cbd5e1", background: "#f1f5f9", boxShadow: "0 -2px 6px rgba(0,0,0,0.06)" }}>
                                  <td style={{ position: "sticky", left: 0, zIndex: 32, background: "#f1f5f9", padding: "9px 10px", color: "#1e3a8a", fontWeight: 800, borderRight: "2px solid #cbd5e1" }}>Total</td>
                                  {allMonths.map(m => (
                                    <td key={m} style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", fontVariantNumeric: "tabular-nums" }}>
                                      {Math.round((monthTotals[m] || 0) / scale).toLocaleString("en-US")}
                                    </td>
                                  ))}
                                  <td style={{ padding: "9px 10px", textAlign: "right", color: "#1e293b", background: "#e2e8f0", borderLeft: "2px solid #cbd5e1", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(totalLatest / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "9px 10px", textAlign: "right", color: "#475569", background: "#e2e8f0", fontVariantNumeric: "tabular-nums" }}>
                                    {Math.round(totalPrev / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "9px 10px", textAlign: "right", color: totalVariance < 0 ? "#16a34a" : "#dc2626", background: "#e2e8f0", fontVariantNumeric: "tabular-nums" }}>
                                    {totalVariance > 0 ? "+" : ""}{Math.round(totalVariance / scale).toLocaleString("en-US")}
                                  </td>
                                  <td style={{ padding: "9px 10px", textAlign: "right", color: totalVariancePct < 0 ? "#16a34a" : "#dc2626", background: "#e2e8f0", fontVariantNumeric: "tabular-nums" }}>
                                    {totalVariancePct > 0 ? "+" : ""}{Math.round(totalVariancePct)}%
                                  </td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                          </>
                        );
                      })()}

                      {/* TAB 7: LINE-ITEM DETAILS (IMAGE 1 TABLE) */}
                      {(modalActiveTab === "details" || (!["aging", "trend", "parentDivision", "subdivision", "slowMoving", "momObsolete", "mom"].includes(modalActiveTab) && slowMovingViewMode === "details")) && (() => {
                        const formatDetailVal = (val) => {
                          if (val === null || val === undefined || val === "" || isNaN(val)) return "0";
                          const num = Number(val);
                          return Math.round(num / scale).toLocaleString("en-US");
                        };

                        return (
                          <div style={{ width: "100%", overflowX: "auto" }}>
                            <table style={{ width: "100%", minWidth: 1400, borderCollapse: "separate", borderSpacing: 0, marginTop: 8, fontSize: "0.78rem" }}>
                              <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#f8fafc" }}>
                                <tr style={{ borderBottom: "2px solid #cbd5e1" }}>
                                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: "auto", minWidth: 110, maxWidth: 140, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Legal<br />Entity</th>
                                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: "auto", minWidth: 110, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Parent<br />Division</th>
                                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: "auto", minWidth: 110, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Sub-<br />Division</th>
                                  <th style={{ padding: "8px 8px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 90, minWidth: 80, verticalAlign: "bottom", lineHeight: 1.2, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>SUB-INV<br />Code</th>
                                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 110, minWidth: 95, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Item<br />Code</th>
                                  <th style={{ padding: "8px 10px", textAlign: "left", color: "#1e3a8a", fontWeight: 700, width: 220, minWidth: 180, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Item<br />Description</th>
                                  <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 75, minWidth: 65, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Qty<br />(Nos)</th>
                                  <th style={{ padding: "8px 10px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 125, minWidth: 110, verticalAlign: "bottom", lineHeight: 1.25, background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Total Stock<br />Value ({currencyHeader})</th>
                                  <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 75, minWidth: 65, verticalAlign: "bottom", background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>0-30<br />Days</th>
                                  <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 75, minWidth: 65, verticalAlign: "bottom", background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>31-60<br />Days</th>
                                  <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 75, minWidth: 65, verticalAlign: "bottom", background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>61-90<br />Days</th>
                                  <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 75, minWidth: 65, verticalAlign: "bottom", background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>91-120<br />Days</th>
                                  <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 80, minWidth: 70, verticalAlign: "bottom", background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>121-180<br />Days</th>
                                  <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 80, minWidth: 70, verticalAlign: "bottom", background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>181-365<br />Days</th>
                                  <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 85, minWidth: 75, verticalAlign: "bottom", background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>366-730<br />Days</th>
                                  <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 85, minWidth: 75, verticalAlign: "bottom", background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Above 730<br />Days</th>
                                  <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 80, minWidth: 70, verticalAlign: "bottom", background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Holding<br />Days</th>
                                  <th style={{ padding: "8px 6px", textAlign: "right", color: "#1e3a8a", fontWeight: 700, width: 100, minWidth: 85, verticalAlign: "bottom", background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>Avg. Inv.<br />Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {modalPaginatedDetails.length === 0 ? (
                                  <tr><td colSpan={18} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No inventory records found</td></tr>
                                ) : (
                                  modalPaginatedDetails.map((row, idx) => (
                                    <tr key={row.id || idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbfc" }}>
                                      <td style={{ padding: "7px 10px", fontWeight: 600, color: "#1e293b", width: 130, minWidth: 110, maxWidth: 140, whiteSpace: "normal", wordBreak: "break-word" }}>{row.legal_entity}</td>
                                      <td style={{ padding: "7px 10px", color: "#334155", width: 130, minWidth: 110, whiteSpace: "normal", wordBreak: "break-word" }}>{row.parent_division}</td>
                                      <td style={{ padding: "7px 10px", color: "#334155", width: 130, minWidth: 110, whiteSpace: "normal", wordBreak: "break-word" }}>{row.subdivision}</td>
                                      <td style={{ padding: "7px 8px", color: "#475569", width: 90, minWidth: 80, whiteSpace: "nowrap" }}>{row.subinventory}</td>
                                      <td style={{ padding: "7px 10px", color: "#1e3a8a", fontWeight: 600, width: 110, minWidth: 95, whiteSpace: "normal", wordBreak: "break-word" }}>{row.item_code}</td>
                                      <td style={{ padding: "7px 10px", color: "#334155", width: 220, minWidth: 180, whiteSpace: "normal", wordBreak: "break-word" }}>{row.item_description}</td>
                                      <td style={{ padding: "7px 10px", textAlign: "right", color: "#334155", fontVariantNumeric: "tabular-nums" }}>{row.quantity ? Number(row.quantity).toLocaleString() : "0"}</td>
                                      <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{formatDetailVal(row.total_stock_value)}</td>
                                      <td style={{ padding: "7px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatDetailVal(row.aging_0_30)}</td>
                                      <td style={{ padding: "7px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatDetailVal(row.aging_31_60)}</td>
                                      <td style={{ padding: "7px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatDetailVal(row.aging_61_90)}</td>
                                      <td style={{ padding: "7px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatDetailVal(row.aging_91_120)}</td>
                                      <td style={{ padding: "7px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatDetailVal(row.aging_121_180)}</td>
                                      <td style={{ padding: "7px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatDetailVal(row.aging_181_365)}</td>
                                      <td style={{ padding: "7px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatDetailVal(row.aging_366_730)}</td>
                                      <td style={{ padding: "7px 6px", textAlign: "right", color: "#e11d48", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatDetailVal(row.aging_above_730)}</td>
                                      <td style={{ padding: "7px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{row.days || "-"}</td>
                                      <td style={{ padding: "7px 6px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatDetailVal(row.avg_inv_value)}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                              {modalFilteredDetails.length > 0 && (() => {
                                const totals = modalFilteredDetails.reduce((acc, row) => {
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
                                  <tfoot style={{ position: "sticky", bottom: 0, zIndex: 10, background: "#f8fafc" }}>
                                    <tr style={{ fontWeight: 800, borderTop: "2px solid #cbd5e1", background: "#f8fafc", boxShadow: "0 -2px 6px rgba(0,0,0,0.06)" }}>
                                      <td colSpan={6} style={{ padding: "9px 10px", color: "#1e3a8a", background: "#f8fafc" }}>Total ({modalFilteredDetails.length} items)</td>
                                      <td style={{ padding: "9px 10px", textAlign: "right", color: "#1e3a8a", background: "#f8fafc" }}>{Math.round(totals.qty).toLocaleString("en-US")}</td>
                                      <td style={{ padding: "9px 10px", textAlign: "right", color: "#1e293b", background: "#f8fafc" }}>{formatDetailVal(totals.totalVal)}</td>
                                      <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc" }}>{formatDetailVal(totals.d30)}</td>
                                      <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc" }}>{formatDetailVal(totals.d60)}</td>
                                      <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc" }}>{formatDetailVal(totals.d90)}</td>
                                      <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc" }}>{formatDetailVal(totals.d120)}</td>
                                      <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc" }}>{formatDetailVal(totals.d180)}</td>
                                      <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc" }}>{formatDetailVal(totals.d365)}</td>
                                      <td style={{ padding: "9px 6px", textAlign: "right", color: "#1e293b", background: "#f8fafc" }}>{formatDetailVal(totals.d730)}</td>
                                      <td style={{ padding: "9px 6px", textAlign: "right", color: "#e11d48", fontWeight: 800, background: "#f8fafc" }}>{formatDetailVal(totals.dAbove730)}</td>
                                      <td style={{ padding: "9px 6px" }} />
                                      <td style={{ padding: "9px 6px" }} />
                                    </tr>
                                  </tfoot>
                                );
                              })()}
                            </table>

                            {/* Pagination */}
                            <div style={{
                              padding: "10px 14px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              background: "#f8fafc",
                              borderTop: "1px solid #e2e8f0",
                              fontSize: "0.75rem",
                              color: "#64748b",
                              flexWrap: "wrap",
                              gap: 8,
                            }}>
                              <div>
                                {modalFilteredDetails.length > 0
                                  ? `Showing ${safeModalPage * modalDetailPageSize + 1} to ${Math.min((safeModalPage + 1) * modalDetailPageSize, modalFilteredDetails.length)} of ${modalFilteredDetails.length} entries`
                                  : "No records"}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                  <span>Rows per page:</span>
                                  <select
                                    value={modalDetailPageSize}
                                    onChange={(e) => {
                                      setModalDetailPageSize(Number(e.target.value));
                                      setModalDetailPage(0);
                                    }}
                                    style={{
                                      padding: "3px 6px",
                                      borderRadius: 5,
                                      border: "1px solid #cbd5e1",
                                      fontSize: "0.75rem",
                                      color: "#334155",
                                      outline: "none",
                                    }}
                                  >
                                    {[10, 15, 20, 50, 100].map(sz => (
                                      <option key={sz} value={sz}>{sz}</option>
                                    ))}
                                  </select>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <button
                                    type="button"
                                    disabled={safeModalPage === 0}
                                    onClick={() => setModalDetailPage(0)}
                                    style={{
                                      padding: "3px 8px",
                                      borderRadius: 4,
                                      border: "1px solid #cbd5e1",
                                      background: safeModalPage === 0 ? "#f1f5f9" : "#fff",
                                      color: safeModalPage === 0 ? "#94a3b8" : "#334155",
                                      cursor: safeModalPage === 0 ? "not-allowed" : "pointer",
                                      fontSize: "0.72rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    « First
                                  </button>
                                  <button
                                    type="button"
                                    disabled={safeModalPage === 0}
                                    onClick={() => setModalDetailPage(p => Math.max(0, p - 1))}
                                    style={{
                                      padding: "3px 8px",
                                      borderRadius: 4,
                                      border: "1px solid #cbd5e1",
                                      background: safeModalPage === 0 ? "#f1f5f9" : "#fff",
                                      color: safeModalPage === 0 ? "#94a3b8" : "#334155",
                                      cursor: safeModalPage === 0 ? "not-allowed" : "pointer",
                                      fontSize: "0.72rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    ‹ Prev
                                  </button>
                                  <span style={{ margin: "0 6px", fontWeight: 600, color: "#1e293b" }}>
                                    Page {modalFilteredDetails.length > 0 ? safeModalPage + 1 : 0} of {modalTotalPages}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={safeModalPage >= modalTotalPages - 1}
                                    onClick={() => setModalDetailPage(p => Math.min(modalTotalPages - 1, p + 1))}
                                    style={{
                                      padding: "3px 8px",
                                      borderRadius: 4,
                                      border: "1px solid #cbd5e1",
                                      background: safeModalPage >= modalTotalPages - 1 ? "#f1f5f9" : "#fff",
                                      color: safeModalPage >= modalTotalPages - 1 ? "#94a3b8" : "#334155",
                                      cursor: safeModalPage >= modalTotalPages - 1 ? "not-allowed" : "pointer",
                                      fontSize: "0.72rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Next ›
                                  </button>
                                  <button
                                    type="button"
                                    disabled={safeModalPage >= modalTotalPages - 1}
                                    onClick={() => setModalDetailPage(modalTotalPages - 1)}
                                    style={{
                                      padding: "3px 8px",
                                      borderRadius: 4,
                                      border: "1px solid #cbd5e1",
                                      background: safeModalPage >= modalTotalPages - 1 ? "#f1f5f9" : "#fff",
                                      color: safeModalPage >= modalTotalPages - 1 ? "#94a3b8" : "#334155",
                                      cursor: safeModalPage >= modalTotalPages - 1 ? "not-allowed" : "pointer",
                                      fontSize: "0.72rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Last »
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
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
    minHeight: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flex: 1,
    padding: "0 14px 10px 14px",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  donutWrapper: {
    width: 144,
    height: 144,
    flex: "0 0 144px",
  },

  legendList: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },

  legendListRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    padding: "3.5px 0",
    borderBottom: "1px solid #f8fafc",
    fontSize: "0.72rem",
    minWidth: 0,
  },

  legendName: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#334155",
    fontWeight: 500,
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },

  legendCircle: {
    width: 8,
    height: 8,
    minWidth: 8,
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },

  legendValue: {
    color: "#1e293b",
    fontWeight: 600,
    whiteSpace: "nowrap",
    flexShrink: 0,
    marginLeft: 6,
  },

  agingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    flex: 1,
    height: "100%",
    padding: "0 14px 10px 14px",
    boxSizing: "border-box",
    overflow: "hidden",
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
    gridTemplateColumns: "minmax(85px, 1fr) minmax(75px, auto) 40px",
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
    gridTemplateColumns: "minmax(85px, 1fr) minmax(75px, auto) 40px",
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
    gridTemplateColumns: "minmax(85px, 1fr) minmax(75px, auto) 40px",
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
    overflowY: "auto",
      maxHeight: "65vh",
    paddingBottom: 6,
    scrollbarWidth: "auto",
    scrollbarColor: "#64748b #e2e8f0",
  },

  detailTable: {
    width: "100%",
    minWidth: 1850,
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

    /* Sticky column header on vertical scroll for all modal tables */
    .modal-table-scroll table thead th {
      position: sticky !important;
      top: 0 !important;
      z-index: 20;
      background: #f8fafc !important;
    }

    /* Enhanced, Thick Horizontal Scrollbar matching BalanceSheet and SalesRevenue */
        *::-webkit-scrollbar {
      height: 8px !important;
      width: 8px !important;
    }

        *::-webkit-scrollbar-track {
      background: #e2e8f0 !important;
      border-radius: 6px !important;
    }

        *::-webkit-scrollbar-thumb {
      background: #64748b !important;
      border-radius: 6px !important;
      border: 3px solid #e2e8f0 !important;
    }

        *::-webkit-scrollbar-thumb:hover {
      background: #334155 !important;
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

    @keyframes drawLine {
      from { stroke-dashoffset: 1; }
      to { stroke-dashoffset: 0; }
    }
    
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    @keyframes pointFadeScale {
      from { opacity: 0; transform: scale(0); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes crosshairFadeIn {
      from { opacity: 0; }
      to { opacity: 0.6; }
    }
    @keyframes plTooltipFadeScale {
      from { opacity: 0; transform: scale(0.96) translateY(4px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    
    @keyframes pointFadeScale {
      from { opacity: 0; transform: scale(0.1); }
      to { opacity: 1; transform: scale(1); }
    }

    @media (max-width: 1200px) {
      .inventory-page {
        overflow-x: auto;
      }
    }
  `;

  document.head.appendChild(style);
}





