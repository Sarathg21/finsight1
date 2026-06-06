import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

/* ─── Color Palette ─────────────────────────────────────────────── */
const NAVY       = '#1a3a6b';
const BLUE_MED   = '#2563eb';
const BLUE_LIGHT = '#93c5fd';
const GREEN      = '#16a34a';

/* ─── Revenue Trend Data ─────────────────────────────────────────── */
const REVENUE_TREND = [
  { month: 'Nov', fy2324: 160, fy2425: 120 },
  { month: 'Dec', fy2324: 135, fy2425: 110 },
  { month: 'Jan', fy2324: 155, fy2425: 140 },
  { month: 'Feb', fy2324: 130, fy2425: 170 },
  { month: 'Mar', fy2324: 145, fy2425: 155 },
  { month: 'Apr', fy2324: 160, fy2425: 180 },
];

/* ─── Profit Trend Data ──────────────────────────────────────────── */
const PROFIT_TREND = [
  { month: 'Nov', netFY2324: 7,  netFY2425: 10 },
  { month: 'Dec', netFY2324: 6,  netFY2425: 9  },
  { month: 'Jan', netFY2324: 9,  netFY2425: 13 },
  { month: 'Feb', netFY2324: 11, netFY2425: 15 },
  { month: 'Mar', netFY2324: 12, netFY2425: 16 },
  { month: 'Apr', netFY2324: 10, netFY2425: 18 },
];

/* ─── Geography Data ─────────────────────────────────────────────── */
const GEO_DATA = [
  { name: 'India',         value: 45.2, color: '#7c3aed' },
  { name: 'North America', value: 22.1, color: '#f97316' },
  { name: 'Europe',        value: 16.8, color: '#06b6d4' },
  { name: 'Asia Pacific',  value: 10.6, color: '#10b981' },
  { name: 'Others',        value: 5.3,  color: '#94a3b8' },
];

/* ─── Financial Summary Table ────────────────────────────────────── */
const FIN_SUMMARY = [
  { name: 'Total Revenue',   curMonth: 125.75, prevMonth: 112.40, ytdCur: 1215.60, ytdPrev: 1045.32, yoy: 16.29,  yoyPos: true  },
  { name: 'Gross Profit',    curMonth:  28.35, prevMonth:  24.21, ytdCur:  273.55, ytdPrev:  234.20, yoy: 16.80,  yoyPos: true  },
  { name: 'EBITDA',          curMonth:  18.42, prevMonth:  15.98, ytdCur:  164.25, ytdPrev:  142.68, yoy: 15.13,  yoyPos: true  },
  { name: 'EBIT',            curMonth:  14.25, prevMonth:  12.40, ytdCur:  128.40, ytdPrev:  110.85, yoy: 15.83,  yoyPos: true  },
  { name: 'Net Profit',      curMonth:  10.25, prevMonth:   8.46, ytdCur:   92.35, ytdPrev:   75.10, yoy: 22.98,  yoyPos: true  },
  { name: 'Working Capital', curMonth:  45.80, prevMonth:  46.75, ytdCur:   45.80, ytdPrev:   46.80, yoy: -2.14,  yoyPos: false },
  { name: 'Current Ratio',   curMonth:   1.86, prevMonth:   1.74, ytdCur:    1.86, ytdPrev:    1.72, yoy:  8.14,  yoyPos: true  },
];

/* ─── KPI Cards data ─────────────────────────────────────────────── */
const KPI_CARDS = [
  { label: 'Total Revenue',   value: 'AED 125.75 M', change: '16.86% vs Apr 2023', up: true,  icon: '📊', iconBg: '#e0f2fe' },
  { label: 'Gross Profit',    value: 'AED 28.35 M',  change: '17.11% vs Apr 2023', up: true,  icon: '💼', iconBg: '#dcfce7' },
  { label: 'EBITDA',          value: 'AED 18.42 M',  change: '15.45% vs Apr 2023', up: true,  icon: '📈', iconBg: '#ede9fe' },
  { label: 'Net Profit',      value: 'AED 10.25 M',  change: '23.11% vs Apr 2023', up: true,  icon: '🎯', iconBg: '#fae8ff' },
  { label: 'Working Capital', value: 'AED 45.80 M',  change: '2.11% vs Apr 2023',  up: false, icon: '🧮', iconBg: '#e0f2fe' },
  { label: 'Current Ratio',   value: '1.86',         change: '0.12 vs Apr 2023',  up: true,  icon: '⚖️', iconBg: '#fce7f3' },
];

