/**
 * PLTrendCard.jsx  ·  Enterprise Edition
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium P&L Trend Dashboard Card — Bloomberg / TradingView quality
 *
 * PRESERVED (no changes):
 *  • All calculations, data, business logic
 *  • Split-Scale functionality
 *  • Focus Margins functionality
 *  • Export / copy logic
 *  • Recharts implementation
 *  • Existing theme architecture
 *
 * ENHANCED:
 *  • Gradient line strokes via SVG defs
 *  • Smooth draw-in animation (1000ms ease-in-out, per series)
 *  • Executive glassmorphism tooltip (all margins + growth %)
 *  • 4 KPI summary cards above chart (count-up animation)
 *  • AI Executive Insight panel replacing anomaly chips
 *  • Premium legend: hover highlight, click fade, double-click isolate
 *  • Dashed crosshair + horizontal guide on hover
 *  • Ripple active dots
 *  • Premium pill controls with glow active state
 *  • Extended kebab menu (CSV / Excel / PDF / Copy / Image / Fullscreen)
 *  • Full responsive layout (desktop → tablet → mobile)
 *  • GPU-accelerated micro-interactions throughout
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, {
  useState, useRef, useEffect, useCallback, useMemo, Fragment
} from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import html2canvas from 'html2canvas';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS  (data & palette — unchanged)
═══════════════════════════════════════════════════════════════════════════ */

const SERIES = [
  {
    key: 'revenue',     label: 'Revenue',      short: 'REV',
    color: '#1E293B',   colorEnd: '#3B82F6',
    gradId: 'gRev',     shadowColor: 'rgba(30,41,59,0.28)',
  },
  {
    key: 'grossProfit', label: 'Gross Profit', short: 'GP',
    color: '#10B981',   colorEnd: '#34D399',
    gradId: 'gGP',      shadowColor: 'rgba(16,185,129,0.28)',
  },
  {
    key: 'ebitda',      label: 'EBITDA',       short: 'EBT',
    color: '#7C3AED',   colorEnd: '#A78BFA',
    gradId: 'gEBT',     shadowColor: 'rgba(124,58,237,0.28)',
  },
  {
    key: 'netProfit',   label: 'Net Profit',   short: 'NP',
    color: '#F97316',   colorEnd: '#FBBF24',
    gradId: 'gNP',      shadowColor: 'rgba(249,115,22,0.28)',
  },
];

/* ── Demo-mode hardcoded fallback (used when no data prop is passed) ── */
const RAW_DATA = [
  { month: 'Sep-25', revenue: 2500, grossProfit: 420,  ebitda: 310,  netProfit: 195  },
  { month: 'Oct-25', revenue: 780,  grossProfit: 210,  ebitda: 155,  netProfit: 88   },
  { month: 'Nov-25', revenue: 860,  grossProfit: 245,  ebitda: 178,  netProfit: 110  },
  { month: 'Dec-25', revenue: 590,  grossProfit: -65,  ebitda: -48,  netProfit: -150 },
  { month: 'Jan-26', revenue: 720,  grossProfit: 175,  ebitda: 122,  netProfit: 64   },
  { month: 'Feb-26', revenue: 810,  grossProfit: 228,  ebitda: 162,  netProfit: 95   },
  { month: 'Mar-26', revenue: 930,  grossProfit: 270,  ebitda: 198,  netProfit: 128  },
  { month: 'Apr-26', revenue: 1050, grossProfit: 310,  ebitda: 234,  netProfit: 155  },
  { month: 'May-26', revenue: 1180, grossProfit: 355,  ebitda: 272,  netProfit: 188  },
];

/**
 * normalizeApiData — converts API response rows to internal chart format.
 * API:      { period_name, total_revenue, gross_profit, ebitda, net_profit }
 * Internal: { month,       revenue,       grossProfit,  ebitda, netProfit  }
 *
 * Values from the API are raw absolute numbers (e.g. 14 250 000).
 * The internal formatters multiply by M=1_000_000, so we divide here
 * so that $14 250 000 → 14.25 in internal units → fmtCompact → "$14M"
 */
const M = 1_000_000;
function normalizeApiData(apiRows) {
  if (!Array.isArray(apiRows) || apiRows.length === 0) return RAW_DATA;
  return apiRows.map(r => ({
    month:       r.period_name   ?? r.month ?? '—',
    revenue:     (Number(r.total_revenue  ?? r.revenue      ?? 0)) / M,
    grossProfit: (Number(r.gross_profit   ?? r.grossProfit  ?? 0)) / M,
    ebitda:      (Number(r.ebitda                           ?? 0)) / M,
    netProfit:   (Number(r.net_profit     ?? r.netProfit    ?? 0)) / M,
  }));
}

/* KPI icon definitions (shared regardless of data source) */
const KPI_ICONS = [
  (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  ),
  (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/><path d="M12 18V6"/>
    </svg>
  ),
  (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
    </svg>
  ),
  (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
];

/* ── Formatters (unchanged logic) ── */

const fmtAxis = (v) => {
  if (v === 0) return '0';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}B`;
  return `${sign}${abs}M`;
};

const fmtCompact = (vM) => {
  if (vM === null || vM === undefined) return '—';
  const n = vM * M;
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(0)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)}K`;
  return `${sign}${abs}`;
};

