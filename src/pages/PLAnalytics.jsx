import { useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { ArrowUp, ArrowDown, ChevronDown, ChevronRight } from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import FilterBar from '../components/FilterBar';
import { MONTHLY_PL, MONTHLY_REVENUE, DIVISION_PERFORMANCE } from '../data/masterData';

/* ── comparison multipliers ──────────────────────────────────────── */
const COMP_MULT = { vs_py: 0.88, vs_budget: 0.94, vs_pm: 0.93, ytd_vs_bgt: 0.96 };
const COMP_COLOR = { vs_py: '#f59e0b', vs_budget: '#ec4899', vs_pm: '#0ea5e9', ytd_vs_bgt: '#10b981' };

export default function PLAnalytics() {
  const { filters, meta } = useFilters();
  const { activeMonthIndices, comparison, division, currency } = filters;
  const { activeMonthLabel, comparisonLabel } = meta;

  const [expandRow, setExpandRow] = useState(null);

  /* ── slice & aggregate ─────────────────────────────────────────── */
  const slicedPL  = useMemo(() => MONTHLY_PL.filter((_, i) => activeMonthIndices.includes(i)), [activeMonthIndices]);
  const slicedRev = useMemo(() => MONTHLY_REVENUE.filter((_, i) => activeMonthIndices.includes(i)), [activeMonthIndices]);

  const totals = useMemo(() => {
    const rev  = slicedRev.reduce((s, m) => s + m.actual,      0);
    const bgt  = slicedRev.reduce((s, m) => s + m.budget,      0);
    const py   = slicedRev.reduce((s, m) => s + m.py,          0);
    const gp   = slicedPL.reduce((s, m)  => s + m.grossProfit, 0);
    const ebit = slicedPL.reduce((s, m)  => s + m.ebit,        0);
    const net  = slicedPL.reduce((s, m)  => s + m.netProfit,   0);
    const mult = COMP_MULT[comparison] || 0.89;
    return {
      rev, bgt, py, gp, ebit, net,
      revCmp:  +(rev * mult).toFixed(1),
      gpCmp:   +(gp  * mult).toFixed(1),
      netCmp:  +(net * mult).toFixed(1),
      gpMarg:  +((gp / rev) * 100).toFixed(1),
      netMarg: +((net/ rev) * 100).toFixed(1),
    };
  }, [slicedPL, slicedRev, comparison]);

  /* ── chart: actual vs comparison line ─────────────────────────── */
  const chartData = useMemo(() => {
    const mult = COMP_MULT[comparison] || 0.89;
    return slicedPL.map(m => ({
      month: m.month,
      Revenue:    m.revenue,
      [comparisonLabel]: +(m.revenue * mult).toFixed(1),
      'Gross Profit': m.grossProfit,
      'Net Profit':   m.netProfit,
    }));
  }, [slicedPL, comparison, comparisonLabel]);

  /* ── variance % helper ─────────────────────────────────────────── */
  function varPct(actual, cmp) {
    return (((actual / cmp) - 1) * 100).toFixed(1);
  }

  /* ── currency rate (illustrative) */ 
  const fxRate = { AED: 3.67, SAR: 3.75, QAR: 3.64, OMR: 0.39, INR: 83.1, USD: 1 };
  const rate = fxRate[currency] || 1;
  const fmtM = v => `${(v * rate).toFixed(1)}M`;

  /* ── division filter ───────────────────────────────────────────── */
  const filteredDivs = useMemo(() =>
    division === 'all' ? DIVISION_PERFORMANCE
      : DIVISION_PERFORMANCE.filter(d => d.division.toLowerCase().includes(division.toLowerCase())),
  [division]);

  const cmpColor = COMP_COLOR[comparison] || '#f59e0b';

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 4 }}>
        <h1 className="page-header-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
          Profit &amp; Loss Analytics
        </h1>
        <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0' }}>
          {activeMonthLabel} · {comparisonLabel} · Interactive drill-through by entity, division &amp; month
        </p>
      </div>

      {/* ── Filter Bar ── */}
      <FilterBar />

      {/* ── KPI Infolets ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        <PLKPICard
          label="Revenue"
          value={`${currency} ${fmtM(totals.rev)}`}
          varPct={varPct(totals.rev, totals.revCmp)}
          sub={comparisonLabel}
          cmpValue={`${currency} ${fmtM(totals.revCmp)}`}
          color="#7c3aed"
        />
        <PLKPICard
          label="Gross Profit"
          value={`${currency} ${fmtM(totals.gp)}`}
          varPct={varPct(totals.gp, totals.gpCmp)}
          sub={comparisonLabel}
          cmpValue={`${currency} ${fmtM(totals.gpCmp)}`}
          extra={`GP Margin: ${totals.gpMarg}%`}
          color="#0ea5e9"
        />
        <PLKPICard
          label="EBIT"
          value={`${currency} ${fmtM(totals.ebit)}`}
          varPct={varPct(totals.ebit, totals.ebit * (COMP_MULT[comparison]||0.89))}
          sub={comparisonLabel}
          cmpValue={`${currency} ${fmtM(totals.ebit * (COMP_MULT[comparison]||0.89))}`}
          color="#10b981"
        />
        <PLKPICard
          label="Net Profit"
          value={`${currency} ${fmtM(totals.net)}`}
          varPct={varPct(totals.net, totals.netCmp)}
          sub={comparisonLabel}
          cmpValue={`${currency} ${fmtM(totals.netCmp)}`}
          extra={`Net Margin: ${totals.netMarg}%`}
          color="#ec4899"
        />
      </div>

      {/* ── Charts row ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Monthly P&L trend — Actual vs Comparison */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Monthly P&amp;L Trend</h3>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '2px 0 0' }}>Actual vs {comparisonLabel}</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <LegendDot color="#7c3aed" label="Revenue" />
              <LegendDot color={cmpColor} label={comparisonLabel} dashed />
              <LegendDot color="#0ea5e9" label="GP" />
              <LegendDot color="#ec4899" label="Net Profit" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={36} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 11 }}
                formatter={(v) => [`${currency} ${v}M`]}
              />
              <Line type="monotone" dataKey="Revenue"       stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3, fill: '#7c3aed' }} />
              <Line type="monotone" dataKey={comparisonLabel} stroke={cmpColor} strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
              <Line type="monotone" dataKey="Gross Profit"  stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3, fill: '#0ea5e9' }} />
              <Line type="monotone" dataKey="Net Profit"    stroke="#ec4899" strokeWidth={2.5} dot={{ r: 3, fill: '#ec4899' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Variance bar chart — actual vs budget */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
            Revenue Variance
          </h3>
          <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '0 0 16px' }}>Actual vs {comparisonLabel} by month</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData.map(d => ({
              month: d.month,
              Variance: +(d.Revenue - d[comparisonLabel]).toFixed(1),
            }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} width={36} />
              <ReferenceLine y={0} stroke="#e2e8f0" />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 11 }}
                formatter={(v) => [`${currency} ${v}M variance`]}
              />
              <Bar dataKey="Variance" radius={[3,3,0,0]} barSize={16}
                fill="#7c3aed"
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── P&L by Division detail table ─────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>P&amp;L by Division</h3>
          <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '2px 0 0' }}>
            {filteredDivs.length} divisions · click row to expand detail
          </p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Division', `Revenue (${currency})`, 'Gross Profit', 'GP %', `${comparisonLabel} Rev`, 'Variance', 'YoY'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDivs.map((d, i) => {
              const actual  = d.revenue * rate;
              const cmpRev  = d.revenue * rate * (COMP_MULT[comparison] || 0.89);
              const varAmt  = (actual - cmpRev).toFixed(1);
              const varPctV = (((actual / cmpRev) - 1) * 100).toFixed(1);
              const isPos   = parseFloat(varAmt) >= 0;
              return (
                <>
                  <tr key={d.division}
                    onClick={() => setExpandRow(expandRow === i ? null : i)}
                    style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', background: i % 2 === 0 ? '#fff' : '#fdfcff' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#a78bfa', transition: 'transform 0.2s', display:'inline-block', transform: expandRow===i ? 'rotate(90deg)' : 'none' }}>
                        <ChevronRight size={13} />
                      </span>
                      {d.division}
                    </td>
                    <td style={{ padding: '11px 16px', fontWeight: 600, color: '#475569' }}>{currency} {actual.toFixed(1)}M</td>
                    <td style={{ padding: '11px 16px', color: '#475569' }}>{currency} {(d.gp * rate).toFixed(1)}M</td>
                    <td style={{ padding: '11px 16px', color: '#475569' }}>{d.gpPct}</td>
                    <td style={{ padding: '11px 16px', color: '#94a3b8' }}>{currency} {cmpRev.toFixed(1)}M</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ color: isPos ? '#10b981' : '#f43f5e', fontWeight: 700 }}>
                        {isPos ? '+' : ''}{varAmt}M ({isPos ? '+' : ''}{varPctV}%)
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ color: d.yoy.startsWith('+') ? '#10b981' : '#f43f5e', fontWeight: 700 }}>{d.yoy}</span>
                    </td>
                  </tr>
                  {expandRow === i && (
                    <tr key={`${d.division}-exp`}>
                      <td colSpan={7} style={{ padding: '0 16px 16px 44px', background: '#fdfcff' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, paddingTop: 12 }}>
                          {['Salesman Revenue', 'Customer Exposure', 'AR Outstanding', 'Overdue %'].map((lbl, j) => (
                            <div key={lbl} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{lbl}</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>
                                {j === 3 ? `${Math.round(Math.random()*20+5)}%` : `${currency} ${(actual * [0.6, 0.25, 0.18, 0.04][j]).toFixed(1)}M`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */
function PLKPICard({ label, value, varPct, sub, cmpValue, extra, color }) {
  const positive = parseFloat(varPct) >= 0;
  return (
    <div className="card" style={{ padding: '20px 22px', position: 'relative', overflow: 'hidden', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', marginBottom: 4 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', fontWeight: 700 }}>
        {positive ? <ArrowUp size={12} style={{ color: '#10b981' }} /> : <ArrowDown size={12} style={{ color: '#f43f5e' }} />}
        <span style={{ color: positive ? '#10b981' : '#f43f5e' }}>{Math.abs(varPct)}%</span>
        <span style={{ color: '#94a3b8', fontWeight: 400 }}>{sub}</span>
      </div>
      {cmpValue && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f1f5f9', fontSize: '0.68rem', color: '#94a3b8' }}>
          {sub}: <span style={{ fontWeight: 700, color: '#64748b' }}>{cmpValue}</span>
        </div>
      )}
      {extra && <div style={{ marginTop: 4, fontSize: '0.68rem', color: '#94a3b8' }}>{extra}</div>}
    </div>
  );
}

function LegendDot({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: dashed ? 16 : 8, height: 2, background: dashed ? 'transparent' : color, borderTop: dashed ? `2px dashed ${color}` : 'none', borderRadius: 2 }} />
      {!dashed && <div style={{ display: 'none' }} />}
      <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#64748b' }}>{label}</span>
    </div>
  );
}
