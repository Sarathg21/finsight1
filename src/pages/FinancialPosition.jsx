

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     ResponsiveContainer,
//     BarChart,
//     Bar,
//     LineChart,
//     Line,
//     ComposedChart,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     Legend,
//     Cell,
// } from "recharts";

// /**
//  * FinancialPositionOverview.jsx
//  *
//  * Financial Position page with API-driven financial data and inline styles.
//  * No external CSS file is required.
//  *
//  * Required dependencies:
//  *   npm install framer-motion recharts
//  *
//  * Optional theme import:
//  *   Replace the fallback colors below with your own theme.js values
//  *   if required by your project.
//  */

// const COLORS = {
//     page: "#f8fafc",
//     surface: "#ffffff",
//     text: "#0f172a",
//     heading: "#1e293b",
//     muted: "#64748b",
//     subtle: "#94a3b8",
//     border: "#e2e8f0",
//     borderSoft: "#eef2f7",
//     primary: "#4f46e5",
//     primaryBlue: "#2563eb",
//     focus: "#818cf8",
//     green: "#10b981",
//     greenDark: "#16a34a",
//     red: "#ef4444",
//     purple: "#7c3aed",
//     amber: "#f59e0b",
//     teal: "#14b8a6",
//     lightBlue: "#eef6ff",
// };

// const CHART_COLORS = [
//     "#2563eb",
//     "#4f46e5",
//     "#14b8a6",
//     "#f59e0b",
//     "#7c3aed",
//     "#ef4444",
// ];

// const shadow = "0 4px 24px rgba(15,23,42,.035), 0 1px 3px rgba(15,23,42,.035)";
// const shadowHover = "0 8px 26px rgba(15,23,42,.08)";
// const font = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

// import {
//     getFinancialPositionKpis,
//     getFinancialPositionEquityContribution,
//     getFinancialPositionEquityViewAll,
//     getFinancialPositionEquityMonthlyByParentDivision,
//     getFinancialPositionInvestmentsByParentDivision,
//     getFinancialPositionInvestmentsMonthlyByParentDivision,
//     getFinancialPositionBorrowingsByParentDivision,
//     getFinancialPositionBorrowingsMonthlyByParentDivision,
//     getFinancialPositionNetWorkingCapitalTrend,
//     getFinancialPositionCurrentAssetsLiabilitiesComposition,
//     getFinancialPositionCurrentAssetsLiabilitiesViewAll,
// } from "../api/financialPositionApi";

// import {
//     getWorkingCapitalFilterOptions,
// } from "../api/workingCapital";

// const styles = {
//     page: { padding: '20px 0 32px', background: '#f8fafc', minHeight: '100%', color: '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', boxSizing: 'border-box' },
//     pageHeader: { marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 },
//     headerControls: { display: 'flex', gap: 4, alignItems: 'center' },
//     select: { appearance: 'none', padding: '6px 28px 6px 10px', fontSize: '0.78rem', fontWeight: 500, color: '#334155', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 7, cursor: 'pointer', outline: 'none' },
//     kpiGrid: { marginBottom: 16, display: 'grid', gap: 10, width: '100%' },
//     heading: { minWidth: 0 },
//     title: { fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 4 },
//     subtitle: { fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0', lineHeight: 1.45 },
//     updated: { color: '#94a3b8', fontSize: '.62rem', fontWeight: 500 },
//     card: { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,.035)', padding: '12px 14px', minWidth: 0 },
//     kpiCard: { background: '#fff', borderRadius: 12, padding: '10px 10px', boxShadow: 'none', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center', gap: 8, overflow: 'visible', position: 'relative', minHeight: 74 },
//     kpiTop: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 },
//     kpiLabel: { fontSize: '0.66rem', color: '#1e3a8a', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
//     kpiValue: { color: '#0f172a', fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.025em', marginTop: 5 },
//     kpiTrend: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, color: '#16a34a', fontSize: '.6rem', fontWeight: 700 },
//     cardHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
//     cardTitle: { color: '#0f172a', fontSize: '.8rem', lineHeight: 1.25, fontWeight: 800 },
//     cardSubtitle: { color: '#64748b', marginTop: 2, fontSize: '.62rem', lineHeight: 1.35, fontWeight: 500 },
//     viewAll: { border: 0, background: 'transparent', color: '#4f81bd', padding: '2px 3px', font: '700 .62rem Inter, system-ui, sans-serif', textDecoration: 'underline', cursor: 'pointer' },
//     tableWrap: { width: '100%', overflowX: 'auto' },
//     table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
//     th: { padding: '9px 10px', fontSize: '0.68rem', fontWeight: 700, color: '#1e3a8a', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', whiteSpace: 'normal', lineHeight: 1.18, verticalAlign: 'middle', overflowWrap: 'break-word' },
//     td: { padding: '7px 10px', fontSize: '0.70rem', color: '#334155', borderBottom: '1px solid #f1f5f9', whiteSpace: 'normal', lineHeight: 1.25, overflowWrap: 'break-word', verticalAlign: 'middle' },
//     totalTd: { padding: '7px 10px', fontSize: '0.70rem', fontWeight: 800, color: '#1e3a8a', background: '#f8fafc', borderTop: '2px solid #e2e8f0', whiteSpace: 'normal', lineHeight: 1.2 },
//     tabs: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', margin: '2px 0 9px', borderRadius: 7, overflow: 'hidden' },
//     tab: { minWidth: 0, height: 29, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', font: '700 .56rem Inter, system-ui, sans-serif', cursor: 'pointer' },
//     equityRow: { display: 'grid', gridTemplateColumns: '108px minmax(0,1fr) 42px', gap: 7, alignItems: 'center' },
//     equityLabel: { overflow: 'hidden', color: '#64748b', fontSize: '.59rem', fontWeight: 700, lineHeight: 1.15, whiteSpace: 'normal', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, textOverflow: 'ellipsis' },
//     equityTrack: { height: 12, borderRadius: 99, background: '#eef2f7', overflow: 'hidden' },
//     logicItem: { display: 'grid', gridTemplateColumns: '30px minmax(0,1fr)', gap: 8, alignItems: 'start', padding: 7, border: '1px solid #e7edf5', borderRadius: 7, background: '#fff' },
//     logicTitle: { color: '#334155', fontSize: '.62rem', fontWeight: 800, lineHeight: 1.25 },
//     logicText: { color: '#64748b', marginTop: 2, fontSize: '.56rem', lineHeight: 1.3, fontWeight: 500 },
//     chart: { width: '100%', minWidth: 0 },
//     skeleton: { display: 'block', width: '100%', background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)', backgroundSize: '200% 100%', borderRadius: 6, animation: 'shimmer 1.4s infinite' },
//     modalBackdrop: { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,.42)', display: 'flex', alignItems: 'stretch', justifyContent: 'center', padding: 10 },
//     modal: { width: 'min(1440px, 100%)', height: 'calc(100vh - 20px)', maxHeight: 'calc(100vh - 20px)', overflow: 'hidden', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 24px 70px rgba(15,23,42,.22)', display: 'flex', flexDirection: 'column' },
// };

// function normalizeFilterOptions(options = []) {
//     return (options || []).map((o) => {
//         if (o == null) return { id: "", name: "" };
//         if (typeof o === "string" || typeof o === "number") return { id: String(o), name: String(o) };
//         const id = o.value !== undefined ? o.value : (o.id !== undefined ? o.id : "");
//         const name = o.label !== undefined ? o.label : (o.name !== undefined ? o.name : String(id));
//         return { id: String(id), name: typeof name === "object" ? String(name?.label || name?.name || id) : String(name) };
//     });
// }

// const dateStyle = {
//     padding: "6px 10px",
//     fontSize: "0.78rem",
//     fontWeight: 500,
//     color: "#334155",
//     background: "#fff",
//     border: "1px solid #e2e8f0",
//     borderRadius: 7,
//     cursor: "pointer",
//     outline: "none",
//     width: "100%",
//     height: 34,
//     boxSizing: "border-box",
// };

// const formatAsOnDate = (value) => {
//     if (!value) return "—";
//     const [year, month, day] = String(value).split("-");
//     if (!year || !month || !day) return value;
//     const date = new Date(Number(year), Number(month) - 1, Number(day));
//     return Number.isNaN(date.getTime())
//         ? value
//         : `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${String(year)}`;
// };

// const selStyle = {
//     appearance: "none",
//     padding: "6px 28px 6px 10px",
//     fontSize: "0.78rem",
//     fontWeight: 500,
//     color: "#334155",
//     background: "#fff",
//     border: "1px solid #e2e8f0",
//     borderRadius: 7,
//     cursor: "pointer",
//     outline: "none",
//     width: "100%",
//     backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
//     backgroundRepeat: "no-repeat",
//     backgroundPosition: "right 8px center",
//     textOverflow: "ellipsis",
//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     maxWidth: 180,
// };

// function FilterField({ label, children }) {
//     return <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 85, flex: "0 0 auto" }}>
//         <span style={{ fontSize: "0.66rem", color: "#1e3a8a", fontWeight: 700, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{label}</span>
//         {children}
//     </div>;
// }

// function headerBtn(bg, color, border) {
//     return { padding: "7px 14px", background: bg, color, border: border ? `1px solid ${border}` : "none", borderRadius: 8, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.18s" };
// }

// function MultiSelect({ options = [], value = [], onChange, placeholder = "All", style }) {
//     const [open, setOpen] = useState(false);
//     const [searchQuery, setSearchQuery] = useState("");
//     const ref = useRef(null);
//     const searchRef = useRef(null);
//     const normOptions = normalizeFilterOptions(options);
//     const selected = Array.isArray(value) ? value.map(String) : [];
//     const realIds = normOptions.map((o) => String(o.id)).filter((id) => id !== "All");
//     const explicitlyAll = selected.includes("All");
//     const displayAll = selected.length === 0 || explicitlyAll;
//     const q = searchQuery.trim().toLowerCase();
//     const visibleOptions = q
//         ? normOptions.filter((o) => String(o.id) !== "All" && String(o.name || "").toLowerCase().includes(q))
//         : normOptions.filter((o) => String(o.id) !== "All");

//     useEffect(() => {
//         const handleOutside = (event) => {
//             if (ref.current && !ref.current.contains(event.target)) {
//                 setOpen(false);
//                 setSearchQuery("");
//             }
//         };
//         document.addEventListener("mousedown", handleOutside);
//         return () => document.removeEventListener("mousedown", handleOutside);
//     }, []);

//     useEffect(() => {
//         if (open) setTimeout(() => searchRef.current?.focus(), 0);
//         if (!open) setSearchQuery("");
//     }, [open]);

//     const toggle = (id) => {
//         const target = String(id);
//         const current = selected.filter((v) => v !== "All");
//         const next = current.includes(target) ? current.filter((v) => v !== target) : [...current, target];
//         onChange(next.length === realIds.length && realIds.length > 0 ? ["All"] : next);
//     };

//     const label = displayAll
//         ? placeholder
//         : selected.length === 1
//             ? (normOptions.find((o) => String(o.id) === selected[0])?.name || "1 selected")
//             : `${selected.length} selected`;

//     return (
//         <div ref={ref} style={{ position: "relative", ...style }}>
//             <button type="button" onClick={() => setOpen((v) => !v)}
//                 style={{ ...selStyle, width: "100%", maxWidth: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, textAlign: "left", height: 34, paddingRight: 9 }}>
//                 <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{label}</span>
//                 <span style={{ color: "#94a3b8", fontSize: ".58rem", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
//             </button>
//             {open && (
//                 <div style={{ position: "absolute", top: "calc(100% + 3px)", left: 0, minWidth: Math.max(style?.width || 160, 240), background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,.12)", zIndex: 1500, overflow: "hidden" }}>
//                     <div style={{ padding: 7, borderBottom: "1px solid #e2e8f0" }}>
//                         <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 8px" }}>
//                             <span style={{ fontSize: ".68rem", color: "#94a3b8" }}>⌕</span>
//                             <input ref={searchRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Search…" style={{ border: 0, outline: 0, background: "transparent", width: "100%", minWidth: 0, color: "#334155", font: `500 .72rem ${font}` }} />
//                             {searchQuery && <button type="button" onClick={() => setSearchQuery("")} style={{ border: 0, background: "transparent", color: "#94a3b8", cursor: "pointer" }}>×</button>}
//                         </div>
//                     </div>
//                     {!q && (
//                         <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
//                             <button type="button" onClick={() => onChange(["All"])} style={{ border: 0, background: "transparent", padding: 0, color: "#2563eb", font: `700 .70rem ${font}`, cursor: "pointer" }}>Select All</button>
//                             <button type="button" onClick={() => onChange([])} style={{ border: 0, background: "transparent", padding: 0, color: "#ef4444", font: `700 .70rem ${font}`, cursor: "pointer" }}>Clear</button>
//                         </div>
//                     )}
//                     <div style={{ maxHeight: 220, overflowY: "auto" }}>
//                         {visibleOptions.map((opt) => {
//                             const isSelected = explicitlyAll || selected.includes(String(opt.id));
//                             return (
//                                 <button type="button" key={opt.id} onClick={() => toggle(opt.id)}
//                                     style={{ width: "100%", border: 0, borderBottom: "1px solid #f8fafc", background: isSelected ? "#eff6ff" : "#fff", color: isSelected ? "#2563eb" : "#334155", display: "flex", alignItems: "flex-start", gap: 7, padding: "8px 10px", textAlign: "left", cursor: "pointer", font: `500 .72rem ${font}`, lineHeight: 1.25 }}>
//                                     <span style={{ width: 14, height: 14, marginTop: 1, border: `1.5px solid ${isSelected ? "#2563eb" : "#cbd5e1"}`, borderRadius: 3, background: isSelected ? "#2563eb" : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                                         {isSelected && <span style={{ color: "#fff", fontSize: ".58rem", lineHeight: 1 }}>✓</span>}
//                                     </span>
//                                     <span style={{ whiteSpace: "normal", overflowWrap: "anywhere" }}>{opt.name}</span>
//                                 </button>
//                             );
//                         })}
//                         {q && visibleOptions.length === 0 && <div style={{ padding: 12, color: "#94a3b8", font: `500 .72rem ${font}`, textAlign: "center" }}>No results for “{searchQuery}”</div>}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// function useResponsiveColumns() {
//     const [width, setWidth] = useState(typeof window === "undefined" ? 1440 : window.innerWidth);
//     useEffect(() => {
//         const handleResize = () => setWidth(window.innerWidth);
//         window.addEventListener("resize", handleResize);
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);
//     return { isMobile: width <= 768, isSmall: width <= 480, isTablet: width > 768 && width <= 1280, isMedium: width > 768 && width <= 1100 };
// }

// function CountUp({ value, decimals = 1, duration = 700 }) {
//     const numeric = Number(value);
//     const safe = Number.isFinite(numeric) ? numeric : 0;
//     const [display, setDisplay] = useState(safe);
//     useEffect(() => {
//         let startTime;
//         let frameId;
//         const tick = (time) => {
//             if (!startTime) startTime = time;
//             const progress = Math.min((time - startTime) / duration, 1);
//             const eased = 1 - Math.pow(1 - progress, 3);
//             setDisplay(safe * eased);
//             if (progress < 1) frameId = requestAnimationFrame(tick);
//         };
//         frameId = requestAnimationFrame(tick);
//         return () => cancelAnimationFrame(frameId);
//     }, [safe, duration]);
//     return <>{display.toFixed(decimals)}</>;
// }

// function Skeleton({ height = 16, width = "100%", radius = 6 }) {
//     return <div style={{ ...styles.skeleton, height, width, borderRadius: radius, animation: "financialPositionShimmer 1.4s infinite" }} aria-hidden="true" />;
// }

// function KpiCard({ item, loading, currency }) {
//     const [hover, setHover] = useState(false);
//     const isPending = item.value === null || item.value === undefined || !Number.isFinite(Number(item.value));
//     return (
//         <motion.div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
//             style={{ ...styles.kpiCard, background: item.cardBg || "#fff", boxShadow: hover ? `0 8px 24px ${item.accent || "#2563eb"}20` : "none", transform: hover ? "translateY(-2px)" : "none" }}
//             initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>
//             <div style={{ width: 36, height: 36, borderRadius: 10, background: item.iconBg || "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem", flexShrink: 0, color: item.accent || "#2563eb" }}>{item.icon}</div>
//             <div style={{ minWidth: 0, flex: 1 }}>
//                 <div style={styles.kpiLabel}>{item.label}</div>
//                 {loading ? <div style={{ marginTop: 7 }}><Skeleton height={18} width="70%" /></div> : (
//                     <>
//                         <div style={styles.kpiValue}>
//                             {isPending ? "—" : item.ratio ? <><CountUp value={item.value} decimals={item.decimals ?? 2} />{item.suffix || ""}</> : <><span style={{ fontSize: "1rem", marginRight: 2 }}>{currency}</span><CountUp value={Number(item.value) / 1000000} decimals={1} />{item.unit || "M"}</>}
//                         </div>
//                         {item.trend !== undefined && item.trend !== null ? (
//                             <div style={styles.kpiTrend}><span>{Number(item.trend) >= 0 ? "▲" : "▼"} {Math.abs(Number(item.trend)).toFixed(1)}%</span><small style={{ color: "#94a3b8", fontSize: ".55rem", fontWeight: 600 }}>vs. last month</small></div>
//                         ) : null}
//                     </>
//                 )}
//             </div>
//         </motion.div>
//     );
// }

// function CardHeader({ title, subtitle, onViewAll, onExportExcel, onExportPdf }) {
//     return <div style={styles.cardHeader}>
//         <div style={{ minWidth: 0 }}>
//             <div style={styles.cardTitle}>{title}</div>
//             {subtitle && <div style={styles.cardSubtitle}>{subtitle}</div>}
//         </div>
//         <ActionMenu onViewAll={onViewAll} onExportExcel={onExportExcel} onExportPdf={onExportPdf} />
//     </div>;
// }

// function TableCard({ title, subtitle, rows, totalLabel, totalValue, onViewAll, onExportExcel, onExportPdf, currency = "AED" }) {
//     return <motion.section className="fp-sales-card" style={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }} whileHover={{ boxShadow: shadowHover }}>
//         <CardHeader title={title} subtitle={subtitle} onViewAll={onViewAll} onExportExcel={onExportExcel} onExportPdf={onExportPdf} />
//         <div style={styles.tableWrap}>
//             <table style={styles.table}>
//                 <thead><tr>
//                     <th style={{ ...styles.th, width: "46%" }}>Item</th>
//                     <th style={{ ...styles.th, textAlign: "right", width: "28%" }}>Amount<br />({currency} M)</th>
//                     <th style={{ ...styles.th, textAlign: "right", width: "26%" }}>% of<br />Total</th>
//                 </tr></thead>
//                 <tbody>{rows.map((row) => (
//                     <tr key={row.item}><td style={{ ...styles.td, color: "#334155", fontWeight: 600 }}>{row.item}</td>
//                         <td style={{ ...styles.td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Number(row.amount || 0).toFixed(1)}</td>
//                         <td style={{ ...styles.td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Number(row.pct || 0).toFixed(1)}%</td>
//                     </tr>
//                 ))}</tbody>
//                 <tfoot><tr>
//                     <td style={styles.totalTd}>{totalLabel}</td>
//                     <td style={{ ...styles.totalTd, textAlign: "right" }}>{totalValue === null || totalValue === undefined || !Number.isFinite(Number(totalValue)) ? "—" : Number(totalValue).toFixed(1)}</td>
//                     <td style={{ ...styles.totalTd, textAlign: "right" }}>100.0%</td>
//                 </tr></tfoot>
//             </table>
//         </div>
//     </motion.section>;
// }

// function ChartTooltip({ active, payload, label }) {
//     if (!active || !payload?.length) return null;
//     return (
//         <div
//             className="fp-modern-tooltip"
//             style={{
//                 minWidth: 170,
//                 padding: "10px 12px",
//                 border: "1px solid rgba(226,232,240,.96)",
//                 borderRadius: 11,
//                 background: "rgba(255,255,255,.96)",
//                 backdropFilter: "blur(12px)",
//                 WebkitBackdropFilter: "blur(12px)",
//                 boxShadow: "0 14px 34px rgba(15,23,42,.15), 0 3px 10px rgba(15,23,42,.06)",
//                 fontFamily: font,
//             }}
//         >
//             <div style={{ marginBottom: 7, paddingBottom: 7, borderBottom: "1px solid #eef2f7", color: "#1e1b4b", fontSize: ".68rem", fontWeight: 800, lineHeight: 1.25 }}>
//                 {label}
//             </div>
//             {payload.map((entry, index) => (
//                 <div key={`${entry.dataKey}-${index}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, color: COLORS.muted, fontSize: ".62rem", fontWeight: 600, marginTop: index ? 5 : 0 }}>
//                     <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
//                         <span style={{ width: 7, height: 7, borderRadius: "50%", background: entry.color || "#2563eb", boxShadow: "0 0 0 3px rgba(37,99,235,.08)", flexShrink: 0 }} />
//                         <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name || entry.dataKey}</span>
//                     </span>
//                     <strong style={{ color: entry.color || COLORS.text, fontWeight: 800, whiteSpace: "nowrap" }}>
//                         {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
//                     </strong>
//                 </div>
//             ))}
//         </div>
//     );
// }

// function downloadExcelFile(title, columns, rows, filename) {
//     const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
//     const tableRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
//     const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><h3>${escapeHtml(title)}</h3><table border="1"><thead><tr>${columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
//     const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
//     const url = URL.createObjectURL(blob);
//     const anchor = document.createElement("a");
//     anchor.href = url; anchor.download = filename || "financial-position.xls";
//     document.body.appendChild(anchor); anchor.click(); anchor.remove();
//     setTimeout(() => URL.revokeObjectURL(url), 500);
// }

// function printPdfFile(title, columns, rows) {
//     const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
//     const win = window.open("", "_blank", "width=1100,height=800");
//     if (!win) return;
//     win.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#0f172a}h2{font-size:18px;margin:0 0 16px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#f1f5f9;color:#1e3a8a}td:nth-child(n+2),th:nth-child(n+2){text-align:right}@media print{button{display:none}}</style></head><body><h2>${escapeHtml(title)}</h2><table><thead><tr>${columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table><script>window.onload=()=>window.print();</script></body></html>`);
//     win.document.close();
// }

// function ActionMenu({ onViewAll, onExportExcel, onExportPdf }) {
//     const [open, setOpen] = useState(false);
//     const ref = useRef(null);
//     useEffect(() => {
//         const handler = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, []);
//     const run = (callback) => { setOpen(false); callback?.(); };
//     return <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
//         <button type="button" aria-label="Component actions" onClick={() => setOpen((v) => !v)}
//             style={{ width: 24, height: 28, border: 0, borderRadius: 6, background: "transparent", color: "#64748b", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, lineHeight: 1, padding: 0 }}>⋮</button>
//         {open && <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", width: 150, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 10px 28px rgba(15,23,42,.14)", zIndex: 1200, padding: 4 }}>
//             <button type="button" onClick={() => run(onViewAll)} style={menuItemStyle}>🔍&nbsp; View All</button>
//             <button type="button" onClick={() => run(onExportExcel)} style={menuItemStyle}>📊&nbsp; Export Excel</button>
//             <button type="button" onClick={() => run(onExportPdf)} style={menuItemStyle}>📄&nbsp; Export PDF</button>
//         </div>}
//     </div>;
// }
// const menuItemStyle = { width: "100%", border: 0, background: "transparent", borderRadius: 6, padding: "8px 9px", textAlign: "left", color: "#334155", font: `600 .70rem ${font}`, cursor: "pointer" };

// function toData(response) {
//     const root = response?.data ?? response;
//     return root?.data ?? root?.result ?? root;
// }
// function toRows(response) {
//     const data = toData(response);
//     if (Array.isArray(data)) return data;

//     // Financial Position list endpoints can return the rows under different
//     // collection keys depending on the backend serializer. Support the
//     // existing response shapes without changing the API contract.
//     const candidates = [
//         data?.rows,
//         data?.items,
//         data?.results,
//         data?.data,
//         data?.monthly_data,
//         data?.monthly_rows,
//         data?.parent_divisions,
//         data?.by_parent_division,
//         data?.monthly_by_parent_division,
//         data?.equity,
//         data?.equity_rows,
//         data?.equity_contribution,
//         data?.equity_view_all,
//         data?.equity_monthly,
//         data?.trend,
//         data?.trend_data,
//         data?.net_working_capital_trend,
//     ];

//     for (const candidate of candidates) {
//         if (Array.isArray(candidate)) return candidate;
//     }

//     return [];
// }
// function num(value) {
//     const n = Number(value);
//     return Number.isFinite(n) ? n : 0;
// }
// function nullableNum(value) {
//     if (value === null || value === undefined || value === "") return null;
//     const n = Number(value);
//     return Number.isFinite(n) ? n : null;
// }
// function millions(value) { return num(value) / 1000000; }
// function formatM(value) {
//     return value === null || value === undefined || value === "" || !Number.isFinite(Number(value))
//         ? "—"
//         : millions(value).toFixed(1);
// }
// function firstValue(obj, keys, fallback = null) {
//     for (const key of keys) {
//         if (obj && obj[key] !== undefined) return obj[key];
//     }
//     return fallback;
// }
// function periodLabel(row) {
//     return String(firstValue(row, ["period_month", "period_code", "period", "month"], "—"));
// }
// function divisionLabel(row) {
//     return String(firstValue(row, ["parent_division_name", "name", "parentDivision", "parent_division_code"], "—"));
// }
// function dedupeByLabel(rows) {
//     const seen = new Set();
//     return rows.filter((row) => {
//         const key = divisionLabel(row);
//         if (seen.has(key)) return false;
//         seen.add(key);
//         return true;
//     });
// }


// /*
//  * Filter options are loaded from getWorkingCapitalFilterOptions().
//  * The Financial Position API does not expose a filter-options endpoint,
//  * so the shared Working Capital hierarchy is used for the filter UI only.
//  */
// function normalizeFinancialFilterOptions(payload) {
//     const unwrap = (response) => response?.data?.filters ?? response?.data?.filter_options ?? response?.data ?? response?.filters ?? response?.filter_options ?? response ?? {};
//     const data = unwrap(payload);

//     const toArray = (value) => Array.isArray(value) ? value : [];
//     const normalizeIds = (...values) => values
//         .flatMap((value) => Array.isArray(value) ? value : [value])
//         .filter((value) => value !== undefined && value !== null && value !== "")
//         .map(String);

//     const optionList = (source) => toArray(source).map((item) => {
//         if (typeof item === "string" || typeof item === "number") {
//             return { id: String(item), name: String(item), legalGroupIds: [], legalEntityIds: [], parentDivisionIds: [] };
//         }

//         const id = item?.id ?? item?.value ?? item?.key ?? item?.code ?? item?.legal_group_id ?? item?.legal_entity_id ?? item?.parent_division_id ?? item?.subdivision_id;
//         const name = item?.label ?? item?.name ?? item?.display_name ?? item?.legal_group_name ?? item?.legal_entity_name ?? item?.parent_division_name ?? item?.subdivision_name ?? item?.value;

//         return {
//             id: id == null ? "" : String(id),
//             name: name == null ? "" : String(name),
//             legalGroupIds: normalizeIds(item?.legal_group_ids, item?.legalGroupIds, item?.legal_group_id, item?.legalGroupId),
//             legalEntityIds: normalizeIds(item?.legal_entity_ids, item?.legalEntityIds, item?.legal_entity_id, item?.legalEntityId),
//             parentDivisionIds: normalizeIds(item?.parent_division_ids, item?.parentDivisionIds, item?.parent_division_id, item?.parentDivisionId),
//         };
//     }).filter((item) => item.id && item.name);

//     const rawCurrencies = data.reporting_currencies ?? data.reportingCurrencies ?? data.currencies ?? data.currency_options ?? data.ledger_currencies ?? [];
//     const currencies = toArray(rawCurrencies)
//         .map((item) => typeof item === "object" ? (item?.value ?? item?.code ?? item?.currency ?? item?.name) : item)
//         .filter(Boolean)
//         .map(String);
//     const reportingCurrency = data.reporting_currency ?? data.reportingCurrency ?? "";

//     return {
//         legalGroups: optionList(data.legal_groups ?? data.legalGroups),
//         legalEntities: optionList(data.legal_entities ?? data.legalEntities),
//         parentDivisions: optionList(data.parent_divisions ?? data.parentDivisions),
//         subDivisions: optionList(data.subdivisions ?? data.sub_divisions ?? data.subDivisions),
//         reportingCurrencies: [...new Set([...(currencies.length ? currencies : []), ...(reportingCurrency ? [String(reportingCurrency)] : [])])],
//         asOnDates: toArray(data.as_on_dates ?? data.asOnDates).map((item) => typeof item === "object" ? (item?.value ?? item?.date ?? item?.as_on_date) : item).filter(Boolean).map(String),
//         operationalAsOnDate: data.operational_as_on_date ?? data.operationalAsOnDate ?? "",
//     };
// }

// function matchesRelation(option, relationKey, selectedIds) {
//     if (!selectedIds.length) return true;
//     const relations = Array.isArray(option?.[relationKey]) ? option[relationKey].map(String) : [];
//     return relations.length === 0 || selectedIds.some((id) => relations.includes(String(id)));
// }

// function getCascadeOptions(state, sourceOptions) {
//     const groups = (state?.legalGroups || []).filter((id) => id !== "All").map(String);
//     const entities = (state?.legalEntities || []).filter((id) => id !== "All").map(String);
//     const parents = (state?.parentDivisions || []).filter((id) => id !== "All").map(String);

//     const legalGroups = sourceOptions?.legalGroups || [];
//     const legalEntities = (sourceOptions?.legalEntities || []).filter((option) => matchesRelation(option, "legalGroupIds", groups));
//     const parentDivisions = (sourceOptions?.parentDivisions || []).filter((option) => {
//         const groupMatch = matchesRelation(option, "legalGroupIds", groups);
//         const entityMatch = matchesRelation(option, "legalEntityIds", entities);
//         return groupMatch && entityMatch;
//     });
//     const subDivisions = (sourceOptions?.subDivisions || []).filter((option) => {
//         const parentMatch = matchesRelation(option, "parentDivisionIds", parents.length ? parents : parentDivisions.map((item) => item.id));
//         const entityMatch = matchesRelation(option, "legalEntityIds", entities);
//         const groupMatch = matchesRelation(option, "legalGroupIds", groups);
//         return groupMatch && entityMatch && parentMatch;
//     });

//     return {
//         legalGroups,
//         legalEntities,
//         parentDivisions,
//         subDivisions,
//         reportingCurrencies: sourceOptions?.reportingCurrencies?.length ? sourceOptions.reportingCurrencies : [state?.reportingCurrency || "AED"],
//     };
// }

// function intersectionAllowed(current, allowed) {
//     if (!Array.isArray(current) || current.length === 0) return [];
//     const set = new Set(allowed.map(String));
//     return current.filter((id) => id !== "All" && set.has(String(id)));
// }

// function cascadeUpdateFilter(previous, key, value, sourceOptions) {
//     const next = { ...previous, [key]: value };
//     const options = getCascadeOptions(next, sourceOptions);

//     if (key === "legalGroups") {
//         next.legalEntities = intersectionAllowed(next.legalEntities, options.legalEntities.map((o) => o.id));
//         next.parentDivisions = intersectionAllowed(next.parentDivisions, options.parentDivisions.map((o) => o.id));
//         next.subDivisions = intersectionAllowed(next.subDivisions, getCascadeOptions(next, sourceOptions).subDivisions.map((o) => o.id));
//     }

//     if (key === "legalEntities") {
//         next.parentDivisions = intersectionAllowed(next.parentDivisions, options.parentDivisions.map((o) => o.id));
//         next.subDivisions = intersectionAllowed(next.subDivisions, getCascadeOptions(next, sourceOptions).subDivisions.map((o) => o.id));
//     }

//     if (key === "parentDivisions") {
//         next.subDivisions = intersectionAllowed(next.subDivisions, options.subDivisions.map((o) => o.id));
//     }

//     return next;
// }

// function FilterPanel({ state, onChange, onApply, onReset, compact = false, filterOptions = {} }) {
//     const options = getCascadeOptions(state, filterOptions);
//     const set = (key, value) => onChange(cascadeUpdateFilter(state, key, value, filterOptions));

