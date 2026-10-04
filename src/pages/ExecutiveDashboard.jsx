import React, { useState } from 'react';
import { 
    LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Area, AreaChart
} from 'recharts';
import { 
    BarChart3, RefreshCw, Layers, Wallet, Target, Landmark, Percent, PieChart, Coins, Briefcase, Calendar, MapPin, Building, Globe, Filter, RefreshCcw, FileText
} from 'lucide-react';

/* ----------------- MOCK DATA ----------------- */

const KPIData = [
    { title: "Total Revenue", value: "AED 1,250M", change: "+12.4%", isPositive: true, isRed: false, icon: BarChart3, colorClass: "blue", sparklineData: [10,12,15,14,18,22,20,25] },
    { title: "Cost of Material", value: "AED 780M", change: "+6.8%", isPositive: true, isRed: true, icon: Coins, colorClass: "slate", sparklineData: [20,22,21,24,23,26,25,28] },
    { title: "Gross Profit", value: "AED 470M", change: "+23.1%", isPositive: true, isRed: false, icon: BarChart3, colorClass: "green", sparklineData: [10,11,13,15,14,17,16,20] },
    { title: "EBITDA", value: "AED 320M", change: "+18.7%", isPositive: true, isRed: false, icon: Briefcase, colorClass: "blue", sparklineData: [8,9,11,10,13,15,14,18] },
    { title: "Net Profit", value: "AED 210M", change: "+20.0%", isPositive: true, isRed: false, icon: Coins, colorClass: "green", sparklineData: [5,6,5,7,8,7,9,11] },
    { title: "Trade Working Capital", value: "AED 540M", change: "+4.2%", isPositive: true, isRed: true, icon: RefreshCw, colorClass: "blue", sparklineData: [10,12,11,13,12,14,13,15] },
    { title: "Overdue Receivables", value: "AED 180M", change: "+15.3%", isPositive: true, isRed: true, icon: Wallet, colorClass: "blue", sparklineData: [5,6,8,7,9,10,12,14] },
    { title: "Slow Moving & Obsolete Stock", value: "AED 95M", change: "-8.7%", isPositive: false, isRed: false, icon: Layers, colorClass: "green", sparklineData: [15,14,16,13,12,10,11,9] },
    { title: "Cash Collection", value: "AED 980M", change: "+18.1%", isPositive: true, isRed: false, icon: Wallet, colorClass: "blue", sparklineData: [20,22,25,24,28,30,29,32] },
    { title: "Collection Efficiency", value: "92%", change: "+6.2 pp", isPositive: true, isRed: false, icon: Target, colorClass: "blue", sparklineData: [80,82,81,85,84,88,87,92] },
    { title: "Total Short Term Borrowing", value: "AED 360M", change: "+5.9%", isPositive: true, isRed: true, icon: Landmark, colorClass: "blue", sparklineData: [20,21,20,22,23,24,25,26] },
    { title: "ROI %", value: "14.8%", change: "+2.3 pp", isPositive: true, isRed: false, icon: BarChart3, colorClass: "blue", sparklineData: [10,11,12,11,13,12,14,15] }
];

const twcTrendData = [
    { month: 'Apr 2024', tr: 200, inv: 250, tp: 100, twc: 350 },
    { month: 'May 2024', tr: 220, inv: 280, tp: 110, twc: 390 },
    { month: 'Jun 2024', tr: 210, inv: 260, tp: 105, twc: 365 },
    { month: 'Jul 2024', tr: 230, inv: 270, tp: 115, twc: 385 },
    { month: 'Aug 2024', tr: 240, inv: 290, tp: 120, twc: 410 },
    { month: 'Sep 2024', tr: 250, inv: 300, tp: 130, twc: 420 },
    { month: 'Oct 2024', tr: 260, inv: 310, tp: 140, twc: 430 },
    { month: 'Nov 2024', tr: 280, inv: 330, tp: 150, twc: 460 },
    { month: 'Dec 2024', tr: 300, inv: 350, tp: 160, twc: 490 },
    { month: 'Jan 2025', tr: 310, inv: 340, tp: 170, twc: 480 },
    { month: 'Feb 2025', tr: 330, inv: 360, tp: 180, twc: 510 },
    { month: 'Mar 2025', tr: 350, inv: 380, tp: 190, twc: 540 },
];

const revenueRegionData = [
    { name: 'UAE', value: 420 },
    { name: 'KSA', value: 310 },
    { name: 'Oman', value: 160 },
    { name: 'Qatar', value: 120 },
    { name: 'India', value: 140 },
    { name: 'Iraq', value: 100 },
];

const profitRegionData = [
    { name: 'UAE', gp: 180, np: 85 },
    { name: 'KSA', gp: 120, np: 55 },
    { name: 'Oman', gp: 70, np: 28 },
    { name: 'Qatar', gp: 50, np: 20 },
    { name: 'India', gp: 60, np: 18 },
    { name: 'Iraq', gp: 40, np: 12 },
];

