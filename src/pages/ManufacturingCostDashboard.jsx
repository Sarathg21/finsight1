import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, LineChart, Line, ComposedChart, Area, ReferenceLine
} from "recharts";

/**
 * ManufacturingCostDashboard.jsx
 * Standalone mock-data dashboard. Inline styles follow the supplied Sales page
 * conventions: navy headings, compact controls, rounded white panels, animated
 * KPI cards, green/red variance, and Excel/PDF actions.
 * No backend API is called.
 */

const COLORS = {
    navy: "#172554", blue: "#2563eb", muted: "#64748b", border: "#e2e8f0",
    green: "#10b981", purple: "#8b5cf6", orange: "#f59e0b", red: "#dc2626",
    teal: "#14b8a6", panel: "#ffffff", page: "#f5f8fc"
};

const months = ["Jan-26", "Feb-26", "Mar-26", "Apr-26", "May-26", "Jun-26", "Jul-26", "Aug-26", "Sep-26", "Oct-26"];
const trendData = [
    { month: "Jan-26", material: 52, materialTarget: 56, labour: 7, labourTarget: 8, overheads: 16, overheadsTarget: 19, actual: 75, target: 83 },
    { month: "Feb-26", material: 62, materialTarget: 64, labour: 8, labourTarget: 9, overheads: 17, overheadsTarget: 20, actual: 87, target: 93 },
    { month: "Mar-26", material: 50, materialTarget: 54, labour: 7, labourTarget: 8, overheads: 16, overheadsTarget: 20, actual: 73, target: 82 },
    { month: "Apr-26", material: 52, materialTarget: 55, labour: 7, labourTarget: 8, overheads: 15, overheadsTarget: 18, actual: 74, target: 81 },
    { month: "May-26", material: 47, materialTarget: 50, labour: 6, labourTarget: 7, overheads: 16, overheadsTarget: 19, actual: 69, target: 76 },
    { month: "Jun-26", material: 60, materialTarget: 62, labour: 7, labourTarget: 8, overheads: 17, overheadsTarget: 20, actual: 84, target: 90 },
    { month: "Jul-26", material: 68, materialTarget: 71, labour: 8, labourTarget: 9, overheads: 19, overheadsTarget: 22, actual: 95, target: 102 },
    { month: "Aug-26", material: 69, materialTarget: 72, labour: 8, labourTarget: 9, overheads: 18, overheadsTarget: 21, actual: 95, target: 102 },
    { month: "Sep-26", material: 69, materialTarget: 73, labour: 7, labourTarget: 8, overheads: 19, overheadsTarget: 22, actual: 95, target: 103 },
    { month: "Oct-26", material: 15, materialTarget: 17, labour: 2, labourTarget: 3, overheads: 6, overheadsTarget: 8, actual: 23, target: 28 }
];

const costMix = [
    { name: "Cost of Material", amount: 10.25, pct: 75.2, color: "#14b8a6" },
    { name: "Direct Labour", amount: 0.44, pct: 3.2, color: "#8b5cf6" },
    { name: "Manufacturing Overheads", amount: 0.35, pct: 2.6, color: "#f59e0b" },
    { name: "Operating Expenses", amount: 2.74, pct: 19.0, color: "#f97316" }
];

const drillRows = [
    ["COST OF MATERIAL", 10247594, 10900000, 652406, 547670039, 560000000, 12398961],
    ["DIRECT LABOUR", 441123, 520000, 78877, 44590420, 48000000, 3490580],
    ["MANUFACTURING / DIRECT OVERHEADS", 349588, 410000, 60434, 30428848, 31000000, 1471318],
    ["OVERHEAD ABSORPTION", 198894, 0, -198894, 11340052, 0, -11340052],
    ["UTILITIES & PLANT CONSUMABLES", 1181090, 1050000, -130000, 9800000, 9500000, -300000],
    ["MAINTENANCE", 693000, 720000, 27000, 5900000, 6200000, 300000],
    ["OTHER FACTORY EXPENSES", 1081894, 1200000, 118106, 34200000, 37800000, 2800000]
].map(([category, actualPtd, targetPtd, variancePtd, actualYtd, targetYtd, varianceYtd]) =>
    ({ category, actualPtd, targetPtd, variancePtd, actualYtd, targetYtd, varianceYtd }));

