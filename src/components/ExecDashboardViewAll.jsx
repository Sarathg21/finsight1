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

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Table, TrendingUp, Globe, BarChart3, FileText, Download } from 'lucide-react';
import {
  getExecTwcViewAll,
  getExecTwcTrend,
  getExecRevenueByRegion,
  getExecProfitabilityByRegion,
  exportExecTwcExcel,
  exportExecTwcPdf,
} from '../api/executiveDashboardApi';

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

function ScrollTable({ children, minWidth = 1100 }) {
  return (
    <div className="exec-modal-scroll" style={{
      overflowX: 'auto', overflowY: 'auto', flex: 1,
      height: '100%', maxHeight: 'calc(94vh - 140px)', padding: '0 16px 16px'
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
          {rows.length > 1 && (
            <tr style={{ background: '#f8fafc' }}>
              <TD bold style={{ color: '#1e293b' }}>Total</TD>
              <TD align="right" bold color="#2563eb">{fmtNum(total)}</TD>
              <TD align="right" bold>100.0%</TD>
            </tr>
          )}
        </tbody>
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
          {rows.length > 1 && (
            <tr style={{ background: '#f8fafc' }}>
              <TD bold style={{ color: '#1e293b' }}>Total</TD>
              <TD align="right" bold color="#2563eb">{fmtNum(rows.reduce((s, r) => s + (Number(r.gross_profit ?? 0)), 0))}</TD>
              <TD align="right" bold color="#2563eb">{fmtNum(rows.reduce((s, r) => s + (Number(r.ebitda ?? 0)), 0))}</TD>
              <TD align="right" bold color="#10b981">{fmtNum(totalNp)}</TD>
              <TD align="right" bold>–</TD>
            </tr>
          )}
        </tbody>
      </ScrollTable>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION CONFIG & MAIN MODAL
───────────────────────────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: 'twc_viewall',    label: 'TWC – View All',                icon: Table },
  { id: 'twc_trend',      label: 'TWC – Month on Month Trend',    icon: TrendingUp },
  { id: 'rev_region',     label: 'Revenue by Region',             icon: Globe },
  { id: 'profit_region',  label: 'Profitability by Region',       icon: BarChart3 },
];

export default function ExecDashboardViewAll({
  isOpen,
  onClose,
  initialSection = 'twc_viewall',
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