const paramTableData = [
    { param: "Total Revenue", m1: "AED 1,250M", m2: "AED 1,112M", mom: "+12.4%", m3: "AED 980M", yoy: "+27.6%", momPos: true, yoyPos: true, comment: "Higher sales across UAE and KSA" },
    { param: "Gross Profit", m1: "AED 470M", m2: "AED 382M", mom: "+23.1%", m3: "AED 360M", yoy: "+30.6%", momPos: true, yoyPos: true, comment: "Improved product mix and pricing" },
    { param: "EBITDA", m1: "AED 320M", m2: "AED 270M", mom: "+18.7%", m3: "AED 250M", yoy: "+28.0%", momPos: true, yoyPos: true, comment: "Operational efficiencies" },
    { param: "Net Profit", m1: "AED 210M", m2: "AED 175M", mom: "+20.0%", m3: "AED 150M", yoy: "+40.0%", momPos: true, yoyPos: true, comment: "Higher profitability across key markets" },
    { param: "Trade Working Capital", m1: "AED 540M", m2: "AED 518M", mom: "+4.2%", m3: "AED 480M", yoy: "+12.5%", momPos: true, yoyPos: true, momRed: true, yoyRed: true, comment: "Increase due to higher receivables" },
    { param: "Net Working Capital", m1: "AED 620M", m2: "AED 590M", mom: "+5.1%", m3: "AED 560M", yoy: "+10.7%", momPos: true, yoyPos: true, momRed: true, yoyRed: true, comment: "In line with business growth" },
    { param: "DSO (Days)", m1: "58", m2: "52", mom: "+6", m3: "55", yoy: "+3", momPos: false, yoyPos: false, momRed: true, yoyRed: true, comment: "Slight increase in collection period" },
    { param: "DIO (Days)", m1: "72", m2: "78", mom: "-6", m3: "80", yoy: "-8", momPos: false, yoyPos: false, comment: "Better inventory management" },
    { param: "DPO (Days)", m1: "66", m2: "64", mom: "+2", m3: "62", yoy: "+4", momPos: true, yoyPos: true, momRed: true, yoyRed: true, comment: "Aligned with supplier terms" },
    { param: "CCC (Days)", m1: "64", m2: "66", mom: "-2", m3: "73", yoy: "-9", momPos: false, yoyPos: false, comment: "Improved working capital cycle" },
    { param: "Current Ratio", m1: "1.8x", m2: "1.7x", mom: "+0.1x", m3: "1.6x", yoy: "+0.2x", momPos: true, yoyPos: true, comment: "Healthy short-term liquidity" },
    { param: "Tangible Net Worth Ratio", m1: "0.62x", m2: "0.60x", mom: "+0.02x", m3: "0.55x", yoy: "+0.07x", momPos: true, yoyPos: true, comment: "Stronger balance sheet" },
    { param: "ROI %", m1: "14.8%", m2: "12.5%", mom: "+2.3 pp", m3: "11.2%", yoy: "+3.6 pp", momPos: true, yoyPos: true, comment: "Higher returns on invested capital" }
];


/* ----------------- COMPONENTS ----------------- */

