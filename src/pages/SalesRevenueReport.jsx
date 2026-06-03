import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  fetchFilters,
  fetchSummary,
  fetchTrend,
  fetchLegalEntity,
  fetchParentDivision,
  fetchSubDivision,
  fetchDetails,
} from '../services/salesRevenueApi';

/* ─── Color Palette ─────────────────────────────────────────────── */
const C = {
  navy:    '#1a3a6b',
  blue:    '#2563eb',
  blue2:   '#3b82f6',
  green:   '#16a34a',
  green2:  '#22c55e',
  orange:  '#f59e0b',
  purple:  '#7c3aed',
  cyan:    '#0891b2',
  rose:    '#e11d48',
  slate:   '#64748b',
  muted:   '#94a3b8',
  bg:      '#f1f5fb',
  surface: '#ffffff',
  border:  '#e2e8f0',
};

const CHART_COLORS = [
  '#2563eb', '#16a34a', '#7c3aed', '#f59e0b',
  '#0891b2', '#e11d48', '#64748b', '#0d9488',
];

/* ─── Default filter state ──────────────────────────────────────── */
const _today = new Date();
const _y = _today.getFullYear();
const _m = _today.getMonth(); // 0-indexed
const pad = n => String(n).padStart(2, '0');
const FIRST_DAY = `${_y}-${pad(_m + 1)}-01`;
const LAST_DAY  = `${_y}-${pad(_m + 1)}-${pad(new Date(_y, _m + 1, 0).getDate())}`;

const DEFAULT_FILTERS = {
  legalGroup:  'All',
  legalEntity: 'All',
  parentDiv:   'All',
  subDiv:      'All',
  salesman:    'All',
  fromDate:    FIRST_DAY,
  toDate:      LAST_DAY,
};

/* ─── Loading Skeleton ──────────────────────────────────────────── */
function Skeleton({ h = 20, w = '100%', radius = 6 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: radius,
      background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

/* ─── Error Banner ──────────────────────────────────────────────── */
function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: '#fff1f2', border: '1px solid #fecdd3',
      borderRadius: 10, padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, fontSize: '0.78rem', color: '#be123c',
    }}>
      <span>⚠ {message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: '#be123c', color: '#fff', border: 'none',
          borderRadius: 6, padding: '4px 12px', fontSize: '0.72rem',
          fontWeight: 700, cursor: 'pointer',
        }}>Retry</button>
      )}
    </div>
  );
}

/* ─── CFO Pending Placeholder Card ─────────────────────────────── */
function PendingCard({ title, icon, minHeight = 180 }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px dashed ${C.border}`,
      padding: '16px 18px', minHeight,
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Frosted overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(248,250,252,0.88)',
        backdropFilter: 'blur(2px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 10, zIndex: 2,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
        }}>{icon}</div>
        <div style={{ fontWeight: 800, fontSize: '0.82rem', color: C.navy }}>{title}</div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 100, padding: '4px 12px',
          fontSize: '0.68rem', fontWeight: 700, color: '#b45309',
        }}>
          ⏳ Data source pending from CFO
        </div>
      </div>
      {/* Background placeholder content (blurred) */}
      <div style={{ opacity: 0.25 }}>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy, marginBottom: 12 }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[80, 60, 90, 50, 70].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: CHART_COLORS[i] }} />
              <div style={{ height: 8, width: `${w}%`, borderRadius: 4, background: '#cbd5e1' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── KPI Pending Card (small) ──────────────────────────────────── */
function KPIPendingCard({ label, icon, iconBg }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px dashed #e2e8f0`, padding: '16px 16px 10px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
      display: 'flex', flexDirection: 'column', gap: 6,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontSize: '0.68rem', color: C.slate, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6,
          }}>{label}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 100, padding: '3px 10px',
            fontSize: '0.62rem', fontWeight: 700, color: '#b45309',
          }}>
            ⏳ Pending CFO
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: iconBg || 'linear-gradient(135deg,#fef3c7,#fde68a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', flexShrink: 0, marginLeft: 8,
          opacity: 0.6,
        }}>{icon}</div>
      </div>
    </div>
  );
}

