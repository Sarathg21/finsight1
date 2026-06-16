import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { C } from '../utils/theme';

/* ─── Mock Data ──────────────────────────────────────────────────── */
const TREND_DATA = [
  { month: 'Nov 2023', assets: 1050, liabilities: 600, equity: 450 },
  { month: 'Dec 2023', assets: 1100, liabilities: 620, equity: 480 },
  { month: 'Jan 2024', assets: 1080, liabilities: 610, equity: 470 },
  { month: 'Feb 2024', assets: 1150, liabilities: 640, equity: 510 },
  { month: 'Mar 2024', assets: 1192, liabilities: 651, equity: 485 },
  { month: 'Apr 2024', assets: 1246, liabilities: 678, equity: 567 },
];

const ASSETS_COMPOSITION = [
  { name: 'Current Assets',     value: 479.50, pct: '38.2%', color: '#6366f1' },
  { name: 'Non Current Assets', value: 770.10, pct: '61.8%', color: '#10b981' },
];

const LIAB_COMPOSITION = [
  { name: 'Current Liabilities',     value: 287.00, pct: '42.3%', color: '#7c3aed' },
  { name: 'Non Current Liabilities', value: 391.45, pct: '57.7%', color: '#f59e0b' },
];

const ASSETS_TABLE = {
  sections: [
    {
      title: 'I. Current Assets',
      rows: [
        { label: 'Cash & Bank Balances',   cur: 105.40, prev: 98.60,  var: 6.80,  varPct: '6.90%',  highlight: true },
        { label: 'Trade Receivables',      cur: 182.30, prev: 172.10, var: 10.20, varPct: '5.93%',  highlight: true },
        { label: 'Inventories',            cur: 142.20, prev: 138.40, var: 3.80,  varPct: '2.75%' },
        { label: 'Loans & Advances',       cur: 25.60,  prev: 24.70,  var: 0.90,  varPct: '3.64%' },
        { label: 'Other Current Assets',   cur: 20.00,  prev: 21.40,  var: -1.40, varPct: '-6.54%', neg: true },
      ],
      total: { label: '', cur: 475.50, prev: 455.20, var: 20.30, varPct: '4.46%' },
    },
    {
      title: 'II. Non Current Assets',
      rows: [
        { label: 'Property, Plant & Equipment', cur: 420.70, prev: 401.60, var: 19.10, varPct: '4.75%' },
        { label: 'Intangible Assets',            cur: 45.30,  prev: 44.00,  var: 1.30,  varPct: '2.95%' },
        { label: 'Capital Work in Progress',     cur: 120.40, prev: 116.80, var: 3.60,  varPct: '3.08%' },
        { label: 'Investments',                  cur: 98.60,  prev: 91.80,  var: 6.90,  varPct: '7.53%',  highlight: true },
        { label: 'Other Non Current Assets',     cur: 85.10,  prev: 82.50,  var: 2.60,  varPct: '3.15%' },
      ],
      total: { label: '', cur: 770.10, prev: 736.60, var: 33.50, varPct: '4.55%' },
    },
  ],
  grandTotal: { label: 'Total Assets', cur: 1245.60, prev: 1191.80, var: 53.80, varPct: '4.51%' },
};

const LIAB_TABLE = {
  sections: [
    {
      title: 'I. Current Liabilities',
      rows: [
        { label: 'Trade Payables',             cur: 145.30, prev: 137.80, var: 7.50,  varPct: '5.45%' },
        { label: 'Short Term Borrowings',      cur: 78.60,  prev: 71.20,  var: 7.40,  varPct: '10.39%', highlight: true },
        { label: 'Other Current Liabilities',  cur: 42.40,  prev: 41.30,  var: 1.10,  varPct: '2.66%' },
        { label: 'Provisions',                 cur: 20.70,  prev: 21.30,  var: -0.60, varPct: '-2.82%', neg: true },
      ],
      total: { label: '', cur: 287.00, prev: 271.60, var: 15.40, varPct: '5.67%' },
    },
    {
      title: 'II. Non Current Liabilities',
      rows: [
        { label: 'Long Term Borrowings',           cur: 240.10, prev: 232.20, var: 7.90, varPct: '3.40%' },
        { label: 'Deferred Tax Liabilities',       cur: 58.70,  prev: 56.10,  var: 2.60, varPct: '4.63%' },
        { label: 'Other Non Current Liabilities',  cur: 48.65,  prev: 47.40,  var: 1.45, varPct: '3.07%' },
        { label: 'Provisions',                     cur: 43.00,  prev: 44.00,  var: -1.00,varPct: '-2.27%', neg: true },
      ],
      total: { label: '', cur: 391.45, prev: 379.50, var: 11.95, varPct: '3.15%' },
    },
  ],
  grandTotal: { label: 'Total Liabilities', cur: 678.45, prev: 651.10, var: 27.35, varPct: '4.20%' },
};

