import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, Legend,
} from 'recharts';

/* ─── Color Palette ────────────────────────────────────────────── */
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

/* ─── Mock Data ─────────────────────────────────────────────────── */
const SPARK_TREND = [60, 72, 65, 80, 75, 95, 88, 105, 98, 120, 115, 126];
const SPARK_YTD   = [80, 95, 100, 110, 125, 130, 140, 155, 160, 180, 190, 210];
const SPARK_GP    = [10, 14, 12, 16, 14, 18, 17, 20, 19, 24, 22, 28];

const KPI_CARDS = [
  {
    id: 'mtd', label: 'Total Sales (MTD)', value: 125.75, prefix: '₹', suffix: ' Cr',
    change: '18.86% vs Mar 2024', up: true, iconBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
    icon: '📈', spark: SPARK_TREND, sparkColor: C.blue,
  },
  {
    id: 'ytd', label: 'Sales (YTD)', value: 1215.60, prefix: '₹', suffix: ' Cr',
    change: '21.35% vs YTD Apr 2023', up: true, iconBg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
    icon: '📅', spark: SPARK_YTD, sparkColor: C.green,
  },
  {
    id: 'gp', label: 'Gross Profit (MTD)', value: 28.35, prefix: '₹', suffix: ' Cr',
    change: '17.11% vs Mar 2024', up: true, iconBg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
    icon: '📊', spark: SPARK_GP, sparkColor: C.purple,
  },
  {
    id: 'le', label: 'Top Legal Entity', value: null, textVal: 'Alpine Coils',
    change: '₹ 45.20 Cr (35.94%)', up: null, iconBg: 'linear-gradient(135deg,#fff7ed,#fed7aa)',
    icon: '🏢', spark: null, sparkColor: C.orange,
  },
  {
    id: 'pd', label: 'Top Parent Division', value: null, textVal: 'Alpine',
    change: '₹ 68.45 Cr (35.50%)', up: null, iconBg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)',
    icon: '🏭', spark: null, sparkColor: C.cyan,
  },
  {
    id: 'sm', label: 'Top Salesman', value: null, textVal: 'Ramesh Kumar',
    change: '₹ 12.80 Cr (10.18%)', up: null, iconBg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)',
    icon: '👤', spark: null, sparkColor: C.rose,
  },
];

const REVENUE_TREND = [
  { month: 'Nov', fy2324: 95,  fy2425: 118, target: 110 },
  { month: 'Dec', fy2324: 132, fy2425: 148, target: 140 },
  { month: 'Jan', fy2324: 88,  fy2425: 122, target: 108 },
  { month: 'Feb', fy2324: 150, fy2425: 142, target: 135 },
  { month: 'Mar', fy2324: 118, fy2425: 168, target: 155 },
  { month: 'Apr', fy2324: 142, fy2425: 200, target: 175 },
];

const LEGAL_ENTITY_PIE = [
  { name: 'Alpine Coils', value: 45.2, pct: '45.2%', color: '#2563eb' },
  { name: 'DC Serve',     value: 22.1, pct: '22.1%', color: '#16a34a' },
  { name: 'Filter Fan',   value: 16.6, pct: '16.6%', color: '#7c3aed' },
  { name: 'Alpine Gears', value: 10.6, pct: '10.6%', color: '#f59e0b' },
  { name: 'Others',       value: 5.5,  pct: '5.5%',  color: '#0891b2' },
];

const PARENT_DIV_DATA = [
  { name: 'Alpine',       value: 68.45 },
  { name: 'DC Serve',     value: 28.30 },
  { name: 'Filter Fan',   value: 16.90 },
  { name: 'Alpine Gears', value: 8.60  },
  { name: 'Others',       value: 3.50  },
];