const monthAnalysis = trendData.map((d) => ({
    ...d, variance: d.target - d.actual
}));

const fmtM = (n) => `AED ${Number(n).toFixed(2)}M`;
const fmtNum = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtMillions = (n) => `${(Number(n) / 1_000_000).toFixed(2)}M`;

function CountUp({ value, formatter = (v) => v.toLocaleString("en-US", { maximumFractionDigits: 2 }), duration = 850 }) {
    const [shown, setShown] = React.useState(0);
    React.useEffect(() => {
        let start;
        let raf;
        const tick = (time) => {
            if (!start) start = time;
            const p = Math.min((time - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setShown(value * eased);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, duration]);
    return <>{formatter(shown)}</>;
}

function ExportButtons({ onExcel, onPdf }) {
    const buttonBase = { display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 9, fontSize: 12, fontWeight: 800, cursor: "pointer", transition: "transform .15s, box-shadow .15s" };
    return <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onExcel} style={{ ...buttonBase, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>▦ Excel</button>
        <button onClick={onPdf} style={{ ...buttonBase, color: "#be123c", background: "#fff1f2", border: "1px solid #fecdd3" }}>▤ PDF</button>
    </div>;
}

function Panel({ title, subtitle, action, children, style = {} }) {
    return <section style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "13px 15px", boxShadow: "0 2px 7px rgba(15,23,42,.035)", minWidth: 0, ...style }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <div><div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-.025em", color: COLORS.navy }}>{title}</div>
                {subtitle && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>{subtitle}</div>}</div>
            {action}
        </div>
        {children}
    </section>;
}

function KpiCard({ item, delay }) {
    return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, delay }}
        whileHover={{ y: -3, boxShadow: "0 10px 24px rgba(15,23,42,.09)" }}
        style={{ borderRadius: 13, padding: "12px 13px", minHeight: 88, background: item.bg, border: "1px solid rgba(255,255,255,.8)", display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ffffffd9", border: `1px solid ${item.color}35`, display: "grid", placeItems: "center", color: item.color, fontSize: 23, flexShrink: 0 }}>{item.icon}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, color: item.color, fontWeight: 800, lineHeight: 1.25 }}>{item.label}</div>
            <div style={{ fontSize: 20, color: COLORS.navy, fontWeight: 850, letterSpacing: "-.035em", marginTop: 3, lineHeight: 1.2 }}>
                {item.percent ? <CountUp value={item.value} formatter={(v) => `${v.toFixed(1)}%`} /> : <>AED <CountUp value={item.value} formatter={(v) => v.toFixed(2)} />M</>}
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Target: {item.percent ? `${item.target.toFixed(1)}%` : `AED ${item.target.toFixed(2)}M`}</div>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: item.favorable ? "#15803d" : "#dc2626", marginTop: 3 }}>
                {item.favorable ? "▼" : "▼"} {item.delta} {item.favorable ? "Favorable" : "Unfavorable"}
            </div>
        </div>
    </motion.div>;
}

function Filter({ label, value, onChange, options, icon = "◈" }) {
    return <label style={{ display: "block", minWidth: 0 }}>
        <span style={{ display: "block", color: "#334155", fontSize: 11, fontWeight: 800, margin: "0 0 5px 2px" }}>{label}</span>
        <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: 10, fontSize: 14, color: "#64748b", pointerEvents: "none" }}>{icon}</span>
            <select value={value} onChange={(e) => onChange(e.target.value)} style={{ appearance: "none", width: "100%", height: 36, borderRadius: 8, border: "1px solid #dbe3ef", background: "#fff", color: "#334155", padding: "0 28px 0 30px", fontSize: 11.5, fontWeight: 650, outline: "none", cursor: "pointer" }}>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <span style={{ position: "absolute", right: 10, color: "#64748b", pointerEvents: "none", fontSize: 12 }}>⌄</span>
        </span>
    </label>;
}

