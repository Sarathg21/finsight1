import React, { useState, useRef, useEffect } from 'react';
import { 
    LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Area, AreaChart
} from 'recharts';
import { 
    BarChart3, RefreshCw, Layers, Wallet, Target, Landmark, Percent, PieChart, Coins, Briefcase, Calendar, MapPin, Building, Globe, RefreshCcw, FileText, ExternalLink, MoreVertical, Download, Eye, TrendingUp
} from 'lucide-react';
import ExecDashboardViewAll from '../components/ExecDashboardViewAll';
import { 
    getExecKpis, 
    getExecTwcTrend, 
    getExecRevenueByRegion, 
    getExecProfitabilityByRegion, 
    exportExecTwcExcel,
    exportExecTwcPdf 
} from '../api/executiveDashboardApi';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmtPeriod = (v) => {
    if (v === null || v === undefined) return '';
    const str = String(v).trim();
    const m1 = str.match(/^(\d{4})[-/](\d{1,2})$/);
    if (m1) {
        const yr = m1[1].slice(2);
        const mo = parseInt(m1[2], 10) - 1;
        if (mo >= 0 && mo < 12) return `${MONTHS_SHORT[mo]} ${yr}`;
    }
    const m2 = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (m2) {
        const yr = m2[1].slice(2);
        const mo = parseInt(m2[2], 10) - 1;
        if (mo >= 0 && mo < 12) return `${MONTHS_SHORT[mo]} ${yr}`;
    }
    return str;
};

function getRows(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.rows)) return payload.rows;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.trend)) return payload.trend;
    if (Array.isArray(payload.parameters)) return payload.parameters;
    if (Array.isArray(payload.regions)) return payload.regions;
    return [];
}

const DEFAULT_KPI_DATA = {
    total_revenue: 125430250,
    cost_of_material: 42150000,
    gross_profit: 83280250,
    ebitda: 35120000,
    net_profit: 24850000,
    trade_working_capital: 40295205.92,
    overdue_receivables: 18450000,
    slow_moving_obsolete_stock: 4285000,
    cash_collection: 98450000,
    collection_efficiency: 88.5,
    total_short_term_borrowing: 15200000,
    roi: 14.2,
    total_revenue_change: 12.5,
    cost_of_material_change: -3.2,
    gross_profit_change: 15.8,
    ebitda_change: 8.4,
    net_profit_change: 18.2,
    trade_working_capital_change: -2.1,
    overdue_receivables_change: -5.4,
    slow_moving_obsolete_stock_change: 1.2,
    cash_collection_change: 10.5,
    collection_efficiency_change: 4.2,
    total_short_term_borrowing_change: -8.1,
    roi_change: 2.5,
};

/* ----------------- COMPONENTS ----------------- */

