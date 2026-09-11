import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from 'react';
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
  fetchBS6MonthTrend,
} from '../services/bsApi';
import {
  exportTrendToExcel,
  exportTrendToPDF,
  exportCompositionToExcel,
  exportCompositionToPDF,
} from '../utils/bsExport';
import { C } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
// MultiSelectDropdown replaced by inline MultiSelect (matches Sales Revenue style)

/* ══════════════════════════════════════════════════════════════════════
   CONSTANTS & DEFAULTS
══════════════════════════════════════════════════════════════════════ */

const DEFAULT_FILTERS = {
  period:        '',
  comparePeriod: '',
  currency:      'AED',
  legalGroup:    [],
  legalEntity:   [],
  parentDivision:[],
  subdivision:   [],
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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formatPeriod = (val) => {
  if (!val) return '—';
  if (typeof val === 'object') return val.period_name || val.period || '—';
  const m = String(val).match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const monthIdx = parseInt(m[2], 10) - 1;
    const yearShort = m[1].slice(-2);
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${MONTH_NAMES[monthIdx]}-${yearShort}`;
    }
  }
  return String(val);
};

const calcMovement = (cur, cmp) => {
  if (cur === null || cur === undefined || cmp === null || cmp === undefined) return null;
  const c = Number(cur);
  const p = Number(cmp);
  if (isNaN(c) || isNaN(p) || p === 0) return null;
  return ((c - p) / Math.abs(p)) * 100;
};

const extractBSMetrics = (summary) => {
  if (!summary?.sections) {
    return {
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      nonCurrentLiab: 0,
      currentLiab: 0,
      longTermBorrowings: 0,
      shortTermBorrowings: 0,
      totalDebt: 0,
      debtToEquity: null,
      liabilityToEquity: null,
      balanceStatus: summary?.status || null,
      balanceVariance: summary?.grand_total ?? null,
    };
  }

  let totalAssets = 0;
  let nonCurrentLiab = 0;
  let currentLiab = 0;
  let totalEquity = 0;
  let longTermBorrowings = 0;
  let shortTermBorrowings = 0;

  summary.sections.forEach(sec => {
    const secName = (sec.name || '').toUpperCase();
    if (secName.includes('APPLICATION OF FUNDS')) {
      totalAssets = Math.abs(sec.total ?? 0);
    }

    (sec.sub_sections || []).forEach(sub => {
      const subName = (sub.name || sub.sub_section || '').toUpperCase();
      const subTotal = Math.abs(sub.total ?? sub.sub_total ?? 0);

      if (subName.includes('EQUITY')) {
        totalEquity = subTotal;
      } else if (subName.includes('NON CURRENT LIABILITIES') || subName.includes('NON-CURRENT LIABILITIES')) {
        nonCurrentLiab = subTotal;
      } else if (subName.includes('CURRENT LIABILITIES')) {
        currentLiab = subTotal;
      }

      // Check accounts for bank borrowings:
      // Code 920001 = Long Term Loans / Long-term Bank Borrowings
      // Code 920004 = Short Term Loans / Short-term Bank Borrowings
      (sub.accounts || []).forEach(acct => {
        const code = String(acct.account_code || '');
        const name = (acct.account_name || '').toUpperCase();
        const amt = Math.abs(acct.balance_amount ?? 0);

        if (code === '920001' || (name.includes('LONG TERM') && (name.includes('LOAN') || name.includes('BORROW')))) {
          longTermBorrowings += amt;
        } else if (code === '920004' || (name.includes('SHORT TERM') && (name.includes('LOAN') || name.includes('BORROW')))) {
          shortTermBorrowings += amt;
        }
      });
    });
  });

  // Total Liabilities = Non-current Liabilities + Current Liabilities
  let totalLiabilities = nonCurrentLiab + currentLiab;

  // Fallbacks if sub-sections were not split
  if (totalLiabilities === 0 && totalEquity > 0) {
    const sourcesSec = summary.sections.find(s => (s.name || '').toUpperCase().includes('SOURCES OF FUNDS'));
    if (sourcesSec?.total) {
      totalLiabilities = Math.max(0, Math.abs(sourcesSec.total) - totalEquity);
    }
  }

  if (totalAssets === 0 && (totalLiabilities > 0 || totalEquity > 0)) {
    totalAssets = totalLiabilities + totalEquity;
  }

  const totalDebt = longTermBorrowings + shortTermBorrowings;

  // Debt-to-Equity Ratio = (Long-term Bank Borrowings + Short-term Bank Borrowings) / Total Equity
  const debtToEquity = totalEquity > 0 ? (totalDebt / totalEquity) : null;

  // Liability-to-Equity Ratio = Total Liabilities / Total Equity
  const liabilityToEquity = totalEquity > 0 ? (totalLiabilities / totalEquity) : null;

  return {
    totalAssets,
    totalLiabilities,
    totalEquity,
    nonCurrentLiab,
    currentLiab,
    longTermBorrowings,
    shortTermBorrowings,
    totalDebt,
    debtToEquity,
    liabilityToEquity,
    balanceStatus: summary.status,
    balanceVariance: summary.grand_total,
  };
};

/* ══════════════════════════════════════════════════════════════════════
   HELPER COMPONENTS  (mirror PLAnalytics.jsx)
══════════════════════════════════════════════════════════════════════ */

function Skeleton({ h = 20, w = '100%', radius = 6 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: radius,
      background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)',
      backgroundSize: '200% 100%', animation: 'bs-shimmer 1.4s linear infinite',
    }} />
  );
}

/* ── Demo / Fallback Mode Banner (FIX C4) ────────────────────────────────
   Listens for 'bsFallbackActive' CustomEvent dispatched by bsApi.js when
   a 5xx / network error / missing token causes a mock-data fallback.
   Shows an amber strip so users know they are seeing demo data.
──────────────────────────────────────────────────────────────────────── */
function DemoModeBanner() {
  const [visible, setVisible] = useState(false);
  const [reason, setReason]   = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const r = e.detail?.reason || 'backend-unavailable';
      setReason(r);
      setVisible(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 12000);
    };
    window.addEventListener('bsFallbackActive', handler);
    return () => {
      window.removeEventListener('bsFallbackActive', handler);
      clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  const reasonText =
    reason === 'no-token'       ? 'No authentication token \u2014 demo mode active' :
    reason === 'network-error'  ? 'Backend server unreachable \u2014 showing demo data' :
    reason.startsWith('server') ? `Backend returned ${reason.replace('server-', '')} error \u2014 showing demo data` :
                                  'Backend unavailable \u2014 showing demo data';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000,
      background: 'linear-gradient(90deg,#fef3c7,#fde68a)',
      borderBottom: '2px solid #f59e0b',
      padding: '7px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      fontSize: '0.76rem', fontWeight: 700, color: '#78350f',
      animation: 'bs-fadeIn 0.3s ease',
      boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
    }}>
      <span>&#9888;&#65039;&nbsp;&nbsp;{reasonText}. Values shown are sample figures only.</span>
      <button
        onClick={() => setVisible(false)}
        style={{
          background: 'rgba(0,0,0,0.08)', border: 'none', borderRadius: 6,
          padding: '2px 10px', cursor: 'pointer', fontSize: '0.72rem',
          fontWeight: 800, color: '#78350f',
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  const text = typeof message === 'string'
    ? message
    : typeof message === 'object' && message !== null
    ? (message.message || message.msg || JSON.stringify(message))
    : String(message || 'An error occurred');

  return (
    <div style={{
      background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10,
      padding: '10px 16px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12, fontSize: '0.78rem', color: '#be123c', marginTop: 8,
    }}>
      <span>⚠ {text}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: '#be123c', color: '#fff', border: 'none',
          borderRadius: 6, padding: '4px 12px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
        }}>Retry</button>
      )}
    </div>
  );
}

/* ── MultiSelect (identical to Sales Revenue) ─────────────────────── */
function MultiSelect({ options = [], value, onChange, placeholder = 'All', style }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  // Close dropdown on outside click; clear search when closing
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Auto-focus the search input when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current && searchRef.current.focus(), 0);
    }
    if (!open) setSearchQuery('');
  }, [open]);

  const normOptions = options.map(o => {
    if (typeof o === 'string') return { id: o, name: o };
    const id = o.value !== undefined ? o.value : o.id;
    const name = o.label !== undefined ? o.label : o.name;
    return { id, name };
  });

  // Filter visible options by search query — selected values are NEVER removed
  const q = searchQuery.trim().toLowerCase();
  const visibleOptions = q
    ? normOptions.filter(o => String(o.id) !== 'All' && o.name.toLowerCase().includes(q))
    : normOptions;

  const isAll = !value || value.length === 0 || (value.length === 1 && String(value[0]) === 'All');
  const toggle = (optId) => {
    if (String(optId) === 'All') { onChange(['All']); return; }
    const cur = isAll ? [] : value.filter(v => String(v) !== 'All');
    const next = cur.some(v => String(v) === String(optId))
      ? cur.filter(v => String(v) !== String(optId))
      : [...cur, optId];
    onChange(next.length === 0 ? ['All'] : next);
  };

  const selectedVals = normOptions.filter(o => value && value.some(v => String(v) === String(o.id)));
  const label = isAll ? placeholder : selectedVals.length === 1 ? selectedVals[0].name : (selectedVals.length + ' selected');

  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      <div onClick={() => setOpen(o => !o)} style={{ ...selStyle, backgroundImage: 'none', appearance: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', userSelect: 'none' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>{label}</span>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: '220px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 500, marginTop: 2, display: 'flex', flexDirection: 'column' }}>

          {/* ── Search input (only addition) ── */}
          <div style={{ padding: '6px 8px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0 }}>🔍</span>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="Search…"
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.75rem', color: '#334155', width: '100%', minWidth: 0 }}
              />
              {searchQuery && (
                <span
                  onClick={e => { e.stopPropagation(); setSearchQuery(''); }}
                  style={{ fontSize: '0.65rem', color: '#94a3b8', cursor: 'pointer', flexShrink: 0 }}
                >✕</span>
              )}
            </div>
          </div>

          {/* ── Scrollable options list ── */}
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {/* "All" option — only shown when search is empty */}
            {!q && (
              <div onClick={() => toggle('All')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', cursor: 'pointer', fontSize: '0.78rem', background: isAll ? '#eff6ff' : '#fff', color: isAll ? '#2563eb' : '#334155', fontWeight: isAll ? 600 : 400, borderBottom: '1px solid #f8fafc' }} onMouseEnter={e => { if (!isAll) e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={e => { if (!isAll) e.currentTarget.style.background = '#fff'; }}>
                <span style={{ width: 14, height: 14, border: '1.5px solid ' + (isAll ? '#2563eb' : '#cbd5e1'), borderRadius: 3, background: isAll ? '#2563eb' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isAll && <span style={{ color: '#fff', fontSize: '0.6rem', lineHeight: 1 }}>✓</span>}
                </span>
                All
              </div>
            )}

            {/* Filtered option rows */}
            {visibleOptions.map(opt => {
              if (opt.id === 'All') return null;
              const selected = !isAll && value && value.some(v => String(v) === String(opt.id));
              return (
                <div key={opt.id} onClick={() => toggle(opt.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', cursor: 'pointer', fontSize: '0.78rem', background: selected ? '#eff6ff' : '#fff', color: selected ? '#2563eb' : '#334155', fontWeight: selected ? 600 : 400, borderBottom: '1px solid #f8fafc' }} onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={e => { if (!selected) e.currentTarget.style.background = '#fff'; }}>
                  <span style={{ width: 14, height: 14, border: '1.5px solid ' + (selected ? '#2563eb' : '#cbd5e1'), borderRadius: 3, background: selected ? '#2563eb' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {selected && <span style={{ color: '#fff', fontSize: '0.6rem', lineHeight: 1 }}>✓</span>}
                  </span>
                  {opt.name}
                </div>
              );
            })}

            {/* Empty state when search yields no results */}
            {q && visibleOptions.length === 0 && (
              <div style={{ padding: '10px 12px', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                No results for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 85, flex: '0 0 auto' }}>
      <span style={{
        fontSize: '0.66rem', color: '#1e3a8a', fontWeight: 700,
        letterSpacing: '-0.02em', whiteSpace: 'nowrap',
      }}>
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
        width: '98vw', maxWidth: 1520,
        maxHeight: '94vh', display: 'flex', flexDirection: 'column',
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
        {isBalanced ? 'Balanced' : 'Oracle-source reconciliation difference'}
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

/* ── Helpers for 3-Column Balance Sheet Statement (matching sample layout) ── */
const fmtTableCell = (val) => {
  if (val === null || val === undefined) return '—';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtTablePct = (val) => {
  if (val === null || val === undefined) return '—';
  const n = Number(val);
  if (isNaN(n)) return '—';
  return `${n.toFixed(2)}%`;
};

const getVarColor = (val) => (val != null && Number(val) < 0) ? '#dc2626' : '#334155';

function buildStatementData(summaryData, compareSummaryData) {
  if (!summaryData?.sections) return null;

  const getSub = (summary, predicate) => {
    for (const s of (summary?.sections || [])) {
      for (const sub of (s.sub_sections || [])) {
        const name = (sub.name || sub.sub_section || '').toUpperCase();
        if (predicate(name)) return sub;
      }
    }
    return null;
  };

  const processSub = (curSub, cmpSub, isCreditNormal = false) => {
    const sign = isCreditNormal ? -1 : 1;
    const curMap = new Map();
    const cmpMap = new Map();

    (curSub?.accounts || []).forEach(a => {
      const code = String(a.account_code || a.account_name);
      if (!curMap.has(code)) curMap.set(code, { code, name: a.account_name || code, current: 0 });
      curMap.get(code).current += sign * Number(a.balance_amount || 0);
    });

    (cmpSub?.accounts || []).forEach(a => {
      const code = String(a.account_code || a.account_name);
      if (!cmpMap.has(code)) cmpMap.set(code, { code, name: a.account_name || code, compare: 0 });
      cmpMap.get(code).compare += sign * Number(a.balance_amount || 0);
    });

    const allCodes = Array.from(new Set([...curMap.keys(), ...cmpMap.keys()]));
    const rows = allCodes.map(code => {
      const curItem = curMap.get(code);
      const cmpItem = cmpMap.get(code);
      const name = curItem?.name || cmpItem?.name || code;
      const current = curItem?.current ?? 0;
      const compare = cmpItem?.compare ?? 0;
      const variance = current - compare;
      const variancePct = compare !== 0 ? (variance / Math.abs(compare)) * 100 : null;
      return { code, name, current, compare, variance, variancePct };
    });

    const totalCurrent = rows.reduce((s, r) => s + r.current, 0);
    const totalCompare = rows.reduce((s, r) => s + r.compare, 0);
    const totalVariance = totalCurrent - totalCompare;
    const totalVariancePct = totalCompare !== 0 ? (totalVariance / Math.abs(totalCompare)) * 100 : null;

    return { rows, totalCurrent, totalCompare, totalVariance, totalVariancePct };
  };

  const currentAssets = processSub(
    getSub(summaryData, n => !n.includes('NON') && n.includes('ASSET')),
    getSub(compareSummaryData, n => !n.includes('NON') && n.includes('ASSET')),
    false
  );
  const nonCurrentAssets = processSub(
    getSub(summaryData, n => n.includes('NON') && n.includes('ASSET')),
    getSub(compareSummaryData, n => n.includes('NON') && n.includes('ASSET')),
    false
  );
  const currentLiab = processSub(
    getSub(summaryData, n => !n.includes('NON') && n.includes('LIABILIT')),
    getSub(compareSummaryData, n => !n.includes('NON') && n.includes('LIABILIT')),
    true
  );
  const nonCurrentLiab = processSub(
    getSub(summaryData, n => n.includes('NON') && n.includes('LIABILIT')),
    getSub(compareSummaryData, n => n.includes('NON') && n.includes('LIABILIT')),
    true
  );
  const equity = processSub(
    getSub(summaryData, n => n.includes('EQUITY')),
    getSub(compareSummaryData, n => n.includes('EQUITY')),
    true
  );

  // Totals
  const totalAssetsCurrent = currentAssets.totalCurrent + nonCurrentAssets.totalCurrent;
  const totalAssetsCompare = currentAssets.totalCompare + nonCurrentAssets.totalCompare;
  const totalAssetsVar = totalAssetsCurrent - totalAssetsCompare;
  const totalAssetsVarPct = totalAssetsCompare !== 0 ? (totalAssetsVar / Math.abs(totalAssetsCompare)) * 100 : null;

  const totalLiabCurrent = currentLiab.totalCurrent + nonCurrentLiab.totalCurrent;
  const totalLiabCompare = currentLiab.totalCompare + nonCurrentLiab.totalCompare;
  const totalLiabVar = totalLiabCurrent - totalLiabCompare;
  const totalLiabVarPct = totalLiabCompare !== 0 ? (totalLiabVar / Math.abs(totalLiabCompare)) * 100 : null;

  const totalEqLiabCurrent = totalLiabCurrent + equity.totalCurrent;
  const totalEqLiabCompare = totalLiabCompare + equity.totalCompare;
  const totalEqLiabVar = totalEqLiabCurrent - totalEqLiabCompare;
  const totalEqLiabVarPct = totalEqLiabCompare !== 0 ? (totalEqLiabVar / Math.abs(totalEqLiabCompare)) * 100 : null;

  // Equity % of Total Assets
  const equitySharePct = totalAssetsCurrent > 0 ? ((equity.totalCurrent / totalAssetsCurrent) * 100).toFixed(2) : '0.00';
  const compareEquitySharePct = totalAssetsCompare > 0 ? ((equity.totalCompare / totalAssetsCompare) * 100).toFixed(2) : '0.00';

  return {
    currentAssets,
    nonCurrentAssets,
    currentLiab,
    nonCurrentLiab,
    equity,
    totalAssets: {
      current: totalAssetsCurrent,
      compare: totalAssetsCompare,
      variance: totalAssetsVar,
      variancePct: totalAssetsVarPct,
    },
    totalLiab: {
      current: totalLiabCurrent,
      compare: totalLiabCompare,
      variance: totalLiabVar,
      variancePct: totalLiabVarPct,
    },
    totalEqLiab: {
      current: totalEqLiabCurrent,
      compare: totalEqLiabCompare,
      variance: totalEqLiabVar,
      variancePct: totalEqLiabVarPct,
    },
    equitySharePct,
    compareEquitySharePct,
  };
}

/* StatementCards — 3-column Balance Sheet Statement layout matching sample */
function StatementCards({
  statementData,
  currency,
  periodLabel,
  comparePeriodLabel,
  hasCompare,
  onDrilldown,
  loading,
}) {
  if (loading) {
    return (
      <div className="bs-statement-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ padding: 18 }}>
            <Skeleton h={22} w="60%" />
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...Array(6)].map((_, j) => <Skeleton key={j} h={20} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!statementData) return null;

  const STH = {
    padding: '8px 8px',
    textAlign: 'right',
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#1e3a8a',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  };
  const STH_L = { ...STH, textAlign: 'left' };

  const SSH = {
    padding: '7px 8px',
    textAlign: 'right',
    fontSize: '0.71rem',
    fontWeight: 800,
    color: '#1e1b4b',
    background: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  };
  const SSH_L = { ...SSH, textAlign: 'left' };

  const STD = {
    padding: '6px 8px',
    textAlign: 'right',
    fontSize: '0.72rem',
    color: '#334155',
    borderBottom: '1px solid #f8fafc',
    whiteSpace: 'nowrap',
  };
  const STD_L = { ...STD, textAlign: 'left', color: '#1e293b', fontWeight: 500 };

  const STOT = {
    padding: '9px 8px',
    textAlign: 'right',
    fontSize: '0.76rem',
    fontWeight: 900,
    color: '#312e81',
    background: '#f8faff',
    borderTop: '2px solid #c7d2fe',
    whiteSpace: 'nowrap',
  };
  const STOT_L = { ...STOT, textAlign: 'left' };

  const SGREEN_TOT = {
    padding: '9px 8px',
    textAlign: 'right',
    fontSize: '0.76rem',
    fontWeight: 900,
    color: '#15803d',
    background: '#f0fdf4',
    borderTop: '2px solid #86efac',
    whiteSpace: 'nowrap',
  };
  const SGREEN_TOT_L = { ...SGREEN_TOT, textAlign: 'left' };

  const renderHeaders = () => (
    <thead>
      <tr>
        <th style={{ ...STH_L, width: hasCompare ? '34%' : '60%' }}>Particulars</th>
        <th style={STH}>As on {periodLabel}</th>
        {hasCompare && (
          <>
            <th style={STH}>As on {comparePeriodLabel}</th>
            <th style={STH}>Variance ({currency})</th>
            <th style={STH}>Variance (%)</th>
          </>
        )}
      </tr>
    </thead>
  );

  const renderSubSection = (title, subData) => (
    <>
      <tr style={{ background: '#f8fafc' }}>
        <td style={SSH_L}>{title}</td>
        <td style={{ ...SSH, color: '#1e3a8a' }}>{fmtTableCell(subData.totalCurrent)}</td>
        {hasCompare && (
          <>
            <td style={{ ...SSH, color: '#64748b' }}>{fmtTableCell(subData.totalCompare)}</td>
            <td style={{ ...SSH, color: getVarColor(subData.totalVariance) }}>{fmtTableCell(subData.totalVariance)}</td>
            <td style={{ ...SSH, color: getVarColor(subData.totalVariancePct) }}>{fmtTablePct(subData.totalVariancePct)}</td>
          </>
        )}
      </tr>
      {subData.rows.map(row => (
        <tr
          key={row.code}
          onClick={onDrilldown ? () => onDrilldown({ account_code: row.code, account_name: row.name }) : undefined}
          style={{ cursor: onDrilldown ? 'pointer' : 'default' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title={onDrilldown ? `Click to view drilldown for ${row.name}` : undefined}
        >
          <td style={STD_L}>
            {row.name}
          </td>
          <td style={{ ...STD, fontWeight: 600 }}>{fmtTableCell(row.current)}</td>
          {hasCompare && (
            <>
              <td style={{ ...STD, color: '#64748b' }}>{fmtTableCell(row.compare)}</td>
              <td style={{ ...STD, color: getVarColor(row.variance), fontWeight: 600 }}>
                {fmtTableCell(row.variance)}
              </td>
              <td style={{ ...STD, color: getVarColor(row.variancePct), fontWeight: 600 }}>
                {fmtTablePct(row.variancePct)}
              </td>
            </>
          )}
        </tr>
      ))}
    </>
  );

  return (
    <div className="bs-statement-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {/* ── CARD 1: ASSETS ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: '0.86rem', color: C.navy }}>Assets ({currency})</span>
        </div>
        <div style={{ flex: 1, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
            {renderHeaders()}
            <tbody>
              {renderSubSection('I. CURRENT ASSETS', statementData.currentAssets)}
              {renderSubSection('II. NON CURRENT ASSETS', statementData.nonCurrentAssets)}
            </tbody>
            <tfoot>
              <tr>
                <td style={STOT_L}>TOTAL ASSETS</td>
                <td style={STOT}>{fmtTableCell(statementData.totalAssets.current)}</td>
                {hasCompare && (
                  <>
                    <td style={STOT}>{fmtTableCell(statementData.totalAssets.compare)}</td>
                    <td style={{ ...STOT, color: getVarColor(statementData.totalAssets.variance) }}>{fmtTableCell(statementData.totalAssets.variance)}</td>
                    <td style={{ ...STOT, color: getVarColor(statementData.totalAssets.variancePct) }}>{fmtTablePct(statementData.totalAssets.variancePct)}</td>
                  </>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── CARD 2: EQUITY & LIABILITIES ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: '0.86rem', color: C.navy }}>Equity & Liabilities ({currency})</span>
        </div>
        <div style={{ flex: 1, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
            {renderHeaders()}
            <tbody>
              {renderSubSection('I. CURRENT LIABILITIES', statementData.currentLiab)}
              {renderSubSection('II. NON CURRENT LIABILITIES', statementData.nonCurrentLiab)}
            </tbody>
            <tfoot>
              <tr>
                <td style={STOT_L}>TOTAL LIABILITIES</td>
                <td style={STOT}>{fmtTableCell(statementData.totalLiab.current)}</td>
                {hasCompare && (
                  <>
                    <td style={STOT}>{fmtTableCell(statementData.totalLiab.compare)}</td>
                    <td style={{ ...STOT, color: getVarColor(statementData.totalLiab.variance) }}>{fmtTableCell(statementData.totalLiab.variance)}</td>
                    <td style={{ ...STOT, color: getVarColor(statementData.totalLiab.variancePct) }}>{fmtTablePct(statementData.totalLiab.variancePct)}</td>
                  </>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── CARD 3: EQUITY ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#15803d' }}>Equity ({currency})</span>
        </div>
        <div style={{ flex: 1, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
            {renderHeaders()}
            <tbody>
              {statementData.equity.rows.map(row => (
                <tr
                  key={row.code}
                  onClick={onDrilldown ? () => onDrilldown({ account_code: row.code, account_name: row.name }) : undefined}
                  style={{ cursor: onDrilldown ? 'pointer' : 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  title={onDrilldown ? `Click to view drilldown for ${row.name}` : undefined}
                >
                  <td style={STD_L}>{row.name}</td>
                  <td style={{ ...STD, fontWeight: 600 }}>{fmtTableCell(row.current)}</td>
                  {hasCompare && (
                    <>
                      <td style={{ ...STD, color: '#64748b' }}>{fmtTableCell(row.compare)}</td>
                      <td style={{ ...STD, color: getVarColor(row.variance), fontWeight: 600 }}>
                        {fmtTableCell(row.variance)}
                      </td>
                      <td style={{ ...STD, color: getVarColor(row.variancePct), fontWeight: 600 }}>
                        {fmtTablePct(row.variancePct)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
              <tr style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <td style={{ ...STD_L, fontWeight: 800, color: C.navy }}>Total Equity</td>
                <td style={{ ...STD, fontWeight: 800, color: C.navy }}>{fmtTableCell(statementData.equity.totalCurrent)}</td>
                {hasCompare && (
                  <>
                    <td style={{ ...STD, fontWeight: 800, color: '#64748b' }}>{fmtTableCell(statementData.equity.totalCompare)}</td>
                    <td style={{ ...STD, fontWeight: 800, color: getVarColor(statementData.equity.totalVariance) }}>{fmtTableCell(statementData.equity.totalVariance)}</td>
                    <td style={{ ...STD, fontWeight: 800, color: getVarColor(statementData.equity.totalVariancePct) }}>{fmtTablePct(statementData.equity.totalVariancePct)}</td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Equity Insight Widget (Green card from sample image) */}
        <div style={{
          margin: '12px 14px',
          background: 'linear-gradient(90deg, #f0fdf4, #ecfdf5)',
          border: '1px solid #bbf7d0',
          borderRadius: 12,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#dcfce7', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0,
            }}>
              🏢
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#15803d' }}>
                Total Equity represents {statementData.equitySharePct}% of Total Assets
              </div>
              {hasCompare && (
                <div style={{ fontSize: '0.68rem', color: '#16a34a', marginTop: 2 }}>
                  vs {statementData.compareEquitySharePct}% as on {comparePeriodLabel}
                </div>
              )}
            </div>
          </div>
          <div style={{ color: '#16a34a', fontSize: '1.4rem', fontWeight: 800 }}>
            ↗
          </div>
        </div>

        {/* Bottom Total Row: TOTAL EQUITY & LIABILITIES */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
            <tfoot>
              <tr>
                <td style={{ ...SGREEN_TOT_L, width: hasCompare ? '34%' : '60%' }}>TOTAL EQUITY & LIABILITIES</td>
                <td style={SGREEN_TOT}>{fmtTableCell(statementData.totalEqLiab.current)}</td>
                {hasCompare && (
                  <>
                    <td style={SGREEN_TOT}>{fmtTableCell(statementData.totalEqLiab.compare)}</td>
                    <td style={{ ...SGREEN_TOT, color: getVarColor(statementData.totalEqLiab.variance) }}>{fmtTableCell(statementData.totalEqLiab.variance)}</td>
                    <td style={{ ...SGREEN_TOT, color: getVarColor(statementData.totalEqLiab.variancePct) }}>{fmtTablePct(statementData.totalEqLiab.variancePct)}</td>
                  </>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatementViewAll({ summaryData, compareSummaryData, currency, periodLabel, comparePeriodLabel, onDrilldown }) {
  const statementData = buildStatementData(summaryData, compareSummaryData);
  if (!statementData) {
    return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;
  }
  return (
    <div style={{ padding: 12 }}>
      <StatementCards
        statementData={statementData}
        currency={currency}
        periodLabel={periodLabel}
        comparePeriodLabel={comparePeriodLabel}
        hasCompare={Boolean(compareSummaryData)}
        onDrilldown={onDrilldown}
        loading={false}
      />
    </div>
  );
}

/* Subdivision View All Table */
function SubDivisionViewAll({ data, currency }) {
  const rows = Array.isArray(data) ? data : (data?.data || []);
  if (!rows.length)
    return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No data available</div>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={MTH_L}>Sub-Division</th>
          <th style={MTH}>Code</th>
          
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
            
            <td style={{ ...MTD, fontWeight: 700, color: (row.grand_total ?? 0) >= 0 ? C.navy : C.rose }}>
              {fmtNum(Math.abs(row.grand_total ?? 0), currency)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Trend View All Modal Content (Multi-Select Filters, Chart, Table & Exports) ── */
function TrendViewAll({
  trendData,
  currency,
  filterOptions,
  appliedFilters,
  onApplyFilters,
  loading,
}) {
  const [modalFilters, setModalFilters] = useState({
    legalEntity: appliedFilters?.legalEntity || [],
    parentDivision: appliedFilters?.parentDivision || [],
    subdivision: appliedFilters?.subdivision || [],
    period: appliedFilters?.period || '',
    currency: currency || 'AED',
  });

  const series = trendData?.series || [];

  const handleApply = () => {
    if (onApplyFilters) onApplyFilters(modalFilters);
  };

  const handleExcel = () => {
    exportTrendToExcel(series, modalFilters.currency);
  };

  const handlePDF = () => {
    exportTrendToPDF(series, modalFilters.currency);
  };

  return (
    <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter Bar inside Modal */}
      <div style={{
        padding: '12px 14px',
        background: '#f8fafc',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', flex: 1 }}>
          {/* Legal Entity */}
          <div style={{ minWidth: 150, maxWidth: 200, flex: 1 }}>
            <label style={{ fontSize: '0.66rem', fontWeight: 700, color: C.slate, display: 'block', marginBottom: 3 }}>
              Legal Entity
            </label>
            <MultiSelect
              options={filterOptions?.legalEntities || []}
              value={modalFilters.legalEntity}
              onChange={v => setModalFilters(f => ({ ...f, legalEntity: v }))}
              placeholder="All Entities"
            />
          </div>

          {/* Parent Division */}
          <div style={{ minWidth: 150, maxWidth: 200, flex: 1 }}>
            <label style={{ fontSize: '0.66rem', fontWeight: 700, color: C.slate, display: 'block', marginBottom: 3 }}>
              Parent Division
            </label>
            <MultiSelect
              options={filterOptions?.parentDivisions || []}
              value={modalFilters.parentDivision}
              onChange={v => setModalFilters(f => ({ ...f, parentDivision: v }))}
              placeholder="All Divisions"
            />
          </div>

          {/* Sub-Division */}
          <div style={{ minWidth: 150, maxWidth: 200, flex: 1 }}>
            <label style={{ fontSize: '0.66rem', fontWeight: 700, color: C.slate, display: 'block', marginBottom: 3 }}>
              Sub-Division
            </label>
            <MultiSelect
              options={filterOptions?.subdivisions || []}
              value={modalFilters.subdivision}
              onChange={v => setModalFilters(f => ({ ...f, subdivision: v }))}
              placeholder="All Sub-Divisions"
            />
          </div>

          {/* As on Date */}
          <div style={{ minWidth: 120 }}>
            <label style={{ fontSize: '0.66rem', fontWeight: 700, color: C.slate, display: 'block', marginBottom: 3 }}>
              As on Date
            </label>
            <select
              style={selStyle}
              value={modalFilters.period}
              onChange={e => setModalFilters(f => ({ ...f, period: e.target.value }))}
            >
              {(filterOptions?.periods || []).map(p => {
                const val = typeof p === 'object' ? p.period : p;
                const lbl = typeof p === 'object' ? p.period_name : formatPeriod(p);
                return <option key={val} value={val}>{lbl || val}</option>;
              })}
            </select>
          </div>

          {/* Currency */}
          <div style={{ minWidth: 90 }}>
            <label style={{ fontSize: '0.66rem', fontWeight: 700, color: C.slate, display: 'block', marginBottom: 3 }}>
              Currency
            </label>
            <select
              style={selStyle}
              value={modalFilters.currency}
              onChange={e => setModalFilters(f => ({ ...f, currency: e.target.value }))}
            >
              {['AED', 'USD', 'SAR', 'QAR', 'OMR'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            style={{
              marginTop: 16,
              padding: '6px 14px',
              background: C.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 7,
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
          <button
            onClick={handleExcel}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px',
              background: '#f0fdf4', color: '#15803d',
              border: '1px solid #bbf7d0', borderRadius: 7,
              fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            📊 Excel
          </button>
          <button
            onClick={handlePDF}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px',
              background: '#fff1f2', color: '#be123c',
              border: '1px solid #fecdd3', borderRadius: 7,
              fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            📄 PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} h={30} />)}
        </div>
      ) : !series.length ? (
        <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>
          No trend data available for the selected filters
        </div>
      ) : (
        <>
          {/* Chart in Modal */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', color: C.navy }}>
                Previous 6 Months Trend: Assets vs Liabilities vs Equity
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.72rem', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4f46e5' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4f46e5' }} /> Total Assets
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#be123c' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#be123c' }} /> Total Liabilities
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#15803d' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#15803d' }} /> Total Equity
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={series} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={fmtAxisNum} width={52} />
                <Tooltip formatter={(v, n) => [fmtKPI(v, modalFilters.currency), n]} contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
                <Line type="monotone" dataKey="totalAssets" name="Total Assets" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="totalLiabilities" name="Total Liabilities" stroke="#be123c" strokeWidth={2.5} dot={{ r: 4, fill: '#be123c' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="totalEquity" name="Total Equity" stroke="#15803d" strokeWidth={2.5} dot={{ r: 4, fill: '#15803d' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table in Modal */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={MTH_L}>Period</th>
                  <th style={MTH}>Total Assets ({modalFilters.currency})</th>
                  <th style={MTH}>Assets MoM %</th>
                  <th style={MTH}>Total Liabilities ({modalFilters.currency})</th>
                  <th style={MTH}>Liab MoM %</th>
                  <th style={MTH}>Total Equity ({modalFilters.currency})</th>
                  <th style={MTH}>Equity MoM %</th>
                  <th style={MTH}>Liab/Equity</th>
                  <th style={MTH}>Debt/Equity</th>
                </tr>
              </thead>
              <tbody>
                {series.map(row => (
                  <tr
                    key={row.period}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td style={{ ...MTD_L, fontWeight: 700 }}>{row.period}</td>
                    <td style={{ ...MTD, fontWeight: 600, color: '#4f46e5' }}>{fmtTableCell(row.totalAssets)}</td>
                    <td style={{ ...MTD, color: getVarColor(row.assetsMoMPct), fontWeight: 600 }}>
                      {row.assetsMoMPct != null ? `${row.assetsMoMPct >= 0 ? '+' : ''}${row.assetsMoMPct.toFixed(2)}%` : '—'}
                    </td>
                    <td style={{ ...MTD, fontWeight: 600, color: '#be123c' }}>{fmtTableCell(row.totalLiabilities)}</td>
                    <td style={{ ...MTD, color: getVarColor(row.liabMoMPct), fontWeight: 600 }}>
                      {row.liabMoMPct != null ? `${row.liabMoMPct >= 0 ? '+' : ''}${row.liabMoMPct.toFixed(2)}%` : '—'}
                    </td>
                    <td style={{ ...MTD, fontWeight: 600, color: '#15803d' }}>{fmtTableCell(row.totalEquity)}</td>
                    <td style={{ ...MTD, color: getVarColor(row.equityMoMPct), fontWeight: 600 }}>
                      {row.equityMoMPct != null ? `${row.equityMoMPct >= 0 ? '+' : ''}${row.equityMoMPct.toFixed(2)}%` : '—'}
                    </td>
                    <td style={{ ...MTD, fontWeight: 600 }}>{row.liabilityToEquity != null ? `${row.liabilityToEquity.toFixed(2)}x` : '—'}</td>
                    <td style={{ ...MTD, fontWeight: 600 }}>{row.debtToEquity != null ? `${row.debtToEquity.toFixed(2)}x` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Composition View All Modal Content (Multi-Select Filters, Donut Charts, Breakdown Tables & Exports) ── */
function CompositionViewAll({
  statementData,
  currency,
  periodLabel,
  comparePeriodLabel,
  hasCompare,
  filterOptions,
  appliedFilters,
  onApplyFilters,
  loading,
}) {
  const [modalFilters, setModalFilters] = useState({
    legalEntity: appliedFilters?.legalEntity || [],
    parentDivision: appliedFilters?.parentDivision || [],
    subdivision: appliedFilters?.subdivision || [],
    period: appliedFilters?.period || '',
    currency: currency || 'AED',
  });

  if (!statementData) {
    return <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: '0.8rem' }}>No composition data available</div>;
  }

  const assetTotal = statementData.totalAssets.current || 1;
  const nonCurrentAssetPct = ((statementData.nonCurrentAssets.totalCurrent / assetTotal) * 100).toFixed(1);
  const currentAssetPct = ((statementData.currentAssets.totalCurrent / assetTotal) * 100).toFixed(1);

  const liabEqTotal = statementData.totalEqLiab.current || 1;
  const equityPct = ((statementData.equity.totalCurrent / liabEqTotal) * 100).toFixed(1);
  const nonCurrentLiabPct = ((statementData.nonCurrentLiab.totalCurrent / liabEqTotal) * 100).toFixed(1);
  const currentLiabPct = ((statementData.currentLiab.totalCurrent / liabEqTotal) * 100).toFixed(1);

  const assetSegments = [
    { name: 'Non-current Assets', value: statementData.nonCurrentAssets.totalCurrent, color: '#6366f1', pct: nonCurrentAssetPct },
    { name: 'Current Assets', value: statementData.currentAssets.totalCurrent, color: '#3b82f6', pct: currentAssetPct },
  ];

  const liabEqSegments = [
    { name: 'Equity', value: statementData.equity.totalCurrent, color: '#10b981', pct: equityPct },
    { name: 'Non-current Liabilities', value: statementData.nonCurrentLiab.totalCurrent, color: '#8b5cf6', pct: nonCurrentLiabPct },
    { name: 'Current Liabilities', value: statementData.currentLiab.totalCurrent, color: '#f59e0b', pct: currentLiabPct },
  ];

  const handleApply = () => {
    if (onApplyFilters) onApplyFilters(modalFilters);
  };

  const handleExcel = () => {
    exportCompositionToExcel({
      period: periodLabel,
      assets: {
        total: statementData.totalAssets.current,
        nonCurrent: { amount: statementData.nonCurrentAssets.totalCurrent, pct: nonCurrentAssetPct },
        current: { amount: statementData.currentAssets.totalCurrent, pct: currentAssetPct },
      },
      liabEquity: {
        total: statementData.totalEqLiab.current,
        equity: { amount: statementData.equity.totalCurrent, pct: equityPct },
        nonCurrentLiab: { amount: statementData.nonCurrentLiab.totalCurrent, pct: nonCurrentLiabPct },
        currentLiab: { amount: statementData.currentLiab.totalCurrent, pct: currentLiabPct },
      },
    }, modalFilters.currency);
  };

  const handlePDF = () => {
    exportCompositionToPDF({
      period: periodLabel,
      assets: {
        total: statementData.totalAssets.current,
        nonCurrent: { amount: statementData.nonCurrentAssets.totalCurrent, pct: nonCurrentAssetPct },
        current: { amount: statementData.currentAssets.totalCurrent, pct: currentAssetPct },
      },
      liabEquity: {
        total: statementData.totalEqLiab.current,
        equity: { amount: statementData.equity.totalCurrent, pct: equityPct },
        nonCurrentLiab: { amount: statementData.nonCurrentLiab.totalCurrent, pct: nonCurrentLiabPct },
        currentLiab: { amount: statementData.currentLiab.totalCurrent, pct: currentLiabPct },
      },
    }, modalFilters.currency);
  };

  return (
    <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter Bar inside Modal */}
      <div style={{
        padding: '12px 14px',
        background: '#f8fafc',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', flex: 1 }}>
          {/* Legal Entity */}
          <div style={{ minWidth: 150, maxWidth: 200, flex: 1 }}>
            <label style={{ fontSize: '0.66rem', fontWeight: 700, color: C.slate, display: 'block', marginBottom: 3 }}>
              Legal Entity
            </label>
            <MultiSelect
              options={filterOptions?.legalEntities || []}
              value={modalFilters.legalEntity}
              onChange={v => setModalFilters(f => ({ ...f, legalEntity: v }))}
              placeholder="All Entities"
            />
          </div>

          {/* Parent Division */}
          <div style={{ minWidth: 150, maxWidth: 200, flex: 1 }}>
            <label style={{ fontSize: '0.66rem', fontWeight: 700, color: C.slate, display: 'block', marginBottom: 3 }}>
              Parent Division
            </label>
            <MultiSelect
              options={filterOptions?.parentDivisions || []}
              value={modalFilters.parentDivision}
              onChange={v => setModalFilters(f => ({ ...f, parentDivision: v }))}
              placeholder="All Divisions"
            />
          </div>

          {/* Sub-Division */}
          <div style={{ minWidth: 150, maxWidth: 200, flex: 1 }}>
            <label style={{ fontSize: '0.66rem', fontWeight: 700, color: C.slate, display: 'block', marginBottom: 3 }}>
              Sub-Division
            </label>
            <MultiSelect
              options={filterOptions?.subdivisions || []}
              value={modalFilters.subdivision}
              onChange={v => setModalFilters(f => ({ ...f, subdivision: v }))}
              placeholder="All Sub-Divisions"
            />
          </div>

          {/* As on Date */}
          <div style={{ minWidth: 120 }}>
            <label style={{ fontSize: '0.66rem', fontWeight: 700, color: C.slate, display: 'block', marginBottom: 3 }}>
              As on Date
            </label>
            <select
              style={selStyle}
              value={modalFilters.period}
              onChange={e => setModalFilters(f => ({ ...f, period: e.target.value }))}
            >
              {(filterOptions?.periods || []).map(p => {
                const val = typeof p === 'object' ? p.period : p;
                const lbl = typeof p === 'object' ? p.period_name : formatPeriod(p);
                return <option key={val} value={val}>{lbl || val}</option>;
              })}
            </select>
          </div>

          {/* Currency */}
          <div style={{ minWidth: 90 }}>
            <label style={{ fontSize: '0.66rem', fontWeight: 700, color: C.slate, display: 'block', marginBottom: 3 }}>
              Currency
            </label>
            <select
              style={selStyle}
              value={modalFilters.currency}
              onChange={e => setModalFilters(f => ({ ...f, currency: e.target.value }))}
            >
              {['AED', 'USD', 'SAR', 'QAR', 'OMR'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            style={{
              marginTop: 16,
              padding: '6px 14px',
              background: C.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 7,
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
          <button
            onClick={handleExcel}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px',
              background: '#f0fdf4', color: '#15803d',
              border: '1px solid #bbf7d0', borderRadius: 7,
              fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            📊 Excel
          </button>
          <button
            onClick={handlePDF}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px',
              background: '#fff1f2', color: '#be123c',
              border: '1px solid #fecdd3', borderRadius: 7,
              fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            📄 PDF
          </button>
        </div>
      </div>

      {/* Two Composition Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 16 }}>
        {/* 1. Asset Composition Card */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 800, fontSize: '0.86rem', color: C.navy, marginBottom: 4 }}>
            1. Asset Composition
          </div>
          <div style={{ fontSize: '0.68rem', color: C.muted, marginBottom: 12 }}>
            Non-current Assets vs Current Assets share of Total Assets
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, position: 'relative' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={assetSegments}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={65}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {assetSegments.map(d => <Cell key={d.name} fill={d.color} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v, n) => [fmtKPI(v, modalFilters.currency), n]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: '0.6rem', color: C.muted, fontWeight: 600 }}>Total Assets</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: C.navy }}>{fmtKPI(statementData.totalAssets.current, modalFilters.currency)}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem', marginTop: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={MTH_L}>Component</th>
                <th style={MTH}>Accounts</th>
                <th style={MTH}>Balance ({modalFilters.currency})</th>
                <th style={MTH}>Share %</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ ...MTD_L, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
                  <span style={{ fontWeight: 600 }}>Non-current Assets</span>
                </td>
                <td style={MTD}>{statementData.nonCurrentAssets.rows.length}</td>
                <td style={{ ...MTD, fontWeight: 600 }}>{fmtTableCell(statementData.nonCurrentAssets.totalCurrent)}</td>
                <td style={{ ...MTD, fontWeight: 800, color: '#6366f1' }}>{nonCurrentAssetPct}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ ...MTD_L, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                  <span style={{ fontWeight: 600 }}>Current Assets</span>
                </td>
                <td style={MTD}>{statementData.currentAssets.rows.length}</td>
                <td style={{ ...MTD, fontWeight: 600 }}>{fmtTableCell(statementData.currentAssets.totalCurrent)}</td>
                <td style={{ ...MTD, fontWeight: 800, color: '#3b82f6' }}>{currentAssetPct}%</td>
              </tr>
              <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                <td style={{ ...MTD_L, fontWeight: 800, color: C.navy }}>TOTAL ASSETS</td>
                <td style={{ ...MTD, fontWeight: 800 }}>{statementData.nonCurrentAssets.rows.length + statementData.currentAssets.rows.length}</td>
                <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>{fmtTableCell(statementData.totalAssets.current)}</td>
                <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Liabilities & Equity Composition Card */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 800, fontSize: '0.86rem', color: C.navy, marginBottom: 4 }}>
            2. Liabilities & Equity Composition
          </div>
          <div style={{ fontSize: '0.68rem', color: C.muted, marginBottom: 12 }}>
            Equity, Non-current Liabilities & Current Liabilities share of Total Sources
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, position: 'relative' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={liabEqSegments}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={65}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {liabEqSegments.map(d => <Cell key={d.name} fill={d.color} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v, n) => [fmtKPI(v, modalFilters.currency), n]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: '0.6rem', color: C.muted, fontWeight: 600 }}>Total Liab & Eq</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: C.navy }}>{fmtKPI(statementData.totalEqLiab.current, modalFilters.currency)}</div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem', marginTop: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={MTH_L}>Component</th>
                <th style={MTH}>Accounts</th>
                <th style={MTH}>Balance ({modalFilters.currency})</th>
                <th style={MTH}>Share %</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ ...MTD_L, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontWeight: 600 }}>Equity</span>
                </td>
                <td style={MTD}>{statementData.equity.rows.length}</td>
                <td style={{ ...MTD, fontWeight: 600 }}>{fmtTableCell(statementData.equity.totalCurrent)}</td>
                <td style={{ ...MTD, fontWeight: 800, color: '#10b981' }}>{equityPct}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ ...MTD_L, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
                  <span style={{ fontWeight: 600 }}>Non-current Liabilities</span>
                </td>
                <td style={MTD}>{statementData.nonCurrentLiab.rows.length}</td>
                <td style={{ ...MTD, fontWeight: 600 }}>{fmtTableCell(statementData.nonCurrentLiab.totalCurrent)}</td>
                <td style={{ ...MTD, fontWeight: 800, color: '#8b5cf6' }}>{nonCurrentLiabPct}%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ ...MTD_L, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ fontWeight: 600 }}>Current Liabilities</span>
                </td>
                <td style={MTD}>{statementData.currentLiab.rows.length}</td>
                <td style={{ ...MTD, fontWeight: 600 }}>{fmtTableCell(statementData.currentLiab.totalCurrent)}</td>
                <td style={{ ...MTD, fontWeight: 800, color: '#f59e0b' }}>{currentLiabPct}%</td>
              </tr>
              <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                <td style={{ ...MTD_L, fontWeight: 800, color: C.navy }}>TOTAL LIAB. & EQUITY</td>
                <td style={{ ...MTD, fontWeight: 800 }}>
                  {statementData.equity.rows.length + statementData.nonCurrentLiab.rows.length + statementData.currentLiab.rows.length}
                </td>
                <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>{fmtTableCell(statementData.totalEqLiab.current)}</td>
                <td style={{ ...MTD, fontWeight: 800, color: C.navy }}>100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* Drilldown Modal Content */
function DrilldownModal({ isOpen, onClose, data, currency }) {
  if (!isOpen) return null;
  const rows = data?.data || [];
  const account = data?.account_name || (rows[0] && rows[0].account_name) || '—';
  const total   = data?.consolidated_balance ?? rows.reduce((sum, r) => sum + (r.balance_amount || 0), 0);

  return (
    <ViewAllModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Drilldown: ${account}`}
      subtitle={`Period: ${data?.period_name || data?.period || (rows[0] && rows[0].period_code) || '—'} | Currency: ${currency} | Total: ${fmtNum(Math.abs(total), currency)}`}
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
                key={`${row.sub_division_id ?? row.sub_division_code ?? 'subdiv'}-${i}`}
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

import { getApiBaseUrl } from '../utils/apiBase';

function ExportButtons({ endpoint, filters, size = 'sm' }) {
  const [exporting, setExporting] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExport = async (format) => {
    if (exporting) return;
    setExporting(format);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('finsight_token');
      const active = (val) => {
        if (Array.isArray(val)) {
          const f = val.filter(v => v !== 'All' && v !== 'all');
          return f.length > 0 ? f : undefined;
        }
        return val && val !== 'All' && val !== 'all' ? val : undefined;
      };

      const params = {
        legal_group_id: active(filters.legalGroup),
        legal_entity_id: active(filters.legalEntity),
        parent_division_id: active(filters.parentDivision),
        subdivision_id: active(filters.subdivision),
        period: active(filters.period),
        reporting_currency: active(filters.currency),
        format
      };

      const urlParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) {
          if (Array.isArray(v)) v.forEach(val => urlParams.append(k, val));
          else urlParams.append(k, v);
        }
      });
      const qs = urlParams.toString();
      const url = `${getApiBaseUrl()}/api/bs/${endpoint}/export${qs ? `?${qs}` : ''}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `bs_${endpoint}_${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      showToast(`${format === 'excel' ? 'Excel' : 'PDF'} export started`, 'success');
    } catch (e) {
      showToast(e.message || 'Export failed', 'error');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {toast && <span style={{ fontSize: '0.7rem', color: toast.type === 'error' ? 'red' : 'green' }}>{toast.msg}</span>}
      <button onClick={() => handleExport('excel')} disabled={!!exporting} style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 4, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#15803d', cursor: exporting ? 'not-allowed' : 'pointer' }}>Excel</button>
      <button onClick={() => handleExport('pdf')} disabled={!!exporting} style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 4, border: '1px solid #fecdd3', background: '#fff1f2', color: '#be123c', cursor: exporting ? 'not-allowed' : 'pointer' }}>PDF</button>
    </div>
  );
}

