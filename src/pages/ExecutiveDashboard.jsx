import React, { useState } from 'react';
import { 
    LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Area, AreaChart
} from 'recharts';
import { 
    BarChart3, RefreshCw, Layers, Wallet, Target, Landmark, Percent, PieChart, Coins, Briefcase, Calendar, MapPin, Building, Globe, RefreshCcw, FileText
} from 'lucide-react';

/* ----------------- MOCK DATA ----------------- */

const KPIData = [
    { title: "Total Revenue", value: "AED 1,250M", change: "+12.4%", isPositive: true, isRed: false, icon: BarChart3, iconColor: "blue", colorClass: "blue", sparklineData: [10,12,15,14,18,22,20,25] },
    { title: "Cost of Material", value: "AED 780M", change: "+6.8%", isPositive: true, isRed: true, icon: Coins, iconColor: "blue", colorClass: "red", sparklineData: [20,22,21,24,23,26,25,28] },
    { title: "Gross Profit", value: "AED 470M", change: "+23.1%", isPositive: true, isRed: false, icon: BarChart3, iconColor: "green", colorClass: "green", sparklineData: [10,11,13,15,14,17,16,20] },
    { title: "EBITDA", value: "AED 320M", change: "+18.7%", isPositive: true, isRed: false, icon: Briefcase, iconColor: "blue", colorClass: "blue", sparklineData: [8,9,11,10,13,15,14,18] },
    { title: "Net Profit", value: "AED 210M", change: "+20.0%", isPositive: true, isRed: false, icon: Coins, iconColor: "green", colorClass: "green", sparklineData: [5,6,5,7,8,7,9,11] },
    { title: "Trade Working Capital", value: "AED 540M", change: "+4.2%", isPositive: true, isRed: true, icon: RefreshCw, iconColor: "blue", colorClass: "red", sparklineData: [10,12,11,13,12,14,13,15] },
    { title: "Overdue Receivables", value: "AED 180M", change: "+15.3%", isPositive: true, isRed: true, icon: Wallet, iconColor: "blue", colorClass: "red", sparklineData: [5,6,8,7,9,10,12,14] },
    { title: "Slow Moving & Obsolete Stock", value: "AED 95M", change: "-8.7%", isPositive: false, isRed: false, icon: Layers, iconColor: "green", colorClass: "green", sparklineData: [15,14,16,13,12,10,11,9] },
    { title: "Cash Collection", value: "AED 980M", change: "+18.1%", isPositive: true, isRed: false, icon: Wallet, iconColor: "blue", colorClass: "blue", sparklineData: [20,22,25,24,28,30,29,32] },
    { title: "Collection Efficiency", value: "92%", change: "+6.2 pp", isPositive: true, isRed: false, icon: Target, iconColor: "blue", colorClass: "blue", sparklineData: [80,82,81,85,84,88,87,92] },
    { title: "Total Short Term Borrowing", value: "AED 360M", change: "+5.9%", isPositive: true, isRed: true, icon: Landmark, iconColor: "blue", colorClass: "red", sparklineData: [20,21,20,22,23,24,25,26] },
    { title: "ROI %", value: "14.8%", change: "+2.3 pp", isPositive: true, isRed: false, icon: BarChart3, iconColor: "blue", colorClass: "green", sparklineData: [10,11,12,11,13,12,14,15] }
];

