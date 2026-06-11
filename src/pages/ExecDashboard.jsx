import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { MONTHLY_PL, KPI_SUMMARY, AR_AGING, WORKING_CAPITAL_TREND } from '../data/masterData';
import { useFilters } from '../context/FilterContext';
import FilterBar from '../components/FilterBar';
import { C, TOOLTIP_STYLE } from '../utils/theme';
import {
  DollarSign, TrendingUp, AlertTriangle, Package,
  Calendar, Globe,
} from 'lucide-react';

/* ── AR Aging data ─────────────────────────────────────────── */
const AR_BUCKETS = [
  { label: '1-30d',   value: 97.3  },
  { label: '31-60d',  value: 111.1 },
  { label: '61-90d',  value: 52.6  },
  { label: '91-180d', value: 130.2 },
  { label: '>180d',   value: 349.2 },
];

const WC_INDICATORS = [
  { label: 'DSO', value: 112, max: 150, color: C.rose    },
  { label: 'DIO', value: 45,  max: 100, color: C.primary },
  { label: 'DPO', value: 42,  max: 100, color: C.emerald },
];

const ALERTS = [
  'AED 349.2M (47.2%) receivables overdue > 180 days — immediate follow-up required',
  'DSO at 112 days — significantly above 45-day benchmark across all entities',
  'Slow-moving inventory: AED 12.8M (10.3%) aged beyond 1 year',
  'Top-5 aging bucket (120+) represents 43.1% of total AR portfolio',
];

const COLLECTED = 91;

