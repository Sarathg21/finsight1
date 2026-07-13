import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  fetchBSFilters,
  fetchBSSummary,
  fetchBSSubDivision,
  fetchBSTrend,
  fetchBSDrilldown,
  fetchBSReconciliation,
  exportBS,
} from '../services/bsApi';
import { C } from '../utils/theme';

/* ══════════════════════════════════════════════════════════════════════
   CONSTANTS & DEFAULTS
══════════════════════════════════════════════════════════════════════ */

const DEFAULT_FILTERS = {
  period:        '',
  comparePeriod: '',
  currency:      'AED',
  legalEntityId: '',
  ledger:        '',
};

/* ══════════════════════════════════════════════════════════════════════
   SHARED STYLES  (mirror PLAnalytics.jsx)
══════════════════════════════════════════════════════════════════════ */

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

/* ══════════════════════════════════════════════════════════════════════
   NUMBER FORMATTERS
══════════════════════════════════════════════════════════════════════ */

const fmtNum = (v, currency = 'AED') => {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (isNaN(n)) return v;
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const fmtKPI = (v, currency = 'AED') => {
  if (v === null || v === undefined) return '—';
  const n = Math.abs(Number(v));
  if (isNaN(n)) return v;
  if (n >= 1_000_000_000) return `${currency} ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)         return `${currency} ${(n / 1_000).toFixed(1)}K`;
  return `${currency} ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

const fmtAxisNum = (v) => {
  if (v === 0) return '0';
  const n = Math.abs(v);
  if (n >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

const fmtPct = (v) =>
  v !== null && v !== undefined ? `${Number(v).toFixed(2)}%` : '—';

/* ══════════════════════════════════════════════════════════════════════
   HELPER COMPONENTS  (mirror PLAnalytics.jsx)
══════════════════════════════════════════════════════════════════════ */

function Skeleton({ h = 20, w = '100%', radius = 6 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: radius,
      background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)',
      backgroundSize: '200% 100%', animation: 'bs-shimmer 1.4s infinite',
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
      animation: 'bs-fadeIn 0.2s ease', maxWidth: 380,
    }}>
      {icon}{message}
    </div>
  );
}

/* ── Three-dot Kebab Menu ──────────────────────────────────────────── */
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
          animation: 'bs-menuPop 0.14s cubic-bezier(0.34,1.56,0.64,1) forwards',
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

/* ── View All Modal ────────────────────────────────────────────────── */
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
        zIndex: 1000, animation: 'bs-fadeIn 0.18s ease',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 16,
        width: '94%', maxWidth: 1020,
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 48px rgba(0,0,0,0.16)',
        animation: 'bs-modalPop 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
        overflow: 'hidden', border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
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
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Variance Cell ─────────────────────────────────────────────────── */
function VarCell({ v, isPct = false }) {
  if (v === null || v === undefined) return <td style={TD}>—</td>;
  const pos = v >= 0;
  return (
    <td style={{ ...TD, color: pos ? C.green : C.rose, fontWeight: 700 }}>
      {pos ? '▲' : '▼'} {Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: isPct ? 2 : 0 })}{isPct ? '%' : ''}
    </td>
  );
}

function VarBadge({ v, isPct = false }) {
  if (v === null || v === undefined) return <span style={{ color: C.muted }}>—</span>;
  const pos = v >= 0;
  return (
    <span style={{ color: pos ? C.green : C.rose, fontWeight: 700 }}>
      {pos ? '▲' : '▼'} {Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: isPct ? 2 : 0 })}{isPct ? '%' : ''}
    </span>
  );
}

/* ── KPI Card ──────────────────────────────────────────────────────── */
function KPICard({ id, label, value, subValue, changePct, compareLabel, color, iconBg, icon, loading, error }) {
  const [hover, setHover] = useState(false);
  const accent = color || C.primary;
  const up = changePct >= 0;

  return (
    <div
      id={`kpi-bs-${id}`}
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

/* ── Balance Status Badge ──────────────────────────────────────────── */
function BalanceBadge({ status, variance, currency }) {
  const isBalanced = status === 'BALANCED';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 14px', borderRadius: 20,
      background: isBalanced ? '#f0fdf4' : '#fff7ed',
      border: `1px solid ${isBalanced ? '#bbf7d0' : '#fed7aa'}`,
    }}>
      <span style={{ fontSize: '0.8rem' }}>{isBalanced ? '✅' : '⚠️'}</span>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isBalanced ? '#15803d' : '#c2410c' }}>
        {isBalanced ? 'Balanced' : 'Variance Detected'}
      </span>
      {!isBalanced && variance != null && (
        <span style={{ fontSize: '0.68rem', color: '#9a3412', fontWeight: 600 }}>
          ({fmtKPI(variance, currency)})
        </span>
      )}
    </div>
  );
}

