/**
 * ExecDashboardViewAll.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * View All modal for the Executive Dashboard.
 * Supports 4 drill-down sections:
 *   1. TWC View All (table)  → /api/executive-dashboard/trade-working-capital-view-all
 *   2. TWC Trend (MoM)       → /api/executive-dashboard/trade-working-capital-trend
 *   3. Revenue by Region     → via executiveDashboardApi
 *   4. Profitability by Region → via executiveDashboardApi
 *
 * Integration features:
 *   - Legal Entity column wrapping onto 2+ lines with capped width
 *   - Clean multi-line column header wrapping (no single-character breaking)
 *   - Period formatting (e.g. "Jan 26", "Feb 26", "Mar 26")
 *   - Comprehensive field mapping for Receivables, Payables, Inventory, Sub-Divisions
 *   - Sticky table headers and smooth horizontal & vertical scrolling
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, RefreshCw, Table, TrendingUp, Globe, BarChart3, FileText, Download, Filter, Search, ChevronRight, ChevronDown, MoreHorizontal, Info, Maximize2, Minimize2 } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts';
import {
  getExecTwcViewAll,
  getExecTwcTrend,
  getExecRevenueByRegion,
  getExecProfitabilityByRegion,
  exportExecTwcExcel,
  exportExecTwcPdf,
} from '../api/executiveDashboardApi';
import { fetchPLStatement, exportPL, fetchPLFilters } from '../services/plApi';
import {
  getLegalGroups,
  getLegalEntities,
  getParentDivision,
  getSubDivision,
} from '../api/masterLegalApi';
import { getOpexFilterOptions } from '../api/opexApi';
import * as XLSX from 'xlsx';

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS & FORMATTERS
───────────────────────────────────────────────────────────────────────────── */

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format numerical amounts with 2 decimal places.
 * null → '–'  |  0 → '0.00'
 */
const fmtNum = (v) => {
  if (v === null || v === undefined) return '–';
  if (isNaN(Number(v))) return '–';
  return Math.round(Number(v)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

/**
 * Format days/ratio fields (DSO, DIO, DPO, CCC).
 * null → '–'  |  0 → '0.00'
 */
const fmtDays = (v) => {
  if (v === null || v === undefined) return '–';
  if (isNaN(Number(v))) return '–';
  return Number(v).toFixed(2);
};

const fmtPct = (v) => {
  if (v === null || v === undefined) return '–';
  if (isNaN(Number(v))) return '–';
  return `${Number(v).toFixed(2)}%`;
};

/**
 * Format period string into "Jan 26", "Feb 26", "Mar 26" style.
 */
const fmtPeriod = (v) => {
  if (v === null || v === undefined) return '–';
  const str = String(v).trim();
  // Match YYYY-MM e.g. "2026-01" -> "Jan 26"
  const m1 = str.match(/^(\d{4})[-/](\d{1,2})$/);
  if (m1) {
    const yr = m1[1].slice(2);
    const mo = parseInt(m1[2], 10) - 1;
    if (mo >= 0 && mo < 12) return `${MONTHS_SHORT[mo]} ${yr}`;
  }
  // Match YYYY-MM-DD e.g. "2026-01-31" -> "Jan 26"
  const m2 = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m2) {
    const yr = m2[1].slice(2);
    const mo = parseInt(m2[2], 10) - 1;
    if (mo >= 0 && mo < 12) return `${MONTHS_SHORT[mo]} ${yr}`;
  }
  return str;
};

function getRows(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.trend)) return payload.trend;
  if (Array.isArray(payload.parameters)) return payload.parameters;
  if (Array.isArray(payload.regions)) return payload.regions;
  return [];
}

/* ─── Export Toast (matching Sales Revenue View All) ─────────────── */
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
      display: 'flex', alignItems: 'center', gap: 6,
      animation: 'fadeIn 0.2s ease',
    }}>
      {isError ? '⚠ ' : '✓ '}{message}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   UI PRIMITIVES & TABLE CONTAINERS
───────────────────────────────────────────────────────────────────────────── */

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, color: '#64748b' }}>
    <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
    <span style={{ marginLeft: 10, fontSize: '0.85rem' }}>Loading data…</span>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

const EmptyState = ({ message = 'No records available for the selected filters.' }) => (
  <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b', fontSize: '0.85rem' }}>
    {message}
  </div>
);

const ErrorState = ({ message }) => (
  <div style={{ textAlign: 'center', padding: '50px 20px', color: '#ef4444', fontSize: '0.82rem' }}>
    ⚠️ {message}
  </div>
);

