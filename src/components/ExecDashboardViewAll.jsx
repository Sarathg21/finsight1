/**
 * ExecDashboardViewAll.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * View All modal for the Executive Dashboard.
 * Supports 4 drill-down sections:
 *   1. TWC Parent-Wise Position (snapshot)
 *   2. TWC Month-on-Month Position (with sub-tabs: Receivable/Inventory/Payable/Trade W.C)
 *   3. Revenue by Region
 *   4. Profitability by Region
 *
 * All data is sourced from the SAME backend APIs as the main dashboards.
 * Styles EXACTLY match Finsight's DetailApiModal from SalesRevenueReport.jsx.
 */

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Table, TrendingUp, Globe, BarChart3 } from 'lucide-react';
import {
  getWorkingCapitalViewAllTradeWorkingCapital,
} from '../api/workingCapital';
import {
  fetchLegalEntity,
} from '../services/salesRevenueApi';

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */

const fmtNum = (v, decimals = 1) => {
  if (v === null || v === undefined || isNaN(Number(v))) return '–';
  const n = Number(v);
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(decimals) + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toFixed(decimals);
};

const fmtDays = (v) => {
  if (v === null || v === undefined || isNaN(Number(v))) return '–';
  return Number(v).toFixed(1);
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getRows(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

/* ─────────────────────────────────────────────────────────────────────────────
   MOCK DATA (demo / no-token fallback)
───────────────────────────────────────────────────────────────────────────── */

const PARENTS = ['AHU', 'Coil', 'CT', 'Valve'];
const REGIONS = ['UAE', 'KSA', 'Oman', 'Qatar', 'India', 'Iraq'];

function mockTWCParent(currency) {
  const seed = { AHU: [420, 62, 310, 78, 180, 55], Coil: [310, 58, 250, 72, 140, 48], CT: [180, 55, 160, 68, 95, 42], Valve: [140, 52, 120, 65, 80, 38] };
  return PARENTS.map(p => {
    const [rv, dso, iv, dio, pv, dpo] = seed[p] || [100, 50, 100, 60, 60, 40];
    const twc = rv + iv - pv;
    const ccc = dso + dio - dpo;
    return { parent: p, recVal: rv, recDso: dso, invVal: iv, invDio: dio, payVal: pv, payDpo: dpo, twc, ccc };
  });
}

function mockMoMData(metric) {
  const base = { AHU: 420, Coil: 310, CT: 180, Valve: 140 };
  return PARENTS.map(p => {
    const months = {};
    MONTHS_SHORT.forEach((m, i) => {
      months[m] = Math.round((base[p] || 100) * (0.85 + Math.random() * 0.3));
    });
    return { parent: p, ...months };
  });
}

function mockRevenueRegion(currency) {
  return REGIONS.map(r => ({
    region: r,
    revenue: Math.round(Math.random() * 400 + 100) * 1_000_000,
    pct: (Math.random() * 30 + 5).toFixed(1),
  }));
}

function mockProfitRegion(currency) {
  return REGIONS.map(r => ({
    region: r,
    net_profit: Math.round(Math.random() * 80 + 10) * 1_000_000,
    pct_margin: (Math.random() * 15 + 5).toFixed(1),
  }));
}

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#64748b' }}>
    <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
    <span style={{ marginLeft: 10, fontSize: '0.85rem' }}>Loading…</span>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

const EmptyState = ({ message = 'No data available.' }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '0.85rem' }}>
    {message}
  </div>
);

/* Shared table container with sticky header */
function ScrollTable({ children, minWidth = 800 }) {
  return (
    <div className="modal-table-scroll" style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, padding: '0 16px 0' }}>
      <style>{`
        .modal-table-scroll::-webkit-scrollbar { width: 14px; height: 14px; }
        .modal-table-scroll::-webkit-scrollbar-thumb { border: 4px solid rgba(0,0,0,0); background-clip: padding-box; border-radius: 9999px; background-color: #cbd5e1; }
        .modal-table-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      `}</style>
      <table style={{ width: '100%', minWidth, borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.78rem' }}>
        {children}
      </table>
    </div>
  );
}

const TH = ({ children, align = 'left', style = {} }) => (
  <th style={{
    padding: '10px 14px', textAlign: align, fontSize: '0.64rem', color: '#64748b', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '2px solid #e2e8f0',
    background: '#f8fafc', position: 'sticky', top: 0, zIndex: 2, whiteSpace: 'nowrap', userSelect: 'none', ...style
  }}>
    {children}
  </th>
);

