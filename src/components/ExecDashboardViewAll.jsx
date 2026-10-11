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
import { X, RefreshCw, Table, TrendingUp, Globe, BarChart3, FileText, Download, Filter, Search, ChevronRight, ChevronDown, MoreHorizontal, Info } from 'lucide-react';
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
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  return `${Number(v).toFixed(1)}%`;
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
      height: '100%', maxHeight: 'calc(94vh - 140px)', padding, ...style
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
    wordBreak: 'normal', lineHeight: '1.25', userSelect: 'none', ...style
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
   SECTION 1: TWC View All Table
───────────────────────────────────────────────────────────────────────────── */

function TwcViewAllTable({ filters, currency, onExportExcel, onExportPdf }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getExecTwcViewAll(filters)
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
  }, [filters]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Export Action Bar */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px 8px', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
        <button onClick={onExportExcel}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', cursor: 'pointer' }}>
          <FileText size={13} /> Export Excel
        </button>
        <button onClick={onExportPdf}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer' }}>
          <Download size={13} /> Export PDF
        </button>
      </div>

      <ScrollTable minWidth={1150}>
        <thead>
          <tr>
            <TH style={{ width: 190, minWidth: 170, maxWidth: 210 }}>Legal Entity</TH>
            <TH style={{ width: 140, minWidth: 120 }}>Parent Division</TH>
            <TH style={{ width: 140, minWidth: 120 }}>Sub-Division</TH>
            <TH align="right">Trade Receivables ({currency})</TH>
            <TH align="right">DSO</TH>
            <TH align="right">Trade Payables ({currency})</TH>
            <TH align="right">DPO</TH>
            <TH align="right">Inventory ({currency})</TH>
            <TH align="right">DIO</TH>
            <TH align="right">TWC ({currency})</TH>
            <TH align="right">CCC (Days)</TH>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
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
                <TD align="right">{fmtNum(tpVal)}</TD>
                <TD align="right">{fmtDays(dpoVal)}</TD>
                <TD align="right">{fmtNum(invVal)}</TD>
                <TD align="right">{fmtDays(dioVal)}</TD>
                <TD align="right" bold color={twcVal !== null && twcVal !== undefined && Number(twcVal) >= 0 ? '#2563eb' : '#ef4444'}>
                  {fmtNum(twcVal)}
                </TD>
                <TD align="right">{fmtDays(cccVal)}</TD>
              </tr>
            );
          })}
        </tbody>
      </ScrollTable>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 2: TWC Trend (Month-on-Month)
───────────────────────────────────────────────────────────────────────────── */