function ScrollTable({ children, minWidth = 1100, style = {}, padding = '0 16px 0' }) {
  return (
    <div className="exec-modal-scroll" style={{
      overflowX: 'auto', overflowY: 'auto', flex: 1,
      height: '100%', minHeight: 0, padding, ...style
    }}>
      <style>{`
        .exec-modal-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .exec-modal-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .exec-modal-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .exec-modal-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
      <table style={{ width: '100%', minWidth, borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.78rem' }}>
        {children}
      </table>
    </div>
  );
}

const TH = ({ children, align = 'left', style = {} }) => (
  <th style={{
    padding: '10px 12px', textAlign: align, fontSize: '0.65rem', color: '#64748b', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '2px solid #e2e8f0',
    background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10, whiteSpace: 'normal',
    wordBreak: 'normal', lineHeight: '1.25', verticalAlign: 'bottom', userSelect: 'none', ...style
  }}>
    {children}
  </th>
);

const TD = ({ children, align = 'left', bold = false, color, style = {} }) => (
  <td style={{
    padding: '10px 12px', textAlign: align, fontSize: '0.73rem',
    fontWeight: bold ? 700 : 500, color: color || (bold ? '#1e293b' : '#334155'),
    borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap', ...style
  }}>
    {children}
  </td>
);

const TF = ({ children, align = 'left', bold = true, color = '#1e40af', bg = '#eff6ff', borderTop = '2px solid #bfdbfe', style = {} }) => (
  <td style={{
    padding: '10px 12px', textAlign: align, fontSize: '0.73rem',
    fontWeight: bold ? 800 : 600, color: color,
    borderTop, borderBottom: 'none',
    background: bg, position: 'sticky', bottom: 0, zIndex: 12,
    whiteSpace: 'nowrap', boxShadow: '0 -2px 6px rgba(15, 23, 42, 0.08)', ...style
  }}>
    {children}
  </td>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MULTI-SELECT DROPDOWN (Matches Sales Revenue Page pattern)
───────────────────────────────────────────────────────────────────────────── */

function ExecMultiSelect({ options = [], value = ['All'], onChange, placeholder = 'All', style }) {
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

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current && searchRef.current.focus(), 0);
    }
    if (!open) setSearchQuery('');
  }, [open]);

  // Normalize options across any object shape from backend, showing only active entries and deduplicating names
  const normOptions = useMemo(() => {
    const seenNames = new Set();
    const result = [];
    (options || []).forEach(o => {
      if (o == null) return;
      if (typeof o === 'object') {
        if (o.active === false || o.is_active === false) return;
        if (o.status && String(o.status).toLowerCase() === 'inactive') return;
      }
      if (typeof o === 'string' || typeof o === 'number') {
        const str = String(o);
        const lower = str.trim().toLowerCase();
        if (lower !== 'all' && lower !== '' && !seenNames.has(lower)) {
          seenNames.add(lower);
          result.push({ id: str, name: str });
        }
        return;
      }
      const id = o.value !== undefined ? o.value :
                 o.id !== undefined ? o.id :
                 o.legal_group_id !== undefined ? o.legal_group_id :
                 o.legal_entity_id !== undefined ? o.legal_entity_id :
                 o.parent_division_id !== undefined ? o.parent_division_id :
                 o.subdivision_id !== undefined ? o.subdivision_id :
                 o.code !== undefined ? o.code : '';
      const name = o.label !== undefined ? o.label :
                   o.name !== undefined ? o.name :
                   o.legal_group_name !== undefined ? o.legal_group_name :
                   o.legal_entity_name !== undefined ? o.legal_entity_name :
                   o.parent_division_name !== undefined ? o.parent_division_name :
                   o.subdivision_name !== undefined ? o.subdivision_name : String(id);
      const cleanName = typeof name === 'object' ? String(name?.label || name?.name || id || '') : String(name ?? '');
      const lower = cleanName.trim().toLowerCase();
      if (lower !== 'all' && lower !== '' && lower !== 'null' && lower !== 'undefined' && String(id ?? '') !== '' && String(id) !== 'null' && !seenNames.has(lower)) {
        seenNames.add(lower);
        result.push({ id: String(id), name: cleanName });
      }
    });
    return result;
  }, [options]);

  const q = searchQuery.trim().toLowerCase();
  const visibleOptions = useMemo(() => {
    return q
      ? normOptions.filter(o => String(o.id) !== 'All' && String(o.name || '').toLowerCase().includes(q))
      : normOptions;
  }, [normOptions, q]);

  const isAll = !value || (value.length === 1 && String(value[0]) === 'All');
  const allRealIds = useMemo(() => normOptions.filter(o => String(o.id) !== 'All').map(o => String(o.id)), [normOptions]);

  const toggle = (optId) => {
    if (String(optId) === 'All') {
      onChange(['All']);
      return;
    }
    const cur = isAll ? allRealIds : (value || []).map(String).filter(v => v !== 'All');
    const targetId = String(optId);

    const next = cur.includes(targetId)
      ? cur.filter(v => v !== targetId)
      : [...cur, targetId];

    if (allRealIds.length > 0 && next.length === allRealIds.length) {
      onChange(['All']);
    } else {
      onChange(next);
    }
  };

  const selectedVals = normOptions.filter(o => value && value.some(v => String(v) === String(o.id)));
  const label = isAll
    ? placeholder
    : selectedVals.length === 0
      ? '0 selected'
      : selectedVals.length === 1
        ? String(selectedVals[0].name || '')
        : `${selectedVals.length} selected`;

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0, ...style }}>
      {/* Trigger Button */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          height: 28,
          padding: '4px 8px',
          boxSizing: 'border-box',
          fontSize: '0.73rem',
          fontWeight: 500,
          color: '#334155',
          background: '#fff',
          border: '1px solid #cbd5e1',
          borderRadius: 7,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          transition: 'border-color 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0, paddingRight: 4 }}>
          {label}
        </span>
        <span style={{ fontSize: '0.6rem', color: '#94a3b8', flexShrink: 0 }}>
          {open ? '▲' : '▼'}
        </span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, minWidth: 220,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
          boxShadow: '0 10px 25px rgba(0,0,0,0.18)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Search box inside dropdown */}
          <div style={{ padding: '6px 8px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="Search…"
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.74rem', color: '#334155', width: '100%', minWidth: 0 }}
              />
              {searchQuery && (
                <span
                  onClick={e => { e.stopPropagation(); setSearchQuery(''); }}
                  style={{ fontSize: '0.65rem', color: '#94a3b8', cursor: 'pointer', flexShrink: 0 }}
                >✕</span>
              )}
            </div>
          </div>

          {/* Select All / Clear action bar */}
          {!q && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <span
                onClick={(e) => { e.stopPropagation(); onChange(['All']); }}
                style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer', userSelect: 'none' }}
              >Select All</span>
              <span
                onClick={(e) => { e.stopPropagation(); onChange([]); }}
                style={{ fontSize: '0.72rem', fontWeight: 600, color: '#ef4444', cursor: 'pointer', userSelect: 'none' }}
              >Clear</span>
            </div>
          )}

          {/* Scrollable options list */}
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {visibleOptions.map(opt => {
              if (opt.id === 'All') return null;
              const selected = isAll || (value && value.some(v => String(v) === String(opt.id)));
              return (
                <div
                  key={opt.id}
                  onClick={() => toggle(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                    cursor: 'pointer', fontSize: '0.75rem',
                    background: selected ? '#eff6ff' : '#fff',
                    color: selected ? '#2563eb' : '#334155',
                    fontWeight: selected ? 600 : 400,
                    borderBottom: '1px solid #f8fafc',
                    whiteSpace: 'normal', lineHeight: 1.25,
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.background = '#fff'; }}
                >
                  <span style={{
                    width: 14, height: 14,
                    border: '1.5px solid ' + (selected ? '#2563eb' : '#cbd5e1'),
                    borderRadius: 3,
                    background: selected ? '#2563eb' : '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {selected && <span style={{ color: '#fff', fontSize: '0.6rem', lineHeight: 1 }}>✓</span>}
                  </span>
                  <span style={{ wordBreak: 'break-word' }}>{opt.name}</span>
                </div>
              );
            })}

            {q && visibleOptions.length === 0 && (
              <div style={{ padding: '10px 12px', fontSize: '0.74rem', color: '#94a3b8', textAlign: 'center' }}>
                No results for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * FinSight Standard Calendar Date Field
 * Displays formatted DD-MM-YYYY date with 📅 icon, opens native/browser calendar picker on click
 */
function CalendarDateField({ id, value, onChange, placeholder = 'Select' }) {
  const inputRef = useRef(null);

  const openCalendar = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        try {
          inputRef.current.showPicker();
          return;
        } catch (_) {}
      }
      inputRef.current.focus();
      inputRef.current.click();
    }
  };

  const formatted = value ? String(value).split('-').reverse().join('-') : placeholder;

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      <button
        type="button"
        onClick={openCalendar}
        style={{
          width: 104,
          minWidth: 104,
          height: 28,
          boxSizing: 'border-box',
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          padding: '0 24px 0 8px',
          background: '#f8fafc',
          color: '#334155',
          fontSize: '0.74rem',
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          position: 'relative',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          alignItems: 'center',
          transition: 'border-color 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
      >
        <span>{formatted}</span>
        <span
          style={{
            position: 'absolute',
            right: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 13,
            pointerEvents: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          📅
        </span>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED HIERARCHY OPTIONS LOADER (Cached across TWC, Revenue, Profitability)
───────────────────────────────────────────────────────────────────────────── */

let cachedHierarchyOptions = null;
let hierarchyPromise = null;

function fetchHierarchyOptions() {
  if (cachedHierarchyOptions) return Promise.resolve(cachedHierarchyOptions);
  if (!hierarchyPromise) {
    hierarchyPromise = Promise.allSettled([
      getLegalGroups(),
      getLegalEntities(),
      getParentDivision(),
      getSubDivision(),
      getOpexFilterOptions(),
    ]).then(([lgRes, leRes, pdRes, sdRes, opexRes]) => {
      const opexData = opexRes?.status === "fulfilled" ? opexRes.value : null;

      const isActiveEntry = (item) => {
        if (!item) return false;
        if (typeof item === "object") {
          if (item.active === false || item.is_active === false) return false;
          if (item.status && String(item.status).toLowerCase() === "inactive") return false;
        }
        return true;
      };

      const dedupe = (list = []) => {
        const seen = new Set();
        return (list || []).filter(item => {
          if (!isActiveEntry(item)) return false;
          const name = (item.legal_group_name || item.legal_entity_name || item.parent_division_name || item.subdivision_name || item.name || item.label || "").trim().toLowerCase();
          if (!name || name === "all" || name === "null" || name === "undefined") return false;
          if (seen.has(name)) return false;
          seen.add(name);
          return true;
        });
      };

      const lg = (lgRes?.status === "fulfilled" ? (lgRes.value?.data ?? lgRes.value) : null)
        || opexData?.legal_groups || opexData?.legalGroups || [];
      const le = (leRes?.status === "fulfilled" ? (leRes.value?.data ?? leRes.value) : null)
        || opexData?.legal_entities || opexData?.legalEntities || [];
      const pd = (pdRes?.status === "fulfilled" ? (pdRes.value?.data ?? pdRes.value) : null)
        || opexData?.parent_divisions || opexData?.parentDivisions || [];
      const sd = (sdRes?.status === "fulfilled" ? (sdRes.value?.data ?? sdRes.value) : null)
        || opexData?.subdivisions || opexData?.subDivisions || [];

      cachedHierarchyOptions = {
        legalGroups: dedupe(Array.isArray(lg) ? lg : []),
        legalEntities: dedupe(Array.isArray(le) ? le : []),
        parentDivs: dedupe(Array.isArray(pd) ? pd : []),
        subDivs: dedupe(Array.isArray(sd) ? sd : []),
      };
      return cachedHierarchyOptions;
    });
  }
  return hierarchyPromise;
}

/* ─────────────────────────────────────────────────────────────────────────────
   HIERARCHY CASCADING HOOK
   Cascades: Legal Group -> Legal Entity -> Parent Division -> Sub-Division
   Properly handles master relationships (legal_groups array, legal_entities array,
   and parent_division_id) so sub-divisions are strictly scoped under Parent Division.
───────────────────────────────────────────────────────────────────────────── */

function useCascadingHierarchy({
  legalEntities = [],
  parentDivs = [],
  subDivs = [],
  draftLegalGroup = ['All'],
  draftLegalEntity = ['All'],
  draftParentDiv = ['All'],
}) {
  const filteredLegalEntities = useMemo(() => {
    let list = legalEntities;
    if (draftLegalGroup && !draftLegalGroup.includes('All') && draftLegalGroup.length > 0) {
      const gIds = draftLegalGroup.map(String);
      list = legalEntities.filter(e => {
        const directId = e.legal_group_id ?? e.group_id ?? e.legalGroupId;
        if (directId != null && String(directId).trim() !== '') {
          return gIds.includes(String(directId));
        }
        if (Array.isArray(e.legal_groups)) {
          return e.legal_groups.some(g => {
            const gid = g?.legal_group_id ?? g?.id ?? g?.value;
            return gid != null && gIds.includes(String(gid));
          });
        }
        return false;
      });
    }
    const seen = new Set();
    return list.filter(e => {
      const name = (e.legal_entity_name || e.name || e.label || '').trim().toLowerCase();
      if (!name || name === 'all' || name === 'null' || name === 'undefined') return false;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [legalEntities, draftLegalGroup]);

  const filteredParentDivs = useMemo(() => {
    let list = parentDivs;
    if (draftLegalEntity && !draftLegalEntity.includes('All') && draftLegalEntity.length > 0) {
      const eIds = draftLegalEntity.map(String);
      list = parentDivs.filter(p => {
        const directId = p.legal_entity_id ?? p.entity_id ?? p.legalEntityId;
        if (directId != null && String(directId).trim() !== '') {
          return eIds.includes(String(directId));
        }
        if (Array.isArray(p.legal_entities)) {
          return p.legal_entities.some(e => {
            const eid = e?.legal_entity_id ?? e?.id ?? e?.value;
            return eid != null && eIds.includes(String(eid));
          });
        }
        return false;
      });
    }
    const seen = new Set();
    return list.filter(p => {
      const name = (p.parent_division_name || p.name || p.label || '').trim().toLowerCase();
      if (!name || name === 'all' || name === 'null' || name === 'undefined') return false;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [parentDivs, draftLegalEntity]);

  const filteredSubDivs = useMemo(() => {
    let source = subDivs;
    if (draftParentDiv && !draftParentDiv.includes('All') && draftParentDiv.length > 0) {
      const pIds = draftParentDiv.map(String);
      source = subDivs.filter(s => {
        const pId = s.parent_division_id ?? s.division_id ?? s.parentDivisionId;
        if (pId != null && String(pId).trim() !== '') {
          return pIds.includes(String(pId).trim());
        }
        return false;
      });
    }
    const seen = new Set();
    return source.filter(s => {
      const name = (s.subdivision_name || s.name || s.label || '').trim().toLowerCase();
      if (!name || name === 'all' || name === 'null' || name === 'undefined') return false;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [subDivs, draftParentDiv]);

  return { filteredLegalEntities, filteredParentDivs, filteredSubDivs };
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 1: TWC View All Table
───────────────────────────────────────────────────────────────────────────── */

function TwcViewAllTable({ filters, currency, onExportExcel, onExportPdf }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search input
  const [search, setSearch] = useState('');

  // Exporting state & Toast notification (matching Sales Revenue page)
  const [exporting, setExporting] = useState(null); // 'excel' | 'pdf'
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExport = async (format) => {
    if (exporting) return;
    setExporting(format);
    const finish = (ok, err) => {
      setExporting(null);
      if (!ok) showToast(err || 'Export failed', 'error');
      else showToast(`${format === 'excel' ? 'Excel' : 'PDF'} export started — check Downloads`, 'success');
    };
    try {
      if (format === 'excel') {
        if (onExportExcel) await onExportExcel(appliedTwcFilters);
        else await exportExecTwcExcel(appliedTwcFilters);
      } else {
        if (onExportPdf) await onExportPdf(appliedTwcFilters);
        else await exportExecTwcPdf(appliedTwcFilters);
      }
      finish(true);
    } catch (e) {
      finish(false, e?.message);
    }
  };

  // Dropdown options
  const [legalGroups,   setLegalGroups]   = useState([]);
  const [legalEntities, setLegalEntities] = useState([]);
  const [parentDivs,    setParentDivs]    = useState([]);
  const [subDivs,       setSubDivs]       = useState([]);

  // Multi-select draft filters (arrays matching SalesRevenueReport pattern)
  const [draftLegalGroup,   setDraftLegalGroup]   = useState(filters?.legal_group_id ? (Array.isArray(filters.legal_group_id) ? filters.legal_group_id : [filters.legal_group_id]) : ['All']);
  const [draftLegalEntity,  setDraftLegalEntity]  = useState(filters?.legal_entity_id ? (Array.isArray(filters.legal_entity_id) ? filters.legal_entity_id : [filters.legal_entity_id]) : ['All']);
  const [draftParentDiv,    setDraftParentDiv]    = useState(filters?.parent_division_id ? (Array.isArray(filters.parent_division_id) ? filters.parent_division_id : [filters.parent_division_id]) : ['All']);
  const [draftSubDiv,       setDraftSubDiv]       = useState(filters?.subdivision_id ? (Array.isArray(filters.subdivision_id) ? filters.subdivision_id : [filters.subdivision_id]) : ['All']);
  const [draftFromDate,     setDraftFromDate]     = useState('2026-01-01');
  const [draftToDate,       setDraftToDate]       = useState(filters.as_on_date || filters.as_of_date || '2026-10-31');

  // Applied filter state
  const [appliedTwcFilters, setAppliedTwcFilters] = useState({
    as_on_date: filters.as_on_date || filters.as_of_date || '2026-10-31',
    legal_group_id: filters.legal_group_id || undefined,
    legal_entity_id: filters.legal_entity_id || undefined,
    parent_division_id: filters.parent_division_id || undefined,
    subdivision_id: filters.subdivision_id || undefined,
  });

  // Load cached hierarchy options
  useEffect(() => {
    let cancelled = false;
    fetchHierarchyOptions().then(opts => {
      if (cancelled || !opts) return;
      setLegalGroups(opts.legalGroups);
      setLegalEntities(opts.legalEntities);
      setParentDivs(opts.parentDivs);
      setSubDivs(opts.subDivs);
    });
    return () => { cancelled = true; };
  }, []);

  // Cascading options based on selection, strictly scoping sub-divisions to parent division
  const { filteredLegalEntities, filteredParentDivs, filteredSubDivs } = useCascadingHierarchy({
    legalEntities,
    parentDivs,
    subDivs,
    draftLegalGroup,
    draftLegalEntity,
    draftParentDiv,
  });

  // Fetch table data whenever appliedTwcFilters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getExecTwcViewAll(appliedTwcFilters)
      .then(payload => {
        if (cancelled) return;
        setRows(getRows(payload));
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[TWC ViewAll]', err.response?.status, err.response?.data || err.message);
        setError(`Failed to load (${err.response?.status ?? 'Network error'}).`);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [appliedTwcFilters]);

  const handleApply = () => {
    setAppliedTwcFilters({
      as_on_date: draftToDate || '2026-10-31',
      legal_group_id:     (!draftLegalGroup || draftLegalGroup.includes('All') || draftLegalGroup.length === 0) ? undefined : draftLegalGroup,
      legal_entity_id:    (!draftLegalEntity || draftLegalEntity.includes('All') || draftLegalEntity.length === 0) ? undefined : draftLegalEntity,
      parent_division_id: (!draftParentDiv || draftParentDiv.includes('All') || draftParentDiv.length === 0) ? undefined : draftParentDiv,
      subdivision_id:     (!draftSubDiv || draftSubDiv.includes('All') || draftSubDiv.length === 0) ? undefined : draftSubDiv,
    });
  };

  const handleReset = () => {
    setDraftLegalGroup(['All']);
    setDraftLegalEntity(['All']);
    setDraftParentDiv(['All']);
    setDraftSubDiv(['All']);
    setDraftFromDate('2026-01-01');
    setDraftToDate('2026-10-31');
    setSearch('');
    setAppliedTwcFilters({
      as_on_date: '2026-10-31',
    });
  };

  // Client-side search filtering across Legal Entity, Parent Division, Sub-Division
  const displayRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      const entity = String(r.legal_entity ?? r.entity ?? r.legal_entity_name ?? '').toLowerCase();
      const parent = String(r.parent_division ?? r.division ?? r.parent_division_name ?? '').toLowerCase();
      const sub = String(r.sub_division ?? r.subdivision ?? r.sub_division_name ?? r.subdivision_name ?? '').toLowerCase();
      return entity.includes(q) || parent.includes(q) || sub.includes(q);
    });
  }, [rows, search]);

  // Totals for sticky table footer: fully calculates all 8 financial columns
  const totals = useMemo(() => {
    let tr = 0, tp = 0, inv = 0, twc = 0;
    let hasTr = false, hasTp = false, hasInv = false, hasTwc = false;
    let sumRev = 0, sumCost = 0;
    let applicableDays = 0;

    let weightedDsoSum = 0, dsoSum = 0, dsoCount = 0;
    let weightedDioSum = 0, dioSum = 0, dioCount = 0;
    let weightedDpoSum = 0, dpoSum = 0, dpoCount = 0;

    displayRows.forEach(r => {
      const rawTr  = r.trade_receivables ?? r.total_receivables ?? r.receivables ?? r.tr;
      const rawTp  = r.trade_payables ?? r.total_payables ?? r.payables ?? r.tp;
      const rawInv = r.inventory ?? r.total_inventory ?? r.inventories ?? r.inv;
      const rawTwc = r.trade_working_capital ?? r.twc;

      const numTr  = (rawTr != null && !isNaN(Number(rawTr))) ? Number(rawTr) : 0;
      const numTp  = (rawTp != null && !isNaN(Number(rawTp))) ? Number(rawTp) : 0;
      const numInv = (rawInv != null && !isNaN(Number(rawInv))) ? Number(rawInv) : 0;
      const numTwc = (rawTwc != null && !isNaN(Number(rawTwc))) ? Number(rawTwc) : 0;

      if (rawTr != null && !isNaN(Number(rawTr))) { tr += numTr; hasTr = true; }
      if (rawTp != null && !isNaN(Number(rawTp))) { tp += numTp; hasTp = true; }
      if (rawInv != null && !isNaN(Number(rawInv))) { inv += numInv; hasInv = true; }
      if (rawTwc != null && !isNaN(Number(rawTwc))) { twc += numTwc; hasTwc = true; }

      const rev = Number(r.ratio_revenue_aed || 0);
      const cost = Number(r.ratio_cost_of_material_aed || 0);
      if (rev > 0) sumRev += rev;
      if (cost > 0) sumCost += cost;

      if (r.ratio_applicable_days && Number(r.ratio_applicable_days) > 0) {
        applicableDays = Number(r.ratio_applicable_days);
      }

      const dsoVal = r.dso_days ?? r.dso;
      if (dsoVal != null && !isNaN(Number(dsoVal))) {
        dsoSum += Number(dsoVal);
        dsoCount++;
        weightedDsoSum += Number(dsoVal) * numTr;
      }

      const dioVal = r.dio_days ?? r.dio;
      if (dioVal != null && !isNaN(Number(dioVal))) {
        dioSum += Number(dioVal);
        dioCount++;
        weightedDioSum += Number(dioVal) * numInv;
      }

      const dpoVal = r.dpo_days ?? r.dpo;
      if (dpoVal != null && !isNaN(Number(dpoVal))) {
        dpoSum += Number(dpoVal);
        dpoCount++;
        weightedDpoSum += Number(dpoVal) * numTp;
      }
    });

    const finalTr = hasTr ? tr : 0;
    const finalInv = hasInv ? inv : 0;
    const finalTp = hasTp ? tp : 0;
    const finalTwc = (hasTwc && twc !== 0) ? twc : (finalTr + finalInv - finalTp);

    // DSO calculation: (Total TR / Total Revenue) * applicable days
    let finalDso = null;
    if (sumRev > 0 && applicableDays > 0) {
      finalDso = (finalTr / sumRev) * applicableDays;
    } else if (finalTr > 0 && weightedDsoSum > 0) {
      finalDso = weightedDsoSum / finalTr;
    } else if (dsoCount > 0) {
      finalDso = dsoSum / dsoCount;
    }

    // DIO calculation: (Total Inventory / Total Cost of Material) * applicable days
    let finalDio = null;
    if (sumCost > 0 && applicableDays > 0) {
      finalDio = (finalInv / sumCost) * applicableDays;
    } else if (finalInv > 0 && weightedDioSum > 0) {
      finalDio = weightedDioSum / finalInv;
    } else if (dioCount > 0) {
      finalDio = dioSum / dioCount;
    }

    // DPO calculation: (Total Payables / Total Cost of Material) * applicable days
    let finalDpo = null;
    if (finalTp > 0 && sumCost > 0 && applicableDays > 0) {
      finalDpo = (finalTp / sumCost) * applicableDays;
    } else if (finalTp > 0 && weightedDpoSum > 0) {
      finalDpo = weightedDpoSum / finalTp;
    } else if (dpoCount > 0) {
      finalDpo = dpoSum / dpoCount;
    } else {
      finalDpo = 0;
    }

    // CCC = DSO + DIO - DPO
    let finalCcc = null;
    if (finalDso != null && finalDio != null) {
      finalCcc = finalDso + finalDio - (finalDpo || 0);
    }

    return {
      tr: finalTr,
      dso: finalDso,
      inv: finalInv,
      dio: finalDio,
      tp: finalTp,
      dpo: finalDpo,
      twc: finalTwc,
      ccc: finalCcc,
    };
  }, [displayRows]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ── Toolbar: Filters (Left) + Export Buttons (Right) in exact single row ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: '1px solid #e2e8f0',
        background: '#fff',
        flexShrink: 0,
        gap: 6,
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 100,
        overflow: 'visible',
      }}>
        {/* Left: Search + Hierarchy Multi-Selects + Period + Apply / Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0, flex: 1, position: 'relative', zIndex: 101 }}>
          {/* Search box with green magnifying glass icon matching Sales Revenue */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 8, pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              placeholder="Search periods..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '4px 8px 4px 26px',
                borderRadius: 7,
                border: '1px solid #cbd5e1',
                fontSize: '0.74rem',
                width: 135,
                outline: 'none',
                height: 28,
                boxSizing: 'border-box',
                background: '#fff',
                color: '#334155',
              }}
            />
          </div>

          {/* Legal Group Multi-Select */}
          <ExecMultiSelect
            options={legalGroups}
            value={draftLegalGroup}
            onChange={(vals) => {
              setDraftLegalGroup(vals);
              setDraftLegalEntity(['All']);
              setDraftParentDiv(['All']);
              setDraftSubDiv(['All']);
            }}
            placeholder="All Legal Group"
            style={{ width: 120, minWidth: 110 }}
          />

          {/* Legal Entity Multi-Select */}
          <ExecMultiSelect
            options={filteredLegalEntities}
            value={draftLegalEntity}
            onChange={(vals) => {
              setDraftLegalEntity(vals);
              setDraftParentDiv(['All']);
              setDraftSubDiv(['All']);
            }}
            placeholder="All Legal Entity"
            style={{ width: 130, minWidth: 120 }}
          />

          {/* Parent Division Multi-Select */}
          <ExecMultiSelect
            options={filteredParentDivs}
            value={draftParentDiv}
            onChange={(vals) => {
              setDraftParentDiv(vals);
              setDraftSubDiv(['All']);
            }}
            placeholder="All Parent Division"
            style={{ width: 140, minWidth: 130 }}
          />

          {/* Sub-Division Multi-Select */}
          <ExecMultiSelect
            options={filteredSubDivs}
            value={draftSubDiv}
            onChange={(vals) => setDraftSubDiv(vals)}
            placeholder="All Sub-Division"
            style={{ width: 130, minWidth: 120 }}
          />

          {/* Period Date Range with FinSight Calendar Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Period:</span>
            <CalendarDateField
              id="twc-period-from"
              value={draftFromDate}
              onChange={setDraftFromDate}
            />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>-</span>
            <CalendarDateField
              id="twc-period-to"
              value={draftToDate}
              onChange={setDraftToDate}
            />
          </div>

          {/* Apply Button (Blue) */}
          <button
            onClick={handleApply}
            style={{
              height: 28,
              padding: '0 16px',
              borderRadius: 7,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
          >
            Apply
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            style={{
              height: 28,
              padding: '0 12px',
              borderRadius: 7,
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            ↺ Reset
          </button>
        </div>

        {/* Right: Export Buttons matching Sales Revenue View All */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={() => handleExport('excel')}
            disabled={!!exporting}
            title="Export to Excel"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              border: '1px solid #bbf7d0', borderRadius: 7, cursor: exporting ? 'not-allowed' : 'pointer',
              fontWeight: 700, transition: 'all 0.15s', outline: 'none',
              fontSize: '0.70rem', height: 28, padding: '0 10px',
              background: exporting === 'excel' ? '#d1fae5' : '#f0fdf4',
              color: '#15803d',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting === 'excel' ? '⏳' : '📊'} Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            title="Export to PDF"
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              border: '1px solid #fecdd3', borderRadius: 7, cursor: exporting ? 'not-allowed' : 'pointer',
              fontWeight: 700, transition: 'all 0.15s', outline: 'none',
              fontSize: '0.70rem', height: 28, padding: '0 10px',
              background: exporting === 'pdf' ? '#fee2e2' : '#fff1f2',
              color: '#be123c',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting === 'pdf' ? '⏳' : '📄'} PDF
          </button>
        </div>
      </div>

      {toast && <ExportToast message={toast.msg} type={toast.type} />}

      {/* Content: spinner, error, empty, or table */}
      {loading ? <Spinner /> : error ? <ErrorState message={error} /> : !displayRows.length ? <EmptyState message={search ? "No matching records found." : undefined} /> : (
        <ScrollTable minWidth={1150}>
          <thead>
            <tr>
              <TH style={{ width: 190, minWidth: 170, maxWidth: 210 }}>Legal Entity</TH>
              <TH style={{ width: 140, minWidth: 120 }}>Parent Division</TH>
              <TH style={{ width: 140, minWidth: 120 }}>Sub-Division</TH>
              <TH align="right">Trade Receivables ({currency})</TH>
              <TH align="right">DSO</TH>
              <TH align="right">Inventory ({currency})</TH>
              <TH align="right">DIO</TH>
              <TH align="right">Trade Payables ({currency})</TH>
              <TH align="right">DPO</TH>
              <TH align="right">TWC ({currency})</TH>
              <TH align="right">CCC (Days)</TH>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((r, i) => {
              const trVal = r.trade_receivables ?? r.total_receivables ?? r.receivables ?? r.tr;
              const dsoVal = r.dso_days ?? r.dso;
              const tpVal = r.trade_payables ?? r.total_payables ?? r.payables ?? r.tp;
              const dpoVal = r.dpo_days ?? r.dpo;
              const invVal = r.inventory ?? r.total_inventory ?? r.inventories ?? r.inv;
              const dioVal = r.dio_days ?? r.dio;
              const twcVal = r.trade_working_capital ?? r.twc;
              const cccVal = r.cash_conversion_cycle_days ?? r.ccc;

              const entityName = r.legal_entity ?? r.entity ?? r.legal_entity_name ?? '–';
              const parentDiv  = r.parent_division ?? r.division ?? r.parent_division_name ?? '–';
              const subDivVal  = r.sub_division ?? r.subdivision ?? r.sub_division_name ?? r.subdivision_name ?? r.sub_division_code ?? r.subdivision_code ?? r.sub_div_name ?? r.sub_div ?? '–';

              return (
                <tr key={i}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  {/* Legal Entity cell wraps into 2+ lines cleanly to reduce column width */}
                  <TD bold style={{ width: 190, minWidth: 170, maxWidth: 210, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.3' }}>
                    {entityName}
                  </TD>
                  <TD style={{ width: 140, minWidth: 120, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.3' }}>
                    {parentDiv}
                  </TD>
                  <TD style={{ width: 140, minWidth: 120, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.3' }}>
                    {subDivVal}
                  </TD>
                  <TD align="right">{fmtNum(trVal)}</TD>
                  <TD align="right">{fmtDays(dsoVal)}</TD>
                  <TD align="right">{fmtNum(invVal)}</TD>
                  <TD align="right">{fmtDays(dioVal)}</TD>
                  <TD align="right">{fmtNum(tpVal)}</TD>
                  <TD align="right">{fmtDays(dpoVal)}</TD>
                  <TD align="right" bold color={twcVal !== null && twcVal !== undefined && Number(twcVal) >= 0 ? '#2563eb' : '#ef4444'}>
                    {fmtNum(twcVal)}
                  </TD>
                  <TD align="right">{fmtDays(cccVal)}</TD>
                </tr>
              );
            })}
          </tbody>
          {displayRows.length > 1 && (
            <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 15 }}>
              <tr>
                <TF bold style={{ color: '#1e293b' }}>Total</TF>
                <TF bold style={{ color: '#64748b' }}>–</TF>
                <TF bold style={{ color: '#64748b' }}>–</TF>
                <TF align="right" bold color="#2563eb">{fmtNum(totals.tr)}</TF>
                <TF align="right" bold color="#2563eb">{fmtDays(totals.dso)}</TF>
                <TF align="right" bold color="#2563eb">{fmtNum(totals.inv)}</TF>
                <TF align="right" bold color="#2563eb">{fmtDays(totals.dio)}</TF>
                <TF align="right" bold color="#2563eb">{fmtNum(totals.tp)}</TF>
                <TF align="right" bold color="#2563eb">{fmtDays(totals.dpo)}</TF>
                <TF align="right" bold color={totals.twc != null && totals.twc >= 0 ? '#2563eb' : '#ef4444'}>{fmtNum(totals.twc)}</TF>
                <TF align="right" bold color={totals.ccc != null && totals.ccc >= 0 ? '#2563eb' : '#ef4444'}>{fmtDays(totals.ccc)}</TF>
              </tr>
            </tfoot>
          )}
        </ScrollTable>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 2: TWC Trend (Month-on-Month)
───────────────────────────────────────────────────────────────────────────── */

function parsePeriodKey(raw) {
  if (!raw) return { year: '2026', monthIndex: 0, monthName: 'JAN', display: '—' };
  const str = String(raw).trim();
  const mIso = str.match(/^(\d{4})[-/]\s*(\d{1,2})/);
  if (mIso) {
    const y = mIso[1];
    const mi = parseInt(mIso[2], 10) - 1;
    const mn = MONTHS_SHORT[mi] ? MONTHS_SHORT[mi].toUpperCase() : 'JAN';
    return { year: y, monthIndex: mi, monthName: mn, display: mn };
  }
  const mName = str.match(/^([a-zA-Z]{3})[- ]?(\d{2,4})$/);
  if (mName) {
    const monStr = mName[1].slice(0, 3).toUpperCase();
    const yrStr = mName[2].length === 2 ? '20' + mName[2] : mName[2];
    const mi = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(monStr);
    return { year: yrStr, monthIndex: mi >= 0 ? mi : 0, monthName: monStr, display: monStr };
  }
  return { year: '2026', monthIndex: 0, monthName: str.toUpperCase(), display: str };
}

const MONTH_COLS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function TwcTrendTable({ filters, currency, onExportExcel, onExportPdf }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [unit, setUnit] = useState('aed'); // 'aed' | 'millions'
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Hierarchy filter options
  const [legalGroups,   setLegalGroups]   = useState([]);
  const [legalEntities, setLegalEntities] = useState([]);
  const [parentDivs,    setParentDivs]    = useState([]);
  const [subDivs,       setSubDivs]       = useState([]);

  // Multi-select draft filters (arrays matching SalesRevenueReport / TwcViewAllTable pattern)
  const [draftLegalGroup,   setDraftLegalGroup]   = useState(filters?.legal_group_id ? (Array.isArray(filters.legal_group_id) ? filters.legal_group_id : [filters.legal_group_id]) : ['All']);
  const [draftLegalEntity,  setDraftLegalEntity]  = useState(filters?.legal_entity_id ? (Array.isArray(filters.legal_entity_id) ? filters.legal_entity_id : [filters.legal_entity_id]) : ['All']);
  const [draftParentDiv,    setDraftParentDiv]    = useState(filters?.parent_division_id ? (Array.isArray(filters.parent_division_id) ? filters.parent_division_id : [filters.parent_division_id]) : ['All']);
  const [draftSubDiv,       setDraftSubDiv]       = useState(filters?.subdivision_id ? (Array.isArray(filters.subdivision_id) ? filters.subdivision_id : [filters.subdivision_id]) : ['All']);

  // Applied filter state
  const [appliedTrendFilters, setAppliedTrendFilters] = useState(() => ({
    as_on_date: filters?.as_on_date || filters?.as_of_date || '2026-10-31',
    legal_group_id: filters?.legal_group_id || undefined,
    legal_entity_id: filters?.legal_entity_id || undefined,
    parent_division_id: filters?.parent_division_id || undefined,
    subdivision_id: filters?.subdivision_id || undefined,
  }));

  // Load cached hierarchy options
  useEffect(() => {
    let cancelled = false;
    fetchHierarchyOptions().then(opts => {
      if (cancelled || !opts) return;
      setLegalGroups(opts.legalGroups);
      setLegalEntities(opts.legalEntities);
      setParentDivs(opts.parentDivs);
      setSubDivs(opts.subDivs);
    });
    return () => { cancelled = true; };
  }, []);

  // Sync when initial filters prop changes
  useEffect(() => {
    if (filters) {
      setDraftLegalGroup(filters.legal_group_id ? (Array.isArray(filters.legal_group_id) ? filters.legal_group_id : [filters.legal_group_id]) : ['All']);
      setDraftLegalEntity(filters.legal_entity_id ? (Array.isArray(filters.legal_entity_id) ? filters.legal_entity_id : [filters.legal_entity_id]) : ['All']);
      setDraftParentDiv(filters.parent_division_id ? (Array.isArray(filters.parent_division_id) ? filters.parent_division_id : [filters.parent_division_id]) : ['All']);
      setDraftSubDiv(filters.subdivision_id ? (Array.isArray(filters.subdivision_id) ? filters.subdivision_id : [filters.subdivision_id]) : ['All']);
      setAppliedTrendFilters({
        as_on_date: filters.as_on_date || filters.as_of_date || '2026-10-31',
        legal_group_id: filters.legal_group_id || undefined,
        legal_entity_id: filters.legal_entity_id || undefined,
        parent_division_id: filters.parent_division_id || undefined,
        subdivision_id: filters.subdivision_id || undefined,
      });
    }
  }, [filters]);

  // Cascading options based on selection, strictly scoping sub-divisions to parent division
  const { filteredLegalEntities, filteredParentDivs, filteredSubDivs } = useCascadingHierarchy({
    legalEntities,
    parentDivs,
    subDivs,
    draftLegalGroup,
    draftLegalEntity,
    draftParentDiv,
  });

  const handleApply = () => {
    setAppliedTrendFilters({
      as_on_date: filters?.as_on_date || filters?.as_of_date || '2026-10-31',
      legal_group_id:     (!draftLegalGroup || draftLegalGroup.includes('All') || draftLegalGroup.length === 0) ? undefined : draftLegalGroup,
      legal_entity_id:    (!draftLegalEntity || draftLegalEntity.includes('All') || draftLegalEntity.length === 0) ? undefined : draftLegalEntity,
      parent_division_id: (!draftParentDiv || draftParentDiv.includes('All') || draftParentDiv.length === 0) ? undefined : draftParentDiv,
      subdivision_id:     (!draftSubDiv || draftSubDiv.includes('All') || draftSubDiv.length === 0) ? undefined : draftSubDiv,
    });
  };

  const handleReset = () => {
    setDraftLegalGroup(['All']);
    setDraftLegalEntity(['All']);
    setDraftParentDiv(['All']);
    setDraftSubDiv(['All']);
    setAppliedTrendFilters({
      as_on_date: filters?.as_on_date || filters?.as_of_date || '2026-10-31',
      legal_group_id: undefined,
      legal_entity_id: undefined,
      parent_division_id: undefined,
      subdivision_id: undefined,
    });
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getExecTwcTrend(appliedTrendFilters)
      .then(payload => {
        if (cancelled) return;
        setRows(getRows(payload));
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[TWC Trend]', err.response?.status, err.response?.data || err.message);
        setError('Failed to load (' + (err.response?.status ?? 'Network error') + ').');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [appliedTrendFilters]);

  // Extract unique available years from returned trend records
  const availableYears = useMemo(() => {
    const yrs = new Set();
    rows.forEach(r => {
      const raw = r.month_label ?? r.month ?? r.period_name ?? r.period;
      const p = parsePeriodKey(raw);
      if (p.year) yrs.add(p.year);
    });
    if (yrs.size === 0) yrs.add('2026');
    return Array.from(yrs).sort().reverse();
  }, [rows]);

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // Map month data for the selected year and find latest recorded month
  const { monthMap, latestRow } = useMemo(() => {
    const map = {};
    let latest = null;
    let maxIdx = -1;

    rows.forEach(r => {
      const raw = r.month_label ?? r.month ?? r.period_name ?? r.period;
      const p = parsePeriodKey(raw);
      if (p.year === selectedYear) {
        map[p.monthName] = r;
        if (p.monthIndex >= maxIdx) {
          maxIdx = p.monthIndex;
          latest = r;
        }
      }
    });

    return { monthMap: map, latestRow: latest };
  }, [rows, selectedYear]);

  // 8 Exact Rows in order requested by user (matching red numbers 1-8 in mockup)
  const METRIC_DEFINITIONS = useMemo(() => [
    {
      id: 'trade_receivables',
      label: 'Trade Receivables (' + currency + ')',
      order: 1,
      type: 'currency',
      getValue: (r) => (r ? (r.trade_receivables ?? r.total_receivables ?? r.receivables ?? r.tr) : null),
    },
    {
      id: 'dso',
      label: 'DSO (Days)',
      order: 2,
      type: 'days',
      getValue: (r) => (r ? (r.dso_days ?? r.dso) : null),
    },
    {
      id: 'inventory',
      label: 'Inventory (' + currency + ')',
      order: 3,
      type: 'currency',
      getValue: (r) => (r ? (r.inventory ?? r.total_inventory ?? r.inventories ?? r.inv) : null),
    },
    {
      id: 'dio',
      label: 'DIO (Days)',
      order: 4,
      type: 'days',
      getValue: (r) => (r ? (r.dio_days ?? r.dio) : null),
    },
    {
      id: 'trade_payables',
      label: 'Trade Payables (' + currency + ')',
      order: 5,
      type: 'currency',
      getValue: (r) => (r ? (r.trade_payables ?? r.total_payables ?? r.payables ?? r.tp) : null),
    },
    {
      id: 'dpo',
      label: 'DPO (Days)',
      order: 6,
      type: 'days',
      getValue: (r) => (r ? (r.dpo_days ?? r.dpo) : null),
    },
    {
      id: 'twc',
      label: 'TWC (' + currency + ')',
      order: 7,
      type: 'currency',
      isSummary: true,
      isTwc: true,
      getValue: (r) => (r ? (r.trade_working_capital ?? r.twc) : null),
    },
    {
      id: 'ccc',
      label: 'CCC (Days)',
      order: 8,
      type: 'days',
      isSummary: true,
      isCcc: true,
      getValue: (r) => (r ? (r.cash_conversion_cycle_days ?? r.ccc) : null),
    },
  ], [currency]);

  // Completed number of months N based on filter date (as_on_date / as_of_date) and selectedYear
  // Rule: YTD Average = (Month 1 + Month 2 + ... + Month N) / Completed No. of months (N)
  // e.g. for Sept 2026 = (Jan26 + Feb26 + ... + Sept26) / 9
  // e.g. for Jan 26 = Jan26 / 1; Feb 26 = (Jan26 + Feb26) / 2; Aug = (Jan26 + ... + Aug26) / 8
  const completedMonthCount = useMemo(() => {
    const rawDate = appliedTrendFilters?.as_on_date || appliedTrendFilters?.as_of_date || filters?.as_on_date || filters?.as_of_date || '';
    let filterYr = 2026;
    let filterMo = 9; // Default September if not parseable

    if (rawDate) {
      const dateStr = String(rawDate).trim();
      const m1 = dateStr.match(/^(\d{4})[-/](\d{1,2})/);
      if (m1) {
        filterYr = parseInt(m1[1], 10);
        filterMo = parseInt(m1[2], 10);
      } else {
        const m2 = dateStr.match(/^([a-zA-Z]{3})[-/ ]?(\d{2,4})/);
        if (m2) {
          const mi = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(m2[1].toUpperCase());
          if (mi >= 0) filterMo = mi + 1;
          const yNum = parseInt(m2[2], 10);
          filterYr = yNum < 100 ? 2000 + yNum : yNum;
        }
      }
    }

    const selYr = parseInt(selectedYear || '2026', 10);
    if (selYr < filterYr) return 12; // Past year: all 12 months completed
    if (selYr > filterYr) return 0;  // Future year: not started
    return Math.min(12, Math.max(1, filterMo));
  }, [appliedTrendFilters, filters, selectedYear]);

  // Calculate YTD Average = (Month 1 + Month 2 + ... + Month N) / Completed No. of months (N)
  const getMetricAverage = (metric) => {
    const N = completedMonthCount;
    if (N <= 0) return null;
    const activeMonths = MONTH_COLS.slice(0, N);
    let sum = 0;
    let hasAnyData = false;
    activeMonths.forEach(m => {
      const rowData = monthMap[m];
      const val = metric.getValue(rowData);
      if (val !== null && val !== undefined && val !== '' && !isNaN(Number(val))) {
        sum += Number(val);
        hasAnyData = true;
      }
    });
    return hasAnyData ? (sum / N) : null;
  };




  // Filter rows by search term
  const displayMetrics = useMemo(() => {
    if (!search.trim()) return METRIC_DEFINITIONS;
    const q = search.toLowerCase();
    return METRIC_DEFINITIONS.filter(m => m.label.toLowerCase().includes(q));
  }, [METRIC_DEFINITIONS, search]);

  const formatCell = (val, type, displayUnit) => {
    if (val === null || val === undefined || val === '' || isNaN(Number(val))) return '—';
    const num = Number(val);
    if (type === 'days') {
      return num.toFixed(2);
    }
    if (displayUnit === 'millions') {
      const inM = num / 1000000;
      return inM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'M';
    }
    return Math.round(num).toLocaleString('en-US');
  };

  const getCellColor = (val, metric) => {
    if (val === null || val === undefined || val === '' || isNaN(Number(val))) return '#94a3b8';
    const num = Number(val);
    if (num < 0) return '#ef4444'; // Red for negative numbers (matching MoM design)
    if (metric.isTwc) return num >= 0 ? '#2563eb' : '#ef4444';
    if (metric.isSummary) return '#1e293b';
    return '#334155';
  };

  const handleExport = async (format) => {
    if (exporting) return;
    setExporting(true);
    try {
      if (format === 'excel') {
        const headers = ['Parameter', ...MONTH_COLS, 'Average'];
        const csvRows = [headers.join(',')];
        METRIC_DEFINITIONS.forEach(m => {
          const avgVal = getMetricAverage(m);
          const rowCells = [
            '"' + m.label + '"',
            ...MONTH_COLS.map(col => {
              const v = m.getValue(monthMap[col]);
              return v !== null && v !== undefined && !isNaN(Number(v)) ? Number(v).toFixed(2) : '';
            }),
            avgVal !== null && avgVal !== undefined && !isNaN(Number(avgVal)) ? Number(avgVal).toFixed(2) : '',
          ];
          csvRows.push(rowCells.join(','));
        });
        const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'TWC_Month_on_Month_Trend_' + selectedYear + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Excel/CSV export started — check Downloads', 'success');
        if (onExportExcel) onExportExcel();
      } else if (format === 'pdf') {
        if (onExportPdf) await onExportPdf();
        showToast('PDF export started — check Downloads', 'success');
      }
    } catch (err) {
      showToast(err?.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#f8fafc' }}>
      {/* Top Controls Toolbar: Title + Year + Unit Toggle + Export */}
      <div style={{
        padding: '10px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        flexShrink: 0
      }}>
        {/* Left info description */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
            Month-on-Month Working Capital Trend
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 1, fontWeight: 500 }}>
            Receivables, Inventory, Payables and Cash Conversion Cycle by month · {currency}
          </div>
        </div>

        {/* Right controls: Year + AED / AED Millions + Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Year Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b' }}>Year:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              style={{
                padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: '0.72rem', fontWeight: 700, color: '#1e3a8a', background: '#fff',
                cursor: 'pointer', outline: 'none', height: 28, boxSizing: 'border-box'
              }}
            >
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* AED / AED Millions Toggle */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', height: 28,
            border: '1px solid #d6deeb', borderRadius: 6, background: '#f8fafc', overflow: 'hidden'
          }}>
            <button
              type="button"
              onClick={() => setUnit('aed')}
              style={{
                height: '100%', minWidth: 42, padding: '0 9px', border: 'none', borderRight: '1px solid #d6deeb',
                background: unit === 'aed' ? '#172f80' : 'transparent',
                color: unit === 'aed' ? '#ffffff' : '#64748b',
                fontSize: '0.70rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s ease',
              }}
              title={"Display amounts in " + currency}
            >
              {currency}
            </button>
            <button
              type="button"
              onClick={() => setUnit('millions')}
              style={{
                height: '100%', minWidth: 86, padding: '0 9px', border: 'none',
                background: unit === 'millions' ? '#172f80' : 'transparent',
                color: unit === 'millions' ? '#ffffff' : '#64748b',
                fontSize: '0.70rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s ease',
              }}
              title={"Display amounts in " + currency + " Millions"}
            >
              {currency} Millions
            </button>
          </div>

          {/* Export Buttons */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleExport('excel')}
              disabled={exporting}
              title="Export to Excel / CSV"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                border: '1px solid #bbf7d0', borderRadius: 6, cursor: exporting ? 'not-allowed' : 'pointer',
                fontWeight: 700, transition: 'all 0.15s', outline: 'none',
                fontSize: '0.70rem', height: 28, padding: '0 10px',
                background: exporting ? '#d1fae5' : '#f0fdf4', color: '#15803d',
                opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting ? '⏳' : '📊'} Excel
            </button>
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              title="Export to PDF"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                border: '1px solid #fecdd3', borderRadius: 6, cursor: exporting ? 'not-allowed' : 'pointer',
                fontWeight: 700, transition: 'all 0.15s', outline: 'none',
                fontSize: '0.70rem', height: 28, padding: '0 10px',
                background: exporting ? '#fee2e2' : '#fff1f2', color: '#be123c',
                opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting ? '⏳' : '📄'} PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Hierarchy Filter Toolbar: Search + Legal Group + Legal Entity + Parent Division + Sub-Division + Apply + Reset ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
        borderBottom: '1px solid #e2e8f0',
        background: '#fff',
        flexShrink: 0,
        gap: 6,
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 90,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
          {/* Search box with green magnifying glass icon */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 8, pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              placeholder="Search metrics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '4px 8px 4px 26px',
                borderRadius: 7,
                border: '1px solid #cbd5e1',
                fontSize: '0.74rem',
                width: 135,
                outline: 'none',
                height: 28,
                boxSizing: 'border-box',
                background: '#fff',
                color: '#334155',
              }}
            />
          </div>

          {/* Legal Group Multi-Select */}
          <ExecMultiSelect
            options={legalGroups}
            value={draftLegalGroup}
            onChange={(vals) => {
              setDraftLegalGroup(vals);
              setDraftLegalEntity(['All']);
              setDraftParentDiv(['All']);
              setDraftSubDiv(['All']);
            }}
            placeholder="All Legal Group"
            style={{ width: 125, minWidth: 115 }}
          />

          {/* Legal Entity Multi-Select */}
          <ExecMultiSelect
            options={filteredLegalEntities}
            value={draftLegalEntity}
            onChange={(vals) => {
              setDraftLegalEntity(vals);
              setDraftParentDiv(['All']);
              setDraftSubDiv(['All']);
            }}
            placeholder="All Legal Entity"
            style={{ width: 135, minWidth: 125 }}
          />

          {/* Parent Division Multi-Select */}
          <ExecMultiSelect
            options={filteredParentDivs}
            value={draftParentDiv}
            onChange={(vals) => {
              setDraftParentDiv(vals);
              setDraftSubDiv(['All']);
            }}
            placeholder="All Parent Division"
            style={{ width: 145, minWidth: 135 }}
          />

          {/* Sub-Division Multi-Select */}
          <ExecMultiSelect
            options={filteredSubDivs}
            value={draftSubDiv}
            onChange={(vals) => setDraftSubDiv(vals)}
            placeholder="All Sub-Division"
            style={{ width: 135, minWidth: 125 }}
          />

          {/* Apply Button (Blue) */}
          <button
            onClick={handleApply}
            style={{
              height: 28,
              padding: '0 16px',
              borderRadius: 7,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
          >
            Apply
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            style={{
              height: 28,
              padding: '0 12px',
              borderRadius: 7,
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {toast && <ExportToast message={toast.msg} type={toast.type} />}

      {/* Content: loading spinner, error, empty state, or table */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} />
      ) : !rows.length ? (
        <EmptyState message="No month-on-month trend data available for the selected filters." />
      ) : (
        /* Main Table: Transposed (Rows = Metrics, Columns = Months) */
        <div className="exec-modal-scroll" style={{
          flex: 1, minHeight: 0, overflow: 'auto', padding: '16px 20px', background: '#f8fafc'
        }}>
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
          overflow: 'hidden', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{
              width: 'max-content', minWidth: '100%',
              borderCollapse: 'separate', borderSpacing: 0,
              fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.76rem',
            }}>
              <thead>
                <tr>
                  {/* Sticky left column: Parameter */}
                  <th style={{
                    position: 'sticky', top: 0, left: 0, zIndex: 25,
                    width: 250, minWidth: 250, maxWidth: 280,
                    padding: '11px 16px', background: '#edf4ff', color: '#1e3a8a',
                    fontWeight: 800, fontSize: '0.72rem', textAlign: 'left',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    borderBottom: '2px solid #cbd5e1', borderRight: '1px solid #cbd5e1',
                  }}>
                    Parameter
                  </th>
                  {/* Monthly Columns: JAN to DEC */}
                  {MONTH_COLS.map(m => (
                    <th key={m} style={{
                      position: 'sticky', top: 0, zIndex: 10,
                      width: 96, minWidth: 96,
                      padding: '11px 12px', background: '#edf4ff', color: '#1e3a8a',
                      fontWeight: 800, fontSize: '0.72rem', textAlign: 'right',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      borderBottom: '2px solid #cbd5e1', borderRight: '1px solid #e2e8f0',
                    }}>
                      {m}
                    </th>
                  ))}
                  {/* Average Column */}
                  <th style={{
                    position: 'sticky', top: 0, zIndex: 10,
                    width: 104, minWidth: 104,
                    padding: '11px 14px', background: '#e0ecff', color: '#1e3a8a',
                    fontWeight: 800, fontSize: '0.72rem', textAlign: 'right',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    borderBottom: '2px solid #cbd5e1',
                  }}>
                    Average
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={14} style={{ padding: '30px 16px', textAlign: 'center', color: '#64748b' }}>
                      No matching parameters found for "{search}".
                    </td>
                  </tr>
                ) : (
                  displayMetrics.map((metric, idx) => {
                    const isSummary = metric.isSummary;
                    const isTwc = metric.isTwc;
                    const isCcc = metric.isCcc;

                    const rowBg = isTwc
                      ? '#f0f7ff'
                      : isCcc
                        ? '#faf5ff'
                        : idx % 2 === 0
                          ? '#ffffff'
                          : '#fafcff';

                    const avgVal = getMetricAverage(metric);
                    const avgFormatted = formatCell(avgVal, metric.type, unit);
                    const avgColor = getCellColor(avgVal, metric);

                    return (
                      <tr
                        key={metric.id}
                        style={{
                          background: rowBg,
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          if (!isTwc && !isCcc) {
                            e.currentTarget.style.background = '#f1f5f9';
                            const firstTd = e.currentTarget.children[0];
                            if (firstTd) firstTd.style.background = '#f1f5f9';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isTwc && !isCcc) {
                            e.currentTarget.style.background = rowBg;
                            const firstTd = e.currentTarget.children[0];
                            if (firstTd) firstTd.style.background = rowBg;
                          }
                        }}
                      >
                        {/* Sticky Parameter Name Column */}
                        <td style={{
                          position: 'sticky', left: 0, zIndex: 12,
                          background: rowBg,
                          padding: '10px 16px',
                          fontSize: '0.74rem',
                          fontWeight: isSummary ? 800 : 700,
                          color: isTwc ? '#1d4ed8' : isCcc ? '#7c3aed' : '#1e293b',
                          borderBottom: isSummary ? '2px solid #cbd5e1' : '1px solid #f1f5f9',
                          borderRight: '1px solid #cbd5e1',
                          whiteSpace: 'nowrap',
                        }}>
                          {metric.label}
                        </td>

                        {/* Monthly Data Cells */}
                        {MONTH_COLS.map(m => {
                          const rowData = monthMap[m];
                          const val = metric.getValue(rowData);
                          const formatted = formatCell(val, metric.type, unit);
                          const cellColor = getCellColor(val, metric);

                          return (
                            <td key={m} style={{
                              padding: '10px 12px',
                              textAlign: 'right',
                              fontSize: '0.74rem',
                              fontWeight: isSummary ? 800 : 600,
                              color: cellColor,
                              fontVariantNumeric: 'tabular-nums',
                              borderBottom: isSummary ? '2px solid #cbd5e1' : '1px solid #f1f5f9',
                              borderRight: '1px solid #f1f5f9',
                              whiteSpace: 'nowrap',
                            }}>
                              {formatted}
                            </td>
                          );
                        })}

                        {/* Average Value Cell */}
                        <td style={{
                          padding: '10px 14px',
                          textAlign: 'right',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          color: avgColor,
                          fontVariantNumeric: 'tabular-nums',
                          background: isTwc ? '#e4f0ff' : isCcc ? '#f3e8ff' : '#f8fafd',
                          borderBottom: isSummary ? '2px solid #cbd5e1' : '1px solid #f1f5f9',
                          whiteSpace: 'nowrap',
                        }}>
                          {avgFormatted}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   REGIONAL FILTER TOOLBAR (Matches TWC – View All / Sales Revenue View All)
───────────────────────────────────────────────────────────────────────────── */

function RegionalFilterToolbar({
  search,
  setSearch,
  searchPlaceholder = 'Search regions...',
  legalGroups,
  draftLegalGroup,
  setDraftLegalGroup,
  filteredLegalEntities,
  draftLegalEntity,
  setDraftLegalEntity,
  filteredParentDivs,
  draftParentDiv,
  setDraftParentDiv,
  filteredSubDivs,
  draftSubDiv,
  setDraftSubDiv,
  draftFromDate,
  setDraftFromDate,
  draftToDate,
  setDraftToDate,
  fromDateId,
  toDateId,
  onApply,
  onReset,
  onExport,
  exporting,
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      borderBottom: '1px solid #e2e8f0',
      background: '#fff',
      flexShrink: 0,
      gap: 6,
      flexWrap: 'wrap',
      position: 'relative',
      zIndex: 100,
      overflow: 'visible',
    }}>
      {/* Left: Search + Hierarchy Multi-Selects + Period + Apply / Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0, flex: 1, position: 'relative', zIndex: 101 }}>
        {/* Search box with green magnifying glass icon matching Sales Revenue */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 8, pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '4px 8px 4px 26px',
              borderRadius: 7,
              border: '1px solid #cbd5e1',
              fontSize: '0.74rem',
              width: 135,
              outline: 'none',
              height: 28,
              boxSizing: 'border-box',
              background: '#fff',
              color: '#334155',
            }}
          />
        </div>

        {/* Legal Group Multi-Select */}
        <ExecMultiSelect
          options={legalGroups}
          value={draftLegalGroup}
          onChange={(vals) => {
            setDraftLegalGroup(vals);
            setDraftLegalEntity(['All']);
            setDraftParentDiv(['All']);
            setDraftSubDiv(['All']);
          }}
          placeholder="All Legal Group"
          style={{ width: 120, minWidth: 110 }}
        />

        {/* Legal Entity Multi-Select */}
        <ExecMultiSelect
          options={filteredLegalEntities}
          value={draftLegalEntity}
          onChange={(vals) => {
            setDraftLegalEntity(vals);
            setDraftParentDiv(['All']);
            setDraftSubDiv(['All']);
          }}
          placeholder="All Legal Entity"
          style={{ width: 130, minWidth: 120 }}
        />

        {/* Parent Division Multi-Select */}
        <ExecMultiSelect
          options={filteredParentDivs}
          value={draftParentDiv}
          onChange={(vals) => {
            setDraftParentDiv(vals);
            setDraftSubDiv(['All']);
          }}
          placeholder="All Parent Division"
          style={{ width: 140, minWidth: 130 }}
        />

        {/* Sub-Division Multi-Select */}
        <ExecMultiSelect
          options={filteredSubDivs}
          value={draftSubDiv}
          onChange={(vals) => setDraftSubDiv(vals)}
          placeholder="All Sub-Division"
          style={{ width: 130, minWidth: 120 }}
        />

        {/* Period Date Range with FinSight Calendar Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Period:</span>
          <CalendarDateField
            id={fromDateId}
            value={draftFromDate}
            onChange={setDraftFromDate}
          />
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>-</span>
          <CalendarDateField
            id={toDateId}
            value={draftToDate}
            onChange={setDraftToDate}
          />
        </div>

        {/* Apply Button (Blue) */}
        <button
          onClick={onApply}
          style={{
            height: 28,
            padding: '0 16px',
            borderRadius: 7,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
          onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
        >
          Apply
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          style={{
            height: 28,
            padding: '0 12px',
            borderRadius: 7,
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #e2e8f0',
            fontSize: '0.74rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
        >
          ↺ Reset
        </button>
      </div>

      {/* Right: Export Buttons matching Sales Revenue View All */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={() => onExport('excel')}
          disabled={!!exporting}
          title="Export to Excel"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            border: '1px solid #bbf7d0', borderRadius: 7, cursor: exporting ? 'not-allowed' : 'pointer',
            fontWeight: 700, transition: 'all 0.15s', outline: 'none',
            fontSize: '0.70rem', height: 28, padding: '0 10px',
            background: exporting === 'excel' ? '#d1fae5' : '#f0fdf4',
            color: '#15803d',
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting === 'excel' ? '⏳' : '📊'} Excel
        </button>

        <button
          onClick={() => onExport('pdf')}
          disabled={!!exporting}
          title="Export to PDF"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            border: '1px solid #fecdd3', borderRadius: 7, cursor: exporting ? 'not-allowed' : 'pointer',
            fontWeight: 700, transition: 'all 0.15s', outline: 'none',
            fontSize: '0.70rem', height: 28, padding: '0 10px',
            background: exporting === 'pdf' ? '#fee2e2' : '#fff1f2',
            color: '#be123c',
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting === 'pdf' ? '⏳' : '📄'} PDF
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 3: Revenue by Region
───────────────────────────────────────────────────────────────────────────── */

function RevenueByRegion({ filters = {}, currency = 'AED' }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Export & Toast state
  const [exporting, setExporting] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  // Dropdown options
  const [legalGroups,   setLegalGroups]   = useState([]);
  const [legalEntities, setLegalEntities] = useState([]);
  const [parentDivs,    setParentDivs]    = useState([]);
  const [subDivs,       setSubDivs]       = useState([]);

  // Multi-select draft filters
  const [draftLegalGroup,   setDraftLegalGroup]   = useState(filters.legal_group_id ? (Array.isArray(filters.legal_group_id) ? filters.legal_group_id : [filters.legal_group_id]) : ['All']);
  const [draftLegalEntity,  setDraftLegalEntity]  = useState(filters.legal_entity_id ? (Array.isArray(filters.legal_entity_id) ? filters.legal_entity_id : [filters.legal_entity_id]) : ['All']);
  const [draftParentDiv,    setDraftParentDiv]    = useState(filters.parent_division_id ? (Array.isArray(filters.parent_division_id) ? filters.parent_division_id : [filters.parent_division_id]) : ['All']);
  const [draftSubDiv,       setDraftSubDiv]       = useState(filters.subdivision_id ? (Array.isArray(filters.subdivision_id) ? filters.subdivision_id : [filters.subdivision_id]) : ['All']);
  const [draftFromDate,     setDraftFromDate]     = useState('2026-01-01');
  const [draftToDate,       setDraftToDate]       = useState(filters.as_of_date || filters.as_on_date || '2026-09-25');

  // Applied filter state
  const [appliedRegionalFilters, setAppliedRegionalFilters] = useState({
    as_of_date: filters.as_of_date || filters.as_on_date || '2026-09-25',
    as_on_date: filters.as_of_date || filters.as_on_date || '2026-09-25',
    reporting_currency: currency,
    legal_group_id: filters.legal_group_id || undefined,
    legal_entity_id: filters.legal_entity_id || undefined,
    parent_division_id: filters.parent_division_id || undefined,
    subdivision_id: filters.subdivision_id || undefined,
  });

  // Load cached hierarchy options
  useEffect(() => {
    let cancelled = false;
    fetchHierarchyOptions().then(opts => {
      if (cancelled || !opts) return;
      setLegalGroups(opts.legalGroups);
      setLegalEntities(opts.legalEntities);
      setParentDivs(opts.parentDivs);
      setSubDivs(opts.subDivs);
    });
    return () => { cancelled = true; };
  }, []);

  // Sync draft states when initial filters prop changes
  useEffect(() => {
    const defaultDate = filters.as_of_date || filters.as_on_date || '2026-09-25';
    setDraftLegalGroup(filters.legal_group_id ? (Array.isArray(filters.legal_group_id) ? filters.legal_group_id : [filters.legal_group_id]) : ['All']);
    setDraftLegalEntity(filters.legal_entity_id ? (Array.isArray(filters.legal_entity_id) ? filters.legal_entity_id : [filters.legal_entity_id]) : ['All']);
    setDraftParentDiv(filters.parent_division_id ? (Array.isArray(filters.parent_division_id) ? filters.parent_division_id : [filters.parent_division_id]) : ['All']);
    setDraftSubDiv(filters.subdivision_id ? (Array.isArray(filters.subdivision_id) ? filters.subdivision_id : [filters.subdivision_id]) : ['All']);
    setDraftToDate(defaultDate);
    setAppliedRegionalFilters({
      as_of_date: defaultDate,
      as_on_date: defaultDate,
      reporting_currency: currency,
      legal_group_id: filters.legal_group_id || undefined,
      legal_entity_id: filters.legal_entity_id || undefined,
      parent_division_id: filters.parent_division_id || undefined,
      subdivision_id: filters.subdivision_id || undefined,
    });
  }, [filters, currency]);

  // Cascading options based on selection, strictly scoping sub-divisions to parent division
  const { filteredLegalEntities, filteredParentDivs, filteredSubDivs } = useCascadingHierarchy({
    legalEntities,
    parentDivs,
    subDivs,
    draftLegalGroup,
    draftLegalEntity,
    draftParentDiv,
  });

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getExecRevenueByRegion(appliedRegionalFilters)
      .then(payload => {
        if (cancelled) return;
        const raw = getRows(payload);
        if (!raw.length) { setRows([]); return; }
        const sorted = [...raw].sort((a, b) =>
          (Number(b.revenue ?? b.total_revenue ?? 0)) - (Number(a.revenue ?? a.total_revenue ?? 0))
        );
        setRows(sorted);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[Revenue by Region]', err.response?.status, err.response?.data || err.message);
        setError(`Failed to load (${err.response?.status ?? 'Network error'}).`);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [appliedRegionalFilters, currency]);

  const handleApply = () => {
    setAppliedRegionalFilters({
      as_of_date: draftToDate || '2026-09-25',
      as_on_date: draftToDate || '2026-09-25',
      reporting_currency: currency,
      legal_group_id:     (!draftLegalGroup || draftLegalGroup.includes('All') || draftLegalGroup.length === 0) ? undefined : draftLegalGroup,
      legal_entity_id:    (!draftLegalEntity || draftLegalEntity.includes('All') || draftLegalEntity.length === 0) ? undefined : draftLegalEntity,
      parent_division_id: (!draftParentDiv || draftParentDiv.includes('All') || draftParentDiv.length === 0) ? undefined : draftParentDiv,
      subdivision_id:     (!draftSubDiv || draftSubDiv.includes('All') || draftSubDiv.length === 0) ? undefined : draftSubDiv,
    });
  };

  const handleReset = () => {
    const defaultDate = filters.as_of_date || filters.as_on_date || '2026-09-25';
    setDraftLegalGroup(['All']);
    setDraftLegalEntity(['All']);
    setDraftParentDiv(['All']);
    setDraftSubDiv(['All']);
    setDraftFromDate('2026-01-01');
    setDraftToDate(defaultDate);
    setSearch('');
    setAppliedRegionalFilters({
      as_of_date: defaultDate,
      as_on_date: defaultDate,
      reporting_currency: currency,
    });
  };

  // Client-side search filtering
  const displayRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      const reg = String(r.region ?? r.country ?? r.country_name ?? '').toLowerCase();
      return reg.includes(q);
    });
  }, [rows, search]);

  const total = displayRows.reduce((s, r) => s + (Number(r.revenue ?? r.total_revenue ?? 0)), 0);

  const handleExport = async (format) => {
    if (exporting) return;
    setExporting(format);
    try {
      if (format === 'excel') {
        const XLSX = await import('xlsx');
        const exportData = displayRows.map(r => {
          const rev = r.revenue ?? r.total_revenue ?? 0;
          const pct = r.revenue_pct ?? r.percentage ?? (total > 0 ? ((Number(rev) / total) * 100) : 0);
          return {
            'Region / Country': r.region ?? r.country ?? r.country_name ?? '–',
            [`Revenue (${currency})`]: Number(rev),
            '% of Total': pct !== null ? `${Number(pct).toFixed(2)}%` : '–',
          };
        });
        if (displayRows.length > 0) {
          exportData.push({
            'Region / Country': 'Total',
            [`Revenue (${currency})`]: Number(total),
            '% of Total': '100.00%',
          });
        }
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Revenue_by_Region');
        XLSX.writeFile(wb, `Revenue_by_Region_${appliedRegionalFilters.as_of_date || 'latest'}.xlsx`);
        showToast('Excel export started — check Downloads', 'success');
      } else if (format === 'pdf') {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        doc.setFontSize(16);
        doc.setTextColor(30, 58, 138);
        doc.text('Revenue by Region', 40, 45);
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Reporting Currency: ${currency}   |   As on Date: ${appliedRegionalFilters.as_of_date || 'latest'}   |   Generated: ${new Date().toLocaleDateString()}`, 40, 62);

        const tableHeaders = [['Region / Country', `Revenue (${currency})`, '% of Total']];
        const tableBody = displayRows.map(r => {
          const rev = r.revenue ?? r.total_revenue ?? null;
          const pct = r.revenue_pct ?? r.percentage ?? (rev !== null && total > 0 ? ((Number(rev) / total) * 100) : null);
          return [
            r.region ?? r.country ?? r.country_name ?? '–',
            fmtNum(rev),
            pct !== null ? `${Number(pct).toFixed(2)}%` : '–',
          ];
        });
        if (displayRows.length > 0) {
          tableBody.push([
            'Total',
            fmtNum(total),
            '100.00%',
          ]);
        }
        autoTable(doc, {
          head: tableHeaders,
          body: tableBody,
          startY: 75,
          styles: { fontSize: 8, cellPadding: 5 },
          headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        doc.save(`Revenue_by_Region_${appliedRegionalFilters.as_of_date || 'latest'}.pdf`);
        showToast('PDF export started — check Downloads', 'success');
      }
    } catch (err) {
      console.error('Export error:', err);
      showToast(err?.message || 'Export failed', 'error');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <RegionalFilterToolbar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search regions..."
        legalGroups={legalGroups}
        draftLegalGroup={draftLegalGroup}
        setDraftLegalGroup={setDraftLegalGroup}
        filteredLegalEntities={filteredLegalEntities}
        draftLegalEntity={draftLegalEntity}
        setDraftLegalEntity={setDraftLegalEntity}
        filteredParentDivs={filteredParentDivs}
        draftParentDiv={draftParentDiv}
        setDraftParentDiv={setDraftParentDiv}
        filteredSubDivs={filteredSubDivs}
        draftSubDiv={draftSubDiv}
        setDraftSubDiv={setDraftSubDiv}
        draftFromDate={draftFromDate}
        setDraftFromDate={setDraftFromDate}
        draftToDate={draftToDate}
        setDraftToDate={setDraftToDate}
        fromDateId="rev-period-from"
        toDateId="rev-period-to"
        onApply={handleApply}
        onReset={handleReset}
        onExport={handleExport}
        exporting={exporting}
      />
      {toast && <ExportToast message={toast.msg} type={toast.type} />}

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: 10 }}>
        {loading ? <Spinner /> : error ? <ErrorState message={error} /> : !displayRows.length ? <EmptyState message={search ? "No matching regions found." : undefined} /> : (
          <ScrollTable minWidth={650}>
            <thead>
              <tr>
                <TH>Region / Country</TH>
                <TH align="right">Revenue ({currency})</TH>
                <TH align="right">% of Total</TH>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((r, i) => {
                const rev = r.revenue ?? r.total_revenue ?? null;
                const pct = r.revenue_pct ?? r.percentage ?? (rev !== null && total > 0 ? ((Number(rev) / total) * 100) : null);
                return (
                  <tr key={i}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <TD bold>{r.region ?? r.country ?? r.country_name ?? '–'}</TD>
                    <TD align="right">{fmtNum(rev)}</TD>
                    <TD align="right">{pct !== null ? `${Number(pct).toFixed(2)}%` : '–'}</TD>
                  </tr>
                );
              })}
            </tbody>
            {displayRows.length > 0 && (
              <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 15 }}>
                <tr>
                  <TF bold style={{ color: '#1e293b' }}>Total</TF>
                  <TF align="right" bold color="#2563eb">{fmtNum(total)}</TF>
                  <TF align="right" bold>100.00%</TF>
                </tr>
              </tfoot>
            )}
          </ScrollTable>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 4: Profitability by Region