//     return (
//         <div style={{
//             ...styles.card,
//             padding: compact ? "9px 12px" : "10px 14px",
//             margin: 0,
//             display: "flex",
//             alignItems: "flex-end",
//             gap: 6,
//             flexWrap: "wrap",
//             overflow: "visible",
//             flexShrink: 0,
//         }}>
//             <FilterField label="Legal Group">
//                 <MultiSelect options={options.legalGroups} value={state.legalGroups} onChange={(v) => set("legalGroups", v)} placeholder="All" style={{ width: compact ? 165 : 175, minWidth: compact ? 165 : 175 }} />
//             </FilterField>
//             <FilterField label="Legal Entity">
//                 <MultiSelect options={options.legalEntities} value={state.legalEntities} onChange={(v) => set("legalEntities", v)} placeholder="All" style={{ width: compact ? 190 : 205, minWidth: compact ? 190 : 205 }} />
//             </FilterField>
//             <FilterField label="Parent Division">
//                 <MultiSelect options={options.parentDivisions} value={state.parentDivisions} onChange={(v) => set("parentDivisions", v)} placeholder="All" style={{ width: compact ? 175 : 185, minWidth: compact ? 175 : 185 }} />
//             </FilterField>
//             <FilterField label="Sub-Division">
//                 <MultiSelect options={options.subDivisions} value={state.subDivisions} onChange={(v) => set("subDivisions", v)} placeholder="All" style={{ width: compact ? 175 : 185, minWidth: compact ? 175 : 185 }} />
//             </FilterField>
//             <FilterField label="Reporting Currency">
//                 <select value={state.reportingCurrency} onChange={(e) => set("reportingCurrency", e.target.value)} style={{ ...selStyle, width: compact ? 140 : 150, minWidth: compact ? 140 : 150, height: 34 }}>
//                     {options.reportingCurrencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
//                 </select>
//             </FilterField>
//             <FilterField label="As-on Date">
//                 <input type="date" value={state.asOnDate} onChange={(e) => set("asOnDate", e.target.value)} style={{ ...dateStyle, width: compact ? 150 : 160, minWidth: compact ? 150 : 160 }} aria-label="As-on Date" />
//             </FilterField>
//             <div style={{ display: "flex", alignItems: "center", gap: 5, alignSelf: "flex-end", marginLeft: 0, flexShrink: 0 }}>
//                 <button type="button" onClick={onApply} style={{ height: 32, padding: "0 16px", border: 0, borderRadius: 8, background: COLORS.primaryBlue, color: "#fff", fontFamily: font, fontSize: ".72rem", fontWeight: 700, cursor: "pointer" }}>Apply</button>
//                 <button type="button" onClick={onReset} style={{ height: 32, padding: "0 6px", border: 0, background: "transparent", color: COLORS.muted, fontFamily: font, fontSize: ".72rem", fontWeight: 600, cursor: "pointer" }}>Reset</button>
//             </div>
//         </div>
//     );
// }

// function buildApiFilters(filters) {
//     const clean = (value) => Array.isArray(value)
//         ? value.filter((v) => v !== "All" && v !== "" && v !== null && v !== undefined)
//         : [];

//     return {
//         calendar_date: filters.asOnDate || undefined,
//         legal_group_id: clean(filters.legalGroups),
//         legal_entity_id: clean(filters.legalEntities),
//         parent_division_id: clean(filters.parentDivisions),
//         subdivision_id: clean(filters.subDivisions),
//         reporting_currency: filters.reportingCurrency || "AED",
//     };
// }

// // Fetch the latest five monthly NWC snapshots using ONLY
// // getFinancialPositionInvestmentsMonthlyByParentDivision. The requested month is
// // retained on every row so the chart/modal always uses the correct period.
// async function fetchLatestFiveInvestmentSnapshots(apiFilters) {
//     const baseDate = apiFilters?.calendar_date;
//     if (!baseDate) return [];

//     const sourceDate = new Date(`${baseDate}T00:00:00`);
//     if (Number.isNaN(sourceDate.getTime())) return [];

//     const requests = Array.from({ length: 5 }, (_, index) => {
//         const date = new Date(sourceDate.getFullYear(), sourceDate.getMonth() - index, sourceDate.getDate());
//         const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//         date.setDate(Math.min(sourceDate.getDate(), lastDay));
//         const calendarDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

//         return getFinancialPositionInvestmentsMonthlyByParentDivision({
//             ...apiFilters,
//             calendar_date: calendarDate,
//         }).then((response) => ({
//             calendarDate,
//             rows: toRows(response),
//         }));
//     });

//     const responses = await Promise.allSettled(requests);
//     const rows = [];

//     responses.forEach((result) => {
//         if (result.status !== "fulfilled") return;

//         const { calendarDate, rows: responseRows } = result.value;
//         const fallbackYear = calendarDate.slice(0, 4);
//         const fallbackMonth = calendarDate.slice(5, 7);
//         const fallbackPeriod = `${fallbackYear}-${fallbackMonth}`;

//         (responseRows || []).forEach((row) => {
//             const periodValue = firstValue(row, [
//                 "period_code", "period_month", "period", "month", "month_name", "as_on_date", "asOnDate"
//             ], null);

//             let periodKey = fallbackPeriod;
//             const periodText = String(periodValue ?? "").trim();
//             const dateMatch = periodText.match(/(\d{4})[-\/](\d{1,2})/);
//             if (dateMatch) {
//                 periodKey = `${dateMatch[1]}-${String(Number(dateMatch[2])).padStart(2, "0")}`;
//             } else if (/^\d{4}$/.test(periodText)) {
//                 periodKey = `${periodText}-${fallbackMonth}`;
//             } else {
//                 const monthNumber = monthSortValueForSnapshot(periodText);
//                 if (monthNumber >= 1 && monthNumber <= 12) {
//                     periodKey = `${fallbackYear}-${String(monthNumber).padStart(2, "0")}`;
//                 }
//             }

//             rows.push({
//                 ...row,
//                 period_key: periodKey,
//                 period_month: periodText || fallbackMonth,
//                 __requestedCalendarDate: calendarDate,
//             });
//         });
//     });

//     return rows;
// }

// function monthSortValueForSnapshot(value) {
//     const text = String(value ?? "").trim().toLowerCase();
//     if (!text) return 0;
//     const named = MONTH_KEYS.find((month) => month.aliases.some((alias) => text === alias || text.startsWith(`${alias}-`) || text.startsWith(`${alias}/`) || text.startsWith(`${alias} `)));
//     if (named) return MONTH_KEYS.indexOf(named) + 1;
//     const match = text.match(/(?:^|[-\/\s])(\d{1,2})(?:$|[-\/\s])/);
//     const month = match ? Number(match[1]) : Number(text);
//     return Number.isInteger(month) && month >= 1 && month <= 12 ? month : 0;
// }

// function normalizeComposition(response) {
//     const data = toData(response) || {};
//     const assets = Array.isArray(data.current_assets) ? data.current_assets : (Array.isArray(data.currentAssets) ? data.currentAssets : []);
//     const liabilities = Array.isArray(data.current_liabilities) ? data.current_liabilities : (Array.isArray(data.currentLiabilities) ? data.currentLiabilities : []);
//     const normalizeRows = (rows) => rows.map((row) => ({
//         item: row.category ?? row.item ?? row.name ?? "—",
//         // Composition API amounts are backend currency values; store them in
//         // AED millions for the existing Current-tab table/chart formatting.
//         amount: millions(firstValue(row, ["amount", "value", "current_assets", "current_liabilities"], null)),
//         pct: nullableNum(firstValue(row, ["percentage_of_total", "pct_of_total", "percentage", "percent"], null)),
//     }));
//     return {
//         totalCurrentAssets: nullableNum(firstValue(data, ["total_current_assets", "totalCurrentAssets"], null)),
//         totalCurrentLiabilities: nullableNum(firstValue(data, ["total_current_liabilities", "totalCurrentLiabilities"], null)),
//         currentAssets: normalizeRows(assets),
//         currentLiabilities: normalizeRows(liabilities),
//     };
// }

// function normalizeCurrentPositionComposition(response) {
//     const data = normalizeComposition(response);
//     return {
//         totalCurrentAssets: data.totalCurrentAssets,
//         totalCurrentLiabilities: data.totalCurrentLiabilities,
//         currentAssets: data.currentAssets || [],
//         currentLiabilities: data.currentLiabilities || [],
//     };
// }

// function normalizeEquityViewAll(response) {
//     const root = response?.data ?? response;
//     const data = root?.data ?? root?.result ?? root;

//     // The Equity View All endpoint can return the collection directly or
//     // under one of the documented equity collection keys.
//     const candidates = [
//         data,
//         data?.rows,
//         data?.items,
//         data?.results,
//         data?.equity,
//         data?.equity_rows,
//         data?.equity_view_all,
//         data?.equity_contribution,
//         data?.parent_divisions,
//         data?.by_parent_division,
//     ];

//     let rows = [];
//     for (const candidate of candidates) {
//         if (Array.isArray(candidate)) {
//             rows = candidate;
//             break;
//         }
//         if (candidate && typeof candidate === "object") {
//             const nested = [candidate.rows, candidate.items, candidate.results, candidate.data];
//             const found = nested.find((value) => Array.isArray(value));
//             if (found) {
//                 rows = found;
//                 break;
//             }
//         }
//     }

//     return rows.map((row) => ({
//         legalGroup: firstValue(row, ["legal_group_name", "legal_group", "legal_group_id"], "—"),
//         legalEntity: firstValue(row, ["legal_entity_name", "legal_entity", "legal_entity_id"], "—"),
//         parentDivision: firstValue(row, ["parent_division_name", "parent_division", "parent_division_code", "parentDivision", "name"], "—"),
//         subDivision: firstValue(row, ["subdivision_name", "sub_division_name", "subdivision", "sub_division", "subdivision_id"], "—"),
//         shareCapital: nullableNum(firstValue(row, ["share_capital", "shareCapital"], null)),
//         additionalCapital: nullableNum(firstValue(row, ["additional_capital", "additionalCapital"], null)),
//         reservesAndSurplus: nullableNum(firstValue(row, ["reserves_and_surplus", "reservesAndSurplus", "reserves_surplus"], null)),
//         partnerCurrentAccount: nullableNum(firstValue(row, ["partner_current_account", "partnerCurrentAccount"], null)),
//         currentYearProfit: nullableNum(firstValue(row, ["current_year_profit", "currentYearProfit", "profit_for_the_year"], null)),
//         equityTotal: nullableNum(firstValue(row, ["equity_total", "total_equity", "equity", "equity_position", "totalEquity"], null)),
//     }));
// }

// function normalizeEquityMonthly(response) {
//     const root = response?.data ?? response;
//     const data = root?.data ?? root?.result ?? root;

//     const candidates = [
//         data,
//         data?.rows,
//         data?.items,
//         data?.results,
//         data?.monthly_data,
//         data?.monthly_rows,
//         data?.equity_monthly,
//         data?.monthly_by_parent_division,
//         data?.parent_divisions,
//         data?.equity,
//     ];

//     let rows = [];
//     for (const candidate of candidates) {
//         if (Array.isArray(candidate)) {
//             rows = candidate;
//             break;
//         }
//         if (candidate && typeof candidate === "object") {
//             const nested = [candidate.rows, candidate.items, candidate.results, candidate.data];
//             const found = nested.find((value) => Array.isArray(value));
//             if (found) {
//                 rows = found;
//                 break;
//             }
//         }
//     }

//     const monthAliases = {
//         Jan: ["jan", "january", "01"], Feb: ["feb", "february", "02"],
//         Mar: ["mar", "march", "03"], Apr: ["apr", "april", "04"],
//         May: ["may", "05"], Jun: ["jun", "june", "06"],
//         Jul: ["jul", "july", "07"], Aug: ["aug", "august", "08"],
//         Sep: ["sep", "september", "09"], Oct: ["oct", "october", "10"],
//         Nov: ["nov", "november", "11"], Dec: ["dec", "december", "12"],
//     };

//     const hasMonthColumn = (row) => Object.keys(monthAliases).some((month) =>
//         monthAliases[month].some((key) => row?.[key] !== undefined || row?.[key.toUpperCase()] !== undefined)
//     );

//     const output = [];

//     // Wide response: Parent Division + Jan-Dec columns.
//     if (rows.some(hasMonthColumn)) {
//         rows.forEach((row) => {
//             const parent = divisionLabel(row);
//             const code = firstValue(row, ["parent_division_code", "parentDivisionCode"], null);
//             MONTH_KEYS.forEach((month) => {
//                 const aliases = monthAliases[month.key] || [];
//                 const key = aliases.find((alias) => row?.[alias] !== undefined)
//                     || aliases.find((alias) => row?.[alias.toUpperCase()] !== undefined);
//                 if (key !== undefined) {
//                     output.push({
//                         period: month.key,
//                         parentDivision: parent,
//                         code,
//                         equity: nullableNum(row[key]),
//                         kind: "equity",
//                     });
//                 }
//             });
//         });
//         return output;
//     }

//     // Row-per-month response.
//     rows.forEach((row) => {
//         const period = firstValue(row, ["period_month", "period_code", "period", "month", "month_name"], null);
//         output.push({
//             period: period === null ? "—" : String(period),
//             parentDivision: divisionLabel(row),
//             code: firstValue(row, ["parent_division_code", "parentDivisionCode"], null),
//             equity: nullableNum(firstValue(row, [
//                 "equity_total", "total_equity", "equity", "equity_position", "amount", "value",
//             ], null)),
//             kind: "equity",
//         });
//     });

//     return output;
// }

// function normalizeEquity(response) {
//     const data = toData(response) || {};
//     return {
//         shareCapital: nullableNum(data.share_capital),
//         additionalCapital: nullableNum(data.additional_capital),
//         reservesAndSurplus: nullableNum(data.reserves_and_surplus),
//         partnerCurrentAccount: nullableNum(data.partner_current_account),
//         currentYearProfit: nullableNum(data.current_year_profit),
//         equityTotal: nullableNum(data.equity_total),
//     };
// }

// function equityRows(equity) {
//     return [
//         ["Share Capital", equity.shareCapital],
//         ["Additional Capital", equity.additionalCapital],
//         ["Reserves & Surplus", equity.reservesAndSurplus],
//         ["Partner Current Account", equity.partnerCurrentAccount],
//         ["Current Year Profit", equity.currentYearProfit],
//     ].map(([name, value]) => ({ name, value: value === null ? null : millions(value) }));
// }

// function normalizeKpis(response) {
//     const data = toData(response) || {};
//     return [
//         { key: "nwc", label: "Net Working Capital", value: nullableNum(data.net_working_capital), unit: "M", icon: "▤", cardBg: "#f0fdf4", iconBg: "#dcfce7", accent: "#16a34a" },
//         { key: "assets", label: "Total Current Assets", value: nullableNum(data.total_current_assets), unit: "M", icon: "▣", cardBg: "#f0f5ff", iconBg: "#dbeafe", accent: "#2563eb" },
//         { key: "liabilities", label: "Total Current Liabilities", value: nullableNum(data.total_current_liabilities), unit: "M", icon: "▣", cardBg: "#fff1f2", iconBg: "#ffe4e6", accent: "#e11d48" },
//         { key: "ratio", label: "Current Ratio", value: nullableNum(data.current_ratio), ratio: true, decimals: 2, icon: "◉", cardBg: "#faf5ff", iconBg: "#ede9fe", accent: "#7c3aed" },
//         { key: "roi", label: "ROI %", value: nullableNum(firstValue(data, ["roi_percentage", "roi_percent", "roi"], null)), ratio: true, decimals: 2, suffix: "%", icon: "%", cardBg: "#ecfdf5", iconBg: "#d1fae5", accent: "#059669" },
//         { key: "turnover", label: "NWC Turnover Ratio", value: nullableNum(data.nwc_turnover_ratio), ratio: true, decimals: 2, icon: "◷", cardBg: "#fffbeb", iconBg: "#fef3c7", accent: "#d97706" },
//         { key: "investments", label: "Total Investments", value: nullableNum(data.total_investments), unit: "M", icon: "↗", cardBg: "#ecfeff", iconBg: "#cffafe", accent: "#0891b2" },
//         { key: "equity", label: "Equity Position", value: nullableNum(data.equity_position), unit: "M", icon: "◎", cardBg: "#faf5ff", iconBg: "#ede9fe", accent: "#7c3aed" },
//         { key: "fixedAssets", label: "Fixed Assets & Other Non-Current Assets", value: nullableNum(data.fixed_assets_and_other_non_current_assets), unit: "M", icon: "⌂", cardBg: "#f0f5ff", iconBg: "#dbeafe", accent: "#2563eb" },
//         { key: "longTerm", label: "Long-Term Bank Borrowings", value: nullableNum(data.long_term_bank_borrowings), unit: "M", icon: "⇅", cardBg: "#fff7ed", iconBg: "#ffedd5", accent: "#ea580c" },
//         { key: "shortTerm", label: "Short-Term Bank Borrowings", value: nullableNum(data.short_term_bank_borrowings), unit: "M", icon: "⇅", cardBg: "#fffbeb", iconBg: "#fef3c7", accent: "#d97706" },
//         { key: "relatedParty", label: "Loan from Related Party", value: nullableNum(data.loan_from_related_party), unit: "M", icon: "◎", cardBg: "#faf5ff", iconBg: "#ede9fe", accent: "#7c3aed" },
//     ];
// }

// function normalizeInvestmentRows(response) {
//     return toRows(response).map((row) => ({
//         legalGroup: row.legal_group_name ?? row.legal_group ?? row.legal_group_id ?? "—",
//         legalEntity: row.legal_entity_name ?? row.legal_entity ?? row.legal_entity_id ?? "—",
//         parentDivision: divisionLabel(row),
//         code: row.parent_division_code,
//         period: row.period_month ?? row.period_code ?? periodLabel(row),
//         periodKey: row.period_key ?? row.period_code ?? row.period_month ?? periodLabel(row),
//         periodCode: row.period_code ?? null,
//         periodMonth: row.period_month ?? null,
//         subDivision: row.subdivision_name ?? row.sub_division_name ?? row.subdivision ?? row.subdivision_id ?? "—",
//         fixedAssets: nullableNum(row.fixed_assets_and_other_non_current_assets),
//         provision: nullableNum(row.provision_for_gratuity),
//         currentAssets: nullableNum(row.current_assets ?? row.total_current_assets),
//         currentLiabilities: nullableNum(row.current_liabilities ?? row.total_current_liabilities),
//         nwc: nullableNum(row.net_working_capital),
//         currentRatio: nullableNum(row.current_ratio),
//         nwcTurnoverRatio: nullableNum(row.nwc_turnover_ratio),
//         totalInvestments: nullableNum(row.total_investments),
//         percentageOfTotal: nullableNum(row.percentage_of_total ?? row.pct_of_total),
//     }));
// }

// function normalizeBorrowingRows(response) {
//     return toRows(response).map((row) => ({
//         parentDivision: divisionLabel(row),
//         code: row.parent_division_code,
//         longTerm: nullableNum(row.long_term_bank_borrowings),
//         shortTerm: nullableNum(row.short_term_bank_borrowings),
//         bankTotal: nullableNum(row.bank_borrowings_total),
//         relatedParty: nullableNum(row.loan_from_related_party),
//         total: nullableNum(row.total_borrowings),
//         legalEntity: row.legal_entity_name ?? row.legal_entity ?? "—",
//         subDivision: row.subdivision_name ?? row.sub_division_name ?? row.subdivision ?? "—",
//     }));
// }

// function normalizeMonthly(response, kind) {
//     return toRows(response).map((row) => ({
//         period: periodLabel(row),
//         parentDivision: divisionLabel(row),
//         code: row.parent_division_code,
//         fixedAssets: nullableNum(row.fixed_assets_and_other_non_current_assets),
//         provision: nullableNum(row.provision_for_gratuity),
//         currentAssets: nullableNum(row.current_assets ?? row.total_current_assets),
//         currentLiabilities: nullableNum(row.current_liabilities ?? row.total_current_liabilities),
//         nwc: nullableNum(row.net_working_capital),
//         equity: nullableNum(row.equity_total),
//         longTerm: nullableNum(row.long_term_bank_borrowings),
//         shortTerm: nullableNum(row.short_term_bank_borrowings),
//         relatedParty: nullableNum(row.loan_from_related_party),
//         kind,
//     }));
// }

// function normalizeNwcTrend(response) {
//     return toRows(response)
//         .map((row) => ({
//             period: row.period_month ?? row.period_code ?? row.period ?? row.month ?? row.month_name ?? periodLabel(row),
//             periodCode: row.period_code ?? null,
//             periodMonth: row.period_month ?? null,
//             nwc: nullableNum(
//                 row.net_working_capital ??
//                 row.nwc ??
//                 row.nwc_value ??
//                 row.value ??
//                 row.amount
//             ),
//         }))
//         .filter((row) => row.period && row.nwc !== null);
// }

// const MONTH_KEYS = [
//     { key: "Jan", aliases: ["jan", "january", "01", "1"] },
//     { key: "Feb", aliases: ["feb", "february", "02", "2"] },
//     { key: "Mar", aliases: ["mar", "march", "03", "3"] },
//     { key: "Apr", aliases: ["apr", "april", "04", "4"] },
//     { key: "May", aliases: ["may", "05", "5"] },
//     { key: "Jun", aliases: ["jun", "june", "06", "6"] },
//     { key: "Jul", aliases: ["jul", "july", "07", "7"] },
//     { key: "Aug", aliases: ["aug", "august", "08", "8"] },
//     { key: "Sep", aliases: ["sep", "september", "09", "9"] },
//     { key: "Oct", aliases: ["oct", "october", "10"] },
//     { key: "Nov", aliases: ["nov", "november", "11"] },
//     { key: "Dec", aliases: ["dec", "december", "12"] },
// ];
// function monthNameFromPeriod(value) {
//     const text = String(value ?? "").trim();
//     const match = text.match(/(?:^|[-\/\s])([0-9]{1,2})(?:$|[-\/\s])/);
//     const monthNumber = match ? Number(match[1]) : Number(text);

//     if (Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
//         return MONTH_KEYS[monthNumber - 1].key;
//     }

//     const lower = text.toLowerCase();
//     const named = MONTH_KEYS.find((m) =>
//         m.aliases.some(
//             (alias) =>
//                 lower === alias ||
//                 lower.startsWith(`${alias}-`) ||
//                 lower.startsWith(`${alias} `) ||
//                 lower.startsWith(`${alias}/`)
//         )
//     );

//     return named ? named.key : text;
// }

// function monthKeyFromValue(value) {
//     const text = String(value ?? "").trim().toLowerCase();
//     if (!text) return null;
//     const found = MONTH_KEYS.find((m) => m.aliases.some((a) => text === a || text.startsWith(`${a}-`) || text.startsWith(`${a}/`) || text.startsWith(`${a} `) || text.endsWith(`-${a}`) || text.endsWith(`/${a}`) || text.endsWith(` ${a}`)));
//     if (found) return found.key;
//     const match = text.match(/(?:^|[-\/\s])(\d{1,2})(?:$|[-\/\s])/);
//     if (match) {
//         const month = Number(match[1]);
//         if (month >= 1 && month <= 12) return MONTH_KEYS[month - 1].key;
//     }
//     return null;
// }

// function normalizePositionMonthlyRows(response, valueKey) {
//     const raw = toRows(response);
//     const output = [];
//     const valueKeys = valueKey === "currentAssets"
//         ? ["currentAssets", "current_assets", "totalCurrentAssets", "total_current_assets", "amount", "value"]
//         : ["currentLiabilities", "current_liabilities", "totalCurrentLiabilities", "total_current_liabilities", "amount", "value"];

//     raw.forEach((row) => {
//         const parentDivision = divisionLabel(row);
//         const explicitMonth = monthKeyFromValue(firstValue(row, ["period_month", "period_code", "period", "month", "month_name", "as_on_date", "asOnDate"], ""));
//         const hasWideMonths = MONTH_KEYS.some((m) => {
//             const aliases = [m.key, m.key.toLowerCase(), m.key.toUpperCase(), ...m.aliases];
//             return aliases.some((key) => Object.prototype.hasOwnProperty.call(row, key));
//         });

//         if (hasWideMonths) {
//             const base = { parentDivision, code: row.parent_division_code };
//             MONTH_KEYS.forEach((m) => {
//                 const aliases = [m.key, m.key.toLowerCase(), m.key.toUpperCase(), ...m.aliases];
//                 const value = aliases.reduce((found, key) => found !== undefined ? found : row[key], undefined);
//                 output.push({ ...base, period: m.key, [valueKey]: nullableNum(value) });
//             });
//             return;
//         }

//         // Row-per-month response. Some serializers wrap the monthly value in
//         // `amount`, `value`, or the position-specific field.
//         const nested = row?.data && typeof row.data === "object" && !Array.isArray(row.data) ? row.data : row;
//         output.push({
//             parentDivision,
//             code: row.parent_division_code,
//             period: explicitMonth || periodLabel(row),
//             [valueKey]: nullableNum(firstValue(nested, valueKeys, null)),
//         });
//     });

//     return output;
// }

// function buildGenericMonthlyTable(rows, valueKey) {
//     const byParent = new Map();
//     (rows || []).forEach((row) => {
//         const parent = row.parentDivision || "—";
//         if (!byParent.has(parent)) byParent.set(parent, { parentDivision: parent, months: {} });
//         const item = byParent.get(parent);
//         const month = monthKeyFromValue(row.period);
//         if (!month) return;
//         const value = nullableNum(row[valueKey]);
//         if (value === null) return;
//         item.months[month] = (item.months[month] ?? 0) + value;
//     });

//     const data = [...byParent.values()].map((row) => ({
//         ...row,
//         total: MONTH_KEYS.reduce((sum, month) => sum + (row.months[month.key] ?? 0), 0),
//     }));
//     const grandTotal = data.reduce((sum, row) => sum + row.total, 0);

//     return {
//         rows: data,
//         grandTotal,
//         percentages: data.map((row) => grandTotal === 0 ? 0 : (row.total / grandTotal) * 100),
//     };
// }

// function buildPositionMonthlyTable(rows, valueKey) {
//     const byParent = new Map();
//     rows.forEach((row) => {
//         const parent = row.parentDivision || "—";
//         if (!byParent.has(parent)) byParent.set(parent, { parentDivision: parent, months: {} });
//         const item = byParent.get(parent);
//         const month = monthKeyFromValue(row.period) || row.period;
//         if (MONTH_KEYS.some((m) => m.key === month)) item.months[month] = nullableNum(row[valueKey]);
//     });
//     const data = [...byParent.values()].map((row) => {
//         const total = MONTH_KEYS.reduce((sum, m) => sum + (row.months[m.key] ?? 0), 0);
//         return { ...row, total };
//     });
//     const grandTotal = data.reduce((sum, row) => sum + row.total, 0);
//     return {
//         rows: data,
//         grandTotal,
//         percentages: data.map((row) => grandTotal === 0 ? 0 : (row.total / grandTotal) * 100),
//     };
// }

// function formatUnitValue(value, unit) {
//     if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
//     return unit === "AED" ? Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 }) : millions(value).toFixed(1);
// }

// function valueForPositionRow(row, type) {
//     if (type === "assets") return row.currentAssets;
//     if (type === "liabilities") return row.currentLiabilities;
//     return row.nwc;
// }


// function groupMonthlyByPeriod(rows, valueKey) {
//     const periods = [];
//     const byPeriod = new Map();
//     rows.forEach((row) => {
//         if (!byPeriod.has(row.period)) {
//             byPeriod.set(row.period, { period: row.period });
//             periods.push(row.period);
//         }
//         const item = byPeriod.get(row.period);
//         const name = row.parentDivision;
//         item[name] = row[valueKey] === null ? null : millions(row[valueKey]);
//     });
//     return periods.map((period) => byPeriod.get(period));
// }

// function getParentDivisionNames(rows) {
//     return [...new Set(rows.map((row) => row.parentDivision).filter((v) => v && v !== "—"))];
// }

// function safePct(value, total) {
//     if (value === null || value === undefined || total === null || total === undefined || num(total) === 0) return 0;
//     return (num(value) / num(total)) * 100;
// }

// function PositionBarXAxisTick({ x, y, payload }) {
//     const raw = String(payload?.value ?? "");
//     const words = raw.split(/\\s+/).filter(Boolean);
//     let lines = [raw];

//     if (raw.length > 16 && words.length > 1) {
//         let first = "";
//         let second = "";
//         const midpoint = Math.ceil(words.length / 2);
//         words.forEach((word, index) => {
//             if (index < midpoint) first += `${first ? " " : ""}${word}`;
//             else second += `${second ? " " : ""}${word}`;
//         });
//         lines = [first, second];
//     }

//     return (
//         <g transform={`translate(${x},${y})`}>
//             <text
//                 textAnchor="middle"
//                 fill="#64748b"
//                 fontSize={8}
//                 fontWeight={600}
//             >
//                 {lines.map((line, index) => (
//                     <tspan key={index} x="0" dy={index === 0 ? 0 : 10}>
//                         {line}
//                     </tspan>
//                 ))}
//             </text>
//         </g>
//     );
// }

// function FixedAssetsBarXAxisTick({ x, y, payload }) {
//     const raw = String(payload?.value ?? "");
//     const words = raw.split(/\s+/).filter(Boolean);
//     let lines = [raw];

//     if (words.length > 1) {
//         let first = "";
//         let second = "";
//         const maxChars = Math.ceil(raw.length / 2);
//         words.forEach((word) => {
//             const next = `${first ? `${first} ` : ""}${word}`;
//             if (!first || next.length <= maxChars) first = next;
//             else second += `${second ? " " : ""}${word}`;
//         });
//         lines = second ? [first, second] : [raw];
//     }

//     return (
//         <g transform={`translate(${x},${y})`}>
//             <text textAnchor="middle" fill="#64748b" fontSize={8} fontWeight={600}>
//                 {lines.map((line, index) => (
//                     <tspan key={index} x="0" dy={index === 0 ? 0 : 10}>
//                         {line}
//                     </tspan>
//                 ))}
//             </text>
//         </g>
//     );
// }

// function BorrowingBarXAxisTick({ x, y, payload }) {
//     const raw = String(payload?.value ?? "");
//     const words = raw.split(/\s+/).filter(Boolean);
//     let lines = [raw];

//     if (words.length > 1) {
//         let first = "";
//         let second = "";
//         const maxChars = Math.ceil(raw.length / 2);
//         words.forEach((word) => {
//             const next = `${first ? `${first} ` : ""}${word}`;
//             if (!first || next.length <= maxChars) first = next;
//             else second += `${second ? " " : ""}${word}`;
//         });
//         lines = second ? [first, second] : [raw];
//     }

//     return (
//         <g transform={`translate(${x},${y})`}>
//             <text textAnchor="middle" fill="#64748b" fontSize={8} fontWeight={600}>
//                 {lines.map((line, index) => (
//                     <tspan key={index} x="0" dy={index === 0 ? 0 : 10}>
//                         {line}
//                     </tspan>
//                 ))}
//             </text>
//         </g>
//     );
// }

// function NwcBarXAxisTick({ x, y, payload }) {
//     const raw = String(payload?.value ?? "");
//     const words = raw.split(/\s+/).filter(Boolean);
//     let lines = [raw];

//     if (raw.length > 16 && words.length > 1) {
//         let first = "";
//         let second = "";
//         words.forEach((word) => {
//             const next = `${first ? `${first} ` : ""}${word}`;
//             if (next.length <= Math.ceil(raw.length / 2) || !first) first = next;
//             else second += `${second ? " " : ""}${word}`;
//         });
//         lines = second ? [first, second] : [raw];
//     }

//     return (
//         <g transform={`translate(${x},${y})`}>
//             <text textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={600}>
//                 {lines.map((line, index) => (
//                     <tspan key={index} x="0" dy={index === 0 ? 0 : 12}>{line}</tspan>
//                 ))}
//             </text>
//         </g>
//     );
// }

// function NwcBarYAxisTick({ x, y, payload }) {
//     const raw = String(payload?.value ?? "");
//     const words = raw.split(/\s+/).filter(Boolean);
//     let lines = [raw];
//     if (raw.length > 18 && words.length > 1) {
//         let first = "";
//         let second = "";
//         const midpoint = Math.ceil(words.length / 2);
//         words.forEach((word, index) => {
//             if (index < midpoint) first += `${first ? " " : ""}${word}`;
//             else second += `${second ? " " : ""}${word}`;
//         });
//         lines = second ? [first, second] : [raw];
//     }
//     return (
//         <g transform={`translate(${x},${y})`}>
//             <text textAnchor="end" fill="#1e293b" fontSize={10.5} fontWeight={700}>
//                 {lines.map((line, index) => <tspan key={index} x="-8" dy={index === 0 ? 0 : 12}>{line}</tspan>)}
//             </text>
//         </g>
//     );
// }

// function formatNwcAxisValue(value) {
//     const n = Number(value);
//     if (!Number.isFinite(n)) return "";
//     const abs = Math.abs(n);
//     if (abs >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
//     if (abs >= 1000) return `${Math.round(n / 1000)}K`;
//     return `${Math.round(n)}`;
// }

// function Modal({
//     open,
//     title,
//     type,
//     filters,
//     detail,
//     monthly,
//     loading,
//     onClose,
//     onFiltersChange,
//     onApplyFilters,
//     onResetFilters,
//     onTabChange,
//     currency,
//     filterOptions,
// }) {
//     const [view, setView] = useState("Current");

//     useEffect(() => {
//         if (!open) return;
//         setView(type === "equity" ? "Equity Components" : type === "nwc" ? "Month-on-Month" : "Current");
//     }, [open, type]);

//     const tabs =
//         type === "assets" || type === "liabilities" ? ["Current", "Month-on-Month"] :
//             type === "nwc" ? ["Month-on-Month"] :
//                 type === "equity" ? ["Equity Components", "Parent Division MoM"] :
//                     type === "investments" ? ["Current", "Parent Division MoM"] :
//                         type === "borrowing" ? ["Current", "Long-Term Bank Loan MoM", "Related Party Loan MoM", "Short-Term Bank Borrowing MoM"] :
//                             type === "fixedAssets" ? ["Current", "Parent Division MoM"] :
//                                 [];

//     useEffect(() => {
//         const isMonthlyView =
//             view === "Month-on-Month" ||
//             view === "Parent Division MoM" ||
//             view === "Long-Term Bank Loan MoM" ||
//             view === "Related Party Loan MoM" ||
//             view === "Short-Term Bank Borrowing MoM";
//         if (open && isMonthlyView) onTabChange?.(view);
//     }, [open, view]);

