import React, { useState } from 'react';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
    Coins, TrendingUp, BarChart3, Briefcase, PieChart as PieChartIcon, 
    Calendar, ChevronDown 
} from 'lucide-react';

const KPICard = ({ title, value, change, isPositive, icon: Icon, colorClass }) => (
    <div style={{
        background: '#fff', borderRadius: 8, padding: '16px 20px', 
        border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', flex: 1, minWidth: 160
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                background: `var(--${colorClass}-bg, #f1f5f9)`, color: `var(--${colorClass}-text, #3b82f6)`
            }}>
                <Icon size={20} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                {title}
            </div>
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            {value}
        </div>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: isPositive ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{isPositive ? '?' : '?'}</span>
            <span>{change} vs Apr 2023</span>
        </div>
    </div>
);

export default function ExecutiveDashboard() {
    const [filters, setFilters] = useState({
        legalGroup: 'All',
        businessUnit: 'All',
        division: 'All',
        fromDate: '2024-04-01',
        toDate: '2024-04-30'
    });

    const revenueTrendData = [
        { month: 'Nov', fy23: 110, fy24: 60 },
        { month: 'Dec', fy23: 135, fy24: 90 },
        { month: 'Jan', fy23: 120, fy24: 65 },
        { month: 'Feb', fy23: 155, fy24: 105 },
        { month: 'Mar', fy23: 115, fy24: 90 },
        { month: 'Apr', fy23: 130, fy24: 125 },
    ];

    const profitTrendData = [
        { month: 'Nov', fy23: 10, fy24: 8 },
        { month: 'Dec', fy23: 12, fy24: 9 },
        { month: 'Jan', fy23: 13.5, fy24: 10 },
        { month: 'Feb', fy23: 14, fy24: 16 },
        { month: 'Mar', fy23: 15, fy24: 11.5 },
        { month: 'Apr', fy23: 9.5, fy24: 12.5 },
    ];

    const geoData = [
        { name: 'India', value: 45.2, color: '#3b82f6' },
        { name: 'North America', value: 22.1, color: '#22c55e' },
        { name: 'Europe', value: 16.6, color: '#8b5cf6' },
        { name: 'Asia Pacific', value: 10.6, color: '#eab308' },
        { name: 'Others', value: 5.5, color: '#0ea5e9' },
    ];

    const tableData = [
        { key: 'Total Revenue', curr: '125.75', prev: '112.40', ytdCurr: '1,215.60', ytdPrev: '1,045.32', yoy: '16.29%', isPos: true },
        { key: 'Gross Profit', curr: '28.35', prev: '24.21', ytdCurr: '273.55', ytdPrev: '234.20', yoy: '16.80%', isPos: true },
        { key: 'EBITDA', curr: '18.42', prev: '15.98', ytdCurr: '164.25', ytdPrev: '142.68', yoy: '15.13%', isPos: true },
        { key: 'EBIT', curr: '14.25', prev: '12.40', ytdCurr: '128.40', ytdPrev: '110.85', yoy: '15.83%', isPos: true },
        { key: 'Net Profit', curr: '10.25', prev: '8.46', ytdCurr: '92.35', ytdPrev: '75.10', yoy: '22.96%', isPos: true },
        { key: 'Working Capital', curr: '45.80', prev: '46.75', ytdCurr: '45.80', ytdPrev: '46.80', yoy: '-2.14%', isPos: false },
        { key: 'Current Ratio', curr: '1.86', prev: '1.74', ytdCurr: '1.86', ytdPrev: '1.72', yoy: '8.14%', isPos: true },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: 12, borderRadius: 6, fontSize: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>{label}</div>
                    {payload.map((entry, index) => (
                        <div key={index} style={{ color: entry.color, display: 'flex', gap: 8, fontWeight: 600 }}>
                            <span>{entry.name}:</span>
                            <span>{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                .exec-filter-select {
                    padding: 8px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    color: #334155;
                    background: #fff;
                    outline: none;
                    width: 160px;
                }
                .exec-filter-date {
                    padding: 8px 12px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    color: #334155;
                    background: #fff;
                    outline: none;
                    width: 140px;
                }
                .exec-card-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            `}</style>
            
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', margin: 0, marginBottom: 4 }}>
                    Executive Dashboard
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Get a comprehensive overview of your financial performance
                </p>
            </div>

            {/* Filter Bar */}
            <div style={{ 
                background: '#fff', borderRadius: 8, padding: 16, marginBottom: 24, 
                display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap',
                border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Legal Group</label>
                    <select className="exec-filter-select">
                        <option>All</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Business Unit</label>
                    <select className="exec-filter-select">
                        <option>All</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Division</label>
                    <select className="exec-filter-select">
                        <option>All</option>
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>From Date</label>
                    <div style={{ position: 'relative' }}>
                        <input type="date" className="exec-filter-date" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})} />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>To Date</label>
                    <div style={{ position: 'relative' }}>
                        <input type="date" className="exec-filter-date" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})} />
                    </div>
                </div>
                <button style={{ 
                    background: '#3730a3', color: '#fff', border: 'none', borderRadius: 6,
                    padding: '8px 24px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', height: 35
                }}>
                    Apply
                </button>
                <div style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', alignSelf: 'center' }}>
                    All values are in INR (?)
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
                <KPICard title="Total Revenue" value="? 125.75 Cr" change="18.6%" isPositive={true} icon={Coins} colorClass="green" />
                <KPICard title="Gross Profit" value="? 28.35 Cr" change="17.1%" isPositive={true} icon={Briefcase} colorClass="green" />
                <KPICard title="EBITDA" value="? 18.42 Cr" change="15.4%" isPositive={true} icon={BarChart3} colorClass="blue" />
                <KPICard title="Net Profit" value="? 10.25 Cr" change="23.1%" isPositive={true} icon={Coins} colorClass="purple" />
                <KPICard title="Working Capital" value="? 45.80 Cr" change="2.1%" isPositive={false} icon={Briefcase} colorClass="orange" />
                <KPICard title="Current Ratio" value="1.86" change="0.12" isPositive={true} icon={PieChartIcon} colorClass="blue" />
            </div>

            {/* Custom CSS variables for KPI colors */}
            <style>{`
                :root {
                    --green-bg: #dcfce7; --green-text: #16a34a;
                    --blue-bg: #dbeafe; --blue-text: #2563eb;
                    --purple-bg: #f3e8ff; --purple-text: #9333ea;
                    --orange-bg: #ffedd5; --orange-text: #ea580c;
                }
            `}</style>

            {/* Charts Row */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                {/* Revenue Trend */}
                <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div className="exec-card-title">
                        <span>Revenue Trend (? Cr)</span>
                        <span style={{ cursor: 'pointer', color: '#94a3b8' }}>?</span>
                    </div>
                    <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, color: '#475569', paddingTop: 10 }} iconType="circle" iconSize={6} />
                                <Line name="FY 23-24" type="monotone" dataKey="fy23" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
                                <Line name="FY 24-25" type="monotone" dataKey="fy24" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit Trend */}
                <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div className="exec-card-title">
                        <span>Profit Trend (? Cr)</span>
                        <span style={{ cursor: 'pointer', color: '#94a3b8' }}>?</span>
                    </div>
                    <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={profitTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, color: '#475569', paddingTop: 10 }} iconType="square" iconSize={8} />
                                <Bar name="Net Profit (FY 23-24)" dataKey="fy23" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={10} />
                                <Bar name="Net Profit (FY 24-25)" dataKey="fy24" fill="#22c55e" radius={[2, 2, 0, 0]} barSize={10} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue by Geography */}
                <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div className="exec-card-title">
                        <span>Revenue by Geography (? Cr)</span>
                        <span style={{ cursor: 'pointer', color: '#94a3b8' }}>?</span>
                    </div>
                    <div style={{ height: 220, display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1, height: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={geoData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} stroke="none">
                                        {geoData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {geoData.map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                                        {d.name}
                                    </div>
                                    <div style={{ color: '#0f172a' }}>{d.value}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div className="exec-card-title">
                    <span>Financial Summary (? Cr)</span>
                    <span style={{ cursor: 'pointer', color: '#94a3b8' }}>?</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderTop: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Particulars</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#334155', fontWeight: 700 }}>Current Month (Apr 2024)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#334155', fontWeight: 700 }}>Previous Month (Mar 2024)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#334155', fontWeight: 700 }}>YTD (Apr 2024)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#334155', fontWeight: 700 }}>YTD (Apr 2023)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#334155', fontWeight: 700 }}>YoY %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{row.key}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: 500 }}>{row.curr}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: 500 }}>{row.prev}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: 500 }}>{row.ytdCurr}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: 500 }}>{row.ytdPrev}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: row.isPos ? '#16a34a' : '#dc2626' }}>
                                        {row.yoy}
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
