import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  fetchFilters,
  fetchDetails,
  fetchLegalEntityDetail,
  fetchParentDivisionDetail,
  fetchSubdivisionDetail,
  fetchSalesmanDetail,
  exportSalesRevenue,
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

const DETAILS_PAGE_SIZE = 50;

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

/* ─── Export Buttons ─────────────────────────────────────────────── */
function ExportButtons({ endpoint, filters, size = 'sm' }) {
  const [exporting, setExporting] = useState(null);

  const handleExport = (format) => {
    setExporting(format);
    try {
      exportSalesRevenue(endpoint, format, filters);
    } catch (e) {
      console.error('Export error:', e);
    }
    setTimeout(() => setExporting(null), 2000);
  };

  const btnBase = {
    display: 'flex', alignItems: 'center', gap: 4,
    border: 'none', borderRadius: 7, cursor: 'pointer',
    fontWeight: 700, transition: 'all 0.15s', outline: 'none',
    fontSize: size === 'sm' ? '0.70rem' : '0.74rem',
    padding: size === 'sm' ? '5px 10px' : '6px 13px',
  };

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        id={`btn-export-excel-${endpoint}`}
        onClick={() => handleExport('excel')}
        disabled={exporting === 'excel'}
        title="Export to Excel"
        style={{
          ...btnBase,
          background: exporting === 'excel' ? '#d1fae5' : '#f0fdf4',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          opacity: exporting === 'excel' ? 0.7 : 1,
        }}
      >
        {exporting === 'excel' ? '⏳' : '📊'} Excel
      </button>
      <button
        id={`btn-export-pdf-${endpoint}`}
        onClick={() => handleExport('pdf')}
        disabled={exporting === 'pdf'}
        title="Export to PDF"
        style={{
          ...btnBase,
          background: exporting === 'pdf' ? '#fee2e2' : '#fff1f2',
          color: '#be123c',
          border: '1px solid #fecdd3',
          opacity: exporting === 'pdf' ? 0.7 : 1,
        }}
      >
        {exporting === 'pdf' ? '⏳' : '📄'} PDF
      </button>
    </div>
  );
}

/* ─── View-All Button ────────────────────────────────────────────── */
function ViewAllButton({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'rgba(37, 99, 235, 0.06)' : 'none',
        border: 'none',
        color: C.blue,
        fontSize: '0.72rem',
        fontWeight: 700,
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: 6,
        transition: 'all 0.18s',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        outline: 'none',
      }}
    >
      🔎 View All
    </button>
  );
}

/* ─── Modal Close Button ─────────────────────────────────────────── */
function ModalCloseButton({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? '#f1f5f9' : 'none',
        border: 'none',
        fontSize: '0.85rem',
        color: C.slate,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        transition: 'all 0.15s',
        outline: 'none',
      }}
      title="Close"
    >
      ✕
    </button>
  );
}

/* ─── Detail API Modal ───────────────────────────────────────────── */
/**
 * A View-All modal that fetches from a backend detail API on open,
 * then renders all rows dynamically from the response.
 * Includes Excel & PDF export buttons.
 */