export default function ExecDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { filters, meta } = useFilters();
  const { activeMonthIndices, currency } = filters;
  const { activeMonthLabel, comparisonLabel } = meta;

  const plData = useMemo(() =>
    (MONTHLY_PL || []).filter((_, i) => activeMonthIndices.includes(i)),
  [activeMonthIndices]);

  const fxRate = { AED: 3.67, SAR: 3.75, QAR: 3.64, OMR: 0.39, INR: 83.1, USD: 1 };
  const rate = fxRate[currency] || 1;
  const fmtM = v => `${currency} ${(v * rate).toFixed(1)}M`;

  return (
    <div className="animate-in">
      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <Badge label="Live Data"            color={C.primary}   bg="var(--clr-primary-dim)"  dot />
            <Badge label="Role Based Access"    color={C.slate}     bg="var(--clr-surface-2)" />
            <Badge label="Interactive Prototype" color={C.slate}     bg="var(--clr-surface-2)" />
          </div>
          <h1 className="page-header-title">Executive Management Finance Dashboard</h1>
          <p className="page-header-subtitle">
            {activeMonthLabel} · {comparisonLabel}
          </p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <FilterBar />

      {/* ── KPI CARDS ── */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card" style={{ borderTop: `3px solid ${C.rose}` }}>
          <div className="kpi-icon" style={{ background: 'rgba(244,63,94,0.1)', color: C.rose }}>
            <AlertTriangle size={18} />
          </div>
          <div className="kpi-label">Gross Receivables</div>
          <div className="kpi-value">{fmtM(740.4)}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)' }}>As of 31-Mar-2026</div>
        </div>
        <div className="kpi-card" style={{ borderTop: `3px solid ${C.amber}` }}>
          <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.1)', color: C.amber }}>
            <TrendingUp size={18} />
          </div>
          <div className="kpi-label">Overdue AR (&gt;30d)</div>
          <div className="kpi-value">{fmtM(579.0)}</div>
          <div style={{ fontSize: '0.68rem', color: C.rose, fontWeight: 600 }}>
            {((579.0/740.4)*100).toFixed(1)}% of Total AR
          </div>
        </div>
        <div className="kpi-card" style={{ borderTop: `3px solid ${C.primary}` }}>
          <div className="kpi-icon" style={{ background: 'var(--clr-primary-dim)', color: C.primary }}>
            <Calendar size={18} />
          </div>
          <div className="kpi-label">DSO</div>
          <div className="kpi-value">112 Days</div>
          <div style={{ fontSize: '0.68rem', color: C.rose, fontWeight: 600 }}>+58 days vs target</div>
        </div>
        <div className="kpi-card" style={{ borderTop: `3px solid ${C.emerald}` }}>
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.1)', color: C.emerald }}>
            <Package size={18} />
          </div>
          <div className="kpi-label">Inventory (Total)</div>
          <div className="kpi-value">{fmtM(124.6)}</div>
          <div className="kpi-change kpi-change-up">71.9% within 90d</div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '2px solid var(--clr-border)', paddingBottom: 0 }}>
        {['overview', 'reports', 'collections', 'controls'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: '8px 20px',
              fontSize: '0.8rem', fontWeight: 600,
              background: activeTab === t ? C.primary : 'transparent',
              color: activeTab === t ? '#fff' : 'var(--clr-text-muted)',
              border: 'none', borderRadius: '8px 8px 0 0',
              cursor: 'pointer', textTransform: 'capitalize',
              transition: 'all 0.15s',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          {/* Row 1: P&L + Collection Efficiency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }}>

            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-text)', marginBottom: 14 }}>
                Profit &amp; Loss Trend
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                <LegendDot color={C.primary} label="Actual" />
                <LegendDot color="#d1d9ee"   label="Budget" />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={plData} barGap={2} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={32} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="revenue"     name="Actual" fill={C.primary} radius={[3,3,0,0]} barSize={14} />
                  <Bar dataKey="grossProfit" name="Budget" fill="#d1d9ee"   radius={[3,3,0,0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Collection Efficiency donut */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-text)', alignSelf: 'flex-start', marginBottom: 14 }}>
                Collection Efficiency
              </div>
              <div style={{ position: 'relative', width: '100%' }}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={[{ v: COLLECTED }, { v: 100 - COLLECTED }]}
                      dataKey="v" cx="50%" cy="50%"
                      innerRadius={54} outerRadius={74}
                      startAngle={90} endAngle={-270} stroke="none"
                    >
                      <Cell fill={C.primary} />
                      <Cell fill="var(--clr-surface-2)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--clr-text)' }}>{COLLECTED}%</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--clr-text-muted)', fontWeight: 500 }}>Collected</div>
                </div>
              </div>
              <div style={{ display: 'flex', width: '100%', gap: 12, marginTop: 8 }}>
                <SplitStat label="Collected" value={`${COLLECTED}%`} />
                <SplitStat label="Pending"   value={`${100 - COLLECTED}%`} border />
              </div>
            </div>
          </div>

          {/* Row 2: AR Aging + WC Indicators + Alerts */}
          <div className="grid-charts-3">
            {/* Receivable Aging */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-text)', marginBottom: 4 }}>
                Receivable Aging Summary
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: 16 }}>
                DSO 112 Days · Total AED 740.4M ·{' '}
                <span style={{ color: C.rose, fontWeight: 700 }}>⚠ 120+ days = 43.1%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                {AR_BUCKETS.map((b, i) => {
                  const maxVal = Math.max(...AR_BUCKETS.map(x => x.value));
                  const h = Math.round((b.value / maxVal) * 100);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: '100%', height: `${h}%`, minHeight: 6, borderRadius: '4px 4px 0 0',
                        background: i < 2 ? C.primary : i === 2 ? C.amber : C.rose,
                      }} />
                      <span style={{ fontSize: '0.58rem', color: 'var(--clr-text-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {b.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Working Capital */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-text)', marginBottom: 16 }}>
                Working Capital Indicators
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {WC_INDICATORS.map(w => (
                  <div key={w.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--clr-text-muted)' }}>{w.label}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--clr-text)' }}>{w.value} days</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${(w.value / w.max) * 100}%`, background: w.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-text)', marginBottom: 14 }}>
                Alerts &amp; Exceptions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ALERTS.map((a, i) => (
                  <div key={i} style={{
                    padding: '10px 12px',
                    background: 'var(--clr-surface-2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.72rem',
                    color: 'var(--clr-text)',
                    fontWeight: 500,
                    lineHeight: 1.45,
                    border: '1px solid var(--clr-border)',
                    borderLeft: `3px solid ${i === 0 || i === 3 ? C.rose : C.amber}`,
                  }}>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.65rem', color: 'var(--clr-text-dim)', marginTop: 20, lineHeight: 1.6 }}>
            Sample prototype only. Figures are illustrative. This page is structured so the same design can be extended
            into separate screens for Executive Management, General Managers, Division Managers, BU Accountants, and Sales Engineers.
          </p>
        </>
      )}

      {/* ── NON-OVERVIEW TABS ── */}
      {activeTab !== 'overview' && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏗️</div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--clr-text)', marginBottom: 8 }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module coming soon
          </div>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>
            Being mapped to Oracle Fusion ERP data streams.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */
function Badge({ label, color, bg, dot }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 'var(--radius-full)',
      fontSize: '0.65rem', fontWeight: 700,
      color, background: bg,
      border: `1px solid ${color}25`,
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }} />}
      {label}
    </span>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--clr-text-muted)' }}>{label}</span>
    </div>
  );
}

function SplitStat({ label, value, border }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '8px 0',
      borderLeft: border ? '1px solid var(--clr-border)' : 'none',
    }}>
      <div style={{ fontSize: '0.62rem', color: 'var(--clr-text-dim)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--clr-text)' }}>{value}</div>
    </div>
  );
}