//     const monthlyKind =
//         type === "equity" ? "equity" :
//             type === "borrowing" ? "borrowing" :
//                 "investment";
//     const monthlySource = monthlyKind === "borrowing" ? (monthly?.borrowings || []) : monthlyKind === "equity" ? (monthly?.equity || []) : (monthly?.investments || []);
//     const parentNames = getParentDivisionNames(monthlySource);

//     let columns = [];
//     let rows = [];
//     const isPositionType = type === "assets" || type === "liabilities";
//     const [positionUnit, setPositionUnit] = useState("AED MILLION");
//     const positionRows = isPositionType ? (detail?.currentViewAll || []).map((r) => ({
//         legalGroup: r.legal_group_name ?? r.legal_group ?? r.legal_group_id ?? "—",
//         legalEntity: r.legal_entity_name ?? r.legal_entity ?? r.legal_entity_id ?? "—",
//         parentDivision: r.parent_division_name ?? r.parent_division ?? r.parent_division_code ?? "—",
//         subDivision: r.subdivision_name ?? r.sub_division_name ?? r.subdivision ?? r.subdivision_id ?? "—",
//         currentAssets: nullableNum(r.current_assets ?? r.total_current_assets),
//         currentLiabilities: nullableNum(r.current_liabilities ?? r.total_current_liabilities),
//         nwc: nullableNum(r.net_working_capital),
//         currentRatio: nullableNum(r.current_ratio),
//         nwcTurnoverRatio: nullableNum(r.nwc_turnover_ratio),
//         percentageOfTotal: nullableNum(r.percentage_of_total ?? r.pct_of_total),
//     })) : [];

//     // Equity Components is the current/detail tab for the equity modal.
//     // Keep Parent Division MoM as the only monthly view for equity.
//     const isCurrentView = view === "Current" || (type === "equity" && view === "Equity Components");

//     if (isCurrentView) {
//         if (type === "assets" || type === "liabilities" || type === "nwc") {
//             const isAsset = type === "assets";
//             const composition = detail?.currentComposition;
//             const compositionRows = isAsset ? (composition?.currentAssets || []) : (composition?.currentLiabilities || []);
//             const total = isAsset ? composition?.totalCurrentAssets : composition?.totalCurrentLiabilities;

//             if (type === "assets" || type === "liabilities") {
//                 columns = ["Item", `Amount (${positionUnit})`, "% of Total"];
//                 rows = compositionRows.map((r) => [
//                     r.item,
//                     r.amount === null || r.amount === undefined ? "—" : formatUnitValue(Number(r.amount) * 1000000, positionUnit),
//                     r.pct === null || r.pct === undefined ? "—" : `${Number(r.pct).toFixed(1)}%`,
//                 ]);
//                 const calculatedTotal = compositionRows.reduce((sum, r) => sum + (r.amount ?? 0), 0) * 1000000;
//                 const totalValue = total !== null && total !== undefined ? total : calculatedTotal;
//                 rows.push([
//                     isAsset ? "Total Current Assets" : "Total Current Liabilities",
//                     formatUnitValue(totalValue, positionUnit),
//                     "100.0%",
//                 ]);
//             } else {
//                 const source = detail?.investments || [];
//                 const totalNwc = source.reduce((sum, r) => sum + (r.nwc ?? 0), 0);
//                 columns = ["Parent Division", `NWC (${positionUnit})`];
//                 rows = source.map((r) => [
//                     r.parentDivision,
//                     r.nwc === null ? "—" : formatUnitValue(r.nwc, positionUnit),
//                 ]);
//                 rows.push(["Total", formatUnitValue(totalNwc, positionUnit)]);
//             }
//         } else if (type === "equity") {
//             const data = detail?.equityViewAll || [];
//             columns = [
//                 "Parent Division",
//                 `Share Capital (${positionUnit})`,
//                 `Additional Capital (${positionUnit})`,
//                 `Reserves & Surplus (${positionUnit})`,
//                 `Partner Current Account (${positionUnit})`,
//                 `Current Year Profit (${positionUnit})`,
//                 `Equity Total (${positionUnit})`,
//             ];
//             rows = data.map((r) => [
//                 r.parentDivision,
//                 r.shareCapital === null ? "—" : formatUnitValue(r.shareCapital, positionUnit),
//                 r.additionalCapital === null ? "—" : formatUnitValue(r.additionalCapital, positionUnit),
//                 r.reservesAndSurplus === null ? "—" : formatUnitValue(r.reservesAndSurplus, positionUnit),
//                 r.partnerCurrentAccount === null ? "—" : formatUnitValue(r.partnerCurrentAccount, positionUnit),
//                 r.currentYearProfit === null ? "—" : formatUnitValue(r.currentYearProfit, positionUnit),
//                 r.equityTotal === null ? "—" : formatUnitValue(r.equityTotal, positionUnit),
//             ]);
//             if (data.length) {
//                 const total = data.reduce((sum, r) => sum + (r.equityTotal ?? 0), 0);
//                 rows.push(["Total", "—", "—", "—", "—", "—", formatUnitValue(total, positionUnit)]);
//             }
//         } else if (type === "investments") {
//             const data = detail?.investments || [];
//             columns = ["Parent Division", `Fixed Assets & Other NCA (${positionUnit})`, `NWC (${positionUnit})`, `Provision for Gratuity (${positionUnit})`, `Total Investments (${positionUnit})`];
//             rows = data.map((r) => [r.parentDivision, r.fixedAssets === null ? "—" : formatUnitValue(r.fixedAssets, positionUnit), r.nwc === null ? "—" : formatUnitValue(r.nwc, positionUnit), r.provision === null ? "—" : formatUnitValue(r.provision, positionUnit), r.totalInvestments === null ? "—" : formatUnitValue(r.totalInvestments, positionUnit)]);
//         } else if (type === "borrowing") {
//             const data = detail?.borrowings || [];
//             columns = ["Parent Division", `Long-Term Bank (${positionUnit})`, `Short-Term Bank (${positionUnit})`, `Bank Borrowings Total (${positionUnit})`, `Related Party Loan (${positionUnit})`, `Total Borrowings (${positionUnit})`];
//             rows = data.map((r) => [r.parentDivision, r.longTerm === null ? "—" : formatUnitValue(r.longTerm, positionUnit), r.shortTerm === null ? "—" : formatUnitValue(r.shortTerm, positionUnit), r.bankTotal === null ? "—" : formatUnitValue(r.bankTotal, positionUnit), r.relatedParty === null ? "—" : formatUnitValue(r.relatedParty, positionUnit), r.total === null ? "—" : formatUnitValue(r.total, positionUnit)]);
//         } else if (type === "fixedAssets") {
//             const data = detail?.investments || [];
//             columns = ["Parent Division", `Fixed Assets & Other NCA (${positionUnit})`, `Provision for Gratuity (${positionUnit})`, `NWC (${positionUnit})`, `Total Investments (${positionUnit})`];
//             rows = data.map((r) => [r.parentDivision, r.fixedAssets === null ? "—" : formatUnitValue(r.fixedAssets, positionUnit), r.provision === null ? "—" : formatUnitValue(r.provision, positionUnit), r.nwc === null ? "—" : formatUnitValue(r.nwc, positionUnit), r.totalInvestments === null ? "—" : formatUnitValue(r.totalInvestments, positionUnit)]);
//         }
//     } else {
//         if (isPositionType) {
//             const valueKey = type === "assets" ? "currentAssets" : "currentLiabilities";
//             // Month-on-Month for Current Assets / Current Liabilities comes from
//             // getFinancialPositionCurrentAssetsLiabilitiesViewAll, not the investments endpoint.
//             const monthlyRows = normalizePositionMonthlyRows(detail?.currentViewAll || [], valueKey);
//             const monthlyTable = buildPositionMonthlyTable(monthlyRows, valueKey);
//             columns = ["Parent Division", ...MONTH_KEYS.map((m) => m.key), "Total", "% of Total"];
//             rows = monthlyTable.rows.map((r, index) => [
//                 r.parentDivision,
//                 ...MONTH_KEYS.map((m) => formatUnitValue(r.months[m.key], positionUnit)),
//                 formatUnitValue(r.total, positionUnit),
//                 `${monthlyTable.percentages[index].toFixed(1)}%`,
//             ]);
//             rows.push(["Total", ...MONTH_KEYS.map((m) => {
//                 const value = monthlyTable.rows.reduce((sum, r) => sum + (r.months[m.key] ?? 0), 0);
//                 return formatUnitValue(value, positionUnit);
//             }), formatUnitValue(monthlyTable.grandTotal, positionUnit), "100.0%"]);
//         } else {
//             let key = "nwc";
//             if (type === "equity") key = "equity";
//             if (type === "borrowing") {
//                 key = view === "Long-Term Bank Loan MoM" ? "longTerm" : view === "Short-Term Bank Borrowing MoM" ? "shortTerm" : "relatedParty";
//             }
//             if (type === "fixedAssets") key = "fixedAssets";
//             const source = monthlyKind === "borrowing" ? monthly?.borrowings : monthlyKind === "equity" ? monthly?.equity : monthly?.investments;

//             if (type === "nwc") {
//                 // NWC View All shows all months returned by the backend.
//                 // The main page remains limited to the latest five months separately.
//                 const nwcRows = (source || [])
//                     .filter((row) => row?.parentDivision && row.parentDivision !== "—" && row.nwc !== null && row.nwc !== undefined)
//                     .map((row) => {
//                         const periodKey = row.periodKey || row.period_code || row.period || row.periodMonth || "";
//                         const rawPeriod = row.periodMonth || row.periodCode || row.period;
//                         return {
//                             ...row,
//                             periodKey: String(periodKey),
//                             monthLabel: monthNameFromPeriod(rawPeriod),
//                         };
//                     });

//                 const periodKeys = Array.from(new Set(nwcRows.map((row) => row.periodKey)))
//                     .sort((a, b) => a.localeCompare(b));

//                 const divisions = Array.from(new Set(
//                     nwcRows
//                         .filter((row) => periodKeys.includes(row.periodKey))
//                         .map((row) => row.parentDivision)
//                 ));

//                 columns = ["Parent Division", ...periodKeys.map((periodKey) => {
//                     const row = nwcRows.find((item) => item.periodKey === periodKey);
//                     return row?.monthLabel || monthNameFromPeriod(periodKey);
//                 })];

//                 rows = divisions.map((division) => [
//                     division,
//                     ...periodKeys.map((periodKey) => {
//                         const row = nwcRows.find((item) => item.parentDivision === division && item.periodKey === periodKey);
//                         return row?.nwc === null || row?.nwc === undefined
//                             ? "—"
//                             : formatUnitValue(row.nwc, positionUnit);
//                     }),
//                 ]);
//             } else {
//                 const monthlyTable = buildGenericMonthlyTable(source || [], key);
//                 columns = ["Parent Division", ...MONTH_KEYS.map((month) => month.key), "Total", "% of Total"];
//                 rows = monthlyTable.rows.map((row, index) => [
//                     row.parentDivision,
//                     ...MONTH_KEYS.map((month) => row.months[month.key] === null || row.months[month.key] === undefined ? "—" : formatUnitValue(row.months[month.key], positionUnit)),
//                     formatUnitValue(row.total, positionUnit),
//                     `${monthlyTable.percentages[index].toFixed(1)}%`,
//                 ]);
//                 rows.push([
//                     "Total",
//                     ...MONTH_KEYS.map((month) => {
//                         const value = monthlyTable.rows.reduce((sum, row) => sum + (row.months[month.key] ?? 0), 0);
//                         return formatUnitValue(value, positionUnit);
//                     }),
//                     Number(monthlyTable.grandTotal / 1000000).toFixed(1),
//                     "100.0%",
//                 ]);
//             }
//         }
//     }

//     return (
//         <AnimatePresence>
//             {open && (
//                 <motion.div className="fp-sales-modal-backdrop" style={styles.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                     onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
//                     <motion.div className="fp-sales-modal" style={styles.modal} initial={{ opacity: 0, scale: .985, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .985, y: 8 }}>
//                         <div className="fp-modal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 18px 10px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(90deg,#f8fafc,#fff)", flexShrink: 0 }}>
//                             <div style={{ minWidth: 0 }}>
//                                 <h3 style={{ margin: 0, color: COLORS.text, fontSize: ".92rem", fontWeight: 800 }}>{title}</h3>
//                                 <p style={{ margin: "3px 0 0", color: COLORS.muted, fontSize: ".64rem", fontWeight: 500 }}>Detailed View · {formatAsOnDate(filters?.asOnDate)}</p>
//                             </div>
//                             <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: 0, borderRadius: 7, background: "transparent", color: COLORS.muted, cursor: "pointer", fontSize: 16 }} aria-label="Close modal">✕</button>
//                         </div>
//                         <div className="fp-modal-filter" style={{ padding: "8px 18px", borderBottom: "1px solid #e2e8f0", background: "#fff", flexShrink: 0 }}>
//                             <FilterPanel state={filters} onChange={onFiltersChange} onApply={onApplyFilters} onReset={onResetFilters} compact filterOptions={filterOptions} />
//                         </div>
//                         {tabs.length > 0 && <div className="fp-modal-tabs" style={{ padding: "8px 18px 0", background: "#fff", flexShrink: 0, overflowX: "auto" }}>
//                             <div style={{ ...styles.tabs, gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, minWidth: tabs.length > 2 ? 720 : 360, maxWidth: tabs.length > 2 ? 920 : 620, margin: 0 }}>
//                                 {tabs.map((tab) => <button type="button" key={tab} onClick={() => setView(tab)}
//                                     style={{ ...styles.tab, background: view === tab ? COLORS.primaryBlue : "#f1f5f9", color: view === tab ? "#fff" : COLORS.muted, height: 34, whiteSpace: "nowrap" }}>{tab}</button>)}
//                             </div>
//                         </div>}
//                         <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 18px 0", gap: 4, background: "#fff" }}>
//                             {['AED', 'AED MILLION'].map((unit) => <button type="button" key={unit} onClick={() => setPositionUnit(unit)} style={{ border: `1px solid ${positionUnit === unit ? COLORS.primaryBlue : COLORS.border}`, background: positionUnit === unit ? COLORS.primaryBlue : "#fff", color: positionUnit === unit ? "#fff" : COLORS.muted, borderRadius: 6, padding: "5px 9px", font: `700 .60rem ${font}`, cursor: "pointer" }}>{unit}</button>)}
//                         </div>
//                         <div className="fp-modal-content" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "10px 18px 14px" }}>
//                             {loading ? <Skeleton height={100} /> : (
//                                 rows.length ? <table className="fp-viewall-table" style={{ ...styles.table, minWidth: !isCurrentView ? 1080 : 0 }}>
//                                     <thead><tr>{columns.map((column, index) => <th key={column} style={{ ...styles.th, padding: !isCurrentView ? "8px 8px" : styles.th.padding, fontSize: !isCurrentView ? ".62rem" : styles.th.fontSize, textTransform: !isCurrentView ? "uppercase" : "none", textAlign: index > 0 ? "right" : "left", position: "sticky", top: 0, zIndex: 2, whiteSpace: !isCurrentView ? "nowrap" : styles.th.whiteSpace }}>{column}</th>)}</tr></thead>
//                                     <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} style={row[0] === "Total" ? { background: "#f8fafc" } : undefined}>{row.map((cell, cellIndex) => <td key={cellIndex} style={{ ...styles.td, padding: !isCurrentView ? "7px 8px" : styles.td.padding, fontSize: !isCurrentView ? ".64rem" : styles.td.fontSize, fontWeight: row[0] === "Total" ? 800 : 500, textAlign: cellIndex > 0 ? "right" : "left", whiteSpace: cellIndex === 0 && !isCurrentView ? "normal" : "nowrap", lineHeight: !isCurrentView ? 1.15 : styles.td.lineHeight }}>{cell}</td>)}</tr>)}</tbody>
//                                 </table> : <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: ".72rem" }}>No data available for this view.</div>
//                             )}
//                             {isPositionType && view === "Current" && (detail?.currentComposition) && (type === "assets" || type === "liabilities") && (
//                                 <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
//                                     <div style={{ fontSize: ".72rem", fontWeight: 800, color: COLORS.text, marginBottom: 6 }}>{type === "assets" ? "Current Assets" : "Current Liabilities"}</div>
//                                     <div style={{ height: 250 }}>
//                                         <ResponsiveContainer width="100%" height="100%">
//                                             <BarChart
//                                                 data={(type === "assets" ? (detail.currentComposition.currentAssets || []) : (detail.currentComposition.currentLiabilities || [])).map((r) => ({
//                                                     name: r.item,
//                                                     value: r.amount === null || r.amount === undefined ? null : (positionUnit === "AED" ? Number(r.amount) * 1000000 : Number(r.amount)),
//                                                 }))}
//                                                 margin={{ top: 8, right: 12, left: 4, bottom: 48 }}
//                                             >
//                                                 <CartesianGrid vertical={false} stroke="#eef2f7" />
//                                                 <XAxis dataKey="name" tick={<PositionBarXAxisTick />} axisLine={false} tickLine={false} interval={0} height={58} />
//                                                 <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
//                                                 <Tooltip content={<ChartTooltip />} />
//                                                 <Bar isAnimationActive={true} animationDuration={650} dataKey="value" name={`${type === "assets" ? "Current Assets" : "Current Liabilities"} (${positionUnit})`} fill={type === "assets" ? "#2563eb" : "#e11d48"} radius={[4, 4, 0, 0]} barSize={28} />
//                                             </BarChart>
//                                         </ResponsiveContainer>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                         <div style={{ display: "flex", justifyContent: "flex-end", padding: "9px 18px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", flexShrink: 0 }}>
//                             <button type="button" onClick={onClose} style={{ border: 0, borderRadius: 8, padding: "7px 18px", background: "#e2e8f0", color: "#475569", font: `700 .68rem ${font}`, cursor: "pointer" }}>Close</button>
//                         </div>
//                     </motion.div>
//                 </motion.div>
//             )}
//         </AnimatePresence>
//     );
// }

// export default function FinancialPosition() {
//     const { isMobile, isSmall, isTablet, isMedium } = useResponsiveColumns();

//     const defaultFilters = useMemo(() => ({
//         legalGroups: [],
//         legalEntities: [],
//         parentDivisions: [],
//         subDivisions: [],
//         reportingCurrency: "AED",
//         asOnDate: "",
//     }), []);

//     const [filterOptions, setFilterOptions] = useState({
//         legalGroups: [],
//         legalEntities: [],
//         parentDivisions: [],
//         subDivisions: [],
//         reportingCurrencies: [],
//         asOnDates: [],
//         operationalAsOnDate: "",
//     });
//     const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false);
//     const [filters, setFilters] = useState(defaultFilters);
//     const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [dashboard, setDashboard] = useState({
//         kpis: [],
//         composition: { totalCurrentAssets: null, totalCurrentLiabilities: null, currentAssets: [], currentLiabilities: [] },
//         equity: null,
//         investments: [],
//         borrowings: [],
//         investmentsMonthly: [],
//         nwcTrend: [],
//     });

//     const [modal, setModal] = useState(null);
//     const [modalFilters, setModalFilters] = useState(defaultFilters);
//     const [modalAppliedFilters, setModalAppliedFilters] = useState(defaultFilters);
//     const [modalLoading, setModalLoading] = useState(false);
//     const [modalError, setModalError] = useState("");
//     const [modalData, setModalData] = useState({});
//     const requestCache = useRef(new Map());

//     const requestOnce = async (key, fn) => {
//         if (requestCache.current.has(key)) return requestCache.current.get(key);
//         const promise = fn().finally(() => requestCache.current.delete(key));
//         requestCache.current.set(key, promise);
//         return promise;
//     };

//     const appliedApiFilters = useMemo(() => buildApiFilters(appliedFilters), [appliedFilters]);

//     useEffect(() => {
//         let cancelled = false;

//         const loadFilterOptions = async () => {
//             try {
//                 const response = await getWorkingCapitalFilterOptions({ aging_basis: "DUE_DATE" });
//                 if (cancelled) return;

//                 const normalized = normalizeFinancialFilterOptions(response);
//                 const initialDate = normalized.operationalAsOnDate || normalized.asOnDates[0] || "";
//                 const initialCurrency = normalized.reportingCurrencies[0] || "AED";
//                 const initialFilters = {
//                     ...defaultFilters,
//                     reportingCurrency: initialCurrency,
//                     asOnDate: initialDate,
//                 };

//                 setFilterOptions(normalized);
//                 setFilters(initialFilters);
//                 setAppliedFilters(initialFilters);
//                 setModalFilters(initialFilters);
//                 setModalAppliedFilters(initialFilters);
//                 setFilterOptionsLoaded(true);
//             } catch (err) {
//                 if (cancelled) return;
//                 setFilterOptionsLoaded(true);
//                 setError(err?.response?.data?.message || err?.response?.data?.detail || err?.message || "Unable to load Financial Position filter options.");
//             }
//         };

//         loadFilterOptions();
//         return () => { cancelled = true; };
//     }, [defaultFilters]);

//     useEffect(() => {
//         if (!filterOptionsLoaded) return;

//         let cancelled = false;
//         setLoading(true);
//         setError("");

//         const key = JSON.stringify(appliedApiFilters);

//         /*
//          * Each dashboard endpoint is intentionally loaded independently.
//          *
//          * In particular, these must load on the initial page render:         
//          *   - Borrowing Position -> borrowings/by-parent-division
//          *   - Fixed Assets trend -> investments/monthly-by-parent-division
//          *   - NWC MoM -> investments/monthly-by-parent-division
//          *
//          * Do not let a slow/failed endpoint block the other charts.
//          */
//         const loadSection = (requestKey, requestFn, updateFn, sectionName) => {
//             requestOnce(`${requestKey}:${key}`, requestFn)
//                 .then((response) => {
//                     if (cancelled) return;
//                     updateFn(response);
//                 })
//                 .catch((err) => {
//                     if (cancelled) return;
//                     console.error(`[Financial Position] ${sectionName} failed`, err);
//                     setError((previous) => previous ||
//                         err?.response?.data?.message ||
//                         err?.response?.data?.detail ||
//                         err?.message ||
//                         `Unable to load ${sectionName}.`
//                     );
//                 });
//         };

//         loadSection(
//             "kpis",
//             () => getFinancialPositionKpis(appliedApiFilters),
//             (response) => setDashboard((previous) => ({ ...previous, kpis: normalizeKpis(response) })),
//             "Financial Position KPIs"
//         );

//         loadSection(
//             "composition",
//             () => getFinancialPositionCurrentAssetsLiabilitiesComposition(appliedApiFilters),
//             (response) => setDashboard((previous) => ({ ...previous, composition: normalizeComposition(response) })),
//             "Current Assets / Liabilities composition"
//         );

//         loadSection(
//             "equity",
//             () => getFinancialPositionEquityContribution(appliedApiFilters),
//             (response) => setDashboard((previous) => ({ ...previous, equity: normalizeEquity(response) })),
//             "Equity Contribution"
//         );

//         loadSection(
//             "investments",
//             () => getFinancialPositionInvestmentsByParentDivision(appliedApiFilters),
//             (response) => setDashboard((previous) => ({ ...previous, investments: normalizeInvestmentRows(response) })),
//             "Investments by Parent Division"
//         );

//         // Borrowing Position: /api/financial-position/borrowings/by-parent-division
//         loadSection(
//             "borrowings",
//             () => getFinancialPositionBorrowingsByParentDivision(appliedApiFilters),
//             (response) => setDashboard((previous) => ({ ...previous, borrowings: normalizeBorrowingRows(response) })),
//             "Borrowing Position"
//         );

//         // ONE monthly Investments endpoint feeds both dashboard trends:
//         // Fixed Assets & Other Non-Current Assets and Month on Month NWC.
//         // Month-on-Month NWC uses ONLY getFinancialPositionInvestmentsByParentDivision.
//         // Fetch the latest 5 monthly snapshots using the same endpoint so the chart
//         // gets real monthly values instead of relying on the current snapshot only.
//         loadSection(
//             "investmentsMonthly",
//             () => fetchLatestFiveInvestmentSnapshots(appliedApiFilters),
//             (rows) => setDashboard((previous) => ({
//                 ...previous,
//                 investmentsMonthly: normalizeInvestmentRows({ rows }),
//             })),
//             "Net Working Capital monthly trend"
//         );

//         // The dedicated Net Working Capital Trend endpoint is currently returning
//         // 404, so do not call it until the backend endpoint is deployed.
//         // Keep nwcTrend empty rather than generating/aggregating trend values in
//         // the frontend.

//         setLoading(false);

//         return () => { cancelled = true; };
//     }, [appliedApiFilters, filterOptionsLoaded]);

//     const loadModalData = async (type, filtersForRequest) => {
//         const apiFilters = buildApiFilters(filtersForRequest);
//         const key = JSON.stringify(apiFilters);

//         setModalLoading(true);
//         setModalError("");

//         try {
//             if (type === "assets" || type === "liabilities") {
//                 const [compositionResponse, viewAllResponse] = await Promise.all([
//                     requestOnce(`currentComposition:${key}`, () => getFinancialPositionCurrentAssetsLiabilitiesComposition(apiFilters)),
//                     requestOnce(`currentViewAll:${key}`, () => getFinancialPositionCurrentAssetsLiabilitiesViewAll(apiFilters)),
//                 ]);
//                 setModalData((prev) => ({
//                     ...prev,
//                     currentComposition: normalizeCurrentPositionComposition(compositionResponse),
//                     currentViewAll: toRows(viewAllResponse),
//                 }));
//             } else if (type === "nwc") {
//                 // NWC by Parent Division comes from the Investments by Parent Division endpoint.
//                 const response = await requestOnce(`investmentsByParentDivision:${key}`, () => getFinancialPositionInvestmentsByParentDivision(apiFilters));
//                 setModalData((prev) => ({ ...prev, investments: normalizeInvestmentRows(response) }));
//             } else if (type === "equity") {
//                 const viewAll = await getFinancialPositionEquityViewAll(apiFilters);
//                 setModalData((prev) => ({
//                     ...prev,
//                     equityViewAll: normalizeEquityViewAll(viewAll),
//                 }));
//             } else if (type === "investments" || type === "fixedAssets") {
//                 const response = await requestOnce(`investmentsViewAll:${key}`, () => getFinancialPositionInvestmentsByParentDivision(apiFilters));
//                 setModalData((prev) => ({ ...prev, investments: normalizeInvestmentRows(response) }));
//             } else if (type === "borrowing") {
//                 const response = await requestOnce(`borrowingsViewAll:${key}`, () => getFinancialPositionBorrowingsByParentDivision(apiFilters));
//                 setModalData((prev) => ({ ...prev, borrowings: normalizeBorrowingRows(response) }));
//             }
//         } catch (err) {
//             setModalError(err?.response?.data?.message || err?.message || "Unable to load this detail view.");
//         } finally {
//             setModalLoading(false);
//         }
//     };

//     const loadModalTab = async (view) => {
//         if (!modal) return;
//         const apiFilters = buildApiFilters(modalAppliedFilters);
//         const key = JSON.stringify(apiFilters);

//         try {
//             if (modal === "assets" || modal === "liabilities") {
//                 // Month-on-Month uses the Current Assets/Liabilities View All API
//                 // for each month of the selected year. The composition API remains
//                 // exclusive to the Current tab.
//                 const year = Number(String(modalAppliedFilters?.asOnDate || "").slice(0, 4)) || new Date().getFullYear();
//                 const monthDates = Array.from({ length: 12 }, (_, index) => {
//                     const month = String(index + 1).padStart(2, "0");
//                     const lastDay = new Date(year, index + 1, 0).getDate();
//                     return `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
//                 });

//                 const responses = await Promise.allSettled(
//                     monthDates.map((date) => {
//                         const monthFilters = { ...apiFilters, calendar_date: date };
//                         return requestOnce(
//                             `currentViewAll:${key}:${date}`,
//                             () => getFinancialPositionCurrentAssetsLiabilitiesViewAll(monthFilters)
//                         ).then((response) => ({
//                             date,
//                             rows: toRows(response),
//                         }));
//                     })
//                 );

//                 const monthlyRows = [];
//                 responses.forEach((result, index) => {
//                     if (result.status !== "fulfilled") return;
//                     const monthDate = result.value.date;
//                     const rowsForMonth = result.value.rows || [];
//                     rowsForMonth.forEach((row) => {
//                         monthlyRows.push({
//                             ...row,
//                             period_month: monthDate.slice(5, 7),
//                             period: monthDate,
//                             __monthDate: monthDate,
//                         });
//                     });
//                 });

//                 setModalData((prev) => ({ ...prev, currentViewAll: monthlyRows }));
//             } else if (modal === "nwc") {
//                 // NWC View All has ONLY Month-on-Month and uses ONLY
//                 // getFinancialPositionInvestmentsMonthlyByParentDivision for the
//                 // latest five monthly snapshots.
//                 const rows = await fetchLatestFiveInvestmentSnapshots(apiFilters);
//                 setModalData((prev) => ({ ...prev, investmentsMonthly: normalizeInvestmentRows({ rows }) }));
//             } else if (modal === "investments" || modal === "fixedAssets") {
//                 const response = await requestOnce(`investmentsMonthly:${key}`, () => getFinancialPositionInvestmentsMonthlyByParentDivision(apiFilters));
//                 setModalData((prev) => ({ ...prev, investmentsMonthly: normalizeMonthly(response, "investment") }));
//             } else if (modal === "equity") {
//                 const response = await getFinancialPositionEquityMonthlyByParentDivision(apiFilters);
//                 setModalData((prev) => ({
//                     ...prev,
//                     equityMonthly: normalizeEquityMonthly(response),
//                 }));
//             } else if (modal === "borrowing") {
//                 const response = await requestOnce(`borrowingsMonthly:${key}`, () => getFinancialPositionBorrowingsMonthlyByParentDivision(apiFilters));
//                 setModalData((prev) => ({ ...prev, borrowingsMonthly: normalizeMonthly(response, "borrowing") }));
//             }
//         } catch (err) {
//             setModalError(err?.response?.data?.message || err?.message || "Unable to load monthly data.");
//         }
//     };

//     const updateFilter = (key, value) => setFilters((previous) => cascadeUpdateFilter(previous, key, value));
//     const handleApply = () => setAppliedFilters({ ...filters });
//     const initialLoadedFilters = () => ({
//         ...defaultFilters,
//         reportingCurrency: filterOptions.reportingCurrencies[0] || defaultFilters.reportingCurrency,
//         asOnDate: filterOptions.operationalAsOnDate || filterOptions.asOnDates[0] || "",
//     });

//     const handleReset = () => {
//         const reset = initialLoadedFilters();
//         setFilters(reset);
//         setAppliedFilters(reset);
//     };

//     const openTable = (type) => {
//         const next = {
//             ...appliedFilters,
//             legalGroups: [...appliedFilters.legalGroups],
//             legalEntities: [...appliedFilters.legalEntities],
//             parentDivisions: [...appliedFilters.parentDivisions],
//             subDivisions: [...appliedFilters.subDivisions],
//         };
//         setModalFilters(next);
//         setModalAppliedFilters(next);
//         setModalData({});
//         setModalError("");
//         setModal(type);
//         loadModalData(type, next);
//     };

//     const applyModalFilters = () => {
//         const next = {
//             ...modalFilters,
//             legalGroups: Array.isArray(modalFilters.legalGroups) ? [...modalFilters.legalGroups] : [],
//             legalEntities: Array.isArray(modalFilters.legalEntities) ? [...modalFilters.legalEntities] : [],
//             parentDivisions: Array.isArray(modalFilters.parentDivisions) ? [...modalFilters.parentDivisions] : [],
//             subDivisions: Array.isArray(modalFilters.subDivisions) ? [...modalFilters.subDivisions] : [],
//         };
//         setModalAppliedFilters(next);
//         if (modal) loadModalData(modal, next);
//     };

//     const resetModalFilters = () => {
//         const reset = initialLoadedFilters();
//         setModalFilters(reset);
//         setModalAppliedFilters(reset);
//         if (modal) loadModalData(modal, reset);
//     };

//     const exportRows = (title, columns, rows, format, filename) => {
//         if (format === "excel") downloadExcelFile(title, columns, rows, filename);
//         if (format === "pdf") printPdfFile(title, columns, rows);
//     };