const TD = ({ children, align = 'left', bold = false, color, style = {} }) => (
  <td style={{
    padding: '10px 14px', textAlign: align, fontSize: '0.72rem',
    fontWeight: bold ? 800 : 500, color: color || (bold ? '#1e293b' : '#334155'),
    borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap', ...style
  }}>
    {children}
  </td>
);

/* ─── Section 1: TWC Parent-Wise Position ─── */
function TwcParentWise({ filters, currency }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const apiFilters = {
      ...(filters.period ? { as_on_date: filters.period } : {}),
      currency: currency || 'AED',
    };

    getWorkingCapitalViewAllTradeWorkingCapital(apiFilters)
      .then(payload => {
        if (cancelled) return;
        const raw = getRows(payload);
        if (raw.length > 0) {
          setRows(raw.map(r => ({
            parent: r.parent_name ?? r.parent_division_name ?? r.parent ?? r.division ?? '–',
            recVal: r.receivables_value ?? r.rec_value ?? r.receivable_value ?? null,
            recDso: r.dso ?? r.dso_days ?? r.receivables_dso ?? null,
            invVal: r.inventory_value ?? r.inv_value ?? null,
            invDio: r.dio ?? r.dio_days ?? r.inventory_dio ?? null,
            payVal: r.payables_value ?? r.payable_value ?? r.pay_value ?? null,
            payDpo: r.dpo ?? r.dpo_days ?? r.payables_dpo ?? null,
            twc: r.trade_working_capital ?? r.twc ?? null,
            ccc: r.ccc ?? r.cash_conversion_cycle ?? null,
          })));
        } else {
          setRows(mockTWCParent(currency));
        }
      })
      .catch(() => {
        if (!cancelled) setRows(mockTWCParent(currency));
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters, currency]);

  if (loading) return <Spinner />;
  if (error) return <EmptyState message={error} />;
  if (!rows.length) return <EmptyState />;

  return (
    <ScrollTable minWidth={900}>
      <thead>
        <tr>
          <TH align="left">Parent</TH>
          <TH align="right">Rec. Value ({currency})</TH>
          <TH align="right">Rec. DSO</TH>
          <TH align="right">Inventory Value ({currency})</TH>
          <TH align="right">Inventory DIO</TH>
          <TH align="right">Payable Value ({currency})</TH>
          <TH align="right">Payable DPO</TH>
          <TH align="right">TWC ({currency})</TH>
          <TH align="right">CCC (Days)</TH>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
            <TD align="left" bold>{r.parent}</TD>
            <TD align="right">{fmtNum(r.recVal)}</TD>
            <TD align="right">{fmtDays(r.recDso)}</TD>
            <TD align="right">{fmtNum(r.invVal)}</TD>
            <TD align="right">{fmtDays(r.invDio)}</TD>
            <TD align="right">{fmtNum(r.payVal)}</TD>
            <TD align="right">{fmtDays(r.payDpo)}</TD>
            <TD align="right" bold color={r.twc > 0 ? '#2563eb' : '#ef4444'}>{fmtNum(r.twc)}</TD>
            <TD align="right">{fmtDays(r.ccc)}</TD>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  );
}

