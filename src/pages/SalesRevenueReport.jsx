import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  AreaChart, Area,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
} from 'recharts';
import {
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
  legalGroup:  'All',
  legalEntity: 'All',
  parentDiv:   'All',
  subDiv:      'All',
  salesman:    'All',
  invoiceCurrency: 'AED',
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
      // Demo / no-token path: fire-and-forget
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
            <ExportButtons endpoint={endpoint} filters={filters} />
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '0 20px 16px' }}>
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
                      ...TH, padding: '10px 10px',
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
function KPICard({ label, numericValue, textValue, changePct, changeLabel, up, icon, iconBg, sparkData, sparkColor, loading, error, cardBg, accentColor }) {
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
    ? `AED ${fmtAxisNum(displayVal)}`
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
        border: `1.5px solid ${hover ? accent + '55' : 'transparent'}`,
        padding: '16px 16px 12px',
        boxShadow: hover
          ? `0 8px 28px ${accent}22`
          : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.22s ease',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Left: Icon */}
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', flexShrink: 0, color: accent,
        }}>{icon}</div>

        {/* Right: Label and Value */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
          <span style={{
            fontSize: '0.66rem', fontWeight: 700, color: accent,
            lineHeight: 1.2, display: 'block',
            whiteSpace: 'nowrap', letterSpacing: '-0.02em'
          }}>{label}</span>
          
          {loading ? (
            <Skeleton h={22} w={100} />
          ) : error ? (
            <span style={{ fontSize: '0.72rem', color: C.rose }}>Error</span>
          ) : (
            <div style={{
              fontSize: numericValue !== null ? '1.1rem' : '0.9rem',
              fontWeight: 800, color: '#1e293b', lineHeight: 1.2,
              letterSpacing: '-0.01em',
              wordBreak: 'break-word',
            }}>
              {formattedNum}
            </div>
          )}
        </div>
      </div>

      {/* Change percentage badge */}
      {loading ? (
        <Skeleton h={16} w={120} radius={100} />
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: '0.62rem', fontWeight: 700, marginTop: 6, paddingLeft: 48,
          color: up === true ? C.green : up === false ? C.rose : '#64748b',
          whiteSpace: 'nowrap'
        }}>
          {up === true && <span>▲</span>}
          {up === false && <span>▼</span>}
          <span>{changePct !== null && changePct !== undefined
            ? `${Math.abs(changePct).toFixed(2)}% ${changeLabel || ''}`
            : changeLabel || '—'}</span>
        </div>
      )}

      {/* Sparkline */}
      {sparkData && sparkData.length > 1 && (
        <div style={{ margin: '12px -2px 0' }}>
          <Sparkline data={sparkData} color={sparkColor} height={30} />
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
      minWidth: 160,
    }}>
      <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 5 }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
            <span style={{ color: C.slate }}>{p.name}</span>
          </div>
          <span style={{ fontWeight: 700, color: C.navy }}>
            AED {Number(p.value).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
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
    invoiceCurrencies: ['AED'],
  });

  /* ── Chart / KPI data state ───────────────────────────────────── */
  const [summary,             setSummary]             = useState(null);
  const [trendData,           setTrendData]           = useState([]);
  const [legalEntData,        setLegalEntData]        = useState([]);
  const [parentDivData,       setParentDivData]       = useState([]);
  const [subDivData,          setSubDivData]          = useState([]);
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

  /* ── Load filter options (Cascading) ─────────────────────────── */
  useEffect(() => {
    setLoading(prev => ({ ...prev, filters: true }));
    fetchFilterOptions({
      legalEntity: filters.legalEntity,
      parentDiv: filters.parentDiv,
      subDiv: filters.subDiv
    })
      .then(data => {
        setFilterOptions(prev => ({
          ...prev,
          legalGroups:   ['All', ...(data.legal_groups   || [])],
          legalEntities: ['All', ...(data.legal_entities || [])],
          parentDivs:    ['All', ...(data.parent_divisions || [])],
          subDivs:       ['All', ...(data.sub_divisions  || [])],
          salesmen:      ['All', ...(data.salesmen        || [])],
          invoiceCurrencies: ['AED', ...(data.currencies || data.invoice_currencies || []).filter(c => c !== 'AED')],
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
      const mtd = d.sales_mtd_aed     ?? d.mtd_revenue ?? null;
      const ytd = d.sales_ytd_aed     ?? d.ytd_revenue ?? null;
      const prevMtd = d.prev_mtd_revenue ?? d.prev_mtd_sales_aed ?? null;
      const prevYtd = d.prev_ytd_revenue ?? d.prev_ytd_sales_aed ?? null;

      // Real API returns separate _sales_aed fields for value:
      // top_legal_entity_sales_aed, top_parent_division_sales_aed
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
        gross_margin_pct:        d.gross_margin_pct       ?? null,
        gross_margin_change_pct: d.gross_margin_change_pct ?? null,
        // Counts
        total_customers:         d.total_customers        ?? null,
        total_salesmen:          d.total_salesmen         ?? null,
        // Highlights — exact backend fields
        top_legal_entity:    normHighlight(
          d.top_legal_entity,
          d.top_legal_entity_sales_aed,
          d.top_legal_entity_pct
        ),
        top_parent_division: normHighlight(
          d.top_parent_division,
          d.top_parent_division_sales_aed,
          d.top_parent_division_pct
        ),
        data_as_of:              d.data_as_of             ?? null,
        current_year_label:      d.current_year_label     || 'Current Year',
        previous_year_label:     d.previous_year_label    || 'Previous Year',
      });
    });

    // 1. Revenue Trend — GET /api/sales-revenue/trend
    //    API returns: [{ period_name, sales_aed }, ...] (Current Year only)
    guard('trend', fetchTrend(f)).then(d => {
      if (!d) return;
      // Handle both array response and wrapped { data: [...] } response
      const arr = Array.isArray(d) ? d : (d?.data || []);
      setTrendData(arr.map(item => ({
        period:      item.period_name ?? item.period ?? '',
        currentYear: Number(item.sales_aed ?? item.current_year ?? 0),
      })));
    });

    // 2. Gross Margin — GET /api/sales-revenue/gross-margin
    guard('grossMargin', fetchGrossMargin(f)).then(d => {
      if (!d) return;
      setGrossMarginData(d);
    });

    // 3. Salesman Summary — GET /api/sales-revenue/salesman-summary
    //    Used for: Top Salesman KPI card + Salesman View All modal
    guard('salesmanSummary', fetchSalesmanSummary(f)).then(d => {
      // Real API returns a raw array; mock returns { data: [...] }
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
          value:  Number(row.sales_aed  || 0),
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
        grouped[name] = (grouped[name] || 0) + (Number(row.sales_aed) || 0);
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
        grouped[name] = (grouped[name] || 0) + (Number(row.sales_aed) || 0);
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
      const grouped = {};
      const pctMap  = {};
      d.data.forEach(row => {
        const name = (row.subdivision || row.subdivision_name || row.subdivision_code || 'Unknown').replace(/\s/g, '\n');
        grouped[name] = (grouped[name] || 0) + (Number(row.sales_aed) || 0);
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
        value: Number(c.sales_aed ?? c.value ?? 0),
        pct: Number(c.contribution_pct ?? c.pct ?? 0),
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
  // Gross margin — use exact backend fields: gross_margin and margin_pct
  const grossMargin    = grossMarginData?.gross_margin
    ?? grossMarginData?.gross_profit_mtd
    ?? summary?.gross_margin
    ?? null;
  const grossMarginPct  = grossMarginData?.margin_pct ?? grossMarginData?.gross_margin_pct ?? summary?.gross_margin_pct ?? null;
  const grossMarginChg  = grossMarginData?.mtd_change_pct   ?? grossMarginData?.gross_margin_change_pct ?? summary?.gross_margin_change_pct ?? null;
  // Counts
  const totalCustomers  = summary?.total_customers  ?? null;
  const totalSalesmen   = summary?.total_salesmen   ?? null;
  // Highlights
  const topLE           = summary?.top_legal_entity;
  const topPD           = summary?.top_parent_division;
  const dataAsOf        = summary?.data_as_of
    ? new Date(summary.data_as_of).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : appliedFilters.toDate;

  // Top Salesman: directly use the first row from the response as requested
  const topSalesmanRecord = salesmanSummaryData && salesmanSummaryData.length > 0
    ? salesmanSummaryData[0]
    : null;
  const topSalesmanName  = topSalesmanRecord?.salesman_name || topSalesmanRecord?.sales_person || topSalesmanRecord?.salesman || '—';
  const topSalesmanAED   = topSalesmanRecord ? Number(topSalesmanRecord.sales_aed || 0) : null;

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
  const legalEntityCols = [
    { label: 'Legal Entity',       key: 'legal_entity',       align: 'left', fmt: (v, row) => v ?? row.entity_name ?? '—' },
    { label: 'Total Revenue (AED)',key: 'sales_aed',          align: 'right', fmt: (v, row) => fmtCurrency(v ?? row.total_revenue ?? row.revenue ?? 0) },
    { label: 'MTD Revenue (AED)',  key: 'mtd_sales_aed',      align: 'right', fmt: (v, row) => fmtCurrency(v ?? row.mtd_revenue ?? row.mtd_sales ?? 0) },
    { label: 'YTD Revenue (AED)',  key: 'ytd_sales_aed',      align: 'right', fmt: (v, row) => fmtCurrency(v ?? row.ytd_revenue ?? row.ytd_sales ?? 0) },
    { label: '# Transactions',     key: 'transaction_count',  align: 'right', fmt: (v, row) => v ?? row.transactions ?? row.num_transactions ?? '—' },
    { label: 'Currency',           key: 'currency',           align: 'center', fmt: (v, row) => v ?? row.currency_code ?? 'AED' },
  ];

  const parentDivisionCols = [
    { label: 'Division Code',      key: 'division_code',      align: 'left', fmt: (v, row) => v ?? row.parent_division_code ?? row.code ?? '—'  },
    { label: 'Parent Division',    key: 'parent_division',    align: 'left', fmt: (v, row) => v ?? row.division_name ?? row.name ?? '—'  },
    { label: 'Total Revenue (AED)',key: 'sales_aed',          align: 'right', fmt: (v, row) => fmtCurrency(v ?? row.total_revenue ?? row.revenue ?? 0) },
    { label: 'MTD Revenue (AED)',  key: 'mtd_sales_aed',      align: 'right', fmt: (v, row) => fmtCurrency(v ?? row.mtd_revenue ?? row.mtd_sales ?? 0) },
    { label: 'YTD Revenue (AED)',  key: 'ytd_sales_aed',      align: 'right', fmt: (v, row) => fmtCurrency(v ?? row.ytd_revenue ?? row.ytd_sales ?? 0) },
    { label: '# Transactions',     key: 'transaction_count',  align: 'right', fmt: (v, row) => v ?? row.transactions ?? row.num_transactions ?? '—' },
    { label: 'Currency',           key: 'currency',           align: 'center', fmt: (v, row) => v ?? row.currency_code ?? 'AED' },
  ];

  const subdivisionCols = [
    { label: 'Sub-Division',       key: 'subdivision',        align: 'left', fmt: (v, row) => v ?? row.subdivision_name ?? row.name ?? '—'  },
    { label: 'Code',               key: 'subdivision_code',   align: 'left', fmt: (v, row) => v ?? row.code ?? '—'  },
    { label: 'Parent Division',    key: 'parent_division',    align: 'left', fmt: (v, row) => v ?? row.division_name ?? '—'  },
    { label: 'Total Revenue (AED)',key: 'sales_aed',          align: 'right', fmt: (v, row) => fmtCurrency(v ?? row.total_revenue ?? row.revenue ?? 0) },
    { label: 'MTD Revenue (AED)',  key: 'mtd_sales_aed',      align: 'right', fmt: (v, row) => fmtCurrency(v ?? row.mtd_revenue ?? row.mtd_sales ?? 0) },
    { label: 'YTD Revenue (AED)',  key: 'ytd_sales_aed',      align: 'right', fmt: (v, row) => fmtCurrency(v ?? row.ytd_revenue ?? row.ytd_sales ?? 0) },
    { label: '# Transactions',     key: 'transaction_count',  align: 'right', fmt: (v, row) => v ?? row.transactions ?? row.num_transactions ?? '—' },
    { label: 'Currency',           key: 'currency',           align: 'center', fmt: (v, row) => v ?? row.currency_code ?? 'AED' },
  ];

  const customerSummaryCols = [
    { label: 'Customer Name',      key: 'customer_name',      align: 'left'  },
    { label: 'Account Number',     key: 'customer_account_number', align: 'left'  },
    { label: 'Sales (AED)',        key: 'sales_aed',          align: 'right', fmt: fmtCurrency },
    { label: 'Gross Margin',       key: 'gross_margin',       align: 'right', fmt: fmtCurrency },
    { label: 'Percentage',         key: 'percentage',         align: 'right', fmt: v => fmtPct(v) },
    { label: '# Transactions',     key: 'transaction_count',  align: 'right' },
    { label: 'Currency',           key: 'currency',           align: 'center' },
  ];

  const customerDetailCols = [
    { label: 'Account Number',     key: 'customer_account_number', align: 'left' },
    { label: 'Customer Name',      key: 'customer_name',      align: 'left' },
    { label: 'Legal Entity',       key: 'legal_entity',       align: 'left' },
    { label: 'Business Unit',      key: 'business_unit',      align: 'left' },
    { label: 'Revenue (AED)',      key: 'sales_aed',          align: 'right', fmt: fmtCurrency },
    { label: 'Gross Margin (AED)', key: 'gross_margin',       align: 'right', fmt: fmtCurrency },
    { label: 'Contribution %',     key: 'contribution_pct',   align: 'right', fmt: v => fmtPct(v) },
  ];

  // Salesman View All uses salesman-summary (aggregated) endpoint
  const salesmanSummaryCols = [
    { label: 'Sales Person',    key: 'sales_person',      align: 'left'  },
    { label: 'Sales (AED)',     key: 'sales_aed',         align: 'right', fmt: fmtCurrency },
    { label: 'Gross Margin',    key: 'gross_margin',      align: 'right', fmt: fmtCurrency },
    { label: 'Percentage',      key: 'percentage',        align: 'right', fmt: v => fmtPct(v) },
    { label: '# Transactions',  key: 'transaction_count', align: 'right' },
    { label: 'Currency',        key: 'currency',          align: 'center' },
  ];

  // Salesman Detail (drill-down) — 13 columns per spec
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
    { label: 'Business Unit',     key: 'business_unit',        align: 'left'  },
    { label: 'Revenue (AED)',     key: 'sales_aed',            align: 'right', fmt: fmtCurrency },
    { label: 'Gross Margin (AED)', key: 'gross_margin',        align: 'right', fmt: fmtCurrency },
    { label: 'Contribution %',    key: 'contribution_pct',     align: 'right',
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
        padding: '20px 24px 32px',
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
        <div className="card" style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'nowrap', overflowX: 'auto' }}>
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
              {filterOptions.salesmen.map((o, idx) => {
                // Guarantee o is always a string (belt-and-suspenders guard)
                const label = typeof o === 'string' ? o : (o?.label ?? o?.salesman_name ?? o?.sales_person ?? String(o));
                const val   = typeof o === 'string' ? o : (o?.employee_id ?? o?.value ?? label);
                return <option key={`salesman-${idx}`} value={val}>{label}</option>;
              })}
            </select>
          </FilterField>

          <FilterField label="Currency">
            <select id="filter-currency" style={selStyle} value={filters.invoiceCurrency} onChange={e => updateFilter('invoiceCurrency', e.target.value)}>
              {filterOptions.invoiceCurrencies.map(o => <option key={o}>{o}</option>)}
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

        {/* ── Revenue Dashboard KPI Cards ── */}
        <div className="grid-cols-6" style={{ marginBottom: 16 }}>

          {/* 1. Total Sales (MTD) */}
          <KPICard
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
          <KPICard
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
          <KPICard
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
          <KPICard
            label="Top Legal Entity"
            numericValue={null}
            textValue={topLE ? topLE.name : '—'}
            changePct={null}
            changeLabel={topLE?.value ? `AED ${fmtAxisNum(topLE.value)}${topLE.pct ? ` (${Number(topLE.pct).toFixed(1)}%)` : ''}` : ''}
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
          <KPICard
            label="Top Parent Division"
            numericValue={null}
            textValue={topPD ? topPD.name : '—'}
            changePct={null}
            changeLabel={topPD?.value ? `AED ${fmtAxisNum(topPD.value)}${topPD.pct ? ` (${Number(topPD.pct).toFixed(1)}%)` : ''}` : ''}
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
          <KPICard
            label="Top Salesman"
            numericValue={null}
            textValue={topSalesmanName}
            changePct={null}
            changeLabel={topSalesmanAED !== null ? `AED ${fmtAxisNum(topSalesmanAED)}` : ''}
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
        <div className="grid-charts-3" style={{ marginBottom: 16 }}>
          
          {/* 1. Revenue Trend (Line Chart) */}
          <div className="card" style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Revenue Trend (AED)</div>
              <ChartMenu onViewAll={() => setOpenModal('trend')} endpoint="trend" filters={appliedFilters} />
            </div>

            {loading.trend ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : errors.trend ? (
              <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.78rem', paddingTop: 60 }}>⚠ Failed to load</div>
            ) : trendData.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 60 }}>No trend data available</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220} minWidth={0}>
                  <LineChart data={trendData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
                    <XAxis dataKey="period" tick={{ fill: C.muted, fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtAxisNum} width={50} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="currentYear" name="Sales" stroke={C.blue} strokeWidth={2.5} dot={{ r: trendData.length === 1 ? 5 : 4, fill: trendData.length === 1 ? C.blue : '#fff', stroke: C.blue, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: C.slate }}>
                    <span style={{ width: 12, height: 3, background: C.blue, display: 'inline-block', borderRadius: 2 }} />
                    {currentYearLabel}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 2. Revenue by Legal Entity (Donut) */}
          <div className="card" style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Revenue by Legal Entity (AED)</div>
              <ChartMenu onViewAll={() => setOpenModal('legalEntity')} endpoint="legal-entity-detail" filters={appliedFilters} />
            </div>

            {loading.legalEnt ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : legalEntData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', height: 220 }}>
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie data={legalEntData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                      {legalEntData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ width: '45%', paddingLeft: 10, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                  {legalEntData.slice(0, 5).map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                        <span style={{ color: C.slate, lineHeight: 1.2 }}>{d.name}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: C.navy, marginLeft: 8 }}>{d.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 80 }}>No data</div>
            )}
          </div>

          {/* 3. Revenue by Parent Division (Bar) */}
          <div className="card" style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Revenue by Parent Division (AED)</div>
              <ChartMenu onViewAll={() => setOpenModal('parentDiv')} endpoint="parent-division-detail" filters={appliedFilters} />
            </div>

            {loading.parentDiv ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : parentDivData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220} minWidth={0}>
                <BarChart data={parentDivData} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f4ff" />
                  <XAxis type="number" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtAxisNum} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Revenue" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="value" position="right" formatter={v => fmtAxisNum(v)} style={{ fill: C.navy, fontSize: 10, fontWeight: 700 }} />
                    {parentDivData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 80 }}>No data</div>
            )}
          </div>
        </div>

                {/* ── Sub-Division Full Width Row ── */}
        <div style={{ marginBottom: 16 }}>
          {/* 1. Subdivision */}
          <div className="card" style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Revenue by Sub-Division (AED)</div>
              <ChartMenu onViewAll={() => setOpenModal('subDiv')} endpoint="subdivision-detail" filters={appliedFilters} />
            </div>
            {loading.subDiv ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : subDivData.length > 0 ? (
              <div style={{ flex: 1, position: 'relative', minHeight: 280 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={subDivData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
                      <XAxis interval={0} dataKey="name" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => v.replace(/\n/g, ' ')} />
                      <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtAxisNum} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Revenue" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="value" position="top" formatter={v => fmtAxisNum(v)} style={{ fill: C.navy, fontSize: 10, fontWeight: 700 }} />
                        {subDivData.map((entry, i) => <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 80 }}>No data</div>
            )}
          </div>
        </div>

        {/* ── Secondary Analysis Row (Customers, Salesman) ── */}
        <div className="grid-charts-2" style={{ marginBottom: 16 }}>
          {/* 2. Top Customers */}
          <div className="card" style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Top 10 Customers by Sales (AED)</div>
              <ChartMenu onViewAll={() => setOpenModal('customerSummary')} endpoint="customer-summary" filters={appliedFilters} />
            </div>
            {loading.topCustomers ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : topCustomersData.length > 0 ? (
              <div style={{ flex: 1, overflowX: 'auto', borderRadius: 8, border: `1px solid ${C.border}` }}>
                <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                  <thead style={{ background: '#f8fafc', color: '#1e3a8a', borderBottom: `2px solid ${C.border}` }}>
                    <tr>
                      <th style={{ padding: '8px', textAlign: 'center', fontWeight: 700, width: 30 }}>#</th>
                      <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>Customer Name</th>
                      <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>Sales (AED)</th>
                      <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>% Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomersData.slice(0, 10).map((c, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: '#fff' }}>
                        <td style={{ padding: '6px 8px', textAlign: 'center', color: C.slate, fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'left', color: C.navy, fontWeight: 600, whiteSpace: 'nowrap', textTransform: 'capitalize' }} title={c.name}>{(c.name || '').toLowerCase()}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: C.slate }}>{Number(c.value).toLocaleString('en-AE')}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: C.slate }}>{c.pct != null ? `${Number(c.pct).toFixed(2)}%` : '—'}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f8fafc', fontWeight: 800, color: '#1e3a8a' }}>
                      <td colSpan={2} style={{ padding: '8px', textAlign: 'center' }}>Total</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{topCustomersData.slice(0, 10).reduce((s, c) => s + (c.value || 0), 0).toLocaleString('en-AE')}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{topCustomersData.slice(0, 10).reduce((s, c) => s + (c.pct || 0), 0).toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 60 }}>No data available</div>
            )}
          </div>

          {/* 3. Revenue by Salesman */}
          <div className="card" style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Revenue by Salesman (AED)</div>
              <ChartMenu onViewAll={() => setOpenModal('salesmanSummary')} endpoint="salesman-summary" filters={appliedFilters} />
            </div>
            {loading.salesmanSummary ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : salesmanSummaryData.length > 0 ? (
              <div style={{ flex: 1, overflowX: 'auto', borderRadius: 8, border: `1px solid ${C.border}` }}>
                <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                  <thead style={{ background: '#f8fafc', color: '#1e3a8a', borderBottom: `2px solid ${C.border}` }}>
                    <tr>
                      <th style={{ padding: '8px', textAlign: 'center', fontWeight: 700, width: 30 }}>#</th>
                      <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>Salesman</th>
                      <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>Sales (AED)</th>
                      <th style={{ padding: '8px', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>% Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesmanSummaryData.slice(0, 10).map((c, i) => {
                      const name = c.salesman || c.sales_person || c.salesman_name || 'Unknown';
                      return (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, background: '#fff' }}>
                          <td style={{ padding: '6px 8px', textAlign: 'center', color: C.slate, fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'left', color: C.navy, fontWeight: 600, whiteSpace: 'nowrap' }} title={name}>{name}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: C.slate }}>{Number(c.sales_aed).toLocaleString('en-AE')}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: C.slate }}>{c.percentage != null ? `${Number(c.percentage).toFixed(2)}%` : '—'}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: '#f8fafc', fontWeight: 800, color: '#1e3a8a' }}>
                      <td colSpan={2} style={{ padding: '8px', textAlign: 'center' }}>Total</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{salesmanSummaryData.slice(0, 10).reduce((s, c) => s + (Number(c.sales_aed) || 0), 0).toLocaleString('en-AE')}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{salesmanSummaryData.slice(0, 10).reduce((s, c) => s + (Number(c.percentage) || 0), 0).toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 60 }}>No data available</div>
            )}
          </div>
        </div>

        {/* ── Sales Revenue Detailed View — sourced from /summary-detail ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 8, marginTop: 14 }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${C.border}`, background: '#fff', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e1b4b' }}>
                Sales Revenue Detailed View
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500, padding: '2px 8px', background: '#f1f5f9', borderRadius: 12 }}>
                Amounts in AED
              </span>
            </div>
            <ChartMenu onViewAll={() => setOpenModal('summaryDetail')} endpoint="summary-detail" filters={appliedFilters} />
          </div>

          {/* Table body */}
          {loading.summaryDetail ? (
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
                mtd:         n(r, 'revenue_mtd',     'mtd_revenue',      'sales_mtd_aed',      'mtd_sales_aed'),
                prevMtd:     n(r, 'revenue_prev_mtd','prev_mtd_revenue', 'mtd_prev_revenue',   'sales_prev_mtd_aed', 'prev_mtd_sales_aed'),
                ytd:         n(r, 'revenue_ytd',     'ytd_revenue',      'sales_ytd_aed',      'ytd_sales_aed'),
                ytdPy:       n(r, 'revenue_ytd_py',  'revenue_ytd_prev', 'prev_ytd_revenue',   'sales_ytd_py_aed',   'sales_prev_ytd_aed', 'prev_ytd_sales_aed'),
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
              if (pct === null || pct === undefined || isNaN(pct)) return <span style={{ color: C.muted }}>—</span>;
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

            const COLS = [
              'Legal Entity', 'Parent Division', 'Sub Division',
              'Revenue (MTD)', 'Revenue (Prev MTD)', 'Revenue (YTD)', 'Revenue (YTD PY)',
              'Variance % (MTD)', 'Variance % (YTD)',
            ];

            return (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {COLS.map((h, i) => (
                        <th key={h} style={{ ...TH_S, textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ ...TD_S, textAlign: 'center', color: C.muted, padding: '40px 14px' }}>
                          No data available for the selected filters
                        </td>
                      </tr>
                    ) : rows.map((row, idx) => {
                      const bgBase = idx % 2 === 0 ? '#fff' : '#fafbfd';
                      return (
                        <tr key={idx}
                          style={{ background: bgBase, transition: 'background 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f5f3ff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = bgBase; }}
                        >
                          <td style={{ ...TD_S, textAlign: 'left', fontWeight: 600, color: '#1e1b4b' }} title={row.legalEntity}>
                            {row.legalEntity}
                          </td>
                          {/* Parent Division */}
                          <td style={{ ...TD_S }}>{row.parentDiv}</td>
                          {/* Sub Division */}
                          <td style={{ ...TD_S }}>{row.subDiv}</td>
                          {/* Revenue MTD */}
                          <td style={{ ...TD_S }}>{fmtAED(row.mtd)}</td>
                          {/* Revenue Prev MTD */}
                          <td style={{ ...TD_S }}>{fmtAED(row.prevMtd)}</td>
                          {/* Revenue YTD */}
                          <td style={{ ...TD_S }}>{fmtAED(row.ytd)}</td>
                          {/* Revenue YTD PY */}
                          <td style={{ ...TD_S }}>{fmtAED(row.ytdPy)}</td>
                          {/* Variance MTD */}
                          <td style={{ ...TD_S, textAlign: 'center' }}>
                            <VarBadge pct={row.varMtd !== null ? row.varMtd : calcVar(row.mtd, row.prevMtd)} />
                          </td>
                          {/* Variance YTD */}
                          <td style={{ ...TD_S, textAlign: 'center' }}>
                            <VarBadge pct={row.varYtd !== null ? row.varYtd : calcVar(row.ytd, row.ytdPy)} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Total footer row */}
                  <tfoot>
                    <tr>
                      <td style={{ ...TD_FOOT, textAlign: 'left', padding: '12px 12px' }}>Total</td>
                      <td style={{ ...TD_FOOT }}>—</td>
                      <td style={{ ...TD_FOOT }}>—</td>
                      <td style={{ ...TD_FOOT }}>{fmtAED(totMTD)}</td>
                      <td style={{ ...TD_FOOT }}>{fmtAED(totPMTD)}</td>
                      <td style={{ ...TD_FOOT }}>{fmtAED(totYTD)}</td>
                      <td style={{ ...TD_FOOT }}>{fmtAED(totYTDPY)}</td>
                      <td style={{ ...TD_FOOT }}><VarBadge pct={calcVar(totMTD, totPMTD)} /></td>
                      <td style={{ ...TD_FOOT }}><VarBadge pct={calcVar(totYTD, totYTDPY)} /></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })()}

          {/* Footer note */}
          <div style={{ fontSize: '0.62rem', color: C.muted, padding: '8px 20px 10px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 4 }}>
            <span>All values are in <strong>AED</strong> &nbsp;|&nbsp; {dataAsOf && `Data as on ${dataAsOf}`}</span>
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

      {/* Salesman View All Modal — uses /salesman-summary (aggregated) */}
      <DetailApiModal
        isOpen={openModal === 'salesman'}
        onClose={() => setOpenModal(null)}
        title="Salesman Summary — All Salespeople"
        endpoint="salesman-summary"
        fetchFn={fetchSalesmanSummary}
        columnDefs={salesmanSummaryCols}
        filters={appliedFilters}
        searchPlaceholder="Search salespeople..."
      />

      {/* Salesman Detail Drill-Down Modal — uses /salesman-detail */}
      <DetailApiModal
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
        isOpen={openModal === 'summaryDetail'}
        onClose={() => setOpenModal(null)}
        title="Sales Revenue Detailed View — All Data"
        endpoint="summary-detail"
        fetchFn={fetchSummaryDetail}
        columnDefs={[
          { key: 'legal_entity', label: 'Legal Entity', align: 'left', width: '25%' },
          { key: 'parent_division', label: 'Parent Division', align: 'left', width: '15%' },
          { key: 'sub_division', label: 'Sub Division', align: 'left', width: '15%' },
          { key: 'revenue_mtd', label: 'Rev (MTD)', isCurrency: true },
          { key: 'revenue_prev_mtd', label: 'Rev (Prev MTD)', isCurrency: true },
          { key: 'revenue_ytd', label: 'Rev (YTD)', isCurrency: true },
          { key: 'revenue_ytd_py', label: 'Rev (YTD PY)', isCurrency: true },
        ]}
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
                    {['Period', `${currentYearLabel} Sales (AED)`].map((h, i) => (
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