//     const compositionAssets = dashboard.composition.currentAssets;
//     const compositionLiabilities = dashboard.composition.currentLiabilities;
//     // Main-page NWC chart: show only the top 5 Parent Divisions by absolute NWC.
//     // Keep the backend value in rawValue so the tooltip can show the exact AED amount.
//     const parentNwc = dashboard.investments
//         .filter((r) => r.parentDivision && r.parentDivision !== "—" && r.nwc !== null && r.nwc !== undefined && Number.isFinite(Number(r.nwc)))
//         .sort((a, b) => Math.abs(Number(b.nwc)) - Math.abs(Number(a.nwc)))
//         .slice(0, 5)
//         .map((r, index) => ({
//             name: r.parentDivision,
//             value: Number(r.nwc),
//             rawValue: Number(r.nwc),
//             fill: CHART_COLORS[index % CHART_COLORS.length],
//         }));
//     // Main Investments Analysis chart: show only the top 5 Parent Divisions by Total Investments.
//     // Keep the existing API data and chart configuration unchanged.
//     const investmentParent = dashboard.investments
//         .filter((r) => r.parentDivision && r.parentDivision !== "—" && r.totalInvestments !== null && r.totalInvestments !== undefined && Number.isFinite(Number(r.totalInvestments)))
//         .sort((a, b) => Number(b.totalInvestments) - Number(a.totalInvestments))
//         .slice(0, 5)
//         .map((r) => ({
//             name: r.parentDivision,
//             value: millions(r.totalInvestments),
//         }));
//     // Main Borrowing Position chart: show only the top 5 Parent Divisions by Total Borrowings.
//     // Keep the existing API data and chart configuration unchanged.
//     const borrowingParent = dashboard.borrowings
//         .filter(
//             (r) =>
//                 r.parentDivision &&
//                 r.parentDivision !== "—"
//         )
//         .map((r) => ({
//             ...r,
//             calculatedTotal:
//                 (r.longTerm ?? 0) +
//                 (r.shortTerm ?? 0) +
//                 (r.relatedParty ?? 0),
//         }))
//         .sort((a, b) => b.calculatedTotal - a.calculatedTotal)
//         .slice(0, 5)
//         .map((r) => ({
//             name: r.parentDivision,
//             longTerm: r.longTerm === null ? null : millions(r.longTerm),
//             relatedParty: r.relatedParty === null ? null : millions(r.relatedParty),
//             shortTerm: r.shortTerm === null ? null : millions(r.shortTerm),
//         }));
//     // Main Fixed Assets & Other Non-Current Assets chart: show only the top 5 Parent Divisions by Fixed Assets.
//     // Keep the existing API data and chart configuration unchanged.
//     const fixedAssetsTrend = dashboard.investments
//         .filter(
//             (r) =>
//                 r.parentDivision &&
//                 r.parentDivision !== "—" &&
//                 r.fixedAssets !== null &&
//                 r.fixedAssets !== undefined &&
//                 Number.isFinite(Number(r.fixedAssets))
//         )
//         .sort((a, b) => Number(b.fixedAssets) - Number(a.fixedAssets))
//         .slice(0, 5)
//         .map((r) => ({
//             period: r.parentDivision,
//             fixedAssets: millions(r.fixedAssets),
//             provision: r.provision === null ? null : millions(r.provision),
//         }));

//     // Month-on-Month NWC uses ONLY getFinancialPositionInvestmentsByParentDivision.
//     // Show the latest 5 months returned by that API and format numeric month values
//     // (1/01 -> Jan, 2/02 -> Feb, etc.) on both the X-axis and tooltip label.
//     const monthNameFromPeriod = (value) => {
//         const text = String(value ?? "").trim();
//         const match = text.match(/(?:^|[-\/\s])([0-9]{1,2})(?:$|[-\/\s])/);
//         const monthNumber = match ? Number(match[1]) : Number(text);
//         if (Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
//             return MONTH_KEYS[monthNumber - 1].key;
//         }
//         const lower = text.toLowerCase();
//         const named = MONTH_KEYS.find((m) => m.aliases.some((alias) => lower === alias || lower.startsWith(`${alias}-`) || lower.startsWith(`${alias} `) || lower.startsWith(`${alias}/`)));
//         return named ? named.key : text;
//     };

//     const monthSortValue = (value) => {
//         const text = String(value ?? "").trim();
//         const monthMatch = text.match(/(?:^|[-\/\s])([0-9]{1,2})(?:$|[-\/\s])/);
//         if (monthMatch) {
//             const month = Number(monthMatch[1]);
//             if (month >= 1 && month <= 12) return month;
//         }
//         const monthIndex = MONTH_KEYS.findIndex((m) => m.key.toLowerCase() === text.toLowerCase());
//         return monthIndex >= 0 ? monthIndex + 1 : 0;
//     };

//     const monthlyNwcRows = dashboard.investmentsMonthly
//         .filter((row) => row.nwc !== null && row.nwc !== undefined && row.parentDivision && row.parentDivision !== "—")
//         .map((row) => {
//             const periodKey = row.periodKey || row.period_code || row.period || row.periodMonth || "";
//             const rawPeriod = row.periodMonth || row.periodCode || row.period;
//             const monthLabel = monthNameFromPeriod(rawPeriod);
//             const monthSort = monthSortValue(rawPeriod);
//             const yearMatch = String(periodKey).match(/^(\\d{4})-(\\d{2})$/);

//             return {
//                 periodKey: String(periodKey),
//                 period: monthLabel,
//                 monthLabel,
//                 monthSort,
//                 year: yearMatch ? Number(yearMatch[1]) : 0,
//                 parentDivision: row.parentDivision,
//                 nwc: millions(row.nwc),
//             };
//         });

//     // Keep exactly the latest five monthly periods.
//     const latestFivePeriodKeys = Array.from(new Set(
//         monthlyNwcRows.map((row) => row.periodKey)
//     ))
//         .sort((a, b) => a.localeCompare(b))
//         .slice(-5);

//     const latestFiveMonthlyNwcRows = monthlyNwcRows.filter((row) => latestFivePeriodKeys.includes(row.periodKey));

//     // Keep exactly five Parent Divisions for the chart. The five divisions are
//     // selected from the latest available month by absolute NWC, then their
//     // values are plotted across all five months.
//     const latestNwcPeriodKey = latestFivePeriodKeys[latestFivePeriodKeys.length - 1];
//     const monthlyNwcDivisions = Array.from(
//         latestFiveMonthlyNwcRows
//             .filter((row) => row.periodKey === latestNwcPeriodKey)
//             .reduce((divisionMap, row) => {
//                 const current = divisionMap.get(row.parentDivision);
//                 const absValue = Math.abs(Number(row.nwc) || 0);
//                 if (!current || absValue > current.absValue) {
//                     divisionMap.set(row.parentDivision, {
//                         parentDivision: row.parentDivision,
//                         absValue,
//                     });
//                 }
//                 return divisionMap;
//             }, new Map())
//             .values()
//     )
//         .sort((a, b) => b.absValue - a.absValue)
//         .slice(0, 5)
//         .map((row) => row.parentDivision);

//     const monthlyNwc = Array.from(
//         latestFiveMonthlyNwcRows
//             .filter((row) => monthlyNwcDivisions.includes(row.parentDivision))
//             .reduce((periodMap, row) => {
//                 if (!periodMap.has(row.periodKey)) {
//                     periodMap.set(row.periodKey, {
//                         period: row.monthLabel,
//                         originalPeriod: row.periodKey,
//                         monthSort: row.monthSort,
//                     });
//                 }
//                 periodMap.get(row.periodKey)[row.parentDivision] = row.nwc;
//                 return periodMap;
//             }, new Map())
//             .values()
//     ).sort((a, b) => String(a.originalPeriod).localeCompare(String(b.originalPeriod)));

//     // Net Working Capital Trend uses only the dedicated backend trend endpoint.
//     // Do not calculate, aggregate, or derive the trend in the frontend.
//     const nwcTrend = dashboard.nwcTrend
//         .filter((row) => row.period && row.nwc !== null && row.nwc !== undefined)
//         .map((row) => ({
//             period: row.period,
//             nwc: millions(row.nwc),
//         }))
//         .sort((a, b) => String(a.period).localeCompare(String(b.period), undefined, { numeric: true }));

//     const equityData = equityRows(dashboard.equity || {
//         shareCapital: null, additionalCapital: null, reservesAndSurplus: null, partnerCurrentAccount: null, currentYearProfit: null,
//     });

//     const dashboardExportRows = [
//         ...dashboard.kpis.map((item) => [item.label, item.value === null ? "—" : item.ratio ? Number(item.value).toFixed(2) : `${formatM(item.value)} ${appliedFilters.reportingCurrency}`]),
//         ["", ""],
//         ["Current Assets", ""],
//         ...compositionAssets.map((r) => [r.item, `${r.amount.toFixed(1)} ${appliedFilters.reportingCurrency} M`]),
//         ["Total Current Assets", dashboard.composition.totalCurrentAssets === null ? "—" : `${formatM(dashboard.composition.totalCurrentAssets)} ${appliedFilters.reportingCurrency} M`],
//         ["", ""],
//         ["Current Liabilities", ""],
//         ...compositionLiabilities.map((r) => [r.item, `${r.amount.toFixed(1)} ${appliedFilters.reportingCurrency} M`]),
//         ["Total Current Liabilities", dashboard.composition.totalCurrentLiabilities === null ? "—" : `${formatM(dashboard.composition.totalCurrentLiabilities)} ${appliedFilters.reportingCurrency} M`],
//     ];

//     const exportDashboard = (format) => exportRows("Financial Position Overview", ["Financial Position Overview", "Value"], dashboardExportRows, format, "financial-position-overview.xls");

//     const sectionRows = (type) => {
//         if (type === "assets" || type === "liabilities") {
//             const source = modalData.currentViewAll || [];
//             const isAsset = type === "assets";
//             const cols = ["Parent Division", `${isAsset ? "Total Current Assets" : "Total Current Liabilities"} (${modalAppliedFilters.reportingCurrency} M)`];
//             const rows = source.map((r) => [
//                 r.parent_division_name ?? r.parent_division_code ?? "—",
//                 formatM(isAsset ? r.total_current_assets : r.total_current_liabilities),
//             ]);
//             return { title: isAsset ? "Current Assets — Detailed View" : "Current Liabilities — Detailed View", columns: cols, rows };
//         }
//         if (type === "equity") {
//             const source = modalData.equityViewAll || [];
//             return {
//                 title: "Equity Contribution — Detailed View",
//                 columns: ["Parent Division", "Share Capital", "Additional Capital", "Reserves & Surplus", "Partner Current Account", "Current Year Profit", "Equity Total"],
//                 rows: source.map((r) => [
//                     r.parentDivision ?? "—",
//                     r.shareCapital === null ? "—" : formatM(r.shareCapital),
//                     r.additionalCapital === null ? "—" : formatM(r.additionalCapital),
//                     r.reservesAndSurplus === null ? "—" : formatM(r.reservesAndSurplus),
//                     r.partnerCurrentAccount === null ? "—" : formatM(r.partnerCurrentAccount),
//                     r.currentYearProfit === null ? "—" : formatM(r.currentYearProfit),
//                     r.equityTotal === null ? "—" : formatM(r.equityTotal),
//                 ]),
//             };
//         }
//         if (type === "nwc" || type === "investments" || type === "fixedAssets") {
//             const source = modalData.investments || [];
//             if (type === "nwc") return { title: "Net Working Capital by Parent Division", columns: ["Parent Division", `NWC (${modalAppliedFilters.reportingCurrency} M)`], rows: source.map((r) => [r.parentDivision, r.nwc === null ? "—" : formatM(r.nwc)]) };
//             if (type === "fixedAssets") return { title: "Fixed Assets & Other Non-Current Assets — Detailed View", columns: ["Parent Division", `Fixed Assets & Other NCA (${modalAppliedFilters.reportingCurrency} M)`, `Provision for Gratuity (${modalAppliedFilters.reportingCurrency} M)`, `NWC (${modalAppliedFilters.reportingCurrency} M)`, `Total Investments (${modalAppliedFilters.reportingCurrency} M)`], rows: source.map((r) => [r.parentDivision, formatM(r.fixedAssets), formatM(r.provision), formatM(r.nwc), formatM(r.totalInvestments)]) };
//             return { title: "Investments Analysis — Detailed View", columns: ["Parent Division", `Fixed Assets & Other NCA (${modalAppliedFilters.reportingCurrency} M)`, `NWC (${modalAppliedFilters.reportingCurrency} M)`, `Provision for Gratuity (${modalAppliedFilters.reportingCurrency} M)`, `Total Investments (${modalAppliedFilters.reportingCurrency} M)`], rows: source.map((r) => [r.parentDivision, formatM(r.fixedAssets), formatM(r.nwc), formatM(r.provision), formatM(r.totalInvestments)]) };
//         }
//         if (type === "borrowing") {
//             const source = modalData.borrowings || [];
//             return { title: "Borrowing Position — Detailed View", columns: ["Parent Division", "Long-Term Bank", "Short-Term Bank", "Bank Borrowings Total", "Related Party Loan", "Total Borrowings"], rows: source.map((r) => [r.parentDivision, formatM(r.longTerm), formatM(r.shortTerm), formatM(r.bankTotal), r.relatedParty === null ? "—" : formatM(r.relatedParty), r.total === null ? "—" : formatM(r.total)]) };
//         }
//         return { title: "Financial Position", columns: [], rows: [] };
//     };

//     const exportSection = (type, format) => {
//         const config = sectionRows(type);
//         exportRows(config.title, config.columns, config.rows, format, `${type}-financial-position.xls`);
//     };

//     const modalTitle = {
//         assets: "Current Assets — Detailed View",
//         liabilities: "Current Liabilities — Detailed View",
//         nwc: "Net Working Capital — Month-on-Month",
//         equity: "Equity Contribution — Detailed View",
//         investments: "Investments Analysis — Detailed View",
//         borrowing: "Borrowing Position — Detailed View",
//         fixedAssets: "Fixed Assets & Other Non-Current Assets — Detailed View",
//     }[modal] || "";

//     const gridFourColumns = isSmall ? "1fr" : isMobile || isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))";
//     const logicItems = [
//         ["Total Investments", "Total Investments is displayed from the Financial Position service."],
//         ["NWC", "Net Working Capital is displayed from the Financial Position service."],
//         ["Bank Borrowings", "Bank Borrowings Total is displayed without frontend substitution."],
//         ["Related Party Loan", "A null service value is displayed as —."],
//     ];

//     return (
//         <div className="financial-position-page fp-sales-page" style={styles.page}>
//             <style>{`
//                 @keyframes financialPositionShimmer {
//                     0% { background-position: 200% 0; }
//                     100% { background-position: -200% 0; }
//                 }
//                 @keyframes fpPageIn {
//                     0% { opacity: 0; transform: translateY(4px); }
//                     100% { opacity: 1; transform: translateY(0); }
//                 }
//                 @keyframes fpKpiIn {
//                     0% { opacity: 0; transform: translateY(6px); }
//                     100% { opacity: 1; transform: translateY(0); }
//                 }
//                 .financial-position-page {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                     color: #1e293b !important;
//                     animation: fpPageIn .22s ease-out both;
//                 }
//                 .financial-position-page * {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                     box-sizing: border-box;
//                 }
//                 .financial-position-page .fp-page-header h1 {
//                     color: #1e1b4b !important;
//                     font-size: 1.45rem !important;
//                     font-weight: 800 !important;
//                     line-height: 1.2 !important;
//                     letter-spacing: -.02em;
//                 }
//                 .financial-position-page .fp-page-header p {
//                     color: #64748b !important;
//                     font-size: .74rem !important;
//                 }
//                 .financial-position-page .fp-filter-shell {
//                     background: #fff !important;
//                     border: 1px solid #e2e8f0 !important;
//                     border-radius: 12px !important;
//                     box-shadow: 0 2px 8px rgba(15,23,42,.035) !important;
//                 }
//                 .financial-position-page .fp-filter-shell select,
//                 .financial-position-page .fp-filter-shell input {
//                     font-size: .70rem !important;
//                     font-weight: 600 !important;
//                     border-radius: 7px !important;
//                 }
//                 .financial-position-page .fp-filter-shell select:focus,
//                 .financial-position-page .fp-filter-shell input:focus {
//                     border-color: #818cf8 !important;
//                     box-shadow: 0 0 0 3px rgba(99,102,241,.10) !important;
//                 }
//                 .financial-position-page .fp-sales-card {
//                     border-radius: 12px !important;
//                     border-color: #e2e8f0 !important;
//                     box-shadow: 0 2px 8px rgba(15,23,42,.035) !important;
//                     transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;
//                 }
//                 .financial-position-page .fp-sales-card:hover {
//                     transform: translateY(-2px);
//                     box-shadow: 0 8px 22px rgba(15,23,42,.08) !important;
//                     border-color: #d7dee8 !important;
//                 }
//                 .financial-position-page .fp-sales-kpis > div {
//                     animation: fpKpiIn .28s ease-out both;
//                 }
//                 .financial-position-page .fp-sales-kpis > div:nth-child(2) { animation-delay: .02s; }
//                 .financial-position-page .fp-sales-kpis > div:nth-child(3) { animation-delay: .04s; }
//                 .financial-position-page .fp-sales-kpis > div:nth-child(4) { animation-delay: .06s; }
//                 .financial-position-page .fp-sales-kpis > div:nth-child(5) { animation-delay: .08s; }
//                 .financial-position-page .fp-sales-kpis > div:nth-child(6) { animation-delay: .10s; }
//                 .financial-position-page .fp-sales-chart {
//                     transition: transform .18s ease, filter .18s ease;
//                 }
//                 .financial-position-page .fp-sales-chart:hover {
//                     filter: drop-shadow(0 5px 14px rgba(37,99,235,.05));
//                 }
//                 .financial-position-page table {
//                     font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
//                 }
//                 .financial-position-page table thead th {
//                     background: #f8fafc !important;
//                     color: #1e3a8a !important;
//                     font-weight: 700 !important;
//                 }
//                 .financial-position-page table tbody tr {
//                     transition: background .14s ease;
//                 }
//                 .financial-position-page table tbody tr:hover {
//                     background: #f8fafc !important;
//                 }
//                 .financial-position-page button {
//                     transition: transform .16s ease, box-shadow .16s ease, background .16s ease, border-color .16s ease;
//                 }
//                 .financial-position-page button:hover:not(:disabled) {
//                     transform: translateY(-1px);
//                 }
//                 .financial-position-page .fp-modern-tooltip {
//                     pointer-events: none;
//                 }
//                 .fp-viewall-table {
//                     border-collapse: separate !important;
//                     border-spacing: 0 !important;
//                     overflow: hidden;
//                     border: 1px solid #e2e8f0;
//                     border-radius: 10px;
//                 }
//                 .fp-viewall-table thead th {
//                     background: #f8fafc !important;
//                     color: #1e3a8a !important;
//                     border-bottom: 2px solid #e2e8f0 !important;
//                     font-size: .68rem !important;
//                     font-weight: 700 !important;
//                 }
//                 .fp-viewall-table tbody td {
//                     font-size: .70rem !important;
//                     color: #334155 !important;
//                     border-bottom: 1px solid #f1f5f9 !important;
//                 }
//                 .fp-viewall-table tbody tr:last-child td { border-bottom: 0 !important; }
//                 .fp-sales-modal-backdrop {
//                     background: rgba(15,23,42,.46) !important;
//                     backdrop-filter: blur(2px);
//                 }
//                 .fp-sales-modal {
//                     border-radius: 14px !important;
//                     box-shadow: 0 24px 70px rgba(15,23,42,.22) !important;
//                 }
//                 .fp-sales-modal .fp-modal-header {
//                     background: linear-gradient(90deg,#f8fafc,#fff) !important;
//                 }
//                 .fp-sales-modal .fp-modal-filter {
//                     background: #fff !important;
//                 }
//                 .fp-sales-modal .fp-modal-tabs {
//                     background: #fff !important;
//                 }
//                 .fp-sales-modal .fp-modal-tabs button {
//                     font-size: .64rem !important;
//                     font-weight: 700 !important;
//                     border-radius: 7px !important;
//                 }
//                 .fp-sales-modal .fp-modal-tabs button:hover {
//                     filter: brightness(.98);
//                 }
//                 .fp-sales-modal .fp-modal-content {
//                     scrollbar-width: thin;
//                     scrollbar-color: #64748b #e2e8f0;
//                 }
//                 .fp-sales-modal .fp-modal-content::-webkit-scrollbar { width: 10px; height: 10px; }
//                 .fp-sales-modal .fp-modal-content::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 6px; }
//                 .fp-sales-modal .fp-modal-content::-webkit-scrollbar-thumb { background: #64748b; border-radius: 6px; border: 2px solid #e2e8f0; }
//                 .financial-position-page .fp-footer {
//                     font-size: .65rem;
//                     color: #64748b;
//                     display: flex;
//                     justify-content: space-between;
//                     padding-top: 10px;
//                     padding-bottom: 4px;
//                     flex-wrap: wrap;
//                     gap: 4px;
//                 }
//                 @media (max-width: 760px) {
//                     .financial-position-page .fp-footer { flex-direction: column; }
//                 }
//             `}</style>
//             <div style={{ width: "100%", minWidth: 0 }}>
//                 <motion.header className="fp-page-header" style={{ ...styles.pageHeader, marginBottom: 10, flexDirection: isMobile ? "column" : "row" }} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
//                     <div style={styles.heading}>
//                         <h1 style={styles.title}><span style={{ fontSize: "1.3rem" }}>💸</span> Financial Position Overview</h1>
//                         <p style={styles.subtitle}>
//                             Key indicators of liquidity, working capital, assets, liabilities, financing position and equity contribution.
//                             <br />
//                             <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, display: "inline-block", marginTop: 4, fontWeight: 600 }}>
//                                 As On Date: {formatAsOnDate(appliedFilters.asOnDate)}
//                             </span>
//                             &nbsp;|&nbsp;
//                             <span style={{ color: "#16a34a", fontWeight: 700 }}>Currency: {appliedFilters.reportingCurrency}</span>
//                         </p>
//                     </div>
//                     <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
//                         <button type="button" onClick={() => exportDashboard("excel")} style={headerBtn("#ecfdf5", "#15803d", "#bbf7d0")}>📊&nbsp; Excel</button>
//                         <button type="button" onClick={() => exportDashboard("pdf")} style={headerBtn("#fef2f2", "#dc2626", "#fecaca")}>📄&nbsp; PDF</button>
//                     </div>
//                 </motion.header>

//                 <motion.div className="fp-filter-shell" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
//                     <FilterPanel state={filters} onChange={setFilters} onApply={handleApply} onReset={handleReset} filterOptions={filterOptions} />
//                 </motion.div>

//                 {error && <div style={{ ...styles.card, marginBottom: 10, borderColor: "#fecaca", color: "#b91c1c", background: "#fff7f7", fontSize: ".72rem", fontWeight: 600 }}>{error}</div>}

//                 <div className="fp-sales-kpis" style={{ ...styles.kpiGrid, gridTemplateColumns: isSmall ? "1fr" : isMobile ? "repeat(2, minmax(0,1fr))" : isMedium ? "repeat(3,minmax(0,1fr))" : "repeat(6,minmax(0,1fr))" }}>
//                     {dashboard.kpis.map((item) => <KpiCard key={item.key} item={item} loading={loading} currency={appliedFilters.reportingCurrency} />)}
//                     {!loading && dashboard.kpis.length === 0 && <div style={{ gridColumn: "1/-1", padding: 20, textAlign: "center", color: COLORS.muted, fontSize: ".72rem" }}>No KPI data available.</div>}
//                 </div>

//                 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 9, marginBottom: 9 }}>
//                     <TableCard title="Current Assets" subtitle={`As at ${formatAsOnDate(appliedFilters.asOnDate)}`} rows={compositionAssets} totalLabel="Total Current Assets" totalValue={millions(dashboard.composition.totalCurrentAssets)} onViewAll={() => openTable("assets")} onExportExcel={() => exportSection("assets", "excel")} onExportPdf={() => exportSection("assets", "pdf")} currency={appliedFilters.reportingCurrency} />
//                     <TableCard title="Current Liabilities" subtitle={`As at ${formatAsOnDate(appliedFilters.asOnDate)}`} rows={compositionLiabilities} totalLabel="Total Current Liabilities" totalValue={millions(dashboard.composition.totalCurrentLiabilities)} onViewAll={() => openTable("liabilities")} onExportExcel={() => exportSection("liabilities", "excel")} onExportPdf={() => exportSection("liabilities", "pdf")} currency={appliedFilters.reportingCurrency} />

//                     <motion.section className="fp-sales-card" style={{ ...styles.card, display: "flex", flexDirection: "column" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ boxShadow: shadowHover }}>
//                         <CardHeader title="Net Working Capital by Parent Division" subtitle={`As at ${formatAsOnDate(appliedFilters.asOnDate)}`} onViewAll={() => openTable("nwc")} onExportExcel={() => exportSection("nwc", "excel")} onExportPdf={() => exportSection("nwc", "pdf")} />
//                         <div className="fp-sales-chart" style={{ ...styles.chart, minHeight: 220 }}>
//                             {loading ? <Skeleton height={220} /> : <ResponsiveContainer width="100%" height={220}>
//                                 <BarChart data={parentNwc} layout="vertical" margin={{ top: 6, right: 36, left: 8, bottom: 6 }} barCategoryGap="22%">
//                                     <CartesianGrid horizontal={false} stroke="#eef2f7" />
//                                     <XAxis type="number" tick={{ fontSize: 8, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={formatNwcAxisValue} />
//                                     <YAxis type="category" dataKey="name" width={118} tick={<NwcBarYAxisTick />} axisLine={false} tickLine={false} interval={0} />
//                                     <Tooltip
//                                         cursor={{ fill: "rgba(99,102,241,.045)" }}
//                                         content={({ active, payload, label }) => {
//                                             if (!active || !payload?.length) return null;
//                                             const row = payload[0]?.payload;
//                                             const rawValue = row?.rawValue;
//                                             return (
//                                                 <div className="fp-modern-tooltip" style={{ minWidth: 200, padding: "10px 12px", border: "1px solid rgba(226,232,240,.96)", borderRadius: 11, background: "rgba(255,255,255,.96)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 14px 34px rgba(15,23,42,.15), 0 3px 10px rgba(15,23,42,.06)", fontFamily: font }}>
//                                                     <div style={{ marginBottom: 6, color: COLORS.text, fontSize: ".66rem", fontWeight: 800, lineHeight: 1.3 }}>{label}</div>
//                                                     <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: COLORS.muted, fontSize: ".62rem", fontWeight: 600 }}>
//                                                         <span>Net Working Capital</span>
//                                                         <strong style={{ color: rawValue < 0 ? "#dc2626" : COLORS.text, fontWeight: 800 }}>{rawValue === null || rawValue === undefined ? "—" : `${Number(rawValue).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${appliedFilters.reportingCurrency}`}</strong>
//                                                     </div>
//                                                     <div style={{ marginTop: 3, textAlign: "right", color: COLORS.muted, fontSize: ".58rem" }}>
//                                                         {rawValue === null || rawValue === undefined ? "—" : `${millions(rawValue).toFixed(2)} ${appliedFilters.reportingCurrency} M`}
//                                                     </div>
//                                                 </div>
//                                             );
//                                         }}
//                                     />
//                                     <Bar isAnimationActive={true} animationDuration={650} dataKey="value" name={`Net Working Capital (${appliedFilters.reportingCurrency})`} radius={[0, 5, 5, 0]} barSize={18} background={{ fill: "#f1f5f9", radius: 5 }}>
//                                         {parentNwc.map((entry, index) => <Cell key={`nwc-${index}`} fill={entry.fill} />)}
//                                     </Bar>
//                                 </BarChart>
//                             </ResponsiveContainer>}
//                         </div>
//                     </motion.section>

//                     <motion.section className="fp-sales-card" style={{ ...styles.card, display: "flex", flexDirection: "column" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ boxShadow: shadowHover }}>
//                         <CardHeader title="Equity Contribution" subtitle="Equity components" onViewAll={() => openTable("equity")} onExportExcel={() => exportSection("equity", "excel")} onExportPdf={() => exportSection("equity", "pdf")} />
//                         <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 142, justifyContent: "center" }}>
//                             {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={20} width={`${70 - i * 8}%`} />) : equityData.map((row, index) => {
//                                 const max = Math.max(...equityData.map((entry) => entry.value === null ? 0 : entry.value), 0);
//                                 return <div style={styles.equityRow} key={row.name}><span style={styles.equityLabel}>{row.name}</span><div style={styles.equityTrack}><motion.div initial={{ width: 0 }} animate={{ width: max && row.value !== null ? `${(row.value / max) * 100}%` : "0%" }} transition={{ duration: .55, delay: index * .05 }} style={{ height: "100%", borderRadius: 99, background: CHART_COLORS[index % CHART_COLORS.length] }} /></div><strong style={{ color: "#334155", fontSize: ".59rem", fontWeight: 800, textAlign: "right" }}>{row.value === null ? "—" : row.value.toFixed(1)}</strong></div>;
//                             })}
//                         </div>
//                         <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, marginTop: 3, borderTop: `1px solid ${COLORS.border}`, color: COLORS.subtle, fontSize: ".53rem", fontWeight: 600 }}><span>0</span><span>20</span><span>40</span><span>60</span></div>
//                     </motion.section>
//                 </div>

//                 <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1.2fr .85fr", gap: 9, marginBottom: 9 }}>
//                     <motion.section className="fp-sales-card" style={{ ...styles.card, minWidth: 0 }} whileHover={{ boxShadow: shadowHover }}>
//                         <CardHeader title="Month on Month Net Working Capital" subtitle="Monthly NWC series" onViewAll={() => openTable("nwc")} onExportExcel={() => exportSection("nwc", "excel")} onExportPdf={() => exportSection("nwc", "pdf")} />
//                         <div className="fp-sales-chart" style={{ height: 188 }}>{loading ? <Skeleton height={188} /> : <ResponsiveContainer width="100%" height={188}><ComposedChart data={monthlyNwc} margin={{ top: 10, right: 4, left: -18, bottom: 2 }}><CartesianGrid vertical={false} stroke="#eef2f7" /><XAxis dataKey="period" tick={{ fontSize: 8, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} angle={-28} textAnchor="end" height={44} /><YAxis yAxisId="left" tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><YAxis yAxisId="right" orientation="right" tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "rgba(37,99,235,.045)" }} content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 9, color: "#64748b" }} />{monthlyNwcDivisions.map((division, index) => (
//                             <Bar
//                                 isAnimationActive={true}
//                                 animationBegin={index * 70}
//                                 animationDuration={650}
//                                 key={division}
//                                 yAxisId="left"
//                                 dataKey={division}
//                                 name={division}
//                                 fill={CHART_COLORS[index % CHART_COLORS.length]}
//                                 radius={[3, 3, 0, 0]}
//                                 activeBar={{ stroke: "#173b8f", strokeWidth: 1.2, fillOpacity: 0.88 }}
//                                 barSize={monthlyNwcDivisions.length > 4 ? 10 : 17}
//                             />
//                         ))}</ComposedChart></ResponsiveContainer>}</div>
//                     </motion.section>

//                     <motion.section className="fp-sales-card" style={{ ...styles.card, minWidth: 0 }} whileHover={{ boxShadow: shadowHover }}>
//                         <CardHeader title="Net Working Capital Trend" subtitle="Monthly NWC series" onViewAll={() => openTable("nwc")} onExportExcel={() => exportSection("nwc", "excel")} onExportPdf={() => exportSection("nwc", "pdf")} />
//                         <div className="fp-sales-chart" style={{ height: 188 }}>{loading ? <Skeleton height={188} /> : <ResponsiveContainer width="100%" height={188}><LineChart data={nwcTrend} margin={{ top: 10, right: 4, left: -18, bottom: 2 }}><CartesianGrid vertical={false} stroke="#eef2f7" /><XAxis dataKey="period" tick={{ fontSize: 8, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} angle={-28} textAnchor="end" height={44} /><YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><Tooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 9, color: "#64748b" }} /><Line isAnimationActive={true} animationDuration={700} activeDot={{ r: 4 }} type="monotone" dataKey="nwc" name={`Net Working Capital (${appliedFilters.reportingCurrency} M)`} stroke="#16a34a" strokeWidth={2.2} dot={{ r: 2.2 }} /></LineChart></ResponsiveContainer>}</div>
//                     </motion.section>

//                     <motion.section className="fp-sales-card" style={{ ...styles.card, minWidth: 0 }} whileHover={{ boxShadow: shadowHover }}>
//                         <CardHeader title="Investment & Borrowing Logic" subtitle="Financial Position calculation notes" onViewAll={() => { }} onExportExcel={() => exportRows("Financial Position Rules", ["Rule", "Description"], logicItems, "excel", "financial-position-rules.xls")} onExportPdf={() => exportRows("Financial Position Rules", ["Rule", "Description"], logicItems, "pdf")} />
//                         <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{logicItems.map((item, index) => <div key={item[0]} style={styles.logicItem}><div style={{ width: 28, height: 28, borderRadius: "50%", background: CHART_COLORS[index % CHART_COLORS.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".72rem", fontWeight: 800 }}>{index + 1}</div><div style={{ minWidth: 0 }}><div style={styles.logicTitle}>{item[0]}</div><div style={styles.logicText}>{item[1]}</div></div></div>)}</div>
//                     </motion.section>
//                 </div>

//                 <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,minmax(0,1fr))", gap: 9, marginBottom: 9 }}>
//                     <motion.section className="fp-sales-card" style={{ ...styles.card, minWidth: 0 }} whileHover={{ boxShadow: shadowHover }}>
//                         <CardHeader title="Investments Analysis" subtitle="Total investment value by parent division" onViewAll={() => openTable("investments")} onExportExcel={() => exportSection("investments", "excel")} onExportPdf={() => exportSection("investments", "pdf")} />
//                         <div className="fp-sales-chart" style={{ height: 188 }}>{loading ? <Skeleton height={188} /> : <ResponsiveContainer width="100%" height={188}><BarChart data={investmentParent} layout="vertical" margin={{ top: 6, right: 12, left: 18, bottom: 4 }}><CartesianGrid horizontal={false} stroke="#eef2f7" /><XAxis type="number" tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={68} tick={{ fontSize: 8, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "rgba(37,99,235,.045)" }} content={<ChartTooltip />} /><Bar isAnimationActive={true} animationDuration={700} dataKey="value" name={`Total Investments (${appliedFilters.reportingCurrency} M)`} fill="#2563eb" radius={[0, 4, 4, 0]} activeBar={{ stroke: "#173b8f", strokeWidth: 1.2, fillOpacity: 0.88 }} barSize={20} /></BarChart></ResponsiveContainer>}</div>
//                     </motion.section>

