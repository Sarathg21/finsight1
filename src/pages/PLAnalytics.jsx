import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  fetchPLFilters,
  fetchPLSummary,
  fetchPLTrend,
  fetchPLComparison,
  fetchPLExpenseBreakdown,
  fetchPLStatement,
  exportPL,
} from '../services/plApi';
import { C, CHART_COLORS } from '../utils/theme';
import PLTrendCard from '../components/Charts/PLTrendCard';
import PLComparisonCard from '../components/Charts/PLComparisonCard';
import ExpenseBreakdownCard from '../components/Charts/ExpenseBreakdownCard';

/* ══════════════════════════════════════════════════════════════════
   CONSTANTS & DEFAULTS
══════════════════════════════════════════════════════════════════ */
const DEFAULT_FILTERS = {
  legalGroup:        'All',
  legalEntity:       'All',
  parentDivision:    'All',
  subdivision:       'All',
  periodName:        '',
  comparePeriodName: '',
  currency:          'AED',
};

const EXPENSE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#a855f7', '#f43f5e'];

/* ══════════════════════════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════════════════════════ */
const selStyle = {
  appearance: 'none', padding: '6px 28px 6px 10px',
  fontSize: '0.78rem', fontWeight: 500, color: '#334155',
  background: '#fff', border: `1px solid ${C.border}`,
  borderRadius: 7, cursor: 'pointer', outline: 'none', width: '100%',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
};

const TH = {
  padding: '10px 12px', textAlign: 'right', fontSize: '0.72rem',
  fontWeight: 700, color: '#1e3a8a', background: '#f8fafc',
  borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap',
};
const TH_L = { ...TH, textAlign: 'left' };
const TD   = { padding: '8px 12px', textAlign: 'right', fontSize: '0.74rem', color: '#334155', borderBottom: '1px solid #f1f5f9' };
const TD_L = { ...TD, textAlign: 'left', color: C.navy };

/* ══════════════════════════════════════════════════════════════════
   HELPER COMPONENTS
══════════════════════════════════════════════════════════════════ */

function Skeleton({ h = 20, w = '100%', radius = 6 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: radius,
      background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10,
      padding: '10px 16px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12, fontSize: '0.78rem', color: '#be123c', marginTop: 8,
    }}>
      <span>⚠ {message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: '#be123c', color: '#fff', border: 'none',
          borderRadius: 6, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
        }}>Retry</button>
      )}
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 80, flex: '1 1 0' }}>
      <span style={{ fontSize: '0.66rem', color: '#1e3a8a', fontWeight: 700, letterSpacing: '-0.02em' }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function ExportToast({ message, type }) {
  if (!message) return null;
  const isErr  = type === 'error';
  const isInfo = type === 'info';
  const bg     = isErr ? '#fff1f2' : isInfo ? '#eff6ff' : '#f0fdf4';
  const border = isErr ? '#fecdd3' : isInfo ? '#bfdbfe' : '#bbf7d0';
  const color  = isErr ? '#be123c' : isInfo ? '#1d4ed8' : '#15803d';
  const icon   = isErr ? '⚠ '      : isInfo ? 'ℹ '      : '✓ ';
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: bg, border: `1px solid ${border}`, color,
      borderRadius: 10, padding: '10px 18px',
      fontSize: '0.78rem', fontWeight: 700,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'fadeIn 0.2s ease', maxWidth: 380,
    }}>
      {icon}{message}
    </div>
  );
}

