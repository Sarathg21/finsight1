import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, DollarSign, CreditCard, ArrowUpRight,
  AlertTriangle, ChevronRight, ArrowRight,
} from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import FilterBar from '../components/FilterBar';
import Card from '../components/ui/Card';
import ChartLegend from '../components/ui/ChartLegend';
import {
  MONTHLY_PL, MONTHLY_REVENUE, KPI_SUMMARY, DIVISION_PERFORMANCE, AR_AGING,
} from '../data/masterData';
import { C, TOOLTIP_STYLE } from '../utils/theme';

/* ── comparison multipliers ────────────────────────────────── */
const COMP_MULT = { vs_py: 0.89, vs_budget: 0.95, vs_pm: 0.94, ytd_vs_bgt: 0.97 };

export default function CFODashboard() {
  const { filters, setters, meta } = useFilters();
  const { activeMonthIndices, comparison, division, country, currency } = filters;
  const { drillDown, drillReset } = setters;
  const { activeMonthLabel, comparisonLabel } = meta;

  const slicedPL  = useMemo(() => MONTHLY_PL.filter((_, i) => activeMonthIndices.includes(i)), [activeMonthIndices]);
  const slicedRev = useMemo(() => MONTHLY_REVENUE.filter((_, i) => activeMonthIndices.includes(i)), [activeMonthIndices]);

  const kpis = useMemo(() => {
    const rev    = slicedRev.reduce((s, m) => s + m.actual, 0);
    const bgt    = slicedRev.reduce((s, m) => s + m.budget, 0);
    const gp     = slicedPL.reduce((s, m) => s + m.grossProfit, 0);
    const net    = slicedPL.reduce((s, m) => s + m.netProfit, 0);
    const mult   = COMP_MULT[comparison] || 0.89;
    const pct    = v => (((v / (v * mult)) - 1) * 100).toFixed(1);
    return { rev, gp, net, bgt, revVarPct: pct(rev), gpVarPct: pct(gp), netVarPct: pct(net) };
  }, [slicedPL, slicedRev, comparison]);

  const chartData = useMemo(() => {
    const mult = COMP_MULT[comparison] || 0.89;
    return slicedPL.map(m => ({
      month:   m.month,
      Actual:  m.revenue,
      Compare: +(m.revenue * mult).toFixed(1),
      GP:      m.grossProfit,
    }));
  }, [slicedPL, comparison]);

  const filteredDivisions = useMemo(() =>
    division === 'all'
      ? DIVISION_PERFORMANCE
      : DIVISION_PERFORMANCE.filter(d => d.division.toLowerCase().includes(division.toLowerCase())),
  [division]);

  const fxRate = { AED: 3.67, SAR: 3.75, QAR: 3.64, OMR: 0.39, INR: 83.1, USD: 1 };
  const rate = fxRate[currency] || 1;
  const fmtM = v => `${currency} ${(v * rate).toFixed(1)}M`;

  const [drillMetric, setDrillMetric] = useState(null);
  function handleDrillKPI(metric) { setDrillMetric(metric); drillDown(metric); }
  function handleDrillBack()       { setDrillMetric(null);  drillReset(); }

  return (
    <div className="animate-in">
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">CFO Finance Dashboard</h1>
          <p className="page-header-subtitle">
            {activeMonthLabel} · {comparisonLabel} · {country === 'all' ? 'All Countries' : country}
          </p>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <FilterBar />

      {/* ── Drill-down breadcrumb ── */}
      {drillMetric && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 20, padding: '9px 16px',
          background: 'var(--clr-primary-dim)',
          border: '1px solid var(--clr-primary-glow)',
          borderRadius: 'var(--radius-md)',
        }}>
          <button
            onClick={handleDrillBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--clr-primary)', fontSize: '0.78rem', fontWeight: 700,
            }}
          >
            ← Back to Summary
          </button>
          <ChevronRight size={13} style={{ color: 'var(--clr-primary)', opacity: 0.6 }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--clr-primary)', textTransform: 'capitalize' }}>
            {drillMetric} — Trend & Detail
          </span>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <KPITile
          label={`Revenue (${activeMonthLabel})`}
          value={fmtM(kpis.rev)}
          varPct={kpis.revVarPct}
          sub={comparisonLabel}
          icon={<DollarSign size={18} />}
          accent={C.amber}
          iconBg="rgba(245,158,11,0.1)"
          onClick={() => handleDrillKPI('revenue')}
          active={drillMetric === 'revenue'}
        />
        <KPITile
          label="Gross Profit"
          value={fmtM(kpis.gp)}
          varPct={kpis.gpVarPct}
          sub={comparisonLabel}
          icon={<TrendingUp size={18} />}
          accent={C.primary}
          iconBg="var(--clr-primary-dim)"
          onClick={() => handleDrillKPI('grossProfit')}
          active={drillMetric === 'grossProfit'}
        />
        <KPITile
          label="Net Profit"
          value={fmtM(kpis.net)}
          varPct={kpis.netVarPct}
          sub={comparisonLabel}
          icon={<ArrowUpRight size={18} />}
          accent={C.purple}
          iconBg="rgba(124,58,237,0.1)"
          onClick={() => handleDrillKPI('netProfit')}
          active={drillMetric === 'netProfit'}
        />
        <KPITile
          label="Overdue AR (>30d)"
          value={`${currency} ${(KPI_SUMMARY.overdueAR.value * rate).toFixed(1)}M`}
          varPct={+12.1}
          sub="vs last month"
          icon={<AlertTriangle size={18} />}
          accent={C.rose}
          iconBg="rgba(244,63,94,0.1)"
          onClick={() => handleDrillKPI('ar')}
          active={drillMetric === 'ar'}
        />
      </div>

      {/* ── Trend chart + Liquidity gauge ── */}
      <div className="grid-cols-2-1" style={{ marginBottom: 20 }}>

        {/* Main Trend Chart */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--clr-text)' }}>
                {drillMetric
                  ? `${drillMetric.charAt(0).toUpperCase() + drillMetric.slice(1)} Trend`
                  : 'Financial Summary'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
                Actual vs {comparisonLabel} · {activeMonthLabel}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <ChartLegend color={C.primary} label="Actual" square />
              <ChartLegend color="#e2e8f0" label={comparisonLabel} square />
              {!drillMetric && <ChartLegend color={C.cyan} label="Gross Profit" square />}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} barGap={2} barCategoryGap="32%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={36} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${currency} ${v}M`]} />
              <Bar dataKey="Actual"  fill={C.primary} radius={[3,3,0,0]} barSize={10} />
              <Bar dataKey="Compare" fill="#e2e8f0"   radius={[3,3,0,0]} barSize={10} />
              {!drillMetric && <Bar dataKey="GP" fill={C.cyan} radius={[3,3,0,0]} barSize={10} />}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Liquidity Gauge */}
          <Card>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--clr-text)', marginBottom: 2 }}>
              Liquidity Gauge
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', marginBottom: 12 }}>
              Cash position vs monthly target
            </div>
            <div style={{ height: 130, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={[{ v: 87 }, { v: 13 }]} dataKey="v" cx="50%" cy="55%"
                    innerRadius={46} outerRadius={62} startAngle={220} endAngle={-40} stroke="none">
                    <Cell fill="var(--clr-primary-dim)" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                  <Pie data={[{ v: 87 }, { v: 13 }]} dataKey="v" cx="50%" cy="55%"
                    innerRadius={46} outerRadius={62} startAngle={220} endAngle={220-(260*0.87)} stroke="none">
                    <Cell fill={C.primary} />
                    <Cell fill="transparent" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', textAlign: 'center', paddingTop: 10 }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--clr-text)' }}>87%</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--clr-text-dim)', fontWeight: 600 }}>of target</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--clr-border)' }}>
              {[['DSO', KPI_SUMMARY.dso.value.replace(' days','')], ['DPO', KPI_SUMMARY.dpo.value.replace(' days','')], ['DIO', KPI_SUMMARY.dio.value.replace(' days','')]].map(([l, v]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', color: 'var(--clr-text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: l === 'DSO' ? C.rose : 'var(--clr-text)' }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* AR Aging Mix */}
          <Card>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--clr-text)', marginBottom: 14 }}>
              AR Aging Mix
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {AR_AGING.map(a => (
                <AgingRow
                  key={a.bucket}
                  label={a.bucket}
                  pct={a.pct}
                  color={a.pct > 30 ? C.rose : a.pct > 15 ? C.amber : C.primary}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Division Performance Table ── */}
      <Card noPadding>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--clr-text)' }}>
              Division Performance · {activeMonthLabel}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
              {filteredDivisions.length} divisions · click any row to drill deeper
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                {['Division', `Revenue (${currency})`, 'GP', 'GP %', 'YoY', 'Status'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDivisions.map((d, i) => (
                <tr
                  key={d.division}
                  onClick={() => handleDrillKPI(d.division)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontWeight: 600 }}>{d.division}</td>
                  <td>{currency} {(d.revenue * rate).toFixed(1)}M</td>
                  <td>{currency} {(d.gp * rate).toFixed(1)}M</td>
                  <td>{d.gpPct}</td>
                  <td>
                    <span style={{ color: d.yoy.startsWith('+') ? C.emerald : C.rose, fontWeight: 700 }}>
                      {d.yoy}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${d.status === 'up' ? 'badge-success' : d.status === 'neutral' ? 'badge-neutral' : 'badge-danger'}`}>
                      {d.status === 'up' ? 'On Track' : d.status === 'neutral' ? 'N/A' : 'At Risk'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── Local KPI Tile (CFO-specific: has drill interaction) ────── */
function KPITile({ label, value, varPct, sub, icon, accent, iconBg, onClick, active }) {
  const positive = parseFloat(varPct) >= 0;
  return (
    <div
      className="kpi-card"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        border: `1px solid ${active ? accent : 'var(--clr-border)'}`,
        boxShadow: active ? `0 4px 20px ${accent}20` : 'var(--shadow-card)',
        borderTop: `3px solid ${accent}`,
      }}
    >
      <div className="kpi-icon" style={{ background: iconBg, color: accent }}>
        {icon}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span className={`kpi-change ${positive ? 'kpi-change-up' : 'kpi-change-down'}`}>
          {positive ? '▲' : '▼'} {Math.abs(varPct)}%
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-dim)' }}>{sub}</span>
      </div>
      {active && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.6rem', color: accent, fontWeight: 700 }}>
          Drilled <ArrowRight size={9} />
        </div>
      )}
    </div>
  );
}

function AgingRow({ label, pct, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--clr-text-muted)' }}>{label}</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--clr-text)' }}>{pct}%</span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