const EQUITY_TABLE = {
  rows: [
    { label: 'Share Capital',               cur: 150.00, prev: 150.00, var: 0.00,  varPct: '0.00%' },
    { label: 'Reserves & Surplus',          cur: 347.80, prev: 324.20, var: 23.60, varPct: '7.28%', highlight: true },
    { label: 'Other Comprehensive Income',  cur: 12.35,  prev: 10.80,  var: 1.55,  varPct: '14.35%', highlight: true },
  ],
  total: { label: 'Total Equity', cur: 510.15, prev: 485.00, var: 25.15, varPct: '5.18%' },
  grandTotal: { label: 'Total Equity & Liabilities', cur: 1245.60, prev: 1191.80, var: 53.80, varPct: '4.51%' },
};

/* ─── Format helper ─────────────────────────────────────────────── */
const fmt = (n) => n.toFixed(2);

/* ─── KPI Card ──────────────────────────────────────────────────── */
function KpiCard({ icon, label, value, change, changeLabel, color, iconBg, borderColor, hideSparkline }) {
  const [hover, setHover] = useState(false);
  const accent = color || '#2563eb';

  // Format spark points for SVG polyline
  const sparkPts = [30, 45, 38, 55, 48, 65, 58, 80];
  const max = Math.max(...sparkPts), min = Math.min(...sparkPts);
  const W = 110, H = 16;
  const pointsData = sparkPts.map((v, i) => {
    const x = (i / (sparkPts.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * (H - 2) - 1;
    return { x, y };
  });
  const svgPoints = pointsData.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1, minWidth: 145,
        background: `linear-gradient(145deg, #fff 0%, ${iconBg} 50%, ${accent}15 100%)`,
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: hover ? `0 8px 24px ${accent}20` : '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.04)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hover ? 'translateY(-2px)' : 'none',
        display: 'flex', 
        alignItems: 'center', 
        gap: 12,
        overflow: 'hidden', 
        position: 'relative',
        minHeight: 82,
      }}
    >
      {/* Left: Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: accent, fontSize: '1.2rem',
      }}>
        {icon}
      </div>

      {/* Right: Text Stack + Sparkline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1, justifyContent: 'center' }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, color: accent,
          lineHeight: 1.2,
          whiteSpace: 'nowrap'
        }}>
          {label}
        </span>
        
        <div style={{
          fontSize: '1.05rem',
          fontWeight: 800, color: '#0f172a', lineHeight: 1.1,
          letterSpacing: '-0.02em',
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word',
          marginTop: 1,
        }}>
          {value.includes(' : ') ? value : `₹ ${value} Cr`}
        </div>

        {(change || changeLabel) && (
          <div style={{
            fontSize: '0.62rem', fontWeight: 600, color: '#64748b',
            lineHeight: 1.1, marginTop: 1,
            whiteSpace: 'nowrap'
          }}>
            {change && <span style={{ color: !change?.toString().startsWith('-') ? '#16a34a' : '#dc2626', marginRight: 3 }}>
              {!change?.toString().startsWith('-') ? '▲' : '▼'} {change.replace('-', '')}
            </span>}
            {changeLabel}
          </div>
        )}

        {/* Sparkline at bottom */}
        {!hideSparkline && (
          <div style={{ marginTop: 6 }}>
            <svg width="100%" height={H} preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
              <polyline
                points={svgPoints}
                fill="none"
                stroke={borderColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pointsData.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={1.5} fill={borderColor} />
              ))}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Mini Sparkline for KPI ────────────────────────────────────── */
function MiniLine({ color }) {
  const pts = [40, 55, 48, 62, 70, 65, 80];
  const max = Math.max(...pts), min = Math.min(...pts);
  const w = 80, h = 28;
  const points = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Custom Donut label ────────────────────────────────────────── */
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700 }}>
      {(percent * 100).toFixed(1)}%
    </text>
  );
};