const Sparkline = ({ data, colorClass }) => {
    const formattedData = (data || []).map((val, i) => ({ index: i, value: val }));
    let color = 'var(--clr-primary)';
    if (colorClass === 'red') color = 'var(--clr-danger)';
    if (colorClass === 'green') color = 'var(--clr-success)';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
                <defs>
                    <linearGradient id={`color-${colorClass}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${colorClass})`} isAnimationActive={false} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', padding: '8px 12px', borderRadius: 6, fontSize: '0.75rem', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--clr-text)' }}>{label}</div>
                {payload.map((entry, index) => (
                    <div key={index} style={{ color: entry.color, display: 'flex', gap: 8, fontWeight: 600 }}>
                        <span>{entry.name}:</span>
                        <span>{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

/* ─── Chart Menu (3-dot kebab) ─── */
function ChartMenu({ menuItems }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(v => !v)}
                title="Options"
                style={{
                    background: open ? 'var(--clr-surface-2)' : 'none',
                    border: 'none', cursor: 'pointer',
                    padding: '4px', borderRadius: 6,
                    color: 'var(--clr-text-muted)',
                    lineHeight: 1, transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center',
                    outline: 'none',
                }}
            >
                <MoreVertical size={16} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 4px)',
                    background: 'var(--clr-surface)', borderRadius: 10,
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--clr-border)',
                    minWidth: 170, zIndex: 100,
                    overflow: 'hidden',
                    animation: 'scaleUp 0.14s cubic-bezier(0.34,1.56,0.64,1) forwards',
                }}>
                    <style>{`@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
                    {menuItems.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => { item.action(); setOpen(false); }}
                            style={{
                                display: 'flex', width: '100%', alignItems: 'center', gap: 8,
                                textAlign: 'left', padding: '10px 14px',
                                background: 'none', border: 'none',
                                fontSize: '0.75rem', fontWeight: 600,
                                color: 'var(--clr-text)', cursor: 'pointer',
                                transition: 'background 0.12s',
                                borderTop: i > 0 ? '1px solid var(--clr-border)' : 'none',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-surface-2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            {item.icon && <item.icon size={13} color="var(--clr-text-muted)" />}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ExecutiveDashboard() {
    const [viewAll, setViewAll] = useState({ open: false, section: 'twc_viewall' });
    const [paramTableMode, setParamTableMode] = useState('all'); // 'all' | 'values' | 'ratios'

    // ── Filter state ──
    const [filters, setFilters] = useState({
        as_of_date: '2026-09-25',
        as_on_date: '2026-09-25',
        period_type: 'PTD',
        reporting_currency: 'AED',
        legal_group_id: null,
        legal_entity_id: null,
        parent_division_id: null,
        subdivision_id: null,
        region: 'All Regions',
        view_mode: 'Executive View'
    });
    const [pendingFilters, setPendingFilters] = useState({ ...filters });
    const [appliedFilters, setAppliedFilters] = useState({ ...filters });
    const currency = appliedFilters.reporting_currency || 'AED';

    // ── Dynamic Table Period Headers ──
    const dynamicHeaders = React.useMemo(() => {
        const dStr = appliedFilters.as_of_date || '2026-09-25';
        const parts = dStr.split('-');
        if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const currentStr = `${MONTHS_SHORT[m]} ${y}`;

            let pmMonth = m - 1;
            let pmYear = y;
            if (pmMonth < 0) { pmMonth = 11; pmYear = y - 1; }
            const prevMonthStr = `${MONTHS_SHORT[pmMonth]} ${pmYear}`;

            const prevYearStr = `${MONTHS_SHORT[m]} ${y - 1}`;
            return { current: currentStr, prevMonth: prevMonthStr, prevYear: prevYearStr };
        }
        return { current: 'Sep 2026', prevMonth: 'Aug 2026', prevYear: 'Sep 2025' };
    }, [appliedFilters.as_of_date]);

    // ── KPI state ──
    const [kpiData, setKpiData] = useState(DEFAULT_KPI_DATA);
    const [kpiLoading, setKpiLoading] = useState(false);
    const [kpiError, setKpiError] = useState(null);

    // ── TWC Trend state ──
    const [twcTrend, setTwcTrend] = useState([]);
    const [twcLoading, setTwcLoading] = useState(false);

    // ── Regional & Parameters state ──
    const [revRegionData, setRevRegionData] = useState([]);
    const [profitRegionDataState, setProfitRegionDataState] = useState([]);

    // ── Fetch KPIs on filter apply ──
    useEffect(() => {
        let cancelled = false;
        setKpiLoading(true);
        setKpiError(null);

        getExecKpis(appliedFilters)
            .then(data => {
                if (!cancelled) {
                    if (data && (data.kpis || data.data || data.summary || Object.keys(data).length > 0)) {
                        setKpiData(data);
                    } else {
                        setKpiData(DEFAULT_KPI_DATA);
                    }
                }
            })
            .catch(err => {
                if (!cancelled) {
                    console.error('[Exec KPIs]', err.response?.status, err.response?.data || err.message);
                    setKpiError(err);
                    setKpiData(DEFAULT_KPI_DATA);
                }
            })
            .finally(() => { if (!cancelled) setKpiLoading(false); });

        return () => { cancelled = true; };
    }, [appliedFilters]);

    // ── Fetch TWC Trend on filter apply ──
    useEffect(() => {
        if (!getExecTwcTrend) return;
        let cancelled = false;
        setTwcLoading(true);

        getExecTwcTrend(appliedFilters)
            .then(data => {
                if (!cancelled) {
                    const rows = getRows(data);
                    setTwcTrend(rows.map(r => {
                        const rawTr  = Number(r.trade_receivables ?? r.total_receivables ?? r.receivables ?? r.tr ?? 0);
                        const rawInv = Number(r.inventory ?? r.total_inventory ?? r.inventories ?? r.inv ?? 0);
                        const rawTp  = Number(r.trade_payables ?? r.total_payables ?? r.payables ?? r.tp ?? 0);
                        const rawTwc = Number(r.trade_working_capital ?? r.twc ?? 0);

                        // Scale to Millions for "AED Million" chart YAxis scale
                        const tr  = rawTr  > 1000 ? Number((rawTr  / 1_000_000).toFixed(2)) : rawTr;
                        const inv = rawInv > 1000 ? Number((rawInv / 1_000_000).toFixed(2)) : rawInv;
                        const tp  = rawTp  > 1000 ? Number((rawTp  / 1_000_000).toFixed(2)) : rawTp;
                        const twc = rawTwc > 1000 ? Number((rawTwc / 1_000_000).toFixed(2)) : rawTwc;

                        const rawMonth = r.month_label ?? r.month ?? r.period_name ?? r.period ?? '';

                        return {
                            month: fmtPeriod(rawMonth) || rawMonth,
                            tr,
                            inv,
                            tp,
                            twc,
                        };
                    }));
                }
            })
            .catch(err => {
                if (!cancelled) console.error('[TWC Trend]', err.response?.status, err.response?.data || err.message);
            })
            .finally(() => { if (!cancelled) setTwcLoading(false); });

        return () => { cancelled = true; };
    }, [appliedFilters]);

    // ── Fetch Revenue by Region ──
    useEffect(() => {
        if (!getExecRevenueByRegion) return;
        let cancelled = false;
        getExecRevenueByRegion(appliedFilters)
            .then(data => {
                if (!cancelled) {
                    const rows = getRows(data);
                    setRevRegionData(rows.map(r => {
                        const rawVal = Number(r.revenue ?? r.total_revenue ?? 0);
                        const value  = rawVal > 1000 ? Number((rawVal / 1_000_000).toFixed(2)) : rawVal;
                        return {
                            name: r.region ?? r.country ?? r.country_name ?? '',
                            value
                        };
                    }));
                }
            })
            .catch(err => {
                if (!cancelled) console.error('[Revenue by Region API]', err.response?.status, err.response?.data || err.message);
            });
        return () => { cancelled = true; };
    }, [appliedFilters]);

    // ── Fetch Profitability by Region ──
    useEffect(() => {
        if (!getExecProfitabilityByRegion) return;
        let cancelled = false;
        getExecProfitabilityByRegion(appliedFilters)
            .then(data => {
                if (!cancelled) {
                    const rows = getRows(data);
                    setProfitRegionDataState(rows.map(r => {
                        const rawGp = Number(r.gross_profit ?? r.gp ?? 0);
                        const rawNp = Number(r.net_profit ?? r.np ?? 0);
                        const gp = rawGp > 1000 ? Number((rawGp / 1_000_000).toFixed(2)) : rawGp;
                        const np = rawNp > 1000 ? Number((rawNp / 1_000_000).toFixed(2)) : rawNp;
                        return {
                            name: r.region ?? r.country ?? r.country_name ?? '',
                            gp,
                            np
                        };
                    }));
                }
            })
            .catch(err => {
                if (!cancelled) console.error('[Profitability by Region API]', err.response?.status, err.response?.data || err.message);
            });
        return () => { cancelled = true; };
    }, [appliedFilters]);

    // ── KPI card config — values come from API with robust key aliasing ──
    const KPI_CONFIG = [
        { key: 'total_revenue',               title: 'Total Revenue',                  icon: BarChart3, iconColor: 'blue', colorClass: 'blue', isRed: false },
        { key: 'cost_of_material',            title: 'Cost of Material',               icon: Coins,     iconColor: 'blue', colorClass: 'red',  isRed: true },
        { key: 'gross_profit',                title: 'Gross Profit',                   icon: BarChart3, iconColor: 'green',colorClass: 'green', isRed: false },
        { key: 'ebitda',                      title: 'EBITDA',                         icon: Briefcase, iconColor: 'blue', colorClass: 'blue', isRed: false },
        { key: 'net_profit',                  title: 'Net Profit',                     icon: Coins,     iconColor: 'green',colorClass: 'green', isRed: false },
        { key: 'trade_working_capital',       title: 'Trade Working Capital',          icon: RefreshCw, iconColor: 'blue', colorClass: 'red',  isRed: true },
        { key: 'overdue_receivables',         title: 'Overdue Receivables',            icon: Wallet,    iconColor: 'blue', colorClass: 'red',  isRed: true },
        { key: 'slow_moving_obsolete_stock',  title: 'Slow Moving & Obsolete Stock',   icon: Layers,    iconColor: 'green',colorClass: 'green', isRed: false },
        { key: 'cash_collection',             title: 'Cash Collection',                icon: Wallet,    iconColor: 'blue', colorClass: 'blue', isRed: false },
        { key: 'collection_efficiency',       title: 'Collection Efficiency',          icon: Target,    iconColor: 'blue', colorClass: 'blue', isRed: false, isPct: true },
        { key: 'total_short_term_borrowing',  title: 'Total Short Term Borrowing',     icon: Landmark,  iconColor: 'blue', colorClass: 'red',  isRed: true },
        { key: 'roi',                         title: 'ROI %',                          icon: BarChart3, iconColor: 'blue', colorClass: 'green', isRed: false, isPct: true },
    ];

    // Robust extraction helper supporting both Array [{key: "...", value: ...}] and Object {key: value} payloads
    const getValueFromKpiPayload = (payload, cfgKey) => {
        if (!payload) return undefined;

        const aliases = {
            total_revenue: ['total_revenue', 'revenue', 'total_revenue_aed', 'sales_revenue', 'total_sales'],
            cost_of_material: ['cost_of_material', 'cost_of_materials', 'material_cost', 'cogs', 'cost_of_goods_sold'],
            gross_profit: ['gross_profit', 'gp', 'gross_profit_aed', 'gross_margin'],
            ebitda: ['ebitda', 'ebitda_aed', 'ebitda_amount'],
            net_profit: ['net_profit', 'np', 'net_profit_aed', 'net_income'],
            trade_working_capital: ['trade_working_capital', 'twc', 'trade_working_capital_aed', 'working_capital'],
            overdue_receivables: ['overdue_receivables', 'overdue_receivable', 'overdue_ar', 'overdue_amount', 'overdue'],
            slow_moving_obsolete_stock: ['slow_moving_obsolete_stock', 'slow_moving_stock', 'obsolete_stock', 'slow_moving_inventory', 'slow_moving'],
            cash_collection: ['cash_collection', 'cash_collections', 'collections', 'collections_total', 'total_collection'],
            collection_efficiency: ['collection_efficiency', 'collection_efficiency_pct', 'collection_efficiency_percent', 'collection_pct', 'efficiency'],
            total_short_term_borrowing: ['total_short_term_borrowing', 'short_term_bank_borrowings', 'short_term_borrowing', 'short_term_borrowings', 'st_borrowings', 'borrowings'],
            roi: ['roi', 'roi_pct', 'roi_percent', 'return_on_investment'],
            dso_days: ['dso_days', 'dso'],
            dio_days: ['dio_days', 'dio'],
            dpo_days: ['dpo_days', 'dpo'],
            cash_conversion_cycle_days: ['cash_conversion_cycle_days', 'ccc_days', 'ccc'],
            current_ratio: ['current_ratio'],
            tangible_net_worth_ratio: ['tangible_net_worth_ratio', 'tnw_ratio', 'tnw'],
            net_working_capital: ['net_working_capital', 'nwc']
        };

        const keysToCheck = aliases[cfgKey] || [cfgKey];

        // Case 1: Payload has a .kpis array e.g. { kpis: [ { key: 'total_revenue', value: 103029750.15 }, ... ] }
        const list = Array.isArray(payload?.kpis)
            ? payload.kpis
            : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
            ? payload
            : null;

        if (list) {
            for (const key of keysToCheck) {
                const item = list.find(x => x && (x.key === key || x.name === key || x.id === key));
                if (item && item.value !== undefined && item.value !== null) {
                    return item.value;
                }
            }
        }

        // Case 2: Payload is an object dictionary { total_revenue: 103029750.15, ... }
        const k = payload?.kpis ?? payload?.data ?? payload?.summary ?? payload;
        if (k && typeof k === 'object' && !Array.isArray(k)) {
            for (const key of keysToCheck) {
                if (k[key] !== undefined && k[key] !== null) {
                    return typeof k[key] === 'object' && k[key].value !== undefined ? k[key].value : k[key];
                }
            }
        }

        return undefined;
    };

    // Helper to safely extract percentage change
    const getChangeFromKpiPayload = (payload, cfgKey) => {
        if (!payload) return undefined;
        const aliases = {
            total_revenue: ['total_revenue', 'revenue'],
            cost_of_material: ['cost_of_material', 'cost_of_materials'],
            gross_profit: ['gross_profit', 'gp'],
            ebitda: ['ebitda'],
            net_profit: ['net_profit', 'np'],
            trade_working_capital: ['trade_working_capital', 'twc'],
            overdue_receivables: ['overdue_receivables', 'overdue_receivable'],
            slow_moving_obsolete_stock: ['slow_moving_obsolete_stock', 'slow_moving_stock'],
            cash_collection: ['cash_collection', 'cash_collections'],
            collection_efficiency: ['collection_efficiency'],
            total_short_term_borrowing: ['total_short_term_borrowing', 'short_term_bank_borrowings'],
            roi: ['roi']
        };

        const list = Array.isArray(payload?.kpis)
            ? payload.kpis
            : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
            ? payload
            : null;

        if (list) {
            const keysToCheck = aliases[cfgKey] || [cfgKey];
            for (const key of keysToCheck) {
                const item = list.find(x => x && (x.key === key || x.name === key));
                if (item && (item.change !== undefined || item.mom_change !== undefined)) {
                    return item.change ?? item.mom_change;
                }
            }
        }

        const k = payload?.kpis ?? payload?.data ?? payload?.summary ?? payload;
        if (k && typeof k === 'object' && !Array.isArray(k)) {
            return k[`${cfgKey}_change`] ?? k[`${cfgKey}_mom_change`];
        }
        return undefined;
    };

    // Build display values from API
    const displayKpis = KPI_CONFIG.map(cfg => {
        const apiVal = getValueFromKpiPayload(kpiData, cfg.key);
        const apiChange = getChangeFromKpiPayload(kpiData, cfg.key);

        let displayVal = '–';
        if (apiVal !== null && apiVal !== undefined) {
            const n = Number(apiVal);
            if (!isNaN(n)) {
                if (cfg.isPct) {
                    displayVal = `${n.toFixed(1)}%`;
                } else if (Math.abs(n) >= 1_000_000) {
                    displayVal = `${currency} ${(n / 1_000_000).toFixed(1)}M`;
                } else if (Math.abs(n) >= 1_000) {
                    displayVal = `${currency} ${(n / 1_000).toFixed(0)}K`;
                } else {
                    displayVal = `${currency} ${n.toFixed(2)}`;
                }
            }
        }
        const changeVal = apiChange !== null && apiChange !== undefined && !isNaN(Number(apiChange))
            ? `${Number(apiChange) >= 0 ? '+' : ''}${Number(apiChange).toFixed(1)}%`
            : '–';
        const sparkData = [10, 15, 12, 18, 16, 22, 20];
        return { ...cfg, value: displayVal, change: changeVal, isPositive: !apiChange || Number(apiChange) >= 0, sparklineData: sparkData };
    });

    const openViewAll = (section) => setViewAll({ open: true, section });
    const closeViewAll = () => setViewAll(v => ({ ...v, open: false }));

    const handleApplyFilters = () => setAppliedFilters({ ...pendingFilters });
    const handleResetFilters = () => {
        const reset = {
            as_of_date: '2026-09-25',
            as_on_date: '2026-09-25',
            period_type: 'PTD',
            reporting_currency: 'AED',
            legal_group_id: null,
            legal_entity_id: null,
            parent_division_id: null,
            subdivision_id: null,
            region: 'All Regions',
            view_mode: 'Executive View'
        };
        setPendingFilters(reset);
        setAppliedFilters(reset);
    };

    // Live API chart data
    const chartTwcData = twcTrend;
    const chartRevRegionData = revRegionData;
    const chartProfitRegionData = profitRegionDataState;

    // ── Build Key Financial Parameters table directly from Executive KPI payload ──
    const displayParamTableData = React.useMemo(() => {
        const PARAM_DEFS = [
            { key: 'total_revenue',              name: 'Total Revenue',             isCurr: true },
            { key: 'gross_profit',               name: 'Gross Profit',              isCurr: true },
            { key: 'ebitda',                     name: 'EBITDA',                    isCurr: true },
            { key: 'net_profit',                 name: 'Net Profit',                isCurr: true },
            { key: 'trade_working_capital',      name: 'Trade Working Capital',     isCurr: true },
            { key: 'net_working_capital',        name: 'Net Working Capital',       isCurr: true },
            { key: 'dso_days',                   name: 'DSO (Days)',                isDays: true, altKey: 'dso' },
            { key: 'dio_days',                   name: 'DIO (Days)',                isDays: true, altKey: 'dio' },
            { key: 'dpo_days',                   name: 'DPO (Days)',                isDays: true, altKey: 'dpo' },
            { key: 'cash_conversion_cycle_days', name: 'CCC (Days)',                isDays: true, altKey: 'ccc' },
            { key: 'current_ratio',              name: 'Current Ratio',             isRatio: true },
            { key: 'tangible_net_worth_ratio',   name: 'Tangible Net Worth Ratio',  isRatio: true, altKey: 'tnw_ratio' },
            { key: 'roi',                        name: 'ROI %',                     isPct: true },
        ];

        return PARAM_DEFS.map(def => {
            const rawVal = getValueFromKpiPayload(kpiData, def.key) ?? (def.altKey ? getValueFromKpiPayload(kpiData, def.altKey) : undefined);
            const momVal = getChangeFromKpiPayload(kpiData, def.key);
            const yoyVal = undefined;
            const prevVal = undefined;
            const prevYrVal = undefined;

            const formatVal = (v) => {
                if (v === null || v === undefined) return '–';
                const n = Number(v);
                if (isNaN(n)) return '–';
                if (def.isPct) return `${n.toFixed(2)}%`;
                if (def.isDays || def.isRatio) return n.toFixed(2);
                if (Math.abs(n) >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(1)}M`;
                if (Math.abs(n) >= 1_000) return `${currency} ${(n / 1_000).toFixed(0)}K`;
                return `${currency} ${n.toFixed(2)}`;
            };

            return {
                param: def.name,
                isCurr: def.isCurr,
                isDays: def.isDays,
                isRatio: def.isRatio,
                isPct: def.isPct,
                m1: formatVal(rawVal),
                m2: formatVal(prevVal),
                mom: momVal !== null && momVal !== undefined && !isNaN(Number(momVal)) ? `${Number(momVal) >= 0 ? '+' : ''}${Number(momVal).toFixed(1)}%` : '–',
                m3: formatVal(prevYrVal),
                yoy: yoyVal !== null && yoyVal !== undefined && !isNaN(Number(yoyVal)) ? `${Number(yoyVal) >= 0 ? '+' : ''}${Number(yoyVal).toFixed(1)}%` : '–',
                momPos: momVal !== null && momVal !== undefined && Number(momVal) >= 0,
                yoyPos: yoyVal !== null && yoyVal !== undefined && Number(yoyVal) >= 0,
                comment: ''
            };
        });
    }, [kpiData, currency]);

    const filteredParamRows = React.useMemo(() => {
        if (paramTableMode === 'values') {
            return displayParamTableData.filter(r => r.isCurr);
        }
        if (paramTableMode === 'ratios') {
            return displayParamTableData.filter(r => r.isDays || r.isRatio || r.isPct);
        }
        return displayParamTableData;
    }, [displayParamTableData, paramTableMode]);

    return (
        <div style={{ padding: '20px 24px', background: 'var(--clr-bg)', minHeight: '100vh' }}>
            <style>{`
                .filter-label {
                    font-size: 0.78rem; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;
                }
                .filter-select {
                    padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.75rem; color: #1e293b; background: #fff; outline: none; font-weight: 600; cursor: pointer; transition: border-color 0.2s;
                }
                .filter-select:hover {
                    border-color: #94a3b8;
                }
                .card {
                    background: var(--clr-surface); border-radius: 10px; border: 1px solid var(--clr-border); box-shadow: 0 1px 2px rgba(0,0,0,0.02);
                }
                .kpi-title {
                    font-size: 0.72rem; font-weight: 800; color: var(--clr-text); letter-spacing: -0.01em;
                }
                .kpi-val {
                    font-size: 1.25rem; font-weight: 800; color: var(--clr-text); font-family: var(--font-sans); margin-bottom: 2px; letter-spacing: -0.02em;
                }
                .kpi-change {
                    font-size: 0.7rem; font-weight: 800;
                }
                .th-cell {
                    padding: 12px 16px; text-align: left; color: var(--clr-text-muted); font-weight: 700; font-size: 0.75rem; border-bottom: 2px solid var(--clr-border); white-space: nowrap;
                }
                .td-cell {
                    padding: 12px 16px; color: var(--clr-text); font-weight: 600; font-size: 0.78rem; border-bottom: 1px solid var(--clr-border);
                }
                .icon-box {
                    width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .icon-box.blue {
                    background: var(--clr-primary-dim); color: var(--clr-primary);
                }
                .icon-box.green {
                    background: rgba(16, 185, 129, 0.1); color: var(--clr-success);
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
            
            {/* 1. FILTER BAR */}
            <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, padding: '10px 14px', flexWrap: 'nowrap', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="filter-label"><Calendar size={16} strokeWidth={2.5}/> Period</div>
                    <select
                        className="filter-select"
                        value={pendingFilters.as_of_date}
                        onChange={e => {
                            const d = e.target.value;
                            setPendingFilters(f => ({ ...f, as_of_date: d, as_on_date: d }));
                        }}
                    >
                        <option value="2026-09-25">Sep 2026</option>
                        <option value="2026-08-31">Aug 2026</option>
                        <option value="2026-07-31">Jul 2026</option>
                        <option value="2026-06-30">Jun 2026</option>
                        <option value="2026-05-31">May 2026</option>
                        <option value="2026-04-30">Apr 2026</option>
                        <option value="2026-03-31">Mar 2026</option>
                        <option value="2026-02-28">Feb 2026</option>
                        <option value="2026-01-31">Jan 2026</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="filter-label"><MapPin size={16} strokeWidth={2.5}/> Region</div>
                    <select
                        className="filter-select"
                        value={pendingFilters.region || 'All Regions'}
                        onChange={e => setPendingFilters(f => ({ ...f, region: e.target.value }))}
                    >
                        <option value="All Regions">All Regions</option>
                        <option value="UAE">UAE</option>
                        <option value="Qatar">Qatar</option>
                        <option value="Oman">Oman</option>
                        <option value="KSA">KSA</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="filter-label"><Building size={16} strokeWidth={2.5}/> Legal Entity</div>
                    <select
                        className="filter-select"
                        value={pendingFilters.legal_entity_id || ''}
                        onChange={e => setPendingFilters(f => ({ ...f, legal_entity_id: e.target.value ? Number(e.target.value) : null }))}
                    >
                        <option value="">All Entities</option>
                        <option value="1">Alpha Ducts LLC</option>
                        <option value="2">Alpine Coils Industry LLC</option>
                        <option value="3">DC Serve Equipment Trading LLC</option>
                        <option value="4">Euroclima Middle East LLC</option>
                        <option value="10">FJ Care UAE</option>
                        <option value="15">Flowtech Qatar</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="filter-label"><Coins size={16} strokeWidth={2.5}/> Currency</div>
                    <select
                        className="filter-select"
                        value={pendingFilters.reporting_currency}
                        onChange={e => setPendingFilters(f => ({ ...f, reporting_currency: e.target.value }))}
                    >
                        <option value="AED">AED (UAE Dirham)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="SAR">SAR (Saudi Riyal)</option>
                        <option value="QAR">QAR (Qatari Riyal)</option>
                        <option value="OMR">OMR (Omani Rial)</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="filter-label"><BarChart3 size={16} strokeWidth={2.5}/> View</div>
                    <select
                        className="filter-select"
                        value={pendingFilters.view_mode || 'Executive View'}
                        onChange={e => setPendingFilters(f => ({ ...f, view_mode: e.target.value }))}
                    >
                        <option value="Executive View">Executive View</option>
                        <option value="Operational View">Operational View</option>
                        <option value="Board View">Board View</option>
                    </select>
                </div>
                
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                    <button onClick={handleApplyFilters} style={{ background: '#273e6b', color: '#fff', border: 'none', padding: '0 16px', borderRadius: 6, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', height: 32, display: 'flex', alignItems: 'center', transition: 'background 0.2s', letterSpacing: '0.02em' }} onMouseEnter={e => e.currentTarget.style.background='#1e3054'} onMouseLeave={e => e.currentTarget.style.background='#273e6b'}>
                        Apply Filters
                    </button>
                    <button onClick={handleResetFilters} style={{ background: 'transparent', color: '#475569', border: 'none', padding: '0 8px', fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer', height: 32, display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='#1e293b'} onMouseLeave={e => e.currentTarget.style.color='#475569'}>
                        <RefreshCcw size={14} strokeWidth={2.5} /> Reset
                    </button>
                </div>
            </div>

            {/* 2. KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
                {displayKpis.map((kpi, idx) => (
                    <div key={idx} className="card" style={{ padding: '14px 14px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div className={`icon-box ${kpi.iconColor}`}>
                                <kpi.icon size={14} strokeWidth={2.5} />
                            </div>
                            <div className="kpi-title">{kpi.title}</div>
                        </div>

                        <div style={{ zIndex: 1 }}>
                            <div className="kpi-val">{kpi.value}</div>
                            <div className="kpi-change" style={{ color: kpi.isRed ? 'var(--clr-danger)' : 'var(--clr-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: '0.65rem' }}>{kpi.isPositive ? '▲' : '▼'}</span>
                                <span>{kpi.change}</span>
                                <span style={{ color: 'var(--clr-text-dim)', fontWeight: 500, fontSize: '0.6rem', marginLeft: 2 }}>vs prev</span>
                            </div>
                        </div>

                        <div style={{ position: 'absolute', bottom: 8, right: 0, width: '45%', height: 35, opacity: 0.9 }}>
                            <Sparkline data={kpi.sparklineData} colorClass={kpi.colorClass} />
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. CHARTS ROW */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {/* Trade Working Capital Trend */}
                <div className="card" style={{ flex: 2, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart3 size={16} color="var(--clr-primary)" /> Trade Working Capital Trend
                        </div>
                        <ChartMenu menuItems={[
                            { icon: Eye, label: 'View All', action: () => openViewAll('twc_viewall') },
                            { icon: TrendingUp, label: 'Month on Month Trend', action: () => openViewAll('twc_trend') },
                            { icon: FileText, label: 'Export Excel', action: () => { exportExecTwcExcel(appliedFilters).catch(e => console.error(e)); } },
                            { icon: Download, label: 'Export PDF', action: () => { exportExecTwcPdf(appliedFilters).catch(e => console.error(e)); } }
                        ]} />
                    </div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height={260} minWidth={0}>
                            <ComposedChart data={chartTwcData} margin={{ top: 20, right: 20, bottom: 0, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border-strong)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} dy={10} />
                                <YAxis label={{ value: 'AED Million', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: 'var(--clr-text-muted)', fontSize: 10} }} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, color: 'var(--clr-text-muted)', paddingTop: 10 }} iconType="square" iconSize={8} />
                                <Bar name="Trade Receivables" dataKey="tr" stackId="a" fill="var(--clr-primary)" barSize={20} />
                                <Bar name="Inventories" dataKey="inv" stackId="a" fill="var(--clr-cyan)" />
                                <Bar name="Trade Payables" dataKey="tp" stackId="a" fill="var(--clr-success)" radius={[3, 3, 0, 0]} />
                                <Line name="Trade Working Capital" type="monotone" dataKey="twc" stroke="var(--clr-text)" strokeWidth={2} dot={{ r: 4, fill: 'var(--clr-text)' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue by Region */}
                <div className="card" style={{ flex: 1.2, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Globe size={16} color="var(--clr-primary)" /> Revenue by Region
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-dim)', fontWeight: 600 }}>AED Million</span>
                            <ChartMenu menuItems={[
                                { icon: Eye, label: 'View All', action: () => openViewAll('rev_region') },
                                { icon: FileText, label: 'Export Excel', action: () => console.log('Exporting Revenue Excel...') },
                                { icon: Download, label: 'Export PDF', action: () => console.log('Exporting Revenue PDF...') }
                            ]} />
                        </div>
                    </div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height={260} minWidth={0}>
                            <BarChart layout="vertical" data={chartRevRegionData} margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--clr-border-strong)" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)', fontWeight: 600 }} width={50} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--clr-surface-2)'}} />
                                <Bar dataKey="value" fill="var(--clr-primary)" barSize={16} radius={[0, 4, 4, 0]}>
                                    {chartRevRegionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="var(--clr-primary)" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profitability by Region */}
                <div className="card" style={{ flex: 1.2, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart3 size={16} color="var(--clr-primary)" /> Profitability by Region
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-dim)', fontWeight: 600 }}>AED Million</span>
                            <ChartMenu menuItems={[
                                { icon: Eye, label: 'View All', action: () => openViewAll('profit_region') },
                                { icon: FileText, label: 'Export Excel', action: () => console.log('Exporting Profitability Excel...') },
                                { icon: Download, label: 'Export PDF', action: () => console.log('Exporting Profitability PDF...') }
                            ]} />
                        </div>
                    </div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height={260} minWidth={0}>
                            <BarChart data={chartProfitRegionData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border-strong)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--clr-surface-2)'}} />
                                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, color: 'var(--clr-text-muted)', paddingTop: 10 }} iconType="square" iconSize={8} />
                                <Bar name="Gross Profit" dataKey="gp" fill="var(--clr-primary)" barSize={14} radius={[3, 3, 0, 0]} />
                                <Bar name="Net Profit" dataKey="np" fill="var(--clr-success)" barSize={14} radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. TABLE */}
            <div className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} color="var(--clr-primary)" /> Key Financial Parameters
                    </div>
                    <div style={{ display: 'flex', background: 'var(--clr-surface-2)', borderRadius: 6, padding: 3, border: '1px solid var(--clr-border)' }}>
                        <button
                            onClick={() => setParamTableMode('values')}
                            style={{
                                background: paramTableMode === 'values' ? 'var(--clr-primary)' : 'transparent',
                                color: paramTableMode === 'values' ? '#fff' : 'var(--clr-text-muted)',
                                border: 'none', padding: '6px 16px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            Values
                        </button>
                        <button
                            onClick={() => setParamTableMode('ratios')}
                            style={{
                                background: paramTableMode === 'ratios' ? 'var(--clr-primary)' : 'transparent',
                                color: paramTableMode === 'ratios' ? '#fff' : 'var(--clr-text-muted)',
                                border: 'none', padding: '6px 16px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            Ratios / Days
                        </button>
                        <button
                            onClick={() => setParamTableMode('all')}
                            style={{
                                background: paramTableMode === 'all' ? 'var(--clr-primary)' : 'transparent',
                                color: paramTableMode === 'all' ? '#fff' : 'var(--clr-text-muted)',
                                border: 'none', padding: '6px 16px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            All
                        </button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th className="th-cell">Parameter</th>
                                <th className="th-cell">{dynamicHeaders.current}</th>
                                <th className="th-cell">{dynamicHeaders.prevMonth}</th>
                                <th className="th-cell">MoM Change</th>
                                <th className="th-cell">{dynamicHeaders.prevYear}</th>
                                <th className="th-cell">YoY Change</th>
                                <th className="th-cell" style={{ width: 100, textAlign: 'center' }}>Trend (12M)</th>
                                <th className="th-cell">Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredParamRows.map((row, idx) => (
                                <tr key={idx} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--clr-surface-2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                    <td className="td-cell" style={{ color: 'var(--clr-text)', fontWeight: 800 }}>{row.param}</td>
                                    <td className="td-cell" style={{ fontFamily: 'var(--font-mono)' }}>{row.m1}</td>
                                    <td className="td-cell" style={{ fontFamily: 'var(--font-mono)' }}>{row.m2}</td>
                                    <td className="td-cell" style={{ color: row.mom === '–' ? 'var(--clr-text-muted)' : (row.momPos ? 'var(--clr-success)' : 'var(--clr-danger)'), fontFamily: 'var(--font-mono)' }}>
                                        {row.mom !== '–' && <span style={{ fontSize: '0.65rem', marginRight: 4 }}>{row.momPos ? '▲' : '▼'}</span>}
                                        {row.mom}
                                    </td>
                                    <td className="td-cell" style={{ fontFamily: 'var(--font-mono)' }}>{row.m3}</td>
                                    <td className="td-cell" style={{ color: row.yoy === '–' ? 'var(--clr-text-muted)' : (row.yoyPos ? 'var(--clr-success)' : 'var(--clr-danger)'), fontFamily: 'var(--font-mono)' }}>
                                        {row.yoy !== '–' && <span style={{ fontSize: '0.65rem', marginRight: 4 }}>{row.yoyPos ? '▲' : '▼'}</span>}
                                        {row.yoy}
                                    </td>
                                    <td className="td-cell" style={{ width: 100, height: 40, padding: '4px 16px' }}>
                                        <Sparkline data={[10, 15, 12, 18, 16, 22, 20, 25, 23, 28, 26, 30]} colorClass="blue" />
                                    </td>
                                    <td className="td-cell" style={{ color: 'var(--clr-text-muted)', fontWeight: 500 }}>{row.comment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View All Modal */}
            <ExecDashboardViewAll
                isOpen={viewAll.open}
                onClose={closeViewAll}
                initialSection={viewAll.section}
                filters={{
                    as_on_date: appliedFilters.as_on_date || undefined,
                    legal_group_id: appliedFilters.legal_group_id || undefined,
                    legal_entity_id: appliedFilters.legal_entity_id || undefined,
                    parent_division_id: appliedFilters.parent_division_id || undefined,
                    subdivision_id: appliedFilters.subdivision_id || undefined,
                }}
                currency={currency}
            />
        </div>
    );
}