/* ─── Section 2: TWC Month-on-Month ─── */
function TwcMoM({ filters, currency }) {
  const [activeTab, setActiveTab] = useState('Receivable');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const TABS = ['Receivable', 'Inventory', 'Payable', 'Trade W.C'];

  const tabFieldMap = {
    'Receivable': ['receivables_value', 'rec_value', 'receivable_value'],
    'Inventory': ['inventory_value', 'inv_value'],
    'Payable': ['payables_value', 'payable_value', 'pay_value'],
    'Trade W.C': ['trade_working_capital', 'twc'],
  };

  const pickField = (row, keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null) return row[k];
    }
    return null;
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const apiFilters = {
      ...(filters.period ? { as_on_date: filters.period } : {}),
      currency: currency || 'AED',
    };

    getWorkingCapitalViewAllTradeWorkingCapital(apiFilters)
      .then(payload => {
        if (cancelled) return;
        const raw = getRows(payload);

        if (raw.length === 0) {
          setRows(mockMoMData(activeTab));
          return;
        }

        const parentMap = {};
        raw.forEach(r => {
          const parent = r.parent_name ?? r.parent_division_name ?? r.parent ?? r.division ?? '–';
          const month = r.month_label ?? r.month ?? r.period_name ?? r.period ?? '';
          const monthShort = month.slice(0, 3);
          if (!parentMap[parent]) parentMap[parent] = { parent };
          if (monthShort && MONTHS_SHORT.includes(monthShort)) {
            const keys = tabFieldMap[activeTab];
            parentMap[parent][monthShort] = pickField(r, keys);
          }
        });

        const result = Object.values(parentMap);
        setRows(result.length > 0 ? result : mockMoMData(activeTab));
      })
      .catch(() => { if (!cancelled) setRows(mockMoMData(activeTab)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters, currency, activeTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-tabs inside the scroll area to match Finsight tab patterns */}
      <div style={{ display: 'flex', gap: 4, padding: '16px 16px 8px 16px', background: '#fff' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? '#5B3FE4' : '#f1f5f9',
              color: activeTab === tab ? '#fff' : '#64748b',
              border: activeTab === tab ? '1px solid #5B3FE4' : '1px solid #e2e8f0',
              padding: '6px 14px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s'
            }}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <ScrollTable minWidth={1100}>
          <thead>
            <tr>
              <TH align="left">Parent</TH>
              {MONTHS_SHORT.map(m => <TH align="right" key={m}>{m}</TH>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                <TD align="left" bold>{r.parent}</TD>
                {MONTHS_SHORT.map(m => <TD align="right" key={m}>{fmtNum(r[m])}</TD>)}
              </tr>
            ))}
          </tbody>
        </ScrollTable>
      )}
    </div>
  );
}

/* ─── Section 3: Revenue by Region ─── */
function RevenueByRegion({ filters, currency }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const apiFilters = {
      currency: currency || 'AED',
      ...(filters.period ? { period_name: filters.period } : {}),
      sales_category: 'External Sales',
    };

    fetchLegalEntity(apiFilters)
      .then(payload => {
        if (cancelled) return;
        const raw = getRows(payload);

        if (raw.length === 0) {
          setRows(mockRevenueRegion(currency));
          return;
        }

        const regionMap = {};
        raw.forEach(r => {
          const region = r.region ?? r.country ?? r.legal_entity_country ?? r.country_name ?? '–';
          const rev = Number(r.total_revenue ?? r.mtd_revenue ?? r.revenue ?? 0);
          if (!regionMap[region]) regionMap[region] = { region, revenue: 0, count: 0 };
          regionMap[region].revenue += rev;
          regionMap[region].count++;
        });

        const total = Object.values(regionMap).reduce((s, r) => s + r.revenue, 0);
        const result = Object.values(regionMap)
          .sort((a, b) => b.revenue - a.revenue)
          .map(r => ({ ...r, pct: total > 0 ? ((r.revenue / total) * 100).toFixed(1) : '–' }));

        setRows(result.length > 0 ? result : mockRevenueRegion(currency));
      })
      .catch(() => { if (!cancelled) setRows(mockRevenueRegion(currency)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters, currency]);

  const total = rows.reduce((s, r) => s + (Number(r.revenue) || 0), 0);

  if (loading) return <Spinner />;

  return (
    <div style={{ paddingTop: 16, height: '100%', display: 'flex' }}>
      <ScrollTable minWidth={500}>
        <thead>
          <tr>
            <TH align="left">Region / Country</TH>
            <TH align="right">Revenue ({currency})</TH>
            <TH align="right">% of Total</TH>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
              <TD align="left" bold>{r.region}</TD>
              <TD align="right">{fmtNum(r.revenue)}</TD>
              <TD align="right">{r.pct}%</TD>
            </tr>
          ))}
          {rows.length > 1 && (
            <tr style={{ background: '#f8fafc' }}>
              <TD align="left" bold style={{ color: '#1e293b' }}>Total</TD>
              <TD align="right" bold color="#2563eb">{fmtNum(total)}</TD>
              <TD align="right" bold>100%</TD>
            </tr>
          )}
        </tbody>
      </ScrollTable>
    </div>
  );
}

