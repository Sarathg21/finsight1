import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
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
  teal:    '#0d9488',
  slate:   '#64748b',
  muted:   '#94a3b8',
  bg:      '#f1f5fb',
  surface: '#ffffff',
  border:  '#e2e8f0',
};

/* ─── Sparkline data ───────────────────────────────────────────── */
const SP_REV    = [85,90,95,100,105,108,112,118,120,123,126,125.75];
const SP_GP     = [20,22,24,25,26,27,27.5,28,28.2,28.3,28.4,28.35];
const SP_EBITDA = [14,15,16,17,17.5,18,18.1,18.3,18.4,18.4,18.42,18.42];
const SP_NP     = [8,8.5,9,9.5,9.8,10,10.1,10.2,10.24,10.25,10.25,10.25];
const SP_NPM    = [6,6.5,7,7.5,7.8,8,8.1,8.12,8.14,8.15,8.15,8.15];
const SP_EBITM  = [12,13,13.5,14,14.2,14.4,14.5,14.6,14.64,14.65,14.66,14.66];

/* ─── KPI Infolet config ───────────────────────────────────────── */
const KPI_CARDS = [
  {
    id: 'total-rev', label: 'Total Revenue (MTD)',
    value: '₹ 125.75 Cr', change: '18.86% vs Mar 2024', up: true,
    iconBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', icon: '📈',
    spark: SP_REV, sparkColor: C.blue,
  },
  {
    id: 'gross-profit', label: 'Gross Profit (MTD)',
    value: '₹ 28.35 Cr', change: '17.11% vs Mar 2024', up: true,
    iconBg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', icon: '💰',
    spark: SP_GP, sparkColor: C.green,
  },
  {
    id: 'ebitda', label: 'EBITDA (MTD)',
    value: '₹ 18.42 Cr', change: '15.46% vs Mar 2024', up: true,
    iconBg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', icon: '📊',
    spark: SP_EBITDA, sparkColor: C.purple,
  },
  {
    id: 'net-profit', label: 'Net Profit (MTD)',
    value: '₹ 10.25 Cr', change: '23.11% vs Mar 2024', up: true,
    iconBg: 'linear-gradient(135deg,#fff7ed,#fed7aa)', icon: '🏆',
    spark: SP_NP, sparkColor: C.orange,
  },
  {
    id: 'np-margin', label: 'Net Profit Margin (MTD)',
    value: '8.15%', change: '0.79% vs Mar 2024', up: true,
    iconBg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', icon: '📉',
    spark: SP_NPM, sparkColor: C.cyan,
  },
  {
    id: 'ebitda-margin', label: 'EBITDA Margin (MTD)',
    value: '14.66%', change: '0.62% vs Mar 2024', up: true,
    iconBg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)', icon: '⏰',
    spark: SP_EBITM, sparkColor: '#e879a0',
  },
];

/* ─── P&L Trend chart ──────────────────────────────────────────── */
const PL_TREND = [
  { month: 'Nov', Revenue: 95,  'Gross Profit': 22, 'Net Profit': 8  },
  { month: 'Dec', Revenue: 132, 'Gross Profit': 29, 'Net Profit': 12 },
  { month: 'Jan', Revenue: 88,  'Gross Profit': 20, 'Net Profit': 7  },
  { month: 'Feb', Revenue: 142, 'Gross Profit': 31, 'Net Profit': 13 },
  { month: 'Mar', Revenue: 118, 'Gross Profit': 26, 'Net Profit': 10 },
  { month: 'Apr', Revenue: 126, 'Gross Profit': 28, 'Net Profit': 10 },
];

/* ─── P&L Comparison chart ─────────────────────────────────────── */
const PL_COMP = [
  { label: 'Revenue',      apr24: 126, mar24: 112, apr23: 95  },
  { label: 'Gross Profit', apr24: 28,  mar24: 27,  apr23: 22  },
  { label: 'EBITDA',       apr24: 18,  mar24: 15,  apr23: 12  },
  { label: 'Net Profit',   apr24: 10,  mar24: 10,  apr23: 8   },
];