function TwcTrendTable({ filters, currency }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getExecTwcTrend(filters)
      .then(payload => {
        if (cancelled) return;
        setRows(getRows(payload));
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[TWC Trend]', err.response?.status, err.response?.data || err.message);
        setError(`Failed to load (${err.response?.status ?? 'Network error'}).`);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState />;

  return (
    <ScrollTable minWidth={1050}>
      <thead>
        <tr>
          <TH style={{ width: 110 }}>Period</TH>
          <TH align="right">Trade Receivables ({currency})</TH>
          <TH align="right">Trade Payables ({currency})</TH>
          <TH align="right">Inventory ({currency})</TH>
          <TH align="right">TWC ({currency})</TH>
          <TH align="right">DSO (Days)</TH>
          <TH align="right">DPO (Days)</TH>
          <TH align="right">DIO (Days)</TH>
          <TH align="right">CCC (Days)</TH>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          // Include total_receivables, total_payables, total_inventory from backend trend payload
          const trVal  = r.trade_receivables ?? r.total_receivables ?? r.receivables ?? r.tr;
          const tpVal  = r.trade_payables ?? r.total_payables ?? r.payables ?? r.tp;
          const invVal = r.inventory ?? r.total_inventory ?? r.inventories ?? r.inv;
          const twcVal = r.trade_working_capital ?? r.twc;
          const dsoVal = r.dso_days ?? r.dso;
          const dpoVal = r.dpo_days ?? r.dpo;
          const dioVal = r.dio_days ?? r.dio;
          const cccVal = r.cash_conversion_cycle_days ?? r.ccc;

          const periodRaw = r.month_label ?? r.month ?? r.period_name ?? r.period;

          return (
            <tr key={i}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <TD bold style={{ width: 110 }}>{fmtPeriod(periodRaw)}</TD>
              <TD align="right">{fmtNum(trVal)}</TD>
              <TD align="right">{fmtNum(tpVal)}</TD>
              <TD align="right">{fmtNum(invVal)}</TD>
              <TD align="right" bold color={twcVal !== null && twcVal !== undefined && Number(twcVal) >= 0 ? '#2563eb' : '#ef4444'}>
                {fmtNum(twcVal)}
              </TD>
              <TD align="right">{fmtDays(dsoVal)}</TD>
              <TD align="right">{fmtDays(dpoVal)}</TD>
              <TD align="right">{fmtDays(dioVal)}</TD>
              <TD align="right">{fmtDays(cccVal)}</TD>
            </tr>
          );
        })}
      </tbody>
    </ScrollTable>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 3: Revenue by Region
───────────────────────────────────────────────────────────────────────────── */

function RevenueByRegion({ filters, currency }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getExecRevenueByRegion(filters)
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
  }, [filters, currency]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState />;

  const total = rows.reduce((s, r) => s + (Number(r.revenue ?? r.total_revenue ?? 0)), 0);

  return (
    <div style={{ paddingTop: 12, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScrollTable minWidth={650}>
        <thead>
          <tr>
            <TH>Region / Country</TH>
            <TH align="right">Revenue ({currency})</TH>
            <TH align="right">% of Total</TH>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const rev = r.revenue ?? r.total_revenue ?? null;
            const pct = r.revenue_pct ?? r.percentage ?? (rev !== null && total > 0 ? ((Number(rev) / total) * 100) : null);
            return (
              <tr key={i}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <TD bold>{r.region ?? r.country ?? r.country_name ?? '–'}</TD>
                <TD align="right">{fmtNum(rev)}</TD>
                <TD align="right">{pct !== null ? `${Number(pct).toFixed(1)}%` : '–'}</TD>
              </tr>
            );
          })}
        </tbody>
        {rows.length > 1 && (
          <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 15 }}>
            <tr>
              <TF bold style={{ color: '#1e293b' }}>Total</TF>
              <TF align="right" bold color="#2563eb">{fmtNum(total)}</TF>
              <TF align="right" bold>100.0%</TF>
            </tr>
          </tfoot>
        )}
      </ScrollTable>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION 4: Profitability by Region
───────────────────────────────────────────────────────────────────────────── */

