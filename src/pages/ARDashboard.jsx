import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend, LineChart, Line 
} from 'recharts';
import { 
  Briefcase, Clock, CheckCircle2, AlertCircle, Download, 
  Search, ArrowRight, Mail, TrendingUp
} from 'lucide-react';
import { 
  AR_AGING, SALESMAN_PERFORMANCE, KPI_SUMMARY, COLLECTIONS_TREND 
} from '../data/masterData';
import { TOOLTIP_STYLE } from '../utils/theme';

export default function ARDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-in">
      <header className="page-header">
        <div>
          <h1 className="page-header-title">Receivables & Collections</h1>
          <p className="page-header-subtitle">Account receivables monitoring and collection performance</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-ghost">
            <Mail size={16} />
            Email Overdue
          </button>
          <button className="btn btn-primary">
            <Download size={16} />
            Export AR Report
          </button>
        </div>
      </header>

      {/* AR Infolets */}
      <div className="kpi-grid">
        <KPIInfo 
          label="Gross Receivables" 
          value={`AED ${KPI_SUMMARY.grossAR.value}M`} 
          sub="As of 31-Mar-2026"
          icon={<Briefcase size={20} />}
          color="var(--clr-primary)"
        />
        <KPIInfo 
          label="Overdue (> 30 Days)" 
          value={`AED ${KPI_SUMMARY.overdueAR.value}M`} 
          sub="78.2% of total AR · High Risk"
          icon={<Clock size={20} />}
          color="var(--clr-amber)"
          isAlert={true}
        />
        <KPIInfo 
          label="Current / Not Due" 
          value="AED 161.4M" 
          sub="21.8% — Due date basis"
          icon={<CheckCircle2 size={20} />}
          color="var(--clr-emerald)"
        />
        <KPIInfo 
          label="120+ Days Overdue" 
          value="AED 318.4M" 
          sub="43.1% of AR — Critical aging"
          icon={<TrendingUp size={20} />}
          color="var(--clr-rose)"
          isAlert={true}
        />
      </div>

      <div className="charts-grid-2" style={{ gap: 16, marginBottom: 20 }}>
        {/* Aging Bucket Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Aging Bucket Distribution</h3>
            <span className="badge badge-neutral">By Amount</span>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={AR_AGING} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="bucket" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {AR_AGING.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      index === 0 ? 'var(--clr-emerald)' : 
                      index < 3 ? 'var(--clr-primary)' : 
                      index < 5 ? 'var(--clr-amber)' : 'var(--clr-rose)'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
             {AR_AGING.map((item, idx) => (
               <div key={idx} className="flex items-center gap-1">
                 <div style={{ width: 8, height: 8, borderRadius: '2px', background: idx === 0 ? 'var(--clr-emerald)' : idx < 3 ? 'var(--clr-primary)' : idx < 5 ? 'var(--clr-amber)' : 'var(--clr-rose)' }} />
                 <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-dim)' }}>{item.pct}%</span>
               </div>
             ))}
          </div>
        </div>

        {/* Collection trend vs Target */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Collection vs Target Trend</h3>
          </div>
          <div style={{ width: '100%', height: 335 }}>
            <ResponsiveContainer>
              <LineChart data={COLLECTIONS_TREND}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#64748b' }} />
                <Line type="monotone" dataKey="collected" name="Collected" stroke="var(--clr-emerald)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Salesman Performance Table */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
           <div>
            <h3 className="card-title">Salesman Collection Performance</h3>
            <p className="card-subtitle">Showing tracking for assigned sales engineers</p>
           </div>
           <div style={{ position: 'relative' }}>
             <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-dim)' }} />
             <input 
              type="text" 
              placeholder="Filter salesman..." 
              className="filter-input" 
              style={{ fontSize: '0.75rem', paddingLeft: '30px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Salesman</th>
                <th>Division</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Collected</th>
                <th className="text-right">Overdue</th>
                <th className="text-right">Efficiency</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {SALESMAN_PERFORMANCE.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                  </td>
                  <td><span className="badge badge-neutral" style={{ textTransform: 'none' }}>{item.division}</span></td>
                  <td className="td-mono">${item.revenue}M</td>
                  <td className="td-mono" style={{ color: 'var(--clr-emerald)' }}>${item.collected}M</td>
                  <td className="td-mono" style={{ color: item.overdue > 1 ? 'var(--clr-rose)' : 'var(--clr-text)' }}>${item.overdue}M</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar-wrap" style={{ flex: 1, minWidth: '60px' }}>
                        <div className="progress-bar-fill" style={{ width: item.efficiency, background: parseInt(item.efficiency) > 90 ? 'var(--clr-emerald)' : parseInt(item.efficiency) > 80 ? 'var(--clr-primary)' : 'var(--clr-amber)' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{item.efficiency}</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <button className="btn-icon"><ArrowRight size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPIInfo({ label, value, sub, icon, color, isAlert }) {
  return (
    <div className="card" style={{ borderBottom: isAlert ? '3px solid var(--clr-rose)' : 'none' }}>
      <div className="flex justify-between items-start mb-2">
        <div className="kpi-label" style={{ marginBottom: 0 }}>{label}</div>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="kpi-value" style={{ marginBottom: '2px' }}>{value}</div>
      <div className="flex items-center gap-2">
         {isAlert && <AlertCircle size={10} style={{ color: 'var(--clr-rose)' }} />}
         <div style={{ fontSize: '0.72rem', color: isAlert ? 'var(--clr-rose)' : 'var(--clr-text-muted)', fontWeight: isAlert ? 600 : 400 }}>{sub}</div>
      </div>
    </div>
  );
}