function TooltipBox({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return <div style={{ background: "#fff", border: "1px solid #dbe3ef", borderRadius: 8, padding: "8px 10px", boxShadow: "0 6px 18px #0f172a18", fontSize: 11 }}>
        <div style={{ fontWeight: 800, color: COLORS.navy, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color || "#334155", marginTop: 2 }}>{p.name}: {typeof p.value === "number" ? `${p.value.toFixed(1)}M` : p.value}</div>)}
    </div>;
}

export default function ManufacturingCostDashboard() {
    const [filters, setFilters] = useState({ legalGroup: "All Legal Groups", legalEntity: "All Legal Entities", parent: "All Parent Divisions", sub: "All Sub-Divisions", year: "2026", period: "Oct-26" });
    const [viewAll, setViewAll] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [viewBy, setViewBy] = useState("Legal Entity");
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);

    const update = (key, value) => setFilters((old) => ({ ...old, [key]: value }));
    const kpis = useMemo(() => [
        { label: "Cost of Material (PTD)", value: 10.25, target: 10.90, delta: "AED 0.65M", favorable: true, icon: "▤", color: "#0f9f8f", bg: "#e9faf5" },
        { label: "Cost of Material % against Revenue (PTD)", value: 18.6, target: 19.2, delta: "0.6 pts", favorable: true, percent: true, icon: "▥", color: "#7c3aed", bg: "#f3edff" },
        { label: "Manufacturing Expense (PTD)", value: 0.79, target: 0.93, delta: "AED 0.14M", favorable: true, icon: "⬡", color: "#d97706", bg: "#fff6e8" },
        { label: "Manufacturing Cost % against Total Material Consumed (PTD)", value: 7.7, target: 8.5, delta: "0.8 pts", favorable: true, percent: true, icon: "%", color: "#2563eb", bg: "#eaf4ff" },
        { label: "Overhead Absorption (PTD)", value: 98.1, target: 100, delta: "1.9 pts", favorable: false, percent: true, icon: "◔", color: "#d97706", bg: "#fff5e8" },
        { label: "Cost of Material (YTD)", value: 547.60, target: 560, delta: "AED 12.40M", favorable: true, icon: "▤", color: "#0f9f8f", bg: "#e9faf5" },
        { label: "Cost of Material % against Revenue (YTD)", value: 18.9, target: 19.4, delta: "0.5 pts", favorable: true, percent: true, icon: "▥", color: "#7c3aed", bg: "#f3edff" },
        { label: "Manufacturing Expense (YTD)", value: 75.02, target: 78.70, delta: "AED 3.68M", favorable: true, icon: "⬡", color: "#d97706", bg: "#fff6e8" },
        { label: "Manufacturing Cost % against Total Material Consumed (YTD)", value: 13.7, target: 14.1, delta: "0.4 pts", favorable: true, percent: true, icon: "%", color: "#2563eb", bg: "#eaf4ff" },
        { label: "Overhead Absorption (YTD)", value: 98.0, target: 100, delta: "2.0 pts", favorable: false, percent: true, icon: "◔", color: "#d97706", bg: "#fff5e8" }
    ], []);

    const exportExcel = () => {
        const headers = ["Cost Category", "Actual PTD", "Target PTD", "Variance PTD", "Actual YTD", "Target YTD", "Variance YTD"];
        const rows = drillRows.map(r => [r.category, r.actualPtd, r.targetPtd, r.variancePtd, r.actualYtd, r.targetYtd, r.varianceYtd]);
        const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
        const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "Manufacturing_Cost_Dashboard.csv"; a.click(); URL.revokeObjectURL(url);
    };
    const exportPdf = () => window.print();

    const visibleRows = drillRows.filter(r => r.category.toLowerCase().includes(search.toLowerCase())).slice(0, pageSize);
    const panelButton = { border: "1px solid #dbe3ef", background: "#fff", color: COLORS.navy, borderRadius: 7, padding: "5px 9px", fontSize: 10.5, fontWeight: 750, cursor: "pointer" };

    return <div style={{ minHeight: "100vh", background: COLORS.page, padding: "10px clamp(10px, 1.8vw, 28px) 24px", color: COLORS.navy, fontFamily: "Inter, Segoe UI, Arial, sans-serif", boxSizing: "border-box" }}>
        <style>{`
      * { box-sizing: border-box; }
      @keyframes shimmer { 0% {background-position: 200% 0} 100% {background-position: -200% 0} }
      @keyframes enterUp { from { opacity:0; transform:translateY(8px) } to {opacity:1;transform:translateY(0)} }
      .mfg-select:focus { border-color:#93c5fd !important; box-shadow:0 0 0 3px #dbeafe; }
      .mfg-row:hover { background:#eff6ff !important; }
      .mfg-action:hover { transform:translateY(-1px); box-shadow:0 4px 10px #0f172a12; }
      @media (max-width: 1000px) { .mfg-filter-grid { grid-template-columns:repeat(3,minmax(0,1fr)) !important; } .mfg-content-grid { grid-template-columns:1fr !important; } .mfg-kpi-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; } }
      @media (max-width: 600px) { .mfg-filter-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; } .mfg-kpi-grid { grid-template-columns:1fr !important; } .mfg-header { align-items:flex-start !important; flex-direction:column !important; } }
      @media print { body { background:#fff !important; } .no-print { display:none !important; } .print-panel { break-inside:avoid; box-shadow:none !important; } }
    `}</style>

        <header className="mfg-header print-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 13, padding: "10px 15px", marginBottom: 10, boxShadow: "0 2px 7px rgba(15,23,42,.035)" }}>
            <div style={{ minWidth: 0 }}>
                <h1 style={{ margin: 0, fontSize: "clamp(19px, 2vw, 27px)", letterSpacing: "-.04em", lineHeight: 1.15, fontWeight: 850, color: "#101e55" }}>Manufacturing Cost &amp; Production Performance</h1>
                <div style={{ marginTop: 4, fontSize: 12, color: COLORS.muted }}>Monitor cost structure, manufacturing expenses, and target vs actual performance.</div>
                <div style={{ marginTop: 3, fontSize: 11, color: "#64748b" }}>All values in AED | {filters.period}</div>
            </div>
            <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <ExportButtons onExcel={exportExcel} onPdf={exportPdf} />
                <div style={{ position: "relative" }}>
                    <button className="mfg-action" onClick={() => setMenuOpen(v => !v)} aria-label="More options" style={{ width: 36, height: 36, border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 9, color: COLORS.navy, fontSize: 20, cursor: "pointer" }}>⋮</button>
                    {menuOpen && <div style={{ position: "absolute", right: 0, top: 41, zIndex: 30, width: 170, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 9, boxShadow: "0 12px 30px #0f172a1c", overflow: "hidden" }}>
                        <button onClick={() => { setViewAll("Manufacturing Cost Drill-Down"); setMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "10px 12px", textAlign: "left", background: "#fff", border: 0, fontSize: 12, cursor: "pointer", color: COLORS.navy }}>⌕ View All Details</button>
                        <button onClick={() => { exportExcel(); setMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "10px 12px", textAlign: "left", background: "#fff", border: 0, borderTop: `1px solid ${COLORS.border}`, fontSize: 12, cursor: "pointer", color: COLORS.navy }}>▦ Export Excel</button>
                        <button onClick={() => { exportPdf(); setMenuOpen(false); }} style={{ display: "block", width: "100%", padding: "10px 12px", textAlign: "left", background: "#fff", border: 0, borderTop: `1px solid ${COLORS.border}`, fontSize: 12, cursor: "pointer", color: COLORS.navy }}>▤ Export PDF</button>
                    </div>}
                </div>
            </div>
        </header>

        <section className="mfg-filter-grid print-panel" style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 10, padding: "9px 10px", marginBottom: 10, borderRadius: 12, border: `1px solid ${COLORS.border}`, background: "#fbfdff" }}>
            <Filter label="Legal Group" value={filters.legalGroup} onChange={v => { update("legalGroup", v); update("legalEntity", "All Legal Entities"); }} options={["All Legal Groups", "FJ Group", "RKME Group"]} icon="♧" />
            <Filter label="Legal Entity" value={filters.legalEntity} onChange={v => update("legalEntity", v)} options={["All Legal Entities", ...(filters.legalGroup === "RKME Group" ? ["RKME Manufacturing LLC", "RKME Trading LLC"] : filters.legalGroup === "FJ Group" ? ["FJ Manufacturing LLC", "FJ Trading LLC"] : ["FJ Manufacturing LLC", "FJ Trading LLC", "RKME Manufacturing LLC"])]} icon="▣" />
            <Filter label="Parent Division" value={filters.parent} onChange={v => { update("parent", v); update("sub", "All Sub-Divisions"); }} options={["All Parent Divisions", "Manufacturing", "Operations", "Corporate"]} icon="♧" />
            <Filter label="Sub-Division" value={filters.sub} onChange={v => update("sub", v)} options={["All Sub-Divisions", "Plant A", "Plant B", "Utilities", "Maintenance"]} icon="♧" />
            <Filter label="Year" value={filters.year} onChange={v => update("year", v)} options={["2026", "2025", "2024"]} icon="▦" />
            <Filter label="Period" value={filters.period} onChange={v => update("period", v)} options={months} icon="▦" />
        </section>

        <section className="mfg-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 9, marginBottom: 9 }}>
            {kpis.map((item, i) => <KpiCard key={item.label} item={item} delay={i * .035} />)}
        </section>

        <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 9, padding: "7px 11px", marginBottom: 10, background: "#f8fafc", color: "#64748b", fontSize: 11, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ display: "grid", placeItems: "center", width: 17, height: 17, borderRadius: "50%", background: "#e0e7ff", color: "#3730a3", fontWeight: 900, flexShrink: 0 }}>i</span>
            Interim budget phasing: PTD Target = Annual Budget ÷ 12; YTD Target = Annual Budget × elapsed months ÷ 12. Production KPIs compare actual plant performance against the approved operating plan.
        </div>

        <div className="mfg-content-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.65fr) minmax(350px,1fr)", gap: 12, alignItems: "start" }}>
            <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
                <Panel title="Monthly Manufacturing Cost Trend" subtitle="Actual vs Target by cost category" style={{ minHeight: 265 }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, flexWrap: "wrap", margin: "-31px 0 3px", fontSize: 10.5, color: "#475569" }}>
                        {[["#14b8a6", "Material (Actual)"], ["#8b5cf6", "Labour (Actual)"], ["#f59e0b", "Overheads (Actual)"]].map(([c, t]) => <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i style={{ width: 10, height: 10, background: c, borderRadius: 3 }} />{t}</span>)}
                    </div>
                    <div style={{ height: 190, marginTop: 12 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} margin={{ top: 7, right: 5, left: -15, bottom: 0 }} barGap={1} barCategoryGap="26%">
                                <CartesianGrid stroke="#e8eef6" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}M`} />
                                <Tooltip content={<TooltipBox />} />
                                <Bar dataKey="material" name="Material Actual" fill="#14b8a6" radius={[2, 2, 0, 0]} isAnimationActive />
                                <Bar dataKey="materialTarget" name="Material Target" fill="#14b8a6" fillOpacity={0.16} stroke="#14b8a6" strokeDasharray="4 3" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="labour" name="Labour Actual" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="labourTarget" name="Labour Target" fill="#8b5cf6" fillOpacity={0.16} stroke="#8b5cf6" strokeDasharray="4 3" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="overheads" name="Overheads Actual" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="overheadsTarget" name="Overheads Target" fill="#f59e0b" fillOpacity={0.16} stroke="#f59e0b" strokeDasharray="4 3" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>

                <Panel title="Manufacturing Cost Drill-Down" subtitle="Actual, target and variance by cost category" action={<button className="mfg-action" style={panelButton} onClick={() => setViewAll("Manufacturing Cost Drill-Down")}>⌕ View All</button>}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 10.5, minWidth: 650 }}>
                            <thead><tr>{["COST CATEGORY", "ACTUAL PTD", "TARGET PTD", "VARIANCE PTD", "ACTUAL YTD", "TARGET YTD", "VARIANCE YTD"].map((h, i) => <th key={h} style={{ textAlign: i === 0 ? "left" : "right", padding: "7px 6px", color: "#475569", fontSize: 9.5, background: "#f8fafc", borderBottom: "1px solid #dbe3ef", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                            <tbody>{drillRows.map((r, idx) => <tr className="mfg-row" key={r.category} style={{ background: idx % 2 ? "#fbfcff" : "#fff" }}>
                                <td style={{ padding: "6px", color: COLORS.navy, fontWeight: 700, borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}><span style={{ color: "#94a3b8", marginRight: 8 }}>›</span>{r.category}</td>
                                {[r.actualPtd, r.targetPtd, r.variancePtd, r.actualYtd, r.targetYtd, r.varianceYtd].map((v, i) => <td key={i} style={{ textAlign: "right", padding: "6px", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap", fontWeight: i === 2 || i === 5 ? 800 : 550, color: i === 2 || i === 5 ? (v >= 0 ? "#16a34a" : "#dc2626") : "#334155" }}>{fmtNum(v)}{(i === 2 || i === 5) ? (v >= 0 ? " F" : " U") : ""}</td>)}
                            </tr>)}</tbody>
                            <tfoot><tr style={{ background: "#f1efff", fontWeight: 900 }}>{["TOTAL", ...[drillRows.reduce((s, r) => s + r.actualPtd, 0), drillRows.reduce((s, r) => s + r.targetPtd, 0), drillRows.reduce((s, r) => s + r.variancePtd, 0), drillRows.reduce((s, r) => s + r.actualYtd, 0), drillRows.reduce((s, r) => s + r.targetYtd, 0), drillRows.reduce((s, r) => s + r.varianceYtd, 0)]].map((v, i) => <td key={i} style={{ padding: "7px 6px", textAlign: i ? "right" : "left", color: i === 0 ? COLORS.navy : (i === 3 || i === 6) ? (v >= 0 ? "#15803d" : "#dc2626") : COLORS.navy, whiteSpace: "nowrap" }}>{i === 0 ? v : fmtNum(v)}</td>)}</tr></tfoot>
                        </table>
                    </div>
                </Panel>
            </div>

            <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
                <Panel title="Current PTD Cost Mix" subtitle="Share of current period cost">
                    <div style={{ display: "grid", gap: 9 }}>
                        {costMix.map((item) => <div key={item.name} style={{ display: "grid", gridTemplateColumns: "minmax(100px,.8fr) minmax(70px,1.7fr) 88px", gap: 8, alignItems: "center" }}>
                            <div style={{ color: "#334155", fontSize: 11, lineHeight: 1.2, fontWeight: 750 }}>{item.name}</div>
                            <div style={{ height: 21, background: "#f1f5f9", borderRadius: 5, overflow: "hidden" }}><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(item.pct, 100)}%` }} transition={{ duration: .8, delay: .1 }} style={{ height: "100%", borderRadius: 5, background: item.color }} /></div>
                            <div style={{ fontSize: 10.5, lineHeight: 1.25, color: "#475569" }}><b style={{ color: COLORS.navy }}>AED {item.amount.toFixed(2)}M</b><br />{item.pct.toFixed(1)}%</div>
                        </div>)}
                    </div>
                </Panel>

                <Panel title="Production Efficiency KPIs">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 6 }}>
                        {[
                            { icon: "🌱", title: "Material Usage Variance", value: "-1.8%", target: "0.0%", color: "#10b981", fill: 72 },
                            { icon: "♟", title: "Labour Efficiency", value: "92.8%", target: "95.0%", color: "#8b5cf6", fill: 78 },
                            { icon: "⚠", title: "Scrap Rate", value: "2.9%", target: "2.0%", color: "#f59e0b", fill: 62 },
                            { icon: "⚙", title: "Machine Utilization", value: "88.4%", target: "90.0%", color: "#2563eb", fill: 84 }
                        ].map(k => <div key={k.title} style={{ minWidth: 0, border: "1px solid #e5eaf2", background: "#f8fafc", borderRadius: 10, padding: "9px 7px" }}>
                            <div style={{ display: "flex", gap: 5, alignItems: "center", color: k.color, fontSize: 13 }}><span>{k.icon}</span><span style={{ color: "#64748b", fontSize: 9, lineHeight: 1.15 }}>{k.title}</span></div>
                            <div style={{ fontSize: 14, color: COLORS.navy, fontWeight: 850, marginTop: 5 }}>{k.value}</div>
                            <div style={{ height: 5, background: "#e2e8f0", borderRadius: 5, overflow: "hidden", marginTop: 5 }}><div style={{ width: `${k.fill}%`, height: "100%", background: k.color, borderRadius: 5 }} /></div>
                            <div style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}>Target: {k.target}</div>
                        </div>)}
                    </div>
                </Panel>

                <Panel title="Month-on-Month Analysis" subtitle="Cost trend by selected dimension (Actual vs Target)" action={<select className="mfg-select" value={viewBy} onChange={e => setViewBy(e.target.value)} style={{ maxWidth: 135, border: "1px solid #dbe3ef", borderRadius: 8, padding: "6px 8px", fontSize: 10.5, background: "#fff", color: COLORS.navy }}><option>Legal Entity</option><option>Parent Division</option><option>Sub-Division</option></select>}>
                    <div style={{ height: 150 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthAnalysis} margin={{ top: 5, right: 0, left: -17, bottom: 0 }}>
                                <CartesianGrid stroke="#e8eef6" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} tickLine={false} axisLine={false} tickFormatter={v => `${v}M`} />
                                <Tooltip content={<TooltipBox />} />
                                <Area dataKey="variance" name="Variance" fill="#bfdbfe" fillOpacity={0.55} stroke="none" />
                                <Line type="monotone" dataKey="actual" name="Actual" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 2.5, fill: "#14b8a6" }} isAnimationActive />
                                <Line type="monotone" dataKey="target" name="Target" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 2.5, fill: "#fff", stroke: "#8b5cf6", strokeWidth: 1.5 }} isAnimationActive />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>View by: <b style={{ color: COLORS.navy }}>{viewBy}</b> · Mock values for visual preview</div>
                </Panel>
            </div>
        </div>

        <AnimatePresence>
            {viewAll && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15,23,42,.42)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", padding: 16 }} onMouseDown={e => { if (e.target === e.currentTarget) setViewAll(""); }}>
                <motion.div initial={{ y: 15, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, scale: .98 }} style={{ width: "min(1200px, 96vw)", maxHeight: "92vh", background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 80px #0f172a40" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "15px 18px", borderBottom: `1px solid ${COLORS.border}`, background: "linear-gradient(90deg,#f8fafc,#fff)" }}>
                        <div><div style={{ fontSize: 16, fontWeight: 850, color: COLORS.navy }}>{viewAll}</div><div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>Mock data · {filters.legalGroup} · {filters.period}</div></div>
                        <button onClick={() => setViewAll("")} style={{ border: 0, background: "#f1f5f9", color: COLORS.navy, borderRadius: 8, width: 32, height: 32, fontSize: 17, cursor: "pointer" }}>×</button>
                    </div>
                    <div className="no-print" style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", borderBottom: `1px solid ${COLORS.border}`, background: "#fafbfc" }}>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cost category..." style={{ height: 33, minWidth: 220, border: "1px solid #cbd5e1", borderRadius: 8, padding: "0 10px", fontSize: 12 }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: COLORS.muted }}>Rows <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} style={{ border: "1px solid #cbd5e1", borderRadius: 6, padding: 5, background: "#fff" }}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select><ExportButtons onExcel={exportExcel} onPdf={exportPdf} /></div>
                    </div>
                    <div style={{ overflow: "auto", padding: "0 16px 12px" }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 720, fontSize: 11 }}>
                            <thead style={{ position: "sticky", top: 0, zIndex: 3 }}><tr>{["Cost Category", "Actual PTD", "Target PTD", "Variance PTD", "Actual YTD", "Target YTD", "Variance YTD"].map((h, i) => <th key={h} style={{ position: "sticky", top: 0, background: "#f1f5f9", color: COLORS.navy, textAlign: i ? "right" : "left", padding: "11px 9px", borderBottom: "2px solid #cbd5e1", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                            <tbody>{visibleRows.map((r, idx) => <tr className="mfg-row" key={r.category} style={{ background: idx % 2 ? "#f8fafc" : "#fff" }}><td style={{ padding: "10px 9px", fontWeight: 750, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{r.category}</td>{[r.actualPtd, r.targetPtd, r.variancePtd, r.actualYtd, r.targetYtd, r.varianceYtd].map((v, i) => <td key={i} style={{ padding: "10px 9px", textAlign: "right", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", color: i === 2 || i === 5 ? (v >= 0 ? "#15803d" : "#dc2626") : "#334155", fontWeight: i === 2 || i === 5 ? 750 : 500 }}>{fmtNum(v)}</td>)}</tr>)}</tbody>
                            <tfoot><tr>{["Total", drillRows.reduce((s, r) => s + r.actualPtd, 0), drillRows.reduce((s, r) => s + r.targetPtd, 0), drillRows.reduce((s, r) => s + r.variancePtd, 0), drillRows.reduce((s, r) => s + r.actualYtd, 0), drillRows.reduce((s, r) => s + r.targetYtd, 0), drillRows.reduce((s, r) => s + r.varianceYtd, 0)].map((v, i) => <td key={i} style={{ position: "sticky", bottom: 0, zIndex: 4, background: "#f1f5f9", borderTop: "2px solid #cbd5e1", padding: "11px 9px", textAlign: i ? "right" : "left", fontWeight: 900, color: i === 3 || i === 6 ? (v >= 0 ? "#15803d" : "#dc2626") : COLORS.navy, whiteSpace: "nowrap" }}>{i === 0 ? v : fmtNum(v)}</td>)}</tr></tfoot>
                        </table>
                    </div>
                    <div style={{ padding: "10px 18px", borderTop: `1px solid ${COLORS.border}`, background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: COLORS.muted }}><span>Showing {visibleRows.length} of {drillRows.filter(r => r.category.toLowerCase().includes(search.toLowerCase())).length} records</span><button onClick={() => setViewAll("")} style={{ background: "#e2e8f0", border: 0, borderRadius: 8, padding: "7px 17px", fontWeight: 800, color: COLORS.navy, cursor: "pointer" }}>Close</button></div>
                </motion.div>
            </motion.div>}
        </AnimatePresence>
    </div>;
}
