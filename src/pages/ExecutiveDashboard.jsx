import React, { useState, useRef, useEffect } from 'react';
import { 
    LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Area, AreaChart
} from 'recharts';
import { 
    BarChart3, RefreshCw, Layers, Wallet, Target, Landmark, Percent, PieChart, Coins, Briefcase, Calendar, MapPin, Building, Globe, RefreshCcw, FileText, ExternalLink, MoreVertical, Download, Eye, TrendingUp
} from 'lucide-react';
import ExecDashboardViewAll from '../components/ExecDashboardViewAll';
import PLComparisonCard from '../components/Charts/PLComparisonCard';
import Filters from '../components/Filters/Filters';
import { getOpexFilterOptions } from '../api/opexApi';
import { fetchPLComparison } from '../services/plApi';
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

function useInView(options = {}) {
    const { threshold = 0.2, triggerOnce = true } = options;
    const [inView, setInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (triggerOnce) {
                        observer.unobserve(entry.target);
                    }
                } else if (!triggerOnce) {
                    setInView(false);
                }
            },
            { threshold }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, triggerOnce]);

    return { ref, inView };
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

/* ─── P&L Comparison-Style Profitability by Region Chart Component ─── */
function ProfitabilityRegionChart({ data = [], currency = 'AED' }) {
    const { ref: chartContainerRef, inView: chartInView } = useInView({ threshold: 0.2, triggerOnce: true });
    const [hiddenSeries, setHiddenSeries] = useState(new Set());
    const [hoveredSeries, setHoveredSeries] = useState(null);
    const [hoveredRegionIndex, setHoveredRegionIndex] = useState(null);

    const chartData = React.useMemo(() => {
        if (Array.isArray(data) && data.length > 0) return data;
        return [
            { name: 'UAE', gp: 45.2, np: 18.5 },
            { name: 'Qatar', gp: 22.8, np: 8.4 },
            { name: 'Oman', gp: 15.4, np: 5.1 },
            { name: 'KSA', gp: 32.1, np: 12.8 }
        ];
    }, [data]);

    const toggleSeries = (key) => {
        setHiddenSeries(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const isGpHidden = hiddenSeries.has('gp');
    const isNpHidden = hiddenSeries.has('np');

    const totalGp = React.useMemo(() => chartData.reduce((acc, curr) => acc + (Number(curr.gp) || 0), 0), [chartData]);
    const totalNp = React.useMemo(() => chartData.reduce((acc, curr) => acc + (Number(curr.np) || 0), 0), [chartData]);

    const CustomRegionTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;
        const row = payload[0]?.payload || {};
        const gpVal = Number(row.gp || 0);
        const npVal = Number(row.np || 0);
        const marginPct = gpVal > 0 ? ((npVal / gpVal) * 100).toFixed(1) : null;

        return (
            <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '10px 14px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                fontSize: '0.75rem',
                minWidth: 170
            }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{label}</span>
                    {marginPct !== null && (
                        <span style={{
                            background: '#ecfdf5',
                            color: '#059669',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            border: '1px solid #a7f3d0'
                        }}>
                            {marginPct}% margin
                        </span>
                    )}
                </div>

                {!isGpHidden && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontWeight: 600 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #38BDF8)' }} />
                            <span>Gross Profit:</span>
                        </div>
                        <span style={{ fontWeight: 800, color: '#1e293b' }}>{currency} {gpVal.toFixed(1)}M</span>
                    </div>
                )}

                {!isNpHidden && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontWeight: 600 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10B981)' }} />
                            <span>Net Profit:</span>
                        </div>
                        <span style={{ fontWeight: 800, color: '#1e293b' }}>{currency} {npVal.toFixed(1)}M</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div ref={chartContainerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {/* P&L Comparison Style Interactive Legend Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <button
                    onClick={() => toggleSeries('gp')}
                    onMouseEnter={() => setHoveredSeries('gp')}
                    onMouseLeave={() => setHoveredSeries(null)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: isGpHidden ? '#f1f5f9' : '#eff6ff',
                        border: `1px solid ${isGpHidden ? '#cbd5e1' : '#bfdbfe'}`,
                        borderRadius: 6, padding: '3px 9px', cursor: 'pointer',
                        opacity: isGpHidden ? 0.5 : (hoveredSeries && hoveredSeries !== 'gp' ? 0.6 : 1),
                        transition: 'all 0.15s'
                    }}
                >
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'linear-gradient(135deg, #38BDF8, #2563EB)' }} />
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1e40af' }}>Gross Profit</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563eb', marginLeft: 2 }}>{currency} {totalGp.toFixed(1)}M</span>
                </button>

                <button
                    onClick={() => toggleSeries('np')}
                    onMouseEnter={() => setHoveredSeries('np')}
                    onMouseLeave={() => setHoveredSeries(null)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: isNpHidden ? '#f1f5f9' : '#ecfdf5',
                        border: `1px solid ${isNpHidden ? '#cbd5e1' : '#a7f3d0'}`,
                        borderRadius: 6, padding: '3px 9px', cursor: 'pointer',
                        opacity: isNpHidden ? 0.5 : (hoveredSeries && hoveredSeries !== 'np' ? 0.6 : 1),
                        transition: 'all 0.15s'
                    }}
                >
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: 'linear-gradient(135deg, #10B981, #059669)' }} />
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#065f46' }}>Net Profit</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#059669', marginLeft: 2 }}>{currency} {totalNp.toFixed(1)}M</span>
                </button>
            </div>

            {/* P&L Comparison Style Dual Gradient Bar Chart */}
            <div style={{ flex: 1, minHeight: 220 }}>
                <ResponsiveContainer width="100%" height={220} minWidth={0}>
                    <BarChart 
                        data={chartData} 
                        margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                        onMouseMove={(state) => {
                            if (state && state.activeTooltipIndex !== undefined) {
                                setHoveredRegionIndex(state.activeTooltipIndex);
                            }
                        }}
                        onMouseLeave={() => setHoveredRegionIndex(null)}
                    >
                        <defs>
                            <linearGradient id="gpGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#38BDF8" stopOpacity={1} />
                                <stop offset="100%" stopColor="#2563EB" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="npGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                                <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip content={<CustomRegionTooltip />} cursor={{ fill: 'rgba(241,245,249,0.6)', rx: 4 }} wrapperStyle={{ outline: 'none', transition: 'transform 150ms ease-out' }} />

                        {!isGpHidden && (
                            <Bar
                                name="Gross Profit"
                                dataKey="gp"
                                fill="url(#gpGrad)"
                                barSize={16}
                                radius={[5, 5, 0, 0]}
                                isAnimationActive={chartInView}
                                animationDuration={800}
                                animationEasing="ease-out"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`gp-cell-${index}`} 
                                        fill="url(#gpGrad)" 
                                        opacity={
                                            (hoveredSeries && hoveredSeries !== 'gp') 
                                                ? 0.35 
                                                : (hoveredRegionIndex !== null && hoveredRegionIndex !== index ? 0.35 : 1)
                                        }
                                        style={{ transition: 'opacity 200ms ease-in-out' }}
                                    />
                                ))}
                            </Bar>
                        )}

                        {!isNpHidden && (
                            <Bar
                                name="Net Profit"
                                dataKey="np"
                                fill="url(#npGrad)"
                                barSize={16}
                                radius={[5, 5, 0, 0]}
                                isAnimationActive={chartInView}
                                animationBegin={300}
                                animationDuration={800}
                                animationEasing="ease-out"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`np-cell-${index}`} 
                                        fill="url(#npGrad)" 
                                        opacity={
                                            (hoveredSeries && hoveredSeries !== 'np') 
                                                ? 0.35 
                                                : (hoveredRegionIndex !== null && hoveredRegionIndex !== index ? 0.35 : 1)
                                        }
                                        style={{ transition: 'opacity 200ms ease-in-out' }}
                                    />
                                ))}
                            </Bar>
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default function ExecutiveDashboard() {
    const { ref: twcChartRef, inView: twcInView } = useInView({ threshold: 0.2, triggerOnce: true });
    const { ref: revRegionChartRef, inView: revRegionInView } = useInView({ threshold: 0.2, triggerOnce: true });
    const [hoveredTwcIndex, setHoveredTwcIndex] = useState(null);
    const [hoveredRevIndex, setHoveredRevIndex] = useState(null);
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
    });
    const [appliedFilters, setAppliedFilters] = useState({ ...filters });
    const [filterOptions, setFilterOptions] = useState({});
    const currency = appliedFilters.reporting_currency || 'AED';

    // ── Load standard FinSight filter options ──
    useEffect(() => {
        let isMounted = true;
        getOpexFilterOptions()
            .then((res) => {
                if (isMounted && res) setFilterOptions(res);
            })
            .catch((err) => console.error('[ExecutiveDashboard] getOpexFilterOptions error:', err));
        return () => { isMounted = false; };
    }, []);

    const handleApplyFilters = (applied) => {
        let dateVal = '2026-09-25';
        if (applied && applied.period) {
            const pStr = Array.isArray(applied.period) ? applied.period[applied.period.length - 1] : applied.period;
            if (pStr) {
                if (String(pStr).match(/^\d{4}-\d{2}-\d{2}$/)) {
                    dateVal = String(pStr);
                } else {
                    const parts = String(pStr).split(' ');
                    const mIdx = MONTHS_SHORT.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
                    if (mIdx !== -1) {
                        const yr = parts[1] || applied.year || '2026';
                        const moStr = String(mIdx + 1).padStart(2, '0');
                        dateVal = `${yr}-${moStr}-25`;
                    }
                }
            }
        }

        const newFilterState = {
            as_of_date: dateVal,
            as_on_date: dateVal,
            period_type: 'PTD',
            reporting_currency: applied?.reporting_currency || 'AED',
            legal_group_id: Array.isArray(applied?.legal_group) && applied.legal_group.length ? applied.legal_group : null,
            legal_entity_id: Array.isArray(applied?.legal_entity) && applied.legal_entity.length ? applied.legal_entity : null,
            parent_division_id: Array.isArray(applied?.parent_division) && applied.parent_division.length ? applied.parent_division : null,
            subdivision_id: Array.isArray(applied?.subdivision) && applied.subdivision.length ? applied.subdivision : null,
        };

        setFilters(newFilterState);
        setAppliedFilters(newFilterState);
    };

    const handleResetFilters = () => {
        const defaultState = {
            as_of_date: '2026-09-25',
            as_on_date: '2026-09-25',
            period_type: 'PTD',
            reporting_currency: 'AED',
            legal_group_id: null,
            legal_entity_id: null,
            parent_division_id: null,
            subdivision_id: null,
        };
        setFilters(defaultState);
        setAppliedFilters(defaultState);
    };

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
    const [paramParentDiv, setParamParentDiv] = useState('All');
    const [paramPeriod, setParamPeriod] = useState('Current Period');

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
        { key: 'total_revenue',               title: 'Total Revenue',                  icon: BarChart3, cardBg: '#f0f5ff', iconBg: '#dbeafe', accent: '#2563eb', colorClass: 'blue', isRed: false },
        { key: 'cost_of_material',            title: 'Cost of Material',               icon: Coins,     cardBg: '#fff1f2', iconBg: '#ffe4e6', accent: '#e11d48', colorClass: 'red',  isRed: true },
        { key: 'gross_profit',                title: 'Gross Profit',                   icon: TrendingUp,cardBg: '#f0fdf4', iconBg: '#dcfce7', accent: '#16a34a', colorClass: 'green', isRed: false },
        { key: 'ebitda',                      title: 'EBITDA',                         icon: Briefcase, cardBg: '#faf5ff', iconBg: '#ede9fe', accent: '#7c3aed', colorClass: 'blue', isRed: false },
        { key: 'net_profit',                  title: 'Net Profit',                     icon: Coins,     cardBg: '#ecfdf5', iconBg: '#d1fae5', accent: '#059669', colorClass: 'green', isRed: false },
        { key: 'trade_working_capital',       title: 'Trade Working Capital',          icon: RefreshCw, cardBg: '#fff7ed', iconBg: '#ffedd5', accent: '#ea580c', colorClass: 'red',  isRed: true },
        { key: 'overdue_receivables',         title: 'Overdue Receivables',            icon: Wallet,    cardBg: '#fff1f2', iconBg: '#ffe4e6', accent: '#dc2626', colorClass: 'red',  isRed: true },
        { key: 'slow_moving_obsolete_stock',  title: 'Slow Moving & Obsolete Stock',   icon: Layers,    cardBg: '#fffbeb', iconBg: '#fef3c7', accent: '#d97706', colorClass: 'green', isRed: false },
        { key: 'cash_collection',             title: 'Cash Collection',                icon: Wallet,    cardBg: '#ecfeff', iconBg: '#cffafe', accent: '#0891b2', colorClass: 'blue', isRed: false },
        { key: 'collection_efficiency',       title: 'Collection Efficiency',          icon: Target,    cardBg: '#f0f5ff', iconBg: '#dbeafe', accent: '#2563eb', colorClass: 'blue', isRed: false, isPct: true },
        { key: 'total_short_term_borrowing',  title: 'Total Short Term Borrowing',     icon: Landmark,  cardBg: '#fff7ed', iconBg: '#ffedd5', accent: '#ea580c', colorClass: 'red',  isRed: true },
        { key: 'roi',                         title: 'ROI %',                          icon: Percent,   cardBg: '#ecfdf5', iconBg: '#d1fae5', accent: '#059669', colorClass: 'green', isRed: false, isPct: true },
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
        <div style={{ background: 'var(--clr-bg)', paddingBottom: 24 }}>
            <style>{`
                .filter-label {
                    font-size: 0.76rem; font-weight: 700; color: #1e3a8a; display: flex; align-items: center; gap: 5px; white-space: nowrap;
                }
                .filter-select {
                    padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.78rem; color: #334155; background: #fff; outline: none; font-weight: 600; cursor: pointer; transition: all 0.15s; height: 34px; box-sizing: border-box;
                }
                .filter-select:hover {
                    border-color: #2563eb;
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
                    padding: 12px 16px; text-align: left; color: var(--clr-text-muted); font-weight: 700; font-size: 0.75rem; border-bottom: 2px solid var(--clr-border); white-space: nowrap; font-family: var(--font-sans); text-transform: uppercase; letter-spacing: 0.03em;
                }
                .td-cell {
                    padding: 12px 16px; color: var(--clr-text); font-weight: 600; font-size: 0.8rem; border-bottom: 1px solid var(--clr-border); font-family: var(--font-sans);
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
            
            {/* 1. STANDARD FINSIGHT FILTER BAR */}
            <Filters
                filterOptions={filterOptions}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />

            {/* 2. KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
                {displayKpis.map((kpi, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: kpi.cardBg || '#fff',
                            borderRadius: 12,
                            border: '1px solid rgba(15,23,42,0.05)',
                            boxShadow: '0 2px 6px rgba(15,23,42,0.03)',
                            padding: '12px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: 74,
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'default',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 8px 20px ${kpi.accent}20`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(15,23,42,0.03)';
                        }}
                    >
                        {/* Rounded Icon Square */}
                        <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: kpi.iconBg || '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: kpi.accent || '#2563eb'
                        }}>
                            <kpi.icon size={18} strokeWidth={2.3} />
                        </div>

                        {/* Title, Value & Trend */}
                        <div style={{ minWidth: 0, flex: 1, zIndex: 1 }}>
                            <div style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: '#1e3a8a',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {kpi.title}
                            </div>
                            <div style={{
                                fontSize: '1.12rem',
                                fontWeight: 800,
                                color: '#0f172a',
                                lineHeight: 1.05,
                                letterSpacing: '-0.025em',
                                marginTop: 4,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {kpi.value}
                            </div>
                            {kpi.change !== '–' && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    marginTop: 4,
                                    color: kpi.isRed ? '#dc2626' : '#16a34a',
                                    fontSize: '0.6rem',
                                    fontWeight: 700
                                }}>
                                    <span>{kpi.isPositive ? '▲' : '▼'} {kpi.change}</span>
                                    <small style={{ color: '#94a3b8', fontSize: '0.55rem', fontWeight: 600 }}>vs. last month</small>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. CHARTS ROW */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {/* Trade Working Capital Trend */}
                <div ref={twcChartRef} className="card" style={{ flex: 2, padding: 18 }}>
                    <style>{`
                        @keyframes twcBeaconPulse {
                            0% { r: 5px; opacity: 0.95; stroke-width: 2px; }
                            50% { r: 11px; opacity: 0.4; stroke-width: 1.5px; }
                            100% { r: 17px; opacity: 0; stroke-width: 0.5px; }
                        }
                        @keyframes twcWavePulse {
                            0%, 100% { transform: scale(1); opacity: 0.85; }
                            50% { transform: scale(1.35); opacity: 1; filter: drop-shadow(0 0 3px rgba(37, 99, 235, 0.6)); }
                        }
                        @keyframes twcLineShimmer {
                            0%, 100% { stroke-opacity: 0.85; filter: drop-shadow(0 1px 2px rgba(15, 23, 42, 0.15)); }
                            50% { stroke-opacity: 1; filter: drop-shadow(0 2px 5px rgba(37, 99, 235, 0.45)); }
                        }
                    `}</style>
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
                            <ComposedChart 
                                data={chartTwcData} 
                                margin={{ top: 20, right: 20, bottom: 0, left: -10 }}
                                onMouseMove={(state) => {
                                    if (state && state.activeTooltipIndex !== undefined) {
                                        setHoveredTwcIndex(state.activeTooltipIndex);
                                    }
                                }}
                                onMouseLeave={() => setHoveredTwcIndex(null)}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border-strong)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} dy={10} />
                                <YAxis label={{ value: 'AED Million', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: 'var(--clr-text-muted)', fontSize: 10} }} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.5)', rx: 4 }} wrapperStyle={{ outline: 'none', transition: 'transform 150ms ease-out' }} />
                                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, color: 'var(--clr-text-muted)', paddingTop: 10 }} iconType="square" iconSize={8} />
                                <Bar 
                                    name="Trade Receivables" 
                                    dataKey="tr" 
                                    stackId="a" 
                                    fill="var(--clr-primary)" 
                                    barSize={20}
                                    isAnimationActive={twcInView}
                                    animationDuration={1200}
                                    animationEasing="ease-out"
                                >
                                    {chartTwcData.map((entry, index) => (
                                        <Cell 
                                            key={`tr-cell-${index}`} 
                                            fill="var(--clr-primary)" 
                                            opacity={hoveredTwcIndex === null || hoveredTwcIndex === index ? 1 : 0.4}
                                            style={{ transition: 'opacity 200ms ease-in-out' }}
                                        />
                                    ))}
                                </Bar>
                                <Bar 
                                    name="Inventories" 
                                    dataKey="inv" 
                                    stackId="a" 
                                    fill="var(--clr-cyan)"
                                    isAnimationActive={twcInView}
                                    animationDuration={1200}
                                    animationEasing="ease-out"
                                >
                                    {chartTwcData.map((entry, index) => (
                                        <Cell 
                                            key={`inv-cell-${index}`} 
                                            fill="var(--clr-cyan)" 
                                            opacity={hoveredTwcIndex === null || hoveredTwcIndex === index ? 1 : 0.4}
                                            style={{ transition: 'opacity 200ms ease-in-out' }}
                                        />
                                    ))}
                                </Bar>
                                <Bar 
                                    name="Trade Payables" 
                                    dataKey="tp" 
                                    stackId="a" 
                                    fill="var(--clr-success)" 
                                    radius={[3, 3, 0, 0]}
                                    isAnimationActive={twcInView}
                                    animationDuration={1200}
                                    animationEasing="ease-out"
                                >
                                    {chartTwcData.map((entry, index) => (
                                        <Cell 
                                            key={`tp-cell-${index}`} 
                                            fill="var(--clr-success)" 
                                            opacity={hoveredTwcIndex === null || hoveredTwcIndex === index ? 1 : 0.4}
                                            style={{ transition: 'opacity 200ms ease-in-out' }}
                                        />
                                    ))}
                                </Bar>
                                <Line 
                                    name="Trade Working Capital" 
                                    type="monotone" 
                                    dataKey="twc" 
                                    stroke="var(--clr-text)" 
                                    strokeWidth={2} 
                                    dot={(props) => {
                                        const { cx, cy, index } = props;
                                        if (cx === undefined || cy === undefined || isNaN(cx) || isNaN(cy)) return null;
                                        const isLast = index === (chartTwcData.length - 1);
                                        return (
                                            <g key={`twc-animated-dot-${index}`}>
                                                {isLast && (
                                                    <circle
                                                        cx={cx}
                                                        cy={cy}
                                                        r={6}
                                                        fill="none"
                                                        stroke="#2563eb"
                                                        strokeWidth={1.5}
                                                        style={{
                                                            animation: 'twcBeaconPulse 2.2s cubic-bezier(0, 0.2, 0.8, 1) infinite',
                                                            transformOrigin: `${cx}px ${cy}px`,
                                                            transformBox: 'fill-box'
                                                        }}
                                                    />
                                                )}
                                                <circle
                                                    cx={cx}
                                                    cy={cy}
                                                    r={isLast ? 4.5 : 3.5}
                                                    fill={isLast ? '#2563eb' : 'var(--clr-text)'}
                                                    stroke="#ffffff"
                                                    strokeWidth={1.5}
                                                    style={{
                                                        animation: 'twcWavePulse 3s ease-in-out infinite',
                                                        animationDelay: `${index * 0.25}s`,
                                                        transformOrigin: `${cx}px ${cy}px`,
                                                        transformBox: 'fill-box'
                                                    }}
                                                />
                                            </g>
                                        );
                                    }}
                                    activeDot={{ r: 6.5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                                    isAnimationActive={twcInView}
                                    animationBegin={1000}
                                    animationDuration={1500}
                                    animationEasing="ease-in-out"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue by Region */}
                <div ref={revRegionChartRef} className="card" style={{ flex: 1.2, padding: 18 }}>
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
                            <BarChart 
                                layout="vertical" 
                                data={chartRevRegionData} 
                                margin={{ top: 0, right: 30, bottom: 0, left: 0 }}
                                onMouseMove={(state) => {
                                    if (state && state.activeTooltipIndex !== undefined) {
                                        setHoveredRevIndex(state.activeTooltipIndex);
                                    }
                                }}
                                onMouseLeave={() => setHoveredRevIndex(null)}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--clr-border-strong)" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)', fontWeight: 600 }} width={50} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.06)', rx: 4 }} wrapperStyle={{ outline: 'none', transition: 'transform 150ms ease-out' }} />
                                <Bar 
                                    dataKey="value" 
                                    fill="var(--clr-primary)" 
                                    barSize={16} 
                                    radius={[0, 4, 4, 0]}
                                    isAnimationActive={revRegionInView}
                                    animationDuration={1000}
                                    animationEasing="ease-out"
                                >
                                    {chartRevRegionData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill="var(--clr-primary)" 
                                            opacity={hoveredRevIndex === null || hoveredRevIndex === index ? 1 : 0.35}
                                            style={{ transition: 'opacity 200ms ease-in-out' }}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profitability by Region (with P&L Comparison interactive features) */}
                <div className="card" style={{ flex: 1.2, padding: 18, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ paddingRight: 32 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BarChart3 size={16} color="var(--clr-primary)" /> Profitability by Region
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', marginTop: 2, fontWeight: 600 }}>
                                Gross Profit vs Net Profit across operating regions ({currency})
                            </div>
                        </div>

                        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                            <ChartMenu menuItems={[
                                { icon: Eye, label: 'View All', action: () => openViewAll('profit_region') },
                                { icon: FileText, label: 'Export Excel', action: () => console.log('Exporting Profitability Excel...') },
                                { icon: Download, label: 'Export PDF', action: () => console.log('Exporting Profitability PDF...') }
                            ]} />
                        </div>
                    </div>

                    <div style={{ flex: 1, minHeight: 260 }}>
                        <ProfitabilityRegionChart data={chartProfitRegionData} currency={currency} />
                    </div>
                </div>
            </div>

            {/* 4. TABLE */}
            <div className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} color="var(--clr-primary)" /> Key Financial Parameters
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-text-muted)' }}>Parent Div:</span>
                            <select
                                value={paramParentDiv}
                                onChange={e => setParamParentDiv(e.target.value)}
                                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--clr-border)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-text)', background: 'var(--clr-surface)', cursor: 'pointer' }}
                            >
                                <option value="All">All Parent Divisions</option>
                                {(filterOptions.parentDivisions || filterOptions.parent_divisions || []).map(pd => {
                                    const val = typeof pd === 'object' ? (pd.id || pd.value || pd.name) : pd;
                                    const label = typeof pd === 'object' ? (pd.name || pd.label || val) : pd;
                                    return <option key={val} value={val}>{label}</option>;
                                })}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-text-muted)' }}>Period:</span>
                            <select
                                value={paramPeriod}
                                onChange={e => setParamPeriod(e.target.value)}
                                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--clr-border)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-text)', background: 'var(--clr-surface)', cursor: 'pointer' }}
                            >
                                <option value="Current Period">Current Period (PTD)</option>
                                <option value="YTD">YTD</option>
                                <option value="QTD">QTD</option>
                                <option value="Full Year">Full Year</option>
                            </select>
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
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
                        <thead>
                            <tr>
                                <th className="th-cell">Parameter</th>
                                <th className="th-cell">{dynamicHeaders.current}</th>
                                <th className="th-cell">{dynamicHeaders.prevMonth}</th>
                                <th className="th-cell">MoM Change</th>
                                <th className="th-cell">{dynamicHeaders.prevYear}</th>
                                <th className="th-cell">YoY Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredParamRows.map((row, idx) => (
                                <tr key={idx} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--clr-surface-2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                    <td className="td-cell" style={{ color: 'var(--clr-text)', fontWeight: 700 }}>{row.param}</td>
                                    <td className="td-cell">{row.m1}</td>
                                    <td className="td-cell">{row.m2}</td>
                                    <td className="td-cell" style={{ color: row.mom === '–' ? 'var(--clr-text-muted)' : (row.momPos ? 'var(--clr-success)' : 'var(--clr-danger)') }}>
                                        {row.mom !== '–' && <span style={{ fontSize: '0.65rem', marginRight: 4 }}>{row.momPos ? '▲' : '▼'}</span>}
                                        {row.mom}
                                    </td>
                                    <td className="td-cell">{row.m3}</td>
                                    <td className="td-cell" style={{ color: row.yoy === '–' ? 'var(--clr-text-muted)' : (row.yoyPos ? 'var(--clr-success)' : 'var(--clr-danger)') }}>
                                        {row.yoy !== '–' && <span style={{ fontSize: '0.65rem', marginRight: 4 }}>{row.yoyPos ? '▲' : '▼'}</span>}
                                        {row.yoy}
                                    </td>
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
