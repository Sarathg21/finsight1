import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Area, AreaChart, ReferenceLine, LabelList
} from 'recharts';
import { 
    BarChart3, RefreshCw, Layers, Wallet, Target, Landmark, Percent, PieChart, Coins, Briefcase, Calendar, MapPin, Building, Globe, RefreshCcw, FileText, ExternalLink, MoreVertical, Download, Eye, TrendingUp
} from 'lucide-react';
import ExecDashboardViewAll from '../components/ExecDashboardViewAll';
import PLComparisonCard from '../components/Charts/PLComparisonCard';
import KeyFinancialParameters from '../components/KeyFinancialParameters';
import Filters from '../components/Filters/Filters';
import { getOpexFilterOptions } from '../api/opexApi';
import { fetchPLStatement, fetchPLComparison, fetchPLTrend } from '../services/plApi';
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
    trade_working_capital_change: -4.1,
    overdue_receivables_change: -7.8,
    slow_moving_obsolete_stock_change: -14.3,
    cash_collection_change: 7.0,
    collection_efficiency_change: 4.1,
    total_short_term_borrowing_change: -7.9,
    roi_change: 18.3,
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
                {payload.map((entry, index) => {
                    const num = Number(entry.value);
                    const formatted = !isNaN(num) ? `${num.toFixed(2)}M` : entry.value;
                    const seriesName = entry.name === 'value' ? 'Revenue' : entry.name;
                    return (
                        <div key={index} style={{ color: entry.color || 'var(--clr-primary)', display: 'flex', gap: 8, fontWeight: 600 }}>
                            <span>{seriesName}:</span>
                            <span>{formatted}</span>
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

/* ─── Dedicated TWC Trend Custom Tooltip ─── */
const TwcCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const item = payload[0]?.payload || {};
        const curr = item.currency || 'AED';
        const trVal  = item.tr;
        const invVal = item.inv;
        const tpVal  = item.tp;
        const twcVal = item.twc;
        const cccVal = item.ccc;

        return (
            <div style={{ 
                background: 'var(--clr-surface)', 
                border: '1px solid var(--clr-border)', 
                padding: '10px 14px', 
                borderRadius: 8, 
                fontSize: '0.75rem', 
                boxShadow: 'var(--shadow-lg)',
                minWidth: 220,
                lineHeight: 1.5,
                zIndex: 100
            }}>
                <div style={{ fontWeight: 800, marginBottom: 8, color: 'var(--clr-text)', borderBottom: '1px solid var(--clr-border)', paddingBottom: 4 }}>
                    {label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--clr-text-muted)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--clr-primary)', display: 'inline-block' }} />
                            Trade Receivables:
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--clr-text)' }}>
                            {trVal != null ? `${curr} ${Number(trVal).toFixed(2)}M` : '–'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--clr-text-muted)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--clr-cyan)', display: 'inline-block' }} />
                            Inventory:
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--clr-text)' }}>
                            {invVal != null ? `${curr} ${Number(invVal).toFixed(2)}M` : '–'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--clr-text-muted)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--clr-success)', display: 'inline-block' }} />
                            Trade Payables:
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--clr-text)' }}>
                            {tpVal != null ? `${curr} ${Number(tpVal).toFixed(2)}M` : '–'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--clr-border)', paddingTop: 5, marginTop: 2 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--clr-text)', fontWeight: 700 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clr-text)', display: 'inline-block' }} />
                            Trade Working Capital:
                        </span>
                        <span style={{ fontWeight: 800, color: '#2563eb' }}>
                            {twcVal != null ? `${curr} ${Number(twcVal).toFixed(2)}M` : '–'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(225, 29, 72, 0.08)', padding: '4px 8px', borderRadius: 4, marginTop: 2 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e11d48', fontWeight: 700 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e11d48', display: 'inline-block' }} />
                            CCC Days:
                        </span>
                        <span style={{ fontWeight: 800, color: '#e11d48' }}>
                            {cccVal != null ? `${cccVal} Days` : '–'}
                        </span>
                    </div>
                </div>
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
        const raw = (Array.isArray(data) && data.length > 0) ? data : [
            { name: 'UAE', gp: 45.2, np: 18.5 },
            { name: 'Qatar', gp: 22.8, np: 8.4 },
            { name: 'Oman', gp: 15.4, np: 5.1 },
            { name: 'KSA', gp: 32.1, np: 12.8 }
        ];
        return raw.map(item => {
            const rawGp = Number(item.gp ?? item.gross_profit_aed ?? item.gross_profit ?? 0);
            const rawNp = Number(item.np ?? item.net_profit_aed ?? item.net_profit ?? 0);
            const gp = Math.abs(rawGp) > 1000 ? Number((rawGp / 1_000_000).toFixed(2)) : rawGp;
            const np = Math.abs(rawNp) > 1000 ? Number((rawNp / 1_000_000).toFixed(2)) : rawNp;
            return {
                ...item,
                gp,
                np
            };
        });
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

    const formatLabelValue = (num) => {
        const abs = Math.abs(num);
        if (abs < 0.05) return '';
        if (abs >= 0.1) return `${num.toFixed(1)}M`;
        return `${num.toFixed(2)}M`;
    };

    const renderGpLabel = (props) => {
        const { x, y, width, height, value, index } = props;
        if (value === undefined || value === null) return null;
        const num = Number(value);
        if (isNaN(num) || Math.abs(num) < 0.05) return null;

        const isNeg = num < 0;
        const row = chartData[index] || {};
        const npVal = Number(row.np || 0);

        // If both GP and NP are positive and close in height, stagger GP higher to prevent label collision
        const bothPosAndClose = !isNeg && npVal > 0 && Math.abs(num - npVal) < 2.0;
        const textY = isNeg ? (y + height + 11) : (bothPosAndClose ? (y - 12) : (y - 5));

        return (
            <text
                x={x + width / 2}
                y={textY}
                fill={isNeg ? '#dc2626' : '#2563eb'}
                textAnchor="middle"
                fontSize={8.5}
                fontWeight={700}
            >
                {formatLabelValue(num)}
            </text>
        );
    };

    const renderNpLabel = (props) => {
        const { x, y, width, height, value } = props;
        if (value === undefined || value === null) return null;
        const num = Number(value);
        if (isNaN(num) || Math.abs(num) < 0.05) return null;

        const isNeg = num < 0;
        const textY = isNeg ? (y + height + 11) : (y - 5);

        return (
            <text
                x={x + width / 2}
                y={textY}
                fill={isNeg ? '#dc2626' : '#059669'}
                textAnchor="middle"
                fontSize={8.5}
                fontWeight={700}
            >
                {formatLabelValue(num)}
            </text>
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
            <div style={{ flex: 1, minHeight: 230 }}>
                <ResponsiveContainer width="100%" height={230} minWidth={0}>
                    <BarChart 
                        data={chartData} 
                        margin={{ top: 28, right: 15, bottom: 20, left: -10 }}
                        barGap={6}
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
                        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={[(dataMin) => (dataMin < 0 ? Math.floor(dataMin * 1.35 - 1) : 0), (dataMax) => Math.ceil(Math.max(1, dataMax * 1.25 + 1))]} />
                        <Tooltip content={<CustomRegionTooltip />} cursor={{ fill: 'rgba(241,245,249,0.6)', rx: 4 }} wrapperStyle={{ outline: 'none', transition: 'transform 150ms ease-out' }} />

                        {!isGpHidden && (
                            <Bar
                                name="Gross Profit"
                                dataKey="gp"
                                fill="url(#gpGrad)"
                                barSize={14}
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
                                <LabelList dataKey="gp" content={renderGpLabel} />
                            </Bar>
                        )}

                        {!isNpHidden && (
                            <Bar
                                name="Net Profit"
                                dataKey="np"
                                fill="url(#npGrad)"
                                barSize={14}
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
                                <LabelList dataKey="np" content={renderNpLabel} />
                            </Bar>
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default function ExecutiveDashboard() {
    const navigate = useNavigate();
    const { ref: twcChartRef, inView: twcInView } = useInView({ threshold: 0.2, triggerOnce: true });
    const { ref: revRegionChartRef, inView: revRegionInView } = useInView({ threshold: 0.2, triggerOnce: true });
    const [hoveredTwcIndex, setHoveredTwcIndex] = useState(null);
    const [hoveredRevIndex, setHoveredRevIndex] = useState(null);
    const [viewAll, setViewAll] = useState({ open: false, section: 'twc_viewall' });

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
        let dateVal = appliedFilters.as_of_date || '2026-09-30';
        if (applied && applied.period) {
            const rawItem = Array.isArray(applied.period) ? applied.period[applied.period.length - 1] : applied.period;
            const pStr = (typeof rawItem === 'object' && rawItem !== null)
                ? (rawItem.period_name || rawItem.value || rawItem.name || rawItem.label || '')
                : String(rawItem || '');

            if (pStr) {
                if (pStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    dateVal = pStr;
                } else {
                    const cleaned = pStr.trim();
                    const parts = cleaned.split(/[\s\-_/]+/);
                    let mIdx = MONTHS_SHORT.findIndex(m => parts[0] && parts[0].toLowerCase().startsWith(m.toLowerCase()));
                    let rawYr = parts[1];
                    if (mIdx === -1 && parts[1]) {
                        mIdx = MONTHS_SHORT.findIndex(m => parts[1].toLowerCase().startsWith(m.toLowerCase()));
                        rawYr = parts[0];
                    }
                    if (mIdx !== -1) {
                        let yr = applied?.year || (rawYr ? (rawYr.length === 2 ? `20${rawYr}` : rawYr) : '2026');
                        const moStr = String(mIdx + 1).padStart(2, '0');
                        const lastDay = new Date(parseInt(yr, 10), mIdx + 1, 0).getDate();
                        dateVal = `${yr}-${moStr}-${String(lastDay).padStart(2, '0')}`;
                    }
                }
            }
        } else if (applied && applied.year) {
            const parts = dateVal.split('-');
            const mo = parts[1] || '09';
            const yr = String(applied.year);
            const lastDay = new Date(parseInt(yr, 10), parseInt(mo, 10), 0).getDate();
            dateVal = `${yr}-${mo}-${String(lastDay).padStart(2, '0')}`;
        }

        const extractIds = (val) => {
            if (!val) return null;
            if (Array.isArray(val)) {
                const ids = val.map(x => (typeof x === 'object' && x !== null) ? (x.id ?? x.value ?? x.name) : x).filter(Boolean);
                return ids.length ? ids : null;
            }
            if (typeof val === 'object') return [val.id ?? val.value ?? val.name];
            return [val];
        };

        const newFilterState = {
            as_of_date: dateVal,
            as_on_date: dateVal,
            period_type: 'PTD',
            reporting_currency: applied?.reporting_currency || 'AED',
            legal_group_id: extractIds(applied?.legal_group),
            legal_entity_id: extractIds(applied?.legal_entity),
            parent_division_id: extractIds(applied?.parent_division),
            subdivision_id: extractIds(applied?.subdivision),
        };

        setFilters(newFilterState);
        setAppliedFilters(newFilterState);
    };

    const handleResetFilters = () => {
        const defaultState = {
            as_of_date: '2026-09-30',
            as_on_date: '2026-09-30',
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

    // ── KPI state ──
    const kpiReqIdRef = useRef(0);
    const latestCompletedKpiReqIdRef = useRef(0);
    const latestCompletedPrevReqIdRef = useRef(0);
    const latestCompletedPlReqIdRef = useRef(0);
    const [kpiData, setKpiData] = useState(DEFAULT_KPI_DATA);
    const [prevKpiData, setPrevKpiData] = useState(null);
    const [kpiTargets, setKpiTargets] = useState({});
    const [kpiLoading, setKpiLoading] = useState(false);
    const [kpiError, setKpiError] = useState(null);

    // ── TWC Trend state ──
    const [twcTrend, setTwcTrend] = useState([]);
    const [twcLoading, setTwcLoading] = useState(false);

    // ── Profitability trend (last 6-7 months Net Profit) ──
    const [profitTrend, setProfitTrend] = useState([]);
    const [profitTrendLoading, setProfitTrendLoading] = useState(false);

    // ── Regional state ──
    const [revRegionData, setRevRegionData] = useState([]);
    const [profitRegionDataState, setProfitRegionDataState] = useState([]);

    // ── Fetch KPIs & Target Comparison on filter apply ──
    useEffect(() => {
        const reqId = ++kpiReqIdRef.current;
        setKpiLoading(true);
        setKpiError(null);

        const asOf = appliedFilters.as_of_date || appliedFilters.as_on_date || '2026-09-30';
        const parts = asOf.split('-');
        const yr = parseInt(parts[0] || '2026', 10);
        const mo = parseInt(parts[1] || '9', 10);
        const prevDate = new Date(yr, mo - 1, 0);
        const prevAsOf = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
        const moIdx = mo - 1;
        const periodName = `${MONTHS_SHORT[moIdx] || 'Sep'}-${String(yr).slice(2)}`;

        // 1. Fetch Current KPIs immediately and update state without blocking on P&L
        getExecKpis(appliedFilters)
            .then(curData => {
                if (reqId < latestCompletedKpiReqIdRef.current) return;
                latestCompletedKpiReqIdRef.current = reqId;
                if (curData && (curData.kpis || curData.data || curData.summary || Object.keys(curData).length > 0)) {
                    setKpiData(curData);
                } else {
                    setKpiData(DEFAULT_KPI_DATA);
                }
            })
            .catch(err => {
                if (reqId < latestCompletedKpiReqIdRef.current) return;
                console.error('[Exec KPIs]', err.response?.status, err.response?.data || err.message);
                setKpiError(err);
            })
            .finally(() => {
                if (reqId >= latestCompletedKpiReqIdRef.current) setKpiLoading(false);
            });

        // 2. Fetch Previous KPIs for live MoM comparison
        getExecKpis({ ...appliedFilters, as_of_date: prevAsOf, as_on_date: prevAsOf })
            .then(prevData => {
                if (reqId < latestCompletedPrevReqIdRef.current) return;
                latestCompletedPrevReqIdRef.current = reqId;
                if (prevData && (prevData.kpis || prevData.data || prevData.summary || Object.keys(prevData).length > 0)) {
                    setPrevKpiData(prevData);
                } else {
                    setPrevKpiData(null);
                }
            })
            .catch(() => {
                if (reqId >= latestCompletedPrevReqIdRef.current) setPrevKpiData(null);
            });

        // 3. Fetch P&L Targets asynchronously
        fetchPLStatement({
            year: String(yr),
            period_name: periodName,
            periodName: periodName,
            currency: appliedFilters.reporting_currency || 'AED',
            legalGroupId: appliedFilters.legal_group_id || undefined,
            legalEntityId: appliedFilters.legal_entity_id || undefined,
            parentDivisionId: appliedFilters.parent_division_id || undefined,
            subdivisionId: appliedFilters.subdivision_id || undefined,
        })
            .then(plRes => {
                if (reqId < latestCompletedPlReqIdRef.current) return;
                latestCompletedPlReqIdRef.current = reqId;
                if (plRes) {
                    let rawList = [];
                    if (Array.isArray(plRes)) {
                        rawList = plRes;
                    } else if (typeof plRes === 'object') {
                        ['income', 'cost_of_sales', 'expenses', 'bottom', 'data', 'rows', 'items'].forEach(k => {
                            if (Array.isArray(plRes[k])) rawList = rawList.concat(plRes[k]);
                        });
                        if (rawList.length === 0) rawList = Object.values(plRes).filter(Array.isArray).flat();
                    }

                    if (rawList.length > 0) {
                        const targetsMap = {};
                        rawList.forEach(r => {
                            const p = String(r.particulars || r.label || r.name || '').toLowerCase().trim();
                            const cur = Number(r.current_ptd ?? r.current ?? 0);
                            const tgt = Number(r.target_ptd ?? r.target ?? 0);
                            const varPct = r.variance_pct_current_vs_target != null && !isNaN(Number(r.variance_pct_current_vs_target))
                                ? Number(r.variance_pct_current_vs_target)
                                : (tgt > 0 ? ((cur - tgt) / tgt) * 100 : null);

                            if (p === 'total revenue' || p === 'revenue from sale of goods & services' || p === 'sales revenue' || p.includes('total revenue')) {
                                if (!targetsMap.total_revenue && tgt > 0) targetsMap.total_revenue = { target: tgt, varPct };
                            } else if (p === 'cost of material' || p.includes('cost of material')) {
                                if (!targetsMap.cost_of_material && tgt > 0) targetsMap.cost_of_material = { target: tgt, varPct };
                            } else if (p === 'gross profit' || p === 'gross margin') {
                                if (!targetsMap.gross_profit && tgt > 0) targetsMap.gross_profit = { target: tgt, varPct };
                            } else if (p === 'ebitda') {
                                if (!targetsMap.ebitda && tgt > 0) targetsMap.ebitda = { target: tgt, varPct };
                            } else if (p === 'net profit' || p === 'net profit / (loss)' || p.includes('net profit')) {
                                if (!targetsMap.net_profit && tgt > 0) targetsMap.net_profit = { target: tgt, varPct };
                            }
                        });
                        if (Object.keys(targetsMap).length > 0) {
                            setKpiTargets(targetsMap);
                        }
                    }
                }
            })
            .catch(() => {});
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
                        const rawTr  = r.trade_receivables ?? r.total_receivables ?? r.receivables ?? r.tr;
                        const rawInv = r.inventory ?? r.total_inventory ?? r.inventories ?? r.inv;
                        const rawTp  = r.trade_payables ?? r.total_payables ?? r.payables ?? r.tp ?? r.total_trade_payables ?? r.ap;
                        const rawTwc = r.trade_working_capital ?? r.twc;
                        const rawCcc = r.cash_conversion_cycle_days ?? r.ccc_days ?? r.ccc;

                        // Scale to Millions for "AED Million" chart YAxis scale only when valid numbers exist
                        // Backend-controlled: preserve null when backend returns null (never convert null to 0)
                        const tr  = (rawTr != null && !isNaN(Number(rawTr)))
                            ? (Math.abs(Number(rawTr)) > 1000 ? Number((Number(rawTr) / 1_000_000).toFixed(2)) : Number(rawTr))
                            : null;
                        const inv = (rawInv != null && !isNaN(Number(rawInv)))
                            ? (Math.abs(Number(rawInv)) > 1000 ? Number((Number(rawInv) / 1_000_000).toFixed(2)) : Number(rawInv))
                            : null;
                        const tp  = (rawTp != null && !isNaN(Number(rawTp)))
                            ? (Math.abs(Number(rawTp)) > 1000 ? Number((Number(rawTp) / 1_000_000).toFixed(2)) : Number(rawTp))
                            : null;
                        const twc = (rawTwc != null && !isNaN(Number(rawTwc)))
                            ? (Math.abs(Number(rawTwc)) > 1000 ? Number((Number(rawTwc) / 1_000_000).toFixed(2)) : Number(rawTwc))
                            : null;
                        const ccc = (rawCcc != null && !isNaN(Number(rawCcc)))
                            ? Math.round(Number(rawCcc))
                            : null;

                        const rawMonth = r.month_label ?? r.month ?? r.period_name ?? r.period ?? '';

                        return {
                            month: fmtPeriod(rawMonth) || rawMonth,
                            tr,
                            inv,
                            tp,
                            twc,
                            ccc,
                            currency: appliedFilters.reporting_currency || 'AED',
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

    // ── Fetch Profitability Trend (Net Profit last 6-7 months) ──
    useEffect(() => {
        let cancelled = false;
        setProfitTrendLoading(true);
        const params = {
            legalGroupId:     appliedFilters.legal_group_id     || undefined,
            legalEntityId:    appliedFilters.legal_entity_id    || undefined,
            parentDivisionId: appliedFilters.parent_division_id || undefined,
            subdivisionId:    appliedFilters.subdivision_id     || undefined,
            currency:         appliedFilters.reporting_currency || 'AED',
        };
        fetchPLTrend(params)
            .then(rows => {
                if (!cancelled) {
                    const rawList = Array.isArray(rows) ? rows : [];
                    const asOfYr = (appliedFilters.as_of_date || '2026').slice(0, 4);
                    const asOfYrShort = asOfYr.slice(2);

                    // Find index of January for current year (e.g. Jan-26 or 2026-01)
                    const janIdx = rawList.findIndex(r => {
                        const rawP = String(r.period_name || r.period || r.month || '').trim();
                        const p = fmtPeriod(rawP) || rawP;
                        return (
                            p.startsWith(`Jan ${asOfYrShort}`) ||
                            p.startsWith(`Jan-${asOfYrShort}`) ||
                            p.startsWith(`Jan 26`) ||
                            p.startsWith(`Jan-26`) ||
                            p === 'Jan' ||
                            rawP.includes(`${asOfYr}-01`) ||
                            rawP.includes(`Jan-${asOfYrShort}`)
                        );
                    });

                    // If January is found and has at least 5 months, show January onwards; otherwise show up to the last 10 months
                    let displayed = [];
                    if (janIdx !== -1 && (rawList.length - janIdx) >= 5) {
                        displayed = rawList.slice(janIdx);
                    } else {
                        displayed = rawList.slice(-10);
                    }

                    const normalized = displayed.map(r => ({
                        month:       fmtPeriod(r.period_name || r.period || r.month),
                        net_profit:  Number(r.net_profit ?? r.np ?? 0) / 1_000_000,
                        np_pct:      Number(r.net_profit_pct ?? r.np_pct ?? r.net_margin ?? 0),
                        gross_profit:Number(r.gross_profit ?? r.gp ?? 0) / 1_000_000,
                    }));
                    setProfitTrend(normalized);
                }
            })
            .catch(err => { if (!cancelled) console.error('[Profit Trend]', err); })
            .finally(() => { if (!cancelled) setProfitTrendLoading(false); });
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
                        const rawVal = Number(r.revenue_aed ?? r.revenue ?? r.total_revenue ?? 0);
                        const value  = Number((rawVal / 1_000_000).toFixed(2));
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
                        const rawGp = Number(r.gross_profit_aed ?? r.gross_profit ?? r.gp ?? 0);
                        const rawNp = Number(r.net_profit_aed ?? r.net_profit ?? r.np ?? 0);
                        const gp = Number((rawGp / 1_000_000).toFixed(2));
                        const np = Number((rawNp / 1_000_000).toFixed(2));
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
        { key: 'total_revenue',               title: 'Total Revenue',                  icon: BarChart3, cardBg: '#f0f5ff', iconBg: '#dbeafe', accent: '#2563eb', colorClass: 'blue', isRed: false, compareType: 'mom' },
        { key: 'cost_of_material',            title: 'Cost of Material',               icon: Coins,     cardBg: '#fff1f2', iconBg: '#ffe4e6', accent: '#e11d48', colorClass: 'red',  isRed: true,  compareType: 'mom' },
        { key: 'gross_profit',                title: 'Gross Profit',                   icon: TrendingUp,cardBg: '#f0fdf4', iconBg: '#dcfce7', accent: '#16a34a', colorClass: 'green', isRed: false, compareType: 'mom' },
        { key: 'ebitda',                      title: 'EBITDA',                         icon: Briefcase, cardBg: '#faf5ff', iconBg: '#ede9fe', accent: '#7c3aed', colorClass: 'blue', isRed: false, compareType: 'mom' },
        { key: 'net_profit',                  title: 'Net Profit',                     icon: Coins,     cardBg: '#ecfdf5', iconBg: '#d1fae5', accent: '#059669', colorClass: 'green', isRed: false, compareType: 'mom' },
        { key: 'trade_working_capital',       title: 'Trade Working Capital',          icon: RefreshCw, cardBg: '#fff7ed', iconBg: '#ffedd5', accent: '#ea580c', colorClass: 'red',  isRed: true,  compareType: 'target', target: 42_000_000 },
        { key: 'overdue_receivables',         title: 'Overdue Receivables',            icon: Wallet,    cardBg: '#fff1f2', iconBg: '#ffe4e6', accent: '#dc2626', colorClass: 'red',  isRed: true,  compareType: 'target', target: 20_000_000 },
        { key: 'slow_moving_obsolete_stock',  title: 'Slow Moving & Obsolete Stock',   icon: Layers,    cardBg: '#fffbeb', iconBg: '#fef3c7', accent: '#d97706', colorClass: 'green', isRed: false, compareType: 'target', target: 5_000_000 },
        { key: 'cash_collection',             title: 'Cash Collection',                icon: Wallet,    cardBg: '#ecfeff', iconBg: '#cffafe', accent: '#0891b2', colorClass: 'blue', isRed: false, compareType: 'target', target: 92_000_000 },
        { key: 'collection_efficiency',       title: 'Collection Efficiency',          icon: Target,    cardBg: '#f0f5ff', iconBg: '#dbeafe', accent: '#2563eb', colorClass: 'blue', isRed: false, isPct: true, compareType: 'target', target: 85.0 },
        { key: 'total_short_term_borrowing',  title: 'Total Short Term Borrowing',     icon: Landmark,  cardBg: '#fff7ed', iconBg: '#ffedd5', accent: '#ea580c', colorClass: 'red',  isRed: true,  compareType: 'target', target: 16_500_000 },
        { key: 'roi',                         title: 'ROI %',                          icon: Percent,   cardBg: '#ecfdf5', iconBg: '#d1fae5', accent: '#059669', colorClass: 'green', isRed: false, isPct: true, compareType: 'target', target: 12.0 },
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

    // Helper to extract target from KPI payload if provided by API
    const getTargetFromKpiPayload = (payload, cfgKey) => {
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
                const item = list.find(x => x && (x.key === key || x.name === key || x.id === key));
                if (item && item.target !== undefined && item.target !== null) {
                    return Number(item.target);
                }
            }
        }

        const k = payload?.kpis ?? payload?.data ?? payload?.summary ?? payload;
        if (k && typeof k === 'object' && !Array.isArray(k)) {
            const v = k[`${cfgKey}_target`] ?? k[`target_${cfgKey}`] ?? k[`${cfgKey}_budget`];
            if (v !== undefined && v !== null) return Number(v);
        }
        return undefined;
    };

    // Helper to format target numbers for tooltip
    const fmtTargetVal = (targetVal, isPct) => {
        if (targetVal === null || targetVal === undefined) return null;
        const n = Number(targetVal);
        if (isNaN(n)) return null;
        if (isPct) return `${n.toFixed(1)}%`;
        if (Math.abs(n) >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(1)}M`;
        if (Math.abs(n) >= 1_000) return `${currency} ${(n / 1_000).toFixed(0)}K`;
        return `${currency} ${n.toFixed(2)}`;
    };


    // Metrics where LOWER is favorable (costs, debts, overdue, working capital)
    const LOWER_IS_BETTER_KEYS = new Set([
        'cost_of_material',
        'trade_working_capital',
        'overdue_receivables',
        'slow_moving_obsolete_stock',
        'total_short_term_borrowing'
    ]);

    // Check if hierarchy filters are active
    const hasHierarchyFilter = Boolean(
        (Array.isArray(appliedFilters.legal_group_id) && appliedFilters.legal_group_id.length) ||
        (Array.isArray(appliedFilters.legal_entity_id) && appliedFilters.legal_entity_id.length) ||
        (Array.isArray(appliedFilters.parent_division_id) && appliedFilters.parent_division_id.length) ||
        (Array.isArray(appliedFilters.subdivision_id) && appliedFilters.subdivision_id.length) ||
        (appliedFilters.legal_group_id && !Array.isArray(appliedFilters.legal_group_id)) ||
        (appliedFilters.legal_entity_id && !Array.isArray(appliedFilters.legal_entity_id)) ||
        (appliedFilters.parent_division_id && !Array.isArray(appliedFilters.parent_division_id)) ||
        (appliedFilters.subdivision_id && !Array.isArray(appliedFilters.subdivision_id))
    );

    // Build display values matching reference image
    const displayKpis = KPI_CONFIG.map(cfg => {
        // Use live backend API value when available (respecting role-level scoping)
        const rawApiVal = getValueFromKpiPayload(kpiData, cfg.key);
        const valToUse = (rawApiVal !== undefined && rawApiVal !== null && !isNaN(Number(rawApiVal)))
            ? Number(rawApiVal)
            : DEFAULT_KPI_DATA[cfg.key];

        const numVal = (valToUse !== null && valToUse !== undefined && !isNaN(Number(valToUse))) ? Number(valToUse) : null;

        let displayVal = '–';
        if (numVal !== null) {
            if (cfg.isPct) {
                displayVal = `${numVal.toFixed(1)}%`;
            } else if (Math.abs(numVal) >= 1_000_000) {
                displayVal = `${currency} ${(numVal / 1_000_000).toFixed(1)}M`;
            } else if (Math.abs(numVal) >= 1_000) {
                displayVal = `${currency} ${(numVal / 1_000).toFixed(0)}K`;
            } else {
                displayVal = `${currency} ${numVal.toFixed(2)}`;
            }
        }

        let compArrow = '';
        let compText = '';
        let compColor = '#16a34a';
        let compLabel = '';
        let compTitle = '';

        if (cfg.compareType === 'mom') {
            compLabel = 'vs. last month';
            let changeNum = null;

            // 1. Try backend API change if available
            const rawApiChange = getChangeFromKpiPayload(kpiData, cfg.key);
            if (rawApiChange !== undefined && rawApiChange !== null && !isNaN(Number(rawApiChange))) {
                changeNum = Number(rawApiChange);
            } else if (numVal !== null && prevKpiData) {
                // 2. Compute true live MoM change from current vs previous month API values
                const prevRaw = getValueFromKpiPayload(prevKpiData, cfg.key);
                if (prevRaw !== undefined && prevRaw !== null && !isNaN(Number(prevRaw))) {
                    const prevVal = Number(prevRaw);
                    if (prevVal !== 0) {
                        changeNum = ((numVal - prevVal) / Math.abs(prevVal)) * 100;
                    }
                }
            }

            // Fallback only if no previous data available
            if (changeNum === null || isNaN(changeNum)) {
                changeNum = DEFAULT_KPI_DATA[`${cfg.key}_change`];
            }

            if (changeNum !== undefined && changeNum !== null && !isNaN(changeNum)) {
                const isPositive = changeNum >= 0;
                compArrow = isPositive ? '▲' : '▼';
                compText = `${isPositive ? '+' : ''}${changeNum.toFixed(1)}%`;
                const isLowerBetter = LOWER_IS_BETTER_KEYS.has(cfg.key);
                const isFavorable = isLowerBetter ? changeNum <= 0 : changeNum >= 0;
                compColor = isFavorable ? '#16a34a' : '#dc2626';
                compTitle = `MoM Change: ${compText} vs. last month`;
            }
        } else {
            // compareType === 'target'
            compLabel = 'vs. Target';
            const liveTgt = kpiTargets[cfg.key]?.target ?? getValueFromKpiPayload(kpiData, `${cfg.key}_target`);
            const targetVal = (liveTgt !== undefined && liveTgt !== null && !isNaN(Number(liveTgt)))
                ? Number(liveTgt)
                : cfg.target;

            if (numVal !== null && targetVal !== undefined && targetVal !== null && targetVal > 0) {
                const diff = numVal - targetVal;
                const diffPct = (diff / targetVal) * 100;
                const isUp = diff >= 0;
                compArrow = isUp ? '▲' : '▼';
                compText = `${isUp ? '+' : ''}${diffPct.toFixed(1)}%`;

                const isLowerBetter = LOWER_IS_BETTER_KEYS.has(cfg.key);
                const isFavorable = isLowerBetter ? diff <= 0 : diff >= 0;
                compColor = isFavorable ? '#16a34a' : '#dc2626';

                const tgtFmt = fmtTargetVal(targetVal, cfg.isPct);
                compTitle = tgtFmt ? `Target: ${tgtFmt} | Variance: ${compText} vs. Target` : `Target: ${targetVal}`;
            }
        }

        const sparkData = [10, 15, 12, 18, 16, 22, 20];
        return { 
            ...cfg, 
            value: displayVal, 
            comparisonArrow: compArrow,
            comparisonText: compText,
            comparisonColor: compColor,
            comparisonLabel: compLabel,
            comparisonTitle: compTitle,
            sparklineData: sparkData 
        };
    });

    const openViewAll = (section) => setViewAll({ open: true, section });
    const closeViewAll = () => setViewAll(v => ({ ...v, open: false }));


    // Live API chart data
    const chartTwcData = twcTrend;
    const chartRevRegionData = revRegionData;
    const chartProfitRegionData = profitRegionDataState;

    // Target Net Profit in AED Millions (dynamic from live P&L statement target, default 2.34M)
    const targetNetProfitM = React.useMemo(() => {
        const rawTgt = kpiTargets.net_profit?.target;
        if (rawTgt !== undefined && rawTgt !== null && rawTgt > 0) {
            return Number((rawTgt / 1_000_000).toFixed(2));
        }
        return 2.34;
    }, [kpiTargets.net_profit]);

    // Profitability trend with Target Net Profit constant sleeping line
    const chartProfitTrend = React.useMemo(() => {
        return (profitTrend || []).map(r => ({
            ...r,
            target_net_profit: targetNetProfitM,
        }));
    }, [profitTrend, targetNetProfitM]);

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
            
            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0, padding: 0, lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Briefcase size={24} style={{ color: '#2563eb' }} />
                        Executive Dashboard
                    </h1>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0', padding: 0, fontWeight: 500 }}>
                        Enterprise financial overview, operational performance, and key metrics across all divisions
                    </p>
                </div>
            </div>

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
                            padding: '10px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: 80,
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
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: kpi.iconBg || '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: kpi.accent || '#2563eb'
                        }}>
                            <kpi.icon size={17} strokeWidth={2.3} />
                        </div>

                        {/* Title, Value & Trend */}
                        <div style={{ minWidth: 0, flex: 1, zIndex: 1 }}>
                            <div 
                                title={kpi.title}
                                style={{
                                    fontSize: '0.67rem',
                                    fontWeight: 700,
                                    color: '#1e3a8a',
                                    letterSpacing: '-0.015em',
                                    lineHeight: 1.2,
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                    minHeight: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
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
                            {kpi.comparisonText ? (
                                <div 
                                    title={kpi.comparisonTitle}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 3,
                                        marginTop: 4,
                                        color: kpi.comparisonColor,
                                        fontSize: '0.62rem',
                                        fontWeight: 700,
                                        cursor: 'default'
                                    }}
                                >
                                    <span>{kpi.comparisonArrow} {kpi.comparisonText}</span>
                                    <small style={{ color: '#94a3b8', fontSize: '0.55rem', fontWeight: 600 }}>{kpi.comparisonLabel}</small>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Profitability at a Glance — Teaser Card ── */}
            <div style={{ marginBottom: 20 }}>
                <div className="card" style={{ padding: '18px 20px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <TrendingUp size={16} color="#2563eb" />
                                Profitability at a Glance
                            </div>
                            <div style={{ fontSize: '0.67rem', color: 'var(--clr-text-muted)', fontWeight: 600, marginTop: 2 }}>
                                PBT &amp; Net Profit — monthly trend (AED M)
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                                onClick={() => openViewAll('profitability_glance')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    background: 'none', border: '1px solid #e2e8f0',
                                    borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                                    fontSize: '0.74rem', fontWeight: 700, color: '#2563eb',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#2563eb'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                            >
                                View All
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                                </svg>
                            </button>
                            <ChartMenu menuItems={[
                                { icon: Eye, label: 'View All', action: () => openViewAll('profitability_glance') },
                                { icon: FileText, label: 'Export Excel', action: () => {
                                    import('../services/plApi').then(({ exportPL }) => {
                                        exportPL('trend', 'excel', { currency });
                                    }).catch(err => console.error(err));
                                }},
                                { icon: Download, label: 'Export PDF', action: () => {
                                    import('../services/plApi').then(({ exportPL }) => {
                                        exportPL('trend', 'pdf', { currency });
                                    }).catch(err => console.error(err));
                                }}
                            ]} />
                        </div>
                    </div>

                    {/* Content row: mini chart + KPI pills */}
                    <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
                        {/* Mini Trend Chart */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {profitTrendLoading ? (
                                <div style={{ height: 160, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
                            ) : profitTrend.length === 0 ? (
                                <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
                                    No trend data available
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={160}>
                                    <ComposedChart data={chartProfitTrend} margin={{ top: 10, right: 82, bottom: 0, left: -20 }}>
                                        <defs>
                                            <linearGradient id="npTeaserGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.85}/>
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9.5, fill: '#94a3b8', fontWeight: 600 }} interval={0} dy={6} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (!active || !payload || !payload.length) return null;
                                                const pt = payload[0]?.payload || {};
                                                const act = pt.net_profit;
                                                const tgt = pt.target_net_profit ?? targetNetProfitM;
                                                const diff = (act !== undefined && tgt !== undefined) ? act - tgt : null;
                                                const diffPct = (diff !== null && tgt > 0) ? (diff / tgt) * 100 : null;
                                                return (
                                                    <div style={{
                                                        background: '#ffffff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: 8,
                                                        padding: '8px 12px',
                                                        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                                                        fontSize: '0.72rem',
                                                        minWidth: 155
                                                    }}>
                                                        <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 5 }}>{label}</div>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, color: '#d97706', fontWeight: 700 }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
                                                                Actual Net Profit:
                                                            </span>
                                                            <span style={{ color: '#0f172a' }}>{currency} {Number(act ?? 0).toFixed(2)}M</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, color: '#881337', fontWeight: 700, marginTop: 3 }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                                <span style={{ width: 8, height: 2, background: '#881337', display: 'inline-block' }} />
                                                                Target Net Profit:
                                                            </span>
                                                            <span style={{ color: '#0f172a' }}>{currency} {Number(tgt).toFixed(2)}M</span>
                                                        </div>
                                                        {diffPct !== null && (
                                                            <div style={{
                                                                display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
                                                                fontSize: '0.66rem', fontWeight: 700,
                                                                color: diff >= 0 ? '#16a34a' : '#dc2626'
                                                            }}>
                                                                <span>{diff >= 0 ? '▲' : '▼'} {diff >= 0 ? '+' : ''}{diffPct.toFixed(1)}% vs. Target</span>
                                                            </div>
                                                        )}
                                                        {pt.np_pct !== undefined && pt.np_pct !== null && (
                                                            <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 600, marginTop: 4, borderTop: '1px solid #f1f5f9', paddingTop: 3 }}>
                                                                NP Margin: {Number(pt.np_pct).toFixed(1)}%
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, paddingTop: 6 }} iconSize={8} />
                                        <ReferenceLine 
                                            y={targetNetProfitM} 
                                            stroke="#881337"
                                            strokeDasharray="6 4"
                                            strokeWidth={1.8}
                                            strokeOpacity={0.85}
                                            ifOverflow="visible"
                                            label={({ viewBox }) => {
                                                if (!viewBox) return null;
                                                const x = (viewBox.x || 0) + (viewBox.width || 0) + 7;
                                                const y = viewBox.y || 0;
                                                return (
                                                    <text 
                                                        x={x} 
                                                        y={y} 
                                                        dominantBaseline="central" 
                                                        fill="#881337" 
                                                        fontSize={9.5} 
                                                        fontWeight={700}
                                                        style={{ pointerEvents: 'none' }}
                                                    >
                                                        Target: {targetNetProfitM}M
                                                    </text>
                                                );
                                            }} 
                                        />
                                        <Bar 
                                            name="Net Profit (M)" 
                                            dataKey="net_profit" 
                                            fill="url(#npTeaserGrad)" 
                                            barSize={16} 
                                            radius={[4,4,0,0]}
                                            isAnimationActive 
                                            animationDuration={900} 
                                        />
                                        <Line 
                                            name="Actual Net Profit" 
                                            dataKey="net_profit" 
                                            type="monotone" 
                                            stroke="#d97706" 
                                            strokeWidth={2.2}
                                            dot={{ r: 3.5, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                                            activeDot={{ r: 5 }}
                                            isAnimationActive 
                                            animationDuration={1100} 
                                        />
                                        <Line 
                                            name="Target Net Profit" 
                                            dataKey="target_net_profit" 
                                            type="monotone" 
                                            stroke="#881337" 
                                            strokeWidth={1.8}
                                            strokeDasharray="6 4" 
                                            dot={false} 
                                            activeDot={{ r: 4, stroke: '#881337', fill: '#fff' }}
                                            isAnimationActive={false} 
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* KPI Pills */}
                        {(() => {
                            const latest = profitTrend[profitTrend.length - 1] || {};
                            const prev   = profitTrend[profitTrend.length - 2] || {};
                            const npVal  = latest.net_profit ?? 0;
                            const npPct  = latest.np_pct ?? 0;
                            const gpVal  = latest.gross_profit ?? 0;
                            const npMom  = prev.net_profit ? ((npVal - prev.net_profit) / Math.abs(prev.net_profit)) * 100 : null;
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', minWidth: 160, flexShrink: 0 }}>
                                    <div style={{ background: '#eff6ff', borderRadius: 10, padding: '12px 14px', border: '1px solid #bfdbfe' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Profit (YTD)</div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a', marginTop: 4, letterSpacing: '-0.02em' }}>
                                            {currency} {npVal.toFixed(1)}M
                                        </div>
                                        {npMom !== null && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                                {npMom >= 0
                                                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="18 15 12 9 6 15"/></svg>
                                                    : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                                                }
                                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: npMom >= 0 ? '#16a34a' : '#dc2626' }}>
                                                    {npMom >= 0 ? '+' : ''}{npMom.toFixed(1)}% vs last month
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 14px', border: '1px solid #bbf7d0' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NP Margin</div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#14532d', marginTop: 4, letterSpacing: '-0.02em' }}>
                                            {npPct.toFixed(1)}%
                                        </div>
                                        <div style={{ fontSize: '0.63rem', color: '#4ade80', fontWeight: 700, marginTop: 2 }}>current period</div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* 3. CHARTS ROW */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {/* Trade Working Capital Trend */}
                <div ref={twcChartRef} className="card" style={{ flex: 2, padding: 18 }}>
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
                                margin={{ top: 20, right: 35, bottom: 0, left: -10 }}
                                onMouseMove={(state) => {
                                    if (state && state.activeTooltipIndex !== undefined) {
                                        setHoveredTwcIndex(state.activeTooltipIndex);
                                    }
                                }}
                                onMouseLeave={() => setHoveredTwcIndex(null)}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border-strong)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} dy={10} />
                                <YAxis yAxisId="left" label={{ value: 'AED Million', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: 'var(--clr-text-muted)', fontSize: 10} }} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} />
                                <YAxis yAxisId="right" orientation="right" label={{ value: 'Days', angle: 90, position: 'insideRight', style: {textAnchor: 'middle', fill: '#e11d48', fontSize: 10} }} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#e11d48' }} />
                                <Tooltip content={<TwcCustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.5)', rx: 4 }} wrapperStyle={{ outline: 'none', transition: 'transform 150ms ease-out' }} />
                                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, color: 'var(--clr-text-muted)', paddingTop: 10 }} iconType="square" iconSize={8} />
                                <Bar 
                                    yAxisId="left"
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
                                     yAxisId="left"
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
                                    yAxisId="left"
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
                                    yAxisId="left"
                                    name="Trade Working Capital" 
                                    type="monotone" 
                                    dataKey="twc" 
                                    stroke="var(--clr-text)" 
                                    strokeWidth={2} 
                                    connectNulls={false}
                                    dot={(props) => {
                                        const { cx, cy, index, value } = props;
                                        if (cx === undefined || cy === undefined || isNaN(cx) || isNaN(cy) || value === null || value === undefined) return null;
                                        const isLast = index === (chartTwcData.length - 1);
                                        return (
                                            <circle
                                                key={`twc-dot-${index}`}
                                                cx={cx}
                                                cy={cy}
                                                r={isLast ? 4 : 3.5}
                                                fill={isLast ? '#2563eb' : 'var(--clr-text)'}
                                                stroke="#ffffff"
                                                strokeWidth={1.5}
                                            />
                                        );
                                    }}
                                    activeDot={(props) => {
                                        const { cx, cy, value } = props;
                                        if (cx === undefined || cy === undefined || isNaN(cx) || isNaN(cy) || value === null || value === undefined) return null;
                                        return <circle cx={cx} cy={cy} r={6} fill="#2563eb" stroke="#ffffff" strokeWidth={2} />;
                                    }}
                                    isAnimationActive={true}
                                    animationBegin={200}
                                    animationDuration={1200}
                                    animationEasing="ease-out"
                                />
                                <Line 
                                    yAxisId="right"
                                    name="CCC (Days)" 
                                    type="monotone" 
                                    dataKey="ccc" 
                                    stroke="#e11d48" 
                                    strokeWidth={2} 
                                    strokeDasharray="4 4"
                                    connectNulls={false}
                                    dot={(props) => {
                                        const { cx, cy, index, value } = props;
                                        if (cx === undefined || cy === undefined || isNaN(cx) || isNaN(cy) || value === null || value === undefined) return null;
                                        return (
                                            <circle
                                                key={`ccc-dot-${index}`}
                                                cx={cx}
                                                cy={cy}
                                                r={3}
                                                fill="#e11d48"
                                                stroke="#ffffff"
                                                strokeWidth={1}
                                            />
                                        );
                                    }}
                                    activeDot={(props) => {
                                        const { cx, cy, value } = props;
                                        if (cx === undefined || cy === undefined || isNaN(cx) || isNaN(cy) || value === null || value === undefined) return null;
                                        return <circle cx={cx} cy={cy} r={5} fill="#e11d48" stroke="#ffffff" strokeWidth={2} />;
                                    }}
                                    isAnimationActive={true}
                                    animationBegin={300}
                                    animationDuration={1200}
                                    animationEasing="ease-out"
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
                                margin={{ top: 0, right: 48, bottom: 0, left: 0 }}
                                onMouseMove={(state) => {
                                    if (state && state.activeTooltipIndex !== undefined) {
                                        setHoveredRevIndex(state.activeTooltipIndex);
                                    }
                                }}
                                onMouseLeave={() => setHoveredRevIndex(null)}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--clr-border-strong)" />
                                <XAxis 
                                    type="number" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} 
                                    domain={[0, (dataMax) => Math.ceil(dataMax * 1.2)]}
                                />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)', fontWeight: 600 }} width={50} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37,99,235,0.06)', rx: 4 }} wrapperStyle={{ outline: 'none', transition: 'transform 150ms ease-out' }} />
                                <Bar 
                                    name="Revenue"
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
                                    <LabelList 
                                        dataKey="value" 
                                        position="right" 
                                        formatter={(val) => {
                                            const n = Number(val || 0);
                                            return `${Math.abs(n) < 0.1 && Math.abs(n) > 0 ? n.toFixed(2) : n.toFixed(1)}M`;
                                        }} 
                                        style={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} 
                                        offset={8} 
                                    />
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

            {/* 4. KEY FINANCIAL PARAMETERS (ENHANCED SECTION) */}
            <KeyFinancialParameters
                filterOptions={filterOptions}
                initialFilters={appliedFilters}
                currency={currency}
                parentTwcTrend={twcTrend}
                parentKpis={kpiData}
            />

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