function DetailApiModal({
  isOpen,
  onClose,
  title,
  endpoint,
  fetchFn,
  columnDefs,    // [{ label, key, align, fmt }]
  filters,
  searchPlaceholder = 'Search...',
}) {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [searchTerm, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setRows([]);
    fetchFn(filters)
      .then(res => setRows(res?.data || []))
      .catch(err => setError(err?.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [isOpen, filters, fetchFn]);

  if (!isOpen) return null;

  const filtered = rows.filter(row =>
    columnDefs.some(col =>
      String(row[col.key] ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.35)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeIn 0.2s ease',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      <div style={{
        background: '#fff', borderRadius: 16,
        width: '92%', maxWidth: 860,
        maxHeight: '82vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        animation: 'scaleUp 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        overflow: 'hidden', border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(90deg,#f8fafc,#fff)',
        }}>
          <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: C.navy }}>
            {title}
          </h3>
          <ModalCloseButton onClick={onClose} />
        </div>

        {/* Search & Export Bar */}
        <div style={{
          padding: '10px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', gap: 10, alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap',
          background: '#fafbfc',
        }}>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid #cbd5e1',
              fontSize: '0.78rem', minWidth: 200, outline: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!loading && rows.length > 0 && (
              <span style={{ fontSize: '0.68rem', color: C.muted, fontWeight: 600 }}>
                {filtered.length} of {rows.length} records
              </span>
            )}
            <ExportButtons endpoint={endpoint} filters={filters} />
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 24 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} h={18} />
              ))}
            </div>
          ) : error ? (
            <div style={{
              margin: '24px 0', padding: '14px 18px',
              background: '#fff1f2', border: '1px solid #fecdd3',
              borderRadius: 10, color: '#be123c', fontSize: '0.8rem',
            }}>
              ⚠ {error}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr>
                  {columnDefs.map((col, i) => (
                    <th key={i} style={{
                      ...TH, padding: '10px 10px',
                      position: 'sticky', top: 0,
                      background: '#fff', zIndex: 2,
                      textAlign: col.align || 'left',
                      borderBottom: '2px solid #e2e8f0',
                    }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((row, idx) => (
                    <tr key={idx} style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#fff' : '#f8fafc',
                      transition: 'background 0.1s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f8fafc'}
                    >
                      {columnDefs.map((col, ci) => (
                        <td key={ci} style={{
                          ...TD, padding: '9px 10px',
                          textAlign: col.align || 'left',
                          fontWeight: ci === 0 ? 600 : 'normal',
                          color: ci === 0 ? C.navy : '#334155',
                        }}>
                          {col.fmt ? col.fmt(row[col.key], row) : (row[col.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columnDefs.length} style={{
                      textAlign: 'center', padding: '36px 0',
                      color: C.muted, fontSize: '0.8rem',
                    }}>
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px', borderTop: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'flex-end',
          background: '#f8fafc',
        }}>
          <button onClick={onClose} style={{
            padding: '6px 18px', background: '#e2e8f0', color: C.slate,
            border: 'none', borderRadius: 8, fontSize: '0.74rem',
            fontWeight: 700, cursor: 'pointer',
          }}>Close</button>
        </div>
      </div>
    </div>
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
              fontWeight: 800, color: C.navy, lineHeight: 1.25,
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
  const text = payload?.value || '';
  // Truncate if extremely long
  const display = text.length > 25 ? text.substring(0, 22) + '...' : text;
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={10} 
        textAnchor="end" 
        fill={C.slate} 
        fontSize={9}
        transform="rotate(-35)"
      >
        {display}
      </text>
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
  padding: '6px 10px', fontSize: '0.58rem', fontWeight: 700, color: C.slate,
  textTransform: 'uppercase', letterSpacing: '0.03em',
  borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
};
const TD_LG = { padding: '5px 10px', fontSize: '0.70rem', color: '#334155' };

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                  */
/* ═══════════════════════════════════════════════════════════════ */

export default function SalesRevenueReport() {
  const navigate = useNavigate();

  /* ── Filter state ─────────────────────────────────────────────── */
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  /* ── Filter options ──────────────────────────────────────────── */
  const [filterOptions, setFilterOptions] = useState({
    legalGroups:    ['All'],
    legalEntities:  ['All'],
    parentDivs:     ['All'],
    subDivs:        ['All'],
    salesmen:       ['All'],
  });

  /* ── Chart / KPI data state ───────────────────────────────────── */
  const [summary,          setSummary]          = useState(null);
  const [trendData,        setTrendData]        = useState([]);
  const [legalEntData,     setLegalEntData]     = useState([]);
  const [parentDivData,    setParentDivData]    = useState([]);
  const [subDivData,       setSubDivData]       = useState([]);
  const [topCustomersData, setTopCustomersData] = useState([]);
  const [bySalesmanData,   setBySalesmanData]   = useState([]);
  const [grossMarginData,  setGrossMarginData]  = useState(null);
  const [activeTab,        setActiveTab]        = useState('all');

  /* ── /details pagination state ────────────────────────────────── */
  const [detailRows,       setDetailRows]       = useState([]);
  const [detailTotalCount, setDetailTotalCount] = useState(0);
  const [detailPage,       setDetailPage]       = useState(0); // 0-indexed

  /* ── View-All modal state ─────────────────────────────────────── */
  const [openModal, setOpenModal] = useState(null); // 'legalEntity' | 'parentDiv' | 'subDiv' | 'salesman'

  /* ── Loading flags ────────────────────────────────────────────── */
  const [loading, setLoading] = useState({
    filters: true, summary: true, trend: true,
    legalEnt: true, parentDiv: true, subDiv: true, details: true,
    topCustomers: true, bySalesman: true, grossMargin: true,
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

  /* ── Formatters ───────────────────────────────────────────────── */
  const fmtCurrency = (v) => v !== null && v !== undefined ? `AED ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';
  const fmtPct = (v) => v !== null && v !== undefined ? `${Number(v).toFixed(2)}%` : '—';
  const fmtTableNum = (v) => v !== null && v !== undefined ? Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—';
  const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  /* ── Auth redirect helper ─────────────────────────────────────── */
  const handle401 = useCallback((err) => {
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

  /* ── Fetch details page ───────────────────────────────────────── */
  const fetchDetailsPage = useCallback((f, page) => {
    setLoading(prev => ({ ...prev, details: true }));
    const offset = page * DETAILS_PAGE_SIZE;
    fetchDetails(f, DETAILS_PAGE_SIZE, offset)
      .then(d => {
        setDetailRows(d?.data || []);
        setDetailTotalCount(d?.total_count ?? 0);
      })
      .catch(err => {
        handle401(err);
        const msg = err?.rawBody
          ? `${err.message} — Backend detail: ${err.rawBody}`
          : err.message || 'Failed to load details';
        setErrors(prev => ({ ...prev, details: msg }));
      })
      .finally(() => setLoading(prev => ({ ...prev, details: false })));
  }, [handle401]);

  /* ── Fetch all data sections when applied filters change ────────── */
  const fetchAll = useCallback((f) => {
    setLoading({
      filters: false, summary: true, trend: false, legalEnt: true,
      parentDiv: true, subDiv: true, details: true,
      topCustomers: true, bySalesman: true, grossMargin: false
    });
    setErrors({});
    setDetailPage(0);
    setTrendData([]); // Unused
    setGrossMarginData(null); // Unused

    const guard = (key, promise) =>
      promise
        .catch(err => {
          handle401(err);
          const msg = err?.rawBody
            ? `${err.message} — Backend detail: ${err.rawBody}`
            : err.message || 'Failed to load data';
          setErrors(prev => ({ ...prev, [key]: msg }));
          return null;
        })
        .finally(() => setLoading(prev => ({ ...prev, [key]: false })));

    // 1. Legal Entity
    guard('legalEnt', fetchLegalEntityDetail(f)).then(d => {
      if (!d || !d.data) return;
      const arr = d.data;
      
      const totalYTD = arr.reduce((acc, r) => acc + (Number(r.sales_aed) || 0), 0);
      
      // Group by legal_entity to avoid duplicate keys in charts
      const grouped = {};
      const pctMap = {};
      arr.forEach(row => {
        const name = row.legal_entity || 'Unknown';
        grouped[name] = (grouped[name] || 0) + (Number(row.sales_aed) || 0);
        // Note: Percentage is pre-calculated by backend, but if multiple rows exist, we might just sum it or take the first.
        // Assuming the backend grouped it for us and duplicates are rare, we just take the first we see.
        if (pctMap[name] === undefined) pctMap[name] = Number(row.percentage) || 0;
      });

      const chartData = Object.keys(grouped)
        .map(name => ({ name, value: grouped[name], pct: pctMap[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Limit to top 10 to prevent chart overlapping

      const topLE = chartData.length > 0 ? chartData[0] : null;

      setSummary(prev => ({
        ...prev,
        ytd_revenue: totalYTD, // Assuming all data fetched represents the filtered period
        top_legal_entity: topLE,
      }));
      setLoading(p => ({ ...p, summary: false }));

      setLegalEntData(chartData.map((item, i) => ({
        ...item,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })));
    });

    // 2. Parent Division
    guard('parentDiv', fetchParentDivisionDetail(f)).then(d => {
      if (!d || !d.data) return;
      const arr = d.data;
      
      const grouped = {};
      const pctMap = {};
      arr.forEach(row => {
        const name = row.parent_division || row.division_name || row.division_code || 'Unknown';
        grouped[name] = (grouped[name] || 0) + (Number(row.sales_aed) || 0);
        if (pctMap[name] === undefined) pctMap[name] = Number(row.percentage) || 0;
      });

      const chartData = Object.keys(grouped)
        .map(name => ({ name, value: grouped[name], pct: pctMap[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15); // Limit to top 15 to prevent overlap

      const topPD = chartData.length > 0 ? chartData[0] : null;
      setSummary(prev => ({ ...prev, top_parent_division: topPD }));
      setParentDivData(chartData);
    });

    // 3. Sub-Division
    guard('subDiv', fetchSubdivisionDetail(f)).then(d => {
      if (!d || !d.data) return;
      const grouped = {};
      const pctMap = {};
      d.data.forEach(row => {
        const name = (row.subdivision || row.subdivision_name || row.subdivision_code || 'Unknown').replace(/\s/g, '\n');
        grouped[name] = (grouped[name] || 0) + (Number(row.sales_aed) || 0);
        if (pctMap[name] === undefined) pctMap[name] = Number(row.percentage) || 0;
      });

      const chartData = Object.keys(grouped)
        .map(name => ({ name, value: grouped[name], pct: pctMap[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15); // Limit to top 15 to prevent overlap

      setSubDivData(chartData.map((item, i) => ({
        ...item,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })));
    });

    // 4. Salesman
    guard('bySalesman', fetchSalesmanDetail(f)).then(d => {
      if (!d || !d.data) return;
      const grouped = {};
      const pctMap = {};
      const targets = {};
      d.data.forEach(row => {
        const name = row.sales_person || 'Unknown';
        grouped[name] = (grouped[name] || 0) + (Number(row.sales_aed) || 0);
        targets[name] = (targets[name] || 0) + (Number(row.target) || 0);
        if (pctMap[name] === undefined) pctMap[name] = Number(row.percentage) || 0;
      });

      const chartData = Object.keys(grouped)
        .filter(name => name !== 'Unknown' && name !== '')
        .map(name => ({ name, value: grouped[name], pct: pctMap[name], target: targets[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15); // Limit to top 15 to prevent overlap

      setBySalesmanData(chartData);
    });

    // 5. Details (page 0) & Top Customers aggregation
    guard('details', fetchDetails(f, DETAILS_PAGE_SIZE, 0)).then(d => {
      if (!d || !d.data) return;
      setDetailRows(d.data);
      setDetailTotalCount(d.total_count || d.total || d.count || d.data.length);
      
      // Compute pseudo top customers from current details page
      const custMap = {};
      d.data.forEach(row => {
        const name = row.customer_name || 'Unknown';
        custMap[name] = (custMap[name] || 0) + (Number(row.sales_aed) || Number(row.amount) || Number(row.base_amount) || 0);
      });
      const topCust = Object.keys(custMap)
        .map(name => ({ name, value: custMap[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      setTopCustomersData(topCust);
      setLoading(p => ({ ...p, topCustomers: false }));
    });
  }, [handle401]);

  useEffect(() => { fetchAll(appliedFilters); }, [appliedFilters, fetchAll]);

  /* ── When page changes, re-fetch details only ─────────────────── */
  const prevPageRef = useRef(0);
  useEffect(() => {
    if (detailPage === prevPageRef.current) return;
    prevPageRef.current = detailPage;
    fetchDetailsPage(appliedFilters, detailPage);
  }, [detailPage, appliedFilters, fetchDetailsPage]);

  /* ── Filter handlers ──────────────────────────────────────────── */
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
  const dataAsOf      = summary?.data_as_of
    ? new Date(summary.data_as_of).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : appliedFilters.toDate;
  const topSalesmanRecord = bySalesmanData && bySalesmanData.length > 0
    ? [...bySalesmanData].sort((a, b) => b.value - a.value)[0]
    : null;

  /* ── Spark data from trend ────────────────────────────────────── */
  const sparkMTD = trendData.map(d => d.currentYear).filter(Boolean);
  const sparkYTD = trendData.map(d => d.previousYear).filter(Boolean);

  /* ── Year labels ─────────────────────────────────────────────── */
  const currentYearLabel  = summary?.current_year_label  || 'Current Year';
  const previousYearLabel = summary?.previous_year_label || 'Previous Year';

  /* ── Details pagination derived ───────────────────────────────── */
  const totalPages   = Math.max(1, Math.ceil(detailTotalCount / DETAILS_PAGE_SIZE));
  const pageStart    = detailPage * DETAILS_PAGE_SIZE + 1;
  const pageEnd      = Math.min((detailPage + 1) * DETAILS_PAGE_SIZE, detailTotalCount);

  /* ── Column definitions for View-All modals ──────────────────── */
  const legalEntityCols = [
    { label: 'Legal Entity',       key: 'legal_entity',       align: 'left'  },
    { label: 'Sales (AED)',        key: 'sales_aed',          align: 'right', fmt: fmtCurrency },
    { label: 'Percentage',         key: 'percentage',         align: 'right', fmt: v => fmtPct(v) },
    { label: '# Transactions',     key: 'transaction_count',  align: 'right' },
    { label: 'Currency',           key: 'currency',           align: 'center' },
  ];

  const parentDivisionCols = [
    { label: 'Parent Division', key: 'parent_division',   align: 'left'  },
    { label: 'Sales (AED)',     key: 'sales_aed',         align: 'right', fmt: fmtCurrency },
    { label: 'Percentage',      key: 'percentage',        align: 'right', fmt: v => fmtPct(v) },
    { label: '# Transactions',  key: 'transaction_count', align: 'right' },
    { label: 'Currency',        key: 'currency',          align: 'center' },
  ];

  const subdivisionCols = [
    { label: 'Sub-Division',    key: 'subdivision',       align: 'left'  },
    { label: 'Sales (AED)',     key: 'sales_aed',         align: 'right', fmt: fmtCurrency },
    { label: 'Percentage',      key: 'percentage',        align: 'right', fmt: v => fmtPct(v) },
    { label: '# Transactions',  key: 'transaction_count', align: 'right' },
    { label: 'Currency',        key: 'currency',          align: 'center' },
  ];

  const salesmanCols = [
    { label: 'Sales Person',    key: 'sales_person',      align: 'left'  },
    { label: 'Sales (AED)',     key: 'sales_aed',         align: 'right', fmt: fmtCurrency },
    { label: 'Gross Margin',    key: 'gross_margin',      align: 'right', fmt: fmtCurrency },
    { label: 'Percentage',      key: 'percentage',        align: 'right', fmt: v => fmtPct(v) },
    { label: '# Transactions',  key: 'transaction_count', align: 'right' },
    { label: 'Currency',        key: 'currency',          align: 'center' },
  ];

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
            <ExportButtons endpoint="details" filters={appliedFilters} size="md" />
          </div>
        </div>

        {/* ── Global API Connection Diagnostic Notice ── */}
        {Object.values(errors).some(Boolean) && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 12, padding: '14px 18px', marginBottom: 16,
            display: 'flex', gap: 12, alignItems: 'flex-start',
            boxShadow: '0 2px 8px rgba(239,68,68,0.04)',
          }}>
            <span style={{ fontSize: '1.25rem', marginTop: -2 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>
                Backend Connection Issue (502 Bad Gateway / Network Unreachable)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                The frontend development proxy was unable to reach the live API at{' '}
                <code style={{ background: '#fee2e2', padding: '2px 4px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600 }}>
                  13.233.207.68:8000
                </code>. This typically means the backend server is offline or your current IP is blocked by the AWS Security Group.
              </div>
              {publicIp && (
                <div style={{ marginTop: 8, fontSize: '0.74rem', color: '#7f1d1d', fontWeight: 600 }}>
                  📍 Your Public IP Address:{' '}
                  <span
                    style={{ textDecoration: 'underline', color: '#b91c1c', cursor: 'copy' }}
                    onClick={() => { navigator.clipboard.writeText(publicIp); alert('Copied to clipboard!'); }}
                    title="Click to copy"
                  >
                    {publicIp}
                  </span>{' '}
                  (Share this with the backend/IT team to whitelist).
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
          <KPICard
            label="Gross Profit (MTD)"
            numericValue={grossMarginData?.gross_profit_mtd ?? null}
            changePct={grossMarginData?.mtd_change_pct ?? null}
            changeLabel={grossMarginData ? `vs Prev MTD (Margin: ${Number(grossMarginData.gross_margin_mtd_pct).toFixed(1)}%)` : ''}
            up={grossMarginData?.mtd_change_pct !== null && grossMarginData?.mtd_change_pct !== undefined ? grossMarginData.mtd_change_pct >= 0 : null}
            icon="📊"
            iconBg="linear-gradient(135deg,#ede9fe,#ddd6fe)"
            sparkData={grossMarginData?.trend?.map(t => t.gross_profit) || null}
            sparkColor={C.purple}
            loading={loading.grossMargin}
            error={errors.grossMargin}
          />
          <KPICard
            label="Top Salesman"
            numericValue={null}
            textValue={topSalesmanRecord?.name || '—'}
            changePct={null}
            changeLabel={topSalesmanRecord ? `AED ${Number(topSalesmanRecord.value).toLocaleString('en-US', { maximumFractionDigits: 0 })} ${topSalesmanRecord.target > 0 ? `(${Number((topSalesmanRecord.value / topSalesmanRecord.target) * 100).toFixed(1)}% Target)` : ''}` : undefined}
            up={topSalesmanRecord && topSalesmanRecord.target > 0 ? (topSalesmanRecord.value >= topSalesmanRecord.target) : null}
            icon="👤"
            iconBg="linear-gradient(135deg,#fce7f3,#fbcfe8)"
            sparkData={null}
            sparkColor={C.purple}
            loading={loading.bySalesman}
            error={errors.bySalesman}
          />
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
            action={<ViewAllButton onClick={() => setOpenModal('trend')} />}
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
            action={<ViewAllButton onClick={() => setOpenModal('legalEntity')} />}
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
            action={<ViewAllButton onClick={() => setOpenModal('parentDiv')} />}
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

        {/* ── Charts Row 2: Sub-Division | Top Customers (no View All) | Salesman ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>

          {/* Revenue by Sub-Division */}
          <ChartCard
            title="Revenue by Sub-Division (AED)"
            minHeight={290}
            loading={loading.subDiv}
            error={errors.subDiv}
            onRetry={() => fetchAll(appliedFilters)}
            action={<ViewAllButton onClick={() => setOpenModal('subDiv')} />}
          >
            {subDivData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220} minWidth={0}>
                <BarChart data={subDivData} margin={{ top: 8, right: 4, left: -24, bottom: 20 }} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(val) => val.length > 20 ? val.substring(0, 17) + '...' : val}
                    angle={-40}
                    textAnchor="end"
                    tick={{ fill: C.slate, fontSize: 9 }}
                    axisLine={false} tickLine={false}
                    interval={0}
                    height={85}
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

          {/* Top 10 Customers — NO View All per CFO decision */}
          <ChartCard
            title="Top 10 Customers by Sales (AED)"
            minHeight={290}
            loading={loading.topCustomers}
            error={errors.topCustomers}
            onRetry={() => fetchAll(appliedFilters)}
          >
            {topCustomersData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220} minWidth={0}>
                <BarChart data={topCustomersData} layout="vertical" margin={{ top: 8, right: 12, left: 16, bottom: 0 }} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f4ff" />
                  <XAxis type="number" tick={{ fill: C.muted, fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} width={180} />
                  <Tooltip
                    formatter={v => [`AED ${Number(v).toFixed(2)}`]}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 10 }}
                    cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                  />
                  <Bar dataKey="value" name="Revenue" radius={[0, 4, 4, 0]}>
                    {topCustomersData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 60 }}>No data available</div>
            )}
          </ChartCard>

          {/* Revenue by Salesman */}
          <ChartCard
            title="Revenue vs Target by Salesman (AED)"
            minHeight={290}
            loading={loading.bySalesman}
            error={errors.bySalesman}
            onRetry={() => fetchAll(appliedFilters)}
            action={<ViewAllButton onClick={() => setOpenModal('salesman')} />}
          >
            {bySalesmanData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220} minWidth={0}>
                <BarChart data={bySalesmanData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
                  <XAxis 
                    dataKey="name" 
                    tickFormatter={(val) => val.length > 20 ? val.substring(0, 17) + '...' : val}
                    angle={-40}
                    textAnchor="end"
                    tick={{ fill: C.slate, fontSize: 9 }}
                    axisLine={false} tickLine={false} 
                    interval={0} 
                    height={85} 
                  />
                  <YAxis tick={{ fill: C.muted, fontSize: 8 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v, n) => [`AED ${Number(v).toFixed(2)}`, n === 'value' ? 'Actual Revenue' : 'Sales Target']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 10 }}
                    cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                  />
                  <Legend verticalAlign="top" height={28} iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="value" name="Actual Revenue" fill={C.blue} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="target" name="Sales Target" fill={C.orange} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 60 }}>No data available</div>
            )}
          </ChartCard>
        </div>

        {/* Target vs Actual Revenue */}
        <ChartCard
          title="Target vs Actual Revenue Trend (AED)"
          minHeight={200}
          loading={loading.trend}
          error={errors.trend}
          onRetry={() => fetchAll(appliedFilters)}
        >
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140} minWidth={0}>
              <BarChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
                <XAxis dataKey="period" tick={{ fill: C.muted, fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 8 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v, n) => [`AED ${Number(v).toFixed(2)}`, n === 'currentYear' ? 'Actual Revenue' : 'Target Revenue']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 10 }}
                  cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                />
                <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                <Bar dataKey="currentYear" name="Actual Revenue" fill={C.green} radius={[3, 3, 0, 0]} />
                <Bar dataKey="target" name="Target Revenue" fill={C.orange} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 30 }}>No data available</div>
          )}
        </ChartCard>

        {/* ── Sales Revenue Detailed View Table (/details with pagination) ── */}
        <div style={{
          background: '#fff', borderRadius: 14,
          border: `1px solid ${C.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          overflow: 'hidden', marginBottom: 8, marginTop: 14,
        }}>
          {/* Table Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
            background: 'linear-gradient(90deg, #f8fafc 0%, #fff 100%)',
            flexWrap: 'wrap', gap: 10,
          }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: C.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 Sales Revenue Detailed Transaction View
            </span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Tab switcher */}
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
              {/* Export buttons for /details */}
              <ExportButtons endpoint="details" filters={appliedFilters} />
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
                    ['Invoice #',       'left'],
                    ['Invoice Date',    'left'],
                    ['Legal Entity',    'left'],
                    ['Division',        'left'],
                    ['Sub-Division',    'left'],
                    ['Sales Person',    'left'],
                    ['Customer',        'left'],
                    ['Project Ref',     'left'],
                    ['Currency',        'center'],
                    ['Amount',          'right'],
                    ['Base Amount',     'right'],
                  ].map(([h, align]) => (
                    <th key={h} style={{ ...TH_LG, textAlign: align }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading.details ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 11 }).map((__, j) => (
                        <td key={j} style={TD_LG}><Skeleton h={14} /></td>
                      ))}
                    </tr>
                  ))
                ) : detailRows.length > 0 ? (
                  detailRows.map((row, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: `1px solid #f1f5f9`, transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...TD_LG, fontWeight: 700, color: C.blue }}>{row.invoice_number || '—'}</td>
                      <td style={TD_LG}>{row.invoice_date ? new Date(row.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td style={{ ...TD_LG, fontWeight: 600, color: C.navy }}>{row.legal_entity || '—'}</td>
                      <td style={TD_LG}>{row.division_code || '—'}</td>
                      <td style={TD_LG}>{row.subdivision_code || '—'}</td>
                      <td style={TD_LG}>{row.sales_person || '—'}</td>
                      <td style={{ ...TD_LG, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={row.customer_name}>{row.customer_name || '—'}</td>
                      <td style={TD_LG}>{row.project_reference || '—'}</td>
                      <td style={{ ...TD_LG, textAlign: 'center' }}>{row.invoice_currency || '—'}</td>
                      <td style={{ ...TD_LG, textAlign: 'right', fontWeight: 600 }}>{fmtTableNum(row.amount)}</td>
                      <td style={{ ...TD_LG, textAlign: 'right', color: C.slate }}>{fmtTableNum(row.base_amount)}</td>
                    </tr>
                  ))
                ) : !errors.details ? (
                  <tr>
                    <td colSpan={11} style={{ ...TD_LG, textAlign: 'center', color: C.muted, padding: '32px 14px' }}>
                      No records found for the selected filters
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div style={{
            padding: '12px 20px',
            borderTop: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#fafbfc', flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{ fontSize: '0.72rem', color: C.slate }}>
              {detailTotalCount > 0
                ? `Showing ${pageStart}–${pageEnd} of ${detailTotalCount.toLocaleString()} records`
                : 'No records'}
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                id="btn-details-prev"
                onClick={() => setDetailPage(p => Math.max(0, p - 1))}
                disabled={detailPage === 0 || loading.details}
                style={{
                  padding: '5px 12px', borderRadius: 7, border: `1px solid ${C.border}`,
                  background: detailPage === 0 ? '#f1f5f9' : '#fff',
                  color: detailPage === 0 ? C.muted : C.navy,
                  fontSize: '0.72rem', fontWeight: 600, cursor: detailPage === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >← Prev</button>

              {/* Page number pills */}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page;
                if (totalPages <= 7) {
                  page = i;
                } else if (detailPage < 4) {
                  page = i < 5 ? i : i === 5 ? -1 : totalPages - 1;
                } else if (detailPage > totalPages - 5) {
                  page = i === 0 ? 0 : i === 1 ? -1 : totalPages - 7 + i;
                } else {
                  page = i === 0 ? 0 : i === 1 ? -1 : i === 5 ? -1 : i === 6 ? totalPages - 1 : detailPage - 2 + i;
                }
                if (page === -1) return (
                  <span key={`ellipsis-${i}`} style={{ color: C.muted, fontSize: '0.72rem', padding: '0 2px' }}>…</span>
                );
                return (
                  <button
                    key={page}
                    onClick={() => setDetailPage(page)}
                    style={{
                      width: 30, height: 30, borderRadius: 7,
                      border: `1px solid ${detailPage === page ? C.blue : C.border}`,
                      background: detailPage === page ? C.blue : '#fff',
                      color: detailPage === page ? '#fff' : C.navy,
                      fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >{page + 1}</button>
                );
              })}

              <button
                id="btn-details-next"
                onClick={() => setDetailPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={detailPage >= totalPages - 1 || loading.details}
                style={{
                  padding: '5px 12px', borderRadius: 7, border: `1px solid ${C.border}`,
                  background: detailPage >= totalPages - 1 ? '#f1f5f9' : '#fff',
                  color: detailPage >= totalPages - 1 ? C.muted : C.navy,
                  fontSize: '0.72rem', fontWeight: 600,
                  cursor: detailPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >Next →</button>
            </div>
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

      {/* ── View-All Modals ── */}

      {/* Legal Entity Detail Modal */}
      <DetailApiModal
        isOpen={openModal === 'legalEntity'}
        onClose={() => setOpenModal(null)}
        title="Legal Entity — Full Detail View"
        endpoint="legal-entity-detail"
        fetchFn={fetchLegalEntityDetail}
        columnDefs={legalEntityCols}
        filters={appliedFilters}
        searchPlaceholder="Search legal entities..."
      />

      {/* Parent Division Detail Modal */}
      <DetailApiModal
        isOpen={openModal === 'parentDiv'}
        onClose={() => setOpenModal(null)}
        title="Parent Division — Full Detail View"
        endpoint="parent-division-detail"
        fetchFn={fetchParentDivisionDetail}
        columnDefs={parentDivisionCols}
        filters={appliedFilters}
        searchPlaceholder="Search parent divisions..."
      />

      {/* Sub-Division Detail Modal */}
      <DetailApiModal
        isOpen={openModal === 'subDiv'}
        onClose={() => setOpenModal(null)}
        title="Sub-Division — Full Detail View"
        endpoint="subdivision-detail"
        fetchFn={fetchSubdivisionDetail}
        columnDefs={subdivisionCols}
        filters={appliedFilters}
        searchPlaceholder="Search sub-divisions..."
      />

      {/* Salesman Detail Modal */}
      <DetailApiModal
        isOpen={openModal === 'salesman'}
        onClose={() => setOpenModal(null)}
        title="Salesman — Full Detail View"
        endpoint="salesman-detail"
        fetchFn={fetchSalesmanDetail}
        columnDefs={salesmanCols}
        filters={appliedFilters}
        searchPlaceholder="Search salespeople..."
      />

      {/* Trend View-All — inline modal reusing old table logic */}
      {openModal === 'trend' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <style>{`@keyframes scaleUp{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
          <div style={{
            background: '#fff', borderRadius: 16, width: '88%', maxWidth: 780,
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            animation: 'scaleUp 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards',
            overflow: 'hidden', border: '1px solid #e2e8f0',
          }}>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(90deg,#f8fafc,#fff)',
            }}>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: C.navy }}>
                Revenue Trend — Full Breakdown
              </h3>
              <ModalCloseButton onClick={() => setOpenModal(null)} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Period', currentYearLabel, previousYearLabel, 'Target', 'Variance to Target', 'Growth vs PY'].map((h, i) => (
                      <th key={h} style={{ ...TH, textAlign: i === 0 ? 'left' : 'right', position: 'sticky', top: 0, background: '#fff', zIndex: 2, borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((row, idx) => {
                    const variance = row.currentYear != null && row.target != null ? row.currentYear - row.target : null;
                    const variancePct = row.target ? (variance / row.target) * 100 : null;
                    const growth = row.currentYear != null && row.previousYear != null ? row.currentYear - row.previousYear : null;
                    const growthPct = row.previousYear ? (growth / row.previousYear) * 100 : null;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ ...TD, fontWeight: 600, color: C.navy }}>{row.period}</td>
                        <td style={{ ...TD, textAlign: 'right' }}>{fmtCurrency(row.currentYear)}</td>
                        <td style={{ ...TD, textAlign: 'right', color: C.slate }}>{fmtCurrency(row.previousYear)}</td>
                        <td style={{ ...TD, textAlign: 'right', color: C.orange }}>{fmtCurrency(row.target)}</td>
                        <td style={{ ...TD, textAlign: 'right' }}>
                          {variance != null ? <VarBadge val={variancePct} /> : '—'}
                        </td>
                        <td style={{ ...TD, textAlign: 'right' }}>
                          {growth != null ? <VarBadge val={growthPct} /> : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '10px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
              <button onClick={() => setOpenModal(null)} style={{
                padding: '6px 18px', background: '#e2e8f0', color: C.slate,
                border: 'none', borderRadius: 8, fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer',
              }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
