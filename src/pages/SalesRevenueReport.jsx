import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  AreaChart, Area,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
} from 'recharts';
import {
  fetchAccessMe,
  fetchRolePermissions,
  fetchFilterOptions,
  fetchDetails,
  fetchLegalEntityDetail,
  fetchParentDivisionDetail,
  fetchSubdivisionDetail,
  fetchSalesmanDetail,
  fetchSalesmanSummary,
  fetchSummary,
  fetchGrossMargin,
  exportSalesRevenue,
  fetchTrend,
  fetchLegalEntity,
  fetchParentDivision,
  fetchSubdivision,
  fetchBySalesman,
  fetchTopCustomers,
  fetchCustomerSummary,
  fetchCustomerDetail,
  fetchSummaryDetail,
} from '../services/salesRevenueApi';

import { C, CHART_COLORS } from '../utils/theme';


/* ─── Default filter state ──────────────────────────────────────── */
const _today = new Date();
const _y = _today.getFullYear();
const _m = _today.getMonth(); // 0-indexed
const pad = n => String(n).padStart(2, '0');
const FIRST_DAY = `${_y}-${pad(_m + 1)}-01`;
const LAST_DAY  = `${_y}-${pad(_m + 1)}-${pad(new Date(_y, _m + 1, 0).getDate())}`;

const DEFAULT_FILTERS = {
  legalEntity: 'All',
  parentDiv:   'All',
  subDiv:      'All',
  salesman:    'All',
  invoiceCurrency: 'All',
  reportingCurrency: 'AED',
  fromDate:    FIRST_DAY,
  toDate:      LAST_DAY,
};

const DETAILS_PAGE_SIZE = 10;

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

/* ─── CountUp Animation ─────────────────────────────────────────── */
const CountUp = ({ end, duration = 1.2, formatter }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let reqId;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(end * ease);
      if (progress < 1) {
        reqId = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    reqId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(reqId);
  }, [end, duration]);

  return <>{formatter ? formatter(count) : count}</>;
};

/* ─── Export Toast ───────────────────────────────────────────────── */
function ExportToast({ message, type }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: isError ? '#fff1f2' : '#f0fdf4',
      border: `1px solid ${isError ? '#fecdd3' : '#bbf7d0'}`,
      color: isError ? '#be123c' : '#15803d',
      borderRadius: 10, padding: '10px 18px',
      fontSize: '0.78rem', fontWeight: 700,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'fadeIn 0.2s ease',
    }}>
      {isError ? '⚠ ' : '✓ '}{message}
    </div>
  );
}

/* ─── Export Buttons ─────────────────────────────────────────────── */
function ExportButtons({ endpoint, filters, size = 'sm' }) {
  const [exporting, setExporting] = useState(null); // 'excel' | 'pdf' | 'error'
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExport = (format) => {
    if (exporting) return;
    setExporting(format);
    // exportSalesRevenue returns a Promise only when token exists; otherwise void
    const result = exportSalesRevenue(endpoint, format, filters);
    const finish = (ok, err) => {
      setExporting(null);
      if (!ok) showToast(err || 'Export failed', 'error');
      else showToast(`${format === 'excel' ? 'Excel' : 'PDF'} export started — check Downloads`, 'success');
    };
    if (result && typeof result.then === 'function') {
      result.then(() => finish(true)).catch(e => finish(false, e?.message));
    } else {

      setTimeout(() => finish(true), 800);
    }
  };

  const btnBase = {
    display: 'flex', alignItems: 'center', gap: 4,
    border: 'none', borderRadius: 7, cursor: 'pointer',
    fontWeight: 700, transition: 'all 0.15s', outline: 'none',
    fontSize: size === 'sm' ? '0.70rem' : '0.74rem',
    padding: size === 'sm' ? '5px 10px' : '6px 13px',
  };

  return (
    <>
      {toast && <ExportToast message={toast.msg} type={toast.type} />}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          id={`btn-export-excel-${endpoint}`}
          onClick={() => handleExport('excel')}
          disabled={!!exporting}
          title="Export to Excel"
          style={{
            ...btnBase,
            background: exporting === 'excel' ? '#d1fae5' : '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
            opacity: exporting ? 0.7 : 1,
            cursor: exporting ? 'not-allowed' : 'pointer',
          }}
        >
          {exporting === 'excel' ? '⏳' : '📊'} Excel
        </button>
        <button
          id={`btn-export-pdf-${endpoint}`}
          onClick={() => handleExport('pdf')}
          disabled={!!exporting}
          title="Export to PDF"
          style={{
            ...btnBase,
            background: exporting === 'pdf' ? '#fee2e2' : '#fff1f2',
            color: '#be123c',
            border: '1px solid #fecdd3',
            opacity: exporting ? 0.7 : 1,
            cursor: exporting ? 'not-allowed' : 'pointer',
          }}
        >
          {exporting === 'pdf' ? '⏳' : '📄'} PDF
        </button>
      </div>
    </>
  );
}