/* ─── Mini Sparkline ────────────────────────────────────────────── */
function Sparkline({ data, color, height = 40 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 100, h = height;
  const xs = data.map((_, i) => (i / (data.length - 1)) * w);
  const ys = data.map(v => h - ((v - min) / (max - min || 1)) * h * 0.85 - h * 0.07);
  const points = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const areaPoints = `0,${h} ${points} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height, display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3" fill={color} />
    </svg>
  );
}

/* ─── KPI Card ──────────────────────────────────────────────────── */
function KPICard({ label, numericValue, textValue, changePct, changeLabel, up, icon, iconBg, sparkData, sparkColor, loading, error }) {
  const [displayVal, setDisplayVal] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (numericValue === null || numericValue === undefined) return;
    setDisplayVal(0);
    const target = numericValue;
    const duration = 900;
    const step = target / (duration / 16);
    let cur = 0;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) { setDisplayVal(target); clearInterval(timer); }
      else setDisplayVal(cur);
    }, 16);
    return () => clearInterval(timer);
  }, [numericValue]);

  const formattedNum = numericValue !== null && numericValue !== undefined
    ? `AED ${displayVal >= 1000
        ? displayVal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        : displayVal.toFixed(2)}`
    : textValue || '—';

  return (
    <div
      id={`kpi-${label.replace(/\s+/g, '-').toLowerCase()}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: 14,
        border: `1px solid ${hover ? '#c7d7f7' : C.border}`,
        padding: '16px 16px 10px',
        boxShadow: hover ? '0 8px 28px rgba(37,99,235,0.12)' : '0 2px 6px rgba(0,0,0,0.05)',
        transition: 'all 0.22s ease',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 6,
        overflow: 'hidden', position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.68rem', color: C.slate, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6,
          }}>{label}</div>
          {loading ? (
            <Skeleton h={22} w="80%" />
          ) : error ? (
            <span style={{ fontSize: '0.72rem', color: C.rose }}>Error loading</span>
          ) : (
            <div style={{
              fontSize: numericValue !== null ? '1.1rem' : '0.95rem',
              fontWeight: 800, color: C.navy, lineHeight: 1.15,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{formattedNum}</div>
          )}
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', flexShrink: 0, marginLeft: 8,
        }}>{icon}</div>
      </div>

      {sparkData && sparkData.length > 1 && (
        <div style={{ margin: '2px -2px 0' }}>
          <Sparkline data={sparkData} color={sparkColor} height={34} />
        </div>
      )}

      {loading ? (
        <Skeleton h={16} w="60%" radius={100} />
      ) : (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: '0.62rem', fontWeight: 700,
          color: up === true ? C.green : up === false ? C.rose : '#475569',
          background: up === true ? '#f0fdf4' : up === false ? '#fff1f2' : '#f8fafc',
          borderRadius: 100, padding: '3px 8px', width: 'fit-content',
        }}>
          {up === true && <span>▲</span>}
          {up === false && <span>▼</span>}
          <span>{changePct !== null && changePct !== undefined
            ? `${Math.abs(changePct).toFixed(2)}% ${changeLabel || ''}`
            : changeLabel || '—'}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Chart Card ────────────────────────────────────────────────── */