const twcTrendData = [
    { month: 'Apr 24', tr: 200, inv: 250, tp: 100, twc: 350 },
    { month: 'May 24', tr: 220, inv: 280, tp: 110, twc: 390 },
    { month: 'Jun 24', tr: 210, inv: 260, tp: 105, twc: 365 },
    { month: 'Jul 24', tr: 230, inv: 270, tp: 115, twc: 385 },
    { month: 'Aug 24', tr: 240, inv: 290, tp: 120, twc: 410 },
    { month: 'Sep 24', tr: 250, inv: 300, tp: 130, twc: 420 },
    { month: 'Oct 24', tr: 260, inv: 310, tp: 140, twc: 430 },
    { month: 'Nov 24', tr: 280, inv: 330, tp: 150, twc: 460 },
    { month: 'Dec 24', tr: 300, inv: 350, tp: 160, twc: 490 },
    { month: 'Jan 25', tr: 310, inv: 340, tp: 170, twc: 480 },
    { month: 'Feb 25', tr: 330, inv: 360, tp: 180, twc: 510 },
    { month: 'Mar 25', tr: 350, inv: 380, tp: 190, twc: 540 },
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

const Sparkline = ({ data, colorClass }) => {
    const formattedData = data.map((val, i) => ({ index: i, value: val }));
    let color = 'var(--clr-primary)';
    if (colorClass === 'red') color = 'var(--clr-danger)';
    if (colorClass === 'green') color = 'var(--clr-success)';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
                <defs>
                    <linearGradient id={`color-${colorClass}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${colorClass})`} isAnimationActive={false} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-border)', padding: '8px 12px', borderRadius: 6, fontSize: '0.75rem', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--clr-text)' }}>{label}</div>
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
        <div style={{ padding: '20px 24px', background: 'var(--clr-bg)', minHeight: '100vh' }}>
            <style>{`
                .filter-label {
                    font-size: 0.72rem; font-weight: 700; color: var(--clr-text); display: flex; align-items: center; gap: 4px;
                }
                .filter-select {
                    padding: 6px 10px; border: 1px solid var(--clr-border-strong); border-radius: 4px; font-size: 0.75rem; color: var(--clr-text-muted); background: var(--clr-surface); outline: none; font-weight: 600; min-width: 120px; cursor: pointer; transition: border-color 0.2s;
                }
                .filter-select:hover {
                    border-color: var(--clr-primary);
                }
                .card {
                    background: var(--clr-surface); border-radius: 10px; border: 1px solid var(--clr-border); box-shadow: 0 1px 2px rgba(0,0,0,0.02);
                }
                .kpi-title {
                    font-size: 0.72rem; font-weight: 800; color: var(--clr-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em;
                }
                .kpi-val {
                    font-size: 1.25rem; font-weight: 800; color: var(--clr-text); font-family: var(--font-sans); margin-bottom: 2px; letter-spacing: -0.02em;
                }
                .kpi-change {
                    font-size: 0.7rem; font-weight: 800;
                }
                .th-cell {
                    padding: 12px 16px; text-align: left; color: var(--clr-text-muted); font-weight: 700; font-size: 0.75rem; border-bottom: 2px solid var(--clr-border); white-space: nowrap;
                }
                .td-cell {
                    padding: 12px 16px; color: var(--clr-text); font-weight: 600; font-size: 0.78rem; border-bottom: 1px solid var(--clr-border);
                }
                .icon-box {
                    width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .icon-box.blue {
                    background: var(--clr-primary-dim); color: var(--clr-primary);
                }
                .icon-box.green {
                    background: rgba(16, 185, 129, 0.1); color: var(--clr-success);
                }
            `}</style>
            
            {/* 1. FILTER BAR */}
            <div className="card" style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 20, padding: '10px 16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="filter-label"><Calendar size={14}/> Period</div>
                    <select className="filter-select" defaultValue="Mar 2025"><option>Mar 2025</option></select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="filter-label"><MapPin size={14}/> Region</div>
                    <select className="filter-select" defaultValue="All Regions"><option>All Regions</option></select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="filter-label"><Building size={14}/> Legal Entity</div>
                    <select className="filter-select" defaultValue="All Entities"><option>All Entities</option></select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="filter-label"><Coins size={14}/> Currency</div>
                    <select className="filter-select" defaultValue="AED"><option>AED (UAE Dirham)</option></select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="filter-label"><BarChart3 size={14}/> View</div>
                    <select className="filter-select" defaultValue="Executive View"><option>Executive View</option></select>
                </div>
                
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                    <button style={{ background: 'var(--clr-primary)', color: '#fff', border: 'none', padding: '0 20px', borderRadius: 6, fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', height: 32, display: 'flex', alignItems: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--clr-accent)'} onMouseLeave={e => e.currentTarget.style.background='var(--clr-primary)'}>
                        Apply Filters
                    </button>
                    <button style={{ background: 'transparent', color: 'var(--clr-text-muted)', border: 'none', padding: '0 8px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', height: 32, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='var(--clr-primary)'} onMouseLeave={e => e.currentTarget.style.color='var(--clr-text-muted)'}>
                        <RefreshCcw size={14} /> Reset
                    </button>
                </div>
            </div>

            {/* 2. KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
                {KPIData.map((kpi, idx) => (
                    <div key={idx} className="card" style={{ padding: '14px 14px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {/* Title Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div className={`icon-box ${kpi.iconColor}`}>
                                <kpi.icon size={14} strokeWidth={2.5} />
                            </div>
                            <div className="kpi-title">{kpi.title}</div>
                        </div>
                        
                        {/* Value & Change */}
                        <div style={{ zIndex: 1 }}>
                            <div className="kpi-val">{kpi.value}</div>
                            <div className="kpi-change" style={{ color: kpi.isRed ? 'var(--clr-danger)' : 'var(--clr-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: '0.65rem' }}>{kpi.isPositive ? '?' : '?'}</span> 
                                <span>{kpi.change}</span> 
                                <span style={{ color: 'var(--clr-text-dim)', fontWeight: 500, fontSize: '0.6rem', marginLeft: 2 }}>vs. Feb 2025</span>
                            </div>
                        </div>
                        
                        {/* Sparkline overlay right-bottom */}
                        <div style={{ position: 'absolute', bottom: 8, right: 0, width: '45%', height: 35, opacity: 0.9 }}>
                            <Sparkline data={kpi.sparklineData} colorClass={kpi.colorClass} />
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. CHARTS ROW */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {/* Trade Working Capital Trend */}
                <div className="card" style={{ flex: 2, padding: 18 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--clr-text)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BarChart3 size={16} color="var(--clr-primary)" /> Trade Working Capital Trend
                    </div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={twcTrendData} margin={{ top: 20, right: 20, bottom: 0, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border-strong)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} dy={10} />
                                <YAxis label={{ value: 'AED Million', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: 'var(--clr-text-muted)', fontSize: 10} }} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, color: 'var(--clr-text-muted)', paddingTop: 10 }} iconType="square" iconSize={8} />
                                <Bar name="Trade Receivables" dataKey="tr" stackId="a" fill="var(--clr-primary)" barSize={20} />
                                <Bar name="Inventories" dataKey="inv" stackId="a" fill="var(--clr-cyan)" />
                                <Bar name="Trade Payables" dataKey="tp" stackId="a" fill="var(--clr-success)" radius={[3, 3, 0, 0]} />
                                <Line name="Trade Working Capital" type="monotone" dataKey="twc" stroke="var(--clr-text)" strokeWidth={2} dot={{ r: 4, fill: 'var(--clr-text)' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue by Region */}
                <div className="card" style={{ flex: 1.2, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Globe size={16} color="var(--clr-primary)" /> Revenue by Region
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-dim)', fontWeight: 600 }}>AED Million</div>
                    </div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={revenueRegionData} margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--clr-border-strong)" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)', fontWeight: 600 }} width={50} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--clr-surface-2)'}} />
                                <Bar dataKey="value" fill="var(--clr-primary)" barSize={16} radius={[0, 4, 4, 0]}>
                                    {revenueRegionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="var(--clr-primary)" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profitability by Region */}
                <div className="card" style={{ flex: 1.2, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart3 size={16} color="var(--clr-primary)" /> Profitability by Region
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-dim)', fontWeight: 600 }}>AED Million</div>
                    </div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={profitRegionData} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clr-border-strong)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)', fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--clr-text-muted)' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--clr-surface-2)'}} />
                                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, color: 'var(--clr-text-muted)', paddingTop: 10 }} iconType="square" iconSize={8} />
                                <Bar name="Gross Profit" dataKey="gp" fill="var(--clr-primary)" barSize={14} radius={[3, 3, 0, 0]} />
                                <Bar name="Net Profit" dataKey="np" fill="var(--clr-success)" barSize={14} radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. TABLE */}
            <div className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--clr-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} color="var(--clr-primary)" /> Key Financial Parameters
                    </div>
                    <div style={{ display: 'flex', background: 'var(--clr-surface-2)', borderRadius: 6, padding: 3, border: '1px solid var(--clr-border)' }}>
                        <button style={{ background: 'var(--clr-primary)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Values</button>
                        <button style={{ background: 'transparent', color: 'var(--clr-text-muted)', border: 'none', padding: '6px 16px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Ratios / Days</button>
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
                                <tr key={idx} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--clr-surface-2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                                    <td className="td-cell" style={{ color: 'var(--clr-text)', fontWeight: 800 }}>{row.param}</td>
                                    <td className="td-cell" style={{ fontFamily: 'var(--font-mono)' }}>{row.m1}</td>
                                    <td className="td-cell" style={{ fontFamily: 'var(--font-mono)' }}>{row.m2}</td>
                                    <td className="td-cell" style={{ color: row.momRed ? 'var(--clr-danger)' : 'var(--clr-success)', fontFamily: 'var(--font-mono)' }}>
                                        {row.momPos ? '?' : '?'} {row.mom}
                                    </td>
                                    <td className="td-cell" style={{ fontFamily: 'var(--font-mono)' }}>{row.m3}</td>
                                    <td className="td-cell" style={{ color: row.yoyRed ? 'var(--clr-danger)' : 'var(--clr-success)', fontFamily: 'var(--font-mono)' }}>
                                        {row.yoyPos ? '?' : '?'} {row.yoy}
                                    </td>
                                    <td className="td-cell" style={{ width: 100, height: 40, padding: '4px 16px' }}>
                                        <Sparkline data={[10, 15, 12, 18, 16, 22, 20, 25, 23, 28, 26, 30]} colorClass="blue" />
                                    </td>
                                    <td className="td-cell" style={{ color: 'var(--clr-text-muted)', fontWeight: 500 }}>{row.comment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
