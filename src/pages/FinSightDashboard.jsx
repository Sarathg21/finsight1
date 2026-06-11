import { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import KPICard from '../components/ui/KPICard';
import SparklineKPICard from '../components/ui/SparklineKPICard';
import ChartLegend from '../components/ui/ChartLegend';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { C, CHART_COLORS, TOOLTIP_STYLE } from '../utils/theme';

/* ─── Color Palette ─────────────────────────────────────────── */
const NAVY  = C.navy;
const GREEN = C.emerald;
const BLUE_MED   = C.primary;
const BLUE_LIGHT = '#93c5fd';

/* ─── Revenue Trend Data ──────────────────────────────────────── */
const REVENUE_TREND = [
  { month: 'Nov', fy2324: 160, fy2425: 120 },
  { month: 'Dec', fy2324: 135, fy2425: 110 },
  { month: 'Jan', fy2324: 155, fy2425: 140 },
  { month: 'Feb', fy2324: 130, fy2425: 170 },
  { month: 'Mar', fy2324: 145, fy2425: 155 },
  { month: 'Apr', fy2324: 160, fy2425: 180 },
];

const PROFIT_TREND = [
  { month: 'Nov', netFY2324: 7,  netFY2425: 10 },
  { month: 'Dec', netFY2324: 6,  netFY2425: 9  },
  { month: 'Jan', netFY2324: 9,  netFY2425: 13 },
  { month: 'Feb', netFY2324: 11, netFY2425: 15 },
  { month: 'Mar', netFY2324: 12, netFY2425: 16 },
  { month: 'Apr', netFY2324: 10, netFY2425: 18 },
];

const GEO_DATA = [
  { name: 'India',         value: 45.2, color: C.purple  },
  { name: 'North America', value: 22.1, color: C.amber   },
  { name: 'Europe',        value: 16.8, color: C.cyan    },
  { name: 'Asia Pacific',  value: 10.6, color: C.emerald },
  { name: 'Others',        value: 5.3,  color: C.muted   },
];

const FIN_SUMMARY = [
  { name: 'Total Revenue',   curMonth: 125.75, prevMonth: 112.40, ytdCur: 1215.60, ytdPrev: 1045.32, yoy: 16.29,  yoyPos: true  },
  { name: 'Gross Profit',    curMonth:  28.35, prevMonth:  24.21, ytdCur:  273.55, ytdPrev:  234.20, yoy: 16.80,  yoyPos: true  },
  { name: 'EBITDA',          curMonth:  18.42, prevMonth:  15.98, ytdCur:  164.25, ytdPrev:  142.68, yoy: 15.13,  yoyPos: true  },
  { name: 'EBIT',            curMonth:  14.25, prevMonth:  12.40, ytdCur:  128.40, ytdPrev:  110.85, yoy: 15.83,  yoyPos: true  },
  { name: 'Net Profit',      curMonth:  10.25, prevMonth:   8.46, ytdCur:   92.35, ytdPrev:   75.10, yoy: 22.98,  yoyPos: true  },
  { name: 'Working Capital', curMonth:  45.80, prevMonth:  46.75, ytdCur:   45.80, ytdPrev:   46.80, yoy: -2.14,  yoyPos: false },
  { name: 'Current Ratio',   curMonth:   1.86, prevMonth:   1.74, ytdCur:    1.86, ytdPrev:    1.72, yoy:  8.14,  yoyPos: true  },
];

const COLLECTION_EFFICIENCY = 87.45;

export default function FinSightDashboard() {
  const [legalGroup,   setLegalGroup]   = useState('All');
  const [businessUnit, setBusinessUnit] = useState('All');
  const [division,     setDivision]     = useState('All');

  const scale = useMemo(() => {
    const g = ({ All: 1.00, 'Group A': 0.62, 'Group B': 0.38 })[legalGroup]   ?? 1;
    const b = ({ All: 1.00, 'BU 1': 0.35, 'BU 2': 0.28, 'BU 3': 0.37 })[businessUnit] ?? 1;
    const d = ({ All: 1.00, 'Division 1': 0.55, 'Division 2': 0.45 })[division] ?? 1;
    return g * b * d;
  }, [legalGroup, businessUnit, division]);

  const fmtM = base => `AED ${(base * scale).toFixed(2)} M`;
  const fmtP = base => `${(base * scale).toFixed(2)}%`;

  const scaledRevTrend  = useMemo(() => REVENUE_TREND.map(m => ({ ...m, fy2324: +(m.fy2324 * scale).toFixed(1), fy2425: +(m.fy2425 * scale).toFixed(1) })), [scale]);
  const scaledProfTrend = useMemo(() => PROFIT_TREND.map(m => ({ ...m, netFY2324: +(m.netFY2324 * scale).toFixed(1), netFY2425: +(m.netFY2425 * scale).toFixed(1) })), [scale]);
  const scaledFinSummary = useMemo(() => FIN_SUMMARY.map(r => {
    const isRatio = r.name === 'Current Ratio';
    return { ...r,
      curMonth:  isRatio ? r.curMonth  : +(r.curMonth  * scale).toFixed(2),
      prevMonth: isRatio ? r.prevMonth : +(r.prevMonth * scale).toFixed(2),
      ytdCur:    isRatio ? r.ytdCur    : +(r.ytdCur    * scale).toFixed(2),
      ytdPrev:   isRatio ? r.ytdPrev   : +(r.ytdPrev   * scale).toFixed(2),
    };
  }), [scale]);

  return (
    <div className="animate-in">

      {/* ── Page Title ── */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Executive Dashboard</h1>
          <p className="page-header-subtitle">
            Comprehensive overview of your financial performance
          </p>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{
        display: 'flex', flexDirection: 'row', alignItems: 'flex-end',
        gap: 12, flexWrap: 'nowrap', overflowX: 'auto',
        padding: '14px 20px', marginBottom: 20,
        background: 'var(--clr-surface)', border: '1px solid var(--clr-border)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
      }}>
        <FilterField label="Legal Group">
          <select value={legalGroup} onChange={e => setLegalGroup(e.target.value)} className="filter-select" style={{ minWidth: 110 }}>
            {['All', 'Group A', 'Group B'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="Business Unit">
          <select value={businessUnit} onChange={e => setBusinessUnit(e.target.value)} className="filter-select" style={{ minWidth: 110 }}>
            {['All', 'BU 1', 'BU 2', 'BU 3'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="Division">
          <select value={division} onChange={e => setDivision(e.target.value)} className="filter-select" style={{ minWidth: 110 }}>
            {['All', 'Division 1', 'Division 2'].map(o => <option key={o}>{o}</option>)}
          </select>
        </FilterField>
        <FilterField label="From Date">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
            border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)',
            background: 'var(--clr-surface-2)', whiteSpace: 'nowrap',
            fontSize: '0.82rem', color: 'var(--clr-text)', minWidth: 120, cursor: 'pointer',
          }}>
            <span>📅</span><span>01 Apr 2024</span>
          </div>
        </FilterField>
        <FilterField label="To Date">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
            border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)',
            background: 'var(--clr-surface-2)', whiteSpace: 'nowrap',
            fontSize: '0.82rem', color: 'var(--clr-text)', minWidth: 120, cursor: 'pointer',
          }}>
            <span>📅</span><span>30 Apr 2024</span>
          </div>
        </FilterField>
        <div style={{ alignSelf: 'flex-end' }}>
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Apply</button>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--clr-text-dim)', alignSelf: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
          All values in AED
        </div>
      </div>

      {/* ── KPI CARDS ROW 1 ── */}
      <div className="grid-cols-6" style={{ marginBottom: 16 }}>
        {[
          { label: 'Total Revenue',   value: fmtM(125.75), change: '16.86% vs Apr 2023', up: true,  icon: '📊', iconBg: '#e0f2fe' },
          { label: 'Gross Profit',    value: fmtM(28.35),  change: '17.11% vs Apr 2023', up: true,  icon: '💼', iconBg: '#dcfce7' },
          { label: 'EBITDA',          value: fmtM(18.42),  change: '15.45% vs Apr 2023', up: true,  icon: '📈', iconBg: '#ede9fe' },
          { label: 'Net Profit',      value: fmtM(10.25),  change: '23.11% vs Apr 2023', up: true,  icon: '🎯', iconBg: '#fae8ff' },
          { label: 'Working Capital', value: fmtM(45.80),  change: '2.11% vs Apr 2023',  up: false, icon: '🧮', iconBg: '#fef3c7' },
          { label: 'Current Ratio',   value: String(1.86), change: '0.12 vs Apr 2023',   up: true,  icon: '⚖️', iconBg: '#fce7f3' },
        ].map(kpi => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      {/* ── KPI CARDS ROW 2 ── */}
      <div className="grid-cols-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Receivables',         value: fmtM(62.35),  change: '12.44% vs Apr 2023', up: true,  icon: '💳', iconBg: '#fef3c7', data: [10,15,12,18,14,20].map(v=>+(v*scale).toFixed(1)), color: C.amber   },
          { label: 'Overdue Receivables',       value: fmtM(18.75),  change: '8.23% vs Apr 2023',  up: false, icon: '📙', iconBg: '#ffe4e6', data: [18,14,16,12,15,10].map(v=>+(v*scale).toFixed(1)), color: C.rose    },
          { label: 'Cash Collection (MTD)',     value: fmtM(21.40),  change: '19.34% vs Apr 2023', up: true,  icon: '💼', iconBg: '#e0e7ff', data: [5,8,12,9,15,18].map(v=>+(v*scale).toFixed(1)),    color: C.primary },
          { label: 'Bank Facility Utilization', value: fmtP(42.75),  change: '3.56% vs Apr 2023',  up: false, icon: '🏦', iconBg: '#e0f2fe', data: [40,42,45,41,44,43],                               color: C.cyan    },
        ].map(kpi => <SparklineKPICard key={kpi.label} {...kpi} />)}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid-charts" style={{ marginBottom: 20 }}>
        {/* Revenue Trend */}
        <Card title="Revenue Trend (AED M)">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={scaledRevTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line dataKey="fy2324" name="FY 23-24" stroke={NAVY}  strokeWidth={2} dot={{ r: 2.5, fill: NAVY }}  activeDot={{ r: 4 }} />
              <Line dataKey="fy2425" name="FY 24-25" stroke={GREEN} strokeWidth={2} dot={{ r: 2.5, fill: GREEN }} strokeDasharray="4 2" activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
            <ChartLegend color={NAVY}  label="FY 23-24" />
            <ChartLegend color={GREEN} label="FY 24-25" dashed />
          </div>
        </Card>

        {/* Profit Trend */}
        <Card title="Profit Trend (AED M)">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={scaledProfTrend} barGap={2} barCategoryGap="40%" margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="netFY2324" name="Net Profit (FY 23-24)" fill={BLUE_MED}   radius={[3,3,0,0]} barSize={10} />
              <Bar dataKey="netFY2425" name="Net Profit (FY 24-25)" fill={BLUE_LIGHT} radius={[3,3,0,0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
            <ChartLegend color={BLUE_MED}   label="FY 23-24" square />
            <ChartLegend color={BLUE_LIGHT} label="FY 24-25" square />
          </div>
        </Card>

        {/* Revenue by Geography */}
        <Card title="Revenue by Geography">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ResponsiveContainer width={110} height={150}>
              <PieChart>
                <Pie data={GEO_DATA} cx="50%" cy="50%" innerRadius={34} outerRadius={52}
                  dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                  {GEO_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {GEO_DATA.map(g => (
                <div key={g.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: g.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)' }}>{g.name}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--clr-text)' }}>{g.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Collection Efficiency */}
        <Card title="Collection Efficiency">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8 }}>
            <div style={{ position: 'relative' }}>
              <ResponsiveContainer width={140} height={100}>
                <PieChart>
                  <Pie
                    data={[{ value: COLLECTION_EFFICIENCY }, { value: 100 - COLLECTION_EFFICIENCY }]}
                    cx="50%" cy="100%"
                    startAngle={180} endAngle={0}
                    innerRadius={52} outerRadius={68}
                    dataKey="value" stroke="none"
                  >
                    <Cell fill={GREEN} />
                    <Cell fill="var(--clr-surface-2)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--clr-text)' }}>{COLLECTION_EFFICIENCY}%</div>
              </div>
            </div>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--clr-text-dim)', marginTop: 4 }}>
              <span>0%</span><span>100%</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', marginTop: 6 }}>Collection Efficiency</div>
          </div>
        </Card>
      </div>

      {/* ── FINANCIAL SUMMARY TABLE ── */}
      <Card noPadding style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--clr-border)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--clr-text)' }}>
            Financial Summary (AED M)
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Particulars</th>
                <th style={{ textAlign: 'center' }}>Current Month (Apr 2024)</th>
                <th style={{ textAlign: 'center' }}>Previous Month (Mar 2024)</th>
                <th style={{ textAlign: 'center' }}>YTD (Apr 2024)</th>
                <th style={{ textAlign: 'center' }}>YTD (Apr 2023)</th>
                <th style={{ textAlign: 'center' }}>YoY %</th>
              </tr>
            </thead>
            <tbody>
              {scaledFinSummary.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--clr-text)' }}>{row.name}</td>
                  <td style={{ textAlign: 'center' }}>{row.curMonth.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>{row.prevMonth.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>{row.ytdCur.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>{row.ytdPrev.toFixed(2)}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: row.yoyPos ? C.emerald : C.rose }}>
                    {row.yoy.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Footer */}
      <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-dim)', display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
        <span>© 2024 FinSight · FJ Group Finance Suite</span>
        <span>Version 1.0.0</span>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */
function FilterField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 110 }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      {children}
    </div>
  );
}