function ChartCard({ title, children, minHeight, loading, error, onRetry, action }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px solid ${C.border}`, padding: '16px 18px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', minHeight: minHeight || 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>{title}</span>
        {action}
      </div>
      {error
        ? <ErrorBanner message={error} onRetry={onRetry} />
        : loading
          ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
              <Skeleton h={14} w="60%" />
              <Skeleton h={130} />
            </div>
          : <div style={{ flex: 1 }}>{children}</div>
      }
    </div>
  );
}

/* ─── Custom Tooltip ────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '0.75rem',
    }}>
      <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
          <span style={{ color: C.slate }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: C.navy }}>AED {Number(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Variance Badge ────────────────────────────────────────────── */
function VarBadge({ val }) {
  if (val === null || val === undefined) return <span style={{ color: C.muted }}>—</span>;
  const up = val >= 0;
  return (
    <span style={{
      color: up ? C.green : C.rose,
      fontWeight: 700, fontSize: '0.76rem',
      display: 'inline-flex', alignItems: 'center', gap: 2,
    }}>
      {up ? '▲' : '▼'} {Math.abs(val).toFixed(2)}%
    </span>
  );
}

/* ─── Legend Dot ────────────────────────────────────────────────── */
function LegendDot({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        width: 18, height: 2.5,
        background: dashed ? 'transparent' : color,
        borderTop: dashed ? `2.5px dashed ${color}` : 'none',
        display: 'inline-block', borderRadius: 1,
      }} />
      <span style={{ fontSize: '0.62rem', color: C.slate, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

/* ─── Custom X-Axis Tick ─────────────────────────────────────────── */
function CustomXAxisTick({ x, y, payload }) {
  const lines = (payload?.value || '').split('\n');
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text key={i} x={0} y={0} dy={10 + i * 11} textAnchor="middle" fill={C.slate} fontSize={8}>
          {line}
        </text>
      ))}
    </g>
  );
}

/* ─── Shared Filter Select Style ────────────────────────────────── */
const selStyle = {
  appearance: 'none', padding: '6px 28px 6px 10px',
  fontSize: '0.78rem', fontWeight: 500, color: '#334155',
  background: '#fff', border: `1px solid ${C.border}`,
  borderRadius: 7, cursor: 'pointer', outline: 'none', width: '100%',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
};

function FilterField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 110, flex: '1 1 auto' }}>
      <span style={{
        fontSize: '0.62rem', color: C.muted, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>{label}</span>
      {children}
    </div>
  );
}

function headerBtn(bg, color, border) {
  return {
    padding: '7px 14px', background: bg, color,
    border: border ? `1px solid ${border}` : 'none',
    borderRadius: 8, fontWeight: 600,
    fontSize: '0.78rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 5,
    transition: 'all 0.18s',
  };
}

/* ─── Table Styles ──────────────────────────────────────────────── */
const TH = {
  padding: '8px 10px', fontSize: '0.62rem', fontWeight: 700, color: C.slate,
  textTransform: 'uppercase', letterSpacing: '0.04em',
  borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
};
const TD = { padding: '7px 10px', fontSize: '0.73rem', color: '#334155' };
const TH_LG = {
  padding: '10px 14px', fontSize: '0.63rem', fontWeight: 700, color: C.slate,
  textTransform: 'uppercase', letterSpacing: '0.04em',
  borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
};
const TD_LG = { padding: '9px 14px', fontSize: '0.78rem', color: '#334155' };

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                  */
/* ═══════════════════════════════════════════════════════════════ */

export default function SalesRevenueReport() {
  const navigate = useNavigate();

  /* ── Filter state ─────────────────────────────────────────────── */
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  /* ── Filter options (from /filters endpoint) ─────────────────── */
  const [filterOptions, setFilterOptions] = useState({
    legalGroups:    ['All'],
    legalEntities:  ['All'],
    parentDivs:     ['All'],
    subDivs:        ['All'],
    salesmen:       ['All'],
  });

  /* ── Data state ───────────────────────────────────────────────── */
  const [summary,        setSummary]        = useState(null);
  const [trendData,      setTrendData]      = useState([]);
  const [legalEntData,   setLegalEntData]   = useState([]);
  const [parentDivData,  setParentDivData]  = useState([]);
  const [subDivData,     setSubDivData]     = useState([]);
  const [detailData,     setDetailData]     = useState({ rows: [], totals: {} });
  const [activeTab,      setActiveTab]      = useState('all');

  /* ── Loading flags ────────────────────────────────────────────── */
  const [loading, setLoading] = useState({
    filters: true, summary: true, trend: true,
    legalEnt: true, parentDiv: true, subDiv: true, details: true,
  });

  /* ── Error state ──────────────────────────────────────────────── */
  const [errors, setErrors] = useState({});
  const [publicIp, setPublicIp] = useState('');

  useEffect(() => {
    const hasError = Object.values(errors).some(Boolean);
    if (hasError && !publicIp) {
      fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => setPublicIp(data.ip))
        .catch(err => console.error('Failed to get public IP:', err));
    }
  }, [errors, publicIp]);

  /* ── Auth redirect helper ─────────────────────────────────────── */
  const handle401 = useCallback((err) => {
    // Redirect to login on auth failures: 401, 403, or missing token flag
    if (err?.status === 401 || err?.status === 403 || err?.isAuthError) {
      navigate('/login');
    }
  }, [navigate]);

  /* ── Load filter options ──────────────────────────────────────── */
  useEffect(() => {
    fetchFilters()
      .then(data => {
        setFilterOptions({
          legalGroups:   ['All', ...(data.legal_groups   || [])],
          legalEntities: ['All', ...(data.legal_entities || [])],
          parentDivs:    ['All', ...(data.parent_divisions || [])],
          subDivs:       ['All', ...(data.sub_divisions  || [])],
          salesmen:      ['All', ...(data.salesmen        || [])],
        });
      })
      .catch(err => {
        handle401(err);
        setErrors(prev => ({ ...prev, filters: err.message || 'Failed to load filter options' }));
      })
      .finally(() => setLoading(prev => ({ ...prev, filters: false })));
  }, [handle401]);

  /* ── Fetch all data sections when applied filters change ────────── */
  const fetchAll = useCallback((f) => {
    setLoading({ filters: false, summary: true, trend: true, legalEnt: true, parentDiv: true, subDiv: true, details: true });
    setErrors({});

    const guard = (key, promise) =>
      promise
        .catch(err => {
          handle401(err);
          // For 502, include rawBody detail so user can see what backend says
          const msg = err?.rawBody
            ? `${err.message} — Backend detail: ${err.rawBody}`
            : err.message || 'Failed to load data';
          setErrors(prev => ({ ...prev, [key]: msg }));
          return null;
        })
        .finally(() => setLoading(prev => ({ ...prev, [key]: false })));

    guard('summary', fetchSummary(f)).then(d => d && setSummary(d));

    guard('trend', fetchTrend(f)).then(d => {
      if (!d) return;
      setTrendData((d.data || []).map(row => ({
        period:       row.period,
        currentYear:  row.current_year,
        previousYear: row.previous_year,
        target:       row.target,
      })));
    });

    guard('legalEnt', fetchLegalEntity(f)).then(d => {
      if (!d) return;
      setLegalEntData((d.data || []).map((row, i) => ({
        name:  row.name,
        value: row.value,
        pct:   row.pct,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })));
    });

    guard('parentDiv', fetchParentDivision(f)).then(d => {
      if (!d) return;
      setParentDivData((d.data || []).map(row => ({ name: row.name, value: row.value })));
    });

    guard('subDiv', fetchSubDivision(f)).then(d => {
      if (!d) return;
      setSubDivData((d.data || []).map((row, i) => ({
        name:  row.name.replace(/\s/g, '\n'),
        value: row.value,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })));
    });

    guard('details', fetchDetails(f)).then(d => {
      if (!d) return;
      setDetailData({
        rows:   d.rows   || [],
        totals: d.totals || {},
      });
    });
  }, [handle401]);

  useEffect(() => { fetchAll(appliedFilters); }, [appliedFilters, fetchAll]);

  /* ── Handlers ─────────────────────────────────────────────────── */
  const handleApply = () => setAppliedFilters({ ...filters });
  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };
  const updateFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  /* ── Derived KPI values ───────────────────────────────────────── */
  const mtdRevenue    = summary?.mtd_revenue    ?? null;
  const ytdRevenue    = summary?.ytd_revenue    ?? null;
  const mtdChangePct  = summary?.mtd_change_pct ?? null;
  const ytdChangePct  = summary?.ytd_change_pct ?? null;
  const topLE         = summary?.top_legal_entity;
  const topPD         = summary?.top_parent_division;
  const dataAsOf      = summary?.data_as_of ? new Date(summary.data_as_of).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : appliedFilters.toDate;

  /* ── Spark data from trend ────────────────────────────────────── */
  const sparkMTD = trendData.map(d => d.currentYear).filter(Boolean);
  const sparkYTD = trendData.map(d => d.previousYear).filter(Boolean);

  /* ── Current / Previous year labels from trend ─────────────────── */
  const currentYearLabel  = summary?.current_year_label  || 'Current Year';
  const previousYearLabel = summary?.previous_year_label || 'Previous Year';

  /* ────────────────────────────────────────────────────────────── */
  /*  RENDER                                                        */
  /* ────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="animate-in" style={{
        padding: '20px 24px 32px',
        fontFamily: "'Inter', system-ui, sans-serif",
        background: C.bg, minHeight: '100%',
      }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: C.navy, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.3rem' }}>💹</span> Sales Revenue Report
            </h1>
            <p style={{ fontSize: '0.78rem', color: C.slate, margin: '3px 0 0' }}>
              Track and analyze sales performance across all dimensions
              {dataAsOf && ` • Data as on ${dataAsOf}`}
              &nbsp;|&nbsp;
              <span style={{ color: C.green, fontWeight: 700 }}>Currency: AED</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button id="btn-export" style={{ ...headerBtn('#fff', C.navy, C.border), display: 'flex', alignItems: 'center', gap: 6 }}>
              ⬇ Export <span style={{ fontSize: '0.6rem', color: C.muted }}>▼</span>
            </button>
          </div>
        </div>

        {/* ── Global API Connection Diagnostic Notice ── */}
        {Object.values(errors).some(Boolean) && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 16,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            boxShadow: '0 2px 8px rgba(239,68,68,0.04)',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            <span style={{ fontSize: '1.25rem', marginTop: -2 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
                Backend Connection Issue (502 Bad Gateway / Network Unreachable)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                The frontend development proxy was unable to reach the live API at <code style={{ background: '#fee2e2', padding: '2px 4px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600 }}>13.233.207.68:8000</code>. This typically means the backend server is offline or your current IP is blocked by the AWS Security Group.
              </div>
              {publicIp && (
                <div style={{ marginTop: 8, fontSize: '0.74rem', color: '#7f1d1d', fontWeight: 600 }}>
                  📍 Your Public IP Address: <span style={{ textDecoration: 'underline', color: '#b91c1c', cursor: 'copy' }} onClick={() => { navigator.clipboard.writeText(publicIp); alert('Copied to clipboard!'); }} title="Click to copy">{publicIp}</span> (Share this with the backend/IT team to whitelist).
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Filter Options Error ── */}
        {errors.filters && (
          <div style={{ marginBottom: 12 }}>
            <ErrorBanner message={`Filter options: ${errors.filters}`} />
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div style={{
          background: '#fff', borderRadius: 12,
          border: `1px solid ${C.border}`,
          padding: '14px 18px', marginBottom: 16,
          display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <FilterField label="Legal Group">
            <select id="filter-legal-group" style={selStyle} value={filters.legalGroup} onChange={e => updateFilter('legalGroup', e.target.value)}>
              {filterOptions.legalGroups.map(o => <option key={o}>{o}</option>)}
            </select>
          </FilterField>

          <FilterField label="Legal Entity">
            <select id="filter-legal-entity" style={selStyle} value={filters.legalEntity} onChange={e => updateFilter('legalEntity', e.target.value)}>
              {filterOptions.legalEntities.map(o => <option key={o}>{o}</option>)}
            </select>
          </FilterField>

          <FilterField label="Parent Division">
            <select id="filter-parent-div" style={selStyle} value={filters.parentDiv} onChange={e => updateFilter('parentDiv', e.target.value)}>
              {filterOptions.parentDivs.map(o => <option key={o}>{o}</option>)}
            </select>
          </FilterField>

          <FilterField label="Sub-Division">
            <select id="filter-sub-div" style={selStyle} value={filters.subDiv} onChange={e => updateFilter('subDiv', e.target.value)}>
              {filterOptions.subDivs.map(o => <option key={o}>{o}</option>)}
            </select>
          </FilterField>

          <FilterField label="Salesman">
            <select id="filter-salesman" style={selStyle} value={filters.salesman} onChange={e => updateFilter('salesman', e.target.value)}>
              {filterOptions.salesmen.map(o => <option key={o}>{o}</option>)}
            </select>
          </FilterField>

          <FilterField label="From Date">
            <input
              id="filter-from-date" type="date" value={filters.fromDate}
              onChange={e => updateFilter('fromDate', e.target.value)}
              style={{ ...selStyle, paddingRight: 10, backgroundImage: 'none', cursor: 'pointer' }}
            />
          </FilterField>

          <FilterField label="To Date">
            <input
              id="filter-to-date" type="date" value={filters.toDate}
              onChange={e => updateFilter('toDate', e.target.value)}
              style={{ ...selStyle, paddingRight: 10, backgroundImage: 'none', cursor: 'pointer' }}
            />
          </FilterField>

          <button id="btn-apply-filter" onClick={handleApply} style={{
            ...headerBtn(C.blue, '#fff'), alignSelf: 'flex-end',
            padding: '7px 20px', fontWeight: 700, borderRadius: 8,
          }}>Apply</button>
          <button id="btn-reset-filter" onClick={handleReset} style={{
            background: 'none', border: 'none', color: C.slate,
            fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
            alignSelf: 'flex-end', padding: '7px 8px',
          }}>Reset</button>
        </div>

        {/* ── KPI Cards Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12, marginBottom: 16 }}>
          {/* Live KPI 1: Total Sales MTD */}
          <KPICard
            label="Total Sales (MTD)"
            numericValue={mtdRevenue}
            changePct={mtdChangePct}
            changeLabel="vs Prev MTD"
            up={mtdChangePct !== null ? mtdChangePct >= 0 : null}
            icon="📈"
            iconBg="linear-gradient(135deg,#dbeafe,#bfdbfe)"
            sparkData={sparkMTD}
            sparkColor={C.blue}
            loading={loading.summary}
            error={errors.summary}
          />

          {/* Live KPI 2: Sales YTD */}
          <KPICard
            label="Sales (YTD)"
            numericValue={ytdRevenue}
            changePct={ytdChangePct}
            changeLabel="vs YTD PY"
            up={ytdChangePct !== null ? ytdChangePct >= 0 : null}
            icon="📅"
            iconBg="linear-gradient(135deg,#dcfce7,#bbf7d0)"
            sparkData={sparkYTD}
            sparkColor={C.green}
            loading={loading.summary}
            error={errors.summary}
          />

          {/* Live KPI 3: Top Legal Entity */}
          <KPICard
            label="Top Legal Entity"
            numericValue={null}
            textValue={topLE?.name || '—'}
            changePct={null}
            changeLabel={topLE ? `AED ${Number(topLE.value || 0).toFixed(2)} (${Number(topLE.pct || 0).toFixed(2)}%)` : undefined}
            up={null}
            icon="🏢"
            iconBg="linear-gradient(135deg,#fff7ed,#fed7aa)"
            sparkData={null}
            sparkColor={C.orange}
            loading={loading.summary}
            error={errors.summary}
          />

          {/* Live KPI 4: Top Parent Division */}
          <KPICard
            label="Top Parent Division"
            numericValue={null}
            textValue={topPD?.name || '—'}
            changePct={null}
            changeLabel={topPD ? `AED ${Number(topPD.value || 0).toFixed(2)} (${Number(topPD.pct || 0).toFixed(2)}%)` : undefined}
            up={null}
            icon="🏭"
            iconBg="linear-gradient(135deg,#e0f2fe,#bae6fd)"
            sparkData={null}
            sparkColor={C.cyan}
            loading={loading.summary}
            error={errors.summary}
          />

          {/* CFO Pending KPI: Gross Profit */}
          <KPIPendingCard
            label="Gross Profit (MTD)"
            icon="📊"
            iconBg="linear-gradient(135deg,#ede9fe,#ddd6fe)"
          />

          {/* CFO Pending KPI: Top Salesman */}
          <KPIPendingCard
            label="Top Salesman"
            icon="👤"
            iconBg="linear-gradient(135deg,#fce7f3,#fbcfe8)"
          />
        </div>

        {/* ── CFO Pending Banner for Target vs Actual & Gross Margin ── */}
        <div style={{
          background: 'linear-gradient(90deg,#fffbeb,#fefce8)',
          border: '1px dashed #fde68a', borderRadius: 12,
          padding: '12px 18px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#92400e' }}>
              CFO Data Sources Pending
            </div>
            <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: 2 }}>
              The following widgets are awaiting data integration:&nbsp;
              <strong>Target vs Actual Revenue</strong>,&nbsp;
              <strong>Gross Profit</strong>,&nbsp;
              <strong>Gross Margin</strong>,&nbsp;
              <strong>Top 10 Customers</strong>,&nbsp;
              <strong>Top Salesman</strong>
            </div>
          </div>
        </div>

        {/* ── Charts Row 1: Trend | Legal Entity Donut | Parent Division Bar ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1.15fr', gap: 14, marginBottom: 14 }}>

          {/* Revenue Trend */}
          <ChartCard
            title="Revenue Trend (AED)"
            minHeight={240}
            loading={loading.trend}
            error={errors.trend}
            onRetry={() => fetchAll(appliedFilters)}
          >
            <ResponsiveContainer width="100%" height={180} minWidth={0}>
              <LineChart data={trendData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
                <XAxis dataKey="period" tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line dataKey="previousYear" name={previousYearLabel} stroke={C.navy} strokeWidth={2} dot={{ r: 3, fill: C.navy }} activeDot={{ r: 5 }} />
                <Line dataKey="target" name="Target" stroke={C.orange} strokeWidth={2} dot={{ r: 3, fill: C.orange }} strokeDasharray="5 3" />
                <Line dataKey="currentYear" name={currentYearLabel} stroke={C.green} strokeWidth={2.5} dot={{ r: 3, fill: C.green }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
              <LegendDot color={C.navy}   label={previousYearLabel} />
              <LegendDot color={C.orange} label="Target" dashed />
              <LegendDot color={C.green}  label={currentYearLabel} />
            </div>
          </ChartCard>

          {/* Revenue by Legal Entity – Donut */}
          <ChartCard
            title="Revenue by Legal Entity (AED)"
            minHeight={240}
            loading={loading.legalEnt}
            error={errors.legalEnt}
            onRetry={() => fetchAll(appliedFilters)}
          >
            {legalEntData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 130, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height={150} minWidth={0}>
                    <PieChart>
                      <Pie
                        data={legalEntData}
                        cx="50%" cy="50%"
                        innerRadius={40} outerRadius={62}
                        dataKey="value"
                        startAngle={90} endAngle={-270}
                        stroke="none"
                      >
                        {legalEntData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, n) => [`AED ${Number(v).toFixed(2)}`, n]}
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {legalEntData.map(g => (
                    <div key={g.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: g.color, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: '0.7rem', color: '#475569' }}>{g.name}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.navy }}>
                        {Number(g.pct).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 40 }}>No data available</div>
            )}
          </ChartCard>

          {/* Revenue by Parent Division – Horizontal Bar */}
          <ChartCard
            title="Revenue by Parent Division (AED)"
            minHeight={240}
            loading={loading.parentDiv}
            error={errors.parentDiv}
            onRetry={() => fetchAll(appliedFilters)}
          >
            {parentDivData.length > 0 ? (
              <ResponsiveContainer width="100%" height={190} minWidth={0}>
                <BarChart data={parentDivData} layout="vertical" margin={{ top: 0, right: 30, left: 24, bottom: 0 }} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f4ff" />
                  <XAxis type="number" tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} width={72} />
                  <Tooltip
                    formatter={v => [`AED ${Number(v).toFixed(2)}`]}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }}
                    cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                  />
                  <Bar dataKey="value" name="Revenue" radius={[0, 5, 5, 0]}>
                    {parentDivData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 40 }}>No data available</div>
            )}
          </ChartCard>
        </div>

        {/* ── Charts Row 2: Sub-Division Bar | Placeholder Customers | Placeholder Salesmen ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>

          {/* Revenue by Sub-Division */}
          <ChartCard
            title="Revenue by Sub-Division (AED)"
            minHeight={290}
            loading={loading.subDiv}
            error={errors.subDiv}
            onRetry={() => fetchAll(appliedFilters)}
          >
            {subDivData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220} minWidth={0}>
                <BarChart data={subDivData} margin={{ top: 8, right: 4, left: -24, bottom: 20 }} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
                  <XAxis
                    dataKey="name"
                    tick={<CustomXAxisTick />}
                    axisLine={false} tickLine={false}
                    interval={0}
                  />
                  <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={v => [`AED ${Number(v).toFixed(2)}`]}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }}
                    cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                  />
                  <Bar dataKey="value" name="Revenue" radius={[5, 5, 0, 0]}>
                    {subDivData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 60 }}>No data available</div>
            )}
          </ChartCard>

          {/* Top 10 Customers — CFO Pending Placeholder */}
          <PendingCard
            title="Top 10 Customers by Sales"
            icon="👥"
            minHeight={290}
          />

          {/* Top Salesman — CFO Pending Placeholder */}
          <PendingCard
            title="Revenue by Salesman"
            icon="🏆"
            minHeight={290}
          />
        </div>

        {/* ── CFO Pending: Target vs Actual Revenue ── */}
        <div style={{ marginBottom: 14 }}>
          <PendingCard
            title="Target vs Actual Revenue"
            icon="🎯"
            minHeight={160}
          />
        </div>

        {/* ── Detailed View Table ── */}
        <div style={{
          background: '#fff', borderRadius: 14,
          border: `1px solid ${C.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          overflow: 'hidden', marginBottom: 8,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
            background: 'linear-gradient(90deg, #f8fafc 0%, #fff 100%)',
          }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: C.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 Sales Revenue Detailed View
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'MTD', 'YTD'].map(tab => (
                <button
                  key={tab}
                  id={`tab-detail-${tab.toLowerCase()}`}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  style={{
                    padding: '5px 14px', borderRadius: 20,
                    border: 'none', cursor: 'pointer',
                    fontSize: '0.72rem', fontWeight: 700,
                    background: activeTab === tab.toLowerCase() ? C.blue : '#f1f5f9',
                    color: activeTab === tab.toLowerCase() ? '#fff' : C.slate,
                    transition: 'all 0.18s',
                  }}
                >{tab}</button>
              ))}
            </div>
          </div>

          {errors.details && (
            <div style={{ padding: '12px 20px' }}>
              <ErrorBanner message={errors.details} onRetry={() => fetchAll(appliedFilters)} />
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {[
                    ['Legal Entity',              'left'],
                    ['Parent Division',            'left'],
                    ['Sub-Division',               'left'],
                    ['Revenue (MTD) AED',          'right'],
                    ['Revenue (Prev MTD) AED',     'right'],
                    ['Revenue (YTD) AED',          'right'],
                    ['Revenue (YTD PY) AED',       'right'],
                    ['Variance % (MTD)',            'right'],
                    ['Variance % (YTD)',            'right'],
                  ].map(([h, align]) => {
                    // Filter columns based on active tab
                    if (activeTab === 'mtd' && (h.includes('YTD'))) return null;
                    if (activeTab === 'ytd' && (h.includes('MTD') && !h.includes('YTD'))) return null;
                    return <th key={h} style={{ ...TH_LG, textAlign: align }}>{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {loading.details ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <td key={j} style={TD_LG}><Skeleton h={14} /></td>
                      ))}
                    </tr>
                  ))
                ) : detailData.rows.length > 0 ? (
                  <>
                    {detailData.rows.map((row, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: `1px solid #f1f5f9`, transition: 'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {(activeTab === 'all' || activeTab === 'mtd') && (
                          <><td style={{ ...TD_LG, fontWeight: 700, color: C.navy }}>{row.legal_entity || '—'}</td>
                          <td style={TD_LG}>{row.parent_division || '—'}</td>
                          <td style={TD_LG}>{row.sub_division || '—'}</td></>
                        )}
                        {activeTab === 'ytd' && (
                          <><td style={{ ...TD_LG, fontWeight: 700, color: C.navy }}>{row.legal_entity || '—'}</td>
                          <td style={TD_LG}>{row.parent_division || '—'}</td>
                          <td style={TD_LG}>{row.sub_division || '—'}</td></>
                        )}
                        {(activeTab === 'all' || activeTab === 'mtd') && <>
                          <td style={{ ...TD_LG, textAlign: 'right', fontWeight: 600 }}>{Number(row.mtd_revenue || 0).toFixed(2)}</td>
                          <td style={{ ...TD_LG, textAlign: 'right', color: C.slate }}>{Number(row.prev_mtd_revenue || 0).toFixed(2)}</td>
                        </>}
                        {(activeTab === 'all' || activeTab === 'ytd') && <>
                          <td style={{ ...TD_LG, textAlign: 'right', fontWeight: 600 }}>{Number(row.ytd_revenue || 0).toFixed(2)}</td>
                          <td style={{ ...TD_LG, textAlign: 'right', color: C.slate }}>{Number(row.ytd_py_revenue || 0).toFixed(2)}</td>
                        </>}
                        {(activeTab === 'all' || activeTab === 'mtd') && (
                          <td style={{ ...TD_LG, textAlign: 'right' }}><VarBadge val={row.variance_mtd_pct} /></td>
                        )}
                        {(activeTab === 'all' || activeTab === 'ytd') && (
                          <td style={{ ...TD_LG, textAlign: 'right' }}><VarBadge val={row.variance_ytd_pct} /></td>
                        )}
                      </tr>
                    ))}
                    {/* Totals Row */}
                    {detailData.totals && Object.keys(detailData.totals).length > 0 && (
                      <tr style={{ background: 'linear-gradient(90deg,#eff6ff,#f0fdf4)', fontWeight: 800, borderTop: `2px solid #e0eeff` }}>
                        <td colSpan={3} style={{ ...TD_LG, color: C.navy, fontWeight: 800 }}>Total</td>
                        {(activeTab === 'all' || activeTab === 'mtd') && <>
                          <td style={{ ...TD_LG, textAlign: 'right', color: C.navy }}>{Number(detailData.totals.mtd_revenue || 0).toFixed(2)}</td>
                          <td style={{ ...TD_LG, textAlign: 'right', color: C.slate }}>{Number(detailData.totals.prev_mtd_revenue || 0).toFixed(2)}</td>
                        </>}
                        {(activeTab === 'all' || activeTab === 'ytd') && <>
                          <td style={{ ...TD_LG, textAlign: 'right', color: C.navy }}>{Number(detailData.totals.ytd_revenue || 0).toFixed(2)}</td>
                          <td style={{ ...TD_LG, textAlign: 'right', color: C.slate }}>{Number(detailData.totals.ytd_py_revenue || 0).toFixed(2)}</td>
                        </>}
                        {(activeTab === 'all' || activeTab === 'mtd') && (
                          <td style={{ ...TD_LG, textAlign: 'right' }}><VarBadge val={detailData.totals.variance_mtd_pct} /></td>
                        )}
                        {(activeTab === 'all' || activeTab === 'ytd') && (
                          <td style={{ ...TD_LG, textAlign: 'right' }}><VarBadge val={detailData.totals.variance_ytd_pct} /></td>
                        )}
                      </tr>
                    )}
                  </>
                ) : !errors.details ? (
                  <tr>
                    <td colSpan={9} style={{ ...TD_LG, textAlign: 'center', color: C.muted, padding: '32px 14px' }}>
                      No records found for the selected filters
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          fontSize: '0.65rem', color: C.muted,
          display: 'flex', justifyContent: 'space-between',
          paddingTop: 10, paddingBottom: 4, flexWrap: 'wrap', gap: 4,
        }}>
          <span>
            All values are in <strong>AED</strong>&nbsp;|&nbsp;
            {dataAsOf && `Data as on ${dataAsOf}`}&nbsp;|&nbsp;
            <span style={{ color: C.green, fontWeight: 700 }}>● Live</span>
          </span>
          <span>☁️ Source: Oracle Fusion Cloud</span>
        </div>

      </div>
    </>
  );
}