/* ─── Donut Card ─────────────────────────────────────────────────── */
function DonutCard({ title, data, total, totalLabel }) {
  const [hovered, setHovered] = useState(null);
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(0,0,0,0.09)' }}
      style={{
        flex: 1,
        background: '#fff', borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.05)',
        padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'box-shadow 0.3s',
      }}
    >
      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: C.navy }}>
        {title} <span style={{ fontSize: '0.70rem', fontWeight: 500, color: C.slate }}>(₹ Cr)</span>
        <span style={{ marginLeft: 6, fontSize: '0.65rem', color: C.muted, cursor: 'help' }}>ⓘ</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          <PieChart width={160} height={160}>
            <Pie
              data={data}
              cx={80} cy={80}
              innerRadius={50} outerRadius={75}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
              onMouseEnter={(_, i) => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color}
                  opacity={hovered === null || hovered === i ? 1 : 0.55}
                  style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                />
              ))}
            </Pie>
          </PieChart>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '0.60rem', color: C.slate, fontWeight: 600 }}>Total</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 900, color: C.navy, lineHeight: 1.2 }}>
              {totalLabel}
            </div>
            <div style={{ fontSize: '0.55rem', color: C.muted }}>Cr</div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.map((d, i) => (
            <div key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                opacity: hovered === null || hovered === i ? 1 : 0.5,
                transition: 'opacity 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: '0.71rem', fontWeight: 600, color: C.navy }}>{d.name}</div>
                <div style={{ fontSize: '0.69rem', color: C.slate }}>
                  {d.pct} <span style={{ color: C.muted }}>({d.value.toFixed(2)})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
function TableSection({ section }) {
  return (
    <>
      <tr>
        <td colSpan={5} style={{
          padding: '6px 8px 4px',
          fontSize: '0.70rem', fontWeight: 800,
          color: '#1e3a8a',
          background: '#eff6ff',
          borderTop: '1px solid #dbeafe',
        }}>{section.title}</td>
      </tr>
      {section.rows.map((row, i) => (
        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
          <td style={{ padding: '4px 6px 4px 14px', fontSize: '0.71rem', color: '#334155', wordBreak: 'break-word' }}>
            {row.label}
          </td>
          <td style={{ padding: '4px 6px', fontSize: '0.71rem', fontWeight: 600, color: C.navy, textAlign: 'right', whiteSpace: 'nowrap' }}>
            {fmt(row.cur)}
          </td>
          <td style={{ padding: '4px 6px', fontSize: '0.71rem', color: '#64748b', textAlign: 'right', whiteSpace: 'nowrap' }}>
            {fmt(row.prev)}
          </td>
          <td style={{ padding: '4px 6px', fontSize: '0.71rem', textAlign: 'right', whiteSpace: 'nowrap', color: row.neg ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
            {fmt(Math.abs(row.var))}
          </td>
          <td style={{ padding: '4px 6px', fontSize: '0.71rem', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 700,
            color: row.neg ? '#dc2626' : (row.highlight ? '#16a34a' : '#64748b'),
          }}>
            {row.varPct}
          </td>
        </tr>
      ))}
      {section.total && (
        <tr style={{ background: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
          <td style={{ padding: '5px 6px 5px 12px', fontSize: '0.71rem', fontWeight: 700, color: C.navy }}>
            {section.title.replace('I. ', '').replace('II. ', '')} Total
          </td>
          <td style={{ padding: '5px 6px', fontSize: '0.71rem', fontWeight: 800, color: C.navy, textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(section.total.cur)}</td>
          <td style={{ padding: '5px 6px', fontSize: '0.71rem', fontWeight: 600, color: '#64748b', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(section.total.prev)}</td>
          <td style={{ padding: '5px 6px', fontSize: '0.71rem', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap', color: section.total.var < 0 ? '#dc2626' : '#16a34a' }}>
            {fmt(Math.abs(section.total.var))}
          </td>
          <td style={{ padding: '5px 6px', fontSize: '0.71rem', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap', color: '#16a34a' }}>
            {section.total.varPct}
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── Balance Sheet Table Card ───────────────────────────────────── */
function BSTableCard({ title, sections, grandTotal, accentColor }) {
  return (
    <motion.div
      whileHover={{ boxShadow: '0 10px 28px rgba(0,0,0,0.08)' }}
      style={{
        flex: 1, minWidth: 0,
        background: '#fff', borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Title bar */}
      <div style={{
        padding: '10px 12px 8px',
        background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)`,
        borderBottom: `2px solid ${accentColor}30`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 4, height: 16, borderRadius: 2, background: accentColor }} />
        <span style={{ fontSize: '0.80rem', fontWeight: 800, color: C.navy }}>{title}</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 500, color: C.slate, marginLeft: 2 }}>(₹ Cr)</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '30%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '18%' }} />
          <col style={{ width: '18%' }} />
        </colgroup>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {['Particulars', '30 Apr\n2024', '31 Mar\n2024', 'Var\n(₹ Cr)', 'Var\n(%)'].map((h, i) => (
              <th key={i} style={{
                padding: '7px 6px',
                fontSize: '0.67rem', fontWeight: 800,
                color: '#1e3a8a',
                textAlign: i === 0 ? 'left' : 'right',
                borderBottom: '2px solid #e2e8f0',
                whiteSpace: 'pre-line',
                lineHeight: 1.35,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((section, i) => (
            <TableSection key={i} section={section} />
          ))}
        </tbody>
      </table>

      {/* spacer to push grand total to bottom */}
      <div style={{ flex: 1 }} />

      {/* Grand Total */}
      <div style={{
        background: `linear-gradient(90deg, ${accentColor}15, ${accentColor}05)`,
        borderTop: '2px solid #e2e8f0',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '30%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ padding: '6px 6px 6px 10px', fontSize: '0.72rem', fontWeight: 900, color: C.navy }}>{grandTotal.label}</td>
              <td style={{ padding: '6px 6px', fontSize: '0.72rem', fontWeight: 900, color: accentColor, textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(grandTotal.cur)}</td>
              <td style={{ padding: '6px 6px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(grandTotal.prev)}</td>
              <td style={{ padding: '6px 6px', fontSize: '0.72rem', fontWeight: 800, textAlign: 'right', whiteSpace: 'nowrap', color: '#16a34a' }}>{fmt(grandTotal.var)}</td>
              <td style={{ padding: '6px 6px', fontSize: '0.72rem', fontWeight: 800, textAlign: 'right', whiteSpace: 'nowrap', color: '#16a34a' }}>{grandTotal.varPct}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ─── Equity Table Card ──────────────────────────────────────────── */
function EquityCard() {
  const eq = EQUITY_TABLE;
  return (
    <motion.div
      whileHover={{ boxShadow: '0 10px 28px rgba(0,0,0,0.08)' }}
      style={{
        flex: 1, minWidth: 0,
        background: '#fff', borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        padding: '10px 12px 8px',
        background: 'linear-gradient(135deg, #10b98110, #10b98105)',
        borderBottom: '2px solid #10b98130',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 4, height: 16, borderRadius: 2, background: '#10b981' }} />
        <span style={{ fontSize: '0.80rem', fontWeight: 800, color: C.navy }}>Equity</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 500, color: C.slate, marginLeft: 2 }}>(₹ Cr)</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '30%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '18%' }} />
          <col style={{ width: '18%' }} />
        </colgroup>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {['Particulars', '30 Apr\n2024', '31 Mar\n2024', 'Var\n(₹ Cr)', 'Var\n(%)'].map((h, i) => (
              <th key={i} style={{
                padding: '7px 6px',
                fontSize: '0.67rem', fontWeight: 800, color: '#1e3a8a',
                textAlign: i === 0 ? 'left' : 'right',
                borderBottom: '2px solid #e2e8f0',
                whiteSpace: 'pre-line',
                lineHeight: 1.35,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {eq.rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '16px 6px 16px 10px', fontSize: '0.71rem', color: '#334155', wordBreak: 'break-word' }}>{row.label}</td>
              <td style={{ padding: '16px 6px', fontSize: '0.71rem', fontWeight: 600, color: C.navy, textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(row.cur)}</td>
              <td style={{ padding: '16px 6px', fontSize: '0.71rem', color: '#64748b', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(row.prev)}</td>
              <td style={{ padding: '16px 6px', fontSize: '0.71rem', textAlign: 'right', whiteSpace: 'nowrap', color: row.var === 0 ? C.muted : '#16a34a', fontWeight: 600 }}>{fmt(row.var)}</td>
              <td style={{ padding: '16px 6px', fontSize: '0.71rem', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 700,
                color: row.highlight ? '#16a34a' : '#64748b',
              }}>{row.varPct}</td>
            </tr>
          ))}
          {/* Total Equity row */}
          <tr style={{ background: '#f0fdf4', borderTop: '1px solid #d1fae5' }}>
            <td style={{ padding: '16px 6px 16px 10px', fontSize: '0.71rem', fontWeight: 800, color: C.navy }}>{eq.total.label}</td>
            <td style={{ padding: '16px 6px', fontSize: '0.71rem', fontWeight: 800, color: '#10b981', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(eq.total.cur)}</td>
            <td style={{ padding: '16px 6px', fontSize: '0.71rem', fontWeight: 600, color: '#64748b', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(eq.total.prev)}</td>
            <td style={{ padding: '16px 6px', fontSize: '0.71rem', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap', color: '#16a34a' }}>{fmt(eq.total.var)}</td>
            <td style={{ padding: '16px 6px', fontSize: '0.71rem', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap', color: '#16a34a' }}>{eq.total.varPct}</td>
          </tr>
        </tbody>
      </table>

      {/* spacer + centered banner */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
        <div style={{
          width: '100%',
          padding: '12px 14px',
          background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
          border: '1px solid #d1fae5',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {/* Building icon */}
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#dcfce7', border: '1px solid #bbf7d0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>

          {/* Text — centred */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '0.71rem', fontWeight: 800, color: '#15803d', lineHeight: 1.3 }}>
              Total Equity represents 40.96% of Total Assets
            </div>
            <div style={{ fontSize: '0.66rem', color: '#16a34a', marginTop: 3 }}>
              vs 40.69% as on 31 Mar 2024
            </div>
          </div>

          {/* Bold trending-up arrow — Lucide TrendingUp style */}
          <div style={{ flexShrink: 0 }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
              stroke="#16a34a" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grand total */}
      <div style={{
        background: 'linear-gradient(90deg, #10b98120, #10b98108)',
        borderTop: '2px solid #e2e8f0',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '30%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ padding: '6px 6px 6px 10px', fontSize: '0.70rem', fontWeight: 900, color: C.navy }}>{eq.grandTotal.label}</td>
              <td style={{ padding: '6px 6px', fontSize: '0.70rem', fontWeight: 900, color: '#10b981', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(eq.grandTotal.cur)}</td>
              <td style={{ padding: '6px 6px', fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmt(eq.grandTotal.prev)}</td>
              <td style={{ padding: '6px 6px', fontSize: '0.70rem', fontWeight: 800, textAlign: 'right', whiteSpace: 'nowrap', color: '#16a34a' }}>{fmt(eq.grandTotal.var)}</td>
              <td style={{ padding: '6px 6px', fontSize: '0.70rem', fontWeight: 800, textAlign: 'right', whiteSpace: 'nowrap', color: '#16a34a' }}>{eq.grandTotal.varPct}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ─── Custom Tooltip ─────────────────────────────────────────────── */
function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      border: '1px solid rgba(0,0,0,0.07)',
      fontSize: '0.75rem',
    }}>
      <div style={{ fontWeight: 800, color: C.navy, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ color: C.slate }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: C.navy }}>₹ {p.value.toFixed(0)} Cr</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Filter Bar ─────────────────────────────────────────────────── */
function FilterSelect({ label, options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 100 }}>
      <label style={{ fontSize: '0.68rem', fontWeight: 700, color: C.slate, letterSpacing: '0.01em' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: '6px 10px',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          fontSize: '0.78rem',
          color: C.navy,
          background: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          paddingRight: 28,
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function BalanceSheet() {
  const [filters, setFilters] = useState({
    legalGroup: 'FJ Group (Consolidated)',
    legalEntity: 'All',
    parentDivision: 'All',
    subDivision: 'All',
    businessUnit: 'All',
    asOnDate: '30 Apr 2024',
    compareWith: '31 Mar 2024',
  });

  const upd = (k) => (v) => setFilters(f => ({ ...f, [k]: v }));
  const asOnRef    = useRef(null);
  const compareRef = useRef(null);

  const openPicker = (ref) => {
    if (ref.current) {
      try { ref.current.showPicker(); }
      catch { ref.current.click(); }
    }
  };

  return (
    <div style={{ padding: '0 0 32px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Page header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: C.navy, margin: 0, letterSpacing: '-0.02em' }}>
          Balance Sheet
        </h1>
        <p style={{ fontSize: '0.75rem', color: C.slate, margin: '4px 0 0' }}>
          View the financial position of the company across different dimensions.
        </p>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 14 }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8,
          border: '1px solid #e2e8f0', background: '#fff',
          fontSize: '0.76rem', fontWeight: 700, color: C.navy,
          cursor: 'pointer',
        }}>📥 Export</button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8,
          border: '1px solid #e2e8f0', background: '#fff',
          fontSize: '0.76rem', fontWeight: 700, color: C.navy,
          cursor: 'pointer',
        }}>📅 Schedule</button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8,
          border: '1px solid #e2e8f0', background: '#fff',
          fontSize: '0.76rem', fontWeight: 700, color: C.navy,
          cursor: 'pointer',
        }}>⚙ More Filters</button>
        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 34, height: 34, borderRadius: 8,
          border: '1px solid #e2e8f0', background: '#fff',
          cursor: 'pointer', fontSize: '0.9rem',
        }}>↻</button>
      </div>

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: '#fff',
          borderRadius: 12, padding: '14px 18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
          marginBottom: 16,
        }}
      >
        <FilterSelect label="Legal Group"    options={['FJ Group (Consolidated)', 'FJ Group (Standalone)']} value={filters.legalGroup}    onChange={upd('legalGroup')} />
        <FilterSelect label="Legal Entity"   options={['All', 'Entity A', 'Entity B']}                     value={filters.legalEntity}   onChange={upd('legalEntity')} />
        <FilterSelect label="Parent Division" options={['All', 'Division 1', 'Division 2']}                value={filters.parentDivision} onChange={upd('parentDivision')} />
        <FilterSelect label="Sub-Division"   options={['All', 'Sub A', 'Sub B']}                          value={filters.subDivision}   onChange={upd('subDivision')} />
        <FilterSelect label="Business Unit"  options={['All', 'BU 1', 'BU 2']}                            value={filters.businessUnit}  onChange={upd('businessUnit')} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: C.slate, letterSpacing: '0.01em' }}>As On Date</label>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <input
              ref={asOnRef}
              type="date"
              defaultValue="2024-04-30"
              style={{
                padding: '6px 32px 6px 10px',
                border: '1px solid #e2e8f0', borderRadius: 8,
                fontSize: '0.78rem', color: C.navy, fontWeight: 600,
                outline: 'none', width: 140, cursor: 'pointer',
                background: '#fff',
                appearance: 'none', WebkitAppearance: 'none',
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="#6366f1" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              onClick={() => openPicker(asOnRef)}
              style={{ position: 'absolute', right: 9, cursor: 'pointer', zIndex: 1 }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: C.slate, letterSpacing: '0.01em' }}>Compare With</label>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <input
              ref={compareRef}
              type="date"
              defaultValue="2024-03-31"
              style={{
                padding: '6px 32px 6px 10px',
                border: '1px solid #e2e8f0', borderRadius: 8,
                fontSize: '0.78rem', color: C.navy, fontWeight: 600,
                outline: 'none', width: 140, cursor: 'pointer',
                background: '#fff',
                appearance: 'none', WebkitAppearance: 'none',
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="#6366f1" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              onClick={() => openPicker(compareRef)}
              style={{ position: 'absolute', right: 9, cursor: 'pointer', zIndex: 1 }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <button style={{
            padding: '7px 18px', borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff', border: 'none', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
          }}>Apply</button>
          <button style={{
            padding: '7px 14px', borderRadius: 8,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            color: C.slate, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
          }}>Reset</button>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <KpiCard icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="10" width="6" height="12" rx="1" fillOpacity="0.5"/>
            <rect x="12" y="4" width="8" height="18" rx="1"/>
            <rect x="14" y="8" width="4" height="2" fill="#fff"/>
            <rect x="14" y="12" width="4" height="2" fill="#fff"/>
            <rect x="14" y="16" width="4" height="2" fill="#fff"/>
          </svg>
        } label="Total Assets"     value="1,245.60" change="4.35%"    changeLabel="vs 31 Mar 2024" color="#2563eb"  iconBg="#eff6ff"  borderColor="#3b82f6" />
        <KpiCard icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 8h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" fillOpacity="0.5"/>
            <path d="M6 4h12v4H6z"/>
            <circle cx="12" cy="14" r="2" fill="#fff"/>
            <rect x="10" y="18" width="4" height="2" fill="#fff"/>
          </svg>
        } label="Total Liabilities" value="678.45"   change="3.28%"    changeLabel="vs 31 Mar 2024" color="#16a34a"  iconBg="#f0fdf4"  borderColor="#22c55e" />
        <KpiCard icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18h8" />
            <path d="M3 22h18" />
            <path d="M14 22a7 7 0 1 0 0-14h-1" />
            <path d="M9 14h2" />
            <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" fill="currentColor" fillOpacity="0.3" stroke="none" />
          </svg>
        } label="Total Equity"      value="567.15"   change="6.12%"    changeLabel="vs 31 Mar 2024" color="#9333ea"  iconBg="#faf5ff"  borderColor="#a855f7" />
        <KpiCard icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            <circle cx="12" cy="12" r="4.5" fill="#fff" />
          </svg>
        } label="Net Worth"         value="567.15"   change="6.12%"    changeLabel="vs 31 Mar 2024" color="#ea580c"  iconBg="#fff7ed"  borderColor="#f97316" />
        <KpiCard icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5H12V2.5z" fill="currentColor" fillOpacity="0.4"/>
            <path d="M22 10A10 10 0 0 0 14 2v8h8z" fill="currentColor"/>
          </svg>
        } label="Current Ratio"     value="1.86 : 1" change="0.08"     changeLabel="vs 31 Mar 2024" color="#0d9488"  iconBg="#f0fdfa"  borderColor="#14b8a6" hideSparkline={true} />
        <KpiCard icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20" />
            <path d="M4 7h16" />
            <path d="M4 7l-3 8h6z" fill="currentColor" fillOpacity="0.3"/>
            <path d="M20 7l-3 8h6z" fill="currentColor" fillOpacity="0.3"/>
            <path d="M8 22h8" />
          </svg>
        } label="Debt to Equity"    value="1.20 : 1" change="-0.05"    changeLabel="vs 31 Mar 2024" color="#db2777"  iconBg="#fdf2f8"  borderColor="#ec4899" hideSparkline={true} />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>

        {/* Trend Line Chart */}
        <motion.div
          whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(0,0,0,0.09)' }}
          style={{
            flex: '0 0 calc(45% - 7px)',
            minWidth: 340,
            background: '#fff', borderRadius: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)',
            padding: '14px 16px 8px',
            transition: 'box-shadow 0.3s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: C.navy }}>Assets vs Liabilities vs Equity Trend</div>
            <span style={{ fontSize: '0.70rem', fontWeight: 500, color: C.slate }}>(₹ Cr)</span>
            <span style={{ fontSize: '0.65rem', color: C.muted, cursor: 'help' }}>ⓘ</span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 8, paddingLeft: 4 }}>
            {[
              { color: '#6366f1', label: 'Total Assets' },
              { color: '#10b981', label: 'Total Liabilities' },
              { color: '#7c3aed', label: 'Total Equity' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 600, color: C.slate }}>
                <div style={{ width: 20, height: 2, borderRadius: 1, background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={TREND_DATA} margin={{ top: 5, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} width={40} />
              <Tooltip content={<TrendTooltip />} />
              <Line type="monotone" dataKey="assets"      name="Total Assets"      stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="liabilities" name="Total Liabilities" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="equity"      name="Total Equity"      stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3, fill: '#7c3aed' }} activeDot={{ r: 5 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut Charts */}
        <DonutCard
          title="Assets Composition"
          data={ASSETS_COMPOSITION}
          totalLabel="1,245.60"
        />
        <DonutCard
          title="Liabilities Composition"
          data={LIAB_COMPOSITION}
          totalLabel="678.45"
        />
      </div>

      {/* ── Tables Row ── */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <BSTableCard
          title="Assets"
          sections={ASSETS_TABLE.sections}
          grandTotal={ASSETS_TABLE.grandTotal}
          accentColor="#6366f1"
        />
        <BSTableCard
          title="Equity & Liabilities"
          sections={LIAB_TABLE.sections}
          grandTotal={LIAB_TABLE.grandTotal}
          accentColor="#f59e0b"
        />
        <EquityCard />
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 16, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: '0.70rem', color: C.muted,
        padding: '0 4px',
      }}>
        <span>All values are in INR (₹ Cr)  |  Data as on 30 Apr 2024</span>
        <span>☁ Source: Oracle Fusion Cloud</span>
      </div>
    </div>
  );
}
