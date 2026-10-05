import React, { useState, useRef, useEffect } from 'react';
import { 
    LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Area, AreaChart
} from 'recharts';
import { 
    BarChart3, RefreshCw, Layers, Wallet, Target, Landmark, Percent, PieChart, Coins, Briefcase, Calendar, MapPin, Building, Globe, RefreshCcw, FileText, ExternalLink, MoreVertical, Download, Eye, TrendingUp
} from 'lucide-react';
import ExecDashboardViewAll from '../components/ExecDashboardViewAll';

/* ----------------- COMPONENTS ----------------- */

const Sparkline = ({ data, colorClass }) => {
    const formattedData = data.map((val, i) => ({ index: i, value: val }));
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

    // ── Filter state (IDs passed to backend per handoff doc) ──
    const [filters, setFilters] = useState({
        as_on_date: '',        // e.g. "2026-09-25"
        period_type: 'PTD',    // PTD | YTD
        reporting_currency: 'AED',
        legal_group_id: null,
        legal_entity_id: null,
        parent_division_id: null,
        subdivision_id: null,
    });
    const [pendingFilters, setPendingFilters] = useState({ ...filters });
    const [appliedFilters, setAppliedFilters] = useState({ ...filters });
    const currency = appliedFilters.reporting_currency || 'AED';

    // ── KPI state ──
    const [kpiData, setKpiData] = useState(null);
    const [kpiLoading, setKpiLoading] = useState(false);
    const [kpiError, setKpiError] = useState(null);

    // ── TWC Trend state ──
    const [twcTrend, setTwcTrend] = useState([]);
    // ── Regional & Parameters state ──
    const [revRegionData, setRevRegionData] = useState([]);
    const [profitRegionDataState, setProfitRegionDataState] = useState([]);
    const [keyParamsState, setKeyParamsState] = useState(null);

    // ── Import API functions ──
    const { 
        getExecKpis, 
        getExecTwcTrend, 
        getExecRevenueByRegion, 
        getExecProfitabilityByRegion, 
        getExecKeyFinancialParameters 
    } = React.useMemo(() => {
        try {
            return require('../api/executiveDashboardApi');
        } catch {
            return { getExecKpis: null, getExecTwcTrend: null, getExecRevenueByRegion: null, getExecProfitabilityByRegion: null, getExecKeyFinancialParameters: null };
        }
    }, []);

    // ── Fetch KPIs on filter apply ──
    useEffect(() => {
        if (!getExecKpis) return;
        let cancelled = false;
        setKpiLoading(true);
        setKpiError(null);

        const apiFilters = {
            ...(appliedFilters.as_on_date ? { as_of_date: appliedFilters.as_on_date } : {}),
            period_type: appliedFilters.period_type || 'PTD',
            reporting_currency: appliedFilters.reporting_currency || 'AED',
            ...(appliedFilters.legal_group_id ? { legal_group_id: appliedFilters.legal_group_id } : {}),
            ...(appliedFilters.legal_entity_id ? { legal_entity_id: appliedFilters.legal_entity_id } : {}),
            ...(appliedFilters.parent_division_id ? { parent_division_id: appliedFilters.parent_division_id } : {}),
            ...(appliedFilters.subdivision_id ? { subdivision_id: appliedFilters.subdivision_id } : {}),
        };

        getExecKpis(apiFilters)
            .then(data => { if (!cancelled) setKpiData(data); })
            .catch(err => {
                if (!cancelled) {
                    console.error('[Exec KPIs]', err.response?.status, err.response?.data || err.message);
                    setKpiError(err);
                }
            })
            .finally(() => { if (!cancelled) setKpiLoading(false); });

        return () => { cancelled = true; };
    }, [appliedFilters, getExecKpis]);

    // ── Fetch TWC Trend on filter apply ──
    useEffect(() => {
        if (!getExecTwcTrend) return;
        let cancelled = false;
        setTwcLoading(true);

        const apiFilters = {
            months: 12,
            ...(appliedFilters.legal_group_id ? { legal_group_id: appliedFilters.legal_group_id } : {}),
            ...(appliedFilters.legal_entity_id ? { legal_entity_id: appliedFilters.legal_entity_id } : {}),
            ...(appliedFilters.parent_division_id ? { parent_division_id: appliedFilters.parent_division_id } : {}),
            ...(appliedFilters.subdivision_id ? { subdivision_id: appliedFilters.subdivision_id } : {}),
        };

        getExecTwcTrend(apiFilters)
            .then(data => {
                if (!cancelled) {
                    const rows = Array.isArray(data) ? data : data?.data ?? data?.results ?? [];
                    setTwcTrend(rows.map(r => ({
                        month: r.month_label ?? r.month ?? r.period_name ?? '',
                        tr: r.trade_receivables ?? 0,
                        inv: r.inventory ?? 0,
                        tp: r.trade_payables ?? 0,
                        twc: r.trade_working_capital ?? 0,
                    })));
                }
            })
            .catch(err => {
                if (!cancelled) console.error('[TWC Trend]', err.response?.status, err.response?.data || err.message);
            })
            .finally(() => { if (!cancelled) setTwcLoading(false); });

        return () => { cancelled = true; };
    }, [appliedFilters, getExecTwcTrend]);

    // ── Fetch Revenue by Region ──
    useEffect(() => {
        if (!getExecRevenueByRegion) return;
        let cancelled = false;
        getExecRevenueByRegion(appliedFilters)
            .then(data => {
                if (!cancelled) {
                    const rows = Array.isArray(data) ? data : data?.data ?? data?.results ?? [];
                    setRevRegionData(rows.map(r => ({
                        name: r.region ?? r.country ?? r.country_name ?? '',
                        value: Number(r.revenue ?? r.total_revenue ?? 0)
                    })));
                }
            })
            .catch(err => {
                if (!cancelled) console.error('[Revenue by Region API]', err.response?.status, err.response?.data || err.message);
            });
        return () => { cancelled = true; };
    }, [appliedFilters, getExecRevenueByRegion]);

    // ── Fetch Profitability by Region ──
    useEffect(() => {
        if (!getExecProfitabilityByRegion) return;
        let cancelled = false;
        getExecProfitabilityByRegion(appliedFilters)
            .then(data => {
                if (!cancelled) {
                    const rows = Array.isArray(data) ? data : data?.data ?? data?.results ?? [];
                    setProfitRegionDataState(rows.map(r => ({
                        name: r.region ?? r.country ?? r.country_name ?? '',
                        gp: Number(r.gross_profit ?? 0),
                        np: Number(r.net_profit ?? 0)
                    })));
                }
            })
            .catch(err => {
                if (!cancelled) console.error('[Profitability by Region API]', err.response?.status, err.response?.data || err.message);
            });
        return () => { cancelled = true; };
    }, [appliedFilters, getExecProfitabilityByRegion]);

    // ── Fetch Key Financial Parameters ──
    useEffect(() => {
        if (!getExecKeyFinancialParameters) return;
        let cancelled = false;
        getExecKeyFinancialParameters(appliedFilters)
            .then(data => {
                if (!cancelled) setKeyParamsState(data);
            })
            .catch(err => {
                if (!cancelled) console.error('[Key Financial Parameters API]', err.response?.status, err.response?.data || err.message);
            });
        return () => { cancelled = true; };
    }, [appliedFilters, getExecKeyFinancialParameters]);

    // ── KPI card config — values come from API, not hardcoded ──
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

    // Build display values from API or fallback to mock
    // Build display values from API — no static mock fallbacks
    const displayKpis = KPI_CONFIG.map(cfg => {
        const apiVal = kpiData ? (kpiData[cfg.key] ?? kpiData?.kpis?.[cfg.key]) : undefined;
        const apiChange = kpiData ? (kpiData[`${cfg.key}_change`] ?? kpiData[`${cfg.key}_mom_change`]) : undefined;
        const apiSpark = kpiData ? (kpiData[`${cfg.key}_sparkline`] ?? kpiData?.sparklines?.[cfg.key]) : undefined;
        // Format value — null stays '–', 0 stays '0.00'
        let displayVal = '–';
        if (apiVal !== null && apiVal !== undefined) {
            const n = Number(apiVal);
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
        const changeVal = apiChange !== null && apiChange !== undefined
            ? `${Number(apiChange) >= 0 ? '+' : ''}${Number(apiChange).toFixed(1)}%`
            : '–';
        const sparkData = Array.isArray(apiSpark) ? apiSpark : [0];
        return { ...cfg, value: displayVal, change: changeVal, isPositive: !apiChange || Number(apiChange) >= 0, sparklineData: sparkData };
    });

    const openViewAll = (section) => setViewAll({ open: true, section });
    const closeViewAll = () => setViewAll(v => ({ ...v, open: false }));
    const handleApplyFilters = () => setAppliedFilters({ ...pendingFilters });
    const handleResetFilters = () => {
        const reset = { as_on_date: '', period_type: 'PTD', reporting_currency: 'AED', legal_group_id: null, legal_entity_id: null, parent_division_id: null, subdivision_id: null };
        setPendingFilters(reset);
        setAppliedFilters(reset);
    };

    // Live API chart data
    const chartTwcData = twcTrend;
    const chartRevRegionData = revRegionData;
    const chartProfitRegionData = profitRegionDataState;

    // Build Key Financial Parameters table directly from backend API response (null → '-', 0 → 0.00)
    const displayParamTableData = React.useMemo(() => {
        if (!keyParamsState) return [];
        const rawRows = Array.isArray(keyParamsState) ? keyParamsState : keyParamsState?.data ?? keyParamsState?.results ?? [];

        return rawRows.map(item => {
            const formatVal = (v, isRatio = false) => {
                if (v === null || v === undefined) return '–';
                const n = Number(v);
                if (isNaN(n)) return '–';
                if (isRatio) return n.toFixed(2);
                if (Math.abs(n) >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(1)}M`;
                if (Math.abs(n) >= 1_000) return `${currency} ${(n / 1_000).toFixed(0)}K`;
                return `${currency} ${n.toFixed(2)}`;
            };

            const momVal = item.mom_change ?? item.mom;
            const yoyVal = item.yoy_change ?? item.yoy;

            return {
                param: item.parameter_name ?? item.param ?? item.name ?? '–',
                m1: formatVal(item.current_period ?? item.m1, item.is_ratio),
                m2: formatVal(item.prev_period ?? item.m2, item.is_ratio),
                mom: momVal !== null && momVal !== undefined ? `${Number(momVal) >= 0 ? '+' : ''}${Number(momVal).toFixed(1)}%` : '–',
                m3: formatVal(item.prev_year_period ?? item.m3, item.is_ratio),
                yoy: yoyVal !== null && yoyVal !== undefined ? `${Number(yoyVal) >= 0 ? '+' : ''}${Number(yoyVal).toFixed(1)}%` : '–',
                momPos: momVal === null || momVal === undefined || Number(momVal) >= 0,
                yoyPos: yoyVal === null || yoyVal === undefined || Number(yoyVal) >= 0,
                comment: item.comment ?? item.remarks ?? ''
            };
        });
    }, [keyParamsState, currency]);

    return (
        <div style={{ padding: '20px 24px', background: 'var(--clr-bg)', minHeight: '100vh' }}>
            <style>{`
                .filter-label {
                    font-size: 0.78rem; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;
                }
                .filter-select {
                    padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.75rem; color: #334155; background: #fff; outline: none; font-weight: 600; cursor: pointer; transition: border-color 0.2s;
                }
                .filter-select:hover {
                    border-color: #cbd5e1;
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
                    <select className="filter-select" defaultValue="Mar 2025"><option>Mar 2025</option></select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="filter-label"><MapPin size={16} strokeWidth={2.5}/> Region</div>
                    <select className="filter-select" defaultValue="All Regions"><option>All Regions</option></select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="filter-label"><Building size={16} strokeWidth={2.5}/> Legal Entity</div>
                    <select className="filter-select" defaultValue="All Entities"><option>All Entities</option></select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="filter-label"><Coins size={16} strokeWidth={2.5}/> Currency</div>
                    <select className="filter-select" defaultValue="AED"><option>AED (UAE Dirham)</option></select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="filter-label"><BarChart3 size={16} strokeWidth={2.5}/> View</div>
                    <select className="filter-select" defaultValue="Executive View"><option>Executive View</option></select>
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

            {/* 2. KPI CARDS — values from backend API */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
                {displayKpis.map((kpi, idx) => (
                    <div key={idx} className="card" style={{ padding: '14px 14px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {/* Title Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div className={`icon-box ${kpi.iconColor}`}>
                                <kpi.icon size={14} strokeWidth={2.5} />
                            </div>
                            <div className="kpi-title">{kpi.title}</div>
                        </div>

                        {/* Value & Change */}
                        <div style={{ zIndex: 1 }}>
                            {kpiLoading
                                ? <div style={{ height: 24, width: '70%', borderRadius: 4, background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                                : <div className="kpi-val">{kpi.value}</div>
                            }
                            <div className="kpi-change" style={{ color: kpi.isRed ? 'var(--clr-danger)' : 'var(--clr-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: '0.65rem' }}>{kpi.isPositive ? '▲' : '▼'}</span>
                                <span>{kpi.change}</span>
                                <span style={{ color: 'var(--clr-text-dim)', fontWeight: 500, fontSize: '0.6rem', marginLeft: 2 }}>vs prev</span>
                            </div>
                        </div>

                        {/* Sparkline overlay right-bottom */}
                        <div style={{ position: 'absolute', bottom: 8, right: 0, width: '45%', height: 35, opacity: 0.9 }}>
                            <Sparkline data={kpi.sparklineData} colorClass={kpi.colorClass} />
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. CHARTS ROW */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {/* Trade Working Capital Trend — data from backend */}
                <div className="card" style={{ flex: 2, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart3 size={16} color="var(--clr-primary)" /> Trade Working Capital Trend
                        </div>
                        <ChartMenu menuItems={[
                            { icon: Eye, label: 'View All', action: () => openViewAll('twc_viewall') },
                            { icon: TrendingUp, label: 'Month on Month Trend', action: () => openViewAll('twc_trend') },
                            { icon: FileText, label: 'Export Excel', action: () => { const { exportExecTwcExcel } = require('../api/executiveDashboardApi'); exportExecTwcExcel(appliedFilters).catch(e => console.error(e)); } },
                            { icon: Download, label: 'Export PDF', action: () => { const { exportExecTwcPdf } = require('../api/executiveDashboardApi'); exportExecTwcPdf(appliedFilters).catch(e => console.error(e)); } }
                        ]} />
                    </div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
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
                        <ResponsiveContainer width="100%" height="100%">
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
                        <ResponsiveContainer width="100%" height="100%">
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
                        <button style={{ background: 'var(--clr-primary)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Values</button>
                        <button style={{ background: 'transparent', color: 'var(--clr-text-muted)', border: 'none', padding: '6px 16px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Ratios / Days</button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th className="th-cell">Parameter</th>
                                <th className="th-cell">Mar 2025</th>
                                <th className="th-cell">Feb 2025</th>
                                <th className="th-cell">MoM Change</th>
                                <th className="th-cell">Mar 2024</th>
                                <th className="th-cell">YoY Change</th>
                                <th className="th-cell" style={{ width: 100, textAlign: 'center' }}>Trend (12M)</th>
                                <th className="th-cell">Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayParamTableData.map((row, idx) => (
                                <tr key={idx} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--clr-surface-2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                    <td className="td-cell" style={{ color: 'var(--clr-text)', fontWeight: 800 }}>{row.param}</td>
                                    <td className="td-cell" style={{ fontFamily: 'var(--font-mono)' }}>{row.m1}</td>
                                    <td className="td-cell" style={{ fontFamily: 'var(--font-mono)' }}>{row.m2}</td>
                                    <td className="td-cell" style={{ color: row.momRed ? 'var(--clr-danger)' : 'var(--clr-success)', fontFamily: 'var(--font-mono)' }}>
                                        {row.momPos ? '?' : '?'} {row.mom}
                                    </td>
                                    <td className="td-cell" style={{ fontFamily: 'var(--font-mono)' }}>{row.m3}</td>
                                    <td className="td-cell" style={{ color: row.yoyRed ? 'var(--clr-danger)' : 'var(--clr-success)', fontFamily: 'var(--font-mono)' }}>
                                        {row.yoyPos ? '?' : '?'} {row.yoy}
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