export default function BalanceSheet() {
  const { hasExportRight } = useAuth();

  /* ── Filter state ──────────────────────────────────────────────── */
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  /* ── Dropdown options ──────────────────────────────────────────── */
  const [filterOptions, setFilterOptions] = useState({
    periods:        [],
    currencies:     ['AED', 'USD', 'SAR', 'QAR', 'OMR'],
    legalGroups:    ['All'],
    legalEntities:  ['All'],
    parentDivisions:['All'],
    subdivisions:   ['All'],
    ledgers:        ['All'],
  });

  /* ── Data state ────────────────────────────────────────────────── */
  const [summaryData,        setSummaryData]        = useState(null);
  const [compareSummaryData, setCompareSummaryData] = useState(null);
  const [subdivisionData,    setSubdivisionData]    = useState(null);
  const [trendData,          setTrendData]          = useState(null);
  const [trend6MonthData,    setTrend6MonthData]    = useState(null);
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
    filters: true,
    summary: false,
    compareSummary: false,
    subdivision: false,
    trend: false,
    reconciliation: false,
  });
  const [errors, setErrors] = useState({});

  /* ── Toast ─────────────────────────────────────────────────────── */
  const [toast, setToast] = useState(null);
  // FIX M4: memoize showToast so it is stable across renders
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ── ViewAll modal ─────────────────────────────────────────────── */
  // 'statement' | 'subdivision' | 'trend' | 'reconciliation' | null
  const [openModal, setOpenModal] = useState(null);
  const closeModal = useCallback(() => setOpenModal(null), []);

  /* ── Export ────────────────────────────────────────────────────── */
  const [exporting, setExporting] = useState(null);
  // FIX M5: memoize handleExport so KebabMenu items don't change reference every render
  const handleExport = useCallback((format, section = 'summary') => {
    if (exporting) return;
    setExporting(`${section}-${format}`);
    exportBS(format, section, appliedFilters)
      .then(() => showToast(`${format.toUpperCase()} export downloaded successfully.`, 'success'))
      .catch(err => showToast(`Export failed: ${err?.message || 'Unknown error'}. Please try again.`, 'error'))
      .finally(() => setExporting(null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exporting, appliedFilters, showToast]);

  /* ── Load filter options (supports cascading) ─────────────────── */
  const loadFilterOptions = useCallback(async (currentFilters = {}) => {
    setLoading(prev => ({ ...prev, filters: true }));
    try {
      const data = await fetchBSFilters(currentFilters);
      const periods = data?.periods || [];
      setFilterOptions(prev => ({
        ...prev,
        periods: periods.length ? periods : prev.periods,
        currencies:     ['AED', 'USD', 'SAR', 'QAR', 'OMR'],
        legalGroups:    data?.legal_groups || prev.legalGroups || [],
        legalEntities:  data?.legal_entities || [],
        parentDivisions:data?.parent_divisions || [],
        subdivisions:   data?.subdivisions || [],
        ledgers:        ['All', ...(data?.ledgers || []).filter(l => l && l !== 'All')],
      }));
      // Auto-select first period on initial load
      if (periods.length && !currentFilters.isCascade) {
        const first  = (periods[0] && typeof periods[0] === 'object' ? periods[0].period : periods[0]) || '';
        const second = (periods[1] && typeof periods[1] === 'object' ? periods[1].period : periods[1]) || '';
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

  /* ── Cascading filter options on hierarchy change ──────────────── */
  const hierarchyKey = useMemo(
    () => JSON.stringify({
      lg: filters.legalGroup,
      le: filters.legalEntity,
      pd: filters.parentDivision,
    }),
    [filters.legalGroup, filters.legalEntity, filters.parentDivision]
  );

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadFilterOptions();
      return;
    }
    loadFilterOptions({
      legalGroup: filters.legalGroup,
      legalEntity: filters.legalEntity,
      parentDivision: filters.parentDivision,
      isCascade: true,
    });
  }, [hierarchyKey, loadFilterOptions]);

  /* ── Fetch all data ────────────────────────────────────────────── */
  const fetchAll = useCallback((f) => {
    if (!f.period || !f.currency) return;

    const hasCompare = Boolean(f.comparePeriod && f.comparePeriod !== f.period);

    setLoading({
      filters: false,
      summary: true,
      compareSummary: hasCompare,
      subdivision: true,
      trend: true,
      reconciliation: true,
    });
    setErrors({});

    const guard = (key, promise) =>
      promise
        .catch(err => { setErrors(prev => ({ ...prev, [key]: err?.message || 'Failed to load data' })); return null; })
        .finally(() => setLoading(prev => ({ ...prev, [key]: false })));

    guard('summary', fetchBSSummary(f)).then(d => { if (d) setSummaryData(d); });

    if (hasCompare) {
      guard('compareSummary', fetchBSSummary({ ...f, period: f.comparePeriod })).then(d => {
        setCompareSummaryData(d || null);
      });
    } else {
      setCompareSummaryData(null);
    }

    guard('subdivision', fetchBSSubDivision(f)).then(d => { if (d) setSubdivisionData(d); });
    guard('trend', fetchBS6MonthTrend(f, filterOptions.periods)).then(d => {
      if (d) {
        setTrend6MonthData(d);
        setTrendData(d.series);
      }
    });
    guard('reconciliation', fetchBSReconciliation({ currency: f.currency })).then(d => {
      if (d) setReconciliationRows(Array.isArray(d) ? d : []);
    });
  }, [filterOptions.periods]);

  /* ── Trigger fetch when applied filters change ─────────────────── */
  // FIX M2/C3: depend on a stable serialised key of the full applied filter set so
  // changes to any filter field (entity, ledger, comparePeriod) also trigger a
  // reload. We do NOT call fetchAll inside handleApply to avoid double-fetching.
  const appliedKey = useMemo(
    () => JSON.stringify(appliedFilters),
    [appliedFilters],
  );
  useEffect(() => {
    if (appliedFilters.period) fetchAll(appliedFilters);
    // appliedKey is the stable serialised version of appliedFilters — safe single dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedKey]);

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
  // FIX M2: removed redundant fetchAll() call — the useEffect above handles it
  // when appliedFilters changes, preventing a double API request.
  const handleApply = useCallback(() => { setAppliedFilters({ ...filters }); }, [filters]);
  const handleReset = useCallback(() => {
    const reset = { ...DEFAULT_FILTERS, period: (filterOptions.periods[0] && typeof filterOptions.periods[0] === 'object' ? filterOptions.periods[0].period : filterOptions.periods[0]) || '', comparePeriod: (filterOptions.periods[1] && typeof filterOptions.periods[1] === 'object' ? filterOptions.periods[1].period : filterOptions.periods[1]) || '', currency: 'AED' };
    setFilters(reset); setAppliedFilters(reset);
  }, [filterOptions.periods]);

  /* ── Derived values ────────────────────────────────────────────── */
  const currency    = appliedFilters.currency || 'AED';
  const getPeriodLabel = (val) => {
    const p = filterOptions.periods.find(x => (typeof x === 'object' ? x.period : x) === val);
    return typeof p === 'object' ? p.period_name : (formatPeriod(p || val) || val);
  };
  const periodLabel = getPeriodLabel(appliedFilters.period) || '—';
  const comparePeriodFormatted = appliedFilters.comparePeriod ? getPeriodLabel(appliedFilters.comparePeriod) : '';
  const compareLbl  = comparePeriodFormatted ? `vs ${comparePeriodFormatted}` : '';

  // Current & Compare metrics extraction
  const currentMetrics = useMemo(() => extractBSMetrics(summaryData), [summaryData]);
  const compareMetrics = useMemo(() => extractBSMetrics(compareSummaryData), [compareSummaryData]);
  const kpiTotals = currentMetrics; // preserve compatibility with statement view & inline insights

  const hasCompareData = Boolean(appliedFilters.comparePeriod && appliedFilters.comparePeriod !== appliedFilters.period && compareSummaryData);

  const statementData = useMemo(() => {
    return buildStatementData(summaryData, hasCompareData ? compareSummaryData : null);
  }, [summaryData, compareSummaryData, hasCompareData]);

  const movements = useMemo(() => {
    if (!hasCompareData) {
      return {
        assets: null,
        liabilities: null,
        equity: null,
        debtToEquity: null,
        liabilityToEquity: null,
      };
    }
    return {
      assets:            calcMovement(currentMetrics.totalAssets, compareMetrics.totalAssets),
      liabilities:       calcMovement(currentMetrics.totalLiabilities, compareMetrics.totalLiabilities),
      equity:            calcMovement(currentMetrics.totalEquity, compareMetrics.totalEquity),
      debtToEquity:      calcMovement(currentMetrics.debtToEquity, compareMetrics.debtToEquity),
      liabilityToEquity: calcMovement(currentMetrics.liabilityToEquity, compareMetrics.liabilityToEquity),
    };
  }, [hasCompareData, currentMetrics, compareMetrics]);

  /* ── Trend chart data ──────────────────────────────────────────── */
  const _rawTrendData = Array.isArray(trendData) ? trendData : (trendData?.series || trendData?.data || []);
  const trendSeries = _rawTrendData.map(p => ({
    period:   p.period_name || p.period_code || p.period || 'Unknown',
    balance:  Math.abs(p.total_balance ?? p.balance_amount ?? p.balance ?? 0),
    mom_pct:  p.mom_pct ?? p.period_pct ?? p.variance_pct ?? 0,
  }));

  /* ── Sub-division table rows ───────────────────────────────────── */
  const subdivRows = Array.isArray(subdivisionData) ? subdivisionData : (subdivisionData?.data || []);

  /* ── Kebab menu items ──────────────────────────────────────────── */
  // FIX M6: memoize menu item arrays — prevents KebabMenu re-renders on every keystroke
  const summaryMenuItems = useMemo(() => [
    { icon: '🔎', label: 'View All',    action: () => setOpenModal('statement')  },
    { icon: '📊', label: 'Export Excel', action: () => handleExport('excel', 'summary') },
    { icon: '📄', label: 'Export PDF',   action: () => handleExport('pdf',   'summary') },
  ], [handleExport]);
  const subdivMenuItems = useMemo(() => [
    { icon: '🔎', label: 'View All',    action: () => setOpenModal('subdivision') },
    { icon: '📊', label: 'Export Excel', action: () => handleExport('excel', 'subdivision') },
    { icon: '📄', label: 'Export PDF',   action: () => handleExport('pdf',   'subdivision') },
  ], [handleExport]);
  const trendMenuItems  = useMemo(() => [
    { icon: '🔎', label: 'View All',     action: () => setOpenModal('trend') },
    { icon: '📊', label: 'Export Excel', action: () => exportTrendToExcel(trend6MonthData?.series || [], currency, appliedFilters) },
    { icon: '📄', label: 'Export PDF',   action: () => exportTrendToPDF(trend6MonthData?.series || [], currency, appliedFilters) },
  ], [trend6MonthData, currency, appliedFilters]);
  const compositionMenuItems = useMemo(() => [
    { icon: '🔎', label: 'View All',     action: () => setOpenModal('composition') },
    { icon: '📊', label: 'Export Excel', action: () => exportCompositionToExcel(statementData, currency, appliedFilters) },
    { icon: '📄', label: 'Export PDF',   action: () => exportCompositionToPDF(statementData, currency, appliedFilters) },
  ], [statementData, currency, appliedFilters]);
  const reconMenuItems  = useMemo(() => [{ icon: '🔎', label: 'View All', action: () => setOpenModal('reconciliation') }], []);

  /* ── KPI Card definitions (CFO UAT-1 Revisions) ────────────────── */
  const kpiCards = [
    {
      id: 'total-assets',
      label: 'Total Assets',
      value: loading.summary ? '—' : fmtKPI(currentMetrics.totalAssets, currency),
      subValue: periodLabel,
      changePct: movements.assets,
      compareLabel: compareLbl,
      color: '#2563eb', iconBg: '#eff6ff',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
    },
    {
      id: 'total-liabilities',
      label: 'Total Liabilities',
      value: loading.summary ? '—' : fmtKPI(currentMetrics.totalLiabilities, currency),
      subValue: periodLabel,
      changePct: movements.liabilities,
      compareLabel: compareLbl,
      color: '#ea580c', iconBg: '#fff7ed',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    },
    {
      id: 'total-equity',
      label: 'Total Equity',
      value: loading.summary ? '—' : fmtKPI(currentMetrics.totalEquity, currency),
      subValue: periodLabel,
      changePct: movements.equity,
      compareLabel: compareLbl,
      color: '#9333ea', iconBg: '#faf5ff',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/></svg>,
    },
    {
      id: 'debt-to-equity',
      label: 'Debt-to-Equity Ratio',
      value: loading.summary ? '—' : (currentMetrics.debtToEquity !== null ? `${currentMetrics.debtToEquity.toFixed(2)}x` : '—'),
      subValue: loading.summary ? null : (currentMetrics.totalDebt > 0 ? `Debt: ${fmtKPI(currentMetrics.totalDebt, currency)}` : 'Bank Debt: 0'),
      changePct: movements.debtToEquity,
      compareLabel: compareLbl,
      color: '#0284c7', iconBg: '#f0f9ff',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></svg>,
    },
    {
      id: 'liability-to-equity',
      label: 'Liability-to-Equity Ratio',
      value: loading.summary ? '—' : (currentMetrics.liabilityToEquity !== null ? `${currentMetrics.liabilityToEquity.toFixed(2)}x` : '—'),
      subValue: loading.summary ? null : `Liab: ${fmtKPI(currentMetrics.totalLiabilities, currency)}`,
      changePct: movements.liabilityToEquity,
      compareLabel: compareLbl,
      color: '#0d9488', iconBg: '#f0fdfa',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>,
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
        @media (max-width: 1200px) { .bs-kpi-grid { grid-template-columns: repeat(3, 1fr) !important; } .bs-statement-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 900px) { .bs-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .bs-kpi-grid { grid-template-columns: 1fr !important; } .bs-chart-grid { grid-template-columns: 1fr !important; } .bs-recon-row { flex-wrap: wrap !important; } }
      `}</style>

      {/* FIX C4: visible amber banner when backend is unavailable and mock data is active */}
      <DemoModeBanner />
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
        subtitle={`Period: ${periodLabel} ${hasCompareData ? `vs ${comparePeriodFormatted}` : ''} | Currency: ${currency}`}
      >
        <StatementViewAll
          summaryData={summaryData}
          compareSummaryData={hasCompareData ? compareSummaryData : null}
          currency={currency}
          periodLabel={periodLabel}
          comparePeriodLabel={comparePeriodFormatted}
          onDrilldown={handleDrilldown}
        />
      </ViewAllModal>

      <ViewAllModal isOpen={openModal === 'subdivision'} onClose={closeModal}
        title="Balance Sheet by Sub-Division"
        subtitle={`Period: ${periodLabel} | ${subdivisionData?.pagination?.total_subdivisions ?? '—'} sub-divisions`}
      >
        <SubDivisionViewAll data={subdivisionData} currency={currency} />
      </ViewAllModal>

      <ViewAllModal isOpen={openModal === 'trend'} onClose={closeModal}
        title="Assets vs Liabilities vs Equity Trend (Previous 6 Months)"
        subtitle={`Currency: ${currency} | Periods: ${trend6MonthData?.startPeriod || '—'} → ${trend6MonthData?.endPeriod || '—'}`}
      >
        <TrendViewAll
          trendData={trend6MonthData}
          currency={currency}
          filterOptions={filterOptions}
          appliedFilters={appliedFilters}
          onApplyFilters={(f) => {
            setAppliedFilters(prev => ({ ...prev, ...f }));
            fetchAll({ ...appliedFilters, ...f });
          }}
          loading={loading.trend}
        />
      </ViewAllModal>

      <ViewAllModal isOpen={openModal === 'composition'} onClose={closeModal}
        title="Balance Sheet Composition Analysis"
        subtitle={`Asset Composition and Liabilities & Equity Breakdown | Period: ${periodLabel} | Currency: ${currency}`}
      >
        <CompositionViewAll
          statementData={statementData}
          currency={currency}
          periodLabel={periodLabel}
          comparePeriodLabel={comparePeriodFormatted}
          hasCompare={hasCompareData}
          filterOptions={filterOptions}
          appliedFilters={appliedFilters}
          onApplyFilters={(f) => {
            setAppliedFilters(prev => ({ ...prev, ...f }));
            fetchAll({ ...appliedFilters, ...f });
          }}
          loading={loading.summary}
        />
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

      {/* ══ FILTER BAR (CFO UAT-1 Revisions) ══ */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap', overflow: 'visible' }}>
        {/* 1. Legal Group (Multi-select) */}
        <FilterField label="Legal Group">
          <MultiSelect
            options={filterOptions.legalGroups}
            value={filters.legalGroup}
            onChange={v => { setFilters(prev => ({ ...prev, legalGroup: v, legalEntity: [], parentDivision: [], subdivision: [] })); }}
            style={{ width: 110, minWidth: 110 }}
          />
        </FilterField>

        {/* 2. Legal Entity (Multi-select) */}
        <FilterField label="Legal Entity">
          <MultiSelect
            options={filterOptions.legalEntities}
            value={filters.legalEntity}
            onChange={v => setFilters(prev => ({ ...prev, legalEntity: v, parentDivision: [], subdivision: [] }))}
            style={{ width: 120, minWidth: 120 }}
          />
        </FilterField>

        {/* 3. Parent Division (Multi-select) */}
        <FilterField label="Parent Division">
          <MultiSelect
            options={filterOptions.parentDivisions}
            value={filters.parentDivision}
            onChange={v => setFilters(prev => ({ ...prev, parentDivision: v, subdivision: [] }))}
            style={{ width: 120, minWidth: 120 }}
          />
        </FilterField>

        {/* 4. Sub-Division (Multi-select) */}
        <FilterField label="Sub-Division">
          <MultiSelect
            options={filterOptions.subdivisions}
            value={filters.subdivision}
            onChange={v => setFilters(prev => ({ ...prev, subdivision: v }))}
            style={{ width: 120, minWidth: 120 }}
          />
        </FilterField>

        {/* 5. As on Date */}
        <FilterField label="As on Date">
          <select
            id="filter-bs-period"
            style={{ ...selStyle, width: 105, minWidth: 105 }}
            value={filters.period}
            onChange={e => setFilters(prev => ({ ...prev, period: e.target.value }))}
            disabled={loading.filters}
          >
            {filterOptions.periods.length === 0 && <option value="">Loading…</option>}
            {filterOptions.periods.map(p => {
              const val = typeof p === 'object' ? p.period : p;
              const label = typeof p === 'object' ? p.period_name : formatPeriod(val);
              return <option key={val} value={val}>{label}</option>;
            })}
          </select>
        </FilterField>

        {/* 6. Compare With */}
        <FilterField label="Compare With">
          <select
            id="filter-bs-compare"
            style={{ ...selStyle, width: 105, minWidth: 105 }}
            value={filters.comparePeriod}
            onChange={e => setFilters(prev => ({ ...prev, comparePeriod: e.target.value }))}
            disabled={loading.filters}
          >
            <option value="">None</option>
            {filterOptions.periods.map(p => {
              const val = typeof p === 'object' ? p.period : p;
              const label = typeof p === 'object' ? p.period_name : formatPeriod(val);
              return <option key={val} value={val}>{label}</option>;
            })}
          </select>
        </FilterField>

        {/* 7. Reporting Currency */}
        <FilterField label="Reporting Currency">
          <select
            id="filter-bs-currency"
            style={{ ...selStyle, width: 95, minWidth: 95 }}
            value={filters.currency}
            onChange={e => setFilters(prev => ({ ...prev, currency: e.target.value }))}
          >
            {filterOptions.currencies.map(c => <option key={c}>{c}</option>)}
          </select>
        </FilterField>

        {/* Apply & Reset */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>Key Performance Indicators</span>
            {hasExportRight("BALANCE_SHEET") && <ExportButtons endpoint="summary" filters={appliedFilters} />}
          </div>
          {/* Balance status badge */}
          {!loading.summary && summaryData && (
            <BalanceBadge
              status={summaryData.status}
              variance={summaryData.grand_total}
              currency={currency}
            />
          )}
        </div>
        {/* 5-column responsive KPI grid */}
        <div className="bs-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {kpiCards.map(kpi => (
            <KPICard
              key={kpi.id}
              {...kpi}
              loading={loading.summary || loading.compareSummary}
              error={errors.summary}
            />
          ))}
        </div>
      </div>

      {/* ══ CHARTS ROW: Trend | Assets Composition | Liabilities Composition ══ */}
      {/* FIX m5: bs-chart-grid responsive class applied via media-query above */}
      {(() => {
        /* ── Shared DonutCard renderer ── */
        const DonutCard = ({ title, subtitle, segments, total, totalLabel, isLoading, menuItems, onViewAll }) => {
          const chartKey = `donut-${segments.length}-${Math.round(total)}`;
          return (
            <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>{title}</div>
                  <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 1 }}>{subtitle}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {onViewAll && (
                    <button
                      onClick={onViewAll}
                      style={{
                        fontSize: '0.66rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff',
                        border: '1px solid #bfdbfe', borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s'
                      }}
                      title={`Open ${title} detailed breakdown`}
                    >
                      <span>🔎</span> View All
                    </button>
                  )}
                  {menuItems && <KebabMenu id={`menu-bs-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} items={menuItems} />}
                </div>
              </div>

              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
                  {[...Array(4)].map((_, i) => <Skeleton key={i} h={22} />)}
                </div>
              ) : total === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '0.78rem' }}>
                  No data available
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative', height: 165 }}>
                    <ResponsiveContainer key={chartKey} width="100%" height={165}>
                      <PieChart>
                        <Pie
                          data={segments}
                          cx="50%" cy="50%"
                          innerRadius={48} outerRadius={68}
                          dataKey="value"
                          paddingAngle={3}
                          startAngle={90} endAngle={-270}
                          isAnimationActive={true}
                          animationDuration={800}
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
                      <div style={{ fontSize: '0.56rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase' }}>{totalLabel || 'Total'}</div>
                      <div style={{ fontSize: '0.80rem', fontWeight: 900, color: C.navy }}>{fmtKPI(total, currency)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {segments.map(d => {
                      const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0';
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

        const totAssets = statementData?.totalAssets?.current || 0;
        const ncAssets = statementData?.nonCurrentAssets?.totalCurrent || 0;
        const cAssets = statementData?.currentAssets?.totalCurrent || 0;
        const assetSegments = [
          { name: 'Non-current Assets', value: ncAssets, color: '#3b82f6' },
          { name: 'Current Assets', value: cAssets, color: '#06b6d4' },
        ];

        const totEqLiab = statementData?.totalEqLiab?.current || 0;
        const eqAmt = statementData?.equity?.totalCurrent || 0;
        const ncLiabAmt = statementData?.nonCurrentLiab?.totalCurrent || 0;
        const cLiabAmt = statementData?.currentLiab?.totalCurrent || 0;
        const liabEqSegments = [
          { name: 'Equity', value: eqAmt, color: '#10b981' },
          { name: 'Non-current Liabilities', value: ncLiabAmt, color: '#8b5cf6' },
          { name: 'Current Liabilities', value: cLiabAmt, color: '#f59e0b' },
        ];

        const trendList = trend6MonthData?.series || [];
        const latestPoint = trendList.length > 0 ? trendList[trendList.length - 1] : null;

        return (
          <div className="bs-chart-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 14 }}>

            {/* ── Balance Sheet Trend (Assets vs Liabilities vs Equity - Previous 6 Months) ── */}
            <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: C.navy }}>Assets vs Liabilities vs Equity Trend</div>
                  <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: 1 }}>
                    Previous 6 Months ({trend6MonthData?.startPeriod || '—'} → {trend6MonthData?.endPeriod || '—'}) | {currency}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setOpenModal('trend')}
                    style={{
                      fontSize: '0.66rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff',
                      border: '1px solid #bfdbfe', borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s'
                    }}
                    title="Open detailed 6-month trend view with full table and filters"
                  >
                    <span>🔎</span> View All
                  </button>
                  <KebabMenu id="menu-bs-trend" items={trendMenuItems} />
                </div>
              </div>

              {errors.trend ? (
                <ErrorBanner message={errors.trend} onRetry={() => fetchAll(appliedFilters)} />
              ) : loading.trend ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
                  {[...Array(5)].map((_, i) => <Skeleton key={i} h={20} />)}
                </div>
              ) : trendList.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: '0.78rem' }}>
                  No trend data available
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 6, paddingLeft: 4, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.66rem', fontWeight: 600, color: C.slate }}>
                      <div style={{ width: 14, height: 3, borderRadius: 1.5, background: '#4f46e5' }} />
                      Total Assets
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.66rem', fontWeight: 600, color: C.slate }}>
                      <div style={{ width: 14, height: 3, borderRadius: 1.5, background: '#be123c' }} />
                      Total Liabilities
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.66rem', fontWeight: 600, color: C.slate }}>
                      <div style={{ width: 14, height: 3, borderRadius: 1.5, background: '#15803d' }} />
                      Total Equity
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={170}>
                    <LineChart data={trendList} margin={{ top: 5, right: 14, left: -14, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={fmtAxisNum} width={48} />
                      <Tooltip content={<ChartTooltip currency={currency} />} />
                      <Line type="monotone" dataKey="totalAssets" name="Total Assets" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3, fill: '#4f46e5' }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="totalLiabilities" name="Total Liabilities" stroke="#be123c" strokeWidth={2.5} dot={{ r: 3, fill: '#be123c' }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="totalEquity" name="Total Equity" stroke="#15803d" strokeWidth={2.5} dot={{ r: 3, fill: '#15803d' }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8, padding: '8px 10px', background: '#f8fafc', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase' }}>Assets (6M Δ)</div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4f46e5' }}>
                        {latestPoint ? fmtKPI(latestPoint.totalAssets, currency) : '—'}
                      </div>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: (trend6MonthData?.summary?.assetsChange ?? 0) >= 0 ? C.green : C.rose }}>
                        {trend6MonthData?.summary?.assetsPct != null ? `${trend6MonthData.summary.assetsPct >= 0 ? '+' : ''}${trend6MonthData.summary.assetsPct.toFixed(1)}%` : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase' }}>Liabilities (6M Δ)</div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#be123c' }}>
                        {latestPoint ? fmtKPI(latestPoint.totalLiabilities, currency) : '—'}
                      </div>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: (trend6MonthData?.summary?.liabChange ?? 0) <= 0 ? C.green : C.rose }}>
                        {trend6MonthData?.summary?.liabPct != null ? `${trend6MonthData.summary.liabPct >= 0 ? '+' : ''}${trend6MonthData.summary.liabPct.toFixed(1)}%` : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: C.muted, fontWeight: 700, textTransform: 'uppercase' }}>Equity (6M Δ)</div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803d' }}>
                        {latestPoint ? fmtKPI(latestPoint.totalEquity, currency) : '—'}
                      </div>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: (trend6MonthData?.summary?.equityChange ?? 0) >= 0 ? C.green : C.rose }}>
                        {trend6MonthData?.summary?.equityPct != null ? `${trend6MonthData.summary.equityPct >= 0 ? '+' : ''}${trend6MonthData.summary.equityPct.toFixed(1)}%` : '—'}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Asset Composition (Non-current vs Current Assets) ── */}
            <DonutCard
              title="Asset Composition"
              subtitle={`Application of Funds — ${currency}`}
              segments={assetSegments}
              total={totAssets}
              totalLabel="Total Assets"
              isLoading={loading.summary}
              menuItems={compositionMenuItems}
              onViewAll={() => setOpenModal('composition')}
            />

            {/* ── Liabilities & Equity Composition (Equity vs Non-current vs Current Liabilities) ── */}
            <DonutCard
              title="Liabilities & Equity Composition"
              subtitle={`Sources of Funds — ${currency}`}
              segments={liabEqSegments}
              total={totEqLiab}
              totalLabel="Total Liab & Eq"
              isLoading={loading.summary}
              menuItems={compositionMenuItems}
              onViewAll={() => setOpenModal('composition')}
            />
          </div>
        );
      })()}

      {/* == BALANCE SHEET STATEMENT (inline 3-column card layout matching sample) == */}
      {(loading.summary || summaryData?.sections?.length > 0) && (
        <div style={{ marginBottom: 20 }}>
          {/* Header Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            padding: '10px 16px',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: C.navy }}>Balance Sheet Statement</span>
              <span style={{ fontSize: '0.72rem', color: C.slate }}>
                Period: {periodLabel} {hasCompareData ? 'vs ' + comparePeriodFormatted : ''} | Currency: {currency}
              </span>
              {summaryData?.status && (
                <span style={{
                  padding: '2px 8px', borderRadius: 8, fontSize: '0.66rem', fontWeight: 700,
                  background: summaryData.status === 'BALANCED' ? '#dcfce7' : '#ffedd5',
                  color: summaryData.status === 'BALANCED' ? '#15803d' : '#c2410c',
                  border: '1px solid ' + (summaryData.status === 'BALANCED' ? '#bbf7d0' : '#fed7aa'),
                }}>
                  {summaryData.status}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {hasExportRight('BALANCE_SHEET') && <ExportButtons endpoint='summary' filters={appliedFilters} />}
              <button
                onClick={() => setOpenModal('statement')}
                style={{
                  fontSize: '0.72rem',
                  color: C.primary,
                  background: 'none',
                  border: '1px solid ' + C.primary,
                  borderRadius: 6,
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                View All
              </button>
            </div>
          </div>

          <StatementCards
            statementData={statementData}
            currency={currency}
            periodLabel={periodLabel}
            comparePeriodLabel={comparePeriodFormatted}
            hasCompare={Boolean(hasCompareData)}
            onDrilldown={handleDrilldown}
            loading={loading.summary || (Boolean(appliedFilters.comparePeriod) && loading.compareSummary)}
          />
        </div>
      )}

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
            /* bs-recon-row: responsive flex wrap + minWidth 120 (media-query above) */
            <div className="bs-recon-row" style={{ display: 'flex', gap: 8 }}>
              {reconciliationRows.map((row, i) => {
                const isBalanced = row.balance_status === 'BALANCED';
                return (
                  <div key={row.period || i} style={{
                    flex: 1,
                    padding: '9px 14px', borderRadius: 9,
                    background: isBalanced ? '#f0fdf4' : '#fff7ed',
                    border: `1px solid ${isBalanced ? '#d1fae5' : '#fed7aa'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    minWidth: 120,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: C.navy }}>Balance Sheet by Sub-Division</span>
              <span style={{ fontSize: '0.7rem', color: C.slate, marginLeft: 12 }}>
                {subdivisionData?.pagination?.total_subdivisions ?? '-'} sub-divisions &nbsp;|&nbsp; Page {subdivisionData?.pagination?.page ?? 1} of {subdivisionData?.pagination?.total_pages ?? 1}
              </span>
            </div>
            {hasExportRight("BALANCE_SHEET") && <ExportButtons endpoint="subdivision" filters={appliedFilters} />}
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
                  
                  <th style={TH}>Net Balance</th>
                </tr>
              </thead>
              <tbody>
                {subdivRows.map((row, ri) => {
                  const sources = row.section_totals?.['SOURCES OF FUNDS'] ?? 0;
                  const applic  = row.section_totals?.['APPLICATION OF FUNDS'] ?? 0;
                  const net     = row.grand_total ?? row.balance_amount ?? 0;
                  // FIX M9: use stable sub_division_id/code as key (not array index)
                  // FIX M10: net color is sign-based (positive=navy, negative=rose) not threshold-based
                  const netColor = net >= 0 ? C.navy : C.rose;
                  return (
                    <tr
                      key={`${row.sub_division_id ?? row.sub_division_code ?? 'subdiv'}-${ri}`}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...TD_L, fontWeight: 600 }}>{row.sub_division_name}</td>
                      <td style={{ ...TD, fontFamily: 'monospace', fontSize: '0.67rem', color: C.slate }}>{row.sub_division_code}</td>
                      
                      <td style={{ ...TD, fontWeight: 700, color: netColor }}>
                        {fmtNum(Math.abs(net), currency)}
                        {net < 0 && (
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
          {appliedFilters.comparePeriod ? ` | Compared with: ${formatPeriod(appliedFilters.comparePeriod)}` : ''}
        </span>
        <span>☁️ Source: Oracle Fusion Cloud</span>
      </div>

    </div>
  );
}