/* ── Section Header (collapsible) ─────────────────────────────────── */
function SectionHeader({ label, expanded, onToggle, colSpan = 5 }) {
  return (
    <tr onClick={onToggle} style={{ background: 'linear-gradient(90deg, #f0f4ff, #f8fafc)', cursor: 'pointer', borderBottom: `1px solid ${C.border}` }}>
      <td colSpan={colSpan} style={{ padding: '8px 12px', fontSize: '0.72rem', fontWeight: 800, color: C.navy, letterSpacing: '0.04em' }}>
        <span style={{ marginRight: 7, fontSize: '0.62rem', display: 'inline-block', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>▶</span>
        {label}
      </td>
    </tr>
  );
}

/* ── Sub-Section Header ────────────────────────────────────────────── */
function SubSectionHeader({ label, colSpan = 5 }) {
  return (
    <tr style={{ background: '#f8fafc' }}>
      <td colSpan={colSpan} style={{
        padding: '6px 12px 6px 22px', fontSize: '0.69rem', fontWeight: 700,
        color: '#3730a3', borderBottom: `1px solid #e2e8f0`,
      }}>
        {label}
      </td>
    </tr>
  );
}

/* ── BS Statement Row ──────────────────────────────────────────────── */
function BSRow({ account, currency, onDrilldown }) {
  const [hover, setHover] = useState(false);
  const hasVariance = account.variance !== null && account.variance !== undefined;

  return (
    <tr
      style={{ background: hover ? '#f0f6ff' : 'transparent', transition: 'background 0.1s', cursor: onDrilldown ? 'pointer' : 'default' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onDrilldown ? () => onDrilldown(account) : undefined}
      title={onDrilldown ? `Click to drill down into ${account.account_name}` : undefined}
    >
      <td style={{ ...TD_L, paddingLeft: 32, fontSize: '0.73rem' }}>
        <span style={{ color: '#64748b', fontSize: '0.66rem', marginRight: 6, fontFamily: 'monospace' }}>
          {account.account_code}
        </span>
        {account.account_name}
        {onDrilldown && hover && (
          <span style={{ marginLeft: 6, fontSize: '0.64rem', color: C.primary, fontWeight: 600 }}>→ drilldown</span>
        )}
      </td>
      <td style={{ ...TD, fontWeight: 600 }}>{fmtNum(Math.abs(account.balance_amount), currency)}</td>
      <td style={{ ...TD, fontSize: '0.66rem', color: account.dr_cr === 'CR' ? C.rose : C.green, fontWeight: 700 }}>
        {account.dr_cr}
      </td>
      {hasVariance ? (
        <>
          <td style={{ ...TD, color: C.slate }}>{account.compare_amount != null ? fmtNum(Math.abs(account.compare_amount), currency) : '—'}</td>
          <VarCell v={account.variance} />
        </>
      ) : (
        <>
          <td style={TD}>—</td>
          <td style={TD}>—</td>
        </>
      )}
    </tr>
  );
}

/* ── Custom Chart Tooltip ──────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, currency = 'AED' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.97)', border: '1px solid #e2e8f0',
      backdropFilter: 'blur(6px)', borderRadius: 8, padding: '8px 12px',
      fontSize: '0.7rem', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 160,
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

/* ══════════════════════════════════════════════════════════════════════
   VIEW ALL MODAL CONTENTS
══════════════════════════════════════════════════════════════════════ */

const MTH = {
  padding: '10px 14px', textAlign: 'right', fontSize: '0.73rem',
  fontWeight: 700, color: '#1e3a8a', background: '#f8fafc',
  borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 1,
};
const MTH_L = { ...MTH, textAlign: 'left' };
const MTD   = { padding: '9px 14px', textAlign: 'right', fontSize: '0.74rem', color: '#334155', borderBottom: '1px solid #f1f5f9' };
const MTD_L = { ...MTD, textAlign: 'left', color: C.navy };

/* Statement View All — full BS in modal */
function StatementViewAll({ summaryData, currency }) {
  const [expanded, setExpanded] = useState({});
  if (!summaryData?.sections?.length)
    return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ ...MTH_L, width: '36%' }}>Account</th>
          <th style={MTH}>Balance Amount</th>
          <th style={{ ...MTH, width: 60 }}>DR/CR</th>
          <th style={MTH}>Compare Amount</th>
          <th style={MTH}>Variance</th>
        </tr>
      </thead>
      <tbody>
        {summaryData.sections.map((sec) => {
          const secKey = sec.section;
          const isExpanded = expanded[secKey] !== false; // default expanded
          return (
            <>
              <tr
                key={secKey}
                onClick={() => toggle(secKey)}
                style={{ background: 'linear-gradient(90deg,#eef2ff,#f8fafc)', cursor: 'pointer', borderBottom: `2px solid ${C.border}` }}
              >
                <td colSpan={5} style={{ padding: '10px 14px', fontSize: '0.73rem', fontWeight: 800, color: C.navy }}>
                  <span style={{ marginRight: 8, fontSize: '0.6rem', display: 'inline-block', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>▶</span>
                  {secKey}
                  <span style={{ marginLeft: 8, fontSize: '0.68rem', fontWeight: 600, color: C.slate }}>
                    ({fmtNum(Math.abs(sec.section_total), currency)})
                  </span>
                </td>
              </tr>
              {isExpanded && sec.sub_sections.map((sub) => (
                <>
                  <tr key={sub.sub_section} style={{ background: '#f8fafc' }}>
                    <td colSpan={5} style={{ padding: '6px 14px 6px 28px', fontSize: '0.68rem', fontWeight: 700, color: '#3730a3', borderBottom: '1px solid #e2e8f0' }}>
                      {sub.sub_section}
                      <span style={{ marginLeft: 8, fontSize: '0.64rem', color: C.slate, fontWeight: 500 }}>
                        ({fmtNum(Math.abs(sub.sub_total), currency)})
                      </span>
                    </td>
                  </tr>
                  {sub.accounts.map((acct) => (
                    <tr
                      key={acct.account_code}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...MTD_L, paddingLeft: 42, fontSize: '0.73rem' }}>
                        <span style={{ color: C.slate, fontSize: '0.65rem', marginRight: 6, fontFamily: 'monospace' }}>{acct.account_code}</span>
                        {acct.account_name}
                      </td>
                      <td style={{ ...MTD, fontWeight: 600 }}>{fmtNum(Math.abs(acct.balance_amount), currency)}</td>
                      <td style={{ ...MTD, fontSize: '0.65rem', color: acct.dr_cr === 'CR' ? C.rose : C.green, fontWeight: 700 }}>{acct.dr_cr}</td>
                      <td style={MTD}>{acct.compare_amount != null ? fmtNum(Math.abs(acct.compare_amount), currency) : '—'}</td>
                      <td style={MTD}>{acct.variance != null ? <VarBadge v={acct.variance} /> : '—'}</td>
                    </tr>
                  ))}
                </>
              ))}
            </>
          );
        })}
      </tbody>
    </table>
  );
}