───────────────────────────────────────────────────────────────────────────── */

function ProfitabilityByRegion({ filters = {}, currency = 'AED' }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Export & Toast state
  const [exporting, setExporting] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  // Dropdown options
  const [legalGroups,   setLegalGroups]   = useState([]);
  const [legalEntities, setLegalEntities] = useState([]);
  const [parentDivs,    setParentDivs]    = useState([]);
  const [subDivs,       setSubDivs]       = useState([]);

  // Multi-select draft filters
  const [draftLegalGroup,   setDraftLegalGroup]   = useState(filters.legal_group_id ? (Array.isArray(filters.legal_group_id) ? filters.legal_group_id : [filters.legal_group_id]) : ['All']);
  const [draftLegalEntity,  setDraftLegalEntity]  = useState(filters.legal_entity_id ? (Array.isArray(filters.legal_entity_id) ? filters.legal_entity_id : [filters.legal_entity_id]) : ['All']);
  const [draftParentDiv,    setDraftParentDiv]    = useState(filters.parent_division_id ? (Array.isArray(filters.parent_division_id) ? filters.parent_division_id : [filters.parent_division_id]) : ['All']);
  const [draftSubDiv,       setDraftSubDiv]       = useState(filters.subdivision_id ? (Array.isArray(filters.subdivision_id) ? filters.subdivision_id : [filters.subdivision_id]) : ['All']);
  const [draftFromDate,     setDraftFromDate]     = useState('2026-01-01');
  const [draftToDate,       setDraftToDate]       = useState(filters.as_of_date || filters.as_on_date || '2026-09-25');

  // Applied filter state
  const [appliedRegionalFilters, setAppliedRegionalFilters] = useState({
    as_of_date: filters.as_of_date || filters.as_on_date || '2026-09-25',
    as_on_date: filters.as_of_date || filters.as_on_date || '2026-09-25',
    reporting_currency: currency,
    legal_group_id: filters.legal_group_id || undefined,
    legal_entity_id: filters.legal_entity_id || undefined,
    parent_division_id: filters.parent_division_id || undefined,
    subdivision_id: filters.subdivision_id || undefined,
  });

  // Load cached hierarchy options
  useEffect(() => {
    let cancelled = false;
    fetchHierarchyOptions().then(opts => {
      if (cancelled || !opts) return;
      setLegalGroups(opts.legalGroups);
      setLegalEntities(opts.legalEntities);
      setParentDivs(opts.parentDivs);
      setSubDivs(opts.subDivs);
    });
    return () => { cancelled = true; };
  }, []);

  // Sync draft states when initial filters prop changes
  useEffect(() => {
    const defaultDate = filters.as_of_date || filters.as_on_date || '2026-09-25';
    setDraftLegalGroup(filters.legal_group_id ? (Array.isArray(filters.legal_group_id) ? filters.legal_group_id : [filters.legal_group_id]) : ['All']);
    setDraftLegalEntity(filters.legal_entity_id ? (Array.isArray(filters.legal_entity_id) ? filters.legal_entity_id : [filters.legal_entity_id]) : ['All']);
    setDraftParentDiv(filters.parent_division_id ? (Array.isArray(filters.parent_division_id) ? filters.parent_division_id : [filters.parent_division_id]) : ['All']);
    setDraftSubDiv(filters.subdivision_id ? (Array.isArray(filters.subdivision_id) ? filters.subdivision_id : [filters.subdivision_id]) : ['All']);
    setDraftToDate(defaultDate);
    setAppliedRegionalFilters({
      as_of_date: defaultDate,
      as_on_date: defaultDate,
      reporting_currency: currency,
      legal_group_id: filters.legal_group_id || undefined,
      legal_entity_id: filters.legal_entity_id || undefined,
      parent_division_id: filters.parent_division_id || undefined,
      subdivision_id: filters.subdivision_id || undefined,
    });
  }, [filters, currency]);

  // Cascading options based on selection, strictly scoping sub-divisions to parent division
  const { filteredLegalEntities, filteredParentDivs, filteredSubDivs } = useCascadingHierarchy({
    legalEntities,
    parentDivs,
    subDivs,
    draftLegalGroup,
    draftLegalEntity,
    draftParentDiv,
  });

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getExecProfitabilityByRegion(appliedRegionalFilters)
      .then(payload => {
        if (cancelled) return;
        const raw = getRows(payload);
        const sorted = [...raw].sort((a, b) =>
          (Number(b.net_profit ?? 0)) - (Number(a.net_profit ?? 0))
        );
        setRows(sorted);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[Profitability by Region]', err.response?.status, err.response?.data || err.message);
        setError(`Failed to load (${err.response?.status ?? 'Network error'}).`);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [appliedRegionalFilters, currency]);

  const handleApply = () => {
    setAppliedRegionalFilters({
      as_of_date: draftToDate || '2026-09-25',
      as_on_date: draftToDate || '2026-09-25',
      reporting_currency: currency,
      legal_group_id:     (!draftLegalGroup || draftLegalGroup.includes('All') || draftLegalGroup.length === 0) ? undefined : draftLegalGroup,
      legal_entity_id:    (!draftLegalEntity || draftLegalEntity.includes('All') || draftLegalEntity.length === 0) ? undefined : draftLegalEntity,
      parent_division_id: (!draftParentDiv || draftParentDiv.includes('All') || draftParentDiv.length === 0) ? undefined : draftParentDiv,
      subdivision_id:     (!draftSubDiv || draftSubDiv.includes('All') || draftSubDiv.length === 0) ? undefined : draftSubDiv,
    });
  };

  const handleReset = () => {
    const defaultDate = filters.as_of_date || filters.as_on_date || '2026-09-25';
    setDraftLegalGroup(['All']);
    setDraftLegalEntity(['All']);
    setDraftParentDiv(['All']);
    setDraftSubDiv(['All']);
    setDraftFromDate('2026-01-01');
    setDraftToDate(defaultDate);
    setSearch('');
    setAppliedRegionalFilters({
      as_of_date: defaultDate,
      as_on_date: defaultDate,
      reporting_currency: currency,
    });
  };

  // Client-side search filtering
  const displayRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      const reg = String(r.region ?? r.country ?? r.country_name ?? '').toLowerCase();
      return reg.includes(q);
    });
  }, [rows, search]);

  const totalGp = displayRows.reduce((s, r) => s + (Number(r.gross_profit ?? 0)), 0);
  const totalEbitda = displayRows.reduce((s, r) => s + (Number(r.ebitda ?? 0)), 0);
  const totalNp = displayRows.reduce((s, r) => s + (Number(r.net_profit ?? 0)), 0);
  const totalRevForGp = displayRows.reduce((s, r) => s + (Number(r.revenue ?? r.revenue_aed ?? 0)), 0);
  const totalGpPctRegion = totalRevForGp > 0 ? (totalGp / totalRevForGp) * 100 : null;

  const handleExport = async (format) => {
    if (exporting) return;
    setExporting(format);
    try {
      if (format === 'excel') {
        const XLSX = await import('xlsx');
        const exportData = displayRows.map(r => {
          const netMargin = r.net_margin_pct ?? r.net_margin ?? null;
          return {
            'Region / Country': r.region ?? r.country ?? r.country_name ?? '–',
            [`Gross Profit (${currency})`]: Number(r.gross_profit ?? 0),
            'Gross Profit %': (() => { const rev = Number(r.revenue ?? r.revenue_aed ?? 0); const gp = Number(r.gross_profit ?? 0); return rev > 0 ? `${((gp / rev) * 100).toFixed(2)}%` : '–'; })(),
            [`EBITDA (${currency})`]: Number(r.ebitda ?? 0),
            [`Net Profit (${currency})`]: Number(r.net_profit ?? 0),
            'Net Margin %': netMargin !== null ? `${Number(netMargin).toFixed(2)}%` : '–',
          };
        });
        if (displayRows.length > 0) {
          exportData.push({
            'Region / Country': 'Total',
            [`Gross Profit (${currency})`]: Number(totalGp),
            'Gross Profit %': totalGpPctRegion !== null ? `${totalGpPctRegion.toFixed(2)}%` : '–',
            [`EBITDA (${currency})`]: Number(totalEbitda),
            [`Net Profit (${currency})`]: Number(totalNp),
            'Net Margin %': '–',
          });
        }
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Profitability_by_Region');
        XLSX.writeFile(wb, `Profitability_by_Region_${appliedRegionalFilters.as_of_date || 'latest'}.xlsx`);
        showToast('Excel export started — check Downloads', 'success');
      } else if (format === 'pdf') {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        doc.setFontSize(16);
        doc.setTextColor(30, 58, 138);
        doc.text('Profitability by Region', 40, 45);
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Reporting Currency: ${currency}   |   As on Date: ${appliedRegionalFilters.as_of_date || 'latest'}   |   Generated: ${new Date().toLocaleDateString()}`, 40, 62);

        const tableHeaders = [['Region / Country', `Gross Profit (${currency})`, 'Gross Profit %', `EBITDA (${currency})`, `Net Profit (${currency})`, 'Net Margin %']];
        const tableBody = displayRows.map(r => {
          const netMargin = r.net_margin_pct ?? r.net_margin ?? null;
          return [
            r.region ?? r.country ?? r.country_name ?? '–',
            fmtNum(r.gross_profit),
            (() => { const rev = Number(r.revenue ?? r.revenue_aed ?? 0); const gp = Number(r.gross_profit ?? 0); return rev > 0 ? `${((gp / rev) * 100).toFixed(2)}%` : '–'; })(),
            fmtNum(r.ebitda),
            fmtNum(r.net_profit),
            netMargin !== null ? `${Number(netMargin).toFixed(2)}%` : '–',
          ];
        });
        if (displayRows.length > 0) {
          tableBody.push([
            'Total',
            fmtNum(totalGp),
            totalGpPctRegion !== null ? `${totalGpPctRegion.toFixed(2)}%` : '–',
            fmtNum(totalEbitda),
            fmtNum(totalNp),
            '–',
          ]);
        }
        autoTable(doc, {
          head: tableHeaders,
          body: tableBody,
          startY: 75,
          styles: { fontSize: 8, cellPadding: 5 },
          headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        doc.save(`Profitability_by_Region_${appliedRegionalFilters.as_of_date || 'latest'}.pdf`);
        showToast('PDF export started — check Downloads', 'success');
      }
    } catch (err) {
      console.error('Export error:', err);
      showToast(err?.message || 'Export failed', 'error');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <RegionalFilterToolbar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search regions..."
        legalGroups={legalGroups}
        draftLegalGroup={draftLegalGroup}
        setDraftLegalGroup={setDraftLegalGroup}
        filteredLegalEntities={filteredLegalEntities}
        draftLegalEntity={draftLegalEntity}
        setDraftLegalEntity={setDraftLegalEntity}
        filteredParentDivs={filteredParentDivs}
        draftParentDiv={draftParentDiv}
        setDraftParentDiv={setDraftParentDiv}
        filteredSubDivs={filteredSubDivs}
        draftSubDiv={draftSubDiv}
        setDraftSubDiv={setDraftSubDiv}
        draftFromDate={draftFromDate}
        setDraftFromDate={setDraftFromDate}
        draftToDate={draftToDate}
        setDraftToDate={setDraftToDate}
        fromDateId="profit-period-from"
        toDateId="profit-period-to"
        onApply={handleApply}
        onReset={handleReset}
        onExport={handleExport}
        exporting={exporting}
      />
      {toast && <ExportToast message={toast.msg} type={toast.type} />}

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: 10 }}>
        {loading ? <Spinner /> : error ? <ErrorState message={error} /> : !displayRows.length ? <EmptyState message={search ? "No matching regions found." : undefined} /> : (
          <ScrollTable minWidth={750}>
            <thead>
              <tr>
                <TH>Region / Country</TH>
                <TH align="right">Gross Profit ({currency})</TH>
                <TH align="right">Gross Profit %</TH>
                <TH align="right">EBITDA ({currency})</TH>
                <TH align="right">Net Profit ({currency})</TH>
                <TH align="right">Net Margin %</TH>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((r, i) => {
                const netMargin = r.net_margin_pct ?? r.net_margin ?? null;
                return (
                  <tr key={i}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <TD bold>{r.region ?? r.country ?? r.country_name ?? '–'}</TD>
                    <TD align="right">{fmtNum(r.gross_profit)}</TD>
                    <TD align="right" color="#2563eb">{(() => { const rev = Number(r.revenue ?? r.revenue_aed ?? 0); const gp = Number(r.gross_profit ?? 0); return rev > 0 ? `${((gp / rev) * 100).toFixed(2)}%` : (r.gross_profit_margin_pct != null ? `${Number(r.gross_profit_margin_pct).toFixed(2)}%` : '–'); })()}</TD>
                    <TD align="right">{fmtNum(r.ebitda)}</TD>
                    <TD align="right" color={r.net_profit === null ? undefined : (Number(r.net_profit) >= 0 ? '#10b981' : '#ef4444')}>
                      {fmtNum(r.net_profit)}
                    </TD>
                    <TD align="right">{netMargin !== null ? `${Number(netMargin).toFixed(2)}%` : '–'}</TD>
                  </tr>
                );
              })}
            </tbody>
            {displayRows.length > 0 && (
              <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 15 }}>
                <tr>
                  <TF bold style={{ color: '#1e293b' }}>Total</TF>
                  <TF align="right" bold color="#2563eb">{fmtNum(totalGp)}</TF>
                  <TF align="right" bold color="#2563eb">{totalGpPctRegion !== null ? `${totalGpPctRegion.toFixed(2)}%` : '–'}</TF>
                  <TF align="right" bold color="#2563eb">{fmtNum(totalEbitda)}</TF>
                  <TF align="right" bold color="#10b981">{fmtNum(totalNp)}</TF>
                  <TF align="right" bold>–</TF>
                </tr>
              </tfoot>
            )}
          </ScrollTable>
        )}
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 5: Profitability at a Glance (with Toggles, Graph & Table)
───────────────────────────────────────────────────────────────────────────── */

const PROFIT_SELECTION_CRITERIA = [
  { value: 'parent_division', label: 'Parent Division wise',  listKey: 'parentDivisions', paramKey: 'parentDivisionId' },
  { value: 'subdivision',     label: 'Subdivision wise',      listKey: 'subdivisions',    paramKey: 'subdivisionId'    },
  { value: 'legal_entity',    label: 'Legal Entity wise',     listKey: 'legalEntities',   paramKey: 'legalEntityId'    },
  { value: 'legal_group',     label: 'Legal Group wise',      listKey: 'legalGroups',     paramKey: 'legalGroupId'     },
];

const PROFIT_YEARS = ['2026', '2025', '2024'];

function extractMetricsFromStatement(stmt) {
  if (!stmt) return {
    revenue: 0,
    cost_of_material: 0,
    direct_labour: 0,
    manufacturing_expense: 0,
    overhead_absorption: 0,
    gross_profit: 0,
    operating_expense: 0,
    pbt: 0,
    net_profit: 0,
  };

  let rawList = [];
  if (Array.isArray(stmt)) {
    rawList = stmt;
  } else if (stmt && typeof stmt === 'object') {
    ['income', 'cost_of_sales', 'expenses', 'bottom', 'data', 'rows', 'items', 'results'].forEach(k => {
      if (Array.isArray(stmt[k])) rawList = rawList.concat(stmt[k]);
    });
    if (rawList.length === 0) rawList = Object.values(stmt).filter(Array.isArray).flat();
  }

  const getNum = (row) => {
    if (!row) return 0;
    const v = row.current_ptd ?? row.current_ptd_aed ?? row.current ?? row.value ?? row.amount ?? 0;
    if (typeof v === 'number') return v;
    const n = parseFloat(String(v).replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
  };

  const findRow = (predicate) => rawList.find(r => {
    const p = String(r.particulars || r.label || r.name || r.line_item || '').toLowerCase().trim();
    return predicate(p);
  });

  const revenueRow = findRow(p => p === 'total revenue' || p === 'revenue from sales of goods & services' || p === 'total income' || p === 'sales revenue')
    || findRow(p => p.includes('total revenue') || p.endsWith('revenue'));
  const revenue = getNum(revenueRow);

  const comRow = findRow(p => (p === 'cost of material' || p === 'cost of materials' || p.includes('cost of material')) && !p.includes('%'));
  const cost_of_material = getNum(comRow);

  // Direct Labour
  const labourRow = findRow(p => (p === 'direct labour' || p === 'direct labor' || p.includes('direct labour') || p.includes('direct labor')) && !p.includes('%'));
  const direct_labour = getNum(labourRow);

  // Overhead Absorption
  const absorptionRow = findRow(p => (p.includes('overhead absorption') || p.includes('absorption')) && !p.includes('%'));
  const overhead_absorption = getNum(absorptionRow);

  // Manufacturing / Direct Overheads (+ RKME if present)
  const mfgRow = findRow(p => (p.includes('manufacturing') || p.includes('direct overhead')) && !p.includes('absorption') && !p.includes('depreciation') && !p.includes('%'));
  const rkmeRow = findRow(p => p.includes('rkme') && !p.includes('%'));
  let manufacturing_expense = getNum(mfgRow) + getNum(rkmeRow);

  // Fallback if specific manufacturing row was not labelled as such
  if (manufacturing_expense === 0) {
    const totDirectRow = findRow(p => (p === 'total direct expenses' || p.includes('direct expenses')) && !p.includes('rkme') && !p.includes('%'));
    if (totDirectRow) {
      const totDirect = getNum(totDirectRow);
      manufacturing_expense = totDirect - direct_labour - overhead_absorption;
    }
  }

  let gpRow = findRow(p => (p === 'gross profit' || p === 'gross margin') && !p.includes('%'));
  let gross_profit = getNum(gpRow);
  if (gross_profit === 0 && revenue > 0 && cost_of_material > 0) {
    gross_profit = revenue - cost_of_material - direct_labour - manufacturing_expense - overhead_absorption;
  }

  const opexRow = findRow(p => (p === 'total operating expenses' || p === 'total expenses' || p === 'operating expenses' || p.includes('total operating expense')) && !p.includes('%'));
  const operating_expense = getNum(opexRow);

  let pbtRow = findRow(p => (p === 'pbt' || p === 'profit before tax' || p.includes('profit before tax') || p === 'profit / (loss) before tax') && !p.includes('%'));
  let pbt = getNum(pbtRow);
  if (pbt === 0 && gross_profit !== 0) {
    pbt = gross_profit - operating_expense;
  }

  const npRow = findRow(p => (p === 'net profit' || p === 'net profit / (loss)' || p.includes('net profit')) && !p.includes('%'));
  const net_profit = getNum(npRow) || pbt;

  return {
    revenue,
    cost_of_material,
    direct_labour,
    manufacturing_expense,
    overhead_absorption,
    gross_profit,
    operating_expense,
    pbt,
    net_profit,
  };
}

/* Reusable AED / AED Millions Toggle Button (matches other pages style) */
function UnitToggle({ unit, onToggle, currency = 'AED' }) {
  const isAED = unit === 'aed';
  const isMillions = unit === 'millions';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 2 }}>
      <button
        type="button"
        onClick={() => onToggle('aed')}
        style={{
          height: 26,
          minWidth: 42,
          padding: '0 8px',
          borderRadius: 6,
          border: isAED ? '1px solid #2563eb' : '1px solid #cbd5e1',
          background: isAED ? '#2563eb' : '#FFFFFF',
          color: isAED ? '#FFFFFF' : '#334155',
          fontSize: '0.7rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
        title={`Display in ${currency}`}
      >
        {currency}
      </button>
      <button
        type="button"
        onClick={() => onToggle('millions')}
        style={{
          height: 26,
          minWidth: 80,
          padding: '0 8px',
          borderRadius: 6,
          border: isMillions ? '1px solid #2563eb' : '1px solid #cbd5e1',
          background: isMillions ? '#2563eb' : '#FFFFFF',
          color: isMillions ? '#FFFFFF' : '#334155',
          fontSize: '0.7rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
        title={`Display in ${currency} Millions`}
      >
        {currency} Millions
      </button>
    </div>
  );
}

const fmtAmount = (v, u) => {
  if (v === null || v === undefined) return '–';
  const n = Number(v);
  if (isNaN(n)) return '–';
  if (u === 'millions') {
    const m = n / 1_000_000;
    return `${m.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
  }
  return Math.round(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

function ProfitabilityGlanceSection({ filters = {}, currency = 'AED' }) {
  const [criteriaKey, setCriteriaKey] = useState('parent_division');
  const [reportSel, setReportSel]     = useState('All');
  const [year, setYear]               = useState('2026');
  const [period, setPeriod]           = useState('Oct-26');
  const [unit, setUnit]               = useState('aed'); // 'aed' | 'millions'
  const [filterOptions, setFilterOptions] = useState({});
  const [search, setSearch]           = useState('');

  const [staged, setStaged] = useState({
    criteriaKey: 'parent_division',
    reportSel: 'All',
    year: '2026',
    period: 'Jan-26',
  });

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const [exporting, setExporting] = useState(null); // 'excel' | 'pdf'
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExport = async (format) => {
    if (exporting) return;
    setExporting(format);
    try {
      if (format === 'excel') {
        const headers = [
          currentCritLabel,
          `Revenue (${unit === 'millions' ? `${currency} M` : currency})`,
          `Cost of Material (${unit === 'millions' ? `${currency} M` : currency})`,
          `Direct Labour (${unit === 'millions' ? `${currency} M` : currency})`,
          `Manufacturing Expense (${unit === 'millions' ? `${currency} M` : currency})`,
          `Overhead Absorption (${unit === 'millions' ? `${currency} M` : currency})`,
          `Gross Profit (${unit === 'millions' ? `${currency} M` : currency})`,
          'GP %',
          `Operating Expense (${unit === 'millions' ? `${currency} M` : currency})`,
          'Opex %',
          `Net Profit Before Tax (${unit === 'millions' ? `${currency} M` : currency})`,
          'PBT %',
        ];
        const rowsData = [
          headers,
          ...displayRows.map(r => [
            r.name,
            fmtAmount(r.revenue, unit),
            fmtAmount(r.cost_of_material, unit),
            fmtAmount(r.direct_labour, unit),
            fmtAmount(r.manufacturing_expense, unit),
            fmtAmount(r.overhead_absorption, unit),
            fmtAmount(r.gross_profit, unit),
            fmtPct(r.gp_pct),
            fmtAmount(r.operating_expense, unit),
            fmtPct(r.opex_pct),
            fmtAmount(r.pbt, unit),
            fmtPct(r.pbt_pct),
          ]),
          [
            `Total (${displayRows.length})`,
            fmtAmount(totals.revenue, unit),
            fmtAmount(totals.cost_of_material, unit),
            fmtAmount(totals.direct_labour, unit),
            fmtAmount(totals.manufacturing_expense, unit),
            fmtAmount(totals.overhead_absorption, unit),
            fmtAmount(totals.gross_profit, unit),
            fmtPct(totalGpPct),
            fmtAmount(totals.operating_expense, unit),
            fmtPct(totalOpexPct),
            fmtAmount(totals.pbt, unit),
            fmtPct(totalPbtPct),
          ],
        ];
        const ws = XLSX.utils.aoa_to_sheet(rowsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Detailed Financials');
        XLSX.writeFile(wb, `Profitability_Detailed_Financials_${period}_${year}.xlsx`);
        showToast('Excel export started — check Downloads', 'success');
      } else {
        await exportPL('statement', format, { year, periodName: period, currency });
        showToast('PDF export started — check Downloads', 'success');
      }
    } catch (e) {
      showToast(e?.message || 'Export failed', 'error');
    } finally {
      setExporting(null);
    }
  };

  // Fetch filter options from backend and trigger initial load
  useEffect(() => {
    let cancelled = false;
    fetchPLFilters()
      .then(res => {
        if (cancelled || !res) return;
        setFilterOptions(res);
        const initYear = res.years?.[0] ? String(res.years[0]) : '2026';
        const initPeriod = (res.periods && res.periods.length > 0) ? res.periods[res.periods.length - 1] : 'Oct-26';
        setYear(initYear);
        setPeriod(initPeriod);
        setStaged(s => ({ ...s, year: initYear, period: initPeriod }));
        fetchData('parent_division', 'All', initYear, initPeriod, res);
      })
      .catch(err => {
        console.error('[Profitability Glance] Filter options error:', err);
        setError('Failed to load filter options.');
      });
    return () => { cancelled = true; };
  }, []);

  const periodOptions = useMemo(() => {
    if (filterOptions.periods && filterOptions.periods.length > 0) {
      return filterOptions.periods.map(p => ({ value: p, label: p }));
    }
    const yy = String(staged.year || '2026').slice(2);
    return MONTHS_SHORT.map(m => ({
      value: `${m}-${yy}`,
      label: `${m}-${yy}`,
    }));
  }, [staged.year, filterOptions.periods]);

  const yearOptions = useMemo(() => {
    if (filterOptions.years && filterOptions.years.length > 0) {
      return filterOptions.years.map(y => String(y));
    }
    return PROFIT_YEARS;
  }, [filterOptions.years]);

  const reportOptions = useMemo(() => {
    const base = [{ value: 'All', label: 'All' }];
    const critObj = PROFIT_SELECTION_CRITERIA.find(c => c.value === staged.criteriaKey) || PROFIT_SELECTION_CRITERIA[0];
    const list = filterOptions[critObj.listKey] || [];
    return [...base, ...list.map(e => ({ value: String(e.id), label: e.name }))];
  }, [staged.criteriaKey, filterOptions]);

  const fetchData = async (crit, rSel, yr, prd, customOptions = null) => {
    setLoading(true);
    setError(null);

    const opts = customOptions || filterOptions;
    const critObj = PROFIT_SELECTION_CRITERIA.find(c => c.value === crit) || PROFIT_SELECTION_CRITERIA[0];
    let entities = opts[critObj.listKey] || [];

    if (rSel && rSel !== 'All') {
      entities = entities.filter(e => String(e.id) === String(rSel) || e.name === rSel);
    }

    if (!entities.length) {
      setRows([]);
      setLoading(false);
      return;
    }

    try {
      const settled = await Promise.all(
        entities.map(async (ent) => {
          try {
            const params = {
              year: yr,
              periodName: prd,
              currency: currency || 'AED',
              [critObj.paramKey]: [ent.id],
            };
            const stmt = await fetchPLStatement(params);
            const m = extractMetricsFromStatement(stmt);
            return {
              id: ent.id,
              name: ent.name,
              revenue: m.revenue,
              cost_of_material: m.cost_of_material,
              direct_labour: m.direct_labour,
              manufacturing_expense: m.manufacturing_expense,
              overhead_absorption: m.overhead_absorption,
              gross_profit: m.gross_profit,
              gp_pct: m.revenue ? (m.gross_profit / m.revenue) * 100 : 0,
              operating_expense: m.operating_expense,
              opex_pct: m.revenue ? (m.operating_expense / m.revenue) * 100 : 0,
              pbt: m.pbt,
              pbt_pct: m.revenue ? (m.pbt / m.revenue) * 100 : 0,
            };
          } catch (e) {
            console.warn(`[Profitability Glance] Statement error for ${ent.name}:`, e);
            return {
              id: ent.id,
              name: ent.name,
              revenue: 0,
              cost_of_material: 0,
              direct_labour: 0,
              manufacturing_expense: 0,
              overhead_absorption: 0,
              gross_profit: 0,
              gp_pct: 0,
              operating_expense: 0,
              opex_pct: 0,
              pbt: 0,
              pbt_pct: 0,
            };
          }
        })
      );

      // Sort by revenue descending so active contributors are first
      settled.sort((a, b) => b.revenue - a.revenue);
      setRows(settled);
    } catch (err) {
      console.error('[Profitability Glance] Error:', err);
      setError('Failed to load real backend data.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCriteriaChange = (newCrit) => {
    setCriteriaKey(newCrit);
    setReportSel('All');
    setStaged(s => ({ ...s, criteriaKey: newCrit, reportSel: 'All' }));
    fetchData(newCrit, 'All', year, period);
  };

  const handleApply = () => {
    setCriteriaKey(staged.criteriaKey);
    setReportSel(staged.reportSel);
    setYear(staged.year);
    setPeriod(staged.period);
    fetchData(staged.criteriaKey, staged.reportSel, staged.year, staged.period);
  };

  const handleReset = () => {
    const defYear = filterOptions.years?.[0] ? String(filterOptions.years[0]) : '2026';
    const defPeriod = (filterOptions.periods && filterOptions.periods.length > 0) ? filterOptions.periods[filterOptions.periods.length - 1] : 'Oct-26';
    const def = { criteriaKey: 'parent_division', reportSel: 'All', year: defYear, period: defPeriod };
    setStaged(def);
    setCriteriaKey(def.criteriaKey);
    setReportSel(def.reportSel);
    setYear(def.year);
    setPeriod(def.period);
    fetchData(def.criteriaKey, def.reportSel, def.year, def.period);
  };

  const displayRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r => (r.name || '').toLowerCase().includes(q));
  }, [rows, search]);

  const totals = useMemo(() => displayRows.reduce((acc, r) => ({
    revenue:               acc.revenue               + (r.revenue || 0),
    cost_of_material:      acc.cost_of_material      + (r.cost_of_material || 0),
    direct_labour:         acc.direct_labour         + (r.direct_labour || 0),
    manufacturing_expense: acc.manufacturing_expense + (r.manufacturing_expense || 0),
    overhead_absorption:   acc.overhead_absorption   + (r.overhead_absorption || 0),
    gross_profit:          acc.gross_profit          + (r.gross_profit || 0),
    operating_expense:     acc.operating_expense     + (r.operating_expense || 0),
    pbt:                   acc.pbt                   + (r.pbt || 0),
  }), { revenue: 0, cost_of_material: 0, direct_labour: 0, manufacturing_expense: 0, overhead_absorption: 0, gross_profit: 0, operating_expense: 0, pbt: 0 }),
  [displayRows]);

  const totalGpPct   = totals.revenue ? (totals.gross_profit     / totals.revenue) * 100 : 0;
  const totalOpexPct = totals.revenue ? (totals.operating_expense / totals.revenue) * 100 : 0;
  const totalPbtPct  = totals.revenue ? (totals.pbt              / totals.revenue) * 100 : 0;

  const currentCritLabel = PROFIT_SELECTION_CRITERIA.find(c => c.value === criteriaKey)?.label?.replace(' wise', '') || 'Parent Division';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#f8fafc' }}>
      {/* ── Top Bar: Selection Criteria Toggle Pills + Filter Selects ── */}
      <div style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
        {/* Toggle Pills row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 4 }}>
              Grouping:
            </span>
            {PROFIT_SELECTION_CRITERIA.map(crit => {
              const active = criteriaKey === crit.value;
              return (
                <button
                  key={crit.value}
                  onClick={() => handleCriteriaChange(crit.value)}
                  style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: '0.74rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
                    background: active ? '#2563eb' : '#fff',
                    color: active ? '#fff' : '#475569',
                    borderColor: active ? '#2563eb' : '#cbd5e1',
                    boxShadow: active ? '0 2px 4px rgba(37,99,235,0.2)' : 'none',
                  }}
                >
                  {crit.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Filter Dropdowns */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', paddingTop: 4 }}>
          {/* Report Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{currentCritLabel}:</span>
            <select
              value={staged.reportSel}
              onChange={e => setStaged(s => ({ ...s, reportSel: e.target.value }))}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.72rem', fontWeight: 600, color: '#334155', background: '#fff', cursor: 'pointer', maxWidth: 170 }}
            >
              {reportOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {/* Year */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Year:</span>
            <select
              value={staged.year}
              onChange={e => setStaged(s => ({ ...s, year: e.target.value }))}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.72rem', fontWeight: 600, color: '#334155', background: '#fff', cursor: 'pointer' }}
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Period */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Period:</span>
            <select
              value={staged.period}
              onChange={e => setStaged(s => ({ ...s, period: e.target.value }))}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.72rem', fontWeight: 600, color: '#334155', background: '#fff', cursor: 'pointer' }}
            >
              {periodOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <button
            onClick={handleApply}
            style={{
              padding: '4px 12px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none',
              fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Filter size={11} /> Apply
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '4px 10px', borderRadius: 6, background: '#fff', color: '#64748b', border: '1px solid #cbd5e1',
              fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <RefreshCw size={11} /> Reset
          </button>

          {/* Unit Toggle: AED / AED Millions */}
          <UnitToggle unit={unit} onToggle={setUnit} currency={currency} />

          <div style={{ flex: 1 }} />

          {/* Search box */}
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 8px 4px 26px',
                fontSize: '0.72rem', color: '#334155', width: 140, outline: 'none',
              }}
            />
          </div>

          {/* Export Buttons matching Sales Revenue View All */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => handleExport('excel')}
              disabled={!!exporting}
              title="Export to Excel"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                border: '1px solid #bbf7d0', borderRadius: 7, cursor: exporting ? 'not-allowed' : 'pointer',
                fontWeight: 700, transition: 'all 0.15s', outline: 'none',
                fontSize: '0.70rem', height: 28, padding: '0 10px',
                background: exporting === 'excel' ? '#d1fae5' : '#f0fdf4',
                color: '#15803d',
                opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting === 'excel' ? '⏳' : '📊'} Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={!!exporting}
              title="Export to PDF"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                border: '1px solid #fecdd3', borderRadius: 7, cursor: exporting ? 'not-allowed' : 'pointer',
                fontWeight: 700, transition: 'all 0.15s', outline: 'none',
                fontSize: '0.70rem', height: 28, padding: '0 10px',
                background: exporting === 'pdf' ? '#fee2e2' : '#fff1f2',
                color: '#be123c',
                opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting === 'pdf' ? '⏳' : '📄'} PDF
            </button>
          </div>
        </div>
      </div>

      {toast && <ExportToast message={toast.msg} type={toast.type} />}

      {/* ── Content Area: Graph + Table ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '12px 20px', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
            Showing {displayRows.length} {displayRows.length === 1 ? 'Entity' : 'Entities'} grouped by {currentCritLabel} for Period: {period} | Year: {year}
          </div>
        </div>

        {/* TABLE SECTION */}
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e3a8a' }}>
                Detailed Financials — Grouped by {currentCritLabel} ({unit === 'millions' ? `${currency} Millions` : currency})
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                {displayRows.length} {displayRows.length === 1 ? 'record' : 'records'}
              </div>
            </div>

            {loading ? (
              <Spinner />
            ) : error ? (
              <ErrorState message={error} />
            ) : displayRows.length === 0 ? (
              <EmptyState message="No records found for the selected grouping and filters." />
            ) : (
              <ScrollTable minWidth={1180}>
                <thead>
                  <tr>
                    <TH style={{ minWidth: 200 }}>
                      {currentCritLabel.includes(' ') ? (
                        <>
                          <span style={{ whiteSpace: 'nowrap' }}>{currentCritLabel.split(' ').slice(0, -1).join(' ')}</span>
                          <br />
                          <span style={{ whiteSpace: 'nowrap' }}>{currentCritLabel.split(' ').slice(-1)[0]}</span>
                        </>
                      ) : (
                        <span style={{ whiteSpace: 'nowrap' }}>{currentCritLabel}</span>
                      )}
                    </TH>
                    <TH align="right">Revenue</TH>
                    <TH align="right">
                      <span style={{ whiteSpace: 'nowrap' }}>Cost of</span>
                      <br />
                      <span style={{ whiteSpace: 'nowrap' }}>Material</span>
                    </TH>
                    <TH align="right">
                      <span style={{ whiteSpace: 'nowrap' }}>Direct</span>
                      <br />
                      <span style={{ whiteSpace: 'nowrap' }}>Labour</span>
                    </TH>
                    <TH align="right">
                      <span style={{ whiteSpace: 'nowrap' }}>Manufacturing</span>
                      <br />
                      <span style={{ whiteSpace: 'nowrap' }}>Expense</span>
                    </TH>
                    <TH align="right">
                      <span style={{ whiteSpace: 'nowrap' }}>Overhead</span>
                      <br />
                      <span style={{ whiteSpace: 'nowrap' }}>Absorption</span>
                    </TH>
                    <TH align="right">
                      <span style={{ whiteSpace: 'nowrap' }}>Gross</span>
                      <br />
                      <span style={{ whiteSpace: 'nowrap' }}>Profit</span>
                    </TH>
                    <TH align="right">GP %</TH>
                    <TH align="right">
                      <span style={{ whiteSpace: 'nowrap' }}>Operating</span>
                      <br />
                      <span style={{ whiteSpace: 'nowrap' }}>Expense</span>
                    </TH>
                    <TH align="right">Opex %</TH>
                    <TH align="right">
                      <span style={{ whiteSpace: 'nowrap' }}>Net Profit</span>
                      <br />
                      <span style={{ whiteSpace: 'nowrap' }}>Before Tax</span>
                    </TH>
                    <TH align="right">PBT %</TH>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((r, i) => (
                    <tr
                      key={r.name + i}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <TD bold style={{ color: '#0f172a' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <ChevronRight size={12} color="#94a3b8" />
                          {r.name}
                        </span>
                      </TD>
                      <TD align="right">{fmtAmount(r.revenue, unit)}</TD>
                      <TD align="right">{fmtAmount(r.cost_of_material, unit)}</TD>
                      <TD align="right">{fmtAmount(r.direct_labour, unit)}</TD>
                      <TD align="right">{fmtAmount(r.manufacturing_expense, unit)}</TD>
                      <TD align="right" color={r.overhead_absorption < 0 ? "#dc2626" : undefined}>{fmtAmount(r.overhead_absorption, unit)}</TD>
                      <TD align="right">{fmtAmount(r.gross_profit, unit)}</TD>
                      <TD align="right" color="#2563eb" bold>{fmtPct(r.gp_pct)}</TD>
                      <TD align="right">{fmtAmount(r.operating_expense, unit)}</TD>
                      <TD align="right" color="#2563eb" bold>{fmtPct(r.opex_pct)}</TD>
                      <TD align="right" color={r.pbt >= 0 ? '#10b981' : '#dc2626'} bold>{fmtAmount(r.pbt, unit)}</TD>
                      <TD align="right" color={r.pbt >= 0 ? '#10b981' : '#dc2626'} bold>{fmtPct(r.pbt_pct)}</TD>
                    </tr>
                  ))}
                </tbody>
                {displayRows.length > 0 && (
                  <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 15 }}>
                    <tr>
                      <TF bold style={{ color: '#1e40af' }}>Total ({displayRows.length})</TF>
                      <TF align="right" bold color="#1e40af">{fmtAmount(totals.revenue, unit)}</TF>
                      <TF align="right" bold color="#1e40af">{fmtAmount(totals.cost_of_material, unit)}</TF>
                      <TF align="right" bold color="#1e40af">{fmtAmount(totals.direct_labour, unit)}</TF>
                      <TF align="right" bold color="#1e40af">{fmtAmount(totals.manufacturing_expense, unit)}</TF>
                      <TF align="right" bold color={totals.overhead_absorption < 0 ? "#dc2626" : "#1e40af"}>{fmtAmount(totals.overhead_absorption, unit)}</TF>
                      <TF align="right" bold color="#1e40af">{fmtAmount(totals.gross_profit, unit)}</TF>
                      <TF align="right" bold color="#1e40af">{fmtPct(totalGpPct)}</TF>
                      <TF align="right" bold color="#1e40af">{fmtAmount(totals.operating_expense, unit)}</TF>
                      <TF align="right" bold color="#1e40af">{fmtPct(totalOpexPct)}</TF>
                      <TF align="right" bold color="#1e40af">{fmtAmount(totals.pbt, unit)}</TF>
                      <TF align="right" bold color="#1e40af">{fmtPct(totalPbtPct)}</TF>
                    </tr>
                  </tfoot>
                )}
              </ScrollTable>
            )}
          </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION CONFIG & MAIN MODAL
───────────────────────────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: 'profitability_glance', label: 'Profitability at a Glance',     icon: TrendingUp },
  { id: 'twc_viewall',          label: 'TWC – View All',                icon: Table },
  { id: 'twc_trend',            label: 'TWC – Month on Month Trend',    icon: TrendingUp },
  { id: 'rev_region',           label: 'Revenue by Region',             icon: Globe },
  { id: 'profit_region',        label: 'Profitability by Region',       icon: BarChart3 },
];

export default function ExecDashboardViewAll({
  isOpen,
  onClose,
  initialSection = 'profitability_glance',
  filters = {},
  currency = 'AED',
}) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (isOpen) setActiveSection(initialSection);
  }, [isOpen, initialSection]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeMeta = SECTIONS.find(s => s.id === activeSection);

  const handleExportExcel = (activeFilters) => {
    const apiFilters = activeFilters || {
      ...(filters.as_on_date ? { as_on_date: filters.as_on_date } : {}),
      ...(filters.legal_group_id ? { legal_group_id: filters.legal_group_id } : {}),
      ...(filters.legal_entity_id ? { legal_entity_id: filters.legal_entity_id } : {}),
      ...(filters.parent_division_id ? { parent_division_id: filters.parent_division_id } : {}),
      ...(filters.subdivision_id ? { subdivision_id: filters.subdivision_id } : {}),
    };
    return exportExecTwcExcel(apiFilters);
  };

  const handleExportPdf = (activeFilters) => {
    const apiFilters = activeFilters || {
      ...(filters.as_on_date ? { as_on_date: filters.as_on_date } : {}),
      ...(filters.legal_group_id ? { legal_group_id: filters.legal_group_id } : {}),
      ...(filters.legal_entity_id ? { legal_entity_id: filters.legal_entity_id } : {}),
      ...(filters.parent_division_id ? { parent_division_id: filters.parent_division_id } : {}),
      ...(filters.subdivision_id ? { subdivision_id: filters.subdivision_id } : {}),
    };
    return exportExecTwcPdf(apiFilters);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.35)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1300, animation: 'execVAFadeIn 0.2s ease',
    }}>
      <style>{`
        @keyframes execVAFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Backdrop overlay */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      {/* Modal Dialog Window */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: '#fff',
        borderRadius: isMaximized ? 0 : 16,
        width: isMaximized ? '100vw' : '98.5vw',
        maxWidth: isMaximized ? '100vw' : '98.5vw',
        height: isMaximized ? '100vh' : '95vh',
        maxHeight: isMaximized ? '100vh' : '95vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: isMaximized ? 'none' : '0 20px 60px rgba(0,0,0,0.18)',
        animation: 'scaleUp 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        overflow: 'hidden',
        border: isMaximized ? 'none' : '1px solid #e2e8f0',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '12px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(90deg, #f8fafc, #fff)',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#1e293b' }}>
              {activeMeta?.label || 'View All'}
            </h3>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2, fontWeight: 500 }}>
              Executive Dashboard · {currency} · {filters.as_on_date || 'All Periods'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setIsMaximized(m => !m)}
              title={isMaximized ? "Restore window size" : "Maximize to full screen"}
              style={{
                background: '#f1f5f9', border: 'none', borderRadius: 20, width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#64748b', transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
            >
              {isMaximized ? <Minimize2 size={14} strokeWidth={2.3} /> : <Maximize2 size={14} strokeWidth={2.3} />}
            </button>
            <button
              onClick={onClose}
              title="Close"
              style={{
                background: '#f1f5f9', border: 'none', borderRadius: 20, width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#64748b', transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{
          display: 'flex', gap: 16, padding: '12px 20px 0',
          borderBottom: '1px solid #e2e8f0', flexShrink: 0,
          overflowX: 'auto', background: '#fff',
        }}>
          {SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 4px 10px 4px', border: 'none', background: 'transparent',
                color: active ? '#5B3FE4' : '#64748b',
                fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer', whiteSpace: 'nowrap',
                borderBottom: active ? '2px solid #5B3FE4' : '2px solid transparent',
                transition: 'all 0.15s', marginBottom: -1,
              }}>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
          {activeSection === 'profitability_glance' && (
            <ProfitabilityGlanceSection filters={filters} currency={currency} />
          )}
          {activeSection === 'twc_viewall' && (
            <TwcViewAllTable
              filters={filters} currency={currency}
              onExportExcel={handleExportExcel}
              onExportPdf={handleExportPdf}
            />
          )}
          {activeSection === 'twc_trend' && (
            <TwcTrendTable
              filters={filters}
              currency={currency}
              onExportExcel={handleExportExcel}
              onExportPdf={handleExportPdf}
            />
          )}
          {activeSection === 'rev_region' && <RevenueByRegion filters={filters} currency={currency} />}
          {activeSection === 'profit_region' && <ProfitabilityByRegion filters={filters} currency={currency} />}
        </div>
      </div>
    </div>
  );
}