const Sparkline = ({ data, color }) => {
    const formattedData = data.map((val, i) => ({ index: i, value: val }));
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: 4, fontSize: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>{label}</div>
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

export default function ExecutiveDashboard() {
    return (
        <div style={{ padding: '24px', background: '#f4f7f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <style>{`
                .filter-label {
                    font-size: 0.7rem; font-weight: 600; color: #64748b; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;
                }
                .filter-select {
                    padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8rem; color: #1e293b; background: #fff; outline: none; font-weight: 500; min-width: 140px;
                }
                .card {
                    background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
                }
                .kpi-title {
                    font-size: 0.75rem; font-weight: 700; color: #334155; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .kpi-val {
                    font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 6px;
                }
                .kpi-change {
                    font-size: 0.7rem; font-weight: 700;
                }
                .th-cell {
                    padding: 12px 16px; text-align: left; color: #475569; font-weight: 700; font-size: 0.75rem; border-bottom: 2px solid #e2e8f0; white-space: nowrap;
                }
                .td-cell {
                    padding: 12px 16px; color: #334155; font-weight: 600; font-size: 0.75rem; border-bottom: 1px solid #f1f5f9;
                }
                .icon-box {
                    width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;
                }
            `}</style>
            
            {/* 1. FILTER BAR */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 24, background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="filter-label"><Calendar size={12}/> Period</div>
                    <select className="filter-select" defaultValue="Mar 2025"><option>Mar 2025</option></select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="filter-label"><MapPin size={12}/> Region</div>
                    <select className="filter-select" defaultValue="All Regions"><option>All Regions</option></select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="filter-label"><Building size={12}/> Legal Entity</div>
                    <select className="filter-select" defaultValue="All Entities"><option>All Entities</option></select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="filter-label"><Globe size={12}/> Currency</div>
                    <select className="filter-select" defaultValue="AED"><option>AED (UAE Dirham)</option></select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="filter-label"><BarChart3 size={12}/> View</div>
                    <select className="filter-select" defaultValue="Executive View"><option>Executive View</option></select>
                </div>
                
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                    <button style={{ background: '#1e3a8a', color: '#fff', border: 'none', padding: '0 24px', borderRadius: 6, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', height: 36, display: 'flex', alignItems: 'center' }}>
                        Apply Filters
                    </button>
                    <button style={{ background: 'transparent', color: '#64748b', border: 'none', padding: '0 12px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', height: 36, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RefreshCcw size={14} /> Reset
                    </button>
                </div>
            </div>

            {/* 2. KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 24 }}>
                {KPIData.map((kpi, idx) => (
                    <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', padding: '20px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <div className="icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                <kpi.icon size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="kpi-title">{kpi.title}</div>
                                <div className="kpi-val">{kpi.value}</div>
                                <div className="kpi-change" style={{ color: kpi.isRed ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: '0.8rem' }}>{kpi.isPositive ? '?' : '?'}</span> 
                                    <span>{kpi.change}</span> 
                                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>vs. Feb 2025</span>
                                </div>
                            </div>
                        </div>
                        {/* Sparkline overlay right-bottom */}
                        <div style={{ position: 'absolute', bottom: 16, right: 16, width: 60, height: 30 }}>
                            <Sparkline data={kpi.sparklineData} color={kpi.isRed ? '#dc2626' : (kpi.colorClass === 'green' ? '#16a34a' : '#3b82f6')} />
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. CHARTS ROW */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                {/* Trade Working Capital Trend */}
                <div className="card" style={{ flex: 2 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BarChart3 size={16} color="#3b82f6" /> Trade Working Capital Trend
                    </div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={twcTrendData} margin={{ top: 20, right: 20, bottom: 0, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                <YAxis label={{ value: 'AED Million', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: '#64748b', fontSize: 10} }} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, color: '#475569', paddingTop: 10 }} iconType="square" iconSize={8} />
                                <Bar name="Trade Receivables" dataKey="tr" stackId="a" fill="#3b82f6" barSize={20} />
                                <Bar name="Inventories" dataKey="inv" stackId="a" fill="#93c5fd" />
                                <Bar name="Trade Payables" dataKey="tp" stackId="a" fill="#34d399" radius={[2, 2, 0, 0]} />
                                <Line name="Trade Working Capital" type="monotone" dataKey="twc" stroke="#1e3a8a" strokeWidth={2} dot={{ r: 4, fill: '#1e3a8a' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue by Region */}
                <div className="card" style={{ flex: 1.2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Globe size={16} color="#3b82f6" /> Revenue by Region
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>AED Million</div>
                    </div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={revenueRegionData} margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} width={50} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="value" fill="#60a5fa" barSize={16} radius={[0, 4, 4, 0]}>
                                    {revenueRegionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#60a5fa" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profitability by Region */}
                <div className="card" style={{ flex: 1.2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart3 size={16} color="#3b82f6" /> Profitability by Region
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>AED Million</div>
                    </div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={profitRegionData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, color: '#475569', paddingTop: 10 }} iconType="square" iconSize={8} />
                                <Bar name="Gross Profit" dataKey="gp" fill="#3b82f6" barSize={14} radius={[2, 2, 0, 0]} />
                                <Bar name="Net Profit" dataKey="np" fill="#34d399" barSize={14} radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. TABLE */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} color="#3b82f6" /> Key Financial Parameters
                    </div>
                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 6, padding: 2 }}>
                        <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Values</button>
                        <button style={{ background: 'transparent', color: '#64748b', border: 'none', padding: '6px 16px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Ratios / Days</button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th className="th-cell">Parameter</th>
                                <th className="th-cell">Mar 2025</th>
                                <th className="th-cell">Feb 2025</th>
                                <th className="th-cell">MoM Change</th>
                                <th className="th-cell">Mar 2024</th>
                                <th className="th-cell">YoY Change</th>
                                <th className="th-cell" style={{ width: 100, textAlign: 'center' }}>Trend (12M)</th>
                                <th className="th-cell">Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paramTableData.map((row, idx) => (
                                <tr key={idx} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='#f8fafc'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                    <td className="td-cell" style={{ color: '#0f172a', fontWeight: 700 }}>{row.param}</td>
                                    <td className="td-cell">{row.m1}</td>
                                    <td className="td-cell">{row.m2}</td>
                                    <td className="td-cell" style={{ color: row.momRed ? '#dc2626' : '#16a34a' }}>
                                        {row.momPos ? '?' : '?'} {row.mom}
                                    </td>
                                    <td className="td-cell">{row.m3}</td>
                                    <td className="td-cell" style={{ color: row.yoyRed ? '#dc2626' : '#16a34a' }}>
                                        {row.yoyPos ? '?' : '?'} {row.yoy}
                                    </td>
                                    <td className="td-cell" style={{ width: 100, height: 36, padding: '4px 16px' }}>
                                        <Sparkline data={[10, 15, 12, 18, 16, 22, 20, 25, 23, 28, 26, 30]} color="#3b82f6" />
                                    </td>
                                    <td className="td-cell" style={{ color: '#64748b', fontWeight: 500 }}>{row.comment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
