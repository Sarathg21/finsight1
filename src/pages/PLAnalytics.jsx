import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

import { C } from '../utils/theme';

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
    value: '125.75', change: '18.86%', changeLabel: 'vs Mar 2024',
    iconBg: '#eff6ff', color: '#2563eb',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
        <path d="M19 9v6" />
        <path d="M19 9h-6" />
      </svg>
    ),
    spark: SP_REV, sparkColor: '#3b82f6',
  },
  {
    id: 'gross-profit', label: 'Gross Profit (MTD)',
    value: '28.35', change: '17.11%', changeLabel: 'vs Mar 2024',
    iconBg: '#f0fdf4', color: '#16a34a',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 8h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" fillOpacity="0.5"/>
        <path d="M6 4h12v4H6z"/>
        <circle cx="12" cy="14" r="2" fill="#fff"/>
        <rect x="10" y="18" width="4" height="2" fill="#fff"/>
      </svg>
    ),
    spark: SP_GP, sparkColor: '#22c55e',
  },
  {
    id: 'ebitda', label: 'EBITDA (MTD)',
    value: '18.42', change: '15.45%', changeLabel: 'vs Mar 2024',
    iconBg: '#faf5ff', color: '#9333ea',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
        <path d="M13 5l5 4" strokeOpacity="0.5" />
      </svg>
    ),
    spark: SP_EBITDA, sparkColor: '#a855f7',
  },
  {
    id: 'net-profit', label: 'Net Profit (MTD)',
    value: '10.25', change: '23.11%', changeLabel: 'vs Mar 2024',
    iconBg: '#fff7ed', color: '#ea580c',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        <circle cx="12" cy="12" r="4.5" fill="#fff" />
      </svg>
    ),
    spark: SP_NP, sparkColor: '#f97316',
  },
  {
    id: 'np-margin', label: 'Net Profit Margin (MTD)',
    value: '8.15%', change: '0.73%', changeLabel: 'vs Mar 2024',
    iconBg: '#f0fdfa', color: '#0d9488',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l8.29-8.29c.94-.94.94-2.48 0-3.42L12 2Z" fillOpacity="0.4"/>
        <circle cx="7" cy="7" r="2.5" fill="#fff"/>
        <path d="M12 2l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    spark: SP_NPM, sparkColor: '#14b8a6',
  },
  {
    id: 'ebitda-margin', label: 'EBITDA Margin (MTD)',
    value: '14.66%', change: '0.62%', changeLabel: 'vs Mar 2024',
    iconBg: '#fdf2f8', color: '#db2777',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    spark: SP_EBITM, sparkColor: '#ec4899',
  },
];