function ProfitabilityByRegion({ filters, currency }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getExecProfitabilityByRegion(filters)
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
  }, [filters, currency]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState />;

  const totalNp = rows.reduce((s, r) => s + (Number(r.net_profit ?? 0)), 0);

  return (
    <div style={{ paddingTop: 12, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ScrollTable minWidth={750}>
        <thead>
          <tr>
            <TH>Region / Country</TH>
            <TH align="right">Gross Profit ({currency})</TH>
            <TH align="right">EBITDA ({currency})</TH>
            <TH align="right">Net Profit ({currency})</TH>
            <TH align="right">Net Margin %</TH>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const netMargin = r.net_margin_pct ?? r.net_margin ?? null;
            return (
              <tr key={i}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <TD bold>{r.region ?? r.country ?? r.country_name ?? '–'}</TD>
                <TD align="right">{fmtNum(r.gross_profit)}</TD>
                <TD align="right">{fmtNum(r.ebitda)}</TD>
                <TD align="right" color={r.net_profit === null ? undefined : (Number(r.net_profit) >= 0 ? '#10b981' : '#ef4444')}>
                  {fmtNum(r.net_profit)}
                </TD>
                <TD align="right">{netMargin !== null ? `${Number(netMargin).toFixed(1)}%` : '–'}</TD>
              </tr>
            );
          })}
        </tbody>
        {rows.length > 1 && (
          <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 15 }}>
            <tr>
              <TF bold style={{ color: '#1e293b' }}>Total</TF>
              <TF align="right" bold color="#2563eb">{fmtNum(rows.reduce((s, r) => s + (Number(r.gross_profit ?? 0)), 0))}</TF>
              <TF align="right" bold color="#2563eb">{fmtNum(rows.reduce((s, r) => s + (Number(r.ebitda ?? 0)), 0))}</TF>
              <TF align="right" bold color="#10b981">{fmtNum(totalNp)}</TF>
              <TF align="right" bold>–</TF>
            </tr>
          </tfoot>
        )}
      </ScrollTable>
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
  if (!stmt) return { revenue: 0, cost_of_material: 0, manufacturing_expense: 0, gross_profit: 0, operating_expense: 0, pbt: 0, net_profit: 0 };

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

  const comRow = findRow(p => p === 'cost of material' || p === 'cost of materials' || p.includes('cost of material'));
  const cost_of_material = getNum(comRow);

  const mfgRow = findRow(p => p === 'total direct expenses' || p.includes('manufacturing') || p.includes('direct overhead') || p === 'direct expenses rkme');
  const manufacturing_expense = getNum(mfgRow);

  let gpRow = findRow(p => p === 'gross profit' || p === 'gross margin');
  let gross_profit = getNum(gpRow);
  if (gross_profit === 0 && revenue > 0 && cost_of_material > 0) {
    gross_profit = revenue - cost_of_material - manufacturing_expense;
  }

  const opexRow = findRow(p => p === 'total operating expenses' || p === 'total expenses' || p === 'operating expenses' || p.includes('total operating expense'));
  const operating_expense = getNum(opexRow);

  let pbtRow = findRow(p => p === 'pbt' || p === 'profit before tax' || p.includes('profit before tax') || p === 'profit / (loss) before tax');
  let pbt = getNum(pbtRow);
  if (pbt === 0 && gross_profit !== 0) {
    pbt = gross_profit - operating_expense;
  }

  const npRow = findRow(p => p === 'net profit' || p === 'net profit / (loss)' || p.includes('net profit'));
  const net_profit = getNum(npRow) || pbt;

  return {
    revenue,
    cost_of_material,
    manufacturing_expense,
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
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const renderCustomXAxisTick = (props) => {
  const { x, y, payload } = props;
  const raw = String(payload?.value || '');

  let line1 = raw;
  let line2 = '';
  if (raw.length > 15) {
    const words = raw.split(' ');
    if (words.length > 1) {
      const mid = Math.ceil(words.length / 2);
      line1 = words.slice(0, mid).join(' ');
      line2 = words.slice(mid).join(' ');
    }
  }

  if (line1.length > 22) line1 = line1.slice(0, 20) + '…';
  if (line2.length > 22) line2 = line2.slice(0, 20) + '…';

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fill="#475569"
        fontSize={10}
        fontWeight={600}
      >
        <tspan x={0} dy={12}>{line1}</tspan>
        {line2 ? <tspan x={0} dy={13}>{line2}</tspan> : null}
      </text>
    </g>
  );
};