/* ─── Row 2 KPI Cards data ────────────────────────────────────────── */
const KPI_CARDS_ROW_2 = [
  { label: 'Total Receivables',       value: 'AED 62.35 M', change: '12.44% vs Apr 2023', up: true,  icon: '💳', iconBg: '#fef3c7', data: [10, 15, 12, 18, 14, 20], color: '#f59e0b' },
  { label: 'Overdue Receivables',     value: 'AED 18.75 M', change: '8.23% vs Apr 2023',  up: false, icon: '📙', iconBg: '#ffe4e6', data: [18, 14, 16, 12, 15, 10], color: '#f43f5e' },
  { label: 'Cash Collection (MTD)',   value: 'AED 21.40 M', change: '19.34% vs Apr 2023', up: true,  icon: '💼', iconBg: '#e0e7ff', data: [5, 8, 12, 9, 15, 18], color: '#3b82f6' },
  { label: 'Bank Facility Utilization', value: '42.75%',     change: '3.56% vs Apr 2023',  up: false, icon: '🏦', iconBg: '#e0f2fe', data: [40, 42, 45, 41, 44, 43], color: '#0ea5e9' },
];

/* ─── Collection Efficiency Data ─────────────────────────────────── */
const COLLECTION_EFFICIENCY = 87.45;