/* ─── P&L Trend chart ──────────────────────────────────────────── */
const PL_TREND = [
  { month: 'Nov', Revenue: 95,  'Gross Profit': 22, 'Net Profit': 8  },
  { month: 'Dec', Revenue: 132, 'Gross Profit': 29, 'Net Profit': 12 },
  { month: 'Jan', Revenue: 110, 'Gross Profit': 24, 'Net Profit': 9  },
  { month: 'Feb', Revenue: 115, 'Gross Profit': 26, 'Net Profit': 10 },
  { month: 'Mar', Revenue: 120, 'Gross Profit': 27, 'Net Profit': 11 },
  { month: 'Apr', Revenue: 125.75, 'Gross Profit': 28.35, 'Net Profit': 10.25 },
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
  { name: 'Employee Cost',    value: 36.80, pct: '34.2%', color: '#3b82f6' },
  { name: 'Sales & Marketing',value: 20.00, pct: '18.6%', color: '#22c55e' },
  { name: 'Admin Expenses',   value: 13.35, pct: '12.4%', color: '#a855f7' },
  { name: 'Finance Cost',     value: 10.55, pct: '9.8%',  color: '#eab308' },
  { name: 'Depreciation',     value: 8.05,  pct: '7.5%',  color: '#06b6d4' },
  { name: 'Others',           value: 18.87, pct: '17.5%', color: '#ec4899' },
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

/* ─── KPI Infolet Card (matches reference image style) ─────────── */
function KPICard({ id, label, value, change, changeLabel, color, iconBg, icon, spark, sparkColor }) {
  const [hover, setHover] = useState(false);
  const accent = color || '#2563eb';

  // Format spark points for SVG polyline
  const max = Math.max(...spark);
  const min = Math.min(...spark);
  const W = 110, H = 16;
  const pointsData = spark.map((v, i) => {
    const x = (i / (spark.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * (H - 2) - 1;
    return { x, y };
  });
  const svgPoints = pointsData.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div
      id={`kpi-${id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1, minWidth: 145,
        background: `linear-gradient(145deg, #fff 0%, ${iconBg} 50%, ${accent}15 100%)`,
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: hover ? `0 8px 24px ${accent}20` : '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.04)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex', 
        alignItems: 'center', 
        gap: 12,
        overflow: 'hidden', 
        position: 'relative',
        minHeight: 82,
      }}
    >
      {/* Left: Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: accent, fontSize: '1.2rem',
      }}>
        {icon}
      </div>

      {/* Right: Text Stack + Sparkline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1, justifyContent: 'center' }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, color: accent,
          lineHeight: 1.2,
          whiteSpace: 'nowrap'
        }}>
          {label}
        </span>
        
        <div style={{
          fontSize: '1.05rem',
          fontWeight: 800, color: '#0f172a', lineHeight: 1.1,
          letterSpacing: '-0.02em',
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word',
          marginTop: 1,
        }}>
          {value.includes('%') ? value : `₹ ${value} Cr`}
        </div>

        {(change || changeLabel) && (
          <div style={{
            fontSize: '0.62rem', fontWeight: 600, color: '#64748b',
            lineHeight: 1.1, marginTop: 1,
            whiteSpace: 'nowrap'
          }}>
            {change && <span style={{ color: !change?.toString().startsWith('-') ? '#16a34a' : '#dc2626', marginRight: 3 }}>
              {!change?.toString().startsWith('-') ? '▲' : '▼'} {change.replace('-', '')}
            </span>}
            {changeLabel}
          </div>
        )}

        {/* Sparkline at bottom */}
        <div style={{ marginTop: 6 }}>
          <svg width="100%" height={H} preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
            <polyline
              points={svgPoints}
              fill="none"
              stroke={sparkColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {pointsData.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={1.5} fill={sparkColor} />
            ))}
          </svg>
        </div>
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
      <span style={{ fontSize: '0.66rem', color: '#1e3a8a', fontWeight: 700, letterSpacing: '-0.02em' }}>{label}</span>
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

const TH = { padding: '10px 10px', textAlign: 'right', fontSize: '0.74rem', fontWeight: 700, color: '#1e3a8a', background: '#f8fafc', borderBottom: `2px solid #e2e8f0`, whiteSpace: 'nowrap' };
const TH_L = { ...TH, textAlign: 'left' };
const TD = { padding: '8px 10px', textAlign: 'right', fontSize: '0.74rem', color: '#334155', borderBottom: `1px solid #f1f5f9` };
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
    <tr style={{ background: '#fff', cursor: 'pointer', borderBottom: `1px solid ${C.border}` }} onClick={onToggle}>
      <td colSpan={8} style={{ padding: '7px 10px', fontSize: '0.72rem', fontWeight: 800, color: C.navy, letterSpacing: '0.04em' }}>
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

  const [secIncome,    setSecIncome]    = useState(true);
  const [secCOGS,      setSecCOGS]      = useState(true);
  const [secExpenses,  setSecExpenses]  = useState(true);

  /* ── Scale factor from filter selections ────────────────────────── */
  /* Each option is a known proportion of the consolidated total.       */
  const scale = useMemo(() => {
    const g = ({ 'FJ Group (Consolidated)': 1.00, 'Group A': 0.62, 'Group B': 0.38 })[legalGroup] ?? 1;
    const e = ({ All: 1.00, 'Alpine Coils': 0.34, 'DC Serve': 0.22, 'Filter Fan': 0.18, 'Alpine Gears': 0.16 })[legalEntity] ?? 1;
    const d = ({ All: 1.00, Alpine: 0.52, 'DC Serve': 0.22, 'Alpine Gears': 0.16, Others: 0.10 })[parentDiv] ?? 1;
    const s = ({ All: 1.00, 'Alpine Coils': 0.34, 'DC Serve Equip.': 0.22, 'Filter Fan - UAE': 0.18, 'CT KSA': 0.08 })[subDiv] ?? 1;
    const b = ({ All: 1.00, 'Coils BU': 0.34, 'Service BU': 0.22, 'Fans BU': 0.18, 'Gears BU': 0.16, 'Valves BU': 0.05, 'CT BU': 0.05 })[businessUnit] ?? 1;
    // Apply whichever filter is most specific (not all selected)
    const factors = [g];
    if (legalEntity !== 'All') factors.push(e);
    if (parentDiv !== 'All') factors.push(d);
    if (subDiv !== 'All') factors.push(s);
    if (businessUnit !== 'All') factors.push(b);
    return Math.min(...factors);
  }, [legalGroup, legalEntity, parentDiv, subDiv, businessUnit]);

  /* ── Scaled KPI cards ── */
  const scaledKPIs = useMemo(() => [
    { id: 'total-rev',    label: 'Total Revenue (MTD)',    value: `₹ ${(125.75 * scale).toFixed(2)} Cr`, change: '18.86% vs Mar 2024', up: true,  icon: '📈', iconBg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)', spark: SP_REV.map(v => +(v * scale).toFixed(2)),    sparkColor: C.blue },
    { id: 'gross-profit', label: 'Gross Profit (MTD)',    value: `₹ ${(28.35 * scale).toFixed(2)} Cr`,  change: '17.11% vs Mar 2024', up: true,  icon: '💰', iconBg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', spark: SP_GP.map(v => +(v * scale).toFixed(2)),     sparkColor: C.green },
    { id: 'ebitda',       label: 'EBITDA (MTD)',           value: `₹ ${(18.42 * scale).toFixed(2)} Cr`,  change: '15.46% vs Mar 2024', up: true,  icon: '📊', iconBg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', spark: SP_EBITDA.map(v => +(v * scale).toFixed(2)), sparkColor: C.purple },
    { id: 'net-profit',   label: 'Net Profit (MTD)',      value: `₹ ${(10.25 * scale).toFixed(2)} Cr`,  change: '23.11% vs Mar 2024', up: true,  icon: '🏆', iconBg: 'linear-gradient(135deg,#fff7ed,#fed7aa)', spark: SP_NP.map(v => +(v * scale).toFixed(2)),     sparkColor: C.orange },
    { id: 'np-margin',    label: 'Net Profit Margin (MTD)', value: '8.15%',                               change: '0.79% vs Mar 2024',  up: true,  icon: '📉', iconBg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', spark: SP_NPM,                                     sparkColor: C.cyan },
    { id: 'ebitda-margin',label: 'EBITDA Margin (MTD)',   value: '14.66%',                               change: '0.62% vs Mar 2024',  up: true,  icon: '⏰', iconBg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)', spark: SP_EBITM,                                    sparkColor: '#e879a0' },
  ], [scale]);

  /* ── Scaled chart data ── */
  const scaledPLTrend = useMemo(() =>
    PL_TREND.map(m => ({
      ...m,
      Revenue:       +(m.Revenue       * scale).toFixed(1),
      'Gross Profit': +(m['Gross Profit'] * scale).toFixed(1),
      'Net Profit':   +(m['Net Profit']   * scale).toFixed(1),
    })), [scale]);

  const scaledPLComp = useMemo(() =>
    PL_COMP.map(r => ({
      ...r,
      apr24: +(r.apr24 * scale).toFixed(1),
      mar24: +(r.mar24 * scale).toFixed(1),
      apr23: +(r.apr23 * scale).toFixed(1),
    })), [scale]);

  /* ── Scaled expense pie ── */
  const scaledExpPie = useMemo(() =>
    EXPENSE_PIE.map(e => ({ ...e, value: +(e.value * scale).toFixed(2) })), [scale]);
  const totalExpenses = useMemo(() =>
    scaledExpPie.reduce((s, e) => s + e.value, 0).toFixed(2), [scaledExpPie]);

  /* ── Scaled P&L statement ── */
  const scaleRow = (r) => {
    if (!r || typeof r.curr !== 'number') return r; // percentage rows pass through
    return {
      ...r,
      curr:   +(r.curr   * scale).toFixed(2),
      prev:   +(r.prev   * scale).toFixed(2),
      varAmt: typeof r.varAmt === 'number' ? +(r.varAmt * scale).toFixed(2) : r.varAmt,
      ytd:    +(r.ytd    * scale).toFixed(2),
      ytdPY:  +(r.ytdPY  * scale).toFixed(2),
    };
  };
  const scaledPL = useMemo(() => ({
    income: {
      ...PL_STATEMENT.income,
      rows:  PL_STATEMENT.income.rows.map(scaleRow),
      total: scaleRow(PL_STATEMENT.income.total),
    },
    cogs: {
      ...PL_STATEMENT.cogs,
      rows:  PL_STATEMENT.cogs.rows.map(scaleRow),
      total: scaleRow(PL_STATEMENT.cogs.total),
    },
    expenses: {
      ...PL_STATEMENT.expenses,
      rows:   PL_STATEMENT.expenses.rows.map(scaleRow),
      total:  scaleRow(PL_STATEMENT.expenses.total),
      ebitda: scaleRow(PL_STATEMENT.expenses.ebitda),
    },
    bottom: {
      rows:  PL_STATEMENT.bottom.rows.map(scaleRow),
      total: scaleRow(PL_STATEMENT.bottom.total),
    },
  }), [scale]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="animate-in" style={{ padding: '20px 0 32px', background: C.bg, minHeight: '100%' }}>

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
          <button id="btn-export-pl" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
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
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
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
        <button id="btn-pl-apply" style={{ padding: '6px 18px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}>Apply</button>
        <button id="btn-pl-reset" style={{ background: 'none', border: 'none', color: C.slate, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-end', padding: '6px 4px' }}>Reset</button>
      </div>

      {/* ── KPI Infolets (6 columns) ── */}
      <div className="grid-cols-6" style={{ marginBottom: 16 }}>
        {KPI_CARDS.map(kpi => <KPICard key={kpi.id} {...kpi} />)}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid-cols-3" style={{ marginBottom: 16 }}>

        {/* P&L Trend */}
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>P&amp;L Trend (₹ Cr) ⓘ</div>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1.1rem' }}>⋮</button>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={scaledPLTrend} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
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
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>P&amp;L Comparison (₹ Cr)</div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1.1rem' }}>⋮</button>
          </div>
          <ResponsiveContainer width="100%" height={190}>
              <BarChart data={scaledPLComp} margin={{ top: 8, right: 6, left: -22, bottom: 0 }} barCategoryGap="30%">
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
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy, marginBottom: 8 }}>Expense Breakdown (MTD)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: '0 0 140px' }}>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={scaledExpPie} cx="50%" cy="50%" innerRadius={42} outerRadius={64} dataKey="value" startAngle={90} endAngle={-270} stroke="none" labelLine={false}>
                    {scaledExpPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`₹${v} Cr`, n]} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: -4 }}>
                <div style={{ fontSize: '0.6rem', color: C.muted, fontWeight: 600 }}>Total Expenses</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: C.navy }}>₹ {totalExpenses} Cr</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scaledExpPie.map(e => (
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
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(90deg,#f8fafc,#fff)' }}>
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: C.navy }}>Profit &amp; Loss Statement (₹ Cr)</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ ...TH_L, width: '24%' }}>Particulars</th>
                <th style={TH}>Current Month<br /><span style={{ fontWeight: 400, opacity: 0.8 }}>Apr 2024</span></th>
                <th style={TH}>Previous Month<br /><span style={{ fontWeight: 400, opacity: 0.8 }}>Mar 2024</span></th>
                <th style={TH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.8 }}>(₹ Cr)</span></th>
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
                {scaledPL.income.rows.map(r => <PLRow key={r.label} row={r} indent />)}
                <PLRow row={scaledPL.income.total} isTotal />
              </>}

              {/* COST OF GOODS SOLD */}
              <SectionHeader label="COST OF GOODS SOLD" expanded={secCOGS} onToggle={() => setSecCOGS(p => !p)} />
              {secCOGS && <>
                {scaledPL.cogs.rows.map(r => <PLRow key={r.label} row={r} indent />)}
                <PLRow row={scaledPL.cogs.total} isTotal isGreen />
                <PLRow row={scaledPL.cogs.pctRow} isGray />
              </>}

              {/* EXPENSES */}
              <SectionHeader label="EXPENSES" expanded={secExpenses} onToggle={() => setSecExpenses(p => !p)} />
              {secExpenses && <>
                {scaledPL.expenses.rows.map(r => <PLRow key={r.label} row={r} indent />)}
                <PLRow row={scaledPL.expenses.total} isTotal />
                <PLRow row={scaledPL.expenses.ebitda} isBold isGreen />
                <PLRow row={PL_STATEMENT.expenses.ebitdaPct} isGray />
              </>}

              {/* Bottom rows */}
              {scaledPL.bottom.rows.map(r => <PLRow key={r.label} row={r} indent />)}

              {/* Net Profit */}
              <tr style={{ background: '#f0fdf4', fontWeight: 800 }}>
                <td style={{ ...TD_L, color: C.green, fontWeight: 800, fontSize: '0.82rem' }}>Net Profit</td>
                <td style={{ ...TD_NUM, color: C.green, fontWeight: 800 }}>{fmt(scaledPL.bottom.total.curr)}</td>
                <td style={{ ...TD_NUM, color: C.green }}>{fmt(scaledPL.bottom.total.prev)}</td>
                <td style={{ ...TD_NUM, color: C.rose, fontWeight: 700 }}>▼ {Math.abs(scaledPL.bottom.total.varAmt).toFixed(2)}</td>
                <td style={{ ...TD_NUM, color: C.rose, fontWeight: 700 }}>▼ {Math.abs(scaledPL.bottom.total.varPct).toFixed(2)}%</td>
                <td style={{ ...TD_NUM, color: C.green, fontWeight: 800 }}>{fmt(scaledPL.bottom.total.ytd)}</td>
                <td style={{ ...TD_NUM, color: C.green }}>{fmt(scaledPL.bottom.total.ytdPY)}</td>
                <td style={{ ...TD_NUM, color: C.green, fontWeight: 700 }}>▲ {PL_STATEMENT.bottom.total.ytdVar.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ fontSize: '0.65rem', color: C.muted, display: 'flex', justifyContent: 'space-between', paddingTop: 8, flexWrap: 'wrap', gap: 4 }}>
        <span>All values are in INR (₹ Cr) &nbsp;|&nbsp; Data as on 30 Apr 2024</span>
        <span>☁️ Source: Oracle Fusion Cloud</span>
      </div>

    </div>
  );
}