const SUB_DIV_DATA = [
  { name: 'Alpine\nCoils',     value: 28.20, color: '#2563eb' },
  { name: 'DC Serve\nEquip.',  value: 18.40, color: '#16a34a' },
  { name: 'Filter Fan\n- UAE', value: 12.10, color: '#7c3aed' },
  { name: 'Alpine\nGears',     value: 7.80,  color: '#f59e0b' },
  { name: 'Valves\nKSA',       value: 6.40,  color: '#0891b2' },
  { name: 'CT\nKSA',           value: 4.20,  color: '#e11d48' },
  { name: 'Others',            value: 2.95,  color: '#64748b' },
];

const TOP_CUSTOMERS = [
  { id: 1,  name: 'Customer A', sales: 12.80, pct: 10.18 },
  { id: 2,  name: 'Customer B', sales: 9.65,  pct: 7.67  },
  { id: 3,  name: 'Customer C', sales: 7.45,  pct: 5.92  },
  { id: 4,  name: 'Customer D', sales: 6.10,  pct: 4.85  },
  { id: 5,  name: 'Customer E', sales: 5.30,  pct: 4.21  },
  { id: 6,  name: 'Customer F', sales: 4.75,  pct: 3.78  },
  { id: 7,  name: 'Customer G', sales: 4.20,  pct: 3.34  },
  { id: 8,  name: 'Customer H', sales: 3.90,  pct: 3.10  },
  { id: 9,  name: 'Customer I', sales: 3.60,  pct: 2.86  },
  { id: 10, name: 'Customer J', sales: 3.05,  pct: 2.42  },
];
const CUST_TOTAL = { sales: 60.80, pct: 48.33 };

const TOP_SALESMEN = [
  { id: 1,  name: 'Ramesh Kumar',  sales: 12.80, pct: 10.18 },
  { id: 2,  name: 'Sanjay Singh',  sales: 9.20,  pct: 7.32  },
  { id: 3,  name: 'Arun Verma',    sales: 8.45,  pct: 6.72  },
  { id: 4,  name: 'Imran Khan',    sales: 7.60,  pct: 6.05  },
  { id: 5,  name: 'Vikram Rao',    sales: 6.25,  pct: 4.97  },
  { id: 6,  name: 'Naveed Ali',    sales: 5.40,  pct: 4.29  },
  { id: 7,  name: 'Manoj Patel',   sales: 4.80,  pct: 3.82  },
  { id: 8,  name: 'Prakash Yadav', sales: 4.10,  pct: 3.26  },
  { id: 9,  name: 'Suresh Babu',   sales: 3.75,  pct: 2.98  },
  { id: 10, name: 'Amit Gupta',    sales: 3.20,  pct: 2.54  },
];
const SALES_TOTAL = { sales: 65.55, pct: 52.13 };

const DETAILED = [
  { legal:'Alpine Coils',  parent:'Alpine',       sub:'Alpine Coils',     bu:'Coils BU',   mtd:28.20, prevMTD:24.10, ytd:268.45, ytdPY:225.30, varMTD:17.01, varYTD:19.15 },
  { legal:'DC Serve',      parent:'DC Serve',     sub:'DC Serve Equip.',  bu:'Service BU', mtd:18.40, prevMTD:16.20, ytd:184.30, ytdPY:152.10, varMTD:13.58, varYTD:21.16 },
  { legal:'Filter Fan',    parent:'Alpine',       sub:'Filter Fan - UAE', bu:'Fans BU',    mtd:12.10, prevMTD:9.80,  ytd:128.40, ytdPY:110.20, varMTD:23.47, varYTD:16.51 },
  { legal:'Alpine Gears',  parent:'Alpine Gears', sub:'Alpine Gears',     bu:'Gears BU',   mtd:7.80,  prevMTD:6.50,  ytd:78.60,  ytdPY:64.20,  varMTD:20.00, varYTD:22.43 },
  { legal:'Valves KSA',    parent:'DC Serve',     sub:'Valves KSA',       bu:'Valves BU',  mtd:6.40,  prevMTD:5.60,  ytd:64.25,  ytdPY:52.80,  varMTD:14.29, varYTD:21.67 },
  { legal:'CT KSA',        parent:'DC Serve',     sub:'CT KSA',           bu:'CT BU',      mtd:4.20,  prevMTD:3.80,  ytd:42.30,  ytdPY:34.60,  varMTD:10.53, varYTD:22.25 },
  { legal:'Others',        parent:'Others',       sub:'Others',           bu:'Others',     mtd:2.95,  prevMTD:2.70,  ytd:32.40,  ytdPY:28.10,  varMTD:9.26,  varYTD:15.30 },
];
const DET_TOTAL = { mtd:79.05, prevMTD:68.70, ytd:798.70, ytdPY:667.30, varMTD:15.07, varYTD:19.70 };