/* Subdivision View All Table */
function SubDivisionViewAll({ data, currency }) {
  const rows = data?.data || [];
  if (!rows.length)
    return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Sub-Division</th>
          <th style={MTH}>Code</th>
          <th style={MTH}>Sources of Funds</th>
          <th style={MTH}>Application of Funds</th>
          <th style={MTH}>Net Balance</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <td style={{ ...MTD_L, fontWeight: 600 }}>{row.sub_division_name}</td>
            <td style={{ ...MTD, fontFamily: 'monospace', fontSize: '0.68rem', color: C.slate }}>{row.sub_division_code}</td>
            <td style={{ ...MTD, color: C.rose }}>{fmtNum(Math.abs(row.section_totals?.['SOURCES OF FUNDS'] ?? 0), currency)}</td>
            <td style={{ ...MTD, color: C.green }}>{fmtNum(Math.abs(row.section_totals?.['APPLICATION OF FUNDS'] ?? 0), currency)}</td>
            <td style={{ ...MTD, fontWeight: 700, color: (row.grand_total ?? 0) >= 0 ? C.navy : C.rose }}>
              {fmtNum(Math.abs(row.grand_total ?? 0), currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* Trend View All Table */
function TrendViewAll({ trendData, currency }) {
  const series = trendData?.series || [];
  if (!series.length)
    return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Period</th>
          <th style={MTH}>Balance Amount</th>
          <th style={MTH}>MoM Change</th>
          <th style={MTH}>MoM %</th>
        </tr>
      </thead>
      <tbody>
        {series.map((row, i) => (
          <tr
            key={i}
            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <td style={{ ...MTD_L, fontWeight: 600 }}>{row.period_name || row.period}</td>
            <td style={{ ...MTD, fontWeight: 600 }}>{fmtNum(Math.abs(row.balance_amount), currency)}</td>
            <td style={MTD}>{row.mom_change != null ? <VarBadge v={row.mom_change} /> : '—'}</td>
            <td style={MTD}>{row.mom_pct != null ? <VarBadge v={row.mom_pct} isPct /> : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* Drilldown Modal Content */
function DrilldownModal({ isOpen, onClose, data, currency }) {
  if (!isOpen) return null;
  const rows = data?.data || [];
  const account = data?.account_name || '—';
  const total   = data?.consolidated_balance ?? 0;

  return (
    <ViewAllModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Drilldown: ${account}`}
      subtitle={`Period: ${data?.period_name || data?.period || '—'} | Currency: ${currency} | Total: ${fmtNum(Math.abs(total), currency)}`}
    >
      {!rows.length ? (
        <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={MTH_L}>Sub-Division</th>
              <th style={{ ...MTH, width: 80 }}>Code</th>
              <th style={MTH}>Ledger</th>
              <th style={{ ...MTH, width: 56 }}>DR/CR</th>
              <th style={MTH}>Balance Amount</th>
              <th style={MTH}>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ ...MTD_L, fontWeight: 600 }}>{row.sub_division_name}</td>
                <td style={{ ...MTD, fontFamily: 'monospace', fontSize: '0.68rem', color: C.slate }}>{row.sub_division_code}</td>
                <td style={{ ...MTD, fontSize: '0.68rem', color: C.muted }}>{row.ledger_code || '—'}</td>
                <td style={{ ...MTD, color: row.dr_cr === 'CR' ? C.rose : C.green, fontWeight: 700 }}>{row.dr_cr}</td>
                <td style={{ ...MTD, fontWeight: 700 }}>{fmtNum(Math.abs(row.balance_amount), currency)}</td>
                <td style={{ ...MTD }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <div style={{ width: 60, height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(row.abs_pct_of_total || 0, 100)}%`, height: '100%', background: C.primary, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: C.navy, minWidth: 36, textAlign: 'right' }}>
                      {fmtPct(row.abs_pct_of_total)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ViewAllModal>
  );
}

/* Reconciliation View All */
function ReconciliationViewAll({ rows, currency }) {
  if (!rows?.length)
    return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Period</th>
          <th style={MTH}>Currency</th>
          <th style={MTH}>Sources of Funds</th>
          <th style={MTH}>Application of Funds</th>
          <th style={MTH}>Net Variance</th>
          <th style={MTH}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            style={{ background: row.balance_status === 'UNBALANCED' ? '#fff7ed' : 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = row.balance_status === 'UNBALANCED' ? '#fef3c7' : '#f8faff'}
            onMouseLeave={e => e.currentTarget.style.background = row.balance_status === 'UNBALANCED' ? '#fff7ed' : 'transparent'}
          >
            <td style={{ ...MTD_L, fontWeight: 600 }}>{row.period_name || row.period}</td>
            <td style={MTD}>{row.currency || currency}</td>
            <td style={{ ...MTD, color: C.rose }}>{fmtNum(Math.abs(row.sources_total ?? 0), row.currency || currency)}</td>
            <td style={{ ...MTD, color: C.green }}>{fmtNum(Math.abs(row.applications_total ?? 0), row.currency || currency)}</td>
            <td style={{ ...MTD, fontWeight: 700, color: Math.abs(row.net_variance ?? 0) < 1000 ? C.green : C.rose }}>
              {fmtNum(Math.abs(row.net_variance ?? 0), row.currency || currency)}
            </td>
            <td style={MTD}>
              <span style={{
                padding: '2px 10px', borderRadius: 12,
                fontSize: '0.66rem', fontWeight: 700,
                background: row.balance_status === 'BALANCED' ? '#f0fdf4' : '#fff7ed',
                color: row.balance_status === 'BALANCED' ? '#15803d' : '#c2410c',
                border: `1px solid ${row.balance_status === 'BALANCED' ? '#bbf7d0' : '#fed7aa'}`,
              }}>
                {row.balance_status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function BalanceSheet() {

  /* ── Filter state ──────────────────────────────────────────────── */
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  /* ── Dropdown options ──────────────────────────────────────────── */
  const [filterOptions, setFilterOptions] = useState({
    periods:        [],
    currencies:     ['AED', 'USD', 'SAR', 'QAR', 'OMR'],
    legalEntities:  [{ id: '', name: 'All' }],
    ledgers:        ['All'],
  });

  /* ── Data state ────────────────────────────────────────────────── */
  const [summaryData,        setSummaryData]        = useState(null);
  const [subdivisionData,    setSubdivisionData]    = useState(null);
  const [trendData,          setTrendData]          = useState(null);
  const [reconciliationRows, setReconciliationRows] = useState([]);

  /* ── Drilldown ─────────────────────────────────────────────────── */
  const [drilldownOpen,    setDrilldownOpen]    = useState(false);
  const [drilldownData,    setDrilldownData]    = useState(null);
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [drilldownError,   setDrilldownError]   = useState(null);

  /* ── Section collapse state (inline statement) ─────────────────── */
  const [sectionExpanded, setSectionExpanded] = useState({});

  /* ── Loading & Error ───────────────────────────────────────────── */
  const [loading, setLoading] = useState({
    filters: true, summary: false, subdivision: false,
    trend: false, reconciliation: false,
  });
  const [errors, setErrors] = useState({});

  /* ── Toast ─────────────────────────────────────────────────────── */
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── ViewAll modal ─────────────────────────────────────────────── */
  // 'statement' | 'subdivision' | 'trend' | 'reconciliation' | null
  const [openModal, setOpenModal] = useState(null);
  const closeModal = () => setOpenModal(null);

  /* ── Export ────────────────────────────────────────────────────── */
  const [exporting, setExporting] = useState(null);
  const handleExport = (format, section = 'summary') => {
    if (exporting) return;
    setExporting(`${section}-${format}`);
    exportBS(format, section, appliedFilters)
      .then(() => showToast(`${format.toUpperCase()} export downloaded successfully.`, 'success'))
      .catch(err => showToast(`Export failed: ${err?.message || 'Unknown error'}. Please try again.`, 'error'))
      .finally(() => setExporting(null));
  };

  /* ── Load filter options ───────────────────────────────────────── */
  const loadFilterOptions = useCallback(async () => {
    setLoading(prev => ({ ...prev, filters: true }));
    try {
      const data = await fetchBSFilters();
      const periods = data?.periods || [];
      setFilterOptions(prev => ({
        ...prev,
        periods,
        currencies:    ['AED', 'USD', 'SAR', 'QAR', 'OMR'],
        legalEntities: [{ id: '', name: 'All' }, ...(data?.legal_entities || [])],
        ledgers:       ['All', ...(data?.ledgers || [])],
      }));
      // Auto-select first period
      if (periods.length) {
        const first  = periods[0];
        const second = periods[1] || '';
        setFilters(f        => ({ ...f, period: f.period || first, comparePeriod: f.comparePeriod || second }));
        setAppliedFilters(f => ({ ...f, period: f.period || first, comparePeriod: f.comparePeriod || second }));
      }
    } catch (err) {
      console.error('[BalanceSheet] loadFilterOptions error:', err);
      setErrors(prev => ({ ...prev, filters: err?.message || 'Failed to load filters' }));
    } finally {
      setLoading(prev => ({ ...prev, filters: false }));
    }
  }, []);

  /* ── Initial filter load ───────────────────────────────────────── */
  useEffect(() => {
    loadFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Fetch all data ────────────────────────────────────────────── */
  const fetchAll = useCallback((f) => {
    if (!f.period || !f.currency) return;

    setLoading({ filters: false, summary: true, subdivision: true, trend: true, reconciliation: true });
    setErrors({});

    const guard = (key, promise) =>
      promise
        .catch(err => { setErrors(prev => ({ ...prev, [key]: err?.message || 'Failed to load data' })); return null; })
        .finally(() => setLoading(prev => ({ ...prev, [key]: false })));

    guard('summary', fetchBSSummary(f)).then(d => { if (d) setSummaryData(d); });
    guard('subdivision', fetchBSSubDivision(f)).then(d => { if (d) setSubdivisionData(d); });
    guard('trend', fetchBSTrend(f)).then(d => { if (d) setTrendData(d); });
    guard('reconciliation', fetchBSReconciliation({ currency: f.currency })).then(d => {
      if (d) setReconciliationRows(Array.isArray(d) ? d : []);
    });
  }, []);

  /* ── Trigger fetch when appliedFilters.period is ready ─────────── */
  useEffect(() => {
    if (appliedFilters.period) fetchAll(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters.period, appliedFilters.currency]);

  /* ── Drilldown handler ─────────────────────────────────────────── */
  const handleDrilldown = async (account) => {
    setDrilldownOpen(true);
    setDrilldownLoading(true);
    setDrilldownError(null);
    try {
      const data = await fetchBSDrilldown({
        period:      appliedFilters.period,
        currency:    appliedFilters.currency,
        accountCode: account.account_code,
        ledger:      appliedFilters.ledger,
      });
      setDrilldownData(data);
    } catch (err) {
      setDrilldownError(err?.message || 'Failed to load drilldown data');
    } finally {
      setDrilldownLoading(false);
    }
  };

  /* ── Apply / Reset ─────────────────────────────────────────────── */
  const handleApply = () => { setAppliedFilters({ ...filters }); fetchAll({ ...filters }); };
  const handleReset = () => {
    const reset = { ...DEFAULT_FILTERS, period: filterOptions.periods[0] || '', comparePeriod: filterOptions.periods[1] || '', currency: 'AED' };
    setFilters(reset); setAppliedFilters(reset); fetchAll(reset);
  };

  /* ── Derived values ────────────────────────────────────────────── */
  const currency    = appliedFilters.currency || 'AED';
  const compareLbl  = appliedFilters.comparePeriod ? `vs ${appliedFilters.comparePeriod}` : '';
  const periodLabel = appliedFilters.period || '—';

  // Derive KPI values from summary sections
  const kpiTotals = (() => {
    if (!summaryData?.sections) return {};
    let sources = 0, applications = 0;
    summaryData.sections.forEach(sec => {
      if (sec.section === 'SOURCES OF FUNDS')    sources       = sec.section_total ?? 0;
      if (sec.section === 'APPLICATION OF FUNDS') applications  = sec.section_total ?? 0;
    });
    const equity = Math.abs(
      summaryData.sections
        .find(s => s.section === 'SOURCES OF FUNDS')
        ?.sub_sections?.find(ss => ss.sub_section === 'A. EQUITY')
        ?.sub_total ?? 0
    );
    return {
      totalAssets:       Math.abs(applications),
      totalLiabilities:  Math.abs(sources) - equity,
      totalEquity:       equity,
      balanceStatus:     summaryData.balance_status,
      balanceVariance:   summaryData.balance_variance,
    };
  })();

  /* ── Trend chart data ──────────────────────────────────────────── */
  const trendSeries = (trendData?.series || []).map(p => ({
    period:   p.period_name || p.period,
    balance:  Math.abs(p.balance_amount ?? 0),
    mom_pct:  p.mom_pct ?? 0,
  }));

  /* ── Sub-division table rows ───────────────────────────────────── */
  const subdivRows = subdivisionData?.data || [];

  /* ── Kebab menu items ──────────────────────────────────────────── */
  const makeExportItems = (section) => [
    { icon: '📊', label: 'Export Excel', action: () => handleExport('excel', section) },
    { icon: '📄', label: 'Export PDF',   action: () => handleExport('pdf',   section) },
  ];
  const summaryMenuItems   = [{ icon: '🔎', label: 'View All', action: () => setOpenModal('statement') },   ...makeExportItems('summary')];
  const subdivMenuItems    = [{ icon: '🔎', label: 'View All', action: () => setOpenModal('subdivision') }, ...makeExportItems('subdivision')];
  const trendMenuItems     = [{ icon: '🔎', label: 'View All', action: () => setOpenModal('trend') }];
  const reconMenuItems     = [{ icon: '🔎', label: 'View All', action: () => setOpenModal('reconciliation') }];

  /* ── KPI Card definitions ──────────────────────────────────────── */
  const kpiCards = [
    {
      id: 'total-assets',
      label: 'Total Assets',
      value: loading.summary ? '—' : fmtKPI(kpiTotals.totalAssets, currency),
      subValue: periodLabel,
      changePct: null,
      compareLabel: compareLbl,
      color: '#2563eb', iconBg: '#eff6ff',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
    },
    {
      id: 'total-liabilities',
      label: 'Total Liabilities',
      value: loading.summary ? '—' : fmtKPI(kpiTotals.totalLiabilities, currency),
      subValue: periodLabel,
      changePct: null,
      compareLabel: compareLbl,
      color: '#f59e0b', iconBg: '#fffbeb',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" fillOpacity="0.5"/><path d="M6 4h12v4H6z"/><circle cx="12" cy="14" r="2" fill="#fff"/></svg>,
    },
    {
      id: 'total-equity',
      label: 'Total Equity',
      value: loading.summary ? '—' : fmtKPI(kpiTotals.totalEquity, currency),
      subValue: periodLabel,
      changePct: null,
      compareLabel: compareLbl,
      color: '#9333ea', iconBg: '#faf5ff',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/></svg>,
    },
    {
      id: 'balance-status',
      label: 'Balance Status',
      value: loading.summary ? '—' : (kpiTotals.balanceStatus || '—'),
      subValue: kpiTotals.balanceStatus === 'UNBALANCED'
        ? `Var: ${fmtKPI(kpiTotals.balanceVariance, currency)}`
        : 'Books are balanced',
      changePct: null,
      compareLabel: null,
      color: kpiTotals.balanceStatus === 'BALANCED' ? '#16a34a' : '#ea580c',
      iconBg: kpiTotals.balanceStatus === 'BALANCED' ? '#f0fdf4' : '#fff7ed',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="m5 9 7-7 7 7"/><path d="M5 15a2 2 0 0 0 4 0c0-1.5-1-2-2-3-1 1-2 1.5-2 3Z"/><path d="M15 21a2 2 0 0 0 4 0c0-1.5-1-2-2-3-1 1-2 1.5-2 3Z"/></svg>,
    },
    {
      id: 'total-periods',
      label: 'Trend Periods',
      value: loading.trend ? '—' : String(trendData?.summary?.total_periods ?? '—'),
      subValue: trendData?.summary
        ? `${trendData.summary.from_period || ''} — ${trendData.summary.to_period || ''}`
        : null,
      changePct: trendData?.summary?.period_pct ?? null,
      compareLabel: trendData?.summary ? 'period change' : null,
      color: '#0d9488', iconBg: '#f0fdfa',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>,
    },
    {
      id: 'subdivisions',
      label: 'Sub-Divisions',
      value: loading.subdivision ? '—' : String(subdivisionData?.pagination?.total_subdivisions ?? subdivRows.length),
      subValue: 'Contributing entities',
      changePct: null,
      compareLabel: null,
      color: '#db2777', iconBg: '#fdf2f8',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="6" height="14"/><rect x="9" y="3" width="6" height="18"/><rect x="16" y="10" width="6" height="11"/></svg>,
    },
  ];

  /* ══════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="animate-in" style={{ padding: '20px 0 40px', background: C.bg, minHeight: '100%' }}>

      <style>{`
        @keyframes bs-shimmer  { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        @keyframes bs-fadeIn   { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes bs-menuPop  { from { opacity: 0; transform: scale(0.94) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes bs-modalPop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {toast && <ExportToast message={toast.msg} type={toast.type} />}

      {/* ══ DRILLDOWN MODAL ══ */}
      {drilldownOpen && (
        drilldownLoading ? (
          <ViewAllModal isOpen onClose={() => setDrilldownOpen(false)} title="Loading drilldown…" subtitle="">
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...Array(6)].map((_, i) => <Skeleton key={i} h={28} w={`${55 + (i % 3) * 15}%`} />)}
            </div>
          </ViewAllModal>
        ) : drilldownError ? (
          <ViewAllModal isOpen onClose={() => setDrilldownOpen(false)} title="Drilldown Error" subtitle="">
            <div style={{ padding: 24 }}><ErrorBanner message={drilldownError} onRetry={() => setDrilldownOpen(false)} /></div>
          </ViewAllModal>
        ) : (
          <DrilldownModal
            isOpen
            onClose={() => setDrilldownOpen(false)}
            data={drilldownData}
            currency={currency}
          />
        )
      )}

      {/* ══ VIEW ALL MODALS ══ */}
      <ViewAllModal isOpen={openModal === 'statement'} onClose={closeModal}
        title="Balance Sheet Statement"
        subtitle={`Period: ${periodLabel} | Currency: ${currency}`}
      >
        <StatementViewAll summaryData={summaryData} currency={currency} />
      </ViewAllModal>

      <ViewAllModal isOpen={openModal === 'subdivision'} onClose={closeModal}
        title="Balance Sheet by Sub-Division"
        subtitle={`Period: ${periodLabel} | ${subdivisionData?.pagination?.total_subdivisions ?? '—'} sub-divisions`}
      >
        <SubDivisionViewAll data={subdivisionData} currency={currency} />
      </ViewAllModal>

      <ViewAllModal isOpen={openModal === 'trend'} onClose={closeModal}
        title="Balance Sheet Trend — All Periods"
        subtitle={`Currency: ${currency} | Granularity: ${trendData?.granularity || 'monthly'}`}
      >
        <TrendViewAll trendData={trendData} currency={currency} />
      </ViewAllModal>

      <ViewAllModal isOpen={openModal === 'reconciliation'} onClose={closeModal}
        title="Balance Sheet Reconciliation"
        subtitle={`BALANCED when |Net Variance| < 1,000`}
      >
        <ReconciliationViewAll rows={reconciliationRows} currency={currency} />
      </ViewAllModal>

      {/* ══ PAGE HEADER ══ */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, margin: 0 }}>Balance Sheet</h1>
          <p style={{ fontSize: '0.76rem', color: C.slate, margin: '3px 0 0' }}>
            View the financial position of the company across different dimensions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Currency selector */}
          <select
            id="bs-currency"
            value={filters.currency}
            onChange={e => setFilters(prev => ({ ...prev, currency: e.target.value }))}
            style={{ ...selStyle, width: 80, fontSize: '0.74rem', padding: '7px 22px 7px 8px' }}
            title="Select currency"
          >
            {filterOptions.currencies.map(c => <option key={c}>{c}</option>)}
          </select>
          {/* Export buttons */}
          <button
            id="btn-bs-export-excel"
            onClick={() => handleExport('excel', 'summary')}
            disabled={!!exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px',
              background: exporting?.includes('excel') ? '#d1fae5' : '#f0fdf4',
              color: '#15803d', border: '1px solid #bbf7d0',
              borderRadius: 8, fontSize: '0.76rem', fontWeight: 700,
              cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting?.includes('excel') ? '⏳' : '📊'} Excel
          </button>
          <button
            id="btn-bs-export-pdf"
            onClick={() => handleExport('pdf', 'summary')}
            disabled={!!exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px',
              background: exporting?.includes('pdf') ? '#fee2e2' : '#fff1f2',
              color: '#be123c', border: '1px solid #fecdd3',
              borderRadius: 8, fontSize: '0.76rem', fontWeight: 700,
              cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting?.includes('pdf') ? '⏳' : '📄'} PDF
          </button>
        </div>
      </div>

      {/* ══ FILTER BAR ══ */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap', overflowX: 'auto' }}>
        <FilterField label="Period">
          <select
            id="filter-bs-period"
            style={selStyle}
            value={filters.period}
            onChange={e => setFilters(prev => ({ ...prev, period: e.target.value }))}
            disabled={loading.filters}
          >
            {filterOptions.periods.length === 0 && <option value="">Loading…</option>}
            {filterOptions.periods.map(p => <option key={p}>{p}</option>)}
          </select>
        </FilterField>

        <FilterField label="Compare With">
          <select
            id="filter-bs-compare"
            style={selStyle}
            value={filters.comparePeriod}
            onChange={e => setFilters(prev => ({ ...prev, comparePeriod: e.target.value }))}
            disabled={loading.filters}
          >
            <option value="">None</option>
            {filterOptions.periods.map(p => <option key={p}>{p}</option>)}
          </select>
        </FilterField>

        <FilterField label="Currency">
          <select
            id="filter-bs-currency"
            style={selStyle}
            value={filters.currency}
            onChange={e => setFilters(prev => ({ ...prev, currency: e.target.value }))}
          >
            {filterOptions.currencies.map(c => <option key={c}>{c}</option>)}
          </select>
        </FilterField>

        <FilterField label="Legal Entity">
          <select
            id="filter-bs-entity"
            style={selStyle}
            value={filters.legalEntityId}
            onChange={e => setFilters(prev => ({ ...prev, legalEntityId: e.target.value }))}
            disabled={loading.filters}
          >
            {filterOptions.legalEntities.map(le => (
              <option key={le.id ?? ''} value={le.id ?? ''}>{le.name || 'All'}</option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Ledger">
          <select
            id="filter-bs-ledger"
            style={selStyle}
            value={filters.ledger}
            onChange={e => setFilters(prev => ({ ...prev, ledger: e.target.value }))}
            disabled={loading.filters}
          >
            {filterOptions.ledgers.map(l => <option key={l}>{l}</option>)}
          </select>
        </FilterField>

        <button
          id="btn-bs-apply"
          onClick={handleApply}
          style={{ padding: '7px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end', whiteSpace: 'nowrap' }}
        >
          Apply
        </button>
        <button
          id="btn-bs-reset"
          onClick={handleReset}
          style={{ background: 'none', border: 'none', color: C.slate, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', alignSelf: 'flex-end', padding: '7px 4px', whiteSpace: 'nowrap' }}
        >
          Reset
        </button>
      </div>

      {errors.filters && <ErrorBanner message={errors.filters} onRetry={loadFilterOptions} />}

      {/* ══ KPI CARDS ══ */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>Key Performance Indicators</span>
          {/* Balance status badge */}
          {!loading.summary && summaryData && (
            <BalanceBadge
              status={summaryData.balance_status}
              variance={summaryData.balance_variance}
              currency={currency}
            />
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {kpiCards.map(kpi => (
            <KPICard
              key={kpi.id}
              {...kpi}
              loading={kpi.id.startsWith('total') || kpi.id === 'balance-status' ? loading.summary : kpi.id === 'total-periods' ? loading.trend : loading.subdivision}
              error={kpi.id.startsWith('total') || kpi.id === 'balance-status' ? errors.summary : kpi.id === 'total-periods' ? errors.trend : errors.subdivision}
            />
          ))}
        </div>
      </div>

      {/* ══ CHARTS ROW: Trend | Assets Composition | Liabilities Composition ══ */}
      {(() => {
        /* ── Shared DonutCard renderer ── */
        const DonutCard = ({ title, subtitle, segments, isLoading }) => {
          const total = segments.reduce((s, d) => s + d.value, 0);
          // Key on segment count so React fully remounts (and re-animates) the
          // moment real API data replaces the empty/loading state.
          const chartKey = `donut-${segments.length}-${Math.round(total)}`;
          return (
            <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy, marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: '0.65rem', color: C.muted, marginBottom: 10 }}>{subtitle}</div>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...Array(4)].map((_, i) => <Skeleton key={i} h={22} />)}
                </div>
              ) : total === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '0.78rem' }}>
                  No data available
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative', height: 170 }}>
                    {/* key forces a clean remount + fresh draw-in animation once data is ready */}
                    <ResponsiveContainer key={chartKey} width="100%" height={170}>
                      <PieChart>
                        <Pie
                          data={segments}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={72}
                          dataKey="value"
                          paddingAngle={3}
                          startAngle={90} endAngle={-270}
                          isAnimationActive={true}
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {segments.map(d => (
                            <Cell key={d.name} fill={d.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v, n) => [fmtKPI(v, currency), n]}
                          contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                      <div style={{ fontSize: '0.58rem', color: C.muted, fontWeight: 600 }}>Total</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 900, color: C.navy }}>{fmtKPI(total, currency)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {segments.map(d => {
                      const pct = total ? ((d.value / total) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 9, height: 9, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.67rem', color: C.slate, fontWeight: 600 }}>{d.name}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: C.navy }}>{pct}%</span>
                            <span style={{ fontSize: '0.6rem', color: C.muted, marginLeft: 4 }}>({fmtKPI(d.value, currency)})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        };


        const appSection = summaryData?.sections?.find(s => s.section === 'APPLICATION OF FUNDS');
        const srcSection = summaryData?.sections?.find(s => s.section === 'SOURCES OF FUNDS');
        const assetSegments = (appSection?.sub_sections || []).map((sub, i) => ({
          name: sub.sub_section.replace(/^[A-Z]\.\s*/, ''),
          value: Math.abs(sub.sub_total || 0),
          color: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'][i % 4],
        }));
        const liabSegments = (srcSection?.sub_sections || []).map((sub, i) => ({
          name: sub.sub_section.replace(/^[A-Z]\.\s*/, ''),
          value: Math.abs(sub.sub_total || 0),
          color: ['#9333ea', '#f59e0b', '#ef4444', '#0d9488'][i % 4],
        }));

        return (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>

            {/* ── Balance Sheet Trend ── */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>Balance Sheet Trend</div>
                  <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 1 }}>
                    {trendData?.from_period || '—'} → {trendData?.to_period || '—'} | {trendData?.section || 'APPLICATION OF FUNDS'}
                  </div>
                </div>
                <KebabMenu id="menu-bs-trend" items={trendMenuItems} />
              </div>
              {errors.trend ? (
                <ErrorBanner message={errors.trend} onRetry={() => fetchAll(appliedFilters)} />
              ) : loading.trend ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
                  {[...Array(5)].map((_, i) => <Skeleton key={i} h={20} />)}
                </div>
              ) : trendSeries.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '0.78rem' }}>
                  No trend data available
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 8, paddingLeft: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 600, color: C.slate }}>
                      <div style={{ width: 20, height: 2.5, borderRadius: 1, background: C.primary }} />
                      {trendData?.account_name || trendData?.section || 'Balance'}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendSeries} margin={{ top: 5, right: 16, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={fmtAxisNum} width={48} />
                      <Tooltip content={<ChartTooltip currency={currency} />} />
                      <Line type="monotone" dataKey="balance" name={trendData?.account_name || trendData?.section || 'Balance'}
                        stroke={C.primary} strokeWidth={2.5} dot={{ r: 3, fill: C.primary }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  {trendData?.summary && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.64rem', color: C.muted, fontWeight: 600 }}>OPENING</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: C.navy }}>{fmtKPI(trendData.summary.opening_balance, currency)}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.64rem', color: C.muted, fontWeight: 600 }}>CLOSING</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: C.primary }}>{fmtKPI(trendData.summary.closing_balance, currency)}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.64rem', color: C.muted, fontWeight: 600 }}>CHANGE</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: (trendData.summary.period_change ?? 0) >= 0 ? C.green : C.rose }}>
                          {trendData.summary.period_pct != null ? `${trendData.summary.period_pct >= 0 ? '+' : ''}${Number(trendData.summary.period_pct).toFixed(2)}%` : '—'}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Assets Composition ── */}
            <DonutCard
              title="Assets Composition"
              subtitle={`Application of Funds — ${currency}`}
              segments={assetSegments}
              isLoading={loading.summary}
            />

            {/* ── Liabilities Composition ── */}
            <DonutCard
              title="Liabilities Composition"
              subtitle={`Sources of Funds — ${currency}`}
              segments={liabSegments}
              isLoading={loading.summary}
            />
          </div>
        );
      })()}

      {/* ══ RECONCILIATION ROW ══ */}
      <div style={{ marginBottom: 18 }}>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>Reconciliation Status</div>
              <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 1 }}>Period-wise BALANCED / VARIANCE status</div>
            </div>
            <KebabMenu id="menu-bs-recon" items={reconMenuItems} />
          </div>
          {errors.reconciliation ? (
            <ErrorBanner message={errors.reconciliation} onRetry={() => fetchAll(appliedFilters)} />
          ) : loading.reconciliation ? (
            <div style={{ display: 'flex', gap: 8 }}>
              {[...Array(6)].map((_, i) => <div key={i} style={{ flex: 1 }}><Skeleton h={52} /></div>)}
            </div>
          ) : reconciliationRows.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '0.78rem', padding: '20px 0' }}>
              No reconciliation data available
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              {reconciliationRows.map((row, i) => {
                const isBalanced = row.balance_status === 'BALANCED';
                return (
                  <div key={i} style={{
                    flex: 1,
                    padding: '9px 14px', borderRadius: 9,
                    background: isBalanced ? '#f0fdf4' : '#fff7ed',
                    border: `1px solid ${isBalanced ? '#d1fae5' : '#fed7aa'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    minWidth: 0,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.navy, whiteSpace: 'nowrap' }}>{row.period_name || row.period}</div>
                      <div style={{ fontSize: '0.62rem', color: C.slate }}>{row.currency}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.63rem', fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                        background: isBalanced ? '#dcfce7' : '#ffedd5', color: isBalanced ? '#15803d' : '#c2410c',
                        whiteSpace: 'nowrap' }}>
                        {row.balance_status}
                      </span>
                      {!isBalanced && row.net_variance != null && (
                        <div style={{ fontSize: '0.6rem', color: '#c2410c', marginTop: 2, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {fmtKPI(Math.abs(row.net_variance), row.currency)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ BALANCE SHEET STATEMENT TABLE ══ */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(90deg,#f8fafc,#fff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: C.navy }}>Balance Sheet Statement</span>
            <span style={{ fontSize: '0.7rem', color: C.slate, marginLeft: 12 }}>
              {periodLabel} &nbsp;|&nbsp; All values in {currency} &nbsp;|&nbsp; Click any account row to drill down
            </span>
          </div>
          <KebabMenu id="menu-bs-statement" items={summaryMenuItems} />
        </div>

        {errors.summary ? (
          <div style={{ padding: 16 }}><ErrorBanner message={errors.summary} onRetry={() => fetchAll(appliedFilters)} /></div>
        ) : loading.summary ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(10)].map((_, i) => <Skeleton key={i} h={28} w={`${55 + (i % 4) * 10}%`} />)}
          </div>
        ) : !summaryData?.sections?.length ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>
            No data for selected period and currency.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
              <thead>
                <tr>
                  <th style={{ ...TH_L, width: '34%' }}>
                    Particulars<br />
                    <span style={{ fontWeight: 400, opacity: 0.75 }}>(in {currency})</span>
                  </th>
                  <th style={TH}>Balance Amount</th>
                  <th style={{ ...TH, width: 56 }}>DR/CR</th>
                  <th style={TH}>
                    Compare Amount<br />
                    <span style={{ fontWeight: 400, opacity: 0.75 }}>{appliedFilters.comparePeriod || '—'}</span>
                  </th>
                  <th style={TH}>Variance</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.sections.map((sec) => {
                  const secKey = sec.section;
                  const isExpanded = sectionExpanded[secKey] !== false; // default open
                  return (
                    <>
                      <SectionHeader
                        key={`sec-${secKey}`}
                        label={`${secKey} — ${fmtNum(Math.abs(sec.section_total), currency)}`}
                        expanded={isExpanded}
                        onToggle={() => setSectionExpanded(prev => ({ ...prev, [secKey]: !isExpanded }))}
                      />
                      {isExpanded && sec.sub_sections.map((sub) => (
                        <>
                          <SubSectionHeader
                            key={`sub-${sub.sub_section}`}
                            label={`${sub.sub_section} — ${fmtNum(Math.abs(sub.sub_total), currency)}`}
                          />
                          {sub.accounts.map((acct) => (
                            <BSRow
                              key={acct.account_code}
                              account={acct}
                              currency={currency}
                              onDrilldown={handleDrilldown}
                            />
                          ))}
                          {/* Sub-total row */}
                          <tr style={{ background: '#f1f5f9' }}>
                            <td style={{ ...TD_L, paddingLeft: 22, fontWeight: 700, fontSize: '0.72rem' }}>
                              {sub.sub_section} Total
                            </td>
                            <td style={{ ...TD, fontWeight: 800, color: C.navy }}>
                              {fmtNum(Math.abs(sub.sub_total), currency)}
                            </td>
                            <td style={TD} />
                            <td style={{ ...TD, color: C.slate }}>
                              {sub.compare_sub_total != null ? fmtNum(Math.abs(sub.compare_sub_total), currency) : '—'}
                            </td>
                            <td style={TD}>—</td>
                          </tr>
                        </>
                      ))}
                      {/* Section total row */}
                      <tr style={{ background: 'linear-gradient(90deg,#eef2ff,#f8fafc)', borderTop: `2px solid ${C.border}` }}>
                        <td style={{ ...TD_L, paddingLeft: 12, fontWeight: 900, fontSize: '0.75rem', color: C.navy }}>
                          {secKey} — Total
                        </td>
                        <td style={{ ...TD, fontWeight: 900, color: C.primary, fontSize: '0.76rem' }}>
                          {fmtNum(Math.abs(sec.section_total), currency)}
                        </td>
                        <td style={TD} />
                        <td style={{ ...TD, color: C.slate }}>
                          {sec.compare_total != null ? fmtNum(Math.abs(sec.compare_total), currency) : '—'}
                        </td>
                        <td style={TD}>{sec.variance != null ? <VarBadge v={sec.variance} /> : '—'}</td>
                      </tr>
                    </>
                  );
                })}
                {/* Grand Total */}
                <tr style={{ background: 'linear-gradient(90deg,#f0f4ff,#eef2ff)', borderTop: `2px solid #c7d2fe` }}>
                  <td style={{ ...TD_L, paddingLeft: 12, fontWeight: 900, fontSize: '0.78rem', color: C.navy }}>
                    GRAND TOTAL (Net)
                  </td>
                  <td style={{ ...TD, fontWeight: 900, color: Math.abs(summaryData.grand_total ?? 0) < 1000 ? C.green : C.rose, fontSize: '0.78rem' }}>
                    {fmtNum(Math.abs(summaryData.grand_total ?? 0), currency)}
                  </td>
                  <td style={TD} />
                  <td style={TD}>—</td>
                  <td style={{ ...TD, fontWeight: 800 }}>
                    {summaryData.balance_status && (
                      <span style={{
                        padding: '2px 8px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 700,
                        background: summaryData.balance_status === 'BALANCED' ? '#dcfce7' : '#ffedd5',
                        color: summaryData.balance_status === 'BALANCED' ? '#15803d' : '#c2410c',
                      }}>
                        {summaryData.balance_status}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══ SUB-DIVISION TABLE ══ */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, background: 'linear-gradient(90deg,#f8fafc,#fff)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: C.navy }}>Balance Sheet by Sub-Division</span>
            <span style={{ fontSize: '0.7rem', color: C.slate, marginLeft: 12 }}>
              {subdivisionData?.pagination?.total_subdivisions ?? '—'} sub-divisions &nbsp;|&nbsp; Page {subdivisionData?.pagination?.page ?? 1} of {subdivisionData?.pagination?.total_pages ?? 1}
            </span>
          </div>
          <KebabMenu id="menu-bs-subdiv" items={subdivMenuItems} />
        </div>

        {errors.subdivision ? (
          <div style={{ padding: 16 }}><ErrorBanner message={errors.subdivision} onRetry={() => fetchAll(appliedFilters)} /></div>
        ) : loading.subdivision ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(6)].map((_, i) => <Skeleton key={i} h={36} w={`${65 + (i % 3) * 10}%`} />)}
          </div>
        ) : subdivRows.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>
            No sub-division data available for the selected period.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
              <thead>
                <tr>
                  <th style={TH_L}>Sub-Division</th>
                  <th style={{ ...TH, width: 72 }}>Code</th>
                  <th style={TH}>Sources of Funds</th>
                  <th style={TH}>Application of Funds</th>
                  <th style={TH}>Net Balance</th>
                </tr>
              </thead>
              <tbody>
                {subdivRows.map((row, i) => {
                  const sources = row.section_totals?.['SOURCES OF FUNDS'] ?? 0;
                  const applic  = row.section_totals?.['APPLICATION OF FUNDS'] ?? 0;
                  const net     = row.grand_total ?? 0;
                  return (
                    <tr
                      key={i}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...TD_L, fontWeight: 600 }}>{row.sub_division_name}</td>
                      <td style={{ ...TD, fontFamily: 'monospace', fontSize: '0.67rem', color: C.slate }}>{row.sub_division_code}</td>
                      <td style={{ ...TD, color: C.rose }}>{fmtNum(Math.abs(sources), currency)}</td>
                      <td style={{ ...TD, color: C.green }}>{fmtNum(Math.abs(applic), currency)}</td>
                      <td style={{ ...TD, fontWeight: 700, color: Math.abs(net) < 1000 ? C.green : C.navy }}>
                        {fmtNum(Math.abs(net), currency)}
                        {Math.abs(net) >= 1000 && (
                          <span style={{ marginLeft: 4, fontSize: '0.6rem', color: C.rose, fontWeight: 600 }}>Δ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══ FOOTER ══ */}
      <div style={{ fontSize: '0.64rem', color: C.muted, display: 'flex', justifyContent: 'space-between', paddingTop: 8, flexWrap: 'wrap', gap: 4 }}>
        <span>
          All values in {currency} &nbsp;|&nbsp; Period: {periodLabel}
          {appliedFilters.comparePeriod ? ` | Compared with: ${appliedFilters.comparePeriod}` : ''}
        </span>
        <span>☁️ Source: Oracle Fusion Cloud</span>
      </div>

    </div>
  );
}