//                     <motion.section className="fp-sales-card" style={{ ...styles.card, minWidth: 0 }} whileHover={{ boxShadow: shadowHover }}>
//                         <CardHeader title="Borrowing Position" subtitle="Related Party Loan" onViewAll={() => openTable("borrowing")} onExportExcel={() => exportSection("borrowing", "excel")} onExportPdf={() => exportSection("borrowing", "pdf")} />
//                         <div className="fp-sales-chart" style={{ height: 188 }}>{loading ? <Skeleton height={188} /> : <ResponsiveContainer width="100%" height={188}><BarChart data={borrowingParent} margin={{ top: 8, right: 4, left: -14, bottom: 42 }}><CartesianGrid vertical={false} stroke="#eef2f7" /><XAxis dataKey="name" tick={<BorrowingBarXAxisTick />} axisLine={false} tickLine={false} interval={0} height={58} /><YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "rgba(37,99,235,.045)" }} content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 8, color: "#64748b" }} /><Bar isAnimationActive={true} animationDuration={650} dataKey="longTerm" name="Long-Term Bank Loan" fill="#2563eb" radius={[3, 3, 0, 0]} activeBar={{ stroke: "#173b8f", strokeWidth: 1.1, fillOpacity: 0.88 }} barSize={10} /><Bar isAnimationActive={true} animationBegin={80} animationDuration={650} dataKey="relatedParty" name="Related Party Loan" fill="#7c3aed" radius={[3, 3, 0, 0]} activeBar={{ stroke: "#5b21b6", strokeWidth: 1.1, fillOpacity: 0.88 }} barSize={10} /><Bar isAnimationActive={true} animationBegin={160} animationDuration={650} dataKey="shortTerm" name="Short-Term Bank Borrowing" fill="#f59e0b" radius={[3, 3, 0, 0]} activeBar={{ stroke: "#b45309", strokeWidth: 1.1, fillOpacity: 0.88 }} barSize={10} /></BarChart></ResponsiveContainer>}</div>
//                     </motion.section>

//                     <motion.section className="fp-sales-card" style={{ ...styles.card, minWidth: 0 }} whileHover={{ boxShadow: shadowHover }}>
//                         <CardHeader title="Fixed Assets & Other Non-Current Assets" subtitle="By Parent Division" onViewAll={() => openTable("fixedAssets")} onExportExcel={() => exportSection("fixedAssets", "excel")} onExportPdf={() => exportSection("fixedAssets", "pdf")} />
//                         <div className="fp-sales-chart" style={{ height: 188 }}>{loading ? <Skeleton height={188} /> : <ResponsiveContainer width="100%" height={188}><ComposedChart data={fixedAssetsTrend} margin={{ top: 8, right: 4, left: -16, bottom: 42 }}><CartesianGrid vertical={false} stroke="#eef2f7" /><XAxis dataKey="period" tick={<FixedAssetsBarXAxisTick />} axisLine={false} tickLine={false} interval={0} height={58} /><YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "rgba(37,99,235,.045)" }} content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 8, color: "#64748b" }} /><Bar isAnimationActive={true} animationDuration={700} dataKey="fixedAssets" name={`Fixed Assets & Other NCA (${appliedFilters.reportingCurrency} M)`} fill="#2563eb" radius={[3, 3, 0, 0]} activeBar={{ stroke: "#173b8f", strokeWidth: 1.2, fillOpacity: 0.88 }} barSize={15} /><Line isAnimationActive={true} animationBegin={180} animationDuration={800} activeDot={{ r: 5, strokeWidth: 2, stroke: "#5b21b6", fill: "#ffffff" }} type="monotone" dataKey="provision" name={`Provision for Gratuity (${appliedFilters.reportingCurrency} M)`} stroke="#7c3aed" strokeWidth={2.2} dot={{ r: 2.4, strokeWidth: 1.5 }} /></ComposedChart></ResponsiveContainer>}</div>
//                     </motion.section>
//                 </div>
//             </div>

//             <div className="fp-footer">
//                 <span>
//                     All values are in <strong>{appliedFilters.reportingCurrency}</strong>&nbsp;|&nbsp;
//                     As On Date: {formatAsOnDate(appliedFilters.asOnDate)}&nbsp;|&nbsp;
//                     <span style={{ color: "#16a34a", fontWeight: 700 }}>● Live</span>
//                 </span>
//                 <span>☁️ Source: Oracle Fusion Cloud</span>
//             </div>

//             <Modal open={Boolean(modal)} title={modalTitle} type={modal} filters={modalFilters}
//                 detail={{ equity: modalData.equity, equityViewAll: modalData.equityViewAll, investments: modalData.investments, borrowings: modalData.borrowings, currentComposition: modalData.currentComposition, currentViewAll: modalData.currentViewAll }}
//                 monthly={{ investments: modalData.investmentsMonthly, equity: modalData.equityMonthly, borrowings: modalData.borrowingsMonthly }}
//                 loading={modalLoading} onClose={() => setModal(null)} onFiltersChange={setModalFilters} onApplyFilters={applyModalFilters} onResetFilters={resetModalFilters} onTabChange={loadModalTab} currency={modalFilters.reportingCurrency} filterOptions={filterOptions} />
//         </div>
//     );
// }




import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
} from "recharts";

/**
 * FinancialPositionOverview.jsx
 *
 * Financial Position page with API-driven financial data and inline styles.
 * No external CSS file is required.
 *
 * Required dependencies:
 *   npm install framer-motion recharts
 *
 * Optional theme import:
 *   Replace the fallback colors below with your own theme.js values
 *   if required by your project.
 */

const COLORS = {
    page: "#f8fafc",
    surface: "#ffffff",
    text: "#0f172a",
    heading: "#1e293b",
    muted: "#64748b",
    subtle: "#94a3b8",
    border: "#e2e8f0",
    borderSoft: "#eef2f7",
    primary: "#4f46e5",
    primaryBlue: "#2563eb",
    focus: "#818cf8",
    green: "#10b981",
    greenDark: "#16a34a",
    red: "#ef4444",
    purple: "#7c3aed",
    amber: "#f59e0b",
    teal: "#14b8a6",
    lightBlue: "#eef6ff",
};

const CHART_COLORS = [
    "#2563eb",
    "#4f46e5",
    "#14b8a6",
    "#f59e0b",
    "#7c3aed",
    "#ef4444",
];

const shadow = "0 4px 24px rgba(15,23,42,.035), 0 1px 3px rgba(15,23,42,.035)";
const shadowHover = "0 8px 26px rgba(15,23,42,.08)";
const font = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const CHART_TICK = { fontSize: 9, fill: "#64748b", fontWeight: 600 };
const CHART_AXIS = { fontSize: 9, fill: "#94a3b8", fontWeight: 600 };
const CHART_LEGEND = { fontSize: 9, color: "#64748b" };

import {
    getFinancialPositionKpis,
    getFinancialPositionEquityContribution,
    getFinancialPositionEquityViewAll,
    getFinancialPositionEquityMonthlyByParentDivision,
    getFinancialPositionInvestmentsByParentDivision,
    getFinancialPositionInvestmentsMonthlyByParentDivision,
    getFinancialPositionBorrowingsByParentDivision,
    getFinancialPositionBorrowingsMonthlyByParentDivision,
    getFinancialPositionNetWorkingCapitalTrend,
    getFinancialPositionCurrentAssetsLiabilitiesComposition,
    getFinancialPositionCurrentAssetsLiabilitiesViewAll,
} from "../api/financialPositionApi";

import {
    getWorkingCapitalFilterOptions,
} from "../api/workingCapital";