/* ─── Expense Breakdown donut ──────────────────────────────────── */
const EXPENSE_PIE = [
  { name: 'Employee Cost',    value: 36.80, pct: '34.2%', color: '#1a3a6b' },
  { name: 'Sales & Marketing',value: 20.00, pct: '18.6%', color: '#2563eb' },
  { name: 'Admin Expenses',   value: 13.35, pct: '12.4%', color: '#7c3aed' },
  { name: 'Finance Cost',     value: 10.55, pct: '9.8%',  color: '#0891b2' },
  { name: 'Depreciation',     value: 8.05,  pct: '7.5%',  color: '#0d9488' },
  { name: 'Others',           value: 18.87, pct: '17.5%', color: '#e11d48' },
];

/* ─── P&L Statement rows ───────────────────────────────────────── */
const PL_STATEMENT = {
  income: {
    label: 'INCOME',
    rows: [
      { label: 'Total Revenue',    curr: 125.75, prev: 112.40, varAmt: 13.35, varPct: 11.88,  ytd: 1215.60, ytdPY: 1045.32, ytdVar: 16.29 },
      { label: 'Other Income',     curr: 3.25,   prev: 2.76,   varAmt: 0.49,  varPct: 17.75,  ytd: 32.40,   ytdPY: 28.30,   ytdVar: 14.49 },
    ],
    total: { label: 'Total Income', curr: 129.00, prev: 115.16, varAmt: 13.84, varPct: 12.01, ytd: 1248.00, ytdPY: 1073.62, ytdVar: 16.24 },
  },
  cogs: {
    label: 'COST OF GOODS SOLD',
    rows: [
      { label: 'Cost of Goods Sold', curr: 100.65, prev: 88.21, varAmt: 12.44, varPct: 14.11, ytd: 976.40, ytdPY: 831.50, ytdVar: 17.43 },
    ],
    total: { label: 'Gross Profit', curr: 28.35, prev: 26.95, varAmt: 1.40, varPct: 5.20, ytd: 271.60, ytdPY: 242.12, ytdVar: 12.18 },
    pctRow: { label: 'Gross Profit %', curr: '22.57%', prev: '23.40%', varAmt: '-0.83%', varPct: null, ytd: '21.74%', ytdPY: '23.19%', ytdVar: null },
  },
  expenses: {
    label: 'EXPENSES',
    rows: [
      { label: 'Employee Cost',        curr: 36.80, prev: 33.10, varAmt: 3.70,  varPct: 11.18, ytd: 359.20, ytdPY: 305.40, ytdVar: 17.63 },
      { label: 'Sales & Marketing',    curr: 20.00, prev: 17.90, varAmt: 2.10,  varPct: 11.73, ytd: 198.40, ytdPY: 162.80, ytdVar: 21.88 },
      { label: 'Administrative Expenses',curr:13.35,prev: 11.80, varAmt: 1.55,  varPct: 13.14, ytd: 125.60, ytdPY: 108.30, ytdVar: 15.98 },
      { label: 'Finance Cost',         curr: 10.55, prev: 9.85,  varAmt: 0.70,  varPct: 7.11,  ytd: 98.20,  ytdPY: 88.90,  ytdVar: 10.46 },
      { label: 'Depreciation',         curr: 8.05,  prev: 7.60,  varAmt: 0.45,  varPct: 5.92,  ytd: 76.40,  ytdPY: 68.00,  ytdVar: 12.35 },
      { label: 'Other Expenses',       curr: 18.87, prev: 16.42, varAmt: 2.45,  varPct: 14.92, ytd: 176.20, ytdPY: 155.10, ytdVar: 13.60 },
    ],
    total: { label: 'Total Expenses', curr: 107.62, prev: 96.67, varAmt: 10.95, varPct: 11.32, ytd: 1033.60, ytdPY: 888.50, ytdVar: 16.34 },
    ebitda: { label: 'EBITDA', curr: 18.42, prev: 19.48, varAmt: -1.06, varPct: -5.44, ytd: 214.00, ytdPY: 185.12, ytdVar: 15.61 },
    ebitdaPct: { label: 'EBITDA %', curr: '14.66%', prev: '16.91%', varAmt: '-2.25%', varPct: null, ytd: '17.15%', ytdPY: '17.24%', ytdVar: null },
  },
  bottom: {
    rows: [
      { label: 'Net Profit Before Tax', curr: 12.65, prev: 13.15, varAmt: -0.50, varPct: -3.80, ytd: 148.20, ytdPY: 127.80, ytdVar: 15.97 },
      { label: 'Tax Expense',           curr: 2.40,  prev: 2.68,  varAmt: -0.28, varPct: -10.45,ytd: 28.00,  ytdPY: 24.60,  ytdVar: 13.82 },
    ],
    total: { label: 'Net Profit', curr: 10.25, prev: 10.47, varAmt: -0.22, varPct: -2.10, ytd: 120.20, ytdPY: 103.20, ytdVar: 16.48 },
  },
};