/* ── Three-dot Kebab Menu ─────────────────────────────────────── */
function KebabMenu({ id, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        id={id}
        onClick={() => setOpen(v => !v)}
        title="Options"
        style={{
          background: open ? '#f1f5f9' : 'none',
          border: 'none', cursor: 'pointer',
          padding: '4px 7px', borderRadius: 6,
          fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1,
          display: 'flex', alignItems: 'center', outline: 'none',
          transition: 'background 0.15s',
        }}
      >
        ⋮
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)',
          background: '#fff', borderRadius: 10,
          boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
          border: '1px solid #e2e8f0',
          minWidth: 170, zIndex: 200, overflow: 'hidden',
          animation: 'menuPop 0.14s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { item.action(); setOpen(false); }}
              disabled={item.disabled}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', textAlign: 'left',
                padding: '9px 14px', background: 'none', border: 'none',
                fontSize: '0.74rem', fontWeight: 600, color: item.danger ? '#be123c' : '#334155',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                opacity: item.disabled ? 0.5 : 1,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── View All Modal ───────────────────────────────────────────── */
function ViewAllModal({ isOpen, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, animation: 'fadeIn 0.18s ease',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 16,
        width: '94%', maxWidth: 1000,
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 48px rgba(0,0,0,0.16)',
        animation: 'modalPop 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
        overflow: 'hidden', border: '1px solid #e2e8f0',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(90deg,#f8fafc,#fff)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: C.navy }}>{title}</h3>
            {subtitle && <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: 30, height: 30, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', color: C.slate, transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            title="Close"
          >✕</button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Variance Cell ────────────────────────────────────────────── */
function VarCell({ v, isPct = false }) {
  if (v === null || v === undefined) return <td style={TD}>—</td>;
  if (typeof v === 'string' && v.includes('%')) return <td style={{ ...TD, color: C.slate }}>{v}</td>;
  const pos = v >= 0;
  return (
    <td style={{ ...TD, color: pos ? C.green : C.rose, fontWeight: 700 }}>
      {pos ? '▲' : '▼'} {Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: isPct ? 2 : 0 })}{isPct ? '%' : ''}
    </td>
  );
}

/* Inline variance badge for modal tables */
function VarBadge({ v, isPct = false }) {
  if (v === null || v === undefined) return <span style={{ color: C.muted }}>—</span>;
  const pos = v >= 0;
  return (
    <span style={{ color: pos ? C.green : C.rose, fontWeight: 700 }}>
      {pos ? '▲' : '▼'} {Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: isPct ? 2 : 0 })}{isPct ? '%' : ''}
    </span>
  );
}

/* ── Number formatters ────────────────────────────────────────── */
const fmtNum = (v, currency = 'AED') => {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (isNaN(n)) return v;
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
/* Compact formatter for KPI cards — keeps numbers from overflowing */
const fmtKPI = (v, currency = 'AED') => {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (isNaN(n)) return v;
  if (Math.abs(n) >= 1_000_000_000) return `${currency} ${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000)     return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000)         return `${currency} ${(n / 1_000).toFixed(1)}K`;
  return `${currency} ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};
const fmtPct = (v) => (v !== null && v !== undefined) ? `${Number(v).toFixed(2)}%` : '—';
const fmtAxisNum = (v) => {
  if (v === 0) return '0';
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(v) >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000)         return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

/* ── Custom Chart Tooltip ─────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, currency = 'AED' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0',
      backdropFilter: 'blur(6px)', borderRadius: 8, padding: '8px 12px',
      fontSize: '0.7rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 150,
    }}>
      <div style={{ fontWeight: 700, color: C.navy, marginBottom: 5, borderBottom: '1px solid #f1f5f9', paddingBottom: 4 }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
            <span style={{ color: C.slate }}>{p.name}</span>
          </div>
          <span style={{ fontWeight: 700, color: C.navy }}>
            {currency} {Number(p.value).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Legend Row ───────────────────────────────────────────────── */
function LegendRow({ items }) {
  return (
    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
      {items.map(([label, color, dashed]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 18, height: 2.5,
            background: dashed ? 'transparent' : color,
            borderTop: dashed ? `2.5px dashed ${color}` : 'none',
            display: 'inline-block', borderRadius: 1,
          }} />
          <span style={{ fontSize: '0.62rem', color: C.slate, fontWeight: 500 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────── */
function KPICard({ id, label, value, subValue, changePct, compareLabel, color, iconBg, icon, loading, error }) {
  const [hover, setHover] = useState(false);
  const accent = color || C.primary;
  const up = changePct >= 0;

  return (
    <div
      id={`kpi-${id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1, minWidth: 140,
        background: `linear-gradient(145deg, #fff 0%, ${iconBg}80 100%)`,
        borderRadius: 12, padding: '12px 14px',
        boxShadow: hover ? `0 8px 24px ${accent}25` : '0 2px 8px rgba(0,0,0,0.04)',
        border: `1px solid ${hover ? accent + '30' : 'rgba(0,0,0,0.04)'}`,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex', alignItems: 'center', gap: 12,
        overflow: 'hidden', position: 'relative', minHeight: 82,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%', background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: accent, fontSize: '1.2rem',
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: accent, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
          {label}
        </span>
        {loading ? <Skeleton h={16} w={90} /> : error ? (
          <span style={{ fontSize: '0.68rem', color: C.rose }}>Error loading</span>
        ) : (
          <>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
              {value}
            </div>
            {subValue && <div style={{ fontSize: '0.62rem', color: C.slate, fontWeight: 500 }}>{subValue}</div>}
            {changePct !== null && changePct !== undefined && compareLabel && (
              <div style={{ fontSize: '0.62rem', fontWeight: 600, lineHeight: 1.1, marginTop: 2 }}>
                <span style={{ color: up ? C.green : C.rose, marginRight: 3 }}>
                  {up ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
                </span>
                <span style={{ color: C.muted }}>{compareLabel}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Modal Table wrapper styles ───────────────────────────────── */
const MTH = {
  padding: '10px 14px', textAlign: 'right', fontSize: '0.73rem',
  fontWeight: 700, color: '#1e3a8a', background: '#f8fafc',
  borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 1,
};
const MTH_L = { ...MTH, textAlign: 'left' };
const MTD   = { padding: '9px 14px', textAlign: 'right', fontSize: '0.74rem', color: '#334155', borderBottom: '1px solid #f1f5f9' };
const MTD_L = { ...MTD, textAlign: 'left', color: C.navy };

/* ── Section Header (collapsible table row) ───────────────────── */
function SectionHeader({ label, expanded, onToggle, colSpan = 8 }) {
  return (
    <tr onClick={onToggle} style={{ background: 'linear-gradient(90deg, #f0f4ff, #f8fafc)', cursor: 'pointer', borderBottom: `1px solid ${C.border}` }}>
      <td colSpan={colSpan} style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 800, color: C.navy, letterSpacing: '0.04em' }}>
        <span style={{ marginRight: 7, fontSize: '0.62rem', display: 'inline-block', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</span>
        {label}
      </td>
    </tr>
  );
}

/* ── P&L Statement Row ────────────────────────────────────────── */
function PLRow({ row, indent = false, currency = 'AED', thStyles, tdStyles }) {
  const [hover, setHover] = useState(false);
  const THL = thStyles || TH_L;
  const TDx = tdStyles || TD;
  const TDLx = { ...(tdStyles || TD), textAlign: 'left', color: C.navy };

  const isSpecial = row.isTotal || row.isGrossProfit || row.isEbitda || row.isNetProfit;
  const isPct     = row.isPct;
  const rowBg = row.isNetProfit ? '#f0fdf4' : row.isEbitda || row.isGrossProfit ? '#eef2ff' : row.isTotal ? '#f8fafc' : 'transparent';
  const labelColor = row.isNetProfit ? C.green : row.isEbitda || row.isGrossProfit ? C.primary : isSpecial ? C.navy : '#334155';
  const fmtCell = (v) => isPct ? fmtPct(v) : fmtNum(v, currency);

  return (
    <tr
      style={{ background: hover && !isSpecial ? '#f0f6ff' : rowBg, transition: 'background 0.1s' }}
      onMouseEnter={() => !isSpecial && setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <td style={{ ...TDLx, paddingLeft: indent ? 28 : 12, fontWeight: isSpecial ? 700 : 400, color: labelColor, fontSize: isSpecial ? '0.76rem' : '0.74rem', borderBottom: `1px solid ${row.isTotal ? '#e2e8f0' : '#f1f5f9'}` }}>
        {row.label}
      </td>
      <td style={{ ...TDx, fontWeight: isSpecial ? 700 : 400, color: labelColor }}>{fmtCell(row.current)}</td>
      <td style={{ ...TDx, color: C.slate }}>{fmtCell(row.compare)}</td>
      {isPct ? (
        <td style={{ ...TDx, color: row.var_value >= 0 ? C.green : C.rose, fontWeight: 600 }}>
          {row.var_value !== null && row.var_value !== undefined ? `${row.var_value >= 0 ? '+' : ''}${Number(row.var_value).toFixed(2)}pp` : '—'}
        </td>
      ) : <VarCell v={row.var_value} />}
      {isPct ? <td style={{ ...TDx, color: C.slate }}>—</td> : <VarCell v={row.var_pct} isPct />}
      <td style={{ ...TDx, fontWeight: isSpecial ? 700 : 400, color: labelColor }}>{fmtCell(row.ytd_current)}</td>
      <td style={{ ...TDx, color: C.slate }}>{fmtCell(row.ytd_prev)}</td>
      {isPct ? <td style={{ ...TDx, color: C.slate }}>—</td> : <VarCell v={row.ytd_var_pct} isPct />}
    </tr>
  );
}

/* ══════════════════════════════════════════════════════════════════
   VIEW ALL MODAL CONTENTS
══════════════════════════════════════════════════════════════════ */

/* Trend View All Table */
function TrendViewAll({ data, currency }) {
  if (!data?.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Period</th>
          <th style={MTH}>Revenue</th>
          <th style={MTH}>Gross Profit</th>
          <th style={MTH}>EBITDA</th>
          <th style={MTH}>Net Profit</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}
            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <td style={{ ...MTD_L, fontWeight: 600 }}>{row.period_name}</td>
            <td style={MTD}>{fmtNum(row.total_revenue, currency)}</td>
            <td style={{ ...MTD, color: C.green, fontWeight: 600 }}>{fmtNum(row.gross_profit, currency)}</td>
            <td style={{ ...MTD, color: C.purple, fontWeight: 600 }}>{fmtNum(row.ebitda, currency)}</td>
            <td style={{ ...MTD, color: C.orange, fontWeight: 600 }}>{fmtNum(row.net_profit, currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* Comparison View All Table */
function ComparisonViewAll({ data, currency, periodLabel, compareLabel }) {
  if (!data?.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Metric</th>
          <th style={MTH}>{periodLabel}</th>
          <th style={MTH}>{compareLabel}</th>
          <th style={MTH}>Prior Year</th>
          <th style={MTH}>Variance (vs Compare)</th>
          <th style={MTH}>Variance %</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => {
          const varVal = row.current - row.compare;
          const varPct = row.compare ? ((varVal / Math.abs(row.compare)) * 100) : null;
          return (
            <tr key={i}
              onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ ...MTD_L, fontWeight: 700 }}>{row.metric}</td>
              <td style={{ ...MTD, fontWeight: 700, color: C.primary }}>{fmtNum(row.current, currency)}</td>
              <td style={MTD}>{fmtNum(row.compare, currency)}</td>
              <td style={{ ...MTD, color: C.slate }}>{fmtNum(row.prior_year, currency)}</td>
              <td style={{ ...MTD, color: varVal >= 0 ? C.green : C.rose, fontWeight: 700 }}>
                <VarBadge v={varVal} />
              </td>
              <td style={{ ...MTD, color: varPct >= 0 ? C.green : C.rose, fontWeight: 700 }}>
                {varPct !== null ? <VarBadge v={varPct} isPct /> : '—'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* Expense Breakdown View All Table */
function ExpenseViewAll({ data, totalExpenses, currency }) {
  const items = data?.items || [];
  if (!items.length) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Expense Category</th>
          <th style={MTH}>Amount</th>
          <th style={MTH}>Percentage</th>
          <th style={MTH}>of Total Expenses</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i}
            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <td style={MTD_L}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: EXPENSE_COLORS[i % EXPENSE_COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                {item.name}
              </div>
            </td>
            <td style={{ ...MTD, fontWeight: 600 }}>{fmtNum(item.amount, currency)}</td>
            <td style={{ ...MTD, fontWeight: 700, color: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}>
              {item.pct != null ? `${Number(item.pct).toFixed(2)}%` : '—'}
            </td>
            <td style={MTD}>
              {totalExpenses ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden', maxWidth: 100 }}>
                    <div style={{ width: `${item.pct || 0}%`, height: '100%', background: EXPENSE_COLORS[i % EXPENSE_COLORS.length], borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: C.slate }}>{item.pct?.toFixed(1)}%</span>
                </div>
              ) : '—'}
            </td>
          </tr>
        ))}
        {/* Total row */}
        <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
          <td style={{ ...MTD_L, fontWeight: 800, color: C.navy }}>Total Expenses</td>
          <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>{fmtNum(totalExpenses, currency)}</td>
          <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>100.00%</td>
          <td style={MTD}>—</td>
        </tr>
      </tbody>
    </table>
  );
}

/* KPI Summary View All Table */
function KPISummaryViewAll({ summary, currency, periodName, comparePeriodName }) {
  if (!summary) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
  const rows = [
    { label: 'Total Revenue',     current: summary.total_revenue,   compare: summary.compare_total_revenue,   varPct: summary.revenue_variance_pct },
    { label: 'Cost of Sales',     current: summary.cost_of_sales,   compare: null,                            varPct: null },
    { label: 'Gross Profit',      current: summary.gross_profit,    compare: summary.compare_gross_profit,    varPct: summary.gross_profit_variance_pct, pct: summary.gross_profit_pct },
    { label: 'Other Income',      current: summary.other_income,    compare: null,                            varPct: null },
    { label: 'Operating Expenses',current: summary.operating_expenses, compare: null,                         varPct: null },
    { label: 'EBITDA',            current: summary.ebitda,          compare: summary.compare_ebitda,          varPct: summary.ebitda_variance_pct, pct: summary.ebitda_pct },
    { label: 'PBT',               current: summary.pbt,             compare: null,                            varPct: null },
    { label: 'Tax Expense',       current: summary.tax_expense,     compare: null,                            varPct: null },
    { label: 'Net Profit',        current: summary.net_profit,      compare: summary.compare_net_profit,      varPct: summary.net_profit_variance_pct, pct: summary.net_profit_pct, isNet: true },
  ];
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Metric</th>
          <th style={MTH}>{periodName || 'Current'}</th>
          <th style={MTH}>{comparePeriodName || 'Compare'}</th>
          <th style={MTH}>Variance %</th>
          <th style={MTH}>Margin %</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}
            style={{ background: row.isNet ? '#f0fdf4' : 'transparent' }}
            onMouseEnter={e => !row.isNet && (e.currentTarget.style.background = '#f8faff')}
            onMouseLeave={e => !row.isNet && (e.currentTarget.style.background = 'transparent')}
          >
            <td style={{ ...MTD_L, fontWeight: row.isNet ? 800 : 500, color: row.isNet ? C.green : C.navy }}>{row.label}</td>
            <td style={{ ...MTD, fontWeight: row.isNet ? 800 : 500, color: row.isNet ? C.green : '#334155' }}>{fmtNum(row.current, currency)}</td>
            <td style={{ ...MTD, color: C.slate }}>{row.compare != null ? fmtNum(row.compare, currency) : '—'}</td>
            <td style={MTD}>{row.varPct != null ? <VarBadge v={row.varPct} isPct /> : '—'}</td>
            <td style={{ ...MTD, color: C.slate }}>{row.pct != null ? fmtPct(row.pct) : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* P&L Statement View All (full statement in modal) */
function StatementViewAll({ statementData, currency, periodName, comparePeriodName }) {
  const [secIncome,   setSecIncome]   = useState(true);
  const [secCOGS,     setSecCOGS]     = useState(true);
  const [secExpenses, setSecExpenses] = useState(true);
  if (!statementData) return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
      <thead>
        <tr>
          <th style={{ ...MTH_L, width: '26%' }}>Particulars</th>
          <th style={MTH}>Current Period<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>{periodName}</span></th>
          <th style={MTH}>Compare Period<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>{comparePeriodName}</span></th>
          <th style={MTH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(Value)</span></th>
          <th style={MTH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(%)</span></th>
          <th style={MTH}>YTD Current</th>
          <th style={MTH}>YTD Prev Year</th>
          <th style={MTH}>YTD Var<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(%)</span></th>
        </tr>
      </thead>
      <tbody>
        <SectionHeader label="INCOME" expanded={secIncome} onToggle={() => setSecIncome(p => !p)} />
        {secIncome && statementData.income?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal} currency={''} tdStyles={MTD} />)}
        <SectionHeader label="COST OF SALES" expanded={secCOGS} onToggle={() => setSecCOGS(p => !p)} />
        {secCOGS && statementData.cost_of_sales?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal && !row.isGrossProfit && !row.isPct} currency={''} tdStyles={MTD} />)}
        <SectionHeader label="EXPENSES" expanded={secExpenses} onToggle={() => setSecExpenses(p => !p)} />
        {secExpenses && statementData.expenses?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal && !row.isEbitda && !row.isPct} currency={''} tdStyles={MTD} />)}
        {statementData.bottom?.map((row, i) => <PLRow key={i} row={row} indent={!row.isNetProfit} currency={''} tdStyles={MTD} />)}
      </tbody>
    </table>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function PLAnalytics() {

  /* ── Filter state ─────────────────────────────────────────────── */
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  /* ── Dropdown options ─────────────────────────────────────────── */
  const [filterOptions, setFilterOptions] = useState({
    legalGroups:     ['All'],
    legalEntities:   ['All'],
    parentDivisions: ['All'],
    subdivisions:    ['All'],
    periods:         [],
    currencies:      ['AED', 'USD', 'EUR'],
  });

  /* ── Data state ───────────────────────────────────────────────── */
  const [summary,        setSummary]        = useState(null);
  const [trendData,      setTrendData]      = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [expenseData,    setExpenseData]    = useState(null);
  const [statementData,  setStatementData]  = useState(null);

  /* ── Section collapse (inline table) ─────────────────────────── */
  const [secIncome,   setSecIncome]   = useState(true);
  const [secCOGS,     setSecCOGS]     = useState(true);
  const [secExpenses, setSecExpenses] = useState(true);

  /* ── Loading & Error ──────────────────────────────────────────── */
  const [loading, setLoading] = useState({
    filters: true, summary: true, trend: true,
    comparison: true, expenseBreakdown: true, statement: true,
  });
  const [errors, setErrors] = useState({});

  /* ── Toast ────────────────────────────────────────────────────── */
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── View All modal state ─────────────────────────────────────── */
  // 'kpi' | 'trend' | 'comparison' | 'expense' | 'statement' | null
  const [openModal, setOpenModal] = useState(null);
  const closeModal = () => setOpenModal(null);

  /* ── Load filter options (cascading) ──────────────────────────── */
  useEffect(() => {
    setLoading(prev => ({ ...prev, filters: true }));
    fetchPLFilters({ legalGroup: filters.legalGroup, legalEntity: filters.legalEntity, parentDivision: filters.parentDivision })
      .then(data => {
        setFilterOptions(prev => {
          const periods = data.periods || [];
          setFilters(f => ({ ...f, periodName: f.periodName || periods[0] || '', comparePeriodName: f.comparePeriodName || periods[1] || '' }));
          setAppliedFilters(f => ({ ...f, periodName: f.periodName || periods[0] || '', comparePeriodName: f.comparePeriodName || periods[1] || '' }));
          return {
            ...prev,
            legalGroups:     ['All', ...(data.legal_groups     || [])],
            legalEntities:   ['All', ...(data.legal_entities   || [])],
            parentDivisions: ['All', ...(data.parent_divisions || [])],
            subdivisions:    ['All', ...(data.subdivisions     || [])],
            periods,
          };
        });
      })
      .catch(err => setErrors(prev => ({ ...prev, filters: err?.message || 'Failed to load filters' })))
      .finally(() => setLoading(prev => ({ ...prev, filters: false })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.legalGroup, filters.legalEntity, filters.parentDivision]);

  /* ── Fetch all data ───────────────────────────────────────────── */
  const fetchAll = useCallback((f) => {
    setLoading({ filters: false, summary: true, trend: true, comparison: true, expenseBreakdown: true, statement: true });
    setErrors({});
    const guard = (key, promise) =>
      promise
        .catch(err => { setErrors(prev => ({ ...prev, [key]: err?.message || 'Failed to load data' })); return null; })
        .finally(() => setLoading(prev => ({ ...prev, [key]: false })));

    guard('summary',          fetchPLSummary(f)).then(d => { if (d) setSummary(d); });
    guard('trend',            fetchPLTrend(f)).then(d => { if (d) setTrendData(d); });
    guard('comparison',       fetchPLComparison(f)).then(d => { if (d) setComparisonData(d); });
    guard('expenseBreakdown', fetchPLExpenseBreakdown(f)).then(d => { if (d) setExpenseData(d); });
    guard('statement',        fetchPLStatement(f)).then(d => { if (d) setStatementData(d); });
  }, []);

  useEffect(() => {
    if (appliedFilters.periodName) fetchAll(appliedFilters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters.periodName]);

  /* ── Filter handlers ──────────────────────────────────────────── */
  const handleLegalGroupChange  = (v) => setFilters(p => ({ ...p, legalGroup: v, legalEntity: 'All', parentDivision: 'All', subdivision: 'All' }));
  const handleLegalEntityChange = (v) => setFilters(p => ({ ...p, legalEntity: v, parentDivision: 'All', subdivision: 'All' }));
  const handleParentDivChange   = (v) => setFilters(p => ({ ...p, parentDivision: v, subdivision: 'All' }));

  const handleApply = () => { setAppliedFilters({ ...filters }); fetchAll({ ...filters }); };
  const handleReset = () => {
    const reset = { ...DEFAULT_FILTERS, periodName: filterOptions.periods[0] || '', comparePeriodName: filterOptions.periods[1] || '' };
    setFilters(reset); setAppliedFilters(reset); fetchAll(reset);
  };

  /* ── Export handler — calls real exportPL() service ──────────── */
  const [exporting, setExporting] = useState(null);
  const handleExport = (format, section = 'full') => {
    if (exporting) return;
    setExporting(format);
    exportPL(format, appliedFilters)
      .then(() => showToast(`${format.toUpperCase()} export downloaded successfully.`, 'success'))
      .catch(err => showToast(
        `Export failed: ${err?.message || 'Unknown error'}. Please try again.`,
        'error'
      ))
      .finally(() => setExporting(null));
  };

  /* ── Derived values ───────────────────────────────────────────── */
  const currency    = appliedFilters.currency || 'AED';
  const compareLbl  = appliedFilters.comparePeriodName ? `vs ${appliedFilters.comparePeriodName}` : '';
  const periodLabel = appliedFilters.periodName        || 'Current';
  const compareLabel= appliedFilters.comparePeriodName || 'Compare';
  const priorLabel  = 'Prior Year';
  // Handle both { items, total_expenses } and { data: [...] } API response shapes
  const expenseItems  = expenseData?.items || (Array.isArray(expenseData?.data) ? expenseData.data : []);
  const totalExpenses = expenseData?.total_expenses
    ?? expenseItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  /* ── KPI card definitions ─────────────────────────────────────── */
  const kpiCards = [
    { id: 'total-rev',     label: 'Total Revenue (MTD)',       value: fmtKPI(summary?.total_revenue, currency),        subValue: null,                                                            changePct: summary?.revenue_variance_pct,       compareLabel: compareLbl, color: '#2563eb', iconBg: '#eff6ff', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> },
    { id: 'gross-profit',  label: 'Gross Profit (MTD)',        value: fmtKPI(summary?.gross_profit, currency),          subValue: summary?.gross_profit_pct ? `Margin: ${fmtPct(summary.gross_profit_pct)}` : null,  changePct: summary?.gross_profit_variance_pct,  compareLabel: compareLbl, color: '#16a34a', iconBg: '#f0fdf4', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fillOpacity="0.85"/></svg> },
    { id: 'ebitda',        label: 'EBITDA (MTD)',               value: fmtKPI(summary?.ebitda, currency),                subValue: summary?.ebitda_pct ? `Margin: ${fmtPct(summary.ebitda_pct)}` : null,              changePct: summary?.ebitda_variance_pct,        compareLabel: compareLbl, color: '#7c3aed', iconBg: '#faf5ff', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg> },
    { id: 'net-profit',    label: 'Net Profit (MTD)',           value: fmtKPI(summary?.net_profit, currency),            subValue: null,                                                            changePct: summary?.net_profit_variance_pct,    compareLabel: compareLbl, color: '#ea580c', iconBg: '#fff7ed', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/><path d="M12 18V6"/></svg> },
    { id: 'np-margin',     label: 'Net Profit Margin (MTD)',    value: fmtPct(summary?.net_profit_pct),                  subValue: null,                                                            changePct: summary && summary.net_profit_pct != null && summary.compare_net_profit_pct != null ? +(summary.net_profit_pct - summary.compare_net_profit_pct).toFixed(2) : null, compareLabel: compareLbl, color: '#0d9488', iconBg: '#f0fdfa', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 4.5C4.5 4.5 2 7 2 10s2.5 5.5 5.5 5.5S13 13 13 10 10.5 4.5 7.5 4.5zm0 9C5.57 13.5 4 11.93 4 10s1.57-3.5 3.5-3.5S11 8.07 11 10s-1.57 3.5-3.5 3.5z" fillOpacity="0.9"/><path d="M19 8l-7 8M14 4h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg> },
    { id: 'ebitda-margin', label: 'EBITDA Margin (MTD)',        value: fmtPct(summary?.ebitda_pct),                      subValue: null,                                                            changePct: summary && summary.ebitda_pct != null && summary.compare_ebitda_pct != null ? +(summary.ebitda_pct - summary.compare_ebitda_pct).toFixed(2) : null,       compareLabel: compareLbl, color: '#db2777', iconBg: '#fdf2f8', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12"/><polyline points="12 6 12 12 16 14"/></svg> },
  ];

  /* ── Kebab menu definitions ───────────────────────────────────── */
  const makeExportItems = (section) => [
    { icon: '📊', label: 'Export Excel', action: () => handleExport('excel', section) },
    { icon: '📄', label: 'Export PDF',   action: () => handleExport('pdf',   section) },
  ];

  const kpiMenuItems       = [{ icon: '🔎', label: 'View All',     action: () => setOpenModal('kpi') },       ...makeExportItems('kpi')];
  const trendMenuItems     = [{ icon: '🔎', label: 'View All',     action: () => setOpenModal('trend') },     ...makeExportItems('trend')];
  const compMenuItems      = [{ icon: '🔎', label: 'View All',     action: () => setOpenModal('comparison') },...makeExportItems('comparison')];
  const expenseMenuItems   = [{ icon: '🔎', label: 'View All',     action: () => setOpenModal('expense') },   ...makeExportItems('expense')];
  const statementMenuItems = [{ icon: '🔎', label: 'View All',     action: () => setOpenModal('statement') }, ...makeExportItems('statement')];

  /* ══════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="animate-in" style={{ padding: '20px 0 40px', background: C.bg, minHeight: '100%' }}>

      <style>{`
        @keyframes shimmer  { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        @keyframes fadeIn   { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes menuPop  { from { opacity: 0; transform: scale(0.94) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {toast && <ExportToast message={toast.msg} type={toast.type} />}

      {/* ══ VIEW ALL MODALS ══ */}
      <ViewAllModal isOpen={openModal === 'kpi'} onClose={closeModal} title="KPI Summary" subtitle={`Period: ${appliedFilters.periodName} | Compare: ${appliedFilters.comparePeriodName}`}>
        <KPISummaryViewAll summary={summary} currency={currency} periodName={appliedFilters.periodName} comparePeriodName={appliedFilters.comparePeriodName} />
      </ViewAllModal>

      <ViewAllModal isOpen={openModal === 'trend'} onClose={closeModal} title="P&L Trend — All Periods" subtitle={`Currency: ${currency}`}>
        <TrendViewAll data={trendData} currency={currency} />
      </ViewAllModal>

      <ViewAllModal isOpen={openModal === 'comparison'} onClose={closeModal} title="P&L Comparison" subtitle={`${periodLabel} vs ${compareLabel} vs Prior Year`}>
        <ComparisonViewAll data={comparisonData} currency={currency} periodLabel={periodLabel} compareLabel={compareLabel} />
      </ViewAllModal>

      <ViewAllModal isOpen={openModal === 'expense'} onClose={closeModal} title="Expense Breakdown" subtitle={`Period: ${appliedFilters.periodName} | Currency: ${currency}`}>
        <ExpenseViewAll data={expenseData} totalExpenses={totalExpenses} currency={currency} />
      </ViewAllModal>

      <ViewAllModal isOpen={openModal === 'statement'} onClose={closeModal} title="Profit & Loss Statement" subtitle={`${appliedFilters.periodName} vs ${appliedFilters.comparePeriodName} | All values in ${currency}`}>
        <StatementViewAll statementData={statementData} currency={currency} periodName={appliedFilters.periodName} comparePeriodName={appliedFilters.comparePeriodName} />
      </ViewAllModal>

      {/* ══ PAGE HEADER ══ */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, margin: 0 }}>Profit &amp; Loss Account</h1>
          <p style={{ fontSize: '0.76rem', color: C.slate, margin: '3px 0 0' }}>
            Analyze profitability metrics and track financial performance across periods
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select id="pl-currency" value={filters.currency} onChange={e => setFilters(prev => ({ ...prev, currency: e.target.value }))}
            style={{ ...selStyle, width: 80, fontSize: '0.74rem', padding: '7px 22px 7px 8px' }} title="Select currency">
            {filterOptions.currencies.map(c => <option key={c}>{c}</option>)}
          </select>
          <button id="btn-pl-export-excel" onClick={() => handleExport('excel')} disabled={!!exporting}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: exporting?.includes('excel') ? '#d1fae5' : '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: '0.76rem', fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
            {exporting?.includes('excel') ? '⏳' : '📊'} Excel
          </button>
          <button id="btn-pl-export-pdf" onClick={() => handleExport('pdf')} disabled={!!exporting}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: exporting?.includes('pdf') ? '#fee2e2' : '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', borderRadius: 8, fontSize: '0.76rem', fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1 }}>
            {exporting?.includes('pdf') ? '⏳' : '📄'} PDF
          </button>
        </div>
      </div>

      {/* ══ FILTER BAR ══ */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'nowrap', overflowX: 'auto' }}>
        <FilterField label="Legal Group">
          <select id="filter-pl-legal-group" style={selStyle} value={filters.legalGroup} onChange={e => handleLegalGroupChange(e.target.value)} disabled={loading.filters}>
            {filterOptions.legalGroups.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="Legal Entity">
          <select id="filter-pl-legal-entity" style={selStyle} value={filters.legalEntity} onChange={e => handleLegalEntityChange(e.target.value)} disabled={loading.filters}>
            {filterOptions.legalEntities.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="Parent Division">
          <select id="filter-pl-parent-div" style={selStyle} value={filters.parentDivision} onChange={e => handleParentDivChange(e.target.value)} disabled={loading.filters}>
            {filterOptions.parentDivisions.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="Sub-Division">
          <select id="filter-pl-sub-div" style={selStyle} value={filters.subdivision} onChange={e => setFilters(prev => ({ ...prev, subdivision: e.target.value }))} disabled={loading.filters}>
            {filterOptions.subdivisions.map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="Period">
          <select id="filter-pl-period" style={selStyle} value={filters.periodName} onChange={e => setFilters(prev => ({ ...prev, periodName: e.target.value }))} disabled={loading.filters}>
            {filterOptions.periods.length === 0 && <option key="loading" value="">Loading…</option>}
            {filterOptions.periods.map(p => <option key={p}>{p}</option>)}
          </select>
        </FilterField>
        <FilterField label="Compare With">
          <select id="filter-pl-compare" style={selStyle} value={filters.comparePeriodName} onChange={e => setFilters(prev => ({ ...prev, comparePeriodName: e.target.value }))} disabled={loading.filters}>
            {filterOptions.periods.length === 0 && <option key="loading" value="">Loading…</option>}
            {filterOptions.periods.map(p => <option key={p}>{p}</option>)}
          </select>
        </FilterField>
        <button id="btn-pl-apply" onClick={handleApply} style={{ padding: '7px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>Apply</button>
        <button id="btn-pl-reset" onClick={handleReset} style={{ background: 'none', border: 'none', color: C.slate, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-end', padding: '7px 4px', whiteSpace: 'nowrap' }}>Reset</button>
      </div>

      {errors.filters && <ErrorBanner message={errors.filters} />}

      {/* ══ KPI CARDS ══ */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>Key Performance Indicators</span>
          <KebabMenu id="menu-kpi" items={kpiMenuItems} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {kpiCards.map(kpi => <KPICard key={kpi.id} {...kpi} loading={loading.summary} error={errors.summary} />)}
        </div>
      </div>

      {/* ══ CHARTS ROW ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>

        {/* P&L Trend — interactive animated card, wired to live API data */}
        <PLTrendCard
          data={trendData}
          loading={loading.trend}
          currency={currency}
        />

        {/* P&L Comparison */}
        <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>P&amp;L Comparison</div>
              <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 1 }}>{periodLabel} vs {compareLabel} vs {priorLabel}</div>
            </div>
            <KebabMenu id="menu-comparison" items={compMenuItems} />
          </div>
          {errors.comparison ? <ErrorBanner message={errors.comparison} onRetry={() => fetchAll(appliedFilters)} />
            : (
              <PLComparisonCard
                data={comparisonData}
                loading={loading.comparison}
                currency={currency}
                periodLabel={periodLabel}
                compareLabel={compareLabel}
                priorLabel={priorLabel}
              />
            )
          }
        </div>

        {/* Expense Breakdown */}
        <ExpenseBreakdownCard
          data={expenseItems}
          loading={loading.expenseBreakdown}
          currency={currency}
          error={errors.expenseBreakdown}
          onRetry={() => fetchAll(appliedFilters)}
          menuItems={expenseMenuItems}
          KebabMenu={KebabMenu}
          ErrorBanner={ErrorBanner}
          Skeleton={Skeleton}
        />
      </div>

      {/* ══ P&L STATEMENT TABLE ══ */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(90deg,#f8fafc,#fff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: C.navy }}>Profit &amp; Loss Statement</span>
            <span style={{ fontSize: '0.7rem', color: C.slate, marginLeft: 12 }}>
              {appliedFilters.periodName} &nbsp;|&nbsp; All values in {currency}
            </span>
          </div>
          <KebabMenu id="menu-statement" items={statementMenuItems} />
        </div>

        {errors.statement ? (
          <div style={{ padding: 16 }}><ErrorBanner message={errors.statement} onRetry={() => fetchAll(appliedFilters)} /></div>
        ) : loading.statement ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(8)].map((_, i) => <Skeleton key={i} h={24} w={`${60 + (i % 3) * 15}%`} />)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
              <thead>
                <tr>
                  <th style={{ ...TH_L, width: '26%' }}>Particulars<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(in {currency})</span></th>
                  <th style={TH}>Current Period<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>{appliedFilters.periodName}</span></th>
                  <th style={TH}>Compare Period<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>{appliedFilters.comparePeriodName}</span></th>
                  <th style={TH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(Value)</span></th>
                  <th style={TH}>Variance<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(%)</span></th>
                  <th style={TH}>YTD Current</th>
                  <th style={TH}>YTD Prev Year</th>
                  <th style={TH}>YTD Var<br /><span style={{ fontWeight: 400, opacity: 0.75 }}>(%)</span></th>
                </tr>
              </thead>
              <tbody>
                <SectionHeader label="INCOME" expanded={secIncome} onToggle={() => setSecIncome(p => !p)} />
                {secIncome && statementData?.income?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal} currency={''} />)}

                <SectionHeader label="COST OF SALES" expanded={secCOGS} onToggle={() => setSecCOGS(p => !p)} />
                {secCOGS && statementData?.cost_of_sales?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal && !row.isGrossProfit && !row.isPct} currency={''} />)}

                <SectionHeader label="EXPENSES" expanded={secExpenses} onToggle={() => setSecExpenses(p => !p)} />
                {secExpenses && statementData?.expenses?.map((row, i) => <PLRow key={i} row={row} indent={!row.isTotal && !row.isEbitda && !row.isPct} currency={''} />)}

                {statementData?.bottom?.map((row, i) => <PLRow key={i} row={row} indent={!row.isNetProfit} currency={''} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══ FOOTER ══ */}
      <div style={{ fontSize: '0.64rem', color: C.muted, display: 'flex', justifyContent: 'space-between', paddingTop: 8, flexWrap: 'wrap', gap: 4 }}>
        <span>All values in {currency} &nbsp;|&nbsp; Period: {appliedFilters.periodName || '—'} &nbsp;|&nbsp; Compared with: {appliedFilters.comparePeriodName || '—'}</span>
        <span>☁️ Source: Oracle Fusion Cloud</span>
      </div>

    </div>
  );
}