const styles = {
    page: { padding: '20px 0 32px', background: '#f8fafc', minHeight: '100%', color: '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', boxSizing: 'border-box' },
    pageHeader: { marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 },
    headerControls: { display: 'flex', gap: 4, alignItems: 'center' },
    select: { appearance: 'none', padding: '6px 28px 6px 10px', fontSize: '0.78rem', fontWeight: 500, color: '#334155', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 7, cursor: 'pointer', outline: 'none' },
    kpiGrid: { marginBottom: 16, display: 'grid', gap: 10, width: '100%' },
    heading: { minWidth: 0 },
    title: { fontSize: '1.45rem', fontWeight: 800, color: '#1e1b4b', margin: 0, display: 'flex', alignItems: 'center', gap: 4 },
    subtitle: { fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0', lineHeight: 1.45 },
    updated: { color: '#94a3b8', fontSize: '.62rem', fontWeight: 500 },
    card: { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,.04)', padding: '12px 14px', minWidth: 0 },
    kpiCard: { background: '#fff', borderRadius: 12, padding: '10px 10px', boxShadow: 'none', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center', gap: 8, overflow: 'visible', position: 'relative', minHeight: 74 },
    kpiTop: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 },
    kpiLabel: { fontSize: '0.68rem', color: '#1e3a8a', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
    kpiValue: { color: '#0f172a', fontSize: '1.02rem', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.025em', marginTop: 5 },
    kpiTrend: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, color: '#16a34a', fontSize: '.6rem', fontWeight: 700 },
    cardHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
    cardTitle: { color: '#1e1b4b', fontSize: '.82rem', lineHeight: 1.25, fontWeight: 800 },
    cardSubtitle: { color: '#64748b', marginTop: 2, fontSize: '.68rem', lineHeight: 1.35, fontWeight: 500 },
    viewAll: { border: 0, background: 'transparent', color: '#4f81bd', padding: '2px 3px', font: '700 .62rem Inter, system-ui, sans-serif', textDecoration: 'underline', cursor: 'pointer' },
    tableWrap: { width: '100%', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    th: { padding: '9px 10px', fontSize: '0.70rem', fontWeight: 700, color: '#1e3a8a', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', whiteSpace: 'normal', lineHeight: 1.18, verticalAlign: 'middle', overflowWrap: 'break-word' },
    td: { padding: '8px 10px', fontSize: '0.72rem', color: '#334155', borderBottom: '1px solid #f1f5f9', whiteSpace: 'normal', lineHeight: 1.25, overflowWrap: 'break-word', verticalAlign: 'middle' },
    totalTd: { padding: '8px 10px', fontSize: '0.72rem', fontWeight: 800, color: '#1e3a8a', background: '#f8fafc', borderTop: '2px solid #e2e8f0', whiteSpace: 'normal', lineHeight: 1.2 },
    tabs: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', margin: '2px 0 9px', borderRadius: 7, overflow: 'hidden' },
    tab: { minWidth: 0, height: 29, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', font: '700 .56rem Inter, system-ui, sans-serif', cursor: 'pointer' },
    equityRow: { display: 'grid', gridTemplateColumns: '108px minmax(0,1fr) 42px', gap: 7, alignItems: 'center' },
    equityLabel: { overflow: 'hidden', color: '#64748b', fontSize: '.68rem', fontWeight: 700, lineHeight: 1.15, whiteSpace: 'normal', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, textOverflow: 'ellipsis' },
    equityTrack: { height: 12, borderRadius: 99, background: '#eef2f7', overflow: 'hidden' },
    logicItem: { display: 'grid', gridTemplateColumns: '30px minmax(0,1fr)', gap: 8, alignItems: 'start', padding: 7, border: '1px solid #e7edf5', borderRadius: 7, background: '#fff' },
    logicTitle: { color: '#334155', fontSize: '.70rem', fontWeight: 800, lineHeight: 1.25 },
    logicText: { color: '#64748b', marginTop: 2, fontSize: '.64rem', lineHeight: 1.3, fontWeight: 500 },
    chart: { width: '100%', minWidth: 0 },
    skeleton: { display: 'block', width: '100%', background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)', backgroundSize: '200% 100%', borderRadius: 6, animation: 'shimmer 1.4s infinite' },
    modalBackdrop: { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,.42)', display: 'flex', alignItems: 'stretch', justifyContent: 'center', padding: 10 },
    modal: { width: 'min(1440px, 100%)', height: 'calc(100vh - 20px)', maxHeight: 'calc(100vh - 20px)', overflow: 'hidden', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 24px 70px rgba(15,23,42,.22)', display: 'flex', flexDirection: 'column' },
};

function normalizeFilterOptions(options = []) {
    return (options || []).map((o) => {
        if (o == null) return { id: "", name: "" };
        if (typeof o === "string" || typeof o === "number") return { id: String(o), name: String(o) };
        const id = o.value !== undefined ? o.value : (o.id !== undefined ? o.id : "");
        const name = o.label !== undefined ? o.label : (o.name !== undefined ? o.name : String(id));
        return { id: String(id), name: typeof name === "object" ? String(name?.label || name?.name || id) : String(name) };
    });
}

const dateStyle = {
    padding: "6px 10px",
    fontSize: "0.78rem",
    fontWeight: 500,
    color: "#334155",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 7,
    cursor: "pointer",
    outline: "none",
    width: "100%",
    height: 34,
    boxSizing: "border-box",
};

const formatAsOnDate = (value) => {
    if (!value) return "—";
    const [year, month, day] = String(value).split("-");
    if (!year || !month || !day) return value;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime())
        ? value
        : `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${String(year)}`;
};

const selStyle = {
    appearance: "none",
    padding: "6px 28px 6px 10px",
    fontSize: "0.78rem",
    fontWeight: 500,
    color: "#334155",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 7,
    cursor: "pointer",
    outline: "none",
    width: "100%",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    maxWidth: 180,
};

function FilterField({ label, children }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 85, flex: "0 0 auto" }}>
        <span style={{ fontSize: "0.66rem", color: "#1e3a8a", fontWeight: 700, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{label}</span>
        {children}
    </div>;
}

function headerBtn(bg, color, border) {
    return { padding: "7px 14px", background: bg, color, border: border ? `1px solid ${border}` : "none", borderRadius: 8, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.18s" };
}

function MultiSelect({ options = [], value = [], onChange, placeholder = "All", style }) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const ref = useRef(null);
    const searchRef = useRef(null);
    const normOptions = normalizeFilterOptions(options);
    const selected = Array.isArray(value) ? value.map(String) : [];
    const realIds = normOptions.map((o) => String(o.id)).filter((id) => id !== "All");
    const explicitlyAll = selected.includes("All");
    const displayAll = selected.length === 0 || explicitlyAll;
    const q = searchQuery.trim().toLowerCase();
    const visibleOptions = q
        ? normOptions.filter((o) => String(o.id) !== "All" && String(o.name || "").toLowerCase().includes(q))
        : normOptions.filter((o) => String(o.id) !== "All");

    useEffect(() => {
        const handleOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
                setSearchQuery("");
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 0);
        if (!open) setSearchQuery("");
    }, [open]);

    const toggle = (id) => {
        const target = String(id);
        const current = selected.filter((v) => v !== "All");
        const next = current.includes(target) ? current.filter((v) => v !== target) : [...current, target];
        onChange(next.length === realIds.length && realIds.length > 0 ? ["All"] : next);
    };

    const label = displayAll
        ? placeholder
        : selected.length === 1
            ? (normOptions.find((o) => String(o.id) === selected[0])?.name || "1 selected")
            : `${selected.length} selected`;

    return (
        <div ref={ref} style={{ position: "relative", ...style }}>
            <button type="button" onClick={() => setOpen((v) => !v)}
                style={{ ...selStyle, width: "100%", maxWidth: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, textAlign: "left", height: 34, paddingRight: 9 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{label}</span>
                <span style={{ color: "#94a3b8", fontSize: ".58rem", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
            </button>
            {open && (
                <div style={{ position: "absolute", top: "calc(100% + 3px)", left: 0, minWidth: Math.max(style?.width || 160, 240), background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,.12)", zIndex: 1500, overflow: "hidden" }}>
                    <div style={{ padding: 7, borderBottom: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 8px" }}>
                            <span style={{ fontSize: ".68rem", color: "#94a3b8" }}>⌕</span>
                            <input ref={searchRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Search…" style={{ border: 0, outline: 0, background: "transparent", width: "100%", minWidth: 0, color: "#334155", font: `500 .72rem ${font}` }} />
                            {searchQuery && <button type="button" onClick={() => setSearchQuery("")} style={{ border: 0, background: "transparent", color: "#94a3b8", cursor: "pointer" }}>×</button>}
                        </div>
                    </div>
                    {!q && (
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <button type="button" onClick={() => onChange(["All"])} style={{ border: 0, background: "transparent", padding: 0, color: "#2563eb", font: `700 .70rem ${font}`, cursor: "pointer" }}>Select All</button>
                            <button type="button" onClick={() => onChange([])} style={{ border: 0, background: "transparent", padding: 0, color: "#ef4444", font: `700 .70rem ${font}`, cursor: "pointer" }}>Clear</button>
                        </div>
                    )}
                    <div style={{ maxHeight: 220, overflowY: "auto" }}>
                        {visibleOptions.map((opt) => {
                            const isSelected = explicitlyAll || selected.includes(String(opt.id));
                            return (
                                <button type="button" key={opt.id} onClick={() => toggle(opt.id)}
                                    style={{ width: "100%", border: 0, borderBottom: "1px solid #f8fafc", background: isSelected ? "#eff6ff" : "#fff", color: isSelected ? "#2563eb" : "#334155", display: "flex", alignItems: "flex-start", gap: 7, padding: "8px 10px", textAlign: "left", cursor: "pointer", font: `500 .72rem ${font}`, lineHeight: 1.25 }}>
                                    <span style={{ width: 14, height: 14, marginTop: 1, border: `1.5px solid ${isSelected ? "#2563eb" : "#cbd5e1"}`, borderRadius: 3, background: isSelected ? "#2563eb" : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        {isSelected && <span style={{ color: "#fff", fontSize: ".58rem", lineHeight: 1 }}>✓</span>}
                                    </span>
                                    <span style={{ whiteSpace: "normal", overflowWrap: "anywhere" }}>{opt.name}</span>
                                </button>
                            );
                        })}
                        {q && visibleOptions.length === 0 && <div style={{ padding: 12, color: "#94a3b8", font: `500 .72rem ${font}`, textAlign: "center" }}>No results for “{searchQuery}”</div>}
                    </div>
                </div>
            )}
        </div>
    );
}

function useResponsiveColumns() {
    const [width, setWidth] = useState(typeof window === "undefined" ? 1440 : window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return { isMobile: width <= 768, isSmall: width <= 480, isTablet: width > 768 && width <= 1280, isMedium: width > 768 && width <= 1100 };
}

function CountUp({ value, decimals = 1, duration = 700 }) {
    const numeric = Number(value);
    const safe = Number.isFinite(numeric) ? numeric : 0;
    const [display, setDisplay] = useState(safe);
    useEffect(() => {
        let startTime;
        let frameId;
        const tick = (time) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(safe * eased);
            if (progress < 1) frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [safe, duration]);
    return <>{display.toFixed(decimals)}</>;
}

function Skeleton({ height = 16, width = "100%", radius = 6 }) {
    return <div style={{ ...styles.skeleton, height, width, borderRadius: radius, animation: "financialPositionShimmer 1.4s infinite" }} aria-hidden="true" />;
}

function KpiCard({ item, loading, currency }) {
    const [hover, setHover] = useState(false);
    const isPending = item.value === null || item.value === undefined || !Number.isFinite(Number(item.value));
    return (
        <motion.div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ ...styles.kpiCard, background: item.cardBg || "#fff", boxShadow: hover ? `0 8px 24px ${item.accent || "#2563eb"}20` : "none", transform: hover ? "translateY(-2px)" : "none" }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: item.iconBg || "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem", flexShrink: 0, color: item.accent || "#2563eb" }}>{item.icon}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={styles.kpiLabel}>{item.label}</div>
                {loading ? <div style={{ marginTop: 7 }}><Skeleton height={18} width="70%" /></div> : (
                    <>
                        <div style={styles.kpiValue}>
                            {isPending ? "—" : item.ratio ? <><CountUp value={item.value} decimals={item.decimals ?? 2} />{item.suffix || ""}</> : <><span style={{ fontSize: "1rem", marginRight: 2 }}>{currency}</span><CountUp value={Number(item.value) / 1000000} decimals={1} />{item.unit || "M"}</>}
                        </div>
                        {item.trend !== undefined && item.trend !== null ? (
                            <div style={styles.kpiTrend}><span>{Number(item.trend) >= 0 ? "▲" : "▼"} {Math.abs(Number(item.trend)).toFixed(1)}%</span><small style={{ color: "#94a3b8", fontSize: ".55rem", fontWeight: 600 }}>vs. last month</small></div>
                        ) : null}
                    </>
                )}
            </div>
        </motion.div>
    );
}

function CardHeader({ title, subtitle, onViewAll, onExportExcel, onExportPdf }) {
    return <div style={styles.cardHeader}>
        <div style={{ minWidth: 0 }}>
            <div style={styles.cardTitle}>{title}</div>
            {subtitle && <div style={styles.cardSubtitle}>{subtitle}</div>}
        </div>
        <ActionMenu onViewAll={onViewAll} onExportExcel={onExportExcel} onExportPdf={onExportPdf} />
    </div>;
}

function TableCard({ title, subtitle, rows, totalLabel, totalValue, onViewAll, onExportExcel, onExportPdf, currency = "AED" }) {
    return <motion.section className="fp-sales-card" style={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }} whileHover={{ boxShadow: shadowHover }}>
        <CardHeader title={title} subtitle={subtitle} onViewAll={onViewAll} onExportExcel={onExportExcel} onExportPdf={onExportPdf} />
        <div style={styles.tableWrap}>
            <table style={styles.table}>
                <thead><tr>
                    <th style={{ ...styles.th, width: "46%" }}>Item</th>
                    <th style={{ ...styles.th, textAlign: "right", width: "28%" }}>Amount<br />({currency} M)</th>
                    <th style={{ ...styles.th, textAlign: "right", width: "26%" }}>% of<br />Total</th>
                </tr></thead>
                <tbody>{rows.map((row) => (
                    <tr key={row.item}><td style={{ ...styles.td, color: "#334155", fontWeight: 600 }}>{row.item}</td>
                        <td style={{ ...styles.td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Number(row.amount || 0).toFixed(1)}</td>
                        <td style={{ ...styles.td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{Number(row.pct || 0).toFixed(1)}%</td>
                    </tr>
                ))}</tbody>
                <tfoot><tr>
                    <td style={styles.totalTd}>{totalLabel}</td>
                    <td style={{ ...styles.totalTd, textAlign: "right" }}>{totalValue === null || totalValue === undefined || !Number.isFinite(Number(totalValue)) ? "—" : Number(totalValue).toFixed(1)}</td>
                    <td style={{ ...styles.totalTd, textAlign: "right" }}>100.0%</td>
                </tr></tfoot>
            </table>
        </div>
    </motion.section>;
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="fp-modern-tooltip"
            style={{
                minWidth: 170,
                padding: "10px 12px",
                border: "1px solid rgba(226,232,240,.96)",
                borderRadius: 11,
                background: "rgba(255,255,255,.96)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 14px 34px rgba(15,23,42,.15), 0 3px 10px rgba(15,23,42,.06)",
                fontFamily: font,
            }}
        >
            <div style={{ marginBottom: 7, paddingBottom: 7, borderBottom: "1px solid #eef2f7", color: "#1e1b4b", fontSize: ".68rem", fontWeight: 800, lineHeight: 1.25 }}>
                {label}
            </div>
            {payload.map((entry, index) => (
                <div key={`${entry.dataKey}-${index}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, color: COLORS.muted, fontSize: ".62rem", fontWeight: 600, marginTop: index ? 5 : 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: entry.color || "#2563eb", boxShadow: "0 0 0 3px rgba(37,99,235,.08)", flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.name || entry.dataKey}</span>
                    </span>
                    <strong style={{ color: entry.color || COLORS.text, fontWeight: 800, whiteSpace: "nowrap" }}>
                        {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
                    </strong>
                </div>
            ))}
        </div>
    );
}

function downloadExcelFile(title, columns, rows, filename) {
    const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const tableRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><h3>${escapeHtml(title)}</h3><table border="1"><thead><tr>${columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = filename || "financial-position.xls";
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
}

function printPdfFile(title, columns, rows) {
    const escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#0f172a}h2{font-size:18px;margin:0 0 16px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#f1f5f9;color:#1e3a8a}td:nth-child(n+2),th:nth-child(n+2){text-align:right}@media print{button{display:none}}</style></head><body><h2>${escapeHtml(title)}</h2><table><thead><tr>${columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table><script>window.onload=()=>window.print();</script></body></html>`);
    win.document.close();
}

function ActionMenu({ onViewAll, onExportExcel, onExportPdf }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handler = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    const run = (callback) => { setOpen(false); callback?.(); };
    return <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
        <button type="button" aria-label="Component actions" onClick={() => setOpen((v) => !v)}
            style={{ width: 24, height: 28, border: 0, borderRadius: 6, background: "transparent", color: "#64748b", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, lineHeight: 1, padding: 0 }}>⋮</button>
        {open && <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", width: 150, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 10px 28px rgba(15,23,42,.14)", zIndex: 1200, padding: 4 }}>
            <button type="button" onClick={() => run(onViewAll)} style={menuItemStyle}>🔍&nbsp; View All</button>
            <button type="button" onClick={() => run(onExportExcel)} style={menuItemStyle}>📊&nbsp; Export Excel</button>
            <button type="button" onClick={() => run(onExportPdf)} style={menuItemStyle}>📄&nbsp; Export PDF</button>
        </div>}
    </div>;
}
const menuItemStyle = { width: "100%", border: 0, background: "transparent", borderRadius: 6, padding: "8px 9px", textAlign: "left", color: "#334155", font: `600 .70rem ${font}`, cursor: "pointer" };

function toData(response) {
    const root = response?.data ?? response;
    return root?.data ?? root?.result ?? root;
}
function toRows(response) {
    const data = toData(response);
    if (Array.isArray(data)) return data;

    // Financial Position list endpoints can return the rows under different
    // collection keys depending on the backend serializer. Support the
    // existing response shapes without changing the API contract.
    const candidates = [
        data?.rows,
        data?.items,
        data?.results,
        data?.data,
        data?.monthly_data,
        data?.monthly_rows,
        data?.parent_divisions,
        data?.by_parent_division,
        data?.monthly_by_parent_division,
        data?.equity,
        data?.equity_rows,
        data?.equity_contribution,
        data?.equity_view_all,
        data?.equity_monthly,
        data?.trend,
        data?.trend_data,
        data?.net_working_capital_trend,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
    }

    return [];
}
function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}
function nullableNum(value) {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}
function millions(value) { return num(value) / 1000000; }
function formatM(value) {
    return value === null || value === undefined || value === "" || !Number.isFinite(Number(value))
        ? "—"
        : millions(value).toFixed(1);
}
function firstValue(obj, keys, fallback = null) {
    for (const key of keys) {
        if (obj && obj[key] !== undefined) return obj[key];
    }
    return fallback;
}
function periodLabel(row) {
    return String(firstValue(row, ["period_month", "period_code", "period", "month"], "—"));
}
function divisionLabel(row) {
    return String(firstValue(row, ["parent_division_name", "name", "parentDivision", "parent_division_code"], "—"));
}
function dedupeByLabel(rows) {
    const seen = new Set();
    return rows.filter((row) => {
        const key = divisionLabel(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}


/*
 * Filter options are loaded from getWorkingCapitalFilterOptions().
 * The Financial Position API does not expose a filter-options endpoint,
 * so the shared Working Capital hierarchy is used for the filter UI only.
 */
function normalizeFinancialFilterOptions(payload) {
    const unwrap = (response) => response?.data?.filters ?? response?.data?.filter_options ?? response?.data ?? response?.filters ?? response?.filter_options ?? response ?? {};
    const data = unwrap(payload);

    const toArray = (value) => Array.isArray(value) ? value : [];
    const normalizeIds = (...values) => values
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .filter((value) => value !== undefined && value !== null && value !== "")
        .map(String);

    const optionList = (source) => toArray(source).map((item) => {
        if (typeof item === "string" || typeof item === "number") {
            return { id: String(item), name: String(item), legalGroupIds: [], legalEntityIds: [], parentDivisionIds: [] };
        }

        const id = item?.id ?? item?.value ?? item?.key ?? item?.code ?? item?.legal_group_id ?? item?.legal_entity_id ?? item?.parent_division_id ?? item?.subdivision_id;
        const name = item?.label ?? item?.name ?? item?.display_name ?? item?.legal_group_name ?? item?.legal_entity_name ?? item?.parent_division_name ?? item?.subdivision_name ?? item?.value;

        return {
            id: id == null ? "" : String(id),
            name: name == null ? "" : String(name),
            legalGroupIds: normalizeIds(item?.legal_group_ids, item?.legalGroupIds, item?.legal_group_id, item?.legalGroupId),
            legalEntityIds: normalizeIds(item?.legal_entity_ids, item?.legalEntityIds, item?.legal_entity_id, item?.legalEntityId),
            parentDivisionIds: normalizeIds(item?.parent_division_ids, item?.parentDivisionIds, item?.parent_division_id, item?.parentDivisionId),
        };
    }).filter((item) => item.id && item.name);

    const rawCurrencies = data.reporting_currencies ?? data.reportingCurrencies ?? data.currencies ?? data.currency_options ?? data.ledger_currencies ?? [];
    const currencies = toArray(rawCurrencies)
        .map((item) => typeof item === "object" ? (item?.value ?? item?.code ?? item?.currency ?? item?.name) : item)
        .filter(Boolean)
        .map(String);
    const reportingCurrency = data.reporting_currency ?? data.reportingCurrency ?? "";

    return {
        legalGroups: optionList(data.legal_groups ?? data.legalGroups),
        legalEntities: optionList(data.legal_entities ?? data.legalEntities),
        parentDivisions: optionList(data.parent_divisions ?? data.parentDivisions),
        subDivisions: optionList(data.subdivisions ?? data.sub_divisions ?? data.subDivisions),
        reportingCurrencies: [...new Set([...(currencies.length ? currencies : []), ...(reportingCurrency ? [String(reportingCurrency)] : [])])],
        asOnDates: toArray(data.as_on_dates ?? data.asOnDates).map((item) => typeof item === "object" ? (item?.value ?? item?.date ?? item?.as_on_date) : item).filter(Boolean).map(String),
        operationalAsOnDate: data.operational_as_on_date ?? data.operationalAsOnDate ?? "",
    };
}

function matchesRelation(option, relationKey, selectedIds) {
    if (!selectedIds.length) return true;
    const relations = Array.isArray(option?.[relationKey]) ? option[relationKey].map(String) : [];
    return relations.length === 0 || selectedIds.some((id) => relations.includes(String(id)));
}

function getCascadeOptions(state, sourceOptions) {
    const groups = (state?.legalGroups || []).filter((id) => id !== "All").map(String);
    const entities = (state?.legalEntities || []).filter((id) => id !== "All").map(String);
    const parents = (state?.parentDivisions || []).filter((id) => id !== "All").map(String);

    const legalGroups = sourceOptions?.legalGroups || [];
    const legalEntities = (sourceOptions?.legalEntities || []).filter((option) => matchesRelation(option, "legalGroupIds", groups));
    const parentDivisions = (sourceOptions?.parentDivisions || []).filter((option) => {
        const groupMatch = matchesRelation(option, "legalGroupIds", groups);
        const entityMatch = matchesRelation(option, "legalEntityIds", entities);
        return groupMatch && entityMatch;
    });
    const subDivisions = (sourceOptions?.subDivisions || []).filter((option) => {
        const parentMatch = matchesRelation(option, "parentDivisionIds", parents.length ? parents : parentDivisions.map((item) => item.id));
        const entityMatch = matchesRelation(option, "legalEntityIds", entities);
        const groupMatch = matchesRelation(option, "legalGroupIds", groups);
        return groupMatch && entityMatch && parentMatch;
    });

    return {
        legalGroups,
        legalEntities,
        parentDivisions,
        subDivisions,
        reportingCurrencies: sourceOptions?.reportingCurrencies?.length ? sourceOptions.reportingCurrencies : [state?.reportingCurrency || "AED"],
    };
}

function intersectionAllowed(current, allowed) {
    if (!Array.isArray(current) || current.length === 0) return [];
    const set = new Set(allowed.map(String));
    return current.filter((id) => id !== "All" && set.has(String(id)));
}

function cascadeUpdateFilter(previous, key, value, sourceOptions) {
    const next = { ...previous, [key]: value };
    const options = getCascadeOptions(next, sourceOptions);

    if (key === "legalGroups") {
        next.legalEntities = intersectionAllowed(next.legalEntities, options.legalEntities.map((o) => o.id));
        next.parentDivisions = intersectionAllowed(next.parentDivisions, options.parentDivisions.map((o) => o.id));
        next.subDivisions = intersectionAllowed(next.subDivisions, getCascadeOptions(next, sourceOptions).subDivisions.map((o) => o.id));
    }

    if (key === "legalEntities") {
        next.parentDivisions = intersectionAllowed(next.parentDivisions, options.parentDivisions.map((o) => o.id));
        next.subDivisions = intersectionAllowed(next.subDivisions, getCascadeOptions(next, sourceOptions).subDivisions.map((o) => o.id));
    }

    if (key === "parentDivisions") {
        next.subDivisions = intersectionAllowed(next.subDivisions, options.subDivisions.map((o) => o.id));
    }

    return next;
}

function FilterPanel({ state, onChange, onApply, onReset, compact = false, filterOptions = {} }) {
    const options = getCascadeOptions(state, filterOptions);
    const set = (key, value) => onChange(cascadeUpdateFilter(state, key, value, filterOptions));

    return (
        <div style={{
            ...styles.card,
            padding: compact ? "9px 12px" : "10px 14px",
            margin: 0,
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            flexWrap: "wrap",
            overflow: "visible",
            flexShrink: 0,
        }}>
            <FilterField label="Legal Group">
                <MultiSelect options={options.legalGroups} value={state.legalGroups} onChange={(v) => set("legalGroups", v)} placeholder="All" style={{ width: compact ? 165 : 175, minWidth: compact ? 165 : 175 }} />
            </FilterField>
            <FilterField label="Legal Entity">
                <MultiSelect options={options.legalEntities} value={state.legalEntities} onChange={(v) => set("legalEntities", v)} placeholder="All" style={{ width: compact ? 190 : 205, minWidth: compact ? 190 : 205 }} />
            </FilterField>
            <FilterField label="Parent Division">
                <MultiSelect options={options.parentDivisions} value={state.parentDivisions} onChange={(v) => set("parentDivisions", v)} placeholder="All" style={{ width: compact ? 175 : 185, minWidth: compact ? 175 : 185 }} />
            </FilterField>
            <FilterField label="Sub-Division">
                <MultiSelect options={options.subDivisions} value={state.subDivisions} onChange={(v) => set("subDivisions", v)} placeholder="All" style={{ width: compact ? 175 : 185, minWidth: compact ? 175 : 185 }} />
            </FilterField>
            <FilterField label="Reporting Currency">
                <select value={state.reportingCurrency} onChange={(e) => set("reportingCurrency", e.target.value)} style={{ ...selStyle, width: compact ? 140 : 150, minWidth: compact ? 140 : 150, height: 34 }}>
                    {options.reportingCurrencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                </select>
            </FilterField>
            <FilterField label="As-on Date">
                <input type="date" value={state.asOnDate} onChange={(e) => set("asOnDate", e.target.value)} style={{ ...dateStyle, width: compact ? 150 : 160, minWidth: compact ? 150 : 160 }} aria-label="As-on Date" />
            </FilterField>
            <div style={{ display: "flex", alignItems: "center", gap: 5, alignSelf: "flex-end", marginLeft: 0, flexShrink: 0 }}>
                <button type="button" onClick={onApply} style={{ height: 32, padding: "0 16px", border: 0, borderRadius: 8, background: COLORS.primaryBlue, color: "#fff", fontFamily: font, fontSize: ".72rem", fontWeight: 700, cursor: "pointer" }}>Apply</button>
                <button type="button" onClick={onReset} style={{ height: 32, padding: "0 6px", border: 0, background: "transparent", color: COLORS.muted, fontFamily: font, fontSize: ".72rem", fontWeight: 600, cursor: "pointer" }}>Reset</button>
            </div>
        </div>
    );
}

function buildApiFilters(filters) {
    const clean = (value) => Array.isArray(value)
        ? value.filter((v) => v !== "All" && v !== "" && v !== null && v !== undefined)
        : [];

    return {
        calendar_date: filters.asOnDate || undefined,
        legal_group_id: clean(filters.legalGroups),
        legal_entity_id: clean(filters.legalEntities),
        parent_division_id: clean(filters.parentDivisions),
        subdivision_id: clean(filters.subDivisions),
        reporting_currency: filters.reportingCurrency || "AED",
    };
}

// Fetch the latest five monthly NWC snapshots using ONLY
// getFinancialPositionInvestmentsMonthlyByParentDivision. The requested month is
// retained on every row so the chart/modal always uses the correct period.
async function fetchLatestFiveInvestmentSnapshots(apiFilters) {
    const baseDate = apiFilters?.calendar_date;
    if (!baseDate) return [];

    const sourceDate = new Date(`${baseDate}T00:00:00`);
    if (Number.isNaN(sourceDate.getTime())) return [];

    const requests = Array.from({ length: 5 }, (_, index) => {
        const date = new Date(sourceDate.getFullYear(), sourceDate.getMonth() - index, sourceDate.getDate());
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        date.setDate(Math.min(sourceDate.getDate(), lastDay));
        const calendarDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        return getFinancialPositionInvestmentsMonthlyByParentDivision({
            ...apiFilters,
            calendar_date: calendarDate,
        }).then((response) => ({
            calendarDate,
            rows: toRows(response),
        }));
    });

    const responses = await Promise.allSettled(requests);
    const rows = [];

    responses.forEach((result) => {
        if (result.status !== "fulfilled") return;

        const { calendarDate, rows: responseRows } = result.value;
        const fallbackYear = calendarDate.slice(0, 4);
        const fallbackMonth = calendarDate.slice(5, 7);
        const fallbackPeriod = `${fallbackYear}-${fallbackMonth}`;

        (responseRows || []).forEach((row) => {
            const periodValue = firstValue(row, [
                "period_code", "period_month", "period", "month", "month_name", "as_on_date", "asOnDate"
            ], null);

            let periodKey = fallbackPeriod;
            const periodText = String(periodValue ?? "").trim();
            const dateMatch = periodText.match(/(\d{4})[-\/](\d{1,2})/);
            if (dateMatch) {
                periodKey = `${dateMatch[1]}-${String(Number(dateMatch[2])).padStart(2, "0")}`;
            } else if (/^\d{4}$/.test(periodText)) {
                periodKey = `${periodText}-${fallbackMonth}`;
            } else {
                const monthNumber = monthSortValueForSnapshot(periodText);
                if (monthNumber >= 1 && monthNumber <= 12) {
                    periodKey = `${fallbackYear}-${String(monthNumber).padStart(2, "0")}`;
                }
            }

            rows.push({
                ...row,
                period_key: periodKey,
                period_month: periodText || fallbackMonth,
                __requestedCalendarDate: calendarDate,
            });
        });
    });

    return rows;
}

function monthSortValueForSnapshot(value) {
    const text = String(value ?? "").trim().toLowerCase();
    if (!text) return 0;
    const named = MONTH_KEYS.find((month) => month.aliases.some((alias) => text === alias || text.startsWith(`${alias}-`) || text.startsWith(`${alias}/`) || text.startsWith(`${alias} `)));
    if (named) return MONTH_KEYS.indexOf(named) + 1;
    const match = text.match(/(?:^|[-\/\s])(\d{1,2})(?:$|[-\/\s])/);
    const month = match ? Number(match[1]) : Number(text);
    return Number.isInteger(month) && month >= 1 && month <= 12 ? month : 0;
}

function normalizeComposition(response) {
    const data = toData(response) || {};
    const assets = Array.isArray(data.current_assets) ? data.current_assets : (Array.isArray(data.currentAssets) ? data.currentAssets : []);
    const liabilities = Array.isArray(data.current_liabilities) ? data.current_liabilities : (Array.isArray(data.currentLiabilities) ? data.currentLiabilities : []);
    const normalizeRows = (rows) => rows.map((row) => ({
        item: row.category ?? row.item ?? row.name ?? "—",
        // Composition API amounts are backend currency values; store them in
        // AED millions for the existing Current-tab table/chart formatting.
        amount: millions(firstValue(row, ["amount", "value", "current_assets", "current_liabilities"], null)),
        pct: nullableNum(firstValue(row, ["percentage_of_total", "pct_of_total", "percentage", "percent"], null)),
    }));
    return {
        totalCurrentAssets: nullableNum(firstValue(data, ["total_current_assets", "totalCurrentAssets"], null)),
        totalCurrentLiabilities: nullableNum(firstValue(data, ["total_current_liabilities", "totalCurrentLiabilities"], null)),
        currentAssets: normalizeRows(assets),
        currentLiabilities: normalizeRows(liabilities),
    };
}

function normalizeCurrentPositionComposition(response) {
    const data = normalizeComposition(response);
    return {
        totalCurrentAssets: data.totalCurrentAssets,
        totalCurrentLiabilities: data.totalCurrentLiabilities,
        currentAssets: data.currentAssets || [],
        currentLiabilities: data.currentLiabilities || [],
    };
}

function normalizeEquityViewAll(response) {
    const root = response?.data ?? response;
    const data = root?.data ?? root?.result ?? root;

    // The Equity View All endpoint can return the collection directly or
    // under one of the documented equity collection keys.
    const candidates = [
        data,
        data?.rows,
        data?.items,
        data?.results,
        data?.equity,
        data?.equity_rows,
        data?.equity_view_all,
        data?.equity_contribution,
        data?.parent_divisions,
        data?.by_parent_division,
    ];

    let rows = [];
    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            rows = candidate;
            break;
        }
        if (candidate && typeof candidate === "object") {
            const nested = [candidate.rows, candidate.items, candidate.results, candidate.data];
            const found = nested.find((value) => Array.isArray(value));
            if (found) {
                rows = found;
                break;
            }
        }
    }

    return rows.map((row) => ({
        legalGroup: firstValue(row, ["legal_group_name", "legal_group", "legal_group_id"], "—"),
        legalEntity: firstValue(row, ["legal_entity_name", "legal_entity", "legal_entity_id"], "—"),
        parentDivision: firstValue(row, ["parent_division_name", "parent_division", "parent_division_code", "parentDivision", "name"], "—"),
        subDivision: firstValue(row, ["subdivision_name", "sub_division_name", "subdivision", "sub_division", "subdivision_id"], "—"),
        shareCapital: nullableNum(firstValue(row, ["share_capital", "shareCapital"], null)),
        additionalCapital: nullableNum(firstValue(row, ["additional_capital", "additionalCapital"], null)),
        reservesAndSurplus: nullableNum(firstValue(row, ["reserves_and_surplus", "reservesAndSurplus", "reserves_surplus"], null)),
        partnerCurrentAccount: nullableNum(firstValue(row, ["partner_current_account", "partnerCurrentAccount"], null)),
        currentYearProfit: nullableNum(firstValue(row, ["current_year_profit", "currentYearProfit", "profit_for_the_year"], null)),
        equityTotal: nullableNum(firstValue(row, ["equity_total", "total_equity", "equity", "equity_position", "totalEquity"], null)),
    }));
}

function normalizeEquityMonthly(response) {
    const root = response?.data ?? response;
    const data = root?.data ?? root?.result ?? root;

    const candidates = [
        data,
        data?.rows,
        data?.items,
        data?.results,
        data?.monthly_data,
        data?.monthly_rows,
        data?.equity_monthly,
        data?.monthly_by_parent_division,
        data?.parent_divisions,
        data?.equity,
    ];

    let rows = [];
    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            rows = candidate;
            break;
        }
        if (candidate && typeof candidate === "object") {
            const nested = [candidate.rows, candidate.items, candidate.results, candidate.data];
            const found = nested.find((value) => Array.isArray(value));
            if (found) {
                rows = found;
                break;
            }
        }
    }

    const monthAliases = {
        Jan: ["jan", "january", "01"], Feb: ["feb", "february", "02"],
        Mar: ["mar", "march", "03"], Apr: ["apr", "april", "04"],
        May: ["may", "05"], Jun: ["jun", "june", "06"],
        Jul: ["jul", "july", "07"], Aug: ["aug", "august", "08"],
        Sep: ["sep", "september", "09"], Oct: ["oct", "october", "10"],
        Nov: ["nov", "november", "11"], Dec: ["dec", "december", "12"],
    };

    const hasMonthColumn = (row) => Object.keys(monthAliases).some((month) =>
        monthAliases[month].some((key) => row?.[key] !== undefined || row?.[key.toUpperCase()] !== undefined)
    );

    const output = [];

    // Wide response: Parent Division + Jan-Dec columns.
    if (rows.some(hasMonthColumn)) {
        rows.forEach((row) => {
            const parent = divisionLabel(row);
            const code = firstValue(row, ["parent_division_code", "parentDivisionCode"], null);
            MONTH_KEYS.forEach((month) => {
                const aliases = monthAliases[month.key] || [];
                const key = aliases.find((alias) => row?.[alias] !== undefined)
                    || aliases.find((alias) => row?.[alias.toUpperCase()] !== undefined);
                if (key !== undefined) {
                    output.push({
                        period: month.key,
                        parentDivision: parent,
                        code,
                        equity: nullableNum(row[key]),
                        kind: "equity",
                    });
                }
            });
        });
        return output;
    }

    // Row-per-month response.
    rows.forEach((row) => {
        const period = firstValue(row, ["period_month", "period_code", "period", "month", "month_name"], null);
        output.push({
            period: period === null ? "—" : String(period),
            parentDivision: divisionLabel(row),
            code: firstValue(row, ["parent_division_code", "parentDivisionCode"], null),
            equity: nullableNum(firstValue(row, [
                "equity_total", "total_equity", "equity", "equity_position", "amount", "value",
            ], null)),
            kind: "equity",
        });
    });

    return output;
}

function normalizeEquity(response) {
    const data = toData(response) || {};
    return {
        shareCapital: nullableNum(data.share_capital),
        additionalCapital: nullableNum(data.additional_capital),
        reservesAndSurplus: nullableNum(data.reserves_and_surplus),
        partnerCurrentAccount: nullableNum(data.partner_current_account),
        currentYearProfit: nullableNum(data.current_year_profit),
        equityTotal: nullableNum(data.equity_total),
    };
}

function equityRows(equity) {
    return [
        ["Share Capital", equity.shareCapital],
        ["Additional Capital", equity.additionalCapital],
        ["Reserves & Surplus", equity.reservesAndSurplus],
        ["Partner Current Account", equity.partnerCurrentAccount],
        ["Current Year Profit", equity.currentYearProfit],
    ].map(([name, value]) => ({ name, value: value === null ? null : millions(value) }));
}

function normalizeKpis(response) {
    const data = toData(response) || {};
    return [
        { key: "nwc", label: "Net Working Capital", value: nullableNum(data.net_working_capital), unit: "M", icon: "▤", cardBg: "#f0fdf4", iconBg: "#dcfce7", accent: "#16a34a" },
        { key: "assets", label: "Total Current Assets", value: nullableNum(data.total_current_assets), unit: "M", icon: "▣", cardBg: "#f0f5ff", iconBg: "#dbeafe", accent: "#2563eb" },
        { key: "liabilities", label: "Total Current Liabilities", value: nullableNum(data.total_current_liabilities), unit: "M", icon: "▣", cardBg: "#fff1f2", iconBg: "#ffe4e6", accent: "#e11d48" },
        { key: "ratio", label: "Current Ratio", value: nullableNum(data.current_ratio), ratio: true, decimals: 2, icon: "◉", cardBg: "#faf5ff", iconBg: "#ede9fe", accent: "#7c3aed" },
        { key: "roi", label: "ROI %", value: nullableNum(firstValue(data, ["roi_percentage", "roi_percent", "roi"], null)), ratio: true, decimals: 2, suffix: "%", icon: "%", cardBg: "#ecfdf5", iconBg: "#d1fae5", accent: "#059669" },
        { key: "turnover", label: "NWC Turnover Ratio", value: nullableNum(data.nwc_turnover_ratio), ratio: true, decimals: 2, icon: "◷", cardBg: "#fffbeb", iconBg: "#fef3c7", accent: "#d97706" },
        { key: "investments", label: "Total Investments", value: nullableNum(data.total_investments), unit: "M", icon: "↗", cardBg: "#ecfeff", iconBg: "#cffafe", accent: "#0891b2" },
        { key: "equity", label: "Equity Position", value: nullableNum(data.equity_position), unit: "M", icon: "◎", cardBg: "#faf5ff", iconBg: "#ede9fe", accent: "#7c3aed" },
        { key: "fixedAssets", label: "Fixed Assets & Other Non-Current Assets", value: nullableNum(data.fixed_assets_and_other_non_current_assets), unit: "M", icon: "⌂", cardBg: "#f0f5ff", iconBg: "#dbeafe", accent: "#2563eb" },
        { key: "longTerm", label: "Long-Term Bank Borrowings", value: nullableNum(data.long_term_bank_borrowings), unit: "M", icon: "⇅", cardBg: "#fff7ed", iconBg: "#ffedd5", accent: "#ea580c" },
        { key: "shortTerm", label: "Short-Term Bank Borrowings", value: nullableNum(data.short_term_bank_borrowings), unit: "M", icon: "⇅", cardBg: "#fffbeb", iconBg: "#fef3c7", accent: "#d97706" },
        { key: "relatedParty", label: "Loan from Related Party", value: nullableNum(data.loan_from_related_party), unit: "M", icon: "◎", cardBg: "#faf5ff", iconBg: "#ede9fe", accent: "#7c3aed" },
    ];
}

function normalizeInvestmentRows(response) {
    return toRows(response).map((row) => ({
        legalGroup: row.legal_group_name ?? row.legal_group ?? row.legal_group_id ?? "—",
        legalEntity: row.legal_entity_name ?? row.legal_entity ?? row.legal_entity_id ?? "—",
        parentDivision: divisionLabel(row),
        code: row.parent_division_code,
        period: row.period_month ?? row.period_code ?? periodLabel(row),
        periodKey: row.period_key ?? row.period_code ?? row.period_month ?? periodLabel(row),
        periodCode: row.period_code ?? null,
        periodMonth: row.period_month ?? null,
        subDivision: row.subdivision_name ?? row.sub_division_name ?? row.subdivision ?? row.subdivision_id ?? "—",
        fixedAssets: nullableNum(row.fixed_assets_and_other_non_current_assets),
        provision: nullableNum(row.provision_for_gratuity),
        currentAssets: nullableNum(row.current_assets ?? row.total_current_assets),
        currentLiabilities: nullableNum(row.current_liabilities ?? row.total_current_liabilities),
        nwc: nullableNum(row.net_working_capital),
        currentRatio: nullableNum(row.current_ratio),
        nwcTurnoverRatio: nullableNum(row.nwc_turnover_ratio),
        totalInvestments: nullableNum(row.total_investments),
        percentageOfTotal: nullableNum(row.percentage_of_total ?? row.pct_of_total),
    }));
}

function normalizeBorrowingRows(response) {
    return toRows(response).map((row) => ({
        parentDivision: divisionLabel(row),
        code: row.parent_division_code,
        longTerm: nullableNum(row.long_term_bank_borrowings),
        shortTerm: nullableNum(row.short_term_bank_borrowings),
        bankTotal: nullableNum(row.bank_borrowings_total),
        relatedParty: nullableNum(row.loan_from_related_party),
        total: nullableNum(row.total_borrowings),
        legalEntity: row.legal_entity_name ?? row.legal_entity ?? "—",
        subDivision: row.subdivision_name ?? row.sub_division_name ?? row.subdivision ?? "—",
    }));
}

function normalizeMonthly(response, kind) {
    return toRows(response).map((row) => ({
        period: periodLabel(row),
        parentDivision: divisionLabel(row),
        code: row.parent_division_code,
        fixedAssets: nullableNum(row.fixed_assets_and_other_non_current_assets),
        provision: nullableNum(row.provision_for_gratuity),
        currentAssets: nullableNum(row.current_assets ?? row.total_current_assets),
        currentLiabilities: nullableNum(row.current_liabilities ?? row.total_current_liabilities),
        nwc: nullableNum(row.net_working_capital),
        equity: nullableNum(row.equity_total),
        longTerm: nullableNum(row.long_term_bank_borrowings),
        shortTerm: nullableNum(row.short_term_bank_borrowings),
        relatedParty: nullableNum(row.loan_from_related_party),
        kind,
    }));
}

function normalizeNwcTrend(response) {
    return toRows(response)
        .map((row) => ({
            period: row.period_month ?? row.period_code ?? row.period ?? row.month ?? row.month_name ?? periodLabel(row),
            periodCode: row.period_code ?? null,
            periodMonth: row.period_month ?? null,
            nwc: nullableNum(
                row.net_working_capital ??
                row.nwc ??
                row.nwc_value ??
                row.value ??
                row.amount
            ),
        }))
        .filter((row) => row.period && row.nwc !== null);
}

const MONTH_KEYS = [
    { key: "Jan", aliases: ["jan", "january", "01", "1"] },
    { key: "Feb", aliases: ["feb", "february", "02", "2"] },
    { key: "Mar", aliases: ["mar", "march", "03", "3"] },
    { key: "Apr", aliases: ["apr", "april", "04", "4"] },
    { key: "May", aliases: ["may", "05", "5"] },
    { key: "Jun", aliases: ["jun", "june", "06", "6"] },
    { key: "Jul", aliases: ["jul", "july", "07", "7"] },
    { key: "Aug", aliases: ["aug", "august", "08", "8"] },
    { key: "Sep", aliases: ["sep", "september", "09", "9"] },
    { key: "Oct", aliases: ["oct", "october", "10"] },
    { key: "Nov", aliases: ["nov", "november", "11"] },
    { key: "Dec", aliases: ["dec", "december", "12"] },
];
function monthNameFromPeriod(value) {
    const text = String(value ?? "").trim();
    const match = text.match(/(?:^|[-\/\s])([0-9]{1,2})(?:$|[-\/\s])/);
    const monthNumber = match ? Number(match[1]) : Number(text);

    if (Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
        return MONTH_KEYS[monthNumber - 1].key;
    }

    const lower = text.toLowerCase();
    const named = MONTH_KEYS.find((m) =>
        m.aliases.some(
            (alias) =>
                lower === alias ||
                lower.startsWith(`${alias}-`) ||
                lower.startsWith(`${alias} `) ||
                lower.startsWith(`${alias}/`)
        )
    );

    return named ? named.key : text;
}

function monthKeyFromValue(value) {
    const text = String(value ?? "").trim().toLowerCase();
    if (!text) return null;
    const found = MONTH_KEYS.find((m) => m.aliases.some((a) => text === a || text.startsWith(`${a}-`) || text.startsWith(`${a}/`) || text.startsWith(`${a} `) || text.endsWith(`-${a}`) || text.endsWith(`/${a}`) || text.endsWith(` ${a}`)));
    if (found) return found.key;
    const match = text.match(/(?:^|[-\/\s])(\d{1,2})(?:$|[-\/\s])/);
    if (match) {
        const month = Number(match[1]);
        if (month >= 1 && month <= 12) return MONTH_KEYS[month - 1].key;
    }
    return null;
}

function normalizePositionMonthlyRows(response, valueKey) {
    const raw = toRows(response);
    const output = [];
    const valueKeys = valueKey === "currentAssets"
        ? ["currentAssets", "current_assets", "totalCurrentAssets", "total_current_assets", "amount", "value"]
        : ["currentLiabilities", "current_liabilities", "totalCurrentLiabilities", "total_current_liabilities", "amount", "value"];

    raw.forEach((row) => {
        const parentDivision = divisionLabel(row);
        const explicitMonth = monthKeyFromValue(firstValue(row, ["period_month", "period_code", "period", "month", "month_name", "as_on_date", "asOnDate"], ""));
        const hasWideMonths = MONTH_KEYS.some((m) => {
            const aliases = [m.key, m.key.toLowerCase(), m.key.toUpperCase(), ...m.aliases];
            return aliases.some((key) => Object.prototype.hasOwnProperty.call(row, key));
        });

        if (hasWideMonths) {
            const base = { parentDivision, code: row.parent_division_code };
            MONTH_KEYS.forEach((m) => {
                const aliases = [m.key, m.key.toLowerCase(), m.key.toUpperCase(), ...m.aliases];
                const value = aliases.reduce((found, key) => found !== undefined ? found : row[key], undefined);
                output.push({ ...base, period: m.key, [valueKey]: nullableNum(value) });
            });
            return;
        }

        // Row-per-month response. Some serializers wrap the monthly value in
        // `amount`, `value`, or the position-specific field.
        const nested = row?.data && typeof row.data === "object" && !Array.isArray(row.data) ? row.data : row;
        output.push({
            parentDivision,
            code: row.parent_division_code,
            period: explicitMonth || periodLabel(row),
            [valueKey]: nullableNum(firstValue(nested, valueKeys, null)),
        });
    });

    return output;
}

function buildGenericMonthlyTable(rows, valueKey) {
    const byParent = new Map();
    (rows || []).forEach((row) => {
        const parent = row.parentDivision || "—";
        if (!byParent.has(parent)) byParent.set(parent, { parentDivision: parent, months: {} });
        const item = byParent.get(parent);
        const month = monthKeyFromValue(row.period);
        if (!month) return;
        const value = nullableNum(row[valueKey]);
        if (value === null) return;
        item.months[month] = (item.months[month] ?? 0) + value;
    });

    const data = [...byParent.values()].map((row) => ({
        ...row,
        total: MONTH_KEYS.reduce((sum, month) => sum + (row.months[month.key] ?? 0), 0),
    }));
    const grandTotal = data.reduce((sum, row) => sum + row.total, 0);

    return {
        rows: data,
        grandTotal,
        percentages: data.map((row) => grandTotal === 0 ? 0 : (row.total / grandTotal) * 100),
    };
}

function buildPositionMonthlyTable(rows, valueKey) {
    const byParent = new Map();
    rows.forEach((row) => {
        const parent = row.parentDivision || "—";
        if (!byParent.has(parent)) byParent.set(parent, { parentDivision: parent, months: {} });
        const item = byParent.get(parent);
        const month = monthKeyFromValue(row.period) || row.period;
        if (MONTH_KEYS.some((m) => m.key === month)) item.months[month] = nullableNum(row[valueKey]);
    });
    const data = [...byParent.values()].map((row) => {
        const total = MONTH_KEYS.reduce((sum, m) => sum + (row.months[m.key] ?? 0), 0);
        return { ...row, total };
    });
    const grandTotal = data.reduce((sum, row) => sum + row.total, 0);
    return {
        rows: data,
        grandTotal,
        percentages: data.map((row) => grandTotal === 0 ? 0 : (row.total / grandTotal) * 100),
    };
}

function formatUnitValue(value, unit) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
    return unit === "AED" ? Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 }) : millions(value).toFixed(1);
}

function valueForPositionRow(row, type) {
    if (type === "assets") return row.currentAssets;
    if (type === "liabilities") return row.currentLiabilities;
    return row.nwc;
}


function groupMonthlyByPeriod(rows, valueKey) {
    const periods = [];
    const byPeriod = new Map();
    rows.forEach((row) => {
        if (!byPeriod.has(row.period)) {
            byPeriod.set(row.period, { period: row.period });
            periods.push(row.period);
        }
        const item = byPeriod.get(row.period);
        const name = row.parentDivision;
        item[name] = row[valueKey] === null ? null : millions(row[valueKey]);
    });
    return periods.map((period) => byPeriod.get(period));
}

function getParentDivisionNames(rows) {
    return [...new Set(rows.map((row) => row.parentDivision).filter((v) => v && v !== "—"))];
}

function safePct(value, total) {
    if (value === null || value === undefined || total === null || total === undefined || num(total) === 0) return 0;
    return (num(value) / num(total)) * 100;
}

function PositionBarXAxisTick({ x, y, payload }) {
    const raw = String(payload?.value ?? "");
    const words = raw.split(/\\s+/).filter(Boolean);
    let lines = [raw];

    if (raw.length > 16 && words.length > 1) {
        let first = "";
        let second = "";
        const midpoint = Math.ceil(words.length / 2);
        words.forEach((word, index) => {
            if (index < midpoint) first += `${first ? " " : ""}${word}`;
            else second += `${second ? " " : ""}${word}`;
        });
        lines = [first, second];
    }

    return (
        <g transform={`translate(${x},${y})`}>
            <text
                textAnchor="middle"
                fill="#64748b"
                fontSize={8}
                fontWeight={600}
            >
                {lines.map((line, index) => (
                    <tspan key={index} x="0" dy={index === 0 ? 0 : 10}>
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
}

function FixedAssetsBarXAxisTick({ x, y, payload }) {
    const raw = String(payload?.value ?? "");
    const words = raw.split(/\s+/).filter(Boolean);
    let lines = [raw];

    if (words.length > 1) {
        let first = "";
        let second = "";
        const maxChars = Math.ceil(raw.length / 2);
        words.forEach((word) => {
            const next = `${first ? `${first} ` : ""}${word}`;
            if (!first || next.length <= maxChars) first = next;
            else second += `${second ? " " : ""}${word}`;
        });
        lines = second ? [first, second] : [raw];
    }

    return (
        <g transform={`translate(${x},${y})`}>
            <text textAnchor="middle" fill="#64748b" fontSize={8} fontWeight={600}>
                {lines.map((line, index) => (
                    <tspan key={index} x="0" dy={index === 0 ? 0 : 10}>
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
}

function BorrowingBarXAxisTick({ x, y, payload }) {
    const raw = String(payload?.value ?? "");
    const words = raw.split(/\s+/).filter(Boolean);
    let lines = [raw];

    if (words.length > 1) {
        let first = "";
        let second = "";
        const maxChars = Math.ceil(raw.length / 2);
        words.forEach((word) => {
            const next = `${first ? `${first} ` : ""}${word}`;
            if (!first || next.length <= maxChars) first = next;
            else second += `${second ? " " : ""}${word}`;
        });
        lines = second ? [first, second] : [raw];
    }

    return (
        <g transform={`translate(${x},${y})`}>
            <text textAnchor="middle" fill="#64748b" fontSize={8} fontWeight={600}>
                {lines.map((line, index) => (
                    <tspan key={index} x="0" dy={index === 0 ? 0 : 10}>
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
}

function NwcBarXAxisTick({ x, y, payload }) {
    const raw = String(payload?.value ?? "");
    const words = raw.split(/\s+/).filter(Boolean);
    let lines = [raw];

    if (raw.length > 16 && words.length > 1) {
        let first = "";
        let second = "";
        words.forEach((word) => {
            const next = `${first ? `${first} ` : ""}${word}`;
            if (next.length <= Math.ceil(raw.length / 2) || !first) first = next;
            else second += `${second ? " " : ""}${word}`;
        });
        lines = second ? [first, second] : [raw];
    }

    return (
        <g transform={`translate(${x},${y})`}>
            <text textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={600}>
                {lines.map((line, index) => (
                    <tspan key={index} x="0" dy={index === 0 ? 0 : 12}>{line}</tspan>
                ))}
            </text>
        </g>
    );
}

function NwcBarYAxisTick({ x, y, payload }) {
    const raw = String(payload?.value ?? "");
    const words = raw.split(/\s+/).filter(Boolean);
    let lines = [raw];
    if (raw.length > 18 && words.length > 1) {
        let first = "";
        let second = "";
        const midpoint = Math.ceil(words.length / 2);
        words.forEach((word, index) => {
            if (index < midpoint) first += `${first ? " " : ""}${word}`;
            else second += `${second ? " " : ""}${word}`;
        });
        lines = second ? [first, second] : [raw];
    }
    return (
        <g transform={`translate(${x},${y})`}>
            <text textAnchor="end" fill="#1e293b" fontSize={10.5} fontWeight={700}>
                {lines.map((line, index) => <tspan key={index} x="-8" dy={index === 0 ? 0 : 12}>{line}</tspan>)}
            </text>
        </g>
    );
}

function formatNwcAxisValue(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    const abs = Math.abs(n);
    if (abs >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (abs >= 1000) return `${Math.round(n / 1000)}K`;
    return `${Math.round(n)}`;
}

function Modal({
    open,
    title,
    type,
    filters,
    detail,
    monthly,
    loading,
    onClose,
    onFiltersChange,
    onApplyFilters,
    onResetFilters,
    onTabChange,
    currency,
    filterOptions,
}) {
    const [view, setView] = useState("Current");

    useEffect(() => {
        if (!open) return;
        setView(type === "equity" ? "Equity Components" : type === "nwc" ? "Month-on-Month" : "Current");
    }, [open, type]);

    const tabs =
        type === "assets" || type === "liabilities" ? ["Current", "Month-on-Month"] :
            type === "nwc" ? ["Month-on-Month"] :
                type === "equity" ? ["Equity Components", "Parent Division MoM"] :
                    type === "investments" ? ["Current", "Parent Division MoM"] :
                        type === "borrowing" ? ["Current", "Long-Term Bank Loan MoM", "Related Party Loan MoM", "Short-Term Bank Borrowing MoM"] :
                            type === "fixedAssets" ? ["Current", "Parent Division MoM"] :
                                [];

    useEffect(() => {
        const isMonthlyView =
            view === "Month-on-Month" ||
            view === "Parent Division MoM" ||
            view === "Long-Term Bank Loan MoM" ||
            view === "Related Party Loan MoM" ||
            view === "Short-Term Bank Borrowing MoM";
        if (open && isMonthlyView) onTabChange?.(view);
    }, [open, view]);

    const monthlyKind =
        type === "equity" ? "equity" :
            type === "borrowing" ? "borrowing" :
                "investment";
    const monthlySource = monthlyKind === "borrowing" ? (monthly?.borrowings || []) : monthlyKind === "equity" ? (monthly?.equity || []) : (monthly?.investments || []);
    const parentNames = getParentDivisionNames(monthlySource);

    let columns = [];
    let rows = [];
    const isPositionType = type === "assets" || type === "liabilities";
    const [positionUnit, setPositionUnit] = useState("AED MILLION");
    const positionRows = isPositionType ? (detail?.currentViewAll || []).map((r) => ({
        legalGroup: r.legal_group_name ?? r.legal_group ?? r.legal_group_id ?? "—",
        legalEntity: r.legal_entity_name ?? r.legal_entity ?? r.legal_entity_id ?? "—",
        parentDivision: r.parent_division_name ?? r.parent_division ?? r.parent_division_code ?? "—",
        subDivision: r.subdivision_name ?? r.sub_division_name ?? r.subdivision ?? r.subdivision_id ?? "—",
        currentAssets: nullableNum(r.current_assets ?? r.total_current_assets),
        currentLiabilities: nullableNum(r.current_liabilities ?? r.total_current_liabilities),
        nwc: nullableNum(r.net_working_capital),
        currentRatio: nullableNum(r.current_ratio),
        nwcTurnoverRatio: nullableNum(r.nwc_turnover_ratio),
        percentageOfTotal: nullableNum(r.percentage_of_total ?? r.pct_of_total),
    })) : [];

    // Equity Components is the current/detail tab for the equity modal.
    // Keep Parent Division MoM as the only monthly view for equity.
    const isCurrentView = view === "Current" || (type === "equity" && view === "Equity Components");

    if (isCurrentView) {
        if (type === "assets" || type === "liabilities" || type === "nwc") {
            const isAsset = type === "assets";
            const composition = detail?.currentComposition;
            const compositionRows = isAsset ? (composition?.currentAssets || []) : (composition?.currentLiabilities || []);
            const total = isAsset ? composition?.totalCurrentAssets : composition?.totalCurrentLiabilities;

            if (type === "assets" || type === "liabilities") {
                columns = ["Item", `Amount (${positionUnit})`, "% of Total"];
                rows = compositionRows.map((r) => [
                    r.item,
                    r.amount === null || r.amount === undefined ? "—" : formatUnitValue(Number(r.amount) * 1000000, positionUnit),
                    r.pct === null || r.pct === undefined ? "—" : `${Number(r.pct).toFixed(1)}%`,
                ]);
                const calculatedTotal = compositionRows.reduce((sum, r) => sum + (r.amount ?? 0), 0) * 1000000;
                const totalValue = total !== null && total !== undefined ? total : calculatedTotal;
                rows.push([
                    isAsset ? "Total Current Assets" : "Total Current Liabilities",
                    formatUnitValue(totalValue, positionUnit),
                    "100.0%",
                ]);
            } else {
                const source = detail?.investments || [];
                const totalNwc = source.reduce((sum, r) => sum + (r.nwc ?? 0), 0);
                columns = ["Parent Division", `NWC (${positionUnit})`];
                rows = source.map((r) => [
                    r.parentDivision,
                    r.nwc === null ? "—" : formatUnitValue(r.nwc, positionUnit),
                ]);
                rows.push(["Total", formatUnitValue(totalNwc, positionUnit)]);
            }
        } else if (type === "equity") {
            const data = detail?.equityViewAll || [];
            columns = [
                "Parent Division",
                `Share Capital (${positionUnit})`,
                `Additional Capital (${positionUnit})`,
                `Reserves & Surplus (${positionUnit})`,
                `Partner Current Account (${positionUnit})`,
                `Current Year Profit (${positionUnit})`,
                `Equity Total (${positionUnit})`,
            ];
            rows = data.map((r) => [
                r.parentDivision,
                r.shareCapital === null ? "—" : formatUnitValue(r.shareCapital, positionUnit),
                r.additionalCapital === null ? "—" : formatUnitValue(r.additionalCapital, positionUnit),
                r.reservesAndSurplus === null ? "—" : formatUnitValue(r.reservesAndSurplus, positionUnit),
                r.partnerCurrentAccount === null ? "—" : formatUnitValue(r.partnerCurrentAccount, positionUnit),
                r.currentYearProfit === null ? "—" : formatUnitValue(r.currentYearProfit, positionUnit),
                r.equityTotal === null ? "—" : formatUnitValue(r.equityTotal, positionUnit),
            ]);
            if (data.length) {
                const total = data.reduce((sum, r) => sum + (r.equityTotal ?? 0), 0);
                rows.push(["Total", "—", "—", "—", "—", "—", formatUnitValue(total, positionUnit)]);
            }
        } else if (type === "investments") {
            const data = detail?.investments || [];
            columns = ["Parent Division", `Fixed Assets & Other NCA (${positionUnit})`, `NWC (${positionUnit})`, `Provision for Gratuity (${positionUnit})`, `Total Investments (${positionUnit})`];
            rows = data.map((r) => [r.parentDivision, r.fixedAssets === null ? "—" : formatUnitValue(r.fixedAssets, positionUnit), r.nwc === null ? "—" : formatUnitValue(r.nwc, positionUnit), r.provision === null ? "—" : formatUnitValue(r.provision, positionUnit), r.totalInvestments === null ? "—" : formatUnitValue(r.totalInvestments, positionUnit)]);
        } else if (type === "borrowing") {
            const data = detail?.borrowings || [];
            columns = ["Parent Division", `Long-Term Bank (${positionUnit})`, `Short-Term Bank (${positionUnit})`, `Bank Borrowings Total (${positionUnit})`, `Related Party Loan (${positionUnit})`, `Total Borrowings (${positionUnit})`];
            rows = data.map((r) => [r.parentDivision, r.longTerm === null ? "—" : formatUnitValue(r.longTerm, positionUnit), r.shortTerm === null ? "—" : formatUnitValue(r.shortTerm, positionUnit), r.bankTotal === null ? "—" : formatUnitValue(r.bankTotal, positionUnit), r.relatedParty === null ? "—" : formatUnitValue(r.relatedParty, positionUnit), r.total === null ? "—" : formatUnitValue(r.total, positionUnit)]);
        } else if (type === "fixedAssets") {
            const data = detail?.investments || [];
            columns = ["Parent Division", `Fixed Assets & Other NCA (${positionUnit})`, `Provision for Gratuity (${positionUnit})`, `NWC (${positionUnit})`, `Total Investments (${positionUnit})`];
            rows = data.map((r) => [r.parentDivision, r.fixedAssets === null ? "—" : formatUnitValue(r.fixedAssets, positionUnit), r.provision === null ? "—" : formatUnitValue(r.provision, positionUnit), r.nwc === null ? "—" : formatUnitValue(r.nwc, positionUnit), r.totalInvestments === null ? "—" : formatUnitValue(r.totalInvestments, positionUnit)]);
        }
    } else {
        if (isPositionType) {
            const valueKey = type === "assets" ? "currentAssets" : "currentLiabilities";
            // Month-on-Month for Current Assets / Current Liabilities comes from
            // getFinancialPositionCurrentAssetsLiabilitiesViewAll, not the investments endpoint.
            const monthlyRows = normalizePositionMonthlyRows(detail?.currentViewAll || [], valueKey);
            const monthlyTable = buildPositionMonthlyTable(monthlyRows, valueKey);
            columns = ["Parent Division", ...MONTH_KEYS.map((m) => m.key), "Total", "% of Total"];
            rows = monthlyTable.rows.map((r, index) => [
                r.parentDivision,
                ...MONTH_KEYS.map((m) => formatUnitValue(r.months[m.key], positionUnit)),
                formatUnitValue(r.total, positionUnit),
                `${monthlyTable.percentages[index].toFixed(1)}%`,
            ]);
            rows.push(["Total", ...MONTH_KEYS.map((m) => {
                const value = monthlyTable.rows.reduce((sum, r) => sum + (r.months[m.key] ?? 0), 0);
                return formatUnitValue(value, positionUnit);
            }), formatUnitValue(monthlyTable.grandTotal, positionUnit), "100.0%"]);
        } else {
            let key = "nwc";
            if (type === "equity") key = "equity";
            if (type === "borrowing") {
                key = view === "Long-Term Bank Loan MoM" ? "longTerm" : view === "Short-Term Bank Borrowing MoM" ? "shortTerm" : "relatedParty";
            }
            if (type === "fixedAssets") key = "fixedAssets";
            const source = monthlyKind === "borrowing" ? monthly?.borrowings : monthlyKind === "equity" ? monthly?.equity : monthly?.investments;

            if (type === "nwc") {
                // NWC View All shows all months returned by the backend.
                // The main page remains limited to the latest five months separately.
                const nwcRows = (source || [])
                    .filter((row) => row?.parentDivision && row.parentDivision !== "—" && row.nwc !== null && row.nwc !== undefined)
                    .map((row) => {
                        const periodKey = row.periodKey || row.period_code || row.period || row.periodMonth || "";
                        const rawPeriod = row.periodMonth || row.periodCode || row.period;
                        return {
                            ...row,
                            periodKey: String(periodKey),
                            monthLabel: monthNameFromPeriod(rawPeriod),
                        };
                    });

                const periodKeys = Array.from(new Set(nwcRows.map((row) => row.periodKey)))
                    .sort((a, b) => a.localeCompare(b));

                const divisions = Array.from(new Set(
                    nwcRows
                        .filter((row) => periodKeys.includes(row.periodKey))
                        .map((row) => row.parentDivision)
                ));

                columns = ["Parent Division", ...periodKeys.map((periodKey) => {
                    const row = nwcRows.find((item) => item.periodKey === periodKey);
                    return row?.monthLabel || monthNameFromPeriod(periodKey);
                })];

                rows = divisions.map((division) => [
                    division,
                    ...periodKeys.map((periodKey) => {
                        const row = nwcRows.find((item) => item.parentDivision === division && item.periodKey === periodKey);
                        return row?.nwc === null || row?.nwc === undefined
                            ? "—"
                            : formatUnitValue(row.nwc, positionUnit);
                    }),
                ]);
            } else {
                const monthlyTable = buildGenericMonthlyTable(source || [], key);
                columns = ["Parent Division", ...MONTH_KEYS.map((month) => month.key), "Total", "% of Total"];
                rows = monthlyTable.rows.map((row, index) => [
                    row.parentDivision,
                    ...MONTH_KEYS.map((month) => row.months[month.key] === null || row.months[month.key] === undefined ? "—" : formatUnitValue(row.months[month.key], positionUnit)),
                    formatUnitValue(row.total, positionUnit),
                    `${monthlyTable.percentages[index].toFixed(1)}%`,
                ]);
                rows.push([
                    "Total",
                    ...MONTH_KEYS.map((month) => {
                        const value = monthlyTable.rows.reduce((sum, row) => sum + (row.months[month.key] ?? 0), 0);
                        return formatUnitValue(value, positionUnit);
                    }),
                    Number(monthlyTable.grandTotal / 1000000).toFixed(1),
                    "100.0%",
                ]);
            }
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div className="fp-sales-modal-backdrop" style={styles.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
                    <motion.div className="fp-sales-modal" style={styles.modal} initial={{ opacity: 0, scale: .985, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .985, y: 8 }}>
                        <div className="fp-modal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 18px 10px", borderBottom: "1px solid #f1f5f9", background: "linear-gradient(90deg,#f8fafc,#fff)", flexShrink: 0 }}>
                            <div style={{ minWidth: 0 }}>
                                <h3 style={{ margin: 0, color: COLORS.text, fontSize: ".92rem", fontWeight: 800 }}>{title}</h3>
                                <p style={{ margin: "3px 0 0", color: COLORS.muted, fontSize: ".64rem", fontWeight: 500 }}>Detailed View · {formatAsOnDate(filters?.asOnDate)}</p>
                            </div>
                            <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: 0, borderRadius: 7, background: "transparent", color: COLORS.muted, cursor: "pointer", fontSize: 16 }} aria-label="Close modal">✕</button>
                        </div>
                        <div className="fp-modal-filter" style={{ padding: "8px 18px", borderBottom: "1px solid #e2e8f0", background: "#fff", flexShrink: 0 }}>
                            <FilterPanel state={filters} onChange={onFiltersChange} onApply={onApplyFilters} onReset={onResetFilters} compact filterOptions={filterOptions} />
                        </div>
                        {tabs.length > 0 && <div className="fp-modal-tabs" style={{ padding: "8px 18px 0", background: "#fff", flexShrink: 0, overflowX: "auto" }}>
                            <div style={{ ...styles.tabs, gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, minWidth: tabs.length > 2 ? 720 : 360, maxWidth: tabs.length > 2 ? 920 : 620, margin: 0 }}>
                                {tabs.map((tab) => <button type="button" key={tab} onClick={() => setView(tab)}
                                    style={{ ...styles.tab, background: view === tab ? COLORS.primaryBlue : "#f1f5f9", color: view === tab ? "#fff" : COLORS.muted, height: 34, whiteSpace: "nowrap" }}>{tab}</button>)}
                            </div>
                        </div>}
                        <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 18px 0", gap: 4, background: "#fff" }}>
                            {['AED', 'AED MILLION'].map((unit) => <button type="button" key={unit} onClick={() => setPositionUnit(unit)} style={{ border: `1px solid ${positionUnit === unit ? COLORS.primaryBlue : COLORS.border}`, background: positionUnit === unit ? COLORS.primaryBlue : "#fff", color: positionUnit === unit ? "#fff" : COLORS.muted, borderRadius: 6, padding: "5px 9px", font: `700 .60rem ${font}`, cursor: "pointer" }}>{unit}</button>)}
                        </div>
                        <div className="fp-modal-content" style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "10px 18px 14px" }}>
                            {loading ? <Skeleton height={100} /> : (
                                rows.length ? <table className="fp-viewall-table" style={{ ...styles.table, minWidth: !isCurrentView ? 1080 : 0 }}>
                                    <thead><tr>{columns.map((column, index) => <th key={column} style={{ ...styles.th, padding: !isCurrentView ? "8px 8px" : styles.th.padding, fontSize: !isCurrentView ? ".62rem" : styles.th.fontSize, textTransform: !isCurrentView ? "uppercase" : "none", textAlign: index > 0 ? "right" : "left", position: "sticky", top: 0, zIndex: 2, whiteSpace: !isCurrentView ? "nowrap" : styles.th.whiteSpace }}>{column}</th>)}</tr></thead>
                                    <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} style={row[0] === "Total" ? { background: "#f8fafc" } : undefined}>{row.map((cell, cellIndex) => <td key={cellIndex} style={{ ...styles.td, padding: !isCurrentView ? "7px 8px" : styles.td.padding, fontSize: !isCurrentView ? ".64rem" : styles.td.fontSize, fontWeight: row[0] === "Total" ? 800 : 500, textAlign: cellIndex > 0 ? "right" : "left", whiteSpace: cellIndex === 0 && !isCurrentView ? "normal" : "nowrap", lineHeight: !isCurrentView ? 1.15 : styles.td.lineHeight }}>{cell}</td>)}</tr>)}</tbody>
                                </table> : <div style={{ padding: 30, textAlign: "center", color: COLORS.muted, fontSize: ".72rem" }}>No data available for this view.</div>
                            )}
                            {isPositionType && view === "Current" && (detail?.currentComposition) && (type === "assets" || type === "liabilities") && (
                                <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                                    <div style={{ fontSize: ".72rem", fontWeight: 800, color: COLORS.text, marginBottom: 6 }}>{type === "assets" ? "Current Assets" : "Current Liabilities"}</div>
                                    <div style={{ height: 250 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={(type === "assets" ? (detail.currentComposition.currentAssets || []) : (detail.currentComposition.currentLiabilities || [])).map((r) => ({
                                                    name: r.item,
                                                    value: r.amount === null || r.amount === undefined ? null : (positionUnit === "AED" ? Number(r.amount) * 1000000 : Number(r.amount)),
                                                }))}
                                                margin={{ top: 8, right: 12, left: 4, bottom: 48 }}
                                            >
                                                <CartesianGrid vertical={false} stroke="#eef2f7" />
                                                <XAxis dataKey="name" tick={<PositionBarXAxisTick />} axisLine={false} tickLine={false} interval={0} height={58} />
                                                <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                                <Tooltip content={<ChartTooltip />} />
                                                <Bar isAnimationActive={true} animationDuration={650} dataKey="value" name={`${type === "assets" ? "Current Assets" : "Current Liabilities"} (${positionUnit})`} fill={type === "assets" ? "#2563eb" : "#e11d48"} radius={[4, 4, 0, 0]} barSize={28} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", padding: "9px 18px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", flexShrink: 0 }}>
                            <button type="button" onClick={onClose} style={{ border: 0, borderRadius: 8, padding: "7px 18px", background: "#e2e8f0", color: "#475569", font: `700 .68rem ${font}`, cursor: "pointer" }}>Close</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function FinancialPosition() {
    const { isMobile, isSmall, isTablet, isMedium } = useResponsiveColumns();

    const defaultFilters = useMemo(() => ({
        legalGroups: [],
        legalEntities: [],
        parentDivisions: [],
        subDivisions: [],
        reportingCurrency: "AED",
        asOnDate: "",
    }), []);

    const [filterOptions, setFilterOptions] = useState({
        legalGroups: [],
        legalEntities: [],
        parentDivisions: [],
        subDivisions: [],
        reportingCurrencies: [],
        asOnDates: [],
        operationalAsOnDate: "",
    });
    const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false);
    const [filters, setFilters] = useState(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dashboard, setDashboard] = useState({
        kpis: [],
        composition: { totalCurrentAssets: null, totalCurrentLiabilities: null, currentAssets: [], currentLiabilities: [] },
        equity: null,
        investments: [],
        borrowings: [],
        investmentsMonthly: [],
        nwcTrend: [],
    });

    const [modal, setModal] = useState(null);
    const [modalFilters, setModalFilters] = useState(defaultFilters);
    const [modalAppliedFilters, setModalAppliedFilters] = useState(defaultFilters);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");
    const [modalData, setModalData] = useState({});
    const requestCache = useRef(new Map());

    const requestOnce = async (key, fn) => {
        if (requestCache.current.has(key)) return requestCache.current.get(key);
        const promise = fn().finally(() => requestCache.current.delete(key));
        requestCache.current.set(key, promise);
        return promise;
    };

    const appliedApiFilters = useMemo(() => buildApiFilters(appliedFilters), [appliedFilters]);

    useEffect(() => {
        let cancelled = false;

        const loadFilterOptions = async () => {
            try {
                const response = await getWorkingCapitalFilterOptions({ aging_basis: "DUE_DATE" });
                if (cancelled) return;

                const normalized = normalizeFinancialFilterOptions(response);
                const initialDate = normalized.operationalAsOnDate || normalized.asOnDates[0] || "";
                const initialCurrency = normalized.reportingCurrencies[0] || "AED";
                const initialFilters = {
                    ...defaultFilters,
                    reportingCurrency: initialCurrency,
                    asOnDate: initialDate,
                };

                setFilterOptions(normalized);
                setFilters(initialFilters);
                setAppliedFilters(initialFilters);
                setModalFilters(initialFilters);
                setModalAppliedFilters(initialFilters);
                setFilterOptionsLoaded(true);
            } catch (err) {
                if (cancelled) return;
                setFilterOptionsLoaded(true);
                setError(err?.response?.data?.message || err?.response?.data?.detail || err?.message || "Unable to load Financial Position filter options.");
            }
        };

        loadFilterOptions();
        return () => { cancelled = true; };
    }, [defaultFilters]);

    useEffect(() => {
        if (!filterOptionsLoaded) return;

        let cancelled = false;
        setLoading(true);
        setError("");

        const key = JSON.stringify(appliedApiFilters);

        /*
         * Each dashboard endpoint is intentionally loaded independently.
         *
         * In particular, these must load on the initial page render:         
         *   - Borrowing Position -> borrowings/by-parent-division
         *   - Fixed Assets trend -> investments/monthly-by-parent-division
         *   - NWC MoM -> investments/monthly-by-parent-division
         *
         * Do not let a slow/failed endpoint block the other charts.
         */
        const loadSection = (requestKey, requestFn, updateFn, sectionName) => {
            requestOnce(`${requestKey}:${key}`, requestFn)
                .then((response) => {
                    if (cancelled) return;
                    updateFn(response);
                })
                .catch((err) => {
                    if (cancelled) return;
                    console.error(`[Financial Position] ${sectionName} failed`, err);
                    setError((previous) => previous ||
                        err?.response?.data?.message ||
                        err?.response?.data?.detail ||
                        err?.message ||
                        `Unable to load ${sectionName}.`
                    );
                });
        };

        loadSection(
            "kpis",
            () => getFinancialPositionKpis(appliedApiFilters),
            (response) => setDashboard((previous) => ({ ...previous, kpis: normalizeKpis(response) })),
            "Financial Position KPIs"
        );

        loadSection(
            "composition",
            () => getFinancialPositionCurrentAssetsLiabilitiesComposition(appliedApiFilters),
            (response) => setDashboard((previous) => ({ ...previous, composition: normalizeComposition(response) })),
            "Current Assets / Liabilities composition"
        );

        loadSection(
            "equity",
            () => getFinancialPositionEquityContribution(appliedApiFilters),
            (response) => setDashboard((previous) => ({ ...previous, equity: normalizeEquity(response) })),
            "Equity Contribution"
        );

        loadSection(
            "investments",
            () => getFinancialPositionInvestmentsByParentDivision(appliedApiFilters),
            (response) => setDashboard((previous) => ({ ...previous, investments: normalizeInvestmentRows(response) })),
            "Investments by Parent Division"
        );

        // Borrowing Position: /api/financial-position/borrowings/by-parent-division
        loadSection(
            "borrowings",
            () => getFinancialPositionBorrowingsByParentDivision(appliedApiFilters),
            (response) => setDashboard((previous) => ({ ...previous, borrowings: normalizeBorrowingRows(response) })),
            "Borrowing Position"
        );

        // ONE monthly Investments endpoint feeds both dashboard trends:
        // Fixed Assets & Other Non-Current Assets and Month on Month NWC.
        // Month-on-Month NWC uses ONLY getFinancialPositionInvestmentsByParentDivision.
        // Fetch the latest 5 monthly snapshots using the same endpoint so the chart
        // gets real monthly values instead of relying on the current snapshot only.
        loadSection(
            "investmentsMonthly",
            () => fetchLatestFiveInvestmentSnapshots(appliedApiFilters),
            (rows) => setDashboard((previous) => ({
                ...previous,
                investmentsMonthly: normalizeInvestmentRows({ rows }),
            })),
            "Net Working Capital monthly trend"
        );

        // The dedicated Net Working Capital Trend endpoint is currently returning
        // 404, so do not call it until the backend endpoint is deployed.
        // Keep nwcTrend empty rather than generating/aggregating trend values in
        // the frontend.

        setLoading(false);

        return () => { cancelled = true; };
    }, [appliedApiFilters, filterOptionsLoaded]);

    const loadModalData = async (type, filtersForRequest) => {
        const apiFilters = buildApiFilters(filtersForRequest);
        const key = JSON.stringify(apiFilters);

        setModalLoading(true);
        setModalError("");

        try {
            if (type === "assets" || type === "liabilities") {
                const [compositionResponse, viewAllResponse] = await Promise.all([
                    requestOnce(`currentComposition:${key}`, () => getFinancialPositionCurrentAssetsLiabilitiesComposition(apiFilters)),
                    requestOnce(`currentViewAll:${key}`, () => getFinancialPositionCurrentAssetsLiabilitiesViewAll(apiFilters)),
                ]);
                setModalData((prev) => ({
                    ...prev,
                    currentComposition: normalizeCurrentPositionComposition(compositionResponse),
                    currentViewAll: toRows(viewAllResponse),
                }));
            } else if (type === "nwc") {
                // NWC by Parent Division comes from the Investments by Parent Division endpoint.
                const response = await requestOnce(`investmentsByParentDivision:${key}`, () => getFinancialPositionInvestmentsByParentDivision(apiFilters));
                setModalData((prev) => ({ ...prev, investments: normalizeInvestmentRows(response) }));
            } else if (type === "equity") {
                const viewAll = await getFinancialPositionEquityViewAll(apiFilters);
                setModalData((prev) => ({
                    ...prev,
                    equityViewAll: normalizeEquityViewAll(viewAll),
                }));
            } else if (type === "investments" || type === "fixedAssets") {
                const response = await requestOnce(`investmentsViewAll:${key}`, () => getFinancialPositionInvestmentsByParentDivision(apiFilters));
                setModalData((prev) => ({ ...prev, investments: normalizeInvestmentRows(response) }));
            } else if (type === "borrowing") {
                const response = await requestOnce(`borrowingsViewAll:${key}`, () => getFinancialPositionBorrowingsByParentDivision(apiFilters));
                setModalData((prev) => ({ ...prev, borrowings: normalizeBorrowingRows(response) }));
            }
        } catch (err) {
            setModalError(err?.response?.data?.message || err?.message || "Unable to load this detail view.");
        } finally {
            setModalLoading(false);
        }
    };

    const loadModalTab = async (view) => {
        if (!modal) return;
        const apiFilters = buildApiFilters(modalAppliedFilters);
        const key = JSON.stringify(apiFilters);

        try {
            if (modal === "assets" || modal === "liabilities") {
                // Month-on-Month uses the Current Assets/Liabilities View All API
                // for each month of the selected year. The composition API remains
                // exclusive to the Current tab.
                const year = Number(String(modalAppliedFilters?.asOnDate || "").slice(0, 4)) || new Date().getFullYear();
                const monthDates = Array.from({ length: 12 }, (_, index) => {
                    const month = String(index + 1).padStart(2, "0");
                    const lastDay = new Date(year, index + 1, 0).getDate();
                    return `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
                });

                const responses = await Promise.allSettled(
                    monthDates.map((date) => {
                        const monthFilters = { ...apiFilters, calendar_date: date };
                        return requestOnce(
                            `currentViewAll:${key}:${date}`,
                            () => getFinancialPositionCurrentAssetsLiabilitiesViewAll(monthFilters)
                        ).then((response) => ({
                            date,
                            rows: toRows(response),
                        }));
                    })
                );

                const monthlyRows = [];
                responses.forEach((result, index) => {
                    if (result.status !== "fulfilled") return;
                    const monthDate = result.value.date;
                    const rowsForMonth = result.value.rows || [];
                    rowsForMonth.forEach((row) => {
                        monthlyRows.push({
                            ...row,
                            period_month: monthDate.slice(5, 7),
                            period: monthDate,
                            __monthDate: monthDate,
                        });
                    });
                });

                setModalData((prev) => ({ ...prev, currentViewAll: monthlyRows }));
            } else if (modal === "nwc") {
                // NWC View All has ONLY Month-on-Month and uses ONLY
                // getFinancialPositionInvestmentsMonthlyByParentDivision for the
                // latest five monthly snapshots.
                const rows = await fetchLatestFiveInvestmentSnapshots(apiFilters);
                setModalData((prev) => ({ ...prev, investmentsMonthly: normalizeInvestmentRows({ rows }) }));
            } else if (modal === "investments" || modal === "fixedAssets") {
                const response = await requestOnce(`investmentsMonthly:${key}`, () => getFinancialPositionInvestmentsMonthlyByParentDivision(apiFilters));
                setModalData((prev) => ({ ...prev, investmentsMonthly: normalizeMonthly(response, "investment") }));
            } else if (modal === "equity") {
                const response = await getFinancialPositionEquityMonthlyByParentDivision(apiFilters);
                setModalData((prev) => ({
                    ...prev,
                    equityMonthly: normalizeEquityMonthly(response),
                }));
            } else if (modal === "borrowing") {
                const response = await requestOnce(`borrowingsMonthly:${key}`, () => getFinancialPositionBorrowingsMonthlyByParentDivision(apiFilters));
                setModalData((prev) => ({ ...prev, borrowingsMonthly: normalizeMonthly(response, "borrowing") }));
            }
        } catch (err) {
            setModalError(err?.response?.data?.message || err?.message || "Unable to load monthly data.");
        }
    };

    const updateFilter = (key, value) => setFilters((previous) => cascadeUpdateFilter(previous, key, value));
    const handleApply = () => setAppliedFilters({ ...filters });
    const initialLoadedFilters = () => ({
        ...defaultFilters,
        reportingCurrency: filterOptions.reportingCurrencies[0] || defaultFilters.reportingCurrency,
        asOnDate: filterOptions.operationalAsOnDate || filterOptions.asOnDates[0] || "",
    });

    const handleReset = () => {
        const reset = initialLoadedFilters();
        setFilters(reset);
        setAppliedFilters(reset);
    };

    const openTable = (type) => {
        const next = {
            ...appliedFilters,
            legalGroups: [...appliedFilters.legalGroups],
            legalEntities: [...appliedFilters.legalEntities],
            parentDivisions: [...appliedFilters.parentDivisions],
            subDivisions: [...appliedFilters.subDivisions],
        };
        setModalFilters(next);
        setModalAppliedFilters(next);
        setModalData({});
        setModalError("");
        setModal(type);
        loadModalData(type, next);
    };

    const applyModalFilters = () => {
        const next = {
            ...modalFilters,
            legalGroups: Array.isArray(modalFilters.legalGroups) ? [...modalFilters.legalGroups] : [],
            legalEntities: Array.isArray(modalFilters.legalEntities) ? [...modalFilters.legalEntities] : [],
            parentDivisions: Array.isArray(modalFilters.parentDivisions) ? [...modalFilters.parentDivisions] : [],
            subDivisions: Array.isArray(modalFilters.subDivisions) ? [...modalFilters.subDivisions] : [],
        };
        setModalAppliedFilters(next);
        if (modal) loadModalData(modal, next);
    };

    const resetModalFilters = () => {
        const reset = initialLoadedFilters();
        setModalFilters(reset);
        setModalAppliedFilters(reset);
        if (modal) loadModalData(modal, reset);
    };

    const exportRows = (title, columns, rows, format, filename) => {
        if (format === "excel") downloadExcelFile(title, columns, rows, filename);
        if (format === "pdf") printPdfFile(title, columns, rows);
    };

    const compositionAssets = dashboard.composition.currentAssets;
    const compositionLiabilities = dashboard.composition.currentLiabilities;
    // Main-page NWC chart: show only the top 5 Parent Divisions by absolute NWC.
    // Keep the backend value in rawValue so the tooltip can show the exact AED amount.
    const parentNwc = dashboard.investments
        .filter((r) => r.parentDivision && r.parentDivision !== "—" && r.nwc !== null && r.nwc !== undefined && Number.isFinite(Number(r.nwc)))
        .sort((a, b) => Math.abs(Number(b.nwc)) - Math.abs(Number(a.nwc)))
        .slice(0, 5)
        .map((r, index) => ({
            name: r.parentDivision,
            value: Number(r.nwc),
            rawValue: Number(r.nwc),
            fill: CHART_COLORS[index % CHART_COLORS.length],
        }));
    // Main Investments Analysis chart: show only the top 5 Parent Divisions by Total Investments.
    // Keep the existing API data and chart configuration unchanged.
    const investmentParent = dashboard.investments
        .filter((r) => r.parentDivision && r.parentDivision !== "—" && r.totalInvestments !== null && r.totalInvestments !== undefined && Number.isFinite(Number(r.totalInvestments)))
        .sort((a, b) => Number(b.totalInvestments) - Number(a.totalInvestments))
        .slice(0, 5)
        .map((r) => ({
            name: r.parentDivision,
            value: millions(r.totalInvestments),
        }));
    // Main Borrowing Position chart: show only the top 5 Parent Divisions by Total Borrowings.
    // Keep the existing API data and chart configuration unchanged.
    const borrowingParent = dashboard.borrowings
        .filter(
            (r) =>
                r.parentDivision &&
                r.parentDivision !== "—"
        )
        .map((r) => ({
            ...r,
            calculatedTotal:
                (r.longTerm ?? 0) +
                (r.shortTerm ?? 0) +
                (r.relatedParty ?? 0),
        }))
        .sort((a, b) => b.calculatedTotal - a.calculatedTotal)
        .slice(0, 5)
        .map((r) => ({
            name: r.parentDivision,
            longTerm: r.longTerm === null ? null : millions(r.longTerm),
            relatedParty: r.relatedParty === null ? null : millions(r.relatedParty),
            shortTerm: r.shortTerm === null ? null : millions(r.shortTerm),
        }));
    // Main Fixed Assets & Other Non-Current Assets chart: show only the top 5 Parent Divisions by Fixed Assets.
    // Keep the existing API data and chart configuration unchanged.
    const fixedAssetsTrend = dashboard.investments
        .filter(
            (r) =>
                r.parentDivision &&
                r.parentDivision !== "—" &&
                r.fixedAssets !== null &&
                r.fixedAssets !== undefined &&
                Number.isFinite(Number(r.fixedAssets))
        )
        .sort((a, b) => Number(b.fixedAssets) - Number(a.fixedAssets))
        .slice(0, 5)
        .map((r) => ({
            period: r.parentDivision,
            fixedAssets: millions(r.fixedAssets),
            provision: r.provision === null ? null : millions(r.provision),
        }));

    // Month-on-Month NWC uses ONLY getFinancialPositionInvestmentsByParentDivision.
    // Show the latest 5 months returned by that API and format numeric month values
    // (1/01 -> Jan, 2/02 -> Feb, etc.) on both the X-axis and tooltip label.
    const monthNameFromPeriod = (value) => {
        const text = String(value ?? "").trim();
        const match = text.match(/(?:^|[-\/\s])([0-9]{1,2})(?:$|[-\/\s])/);
        const monthNumber = match ? Number(match[1]) : Number(text);
        if (Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
            return MONTH_KEYS[monthNumber - 1].key;
        }
        const lower = text.toLowerCase();
        const named = MONTH_KEYS.find((m) => m.aliases.some((alias) => lower === alias || lower.startsWith(`${alias}-`) || lower.startsWith(`${alias} `) || lower.startsWith(`${alias}/`)));
        return named ? named.key : text;
    };

    const monthSortValue = (value) => {
        const text = String(value ?? "").trim();
        const monthMatch = text.match(/(?:^|[-\/\s])([0-9]{1,2})(?:$|[-\/\s])/);
        if (monthMatch) {
            const month = Number(monthMatch[1]);
            if (month >= 1 && month <= 12) return month;
        }
        const monthIndex = MONTH_KEYS.findIndex((m) => m.key.toLowerCase() === text.toLowerCase());
        return monthIndex >= 0 ? monthIndex + 1 : 0;
    };

    const monthlyNwcRows = dashboard.investmentsMonthly
        .filter((row) => row.nwc !== null && row.nwc !== undefined && row.parentDivision && row.parentDivision !== "—")
        .map((row) => {
            const periodKey = row.periodKey || row.period_code || row.period || row.periodMonth || "";
            const rawPeriod = row.periodMonth || row.periodCode || row.period;
            const monthLabel = monthNameFromPeriod(rawPeriod);
            const monthSort = monthSortValue(rawPeriod);
            const yearMatch = String(periodKey).match(/^(\\d{4})-(\\d{2})$/);

            return {
                periodKey: String(periodKey),
                period: monthLabel,
                monthLabel,
                monthSort,
                year: yearMatch ? Number(yearMatch[1]) : 0,
                parentDivision: row.parentDivision,
                nwc: millions(row.nwc),
            };
        });

    // Keep exactly the latest five monthly periods.
    const latestFivePeriodKeys = Array.from(new Set(
        monthlyNwcRows.map((row) => row.periodKey)
    ))
        .sort((a, b) => a.localeCompare(b))
        .slice(-5);

    const latestFiveMonthlyNwcRows = monthlyNwcRows.filter((row) => latestFivePeriodKeys.includes(row.periodKey));

    // Keep exactly five Parent Divisions for the chart. The five divisions are
    // selected from the latest available month by absolute NWC, then their
    // values are plotted across all five months.
    const latestNwcPeriodKey = latestFivePeriodKeys[latestFivePeriodKeys.length - 1];
    const monthlyNwcDivisions = Array.from(
        latestFiveMonthlyNwcRows
            .filter((row) => row.periodKey === latestNwcPeriodKey)
            .reduce((divisionMap, row) => {
                const current = divisionMap.get(row.parentDivision);
                const absValue = Math.abs(Number(row.nwc) || 0);
                if (!current || absValue > current.absValue) {
                    divisionMap.set(row.parentDivision, {
                        parentDivision: row.parentDivision,
                        absValue,
                    });
                }
                return divisionMap;
            }, new Map())
            .values()
    )
        .sort((a, b) => b.absValue - a.absValue)
        .slice(0, 5)
        .map((row) => row.parentDivision);

    const monthlyNwc = Array.from(
        latestFiveMonthlyNwcRows
            .filter((row) => monthlyNwcDivisions.includes(row.parentDivision))
            .reduce((periodMap, row) => {
                if (!periodMap.has(row.periodKey)) {
                    periodMap.set(row.periodKey, {
                        period: row.monthLabel,
                        originalPeriod: row.periodKey,
                        monthSort: row.monthSort,
                    });
                }
                periodMap.get(row.periodKey)[row.parentDivision] = row.nwc;
                return periodMap;
            }, new Map())
            .values()
    ).sort((a, b) => String(a.originalPeriod).localeCompare(String(b.originalPeriod)));

    // Net Working Capital Trend uses only the dedicated backend trend endpoint.
    // Do not calculate, aggregate, or derive the trend in the frontend.
    const nwcTrend = dashboard.nwcTrend
        .filter((row) => row.period && row.nwc !== null && row.nwc !== undefined)
        .map((row) => ({
            period: row.period,
            nwc: millions(row.nwc),
        }))
        .sort((a, b) => String(a.period).localeCompare(String(b.period), undefined, { numeric: true }));

    const equityData = equityRows(dashboard.equity || {
        shareCapital: null, additionalCapital: null, reservesAndSurplus: null, partnerCurrentAccount: null, currentYearProfit: null,
    });

    const dashboardExportRows = [
        ...dashboard.kpis.map((item) => [item.label, item.value === null ? "—" : item.ratio ? Number(item.value).toFixed(2) : `${formatM(item.value)} ${appliedFilters.reportingCurrency}`]),
        ["", ""],
        ["Current Assets", ""],
        ...compositionAssets.map((r) => [r.item, `${r.amount.toFixed(1)} ${appliedFilters.reportingCurrency} M`]),
        ["Total Current Assets", dashboard.composition.totalCurrentAssets === null ? "—" : `${formatM(dashboard.composition.totalCurrentAssets)} ${appliedFilters.reportingCurrency} M`],
        ["", ""],
        ["Current Liabilities", ""],
        ...compositionLiabilities.map((r) => [r.item, `${r.amount.toFixed(1)} ${appliedFilters.reportingCurrency} M`]),
        ["Total Current Liabilities", dashboard.composition.totalCurrentLiabilities === null ? "—" : `${formatM(dashboard.composition.totalCurrentLiabilities)} ${appliedFilters.reportingCurrency} M`],
    ];

    const exportDashboard = (format) => exportRows("Financial Position Overview", ["Financial Position Overview", "Value"], dashboardExportRows, format, "financial-position-overview.xls");

    const sectionRows = (type) => {
        if (type === "assets" || type === "liabilities") {
            const source = modalData.currentViewAll || [];
            const isAsset = type === "assets";
            const cols = ["Parent Division", `${isAsset ? "Total Current Assets" : "Total Current Liabilities"} (${modalAppliedFilters.reportingCurrency} M)`];
            const rows = source.map((r) => [
                r.parent_division_name ?? r.parent_division_code ?? "—",
                formatM(isAsset ? r.total_current_assets : r.total_current_liabilities),
            ]);
            return { title: isAsset ? "Current Assets — Detailed View" : "Current Liabilities — Detailed View", columns: cols, rows };
        }
        if (type === "equity") {
            const source = modalData.equityViewAll || [];
            return {
                title: "Equity Contribution — Detailed View",
                columns: ["Parent Division", "Share Capital", "Additional Capital", "Reserves & Surplus", "Partner Current Account", "Current Year Profit", "Equity Total"],
                rows: source.map((r) => [
                    r.parentDivision ?? "—",
                    r.shareCapital === null ? "—" : formatM(r.shareCapital),
                    r.additionalCapital === null ? "—" : formatM(r.additionalCapital),
                    r.reservesAndSurplus === null ? "—" : formatM(r.reservesAndSurplus),
                    r.partnerCurrentAccount === null ? "—" : formatM(r.partnerCurrentAccount),
                    r.currentYearProfit === null ? "—" : formatM(r.currentYearProfit),
                    r.equityTotal === null ? "—" : formatM(r.equityTotal),
                ]),
            };
        }
        if (type === "nwc" || type === "investments" || type === "fixedAssets") {
            const source = modalData.investments || [];
            if (type === "nwc") return { title: "Net Working Capital by Parent Division", columns: ["Parent Division", `NWC (${modalAppliedFilters.reportingCurrency} M)`], rows: source.map((r) => [r.parentDivision, r.nwc === null ? "—" : formatM(r.nwc)]) };
            if (type === "fixedAssets") return { title: "Fixed Assets & Other Non-Current Assets — Detailed View", columns: ["Parent Division", `Fixed Assets & Other NCA (${modalAppliedFilters.reportingCurrency} M)`, `Provision for Gratuity (${modalAppliedFilters.reportingCurrency} M)`, `NWC (${modalAppliedFilters.reportingCurrency} M)`, `Total Investments (${modalAppliedFilters.reportingCurrency} M)`], rows: source.map((r) => [r.parentDivision, formatM(r.fixedAssets), formatM(r.provision), formatM(r.nwc), formatM(r.totalInvestments)]) };
            return { title: "Investments Analysis — Detailed View", columns: ["Parent Division", `Fixed Assets & Other NCA (${modalAppliedFilters.reportingCurrency} M)`, `NWC (${modalAppliedFilters.reportingCurrency} M)`, `Provision for Gratuity (${modalAppliedFilters.reportingCurrency} M)`, `Total Investments (${modalAppliedFilters.reportingCurrency} M)`], rows: source.map((r) => [r.parentDivision, formatM(r.fixedAssets), formatM(r.nwc), formatM(r.provision), formatM(r.totalInvestments)]) };
        }
        if (type === "borrowing") {
            const source = modalData.borrowings || [];
            return { title: "Borrowing Position — Detailed View", columns: ["Parent Division", "Long-Term Bank", "Short-Term Bank", "Bank Borrowings Total", "Related Party Loan", "Total Borrowings"], rows: source.map((r) => [r.parentDivision, formatM(r.longTerm), formatM(r.shortTerm), formatM(r.bankTotal), r.relatedParty === null ? "—" : formatM(r.relatedParty), r.total === null ? "—" : formatM(r.total)]) };
        }
        return { title: "Financial Position", columns: [], rows: [] };
    };

    const exportSection = (type, format) => {
        const config = sectionRows(type);
        exportRows(config.title, config.columns, config.rows, format, `${type}-financial-position.xls`);
    };

    const modalTitle = {
        assets: "Current Assets — Detailed View",
        liabilities: "Current Liabilities — Detailed View",
        nwc: "Net Working Capital — Month-on-Month",
        equity: "Equity Contribution — Detailed View",
        investments: "Investments Analysis — Detailed View",
        borrowing: "Borrowing Position — Detailed View",
        fixedAssets: "Fixed Assets & Other Non-Current Assets — Detailed View",
    }[modal] || "";

    const gridFourColumns = isSmall ? "1fr" : isMobile || isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))";
    const logicItems = [
        ["Total Investments", "Total Investments is displayed from the Financial Position service."],
        ["NWC", "Net Working Capital is displayed from the Financial Position service."],
        ["Bank Borrowings", "Bank Borrowings Total is displayed without frontend substitution."],
        ["Related Party Loan", "A null service value is displayed as —."],
    ];

    return (
        <div className="financial-position-page fp-sales-page" style={styles.page}>
            <style>{`
                @keyframes financialPositionShimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes fpPageIn {
                    0% { opacity: 0; transform: translateY(4px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fpKpiIn {
                    0% { opacity: 0; transform: translateY(6px) scale(.985); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fpChartIn {
                    0% { opacity: 0; transform: translateY(7px) scale(.992); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fpPulseLive {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
                    50% { box-shadow: 0 0 0 3px rgba(22,163,74,.08); }
                }
                .financial-position-page {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                    color: #1e293b !important;
                    animation: fpPageIn .22s ease-out both;
                }
                .financial-position-page * {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                    box-sizing: border-box;
                }
                .financial-position-page .fp-page-header h1 {
                    color: #1e1b4b !important;
                    font-size: 1.45rem !important;
                    font-weight: 800 !important;
                    line-height: 1.2 !important;
                    letter-spacing: -.02em;
                }
                .financial-position-page .fp-page-header p {
                    color: #64748b !important;
                    font-size: .74rem !important;
                }
                .financial-position-page .fp-filter-shell {
                    background: #fff !important;
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 12px !important;
                    box-shadow: 0 2px 8px rgba(15,23,42,.035) !important;
                }
                .financial-position-page .fp-filter-shell select,
                .financial-position-page .fp-filter-shell input {
                    font-size: .70rem !important;
                    font-weight: 600 !important;
                    border-radius: 7px !important;
                }
                .financial-position-page .fp-filter-shell select:focus,
                .financial-position-page .fp-filter-shell input:focus {
                    border-color: #818cf8 !important;
                    box-shadow: 0 0 0 3px rgba(99,102,241,.10) !important;
                }
                .financial-position-page .fp-sales-card {
                    border-radius: 12px !important;
                    border-color: #e2e8f0 !important;
                    box-shadow: 0 2px 8px rgba(15,23,42,.035) !important;
                    transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;
                }
                .financial-position-page .fp-sales-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 22px rgba(15,23,42,.08) !important;
                    border-color: #d7dee8 !important;
                }
                .financial-position-page .fp-sales-kpis > div {
                    animation: fpKpiIn .28s ease-out both;
                }
                .financial-position-page .fp-sales-kpis > div:nth-child(2) { animation-delay: .02s; }
                .financial-position-page .fp-sales-kpis > div:nth-child(3) { animation-delay: .04s; }
                .financial-position-page .fp-sales-kpis > div:nth-child(4) { animation-delay: .06s; }
                .financial-position-page .fp-sales-kpis > div:nth-child(5) { animation-delay: .08s; }
                .financial-position-page .fp-sales-kpis > div:nth-child(6) { animation-delay: .10s; }
                .financial-position-page .fp-sales-chart {
                    transition: transform .18s ease, filter .18s ease;
                    animation: fpChartIn .35s ease-out both;
                }
                .financial-position-page .fp-sales-chart:hover {
                    transform: translateY(-1px);
                    filter: drop-shadow(0 6px 16px rgba(37,99,235,.07));
                }
                .financial-position-page .fp-live-chart {
                    animation: fpChartIn .35s ease-out both;
                }
                .financial-position-page .fp-live-chart .recharts-bar-rectangle,
                .financial-position-page .fp-live-chart .recharts-line-curve,
                .financial-position-page .fp-live-chart .recharts-dot {
                    transition: opacity .18s ease, filter .18s ease;
                }
                .financial-position-page table {
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                }
                .financial-position-page table thead th {
                    background: #f8fafc !important;
                    color: #1e3a8a !important;
                    font-weight: 700 !important;
                }
                .financial-position-page table tbody tr {
                    transition: background .14s ease;
                }
                .financial-position-page table tbody tr:hover {
                    background: #f8fafc !important;
                }
                .financial-position-page button {
                    transition: transform .16s ease, box-shadow .16s ease, background .16s ease, border-color .16s ease;
                }
                .financial-position-page button:hover:not(:disabled) {
                    transform: translateY(-1px);
                }
                .financial-position-page .fp-modern-tooltip {
                    pointer-events: none;
                }
                .fp-viewall-table {
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                }
                .fp-viewall-table thead th {
                    background: #f8fafc !important;
                    color: #1e3a8a !important;
                    border-bottom: 2px solid #e2e8f0 !important;
                    font-size: .68rem !important;
                    font-weight: 700 !important;
                }
                .fp-viewall-table tbody td {
                    font-size: .70rem !important;
                    color: #334155 !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                }
                .fp-viewall-table tbody tr:last-child td { border-bottom: 0 !important; }
                .fp-sales-modal-backdrop {
                    background: rgba(15,23,42,.46) !important;
                    backdrop-filter: blur(2px);
                }
                .fp-sales-modal {
                    border-radius: 14px !important;
                    box-shadow: 0 24px 70px rgba(15,23,42,.22) !important;
                }
                .fp-sales-modal .fp-modal-header {
                    background: linear-gradient(90deg,#f8fafc,#fff) !important;
                }
                .fp-sales-modal .fp-modal-filter {
                    background: #fff !important;
                }
                .fp-sales-modal .fp-modal-tabs {
                    background: #fff !important;
                }
                .fp-sales-modal .fp-modal-tabs button {
                    font-size: .64rem !important;
                    font-weight: 700 !important;
                    border-radius: 7px !important;
                }
                .fp-sales-modal .fp-modal-tabs button:hover {
                    filter: brightness(.98);
                }
                .fp-sales-modal .fp-modal-content {
                    scrollbar-width: thin;
                    scrollbar-color: #64748b #e2e8f0;
                }
                .fp-sales-modal .fp-modal-content::-webkit-scrollbar { width: 10px; height: 10px; }
                .fp-sales-modal .fp-modal-content::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 6px; }
                .fp-sales-modal .fp-modal-content::-webkit-scrollbar-thumb { background: #64748b; border-radius: 6px; border: 2px solid #e2e8f0; }
                .financial-position-page .fp-footer {
                    font-size: .65rem;
                    color: #64748b;
                    display: flex;
                    justify-content: space-between;
                    padding-top: 10px;
                    padding-bottom: 4px;
                    flex-wrap: wrap;
                    gap: 4px;
                }
                @media (max-width: 760px) {
                    .financial-position-page .fp-footer { flex-direction: column; }
                }
            `}</style>
            <div style={{ width: "100%", minWidth: 0 }}>
                <motion.header className="fp-page-header" style={{ ...styles.pageHeader, marginBottom: 10, flexDirection: isMobile ? "column" : "row" }} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={styles.heading}>
                        <h1 style={styles.title}><span style={{ fontSize: "1.3rem" }}>💸</span> Financial Position Overview</h1>
                        <p style={styles.subtitle}>
                            Key indicators of liquidity, working capital, assets, liabilities, financing position and equity contribution.
                            <br />
                            <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, display: "inline-block", marginTop: 4, fontWeight: 600 }}>
                                As On Date: {formatAsOnDate(appliedFilters.asOnDate)}
                            </span>
                            &nbsp;|&nbsp;
                            <span style={{ color: "#16a34a", fontWeight: 700 }}>Currency: {appliedFilters.reportingCurrency}</span>
                        </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
                        <button type="button" onClick={() => exportDashboard("excel")} style={headerBtn("#ecfdf5", "#15803d", "#bbf7d0")}>📊&nbsp; Excel</button>
                        <button type="button" onClick={() => exportDashboard("pdf")} style={headerBtn("#fef2f2", "#dc2626", "#fecaca")}>📄&nbsp; PDF</button>
                    </div>
                </motion.header>

                <motion.div className="fp-filter-shell" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
                    <FilterPanel state={filters} onChange={setFilters} onApply={handleApply} onReset={handleReset} filterOptions={filterOptions} />
                </motion.div>

                {error && <div style={{ ...styles.card, marginBottom: 10, borderColor: "#fecaca", color: "#b91c1c", background: "#fff7f7", fontSize: ".72rem", fontWeight: 600 }}>{error}</div>}

                <div className="fp-sales-kpis" style={{ ...styles.kpiGrid, gridTemplateColumns: isSmall ? "1fr" : isMobile ? "repeat(2, minmax(0,1fr))" : isMedium ? "repeat(3,minmax(0,1fr))" : "repeat(6,minmax(0,1fr))" }}>
                    {dashboard.kpis.map((item) => <KpiCard key={item.key} item={item} loading={loading} currency={appliedFilters.reportingCurrency} />)}
                    {!loading && dashboard.kpis.length === 0 && <div style={{ gridColumn: "1/-1", padding: 20, textAlign: "center", color: COLORS.muted, fontSize: ".72rem" }}>No KPI data available.</div>}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 9, marginBottom: 9 }}>
                    <TableCard title="Current Assets" subtitle={`As at ${formatAsOnDate(appliedFilters.asOnDate)}`} rows={compositionAssets} totalLabel="Total Current Assets" totalValue={millions(dashboard.composition.totalCurrentAssets)} onViewAll={() => openTable("assets")} onExportExcel={() => exportSection("assets", "excel")} onExportPdf={() => exportSection("assets", "pdf")} currency={appliedFilters.reportingCurrency} />
                    <TableCard title="Current Liabilities" subtitle={`As at ${formatAsOnDate(appliedFilters.asOnDate)}`} rows={compositionLiabilities} totalLabel="Total Current Liabilities" totalValue={millions(dashboard.composition.totalCurrentLiabilities)} onViewAll={() => openTable("liabilities")} onExportExcel={() => exportSection("liabilities", "excel")} onExportPdf={() => exportSection("liabilities", "pdf")} currency={appliedFilters.reportingCurrency} />

                    <motion.section className="fp-sales-card fp-live-chart" style={{ ...styles.card, display: "flex", flexDirection: "column", padding: "14px 16px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ boxShadow: shadowHover }}>
                        <CardHeader title="Net Working Capital by Parent Division" subtitle={`As at ${formatAsOnDate(appliedFilters.asOnDate)}`} onViewAll={() => openTable("nwc")} onExportExcel={() => exportSection("nwc", "excel")} onExportPdf={() => exportSection("nwc", "pdf")} />
                        <div className="fp-sales-chart" style={{ ...styles.chart, minHeight: 220 }}>
                            {loading ? <Skeleton height={220} /> : <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={parentNwc} layout="vertical" margin={{ top: 6, right: 36, left: 8, bottom: 6 }} barCategoryGap="22%">
                                    <CartesianGrid horizontal={false} stroke="#eef2f7" />
                                    <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={formatNwcAxisValue} />
                                    <YAxis type="category" dataKey="name" width={118} tick={<NwcBarYAxisTick />} axisLine={false} tickLine={false} interval={0} />
                                    <Tooltip
                                        cursor={{ fill: "rgba(99,102,241,.045)" }}
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload?.length) return null;
                                            const row = payload[0]?.payload;
                                            const rawValue = row?.rawValue;
                                            return (
                                                <div className="fp-modern-tooltip" style={{ minWidth: 200, padding: "10px 12px", border: "1px solid rgba(226,232,240,.96)", borderRadius: 11, background: "rgba(255,255,255,.96)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 14px 34px rgba(15,23,42,.15), 0 3px 10px rgba(15,23,42,.06)", fontFamily: font }}>
                                                    <div style={{ marginBottom: 6, color: COLORS.text, fontSize: ".66rem", fontWeight: 800, lineHeight: 1.3 }}>{label}</div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: COLORS.muted, fontSize: ".62rem", fontWeight: 600 }}>
                                                        <span>Net Working Capital</span>
                                                        <strong style={{ color: rawValue < 0 ? "#dc2626" : COLORS.text, fontWeight: 800 }}>{rawValue === null || rawValue === undefined ? "—" : `${Number(rawValue).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${appliedFilters.reportingCurrency}`}</strong>
                                                    </div>
                                                    <div style={{ marginTop: 3, textAlign: "right", color: COLORS.muted, fontSize: ".64rem" }}>
                                                        {rawValue === null || rawValue === undefined ? "—" : `${millions(rawValue).toFixed(2)} ${appliedFilters.reportingCurrency} M`}
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Bar isAnimationActive={true} animationDuration={650} dataKey="value" name={`Net Working Capital (${appliedFilters.reportingCurrency})`} radius={[0, 5, 5, 0]} barSize={18} background={{ fill: "#f1f5f9", radius: 5 }}>
                                        {parentNwc.map((entry, index) => <Cell key={`nwc-${index}`} fill={entry.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>}
                        </div>
                    </motion.section>

                    <motion.section className="fp-sales-card fp-live-chart" style={{ ...styles.card, display: "flex", flexDirection: "column", padding: "14px 16px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ boxShadow: shadowHover }}>
                        <CardHeader title="Equity Contribution" subtitle="Equity components" onViewAll={() => openTable("equity")} onExportExcel={() => exportSection("equity", "excel")} onExportPdf={() => exportSection("equity", "pdf")} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 142, justifyContent: "center" }}>
                            {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={20} width={`${70 - i * 8}%`} />) : equityData.map((row, index) => {
                                const max = Math.max(...equityData.map((entry) => entry.value === null ? 0 : entry.value), 0);
                                return <div style={styles.equityRow} key={row.name}><span style={styles.equityLabel}>{row.name}</span><div style={styles.equityTrack}><motion.div initial={{ width: 0 }} animate={{ width: max && row.value !== null ? `${(row.value / max) * 100}%` : "0%" }} transition={{ duration: .55, delay: index * .05 }} style={{ height: "100%", borderRadius: 99, background: CHART_COLORS[index % CHART_COLORS.length] }} /></div><strong style={{ color: "#334155", fontSize: ".68rem", fontWeight: 800, textAlign: "right" }}>{row.value === null ? "—" : row.value.toFixed(1)}</strong></div>;
                            })}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, marginTop: 3, borderTop: `1px solid ${COLORS.border}`, color: COLORS.subtle, fontSize: ".60rem", fontWeight: 600 }}><span>0</span><span>20</span><span>40</span><span>60</span></div>
                    </motion.section>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1.2fr .85fr", gap: 9, marginBottom: 9 }}>
                    <motion.section className="fp-sales-card fp-live-chart" style={{ ...styles.card, minWidth: 0, padding: "14px 16px" }} whileHover={{ boxShadow: shadowHover }}>
                        <CardHeader title="Month on Month Net Working Capital" subtitle="Monthly NWC series" onViewAll={() => openTable("nwc")} onExportExcel={() => exportSection("nwc", "excel")} onExportPdf={() => exportSection("nwc", "pdf")} />
                        <div className="fp-sales-chart" style={{ height: 200 }}>{loading ? <Skeleton height={200} /> : <ResponsiveContainer width="100%" height={200}><ComposedChart data={monthlyNwc} margin={{ top: 10, right: 4, left: -18, bottom: 2 }}><CartesianGrid vertical={false} stroke="#eef2f7" /><XAxis dataKey="period" tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} angle={-28} textAnchor="end" height={44} /><YAxis yAxisId="left" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "rgba(37,99,235,.045)" }} content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 9, color: "#64748b" }} />{monthlyNwcDivisions.map((division, index) => (
                            <Bar
                                isAnimationActive={true}
                                animationBegin={index * 70}
                                animationDuration={650}
                                key={division}
                                yAxisId="left"
                                dataKey={division}
                                name={division}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                radius={[3, 3, 0, 0]}
                                activeBar={{ stroke: "#173b8f", strokeWidth: 1.2, fillOpacity: 0.88 }}
                                barSize={monthlyNwcDivisions.length > 4 ? 10 : 17}
                            />
                        ))}</ComposedChart></ResponsiveContainer>}</div>
                    </motion.section>

                    <motion.section className="fp-sales-card" style={{ ...styles.card, minWidth: 0, padding: "14px 16px" }} whileHover={{ boxShadow: shadowHover }}>
                        <CardHeader title="Net Working Capital Trend" subtitle="Monthly NWC series" onViewAll={() => openTable("nwc")} onExportExcel={() => exportSection("nwc", "excel")} onExportPdf={() => exportSection("nwc", "pdf")} />
                        <div className="fp-sales-chart" style={{ height: 200 }}>{loading ? <Skeleton height={200} /> : <ResponsiveContainer width="100%" height={200}><LineChart data={nwcTrend} margin={{ top: 10, right: 4, left: -18, bottom: 2 }}><CartesianGrid vertical={false} stroke="#eef2f7" /><XAxis dataKey="period" tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} angle={-28} textAnchor="end" height={44} /><YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><Tooltip content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 9, color: "#64748b" }} /><Line isAnimationActive={true} animationDuration={700} activeDot={{ r: 4 }} type="monotone" dataKey="nwc" name={`Net Working Capital (${appliedFilters.reportingCurrency} M)`} stroke="#16a34a" strokeWidth={2.2} dot={{ r: 2.2 }} /></LineChart></ResponsiveContainer>}</div>
                    </motion.section>

                    <motion.section className="fp-sales-card" style={{ ...styles.card, minWidth: 0, padding: "14px 16px" }} whileHover={{ boxShadow: shadowHover }}>
                        <CardHeader title="Investment & Borrowing Logic" subtitle="Financial Position calculation notes" onViewAll={() => { }} onExportExcel={() => exportRows("Financial Position Rules", ["Rule", "Description"], logicItems, "excel", "financial-position-rules.xls")} onExportPdf={() => exportRows("Financial Position Rules", ["Rule", "Description"], logicItems, "pdf")} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{logicItems.map((item, index) => <div key={item[0]} style={styles.logicItem}><div style={{ width: 28, height: 28, borderRadius: "50%", background: CHART_COLORS[index % CHART_COLORS.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".72rem", fontWeight: 800 }}>{index + 1}</div><div style={{ minWidth: 0 }}><div style={styles.logicTitle}>{item[0]}</div><div style={styles.logicText}>{item[1]}</div></div></div>)}</div>
                    </motion.section>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,minmax(0,1fr))", gap: 9, marginBottom: 9 }}>
                    <motion.section className="fp-sales-card fp-live-chart" style={{ ...styles.card, minWidth: 0, padding: "14px 16px" }} whileHover={{ boxShadow: shadowHover }}>
                        <CardHeader title="Investments Analysis" subtitle="Total investment value by parent division" onViewAll={() => openTable("investments")} onExportExcel={() => exportSection("investments", "excel")} onExportPdf={() => exportSection("investments", "pdf")} />
                        <div className="fp-sales-chart" style={{ height: 200 }}>{loading ? <Skeleton height={200} /> : <ResponsiveContainer width="100%" height={200}><BarChart data={investmentParent} layout="vertical" margin={{ top: 6, right: 12, left: 18, bottom: 4 }}><CartesianGrid horizontal={false} stroke="#eef2f7" /><XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={68} tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "rgba(37,99,235,.045)" }} content={<ChartTooltip />} /><Bar isAnimationActive={true} animationDuration={700} dataKey="value" name={`Total Investments (${appliedFilters.reportingCurrency} M)`} fill="#2563eb" radius={[0, 4, 4, 0]} activeBar={{ stroke: "#173b8f", strokeWidth: 1.2, fillOpacity: 0.88 }} barSize={20} /></BarChart></ResponsiveContainer>}</div>
                    </motion.section>

                    <motion.section className="fp-sales-card fp-live-chart" style={{ ...styles.card, minWidth: 0, padding: "14px 16px" }} whileHover={{ boxShadow: shadowHover }}>
                        <CardHeader title="Borrowing Position" subtitle="Related Party Loan" onViewAll={() => openTable("borrowing")} onExportExcel={() => exportSection("borrowing", "excel")} onExportPdf={() => exportSection("borrowing", "pdf")} />
                        <div className="fp-sales-chart" style={{ height: 200 }}>{loading ? <Skeleton height={200} /> : <ResponsiveContainer width="100%" height={200}><BarChart data={borrowingParent} margin={{ top: 8, right: 4, left: -14, bottom: 42 }}><CartesianGrid vertical={false} stroke="#eef2f7" /><XAxis dataKey="name" tick={<BorrowingBarXAxisTick />} axisLine={false} tickLine={false} interval={0} height={58} /><YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "rgba(37,99,235,.045)" }} content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 9, color: "#64748b" }} /><Bar isAnimationActive={true} animationDuration={650} dataKey="longTerm" name="Long-Term Bank Loan" fill="#2563eb" radius={[3, 3, 0, 0]} activeBar={{ stroke: "#173b8f", strokeWidth: 1.1, fillOpacity: 0.88 }} barSize={10} /><Bar isAnimationActive={true} animationBegin={80} animationDuration={650} dataKey="relatedParty" name="Related Party Loan" fill="#7c3aed" radius={[3, 3, 0, 0]} activeBar={{ stroke: "#5b21b6", strokeWidth: 1.1, fillOpacity: 0.88 }} barSize={10} /><Bar isAnimationActive={true} animationBegin={160} animationDuration={650} dataKey="shortTerm" name="Short-Term Bank Borrowing" fill="#f59e0b" radius={[3, 3, 0, 0]} activeBar={{ stroke: "#b45309", strokeWidth: 1.1, fillOpacity: 0.88 }} barSize={10} /></BarChart></ResponsiveContainer>}</div>
                    </motion.section>

                    <motion.section className="fp-sales-card fp-live-chart" style={{ ...styles.card, minWidth: 0, padding: "14px 16px" }} whileHover={{ boxShadow: shadowHover }}>
                        <CardHeader title="Fixed Assets & Other Non-Current Assets" subtitle="By Parent Division" onViewAll={() => openTable("fixedAssets")} onExportExcel={() => exportSection("fixedAssets", "excel")} onExportPdf={() => exportSection("fixedAssets", "pdf")} />
                        <div className="fp-sales-chart" style={{ height: 200 }}>{loading ? <Skeleton height={200} /> : <ResponsiveContainer width="100%" height={200}><ComposedChart data={fixedAssetsTrend} margin={{ top: 8, right: 4, left: -16, bottom: 42 }}><CartesianGrid vertical={false} stroke="#eef2f7" /><XAxis dataKey="period" tick={<FixedAssetsBarXAxisTick />} axisLine={false} tickLine={false} interval={0} height={58} /><YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "rgba(37,99,235,.045)" }} content={<ChartTooltip />} /><Legend wrapperStyle={{ fontSize: 9, color: "#64748b" }} /><Bar isAnimationActive={true} animationDuration={700} dataKey="fixedAssets" name={`Fixed Assets & Other NCA (${appliedFilters.reportingCurrency} M)`} fill="#2563eb" radius={[3, 3, 0, 0]} activeBar={{ stroke: "#173b8f", strokeWidth: 1.2, fillOpacity: 0.88 }} barSize={15} /><Line isAnimationActive={true} animationBegin={180} animationDuration={800} activeDot={{ r: 5, strokeWidth: 2, stroke: "#5b21b6", fill: "#ffffff" }} type="monotone" dataKey="provision" name={`Provision for Gratuity (${appliedFilters.reportingCurrency} M)`} stroke="#7c3aed" strokeWidth={2.2} dot={{ r: 2.4, strokeWidth: 1.5 }} /></ComposedChart></ResponsiveContainer>}</div>
                    </motion.section>
                </div>
            </div>

            <div className="fp-footer">
                <span>
                    All values are in <strong>{appliedFilters.reportingCurrency}</strong>&nbsp;|&nbsp;
                    As On Date: {formatAsOnDate(appliedFilters.asOnDate)}&nbsp;|&nbsp;
                    <span style={{ color: "#16a34a", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block", animation: "fpPulseLive 1.8s ease-in-out infinite" }} />Live</span>
                </span>
                <span>☁️ Source: Oracle Fusion Cloud</span>
            </div>

            <Modal open={Boolean(modal)} title={modalTitle} type={modal} filters={modalFilters}
                detail={{ equity: modalData.equity, equityViewAll: modalData.equityViewAll, investments: modalData.investments, borrowings: modalData.borrowings, currentComposition: modalData.currentComposition, currentViewAll: modalData.currentViewAll }}
                monthly={{ investments: modalData.investmentsMonthly, equity: modalData.equityMonthly, borrowings: modalData.borrowingsMonthly }}
                loading={modalLoading} onClose={() => setModal(null)} onFiltersChange={setModalFilters} onApplyFilters={applyModalFilters} onResetFilters={resetModalFilters} onTabChange={loadModalTab} currency={modalFilters.reportingCurrency} filterOptions={filterOptions} />
        </div>
    );
}