function ProfitabilityGlanceSection({ filters = {}, currency = 'AED' }) {
  const [criteriaKey, setCriteriaKey] = useState('parent_division');
  const [reportSel, setReportSel]     = useState('All');
  const [year, setYear]               = useState('2026');
  const [period, setPeriod]           = useState('Jan-26');
  const [unit, setUnit]               = useState('aed'); // 'aed' | 'millions'
  const [filterOptions, setFilterOptions] = useState({});
  const [search, setSearch]           = useState('');
  const [viewMode, setViewMode]       = useState('both'); // 'table' | 'graph' | 'both'

  const [staged, setStaged] = useState({
    criteriaKey: 'parent_division',
    reportSel: 'All',
    year: '2026',
    period: 'Jan-26',
  });

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch filter options from backend and trigger initial load
  useEffect(() => {
    let cancelled = false;
    fetchPLFilters()
      .then(res => {
        if (cancelled || !res) return;
        setFilterOptions(res);
        const initYear = res.years?.[0] ? String(res.years[0]) : '2026';
        const initPeriod = res.periods?.[0] || 'Jan-26';
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
              manufacturing_expense: m.manufacturing_expense,
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
              manufacturing_expense: 0,
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
    const defPeriod = filterOptions.periods?.[0] || 'Jan-26';
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
    manufacturing_expense: acc.manufacturing_expense + (r.manufacturing_expense || 0),
    gross_profit:          acc.gross_profit          + (r.gross_profit || 0),
    operating_expense:     acc.operating_expense     + (r.operating_expense || 0),
    pbt:                   acc.pbt                   + (r.pbt || 0),
  }), { revenue: 0, cost_of_material: 0, manufacturing_expense: 0, gross_profit: 0, operating_expense: 0, pbt: 0 }),
  [displayRows]);

  const totalGpPct   = totals.revenue ? (totals.gross_profit     / totals.revenue) * 100 : 0;
  const totalOpexPct = totals.revenue ? (totals.operating_expense / totals.revenue) * 100 : 0;
  const totalPbtPct  = totals.revenue ? (totals.pbt              / totals.revenue) * 100 : 0;

  const currentCritLabel = PROFIT_SELECTION_CRITERIA.find(c => c.value === criteriaKey)?.label?.replace(' wise', '') || 'Parent Division';

  const chartData = useMemo(() => {
    return displayRows.slice(0, 10).map(r => ({
      name: r.name,
      revenue: Math.round(r.revenue / 1_000_000),
      grossProfit: Math.round(r.gross_profit / 1_000_000),
      pbt: Math.round(r.pbt / 1_000_000),
      gpPct: Number(r.gp_pct.toFixed(1)),
    }));
  }, [displayRows]);

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

          {/* View Mode Toggle: Graph / Table / Both */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
            <button
              onClick={() => setViewMode('both')}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                background: viewMode === 'both' ? '#2563eb' : 'transparent',
                color: viewMode === 'both' ? '#fff' : '#64748b',
              }}
            >
              Both
            </button>
            <button
              onClick={() => setViewMode('graph')}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                background: viewMode === 'graph' ? '#2563eb' : 'transparent',
                color: viewMode === 'graph' ? '#fff' : '#64748b',
              }}
            >
              Graph
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                background: viewMode === 'table' ? '#2563eb' : 'transparent',
                color: viewMode === 'table' ? '#fff' : '#64748b',
              }}
            >
              Table
            </button>
          </div>
        </div>

        {/* Detailed Filter Dropdowns */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', paddingTop: 4 }}>
          {/* Report Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Item:</span>
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

          {/* Export Dropdown */}
          <div ref={exportRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setExportOpen(v => !v)}
              style={{
                padding: '4px 10px', borderRadius: 6, background: '#fff', color: '#334155', border: '1px solid #cbd5e1',
                fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Download size={11} /> Export <ChevronDown size={10} />
            </button>
            {exportOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', border: '1px solid #e2e8f0',
                borderRadius: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.12)', minWidth: 140, zIndex: 100, overflow: 'hidden',
              }}>
                <button
                  onClick={() => {
                    setExportOpen(false);
                    exportPL('statement', 'excel', { year, periodName: period, currency });
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 12px', background: 'none', border: 'none', fontSize: '0.74rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <FileText size={12} color="#16a34a" /> Export Excel
                </button>
                <button
                  onClick={() => {
                    setExportOpen(false);
                    exportPL('statement', 'pdf', { year, periodName: period, currency });
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 12px', background: 'none', border: 'none', fontSize: '0.74rem', fontWeight: 600, color: '#334155', cursor: 'pointer', borderTop: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Download size={12} color="#dc2626" /> Export PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content Area: Graph + Table ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '12px 20px', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
            Showing {displayRows.length} {displayRows.length === 1 ? 'Entity' : 'Entities'} grouped by {currentCritLabel} for Period: {period} | Year: {year}
          </div>
        </div>

        {/* GRAPH SECTION (if viewMode !== 'table') */}
        {viewMode !== 'table' && (
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e3a8a' }}>
                Profitability Overview by {currentCritLabel} ({currency} Million)
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>Top {Math.min(displayRows.length, 10)} entities</div>
            </div>
            {loading ? (
              <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading chart…</div>
            ) : chartData.length === 0 ? (
              <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 22, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tick={renderCustomXAxisTick}
                    interval={0}
                    height={44}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9.5, fill: '#94a3b8' }} />
                  <Tooltip
                    formatter={(val, name) => [`${currency} ${val}M`, name]}
                    contentStyle={{ fontSize: '0.72rem', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Legend verticalAlign="top" align="right" height={30} wrapperStyle={{ fontSize: 10.5, fontWeight: 600, paddingBottom: 6 }} iconSize={8} />
                  <Bar name="Revenue (M)" dataKey="revenue" fill="#3b82f6" barSize={18} radius={[3,3,0,0]} />
                  <Bar name="Gross Profit (M)" dataKey="grossProfit" fill="#10b981" barSize={18} radius={[3,3,0,0]} />
                  <Bar name="PBT (M)" dataKey="pbt" fill="#8b5cf6" barSize={18} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* TABLE SECTION (if viewMode !== 'graph') */}
        {viewMode !== 'graph' && (
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 280, overflow: 'hidden' }}>
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
              <ScrollTable minWidth={950}>
                <thead>
                  <tr>
                    <TH style={{ minWidth: 200 }}>{currentCritLabel}</TH>
                    <TH align="right">Revenue</TH>
                    <TH align="right">Cost of Material</TH>
                    <TH align="right">Manufacturing Expense</TH>
                    <TH align="right">Gross Profit</TH>
                    <TH align="right">GP %</TH>
                    <TH align="right">Operating Expense</TH>
                    <TH align="right">Opex %</TH>
                    <TH align="right">Net Profit Before Tax</TH>
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
                      <TD align="right">{fmtAmount(r.manufacturing_expense, unit)}</TD>
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
                      <TF align="right" bold color="#1e40af">{fmtAmount(totals.manufacturing_expense, unit)}</TF>
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
        )}
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

  const handleExportExcel = () => {
    const apiFilters = {
      ...(filters.as_on_date ? { as_on_date: filters.as_on_date } : {}),
      ...(filters.legal_group_id ? { legal_group_id: filters.legal_group_id } : {}),
      ...(filters.legal_entity_id ? { legal_entity_id: filters.legal_entity_id } : {}),
      ...(filters.parent_division_id ? { parent_division_id: filters.parent_division_id } : {}),
      ...(filters.subdivision_id ? { subdivision_id: filters.subdivision_id } : {}),
    };
    exportExecTwcExcel(apiFilters).catch(err =>
      console.error('[Export Excel]', err.response?.status, err.response?.data || err.message)
    );
  };

  const handleExportPdf = () => {
    const apiFilters = {
      ...(filters.as_on_date ? { as_on_date: filters.as_on_date } : {}),
      ...(filters.legal_group_id ? { legal_group_id: filters.legal_group_id } : {}),
      ...(filters.legal_entity_id ? { legal_entity_id: filters.legal_entity_id } : {}),
      ...(filters.parent_division_id ? { parent_division_id: filters.parent_division_id } : {}),
      ...(filters.subdivision_id ? { subdivision_id: filters.subdivision_id } : {}),
    };
    exportExecTwcPdf(apiFilters).catch(err =>
      console.error('[Export PDF]', err.response?.status, err.response?.data || err.message)
    );
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
        background: '#fff', borderRadius: 16,
        width: '96vw', maxWidth: '96vw',
        height: '92vh', maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        animation: 'scaleUp 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        overflow: 'hidden', border: '1px solid #e2e8f0',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
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
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: 20, width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={15} strokeWidth={2.5} />
          </button>
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
          {activeSection === 'twc_trend' && <TwcTrendTable filters={filters} currency={currency} />}
          {activeSection === 'rev_region' && <RevenueByRegion filters={filters} currency={currency} />}
          {activeSection === 'profit_region' && <ProfitabilityByRegion filters={filters} currency={currency} />}
        </div>
      </div>
    </div>
  );
}
