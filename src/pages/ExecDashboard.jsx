import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { MONTHLY_PL, KPI_SUMMARY, AR_AGING, WORKING_CAPITAL_TREND } from '../data/masterData';
import { useFilters } from '../context/FilterContext';
import FilterBar from '../components/FilterBar';

/* ── palette ─────────────────────────────────────────────────────── */
const BLUE     = '#082a80ff';
const BLUE_LT  = '#485fa3ff';
const GRAY_BAR = '#d1d9ee';
const DONUT_BG = '#e8edfc';

/* ── mock alerts ─────────────────────────────────────────────────── */
const ALERTS = [
  'AED 349.2M (47.2%) receivables overdue > 180 days — immediate follow-up required',
  'DSO at 112 days — significantly above 45-day benchmark across all entities',
  'Slow-moving inventory: AED 12.8M (10.3%) aged beyond 1 year',
  'Top-5 aging bucket (120+) represents 43.1% of total AR portfolio',
];

/* ── Working-Capital bar data ─────────────────────────────────────── */
const WC_INDICATORS = [
  { label: 'DSO', value: 112, max: 150 },
  { label: 'DIO', value: 45,  max: 100 },
  { label: 'DPO', value: 42,  max: 100 },
];

/* ── AR Aging bars — real data from Receivable Aging Report 31-Mar-2026 ── */
const AR_BUCKETS = [
  { label: '1-30d',    value: 97.3  },
  { label: '31-60d',   value: 111.1 },
  { label: '61-90d',   value: 52.6  },
  { label: '91-180d',  value: 130.2 },
  { label: '>180d',    value: 349.2 },
];

