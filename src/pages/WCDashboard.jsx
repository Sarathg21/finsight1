import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend, Cell 
} from 'recharts';
import { 
  Activity, Wallet, Landmark, ArrowUpRight, ArrowDownRight, 
  Download, Filter, Zap, ShieldCheck 
} from 'lucide-react';
import { 
  WORKING_CAPITAL_TREND, MONTHLY_REVENUE, BANK_FACILITIES, KPI_SUMMARY,
  COUNTRIES, DIVISIONS, INVENTORY_AGING 
} from '../data/masterData';

export default function WCDashboard() {
  return (
    <div className="animate-in">
      <header className="page-header">
        <div>
          <h1 className="page-header-title">Working Capital & Liquidity</h1>
          <p className="page-header-subtitle">Treasury review and operational working capital monitoring</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary">
            <Download size={16} />
            Treasury Report
          </button>
        </div>
      </header>

      {/* WC Infolets */}
      <div className="kpi-grid">
        <KPICard 
          label="Gross Receivables" 
          value={`AED ${KPI_SUMMARY.grossAR.value}M`} 
          sub="↑ High DSO – 112 days avg"
          icon={<Activity size={20} />}
          accent="var(--clr-rose)"
        />
        <KPICard 
          label="Cash & Equivalents" 
          value={`$${KPI_SUMMARY.cashBalance.value}M`} 
          sub="Liquidity position"
          icon={<Wallet size={20} />}
          accent="var(--clr-emerald)"
        />
        <KPICard 
          label="DSO / DIO / DPO" 
          value={`${KPI_SUMMARY.dso.value.split(' ')[0]} / ${KPI_SUMMARY.dio.value.split(' ')[0]} / ${KPI_SUMMARY.dpo.value.split(' ')[0]}`}
          sub="Cycle metrics (days) — Mar 2026"
          icon={<Zap size={20} />}
          accent="var(--clr-amber)"
        />
        <KPICard 
          label="Total Inventory" 
          value="AED 124.6M" 
          sub="71.9% within 90 days"
          icon={<Landmark size={20} />}
          accent="var(--clr-cyan)"
        />
      </div>

      <div className="charts-grid charts-grid-3">
        {/* WC Trend Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Working Capital Components Trend</h3>
            <div className="tab-pills">
              <button className="tab-pill active">Stacked</button>
              <button className="tab-pill">Net View</button>
            </div>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart data={WORKING_CAPITAL_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="receivables" name="Receivables" stackId="1" stroke="var(--clr-primary)" fill="var(--clr-primary)" fillOpacity={0.2} />
                <Area type="monotone" dataKey="inventory" name="Inventory" stackId="1" stroke="var(--clr-amber)" fill="var(--clr-amber)" fillOpacity={0.2} />
                <Area type="monotone" dataKey="payables" name="Payables" stackId="1" stroke="var(--clr-rose)" fill="var(--clr-rose)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facility Utilization */}
        <div className="card">
          <div className="card-header">
             <h3 className="card-title">Bank Facility Utilization</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
            {BANK_FACILITIES.map((fac, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{fac.type}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{((fac.utilized/fac.limit)*100).toFixed(0)}%</span>
                </div>
                <div className="progress-bar-wrap" style={{ height: '8px' }}>
                   <div className="progress-bar-fill" style={{ 
                     width: `${(fac.utilized/fac.limit)*100}%`,
                     background: (fac.utilized/fac.limit) > 0.85 ? 'var(--clr-danger)' : 'var(--clr-primary)'
                   }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-dim)' }}>Utilized: ${fac.utilized}M</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-dim)' }}>Limit: ${fac.limit}M</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '30px', padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)' }}>
             <div className="flex items-center gap-2 mb-2">
               <ShieldCheck size={16} style={{ color: 'var(--clr-emerald)' }} />
               <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Treasury Health</span>
             </div>
             <p style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', lineHeight: 1.5 }}>
               Current liquidity ratios remain within corporate covenants. Facility headroom sufficient for projected Q3 operational needs.
             </p>
          </div>
        </div>
      </div>

      {/* Inventory Aging Breakdown */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Inventory Aging — 31 Mar 2026</h3>
            <p className="card-subtitle">Total: AED 124.6M across all entities</p>
          </div>
          <span className="badge badge-success">71.9% Fresh Stock</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INVENTORY_AGING} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="bucket" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={95} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#131929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  formatter={(v) => [`AED ${v}M`, 'Value']}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {INVENTORY_AGING.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      index === 0 ? 'var(--clr-emerald)' :
                      index === 1 ? 'var(--clr-primary)' :
                      index === 2 ? 'var(--clr-amber)' : 'var(--clr-rose)'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: '1 1 280px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {INVENTORY_AGING.map((item, idx) => (
              <div key={idx} style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--clr-surface-2)', border: '1px solid var(--clr-border)' }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--clr-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{item.bucket}</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: idx >= 3 ? 'var(--clr-rose)' : 'var(--clr-text)' }}>AED {item.amount}M</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--clr-text-dim)', marginTop: 2 }}>{item.pct}% of total</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, icon, accent }) {
  return (
    <div className="card" style={{ borderTop: `2px solid ${accent}` }}>
      <div className="flex items-center gap-3 mb-3">
        <div style={{ color: accent }}>{icon}</div>
        <div className="kpi-label" style={{ marginBottom: 0 }}>{label}</div>
      </div>
      <div className="kpi-value" style={{ marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>{sub}</div>
    </div>
  );
}