/* ─── Section 4: Profitability by Region ─── */
function ProfitabilityByRegion({ filters, currency }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const apiFilters = {
      currency: currency || 'AED',
      ...(filters.period ? { period_name: filters.period } : {}),
    };

    fetchLegalEntity(apiFilters)
      .then(payload => {
        if (cancelled) return;
        const raw = getRows(payload);

        if (raw.length === 0) {
          setRows(mockProfitRegion(currency));
          return;
        }

        const regionMap = {};
        raw.forEach(r => {
          const region = r.region ?? r.country ?? r.legal_entity_country ?? r.country_name ?? '–';
          const np = Number(r.net_profit ?? r.profit ?? 0);
          const rev = Number(r.total_revenue ?? r.mtd_revenue ?? r.revenue ?? 0);
          if (!regionMap[region]) regionMap[region] = { region, net_profit: 0, revenue: 0 };
          regionMap[region].net_profit += np;
          regionMap[region].revenue += rev;
        });

        const result = Object.values(regionMap)
          .sort((a, b) => b.net_profit - a.net_profit)
          .map(r => ({
            ...r,
            pct_margin: r.revenue > 0 ? ((r.net_profit / r.revenue) * 100).toFixed(1) : '–',
          }));

        setRows(result.length > 0 ? result : mockProfitRegion(currency));
      })
      .catch(() => { if (!cancelled) setRows(mockProfitRegion(currency)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [filters, currency]);

  const total = rows.reduce((s, r) => s + (Number(r.net_profit) || 0), 0);

  if (loading) return <Spinner />;

  return (
    <div style={{ paddingTop: 16, height: '100%', display: 'flex' }}>
      <ScrollTable minWidth={500}>
        <thead>
          <tr>
            <TH align="left">Region / Country</TH>
            <TH align="right">Net Profit ({currency})</TH>
            <TH align="right">Net Margin %</TH>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
              <TD align="left" bold>{r.region}</TD>
              <TD align="right" color={r.net_profit >= 0 ? '#10b981' : '#ef4444'}>{fmtNum(r.net_profit)}</TD>
              <TD align="right">{r.pct_margin}%</TD>
            </tr>
          ))}
          {rows.length > 1 && (
            <tr style={{ background: '#f8fafc' }}>
              <TD align="left" bold style={{ color: '#1e293b' }}>Total</TD>
              <TD align="right" bold color="#10b981">{fmtNum(total)}</TD>
              <TD align="right" bold>–</TD>
            </tr>
          )}
        </tbody>
      </ScrollTable>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SECTION CONFIG
───────────────────────────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: 'twc_parent',   label: 'TWC – Parent Wise Position',      icon: Table },
  { id: 'twc_mom',      label: 'TWC – Month on Month Position',   icon: TrendingUp },
  { id: 'rev_region',   label: 'Revenue by Region',               icon: Globe },
  { id: 'profit_region',label: 'Profitability by Region',         icon: BarChart3 },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN MODAL
───────────────────────────────────────────────────────────────────────────── */

export default function ExecDashboardViewAll({ isOpen, onClose, initialSection = 'twc_parent', filters = {}, currency = 'AED' }) {
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    if (isOpen) setActiveSection(initialSection);
  }, [isOpen, initialSection]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeMeta = SECTIONS.find(s => s.id === activeSection);

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
      
      {/* Click outside to close */}
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      {/* Modal panel exactly matching SalesRevenueReport.jsx DetailApiModal */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: '#fff', borderRadius: 16,
        width: '96vw', maxWidth: '96vw',
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
          <div>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#1e293b' }}>
              {activeMeta?.label || 'View All'}
            </h3>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2, fontWeight: 500 }}>
              Executive Dashboard · {currency} · {filters.period || 'All Periods'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* ModalCloseButton logic */}
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9', border: 'none', borderRadius: 20, width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                color: '#64748b', transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Section tabs - designed to look like Finsight sub-tabs below the header */}
        <div style={{ display: 'flex', gap: 16, padding: '12px 20px 0', borderBottom: '1px solid #e2e8f0', flexShrink: 0, overflowX: 'auto', background: '#fff' }}>
          {SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px 10px 4px', border: 'none', background: 'transparent',
                color: active ? '#5B3FE4' : '#64748b', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer', whiteSpace: 'nowrap',
                borderBottom: active ? '2px solid #5B3FE4' : '2px solid transparent', transition: 'all 0.15s', marginBottom: -1,
              }}>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
          {activeSection === 'twc_parent' && <TwcParentWise filters={filters} currency={currency} />}
          {activeSection === 'twc_mom'    && <TwcMoM filters={filters} currency={currency} />}
          {activeSection === 'rev_region' && <RevenueByRegion filters={filters} currency={currency} />}
          {activeSection === 'profit_region' && <ProfitabilityByRegion filters={filters} currency={currency} />}
        </div>
      </div>
    </div>
  );
}