const FMT_FULL = (vM) => {
  if (vM === null || vM === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(vM * M);
};

const pct = (a, b) => b && b !== 0 ? (((a - b) / Math.abs(b)) * 100).toFixed(1) : null;

const finiteNumbers = (values) => values.filter(v => Number.isFinite(v));

const buildAxisDomain = (values, { padRatio = 0.2, minSpan = 1, includeZero = false } = {}) => {
  const nums = finiteNumbers(values);
  if (!nums.length) return [-1, 1];

  let min = Math.min(...nums);
  let max = Math.max(...nums);

  if (includeZero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }

  const mid = (min + max) / 2;
  const span = Math.max(max - min, minSpan);
  const padded = span * (1 + padRatio);

  return [
    Math.floor(mid - padded / 2),
    Math.ceil(mid + padded / 2),
  ];
};

const buildRevenueDomain = (values) => {
  const nums = finiteNumbers(values);
  if (!nums.length) return [0, 1];

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = Math.max(max - min, 1);

  return [
    min >= 0 ? 0 : Math.floor(min - span * 0.14),
    Math.ceil(max + span * 0.16),
  ];
};

const shouldSplitRevenueAxis = (rows, hidden, focusMargins) => {
  if (focusMargins || hidden.has('revenue')) return false;

  const profitValues = finiteNumbers(rows.flatMap(r => [
    Math.abs(r.grossProfit || 0),
    Math.abs(r.ebitda || 0),
    Math.abs(r.netProfit || 0),
  ]));
  const revenueValues = finiteNumbers(rows.map(r => Math.abs(r.revenue || 0)));

  if (!profitValues.length || !revenueValues.length) return false;

  const maxProfit = Math.max(...profitValues);
  const maxRevenue = Math.max(...revenueValues);

  return maxRevenue > Math.max(1, maxProfit) * 2.4;
};

/* ═══════════════════════════════════════════════════════════════════════════
   SVG GRADIENT DEFS  (injected once into chart)
═══════════════════════════════════════════════════════════════════════════ */
function GradientDefs() {
  return (
    <defs>
      {SERIES.map(s => (
        <linearGradient key={s.gradId} id={s.gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={s.color}>
            <animate attributeName="stop-color" values={`${s.color};${s.colorEnd};${s.color}`} dur="6s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor={s.colorEnd}>
            <animate attributeName="stop-color" values={`${s.colorEnd};${s.color};${s.colorEnd}`} dur="6s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      ))}
      {/* Area fills */}
      {SERIES.map(s => (
        <linearGradient key={`${s.gradId}Area`} id={`${s.gradId}Area`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={s.color} stopOpacity="0.10" />
          <stop offset="100%" stopColor={s.color} stopOpacity="0.00" />
        </linearGradient>
      ))}
    </defs>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RIPPLE DOT  (active dot with pulse)
═══════════════════════════════════════════════════════════════════════════ */
const RippleDot = ({ cx, cy, fill, stroke }) => (
  <g style={{ filter: `drop-shadow(0 0 8px ${fill}90)` }}>
    <circle cx={cx} cy={cy} r={4} fill={fill} stroke={stroke || '#fff'} strokeWidth={2}
      style={{ animation: 'plRipplePulse 1.8s infinite ease-in-out' }}
    />
  </g>
);

/* ═══════════════════════════════════════════════════════════════════════════
   LIVE DOT  (static pulse on the latest data point)
═══════════════════════════════════════════════════════════════════════════ */
const LiveDot = (props) => {
  const { cx, cy, stroke, index, dataLength } = props;
  if (index !== dataLength - 1) return null;
  return (
    <g transform={`translate(${cx}, ${cy})`} style={{ filter: `drop-shadow(0 0 6px ${stroke}80)` }}>
      <circle r={3.5} fill="#fff" stroke={stroke} strokeWidth={2.5} />
      <circle r={3.5} fill="none" stroke={stroke} strokeWidth={2}
        style={{ 
          transformOrigin: 'center', 
          transformBox: 'fill-box',
          animation: 'plLivePulse 2s infinite cubic-bezier(0.2, 0.8, 0.2, 1)' 
        }}
      />
    </g>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   COUNT-UP HOOK
═══════════════════════════════════════════════════════════════════════════ */
const MetricDot = (props) => {
  const { cx, cy, index, dataLength, color, isRevenue } = props;
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;

  const radius = isRevenue ? 2.7 : 3.3;

  return (
    <g transform={`translate(${cx}, ${cy})`} style={{ filter: `drop-shadow(0 1px 3px ${color}66)` }}>
      <circle r={radius} fill="#fff" stroke={color} strokeWidth={isRevenue ? 2 : 2.3} />
      {index === dataLength - 1 && (
        <circle
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={2}
          style={{
            transformOrigin: 'center',
            transformBox: 'fill-box',
            animation: 'plLivePulse 2s infinite cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        />
      )}
    </g>
  );
};

function useCountUp(target, duration = 900, start = false) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const startVal  = 0;
    const diff = target - startVal;
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setVal(startVal + diff * ease);
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);
  return val;
}

/* ═══════════════════════════════════════════════════════════════════════════
   KPI CARD
═══════════════════════════════════════════════════════════════════════════ */
function KPICard({ label, value, prev, color, bg, icon, countStart, currency }) {
  const [hov, setHov] = useState(false);
  const animated = useCountUp(value, 900, countStart);
  const change = pct(value, prev);
  const isUp   = change !== null && parseFloat(change) >= 0;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 120px',
        background: bg,
        border: `1px solid ${color}22`,
        borderRadius: 14,
        padding: '10px 14px',
        position: 'relative',
        overflow: 'hidden',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov
          ? `0 8px 24px ${color}22, 0 0 0 1px ${color}33`
          : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.22s cubic-bezier(0.34,1.4,0.64,1)',
        cursor: 'default',
        willChange: 'transform, box-shadow',
      }}
    >
      {/* Subtle top gradient bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, ${color}44)`,
        borderRadius: '14px 14px 0 0',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <span style={{ color, display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>

      <div style={{
        fontSize: '1rem', fontWeight: 800, color: '#0f172a',
        letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      }}>
        {currency} {fmtCompact(animated)}
      </div>

      {change !== null && (
        <div style={{
          marginTop: 4, display: 'flex', alignItems: 'center', gap: 3,
          fontSize: '0.6rem', fontWeight: 700,
          color: isUp ? '#16a34a' : '#dc2626',
        }}>
          <span>{isUp ? '▲' : '▼'}</span>
          <span>{Math.abs(parseFloat(change))}% MoM</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXECUTIVE TOOLTIP  — Glassmorphism Edition
   Layout: Header | 4 Data Rows (squircle + name + $value + badge) | Footer
   Recharts passes viewBox + coordinate automatically when used as content={}
═══════════════════════════════════════════════════════════════════════════ */
const ExecTooltip = ({ active, payload, label, viewBox, coordinate, currency, activeData }) => {
  if (!active || !payload?.length) return null;

  /* ── Detect if active point is in the RIGHT half of the chart ──
     When it is, Recharts flips the tooltip to the LEFT side automatically
     via its internal positioning. We mirror the pointer arrow direction. */
  const chartMidX = viewBox ? viewBox.x + viewBox.width / 2 : Infinity;
  const pointX    = coordinate?.x ?? 0;
  const isRightHalf = pointX > chartMidX;
  /* Arrow points LEFT (toward point) when tooltip is on the RIGHT of the point.
     Arrow points RIGHT (toward point) when tooltip is on the LEFT of the point. */
  const arrowSide = isRightHalf ? 'right' : 'left';

  /* ── Build flat lookup from Recharts payload ── */
  const dp = {};
  payload.forEach(p => { dp[p.dataKey] = p.value; });

  /* ── Raw values (unchanged business logic) ── */
  const rev  = payload[0]?.payload?._rawRevenue      ?? dp.revenue      ?? 0;
  const gp   = payload[0]?.payload?._rawGrossProfit  ?? dp.grossProfit  ?? null;
  const ebt  = payload[0]?.payload?._rawEbitda       ?? dp.ebitda       ?? null;
  const np   = payload[0]?.payload?._rawNetProfit    ?? dp.netProfit    ?? null;

  /* ── Margin calculations (unchanged logic) ── */
  const gpM  = rev > 0 && gp  !== null ? ((gp  / rev) * 100).toFixed(1) : null;
  const ebtM = rev > 0 && ebt !== null ? ((ebt / rev) * 100).toFixed(1) : null;
  const npM  = rev > 0 && np  !== null ? ((np  / rev) * 100).toFixed(1) : null;

  /* ── MoM growth (dynamic dataset) ── */
  const monthIdx  = activeData.findIndex(r => r.month === label);
  const prevData  = monthIdx > 0 ? activeData[monthIdx - 1] : null;

  const revGrowth = prevData?.revenue     ? pct(rev, prevData.revenue)     : null;
  const gpGrowth  = prevData?.grossProfit ? pct(gp,  prevData.grossProfit) : null;
  const ebtGrowth = prevData?.ebitda      ? pct(ebt, prevData.ebitda)      : null;
  const npGrowth  = prevData?.netProfit   ? pct(np,  prevData.netProfit)   : null;

  /* ── Full Intl formatter: $1,050,000,000 ── */
  const fmtIntl = (vM) => {
    if (vM === null || vM === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(vM * 1_000_000).replace('$', currency + ' ');
  };

  /* ── Row definitions ── */
  const rows = [
    { s: SERIES[0], val: rev,  growth: revGrowth, margin: null  },
    { s: SERIES[1], val: gp,   growth: gpGrowth,  margin: gpM   },
    { s: SERIES[2], val: ebt,  growth: ebtGrowth, margin: ebtM  },
    { s: SERIES[3], val: np,   growth: npGrowth,  margin: npM   },
  ];

  /* ── Footer 3-column margin data ── */
  const footerItems = [
    { label: 'GP Margin',  value: gpM  },
    { label: 'EBITDA Mgn', value: ebtM },
    { label: 'Net Margin', value: npM  },
  ];

  /* ── Shared styles ── */
  const TOKEN = {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  };

  return (
    <div style={{
      /* ─────────────────────────────────────────────────────────────
         GLASSMORPHISM CONTAINER  (TradingView / Bloomberg quality)
         • bg: rgba(255,255,255,0.82) — lines faintly visible through
         • backdrop-filter: blur(16px) — premium frost without opacity loss
         • border: rgba(255,255,255,0.35) — ultra-thin glass edge
         • shadow: layered — near + diffuse + inset gloss
         • overflow: visible — allows pointer arrow to protrude
      ───────────────────────────────────────────────────────────── */
      background: 'rgba(255, 255, 255, 0.82)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.35)',
      borderRadius: 18,
      padding: '16px 18px',
      width: 'max-content',
      boxShadow: [
        '0 12px 40px rgba(15, 23, 42, 0.12)',    /* deep diffuse */
        '0 2px 10px rgba(15, 23, 42, 0.06)',     /* near shadow  */
        'inset 0 1px 0 rgba(255,255,255,0.75)',  /* top gloss    */
      ].join(', '),
      ...TOKEN,
      animation: 'plTooltipIn 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      pointerEvents: 'none',
      position: 'relative',
      overflow: 'visible',   /* pointer arrow protrudes outside */
    }}>

      {/* ── Frosted inner gloss strip ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
        borderRadius: '18px 18px 0 0',
        pointerEvents: 'none',
      }} />

      {/* ── Pointer arrow — flips to always point toward the active data point ── */}
      <div style={{
        position: 'absolute',
        /* Left side: arrow on LEFT edge pointing left (→ tooltip sits right of point) */
        ...(arrowSide === 'left' ? {
          left: -7,
          borderLeft: 'none',
          borderRight: '7px solid rgba(255,255,255,0.82)',
          filter: 'drop-shadow(-2px 0 3px rgba(15,23,42,0.06))',
        } : {
        /* Right side: arrow on RIGHT edge pointing right (→ tooltip sits left of point) */
          right: -7,
          borderRight: 'none',
          borderLeft: '7px solid rgba(255,255,255,0.82)',
          filter: 'drop-shadow(2px 0 3px rgba(15,23,42,0.06))',
        }),
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '7px solid transparent',
        borderBottom: '7px solid transparent',
        pointerEvents: 'none',
      }} />


      {/* ── HEADER ─────────────────────────────────────────────────
           Left:  "Apr-26" — bold charcoal
           Right: "Monthly" capsule — bg-blue-50 text-blue-600
      ──────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14, paddingBottom: 12,
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
      }}>
        <span style={{
          fontSize: '0.92rem', fontWeight: 800,
          color: '#0f172a', letterSpacing: '-0.025em',
          lineHeight: 1,
        }}>
          {label}
        </span>

        {/* bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold */}
        <span style={{
          fontSize: '0.68rem', fontWeight: 600,
          padding: '4px 12px', borderRadius: 999,
          background: '#eff6ff',              /* bg-blue-50   */
          color: '#2563eb',                   /* text-blue-600*/
          border: '1px solid rgba(37,99,235,0.14)',
          letterSpacing: '0.01em',
          whiteSpace: 'nowrap',
        }}>
          Monthly
        </span>
      </div>

      {/* ── DATA ROWS ──────────────────────────────────────────────
           4 rows: Revenue · Gross Profit · EBITDA · Net Profit
           [squircle + name] | [$value bold] | [badge right-aligned]
      ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map(({ s, val, growth, margin }) => {
          if (val === null || val === undefined) return null;
          const isNeg  = val < 0;

          return (
            <div
              key={s.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                columnGap: 10,
                padding: '8px 10px',
                borderRadius: 10,
                background: 'rgba(248, 250, 252, 0.60)',
                border: '1px solid rgba(226, 232, 240, 0.45)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {/* LEFT: squircle icon + metric name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                <div style={{
                  width: 13, height: 13, flexShrink: 0,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${s.color} 0%, ${s.colorEnd} 100%)`,
                  boxShadow: `0 2px 6px ${s.shadowColor}`,
                }} />
                <span style={{
                  fontSize: '0.71rem', fontWeight: 600,
                  color: '#475569', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {s.label}
                </span>
              </div>

              {/* CENTER: Intl-formatted absolute dollar — bold */}
              <span style={{
                fontSize: '0.75rem', fontWeight: 800,
                color: isNeg ? '#dc2626' : '#0f172a',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {fmtIntl(val)}
              </span>

              {/* RIGHT: MoM% Growth & Margin */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, minWidth: 58 }}>
                {growth !== null && (
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700,
                    color: parseFloat(growth) >= 0 ? '#16a34a' : '#dc2626',
                    display: 'flex', alignItems: 'center', gap: 2,
                    whiteSpace: 'nowrap',
                  }}>
                    {parseFloat(growth) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(growth))}%
                  </span>
                )}
                {margin !== null && (
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 700,
                    padding: '2px 8px', borderRadius: 999,
                    background: 'rgba(241, 245, 249, 0.85)',
                    color: '#475569',
                    border: '1px solid rgba(226, 232, 240, 0.65)',
                    whiteSpace: 'nowrap',
                  }}>
                    {margin}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FOOTER — 3-column margin summary ───────────────────────
           border-t border-gray-100  mt-4  pt-3
      ──────────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: 16, paddingTop: 12,
        borderTop: '1px solid rgba(241, 245, 249, 0.9)',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
      }}>
        {footerItems.map(({ label: lbl, value: v }) => {
          if (v === null) return (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '0.53rem', color: '#cbd5e1', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
              }}>{lbl}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#cbd5e1' }}>—</div>
            </div>
          );
          const pos = parseFloat(v) >= 0;
          return (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '0.53rem', fontWeight: 600, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
              }}>
                {lbl}
              </div>
              {/* Bold green text when positive */}
              <div style={{
                fontSize: '0.78rem', fontWeight: 800,
                color: pos ? '#059669' : '#dc2626',
                letterSpacing: '-0.015em',
              }}>
                {v}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   PREMIUM KEBAB MENU
═══════════════════════════════════════════════════════════════════════════ */
function PremiumKebab({ onCSV, onCopyData, onFullscreen, onCopyImage }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const items = [
    { icon: '⬇', label: 'Export CSV',         action: onCSV },
    { icon: '📊', label: 'Export Excel',        action: () => onCSV('xlsx') },
    { icon: '📄', label: 'Export PDF',          action: () => onCSV('pdf') },
    { icon: '⎘',  label: 'Copy Data',           action: onCopyData },
    { icon: '🖼', label: 'Copy Chart Image',    action: onCopyImage },
    { icon: '⛶',  label: 'View Full Screen',    action: onFullscreen },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        aria-label="Options"
        onClick={() => setOpen(v => !v)}
        style={{
          background: open
            ? 'rgba(99,102,241,0.08)'
            : 'transparent',
          border: open ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
          cursor: 'pointer',
          width: 30, height: 30, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? '#6366f1' : '#94a3b8',
          fontSize: '1.2rem', transition: 'all 0.18s ease',
          willChange: 'background, color',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
          e.currentTarget.style.color = '#6366f1';
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }
        }}
      >⋮</button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(16px)',
          borderRadius: 12,
          boxShadow: '0 16px 40px rgba(15,23,42,0.14), 0 0 0 1px rgba(226,232,240,0.8)',
          minWidth: 180, zIndex: 200, overflow: 'hidden',
          animation: 'plMenuPop 0.16s cubic-bezier(0.34,1.4,0.64,1) forwards',
        }}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.action(); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                width: '100%', textAlign: 'left',
                padding: '9px 14px', background: 'none', border: 'none',
                fontSize: '0.73rem', fontWeight: 600, color: '#334155',
                cursor: 'pointer',
                borderTop: i > 0 ? '1px solid rgba(241,245,249,0.8)' : 'none',
                transition: 'background 0.12s, color 0.12s',
                willChange: 'background',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
                e.currentTarget.style.color = '#4f46e5';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#334155';
              }}
            >
              <span style={{ fontSize: '0.9rem', width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AI EXECUTIVE INSIGHT PANEL
═══════════════════════════════════════════════════════════════════════════ */
function AIInsightPanel({ data, currency }) {
  const [expanded, setExpanded] = useState(true);

  const insights = useMemo(() => {
    if (!data || data.length === 0) return [
      { icon: 'ℹ', text: 'No data available for insights.' }
    ];

    const fmt = (v) => {
      const abs = Math.abs(v);
      if (abs >= 1e9) return `${(abs / 1e9).toFixed(1)}B`;
      if (abs >= 1e6) return `${(abs / 1e6).toFixed(0)}M`;
      if (abs >= 1e3) return `${(abs / 1e3).toFixed(0)}K`;
      return abs.toString();
    };

    let maxRev = -Infinity;
    let maxRevMonth = '';
    data.forEach(d => {
      const rev = Number(d.revenue);
      if (!isNaN(rev) && rev > maxRev) {
        maxRev = rev;
        maxRevMonth = d.metric;
      }
    });

    const first = data[0];
    const last = data[data.length - 1];
    
    const ebitdaFirst = Number(first.ebitda) || 0;
    const ebitdaLast = Number(last.ebitda) || 0;
    const isEbitdaUp = ebitdaLast >= ebitdaFirst;

    let negativeMonth = null;
    for (const d of data) {
      if (Number(d.netProfit) < 0) {
        negativeMonth = d;
        break;
      }
    }

    const generated = [
      {
        icon: '⚡',
        text: `Revenue peaked at ${currency}${fmt(maxRev)} in ${maxRevMonth}, driving top-line performance across the selected timeframe.`,
      }
    ];

    if (negativeMonth) {
      generated.push({
        icon: '⚠',
        text: `Profit margins experienced pressure in ${negativeMonth.metric}, with Net Profit dropping to −${currency}${fmt(negativeMonth.netProfit)}.`,
      });
    } else {
      generated.push({
        icon: '💎',
        text: `Net Profit remained strictly positive throughout the entire period, demonstrating resilient cost controls.`,
      });
    }

    generated.push({
      icon: isEbitdaUp ? '📈' : '📉',
      text: `EBITDA ${isEbitdaUp ? 'improved' : 'contracted'} from ${currency}${fmt(ebitdaFirst)} in ${first.metric} to ${currency}${fmt(ebitdaLast)} in ${last.metric}.`,
    });

    return generated;
  }, [data, currency]);

  return (
    <div style={{
      marginTop: 14,
      border: '1px solid rgba(99,102,241,0.18)',
      borderLeft: '3px solid #6366f1',
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(238,242,255,0.7) 0%, rgba(255,255,255,0.9) 100%)',
      backdropFilter: 'blur(8px)',
      overflow: 'hidden',
      transition: 'all 0.25s ease',
    }}>
      {/* Panel header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '9px 14px',
          background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(99,102,241,0.1)' : 'none',
          transition: 'border-color 0.2s',
        }}
      >
        <span style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.7rem', color: '#fff', flexShrink: 0,
          boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
        }}>✦</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4338ca', letterSpacing: '-0.01em', flex: 1, textAlign: 'left' }}>
          Executive Insights
        </span>

        <span style={{
          fontSize: '0.65rem', color: '#6366f1',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s ease',
          display: 'inline-block',
        }}>▾</span>
      </button>

      {expanded && (
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insights.map((ins, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, fontSize: '0.75rem',
                width: 20, height: 20, borderRadius: 5,
                background: 'rgba(255,255,255,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                marginTop: 1,
              }}>{ins.icon}</span>
              <p style={{
                margin: 0, fontSize: '0.67rem', color: '#334155',
                lineHeight: 1.55, fontWeight: 500,
              }}>{ins.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PREMIUM LEGEND
═══════════════════════════════════════════════════════════════════════════ */
function PremiumLegend({ series, hidden, hoveredKey, onToggle, onHover, onHoverEnd, onIsolate }) {
  return (
    <div style={{
      display: 'flex', gap: 4, justifyContent: 'center',
      marginTop: 12, flexWrap: 'wrap',
    }}>
      {series.map(s => {
        const isHidden   = hidden.has(s.key);
        const isHov      = hoveredKey === s.key;
        const isDimmed   = hoveredKey && hoveredKey !== s.key;

        return (
          <button
            key={s.key}
            id={`pl-legend-${s.key}`}
            title={`Click to toggle · Double-click to isolate`}
            onClick={() => onToggle(s.key)}
            onDoubleClick={() => onIsolate(s.key)}
            onMouseEnter={() => onHover(s.key)}
            onMouseLeave={onHoverEnd}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '5px 10px', borderRadius: 20, cursor: 'pointer',
              background: isHov
                ? `${s.color}12`
                : 'transparent',
              border: isHov
                ? `1px solid ${s.color}40`
                : '1px solid transparent',
              opacity: isHidden ? 0.35 : isDimmed ? 0.45 : 1,
              transform: isHov ? 'translateY(-1px)' : 'translateY(0)',
              boxShadow: isHov ? `0 4px 12px ${s.shadowColor}` : 'none',
              transition: 'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
              willChange: 'transform, opacity, box-shadow',
              outline: 'none',
            }}
          >
            <svg width="22" height="10" style={{ flexShrink: 0 }}>
              <defs>
                <linearGradient id={`lg-${s.key}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor={s.color}    />
                  <stop offset="100%" stopColor={s.colorEnd} />
                </linearGradient>
              </defs>
              <line x1="0" y1="5" x2="22" y2="5"
                stroke={isHidden ? '#cbd5e1' : `url(#lg-${s.key})`}
                strokeWidth={isHov ? 3 : 2}
                strokeDasharray={isHidden ? '3 2' : undefined}
              />
              {!isHidden && (
                <circle cx="11" cy="5" r={isHov ? 4 : 3}
                  fill={s.color}
                  style={{ filter: isHov ? `drop-shadow(0 0 3px ${s.color})` : 'none', transition: 'all 0.15s' }}
                />
              )}
            </svg>
            <span style={{
              fontSize: '0.63rem', fontWeight: 600,
              color: isHidden ? '#94a3b8' : isHov ? s.color : '#475569',
              textDecoration: isHidden ? 'line-through' : 'none',
              transition: 'color 0.18s',
              whiteSpace: 'nowrap',
            }}>
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
/**
 * PLTrendCard — Enterprise P&L Trend Chart
 *
 * Props (all optional — falls back to demo RAW_DATA when not provided):
 *   data      {Array}   Live API rows from fetchPLTrend()
 *                       Shape: [{ period_name, total_revenue, gross_profit, ebitda, net_profit }]
 *   loading   {boolean} Shows skeleton shimmer overlay while data is loading
 *   currency  {string}  Currency code shown in axis labels (default: 'AED')
 */
export default function PLTrendCard({ data: propData, loading: propLoading = false, currency: propCurrency = 'AED' }) {
  /* ─── Resolve live vs demo data source ─── */
  const activeData = useMemo(
    () => (propData && propData.length > 0 ? normalizeApiData(propData) : RAW_DATA),
    [propData]
  );

  /* ─── State (business logic — unchanged) ─── */
  const [hidden,       setHidden]       = useState(new Set());
  const autoSplit = useMemo(
    () => shouldSplitRevenueAxis(activeData, hidden, false),
    [activeData, hidden]
  );
  const [splitScale,   setSplitScale]   = useState(autoSplit);
  const [focusMargins, setFocusMargins] = useState(false);
  const effectiveSplitScale = (splitScale || autoSplit) && !focusMargins;
  const [isAnimating,  setIsAnimating]  = useState(true);
  const [copied,       setCopied]       = useState(false);

  /* ─── UI enhancement state ─── */
  const [hoveredSeries, setHoveredSeries] = useState(null);   // legend hover
  const [kpiCountStart, setKpiCountStart] = useState(false);  // count-up trigger
  const [isFullscreen,  setIsFullscreen]  = useState(false);
  const cardRef   = useRef(null);
  const animTimer = useRef(null);

  /* ── Trigger count-up on mount ── */
  useEffect(() => {
    const t = setTimeout(() => setKpiCountStart(true), 200);
    return () => clearTimeout(t);
  }, []);

  /* ── Draw-in animation re-trigger ── */
  useEffect(() => {
    const startTimer = setTimeout(() => setIsAnimating(true), 0);
    clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => setIsAnimating(false), 1600);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(animTimer.current);
    };
  }, [effectiveSplitScale, focusMargins]);

  /* ── Fullscreen ── */
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setIsFullscreen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ─── Derived chart data — uses live API data when prop provided ─── */
  const chartData = useMemo(() => {
    return activeData.map(row => {
      const d = { month: row.month };
      SERIES.forEach(({ key }) => {
        if (focusMargins && key === 'revenue') return;
        if (!hidden.has(key)) d[key] = row[key];
      });
      /* Raw values passed to tooltip for margin calculations */
      d._rawRevenue     = row.revenue;
      d._rawNetProfit   = row.netProfit;
      d._rawGrossProfit = row.grossProfit;
      d._rawEbitda      = row.ebitda;
      return d;
    });
  }, [activeData, hidden, focusMargins]);

  /* ─── Y-axis domain — uses live data source ─── */
  const { leftDomain, rightDomain } = useMemo(() => {
    const visible    = SERIES.filter(s => !hidden.has(s.key));
    const profitKeys = visible.filter(s => s.key !== 'revenue').map(s => s.key);
    const revVis     = !hidden.has('revenue') && !focusMargins;

    const allProfit = finiteNumbers(activeData.flatMap(r => profitKeys.map(k => r[k])));
    const allRev    = revVis ? finiteNumbers(activeData.map(r => r.revenue)) : [];

    if (effectiveSplitScale) {
      return {
        leftDomain: buildAxisDomain(allProfit, { padRatio: 0.42, minSpan: 8 }),
        rightDomain: buildRevenueDomain(allRev),
      };
    }
    const combined = [...allProfit, ...allRev];
    return {
      leftDomain: buildAxisDomain(combined, { padRatio: 0.28, minSpan: 10, includeZero: true }),
      rightDomain: null,
    };
  }, [hidden, effectiveSplitScale, focusMargins, activeData]);

  /* ─── Legend handlers ─── */
  const toggleSeries = useCallback(key => {
    setHidden(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const isolateSeries = useCallback(key => {
    setHidden(() => new Set(SERIES.map(s => s.key).filter(k => k !== key)));
  }, []);

  /* ─── Export / copy — uses live data source ─── */
  const handleDownloadCSV = (type = 'csv') => {
    const headers = [`Month`, `Revenue (${propCurrency})`, `Gross Profit (${propCurrency})`, `EBITDA (${propCurrency})`, `Net Profit (${propCurrency})`, 'Net Margin %'];
    const rows = activeData.map(r => [
      r.month,
      (r.revenue     * M).toFixed(0),
      (r.grossProfit * M).toFixed(0),
      (r.ebitda      * M).toFixed(0),
      (r.netProfit   * M).toFixed(0),
      r.revenue ? ((r.netProfit / r.revenue) * 100).toFixed(1) : 'N/A',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `pl_trend.${type === 'csv' ? 'csv' : type}`;
    a.click();
  };

  const handleCopyData = () => {
    const text = activeData.map(r =>
      `${r.month}: Rev $${r.revenue}M | GP $${r.grossProfit}M | EBITDA $${r.ebitda}M | NP $${r.netProfit}M`
    ).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: isFullscreen ? '#f8fafc' : '#ffffff',
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy image to clipboard:", err);
        }
      }, 'image/png');
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
  };

  /* ─── Visible series for legend/chart ─── */
  const visibleSeries = useMemo(
    () => SERIES.filter(s => !(focusMargins && s.key === 'revenue')),
    [focusMargins]
  );

  /* ─── Per-series stroke opacity (legend hover dims others) ─── */
  const seriesOpacity = useCallback((key) => {
    if (hidden.has(key)) return 0;
    if (!hoveredSeries)  return 1;
    return hoveredSeries === key ? 1 : 0.40;
  }, [hidden, hoveredSeries]);

  const seriesStrokeWidth = useCallback((key) => {
    if (!hoveredSeries) return key === 'revenue' ? 3 : 3.2;
    return hoveredSeries === key ? (key === 'revenue' ? 4.2 : 4) : 2.4;
  }, [hoveredSeries]);

  /* ─── Control pill style ─── */
  const pillStyle = (active) => ({
    fontSize: '0.63rem', fontWeight: 700,
    padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
    border: active ? '1.5px solid #6366f1' : '1.5px solid rgba(226,232,240,0.9)',
    background: active
      ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(129,140,248,0.08))'
      : 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(8px)',
    color: active ? '#4f46e5' : '#64748b',
    boxShadow: active
      ? '0 0 0 3px rgba(99,102,241,0.12), 0 2px 8px rgba(99,102,241,0.15)'
      : '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
    outline: 'none', whiteSpace: 'nowrap',
    willChange: 'transform, box-shadow',
  });

  /* ═════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════ */
  const content = (
    <>
      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes plPulse1 {
          0%   { r: 6;  stroke-opacity: 0.5; }
          100% { r: 18; stroke-opacity: 0;   }
        }
        @keyframes plPulse2 {
          0%   { r: 5;  stroke-opacity: 0.4; }
          100% { r: 13; stroke-opacity: 0;   }
        }
        @keyframes plMenuPop {
          from { opacity: 0; transform: scale(0.92) translateY(-6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes plCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes plTooltipIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @keyframes plKpiIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes plInsightIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes plBreathingGlow {
          0% { filter: drop-shadow(0 2px 4px var(--s-shadow)) brightness(1); }
          50% { filter: drop-shadow(0 4px 10px var(--s-shadow)) brightness(1.05); }
          100% { filter: drop-shadow(0 2px 4px var(--s-shadow)) brightness(1); }
        }
        @keyframes plLivePulse {
          0% { transform: scale(1); opacity: 0.8; stroke-width: 2px; }
          100% { transform: scale(3.5); opacity: 0; stroke-width: 0px; }
        }
        @keyframes plPulseLoad {
          from { background-position:  200% 0; }
          to   { background-position: -200% 0; }
        }
        @keyframes plLinePulse {
          0%   { filter: drop-shadow(0 2px 6px var(--s-shadow)); opacity: 1; }
          50%  { filter: drop-shadow(0 6px 14px var(--s-shadow)); opacity: 0.85; }
          100% { filter: drop-shadow(0 2px 6px var(--s-shadow)); opacity: 1; }
        }
        @keyframes plRipplePulse {
          0%   { r: 4px; stroke-width: 2px; }
          50%  { r: 7px; stroke-width: 3px; }
          100% { r: 4px; stroke-width: 2px; }
        }
        @keyframes plGridIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes plAxisYIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pl-chart-container .recharts-cartesian-grid {
          animation: plGridIn 1s ease-out forwards;
        }
        .pl-chart-container .recharts-yAxis .recharts-cartesian-axis-tick {
          animation: plAxisYIn 0.8s ease-out forwards;
        }
        .pl-chart-container .recharts-xAxis .recharts-cartesian-axis-tick {
          animation: plGridIn 0.8s ease-out forwards;
        }
        @keyframes shimmerSweep {
          0% { left: -100%; }
          15% { left: 100%; }
          100% { left: 100%; }
        }
        .pl-shimmer-overlay {
          position: absolute; top: 0; bottom: 0; width: 60%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
          mix-blend-mode: color-dodge;
          pointer-events: none; z-index: 50;
          animation: shimmerSweep 14s infinite ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        .pl-pill-btn:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 14px rgba(99,102,241,0.18) !important;
        }
        .pl-pill-btn:active {
          transform: translateY(0) !important;
        }
      `}</style>

      <div
        ref={cardRef}
        id="pl-trend-card"
        style={{
          background: isFullscreen
            ? 'rgba(255,255,255,0.97)'
            : 'radial-gradient(circle at top right, rgba(248,250,252,1) 0%, rgba(255,255,255,1) 60%)',
          borderRadius: isFullscreen ? 0 : 20,
          boxShadow: isFullscreen
            ? 'none'
            : '0 2px 12px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.04)',
          padding: isFullscreen ? '28px 36px' : '18px 20px 16px',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          animation: 'plCardIn 0.35s cubic-bezier(0.34,1.4,0.64,1)',
          position: 'relative',
          overflow: 'visible',  /* MUST be visible — tooltip wrapper must escape card bounds */
        }}
      >
        {/* ── Top highlight bar — own clip wrapper so card overflow:visible works ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          borderRadius: '20px 20px 0 0',
          overflow: 'hidden',   /* isolate clip here, not on the whole card */
          pointerEvents: 'none',
          zIndex: 0,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, #6366f1 0%, #10B981 35%, #7C3AED 65%, #F97316 100%)',
            opacity: 0.5,
          }} />
        </div>

        {/* ══ HEADER ROW ══════════════════════════════════════════════ */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: 14, gap: 12,
        }}>
          <div>
            <h3 style={{
              margin: 0, fontSize: '0.98rem', fontWeight: 800,
              color: '#0f172a', letterSpacing: '-0.025em',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              P&L Trend
              <span style={{
                fontSize: '0.55rem', fontWeight: 700, color: '#6366f1',
                padding: '2px 7px', borderRadius: 10,
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.18)',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>Live</span>
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.67rem', color: '#94a3b8', fontWeight: 500 }}>
              Monthly performance · Sep 2025 – May 2026
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {copied && (
              <span style={{
                fontSize: '0.6rem', color: '#16a34a', fontWeight: 700,
                padding: '3px 9px', borderRadius: 20,
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                animation: 'plCardIn 0.15s ease',
              }}>✓ Copied</span>
            )}

            <button
              id="pl-toggle-split-scale"
              className="pl-pill-btn"
              style={pillStyle(effectiveSplitScale)}
              onClick={() => { setSplitScale(v => !v); if (!effectiveSplitScale) setFocusMargins(false); }}
              title="Separate Y-axis for Revenue vs. Profit lines"
            >Split Scale</button>

            <button
              id="pl-toggle-focus-margins"
              className="pl-pill-btn"
              style={pillStyle(focusMargins)}
              onClick={() => { setFocusMargins(v => !v); if (!focusMargins) setSplitScale(false); }}
              title="Hide Revenue line, zoom to profit lines only"
            >Focus Margins</button>

            <PremiumKebab
              onCSV={handleDownloadCSV}
              onCopyData={handleCopyData}
              onCopyImage={handleCopyImage}
              onFullscreen={() => setIsFullscreen(v => !v)}
            />
          </div>
        </div>

        {/* ══ KPI STRIP — derived from live activeData ═════════════ */}
        {(() => {
          const last    = activeData[activeData.length - 1] || {};
          const prevRow = activeData[activeData.length - 2] || {};
          const kpiDefs = [
            { key: 'revenue',     label: 'Revenue',      value: last.revenue     ?? 0, prev: prevRow.revenue     ?? 0, color: '#1E293B', bg: 'rgba(30,41,59,0.06)',     icon: KPI_ICONS[0] },
            { key: 'grossProfit', label: 'Gross Profit', value: last.grossProfit ?? 0, prev: prevRow.grossProfit ?? 0, color: '#10B981', bg: 'rgba(16,185,129,0.08)',   icon: KPI_ICONS[1] },
            { key: 'ebitda',      label: 'EBITDA',       value: last.ebitda      ?? 0, prev: prevRow.ebitda      ?? 0, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)',  icon: KPI_ICONS[2] },
            { key: 'netProfit',   label: 'Net Profit',   value: last.netProfit   ?? 0, prev: prevRow.netProfit   ?? 0, color: '#F97316', bg: 'rgba(249,115,22,0.08)',  icon: KPI_ICONS[3] },
          ];
          return (
            <div style={{
              display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap',
              animation: 'plKpiIn 0.45s cubic-bezier(0.34,1.4,0.64,1) 0.1s both',
            }}>
              {kpiDefs.map((kpi, i) => (
                <KPICard
                  key={kpi.key}
                  label={kpi.label}
                  value={kpi.value}
                  prev={kpi.prev}
                  color={kpi.color}
                  bg={kpi.bg}
                  icon={kpi.icon}
                  currency={propCurrency}
                  countStart={kpiCountStart && !propLoading}
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          );
        })()}

        {/* ══ CHART + LOADING OVERLAY ══════════════════════════════ */}
        <div className="pl-chart-container" style={{
          width: '100%',
          height: isFullscreen ? 'calc(100vh - 340px)' : 320,
          minHeight: 240,
          position: 'relative',
        }}>
          {/* Shimmer loading overlay while API data is in-flight */}
          {propLoading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: 'linear-gradient(90deg,rgba(241,245,249,0.85) 25%,rgba(248,250,252,0.95) 50%,rgba(241,245,249,0.85) 75%)',
              backgroundSize: '200% 100%',
              animation: 'plPulseLoad 1.4s infinite',
              borderRadius: 10,
              backdropFilter: 'blur(2px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em' }}>
                Loading trend data…
              </span>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%" style={{ overflow: 'visible' }}>
            <ComposedChart
              data={chartData}
              margin={{ top: 12, right: effectiveSplitScale ? 62 : 18, left: 8, bottom: 4 }}
              style={{ overflow: 'visible' }}
            >
              {/* ── Gradient defs ── */}
              <GradientDefs />

              {/* ── Grid ── */}
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(226,232,240,0.45)"
                vertical={false}
              />

              {/* ── X Axis ── */}
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500, fontFamily: 'Inter, system-ui' }}
                axisLine={false}
                tickLine={false}
                dy={7}
              />

              {/* ── Left Y Axis ── */}
              <YAxis
                yAxisId="left"
                domain={leftDomain}
                tickFormatter={fmtAxis}
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 500, fontFamily: 'Inter, system-ui' }}
                axisLine={false}
                tickLine={false}
                width={52}
              />

              {/* ── Right Y Axis (split scale) ── */}
              {effectiveSplitScale && !hidden.has('revenue') && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={rightDomain}
                  tickFormatter={fmtAxis}
                  tick={{ fontSize: 9, fill: '#1E293B', fontWeight: 600, fontFamily: 'Inter, system-ui' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
              )}

              {/* ── Zero reference ── */}
              <ReferenceLine
                yAxisId="left"
                y={0}
                stroke="rgba(148,163,184,0.5)"
                strokeDasharray="5 3"
                strokeWidth={1.2}
              />

              {/* ── Executive Tooltip — glassmorphism, edge-aware positioning ── */}
              <Tooltip
                content={<ExecTooltip currency={propCurrency} activeData={activeData} />}
                cursor={{
                  stroke: 'rgba(99,102,241,0.22)',
                  strokeWidth: 1.5,
                  strokeDasharray: '5 3',
                  fill: 'rgba(99,102,241,0.03)',
                }}
                /* offset keeps tooltip away from the active dot */
                offset={20}
                /* Let tooltip escape Y chart boundary without clipping, but keep X inside so it doesn't go off-screen */
                allowEscapeViewBox={{ x: false, y: true }}
                /* position:absolute on the Recharts wrapper div; combined with
                   card overflow:visible this lets it render outside the card */
                wrapperStyle={{
                  zIndex: 999,
                  outline: 'none',
                  /* Recharts sets position:absolute internally — this ensures
                     the tooltip floats above ALL siblings including card edges */
                  pointerEvents: 'none',
                }}
                animationEasing="ease-out"
                animationDuration={100}
              />

              {/* ── Series Lines ──────────────────────────────────────────
                   Inactive lines dim to 0.15 when ANY tooltip is active.
                   The hovered / active series is rendered LAST in DOM order
                   so it naturally sits above the tooltip z-stack in SVG.
              ───────────────────────────────────────────────────────── */}
              {visibleSeries.map(s => {
                const isRev    = s.key === 'revenue';
                const yId      = effectiveSplitScale && isRev ? 'right' : 'left';
                /* When legend-hovered, non-hovered series dim to 0.15.
                   When tooltip is active (tooltipActive), inactive lines
                   dim to 0.85 so lines stay faintly visible through the glass. */
                const opacity  = seriesOpacity(s.key);

                return (
                  <Fragment key={s.key}>
                    <Area
                      yAxisId={yId}
                      type="monotone"
                      dataKey={s.key}
                      fill={`url(#${s.gradId}Area)`}
                      stroke="none"
                      isAnimationActive={isAnimating}
                      animationBegin={{ revenue: 0, grossProfit: 120, ebitda: 240, netProfit: 360 }[s.key] || 0}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                      connectNulls={false}
                      style={{
                        transition: 'opacity 0.25s ease',
                        opacity,
                        willChange: 'opacity',
                      }}
                    />
                    <Line
                      yAxisId={yId}
                      type="monotone"
                      dataKey={s.key}
                      stroke={`url(#${s.gradId})`}
                      strokeWidth={seriesStrokeWidth(s.key)}
                      strokeOpacity={opacity}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dot={<MetricDot dataLength={chartData.length} color={s.color} isRevenue={isRev} />}
                      activeDot={<RippleDot fill={s.color} stroke="#fff" />}
                      isAnimationActive={isAnimating}
                      animationBegin={{ revenue: 0, grossProfit: 120, ebitda: 240, netProfit: 360 }[s.key] || 0}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                      style={{
                        transition: 'stroke-opacity 0.25s ease, stroke-width 0.2s ease',
                        '--s-shadow': s.shadowColor,
                        filter: `drop-shadow(0 2px 6px ${s.shadowColor})`,
                        animation: hoveredSeries === s.key ? 'plLinePulse 2s infinite ease-in-out' : 'plBreathingGlow 3s infinite ease-in-out',
                        willChange: 'stroke-opacity, stroke-width, filter, opacity',
                      }}
                      connectNulls={false}
                    />
                  </Fragment>
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50, borderRadius: 10 }}>
            <div className="pl-shimmer-overlay" />
          </div>
        </div>

        {/* ══ PREMIUM LEGEND ══════════════════════════════════════════ */}
        <PremiumLegend
          series={visibleSeries}
          hidden={hidden}
          hoveredKey={hoveredSeries}
          onToggle={toggleSeries}
          onHover={setHoveredSeries}
          onHoverEnd={() => setHoveredSeries(null)}
          onIsolate={isolateSeries}
        />

        {/* ══ AI EXECUTIVE INSIGHT ════════════════════════════════════ */}
        <div style={{ animation: 'plInsightIn 0.4s ease 0.3s both' }}>
          <AIInsightPanel data={chartData} currency={propCurrency} />
        </div>
      </div>
    </>
  );

  /* ── Fullscreen overlay ── */
  if (isFullscreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '18px 24px',
        overflowY: 'auto',
        animation: 'plCardIn 0.2s ease',
      }}
        onClick={e => { if (e.target === e.currentTarget) setIsFullscreen(false); }}
      >
        <div style={{
          background: '#fff', borderRadius: 20,
          width: '100%', maxWidth: 1200,
          maxHeight: 'calc(100vh - 36px)', overflowY: 'auto',
          boxShadow: '0 40px 80px rgba(0,0,0,0.24)',
          position: 'relative',
        }}>
          <button
            type="button"
            aria-label="Close fullscreen"
            onClick={() => setIsFullscreen(false)}
            style={{
              position: 'sticky',
              top: 12,
              float: 'right',
              zIndex: 20,
              width: 34,
              height: 34,
              margin: '12px 12px -46px 0',
              borderRadius: 17,
              border: '1px solid rgba(148,163,184,0.32)',
              background: 'rgba(255,255,255,0.92)',
              color: '#334155',
              fontSize: 20,
              lineHeight: '30px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(15,23,42,0.14)',
              backdropFilter: 'blur(8px)',
            }}
          >
            ×
          </button>
          {content}
        </div>
      </div>
    );
  }

  return content;
}
