import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    BarChart3, RefreshCw, Building, Landmark, Layers, MoreVertical, Info
} from 'lucide-react';
import { fetchPLStatement } from '../services/plApi';
import { getExecKpis, getExecTwcTrend } from '../api/executiveDashboardApi';
import { getFinancialPositionKpis } from '../api/financialPositionApi';
import MultiSelectDropdown from './Filters/MultiSelectDropdown';

const MONTHS_LIST = [
    { num: '01', code: 'Jan', label: 'Jan' },
    { num: '02', code: 'Feb', label: 'Feb' },
    { num: '03', code: 'Mar', label: 'Mar' },
    { num: '04', code: 'Apr', label: 'Apr' },
    { num: '05', code: 'May', label: 'May' },
    { num: '06', code: 'Jun', label: 'Jun' },
    { num: '07', code: 'Jul', label: 'Jul' },
    { num: '08', code: 'Aug', label: 'Aug' },
    { num: '09', code: 'Sep', label: 'Sep' },
    { num: '10', code: 'Oct', label: 'Oct' },
    { num: '11', code: 'Nov', label: 'Nov' },
    { num: '12', code: 'Dec', label: 'Dec' },
];

function parseNum(val) {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
}

function formatValue(val, isDays, unitMode, isPct) {
    const n = parseNum(val);
    if (n === null) return '—';
    if (isPct) {
        // Percentage rows — display as "XX.X%"
        if (n < 0) return `(${Math.abs(n).toFixed(1)}%)`;
        return `${n.toFixed(1)}%`;
    }
    if (isDays) {
        // Ratios (DSO, DIO, DPO, CCC) always stay in Days
        return n.toFixed(1);
    }
    if (unitMode === 'aed') {
        const rounded = Math.round(n);
        if (rounded < 0) return `(${Math.abs(rounded).toLocaleString('en-US')})`;
        return rounded.toLocaleString('en-US');
    }
    // Default 'millions'
    const m = n / 1_000_000;
    if (m < 0) return `(${Math.abs(m).toFixed(1)})`;
    return m.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatM(val) {
    const n = parseNum(val);
    if (n === null) return '—';
    const m = n / 1_000_000;
    if (m < 0) return `(${Math.abs(m).toFixed(1)})`;
    return m.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatDays(val) {
    const n = parseNum(val);
    if (n === null) return '—';
    return n.toFixed(1);
}

function calcVar(actual, compare) {
    const a = parseNum(actual);
    const c = parseNum(compare);
    if (a === null || c === null) return { diff: null, pct: null };
    const diff = a - c;
    const pct = (c !== null && c !== 0) ? (diff / Math.abs(c)) * 100 : null;
    return { diff, pct };
}

function resolveSelectedIds(selectedVals, optionsList = []) {
    if (!selectedVals) return null;
    const arr = Array.isArray(selectedVals) ? selectedVals : [selectedVals];
    if (arr.length === 0) return null;
    if (arr.length === 1 && String(arr[0]).trim().toLowerCase() === 'all') return null;

    const cleanArr = arr.filter(v => v !== null && v !== undefined && String(v).trim().toLowerCase() !== 'all');
    if (cleanArr.length === 0) return null;

    const ids = [];
    cleanArr.forEach(val => {
        const strVal = String(val).toLowerCase();
        const matched = (optionsList || []).find(opt => {
            if (opt === null || opt === undefined) return false;
            if (typeof opt === 'object') {
                const optId = String(opt.id ?? opt.value ?? '').toLowerCase();
                const optName = String(opt.name ?? opt.label ?? '').toLowerCase();
                return optId === strVal || optName === strVal;
            }
            return String(opt).toLowerCase() === strVal;
        });

        if (matched && typeof matched === 'object') {
            const canonicalId = matched.id !== undefined ? matched.id : matched.value;
            ids.push(canonicalId !== undefined ? String(canonicalId) : String(val));
        } else {
            ids.push(String(val));
        }
    });

    const uniqueIds = Array.from(new Set(ids));
    return uniqueIds.length > 0 ? uniqueIds : null;
}

export default function KeyFinancialParameters({
    filterOptions = {},
    initialFilters = {},
    currency = 'AED',
    parentTwcTrend = [],
    parentKpis = {},
}) {
    // 1. PTD vs YTD toggle (default YTD as in reference design)
    const [periodType, setPeriodType] = useState('YTD');

    // Tab state: 'revenue' | 'working_capital' | 'financials'
    const [activeTab, setActiveTab] = useState('revenue');

    // Unit toggle: 'millions' | 'aed' (default 'millions')
    const [displayUnit, setDisplayUnit] = useState('millions');

    // 2. Local filter dropdown states below PTD/YTD toggle (multi-select for hierarchy)
    const [selectedLegalGroup, setSelectedLegalGroup] = useState(() => {
        if (initialFilters.legal_group_id && initialFilters.legal_group_id.length) {
            return Array.isArray(initialFilters.legal_group_id) ? initialFilters.legal_group_id : [initialFilters.legal_group_id];
        }
        return ['All'];
    });
    const [selectedLegalEntity, setSelectedLegalEntity] = useState(() => {
        if (initialFilters.legal_entity_id && initialFilters.legal_entity_id.length) {
            return Array.isArray(initialFilters.legal_entity_id) ? initialFilters.legal_entity_id : [initialFilters.legal_entity_id];
        }
        return ['All'];
    });
    const [selectedParentDivision, setSelectedParentDivision] = useState(() => {
        if (initialFilters.parent_division_id && initialFilters.parent_division_id.length) {
            return Array.isArray(initialFilters.parent_division_id) ? initialFilters.parent_division_id : [initialFilters.parent_division_id];
        }
        return ['All'];
    });
    const [selectedSubdivision, setSelectedSubdivision] = useState(() => {
        if (initialFilters.subdivision_id && initialFilters.subdivision_id.length) {
            return Array.isArray(initialFilters.subdivision_id) ? initialFilters.subdivision_id : [initialFilters.subdivision_id];
        }
        return ['All'];
    });
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedMonth, setSelectedMonth] = useState('Sep 2026');

    // Cascading options for hierarchy dropdowns
    const filteredLegalEntities = useMemo(() => {
        const entities = filterOptions.legal_entities || [];
        const groupIds = resolveSelectedIds(selectedLegalGroup, filterOptions.legal_groups);
        if (!groupIds || groupIds.length === 0) return entities;

        return entities.filter(item => {
            if (typeof item !== 'object' || item === null) return true;
            const gId = item.legal_group_id ?? item.group_id ?? item.legalGroupId;
            if (gId === undefined || gId === null) return true;
            return groupIds.includes(String(gId));
        });
    }, [filterOptions.legal_entities, filterOptions.legal_groups, selectedLegalGroup]);

    const filteredParentDivisions = useMemo(() => {
        const divisions = filterOptions.parent_divisions || [];
        const entityIds = resolveSelectedIds(selectedLegalEntity, filteredLegalEntities);
        if (!entityIds || entityIds.length === 0) return divisions;

        return divisions.filter(item => {
            if (typeof item !== 'object' || item === null) return true;
            const eId = item.legal_entity_id ?? item.entity_id ?? item.legalEntityId;
            if (eId === undefined || eId === null) return true;
            return entityIds.includes(String(eId));
        });
    }, [filterOptions.parent_divisions, filteredLegalEntities, selectedLegalEntity]);

    const filteredSubdivisions = useMemo(() => {
        const subs = filterOptions.subdivisions || [];
        const divisionIds = resolveSelectedIds(selectedParentDivision, filteredParentDivisions);
        if (!divisionIds || divisionIds.length === 0) return subs;

        return subs.filter(item => {
            if (typeof item !== 'object' || item === null) return true;
            const dId = item.parent_division_id ?? item.division_id ?? item.parentDivisionId;
            if (dId === undefined || dId === null) return true;
            return divisionIds.includes(String(dId));
        });
    }, [filterOptions.subdivisions, filteredParentDivisions, selectedParentDivision]);

    // Data state
    const [loading, setLoading] = useState(true);
    const [plCurrentRows, setPlCurrentRows] = useState([]);
    const [plPrevRows, setPlPrevRows] = useState([]);
    const [plPyRows, setPlPyRows] = useState([]);
    const [twcTrendRows, setTwcTrendRows] = useState([]);
    const [kpisCurrent, setKpisCurrent] = useState(parentKpis || {});
    const [kpisPrev, setKpisPrev] = useState({});
    const [kpisPy, setKpisPy] = useState({});
    const [fpCurrent, setFpCurrent] = useState({});
    const [fpPrev, setFpPrev] = useState({});
    const [fpPy, setFpPy] = useState({});

    // Parse selected month & year into period dates
    const dateMeta = useMemo(() => {
        const parts = selectedMonth.split(' ');
        const monthCode = parts[0] || 'Sep';
        const yearStr = parts[1] || selectedYear || '2026';
        const mObj = MONTHS_LIST.find(m => m.code.toLowerCase() === monthCode.toLowerCase()) || { num: '09', code: 'Sep' };
        const mNum = parseInt(mObj.num, 10);
        const yNum = parseInt(yearStr, 10);

        // Current period
        const periodName = `${mObj.code}-${yearStr.slice(2)}`;
        const lastDay = new Date(yNum, mNum, 0).getDate();
        const asOfDate = `${yearStr}-${mObj.num}-${String(lastDay).padStart(2, '0')}`;

        // Previous month
        let prevMNum = mNum - 1;
        let prevYNum = yNum;
        if (prevMNum < 1) {
            prevMNum = 12;
            prevYNum = yNum - 1;
        }
        const prevMObj = MONTHS_LIST[prevMNum - 1];
        const prevPeriodName = `${prevMObj.code}-${String(prevYNum).slice(2)}`;
        const prevLastDay = new Date(prevYNum, prevMNum, 0).getDate();
        const prevAsOfDate = `${prevYNum}-${prevMObj.num}-${String(prevLastDay).padStart(2, '0')}`;
        const prevMonthLabel = `${prevMObj.code} ${prevYNum}`;

        // Previous year
        const pyYNum = yNum - 1;
        const pyPeriodName = `${mObj.code}-${String(pyYNum).slice(2)}`;
        const pyLastDay = new Date(pyYNum, mNum, 0).getDate();
        const pyAsOfDate = `${pyYNum}-${mObj.num}-${String(pyLastDay).padStart(2, '0')}`;
        const pyLabel = `YTD ${mObj.code} ${pyYNum}`;

        return {
            year: yearStr,
            monthCode: mObj.code,
            periodName,
            asOfDate,
            prevPeriodName,
            prevAsOfDate,
            prevMonthLabel,
            pyPeriodName,
            pyAsOfDate,
            pyLabel,
        };
    }, [selectedMonth, selectedYear]);

    // Hierarchy filter helper
    const getHierarchyFilterParams = () => {
        const params = {
            currency: currency || 'AED',
            reporting_currency: currency || 'AED',
        };

        const lgIds = resolveSelectedIds(selectedLegalGroup, filterOptions.legal_groups);
        if (lgIds && lgIds.length > 0) {
            params.legalGroupId = lgIds;
            params.legal_group_id = lgIds;
        }

        const leIds = resolveSelectedIds(selectedLegalEntity, filteredLegalEntities);
        if (leIds && leIds.length > 0) {
            params.legalEntityId = leIds;
            params.legal_entity_id = leIds;
        }

        const pdIds = resolveSelectedIds(selectedParentDivision, filteredParentDivisions);
        if (pdIds && pdIds.length > 0) {
            params.parentDivisionId = pdIds;
            params.parent_division_id = pdIds;
        }

        const sdIds = resolveSelectedIds(selectedSubdivision, filteredSubdivisions);
        if (sdIds && sdIds.length > 0) {
            params.subdivisionId = sdIds;
            params.subdivision_id = sdIds;
        }

        return params;
    };

    // Fetch data for all parameters when filters or period type change
    useEffect(() => {
        let active = true;
        setLoading(true);

        const hierarchy = getHierarchyFilterParams();

        const p1 = fetchPLStatement({
            year: dateMeta.year,
            period_name: dateMeta.periodName,
            periodName: dateMeta.periodName,
            ...hierarchy,
        }).catch(() => null);

        const p2 = fetchPLStatement({
            year: dateMeta.prevPeriodName.split('-')[1] ? `20${dateMeta.prevPeriodName.split('-')[1]}` : dateMeta.year,
            period_name: dateMeta.prevPeriodName,
            periodName: dateMeta.prevPeriodName,
            ...hierarchy,
        }).catch(() => null);

        const p3 = periodType === 'YTD'
            ? fetchPLStatement({
                year: String(parseInt(dateMeta.year, 10) - 1),
                period_name: dateMeta.pyPeriodName,
                periodName: dateMeta.pyPeriodName,
                ...hierarchy,
            }).catch(() => null)
            : Promise.resolve(null);

        const p7 = getExecTwcTrend({
            months: 14,
            ...hierarchy,
        }).catch(() => null);

        // Financial position / Balance sheet data is currently available starting from year 2026
        const isFpDateAvailable = (dStr) => {
            if (!dStr) return false;
            const yr = parseInt(String(dStr).slice(0, 4), 10);
            return yr >= 2026;
        };

        const p8 = isFpDateAvailable(dateMeta.asOfDate)
            ? getFinancialPositionKpis({
                calendar_date: dateMeta.asOfDate,
                currency: currency || 'AED',
                ...hierarchy,
            }).catch(() => null)
            : Promise.resolve(null);

        const p9 = isFpDateAvailable(dateMeta.prevAsOfDate)
            ? getFinancialPositionKpis({
                calendar_date: dateMeta.prevAsOfDate,
                currency: currency || 'AED',
                ...hierarchy,
            }).catch(() => null)
            : Promise.resolve(null);

        const p10 = (periodType === 'YTD' && isFpDateAvailable(dateMeta.pyAsOfDate))
            ? getFinancialPositionKpis({
                calendar_date: dateMeta.pyAsOfDate,
                currency: currency || 'AED',
                ...hierarchy,
            }).catch(() => null)
            : Promise.resolve(null);

        // Core financial statements and metrics
        Promise.all([p1, p2, p3, p7, p8, p9, p10])
            .then(([resPlCur, resPlPrev, resPlPy, resTwc, resFpCur, resFpPrev, resFpPy]) => {
                if (!active) return;

                setPlCurrentRows(Array.isArray(resPlCur) ? resPlCur : (resPlCur?.data || resPlCur?.rows || []));
                setPlPrevRows(Array.isArray(resPlPrev) ? resPlPrev : (resPlPrev?.data || resPlPrev?.rows || []));
                setPlPyRows(Array.isArray(resPlPy) ? resPlPy : (resPlPy?.data || resPlPy?.rows || []));

                const twcRows = resTwc?.data?.rows || resTwc?.rows || resTwc?.data || (Array.isArray(resTwc) ? resTwc : []);
                if (twcRows.length > 0) {
                    setTwcTrendRows(twcRows);
                }

                setFpCurrent(resFpCur?.data || resFpCur || {});
                setFpPrev(resFpPrev?.data || resFpPrev || {});
                setFpPy(resFpPy?.data || resFpPy || {});
                // Data loaded successfully
            })
            .catch(err => console.error('[KeyFinancialParameters] load error:', err))
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        // Background fetch for kpis fallback
        getExecKpis({ as_of_date: dateMeta.asOfDate, period_type: periodType, ...hierarchy })
            .then(res => { if (active && res) setKpisCurrent(res); })
            .catch(() => {});

        getExecKpis({ as_of_date: dateMeta.prevAsOfDate, period_type: periodType, ...hierarchy })
            .then(res => { if (active && res) setKpisPrev(res); })
            .catch(() => {});

        return () => { active = false; };
    }, [dateMeta, periodType, selectedLegalGroup, selectedLegalEntity, selectedParentDivision, selectedSubdivision, currency]);

    // Helper to find TWC trend row by period code (e.g. "2026-09" or "2026-08")
    const getTwcRowByMonth = (yearVal, monthCode) => {
        const mObj = MONTHS_LIST.find(m => m.code.toLowerCase() === monthCode.toLowerCase());
        if (!mObj || !Array.isArray(twcTrendRows) || !twcTrendRows.length) return null;
        const targetLabel = `${yearVal}-${mObj.num}`;
        const shortLabel = `${mObj.code} ${String(yearVal).slice(2)}`;
        return twcTrendRows.find(r => 
            r.month_label === targetLabel || 
            (String(r.year) === String(yearVal) && String(r.month) === String(parseInt(mObj.num, 10))) ||
            r.month === shortLabel ||
            (typeof r.month === 'string' && r.month.toLowerCase().includes(mObj.code.toLowerCase()))
        ) || null;
    };

    // Build the 22 rows dynamically
    const tableData = useMemo(() => {
        const isYtd = periodType === 'YTD';

        // 1. Profitability Helpers
        const findPl = (rows, matchStr) => {
            if (!Array.isArray(rows)) return null;
            return rows.find(r => {
                const p = String(r.particulars || r.name || r.label || '');
                return p.toLowerCase().includes(matchStr.toLowerCase()) && !p.includes('%');
            }) || null;
        };

        const getPlVals = (matchStr) => {
            const cur = findPl(plCurrentRows, matchStr);
            const prev = findPl(plPrevRows, matchStr);
            const py = findPl(plPyRows, matchStr);

            const targetVal = isYtd ? cur?.target_ytd : cur?.target_ptd;
            const actualVal = isYtd ? cur?.current_ytd : cur?.current_ptd;
            const prevVal = isYtd ? prev?.current_ytd : prev?.current_ptd;
            const pyVal = isYtd ? py?.current_ytd : null;

            return { targetVal, actualVal, prevVal, pyVal };
        };

        // 2. Working Capital Helpers
        const curTwcRow = getTwcRowByMonth(dateMeta.year, dateMeta.monthCode) || twcTrendRows[twcTrendRows.length - 1];
        const prevTwcParts = dateMeta.prevMonthLabel.split(' ');
        const prevTwcRow = getTwcRowByMonth(prevTwcParts[1], prevTwcParts[0]) || (twcTrendRows.length > 1 ? twcTrendRows[twcTrendRows.length - 2] : null);
        const pyTwcRow = isYtd ? getTwcRowByMonth(String(parseInt(dateMeta.year, 10) - 1), dateMeta.monthCode) : null;

        // 3. FP KPIs Helpers
        const fp = fpCurrent?.data || fpCurrent || {};
        const fpP = fpPrev?.data || fpPrev || {};
        const fpY = fpPy?.data || fpPy || {};

        const rows = [
            // ================= PROFITABILITY =================
            {
                id: 1,
                category: 'Profitability',
                param: 'Total Revenue',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: false,
                ...getPlVals('Total Revenue'),
            },
            {
                id: 2,
                category: 'Profitability',
                param: 'Cost of Material',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: true,
                ...getPlVals('Cost of Material'),
            },
            {
                id: 3,
                category: 'Profitability',
                param: 'Direct / Manufacturing Overhead',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: true,
                ...getPlVals('Manufacturing'),
            },
            {
                id: 4,
                category: 'Profitability',
                param: 'Overhead Absorption',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: false,
                ...getPlVals('Overhead Absorption'),
            },
            {
                id: 5,
                category: 'Profitability',
                param: 'Gross Profit',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: false,
                ...getPlVals('Gross Profit'),
            },
            {
                id: 5.1,
                category: 'Profitability',
                param: 'Gross Profit %',
                unit: '%',
                isDays: false,
                isPct: true,
                isLowerBetter: false,
                // GP% = (Gross Profit / Revenue) * 100
                actualVal: (() => {
                    const gp = getPlVals('Gross Profit');
                    const rv = getPlVals('Total Revenue');
                    const a = parseNum(gp.actualVal); const r = parseNum(rv.actualVal);
                    return (r && r !== 0) ? (a / r) * 100 : null;
                })(),
                targetVal: (() => {
                    const gp = getPlVals('Gross Profit');
                    const rv = getPlVals('Total Revenue');
                    const a = parseNum(gp.targetVal); const r = parseNum(rv.targetVal);
                    return (r && r !== 0) ? (a / r) * 100 : null;
                })(),
                prevVal: (() => {
                    const gp = getPlVals('Gross Profit');
                    const rv = getPlVals('Total Revenue');
                    const a = parseNum(gp.prevVal); const r = parseNum(rv.prevVal);
                    return (r && r !== 0) ? (a / r) * 100 : null;
                })(),
                pyVal: (() => {
                    const gp = getPlVals('Gross Profit');
                    const rv = getPlVals('Total Revenue');
                    const a = parseNum(gp.pyVal); const r = parseNum(rv.pyVal);
                    return (r && r !== 0) ? (a / r) * 100 : null;
                })(),
            },
            {
                id: 6,
                category: 'Profitability',
                param: 'Operating Expenses',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: true,
                ...getPlVals('Total Operating Expenses'),
            },
            {
                id: 7,
                category: 'Profitability',
                param: 'Net Profit',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: false,
                ...getPlVals('Net Profit'),
            },
            {
                id: 7.1,
                category: 'Profitability',
                param: 'Net Profit %',
                unit: '%',
                isDays: false,
                isPct: true,
                isLowerBetter: false,
                // NP% = (Net Profit / Revenue) * 100
                actualVal: (() => {
                    const np = getPlVals('Net Profit');
                    const rv = getPlVals('Total Revenue');
                    const a = parseNum(np.actualVal); const r = parseNum(rv.actualVal);
                    return (r && r !== 0) ? (a / r) * 100 : null;
                })(),
                targetVal: (() => {
                    const np = getPlVals('Net Profit');
                    const rv = getPlVals('Total Revenue');
                    const a = parseNum(np.targetVal); const r = parseNum(rv.targetVal);
                    return (r && r !== 0) ? (a / r) * 100 : null;
                })(),
                prevVal: (() => {
                    const np = getPlVals('Net Profit');
                    const rv = getPlVals('Total Revenue');
                    const a = parseNum(np.prevVal); const r = parseNum(rv.prevVal);
                    return (r && r !== 0) ? (a / r) * 100 : null;
                })(),
                pyVal: (() => {
                    const np = getPlVals('Net Profit');
                    const rv = getPlVals('Total Revenue');
                    const a = parseNum(np.pyVal); const r = parseNum(rv.pyVal);
                    return (r && r !== 0) ? (a / r) * 100 : null;
                })(),
            },

                        // ================= WORKING CAPITAL =================
            {
                id: 8,
                category: 'Working Capital',
                param: 'Trade Working Capital',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: true,
                targetVal: 500_000_000,
                actualVal: curTwcRow?.trade_working_capital ?? (curTwcRow?.twc != null ? curTwcRow.twc * 1_000_000 : null) ?? kpisCurrent?.trade_working_capital,
                prevVal: prevTwcRow?.trade_working_capital ?? (prevTwcRow?.twc != null ? prevTwcRow.twc * 1_000_000 : null) ?? kpisPrev?.trade_working_capital,
                pyVal: pyTwcRow?.trade_working_capital ?? (pyTwcRow?.twc != null ? pyTwcRow.twc * 1_000_000 : null) ?? kpisPy?.trade_working_capital,
            },
            {
                id: 9,
                category: 'Working Capital',
                param: 'CCC',
                unit: 'Days',
                isDays: true,
                isLowerBetter: true,
                targetVal: 150.0,
                actualVal: curTwcRow?.cash_conversion_cycle_days ?? curTwcRow?.ccc ?? kpisCurrent?.ccc,
                prevVal: prevTwcRow?.cash_conversion_cycle_days ?? prevTwcRow?.ccc ?? kpisPrev?.ccc,
                pyVal: pyTwcRow?.cash_conversion_cycle_days ?? pyTwcRow?.ccc ?? kpisPy?.ccc,
            },
            {
                id: 10,
                category: 'Working Capital',
                param: 'Trade Receivables',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: true,
                targetVal: 400_000_000,
                actualVal: curTwcRow?.total_receivables ?? (curTwcRow?.tr != null ? curTwcRow.tr * 1_000_000 : null),
                prevVal: prevTwcRow?.total_receivables ?? (prevTwcRow?.tr != null ? prevTwcRow.tr * 1_000_000 : null),
                pyVal: pyTwcRow?.total_receivables ?? (pyTwcRow?.tr != null ? pyTwcRow.tr * 1_000_000 : null),
            },
            {
                id: 11,
                category: 'Working Capital',
                param: 'DSO',
                unit: 'Days',
                isDays: true,
                isLowerBetter: true,
                targetVal: 120.0,
                actualVal: curTwcRow?.dso_days ?? kpisCurrent?.dso,
                prevVal: prevTwcRow?.dso_days ?? kpisPrev?.dso,
                pyVal: pyTwcRow?.dso_days ?? kpisPy?.dso,
            },
            {
                id: 12,
                category: 'Working Capital',
                param: 'Inventory',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: true,
                targetVal: 180_000_000,
                actualVal: curTwcRow?.total_inventory ?? (curTwcRow?.inv != null ? curTwcRow.inv * 1_000_000 : null),
                prevVal: prevTwcRow?.total_inventory ?? (prevTwcRow?.inv != null ? prevTwcRow.inv * 1_000_000 : null),
                pyVal: pyTwcRow?.total_inventory ?? (pyTwcRow?.inv != null ? pyTwcRow.inv * 1_000_000 : null),
            },
            {
                id: 13,
                category: 'Working Capital',
                param: 'DIO',
                unit: 'Days',
                isDays: true,
                isLowerBetter: true,
                targetVal: 70.0,
                actualVal: curTwcRow?.dio_days ?? kpisCurrent?.dio,
                prevVal: prevTwcRow?.dio_days ?? kpisPrev?.dio,
                pyVal: pyTwcRow?.dio_days ?? kpisPy?.dio,
            },
            {
                id: 14,
                category: 'Working Capital',
                param: 'Trade Payables',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: false,
                targetVal: 280_000_000,
                actualVal: curTwcRow?.total_payables ?? (curTwcRow?.tp != null ? curTwcRow.tp * 1_000_000 : null),
                prevVal: prevTwcRow?.total_payables ?? (prevTwcRow?.tp != null ? prevTwcRow.tp * 1_000_000 : null),
                pyVal: pyTwcRow?.total_payables ?? (pyTwcRow?.tp != null ? pyTwcRow.tp * 1_000_000 : null),
            },
            {
                id: 15,
                category: 'Working Capital',
                param: 'DPO',
                unit: 'Days',
                isDays: true,
                isLowerBetter: false,
                targetVal: 140.0,
                actualVal: curTwcRow?.dpo_days ?? kpisCurrent?.dpo,
                prevVal: prevTwcRow?.dpo_days ?? kpisPrev?.dpo,
                pyVal: pyTwcRow?.dpo_days ?? kpisPy?.dpo,
            },

// ================= INVESTMENTS =================
            {
                id: 16,
                category: 'Investments',
                param: 'Fixed Assets',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: false,
                targetVal: 320_000_000,
                actualVal: fp.fixed_assets_and_other_non_current_assets,
                prevVal: fpP.fixed_assets_and_other_non_current_assets,
                pyVal: fpY.fixed_assets_and_other_non_current_assets,
            },
            {
                id: 17,
                category: 'Investments',
                param: 'Other Assets',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: false,
                targetVal: 100_000_000,
                actualVal: fp.audit?.bs_investments,
                prevVal: fpP.audit?.bs_investments,
                pyVal: fpY.audit?.bs_investments,
            },
            {
                id: 18,
                category: 'Investments',
                param: 'Total Investments (16+17)',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: false,
                targetVal: 150_000_000,
                actualVal: fp.total_investments,
                prevVal: fpP.total_investments,
                pyVal: fpY.total_investments,
            },

            // ================= EQUITY & LONG TERM FUNDS =================
            {
                id: 19,
                category: 'Equity & Long Term Funds',
                param: 'Net Equity',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: false,
                targetVal: 700_000_000,
                actualVal: fp.equity_position,
                prevVal: fpP.equity_position,
                pyVal: fpY.equity_position,
            },
            {
                id: 20,
                category: 'Equity & Long Term Funds',
                param: 'Long Term Loan from Banks',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: true,
                targetVal: 250_000_000,
                actualVal: fp.long_term_bank_borrowings,
                prevVal: fpP.long_term_bank_borrowings,
                pyVal: fpY.long_term_bank_borrowings,
            },

            // ================= SHORT TERM BORROWINGS =================
            {
                id: 21,
                category: 'Short Term Borrowings',
                param: 'Advance from Customers',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: false,
                targetVal: 180_000_000,
                actualVal: null,
                prevVal: null,
                pyVal: null,
            },
            {
                id: 22,
                category: 'Short Term Borrowings',
                param: 'Short Term Loans (18-19-20-21)',
                unit: 'AED M',
                isDays: false,
                isLowerBetter: true,
                targetVal: 110_000_000,
                actualVal: fp.short_term_bank_borrowings,
                prevVal: fpP.short_term_bank_borrowings,
                pyVal: fpY.short_term_bank_borrowings,
            },
        ];

        return rows.map(r => {
            const vTgt = calcVar(r.actualVal, r.targetVal);
            const vPrev = calcVar(r.actualVal, r.prevVal);
            const vPy = isYtd ? calcVar(r.actualVal, r.pyVal) : { diff: null, pct: null };

            return {
                ...r,
                varTarget: vTgt.diff,
                pctTarget: vTgt.pct,
                varPrev: vPrev.diff,
                pctPrev: vPrev.pct,
                varPy: vPy.diff,
                pctPy: vPy.pct,
            };
        });
    }, [plCurrentRows, plPrevRows, plPyRows, twcTrendRows, kpisCurrent, kpisPrev, kpisPy, fpCurrent, fpPrev, fpPy, periodType, dateMeta]);

    // Categories config matching reference image
    const CATEGORIES = [
        {
            name: 'Profitability',
            count: 9,
            bg: '#eff6ff',
            text: '#1e40af',
            icon: BarChart3,
            iconColor: '#2563eb'
        },
        {
            name: 'Working Capital',
            count: 8,
            bg: '#ecfdf5',
            text: '#065f46',
            icon: RefreshCw,
            iconColor: '#059669'
        },
        {
            name: 'Investments',
            count: 3,
            bg: '#f0f9ff',
            text: '#0369a1',
            icon: Building,
            iconColor: '#0284c7'
        },
        {
            name: 'Equity & Long Term Funds',
            count: 2,
            bg: '#faf5ff',
            text: '#6b21a8',
            icon: Landmark,
            iconColor: '#7c3aed'
        },
        {
            name: 'Short Term Borrowings',
            count: 2,
            bg: '#fff7ed',
            text: '#9a3412',
            icon: Layers,
            iconColor: '#ea580c'
        },
    ];

    // Helper to render variance cell pair (Var & %)
    const renderVariancePair = (diff, pct, isLowerBetter, isDays) => {
        if (diff === null || isNaN(diff)) {
            return (
                <>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>—</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#94a3b8' }}>—</td>
                </>
            );
        }

        const isPositive = diff > 0;
        const arrow = isPositive ? '▲' : (diff < 0 ? '▼' : '');
        // Color logic: if isLowerBetter is true, negative variance is favorable (green); if false, positive variance is favorable (green)
        const isFavorable = isLowerBetter ? diff <= 0 : diff >= 0;
        const color = isFavorable ? '#16a34a' : '#dc2626';

        let displayDiff;
        if (isDays) {
            displayDiff = Math.abs(diff).toFixed(1);
        } else if (displayUnit === 'aed') {
            displayDiff = Math.round(Math.abs(diff)).toLocaleString('en-US');
        } else {
            displayDiff = (Math.abs(diff) / 1_000_000).toFixed(1);
        }

        const displayPct = pct !== null && !isNaN(pct) ? `${pct.toFixed(1)}%` : '—';

        return (
            <>
                <td style={{ ...tdStyle, textAlign: 'right', color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {arrow && <span style={{ fontSize: '0.65rem', marginRight: 4 }}>{arrow}</span>}
                    {displayDiff}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {displayPct}
                </td>
            </>
        );
    };

    const isYtd = periodType === 'YTD';

    // Tab definitions
    const TABS = [
        { key: 'revenue',         label: 'Revenue & Profitability KPI', categories: ['Profitability'] },
        { key: 'working_capital', label: 'Working Capital KPI',          categories: ['Working Capital'] },
        { key: 'financials',      label: 'Financials KPI',               categories: ['Investments', 'Equity & Long Term Funds', 'Short Term Borrowings'] },
    ];

    const activeTabDef = TABS.find(t => t.key === activeTab) || TABS[0];
    const visibleRows = tableData.filter(r => activeTabDef.categories.includes(r.category));

    // Dynamic row unit helper (AED / Millions / Days)
    const getRowUnit = (row) => {
        if (row.isPct) return '%';
        if (row.isDays) return 'Days';
        return displayUnit === 'aed' ? (currency || 'AED') : `${currency || 'AED'} M`;
    };

    return (
        <div style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: '20px 22px',
            marginTop: 20,
        }}>
            {/* ── TOP HEADER ── */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 18,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                        border: '1px solid #dbeafe',
                    }}>
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
                                Key Financial Parameters
                            </span>
                            <span title="Key financial metrics snapshot" style={{ color: '#94a3b8', cursor: 'pointer', display: 'inline-flex' }}>
                                <Info size={14} />
                            </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                            Snapshot of key financial metrics with targets and variance analysis
                        </div>
                    </div>
                </div>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    {/* PTD / YTD Toggle Button Group */}
                    <div style={{
                        display: 'inline-flex',
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 8,
                        padding: 3,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    }}>
                        <button
                            type="button"
                            onClick={() => setPeriodType('PTD')}
                            style={{
                                padding: '5px 18px',
                                borderRadius: 6,
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: periodType === 'PTD' ? '#4f46e5' : 'transparent',
                                color: periodType === 'PTD' ? '#ffffff' : '#64748b',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            PTD
                        </button>
                        <button
                            type="button"
                            onClick={() => setPeriodType('YTD')}
                            style={{
                                padding: '5px 18px',
                                borderRadius: 6,
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: periodType === 'YTD' ? '#4f46e5' : 'transparent',
                                color: periodType === 'YTD' ? '#ffffff' : '#64748b',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            YTD
                        </button>
                    </div>

                    {/* AED / Millions Unit Toggle */}
                    <div style={{
                        display: 'inline-flex',
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 8,
                        padding: 3,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    }}>
                        <button
                            type="button"
                            onClick={() => setDisplayUnit('aed')}
                            style={{
                                padding: '5px 14px',
                                borderRadius: 6,
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: displayUnit === 'aed' ? '#4f46e5' : 'transparent',
                                color: displayUnit === 'aed' ? '#ffffff' : '#64748b',
                                transition: 'all 0.15s ease',
                            }}
                            title={`Display amounts in full ${currency || 'AED'}`}
                        >
                            {currency || 'AED'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setDisplayUnit('millions')}
                            style={{
                                padding: '5px 14px',
                                borderRadius: 6,
                                fontSize: '0.76rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: displayUnit === 'millions' ? '#4f46e5' : 'transparent',
                                color: displayUnit === 'millions' ? '#ffffff' : '#64748b',
                                transition: 'all 0.15s ease',
                            }}
                            title={`Display amounts in ${currency || 'AED'} Millions`}
                        >
                            Millions
                        </button>
                    </div>

                    {/* Reporting Currency display */}
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                        Reporting Currency: <strong style={{ color: '#4f46e5', fontWeight: 800 }}>{currency || 'AED'}</strong>
                    </div>

                    {/* Options button */}
                    <button
                        type="button"
                        style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: 6,
                            background: '#ffffff',
                            padding: '6px 8px',
                            color: '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <MoreVertical size={14} />
                    </button>
                </div>
            </div>

            {/* ── FILTERS ROW (BELOW PTD/YTD SELECTION) ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
                marginBottom: 20,
                background: '#f8fafc',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
            }}>
                {/* 1. Legal Group */}
                <div>
                    <label style={filterLabelStyle}>Legal Group</label>
                    <MultiSelectDropdown
                        options={filterOptions.legal_groups || []}
                        value={selectedLegalGroup}
                        onChange={(val) => {
                            setSelectedLegalGroup(val);
                            setSelectedLegalEntity(['All']);
                            setSelectedParentDivision(['All']);
                            setSelectedSubdivision(['All']);
                        }}
                        placeholder="All"
                        label="Legal Group"
                    />
                </div>

                {/* 2. Legal Entity */}
                <div>
                    <label style={filterLabelStyle}>Legal Entity</label>
                    <MultiSelectDropdown
                        options={filteredLegalEntities}
                        value={selectedLegalEntity}
                        onChange={(val) => {
                            setSelectedLegalEntity(val);
                            setSelectedParentDivision(['All']);
                            setSelectedSubdivision(['All']);
                        }}
                        placeholder="All"
                        label="Legal Entity"
                    />
                </div>

                {/* 3. Parent Division */}
                <div>
                    <label style={filterLabelStyle}>Parent Division</label>
                    <MultiSelectDropdown
                        options={filteredParentDivisions}
                        value={selectedParentDivision}
                        onChange={(val) => {
                            setSelectedParentDivision(val);
                            setSelectedSubdivision(['All']);
                        }}
                        placeholder="All"
                        label="Parent Division"
                    />
                </div>

                {/* 4. Sub-Division */}
                <div>
                    <label style={filterLabelStyle}>Sub-Division</label>
                    <MultiSelectDropdown
                        options={filteredSubdivisions}
                        value={selectedSubdivision}
                        onChange={(val) => setSelectedSubdivision(val)}
                        placeholder="All"
                        label="Sub-Division"
                    />
                </div>

                {/* 5. Reporting Year */}
                <div>
                    <label style={filterLabelStyle}>Reporting Year</label>
                    <select
                        value={selectedYear}
                        onChange={e => {
                            setSelectedYear(e.target.value);
                            const parts = selectedMonth.split(' ');
                            setSelectedMonth(`${parts[0] || 'Sep'} ${e.target.value}`);
                        }}
                        style={filterSelectStyle}
                    >
                        {['2026', '2025', '2024'].map(yr => (
                            <option key={yr} value={yr}>{yr}</option>
                        ))}
                    </select>
                </div>

                {/* 6. Reporting Month */}
                <div>
                    <label style={filterLabelStyle}>Reporting Month</label>
                    <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        style={filterSelectStyle}
                    >
                        {MONTHS_LIST.map(m => {
                            const opt = `${m.code} ${selectedYear}`;
                            return <option key={opt} value={opt}>{opt}</option>;
                        })}
                    </select>
                </div>
            </div>

            {/* ── TAB BUTTONS ── */}
            <div style={{
                display: 'flex',
                gap: 8,
                marginBottom: 16,
                flexWrap: 'wrap',
            }}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '7px 18px',
                                borderRadius: 8,
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                border: isActive ? '1.5px solid #4f46e5' : '1.5px solid #e2e8f0',
                                cursor: 'pointer',
                                background: isActive ? '#4f46e5' : '#ffffff',
                                color: isActive ? '#ffffff' : '#475569',
                                transition: 'all 0.15s ease',
                                boxShadow: isActive ? '0 2px 6px rgba(79,70,229,0.18)' : 'none',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── TABLE CONTAINER ── */}
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.78rem',
                    fontFamily: 'inherit',
                    tableLayout: 'auto',
                }}>
                    <thead>
                        {/* Header Row 1 */}
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th rowSpan={2} style={{ ...thStyle, width: 38, textAlign: 'center' }}>#</th>
                            <th rowSpan={2} style={{ ...thStyle, minWidth: 260, textAlign: 'left' }}>Parameter</th>
                            <th rowSpan={2} style={{ ...thStyle, width: 75, textAlign: 'left' }}>Unit</th>
                            <th rowSpan={2} style={{ ...thStyle, minWidth: 90, textAlign: 'right' }}>
                                Actual<br/><span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b' }}>{isYtd ? 'YTD' : ''}</span>
                            </th>
                            <th rowSpan={2} style={{ ...thStyle, minWidth: 90, textAlign: 'right' }}>
                                Target<br/><span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b' }}>{isYtd ? 'YTD' : ''}</span>
                            </th>
                            <th rowSpan={2} style={{ ...thStyle, minWidth: 105, textAlign: 'right' }}>
                                Previous Month<br/><span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b' }}>{dateMeta.prevMonthLabel}</span>
                            </th>
                            {isYtd && (
                                <th rowSpan={2} style={{ ...thStyle, minWidth: 105, textAlign: 'right' }}>
                                    Previous Year<br/><span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b' }}>{dateMeta.pyLabel}</span>
                                </th>
                            )}
                            <th colSpan={2} style={{ ...thStyle, textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>Actual vs Target</th>
                            <th colSpan={2} style={{ ...thStyle, textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>Actual vs Prev Month</th>
                            {isYtd && (
                                <th colSpan={2} style={{ ...thStyle, textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>Actual vs Prev Year</th>
                            )}
                        </tr>
                        {/* Header Row 2 (Subheaders) */}
                        <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1' }}>
                            <th style={{ ...subThStyle, borderLeft: '1px solid #e2e8f0', textAlign: 'right' }}>Var</th>
                            <th style={{ ...subThStyle, textAlign: 'right' }}>%</th>
                            <th style={{ ...subThStyle, borderLeft: '1px solid #e2e8f0', textAlign: 'right' }}>Var</th>
                            <th style={{ ...subThStyle, textAlign: 'right' }}>%</th>
                            {isYtd && (
                                <>
                                    <th style={{ ...subThStyle, borderLeft: '1px solid #e2e8f0', textAlign: 'right' }}>Var</th>
                                    <th style={{ ...subThStyle, textAlign: 'right' }}>%</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={isYtd ? 13 : 10} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Loading parameters from live data sources...
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && visibleRows.map((row, idx) => {
                            return (
                                <tr
                                    key={row.id}
                                    style={{
                                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                                        borderBottom: '1px solid #f1f5f9',
                                        transition: 'background 0.15s ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafafa'}
                                >
                                    {/* Index # */}
                                    <td style={{ ...tdStyle, width: 38, textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                                        {row.id}
                                    </td>

                                    {/* Parameter Name */}
                                    <td style={{ ...tdStyle, fontWeight: (row.id === 1 || row.id === 5 || row.id === 5.1 || row.id === 7 || row.id === 7.1 || row.id === 8 || row.id === 18 || row.id === 19) ? 800 : 600, color: '#1e293b' }}>
                                        {row.param}
                                    </td>

                                    {/* Unit */}
                                    <td style={{ ...tdStyle, width: 75, color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>
                                        {getRowUnit(row)}
                                    </td>

                                    {/* Actual */}
                                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 800, color: row.isPct ? '#2563eb' : '#0f172a' }}>
                                        {formatValue(row.actualVal, row.isDays, displayUnit, row.isPct)}
                                    </td>

                                    {/* Target */}
                                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                        {formatValue(row.targetVal, row.isDays, displayUnit, row.isPct)}
                                    </td>

                                    {/* Previous Month */}
                                    <td style={{ ...tdStyle, textAlign: 'right', color: '#334155', fontWeight: 600 }}>
                                        {formatValue(row.prevVal, row.isDays, displayUnit, row.isPct)}
                                    </td>

                                    {/* Previous Year (YTD only) */}
                                    {isYtd && (
                                        <td style={{ ...tdStyle, textAlign: 'right', color: '#334155', fontWeight: 600 }}>
                                            {formatValue(row.pyVal, row.isDays, displayUnit, row.isPct)}
                                        </td>
                                    )}

                                    {/* Actual vs Target (Var, %) */}
                                    {renderVariancePair(row.varTarget, row.pctTarget, row.isLowerBetter, row.isDays)}

                                    {/* Actual vs Prev Month (Var, %) */}
                                    {renderVariancePair(row.varPrev, row.pctPrev, row.isLowerBetter, row.isDays)}

                                    {/* Actual vs Prev Year (Var, %) (YTD only) */}
                                    {isYtd && renderVariancePair(row.varPy, row.pctPy, row.isLowerBetter, row.isDays)}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Shared Inline Styles ──
const filterLabelStyle = {
    display: 'block',
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#64748b',
    marginBottom: 4,
};

const filterSelectStyle = {
    width: '100%',
    height: 32,
    border: '1px solid #dfe4ec',
    borderRadius: 7,
    padding: '0 8px',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#1e293b',
    background: '#ffffff',
    outline: 'none',
    cursor: 'pointer',
};

const thStyle = {
    padding: '10px 10px',
    fontSize: '0.72rem',
    fontWeight: 800,
    color: '#1e3a8a',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    borderRight: '1px solid #f1f5f9',
};

const subThStyle = {
    padding: '6px 10px',
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    borderRight: '1px solid #f1f5f9',
};

const tdStyle = {
    padding: '9px 10px',
    fontSize: '0.76rem',
    borderRight: '1px solid #f1f5f9',
    fontVariantNumeric: 'tabular-nums',
};
