import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, Line, LineChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, LabelList, ComposedChart, Label
} from 'recharts';
import { ChevronDown, Info } from 'lucide-react';

/* ── Shared: card action header ───────────────────────────── */
function ChartCardHeader({ title, date, extra, onViewAll, onExport }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 12px 8px', borderBottom: '1px solid #EEF2F7', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#081B46', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </span>
        <Info size={11} color="#94A3B8" style={{ flexShrink: 0 }} />
        {date && <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginLeft: 4, flexShrink: 0 }}>{date}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {extra}
        {onViewAll && (
          <button onClick={onViewAll}
            style={{ fontSize: '0.65rem', fontWeight: 600, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', whiteSpace: 'nowrap' }}>
            View All
          </button>
        )}
        {onExport && (
          <button onClick={onExport}
            style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', fontWeight: 600, color: '#475569', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 5, padding: '3px 6px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Export <ChevronDown size={10} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── shared number formatter ─────────────────────────────── */
function fmtNum(value, currency = 'AED') {
  if (value == null) return '–';
  const n = Number(value);
  if (isNaN(n)) return '–';
  if (n >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${currency} ${(n / 1_000).toFixed(2)}K`;
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/* ══════════════════════════════════════════════════════════
   1.  Inventory Value Trend  (Line chart)
══════════════════════════════════════════════════════════ */
export function InventoryValueTrend({ title, data, currency = 'AED', onViewAll, onExport }) {
  const formatTick = v => {
    if (v == null) return '–';
    const n = Number(v);
    if (isNaN(n)) return '–';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8EDF5', display: 'flex', flexDirection: 'column', height: 320, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <ChartCardHeader
        title={title || `Inventory Value Trend (${currency} Cr)`}
        onViewAll={onViewAll}
        onExport={onExport}
      />
      <div style={{ flex: 1, minHeight: 0, padding: '8px 4px 4px' }}>
        {!data || data.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>
            No Data Available
          </div>
        ) : (
          <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
            <LineChart data={data} margin={{ top: 6, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={formatTick} width={50} />
              <Tooltip
                formatter={v => [`${currency} ${formatTick(v)}`, 'Inventory Value']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingBottom: 4 }} />
              <Line type="monotone" dataKey="inventoryValue" name="Inventory Value" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   2.  Inventory Value by Parent Division  (Donut + legend)
══════════════════════════════════════════════════════════ */
export function OverDueSummaryCard({ title, data, total, Centerlabel, currency = 'AED', onSliceClick, onViewAll, onExport }) {
  const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#EF4444', '#8B5CF6', '#0891B2', '#EA580C'];

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8EDF5', display: 'flex', flexDirection: 'column', height: 320, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <ChartCardHeader
        title={title || `Inventory Value by Parent Division (${currency} Cr)`}
        onViewAll={onViewAll}
        onExport={onExport}
        extra={
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 20, padding: '2px 3px', gap: 2 }}>
            <button style={{ fontSize: '0.63rem', fontWeight: 700, color: '#fff', background: '#2563EB', border: 'none', borderRadius: 16, padding: '2px 9px', cursor: 'pointer' }}>Month</button>
            <button style={{ fontSize: '0.63rem', fontWeight: 600, color: '#64748B', background: 'none', border: 'none', borderRadius: 16, padding: '2px 7px', cursor: 'pointer' }}>Month on Month</button>
          </div>
        }
      />
      {data.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>No Data Available</div>
      ) : (
        <div style={{ flex: 1, display: 'flex', minHeight: 0, padding: '8px 10px' }}>
          {/* Donut */}
          <div style={{ width: '45%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={210} minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={data} innerRadius={58} outerRadius={85} paddingAngle={2} dataKey="value"
                  style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
                  onClick={entry => onSliceClick && onSliceClick(entry.payload || entry)}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, _n, p) => [fmtNum(v, currency), p.payload.name]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{fmtNum(total, currency)}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{Centerlabel || 'Total'}</div>
            </div>
          </div>
          {/* Legend */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, overflow: 'hidden' }}>
            {data.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color || COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {fmtNum(item.value, '')} ({Number(item.percentage || 0).toFixed(2)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   3.  Inventory Value by Subdivision  (Horizontal bar)
══════════════════════════════════════════════════════════ */
export function ParentDivisionCard({ data = [], title, currency = 'AED', onSliceClick, onViewAll, onExport }) {
  const hasData = data && data.length > 0;

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8EDF5', display: 'flex', flexDirection: 'column', height: 320, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <ChartCardHeader
        title={title || `Inventory Value by Subdivision (${currency} Cr)`}
        onViewAll={onViewAll}
        onExport={onExport}
      />
      {!hasData ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>
          No Records Found
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, padding: '6px 4px 4px' }}>
          <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 70, left: 10, bottom: 4 }} barCategoryGap="28%">
              <CartesianGrid stroke="#EEF2F7" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false}
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : v}
              />
              <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#334155', fontWeight: 700 }} />
              <Tooltip formatter={v => [fmtNum(v, currency), 'Amount']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
              <Bar dataKey="value" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={16}
                onClick={entry => onSliceClick && onSliceClick(entry)}
                style={{ cursor: onSliceClick ? 'pointer' : 'default' }}>
                <LabelList dataKey="value" position="right"
                  formatter={v => fmtNum(v, '')}
                  style={{ fontSize: 10, fill: '#0F172A', fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   4.  Inventory Aging Summary  (Donut + table legend)
══════════════════════════════════════════════════════════ */
export function AgingSummaryCard({ title, data, legendData = [], total, date, currency = 'AED', onSliceClick, onViewAll, onExport }) {
  const COLORS = ['#16A34A', '#F59E0B', '#EF4444', '#8B5CF6', '#0F766E', '#2563EB', '#94A3B8', '#64748B'];

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8EDF5', display: 'flex', flexDirection: 'column', height: 320, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <ChartCardHeader
        title={title || `Inventory Aging Summary (${currency} Cr)`}
        date={date}
        onViewAll={onViewAll}
        onExport={onExport}
      />
      {data.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>No Data Available</div>
      ) : (
        <div style={{ flex: 1, display: 'flex', minHeight: 0, padding: '8px 10px' }}>
          {/* Donut */}
          <div style={{ width: '42%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={210} minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={data} innerRadius={55} outerRadius={82} paddingAngle={1} dataKey="value"
                  style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
                  onClick={e => onSliceClick && onSliceClick(e.payload || e)}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, _n, p) => [fmtNum(v, currency), p.payload.name]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{fmtNum(total, currency)}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total</div>
            </div>
          </div>
          {/* Legend table */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, overflow: 'hidden' }}>
            {legendData.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 42px 68px', alignItems: 'center', columnGap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color || COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 9, color: '#475569', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                </div>
                <span style={{ textAlign: 'right', fontSize: 9, color: '#64748B', fontWeight: 700 }}>{Number(item.percentage || 0).toFixed(2)}%</span>
                <span style={{ textAlign: 'right', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', color: '#0F172A' }}>{fmtNum(item.value, '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   5.  Inventory Turnover & DIO Trend  (Dual-axis line)
══════════════════════════════════════════════════════════ */
export function InventoryTurnoverTrend({ title, data, onViewAll, onExport }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8EDF5', display: 'flex', flexDirection: 'column', height: 320, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <ChartCardHeader
        title={title || 'Inventory Turnover & DIO Trend'}
        onViewAll={onViewAll}
        onExport={onExport}
      />
      {!data || data.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 13 }}>No Data Available</div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, padding: '6px 4px 4px' }}>
          <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#EA580C' }} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#0ea5e9' }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="turnover" name="Inventory Turnover (Times)" stroke="#EA580C" strokeWidth={2} dot={{ r: 3, fill: '#EA580C' }} />
              <Line yAxisId="right" type="monotone" dataKey="dio" name="DIO (Days)" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: '#0ea5e9' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