/* ─── Animated Counter Hook ─────────────────────────────────────── */
function useCounter(target, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (typeof target !== 'number') return;
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

/* ─── Mini Sparkline ─────────────────────────────────────────────── */
function Sparkline({ data, color, height = 38 }) {
  if (!data) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 100, h = height;
  const xs = data.map((_, i) => (i / (data.length - 1)) * w);
  const ys = data.map(v => h - ((v - min) / (max - min || 1)) * h * 0.82 - h * 0.09);
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height, display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spg-${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r="2.8" fill={color} />
    </svg>
  );
}

/* ─── KPI Infolet Card (matches reference image style) ─────────── */
function KPICard({ id, label, value, change, up, icon, iconBg, spark, sparkColor }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      id={`kpi-${id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        borderRadius: 12,
        border: `1px solid ${hover ? '#c7d7f7' : C.border}`,
        padding: '14px 14px 10px',
        boxShadow: hover ? '0 8px 28px rgba(37,99,235,0.12)' : '0 2px 6px rgba(0,0,0,0.05)',
        transition: 'all 0.22s ease',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 4,
        overflow: 'hidden', position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.62rem', color: C.slate, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: C.navy, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value}
          </div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      {spark && (
        <div style={{ margin: '2px -2px 0' }}>
          <Sparkline data={spark} color={sparkColor} height={34} />
        </div>
      )}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: '0.6rem', fontWeight: 700,
        color: up ? C.green : C.rose,
        background: up ? '#f0fdf4' : '#fff1f2',
        borderRadius: 100, padding: '2px 7px',
        width: 'fit-content',
      }}>
        <span>{up ? '▲' : '▼'}</span>
        <span>{change}</span>
      </div>
    </div>
  );
}

/* ─── Shared filter dropdown style ──────────────────────────────── */
const selStyle = {
  appearance: 'none', padding: '5px 24px 5px 9px',
  fontSize: '0.75rem', fontWeight: 500, color: '#334155',
  background: '#fff', border: `1px solid ${C.border}`,
  borderRadius: 7, cursor: 'pointer', outline: 'none', width: '100%',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 7px center',
};
const dateStyle = { ...selStyle, paddingRight: 9, backgroundImage: 'none' };

function FilterField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 100, flex: '1 1 auto' }}>
      <span style={{ fontSize: '0.6rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      {children}
    </div>
  );
}

/* ─── Custom tooltip ─────────────────────────────────────────────── */
const ChartTip = ({ active, payload, label, unit = '₹', suffix = ' Cr' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '0.73rem' }}>
      <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
          <span style={{ color: C.slate }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: C.navy }}>{unit}{p.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── P&L Statement Table helpers ───────────────────────────────── */
function fmt(v) {
  if (v === null || v === undefined || v === '-') return '-';
  if (typeof v === 'string') return v;
  return v.toFixed(2);
}
function VarCell({ v, pct }) {
  if (v === null || v === undefined) return <td style={TD_NUM}>-</td>;
  if (typeof v === 'string') return <td style={{ ...TD_NUM, color: C.slate }}>{v}</td>;
  const pos = v >= 0;
  return (
    <td style={{ ...TD_NUM, color: pos ? C.green : C.rose, fontWeight: 700 }}>
      {pos ? '▲' : '▼'} {Math.abs(v).toFixed(2)}{pct ? '%' : ''}
    </td>
  );
}

const TH = { padding: '9px 10px', textAlign: 'right', fontSize: '0.68rem', fontWeight: 700, color: '#fff', borderBottom: `1px solid #1e3a6e`, whiteSpace: 'nowrap' };
const TH_L = { ...TH, textAlign: 'left' };
const TD = { padding: '7px 10px', textAlign: 'right', fontSize: '0.76rem', color: '#334155', borderBottom: `1px solid #f1f5f9` };
const TD_L = { ...TD, textAlign: 'left', color: C.navy };
const TD_NUM = { ...TD };

/* ─── Section rows render ────────────────────────────────────────── */
function PLRow({ row, indent = false, isTotal = false, isBold = false, isGreen = false, isGray = false }) {
  const bgStyle = isTotal ? { background: '#e8f0fe', fontWeight: 700 }
    : isGray ? { background: '#f8fafc', color: C.muted }
    : { background: 'transparent' };
  const labelColor = isGreen ? C.green : isTotal ? C.navy : '#334155';

  return (
    <tr style={{ ...bgStyle, transition: 'background 0.12s' }}
      onMouseEnter={e => !isTotal && (e.currentTarget.style.background = '#f0f6ff')}
      onMouseLeave={e => !isTotal && (e.currentTarget.style.background = bgStyle.background || 'transparent')}
    >
      <td style={{ ...TD_L, paddingLeft: indent ? 24 : 10, fontWeight: isTotal || isBold ? 700 : 400, color: labelColor, fontSize: isTotal ? '0.77rem' : '0.76rem' }}>
        {row.label}
      </td>
      <td style={{ ...TD, fontWeight: isTotal ? 700 : 400 }}>{fmt(row.curr)}</td>
      <td style={{ ...TD, color: C.slate }}>{fmt(row.prev)}</td>
      {row.varAmt !== undefined ? (
        <VarCell v={typeof row.varAmt === 'string' ? row.varAmt : row.varAmt} />
      ) : <td style={TD}>-</td>}
      {row.varPct !== undefined && row.varPct !== null ? (
        <VarCell v={row.varPct} pct />
      ) : <td style={TD}>-</td>}
      <td style={{ ...TD, fontWeight: isTotal ? 700 : 400 }}>{fmt(row.ytd)}</td>
      <td style={{ ...TD, color: C.slate }}>{fmt(row.ytdPY)}</td>
      {row.ytdVar !== undefined && row.ytdVar !== null ? (
        <VarCell v={row.ytdVar} pct />
      ) : <td style={TD}>-</td>}
    </tr>
  );
}

/* ─── Section header row ─────────────────────────────────────────── */
function SectionHeader({ label, expanded, onToggle }) {
  return (
    <tr style={{ background: '#1a3a6b', cursor: 'pointer' }} onClick={onToggle}>
      <td colSpan={8} style={{ padding: '7px 10px', fontSize: '0.72rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
        <span style={{ marginRight: 6, fontSize: '0.65rem', display: 'inline-block', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</span>
        {label}
      </td>
    </tr>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function PLAnalytics() {
  const [legalGroup,   setLegalGroup]   = useState('FJ Group (Consolidated)');
  const [legalEntity,  setLegalEntity]  = useState('All');
  const [parentDiv,    setParentDiv]    = useState('All');
  const [subDiv,       setSubDiv]       = useState('All');
  const [businessUnit, setBusinessUnit] = useState('All');
  const [period,       setPeriod]       = useState('2024-04');
  const [compareWith,  setCompareWith]  = useState('2024-03');

  const [secIncome,   setSecIncome]   = useState(true);
  const [secCOGS,     setSecCOGS]     = useState(true);
  const [secExpenses, setSecExpenses] = useState(true);

  return (
    <div className="animate-in" style={{ padding: '20px 24px 32px', fontFamily: "'Inter', system-ui, sans-serif", background: C.bg, minHeight: '100%' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, margin: 0 }}>
            Profit &amp; Loss Account
          </h1>
          <p style={{ fontSize: '0.76rem', color: C.slate, margin: '3px 0 0' }}>
            Analyze profitability and track financial performance
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button id="btn-export-pl" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: C.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            ⬇ Export <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>▼</span>
          </button>
          <button id="btn-schedule-pl" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', color: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
            📅 Schedule
          </button>
          <button id="btn-filters-pl" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', color: C.navy, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
            🔽 More Filters
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <FilterField label="Legal Group">
          <select id="filter-pl-legal-group" style={selStyle} value={legalGroup} onChange={e => setLegalGroup(e.target.value)}>
            {['FJ Group (Consolidated)', 'Group A', 'Group B'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="Legal Entity">
          <select id="filter-pl-legal-entity" style={selStyle} value={legalEntity} onChange={e => setLegalEntity(e.target.value)}>
            {['All', 'Alpine Coils', 'DC Serve', 'Filter Fan', 'Alpine Gears'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="Parent Division">
          <select id="filter-pl-parent-div" style={selStyle} value={parentDiv} onChange={e => setParentDiv(e.target.value)}>
            {['All', 'Alpine', 'DC Serve', 'Alpine Gears', 'Others'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="Sub-Division">
          <select id="filter-pl-sub-div" style={selStyle} value={subDiv} onChange={e => setSubDiv(e.target.value)}>
            {['All', 'Alpine Coils', 'DC Serve Equip.', 'Filter Fan - UAE', 'CT KSA'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="Business Unit">
          <select id="filter-pl-bu" style={selStyle} value={businessUnit} onChange={e => setBusinessUnit(e.target.value)}>
            {['All', 'Coils BU', 'Service BU', 'Fans BU', 'Gears BU', 'Valves BU', 'CT BU'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="Period">
          <input id="filter-pl-period" type="month" value={period} onChange={e => setPeriod(e.target.value)} style={dateStyle} />
        </FilterField>
        <FilterField label="Compare With">
          <input id="filter-pl-compare" type="month" value={compareWith} onChange={e => setCompareWith(e.target.value)} style={dateStyle} />
        </FilterField>
        <button id="btn-pl-apply" style={{ padding: '6px 18px', background: C.blue, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>Apply</button>
        <button id="btn-pl-reset" style={{ background: 'none', border: 'none', color: C.slate, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-end', padding: '6px 4px' }}>Reset</button>
      </div>

      {/* ── KPI Infolets (6 columns) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 16 }}>
        {KPI_CARDS.map(kpi => <KPICard key={kpi.id} {...kpi} />)}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>

        {/* P&L Trend */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>P&amp;L Trend (AED M) ⓘ</div>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1.1rem' }}>⋮</button>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={PL_TREND} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
              <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Line dataKey="Revenue"      name="Revenue"      stroke={C.navy}   strokeWidth={2.2} dot={{ r: 3, fill: C.navy }}   activeDot={{ r: 5 }} />
              <Line dataKey="Gross Profit" name="Gross Profit" stroke={C.green}  strokeWidth={2.2} dot={{ r: 3, fill: C.green }}  activeDot={{ r: 5 }} />
              <Line dataKey="Net Profit"   name="Net Profit"   stroke={C.orange} strokeWidth={2.2} dot={{ r: 3, fill: C.orange }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 6 }}>
            {[['Revenue', C.navy], ['Gross Profit', C.green], ['Net Profit', C.orange]].map(([l, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 18, height: 2.5, background: c, display: 'inline-block', borderRadius: 1 }} />
                <span style={{ fontSize: '0.6rem', color: C.slate, fontWeight: 500 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* P&L Comparison */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>P&amp;L Comparison (AED M)</div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1.1rem' }}>⋮</button>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={PL_COMP} margin={{ top: 8, right: 6, left: -22, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
              <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="apr24" name="Apr 2024" fill={C.blue}   radius={[3,3,0,0]} barSize={14} />
              <Bar dataKey="mar24" name="Mar 2024" fill="#93c5fd"  radius={[3,3,0,0]} barSize={14} />
              <Bar dataKey="apr23" name="Apr 2023" fill="#cbd5e1"  radius={[3,3,0,0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 6 }}>
            {[['Apr 2024', C.blue], ['Mar 2024', '#93c5fd'], ['Apr 2023', '#cbd5e1']].map(([l, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, background: c, display: 'inline-block', borderRadius: 2 }} />
                <span style={{ fontSize: '0.6rem', color: C.slate, fontWeight: 500 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown donut */}
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy, marginBottom: 8 }}>Expense Breakdown (MTD)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: '0 0 140px' }}>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={EXPENSE_PIE} cx="50%" cy="50%" innerRadius={42} outerRadius={64} dataKey="value" startAngle={90} endAngle={-270} stroke="none" labelLine={false}>
                    {EXPENSE_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`₹${v} Cr`, n]} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: -4 }}>
                <div style={{ fontSize: '0.6rem', color: C.muted, fontWeight: 600 }}>Total Expenses</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: C.navy }}>₹ 107.62 Cr</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {EXPENSE_PIE.map(e => (
                <div key={e.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: e.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.65rem', color: '#475569' }}>{e.name}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: C.navy }}>{e.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── P&L Statement Table ── */}
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 8 }}>
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(90deg,#f8fafc,#fff)' }}>
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: C.navy }}>📋 Profit &amp; Loss Statement (AED M)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
            <thead>
              <tr style={{ background: '#1a3a6b' }}>
                <th style={{ ...TH_L, width: '24%' }}>Particulars</th>
                <th style={TH}>Current Month<br /><span style={{ fontWeight: 400, opacity: 0.8 }}>Apr 2024</span></th>
                <th style={TH}>Previous Month<br /><span style={{ fontWeight: 400, opacity: 0.8 }}>Mar 2024</span></th>
                <th style={TH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.8 }}>(AED M)</span></th>
                <th style={TH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.8 }}>(%)</span></th>
                <th style={TH}>YTD (Apr 2024)</th>
                <th style={TH}>YTD (Apr 2023)</th>
                <th style={TH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.8 }}>(%)</span></th>
              </tr>
            </thead>
            <tbody>
              {/* INCOME */}
              <SectionHeader label="INCOME" expanded={secIncome} onToggle={() => setSecIncome(p => !p)} />
              {secIncome && <>
                {PL_STATEMENT.income.rows.map(r => <PLRow key={r.label} row={r} indent />)}
                <PLRow row={PL_STATEMENT.income.total} isTotal />
              </>}

              {/* COST OF GOODS SOLD */}
              <SectionHeader label="COST OF GOODS SOLD" expanded={secCOGS} onToggle={() => setSecCOGS(p => !p)} />
              {secCOGS && <>
                {PL_STATEMENT.cogs.rows.map(r => <PLRow key={r.label} row={r} indent />)}
                <PLRow row={PL_STATEMENT.cogs.total} isTotal isGreen />
                <PLRow row={PL_STATEMENT.cogs.pctRow} isGray />
              </>}

              {/* EXPENSES */}
              <SectionHeader label="EXPENSES" expanded={secExpenses} onToggle={() => setSecExpenses(p => !p)} />
              {secExpenses && <>
                {PL_STATEMENT.expenses.rows.map(r => <PLRow key={r.label} row={r} indent />)}
                <PLRow row={PL_STATEMENT.expenses.total} isTotal />
                <PLRow row={PL_STATEMENT.expenses.ebitda} isBold isGreen />
                <PLRow row={PL_STATEMENT.expenses.ebitdaPct} isGray />
              </>}

              {/* Bottom rows */}
              {PL_STATEMENT.bottom.rows.map(r => <PLRow key={r.label} row={r} indent />)}

              {/* Net Profit */}
              <tr style={{ background: '#16a34a', fontWeight: 800 }}>
                <td style={{ ...TD_L, color: '#fff', fontWeight: 800, fontSize: '0.82rem' }}>Net Profit</td>
                <td style={{ ...TD_NUM, color: '#fff', fontWeight: 800 }}>{fmt(PL_STATEMENT.bottom.total.curr)}</td>
                <td style={{ ...TD_NUM, color: 'rgba(255,255,255,0.8)' }}>{fmt(PL_STATEMENT.bottom.total.prev)}</td>
                <td style={{ ...TD_NUM, color: '#fff', fontWeight: 700 }}>▼ {Math.abs(PL_STATEMENT.bottom.total.varAmt).toFixed(2)}</td>
                <td style={{ ...TD_NUM, color: '#fff', fontWeight: 700 }}>▼ {Math.abs(PL_STATEMENT.bottom.total.varPct).toFixed(2)}%</td>
                <td style={{ ...TD_NUM, color: '#fff', fontWeight: 800 }}>{fmt(PL_STATEMENT.bottom.total.ytd)}</td>
                <td style={{ ...TD_NUM, color: 'rgba(255,255,255,0.8)' }}>{fmt(PL_STATEMENT.bottom.total.ytdPY)}</td>
                <td style={{ ...TD_NUM, color: '#fff', fontWeight: 700 }}>▲ {PL_STATEMENT.bottom.total.ytdVar.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ fontSize: '0.65rem', color: C.muted, display: 'flex', justifyContent: 'space-between', paddingTop: 8, flexWrap: 'wrap', gap: 4 }}>
        <span>All values are in AED M &nbsp;|&nbsp; Data as on 30 Apr 2024</span>
        <span>☁️ Source: Oracle Fusion Cloud</span>
      </div>

    </div>
  );
}