export default function FinSightDashboard() {
  const [legalGroup,   setLegalGroup]   = useState('All');
  const [businessUnit, setBusinessUnit] = useState('All');
  const [division,     setDivision]     = useState('All');

  return (
    <div className="animate-in" style={{
      padding: '20px 24px',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: '#f4f6fb',
      minHeight: '100%',
    }}>

      {/* ── Page Title ── */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a3a6b', margin: 0 }}>
          Executive Dashboard
        </h1>
        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0' }}>
          Get a comprehensive overview of your financial performance
        </p>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{
        background: '#fff', borderRadius: 10,
        border: '1px solid #e2e8f0',
        padding: '12px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <FilterField label="Legal Group">
          <FilterDropdown value={legalGroup} onChange={setLegalGroup} options={['All', 'Group A', 'Group B']} />
        </FilterField>
        <FilterField label="Business Unit">
          <FilterDropdown value={businessUnit} onChange={setBusinessUnit} options={['All', 'BU 1', 'BU 2', 'BU 3']} />
        </FilterField>
        <FilterField label="Division">
          <FilterDropdown value={division} onChange={setDivision} options={['All', 'Division 1', 'Division 2']} />
        </FilterField>
        <FilterField label="From Date">
          <div style={dateInputStyle}>
            <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 500 }}>01 Apr 2024</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📅</span>
          </div>
        </FilterField>
        <FilterField label="To Date">
          <div style={dateInputStyle}>
            <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 500 }}>30 Apr 2024</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>📅</span>
          </div>
        </FilterField>
        <button style={{
          padding: '7px 22px', background: '#1a3a6b', color: '#fff',
          border: 'none', borderRadius: 6, fontWeight: 700,
          fontSize: '0.8rem', cursor: 'pointer', alignSelf: 'flex-end',
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#1e4d9b'}
          onMouseLeave={e => e.currentTarget.style.background = '#1a3a6b'}
        >Apply</button>
        <div style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: '0.68rem', color: '#94a3b8' }}>
          All values are in AED
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 12, marginBottom: 12,
      }}>
        {KPI_CARDS.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      {/* ── KPI CARDS ROW 2 ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 16,
      }}>
        {KPI_CARDS_ROW_2.map(kpi => <SparklineKPICard key={kpi.label} {...kpi} />)}
      </div>

      {/* ── CHARTS ROW ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr',
        gap: 14, marginBottom: 16,
      }}>
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend (AED M)">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={REVENUE_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 10 }}
                labelStyle={{ fontWeight: 700, color: '#1a3a6b' }}
              />
              <Line dataKey="fy2324" name="FY 23-24" stroke={NAVY}  strokeWidth={2} dot={{ r: 3, fill: NAVY }}  activeDot={{ r: 4 }} />
              <Line dataKey="fy2425" name="FY 24-25" stroke={GREEN} strokeWidth={2} dot={{ r: 3, fill: GREEN }} strokeDasharray="4 2" activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            <ChartLegend color={NAVY}  label="FY 23-24" />
            <ChartLegend color={GREEN} label="FY 24-25" dashed />
          </div>
        </ChartCard>

        {/* Profit Trend */}
        <ChartCard title="Profit Trend (AED M)">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={PROFIT_TREND} barGap={2} barCategoryGap="40%" margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 10 }}
                labelStyle={{ fontWeight: 700, color: '#1a3a6b' }}
              />
              <Bar dataKey="netFY2324" name="Net Profit (FY 23-24)" fill={BLUE_MED}   radius={[3, 3, 0, 0]} barSize={10} />
              <Bar dataKey="netFY2425" name="Net Profit (FY 24-25)" fill={BLUE_LIGHT} radius={[3, 3, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            <ChartLegend color={BLUE_MED}   label="Net Profit (FY 23-24)" square />
            <ChartLegend color={BLUE_LIGHT} label="Net Profit (FY 24-25)" square />
          </div>
        </ChartCard>

        {/* Revenue by Geography */}
        <ChartCard title="Revenue by Geography (AED M)">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ResponsiveContainer width={120} height={160}>
              <PieChart>
                <Pie
                  data={GEO_DATA}
                  cx="50%" cy="50%"
                  innerRadius={38} outerRadius={58}
                  dataKey="value"
                  startAngle={90} endAngle={-270}
                  stroke="none"
                >
                  {GEO_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 10 }}
                  formatter={(val) => [`${val}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {GEO_DATA.map(g => (
                <div key={g.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.68rem', color: '#475569' }}>{g.name}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a3a6b' }}>{g.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Collection Efficiency */}
        <ChartCard title="Collection Efficiency (%)">
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: 10 }}>
            <ResponsiveContainer width={180} height={120}>
              <PieChart>
                <Pie
                  data={[{ value: COLLECTION_EFFICIENCY }, { value: 100 - COLLECTION_EFFICIENCY }]}
                  cx="50%" cy="100%"
                  startAngle={180} endAngle={0}
                  innerRadius={60} outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#16a34a" />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', bottom: 30, textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a3a6b' }}>{COLLECTION_EFFICIENCY}%</div>
              <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Collection Efficiency</div>
            </div>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '0 20px', fontSize: '0.6rem', color: '#94a3b8', marginTop: -20 }}>
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── FINANCIAL SUMMARY TABLE ── */}
      <div style={{
        background: '#fff', borderRadius: 10,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        marginBottom: 20,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid #e2e8f0',
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a3a6b' }}>
            Financial Summary (AED M)
          </span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem' }}>⋮</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={th}>Particulars</th>
                <th style={{ ...th, textAlign: 'center' }}>Current Month (Apr 2024)</th>
                <th style={{ ...th, textAlign: 'center' }}>Previous Month (Mar 2024)</th>
                <th style={{ ...th, textAlign: 'center' }}>YTD (Apr 2024)</th>
                <th style={{ ...th, textAlign: 'center' }}>YTD (Apr 2023)</th>
                <th style={{ ...th, textAlign: 'center' }}>YoY %</th>
              </tr>
            </thead>
            <tbody>
              {FIN_SUMMARY.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid #f1f5f9', background: '#fff', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ ...td, fontWeight: 600, color: '#1a3a6b' }}>{row.name}</td>
                  <td style={{ ...td, textAlign: 'center', color: '#334155' }}>{row.curMonth.toFixed(2)}</td>
                  <td style={{ ...td, textAlign: 'center', color: '#334155' }}>{row.prevMonth.toFixed(2)}</td>
                  <td style={{ ...td, textAlign: 'center', color: '#334155' }}>{row.ytdCur.toFixed(2)}</td>
                  <td style={{ ...td, textAlign: 'center', color: '#334155' }}>{row.ytdPrev.toFixed(2)}</td>
                  <td style={{ ...td, textAlign: 'center', fontWeight: 700, color: row.yoyPos ? '#16a34a' : '#dc2626' }}>
                    {row.yoy.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
        <span>© 2024 FinSight. All rights reserved.</span>
        <span>Version 1.0.0</span>
      </div>

    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

function FilterField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 110 }}>
      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{label}</span>
      {children}
    </div>
  );
}

function FilterDropdown({ value, onChange, options }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: 'none', padding: '5px 28px 5px 10px',
          fontSize: '0.78rem', fontWeight: 500, color: '#334155',
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 6, cursor: 'pointer', outline: 'none', width: '100%',
        }}
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.6rem', color: '#94a3b8' }}>▼</span>
    </div>
  );
}

function KPICard({ label, value, change, up, icon, iconBg }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: 10,
        border: '1px solid #e2e8f0',
        padding: '14px 14px 12px',
        boxShadow: hover ? '0 4px 16px rgba(26,58,107,0.10)' : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        transform: hover ? 'translateY(-1px)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 12, right: 12,
        width: 34, height: 34, borderRadius: 8,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem',
      }}>{icon}</div>
      <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginBottom: 6, paddingRight: 40 }}>{label}</div>
      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a3a6b', marginBottom: 6, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: up ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 3 }}>
        <span>{up ? '↑' : '↓'}</span>
        <span>{change}</span>
      </div>
    </div>
  );
}

function SparklineKPICard({ label, value, change, up, icon, iconBg, data, color }) {
  const [hover, setHover] = useState(false);
  const chartData = data.map((v, i) => ({ name: i, value: v }));
  
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: 10,
        border: '1px solid #e2e8f0',
        padding: '14px 14px 12px',
        boxShadow: hover ? '0 4px 16px rgba(26,58,107,0.10)' : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        transform: hover ? 'translateY(-1px)' : 'none',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', marginBottom: 8,
          }}>{icon}</div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a3a6b', marginTop: 4 }}>{value}</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: up ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 3 }}>
          <span>{up ? '▲' : '▼'}</span>
          <span>{change}</span>
        </div>
        
        <div style={{ width: 60, height: 25 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10,
      border: '1px solid #e2e8f0',
      padding: '14px 16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1a3a6b' }}>{title}</span>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem' }}>⋮</button>
      </div>
      {children}
    </div>
  );
}

function ChartLegend({ color, label, dashed, square }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {square ? (
        <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
      ) : (
        <span style={{
          width: 16, height: 2,
          background: dashed ? 'transparent' : color,
          borderTop: dashed ? `2px dashed ${color}` : 'none',
          display: 'inline-block',
        }} />
      )}
      <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{label}</span>
    </div>
  );
}

/* ── Shared styles ─────────────────────────────────────────────── */
const dateInputStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '5px 10px', border: '1px solid #e2e8f0',
  borderRadius: 6, background: '#fff', minWidth: 110, gap: 6,
};

const th = {
  padding: '10px 14px', textAlign: 'left',
  fontSize: '0.68rem', fontWeight: 700, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '0.04em',
  borderBottom: '1px solid #e2e8f0',
  whiteSpace: 'nowrap',
};

const td = {
  padding: '9px 14px',
  fontSize: '0.78rem', color: '#334155',
};