export default function ExecDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { filters, meta } = useFilters();
  const { activeMonthIndices, comparison, currency } = filters;
  const { activeMonthLabel, comparisonLabel } = meta;

  /* last months PL for chart — respects period filter */
  const plData = useMemo(() =>
    (MONTHLY_PL || []).filter((_, i) => activeMonthIndices.includes(i)),
  [activeMonthIndices]);

  /* collection efficiency adjusts slightly by comparison */
  const COMP_MULT = { vs_py: 0.87, vs_budget: 0.90, vs_pm: 0.89, ytd_vs_bgt: 0.92 };
  const COLLECTED = 91;
  const fxRate = { AED: 3.67, SAR: 3.75, QAR: 3.64, OMR: 0.39, INR: 83.1, USD: 1 };
  const rate = fxRate[currency] || 1;

  return (
    <div className="exec-dash animate-in" style={{ padding: '24px 28px', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f6fb', minHeight: '100vh' }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        {/* Badge row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <Badge label="Live Data"            color="#3b6ef0" bg="#e8edfc" dot />
          <Badge label="Role Based Access"      color="#64748b" bg="#f1f5f9" />
          <Badge label="Interactive Prototype"  color="#64748b" bg="#f1f5f9" />
        </div>
        <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Executive Management Finance Dashboard
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0' }}>
          {activeMonthLabel} · {comparisonLabel}
        </p>
      </div>

      {/* ── Universal Filter Bar ─────────────────────────────────────── */}
      <FilterBar compact />

      {/* ── KPI CARDS ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <KPICard title="Gross Receivables"     value={`${currency} ${(740.4 * rate).toFixed(1)}M`}  change="As of 31-Mar-2026"  up={false} />
        <KPICard title="Overdue AR (>30d)"     value={`${currency} ${(579.0 * rate).toFixed(1)}M`}  change={`${((579.0/740.4)*100).toFixed(1)}% of Total AR`} up={false} />
        <KPICard title="DSO"                   value="112 Days"    change="+58 days vs target" up={false} />
        <KPICard title="Inventory (Total)"     value={`${currency} ${(124.6 * rate).toFixed(1)}M`}  change="71.9% within 90d"  up />
      </div>

      {/* ── TABS ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '2px solid #e8edfc', paddingBottom: 0 }}>
        {['overview','reports','collections','controls'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '8px 20px',
            fontSize: '0.8rem', fontWeight: 600,
            background: activeTab === t ? BLUE : 'transparent',
            color:  activeTab === t ? '#fff' : '#64748b',
            border: 'none', borderRadius: '6px 6px 0 0',
            cursor: 'pointer', textTransform: 'capitalize',
            transition: 'all 0.15s',
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT (overview tab) ─────────────────────────────── */}
      {activeTab === 'overview' && (
        <>
          {/* Row 1: P&L chart  +  Collection Efficiency donut */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 16 }}>

            {/* P&L Trend */}
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 4 }}>Profit &amp; Loss Trend</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                <Legend color={BLUE}    label="Actual" />
                <Legend color={GRAY_BAR} label="Budget" />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={plData} barGap={2} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={32} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 11 }}
                    cursor={{ fill: '#f4f6fb' }}
                  />
                  <Bar dataKey="revenue"     name="Actual" fill={BLUE}     radius={[3,3,0,0]} barSize={14} />
                  <Bar dataKey="grossProfit" name="Budget" fill={GRAY_BAR} radius={[3,3,0,0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Collection Efficiency */}
            <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', alignSelf: 'flex-start', marginBottom: 12 }}>
                Collection Efficiency
              </div>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={[{ v: COLLECTED }, { v: 100 - COLLECTED }]}
                    dataKey="v" cx="50%" cy="50%"
                    innerRadius={58} outerRadius={80} startAngle={90} endAngle={-270}
                    stroke="none">
                    <Cell fill={BLUE} />
                    <Cell fill={DONUT_BG} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: -140, marginBottom: 120, textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{COLLECTED}%</div>
              </div>
              <div style={{ display: 'flex', width: '100%', gap: 16, marginTop: 8 }}>
                <SplitStat label="Collected" value={`${COLLECTED}%`} />
                <SplitStat label="Pending"   value={`${100 - COLLECTED}%`} border />
              </div>
            </div>
          </div>

          {/* Row 2: AR Aging  +  WC Indicators  +  Alerts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

            {/* Receivable Aging Summary */}
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 2 }}>Receivable Aging Summary</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 16 }}>DSO 112 Days · Total AED 740.4M · <span style={{ color: '#f43f5e', fontWeight: 700 }}>⚠ 120+ days = 43.1%</span></div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
                {AR_BUCKETS.map((b, i) => {
                  const maxVal = Math.max(...AR_BUCKETS.map(b => b.value));
                  const h = Math.round((b.value / maxVal) * 100);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: '100%', height: `${h}%`,
                        background: i < 2 ? BLUE : i === 2 ? '#a3b4f7' : '#cbd5f9',
                        borderRadius: '4px 4px 0 0',
                        minHeight: 6,
                      }} />
                      <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>{b.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Working Capital Indicators */}
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 16 }}>Working Capital Indicators</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {WC_INDICATORS.map(w => (
                  <div key={w.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{w.label}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{w.value}</span>
                    </div>
                    <div style={{ height: 6, background: '#e8edfc', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ width: `${(w.value / w.max) * 100}%`, height: '100%', background: BLUE, borderRadius: 100 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts & Exceptions */}
            <div style={card}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 16 }}>Alerts &amp; Exceptions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ALERTS.map((a, i) => (
                  <div key={i} style={{
                    padding: '10px 12px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    fontSize: '0.72rem',
                    color: '#334155',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    border: '1px solid #e8edfc',
                  }}>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 18, lineHeight: 1.5 }}>
            Sample prototype only. Figures are illustrative. This page is structured so the same design can be extended into separate screens for Executive Management, General Managers, Division Managers, BU Accountants, and Sales Engineers.
          </p>
        </>
      )}

      {activeTab !== 'overview' && (
        <div style={{ ...card, textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏗️</div>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} module coming soon
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Being mapped to Oracle Fusion ERP data streams.</p>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

const card = {
  background: '#fff',
  borderRadius: 12,
  padding: '20px',
  border: '1px solid #e8edfc',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

function Badge({ label, color, bg, dot }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      fontSize: '0.68rem', fontWeight: 700,
      color, background: bg, border: `1px solid ${color}30`,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />}
      {label}
    </span>
  );
}

function FilterDropdown({ value, onChange, options }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: 'none', padding: '7px 32px 7px 14px',
          fontSize: '0.78rem', fontWeight: 600, color: '#334155',
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
          cursor: 'pointer', outline: 'none',
        }}
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <svg style={{ position: 'absolute', right: 10, pointerEvents: 'none' }} width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </div>
  );
}

function KPICard({ title, value, change, up }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '18px 20px',
      border: '1px solid #e8edfc', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {title}
      </div>
      <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: 4, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: up ? '#10b981' : '#f43f5e' }}>
        {change}
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function SplitStat({ label, value, border }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '10px 0',
      borderLeft: border ? '1px solid #e8edfc' : 'none',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{value}</div>
    </div>
  );
}
