import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    BarChart3, RefreshCw, Building, Landmark, Layers, MoreVertical, Info
} from 'lucide-react';
import { fetchPLStatement } from '../services/plApi';
import { getExecKpis, getExecTwcTrend } from '../api/executiveDashboardApi';
import { getFinancialPositionKpis } from '../api/financialPositionApi';

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

export default function KeyFinancialParameters({
    filterOptions = {},
    initialFilters = {},
    currency = 'AED',
    parentTwcTrend = [],
    parentKpis = {},
}) {
    // 1. PTD vs YTD toggle (default YTD as in reference design)
    const [periodType, setPeriodType] = useState('YTD');

    // 2. Local filter dropdown states below PTD/YTD toggle
    const [selectedLegalGroup, setSelectedLegalGroup] = useState('All');
    const [selectedLegalEntity, setSelectedLegalEntity] = useState('All');
    const [selectedParentDivision, setSelectedParentDivision] = useState('All');
    const [selectedSubdivision, setSelectedSubdivision] = useState('All');
    const [selectedYear, setSelectedYear] = useState('2026');
    const [selectedMonth, setSelectedMonth] = useState('Sep 2026');

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

        if (selectedLegalGroup && selectedLegalGroup !== 'All') {
            const lgObj = (filterOptions.legal_groups || []).find(g => (typeof g === 'object' ? (g.id === selectedLegalGroup || g.name === selectedLegalGroup || g.value === selectedLegalGroup) : g === selectedLegalGroup));
            params.legalGroupId = lgObj?.id ? [lgObj.id] : [selectedLegalGroup];
            params.legal_group_id = params.legalGroupId;
        }
        if (selectedLegalEntity && selectedLegalEntity !== 'All') {
            const leObj = (filterOptions.legal_entities || []).find(e => (typeof e === 'object' ? (e.id === selectedLegalEntity || e.name === selectedLegalEntity || e.value === selectedLegalEntity) : e === selectedLegalEntity));
            params.legalEntityId = leObj?.id ? [leObj.id] : [selectedLegalEntity];
            params.legal_entity_id = params.legalEntityId;
        }
        if (selectedParentDivision && selectedParentDivision !== 'All') {
            const pdObj = (filterOptions.parent_divisions || []).find(p => (typeof p === 'object' ? (p.id === selectedParentDivision || p.name === selectedParentDivision || p.value === selectedParentDivision) : p === selectedParentDivision));
            params.parentDivisionId = pdObj?.id ? [pdObj.id] : [selectedParentDivision];
            params.parent_division_id = params.parentDivisionId;
        }
        if (selectedSubdivision && selectedSubdivision !== 'All') {
            const sdObj = (filterOptions.subdivisions || []).find(s => (typeof s === 'object' ? (s.id === selectedSubdivision || s.name === selectedSubdivision || s.value === selectedSubdivision) : s === selectedSubdivision));
            params.subdivisionId = sdObj?.id ? [sdObj.id] : [selectedSubdivision];
            params.subdivision_id = params.subdivisionId;
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

        const p8 = getFinancialPositionKpis({
            calendar_date: dateMeta.asOfDate,
            currency: currency || 'AED',
            ...hierarchy,
        }).catch(() => null);

        const p9 = getFinancialPositionKpis({
            calendar_date: dateMeta.prevAsOfDate,
            currency: currency || 'AED',
            ...hierarchy,
        }).catch(() => null);

        const p10 = periodType === 'YTD'
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
                id: 10,
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
                id: 11,
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
                id: 12,
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
                id: 13,
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
                id: 14,
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
            {
                id: 15,
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
                param: 'Total Investments',
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
                param: 'Short Term Loans',
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
            count: 7,
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

        const displayDiff = isDays ? Math.abs(diff).toFixed(1) : (Math.abs(diff) / 1_000_000).toFixed(1);
        const displayPct = pct !== null && !isNaN(pct) ? `${pct >= 0 ? '' : ''}${pct.toFixed(1)}%` : '—';

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
                    <select
                        value={selectedLegalGroup}
                        onChange={e => {
                            setSelectedLegalGroup(e.target.value);
                            setSelectedLegalEntity('All');
                        }}
                        style={filterSelectStyle}
                    >
                        <option value="All">All</option>
                        {(filterOptions.legal_groups || []).map(g => {
                            const val = typeof g === 'object' ? (g.id || g.value || g.name) : g;
                            const label = typeof g === 'object' ? (g.name || g.label || val) : g;
                            return <option key={val} value={val}>{label}</option>;
                        })}
                    </select>
                </div>

                {/* 2. Legal Entity */}
                <div>
                    <label style={filterLabelStyle}>Legal Entity</label>
                    <select
                        value={selectedLegalEntity}
                        onChange={e => setSelectedLegalEntity(e.target.value)}
                        style={filterSelectStyle}
                    >
                        <option value="All">All</option>
                        {(filterOptions.legal_entities || []).map(le => {
                            const val = typeof le === 'object' ? (le.id || le.value || le.name) : le;
                            const label = typeof le === 'object' ? (le.name || le.label || val) : le;
                            return <option key={val} value={val}>{label}</option>;
                        })}
                    </select>
                </div>

                {/* 3. Parent Division */}
                <div>
                    <label style={filterLabelStyle}>Parent Division</label>
                    <select
                        value={selectedParentDivision}
                        onChange={e => setSelectedParentDivision(e.target.value)}
                        style={filterSelectStyle}
                    >
                        <option value="All">All</option>
                        {(filterOptions.parent_divisions || []).map(pd => {
                            const val = typeof pd === 'object' ? (pd.id || pd.value || pd.name) : pd;
                            const label = typeof pd === 'object' ? (pd.name || pd.label || val) : pd;
                            return <option key={val} value={val}>{label}</option>;
                        })}
                    </select>
                </div>

                {/* 4. Sub-Division */}
                <div>
                    <label style={filterLabelStyle}>Sub-Division</label>
                    <select
                        value={selectedSubdivision}
                        onChange={e => setSelectedSubdivision(e.target.value)}
                        style={filterSelectStyle}
                    >
                        <option value="All">All</option>
                        {(filterOptions.subdivisions || []).map(sd => {
                            const val = typeof sd === 'object' ? (sd.id || sd.value || sd.name) : sd;
                            const label = typeof sd === 'object' ? (sd.name || sd.label || val) : sd;
                            return <option key={val} value={val}>{label}</option>;
                        })}
                    </select>
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
                            <th rowSpan={2} style={{ ...thStyle, width: 34, textAlign: 'center' }}>#</th>
                            <th rowSpan={2} colSpan={2} style={{ ...thStyle, minWidth: 260, textAlign: 'left' }}>Parameter</th>
                            <th rowSpan={2} style={{ ...thStyle, width: 68, textAlign: 'left' }}>Unit</th>
                            <th rowSpan={2} style={{ ...thStyle, minWidth: 90, textAlign: 'right' }}>
                                Target<br/><span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b' }}>{isYtd ? 'YTD' : ''}</span>
                            </th>
                            <th rowSpan={2} style={{ ...thStyle, minWidth: 90, textAlign: 'right' }}>
                                Actual<br/><span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b' }}>{isYtd ? 'YTD' : ''}</span>
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
                                <td colSpan={isYtd ? 14 : 11} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Loading parameters from live data sources...
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && tableData.map((row, idx) => {
                            // Find category config
                            const cat = CATEGORIES.find(c => c.name === row.category);
                            const isCategoryFirstRow = (
                                (row.id === 1) ||
                                (row.id === 8) ||
                                (row.id === 16) ||
                                (row.id === 19) ||
                                (row.id === 21)
                            );

                            const CategoryIcon = cat?.icon || BarChart3;

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
                                    {/* Category Pill (Rowspan across rows) */}
                                    {isCategoryFirstRow && (
                                        <td
                                            rowSpan={cat?.count || 1}
                                            style={{
                                                padding: '12px 10px',
                                                verticalAlign: 'middle',
                                                background: cat?.bg || '#ffffff',
                                                borderRight: '1.5px solid #e2e8f0',
                                                borderBottom: '1px solid #cbd5e1',
                                                textAlign: 'center',
                                                width: 140,
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 8,
                                                color: cat?.text || '#1e3a8a',
                                                fontWeight: 800,
                                                fontSize: '0.78rem',
                                            }}>
                                                <div style={{
                                                    width: 26,
                                                    height: 26,
                                                    borderRadius: 6,
                                                    background: '#ffffff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                }}>
                                                    <CategoryIcon size={14} color={cat?.iconColor || '#2563eb'} />
                                                </div>
                                                <span>{cat?.name}</span>
                                            </div>
                                        </td>
                                    )}

                                    {/* Index # */}
                                    <td style={{ ...tdStyle, width: 34, textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                                        {row.id}
                                    </td>

                                    {/* Parameter Name */}
                                    <td style={{ ...tdStyle, fontWeight: (row.id === 1 || row.id === 5 || row.id === 7 || row.id === 8 || row.id === 18 || row.id === 19) ? 800 : 600, color: '#1e293b' }}>
                                        {row.param}
                                    </td>

                                    {/* Unit */}
                                    <td style={{ ...tdStyle, width: 68, color: '#64748b', fontSize: '0.72rem', fontWeight: 500 }}>
                                        {row.unit}
                                    </td>

                                    {/* Target */}
                                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                        {row.isDays ? formatDays(row.targetVal) : formatM(row.targetVal)}
                                    </td>

                                    {/* Actual */}
                                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                                        {row.isDays ? formatDays(row.actualVal) : formatM(row.actualVal)}
                                    </td>

                                    {/* Previous Month */}
                                    <td style={{ ...tdStyle, textAlign: 'right', color: '#334155', fontWeight: 600 }}>
                                        {row.isDays ? formatDays(row.prevVal) : formatM(row.prevVal)}
                                    </td>

                                    {/* Previous Year (YTD only) */}
                                    {isYtd && (
                                        <td style={{ ...tdStyle, textAlign: 'right', color: '#334155', fontWeight: 600 }}>
                                            {row.isDays ? formatDays(row.pyVal) : formatM(row.pyVal)}
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
    height: 34,
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '0 8px',
    fontSize: '0.76rem',
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