/* ─── Animated Counter Hook ───────────────────────────────────── */
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === null) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* ─── Mini Sparkline ──────────────────────────────────────────── */
function Sparkline({ data, color, height = 40 }) {
  if (!data) return null;
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
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3" fill={color} />
    </svg>
  );
}

/* ─── KPI Card ────────────────────────────────────────────────── */
function KPICard({ label, value, prefix, suffix, textVal, change, up, icon, iconBg, spark, sparkColor }) {
  const animated = useCounter(value, 1000);
  const [hover, setHover] = useState(false);

  const displayVal = value !== null
    ? `${prefix}${animated >= 1000 ? animated.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',') : animated.toFixed(2)}${suffix}`
    : textVal;

  return (
    <div
      id={`kpi-${label.replace(/\s+/g,'-').toLowerCase()}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        borderRadius: 14,
        border: `1px solid ${hover ? '#c7d7f7' : C.border}`,
        padding: '16px 16px 10px',
        boxShadow: hover
          ? '0 8px 28px rgba(37,99,235,0.12)'
          : '0 2px 6px rgba(0,0,0,0.05)',
        transition: 'all 0.22s ease',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 6,
        overflow: 'hidden', position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.68rem', color: C.slate, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{
            fontSize: value !== null ? '1.15rem' : '0.95rem',
            fontWeight: 800, color: C.navy, lineHeight: 1.15,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {displayVal}
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', flexShrink: 0, marginLeft: 8,
        }}>
          {icon}
        </div>
      </div>

      {/* Spark */}
      {spark && (
        <div style={{ margin: '2px -2px 0' }}>
          <Sparkline data={spark} color={sparkColor} height={34} />
        </div>
      )}

      {/* Change pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: '0.62rem', fontWeight: 700,
        color: up === true ? C.green : up === false ? C.rose : '#475569',
        background: up === true ? '#f0fdf4' : up === false ? '#fff1f2' : '#f8fafc',
        borderRadius: 100, padding: '3px 8px',
        width: 'fit-content', marginTop: spark ? 0 : 2,
      }}>
        {up === true && <span>▲</span>}
        {up === false && <span>▼</span>}
        <span>{change}</span>
      </div>
    </div>
  );
}

/* ─── Chart Card ──────────────────────────────────────────────── */
function ChartCard({ title, children, minHeight }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: `1px solid ${C.border}`,
      padding: '16px 18px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column',
      minHeight: minHeight || 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>{title}</span>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.muted, fontSize: '1.1rem', lineHeight: 1, padding: '2px 4px',
          borderRadius: 4,
        }}>⋮</button>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

/* ─── Shared filter styles ─────────────────────────────────────── */
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
      <span style={{ fontSize: '0.62rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      {children}
    </div>
  );
}

/* ─── Custom Tooltip ──────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      fontSize: '0.75rem',
    }}>
      <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
          <span style={{ color: C.slate }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: C.navy }}>₹{p.value} Cr</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Variance Badge ──────────────────────────────────────────── */
function VarBadge({ val }) {
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

/* ─── Donut Center Label ──────────────────────────────────────── */
function DonutLabel({ cx, cy }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-8" style={{ fontWeight: 800, fontSize: '1.1rem', fill: C.navy }}>125.75</tspan>
      <tspan x={cx} dy="16" style={{ fontSize: '0.6rem', fill: C.slate }}>₹ Cr (MTD)</tspan>
    </text>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function SalesRevenueReport() {
  const [legalGroup,   setLegalGroup]   = useState('FJ Group (Consolidated)');
  const [legalEntity,  setLegalEntity]  = useState('All');
  const [parentDiv,    setParentDiv]    = useState('All');
  const [subDiv,       setSubDiv]       = useState('All');
  const [businessUnit, setBusinessUnit] = useState('All');
  const [salesman,     setSalesman]     = useState('All');
  const [fromDate,     setFromDate]     = useState('2024-04-01');
  const [toDate,       setToDate]       = useState('2024-04-30');
  const [activeTab,    setActiveTab]    = useState('all');

  return (
    <div className="animate-in" style={{
      padding: '20px 24px 32px',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: C.bg,
      minHeight: '100%',
    }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: C.navy, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.3rem' }}>💹</span> Sales Revenue Report
          </h1>
          <p style={{ fontSize: '0.78rem', color: C.slate, margin: '3px 0 0' }}>
            Track and analyze sales performance across all dimensions • Data as on 30 Apr 2024
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button id="btn-filter-toggle" style={headerBtn(C.blue, '#fff')}>
            🔽 Filter
          </button>
          <button id="btn-schedule" style={headerBtn('#fff', '#334155', C.border)}>
            📅 Schedule
          </button>
          <button id="btn-export" style={{
            ...headerBtn('#fff', C.navy, C.border),
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ⬇ Export <span style={{ fontSize: '0.6rem', color: C.muted }}>▼</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div style={{
        background: '#fff', borderRadius: 12,
        border: `1px solid ${C.border}`,
        padding: '14px 18px', marginBottom: 16,
        display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <FilterField label="Legal Group">
          <select id="filter-legal-group" style={selStyle} value={legalGroup} onChange={e => setLegalGroup(e.target.value)}>
            {['FJ Group (Consolidated)', 'Group A', 'Group B'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>

        <FilterField label="Legal Entity">
          <select id="filter-legal-entity" style={selStyle} value={legalEntity} onChange={e => setLegalEntity(e.target.value)}>
            {['All', 'Alpine Coils', 'DC Serve', 'Filter Fan', 'Alpine Gears'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>

        <FilterField label="Parent Division">
          <select id="filter-parent-div" style={selStyle} value={parentDiv} onChange={e => setParentDiv(e.target.value)}>
            {['All', 'Alpine', 'DC Serve', 'Alpine Gears', 'Others'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>

        <FilterField label="Sub-Division">
          <select id="filter-sub-div" style={selStyle} value={subDiv} onChange={e => setSubDiv(e.target.value)}>
            {['All', 'Alpine Coils', 'DC Serve Equip.', 'Filter Fan - UAE', 'CT KSA'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>

        <FilterField label="Business Unit">
          <select id="filter-bu" style={selStyle} value={businessUnit} onChange={e => setBusinessUnit(e.target.value)}>
            {['All', 'Coils BU', 'Service BU', 'Fans BU', 'Gears BU', 'Valves BU', 'CT BU'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>

        <FilterField label="Salesman">
          <select id="filter-salesman" style={selStyle} value={salesman} onChange={e => setSalesman(e.target.value)}>
            {['All', 'Ramesh Kumar', 'Sanjay Singh', 'Arun Verma', 'Imran Khan'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>

        <FilterField label="From Date">
          <input
            id="filter-from-date" type="date" value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            style={{ ...selStyle, paddingRight: 10, backgroundImage: 'none', cursor: 'pointer' }}
          />
        </FilterField>

        <FilterField label="To Date">
          <input
            id="filter-to-date" type="date" value={toDate}
            onChange={e => setToDate(e.target.value)}
            style={{ ...selStyle, paddingRight: 10, backgroundImage: 'none', cursor: 'pointer' }}
          />
        </FilterField>

        <button id="btn-apply-filter" style={{
          ...headerBtn(C.blue, '#fff'), alignSelf: 'flex-end', padding: '7px 20px',
          fontWeight: 700, borderRadius: 8,
        }}>Apply</button>
        <button id="btn-reset-filter" style={{
          background: 'none', border: 'none', color: C.slate, fontWeight: 600,
          fontSize: '0.8rem', cursor: 'pointer', alignSelf: 'flex-end', padding: '7px 8px',
        }}>Reset</button>
      </div>

      {/* ── KPI Cards (6 columns) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 12, marginBottom: 16,
      }}>
        {KPI_CARDS.map(kpi => <KPICard key={kpi.id} {...kpi} />)}
      </div>

      {/* ── Charts Row 1: Trend | Legal Entity Donut | Parent Division Bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1.15fr', gap: 14, marginBottom: 14 }}>

        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend (₹ Cr)" minHeight={240}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={REVENUE_TREND} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.green} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
              <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line dataKey="fy2324" name="FY 23-24"         stroke={C.navy}   strokeWidth={2} dot={{ r: 3, fill: C.navy }}   activeDot={{ r: 5 }} />
              <Line dataKey="target" name="Target (FY 24-25)" stroke={C.orange} strokeWidth={2} dot={{ r: 3, fill: C.orange }} strokeDasharray="5 3" />
              <Line dataKey="fy2425" name="FY 24-25"         stroke={C.green}  strokeWidth={2.5} dot={{ r: 3, fill: C.green }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            <LegendDot color={C.navy}   label="FY 23-24" />
            <LegendDot color={C.orange} label="Target (FY 24-25)" dashed />
            <LegendDot color={C.green}  label="FY 24-25" />
          </div>
        </ChartCard>

        {/* Revenue by Legal Entity – Donut */}
        <ChartCard title="Revenue by Legal Entity (₹ Cr)" minHeight={240}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 130, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={LEGAL_ENTITY_PIE}
                    cx="50%" cy="50%"
                    innerRadius={40} outerRadius={62}
                    dataKey="value"
                    startAngle={90} endAngle={-270}
                    stroke="none"
                    labelLine={false}
                  >
                    {LEGAL_ENTITY_PIE.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [`${v}%`, n]}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LEGAL_ENTITY_PIE.map(g => (
                <div key={g.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: g.color, flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.7rem', color: '#475569' }}>{g.name}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.navy }}>{g.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Revenue by Parent Division – Horizontal Bar */}
        <ChartCard title="Revenue by Parent Division (₹ Cr)" minHeight={240}>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={PARENT_DIV_DATA} layout="vertical"
              margin={{ top: 0, right: 30, left: 24, bottom: 0 }} barSize={14}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f4ff" />
              <XAxis type="number" tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} width={68} />
              <Tooltip
                formatter={(v) => [`₹${v} Cr`]}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }}
                cursor={{ fill: 'rgba(37,99,235,0.05)' }}
              />
              <Bar dataKey="value" name="Revenue" radius={[0, 5, 5, 0]}>
                {PARENT_DIV_DATA.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? C.blue : i === 1 ? C.green : i === 2 ? C.purple : i === 3 ? C.orange : C.slate} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Charts Row 2: Sub-Division Bar | Customers | Salesmen ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Revenue by Sub-Division */}
        <ChartCard title="Revenue by Sub-Division (₹ Cr)" minHeight={290}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SUB_DIV_DATA} margin={{ top: 8, right: 4, left: -24, bottom: 20 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
              <XAxis
                dataKey="name"
                tick={<CustomXAxisTick />}
                axisLine={false} tickLine={false}
                interval={0}
              />
              <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [`₹${v} Cr`]}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }}
                cursor={{ fill: 'rgba(37,99,235,0.05)' }}
              />
              <Bar dataKey="value" name="Revenue" radius={[5, 5, 0, 0]}>
                {SUB_DIV_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top 10 Customers */}
        <ChartCard title="Top 10 Customers by Sales (₹ Cr)" minHeight={290}>
          <div style={{ overflowY: 'auto', maxHeight: 230 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                  {['#', 'Customer Name', 'Sales', '% Share'].map((h, i) => (
                    <th key={h} style={{ ...TH, textAlign: i >= 2 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_CUSTOMERS.map(row => (
                  <tr key={row.id} style={{ borderBottom: `1px solid #f1f5f9` }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...TD, color: C.muted, fontWeight: 600 }}>{row.id}</td>
                    <td style={TD}>{row.name}</td>
                    <td style={{ ...TD, textAlign: 'right', fontWeight: 600, color: C.navy }}>{row.sales.toFixed(2)}</td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden' }}>
                          <div style={{ width: `${(row.pct / 12) * 100}%`, height: '100%', background: C.blue, borderRadius: 2 }} />
                        </div>
                        <span style={{ color: C.blue, fontWeight: 700, fontSize: '0.7rem' }}>{row.pct.toFixed(2)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#f0f7ff', fontWeight: 800 }}>
                  <td colSpan={2} style={{ ...TD, color: C.navy }}>Total</td>
                  <td style={{ ...TD, textAlign: 'right', color: C.navy }}>{CUST_TOTAL.sales.toFixed(2)}</td>
                  <td style={{ ...TD, textAlign: 'right', color: C.blue }}>{CUST_TOTAL.pct.toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* Revenue by Salesman */}
        <ChartCard title="Revenue by Salesman (₹ Cr)" minHeight={290}>
          <div style={{ overflowY: 'auto', maxHeight: 230 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                  {['#', 'Salesman', 'Sales', '% Share'].map((h, i) => (
                    <th key={h} style={{ ...TH, textAlign: i >= 2 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_SALESMEN.map(row => (
                  <tr key={row.id} style={{ borderBottom: `1px solid #f1f5f9` }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...TD, color: C.muted, fontWeight: 600 }}>{row.id}</td>
                    <td style={TD}>{row.name}</td>
                    <td style={{ ...TD, textAlign: 'right', fontWeight: 600, color: C.navy }}>{row.sales.toFixed(2)}</td>
                    <td style={{ ...TD, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden' }}>
                          <div style={{ width: `${(row.pct / 12) * 100}%`, height: '100%', background: C.green, borderRadius: 2 }} />
                        </div>
                        <span style={{ color: C.green, fontWeight: 700, fontSize: '0.7rem' }}>{row.pct.toFixed(2)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#f0fdf4', fontWeight: 800 }}>
                  <td colSpan={2} style={{ ...TD, color: C.navy }}>Total</td>
                  <td style={{ ...TD, textAlign: 'right', color: C.navy }}>{SALES_TOTAL.sales.toFixed(2)}</td>
                  <td style={{ ...TD, textAlign: 'right', color: C.green }}>{SALES_TOTAL.pct.toFixed(2)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ChartCard>
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {[
                  ['Legal Entity', 'left'],
                  ['Parent Division', 'left'],
                  ['Sub-Division', 'left'],
                  ['Business Unit', 'left'],
                  ['Revenue (MTD) ₹ Cr', 'right'],
                  ['Revenue (Prev MTD) ₹ Cr', 'right'],
                  ['Revenue (YTD) ₹ Cr', 'right'],
                  ['Revenue (YTD PY) ₹ Cr', 'right'],
                  ['Variance % (MTD)', 'right'],
                  ['Variance % (YTD)', 'right'],
                ].map(([h, align]) => (
                  <th key={h} style={{ ...TH_LG, textAlign: align }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DETAILED.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: `1px solid #f1f5f9`, transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...TD_LG, fontWeight: 700, color: C.navy }}>{row.legal}</td>
                  <td style={TD_LG}>{row.parent}</td>
                  <td style={TD_LG}>{row.sub}</td>
                  <td style={{ ...TD_LG, color: C.slate }}>{row.bu}</td>
                  <td style={{ ...TD_LG, textAlign: 'right', fontWeight: 600 }}>{row.mtd.toFixed(2)}</td>
                  <td style={{ ...TD_LG, textAlign: 'right', color: C.slate }}>{row.prevMTD.toFixed(2)}</td>
                  <td style={{ ...TD_LG, textAlign: 'right', fontWeight: 600 }}>{row.ytd.toFixed(2)}</td>
                  <td style={{ ...TD_LG, textAlign: 'right', color: C.slate }}>{row.ytdPY.toFixed(2)}</td>
                  <td style={{ ...TD_LG, textAlign: 'right' }}><VarBadge val={row.varMTD} /></td>
                  <td style={{ ...TD_LG, textAlign: 'right' }}><VarBadge val={row.varYTD} /></td>
                </tr>
              ))}
              {/* Total Row */}
              <tr style={{ background: 'linear-gradient(90deg,#eff6ff,#f0fdf4)', fontWeight: 800, borderTop: `2px solid #e0eeff` }}>
                <td colSpan={4} style={{ ...TD_LG, color: C.navy, fontWeight: 800 }}>Total</td>
                <td style={{ ...TD_LG, textAlign: 'right', color: C.navy }}>{DET_TOTAL.mtd.toFixed(2)}</td>
                <td style={{ ...TD_LG, textAlign: 'right', color: C.slate }}>{DET_TOTAL.prevMTD.toFixed(2)}</td>
                <td style={{ ...TD_LG, textAlign: 'right', color: C.navy }}>{DET_TOTAL.ytd.toFixed(2)}</td>
                <td style={{ ...TD_LG, textAlign: 'right', color: C.slate }}>{DET_TOTAL.ytdPY.toFixed(2)}</td>
                <td style={{ ...TD_LG, textAlign: 'right' }}><VarBadge val={DET_TOTAL.varMTD} /></td>
                <td style={{ ...TD_LG, textAlign: 'right' }}><VarBadge val={DET_TOTAL.varYTD} /></td>
              </tr>
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
        <span>All values are in INR (₹ Cr) &nbsp;|&nbsp; Data as on 30 Apr 2024 &nbsp;|&nbsp; <span style={{ color: C.blue, fontWeight: 700 }}>Live</span></span>
        <span>☁️ Source: Oracle Fusion Cloud</span>
      </div>

    </div>
  );
}

/* ─── Helper: Custom X-Axis Tick for Sub-Division ─────────────── */
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

/* ─── Helper: Legend Dot ───────────────────────────────────────── */
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

/* ─── Helper: header button style ─────────────────────────────── */
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

/* ─── Shared Table Styles ──────────────────────────────────────── */
const TH = {
  padding: '8px 10px',
  fontSize: '0.62rem', fontWeight: 700, color: C.slate,
  textTransform: 'uppercase', letterSpacing: '0.04em',
  borderBottom: `1px solid ${C.border}`,
  whiteSpace: 'nowrap',
};

const TD = {
  padding: '7px 10px',
  fontSize: '0.73rem', color: '#334155',
};

const TH_LG = {
  padding: '10px 14px',
  fontSize: '0.63rem', fontWeight: 700, color: C.slate,
  textTransform: 'uppercase', letterSpacing: '0.04em',
  borderBottom: `1px solid ${C.border}`,
  whiteSpace: 'nowrap',
};

const TD_LG = {
  padding: '9px 14px',
  fontSize: '0.78rem', color: '#334155',
};
