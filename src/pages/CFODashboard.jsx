import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, Legend,
} from 'recharts';
import {
  TrendingUp, DollarSign, CreditCard, ArrowUpRight,
  AlertTriangle, ChevronRight, ArrowRight,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import FilterBar from '../components/FilterBar';
import {
  MONTHLY_PL, MONTHLY_REVENUE, KPI_SUMMARY, DIVISION_PERFORMANCE, AR_AGING,
} from '../data/masterData';

/* ── palette ──────────────────────────────────────────────────────── */
const C = { purple: '#7c3aed', blue: '#0ea5e9', pink: '#ec4899', emerald: '#10b981', rose: '#f43f5e', amber: '#f59e0b', gray: '#94a3b8' };

/* ── comparison multipliers (simulate prior-year / budget variance) ── */
const COMP_MULT = { vs_py: 0.89, vs_budget: 0.95, vs_pm: 0.94, ytd_vs_bgt: 0.97 };

export default function CFODashboard() {
  const { filters, setters, meta } = useFilters();
  const { activeMonthIndices, comparison, division, country, currency } = filters;
  const { drillDown, drillReset } = setters;
  const { activeMonthLabel, comparisonLabel } = meta;

  // ── slice data to selected month range ───────────────────────────
  const slicedPL = useMemo(() =>
    MONTHLY_PL.filter((_, i) => activeMonthIndices.includes(i)),
  [activeMonthIndices]);

  const slicedRev = useMemo(() =>
    MONTHLY_REVENUE.filter((_, i) => activeMonthIndices.includes(i)),
  [activeMonthIndices]);

  // ── aggregate KPIs across selected months ────────────────────────
  const kpis = useMemo(() => {
    const rev   = slicedRev.reduce((s, m) => s + m.actual, 0);
    const revCmp = slicedRev.reduce((s, m) => s + m.py, 0);
    const bgt   = slicedRev.reduce((s, m) => s + m.budget, 0);
    const gp    = slicedPL.reduce((s, m) => s + m.grossProfit, 0);
    const net   = slicedPL.reduce((s, m) => s + m.netProfit, 0);
    const cmpMult   = COMP_MULT[comparison] || 0.89;
    const revVarPct = (((rev / (rev * cmpMult)) - 1) * 100).toFixed(1);
    const gpVarPct  = (((gp  / (gp  * cmpMult)) - 1) * 100).toFixed(1);
    const netVarPct = (((net / (net * cmpMult)) - 1) * 100).toFixed(1);
    return { rev, gp, net, bgt, revVarPct, gpVarPct, netVarPct };
  }, [slicedPL, slicedRev, comparison]);

  // ── chart data with comparison line ──────────────────────────────
  const chartData = useMemo(() => {
    const cmpMult = COMP_MULT[comparison] || 0.89;
    return slicedPL.map((m, i) => ({
      month: m.month,
      Actual:   m.revenue,
      Compare:  +(m.revenue * cmpMult).toFixed(1),
      GP:       m.grossProfit,
    }));
  }, [slicedPL, comparison]);

  // ── division filter on rows ───────────────────────────────────────
  const filteredDivisions = useMemo(() =>
    division === 'all'
      ? DIVISION_PERFORMANCE
      : DIVISION_PERFORMANCE.filter(d => d.division.toLowerCase().includes(division.toLowerCase())),
  [division]);

  // ── currency multipliers (illustrative) ──────────────────────────
  const fxRate = { AED: 3.67, SAR: 3.75, QAR: 3.64, OMR: 0.39, INR: 83.1, USD: 1 };
  const rate = fxRate[currency] || 1;
  const fmtM = v => `${currency} ${(v * rate).toFixed(1)}M`;

  // ── drill state ───────────────────────────────────────────────────
  const [drillMetric, setDrillMetric] = useState(null);
  function handleDrillKPI(metric) { setDrillMetric(metric); drillDown(metric); }
  function handleDrillBack() { setDrillMetric(null); drillReset(); }

  return (
    <div className="animate-in" style={{ padding: '24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 4 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>CFO Finance Dashboard</h1>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
          {activeMonthLabel} · {comparisonLabel} · {country === 'all' ? 'All Countries' : country}
        </p>
      </div>

      {/* ── Universal Filter Bar ── */}
      <FilterBar />

      {/* Drill-down breadcrumb */}
      {drillMetric && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 14px', background: '#ede9fe', borderRadius: 8 }}>
          <button onClick={handleDrillBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Back to Summary
          </button>
          <ChevronRight size={14} style={{ color: '#a78bfa' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7c3aed', textTransform: 'capitalize' }}>
            {drillMetric} — Trend & Detail
          </span>
        </div>
      )}

      {/* ── KPI Cards (click to drill) ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard
          label={`Revenue (${activeMonthLabel})`}
          value={fmtM(kpis.rev)}
          varPct={kpis.revVarPct}
          sub={comparisonLabel}
          icon={<DollarSign size={16} />}
          accent={C.amber}
          onClick={() => handleDrillKPI('revenue')}
          active={drillMetric === 'revenue'}
        />
        <KPICard
          label="Gross Profit"
          value={fmtM(kpis.gp)}
          varPct={kpis.gpVarPct}
          sub={comparisonLabel}
          icon={<TrendingUp size={16} />}
          accent={C.blue}
          onClick={() => handleDrillKPI('grossProfit')}
          active={drillMetric === 'grossProfit'}
        />
        <KPICard
          label="Net Profit"
          value={fmtM(kpis.net)}
          varPct={kpis.netVarPct}
          sub={comparisonLabel}
          icon={<ArrowUpRight size={16} />}
          accent={C.purple}
          onClick={() => handleDrillKPI('netProfit')}
          active={drillMetric === 'netProfit'}
        />
        <KPICard
          label="Overdue AR (>30d)"
          value={`${currency} ${(KPI_SUMMARY.overdueAR.value * rate).toFixed(1)}M`}
          varPct={+12.1}
          sub="vs last month"
          icon={<AlertTriangle size={16} />}
          accent={C.rose}
          onClick={() => handleDrillKPI('ar')}
          active={drillMetric === 'ar'}
        />
      </div>

      {/* ── Level 0 / 1: Trend chart + AR mix ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Main Trend Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {drillMetric ? `${drillMetric.charAt(0).toUpperCase() + drillMetric.slice(1)} Trend` : 'Financial Summary'}
              </h3>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '2px 0 0' }}>
                Actual vs {comparisonLabel} | {activeMonthLabel}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <LegendDot color={C.purple} label="Actual" />
              <LegendDot color={C.gray} label={comparisonLabel} />
              {!drillMetric && <LegendDot color={C.blue} label="Gross Profit" />}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barGap={2} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={36} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 11 }}
                formatter={(v) => [`${currency} ${v}M`]}
              />
              <Bar dataKey="Actual"  fill={C.purple} radius={[3,3,0,0]} barSize={10} />
              <Bar dataKey="Compare" fill="#e2e8f0" radius={[3,3,0,0]} barSize={10} />
              {!drillMetric && <Bar dataKey="GP" fill={C.blue} radius={[3,3,0,0]} barSize={10} />}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right panel: Liquidity gauge + AR aging */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 18 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>Liquidity Gauge</h4>
            <p style={{ fontSize: '0.62rem', color: '#94a3b8', margin: '0 0 10px' }}>Cash position vs monthly target</p>
            <div style={{ height: 130, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={[{ v: 87 }, { v: 13 }]} dataKey="v" cx="50%" cy="55%"
                    innerRadius={48} outerRadius={65} startAngle={220} endAngle={-40} stroke="none">
                    <Cell fill="#a855f740" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                  <Pie data={[{ v: 87 }, { v: 13 }]} dataKey="v" cx="50%" cy="55%"
                    innerRadius={48} outerRadius={65} startAngle={220} endAngle={220-(260*0.87)} stroke="none">
                    <Cell fill={C.purple} />
                    <Cell fill="transparent" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', textAlign: 'center', paddingTop: 12 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>87%</div>
                <div style={{ fontSize: '0.52rem', color: '#94a3b8', fontWeight: 600 }}>of target</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
              {[['DSO', KPI_SUMMARY.dso.value.replace(' days','')], ['DPO', KPI_SUMMARY.dpo.value.replace(' days','')], ['DIO', KPI_SUMMARY.dio.value.replace(' days','')]].map(([l,v]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: l === 'DSO' ? '#f43f5e' : '#1e293b' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}>AR Aging Mix</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {AR_AGING.map(a => (
                <AgingRow key={a.bucket} label={a.bucket} pct={a.pct}
                  color={a.pct > 30 ? C.purple : a.pct > 15 ? C.pink : C.rose} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Level 2: Division detail table (drill view) ────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Division Performance · {activeMonthLabel}
            </h3>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '2px 0 0' }}>
              {filteredDivisions.length} divisions · click any row to drill deeper
            </p>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Division', `Revenue (${currency})`, 'GP', 'GP %', 'YoY', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDivisions.map((d, i) => (
              <tr key={d.division} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: i % 2 === 0 ? '#fff' : '#fdfcff' }}
                onClick={() => handleDrillKPI(d.division)}>
                <td style={{ padding: '11px 16px', fontWeight: 700, color: '#1e293b' }}>{d.division}</td>
                <td style={{ padding: '11px 16px', color: '#475569', fontWeight: 600 }}>{currency} {(d.revenue * rate).toFixed(1)}M</td>
                <td style={{ padding: '11px 16px', color: '#475569' }}>{currency} {(d.gp * rate).toFixed(1)}M</td>
                <td style={{ padding: '11px 16px', color: '#475569' }}>{d.gpPct}</td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ color: d.yoy.startsWith('+') ? C.emerald : C.rose, fontWeight: 700 }}>{d.yoy}</span>
                </td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 700,
                    background: d.status === 'up' ? '#ecfdf5' : '#fff1f2',
                    color: d.status === 'up' ? C.emerald : C.rose }}>
                    {d.status === 'up' ? 'On Track' : d.status === 'neutral' ? 'N/A' : 'At Risk'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */
function KPICard({ label, value, varPct, sub, icon, accent, onClick, active }) {
  const positive = parseFloat(varPct) >= 0;
  return (
    <div
      onClick={onClick}
      style={{
        padding: 18, borderRadius: 16, background: '#fff',
        border: `1.5px solid ${active ? accent : '#f1f5f9'}`,
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: active ? `0 4px 20px ${accent}25` : '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '16px 16px 0 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ color: accent, opacity: 0.8 }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', marginBottom: 4 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', fontWeight: 700 }}>
        <span style={{ color: positive ? '#10b981' : '#f43f5e' }}>
          {positive ? '▲' : '▼'} {Math.abs(varPct)}%
        </span>
        <span style={{ color: '#94a3b8', fontWeight: 400 }}>{sub}</span>
      </div>
      {active && (
        <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.6rem', color: accent, fontWeight: 700 }}>
          Drilled <ArrowRight size={10} />
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#64748b' }}>{label}</span>
    </div>
  );
}

function AgingRow({ label, pct, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b' }}>{label}</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1e293b' }}>{pct}%</span>
      </div>
      <div style={{ height: 4, background: '#f1f5f9', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}