/* ─── Chart Menu (3-dot kebab) ───────────────────────────────────── */
function ChartMenu({ onViewAll, endpoint, filters }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleExport = (format) => {
    setExporting(format);
    try { exportSalesRevenue(endpoint, format, filters); } catch (e) { console.error(e); }
    setTimeout(() => setExporting(null), 2000);
    setOpen(false);
  };

  const menuItems = [
    ...(onViewAll ? [{ label: '🔎 View All', action: () => { onViewAll(); setOpen(false); } }] : []),
    { label: exporting === 'excel' ? '⏳ Exporting…' : '📊 Export Excel', action: () => handleExport('excel') },
    { label: exporting === 'pdf'   ? '⏳ Exporting…' : '📄 Export PDF',   action: () => handleExport('pdf') },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Options"
        style={{
          background: open ? '#f1f5f9' : 'none',
          border: 'none', cursor: 'pointer',
          padding: '4px 6px', borderRadius: 6,
          fontSize: '1.1rem', color: '#94a3b8',
          lineHeight: 1, transition: 'all 0.15s',
          display: 'flex', alignItems: 'center',
          outline: 'none',
        }}
      >
        ⋮
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)',
          background: '#fff', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
          border: '1px solid #e2e8f0',
          minWidth: 160, zIndex: 100,
          overflow: 'hidden',
          animation: 'scaleUp 0.14s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              style={{
                display: 'block', width: '100%',
                textAlign: 'left', padding: '9px 14px',
                background: 'none', border: 'none',
                fontSize: '0.75rem', fontWeight: 600,
                color: '#334155', cursor: 'pointer',
                transition: 'background 0.12s',
                borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
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

/* ─── Custom Info Tooltip ────────────────────────────────────────── */
function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 6, zIndex: show ? 50 : 1 }}
    >
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 14, height: 14, borderRadius: '50%',
          background: '#e0e7ff', color: '#3730a3',
          fontSize: '9px', fontWeight: 800, cursor: 'help',
          transition: 'background 0.15s, color 0.15s'
        }}
      >
        i
      </span>
      <div style={{
        position: 'absolute', bottom: '100%', left: '50%',
        marginBottom: 8, padding: '8px 12px', background: '#1e293b', color: '#fff',
        fontSize: '0.72rem', fontWeight: 500, borderRadius: 8,
        whiteSpace: 'normal', minWidth: 160, maxWidth: 220, textAlign: 'center', lineHeight: 1.4,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', pointerEvents: 'none',
        opacity: show ? 1 : 0, visibility: show ? 'visible' : 'hidden',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transformOrigin: 'bottom center',
        transform: show ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.95)'
      }}>
        {text}
        <div style={{
          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
          borderWidth: 5, borderStyle: 'solid', borderColor: '#1e293b transparent transparent transparent'
        }} />
      </div>
    </span>
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
  canExport,
  onClose,
  title,
  endpoint,
  fetchFn,
  columnDefs,    // [{ label, key, align, fmt }]
  filters,
  searchPlaceholder = 'Search...',
  maxWidth = '96vw',       // override per modal — defaults to near-full width
}) {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [searchTerm, setSearch] = useState('');
  const [page, setPage]         = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const pageSize = 15;

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

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0); // reset page on search
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setPage(0); // reset page on sort
  };

  // 1. Search
  const filtered = rows.filter(row =>
    columnDefs.some(col =>
      String(row[col.key] ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // 2. Sort
  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    }
    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();
    if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // 3. Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

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
        width: '96vw', maxWidth: maxWidth,
        maxHeight: '94vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
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
            onChange={handleSearch}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid #cbd5e1',
              fontSize: '0.78rem', minWidth: 200, outline: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!loading && sorted.length > 0 && (
              <span style={{ fontSize: '0.68rem', color: C.muted, fontWeight: 600 }}>
                {sorted.length} {searchTerm ? 'matches' : 'records'}
              </span>
            )}
            {canExport && <ExportButtons endpoint={endpoint} filters={filters} />}
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '0 16px 16px' }}>
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
                    <th key={i} onClick={() => handleSort(col.key)} style={{
                      ...TH, padding: '9px 8px',
                      position: 'sticky', top: 0,
                      background: '#f8fafc', zIndex: 2,
                      textAlign: col.align || 'left',
                      borderBottom: '2px solid #e2e8f0',
                      cursor: 'pointer', userSelect: 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start', gap: 4 }}>
                        {col.label}
                        {sortConfig.key === col.key && (
                          <span style={{ fontSize: '0.7rem', color: C.blue }}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((row, idx) => (
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
                          ...TD, padding: '8px 8px',
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

        {/* Footer with Pagination */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#f8fafc', flexWrap: 'wrap', gap: 10
        }}>
          <div style={{ fontSize: '0.72rem', color: C.slate }}>
            {sorted.length > 0
              ? `Showing ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, sorted.length)} of ${sorted.length} records`
              : 'No records'}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                padding: '5px 12px', borderRadius: 7, border: `1px solid ${C.border}`,
                background: page === 0 ? '#f1f5f9' : '#fff',
                color: page === 0 ? C.muted : C.navy,
                fontSize: '0.72rem', fontWeight: 600, cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >← Prev</button>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: C.navy, minWidth: 40, textAlign: 'center' }}>
              {sorted.length > 0 ? page + 1 : 0} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                padding: '5px 12px', borderRadius: 7, border: `1px solid ${C.border}`,
                background: page >= totalPages - 1 ? '#f1f5f9' : '#fff',
                color: page >= totalPages - 1 ? C.muted : C.navy,
                fontSize: '0.72rem', fontWeight: 600, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >Next →</button>
            <div style={{ width: 1, height: 20, background: C.border, margin: '0 4px' }} />
            <button onClick={onClose} style={{
              padding: '6px 18px', background: '#e2e8f0', color: C.slate,
              border: 'none', borderRadius: 8, fontSize: '0.74rem',
              fontWeight: 700, cursor: 'pointer',
            }}>Close</button>
          </div>
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
            fontSize: '0.66rem', color: '#1e3a8a', fontWeight: 700,
            letterSpacing: '-0.02em', marginBottom: 6,
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
function KPICard({ label, numericValue, textValue, changePct, changeLabel, up, icon, iconBg, sparkData, sparkColor, loading, error, cardBg, accentColor, currency }) {
  const [displayVal, setDisplayVal] = useState(0);
  const [hover, setHover]           = useState(false);

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
    ? `${currency || ''} ${fmtAxisNum(displayVal)}`
    : textValue || '—';

  const accent = accentColor || '#2563eb';

  return (
    <div
      id={`kpi-${label.replace(/\s+/g, '-').toLowerCase()}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: cardBg || '#fff',
        borderRadius: 12,
        padding: '12px 16px',
        boxShadow: hover ? `0 8px 24px ${accent}20` : 'none',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 74,
      }}
    >
      {/* Left: Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: '50%', background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: accent,
      }}>
        {icon}
      </div>

      {/* Right: Text Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1, justifyContent: 'center' }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, color: accent,
          lineHeight: 1.2,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word'
        }}>
          {label}
        </span>

        {loading ? (
          <Skeleton h={18} w={80} />
        ) : error ? (
          <span style={{ fontSize: '0.72rem', color: '#f43f5e' }}>Error</span>
        ) : (
          <div style={{
            fontSize: '1.05rem',
            fontWeight: 800, color: '#0f172a', lineHeight: 1.1,
            letterSpacing: '-0.02em',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word'
          }}>
            {formattedNum}
          </div>
        )}

        {(changePct !== undefined || changeLabel) && !loading && !error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
            fontSize: '0.62rem', fontWeight: 600, color: '#64748b',
            lineHeight: 1.1
          }}>
            {changePct !== undefined && <VarBadge val={changePct} />}
            {changeLabel && <span>{changeLabel}</span>}
          </div>
        )}
      </div>
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
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.85)', border: `1px solid rgba(226, 232, 240, 0.8)`,
      backdropFilter: 'blur(6px)',
      borderRadius: 6, padding: '5px 8px',
      fontSize: '0.68rem',
      minWidth: 110,
    }}>
      <div style={{ fontWeight: 700, color: C.navy, marginBottom: 4, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
            <span style={{ color: C.slate }}>{p.name}</span>
          </div>
          <span style={{ fontWeight: 800, color: C.navy }}>
            {currency ? `${currency} ` : ''}{Number(p.value).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── Variance Badge ────────────────────────────────────────────── */
function VarBadge({ val }) {
  if (val === null || val === undefined) return <span style={{ color: C.muted }}>N/A</span>;
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

function SubDivXAxisTick({ x, y, payload }) {
  const text = (payload?.value || '').replace(/\n/g, ' ');
  const display = text.length > 20 ? text.substring(0, 18) + '…' : text;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#475569"
        fontSize={10}
        fontWeight={600}
        transform="rotate(-45)"
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
        fontSize: '0.66rem', color: '#1e3a8a', fontWeight: 700,
        letterSpacing: '-0.02em',
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
  padding: '10px 16px', fontSize: '0.74rem', fontWeight: 700, color: '#1e3a8a',
  background: '#f8fafc',
  borderBottom: `2px solid #e2e8f0`, whiteSpace: 'nowrap',
};
const TD = { padding: '8px 16px', fontSize: '0.74rem', color: '#334155' };
const TH_LG = {
  padding: '10px 16px', fontSize: '0.74rem', fontWeight: 700, color: '#1e3a8a',
  background: '#f8fafc',
  borderBottom: `2px solid #e2e8f0`, whiteSpace: 'nowrap',
};
const TD_LG = { padding: '8px 16px', fontSize: '0.74rem', color: '#334155' };

/* ─── Axis Number Formatter ─────────────────────────────────────── */
const fmtAxisNum = (v) => {
  if (v === 0) return '0';
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(v) >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000)         return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

/* ─── Uniform Axis Number Formatter ─────────────────────────────── */
const fmtUniform = (v, maxVal) => {
  if (v === 0) return '0';
  const absMax = Math.abs(maxVal || v);
  if (absMax >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (absMax >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
  if (absMax >= 1_000)         return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

/* ─── Entity Color Mapping ──────────────────────────────────────── */
const ENTITY_COLORS = {
  'Multiplast Dubai LLC':                    '#6366f1', // indigo
  'DC Serve Equipment Trading LLC':          '#10b981', // emerald-green
  'Tawreed Co LLC':                          '#3b82f6', // blue
  'FJ Trading & Engineering Co WLL':         '#f59e0b', // amber
  'Future Journey Energy Solutions LLC':     '#8b5cf6', // violet
  'Alpha Ducts LLC':                         '#0ea5e9', // sky-blue
  'FJ Care Air Condition Trading LLC':       '#14b8a6', // teal
  'Others':                                  '#a855f7', // purple
};

const getEntityColor = (name) => {
  if (!name) return CHART_COLORS[0];
  if (ENTITY_COLORS[name]) return ENTITY_COLORS[name];

  // Fallback hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CHART_COLORS[Math.abs(hash) % CHART_COLORS.length];
};
/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                  */
/* ═══════════════════════════════════════════════════════════════ */

export default function SalesRevenueReport() {
  const navigate = useNavigate();

  /* ── Filter state ─────────────────────────────────────────────── */
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [userAccess, setUserAccess] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const normalizePermissions = (response) => {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.data)) return response.data;
    if (response && Array.isArray(response.permissions)) return response.permissions;
    if (response && typeof response === 'object') return [response];
    return [];
  };


  /* ── Filter options ──────────────────────────────────────────── */
  const [filterOptions, setFilterOptions] = useState({
    legalEntities:  ['All'],
    parentDivs:     ['All'],
    subDivs:        ['All'],
    salesmen:       ['All'],
    invoiceCurrencies: ['All'],
    reportingCurrencies: ['AED'],
    dataAsOf: null,
  });

  /* ── Chart / KPI data state ───────────────────────────────────── */
  const [summary,             setSummary]             = useState(null);
  const [trendData,           setTrendData]           = useState([]);
  const [legalEntData,        setLegalEntData]        = useState([]);
  const [parentDivData,       setParentDivData]       = useState([]);
  const [subDivData,          setSubDivData]          = useState([]);
  const [subdivisionRawData,  setSubdivisionRawData]  = useState([]);  // raw rows from /subdivision-detail
  const [topCustomersData,    setTopCustomersData]    = useState([]);
  const [bySalesmanData,      setBySalesmanData]      = useState([]);
  const [salesmanSummaryData, setSalesmanSummaryData] = useState([]);
  const [grossMarginData,     setGrossMarginData]     = useState(null);
  const [legalEntityDetailRaw, setLegalEntityDetailRaw] = useState([]);
  const [summaryDetailData,   setSummaryDetailData]   = useState([]);
  const [activeTab,           setActiveTab]           = useState('all');

  /* ── /details pagination state ────────────────────────────────── */
  const [detailRows,       setDetailRows]       = useState([]);
  const [detailTotalCount, setDetailTotalCount] = useState(0);
  const [detailPage,       setDetailPage]       = useState(0); // 0-indexed

  const [hoveredParentDiv, setHoveredParentDiv] = useState(null);
  const [excludeOthers, setExcludeOthers] = useState(false);

  /* ── View-All modal state ─────────────────────────────────────── */
  const [openModal, setOpenModal] = useState(null); // 'legalEntity' | 'parentDiv' | 'subDiv' | 'salesman'

  /* ── Loading flags ────────────────────────────────────────────── */
  const [loading, setLoading] = useState({
    filters: true, summary: true, trend: true,
    legalEnt: true, parentDiv: true, subDiv: true, details: true,
    topCustomers: true, bySalesman: true, grossMargin: true,
    salesmanSummary: true, summaryDetail: true,
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
  const fmtCurrency = (v) => v !== null && v !== undefined ? `${filters.reportingCurrency} ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';
  const fmtPct = (v) => v !== null && v !== undefined ? `${Number(v).toFixed(2)}%` : 'N/A';
  const fmtTableNum = (v) => v !== null && v !== undefined ? Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '—';
  const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  /* ── Auth redirect helper ─────────────────────────────────────── */
  const handle401 = useCallback((err) => {
    if (err?.status === 401 || err?.isAuthError) {
      navigate('/login');
    }
  }, [navigate]);

  /* ── Load Access and Permissions ────────────────────────────── */
  useEffect(() => {
    fetchAccessMe()
      .then(data => {
        setUserAccess(data);
        if (data && data.role_code) {
           return fetchRolePermissions(data.role_code).then(perms => setPermissions(normalizePermissions(perms))).catch(() => setPermissions([]));
        }
      })
      .catch(err => console.warn('Failed to fetch user access:', err));
  }, []);

  const canExport = permissions.find(p => p.module_code === 'SALES_REVENUE')?.can_export ?? false;

  /* ── Load filter options (Cascading) ─────────────────────────── */
  useEffect(() => {
    setLoading(prev => ({ ...prev, filters: true }));
    fetchFilterOptions({
      legalEntity: filters.legalEntity,
      parentDiv: filters.parentDiv,
      subDiv: filters.subDiv
    })
      .then(data => {
        // Always show all 6 standard currencies regardless of dim_currency content
        const REQUIRED_CURRENCIES = ['AED', 'INR', 'OMR', 'QAR', 'SAR', 'USD'];
        const rawRC = (
          data.reporting_currencies || data.reportingCurrencies ||
          (data.data && (data.data.reporting_currencies || data.data.reportingCurrencies)) ||
          data.currencies || (data.data && data.data.currencies) || []
        );
        const fromDb = (Array.isArray(rawRC) ? rawRC : [])
          .map(o => (typeof o === 'object' ? (o.currency_code || o.currency) : o))
          .filter(Boolean).map(c => String(c).toUpperCase());
        const mergedCurrencies = [...new Set([...fromDb, ...REQUIRED_CURRENCIES])].sort();

        setFilterOptions(prev => ({
          ...prev,
          legalEntities: ['All', ...(data.legal_entities || []).filter(e => e && (typeof e === 'string' ? e !== 'All' : e.name !== 'All'))],
          parentDivs:    ['All', ...(data.parent_divisions || []).filter(e => e && e !== 'All')],
          // Backend returns 'subdivisions' key (not 'sub_divisions')
          subDivs:       ['All', ...(data.subdivisions || data.sub_divisions || []).filter(e => e && e !== 'All')],
          salesmen:      ['All', ...(data.salesmen || []).filter(e => e && e !== 'All')],
          invoiceCurrencies: ['All', ...(data.invoice_currencies || data.invoiceCurrencies || [])],
          reportingCurrencies: mergedCurrencies,
          dataAsOf: data.data_as_of || data.dataAsOf || (data.data && (data.data.data_as_of || data.data.dataAsOf)) || null,
        }));
      })
      .catch(err => {
        handle401(err);
        setErrors(prev => ({ ...prev, filters: err.message || 'Failed to load filter options' }));
      })
      .finally(() => setLoading(prev => ({ ...prev, filters: false })));
  }, [filters.legalEntity, filters.parentDiv, filters.subDiv, handle401]);

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
      filters: false, summary: true, trend: true, legalEnt: true,
      parentDiv: true, subDiv: true, details: true,
      topCustomers: true, bySalesman: false, grossMargin: true,
      salesmanSummary: true, summaryDetail: true,
    });
    setErrors({});
    setDetailPage(0);
    setTrendData([]);
    setGrossMarginData(null);

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

    // 0. Summary — GET /api/sales-revenue/summary
    guard('summary', fetchSummary(f)).then(d => {
      if (!d) return;

      // Map directly from the exact backend fields
      const mtd = d.sales_mtd ?? d.mtd_revenue ?? d.sales_mtd_aed ?? null;
      const ytd = d.sales_ytd ?? d.ytd_revenue ?? d.sales_ytd_aed ?? null;
      const prevMtd = d.prev_mtd_revenue ?? d.prev_mtd_sales ?? null;
      const prevYtd = d.prev_ytd_revenue ?? d.prev_ytd_sales ?? null;

      // Real API returns separate _sales fields for value:
      // top_legal_entity_sales, top_parent_division_sales
      const normHighlight = (nameVal, salesVal, pctVal) => {
        if (!nameVal) return null;
        const name = typeof nameVal === 'object' ? nameVal.name : nameVal;
        const value = salesVal ?? (typeof nameVal === 'object' ? nameVal.value : null);
        const pct   = pctVal   ?? (typeof nameVal === 'object' ? nameVal.pct   : null);
        return { name, value: value ? Number(value) : null, pct: pct ? Number(pct) : null };
      };

      setSummary({
        // Revenue
        total_revenue:           ytd,
        mtd_revenue:             mtd,
        ytd_revenue:             ytd,
        prev_mtd_revenue:        prevMtd,
        prev_ytd_revenue:        prevYtd,
        mtd_change_pct:          d.mtd_change_pct         ?? null,
        ytd_change_pct:          d.ytd_change_pct         ?? null,
        // Gross margin (may not be in summary; falls back to grossMarginData)
        gross_margin:            d.gross_margin           ?? null,
        gross_profit_mtd:        d.gross_profit_mtd       ?? null,
        gross_margin_pct:        d.gross_margin_pct       ?? null,
        gross_margin_change_pct: d.gross_margin_change_pct ?? null,
        // Counts
        total_customers:         d.total_customers        ?? null,
        total_salesmen:          d.total_salesmen         ?? null,
        // Highlights — exact backend fields
        top_legal_entity:    normHighlight(
          d.top_legal_entity,
          d.top_legal_entity_sales,
          d.top_legal_entity_pct
        ),
        top_parent_division: normHighlight(
          d.top_parent_division,
          d.top_parent_division_sales,
          d.top_parent_division_pct
        ),
        data_as_of:              d.data_as_of             ?? null,
        current_year_label:      d.current_year_label     || 'Current Year',
        previous_year_label:     d.previous_year_label    || 'Previous Year',
      });
    });

    // 1. Revenue Trend — GET /api/sales-revenue/trend
    //    API returns: [{ period_name, sales }, ...] (Current Year only)
    guard('trend', fetchTrend(f)).then(d => {
      if (!d) return;
      const arr = Array.isArray(d) ? d : (d?.data || []);

      // Generate a 12-month skeleton
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const yearStr = f.fromDate ? String(new Date(f.fromDate).getFullYear()).slice(-2) : String(new Date().getFullYear()).slice(-2);
      const skeleton = months.map(m => ({ period: `${m}-${yearStr}`, currentYear: null }));

      let hasCustomPeriods = false;
      arr.forEach(item => {
        const periodStr = item.period_name ?? item.period ?? '';
        const val = Number(item.sales ?? item.current_year ?? 0);
        const match = skeleton.find(s => periodStr.startsWith(s.period.split('-')[0]));
        if (match) {
          match.currentYear = val;
          match.period = periodStr;
        } else {
          hasCustomPeriods = true;
        }
      });

      setTrendData(hasCustomPeriods ? arr.map(item => ({
        period: item.period_name ?? item.period ?? '',
        currentYear: Number(item.sales ?? item.current_year ?? 0),
      })) : skeleton);
    });

    // 2. Gross Margin — GET /api/sales-revenue/gross-margin
    guard('grossMargin', fetchGrossMargin(f)).then(d => {
      if (!d) return;
      setGrossMarginData(d);
    });

    // 3. Salesman Summary — GET /api/sales-revenue/salesman-summary
    //    Used for: Top Salesman KPI card + Salesman View All modal
    guard('salesmanSummary', fetchSalesmanSummary(f)).then(d => {

      const rows = Array.isArray(d) ? d : (d?.data ?? []);
      if (!rows.length) return;
      setSalesmanSummaryData(rows);
      // Populate bySalesmanData chart
      const chartData = rows
        .filter(row => {
          const name = row.salesman_name || row.salesman || row.sales_person;
          return name && name !== '';
        })
        .map(row => ({
          name:   row.salesman_name || row.salesman || row.sales_person || 'Unknown',
          value:  Number(row.sales  || 0),
          target: Number(row.target     || 0),
          pct:    Number(row.percentage || 0),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15);
      setBySalesmanData(chartData);
    });

    // 4. Legal Entity
    guard('legalEnt', fetchLegalEntityDetail(f)).then(d => {
      if (!d || !d.data) return;
      const arr = d.data;
      setLegalEntityDetailRaw(arr); // raw rows for summary table

      const grouped = {};
      const pctMap  = {};
      arr.forEach(row => {
        const name = row.legal_entity || 'Unknown';
        grouped[name] = (grouped[name] || 0) + (Number(row.sales) || 0);
        if (pctMap[name] === undefined) pctMap[name] = Number(row.percentage) || 0;
      });

      const chartDataAll = Object.keys(grouped)
        .map(name => ({ name, value: grouped[name], pct: pctMap[name] }))
        .sort((a, b) => b.value - a.value);

      let chartData = [];
      if (chartDataAll.length > 5) {
        const top5 = chartDataAll.slice(0, 5);
        const othersValue = chartDataAll.slice(5).reduce((sum, item) => sum + item.value, 0);
        const othersPct   = chartDataAll.slice(5).reduce((sum, item) => sum + (item.pct || 0), 0);
        chartData = [...top5, { name: 'Others', value: othersValue, pct: othersPct }];
      } else {
        chartData = chartDataAll;
      }

      setLegalEntData(chartData.map((item, i) => ({
        ...item,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })));
    });

    // 5. Parent Division
    guard('parentDiv', fetchParentDivisionDetail(f)).then(d => {
      if (!d || !d.data) return;
      const arr = d.data;

      const grouped = {};
      const pctMap  = {};
      arr.forEach(row => {
        const name = row.parent_division || row.division_name || row.division_code || 'Unknown';
        grouped[name] = (grouped[name] || 0) + (Number(row.sales) || 0);
        if (pctMap[name] === undefined) pctMap[name] = Number(row.percentage) || 0;
      });

      const chartDataAll = Object.keys(grouped)
        .map(name => ({ name, value: grouped[name], pct: pctMap[name] }))
        .sort((a, b) => b.value - a.value);

      let chartData = [];
      if (chartDataAll.length > 5) {
        const top5 = chartDataAll.slice(0, 5);
        const othersValue = chartDataAll.slice(5).reduce((sum, item) => sum + item.value, 0);
        const othersPct   = chartDataAll.slice(5).reduce((sum, item) => sum + (item.pct || 0), 0);
        chartData = [...top5, { name: 'Others', value: othersValue, pct: othersPct }];
      } else {
        chartData = chartDataAll;
      }

      setParentDivData(chartData);
    });

    // 6. Sub-Division
    guard('subDiv', fetchSubdivisionDetail(f)).then(d => {
      if (!d || !d.data) return;
      // Store raw rows for the inline Detailed View table
      setSubdivisionRawData(d.data);

      const grouped = {};
      const pctMap  = {};
      d.data.forEach(row => {
        const name = (row.subdivision || row.subdivision_name || row.subdivision_code || 'Unknown').replace(/\s/g, '\n');
        grouped[name] = (grouped[name] || 0) + (Number(row.sales_aed) || Number(row.sales) || 0);
        if (pctMap[name] === undefined) pctMap[name] = Number(row.percentage) || 0;
      });

      const chartDataAll = Object.keys(grouped)
        .map(name => ({ name, value: grouped[name], pct: pctMap[name] }))
        .sort((a, b) => b.value - a.value);

      let chartData = [];
      if (chartDataAll.length > 5) {
        const top5 = chartDataAll.slice(0, 5);
        const othersValue = chartDataAll.slice(5).reduce((sum, item) => sum + item.value, 0);
        const othersPct   = chartDataAll.slice(5).reduce((sum, item) => sum + (item.pct || 0), 0);
        chartData = [...top5, { name: 'Others', value: othersValue, pct: othersPct }];
      } else {
        chartData = chartDataAll;
      }

      setSubDivData(chartData.map((item, i) => ({
        ...item,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })));
    });

    // 7. Details (page 0)
    guard('details', fetchDetails(f, DETAILS_PAGE_SIZE, 0)).then(d => {
      if (!d || !d.data) return;
      setDetailRows(d.data);
      setDetailTotalCount(d.total_count || d.total || d.count || d.data.length);
    });

    // 8. Top Customers
    guard('topCustomers', fetchTopCustomers(f)).then(d => {
      if (!d || !d.data) return;
      const mapped = d.data.map(c => ({
        name: c.customer_name || c.name || 'Unknown',
        value: Number(c.sales ?? c.value ?? 0),
        pct: Number(c.percentage ?? c.contribution_pct ?? c.pct ?? 0),
      }));
      setTopCustomersData(mapped);
    });

    // 9. Summary Detail — GET /api/sales-revenue/summary-detail
    guard('summaryDetail', fetchSummaryDetail(f))
      .then(d => {
        if (!d) return;
        const rows = Array.isArray(d) ? d : (d?.data ?? []);
        setSummaryDetailData(rows);
      })
      .catch(err => {
        // 500 from backend — log but don't crash; table will show empty state
        console.warn('[SalesRevenueReport] summary-detail failed, using empty data:', err?.message || err);
        setSummaryDetailData([]);
        // Don't propagate to global error banner — this section degrades gracefully
      });
  }, [handle401]);

  useEffect(() => { fetchAll(appliedFilters); }, [appliedFilters, fetchAll]);

  /* ── Auto-apply: sync filters → appliedFilters with debounce ──── */
  /* Dropdowns apply in 100 ms; date inputs wait 600 ms after        */
  /* the last keystroke so we don't hammer the API while typing.     */
  /* Initial mount is skipped — fetchAll already fires via the       */
  /* appliedFilters effect above on first render.                    */
  const isFirstAutoApplyRun = useRef(true);
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    // Skip initial mount — avoid double-fetching on page load
    if (isFirstAutoApplyRun.current) {
      isFirstAutoApplyRun.current = false;
      prevFiltersRef.current = filters;
      return;
    }

    const prev = prevFiltersRef.current;
    prevFiltersRef.current = filters;

    // Guard: bail out if nothing actually changed
    const dateKeys = ['fromDate', 'toDate'];
    const changedKeys = Object.keys(filters).filter(k => filters[k] !== prev[k]);
    if (changedKeys.length === 0) return;

    // Dropdowns get 100 ms; date fields get 600 ms (user may still be typing)
    const onlyDatesChanged = changedKeys.every(k => dateKeys.includes(k));
    const delay = onlyDatesChanged ? 600 : 100;
    const timer = setTimeout(() => setAppliedFilters({ ...filters }), delay);
    return () => clearTimeout(timer);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const updateFilter = (key, val) => {
    setFilters(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'legalEntity') {
        next.parentDiv = 'All';
        next.subDiv = 'All';
        next.salesman = 'All';
      } else if (key === 'parentDiv') {
        next.subDiv = 'All';
        next.salesman = 'All';
      } else if (key === 'subDiv') {
        next.salesman = 'All';
      }
      return next;
    });
  };

  /* ── Derived KPI values from /summary ─────────────────────────── */
  // Revenue
  const totalRevenue    = summary?.total_revenue    ?? summary?.ytd_revenue ?? null;
  const mtdRevenue      = summary?.mtd_revenue      ?? null;
  const ytdRevenue      = summary?.ytd_revenue      ?? null;
  const mtdChangePct    = summary?.mtd_change_pct   ?? null;
  const ytdChangePct    = summary?.ytd_change_pct   ?? null;
  // Gross Profit MTD — exclusively from /summary which computes the correct MTD period.
  // DO NOT fall back to grossMarginData.gross_margin — that is the full-period total,
  // not the MTD value, and would show an incorrect inflated number (e.g. 5.9M) when
  // Sales MTD is 0 (no data in the selected month).
  const grossMargin    = summary?.gross_profit_mtd ?? null;
  const grossMarginPct  = grossMarginData?.margin_pct ?? grossMarginData?.gross_margin_pct ?? summary?.gross_margin_pct ?? null;
  const grossMarginChg  = grossMarginData?.mtd_change_pct   ?? grossMarginData?.gross_margin_change_pct ?? summary?.gross_margin_change_pct ?? null;
  // Counts
  const totalCustomers  = summary?.total_customers  ?? null;
  const totalSalesmen   = summary?.total_salesmen   ?? null;
  // Highlights
  const topLE           = summary?.top_legal_entity;
  const topPD           = summary?.top_parent_division;
  const rawDataAsOf = summary?.data_as_of || summary?.dataAsOf || filterOptions.dataAsOf;
  const dataAsOf = rawDataAsOf
    ? new Date(rawDataAsOf).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  // Top Salesman: directly use the first row from the response as requested
  const topSalesmanRecord = salesmanSummaryData && salesmanSummaryData.length > 0
    ? salesmanSummaryData[0]
    : null;
  const topSalesmanName  = topSalesmanRecord?.salesman_name || topSalesmanRecord?.sales_person || topSalesmanRecord?.salesman || '—';
  const topSalesmanValue   = topSalesmanRecord ? Number(topSalesmanRecord.sales || 0) : null;

  /* ── Spark data from trend ────────────────────────────────────── */
  const sparkMTD = trendData.map(d => d.currentYear).filter(Boolean);
  const sparkYTD = sparkMTD; // same source — API returns current year only

  /* ── Year labels ─────────────────────────────────────────────── */
  const currentYearLabel  = summary?.current_year_label  || 'Current Year';
  const previousYearLabel = summary?.previous_year_label || 'Previous Year';

  /* ── Details pagination derived ───────────────────────────────── */
  const totalPages   = Math.max(1, Math.ceil(detailTotalCount / DETAILS_PAGE_SIZE));
  const pageStart    = detailPage * DETAILS_PAGE_SIZE + 1;
  const pageEnd      = Math.min((detailPage + 1) * DETAILS_PAGE_SIZE, detailTotalCount);

  /* ── Column definitions for View-All modals ──────────────────── */
  // rc = selected reporting currency (used in all column headers)
  const rc = appliedFilters.reportingCurrency || filters.reportingCurrency || 'AED';

  const legalEntityCols = [
    { label: 'Legal Entity',                    key: 'legal_entity',          align: 'left'   },
    { label: `Total Revenue (${rc})`,           key: 'sales',                 align: 'right',  fmt: v => (v !== null && v !== undefined) ? fmtCurrency(v) : '—' },
    { label: `MTD Revenue (${rc})`,             key: 'mtd_sales',             align: 'right',  fmt: v => (v !== null && v !== undefined) ? fmtCurrency(v) : '—' },
    { label: `YTD Revenue (${rc})`,             key: 'ytd_sales',             align: 'right',  fmt: v => (v !== null && v !== undefined) ? fmtCurrency(v) : '—' },
    { label: 'Ledger Currency',                 key: 'ledger_currency',       align: 'center', fmt: v => v ?? '—' },
    { label: 'Sales in Ledger Currency',        key: 'sales_ledger_currency', align: 'right',
      fmt: (v, row) => {
        if (v === null || v === undefined) return '—';
        const prefix = (row.ledger_currency && row.ledger_currency !== '—') ? `${row.ledger_currency} ` : '';
        return `${prefix}${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }
    },
    { label: '% Share',                         key: 'percentage',            align: 'right',  fmt: v => (v !== null && v !== undefined) ? `${Number(v).toFixed(2)}%` : '—' },
  ];

  const parentDivisionCols = [
    { label: 'Parent Division',          key: 'parent_division',        align: 'left'   },
    { label: 'Ledger Currency',          key: 'ledger_currency',        align: 'center', fmt: v => v ?? '—' },
    { label: 'Sales in Ledger Currency', key: 'sales_ledger_currency',  align: 'right',
      fmt: (v, row) => {
        if (v === null || v === undefined) return '—';
        const prefix = (row.ledger_currency && row.ledger_currency !== '—') ? `${row.ledger_currency} ` : '';
        return `${prefix}${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }
    },
    { label: `Sales (${rc})`,            key: 'sales',                  align: 'right',  fmt: v => (v !== null && v !== undefined) ? fmtCurrency(v) : '—' },
    { label: '% Share',                  key: 'percentage',             align: 'right',  fmt: v => (v !== null && v !== undefined) ? `${Number(v).toFixed(2)}%` : '—' },
  ];

  const subdivisionCols = [
    { label: 'Legal Entity',              key: 'legal_entity',          align: 'left',   fmt: (v, row) => v ?? row.entity_name ?? '—' },
    { label: 'Sub-Division',              key: 'subdivision_name',       align: 'left',   fmt: (v, row) => v ?? row.subdivision ?? row.name ?? '—' },
    { label: 'Parent Division',           key: 'parent_division',        align: 'left',   fmt: (v, row) => v ?? row.division_name ?? '—' },
    { label: 'Ledger Currency',           key: 'ledger_currency',        align: 'center', fmt: (v, row) => v ?? '—' },
    { label: 'Sales in Ledger Currency',  key: 'sales_ledger_currency',  align: 'right',
      fmt: (v, row) => {
        const cur = row.ledger_currency || '';
        return (v !== null && v !== undefined)
          ? `${cur} ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`.trim()
          : '—';
      }
    },
    { label: `Sales in ${rc}`,            key: 'sales_aed',              align: 'right',  fmt: (v, row) => fmtCurrency(v ?? row.sales ?? row.sales_reporting_currency ?? 0) },
    { label: '% Share',                   key: 'percentage',             align: 'right',  fmt: (v) => (v !== null && v !== undefined) ? `${Number(v).toFixed(2)}%` : '—' },
  ];

  const customerSummaryCols = [
    { label: 'Customer Name',    key: 'customer_name',           align: 'left'  },
    { label: 'Account Number',   key: 'customer_account_number', align: 'left'  },
    { label: `Sales (${rc})`,    key: 'sales',                   align: 'right', fmt: fmtCurrency },
    // Gross Margin currency treatment under review — not changing
    { label: 'Gross Margin',     key: 'gross_margin',            align: 'right', fmt: fmtCurrency },
    { label: '% Share',          key: 'percentage',              align: 'right', fmt: v => fmtPct(v) },
    // # Transactions removed — field blank (not returned by endpoint)
    // Currency removed — field blank (not returned by endpoint)
  ];

  const customerDetailCols = [
    { label: 'Account Number',   key: 'customer_account_number', align: 'left' },
    { label: 'Customer Name',    key: 'customer_name',           align: 'left' },
    { label: 'Legal Entity',     key: 'legal_entity',            align: 'left' },
    { label: 'Ledger Currency',  key: 'ledger_currency',         align: 'center', fmt: (v) => v ?? '—' },
    { label: 'Sales in Ledger Currency', key: 'sales_ledger_currency', align: 'right',
      fmt: (v, row) => {
        const cur = row.ledger_currency || '';
        return (v !== null && v !== undefined)
          ? `${cur} ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`.trim()
          : '—';
      }
    },
    { label: `Revenue (${rc})`,  key: 'sales',                   align: 'right', fmt: fmtCurrency },
    // Gross Margin currency treatment under review — not changing
    { label: 'Gross Margin',     key: 'gross_margin',            align: 'right', fmt: fmtCurrency },
    { label: '% Share',          key: 'contribution_pct',        align: 'right', fmt: v => fmtPct(v) },
  ];

  // Salesman View All — aggregated
  const salesmanSummaryCols = [
    { label: 'Sales Person',   key: 'salesman_name',    align: 'left' },
    { label: `Sales (${rc})`,  key: 'sales',            align: 'right', fmt: fmtCurrency },
    // Gross Margin currency treatment under review — not changing
    { label: 'Gross Margin',   key: 'gross_margin',     align: 'right', fmt: fmtCurrency },
    { label: '% Share',        key: 'percentage',       align: 'right', fmt: v => fmtPct(v) },
    // # Transactions removed — field blank
    // Currency removed — field blank
  ];

  // Salesman Detail drill-down — 13 columns per spec
  const salesmanDetailCols = [
    { label: 'Emp ID',            key: 'employee_id',          align: 'left'  },
    { label: 'Salesman',          key: 'sales_person',         align: 'left'  },
    { label: 'Direct Manager',    key: 'direct_manager',       align: 'left'  },
    { label: 'Manager Level',     key: 'direct_manager_level', align: 'left'  },
    { label: 'Sales Manager',     key: 'sales_manager',        align: 'left'  },
    { label: 'Division Manager',  key: 'division_manager',     align: 'left'  },
    { label: 'Legal Entity',      key: 'legal_entity',         align: 'left'  },
    { label: 'Parent Division',   key: 'parent_division',      align: 'left'  },
    { label: 'Subdivision',       key: 'subdivision',          align: 'left'  },
    { label: 'Ledger Currency',   key: 'ledger_currency',      align: 'center', fmt: (v) => v ?? '—' },
    { label: 'Sales in Ledger Currency', key: 'sales_ledger_currency', align: 'right',
      fmt: (v, row) => {
        const cur = row.ledger_currency || '';
        return (v !== null && v !== undefined)
          ? `${cur} ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`.trim()
          : '—';
      }
    },
    { label: `Revenue (${rc})`,   key: 'sales',                align: 'right', fmt: fmtCurrency },
    // Gross Margin currency treatment under review — not changing
    { label: `Gross Margin`,      key: 'gross_margin',         align: 'right', fmt: fmtCurrency },
    { label: '% Share',           key: 'contribution_pct',     align: 'right',
      fmt: (v, row) => {
        const val = v ?? row?.percentage;
        return val != null ? `${Number(val).toFixed(2)}%` : '—';
      }
    },
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
        padding: '20px 0 32px',
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
              <br/><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 4, fontWeight: 600 }}>Viewing: {appliedFilters.fromDate} to {appliedFilters.toDate}</span>
              {dataAsOf && ` • Data as on ${dataAsOf}`}
              &nbsp;|&nbsp;
              <span style={{ color: C.green, fontWeight: 700 }}>Currency: {filters.reportingCurrency}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {canExport && <ExportButtons endpoint="details" filters={appliedFilters} size="md" />}
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
                Data Fetch Error
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                {Object.values(errors).filter(Boolean).map((e, i) => <div key={i}>{e}</div>)}
              </div>
            </div>
          </div>
        )}

        {/* ── Filter Options Error ── */}
        {errors.filters && (
          <div style={{ marginBottom: 12 }}>
            <ErrorBanner message={`Filter options: ${errors.filters}`} />
          </div>
        )}


        {/* ── Authorized Scope Banner (For Single-Scope Context) ── */}
        {(filterOptions.legalEntities.length === 2 || filterOptions.parentDivs.length === 2 || filterOptions.subDivs.length === 2 || filterOptions.salesmen.length === 2) && (
          <div className="card" style={{ padding: '16px 20px', marginBottom: 16, backgroundColor: '#f8fafc', borderLeft: '4px solid #4f46e5' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <svg style={{ marginRight: 8 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Your Authorized Scope</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 'auto' }}>Data shown is restricted to your assigned access scope.</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              {filterOptions.legalEntities.length === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Legal Entity</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{filterOptions.legalEntities[1]}</span>
                </div>
              )}
              {filterOptions.parentDivs.length === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Parent Division</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{filterOptions.parentDivs[1]}</span>
                </div>
              )}
              {filterOptions.subDivs.length === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Sub-Division</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{filterOptions.subDivs[1]}</span>
                </div>
              )}
              {filterOptions.salesmen.length === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Salesman</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                    {typeof filterOptions.salesmen[1] === 'string' ? filterOptions.salesmen[1] : (filterOptions.salesmen[1]?.label || filterOptions.salesmen[1]?.salesman_name || filterOptions.salesmen[1]?.sales_person || String(filterOptions.salesmen[1]))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Filter Bar ── */}

        <div className="card" style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'nowrap', overflowX: 'auto' }}>
          {filterOptions.legalEntities.length > 2 && (
          <FilterField label="Legal Entity">
            <select id="filter-legal-entity" style={{...selStyle, opacity: filterOptions.legalEntities.length <= 2 ? 0.6 : 1}} disabled={filterOptions.legalEntities.length <= 2} value={filters.legalEntity} onChange={e => updateFilter('legalEntity', e.target.value)}>
              {filterOptions.legalEntities.map(o => <option key={o}>{o}</option>)}
            </select>
          </FilterField>
          )}

          {filterOptions.parentDivs.length > 2 && (
          <FilterField label="Parent Division">
            <select id="filter-parent-div" style={{...selStyle, opacity: filterOptions.parentDivs.length <= 2 ? 0.6 : 1}} disabled={filterOptions.parentDivs.length <= 2} value={filters.parentDiv} onChange={e => updateFilter('parentDiv', e.target.value)}>
              {filterOptions.parentDivs.map(o => <option key={o}>{o}</option>)}
            </select>
          </FilterField>
          )}

          {filterOptions.subDivs.length > 2 && (
          <FilterField label="Sub-Division">
            <select id="filter-sub-div" style={{...selStyle, opacity: filterOptions.subDivs.length <= 2 ? 0.6 : 1}} disabled={filterOptions.subDivs.length <= 2} value={filters.subDiv} onChange={e => updateFilter('subDiv', e.target.value)}>
              {filterOptions.subDivs.map(o => <option key={o}>{o}</option>)}
            </select>
          </FilterField>
          )}

          {filterOptions.salesmen.length > 2 && (
          <FilterField label="Salesman">
            <select id="filter-salesman" style={{...selStyle, opacity: filterOptions.salesmen.length <= 2 ? 0.6 : 1}} disabled={filterOptions.salesmen.length <= 2} value={filters.salesman} onChange={e => updateFilter('salesman', e.target.value)}>
              {filterOptions.salesmen.map((o, idx) => {
                // Guarantee o is always a string (belt-and-suspenders guard)
                const label = typeof o === 'string' ? o : (o?.label ?? o?.salesman_name ?? o?.sales_person ?? String(o));
                const val   = typeof o === 'string' ? o : (o?.employee_id ?? o?.value ?? label);
                return <option key={`salesman-${idx}`} value={val}>{label}</option>;
              })}
            </select>
          </FilterField>
          )}

          <FilterField label="Reporting Currency">
            <select id="filter-currency" style={selStyle} value={filters.reportingCurrency} onChange={e => updateFilter('reportingCurrency', e.target.value)}>
              {filterOptions.reportingCurrencies.map(o => {
  const val = typeof o === 'object' ? (o.currency_code || o.currency) : o;
  return <option key={val} value={val}>{val}</option>;
})}
            </select>
          </FilterField>
          {filterOptions.invoiceCurrencies.length > 1 && (
            <FilterField label="Invoice Currency">
              <select id="filter-invoice-currency" style={selStyle} value={filters.invoiceCurrency} onChange={e => updateFilter('invoiceCurrency', e.target.value)}>
                {filterOptions.invoiceCurrencies.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </FilterField>
          )}

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
            ...headerBtn(C.blue, '#fff'), alignSelf: 'center',
            padding: '7px 20px', fontWeight: 700, borderRadius: 8,
          }}>Apply</button>
          <button id="btn-reset-filter" onClick={handleReset} style={{
            background: 'none', border: 'none', color: C.slate,
            fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
            alignSelf: 'center', padding: '7px 8px',
          }}>Reset</button>
        </div>

        {/* ── Revenue Dashboard KPI Cards ── */}
        <div className="grid-cols-6" style={{ marginBottom: 16 }}>

          {/* 1. Total Sales (MTD) */}
          <KPICard currency={filters.reportingCurrency}
            label={"Total Sales (MTD)"}
            numericValue={mtdRevenue}
            changePct={mtdChangePct}
            changeLabel="vs Mar 2024"
            up={mtdChangePct !== null ? mtdChangePct >= 0 : null}
            icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>}
            iconBg="#dbeafe"
            cardBg="#f0f5ff"
            accentColor="#2563eb"
            sparkData={sparkMTD}
            sparkColor="#2563eb"
            loading={loading.summary}
            error={errors.summary}
          />

          {/* 2. Sales (YTD) */}
          <KPICard currency={filters.reportingCurrency}
            label={"Sales (YTD)"}
            numericValue={ytdRevenue}
            changePct={ytdChangePct}
            changeLabel="vs YTD Apr 2023"
            up={ytdChangePct !== null ? ytdChangePct >= 0 : null}
            icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
            iconBg="#dcfce7"
            cardBg="#f0fdf4"
            accentColor="#16a34a"
            sparkData={sparkMTD}
            sparkColor="#16a34a"
            loading={loading.summary}
            error={errors.summary}
          />

          {/* 3. Gross Profit (MTD) */}
          <KPICard currency={filters.reportingCurrency}
            label={"Gross Profit (MTD)"}
            numericValue={grossMargin}
            changePct={grossMarginChg}
            changeLabel="vs Mar 2024"
            up={grossMarginChg !== null ? grossMarginChg >= 0 : null}
            icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>}
            iconBg="#ede9fe"
            cardBg="#f5f3ff"
            accentColor="#8b5cf6"
            sparkData={sparkMTD}
            sparkColor="#8b5cf6"
            loading={loading.summary}
            error={errors.summary}
          />

          {/* 4. Top Legal Entity */}
          <KPICard currency={filters.reportingCurrency}
            label="Top Legal Entity"
            numericValue={null}
            textValue={topLE ? topLE.name : '—'}
            changePct={null}
            changeLabel={topLE?.value ? `${filters.reportingCurrency} ${fmtAxisNum(topLE.value)}` : ''}
            up={null}
            icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>}
            iconBg="#ffedd5"
            cardBg="#fff7ed"
            accentColor="#ea580c"
            sparkData={null}
            sparkColor="#ea580c"
            loading={loading.summary}
            error={errors.summary}
          />

          {/* 5. Top Parent Division */}
          <KPICard currency={filters.reportingCurrency}
            label="Top Parent Division"
            numericValue={null}
            textValue={topPD ? topPD.name : '—'}
            changePct={null}
            changeLabel={topPD?.value ? `${filters.reportingCurrency} ${fmtAxisNum(topPD.value)}` : ''}
            up={null}
            icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>}
            iconBg="#cffafe"
            cardBg="#ecfeff"
            accentColor="#0891b2"
            sparkData={null}
            sparkColor="#0891b2"
            loading={loading.summary}
            error={errors.summary}
          />

          {/* 6. Top Salesman */}
          <KPICard currency={filters.reportingCurrency}
            label="Top Salesman"
            numericValue={null}
            textValue={topSalesmanName}
            changePct={null}
            changeLabel={topSalesmanValue !== null ? `${filters.reportingCurrency} ${fmtAxisNum(topSalesmanValue)}` : ''}
            up={null}
            icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>}
            iconBg="#fce7f3"
            cardBg="#fdf2f8"
            accentColor="#db2777"
            sparkData={null}
            sparkColor="#db2777"
            loading={loading.summary}
            error={errors.summary}
          />
        </div>

        {/* ── Main Dashboard Charts Row ── */}
        {/* flex-wrap: hidden charts leave no blank columns */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--card-gap, 16px)', marginBottom: 16, alignItems: 'stretch' }}>

          {/* 1. Revenue Trend (Line Chart) */}
          <motion.div
            whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(0, 0, 0, 0.08)" }}
            className="card animate-fade-slide-up"
            style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.4s ease', flex: '1 1 300px', minWidth: 300 }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Revenue Trend ({filters.reportingCurrency})</div>
                {(() => {
                  const activePts = trendData.filter(d => d.currentYear != null && d.currentYear > 0);
                  if (activePts.length === 1) {
                    return <div key={activePts[0].period} className="animate-pop-in" style={{ fontSize: '0.72rem', color: C.muted, marginTop: 2 }}>{activePts[0].period} · Single period view</div>;
                  }
                  if (activePts.length > 1) {
                    return <div key={activePts.length} className="animate-pop-in" style={{ fontSize: '0.72rem', color: C.muted, marginTop: 2 }}>{activePts.length} periods · Current Year</div>;
                  }
                  return null;
                })()}
              </div>
              <ChartMenu onViewAll={() => setOpenModal('trend')} endpoint="trend" filters={appliedFilters} />
            </div>

            <AnimatePresence mode="wait">

            {loading.trend ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8, margin: '12px 0' }} />
            ) : errors.trend ? (
              <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.78rem', paddingTop: 60 }}>⚠ Failed to load</div>
            ) : trendData.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 60 }}>No trend data available</div>
            ) : (() => {
              const activePts = trendData.filter(d => d.currentYear != null && d.currentYear > 0);
              const isSingle  = activePts.length <= 1;
              const singlePt  = isSingle ? (activePts[0] || trendData[0]) : null;
              const totalAED  = trendData.reduce((s, d) => s + (d.currentYear || 0), 0);

              if (isSingle && singlePt) {
                const rawVal  = singlePt.currentYear || 0;
                const fmtBig  = fmtAxisNum(rawVal);
                const fmtExact = rawVal.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                return (
                  <motion.div
                    key={`single-${singlePt.period}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: 8 }}
                  >
                      {/* Date pill */}
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: '#eff6ff', border: '1px solid #bfdbfe',
                        borderRadius: 20, padding: '3px 12px',
                        fontSize: '0.72rem', fontWeight: 700, color: '#2563eb',
                        marginBottom: 14,
                      }}>
                        <span>🗓</span>
                        <span>{singlePt.period}</span>
                      </div>

                      {/* Large amount */}
                      <motion.div whileHover={{ scale: 1.03 }} className="animate-float-glow" style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.5px' }}>
                        {filters.reportingCurrency} <CountUp end={rawVal} formatter={fmtAxisNum} duration={1.5} />
                      </motion.div>
                    <div style={{ fontSize: '0.78rem', color: C.muted, marginTop: 6, fontWeight: 500 }}>
                      {filters.reportingCurrency} <CountUp end={rawVal} duration={1.5} formatter={(v) => v.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} />
                    </div>

                    {/* Single bar */}
                    <div style={{ width: '100%', marginTop: 24, marginBottom: 12 }}>
                      <ResponsiveContainer width="100%" height={180} minWidth={0}>
                        <BarChart data={[singlePt]} margin={{ top: 20, right: 40, left: 0, bottom: 0 }} maxBarSize={64}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="transparent" />
                          <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} axisLine={{ stroke: '#e2e8f0', strokeWidth: 2 }} tickLine={false} dy={8} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickCount={5} axisLine={false} tickLine={false} tickFormatter={fmtAxisNum} width={60} />
                          <Tooltip content={<CustomTooltip currency={filters.reportingCurrency} />} cursor={{ fill: 'rgba(226, 232, 240, 0.4)', rx: 8, ry: 8 }} offset={35} position={{ y: -30 }} wrapperStyle={{ animation: 'popIn 0.3s ease-out forwards' }} />
                          <Bar dataKey="currentYear" name="Sales" radius={[8, 8, 0, 0]} className="animate-bar-grow" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                            <Cell fill="url(#trendBarGrad)" filter="url(#barGlow)" />
                          </Bar>
                          <defs>
                            <linearGradient id="trendBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                              <stop offset="100%" stopColor="#818cf8" stopOpacity={0.4} />
                            </linearGradient>
                            <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.3" />
                            </filter>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Hint banner */}
                    <div style={{
                      width: 'calc(100% - 32px)', marginTop: 'auto',
                      padding: '12px 20px', borderRadius: 8,
                      background: '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontSize: '0.78rem', color: '#4f46e5', fontWeight: 700,
                    }}>
                      <span>💡</span>
                      <span>Broaden the date range to see a full revenue trend line</span>
                    </div>
                  </motion.div>
                );
              }

              /* ── Multi-period line chart (premium layout) ── */
              return (
                <motion.div
                  key={`multi-${activePts.length}-${activePts[0]?.period}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  <div style={{ flex: 1, minHeight: 160, width: '100%', marginTop: 8 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={100}>
                    <AreaChart data={activePts} margin={{ top: 24, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.25" />
                        </filter>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}>
                            <animate attributeName="stopOpacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
                          </stop>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="grid-fade-in" />
                      <XAxis className="axis-fade-in" dataKey="period" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} dy={8} padding={{ left: 24, right: 34 }} />
                      <YAxis className="axis-fade-in" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickCount={5} axisLine={false} tickLine={false} tickFormatter={fmtAxisNum} width={60} />
                      <Tooltip content={<CustomTooltip currency={filters.reportingCurrency} />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} position={{ y: -30 }} wrapperStyle={{ zIndex: 100, animation: 'popIn 0.3s ease-out forwards' }} />
                      <Area
                        type="monotone"
                        dataKey="currentYear"
                        name="Current Year"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fill="url(#areaGradient)"
                        filter="url(#lineShadow)"
                        dot={(props) => {
                          const { cx, cy, index, payload } = props;
                          if (index === activePts.length - 1 && payload.currentYear !== null) {
                            return (
                              <g key={`dot-${index}`}>
                                <circle cx={cx} cy={cy} r={6} fill="#fff" stroke="#6366f1" strokeWidth={3} filter="url(#lineShadow)" />
                                <circle cx={cx} cy={cy} r={6} fill="none" stroke="#6366f1" style={{ animation: 'pulse-ripple 2.5s infinite' }} />
                              </g>
                            );
                          }
                          return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill="#fff" stroke="#6366f1" strokeWidth={2} />;
                        }}
                        activeDot={{ r: 7, stroke: '#6366f1', strokeWidth: 3, fill: '#fff', filter: 'url(#lineShadow)' }}
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        <LabelList
                          dataKey="currentYear"
                          position="top"
                          content={(props) => {
                            const { x, y, index, value } = props;
                            // Only show label for the last data point
                            if (index === activePts.length - 1 && value !== null) {
                              return (
                                <g transform={`translate(${x},${y - 16})`}>
                                  <text
                                    x="0"
                                    y="0"
                                    fill="#4f46e5"
                                    fontSize="12"
                                    fontWeight="900"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    style={{
                                      textShadow: '0px 0px 4px #fff, 0px 0px 4px #fff, 0px 0px 6px #fff'
                                    }}
                                  >
                                      <CountUp end={value} formatter={fmtAxisNum} />
                                    </text>
                                </g>
                              );
                            }
                            return null;
                          }}
                        />
                      </Area>
                    </AreaChart>
                  </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                      <span style={{ width: 20, height: 4, background: '#6366f1', display: 'inline-block', borderRadius: 2 }} />
                      Current Year
                    </div>
                    {(() => {
                      const latest = [...trendData].reverse().find(d => d.currentYear != null);
                      if (latest) {
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                            <span style={{ color: '#64748b' }}>Latest:</span>
                            <motion.span whileHover={{ scale: 1.05 }} style={{ color: '#6366f1', fontWeight: 800 }}>{filters.reportingCurrency} <CountUp end={latest.currentYear} formatter={fmtAxisNum} duration={1.5} /></motion.span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </motion.div>
              );
            })()}
            </AnimatePresence>
          </motion.div>


          {filterOptions.legalEntities.length > 2 && (
          <div className="card" style={{ padding: '16px 16px 16px', display: 'flex', flexDirection: 'column', flex: '1 1 300px', minWidth: 300 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>Revenue by Legal Entity</div>
                <div style={{ fontSize: '0.72rem', color: '#1e293b', marginTop: 3, fontWeight: 500 }}>{filters.reportingCurrency} contribution — 100% breakdown</div>
              </div>
              <ChartMenu onViewAll={() => setOpenModal('legalEntity')} endpoint="legal-entity-detail" filters={appliedFilters} />
            </div>

            {loading.legalEnt ? (
              <div style={{ flex: 1, minHeight: 200, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8, marginTop: 16 }} />
            ) : legalEntData.length > 0 ? (() => {
              const total = legalEntData.reduce((s, d) => s + (d.value || 0), 0);
              // Fix 2: count active segments to eliminate seam on 100% single-slice
              const activeSegments = legalEntData.filter(d => d.value > 0).length;
              return (
                <>
                  {/* ── Large centered donut ── */}
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                    <ResponsiveContainer width="100%" height={180} minWidth={0}>
                      <PieChart>
                        <Pie
                          data={legalEntData}
                          cx="50%"
                          cy="50%"
                          innerRadius={64}
                          outerRadius={88}
                          paddingAngle={activeSegments === 1 ? 0 : 2}
                          dataKey="value"
                          stroke="none"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {legalEntData.map((d, i) => (
                            <Cell key={i} fill={getEntityColor(d.name)} />
                          ))}
                        </Pie>

                        {/* Center: TOTAL label */}
                        <text
                          x="50%" y="44%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{ fontSize: '0.55rem', fontWeight: 600, fill: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase' }}
                        >
                          TOTAL
                        </text>

                        {/* Center: AED value */}
                        <text
                          x="50%" y="58%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{ fontSize: '1rem', fontWeight: 900, fill: '#0f172a' }}
                        >
                          {filters.reportingCurrency} {fmtAxisNum(total)}
                        </text>

                        <Tooltip content={<CustomTooltip currency={filters.reportingCurrency} />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* ── 2-column legend grid ── */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px 12px',
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: `1px solid ${C.border}`,
                  }}>
                    {legalEntData.map((d, i) => {
                      const color = getEntityColor(d.name);
                      const isZero = !d.value || d.value === 0;
                      const pct = d.pct ?? (total > 0 ? (d.value / total) * 100 : 0);
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2, opacity: isZero ? 0.45 : 1 }}>
                          {/* Fix 5: Swatch + Name with ellipsis + title tooltip */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, minWidth: 0 }}>
                            <span style={{
                              flexShrink: 0,
                              width: 10, height: 10,
                              borderRadius: 3,
                              background: color,
                              marginTop: 3,
                            }} />
                            <span
                              title={d.name}
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#1e293b',
                                lineHeight: 1.35,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minWidth: 0,
                              }}
                            >
                              {d.name}
                            </span>
                          </div>
                          {/* Fix 4: consistent fmtAxisNum for both zero and non-zero values */}
                          <div style={{ paddingLeft: 17 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color }}>
                              {fmtAxisNum(d.value || 0)} <span style={{ fontWeight: 600, opacity: 0.9 }}>({pct.toFixed(1)}%)</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })() : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 80 }}>No data</div>
            )}
          </div>


          )}


          {filterOptions.parentDivs.length > 2 && (
          <div className="card" style={{ padding: '12px 16px 12px', display: 'flex', flexDirection: 'column', flex: '1 1 300px', minWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>Revenue by Parent Division</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 3, fontWeight: 500 }}>{filters.reportingCurrency} — top divisions ranked</div>
              </div>
              <ChartMenu onViewAll={() => setOpenModal('parentDiv')} endpoint="parent-division-detail" filters={appliedFilters} />
            </div>

            {loading.parentDiv ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ height: 11, width: `${55 + i * 5}%`, borderRadius: 4, background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                      <div style={{ height: 11, width: 36, borderRadius: 4, background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                    </div>
                    <div style={{ height: 7, borderRadius: 99, background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                  </div>
                ))}
              </div>
            ) : parentDivData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'space-between', paddingTop: 2, paddingBottom: 6 }}>
                {(() => {
                  const maxVal = Math.max(...parentDivData.map(d => d.value || 0), 1);
                  const totalVal = parentDivData.reduce((s, d) => s + (d.value || 0), 0);
                  return (
                    <>
                      {parentDivData.map((d, i) => {
                    const barPct = Math.max((d.value / maxVal) * 100, 3);
                    const isHovered = hoveredParentDiv === i;
                    const color = d.color || getEntityColor(d.name);
                    const label = (d.name || '').replace(/\n/g, ' ');

                    return (
                      <div
                        key={i}
                        style={{ position: 'relative', cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredParentDiv(i)}
                        onMouseLeave={() => setHoveredParentDiv(null)}
                      >
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{
                            fontSize: '0.85rem', fontWeight: 800,
                            color: isHovered ? color : '#1e293b',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            maxWidth: '70%', transition: 'color 0.2s'
                          }}>
                            {label}
                          </span>
                          <span style={{
                            fontSize: '0.85rem', fontWeight: 900,
                            color: isHovered ? color : '#1e293b',
                            flexShrink: 0, marginLeft: 8, transition: 'color 0.2s'
                          }}>
                            {fmtAxisNum(d.value)}
                          </span>
                        </div>
                        <div style={{ position: 'relative', height: 10, borderRadius: 99, background: isHovered ? '#e0f2fe' : '#f1f5f9', overflow: 'hidden', transition: 'background 0.2s' }}>
                          <div style={{
                            position: 'absolute', left: 0, top: 0, bottom: 0,
                            width: `${barPct}%`,
                            borderRadius: 99,
                            background: color,
                            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                          }} />
                        </div>

                        {/* Custom Tooltip */}
                        {isHovered && (
                          <div style={{
                            position: 'absolute',
                            left: '20%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#fff', border: `1px solid ${C.border}`,
                            borderRadius: 10, padding: '12px 16px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            zIndex: 50,
                            pointerEvents: 'none',
                            minWidth: 180,
                          }}>
                            <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: 8, fontSize: '0.85rem' }}>
                              {label}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', alignItems: 'center' }}>
                              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>Revenue</span>
                              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', textAlign: 'right' }}>
                                {filters.reportingCurrency} {Number(d.value || 0).toLocaleString()}
                              </span>

                              <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>Share</span>
                              <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.85rem', textAlign: 'right' }}>
                                {totalVal > 0 ? ((d.value / totalVal) * 100).toFixed(1) : 0}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                      })}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 6, marginTop: 2 }}>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>0</span>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{fmtAxisNum(maxVal / 2)}</span>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{fmtAxisNum(maxVal)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 80 }}>No data</div>
            )}
          </div>
          )}
        </div>

                {/* ── Tertiary Analysis Row (Sub-Division, Customers, Salesman) ── */}
        {/* Uses flex-wrap so that when any chart is conditionally hidden, remaining cards reflow naturally */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--card-gap, 16px)', marginBottom: 16, alignItems: 'stretch' }}>
          {/* 1. Subdivision */}
          {filterOptions.subDivs.length > 2 && (
          <div className="card" style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column', flex: '1 1 300px', minWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Revenue by Sub-Division ({filters.reportingCurrency})</div>
                <div style={{ fontSize: '0.68rem', color: C.muted, marginTop: 2 }}>{filters.reportingCurrency} — all sub-divisions compared</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => setExcludeOthers(!excludeOthers)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '4px 10px', borderRadius: 20,
                    background: !excludeOthers ? '#eef2ff' : '#f8fafc',
                    border: `1px solid ${!excludeOthers ? '#c7d2fe' : '#e2e8f0'}`,
                    color: !excludeOthers ? '#4f46e5' : '#64748b',
                    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s',
                    userSelect: 'none'
                  }}
                >
                  <div style={{
                    width: 28, height: 16, borderRadius: 10,
                    background: !excludeOthers ? '#6366f1' : '#cbd5e1',
                    position: 'relative',
                    transition: 'background 0.3s'
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: !excludeOthers ? 14 : 2,
                      width: 12, height: 12, borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                  Include Others
                </button>
                <ChartMenu onViewAll={() => setOpenModal('subDiv')} endpoint="subdivision-detail" filters={appliedFilters} />
              </div>
            </div>

            {loading.subDiv ? (
              <div style={{ flex: 1, minHeight: 200, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8, marginTop: 16 }} />
            ) : subDivData.length > 0 ? (
              <div style={{ width: '100%', marginTop: 12, flex: 1, minHeight: 260 }}>
                {(() => {
                  const filteredSubDivData = excludeOthers
                    ? subDivData.filter(d => d.name.trim().toLowerCase() !== 'others')
                    : subDivData;

                  return (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={100}>
                      <BarChart data={filteredSubDivData} margin={{ top: 20, right: 20, left: 20, bottom: 84 }} maxBarSize={56} barCategoryGap="20%">
                        <defs>
                          {filteredSubDivData.map((entry, index) => {
                            const globalIndex = subDivData.findIndex(d => d.name === entry.name);
                            const color = entry.color || CHART_COLORS[globalIndex % CHART_COLORS.length];
                            return (
                              <linearGradient key={`grad-${index}`} id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={1} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                              </linearGradient>
                            );
                          })}
                        </defs>
                        <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                          interval={0}
                          tick={(props) => {
                            const { x, y, payload, width, index } = props;
                            // Stagger labels to prevent collision: alternate Y position based on odd/even index
                            const yOffset = index % 2 === 0 ? 0 : 38;
                            // Force a strict fixed width to prevent text expanding and overlapping adjacent labels
                            const textWidth = 75;
                            return (
                              <g transform={`translate(${x},${y + yOffset})`}>
                                <foreignObject x={-textWidth/2} y={0} width={textWidth} height={50}>
                                  <div
                                    title={payload.value}
                                    style={{
                                      width: '100%',
                                      whiteSpace: 'normal',
                                      wordBreak: 'break-word',
                                      lineHeight: 1.15,
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      color: '#64748b',
                                      textAlign: 'center',
                                      paddingTop: '8px'
                                    }}
                                  >
                                    {payload.value}
                                  </div>
                                </foreignObject>
                              </g>
                            );
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                          tickFormatter={(val) => fmtAxisNum(val)}
                          width={44}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(226, 232, 240, 0.5)', rx: 8, ry: 8 }}
                          offset={24}
                          wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                          content={(props) => {
                            const { active, payload } = props;
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const index = subDivData.findIndex(d => d.name === data.name);
                              const color = data.color || CHART_COLORS[index % CHART_COLORS.length] || '#3b82f6';
                              const total = subDivData.reduce((s, d) => s + (d.value || 0), 0);
                              const share = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
                              return (
                                <div style={{
                                  background: '#fff', border: `1px solid ${C.border}`,
                                  borderRadius: 10, padding: '12px 16px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                  minWidth: 160,
                                }}>
                                  <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: 8, fontSize: '0.85rem' }}>
                                    {data.name}
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
                                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: color, marginRight: 6 }} />
                                      Revenue:
                                    </span>
                                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', textAlign: 'right' }}>
                                      {filters.reportingCurrency} {Number(data.value || 0).toLocaleString()}
                                    </span>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500, paddingLeft: 14 }}>Share:</span>
                                    <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.85rem', textAlign: 'right' }}>
                                      {share}%
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey="value"
                          radius={[8, 8, 0, 0]}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                        >
                          {filteredSubDivData.map((entry, index) => {
                            return <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} />;
                          })}
                          <LabelList
                            dataKey="value"
                            position="top"
                            content={(props) => {
                              const { x, y, width, value } = props;
                              return (
                                <text x={x + width / 2} y={y - 12} fill="#1e293b" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                                  {fmtAxisNum(value)}
                                </text>
                              );
                            }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 80 }}>No data</div>
            )}
          </div>
          )}

          {/* 2. Top Customers */}
          <div className="card" style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column', flex: '1 1 300px', minWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Top 10 Customers by Sales ({filters.reportingCurrency})</div>
              <ChartMenu onViewAll={() => setOpenModal('customerSummary')} endpoint="customer-summary" filters={appliedFilters} />
            </div>
            {loading.topCustomers ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : topCustomersData.length > 0 ? (
              <div style={{ flex: 1, overflowX: 'hidden', borderRadius: 8, border: `1px solid ${C.border}` }}>
                <table style={{ width: '100%', height: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center', width: '10%' }}>#</th>
                      <th style={{ textAlign: 'left', width: '38%', whiteSpace: 'normal' }}>Customer Name</th>
                      <th style={{ textAlign: 'right', width: '32%', whiteSpace: 'normal' }}>Sales ({filters.reportingCurrency})</th>
                      <th style={{ textAlign: 'right', width: '20%', whiteSpace: 'normal' }}>% Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const top10Customers = topCustomersData.slice(0, 10);
                      const grandTotalCustomers = top10Customers.reduce((s, c) => s + (Number(c.value) || 0), 0);
                      return top10Customers.map((c, i) => {
                        const salesVal = Number(c.value) || 0;
                        /* Use API pct if non-zero, otherwise compute client-side */
                        const pctVal = (Number(c.pct) !== 0)
                          ? Number(c.pct)
                          : (grandTotalCustomers > 0 ? (salesVal / grandTotalCustomers) * 100 : 0);
                        return (
                          <tr key={i}>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{i + 1}</td>
                            <td style={{ textAlign: 'left', fontWeight: 600, textTransform: 'capitalize', wordBreak: 'break-word', whiteSpace: 'normal', color: '#0f172a' }} title={c.name}>{(c.name || '').toLowerCase()}</td>
                            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                              {salesVal.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{`${pctVal.toFixed(2)}%`}</td>
                          </tr>
                        );
                      });
                    })()}
                    {(() => {
                      const top10 = topCustomersData.slice(0, 10);
                      const totalSales = top10.reduce((s, c) => s + (Number(c.value) || 0), 0);
                      const useApiPct = top10.some(c => Number(c.pct) !== 0);
                      const totalPct = useApiPct
                        ? top10.reduce((s, c) => s + (Number(c.pct) || 0), 0)
                        : 100;
                      return (
                        <tr style={{ background: '#f8fafc', fontWeight: 800, color: '#1e3a8a' }}>
                          <td colSpan={2} style={{ padding: '8px', textAlign: 'center' }}>Total</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            {totalSales.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{totalPct.toFixed(2)}%</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 60 }}>No data available</div>
            )}
          </div>

          {/* 3. Revenue by Salesman */}
          <div className="card" style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column', flex: '1 1 300px', minWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Revenue by Salesman ({filters.reportingCurrency})</div>
              <ChartMenu onViewAll={() => setOpenModal('salesmanSummary')} endpoint="salesman-summary" filters={appliedFilters} />
            </div>
            {loading.salesmanSummary ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : salesmanSummaryData.length > 0 ? (
              <div style={{ flex: 1, overflowX: 'hidden', borderRadius: 8, border: `1px solid ${C.border}` }}>
                <table style={{ width: '100%', height: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center', width: '10%' }}>#</th>
                      <th style={{ textAlign: 'left', width: '38%', whiteSpace: 'normal' }}>Salesman</th>
                      <th style={{ textAlign: 'right', width: '32%', whiteSpace: 'normal' }}>Sales ({filters.reportingCurrency})</th>
                      <th style={{ textAlign: 'right', width: '20%', whiteSpace: 'normal' }}>% Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesmanSummaryData.slice(0, 10).map((c, i) => {
                      const name = c.salesman || c.sales_person || c.salesman_name || 'Unknown';
                      const salesVal = Number(c.sales) || 0;
                      const pctVal = c.percentage != null ? Number(c.percentage) : null;
                      return (
                        <tr key={i}>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ textAlign: 'left', fontWeight: 600, wordBreak: 'break-word', whiteSpace: 'normal', color: '#0f172a' }} title={name}>{name}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                            {salesVal.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{pctVal != null ? `${pctVal.toFixed(2)}%` : '—'}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: '#f8fafc', fontWeight: 800, color: '#1e3a8a' }}>
                      <td colSpan={2} style={{ padding: '8px', textAlign: 'center' }}>
                        <span>Total</span>
                        <InfoTooltip text="This percentage represents the combined share of the Top 10 salespeople — not 100% of global revenue." />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {salesmanSummaryData.slice(0, 10).reduce((s, c) => s + (Number(c.sales) || 0), 0)
                          .toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        <span>{salesmanSummaryData.slice(0, 10).reduce((s, c) => s + (Number(c.percentage) || 0), 0).toFixed(2)}%</span>
                        <span style={{ display: 'block', fontSize: '8.5px', fontWeight: 500, color: '#6366f1', marginTop: 1, wordBreak: 'break-word', whiteSpace: 'normal' }}>Top 10 Aggregate</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 60 }}>No data available</div>
            )}
          </div>
        </div>

        {/* ── Sales Revenue Detailed View — sourced from /subdivision-detail ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 8, marginTop: 14 }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${C.border}`, background: '#fff', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e1b4b' }}>
                Sales Revenue Detailed View
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500, padding: '2px 8px', background: '#f1f5f9', borderRadius: 12 }}>
                Amounts in {filters.reportingCurrency}
              </span>
            </div>
            <ChartMenu onViewAll={() => setOpenModal('subDiv')} endpoint="subdivision-detail" filters={appliedFilters} />
          </div>

          {/* Table body */}
          {loading.subDiv ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 20px' }}>
              {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} h={16} />)}
            </div>
          ) : (() => {
            const n = (r, ...keys) => {
              for (const k of keys) {
                const v = r[k];
                if (v !== undefined && v !== null && v !== '') return Number(v);
              }
              return null;
            };

            /* Sort alphabetically by Legal Entity > Parent Division > Sub Division */
            const allRows = [...summaryDetailData].map(r => ({
                legalEntity: r.legal_entity  || r.name || '—',
                parentDiv:   r.parent_division || r.division || '—',
                subDiv:      r.sub_division || r.subdivision || r.sub_division_name || r.subdivision_name || r.sub_div || r.sub_division_code || r.subdivision_code || '—',
                bizUnit:     r.business_unit  || r.biz_unit || '—',
                mtd:         n(r, 'sales_mtd', 'revenue_mtd',     'mtd_revenue',      'sales_mtd_aed',      'mtd_sales'),
                prevMtd:     n(r, 'sales_prev_mtd', 'revenue_prev_mtd','prev_mtd_revenue', 'mtd_prev_revenue',   'sales_prev_mtd_aed', 'prev_mtd_sales'),
                ytd:         n(r, 'sales_ytd', 'revenue_ytd',     'ytd_revenue',      'sales_ytd_aed',      'ytd_sales'),
                ytdPy:       n(r, 'sales_ytd_py', 'revenue_ytd_py',  'revenue_ytd_prev', 'prev_ytd_revenue',   'sales_ytd_py_aed',   'sales_prev_ytd_aed', 'prev_ytd_sales'),
                varMtd:      n(r, 'variance_mtd_pct','mtd_var_pct',      'variance_mtd'),
                varYtd:      n(r, 'variance_ytd_pct','ytd_var_pct',      'variance_ytd'),
            })).sort((a, b) => {
              const cmp1 = a.legalEntity.localeCompare(b.legalEntity);
              if (cmp1 !== 0) return cmp1;
              const cmp2 = a.parentDiv.localeCompare(b.parentDiv);
              if (cmp2 !== 0) return cmp2;
              return a.subDiv.localeCompare(b.subDiv);
            });

            /* Aggregate top 10 + Others */
            let rows = allRows;
            if (allRows.length > 10) {
              const top10 = allRows.slice(0, 10);
              const others = allRows.slice(10);

              const mtd     = others.reduce((s, r) => s + (r.mtd || 0), 0);
              const prevMtd = others.reduce((s, r) => s + (r.prevMtd || 0), 0);
              const ytd     = others.reduce((s, r) => s + (r.ytd || 0), 0);
              const ytdPy   = others.reduce((s, r) => s + (r.ytdPy || 0), 0);

              const othersRow = {
                legalEntity: 'Others',
                parentDiv: '—',
                subDiv: '—',
                bizUnit: '—',
                mtd, prevMtd, ytd, ytdPy,
                varMtd: (prevMtd > 0 && mtd >= 0) ? ((mtd - prevMtd) / Math.abs(prevMtd)) * 100 : null,
                varYtd: (ytdPy > 0 && ytd >= 0)   ? ((ytd - ytdPy)   / Math.abs(ytdPy))   * 100 : null,
              };
              rows = [...top10, othersRow];
            }

            const totMTD    = allRows.reduce((s, r) => s + (r.mtd || 0),     0);
            const totPMTD   = allRows.reduce((s, r) => s + (r.prevMtd || 0), 0);
            const totYTD    = allRows.reduce((s, r) => s + (r.ytd || 0),     0);
            const totYTDPY  = allRows.reduce((s, r) => s + (r.ytdPy || 0),   0);

            /* formatters */
            const fmtAED = v => (v !== null && v !== undefined && !isNaN(v)) ? `${(v / 1e6).toFixed(2)}M` : '—';

            const calcVar = (cur, prev) =>
              (prev > 0 && cur >= 0) ? ((cur - prev) / Math.abs(prev)) * 100 : null;

            const VarBadge = ({ pct }) => {
              if (pct === null || pct === undefined || isNaN(pct)) return <span style={{ color: C.muted }}>N/A</span>;
              const up = pct >= 0;
              return (
                <span style={{
                  color: up ? '#16a34a' : '#dc2626',
                  fontWeight: 600, fontSize: '0.72rem',
                  display: 'inline-flex', alignItems: 'center', gap: 2,
                }}>
                  {up ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
                </span>
              );
            };

            const TH_S = {
              background: '#f8fafc',
              fontSize: '0.74rem',
              padding: '10px 10px',
              fontWeight: 700,
              color: '#1e3a8a',
              textAlign: 'center',
              borderBottom: '2px solid #e2e8f0',
            };
            const TD_S = {
              fontSize: '0.74rem', padding: '8px 10px',
              color: '#334155', fontWeight: 500, textAlign: 'center',
              borderBottom: '1px solid #f1f5f9',
            };
            const TD_FOOT = {
              ...TD_S,
              color: '#1e3a8a',
              fontWeight: 800,
              background: '#f8fafc',
              borderTop: '2px solid #e2e8f0',
              borderBottom: 'none',
            };

            /* ── Column spec per madam's review ───────────────────────────
               Legal Entity | Sub-Division | Parent Division |
               Ledger Currency | Sales in Ledger Currency |
               Sales in Reporting Currency | % Share
               MTD / YTD / Variance removed — endpoint doesn't provide them.
            ─────────────────────────────────────────────────────────────── */

            const rc = appliedFilters.reportingCurrency || 'AED';

            const fmtRC = v => (v !== null && v !== undefined && !isNaN(v))
              ? `${rc} ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
              : '—';
            // Only prepend currency if it is a real ISO code (not null / '—')
            const fmtLedger = (v, currency) => {
              if (v === null || v === undefined || isNaN(v)) return '—';
              const prefix = (currency && currency !== '—') ? `${currency} ` : '';
              return `${prefix}${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            };

            const COLS = [
              'Legal Entity', 'Sub-Division', 'Parent Division',
              'Ledger Currency',
              'Sales in Ledger Currency',
              `Sales in ${rc}`,
              '% Share',
            ];

            // Map subdivisionRawData rows — field names from /subdivision-detail endpoint
            // Fields confirmed by Madam: ledger_currency, sales_ledger_currency, sales_aed, percentage
            const detailRows2 = [...subdivisionRawData].map(r => ({
              legalEntity:    r.legal_entity   || r.entity_name                              || '—',
              subDiv:         r.subdivision    || r.subdivision_name || r.sub_division || r.sub_div || '—',
              parentDiv:      r.parent_division || r.division_name  || r.division             || '—',
              ledgerCurrency: r.ledger_currency ?? null,
              salesLedger:    r.sales_ledger_currency ?? null,
              salesRC:        r.sales_aed ?? null,
              pct:            r.percentage ?? null,
            })).sort((a, b) => {
              const c1 = a.legalEntity.localeCompare(b.legalEntity);
              if (c1 !== 0) return c1;
              const c2 = a.parentDiv.localeCompare(b.parentDiv);
              if (c2 !== 0) return c2;
              return a.subDiv.localeCompare(b.subDiv);
            });

            return (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {COLS.map((h, i) => (
                        <th key={h} style={{ ...TH_S, textAlign: i < 3 ? 'left' : 'center' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailRows2.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ ...TD_S, textAlign: 'center', color: C.muted, padding: '40px 14px' }}>
                          No data available for the selected filters
                        </td>
                      </tr>
                    ) : detailRows2.map((row, idx) => {
                      const bgBase = idx % 2 === 0 ? '#fff' : '#fafbfd';
                      return (
                        <tr key={idx}
                          style={{ background: bgBase, transition: 'background 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = bgBase; }}
                        >
                          <td style={{ ...TD_S, textAlign: 'left', fontWeight: 600, color: '#1e1b4b' }}
                              title={row.legalEntity}>{row.legalEntity}</td>
                          <td style={{ ...TD_S, textAlign: 'left' }}>{row.subDiv}</td>
                          <td style={{ ...TD_S, textAlign: 'left' }}>{row.parentDiv}</td>
                          <td style={{ ...TD_S, textAlign: 'center', fontWeight: 600 }}>
                            {row.ledgerCurrency || '—'}
                          </td>
                          <td style={{ ...TD_S, textAlign: 'right' }}>{fmtLedger(row.salesLedger, row.ledgerCurrency)}</td>
                          <td style={{ ...TD_S, textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>{fmtRC(row.salesRC)}</td>
                          <td style={{ ...TD_S, textAlign: 'right' }}>
                            {row.pct !== null && row.pct !== undefined ? `${Number(row.pct).toFixed(2)}%` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* Footer note */}
          <div style={{ fontSize: '0.62rem', color: C.muted, padding: '8px 20px 10px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 4 }}>
            <span>All values are in <strong>{filters.reportingCurrency}</strong> &nbsp;|&nbsp; {dataAsOf && `Data as on ${dataAsOf}`}</span>
            <span>Source: Oracle Fusion Cloud</span>
          </div>
        </div>
        {/* ── Footer ── */}
        <div style={{
          fontSize: '0.65rem', color: C.muted,
          display: 'flex', justifyContent: 'space-between',
          paddingTop: 10, paddingBottom: 4, flexWrap: 'wrap', gap: 4,
        }}>
          <span>
            All values are in <strong>{filters.reportingCurrency}</strong>&nbsp;|&nbsp;
            {dataAsOf && `Data as on ${dataAsOf}`}&nbsp;|&nbsp;
            <span style={{ color: C.green, fontWeight: 700 }}>● Live</span>
          </span>
          <span>☁️ Source: Oracle Fusion Cloud</span>
        </div>

      </div>

      {/* ── View-All Modals ── */}

      {/* Legal Entity Detail Modal — 6 cols (Legal Entity, 3×Revenue, Ledger Currency, Sales in Ledger) */}
      <DetailApiModal
        canExport={canExport}
        isOpen={openModal === 'legalEntity'}
        onClose={() => setOpenModal(null)}
        title="Legal Entity — Full Detail View"
        endpoint="legal-entity-detail"
        fetchFn={fetchLegalEntityDetail}
        columnDefs={legalEntityCols}
        filters={appliedFilters}

        searchPlaceholder="Search legal entities..."
      />

      {/* Parent Division Detail Modal — 7 cols */}
      <DetailApiModal
        canExport={canExport}
        isOpen={openModal === 'parentDiv'}
        onClose={() => setOpenModal(null)}
        title="Parent Division — Full Detail View"
        endpoint="parent-division-detail"
        fetchFn={fetchParentDivisionDetail}
        columnDefs={parentDivisionCols}
        filters={appliedFilters}

        searchPlaceholder="Search parent divisions..."
      />

      {/* Sub-Division Detail Modal — 7 cols (wide) */}
      <DetailApiModal
        canExport={canExport}
        isOpen={openModal === 'subDiv'}
        onClose={() => setOpenModal(null)}
        title="Sub-Division — Full Detail View"
        endpoint="subdivision-detail"
        fetchFn={fetchSubdivisionDetail}
        columnDefs={subdivisionCols}
        filters={appliedFilters}

        searchPlaceholder="Search sub-divisions..."
      />

      {/* Salesman View All Modal — uses /salesman-summary (aggregated) */}
      <DetailApiModal
        canExport={canExport}
        isOpen={openModal === 'salesmanSummary'}
        onClose={() => setOpenModal(null)}
        title="Salesman Summary — All Salespeople"
        endpoint="salesman-summary"
        fetchFn={fetchSalesmanSummary}
        columnDefs={salesmanSummaryCols}
        filters={appliedFilters}

        searchPlaceholder="Search salespeople..."
      />

      {/* Salesman Detail Drill-Down Modal — uses /salesman-detail (14 cols) */}
      <DetailApiModal
        canExport={canExport}
        isOpen={openModal === 'salesmanDetail'}
        onClose={() => setOpenModal(null)}
        title="Salesman Detail — Transaction Drill-Down"
        endpoint="salesman-detail"
        fetchFn={fetchSalesmanDetail}
        columnDefs={salesmanDetailCols}
        filters={appliedFilters}

        searchPlaceholder="Search salesman detail..."
      />

      {/* Customer Summary Modal */}
      <DetailApiModal
        canExport={canExport}
        isOpen={openModal === 'customerSummary'}
        onClose={() => setOpenModal(null)}
        title="Customer Summary — All Customers"
        endpoint="customer-summary"
        fetchFn={fetchCustomerSummary}
        columnDefs={customerSummaryCols}
        filters={appliedFilters}

        searchPlaceholder="Search customers..."
      />

      {/* Customer Detail Drill-Down Modal */}
      <DetailApiModal
        canExport={canExport}
        isOpen={openModal === 'customerDetail'}
        onClose={() => setOpenModal(null)}
        title="Customer Detail — Full Breakdown"
        endpoint="customer-detail"
        fetchFn={fetchCustomerDetail}
        columnDefs={customerDetailCols}
        filters={appliedFilters}

        searchPlaceholder="Search customer detail..."
      />

      {/* Summary Detail Drill-Down Modal */}
      <DetailApiModal
        canExport={canExport}
        isOpen={openModal === 'summaryDetail'}
        onClose={() => setOpenModal(null)}
        title="Sales Revenue Detailed View — All Data"
        endpoint="summary-detail"
        fetchFn={fetchSummaryDetail}

        columnDefs={(() => {
          const cur = appliedFilters.reportingCurrency || 'AED';
          // Compact formatter: 1.43M / 890K / 4.75K
          const fmtC = v => {
            if (v == null) return '—';
            const n = Number(v);
            if (Math.abs(n) >= 1_000_000) return `${cur} ${(n / 1_000_000).toFixed(2)}M`;
            if (Math.abs(n) >= 1_000)     return `${cur} ${(n / 1_000).toFixed(1)}K`;
            return `${cur} ${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          };
          return [
            { key: 'legal_entity',    label: 'Legal Entity',      align: 'left',  width: '18%' },
            { key: 'parent_division', label: 'Parent Division',    align: 'left',  width: '14%' },
            { key: 'subdivision',     label: 'Sub Division',       align: 'left',  width: '14%' },
            { key: 'ledger_currency', label: 'Ledger Currency',    align: 'center',width: '12%', fmt: v => v || '—' },
            { key: 'sales_ledger_currency', label: 'Sales in Ledger Currency', align: 'right', width: '15%',
              fmt: (v, row) => {
                // Only prepend ledger currency if it's a real ISO code
                const ledgerCur = (row.ledger_currency && row.ledger_currency !== '—') ? `${row.ledger_currency} ` : '';
                return (v != null)
                  ? `${ledgerCur}${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  : '—';
              }
            },
            { key: 'sales',           label: `Sales (${cur})`,     align: 'right', width: '15%', fmt: (v, row) => fmtC(v ?? row.revenue_mtd) },
            { key: 'percentage',      label: '% Share',            align: 'right', width: '12%',
              fmt: (v, row) => (v != null || row.contribution_pct != null) ? `${Number(v ?? row.contribution_pct).toFixed(2)}%` : '—'
            },
          ];
        })()}
        filters={appliedFilters}
        searchPlaceholder="Search detailed view..."
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
                    {['Period', `${currentYearLabel} Sales (${appliedFilters.reportingCurrency})`].map((h, i) => (
                      <th key={h} style={{ ...TH, textAlign: i === 0 ? 'left' : 'right', position: 'sticky', top: 0, background: '#fff', zIndex: 2, borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f8fafc'}
                    >
                      <td style={{ ...TD, fontWeight: 600, color: C.navy }}>{row.period}</td>
                      <td style={{ ...TD, textAlign: 'right', fontWeight: 700, color: C.green }}>{fmtCurrency(row.currentYear)}</td>
                    </tr>
                  ))}
                  {trendData.length > 0 && (
                    <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f8fafc' }}>
                      <td style={{ ...TD, fontWeight: 800, color: C.navy }}>Total</td>
                      <td style={{ ...TD, textAlign: 'right', fontWeight: 800, color: C.navy }}>
                        {fmtCurrency(trendData.reduce((s, r) => s + (r.currentYear || 0), 0))}
                      </td>
                    </tr>
                  )}
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
